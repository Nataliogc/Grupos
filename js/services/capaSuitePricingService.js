/**
 * CapaSuitePricingService
 * 
 * Servicio para integrar las tarifas del hotel desde CapaSuite con la cotización de grupos:
 * 1. Obtiene el precio de habitación del hotel para cada día de estancia (PVP/BAR desde revenue_data_v2, hotel_manager_db_v2 o benchmark estacional).
 * 2. Compara con la tarifa oficial de grupos (catálogo de objetivos).
 * 3. Calcula la tarifa recomendada aplicando un descuento comercial configurable (por defecto 15%).
 * 4. Permite aplicar la tarifa oficial o la recomendada con 1 solo clic.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CapaSuitePricingService = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_DISCOUNT_PERCENT = 15;

  function safeGetStorage(key) {
    if (typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem('v3_' + key) || localStorage.getItem(key) || null;
    } catch (e) {
      return null;
    }
  }

  function normalizeHotelKey(hotel) {
    if (!hotel) return 'guadiana';
    var h = String(hotel).toLowerCase().trim();
    if (h.indexOf('cumbria') !== -1) return 'cumbria';
    return 'guadiana';
  }

  /**
   * Obtiene el precio de la habitación del hotel para una fecha específica desde CapaSuite.
   * Prioridad de búsqueda:
   * 1. revenue_data_v2 (PVP/BAR extraído de scraping o cargado en calendario)
   * 2. hotel_manager_db_v2 (OTB / ADR de producción)
   * 3. Benchmark estacional inteligente basado en ocupación y fin de semana de Ciudad Real.
   */
  function getCapaSuiteHotelDayPrice(hotelName, dateISO) {
    if (!dateISO) {
      return { price: 85, source: 'Tarifa Base Estándar', isEstimated: true };
    }

    var hotelKey = normalizeHotelKey(hotelName);
    var isCumbria = hotelKey === 'cumbria';

    // 1. Intentar leer de revenue_data_v2
    try {
      var rawRev = safeGetStorage('revenue_data_v2');
      if (rawRev) {
        var parsedRev = typeof rawRev === 'string' ? JSON.parse(rawRev) : rawRev;
        var dayData = null;
        if (parsedRev) {
          if (Array.isArray(parsedRev.data)) {
            dayData = parsedRev.data.find(function (d) { return d && d.dateISO === dateISO; });
          } else if (typeof parsedRev === 'object') {
            dayData = parsedRev[dateISO] || (parsedRev.data && parsedRev.data[dateISO]);
          }
        }

        if (dayData) {
          // Buscar en hotels (PVP retail del día)
          if (dayData.hotels && typeof dayData.hotels === 'object') {
            var hotelEntry = Object.entries(dayData.hotels).find(function (entry) {
              var h = entry[0].toLowerCase();
              return isCumbria ? h.indexOf('cumbria') !== -1 : (h.indexOf('guadiana') !== -1 || h.indexOf('sercotel') !== -1);
            });
            if (hotelEntry) {
              var val = hotelEntry[1];
              var p = typeof val === 'object' ? (val.price || 0) : (Number(val) || 0);
              var isSold = typeof val === 'object' && (val.sold === true || val.soldOut === true);
              if (p > 0 && !isSold) {
                return {
                  price: Math.round(p * 100) / 100,
                  source: 'PVP CapaSuite (' + hotelEntry[0] + ')',
                  isEstimated: false,
                  hotel: hotelName,
                  dateISO: dateISO
                };
              }
            }
          }

          // Buscar en occupancyData (ADR registrado del hotel)
          if (dayData.occupancyData && typeof dayData.occupancyData === 'object') {
            var occKey = Object.keys(dayData.occupancyData).find(function (k) {
              var lower = k.toLowerCase();
              return isCumbria ? lower.indexOf('cumbria') !== -1 : lower.indexOf('guadiana') !== -1;
            });
            if (occKey && dayData.occupancyData[occKey] && dayData.occupancyData[occKey].adr > 0) {
              var adr = Math.round(dayData.occupancyData[occKey].adr);
              return {
                price: adr,
                source: 'ADR CapaSuite (' + occKey + ')',
                isEstimated: false,
                hotel: hotelName,
                dateISO: dateISO
              };
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error leyendo revenue_data_v2 en CapaSuitePricingService:', e);
    }

    // 2. Intentar leer de hotel_manager_db_v2
    try {
      var rawProd = safeGetStorage('hotel_manager_db_v2');
      if (rawProd) {
        var parsedProd = typeof rawProd === 'string' ? JSON.parse(rawProd) : rawProd;
        if (parsedProd && typeof parsedProd === 'object') {
          var masterKey = Object.keys(parsedProd).find(function (k) {
            var lower = k.toLowerCase();
            return isCumbria ? lower.indexOf('cumbria') !== -1 : lower.indexOf('guadiana') !== -1;
          });
          if (masterKey && parsedProd[masterKey]) {
            var parts = String(dateISO).split('-');
            var year = parts[0];
            var yearData = parsedProd[masterKey][year];
            if (yearData && yearData.daily_otb && yearData.daily_otb[dateISO]) {
              var dotb = yearData.daily_otb[dateISO];
              var priceVal = dotb.price || dotb.adr || 0;
              if (priceVal > 0) {
                return {
                  price: Math.round(priceVal * 100) / 100,
                  source: 'OTB CapaSuite (' + masterKey + ')',
                  isEstimated: false,
                  hotel: hotelName,
                  dateISO: dateISO
                };
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error leyendo hotel_manager_db_v2 en CapaSuitePricingService:', e);
    }

    // 3. Fallback inteligente de mercado CapaSuite (Estacionalidad + Fin de semana)
    var dateParts = String(dateISO).split('-');
    var y = parseInt(dateParts[0], 10) || 2026;
    var m = (parseInt(dateParts[1], 10) || 1) - 1; // 0..11
    var d = parseInt(dateParts[2], 10) || 1;
    var dateObj = new Date(y, m, d);
    var dow = dateObj.getDay(); // 0 Dom, 5 Vie, 6 Sab
    var isWeekend = (dow === 5 || dow === 6);

    var baseRate = isCumbria ? 62 : 68;
    // Primavera-verano y temporada de ferias/eventos (Mayo a Octubre)
    if (m >= 4 && m <= 9) {
      baseRate += 12;
    }
    // Fines de semana tienen mayor presión de demanda ocio
    if (isWeekend) {
      baseRate += 18;
    }
    // Domingos precio valle
    if (dow === 0) {
      baseRate -= 4;
    }

    return {
      price: baseRate,
      source: 'Benchmark CapaSuite (' + (isCumbria ? 'Cumbria' : 'Guadiana') + (isWeekend ? ' Fin de Semana' : '') + ')',
      isEstimated: true,
      hotel: hotelName,
      dateISO: dateISO
    };
  }

  /**
   * Obtiene la comparativa detallada para un día, hotel, régimen y descuento:
   * - Tarifa oficial de grupos para esa fecha
   * - Tarifa de habitación del hotel para ese día
   * - Tarifa recomendada CapaSuite aplicando el descuento
   */
  function getTariffComparison(hotelName, dateISO, boardName, discountPercent, officialGrid) {
    var discount = typeof discountPercent === 'number' && !isNaN(discountPercent)
      ? Math.max(0, Math.min(90, discountPercent))
      : DEFAULT_DISCOUNT_PERCENT;

    var hotelPriceInfo = getCapaSuiteHotelDayPrice(hotelName, dateISO);
    var hotelRoomPrice = hotelPriceInfo.price; // En CapaSuite la tarifa es siempre Solo Alojamiento (HA)

    var boardCode = (boardName || 'HD').split(' ')[0].toUpperCase();
    if (boardCode === 'AD') boardCode = 'HD';
    if (boardCode === 'SA') boardCode = 'HA';

    var hotelKey = normalizeHotelKey(hotelName);
    var isCumbria = hotelKey === 'cumbria';

    // Tipologías disponibles
    var roomTypes = isCumbria
      ? ['DOBLE DE USO INDIVIDUAL', 'DOBLE', 'TRIPLE']
      : ['DOBLE DE USO INDIVIDUAL', 'DOBLE', 'TRIPLE', 'CUÁDRUPLE'];

    // Si no se suministra grid oficial, usar valores por defecto estándar
    var boardTariffs = (officialGrid && officialGrid[boardCode]) ? officialGrid[boardCode] : null;
    var haTariffs = (officialGrid && officialGrid['HA']) ? officialGrid['HA'] : null;

    var officialDoble = (boardTariffs && (boardTariffs['doble'] || boardTariffs['DOBLE']))
      ? Number(boardTariffs['doble'] || boardTariffs['DOBLE'])
      : (isCumbria ? (boardCode === 'HA' ? 63 : 79) : (boardCode === 'HA' ? 65 : 82));

    var discountFactor = (100 - discount) / 100;
    // Tarifa recomendada base de alojamiento (HA) para habitación doble con descuento
    var recDobleHA = Math.round(hotelRoomPrice * discountFactor * 100) / 100;

    // Suplementos de pensión preconfigurados por persona (Desglose oficial)
    // Desayuno: 8.50 € / pax | Almuerzo: 19.50 € / pax | Cena: 19.50 € / pax
    var breakfastPerson = 8.50;
    var mealPerson = 19.50;

    // 1. Intentar leer desde el catálogo oficial de tarifas (nexus_group_tariffs) para este hotel y año
    try {
      var rawCatalog = safeGetStorage('nexus_group_tariffs');
      if (rawCatalog) {
        var parsedCat = typeof rawCatalog === 'string' ? JSON.parse(rawCatalog) : rawCatalog;
        var yKey = dateISO ? String(new Date(dateISO).getFullYear()) : '2027';
        var entryYear = parsedCat[yKey] && (parsedCat[yKey][hotelKey] || parsedCat[yKey][hotelName]);
        if (entryYear && entryYear._desglose) {
          if (typeof entryYear._desglose.breakfast === 'number') breakfastPerson = entryYear._desglose.breakfast;
          if (typeof entryYear._desglose.lunch === 'number') mealPerson = entryYear._desglose.lunch;
          else if (typeof entryYear._desglose.meal === 'number') mealPerson = entryYear._desglose.meal;
        }
      }
    } catch (e) {}

    // 2. Si boardPricingConfig está disponible en localStorage, usar como fallback prioritario
    try {
      var rawBpc = safeGetStorage('boardPricingConfig');
      if (rawBpc) {
        var parsedBpc = typeof rawBpc === 'string' ? JSON.parse(rawBpc) : rawBpc;
        var bpcEntry = parsedBpc[hotelName] || parsedBpc[hotelKey] || parsedBpc['default'];
        if (bpcEntry) {
          if (typeof bpcEntry.breakfast === 'number') breakfastPerson = bpcEntry.breakfast;
          if (typeof bpcEntry.meal === 'number') mealPerson = bpcEntry.meal;
        }
      }
    } catch (e) {}

    var boardSupplementPerPerson = 0;
    if (boardCode === 'HD') {
      boardSupplementPerPerson = breakfastPerson;
    } else if (boardCode === 'MP') {
      boardSupplementPerPerson = breakfastPerson + mealPerson;
    } else if (boardCode === 'PC') {
      boardSupplementPerPerson = breakfastPerson + (mealPerson * 2);
    }

    var officialPricesByRoom = {};
    var recommendedPricesByRoom = {};
    var savingsByRoom = {};

    roomTypes.forEach(function (rt) {
      var rtNorm = rt.toLowerCase();
      var offP = 0;
      if (boardTariffs && boardTariffs[rt] !== undefined && boardTariffs[rt] !== null) {
        offP = Number(boardTariffs[rt]);
      } else if (boardTariffs) {
        if (rtNorm.indexOf('individual') !== -1 || rtNorm.indexOf('dui') !== -1) {
          offP = Number(boardTariffs['individual'] || boardTariffs['ind'] || (officialDoble * 0.9));
        } else if (rtNorm.indexOf('triple') !== -1) {
          offP = Number(boardTariffs['triple'] || (officialDoble * 1.36));
        } else if (rtNorm.indexOf('cuadruple') !== -1 || rtNorm.indexOf('cuádruple') !== -1) {
          offP = isCumbria ? null : Number(boardTariffs['cuadruple'] || (officialDoble * 1.72));
        } else {
          offP = officialDoble;
        }
      } else {
        // Fallbacks según tipología
        if (rtNorm.indexOf('individual') !== -1 || rtNorm.indexOf('dui') !== -1) {
          offP = isCumbria ? (boardCode === 'HA' ? 63 : 71) : (boardCode === 'HA' ? 65 : 73.5);
        } else if (rtNorm.indexOf('triple') !== -1) {
          offP = isCumbria ? (boardCode === 'HA' ? 84.5 : 108.5) : (boardCode === 'HA' ? 86.5 : 112);
        } else if (rtNorm.indexOf('cuadruple') !== -1 || rtNorm.indexOf('cuádruple') !== -1) {
          offP = isCumbria ? null : (boardCode === 'HA' ? 107 : 141);
        } else {
          offP = officialDoble;
        }
      }

      officialPricesByRoom[rt] = offP;

      if (offP === null) {
        recommendedPricesByRoom[rt] = null;
        savingsByRoom[rt] = null;
        return;
      }

      // Ocupantes por tipología para aplicar suplemento por persona
      var pax = 2;
      if (rtNorm.indexOf('individual') !== -1 || rtNorm.indexOf('dui') !== -1) pax = 1;
      else if (rtNorm.indexOf('triple') !== -1) pax = 3;
      else if (rtNorm.indexOf('cuadruple') !== -1 || rtNorm.indexOf('cuádruple') !== -1) pax = 4;

      // Base HA recomendada para esta tipología
      var baseHA = recDobleHA;
      if (pax === 1) {
        // En HA oficial DUI = Doble (100%) o proporcional
        var offDuiHA = haTariffs ? Number(haTariffs['individual'] || haTariffs['ind'] || haTariffs['doble'] || 65) : 65;
        var offDblHA = haTariffs ? Number(haTariffs['doble'] || 65) : 65;
        baseHA = offDblHA > 0 ? (recDobleHA * (offDuiHA / offDblHA)) : recDobleHA;
      } else if (pax === 3) {
        var offTplHA = haTariffs ? Number(haTariffs['triple'] || 86.5) : 86.5;
        var offDblHA = haTariffs ? Number(haTariffs['doble'] || 65) : 65;
        baseHA = offDblHA > 0 ? (recDobleHA * (offTplHA / offDblHA)) : (recDobleHA * 1.33);
      } else if (pax === 4) {
        var offCuaHA = haTariffs ? Number(haTariffs['cuadruple'] || 107) : 107;
        var offDblHA = haTariffs ? Number(haTariffs['doble'] || 65) : 65;
        baseHA = offDblHA > 0 ? (recDobleHA * (offCuaHA / offDblHA)) : (recDobleHA * 1.65);
      }

      // Precio final recomendado = Base Alojamiento (HA con descuento) + (Suplemento Pensión × Pax)
      var roomSupplement = boardSupplementPerPerson * pax;
      var recP = Math.round((baseHA + roomSupplement) * 100) / 100;
      recommendedPricesByRoom[rt] = recP;

      savingsByRoom[rt] = {
        diffVsHotel: Math.round(((hotelRoomPrice + roomSupplement) - recP) * 100) / 100,
        diffVsOfficial: Math.round((recP - offP) * 100) / 100
      };
    });

    // La tarifa recomendada para doble en el régimen seleccionado es:
    var recDoble = recommendedPricesByRoom['DOBLE'] || Math.round((recDobleHA + (boardSupplementPerPerson * 2)) * 100) / 100;

    return {
      hotelName: hotelName,
      dateISO: dateISO,
      boardCode: boardCode,
      hotelDayPrice: hotelRoomPrice,
      hotelPriceInfo: hotelPriceInfo,
      discountPercent: discount,
      officialDoble: officialDoble,
      recDoble: recDoble,
      roomTypes: roomTypes,
      officialPricesByRoom: officialPricesByRoom,
      recommendedPricesByRoom: recommendedPricesByRoom,
      savingsByRoom: savingsByRoom
    };
  }

  /**
   * Resumen para un grupo de fechas de estancia completas
   */
  function getStayTariffSummary(hotelName, stayDates, boardName, discountPercent, officialGrid) {
    if (!stayDates || stayDates.length === 0) {
      return null;
    }

    var comparisons = stayDates.map(function (d) {
      return getTariffComparison(hotelName, d, boardName, discountPercent, officialGrid);
    });

    var sumHotel = 0;
    var sumOfficialDoble = 0;
    var sumRecDoble = 0;

    comparisons.forEach(function (c) {
      sumHotel += c.hotelDayPrice;
      sumOfficialDoble += c.officialDoble;
      sumRecDoble += c.recDoble;
    });

    var len = comparisons.length;
    var avgHotel = Math.round((sumHotel / len) * 100) / 100;
    var avgOfficial = Math.round((sumOfficialDoble / len) * 100) / 100;
    var avgRec = Math.round((sumRecDoble / len) * 100) / 100;
    var totalSavingsVsHotel = Math.round((sumHotel - sumRecDoble) * 100) / 100;

    return {
      nightsCount: len,
      avgHotelPrice: avgHotel,
      avgOfficialRate: avgOfficial,
      avgRecommendedRate: avgRec,
      discountPercent: comparisons[0] ? comparisons[0].discountPercent : DEFAULT_DISCOUNT_PERCENT,
      totalSavingsVsHotel: totalSavingsVsHotel,
      comparisons: comparisons
    };
  }

  return {
    DEFAULT_DISCOUNT_PERCENT: DEFAULT_DISCOUNT_PERCENT,
    getCapaSuiteHotelDayPrice: getCapaSuiteHotelDayPrice,
    getTariffComparison: getTariffComparison,
    getStayTariffSummary: getStayTariffSummary,
    normalizeHotelKey: normalizeHotelKey
  };
}));
