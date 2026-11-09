/**
 * ═════════════════════════════════════════════════════════════════════════════
 * NEXUS GROUPS — MÓDULO OFICIAL REDSYS PAYGOLD REST
 * ═════════════════════════════════════════════════════════════════════════════
 * Manejo de cifrado, firma HMAC_SHA256_V1, generación de enlaces PayGold
 * y verificación de notificaciones asíncronas de cobro (webhooks) multi-aplicación.
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
 * Genera el número de pedido basado en el localizador/identificador:
 * Redsys exige entre 4 y 12 caracteres, donde los 4 primeros deben ser dígitos numéricos.
 * - Para Grupos: añade "GRUPO" (ej. "77593" -> "77593GRUPO" o "123" -> "0123GRUPO")
 * - Para MesaChef: añade "EVENTO" si no está presente (ej. "0000EVENTO20")
 * - Para Spa: añade "CIRCUITO" si no está presente (ej. "0000CIRCUITO")
 */
function formatOrderNumberFromReservation(reservaId, suffix = '', app = 'grupos') {
    if (!reservaId) return generateOrderNumber();
    const clean = String(reservaId).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    // Extraer dígitos iniciales
    const matchDigits = clean.match(/^\d+/);
    let digits = matchDigits ? matchDigits[0] : "";
    let rest = clean.substring(digits.length);

    // Si tiene menos de 4 dígitos iniciales, rellenar con ceros para cumplir norma Redsys
    if (digits.length < 4) {
        digits = digits.padStart(4, '0');
    }

    const appTag = String(app || 'grupos').toLowerCase();
    let tag = '';
    if (appTag.includes('grupo')) {
        if (!rest.includes('GRUPO') && !digits.includes('GRUPO')) {
            tag = 'GRUPO';
        }
    } else if (appTag.includes('mesa') || appTag.includes('evento')) {
        if (!rest.includes('EVENTO') && !rest.includes('MESA')) {
            tag = 'EVENTO';
        }
    } else if (appTag.includes('spa') || appTag.includes('circuito')) {
        if (!rest.includes('CIRCUITO') && !rest.includes('SPA')) {
            tag = 'CIRCUITO';
        }
    }

    const suf = String(suffix || '').toUpperCase();

    // Redsys permite máx 12 caracteres:
    // Los primeros 4 caracteres DEBEN ser dígitos estrictamente numéricos.
    let combined = digits + rest + tag + suf;
    if (combined.length > 12) {
        const maxTail = 12 - digits.length;
        if (maxTail > 0) {
            combined = digits + (rest + tag + suf).slice(0, maxTail);
        } else {
            combined = digits.slice(0, 12);
        }
    }
    return combined;
}

/**
 * Genera un número de pedido aleatorio único de reserva en caso de no disponer de ID
 */
function generateOrderNumber() {
    const numPrefix = String(Math.floor(1000 + Math.random() * 9000));
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
 * Sanitiza textos destinados a Redsys (DS_MERCHANT_MERCHANTDATA y conceptos):
 * Redsys falla con SIS0431 si encuentra el símbolo '%' sin codificar o caracteres de control.
 */
function sanitizeRedsysText(text) {
    if (!text) return "";
    return String(text)
        .replace(/%/g, ' pct') // Reemplaza % para evitar error SIS0431 en el parser de Redsys
        .replace(/[\r\n\t]/g, ' ')
        .replace(/[<>"'\\]/g, '') // Elimina caracteres conflictivos de JSON
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Tabla de descripción de errores frecuentes de Redsys / PayGold
 */
function getErrorMessage(code) {
    const map = {
        "SIS0042": "La firma enviada no es correcta (verificar clave SHA-256).",
        "SIS0019": "El importe de la transacción es inválido.",
        "SIS0020": "Número de pedido repetido en Redsys.",
        "SIS0051": "Número de pedido repetido en Redsys.",
        "SIS0054": "No existe la operación a la que se hace referencia.",
        "SIS0324": "Imposible enviar el SMS/email al titular.",
        "SIS0325": "El PayGold ya ha finalizado o no existe fase inicial.",
        "SIS0487": "El comercio-terminal no tiene habilitado el método de pago PayGold vía REST.",
        "SIS0430": "Error al decodificar Ds_MerchantParameters.",
        "SIS0431": "Error de sintaxis en el JSON de Ds_MerchantParameters.",
        "SIS0434": "Número de pedido inválido (DS_MERCHANT_ORDER). Debe empezar por 4 números.",
        "SIS0435": "Error en el cálculo de la firma (Ds_Signature)."
    };
    return map[code] || `Error Redsys ${code}`;
}

/**
 * Llama a la API REST de Redsys para crear una solicitud de PayGold
 * 
 * @param {Object} options
 * @param {string} [options.app] - 'grupos', 'mesachef', 'spa'
 * @param {string} options.hotel - 'cumbria' o 'guadiana'
 * @param {number|string} options.amountEuros - Importe en euros (ej. 150.50)
 * @param {string} [options.orderId] - Código de pedido explícito (o localizador de reserva)
 * @param {string} [options.groupId] - Localizador de la reserva o servicio
 * @param {string} [options.referenceId] - Identificador único de la reserva/evento/cita
 * @param {string} [options.orderSuffix] - Sufijo opcional si ya se generó antes (ej. A, B)
 * @param {string} [options.concept] - Descripción / Asunto del cobro
 * @param {string} [options.customerEmail] - Opcional: para que Redsys mande email
 * @param {string} [options.customerMobile] - Opcional: para que Redsys mande SMS
 * @param {string} [options.customerName] - Nombre del cliente/agencia
 * @param {string} [options.notificationUrl] - Webhook de notificación online
 * @param {string|Date} [options.expiryDate] - Fecha límite de caducidad del enlace (YYYY-MM-DD o timestamp)
 * @param {number} [options.expiryHours] - Horas de caducidad si no se pasa expiryDate (por defecto 72h)
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

    // El código de pedido es el LOCALIZADOR o IDENTIFICADOR formateado según la aplicación
    let orderId = options.orderId;
    if (!orderId) {
        const baseRef = options.referenceId || options.groupId || options.reservaId;
        orderId = formatOrderNumberFromReservation(baseRef, options.orderSuffix || "", options.app || "grupos");
    } else {
        orderId = formatOrderNumberFromReservation(orderId, options.orderSuffix || "", options.app || "grupos");
    }

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

    // Metadatos para correlación multi-aplicación (Nexus Groups, MesaChef, Spa)
    const sanitizedConcept = sanitizeRedsysText(options.concept || "");
    const metaDataObj = {
        app: options.app || "grupos",
        referenceId: options.referenceId || options.groupId || options.reservaId || "",
        groupId: options.groupId || options.referenceId || "",
        hotel: hotelKey,
        concept: sanitizedConcept,
        createdAt: new Date().toISOString()
    };
    merchantParams.DS_MERCHANT_MERCHANTDATA = JSON.stringify(metaDataObj).substring(0, 1024);

    // Canales opcionales de envío directo por Redsys
    if (options.customerMobile) {
        merchantParams.DS_MERCHANT_CUSTOMER_MOBILE = String(options.customerMobile).replace(/\D/g, '').slice(-9);
        const appPrefix = options.app === "spa" ? "Spa Cumbria" : (options.app === "mesachef" ? "MesaChef Cumbria" : "Nexus Groups");
        merchantParams.DS_MERCHANT_CUSTOMER_SMS_TEXT = `${appPrefix}: Pago seguro. Acceda al enlace para abonar: @URL@`;
    }

    if (options.customerEmail) {
        merchantParams.DS_MERCHANT_CUSTOMER_MAIL = String(options.customerEmail).trim();
    }

    // Fecha de caducidad del enlace: parsear fecha límite especificada por el usuario
    let expiryDate;
    if (options.expiryDate) {
        const str = String(options.expiryDate).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            const parts = str.split('-');
            expiryDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 23, 59, 59, 999);
        } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
            const parts = str.split('/');
            expiryDate = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10), 23, 59, 59, 999);
        } else {
            expiryDate = new Date(str);
        }
    } else {
        const hours = options.expiryHours || 72;
        expiryDate = new Date(Date.now() + hours * 3600 * 1000);
    }

    if (isNaN(expiryDate.getTime())) {
        expiryDate = new Date(Date.now() + 72 * 3600 * 1000);
    }

    // Formato requerido por Redsys: aaaa-mm-dd-HH.MM.ss.sss (ej: 2026-11-20-23.59.59.000)
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
        // Si el pedido ya existe en Redsys (ej. reintento o prueba previa), reintentar automáticamente con sufijo
        if ((verified.errorCode === "SIS0051" || verified.errorCode === "SIS0020") && !options._retried) {
            const retryLetters = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '02', '03', '04', '05', '06', '07', '08', '09'];
            for (const nextSuffix of retryLetters) {
                const retryRes = await createPayGoldRequest({
                    ...options,
                    orderSuffix: nextSuffix,
                    orderId: undefined,
                    _retried: true
                });
                if (retryRes.success) {
                    return retryRes;
                }
                if (retryRes.errorCode !== "SIS0051" && retryRes.errorCode !== "SIS0020") {
                    return retryRes;
                }
            }
        }

        return {
            success: false,
            errorCode: verified.errorCode,
            error: verified.errorMsg || `Error Redsys ${verified.errorCode}`,
            orderId
        };
    }

    const data = verified.data;
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
        app: options.app || "grupos",
        expiresAt: expiryDate.toISOString(),
        raw: data
    };
}

module.exports = {
    REDSYS_CONFIG,
    REDSYS_ENDPOINTS,
    formatOrderNumberFromReservation,
    generateOrderNumber,
    encryptOrder3DES,
    signPayload,
    decodeAndVerifyResponse,
    getErrorMessage,
    createPayGoldRequest
};
