/**
 * ═════════════════════════════════════════════════════════════════════════════
 * ROUTING ENGINE — ENRUTADOR POR PREFIJOS Y APLICACIONES
 * ═════════════════════════════════════════════════════════════════════════════
 * Mapeo de prefijos operativos y proyectos Firebase independientes:
 * - GE-  -> MesaChef (Grandes Eventos)      -> mesa-chef-prod
 * - RES- -> MesaChef (Restaurante)          -> mesa-chef-prod
 * - EVT- -> MesaChef (Salones y Banquetes)  -> mesa-chef-prod
 * - GRP- -> Grupos                          -> gest-grupos-hotel
 * - SPA- -> Gest-Spa (Cumbria Bienestar)    -> gest-spa
 */

const MODULE_REGISTRY = {
  'GE-': {
    prefix: 'GE-',
    app: 'mesachef',
    modulo: 'grandes-eventos',
    targetProject: 'mesa-chef-prod',
    collection: 'participantes_eventos',
    description: 'Grandes Eventos MesaChef'
  },
  'RES-': {
    prefix: 'RES-',
    app: 'mesachef',
    modulo: 'restaurante',
    targetProject: 'mesa-chef-prod',
    collection: 'reservas_restaurante',
    description: 'Restaurante MesaChef'
  },
  'EVT-': {
    prefix: 'EVT-',
    app: 'mesachef',
    modulo: 'salones',
    targetProject: 'mesa-chef-prod',
    collection: 'reservas_salones',
    description: 'Salones y Banquetes MesaChef'
  },
  'GRP-': {
    prefix: 'GRP-',
    app: 'grupos',
    modulo: 'grupos',
    targetProject: 'gest-grupos-hotel',
    collection: 'groups',
    description: 'Gestión de Grupos y Habitaciones'
  },
  'SPA-': {
    prefix: 'SPA-',
    app: 'spa',
    modulo: 'spa',
    targetProject: 'gest-spa',
    collection: 'reservas_spa',
    description: 'Gest-Spa Cumbria Bienestar'
  }
};

/**
 * Genera el identificador compuesto global de transacción libre de colisiones
 */
function buildCompositeOperationId(hotel, app, orderId) {
  const h = String(hotel || 'cumbria').toLowerCase().trim();
  const a = String(app || 'general').toLowerCase().trim();
  const o = String(orderId || '').trim();
  return `${h}_${a}_${o}`;
}

/**
 * Detecta el módulo y la aplicación de destino analizando:
 * 1. El objeto metadata (Ds_MerchantData) si existe.
 * 2. El prefijo de la referencia o número de pedido (GE-, RES-, EVT-, GRP-, SPA-).
 * 3. Etiquetas contenidas en el número de pedido de Redsys (ej. EVENTO, GRUPO, CIRCUITO, SPA).
 */
function resolveRoute({ orderId = '', referenceId = '', metadata = null, fallbackApp = null }) {
  // 1. Prioridad: Metadatos explícitos enviados en DS_MERCHANT_MERCHANTDATA
  if (metadata && typeof metadata === 'object') {
    const metaApp = String(metadata.app || '').toLowerCase();
    const metaMod = String(metadata.modulo || metadata.module || '').toUpperCase();
    const metaRef = String(metadata.referenceId || metadata.groupId || '').toUpperCase();

    for (const [pfx, conf] of Object.entries(MODULE_REGISTRY)) {
      if (metaRef.startsWith(pfx) || metaMod.includes(pfx.replace('-', ''))) {
        return { ...conf, referenceId: metadata.referenceId || referenceId };
      }
    }

    if (metaApp === 'spa') return { ...MODULE_REGISTRY['SPA-'], referenceId: metadata.referenceId || referenceId };
    if (metaApp === 'grupos') return { ...MODULE_REGISTRY['GRP-'], referenceId: metadata.referenceId || referenceId };
    if (metaApp === 'mesachef') {
      if (metaRef.startsWith('RES-')) return { ...MODULE_REGISTRY['RES-'], referenceId: metaRef };
      if (metaRef.startsWith('EVT-')) return { ...MODULE_REGISTRY['EVT-'], referenceId: metaRef };
      return { ...MODULE_REGISTRY['GE-'], referenceId: metaRef };
    }
  }

  // 2. Por prefijo directo en referenceId u orderId
  const searchCandidates = [referenceId, orderId].map(s => String(s || '').trim().toUpperCase());

  for (const candidate of searchCandidates) {
    if (!candidate) continue;
    if (candidate.startsWith('GE-') || candidate.includes('0000GE')) return { ...MODULE_REGISTRY['GE-'], referenceId: candidate };
    if (candidate.startsWith('RES-') || candidate.startsWith('RST-') || candidate.includes('0000RES')) return { ...MODULE_REGISTRY['RES-'], referenceId: candidate };
    if (candidate.startsWith('EVT-') || candidate.includes('0000EVT')) return { ...MODULE_REGISTRY['EVT-'], referenceId: candidate };
    if (candidate.startsWith('GRP-') || candidate.includes('GRUPO')) return { ...MODULE_REGISTRY['GRP-'], referenceId: candidate };
    if (candidate.startsWith('SPA-') || candidate.includes('0000SPA') || candidate.includes('CIRCUITO')) return { ...MODULE_REGISTRY['SPA-'], referenceId: candidate };
  }

  // 3. Fallback por aplicación indicada
  if (fallbackApp) {
    const f = String(fallbackApp).toLowerCase();
    if (f === 'spa') return { ...MODULE_REGISTRY['SPA-'], referenceId };
    if (f === 'grupos') return { ...MODULE_REGISTRY['GRP-'], referenceId };
    if (f === 'mesachef') return { ...MODULE_REGISTRY['RES-'], referenceId };
  }

  // Si no se pudo determinar con certeza
  return {
    prefix: 'UNKNOWN',
    app: 'unknown',
    modulo: 'unknown',
    targetProject: 'unknown',
    collection: 'unknown',
    description: 'Módulo desconocido',
    referenceId
  };
}

/**
 * Genera candidatos flexibles para localizar la reserva en Firestore
 * Admite búsqueda por ID exacto, referencia PayGold, con o sin prefijo y solo números.
 */
function buildSearchCandidates(orderId, referenceId) {
  const set = new Set();
  const rawList = [orderId, referenceId].filter(Boolean);

  for (const raw of rawList) {
    const str = String(raw).trim();
    if (!str) continue;
    set.add(str);
    set.add(str.toUpperCase());
    set.add(str.toLowerCase());

    // Quitar ceros a la izquierda (ej. 0000RES123 -> RES123)
    const withoutLeadingZeros = str.replace(/^0+/, '');
    if (withoutLeadingZeros) set.add(withoutLeadingZeros);

    // Quitar prefijo alfabético (ej. RES-123456 -> 123456)
    const withoutPrefix = str.replace(/^[A-Z]+-?/i, '');
    if (withoutPrefix) set.add(withoutPrefix);

    // Solo dígitos numéricos
    const onlyDigits = str.replace(/\D/g, '');
    if (onlyDigits && onlyDigits.length >= 3) set.add(onlyDigits);
  }

  return Array.from(set);
}

module.exports = {
  MODULE_REGISTRY,
  buildCompositeOperationId,
  resolveRoute,
  buildSearchCandidates
};
