/**
 * ═════════════════════════════════════════════════════════════════════════════
 * ORDER ID GENERATOR & REGISTRY — NORMATIVA OFICIAL REDSYS (DS_MERCHANT_ORDER)
 * ═════════════════════════════════════════════════════════════════════════════
 * Reglas estrictas e inviolables de Redsys:
 * 1. Longitud obligatoria: Mínimo 4 caracteres, MÁXIMO 12 caracteres.
 * 2. Los primeros 4 caracteres DEBEN ser estrictamente numéricos (0-9).
 * 3. Caracteres permitidos: Alfanuméricos ASCII [0-9A-Za-z]. Sin guiones ni símbolos.
 * 4. UNICIDAD OBLIGATORIA POR COBRO: Cada enlace PayGold (incluso para múltiples
 *    anticipos de una misma reserva) debe recibir un número Redsys único e irrepetible.
 */

const { buildCompositeOperationId } = require('./routing-engine');

/**
 * Valida si un número de pedido cumple estrictamente la normativa de Redsys
 */
function validateRedsysOrderId(orderId) {
  if (!orderId || typeof orderId !== 'string') {
    return { valid: false, reason: 'El número de pedido no puede estar vacío' };
  }

  const str = orderId.trim();

  if (str.length < 4 || str.length > 12) {
    return {
      valid: false,
      reason: `Longitud inválida (${str.length} caracteres). Redsys exige entre 4 y 12 caracteres exactos.`
    };
  }

  // Comprobar que los primeros 4 caracteres son dígitos obligatorios
  if (!/^\d{4}/.test(str)) {
    return {
      valid: false,
      reason: `Los primeros 4 caracteres deben ser dígitos numéricos (0-9). Recibido: "${str.substring(0, 4)}"`
    };
  }

  // Comprobar que el resto son alfanuméricos válidos
  if (!/^\d{4}[0-9A-Za-z]{0,8}$/.test(str)) {
    return {
      valid: false,
      reason: `Contiene caracteres inválidos. Solo se admiten letras ASCII y números [0-9A-Z].`
    };
  }

  return { valid: true };
}

/**
 * Genera una secuencia única de 12 caracteres para Redsys respetando el formato
 * [4 dígitos numéricos] + [código de módulo/reserva] + [índice de anticipo/intento]
 */
function formatUniqueOrderId({
  sequenceNum = 1001,
  referenceId = '',
  app = 'mesachef',
  modulo = '',
  installmentIndex = 1
}) {
  // Asegurar 4 dígitos numéricos iniciales
  const seqStr = String(sequenceNum).padStart(4, '0').slice(-4);

  // Limpiar referencia
  const cleanRef = String(referenceId || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const instCode = String(installmentIndex || 1).padStart(2, '0').slice(-2); // '01', '02', etc.

  // Extraer etiqueta de módulo (hasta 3-4 chars)
  let tag = 'GEN';
  const modLower = String(modulo || '').toLowerCase();
  const appLower = String(app || '').toLowerCase();

  if (cleanRef.startsWith('RES') || modLower.includes('rest')) tag = 'RES';
  else if (cleanRef.startsWith('EVT') || modLower.includes('salon')) tag = 'EVT';
  else if (cleanRef.startsWith('GE') || modLower.includes('event')) tag = 'GE';
  else if (cleanRef.startsWith('GRP') || appLower.includes('grupo')) tag = 'GRP';
  else if (cleanRef.startsWith('SPA') || appLower.includes('spa')) tag = 'SPA';

  // Extraer parte significativa del identificador de la reserva (hasta 3 chars)
  const refTail = cleanRef.replace(/^(RES|EVT|GE|GRP|SPA)/, '').slice(-3) || '00';

  // Estructura: 4 dígitos (seq) + Tag (3) + RefTail (3) + Inst (2) = 12 caracteres
  const combined = `${seqStr}${tag}${refTail}${instCode}`;
  return combined.slice(0, 12);
}

/**
 * Genera y registra de forma atómica un identificador único Redsys en Firestore,
 * garantizando que reservas con múltiples anticipos tengan pedidos distintos.
 *
 * @param {object} params
 * @param {object} params.db - Instancia de Firestore
 * @param {string} params.hotel - 'cumbria' | 'guadiana'
 * @param {string} params.app - 'mesachef' | 'grupos' | 'spa'
 * @param {string} params.modulo - Módulo operativo
 * @param {string} params.referenceId - Localizador interno de la reserva (ej. 'RES-2026-88')
 * @param {number} [params.installmentIndex=1] - Número de anticipo/pago dentro de la reserva
 * @param {number} [params.amountEuros=0] - Importe del cobro
 * @param {string} [params.concept=''] - Concepto del cobro
 * @returns {Promise<{ orderId: string, compositeId: string, registered: boolean }>}
 */
async function createUniqueAtomicRedsysOrder({
  db,
  hotel,
  app,
  modulo,
  referenceId,
  installmentIndex = 1,
  amountEuros = 0,
  concept = '',
  customerEmail = '',
  customerMobile = ''
}) {
  const hotelKey = String(hotel || 'cumbria').toLowerCase();
  const appKey = String(app || 'mesachef').toLowerCase();
  const refId = String(referenceId || '').trim();

  // Si no hay DB (ej. test unitario sin mock), generar determinista seguro
  if (!db || !db.collection) {
    const fallbackSeq = Math.floor(1000 + (Date.now() % 9000));
    const orderId = formatUniqueOrderId({
      sequenceNum: fallbackSeq,
      referenceId: refId,
      app: appKey,
      modulo,
      installmentIndex
    });
    const compositeId = buildCompositeOperationId(hotelKey, appKey, orderId);
    return { orderId, compositeId, registered: false };
  }

  // Transacción atómica en Firestore para obtener secuencia y registrar pedido
  const counterRef = db.collection('counters').doc(`redsys_seq_${hotelKey}`);

  let finalOrderId = '';
  let finalCompositeId = '';

  await db.runTransaction(async (transaction) => {
    let nextSeq = 1001;
    let counterSnap = null;
    try {
      counterSnap = await transaction.get(counterRef);
      if (counterSnap && counterSnap.exists) {
        const cur = counterSnap.data()?.current || 1000;
        nextSeq = (cur >= 9999) ? 1001 : cur + 1;
      }
    } catch (_) {}

    // Bucle anti-colisión transaccional (soporta desbordamiento/wrap-around de secuencia)
    let candidateOrderId = '';
    let candidateCompositeId = '';
    let attempts = 0;

    while (attempts < 50) {
      candidateOrderId = formatUniqueOrderId({
        sequenceNum: nextSeq,
        referenceId: refId,
        app: appKey,
        modulo,
        installmentIndex
      });

      const existingSnap = await transaction.get(db.collection('paygold_orders').doc(candidateOrderId));
      if (!existingSnap.exists) {
        // Pedido único confirmado sin colisión
        finalOrderId = candidateOrderId;
        finalCompositeId = buildCompositeOperationId(hotelKey, appKey, finalOrderId);
        break;
      }

      // Si colisiona con un pedido histórico previo, avanzar la secuencia
      nextSeq = (nextSeq >= 9999) ? 1001 : nextSeq + 1;
      attempts++;
    }

    if (!finalOrderId) {
      throw new Error(`[Order ID Generator] No se pudo encontrar un número de pedido libre tras 50 intentos para ${hotelKey}`);
    }

    transaction.set(counterRef, {
      hotel: hotelKey,
      current: nextSeq,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Registro atómico de correspondencia en 'paygold_orders'
    const orderRef = db.collection('paygold_orders').doc(finalOrderId);
    transaction.set(orderRef, {
      orderId: finalOrderId,
      compositeId: finalCompositeId,
      hotel: hotelKey,
      app: appKey,
      modulo: modulo || '',
      referenceId: refId,
      installmentIndex: parseInt(installmentIndex, 10) || 1,
      amountRequested: parseFloat(amountEuros) || 0,
      concept,
      customerEmail,
      customerMobile,
      status: 'GENERATED',
      createdAt: new Date().toISOString()
    });
  });

  return {
    orderId: finalOrderId,
    compositeId: finalCompositeId,
    registered: true
  };
}

/**
 * Función determinista clásica mantenida para compatibilidad retroactiva
 */
function generateRedsysOrderId(localizadorInterno, app = 'mesachef', modulo = '') {
  if (!localizadorInterno) {
    const numPrefix = String(Math.floor(1000 + Math.random() * 9000));
    const suffix = Date.now().toString(36).slice(-6).toUpperCase();
    return (numPrefix + suffix).slice(0, 12);
  }

  const clean = String(localizadorInterno).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const appTag = String(app || '').toLowerCase();
  const modTag = String(modulo || '').toLowerCase();

  // 1. GEST-SPA
  if (appTag.includes('spa') || modTag.includes('spa') || clean.startsWith('SPA')) {
    const rawCode = clean.replace(/^SPA/, '').replace(/^RS/, '') || clean;
    const tail = rawCode.slice(0, 5);
    return `0000SPA${tail}`.slice(0, 12);
  }

  // 2. GRUPOS
  if (appTag.includes('grupo') || modTag.includes('grupo') || clean.startsWith('GRP')) {
    const rawNoGrp = clean.replace(/^GRP/, '');
    const matchDigits = rawNoGrp.match(/^\d+/);
    let digits = matchDigits ? matchDigits[0] : '';
    let rest = rawNoGrp.substring(digits.length);

    if (digits.length < 4) {
      digits = digits.padStart(4, '0');
    }
    const tag = (rest.includes('GRUPO') || digits.includes('GRUPO')) ? '' : 'GRUPO';
    return (digits + rest + tag).slice(0, 12);
  }

  // 3. MESACHEF — RESTAURANTE
  if (clean.startsWith('RES') || clean.startsWith('RST') || modTag.includes('rest')) {
    const code = clean.replace(/^RES/, '').replace(/^RST/, '');
    const tail = code.length > 5 ? code.slice(-5) : code;
    return `0000RES${tail}`.slice(0, 12);
  }

  // 4. MESACHEF — SALONES / EVENTOS
  if (clean.startsWith('EVT') || clean.startsWith('BAN') || modTag.includes('salon')) {
    const code = clean.replace(/^EVT/, '').replace(/^BAN/, '');
    const tail = code.length > 5 ? code.slice(-5) : code;
    return `0000EVT${tail}`.slice(0, 12);
  }

  // 5. MESACHEF — GRANDES EVENTOS
  if (clean.startsWith('GE') || modTag.includes('grande')) {
    const code = clean.replace(/^GE/, '');
    const tail = code.length > 6 ? code.slice(-6) : code;
    return `0000GE${tail}`.slice(0, 12);
  }

  const matchNums = clean.match(/^\d+/);
  if (matchNums && matchNums[0].length >= 4) {
    return clean.slice(0, 12);
  }

  const rawTail = clean.slice(-8);
  return `0000${rawTail}`.slice(0, 12);
}

module.exports = {
  validateRedsysOrderId,
  formatUniqueOrderId,
  createUniqueAtomicRedsysOrder,
  generateRedsysOrderId
};
