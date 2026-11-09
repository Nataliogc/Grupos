/**
 * ═════════════════════════════════════════════════════════════════════════════
 * GRUPOS ADAPTER — ACTUALIZACIÓN ATÓMICA DE GRUPOS Y PLANES DE PAGO
 * ═════════════════════════════════════════════════════════════════════════════
 * Colección afectada en proyecto `gest-grupos-hotel`:
 * - groups (Prefijo: GRP- o Localizador de reserva)
 */

const { calculatePaymentOutcome, PAYMENT_STATES } = require('../core/payment-calculator');
const { buildSearchCandidates } = require('../core/routing-engine');

/**
 * Aplica la confirmación bancaria a la reserva de Grupos
 */
async function applyGruposPayment({
  db,
  notification,
  logger = console
}) {
  const { orderId, referenceId, amountEuros, isAuthorized, authCode, hotelName, responseCode, bankDescription } = notification;

  const candidates = buildSearchCandidates(orderId, referenceId);
  const colRef = db.collection('groups');

  let targetDoc = null;
  for (const c of candidates) {
    const snap = await colRef.where('Reserva', '==', c).limit(1).get();
    if (!snap.empty) {
      targetDoc = snap.docs[0];
      break;
    }
  }

  if (!targetDoc) {
    logger.warn(`[Grupos Adapter] No se encontró grupo para referencia ${referenceId} u orden ${orderId}`);
    return { success: false, reason: 'Grupo no encontrado' };
  }

  const row = targetDoc.data();
  const currentPaid = parseFloat(row.Com_Pagado || 0);
  const totalAmount = parseFloat(row.Com_Total || row.Total || 0);

  const outcome = calculatePaymentOutcome({
    totalExigible: totalAmount,
    fianzaAcordada: 0,
    cobradoPrevio: currentPaid,
    importeNotificado: amountEuros,
    isAuthorized,
    paymentType: 'anticipo'
  });

  if (!isAuthorized) {
    await targetDoc.ref.update({
      PayGold_UltimoEstado: 'DENEGADO',
      PayGold_UltimoError: bankDescription,
      updatedAt: new Date().toISOString()
    });
    return { success: true, docId: targetDoc.id, outcome };
  }

  // Actualizar Plan de Pagos si existe
  let paymentPlan = [];
  try {
    paymentPlan = JSON.parse(row.PaymentPlan_JSON || '[]');
  } catch (_) {}

  let tramoMarked = false;
  for (const tramo of paymentPlan) {
    if (tramo.status !== 'Cobrado' && tramo.status !== 'Pagado') {
      const tramoAmt = parseFloat(tramo.amount || 0);
      if (Math.abs(tramoAmt - amountEuros) <= 1 || !tramoMarked) {
        tramo.status = 'Cobrado';
        tramo.paidDate = new Date().toISOString().split('T')[0];
        tramo.authCode = authCode;
        tramo.paymentMethod = 'TPV Redsys PayGold';
        tramoMarked = true;
        break;
      }
    }
  }

  // Actualizar Historial de Tracking
  let tracking = [];
  try {
    tracking = JSON.parse(row.tracking || '[]');
  } catch (_) {}

  const trackingEntry = {
    id: Date.now(),
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    text: `Cobro PayGold Redsys (${hotelName}): ${amountEuros.toFixed(2)}€ recibidos con éxito. Aut: ${authCode}, Pedido: ${orderId}`
  };
  tracking.push(trackingEntry);

  const updateData = {
    Com_Pagado: outcome.cobradoTotal,
    PayGold_UltimoEstado: outcome.isFullyPaid ? 'PAGADO' : 'COBRADO',
    PayGold_UltimaAutorizacion: authCode,
    PayGold_FechaCobro: new Date().toISOString(),
    tracking: JSON.stringify(tracking),
    updatedAt: new Date().toISOString()
  };

  if (paymentPlan.length > 0) {
    updateData.PaymentPlan_JSON = JSON.stringify(paymentPlan);
  }

  await targetDoc.ref.update(updateData);
  logger.info(`[Grupos Adapter] Grupo ${targetDoc.id} (${row.Reserva}) actualizado con éxito. Total pagado: ${outcome.cobradoTotal} €`);

  return {
    success: true,
    docId: targetDoc.id,
    outcome
  };
}

module.exports = {
  applyGruposPayment
};
