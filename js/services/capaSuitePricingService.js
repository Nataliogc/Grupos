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

  function roundRate(value) { return Math.round((Number(value) + Number.EPSILON) * 20) / 20; }

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

  // Same inventory and blocked-allotment rules as Calendario.html.
  function getDayEvents(dateISO) {
    var raw = safeGetStorage('custom_events');
    if (!raw) return { known: false, events: [] };
    try {
      var events = JSON.parse(raw);
      if (!Array.isArray(events)) return { known: false, events: [] };
      return { known: true, events: events.filter(function (event) {
        return event && event.start && dateISO >= event.start && dateISO <= (event.end || event.start);
      }) };
    } catch (e) { return { known: false, events: [] }; }
  }

  function getDayAvailability(hotelName, dateISO) {
    var hotelKey = normalizeHotelKey(hotelName);
    var hotelLabel = hotelKey === 'cumbria' ? 'Cumbria' : 'Guadiana';
    var capacity = hotelKey === 'cumbria' ? 59 : 108;
    function read(key) {
      try { return JSON.parse(safeGetStorage(key) || '{}'); } catch (e) { return {}; }
    }
    function valid(value) { return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0; }
    var db = read('hotel_manager_db_v2');
    var key = Object.keys(db).find(function (k) { return k.toLowerCase().indexOf(hotelKey) !== -1; });
    var year = key && db[key] && db[key][String(dateISO).slice(0, 4)];
    var entry = year && year.daily_otb && year.daily_otb[dateISO];
    var manual = read('manual_cupos_v1');
    var allotment = manual[hotelLabel] && manual[hotelLabel][dateISO];
    var occupied = null;
    var blocked = 0;
    var source = 'OTB CapaSuite';
    if (typeof entry === 'object' && entry) {
      if (valid(entry.rooms)) occupied = Number(entry.rooms);
      if (valid(entry.cupos)) blocked = Number(entry.cupos);
    } else if (valid(entry)) occupied = Number(entry);
    if (occupied === null && year && year.daily && year.daily[dateISO] !== undefined) {
      var actual = year.daily[dateISO];
      var rooms = actual && typeof actual === 'object' ? actual.rooms : actual;
      if (valid(rooms)) { occupied = Number(rooms); source = 'Ocupación CapaSuite'; }
    }
    if (allotment && valid(allotment.cupos)) blocked = Number(allotment.cupos);
    var soldOut = !!((entry && entry.isSoldOut) || (allotment && allotment.isSoldOut));
    if (occupied === null) {
      var revenue = read('revenue_data_v2');
      var day = Array.isArray(revenue.data) ? revenue.data.find(function (d) { return d.dateISO === dateISO; }) : revenue[dateISO] || (revenue.data && revenue.data[dateISO]);
      var occupancy = day && day.occupancyData;
      var occKey = occupancy && Object.keys(occupancy).find(function (k) { return k.toLowerCase().indexOf(hotelKey) !== -1; });
      var info = occKey && occupancy[occKey];
      if (info && (valid(info.otb) || valid(info.occ))) {
        occupied = valid(info.otb) ? Number(info.otb) : Number(info.occ);
        // Calendar occupancy already includes blocked allotments.
        blocked = 0;
        source = 'Calendario CapaSuite';
      }
    }
    if (soldOut) occupied = capacity;
    if (occupied === null) return { dateISO: dateISO, available: null, capacity: capacity, source: 'Sin datos de disponibilidad' };
    return { dateISO: dateISO, available: Math.max(0, Math.floor(capacity - occupied - blocked)), occupied: occupied, blocked: blocked, capacity: capacity, source: source };
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

    // Tipologías disponibles para cada hotel
    var roomTypes = isCumbria
      ? ['DOBLE DE USO INDIVIDUAL', 'DOBLE', 'DOBLE + SUPLETORIA', 'DOBLE + SUPLETORIA NIÑO', 'SUITE']
      : ['DOBLE DE USO INDIVIDUAL', 'DOBLE', 'DOBLE + SUPLETORIA', 'DOBLE + SUPLETORIA NIÑO', 'CUÁDRUPLE', 'SUITE', 'SUITE SUPERIOR'];

    // Si no se suministra grid oficial, usar valores por defecto estándar
    var boardTariffs = (officialGrid && officialGrid[boardCode]) ? officialGrid[boardCode] : null;
    var haTariffs = (officialGrid && officialGrid['HA']) ? officialGrid['HA'] : null;

    function getTariffPrice(tObj, roomName) {
      if (!tObj) return null;
      if (tObj[roomName] !== undefined && tObj[roomName] !== null) return Number(tObj[roomName]);
      var norm = String(roomName).toLowerCase().trim();
      for (var k in tObj) {
        if (k.toLowerCase().trim() === norm && tObj[k] !== null && tObj[k] !== undefined) {
          return Number(tObj[k]);
        }
      }
      if (norm.indexOf('individual') !== -1 || norm.indexOf('dui') !== -1) {
        return tObj['individual'] !== undefined ? Number(tObj['individual']) : (tObj['ind'] !== undefined ? Number(tObj['ind']) : null);
      }
      if (norm === 'doble' || norm.indexOf('matrimonial') !== -1 || norm.indexOf('2 camas') !== -1) {
        return tObj['doble'] !== undefined ? Number(tObj['doble']) : null;
      }
      if (norm.indexOf('niño') !== -1 || norm.indexOf('nino') !== -1) {
        return tObj['triple_nino'] !== undefined ? Number(tObj['triple_nino']) : null;
      }
      if (norm.indexOf('supletoria') !== -1 || norm.indexOf('triple') !== -1) {
        return tObj['triple'] !== undefined ? Number(tObj['triple']) : null;
      }
      if (norm.indexOf('cuadruple') !== -1 || norm.indexOf('cuádruple') !== -1) {
        return tObj['cuadruple'] !== undefined ? Number(tObj['cuadruple']) : null;
      }
      if (norm.indexOf('superior') !== -1) {
        return tObj['suite_superior'] !== undefined ? Number(tObj['suite_superior']) : (tObj['suite'] !== undefined ? Number(tObj['suite']) : null);
      }
      if (norm.indexOf('suite') !== -1) {
        return tObj['suite'] !== undefined ? Number(tObj['suite']) : null;
      }
      return null;
    }

    var officialDoble = getTariffPrice(boardTariffs, 'DOBLE') || (isCumbria ? (boardCode === 'HA' ? 63 : 79) : (boardCode === 'HA' ? 65 : 82));

    var discountFactor = (100 - discount) / 100;
    // Tarifa recomendada base de alojamiento (HA) para habitación doble con descuento
    var recDobleHA = Math.round(hotelRoomPrice * discountFactor * 100) / 100;

    var targets = typeof window !== "undefined" ? window.GroupTargetsService : null;
    if (!targets && typeof require === 'function') targets = require('./groupTargetsService');
    var catalog = {};
    try { var rawCatalog = safeGetStorage('nexus_group_tariffs'); catalog = typeof rawCatalog === 'string' ? JSON.parse(rawCatalog) : (rawCatalog || {}); } catch (e) {}
    var officialBoard = targets.getOfficialBoardPrices(catalog, hotelName, dateISO);
    var breakfastPerson = officialBoard.breakfast;
    var mealPerson = officialBoard.lunch;
    var dinnerPerson = officialBoard.dinner;

    var boardSupplementPerPerson = 0;
    if (boardCode === 'HD') {
      boardSupplementPerPerson = breakfastPerson;
    } else if (boardCode === 'MP') {
      boardSupplementPerPerson = breakfastPerson + mealPerson;
    } else if (boardCode === 'PC') {
      boardSupplementPerPerson = breakfastPerson + mealPerson + dinnerPerson;
    }

    var officialPricesByRoom = {};
    var recommendedPricesByRoom = {};
    var savingsByRoom = {};

    // Obtener precios base de HA oficial para proporciones
    var offDblHA = getTariffPrice(haTariffs, 'DOBLE') || (isCumbria ? 60 : 62);
    roomTypes.forEach(function (rt) {
      var rtNorm = rt.toLowerCase();
      var offP = getTariffPrice(boardTariffs, rt);
      var offP_HA = getTariffPrice(haTariffs, rt);

      if (offP === null) {
        if (rtNorm.indexOf('individual') !== -1 || rtNorm.indexOf('dui') !== -1) {
          offP = isCumbria ? (boardCode === 'HA' ? 60 : 68) : (boardCode === 'HA' ? 62 : 70);
        } else if (rtNorm.indexOf('niño') !== -1 || rtNorm.indexOf('nino') !== -1) {
          offP = isCumbria ? (boardCode === 'HA' ? 70 : 88) : (boardCode === 'HA' ? 72 : 92);
        } else if (rtNorm.indexOf('supletoria') !== -1 || rtNorm.indexOf('triple') !== -1) {
          offP = isCumbria ? (boardCode === 'HA' ? 80 : 104) : (boardCode === 'HA' ? 82 : 106);
        } else if (rtNorm.indexOf('cuadruple') !== -1 || rtNorm.indexOf('cuádruple') !== -1) {
          offP = isCumbria ? null : (boardCode === 'HA' ? 101 : 125);
        } else if (rtNorm.indexOf('superior') !== -1) {
          offP = isCumbria ? null : (boardCode === 'HA' ? 95 : 125);
        } else if (rtNorm.indexOf('suite') !== -1) {
          offP = isCumbria ? (boardCode === 'HA' ? 85 : 105) : (boardCode === 'HA' ? 90 : 118);
        } else {
          offP = officialDoble;
        }
      }

      if (offP_HA === null) {
        if (rtNorm.indexOf('individual') !== -1 || rtNorm.indexOf('dui') !== -1) {
          offP_HA = isCumbria ? 60 : 62;
        } else if (rtNorm.indexOf('supletoria') !== -1 || rtNorm.indexOf('triple') !== -1) {
          offP_HA = isCumbria ? 80 : 82;
        } else if (rtNorm.indexOf('cuadruple') !== -1 || rtNorm.indexOf('cuádruple') !== -1) {
          offP_HA = isCumbria ? null : 101;
        } else {
          offP_HA = offDblHA;
        }
      }

      officialPricesByRoom[rt] = offP;

      if (offP === null && isCumbria && (rtNorm.indexOf('cuadruple') !== -1 || rtNorm.indexOf('cuádruple') !== -1)) {
        recommendedPricesByRoom[rt] = null;
        savingsByRoom[rt] = null;
        return;
      }

      // Fixed supplements come from this hotel's yearly group catalogue.
      var pax = 2;
      var isDUI = rtNorm.indexOf('individual') !== -1 || rtNorm.indexOf('dui') !== -1;
      if (isDUI) pax = 1;
      else if (rtNorm.indexOf('niño') !== -1 || rtNorm.indexOf('nino') !== -1) pax = 2.5;
      else if (rtNorm.indexOf('supletoria') !== -1 || rtNorm.indexOf('triple') !== -1) pax = 3;
      else if (rtNorm.indexOf('cuadruple') !== -1 || rtNorm.indexOf('cuádruple') !== -1) pax = 4;
      var roomTypeSupplement = offP_HA !== null ? Math.round((offP_HA - offDblHA) * 100) / 100 : 0;
      // The change vs the catalogue double is allocated per bed; DUI keeps the full double base.
      var accommodationDelta = recDobleHA - offDblHA;
      var baseHA = isDUI ? recDobleHA : Math.round(Math.round((offP_HA !== null ? offP_HA : offDblHA) * 100) + Math.round(accommodationDelta * 100) * pax / 2) / 100;

      // Suplemento de pensión:
      // Si el catálogo oficial tiene precio cerrado para esta tipología en este régimen,
      // usamos el suplemento oficial de catálogo: (Oficial Régimen - Oficial HA)
      // (ej. Cuádruple Guadiana: HD = +24 €, MP = +100 €, PC = +157 €)
      var roomSupplement;
      if (boardCode === 'HA' || boardCode === 'SA') {
        roomSupplement = 0;
      } else if (offP !== null && offP_HA !== null && (offP - offP_HA) > 0) {
        roomSupplement = Math.round((offP - offP_HA) * 100) / 100;
      } else {
        roomSupplement = Math.round(boardSupplementPerPerson * pax * 100) / 100;
      }

      // Precio final recomendado = Base Alojamiento (HA con descuento) + Suplemento Pensión
      var recP = roundRate(baseHA + roomSupplement);
      recommendedPricesByRoom[rt] = recP;

      savingsByRoom[rt] = {
        diffVsHotel: Math.round(((hotelRoomPrice + roomTypeSupplement + roomSupplement) - recP) * 100) / 100,
        diffVsOfficial: offP !== null ? Math.round((recP - offP) * 100) / 100 : 0
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
    var avgRec = roundRate(sumRecDoble / len);
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
    roundRate: roundRate,
    getDayEvents: getDayEvents,
    getDayAvailability: getDayAvailability,
    DEFAULT_DISCOUNT_PERCENT: DEFAULT_DISCOUNT_PERCENT,
    getCapaSuiteHotelDayPrice: getCapaSuiteHotelDayPrice,
    getTariffComparison: getTariffComparison,
    getStayTariffSummary: getStayTariffSummary,
    normalizeHotelKey: normalizeHotelKey
  };
}));
