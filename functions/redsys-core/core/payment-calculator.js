/**
 * ═════════════════════════════════════════════════════════════════════════════
 * PAYMENT CALCULATOR — ESTADOS DE COBRO, SALDOS E IDEMPOTENCIA
 * ═════════════════════════════════════════════════════════════════════════════
 * Manejo estricto de:
 * - 8 Estados visuales normalizados
 * - Distinción entre Fianza, Pago Parcial y Liquidación Total
 * - Preservación y no sobrescritura de movimientos en el historial
 */

const PAYMENT_STATES = {
  PENDIENTE: 'pendiente',
  ENLACE_ENVIADO: 'enlace_enviado',
  FIANZA_COBRADA: 'fianza_cobrada',
  PAGO_PARCIAL: 'pago_parcial',
  PAGADO: 'pagado',
  RECHAZADO: 'rechazado',
  CADUCADO: 'caducado',
  INCIDENCIA: 'incidencia'
};

/**
 * Convierte euros a céntimos enteros exactos para evitar errores de coma flotante IEEE 754
 */
function eurosToCents(euros) {
  if (euros === null || euros === undefined || isNaN(euros)) return 0;
  return Math.round(Number(euros) * 100);
}

/**
 * Convierte céntimos enteros a euros con 2 decimales exactos
 */
function centsToEuros(cents) {
  if (cents === null || cents === undefined || isNaN(cents)) return 0;
  return Math.round(Number(cents)) / 100;
}

/**
 * Calcula los importes actualizados, saldo restante y estado de cobro
 * Utiliza aritmética entera de céntimos para 100% de precisión monetaria.
 */
function calculatePaymentOutcome({
  totalExigible = 0,
  fianzaAcordada = 0,
  cobradoPrevio = 0,
  importeNotificado = 0,
  isAuthorized = true,
  paymentType = 'fianza'
}) {
  const totalCents = Math.max(0, eurosToCents(totalExigible));
  const fianzaCents = Math.max(0, eurosToCents(fianzaAcordada));
  const previoCents = Math.max(0, eurosToCents(cobradoPrevio));
  const nuevoCents = Math.max(0, eurosToCents(importeNotificado));

  if (!isAuthorized) {
    const restanteCents = Math.max(0, totalCents - previoCents);
    return {
      status: PAYMENT_STATES.RECHAZADO,
      cobradoTotal: centsToEuros(previoCents),
      saldoPendiente: centsToEuros(restanteCents),
      cobradoTotalCents: previoCents,
      saldoPendienteCents: restanteCents,
      isFullyPaid: totalCents > 0 ? previoCents >= totalCents : false,
      isFianzaCovered: fianzaCents > 0 ? previoCents >= fianzaCents : false
    };
  }

  const cobradoTotalCents = previoCents + nuevoCents;
  const saldoPendienteCents = Math.max(0, totalCents - cobradoTotalCents);

  const isFullyPaid = (totalCents > 0 && cobradoTotalCents >= totalCents) || (totalCents === 0 && cobradoTotalCents > 0);
  const isFianzaCovered = (fianzaCents > 0 && cobradoTotalCents >= fianzaCents);

  let status = PAYMENT_STATES.PAGO_PARCIAL;

  if (isFullyPaid) {
    status = PAYMENT_STATES.PAGADO;
  } else if (isFianzaCovered || paymentType === 'fianza') {
    status = PAYMENT_STATES.FIANZA_COBRADA;
  } else if (cobradoTotalCents > 0) {
    status = PAYMENT_STATES.PAGO_PARCIAL;
  } else {
    status = PAYMENT_STATES.PENDIENTE;
  }

  return {
    status,
    cobradoTotal: centsToEuros(cobradoTotalCents),
    saldoPendiente: centsToEuros(saldoPendienteCents),
    cobradoTotalCents,
    saldoPendienteCents,
    isFullyPaid,
    isFianzaCovered
  };
}

/**
 * Construye y añade una entrada al historial de pagos sin sobrescribir ni duplicar
 */
function appendPaymentHistory(currentHistory = [], newEntry) {
  const history = Array.isArray(currentHistory) ? [...currentHistory] : [];
  
  if (!newEntry || !newEntry.orderId) {
    return history;
  }

  // Comprobar idempotencia: evitar duplicar si ya existe la misma orden y código de autorización
  const isAlreadyRecorded = history.some(item => {
    const sameOrder = String(item.orderId || '').trim() === String(newEntry.orderId || '').trim();
    const sameAuth = newEntry.autorizacion && item.autorizacion ? String(item.autorizacion).trim() === String(newEntry.autorizacion).trim() : true;
    return sameOrder && sameAuth;
  });

  if (isAlreadyRecorded) {
    return history; // Idempotente: retorna el historial existente intacto
  }

  const entry = {
    fecha: newEntry.fecha || new Date().toISOString(),
    tipo: newEntry.tipo || 'pago_online',
    metodo: newEntry.metodo || 'TPV Redsys PayGold',
    hotel: newEntry.hotel || '',
    fuc: newEntry.fuc || '',
    orderId: newEntry.orderId || '',
    autorizacion: newEntry.autorizacion || '',
    importe: parseFloat(newEntry.importe || 0),
    tarjeta: newEntry.tarjeta || '',
    saldoRestante: parseFloat(newEntry.saldoRestante || 0),
    registradoEn: new Date().toISOString()
  };

  history.push(entry);
  return history;
}

module.exports = {
  PAYMENT_STATES,
  eurosToCents,
  centsToEuros,
  calculatePaymentOutcome,
  appendPaymentHistory
};
