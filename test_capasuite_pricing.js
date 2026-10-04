/**
 * Test suite for CapaSuitePricingService
 */
const assert = require('assert');
const CapaSuitePricingService = require('./js/services/capaSuitePricingService.js');

console.log("=== INICIANDO PRUEBAS DE TARIFAS CAPASUITE Y RECOMENDACIÓN DE PRESUPUESTOS ===");

// Simulación de localStorage para pruebas
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = v; }
};

// Test 1: Fallback benchmark estacional cuando no hay datos en localStorage
{
  const priceInfo = CapaSuitePricingService.getCapaSuiteHotelDayPrice('Sercotel Guadiana', '2026-10-15'); // Jueves Octubre
  assert(priceInfo.price > 60, "Debe calcular un precio de mercado coherente");
  assert.strictEqual(priceInfo.isEstimated, true);
  console.log("[PASS] Test 1: Fallback benchmark estacional calcula precio base correctamente (" + priceInfo.price + " €)");
}

// Test 2: Mayor precio en fin de semana que entre semana
{
  const pJueves = CapaSuitePricingService.getCapaSuiteHotelDayPrice('Sercotel Guadiana', '2026-10-15'); // Jueves
  const pSabado = CapaSuitePricingService.getCapaSuiteHotelDayPrice('Sercotel Guadiana', '2026-10-17'); // Sábado
  assert(pSabado.price > pJueves.price, "El sábado debe tener tarifa superior por demanda de ocio de fin de semana");
  console.log(`[PASS] Test 2: Fin de semana (${pSabado.price} €) > Entre semana (${pJueves.price} €)`);
}

// Test 3: Lectura prioritaria desde revenue_data_v2 (Scraping de competencia / PVP Hotel)
{
  mockStorage['revenue_data_v2'] = JSON.stringify({
    '2026-11-20': {
      hotels: {
        'Hotel Guadiana': { price: 95 }
      }
    }
  });

  const pScraped = CapaSuitePricingService.getCapaSuiteHotelDayPrice('Sercotel Guadiana', '2026-11-20');
  assert.strictEqual(pScraped.price, 95, "Debe leer exactamente el precio PVP de revenue_data_v2");
  assert.strictEqual(pScraped.isEstimated, false);
  console.log("[PASS] Test 3: Prioridad de lectura directa desde revenue_data_v2 (95.00 €)");
}

// Test 4: Lectura prioritaria desde hotel_manager_db_v2 (OTB / ADR de producción)
{
  mockStorage['hotel_manager_db_v2'] = JSON.stringify({
    'guadiana': {
      '2026': {
        daily_otb: {
          '2026-12-05': { price: 105, adr: 102 }
        }
      }
    }
  });

  const pOtb = CapaSuitePricingService.getCapaSuiteHotelDayPrice('Sercotel Guadiana', '2026-12-05');
  assert.strictEqual(pOtb.price, 105, "Debe leer el precio desde daily_otb en hotel_manager_db_v2");
  assert.strictEqual(pOtb.isEstimated, false);
  console.log("[PASS] Test 4: Prioridad de lectura directa desde hotel_manager_db_v2 (105.00 €)");
}

// Test 5: Cálculo de Comparativa de Tarifa Oficial vs Recomendada CapaSuite (-15%)
{
  // Para 2026-11-20 donde PVP es 95 €:
  // Con 15% de descuento: 95 * 0.85 = 80.75 €
  const comp = CapaSuitePricingService.getTariffComparison('Sercotel Guadiana', '2026-11-20', 'HD', 15);
  assert.strictEqual(comp.hotelDayPrice, 95);
  assert.strictEqual(comp.discountPercent, 15);
  assert.strictEqual(comp.recDoble, 80.75, "Doble con 15% de dto sobre 95€ debe ser 80.75€");
  assert.strictEqual(comp.officialDoble, 82.0, "Oficial Doble Guadiana HD debe ser 82.00€");
  console.log(`[PASS] Test 5: PVP Hotel ${comp.hotelDayPrice} € -> Tarifa Oficial: ${comp.officialDoble} € | Recomendada CapaSuite (-15%): ${comp.recDoble} €`);
}

// Test 6: Ajuste dinámico con otro descuento (ej. -20%)
{
  // 95 * 0.80 = 76.00 €
  const comp20 = CapaSuitePricingService.getTariffComparison('Sercotel Guadiana', '2026-11-20', 'HD', 20);
  assert.strictEqual(comp20.recDoble, 76.00, "Doble con 20% de dto sobre 95€ debe ser 76.00€");
  console.log(`[PASS] Test 6: Descuento dinámico al -20% -> Tarifa Recomendada: ${comp20.recDoble} €`);
}

// Test 7: Cumbria Spa no admite cuádruples (debe ser null)
{
  const compCumbria = CapaSuitePricingService.getTariffComparison('Cumbria Spa & Hotel', '2026-10-15', 'HD', 15);
  assert.strictEqual(compCumbria.officialPricesByRoom['CUÁDRUPLE'], undefined, "Cumbria no debe tener cuádruple en la lista");
  console.log("[PASS] Test 7: Cumbria excluye cuádruple y mantiene coherencia de tipologías");
}

// Test 8: Resumen de estancia para múltiples noches
{
  const stayDates = ['2026-11-20', '2026-11-21'];
  const summary = CapaSuitePricingService.getStayTariffSummary('Sercotel Guadiana', stayDates, 'HD', 15);
  assert.strictEqual(summary.nightsCount, 2);
  assert(summary.avgHotelPrice > 0);
  assert(summary.avgOfficialRate > 0);
  assert(summary.avgRecommendedRate > 0);
  console.log(`[PASS] Test 8: Resumen de estancia de ${summary.nightsCount} noches -> Media PVP: ${summary.avgHotelPrice} € | Media Oficial: ${summary.avgOfficialRate} € | Media Recomendada: ${summary.avgRecommendedRate} €`);
}

console.log("\nTODAS LAS PRUEBAS DE CAPASUITE PRICING SERVICE PASARON EXITOSAMENTE.");
