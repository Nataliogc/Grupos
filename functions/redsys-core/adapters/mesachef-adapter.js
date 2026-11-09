/**
 * ═════════════════════════════════════════════════════════════════════════════
 * MESACHEF ADAPTER — ACTUALIZACIÓN ATÓMICA DE RESTAURANTE, SALONES Y EVENTOS
 * ═════════════════════════════════════════════════════════════════════════════
 * Colecciones afectadas en proyecto `mesa-chef-prod`:
 * - reservas_restaurante   (RES-)
 * - reservas_salones       (EVT-)
 * - participantes_eventos  (GE-)
 */

const { calculatePaymentOutcome, appendPaymentHistory, PAYMENT_STATES } = require('../core/payment-calculator');
const { buildSearchCandidates } = require('../core/routing-engine');

/**
 * Localiza el documento correspondiente en la colección de MesaChef
 */
async function findMesaChefDoc(db, collectionName, orderId, referenceId) {
  const colRef = db.collection(collectionName);
  const candidates = buildSearchCandidates(orderId, referenceId);

  // 1. Búsqueda por paygoldRef
  for (const c of candidates) {
    const snap = await colRef.where('paygoldRef', '==', c).limit(1).get();
    if (!snap.empty) return snap.docs[0];
  }

  // 2. Búsqueda por referencia o id_reserva
  for (const c of candidates) {
    let snap = await colRef.where('referencia', '==', c).limit(1).get();
    if (!snap.empty) return snap.docs[0];
    snap = await colRef.where('id', '==', c).limit(1).get();
    if (!snap.empty) return snap.docs[0];
  }

  // 3. Intento por ID directo de documento
  for (const c of candidates) {
    if (c.length >= 6) {
      try {
        const doc = await colRef.doc(c).get();
        if (doc.exists) return doc;
      } catch (_) {}
    }
  }

  return null;
}

/**
 * Aplica la confirmación bancaria a la reserva de MesaChef
 */
async function applyMesaChefPayment({
  db,
  notification,
  logger = console
}) {
  const { modulo, orderId, referenceId, amountEuros, isAuthorized, authCode, hotelName, hotel, fuc, cardBrand, cardLast4, cardExpiry, responseCode, bankDescription } = notification;

  let targetCollection = 'reservas_restaurante';
  if (modulo === 'salones' || referenceId.startsWith('EVT-')) {
    targetCollection = 'reservas_salones';
  } else if (modulo === 'grandes-eventos' || referenceId.startsWith('GE-')) {
    targetCollection = 'participantes_eventos';
  }

  const doc = await findMesaChefDoc(db, targetCollection, orderId, referenceId);

  if (!doc) {
    logger.warn(`[MesaChef Adapter] No se encontró documento en ${targetCollection} para orden ${orderId} / ref ${referenceId}`);
    return { success: false, reason: 'Documento no encontrado', targetCollection };
  }

  const docData = doc.data();
  const totalExigible = parseFloat(docData.total || docData.totalReserva || docData.precioTotal || docData.importe || 0);
  const fianzaAcordada = parseFloat(docData.fianzaAcordada || docData.senalAcordada || docData.campoPaygoldAmount || docData.fianza || docData.senal || 0);
  const cobradoPrevio = parseFloat(docData.fianzaPagada || docData.senalPagada || docData.totalPagado || 0);

  // Calcular el nuevo estado y saldos
  const outcome = calculatePaymentOutcome({
    totalExigible,
    fianzaAcordada,
    cobradoPrevio,
    importeNotificado: amountEuros,
    isAuthorized,
    paymentType: 'fianza'
  });

  const updatedHistory = appendPaymentHistory(docData.pagos || docData.historialPagos, {
    fecha: new Date().toISOString(),
    tipo: outcome.isFullyPaid ? 'liquidacion_total' : 'fianza',
    metodo: 'TPV Redsys PayGold',
    hotel: hotelName,
    fuc,
    orderId,
    autorizacion: authCode,
    importe: amountEuros,
    tarjeta: `${cardBrand} •••• ${cardLast4} (${cardExpiry})`,
    saldoRestante: outcome.saldoPendiente
  });

  const updatePayload = {
    paygoldStatus: outcome.status,
    paygoldLastResult: {
      code: responseCode,
      description: bankDescription,
      authCode,
      amount: amountEuros,
      order: orderId,
      hotel,
      updatedAt: new Date().toISOString()
    },
    pagos: updatedHistory,
    cardLast4: cardLast4 || docData.cardLast4 || '',
    cardBrand: cardBrand || docData.cardBrand || '',
    cardExpiry: cardExpiry || docData.cardExpiry || '',
    updatedAt: new Date().toISOString()
  };

  if (isAuthorized) {
    updatePayload.paygoldConfirmedAt = new Date().toISOString();

    if (targetCollection === 'reservas_restaurante') {
      updatePayload.fianzaPagada = outcome.cobradoTotal;
      // Solo cambiar estado operativo a confirmada si estaba en pendiente
      if (docData.estado === 'pendiente') {
        updatePayload.estado = 'confirmada';
      }
    } else if (targetCollection === 'reservas_salones') {
      updatePayload.senalPagada = outcome.cobradoTotal;
      if (docData.estado === 'presupuesto') {
        updatePayload.estado = 'confirmada';
      }
    } else if (targetCollection === 'participantes_eventos') {
      updatePayload.pagado = outcome.isFullyPaid;
      updatePayload.fianzaPagada = outcome.cobradoTotal;
    }
  } else {
    updatePayload.paygoldLastError = {
      code: responseCode,
      description: bankDescription,
      attemptedAt: new Date().toISOString()
    };
  }

  await doc.ref.update(updatePayload);
  logger.info(`[MesaChef Adapter] Reserva ${doc.id} en ${targetCollection} actualizada con éxito a estado: ${outcome.status}`);

  return {
    success: true,
    docId: doc.id,
    targetCollection,
    outcome
  };
}

module.exports = {
  findMesaChefDoc,
  applyMesaChefPayment
};
