/**
 * ═════════════════════════════════════════════════════════════════════════════
 * CROSS-PROJECT DISPATCHER — COMUNICACIÓN AUTENTICADA INTER-PROYECTOS
 * ═════════════════════════════════════════════════════════════════════════════
 * Permite que:
 * 1. El receptor de Guadiana (mesa-chef-prod) entregue pagos de Grupos a gest-grupos-hotel.
 * 2. El receptor de Cumbria (gest-grupos-hotel) entregue pagos de MesaChef a mesa-chef-prod.
 * 3. Cualquier receptor actualice Gest-Spa de forma aislada sin contaminar Grupos.
 */

const { generateServiceAuthToken, verifyServiceAuthToken } = require('../core/redsys-crypto');
const { getSpaFirestore, getGruposFirestore, getMesaChefFirestore, assertCollectionProjectAffinity } = require('../core/firebase-clients');
const { applyMesaChefPayment } = require('../adapters/mesachef-adapter');
const { applyGruposPayment } = require('../adapters/grupos-adapter');
const { applySpaPayment } = require('../adapters/gestspa-adapter');

const INTERNAL_SERVICE_ENDPOINTS = {
  'gest-grupos-hotel': 'https://us-central1-gest-grupos-hotel.cloudfunctions.net/internalPaymentDispatch',
  'mesa-chef-prod': 'https://europe-west1-mesa-chef-prod.cloudfunctions.net/internalPaymentDispatch'
};

/**
 * Obtiene el secreto compartido para autenticación inter-servicios
 */
function getInterServiceSecret() {
  return process.env.INTER_SERVICE_AUTH_SECRET ||
    process.env.REDSYS_SECRET_KEY_CUMBRIA ||
    'InterServiceSecretKeyGuadianaCumbria2026';
}

/**
 * Despachador universal de cobros entre proyectos Firebase
 *
 * @param {object} params
 * @param {object} params.route - Ruta resuelta { app, modulo, targetProject }
 * @param {object} params.payload - Datos del cobro normalizados
 * @param {string} params.localProjectId - ID del proyecto donde corre la Cloud Function ('mesa-chef-prod' o 'gest-grupos-hotel')
 * @param {object} [params.localDb] - Base de datos local
 * @param {function} [params.customFetch] - Inyección para pruebas
 * @param {object} [params.logger] - Logger
 */
async function dispatchPaymentNotification({
  route,
  payload,
  localProjectId = '',
  localDb = null,
  customFetch = null,
  logger = console
}) {
  const targetProject = route.targetProject;
  const isLocal = (localProjectId && localProjectId === targetProject);

  logger.info(`[Cross Dispatcher] Despachando pedido ${payload.orderId} (Hotel: ${payload.hotel}, App: ${route.app}) -> Destino: ${targetProject} (¿Local?: ${isLocal})`);

  // ───────────────────────────────────────────────────────────────────────────
  // CASO A: DESTINO ES GEST-SPA (Cumbria Bienestar)
  // ───────────────────────────────────────────────────────────────────────────
  if (route.app === 'spa') {
    // Gest-Spa es siempre un Firestore dedicado independiente ('gest-spa')
    assertCollectionProjectAffinity('reservas_spa', 'gest-spa');
    const spaDb = getSpaFirestore({ mockDb: (isLocal ? localDb : null) });
    return await applySpaPayment({
      db: spaDb,
      notification: payload,
      logger
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CASO B: DESTINO ES MESACHEF (mesa-chef-prod)
  // ───────────────────────────────────────────────────────────────────────────
  if (route.app === 'mesachef') {
    if (isLocal) {
      // Ejecución local directa en mesa-chef-prod
      assertCollectionProjectAffinity('reservas_restaurante', 'mesa-chef-prod');
      return await applyMesaChefPayment({
        db: localDb,
        notification: payload,
        logger
      });
    }

    // Remoto: Cumbria (gest-grupos-hotel) -> MesaChef (mesa-chef-prod)
    const endpoint = INTERNAL_SERVICE_ENDPOINTS['mesa-chef-prod'];
    const secret = getInterServiceSecret();
    const token = generateServiceAuthToken(payload, secret);

    const fetchFn = customFetch || (typeof fetch !== 'undefined' ? fetch : null);
    if (fetchFn) {
      try {
        const resp = await fetchFn(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Service-Auth': token,
            'X-Source-Service': localProjectId || 'gest-grupos-hotel',
            'X-Target-App': 'mesachef'
          },
          body: JSON.stringify({
            crossServicePayload: payload,
            orderId: payload.orderId
          })
        });

        if (resp.ok) {
          logger.info(`[Cross Dispatcher] ✅ Pago entregado con éxito a MesaChef vía HTTPS.`);
          return { success: true, method: 'https_remote', status: resp.status };
        }
        logger.warn(`[Cross Dispatcher] MesaChef respondió con estado ${resp.status}`);
      } catch (err) {
        logger.error(`[Cross Dispatcher] Error HTTPS hacia MesaChef: ${err.message}`);
        throw err;
      }
    }

    // Fallback: Si no hay red o hay mock local de fallback
    const targetDb = getMesaChefFirestore({ mockDb: localDb });
    return await applyMesaChefPayment({ db: targetDb, notification: payload, logger });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CASO C: DESTINO ES GRUPOS (gest-grupos-hotel)
  // ───────────────────────────────────────────────────────────────────────────
  if (route.app === 'grupos') {
    if (isLocal) {
      // Ejecución local directa en gest-grupos-hotel
      assertCollectionProjectAffinity('groups', 'gest-grupos-hotel');
      return await applyGruposPayment({
        db: localDb,
        notification: payload,
        logger
      });
    }

    // Remoto: Guadiana (mesa-chef-prod) -> Grupos (gest-grupos-hotel)
    const endpoint = INTERNAL_SERVICE_ENDPOINTS['gest-grupos-hotel'];
    const secret = getInterServiceSecret();
    const token = generateServiceAuthToken(payload, secret);

    const fetchFn = customFetch || (typeof fetch !== 'undefined' ? fetch : null);
    if (fetchFn) {
      try {
        const resp = await fetchFn(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Service-Auth': token,
            'X-Source-Service': localProjectId || 'mesa-chef-prod',
            'X-Target-App': 'grupos'
          },
          body: JSON.stringify({
            crossServicePayload: payload,
            orderId: payload.orderId
          })
        });

        if (resp.ok) {
          logger.info(`[Cross Dispatcher] ✅ Anticipo de Guadiana entregado con éxito a Grupos vía HTTPS.`);
          return { success: true, method: 'https_remote', status: resp.status };
        }
        logger.warn(`[Cross Dispatcher] Grupos respondió con estado ${resp.status}`);
      } catch (err) {
        logger.error(`[Cross Dispatcher] Error HTTPS hacia Grupos: ${err.message}`);
        throw err;
      }
    }

    // Fallback directo a Firestore de Grupos
    const targetDb = getGruposFirestore({ mockDb: localDb });
    return await applyGruposPayment({ db: targetDb, notification: payload, logger });
  }

  throw new Error(`[Cross Dispatcher] Aplicación no soportada: ${route.app}`);
}

module.exports = {
  dispatchPaymentNotification,
  getInterServiceSecret,
  INTERNAL_SERVICE_ENDPOINTS
};
