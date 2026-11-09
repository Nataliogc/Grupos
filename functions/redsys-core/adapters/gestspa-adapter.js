/**
 * ═════════════════════════════════════════════════════════════════════════════
 * GEST-SPA ADAPTER — ACTUALIZACIÓN ATÓMICA DE RESERVAS Y CITAS DE SPA
 * ═════════════════════════════════════════════════════════════════════════════
 * Colecciones afectadas en proyecto `gest-spa`:
 * - reservas_spa
 * - reservas_suite, reservas_vip, reservas_cabina1, reservas_cabina2...
 * - bonos
 */

const { calculatePaymentOutcome, appendPaymentHistory } = require('../core/payment-calculator');
const { buildSearchCandidates } = require('../core/routing-engine');

const SPA_COLLECTIONS = [
  'reservas_spa',
  'reservas_suite',
  'reservas_vip',
  'reservas_cabina1',
  'reservas_cabina2',
  'reservas_cabina3',
  'reservas_panacea',
  'reservas_peluqueria',
  'bonos'
];

/**
 * Localiza la reserva de spa a través de las posibles colecciones
 */
async function findSpaDoc(db, orderId, referenceId) {
  const candidates = buildSearchCandidates(orderId, referenceId);

  for (const colName of SPA_COLLECTIONS) {
    const colRef = db.collection(colName);

    // 1. Por paygold_order o paygold_redsys_order
    for (const c of candidates) {
      let snap = await colRef.where('paygold_order', '==', c).limit(1).get();
      if (!snap.empty) return { doc: snap.docs[0], collection: colName };
      snap = await colRef.where('paygold_redsys_order', '==', c).limit(1).get();
      if (!snap.empty) return { doc: snap.docs[0], collection: colName };
    }

    // 2. Por ID directo de documento
    for (const c of candidates) {
      if (c.length >= 3) {
        try {
          const doc = await colRef.doc(c).get();
          if (doc.exists) return { doc, collection: colName };
        } catch (_) {}
      }
    }
  }

  return null;
}

/**
 * Aplica la confirmación bancaria a la reserva de Gest-Spa
 */
async function applySpaPayment({
  db,
  notification,
  logger = console
}) {
  const { orderId, referenceId, amountEuros, isAuthorized, authCode, hotelName, fuc, responseCode, bankDescription } = notification;

  const found = await findSpaDoc(db, orderId, referenceId);
  if (!found) {
    logger.warn(`[Gest-Spa Adapter] No se encontró reserva de Spa para orden ${orderId} / ref ${referenceId}`);
    return { success: false, reason: 'Reserva de Spa no encontrada' };
  }

  const { doc, collection } = found;
  const res = doc.data();

  const total = parseFloat(res.precio_total || res.precio || res['Importe(*)'] || 0);
  const existingPaid = (res.payment && typeof res.payment.paid === 'number')
    ? res.payment.paid
    : (parseFloat(res.paid_amount || res.pagado || 0) || 0);

  const outcome = calculatePaymentOutcome({
    totalExigible: total,
    fianzaAcordada: 0,
    cobradoPrevio: existingPaid,
    importeNotificado: amountEuros,
    isAuthorized,
    paymentType: 'fianza'
  });

  const existingHistory = (res.payment && Array.isArray(res.payment.history))
    ? res.payment.history
    : (Array.isArray(res.history) ? res.history : []);

  const updatedHistory = appendPaymentHistory(existingHistory, {
    fecha: new Date().toISOString(),
    tipo: outcome.isFullyPaid ? 'pago_completo' : 'garantia_fianza',
    metodo: 'TPV Redsys PayGold',
    hotel: hotelName,
    fuc,
    orderId,
    autorizacion: authCode,
    importe: amountEuros,
    tarjeta: `${notification.cardBrand || 'Tarjeta'} •••• ${notification.cardLast4 || ''}`,
    saldoRestante: outcome.saldoPendiente
  });

  const updatePayload = {
    payment: {
      paid: outcome.cobradoTotal,
      history: updatedHistory,
      status: outcome.isFullyPaid ? 'paid' : 'partial'
    },
    pagado: outcome.isFullyPaid,
    estado_pago: outcome.isFullyPaid ? 'pagado' : 'parcial',
    service_payment_status: outcome.isFullyPaid ? 'paid' : 'partial',
    paygold_status: isAuthorized ? (outcome.isFullyPaid ? 'PAGADO' : 'COBRADO') : 'DENEGADO',
    paygold_auth: authCode,
    paygold_paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (!isAuthorized) {
    updatePayload.paygold_last_error = {
      code: responseCode,
      description: bankDescription,
      attemptedAt: new Date().toISOString()
    };
  }

  await doc.ref.update(updatePayload);
  logger.info(`[Gest-Spa Adapter] Reserva ${doc.id} en ${collection} actualizada con éxito a estado: ${updatePayload.paygold_status} (Pagado: ${outcome.cobradoTotal} €)`);

  return {
    success: true,
    docId: doc.id,
    collection,
    outcome
  };
}

module.exports = {
  findSpaDoc,
  applySpaPayment
};
