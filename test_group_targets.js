/**
 * Test Suite: Módulo Objetivos de Grupos y Tarifas (Reqs 22-33)
 */

const assert = require('assert');
const GroupTargetsService = require('./js/services/groupTargetsService.js');
const GroupOccupancyService = require('./js/services/groupOccupancyService.js');

console.log('=== INICIANDO PRUEBAS DE OBJETIVOS DE GRUPOS Y TARIFAS (REQS 22-33) ===\n');

let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    console.log('[PASS] ' + name);
    passed++;
  } catch (err) {
    console.error('[FAIL] ' + name + ': ' + err.message);
    failed++;
  }
}

// ── 1. CATÁLOGO OFICIAL DE TARIFAS 2027 (Requisito 26) ──────────────────────────

it('Req 26 - Tarifas oficiales Guadiana 2027 coinciden exactamente con la especificación', () => {
  const g = GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027.guadiana;
  // HA
  assert.strictEqual(g.HA.individual, 65.0);
  assert.strictEqual(g.HA.doble, 65.0);
  assert.strictEqual(g.HA.triple, 86.5);
  assert.strictEqual(g.HA.cuadruple, 107.0);

  // HD
  assert.strictEqual(g.HD.individual, 73.5);
  assert.strictEqual(g.HD.doble, 82.0);
  assert.strictEqual(g.HD.triple, 112.0);
  assert.strictEqual(g.HD.cuadruple, 141.0);

  // MP
  assert.strictEqual(g.MP.individual, 93.0);
  assert.strictEqual(g.MP.doble, 121.0);
  assert.strictEqual(g.MP.triple, 170.5);
  assert.strictEqual(g.MP.cuadruple, 219.0);

  // PC
  assert.strictEqual(g.PC.individual, 112.5);
  assert.strictEqual(g.PC.doble, 160.0);
  assert.strictEqual(g.PC.triple, 229.0);
  assert.strictEqual(g.PC.cuadruple, 297.0);
});

it('Req 26 - Tarifas oficiales Cumbria 2027: cuádruples deben ser estrictamente null (No disponible)', () => {
  const c = GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027.cumbria;
  // HA
  assert.strictEqual(c.HA.individual, 63.0);
  assert.strictEqual(c.HA.doble, 63.0);
  assert.strictEqual(c.HA.triple, 84.5);
  assert.strictEqual(c.HA.cuadruple, null);

  // HD
  assert.strictEqual(c.HD.individual, 71.0);
  assert.strictEqual(c.HD.doble, 79.0);
  assert.strictEqual(c.HD.triple, 108.5);
  assert.strictEqual(c.HD.cuadruple, null);

  // MP
  assert.strictEqual(c.MP.individual, 90.0);
  assert.strictEqual(c.MP.doble, 117.0);
  assert.strictEqual(c.MP.triple, 165.5);
  assert.strictEqual(c.MP.cuadruple, null);

  // PC
  assert.strictEqual(c.PC.individual, 109.0);
  assert.strictEqual(c.PC.doble, 155.0);
  assert.strictEqual(c.PC.triple, 222.5);
  assert.strictEqual(c.PC.cuadruple, null);
});

// ── 2. CÁLCULO DE PRECIO POR PERSONA (Requisito 29) ─────────────────────────────

it('Req 29 - Cálculo automático del precio por persona (Doble / 2, Triple / 3, Cuádruple / 4)', () => {
  // Guadiana HD: Doble 82 -> 41,00 €
  assert.strictEqual(GroupTargetsService.calculatePricePerPerson(82.0, 2), 41.00);
  assert.strictEqual(GroupTargetsService.calculatePricePerPerson(82.0, 'doble'), 41.00);

  // Guadiana HD: Triple 112 -> 37,33 €
  assert.strictEqual(GroupTargetsService.calculatePricePerPerson(112.0, 3), 37.33);
  assert.strictEqual(GroupTargetsService.calculatePricePerPerson(112.0, 'triple'), 37.33);

  // Guadiana HD: Cuádruple 141 -> 35,25 €
  assert.strictEqual(GroupTargetsService.calculatePricePerPerson(141.0, 4), 35.25);
  assert.strictEqual(GroupTargetsService.calculatePricePerPerson(141.0, 'cuadruple'), 35.25);

  // Guadiana HD: Individual 73.5 -> 73.50 €
  assert.strictEqual(GroupTargetsService.calculatePricePerPerson(73.5, 1), 73.50);

  // Habitación no disponible (null) -> null
  assert.strictEqual(GroupTargetsService.calculatePricePerPerson(null, 4), null);
});

it('Req 29 - Enriquecimiento completo de la matriz de tarifas con precio por persona', () => {
  const gEnriched = GroupTargetsService.enrichTariffsWithPricePerPerson(GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027.guadiana);
  assert.strictEqual(gEnriched.HD.doble.pricePerPerson, 41.00);
  assert.strictEqual(gEnriched.HD.triple.pricePerPerson, 37.33);
  assert.strictEqual(gEnriched.HD.cuadruple.pricePerPerson, 35.25);
  assert.strictEqual(gEnriched.HD.doble.isAvailable, true);

  const cEnriched = GroupTargetsService.enrichTariffsWithPricePerPerson(GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027.cumbria);
  assert.strictEqual(cEnriched.HD.cuadruple.isAvailable, false);
  assert.strictEqual(cEnriched.HD.cuadruple.pricePerPerson, null);
});

// ── 3. CÁLCULO DE INGRESOS PREVISTOS (Requisito 27) ─────────────────────────────

it('Req 27 - Ejemplo oficial: 100 dobles Guadiana HD 2027 = 8.200,00 €', () => {
  const tariffs = GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027.guadiana;
  const breakdown = {
    HD: { individual: 0, doble: 100, triple: 0, cuadruple: 0 }
  };
  const res = GroupTargetsService.calculateTargetRevenue(breakdown, tariffs);
  assert.strictEqual(res.totalRevenue, 8200.00);
  assert.strictEqual(res.byRegimen.HD, 8200.00);
  assert.strictEqual(res.byCategory.doble, 8200.00);
  assert.strictEqual(res.errors.length, 0);
});

it('Req 27 - Combinación multirégimen y multicategoría de ingresos previstos', () => {
  const tariffs = GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027.guadiana;
  const breakdown = {
    HA: { individual: 20, doble: 0, triple: 0, cuadruple: 0 },   // 20 * 65 = 1300
    HD: { individual: 0, doble: 50, triple: 0, cuadruple: 0 },    // 50 * 82 = 4100
    MP: { individual: 0, doble: 0, triple: 10, cuadruple: 0 }     // 10 * 170.5 = 1705
  };
  // Total esperado: 1300 + 4100 + 1705 = 7105.00 €
  const res = GroupTargetsService.calculateTargetRevenue(breakdown, tariffs);
  assert.strictEqual(res.totalRevenue, 7105.00);
  assert.strictEqual(res.byRegimen.HA, 1300.00);
  assert.strictEqual(res.byRegimen.HD, 4100.00);
  assert.strictEqual(res.byRegimen.MP, 1705.00);
  assert.strictEqual(res.byCategory.individual, 1300.00);
  assert.strictEqual(res.byCategory.doble, 4100.00);
  assert.strictEqual(res.byCategory.triple, 1705.00);
});

// ── 4. GESTIÓN DE TARIFAS Y COPIA (Requisito 28) ────────────────────────────────

it('Req 28 - Copia de tarifas con subida porcentual (+5%) sin alterar nulls ni redondeos', () => {
  const src = GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027.guadiana;
  const copied = GroupTargetsService.copyTariffsWithAdjustment(src, { percentIncrease: 5 });
  // Doble HD: 82 * 1.05 = 86.10 €
  assert.strictEqual(copied.HD.doble, 86.10);
  // Doble HA: 65 * 1.05 = 68.25 €
  assert.strictEqual(copied.HA.doble, 68.25);
});

it('Req 28 - Copia a Cumbria preserva cuádruples como null (No disponible)', () => {
  const src = GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027.guadiana;
  const copied = GroupTargetsService.copyTariffsWithAdjustment(src, {
    percentIncrease: 3,
    targetHotel: 'cumbria'
  });
  assert.strictEqual(copied.HD.cuadruple, null);
  assert.strictEqual(copied.HA.cuadruple, null);
  assert.strictEqual(copied.MP.cuadruple, null);
  assert.strictEqual(copied.PC.cuadruple, null);
});

it('Req 28 - Copia con incremento fijo (+10,00 €)', () => {
  const src = GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027.guadiana;
  const copied = GroupTargetsService.copyTariffsWithAdjustment(src, { fixedIncrease: 10.0 });
  // Doble HD: 82 + 10 = 92.00 €
  assert.strictEqual(copied.HD.doble, 92.00);
});

// ── 5. AGREGACIÓN HISTÓRICA BASE (Requisitos 23 y 24) ───────────────────────────

it('Req 23 & 24 - Agregación histórica excluye reservas anuladas y maneja propuestas provisionales', () => {
  const sampleRecords = [
    // Reserva confirmada con distribución validada en Guadiana (Enero)
    {
      reserva: 'RES-001',
      hotel: 'Hotel Guadiana',
      fecha: '2026-01-15',
      pax: 4,
      regimen: 'HD',
      individuales: 0,
      dobles: 2,
      triples: 0,
      cuadruples: 0,
      importeTotal: 164.0,
      netAccommodationPrice: 140.0,
      breakfastCount: 4,
      mealCount: 0,
      estado: 'Confirmada',
      isProvisional: false
    },
    // Reserva sin distribución confirmada (Febrero): debe usar propuesta automática y marcar provisional
    {
      reserva: 'RES-002',
      hotel: 'Hotel Guadiana',
      fecha: '2026-02-10',
      pax: 5,
      regimen: 'HA',
      importeTotal: 200.0,
      netAccommodationPrice: 200.0,
      breakfastCount: 0,
      mealCount: 0,
      estado: 'Confirmada'
      // No tiene habitaciones distribuidas -> Propuesta automática: 5 pax -> 2 dobles + 1 individual
    },
    // Reserva anulada (Marzo): debe excluirse del cómputo principal y registrarse en cancelled
    {
      reserva: 'RES-003',
      hotel: 'Hotel Guadiana',
      fecha: '2026-03-20',
      pax: 10,
      regimen: 'MP',
      importeTotal: 1000.0,
      estado: 'Anulada'
    }
  ];

  const agg = GroupTargetsService.aggregateHistoricalGroupData(sampleRecords, {
    hotel: 'guadiana',
    year: 2026
  });

  // Enero: 1 reserva, 4 pax, 2 habitaciones (dobles), confirmado
  const m1 = agg.monthly[1];
  assert.strictEqual(m1.reservasCount, 1);
  assert.strictEqual(m1.pax, 4);
  assert.strictEqual(m1.roomNights, 2);
  assert.strictEqual(m1.roomNightsDoble, 2);
  assert.strictEqual(m1.isProvisional, false);

  // Febrero: 1 reserva, 5 pax, 3 habitaciones (2 dobles + 1 ind), provisional
  const m2 = agg.monthly[2];
  assert.strictEqual(m2.reservasCount, 1);
  assert.strictEqual(m2.pax, 5);
  assert.strictEqual(m2.roomNights, 3); // 2 dbl + 1 ind
  assert.strictEqual(m2.roomNightsDoble, 2);
  assert.strictEqual(m2.roomNightsIndividual, 1);
  assert.strictEqual(m2.isProvisional, true);

  // Marzo: Excluido porque está anulado
  const m3 = agg.monthly[3];
  assert.strictEqual(m3.reservasCount, 0);

  // Anuladas registradas aparte
  assert.strictEqual(agg.cancelled.count, 1);
  assert.strictEqual(agg.cancelled.pax, 10);
  assert.strictEqual(agg.cancelled.lostRevenue, 1000.0);

  // Overall: tiene datos provisionales
  assert.strictEqual(agg.overall.totalReservas, 2);
  assert.strictEqual(agg.overall.totalPax, 9);
  assert.strictEqual(agg.overall.totalRoomNights, 5);
  assert.strictEqual(agg.overall.hasProvisionalData, true);
});

// ── 6. GENERADOR DE OBJETIVOS (Requisito 25) ────────────────────────────────────

it('Req 25 - Generación de objetivos con 0% de incremento (no se aplica subida forzada)', () => {
  const sampleRecords = [
    {
      reserva: 'RES-100',
      hotel: 'guadiana',
      fecha: '2026-05-10',
      pax: 20,
      regimen: 'HD',
      individuales: 2,
      dobles: 9,
      triples: 0,
      cuadruples: 0,
      importeTotal: 1000.0,
      estado: 'Confirmada',
      isProvisional: false
    }
  ];

  const hist = GroupTargetsService.aggregateHistoricalGroupData(sampleRecords, { hotel: 'guadiana', year: 2026 });
  const target = GroupTargetsService.generateTargetFromHistorical(hist, {
    hotel: 'guadiana',
    targetYear: 2027,
    baseYear: 2026,
    scenario: 'base',
    growthPercent: 0 // Usuario no solicita crecimiento
  });

  const m5 = target.monthly[5];
  assert.strictEqual(m5.targetPax, 20);
  assert.strictEqual(m5.targetRoomNights, 11); // 2 ind + 9 dbl
  assert.strictEqual(m5.byCategory.individual, 2);
  assert.strictEqual(m5.byCategory.doble, 9);

  // Ingresos 2027 calculados con tarifas 2027:
  // 2 ind HD (73.5) = 147.00 €
  // 9 dbl HD (82.0) = 738.00 €
  // Total = 885.00 €
  assert.strictEqual(m5.targetRevenue, 885.00);
});

it('Req 25 - Generación de objetivos con crecimiento del 10%', () => {
  const sampleRecords = [
    {
      reserva: 'RES-101',
      hotel: 'guadiana',
      fecha: '2026-06-15',
      pax: 100,
      regimen: 'HD',
      individuales: 10,
      dobles: 45,
      triples: 0,
      cuadruples: 0,
      importeTotal: 5000.0,
      estado: 'Confirmada',
      isProvisional: false
    }
  ];

  const hist = GroupTargetsService.aggregateHistoricalGroupData(sampleRecords, { hotel: 'guadiana', year: 2026 });
  const target = GroupTargetsService.generateTargetFromHistorical(hist, {
    hotel: 'guadiana',
    targetYear: 2027,
    baseYear: 2026,
    scenario: 'ambicioso',
    growthPercent: 10 // +10%
  });

  const m6 = target.monthly[6];
  assert.strictEqual(m6.targetPax, 110); // 100 * 1.10
  assert.strictEqual(m6.byCategory.individual, 11); // 10 * 1.10
  assert.strictEqual(m6.byCategory.doble, 50); // 45 * 1.10 = 49.5 -> 50
});

// ── 7. COMPARADOR REAL VS OBJETIVO (Requisitos 30 y 31) ─────────────────────────

it('Req 31 - Cálculo de Diferencia y % Cumplimiento (con protección frente a división por 0)', () => {
  const realData = {
    monthly: {
      1: { reservasCount: 5, pax: 80, roomNights: 40, totalRevenue: 3500.0, isProvisional: false },
      2: { reservasCount: 0, pax: 0, roomNights: 0, totalRevenue: 0, isProvisional: false }
    },
    overall: { hasProvisionalData: false }
  };

  const targetData = {
    monthly: {
      1: { targetReservas: 4, targetPax: 100, targetRoomNights: 50, targetRevenue: 4000.0, isProvisional: false },
      2: { targetReservas: 0, targetPax: 0, targetRoomNights: 0, targetRevenue: 0, isProvisional: false }
    },
    overall: { isProvisional: false }
  };

  const comp = GroupTargetsService.compareRealVsTarget(realData, targetData);

  // Mes 1:
  // Revenue: Real 3500, Obj 4000 -> Dif: -500, % Cump: 87.5%
  assert.strictEqual(comp.monthly[1].diff.revenue, -500.0);
  assert.strictEqual(comp.monthly[1].compliancePercent.revenue, 87.5);
  // RoomNights: Real 40, Obj 50 -> Dif: -10, % Cump: 80.0%
  assert.strictEqual(comp.monthly[1].diff.roomNights, -10);
  assert.strictEqual(comp.monthly[1].compliancePercent.roomNights, 80.0);
  // Status: Definitivo
  assert.strictEqual(comp.monthly[1].status, 'Definitivo');

  // Mes 2: Target = 0 -> División entre cero prevenida
  assert.strictEqual(comp.monthly[2].compliancePercent.revenue, 0.0);
  assert.strictEqual(comp.monthly[2].diff.revenue, 0.0);
});

// ── 8. VALIDACIONES Y CONTROL DE COHERENCIA (Requisito 33) ──────────────────────

it('Req 33 - Cumbria no admite cuádruples: dispara error de validación', () => {
  const badTarget = {
    hotel: 'cumbria',
    targetYear: 2027,
    monthly: {
      1: { targetRoomNights: 10, targetPax: 20, targetRevenue: 1000, byCategory: { cuadruple: 2 } }
    }
  };
  const tariffs = GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027.cumbria;
  const val = GroupTargetsService.validateTargetIntegrity(badTarget, tariffs);

  assert.strictEqual(val.valid, false);
  assert.strictEqual(val.errors.some(e => e.includes('Cumbria no dispone de habitaciones cuádruples')), true);
});

it('Req 33 - Valores negativos disparan error de validación', () => {
  const badTarget = {
    hotel: 'guadiana',
    targetYear: 2027,
    monthly: {
      1: { targetRoomNights: -5, targetPax: 10, targetRevenue: 500, byCategory: {} }
    }
  };
  const tariffs = GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027.guadiana;
  const val = GroupTargetsService.validateTargetIntegrity(badTarget, tariffs);

  assert.strictEqual(val.valid, false);
  assert.strictEqual(val.errors.some(e => e.includes('valores negativos')), true);
});

it('Req 33 - Alerta/Warning cuando se utilizan datos provisionales', () => {
  const provTarget = {
    hotel: 'guadiana',
    targetYear: 2027,
    monthly: {
      1: { targetRoomNights: 10, targetPax: 20, targetRevenue: 1000, isProvisional: true, byCategory: {} }
    }
  };
  const tariffs = GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027.guadiana;
  const val = GroupTargetsService.validateTargetIntegrity(provTarget, tariffs);

  assert.strictEqual(val.valid, true); // No bloquea, pero emite warning
  assert.strictEqual(val.warnings.some(w => w.includes('provisionales')), true);
});

// ── 9. REDONDEO OFICIAL Y SUGERENCIA ESTADÍSTICA 2028 ──────────────────────────

it('Redondeo comercial hotelero: 65.24 -> 65.50, 65.54 -> 65.50, 65.89 -> 66.00', () => {
  assert.strictEqual(GroupTargetsService.roundPrice(65.24, '0.50'), 65.50);
  assert.strictEqual(GroupTargetsService.roundPrice(65.54, '0.50'), 65.50);
  assert.strictEqual(GroupTargetsService.roundPrice(65.89, '0.50'), 66.00);
  assert.strictEqual(GroupTargetsService.roundPrice(65.00, '0.50'), 65.00);
  assert.strictEqual(GroupTargetsService.roundPrice(65.05, '0.50'), 65.00);
});

it('Sugerencia estadística 2028: genera propuesta con ajuste y redondeo oficial', () => {
  const catalog = { 2027: GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027 };
  const sug = GroupTargetsService.suggestTariffsForYear(catalog, 'guadiana', 2028, { growthPercent: 4.0 });

  assert.strictEqual(sug._isSuggested, true);
  assert.strictEqual(sug._suggestedGrowth, 4.0);
  // Guadiana 2027 HA Doble: 65.00 * 1.04 = 67.60 -> rounds to 67.50
  assert.strictEqual(sug.HA.doble, 67.50);
  // Guadiana 2027 HD Doble: 82.00 * 1.04 = 85.28 -> rounds to 85.50
  assert.strictEqual(sug.HD.doble, 85.50);
  // Desgloses presentes y redondeados
  assert.ok(sug._desglose);
  assert.strictEqual(typeof sug._desglose.breakfast, 'number');
});

it('Sugerencia estadística 2028 Cumbria: preserva cuádruples en null', () => {
  const catalog = { 2027: GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027 };
  const sug = GroupTargetsService.suggestTariffsForYear(catalog, 'cumbria', 2028, { growthPercent: 5.0 });

  assert.strictEqual(sug.HA.cuadruple, null);
  assert.strictEqual(sug.HD.cuadruple, null);
  assert.strictEqual(sug.MP.cuadruple, null);
  assert.strictEqual(sug.PC.cuadruple, null);
});

it('isOfficialTariff: identifica correctamente años oficiales y no oficiales', () => {
  const catalog = {
    '2026': {
      guadiana: {
        HD: { individual: 70, doble: 78, triple: 106, cuadruple: 125 },
        _isOfficial: true,
        _savedAt: '2026-09-12T12:00:00Z'
      }
    },
    '2027': GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027
  };

  // 2027 es oficial por defecto
  assert.strictEqual(GroupTargetsService.isOfficialTariff(catalog, 'guadiana', 2027), true);
  assert.strictEqual(GroupTargetsService.isOfficialTariff(catalog, 'cumbria', 2027), true);

  // 2026 guardado como oficial
  assert.strictEqual(GroupTargetsService.isOfficialTariff(catalog, 'guadiana', 2026), true);

  // 2028 no guardado como oficial
  assert.strictEqual(GroupTargetsService.isOfficialTariff(catalog, 'guadiana', 2028), false);
  assert.strictEqual(GroupTargetsService.isOfficialTariff(catalog, 'cumbria', 2028), false);
});

it('getTariffsForHotelAndYear: devuelve tarifas oficiales específicas de cada año', () => {
  const catalog = {
    '2026': {
      guadiana: {
        HD: { individual: 70, doble: 78, triple: 106, cuadruple: 125 },
        _isOfficial: true
      }
    },
    '2027': GroupTargetsService.DEFAULT_GROUP_TARIFFS_2027
  };

  const t2026 = GroupTargetsService.getTariffsForHotelAndYear(catalog, 'guadiana', 2026);
  const t2027 = GroupTargetsService.getTariffsForHotelAndYear(catalog, 'guadiana', 2027);

  assert.strictEqual(t2026.HD.doble, 78);
  assert.strictEqual(t2027.HD.doble, 82);
  assert.strictEqual(t2026.HD.individual, 70);
  assert.strictEqual(t2027.HD.individual, 73.5);
});

it('Integración: calculateDailyOccupancyMatrix genera dailyAmount e Ingresos Reales se agregan en aggregateHistoricalGroupData', () => {
  const lines = [
    {
      Reserva: 'RES-REAL-01',
      'Nombre del Grupo': 'GRUPO REAL CONFIRMADO',
      Hotel_Asignado: 'Sercotel Guadiana',
      Entrada: '2026-04-10',
      Salida: '2026-04-12',
      'Pax.': 20,
      'Noches': 2,
      'Importe(*)': '2000.00',
      'Régimen': 'HD',
      Estado: 'Confirmada'
    },
    {
      Reserva: 'RES-REAL-02',
      'Nombre del Grupo': 'GRUPO FORMATO ESPAÑOL',
      Hotel_Asignado: 'Sercotel Guadiana',
      Entrada: '15/04/2026',
      Salida: '17/04/2026',
      'Pax.': 10,
      'Noches': 2,
      'Importe': '1.500,00 €',
      'Régimen': 'PC',
      Estado: 'Confirmada'
    }
  ];

  const dailyMatrix = GroupOccupancyService.calculateDailyOccupancyMatrix(lines, {});
  assert.strictEqual(dailyMatrix.length, 4); // 2 noches + 2 noches
  assert.strictEqual(dailyMatrix[0].dailyAmount, 1000.0);
  assert.strictEqual(dailyMatrix[2].dailyAmount, 750.0);

  const aggregated = GroupTargetsService.aggregateHistoricalGroupData(dailyMatrix, {
    hotel: 'guadiana',
    year: 2026
  });

  // Ambos grupos caen en Abril (mes 4)
  // Total Abril: 1000 * 2 + 750 * 2 = 3500.00 €
  const m4 = aggregated.monthly[4];
  assert.ok(m4, 'El mes 4 debe tener datos agregados');
  assert.strictEqual(m4.reservasCount, 2);
  assert.strictEqual(m4.pax, 60); // 20*2 + 10*2
  assert.strictEqual(m4.totalRevenue, 3500.0);
  assert.strictEqual(aggregated.overall.totalRevenue, 3500.0);
});

it('Integración CapaSuite: getCapaSuiteGroupData acepta objetivos oficiales superiores a 450.000€ (ej. Guadiana 2026 Octubre 97.735€)', () => {
  const dummyOfficial = {
    hotel: 'guadiana',
    targetYear: 2026,
    isOfficial: true,
    source: 'CapaSuite',
    monthly: {
      10: {
        revenue: 97735,
        rooms: 1767,
        adr: 55.31,
        pax: 3357
      }
    },
    overall: {
      totalRevenue: 720000,
      roomNights: 12500,
      isOfficial: true
    }
  };

  // Simular almacenamiento
  global.CapaStorage = {
    getItem: (key) => {
      if (key === 'nexus_target_guadiana_2026') return JSON.stringify(dummyOfficial);
      return null;
    }
  };

  const res = GroupTargetsService.getCapaSuiteGroupData('guadiana', 2026);
  assert.ok(res, 'Debe devolver el objeto monthly');
  assert.strictEqual(res[10].revenue, 97735, 'Octubre debe ser exactamente 97.735€');
  assert.strictEqual(res[10].rooms, 1767, 'Octubre debe tener 1.767 habitaciones');

  delete global.CapaStorage;
});

it('Integración CapaSuite: getCapaSuiteGroupData resuelve con fallback a custom_seg_budget', () => {
  const customStore = {
    9: {
      GRUPOS: { rev: 97735, rn: 1767 }
    }
  };

  global.CapaStorage = {
    getItem: (key) => {
      if (key === 'custom_seg_budget_Guadiana_2026') return JSON.stringify(customStore);
      return null;
    }
  };

  const res = GroupTargetsService.getCapaSuiteGroupData('guadiana', 2026);
  assert.ok(res, 'Debe devolver el objeto monthly desde custom_seg_budget');
  assert.strictEqual(res[10].revenue, 97735);
  assert.strictEqual(res[10].rooms, 1767);

  delete global.CapaStorage;
});

// ── RESUMEN FINAL ───────────────────────────────────────────────────────────────

console.log('\n═════════════════════════════════════════════════════════════════════');
console.log('RESUMEN DE PRUEBAS OBJETIVOS DE GRUPOS: ' + passed + ' pasadas, ' + failed + ' falladas.');
console.log('═════════════════════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
