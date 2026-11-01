/**
 * CapaSuitePricingService
 * 
 * Servicio para integrar las tarifas del hotel desde CapaSuite con la cotización de grupos:
 * 1. Obtiene el precio de habitación del hotel para cada día de estancia (PVP de venta desde revenue_data_v2).
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

  var inMemoryStorage = {};
  var lastRevenueRaw, lastRevenueParsed;

  function safeGetStorage(key) {
    var sync = typeof window !== 'undefined' && window.CapaSuiteCalendarSync;
    if (sync && ['revenue_data_v2', 'hotel_manager_db_v2', 'custom_events', 'manual_cupos_v1'].indexOf(key) !== -1) {
      if (sync.state.authenticated) {
        var value = (sync.state.data || {})[key];
        return value === undefined ? null : JSON.stringify(value);
      }
      // Match the Groups calendar while restoring the session: its saved
      // calendar copy takes priority over the old Firestore memory cache.
      try {
        return typeof localStorage === 'undefined' ? null : localStorage.getItem('v3_' + key) || localStorage.getItem(key) || null;
      } catch (error) { return null; }
    }
    if (inMemoryStorage[key]) return inMemoryStorage[key];
    if (inMemoryStorage['v3_' + key]) return inMemoryStorage['v3_' + key];
    if (typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem('v3_' + key) || localStorage.getItem(key) || null;
    } catch (e) {
      return null;
    }
  }

  function setCalendarData(data) {
    if (!data || typeof data !== 'object') return;
    if (typeof window !== 'undefined' && window.CapaSuiteCalendarSync) return;
    if (data.revenueData) {
      inMemoryStorage['revenue_data_v2'] = data.revenueData;
      try {
        localStorage.setItem('v3_revenue_data_v2', JSON.stringify(data.revenueData));
        localStorage.setItem('revenue_data_v2', JSON.stringify(data.revenueData));
      } catch (e) {}
    }
    if (data.hotelManagerDb) {
      inMemoryStorage['hotel_manager_db_v2'] = data.hotelManagerDb;
      try {
        localStorage.setItem('v3_hotel_manager_db_v2', JSON.stringify(data.hotelManagerDb));
        localStorage.setItem('hotel_manager_db_v2', JSON.stringify(data.hotelManagerDb));
      } catch (e) {}
    }
    if (data.customEvents) {
      inMemoryStorage['custom_events'] = data.customEvents;
      try {
        localStorage.setItem('v3_custom_events', JSON.stringify(data.customEvents));
        localStorage.setItem('custom_events', JSON.stringify(data.customEvents));
      } catch (e) {}
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('capasuite-data-synced'));
    }
  }

  // Escuchar sincronizaciones externas (ej. desde groupTargetsService o Firebase)
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('capasuite-data-synced', function () {
      try {
        var rawRev = typeof localStorage !== 'undefined' && (localStorage.getItem('v3_revenue_data_v2') || localStorage.getItem('revenue_data_v2'));
        if (rawRev) inMemoryStorage['revenue_data_v2'] = typeof rawRev === 'string' ? JSON.parse(rawRev) : rawRev;
      } catch (e) {}
      try {
        var rawDb = typeof localStorage !== 'undefined' && (localStorage.getItem('v3_hotel_manager_db_v2') || localStorage.getItem('hotel_manager_db_v2'));
        if (rawDb) inMemoryStorage['hotel_manager_db_v2'] = typeof rawDb === 'string' ? JSON.parse(rawDb) : rawDb;
      } catch (e) {}
    });
  }

  function syncFromFirestore(dbInstance, callback) {
    if (typeof window !== 'undefined' && window.CapaSuiteCalendarSync) return window.CapaSuiteCalendarSync.refresh();
    var db = dbInstance || (typeof window !== 'undefined' ? window.db : null);
    if (!db || typeof db.collection !== 'function') return Promise.resolve(false);
    return db.collection('settings').doc('calendar_data').get()
      .then(function (doc) {
        if (doc.exists) {
          var d = doc.data();
          setCalendarData(d);
          if (typeof callback === 'function') callback(d);
          if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new CustomEvent('capasuite-data-synced'));
          }
          return true;
        }
        return false;
      })
      .catch(function (err) {
        console.warn('Error sincronizando calendar_data en CapaSuitePricingService:', err);
        return false;
      });
  }

  function normalizeHotelKey(hotel) {
    if (!hotel) return 'guadiana';
    var h = String(hotel).toLowerCase().trim();
    if (h.indexOf('cumbria') !== -1) return 'cumbria';
    return 'guadiana';
  }

  /**
   * Obtiene el precio de la habitación del hotel para una fecha específica desde CapaSuite.
   * Solo utiliza PVP de venta identificado por hotel; nunca ADR ni estimaciones.
   */
  function getCapaSuiteHotelDayPrice(hotelName, dateISO) {
    if (!dateISO) {
      return { price: 0, source: 'Sin PVP disponible', unavailable: true, isEstimated: false };
    }

    var hotelKey = normalizeHotelKey(hotelName);
    var isCumbria = hotelKey === 'cumbria';

    // Normalizar formato de fecha a ISO (YYYY-MM-DD) y alternativo (DD/MM/YYYY)
    var rawDateStr = String(dateISO).trim();
    var iso = rawDateStr;
    var dmy = rawDateStr;
    if (rawDateStr.indexOf('/') !== -1) {
      var slashParts = rawDateStr.split('/');
      if (slashParts.length === 3) {
        if (slashParts[0].length === 4) {
          iso = slashParts[0] + '-' + slashParts[1].padStart(2, '0') + '-' + slashParts[2].padStart(2, '0');
          dmy = slashParts[2].padStart(2, '0') + '/' + slashParts[1].padStart(2, '0') + '/' + slashParts[0];
        } else {
          iso = slashParts[2] + '-' + slashParts[1].padStart(2, '0') + '-' + slashParts[0].padStart(2, '0');
          dmy = slashParts[0].padStart(2, '0') + '/' + slashParts[1].padStart(2, '0') + '/' + slashParts[2];
        }
      }
    } else if (rawDateStr.indexOf('-') !== -1) {
      var dashParts = rawDateStr.split('-');
      if (dashParts.length === 3) {
        if (dashParts[0].length === 4) {
          iso = dashParts[0] + '-' + dashParts[1].padStart(2, '0') + '-' + dashParts[2].padStart(2, '0');
          dmy = dashParts[2].padStart(2, '0') + '/' + dashParts[1].padStart(2, '0') + '/' + dashParts[0];
        } else {
          iso = dashParts[2] + '-' + dashParts[1].padStart(2, '0') + '-' + dashParts[0].padStart(2, '0');
          dmy = dashParts[0].padStart(2, '0') + '/' + dashParts[1].padStart(2, '0') + '/' + dashParts[2];
        }
      }
    }

    // 1. Intentar leer de revenue_data_v2
    try {
      var liveSync = typeof window !== 'undefined' && window.CapaSuiteCalendarSync;
      var rawRev = (liveSync && liveSync.state.authenticated && liveSync.state.data && liveSync.state.data.revenue_data_v2) || safeGetStorage('revenue_data_v2');
      if (!rawRev && typeof window !== 'undefined' && !window.CapaSuiteCalendarSync && window._capasuiteRevenueCache) {
        rawRev = window._capasuiteRevenueCache;
      }
      if (rawRev) {
        if (rawRev !== lastRevenueRaw) {
          lastRevenueParsed = typeof rawRev === 'string' ? JSON.parse(rawRev) : rawRev;
          lastRevenueRaw = rawRev;
        }
        var parsedRev = lastRevenueParsed;
        var dayData = null;
        if (parsedRev) {
          if (Array.isArray(parsedRev)) {
            dayData = parsedRev.find(function (d) {
              return d && (d.dateISO === iso || d.date === iso || d.dateISO === dmy || d.date === dmy);
            });
          } else if (Array.isArray(parsedRev.data)) {
            dayData = parsedRev.data.find(function (d) {
              return d && (d.dateISO === iso || d.date === iso || d.dateISO === dmy || d.date === dmy);
            });
          } else if (typeof parsedRev === 'object') {
            dayData = parsedRev[iso] || parsedRev[dmy] || (parsedRev.data && (parsedRev.data[iso] || parsedRev.data[dmy]));
          }
        }

        if (dayData) {
          var dayResult = resolveDayPrice(hotelName, iso, dayData);
          if (dayResult.price > 0 || dayResult.status === 'sold-out') {
            return dayResult;
          }
        }
      }
    } catch (e) {
      console.warn('Error leyendo revenue_data_v2 en CapaSuitePricingService:', e);
    }

    // 2. Intentar leer precio de venta explícito desde hotel_manager_db_v2 (daily_otb.price)
    try {
      var liveSyncDb = typeof window !== 'undefined' && window.CapaSuiteCalendarSync;
      var rawDb = (liveSyncDb && liveSyncDb.state.authenticated && liveSyncDb.state.data && liveSyncDb.state.data.hotel_manager_db_v2) || safeGetStorage('hotel_manager_db_v2');
      if (rawDb) {
        var parsedDb = typeof rawDb === 'string' ? JSON.parse(rawDb) : rawDb;
        if (parsedDb && typeof parsedDb === 'object') {
          var hKey = Object.keys(parsedDb).find(function (k) { return k.toLowerCase().includes(hotelKey); });
          var year = iso.slice(0, 4);
          var yearData = hKey && parsedDb[hKey] && parsedDb[hKey][year];
          var otbEntry = yearData && yearData.daily_otb && yearData.daily_otb[iso];
          if (otbEntry && typeof otbEntry === 'object') {
            var isOtbSold = otbEntry.isSoldOut === true || otbEntry.sold === true || otbEntry.soldOut === true;
            if (isOtbSold) {
              return { price: 0, source: 'Hotel completo', status: 'sold-out', unavailable: true, isEstimated: false, hotel: hotelName, dateISO: iso };
            }
            var otbRaw = otbEntry.price ?? otbEntry.rate ?? otbEntry.tarifa ?? otbEntry.pvp ?? otbEntry.bar;
            var otbPrice = parseSalePrice(otbRaw);
            if (otbPrice > 0) {
              return {
                price: otbPrice,
                source: 'PVP CapaSuite OTB (' + (hKey.charAt(0).toUpperCase() + hKey.slice(1)) + ')',
                status: 'available',
                unavailable: false,
                isEstimated: false,
                hotel: hotelName,
                dateISO: iso
              };
            }
          }
        }
      }
    } catch (e) {
      console.warn('Error leyendo hotel_manager_db_v2 en CapaSuitePricingService:', e);
    }

    var sync = typeof window !== 'undefined' && window.CapaSuiteCalendarSync;
    var loading = sync && sync.state.authenticated && !sync.state.data;
    return { price: 0, source: loading ? 'Cargando PVP de CapaSuite' : 'Sin PVP disponible', status: loading ? 'loading' : 'missing', unavailable: true, isEstimated: false, hotel: hotelName, dateISO: iso };
  }

  // Single interpretation of a sale price, shared with the Groups calendar.
  function parseSalePrice(value) {
    if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : 0;
    var text = String(value == null ? '' : value).trim().replace(/[^0-9.,-]/g, '');
    if (text.includes(',') && text.includes('.')) {
      text = text.lastIndexOf(',') > text.lastIndexOf('.') ? text.replace(/\./g, '').replace(',', '.') : text.replace(/,/g, '');
    } else { text = text.replace(',', '.'); }
    var price = Number(text);
    return Number.isFinite(price) && price > 0 ? Math.round(price * 100) / 100 : 0;
  }

  function resolveDayPrice(hotelName, dateISO, dayData) {
    var result = { price: 0, source: 'Sin PVP disponible', status: 'missing', unavailable: true, isEstimated: false, hotel: hotelName, dateISO: dateISO };
    var key = String(hotelName || '').toLowerCase();
    // Never silently select Guadiana for an unknown hotel.
    var token = key.includes('cumbria') ? 'cumbria' : key.includes('guadiana') ? 'guadiana' : null;
    if (!token) { result.status = 'unknown-hotel'; result.source = 'Hotel sin identificar'; return result; }
    var hotels = dayData && (dayData.hotels || dayData);
    var entry = hotels && Object.entries(hotels).find(function (item) { return item[0].toLowerCase().includes(token); });
    // An unlabelled day-level price cannot be safely assigned to either hotel.
    if (!entry) return result;
    var value = entry[1];
    var raw = value && typeof value === 'object' ? (value.price ?? value.p ?? value.rate ?? value.tarifa) : value;
    var sold = value && typeof value === 'object' && (value.sold === true || value.soldOut === true || value.isSoldOut === true || value.price === 0 || value.price === '0');
    if (sold || String(raw).toUpperCase() === 'SOLD') {
      result.status = 'sold-out'; result.source = 'Hotel completo'; return result;
    }
    result.price = parseSalePrice(raw);
    if (result.price > 0) { result.status = 'available'; result.source = 'PVP CapaSuite (' + entry[0] + ')'; result.unavailable = false; }
    return result;
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
    // Dates without recorded occupancy represent zero occupied rooms.
    if (occupied === null) {
      occupied = 0;
      source = 'CapaSuite: 0 habitaciones ocupadas';
    }
    return { dateISO: dateISO, available: Math.max(0, Math.floor(capacity - occupied - blocked)), occupied: occupied, blocked: blocked, capacity: capacity, source: source };
  }

  /**
   * Obtiene la comparativa detallada para un día, hotel, régimen y descuento:
   * - Tarifa oficial de grupos para esa fecha
   * - Tarifa de habitación del hotel para ese día
   * - Tarifa recomendada CapaSuite aplicando el descuento
   */
  function getTariffComparison(hotelName, dateISO, boardName, discountPercent, officialGrid, overridePrice) {
    var discount = typeof discountPercent === 'number' && !isNaN(discountPercent)
      ? Math.max(0, Math.min(90, discountPercent))
      : DEFAULT_DISCOUNT_PERCENT;

    var hotelPriceInfo = (overridePrice > 0)
      ? { price: Number(overridePrice), source: 'PVP manual (' + overridePrice + ' €)', status: 'available', unavailable: false, isEstimated: false, hotel: hotelName, dateISO: dateISO }
      : getCapaSuiteHotelDayPrice(hotelName, dateISO);
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
    var recDobleHA = hotelRoomPrice > 0
      ? Math.round(hotelRoomPrice * discountFactor * 100) / 100
      : offDblHA;

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
      if (!(hotelRoomPrice > 0)) {
        recommendedPricesByRoom[rt] = offP;
        savingsByRoom[rt] = {
          diffVsHotel: 0,
          diffVsOfficial: 0
        };
        return;
      }

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
    var recDoble = hotelRoomPrice > 0 ? (recommendedPricesByRoom['DOBLE'] || Math.round((recDobleHA + (boardSupplementPerPerson * 2)) * 100) / 100) : 0;

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
    resolveDayPrice: resolveDayPrice,
    parseSalePrice: parseSalePrice,
    getDayEvents: getDayEvents,
    getDayAvailability: getDayAvailability,
    DEFAULT_DISCOUNT_PERCENT: DEFAULT_DISCOUNT_PERCENT,
    getCapaSuiteHotelDayPrice: getCapaSuiteHotelDayPrice,
    getTariffComparison: getTariffComparison,
    getStayTariffSummary: getStayTariffSummary,
    normalizeHotelKey: normalizeHotelKey,
    setCalendarData: setCalendarData,
    syncFromFirestore: syncFromFirestore
  };
}));
