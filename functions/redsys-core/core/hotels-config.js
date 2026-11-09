/**
 * ═════════════════════════════════════════════════════════════════════════════
 * CONFIGURACIÓN DE LOS DOS TPV VIRTUALES REDSYS (MULTI-HOTEL)
 * ═════════════════════════════════════════════════════════════════════════════
 * Cumbria Spa & Hotel  (FUC: 168271567)
 * Sercotel Guadiana    (FUC: 168355840)
 */

const HOTELS = {
  cumbria: {
    id: 'cumbria',
    name: 'Cumbria Spa & Hotel',
    merchantCode: '168271567',
    terminal: '1',
    // La clave puede ser inyectada desde Secret Manager o variable de entorno
    getSecretKey: () => process.env.REDSYS_SECRET_KEY_CUMBRIA || 'T4o7OH9D6UTSo9B9xr2iRaP6I+7s4U8D',
    webhookUrl: 'https://redsyswebhook-nls6pa6unq-uc.a.run.app',
    currency: '978',
    supportedPrefixes: ['SPA-', 'GRP-', 'RES-', 'EVT-', 'GE-']
  },
  guadiana: {
    id: 'guadiana',
    name: 'Sercotel Guadiana',
    merchantCode: '168355840',
    terminal: '001',
    getSecretKey: () => process.env.REDSYS_SECRET_KEY_GUADIANA || process.env.REDSYS_SECRET_KEY || null,
    webhookUrl: 'https://europe-west1-mesa-chef-prod.cloudfunctions.net/redsysWebhook',
    currency: '978',
    emailConciliacion: 'administracion@hotelguadiana.es',
    supportedPrefixes: ['RES-', 'EVT-', 'GE-', 'GRP-']
  }
};

/**
 * Normaliza el identificador de hotel a 'cumbria' o 'guadiana'
 */
function normalizeHotelKey(raw) {
  if (!raw) return 'cumbria';
  const str = String(raw).trim().toLowerCase();
  if (str.includes('guad') || str === '168355840') return 'guadiana';
  return 'cumbria';
}

/**
 * Identifica el hotel a partir del código de comercio FUC enviado por Redsys
 */
function identifyHotelByMerchantCode(merchantCode) {
  const cleanCode = String(merchantCode || '').trim();
  if (cleanCode === HOTELS.cumbria.merchantCode) return 'cumbria';
  if (cleanCode === HOTELS.guadiana.merchantCode) return 'guadiana';
  return null;
}

/**
 * Obtiene la configuración de un hotel por su clave o FUC
 */
function getHotelConfig(keyOrFuc) {
  if (!keyOrFuc) return null;
  const key = identifyHotelByMerchantCode(keyOrFuc) || normalizeHotelKey(keyOrFuc);
  return HOTELS[key] || null;
}

module.exports = {
  HOTELS,
  normalizeHotelKey,
  identifyHotelByMerchantCode,
  getHotelConfig
};
