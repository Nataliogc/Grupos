const { findGroup, matchesHotel, groupFinances, cents, paid } = require('../../paygold-amount');
const { applyOnce } = require('../core/delivery-receipt');
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

  const candidates = buildSearchCandidates('', referenceId || orderId);

  let targetDoc = null;
  for (const c of candidates) {
    targetDoc = await findGroup(db, notification.hotel, c);
    if (targetDoc) break;
  }

  if (!targetDoc) {
    logger.warn(`[Grupos Adapter] No se encontró grupo para referencia ${referenceId} u orden ${orderId}`);
    return { success: false, reason: 'Grupo no encontrado' };
  }

  return applyOnce(db, targetDoc.ref, notification, (row, write) => {
    if (!matchesHotel(row.Hotel_Asignado, notification.hotel)) throw new Error('El grupo ha cambiado de hotel.');
    const {plan: paymentPlan, total, received} = groupFinances(row);

    const outcome = calculatePaymentOutcome({
      totalExigible: total / 100,
      fianzaAcordada: 0,
      cobradoPrevio: received / 100,
      importeNotificado: amountEuros,
      isAuthorized,
      paymentType: 'anticipo'
    });

    if (!isAuthorized) {
      write({
        PayGold_UltimoEstado: 'DENEGADO',
        PayGold_UltimoError: bankDescription,
        updatedAt: new Date().toISOString()
      });
      return { success: true, docId: targetDoc.id, outcome };
    }

    // Actualizar Plan de Pagos si existe
    for (const tramo of paymentPlan) {
      if (!paid(tramo)) {
        if (cents(tramo.amount) === cents(amountEuros)) {
          tramo.status = 'Cobrado';
          tramo.paidDate = new Date().toISOString().split('T')[0];
          tramo.authCode = authCode;
          tramo.paymentMethod = 'TPV Redsys PayGold';
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

    write(updateData);
    logger.info(`[Grupos Adapter] Grupo ${targetDoc.id} (${row.Reserva}) actualizado con éxito. Total pagado: ${outcome.cobradoTotal} €`);

    return {
      success: true,
      docId: targetDoc.id,
      outcome
    };
  });
}

module.exports = {
  applyGruposPayment
};
