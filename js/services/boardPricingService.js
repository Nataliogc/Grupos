/**
 * ═════════════════════════════════════════════════════════════════════
 * NEXUS GROUPS — Board Pricing & Economic Breakdown Service (Reqs 13-21)
 * ═════════════════════════════════════════════════════════════════════
 * Pure functions for:
 * 1. Board pricing configuration per hotel & validity period (Req 13).
 * 2. Regimen interpretation: HA, HD, MP, PC and custom aliases (Req 14).
 * 3. Daily economic breakdown: Net Accommodation = Total - Board costs (Req 15).
 * 4. Negative accommodation detection & warnings (Req 16).
 * 5. Real occupancy board calculation: strictly per actual person (Req 17).
 * 6. Daily financial breakdown: Total, Breakfast, Meals, Net Room (Req 18).
 * 7. Aggregate economic statistics: ADR, RevPAB, Regimen, and Category (Req 19).
 * 8. Pricing versioning & decoupled distribution persistence (Req 20).
 * 9. Statistical room category distribution (room-nights weighted ADR) (Req 21).
 *
 * Supports both Browser and Node.js environments.
 * ═════════════════════════════════════════════════════════════════════
 */

(function (global) {
  "use strict";

  // Precios predeterminados de manutención por persona
  var DEFAULT_BOARD_PRICES = {
    breakfast: 6.0,
    meal: 16.0
  };

  // Catálogo base de regímenes: número de desayunos y comidas por persona y día
  var DEFAULT_REGIMEN_MEALS = {
    HA: { breakfasts: 0, meals: 0, label: "Solo Alojamiento" },
    SA: { breakfasts: 0, meals: 0, label: "Solo Alojamiento" },
    HD: { breakfasts: 1, meals: 0, label: "Alojamiento y Desayuno" },
    AD: { breakfasts: 1, meals: 0, label: "Alojamiento y Desayuno" },
    BB: { breakfasts: 1, meals: 0, label: "Bed & Breakfast" },
    MP: { breakfasts: 1, meals: 1, label: "Media Pensión" },
    HB: { breakfasts: 1, meals: 1, label: "Half Board" },
    PC: { breakfasts: 1, meals: 2, label: "Pensión Completa" },
    FB: { breakfasts: 1, meals: 2, label: "Full Board" }
  };

  /**
   * Normaliza el código de régimen recibido
   */
  function normalizeRegimenCode(rawRegimen) {
    if (!rawRegimen) return "HA";
    var s = String(rawRegimen).trim().toUpperCase();
    if (s.includes("PENSION COMPLETA") || s.includes("PENSIÓN COMPLETA") || s === "PC" || s === "FB") return "PC";
    if (s.includes("MEDIA PENSION") || s.includes("MEDIA PENSIÓN") || s === "MP" || s === "HB") return "MP";
    if (s.includes("DESAYUNO") || s === "HD" || s === "AD" || s === "BB") return "HD";
    if (s.includes("SOLO ALOJAMIENTO") || s.includes("SÓLO ALOJAMIENTO") || s === "HA" || s === "SA") return "HA";
    return s;
  }

  /**
   * Obtiene la cantidad de desayunos y comidas por persona según el régimen
   */
  function getMealCounts(regimenCode, customMapping) {
    var code = normalizeRegimenCode(regimenCode);
    if (customMapping && customMapping[code]) {
      return {
        breakfasts: parseInt(customMapping[code].breakfasts, 10) || 0,
        meals: parseInt(customMapping[code].meals, 10) || 0
      };
    }
    if (DEFAULT_REGIMEN_MEALS[code]) {
      return {
        breakfasts: DEFAULT_REGIMEN_MEALS[code].breakfasts,
        meals: DEFAULT_REGIMEN_MEALS[code].meals
      };
    }
    // Fallback por defecto si no se reconoce: Solo alojamiento
    return { breakfasts: 0, meals: 0 };
  }

  /**
   * Obtiene la configuración de precios activa para un hotel y fecha dada
   */
  function getPricingForHotelAndDate(hotelName, dateStr, configMap) {
    configMap = configMap || {};
    var defaultCfg = {
      breakfast: DEFAULT_BOARD_PRICES.breakfast,
      meal: DEFAULT_BOARD_PRICES.meal,
      version: "default-v1.0"
    };

    if (!hotelName) return defaultCfg;

    var hotelConfig = configMap[hotelName] || configMap["default"] || null;
    if (!hotelConfig) return defaultCfg;

    // Si tiene periodos de vigencia
    if (Array.isArray(hotelConfig.periods) && hotelConfig.periods.length > 0 && dateStr) {
      for (var i = 0; i < hotelConfig.periods.length; i++) {
        var p = hotelConfig.periods[i];
        var from = p.from || "1900-01-01";
        var to = p.to || "2099-12-31";
        if (dateStr >= from && dateStr <= to) {
          return {
            breakfast: typeof p.breakfast === "number" ? p.breakfast : DEFAULT_BOARD_PRICES.breakfast,
            meal: typeof p.meal === "number" ? p.meal : DEFAULT_BOARD_PRICES.meal,
            version: p.version || ("period-" + from + "_" + to)
          };
        }
      }
    }

    return {
      breakfast: typeof hotelConfig.breakfast === "number" ? hotelConfig.breakfast : DEFAULT_BOARD_PRICES.breakfast,
      meal: typeof hotelConfig.meal === "number" ? hotelConfig.meal : DEFAULT_BOARD_PRICES.meal,
      version: hotelConfig.version || "hotel-default"
    };
  }

  /**
   * ── DESGLOSE ECONÓMICO DIARIO (Reqs 15, 16, 17, 18) ───────────────
   * Parámetros:
   *   - pax: número de personas reales alojadas ese día (Ocupación real, Req 17)
   *   - regimen: código de régimen (HA, HD, MP, PC...)
   *   - dailyAmount: importe total del día (Importe total / Noches)
   *   - pricingConfig: { breakfast: number, meal: number, version: string }
   */
  function calculateDailyEconomicBreakdown(params) {
    var pax = parseInt(params.pax, 10) || 0;
    var regimen = params.regimen || "HA";
    var dailyAmount = parseFloat(params.dailyAmount) || 0.0;
    var pricingConfig = params.pricingConfig || DEFAULT_BOARD_PRICES;

    var breakfastPrice = typeof pricingConfig.breakfast === "number" ? pricingConfig.breakfast : DEFAULT_BOARD_PRICES.breakfast;
    var mealPrice = typeof pricingConfig.meal === "number" ? pricingConfig.meal : DEFAULT_BOARD_PRICES.meal;
    var version = pricingConfig.version || "default";

    var mealCounts = getMealCounts(regimen, params.customRegimenMapping);

    // Ocupación real: el cálculo se hace por personas reales, no camas (Req 17)
    var breakfastCost = pax * mealCounts.breakfasts * breakfastPrice;
    var mealCost = pax * mealCounts.meals * mealPrice;
    var totalBoardCost = breakfastCost + mealCost;

    // Precio habitación neto = Precio total − Coste manutención (Req 15)
    // No redondear hasta el resultado final
    var netAccommodationPrice = dailyAmount - totalBoardCost;

    // Alerta si el precio es negativo (Req 16)
    var isNegative = netAccommodationPrice < -0.0001;
    var warning = isNegative ? "El precio total es inferior al coste configurado de manutención." : null;

    return {
      pax: pax,
      regimen: normalizeRegimenCode(regimen),
      dailyAmount: dailyAmount,
      breakfastPrice: breakfastPrice,
      mealPrice: mealPrice,
      breakfastsCount: mealCounts.breakfasts,
      mealsCount: mealCounts.meals,
      breakfastCost: breakfastCost,
      mealCost: mealCost,
      totalBoardCost: totalBoardCost,
      netAccommodationPrice: netAccommodationPrice,
      isNegativeAccommodation: isNegative,
      warning: warning,
      pricingVersion: version
    };
  }

  /**
   * ── CRITERIO PARA ESTADÍSTICAS POR CATEGORÍA (Req 21) ─────────────
   * Si el Excel no proporciona precios diferenciados por categoría:
   * 1. Habitaciones-noche de cada categoría (Ind, Dbl, Tpl, Cua).
   * 2. Precio medio habitación-noche = Alojamiento neto total ÷ Total habitaciones-noche.
   * 3. Ingreso categoría = Hab-noche categoría × Precio medio habitación-noche.
   * 4. Etiqueta: "Reparto estadístico estimado" (o "Provisional" si propuesta/pendiente).
   */
  function calculateCategoryEstimatedRevenue(stats) {
    var indNights = stats.indNights || 0;
    var dblNights = stats.dblNights || 0;
    var tplNights = stats.tplNights || 0;
    var cuaNights = stats.cuaNights || 0;
    var totalRoomNights = indNights + dblNights + tplNights + cuaNights;
    var netAccommodationTotal = stats.netAccommodationTotal || 0.0;
    var isDefinitive = Boolean(stats.isDefinitive);

    var avgRoomPrice = totalRoomNights > 0 ? (netAccommodationTotal / totalRoomNights) : 0.0;

    return {
      totalRoomNights: totalRoomNights,
      netAccommodationTotal: netAccommodationTotal,
      avgRoomPrice: avgRoomPrice,
      categories: {
        individuales: {
          roomNights: indNights,
          revenue: indNights * avgRoomPrice,
          tag: isDefinitive ? "Reparto estadístico estimado" : "Provisional"
        },
        dobles: {
          roomNights: dblNights,
          revenue: dblNights * avgRoomPrice,
          tag: isDefinitive ? "Reparto estadístico estimado" : "Provisional"
        },
        triples: {
          roomNights: tplNights,
          revenue: tplNights * avgRoomPrice,
          tag: isDefinitive ? "Reparto estadístico estimado" : "Provisional"
        },
        cuadruples: {
          roomNights: cuaNights,
          revenue: cuaNights * avgRoomPrice,
          tag: isDefinitive ? "Reparto estadístico estimado" : "Provisional"
        }
      },
      tag: isDefinitive ? "Reparto estadístico estimado" : "Provisional"
    };
  }

  /**
   * ── AGREGACIÓN DE ESTADÍSTICAS ECONÓMICAS COMPLETAS (Req 19 y 21) ──
   */
  function calculateEconomicStatistics(dailyOccupancyList, configMap) {
    var totals = {
      totalRevenue: 0.0,
      totalAccommodationNet: 0.0,
      totalBreakfastRevenue: 0.0,
      totalMealsRevenue: 0.0,
      totalPax: 0,
      totalDefinitiveRoomNights: 0,
      totalProposedRoomNights: 0,
      negativeAlertCount: 0,
      byRegimen: {
        HA: { pax: 0, revenue: 0.0, netAccommodation: 0.0, breakfast: 0.0, meals: 0.0, roomNights: 0 },
        HD: { pax: 0, revenue: 0.0, netAccommodation: 0.0, breakfast: 0.0, meals: 0.0, roomNights: 0 },
        MP: { pax: 0, revenue: 0.0, netAccommodation: 0.0, breakfast: 0.0, meals: 0.0, roomNights: 0 },
        PC: { pax: 0, revenue: 0.0, netAccommodation: 0.0, breakfast: 0.0, meals: 0.0, roomNights: 0 },
        OTROS: { pax: 0, revenue: 0.0, netAccommodation: 0.0, breakfast: 0.0, meals: 0.0, roomNights: 0 }
      },
      byCategoryConfirmed: {
        indNights: 0,
        dblNights: 0,
        tplNights: 0,
        cuaNights: 0,
        netAccommodationTotal: 0.0
      },
      byCategoryAll: {
        indNights: 0,
        dblNights: 0,
        tplNights: 0,
        cuaNights: 0,
        netAccommodationTotal: 0.0
      }
    };

    (dailyOccupancyList || []).forEach(function (dayItem) {
      var isAnulada = String(dayItem.estadoReserva || "").toLowerCase().includes("anul");
      if (isAnulada) return; // Las anuladas no suman a estadísticas de ingresos

      var pax = dayItem.pax || 0;
      totals.totalPax += pax;

      // Calcular importe diario correspondiente a este registro
      var dailyAmount = 0.0;
      if (dayItem.contributingLines && dayItem.contributingLines.length > 0) {
        dayItem.contributingLines.forEach(function (line) {
          var noches = parseInt(line.noches, 10) || 1;
          if (noches <= 0) noches = 1;
          var lineImp = parseFloat(line.importe) || 0.0;
          dailyAmount += (lineImp / noches);
        });
      } else if (dayItem.dailyAmount) {
        dailyAmount = parseFloat(dayItem.dailyAmount) || 0.0;
      }

      var pricing = getPricingForHotelAndDate(dayItem.hotel, dayItem.fecha, configMap);
      var eco = calculateDailyEconomicBreakdown({
        pax: pax,
        regimen: dayItem.regimen,
        dailyAmount: dailyAmount,
        pricingConfig: pricing
      });

      totals.totalRevenue += eco.dailyAmount;
      totals.totalAccommodationNet += eco.netAccommodationPrice;
      totals.totalBreakfastRevenue += eco.breakfastCost;
      totals.totalMealsRevenue += eco.mealCost;

      if (eco.isNegativeAccommodation) {
        totals.negativeAlertCount++;
      }

      // Regímenes
      var regKey = ["HA", "SA"].includes(eco.regimen) ? "HA" :
                   ["HD", "AD", "BB"].includes(eco.regimen) ? "HD" :
                   ["MP", "HB"].includes(eco.regimen) ? "MP" :
                   ["PC", "FB"].includes(eco.regimen) ? "PC" : "OTROS";

      var regBucket = totals.byRegimen[regKey];
      regBucket.pax += pax;
      regBucket.revenue += eco.dailyAmount;
      regBucket.netAccommodation += eco.netAccommodationPrice;
      regBucket.breakfast += eco.breakfastCost;
      regBucket.meals += eco.mealCost;

      var isDefinitive = dayItem.isDefinitive === true || dayItem.distributionStatus === "confirmada" || dayItem.distributionStatus === "modificada" || dayItem.distributionStatus === "validada_sin_cambios";

      var ind = parseInt(dayItem.individuales, 10) || 0;
      var dbl = parseInt(dayItem.dobles, 10) || 0;
      var tpl = parseInt(dayItem.triples, 10) || 0;
      var cua = parseInt(dayItem.cuadruples, 10) || 0;
      var rooms = ind + dbl + tpl + cua;

      if (isDefinitive) {
        totals.totalDefinitiveRoomNights += rooms;
        regBucket.roomNights += rooms;
        totals.byCategoryConfirmed.indNights += ind;
        totals.byCategoryConfirmed.dblNights += dbl;
        totals.byCategoryConfirmed.tplNights += tpl;
        totals.byCategoryConfirmed.cuaNights += cua;
        totals.byCategoryConfirmed.netAccommodationTotal += eco.netAccommodationPrice;
      } else {
        totals.totalProposedRoomNights += (dayItem.proposal?.totalHabitaciones || rooms);
      }

      totals.byCategoryAll.indNights += ind;
      totals.byCategoryAll.dblNights += dbl;
      totals.byCategoryAll.tplNights += tpl;
      totals.byCategoryAll.cuaNights += cua;
      totals.byCategoryAll.netAccommodationTotal += eco.netAccommodationPrice;
    });

    // ADR y RevPAB
    var adr = totals.totalDefinitiveRoomNights > 0 
      ? (totals.byCategoryConfirmed.netAccommodationTotal / totals.totalDefinitiveRoomNights) 
      : 0.0;

    var avgPricePerPerson = totals.totalPax > 0 
      ? (totals.totalRevenue / totals.totalPax) 
      : 0.0;

    // Desglose por categoría (Req 21)
    var categoryConfirmedEstimate = calculateCategoryEstimatedRevenue({
      indNights: totals.byCategoryConfirmed.indNights,
      dblNights: totals.byCategoryConfirmed.dblNights,
      tplNights: totals.byCategoryConfirmed.tplNights,
      cuaNights: totals.byCategoryConfirmed.cuaNights,
      netAccommodationTotal: totals.byCategoryConfirmed.netAccommodationTotal,
      isDefinitive: true
    });

    var categoryProvisionalEstimate = calculateCategoryEstimatedRevenue({
      indNights: totals.byCategoryAll.indNights,
      dblNights: totals.byCategoryAll.dblNights,
      tplNights: totals.byCategoryAll.tplNights,
      cuaNights: totals.byCategoryAll.cuaNights,
      netAccommodationTotal: totals.byCategoryAll.netAccommodationTotal,
      isDefinitive: false
    });

    return {
      totalRevenue: totals.totalRevenue,
      totalAccommodationNet: totals.totalAccommodationNet,
      totalBreakfastRevenue: totals.totalBreakfastRevenue,
      totalMealsRevenue: totals.totalMealsRevenue,
      totalPax: totals.totalPax,
      totalDefinitiveRoomNights: totals.totalDefinitiveRoomNights,
      totalProposedRoomNights: totals.totalProposedRoomNights,
      negativeAlertCount: totals.negativeAlertCount,
      adr: adr,
      avgPricePerPerson: avgPricePerPerson,
      byRegimen: totals.byRegimen,
      categoryStatsConfirmed: categoryConfirmedEstimate,
      categoryStatsAll: categoryProvisionalEstimate
    };
  }

  // ── Public Export ───────────────────────────────────────────
  var BoardPricingService = {
    DEFAULT_BOARD_PRICES: DEFAULT_BOARD_PRICES,
    DEFAULT_REGIMEN_MEALS: DEFAULT_REGIMEN_MEALS,
    normalizeRegimenCode: normalizeRegimenCode,
    getMealCounts: getMealCounts,
    getPricingForHotelAndDate: getPricingForHotelAndDate,
    calculateDailyEconomicBreakdown: calculateDailyEconomicBreakdown,
    calculateCategoryEstimatedRevenue: calculateCategoryEstimatedRevenue,
    calculateEconomicStatistics: calculateEconomicStatistics
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = BoardPricingService;
  }
  if (typeof window !== "undefined") {
    window.BoardPricingService = BoardPricingService;
  }

})(typeof window !== "undefined" ? window : global);
