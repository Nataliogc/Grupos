/**
 * ═════════════════════════════════════════════════════════════════════════════
 * WEBHOOK HANDLER — PROCESADOR CENTRAL DE NOTIFICACIONES BANCARIAS REDSYS
 * ═════════════════════════════════════════════════════════════════════════════
 * Utilizado de manera equivalente en:
 * - Cumbria:  https://redsyswebhook-nls6pa6unq-uc.a.run.app  (gest-grupos-hotel)
 * - Guadiana: https://europe-west1-mesa-chef-prod.cloudfunctions.net/redsysWebhook (mesa-chef-prod)
 */

const {
  decodeMerchantParameters,
  verifySignature,
  parseRedsysResponse,
  parseCardBrand,
  formatExpiryDate
} = require('./redsys-crypto');

const {
  HOTELS,
  identifyHotelByMerchantCode
} = require('./hotels-config');

const {
  resolveRoute,
  buildCompositeOperationId,
  buildSearchCandidates
} = require('./routing-engine');

const {
  calculatePaymentOutcome,
  appendPaymentHistory
} = require('./payment-calculator');

const {
  applyBankNotificationToDoc,
  isTransactionAlreadyHandled,
  findTransactionDoc,
  executeIdempotentTransaction
} = require('./transaction-store');

/**
 * Procesa la notificación HTTP POST recibida de Redsys
 */
async function processRedsysNotification({
  body,
  db = null,
  localProjectId = '',
  dispatcher = null,
  logger = console
}) {
  if (!body || typeof body !== 'object') {
    return { status: 400, message: 'Cuerpo de petición vacío o inválido' };
  }

  const merchantParamsRaw = body.Ds_MerchantParameters || body.DS_MERCHANTPARAMETERS;
  const receivedSignature = body.Ds_Signature || body.DS_SIGNATURE;

  if (!merchantParamsRaw || !receivedSignature) {
    logger.warn('[Redsys Webhook] Petición descartada: faltan parámetros o firma.');
    return { status: 400, message: 'Faltan Ds_MerchantParameters o Ds_Signature' };
  }

  // 1. Decodificar parámetros bancarios
  let params;
  try {
    params = decodeMerchantParameters(merchantParamsRaw);
  } catch (err) {
    logger.error('[Redsys Webhook] Error decodificando Ds_MerchantParameters:', err);
    return { status: 400, message: 'Error decodificando parámetros' };
  }

  const orderId = String(params.Ds_Order || params.DS_MERCHANT_ORDER || '').trim();
  const merchantCode = String(params.Ds_MerchantCode || params.DS_MERCHANT_MERCHANTCODE || '').trim();
  const responseCode = String(params.Ds_Response || params.DS_RESPONSE || '').trim();
  const authCode = String(params.Ds_AuthorisationCode || params.DS_AUTHORISATIONCODE || '').trim();
  const amountCents = parseInt(params.Ds_Amount || params.DS_MERCHANT_AMOUNT || '0', 10);
  const amountEuros = amountCents / 100;
  const cardRaw = String(params.Ds_Card_Number || '');
  const brandCode = String(params.Ds_Card_Brand || '');
  const expiryRaw = String(params.Ds_ExpiryDate || '');

  // 2. Identificar TPV y Comercio (Cumbria vs Guadiana)
  const hotelKey = identifyHotelByMerchantCode(merchantCode);
  if (!hotelKey) {
    logger.error(`[Redsys Webhook] FUC no reconocido: ${merchantCode}`);
    return { status: 400, message: `Comercio FUC ${merchantCode} no autorizado` };
  }

  const hotelConfig = HOTELS[hotelKey];
  const secretKey = hotelConfig.getSecretKey();

  if (!secretKey) {
    logger.error(`[Redsys Webhook] Clave secreta no configurada para el hotel ${hotelConfig.name}`);
    return { status: 500, message: `Clave secreta no disponible para ${hotelKey}` };
  }

  // 3. Validar Criptográficamente la Firma Redsys
  const sigResult = verifySignature(merchantParamsRaw, receivedSignature, secretKey, orderId);
  if (!sigResult.verified) {
    logger.error(`[Redsys Webhook] ERROR: Firma digital inválida para ${hotelConfig.name} (FUC: ${merchantCode}, Pedido: ${orderId}). Detalle:`, sigResult);
    return { status: 403, message: 'Firma digital no válida' };
  }

  // 4. Evaluar resultado bancario (0000 - 0099 = Autorizado)
  const bankEval = parseRedsysResponse(responseCode);
  const isAuthorized = bankEval.success;

  logger.info(`[Redsys Webhook] Transacción ${orderId} validada para ${hotelConfig.name}. Resultado: ${responseCode} (${bankEval.description})`);

  // 5. Extraer metadatos enviados previamente en DS_MERCHANT_MERCHANTDATA
  let metadata = null;
  const rawMeta = params.Ds_MerchantData || params.DS_MERCHANT_MERCHANTDATA;
  if (rawMeta) {
    try {
      metadata = JSON.parse(decodeURIComponent(rawMeta));
    } catch (_) {
      try { metadata = JSON.parse(rawMeta); } catch (__) {}
    }
  }

  // 6. Enrutamiento por prefijo, orden y metadatos
  const route = resolveRoute({
    orderId,
    referenceId: metadata?.referenceId || metadata?.groupId || '',
    metadata,
    fallbackApp: metadata?.app || null
  });

  const compositeId = buildCompositeOperationId(hotelKey, route.app, orderId);
  logger.info(`[Redsys Webhook] Enrutando a App: ${route.app}, Módulo: ${route.modulo}, ID Compuesto: ${compositeId}`);

  // 7. Idempotencia y almacenamiento en registro central con retrocompatibilidad
  let txResult = null;
  if (db) {
    try {
      // Búsqueda inteligente: clave compuesta moderna o pedido antiguo (100% retrocompatible)
      const found = await findTransactionDoc(db, compositeId, orderId);
      const targetDocId = found?.id || compositeId;
      const txRef = db.collection('paygold_transactions').doc(targetDocId);

      txResult = await executeIdempotentTransaction(db, txRef, authCode, (existing) => {
        return applyBankNotificationToDoc(existing || {
          compositeId,
          orderId,
          hotel: hotelKey,
          app: route.app,
          modulo: route.modulo,
          referenceId: route.referenceId,
          fuc: merchantCode
        }, {
          responseCode,
          authCode,
          amountPaidEuros: amountEuros,
          cardBrand: parseCardBrand(brandCode),
          cardLast4: cardRaw ? cardRaw.slice(-4) : '',
          cardExpiry: formatExpiryDate(expiryRaw),
          isAuthorized,
          rawNotification: params
        });
      });

      if (txResult.alreadyHandled) {
        logger.info(`[Redsys Webhook] Transacción ${targetDocId} ya fue procesada previamente. Retornando 200 OK (Idempotente).`);
        return { status: 200, message: 'OK', idempotent: true, compositeId: targetDocId };
      }
    } catch (dbErr) {
      logger.warn('[Redsys Webhook] Error registrando en paygold_transactions:', dbErr.message);
    }
  }

  // 8. Despacho o Aplicación Local en el Proyecto Firebase correspondiente
  const payloadForApp = {
    compositeId,
    orderId,
    hotel: hotelKey,
    hotelName: hotelConfig.name,
    fuc: merchantCode,
    app: route.app,
    modulo: route.modulo,
    referenceId: route.referenceId || orderId,
    amountEuros,
    responseCode,
    authCode,
    isAuthorized,
    bankDescription: bankEval.description,
    cardBrand: parseCardBrand(brandCode),
    cardLast4: cardRaw ? cardRaw.slice(-4) : '',
    cardExpiry: formatExpiryDate(expiryRaw),
    timestamp: new Date().toISOString()
  };

  if (dispatcher && typeof dispatcher === 'function') {
    try {
      await dispatcher({
        route,
        payload: payloadForApp,
        localProjectId
      });
    } catch (dispErr) {
      logger.error(`[Redsys Webhook] Fallo en el despachador para ${route.targetProject}:`, dispErr);
    }
  }

  return {
    status: 200,
    message: 'OK',
    authorized: isAuthorized,
    compositeId,
    route,
    hotel: hotelKey
  };
}

module.exports = {
  processRedsysNotification
};
