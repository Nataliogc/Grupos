/**
 * ═════════════════════════════════════════════════════════════════════════════
 * TRANSACTION STORE — REGISTRO CENTRAL, ESTADO DE ENTREGA Y COLA DE REINTENTOS
 * ═════════════════════════════════════════════════════════════════════════════
 * Estructura de auditoría unificada almacenada en `paygold_transactions`
 * Utiliza clave compuesta ${hotel}_${app}_${orderId} para evitar colisiones
 */

const { buildCompositeOperationId } = require('./routing-engine');

const DELIVERY_STATUS = {
  PENDING_DISPATCH: 'pending_dispatch',
  DELIVERED: 'delivered',
  RETRYING: 'retrying',
  FAILED: 'failed'
};

/**
 * Crea el esquema normalizado de una transacción en estado PENDIENTE al emitir un enlace
 */
function createPendingTransactionDoc({
  orderId,
  hotel,
  app,
  modulo,
  referenceId,
  amountEuros,
  paymentUrl,
  concept = '',
  customerMobile = '',
  customerEmail = '',
  customerName = '',
  expiresAt = null,
  fuc = ''
}) {
  const compositeId = buildCompositeOperationId(hotel, app, orderId);
  return {
    compositeId,
    orderId,
    hotel,
    app,
    modulo,
    referenceId,
    fuc,
    amountRequested: parseFloat(amountEuros) || 0,
    amountPaid: 0,
    currency: '978',
    paymentUrl,
    concept,
    customerMobile,
    customerEmail,
    customerName,
    expiresAt,
    bankStatus: 'PENDIENTE',
    deliveryStatus: DELIVERY_STATUS.PENDING_DISPATCH,
    attempts: 0,
    maxAttempts: 3,
    lastDeliveryError: null,
    authCode: null,
    cardBrand: null,
    cardLast4: null,
    createdAt: new Date().toISOString(),
    bankConfirmedAt: null,
    deliveredAt: null,
    retriesLog: []
  };
}

/**
 * Actualiza la transacción con los datos recibidos de la notificación bancaria Redsys
 */
function applyBankNotificationToDoc(existingDoc, {
  responseCode,
  authCode,
  amountPaidEuros,
  cardBrand,
  cardLast4,
  cardExpiry,
  isAuthorized,
  rawNotification = null
}) {
  const doc = { ...(existingDoc || {}) };

  doc.bankStatus = isAuthorized ? 'COBRADO' : 'DENEGADO';
  doc.responseCode = responseCode;
  doc.authCode = authCode || doc.authCode || '';
  doc.amountPaid = parseFloat(amountPaidEuros) || doc.amountRequested || 0;
  doc.cardBrand = cardBrand || doc.cardBrand || '';
  doc.cardLast4 = cardLast4 || doc.cardLast4 || '';
  doc.cardExpiry = cardExpiry || doc.cardExpiry || '';
  doc.bankConfirmedAt = new Date().toISOString();
  doc.rawNotification = rawNotification;

  // Si fue cobrado, se programa entrega inmediata al proyecto Firebase
  if (isAuthorized) {
    doc.deliveryStatus = DELIVERY_STATUS.PENDING_DISPATCH;
  }

  return doc;
}

/**
 * Registra el resultado del intento de entrega al proyecto Firebase de destino
 */
function applyDeliveryAttemptToDoc(existingDoc, { success, targetProject, targetDocId, error = null }) {
  const doc = { ...(existingDoc || {}) };
  doc.attempts = (doc.attempts || 0) + 1;
  doc.targetProject = targetProject || doc.targetProject || '';
  doc.targetDocId = targetDocId || doc.targetDocId || null;

  const logEntry = {
    attemptNumber: doc.attempts,
    timestamp: new Date().toISOString(),
    success,
    error: error ? String(error) : null
  };

  doc.retriesLog = [...(doc.retriesLog || []), logEntry];

  if (success) {
    doc.deliveryStatus = DELIVERY_STATUS.DELIVERED;
    doc.deliveredAt = new Date().toISOString();
    doc.lastDeliveryError = null;
  } else {
    doc.lastDeliveryError = error ? String(error) : 'Fallo de entrega desconocido';
    if (doc.attempts >= (doc.maxAttempts || 3)) {
      doc.deliveryStatus = DELIVERY_STATUS.FAILED;
    } else {
      doc.deliveryStatus = DELIVERY_STATUS.RETRYING;
      // Reintento exponencial: 1er reintento en 30s, 2º en 120s
      const delaySec = doc.attempts === 1 ? 30 : 120;
      doc.nextRetryAt = new Date(Date.now() + delaySec * 1000).toISOString();
    }
  }

  return doc;
}

/**
 * Comprueba si la transacción ya fue autorizada y procesada (Control de idempotencia)
 */
function isTransactionAlreadyHandled(existingDoc, authCode) {
  if (!existingDoc) return false;
  const isCobrado = existingDoc.bankStatus === 'COBRADO';
  if (!isCobrado) return false;

  // Si ya tiene código de autorización y coincide, ya está resuelta
  if (authCode && existingDoc.authCode && String(authCode).trim() === String(existingDoc.authCode).trim()) {
    return true;
  }
  return isCobrado;
}

/**
 * Localiza la transacción en Firestore garantizando 100% de retrocompatibilidad
 * con enlaces antiguos que usaban orderId como clave de documento.
 */
async function findTransactionDoc(db, compositeId, orderId) {
  if (!db) return null;
  const colRef = db.collection('paygold_transactions');

  // 1. Intento por clave compuesta moderna
  if (compositeId) {
    try {
      const snap = await colRef.doc(compositeId).get();
      if (snap.exists) return { doc: snap, id: compositeId, isComposite: true };
    } catch (_) {}
  }

  // 2. Intento por orderId directo (retrocompatibilidad con enlaces anteriores)
  if (orderId) {
    try {
      const snap = await colRef.doc(orderId).get();
      if (snap.exists) return { doc: snap, id: orderId, isComposite: false };
    } catch (_) {}

    // 3. Consulta por campo orderId
    try {
      const qSnap = await colRef.where('orderId', '==', orderId).limit(1).get();
      if (!qSnap.empty) {
        return { doc: qSnap.docs[0], id: qSnap.docs[0].id, isComposite: false };
      }
    } catch (_) {}
  }

  return null;
}

/**
 * Ejecuta una actualización transaccional atómica para evitar colisiones y doble registro
 * ante notificaciones bancarias simultáneas.
 */
async function executeIdempotentTransaction(db, docRef, authCode, applyUpdateFn) {
  if (!db || !db.runTransaction) {
    // Si no hay soporte de transacciones (ej. mock simple), ejecución directa
    const snap = await docRef.get();
    const existing = snap.exists ? snap.data() : null;
    if (isTransactionAlreadyHandled(existing, authCode)) {
      return { committed: false, alreadyHandled: true, data: existing };
    }
    const updated = applyUpdateFn(existing);
    await docRef.set(updated, { merge: true });
    return { committed: true, alreadyHandled: false, data: updated };
  }

  return await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(docRef);
    const existing = snap.exists ? snap.data() : null;

    if (isTransactionAlreadyHandled(existing, authCode)) {
      return { committed: false, alreadyHandled: true, data: existing };
    }

    const updated = applyUpdateFn(existing);
    transaction.set(docRef, updated, { merge: true });
    return { committed: true, alreadyHandled: false, data: updated };
  });
}

module.exports = {
  DELIVERY_STATUS,
  createPendingTransactionDoc,
  applyBankNotificationToDoc,
  applyDeliveryAttemptToDoc,
  isTransactionAlreadyHandled,
  findTransactionDoc,
  executeIdempotentTransaction
};
