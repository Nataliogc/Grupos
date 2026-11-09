/**
 * ═════════════════════════════════════════════════════════════════════════════
 * INTERNAL RECEIVER — RECEPTOR INTERNO ESPECÍFICO PARA MESACHEF Y GRUPOS
 * ═════════════════════════════════════════════════════════════════════════════
 * SEPARA LOS RECEPTORES BANCARIOS DE LOS INTERNOS:
 * - Receptores Bancarios Redsys:
 *     * Cumbria:  https://redsyswebhook-nls6pa6unq-uc.a.run.app  (gest-grupos-hotel)
 *     * Guadiana: https://europe-west1-mesa-chef-prod.cloudfunctions.net/redsysWebhook (mesa-chef-prod)
 *     (Solo aceptan tráfico directo firmado por Redsys con Ds_MerchantParameters)
 *
 * - Receptor Interno Específico:
 *     * Grupos:   https://us-central1-gest-grupos-hotel.cloudfunctions.net/internalPaymentDispatch
 *     * MesaChef: https://europe-west1-mesa-chef-prod.cloudfunctions.net/internalPaymentDispatch
 *     (Solo acepta tráfico autenticado inter-servicios con X-Service-Auth y anti-replay)
 */

const { verifyServiceAuthToken } = require('../core/redsys-crypto');
const { applyGruposPayment } = require('../adapters/grupos-adapter');
const { applyMesaChefPayment } = require('../adapters/mesachef-adapter');

const AUTHORIZED_SERVICES = ['mesa-chef-prod', 'gest-grupos-hotel'];

/**
 * Crea el manejador HTTP para el receptor interno de confirmaciones
 */
function createInternalReceiver({
  db,
  localProjectId,
  secretKey = process.env.INTER_SERVICE_AUTH_SECRET || 'InterServiceSecretKeyGuadianaCumbria2026',
  logger = console
}) {
  return async function handleInternalPaymentDispatch(req, res) {
    // 1. Validar método HTTP
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Método no permitido. Utilice POST.' });
      return;
    }

    const authHeader = req.headers['x-service-auth'] || req.headers['X-Service-Auth'];
    const sourceService = req.headers['x-source-service'] || req.headers['X-Source-Service'];
    const targetApp = req.headers['x-target-app'] || req.headers['X-Target-App'];

    // 2. Validar presencia de cabeceras de identidad
    if (!authHeader || !sourceService) {
      logger.warn('[Internal Receiver] Rechazada petición interna sin cabeceras de autenticación de servicio.');
      res.status(401).json({ error: 'Faltan credenciales de servicio (X-Service-Auth, X-Source-Service)' });
      return;
    }

    // 3. Validar que el origen es un servicio autorizado
    if (!AUTHORIZED_SERVICES.includes(sourceService)) {
      logger.error(`[Internal Receiver] Origen no autorizado: ${sourceService}`);
      res.status(403).json({ error: `Servicio emisor ${sourceService} no autorizado.` });
      return;
    }

    const body = req.body || {};
    const payload = body.crossServicePayload || body.payload || body;

    // 4. Verificación criptográfica HMAC-SHA256 y Anti-Replay (timestamp + nonce)
    const isValid = verifyServiceAuthToken(payload, authHeader, secretKey);
    if (!isValid) {
      logger.error('[Internal Receiver] Token de servicio inválido, expirado o ataque de repetición detectado.');
      res.status(403).json({ error: 'Token de servicio inválido o caducado (Anti-Replay Protection).' });
      return;
    }

    logger.info(`[Internal Receiver] Petición interna verificada de ${sourceService} hacia ${localProjectId} para pedido ${payload.orderId}`);

    try {
      let result;
      // 5. Aplicar cobro en la base de datos local según el proyecto receptor
      if (localProjectId === 'gest-grupos-hotel') {
        result = await applyGruposPayment({
          db,
          notification: payload,
          logger
        });
      } else if (localProjectId === 'mesa-chef-prod') {
        result = await applyMesaChefPayment({
          db,
          notification: payload,
          logger
        });
      } else {
        throw new Error(`Proyecto local desconocido: ${localProjectId}`);
      }

      res.status(200).json({
        success: true,
        processedAt: new Date().toISOString(),
        orderId: payload.orderId,
        result
      });
    } catch (err) {
      logger.error(`[Internal Receiver] Error aplicando pago interno para ${payload.orderId}:`, err);
      res.status(500).json({
        success: false,
        error: err.message || 'Error procesando cobro interno'
      });
    }
  };
}

module.exports = {
  createInternalReceiver,
  AUTHORIZED_SERVICES
};
