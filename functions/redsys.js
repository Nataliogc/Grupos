/**
 * ═════════════════════════════════════════════════════════════════════════════
 * NEXUS GROUPS — MÓDULO OFICIAL REDSYS PAYGOLD REST
 * ═════════════════════════════════════════════════════════════════════════════
 * Manejo de cifrado, firma HMAC_SHA256_V1, generación de enlaces PayGold
 * y verificación de notificaciones asíncronas de cobro (webhooks).
 */

const crypto = require('crypto');

// Configuración de credenciales de comercios Redsys
const REDSYS_CONFIG = {
    cumbria: {
        name: "Cumbria Spa&Hotel",
        merchantCode: "168271567",
        terminal: "1",
        secretKey: "T4o7OH9D6UTSo9B9xr2iRaP6I+7s4U8D",
        apiKey: "PROD_MTY4MjcxNTY3XzAwMV9UNG83T0g5RDZVVFNoOUl5eHIyaVJhUDZJKzdzNFU4RA",
        env: "production"
    },
    guadiana: {
        name: "Sercotel Guadiana",
        merchantCode: "168355840",
        terminal: "1",
        secretKey: "", // Pendiente de activación por Eurocaja Rural
        apiKey: "",
        env: "production"
    }
};

const REDSYS_ENDPOINTS = {
    production: "https://sis.redsys.es/sis/rest/trataPeticionREST",
    test: "https://sis-t.redsys.es:25443/sis/rest/trataPeticionREST"
};

/**
 * Genera un número de pedido único válido para Redsys:
 * 12 caracteres: primeros 4 numéricos estrictos, resto alfanumérico.
 */
function generateOrderNumber() {
    // 4 dígitos numéricos obligatorios iniciales (ej. basados en milisegundos)
    const numPrefix = String(Math.floor(1000 + Math.random() * 9000));
    // 8 caracteres alfanuméricos únicos
    const alphaSuffix = Date.now().toString(36).slice(-4).toUpperCase() +
        Math.random().toString(36).substring(2, 6).toUpperCase();
    return (numPrefix + alphaSuffix).slice(0, 12);
}

/**
 * Cifra el número de pedido con 3DES (DES-EDE3-CBC) usando la clave base64 del comercio
 * y un IV de 8 ceros, con ZeroPadding.
 */
function encryptOrder3DES(orderId, secretKeyBase64) {
    const key = Buffer.from(secretKeyBase64, 'base64');
    const iv = Buffer.alloc(8, 0);
    const cipher = crypto.createCipheriv('des-ede3-cbc', key, iv);
    cipher.setAutoPadding(false);

    const orderBuffer = Buffer.from(orderId, 'utf8');
    const paddedLength = Math.ceil(orderBuffer.length / 8) * 8;
    const paddedOrderBuffer = Buffer.alloc(paddedLength, 0);
    orderBuffer.copy(paddedOrderBuffer);

    return Buffer.concat([cipher.update(paddedOrderBuffer), cipher.final()]);
}

/**
 * Genera el paquete firmado (Ds_SignatureVersion, Ds_MerchantParameters, Ds_Signature)
 */
function signPayload(merchantParams, secretKeyBase64) {
    const jsonStr = JSON.stringify(merchantParams);
    const merchantParametersB64 = Buffer.from(jsonStr, 'utf8').toString('base64');

    const orderId = merchantParams.DS_MERCHANT_ORDER || merchantParams.Ds_Merchant_Order;
    if (!orderId) {
        throw new Error('Falta DS_MERCHANT_ORDER para generar la clave de firma Redsys.');
    }

    const derivedKey = encryptOrder3DES(orderId, secretKeyBase64);
    const hmac = crypto.createHmac('sha256', derivedKey);
    hmac.update(merchantParametersB64, 'utf8');
    const signature = hmac.digest('base64');

    return {
        Ds_SignatureVersion: "HMAC_SHA256_V1",
        Ds_MerchantParameters: merchantParametersB64,
        Ds_Signature: signature
    };
}

/**
 * Valida la firma y decodifica la respuesta de Redsys
 */
function decodeAndVerifyResponse(responseBody, secretKeyBase64) {
    if (!responseBody || typeof responseBody !== 'object') {
        throw new Error('Respuesta inválida recibida de Redsys.');
    }

    if (responseBody.errorCode) {
        return {
            ok: false,
            errorCode: responseBody.errorCode,
            errorMsg: getErrorMessage(responseBody.errorCode)
        };
    }

    const merchantParamsB64 = responseBody.Ds_MerchantParameters || responseBody.DS_MERCHANTPARAMETERS;
    if (!merchantParamsB64) {
        throw new Error('Respuesta de Redsys sin parámetros comerciante.');
    }

    const jsonStr = Buffer.from(merchantParamsB64, 'base64').toString('utf8');
    let decoded;
    try {
        decoded = JSON.parse(jsonStr);
    } catch (e) {
        throw new Error('No se pudo parsear el JSON de Ds_MerchantParameters: ' + e.message);
    }

    // Verificar firma si está presente
    const receivedSig = responseBody.Ds_Signature || responseBody.DS_SIGNATURE;
    const orderId = decoded.Ds_Order || decoded.DS_MERCHANT_ORDER;
    let signatureValid = false;

    if (receivedSig && orderId && secretKeyBase64) {
        const derivedKey = encryptOrder3DES(orderId, secretKeyBase64);
        const hmac = crypto.createHmac('sha256', derivedKey);
        hmac.update(merchantParamsB64, 'utf8');
        const expectedSig = hmac.digest('base64');

        const norm = s => String(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        signatureValid = (receivedSig === expectedSig) || (norm(receivedSig) === norm(expectedSig));
    }

    return {
        ok: true,
        data: decoded,
        signatureValid
    };
}

/**
 * Tabla de descripción de errores frecuentes de Redsys / PayGold
 */
function getErrorMessage(code) {
    const map = {
        "SIS0042": "La firma enviada no es correcta (verificar clave SHA-256).",
        "SIS0019": "El importe de la transacción es inválido.",
        "SIS0020": "Número de pedido repetido o formato erróneo.",
        "SIS0054": "No existe la operación a la que se hace referencia.",
        "SIS0324": "Imposible enviar el SMS/email al titular.",
        "SIS0325": "El PayGold ya ha finalizado o no existe fase inicial.",
        "SIS0487": "El comercio-terminal no tiene habilitado el método de pago PayGold vía REST.",
        "SIS0430": "Error al decodificar Ds_MerchantParameters.",
        "SIS0431": "Error de sintaxis en el JSON de Ds_MerchantParameters.",
        "SIS0434": "Número de pedido inválido (DS_MERCHANT_ORDER).",
        "SIS0435": "Error en el cálculo de la firma (Ds_Signature)."
    };
    return map[code] || `Error Redsys ${code}`;
}

/**
 * Llama a la API REST de Redsys para crear una solicitud de PayGold
 * 
 * @param {Object} options
 * @param {string} options.hotel - 'cumbria' o 'guadiana'
 * @param {number|string} options.amountEuros - Importe en euros (ej. 150.50)
 * @param {string} [options.orderId] - Opcional. Si no se pasa, se genera automáticamente.
 * @param {string} [options.groupId] - ID de la reserva en Nexus Groups
 * @param {string} [options.concept] - Descripción / Asunto del cobro
 * @param {string} [options.customerEmail] - Opcional: para que Redsys mande email
 * @param {string} [options.customerMobile] - Opcional: para que Redsys mande SMS
 * @param {string} [options.customerName] - Nombre del cliente/agencia
 * @param {string} [options.notificationUrl] - Webhook de notificación online
 * @param {number} [options.expiryHours] - Horas de caducidad (por defecto 72h)
 */
async function createPayGoldRequest(options) {
    const hotelKey = (options.hotel || 'cumbria').toLowerCase().includes('guad') ? 'guadiana' : 'cumbria';
    const config = REDSYS_CONFIG[hotelKey];

    if (!config || !config.secretKey) {
        throw new Error(`El hotel "${hotelKey}" no tiene configurada la clave secreta de Redsys PayGold.`);
    }

    // Convertir euros a céntimos (ej. 150.50 -> 15050)
    const amountNum = parseFloat(options.amountEuros);
    if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('El importe a cobrar debe ser mayor que 0.');
    }
    const amountCents = Math.round(amountNum * 100).toString();

    const orderId = options.orderId || generateOrderNumber();
    const endpoint = REDSYS_ENDPOINTS[config.env] || REDSYS_ENDPOINTS.production;

    // Parámetros obligatorios de Redsys PayGold REST
    const merchantParams = {
        DS_MERCHANT_AMOUNT: amountCents,
        DS_MERCHANT_CURRENCY: "978", // EUR
        DS_MERCHANT_MERCHANTCODE: config.merchantCode,
        DS_MERCHANT_TERMINAL: config.terminal,
        DS_MERCHANT_ORDER: orderId,
        DS_MERCHANT_TRANSACTIONTYPE: "F" // F = PayGold
    };

    // Notificación online webhook
    if (options.notificationUrl) {
        merchantParams.DS_MERCHANT_MERCHANTURL = options.notificationUrl;
    }

    // Metadatos para correlación cuando el cliente pague
    const metaDataObj = {
        groupId: options.groupId || "",
        hotel: hotelKey,
        concept: options.concept || "",
        createdAt: new Date().toISOString()
    };
    merchantParams.DS_MERCHANT_MERCHANTDATA = JSON.stringify(metaDataObj).substring(0, 1024);

    // Canales opcionales de envío directo por Redsys
    if (options.customerMobile) {
        merchantParams.DS_MERCHANT_CUSTOMER_MOBILE = String(options.customerMobile).replace(/\D/g, '').slice(-9);
        merchantParams.DS_MERCHANT_CUSTOMER_SMS_TEXT = `Nexus Groups: Pago seguro de su reserva. Acceda al enlace para abonar: @URL@`;
    }

    if (options.customerEmail) {
        merchantParams.DS_MERCHANT_CUSTOMER_MAIL = String(options.customerEmail).trim();
    }

    // Fecha de caducidad si se especifica (por defecto 72 horas para grupos)
    const hours = options.expiryHours || 72;
    const expiryDate = new Date(Date.now() + hours * 3600 * 1000);
    // Formato requerido: aaaa-mm-dd-HH.MM.ss.sss (ej: 2026-11-12-16.30.00.000)
    const yyyy = expiryDate.getFullYear();
    const mm = String(expiryDate.getMonth() + 1).padStart(2, '0');
    const dd = String(expiryDate.getDate()).padStart(2, '0');
    const hh = String(expiryDate.getHours()).padStart(2, '0');
    const min = String(expiryDate.getMinutes()).padStart(2, '0');
    const sec = String(expiryDate.getSeconds()).padStart(2, '0');
    merchantParams.DS_MERCHANT_P2F_EXPIRYDATE = `${yyyy}-${mm}-${dd}-${hh}.${min}.${sec}.000`;

    // Generar la firma criptográfica
    const requestPayload = signPayload(merchantParams, config.secretKey);

    // Enviar solicitud POST a Redsys
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error de comunicación con Redsys HTTP ${response.status}: ${errorText}`);
    }

    const responseJson = await response.json();
    const verified = decodeAndVerifyResponse(responseJson, config.secretKey);

    if (!verified.ok) {
        return {
            success: false,
            errorCode: verified.errorCode,
            error: verified.errorMsg || `Error Redsys ${verified.errorCode}`,
            orderId
        };
    }

    const data = verified.data;
    // En PayGold inicial la respuesta típica es "9998" (operación creada con éxito)
    const isSuccess = data.Ds_Response === "9998" || data.Ds_Response === "0000";
    const paymentUrl = data.Ds_UrlPago2Fases || "";

    if (!isSuccess && !paymentUrl) {
        return {
            success: false,
            errorCode: data.Ds_Response,
            error: `Respuesta de Redsys no completada: Código ${data.Ds_Response}`,
            orderId,
            data
        };
    }

    return {
        success: true,
        paymentUrl,
        orderId,
        amountEuros: amountNum,
        hotel: hotelKey,
        expiresAt: expiryDate.toISOString(),
        raw: data
    };
}

module.exports = {
    REDSYS_CONFIG,
    REDSYS_ENDPOINTS,
    generateOrderNumber,
    encryptOrder3DES,
    signPayload,
    decodeAndVerifyResponse,
    getErrorMessage,
    createPayGoldRequest
};
