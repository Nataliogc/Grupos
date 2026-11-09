/**
 * ═════════════════════════════════════════════════════════════════════════════
 * REDSYS CRYPTO — CIFRADO 3DES, HMAC SHA-256, ANTI-REPLAY Y ROTACIÓN DUAL-KEY
 * ═════════════════════════════════════════════════════════════════════════════
 * Implementa estrictamente el algoritmo oficial del SIS Redsys y autenticación
 * segura inter-servicios con protección anti-repetición y soporte para rotación
 * de claves bancarias sin pérdida de transacciones pendientes.
 */

const crypto = require('crypto');

/**
 * Decodifica los parámetros bancarios recibidos en base64
 */
function decodeMerchantParameters(merchantParametersB64) {
  if (!merchantParametersB64 || typeof merchantParametersB64 !== 'string') {
    throw new Error('Ds_MerchantParameters no puede estar vacío');
  }
  const cleanB64 = merchantParametersB64.trim().replace(/\s+/g, '');
  const jsonStr = Buffer.from(cleanB64, 'base64').toString('utf8');
  return JSON.parse(jsonStr);
}

/**
 * Codifica un objeto de parámetros en base64 para envío a Redsys
 */
function encodeMerchantParameters(paramsObj) {
  const jsonStr = JSON.stringify(paramsObj);
  return Buffer.from(jsonStr, 'utf8').toString('base64');
}

/**
 * Diversifica la clave secreta del comercio mediante 3DES (DES-EDE3-CBC)
 * utilizando el número de pedido como dato a cifrar y un IV de 8 bytes a cero.
 */
function encryptOrder3DES(orderId, secretKeyBase64) {
  if (!secretKeyBase64) {
    throw new Error('La clave secreta del comercio no puede estar vacía');
  }
  const key = Buffer.from(secretKeyBase64, 'base64');
  const iv = Buffer.alloc(8, 0);

  const orderBuffer = Buffer.from(String(orderId).trim(), 'utf8');
  const paddedLength = Math.ceil(orderBuffer.length / 8) * 8;
  const paddedOrderBuffer = Buffer.alloc(paddedLength, 0);
  orderBuffer.copy(paddedOrderBuffer);

  const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(paddedOrderBuffer), cipher.final()]);
}

/**
 * Calcula la firma HMAC SHA-256 oficial de Redsys
 */
function calculateSignature(merchantParametersB64, orderId, secretKeyBase64) {
  const derivedKey = encryptOrder3DES(orderId, secretKeyBase64);
  const hmac = crypto.createHmac('sha256', derivedKey);
  hmac.update(merchantParametersB64, 'utf8');
  return hmac.digest('base64');
}

/**
 * Comprueba de forma segura (constant-time) la firma digital recibida de Redsys
 */
function verifySignature(merchantParametersB64, receivedSignature, secretKeyBase64, orderId) {
  if (!secretKeyBase64) {
    return { verified: false, reason: 'Clave secreta no configurada para el comercio' };
  }

  try {
    const expectedSignature = calculateSignature(merchantParametersB64, orderId, secretKeyBase64);

    const expClean = expectedSignature.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const recClean = String(receivedSignature || '').trim().replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const expBuffer = Buffer.from(expClean, 'utf8');
    const recBuffer = Buffer.from(recClean, 'utf8');

    if (expBuffer.length !== recBuffer.length) {
      return {
        verified: false,
        reason: 'Longitud de firma no coincide'
      };
    }

    const matches = crypto.timingSafeEqual(expBuffer, recBuffer);
    return {
      verified: matches,
      reason: matches ? 'Firma válida' : 'Firma no coincide con el cálculo bancario'
    };
  } catch (err) {
    return { verified: false, reason: `Error criptográfico: ${err.message}` };
  }
}

/**
 * Soporte Dual-Key para rotación de secretos bancarios sin corte:
 * Valida la firma intentando primero la clave activa (primaria) y, si falla,
 * intenta con la clave anterior (gracia durante enlaces pendientes).
 */
function verifySignatureWithKeyFallbacks(merchantParametersB64, receivedSignature, keyCandidates, orderId) {
  const keys = Array.isArray(keyCandidates) ? keyCandidates.filter(Boolean) : [keyCandidates];
  if (keys.length === 0) {
    return { verified: false, reason: 'No se suministraron claves candidatas' };
  }

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const res = verifySignature(merchantParametersB64, receivedSignature, key, orderId);
    if (res.verified) {
      return { verified: true, matchedKeyIndex: i, isPreviousKey: (i > 0) };
    }
  }

  return { verified: false, reason: 'Ninguna de las claves de rotación coincide con la firma recibida' };
}

/**
 * Evalúa el código de respuesta numérico devuelto por Redsys
 */
function parseRedsysResponse(responseCode) {
  const code = parseInt(responseCode, 10);
  if (isNaN(code)) {
    return { success: false, code: responseCode, description: 'Código de respuesta inválido o ausente' };
  }

  if (code >= 0 && code <= 99) {
    return { success: true, code: responseCode, description: 'Transacción autorizada con éxito por la entidad bancaria' };
  }

  const errorMap = {
    101: 'Tarjeta caducada',
    102: 'Tarjeta en excepción transitoria o bajo sospecha de fraude',
    106: 'Intentos de PIN excedidos',
    129: 'Código de seguridad CVV2/CVC2 erróneo',
    180: 'Tarjeta no válida para este tipo de operación',
    184: 'Error en la autenticación del titular (3D Secure no superado)',
    190: 'Denegación del emisor sin motivo especificado',
    904: 'Comercio no registrado en FUC o terminal inactivo',
    909: 'Error de comunicación del sistema bancario',
    912: 'Emisor no disponible en este momento',
    913: 'Número de pedido duplicado en el mismo comercio',
    950: 'Operación de devolución no permitida',
    9915: 'Cancelado por el usuario o tiempo de sesión agotado'
  };

  return {
    success: false,
    code: responseCode,
    description: errorMap[code] || `Operación rechazada por la entidad (Código: ${responseCode})`
  };
}

/**
 * Mapeo oficial de códigos de marca de tarjeta Redsys
 */
function parseCardBrand(brandCode) {
  const map = {
    '1': 'VISA',
    '2': 'MASTERCARD',
    '6': 'DINERS',
    '7': 'AMEX',
    '8': 'JCB',
    '9': 'UNIONPAY'
  };
  return map[String(brandCode)] || 'TARJETA';
}

/**
 * Formatea caducidad de tarjeta AAMM -> MM/AA
 */
function formatExpiryDate(expiryRaw) {
  if (!expiryRaw || expiryRaw.length < 4) return '';
  const yy = expiryRaw.slice(0, 2);
  const mm = expiryRaw.slice(2, 4);
  return `${mm}/${yy}`;
}

// Memoria anti-replay para nonces procesados recientemente
const recentNonces = new Map();
const NONCE_RETENTION_MS = 15 * 60 * 1000; // 15 minutos

function purgeOldNonces() {
  const now = Date.now();
  for (const [nonce, ts] of recentNonces.entries()) {
    if (now - ts > NONCE_RETENTION_MS) recentNonces.delete(nonce);
  }
}

/**
 * Genera token de autenticación inter-servicios HMAC-SHA256 con protección ANTI-REPETICIÓN
 * Formato: t=<timestamp>,n=<nonce>,s=<signature>
 */
function generateServiceAuthToken(payloadObj, serviceSecret, options = {}) {
  if (!serviceSecret) throw new Error('Falta secreto de servicio para generar token.');
  const payloadStr = JSON.stringify(payloadObj);
  const timestamp = options.timestamp || Date.now();
  const nonce = options.nonce || crypto.randomBytes(8).toString('hex');

  const signature = crypto
    .createHmac('sha256', serviceSecret)
    .update(`${timestamp}:${nonce}:${payloadStr}`, 'utf8')
    .digest('hex');

  return `t=${timestamp},n=${nonce},s=${signature}`;
}

/**
 * Valida token de autenticación inter-servicios con ventana de tiempo (5 min) y control de NONCE
 */
function verifyServiceAuthToken(payloadObj, tokenHeader, serviceSecret, maxAgeMs = 300000) {
  if (!tokenHeader || !serviceSecret) return false;
  try {
    const parts = tokenHeader.split(',');
    const tPart = parts.find(p => p.startsWith('t='));
    const nPart = parts.find(p => p.startsWith('n='));
    const sPart = parts.find(p => p.startsWith('s='));
    if (!tPart || !sPart) return false;

    const timestamp = parseInt(tPart.replace('t=', ''), 10);
    const nonce = nPart ? nPart.replace('n=', '') : '';
    const receivedSig = sPart.replace('s=', '');

    // 1. Comprobación de ventana temporal (Anti-replay por timestamp)
    const now = Date.now();
    if (Math.abs(now - timestamp) > maxAgeMs) {
      return false;
    }

    // 2. Comprobación de Nonce (Anti-replay por unicidad)
    if (nonce) {
      purgeOldNonces();
      if (recentNonces.has(nonce)) {
        return false; // Repetición detectada
      }
    }

    // 3. Verificación de firma criptográfica
    const payloadStr = JSON.stringify(payloadObj);
    const dataToSign = nonce ? `${timestamp}:${nonce}:${payloadStr}` : `${timestamp}:${payloadStr}`;

    const expectedSig = crypto
      .createHmac('sha256', serviceSecret)
      .update(dataToSign, 'utf8')
      .digest('hex');

    const expBuf = Buffer.from(expectedSig, 'utf8');
    const recBuf = Buffer.from(receivedSig, 'utf8');
    if (expBuf.length !== recBuf.length) return false;

    const verified = crypto.timingSafeEqual(expBuf, recBuf);
    if (verified && nonce) {
      recentNonces.set(nonce, timestamp);
    }
    return verified;
  } catch (_) {
    return false;
  }
}

module.exports = {
  decodeMerchantParameters,
  encodeMerchantParameters,
  encryptOrder3DES,
  calculateSignature,
  verifySignature,
  verifySignatureWithKeyFallbacks,
  parseRedsysResponse,
  parseCardBrand,
  formatExpiryDate,
  generateServiceAuthToken,
  verifyServiceAuthToken
};
