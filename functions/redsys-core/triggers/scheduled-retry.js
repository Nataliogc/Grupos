/**
 * ═════════════════════════════════════════════════════════════════════════════
 * SCHEDULED RETRY TRIGGER — CONECTOR CON CLOUD SCHEDULER (GCP / FIREBASE)
 * ═════════════════════════════════════════════════════════════════════════════
 * Define y exporta la función periódica que ejecuta el barrido de reintentos
 * cada 5 minutos en el entorno productivo con soporte dual v1 (pubsub) y v2 (scheduler).
 */

const { executePendingRetries } = require('../core/retry-worker');
const { dispatchPaymentNotification } = require('../dispatchers/cross-project-dispatcher');

function createScheduledRetryFunction({ db, localProjectId, logger = console }) {
  let functions = null;
  try {
    functions = require('firebase-functions');
  } catch (_) {
    functions = null;
  }

  // 1. Intento con v2 scheduler si está disponible
  try {
    const { onSchedule } = require('firebase-functions/v2/scheduler');
    if (onSchedule) {
      return onSchedule(
        {
          schedule: 'every 5 minutes',
          timeZone: 'Europe/Madrid',
          region: localProjectId === 'mesa-chef-prod' ? 'europe-west1' : 'us-central1',
          memory: '256MiB',
          timeoutSeconds: 120,
          retryCount: 1
        },
        async (event) => {
          logger.info(`[Cloud Scheduler v2] Ejecutando barrido automático de reintentos...`);
          return await executePendingRetries({
            db,
            dispatcher: async ({ route, payload }) => {
              return await dispatchPaymentNotification({
                route,
                payload,
                localProjectId,
                localDb: db,
                logger
              });
            },
            logger
          });
        }
      );
    }
  } catch (_) {}

  // 2. Soporte oficial v1 (pubsub.schedule) estándar en Firebase Functions 4.x
  if (functions && functions.pubsub && typeof functions.pubsub.schedule === 'function') {
    return functions
      .region(localProjectId === 'mesa-chef-prod' ? 'europe-west1' : 'us-central1')
      .runWith({ memory: '256MB', timeoutSeconds: 120 })
      .pubsub.schedule('every 5 minutes')
      .timeZone('Europe/Madrid')
      .onRun(async (context) => {
        logger.info(`[Cloud Scheduler v1] Ejecutando barrido automático de reintentos...`);
        const result = await executePendingRetries({
          db,
          dispatcher: async ({ route, payload }) => {
            return await dispatchPaymentNotification({
              route,
              payload,
              localProjectId,
              localDb: db,
              logger
            });
          },
          logger
        });
        logger.info(`[Cloud Scheduler v1] Barrido finalizado:`, result);
        return result;
      });
  }

  // Fallback para ejecución manual en pruebas
  return async function manualRetryRunner() {
    return await executePendingRetries({
      db,
      dispatcher: async ({ route, payload }) => {
        return await dispatchPaymentNotification({
          route,
          payload,
          localProjectId,
          localDb: db,
          logger
        });
      },
      logger
    });
  };
}

module.exports = {
  createScheduledRetryFunction
};
