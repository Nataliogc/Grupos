/**
 * ═════════════════════════════════════════════════════════════════════════════
 * RETRY WORKER — COLA PERSISTENTE, CONTROL DE CONCURRENCIA Y RECUPERACIÓN
 * ═════════════════════════════════════════════════════════════════════════════
 * Garantiza:
 * 1. Control de concurrencia mediante bloqueo distribuido (Lease Lock) en Firestore.
 * 2. Recuperación automática de bloqueos huérfanos o fallidos (Stale Locks tras 5 min).
 * 3. Ejecución automática conectable a Cloud Scheduler (cron periódico) o Cloud Tasks.
 * 4. Idempotencia y registro contable inmutable.
 */

const { DELIVERY_STATUS, applyDeliveryAttemptToDoc } = require('./transaction-store');
const crypto = require('crypto');

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutos de validez de bloqueo

/**
 * Intenta adquirir un bloqueo atómico sobre un documento en estado de reintento
 */
async function acquireDocumentLock(db, docRef, workerId, now) {
  const nowIso = now.toISOString();
  const expiresAt = new Date(now.getTime() + LOCK_DURATION_MS).toISOString();

  if (!db.runTransaction) {
    // Modo mock/simulado sin transacciones de Firestore
    const snap = await docRef.get();
    const data = snap.data() || {};
    const lockExp = data.lockExpiresAt ? new Date(data.lockExpiresAt).getTime() : 0;
    
    // Si ya está bloqueado por otro y no ha expirado, no adquirir
    if (data.lockedBy && data.lockedBy !== workerId && lockExp > now.getTime()) {
      return { acquired: false, reason: 'locked_by_other' };
    }

    await docRef.set({
      lockedBy: workerId,
      lockedAt: nowIso,
      lockExpiresAt: expiresAt
    }, { merge: true });

    return { acquired: true, staleRecovered: (lockExp > 0 && lockExp <= now.getTime()) };
  }

  return await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(docRef);
    if (!snap.exists) return { acquired: false, reason: 'not_found' };

    const data = snap.data();
    const lockExp = data.lockExpiresAt ? new Date(data.lockExpiresAt).getTime() : 0;

    // Si está bloqueado por otro y aún no ha vencido, saltar
    if (data.lockedBy && data.lockedBy !== workerId && lockExp > now.getTime()) {
      return { acquired: false, reason: 'locked_by_other', holder: data.lockedBy };
    }

    const wasStale = Boolean(data.lockedBy && lockExp <= now.getTime());

    transaction.update(docRef, {
      lockedBy: workerId,
      lockedAt: nowIso,
      lockExpiresAt: expiresAt
    });

    return { acquired: true, staleRecovered: wasStale };
  });
}

/**
 * Libera el bloqueo de un documento
 */
async function releaseDocumentLock(db, docRef, workerId) {
  try {
    if (db.runTransaction) {
      await db.runTransaction(async (transaction) => {
        const snap = await transaction.get(docRef);
        if (snap.exists && snap.data()?.lockedBy === workerId) {
          transaction.update(docRef, {
            lockedBy: null,
            lockedAt: null,
            lockExpiresAt: null
          });
        }
      });
    } else {
      await docRef.set({
        lockedBy: null,
        lockedAt: null,
        lockExpiresAt: null
      }, { merge: true });
    }
  } catch (_) {}
}

/**
 * Ejecuta el barrido y entrega de transacciones pendientes en la cola de reintentos
 *
 * @param {object} params
 * @param {object} params.db - Instancia de Firestore
 * @param {function} params.dispatcher - Función que entrega la notificación al proyecto destino
 * @param {number} [params.maxBatchSize=20] - Límite de documentos procesados por barrido
 * @param {Date} [params.now=new Date()] - Marca temporal de referencia
 * @param {string} [params.workerId] - Identificador único de instancia del worker
 * @param {function} [params.onAlert] - Callback para alertar en caso de fallo definitivo (3 intentos)
 * @param {object} [params.logger] - Logger
 */
async function executePendingRetries({
  db,
  dispatcher,
  maxBatchSize = 20,
  now = new Date(),
  workerId = `worker_${crypto.randomBytes(4).toString('hex')}`,
  onAlert = null,
  logger = console
}) {
  if (!db || typeof db.collection !== 'function') {
    throw new Error('[Retry Worker] Se requiere una instancia válida de Firestore (db).');
  }

  const nowIso = now.toISOString();
  logger.info(`[Retry Worker] Iniciando ciclo de reintentos [Worker: ${workerId}] a las ${nowIso}`);

  const colRef = db.collection('paygold_transactions');

  // Consulta transacciones en estado 'retrying'
  let snapshot;
  try {
    snapshot = await colRef
      .where('deliveryStatus', '==', DELIVERY_STATUS.RETRYING)
      .limit(maxBatchSize)
      .get();
  } catch (err) {
    logger.error('[Retry Worker] Error consultando transacciones pendientes:', err);
    return { processed: 0, succeeded: 0, failed: 0, errors: [err.message] };
  }

  if (snapshot.empty) {
    logger.info('[Retry Worker] No hay transacciones pendientes de reintento.');
    return { processed: 0, succeeded: 0, failed: 0, errors: [] };
  }

  let processedCount = 0;
  let succeededCount = 0;
  let failedCount = 0;
  let skippedLockedCount = 0;
  let staleRecoveredCount = 0;
  const errors = [];

  for (const docSnap of snapshot.docs) {
    const tx = docSnap.data();
    const docRef = colRef.doc(docSnap.id);

    // 1. Comprobar ventana de espera (nextRetryAt <= now)
    if (tx.nextRetryAt && new Date(tx.nextRetryAt).getTime() > now.getTime()) {
      continue;
    }

    // 2. Control de Concurrencia: Adquirir bloqueo distribuido
    const lockResult = await acquireDocumentLock(db, docRef, workerId, now);
    if (!lockResult.acquired) {
      skippedLockedCount++;
      logger.info(`[Retry Worker] Omitiendo ${docSnap.id}: actualmente bloqueado por ${lockResult.holder || 'otro worker'}`);
      continue;
    }

    if (lockResult.staleRecovered) {
      staleRecoveredCount++;
      logger.warn(`[Retry Worker] Bloqueo huérfano recuperado para ${docSnap.id}`);
    }

    processedCount++;
    const currentAttempt = (tx.attempts || 0) + 1;
    logger.info(`[Retry Worker] Reintentando entrega para ${tx.compositeId || docSnap.id} (Intento ${currentAttempt}/${tx.maxAttempts || 3})`);

    let dispatchSuccess = false;
    let dispatchError = null;

    try {
      const result = await dispatcher({
        route: {
          app: tx.app,
          modulo: tx.modulo,
          targetProject: tx.targetProject || tx.app
        },
        payload: {
          compositeId: tx.compositeId,
          orderId: tx.orderId,
          hotel: tx.hotel,
          app: tx.app,
          modulo: tx.modulo,
          referenceId: tx.referenceId,
          amountEuros: tx.amountPaid || tx.amountRequested,
          authCode: tx.authCode,
          responseCode: tx.responseCode || '0000',
          isAuthorized: true
        }
      });

      dispatchSuccess = result && result.success !== false;
    } catch (err) {
      dispatchSuccess = false;
      dispatchError = err.message || String(err);
      errors.push({ id: docSnap.id, error: dispatchError });
    }

    // 3. Actualizar documento con el resultado del intento
    const updatedTx = applyDeliveryAttemptToDoc(tx, {
      success: dispatchSuccess,
      targetProject: tx.targetProject || tx.app,
      error: dispatchError
    });

    // Liberar bloqueo al actualizar
    updatedTx.lockedBy = null;
    updatedTx.lockedAt = null;
    updatedTx.lockExpiresAt = null;

    await docRef.set(updatedTx, { merge: true });

    if (dispatchSuccess) {
      succeededCount++;
      logger.info(`[Retry Worker] ✅ Notificación ${tx.compositeId} entregada con éxito en reintento.`);
    } else {
      failedCount++;
      logger.warn(`[Retry Worker] ❌ Reintento fallido para ${tx.compositeId}. Estado: ${updatedTx.deliveryStatus}`);

      // Si ha agotado todos los intentos (FAILED), registrar incidencia para Administración
      if (updatedTx.deliveryStatus === DELIVERY_STATUS.FAILED) {
        logger.error(`[ALERTA CRÍTICA] Notificación ${tx.compositeId} agotó 3 intentos. Registrando incidencia administrativa.`);
        
        try {
          const incidentId = `INC_${tx.compositeId || docSnap.id}`;
          const incidentDoc = {
            incidentId,
            compositeId: tx.compositeId || docSnap.id,
            orderId: tx.orderId,
            hotel: tx.hotel,
            app: tx.app,
            modulo: tx.modulo,
            referenceId: tx.referenceId,
            amountPaid: tx.amountPaid || tx.amountRequested || 0,
            authCode: tx.authCode,
            bankStatus: tx.bankStatus || 'COBRADO',
            errorReason: dispatchError,
            attempts: updatedTx.attempts,
            status: 'REQUIRES_MANUAL_RECONCILIATION',
            reconciled: false,
            createdAt: nowIso,
            targetProject: tx.targetProject || tx.app
          };
          await db.collection('paygold_incidents').doc(incidentId).set(incidentDoc, { merge: true });
        } catch (incErr) {
          logger.error('[Retry Worker] Error registrando en paygold_incidents:', incErr.message);
        }

        if (onAlert && typeof onAlert === 'function') {
          try {
            await onAlert({ transaction: updatedTx, error: dispatchError });
          } catch (_) {}
        }
      }
    }
  }

  logger.info(`[Retry Worker] Fin del ciclo: ${processedCount} procesados, ${succeededCount} entregados, ${failedCount} fallidos, ${skippedLockedCount} bloqueados, ${staleRecoveredCount} huérfanos recuperados.`);

  return {
    processed: processedCount,
    succeeded: succeededCount,
    failed: failedCount,
    skippedLocked: skippedLockedCount,
    staleRecovered: staleRecoveredCount,
    errors
  };
}

/**
 * Permite a Administración conciliar manualmente una incidencia sin duplicar cobros
 */
async function reconcileIncidentManually({ db, incidentId, adminUser = 'administracion', notes = '' }) {
  if (!db) throw new Error('Se requiere base de datos para conciliar');
  const incRef = db.collection('paygold_incidents').doc(incidentId);
  const snap = await incRef.get();
  if (!snap.exists) {
    throw new Error(`Incidencia ${incidentId} no encontrada`);
  }

  const incData = snap.data();
  if (incData.reconciled) {
    return { success: true, alreadyReconciled: true, message: 'La incidencia ya fue conciliada previamente' };
  }

  await incRef.update({
    reconciled: true,
    status: 'RESOLVED',
    reconciledBy: adminUser,
    reconciledAt: new Date().toISOString(),
    resolutionNotes: notes
  });

  return { success: true, alreadyReconciled: false, incidentId };
}

module.exports = {
  acquireDocumentLock,
  releaseDocumentLock,
  executePendingRetries,
  reconcileIncidentManually,
  LOCK_DURATION_MS
};
