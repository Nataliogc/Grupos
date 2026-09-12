/**
 * ═════════════════════════════════════════════════════════════════════
 * NEXUS GROUPS — Objetivos de Grupos & Tarifas Service (Reqs 22-33)
 * ═════════════════════════════════════════════════════════════════════
 * Pure functions for:
 * 1. Historical base analysis & aggregation (Req 22, 23, 24).
 * 2. Official Group Tariffs Catalog 2027 & future years (Req 26, 28).
 * 3. Auto-calculation of Price per Person (Req 29).
 * 4. Target Revenue Calculation based on Room-Nights & Tariffs (Req 27).
 * 5. Scenario-based Target Generation without forced auto-inflation (Req 25).
 * 6. Real vs Target Comparative Monitoring (% Cumplimiento, Dif) (Req 30, 31).
 * 7. Integrity Validations & Cumbria Quadruple blocking (Req 33).
 * 8. Decoupled Persistence Models for Firestore (Req 32).
 *
 * Supports both Browser (window.GroupTargetsService) and Node.js.
 * ═════════════════════════════════════════════════════════════════════
 */

(function (global) {
  "use strict";

  // ── 1. CONSTANTES Y CONFIGURACIÓN BASE ──────────────────────────────

  var CATEGORY_OCCUPANTS = {
    individual: 1,
    doble: 2,
    triple: 3,
    cuadruple: 4
  };

  var ROOM_CATEGORIES = ["individual", "doble", "triple", "cuadruple"];
  var REGIMEN_TYPES = ["HA", "HD", "MP", "PC"];

  var SCENARIOS = {
    BASE: "base",
    CONSERVADOR: "conservador",
    RECOMENDADO: "recomendado",
    AMBICIOSO: "ambicioso",
    PERSONALIZADO: "personalizado"
  };

  var SCENARIO_DEFAULTS = {
    base: { label: "Histórico Base", growthPercent: 0, icon: "🏛️", desc: "Mantiene producción del año base (0%)" },
    conservador: { label: "Conservador", growthPercent: 3, icon: "🛡️", desc: "Crecimiento prudente (+3%)" },
    recomendado: { label: "Recomendado", growthPercent: 7, icon: "⭐", desc: "Equilibrado y optimizado (+7%)" },
    ambicioso: { label: "Ambicioso", growthPercent: 12, icon: "🚀", desc: "Alta demanda y captación (+12%)" },
    personalizado: { label: "Manual", growthPercent: 0, icon: "✏️", desc: "Ajuste manual libre por porcentaje o mensual" }
  };

  /**
   * Redondea un precio según la regla especificada:
   * - "none": sin redondeo (2 decimales)
   * - "0.50": redondea a 0,50 € más cercano
   * - "1.00" / "integer": redondea al euro entero más cercano
   * - "5.00": redondea a múltiplos de 5 €
   */
  function roundPrice(price, rounding) {
    if (price === null || price === undefined || isNaN(price)) return price;
    var r = String(rounding || "none").toLowerCase().trim();
    var p = Number(price);
    if (r === "0.5" || r === "0.50" || r === "half" || r === "estadistico" || r === "estadistica") {
      var intPart = Math.floor(p);
      var cents = Math.round((p - intPart) * 100);
      if (cents === 0) return intPart;
      if (cents <= 10) return intPart;
      if (cents <= 65) return intPart + 0.5;
      return intPart + 1;
    }
    if (r === "1" || r === "1.00" || r === "integer" || r === "entero") {
      return Math.round(p);
    }
    if (r === "5" || r === "5.00") {
      return Math.round(p / 5) * 5;
    }
    return Math.round(p * 100) / 100;
  }

  // Tarifas Oficiales 2027 (Requisito 26)
  // Cumbria Spa & Hotel no dispone de cuádruples (null)
  var DEFAULT_GROUP_TARIFFS_2027 = {
    guadiana: {
      HA: { individual: 65.0, doble: 65.0, triple: 86.5, cuadruple: 107.0 },
      HD: { individual: 73.5, doble: 82.0, triple: 112.0, cuadruple: 141.0 },
      MP: { individual: 93.0, doble: 121.0, triple: 170.5, cuadruple: 219.0 },
      PC: { individual: 112.5, doble: 160.0, triple: 229.0, cuadruple: 297.0 }
    },
    cumbria: {
      HA: { individual: 63.0, doble: 63.0, triple: 84.5, cuadruple: null },
      HD: { individual: 71.0, doble: 79.0, triple: 108.5, cuadruple: null },
      MP: { individual: 90.0, doble: 117.0, triple: 165.5, cuadruple: null },
      PC: { individual: 109.0, doble: 155.0, triple: 222.5, cuadruple: null }
    }
  };

  /**
   * Normaliza la clave del hotel ('guadiana' | 'cumbria' | 'default')
   */
  function normalizeHotelKey(hotel) {
    if (!hotel) return "guadiana";
    var h = String(hotel).toLowerCase().trim();
    if (h.indexOf("cumbria") !== -1) return "cumbria";
    if (h.indexOf("guadiana") !== -1) return "guadiana";
    return h;
  }

  // ── 2. CÁLCULO DE PRECIO POR PERSONA (Requisito 29) ──────────────────

  /**
   * Calcula el precio por persona a partir del precio de la habitación y número de ocupantes
   * - Dobles: Precio / 2
   * - Triples: Precio / 3
   * - Cuádruples: Precio / 4
   * - Individuales: Precio / 1
   * Retorna null si la habitación no está disponible o el precio es nulo.
   */
  function calculatePricePerPerson(roomPrice, categoryOrPaxCount) {
    if (roomPrice === null || roomPrice === undefined || isNaN(roomPrice)) {
      return null;
    }
    var occupants = 1;
    if (typeof categoryOrPaxCount === "number") {
      occupants = categoryOrPaxCount;
    } else if (typeof categoryOrPaxCount === "string") {
      var cat = categoryOrPaxCount.toLowerCase().trim();
      occupants = CATEGORY_OCCUPANTS[cat] || 1;
    }
    if (occupants <= 0) occupants = 1;
    var price = Number(roomPrice);
    return Math.round((price / occupants) * 100) / 100;
  }

  /**
   * Genera el desglose completo de una matriz de tarifas con el precio por persona incluido
   */
  function enrichTariffsWithPricePerPerson(tariffGrid) {
    if (!tariffGrid) return {};
    var enriched = {};
    for (var reg in tariffGrid) {
      if (!tariffGrid.hasOwnProperty(reg)) continue;
      enriched[reg] = {};
      for (var cat in tariffGrid[reg]) {
        if (!tariffGrid[reg].hasOwnProperty(cat)) continue;
        var roomPrice = tariffGrid[reg][cat];
        var occupants = CATEGORY_OCCUPANTS[cat] || 1;
        enriched[reg][cat] = {
          roomPrice: roomPrice,
          pricePerPerson: calculatePricePerPerson(roomPrice, occupants),
          isAvailable: roomPrice !== null && roomPrice !== undefined,
          occupants: occupants
        };
      }
    }
    return enriched;
  }

  // ── 3. CATÁLOGO DE TARIFAS Y COPIA CON AJUSTES (Requisitos 26 y 28) ───

  /**
   * Obtiene la matriz de tarifas para un hotel y año determinado
   */
  function getTariffsForHotelAndYear(catalog, hotel, year) {
    var hKey = normalizeHotelKey(hotel);
    var yKey = String(year || 2027);

    if (catalog && catalog[yKey] && catalog[yKey][hKey]) {
      return JSON.parse(JSON.stringify(catalog[yKey][hKey]));
    }
    if (catalog && catalog[hKey] && yKey === "2027") {
      return JSON.parse(JSON.stringify(catalog[hKey]));
    }
    // Fallback al catálogo 2027 por defecto
    if (DEFAULT_GROUP_TARIFFS_2027[hKey]) {
      return JSON.parse(JSON.stringify(DEFAULT_GROUP_TARIFFS_2027[hKey]));
    }
    return JSON.parse(JSON.stringify(DEFAULT_GROUP_TARIFFS_2027.guadiana));
  }

  /**
   * Determina si un hotel y año cuenta con tarifa oficial establecida
   */
  function isOfficialTariff(catalog, hotel, year) {
    var hKey = normalizeHotelKey(hotel);
    var yKey = String(year || 2027);

    if (catalog && catalog[yKey] && catalog[yKey][hKey]) {
      var entry = catalog[yKey][hKey];
      if (entry._isOfficial === true || entry._savedAt) {
        return true;
      }
    }
    // 2027 es la tarifa oficial base por defecto
    if (Number(year) === 2027) {
      return true;
    }
    return false;
  }

  /**
   * Copia tarifas de un año a otro aplicando opcionalmente subida porcentual o fija
   * - Respeta categorías no disponibles (null no se convierte en número)
   * - Si el hotel destino es Cumbria, cuádruples siempre se mantienen null
   * - No aplica inflación automática sin parámetros explícitos
   */
  function copyTariffsWithAdjustment(sourceTariffs, options) {
    options = options || {};
    var percentIncrease = typeof options.percentIncrease === "number" ? options.percentIncrease : 0;
    var fixedIncrease = typeof options.fixedIncrease === "number" ? options.fixedIncrease : 0;
    var targetHotel = options.targetHotel ? normalizeHotelKey(options.targetHotel) : null;
    var overrides = options.overrides || {};

    var newTariffs = {};

    for (var reg in sourceTariffs) {
      if (!sourceTariffs.hasOwnProperty(reg)) continue;
      newTariffs[reg] = {};
      for (var cat in sourceTariffs[reg]) {
        if (!sourceTariffs[reg].hasOwnProperty(cat)) continue;
        var currentPrice = sourceTariffs[reg][cat];

        // Verificar si es categoría no disponible en Cumbria
        if (targetHotel === "cumbria" && cat === "cuadruple") {
          newTariffs[reg][cat] = null;
          continue;
        }

        if (overrides[reg] && overrides[reg][cat] !== undefined) {
          newTariffs[reg][cat] = overrides[reg][cat];
          continue;
        }

        if (currentPrice === null || currentPrice === undefined) {
          newTariffs[reg][cat] = null;
          continue;
        }

        var price = Number(currentPrice);
        if (percentIncrease !== 0) {
          price = price * (1 + percentIncrease / 100);
        }
        if (fixedIncrease !== 0) {
          price = price + fixedIncrease;
        }
        newTariffs[reg][cat] = roundPrice(price, options.rounding);
      }
    }

    return newTariffs;
  }

  /**
   * Sugiere una propuesta de tarifas oficiales para un año determinado (ej. 2028) según estadísticas.
   * - Toma como referencia la tarifa oficial del año anterior disponible (ej. 2027).
   * - Aplica una variación porcentual estadística (options.growthPercent o calculada s/ ADR histórico o 4.0% por defecto).
   * - Aplica la regla de redondeo oficial hotelera (0.50):
   *     .11 - .65 -> .50 (ej. 65.24 -> 65.50, 65.54 -> 65.50)
   *     > .65     -> 1.00 (ej. 65.89 -> 66.00)
   * - Cumbria mantiene estrictamente cuádruples en null.
   * - Ajusta y redondea también el desglose oficial de manutención (desayuno, almuerzo, cena).
   */
  function suggestTariffsForYear(catalog, hotel, targetYear, options) {
    options = options || {};
    var tYear = Number(targetYear) || 2028;
    var refYear = tYear - 1;
    var hKey = normalizeHotelKey(hotel);

    // Obtener tarifa base del año de referencia (o fallback a 2027)
    var baseTariffs = getTariffsForHotelAndYear(catalog, hKey, refYear);

    // Determinar crecimiento estadístico:
    var growth = 4.0;
    if (typeof options.growthPercent === "number" && !isNaN(options.growthPercent)) {
      growth = options.growthPercent;
    } else if (options.histData && options.prevData) {
      var currAdr = options.histData.overall && options.histData.overall.totalRoomNights > 0
        ? options.histData.overall.totalLodgingRevenue / options.histData.overall.totalRoomNights
        : 0;
      var prevAdr = options.prevData.overall && options.prevData.overall.totalRoomNights > 0
        ? options.prevData.overall.totalLodgingRevenue / options.prevData.overall.totalRoomNights
        : 0;
      if (currAdr > 0 && prevAdr > 0) {
        var calculatedTrend = ((currAdr - prevAdr) / prevAdr) * 100;
        if (calculatedTrend >= 1.0 && calculatedTrend <= 15.0) {
          growth = Math.round(calculatedTrend * 10) / 10;
        }
      }
    }

    var suggested = copyTariffsWithAdjustment(baseTariffs, {
      percentIncrease: growth,
      targetHotel: hKey,
      rounding: "0.50"
    });

    // Desglose oficial sugerido de manutención
    var baseB = 8.5;
    var baseL = 19.5;
    var baseD = 19.5;
    if (baseTariffs && baseTariffs._desglose) {
      baseB = Number(baseTariffs._desglose.breakfast) || baseB;
      baseL = Number(baseTariffs._desglose.lunch) || Number(baseTariffs._desglose.meal) || baseL;
      baseD = Number(baseTariffs._desglose.dinner) || baseD;
    } else if (baseTariffs && baseTariffs.HD && baseTariffs.HA && baseTariffs.HD.doble && baseTariffs.HA.doble) {
      baseB = Math.round(((baseTariffs.HD.doble - baseTariffs.HA.doble) / 2) * 100) / 100;
      if (baseTariffs.MP && baseTariffs.MP.doble) {
        baseL = Math.round(((baseTariffs.MP.doble - baseTariffs.HD.doble) / 2) * 100) / 100;
      }
      if (baseTariffs.PC && baseTariffs.PC.doble && baseTariffs.MP && baseTariffs.MP.doble) {
        baseD = Math.round(((baseTariffs.PC.doble - baseTariffs.MP.doble) / 2) * 100) / 100;
      }
    }

    suggested._desglose = {
      breakfast: roundPrice(baseB * (1 + growth / 100), "0.50"),
      lunch: roundPrice(baseL * (1 + growth / 100), "0.50"),
      dinner: roundPrice(baseD * (1 + growth / 100), "0.50")
    };

    suggested._isSuggested = true;
    suggested._suggestedGrowth = growth;
    suggested._baseYear = refYear;

    return suggested;
  }

  // ── 4. CÁLCULO DE INGRESOS PREVISTOS (Requisito 27) ───────────────────

  /**
   * Calcula los ingresos objetivo aplicando la tarifa por habitación/noche
   * Ingresos objetivo = Habitaciones-noche previstas × Tarifa por hab/noche
   */
  function calculateTargetRevenue(roomNightsByRegimenAndCategory, tariffs) {
    if (!roomNightsByRegimenAndCategory || !tariffs) {
      return { totalRevenue: 0, byRegimen: {}, byCategory: {}, errors: [] };
    }

    var totalRevenue = 0;
    var byRegimen = { HA: 0, HD: 0, MP: 0, PC: 0 };
    var byCategory = { individual: 0, doble: 0, triple: 0, cuadruple: 0 };
    var errors = [];

    for (var reg in roomNightsByRegimenAndCategory) {
      if (!roomNightsByRegimenAndCategory.hasOwnProperty(reg)) continue;
      var catMap = roomNightsByRegimenAndCategory[reg];
      if (!byRegimen[reg]) byRegimen[reg] = 0;

      for (var cat in catMap) {
        if (!catMap.hasOwnProperty(cat)) continue;
        var nights = Number(catMap[cat]) || 0;
        if (nights <= 0) continue;

        var tariff = (tariffs[reg] && tariffs[reg][cat] !== undefined) ? tariffs[reg][cat] : null;

        if (tariff === null || tariff === undefined) {
          errors.push("Tarifa no disponible para régimen " + reg + " y categoría " + cat);
          continue;
        }

        var lineRevenue = Math.round(nights * Number(tariff) * 100) / 100;
        totalRevenue += lineRevenue;
        byRegimen[reg] = Math.round((byRegimen[reg] + lineRevenue) * 100) / 100;
        byCategory[cat] = Math.round(((byCategory[cat] || 0) + lineRevenue) * 100) / 100;
      }
    }

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      byRegimen: byRegimen,
      byCategory: byCategory,
      errors: errors
    };
  }

  // ── 5. AGREGACIÓN HISTÓRICA BASE (Requisitos 23 y 24) ─────────────────

  /**
   * Agrega el histórico de grupos por Hotel, Año, Mes, Régimen y Categoría.
   * - Excluye reservas anuladas del objetivo principal (pero genera resumen si se solicita).
   * - Si una reserva no tiene distribución confirmada, usa la propuesta automática
   *   y marca el bloque con hasProvisionalData: true.
   */
  function aggregateHistoricalGroupData(dailyRecords, options) {
    options = options || {};
    var filterHotel = options.hotel ? normalizeHotelKey(options.hotel) : null;
    var filterYear = options.year ? Number(options.year) : null;

    var monthlySummary = {};
    var cancelledSummary = { count: 0, pax: 0, lostRevenue: 0 };
    var overall = {
      totalReservas: 0,
      uniqueReservasSet: {},
      totalPax: 0,
      totalPernoctaciones: 0,
      totalRoomNights: 0,
      totalRevenue: 0,
      totalLodgingRevenue: 0,
      totalBreakfasts: 0,
      totalMeals: 0,
      byCategory: { individual: 0, doble: 0, triple: 0, cuadruple: 0 },
      byRegimen: { HA: 0, HD: 0, MP: 0, PC: 0 },
      hasProvisionalData: false
    };

    for (var m = 1; m <= 12; m++) {
      monthlySummary[m] = {
        month: m,
        reservasSet: {},
        reservasCount: 0,
        pax: 0,
        pernoctaciones: 0,
        roomNights: 0,
        roomNightsIndividual: 0,
        roomNightsDoble: 0,
        roomNightsTriple: 0,
        roomNightsCuadruple: 0,
        totalRevenue: 0,
        lodgingRevenue: 0,
        breakfasts: 0,
        meals: 0,
        byRegimen: { HA: 0, HD: 0, MP: 0, PC: 0 },
        byCategory: { individual: 0, doble: 0, triple: 0, cuadruple: 0 },
        regimenCategoryMatrix: {
          HA: { individual: 0, doble: 0, triple: 0, cuadruple: 0 },
          HD: { individual: 0, doble: 0, triple: 0, cuadruple: 0 },
          MP: { individual: 0, doble: 0, triple: 0, cuadruple: 0 },
          PC: { individual: 0, doble: 0, triple: 0, cuadruple: 0 }
        },
        hasProvisionalData: false,
        isProvisional: false
      };
    }

    if (!Array.isArray(dailyRecords)) {
      return { monthly: monthlySummary, overall: overall, cancelled: cancelledSummary };
    }

    for (var i = 0; i < dailyRecords.length; i++) {
      var r = dailyRecords[i];
      if (!r) continue;

      // Filtro de hotel si aplica
      var recHotel = normalizeHotelKey(r.hotel || r.Hotel || "");
      if (filterHotel && recHotel !== filterHotel) continue;

      // Extracción de fecha
      var dateStr = r.fecha || r.Fecha || r.date;
      if (!dateStr && r.Entrada) dateStr = r.Entrada;
      if (!dateStr) continue;

      var parsedDate = new Date(dateStr);
      if (isNaN(parsedDate.getTime())) continue;

      var recYear = parsedDate.getFullYear();
      if (filterYear && recYear !== filterYear) continue;

      var recMonth = parsedDate.getMonth() + 1; // 1-12

      // Manejo de reservas anuladas (Req 23)
      var status = String(r.estado || r.Estado || "").toLowerCase();
      var isCancelled = status.indexOf("anulad") !== -1 || status.indexOf("cancel") !== -1;

      if (isCancelled) {
        cancelledSummary.count++;
        cancelledSummary.pax += Number(r.pax || r.Pax || 0);
        cancelledSummary.lostRevenue += Number(r.importeTotal || r.Importe || r.totalRevenue || 0);
        continue;
      }

      // Distribución de habitaciones: confirmada vs propuesta provisional
      var ind = 0, dbl = 0, tpl = 0, cua = 0;
      var isProvisional = false;

      var pax = Number(r.pax || r.Pax || 0);
      var reg = String(r.regimen || r.Régimen || r.Regimen || "HA").toUpperCase().trim();
      if (!REGIMEN_TYPES.includes(reg)) {
        if (reg.indexOf("PC") !== -1 || reg.indexOf("PENSION COMPLETA") !== -1) reg = "PC";
        else if (reg.indexOf("MP") !== -1 || reg.indexOf("MEDIA") !== -1) reg = "MP";
        else if (reg.indexOf("HD") !== -1 || reg.indexOf("DESAYUNO") !== -1 || reg.indexOf("AD") !== -1) reg = "HD";
        else reg = "HA";
      }

      // Si existe distribución confirmada en la línea diaria
      if (r.individuales !== undefined || r.dobles !== undefined || r.triples !== undefined || r.cuadruples !== undefined) {
        ind = Number(r.individuales || 0);
        dbl = Number(r.dobles || 0);
        tpl = Number(r.triples || 0);
        cua = Number(r.cuadruples || 0);
        isProvisional = !!r.isProvisional;
      } else if (r.habitacionesDistribuidas) {
        ind = Number(r.habitacionesDistribuidas.individuales || 0);
        dbl = Number(r.habitacionesDistribuidas.dobles || 0);
        tpl = Number(r.habitacionesDistribuidas.triples || 0);
        cua = Number(r.habitacionesDistribuidas.cuadruples || 0);
        isProvisional = !r.habitacionesDistribuidas.confirmada;
      } else {
        // Propuesta automática (Req 2)
        dbl = Math.floor(pax / 2);
        ind = pax % 2;
        tpl = 0;
        cua = 0;
        isProvisional = true;
      }

      var lineHabNoches = ind + dbl + tpl + cua;
      var resNum = String(r.reserva || r.Reserva || r.id || i);
      var totalImporte = Number(r.importeTotal || r.importe || r.Importe || r.dailyAmount || 0);
      var lodgingRev = Number(r.netAccommodationPrice || r.alojamientoNeto || totalImporte);
      var breakfasts = Number(r.breakfastCount || 0);
      var meals = Number(r.mealCount || 0);

      // Asignar al mes
      var mData = monthlySummary[recMonth];
      mData.reservasSet[resNum] = true;
      mData.pax += pax;
      mData.pernoctaciones += pax; // Cada día activo genera 1 pernoctación por pax
      mData.roomNights += lineHabNoches;
      mData.roomNightsIndividual += ind;
      mData.roomNightsDoble += dbl;
      mData.roomNightsTriple += tpl;
      mData.roomNightsCuadruple += cua;
      mData.totalRevenue += totalImporte;
      mData.lodgingRevenue += lodgingRev;
      mData.breakfasts += breakfasts;
      mData.meals += meals;

      mData.byCategory.individual += ind;
      mData.byCategory.doble += dbl;
      mData.byCategory.triple += tpl;
      mData.byCategory.cuadruple += cua;

      if (!mData.byRegimen[reg]) mData.byRegimen[reg] = 0;
      mData.byRegimen[reg] += lineHabNoches;

      if (!mData.regimenCategoryMatrix[reg]) {
        mData.regimenCategoryMatrix[reg] = { individual: 0, doble: 0, triple: 0, cuadruple: 0 };
      }
      mData.regimenCategoryMatrix[reg].individual += ind;
      mData.regimenCategoryMatrix[reg].doble += dbl;
      mData.regimenCategoryMatrix[reg].triple += tpl;
      mData.regimenCategoryMatrix[reg].cuadruple += cua;

      if (isProvisional) {
        mData.hasProvisionalData = true;
        mData.isProvisional = true;
        overall.hasProvisionalData = true;
      }

      // Totales generales
      overall.uniqueReservasSet[resNum] = true;
      overall.totalPax += pax;
      overall.totalPernoctaciones += pax;
      overall.totalRoomNights += lineHabNoches;
      overall.totalRevenue += totalImporte;
      overall.totalLodgingRevenue += lodgingRev;
      overall.totalBreakfasts += breakfasts;
      overall.totalMeals += meals;
      overall.byCategory.individual += ind;
      overall.byCategory.doble += dbl;
      overall.byCategory.triple += tpl;
      overall.byCategory.cuadruple += cua;
      overall.byRegimen[reg] = (overall.byRegimen[reg] || 0) + lineHabNoches;
    }

    // Finalizar conteos únicos y redondeos por mes
    for (var mm = 1; mm <= 12; mm++) {
      var item = monthlySummary[mm];
      item.reservasCount = Object.keys(item.reservasSet).length;
      delete item.reservasSet;
      item.totalRevenue = Math.round(item.totalRevenue * 100) / 100;
      item.lodgingRevenue = Math.round(item.lodgingRevenue * 100) / 100;
    }

    overall.totalReservas = Object.keys(overall.uniqueReservasSet).length;
    delete overall.uniqueReservasSet;
    overall.totalRevenue = Math.round(overall.totalRevenue * 100) / 100;
    overall.totalLodgingRevenue = Math.round(overall.totalLodgingRevenue * 100) / 100;
    cancelledSummary.lostRevenue = Math.round(cancelledSummary.lostRevenue * 100) / 100;

    return {
      monthly: monthlySummary,
      overall: overall,
      cancelled: cancelledSummary
    };
  }

  // ── 6. GENERADOR DE OBJETIVOS (Requisitos 24, 25 y 27) ───────────────

  /**
   * Genera el objetivo para un año futuro a partir del histórico y configuración de escenario.
   * - No aplica incremento de forma automática sin el consentimiento del usuario (growthPercent = 0 por defecto).
   * - Calcula los ingresos objetivo aplicando la tarifa oficial por categoría y régimen.
   */
  function generateTargetFromHistorical(historicalData, options) {
    options = options || {};
    var hotel = normalizeHotelKey(options.hotel || "guadiana");
    var targetYear = Number(options.targetYear || 2027);
    var baseYear = Number(options.baseYear || 2026);
    var scenario = options.scenario || SCENARIOS.BASE;
    var growthPercent = typeof options.growthPercent === "number" ? options.growthPercent : 0;
    var tariffs = options.tariffs || getTariffsForHotelAndYear(options.tariffsCatalog, hotel, targetYear);

    var targetMonthly = {};
    var overallTarget = {
      targetReservas: 0,
      targetPax: 0,
      targetPernoctaciones: 0,
      targetRoomNights: 0,
      targetRevenue: 0,
      byCategory: { individual: 0, doble: 0, triple: 0, cuadruple: 0 },
      byRegimen: { HA: 0, HD: 0, MP: 0, PC: 0 },
      isProvisional: historicalData.overall ? !!historicalData.overall.hasProvisionalData : false,
      scenario: scenario,
      growthPercent: growthPercent,
      hotel: hotel,
      targetYear: targetYear,
      baseYear: baseYear
    };

    var histMonthly = historicalData.monthly || {};
    var factor = 1 + growthPercent / 100;

    for (var m = 1; m <= 12; m++) {
      var h = histMonthly[m] || {
        reservasCount: 0, pax: 0, pernoctaciones: 0, roomNights: 0,
        regimenCategoryMatrix: {
          HA: { individual: 0, doble: 0, triple: 0, cuadruple: 0 },
          HD: { individual: 0, doble: 0, triple: 0, cuadruple: 0 },
          MP: { individual: 0, doble: 0, triple: 0, cuadruple: 0 },
          PC: { individual: 0, doble: 0, triple: 0, cuadruple: 0 }
        },
        isProvisional: false
      };

      var tReservas = Math.round(h.reservasCount * factor);
      var tPax = Math.round(h.pax * factor);
      var tPernoctaciones = Math.round(h.pernoctaciones * factor);

      // Escalar la matriz de régimen y categoría
      var targetMatrix = {};
      var tRoomNights = 0;
      var tByCat = { individual: 0, doble: 0, triple: 0, cuadruple: 0 };
      var tByReg = { HA: 0, HD: 0, MP: 0, PC: 0 };

      for (var rIdx = 0; rIdx < REGIMEN_TYPES.length; rIdx++) {
        var regCode = REGIMEN_TYPES[rIdx];
        targetMatrix[regCode] = {};
        for (var cIdx = 0; cIdx < ROOM_CATEGORIES.length; cIdx++) {
          var catCode = ROOM_CATEGORIES[cIdx];
          var baseNights = (h.regimenCategoryMatrix && h.regimenCategoryMatrix[regCode])
            ? (h.regimenCategoryMatrix[regCode][catCode] || 0)
            : 0;

          // Si Cumbria, cuádruples son siempre 0
          var nights = (hotel === "cumbria" && catCode === "cuadruple")
            ? 0
            : Math.round(baseNights * factor);

          targetMatrix[regCode][catCode] = nights;
          tRoomNights += nights;
          tByCat[catCode] += nights;
          tByReg[regCode] += nights;
        }
      }

      // Calcular ingresos previstos con tarifas (Req 27)
      var revCalc = calculateTargetRevenue(targetMatrix, tariffs);

      // Override manual si existe para este mes
      var monthRev = revCalc.totalRevenue;
      var monthRN = tRoomNights;
      var monthPax = tPax;
      var isManual = false;

      if (options.manualOverrides && options.manualOverrides[m]) {
        var mo = options.manualOverrides[m];
        if (mo.targetRevenue !== undefined && mo.targetRevenue !== null && !isNaN(Number(mo.targetRevenue))) {
          monthRev = Math.round(Number(mo.targetRevenue) * 100) / 100;
          isManual = true;
        }
        if (mo.targetRoomNights !== undefined && mo.targetRoomNights !== null && !isNaN(Number(mo.targetRoomNights))) {
          monthRN = Math.round(Number(mo.targetRoomNights));
          isManual = true;
        }
        if (mo.targetPax !== undefined && mo.targetPax !== null && !isNaN(Number(mo.targetPax))) {
          monthPax = Math.round(Number(mo.targetPax));
          isManual = true;
        }
      }

      // Opciones de redondeo de ingresos si se requiere
      if (options.revenueRounding) {
        var rr = String(options.revenueRounding).toLowerCase();
        if (rr === "integer" || rr === "1" || rr === "entero") {
          monthRev = Math.round(monthRev);
        } else if (rr === "100") {
          monthRev = Math.round(monthRev / 100) * 100;
        } else if (rr === "1000") {
          monthRev = Math.round(monthRev / 1000) * 1000;
        }
      }

      targetMonthly[m] = {
        month: m,
        targetReservas: tReservas,
        targetPax: monthPax,
        targetPernoctaciones: monthPax,
        targetRoomNights: monthRN,
        targetRevenue: monthRev,
        byCategory: tByCat,
        byRegimen: tByReg,
        regimenCategoryMatrix: targetMatrix,
        revenueByRegimen: revCalc.byRegimen,
        revenueByCategory: revCalc.byCategory,
        isProvisional: !!h.isProvisional || !!h.hasProvisionalData,
        isManualOverride: isManual
      };

      overallTarget.targetReservas += tReservas;
      overallTarget.targetPax += monthPax;
      overallTarget.targetPernoctaciones += monthPax;
      overallTarget.targetRoomNights += monthRN;
      overallTarget.targetRevenue = Math.round((overallTarget.targetRevenue + monthRev) * 100) / 100;

      for (var cat in tByCat) {
        overallTarget.byCategory[cat] += tByCat[cat];
      }
      for (var reg in tByReg) {
        overallTarget.byRegimen[reg] += tByReg[reg];
      }
    }

    return {
      hotel: hotel,
      targetYear: targetYear,
      baseYear: baseYear,
      scenario: scenario,
      growthPercent: growthPercent,
      monthly: targetMonthly,
      overall: overallTarget,
      tariffsUsed: tariffs
    };
  }

  // ── 7. COMPARADOR REAL VS OBJETIVO (Requisitos 30 y 31) ───────────────

  /**
   * Compara los datos reales contra el objetivo y calcula:
   * - Diferencia = Real - Objetivo
   * - % Cumplimiento = (Real / Objetivo) * 100
   * Protegido frente a división por cero si el objetivo es 0.
   */
  function compareRealVsTarget(realData, targetData) {
    var monthlyComparison = {};
    var totalRealRev = 0, totalObjRev = 0;
    var totalRealRN = 0, totalObjRN = 0;
    var totalRealPax = 0, totalObjPax = 0;
    var totalRealRes = 0, totalObjRes = 0;

    var realMonthly = (realData && realData.monthly) ? realData.monthly : {};
    var targetMonthly = (targetData && targetData.monthly) ? targetData.monthly : {};

    for (var m = 1; m <= 12; m++) {
      var r = realMonthly[m] || {
        reservasCount: 0, pax: 0, roomNights: 0, totalRevenue: 0, isProvisional: false
      };
      var t = targetMonthly[m] || {
        targetReservas: 0, targetPax: 0, targetRoomNights: 0, targetRevenue: 0, isProvisional: false
      };

      var realRev = Number(r.totalRevenue || 0);
      var objRev = Number(t.targetRevenue || 0);
      var realRN = Number(r.roomNights || 0);
      var objRN = Number(t.targetRoomNights || 0);
      var realPax = Number(r.pax || 0);
      var objPax = Number(t.targetPax || 0);
      var realRes = Number(r.reservasCount || 0);
      var objRes = Number(t.targetReservas || 0);

      // % Cumplimiento seguro (sin división entre cero)
      var compRevenue = objRev > 0 ? Math.round((realRev / objRev) * 10000) / 100 : (realRev > 0 ? 100.0 : 0.0);
      var compRN = objRN > 0 ? Math.round((realRN / objRN) * 10000) / 100 : (realRN > 0 ? 100.0 : 0.0);
      var compPax = objPax > 0 ? Math.round((realPax / objPax) * 10000) / 100 : (realPax > 0 ? 100.0 : 0.0);
      var compRes = objRes > 0 ? Math.round((realRes / objRes) * 10000) / 100 : (realRes > 0 ? 100.0 : 0.0);

      monthlyComparison[m] = {
        month: m,
        real: {
          reservas: realRes,
          pax: realPax,
          roomNights: realRN,
          revenue: realRev
        },
        target: {
          reservas: objRes,
          pax: objPax,
          roomNights: objRN,
          revenue: objRev
        },
        diff: {
          reservas: realRes - objRes,
          pax: realPax - objPax,
          roomNights: realRN - objRN,
          revenue: Math.round((realRev - objRev) * 100) / 100
        },
        compliancePercent: {
          revenue: compRevenue,
          roomNights: compRN,
          pax: compPax,
          reservas: compRes
        },
        status: (r.isProvisional || t.isProvisional) ? "Provisional" : "Definitivo"
      };

      totalRealRev += realRev;
      totalObjRev += objRev;
      totalRealRN += realRN;
      totalObjRN += objRN;
      totalRealPax += realPax;
      totalObjPax += objPax;
      totalRealRes += realRes;
      totalObjRes += objRes;
    }

    var totalCompRevenue = totalObjRev > 0 ? Math.round((totalRealRev / totalObjRev) * 10000) / 100 : (totalRealRev > 0 ? 100.0 : 0.0);
    var totalCompRN = totalObjRN > 0 ? Math.round((totalRealRN / totalObjRN) * 10000) / 100 : (totalRealRN > 0 ? 100.0 : 0.0);
    var totalCompPax = totalObjPax > 0 ? Math.round((totalRealPax / totalObjPax) * 10000) / 100 : (totalRealPax > 0 ? 100.0 : 0.0);
    var totalCompRes = totalObjRes > 0 ? Math.round((totalRealRes / totalObjRes) * 10000) / 100 : (totalRealRes > 0 ? 100.0 : 0.0);

    return {
      monthly: monthlyComparison,
      totals: {
        real: {
          reservas: totalRealRes,
          pax: totalRealPax,
          roomNights: totalRealRN,
          revenue: Math.round(totalRealRev * 100) / 100
        },
        target: {
          reservas: totalObjRes,
          pax: totalObjPax,
          roomNights: totalObjRN,
          revenue: Math.round(totalObjRev * 100) / 100
        },
        diff: {
          reservas: totalRealRes - totalObjRes,
          pax: totalRealPax - totalObjPax,
          roomNights: totalRealRN - totalObjRN,
          revenue: Math.round((totalRealRev - totalObjRev) * 100) / 100
        },
        compliancePercent: {
          revenue: totalCompRevenue,
          roomNights: totalCompRN,
          pax: totalCompPax,
          reservas: totalCompRes
        },
        status: ((realData.overall && realData.overall.hasProvisionalData) || (targetData.overall && targetData.overall.isProvisional))
          ? "Provisional"
          : "Definitivo"
      }
    };
  }

  // ── 8. VALIDACIONES DE INTEGRIDAD (Requisito 33) ──────────────────────

  /**
   * Valida la coherencia de un objetivo y su catálogo de tarifas
   * - Comprueba que existan tarifas para el hotel y año
   * - Bloquea habitaciones cuádruples en Cumbria
   * - Bloquea objetivos con números negativos
   * - Advierte si contiene datos provisionales
   */
  function validateTargetIntegrity(targetObj, tariffs) {
    var errors = [];
    var warnings = [];

    if (!targetObj) {
      errors.push("El objeto de objetivo está vacío.");
      return { valid: false, errors: errors, warnings: warnings };
    }

    var hotel = normalizeHotelKey(targetObj.hotel);

    // Comprobar existencia de tarifas
    if (!tariffs) {
      errors.push("No existen tarifas configuradas para el hotel " + hotel + ".");
    }

    // Validar celdas y reglas específicas
    if (targetObj.monthly) {
      for (var m = 1; m <= 12; m++) {
        var mItem = targetObj.monthly[m];
        if (!mItem) continue;

        if (mItem.targetRoomNights < 0 || mItem.targetPax < 0 || mItem.targetRevenue < 0) {
          errors.push("El mes " + m + " tiene valores negativos en los objetivos.");
        }

        // Regla Requisito 26 y 33: Cumbria no dispone de cuádruples
        if (hotel === "cumbria") {
          var cuaNights = (mItem.byCategory && mItem.byCategory.cuadruple) || 0;
          if (cuaNights > 0) {
            errors.push("El Hotel Cumbria no dispone de habitaciones cuádruples (Mes " + m + ").");
          }
        }

        if (mItem.isProvisional) {
          warnings.push("El mes " + m + " se ha calculado con datos provisionales de habitaciones.");
        }
      }
    }

    if (hotel === "cumbria" && tariffs) {
      for (var reg in tariffs) {
        if (tariffs.hasOwnProperty(reg) && tariffs[reg].cuadruple !== null && tariffs[reg].cuadruple !== undefined) {
          warnings.push("Las tarifas de Cumbria no deberían incluir precio para cuádruples.");
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  // ── 9. PERSISTENCIA DESACOPLADA (Requisito 32) ────────────────────────

  var FIRESTORE_COLLECTIONS = {
    TARGETS: "groupTargets",
    TARIFFS: "groupTariffs",
    SCENARIOS: "groupTargetScenarios"
  };

  /**
   * Genera el documento estructurado para persistencia en Firestore
   */
  function prepareTargetDocumentForSave(targetData, userEmail, options) {
    options = options || {};
    var isOfficial = options.isOfficial !== undefined ? !!options.isOfficial : true;
    var manualOverrides = options.manualOverrides || targetData.manualOverrides || null;
    return {
      hotel: targetData.hotel,
      targetYear: targetData.targetYear,
      baseYear: targetData.baseYear,
      scenario: targetData.scenario,
      growthPercent: targetData.growthPercent,
      monthly: targetData.monthly,
      overall: targetData.overall,
      tariffsVersion: targetData.tariffsUsed ? "v_" + targetData.targetYear : "default",
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || "system",
      status: targetData.overall && targetData.overall.isProvisional ? "Provisional" : "Definitivo",
      isOfficial: isOfficial,
      officialSavedAt: isOfficial ? (options.officialSavedAt || new Date().toISOString()) : null,
      officialSavedBy: isOfficial ? (options.officialSavedBy || userEmail || "Dirección Comercial") : null,
      manualOverrides: manualOverrides
    };
  }

  // ── 10. EXPORTACIÓN DEL MÓDULO ────────────────────────────────────────

  var GroupTargetsService = {
    DEFAULT_GROUP_TARIFFS_2027: DEFAULT_GROUP_TARIFFS_2027,
    CATEGORY_OCCUPANTS: CATEGORY_OCCUPANTS,
    ROOM_CATEGORIES: ROOM_CATEGORIES,
    REGIMEN_TYPES: REGIMEN_TYPES,
    SCENARIOS: SCENARIOS,
    SCENARIO_DEFAULTS: SCENARIO_DEFAULTS,
    FIRESTORE_COLLECTIONS: FIRESTORE_COLLECTIONS,

    roundPrice: roundPrice,
    normalizeHotelKey: normalizeHotelKey,
    calculatePricePerPerson: calculatePricePerPerson,
    enrichTariffsWithPricePerPerson: enrichTariffsWithPricePerPerson,
    getTariffsForHotelAndYear: getTariffsForHotelAndYear,
    isOfficialTariff: isOfficialTariff,
    copyTariffsWithAdjustment: copyTariffsWithAdjustment,
    suggestTariffsForYear: suggestTariffsForYear,
    calculateTargetRevenue: calculateTargetRevenue,
    aggregateHistoricalGroupData: aggregateHistoricalGroupData,
    generateTargetFromHistorical: generateTargetFromHistorical,
    compareRealVsTarget: compareRealVsTarget,
    validateTargetIntegrity: validateTargetIntegrity,
    prepareTargetDocumentForSave: prepareTargetDocumentForSave
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = GroupTargetsService;
  }
  if (typeof window !== "undefined") {
    window.GroupTargetsService = GroupTargetsService;
  }

})(typeof window !== "undefined" ? window : global);
