

    // Aseguramos que las librerías estén disponibles
    if (typeof window !== 'undefined') {
      if (window.RoomingCore) {
        window.roomingCore = window.RoomingCore;
      } else {
        Object.defineProperty(window, 'roomingCore', {
          get() { return window.RoomingCore; },
          configurable: true
        });
      }
    }

    const { useState, useEffect, useMemo, useRef } = React;

    const {

      BarChart,

      Bar,

      LineChart,

      Line,

      XAxis,

      YAxis,

      CartesianGrid,

      Tooltip,

      Legend,

      ResponsiveContainer,

      PieChart,

      Pie,

      Cell,

    } = window.Recharts;



    // Utilidades compartidas (cargadas desde js/utils.js)

    const safeStorage = window.NexusUtils.safeStorage;



    // Iconos SVG manuales eliminados — ahora se cargan desde js/icons.js

    // Los nombres antiguos (IconCheck, IconUsers, etc.) siguen disponibles

    // como globales via window.NexusIcons alias factory.





    // --- FIREBASE ---

    // Inicialización cargada desde js/firebase-init.js

    const db = window.db;



    // --- UTILIDADES ---

    // Cargadas desde js/utils.js (NexusUtils)

    const COLORS = NexusUtils.COLORS;

    const parseNum = NexusUtils.parseNum;

    const normalizeId = NexusUtils.normalizeId;

    const getBaseId = NexusUtils.getBaseId;

    const normalizeHotelName = NexusUtils.normalizeHotelName;

    const formatNum = NexusUtils.formatNum;

    const toInputDate = NexusUtils.toInputDate || ((v) => String(v || "").split("T")[0]);

    const formatCurrency = (val, maxDecimals = 2) => {
      if (window.NexusUtils && window.NexusUtils.formatCurrency && maxDecimals === 2) {
        return window.NexusUtils.formatCurrency(val);
      }
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: maxDecimals === 0 ? 0 : 2,
        maximumFractionDigits: maxDecimals,
      }).format(Number(val) || 0);
    };

    // Helpers para ocupación máxima y habitaciones simultáneas
    const parseLocalDate = (dStr) => {
      if (!dStr) return null;
      const s = dStr.toString().trim();
      if (s.includes('-')) {
        const parts = s.split(/[-T ]/);
        if (parts.length >= 3) {
          const y = parseInt(parts[0]);
          const m = parseInt(parts[1]);
          const d = parseInt(parts[2]);
          if (y > 1000) return new Date(y, m - 1, d, 12, 0, 0);
        }
      }
      if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length === 3) {
          let [d, m, y] = parts.map(x => parseInt(x));
          if (y < 100) y += 2000;
          return new Date(y, m - 1, d, 12, 0, 0);
        }
      }
      const f = new Date(s);
      if (!isNaN(f.getTime())) return new Date(f.getFullYear(), f.getMonth(), f.getDate(), 12, 0, 0);
      return null;
    };

    const parseRoomingListSafe = (value, context = "") => {
      if (window.RoomingCore && window.RoomingCore.parseRoomingListSafe) {
        return window.RoomingCore.parseRoomingListSafe(value, context);
      }
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value.trim());
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {}
      }
      return [];
    };

    const getEconomicRoomingItems = (value, context = "") => {
      if (window.RoomingCore && window.RoomingCore.getEconomicRoomingItems) {
        return window.RoomingCore.getEconomicRoomingItems(value, context);
      }
      return parseRoomingListSafe(value, context).filter(
        item =>
          item &&
          item.excludeFromEconomicTotals !== true &&
          item.isManualRoomingItem !== true
      );
    };

    const isAccommodationItem = (item) => {
      if (window.RoomingCore && window.RoomingCore.isAccommodationItem) {
        return window.RoomingCore.isAccommodationItem(item);
      }
      if (!item || item.isService === true || item.isAccommodation === false || item.excludeFromOccupancy === true) return false;
      if (item.isAccommodation === true || item.isManualRoomingItem === true) return true;
      return /^(hab\.?|habitaci[oÃ³]n|doble|dbl|dui|twin|individual|triple|cu[aÃ¡]druple|suite|apartamento|familiar)\b/i.test(String(item.roomType || item.type || item.product || ''));
    };

    const getAccommodationItems = (value, context = "") => {
      if (window.RoomingCore && window.RoomingCore.getAccommodationItems) {
        return window.RoomingCore.getAccommodationItems(value, context);
      }
      return parseRoomingListSafe(value, context).filter(isAccommodationItem);
    };

    const calculateLodgingRevenue = (row) => {
      const totalImporte = parseNum(row["Importe(*)"]);
      if (row.RoomingList_JSON && row.RoomingList_JSON !== "[]") {
        try {
          const rl = parseRoomingListSafe(row.RoomingList_JSON, "lodging-revenue");
          if (Array.isArray(rl) && rl.length > 0) {
            const isLodging = (item) => {
              if (!item) return false;
              if (item.isService === true || item.isAccommodation === false || item.excludeFromOccupancy === true) return false;
              if (item.isAccommodation === true || item.isManualRoomingItem === true) return true;
              if (typeof isAccommodationItem === "function" && isAccommodationItem(item)) return true;
              const t = String(item.roomType || item.type || item.product || "").toLowerCase();
              if (/almuerzo|cena|desayuno|coffee|sal[oó]n|coctel|men[uú]|traslado|gu[ií]a|pensi[oó]n|comida|extra|audiovisual/i.test(t)) {
                return false;
              }
              return true;
            };
            const roomLines = rl.filter(isLodging);
            if (roomLines.length > 0) {
              return roomLines.reduce((acc, item) => {
                let lineTot = parseFloat(item.total || item.lineTotal || item.importe);
                if (isNaN(lineTot) || lineTot === 0) {
                  const p = parseNum(item.price);
                  const q = parseInt(item.qty, 10) || 1;
                  const n = parseInt(item.nights, 10) || 1;
                  lineTot = p * q * n;
                }
                return acc + (isNaN(lineTot) ? 0 : lineTot);
              }, 0);
            } else {
              return 0;
            }
          }
        } catch (e) {}
      }
      return !isNaN(totalImporte) ? totalImporte : 0;
    };
    const parseDateToComparable = (dStr) => {
      if (!dStr) return "9999-99-99";
      const s = dStr.toString().trim();
      if (/^\d{5}$/.test(s)) {
        const serial = parseInt(s, 10);
        if (serial > 25569) {
          const d = new Date(Math.round((serial - 25569) * 86400 * 1000));
          return d.toISOString().split("T")[0];
        }
      }
      if (s.includes("/") && s.split("/")[0].length <= 2) {
        const parts = s.split("/");
        if (parts.length === 3) {
          const [d, m, y] = parts;
          return `${y.padStart(4, "20")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
      }
      if (s.includes("-") && s.split("-")[0].length <= 2) {
        const parts = s.split("-");
        if (parts.length === 3) {
          const [d, m, y] = parts;
          return `${y.padStart(4, "20")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
      }
      if (s.includes("-") && s.split("-")[0].length === 4) {
        return s.split("T")[0];
      }
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) {
        return dt.toISOString().split("T")[0];
      }
      return s;
    };

    const getRoomTypeHierarchyOrder = (item) => {
      if (!item) return 99;
      const rawT = (item.type || "").toLowerCase().trim();
      const cleanT = rawT.replace(/^(hab\.|habitación|habitacion|hab)\s+/i, "").trim();
      const isRoomType = /^(ind|dui|single|dob|dbl|twin|matrimonial|tri|cua|quin|fami|suite|junior|estudio)/i.test(cleanT);
      if (item.isService && !isRoomType) return 90;

      if (cleanT.includes("ind") || cleanT.includes("dui") || cleanT.includes("single")) return 10;
      if (cleanT.includes("dob") || cleanT.includes("dbl") || cleanT.includes("twin") || cleanT.includes("matrimonial")) return 20;
      if (cleanT.includes("tri")) {
        if (cleanT.includes("niñ") || cleanT.includes("chd") || cleanT.includes("child") || cleanT.includes("inf")) return 35;
        return 30;
      }
      if (cleanT.includes("cua")) return 40;
      if (cleanT.includes("quin") || cleanT.includes("fami")) return 50;
      if (cleanT.includes("suite") || cleanT.includes("junior")) return 60;
      if (cleanT.includes("estudio") || cleanT.includes("apartamento")) return 65;
      if (rawT.includes("habitaci") || rawT.includes("hab.")) return 70;
      if (item.isService) return 90;
      return 80;
    };

    const compareRoomItemsByDateAndType = (a, b) => {
      const dateA = parseDateToComparable(a.dateIn || a.date || a.fecha);
      const dateB = parseDateToComparable(b.dateIn || b.date || b.fecha);
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      const hasOrderA = typeof a.sortOrder === "number" || typeof a.customOrder === "number";
      const hasOrderB = typeof b.sortOrder === "number" || typeof b.customOrder === "number";
      if (hasOrderA && hasOrderB) {
        const oA = a.sortOrder ?? a.customOrder;
        const oB = b.sortOrder ?? b.customOrder;
        if (oA !== oB) return oA - oB;
      }
      if (hasOrderA && !hasOrderB) return -1;
      if (!hasOrderA && hasOrderB) return 1;

      const orderA = getRoomTypeHierarchyOrder(a);
      const orderB = getRoomTypeHierarchyOrder(b);
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      const cleanA = (a.type || "").replace(/^(hab\.|habitación|habitacion|hab)\s+/i, "").trim();
      const cleanB = (b.type || "").replace(/^(hab\.|habitación|habitacion|hab)\s+/i, "").trim();
      return cleanA.localeCompare(cleanB);
    };


    // ─── Métricas de ocupación y habitaciones ────────────────────────────────
    // Fuente de verdad: js/rooming-core.js (window.RoomingCore).
    // Las implementaciones locales han sido eliminadas para evitar divergencias.
    // Si rooming-core.js no está cargado aún, se usa un fallback seguro que
    // delega tan pronto como el módulo esté disponible.
    const calculateMaxDailyOccupancy = (list) => {
      if (window.RoomingCore && window.RoomingCore.calculateMaxDailyOccupancy) {
        return window.RoomingCore.calculateMaxDailyOccupancy(list);
      }
      // Fallback de emergencia (sólo si rooming-core.js no se cargó)
      const dailyPax = {};
      getAccommodationItems(list, "occupancy-fallback").forEach(i => {
        const s = i.dateIn || i.checkIn; const e = i.dateOut || i.checkOut;
        if (!s || !e) return;
        const dIn = new Date(s); const dOut = new Date(e);
        const nights = Math.round((dOut - dIn) / 86400000) || 1;
        for (let d = 0; d < nights; d++) {
          const cur = new Date(dIn); cur.setDate(dIn.getDate() + d);
          const iso = cur.toISOString().split('T')[0];
          dailyPax[iso] = (dailyPax[iso] || 0) + (parseInt(i.pax || 0) * (parseInt(i.qty) || 1));
        }
      });
      const vals = Object.values(dailyPax); return vals.length > 0 ? Math.max(...vals) : 0;
    };

    const calculateMaxDailyRooms = (list) => {
      if (window.RoomingCore && window.RoomingCore.calculateMaxDailyRooms) {
        return window.RoomingCore.calculateMaxDailyRooms(list);
      }
      // Fallback de emergencia
      const dailyRooms = {};
      getAccommodationItems(list, "rooms-fallback").forEach(i => {
        const s = i.dateIn || i.checkIn; const e = i.dateOut || i.checkOut;
        if (!s || !e) return;
        const dIn = new Date(s); const dOut = new Date(e);
        const nights = Math.round((dOut - dIn) / 86400000) || 1;
        for (let d = 0; d < nights; d++) {
          const cur = new Date(dIn); cur.setDate(dIn.getDate() + d);
          const iso = cur.toISOString().split('T')[0];
          dailyRooms[iso] = (dailyRooms[iso] || 0) + (parseInt(i.qty) || 1);
        }
      });
      const vals = Object.values(dailyRooms); return vals.length > 0 ? Math.max(...vals) : 0;
    };



    // Helper para desglosar elementos con noches múltiples en días individuales
    const expandRoomListByDays = (list) => {
      if (!Array.isArray(list)) return [];
      const toDateFn = typeof toInputDate === "function" 
        ? toInputDate 
        : (window.NexusUtils && window.NexusUtils.toInputDate) || ((v) => String(v || "").split("T")[0]);
      const result = [];
      list.forEach((item) => {
        const nights = parseInt(item.nights, 10) || 1;
        if (!item.isService && nights > 1 && (item.dateIn || item.date)) {
          const cleanDateIn = toDateFn(item.dateIn || item.date);
          const unitP = parseNum(item.price);
          const q = parseInt(item.qty, 10) || 1;
          for (let i = 0; i < nights; i++) {
            let dInStr = cleanDateIn;
            let dOutStr = cleanDateIn;
            try {
              const parts = cleanDateIn.split("-");
              if (parts.length === 3) {
                const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                d.setDate(d.getDate() + i);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                dInStr = `${y}-${m}-${day}`;
                d.setDate(d.getDate() + 1);
                dOutStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              }
            } catch (e) {}

            result.push({
              ...item,
              id: `${item.id || Date.now()}_d${i}`,
              dateIn: dInStr,
              dateOut: dOutStr,
              nights: 1,
              total: (unitP * q).toFixed(2),
              originalMultiNightId: item.id,
              originalNights: nights
            });
          }
        } else {
          result.push(item);
        }
      });
      return result;
    };

    // Intercepta la tecla "." (punto) del teclado/numpad y la convierte en "," (coma)
    // para que al meter los decimales en el teclado el punto se coja como coma.
    const handleDotAsComma = (e) => {
      if (
        e.key === '.' ||
        e.key === 'Decimal' ||
        e.code === 'NumpadDecimal' ||
        e.code === 'Period' ||
        e.keyCode === 110 ||
        e.keyCode === 190
      ) {
        if (e.key !== '.' && e.code !== 'NumpadDecimal' && e.key !== 'Decimal') return;
        e.preventDefault();
        const input = e.target;
        if (!input) return;

        let start = null;
        let end = null;
        try {
          start = input.selectionStart;
          end = input.selectionEnd;
        } catch (err) {}

        const val = String(input.value || '');
        // Evitar insertar doble coma si ya existe en el valor y la selección no la cubre
        if (val.includes(',') && (start === null || !val.slice(start, end).includes(','))) {
          return;
        }

        let newVal;
        let newCursorPos;

        if (typeof start === 'number' && start !== null) {
          newVal = val.slice(0, start) + ',' + val.slice(end);
          newCursorPos = start + 1;
        } else {
          newVal = val + ',';
          newCursorPos = newVal.length;
        }

        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;

        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(input, newVal);
        } else {
          input.value = newVal;
        }

        try {
          if (typeof start === 'number' && start !== null) {
            input.selectionStart = input.selectionEnd = newCursorPos;
          }
        } catch (err) {}

        const ev = new Event('input', { bubbles: true });
        input.dispatchEvent(ev);
        const evChange = new Event('change', { bubbles: true });
        input.dispatchEvent(evChange);
      }
    };

    const normalizeHotelNameLocal = (value, fallbackHotel) => {
      const rawValue = String(value || "").trim();
      const raw = rawValue.toLowerCase().replace(/\s*&\s*/g, "&").replace(/\s+/g, " ");

      if (
        raw.includes("guadiana") ||
        raw.includes("sercotel guadiana")
      ) {
        return "Sercotel Guadiana";
      }

      if (
        raw.includes("cumbria") ||
        raw.includes("spa & hotel") ||
        raw.includes("spa&hotel")
      ) {
        return "Cumbria Spa&Hotel";
      }

      return fallbackHotel || rawValue || "Sercotel Guadiana";
    };

    // Sincroniza y construye el mapa de DailyDistribution_JSON a partir del RoomingList_JSON,
    // garantizando que las habitaciones, pax, régimen y estado reflejen fielmente la Ficha de Grupo.
    const buildDailyDistributionFromRoomingList = (list, existingDistMap = {}, hotel = "") => {
      if (!Array.isArray(list)) return existingDistMap || {};
      const toDateFn = typeof toInputDate === "function"
        ? toInputDate
        : (window.NexusUtils && window.NexusUtils.toInputDate) || ((v) => String(v || "").split("T")[0]);

      let result = {};
      if (existingDistMap) {
        try {
          result = typeof existingDistMap === "string" ? JSON.parse(existingDistMap) : { ...existingDistMap };
        } catch (e) {
          result = {};
        }
      }

      const isCumbriaHotel = normalizeHotelNameLocal(hotel, "Sercotel Guadiana") === "Cumbria Spa&Hotel" ||
        String(hotel || "").toLowerCase().includes("cumbria");

      const expanded = expandRoomListByDays(list);
      const byDate = {};

      expanded.forEach((rm) => {
        const f = toDateFn(rm.dateIn || rm.date);
        if (!f) return;
        if (!byDate[f]) byDate[f] = [];
        byDate[f].push(rm);
      });

      if (list.length === 0) {
        return result;
      }

      Object.keys(byDate).forEach((dateStr) => {
        const dayRooms = byDate[dateStr];
        let ind = 0, dbl = 0, tpl = 0, cua = 0, totalRooms = 0, pax = 0;
        let freeInd = 0, freeDbl = 0, freeTpl = 0, freeCua = 0;
        let pInd = 0, pDbl = 0, pTpl = 0, pCua = 0;
        let foundReg = null;

        dayRooms.forEach((rm) => {
          const itype = String(rm.type || rm.roomType || "").toUpperCase();
          const tClean = itype.replace(/^(HAB\.|HABITACIÓN|HABITACION|HAB)\s+/i, "").trim();
          const isPureService = rm.isService === true && !(/IND|DUI|SINGLE|DOB|DBL|TWIN|TRI|TPL|CUA|SUI|HAB/i.test(tClean));
          if (isPureService) return;

          const qty = parseInt(rm.qty, 10) || 1;
          const price = parseFloat(rm.price) || 0;
          const isGratuity = itype.includes("GRATUIDAD") || price === 0 || isNaN(price);

          if (!foundReg && rm.regime && rm.regime !== "-" && rm.regime !== "---") {
            foundReg = rm.regime;
          }

          totalRooms += qty;

          if (itype.includes("INDIV") || itype.includes("SINGLE") || itype.includes("SGL") || itype.includes("DUI")) {
            ind += qty;
            pax += qty * 1;
            if (isGratuity) freeInd += qty;
            else if (price > 0) pInd = price;
          } else if (itype.includes("DBL") || itype.includes("DOBLE") || itype.includes("TWIN") || itype.includes("MATRI")) {
            dbl += qty;
            pax += qty * 2;
            if (isGratuity) freeDbl += qty;
            else if (price > 0) pDbl = price;
          } else if (itype.includes("TPL") || itype.includes("TRIPLE")) {
            tpl += qty;
            pax += qty * 3;
            if (isGratuity) freeTpl += qty;
            else if (price > 0) pTpl = price;
          } else if (itype.includes("CUA") || itype.includes("CUAD")) {
            if (isCumbriaHotel) {
              tpl += qty;
              pax += qty * 3;
              if (isGratuity) freeTpl += qty;
              else if (price > 0) pTpl = price;
            } else {
              cua += qty;
              pax += qty * 4;
              if (isGratuity) freeCua += qty;
              else if (price > 0) pCua = price;
            }
          } else if (itype.includes("SUITE")) {
            dbl += qty;
            pax += qty * 2;
            if (isGratuity) freeDbl += qty;
            else if (price > 0) pDbl = price;
          } else {
            dbl += qty;
            pax += qty * 2;
            if (isGratuity) freeDbl += qty;
            else if (price > 0) pDbl = price;
          }
        });

        if (totalRooms > 0) {
          const prevForDate = result[dateStr] || {};
          const prevPrices = prevForDate.prices || {};
          const finalPrices = {
            individuales: pInd || prevPrices.individuales || 0,
            dobles: pDbl || prevPrices.dobles || 0,
            triples: pTpl || prevPrices.triples || 0,
            cuadruples: pCua || prevPrices.cuadruples || 0
          };
          const payingInd = Math.max(0, ind - freeInd);
          const payingDbl = Math.max(0, dbl - freeDbl);
          const payingTpl = Math.max(0, tpl - freeTpl);
          const payingCua = Math.max(0, cua - freeCua);
          const calcDayAmt = (payingInd * finalPrices.individuales) + (payingDbl * finalPrices.dobles) + (payingTpl * finalPrices.triples) + (payingCua * finalPrices.cuadruples);

          result[dateStr] = {
            ...prevForDate,
            individuales: ind,
            dobles: dbl,
            triples: tpl,
            cuadruples: cua,
            totalHabitaciones: totalRooms,
            pax: pax,
            regimen: foundReg || prevForDate.regimen || "HD",
            status: "confirmada",
            isDefinitive: true,
            revisionReasons: [],
            previousDistribution: null,
            validationSnapshot: null,
            prices: finalPrices,
            dailyAmount: calcDayAmt > 0 ? calcDayAmt : prevForDate.dailyAmount,
            gratuities: prevForDate.gratuities || (freeInd + freeDbl + freeTpl + freeCua > 0 ? {
              individuales: freeInd,
              dobles: freeDbl,
              triples: freeTpl,
              cuadruples: freeCua
            } : prevForDate.gratuities)
          };
        }
      });

      return result;
    };

    const BudgetManager = ({ data, openFicha, formatDate }) => {

      const [searchTerm, setSearchTerm] = React.useState("");


      const [statusFilter, setStatusFilter] = React.useState("TODOS");

      
      const budgetData = React.useMemo(() => {
        return data.filter((g) => {

          const reservaStr = String(g.Reserva || "");

          const isBudget =
            reservaStr.startsWith("PRES-") ||
            String(g.uid || "").startsWith("PRES-");



          if (!isBudget) return false;



          const rawStatus = (

            g.Com_Estado_Interno ||

            g.Estado ||

            ""

          ).toUpperCase();

          // No ocultamos confirmados aquí para que el comercial pueda ver su historial reciente
          if (
            rawStatus.includes("DESESTIMADO") ||
            rawStatus.includes("CANCEL") ||
            rawStatus.includes("ANUL")
          ) {
            return false;
          }



          const term = searchTerm.toLowerCase();

          const name = (g["Nombre del Grupo"] || "").toLowerCase();

          const agency = (g["Empresa/Agencia"] || "").toLowerCase();

          const reserva = reservaStr.toLowerCase();



          const matchesSearch =

            name.includes(term) ||

            agency.includes(term) ||

            reserva.includes(term);

          const matchesStatus =

            statusFilter === "TODOS" || rawStatus.includes(statusFilter);



          return matchesSearch && matchesStatus;

        }).sort((a, b) => {
          const dateA = a.createdAt?.seconds ? a.createdAt.seconds : (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
          const dateB = b.createdAt?.seconds ? b.createdAt.seconds : (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
          return dateB - dateA;
        });
      }, [data, searchTerm, statusFilter]);



      const getBudgetStatusProps = (statusRaw) => {

        const s = (statusRaw || "").toString().toUpperCase();

        if (s.includes("CONFIRM"))

          return {

            color: "bg-emerald-500",

            text: "bg-emerald-50 text-emerald-600",

            component: IconCheckCircle,

            label: "CONFIRMADO",

          };

        if (

          s.includes("DESESTIMADO") ||

          s.includes("CANCEL") ||

          s.includes("ANUL")

        )

          return {

            color: "bg-slate-400",

            text: "bg-slate-50 text-slate-500",

            component: IconXCircle,

            label: "DESESTIMADO",

          };

        if (s.includes("SEGUIMIENTO"))

          return {

            color: "bg-indigo-500",

            text: "bg-indigo-50 text-indigo-600",

            component: IconPhoneForwarded,

            label: "SEGUIMIENTO",

          };

        if (s.includes("ENVIADO"))

          return {

            color: "bg-blue-500",

            text: "bg-blue-50 text-blue-600",

            component: IconMail,

            label: "ENVIADO",

          };

        return {

          color: "bg-amber-500",

          text: "bg-amber-50 text-amber-600",

          component: IconClock,

          label: "PENDIENTE",

        };

      };







      return (

        <div className="animate-fade-in space-y-6">

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

              <div>

                <h2 className="text-2xl font-black text-slate-800 tracking-tight">

                  Seguimiento de Cotizaciones

                </h2>

                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">

                  Control comercial y conversión de leads

                </p>

              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">

                <div className="relative flex-1 md:w-64">

                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <DebouncedSearchInput
                    placeholder="Buscar presupuesto..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 transition-all font-medium"
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />

                </div>

                <select

                  value={statusFilter}

                  onChange={(e) => setStatusFilter(e.target.value)}

                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-500 text-slate-600"

                >

                  <option value="TODOS">Todos los Estados</option>

                  <option value="PENDIENTE">Pendientes</option>

                  <option value="ENVIADO">Enviados</option>

                  <option value="SEGUIMIENTO">En Seguimiento</option>

                </select>

                <button

                  onClick={() => (window.location.href = "AltaEmail.html")}

                  className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"

                >

                  <IconPlus className="w-4 h-4" />

                  Nuevo

                </button>

              </div>

            </div>

          </div>

          <div className="overflow-x-auto bg-white rounded-3xl border border-slate-100">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest min-w-[300px]">Grupo / Hotel</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Entrada</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Límite 7d</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Pax / Hab</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Presupuesto</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]">Gestión</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {budgetData.map((budget, i) => {
                  const st = getBudgetStatusProps(budget.Com_Estado_Interno || budget.Estado);
                  const hotelName = budget.Hotel_Asignado || budget.Hotel || "N/A";
                  const totalAmt = budget["Importe(*)"] || 0;
                  const roomsCount = budget["Cant. Habitaciones"] || budget["Habitaciones"] || budget["Cant."] || 0;

                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Grupo / Hotel */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-slate-100 overflow-hidden p-1 shadow-sm group-hover:scale-105 transition-transform">
                            <img
                              src={normalizeHotelNameLocal(hotelName, "Sercotel Guadiana") === "Cumbria Spa&Hotel" ? "Logos/Cumbria Spa&Hotel.jpg" : "Logos/Sercotel Guadiana.jpg"}
                              className="w-full h-full object-contain"
                              alt="Hotel"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-slate-800 uppercase leading-tight truncate group-hover:text-indigo-600 transition-colors">
                              {budget["Nombre del Grupo"]}
                            </h4>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 opacity-60">
                              {hotelName} • ID: {budget.Reserva}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Entrada */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-black text-slate-700">{formatDate(budget.Entrada)}</span>
                      </td>

                      {/* Countdown 7d */}
                      <td className="px-6 py-4 text-center">
                        {(() => {
                          const created = budget.createdAt?.seconds ? new Date(budget.createdAt.seconds * 1000) : (budget.createdAt ? new Date(budget.createdAt) : null);
                          if (!created) return <span className="text-[10px] font-bold text-slate-300">N/A</span>;
                          
                          const diff = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
                          const daysLeft = 7 - diff;
                          const color = daysLeft <= 1 ? "text-rose-600 bg-rose-50" : (daysLeft <= 3 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50");
                          
                          return (
                            <div className={`inline-flex flex-col items-center px-2 py-1 rounded-lg ${color}`}>
                              <span className="text-xs font-black">{daysLeft}d</span>
                              <span className="text-[7px] font-bold uppercase tracking-tighter">Restantes</span>
                            </div>
                          );
                        })()}
                      </td>

                      {/* Pax / Hab */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1 text-slate-700">
                            <IconUsers className="w-3 h-3" />
                            <span className="text-xs font-black">{budget["Pax."] || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <i className="fas fa-bed text-[10px]"></i>
                            <span className="text-[10px] font-bold">{roomsCount}</span>
                          </div>
                        </div>
                      </td>

                      {/* Presupuesto */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-black text-indigo-600 tracking-tight">{formatNum(totalAmt)}€</span>
                      </td>

                      {/* Gestión */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-400">
                            <i className="fas fa-building text-[9px] w-3 text-center"></i>
                            <span className="text-[9px] font-bold uppercase">
                              {budget["Empresa/Agencia"] || "Venta Directa"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-indigo-400">
                            <i className="fas fa-user-tie text-[9px] w-3 text-center"></i>
                            <span className="text-[9px] font-bold uppercase">
                              {budget["Com_Comercial"] || "SIN ASIGNAR"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4 text-center">
                        <span className={`${st.text} px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest block mx-auto w-fit`}>
                          {st.label}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { window.location.href = "Presupuestos.html?id=" + encodeURIComponent(budget.Reserva); }}
                            className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
                            title="Ver / Editar"
                          >
                            <i className="fas fa-external-link-alt text-xs"></i>
                          </button>
                          <button
                            onClick={() => {
                              localStorage.setItem("selectedGroup", JSON.stringify(budget));
                              window.location.href = "AltaEmail.html?edit=" + encodeURIComponent(budget.Reserva);
                            }}
                            className="w-8 h-8 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
                            title="Editar"
                          >
                            <i className="fas fa-edit text-xs"></i>
                          </button>
                          <button
                            onClick={() => {
                              localStorage.setItem('selectedGroup', JSON.stringify(budget));
                              window.location.href = "Presupuestos.html?id=" + encodeURIComponent(budget.Reserva);
                            }}
                            className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
                            title="Ver Proforma"
                          >
                            <i className="fas fa-file-invoice text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {budgetData.length === 0 && (
              <div className="py-32 text-center">
                <div className="flex flex-col items-center gap-4 opacity-20">
                  <IconClipboardX size={64} />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">No hay presupuestos en esta sección</p>
                </div>
              </div>
            )}
          </div>

        </div>

      );

    };



    
    // ══════════════════════════════════════════════════════════════════════════
    // NEXUS GROUPS — MÓDULO OBJETIVOS DE GRUPOS Y TARIFAS (Reqs 22-33)
    // ══════════════════════════════════════════════════════════════════════════
    const GroupTargetsModule = ({ data, processedData, dailyOccupancyList, boardPricingConfig }) => {
      const gts = window.GroupTargetsService;

      // Estados de control
      const [targetHotel, setTargetHotel] = useState("guadiana");
      const [targetYear, setTargetYear] = useState(2027);
      const [baseYear, setBaseYear] = useState(2026);
      const [scenario, setScenario] = useState("base");
      const [growthPercent, setGrowthPercent] = useState(0); // 0% por defecto (Req 25)

      // Estados de Presupuesto Oficial y Seguridad (Clave 1234)
      const [isOfficial, setIsOfficial] = useState(false);
      const [isUnlocked, setIsUnlocked] = useState(false);
      const [officialDoc, setOfficialDoc] = useState(null);
      const [showPinModal, setShowPinModal] = useState(false);
      const [pinInput, setPinInput] = useState("");
      const [pinError, setPinError] = useState(null);
      const [manualMonthOverrides, setManualMonthOverrides] = useState({});
      const [isManualEditMode, setIsManualEditMode] = useState(false);

      const [activeSubView, setActiveSubView] = useState("monthly"); // 'monthly' | 'regimen' | 'category'
      const [showTariffModal, setShowTariffModal] = useState(false);
      const [tariffModalHotel, setTariffModalHotel] = useState("guadiana");
      const [tariffModalYear, setTariffModalYear] = useState(2027);
      const [copySourceYear, setCopySourceYear] = useState(2027);
      const [copyPercent, setCopyPercent] = useState(0);
      const [copyFixed, setCopyFixed] = useState(0);
      const [copyRounding, setCopyRounding] = useState("0.50");
      const [showCancelledModal, setShowCancelledModal] = useState(false);
      const [toastMsg, setToastMsg] = useState(null);

      // Estados de Seguridad y Edición de Tarifas Oficiales (Clave 1234 y Sugerencias)
      const [isTariffLocked, setIsTariffLocked] = useState(false);
      const [showTariffPinModal, setShowTariffPinModal] = useState(false);
      const [tariffPinInput, setTariffPinInput] = useState("");
      const [tariffPinError, setTariffPinError] = useState(null);
      const [isTariffSuggested, setIsTariffSuggested] = useState(false);
      const [tariffSuggestedGrowth, setTariffSuggestedGrowth] = useState(4.0);

      // Catálogo de tarifas local y editable
      const [tariffsCatalog, setTariffsCatalog] = useState(() => {
        let initial = {};
        try {
          const saved = localStorage.getItem("nexus_group_tariffs");
          if (saved) initial = JSON.parse(saved);
        } catch(e) {}
        if (!initial["2027"] && gts && gts.DEFAULT_GROUP_TARIFFS_2027) {
          initial["2027"] = JSON.parse(JSON.stringify(gts.DEFAULT_GROUP_TARIFFS_2027));
        }
        return initial;
      });

      const isYearOfficial = (hotelKeyOrName, year) => {
        if (gts && typeof gts.isOfficialTariff === "function") {
          return gts.isOfficialTariff(tariffsCatalog, hotelKeyOrName, year);
        }
        const hKey = gts ? gts.normalizeHotelKey(hotelKeyOrName) : (String(hotelKeyOrName || "").toLowerCase().includes("cumbria") ? "cumbria" : "guadiana");
        const yKey = String(year);
        if (tariffsCatalog && tariffsCatalog[yKey] && tariffsCatalog[yKey][hKey]) {
          const entry = tariffsCatalog[yKey][hKey];
          if (entry._isOfficial === true || entry._savedAt) return true;
        }
        return Number(year) === 2027;
      };

      // Copia editable temporal para el modal de tarifas
      const [editingTariffs, setEditingTariffs] = useState(null);

      const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 4000);
      };

      // Carga y verificación automática de Presupuesto Oficial al cambiar hotel o año
      useEffect(() => {
        const docKey = "nexus_target_" + targetHotel + "_" + targetYear;
        let localData = null;
        try {
          const raw = localStorage.getItem(docKey);
          if (raw) localData = JSON.parse(raw);
        } catch(e) {}

        const applyTargetDoc = (doc) => {
          if (doc && doc.isOfficial) {
            setOfficialDoc(doc);
            setIsOfficial(true);
            setIsUnlocked(false);
            if (doc.scenario) setScenario(doc.scenario);
            if (typeof doc.growthPercent === "number") setGrowthPercent(doc.growthPercent);
            if (doc.manualOverrides) setManualMonthOverrides(doc.manualOverrides);
            else setManualMonthOverrides({});
          } else {
            setOfficialDoc(null);
            setIsOfficial(false);
            setIsUnlocked(true); // Libre para simular en años sin presupuesto
            setManualMonthOverrides({});
          }
        };

        applyTargetDoc(localData);

        // Sincronizar catálogo de tarifas desde Firestore settings si existe
        if (window.db && typeof window.db.collection === "function") {
          window.db.collection("settings").doc("groupTariffs").get()
            .then(snap => {
              if (snap.exists) {
                const fsTariffs = snap.data();
                if (fsTariffs && typeof fsTariffs === "object") {
                  setTariffsCatalog(prev => {
                    const merged = { ...fsTariffs, ...prev };
                    try { localStorage.setItem("nexus_group_tariffs", JSON.stringify(merged)); } catch(e) {}
                    return merged;
                  });
                }
              }
            })
            .catch(err => console.warn("Error cargando groupTariffs desde Firestore:", err));
        }

        if (window.db && typeof window.db.collection === "function") {
          window.db.collection("groupTargets").doc(targetHotel + "_" + targetYear).get()
            .then(snap => {
              if (snap.exists) {
                const fsData = snap.data();
                if (fsData) {
                  applyTargetDoc(fsData);
                  try {
                    localStorage.setItem(docKey, JSON.stringify(fsData));
                  } catch(e) {}
                }
              } else if (!localData) {
                applyTargetDoc(null);
              }
            })
            .catch(err => console.warn("Error cargando groupTargets desde Firestore:", err));
        }
      }, [targetHotel, targetYear]);

      // 1. Agregación histórica base (Req 23)
      const histData = useMemo(() => {
        if (!gts || !dailyOccupancyList) return { monthly: {}, overall: {}, cancelled: { count: 0, pax: 0, lostRevenue: 0 } };
        return gts.aggregateHistoricalGroupData(dailyOccupancyList, {
          hotel: targetHotel,
          year: baseYear
        });
      }, [dailyOccupancyList, targetHotel, baseYear]);

      // 2. Tarifas activas para el hotel y año objetivo
      const currentTariffs = useMemo(() => {
        if (!gts) return {};
        return gts.getTariffsForHotelAndYear(tariffsCatalog, targetHotel, targetYear);
      }, [tariffsCatalog, targetHotel, targetYear]);

      // 3. Generación de objetivo (Req 24, 25, 27)
      const generatedTarget = useMemo(() => {
        if (!gts) return null;
        return gts.generateTargetFromHistorical(histData, {
          hotel: targetHotel,
          targetYear: targetYear,
          baseYear: baseYear,
          scenario: scenario,
          growthPercent: Number(growthPercent) || 0,
          tariffs: currentTariffs,
          manualOverrides: manualMonthOverrides
        });
      }, [histData, targetHotel, targetYear, baseYear, scenario, growthPercent, currentTariffs, manualMonthOverrides]);

      // 4. Datos reales del año objetivo (si existen)
      const realDataTargetYear = useMemo(() => {
        if (!gts || !dailyOccupancyList) return { monthly: {}, overall: {}, cancelled: { count: 0, pax: 0, lostRevenue: 0 } };
        return gts.aggregateHistoricalGroupData(dailyOccupancyList, {
          hotel: targetHotel,
          year: targetYear
        });
      }, [dailyOccupancyList, targetHotel, targetYear]);

      // 5. Comparativa Real vs Objetivo (Req 30, 31)
      const comparison = useMemo(() => {
        if (!gts || !generatedTarget) return null;
        return gts.compareRealVsTarget(realDataTargetYear, generatedTarget);
      }, [realDataTargetYear, generatedTarget]);

      // 6. Validaciones de integridad (Req 33)
      const integrity = useMemo(() => {
        if (!gts || !generatedTarget) return { valid: true, errors: [], warnings: [] };
        return gts.validateTargetIntegrity(generatedTarget, currentTariffs);
      }, [generatedTarget, currentTariffs]);

      // Manejadores de Modal de Tarifas
      const openTariffModal = (h, y) => {
        const selH = h || targetHotel;
        const selY = Number(y) || targetYear;
        const hKey = gts ? gts.normalizeHotelKey(selH) : (selH.includes("cumbria") ? "cumbria" : "guadiana");
        const yKey = String(selY);

        setTariffModalHotel(selH);
        setTariffModalYear(selY);
        setTariffPinError(null);
        setTariffPinInput("");

        const isSavedOfficial = isYearOfficial(selH, selY);

        if (isSavedOfficial) {
          setIsTariffLocked(true);
          setIsTariffSuggested(false);
          if (gts) {
            const t = gts.getTariffsForHotelAndYear(tariffsCatalog, selH, selY);
            const tariffsCopy = JSON.parse(JSON.stringify(t));
            // Inicializar desgloses oficiales por defecto si no existen
            if (!tariffsCopy._desglose) {
              let defB = 8.5;
              let defL = 19.5;
              let defD = 19.5;
              if (tariffsCopy.HD?.doble && tariffsCopy.HA?.doble) {
                const diff = Math.round(((tariffsCopy.HD.doble - tariffsCopy.HA.doble) / 2) * 100) / 100;
                if (diff > 0) defB = diff;
              }
              if (tariffsCopy.MP?.doble && tariffsCopy.HD?.doble) {
                const diff = Math.round(((tariffsCopy.MP.doble - tariffsCopy.HD.doble) / 2) * 100) / 100;
                if (diff > 0) defL = diff;
              }
              if (tariffsCopy.PC?.doble && tariffsCopy.MP?.doble) {
                const diff = Math.round(((tariffsCopy.PC.doble - tariffsCopy.MP.doble) / 2) * 100) / 100;
                if (diff > 0) defD = diff;
              }
              tariffsCopy._desglose = {
                breakfast: defB,
                lunch: defL,
                dinner: defD
              };
            }
            setEditingTariffs(tariffsCopy);
          }
        } else {
          // Año aún no guardado como oficial (ej. 2028) -> sugerir según estadísticas
          if (gts && typeof gts.suggestTariffsForYear === "function") {
            const sug = gts.suggestTariffsForYear(tariffsCatalog, selH, selY, {
              growthPercent: 4.0,
              histData: histData,
              prevData: realDataTargetYear
            });
            setIsTariffSuggested(true);
            setTariffSuggestedGrowth(sug._suggestedGrowth || 4.0);
            setIsTariffLocked(false);
            setEditingTariffs(sug);
          } else if (gts) {
            const t = gts.getTariffsForHotelAndYear(tariffsCatalog, selH, selY);
            setIsTariffSuggested(false);
            setIsTariffLocked(false);
            setEditingTariffs(JSON.parse(JSON.stringify(t)));
          }
        }
        setShowTariffModal(true);
      };

      const handleApplyStatisticalSuggestion = (customGrowth) => {
        if (!gts || typeof gts.suggestTariffsForYear !== "function") return;
        if (isTariffLocked) {
          setShowTariffPinModal(true);
          setTariffPinError("Tarifa oficial bloqueada. Introduce la clave 1234 para recalcular.");
          return;
        }
        const growth = typeof customGrowth === "number" ? customGrowth : (tariffSuggestedGrowth || 4.0);
        const sug = gts.suggestTariffsForYear(tariffsCatalog, tariffModalHotel, tariffModalYear, {
          growthPercent: growth,
          histData: histData,
          prevData: realDataTargetYear
        });
        setIsTariffSuggested(true);
        setTariffSuggestedGrowth(sug._suggestedGrowth || growth);
        setEditingTariffs(sug);
        showToast("Tarifas sugeridas calculadas para " + tariffModalYear + " (+" + (sug._suggestedGrowth || growth) + "% con redondeo oficial).");
      };

      const handleVerifyTariffPin = (e) => {
        if (e) e.preventDefault();
        if (tariffPinInput.trim() === "1234") {
          setIsTariffLocked(false);
          setShowTariffPinModal(false);
          setTariffPinInput("");
          setTariffPinError(null);
          showToast("🔓 Tarifa Oficial " + tariffModalYear + " desbloqueada para modificación.");
        } else {
          setTariffPinError("Clave incorrecta. Solo autorizada con clave 1234.");
        }
      };

      const handleCellPriceChange = (reg, cat, val) => {
        if (!editingTariffs) return;
        if (isTariffLocked) {
          setShowTariffPinModal(true);
          setTariffPinError("Tarifa oficial bloqueada. Introduce la clave 1234 para editar.");
          return;
        }
        const updated = JSON.parse(JSON.stringify(editingTariffs));
        if (tariffModalHotel === "cumbria" && cat === "cuadruple") {
          return; // Bloqueado estrictamente (Req 26 y 33)
        }
        if (val === "" || val === null || val === undefined) {
          updated[reg][cat] = null;
        } else {
          const n = parseFloat(val);
          updated[reg][cat] = isNaN(n) ? 0 : n;
        }
        setEditingTariffs(updated);
      };

      const handleSaveTariffs = () => {
        if (!editingTariffs) return;
        if (isTariffLocked) {
          setShowTariffPinModal(true);
          setTariffPinError("La tarifa oficial está bloqueada. Introduce la clave 1234 para guardar cambios.");
          return;
        }
        const updatedCatalog = JSON.parse(JSON.stringify(tariffsCatalog));
        const yKey = String(tariffModalYear);
        const hKey = gts ? gts.normalizeHotelKey(tariffModalHotel) : (tariffModalHotel.includes("cumbria") ? "cumbria" : "guadiana");
        if (!updatedCatalog[yKey]) updatedCatalog[yKey] = {};

        const savedData = JSON.parse(JSON.stringify(editingTariffs));
        savedData._isOfficial = true;
        savedData._savedAt = new Date().toISOString();
        savedData._officialYear = tariffModalYear;
        savedData._hotel = hKey;
        delete savedData._isSuggested;

        updatedCatalog[yKey][hKey] = savedData;
        setTariffsCatalog(updatedCatalog);
        setIsTariffLocked(true);
        setIsTariffSuggested(false);

        try {
          localStorage.setItem("nexus_group_tariffs", JSON.stringify(updatedCatalog));
        } catch(e) {}

        // Persistir en Firestore en settings/groupTariffs para todos los usuarios y pestañas
        if (window.db && typeof window.db.collection === "function") {
          window.db.collection("settings").doc("groupTariffs").set(updatedCatalog, { merge: true })
            .catch(err => console.warn("Error guardando groupTariffs en Firestore:", err));
        }

        // Sincronizar desgloses oficiales con boardPricingConfig
        if (savedData._desglose) {
          const hotelFullName = tariffModalHotel === "guadiana" ? "Sercotel Guadiana" : "Cumbria Spa&Hotel";
          const newBoardPricing = {
            ...boardPricingConfig,
            [hotelFullName]: {
              breakfast: Number(savedData._desglose.breakfast) || 8.5,
              meal: Number(savedData._desglose.lunch || savedData._desglose.meal) || 19.5,
            }
          };
          setBoardPricingConfig(newBoardPricing);
          try {
            window.NexusUtils?.safeStorage?.setItem("boardPricingConfig", JSON.stringify(newBoardPricing));
            if (window.db && typeof window.db.collection === "function") {
              window.db.collection("settings").doc("boardPricing").set(newBoardPricing, { merge: true });
            }
          } catch(e) {}
        }

        setShowTariffModal(false);
        showToast("🔒 Tarifa Oficial " + tariffModalYear + " guardada y bloqueada para " + (tariffModalHotel === "guadiana" ? "Hotel Guadiana" : "Hotel Cumbria"));
      };

      const handleResetDefault2027 = () => {
        if (!gts) return;
        if (isTariffLocked) {
          setShowTariffPinModal(true);
          setTariffPinError("Tarifa oficial bloqueada. Introduce la clave 1234 para restablecer.");
          return;
        }
        const def = gts.DEFAULT_GROUP_TARIFFS_2027[tariffModalHotel] || gts.DEFAULT_GROUP_TARIFFS_2027.guadiana;
        setEditingTariffs(JSON.parse(JSON.stringify(def)));
        showToast("Tarifas restablecidas a los valores oficiales 2027.");
      };

      const handleApplyCopyTariffs = () => {
        if (!gts) return;
        if (isTariffLocked) {
          setShowTariffPinModal(true);
          setTariffPinError("Tarifa oficial bloqueada. Introduce la clave 1234 para aplicar copia.");
          return;
        }
        const src = gts.getTariffsForHotelAndYear(tariffsCatalog, tariffModalHotel, copySourceYear);
        const copied = gts.copyTariffsWithAdjustment(src, {
          percentIncrease: Number(copyPercent) || 0,
          fixedIncrease: Number(copyFixed) || 0,
          targetHotel: tariffModalHotel,
          rounding: copyRounding
        });
        setEditingTariffs(copied);
        showToast("Tarifas copiadas desde " + copySourceYear + " con ajuste y redondeo aplicado.");
      };

      const handleRoundCurrentTariffs = (roundingType) => {
        if (!editingTariffs || !gts) return;
        if (isTariffLocked) {
          setShowTariffPinModal(true);
          setTariffPinError("Tarifa oficial bloqueada. Introduce la clave 1234 para redondear.");
          return;
        }
        const updated = JSON.parse(JSON.stringify(editingTariffs));
        for (const reg in updated) {
          for (const cat in updated[reg]) {
            if (updated[reg][cat] !== null && updated[reg][cat] !== undefined) {
              updated[reg][cat] = gts.roundPrice(updated[reg][cat], roundingType);
            }
          }
        }
        setEditingTariffs(updated);
        showToast("Tarifas redondeadas a " + (roundingType === "0.50" ? "0,50 €" : roundingType === "1.00" ? "1 € entero" : "5 €"));
      };

      // Guardar Presupuesto Oficial
      const handleSaveOfficialTarget = () => {
        if (!gts || !generatedTarget) return;
        try {
          const doc = gts.prepareTargetDocumentForSave(generatedTarget, "Dirección Comercial", {
            isOfficial: true,
            officialSavedAt: new Date().toISOString(),
            officialSavedBy: "Dirección Comercial",
            manualOverrides: manualMonthOverrides
          });
          const key = "nexus_target_" + targetHotel + "_" + targetYear;
          localStorage.setItem(key, JSON.stringify(doc));
          if (window.db && typeof window.db.collection === "function") {
            window.db.collection("groupTargets").doc(targetHotel + "_" + targetYear).set(doc, { merge: true })
              .catch(err => console.warn("Error guardando en Firestore groupTargets:", err));
          }
          setOfficialDoc(doc);
          setIsOfficial(true);
          setIsUnlocked(false);
          showToast("🔒 Presupuesto Oficial " + targetYear + " grabado y bloqueado con éxito.");
        } catch(err) {
          showToast("Error al guardar el presupuesto: " + err.message);
        }
      };

      // Desbloqueo mediante Clave 1234
      const handleVerifyPin = (e) => {
        if (e) e.preventDefault();
        if (pinInput.trim() === "1234") {
          setIsUnlocked(true);
          setShowPinModal(false);
          setPinInput("");
          setPinError(null);
          setScenario("personalizado");
          setIsManualEditMode(true);
          showToast("🔓 Presupuesto Oficial desbloqueado. Ya puedes modificar los objetivos mes a mes.");
        } else {
          setPinError("Clave incorrecta. Solo autorizada con clave 1234.");
        }
      };

      const handleStartManualEditing = () => {
        if (isOfficial && !isUnlocked) {
          setShowPinModal(true);
          setPinError("El presupuesto oficial está bloqueado. Introduzca la clave 1234 para desbloquear y modificar los objetivos.");
          return;
        }
        setScenario("personalizado");
        setIsManualEditMode(true);
        showToast("✏️ Modo edición de objetivos activado. Introduce los importes directamente en la columna 'Ingresos Obj'.");
      };

      const handleRelockBudget = () => {
        setIsUnlocked(false);
        showToast("🔒 Presupuesto Oficial vuelto a bloquear.");
      };

      // Selección rápida de escenario
      const handleSelectScenario = (scenKey) => {
        if (isOfficial && !isUnlocked) {
          setShowPinModal(true);
          setPinError("El presupuesto oficial está bloqueado. Introduzca la clave 1234 para modificar el escenario.");
          return;
        }
        setScenario(scenKey);
        if (scenKey === "base") setGrowthPercent(0);
        else if (scenKey === "conservador") setGrowthPercent(3);
        else if (scenKey === "recomendado") setGrowthPercent(7);
        else if (scenKey === "ambicioso") setGrowthPercent(12);
        else if (scenKey === "personalizado") setIsManualEditMode(true);
      };

      // Ajustes mensuales manuales
      const handleMonthOverrideChange = (m, field, value) => {
        if (isOfficial && !isUnlocked) return;
        const val = value === "" ? null : parseFloat(value);
        setManualMonthOverrides(prev => ({
          ...prev,
          [m]: {
            ...(prev[m] || {}),
            [field]: isNaN(val) ? null : val
          }
        }));
      };

      const handleClearManualOverrides = () => {
        if (isOfficial && !isUnlocked) return;
        setManualMonthOverrides({});
        showToast("Ajustes manuales restablecidos a valores calculados.");
      };

      const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];

      return (
        <div className="space-y-6 animate-fade-in text-slate-800 pb-16">
          {/* TOAST NOTIFICATION */}
          {toastMsg && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-slide-up">
              <span className="text-emerald-400 text-lg">✓</span>
              <span className="text-sm font-medium">{toastMsg}</span>
            </div>
          )}

          {/* CABECERA Y PANEL DE CONTROL */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-bold">
                    🎯
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 font-outfit tracking-tight">
                      Objetivos de Grupos y Tarifas
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Planificación estratégica anual, tarifas oficiales y seguimiento de cumplimiento por categoría y régimen
                    </p>
                  </div>
                </div>
              </div>

              {/* ACCIONES PRINCIPALES */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Badge de Presupuesto Oficial */}
                {isOfficial && (
                  <span className={"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black border " + (isUnlocked ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200")}>
                    {isUnlocked ? "🔓 Desbloqueado para edición" : "🔒 Presupuesto Oficial"}
                    {officialDoc && officialDoc.officialSavedAt && (
                      <span className="font-normal text-[10px] opacity-70">
                        · {new Date(officialDoc.officialSavedAt).toLocaleDateString("es-ES")}
                      </span>
                    )}
                  </span>
                )}

                <button
                  onClick={() => openTariffModal(targetHotel, targetYear)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-slate-200"
                >
                  <span>🏷️</span> Tarifas Grupos {targetYear}
                </button>

                <button
                  onClick={() => setShowCancelledModal(true)}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold transition flex items-center gap-2 border border-amber-200"
                >
                  <span>🚫</span> Anuladas ({histData.cancelled.count})
                </button>

                {/* Botón principal de guardado según estado */}
                {isOfficial && !isUnlocked ? (
                  <button
                    onClick={() => { setShowPinModal(true); setPinError(null); setPinInput(""); }}
                    className="px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
                  >
                    <span>🔑</span> Desbloquear (Clave)
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveOfficialTarget}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center gap-2"
                    >
                      <span>💾</span> Grabar Presupuesto Oficial
                    </button>
                    {isOfficial && isUnlocked && (
                      <button
                        onClick={handleRelockBudget}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                      >
                        <span>🔒</span> Volver a Bloquear
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* SELECTORES DE CONFIGURACIÓN DEL OBJETIVO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              {/* Hotel */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Hotel
                </label>
                <select
                  value={targetHotel}
                  onChange={(e) => setTargetHotel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="guadiana">Hotel Guadiana</option>
                  <option value="cumbria">Hotel Cumbria</option>
                </select>
              </div>

              {/* Año Objetivo */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Año Objetivo
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {[2025, 2026, 2027, 2028, 2029, 2030].map(y => {
                    const isOff = isYearOfficial(targetHotel, y);
                    return (
                      <option key={y} value={y}>
                        {y} {isOff ? "(Oficial 🔒)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Año Base Histórico */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Año Base Histórico
                </label>
                <select
                  value={baseYear}
                  onChange={(e) => setBaseYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>

              {/* % Incremento propuesto */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  % Incremento Propuesto
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.5"
                    value={growthPercent}
                    onChange={(e) => setGrowthPercent(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => setGrowthPercent(0)}
                      className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold"
                      title="Restablecer a 0%"
                    >
                      0%
                    </button>
                    <button
                      onClick={() => setGrowthPercent(p => Number((p + 5).toFixed(1)))}
                      className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold"
                      title="+5%"
                    >
                      +5%
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* TARJETAS DE ESCENARIO */}
            <div className="pt-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Escenario de Objetivo
                {isOfficial && !isUnlocked && (
                  <span className="ml-2 text-amber-600 font-normal normal-case">🔒 Bloqueado — desbloquea para cambiar escenario</span>
                )}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {[
                  { key: "base",          icon: "🏛️", label: "Base",        pct: "+0%",   desc: "Igual que año base",       color: "slate"  },
                  { key: "conservador",   icon: "🛡️", label: "Conservador", pct: "+3%",   desc: "Crecimiento prudente",     color: "sky"    },
                  { key: "recomendado",   icon: "⭐",  label: "Recomendado", pct: "+7%",   desc: "Objetivo equilibrado",     color: "indigo" },
                  { key: "ambicioso",     icon: "🚀",  label: "Ambicioso",   pct: "+12%",  desc: "Máximo crecimiento",       color: "purple" },
                  { key: "personalizado", icon: "✏️",  label: "Manual",      pct: "libre", desc: "Define tu % mensualmente", color: "amber"  }
                ].map(sc => {
                  const isActive = scenario === sc.key;
                  const colorMap = {
                    slate:  { active: "border-slate-500 bg-slate-50 text-slate-900",    inactive: "border-slate-200 bg-white text-slate-500 hover:border-slate-400" },
                    sky:    { active: "border-sky-500 bg-sky-50 text-sky-900",          inactive: "border-slate-200 bg-white text-slate-500 hover:border-sky-400" },
                    indigo: { active: "border-indigo-500 bg-indigo-50 text-indigo-900", inactive: "border-slate-200 bg-white text-slate-500 hover:border-indigo-400" },
                    purple: { active: "border-purple-500 bg-purple-50 text-purple-900", inactive: "border-slate-200 bg-white text-slate-500 hover:border-purple-400" },
                    amber:  { active: "border-amber-500 bg-amber-50 text-amber-900",    inactive: "border-slate-200 bg-white text-slate-500 hover:border-amber-400" }
                  };
                  const cls = colorMap[sc.color][isActive ? "active" : "inactive"];
                  return (
                    <button
                      key={sc.key}
                      onClick={() => handleSelectScenario(sc.key)}
                      className={"rounded-xl border-2 p-3 text-left transition flex flex-col gap-0.5 " + cls + (isOfficial && !isUnlocked ? " opacity-60 cursor-not-allowed" : " cursor-pointer")}
                    >
                      <span className="text-base leading-none">{sc.icon}</span>
                      <span className="text-[11px] font-black mt-1 block">{sc.label}</span>
                      <span className={"text-[13px] font-black " + (isActive ? "" : "text-slate-400")}>{sc.pct}</span>
                      <span className="text-[9px] font-semibold mt-0.5 opacity-70 leading-tight">{sc.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ALERTAS DE INTEGRIDAD (Req 33) */}
          {integrity.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-xl text-red-600">⚠️</span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">Errores de Validación</h4>
                <ul className="list-disc list-inside text-xs mt-1 space-y-0.5">
                  {integrity.errors.map((err, idx) => <li key={idx}>{err}</li>)}
                </ul>
              </div>
            </div>
          )}

          {integrity.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-xl text-amber-600">ℹ️</span>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">Aviso sobre Datos Provisionales</h4>
                <p className="text-xs mt-0.5">
                  Parte de los datos del año base contienen propuestas automáticas de habitaciones pendientes de confirmación. El objetivo resultante tiene consideración de <strong>Provisional</strong>.
                </p>
              </div>
            </div>
          )}

          {/* KPI CARDS RESUMEN */}
          {generatedTarget && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Ingresos Objetivo */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Ingresos Previstos {targetYear}</span>
                <div className="my-2">
                  <div className="text-2xl font-black text-slate-900">
                    {generatedTarget.overall.targetRevenue.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Histórico Base: {histData.overall.totalRevenue.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </div>
                </div>
                <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg w-fit">
                  {growthPercent >= 0 ? "+" + growthPercent + "%" : growthPercent + "%"} vs año {baseYear}
                </div>
              </div>

              {/* Habitaciones-Noche */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Habitaciones-Noche</span>
                <div className="my-2">
                  <div className="text-2xl font-black text-slate-900">
                    {generatedTarget.overall.targetRoomNights.toLocaleString("es-ES")}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Ind: {generatedTarget.overall.byCategory.individual} · Dbl: {generatedTarget.overall.byCategory.doble} · Tpl: {generatedTarget.overall.byCategory.triple} {targetHotel !== "cumbria" ? "· Cua: " + generatedTarget.overall.byCategory.cuadruple : ""}
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg w-fit">
                  Base {baseYear}: {histData.overall.totalRoomNights} hab/noche
                </div>
              </div>

              {/* Pax Previstos */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Personas (Pax)</span>
                <div className="my-2">
                  <div className="text-2xl font-black text-slate-900">
                    {generatedTarget.overall.targetPax.toLocaleString("es-ES")}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Pernoctaciones: {generatedTarget.overall.targetPernoctaciones.toLocaleString("es-ES")}
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg w-fit">
                  Base {baseYear}: {histData.overall.totalPax} pax
                </div>
              </div>

              {/* Estado del Objetivo */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Estado del Objetivo</span>
                <div className="my-2">
                  <div className={"text-lg font-black " + (generatedTarget.overall.isProvisional ? "text-amber-600" : "text-emerald-600")}>
                    {generatedTarget.overall.isProvisional ? "Provisional" : "Definitivo"}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {generatedTarget.overall.isProvisional ? "Contiene propuestas estimadas" : "100% distribuciones validadas"}
                  </div>
                </div>
                <div className={"text-[10px] font-bold px-2 py-1 rounded-lg w-fit " + (generatedTarget.overall.isProvisional ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>
                  {generatedTarget.overall.isProvisional ? "Pendiente Confirmación" : "Validado"}
                </div>
              </div>
            </div>
          )}

          {/* SELECTOR DE VISTA: MENSUAL / RÉGIMEN / CATEGORÍA */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveSubView("monthly")}
              className={"px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 " + (activeSubView === "monthly" ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200")}
            >
              <span>📅</span> Tabla Mensual Real vs Objetivo
            </button>
            <button
              onClick={() => setActiveSubView("regimen")}
              className={"px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 " + (activeSubView === "regimen" ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200")}
            >
              <span>🍽️</span> Desglose por Régimen
            </button>
            <button
              onClick={() => setActiveSubView("category")}
              className={"px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 " + (activeSubView === "category" ? "bg-indigo-600 text-white shadow-sm" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200")}
            >
              <span>🛏️</span> Desglose por Categoría Ocupación
            </button>
          </div>

          {/* VISTA 1: TABLA MENSUAL REAL VS OBJETIVO (Req 30 y 31) */}
          {activeSubView === "monthly" && comparison && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Seguimiento Mensual {targetYear} — {targetHotel === "guadiana" ? "Hotel Guadiana" : "Hotel Cumbria"}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {scenario === "personalizado" && (!isOfficial || isUnlocked)
                      ? "✏️ Modo edición activo: introduce el objetivo deseado en la columna 'Ingresos Obj' de cada mes y pulsa 'Grabar Presupuesto'."
                      : "Haz clic en '✏️ Modificar Objetivos' o sobre cualquier mes para editar directamente los importes objetivo."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {scenario === "personalizado" && (!isOfficial || isUnlocked) ? (
                    <>
                      {Object.keys(manualMonthOverrides).length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearManualOverrides}
                          className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          title="Restablecer todos los meses a los valores calculados"
                        >
                          <span>🔄</span> Restablecer cálculos
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveOfficialTarget}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                        title="Guardar como presupuesto oficial"
                      >
                        <span>💾</span> Grabar Presupuesto
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartManualEditing}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                      title="Modificar los importes de ingresos objetivo"
                    >
                      <span>✏️</span> Modificar Objetivos
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200">
                      <th className="p-3">Mes</th>
                      <th className="p-3 text-center">Reservas (R / O)</th>
                      <th className="p-3 text-center">Hab-Noches (R / O)</th>
                      <th className="p-3 text-center">Pax (R / O)</th>
                      <th className="p-3 text-right">Ingresos Real</th>
                      <th className="p-3 text-right">Ingresos Obj</th>
                      <th className="p-3 text-right">Diferencia</th>
                      <th className="p-3 text-center">% Cumplimiento</th>
                      <th className="p-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                      const row = comparison.monthly[m];
                      const diff = row.diff.revenue;
                      const isPositive = diff >= 0;
                      const cump = row.compliancePercent.revenue;
                      return (
                        <tr key={m} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-bold text-slate-900">{monthNames[m - 1]}</td>
                          <td className="p-3 text-center">
                            <span className="text-slate-900 font-bold">{row.real.reservas}</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-indigo-600">{row.target.reservas}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-slate-900 font-bold">{row.real.roomNights}</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-indigo-600">{row.target.roomNights}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="text-slate-900 font-bold">{row.real.pax}</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-indigo-600">{row.target.pax}</span>
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            {row.real.revenue.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className="p-3 text-right text-indigo-700 font-semibold">
                            {scenario === "personalizado" && (!isOfficial || isUnlocked) ? (
                              <div className="inline-flex items-center gap-1 justify-end">
                                <input
                                  type="number"
                                  step="100"
                                  value={manualMonthOverrides[m]?.targetRevenue !== undefined && manualMonthOverrides[m]?.targetRevenue !== null ? manualMonthOverrides[m].targetRevenue : Math.round(row.target.revenue)}
                                  onChange={(e) => handleMonthOverrideChange(m, "targetRevenue", e.target.value)}
                                  className="w-28 bg-white border-2 border-indigo-400 focus:border-indigo-600 rounded-lg px-2 py-1 text-right text-xs font-black text-indigo-900 shadow-xs outline-none"
                                  title="Editar objetivo de ingresos para este mes"
                                />
                                <span className="text-[10px] text-slate-400 font-bold">€</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleStartManualEditing}
                                className="inline-flex items-center gap-1.5 hover:text-indigo-900 hover:bg-indigo-50 px-2 py-1 rounded-lg transition group cursor-pointer"
                                title="Haz clic para modificar los objetivos de este mes"
                              >
                                <span>{row.target.revenue.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
                                <span className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-500">✏️</span>
                              </button>
                            )}
                          </td>
                          <td className={"p-3 text-right font-bold " + (isPositive ? "text-emerald-600" : "text-red-500")}>
                            {isPositive ? "+" : ""}{diff.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className="p-3 text-center">
                            <span className={"px-2 py-0.5 rounded-full text-[10px] font-black " + (cump >= 100 ? "bg-emerald-100 text-emerald-800" : cump >= 80 ? "bg-blue-100 text-blue-800" : cump > 0 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500")}>
                              {cump.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={"px-2 py-0.5 rounded-full text-[10px] font-bold " + (row.status === "Definitivo" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200")}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100/90 font-black border-t-2 border-slate-300 text-slate-900">
                      <td className="p-3">TOTAL ANUAL</td>
                      <td className="p-3 text-center">
                        {comparison.totals.real.reservas} / <span className="text-indigo-600">{comparison.totals.target.reservas}</span>
                      </td>
                      <td className="p-3 text-center">
                        {comparison.totals.real.roomNights} / <span className="text-indigo-600">{comparison.totals.target.roomNights}</span>
                      </td>
                      <td className="p-3 text-center">
                        {comparison.totals.real.pax} / <span className="text-indigo-600">{comparison.totals.target.pax}</span>
                      </td>
                      <td className="p-3 text-right">
                        {comparison.totals.real.revenue.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </td>
                      <td className="p-3 text-right text-indigo-700">
                        {comparison.totals.target.revenue.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </td>
                      <td className={"p-3 text-right " + (comparison.totals.diff.revenue >= 0 ? "text-emerald-600" : "text-red-500")}>
                        {comparison.totals.diff.revenue >= 0 ? "+" : ""}{comparison.totals.diff.revenue.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </td>
                      <td className="p-3 text-center">
                        <span className={"px-2.5 py-1 rounded-full text-xs font-black " + (comparison.totals.compliancePercent.revenue >= 100 ? "bg-emerald-200 text-emerald-900" : "bg-indigo-100 text-indigo-800")}>
                          {comparison.totals.compliancePercent.revenue.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={"px-2 py-0.5 rounded-full text-[10px] font-bold " + (comparison.totals.status === "Definitivo" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>
                          {comparison.totals.status}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* VISTA 2: DESGLOSE POR RÉGIMEN */}
          {activeSubView === "regimen" && generatedTarget && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Distribución Prevista por Régimen de Alojamiento ({targetYear})
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { code: "HA", label: "Solo Alojamiento", desc: "Sin desayuno ni comida" },
                  { code: "HD", label: "Alojamiento y Desayuno", desc: "1 desayuno por persona" },
                  { code: "MP", label: "Media Pensión", desc: "1 desayuno + 1 comida por persona" },
                  { code: "PC", label: "Pensión Completa", desc: "1 desayuno + 2 comidas por persona" }
                ].map(item => {
                  const nights = generatedTarget.overall.byRegimen[item.code] || 0;
                  const totalNights = generatedTarget.overall.targetRoomNights || 1;
                  const pct = ((nights / totalNights) * 100).toFixed(1);
                  return (
                    <div key={item.code} className="border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-indigo-600">{item.code}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{pct}%</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{item.label}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-semibold">Hab-Noches:</span>
                        <span className="text-base font-black text-slate-900">{nights}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VISTA 3: DESGLOSE POR CATEGORÍA DE OCUPACIÓN REAL (Req 24, 26) */}
          {activeSubView === "category" && generatedTarget && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Distribución Prevista por Categoría de Ocupación Real ({targetYear})
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { cat: "individual", label: "Individual", pax: "1 persona", color: "sky" },
                  { cat: "doble", label: "Doble", pax: "2 personas", color: "indigo" },
                  { cat: "triple", label: "Triple", pax: "3 personas", color: "purple" },
                  { cat: "cuadruple", label: "Cuádruple", pax: "4 personas", color: "amber" }
                ].map(item => {
                  const isCumbriaCuadruple = targetHotel === "cumbria" && item.cat === "cuadruple";
                  const nights = isCumbriaCuadruple ? 0 : (generatedTarget.overall.byCategory[item.cat] || 0);
                  const totalNights = generatedTarget.overall.targetRoomNights || 1;
                  const pct = isCumbriaCuadruple ? "0.0" : ((nights / totalNights) * 100).toFixed(1);

                  return (
                    <div key={item.cat} className={"border rounded-2xl p-5 flex flex-col justify-between transition " + (isCumbriaCuadruple ? "bg-slate-50 border-slate-200 opacity-60" : "border-slate-200 hover:shadow-md")}>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-slate-900">{item.label}</span>
                          {isCumbriaCuadruple ? (
                            <span className="text-[10px] font-black px-2 py-0.5 bg-red-100 text-red-700 rounded-full">No disponible</span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{pct}%</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Ocupantes reales: {item.pax}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-semibold">Hab-Noches:</span>
                        <span className="text-base font-black text-slate-900">{isCumbriaCuadruple ? "—" : nights}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODAL DE EDICIÓN Y CONSULTA DE TARIFAS (Req 26, 28, 29, 33) */}
          {showTariffModal && editingTariffs && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏷️</span>
                      <h3 className="text-lg font-black text-slate-900 font-outfit">
                        Catálogo de Tarifas de Grupos por Habitación y Persona
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {tariffModalHotel === "guadiana" ? "Hotel Guadiana" : "Hotel Cumbria"} — Año {tariffModalYear}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTariffModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Selectores de Hotel y Año dentro del Modal */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Hotel</span>
                        <select
                          value={tariffModalHotel}
                          onChange={(e) => openTariffModal(e.target.value, tariffModalYear)}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                        >
                          <option value="guadiana">Hotel Guadiana</option>
                          <option value="cumbria">Hotel Cumbria</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Año</span>
                        <select
                          value={tariffModalYear}
                          onChange={(e) => openTariffModal(tariffModalHotel, Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                        >
                          {[2025, 2026, 2027, 2028, 2029, 2030].map(y => {
                            const isOff = isYearOfficial(tariffModalHotel, y);
                            const isSug = !isOff && y >= 2028;
                            return (
                              <option key={y} value={y}>
                                {y} {isOff ? "(Oficial 🔒)" : (isSug ? "(Sugerencia 💡)" : "")}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleApplyStatisticalSuggestion()}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        title="Calcular sugerencia de precios según estadísticas"
                      >
                        <span>💡</span>
                        <span>Sugerir según estadísticas</span>
                      </button>
                      <button
                        onClick={handleResetDefault2027}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
                      >
                        Restablecer Oficial 2027
                      </button>
                    </div>
                  </div>

                  {/* BANNER DE ESTADO OFICIAL / BLOQUEO / SUGERENCIA */}
                  {isTariffLocked ? (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🔒</span>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                            Tarifa Oficial {tariffModalYear} Bloqueada
                          </h4>
                          <p className="text-[11px] text-amber-800">
                            Los precios oficiales de este año están protegidos contra modificaciones accidentales. Solo pueden modificarse con la clave 1234.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setShowTariffPinModal(true); setTariffPinError(null); setTariffPinInput(""); }}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition shadow-xs flex items-center gap-1.5"
                      >
                        <span>🔓 Desbloquear Modificación (Clave 1234)</span>
                      </button>
                    </div>
                  ) : isTariffSuggested ? (
                    <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">📊</span>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950">
                            Precios sugeridos según estadísticas para {tariffModalYear} (+{tariffSuggestedGrowth}%)
                          </h4>
                          <p className="text-[11px] text-indigo-700">
                            Calculados con tendencia de ADR y redondeo comercial hotelero (.24/.54 &rarr; .50, .89 &rarr; entero). Puedes editar cualquier celda o desglose. Al guardar, quedará fijada como la Tarifa Oficial del año protegida con clave 1234.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                        Propuesta editable
                      </span>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">🔓</span>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                            Edición Habilitada (Tarifa Oficial {tariffModalYear})
                          </h4>
                          <p className="text-[11px] text-emerald-800">
                            Clave 1234 autorizada. Puedes modificar libremente los precios y desgloses.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setIsTariffLocked(true); showToast("🔒 Tarifa Oficial vuelta a bloquear."); }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        <span>🔒 Bloquear de nuevo</span>
                      </button>
                    </div>
                  )}

                  {/* HERRAMIENTA: COPIAR TARIFAS DE OTRO AÑO (Req 28) */}
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-900 block mb-2">
                      📋 Copiar tarifas desde otro año con ajuste
                    </span>
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Año Origen</label>
                        <select
                          value={copySourceYear}
                          onChange={(e) => setCopySourceYear(Number(e.target.value))}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold"
                        >
                          {[2025, 2026, 2027, 2028, 2029, 2030].map(y => {
                            const isOff = isYearOfficial(tariffModalHotel, y);
                            return (
                              <option key={y} value={y}>
                                {y} {isOff ? "(Oficial 🔒)" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Aumento %</label>
                        <input
                          type="number"
                          step="0.5"
                          value={copyPercent}
                          onChange={(e) => setCopyPercent(parseFloat(e.target.value) || 0)}
                          className="w-20 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Aumento Fijo (€)</label>
                        <input
                          type="number"
                          step="1"
                          value={copyFixed}
                          onChange={(e) => setCopyFixed(parseFloat(e.target.value) || 0)}
                          className="w-20 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Redondeo</label>
                        <select
                          value={copyRounding}
                          onChange={(e) => setCopyRounding(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800"
                        >
                          <option value="none">Sin redondeo</option>
                          <option value="0.50">A 0,50 €</option>
                          <option value="1.00">A 1 € entero</option>
                          <option value="5.00">A 5 €</option>
                        </select>
                      </div>
                      <button
                        onClick={handleApplyCopyTariffs}
                        className="mt-4 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        Aplicar Copia
                      </button>
                    </div>
                  </div>

                  {/* TABLA MATRIZ DE TARIFAS CON AUTO-CÁLCULO POR PERSONA (Req 26 y 29) */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-3">Régimen</th>
                          <th className="p-3">Individual (1 pax)</th>
                          <th className="p-3">Doble (2 pax)</th>
                          <th className="p-3">Triple (3 pax)</th>
                          <th className="p-3">Cuádruple (4 pax)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {["HA", "HD", "MP", "PC"].map(reg => (
                          <tr key={reg} className="hover:bg-slate-50/70 transition">
                            <td className="p-3 font-bold text-slate-900">
                              <span className="text-sm font-black text-indigo-600 mr-2">{reg}</span>
                              <span className="text-[11px] text-slate-500">
                                {reg === "HA" ? "Solo Aloj." : reg === "HD" ? "Aloj. y Des." : reg === "MP" ? "Media Pensión" : "Pensión Completa"}
                              </span>
                            </td>
                            {["individual", "doble", "triple", "cuadruple"].map(cat => {
                              const isCumbriaCua = tariffModalHotel === "cumbria" && cat === "cuadruple";
                              const rawVal = editingTariffs[reg] ? editingTariffs[reg][cat] : null;
                              const occupants = cat === "individual" ? 1 : cat === "doble" ? 2 : cat === "triple" ? 3 : 4;
                              const pricePerPerson = rawVal !== null && rawVal !== undefined ? gts.calculatePricePerPerson(rawVal, occupants) : null;

                              return (
                                <td key={cat} className="p-3">
                                  {isCumbriaCua ? (
                                    <div className="bg-slate-100 text-slate-400 p-2 rounded-xl text-center font-bold text-[11px] border border-dashed border-slate-300">
                                      No disponible
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="relative flex items-center">
                                        <input
                                          type="number"
                                          step="0.5"
                                          disabled={isTariffLocked}
                                          value={rawVal !== null && rawVal !== undefined ? rawVal : ""}
                                          onChange={(e) => handleCellPriceChange(reg, cat, e.target.value)}
                                          onClick={() => {
                                            if (isTariffLocked) {
                                              setShowTariffPinModal(true);
                                              setTariffPinError("Tarifa oficial bloqueada. Introduce la clave 1234 para modificar precios.");
                                            }
                                          }}
                                          className={"w-full border rounded-xl px-3 py-1.5 text-xs font-bold pr-6 transition " + (isTariffLocked ? "bg-slate-100 text-slate-500 cursor-pointer border-slate-200" : "bg-slate-50 focus:bg-white text-slate-900 border-slate-200 focus:border-indigo-500")}
                                        />
                                        <span className="absolute right-2 text-slate-400 text-xs font-bold">€</span>
                                      </div>
                                      <div className="text-[10px] text-slate-500 font-semibold mt-1">
                                        {pricePerPerson !== null ? (
                                          <span className="text-indigo-600 font-bold">{pricePerPerson.toFixed(2)} € / pax</span>
                                        ) : (
                                          "—"
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* SECCIÓN DESGLOSE DE MANUTENCIÓN Y PENSIONES (Establecer desgloses por hotel y año) */}
                  <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">🍽️</span>
                          <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                            Desglose Oficial de Manutención y Pensiones (€ / pax / día)
                          </h4>
                        </div>
                        <p className="text-[11px] text-amber-700/80 mt-0.5">
                          Valores de manutención aplicados al cálculo de comisiones netas de alojamiento, costes y presupuestos para {tariffModalHotel === "guadiana" ? "Hotel Guadiana" : "Hotel Cumbria"} ({tariffModalYear}).
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                        Por persona / día
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between gap-3">
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">☕ Desayuno</span>
                          <span className="text-[10px] text-slate-500 font-medium">Incluido en HD, MP, PC</span>
                        </div>
                        <div className="relative w-24">
                          <input
                            type="number"
                            step="0.5"
                            disabled={isTariffLocked}
                            value={editingTariffs._desglose?.breakfast !== undefined ? editingTariffs._desglose.breakfast : 8.5}
                            onClick={() => {
                              if (isTariffLocked) {
                                setShowTariffPinModal(true);
                                setTariffPinError("Tarifa oficial bloqueada. Introduce la clave 1234 para modificar desgloses.");
                              }
                            }}
                            onChange={(e) => {
                              if (isTariffLocked) return;
                              const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                              setEditingTariffs(prev => ({
                                ...prev,
                                _desglose: {
                                  ...(prev._desglose || {}),
                                  breakfast: val
                                }
                              }));
                            }}
                            className={"w-full border rounded-lg px-2 py-1 text-xs font-black text-right pr-5 outline-none transition " + (isTariffLocked ? "bg-slate-100 text-slate-500 cursor-pointer border-slate-200" : "bg-amber-50/40 focus:bg-white border-slate-200 focus:border-amber-500 text-slate-800")}
                          />
                          <span className="absolute right-2 top-1 text-xs font-bold text-slate-400">€</span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between gap-3">
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">🥗 Almuerzo</span>
                          <span className="text-[10px] text-slate-500 font-medium">Incluido en MP, PC</span>
                        </div>
                        <div className="relative w-24">
                          <input
                            type="number"
                            step="0.5"
                            disabled={isTariffLocked}
                            value={editingTariffs._desglose?.lunch !== undefined ? editingTariffs._desglose.lunch : 19.5}
                            onClick={() => {
                              if (isTariffLocked) {
                                setShowTariffPinModal(true);
                                setTariffPinError("Tarifa oficial bloqueada. Introduce la clave 1234 para modificar desgloses.");
                              }
                            }}
                            onChange={(e) => {
                              if (isTariffLocked) return;
                              const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                              setEditingTariffs(prev => ({
                                ...prev,
                                _desglose: {
                                  ...(prev._desglose || {}),
                                  lunch: val
                                }
                              }));
                            }}
                            className={"w-full border rounded-lg px-2 py-1 text-xs font-black text-right pr-5 outline-none transition " + (isTariffLocked ? "bg-slate-100 text-slate-500 cursor-pointer border-slate-200" : "bg-amber-50/40 focus:bg-white border-slate-200 focus:border-amber-500 text-slate-800")}
                          />
                          <span className="absolute right-2 top-1 text-xs font-bold text-slate-400">€</span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between gap-3">
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">🌙 Cena</span>
                          <span className="text-[10px] text-slate-500 font-medium">Incluido en PC</span>
                        </div>
                        <div className="relative w-24">
                          <input
                            type="number"
                            step="0.5"
                            disabled={isTariffLocked}
                            value={editingTariffs._desglose?.dinner !== undefined ? editingTariffs._desglose.dinner : 19.5}
                            onClick={() => {
                              if (isTariffLocked) {
                                setShowTariffPinModal(true);
                                setTariffPinError("Tarifa oficial bloqueada. Introduce la clave 1234 para modificar desgloses.");
                              }
                            }}
                            onChange={(e) => {
                              if (isTariffLocked) return;
                              const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                              setEditingTariffs(prev => ({
                                ...prev,
                                _desglose: {
                                  ...(prev._desglose || {}),
                                  dinner: val
                                }
                              }));
                            }}
                            className={"w-full border rounded-lg px-2 py-1 text-xs font-black text-right pr-5 outline-none transition " + (isTariffLocked ? "bg-slate-100 text-slate-500 cursor-pointer border-slate-200" : "bg-amber-50/40 focus:bg-white border-slate-200 focus:border-amber-500 text-slate-800")}
                          />
                          <span className="absolute right-2 top-1 text-xs font-bold text-slate-400">€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 bg-white">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Redondeo rápido:</span>
                    <button
                      type="button"
                      onClick={() => handleRoundCurrentTariffs("0.50")}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition"
                      title="Redondear todas las tarifas activas a 0,50 €"
                    >
                      a 0,50 €
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoundCurrentTariffs("1.00")}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition"
                      title="Redondear todas las tarifas activas a 1 € entero"
                    >
                      a 1 €
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoundCurrentTariffs("5.00")}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition"
                      title="Redondear todas las tarifas activas a múltiplos de 5 €"
                    >
                      a 5 €
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowTariffModal(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveTariffs}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100 flex items-center gap-1.5"
                    >
                      <span>🔒</span>
                      <span>{isTariffLocked ? "Guardar Cambios Oficiales" : `Guardar como Tarifa Oficial ${tariffModalYear}`}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL DE CLAVE PIN 1234 PARA TARIFAS OFICIALES */}
          {showTariffPinModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-[60] p-4 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Autorización Tarifa Oficial</h3>
                      <p className="text-[11px] text-slate-500">Solo modificable con clave 1234</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowTariffPinModal(false); setTariffPinError(null); setTariffPinInput(""); }}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleVerifyTariffPin} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Clave de Autorización
                    </label>
                    <input
                      type="password"
                      value={tariffPinInput}
                      onChange={(e) => { setTariffPinInput(e.target.value); setTariffPinError(null); }}
                      placeholder="••••"
                      autoFocus
                      className={"w-full bg-slate-50 border rounded-xl px-4 py-3 text-lg font-black text-center tracking-[0.5em] focus:outline-none focus:ring-2 transition " + (tariffPinError ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-200")}
                    />
                    {tariffPinError && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-center gap-1">
                        <span>⚠️</span> {tariffPinError}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowTariffPinModal(false); setTariffPinError(null); setTariffPinInput(""); }}
                      className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100"
                    >
                      Desbloquear
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL DE RESERVAS ANULADAS (Req 23) */}
          {showCancelledModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚫</span>
                    <h3 className="text-base font-black text-slate-900 font-outfit">
                      Reservas Anuladas ({baseYear})
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCancelledModal(false)}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3 text-xs text-slate-600">
                  <p>
                    Conforme al <strong>Requisito 23</strong>, las reservas anuladas quedan excluidas del cálculo del objetivo principal, pero se preservan para su análisis:
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                      <span className="block text-[10px] uppercase font-bold text-red-600">Reservas</span>
                      <span className="text-lg font-black text-red-900">{histData.cancelled.count}</span>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <span className="block text-[10px] uppercase font-bold text-amber-600">Pax Afectados</span>
                      <span className="text-lg font-black text-amber-900">{histData.cancelled.pax}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="block text-[10px] uppercase font-bold text-slate-500">Importe Perdido</span>
                      <span className="text-sm font-black text-slate-900 mt-1 block">
                        {histData.cancelled.lostRevenue.toLocaleString("es-ES", { minimumFractionDigits: 2 })} €
                      </span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 text-right">
                  <button
                    onClick={() => setShowCancelledModal(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL DE CLAVE PIN 1234 (Presupuesto Oficial) */}
          {showPinModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <h3 className="text-base font-black text-slate-900">Desbloquear Presupuesto</h3>
                      <p className="text-[11px] text-slate-500">Solo modificable con clave 1234</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowPinModal(false); setPinError(null); setPinInput(""); }}
                    className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleVerifyPin} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Clave de Autorización
                    </label>
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => { setPinInput(e.target.value); setPinError(null); }}
                      placeholder="••••"
                      autoFocus
                      className={"w-full bg-slate-50 border rounded-xl px-4 py-3 text-lg font-black text-center tracking-[0.5em] focus:outline-none focus:ring-2 transition " + (pinError ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-200")}
                    />
                    {pinError && (
                      <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-center gap-1">
                        <span>⚠️</span> {pinError}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowPinModal(false); setPinError(null); setPinInput(""); }}
                      className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-100"
                    >
                      Desbloquear
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    };


    const App = () => {
        console.log("[GESTION GRUPOS BUILD] v1.0.8-extra-charges");

      const [data, setData] = useState([]);

      const [columns, setColumns] = useState(

        [],

      );

      const authorizingIds = useRef(new Set()); // Para evitar que onSnapshot restaure diffs en proceso de guardado
      const deepLinkProcessedRef = useRef(null); // Guarda el ID del deep-link ya procesado para evitar bucles de re-ejecución
      const [highlightSyncCharges, setHighlightSyncCharges] = useState(false);
      const syncChargesRef = useRef(null);



      const getStatusProps = (statusRaw, arrivalDate, estadoField) => {

        const s = (statusRaw || "").toString().toUpperCase();

        const e = (estadoField || "").toString().toUpperCase();

        const today = new Date().toISOString().split("T")[0];

        const arrival = toInputDate(arrivalDate);



        // 0. CANCELADO / ANULADO / BAJA / DESESTIMADO / CADUCADO (PREFERENCIA MÁXIMA)
        if (
          s.includes("CANC") ||
          s.includes("ANUL") ||
          s.includes("BAJA") ||
          s.includes("DESESTIMADO") ||
          s.includes("CADUC") ||
          e.includes("CANC") ||
          e.includes("ANUL") ||
          e.includes("BAJA") ||
          e.includes("DESESTIMADO") ||
          e.includes("CADUC")
        )
          return {
            color: "bg-red-500/80",
            text: "bg-red-100 text-red-700",
            label: (s.includes("CADUC") || e.includes("CADUC"))
              ? "CADUCADO"
              : (s.includes("CANC") || e.includes("CANC"))
              ? "CANCELADO"
              : "DESESTIMADO",
          };


        // 2. CONFIRMADO / OK / BLOQUEADO
        if (
          s.includes("CONF") ||
          s.includes("OK") ||
          s.includes("BLOQ") ||
          s === "GRUPOS" ||
          s === "GRUPO"
        ) {
          return {
            color: "bg-emerald-500",
            text: "bg-emerald-100 text-emerald-700",
            label: "CONFIRMADO",
          };
        }

        // 2. TENTATIVA / TANTEO / BLOQUEADO
        if (
          s.includes("TANTEO") ||
          s.includes("TENTA") ||
          s.includes("BLOQ") ||
          s.includes("OPCI")
        )
          return {
            color: "bg-amber-500",
            text: "bg-amber-100 text-amber-700",
            label: "TENTATIVA",
          };

        // 3. CONFIRMADO / GARANTIZADO / RESERVA
        if (
          s.includes("CONFIRM") ||
          s.includes("GARANT") ||
          s.includes("RESERVA")
        )
          return {
            color: "bg-emerald-500",
            text: "bg-emerald-100 text-emerald-700",
            label: "CONFIRMADO",
          };



        // 4. PRESUPUESTO / ENVIADO / COTIZADO

        if (

          s.includes("PRESUP") ||

          s.includes("ENVIA") ||

          s.includes("COTIZ") ||

          s.includes("OFERT")

        )

          return {

            color: "bg-blue-500",

            text: "bg-blue-100 text-blue-700",

            label: "PRESUPUESTO",

          };



        // 5. PROSPECTO / PENDIENTE

        if (s.includes("PROSPEC") || s.includes("PENDIE"))

          return {

            color: "bg-slate-500",

            text: "bg-slate-100 text-slate-700",

            label: s || "PROSPECTO",

          };



        return {

          color: "bg-slate-400",

          text: "bg-slate-100 text-slate-600",

          label: s || "ACTIVO",

        };

      };



      const toInputDate = (val) => {

        if (!val) return "";

        const str = String(val).trim();



        // Caso 1: Excel Serial (ej: 46129)

        const num = parseFloat(str);

        if (!isNaN(num) && num > 40000 && num < 60000) {

          try {

            const date = new Date(Math.round((num - 25569) * 86400 * 1000));

            if (!isNaN(date.getTime()))

              return date.toISOString().split("T")[0];

          } catch (e) { }

        }



        // Caso 2: DD/MM/YYYY -> YYYY-MM-DD

        if (str.includes("/")) {

          const parts = str.split("/");

          if (parts.length === 3) {

            const [d, m, yRaw] = parts;

            let y = parseInt(yRaw);

            if (y < 100) y += 2000; // Handle two-digit years

            const year = String(y);

            return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

          }

        }



        // Caso 3: DD.MM.YYYY -> YYYY-MM-DD

        if (str.includes(".")) {

          const parts = str.split(".");

          if (parts.length === 3) {

            const [d, m, yRaw] = parts;

            let y = parseInt(yRaw);

            if (y < 100) y += 2000; // Handle two-digit years

            const yrStr = String(y);

            if (yrStr.length === 4 || yrStr.length === 2) {

              return `${yrStr}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

            }

            if (d.length === 4)

              return `${d}-${m.padStart(2, "0")}-${String(y).padStart(2, "0")}`;

          }

        }



        // Caso 4: YYYY-MM-DD o DD-MM-YYYY

        if (str.includes("-")) {

          const parts = str.split(/[-T ]/);

          if (parts[0] && parts[0].length === 4)

            return parts.slice(0, 3).join("-"); // YYYY-MM-DD

          if (parts[2] && (parts[2].length === 4 || parts[2].length === 2)) {

            // DD-MM-YYYY

            const [d, m, yRaw] = parts;

            let y = parseInt(yRaw);

            if (y < 100) y += 2000; // Handle two-digit years

            const year = String(y);

            return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;

          }

        }



        return str;

      };

      const getDeadlineInfo = (group, todayStr) => {
        let deadlineDateStr = null;
        let isPaymentPlanDeadline = false;
        const isCredito = Boolean(
          group?.isCredito ||
          group?.records?.some(r => r["Es_Credito"] === true || r["Es_Credito"] === "true" || r["Com_Es_Credito"] === true)
        );

        // 1. Search in payment plan (solo si no es a crédito)
        if (!isCredito) {
          (group.records || []).forEach((r) => {
            try {
              const plan = JSON.parse(r.PaymentPlan_JSON || "[]");
              plan.forEach((p) => {
                if (p.status !== "Cobrado" && p.date) {
                  const dStr = toInputDate(p.date);
                  if (dStr) {
                    if (!deadlineDateStr || dStr < deadlineDateStr) {
                      deadlineDateStr = dStr;
                      isPaymentPlanDeadline = true;
                    }
                  }
                }
              });
            } catch (e) {}
          });
        }

        // 2. Search in Com_Vencimiento_Rel manual field (solo si no es crédito)
        if (!isCredito) {
          const manualRel = group.records?.[0]?.["Com_Vencimiento_Rel"];
          if (manualRel) {
            const dStr = toInputDate(manualRel);
            if (dStr) {
              if (!deadlineDateStr || dStr < deadlineDateStr) {
                deadlineDateStr = dStr;
                isPaymentPlanDeadline = false;
              }
            }
          }
        }

        const arrivalDateStr = toInputDate(group.arrival);

        // Determine reference date
        let refDateStr = null;
        let isDeadline = false;

        if (deadlineDateStr) {
          refDateStr = deadlineDateStr;
          isDeadline = true;
        } else if (arrivalDateStr) {
          refDateStr = arrivalDateStr;
          isDeadline = false;
        }

        if (!refDateStr) {
          return { hasDate: false };
        }

        const today = new Date(todayStr);
        today.setHours(0, 0, 0, 0);
        const refDate = new Date(refDateStr);
        refDate.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((refDate - today) / (1000 * 60 * 60 * 24));

        return {
          hasDate: true,
          dateStr: refDateStr,
          isDeadline,
          isPaymentPlanDeadline,
          diffDays
        };
      };

      const reconcileReactPaymentPlan = (paymentPlan, netTotal, arrivalDate, options = {}) => {
        if (!paymentPlan || paymentPlan.length === 0) return paymentPlan || [];
        const planCopy = paymentPlan.map(p => ({ ...p }));
        const lockedIndex = options && typeof options.lockedIndex === "number" ? options.lockedIndex : -1;

        // 1. Recalculate percent/amount for each row
        planCopy.forEach((p) => {
          if (p.status === "Cobrado") {
            // IMPORTANTE: Para filas cobradas, preservar el importe EXACTO tal como fue guardado.
            // No recalcular desde el porcentaje para evitar el bucle de redondeo:
            // ej. 2000,00€ → 12.35% guardado → 12.35% × 16200 = 2000,70€ (error)
            const amount = parseFloat(p.amount) || 0;
            p.amount = amount.toFixed(2); // preservar importe exacto
            // El porcentaje es solo informativo para filas cobradas, se calcula con más precisión
            p.percent = netTotal > 0 ? parseFloat(((amount / netTotal) * 100).toFixed(4)) : 0;
          } else {
            const percent = parseFloat(p.percent) || 0;
            p.amount = ((netTotal * percent) / 100).toFixed(2);
            p.percent = parseFloat(percent.toFixed(2));
          }
        });

        // 2. Adjust for any rounding difference in the last pending row (or last row)
        let sumOfAmounts = planCopy.reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
        let diff = netTotal - sumOfAmounts;
        if (Math.abs(diff) > 0.001) {
          let targetRow = [...planCopy].reverse().find((p, idxFromEnd) => {
            const idx = planCopy.length - 1 - idxFromEnd;
            return p.status !== "Cobrado" && idx !== lockedIndex;
          });
          if (targetRow) {
            const currentAmt = parseFloat(targetRow.amount) || 0;
            targetRow.amount = (currentAmt + diff).toFixed(2);
            targetRow.percent = netTotal > 0 ? parseFloat(((parseFloat(targetRow.amount) || 0) / netTotal * 100).toFixed(2)) : 0;
          } else if (diff > 0.01) {
            // No pending rows to absorb the positive remainder, add a new pending row
            let dateStr = new Date().toISOString().split('T')[0];
            if (arrivalDate) {
              try {
                let d;
                const numDate = parseFloat(arrivalDate);
                if (!isNaN(numDate) && numDate > 40000 && numDate < 60000) {
                  d = new Date(Math.round((numDate - 25569) * 86400 * 1000));
                } else {
                  d = new Date(toInputDate(arrivalDate));
                }
                if (d && !isNaN(d.getTime())) {
                  d.setDate(d.getDate() - 30);
                  dateStr = d.toISOString().split('T')[0];
                }
              } catch(e){}
            }
            planCopy.push({
              id: Date.now() + Math.random(),
              label: planCopy.length === 1 ? "Pago Final" : `Pago ${planCopy.length + 1}`,
              percent: parseFloat(((diff / netTotal) * 100).toFixed(2)),
              amount: diff.toFixed(2),
              date: dateStr,
              status: "Pendiente",
              releaseDays: 30,
              Enlace_TPV: ""
            });
          }
        }

        // 3. Clean up tiny leftover pending rows if difference is zero or negative
        if (diff <= 0.01) {
          for (let i = planCopy.length - 1; i >= 0; i--) {
            const p = planCopy[i];
            if (p.status !== "Cobrado" && (parseFloat(p.amount) || 0) <= 0.01) {
              planCopy.splice(i, 1);
            }
          }
        }

        return planCopy;
      };



      const formatDate = (val) => {

        if (!val) return "-";

        const iso = toInputDate(val);

        if (!iso || typeof iso !== "string" || !iso.includes("-")) return val;

        const [y, m, d] = iso.split("-");

        return `${d}/${m}/${y}`;

      };

      const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== "undefined") {
          if (window.location.pathname.toLowerCase().includes("objetivo")) return "targets";
          try {
            const sp = new URLSearchParams(window.location.search);
            if (sp.get("tab") === "targets") return "targets";
          } catch(e) {}
        }
        return "groups";
      });

      const [searchTerm, setSearchTerm] = useState("");

      // Estados para Desglose Diario de Habitaciones
      const [groupsSubView, setGroupsSubView] = useState("groups"); // 'groups' | 'daily'
      const [dailyDateFrom, setDailyDateFrom] = useState("");
      const [dailyDateTo, setDailyDateTo] = useState("");
      const [dailyStatusFilter, setDailyStatusFilter] = useState("confirmada"); // 'confirmada' | 'anulada' | 'todos'
      const [dailyDistributionFilter, setDailyDistributionFilter] = useState("requieren_atencion"); // 'requieren_atencion' | 'todos' | 'confirmada_o_modificada' | 'propuesta' | 'pendiente' | 'revision_necesaria' | 'validada_sin_cambios'
      const [dailyHotelFilter, setDailyHotelFilter] = useState("");
      const [editingDistribution, setEditingDistribution] = useState(null);
      // Estados para Configuración y Desglose Económico de Precios por Régimen (Reqs 13-21)
      const [boardPricingConfig, setBoardPricingConfig] = useState(() => {
        try {
          const saved = window.NexusUtils?.safeStorage?.getItem("boardPricingConfig");
          if (saved) return JSON.parse(saved);
        } catch (e) {}
        return {
          default: { breakfast: 6.0, meal: 16.0, version: "v1.0" }
        };
      });
      const [showBoardPricingModal, setShowBoardPricingModal] = useState(false);
      const [editingBoardPrices, setEditingBoardPrices] = useState({
        hotel: "default",
        breakfast: 6.0,
        meal: 16.0
      });
      const [dailyViewSection, setDailyViewSection] = useState("breakdown"); // 'breakdown' | 'statistics'
      const [dailyGroupingMode, setDailyGroupingMode] = useState("reserva"); // 'reserva' | 'lineas'
      const [expandedReservas, setExpandedReservas] = useState(new Set());
      const [collapsedFichaDays, setCollapsedFichaDays] = useState(new Set());
      const [distributionFormError, setDistributionFormError] = useState(null);
      const [isSavingDistribution, setIsSavingDistribution] = useState(false);

      const [newColumnName, setNewColumnName] = useState("");

      const [showColumnModal, setShowColumnModal] = useState(false);

      const [expandedGroup, setExpandedGroup] = useState(null);

      const [expandedSegment, setExpandedSegment] = useState(null);



      // Estados para IA

      const [isAiLoading, setIsAiLoading] = useState(false);

      const [loading, setLoading] = useState(false);

      const [aiResult, setAiResult] = useState(null);

      const [showAiModal, setShowAiModal] = useState(false);

      const [showAddGroupModal, setShowAddGroupModal] = useState(false);

      const [aiEmailContent, setAiEmailContent] = useState("");

      const [isParsingEmail, setIsParsingEmail] = useState(false);

      const [showOnlyChanges, setShowOnlyChanges] = useState(false);

      const [showImportSummary, setShowImportSummary] = useState(false);

      const [importSummaryData, setImportSummaryData] = useState(null);

      const [aiReviewData, setAiReviewData] = useState(null);

      const [showReviewModal, setShowReviewModal] = useState(false);



      // Estados para Filtros de Directorio de Grupos

      const [filterDirHotel, setFilterDirHotel] = useState("");

      const [filterDirCommercial, setFilterDirCommercial] = useState("");

      const [commercials, setCommercials] = useState([

        { name: "NATALIO", active: true },

        { name: "EMILIA", active: true },

        { name: "CANDELARIA", active: true },

        { name: "MARTA", active: true },

      ]);

      const [hotelSettings, setHotelSettings] = useState({

        guadiana: {},

        cumbria: {},

      });



      const getCommColor = (name) => {

        if (!name) return "bg-slate-300";

        const predefinedColors = [

          "bg-emerald-500",

          "bg-blue-500",

          "bg-amber-500",

          "bg-purple-500",

          "bg-rose-500",

          "bg-cyan-500",

          "bg-indigo-500",

          "bg-fuchsia-500",

        ];

        let idx = commercials.findIndex((c) => c.name === name);

        if (idx === -1) {

          let hash = 0;

          for (let i = 0; i < name.length; i++) {

            hash = name.charCodeAt(i) + ((hash << 5) - hash);

          }

          idx = Math.abs(hash);

        }

        return predefinedColors[idx % predefinedColors.length];

      };



      // Cargar configuración de comerciales desde Firestore

      useEffect(() => {

        const unsubscribe = db

          .collection("settings")

          .doc("main")

          .onSnapshot((doc) => {

            if (doc.exists) {

              const data = doc.data() || {};

              const system = data.system || {};

              if (system.commercials && Array.isArray(system.commercials)) {

                // Normalize: Ensure all are objects with name and active status

                const normalized = system.commercials.map((comm) => {

                  if (typeof comm === "object" && comm !== null) return comm;

                  return { name: comm, active: true };

                });

                setCommercials(normalized);

              }

              setHotelSettings({
                guadiana: data.guadiana || {},
                cumbria: data.cumbria || {},
                lastImportDate: data.lastImportDate || null
              });

            }

          });

        return () => unsubscribe();

      }, []);



      // Sincronización automática desde Proforma eliminada porque `Fac Prof.html` ya guarda directamente en Firestore al salir.

      // Si mantenemos esto, cada vez que se recarga la página, se sobreescribe Firestore con datos antiguos (stale) en localStorage.

      useEffect(() => {

        // Limpieza de datos temporales obsoletos (opcional)

        // localStorage.removeItem('selectedGroup');

      }, []);



      // --- ATAJO DE TECLADO: ESC cierra modales ---

      useEffect(() => {

        const handleKeyDown = (e) => {

          if (e.key === "Escape") {

            // Cerrar modales en orden de prioridad (el más interno primero)

            if (showAiModal) {

              setShowAiModal(false);

              return;

            }

            if (showImportSummary) {

              setShowImportSummary(false);

              return;

            }

            if (showFichaModal) {

              setShowFichaModal(false);

              return;

            }

            if (showColumnModal) {

              setShowColumnModal(false);

              return;

            }

            if (isHotelModalOpen) {

              setIsHotelModalOpen(false);

              setPendingFile(null);

              return;

            }

          }

        };

        document.addEventListener("keydown", handleKeyDown);

        return () => document.removeEventListener("keydown", handleKeyDown);

      }, [

        showAiModal,

        showFichaModal,

        showColumnModal,

        isHotelModalOpen,

        showImportSummary,

      ]);



      // --- Filtros y Ordenación ---

      const [filterStatus, setFilterStatus] = useState("activos"); // all, activos, confirmada, anulada

      const [filterTime, setFilterTime] = useState("future"); // all, future, past

      const [startDate, setStartDate] = useState("");

      const [endDate, setEndDate] = useState("");

      const [kpiFilter, setKpiFilter] = useState(null); // 'active', 'prospect', 'release', 'followup'

      const [sortConfig, setSortConfig] = useState({

        key: "Entrada",

        direction: "asc",

      });

      // Estados para Panel de Estudio y Comparativa YoY
      const [studySubTab, setStudySubTab] = useState("global"); // 'global', 'fechas', 'comercial', 'precio_medio', 'segmentos'
      const [studyYear, setStudyYear] = useState(() => new Date().getFullYear()); // Año de estudio (ej. 2026)
      const [chartMetric, setChartMetric] = useState("Pax"); // 'Pax' o 'Ingresos'
      const [showPrevYearComparison, setShowPrevYearComparison] = useState(true);
      const [expandedCommercial, setExpandedCommercial] = useState(null);




      // --- Normalización de Datos (Fuente de Verdad) ---

      const normalizedData = useMemo(() => {

        return (data || []).map(row => {

          const normArrival = toInputDate(row["Entrada"]);

          const stateProps = getStatusProps(

            row["Com_Estado_Interno"] || row["Segment."],

            row["Entrada"],

            row["Estado"],

          );

          return {

            ...row,

            _normArrival: normArrival,

            _stateLabel: stateProps.label.toLowerCase(),

            _normReserva: normalizeId(row["Reserva"]).toLowerCase(),

            _baseReserva: getBaseId(row["Reserva"]).toLowerCase()

          };

        });

      }, [data]);



      // Años disponibles detectados para el Panel de Estudio
      const availableStudyYears = useMemo(() => {
        const yearsSet = new Set();
        (normalizedData || []).forEach((row) => {
          const arrival = row._normArrival || toInputDate(row["Entrada"]);
          if (arrival && arrival.length >= 4) {
            const y = parseInt(arrival.substring(0, 4), 10);
            if (!isNaN(y) && y >= 2020 && y <= 2035) {
              yearsSet.add(y);
            }
          }
        });
        const currentY = new Date().getFullYear();
        yearsSet.add(currentY);
        yearsSet.add(currentY + 1);
        return Array.from(yearsSet).sort((a, b) => a - b);
      }, [normalizedData]);

      // Conjunto de datos acotados al Año de Estudio para todo el Panel de Rentabilidad & Comerciales
      const studyData = useMemo(() => {
        return (normalizedData || []).filter((row) => {
          const statusVal = (row["Com_Estado_Interno"] || row["Estado"] || "").toUpperCase();
          if (row.excludeFromStatistics === true || statusVal === "DESGLOSADO" || row.status === "DESGLOSADO") {
            return false;
          }

          const hasReserva = (row["Reserva"] &&
            row["Reserva"].toString().trim() !== "" &&
            row["Reserva"].toString().trim() !== "-") ||
            (row["uid"] && row["uid"].toString().startsWith("PRES-"));
          if (!hasReserva) return false;

          const stateLabel = (row._stateLabel || "").toLowerCase();
          if (stateLabel === "desestimado" || stateLabel === "cancelado" || stateLabel === "caducado") {
            return false;
          }

          if (filterDirHotel) {
            const h = normalizeHotelName(row["Hotel_Asignado"] || row["Hotel"]);
            if (h !== filterDirHotel) return false;
          }

          if (filterDirCommercial) {
            const com = (row["Com_Comercial"] || "").trim();
            if (filterDirCommercial === "SIN_ASIGNAR") {
              if (com !== "") return false;
            } else if (com !== filterDirCommercial) {
              return false;
            }
          }

          if (studyYear && studyYear !== "all") {
            const arrival = row._normArrival || toInputDate(row["Entrada"]);
            if (!arrival || arrival.length < 4) return false;
            const y = parseInt(arrival.substring(0, 4), 10);
            if (y !== parseInt(studyYear, 10)) return false;
          }

          return true;
        });
      }, [normalizedData, filterDirHotel, filterDirCommercial, studyYear]);



      // --- Procesamiento de Datos (Filtrado y Ordenación) ---

      const processedData = useMemo(() => {

        let filtered = normalizedData;

        // Excluir de estadísticas y listados generales si está desglosado o excluido
        filtered = filtered.filter(row => {
          const statusVal = (row["Com_Estado_Interno"] || row["Estado"] || "").toUpperCase();
          if (row.excludeFromStatistics === true || statusVal === "DESGLOSADO" || row.status === "DESGLOSADO") {
            return false;
          }
          return true;
        });

        // REGLA: Si un presupuesto está caducado, desestimado o cancelado, no debe aparecer en el directorio de grupos
        filtered = filtered.filter(row => {
          const res = String(row["Reserva"] || "").toUpperCase();
          const uid = String(row.uid || row.id || "").toUpperCase();
          const inSt = String(row["Com_Estado_Interno"] || "").toUpperCase();
          const ext = String(row["Estado"] || "").toUpperCase();
          const seg = String(row["Segment."] || "").toUpperCase();

          const isBudget = (row.isBudget === true) ||
            res.startsWith("PRES-") ||
            uid.startsWith("PRES-") ||
            ext.includes("PRESUP") ||
            inSt.includes("PRESUP") ||
            seg.includes("PRESUP");

          if (isBudget) {
            const isInactive = (
              inSt.includes("CADUC") ||
              inSt.includes("DESESTIM") ||
              inSt.includes("CANCEL") ||
              inSt.includes("ANUL") ||
              inSt.includes("BAJA") ||
              inSt.includes("RECHAZ") ||
              inSt.includes("DESCART") ||
              ext.includes("CADUC") ||
              ext.includes("DESESTIM") ||
              ext.includes("CANCEL") ||
              ext.includes("ANUL") ||
              ext.includes("BAJA")
            );
            if (isInactive) return false;
          }
          return true;
        });

        // 0. Filtro de Validez (Reserva obligatoria) + Normalización de Segmentos
        filtered = filtered
          .filter(
            (row) =>
              (row["Reserva"] &&
               row["Reserva"].toString().trim() !== "" &&
               row["Reserva"].toString().trim() !== "-") ||
              (row["uid"] && row["uid"].toString().startsWith("PRES-"))
          )
          .map((row) => {
            let seg = (row["Segment."] || "").toString().trim().toUpperCase();
            if (seg === "GRTANTEO" || seg === "GRUPO TANTEO") {
              return { ...row, "Segment.": "GRUPO TANTEO" };
            }
            return row;
          });

        const today = new Date().toISOString().split("T")[0];

        // 0. Filtro de Cambios Recientes (Importación)
        if (showOnlyChanges) {
          filtered = filtered.filter((row) => row._diff);
        }

        // 1. Filtro de Estado
        if (filterStatus !== "all") {
          filtered = filtered.filter((row) => {
            const label = row._stateLabel;
            const arrival = row._normArrival;
            const isPast = arrival && arrival < today;

            if (filterStatus === "activos") return label !== "cancelado" && label !== "desestimado" && label !== "caducado" && !isPast;
            if (filterStatus === "activos_y_desestimados") return !isPast;
            if (filterStatus === "confirmada") return label === "confirmado" && !isPast;
            if (filterStatus === "tentativa") return label === "tentativa" && !isPast;
            if (filterStatus === "presupuesto") return label === "presupuesto" && !isPast;
            if (filterStatus === "desestimada") return label === "cancelado" || label === "desestimado" || label === "caducado";
            if (filterStatus === "pasado") return isPast && label !== "cancelado" && label !== "desestimado" && label !== "caducado";
            return true;
          });
        }



        // 2. Filtro de Tiempo
        if (filterTime !== "all" && filterStatus !== "pasado" && !startDate && !endDate && !searchTerm) {
          filtered = filtered.filter((row) => {
            const arrival = row._normArrival;
            if (!arrival) return false;
            if (filterTime === "future") return arrival >= today;
            if (filterTime === "past") return arrival < today;
            return true;
          });
        }



        // 2.5 Filtro de Fecha (Rango Manual)
        if (startDate || endDate) {
          filtered = filtered.filter((row) => {
            const arrival = row._normArrival;
            if (!arrival) return false;
            if (startDate && arrival < startDate) return false;
            if (endDate && arrival > endDate) return false;
            return true;
          });
        }



        if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          const isNumericTerm = /^\d+$/.test(lowerTerm);

          filtered = filtered.filter((row) => {
            const idMatch =
              row._normReserva.includes(lowerTerm) ||
              row._baseReserva === lowerTerm ||
              (isNumericTerm && row._baseReserva.startsWith(lowerTerm));

            return (
              idMatch ||
              (row["Nombre del Grupo"] || "").toLowerCase().includes(lowerTerm) ||
              (row["Empresa/Agencia"] || "").toLowerCase().includes(lowerTerm) ||
              (row["Com_Comercial"] || "").toLowerCase().includes(lowerTerm) ||
              (row["Segment."] || "").toLowerCase().includes(lowerTerm) ||
              (row["Entrada"] || "").toString().includes(lowerTerm) ||
              row._normArrival.includes(lowerTerm) ||
              (row["Salida"] || "").toString().includes(lowerTerm) ||
              toInputDate(row["Salida"]).includes(lowerTerm) ||
              (row["Importe(*)"] || "").toString().includes(lowerTerm) ||
              (row["Pax."] || "").toString().includes(lowerTerm) ||
              row._stateLabel.includes(lowerTerm)
            );
          });
        }



        // 3.5 Filtro de KPI (Alertas/Estados específicos)

        if (kpiFilter) {

          const now = new Date();

          now.setHours(0, 0, 0, 0);

          const sevenDaysFromNow = new Date(now);

          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);



          filtered = filtered.filter((row) => {

            const status = (

              row["Com_Estado_Interno"] ||

              row["Segment."] ||

              row["Estado"] ||

              "PROSPECTO"

            ).toUpperCase();



            if (kpiFilter === "active") {

              return (

                status.includes("CONF") ||

                status.includes("BLOQ") ||

                status.includes("OK") ||

                status.includes("CERR")

              );

            }

            if (kpiFilter === "prospect") {

              return (

                status.includes("TANTEO") ||

                status.includes("TENTA") ||

                status.includes("PROSPEC") ||

                status.includes("PRESUP")

              );

            }

            if (kpiFilter === "pendingQuotes") {

              const extStatus = (row["Estado"] || "").toLowerCase();

              const intStatus = (

                row["Com_Estado_Interno"] || ""

              ).toLowerCase();

              const isCancelled =

                extStatus.includes("anul") ||

                extStatus.includes("cancel") ||

                extStatus.includes("baja") ||

                intStatus.includes("anul") ||

                intStatus.includes("cancel") ||

                intStatus.includes("baja") ||

                extStatus.includes("descart") ||

                intStatus.includes("descart") ||

                extStatus.includes("rechaz") ||

                intStatus.includes("rechaz");



              const arrival = row["Entrada"]

                ? toInputDate(row["Entrada"])

                : null;

              const todayStr = now.toISOString().split("T")[0];

              const isPast = arrival && arrival < todayStr;



              if (isCancelled || isPast) return false;



              const importe = parseNum(row["Importe(*)"]);

              const rawImporte = String(row["Importe(*)"] || "0").trim();

              const isZero =

                importe === 0 ||

                rawImporte === "" ||

                rawImporte === "0" ||

                rawImporte === "0,00" ||

                rawImporte === "0.00";



              return (

                (status.includes("PRESUP") ||

                  status.includes("PEND") ||

                  (row["Reserva"] &&

                    String(row["Reserva"]).startsWith("PRES."))) &&

                isZero

              );

            }

            if (kpiFilter === "release") {

              let isReleaseUrgent = false;

              const manualPaidVal = parseNum(row["Com_Pagado"] || "0");

              const currentForecast = parseNum(row["Importe(*)"]);

              const isFullyPaid = manualPaidVal >= currentForecast - 0.01;



              if (!isFullyPaid) {

                const roomListStr = row.RoomingList_JSON;

                if (roomListStr) {

                  try {

                    const roomList = parseRoomingListSafe(roomListStr, "release-check");

                    roomList.forEach((item) => {

                      const dIn = new Date(toInputDate(item.dateIn));

                      if (!isNaN(dIn.getTime())) {

                        const diff = Math.ceil(

                          (dIn - now) / (1000 * 60 * 60 * 24),

                        );

                        if (diff <= 7) isReleaseUrgent = true;

                      }

                    });

                  } catch (e) { }

                }

                const comRelease = row.Com_Vencimiento_Rel

                  ? new Date(row.Com_Vencimiento_Rel)

                  : null;

                if (comRelease && !isNaN(comRelease.getTime())) {

                  if (comRelease <= sevenDaysFromNow) isReleaseUrgent = true;

                }

              }

              return isReleaseUrgent;

            }

            if (kpiFilter === "followup") {

              const followUp = row.Com_Seguimiento

                ? new Date(row.Com_Seguimiento)

                : null;

              if (followUp && !isNaN(followUp.getTime())) {

                return followUp <= now;

              }

              return false;

            }

            return true;

          });

        }



        // 4. Ordenación

        if (sortConfig.key) {

          filtered.sort((a, b) => {

            let valA = a[sortConfig.key] || "";

            let valB = b[sortConfig.key] || "";



            // Tratamiento especial fechas

            if (sortConfig.key === "Entrada" || sortConfig.key === "Salida") {

              valA = toInputDate(valA) || "9999-99-99";

              valB = toInputDate(valB) || "9999-99-99";

            }

            // Tratamiento números

            if (

              sortConfig.key === "Importe(*)" ||

              sortConfig.key === "Pax."

            ) {

              valA = parseNum(valA);

              valB = parseNum(valB);

            }



            if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;

            if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;

            return 0;

          });

        }



        // 5. Filtro de Hotel (Vista Directorio)

        if (filterDirHotel) {

          filtered = filtered.filter((row) => {

            const raw = (

              row["Hotel_Asignado"] ||

              row["Hotel"] ||

              ""

            ).toLowerCase();

            if (filterDirHotel === "SERCOTEL GUADIANA") {

              return raw.includes("guadiana");

            }

            if (filterDirHotel === "Cumbria" || filterDirHotel === "Cumbria Spa&Hotel") {

              return raw.includes("cumb");

            }

            return false;

          });

        }



        // 6. Filtro de Comercial (Vista Directorio)

        if (filterDirCommercial) {

          filtered = filtered.filter((row) => {

            const rawC = (row["Com_Comercial"] || "").trim().toUpperCase();

            if (filterDirCommercial === "SIN_ASIGNAR") {

              return rawC === "";

            }

            return rawC === filterDirCommercial.toUpperCase();

          });

        }



        return filtered;

      }, [
        normalizedData,
        filterStatus,
        filterTime,
        searchTerm,
        kpiFilter,
        sortConfig,
        filterDirHotel,
        filterDirCommercial,
        showOnlyChanges,
        startDate,
        endDate,
      ]);



      // --- Cálculos de Estadísticas Globales (Reemplazado por lógica nueva) ---

      // Se usa stats calculado más abajo basado en processedData



      // --- Agrupación de Datos por "Nombre del Grupo" (Filtrados) ---

      const groupedData = useMemo(() => {

        const groups = {};



        processedData.forEach((row) => {

          const resId = normalizeId(row["Reserva"]);

          const key = resId; // Agrupamos por ID de reserva único para mantenerlas independientes



          const rowStatus = (row["Estado"] || "").toLowerCase();

          const getStatusPriority = (s) => {

            if (s.includes("conf") || s.includes("ok")) return 3;

            if (s.includes("tent") || s.includes("pros")) return 2;

            if (s.includes("anul") || s.includes("can")) return 1;

            return 0;

          };



          if (!groups[key]) {

            groups[key] = {

              id: resId,

              name: row["Nombre del Grupo"] || "Sin Nombre",

              agency: row["Empresa/Agencia"] || "",

              arrival: row["Entrada"],

              departure: row["Salida"],

              status: row["Estado"] || "",

              comercial: row["Com_Comercial"] || row["Comercial"] || "",

              totalPax: 0,

              totalRooms: 0,

              totalRevenue: 0,

              totalPaid: 0,

              totalCommission: 0,

              totalNights: 0,

              hotel: row["Hotel_Asignado"] || row["Hotel"] || "",

              isCredito: Boolean(row["Es_Credito"] === true || row["Es_Credito"] === "true" || row["Com_Es_Credito"] === true),

              isBudget: Boolean(
                String(resId || "").toUpperCase().startsWith("PRES-") ||
                String(row["uid"] || "").toUpperCase().startsWith("PRES-") ||
                String(row["Estado"] || "").toUpperCase().includes("PRESUP") ||
                String(row["Com_Estado_Interno"] || "").toUpperCase().includes("PRESUP") ||
                String(row["Segment."] || "").toUpperCase().includes("PRESUP")
              ),

              records: [],

            };

          } else {

            // Priorizar datos de la fila con mejor estado

            const existingPriority = getStatusPriority(

              groups[key].status.toLowerCase(),

            );

            const currentPriority = getStatusPriority(rowStatus);



            if (currentPriority > existingPriority) {

              groups[key].name = row["Nombre del Grupo"] || groups[key].name;

              groups[key].agency =

                row["Empresa/Agencia"] || groups[key].agency;

              groups[key].arrival = row["Entrada"];

              groups[key].departure = row["Salida"];

              groups[key].status = row["Estado"];

              groups[key].comercial =

                row["Com_Comercial"] || row["Comercial"] || groups[key].comercial;

              // También actualizar hotel si es un registro con mayor prioridad

              groups[key].hotel =

                row["Hotel_Asignado"] || row["Hotel"] || groups[key].hotel;

            }

          }

          if (row["Com_Comercial"] || row["Comercial"]) {
            groups[key].comercial = row["Com_Comercial"] || row["Comercial"];
          }

          if (
            String(resId || "").toUpperCase().startsWith("PRES-") ||
            String(row["uid"] || "").toUpperCase().startsWith("PRES-") ||
            String(row["Estado"] || "").toUpperCase().includes("PRESUP") ||
            String(row["Com_Estado_Interno"] || "").toUpperCase().includes("PRESUP") ||
            String(row["Segment."] || "").toUpperCase().includes("PRESUP")
          ) {
            groups[key].isBudget = true;
          }



          let importe = parseNum(row["Importe(*)"]);

          const suplementos = parseFloat(row.Suplementos || 0);

          const descuentos = parseFloat(row.Descuentos || 0);

          importe = (importe + suplementos - descuentos);



          // Guard against corruption: Don't sum if it's already a glitch

          if (importe > 10000000 || importe < -1000000) importe = 0;



          let pax = parseInt(row["Pax."] || 0);

          let rooms = parseInt(

            row["Cant. Habitaciones"] || row["Cant."] || row["Hab."] || 0,

          );

          // Fallback to RoomingList_JSON if rooms is 0

          if (row.RoomingList_JSON) {

            try {

              const rl = parseRoomingListSafe(row.RoomingList_JSON, "lodging-metrics");

              pax = calculateMaxDailyOccupancy(rl);

              // calculateMaxDailyRooms devuelve el pico diario de habitaciones
              // simultáneas, evitando sumar todos los bloques nocturnos.
              rooms = calculateMaxDailyRooms(rl);

            } catch (e) { }

          }



                    const noches = parseInt(row["Noches"] || 0);

          if (!isNaN(pax)) groups[key].totalPax += pax;
          if (!isNaN(rooms)) groups[key].totalRooms += rooms;
          if (!isNaN(noches)) groups[key].totalNights += noches;

          if (!groups[key].hasRoomingListOverride && !isNaN(importe)) {
              groups[key].totalRevenue += importe;
          }
          if (!groups[key].processedJSONs) groups[key].processedJSONs = new Set();
          
          if (row.RoomingList_JSON && row.RoomingList_JSON !== "[]" && !groups[key].processedJSONs.has("rl_" + row.RoomingList_JSON)) {
              try {
                const rlClean = getEconomicRoomingItems(row.RoomingList_JSON, "groups-comm-total");
                const commVal = rlClean.reduce((acc, i) => acc + (parseFloat(i.comision?.total_comision) || 0), 0);
                groups[key].totalCommission += commVal;
                groups[key].processedJSONs.add("rl_" + row.RoomingList_JSON);
                
                const rlTotal = rlClean.reduce((acc, i) => acc + (parseFloat(i.total) || 0), 0);
                if (rlTotal > 0) {
                   groups[key].totalRevenue = rlTotal + suplementos - descuentos;
                   groups[key].hasRoomingListOverride = true;
                }
              } catch(e) {}
          }

          let planPaid = 0;
          try {
            const plan = JSON.parse(row.PaymentPlan_JSON || "[]");
            planPaid = plan.filter(p => p.status === "Cobrado").reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
          } catch(e) {}

          if (row.PaymentPlan_JSON && row.PaymentPlan_JSON !== "[]" && !groups[key].processedJSONs.has("plan_" + row.PaymentPlan_JSON)) {
              groups[key].totalPaid += planPaid;
              groups[key].processedJSONs.add("plan_" + row.PaymentPlan_JSON);
          } else if (!row.PaymentPlan_JSON || row.PaymentPlan_JSON === "[]") {
              const legacyPaid = parseNum(row["Com_Pagado"] || 0);
              const legacyKey = "legacy_paid_" + legacyPaid;
              if (legacyPaid > 0 && !groups[key].processedJSONs.has(legacyKey)) {
                  if (legacyPaid > groups[key].totalPaid + 0.05) {
                      groups[key].totalPaid = legacyPaid;
                      groups[key].processedJSONs.add(legacyKey);
                  }
              }
          }
          if (row["Es_Credito"] === true || row["Es_Credito"] === "true" || row["Com_Es_Credito"] === true) {
              groups[key].isCredito = true;
          }

          groups[key].records.push(row);

        });

        // --- Consolidación Bidireccional de Metadatos del Grupo por Reserva ---
        Object.values(groups).forEach((group) => {
          let bestComercial = group.comercial || "";
          let bestDailyDist = "";
          let bestRoomingList = "";
          let bestPaymentPlan = "";
          let bestLogRooming = "";
          let bestLogMenuMP = "";
          let bestLogMenuPC = "";
          let bestTpv = "";
          let bestNotas = "";
          let isCredito = group.isCredito || false;

          group.records.forEach((r) => {
            if (!bestComercial && (r["Com_Comercial"] || r["Comercial"])) {
              bestComercial = r["Com_Comercial"] || r["Comercial"];
            }
            if (!bestDailyDist && r.DailyDistribution_JSON && r.DailyDistribution_JSON !== "{}" && r.DailyDistribution_JSON !== "[]") {
              bestDailyDist = typeof r.DailyDistribution_JSON === "string" ? r.DailyDistribution_JSON : JSON.stringify(r.DailyDistribution_JSON);
            }
            if (!bestRoomingList && r.RoomingList_JSON && r.RoomingList_JSON !== "[]") {
              bestRoomingList = typeof r.RoomingList_JSON === "string" ? r.RoomingList_JSON : JSON.stringify(r.RoomingList_JSON);
            }
            if (!bestPaymentPlan && r.PaymentPlan_JSON && r.PaymentPlan_JSON !== "[]") {
              bestPaymentPlan = typeof r.PaymentPlan_JSON === "string" ? r.PaymentPlan_JSON : JSON.stringify(r.PaymentPlan_JSON);
            }
            if (!bestLogRooming && (r["Logistica_Rooming"] !== undefined && r["Logistica_Rooming"] !== null && r["Logistica_Rooming"] !== "")) {
              bestLogRooming = r["Logistica_Rooming"];
            }
            if (!bestLogMenuMP && (r["Logistica_MenuMP"] !== undefined && r["Logistica_MenuMP"] !== null && r["Logistica_MenuMP"] !== "")) {
              bestLogMenuMP = r["Logistica_MenuMP"];
            }
            if (!bestLogMenuPC && (r["Logistica_MenuPC"] !== undefined && r["Logistica_MenuPC"] !== null && r["Logistica_MenuPC"] !== "")) {
              bestLogMenuPC = r["Logistica_MenuPC"];
            }
            if (!bestTpv && r.Enlace_TPV) bestTpv = r.Enlace_TPV;
            if (!bestNotas && r.Com_Notas) bestNotas = r.Com_Notas;
            if (r.Es_Credito === true || r.Es_Credito === "true" || r.Com_Es_Credito === true) isCredito = true;
          });

          group.comercial = bestComercial;
          group.dailyDistribution = bestDailyDist;
          group.roomingList = bestRoomingList;
          group.paymentPlan = bestPaymentPlan;
          group.logisticaRooming = bestLogRooming;
          group.logisticaMenuMP = bestLogMenuMP;
          group.logisticaMenuPC = bestLogMenuPC;
          group.enlaceTpv = bestTpv;
          group.comNotas = bestNotas;
          group.isCredito = isCredito;

          // Propagar al registro maestro records[0] y a todos los demás para que cualquier vista tenga los datos completos
          group.records.forEach((r) => {
            if (bestComercial && !r["Com_Comercial"]) r["Com_Comercial"] = bestComercial;
            if (bestDailyDist && !r.DailyDistribution_JSON) r.DailyDistribution_JSON = bestDailyDist;
            if (bestRoomingList && (!r.RoomingList_JSON || r.RoomingList_JSON === "[]")) r.RoomingList_JSON = bestRoomingList;
            if (bestPaymentPlan && (!r.PaymentPlan_JSON || r.PaymentPlan_JSON === "[]")) r.PaymentPlan_JSON = bestPaymentPlan;
            if (bestLogRooming && !r["Logistica_Rooming"]) r["Logistica_Rooming"] = bestLogRooming;
            if (bestLogMenuMP && !r["Logistica_MenuMP"]) r["Logistica_MenuMP"] = bestLogMenuMP;
            if (bestLogMenuPC && !r["Logistica_MenuPC"]) r["Logistica_MenuPC"] = bestLogMenuPC;
            if (bestTpv && !r.Enlace_TPV) r.Enlace_TPV = bestTpv;
            if (bestNotas && !r.Com_Notas) r.Com_Notas = bestNotas;
            if (isCredito) r.Es_Credito = true;
          });

          // Recalcular group.totalPaid deduplicando planes de pago por hotel para evitar duplicidad al tener múltiples líneas
          const groupUniqueHotels = Array.from(new Set(group.records.map(r => r["Hotel_Asignado"] || r["Hotel"] || "General")));
          let calculatedGroupPaid = 0;
          const processedGroupPlans = new Set();

          groupUniqueHotels.forEach(hName => {
            const hRec = group.records.find(r => (r["Hotel_Asignado"] || r["Hotel"] || "General") === hName) || group.records[0];
            if (hRec && hRec.PaymentPlan_JSON && hRec.PaymentPlan_JSON !== "[]" && !processedGroupPlans.has(hRec.PaymentPlan_JSON)) {
              processedGroupPlans.add(hRec.PaymentPlan_JSON);
              try {
                const pList = JSON.parse(hRec.PaymentPlan_JSON);
                if (Array.isArray(pList)) {
                  calculatedGroupPaid += pList.filter(p => p.status === "Cobrado").reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
                }
              } catch(e) {}
            }
          });

          const legacyPaid = parseNum(group.records[0]?.["Com_Pagado"] || 0);
          group.totalPaid = Math.max(legacyPaid, calculatedGroupPaid);
        });

        return Object.values(groups).sort((a, b) => {

          const key = sortConfig.key || "totalRevenue";

          const dir = sortConfig.direction === "asc" ? 1 : -1;



          let valA =

            a[key] !== undefined

              ? a[key]

              : a.records && a.records[0]

                ? a.records[0][key]

                : "";

          let valB =

            b[key] !== undefined

              ? b[key]

              : b.records && b.records[0]

                ? b.records[0][key]

                : "";



          // Special date handling

          if (key === "arrival" || key === "Entrada") {

            return (

              (toInputDate(valA) || "9999").localeCompare(

                toInputDate(valB) || "9999",

              ) * dir

            );

          }



          if (typeof valA === "string") valA = valA.toLowerCase();

          if (typeof valB === "string") valB = valB.toLowerCase();



          if (valA < valB) return -1 * dir;

          if (valA > valB) return 1 * dir;

          return 0;

        });

      }, [processedData, sortConfig]);

      // --- MAPA DE DISTRIBUCIONES GUARDADAS POR RESERVA ---
      const savedDistributionsByReserva = useMemo(() => {
        const map = {};
        (data || []).forEach((row) => {
          const rawId = String(row["Reserva"] || "").trim();
          const normId = normalizeId(rawId);
          if (!normId && !rawId) return;
          if (row.DailyDistribution_JSON) {
            try {
              const parsed = typeof row.DailyDistribution_JSON === "string" 
                ? JSON.parse(row.DailyDistribution_JSON) 
                : row.DailyDistribution_JSON;
              if (parsed && typeof parsed === "object") {
                if (normId) map[normId] = { ...(map[normId] || {}), ...parsed };
                if (rawId) map[rawId] = { ...(map[rawId] || {}), ...parsed };
                const cleanId = rawId.replace(/\.0$/, "").replace(/[\/\\]/g, "-");
                if (cleanId) map[cleanId] = { ...(map[cleanId] || {}), ...parsed };
              }
            } catch (e) {}
          }
        });
        return map;
      }, [data]);

      // --- MATRIZ DE OCUPACIÓN Y DISTRIBUCIÓN DIARIA ---
      const dailyOccupancyList = useMemo(() => {
        if (!window.GroupOccupancyService) return [];
        return window.GroupOccupancyService
          .calculateDailyOccupancyMatrix(processedData, savedDistributionsByReserva)
          .map((item) => ({
            ...item,
            hotel: normalizeHotelNameLocal(item.hotel, item.hotel || "Sercotel Guadiana"),
          }));
      }, [processedData, savedDistributionsByReserva]);

      const dailyHotelOptions = useMemo(() => {
        return Array.from(new Set(
          dailyOccupancyList
            .map((d) => normalizeHotelNameLocal(d.hotel, d.hotel || "Sercotel Guadiana"))
            .filter(Boolean)
        )).sort();
      }, [dailyOccupancyList]);

      // --- FILTRADO DE LA LISTA DIARIA ---
      const filteredDailyOccupancy = useMemo(() => {
        return dailyOccupancyList.filter((item) => {
          if (dailyHotelFilter && item.hotel !== dailyHotelFilter) return false;
          
          const isAnul = String(item.estadoReserva || "").toLowerCase().includes("anul");
          if (dailyStatusFilter === "confirmada" && isAnul) return false;
          if (dailyStatusFilter === "anulada" && !isAnul) return false;

          if (dailyDistributionFilter === "requieren_atencion" && item.isDefinitive) return false;
          if (dailyDistributionFilter === "confirmada_o_modificada" && !item.isDefinitive) return false;
          if (dailyDistributionFilter === "validada_sin_cambios" && item.distributionStatus !== "validada_sin_cambios") return false;
          if (dailyDistributionFilter === "revision_necesaria" && item.distributionStatus !== "revision_necesaria") return false;
          if (dailyDistributionFilter === "propuesta" && item.distributionStatus !== "propuesta") return false;
          if (dailyDistributionFilter === "pendiente" && item.distributionStatus !== "pendiente") return false;

          if (dailyDateFrom && item.fecha < dailyDateFrom) return false;
          if (dailyDateTo && item.fecha > dailyDateTo) return false;

          if (searchTerm && searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase().trim();
            const matchRes = (item.reserva || "").toLowerCase().includes(term);
            const matchName = (item.nombreGrupo || "").toLowerCase().includes(term);
            if (!matchRes && !matchName) return false;
          }

          return true;
        });
      }, [dailyOccupancyList, dailyHotelFilter, dailyStatusFilter, dailyDistributionFilter, dailyDateFrom, dailyDateTo, searchTerm]);

      // --- AGRUPACIÓN POR RESERVA (Agrupar por nº de reserva para no duplicar líneas de estancia) ---
      const groupedDailyOccupancyByReserva = useMemo(() => {
        const map = new Map();

        filteredDailyOccupancy.forEach((dailyItem) => {
          const resNorm = normalizeId(dailyItem.reserva);
          const hotelNorm = normalizeHotelNameLocal(dailyItem.hotel, "Sercotel Guadiana");
          const key = `${hotelNorm}___${resNorm}`;

          if (!map.has(key)) {
            map.set(key, {
              reservaKey: key,
              hotel: hotelNorm,
              reserva: dailyItem.reserva,
              nombreGrupo: dailyItem.nombreGrupo,
              regimen: dailyItem.regimen || "-",
              estadoReserva: dailyItem.estadoReserva,
              dates: [dailyItem.fecha],
              days: [dailyItem],
              maxPax: dailyItem.pax || 0,
              contributingLines: [...(dailyItem.contributingLines || [])]
            });
          } else {
            const entry = map.get(key);
            if (!entry.dates.includes(dailyItem.fecha)) {
              entry.dates.push(dailyItem.fecha);
            }
            entry.days.push(dailyItem);
            if ((dailyItem.pax || 0) > entry.maxPax) {
              entry.maxPax = dailyItem.pax;
            }
            if ((!entry.regimen || entry.regimen === "-") && dailyItem.regimen) {
              entry.regimen = dailyItem.regimen;
            }
            if (dailyItem.contributingLines && dailyItem.contributingLines.length > 0) {
              entry.contributingLines.push(...dailyItem.contributingLines);
            }
          }
        });

        const statusPriority = {
          "revision_necesaria": 6,
          "pendiente": 5,
          "propuesta": 4,
          "modificada": 3,
          "confirmada": 2,
          "validada_sin_cambios": 1
        };

        const result = [];
        map.forEach((g) => {
          g.dates.sort();
          let totalImp = 0.0;
          let totalBreakfast = 0.0;
          let totalMeals = 0.0;
          let totalNet = 0.0;

          let highestStatus = "propuesta";
          let highestPriority = -1;
          let primaryReasons = [];

          g.days.forEach((day) => {
            let dayImp = 0.0;
            if (day.dailyAmount !== undefined && day.dailyAmount > 0) {
              dayImp = day.dailyAmount;
            } else if (day.contributingLines && day.contributingLines.length > 0) {
              day.contributingLines.forEach(l => {
                const nch = parseInt(l.noches, 10) || 1;
                dayImp += ((parseFloat(l.importe) || 0) / Math.max(1, nch));
              });
            }
            totalImp += dayImp;

            const pricing = window.BoardPricingService
              ? window.BoardPricingService.getPricingForHotelAndDate(day.hotel, day.fecha, boardPricingConfig)
              : { breakfast: 6.0, meal: 16.0 };

            const eco = window.BoardPricingService
              ? window.BoardPricingService.calculateDailyEconomicBreakdown({
                  pax: day.pax,
                  regimen: day.regimen,
                  dailyAmount: dayImp,
                  pricingConfig: pricing
                })
              : { breakfastCost: 0, mealCost: 0, netAccommodationPrice: dayImp, isNegativeAccommodation: false };

            totalBreakfast += (eco.breakfastCost || 0);
            totalMeals += (eco.mealCost || 0);
            totalNet += (eco.netAccommodationPrice || 0);

            const p = statusPriority[day.distributionStatus] || 0;
            if (p > highestPriority) {
              highestPriority = p;
              highestStatus = day.distributionStatus;
              if (day.revisionReasons && day.revisionReasons.length > 0) {
                primaryReasons = day.revisionReasons;
              }
            }
          });

          const candidateDays = g.days.filter(d => d.distributionStatus === highestStatus);
          const repDay = (candidateDays.length > 0 ? candidateDays : g.days).reduce((best, curr) => {
            return (curr.pax || 0) > (best.pax || 0) ? curr : best;
          }, g.days[0]);

          const minDate = g.dates[0];
          const maxDate = g.dates[g.dates.length - 1];
          let maxOutDate = "";
          (g.contributingLines || []).forEach(l => {
            const outNorm = (l.outDate && typeof l.outDate === "string") ? l.outDate.trim() : "";
            if (outNorm) {
              const iso = outNorm.includes("/") 
                ? (outNorm.split("/").length === 3 ? (outNorm.split("/")[0].length === 4 ? outNorm.split("/")[0] + "-" + outNorm.split("/")[1].padStart(2, "0") + "-" + outNorm.split("/")[2].padStart(2, "0") : outNorm.split("/")[2] + "-" + outNorm.split("/")[1].padStart(2, "0") + "-" + outNorm.split("/")[0].padStart(2, "0")) : outNorm)
                : outNorm;
              if (iso > maxOutDate) maxOutDate = iso;
            }
          });
          if (!maxOutDate && maxDate) {
            const d = new Date(maxDate + "T12:00:00Z");
            d.setUTCDate(d.getUTCDate() + 1);
            maxOutDate = d.toISOString().split("T")[0];
          }

          let dateDisplay = formatDate(minDate);
          if (maxOutDate && maxOutDate > minDate) {
            dateDisplay = `${formatDate(minDate)} - ${formatDate(maxOutDate)}`;
          } else if (minDate !== maxDate) {
            dateDisplay = `${formatDate(minDate)} - ${formatDate(maxDate)}`;
          }

          result.push({
            ...g,
            minDate,
            maxDate,
            dateDisplay,
            nightCount: g.dates.length,
            pax: g.maxPax,
            individuales: repDay.individuales,
            dobles: repDay.dobles,
            triples: repDay.triples,
            cuadruples: repDay.cuadruples,
            totalHabitaciones: repDay.totalHabitaciones,
            totalImp,
            totalBreakfast,
            totalMeals,
            totalNet,
            distributionStatus: highestStatus,
            revisionReasons: primaryReasons,
            representativeDay: repDay
          });
        });

        // Ordenar por fecha de inicio y luego por número de reserva
        result.sort((a, b) => {
          if (a.minDate !== b.minDate) return a.minDate.localeCompare(b.minDate);
          return (a.reserva || "").localeCompare(b.reserva || "");
        });

        return result;
      }, [filteredDailyOccupancy, boardPricingConfig]);

      // --- TOTALES DE REPORTE DIARIO ---
      const dailyReportTotals = useMemo(() => {
        if (!window.GroupOccupancyService) return {};
        return window.GroupOccupancyService.aggregateReportTotals(filteredDailyOccupancy);
      }, [filteredDailyOccupancy]);

      // --- ESTADÍSTICAS ECONÓMICAS POR RÉGIMEN Y CATEGORÍA (Reqs 18-21) ---
      const dailyEconomicStats = useMemo(() => {
        if (!window.BoardPricingService) return null;
        return window.BoardPricingService.calculateEconomicStatistics(filteredDailyOccupancy, boardPricingConfig);
      }, [filteredDailyOccupancy, boardPricingConfig]);

      const openDistributionModal = (dailyItem) => {
        const proposal = dailyItem.proposal || window.GroupOccupancyService?.generateDefaultProposal(dailyItem.pax) || {
          individuales: dailyItem.pax % 2,
          dobles: Math.floor(dailyItem.pax / 2),
          triples: 0,
          cuadruples: 0,
          totalHabitaciones: Math.floor(dailyItem.pax / 2) + (dailyItem.pax % 2)
        };

        let currentInd = dailyItem.individuales !== null && dailyItem.individuales !== undefined 
          ? dailyItem.individuales 
          : proposal.individuales;
        let currentDbl = dailyItem.dobles !== null && dailyItem.dobles !== undefined 
          ? dailyItem.dobles 
          : proposal.dobles;
        let currentTpl = dailyItem.triples !== null && dailyItem.triples !== undefined 
          ? dailyItem.triples 
          : proposal.triples;
        let currentCua = dailyItem.cuadruples !== null && dailyItem.cuadruples !== undefined 
          ? dailyItem.cuadruples 
          : proposal.cuadruples;

        // ── LEER GRATUIDADES EXISTENTES DEL ROOMINGLIST PARA ESTA FECHA ──────
        const targetResId = normalizeId(dailyItem.reserva);
        const matchRow = (data || []).find(r => normalizeId(r["Reserva"]) === targetResId);
        const existingRL = matchRow?.RoomingList_JSON 
          ? parseRoomingListSafe(matchRow.RoomingList_JSON, "open-dist-modal") 
          : [];
        let initialFreeInd = 0;
        let initialFreeDbl = 0;
        let initialFreeTpl = 0;
        let initialFreeCua = 0;

        // Intentar leer gratuidades guardadas previamente en DailyDistribution_JSON
        let distGratuities = null;
        if (matchRow?.DailyDistribution_JSON) {
          try {
            const distMap = typeof matchRow.DailyDistribution_JSON === "string"
              ? JSON.parse(matchRow.DailyDistribution_JSON)
              : matchRow.DailyDistribution_JSON;
            distGratuities = distMap?.[dailyItem.fecha]?.gratuities;
          } catch(e) {}
        }

        if (distGratuities) {
          initialFreeInd = parseInt(distGratuities.individuales, 10) || 0;
          initialFreeDbl = parseInt(distGratuities.dobles, 10) || 0;
          initialFreeTpl = parseInt(distGratuities.triples, 10) || 0;
          initialFreeCua = parseInt(distGratuities.cuadruples, 10) || 0;
        } else {
          existingRL.forEach((item) => {
            const itype = String(item.type || item.roomType || "").toUpperCase();
            const iprice = parseFloat(item.price);
            const isGratuity = itype.includes("GRATUIDAD") || iprice === 0 || isNaN(iprice);
            if (!isGratuity) return;
            const iDate = toInputDate(item.dateIn || item.date);
            if (iDate && dailyItem.fecha && iDate !== dailyItem.fecha) return;
            const qty = parseInt(item.qty, 10) || 1;
            if (itype.includes("INDIV") || itype.includes("SINGLE") || itype.includes("SGL") || itype.includes("DUI")) {
              initialFreeInd += qty;
            } else if (itype.includes("DBL") || itype.includes("DOBLE")) {
              initialFreeDbl += qty;
            } else if (itype.includes("TPL") || itype.includes("TRIPLE")) {
              initialFreeTpl += qty;
            } else if (itype.includes("CUA") || itype.includes("CUAD")) {
              initialFreeCua += qty;
            }
          });
        }

        // Acotar para no exceder las habitaciones de cada tipo
        initialFreeInd = Math.min(currentInd, initialFreeInd);
        initialFreeDbl = Math.min(currentDbl, initialFreeDbl);
        initialFreeTpl = Math.min(currentTpl, initialFreeTpl);
        initialFreeCua = Math.min(currentCua, initialFreeCua);

        const isCumbriaHotel = normalizeHotelNameLocal(dailyItem.hotel, "Sercotel Guadiana") === "Cumbria Spa&Hotel" ||
          String(dailyItem.hotel || "").toLowerCase().includes("cumbria");
        if (isCumbriaHotel) {
          currentCua = 0;
          initialFreeCua = 0;
        }

        const totalInitialFree = initialFreeInd + initialFreeDbl + initialFreeTpl + initialFreeCua;
        // ────────────────────────────────────────────────────────────────────

        // Sincronizar directamente con habitaciones de la Ficha de Grupo (RoomingList_JSON) para esta fecha
        const expandedRL = expandRoomListByDays(existingRL);
        const dayRooms = expandedRL.filter(item => {
          if (item.isService) return false;
          const iDate = toInputDate(item.dateIn || item.date);
          return iDate && iDate === dailyItem.fecha;
        });

        let rlInd = 0, rlDbl = 0, rlTpl = 0, rlCua = 0, rlPax = 0, rlRooms = 0;
        let rlPriceInd = "", rlPriceDbl = "", rlPriceTpl = "", rlPriceCua = "";
        let rlRegime = null;
        dayRooms.forEach(item => {
          const itype = String(item.type || item.roomType || "").toUpperCase();
          const tClean = itype.replace(/^(HAB\.|HABITACIÓN|HABITACION|HAB)\s+/i, "").trim();
          const isPureService = item.isService === true && !(/IND|DUI|SINGLE|DOB|DBL|TWIN|TRI|TPL|CUA|SUI|HAB/i.test(tClean));
          if (isPureService) return;

          const qty = parseInt(item.qty, 10) || 1;
          const price = parseFloat(item.price);
          const isGrat = itype.includes("GRATUIDAD") || price === 0 || isNaN(price);

          if (!isGrat && price > 0) {
            if (itype.includes("INDIV") || itype.includes("SINGLE") || itype.includes("SGL") || itype.includes("DUI")) {
              rlPriceInd = price;
            } else if (itype.includes("DBL") || itype.includes("DOBLE") || itype.includes("TWIN") || itype.includes("MATRI") || itype.includes("SUITE")) {
              rlPriceDbl = price;
            } else if (itype.includes("TPL") || itype.includes("TRIPLE")) {
              rlPriceTpl = price;
            } else if (itype.includes("CUA") || itype.includes("CUAD")) {
              if (isCumbriaHotel) rlPriceTpl = price;
              else rlPriceCua = price;
            }
          }

          if (item.regime && item.regime !== "-" && item.regime !== "---" && !rlRegime) {
            rlRegime = item.regime;
          }

          rlRooms += qty;

          if (itype.includes("INDIV") || itype.includes("SINGLE") || itype.includes("SGL") || itype.includes("DUI")) {
            rlInd += qty;
            rlPax += qty * 1;
          } else if (itype.includes("DBL") || itype.includes("DOBLE") || itype.includes("TWIN") || itype.includes("MATRI")) {
            rlDbl += qty;
            rlPax += qty * 2;
          } else if (itype.includes("TPL") || itype.includes("TRIPLE")) {
            rlTpl += qty;
            rlPax += qty * 3;
          } else if (itype.includes("CUA") || itype.includes("CUAD")) {
            if (isCumbriaHotel) {
              rlTpl += qty;
              rlPax += qty * 3;
            } else {
              rlCua += qty;
              rlPax += qty * 4;
            }
          } else if (itype.includes("SUITE")) {
            rlDbl += qty;
            rlPax += qty * 2;
          } else {
            rlDbl += qty;
            rlPax += qty * 2;
          }
        });

        // Fallback para precios si no estaban en este día específico: consultar distMap o todo el rooming list
        let distPrices = {};
        if (matchRow?.DailyDistribution_JSON) {
          try {
            const parsedDMap = typeof matchRow.DailyDistribution_JSON === "string"
              ? JSON.parse(matchRow.DailyDistribution_JSON)
              : matchRow.DailyDistribution_JSON;
            distPrices = parsedDMap?.[dailyItem.fecha]?.prices || {};
          } catch (e) {}
        }
        if (rlPriceInd === "" && distPrices.individuales !== undefined && distPrices.individuales > 0) rlPriceInd = distPrices.individuales;
        if (rlPriceDbl === "" && distPrices.dobles !== undefined && distPrices.dobles > 0) rlPriceDbl = distPrices.dobles;
        if (rlPriceTpl === "" && distPrices.triples !== undefined && distPrices.triples > 0) rlPriceTpl = distPrices.triples;
        if (rlPriceCua === "" && distPrices.cuadruples !== undefined && distPrices.cuadruples > 0) rlPriceCua = distPrices.cuadruples;

        if (rlPriceInd === "" || rlPriceDbl === "" || rlPriceTpl === "" || rlPriceCua === "") {
          expandedRL.forEach(item => {
            if (item.isService) return;
            const itype = String(item.type || item.roomType || "").toUpperCase();
            const price = parseFloat(item.price);
            const isGrat = itype.includes("GRATUIDAD") || price === 0 || isNaN(price);
            if (!isGrat && price > 0) {
              if (rlPriceInd === "" && (itype.includes("INDIV") || itype.includes("SINGLE") || itype.includes("SGL") || itype.includes("DUI"))) rlPriceInd = price;
              else if (rlPriceDbl === "" && (itype.includes("DBL") || itype.includes("DOBLE") || itype.includes("TWIN") || itype.includes("MATRI") || itype.includes("SUITE"))) rlPriceDbl = price;
              else if (rlPriceTpl === "" && (itype.includes("TPL") || itype.includes("TRIPLE"))) rlPriceTpl = price;
              else if (rlPriceCua === "" && (itype.includes("CUA") || itype.includes("CUAD"))) {
                if (isCumbriaHotel) rlPriceTpl = price;
                else rlPriceCua = price;
              }
            }
          });
        }

        const hasFichaRooms = rlRooms > 0;
        if (hasFichaRooms) {
          currentInd = rlInd;
          currentDbl = rlDbl;
          currentTpl = rlTpl;
          currentCua = rlCua;
          if (rlRegime) resolvedRegimen = rlRegime;
        }

        // Obtener el régimen real de este día: Ficha de Grupo (RoomingList_JSON) tiene máxima prioridad
        let resolvedRegimen = null;
        if (rlRegime) {
          resolvedRegimen = rlRegime;
        } else {
          const roomingThisDate = existingRL.find(item => !item.isService && toInputDate(item.dateIn || item.date) === dailyItem.fecha && item.regime && item.regime !== "-");
          if (roomingThisDate) {
            resolvedRegimen = roomingThisDate.regime;
          } else if (dailyItem.regimen && dailyItem.regimen !== "---" && dailyItem.regimen !== "-") {
            resolvedRegimen = dailyItem.regimen;
          } else if (matchRow?.DailyDistribution_JSON) {
            try {
              const distMap = typeof matchRow.DailyDistribution_JSON === "string"
                ? JSON.parse(matchRow.DailyDistribution_JSON)
                : matchRow.DailyDistribution_JSON;
              if (distMap?.[dailyItem.fecha]?.regimen) {
                resolvedRegimen = distMap[dailyItem.fecha].regimen;
              }
            } catch(e) {}
          }
          if (!resolvedRegimen || resolvedRegimen === "---" || resolvedRegimen === "-") {
            const anyValidItem = existingRL.find(item => !item.isService && item.regime && item.regime !== "-");
            if (anyValidItem) resolvedRegimen = anyValidItem.regime;
          }
          if (!resolvedRegimen || resolvedRegimen === "---" || resolvedRegimen === "-") {
            resolvedRegimen = "HD";
          }
        }

        setDistributionFormError(null);
        setEditingDistribution({
          hotel: dailyItem.hotel,
          reserva: dailyItem.reserva,
          nombreGrupo: dailyItem.nombreGrupo,
          fecha: dailyItem.fecha,
          pax: hasFichaRooms ? rlPax : dailyItem.pax,
          regimen: resolvedRegimen,
          proposal: proposal,
          individuales: currentInd,
          dobles: currentDbl,
          triples: currentTpl,
          cuadruples: currentCua,
          priceInd: rlPriceInd !== "" ? rlPriceInd : "",
          priceDbl: rlPriceDbl !== "" ? rlPriceDbl : "",
          priceTpl: rlPriceTpl !== "" ? rlPriceTpl : "",
          priceCua: rlPriceCua !== "" ? rlPriceCua : "",
          gratuitiesInd: initialFreeInd,
          gratuitiesDbl: initialFreeDbl,
          gratuitiesTpl: initialFreeTpl,
          gratuitiesCua: initialFreeCua,
          gratuitiesCount: totalInitialFree,
          observations: dailyItem.observations || "",
          status: hasFichaRooms ? "confirmada" : (dailyItem.distributionStatus || "propuesta"),
          revisionReasons: hasFichaRooms ? [] : (dailyItem.revisionReasons || []),
          previousDistribution: hasFichaRooms ? null : (dailyItem.previousDistribution || null),
          applyToAllHomogeneous: false
        });
      };

      const handleSaveDistribution = async (actionType = "guardar") => {
        if (!editingDistribution) return;
        setDistributionFormError(null);

        const isCumbriaDist = editingDistribution && (
          normalizeHotelNameLocal(editingDistribution.hotel, "Sercotel Guadiana") === "Cumbria Spa&Hotel" ||
          String(editingDistribution.hotel || "").toLowerCase().includes("cumbria")
        );

        let finalInd = parseInt(editingDistribution.individuales, 10) || 0;
        let finalDbl = parseInt(editingDistribution.dobles, 10) || 0;
        let finalTpl = parseInt(editingDistribution.triples, 10) || 0;
        let finalCua = isCumbriaDist ? 0 : (parseInt(editingDistribution.cuadruples, 10) || 0);
        let finalStatus = "modificada";

        if (actionType === "confirmar_propuesta") {
          finalInd = editingDistribution.proposal.individuales;
          finalDbl = editingDistribution.proposal.dobles;
          finalTpl = editingDistribution.proposal.triples;
          finalCua = isCumbriaDist ? 0 : editingDistribution.proposal.cuadruples;
          finalStatus = "confirmada";
        } else if (actionType === "reconfirmar_anterior") {
          const prevD = editingDistribution.previousDistribution || editingDistribution;
          finalInd = prevD.individuales !== undefined ? prevD.individuales : editingDistribution.individuales;
          finalDbl = prevD.dobles !== undefined ? prevD.dobles : editingDistribution.dobles;
          finalTpl = prevD.triples !== undefined ? prevD.triples : editingDistribution.triples;
          finalCua = isCumbriaDist ? 0 : (prevD.cuadruples !== undefined ? prevD.cuadruples : editingDistribution.cuadruples);
          finalStatus = "confirmada";
        } else if (actionType === "dejar_pendiente") {
          finalStatus = "pendiente";
          finalInd = null;
          finalDbl = null;
          finalTpl = null;
          finalCua = null;
        }

        // Si se confirma o modifica, validar la suma de Pax considerando gratuidades
        if (finalStatus === "confirmada" || finalStatus === "modificada") {
          const valRes = window.GroupOccupancyService?.validateOccupancyMatch({
            individuales: finalInd,
            dobles: finalDbl,
            triples: finalTpl,
            cuadruples: finalCua,
            gratuitiesInd: editingDistribution.gratuitiesInd,
            gratuitiesDbl: editingDistribution.gratuitiesDbl,
            gratuitiesTpl: editingDistribution.gratuitiesTpl,
            gratuitiesCua: editingDistribution.gratuitiesCua,
            gratuitiesCount: editingDistribution.gratuitiesCount
          }, editingDistribution.pax);

          if (valRes && !valRes.isValid) {
            if (!confirm(`La distribución configurada (${valRes.calculatedPax} pax en ${valRes.totalRooms} habitaciones) difiere de las ${editingDistribution.pax} personas registradas.\n\n¿Deseas guardar y confirmar esta distribución de todos modos?`)) {
              setDistributionFormError("La distribución no coincide con el número total de personas.");
              return;
            }
          }
        }

        setIsSavingDistribution(true);
        try {
          const targetResId = normalizeId(editingDistribution.reserva);
          const matchingRows = (data || []).filter((r) => normalizeId(r["Reserva"]) === targetResId);
          
          const primaryDoc = matchingRows[0];
          let existingDistMap = {};
          if (primaryDoc && primaryDoc.DailyDistribution_JSON) {
            try {
              existingDistMap = typeof primaryDoc.DailyDistribution_JSON === "string"
                ? JSON.parse(primaryDoc.DailyDistribution_JSON)
                : primaryDoc.DailyDistribution_JSON;
            } catch (e) {}
          }

          // Generar huella digital y snapshot de validación (Req 12)
          const matchedDay = dailyOccupancyList.find(d => d.reserva === editingDistribution.reserva && d.fecha === editingDistribution.fecha);
          const validationSnap = finalStatus !== "pendiente" && window.GroupOccupancyService?.createValidationSnapshot
            ? window.GroupOccupancyService.createValidationSnapshot({ contributingLines: matchedDay?.contributingLines || [] }, "Usuario")
            : null;

          const freeIndVal = Math.min(finalInd, parseInt(editingDistribution.gratuitiesInd !== undefined ? editingDistribution.gratuitiesInd : editingDistribution.gratuitiesCount, 10) || 0);
          const freeDblVal = Math.min(finalDbl, parseInt(editingDistribution.gratuitiesDbl, 10) || 0);
          const freeTplVal = Math.min(finalTpl, parseInt(editingDistribution.gratuitiesTpl, 10) || 0);
          const freeCuaVal = Math.min(finalCua, parseInt(editingDistribution.gratuitiesCua, 10) || 0);

          const priceIndVal = parseNum(editingDistribution.priceInd) || 0;
          const priceDblVal = parseNum(editingDistribution.priceDbl) || 0;
          const priceTplVal = parseNum(editingDistribution.priceTpl) || 0;
          const priceCuaVal = parseNum(editingDistribution.priceCua) || 0;

          const payingInd = Math.max(0, finalInd - freeIndVal);
          const payingDbl = Math.max(0, finalDbl - freeDblVal);
          const payingTpl = Math.max(0, finalTpl - freeTplVal);
          const payingCua = Math.max(0, finalCua - freeCuaVal);
          const calculatedDayTotal = (payingInd * priceIndVal) + (payingDbl * priceDblVal) + (payingTpl * priceTplVal) + (payingCua * priceCuaVal);

          const newEntry = {
            status: finalStatus,
            individuales: finalInd,
            dobles: finalDbl,
            triples: finalTpl,
            cuadruples: finalCua,
            totalHabitaciones: finalStatus === "pendiente" ? null : (finalInd + finalDbl + finalTpl + finalCua),
            pax: editingDistribution.pax,
            regimen: editingDistribution.regimen || "HD",
            proposed: editingDistribution.proposal,
            observations: editingDistribution.observations || "",
            prices: {
              individuales: priceIndVal,
              dobles: priceDblVal,
              triples: priceTplVal,
              cuadruples: priceCuaVal
            },
            dailyAmount: calculatedDayTotal > 0 ? calculatedDayTotal : undefined,
            gratuities: {
              individuales: freeIndVal,
              dobles: freeDblVal,
              triples: freeTplVal,
              cuadruples: freeCuaVal
            },
            gratuitiesCount: freeIndVal + freeDblVal + freeTplVal + freeCuaVal,
            validationSnapshot: validationSnap,
            reviewedBy: "Usuario",
            reviewedAt: new Date().toISOString()
          };

          existingDistMap[editingDistribution.fecha] = newEntry;

          // 1. Obtener items existentes de la Ficha (desde la ficha activa si está abierta o de primaryDoc)
          const existingRoomingRaw = (selectedGroupFicha && normalizeId(selectedGroupFicha.id) === targetResId && selectedGroupFicha.RoomingList_JSON)
            ? selectedGroupFicha.RoomingList_JSON
            : primaryDoc?.RoomingList_JSON;
          const existingRooming = existingRoomingRaw ? parseRoomingListSafe(existingRoomingRaw, "dist-save-preserve") : [];
          const hasExistingLodging = existingRooming.some((i) => !i.isService);

          // Fechas a las que aplica esta distribución
          const targetDates = new Set();
          if (editingDistribution.applyToAllHomogeneous) {
            const normTargetRes = normalizeId(editingDistribution.reserva);
            const targetPaxNum = parseInt(editingDistribution.pax, 10) || 0;

            // a. Fechas desde dailyOccupancyList que coincidan con la reserva
            (dailyOccupancyList || []).forEach((d) => {
              if (normalizeId(d.reserva) === normTargetRes) {
                const dPaxNum = parseInt(d.pax, 10) || 0;
                if (targetPaxNum <= 0 || dPaxNum <= 0 || dPaxNum === targetPaxNum) {
                  targetDates.add(d.fecha);
                }
              }
            });

            // b. Fechas presentes en el RoomingList actual de la reserva
            existingRooming.forEach((rm) => {
              const f = toInputDate(rm.dateIn || rm.date);
              if (f) targetDates.add(f);
            });

            // c. Fechas desde matchingRows (rango Entrada - Salida)
            matchingRows.forEach((r) => {
              const inD = toInputDate(r["Entrada"]);
              const outD = toInputDate(r["Salida"]);
              if (inD && outD) {
                try {
                  let cur = new Date(inD + "T00:00:00");
                  const end = new Date(outD + "T00:00:00");
                  while (cur < end) {
                    targetDates.add(cur.toISOString().split("T")[0]);
                    cur.setDate(cur.getDate() + 1);
                  }
                } catch (e) {}
              }
            });
          }
          if (editingDistribution.fecha) {
            targetDates.add(editingDistribution.fecha);
          }

          // Replicar en existingDistMap para todas las fechas destino
          if (editingDistribution.applyToAllHomogeneous) {
            targetDates.forEach((fStr) => {
              existingDistMap[fStr] = { ...newEntry };
            });
          }

          const jsonStringToSave = JSON.stringify(existingDistMap);

          // ── SINCRONIZACIÓN DE ROOMING LIST (LA FICHA MANDA) ────────────────
          let roomingJsonToSave = null;
          if (finalStatus !== "pendiente" && (finalInd + finalDbl + finalTpl + finalCua) > 0) {
            const firstR = matchingRows[0] || {};
            const hotelName = normalizeHotelNameLocal(firstR["Hotel_Asignado"] || firstR["Hotel"] || editingDistribution.hotel, "Sercotel Guadiana");
            const totImp = parseNum(firstR["Importe(*)"]) || 0;

            // Función auxiliar para calcular día siguiente
            const getNextDate = (dStr) => {
              try {
                const parts = dStr.split("-");
                if (parts.length === 3) {
                  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                  d.setDate(d.getDate() + 1);
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  return `${y}-${m}-${day}`;
                }
              } catch (e) {}
              return dStr;
            };

            if (hasExistingLodging) {
              // ── LA FICHA MANDA: PRESERVAR ÍNTEGRAMENTE PRECIOS Y REGÍMENES DE LA FICHA ──
              const expandedExisting = expandRoomListByDays(existingRooming);

              // Comprobar si las cantidades o precios de habitaciones cambiaron respecto a la Ficha
              let quantitiesChanged = false;
              let pricesChanged = false;
              targetDates.forEach((dStr) => {
                const dayLodging = expandedExisting.filter((i) => !i.isService && toInputDate(i.dateIn || i.date) === dStr);
                let indCount = 0, dblCount = 0, tplCount = 0, cuaCount = 0;
                dayLodging.forEach((it) => {
                  const t = String(it.type || it.roomType || "").toUpperCase();
                  const q = parseInt(it.qty, 10) || 1;
                  const isGrat = t.includes("GRATUIDAD") || parseFloat(it.price) === 0;
                  const curP = parseFloat(it.price) || 0;

                  if (t.includes("INDIV") || t.includes("SINGLE") || t.includes("DUI")) {
                    indCount += q;
                    if (!isGrat && priceIndVal > 0 && Math.abs(curP - priceIndVal) > 0.001) pricesChanged = true;
                  } else if (t.includes("DBL") || t.includes("DOBLE")) {
                    dblCount += q;
                    if (!isGrat && priceDblVal > 0 && Math.abs(curP - priceDblVal) > 0.001) pricesChanged = true;
                  } else if (t.includes("TPL") || t.includes("TRIPLE")) {
                    tplCount += q;
                    if (!isGrat && priceTplVal > 0 && Math.abs(curP - priceTplVal) > 0.001) pricesChanged = true;
                  } else if (t.includes("CUA") || t.includes("CUAD")) {
                    cuaCount += q;
                    if (!isGrat && priceCuaVal > 0 && Math.abs(curP - priceCuaVal) > 0.001) pricesChanged = true;
                  }
                });
                if (indCount !== finalInd || dblCount !== finalDbl || tplCount !== finalTpl || cuaCount !== finalCua) {
                  quantitiesChanged = true;
                }
              });

              if (!quantitiesChanged && !pricesChanged) {
                // Las cantidades y precios coinciden: no tocar RoomingList_JSON en absoluto.
                roomingJsonToSave = null;
              } else {
                // Cantidades o precios cambiados en el modal: actualizar RoomingList_JSON
                const keptItems = expandedExisting.filter((item) => {
                  if (item.isService) return true;
                  const iDate = toInputDate(item.dateIn || item.date);
                  return iDate && !targetDates.has(iDate);
                });

                const generatedDayItems = [];
                targetDates.forEach((dStr) => {
                  const nextDStr = getNextDate(dStr);
                  const prevLodgingThisDay = expandedExisting.filter((item) => {
                    if (item.isService) return false;
                    const iDate = toInputDate(item.dateIn || item.date);
                    return iDate === dStr;
                  });

                  const getExistingItem = (typeKeyword, isGratuity) => {
                    return prevLodgingThisDay.find((i) => {
                      const t = String(i.type || i.roomType || "").toUpperCase();
                      const matchType = t.includes(typeKeyword);
                      const matchGrat = t.includes("GRATUIDAD") || parseFloat(i.price) === 0;
                      return matchType && (isGratuity ? matchGrat : !matchGrat);
                    });
                  };

                  const freeInd = Math.min(finalInd, parseInt(editingDistribution.gratuitiesInd !== undefined ? editingDistribution.gratuitiesInd : editingDistribution.gratuitiesCount, 10) || 0);
                  const payingInd = Math.max(0, finalInd - freeInd);
                  const freeDbl = Math.min(finalDbl, parseInt(editingDistribution.gratuitiesDbl, 10) || 0);
                  const payingDbl = Math.max(0, finalDbl - freeDbl);
                  const freeTpl = Math.min(finalTpl, parseInt(editingDistribution.gratuitiesTpl, 10) || 0);
                  const payingTpl = Math.max(0, finalTpl - freeTpl);
                  const freeCua = Math.min(finalCua, parseInt(editingDistribution.gratuitiesCua, 10) || 0);
                  const payingCua = Math.max(0, finalCua - freeCua);

                  const pushRoomItem = (typeKeyword, label, payingQty, freeQty, paxPerRoom) => {
                    const prevPay = getExistingItem(typeKeyword, false);
                    const prevFree = getExistingItem(typeKeyword, true);
                    const dayReg = editingDistribution.regimen || prevPay?.regime || prevFree?.regime || "HD";
                    
                    let uPrice = prevPay?.price !== undefined ? parseFloat(prevPay.price) : 0;
                    if (typeKeyword === "INDIV" && priceIndVal > 0) uPrice = priceIndVal;
                    else if (typeKeyword === "DBL" && priceDblVal > 0) uPrice = priceDblVal;
                    else if (typeKeyword === "TPL" && priceTplVal > 0) uPrice = priceTplVal;
                    else if (typeKeyword === "CUA" && priceCuaVal > 0) uPrice = priceCuaVal;

                    if (payingQty > 0) {
                      generatedDayItems.push({
                        id: prevPay?.id || (Date.now() + Math.random() + 0.01),
                        hotel: hotelName,
                        type: label,
                        dateIn: dStr,
                        dateOut: nextDStr,
                        qty: payingQty,
                        pax: paxPerRoom,
                        regime: dayReg,
                        price: uPrice.toFixed(2),
                        nights: 1,
                        total: (payingQty * uPrice).toFixed(2),
                        isService: false
                      });
                    }
                    if (freeQty > 0) {
                      generatedDayItems.push({
                        id: prevFree?.id || (Date.now() + Math.random() + 0.02),
                        hotel: hotelName,
                        type: `${label} (GRATUIDAD)`,
                        dateIn: dStr,
                        dateOut: nextDStr,
                        qty: freeQty,
                        pax: paxPerRoom,
                        regime: dayReg,
                        price: "0.00",
                        nights: 1,
                        total: "0.00",
                        isService: false
                      });
                    }
                  };

                  pushRoomItem("INDIV", "INDIVIDUAL", payingInd, freeInd, 1);
                  pushRoomItem("DBL", "DOBLE", payingDbl, freeDbl, 2);
                  pushRoomItem("TPL", "TRIPLE", payingTpl, freeTpl, 3);
                  pushRoomItem("CUA", "CUÁDRUPLE", payingCua, freeCua, 4);
                });

                const newRoomingItems = [...keptItems, ...generatedDayItems];
                newRoomingItems.sort((a, b) => compareRoomItemsByDateAndType(a, b));
                roomingJsonToSave = JSON.stringify(newRoomingItems);
              }
            } else {
              // ── CASO INICIAL: No existían habitaciones en la Ficha ────────
              const freeInd = Math.min(finalInd, parseInt(editingDistribution.gratuitiesInd !== undefined ? editingDistribution.gratuitiesInd : editingDistribution.gratuitiesCount, 10) || 0);
              const payingInd = Math.max(0, finalInd - freeInd);
              const freeDbl = Math.min(finalDbl, parseInt(editingDistribution.gratuitiesDbl, 10) || 0);
              const payingDbl = Math.max(0, finalDbl - freeDbl);
              const freeTpl = Math.min(finalTpl, parseInt(editingDistribution.gratuitiesTpl, 10) || 0);
              const payingTpl = Math.max(0, finalTpl - freeTpl);
              const freeCua = Math.min(finalCua, parseInt(editingDistribution.gratuitiesCua, 10) || 0);
              const payingCua = Math.max(0, finalCua - freeCua);

              const generatedDayItems = [];
              targetDates.forEach((dStr) => {
                const nextDStr = getNextDate(dStr);
                const dayReg = editingDistribution.regimen || "HD";
                const payingPaxCount = Math.max(1, (payingInd * 1) + (payingDbl * 2) + (payingTpl * 3) + (payingCua * 4));
                const dayImp = totImp > 0 ? (totImp / Math.max(1, targetDates.size)) : 0;
                const dailyPerPax = dayImp > 0 ? (dayImp / payingPaxCount) : 0;

                const indUnitPrice = priceIndVal > 0 ? priceIndVal : (Math.round(dailyPerPax * 1 * 100) / 100);
                const dblUnitPrice = priceDblVal > 0 ? priceDblVal : (Math.round(dailyPerPax * 2 * 100) / 100);
                const tplUnitPrice = priceTplVal > 0 ? priceTplVal : (Math.round(dailyPerPax * 3 * 100) / 100);
                const cuaUnitPrice = priceCuaVal > 0 ? priceCuaVal : (Math.round(dailyPerPax * 4 * 100) / 100);

                if (payingInd > 0) {
                  generatedDayItems.push({
                    id: Date.now() + Math.random() + 0.01,
                    hotel: hotelName,
                    type: "INDIVIDUAL",
                    dateIn: dStr,
                    dateOut: nextDStr,
                    qty: payingInd,
                    pax: 1,
                    regime: dayReg,
                    price: indUnitPrice.toFixed(2),
                    nights: 1,
                    total: (payingInd * indUnitPrice).toFixed(2),
                    isService: false
                  });
                }
                if (freeInd > 0) {
                  generatedDayItems.push({
                    id: Date.now() + Math.random() + 0.02,
                    hotel: hotelName,
                    type: "INDIVIDUAL (GRATUIDAD)",
                    dateIn: dStr,
                    dateOut: nextDStr,
                    qty: freeInd,
                    pax: 1,
                    regime: dayReg,
                    price: "0.00",
                    nights: 1,
                    total: "0.00",
                    isService: false
                  });
                }
                if (payingDbl > 0) {
                  generatedDayItems.push({
                    id: Date.now() + Math.random() + 0.03,
                    hotel: hotelName,
                    type: "DOBLE",
                    dateIn: dStr,
                    dateOut: nextDStr,
                    qty: payingDbl,
                    pax: 2,
                    regime: dayReg,
                    price: dblUnitPrice.toFixed(2),
                    nights: 1,
                    total: (payingDbl * dblUnitPrice).toFixed(2),
                    isService: false
                  });
                }
                if (freeDbl > 0) {
                  generatedDayItems.push({
                    id: Date.now() + Math.random() + 0.035,
                    hotel: hotelName,
                    type: "DOBLE (GRATUIDAD)",
                    dateIn: dStr,
                    dateOut: nextDStr,
                    qty: freeDbl,
                    pax: 2,
                    regime: dayReg,
                    price: "0.00",
                    nights: 1,
                    total: "0.00",
                    isService: false
                  });
                }
                if (payingTpl > 0) {
                  generatedDayItems.push({
                    id: Date.now() + Math.random() + 0.04,
                    hotel: hotelName,
                    type: "TRIPLE",
                    dateIn: dStr,
                    dateOut: nextDStr,
                    qty: payingTpl,
                    pax: 3,
                    regime: dayReg,
                    price: tplUnitPrice.toFixed(2),
                    nights: 1,
                    total: (payingTpl * tplUnitPrice).toFixed(2),
                    isService: false
                  });
                }
                if (freeTpl > 0) {
                  generatedDayItems.push({
                    id: Date.now() + Math.random() + 0.045,
                    hotel: hotelName,
                    type: "TRIPLE (GRATUIDAD)",
                    dateIn: dStr,
                    dateOut: nextDStr,
                    qty: freeTpl,
                    pax: 3,
                    regime: dayReg,
                    price: "0.00",
                    nights: 1,
                    total: "0.00",
                    isService: false
                  });
                }
                if (payingCua > 0) {
                  generatedDayItems.push({
                    id: Date.now() + Math.random() + 0.05,
                    hotel: hotelName,
                    type: "CUÁDRUPLE",
                    dateIn: dStr,
                    dateOut: nextDStr,
                    qty: payingCua,
                    pax: 4,
                    regime: dayReg,
                    price: cuaUnitPrice.toFixed(2),
                    nights: 1,
                    total: (payingCua * cuaUnitPrice).toFixed(2),
                    isService: false
                  });
                }
                if (freeCua > 0) {
                  generatedDayItems.push({
                    id: Date.now() + Math.random() + 0.055,
                    hotel: hotelName,
                    type: "CUÁDRUPLE (GRATUIDAD)",
                    dateIn: dStr,
                    dateOut: nextDStr,
                    qty: freeCua,
                    pax: 4,
                    regime: dayReg,
                    price: "0.00",
                    nights: 1,
                    total: "0.00",
                    isService: false
                  });
                }
              });

              generatedDayItems.sort((a, b) => compareRoomItemsByDateAndType(a, b));
              roomingJsonToSave = generatedDayItems.length > 0 ? JSON.stringify(generatedDayItems) : null;
            }
          }

          let newTotalAmountStr = null;
          if (roomingJsonToSave) {
            try {
              const savedList = JSON.parse(roomingJsonToSave);
              const sumTot = savedList.reduce((acc, it) => acc + (parseFloat(it.total) || 0), 0);
              if (sumTot > 0) newTotalAmountStr = sumTot.toFixed(2);
            } catch (e) {}
          }

          // Recopilar todos los docIds de esta reserva en un Set para no omitir ninguno
          const docIdsToUpdate = new Set();
          if (targetResId) docIdsToUpdate.add(targetResId);
          matchingRows.forEach((r) => {
            if (r._docId) docIdsToUpdate.add(r._docId);
            const rNorm = normalizeId(r["Reserva"]);
            if (rNorm) docIdsToUpdate.add(rNorm);
          });

          // Actualizar en Firestore para todos los documentos de esta reserva
          if (docIdsToUpdate.size > 0) {
            const batch = db.batch();
            docIdsToUpdate.forEach((docId) => {
              const docRef = db.collection("groups").doc(docId);
              const payload = {
                DailyDistribution_JSON: jsonStringToSave,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
              };
              if (roomingJsonToSave) {
                payload.RoomingList_JSON = roomingJsonToSave;
                if (newTotalAmountStr) payload["Importe(*)"] = newTotalAmountStr;
              }
              batch.set(docRef, payload, { merge: true });
            });
            await batch.commit();
          }

          // Actualizar estado local inmediatamente
          setData((prev) => prev.map((r) => {
            if (normalizeId(r["Reserva"]) === targetResId || docIdsToUpdate.has(r._docId)) {
              const updated = { ...r, DailyDistribution_JSON: jsonStringToSave };
              if (roomingJsonToSave) {
                updated.RoomingList_JSON = roomingJsonToSave;
                if (newTotalAmountStr) updated["Importe(*)"] = newTotalAmountStr;
              }
              return updated;
            }
            return r;
          }));

          if (selectedGroupFicha && normalizeId(selectedGroupFicha.id) === targetResId) {
            setSelectedGroupFicha(prev => {
              if (!prev) return prev;
              const updatedRecords = (prev.records || []).map(r => {
                const updated = { ...r, DailyDistribution_JSON: jsonStringToSave };
                if (roomingJsonToSave) {
                  updated.RoomingList_JSON = roomingJsonToSave;
                  if (newTotalAmountStr) updated["Importe(*)"] = newTotalAmountStr;
                }
                return updated;
              });
              return {
                ...prev,
                records: updatedRecords,
                DailyDistribution_JSON: jsonStringToSave,
                ...(roomingJsonToSave ? { RoomingList_JSON: roomingJsonToSave } : {}),
                ...(newTotalAmountStr ? { "Importe(*)": newTotalAmountStr } : {})
              };
            });
          }

          setEditingDistribution(null);
        } catch (err) {
          console.error("Error al guardar distribución de habitaciones:", err);
          alert("Error al guardar la distribución: " + err.message);
        } finally {
          setIsSavingDistribution(false);
        }
      };



      // --- DEEP LINK: Abrir ficha si viene de Proforma con ?reserva= ---

      // NOTA: Debe estar DESPUÉS de groupedData para que la referencia sea válida cuando Babel transpila a var

      useEffect(() => {

        const params = new URLSearchParams(window.location.search);

        const rUrl = params.get("reserva");

        const rLocal = safeStorage.getItem("nexus_return_reserva");

        const reservaId = rUrl || rLocal;



        if (!reservaId) return;

        // GUARDIA ANTI-BUCLE: Si ya procesamos este ID en esta sesión, no volvemos a abrir
        const normIdCheck = normalizeId(reservaId).toLowerCase();
        if (deepLinkProcessedRef.current === normIdCheck) return;



        // Si no hay datos aún, esperamos la siguiente ejecución

        if (!data || data.length === 0) return;



        const normId = normIdCheck;

        // 1. Buscar en la fuente cruda (data) para ver si existe
        const matchInData = (data || []).find(r => 
          normalizeId(r.Reserva).toLowerCase() === normId || 
          normalizeId(r._docId || "").toLowerCase() === normId ||
          normalizeId(r.uid || "").toLowerCase() === normId
        );

        if (!matchInData) {
          // Si no existe en absoluto, limpiamos y salimos
          if (data && data.length > 0) {
            console.warn("❌ [Deep Link] ID no encontrado en DB:", normId);
            deepLinkProcessedRef.current = normId; // marcar como procesado aunque no exista
            safeStorage.removeItem("nexus_return_reserva");
            if (rUrl) {
              const newUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
            }
          }
          return;
        }

        // 2. Buscar en el listado procesado/filtrado (groupedData)
        const group = (groupedData || []).find((g) =>
          g.id.toLowerCase() === normId ||
          g.records.some(r => normalizeId(r.Reserva).toLowerCase() === normId || normalizeId(r._docId || "").toLowerCase() === normId)
        );

        if (!group) {
          // Si existe en data pero no en groupedData, es que los filtros actuales lo bloquean.
          // Abrimos filtros y esperamos al siguiente render.
          if (filterStatus !== "all" || filterTime !== "all" || searchTerm !== "") {
            setFilterStatus("all");
            setFilterTime("all");
            setSearchTerm("");
            setKpiFilter(null);
          }
          return; 
        }

        // 3. Si lo encontramos en groupedData, lo abrimos — marcamos como procesado ANTES de mutar estado
        deepLinkProcessedRef.current = normId;

        if (group) {
          // Limpieza de tokens y URL
          safeStorage.removeItem("nexus_return_reserva");
          if (rUrl) {
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          }

          // Restaurar los filtros por defecto SOLO si el grupo encaja en ellos.
          const label = group.statusLabel?.toLowerCase() || "";
          const arrival = toInputDate(group.arrival);
          const today = new Date().toISOString().split("T")[0];
          const isActivo = label !== "cancelado" && label !== "desestimado";
          const isFuturo = arrival && arrival >= today;

          if (isActivo && isFuturo) {
            setFilterStatus("activos");
            setFilterTime("future");
            setSearchTerm("");
          } else {
            // Si el grupo es pasado/confirmado-antiguo, filtramos específicamente por él
            // para evitar renderizar cientos de grupos antiguos y bloquear el navegador.
            setFilterStatus("all");
            setFilterTime("all");
            setSearchTerm(group.id);
          }

          setKpiFilter(null);

          // Delay para asegurar que el DOM y el estado de React estén estables
          setTimeout(() => {
            openFicha(group);
          }, 400);
        }

      }, [
        data,
        groupedData,
        filterStatus,
        filterTime,
        kpiFilter,
        searchTerm,
      ]);



      // --- Análisis detallado por Segmentos (Filtrados por Año de Estudio) ---
      const segmentStats = useMemo(() => {
        const segments = {};

        studyData.forEach((row) => {
          let segName = (row["Segment."] || "Sin Segmento")
            .toString()
            .trim()
            .toUpperCase();

          if (segName === "GRTANTEO") segName = "GRUPO TANTEO";
          if (segName === "GRUPOS") segName = "GRUPO";
          const groupName = row["Nombre del Grupo"] || "Sin Nombre";

          if (!segments[segName]) {
            segments[segName] = {
              name: segName,
              revenue: 0,
              roomRevenue: 0,
              pax: 0,
              nights: 0,
              roomNights: 0,
              count: 0,
              groupList: new Set(),
            };
          }

          const importe = parseNum(row["Importe(*)"]);
          let pax = parseInt(row["Pax."] || 0);
          if (isNaN(pax) || pax < 0) pax = 0;
          const noches = Math.max(1, parseInt(row["Noches"] || 1));
          let habs = parseInt(row["Cant. Habitaciones"] || row["Cant."] || row["Hab."] || row["Habitaciones"] || 0);
          if (isNaN(habs) || habs < 0) habs = 0;

          if (row.RoomingList_JSON && row.RoomingList_JSON !== "[]") {
            try {
              const rl = parseRoomingListSafe(row.RoomingList_JSON, "lodging-metrics");
              const rRooms = calculateMaxDailyRooms(rl);
              if (rRooms > 0) habs = rRooms;
              const rPax = calculateMaxDailyOccupancy(rl);
              if (rPax > 0) pax = rPax;
            } catch (e) { }
          }

          const roomCount = habs > 0 ? habs : (pax > 0 ? Math.max(1, Math.ceil(pax / 2)) : 1);
          const roomNights = roomCount * noches;

          if (!isNaN(importe)) segments[segName].revenue += importe;
          segments[segName].roomRevenue += calculateLodgingRevenue(row);
          segments[segName].pax += pax;
          segments[segName].nights += isNaN(noches) ? 0 : noches;
          segments[segName].roomNights += roomNights;
          segments[segName].count += 1;
          segments[segName].groupList.add(groupName);
        });

        return Object.values(segments)
          .map((s) => {
            const adr = s.roomNights > 0 ? s.roomRevenue / s.roomNights : (s.nights > 0 ? s.roomRevenue / s.nights : 0);
            return {
              ...s,
              adr: Math.round(adr * 100) / 100,
              groupCount: s.groupList.size,
              groups: Array.from(s.groupList)
                .map((name) => {
                  const groupObj = groupedData.find((g) => g.name === name);
                  if (!groupObj) return { name, arrival: null, obj: null };
                  return {
                    name,
                    arrival:
                      groupObj?.arrival || groupObj?.records?.[0]?.["Entrada"],
                    obj: groupObj,
                  };
                })
                .sort((a, b) => {
                  const da = new Date(toInputDate(a.arrival));
                  const db = new Date(toInputDate(b.arrival));
                  if (isNaN(da.getTime())) return 1;
                  if (isNaN(db.getTime())) return -1;
                  return da - db;
                }),
            };
          })
          .sort((a, b) => b.revenue - a.revenue);
      }, [studyData, groupedData]);



      // --- Mapa Histórico por Año y Mes (YYYY-M) para Comparativas YoY ---
      const historicalByYearMonth = useMemo(() => {
        const map = {};

        (normalizedData || []).forEach((row) => {
          const statusVal = (row["Com_Estado_Interno"] || row["Estado"] || "").toUpperCase();
          if (row.excludeFromStatistics === true || statusVal === "DESGLOSADO" || row.status === "DESGLOSADO") {
            return;
          }

          const hasReserva = (row["Reserva"] &&
            row["Reserva"].toString().trim() !== "" &&
            row["Reserva"].toString().trim() !== "-") ||
            (row["uid"] && row["uid"].toString().startsWith("PRES-"));
          if (!hasReserva) return;

          const stateLabel = row._stateLabel || "";
          if (stateLabel === "desestimado" || stateLabel === "cancelado") {
            return;
          }

          if (filterDirHotel) {
            const h = normalizeHotelName(row["Hotel_Asignado"] || row["Hotel"]);
            if (h !== filterDirHotel) return;
          }

          if (filterDirCommercial) {
            const com = (row["Com_Comercial"] || "").trim();
            if (filterDirCommercial === "SIN_ASIGNAR") {
              if (com !== "") return;
            } else if (com !== filterDirCommercial) {
              return;
            }
          }

          const arrival = row._normArrival || toInputDate(row["Entrada"]);
          if (arrival && arrival.length >= 7) {
            const parts = arrival.split("-");
            if (parts.length >= 2) {
              const y = parseInt(parts[0], 10);
              const m = parseInt(parts[1], 10) - 1;
              if (!isNaN(y) && !isNaN(m) && y > 2000 && y < 2100) {
                const key = `${y}-${m}`;
                if (!map[key]) {
                  map[key] = { pax: 0, revenue: 0, roomRevenue: 0, nights: 0, roomNights: 0, count: 0 };
                }
                const importe = parseNum(row["Importe(*)"]);
                const pax = parseInt(row["Pax."] || 0);
                const noches = parseInt(row["Noches"] || 0);
                const habs = parseInt(row["Cant. Habitaciones"] || row["Cant."] || row["Hab."] || row["Habitaciones"] || 0);
                const roomCount = habs > 0 ? habs : Math.max(1, Math.ceil(pax / 2));
                const roomNights = roomCount * Math.max(1, noches);

                map[key].pax += isNaN(pax) ? 0 : pax;
                map[key].revenue += isNaN(importe) ? 0 : importe;
                map[key].roomRevenue = (map[key].roomRevenue || 0) + calculateLodgingRevenue(row);
                map[key].nights += isNaN(noches) ? 0 : noches;
                map[key].roomNights += isNaN(roomNights) ? 0 : roomNights;
                map[key].count += 1;
              }
            }
          }
        });

        return map;
      }, [normalizedData, filterDirHotel, filterDirCommercial]);

      // --- Datos para Gráficos Globales (Filtrados) y Comparativa YoY ---
      const chartData = useMemo(() => {
        const monthNames = [
          "Ene", "Feb", "Mar", "Abr", "May", "Jun",
          "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
        ];
        const monthNamesLong = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];

        const currentMonthsMap = new Map();

        // Si hay un año concreto seleccionado, inicializamos los 12 meses de ese año
        // para que siempre aparezca el año completo ordenado de Enero a Diciembre
        if (studyYear && studyYear !== "all") {
          const sy = parseInt(studyYear, 10);
          for (let m = 0; m < 12; m++) {
            currentMonthsMap.set(`${sy}-${m}`, {
              year: sy,
              month: m,
              pax: 0,
              revenue: 0,
              roomRevenue: 0,
              nights: 0,
              roomNights: 0,
              count: 0
            });
          }
        }

        studyData.forEach((row) => {
          const arrival = row._normArrival || toInputDate(row["Entrada"]);
          if (arrival) {
            const date = new Date(arrival);
            if (!isNaN(date)) {
              const y = date.getFullYear();
              const m = date.getMonth();
              const key = `${y}-${m}`;
              if (!currentMonthsMap.has(key)) {
                currentMonthsMap.set(key, {
                  year: y,
                  month: m,
                  pax: 0,
                  revenue: 0,
                  roomRevenue: 0,
                  nights: 0,
                  roomNights: 0,
                  count: 0
                });
              }
              const item = currentMonthsMap.get(key);
              const importe = parseNum(row["Importe(*)"]);
              const pax = parseInt(row["Pax."] || 0);
              const noches = parseInt(row["Noches"] || 0);
              const habs = parseInt(row["Cant. Habitaciones"] || row["Cant."] || row["Hab."] || row["Habitaciones"] || 0);
              const roomCount = habs > 0 ? habs : Math.max(1, Math.ceil(pax / 2));
              const roomNights = roomCount * Math.max(1, noches);

              item.pax += isNaN(pax) ? 0 : pax;
              item.revenue += isNaN(importe) ? 0 : importe;
              item.roomRevenue = (item.roomRevenue || 0) + calculateLodgingRevenue(row);
              item.nights += isNaN(noches) ? 0 : noches;
              item.roomNights += isNaN(roomNights) ? 0 : roomNights;
              item.count += 1;
            }
          }
        });

        const sortedMonthKeys = Array.from(currentMonthsMap.keys()).sort((a, b) => {
          const [yA, mA] = a.split("-").map(Number);
          const [yB, mB] = b.split("-").map(Number);
          return (yA * 12 + mA) - (yB * 12 + mB);
        });

        const barData = sortedMonthKeys.map((key) => {
          const item = currentMonthsMap.get(key);
          const y = item.year;
          const m = item.month;
          const prevYear = y - 1;
          const prevKey = `${prevYear}-${m}`;
          const prevItem = historicalByYearMonth[prevKey] || { pax: 0, revenue: 0, roomRevenue: 0, nights: 0, roomNights: 0, count: 0 };

          const diffPax = item.pax - prevItem.pax;
          const pctPax = prevItem.pax > 0 ? ((diffPax / prevItem.pax) * 100) : (item.pax > 0 ? 100 : 0);

          const diffRevenue = item.revenue - prevItem.revenue;
          const pctRevenue = prevItem.revenue > 0 ? ((diffRevenue / prevItem.revenue) * 100) : (item.revenue > 0 ? 100 : 0);

          const adr = item.roomNights > 0 ? (item.roomRevenue || item.revenue) / item.roomNights : (item.nights > 0 ? (item.roomRevenue || item.revenue) / item.nights : 0);
          const prevAdr = prevItem.roomNights > 0 ? (prevItem.roomRevenue || prevItem.revenue) / prevItem.roomNights : (prevItem.nights > 0 ? (prevItem.roomRevenue || prevItem.revenue) / prevItem.nights : 0);
          const diffAdr = adr - prevAdr;
          const pctAdr = prevAdr > 0 ? ((diffAdr / prevAdr) * 100) : (adr > 0 ? 100 : 0);

          const pricePerPax = item.pax > 0 ? item.revenue / item.pax : 0;
          const prevPricePerPax = prevItem.pax > 0 ? prevItem.revenue / prevItem.pax : 0;

          return {
            name: `${monthNames[m]} ${y.toString().slice(-2)}`,
            prevName: `${monthNames[m]} ${prevYear.toString().slice(-2)}`,
            monthShort: monthNames[m],
            monthLong: monthNamesLong[m],
            year: y,
            prevYear: prevYear,
            Pax: item.pax,
            Ingresos: item.revenue,
            RoomRevenue: item.roomRevenue || 0,
            Noches: item.nights,
            RoomNights: item.roomNights,
            ADR: Math.round(adr * 100) / 100,
            PrecioMedioPax: Math.round(pricePerPax * 100) / 100,
            Grupos: item.count,
            PaxAnterior: prevItem.pax,
            IngresosAnterior: prevItem.revenue,
            RoomRevenueAnterior: prevItem.roomRevenue || 0,
            NochesAnterior: prevItem.nights,
            RoomNightsAnterior: prevItem.roomNights,
            ADRAnterior: Math.round(prevAdr * 100) / 100,
            PrecioMedioPaxAnterior: Math.round(prevPricePerPax * 100) / 100,
            GruposAnterior: prevItem.count,
            diffPax,
            pctPax: Math.round(pctPax * 10) / 10,
            diffRevenue,
            pctRevenue: Math.round(pctRevenue * 10) / 10,
            diffAdr,
            pctAdr: Math.round(pctAdr * 10) / 10,
          };
        });

        return { barData };
      }, [studyData, historicalByYearMonth, studyYear]);

      // --- Rendimiento y Estudio por Comercial (Acotado a Producción del Año de Estudio) ---
      const commercialStats = useMemo(() => {
        const commMap = {};

        studyData.forEach((row) => {
          let comName = (row["Com_Comercial"] || "").toString().trim().toUpperCase();
          if (!comName) comName = "SIN ASIGNAR";

          if (!commMap[comName]) {
            commMap[comName] = {
              name: comName,
              revenue: 0,
              roomRevenue: 0,
              pax: 0,
              nights: 0,
              roomNights: 0,
              groupCount: 0,
              groupList: new Set(),
            };
          }

          const importe = parseNum(row["Importe(*)"]);
          let pax = parseInt(row["Pax."] || 0);
          if (isNaN(pax) || pax < 0) pax = 0;
          const noches = Math.max(1, parseInt(row["Noches"] || 1));
          let habs = parseInt(row["Cant. Habitaciones"] || row["Cant."] || row["Hab."] || row["Habitaciones"] || 0);
          if (isNaN(habs) || habs < 0) habs = 0;

          if (row.RoomingList_JSON && row.RoomingList_JSON !== "[]") {
            try {
              const rl = parseRoomingListSafe(row.RoomingList_JSON, "lodging-metrics");
              const rRooms = calculateMaxDailyRooms(rl);
              if (rRooms > 0) habs = rRooms;
              const rPax = calculateMaxDailyOccupancy(rl);
              if (rPax > 0) pax = rPax;
            } catch (e) { }
          }

          const roomCount = habs > 0 ? habs : (pax > 0 ? Math.max(1, Math.ceil(pax / 2)) : 1);
          const roomNights = roomCount * noches;
          const gName = row["Nombre del Grupo"] || row["Reserva"] || "Grupo";

          if (!isNaN(importe)) commMap[comName].revenue += importe;
          commMap[comName].roomRevenue += calculateLodgingRevenue(row);
          commMap[comName].pax += pax;
          commMap[comName].nights += isNaN(noches) ? 0 : noches;
          commMap[comName].roomNights += roomNights;
          commMap[comName].groupList.add(gName);
        });

        const totalRevAll = Object.values(commMap).reduce((acc, c) => acc + c.revenue, 0);

        return Object.values(commMap)
          .map((c) => {
            const groups = c.groupList.size;
            const adr = c.roomNights > 0 ? c.roomRevenue / c.roomNights : (c.nights > 0 ? c.roomRevenue / c.nights : 0);
            const pricePerPax = c.pax > 0 ? c.revenue / c.pax : 0;
            const share = totalRevAll > 0 ? (c.revenue / totalRevAll) * 100 : 0;
            return {
              ...c,
              groupCount: groups,
              adr: Math.round(adr * 100) / 100,
              pricePerPax: Math.round(pricePerPax * 100) / 100,
              share: Math.round(share * 10) / 10,
            };
          })
          .sort((a, b) => b.revenue - a.revenue);
      }, [studyData]);

      // --- Métricas Globales Consolidadas con Comparativa YoY ---
      const globalStatsYoY = useMemo(() => {
        let totalPax = 0;
        let totalPaxPrev = 0;
        let totalRev = 0;
        let totalRevPrev = 0;
        let totalRoomRev = 0;
        let totalRoomRevPrev = 0;
        let totalNights = 0;
        let totalNightsPrev = 0;
        let totalRoomNights = 0;
        let totalRoomNightsPrev = 0;
        let totalGroups = 0;

        (chartData.barData || []).forEach((m) => {
          totalPax += m.Pax || 0;
          totalPaxPrev += m.PaxAnterior || 0;
          totalRev += m.Ingresos || 0;
          totalRevPrev += m.IngresosAnterior || 0;
          totalRoomRev += m.RoomRevenue || 0;
          totalRoomRevPrev += m.RoomRevenueAnterior || 0;
          totalNights += m.Noches || 0;
          totalNightsPrev += m.NochesAnterior || 0;
          totalRoomNights += m.RoomNights || 0;
          totalRoomNightsPrev += m.RoomNightsAnterior || 0;
          totalGroups += m.Grupos || 0;
        });

        const adr = totalRoomNights > 0 ? (totalRoomRev || totalRev) / totalRoomNights : (totalNights > 0 ? (totalRoomRev || totalRev) / totalNights : 0);
        const prevAdr = totalRoomNightsPrev > 0 ? (totalRoomRevPrev || totalRevPrev) / totalRoomNightsPrev : (totalNightsPrev > 0 ? (totalRoomRevPrev || totalRevPrev) / totalNightsPrev : 0);

        const pricePerPax = totalPax > 0 ? totalRev / totalPax : 0;
        const prevPricePerPax = totalPaxPrev > 0 ? totalRevPrev / totalPaxPrev : 0;

        const diffRev = totalRev - totalRevPrev;
        const pctRev = totalRevPrev > 0 ? ((diffRev / totalRevPrev) * 100) : (totalRev > 0 ? 100 : 0);

        const diffPax = totalPax - totalPaxPrev;
        const pctPax = totalPaxPrev > 0 ? ((diffPax / totalPaxPrev) * 100) : (totalPax > 0 ? 100 : 0);

        const diffAdr = adr - prevAdr;
        const pctAdr = prevAdr > 0 ? ((diffAdr / prevAdr) * 100) : (adr > 0 ? 100 : 0);

        return {
          totalPax,
          totalPaxPrev,
          diffPax,
          pctPax: Math.round(pctPax * 10) / 10,
          totalRev,
          totalRevPrev,
          diffRev,
          pctRev: Math.round(pctRev * 10) / 10,
          totalNights,
          totalNightsPrev,
          totalRoomNights,
          totalRoomNightsPrev,
          totalGroups,
          adr: Math.round(adr * 100) / 100,
          prevAdr: Math.round(prevAdr * 100) / 100,
          diffAdr: Math.round(diffAdr * 100) / 100,
          pctAdr: Math.round(pctAdr * 10) / 10,
          pricePerPax: Math.round(pricePerPax * 100) / 100,
          prevPricePerPax: Math.round(prevPricePerPax * 100) / 100,
        };
      }, [chartData]);




      // --- Top Grupos Chart ---

      const topGroupsData = useMemo(() => {

        return groupedData.slice(0, 10).map((g) => ({

          name: g.name.length > 15 ? g.name.substring(0, 15) + "..." : g.name,

          fullDate: g.name,

          Ingresos: g.totalRevenue,

        }));

      }, [groupedData]);



      // --- Funciones IA ---

      const handleConsultantClick = async () => {

        setIsAiLoading(true);

        setShowAiModal(true);

        setAiResult(null);



        // Preparamos el resumen para la IA incluyendo datos de segmentación

        const summary = {

          totalRevenue: stats.revenue,

          totalGroups: stats.count,

          topSegments: segmentStats

            .slice(0, 3)

            .map((s) => `${s.name} (${s.revenue.toFixed(0)}€)`)

            .join(", "),

          topMonths: chartData.barData

            .sort((a, b) => b.Ingresos - a.Ingresos)

            .slice(0, 3)

            .map((m) => m.name)

            .join(", "),

        };



        const prompt = `Actúa como un analista de Revenue Management experto para un hotel. 

                Analiza estos datos resumidos de grupos:

                - Ingresos Totales: ${summary.totalRevenue}

                - Total Grupos: ${summary.totalGroups}

                - Top 3 Segmentos (Ingresos): ${summary.topSegments}

                - Top Meses: ${summary.topMonths}

                

                Dame 3 conclusiones estratégicas breves y 1 recomendación de acción. Usa formato Markdown.

                Enfócate mucho en la rentabilidad de los segmentos. ¿Qué segmento deberíamos potenciar?`;



        try {

          const aiResult = await callGemini(prompt);

          if (!aiResult?.ok) {
            setAiResult({
              title: "Error Detectado",
              content: `**Detalles:** ${aiResult?.error || "No se ha podido conectar con el servicio de IA."}\n\n*Nota:* Si usas el archivo local (file://), la restricción de API web puede bloquearlo.`,
            });
          } else {
            setAiResult({ title: "Análisis Estratégico", content: aiResult.text });
          }

        } catch (e) {

          setAiResult({ title: "Error Crítico", content: e.message });

        }

        setIsAiLoading(false);

      };



      const handleEmailClick = async (group) => {

        setIsAiLoading(true);

        setShowAiModal(true);

        setAiResult(null);



        const prompt = `Escribe un email formal y acogedor para el organizador del grupo "${group.name}".

                Detalles:

                - Agencia: ${group.agency}

                - Llegada: ${group.arrival}

                - Salida: ${group.departure}

                - Pax: ${group.totalPax}

                - Importe total estimado: ${group.totalRevenue}€

                

                El objetivo es confirmar los detalles y dar la bienvenida. Menciona que estamos a su disposición para cualquier petición especial (dietas, salones, etc). Firma como "Dpto. de Grupos". Usa formato Markdown.`;

        try {

          const aiResult = await callGemini(prompt);
          if (!aiResult?.ok) {
              setAiResult({
                title: "Error Detectado",
                content: `**Detalles:** ${aiResult?.error || "No se ha podido conectar con el servicio de IA."}`,
              });
          } else {
              setAiResult({
                title: `Borrador Email: ${group.name}`,
                content: aiResult.text,
              });
          }

        } catch (err) {
          console.error("[handleEmailClick] Error al llamar a Gemini:", err);
          setAiResult({
            title: "Error de Conexión",
            content: `**No se ha podido conectar con el servicio de IA.**\n\nDetalle: ${err?.message || "Error desconocido"}.\n\nComprueba que la API Key esté configurada correctamente.`,
          });
        } finally {
          // Siempre resetear el estado de carga, aunque la llamada falle
          setIsAiLoading(false);
        }

      };



      const handleAiGroupParse = async () => {

        if (!aiEmailContent.trim()) return;

        setIsParsingEmail(true);



        const prompt = `Analiza el siguiente email y extrae la información para crear una reserva de grupo. 

                Responde EXCLUSIVAMENTE con un objeto JSON válido (sin bloques de código markdown) con esta estructura:

                {

                  "Nombre del Grupo": "Nombre extraído",

                  "Entrada": "YYYY-MM-DD",

                  "Salida": "YYYY-MM-DD",

                  "Pax.": "Número de personas",

                  "Empresa/Agencia": "Nombre agencia",

                  "Hotel_Asignado": "Hotel sugerido o vacío",

                  "Com_Comercial": "NATALIO",

                  "Observaciones": "Notas extraídas"

                }

                

                Email:

                ${aiEmailContent}`;



        try {

          const aiResult = await callGemini(prompt);

          if (!aiResult?.ok) {
              throw new Error(aiResult?.error || "No se ha podido procesar la solicitud con IA.");
          }

          const cleanJson = aiResult.text

            .replace(/```json/g, "")

            .replace(/```/g, "")

            .trim();

          const parsed = JSON.parse(cleanJson);



          const rawResID =

            "PRES." + Math.floor(100000 + Math.random() * 900000);

          const resID = normalizeId(rawResID);



          setAiReviewData({

            ...parsed,

            Reserva: resID,

            Estado: "PROSPECTO",

            Com_Estado_Interno: "PROSPECTO",

            "Importe(*)": "0",

          });

          setIsAiLoading(false);

          setShowReviewModal(true);

          setShowAddGroupModal(false);

        } catch (e) {

          console.error("Parse error:", e);

          alert(

            "No se pudo procesar el email automáticamente. Verifica el formato o inténtalo de nuevo.",

          );

        } finally {

          setIsParsingEmail(false);

        }

      };



      const saveReviewData = async () => {

        if (!aiReviewData) return;

        try {

          const resID = aiReviewData.Reserva;

          const entrada = aiReviewData.Entrada || "";

          const releaseDate = entrada ? (() => {

            const d = new Date(entrada);

            if (!isNaN(d.getTime())) {

              d.setDate(d.getDate() - 15);

              return d.toISOString().split("T")[0];

            }

            return "";

          })() : "";



          // Aseguramos que los campos requeridos estén presentes

          const finalData = {

            ...aiReviewData,

            "Segment.": aiReviewData["Nombre del Grupo"] || "GRUPOS",

            "Importe(*)": aiReviewData["Importe(*)"] || "0",

            "Com_Vencimiento_Rel": aiReviewData["Com_Vencimiento_Rel"] || releaseDate,

            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),

          };



          await db.collection("groups").doc(resID).set(finalData);

          setShowReviewModal(false);

          setAiReviewData(null);

          setAiEmailContent("");

          alert("🚀 Grupo creado y guardado como Prospecto.");

          // Forzamos recarga de datos si es necesario o dejamos que el listener actúe

        } catch (e) {

          console.error("Save error:", e);

          alert("Error al guardar el grupo.");

        }

      };



      const handleProformaClick = (group) => {

        if (!group) return;

        const records = group.records || [];

        if (records.length === 0) {

          alert(

            "⚠️ Este grupo no tiene registros asociados. No se puede generar la proforma.",

          );

          return;

        }

        // Prioridad: buscar un registro que tenga datos fiscales reales

        const baseRecord =

          records.find((r) => r.Fiscal_RazonSocial || r.Fiscal_CIF) ||

          records[0] ||

          {};

        const recWithPlan =

          records.find((r) => r.PaymentPlan_JSON) || baseRecord;



        // Detectar el hotel con máxima robustez:

        // 1. group.hotel (del groupedData, ya calculado)

        // 2. Cualquier record con Hotel_Asignado o Hotel

        // 3. Dentro de RoomingList_JSON (clave: algunos grupos importados de Excel

        //    tienen el hotel solo en las líneas de inventario, no en el campo principal)

        const detectHotel = () => {

          if (group.hotel) return group.hotel;

          for (const r of records) {

            const h = r["Hotel_Asignado"] || r["Hotel"] || "";

            if (h && !h.toLowerCase().includes("pending") && h !== "")

              return h;

          }

          // Buscar dentro de RoomingList_JSON como último recurso

          for (const r of records) {

            try {

              const rl = parseRoomingListSafe(r["RoomingList_JSON"], "get-hotel-fallback");

              for (const item of rl) {

                if (item.hotel) return item.hotel;

              }

            } catch (e) { }

          }

          return "SERCOTEL GUADIANA";

        };

        const detectedHotel = detectHotel();



        console.log(

          `🏨 [ProformaClick] Hotel detectado: "${detectedHotel}" (group.hotel="${group.hotel}")`,

        );



        const proformaData = {

          ...baseRecord,

          dailyConfig: group.dailyConfig || {},

          extraCharges: group.extraCharges || [],

          PaymentPlan_JSON: recWithPlan.PaymentPlan_JSON || "[]",

          "Nombre del Grupo": group.name,

          "Empresa/Agencia":

            group.agency || baseRecord["Empresa/Agencia"] || "",

          "Importe(*)": group.totalRevenue || baseRecord["Importe(*)"],

          "Pax.": group.totalPax || baseRecord["Pax."] || "0",

          Entrada: group.arrival || baseRecord["Entrada"],

          Salida: group.departure || baseRecord["Salida"],

          Hotel_Asignado: detectedHotel,

          Hotel: detectedHotel,

        };



        // Asegurar campos fiscales explícitos

        const fiscalFields = [

          "Fiscal_RazonSocial",

          "Fiscal_CIF",

          "Fiscal_Direccion",

          "Fiscal_CP",

          "Fiscal_Poblacion",

          "Fiscal_Provincia",

          "Fiscal_Pais",

          "Email",

          "Telefono",

          "Persona_Contacto",

        ];

        fiscalFields.forEach((f) => {

          if (baseRecord[f]) proformaData[f] = baseRecord[f];

        });

        // Evitar reutilizar una proforma antigua si el mapeo actual falla o descuadra.
        delete proformaData["ProformaItems"];
        delete proformaData["ProformaSourceTotal"];
        delete proformaData["ProformaSourceRoomNights"];



        // Mapeo de ítems del Room Manager

        let roomList = [];

        const rawRoomingLines = [];

        const processedLineKeys = new Set();

        const normalizeForRoomingKey = (value) => {
          if (value === null || value === undefined) return "";
          return String(value).trim().toLowerCase();
        };

        const parseRoomingAmount = (value) => {
          const normalized = String(value || 0)
            .replace(/[^\d,.-]/g, "")
            .replace(/\.(?=\d{3}(?:\D|$))/g, "")
            .replace(",", ".");
          const num = Number(normalized);
          return Number.isFinite(num) ? num : 0;
        };

        const normalizeMoneyForRoomingKey = (value) => parseRoomingAmount(value).toFixed(2);

        const buildRoomingLineKey = (item) => [
          normalizeForRoomingKey(item.hotel || item.hotelName || item.Hotel),
          normalizeForRoomingKey(item.type || item.roomType || item.product || item.producto || item.concept || item.Concepto),
          normalizeForRoomingKey(item.date || item.fecha || item.serviceDate || item.stayDate || item.dateIn),
          normalizeForRoomingKey(item.dateOut || item.checkout || item.salida),
          normalizeForRoomingKey(item.nights || item.noches || item.Noches),
          normalizeForRoomingKey(item.regime || item.reg || item.Regimen || item.REG),
          normalizeForRoomingKey(item.qty || item.quantity || item.cantidad || item.cant || item.Cant || item.CANT || item.rooms),
          normalizeMoneyForRoomingKey(item.price || item.unitPrice || item.precio || item.Precio),
          normalizeMoneyForRoomingKey(item.total || item.lineTotal || item.importe || item.Total),
        ].join("|");

        const sumRoomingLines = (lines) =>
          lines.reduce((acc, line) => {
            const total = parseRoomingAmount(line.total || line.lineTotal || line.importe || line.Total || 0);
            return acc + (Number.isFinite(total) ? total : 0);
          }, 0);

        const getRoomingQuantity = (line) => {
          const candidates = [
            line.qty,
            line.quantity,
            line.cantidad,
            line.cant,
            line.Cant,
            line.CANT,
            line.rooms,
            line.units,
            line.lineQuantity,
          ];
          for (const value of candidates) {
            const parsed = parseInt(String(value ?? "").replace(",", "."), 10);
            if (Number.isFinite(parsed) && parsed > 0) return parsed;
          }
          return 1;
        };

        const getRoomingUnitPrice = (line) => {
          const candidates = [
            line.price,
            line.unitPrice,
            line.precio,
            line.Precio,
            line.unit_price,
          ];
          for (const value of candidates) {
            const parsed = parseRoomingAmount(value);
            if (Number.isFinite(parsed) && parsed > 0) return parsed;
          }
          return 0;
        };

        const getRoomingLineTotal = (line) => {
          const candidates = [
            line.total,
            line.lineTotal,
            line.importe,
            line.Total,
            line.amount,
          ];
          for (const value of candidates) {
            const parsed = parseRoomingAmount(value);
            if (Number.isFinite(parsed) && parsed !== 0) return parsed;
          }
          const nights = parseInt(line.nights) || 1;
          return getRoomingQuantity(line) * getRoomingUnitPrice(line) * nights;
        };

        const isSummaryBudgetLine = (item, budgetTotal) => {
          const concept = String(
            item.concept ||
            item.concepto ||
            item.description ||
            item.descripcion ||
            item.name ||
            item.type ||
            item.regime ||
            ""
          ).trim().toLowerCase();
          const qty = getRoomingQuantity(item);
          const price = getRoomingUnitPrice(item);
          const total = getRoomingLineTotal(item);
          const normalizedBudgetTotal = parseRoomingAmount(budgetTotal);
          const looksLikeGenericConcept =
            concept.includes("servicio general") ||
            concept.includes("general service") ||
            concept === "servicio" ||
            concept === "service" ||
            concept.includes("total") ||
            concept.includes("presupuesto");
          const amountMatchesBudget =
            normalizedBudgetTotal > 0 &&
            (Math.abs(price - normalizedBudgetTotal) < 0.01 || Math.abs(total - normalizedBudgetTotal) < 0.01);

          // Es un resumen si el concepto lo indica Y coincide el importe, 
          // O si el importe coincide exactamente con todo el presupuesto y es 1 unidad.
          // Esto evita que líneas como "SA" se añadan como servicio huérfano de 1890€.
          return (looksLikeGenericConcept || amountMatchesBudget) && qty === 1 && amountMatchesBudget;
        };

        const budgetTotalForLineFilter = group.totalRevenue || baseRecord["Importe(*)"] || proformaData["Importe(*)"];
        const removedSummaryLines = [];

        // USAR LA FUENTE CENTRALIZADA DE VERDAD
        if (typeof window.roomingCore !== 'undefined' && window.roomingCore.getGroupEconomicItems) {
            roomList = window.roomingCore.getGroupEconomicItems(group);
            // Re-evaluar isSummaryBudgetLine
            roomList = roomList.filter(item => {
                if (isSummaryBudgetLine(item, budgetTotalForLineFilter)) {
                    removedSummaryLines.push(item);
                    return false;
                }
                return true;
            });
            // Assign to rawRoomingLines for compatibility
            rawRoomingLines.push(...roomList);
        } else {
            // Fallback (no deberia usarse si roomingCore existe)
            records.forEach((r) => {
              try {
                const list = getEconomicRoomingItems(r["RoomingList_JSON"], "proforma-lines");
                list.forEach((item) => {
                  rawRoomingLines.push(item);
                  if (isSummaryBudgetLine(item, budgetTotalForLineFilter)) {
                    removedSummaryLines.push(item);
                    return;
                  }
                  const lineKey = buildRoomingLineKey(item);
                  if (!processedLineKeys.has(lineKey)) {
                    processedLineKeys.add(lineKey);
                    roomList.push(item);
                  }
                });
              } catch (e) { }
            });
        }

        const expectedRoomingTotal = parseRoomingAmount(budgetTotalForLineFilter);
        const rawChargeLines = rawRoomingLines.filter((item) => !isSummaryBudgetLine(item, budgetTotalForLineFilter));
        const rawChargeTotal = parseFloat(rawChargeLines.reduce((acc, item) => acc + getRoomingLineTotal(item), 0).toFixed(2));
        const processedChargeTotal = parseFloat(roomList.reduce((acc, item) => acc + getRoomingLineTotal(item), 0).toFixed(2));

        if (
          expectedRoomingTotal > 0 &&
          Math.abs(processedChargeTotal - expectedRoomingTotal) > 0.01 &&
          rawChargeLines.length > 0 &&
          Math.abs(rawChargeTotal - expectedRoomingTotal) <= 0.01
        ) {
          console.warn("[PROFORMA] Se usan líneas brutas de ficha porque el procesado descuadra", {
            expectedRoomingTotal,
            processedChargeTotal,
            rawChargeTotal,
            processedLines: roomList,
            rawChargeLines,
          });
          roomList = rawChargeLines;
        }

        // MEJORA: Si la roomList está vacía o no tiene servicios, buscar servicios "huérfanos" en los records
        if (roomList.length === 0 || !roomList.some((i) => i.isService)) {
          records.forEach((r, idx) => {
            const regime = (r["Régimen"] || "").toUpperCase();
            const isServiceRegime =
              regime.includes("RESTAURAC") ||
              regime.includes("ALMUERZO") ||
              regime.includes("CENA") ||
              regime.includes("COCTEL");
            const pax = parseInt(r["Pax."] || 0);
            const imp = parseNum(r["Importe(*)"]);

            if (
              (isServiceRegime ||
                (imp > 0 && (!r["Noches"] || r["Noches"] == "0"))) &&
              pax > 0
            ) {
              const serviceConcept = r["Régimen"] || "";
              if (!serviceConcept.trim()) return;

              const candidateServiceLine = {
                type: serviceConcept,
                qty: 1,
                price: imp,
                total: imp,
                dateIn: r["Entrada"],
              };

              if (isSummaryBudgetLine(candidateServiceLine, budgetTotalForLineFilter)) {
                removedSummaryLines.push(candidateServiceLine);
                return;
              }
              const concepto = `${r["Régimen"] || "Servicio"} ${r["Entrada"] || ""}`;
              if (
                !roomList.some(
                  (i) => i.type === r["Régimen"] && i.dateIn === r["Entrada"],
                )
              ) {
                roomList.push({
                  id: `svc-${idx}-${r["Reserva"]}`,
                  hotel: r["Hotel_Asignado"] || r["Hotel"] || "GENERAL",
                  type: serviceConcept,
                  dateIn: r["Entrada"],
                  dateOut: r["Salida"] || r["Entrada"],
                  qty: 1,
                  pax: pax,
                  price: imp,
                  total: imp,
                  isService: true,
                  itemCategory: "service",
                  isAccommodation: false,
                  serviceCategory: /almuerzo|cena|desayuno|coffee/i.test(serviceConcept) ? "food-beverage" : undefined,
                  iva: 10,
                });
              }
            }
          });
        }

        if ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") && removedSummaryLines.length > 0) {
          console.log("[BUDGET_TO_GROUP] removedSummaryLines", removedSummaryLines);
          console.log("[BUDGET_TO_GROUP] cleanChargeLines", roomList);
        }



        // Resumen de habitaciones para el box de Ocupante

        let summaryParts = [];

        const typeCounts = {};

        roomList.forEach((r) => {

          if (r.isService) return;

          const t = r.type || "Habitación";

          typeCounts[t] = (typeCounts[t] || 0) + getRoomingQuantity(r);

        });

        Object.entries(typeCounts).forEach(([type, count]) => {

          summaryParts.push(`${count} ${type}`);

        });

        proformaData["RoomSummary"] = summaryParts.join(", ") || "---";



        try {
          const mappedItems = [];
          const fallbackDate =
            group.arrival ||
            baseRecord["Entrada"] ||
            new Date().toISOString().split("T")[0];

          if (roomList.length > 0) {
            const groupedMap = {};
            const ungroupedItems = [];

            // Normalization helpers
            const normText = (txt) => (txt || '').trim().toLowerCase();
            const normPrice = (pr) => Number(pr || 0).toFixed(2);
            const normalizeIva = (value, fallback = 10) => {
              if (value === null || value === undefined || value === "") {
                return Number(fallback).toFixed(2);
              }
              const parsed = Number(value);
              return Number.isFinite(parsed)
                ? parsed.toFixed(2)
                : Number(fallback).toFixed(2);
            };
            const getComisionKey = (com) => {
              if (!com) return "no_com";
              const percent = normPrice(com.porcentaje);
              const modo = normText(com.modo);
              const unitaria = normPrice(com.comision_unitaria);
              const base = normPrice(com.base_unitaria);
              return `com_${modo}_pct_${percent}_unit_${unitaria}_base_${base}`;
            };

            roomList.forEach((r) => {
              const nights = parseInt(r.nights) || 1;
              const dInStr =
                toInputDate(r.dateIn) || toInputDate(fallbackDate);
              const dIn = new Date(dInStr);

              // Selective grouping logic: only group room block charges that do NOT have observations
              const isRoomType = !r.isService;
              const hasObserv = (
                (r.observ && r.observ.trim() !== "") ||
                (r.observaciones && r.observaciones.trim() !== "") ||
                (r.Observaciones && r.Observaciones.trim() !== "") ||
                (r.nota && r.nota.trim() !== "") ||
                (r.notas && r.notas.trim() !== "")
              );
              const isGroupable = isRoomType && !hasObserv;

              for (let i = 0; i < nights; i++) {
                const currentDay = new Date(dIn);
                if (!isNaN(currentDay.getTime())) {
                  currentDay.setDate(currentDay.getDate() + i);
                }
                const finalIso = !isNaN(currentDay.getTime())
                  ? currentDay.toISOString().split("T")[0]
                  : toInputDate(fallbackDate);

                const roomQuantity = getRoomingQuantity(r);
                const unitPrice = getRoomingUnitPrice(r);

                const itemData = {
                  _dateIso: finalIso, // Temp for sorting
                  fecha: formatDate(finalIso),
                  hab: "1",
                  cant: roomQuantity, // Number first to accumulate
                  concepto: `${r.type}${r.regime ? ` (${r.regime})` : ""}`,
                  precio: unitPrice,
                  iva: Number(normalizeIva(r.iva, 10)),
                  regimen: r.regime || "",
                  dias: "1",
                  comision: r.comision,
                };

                if (isGroupable) {
                  const dateKey = finalIso;
                  const typeKey = normText(r.type);
                  const regimeKey = normText(r.regime);
                  const priceKey = normPrice(unitPrice);
                  const ivaKey = normalizeIva(r.iva, 10);
                  const comKey = getComisionKey(r.comision);

                  const groupKey = `${dateKey}_${typeKey}_${regimeKey}_${priceKey}_${ivaKey}_${comKey}`;

                  if (!groupedMap[groupKey]) {
                    groupedMap[groupKey] = {
                      ...itemData,
                      cant: 0
                    };
                  }
                  groupedMap[groupKey].cant += roomQuantity;
                } else {
                  // Keep item exact quantity
                  ungroupedItems.push(itemData);
                }
              }
            });

            // Format grouped quantities back to strings
            const groupedList = Object.values(groupedMap).map((item) => {
              item.cant = item.cant.toString();
              return item;
            });
            const formattedUngroupedList = ungroupedItems.map((item) => {
              item.cant = item.cant.toString();
              return item;
            });

            // Combine and sort chronologically, then alphabetically
            const allItems = [...groupedList, ...formattedUngroupedList];
            allItems.sort((a, b) => {
              if (a._dateIso !== b._dateIso) {
                return a._dateIso.localeCompare(b._dateIso);
              }
              return a.concepto.localeCompare(b.concepto);
            });

            // Remove temp sorting field and push to mappedItems
            allItems.forEach((item) => {
              delete item._dateIso;
              mappedItems.push(item);
            });

            if (mappedItems.length > 0) {
              const totalOriginal = parseFloat(roomList.reduce((acc, r) => acc + getRoomingLineTotal(r), 0).toFixed(2));
              const totalProforma = parseFloat(mappedItems.reduce((acc, item) => {
                const qty = parseRoomingAmount(item.cant);
                const price = parseRoomingAmount(item.precio);
                const days = parseRoomingAmount(item.dias) || 1;
                return acc + (qty * price * days);
              }, 0).toFixed(2));
              const roomNightsFicha = roomList.reduce((acc, r) => {
                const nights = parseInt(r.nights) || 1;
                return acc + (getRoomingQuantity(r) * nights);
              }, 0);
              const roomNightsProforma = mappedItems.reduce((acc, item) => {
                const qty = parseRoomingAmount(item.cant);
                const days = parseRoomingAmount(item.dias) || 1;
                return acc + (qty * days);
              }, 0);

              const confirmedBudgetTotal = parseRoomingAmount(group.totalRevenue || baseRecord["Importe(*)"] || proformaData["Importe(*)"]);
              const groupEconomicItems = typeof window.roomingCore !== 'undefined' && window.roomingCore.getGroupEconomicItems ? window.roomingCore.getGroupEconomicItems(group) : roomList;
              const groupEconomicTotal = parseFloat(groupEconomicItems.reduce((acc, item) => acc + (parseFloat(item.total || item.lineTotal || item.importe) || 0), 0).toFixed(2));
              const proformaItemsTotal = totalProforma; // mapped items sum

              let MONEY_TOLERANCE = 0.05;
              const budgetMatchesGroup = Math.abs(confirmedBudgetTotal - groupEconomicTotal) <= MONEY_TOLERANCE;
              const roundingDiff = parseFloat((groupEconomicTotal - proformaItemsTotal).toFixed(2));

              // Si el presupuesto coincide con la ficha económica pero hay un descuadre menor por redondeo de días/líneas:
              if (budgetMatchesGroup && Math.abs(roundingDiff) <= 1.00 && Math.abs(roundingDiff) > 0) {
                const lastItem = mappedItems[mappedItems.length - 1];
                if (lastItem) {
                  const qty = parseRoomingAmount(lastItem.cant) || 1;
                  const days = parseRoomingAmount(lastItem.dias) || 1;
                  lastItem.precio = parseFloat((parseRoomingAmount(lastItem.precio) + (roundingDiff / (qty * days))).toFixed(2));
                  proformaItemsTotal = parseFloat(mappedItems.reduce((acc, item) => {
                    const q = parseRoomingAmount(item.cant);
                    const p = parseRoomingAmount(item.precio);
                    const d = parseRoomingAmount(item.dias) || 1;
                    return acc + (q * p * d);
                  }, 0).toFixed(2));
                }
              }

              const groupMatchesProforma = Math.abs(groupEconomicTotal - proformaItemsTotal) <= MONEY_TOLERANCE;

              if (!budgetMatchesGroup || !groupMatchesProforma) {
                  const diff = confirmedBudgetTotal - groupEconomicTotal;
                  let missingStr = "";
                  
                  if (typeof window.roomingCore !== 'undefined' && window.roomingCore.reconcileEconomicItems) {
                      const rec = window.roomingCore.reconcileEconomicItems({
                          extraCharges: group.extraCharges || [],
                          existingEconomicItems: groupEconomicItems,
                          hotelName: detectedHotel
                      });
                      if (rec && rec.addedItems && rec.addedItems.length > 0) {
                          missingStr = "\\n\\nCargos sin sincronizar:\\n" + rec.addedItems.map(item => "• " + (item.type || item.concepto) + ": " + parseFloat(item.total).toLocaleString("es-ES", {minimumFractionDigits: 2}) + " €").join("\\n");
                      }
                  }

                  alert(`No se puede generar la proforma.\n\nPresupuesto confirmado: ${confirmedBudgetTotal.toLocaleString("es-ES", {minimumFractionDigits: 2})} €\nFicha económica: ${groupEconomicTotal.toLocaleString("es-ES", {minimumFractionDigits: 2})} €\nProforma preparada: ${proformaItemsTotal.toLocaleString("es-ES", {minimumFractionDigits: 2})} €\nDiferencia pendiente: ${diff.toLocaleString("es-ES", {minimumFractionDigits: 2})} €${missingStr}\n\nPor favor, usa la acción SINCRONIZAR CARGOS en la ficha económica.`);
                  
                  setShowFichaModal(true);
                  setHighlightSyncCharges(true);
                  setTimeout(() => {
                    syncChargesRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }, 150);
                  return;
              }

              
            console.log("[PROFORMA ECONOMIC ITEMS]", mappedItems);
            proformaData["ProformaItems"] = mappedItems;

              proformaData["ProformaSourceTotal"] = totalOriginal.toFixed(2);
              proformaData["ProformaSourceRoomNights"] = roomNightsFicha;
              // En proforma forzamos el importe a la suma de líneas
              proformaData["Importe(*)"] = totalOriginal.toFixed(2);
            }
          }
        } catch (e) {

          console.error("Error mapping room list", e);

        }

        if (!proformaData["ProformaItems"] || proformaData["ProformaItems"].length === 0) {
          alert("No se ha podido generar la proforma desde las líneas económicas reales de la ficha. No se usará una proforma anterior.");
          return;
        }



        safeStorage.setItem("selectedGroup", JSON.stringify(proformaData));

        const itemsToPass = proformaData["ProformaItems"] || [];

        safeStorage.setItem(

          "nexus_proforma_items",

          JSON.stringify(itemsToPass),

        );

        safeStorage.setItem(

          "nexus_proforma_reserva",

          String(baseRecord["Reserva"] || ""),

        );

        window.location.href = "Fac Prof.html";

      };



      // --- Persistencia FIREBASE ---

      useEffect(() => {
        const unsubscribe = db.collection("groups").onSnapshot(
          (snapshot) => {
            const docsMap = new Map();
            snapshot.forEach((doc) => {
              const d = doc.data();
              const reserva = d.Reserva || doc.id;
              const row = { ...d, _docId: doc.id, Reserva: reserva };
              docsMap.set(doc.id, row);
            });
            const dedupedRoomData = Array.from(docsMap.values());



            // Utility inside snapshot to normalize date comparisons

            const toStandardDate = (v) => {

              if (!v) return "";

              const str = String(v).trim();

              if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {

                const [y, m, d] = str.split("-");

                return `${d}/${m}/${y}`;

              }

              return str;

            };



            const getIsoDate = (val) => {

              if (!val) return "9999-12-31";

              const str = String(val);

              const parts = str.split(/[\/-]/);

              if (parts.length === 3) {

                const y = parts[2].length === 2 ? "20" + parts[2] : parts[2];

                return `${y}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;

              }

              return str;

            };



            setData((prevData) => {

              let merged = dedupedRoomData.map((dbRow) => {

                const resID = normalizeId(dbRow.Reserva);



                if (authorizingIds.current.has(resID)) {

                  // Autorización en curso: preservar datos locales (que son los nuevos del Excel)
                  // NO usar dbRow que puede tener los datos viejos de Firestore aún no propagados
                  const localPreview = prevData.find(
                    (p) =>
                      (p._docId && dbRow._docId && p._docId === dbRow._docId) ||
                      (p._recordKey && dbRow._recordKey && p._recordKey === dbRow._recordKey) ||
                      (normalizeId(p.Reserva) === resID && String(p._linea || "") === String(dbRow._linea || "") && p._linea) ||
                      normalizeId(p.Reserva) === resID,
                  );

                  if (localPreview)
                    return { ...localPreview, _diff: null, _changes: null };
                  return { ...dbRow, _diff: null, _changes: null };
                }

                const localMatch = prevData.find(
                  (p) =>
                    (p._docId && dbRow._docId && p._docId === dbRow._docId) ||
                    (p._recordKey && dbRow._recordKey && p._recordKey === dbRow._recordKey) ||
                    (normalizeId(p.Reserva) === resID && String(p._linea || "") === String(dbRow._linea || "") && p._linea) ||
                    normalizeId(p.Reserva) === resID,
                );

                if (localMatch) {

                  if (localMatch._diff) {

                    // No sobreescribir estados de cancelación que vienen de Firestore

                    const dbStatus = (

                      dbRow["Com_Estado_Interno"] || ""

                    ).toUpperCase();

                    const isCancelledInDb =

                      dbStatus.includes("CANCEL") ||

                      dbStatus.includes("ANUL") ||

                      dbStatus.includes("BAJA");

                    if (isCancelledInDb) {

                      // Firestore marca como cancelado: ignorar estado local, respetar Firestore

                      return {

                        ...localMatch,

                        ...dbRow,

                        _diff: localMatch._diff,

                        _changes: localMatch._changes,

                      };

                    }

                    return { ...dbRow, ...localMatch };

                  }

                  // Si no hay diff (datos limpios), debemos combinar local con firestore

                  // para no perder columnas excel que firestore no tiene aún.

                  // Firestore es fuente de verdad: sus datos prevalecen sobre los locales

                  // Preservar solo campos locales que Firestore no tiene (_diff ya es null)

                  return {

                    ...localMatch,

                    ...dbRow,

                    _diff: null,

                    _changes: null,

                  };

                }

                return { ...dbRow, _diff: null, _changes: null };

              });



              // Elimination of deduplication by baseId to keep multi-segment reservations independent if they use different suffixes

              // merged = deduped;  <-- Removed



              const localNews = (prevData || []).filter(

                (p) =>

                  p._diff === "new" &&

                  !authorizingIds.current.has(String(p.Reserva).trim()),

              );

              localNews.forEach((p) => {

                if (

                  !merged.some(

                    (m) =>

                      String(m.Reserva).trim() === String(p.Reserva).trim(),

                  )

                ) {

                  merged.push(p);

                }

              });



              return merged;

            });



            const allKeys = new Set();

            dedupedRoomData.forEach((r) =>

              Object.keys(r).forEach((k) => {

                if (!["_diff", "updatedAt"].includes(k)) allKeys.add(k);

              }),

            );

            setColumns(Array.from(allKeys));

          },

          (error) => {

            console.error("Error en tiempo real Firebase:", error);

          },

        );



        const handleVisibility = () => {

          if (document.visibilityState === "visible") {

            // Refrescar panel general al volver de otra pantalla (pestaña) solo si no hay modales abiertos

            // Esto evita que se cierren las fichas de edición al cambiar de pestaña

            if (!showFichaModal && !showAiModal && !isHotelModalOpen) {

                // window.location.reload(); // Desactivado por ahora para evitar cierres accidentales

            }

          }

        };

        window.addEventListener("visibilitychange", handleVisibility);



        return () => {

          unsubscribe();

          window.removeEventListener("visibilitychange", handleVisibility);

        };

      }, []);



      // Actualizar estadísticas: ENFOQUE COMERCIAL (Grupos, Estados, Pax)

      const stats = useMemo(() => {

        let totalRevenue = 0;

        let totalPax = 0;

        let activeCount = 0;

        let prospectCount = 0;

        let pendingQuotes = 0;

        let unattendedQuotes = 0; // Presupuestos sin comercial asignado

        const uniquePendingGroups = new Set();

        let releaseAlerts = 0;

        let followUpAlerts = 0;

        const uniqueFollowUpGroups = new Set(); // Deduplicar tareas por nombre de grupo

        let proforma24h = 0;

        let commercialsCount = {};



        const now = new Date();

        now.setHours(0, 0, 0, 0);

        const sevenDaysFromNow = new Date(now);

        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);



        const uniqueGroups = new Set();



        processedData.forEach((row) => {

          const extStatus = (row["Estado"] || "").toLowerCase();

          const intStatus = (row["Com_Estado_Interno"] || "").toLowerCase();

          const isCancelled =

            extStatus.includes("anul") ||

            extStatus.includes("cancel") ||

            extStatus.includes("baja") ||

            intStatus.includes("anul") ||

            intStatus.includes("cancel") ||

            intStatus.includes("baja") ||

            extStatus.includes("descart") ||

            intStatus.includes("descart") ||

            extStatus.includes("rechaz") ||

            intStatus.includes("rechaz");



          const groupId = row["Reserva"] || row["Nombre del Grupo"];

          const isNewGroup = groupId && !uniqueGroups.has(groupId);



          const importe = parseNum(row["Importe(*)"]);

          // Solo sumar revenue/pax si NO está cancelado (y deduplicando)

          if (!isCancelled && isNewGroup) {

            totalRevenue += importe;

            totalPax += parseInt(row["Pax."] || 0);

          }



          if (isNewGroup) {

            uniqueGroups.add(groupId);



            const comercial = row["Com_Comercial"];

            if (comercial && !isCancelled) {

              if (!commercialsCount[comercial])

                commercialsCount[comercial] = 0;

              commercialsCount[comercial]++;

            }



            const status = (

              row["Com_Estado_Interno"] ||

              row["Segment."] ||

              row["Estado"] ||

              "PROSPECTO"

            ).toUpperCase();



            // 1. Tanteos y Presupuestos

            if (

              status.includes("TANTEO") ||

              status.includes("TENTA") ||

              status.includes("PROSPEC") ||

              status.includes("PRESUP")

            ) {

              if (!isCancelled) {

                prospectCount++;



                const arrival = row["Entrada"]

                  ? toInputDate(row["Entrada"])

                  : null;

                const todayStr = now.toISOString().split("T")[0];

                const isPast = arrival && arrival < todayStr;

                const isDiscarded =

                  status.includes("DESCART") ||

                  status.includes("RECHAZ") ||

                  status.includes("ANUL") ||

                  status.includes("CANCEL");



                // Siempre excluir pasados o sin fecha del KPI Por Cotizar

                // Deduplicar por nombre de grupo (un grupo con 2 reservas cuenta como 1)

                // Añadido: Sólo debe considerarse "Por Cotizar" si el importe es 0

                const groupLabel = row["Nombre del Grupo"] || groupId;

                const rawImporte = String(row["Importe(*)"] || "0").trim();

                const isZero =

                  importe === 0 ||

                  rawImporte === "" ||

                  rawImporte === "0" ||

                  rawImporte === "0,00" ||

                  rawImporte === "0.00";



                if (

                  (status.includes("PRESUP") ||

                    (row["Reserva"] &&

                      String(row["Reserva"]).startsWith("PRES."))) &&

                  arrival &&

                  !isPast &&

                  !isDiscarded &&

                  isZero &&

                  !uniquePendingGroups.has(groupLabel)

                ) {

                  uniquePendingGroups.add(groupLabel);

                  pendingQuotes++;

                }

              }

            } else if (

              status.includes("CONF") ||

              status.includes("BLOQ") ||

              status.includes("OK") ||

              status.includes("CERR")

            ) {

              if (!isCancelled) activeCount++;

            }



            // 1b. Presupuestos sin comercial asignado

            if (status.includes("PRESUP") && !isCancelled) {

              const com = (row["Com_Comercial"] || "").trim();

              if (!com) unattendedQuotes++;

            }



            // 2. Release Alerts

            let isReleaseUrgent = false;

            const manualPaidVal = parseNum(row["Com_Pagado"] || "0");

            const currentForecast = parseNum(row["Importe(*)"]);

            const isFullyPaid = manualPaidVal >= currentForecast - 0.01;



            if (!isFullyPaid) {

              const roomListStr = row.RoomingList_JSON;

              if (roomListStr) {

                try {

                  const roomList = parseRoomingListSafe(roomListStr, "release-check");

                  roomList.forEach((item) => {

                    const dIn = new Date(toInputDate(item.dateIn));

                    if (!isNaN(dIn.getTime())) {

                      const diff = Math.ceil(

                        (dIn - now) / (1000 * 60 * 60 * 24),

                      );

                      if (diff <= 7) isReleaseUrgent = true;

                    }

                  });

                } catch (e) { }

              }

              const comRelease = row.Com_Vencimiento_Rel

                ? new Date(row.Com_Vencimiento_Rel)

                : null;

              if (comRelease && !isNaN(comRelease.getTime())) {

                if (comRelease <= sevenDaysFromNow) isReleaseUrgent = true;

              }

            }

            if (isReleaseUrgent) releaseAlerts++;



            // 3. Follow-up Alerts — deduplicado por nombre de grupo

            const followUp = row.Com_Seguimiento

              ? new Date(row.Com_Seguimiento)

              : null;

            if (followUp && !isNaN(followUp.getTime()) && followUp <= now) {

              const groupLabel = row["Nombre del Grupo"] || groupId;

              if (!uniqueFollowUpGroups.has(groupLabel)) {

                uniqueFollowUpGroups.add(groupLabel);

                followUpAlerts++;

              }

            }



            // 4. Proformas 24h

            if (row.ProformaItems && row.ProformaItems.length > 0) {

              // Si tiene ProformaItems, consideramos que tiene proforma.

              // Podríamos filtrar por fecha si existiera un campo de creación específico.

              proforma24h++;

            }

          }

        });



        return {

          revenue: totalRevenue.toLocaleString("es-ES", {

            style: "currency",

            currency: "EUR",

          }),

          active: activeCount,

          prospects: prospectCount,

          pendingQuotes: pendingQuotes,

          unattendedQuotes: unattendedQuotes,

          releaseAlerts: releaseAlerts,

          followUpAlerts: followUpAlerts,

          proformas: proforma24h,

          pax: totalPax,

          count: uniqueGroups.size,

          commercialsCount: commercialsCount,

        };

      }, [processedData]);



      // Auto-abrir Ficha si se detecta bandera en localStorage

      useEffect(() => {

        const groupToOpen = safeStorage.getItem("openGroupFicha");

        if (groupToOpen && (groupedData || []).length > 0) {

          const found = (groupedData || []).find(

            (g) => g.name === groupToOpen,

          );

          if (found) {

            openFicha(found);

            safeStorage.removeItem("openGroupFicha");

          }

        }

      }, [groupedData]);



      useEffect(() => {

        window.handleNexusUpload = handleFileUpload;

        window.handleNexusExport = exportExcel;

        window.handleNexusConsultantClick = handleConsultantClick;

        return () => {

          delete window.handleNexusUpload;

          delete window.handleNexusExport;

          delete window.handleNexusConsultantClick;

        };

      }, [handleFileUpload, exportExcel, handleConsultantClick]);



      useEffect(() => {
        const formatImportDate = (timestamp) => {
          if (!timestamp) return "";
          const date = new Date(timestamp);
          if (isNaN(date.getTime())) return "";
          const pad = (n) => n < 10 ? '0' + n : n;
          return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${String(date.getFullYear()).slice(-2)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
        };

        const gDate = hotelSettings.guadiana?.lastImportDate;
        const cDate = hotelSettings.cumbria?.lastImportDate;

        let dateStr = "";
        if (gDate || cDate) {
          const gStr = gDate ? formatImportDate(gDate) : "---";
          const cStr = cDate ? formatImportDate(cDate) : "---";
          dateStr = `Guadiana: ${gStr} | Cumbria: ${cStr}`;
        } else if (hotelSettings.lastImportDate) {
          // Fallback to legacy single import date
          dateStr = formatImportDate(hotelSettings.lastImportDate);
        }

        if (window.updateNexusHeaderImportDate) {
          window.updateNexusHeaderImportDate(dateStr);
        }
        
        // Save to localStorage for cross-page sync
        if (dateStr) {
          localStorage.setItem("nexus_last_import_str", dateStr);
        } else {
          localStorage.removeItem("nexus_last_import_str");
        }
      }, [hotelSettings]);



      const requestSort = (key) => {

        let direction = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {

          direction = "desc";

        }

        setSortConfig({ key, direction });

      };



      // Estados para Selección de Hotel en Importación

      const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);

      const [pendingFile, setPendingFile] = useState(null);



      // --- Funciones de Archivo (Parser Recargado) ---

      const handleFileUpload = (event) => {

        const file = event.target.files[0];

        if (!file) return;



        const filename = file.name.toLowerCase();



        // Auto-detectar hotel según el nombre del archivo para evitar errores humanos

        if (filename.includes("guadiana")) {

          confirmHotelAndProcess("Sercotel Guadiana", file);

        } else if (filename.includes("cumbria")) {

          confirmHotelAndProcess("Cumbria Spa&Hotel", file);

        } else {

          setPendingFile(file);

          setIsHotelModalOpen(true);

        }

      };



      const confirmHotelAndProcess = (hotelName, directFile = null) => {

        const file = directFile || pendingFile;

        setIsHotelModalOpen(false);

        setPendingFile(null);



        if (!file) {

          alert("Primero selecciona un archivo Excel/CSV.");

          return;

        }



        setLoading(true);

        if (window.ExcelService && window.ExcelService.parseAndMergeFile) {

            window.ExcelService.parseAndMergeFile(file, data, hotelName, (err, result) => {

                setLoading(false);

                if (err) {

                    alert(err.message || "Error al procesar el archivo");

                    return;

                }

                

                setData(result.sortedData);

                setColumns(result.columns);

                setImportSummaryData(result.summaryData);

                setShowImportSummary(true);

                

                if (result.summaryData.newGroupsCount > 0 || result.summaryData.modifiedGroupsCount > 0) {

                    setActiveTab("table");

                }

            });

        } else {

            setLoading(false);

            console.error("ExcelService no está disponible en window.");

            alert("Error crítico: El módulo ExcelService no está cargado.");

        }

      };



      const acceptChanges = () => {

        const batch = db.batch();

        const pendingRows = (data || []).filter((r) => r._diff);



        if (pendingRows.length === 0) return;



        setIsSaving(true);



        pendingRows.forEach((row) => {

          const { _diff, _changes, _docId, ...rest } = row;

          const resID = String(row["Reserva"]);



          // Sanitize rest

          const clean = {};

          Object.keys(rest).forEach((k) => {

            if (rest[k] !== undefined) clean[k] = rest[k];

          });



          const sameResRows = (data || []).filter(r => normalizeId(r["Reserva"]) === normalizeId(resID));
          if (!clean.DailyDistribution_JSON) {
            const foundDistRow = sameResRows.find(r => r.DailyDistribution_JSON && r.DailyDistribution_JSON !== "{}" && r.DailyDistribution_JSON !== "[]");
            if (foundDistRow) {
              clean.DailyDistribution_JSON = foundDistRow.DailyDistribution_JSON;
            }
          }
          if (!clean.RoomingList_JSON) {
            const foundRlRow = sameResRows.find(r => r.RoomingList_JSON && r.RoomingList_JSON !== "[]");
            if (foundRlRow) {
              clean.RoomingList_JSON = foundRlRow.RoomingList_JSON;
            }
          }
          let docId = row._docId;
          if (!docId) {
            const linea = String(row["_linea"] || row["precios"] || "").trim();
            if (sameResRows.length > 1 && linea) {
              docId = `${normalizeId(resID)}_${linea}`;
            } else {
              docId = normalizeId(resID);
            }
          }

          const docRef = db.collection("groups").doc(docId);

          

          let oldTrack = [];

          try { oldTrack = JSON.parse(row.tracking || "[]"); } catch(e){}

          const importLog = {

            id: Date.now(),

            date: new Date().toLocaleString("es-ES"),

            text: `Importación: Cambio autorizado desde validación.`

          };



          batch.set(

            docRef,

            {

              ...clean,

              tracking: JSON.stringify([...oldTrack, importLog]),

              _diff: firebase.firestore.FieldValue.delete(),

              _changes: firebase.firestore.FieldValue.delete(),

              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),

            },

            { merge: true },

          );



          // Limpiar doc duplicado si el _docId original difiere del ID normalizado

          if (row._docId && row._docId !== docId) {

            console.log(

              `🗑️ [acceptChanges] Eliminando doc duplicado: "${row._docId}"`,

            );

            batch.delete(db.collection("groups").doc(row._docId));

          }

        });



        // DEBUG: ver exactamente qué datos se guardan

        console.log(

          "[acceptChanges] Guardando cambios, primer row:",

          pendingRows[0]

            ? {

              id: pendingRows[0]["Reserva"],

              Entrada: pendingRows[0]["Entrada"],

              Pax: pendingRows[0]["Pax."],

              Importe: pendingRows[0]["Importe(*)"],

            }

            : null,

        );



        // Marcar IDs para que onSnapshot no los restaure

        pendingRows.forEach((r) =>

          authorizingIds.current.add(normalizeId(r["Reserva"])),

        );



        // Optimistic update

        const oldData = [...data];

        setData((prev) =>

          prev.map((r) => ({ ...r, _diff: null, _changes: null })),

        );



        batch

          .commit()

          .then(() => {

            console.log(

              `✅ Autorización guardada en Firestore para ${pendingRows.length} grupo(s)`,

            );

            // Guardar la fecha y hora de importación en configuración

                        let detectedHotel = "";
            if (pendingRows.length > 0) {
              const firstRow = pendingRows[0];
              const hVal = String(firstRow["Hotel_Asignado"] || firstRow["Hotel"] || "").toLowerCase();
              if (hVal.includes("guadiana")) {
                detectedHotel = "guadiana";
              } else if (hVal.includes("cumbria")) {
                detectedHotel = "cumbria";
              }
            }

            const updatePayload = {
              lastImportDate: Date.now()
            };
            const guadianaData = hotelSettings.guadiana || {};
            const cumbriaData = hotelSettings.cumbria || {};

            if (detectedHotel === "guadiana") {
              updatePayload["guadiana"] = {
                ...guadianaData,
                lastImportDate: Date.now()
              };
            } else if (detectedHotel === "cumbria") {
              updatePayload["cumbria"] = {
                ...cumbriaData,
                lastImportDate: Date.now()
              };
            }

            db.collection("settings")
              .doc("main")
              .set(updatePayload, { merge: true })

              .catch((err) => console.error("Error al guardar la fecha de importación:", err));



            // IMPORTANTE: mantener 6s de bloqueo para que onSnapshot no restaure datos viejos

            // Firestore puede tardar varios segundos en propagar el cambio al listener

            setTimeout(() => {

              pendingRows.forEach((r) =>

                authorizingIds.current.delete(normalizeId(r["Reserva"])),

              );

              console.log("🔓 authorizingIds liberados");

              setIsSaving(false);

            }, 6000);

          })

          .catch((err) => {

            console.error("❌ ERROR EN AUTORIZACIÓN MASIVA:", err);

            alert(

              "Error al guardar cambios en Firestore: " +

              err.message +

              "\n\nPor favor, comprueba tu conexión e intenta de nuevo.",

            );

            pendingRows.forEach((r) =>

              authorizingIds.current.delete(normalizeId(r["Reserva"])),

            );

            setData(oldData); // Restaurar en caso de error

            setIsSaving(false);

          });

      };



      const exportExcel = () => {

        let toExport = [...data];



        // Filtro por Hotel (si hay uno seleccionado)

        if (filterDirHotel) {

          toExport = toExport.filter(row => 

            normalizeHotelName(row["Hotel_Asignado"] || row["Hotel"] || "") === normalizeHotelName(filterDirHotel)

          );

        }



        // Filtro por búsqueda actual

        if (searchTerm) {

          const lowerTerm = searchTerm.toLowerCase();

          toExport = toExport.filter(row => {

            const res = (row["Reserva"] || "").toString().toLowerCase();

            const name = (row["Nombre del Grupo"] || "").toLowerCase();

            const agency = (row["Empresa/Agencia"] || "").toLowerCase();

            return res.includes(lowerTerm) || 

                   name.includes(lowerTerm) || 

                   agency.includes(lowerTerm) || 

                   normalizeId(res).includes(lowerTerm) || 

                   getBaseId(res).includes(lowerTerm);

          });

        }



        const confirmadas = [];

        const anuladas = [];



        toExport.forEach(row => {

          const st = getStatusProps(

            row["Com_Estado_Interno"] || row["Segment."],

            row["Entrada"],

            row["Estado"]

          );



          // Columnas exactas: Reserva, Nombre del Grupo, Entrada, Salida, Noches, Pax., Empresa/Age, Segment, Régimen, Importe

          const mappedRow = {

            "Reserva": row["Reserva"] || "",

            "Nombre del Grupo": row["Nombre del Grupo"] || "",

            "Entrada": formatDate(row["Entrada"]),

            "Salida": formatDate(row["Salida"]),

            "Noches": row["Noches"] || "",

            "Pax.": row["Pax."] || "",

            "Empresa/Age": row["Empresa/Agencia"] || "",

            "Segment": row["Segment."] || "",

            "Régimen": row["Régimen"] || "",

            "Importe": row["Importe(*)"] || ""

          };



          if (st.label === "DESESTIMADO") {

            anuladas.push(mappedRow);

          } else {

            confirmadas.push(mappedRow);

          }

        });



        const wb = XLSX.utils.book_new();

        const headerOrder = ["Reserva", "Nombre del Grupo", "Entrada", "Salida", "Noches", "Pax.", "Empresa/Age", "Segment", "Régimen", "Importe"];

        

        // Hoja Confirmadas

        const wsConf = XLSX.utils.json_to_sheet(confirmadas, { header: headerOrder });

        XLSX.utils.book_append_sheet(wb, wsConf, "Reservas de Grupos CONFIRMADAS");



        // Hoja Anuladas

        const wsAnul = XLSX.utils.json_to_sheet(anuladas, { header: headerOrder });

        XLSX.utils.book_append_sheet(wb, wsAnul, "Reservas de Grupos ANULADAS");



        const fileName = (filterDirHotel || "Análisis_General") + "_Grupos.xlsx";

        XLSX.writeFile(wb, fileName);

      };



      // --- Funciones de Edición ---

      const handleCellChange = (rowIndex, column, value) => {

        const row = data[rowIndex];

        const resID = String(row["Reserva"]);



        // Actualización optimista

        const newData = [...data];

        newData[rowIndex][column] = value;

        setData(newData);



        // Actualizar Firebase con merge y timestamp

        const normResID = normalizeId(resID);

        db.collection("groups")

          .doc(normResID)

          .set(

            {

              [column]: value,

              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),

            },

            { merge: true },

          )

          .catch((err) => console.error("Error editando celda:", err));

      };



      const addNewColumn = () => {

        if (!newColumnName) return;

        const newData = data.map((row) => ({ ...row, [newColumnName]: "" }));

        setData(newData);

        setColumns([...columns, newColumnName]);

        setNewColumnName("");

        setShowColumnModal(false);

      };



      // Estados para Ficha de Grupo

      const [showFichaModal, setShowFichaModal] = useState(false);

      const [selectedGroupFicha, setSelectedGroupFicha] = useState(null);

      const [isEditingGroupName, setIsEditingGroupName] = useState(false);

      const [tempGroupName, setTempGroupName] = useState("");

      const [showClientData, setShowClientData] = useState(false);

      const [tempClientData, setTempClientData] = useState({});

      const [isSaving, setIsSaving] = useState(false); // Spinner mientras acceptChanges guarda

      // Ref con la última lista de inventario guardada (para PROFORMA, evita desincronía con el estado)

      const lastRoomingListRef = useRef({ groupName: null, list: [] });



      // CRM History Panel

      const [showCrmPanel, setShowCrmPanel] = useState(false);

      const [crmNote, setCrmNote] = useState('');

      const [crmHistory, setCrmHistory] = useState([]);



      // Ocultar/mostrar la cabecera global cuando se abre/cierra la ficha
      useEffect(() => {
        const header = document.getElementById('nexus-global-header');
        if (showFichaModal) {
          document.body.classList.add('nexus-ficha-open');
          if (header) header.style.display = 'none';
        } else {
          document.body.classList.remove('nexus-ficha-open');
          if (header) header.style.display = '';
        }
        return () => {
          document.body.classList.remove('nexus-ficha-open');
          if (header) header.style.display = '';
        };
      }, [showFichaModal]);

      // Load CRM history when a group ficha is opened
      useEffect(() => {

        if (!selectedGroupFicha) { setCrmHistory([]); return; }

        const rec = selectedGroupFicha.records[0] || {};

        try {

          // Unificar: cargar desde 'tracking' como fuente principal de historial

          const hist = JSON.parse(rec['tracking'] || rec['Com_CRM_History'] || '[]');

          setCrmHistory(Array.isArray(hist) ? hist : []);

        } catch { setCrmHistory([]); }

      }, [selectedGroupFicha?.id]);



        const addCrmNote = async () => {

          if (!crmNote.trim() || !selectedGroupFicha) return;   

          const now = new Date();

          const fmtDate = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

          const newEntry = { 

            id: Date.now(),

            date: fmtDate, 

            text: `Nota: ${crmNote.trim()}` 

          };

        const updated = [newEntry, ...crmHistory];

        setCrmHistory(updated);

        setCrmNote('');

        // Persist to Firestore en el campo unificado 'tracking'

        await updateGroupMetadata(selectedGroupFicha.id, 'tracking', JSON.stringify(updated));

      };





      const [ROOM_CONFIGURATIONS, setRoomConfigurations] = useState([

        { label: "Habitación Doble (DBL)", pax: 2, placeholder: "2 Pax" },

        {

          label: "Habitación Doble Uso Individual (DUI)",

          pax: 1,

          placeholder: "1 Pax",

        },

        { label: "Habitación Triple (TPL)", pax: 3, placeholder: "3 Pax" },
        { label: "Habitación Triple Niño (TPL Niño)", pax: 3, placeholder: "3 Pax (2 Ad + 1 Ni)" },
        { label: "Hab. Triple Niño", pax: 3, placeholder: "3 Pax" },
        { label: "Triple Niño", pax: 3, placeholder: "3 Pax" },
        { label: "DOBLE + SUPLETORIA NIÑO", pax: 3, placeholder: "3 Pax" },
        { label: "Habitación Cuádruple (CUA)", pax: 4, placeholder: "4 Pax" },

        { label: "Suite (SUI)", pax: 2, placeholder: "2 Pax" },

        { label: "Suite Superior (S.SUP)", pax: 2, placeholder: "2 Pax" },

        { label: "SUI", pax: 2, placeholder: "2 Pax" },

        { label: "S.SUP", pax: 2, placeholder: "2 Pax" },

        { label: "Junior Suite (JS1)", pax: 1, placeholder: "1 Pax" },

        { label: "Junior Suite (JS2)", pax: 2, placeholder: "2 Pax" },

        { label: "Suite Superior (SS1)", pax: 1, placeholder: "1 Pax" },

        { label: "Suite Superior (SS2)", pax: 2, placeholder: "2 Pax" },

        { label: "Servicio: Almuerzo", pax: 1, isService: true },

        { label: "Servicio: Cena", pax: 1, isService: true },

        { label: "Servicio: Coffee Break", pax: 1, isService: true },

        { label: "Servicio: Alquiler Salón", pax: 0, isService: true },

      ]);



      useEffect(() => {

        const fetchCommonConfig = async () => {

          try {

            const doc = await db.collection("settings").doc("main").get();

            if (doc.exists) {

              const data = doc.data();

              if (data.common && data.common.services && data.common.services.length > 0) {

                setRoomConfigurations(data.common.services);

              }

            }

          } catch (e) {

            console.error("Error loading common services config:", e);

          }

        };

        fetchCommonConfig();

      }, []);



      // State for Room Manager Form

      const [roomManagerForm, setRoomManagerForm] = useState({

        hotel: "",

        type: "Habitación Doble (DBL)",

        dateIn: "",

        dateOut: "",

        qty: 1,

        pax: 2,

        regime: "HD",

        price: 0,

        iva: 10,

        isService: false,

      });

      const [editingId, setEditingId] = useState(null);
      const [newlyInsertedLineId, setNewlyInsertedLineId] = useState(null);



      // State for Commission Modal

      const [commissionModal, setCommissionModal] = useState({

        isOpen: false,

        itemIdx: null,

        tempCom: null,

      });



      const getPaxByRoomType = (type) => {

        const found = ROOM_CONFIGURATIONS.find((c) => c.label === type);

        if (found) return found.pax;



        const t = (type || "").toUpperCase();

        if (t.includes("DUI") || t.includes("JS1") || t.includes("SS1") ||
            t.includes("INDIV") || t.includes("SINGLE") || t.includes("SGL"))
          return 1;

        if (t.includes("TPL") || t.includes("TRIPLE")) return 3;

        if (t.includes("CUA") || t.includes("CUAD")) return 4;

        if (t.includes("JS2") || t.includes("SS2") || t.includes("DBL") || t.includes("DOBLE"))
          return 2;

        return 2; // Default

      };



      const calculateDefaultCommission = (
        price,
        regime,
        qty,
        nights,
        type,
        hotelName,
        customPax,
      ) => {
        const p = parseFloat(price) || 0;
        const q = parseInt(qty) || 1;
        const n = parseInt(nights) || 1;
        const r = (regime || "").toUpperCase().split(" ")[0];
        const paxPerRoom = customPax !== undefined && customPax !== null && !isNaN(parseInt(customPax))
          ? parseInt(customPax)
          : getPaxByRoomType(type);

        let porcentaje = 0; // Default commission 0% per request

        // Obtener precios de manutención establecidos para el hotel desde boardPricingConfig
        const hotel = hotelName || (selectedGroupFicha ? (selectedGroupFicha.hotel || selectedGroupFicha.records?.[0]?.["Hotel_Asignado"] || selectedGroupFicha.records?.[0]?.["Hotel"]) : "") || "Sercotel Guadiana";
        const pricing = window.BoardPricingService
          ? window.BoardPricingService.getPricingForHotelAndDate(hotel, null, boardPricingConfig)
          : (boardPricingConfig?.[hotel] || boardPricingConfig?.default || { breakfast: 6.0, meal: 16.0 });

        const bCost = typeof pricing.breakfast === "number" ? pricing.breakfast : 6.0;
        const mCost = typeof pricing.meal === "number" ? pricing.meal : 16.0;

        let desPerPax = 0;
        let almPerPax = 0;
        let cenPerPax = 0;

        if (p > 0) {
          if (r === "AD" || r === "HD" || r === "BB") {
            desPerPax = bCost;
          } else if (r === "MP" || r === "HB") {
            desPerPax = bCost;
            almPerPax = mCost;
          } else if (r === "PC" || r === "FB" || r === "TI") {
            desPerPax = bCost;
            almPerPax = mCost;
            cenPerPax = mCost;
          }
        }

        // Totales de manutención en la habitación según las personas por habitación
        const totalDes = parseFloat((desPerPax * paxPerRoom).toFixed(2));
        const totalAlm = parseFloat((almPerPax * paxPerRoom).toFixed(2));
        const totalCen = parseFloat((cenPerPax * paxPerRoom).toFixed(2));
        const mealsTotal = totalDes + totalAlm + totalCen;
        const totalAloj = Math.max(0, parseFloat((p - mealsTotal).toFixed(2)));

        // Desglose unitario inicial
        let desglose = {
          Alojamiento: { valor: totalAloj, comisionable: true },
          Desayuno: { valor: totalDes, comisionable: false },
          Almuerzo: { valor: totalAlm, comisionable: false },
          Cena: { valor: totalCen, comisionable: false },
        };

        const baseUnitaria = Object.entries(desglose).reduce(
          (acc, [k, c]) => acc + (c.comisionable ? c.valor : 0),
          0,
        );

        const comUnit = Math.round((((baseUnitaria * porcentaje) / 100) + 1e-9) * 100) / 100;
        return {
          porcentaje,
          modo: "manual",
          desglose,
          base_unitaria: baseUnitaria,
          comision_unitaria: comUnit,
          total_comision: Math.round((comUnit * q * n + 1e-9) * 100) / 100,
        };
      };



      const openFicha = (groupOrRow) => {

        let group = groupOrRow;

        let hotelPrincipal = "Sercotel Guadiana";



        // Handle case where we receive a flat row (e.g. from Gantt) instead of a grouped object

        if (!group.records) {

          const resId = normalizeId(group["Reserva"]);

          const found = groupedData.find((g) => normalizeId(g.id) === resId);

          if (found) {

            group = found;

          } else {

            // Fallback wrapper if not found in groupedData (should be rare)

            group = {

              ...groupOrRow,

              name: groupOrRow["Nombre del Grupo"] || groupOrRow.name || "Grupo",

              records: [groupOrRow],

            };

          }

        }



        // Initialize Room Manager Form with group dates

        if (group.records && group.records.length > 0) {

          const rec = group.records[0];

          // Normalizar el hotel para que coincida con los valores del select (Cumbria / Guadiana)

          hotelPrincipal = normalizeHotelNameLocal(

            rec["Hotel_Asignado"] || rec["Hotel"],

            "Sercotel Guadiana"

          );



          setRoomManagerForm((prev) => ({

            ...prev,

            hotel: hotelPrincipal,

            dateIn: rec["Entrada"] || "",

            dateOut: rec["Salida"] || "",

            price: 0, // Reset price

          }));

        }



        // Auto-generate Rooming List if empty

        if (group.records && group.records.length > 0) {

          const firstRecord = group.records[0];

          let currentList = [];

          try {

            currentList = parseRoomingListSafe(firstRecord["RoomingList_JSON"], "clean-hotel-names");

          } catch (e) {

            currentList = [];

          }

          if (Array.isArray(currentList) && currentList.length > 0) {
            let changed = false;
            const cleanList = currentList.map(item => {
              const norm = normalizeHotelNameLocal(item.hotel, hotelPrincipal);
              if (item.hotel !== norm) changed = true;
              return { ...item, hotel: norm };
            });
            if (changed) {
              currentList = cleanList;
              firstRecord["RoomingList_JSON"] = JSON.stringify(cleanList);
            }
          }

          let isOnlyFallback = false;
          if (Array.isArray(currentList) && currentList.length > 0) {
            isOnlyFallback = currentList.every(item => (item.type || '').trim().toLowerCase() === "habitación (auto)");
            if (currentList.length > 200) {
              isOnlyFallback = true;
            }
          }

          if (currentList.length === 0 || isOnlyFallback) {

            const newAutoList = [];



            if (group.dailyConfig && Object.keys(group.dailyConfig).length > 0) {
              const dates = Object.keys(group.dailyConfig).sort();
              const hotelName = normalizeHotelNameLocal(
                group.hotel || group.records[0]?.["Hotel_Asignado"] || group.records[0]?.["Hotel"],
                "Sercotel Guadiana"
              );
              
              const startDate = dates[0];
              const endDate = dates[dates.length - 1];
              const dStart = new Date(startDate);
              const dEnd = new Date(endDate);
              dEnd.setDate(dEnd.getDate() + 1);
              const nextDateStr = !isNaN(dEnd.getTime()) ? dEnd.toISOString().split("T")[0] : startDate;
              const totalDays = dates.length;

              const config = group.dailyConfig[startDate];
              const normalizedRooms = {};

              Object.entries(group.roomCounts || {}).forEach(([type, count]) => {
                if(count > 0) normalizedRooms[type.toLowerCase()] = { type, count: Number(count) };
              });

              if (config && config.counts) {
                Object.entries(config.counts).forEach(([type, count]) => {
                  if (count > 0 && !normalizedRooms[type.toLowerCase()]) {
                    normalizedRooms[type.toLowerCase()] = { type, count: Number(count) };
                  }
                });
              }

              Object.values(normalizedRooms).forEach(v => {
                let count = v.count;
                if (config && config.counts) {
                   const overrideKey = Object.keys(config.counts).find(k => k.toLowerCase() === v.type.toLowerCase());
                   if (overrideKey && config.counts[overrideKey] !== '' && config.counts[overrideKey] !== undefined) {
                      count = Number(config.counts[overrideKey]);
                   }
                }

                if (count > 0) {
                   let price = 0;
                   let regime = (config && config.board) ? config.board : (group["Régimen"] || "AD");
                   let gratuities = 0;
                   let discount = 0;

                   if (config && config.prices) {
                      const pk = Object.keys(config.prices).find(k => k.trim().toLowerCase() === v.type.trim().toLowerCase());
                      price = pk ? parseFloat(config.prices[pk] || 0) : 0;
                      const discKey = config.discounts ? Object.keys(config.discounts).find(k => k.trim().toLowerCase() === v.type.trim().toLowerCase()) : null;
                      discount = discKey ? parseFloat(config.discounts[discKey] || 0) : 0;
                      const gratKey = config.gratuities ? Object.keys(config.gratuities).find(k => k.trim().toLowerCase() === v.type.trim().toLowerCase()) : null;
                      gratuities = gratKey ? parseInt(config.gratuities[gratKey] || 0) : 0;
                   } else if (config) {
                      const tk = Object.keys(config).find(k => k.trim().toLowerCase() === v.type.trim().toLowerCase());
                      if (tk && config[tk]) {
                        price = parseFloat(config[tk].price || 0);
                        regime = config[tk].board || regime;
                        gratuities = parseInt(config[tk].gratuities || 0);
                        discount = parseFloat(config[tk].discount || 0);
                      }
                   }

                   // Fallback: si el precio sigue siendo 0, intentar obtenerlo desde ratesOnlyGrid
                   // Esto cubre presupuestos confirmados donde dailyConfig.prices no fue sincronizado
                   if (price === 0 && group.ratesOnlyGrid) {
                     const boardKey = regime.split(' ')[0];
                     const grid = group.ratesOnlyGrid;
                     if (grid[boardKey]) {
                       const gridPk = Object.keys(grid[boardKey]).find(k => k.trim().toLowerCase() === v.type.trim().toLowerCase());
                       if (gridPk) price = parseFloat(grid[boardKey][gridPk] || 0);
                     }
                     if (price === 0) {
                       const fallbackBoard = (group["Régimen"] || "AD").split(' ')[0];
                       if (grid[fallbackBoard]) {
                         const gridPk2 = Object.keys(grid[fallbackBoard]).find(k => k.trim().toLowerCase() === v.type.trim().toLowerCase());
                         if (gridPk2) price = parseFloat(grid[fallbackBoard][gridPk2] || 0);
                       }
                     }
                   }
                   

                   const paxPerRoom = typeof getPaxByRoomType === 'function' ? getPaxByRoomType(v.type) : (v.type.toLowerCase().includes('ind') || v.type.toLowerCase().includes('dui') ? 1 : (v.type.toLowerCase().includes('tri') ? 3 : 2));
                   
                   const payingRooms = Math.max(0, count - gratuities);
                   if (payingRooms > 0) {
                     newAutoList.push({
                         id: Date.now() + Math.random(),
                         hotel: hotelName,
                         type: v.type.toUpperCase(),
                         dateIn: startDate,
                         dateOut: nextDateStr,
                         qty: payingRooms,
                         regime: regime.split(' ')[0],
                         price: price,
                         pax: paxPerRoom,
                         nights: totalDays,
                         total: (payingRooms * price * totalDays * (1 - discount / 100)).toFixed(2),
                         comision: calculateDefaultCommission(price, regime.split(' ')[0], payingRooms, totalDays, v.type),
                         isService: false
                     });
                   }
                   if (gratuities > 0) {
                     newAutoList.push({
                         id: Date.now() + Math.random(),
                         hotel: hotelName,
                         type: v.type.toUpperCase() + " (GRATUIDAD)",
                         dateIn: startDate,
                         dateOut: nextDateStr,
                         qty: gratuities,
                         regime: regime.split(' ')[0],
                         price: 0,
                         pax: paxPerRoom,
                         nights: totalDays,
                         total: "0.00",
                         comision: calculateDefaultCommission(0, regime.split(' ')[0], gratuities, totalDays, v.type),
                         isService: false
                     });
                   }
                }
              });

              if (group.extraCharges && group.extraCharges.length > 0) {
                const hotelName = normalizeHotelNameLocal(group.hotel || group.records[0]?.["Hotel_Asignado"] || group.records[0]?.["Hotel"] || "Sercotel Guadiana");
                
                // Filtramos cargos extra que sean duplicados del régimen
                const regimesToFilter = ["PC", "MP", "AD", "HB", "FB", "SA", "RO", "BB", "HD", "TI"];
                
                group.extraCharges.forEach(ext => {
                   const conceptNorm = (ext.concept || "").trim().toUpperCase();
                   // Si el concepto es exactamente un régimen, lo saltamos (ya está en la línea de la habitación)
                   if (regimesToFilter.includes(conceptNorm)) return;

                   const isGlobal = !ext.date || ext.date === 'Todas';
                   const d = isGlobal ? (dates[0] || "") : ext.date;
                   const u = ext.units !== undefined ? ext.units : 1;
                   const up = ext.unitPrice !== undefined ? ext.unitPrice : parseFloat(ext.price || 0);
                   let qty = u;
                   let nights = isGlobal ? Math.max(1, dates.length) : 1;
                   
                   newAutoList.push({
                     id: Date.now() + Math.random(),
                     hotel: hotelName,
                     type: (ext.concept || "Cargo Extra").toUpperCase(),
                     dateIn: d,
                     dateOut: d,
                     qty: qty,
                     regime: "-",
                     price: up,
                     pax: 0, // for extra, pax isn't strictly meaningful in the table usually
                     nights: nights,
                     total: (qty * up * nights).toFixed(2),
                     isService: true
                   });
                });
              }
            } else {
              // Iterate through all records (multi-hotel) - Fallback
              const uniqueSegments = new Map();

              group.records.forEach((r) => {
                const rowStatus = (r["Estado"] || "").toLowerCase();
                if (rowStatus.includes("anul") || rowStatus.includes("can"))
                  return;

                const h = r["Hotel_Asignado"] || r["Hotel"] || group.hotel || "H. Pendiente";
                const dIn = r["Entrada"];
                const dOut = r["Salida"];
                const key = `${h}|${dIn}|${dOut}`;

                const imp = parseNum(r["Importe(*)"]);
                const pax = parseInt(r["Pax."] || "0");

                if (!uniqueSegments.has(key)) {
                  uniqueSegments.set(key, {
                    hotel: h,
                    dateIn: dIn,
                    dateOut: dOut,
                    pax: pax,
                    price: imp,
                    regime: r["Régimen"] || "AD",
                  });
                } else {
                  const existing = uniqueSegments.get(key);
                  existing.pax += pax;
                  existing.price += imp;
                  if (!existing.regime || existing.regime === "AD") {
                    existing.regime = r["Régimen"] || existing.regime;
                  }
                }
              });

              // Comprobar si hay distribución diaria registrada para esta reserva
              const resNorm = normalizeId(group.id || group.records?.[0]?.["Reserva"]);
              const rawDist = group.records?.[0]?.["DailyDistribution_JSON"] || 
                              group.dailyDistribution || 
                              (typeof savedDistributionsByReserva !== "undefined" && (savedDistributionsByReserva[resNorm] || savedDistributionsByReserva[group.id]));
              let distMap = null;
              if (rawDist) {
                try {
                  distMap = typeof rawDist === "string" ? JSON.parse(rawDist) : rawDist;
                } catch(e) { distMap = null; }
              }

              let foundDistribution = null;
              if (distMap && typeof distMap === "object") {
                const dateKeys = Object.keys(distMap).sort();
                for (const dk of dateKeys) {
                  const entry = distMap[dk];
                  if (entry && (entry.totalHabitaciones > 0 || (entry.individuales || 0) + (entry.dobles || 0) + (entry.triples || 0) + (entry.cuadruples || 0) > 0)) {
                    foundDistribution = entry;
                    break;
                  }
                }
              }

              uniqueSegments.forEach((seg) => {
                if (seg.dateIn && seg.dateOut) {
                  const parseDate = (dStr) => {
                    if (!dStr) return null;
                    const s = dStr.toString();
                    if (/^\d{5}$/.test(s)) {
                      const serial = parseInt(s, 10);
                      if (serial > 25569) {
                        return new Date(Math.round((serial - 25569) * 86400 * 1000));
                      }
                    }
                    if (s.includes("-") && s.split("-")[0].length <= 2) {
                      const [d, m, y] = s.split("-");
                      return new Date(`${y}-${m}-${d}T12:00:00Z`);
                    }
                    if (s.includes("/") && s.split("/")[0].length <= 2) {
                      const [d, m, y] = s.split("/");
                      return new Date(`${y}-${m}-${d}T12:00:00Z`);
                    }
                    if (s.includes("-") && s.split("-")[0].length === 4) {
                      return new Date(`${s}T12:00:00Z`);
                    }
                    return new Date(s);
                  };

                  let start = parseDate(seg.dateIn);
                  let end = parseDate(seg.dateOut);

                  if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
                    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                    const segHotel = normalizeHotelNameLocal(seg.hotel, "Sercotel Guadiana");
                    const dateInIso = start.toISOString().split("T")[0];
                    const dateOutIso = end.toISOString().split("T")[0];

                    if (foundDistribution) {
                      // Usar la distribución real validada (ej. 5 Ind, 17 Dbl, 1 Tpl = 23 Hab)
                      const ind = parseInt(foundDistribution.individuales || 0, 10);
                      const dbl = parseInt(foundDistribution.dobles || 0, 10);
                      const tpl = parseInt(foundDistribution.triples || 0, 10);
                      const cua = parseInt(foundDistribution.cuadruples || 0, 10);
                      const totalDistPax = (ind * 1) + (dbl * 2) + (tpl * 3) + (cua * 4);
                      const effPax = totalDistPax > 0 ? totalDistPax : (seg.pax || 1);
                      const dailyPerPax = (totalDays > 0 && effPax > 0) ? (seg.price / totalDays / effPax) : 0;

                      const categories = [
                        { type: "INDIVIDUAL", count: ind, paxPerRoom: 1 },
                        { type: "DOBLE", count: dbl, paxPerRoom: 2 },
                        { type: "TRIPLE", count: tpl, paxPerRoom: 3 },
                        { type: "CUÁDRUPLE", count: cua, paxPerRoom: 4 }
                      ].filter(c => c.count > 0);

                      let runningTotal = 0;
                      for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
                        let curIn = dateInIso;
                        let curOut = dateOutIso;
                        try {
                          const d = new Date(start);
                          d.setDate(start.getDate() + dayIdx);
                          curIn = d.toISOString().split("T")[0];
                          d.setDate(d.getDate() + 1);
                          curOut = d.toISOString().split("T")[0];
                        } catch (e) {}

                        categories.forEach((cat) => {
                          const catPricePerRoom = Math.round(dailyPerPax * cat.paxPerRoom * 100) / 100;
                          const catTotal = Math.round(cat.count * catPricePerRoom * 100) / 100;

                          newAutoList.push({
                            id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}_d${dayIdx}`,
                            hotel: segHotel,
                            type: cat.type,
                            dateIn: curIn,
                            dateOut: curOut,
                            qty: cat.count,
                            pax: cat.paxPerRoom,
                            regime: seg.regime || "AD",
                            price: catPricePerRoom.toFixed(2),
                            nights: 1,
                            total: catTotal.toFixed(2),
                            isService: false
                          });
                        });
                      }
                    } else {
                      // Fallback si no hay distribución configurada
                      const dailyPrice = totalDays > 0 ? seg.price / totalDays : 0;
                      const qty = Math.ceil(seg.pax / 2) || 1;

                      newAutoList.push({
                        id: Date.now() + Math.random(),
                        hotel: segHotel,
                        type: "Habitación (Auto)",
                        dateIn: dateInIso,
                        dateOut: dateOutIso,
                        qty: qty,
                        pax: 2,
                        regime: seg.regime || "AD",
                        price: (dailyPrice / qty).toFixed(2),
                        nights: totalDays,
                        total: seg.price.toFixed(2),
                        isService: false
                      });
                    }
                  }
                }
              });
            }

            if (newAutoList.length > 0) {
              newAutoList.sort((a, b) => compareRoomItemsByDateAndType(a, b));
              const resNormKey = normalizeId(group.id || group.records?.[0]?.["Reserva"]);
              const jsonStr = JSON.stringify(newAutoList);
              if (group.records) {
                group.records.forEach(r => {
                  r["RoomingList_JSON"] = jsonStr;
                });
              }
              // Persistir en segundo plano a Firestore para mantenerlo sincronizado
              if (resNormKey && (!firstRecord["RoomingList_JSON"] || firstRecord["RoomingList_JSON"] === "[]" || isOnlyFallback)) {
                updateGroupMetadata(resNormKey, { RoomingList_JSON: jsonStr }).catch(console.error);
              }
            }
          }
        }

        // Sincronizar ref de inventario para PROFORMA (al abrir ficha)
        try {
          const rec = group.records && group.records[0];
          if (rec) {
            const list = parseRoomingListSafe(rec["RoomingList_JSON"], "lastRoomingListRef");
            if (Array.isArray(list) && list.length > 0)
              lastRoomingListRef.current = { groupName: group.name, list };
          }
        } catch (e) { }

        // Asegurar que elementos multi-noche se desglosen por días
        try {
          const rec0 = group.records && group.records[0];
          if (rec0 && rec0["RoomingList_JSON"]) {
            const parsedRL = parseRoomingListSafe(rec0["RoomingList_JSON"], "openFicha-expand");
            const hasMulti = parsedRL.some(i => !i.isService && (parseInt(i.nights, 10) || 1) > 1);
            if (hasMulti) {
              const expandedRL = expandRoomListByDays(parsedRL);
              expandedRL.sort((a, b) => compareRoomItemsByDateAndType(a, b));
              const jsonStr = JSON.stringify(expandedRL);
              group.records.forEach(r => {
                r["RoomingList_JSON"] = jsonStr;
              });
              updateGroupMetadata(group.id, { RoomingList_JSON: jsonStr }).catch(console.error);
            }
          }
        } catch (e) {}

        setSelectedGroupFicha(group);
        setCollapsedFichaDays(new Set());
        setShowFichaModal(true);
        setIsEditingGroupName(false);
        setTempGroupName(group.name || "");
      };

      const saveGroupName = async () => {
        if (!selectedGroupFicha) return;
        const newName = tempGroupName.trim();
        if (!newName) {
          alert("⚠️ El nombre del grupo no puede estar vacío.");
          return;
        }

        try {
          setIsSaving(true);
          await updateGroupMetadata(selectedGroupFicha.id, { "Nombre del Grupo": newName });
          setIsEditingGroupName(false);
        } catch (error) {
          console.error("Error saving group name:", error);
          alert("❌ Error al guardar el nombre del grupo.");
        } finally {
          setIsSaving(false);
        }
      };

      const handleMergeGroup = async (sourceGroup) => {
        const targetReserva = prompt(
          `Fusionar "${sourceGroup.name}" con otra reserva existente.\n\nIntroduce el ID de Reserva PMS destino (ej: 205249):`,
          "",
        );
        if (!targetReserva || targetReserva.trim() === "") return;

        const destId = normalizeId(targetReserva);
        const sourceRecords = sourceGroup.records || [];
        const sourceIds = sourceRecords
          .map((r) => normalizeId(r["Reserva"]))
          .filter((id) => id !== destId);

        if (sourceIds.length === 0) {
          alert("No hay registros que mover o ya tienen ese ID.");
          return;
        }

        if (
          !confirm(
            `¿Estás seguro de fusionar todos los datos de "${sourceGroup.name}" en la reserva ${targetReserva}?\n\nLos registros manuales o de presupuesto se vincularán al nuevo ID y se eliminarán los documentos antiguos.`,
          )
        )
          return;

        try {
          const batch = db.batch();

          // 1. Buscar si la reserva destino ya existe en Firestore para heredar su Nombre del Grupo si es necesario
          const destDoc = await db.collection("groups").doc(destId).get();
          let targetName = sourceGroup.name;
          if (destDoc.exists) {
            targetName = destDoc.data()["Nombre del Grupo"] || targetName;
          }

          // 2. Mover registros
          for (const row of sourceRecords) {
            const oldId = normalizeId(row["Reserva"]);
            const newId = destId;

            const oldRef = db.collection("groups").doc(oldId);
            const newRef = db.collection("groups").doc(newId);

            const payload = {
              ...row,
              Reserva: targetReserva,
              "Nombre del Grupo": targetName,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            batch.set(newRef, payload, { merge: true });
            if (oldId !== newId) {
              batch.delete(oldRef);
            }
          }

          await batch.commit();
          alert(
            "✅ Fusión completada con éxito. Pulsa Aceptar para recargar.",
          );
          window.location.reload();
        } catch (err) {
          console.error("Error en fusión:", err);
          alert("❌ Error al fusionar: " + err.message);
        }
      };

      const openClientDataModal = () => {
        if (!selectedGroupFicha || !selectedGroupFicha.records) return;
        const baseRecord = selectedGroupFicha.records[0] || {};
        const fields = [
          "Fiscal_RazonSocial",
          "Fiscal_CIF",
          "Persona_Contacto",
          "Email",
          "Telefono",
          "Fiscal_Direccion",
          "Fiscal_CP",
          "Fiscal_Poblacion",
          "Fiscal_Provincia",
          "Fiscal_Pais",
          "Observaciones",
        ];
        const initialData = {};
        fields.forEach((f) => {
          initialData[f] = baseRecord[f] || "";
        });
        setTempClientData(initialData);
        setShowClientData(true);
      };

      const updateGroupMetadata = async (
        resId,
        fieldOrUpdates,
        valueIfSingle = null,
        hotelFilterArg = null,
      ) => {
        let updates =
          typeof fieldOrUpdates === "object"
            ? { ...fieldOrUpdates }
            : { [fieldOrUpdates]: valueIfSingle };
        const normTargetId = normalizeId(resId);
        const currentGroupRows = (data || []).filter(
          (r) =>
            normalizeId(r.Reserva) === normTargetId &&
            (!hotelFilterArg ||
              (r["Hotel_Asignado"] || r["Hotel"]) === hotelFilterArg),
        );

        if (updates["Com_Estado_Interno"] !== undefined) {
          const newStatus = updates["Com_Estado_Interno"];
          const currentStatus = currentGroupRows[0]?.Com_Estado_Interno || currentGroupRows[0]?.Estado || "";
          
          if (newStatus !== currentStatus) {
            try {
              if (updateGroupMetadata.running) return;
              updateGroupMetadata.running = true;

              const res = await window.confirmBudget({
                budgetId: normTargetId,
                requestedStatus: newStatus,
                confirmationSource: "Ficha Grupo",
                db: db,
                confirmedBy: "Usuario"
              });

              if (res && res.split) {
                alert(`✅ Serie confirmada y desglosada en reservas individuales: ${res.childIds.join(', ')}`);
                setShowFichaModal(false);
              } else {
                alert(`✅ Estado actualizado a ${newStatus}.`);
              }
              return;
            } catch (err) {
              console.error("Error confirmBudget in updateGroupMetadata:", err);
              alert("Error: " + err.message);
              return;
            } finally {
              updateGroupMetadata.running = false;
            }
          }
        }

        // --- VALIDACIÓN HOTEL ---
        const hVal = updates["Hotel_Asignado"] !== undefined ? updates["Hotel_Asignado"] : updates["Hotel"];
        if (hVal !== undefined) {
          const normH = String(hVal).toLowerCase();
          if (!normH || normH.includes("pend") || normH.trim() === "") {
            alert("⚠️ Error: No se puede asignar un hotel 'PENDIENTE' o vacío.");
            return;
          }
          // Centralized Normalization
          const normNewHotel = normalizeHotelNameLocal(hVal, "Sercotel Guadiana");
          if (updates["Hotel_Asignado"] !== undefined) updates["Hotel_Asignado"] = normNewHotel;
          if (updates["Hotel"] !== undefined) updates["Hotel"] = normNewHotel;

          // Detect change & Sync RoomingList_JSON
          const firstRow = currentGroupRows[0];
          if (firstRow) {
            const currentHotelRaw = firstRow["Hotel_Asignado"] || firstRow["Hotel"] || "";
            const normCurrentHotel = normalizeHotelNameLocal(currentHotelRaw, "Sercotel Guadiana");
            if (normNewHotel !== normCurrentHotel) {
              // Main hotel changed! Update all RoomingList items to canonical name
              try {
                const rl = parseRoomingListSafe(firstRow.RoomingList_JSON, "metadata-sync");
                if (Array.isArray(rl)) {
                  const updatedRl = rl.map(item => ({
                    ...item,
                    hotel: normNewHotel
                  }));
                  updates["RoomingList_JSON"] = JSON.stringify(updatedRl);
                }
              } catch(e) {
                console.error("Error syncing RoomingList_JSON in updateGroupMetadata:", e);
              }
            }
          }
        }

        // Si el usuario cambia a CANCELADO desde el dropdown, sincronizar también el campo Estado
        if (
          updates["Com_Estado_Interno"] === "CANCELADO" &&
          !updates["Estado"]
        ) {
          updates["Estado"] = "ANULADA";
        }

        if (currentGroupRows.length === 0) return;

        // --- SYNC PAYMENT PLAN LOGIC (Apply to all affected rows) ---
        if (updates["Com_Pagado"] !== undefined) {
          try {
            const firstRow = currentGroupRows[0];
            const manualPaid = parseNum(updates["Com_Pagado"]);
            
            // Source of Truth: Net Revenue (Gross - Commission)
            const totalRevenue = parseNum(firstRow["Importe(*)"]);
            let totalCommission = 0;
            try {
              const rl = parseRoomingListSafe(firstRow.RoomingList_JSON, "metadata-sync");
              totalCommission = rl.reduce((acc, i) => acc + (parseFloat(i.comision?.total_comision) || 0), 0);
            } catch(e) {}
            
            const netRevenue = Math.max(0, totalRevenue - totalCommission);

            let currentPlan = [];
            try {
              currentPlan = JSON.parse(firstRow["PaymentPlan_JSON"] || "[]");
            } catch (e) {
              currentPlan = [];
            }

            // Remove old manual entries to avoid duplicates
            let filteredPlan = currentPlan.filter(
              (p) =>
                !p.id.toString().startsWith("manual-") &&
                p.label !== "Pago a Cuenta",
            );

            const newPlan = [];
            if (manualPaid > 0) {
              newPlan.push({
                id: "manual-" + Date.now(),
                label: "Pago a Cuenta",
                percent: ((manualPaid / (netRevenue || 1)) * 100).toFixed(1),
                amount: manualPaid.toFixed(2),
                releaseDays: 0,
                date: new Date().toISOString().split("T")[0],
                status: "Cobrado",
              });
            }

            // Adjust remaining segments
            let remainingToSubtract = manualPaid;
            filteredPlan.forEach((p) => {
              let amt = parseNum(p.amount);
              if (remainingToSubtract > 0) {
                if (remainingToSubtract >= amt) {
                  remainingToSubtract -= amt;
                  return;
                } else {
                  amt -= remainingToSubtract;
                  remainingToSubtract = 0;
                }
              }
              if (amt > 0.01) {
                newPlan.push({
                  ...p,
                  amount: amt.toFixed(2),
                  percent: ((amt / (netRevenue || 1)) * 100).toFixed(1),
                });
              }
            });
            updates["PaymentPlan_JSON"] = JSON.stringify(newPlan);

          } catch (err) {

            console.error(

              "Error syncing PaymentPlan on Com_Pagado update",

              err,

            );

          }

        }

        // Sincronizar automáticamente DailyDistribution_JSON cuando se actualiza RoomingList_JSON
        if (updates.RoomingList_JSON) {
          try {
            const parsedRL = parseRoomingListSafe(updates.RoomingList_JSON, "metadata-rooming-sync");
            if (Array.isArray(parsedRL)) {
              const firstRow = currentGroupRows[0] || {};
              const currentDailyDist = updates.DailyDistribution_JSON 
                ? (typeof updates.DailyDistribution_JSON === "string" ? JSON.parse(updates.DailyDistribution_JSON) : updates.DailyDistribution_JSON)
                : (firstRow.DailyDistribution_JSON 
                    ? (typeof firstRow.DailyDistribution_JSON === "string" ? JSON.parse(firstRow.DailyDistribution_JSON) : firstRow.DailyDistribution_JSON)
                    : {});
              const hotelTarget = updates.Hotel_Asignado || updates.Hotel || firstRow.Hotel_Asignado || firstRow.Hotel || "";
              const syncedDist = buildDailyDistributionFromRoomingList(parsedRL, currentDailyDist, hotelTarget);
              updates.DailyDistribution_JSON = JSON.stringify(syncedDist);
            }
          } catch (syncErr) {
            console.error("Error auto-syncing DailyDistribution_JSON in updateGroupMetadata:", syncErr);
          }
        }

        // 1. Optimistic UI Update
        setData((prevData) => {

          return prevData.map((row) => {

            const matchesReserva = normalizeId(row.Reserva) === normTargetId;

            const matchesHotel =

              !hotelFilterArg ||

              (row["Hotel_Asignado"] || row["Hotel"]) === hotelFilterArg;

            if (matchesReserva && matchesHotel) {

              return { ...row, ...updates };

            }

            return row;

          });

        });

        // 2. Update selectedGroupFicha if it matches

        setSelectedGroupFicha((prev) => {

          if (!prev || normalizeId(prev.id) !== normTargetId) return prev;

          const updatedRecords = prev.records.map((r) => {

            const matchesHotel =

              !hotelFilterArg ||

              (r["Hotel_Asignado"] || r["Hotel"]) === hotelFilterArg;

            if (matchesHotel) {

              return { ...r, ...updates };

            }

            return r;

          });

          // Recalcular totales para la ficha (Pax e Importe)
          // Usa calculateMaxDailyOccupancy (pico diario) en lugar de sumar
          // directamente el campo "Pax." del registro, que puede contener
          // personas-noche si fue escrito erróneamente.
          let newTotalPax = 0;
          if (updatedRecords[0] && updatedRecords[0].RoomingList_JSON) {
            try {
              const rl = parseRoomingListSafe(updatedRecords[0].RoomingList_JSON, "recalculate-totals");
              newTotalPax = calculateMaxDailyOccupancy(rl);
            } catch (e) {}
          }
          // Fallback: si no hay RoomingList_JSON, usa el campo almacenado
          if (!newTotalPax) {
            newTotalPax = updatedRecords.reduce(
              (sum, r) => sum + parseInt(r["Pax."] || 0),
              0,
            );
          }

          const newTotalRevenue = updatedRecords.reduce(

            (sum, r) => sum + parseNum(r["Importe(*)"]),

            0,

          );

          // Recalcular total de habitaciones desde RoomingList_JSON

          let newTotalRooms = 0;

          if (updatedRecords[0] && updatedRecords[0].RoomingList_JSON) {

            try {

              const rl = parseRoomingListSafe(updatedRecords[0].RoomingList_JSON, "recalculate-totals");

              newTotalRooms = calculateMaxDailyRooms(rl);

            } catch (e) { }

          }

          return {

            ...prev,

            records: updatedRecords,

            totalPax: newTotalPax,

            totalRooms: newTotalRooms,

            totalRevenue: newTotalRevenue,

            // Sincronizar hotel del grupo si se cambió

            hotel:

              updates["Hotel_Asignado"] || updates["Hotel"] || prev.hotel,

            // Sincronizar nombre del grupo si se cambió

            name:

              updates["Nombre del Grupo"] || prev.name,

          };

        });

        // Sincronizar Hotel de Destino en el Room Manager si se cambia el Hotel Principal

        if (updates["Hotel_Asignado"]) {

          let hSync = updates["Hotel_Asignado"];

          if (hSync.toLowerCase().includes("cumbria"))

            hSync = "Cumbria Spa&Hotel";

          else if (hSync.toLowerCase().includes("guadiana"))

            hSync = "Sercotel Guadiana";

          setRoomManagerForm((prev) => ({ ...prev, hotel: hSync }));

        }

        // 3. Persist to Firestore (usa currentGroupRows capturados antes del update optimista)

        try {

          const batch = db.batch();
          const targetNormId = normalizeId(resId);
          const docIdsToUpdate = new Set();
          if (targetNormId) docIdsToUpdate.add(targetNormId);

          currentGroupRows.forEach((row) => {
            if (row._docId) docIdsToUpdate.add(row._docId);
            const rNorm = normalizeId(row.Reserva);
            if (rNorm) docIdsToUpdate.add(rNorm);
          });

          docIdsToUpdate.forEach((docId) => {
            const docRef = db.collection("groups").doc(docId);
            const payload = {
              ...updates,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            if (!updates.tracking && !updates.RoomingList_JSON && !updates.PaymentPlan_JSON && !updates.DailyDistribution_JSON && !updates.updatedAt) {
              const sampleRow = currentGroupRows[0] || {};
              const changesText = Object.keys(updates)
                .map(k => `${k}: ${sampleRow[k] || 'vacio'} -> ${updates[k]}`)
                .join(" | ");

              const now_str = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0') + ' ' + String(new Date().getHours()).padStart(2, '0') + ':' + String(new Date().getMinutes()).padStart(2, '0');
              const logEntry = {
                id: Date.now(),
                date: now_str,
                text: `Modificación field: ${changesText}`
              };

              let oldTrack = [];
              try { oldTrack = JSON.parse(sampleRow.tracking || "[]"); } catch(e){}
              payload.tracking = JSON.stringify([...oldTrack, logEntry]);
            }

            batch.set(docRef, payload, { merge: true });
          });

          await batch.commit();

        } catch (err) {

          console.error("❌ Error updating metadata:", err);

        }

      };

      // --- Segment Helpers & Handlers ---
      const DEFAULT_SEGMENTS = [
        "GRUPO TANTEO",
        "GRUPOS",
        "CORPORATIVO LINEAL",
        "DIRECTO OFFLINE",
        "EVENTOS / BANQUETES",
        "DEPORTIVO",
        "CIRCUITO / TOUR OPERADOR",
        "INCENTIVOS / MICE",
        "BODAS",
        "EMPRESA",
      ];

      const availableSegments = useMemo(() => {
        const segSet = new Set(DEFAULT_SEGMENTS);
        (data || []).forEach((r) => {
          const s = (r["Segment."] || "").toString().trim().toUpperCase();
          if (s && s !== "-" && s !== "SIN SEGMENTO") {
            segSet.add(s);
          }
        });
        if (selectedGroupFicha?.records?.[0]?.["Segment."]) {
          const current = selectedGroupFicha.records[0]["Segment."].toString().trim().toUpperCase();
          if (current && current !== "-" && current !== "SIN SEGMENTO") {
            segSet.add(current);
          }
        }
        return Array.from(segSet).sort();
      }, [data, selectedGroupFicha]);

      const handleSegmentChange = async (newVal) => {
        if (!selectedGroupFicha) return;
        let targetSegment = newVal;
        if (newVal === "__CUSTOM__") {
          const custom = window.prompt("Introduce el nombre del nuevo segmento:");
          if (!custom || !custom.trim()) return;
          targetSegment = custom.trim().toUpperCase();
        }
        if (!targetSegment) return;

        const currentRec = selectedGroupFicha.records?.[0] || {};
        const updates = {
          "Segment.": targetSegment,
          "Segment": targetSegment,
        };

        // Salvaguarda: si no tenía Com_Estado_Interno explícito fijado, preservamos su estado actual
        // para que cambiar el segmento no altere de forma inadvertida el estado de seguimiento del grupo
        if (!currentRec["Com_Estado_Interno"]) {
          const rawSt = currentRec["Com_Estado_Interno"] || currentRec["Segment."] || currentRec["Estado"] || "PROSPECTO";
          const stProps = getStatusProps(rawSt, selectedGroupFicha.arrival, currentRec["Estado"]);
          updates["Com_Estado_Interno"] = stProps.label || "PROSPECTO";
        }

        await updateGroupMetadata(selectedGroupFicha.id, updates);
      };

      // --- Room Manager Helpers ---
      const normalizeRoomIds = (value) => {
        if (value === null || value === undefined) return [];
        return (Array.isArray(value) ? value.flat(Infinity) : [value])
          .filter((id) => id !== null && id !== undefined && String(id).trim() !== "")
          .map((id) => String(id));
      };

      const createRoomId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const cleanRoomingListIds = (list) => {
        if (!Array.isArray(list)) return [];
        return list.map((item) => {
          let finalId = item.id;
          if (Array.isArray(finalId)) {
            const flatIds = finalId.flat(Infinity).filter((id) => id !== null && id !== undefined && String(id).trim() !== "");
            finalId = flatIds[0];
          }
          if (finalId === null || finalId === undefined || String(finalId).trim() === "") {
            finalId = createRoomId();
          }
          return {
            ...item,
            id: String(finalId),
          };
        });
      };

      // --- Room Manager Logic ---

      const addRoomBlock = () => {

        if (!selectedGroupFicha) return;

        const currentRecord = selectedGroupFicha.records[0] || {};

        const effectiveMainHotel = normalizeHotelNameLocal(

          currentRecord["Hotel_Asignado"] || currentRecord["Hotel"],

          "Sercotel Guadiana"

        );

        let currentList = [];

        try {

          currentList = parseRoomingListSafe(currentRecord["RoomingList_JSON"], "rooming-inventory");

        } catch (e) {

          currentList = [];

        }

        let nights = parseInt(roomManagerForm.nights) || 1;

        let dIn = new Date();

        if (roomManagerForm.dateIn) {

          dIn = new Date(toInputDate(roomManagerForm.dateIn));

        }

        if (nights < 1) nights = 1;

        // Calcular dateOut para propósitos informativos si es necesario (1 noche por defecto en dOut si no se especifica)

        let dOut = new Date(dIn);

        dOut.setDate(dIn.getDate() + nights);

        // --- Generación de Items (Desglosados o Únicos) ---

        let itemsToAdd = [];

        if (!roomManagerForm.isService && nights > 1) {

          // Desglose diario

          for (let i = 0; i < nights; i++) {

            const currentDay = new Date(dIn);

            currentDay.setDate(dIn.getDate() + i);

            const nextDay = new Date(currentDay);

            nextDay.setDate(currentDay.getDate() + 1);

            const checkinStr = currentDay.toISOString().split("T")[0];

            const checkoutStr = nextDay.toISOString().split("T")[0];

            itemsToAdd.push({

              id: createRoomId(),

              hotel: normalizeHotelNameLocal(

                roomManagerForm.hotel ||

                currentRecord["Hotel_Asignado"] ||

                currentRecord["Hotel"],

                effectiveMainHotel

              ),

              type: roomManagerForm.type,

              dateIn: checkinStr,

              dateOut: checkoutStr,

              qty: parseInt(roomManagerForm.qty),

              pax: parseInt(roomManagerForm.pax || 0),

              regime: roomManagerForm.regime,

              price: parseNum(roomManagerForm.price),

              iva: parseInt(roomManagerForm.iva || 10),

              nights: 1,

              isService: false,

              itemCategory: "accommodation",

              isAccommodation: true,

              total: (

                parseNum(roomManagerForm.price) *

                parseInt(roomManagerForm.qty)

              ).toFixed(2),

              comision: calculateDefaultCommission(

                roomManagerForm.price,

                roomManagerForm.regime,

                roomManagerForm.qty,

                1,

                roomManagerForm.type,

              ),

            });

          }

        } else {

          // Item único (Service o una sola noche)

          itemsToAdd.push({

            id: (editingId && !Array.isArray(editingId)) ? String(editingId) : createRoomId(),

            hotel: normalizeHotelNameLocal(roomManagerForm.hotel, effectiveMainHotel),

            type: roomManagerForm.type,

            dateIn: roomManagerForm.dateIn || currentRecord["Entrada"],

            dateOut: roomManagerForm.isService

              ? roomManagerForm.dateIn || currentRecord["Entrada"]

              : roomManagerForm.dateOut || currentRecord["Salida"],

            qty: parseInt(roomManagerForm.qty),

            pax: parseInt(roomManagerForm.pax || 0),

            regime: roomManagerForm.isService ? "" : roomManagerForm.regime,

            price: parseNum(roomManagerForm.price),

            iva: parseInt(roomManagerForm.iva || 10),

            nights: nights,

            isService: roomManagerForm.isService,

            itemCategory: roomManagerForm.isService ? "service" : "accommodation",

            isAccommodation: !roomManagerForm.isService,

            serviceCategory: roomManagerForm.isService && /almuerzo|cena|desayuno|coffee/i.test(roomManagerForm.type)
              ? "food-beverage"
              : undefined,

            total: (

              parseNum(roomManagerForm.price) *

              parseInt(roomManagerForm.qty) *

              nights

            ).toFixed(2),

            comision: (editingId && !Array.isArray(editingId))

              ? currentList.find((i) => String(i.id) === String(editingId))?.comision ||

              calculateDefaultCommission(

                roomManagerForm.price,

                roomManagerForm.isService ? "" : roomManagerForm.regime,

                roomManagerForm.qty,

                nights,

                roomManagerForm.type,

              )

              : calculateDefaultCommission(

                roomManagerForm.price,

                roomManagerForm.isService ? "" : roomManagerForm.regime,

                roomManagerForm.qty,

                nights,

                roomManagerForm.type,

              ),

          });

        }

        let newList;

        if (editingId) {

          const idSet = new Set(normalizeRoomIds(editingId));

          const firstIdx = currentList.findIndex((item) => {

            const itemIds = normalizeRoomIds(item.id);

            return itemIds.some((itemId) => idSet.has(itemId));

          });

          if (firstIdx !== -1) {

            const filteredList = currentList.filter((item) => {

              const itemIds = normalizeRoomIds(item.id);

              return !itemIds.some((itemId) => idSet.has(itemId));

            });

            newList = [...filteredList];

            newList.splice(firstIdx, 0, ...itemsToAdd);

          } else {

            newList = [...currentList, ...itemsToAdd];

          }

          setEditingId(null);

        } else {

          newList = [...currentList, ...itemsToAdd];

        }

        // Clean final list defensively

        newList = cleanRoomingListIds(newList);
        newList.sort((a, b) => compareRoomItemsByDateAndType(a, b));

        const newTotalSum = newList.reduce(

          (acc, i) => acc + (parseFloat(i.total) || 0),

          0,

        );

        const newTotalPax = calculateMaxDailyOccupancy(newList);

        const newTotalRooms = calculateMaxDailyRooms(newList);

        updateGroupMetadata(selectedGroupFicha.id, {

          RoomingList_JSON: JSON.stringify(newList),

          "Importe(*)": newTotalSum.toFixed(2),

          "Pax.": newTotalPax.toString(),

          "Cant.": newTotalRooms.toString(),

        });

        setRoomManagerForm((prev) => ({

          ...prev,

          qty: 1,

          pax: 2,

          price: 0,

          isService: false,

        }));

      };

      const handleEditRoomBlock = (item) => {

        const effectiveMainHotel = normalizeHotelNameLocal(

          selectedGroupFicha?.records[0]?.["Hotel_Asignado"] || selectedGroupFicha?.records[0]?.["Hotel"],

          "Sercotel Guadiana"

        );

        setRoomManagerForm({

          hotel: normalizeHotelNameLocal(item.hotel, effectiveMainHotel),

          type: item.type,

          dateIn: item.dateIn,

          dateOut: item.dateOut,

          qty: item.qty,

          pax: item.pax || getPaxByRoomType(item.type),

          regime: item.regime,

          price: item.price !== undefined && item.price !== null ? String(item.price).replace('.', ',') : 0,

          iva: item.iva || 10,

          isService: !!item.isService,

          nights: item.nights || 1,

        });

        setEditingId(item.ids || item.id);

      };

      const handleInlineRoomItemUpdate = (item, field, rawValue) => {
        if (!selectedGroupFicha || !selectedGroupFicha.records || !selectedGroupFicha.records[0]) return;
        const currentRecord = selectedGroupFicha.records[0] || {};
        let currentList = [];
        try {
          currentList = parseRoomingListSafe(currentRecord["RoomingList_JSON"], "selectedGroupFicha");
        } catch (e) {
          return;
        }
        if (!Array.isArray(currentList) || currentList.length === 0) return;

        const targetIds = new Set(normalizeRoomIds(item.ids || item.id));

        // Encontrar todos los elementos que coinciden en currentList
        const matchedIndices = [];
        currentList.forEach((r, idx) => {
          const rIds = normalizeRoomIds(r.id);
          if (rIds.some((id) => targetIds.has(id))) {
            matchedIndices.push(idx);
          }
        });

        if (matchedIndices.length === 0) return;

        if (field === "qty") {
          const newQty = Math.max(1, parseInt(rawValue, 10) || 1);
          const primaryIdx = matchedIndices[0];
          const primary = currentList[primaryIdx];
          primary.qty = newQty;
          const nights = parseInt(primary.nights, 10) || 1;
          const price = parseFloat(primary.price) || 0;
          primary.total = (price * newQty * nights).toFixed(2);
          primary.comision = calculateDefaultCommission(
            price,
            primary.isService ? "" : (primary.regime || ""),
            newQty,
            nights,
            primary.type
          );
          // Si había varios items agrupados, consolidar en el principal
          if (matchedIndices.length > 1) {
            const toRemove = new Set(matchedIndices.slice(1));
            currentList = currentList.filter((_, idx) => !toRemove.has(idx));
          }
        } else {
          matchedIndices.forEach((idx) => {
            const r = currentList[idx];
            if (field === "type") {
              const val = String(rawValue || "").toUpperCase().trim();
              r.type = val;
              const cleanVal = val.replace(/^(HAB\.|HABITACIÓN|HABITACION|HAB)\s+/i, '').trim();
              const isRoom = /^(IND|DUI|SINGLE|DOB|DBL|TWIN|MATRIMONIAL|TRI|CUA|QUIN|FAMI|SUITE|JUNIOR|ESTUDIO|HAB)/i.test(cleanVal);
              const isMealOrService = /ALMUERZO|CENA|DESAYUNO|COFFEE|PICNIC|TRASLADO|GUIA|GUÍA|BUS|PARKING|SAL[OÓ]N|EXTRA|SUPLEMENTO|SERVICIO|CONCEPTO/i.test(val);
              if (isMealOrService) {
                r.isService = true;
                if (r.pax === 2 || !r.pax) r.pax = 0;
              } else if (isRoom) {
                r.isService = false;
                r.pax = getPaxByRoomType(val);
              } else {
                r.pax = getPaxByRoomType(val);
              }
              const nights = parseInt(r.nights, 10) || 1;
              const qty = parseInt(r.qty, 10) || 1;
              const price = parseFloat(r.price) || 0;
              r.comision = calculateDefaultCommission(
                price,
                r.isService ? "" : (r.regime || ""),
                qty,
                nights,
                r.type
              );
            } else if (field === "isService") {
              r.isService = !!rawValue;
              if (r.isService && (r.pax === 2 || !r.pax)) {
                r.pax = 0;
              } else if (!r.isService && (!r.pax || r.pax === 0)) {
                r.pax = getPaxByRoomType(r.type);
              }
              const nights = parseInt(r.nights, 10) || 1;
              const qty = parseInt(r.qty, 10) || 1;
              const price = parseFloat(r.price) || 0;
              r.comision = calculateDefaultCommission(
                price,
                r.isService ? "" : (r.regime || ""),
                qty,
                nights,
                r.type
              );
            } else if (field === "hotel") {
              r.hotel = rawValue;
            } else if (field === "dateIn") {
              const cleanDateStr = toInputDate(rawValue);
              r.dateIn = cleanDateStr;
              const nights = parseInt(r.nights, 10) || 1;
              try {
                const parts = cleanDateStr.split("-");
                if (parts.length === 3) {
                  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                  d.setDate(d.getDate() + nights);
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  r.dateOut = `${y}-${m}-${day}`;
                }
              } catch (e) {}
            } else if (field === "nights") {
              const newNights = Math.max(1, parseInt(rawValue, 10) || 1);
              r.nights = newNights;
              if (r.dateIn) {
                try {
                  const cleanDateStr = toInputDate(r.dateIn);
                  const parts = cleanDateStr.split("-");
                  if (parts.length === 3) {
                    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                    d.setDate(d.getDate() + newNights);
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    r.dateOut = `${y}-${m}-${day}`;
                  }
                } catch (e) {}
              }
              const qty = parseInt(r.qty, 10) || 1;
              const price = parseFloat(r.price) || 0;
              r.total = (price * qty * newNights).toFixed(2);
              r.comision = calculateDefaultCommission(
                price,
                r.isService ? "" : (r.regime || ""),
                qty,
                newNights,
                r.type
              );
            } else if (field === "pax") {
              r.pax = Math.max(1, parseInt(rawValue, 10) || 1);
            } else if (field === "regime") {
              const oldRegime = (r.regime || "").trim().toUpperCase();
              const newRegime = (rawValue || "").trim().toUpperCase();
              r.regime = newRegime;

              // Si el item tiene precio y cambia el régimen (ej. PC a MP o MP a PC):
              // Ajustar el precio por habitación según la diferencia de manutención
              const currentPrice = parseFloat(r.price) || 0;
              const isFree = String(r.type || "").toUpperCase().includes("GRATUIDAD") || currentPrice === 0;
              if (!isFree && oldRegime && newRegime && oldRegime !== newRegime && !r.isService && window.BoardPricingService) {
                const oldCounts = window.BoardPricingService.getMealCounts(oldRegime);
                const newCounts = window.BoardPricingService.getMealCounts(newRegime);
                
                const hotelForPricing = r.hotel || selectedGroupFicha.hotel || "Sercotel Guadiana";
                const pricing = window.BoardPricingService.getPricingForHotelAndDate(hotelForPricing, r.dateIn || r.date, boardPricingConfig);
                const bPrice = typeof pricing.breakfast === "number" ? pricing.breakfast : 6.0;
                const mPrice = typeof pricing.meal === "number" ? pricing.meal : 16.0;
                
                const deltaPerPax = ((newCounts.breakfasts - oldCounts.breakfasts) * bPrice) + ((newCounts.meals - oldCounts.meals) * mPrice);
                const paxInRoom = Math.max(1, parseInt(r.pax, 10) || getPaxByRoomType(r.type));
                const deltaTotal = deltaPerPax * paxInRoom;
                
                const adjustedPrice = Math.max(0, currentPrice + deltaTotal);
                r.price = adjustedPrice.toFixed(2);
              }

              const nights = parseInt(r.nights, 10) || 1;
              const qty = parseInt(r.qty, 10) || 1;
              const price = parseFloat(r.price) || 0;
              r.total = (price * qty * nights).toFixed(2);
              r.comision = calculateDefaultCommission(
                price,
                r.isService ? "" : (r.regime || ""),
                qty,
                nights,
                r.type
              );
            } else if (field === "price") {
              const newPrice = Math.max(0, parseFloat(rawValue) || 0);
              r.price = newPrice;
              const nights = parseInt(r.nights, 10) || 1;
              const qty = parseInt(r.qty, 10) || 1;
              r.total = (newPrice * qty * nights).toFixed(2);
              r.comision = calculateDefaultCommission(
                newPrice,
                r.isService ? "" : (r.regime || ""),
                qty,
                nights,
                r.type
              );
            } else if (field === "iva") {
              r.iva = parseInt(rawValue, 10) || 10;
            }
          });
        }

        currentList = cleanRoomingListIds(currentList);
        currentList.sort((a, b) => compareRoomItemsByDateAndType(a, b));

        const newTotalSum = currentList.reduce(
          (acc, i) => acc + (parseFloat(i.total) || 0),
          0
        );
        const newTotalPax = calculateMaxDailyOccupancy(currentList);
        const newTotalRooms = calculateMaxDailyRooms(currentList);

        // Sincronizar DailyDistribution_JSON completamente con el rooming list
        let updatedDailyDistMap = null;
        if (currentRecord.DailyDistribution_JSON) {
          try {
            updatedDailyDistMap = typeof currentRecord.DailyDistribution_JSON === "string"
              ? JSON.parse(currentRecord.DailyDistribution_JSON)
              : { ...currentRecord.DailyDistribution_JSON };
          } catch (e) {}
        }
        const hotelTarget = currentRecord.Hotel_Asignado || currentRecord.Hotel || selectedGroupFicha?.hotel || "";
        updatedDailyDistMap = buildDailyDistributionFromRoomingList(currentList, updatedDailyDistMap || {}, hotelTarget);

        const firstValidRegime = currentList.find(r => !r.isService && r.regime && r.regime !== "-")?.regime;
        const updatePayload = {
          RoomingList_JSON: JSON.stringify(currentList),
          DailyDistribution_JSON: JSON.stringify(updatedDailyDistMap),
          "Importe(*)": newTotalSum.toFixed(2),
          "Pax.": newTotalPax.toString(),
          "Cant.": newTotalRooms.toString(),
        };
        if (firstValidRegime) {
          updatePayload["Régimen"] = firstValidRegime;
        }

        updateGroupMetadata(selectedGroupFicha.id, updatePayload);
      };

      const handleInsertLineForDay = (dayKey) => {
        if (!selectedGroupFicha) return;
        const currentRecord = selectedGroupFicha?.records?.[0] || {};
        let currentList = [];
        try {
          currentList = parseRoomingListSafe(currentRecord["RoomingList_JSON"], "insert-day-line");
        } catch (e) {
          currentList = [];
        }
        if (!Array.isArray(currentList)) currentList = [];

        // Si el día estaba disminuido/colapsado, ampliarlo automáticamente
        setCollapsedFichaDays((prev) => {
          if (prev.has(dayKey)) {
            const next = new Set(prev);
            next.delete(dayKey);
            return next;
          }
          return prev;
        });

        // Determinar fecha de salida por defecto (+1 día)
        let nextDayStr = dayKey;
        try {
          const p = dayKey.split("-");
          if (p.length === 3) {
            const d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
            d.setDate(d.getDate() + 1);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            nextDayStr = `${y}-${m}-${day}`;
          }
        } catch (e) {}

        const effectiveMainHotel = normalizeHotelNameLocal(
          selectedGroupFicha?.hotel || currentRecord["Hotel_Asignado"] || currentRecord["Hotel"],
          "Sercotel Guadiana"
        );

        // Buscar items existentes de este día para heredar hotel y régimen
        const dayItems = currentList.filter(item => {
          const d = toInputDate(item.dateIn || item.date);
          return d === dayKey;
        });
        const hotelForDay = dayItems[0]?.hotel || effectiveMainHotel;
        const regimeForDay = dayItems.find(i => !i.isService && i.regime && i.regime !== "-")?.regime || currentRecord["Régimen"] || "HD";

        // Determinar sortOrder para situar la nueva línea al final de ese día
        let maxSortOrder = -1;
        dayItems.forEach(it => {
          if (typeof it.sortOrder === "number" && it.sortOrder > maxSortOrder) {
            maxSortOrder = it.sortOrder;
          }
        });
        const newSortOrder = maxSortOrder + 1;

        const newId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const newItem = {
          id: newId,
          hotel: hotelForDay,
          type: "",
          dateIn: dayKey,
          dateOut: nextDayStr,
          nights: 1,
          qty: 1,
          pax: 2,
          regime: regimeForDay,
          price: "0.00",
          iva: 10,
          total: "0.00",
          isService: false,
          sortOrder: newSortOrder
        };

        const newList = cleanRoomingListIds([...currentList, newItem]);
        newList.sort((a, b) => compareRoomItemsByDateAndType(a, b));

        const newTotalSum = newList.reduce((acc, i) => acc + (parseFloat(i.total) || 0), 0);
        const newTotalPax = calculateMaxDailyOccupancy(newList);
        const newTotalRooms = calculateMaxDailyRooms(newList);

        setNewlyInsertedLineId(newId);

        updateGroupMetadata(selectedGroupFicha.id, {
          RoomingList_JSON: JSON.stringify(newList),
          "Importe(*)": newTotalSum.toFixed(2),
          "Pax.": newTotalPax.toString(),
          "Cant.": newTotalRooms.toString(),
        });
      };

      const handleReplicatePricesFromDay = (sourceDayKey) => {
        if (!selectedGroupFicha) return;
        const currentRecord = selectedGroupFicha?.records?.[0] || {};
        let currentList = [];
        try {
          currentList = parseRoomingListSafe(currentRecord["RoomingList_JSON"], "replicate-prices");
        } catch (e) {
          currentList = [];
        }
        if (!Array.isArray(currentList) || currentList.length === 0) return;

        // 1. Obtener los precios por tipo de habitación del día de origen (sourceDayKey)
        const sourceItems = currentList.filter((item) => {
          const d = toInputDate(item.dateIn || item.date);
          return d === sourceDayKey;
        });

        if (sourceItems.length === 0) {
          if (window.Swal) {
            window.Swal.fire({
              icon: "warning",
              title: "Sin líneas",
              text: "No hay líneas en este día para copiar precios."
            });
          }
          return;
        }

        // Mapear precios por categoría (INDIV, DBL, TPL, CUA)
        const sourcePricesByCategory = {};
        const sourcePricesByTypeExact = {};

        sourceItems.forEach((it) => {
          if (it.isService) return;
          const p = parseNum(it.price) || 0;
          const t = String(it.type || it.roomType || "").toUpperCase();
          const isGrat = t.includes("GRATUIDAD") || p === 0;
          if (!isGrat && p > 0) {
            sourcePricesByTypeExact[t] = p;
            if (t.includes("INDIV") || t.includes("SINGLE") || t.includes("DUI")) {
              sourcePricesByCategory["INDIV"] = p;
            } else if (t.includes("DBL") || t.includes("DOBLE")) {
              sourcePricesByCategory["DBL"] = p;
            } else if (t.includes("TPL") || t.includes("TRIPLE")) {
              sourcePricesByCategory["TPL"] = p;
            } else if (t.includes("CUA") || t.includes("CUAD")) {
              sourcePricesByCategory["CUA"] = p;
            }
          }
        });

        if (Object.keys(sourcePricesByCategory).length === 0 && Object.keys(sourcePricesByTypeExact).length === 0) {
          if (window.Swal) {
            window.Swal.fire({
              icon: "info",
              title: "Sin precios",
              text: "No se encontraron habitaciones con precio superior a 0 € en este día para replicar."
            });
          }
          return;
        }

        // 2. Replicar a todos los días de la estancia en RoomingList_JSON
        let updatedCount = 0;
        const updatedList = currentList.map((item) => {
          if (item.isService) return item;
          const itemDay = toInputDate(item.dateIn || item.date);
          if (itemDay === sourceDayKey) return item;

          const t = String(item.type || item.roomType || "").toUpperCase();
          const isGrat = t.includes("GRATUIDAD") || (parseNum(item.price) === 0 && item.isGratuity);
          if (isGrat) return item;

          let targetPrice = null;
          if (sourcePricesByTypeExact[t] !== undefined) {
            targetPrice = sourcePricesByTypeExact[t];
          } else if (t.includes("INDIV") || t.includes("SINGLE") || t.includes("DUI")) {
            targetPrice = sourcePricesByCategory["INDIV"];
          } else if (t.includes("DBL") || t.includes("DOBLE")) {
            targetPrice = sourcePricesByCategory["DBL"];
          } else if (t.includes("TPL") || t.includes("TRIPLE")) {
            targetPrice = sourcePricesByCategory["TPL"];
          } else if (t.includes("CUA") || t.includes("CUAD")) {
            targetPrice = sourcePricesByCategory["CUA"];
          }

          if (targetPrice !== null && targetPrice !== undefined && targetPrice > 0) {
            const qty = parseFloat(item.qty) || 1;
            const nights = parseFloat(item.nights) || 1;
            const newTot = qty * nights * targetPrice;
            updatedCount++;
            return {
              ...item,
              price: targetPrice.toFixed(2),
              total: newTot.toFixed(2)
            };
          }
          return item;
        });

        // 3. Replicar también en DailyDistribution_JSON si existe
        let updatedDistJson = undefined;
        try {
          const rawDist = currentRecord["DailyDistribution_JSON"];
          if (rawDist) {
            const distMap = typeof rawDist === "string" ? JSON.parse(rawDist) : { ...rawDist };
            let distChanged = false;
            Object.keys(distMap).forEach((k) => {
              const entry = distMap[k];
              if (entry && typeof entry === "object") {
                entry.prices = entry.prices || {};
                if (sourcePricesByCategory["INDIV"]) entry.prices.individuales = sourcePricesByCategory["INDIV"];
                if (sourcePricesByCategory["DBL"]) entry.prices.dobles = sourcePricesByCategory["DBL"];
                if (sourcePricesByCategory["TPL"]) entry.prices.triples = sourcePricesByCategory["TPL"];
                if (sourcePricesByCategory["CUA"]) entry.prices.cuadruples = sourcePricesByCategory["CUA"];

                const indP = Math.max(0, (entry.individuales || 0) - (entry.gratuities?.individuales || 0));
                const dblP = Math.max(0, (entry.dobles || 0) - (entry.gratuities?.dobles || 0));
                const tplP = Math.max(0, (entry.triples || 0) - (entry.gratuities?.triples || 0));
                const cuaP = Math.max(0, (entry.cuadruples || 0) - (entry.gratuities?.cuadruples || 0));
                const dTot = (indP * (entry.prices.individuales || 0)) +
                             (dblP * (entry.prices.dobles || 0)) +
                             (tplP * (entry.prices.triples || 0)) +
                             (cuaP * (entry.prices.cuadruples || 0));
                if (dTot > 0) entry.dailyAmount = dTot;
                distChanged = true;
              }
            });
            if (distChanged) {
              updatedDistJson = JSON.stringify(distMap);
            }
          }
        } catch (e) {}

        const newTotalSum = updatedList.reduce((acc, i) => acc + (parseFloat(i.total) || 0), 0);
        const updatePayload = {
          RoomingList_JSON: JSON.stringify(updatedList),
          "Importe(*)": newTotalSum.toFixed(2)
        };
        if (updatedDistJson) {
          updatePayload["DailyDistribution_JSON"] = updatedDistJson;
        }

        updateGroupMetadata(selectedGroupFicha.id, updatePayload);

        if (window.Swal) {
          window.Swal.fire({
            icon: "success",
            title: "Precios Replicados",
            text: `Se aplicaron los precios a ${updatedCount} habitación(es) del resto de la estancia. Nuevo importe total: ${newTotalSum.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`,
            timer: 2500,
            showConfirmButton: false
          });
        }
      };

      const handleMoveRoomItemWithinBucket = (bucket, fromIdx, toIdx) => {
        if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || !bucket || !bucket.items) return;
        if (fromIdx >= bucket.items.length || toIdx >= bucket.items.length) return;

        const currentRecord = selectedGroupFicha?.records?.[0] || {};
        let currentList = [];
        try {
          currentList = parseRoomingListSafe(currentRecord["RoomingList_JSON"], "rooming-inventory");
        } catch (e) {
          return;
        }
        if (!Array.isArray(currentList) || currentList.length === 0) return;

        const newBucketItems = [...bucket.items];
        const [moved] = newBucketItems.splice(fromIdx, 1);
        newBucketItems.splice(toIdx, 0, moved);

        // Assign explicit sortOrder to all items in this day
        newBucketItems.forEach((it, orderIdx) => {
          const targetIds = new Set(normalizeRoomIds(it.ids || it.id));
          currentList.forEach((r) => {
            const rIds = normalizeRoomIds(r.id);
            const matchesId = rIds.some((id) => targetIds.has(id));
            const matchesMulti = it.originalMultiNightId && String(r.id) === String(it.originalMultiNightId);
            if (matchesId || matchesMulti) {
              r.sortOrder = orderIdx;
            }
          });
        });

        currentList.sort((a, b) => compareRoomItemsByDateAndType(a, b));

        const newTotalSum = currentList.reduce((acc, i) => acc + (parseFloat(i.total) || 0), 0);
        const newTotalPax = calculateMaxDailyOccupancy(currentList);
        const newTotalRooms = calculateMaxDailyRooms(currentList);

        updateGroupMetadata(selectedGroupFicha.id, {
          RoomingList_JSON: JSON.stringify(currentList),
          "Importe(*)": newTotalSum.toFixed(2),
          "Pax.": newTotalPax.toString(),
          "Cant.": newTotalRooms.toString(),
        });
      };

      const handleRoomManagerDrop = (sourceIndex, targetIndex) => {
        if (sourceIndex === targetIndex || isNaN(sourceIndex) || isNaN(targetIndex)) return;

        const currentRecord = selectedGroupFicha?.records?.[0] || {};
        let currentList = [];
        try {
          currentList = parseRoomingListSafe(currentRecord["RoomingList_JSON"], "rooming-inventory");
        } catch (e) {
          return;
        }
        if (!Array.isArray(currentList) || currentList.length === 0) return;

        const grouped = [];
        currentList.forEach((item) => {
          const key = `${item.hotel || ''}_${item.type || ''}_${item.dateIn || ''}_${item.dateOut || ''}_${item.price || 0}_${item.iva || 10}_${item.regime || ''}_${!!item.isService}`;
          const existing = grouped.find(g => g.key === key);
          if (existing) {
            existing.items.push(item);
            if (typeof item.sortOrder === "number" && (typeof existing.sortOrder !== "number" || item.sortOrder < existing.sortOrder)) {
              existing.sortOrder = item.sortOrder;
            }
          } else {
            grouped.push({
              key,
              items: [item],
              sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : undefined
            });
          }
        });

        grouped.sort((a, b) => compareRoomItemsByDateAndType(a.items[0] || {}, b.items[0] || {}));
        if (sourceIndex < 0 || sourceIndex >= grouped.length || targetIndex < 0 || targetIndex >= grouped.length) return;

        const [moved] = grouped.splice(sourceIndex, 1);
        grouped.splice(targetIndex, 0, moved);

        grouped.forEach((g, gIdx) => {
          g.items.forEach((item) => {
            item.sortOrder = gIdx;
          });
        });

        const newList = [];
        grouped.forEach((g) => {
          newList.push(...g.items);
        });

        const newTotalSum = newList.reduce((acc, i) => acc + (parseFloat(i.total) || 0), 0);
        const newTotalPax = calculateMaxDailyOccupancy(newList);
        const newTotalRooms = calculateMaxDailyRooms(newList);

        updateGroupMetadata(selectedGroupFicha.id, {
          RoomingList_JSON: JSON.stringify(newList),
          "Importe(*)": newTotalSum.toFixed(2),
          "Pax.": newTotalPax.toString(),
          "Cant.": newTotalRooms.toString(),
        });
      };

      const calculateDeposits = (

        group,

        distribution = [100],

        hotelFilter = null,

      ) => {

        const records = hotelFilter

          ? group.records.filter(

            (r) => (r["Hotel_Asignado"] || r["Hotel"]) === hotelFilter,

          )

          : group.records;

        if (records.length === 0) return;

        const firstRec = records[0];

        const roomingList = getEconomicRoomingItems(firstRec?.["RoomingList_JSON"], "proforma-hotel-comm");

        const hotelRoomingItems = hotelFilter

          ? roomingList.filter((i) => i.hotel === hotelFilter)

          : roomingList;

        const grossTotal =

          hotelRoomingItems.reduce(

            (acc, i) => acc + (parseFloat(i.total) || 0),

            0,

          ) ||

          records.reduce((acc, r) => {

            const val = parseNum(r["Importe(*)"]);

            return acc + val;

          }, 0);

        const totalCommission = hotelRoomingItems.reduce(

          (acc, i) => acc + (parseFloat(i.comision?.total_comision) || 0),

          0,

        );

        const total = Math.max(0, grossTotal - totalCommission);

        const entrada = firstRec?.["Entrada"];

        let dateEntrada = new Date();

        if (entrada) {

          const numDate = parseFloat(entrada);

          if (!isNaN(numDate) && numDate > 40000 && numDate < 60000) {

            dateEntrada = new Date(

              Math.round((numDate - 25569) * 86400 * 1000),

            );

          } else {

            const dateStr = toInputDate(entrada);

            dateEntrada = new Date(dateStr);

          }

        }

        // Default labels/days for standard distributions

        const presetMeta = {

          30: { label: "Depósito Inicial", days: 60 },

          70: { label: "Pago Final", days: 15 },

          50: { label: "Depósito", days: 45 },

          100: { label: "Pago Único", days: 30 },

        };

        const manualPaid = parseNum(firstRec["Com_Pagado"] || "0");

        let remainingManual = manualPaid;

        const newPlan = [];

        // Si hay pago manual, lo ponemos como primer bloque si no hay uno previo que lo cubra

        if (manualPaid > 0) {

          newPlan.push({

            id: "manual-" + Date.now(),

            label: "Pago a Cuenta",

            percent: ((manualPaid / total) * 100).toFixed(1),

            amount: manualPaid.toFixed(2),

            releaseDays: 0,

            date: new Date().toISOString().split("T")[0],

            status: "Cobrado",

          });

        }

        const getOrdinalLabel = (index, total) => {

          if (total === 1) return "Pago Único";

          if (index === 0) return "Depósito";

          if (index === total - 1) return "Pago Final";

          const labels = ["Depósito", "Segundo Pago", "Tercer Pago", "Cuarto Pago", "Quinto Pago"];

          return labels[index] || `Pago ${index + 1}`;

        };

        distribution.forEach((pct, idx) => {

          const label = getOrdinalLabel(idx, distribution.length);

          const meta = {

            label: label,

            days: presetMeta[pct.toString()]?.days || 30,

          };

          const date = new Date(dateEntrada);

          date.setDate(date.getDate() - meta.days);

          let amount = total * (pct / 100);

          // Si el pago manual cubre parte o todo de este segmento, lo descontamos

          if (remainingManual > 0) {

            if (remainingManual >= amount) {

              remainingManual -= amount;

              return; // Este segmento ya está cubierto por el pago a cuenta

            } else {

              amount -= remainingManual;

              remainingManual = 0;

            }

          }

          if (amount > 0.01) {

            newPlan.push({

              id: Date.now() + Math.random(),

              label: meta.label,

              percent: ((amount / total) * 100).toFixed(1),

              amount: amount.toFixed(2),

              releaseDays: meta.days,

              date: date.toISOString().split("T")[0],

              status: "Pendiente",

            });

          }

        });

        updateGroupMetadata(

          group.id,

          { PaymentPlan_JSON: JSON.stringify(newPlan) },

          null,

          hotelFilter,

        );

      };

      const updatePaymentPlan = (resId, hotelFilter, plan) => {

        let updatedPlan = plan || [];

        if (updatedPlan.length > 1) {

          updatedPlan = updatedPlan.map((p, idx) => {

            if (idx === 0 && (p.label === "Pago Único" || p.label === "Primer Pago" || !p.label)) {

              return { ...p, label: "Depósito" };

            }

            return p;

          });

        } else if (updatedPlan.length === 1) {

          updatedPlan = updatedPlan.map((p) => {

            if (p.label === "Depósito" || p.label === "Primer Pago" || !p.label) {

              return { ...p, label: "Pago Único" };

            }

            return p;

          });

        }

        updateGroupMetadata(

          resId,

          "PaymentPlan_JSON",

          JSON.stringify(updatedPlan),

          hotelFilter,

        );

      };

      const addNewRow = () => {

        const emptyRow = {};

        columns.forEach((col) => (emptyRow[col] = ""));

        emptyRow["Entrada"] = new Date().toISOString().split("T")[0];

        setData([emptyRow, ...data]);

      };

      const removeRoomBlock = (ids) => {

        if (!selectedGroupFicha) return;

        const currentRecord = selectedGroupFicha.records[0] || {};

        let currentList = [];

        try {

          currentList = parseRoomingListSafe(currentRecord["RoomingList_JSON"], "rooming-inventory");

        } catch (e) {

          return;

        }

        const idSet = new Set(normalizeRoomIds(ids));

        const rawList = currentList.filter((item) => {
          const itemIds = normalizeRoomIds(item.id);
          return !itemIds.some((itemId) => idSet.has(itemId));
        });

        const newList = cleanRoomingListIds(rawList);

        const newTotalSum = newList.reduce(

          (acc, i) => acc + (parseFloat(i.total) || 0),

          0,

        );

        const newTotalPax = calculateMaxDailyOccupancy(newList);

        const newTotalRooms = calculateMaxDailyRooms(newList);

        updateGroupMetadata(selectedGroupFicha.id, {

          RoomingList_JSON: JSON.stringify(newList),

          "Importe(*)": newTotalSum.toFixed(2),

          "Pax.": newTotalPax.toString(),

          "Cant.": newTotalRooms.toString(),

        });

      };

      const toggleGroupExpand = (groupName) => {

        if (expandedGroup === groupName) setExpandedGroup(null);

        else setExpandedGroup(groupName);

      };

      const clearDatabase = async () => {

        if (

          !window.confirm(

            "⚠️ ATENCIÓN: ¿Estás ABSOLUTAMENTE seguro de que quieres BORRAR TODA la base de datos de grupos?\n\nEsta acción eliminará todos los registros en Firestore y NO se puede deshacer.",

          )

        ) {

          return;

        }

        const secondConfirm = window.confirm(

          "Segunda confirmación: ¿Realmente quieres borrar TODO?",

        );

        if (!secondConfirm) return;

        try {

          // log

          const snapshot = await db.collection("groups").get();

          if (snapshot.empty) {

            alert("La base de datos ya está vacía.");

            return;

          }

          const batch = db.batch();

          snapshot.docs.forEach((doc) => {

            batch.delete(doc.ref);

          });

          await batch.commit();

          alert(

            "✅ Base de datos borrada con éxito. El sistema está ahora vacío y listo para una nueva importación.",

          );

          // log

          setData([]); // Leave completely empty for debug

        } catch (err) {

          console.error("❌ Error al borrar DB:", err);

          alert("Error al borrar la base de datos: " + err.message);

        }

      };

      return (
        <div className="min-h-screen pb-10 bg-dot-pattern">
          {/* Cabecera unificada administrada por js/navigation.js */}

          <div className="w-full px-4">

            {/* KPI Cards: ENFOQUE COMERCIAL */}

            {/* KPI SECTION: Unificada en una sola línea elegante */}

            <div className="flex flex-row flex-nowrap gap-3 mb-4 overflow-x-auto pb-2 custom-scrollbar">

              {/* TOTAL REVENUE KPI (Removed per user request) */}

              {/* PENDIENTES DE COTIZAR */}

              {stats.pendingQuotes > 0 && (

                <div

                  onClick={() => (window.location.href = "Presupuestos.html")}

                  className="min-w-[170px] flex-1 bg-rose-50 p-3 rounded-2xl shadow-sm border border-rose-200 flex flex-col justify-center cursor-pointer hover:bg-rose-100 transition-colors animate-pulse"

                >

                  <div className="flex items-center gap-2 mb-1">

                    <div className="w-1 h-3 bg-rose-600 rounded-full"></div>

                    <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">

                      Por Cotizar

                    </span>

                  </div>

                  <div className="flex items-baseline gap-2">

                    <span className="text-2xl font-black text-rose-700 tabular-nums leading-none">

                      {stats.pendingQuotes}

                    </span>

                    <span className="text-[10px] font-bold text-rose-500 uppercase">

                      Grupos

                    </span>

                  </div>

                </div>

              )}

              {/* RELEASE 7 DÍAS */}

              <div

                onClick={() => setKpiFilter("release")}

                className={`min-w-[170px] flex-1 bg-white p-3 rounded-2xl shadow-sm border flex flex-col justify-center cursor-pointer transition-colors ${kpiFilter === "release" ? "border-rose-400 ring-2 ring-rose-100 bg-rose-50" : "border-slate-100 hover:border-rose-200 hover:bg-rose-50/50"}`}

              >

                <div className="flex items-center gap-2 mb-1">

                  <div className="w-1 h-3 bg-rose-500 rounded-full"></div>

                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">

                    Release

                  </span>

                </div>

                <div className="flex items-baseline gap-2">

                  <span className="text-2xl font-black text-slate-800 tabular-nums leading-none">

                    {stats.releaseAlerts}

                  </span>

                  <span className="text-[10px] font-bold text-rose-500 uppercase">

                    Críticos

                  </span>

                </div>

              </div>

              {/* TAREAS HOY */}

              <div

                onClick={() => setKpiFilter("followup")}

                className={`min-w-[170px] flex-1 bg-white p-3 rounded-2xl shadow-sm border flex flex-col justify-center cursor-pointer transition-colors ${kpiFilter === "followup" ? "border-blue-400 ring-2 ring-blue-100 bg-blue-50" : "border-slate-100 hover:border-blue-200 hover:bg-blue-50/50"}`}

              >

                <div className="flex items-center gap-2 mb-1">

                  <div className="w-1 h-3 bg-blue-500 rounded-full"></div>

                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">

                    Tareas

                  </span>

                </div>

                <div className="flex items-baseline gap-2">

                  <span className="text-2xl font-black text-slate-800 tabular-nums leading-none">

                    {stats.followUpAlerts}

                  </span>

                  <span className="text-[10px] font-bold text-blue-500 uppercase">

                    Pendientes

                  </span>

                </div>

              </div>

              {/* PRESUPUESTOS SIN ATENDER — pulsante si hay alguno */}

              {stats.unattendedQuotes > 0 && (

                <div

                  onClick={() => {

                    window.location.href = "Presupuestos.html";

                  }}

                  className="min-w-[170px] flex-1 bg-amber-50 border-2 border-amber-300 p-3 rounded-2xl shadow-sm flex flex-col justify-center cursor-pointer hover:bg-amber-100 transition-colors animate-pulse"

                >

                  <div className="flex items-center gap-2 mb-1">

                    <div className="w-1 h-3 bg-amber-500 rounded-full"></div>

                    <span className="text-[10px] text-amber-600 font-black uppercase tracking-wider">

                      Recepción

                    </span>

                  </div>

                  <div className="flex items-baseline gap-2">

                    <span className="text-2xl font-black text-amber-700 tabular-nums leading-none">

                      {stats.unattendedQuotes}

                    </span>

                    <span className="text-[10px] font-bold text-amber-500 uppercase">

                      Sin atender

                    </span>

                  </div>

                </div>

              )}

              {/* RECUENTO POR COMERCIAL */}

              <div className="w-[1px] bg-slate-200 mx-2 flex-shrink-0 self-stretch my-2"></div>

              {Object.entries(stats.commercialsCount || {})

                .sort((a, b) => b[1] - a[1])

                .map(([name, count]) => (

                  <div

                    key={name}

                    className="min-w-[140px] flex-1 bg-slate-50/50 p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center hover:bg-white transition-colors"

                  >

                    <div className="flex items-center gap-2 mb-1">

                      <div

                        className={`w-1 h-3 rounded-full ${getCommColor(name)}`}

                      ></div>

                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">

                        {name}

                      </span>

                    </div>

                    <div className="flex items-baseline gap-2">

                      <span className="text-2xl font-black text-slate-700 tabular-nums leading-none">

                        {count}

                      </span>

                      <span className="text-[10px] font-bold text-slate-400 uppercase">

                        Grupos

                      </span>

                    </div>

                  </div>

                ))}

            </div>

            {/* --- UNIFIED HEADER & FILTERS --- */}

            <div className="bg-white p-2 px-4 rounded-2xl shadow-sm border border-slate-200 mb-4 flex flex-col xl:flex-row items-center justify-between gap-3">

              <div className="flex items-center gap-3 w-full xl:w-auto">

                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 shadow-inner text-slate-400">

                  <IconGroup size={20} />

                </div>

                <div>

                  <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">

                    Gestión de Grupos

                  </h2>

                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">

                    Directorio unificado de reservas y análisis.

                  </p>

                </div>

              </div>

              <div className="flex flex-wrap gap-1.5 items-center w-full xl:flex-1 xl:justify-end">

                {kpiFilter && (

                  <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg animate-pulse">

                    <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1">

                      <IconFilter size={10} /> {kpiFilter.toUpperCase()}

                    </span>

                    <button

                      onClick={() => setKpiFilter(null)}

                      className="text-amber-500 hover:text-amber-700 font-bold text-xs"

                    >

                      ✕

                    </button>

                  </div>

                )}

                {/* Buscador Global */}
                <div className="relative w-full sm:w-44 h-8 flex items-center">
                  <IconSearch
                    className="absolute left-2.5 text-slate-400"
                    size={12}
                  />
                  <DebouncedSearchInput
                    placeholder="Buscar..."
                    className="w-full h-full border-slate-200 border rounded-lg pl-8 pr-8 py-1 text-[10px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 font-bold text-slate-700"
                    value={searchTerm}
                    onChange={setSearchTerm}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 text-slate-300 hover:text-rose-500 transition-colors flex items-center justify-center"
                      title="Limpiar búsqueda"
                    >
                      <IconX size={10} />
                    </button>
                  )}
                </div>

                {/* Filtro por Fecha */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 h-8">
                  <IconCalendar size={12} className="text-slate-400" />
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Desde:</span>
                    <input
                      type="date"
                      className="bg-white border border-slate-200 rounded px-1 text-[10px] font-bold text-slate-700 outline-none w-[100px]"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Hasta:</span>
                    <input
                      type="date"
                      className="bg-white border border-slate-200 rounded px-1 text-[10px] font-bold text-slate-700 outline-none w-[100px]"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                      }}
                      className="text-slate-400 hover:text-rose-500 ml-1 transition-colors flex items-center justify-center"
                      title="Limpiar fechas"
                    >
                      <IconX size={10} />
                    </button>
                  )}
                </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 h-8">

                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">

                      Estado

                    </span>

                    <select

                      className="bg-transparent text-[10px] font-bold text-slate-700 outline-none min-w-[80px]"

                      value={filterStatus}

                      onChange={(e) => setFilterStatus(e.target.value)}

                    >

                      <option value="all">Todos</option>

                      <option value="activos">Activos</option>

                      <option value="activos_y_desestimados">Activos y Desestimados</option>

                      <option value="confirmada">Confirmados</option>

                      <option value="tentativa">Tentativas</option>

                      <option value="presupuesto">Presupuestos</option>

                      <option value="desestimada">Desestimados</option>

                      <option value="pasado">Pasados</option>

                    </select>

                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 h-8">

                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">

                      Hotel

                    </span>

                    <select

                      className="bg-transparent text-[10px] font-bold text-slate-700 outline-none max-w-[100px]"

                      value={filterDirHotel}

                      onChange={(e) => setFilterDirHotel(e.target.value)}

                    >

                      <option value="">Todos</option>

                      {[

                        ...new Set(

                          groupedData

                            .map((g) => {

                              const h =

                                g.records[0]?.["Hotel_Asignado"] ||

                                g.records[0]?.["Hotel"];

                              return normalizeHotelName(h);

                            })

                            .filter(Boolean),

                        ),

                      ]

                        .sort()

                        .map((h) => (

                          <option key={h} value={h}>

                            {h}

                          </option>

                        ))}

                    </select>

                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 h-8">

                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-purple-600">

                      Com.

                    </span>

                    <select

                      className="bg-transparent text-[10px] font-bold text-slate-700 outline-none"

                      value={filterDirCommercial}

                      onChange={(e) => setFilterDirCommercial(e.target.value)}

                    >

                      <option value="">Todos</option>

                      <option value="SIN_ASIGNAR">S/A</option>

                      {commercials

                        .filter((c) => c.active)

                        .map((c) => (

                          <option key={c.name} value={c.name}>

                            {c.name}

                          </option>

                        ))}

                    </select>

                  </div>

                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 h-8">

                    <button

                      onClick={() => requestSort("Entrada")}

                      className={`p-1 rounded transition-all ${sortConfig.key === "Entrada" ? "bg-white shadow-sm ring-1 ring-slate-200" : "hover:bg-white text-slate-400"}`}

                      title="Ordenar por Fecha"

                    >

                      <IconCalendar

                        size={12}

                        className={

                          sortConfig.key === "Entrada" ? "text-blue-600" : ""

                        }

                      />

                    </button>

                    <button

                      onClick={() => requestSort("Importe(*)")}

                      className={`p-1 rounded transition-all ${sortConfig.key === "Importe(*)" ? "bg-white shadow-sm ring-1 ring-slate-200" : "hover:bg-white text-slate-400"}`}

                      title="Ordenar por Importe"

                    >

                      <IconChart

                        size={12}

                        className={

                          sortConfig.key === "Importe(*)"

                            ? "text-emerald-600"

                            : ""

                        }

                      />

                    </button>

                  </div>

                  <button
                    onClick={() => { setTimeout(() => window.print(), 150); }}
                    className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg px-2.5 h-8 text-[10px] font-bold transition-all shadow-sm"
                    title="Imprimir Listado A4"
                  >
                    <IconPrinter size={12} />
                    <span>Imprimir A4</span>
                  </button>

              </div>

            </div>

            {/* Navigation Tabs */}

            <div className="flex gap-4 mb-3 border-b border-gray-300 overflow-x-auto items-center justify-between">

              <div className="flex gap-4">

                <button

                  onClick={() => setActiveTab("calendar")}

                  className={`pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === "calendar" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-500 transition"}`}

                >

                  <IconCalendar size={18} /> Calendario (Gantt)

                </button>

                <button

                  onClick={() => setActiveTab("groups")}

                  className={`pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === "groups" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-500 transition"}`}

                >

                  <IconGroup size={18} /> Por Grupos{" "}

                  <span className="text-[10px] bg-slate-100 px-1.5 rounded-full">

                    {groupedData.length}

                  </span>

                </button>

                <button

                  onClick={() => setActiveTab("segments")}

                  className={`pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === "segments" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-500 transition"}`}

                >

                  <IconChart size={18} /> Estudio & Segmentación

                </button>

                <button

                  onClick={() => window.location.href = 'Presupuestos.html'}

                  className="pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap text-gray-500 hover:text-indigo-600 transition"

                >

                  <IconFileInvoice size={18} /> Seg Presup{" "}

                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 rounded-full font-bold">

                    {data.filter(r => {
                      const est = (r.Estado || "").toUpperCase();
                      const intEst = (r.Com_Estado_Interno || "").toUpperCase();
                      const isBudget = String(r.Reserva || "").startsWith("PRES-") || est.includes("PRESUPUESTO") || intEst.includes("PRESUPUESTO") || intEst.includes("ENVIADO") || intEst.includes("SEGUIMIENTO") || intEst.includes("PENDIENTE");
                      if (!isBudget) return false;
                      
                      const isCancelled = ["CANCEL", "ANUL", "GASTOS", "DESESTIMADO", "BAJA"].some(status => intEst.includes(status) || est.includes(status));
                      const isConfirmed = intEst.includes("CONFIRM") || est.includes("CONFIRM");
                      const departureStr = r.Salida || r.Entrada || "";
                      const todayStr = new Date().toISOString().split('T')[0];
                      const isPast = departureStr && departureStr < todayStr;

                      return !isCancelled && !isConfirmed && !isPast;
                    }).length}

                  </span>

                </button>

                <button

                  onClick={() => window.location.href = 'Proformas.html'}

                  className="pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap text-gray-500 hover:text-emerald-600 transition"

                >

                  <IconFileInvoice size={18} /> Fac Prof.

                </button>

                <button

                  onClick={() => setActiveTab("table")}

                  className={`pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === "table" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-500 transition"}`}

                >

                  <IconTable size={18} /> Validación Importación{" "}

                  {(data || []).filter((r) => r._diff).length > 0 && (

                    <span className="ml-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>

                  )}

                </button>

                <button
                  onClick={() => setActiveTab("targets")}
                  className={`pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === "targets" ? "border-b-2 border-indigo-600 text-indigo-600 font-bold" : "text-gray-500 hover:text-indigo-600 transition"}`}
                >
                  <span className="text-base">🎯</span> Objetivos de Grupos
                </button>

              </div>

            </div>

            {/* --- CONTENT AREA --- */}

            {/* 1A. CALENDAR (GANTT) VIEW (Priority 1) */}

            {activeTab === "calendar" && (

              <div className="bg-white rounded-xl shadow p-4 overflow-hidden animate-fade-in">

                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">

                  <div>

                    <h3 className="text-lg font-bold text-slate-800">

                      Calendario de Ocupación (Próximos 90 Días)

                    </h3>

                    <div className="flex gap-2 text-xs mt-1">

                      <div className="flex items-center gap-1">

                        <div className="w-3 h-3 rounded bg-emerald-500"></div>{" "}

                        Confirmado

                      </div>

                      <div className="flex items-center gap-1">

                        <div className="w-3 h-3 rounded bg-indigo-500"></div>{" "}

                        Bloqueado

                      </div>

                      <div className="flex items-center gap-1">

                        <div className="w-3 h-3 rounded bg-amber-500"></div>{" "}

                        Prospecto/Pend.

                      </div>

                      <div className="flex items-center gap-1">

                        <div className="w-3 h-3 rounded bg-blue-400"></div>{" "}

                        Enviado

                      </div>

                      <div className="flex items-center gap-1">

                        <div className="w-3 h-3 rounded bg-red-400 opacity-50"></div>{" "}

                        Cancelado

                      </div>

                    </div>

                  </div>

                </div>

                <div

                  className="overflow-auto relative pb-4 custom-scrollbar"

                  style={{ maxHeight: "calc(100vh - 280px)" }}

                >

                  <div style={{ width: "3856px", minWidth: "3856px" }}>

                    {" "}

                    {/* 3600px grid + 256px sidebar */}

                    {/* Month Labels Row */}

                    <div className="flex border-b border-slate-100 sticky top-0 bg-white z-30">

                      <div className="w-64 shrink-0 bg-slate-50 border-r sticky left-0 z-40"></div>

                      <div className="flex" style={{ width: "3600px" }}>

                        {(() => {

                          const monthSpans = [];

                          let currentMonth = -1;

                          let currentSpan = null;

                          const monthNames = [

                            "ENE",

                            "FEB",

                            "MAR",

                            "ABR",

                            "MAY",

                            "JUN",

                            "JUL",

                            "AGO",

                            "SEP",

                            "OCT",

                            "NOV",

                            "DIC",

                          ];

                          const nowMonth = new Date();

                          for (let i = 0; i < 90; i++) {

                            const d = new Date(

                              nowMonth.getFullYear(),

                              nowMonth.getMonth(),

                              nowMonth.getDate(),

                            );

                            d.setDate(d.getDate() + i);

                            const m = d.getMonth();

                            if (m !== currentMonth) {

                              if (currentSpan) monthSpans.push(currentSpan);

                              currentMonth = m;

                              currentSpan = {

                                month: m,

                                year: d.getFullYear(),

                                label: `${monthNames[m]} ${d.getFullYear()}`,

                                count: 1,

                              };

                            } else {

                              currentSpan.count++;

                            }

                          }

                          if (currentSpan) monthSpans.push(currentSpan);

                          return monthSpans.map((ms, i) => (

                            <div

                              key={i}

                              style={{ width: `${ms.count * 40}px` }}

                              className="text-center text-[9px] font-black uppercase tracking-widest text-slate-500 py-1.5 border-r border-slate-200 bg-slate-50/80 shrink-0"

                            >

                              {ms.label}

                            </div>

                          ));

                        })()}

                      </div>

                    </div>

                    {/* Header Days */}

                    <div className="flex border-b border-slate-200 sticky top-[29px] bg-white z-20 shadow-sm">

                      <div className="w-64 p-2 font-bold text-[10px] text-slate-500 uppercase shrink-0 bg-slate-50 border-r sticky left-0 z-30 shadow-r flex items-center">

                        Grupo / Hotel

                      </div>

                      <div className="flex" style={{ width: "3600px" }}>

                        {Array.from({ length: 90 }).map((_, i) => {

                          const nowHeader = new Date();

                          const d = new Date(

                            nowHeader.getFullYear(),

                            nowHeader.getMonth(),

                            nowHeader.getDate(),

                          );

                          d.setDate(d.getDate() + i);

                          const isWeekend =

                            d.getDay() === 0 || d.getDay() === 6;

                          const isToday = i === 0;

                          const isFirstOfMonth = d.getDate() === 1;

                          return (

                            <div

                              key={i}

                              style={{ width: "40px" }}

                              className={`shrink-0 h-10 flex flex-col items-center justify-center border-r text-[10px] ${isFirstOfMonth ? "border-l-2 border-l-slate-300" : "border-slate-100"} ${isToday ? "bg-blue-50 border-blue-200" : isWeekend ? "bg-slate-50" : ""}`}

                            >

                              <span

                                className={`font-bold leading-none ${isToday ? "text-blue-600" : "text-slate-700"}`}

                              >

                                {d.getDate()}

                              </span>

                              <span

                                className={`text-[7px] uppercase leading-none mt-0.5 ${isToday ? "text-blue-500 font-bold" : "text-slate-400"}`}

                              >

                                {d

                                  .toLocaleDateString("es-ES", {

                                    weekday: "short",

                                  })

                                  .slice(0, 2)}

                              </span>

                            </div>

                          );

                        })}

                      </div>

                    </div>

                    {/* Body Rows */}

                    <div className="space-y-1 mt-1">

                      {(() => {

                        const now = new Date();

                        const todayGantt = new Date(

                          now.getFullYear(),

                          now.getMonth(),

                          now.getDate(),

                          0,

                          0,

                          0,

                          0,

                        );

                        return processedData.length === 0 ? (

                          <div className="p-12 text-center text-slate-400 flex flex-col items-center">

                            <IconCalendar

                              size={48}

                              className="mb-2 opacity-20"

                            />

                            <p>

                              No hay grupos para mostrar en este rango con los

                              filtros actuales.

                            </p>

                          </div>

                        ) : (

                          processedData.map((group, idx) => {

                            // Parse Dates Robustly: soporta seriales Excel, DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD

                            const parseDateGantt = (dStr) => {

                              if (!dStr) return null;

                              const s = dStr.toString().trim();

                              // Excel serial (ej: 46129)

                              const num = parseFloat(s);

                              if (!isNaN(num) && num > 40000 && num < 60000) {

                                const d = new Date(

                                  Math.round((num - 25569) * 86400 * 1000),

                                );

                                return new Date(

                                  d.getFullYear(),

                                  d.getMonth(),

                                  d.getDate(),

                                );

                              }

                              let d, m, y;

                              if (s.includes("-")) {

                                const parts = s.split("-");

                                if (parts[0].length <= 2) {

                                  [d, m, y] = parts;

                                } else {

                                  [y, m, d] = parts;

                                }

                              } else if (s.includes("/")) {

                                [d, m, y] = s.split("/");

                              } else if (s.includes(".")) {

                                [d, m, y] = s.split(".");

                              } else {

                                const dObj = new Date(s);

                                if (isNaN(dObj.getTime())) return null;

                                return new Date(

                                  dObj.getFullYear(),

                                  dObj.getMonth(),

                                  dObj.getDate(),

                                );

                              }

                              let yi = parseInt(y);

                              if (yi < 100) yi += 2000;

                              return new Date(

                                yi,

                                parseInt(m) - 1,

                                parseInt(d),

                              );

                            };

                            let start = parseDateGantt(group["Entrada"]);

                            let end = parseDateGantt(group["Salida"]);

                            if (!start) return null;

                            if (!end) end = new Date(start);

                            // Calculate Days from Today (index 0)

                            const startDiff = Math.round(

                              (start.getTime() - todayGantt.getTime()) /

                              (1000 * 60 * 60 * 24),

                            );

                            let duration = Math.round(

                              (end.getTime() - start.getTime()) /

                              (1000 * 60 * 60 * 24),

                            );

                            if (duration < 1) duration = 1;

                            // Skip if completely in past or too far future

                            if (startDiff + duration < 0 || startDiff > 90)

                              return null;

                            // Calculate Width/Position

                            let displayStart = startDiff;

                            let displayDuration = duration;

                            if (displayStart < 0) {

                              displayDuration += displayStart; // Reduce duration by days passed

                              displayStart = 0;

                            }

                            // Calculate pixel-based positions

                            const leftPx = displayStart * 40;

                            const widthPx = displayDuration * 40;

                            // Color Logic

                            const st = getStatusProps(

                              group["Com_Estado_Interno"] ||

                              group["Segment."],

                              group["Entrada"],

                              group["Estado"],

                            );

                            const colorClass = `${st.color} hover:brightness-110`;

                            return (

                              <div

                                key={idx}

                                className="flex border-b border-slate-50 hover:bg-slate-50 transition-colors group h-12 items-center"

                              >

                                <div className="w-64 px-3 py-2 text-xs font-medium text-slate-700 border-r border-slate-100 shrink-0 sticky left-0 bg-white z-10 group-hover:bg-slate-50 shadow-r h-full flex flex-col justify-center">

                                  <div className="truncate font-bold text-slate-800">

                                    {group["Nombre del Grupo"]}

                                  </div>

                                   <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-0.5">

                                     <IconBuildingSkyscraper size={10} />

                                     <span className="truncate max-w-[120px]">

                                       {normalizeHotelNameLocal(

                                         group["Hotel_Asignado"] ||

                                         group["Hotel"],

                                         "Sercotel Guadiana"

                                       )}

                                     </span>

                                     {group["Importe(*)"] && (() => {

                                       const total = parseNum(group["Importe(*)"]);

                                       const paid = parseNum(group["Com_Pagado"] || "0");

                                       const pending = total - paid;

                                       return (

                                         <span className="ml-auto flex flex-col items-end gap-0.5">

                                           <span className="text-emerald-600 font-bold">

                                             {new Intl.NumberFormat("es-ES", { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)} €

                                           </span>

                                           {pending > 0.05 && (

                                             <span className="text-rose-500 font-bold text-[8px]">

                                               {new Intl.NumberFormat("es-ES", { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pending)} € pdte.

                                             </span>

                                           )}

                                         </span>

                                       );

                                     })()}

                                   </div>

                                </div>

                                <div className="w-[3600px] shrink-0 relative h-full">

                                  {" "}

                                  {/* Row Track - Explicit width and relative for bars */}

                                  <div className="absolute inset-0 flex pointer-events-none">

                                    {Array.from({ length: 90 }).map(

                                      (_, i) => {

                                        const d = new Date(

                                          now.getFullYear(),

                                          now.getMonth(),

                                          now.getDate(),

                                        );

                                        d.setDate(d.getDate() + i);

                                        const isWeekend =

                                          d.getDay() === 0 ||

                                          d.getDay() === 6;

                                        return (

                                          <div

                                            key={i}

                                            style={{ width: "40px" }}

                                            className={`shrink-0 border-r border-slate-50 ${isWeekend ? "bg-slate-50/50" : ""}`}

                                          ></div>

                                        );

                                      },

                                    )}

                                  </div>

                                  {widthPx > 0 && (

                                    <div

                                      className={`absolute h-7 rounded-lg shadow-sm ${colorClass} text-white text-[9px] flex items-center px-3 whitespace-nowrap overflow-hidden cursor-pointer transition-all z-0 top-2.5`}

                                      style={{

                                        left: `${leftPx}px`,

                                        width: `${widthPx}px`,

                                        minWidth: "4px",

                                      }}

                                      onClick={() => openFicha(group)}

                                      title={`${group["Nombre del Grupo"]}\n${start.toLocaleDateString()} - ${end.toLocaleDateString()}\n${group["Pax."] || 0} Pax`}

                                    >

                                      <span className="font-bold truncate drop-shadow-md">

                                        {group["Nombre del Grupo"]}

                                      </span>

                                      {displayDuration > 5 && (

                                        <span className="opacity-80 ml-2 text-[8px] font-normal">

                                          {group["Pax."] || 0} Pax

                                        </span>

                                      )}

                                    </div>

                                  )}

                                </div>

                              </div>

                            );

                          })

                        );

                      })()}

                    </div>

                  </div>

                </div>

              </div>

            )}

            {/* 2B. BUDGET TRACKING */}

            {activeTab === "budgets" && (

              <BudgetManager

                data={data}

                openFicha={openFicha}

                formatDate={formatDate}

              />

            )}

            {/* 2. PANEL DE ESTUDIO Y SEGMENTACIÓN */}
            {activeTab === "segments" && (() => {
              const formatCurrency = (val) =>
                new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(val || 0);

              const formatAdr = (val) =>
                new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(val || 0);

              const CustomYoYTooltip = ({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;

                const isPax = chartMetric === "Pax";
                const curVal = isPax ? d.Pax : d.Ingresos;
                const prevVal = isPax ? d.PaxAnterior : d.IngresosAnterior;
                const diff = isPax ? d.diffPax : d.diffRevenue;
                const pct = isPax ? d.pctPax : d.pctRevenue;
                const isPositive = diff >= 0;

                return (
                  <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl text-xs border border-slate-700 min-w-[220px] space-y-2 z-50">
                    <div className="border-b border-slate-700 pb-1.5 flex justify-between items-center">
                      <span className="font-bold text-slate-100">
                        {d.monthLong} {d.year} vs {d.prevYear}
                      </span>
                      {showPrevYearComparison && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                            isPositive
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {isPositive ? "+" : ""}{pct}%
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
                          Año {d.year}:
                        </span>
                        <span className="font-bold text-white">
                          {isPax ? `${curVal.toLocaleString()} Pax` : formatCurrency(curVal)}
                        </span>
                      </div>
                      {showPrevYearComparison && (
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-sm bg-slate-400 inline-block"></span>
                            Año {d.prevYear}:
                          </span>
                          <span className="font-semibold text-slate-300">
                            {isPax ? `${prevVal.toLocaleString()} Pax` : formatCurrency(prevVal)}
                          </span>
                        </div>
                      )}
                      {showPrevYearComparison && (
                        <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-[11px]">
                          <span className="text-slate-400">Diferencia:</span>
                          <span className={`font-bold ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                            {isPositive ? "+" : ""}{isPax ? `${diff.toLocaleString()} Pax` : formatCurrency(diff)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="pt-1.5 border-t border-slate-800/80 flex justify-between text-[10px] text-slate-400">
                      <span>ADR: {formatAdr(d.ADR)}</span>
                      <span>Noches: {d.Noches}</span>
                    </div>
                  </div>
                );
              };

              const renderYoYBarChart = (heightClass = "h-96") => (
                <div
                  className={`bg-white p-5 rounded-xl shadow border border-slate-200 flex flex-col ${heightClass}`}
                  style={{ minHeight: "380px" }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <span>Ocupación de Grupos por Meses {studyYear === "all" ? "" : `(${studyYear})`}</span>
                        {showPrevYearComparison && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold border border-slate-200">
                            {studyYear === "all" ? "Comparativa Año Anterior" : `vs ${parseInt(studyYear) - 1}`}
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {chartMetric === "Pax"
                          ? `Plazas (Pax) reservadas por mes ${studyYear === "all" ? "" : `en ${studyYear}`}`
                          : `Ingresos totales (€) previstos por mes ${studyYear === "all" ? "" : `en ${studyYear}`}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                        <button
                          onClick={() => setChartMetric("Pax")}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            chartMetric === "Pax"
                              ? "bg-white text-emerald-600 shadow-sm font-extrabold"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Pax
                        </button>
                        <button
                          onClick={() => setChartMetric("Ingresos")}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            chartMetric === "Ingresos"
                              ? "bg-white text-emerald-600 shadow-sm font-extrabold"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          € Ingresos
                        </button>
                      </div>

                      <button
                        onClick={() => setShowPrevYearComparison(!showPrevYearComparison)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          showPrevYearComparison
                            ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                        title="Activar o desactivar barras del año anterior"
                      >
                        <span className={`w-2 h-2 rounded-full ${showPrevYearComparison ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`}></span>
                        Año -1
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-h-[300px] w-full" style={{ minHeight: "300px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.barData} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#64748b" }}
                          tickFormatter={(v) => (chartMetric === "Pax" ? `${v}` : `${Math.round(v / 1000)}k€`)}
                        />
                        <Tooltip content={<CustomYoYTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                          iconType="circle"
                          iconSize={8}
                        />
                        <Bar
                          name={chartMetric === "Pax" ? "Pax Actual" : "Ingresos Actual"}
                          dataKey={chartMetric === "Pax" ? "Pax" : "Ingresos"}
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={28}
                        />
                        {showPrevYearComparison && (
                          <Bar
                            name={chartMetric === "Pax" ? "Pax Año Ant." : "Ingresos Año Ant."}
                            dataKey={chartMetric === "Pax" ? "PaxAnterior" : "IngresosAnterior"}
                            fill="#94a3b8"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={28}
                          />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );

              return (
                <div className="animate-fade-in space-y-6">
                  {/* HEADER DEL PANEL DE ESTUDIO */}
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <IconChart size={22} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight flex items-center gap-2">
                          <span>Panel de Estudio & Rentabilidad</span>
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                            {studyYear === "all" ? "Todos los Años" : `Año ${studyYear}`}
                          </span>
                        </h2>
                        <p className="text-xs text-slate-500">
                          Estudio analítico de ocupación, comparativa año sobre año (YoY), rendimiento por comercial y precio medio (ADR)
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto">
                      {/* SELECTOR DE AÑO DE ESTUDIO */}
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200 shadow-inner">
                        <span className="text-[10px] font-black uppercase text-slate-400 pl-2 pr-1 tracking-wider">
                          Año:
                        </span>
                        {availableStudyYears.map((yr) => (
                          <button
                            key={yr}
                            onClick={() => setStudyYear(yr)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                              studyYear === yr
                                ? "bg-white text-blue-600 shadow-sm border border-slate-200/80 scale-105"
                                : "text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {yr}
                          </button>
                        ))}
                        <button
                          onClick={() => setStudyYear("all")}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            studyYear === "all"
                              ? "bg-white text-blue-600 shadow-sm border border-slate-200/80 scale-105"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Todos
                        </button>
                      </div>

                      {/* SUB-TABS NAVIGATION */}
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto">
                        <button
                          onClick={() => setStudySubTab("global")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                            studySubTab === "global"
                              ? "bg-white text-blue-600 shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                        <span>🌐</span> Visión Global
                      </button>
                      <button
                        onClick={() => setStudySubTab("fechas")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          studySubTab === "fechas"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <IconCalendar size={14} /> Por Fechas (YoY)
                      </button>
                      <button
                        onClick={() => setStudySubTab("comercial")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          studySubTab === "comercial"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <IconUsers size={14} /> Por Comercial
                      </button>
                      <button
                        onClick={() => setStudySubTab("precio_medio")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          studySubTab === "precio_medio"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <span>💶</span> Precio Medio (ADR)
                      </button>
                      <button
                        onClick={() => setStudySubTab("segmentos")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          studySubTab === "segmentos"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <IconPieChart size={14} /> Segmentos
                      </button>
                    </div>
                  </div>
                </div>

                {/* SUB-VIEW 1: GLOBAL */}
                  {studySubTab === "global" && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Top 5 KPI Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ingresos Totales</span>
                          <div className="text-lg font-black text-slate-800 mt-1">
                            {formatCurrency(globalStatsYoY.totalRev)}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                              globalStatsYoY.pctRev >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            }`}>
                              {globalStatsYoY.pctRev >= 0 ? "+" : ""}{globalStatsYoY.pctRev}%
                            </span>
                            <span className="text-[10px] text-slate-400">vs año ant.</span>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pax Totales</span>
                          <div className="text-lg font-black text-slate-800 mt-1">
                            {globalStatsYoY.totalPax.toLocaleString()} Pax
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                              globalStatsYoY.pctPax >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            }`}>
                              {globalStatsYoY.pctPax >= 0 ? "+" : ""}{globalStatsYoY.pctPax}%
                            </span>
                            <span className="text-[10px] text-slate-400">vs año ant.</span>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ADR Medio Hab.</span>
                          <div className="text-lg font-black text-emerald-600 mt-1">
                            {formatAdr(globalStatsYoY.adr)}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                              globalStatsYoY.pctAdr >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                            }`}>
                              {globalStatsYoY.pctAdr >= 0 ? "+" : ""}{globalStatsYoY.pctAdr}%
                            </span>
                            <span className="text-[10px] text-slate-400">ant: {formatAdr(globalStatsYoY.prevAdr)}</span>
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Precio Medio / Pax</span>
                          <div className="text-lg font-black text-blue-600 mt-1">
                            {formatAdr(globalStatsYoY.pricePerPax)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1.5">
                            Año ant: {formatAdr(globalStatsYoY.prevPricePerPax)}
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 col-span-2 md:col-span-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Volumen</span>
                          <div className="text-lg font-black text-purple-600 mt-1">
                            {globalStatsYoY.totalGroups} Grupos
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1.5">
                            {(globalStatsYoY.totalRoomNights || globalStatsYoY.totalNights).toLocaleString()} Hab. Noches
                          </div>
                        </div>
                      </div>

                      {/* Main 2 Charts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {renderYoYBarChart("h-96")}

                        {/* Ingresos por Segmento */}
                        <div className="bg-white p-5 rounded-xl shadow border border-slate-200 h-96 flex flex-col" style={{ minHeight: "380px" }}>
                          <div className="mb-3">
                            <h3 className="text-base font-bold text-slate-800">
                              Ingresos por Segmento {studyYear === "all" ? "" : `(${studyYear})`}
                            </h3>
                            <p className="text-[11px] text-slate-500">Distribución de facturación según categoría</p>
                          </div>
                          {segmentStats.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs italic">
                              No hay datos de segmentos disponibles
                            </div>
                          ) : (
                            <div className="flex-1 min-h-[300px] w-full" style={{ minHeight: "300px" }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={segmentStats} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                  <XAxis type="number" hide />
                                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "#64748b" }} interval={0} />
                                  <Tooltip formatter={(value) => formatCurrency(value)} />
                                  <Bar dataKey="revenue" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                    {segmentStats.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mini Rankings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Top Comerciales */}
                        <div className="bg-white rounded-xl shadow border border-slate-200 p-5">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                              <IconUsers size={16} className="text-blue-600" />
                              Top Comerciales
                            </h4>
                            <button
                              onClick={() => setStudySubTab("comercial")}
                              className="text-xs text-blue-600 hover:underline font-bold"
                            >
                              Ver estudio completo →
                            </button>
                          </div>
                          <div className="space-y-2.5">
                            {commercialStats.slice(0, 4).map((c, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${getCommColor(c.name)}`}></span>
                                  <span className="font-bold text-xs text-slate-700">{c.name}</span>
                                  <span className="text-[10px] bg-white border px-1.5 py-0.5 rounded text-slate-500 font-semibold">
                                    {c.groupCount} grp
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-extrabold text-xs text-slate-800">{formatCurrency(c.revenue)}</div>
                                  <div className="text-[10px] text-emerald-600 font-bold">ADR: {formatAdr(c.adr)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Resumen Precios Medios & Ocupación */}
                        <div className="bg-white rounded-xl shadow border border-slate-200 p-5">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                              <span className="text-emerald-600 font-bold">💶</span>
                              Métricas Clave de Precios & Estancia
                            </h4>
                            <button
                              onClick={() => setStudySubTab("precio_medio")}
                              className="text-xs text-blue-600 hover:underline font-bold"
                            >
                              Ver análisis de precios →
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">ADR Global Ponderado</div>
                              <div className="text-base font-black text-emerald-600 mt-0.5">{formatAdr(globalStatsYoY.adr)}</div>
                              <div className="text-[10px] text-slate-500">Por habitación/noche</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Precio Medio / Persona</div>
                              <div className="text-base font-black text-blue-600 mt-0.5">{formatAdr(globalStatsYoY.pricePerPax)}</div>
                              <div className="text-[10px] text-slate-500">Por asistente (Pax)</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Facturación / Grupo</div>
                              <div className="text-base font-black text-slate-800 mt-0.5">
                                {globalStatsYoY.totalGroups > 0 ? formatCurrency(globalStatsYoY.totalRev / globalStatsYoY.totalGroups) : "0 €"}
                              </div>
                              <div className="text-[10px] text-slate-500">Ticket medio por grupo</div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Noches / Grupo</div>
                              <div className="text-base font-black text-purple-600 mt-0.5">
                                {globalStatsYoY.totalGroups > 0 ? (globalStatsYoY.totalNights / globalStatsYoY.totalGroups).toFixed(1) : "0"} Noches
                              </div>
                              <div className="text-[10px] text-slate-500">Estancia media por grupo</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-VIEW 2: POR FECHAS (YOY) */}
                  {studySubTab === "fechas" && (
                    <div className="space-y-6 animate-fade-in">
                      {renderYoYBarChart("h-96")}

                      {/* Tabla Comparativa Mensual Detallada */}
                      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">
                              Evolución Mensual Detallada y Comparativa Año sobre Año (YoY)
                            </h3>
                            <p className="text-xs text-slate-500">Datos mes a mes de Ocupación (Pax), Ingresos y Precio Medio (ADR)</p>
                          </div>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="p-3">Mes</th>
                                <th className="p-3 text-right">Pax Actual</th>
                                <th className="p-3 text-right">Pax Año Ant.</th>
                                <th className="p-3 text-right">Var. Pax</th>
                                <th className="p-3 text-right">Ingresos Actual</th>
                                <th className="p-3 text-right">Ingresos Año Ant.</th>
                                <th className="p-3 text-right">Var. Ingresos</th>
                                <th className="p-3 text-right">ADR Actual</th>
                                <th className="p-3 text-right">ADR Año Ant.</th>
                                <th className="p-3 text-right">Var. ADR</th>
                                <th className="p-3 text-right"># Grupos</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {chartData.barData.map((m, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-3 font-bold text-slate-800">
                                    {m.monthLong} {m.year}
                                    <span className="text-[10px] text-slate-400 block font-normal">vs {m.monthLong} {m.prevYear}</span>
                                  </td>
                                  <td className="p-3 text-right font-bold text-slate-700">{m.Pax.toLocaleString()}</td>
                                  <td className="p-3 text-right text-slate-400">{m.PaxAnterior.toLocaleString()}</td>
                                  <td className="p-3 text-right">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                      m.diffPax >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                    }`}>
                                      {m.diffPax >= 0 ? "+" : ""}{m.pctPax}%
                                    </span>
                                  </td>
                                  <td className="p-3 text-right font-bold text-slate-800">{formatCurrency(m.Ingresos)}</td>
                                  <td className="p-3 text-right text-slate-400">{formatCurrency(m.IngresosAnterior)}</td>
                                  <td className="p-3 text-right">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                      m.diffRevenue >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                    }`}>
                                      {m.diffRevenue >= 0 ? "+" : ""}{m.pctRevenue}%
                                    </span>
                                  </td>
                                  <td className="p-3 text-right font-bold text-emerald-600">{formatAdr(m.ADR)}</td>
                                  <td className="p-3 text-right text-slate-400">{formatAdr(m.ADRAnterior)}</td>
                                  <td className="p-3 text-right">
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                      m.diffAdr >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                    }`}>
                                      {m.diffAdr >= 0 ? "+" : ""}{m.pctAdr}%
                                    </span>
                                  </td>
                                  <td className="p-3 text-right font-bold text-blue-600">{m.Grupos}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-VIEW 3: POR COMERCIAL */}
                  {studySubTab === "comercial" && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Gráfico de Ingresos por Comercial */}
                        <div className="bg-white p-5 rounded-xl shadow border border-slate-200 h-96 flex flex-col" style={{ minHeight: "360px" }}>
                          <h3 className="text-base font-bold text-slate-800 mb-1">
                            Facturación por Comercial (€) {studyYear === "all" ? "(Todos los Años)" : `— Año ${studyYear}`}
                          </h3>
                          <p className="text-[11px] text-slate-500 mb-3">
                            Volumen de ventas cerrado por comercial en {studyYear === "all" ? "todos los periodos" : `el año ${studyYear}`}
                          </p>
                          <div className="flex-1 min-h-[280px] w-full" style={{ minHeight: "280px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={commercialStats} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} interval={0} />
                                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `${Math.round(v / 1000)}k€`} />
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                <Bar dataKey="revenue" name="Ingresos" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                  {commercialStats.map((entry, index) => (
                                    <Cell key={`comm-rev-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Gráfico de ADR por Comercial */}
                        <div className="bg-white p-5 rounded-xl shadow border border-slate-200 h-96 flex flex-col" style={{ minHeight: "360px" }}>
                          <h3 className="text-base font-bold text-slate-800 mb-1">
                            Precio Medio (ADR) por Comercial {studyYear === "all" ? "(Todos los Años)" : `— Año ${studyYear}`}
                          </h3>
                          <p className="text-[11px] text-slate-500 mb-3">
                            ADR medio conseguido (€/habitación/noche) en {studyYear === "all" ? "todos los periodos" : `el año ${studyYear}`}
                          </p>
                          <div className="flex-1 min-h-[280px] w-full" style={{ minHeight: "280px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={commercialStats} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} interval={0} />
                                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `${v}€`} />
                                <Tooltip formatter={(v) => formatAdr(v)} />
                                <Bar dataKey="adr" name="ADR Medio" fill="#10b981" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Tabla Completa de Rendimiento Comercial */}
                      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b bg-slate-50">
                          <h3 className="text-sm font-bold text-slate-800">
                            Tabla Detallada de Rendimiento por Comercial {studyYear === "all" ? "(Todos los Años)" : `— Producción Año ${studyYear}`}
                          </h3>
                          <p className="text-xs text-slate-500">Métricas comparativas de volumen, pax, precios medios y cuota de ventas</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="p-3">Comercial</th>
                                <th className="p-3 text-right"># Grupos</th>
                                <th className="p-3 text-right">Pax Total</th>
                                <th className="p-3 text-right">Hab. Noches</th>
                                <th className="p-3 text-right">Ingresos Totales</th>
                                <th className="p-3 text-right">Cuota Mercado</th>
                                <th className="p-3 text-right">ADR Medio</th>
                                <th className="p-3 text-right">Precio / Pax</th>
                                <th className="p-3 text-right">Ticket Medio / Grupo</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {commercialStats.map((c, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${getCommColor(c.name)}`}></span>
                                    {c.name}
                                  </td>
                                  <td className="p-3 text-right font-bold text-blue-600">{c.groupCount}</td>
                                  <td className="p-3 text-right">{c.pax.toLocaleString()}</td>
                                  <td className="p-3 text-right font-semibold text-slate-700">{(c.roomNights > 0 ? c.roomNights : c.nights).toLocaleString()}</td>
                                  <td className="p-3 text-right font-bold text-slate-800">{formatCurrency(c.revenue)}</td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, c.share)}%` }}></div>
                                      </div>
                                      <span className="font-semibold text-[11px]">{c.share}%</span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-right font-bold text-emerald-600">{formatAdr(c.adr)}</td>
                                  <td className="p-3 text-right font-medium text-slate-700">{formatAdr(c.pricePerPax)}</td>
                                  <td className="p-3 text-right text-slate-600">
                                    {c.groupCount > 0 ? formatCurrency(c.revenue / c.groupCount) : "0 €"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-VIEW 4: PRECIO MEDIO (ADR) */}
                  {studySubTab === "precio_medio" && (
                    <div className="space-y-6 animate-fade-in">
                      {/* Top 4 ADR KPIs */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ADR Medio Global</span>
                          <div className="text-2xl font-black text-emerald-600 mt-1">{formatAdr(globalStatsYoY.adr)}</div>
                          <div className="text-[11px] text-slate-500 mt-1">Año anterior: {formatAdr(globalStatsYoY.prevAdr)} ({globalStatsYoY.pctAdr >= 0 ? "+" : ""}{globalStatsYoY.pctAdr}%)</div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Precio Medio por Pax</span>
                          <div className="text-2xl font-black text-blue-600 mt-1">{formatAdr(globalStatsYoY.pricePerPax)}</div>
                          <div className="text-[11px] text-slate-500 mt-1">Año anterior: {formatAdr(globalStatsYoY.prevPricePerPax)}</div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Segmento en ADR</span>
                          <div className="text-lg font-black text-slate-800 mt-1 truncate">
                            {(() => {
                              const topSeg = segmentStats
                                .slice()
                                .filter((s) => (s.roomNights > 0 || s.nights > 0))
                                .sort((a, b) => b.adr - a.adr)[0];
                              return topSeg ? `${topSeg.name}` : "N/D";
                            })()}
                          </div>
                          <div className="text-[11px] text-emerald-600 font-bold mt-1">
                            {(() => {
                              const topSeg = segmentStats
                                .slice()
                                .filter((s) => (s.roomNights > 0 || s.nights > 0))
                                .sort((a, b) => b.adr - a.adr)[0];
                              return topSeg ? `${formatAdr(topSeg.adr)}/hab` : "-";
                            })()}
                          </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Comercial en ADR</span>
                          <div className="text-lg font-black text-slate-800 mt-1 truncate">
                            {commercialStats.slice().filter((c) => (c.roomNights > 0 || c.nights > 0)).sort((a, b) => b.adr - a.adr)[0]?.name || "N/D"}
                          </div>
                          <div className="text-[11px] text-emerald-600 font-bold mt-1">
                            {formatAdr(commercialStats.slice().filter((c) => (c.roomNights > 0 || c.nights > 0)).sort((a, b) => b.adr - a.adr)[0]?.adr || 0)}/hab
                          </div>
                        </div>
                      </div>

                      {/* Gráfico de Evolución del ADR por Mes */}
                      <div className="bg-white p-5 rounded-xl shadow border border-slate-200 h-96 flex flex-col" style={{ minHeight: "380px" }}>
                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <h3 className="text-base font-bold text-slate-800">
                              Evolución del Precio Medio (ADR) por Mes {studyYear === "all" ? "(Todos los Años)" : `— Año ${studyYear}`}
                            </h3>
                            <p className="text-[11px] text-slate-500">
                              {studyYear === "all"
                                ? "Comparativa de ADR (€/habitación/noche) acumulado"
                                : `Comparativa de ADR (€/habitación/noche) del año ${studyYear} respecto al año anterior (${parseInt(studyYear) - 1})`}
                            </p>
                          </div>
                        </div>
                        <div className="flex-1 min-h-[300px] w-full" style={{ minHeight: "300px" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(v) => `${v}€`} />
                              <Tooltip
                                formatter={(val, name) => [`${formatAdr(val)}`, name]}
                                labelFormatter={(label) => `Mes: ${label}`}
                              />
                              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} iconType="circle" iconSize={8} />
                              <Bar name="ADR Actual (€)" dataKey="ADR" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                              <Bar name="ADR Año Anterior (€)" dataKey="ADRAnterior" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* 2 Rankings: Segmento y Comercial */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ranking ADR por Segmento */}
                        <div className="bg-white rounded-xl shadow border border-slate-200 p-5">
                          <h4 className="font-bold text-slate-800 text-sm mb-3">
                            Ranking de ADR por Segmento {studyYear === "all" ? "(Todos los Años)" : `— Año ${studyYear}`}
                          </h4>
                          <div className="space-y-2.5">
                            {segmentStats
                              .slice()
                              .filter((s) => (s.roomNights > 0 || s.nights > 0))
                              .sort((a, b) => b.adr - a.adr)
                              .map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                    <span className="font-bold text-xs text-slate-700">{s.name}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-extrabold text-sm text-emerald-600">{formatAdr(s.adr)}/hab</span>
                                    <span className="text-[10px] text-slate-400 block">{s.roomNights > 0 ? `${s.roomNights.toLocaleString()} hab-noches` : `${s.nights} noches`} · {formatCurrency(s.revenue)}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Ranking ADR por Comercial */}
                        <div className="bg-white rounded-xl shadow border border-slate-200 p-5">
                          <h4 className="font-bold text-slate-800 text-sm mb-3">
                            Ranking de ADR por Comercial {studyYear === "all" ? "(Todos los Años)" : `— Año ${studyYear}`}
                          </h4>
                          <div className="space-y-2.5">
                            {commercialStats
                              .slice()
                              .filter((c) => (c.roomNights > 0 || c.nights > 0))
                              .sort((a, b) => b.adr - a.adr)
                              .map((c, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${getCommColor(c.name)}`}></span>
                                    <span className="font-bold text-xs text-slate-700">{c.name}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-extrabold text-sm text-emerald-600">{formatAdr(c.adr)}/hab</span>
                                    <span className="text-[10px] text-slate-400 block">{c.roomNights > 0 ? `${c.roomNights.toLocaleString()} hab-noches` : `${c.nights} noches`} · {formatCurrency(c.revenue)}</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-VIEW 5: SEGMENTOS (EXISTENTE MEJORADA) */}
                  {studySubTab === "segmentos" && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Ingresos por Segmento */}
                        <div className="bg-white p-5 rounded-xl shadow border border-slate-200 h-96 flex flex-col" style={{ minHeight: "380px" }}>
                          <h3 className="text-base font-bold text-slate-800 mb-1">
                            Ingresos por Segmento {studyYear === "all" ? "(Todos los Años)" : `— Año ${studyYear}`}
                          </h3>
                          <p className="text-[11px] text-slate-500 mb-3">
                            Distribución de ingresos totales por categoría en {studyYear === "all" ? "todos los periodos" : `el año ${studyYear}`}
                          </p>
                          {segmentStats.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs italic">
                              No hay datos de segmentos disponibles
                            </div>
                          ) : (
                            <div className="flex-1 min-h-[300px] w-full" style={{ minHeight: "300px" }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={segmentStats} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                  <XAxis type="number" hide />
                                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10, fill: "#64748b" }} interval={0} />
                                  <Tooltip formatter={(value) => formatCurrency(value)} />
                                  <Bar dataKey="revenue" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                    {segmentStats.map((entry, index) => (
                                      <Cell key={`cell-seg-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>

                        {/* Ocupación con Comparativa YoY */}
                        {renderYoYBarChart("h-96")}
                      </div>

                      {/* Detailed Table */}
                      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b bg-slate-50">
                          <h3 className="text-sm font-bold text-slate-800">
                            Tabla de Rentabilidad por Segmento {studyYear === "all" ? "(Todos los Años)" : `— Año ${studyYear}`}
                          </h3>
                          <p className="text-xs text-slate-500">Haz clic en cada segmento para ver el desglose de grupos asociados</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="p-3 w-10"></th>
                                <th className="p-3">Segmento</th>
                                <th className="p-3 text-right"># Grupos</th>
                                <th className="p-3 text-right">Pax Total</th>
                                <th className="p-3 text-right">Hab. Noches</th>
                                <th className="p-3 text-right">Ingresos Totales</th>
                                <th className="p-3 text-right">ADR Medio</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {segmentStats.map((seg, idx) => (
                                <React.Fragment key={idx}>
                                  <tr
                                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() =>
                                      setExpandedSegment(
                                        expandedSegment === seg.name ? null : seg.name
                                      )
                                    }
                                  >
                                    <td className="p-3 text-center text-gray-400">
                                      {expandedSegment === seg.name ? (
                                        <IconChevronUp size={16} />
                                      ) : (
                                        <IconChevronDown size={16} />
                                      )}
                                    </td>
                                    <td className="p-3 font-medium text-slate-800 flex items-center gap-2">
                                      <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                      ></span>
                                      {seg.name}
                                    </td>
                                    <td className="p-3 text-right font-bold text-blue-600">
                                      {seg.groupCount}
                                    </td>
                                    <td className="p-3 text-right">{seg.pax.toLocaleString()}</td>
                                    <td className="p-3 text-right font-semibold text-slate-700">{(seg.roomNights > 0 ? seg.roomNights : seg.nights).toLocaleString()}</td>
                                    <td className="p-3 text-right font-bold text-slate-700">
                                      {formatCurrency(seg.revenue)}
                                    </td>
                                    <td className="p-3 text-right text-emerald-600 font-bold">
                                      {formatAdr(seg.adr)}
                                    </td>
                                  </tr>
                                  {expandedSegment === seg.name && (
                                    <tr>
                                      <td colSpan="7" className="p-0 bg-slate-50">
                                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                          {seg.groups.map((group, gIdx) => {
                                            const groupObj = group.obj;
                                            const isTanteo =
                                              seg.name === "GRUPO TANTEO" ||
                                              (groupObj?.records?.[0]?.["Segment."] || "").toUpperCase() === "GRTANTEO";
                                            const arrivalDate = group.arrival;
                                            const today = new Date();
                                            const arrival = new Date(toInputDate(arrivalDate));
                                            const diffDays = Math.ceil((arrival - today) / (1000 * 60 * 60 * 24));
                                            const isUrgent = isTanteo && diffDays >= 0 && diffDays <= 30;
                                            return (
                                              <div
                                                key={gIdx}
                                                onClick={() => groupObj && openFicha(groupObj)}
                                                className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                                              >
                                                <div className="flex justify-between items-center mb-1">
                                                  <span className="text-[10px] font-black text-slate-400 tracking-wider">
                                                    #{groupObj?.records[0]?.["Reserva"] || "-"}
                                                  </span>
                                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                                    {formatCurrency(groupObj?.totalRevenue)}
                                                  </span>
                                                </div>
                                                <div className="font-bold text-slate-800 truncate text-xs group-hover:text-blue-600">
                                                  {group.name}
                                                </div>
                                                <div className="text-[10px] text-slate-400 flex justify-between mt-1 pt-1 border-t border-slate-100">
                                                  <span>{formatDate(arrivalDate)}</span>
                                                  <span>{groupObj?.totalPax || 0} Pax</span>
                                                </div>
                                                {isUrgent && (
                                                  <div className="mt-1 bg-amber-50 text-amber-700 text-[9px] px-1 py-0.5 rounded font-bold text-center border border-amber-200">
                                                    ⚠️ Tanteo próximo ({diffDays}d)
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            
            {/* 3. GROUP DIRECTORY, OCCUPANCY & ECONOMIC BREAKDOWN (Reqs 12-21) */}
            {activeTab === "groups" && (
              <div className="animate-fade-in space-y-4">
                {/* SUB-VIEW SWITCHER & PRICING CONFIG TOOLBAR */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGroupsSubView("groups")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        groupsSubView === "groups"
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Directorio de Grupos (Listado)
                      <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                        groupsSubView === "groups" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                      }`}>
                        {groupedData.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroupsSubView("daily")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        groupsSubView === "daily"
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Distribución Diaria y Económica
                      <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                        groupsSubView === "daily" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                      }`}>
                        {dailyGroupingMode === "reserva" ? groupedDailyOccupancyByReserva.length : filteredDailyOccupancy.length}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {groupsSubView === "daily" && (
                      <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
                        <button
                          type="button"
                          onClick={() => setDailyViewSection("breakdown")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            dailyViewSection === "breakdown"
                              ? "bg-white text-slate-800 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          📋 Desglose Diario
                        </button>
                        <button
                          type="button"
                          onClick={() => setDailyViewSection("statistics")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            dailyViewSection === "statistics"
                              ? "bg-white text-slate-800 shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          📊 Estadísticas Económicas (Req 19-21)
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const curDef = boardPricingConfig[dailyHotelFilter] || boardPricingConfig.default || { breakfast: 6.0, meal: 16.0 };
                        setEditingBoardPrices({
                          hotel: dailyHotelFilter || "default",
                          breakfast: curDef.breakfast,
                          meal: curDef.meal
                        });
                        setShowBoardPricingModal(true);
                      }}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      title="Configurar precios de desayuno y comidas por hotel"
                    >
                      <span>⚙️</span> Precios Manutención
                    </button>
                  </div>
                </div>

                {/* VISTA 1: DISTRIBUCIÓN DIARIA Y ECONÓMICA */}
                {groupsSubView === "daily" && (
                  <div className="space-y-4">
                    {/* KPI CARDS (HABITACIONES + ECONÓMICOS) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Pax</div>
                        <div className="text-xl font-black text-slate-800 mt-1">{dailyReportTotals.totalPaxConfirmados || 0}</div>
                        <div className="text-[10px] text-slate-400">personas/día</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
                        <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Hab. Confirmadas</div>
                        <div className="text-xl font-black text-blue-700 mt-1">{dailyReportTotals.totalHabitacionesConfirmadas || 0}</div>
                        <div className="text-[10px] text-blue-500">definitivas</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
                        <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Ingreso Total</div>
                        <div className="text-lg font-black text-emerald-800 mt-1">
                          {(dailyEconomicStats?.totalRevenue || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                        </div>
                        <div className="text-[10px] text-emerald-600">aloj. + manutención</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
                        <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Alojamiento Neto</div>
                        <div className="text-lg font-black text-blue-800 mt-1">
                          {(dailyEconomicStats?.totalAccommodationNet || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                        </div>
                        <div className="text-[10px] text-blue-600">descontada manut.</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Desayunos</div>
                        <div className="text-lg font-black text-slate-800 mt-1">
                          {(dailyEconomicStats?.totalBreakfastRevenue || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                        </div>
                        <div className="text-[10px] text-slate-400">6,00 € / pax</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Comidas</div>
                        <div className="text-lg font-black text-slate-800 mt-1">
                          {(dailyEconomicStats?.totalMealsRevenue || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                        </div>
                        <div className="text-[10px] text-slate-400">16,00 € / comida</div>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ADR Medio</div>
                        <div className="text-lg font-black text-slate-800 mt-1">
                          {(dailyEconomicStats?.adr || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                        </div>
                        <div className="text-[10px] text-slate-400">por hab-noche</div>
                      </div>
                      <div className={`p-3 rounded-xl border shadow-sm ${
                        (dailyReportTotals.registrosRevisionNecesaria || 0) > 0 || (dailyEconomicStats?.negativeAlertCount || 0) > 0
                          ? "bg-rose-50 border-rose-300"
                          : "bg-slate-50 border-slate-200"
                      }`}>
                        <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Revisión / Alertas</div>
                        <div className="text-lg font-black text-rose-800 mt-1">
                          {(dailyReportTotals.registrosRevisionNecesaria || 0) + (dailyEconomicStats?.negativeAlertCount || 0)}
                        </div>
                        <div className="text-[10px] text-rose-600">
                          {dailyReportTotals.registrosRevisionNecesaria || 0} cambio(s) origen
                        </div>
                      </div>
                    </div>

                    {/* VISTA SUB-SECCIÓN: ESTADÍSTICAS ECONÓMICAS Y POR CATEGORÍA (Req 19 y 21) */}
                    {dailyViewSection === "statistics" && (
                      <div className="space-y-4">
                        {/* REQUISITO 21: CRITERIO PARA ESTADÍSTICAS POR CATEGORÍA */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <span>🛏️</span> Estadísticas de Alojamiento por Categoría de Habitación (Requisito 21)
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Calculado a partir de las habitaciones-noche y el precio medio de alojamiento neto (ADR = {(dailyEconomicStats?.adr || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}/hab-noche).
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Reparto estadístico estimado
                            </span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                                  <th className="px-3 py-2.5">Categoría</th>
                                  <th className="px-3 py-2.5 text-center">Habitaciones-Noche</th>
                                  <th className="px-3 py-2.5 text-center">% Ocupación</th>
                                  <th className="px-3 py-2.5 text-right">Precio Medio / Hab-Noche</th>
                                  <th className="px-3 py-2.5 text-right">Ingreso Estimado</th>
                                  <th className="px-3 py-2.5 text-center">Tipo de Reparto</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {(() => {
                                  const cStats = dailyEconomicStats?.categoryStatsConfirmed;
                                  const cats = [
                                    { name: "Individuales (1 pax)", key: "individuales", icon: "👤" },
                                    { name: "Dobles (2 pax)", key: "dobles", icon: "👥" },
                                    { name: "Triples (3 pax)", key: "triples", icon: "👨‍👩‍👧" },
                                    { name: "Cuádruples (4 pax)", key: "cuadruples", icon: "👨‍👩‍👧‍👦" }
                                  ];
                                  const totNights = cStats?.totalRoomNights || 1;

                                  return cats.map(cat => {
                                    const data = cStats?.categories?.[cat.key] || { roomNights: 0, revenue: 0, tag: "Reparto estadístico estimado" };
                                    const pct = ((data.roomNights / totNights) * 100).toFixed(1);
                                    return (
                                      <tr key={cat.key} className="hover:bg-slate-50">
                                        <td className="px-3 py-2.5 font-bold text-slate-800">
                                          <span className="mr-1.5">{cat.icon}</span> {cat.name}
                                        </td>
                                        <td className="px-3 py-2.5 text-center font-bold text-slate-700">{data.roomNights}</td>
                                        <td className="px-3 py-2.5 text-center text-slate-500">{pct}%</td>
                                        <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                                          {(cStats?.avgRoomPrice || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-700">
                                          {(data.revenue || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                            {data.tag}
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  });
                                })()}
                                <tr className="bg-slate-50 font-black border-t-2 border-slate-200 text-slate-900">
                                  <td className="px-3 py-2.5">Total General de Habitaciones</td>
                                  <td className="px-3 py-2.5 text-center text-blue-700 font-bold">
                                    {dailyEconomicStats?.categoryStatsConfirmed?.totalRoomNights || 0}
                                  </td>
                                  <td className="px-3 py-2.5 text-center">100.0%</td>
                                  <td className="px-3 py-2.5 text-right font-mono">
                                    {(dailyEconomicStats?.categoryStatsConfirmed?.avgRoomPrice || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                  </td>
                                  <td className="px-3 py-2.5 text-right font-mono font-black text-emerald-700">
                                    {(dailyEconomicStats?.categoryStatsConfirmed?.netAccommodationTotal || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                  </td>
                                  <td className="px-3 py-2.5 text-center text-slate-400 text-[10px]">Alojamiento Neto</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* REQUISITO 19: DESGLOSE ECONÓMICO POR RÉGIMEN */}
                        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                          <div className="border-b border-slate-100 pb-3">
                            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                              <span>🍽️</span> Desglose Económico por Régimen de Alojamiento (HA, HD, MP, PC)
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Desglose de ingresos por régimen descontando el coste de manutención según personas reales alojadas.
                            </p>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                                  <th className="px-3 py-2.5">Régimen</th>
                                  <th className="px-3 py-2.5 text-center">Personas (Pax)</th>
                                  <th className="px-3 py-2.5 text-center">Hab-Noches</th>
                                  <th className="px-3 py-2.5 text-right">Desayunos</th>
                                  <th className="px-3 py-2.5 text-right">Comidas</th>
                                  <th className="px-3 py-2.5 text-right">Alojamiento Neto</th>
                                  <th className="px-3 py-2.5 text-right">Ingreso Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {["HA", "HD", "MP", "PC"].map(reg => {
                                  const rData = dailyEconomicStats?.byRegimen?.[reg] || { pax: 0, roomNights: 0, breakfast: 0, meals: 0, netAccommodation: 0, revenue: 0 };
                                  const labels = {
                                    HA: "Solo Alojamiento (0 desayunos, 0 comidas)",
                                    HD: "Alojamiento y Desayuno (1 desayuno)",
                                    MP: "Media Pensión (1 desayuno, 1 comida)",
                                    PC: "Pensión Completa (1 desayuno, 2 comidas)"
                                  };
                                  return (
                                    <tr key={reg} className="hover:bg-slate-50">
                                      <td className="px-3 py-2.5 font-bold text-slate-800">
                                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs mr-2 font-bold">{reg}</span>
                                        <span className="text-slate-500 font-normal text-[11px]">{labels[reg]}</span>
                                      </td>
                                      <td className="px-3 py-2.5 text-center font-bold text-slate-700">{rData.pax}</td>
                                      <td className="px-3 py-2.5 text-center text-slate-600">{rData.roomNights}</td>
                                      <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                                        {(rData.breakfast || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                      </td>
                                      <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                                        {(rData.meals || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                      </td>
                                      <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-700">
                                        {(rData.netAccommodation || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                      </td>
                                      <td className="px-3 py-2.5 text-right font-mono font-black text-emerald-700">
                                        {(rData.revenue || 0).toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VISTA SUB-SECCIÓN: DESGLOSE DIARIO TABLA (Req 18) */}
                    {dailyViewSection === "breakdown" && (
                      <div className="space-y-4">
                        {/* FILTROS DE LA DISTRIBUCIÓN DIARIA */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                          <div className="flex flex-wrap gap-3 items-center text-xs">
                            <div className="flex items-center gap-1.5">
                              <label className="font-bold text-slate-500">Hotel:</label>
                              <select
                                value={dailyHotelFilter}
                                onChange={(e) => setDailyHotelFilter(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                              >
                                <option value="">Todos los hoteles</option>
                                {dailyHotelOptions.map(h => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <label className="font-bold text-slate-500">Reserva:</label>
                              <select
                                value={dailyStatusFilter}
                                onChange={(e) => setDailyStatusFilter(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                              >
                                <option value="confirmada">Confirmadas (no anuladas)</option>
                                <option value="todos">Todas (incluye anuladas)</option>
                                <option value="anulada">Solo anuladas</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <label className="font-bold text-slate-500">Distribución:</label>
                              <select
                                value={dailyDistributionFilter}
                                onChange={(e) => setDailyDistributionFilter(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                              >
                                <option value="requieren_atencion">⚠️ Requieren atención</option>
                                <option value="todos">Todos los estados</option>
                                <option value="revision_necesaria">⚠️ Revisión necesaria</option>
                                <option value="propuesta">Propuesta automática</option>
                                <option value="pendiente">Pendiente de revisión</option>
                                <option value="confirmada_o_modificada">Confirmadas o Modificadas</option>
                                <option value="validada_sin_cambios">Validada sin cambios</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <label className="font-bold text-slate-500">Desde:</label>
                              <input
                                type="date"
                                value={dailyDateFrom}
                                onChange={(e) => setDailyDateFrom(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <label className="font-bold text-slate-500">Hasta:</label>
                              <input
                                type="date"
                                value={dailyDateTo}
                                onChange={(e) => setDailyDateTo(e.target.value)}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                              />
                            </div>

                            {(dailyHotelFilter || dailyStatusFilter !== "confirmada" || dailyDistributionFilter !== "requieren_atencion" || dailyDateFrom || dailyDateTo) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDailyHotelFilter("");
                                  setDailyStatusFilter("confirmada");
                                  setDailyDistributionFilter("requieren_atencion");
                                  setDailyDateFrom("");
                                  setDailyDateTo("");
                                }}
                                className="text-blue-600 hover:text-blue-800 font-bold underline text-[11px] ml-1"
                              >
                                Limpiar filtros
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                              <button
                                type="button"
                                onClick={() => setDailyGroupingMode("reserva")}
                                className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${
                                  dailyGroupingMode === "reserva"
                                    ? "bg-white text-blue-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                <span>🏨</span> Agrupar por Reserva
                                <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded-full font-bold">
                                  {groupedDailyOccupancyByReserva.length}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDailyGroupingMode("lineas")}
                                className={`px-3 py-1 rounded-md font-bold transition flex items-center gap-1.5 ${
                                  dailyGroupingMode === "lineas"
                                    ? "bg-white text-blue-700 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                                }`}
                              >
                                <span>📅</span> Desglose por Días
                                <span className="ml-1 text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full font-bold">
                                  {filteredDailyOccupancy.length}
                                </span>
                              </button>
                            </div>
                            <div className="text-xs text-slate-500">
                              {dailyGroupingMode === "reserva" ? (
                                <>Mostrando <strong className="text-slate-800">{groupedDailyOccupancyByReserva.length}</strong> reservas ({filteredDailyOccupancy.length} noches)</>
                              ) : (
                                <>Mostrando <strong className="text-slate-800">{filteredDailyOccupancy.length}</strong> registros día/reserva</>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* TABLA DE DESGLOSE DIARIO Y ECONÓMICO */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                          <div className="overflow-x-auto max-h-[650px]">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                                <tr>
                                  <th className="px-3 py-3">Hotel</th>
                                  <th className="px-3 py-3">Reserva</th>
                                  <th className="px-3 py-3">Grupo</th>
                                  <th className="px-3 py-3">Comercial</th>
                                  <th className="px-3 py-3">Fecha</th>
                                  <th className="px-2 py-3 text-center">Pax</th>
                                  <th className="px-2 py-3">Rég.</th>
                                  <th className="px-2 py-3 text-center">Ind.</th>
                                  <th className="px-2 py-3 text-center">Dbl.</th>
                                  <th className="px-2 py-3 text-center">Tpl.</th>
                                  <th className="px-2 py-3 text-center">Cua.</th>
                                  <th className="px-2 py-3 text-center">Hab.</th>
                                  <th className="px-3 py-3 text-right">Imp. Total</th>
                                  <th className="px-2 py-3 text-right">Desay.</th>
                                  <th className="px-2 py-3 text-right">Comidas</th>
                                  <th className="px-3 py-3 text-right">Aloj. Neto</th>
                                  <th className="px-3 py-3 text-center">Estado Distribución</th>
                                  <th className="px-3 py-3 text-center">Acción</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {filteredDailyOccupancy.length === 0 ? (
                                  <tr>
                                    <td colSpan="18" className="px-6 py-12 text-center text-slate-400 font-medium">
                                      {dailyDistributionFilter === "requieren_atencion" ? (
                                        <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                                          <span className="text-3xl">🎉</span>
                                          <span className="font-bold text-slate-700 text-sm">¡Todo al día! No hay grupos que requieran atención en este momento.</span>
                                          <span className="text-xs text-slate-500">Selecciona <strong className="text-slate-700">"Todos los estados"</strong> o <strong className="text-slate-700">"Confirmadas o Modificadas"</strong> para ver el histórico completo.</span>
                                        </div>
                                      ) : (
                                        "No hay registros que coincidan con los filtros aplicados."
                                      )}
                                    </td>
                                  </tr>
                                ) : dailyGroupingMode === "reserva" ? (
                                  groupedDailyOccupancyByReserva.map((item, idx) => {
                                    const st = item.distributionStatus;
                                    let badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                                    let badgeText = "Propuesta automática";

                                    if (st === "validada_sin_cambios") {
                                      badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
                                      badgeText = "✓ Validada sin cambios";
                                    } else if (st === "revision_necesaria") {
                                      badgeClass = "bg-orange-100 text-orange-900 border-orange-300 font-black animate-pulse";
                                      badgeText = "⚠️ Revisión necesaria";
                                    } else if (st === "confirmada") {
                                      badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
                                      badgeText = "Confirmada";
                                    } else if (st === "modificada") {
                                      badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
                                      badgeText = "Modificada";
                                    } else if (st === "pendiente") {
                                      badgeClass = "bg-rose-100 text-rose-800 border-rose-200";
                                      badgeText = "Pendiente de revisión";
                                    }

                                    const matchingGroup = groupedData.find(g => normalizeId(g.id) === normalizeId(item.reserva));
                                    const comercialName = matchingGroup?.comercial || (matchingGroup?.records?.[0]?.Com_Comercial) || "-";
                                    const isExpanded = expandedReservas.has(item.reservaKey);

                                    return (
                                      <React.Fragment key={`reserva_${item.reservaKey}_${idx}`}>
                                        <tr className="hover:bg-slate-50/80 transition">
                                          <td className="px-3 py-2 font-bold text-slate-700 whitespace-nowrap">{item.hotel}</td>
                                          <td className="px-3 py-2 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                              {item.days.length > 1 && (
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setExpandedReservas(prev => {
                                                      const next = new Set(prev);
                                                      if (next.has(item.reservaKey)) next.delete(item.reservaKey);
                                                      else next.add(item.reservaKey);
                                                      return next;
                                                    });
                                                  }}
                                                  className="text-slate-400 hover:text-slate-700 text-[10px] w-4 h-4 rounded flex items-center justify-center hover:bg-slate-200 transition"
                                                  title={isExpanded ? "Ocultar noches" : `Ver ${item.days.length} noches`}
                                                >
                                                  {isExpanded ? "▼" : "▶"}
                                                </button>
                                              )}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const targetGroup = matchingGroup || { id: item.reserva, name: item.nombreGrupo, records: (data || []).filter(r => normalizeId(r.Reserva) === normalizeId(item.reserva)) };
                                                  openFicha(targetGroup);
                                                }}
                                                className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer inline-flex items-center gap-1 group"
                                                title="Abrir Ficha del Grupo"
                                              >
                                                <span>{item.reserva}</span>
                                                <span className="text-[10px] text-blue-400 group-hover:text-blue-700">↗</span>
                                              </button>
                                            </div>
                                          </td>
                                          <td className="px-3 py-2 max-w-[170px] truncate" title={item.nombreGrupo}>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const targetGroup = matchingGroup || { id: item.reserva, name: item.nombreGrupo, records: (data || []).filter(r => normalizeId(r.Reserva) === normalizeId(item.reserva)) };
                                                openFicha(targetGroup);
                                              }}
                                              className="font-semibold text-slate-800 hover:text-blue-600 hover:underline text-left cursor-pointer truncate max-w-full block"
                                              title={`Abrir Ficha de ${item.nombreGrupo}`}
                                            >
                                              {item.nombreGrupo}
                                            </button>
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                                              {comercialName}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2 font-mono text-slate-700 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                              <span>{item.dateDisplay}</span>
                                              {item.nightCount > 1 && (
                                                <span className="text-[10px] font-black px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded border border-blue-100">
                                                  {item.nightCount}n
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-2 py-2 text-center font-black text-slate-900 bg-slate-50/60">{item.pax}</td>
                                          <td className="px-2 py-2 text-slate-600 font-mono font-bold whitespace-nowrap">{item.regimen || "-"}</td>
                                          <td className="px-2 py-2 text-center font-semibold text-slate-700">
                                            {item.individuales !== null && item.individuales !== undefined ? item.individuales : "-"}
                                          </td>
                                          <td className="px-2 py-2 text-center font-semibold text-slate-700">
                                            {item.dobles !== null && item.dobles !== undefined ? item.dobles : "-"}
                                          </td>
                                          <td className="px-2 py-2 text-center font-semibold text-slate-700">
                                            {item.triples !== null && item.triples !== undefined ? item.triples : "-"}
                                          </td>
                                          <td className="px-2 py-2 text-center font-semibold text-slate-700">
                                            {item.hotel && (item.hotel.toLowerCase().includes("cumbria") || item.hotel.toLowerCase().includes("spa")) ? "-" : (item.cuadruples !== null && item.cuadruples !== undefined ? item.cuadruples : "-")}
                                          </td>
                                          <td className="px-2 py-2 text-center font-black text-blue-700 bg-blue-50/30">
                                            {item.totalHabitaciones !== null && item.totalHabitaciones !== undefined ? item.totalHabitaciones : "-"}
                                          </td>
                                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                                            {item.totalImp.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                          </td>
                                          <td className="px-2 py-2 text-right font-mono text-slate-500 whitespace-nowrap">
                                            {item.totalBreakfast > 0 ? item.totalBreakfast.toFixed(2) + " €" : "-"}
                                          </td>
                                          <td className="px-2 py-2 text-right font-mono text-slate-500 whitespace-nowrap">
                                            {item.totalMeals > 0 ? item.totalMeals.toFixed(2) + " €" : "-"}
                                          </td>
                                          <td className="px-3 py-2 text-right font-mono font-black whitespace-nowrap text-blue-700">
                                            {item.totalNet.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                          </td>
                                           <td className="px-3 py-2 text-center whitespace-nowrap">
                                             <div className="flex flex-col items-center gap-1">
                                               <span
                                                 className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}
                                                 title={item.revisionReasons && item.revisionReasons.length > 0 ? item.revisionReasons.join(" • ") : badgeText}
                                               >
                                                 {badgeText}
                                               </span>
                                               {item.days && item.days.some(d => d.excelDifference && d.excelDifference.hasDiff) && (() => {
                                                 const allDiffs = Array.from(new Set(item.days.flatMap(d => d.excelDifference?.reasons || [])));
                                                 return (
                                                   <span
                                                     className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 cursor-help"
                                                     title={`Diferencias detectadas con Excel original:\n• ${allDiffs.join('\n• ')}`}
                                                   >
                                                     ℹ️ Dif. Excel
                                                   </span>
                                                 );
                                               })()}
                                             </div>
                                           </td>
                                           <td className="px-3 py-2 text-center whitespace-nowrap">
                                             <button
                                               type="button"
                                               onClick={() => openDistributionModal(item.representativeDay)}
                                               className={`px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm transition ${
                                                 st === "revision_necesaria"
                                                   ? "bg-orange-600 hover:bg-orange-700 text-white"
                                                   : "bg-blue-600 hover:bg-blue-700 text-white"
                                               }`}
                                             >
                                               {st === "revision_necesaria" ? "Revisar Cambio" : "Revisar"}
                                             </button>
                                           </td>
                                         </tr>

                                         {/* Sub-filas desplegables para cada noche si está expandido */}
                                         {isExpanded && item.days.map((day, dIdx) => {
                                           const daySt = day.distributionStatus;
                                           let dayBadgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                                           let dayBadgeText = "Propuesta automática";

                                           if (daySt === "validada_sin_cambios") {
                                             dayBadgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
                                             dayBadgeText = "✓ Validada";
                                           } else if (daySt === "revision_necesaria") {
                                             dayBadgeClass = "bg-orange-100 text-orange-900 border-orange-300 font-bold";
                                             dayBadgeText = "⚠️ Revisar";
                                           } else if (daySt === "confirmada") {
                                             dayBadgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
                                             dayBadgeText = "Confirmada";
                                           } else if (daySt === "modificada") {
                                             dayBadgeClass = "bg-blue-100 text-blue-800 border-blue-200";
                                             dayBadgeText = "Modificada";
                                           } else if (daySt === "pendiente") {
                                             dayBadgeClass = "bg-rose-100 text-rose-800 border-rose-200";
                                             dayBadgeText = "Pendiente";
                                           }

                                           let dayImp = 0.0;
                                           if (day.dailyAmount !== undefined && day.dailyAmount > 0) {
                                             dayImp = day.dailyAmount;
                                           } else if (day.contributingLines && day.contributingLines.length > 0) {
                                             day.contributingLines.forEach(l => {
                                               const nch = parseInt(l.noches, 10) || 1;
                                               dayImp += ((parseFloat(l.importe) || 0) / Math.max(1, nch));
                                             });
                                           }

                                           const pricing = window.BoardPricingService
                                             ? window.BoardPricingService.getPricingForHotelAndDate(day.hotel, day.fecha, boardPricingConfig)
                                             : { breakfast: 6.0, meal: 16.0 };

                                           const eco = window.BoardPricingService
                                             ? window.BoardPricingService.calculateDailyEconomicBreakdown({
                                                 pax: day.pax,
                                                 regimen: day.regimen,
                                                 dailyAmount: dayImp,
                                                 pricingConfig: pricing
                                               })
                                             : { breakfastCost: 0, mealCost: 0, netAccommodationPrice: dayImp, isNegativeAccommodation: false };

                                           return (
                                             <tr key={`sub_${item.reservaKey}_${day.fecha}_${dIdx}`} className="bg-slate-50/70 text-[11px] border-l-4 border-blue-400">
                                               <td className="px-3 py-1.5 text-slate-400 pl-6">↳ Noche {dIdx + 1}</td>
                                               <td className="px-3 py-1.5 text-slate-400 font-mono text-[10px]">#{item.reserva}</td>
                                               <td className="px-3 py-1.5 text-slate-500 italic">Desglose {formatDate(day.fecha)}</td>
                                               <td className="px-3 py-1.5 text-slate-400">-</td>
                                               <td className="px-3 py-1.5 font-mono font-bold text-slate-700">{formatDate(day.fecha)}</td>
                                               <td className="px-2 py-1.5 text-center font-bold text-slate-700">{day.pax}</td>
                                               <td className="px-2 py-1.5 font-mono text-slate-600">
                                                 <span title={day.excelDifference?.excelRegimen && day.excelDifference.excelRegimen !== day.regimen ? `Régimen Ficha: ${day.regimen} (Excel: ${day.excelDifference.excelRegimen})` : undefined}>
                                                   {day.regimen || "-"}
                                                 </span>
                                               </td>
                                               <td className="px-2 py-1.5 text-center text-slate-600">{day.individuales !== null ? day.individuales : "-"}</td>
                                               <td className="px-2 py-1.5 text-center text-slate-600">{day.dobles !== null ? day.dobles : "-"}</td>
                                               <td className="px-2 py-1.5 text-center text-slate-600">{day.triples !== null ? day.triples : "-"}</td>
                                                <td className="px-2 py-1.5 text-center text-slate-600">{(item.hotel && (item.hotel.toLowerCase().includes("cumbria") || item.hotel.toLowerCase().includes("spa"))) ? "-" : (day.cuadruples !== null ? day.cuadruples : "-")}</td>
                                               <td className="px-2 py-1.5 text-center font-bold text-blue-600">{day.totalHabitaciones !== null ? day.totalHabitaciones : "-"}</td>
                                               <td className="px-3 py-1.5 text-right font-mono text-slate-600">{dayImp.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</td>
                                               <td className="px-2 py-1.5 text-right font-mono text-slate-400">{eco.breakfastCost > 0 ? eco.breakfastCost.toFixed(2) + " €" : "-"}</td>
                                               <td className="px-2 py-1.5 text-right font-mono text-slate-400">{eco.mealCost > 0 ? eco.mealCost.toFixed(2) + " €" : "-"}</td>
                                               <td className="px-3 py-1.5 text-right font-mono text-blue-600">{eco.netAccommodationPrice.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}</td>
                                               <td className="px-3 py-1.5 text-center whitespace-nowrap">
                                                 <div className="flex flex-col items-center gap-0.5">
                                                   <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${dayBadgeClass}`}>
                                                     {dayBadgeText}
                                                   </span>
                                                   {day.excelDifference?.hasDiff && (
                                                     <span
                                                       className="inline-flex items-center px-1 py-0.2 rounded text-[8px] font-bold bg-blue-50 text-blue-700 border border-blue-200 cursor-help"
                                                       title={`Diferencia con Excel original:\n• ${(day.excelDifference.reasons || []).join('\n• ')}`}
                                                     >
                                                       ℹ️ Dif. Excel
                                                     </span>
                                                   )}
                                                 </div>
                                               </td>
                                              <td className="px-3 py-1.5 text-center">
                                                <button
                                                  type="button"
                                                  onClick={() => openDistributionModal(day)}
                                                  className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 hover:bg-blue-600 hover:text-white text-slate-700 transition"
                                                >
                                                  Editar noche
                                                </button>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </React.Fragment>
                                    );
                                  })
                                ) : (
                                  filteredDailyOccupancy.map((item, idx) => {
                                    const st = item.distributionStatus;
                                    let badgeClass = "bg-amber-100 text-amber-800 border-amber-200";
                                    let badgeText = "Propuesta automática";

                                    if (st === "validada_sin_cambios") {
                                      badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
                                      badgeText = "✓ Validada sin cambios";
                                    } else if (st === "revision_necesaria") {
                                      badgeClass = "bg-orange-100 text-orange-900 border-orange-300 font-black animate-pulse";
                                      badgeText = "⚠️ Revisión necesaria";
                                    } else if (st === "confirmada") {
                                      badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
                                      badgeText = "Confirmada";
                                    } else if (st === "modificada") {
                                      badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
                                      badgeText = "Modificada";
                                    } else if (st === "pendiente") {
                                      badgeClass = "bg-rose-100 text-rose-800 border-rose-200";
                                      badgeText = "Pendiente de revisión";
                                    }

                                    // Localizar grupo para navegación y comercial
                                    const matchingGroup = groupedData.find(g => normalizeId(g.id) === normalizeId(item.reserva));
                                    const comercialName = matchingGroup?.comercial || (matchingGroup?.records?.[0]?.Com_Comercial) || "-";

                                    // Cálculo de Importe Diario y Desglose Económico
                                    let dailyImp = 0.0;
                                    if (item.dailyAmount !== undefined && item.dailyAmount > 0) {
                                      dailyImp = item.dailyAmount;
                                    } else if (item.contributingLines && item.contributingLines.length > 0) {
                                      item.contributingLines.forEach(l => {
                                        const nch = parseInt(l.noches, 10) || 1;
                                        dailyImp += ((parseFloat(l.importe) || 0) / Math.max(1, nch));
                                      });
                                    }

                                    const pricing = window.BoardPricingService
                                      ? window.BoardPricingService.getPricingForHotelAndDate(item.hotel, item.fecha, boardPricingConfig)
                                      : { breakfast: 6.0, meal: 16.0 };

                                    const eco = window.BoardPricingService
                                      ? window.BoardPricingService.calculateDailyEconomicBreakdown({
                                          pax: item.pax,
                                          regimen: item.regimen,
                                          dailyAmount: dailyImp,
                                          pricingConfig: pricing
                                        })
                                      : { breakfastCost: 0, mealCost: 0, netAccommodationPrice: dailyImp, isNegativeAccommodation: false };

                                    return (
                                      <tr key={`${item.reserva}_${item.fecha}_${idx}`} className="hover:bg-slate-50/80 transition">
                                        <td className="px-3 py-2 font-bold text-slate-700 whitespace-nowrap">{item.hotel}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const targetGroup = matchingGroup || { id: item.reserva, name: item.nombreGrupo, records: (data || []).filter(r => normalizeId(r.Reserva) === normalizeId(item.reserva)) };
                                              openFicha(targetGroup);
                                            }}
                                            className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline text-left cursor-pointer inline-flex items-center gap-1 group"
                                            title="Abrir Ficha del Grupo"
                                          >
                                            <span>{item.reserva}</span>
                                            <span className="text-[10px] text-blue-400 group-hover:text-blue-700">↗</span>
                                          </button>
                                        </td>
                                        <td className="px-3 py-2 max-w-[170px] truncate" title={item.nombreGrupo}>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const targetGroup = matchingGroup || { id: item.reserva, name: item.nombreGrupo, records: (data || []).filter(r => normalizeId(r.Reserva) === normalizeId(item.reserva)) };
                                              openFicha(targetGroup);
                                            }}
                                            className="font-semibold text-slate-800 hover:text-blue-600 hover:underline text-left cursor-pointer truncate max-w-full block"
                                            title={`Abrir Ficha de ${item.nombreGrupo}`}
                                          >
                                            {item.nombreGrupo}
                                          </button>
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                                            {comercialName}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 font-mono text-slate-700 whitespace-nowrap">{formatDate(item.fecha)}</td>
                                        <td className="px-2 py-2 text-center font-black text-slate-900 bg-slate-50/60">{item.pax}</td>
                                        <td className="px-2 py-2 text-slate-600 font-mono font-bold whitespace-nowrap">{item.regimen || "-"}</td>
                                        <td className="px-2 py-2 text-center font-semibold text-slate-700">
                                          {item.individuales !== null && item.individuales !== undefined ? item.individuales : "-"}
                                        </td>
                                        <td className="px-2 py-2 text-center font-semibold text-slate-700">
                                          {item.dobles !== null && item.dobles !== undefined ? item.dobles : "-"}
                                        </td>
                                        <td className="px-2 py-2 text-center font-semibold text-slate-700">
                                          {item.triples !== null && item.triples !== undefined ? item.triples : "-"}
                                        </td>
                                        <td className="px-2 py-2 text-center font-semibold text-slate-700">
                                          {item.cuadruples !== null && item.cuadruples !== undefined ? item.cuadruples : "-"}
                                        </td>
                                        <td className="px-2 py-2 text-center font-black text-blue-700 bg-blue-50/30">
                                          {item.totalHabitaciones !== null && item.totalHabitaciones !== undefined ? item.totalHabitaciones : "-"}
                                        </td>
                                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                                          {dailyImp.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                        </td>
                                        <td className="px-2 py-2 text-right font-mono text-slate-500 whitespace-nowrap">
                                          {eco.breakfastCost > 0 ? eco.breakfastCost.toFixed(2) + " €" : "-"}
                                        </td>
                                        <td className="px-2 py-2 text-right font-mono text-slate-500 whitespace-nowrap">
                                          {eco.mealCost > 0 ? eco.mealCost.toFixed(2) + " €" : "-"}
                                        </td>
                                        <td className={`px-3 py-2 text-right font-mono font-black whitespace-nowrap ${
                                          eco.isNegativeAccommodation ? "text-rose-600 bg-rose-50" : "text-blue-700"
                                        }`}>
                                          {eco.netAccommodationPrice.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                                          {eco.isNegativeAccommodation && (
                                            <span className="ml-1 text-xs" title="El precio total es inferior al coste configurado de manutención.">⚠️</span>
                                          )}
                                        </td>
                                        <td className="px-3 py-2 text-center whitespace-nowrap">
                                          <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}
                                            title={item.revisionReasons && item.revisionReasons.length > 0 ? item.revisionReasons.join(" • ") : badgeText}
                                          >
                                            {badgeText}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 text-center whitespace-nowrap">
                                          <button
                                            type="button"
                                            onClick={() => openDistributionModal(item)}
                                            className={`px-2.5 py-1 text-xs font-bold rounded-lg shadow-sm transition ${
                                              st === "revision_necesaria"
                                                ? "bg-orange-600 hover:bg-orange-700 text-white"
                                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                            }`}
                                          >
                                            {st === "revision_necesaria" ? "Revisar Cambio" : "Revisar"}
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* VISTA 2: LISTADO DE GRUPOS CONSOLIDADO (DIRECTORIO) */}
                {groupsSubView === "groups" && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-wider">
                          <th className="px-3 py-3 font-black">Hotel</th>
                          <th className="px-3 py-3 font-black">Grupo / ID</th>
                          <th className="px-3 py-3 font-black">Comercial</th>
                          <th className="px-3 py-3 font-black">Entrada</th>
                          <th className="px-3 py-3 font-black">Salida</th>
                          <th className="px-3 py-3 font-black text-center">Release</th>
                          <th className="px-3 py-3 font-black text-right">Importe</th>
                          <th className="px-3 py-3 font-black text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {groupedData.map((group, idx) => {
                          // Prioridad: Com_Estado_Interno siempre gana sobre Estado (campo del Excel importado)
                          const internalSt = group.records?.[0]?.["Com_Estado_Interno"];
                          const externalSt = group.records?.[0]?.["Estado"];
                          const effectiveSt = internalSt || group.records?.[0]?.["Segment."];
                          const st = getStatusProps(
                            effectiveSt,
                            group.arrival,
                            internalSt ? null : externalSt,
                          );
                          const statusText = st.label;
                          const statusColor = st.text;

                          // Normalizar nombre hotel para visualización
                          const displayHotel = normalizeHotelNameLocal(
                            group.records?.[0]?.["Hotel_Asignado"] ||
                            group.records?.[0]?.["Hotel"] ||
                            group.hotel,
                            "Sercotel Guadiana"
                          );

                          const isBudget = Boolean(
                            group.isBudget ||
                            String(group.id || "").toUpperCase().startsWith("PRES-") ||
                            group.records?.some((r) => {
                              const res = String(r["Reserva"] || "").toUpperCase();
                              const uid = String(r.uid || "").toUpperCase();
                              const ext = String(r["Estado"] || "").toUpperCase();
                              const inSt = String(r["Com_Estado_Interno"] || "").toUpperCase();
                              const seg = String(r["Segment."] || "").toUpperCase();
                              return (
                                res.startsWith("PRES-") ||
                                uid.startsWith("PRES-") ||
                                ext.includes("PRESUP") ||
                                inSt.includes("PRESUP") ||
                                seg.includes("PRESUP")
                              );
                            }) ||
                            statusText === "PRESUPUESTO"
                          );

                          // REGLA: Si un presupuesto está caducado, desestimado o cancelado, no debe aparecer en el directorio de grupos
                          if (isBudget) {
                            const isDeadBudget = (
                              statusText === "CADUCADO" ||
                              statusText === "DESESTIMADO" ||
                              statusText === "CANCELADO" ||
                              statusText === "ANULADA" ||
                              (internalSt && (internalSt.toUpperCase().includes("CADUC") || internalSt.toUpperCase().includes("DESESTIM") || internalSt.toUpperCase().includes("CANCEL") || internalSt.toUpperCase().includes("ANUL") || internalSt.toUpperCase().includes("BAJA"))) ||
                              (externalSt && (externalSt.toUpperCase().includes("CADUC") || externalSt.toUpperCase().includes("DESESTIM") || externalSt.toUpperCase().includes("CANCEL") || externalSt.toUpperCase().includes("ANUL") || externalSt.toUpperCase().includes("BAJA")))
                            );
                            if (isDeadBudget) return null;
                          }

                          const commercialName =
                            group.records?.find((r) => r["Com_Comercial"] || r["Comercial"])?.["Com_Comercial"] ||
                            group.records?.[0]?.["Com_Comercial"] ||
                            group.records?.[0]?.["Comercial"] ||
                            group.comercial ||
                            "";

                          return (
                            <tr
                              key={group.id || idx}
                              className={`transition-colors cursor-pointer group ${
                                isBudget
                                  ? "bg-indigo-50/70 hover:bg-indigo-100/70"
                                  : "hover:bg-slate-50"
                              }`}
                              onClick={() => openFicha(group)}
                            >
                              {/* HOTEL */}
                              <td className={`px-3 py-3 ${isBudget ? "border-l-4 border-indigo-500" : "border-l-4 border-transparent"}`}>
                                <div className="flex items-center gap-1.5">
                                  <div className="p-1.5 bg-white border border-slate-100 rounded-lg shadow-sm shrink-0">
                                    <IconBuildingSkyscraper
                                      size={14}
                                      className="text-slate-400"
                                    />
                                  </div>
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight leading-tight">
                                    {displayHotel}
                                  </span>
                                </div>
                              </td>

                              {/* GRUPO / ID */}
                              <td className="px-3 py-2">
                                <div className="max-w-[280px]">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <div className={`text-[13px] font-black text-slate-800 ${isBudget ? "group-hover:text-indigo-600" : "group-hover:text-[#2d5a43]"} transition-colors leading-tight`}>
                                      {group.name}
                                    </div>

                                    {(() => {
                                      const record = group.records?.[0] || {};
                                      const hasRooming = record["Logistica_Rooming"] === true || group.records?.some((r) => r["Logistica_Rooming"] === true);
                                      const hasMP = record["Logistica_MenuMP"] === true || group.records?.some((r) => r["Logistica_MenuMP"] === true);
                                      const hasPC = record["Logistica_MenuPC"] === true || group.records?.some((r) => r["Logistica_MenuPC"] === true);
                                      const regimen = (record["Régimen"] || "").toUpperCase();
                                      const needsMP = regimen.includes("MP");
                                      const needsPC = regimen.includes("PC");

                                      let daysToArrival = 999;
                                      if (record["Entrada"]) {
                                        const arrDateStr = String(record["Entrada"]).trim();
                                        let arrDate = null;
                                        if (arrDateStr.includes("/")) {
                                          const [d, m, y] = arrDateStr.split("/");
                                          arrDate = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T12:00:00`);
                                        } else {
                                          arrDate = new Date(arrDateStr.includes("T") ? arrDateStr : arrDateStr + "T12:00:00");
                                        }
                                        if (arrDate && !isNaN(arrDate.getTime())) {
                                          daysToArrival = Math.ceil((arrDate - new Date()) / (1000 * 60 * 60 * 24));
                                        }
                                      }

                                      const isClose = daysToArrival <= 15 && daysToArrival >= 0;
                                      const status = (record["Estado"] || "").toUpperCase();
                                      const isInactive = ["ANULADA", "CANCELADA", "GASTOS DE ANULACION", "BAJA"].includes(status);
                                      const internalStUpper = (record["Com_Estado_Interno"] || "").toUpperCase();
                                      const isInternalInactive = ["CANCEL", "ANUL", "GASTOS", "DESESTIMADO", "BAJA"].some((s) => internalStUpper.includes(s));
                                      const recordStatusProps = getStatusProps(record["Com_Estado_Interno"] || record["Segment."], record["Entrada"], record["Estado"]);
                                      const isConfirmed = recordStatusProps.label === "CONFIRMADO";

                                      if (!isConfirmed || isInactive || isInternalInactive) return null;

                                      const todayStr = new Date().toISOString().split("T")[0];
                                      const deadlineInfo = getDeadlineInfo(group, todayStr);
                                      const netRev = (group.totalRevenue || 0) - (group.totalCommission || 0);
                                      const paid = group.totalPaid || 0;
                                      const pending = netRev - paid;

                                      const alerts = [];

                                      // 1. Alert Rooming
                                      if (isClose && !hasRooming) {
                                        alerts.push(
                                          <div key="rooming" className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-[8px] font-black text-rose-600 animate-pulse shadow-sm whitespace-nowrap" title="¡Aviso Operativo! Falta la Rooming List.">
                                            <IconAlertTriangle size={10} stroke={3} />
                                            <span>FALTA ROOMING</span>
                                          </div>
                                        );
                                      }

                                      // 2. Alert Menú
                                      const menuMissing = (needsMP && !hasMP) || (needsPC && !hasPC);
                                      if (isClose && menuMissing) {
                                        const missingMenus = [needsMP && !hasMP && "Menú MP", needsPC && !hasPC && "Menú PC"].filter(Boolean).join(", ");
                                        alerts.push(
                                          <div key="menu" className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded text-[8px] font-black text-indigo-600 animate-pulse shadow-sm whitespace-nowrap" title={`¡Aviso Operativo! Falta definir menú: ${missingMenus}`}>
                                            <IconAlertTriangle size={10} stroke={3} />
                                            <span>FALTA MENÚ</span>
                                          </div>
                                        );
                                      }

                                      // 3. Alert Pago (o Badge Crédito)
                                      const isGroupCredito = Boolean(
                                        group?.isCredito ||
                                        group?.records?.some((r) => r["Es_Credito"] === true || r["Es_Credito"] === "true" || r["Com_Es_Credito"] === true)
                                      );
                                      const paymentOverdue = deadlineInfo.isDeadline && deadlineInfo.diffDays < 0;
                                      const paymentCritical = isClose || paymentOverdue;
                                      if (!isGroupCredito && paymentCritical && pending > 0.05) {
                                        alerts.push(
                                          <div key="pago" className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[8px] font-black text-amber-600 animate-pulse shadow-sm whitespace-nowrap" title={`¡Aviso de Cobro! Pendiente de cobro final: ${pending.toFixed(2)} €`}>
                                            <IconAlertTriangle size={10} stroke={3} />
                                            <span>FALTA PAGO</span>
                                          </div>
                                        );
                                      } else if (isGroupCredito) {
                                        alerts.push(
                                          <div key="credito" className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded text-[8px] font-black text-indigo-700 shadow-sm whitespace-nowrap" title="Grupo a crédito: no requiere pago anticipado">
                                            <IconCreditCard size={10} stroke={2.5} />
                                            <span>CRÉDITO</span>
                                          </div>
                                        );
                                      }

                                      if (alerts.length === 0) return null;
                                      return <>{alerts}</>;
                                    })()}

                                    {group.records?.[0]?.["Com_Notas"] && (
                                      <div
                                        className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-1 py-0.5 rounded text-[8px] font-bold text-amber-600 max-w-[120px] truncate"
                                        title={group.records[0]["Com_Notas"]}
                                      >
                                        <IconFile size={8} />
                                        <span className="truncate">
                                          {group.records[0]["Com_Notas"]}
                                        </span>
                                      </div>
                                    )}

                                    {group.records?.[0]?.["Com_Seguimiento"] && (
                                      <div
                                        className={`flex items-center gap-1 px-1 py-0.5 rounded text-[8px] font-bold border ${new Date(group.records[0]["Com_Seguimiento"]) <= new Date() ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-blue-50 border-blue-100 text-blue-600"}`}
                                        title="Próximo Seguimiento"
                                      >
                                        <IconClock size={8} />
                                        {formatDate(group.records[0]["Com_Seguimiento"])}
                                      </div>
                                    )}
                                  </div>

                                  <div className="text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1.5">
                                    <span className={`shrink-0 ${isBudget ? "text-indigo-600 font-extrabold" : ""}`}>
                                      ID: {group.records?.[0]?.["Reserva"] || group.id || "---"}
                                    </span>
                                    {(group.records?.[0]?.["Fiscal_RazonSocial"] || group.records?.[0]?.["Empresa/Agencia"] || group.agency) && (
                                      <>
                                        <span className="opacity-20">•</span>
                                        <span className="truncate max-w-[200px]">
                                          {group.records?.[0]?.["Fiscal_RazonSocial"] || group.records?.[0]?.["Empresa/Agencia"] || group.agency}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* COMERCIAL */}
                              <td className="px-3 py-2">
                                <div className="flex items-center gap-1">
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full ${getCommColor(commercialName)} shrink-0`}
                                  ></div>
                                  <span className="text-[9px] font-bold text-slate-600 uppercase">
                                    {commercialName || "S/A"}
                                  </span>
                                </div>
                              </td>

                              {/* ENTRADA & SALIDA */}
                              <td className="px-3 py-2">
                                <div className="text-[11px] font-bold text-slate-600 tabular-nums font-mono">
                                  {formatDate(group.arrival)}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="text-[11px] font-bold text-slate-600 tabular-nums font-mono">
                                  {formatDate(group.departure)}
                                </div>
                              </td>

                              {/* RELEASE */}
                              <td className="px-3 py-2 text-center">
                                {(() => {
                                  const grossRev = group.totalRevenue || 0;
                                  const commission = group.totalCommission || 0;
                                  const netRev = grossRev - commission;
                                  const paid = group.totalPaid || 0;
                                  const isFullyPaid = paid > 0 && netRev > 0 && paid >= netRev - 0.05;

                                  if (isFullyPaid) {
                                    return (
                                      <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shadow-sm">
                                          OK
                                        </span>
                                        <span className="text-[8px] text-slate-400 font-bold mt-0.5 tracking-tighter">
                                          Pagado
                                        </span>
                                      </div>
                                    );
                                  }

                                  const isGroupCredito = Boolean(
                                    group?.isCredito ||
                                    group?.records?.some((r) => r["Es_Credito"] === true || r["Es_Credito"] === "true" || r["Com_Es_Credito"] === true)
                                  );

                                  if (isGroupCredito) {
                                    return (
                                      <div className="flex flex-col items-center">
                                        <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 whitespace-nowrap">
                                          <IconCreditCard size={9} stroke={2.5} />
                                          A CRÉDITO
                                        </span>
                                        <span className="text-[8px] text-indigo-500 font-bold mt-0.5 tracking-tighter">
                                          Sin prepago
                                        </span>
                                      </div>
                                    );
                                  }

                                  const todayStr = new Date().toISOString().split("T")[0];
                                  const info = getDeadlineInfo(group, todayStr);
                                  if (!info.hasDate) {
                                    return <span className="text-slate-400">-</span>;
                                  }

                                  let badgeText = "";
                                  let badgeClass = "";
                                  let labelText = info.isDeadline ? "Límite" : "Entrada";
                                  if (info.diffDays < 0) {
                                    badgeText = "PASADO";
                                    badgeClass = "bg-rose-100 text-rose-700 font-bold border border-rose-200";
                                  } else if (info.diffDays === 0) {
                                    badgeText = "HOY";
                                    badgeClass = "bg-rose-600 text-white font-black animate-pulse";
                                  } else {
                                    badgeText = `${info.diffDays}d`;
                                    if (info.isDeadline) {
                                      if (info.diffDays <= 7) {
                                        badgeClass = "bg-amber-500 text-white font-bold";
                                      } else {
                                        badgeClass = "bg-slate-100 text-slate-700 font-bold border border-slate-200";
                                      }
                                    } else {
                                      if (info.diffDays <= 15) {
                                        badgeClass = "bg-amber-50 text-amber-700 font-bold border border-amber-200";
                                      } else {
                                        badgeClass = "bg-slate-100 text-slate-500 font-bold border border-slate-200";
                                      }
                                    }
                                  }

                                  return (
                                    <div className="flex flex-col items-center">
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap ${badgeClass}`}>
                                        {badgeText}
                                      </span>
                                      <span className="text-[8px] text-slate-500 font-bold mt-0.5 tracking-tighter">
                                        {labelText}: {formatDate(info.dateStr)}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </td>

                              {/* IMPORTE */}
                              <td className="px-3 py-2 text-right">
                                {(() => {
                                  const grossRev = group.totalRevenue || 0;
                                  const commission = group.totalCommission || 0;
                                  const netRev = grossRev - commission;
                                  const paid = group.totalPaid || 0;
                                  const pending = netRev - paid;
                                  const isFullyPaid = paid > 0 && pending <= 0.05;

                                  return (
                                    <div className="flex flex-col items-end gap-0.5">
                                      <div className="flex flex-col items-end leading-none">
                                        <span className="text-[12px] font-black text-slate-700 tabular-nums">
                                          {formatCurrency(grossRev)}
                                        </span>
                                        {commission > 0 && (
                                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                            Neto: {formatCurrency(netRev)}
                                          </span>
                                        )}
                                      </div>
                                      {(() => {
                                        const isRowCredito = Boolean(
                                          group?.isCredito ||
                                          group?.records?.some((r) => r["Es_Credito"] === true || r["Es_Credito"] === "true" || r["Com_Es_Credito"] === true)
                                        );

                                        if (isFullyPaid) {
                                          return (
                                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                              <IconCheck size={10} /> OK
                                            </span>
                                          );
                                        }

                                        if (isRowCredito) {
                                          return (
                                            <span className="text-[9px] font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                                              <IconCreditCard size={9} stroke={2} />
                                              {formatCurrency(pending, 0)} crédito
                                            </span>
                                          );
                                        }

                                        if (pending > 0.05) {
                                          return (
                                            <span className="text-[10px] font-bold text-rose-600 tabular-nums">
                                              {formatCurrency(pending)} pdte.
                                            </span>
                                          );
                                        }

                                        return null;
                                      })()}
                                    </div>
                                  );
                                })()}
                              </td>

                              {/* ESTADO */}
                              <td className="px-3 py-2 text-center">
                                <div className="flex items-center justify-center gap-2 group/status">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${statusColor}`}
                                  >
                                    {statusText}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.location.href = `Presupuestos.html?id=${group.records?.[0]?.["Reserva"] || group.id}`;
                                    }}
                                    className="p-1 px-1.5 bg-slate-100 text-slate-400 hover:bg-purple-600 hover:text-white rounded-lg transition-all opacity-0 group-hover/status:opacity-100 shadow-sm"
                                    title="Ver Presupuesto"
                                  >
                                    <IconFileText size={12} stroke={2.5} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {groupedData.length === 0 && (
                          <tr>
                            <td colSpan="8" className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                              No hay grupos que coincidan con los filtros.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MODAL DE CONFIGURACIÓN DE PRECIOS DE MANUTENCIÓN (Req 13) */}
            {showBoardPricingModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[220] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-fade-in">
                  <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white">⚙️ Precios de Manutención por Persona</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Configuración de costes de desayuno y comida</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBoardPricingModal(false)}
                      className="text-slate-400 hover:text-white font-bold text-lg leading-none"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-5 space-y-4 text-xs">
                    <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-xl">
                      <strong className="block font-bold">Sin impacto en habitaciones confirmadas (Req 20)</strong>
                      <span>
                        Los cambios de precios actualizan el desglose y las estadísticas económicas, pero no modifican los datos del Excel ni invalidan la distribución de habitaciones validada.
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Hotel aplicable:</label>
                      <select
                        value={editingBoardPrices.hotel}
                        onChange={(e) => {
                          const h = e.target.value;
                          const cur = boardPricingConfig[h] || boardPricingConfig.default || { breakfast: 6.0, meal: 16.0 };
                          setEditingBoardPrices({ hotel: h, breakfast: cur.breakfast, meal: cur.meal });
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                      >
                        <option value="default">Predeterminado (Todos los hoteles)</option>
                        {dailyHotelOptions.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Desayuno (€ / pax)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={editingBoardPrices.breakfast}
                          onChange={(e) => setEditingBoardPrices({ ...editingBoardPrices, breakfast: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-slate-900 text-right text-sm"
                        />
                        <div className="text-[10px] text-slate-400 mt-1">Por defecto: 6,00 €</div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Comida / Cena (€ / pax)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={editingBoardPrices.meal}
                          onChange={(e) => setEditingBoardPrices({ ...editingBoardPrices, meal: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg p-2 font-black text-slate-900 text-right text-sm"
                        />
                        <div className="text-[10px] text-slate-400 mt-1">Por defecto: 16,00 €</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBoardPricingModal(false)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const hKey = editingBoardPrices.hotel || "default";
                        const newCfg = {
                          ...boardPricingConfig,
                          [hKey]: {
                            breakfast: parseFloat(editingBoardPrices.breakfast) || 6.0,
                            meal: parseFloat(editingBoardPrices.meal) || 16.0,
                            version: "v-" + Date.now().toString(36),
                            updatedAt: new Date().toISOString()
                          }
                        };
                        setBoardPricingConfig(newCfg);
                        try {
                          window.NexusUtils?.safeStorage?.setItem("boardPricingConfig", JSON.stringify(newCfg));
                          await db.collection("settings").doc("boardPricing").set(newCfg, { merge: true });
                        } catch (e) {}
                        setShowBoardPricingModal(false);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm"
                    >
                      Guardar Precios
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VENTANA EMERGENTE (MODAL) DE REVISIÓN DE HABITACIONES (Reqs 12-20) */}
            {editingDistribution && (() => {
              const isCumbria = normalizeHotelNameLocal(editingDistribution.hotel, "Sercotel Guadiana") === "Cumbria Spa&Hotel" ||
                String(editingDistribution.hotel || "").toLowerCase().includes("cumbria");
              const curInd = parseInt(editingDistribution.individuales, 10) || 0;
              const curDbl = parseInt(editingDistribution.dobles, 10) || 0;
              const curTpl = parseInt(editingDistribution.triples, 10) || 0;
              const curCua = isCumbria ? 0 : (parseInt(editingDistribution.cuadruples, 10) || 0);
              const freeInd = Math.min(curInd, parseInt(editingDistribution.gratuitiesInd !== undefined ? editingDistribution.gratuitiesInd : (editingDistribution.gratuitiesCount || 0), 10) || 0);
              const freeDbl = Math.min(curDbl, parseInt(editingDistribution.gratuitiesDbl, 10) || 0);
              const freeTpl = Math.min(curTpl, parseInt(editingDistribution.gratuitiesTpl, 10) || 0);
              const freeCua = isCumbria ? 0 : Math.min(curCua, parseInt(editingDistribution.gratuitiesCua, 10) || 0);
              const totGratuities = freeInd + freeDbl + freeTpl + freeCua;
              const freePaxTotal = (freeInd * 1) + (freeDbl * 2) + (freeTpl * 3) + (freeCua * 4);
              const calcPax = (curInd * 1) + (curDbl * 2) + (curTpl * 3) + (curCua * 4);
              const payingPax = Math.max(0, calcPax - freePaxTotal);
              const calcRooms = curInd + curDbl + curTpl + curCua;
              const isPaxMatch = (calcPax === editingDistribution.pax) || (freePaxTotal > 0 && payingPax === editingDistribution.pax) || (freePaxTotal > 0 && calcPax === (editingDistribution.pax + freePaxTotal));
              const hasProposal = Boolean(editingDistribution.proposal);
              const isRevisionNecesaria = editingDistribution.status === "revision_necesaria";

              // Cálculo económico para este día
              const pricing = window.BoardPricingService
                ? window.BoardPricingService.getPricingForHotelAndDate(editingDistribution.hotel, editingDistribution.fecha, boardPricingConfig)
                : { breakfast: 6.0, meal: 16.0 };

              const pInd = parseNum(editingDistribution.priceInd) || 0;
              const pDbl = parseNum(editingDistribution.priceDbl) || 0;
              const pTpl = parseNum(editingDistribution.priceTpl) || 0;
              const pCua = parseNum(editingDistribution.priceCua) || 0;

              const payingIndRooms = Math.max(0, curInd - freeInd);
              const payingDblRooms = Math.max(0, curDbl - freeDbl);
              const payingTplRooms = Math.max(0, curTpl - freeTpl);
              const payingCuaRooms = Math.max(0, curCua - freeCua);

              const sumFromRoomPrices = (payingIndRooms * pInd) + (payingDblRooms * pDbl) + (payingTplRooms * pTpl) + (payingCuaRooms * pCua);

              // Obtener importe diario
              const matchedDay = dailyOccupancyList.find(d => d.reserva === editingDistribution.reserva && d.fecha === editingDistribution.fecha);
              let dailyImp = 0.0;
              if (sumFromRoomPrices > 0) {
                dailyImp = sumFromRoomPrices;
              } else if (matchedDay?.dailyAmount !== undefined && matchedDay?.dailyAmount > 0) {
                dailyImp = matchedDay.dailyAmount;
              } else if (matchedDay?.contributingLines) {
                matchedDay.contributingLines.forEach(l => {
                  const nch = parseInt(l.noches, 10) || 1;
                  dailyImp += ((parseFloat(l.importe) || 0) / Math.max(1, nch));
                });
              }

              // Si el usuario cambia el régimen en el modal respecto al régimen del día original, ajustar dailyImp por la diferencia de comidas
              const origDayReg = matchedDay?.regimen || "PC";
              const currentModalReg = editingDistribution.regimen || origDayReg;
              if (window.BoardPricingService && origDayReg && currentModalReg && origDayReg !== currentModalReg) {
                const oldCounts = window.BoardPricingService.getMealCounts(origDayReg);
                const newCounts = window.BoardPricingService.getMealCounts(currentModalReg);
                const bCost = typeof pricing.breakfast === "number" ? pricing.breakfast : 6.0;
                const mCost = typeof pricing.meal === "number" ? pricing.meal : 16.0;
                const deltaPerPerson = ((newCounts.breakfasts - oldCounts.breakfasts) * bCost) + ((newCounts.meals - oldCounts.meals) * mCost);
                dailyImp = Math.max(0, dailyImp + (deltaPerPerson * editingDistribution.pax));
              }

              const eco = window.BoardPricingService
                ? window.BoardPricingService.calculateDailyEconomicBreakdown({
                    pax: editingDistribution.pax,
                    regimen: editingDistribution.regimen,
                    dailyAmount: dailyImp,
                    pricingConfig: pricing
                  })
                : null;

              return (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-base text-white">Revisión de Distribución de Habitaciones</h3>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {editingDistribution.hotel} • Reserva #{editingDistribution.reserva} • {formatDate(editingDistribution.fecha)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingDistribution(null)}
                        className="text-slate-400 hover:text-white text-lg font-bold p-1 leading-none"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 space-y-5 overflow-y-auto flex-1">
                      {/* Booking Summary Card */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium">Grupo</span>
                          <span className="font-bold text-slate-800 truncate block">{editingDistribution.nombreGrupo}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Fecha estancia</span>
                          <span className="font-bold text-slate-800">{formatDate(editingDistribution.fecha)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Personas (Pax)</span>
                          <span className="font-black text-blue-600 text-sm">{editingDistribution.pax} personas</span>
                        </div>
                        <div>
                          <label className="text-slate-400 block font-medium mb-1">Régimen</label>
                          <select
                            value={editingDistribution.regimen || "HD"}
                            onChange={(e) => {
                              const newReg = e.target.value;
                              setEditingDistribution((prev) => ({
                                ...prev,
                                regimen: newReg
                              }));
                            }}
                            className="font-bold text-slate-800 font-mono bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-full shadow-sm cursor-pointer"
                            title="Seleccionar régimen oficial"
                          >
                            <option value="HA">HA (Solo Alojamiento)</option>
                            <option value="HD">HD (Alojamiento y Desayuno)</option>
                            <option value="MP">MP (Media Pensión)</option>
                            <option value="PC">PC (Pensión Completa)</option>
                          </select>
                        </div>
                      </div>

                      {/* AVISO INFORMATIVO: DIFERENCIAS RESPECTO AL EXCEL ORIGINAL */}
                      {matchedDay?.excelDifference?.hasDiff && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-950 p-3.5 rounded-xl text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                            <span className="text-sm">ℹ️</span> Diferencia con datos originales de Excel
                          </div>
                          <p className="text-blue-800 text-[11px]">
                            La Ficha de Grupo tiene prioridad soberana sobre el Excel. Se han detectado las siguientes particularidades:
                          </p>
                          <ul className="list-disc list-inside space-y-0.5 font-semibold text-blue-900 bg-white/70 p-2 rounded-lg border border-blue-100 text-[11px]">
                            {matchedDay.excelDifference.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                          <p className="text-[10px] text-blue-600">
                            Al guardar o validar, se confirmará esta noche respetando los precios y regímenes fijados en la Ficha de Grupo.
                          </p>
                        </div>
                      )}

                      {/* ALERTA: REVISIÓN NECESARIA POR CAMBIO EN DATOS DE ORIGEN (Req 12) */}
                      {isRevisionNecesaria && (
                        <div className="bg-orange-50 border border-orange-300 text-orange-950 p-4 rounded-xl text-xs space-y-2">
                          <div className="flex items-center gap-2 font-black text-orange-900 text-sm">
                            <span>⚠️</span> Revisión necesaria: han cambiado los datos de la reserva
                          </div>
                          <p className="text-orange-800">
                            Se ha detectado una modificación en el archivo Excel respecto a la última validación:
                          </p>
                          <ul className="list-disc list-inside space-y-1 font-semibold text-orange-900 bg-white/70 p-2.5 rounded-lg border border-orange-200">
                            {(editingDistribution.revisionReasons || ["Han cambiado los datos de origen"]).map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                          <p className="text-[11px] text-orange-700">
                            Se conserva la distribución anterior como referencia abajo. Puede reconfirmarla directamente o adaptarla.
                          </p>
                        </div>
                      )}

                      {/* DESGLOSE ECONÓMICO DIARIO (Reqs 15-18) */}
                      {eco && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>Desglose Económico del Día:</span>
                            <span className="font-mono text-slate-900">{dailyImp.toFixed(2)} € total</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                            <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                              <span className="text-slate-400 block text-[10px]">Desayunos</span>
                              <span className="font-bold font-mono text-slate-700">{eco.breakfastCost.toFixed(2)} €</span>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-slate-200 text-center">
                              <span className="text-slate-400 block text-[10px]">Comidas</span>
                              <span className="font-bold font-mono text-slate-700">{eco.mealCost.toFixed(2)} €</span>
                            </div>
                            <div className={`p-2 rounded-lg border text-center ${
                              eco.isNegativeAccommodation ? "bg-rose-50 border-rose-300 text-rose-700" : "bg-white border-slate-200 text-blue-700"
                            }`}>
                              <span className="block text-[10px] opacity-75">Aloj. Neto</span>
                              <span className="font-bold font-mono">{eco.netAccommodationPrice.toFixed(2)} €</span>
                            </div>
                          </div>
                          {eco.isNegativeAccommodation && (
                            <div className="bg-rose-100 border border-rose-300 text-rose-900 p-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                              <span>⚠️</span> {eco.warning}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Proposal Notice */}
                      {editingDistribution.status === "propuesta" && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5">
                          <span className="text-base">💡</span>
                          <div>
                            <strong className="block font-bold">Propuesta automática, pendiente de confirmación</strong>
                            <span className="text-amber-700">
                              Calculada con el criterio estándar: {editingDistribution.proposal?.dobles || 0} dobles y {editingDistribution.proposal?.individuales || 0} individuales (total {editingDistribution.pax} personas). Revise y confirme para darla por válida.
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Inputs Grid */}
                      <div>
                        <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                          Distribución de Habitaciones
                        </label>
                        <div className={`grid grid-cols-2 ${isCumbria ? "sm:grid-cols-3" : "sm:grid-cols-4"} gap-3`}>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Individuales (1 pax)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editingDistribution.individuales}
                              onChange={(e) => setEditingDistribution({
                                ...editingDistribution,
                                individuales: e.target.value
                              })}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-800 text-center focus:outline-none focus:border-blue-500"
                            />
                            <div className="text-[10px] text-slate-400 text-center mt-1">
                              {curInd * 1} pax
                            </div>

                            {/* Campo editable de gratuidades para Individuales */}
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <label className="block text-[10px] font-bold text-amber-800 mb-0.5 text-center">
                                🎁 Gratuitas (0 €):
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={curInd}
                                value={editingDistribution.gratuitiesInd !== undefined ? editingDistribution.gratuitiesInd : (editingDistribution.gratuitiesCount || 0)}
                                onChange={(e) => {
                                  const val = Math.max(0, Math.min(curInd, parseInt(e.target.value, 10) || 0));
                                  setEditingDistribution({
                                    ...editingDistribution,
                                    gratuitiesInd: val,
                                    gratuitiesCount: val + freeDbl + freeTpl + freeCua
                                  });
                                }}
                                className="w-full bg-amber-50 border border-amber-300 rounded-lg px-2 py-1 text-xs font-black text-amber-900 text-center focus:outline-none focus:border-amber-500"
                                title="Número de habitaciones individuales sin cargo (0,00 €)"
                              />
                              <div className="text-[9px] text-slate-500 text-center mt-0.5 font-medium">
                                {Math.max(0, curInd - freeInd)} pago + {freeInd} gratis
                              </div>
                            </div>

                            {/* Campo editable de precio (€/hab) */}
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5 text-center">
                                💶 Precio (€/hab):
                              </label>
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0,00"
                                value={editingDistribution.priceInd !== undefined ? editingDistribution.priceInd : ""}
                                onChange={(e) => setEditingDistribution({
                                  ...editingDistribution,
                                  priceInd: e.target.value
                                })}
                                className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-2 py-1 text-xs font-black text-blue-900 text-center focus:outline-none focus:border-blue-500"
                                title="Precio por habitación (€)"
                              />
                              <div className="text-[9px] text-slate-500 text-center mt-0.5 font-medium">
                                Subtotal: {(payingIndRooms * (parseNum(editingDistribution.priceInd) || 0)).toFixed(2)} €
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Dobles (2 pax)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editingDistribution.dobles}
                              onChange={(e) => setEditingDistribution({
                                ...editingDistribution,
                                dobles: e.target.value
                              })}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-800 text-center focus:outline-none focus:border-blue-500"
                            />
                            <div className="text-[10px] text-slate-400 text-center mt-1">
                              {curDbl * 2} pax
                            </div>

                            {/* Campo editable de gratuidades para Dobles */}
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <label className="block text-[10px] font-bold text-amber-800 mb-0.5 text-center">
                                🎁 Gratuitas (0 €):
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={curDbl}
                                value={editingDistribution.gratuitiesDbl !== undefined ? editingDistribution.gratuitiesDbl : 0}
                                onChange={(e) => {
                                  const val = Math.max(0, Math.min(curDbl, parseInt(e.target.value, 10) || 0));
                                  setEditingDistribution({
                                    ...editingDistribution,
                                    gratuitiesDbl: val,
                                    gratuitiesCount: freeInd + val + freeTpl + freeCua
                                  });
                                }}
                                className="w-full bg-amber-50 border border-amber-300 rounded-lg px-2 py-1 text-xs font-black text-amber-900 text-center focus:outline-none focus:border-amber-500"
                                title="Número de habitaciones dobles sin cargo (0,00 €)"
                              />
                              <div className="text-[9px] text-slate-500 text-center mt-0.5 font-medium">
                                {Math.max(0, curDbl - freeDbl)} pago + {freeDbl} gratis
                              </div>
                            </div>

                            {/* Campo editable de precio (€/hab) */}
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5 text-center">
                                💶 Precio (€/hab):
                              </label>
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0,00"
                                value={editingDistribution.priceDbl !== undefined ? editingDistribution.priceDbl : ""}
                                onChange={(e) => setEditingDistribution({
                                  ...editingDistribution,
                                  priceDbl: e.target.value
                                })}
                                className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-2 py-1 text-xs font-black text-blue-900 text-center focus:outline-none focus:border-blue-500"
                                title="Precio por habitación (€)"
                              />
                              <div className="text-[9px] text-slate-500 text-center mt-0.5 font-medium">
                                Subtotal: {(payingDblRooms * (parseNum(editingDistribution.priceDbl) || 0)).toFixed(2)} €
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Triples (3 pax)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={editingDistribution.triples}
                              onChange={(e) => setEditingDistribution({
                                ...editingDistribution,
                                triples: e.target.value
                              })}
                              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-800 text-center focus:outline-none focus:border-blue-500"
                            />
                            <div className="text-[10px] text-slate-400 text-center mt-1">
                              {curTpl * 3} pax
                            </div>

                            {/* Campo editable de gratuidades para Triples */}
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <label className="block text-[10px] font-bold text-amber-800 mb-0.5 text-center">
                                🎁 Gratuitas (0 €):
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={curTpl}
                                value={editingDistribution.gratuitiesTpl !== undefined ? editingDistribution.gratuitiesTpl : 0}
                                onChange={(e) => {
                                  const val = Math.max(0, Math.min(curTpl, parseInt(e.target.value, 10) || 0));
                                  setEditingDistribution({
                                    ...editingDistribution,
                                    gratuitiesTpl: val,
                                    gratuitiesCount: freeInd + freeDbl + val + freeCua
                                  });
                                }}
                                className="w-full bg-amber-50 border border-amber-300 rounded-lg px-2 py-1 text-xs font-black text-amber-900 text-center focus:outline-none focus:border-amber-500"
                                title="Número de habitaciones triples sin cargo (0,00 €)"
                              />
                              <div className="text-[9px] text-slate-500 text-center mt-0.5 font-medium">
                                {Math.max(0, curTpl - freeTpl)} pago + {freeTpl} gratis
                              </div>
                            </div>

                            {/* Campo editable de precio (€/hab) */}
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5 text-center">
                                💶 Precio (€/hab):
                              </label>
                              <input
                                type="text"
                                inputMode="decimal"
                                placeholder="0,00"
                                value={editingDistribution.priceTpl !== undefined ? editingDistribution.priceTpl : ""}
                                onChange={(e) => setEditingDistribution({
                                  ...editingDistribution,
                                  priceTpl: e.target.value
                                })}
                                className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-2 py-1 text-xs font-black text-blue-900 text-center focus:outline-none focus:border-blue-500"
                                title="Precio por habitación (€)"
                              />
                              <div className="text-[9px] text-slate-500 text-center mt-0.5 font-medium">
                                Subtotal: {(payingTplRooms * (parseNum(editingDistribution.priceTpl) || 0)).toFixed(2)} €
                              </div>
                            </div>
                          </div>

                          {!isCumbria && (
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                                Cuádruples (4 pax)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={editingDistribution.cuadruples}
                                onChange={(e) => setEditingDistribution({
                                  ...editingDistribution,
                                  cuadruples: e.target.value
                                })}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm font-bold text-slate-800 text-center focus:outline-none focus:border-blue-500"
                              />
                              <div className="text-[10px] text-slate-400 text-center mt-1">
                                {curCua * 4} pax
                              </div>

                              {/* Campo editable de gratuidades para Cuádruples */}
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <label className="block text-[10px] font-bold text-amber-800 mb-0.5 text-center">
                                  🎁 Gratuitas (0 €):
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max={curCua}
                                  value={editingDistribution.gratuitiesCua !== undefined ? editingDistribution.gratuitiesCua : 0}
                                  onChange={(e) => {
                                    const val = Math.max(0, Math.min(curCua, parseInt(e.target.value, 10) || 0));
                                    setEditingDistribution({
                                      ...editingDistribution,
                                      gratuitiesCua: val,
                                      gratuitiesCount: freeInd + freeDbl + freeTpl + val
                                    });
                                  }}
                                  className="w-full bg-amber-50 border border-amber-300 rounded-lg px-2 py-1 text-xs font-black text-amber-900 text-center focus:outline-none focus:border-amber-500"
                                  title="Número de habitaciones cuádruples sin cargo (0,00 €)"
                                />
                                <div className="text-[9px] text-slate-500 text-center mt-0.5 font-medium">
                                  {Math.max(0, curCua - freeCua)} pago + {freeCua} gratis
                                </div>
                              </div>

                              {/* Campo editable de precio (€/hab) */}
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5 text-center">
                                  💶 Precio (€/hab):
                                </label>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="0,00"
                                  value={editingDistribution.priceCua !== undefined ? editingDistribution.priceCua : ""}
                                  onChange={(e) => setEditingDistribution({
                                    ...editingDistribution,
                                    priceCua: e.target.value
                                  })}
                                  className="w-full bg-blue-50/50 border border-blue-200 rounded-lg px-2 py-1 text-xs font-black text-blue-900 text-center focus:outline-none focus:border-blue-500"
                                  title="Precio por habitación (€)"
                                />
                                <div className="text-[9px] text-slate-500 text-center mt-0.5 font-medium">
                                  Subtotal: {(payingCuaRooms * (parseNum(editingDistribution.priceCua) || 0)).toFixed(2)} €
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Real-time Pax / Room Match Validator */}
                      <div className={`p-4 rounded-xl border flex items-center justify-between ${
                        isPaxMatch 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                          : "bg-rose-50 border-rose-300 text-rose-900"
                      }`}>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-xl">{isPaxMatch ? "✅" : "⚠️"}</span>
                          <div>
                            <div className="font-black text-sm">
                              {isPaxMatch ? "Distribución correcta" : "La distribución no coincide con el número total de personas."}
                            </div>
                            <div className="text-[11px] opacity-80 mt-0.5">
                              Calculadas: <strong>{calcPax}</strong> Pax ({calcRooms} habitaciones){totGratuities > 0 ? ` • ${totGratuities} gratuita${totGratuities > 1 ? "s" : ""} (${payingPax} de pago)` : ""} • Requeridas: <strong>{editingDistribution.pax}</strong> Pax
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold uppercase tracking-wider block opacity-70">Habitaciones</span>
                          <span className="text-lg font-black">{calcRooms}</span>
                        </div>
                      </div>

                      {distributionFormError && (
                        <div className="bg-rose-100 border border-rose-400 text-rose-800 text-xs px-3 py-2 rounded-lg font-bold">
                          {distributionFormError}
                        </div>
                      )}

                      {/* Observations */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Observaciones
                        </label>
                        <textarea
                          rows={2}
                          value={editingDistribution.observations}
                          onChange={(e) => setEditingDistribution({ ...editingDistribution, observations: e.target.value })}
                          placeholder="Notas internas sobre esta distribución..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Checkbox: Homogeneous Batch Apply */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-start gap-2.5">
                        <input
                          id="homo-checkbox"
                          type="checkbox"
                          checked={editingDistribution.applyToAllHomogeneous}
                          onChange={(e) => setEditingDistribution({
                            ...editingDistribution,
                            applyToAllHomogeneous: e.target.checked
                          })}
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="homo-checkbox" className="text-xs text-slate-700 cursor-pointer">
                          <strong className="block font-semibold">Aplicar a todos los días de la estancia con {editingDistribution.pax} Pax</strong>
                          <span className="text-slate-500 text-[11px]">
                            Si la reserva tiene varias noches con la misma ocupación, replicará esta distribución automáticamente en todas ellas.
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Modal Footer / Actions */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingDistribution(null)}
                          disabled={isSavingDistribution}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveDistribution("dejar_pendiente")}
                          disabled={isSavingDistribution}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition"
                        >
                          Dejar pendiente
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {isRevisionNecesaria && (
                          <button
                            type="button"
                            onClick={() => handleSaveDistribution("reconfirmar_anterior")}
                            disabled={isSavingDistribution}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1"
                          >
                            <span>✓</span> Reconfirmar distribución anterior
                          </button>
                        )}
                        {hasProposal && !isRevisionNecesaria && (
                          <button
                            type="button"
                            onClick={() => handleSaveDistribution("confirmar_propuesta")}
                            disabled={isSavingDistribution}
                            className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition"
                          >
                            Confirmar sin cambios
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSaveDistribution("guardar")}
                          disabled={!isPaxMatch || isSavingDistribution}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            !isPaxMatch || isSavingDistribution
                              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200"
                          }`}
                        >
                          {isSavingDistribution ? "Guardando..." : "Guardar distribución"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}


            {/* 4. RAW DATA EDITOR */}

            {activeTab === "table" && (

              <div className="bg-white rounded-lg shadow flex flex-col h-[70vh] animate-fade-in">

                {/* Table Toolbar */}

                <div className="p-4 border-b flex flex-wrap gap-4 justify-between items-center">

                  <div className="relative">

                    <DebouncedSearchInput
                      placeholder="Buscar en todos los campos..."
                      className="border rounded px-3 py-2 w-64 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={setSearchTerm}
                    />

                    {searchTerm && (

                      <button

                        onClick={() => setSearchTerm("")}

                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors"

                        title="Limpiar búsqueda"

                      >

                        <IconX size={14} />

                      </button>

                    )}

                  </div>

                  <div className="flex gap-2">

                    {data.some((r) => r._diff) && (

                      <button

                        onClick={() => setShowOnlyChanges(!showOnlyChanges)}

                        className={`px-4 py-2 rounded text-sm font-bold shadow-md transition flex items-center gap-2 ${showOnlyChanges ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200"}`}

                      >

                        <IconEdit size={16} />{" "}

                        {showOnlyChanges ? "Ver Todos" : "Ver Solo Cambios"}

                      </button>

                    )}

                    {(data || []).some((r) => r._diff) && (

                      <button

                        onClick={() => {

                          if (

                            window.confirm(

                              `¿Estás seguro de que quieres autorizar los ${(data || []).filter((r) => r._diff).length} cambios detectados?`,

                            )

                          ) {

                            acceptChanges();

                          }

                        }}

                        disabled={isSaving}

                        className={`px-4 py-2 rounded text-sm font-bold shadow-md transition flex items-center gap-2 ${isSaving

                          ? "bg-slate-400 cursor-wait text-white"

                          : "bg-green-600 hover:bg-green-700 text-white"

                          }`}

                      >

                        {isSaving ? (

                          <>

                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                            Guardando...

                          </>

                        ) : (

                          <>

                            <IconCheck size={16} /> Autorizar Cambios (

                            {(data || []).filter((r) => r._diff).length})

                          </>

                        )}

                      </button>

                    )}

                    <button

                      onClick={acceptChanges}

                      className="opacity-0 w-0 h-0 overflow-hidden"

                      aria-hidden="true"

                    >

                      Ocultos

                    </button>

                  </div>

                </div>

                {/* Table Container */}

                <div className="flex-1 overflow-auto custom-scrollbar">

                  <table className="w-full text-left text-sm border-collapse">

                    <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10 shadow-sm">

                      <tr>

                        <th className="p-3 font-bold border-b w-64 bg-slate-100 z-20">

                          ACCIÓN REQUERIDA / CAMBIOS

                        </th>

                        <th className="p-3 font-semibold border-b">

                          RESERVA

                        </th>

                        <th className="p-3 font-semibold border-b">

                          GRUPO / TITULAR

                        </th>

                        <th className="p-3 font-semibold border-b">

                          ENTRADA

                        </th>

                        <th className="p-3 font-semibold border-b">ESTADO</th>

                        <th className="p-3 font-semibold border-b text-center">

                          PAX

                        </th>

                        <th className="p-3 font-semibold border-b">

                          SEGMENTO

                        </th>

                        <th className="p-3 font-semibold border-b text-right">

                          IMPORTE

                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-100">

                      {(data || [])

                        .map((row, absIndex) => ({ row, absIndex }))

                        .filter(({ row }) => {

                          if (!row._diff) return false;

                          if (searchTerm) {

                            const lowerTerm = searchTerm.toLowerCase();

                            const matches = Object.values(row).some((val) =>

                              String(val).toLowerCase().includes(lowerTerm),

                            );

                            if (!matches) return false;

                          }

                          return true;

                        })

                        .map(({ row, absIndex }) => {

                          let rowClass =

                            "hover:bg-slate-50 transition-colors group";

                          let badge = null;

                          let btnColor = "bg-slate-800 hover:bg-slate-900";

                          let changeDetails = [];

                          if (row._diff === "new") {

                            rowClass += " bg-green-50/30";

                            badge = (

                              <span className="text-green-600 font-black text-[10px] uppercase">

                                NUEVO

                              </span>

                            );

                            btnColor = "bg-green-600 hover:bg-green-700";

                            changeDetails.push("Nuevo registro importado");

                          } else if (row._diff === "cancelled") {

                            rowClass += " bg-red-50/30";

                            badge = (

                              <span className="text-red-600 font-black text-[10px] uppercase">

                                CANCELAR

                              </span>

                            );

                            btnColor = "bg-red-600 hover:bg-red-700";

                            changeDetails.push("Estado cambiado a ANULADA");

                          } else if (row._diff === "modified") {

                            rowClass += " bg-blue-50/30";

                            badge = (

                              <span className="text-blue-600 font-black text-[10px] uppercase">

                                MODIFICADO

                              </span>

                            );

                            btnColor = "bg-blue-600 hover:bg-blue-700";

                            // Render specific changes

                            if (row._changes) {

                              Object.keys(row._changes).forEach((k) => {

                                const ch = row._changes[k];

                                changeDetails.push(

                                  `${k}: ${ch.old} → ${ch.new}`,

                                );

                              });

                            } else {

                              changeDetails.push("Datos actualizados");

                            }

                          }

                          return (

                            <tr

                              key={String(row.Reserva)}

                              className={rowClass}

                            >

                              <td className="p-3 border-b border-r border-slate-200 bg-white/50 sticky left-0 z-10 w-64 align-top">

                                <div className="flex flex-col gap-2">

                                  <div className="flex gap-1">

                                    <button

                                      onClick={() => {

                                        const reservaID = normalizeId(

                                          row["Reserva"],

                                        );

                                        const confirmMsg =

                                          row._diff === "cancelled"

                                            ? `¿Confirmas la CANCELACIÓN del grupo ${row["Nombre del Grupo"]}?`

                                            : `¿Confirmas la actualización del grupo ${row["Nombre del Grupo"]}?`;

                                        if (window.confirm(confirmMsg)) {

                                          // log

                                          console.log(

                                            `[Save] Autorizando reserva ${reservaID}:`,

                                            row,

                                          );

                                          // Bloquear en la referencia para el listener onSnapshot

                                          authorizingIds.current.add(

                                            reservaID.trim(),

                                          );

                                          // Guardar estado previo para posible rollback

                                          const rowStateBefore = { ...row };

                                          // OPTIMISTIC UPDATE: buscar por ID de reserva (robusto, no por índice)

                                          setData((prevData) =>

                                            prevData.map((r) =>

                                              normalizeId(r["Reserva"]) ===

                                                reservaID

                                                ? {

                                                  ...r,

                                                  _diff: null,

                                                  _changes: null,

                                                }

                                                : r,

                                            ),

                                          );

                                          const batch = db.batch();

                                          // Sanitize: eliminar campos internos y undefined

                                          const cleanedRow = {};

                                          Object.keys(row).forEach((k) => {

                                            if (

                                              !k.startsWith("_") &&

                                              row[k] !== undefined

                                            ) {

                                              cleanedRow[k] = row[k];

                                            }

                                          });

                                          const docRef = db

                                            .collection("groups")

                                            .doc(reservaID);

                                          batch.set(

                                            docRef,

                                            {

                                              ...cleanedRow,

                                              _diff:

                                                firebase.firestore.FieldValue.delete(),

                                              _changes:

                                                firebase.firestore.FieldValue.delete(),

                                              updatedAt:

                                                firebase.firestore.FieldValue.serverTimestamp(),

                                            },

                                            { merge: true },

                                          );

                                          // Si el doc original tenía un ID diferente (ej: "71375.0" vs "71375"),

                                          // eliminarlo para evitar que el duplicado restaure los datos viejos

                                          if (

                                            row._docId &&

                                            row._docId !== reservaID

                                          ) {

                                            console.log(

                                              `🗑️ Eliminando doc duplicado: "${row._docId}" (normalizado: "${reservaID}")`,

                                            );

                                            batch.delete(

                                              db

                                                .collection("groups")

                                                .doc(row._docId),

                                            );

                                          }

                                          console.log(

                                            "[Save] Haciendo commit para",

                                            reservaID,

                                            "con Entrada:",

                                            cleanedRow["Entrada"],

                                            "Pax:",

                                            cleanedRow["Pax."],

                                          );

                                          batch

                                            .commit()

                                            .then(() => {

                                              console.log(

                                                "✅ Reserva individual guardada en Firestore:",

                                                reservaID,

                                              );

                                              // Mantener el bloqueo 6s para que onSnapshot no restaure datos viejos

                                              setTimeout(() => {

                                                authorizingIds.current.delete(

                                                  reservaID.trim(),

                                                );

                                                console.log(

                                                  "🔓 authorizingId liberado:",

                                                  reservaID,

                                                );

                                              }, 6000);

                                            })

                                            .catch((err) => {

                                              console.error(

                                                "❌ ERROR AL GUARDAR:",

                                                err,

                                              );

                                              alert(

                                                "Error al guardar: " +

                                                err.message,

                                              );

                                              authorizingIds.current.delete(

                                                reservaID.trim(),

                                              );

                                              // ROLLBACK: Restaurar el diff si falló

                                              setData((prevData) => {

                                                return prevData.map((r) =>

                                                  String(r.Reserva).trim() ===

                                                    reservaID.trim()

                                                    ? rowStateBefore

                                                    : r,

                                                );

                                              });

                                            });

                                        }

                                      }}

                                      className={`flex-1 py-1.5 rounded shadow-sm text-white font-bold text-[10px] flex items-center justify-center gap-1.5 transition-transform active:scale-95 ${btnColor}`}

                                    >

                                      <IconCheck size={12} stroke={3} />{" "}

                                      {badge} - AUTORIZAR

                                    </button>

                                    {/* Botón Ver Ficha */}

                                    <button

                                      onClick={() => {

                                        const reservaID = normalizeId(row["Reserva"]);

                                        // Buscar en groupedData (vista actual)

                                        const fichaGroup = (groupedData || []).find(g => g.id === reservaID);

                                        if (fichaGroup) {

                                          openFicha(fichaGroup);

                                        } else {

                                          // Fallback: buscar en data raw y construir objeto compatible

                                          const rawRow = (data || []).find(r => normalizeId(r["Reserva"]) === reservaID);

                                          if (rawRow) {

                                            openFicha({

                                              id: reservaID,

                                              name: rawRow["Nombre del Grupo"] || rawRow["Empresa/Agencia"] || reservaID,

                                              agency: rawRow["Empresa/Agencia"] || "",

                                              arrival: rawRow["Entrada"],

                                              departure: rawRow["Salida"],

                                              status: rawRow["Estado"] || "",

                                              hotel: rawRow["Hotel_Asignado"] || rawRow["Hotel"] || "",

                                              totalPax: parseNum(rawRow["Pax."] || "0"),

                                              totalRevenue: parseNum(rawRow["Importe(*)"] || "0"),

                                              totalPaid: parseNum(rawRow["Com_Pagado"] || "0"),

                                              totalRooms: 0,

                                              totalCommission: 0,

                                              totalNights: parseNum(rawRow["Noches"] || "0"),

                                              records: [rawRow],

                                            });

                                          }

                                        }

                                      }}

                                      className="px-2 py-1.5 bg-slate-100 text-slate-500 rounded hover:bg-indigo-100 hover:text-indigo-600 transition-colors"

                                      title="Ver Ficha del Grupo"

                                    >

                                      <IconEye size={12} />

                                    </button>

                                    <button

                                      onClick={() => {

                                        if (

                                          window.confirm(

                                            "¿Descartar este cambio sugerido?",

                                          )

                                        ) {

                                          setData((prevData) =>

                                            prevData.map((r) =>

                                              normalizeId(r["Reserva"]) ===

                                                normalizeId(row["Reserva"])

                                                ? {

                                                  ...r,

                                                  _diff: null,

                                                  _changes: null,

                                                }

                                                : r,

                                            ),

                                          );

                                        }

                                      }}

                                      className="px-2 bg-slate-200 text-slate-500 rounded hover:bg-slate-300 transition"

                                      title="Descartar"

                                    >

                                      <IconX size={12} />

                                    </button>

                                  </div>

                                  {/* Change Details */}

                                  <div className="text-[9px] text-slate-500 font-mono bg-white p-1.5 rounded border border-slate-100 shadow-sm leading-relaxed whitespace-pre-wrap">

                                    {changeDetails.map((d, i) => (

                                      <div

                                        key={i}

                                        className={

                                          d.includes("→")

                                            ? "text-blue-600 font-bold"

                                            : ""

                                        }

                                      >

                                        • {d}

                                      </div>

                                    ))}

                                  </div>

                                </div>

                              </td>

                              <td className="p-3 border-b font-mono text-xs font-bold text-slate-500 align-top">

                                {row["Reserva"]}

                              </td>

                              <td className="p-3 border-b font-bold text-slate-700 text-xs align-top">

                                {row["Nombre del Grupo"] ||

                                  row["Empresa/Agencia"]}

                              </td>

                              <td className="p-3 border-b text-xs align-top">

                                {formatDate(row["Entrada"])}

                              </td>

                              <td className="p-3 border-b text-xs font-bold align-top">

                                {row["Estado"]}

                              </td>

                              <td className="p-3 border-b text-center text-xs align-top">

                                {row["Pax."]}

                              </td>

                              <td className="p-3 border-b text-xs align-top font-semibold text-slate-600 uppercase">

                                {row["Segment."]}

                              </td>

                              <td className="p-3 border-b text-right text-xs font-mono align-top">

                                {parseNum(row["Importe(*)"]).toLocaleString(

                                  "es-ES",

                                  {

                                    minimumFractionDigits: 2,

                                    maximumFractionDigits: 2,

                                  },

                                )}{" "}

                                €

                              </td>

                            </tr>

                          );

                        })}

                    </tbody>

                    {(data || []).filter((r) => r._diff).length === 0 && (

                      <tbody>

                        <tr>

                          <td

                            colSpan={columns.length + 1}

                            className="p-12 text-center text-slate-400"

                          >

                            <div className="flex flex-col items-center gap-2 animate-fade-in mt-8 mb-8">

                              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-2 shadow-sm">

                                <IconCheck size={36} />

                              </div>

                              <p className="font-bold text-2xl text-slate-700">

                                ¡Todo Sincronizado!

                              </p>

                              <p className="text-sm text-slate-500 mb-6">

                                No hay cambios pendientes de revisión.

                              </p>

                              <button

                                onClick={() => window.location.reload()}

                                className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 shadow-md btn-glow"

                              >

                                <IconCheck size={18} />

                                Aceptar y Continuar

                              </button>

                            </div>

                          </td>

                        </tr>

                      </tbody>

                    )}

                  </table>

                </div>

                <div className="p-2 border-t text-xs text-gray-500 text-center bg-slate-50 flex justify-between items-center px-4">

                  <span>

                    Mostrando solo registros con cambios (

                    {(data || []).filter((r) => r._diff).length})

                  </span>

                  <div className="flex gap-4">

                    <div className="flex items-center gap-1">

                      <div className="w-2 h-2 rounded-full bg-green-500"></div>{" "}

                      Nuevo

                    </div>

                    <div className="flex items-center gap-1">

                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>{" "}

                      Modificado

                    </div>

                    <div className="flex items-center gap-1">

                      <div className="w-2 h-2 rounded-full bg-red-500"></div>{" "}

                      Cancelado

                    </div>

                  </div>

                </div>

              </div>

            )}

            
            {/* 5. MÓDULO OBJETIVOS DE GRUPOS Y TARIFAS (Reqs 22-33) */}
            {activeTab === "targets" && (
              <GroupTargetsModule
                data={data}
                processedData={processedData}
                dailyOccupancyList={dailyOccupancyList}
                boardPricingConfig={boardPricingConfig}
              />
            )}

            {/* Modal Añadir Columna */}

            {showColumnModal && (

              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                <div className="bg-white p-6 rounded-lg shadow-xl w-96">

                  <h3 className="text-lg font-bold mb-4">

                    Añadir Nueva Columna

                  </h3>

                  <input

                    type="text"

                    placeholder="Nombre (ej. Estado, Notas)"

                    className="w-full border p-2 rounded mb-4"

                    value={newColumnName}

                    onChange={(e) => setNewColumnName(e.target.value)}

                  />

                  <div className="flex justify-end gap-2">

                    <button

                      onClick={() => setShowColumnModal(false)}

                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"

                    >

                      Cancelar

                    </button>

                    <button

                      onClick={addNewColumn}

                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"

                    >

                      Añadir

                    </button>

                  </div>

                </div>

              </div>

            )}

            {/* Modal Resumen de Importación */}

            {showImportSummary && importSummaryData && (

              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">

                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-slate-200">

                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white relative">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">

                        <IconCheck size={24} stroke={3} />

                      </div>

                      <div>

                        <h3 className="text-xl font-black tracking-tight">

                          Importación Finalizada

                        </h3>

                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">

                          Resumen de sincronización

                        </p>

                      </div>

                    </div>

                    <button

                      onClick={() => setShowImportSummary(false)}

                      className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"

                    >

                      <IconX size={20} />

                    </button>

                  </div>

                  <div className="p-8 space-y-6">

                    <div class="grid grid-cols-2 gap-4">

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2 flex items-center justify-between">

                        <div>

                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">

                            Hotel Asignado

                          </span>

                          <span className="text-lg font-black text-blue-800">

                            {importSummaryData.detectedHotel || "Automático"}

                          </span>

                        </div>

                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">

                          <IconCheck size={20} className="text-blue-600" />

                        </div>

                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">

                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">

                          Registros Procesados

                        </span>

                        <span className="text-2xl font-black text-slate-800">

                          {importSummaryData.totalRowsProcessed}

                        </span>

                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">

                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">

                          Grupos Únicos

                        </span>

                        <span className="text-2xl font-black text-slate-800">

                          {importSummaryData.uniqueGroups}

                        </span>

                      </div>

                    </div>

                    <div className="space-y-3">

                      <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">

                        <div className="flex items-center gap-3">

                          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">

                            <IconPlus size={16} />

                          </div>

                          <span className="text-sm font-bold text-emerald-900">

                            Nuevos Grupos

                          </span>

                        </div>

                        <span className="text-lg font-black text-emerald-600">

                          +{importSummaryData.newGroupsCount}

                        </span>

                      </div>

                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100">

                        <div className="flex items-center gap-3">

                          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">

                            <IconEdit size={16} />

                          </div>

                          <span className="text-sm font-bold text-blue-900">

                            Modificaciones

                          </span>

                        </div>

                        <span className="text-lg font-black text-blue-600">

                          {importSummaryData.modifiedGroupsCount}

                        </span>

                      </div>

                    </div>

                    {importSummaryData.errors &&

                      importSummaryData.errors.length > 0 && (

                        <div className="mt-4 p-4 bg-rose-50 rounded-xl border border-rose-100 overflow-y-auto max-h-40 custom-scrollbar">

                          <div className="flex items-center gap-2 mb-2 text-rose-800 font-bold text-sm">

                            <IconAlertTriangle size={16} />

                            Errores o Advertencias (

                            {importSummaryData.errors.length})

                          </div>

                          <ul className="list-disc pl-5 space-y-1 text-xs text-rose-600">

                            {importSummaryData.errors

                              .slice(0, 10)

                              .map((err, i) => (

                                <li key={i}>{err}</li>

                              ))}

                            {importSummaryData.errors.length > 10 && (

                              <li className="list-none text-rose-400 mt-2 italic font-medium">

                                + {importSummaryData.errors.length - 10}{" "}

                                errores más...

                              </li>

                            )}

                          </ul>

                        </div>

                      )}

                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">

                      <div className="flex justify-between text-xs font-bold">

                        <span className="text-slate-500 uppercase tracking-wider">

                          Total Pax en archivo:

                        </span>

                        <span className="text-slate-800">

                          {importSummaryData.totalPax}

                        </span>

                      </div>

                      <div className="flex justify-between text-xs font-bold">

                        <span className="text-slate-500 uppercase tracking-wider">

                          Importe Total en archivo:

                        </span>

                        <span className="text-emerald-600">

                          {importSummaryData.totalRevenue.toLocaleString(

                            "es-ES",

                            { style: "currency", currency: "EUR" },

                          )}

                        </span>

                      </div>

                    </div>

                    <button

                      onClick={() => {

                        setShowImportSummary(false);

                        setActiveTab("table");

                        setShowOnlyChanges(true);

                      }}

                      className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"

                    >

                      Revisar Cambios Detallados

                    </button>

                  </div>

                </div>

              </div>

            )}

            {/* Modal Resultados IA */}

            {showAiModal && (

              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

                <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in">

                  <div className="p-4 border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-lg flex justify-between items-center">

                    <h3 className="font-bold flex items-center gap-2">

                      <IconBrain className="text-purple-300" />

                      {aiResult ? aiResult.title : "Analizando datos..."}

                    </h3>

                    <button

                      onClick={() => setShowAiModal(false)}

                      className="text-slate-400 hover:text-white"

                    >

                      &times;

                    </button>

                  </div>

                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1">

                    {isAiLoading ? (

                      <div className="flex flex-col items-center justify-center py-10">

                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>

                        <p className="text-slate-500 animate-pulse-slow text-center">

                          Gemini está analizando tus reservas... <br />

                          <span className="text-xs">

                            Buscando patrones y rentabilidad.

                          </span>

                        </p>

                      </div>

                    ) : (

                      <div

                        className="prose prose-sm max-w-none text-slate-700"

                        dangerouslySetInnerHTML={{

                          __html: marked.parse(aiResult?.content || ""),

                        }}

                      ></div>

                    )}

                  </div>

                  <div className="p-4 border-t bg-slate-50 text-right rounded-b-lg">

                    <button

                      onClick={() => setShowAiModal(false)}

                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition"

                    >

                      Cerrar

                    </button>

                  </div>

                </div>

              </div>

            )}

            {showFichaModal && selectedGroupFicha && (

              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2">

                <div className="bg-white rounded-xl shadow-2xl w-[98vw] h-[95vh] overflow-y-auto flex flex-col animate-fade-in border border-slate-200 text-sm">

                  {/* CENTRO DE MANDO NEXUS (Header + Acciones) */}

                  {(() => {

                    // --- CÁLCULOS COMPARTIDOS (FINANZAS Y FECHAS) ---

                    const now = new Date();

                    let daysToArrival = 0;

                    if (selectedGroupFicha.arrival) {

                      const d = new Date(selectedGroupFicha.arrival);

                      if (!isNaN(d.getTime())) {

                        const diffTime = d - now;

                        daysToArrival = Math.ceil(

                          diffTime / (1000 * 60 * 60 * 24),

                        );

                      }

                    }

                    const releaseDateStr =

                      selectedGroupFicha.records[0]?.["Com_Vencimiento_Rel"];

                    let daysToRelease = null;

                    if (releaseDateStr) {

                      const releaseDate = new Date(releaseDateStr);

                      if (!isNaN(releaseDate.getTime())) {

                        daysToRelease = Math.ceil(

                          (releaseDate - now) / (1000 * 60 * 60 * 24),

                        );

                      }

                    }

                    const rawRoomList = getEconomicRoomingItems(selectedGroupFicha.records[0]?.["RoomingList_JSON"], "ficha-totals");
                    // Safety guard: if list is massively corrupted, cap it to avoid freezing
                    const roomList = rawRoomList.length > 500 ? [] : rawRoomList;

                    let totalB10 = 0,

                      totalI10 = 0,

                      totalB21 = 0,

                      totalI21 = 0;

                    roomList.forEach((item) => {

                      const sub = parseFloat(item.total) || 0;

                      const rate = item.iva == 21 ? 1.21 : 1.1;

                      const base = sub / rate;

                      if (item.iva == 21) {

                        totalB21 += base;

                        totalI21 += sub - base;

                      } else {

                        totalB10 += base;

                        totalI10 += sub - base;

                      }

                    });

                    const grandTotal = roomList.reduce(

                      (acc, i) => acc + (parseFloat(i.total) || 0),

                      0,

                    );

                    const totalComision = roomList.reduce(

                      (acc, i) => acc + (parseFloat(i.comision?.total_comision) || 0),

                      0,

                    );

                    const firstRec = selectedGroupFicha.records[0] || {};
                    const isGroupCredito = Boolean(
                      firstRec["Es_Credito"] === true ||
                      firstRec["Es_Credito"] === "true" ||
                      firstRec["Com_Es_Credito"] === true ||
                      selectedGroupFicha.records?.some(r => r["Es_Credito"] === true || r["Es_Credito"] === "true" || r["Com_Es_Credito"] === true)
                    );

                    let baseTotal = grandTotal;

                    if (grandTotal === 0) {

                      if (firstRec.total !== undefined && firstRec.total !== null && firstRec.total !== "") {

                        baseTotal = parseFloat(firstRec.total) || 0;

                      } else if (firstRec["Importe(*)"] !== undefined && firstRec["Importe(*)"] !== null && firstRec["Importe(*)"] !== "") {

                        baseTotal = parseFloat(firstRec["Importe(*)"]) || 0;

                      }

                    }

                    let netTotal = baseTotal - totalComision;

                    let totalPaidFromPlan = 0;
                    const processedFichaPlans = new Set();
                    const fichaUniqueHotels = Array.from(
                      new Set(
                        (selectedGroupFicha.records || []).map(
                          (r) => r["Hotel_Asignado"] || r["Hotel"] || "General"
                        )
                      )
                    );

                    fichaUniqueHotels.forEach((hotelName) => {
                      const hRec = (selectedGroupFicha.records || []).find(
                        (r) => (r["Hotel_Asignado"] || r["Hotel"] || "General") === hotelName
                      ) || selectedGroupFicha.records[0];

                      if (hRec && hRec.PaymentPlan_JSON && hRec.PaymentPlan_JSON !== "[]" && !processedFichaPlans.has(hRec.PaymentPlan_JSON)) {
                        processedFichaPlans.add(hRec.PaymentPlan_JSON);
                        try {
                          const plan = JSON.parse(hRec.PaymentPlan_JSON);
                          if (Array.isArray(plan)) {
                            plan.forEach((p) => {
                              if (p.status === "Cobrado")
                                totalPaidFromPlan += parseFloat(p.amount) || 0;
                            });
                          }
                        } catch (e) { }
                      }
                    });

                    const manualPaid = parseNum(
                      selectedGroupFicha.records[0]?.["Com_Pagado"] || "0",
                    );

                    const totalPaid = Math.max(manualPaid, totalPaidFromPlan);

                    const pendingAmount = Math.max(0, netTotal - totalPaid);

                    const urgentPayments = [];

                    if (!isGroupCredito) {
                      const todayForAlert = new Date();
                      todayForAlert.setHours(0, 0, 0, 0);
                      const processedUrgentPlans = new Set();

                      fichaUniqueHotels.forEach((hotelName) => {
                        const hRec = (selectedGroupFicha.records || []).find(
                          (r) => (r["Hotel_Asignado"] || r["Hotel"] || "General") === hotelName
                        ) || selectedGroupFicha.records[0];

                        if (hRec && hRec.PaymentPlan_JSON && hRec.PaymentPlan_JSON !== "[]" && !processedUrgentPlans.has(hRec.PaymentPlan_JSON)) {
                          processedUrgentPlans.add(hRec.PaymentPlan_JSON);
                          try {
                            const plan = JSON.parse(hRec.PaymentPlan_JSON);
                            if (Array.isArray(plan)) {
                              plan.forEach((p) => {
                                if (p.status !== "Cobrado") {
                                  const d = new Date(toInputDate(p.date));
                                  d.setHours(0, 0, 0, 0);
                                  const diff = Math.ceil(
                                    (d - todayForAlert) / (1000 * 60 * 60 * 24),
                                  );
                                  if (diff <= 2)
                                    urgentPayments.push({
                                      ...p,
                                      hotel: hotelName,
                                    });
                                }
                              });
                            }
                          } catch (e) { }
                        }
                      });
                    }

                    const hotelAsignado =

                      selectedGroupFicha.records[0]?.["Hotel_Asignado"] || "";

                    const isCumbria = hotelAsignado

                      .toLowerCase()

                      .includes("cumbria");

                    const headerBg = isCumbria

                      ? "bg-[#0f172a]"

                      : "bg-[#2d5a43]";

                    const iconBg = isCumbria

                      ? "bg-indigo-500"

                      : "bg-emerald-500";

                    const titleColor = isCumbria

                      ? "text-indigo-400"

                      : "text-emerald-400";

                    const forecastColor = isCumbria

                      ? "text-indigo-300"

                      : "text-emerald-300";

                    return (

                      <>

                        <div

                          className={`${headerBg} text-white p-4 border-b border-white/10 shrink-0 relative overflow-hidden`}

                        >

                          {/* Decorative background element */}

                          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>

                          <div className="flex justify-between items-center gap-6 relative z-10">

                            {/* LEFT: Identity & Status */}

                            <div className="flex gap-4 items-center">

                              <div

                                className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shadow-2xl shrink-0 border border-white/20`}

                              >

                                <IconUsers size={24} />

                              </div>

                              <div>

                                <div className="flex items-center gap-3">

                                  {isEditingGroupName ? (

                                    <div className="flex items-center gap-2">

                                      <input

                                        type="text"

                                        className="bg-white/10 border border-white/20 text-2xl font-black tracking-tight leading-none rounded-xl px-3 py-1 text-white outline-none focus:ring-2 focus:ring-white/30 uppercase max-w-[400px]"

                                        value={tempGroupName}

                                        onChange={(e) => setTempGroupName(e.target.value)}

                                        onKeyDown={(e) => {

                                          if (e.key === "Enter") {

                                            saveGroupName();

                                          } else if (e.key === "Escape") {

                                            setIsEditingGroupName(false);

                                            setTempGroupName(selectedGroupFicha.name || "");

                                          }

                                        }}

                                        autoFocus

                                      />

                                      <button

                                        onClick={saveGroupName}

                                        className="p-1 hover:bg-white/10 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"

                                        title="Guardar nombre"

                                      >

                                        <IconCheck size={20} strokeWidth={3} />

                                      </button>

                                      <button

                                        onClick={() => {

                                          setIsEditingGroupName(false);

                                          setTempGroupName(selectedGroupFicha.name || "");

                                        }}

                                        className="p-1 hover:bg-white/10 rounded-lg text-rose-400 hover:text-rose-300 transition-colors"

                                        title="Cancelar"

                                      >

                                        <IconX size={20} strokeWidth={3} />

                                      </button>

                                    </div>

                                  ) : (

                                    <div className="flex items-center gap-2 group/title">

                                      <h3

                                        onClick={() => {

                                          setIsEditingGroupName(true);

                                          setTempGroupName(selectedGroupFicha.name || "");

                                        }}

                                        className={`text-2xl font-black tracking-tight leading-none ${titleColor} drop-shadow-sm cursor-pointer hover:opacity-80 transition-opacity`}

                                        title="Haz clic para editar el nombre del grupo"

                                      >

                                        {selectedGroupFicha.name || "NOMBRE DEL GRUPO"}

                                      </h3>

                                      <button

                                        onClick={() => {

                                          setIsEditingGroupName(true);

                                          setTempGroupName(selectedGroupFicha.name || "");

                                        }}

                                        className="opacity-0 group-hover/title:opacity-100 p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-all"

                                        title="Editar nombre"

                                      >

                                        <IconEdit size={16} />

                                      </button>

                                    </div>

                                  )}

                                  <div className="flex gap-1.5 h-fit">

                                    {(() => {

                                      // Prioridad: Com_Estado_Interno > Estado (el campo del Excel no debe sobrescribir el estado interno)

                                      const internalStatus =

                                        selectedGroupFicha.records[0]?.[

                                        "Com_Estado_Interno"

                                        ];

                                      const externalStatus =

                                        selectedGroupFicha.records[0]?.[

                                        "Estado"

                                        ];

                                      // Solo usar Estado externo si NO hay un Com_Estado_Interno definido

                                      const effectiveStatus =

                                        internalStatus ||

                                        selectedGroupFicha.records[0]?.[

                                        "Segment."

                                        ];

                                      const st = getStatusProps(

                                        effectiveStatus,

                                        selectedGroupFicha.arrival,

                                        internalStatus

                                          ? null

                                          : externalStatus,

                                      );

                                      return (

                                        <span

                                          className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase shadow-sm ${st.text}`}

                                        >

                                          {st.label}

                                        </span>

                                      );

                                    })()}

                                    <span className="bg-white/10 px-2 py-1 rounded-lg text-[9px] font-black text-white/80 uppercase border border-white/10">

                                      {selectedGroupFicha.records[0]?.[

                                        "Régimen"

                                      ] || "HD"}

                                    </span>

                                    <div className="relative inline-flex items-center group/seg" title="Modificar segmento">
                                      <select
                                        value={
                                          ((selectedGroupFicha.records[0]?.["Segment."] || "GRUPOS").toString().trim().toUpperCase())
                                        }
                                        onChange={(e) => handleSegmentChange(e.target.value)}
                                        className="bg-blue-500/25 hover:bg-blue-500/35 text-blue-100 border border-blue-400/30 hover:border-blue-400/50 pl-2 pr-5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider appearance-none outline-none cursor-pointer transition-all shadow-sm"
                                      >
                                        {availableSegments.map((s) => (
                                          <option key={s} value={s} className="bg-slate-800 text-white text-xs">
                                            {s}
                                          </option>
                                        ))}
                                        <option value="__CUSTOM__" className="bg-slate-900 text-cyan-300 font-bold">
                                          + OTRO SEGMENTO...
                                        </option>
                                      </select>
                                      <IconChevronDown
                                        size={10}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-blue-200/70 pointer-events-none group-hover/seg:text-blue-100"
                                      />
                                    </div>

                                    {isGroupCredito && (
                                      <span
                                        onClick={() => {
                                          if (confirm("¿Deseas desactivar la condición de crédito para este grupo y volver a prepago?")) {
                                            updateGroupMetadata(selectedGroupFicha.id, "Es_Credito", false);
                                          }
                                        }}
                                        className="bg-indigo-500/30 hover:bg-indigo-500/40 text-indigo-100 border border-indigo-400/40 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                                        title="Grupo a Crédito (Sin pago anticipado). Clic para modificar."
                                      >
                                        <IconCreditCard size={11} stroke={2.5} />
                                        CRÉDITO
                                      </span>
                                    )}

                                  </div>

                                </div>

                                <p className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.15em] mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <span className="text-white/60">
                                    {selectedGroupFicha.records[0]?.["Fiscal_RazonSocial"] || selectedGroupFicha.records[0]?.["Empresa/Agencia"] || selectedGroupFicha.records[0]?.["Empresa"] || "VENTA DIRECTA"}
                                  </span>
                                  <span className="opacity-30">•</span>
                                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-white">
                                    {selectedGroupFicha.totalPax} PAX
                                  </span>
                                  <span className="opacity-30">•</span>
                                  <span className="text-white/40">
                                    REF:{" "}
                                    {
                                      selectedGroupFicha.records[0]?.[
                                      "Reserva"
                                      ]
                                    }
                                  </span>

                                  {(() => {
                                    const r = selectedGroupFicha.records[0] || {};
                                    const entrada = r["Entrada"];
                                    const salida = r["Salida"];
                                    const noches = r["Noches"] || r["noches"];
                                    if (!entrada && !salida) return null;
                                    const fmtDate = (d) => {
                                      if (!d) return "—";
                                      const s = String(d).trim();
                                      // YYYY-MM-DD → DD/MM/YYYY
                                      if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
                                        const [y, m, dd] = s.split("-");
                                        return `${dd}/${m}/${y}`;
                                      }
                                      return s;
                                    };
                                    return (
                                      <>
                                        <span className="opacity-30">•</span>
                                        <span className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded text-emerald-200 font-black text-[10px]">
                                          <IconCalendar size={11} className="opacity-70 shrink-0" />
                                          {fmtDate(entrada)}
                                          <span className="opacity-50 mx-0.5">→</span>
                                          {fmtDate(salida)}
                                          {noches && (
                                            <span className="opacity-60 ml-0.5">({noches}n)</span>
                                          )}
                                        </span>
                                      </>
                                    );
                                  })()}

                                  {(() => {
                                    const r = selectedGroupFicha.records[0] || {};
                                    const contactName = r["Com_Nombre_Contacto"] || r["Persona_Contacto"];
                                    const contactEmail = r["Com_Email_Contacto"] || r["Email"];
                                    const contactPhone = r["Com_Telefono_Contacto"] || r["Telefono"] || r["Teléfono"];

                                    if (!contactName && !contactEmail && !contactPhone) return null;

                                    return (
                                      <>
                                        <span className="opacity-30">•</span>
                                        <span className="flex items-center gap-3 text-white/70">
                                          {contactName && (
                                            <span className="flex items-center gap-1.5 font-black text-white/90">
                                              <IconUser size={12} className="opacity-60" />
                                              {contactName}
                                            </span>
                                          )}
                                          {contactEmail && (
                                            <span className="flex items-center gap-1">
                                              <IconMail size={12} className="opacity-60" />
                                              {contactEmail}
                                            </span>
                                          )}
                                          {contactPhone && (
                                            <span className="flex items-center gap-1">
                                              <IconPhone size={12} className="opacity-60" />
                                              {contactPhone}
                                            </span>
                                          )}
                                        </span>
                                      </>
                                    );
                                  })()}

                                  {(
                                    selectedGroupFicha.records[0]?.[
                                    "Reserva"
                                    ] || ""
                                  )
                                    .toString()
                                    .startsWith("PRES") && (

                                      <>

                                        <span className="opacity-30">•</span>

                                        <button

                                          onClick={(e) => {

                                            e.stopPropagation();

                                            handleMergeGroup(

                                              selectedGroupFicha,

                                            );

                                          }}

                                          className="ml-2 px-2 py-0.5 bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/30 rounded text-[9px] font-black text-indigo-100 uppercase transition-all flex items-center gap-1 shadow-sm"

                                          title="Fusionar con Reserva PMS"

                                        >

                                          <IconPlus size={10} strokeWidth={3} />{" "}

                                          Fusionar PMS

                                        </button>

                                      </>

                                    )}

                                </p>

                              </div>

                            </div>

                            {/* RIGHT: Financial Summary — COBRADO | PENDIENTE | TOTAL */}

                            <div className="flex items-center gap-5 bg-black/20 p-3 px-6 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md">

                              {/* COBRADO */}

                              <div className="text-center">

                                <p className="text-[8px] font-black uppercase opacity-50 tracking-widest mb-1">

                                  Cobrado

                                </p>

                                <p

                                  className={`text-sm font-black tabular-nums ${totalPaid >= netTotal - 0.01 && netTotal > 0 ? "text-emerald-400" : "text-orange-400"}`}

                                >

                                  {totalPaid.toLocaleString("es-ES", {

                                    useGrouping: true,

                                    minimumFractionDigits: 2,

                                    maximumFractionDigits: 2,

                                  })}

                                  €

                                </p>

                                {netTotal > 0 && (

                                  <span className="text-[8px] font-bold opacity-40 leading-none">

                                    (

                                    {totalPaid >= netTotal - 0.01
                                      ? 100
                                      : Math.min(99, Math.round((totalPaid / netTotal) * 100))
                                    }

                                    %)

                                  </span>

                                )}

                              </div>

                              <div className="w-px h-8 bg-white/10"></div>

                                                             {/* PENDIENTE o PAGADO */}

                                {(() => {
                                  const overpaidAmount = Math.max(0, totalPaid - netTotal);

                                  if (overpaidAmount > 0.01 && netTotal > 0) {
                                    return (
                                      <div className="text-center">
                                        <p className="text-[8px] font-black uppercase text-amber-300 tracking-widest mb-1">Pagado de más</p>
                                        <p className="text-sm font-black text-amber-300 tabular-nums">
                                          {overpaidAmount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                                        </p>
                                      </div>
                                    );
                                  }

                                  if (totalPaid >= netTotal - 0.01 && netTotal > 0) {

                                    return (

                                      <div className="text-center">

                                       <span className="inline-block px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">

                                         ✓ PAGADO

                                       </span>

                                     </div>

                                   );

                                 } else {

                                   const pVal = Math.max(0, netTotal - totalPaid);

                                   return (

                                     <div className="text-center">

                                       <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isGroupCredito ? "text-indigo-300 flex items-center justify-center gap-1" : "text-rose-300"}`}>
                                        {isGroupCredito ? <><IconCreditCard size={10} stroke={2.5} /> A Crédito</> : "Pendiente"}
                                      </p>

                                      <p className={`text-sm font-black tabular-nums ${isGroupCredito ? "text-indigo-200" : "text-rose-400"}`}>{pVal.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€</p>

                                      {isGroupCredito && (
                                        <span className="text-[8px] font-bold text-white/50 block leading-none mt-0.5">
                                          Sin prepago
                                        </span>
                                      )}

                                     </div>

                                   );

                                 }

                               })()}

                              <div className="w-px h-8 bg-white/10"></div>

                              {/* TOTAL */}

                              <div className="text-right">

                                <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-0.5">

                                  Total

                                </p>

                                <p className="text-3xl font-black text-white drop-shadow-lg tabular-nums leading-none">

                                  {netTotal.toLocaleString("es-ES", {
                                    useGrouping: true,
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}

                                  <span className="text-base ml-1 opacity-50 font-bold">

                                    €

                                  </span>

                                </p>

                              </div>

                            </div>

                          </div>

                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50">

                          {/* DASHBOARD INTELIGENTE */}

                          <div className="space-y-4">

                            {urgentPayments.length > 0 && (

                              <div className="bg-rose-600 text-white p-2.5 rounded-xl flex items-center gap-3 animate-pulse shadow-lg shadow-rose-600/20">

                                <IconAlertTriangle size={18} stroke={3} />

                                <div className="flex-1">

                                  <p className="text-[10px] font-black uppercase tracking-wider">

                                    ¡Alerta de Cobro! Pagos pendientes en

                                    menos de 48h

                                  </p>

                                  <div className="flex flex-wrap gap-x-4">

                                    {urgentPayments

                                      .slice(0, 3)

                                      .map((up, i) => (

                                        <span

                                          key={i}

                                          className="text-[9px] font-bold opacity-90"

                                        >

                                          • {up.label}:{" "}

                                          {parseFloat(

                                            up.amount,

                                          ).toLocaleString("es-ES")}

                                          € ({up.hotel})

                                        </span>

                                      ))}

                                  </div>

                                </div>

                              </div>

                            )}

                            {/* BARRA DE HERRAMIENTAS - Compacta y Optimizada */}

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm items-end">

                              {/* Estado Selector */}

                              <div className="md:col-span-2">

                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                                  Estado Seguimiento

                                </label>

                                <div className="relative">

                                  {(() => {

                                    const rawStatus =

                                      selectedGroupFicha.records[0]?.[

                                      "Com_Estado_Interno"

                                      ] ||

                                      selectedGroupFicha.records[0]?.[

                                      "Segment."

                                      ] ||

                                      selectedGroupFicha.records[0]?.[

                                      "Estado"

                                      ] ||

                                      "PROSPECTO";

                                    const st = getStatusProps(

                                      rawStatus,

                                      selectedGroupFicha.arrival,

                                      selectedGroupFicha.records[0]?.[

                                      "Estado"

                                      ],

                                    );

                                    let selectVal = "PROSPECTO";

                                    const s = rawStatus.toUpperCase();

                                    if (

                                      s.includes("CONFIRM") ||

                                      s.includes("GARANT") ||

                                      s.includes("RESERVA") ||

                                      s === "GRUPOS"

                                    )

                                      selectVal = "CONFIRMADO";

                                    else if (

                                      s.includes("TANTEO") ||

                                      s.includes("TENTA") ||

                                      s.includes("BLOQ") ||

                                      s.includes("OPCI")

                                    )

                                      selectVal = "TENTATIVA";

                                    else if (

                                      s.includes("PRESUP") ||

                                      s.includes("ENVIA") ||

                                      s.includes("COTIZ") ||

                                      s.includes("OFERT")

                                    )

                                      selectVal = "PRESUPUESTO";

                                    else if (

                                      s.includes("CANC") ||

                                      s.includes("ANUL") ||

                                      s.includes("BAJA")

                                    )

                                      selectVal = "CANCELADO";

                                    else if (

                                      s.includes("PROSPEC") ||

                                      s.includes("PENDIE")

                                    )

                                      selectVal = "PROSPECTO";

                                    return (

                                      <select

                                        className={`w-full h-9 pl-3 pr-8 text-[10px] font-black uppercase rounded-xl text-white appearance-none outline-none border-2 border-transparent transition-all shadow-sm cursor-pointer ${st.color}`}

                                        value={selectVal}

                                        onChange={(e) =>

                                          updateGroupMetadata(

                                            selectedGroupFicha.id,

                                            "Com_Estado_Interno",

                                            e.target.value,

                                          )

                                        }

                                      >

                                        {/* Opciones condicionales: presupuestos vs grupos confirmados */}

                                        {((String(selectedGroupFicha.records?.[0]?.Reserva || '').startsWith('PRES-') || (selectedGroupFicha.records?.[0]?.Estado || '').toUpperCase() === 'PRESUPUESTO') && !selectVal.includes('CONFIRM')) ? (

                                          <>

                                            <option value="PENDIENTE">PENDIENTE</option>

                                            <option value="SEGUIMIENTO">SEGUIMIENTO</option>

                                            <option value="DESESTIMADO">DESESTIMADO</option>

                                          </>

                                        ) : (

                                          <>

                                            <option value="PRESUPUESTO">PRESUPUESTO</option>

                                            <option value="TENTATIVA">TENTATIVA</option>

                                            <option value="CONFIRMADO">CONFIRMADO</option>

                                            <option value="CANCELADO">CANCELADO</option>

                                            <option value="PROSPECTO">PROSPECTO</option>

                                          </>

                                        )}

                                      </select>

                                    );

                                  })()}

                                  <IconChevronDown

                                    size={14}

                                    className="absolute right-3 top-2.5 text-white/70 pointer-events-none"

                                  />

                                </div>

                              </div>

                              {/* Hotel Principal */}

                              <div className="md:col-span-2">

                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                                  Hotel Principal

                                </label>

                                <div className="relative">

                                  <select

                                    className="w-full h-9 pl-3 pr-8 text-[10px] font-black uppercase rounded-xl bg-slate-50 border border-slate-200 text-slate-700 appearance-none outline-none hover:border-blue-400 transition-all cursor-pointer"

                                    value={(() => {

                                      const raw =

                                        selectedGroupFicha.records[0]?.[

                                        "Hotel_Asignado"

                                        ] ||

                                        selectedGroupFicha.records[0]?.[

                                        "Hotel"

                                        ] ||

                                        "Sercotel Guadiana";

                                      if (

                                        raw.toLowerCase().includes("cumbria")

                                      )

                                        return "Cumbria Spa&Hotel";

                                      if (

                                        raw.toLowerCase().includes("guadiana")

                                      )

                                        return "Sercotel Guadiana";

                                      return raw;

                                    })()}

                                    onChange={(e) =>

                                      updateGroupMetadata(

                                        selectedGroupFicha.id,

                                        "Hotel_Asignado",

                                        e.target.value,

                                      )

                                    }

                                  >

                                    <option value="Sercotel Guadiana">

                                      Sercotel Guadiana

                                    </option>

                                    <option value="Cumbria Spa&Hotel">

                                      Cumbria Spa&Hotel

                                    </option>

                                  </select>

                                  <IconChevronDown

                                    size={14}

                                    className="absolute right-3 top-2.5 text-slate-400 pointer-events-none"

                                  />

                                </div>

                              </div>

                              {/* Comercial */}

                              <div className="md:col-span-2">

                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                                  Comercial

                                </label>

                                <div className="relative">

                                  <select

                                    className={`w-full h-9 pl-3 pr-8 text-[10px] font-black uppercase rounded-xl bg-slate-50 border text-slate-700 appearance-none outline-none transition-all cursor-pointer ${selectedGroupFicha.records[0]?.["Com_Comercial"] && commercials.some((c) => c.name === selectedGroupFicha.records[0]?.["Com_Comercial"] && !c.active) ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 hover:border-blue-400"}`}

                                    value={

                                      selectedGroupFicha.records[0]?.[

                                      "Com_Comercial"

                                      ] || ""

                                    }

                                    onChange={(e) =>

                                      updateGroupMetadata(

                                        selectedGroupFicha.id,

                                        "Com_Comercial",

                                        e.target.value,

                                      )

                                    }

                                  >

                                    <option value="">SIN ASIGNAR</option>

                                    {commercials

                                      .filter(

                                        (c) =>

                                          c.active ||

                                          c.name ===

                                          selectedGroupFicha.records[0]?.[

                                          "Com_Comercial"

                                          ],

                                      )

                                      .map((c) => (

                                        <option key={c.name} value={c.name}>

                                          {c.name}{" "}

                                          {!c.active ? "(INACTIVO)" : ""}

                                        </option>

                                      ))}

                                  </select>

                                  <IconChevronDown

                                    size={14}

                                    className="absolute right-3 top-2.5 text-slate-400 pointer-events-none"

                                  />

                                </div>

                              </div>

                              {/* Segmento */}
                              <div className="md:col-span-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">
                                  Segmento
                                </label>
                                <div className="relative">
                                  <select
                                    className="w-full h-9 pl-3 pr-8 text-[10px] font-black uppercase rounded-xl bg-slate-50 border border-slate-200 text-slate-700 appearance-none outline-none hover:border-blue-400 transition-all cursor-pointer"
                                    value={
                                      ((selectedGroupFicha.records[0]?.["Segment."] || "GRUPOS").toString().trim().toUpperCase())
                                    }
                                    onChange={(e) => handleSegmentChange(e.target.value)}
                                  >
                                    {availableSegments.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                    <option value="__CUSTOM__" className="text-blue-600 font-bold">
                                      + OTRO SEGMENTO...
                                    </option>
                                  </select>
                                  <IconChevronDown
                                    size={14}
                                    className="absolute right-3 top-2.5 text-slate-400 pointer-events-none"
                                  />
                                </div>
                              </div>

                              {/* Nexus Presupuestos Link */}

                              {(String(selectedGroupFicha.records[0]?.["Reserva"] || "").startsWith("PRES-") || String(selectedGroupFicha.records[0]?.["Com_Estado_Interno"] || "").toUpperCase() === "PRESUPUESTO") && (

                                <div className="md:col-span-1 flex items-end pb-0.5">

                                  <button

                                    onClick={() =>

                                      (window.location.href = `Presupuestos.html?id=${selectedGroupFicha.records[0]?.["Reserva"]}`)

                                    }

                                    className="w-full h-9 flex items-center justify-center gap-2 bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl shadow-lg shadow-purple-200 transition-all hover:scale-[1.05] active:scale-[0.95]"

                                    title="Abrir en Nexus Presupuestos"

                                  >

                                    <IconFileSpreadsheet

                                      size={16}

                                      stroke={2.5}

                                    />

                                  </button>

                                </div>

                              )}

                              {/* Fechas de Gestión */}

                              <div className={`grid grid-cols-1 gap-2 ${(String(selectedGroupFicha.records[0]?.["Reserva"] || "").startsWith("PRES-") || String(selectedGroupFicha.records[0]?.["Com_Estado_Interno"] || "").toUpperCase() === "PRESUPUESTO") ? "md:col-span-1" : "md:col-span-2"}`}>

                                <div>

                                  <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                                    Próx. Seg.

                                  </label>

                                  <input

                                    type="date"

                                    className={`w-full h-9 px-2 text-[10px] font-black rounded-xl border ${selectedGroupFicha.records[0]?.["Com_Seguimiento"] && new Date(selectedGroupFicha.records[0]?.["Com_Seguimiento"]) <= new Date() ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600"} outline-none focus:border-blue-500 transition-all`}

                                    value={

                                      selectedGroupFicha.records[0]?.[

                                      "Com_Seguimiento"

                                      ] || ""

                                    }

                                    onChange={(e) =>

                                      updateGroupMetadata(

                                        selectedGroupFicha.id,

                                        "Com_Seguimiento",

                                        e.target.value,

                                      )

                                    }

                                  />

                                </div>

                              </div>

                              {/* Finanzas Rápidas */}

                              <div className="md:col-span-2 grid grid-cols-2 gap-2">

                                <button

                                  onClick={() => {

                                    const rec =

                                      selectedGroupFicha.records[0] || {};

                                    setTempClientData({

                                      Fiscal_RazonSocial:

                                        rec["Fiscal_RazonSocial"] ||

                                        rec["Empresa/Agencia"] ||

                                        "",

                                      Fiscal_CIF: rec["Fiscal_CIF"] || "",

                                      Persona_Contacto:

                                        rec["Persona_Contacto"] || "",

                                      Email: rec["Email"] || "",

                                      Telefono: rec["Telefono"] || "",

                                      Fiscal_Direccion:

                                        rec["Fiscal_Direccion"] || "",

                                      Fiscal_CP: rec["Fiscal_CP"] || "",

                                      Fiscal_Poblacion:

                                        rec["Fiscal_Poblacion"] || "",

                                      Fiscal_Provincia:

                                        rec["Fiscal_Provincia"] || "",

                                      Fiscal_Pais: rec["Fiscal_Pais"] || "",

                                      Observaciones:

                                        rec["Observaciones"] || "",

                                    });

                                    setShowClientData(true);

                                  }}

                                  className="flex items-center gap-2 h-9 px-3 bg-blue-50 border border-blue-100 hover:border-blue-300 rounded-xl group transition-all"

                                >

                                  <IconUsers

                                    size={14}

                                    className="text-blue-400"

                                  />

                                  <div className="text-left overflow-hidden">

                                    <div className="text-[7px] font-black text-blue-400 uppercase leading-none">

                                      Cliente

                                    </div>

                                    <div className="text-[9px] font-black text-blue-700 truncate w-full">

                                      {(

                                        selectedGroupFicha.records[0]?.[

                                        "Fiscal_RazonSocial"

                                        ] ||

                                        selectedGroupFicha.records[0]?.[

                                        "Empresa/Agencia"

                                        ] ||

                                        "Dato Incompleto"

                                      ).substring(0, 15)}

                                    </div>

                                  </div>

                                </button>

                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-2 h-9 flex items-center gap-2">

                                  <div className="text-center">

                                    <label className="text-[7px] font-black text-emerald-400 uppercase block leading-none">

                                      Pagado

                                    </label>

                                  </div>

                                  <input

                                    type="text"

                                    inputMode="decimal"

                                    onKeyDown={handleDotAsComma}

                                    className="bg-transparent border-none text-[12px] font-black text-emerald-700 outline-none w-full tabular-nums"

                                    value={
                                      selectedGroupFicha.records[0]?.[
                                      "Com_Pagado"
                                      ] !== undefined && selectedGroupFicha.records[0]?.["Com_Pagado"] !== null
                                        ? String(selectedGroupFicha.records[0]["Com_Pagado"]).replace('.', ',')
                                        : ""
                                    }

                                    onChange={(e) =>

                                      updateGroupMetadata(

                                        selectedGroupFicha.id,

                                        "Com_Pagado",

                                        e.target.value.replace('.', ','),

                                      )

                                    }

                                  />

                                </div>

                              </div>

                            </div>

                            {(selectedGroupFicha.records[0]?.[

                              "Observaciones"

                            ] ||

                              selectedGroupFicha.records[0]?.[

                              "Observac."

                              ]) && (

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 items-start animate-fade-in shadow-sm">

                                  <div className="bg-amber-100 text-amber-600 p-1.5 rounded-lg shrink-0 mt-0.5">

                                    <IconFile size={16} />

                                  </div>

                                  <div className="flex-1">

                                    <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">

                                      Observaciones de Origen (PMS)

                                    </h4>

                                    <p className="text-[11px] text-amber-800 leading-relaxed font-medium">

                                      {selectedGroupFicha.records[0]?.[

                                        "Observaciones"

                                      ] ||

                                        selectedGroupFicha.records[0]?.[

                                        "Observac."

                                        ]}

                                    </p>

                                  </div>

                                </div>

                              )}

                          </div>

                          {/* GESTOR DE HABITACIONES & INVENTARIO (REDISEÑADO) */}

                          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 shadow-sm mt-4 backdrop-blur-sm relative overflow-hidden">

                            {/* Formulario de Entrada - Diseño Compacto */}

                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">

                              <div className="flex flex-wrap items-end gap-2">

                                {/* Hotel Selection */}

                                <div className="w-32">

                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">

                                    Hotel Destino

                                  </label>

                                  <select

                                    className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"

                                    value={roomManagerForm.hotel}

                                    onChange={(e) =>

                                      setRoomManagerForm({

                                        ...roomManagerForm,

                                        hotel: e.target.value,

                                      })

                                    }

                                  >

                                    <option value="Sercotel Guadiana">

                                      Sercotel Guadiana

                                    </option>

                                    <option value="Cumbria Spa&Hotel">

                                      Cumbria Spa&Hotel

                                    </option>

                                  </select>

                                </div>

                                {/* Product Name */}

                                <div className="flex-1 min-w-[150px]">

                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">

                                    Producto / Habitación

                                  </label>

                                  <input

                                    type="text"

                                    list="room-types-list"

                                    className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all placeholder:font-normal uppercase"

                                    placeholder="Ej: DBL, IND, Almuerzo..."

                                    value={roomManagerForm.type}

                                    onChange={(e) => {

                                      const val = e.target.value;

                                      const valUpper = val.toUpperCase();

                                      const config = ROOM_CONFIGURATIONS.find(

                                        (c) =>

                                          c.label.toUpperCase() === valUpper,

                                      );

                                      if (config) {

                                        setRoomManagerForm({

                                          ...roomManagerForm,

                                          type: config.label,

                                          pax: config.pax,

                                          isService: !!config.isService,

                                        });

                                      } else {

                                        const cleanVal = val.replace(/^(hab\.|habitación|habitacion|hab)\s+/i, '').trim();
                                        const isRoom = /^(ind|dui|single|dob|dbl|twin|matrimonial|tri|cua|quin|fami|suite|junior|estudio|hab)/i.test(cleanVal);
                                        const isMealOrService = /almuerzo|cena|desayuno|coffee|picnic|traslado|guia|guía|bus|parking|sal[oó]n|extra|suplemento/i.test(val);

                                        setRoomManagerForm({

                                          ...roomManagerForm,

                                          type: val,

                                          pax: isRoom ? getPaxByRoomType(val) : roomManagerForm.pax,

                                          isService: isMealOrService ? true : (isRoom ? false : roomManagerForm.isService),

                                        });

                                      }

                                    }}

                                  />

                                  <datalist id="room-types-list">
                                    {ROOM_CONFIGURATIONS
                                      .filter((c) => {
                                        const isCumbriaRoom = roomManagerForm.hotel === "Cumbria Spa&Hotel" || String(roomManagerForm.hotel || "").toLowerCase().includes("cumbria");
                                        if (isCumbriaRoom) {
                                          const lbl = c.label.toUpperCase();
                                          if (lbl.includes("CUADRUPLE") || lbl.includes("CUÁDRUPLE") || lbl.includes("CUA") || lbl.includes("SUITE SUPERIOR") || lbl.includes("S.SUP") || lbl.includes("SS1") || lbl.includes("SS2")) {
                                            return false;
                                          }
                                        }
                                        return true;
                                      })
                                      .map((c) => (
                                        <option key={c.label} value={c.label} />
                                      ))}
                                  </datalist>

                                </div>

                                {/* Arrival Date */}

                                <div className="w-28">

                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1">

                                    Fecha Cargo

                                  </label>

                                  <input

                                    type="date"

                                    className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all cursor-pointer"

                                    value={toInputDate(

                                      roomManagerForm.dateIn,

                                    )}

                                    onChange={(e) =>

                                      setRoomManagerForm({

                                        ...roomManagerForm,

                                        dateIn: e.target.value,

                                      })

                                    }

                                  />

                                </div>

                                {/* Service Toggle */}

                                <div className="w-14">

                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-center">

                                    IA

                                  </label>

                                  <div className="flex h-9 items-center justify-center bg-slate-50 border border-slate-200 rounded-lg">

                                    <input

                                      type="checkbox"

                                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"

                                      checked={roomManagerForm.isService}

                                      onChange={(e) =>

                                        setRoomManagerForm({

                                          ...roomManagerForm,

                                          isService: e.target.checked,

                                        })

                                      }

                                    />

                                  </div>

                                </div>

                                {!roomManagerForm.isService && (

                                  <div className="w-12">

                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-center">

                                      Noches

                                    </label>

                                    <input

                                      type="number"

                                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all font-mono"

                                      value={roomManagerForm.nights}

                                      onChange={(e) =>

                                        setRoomManagerForm({

                                          ...roomManagerForm,

                                          nights:

                                            parseInt(e.target.value) || 1,

                                        })

                                      }

                                      min="1"

                                    />

                                  </div>

                                )}

                                <div className="w-12">

                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-center">

                                    UND.

                                  </label>

                                  <input

                                    type="number"

                                    className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all font-mono"

                                    value={roomManagerForm.qty}

                                    onChange={(e) =>

                                      setRoomManagerForm({

                                        ...roomManagerForm,

                                        qty: parseInt(e.target.value) || 1,

                                      })

                                    }

                                    min="1"

                                  />

                                </div>

                                <div className="w-12">

                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-center">

                                    Pax

                                  </label>

                                  <input

                                    type="number"

                                    className="w-full h-9 bg-indigo-50 border border-indigo-200 rounded-lg text-center text-xs font-bold text-indigo-700 outline-none focus:border-indigo-500 transition-all font-mono shadow-inner"

                                    value={roomManagerForm.pax}

                                    onChange={(e) =>

                                      setRoomManagerForm({

                                        ...roomManagerForm,

                                        pax: parseInt(e.target.value) || 0,

                                      })

                                    }

                                  />

                                </div>

                                {!roomManagerForm.isService && (

                                  <div className="w-16">

                                    <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-center">

                                      Régimen

                                    </label>

                                    <select

                                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-1 text-center text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all appearance-none"

                                      value={roomManagerForm.regime}

                                      onChange={(e) =>

                                        setRoomManagerForm({

                                          ...roomManagerForm,

                                          regime: e.target.value,

                                        })

                                      }

                                    >

                                      <option value="">-</option>

                                      <option value="HA">HA</option>

                                      <option value="HD">HD</option>

                                      <option value="MP">MP</option>

                                      <option value="PC">PC</option>

                                    </select>

                                  </div>

                                )}

                                <div className="w-24">

                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-right">

                                    {roomManagerForm.isService

                                      ? "Precio/U"

                                      : "Precio/Hab"}

                                  </label>

                                  <div className="relative">

                                    <input

                                      type="text"

                                      inputMode="decimal"

                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleSaveRoomManager();
                                        } else {
                                          handleDotAsComma(e);
                                        }
                                      }}

                                      className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-6 text-right text-xs font-black text-slate-800 outline-none focus:border-emerald-500 transition-all"

                                      value={roomManagerForm.price !== undefined && roomManagerForm.price !== null ? String(roomManagerForm.price).replace('.', ',') : ''}

                                      onChange={(e) => {
                                        const raw = e.target.value.replace('.', ',');
                                        setRoomManagerForm((prev) => ({
                                          ...prev,
                                          price: raw,
                                        }));
                                      }}

                                    />

                                    <span className="absolute right-2 top-2.5 text-[10px] text-slate-400 font-bold">

                                      €

                                    </span>

                                  </div>

                                </div>

                                <div className="w-16">

                                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-center">

                                    IVA

                                  </label>

                                  <select

                                    className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"

                                    value={roomManagerForm.iva}

                                    onChange={(e) =>

                                      setRoomManagerForm({

                                        ...roomManagerForm,

                                        iva: parseInt(e.target.value) || 10,

                                      })

                                    }

                                  >

                                    <option value="10">10%</option>

                                    <option value="21">21%</option>

                                  </select>

                                </div>

                                {/* Actions */}

                                <div className="flex-1 flex justify-end gap-3 items-center">

                                  {(() => {

                                    let formLogo = "";

                                    const effectiveMainHotel = normalizeHotelNameLocal(

                                      selectedGroupFicha?.records[0]?.["Hotel_Asignado"] || selectedGroupFicha?.records[0]?.["Hotel"],

                                      "Sercotel Guadiana"

                                    );

                                    const normalizedHotel = normalizeHotelNameLocal(roomManagerForm.hotel, effectiveMainHotel);

                                    if (normalizedHotel === "Sercotel Guadiana")

                                      formLogo =

                                        "Logos/Sercotel Guadiana.jpg";

                                    else if (

                                      normalizedHotel === "Cumbria Spa&Hotel"

                                    )

                                      formLogo =

                                        "Logos/Cumbria Spa&Hotel.jpg";

                                    if (formLogo) {

                                      return (

                                        <img

                                          src={formLogo}

                                          alt="Hotel"

                                          className="h-10 object-contain mix-blend-multiply opacity-90"

                                        />

                                      );

                                    }

                                    return null;

                                  })()}

                                  <button

                                    onClick={addRoomBlock}

                                    className={`h-9 px-6 ${editingId ? "bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-200" : "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"} text-white rounded-lg active:scale-95 transition-all flex items-center gap-2`}

                                  >

                                    {editingId ? (

                                      <IconRefresh size={14} stroke={3} />

                                    ) : (

                                      <span className="text-sm font-bold">

                                        +

                                      </span>

                                    )}

                                    <span className="text-xs font-black uppercase tracking-wider">

                                      {editingId ? "Actualizar" : "Añadir"}

                                    </span>

                                  </button>

                                  {editingId && (

                                    <button

                                      onClick={() => {

                                        setEditingId(null);

                                        setRoomManagerForm((prev) => ({

                                          ...prev,

                                          qty: 1,

                                          price: 0,

                                          isService: true,

                                        }));

                                      }}

                                      className="h-9 px-3 bg-slate-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors flex items-center justify-center"

                                    >

                                      <IconX size={16} stroke={3} />

                                    </button>

                                  )}

                                </div>

                              </div>

                            </div>

                            
                            {(() => {
                              const extraCharges = selectedGroupFicha?.extraCharges || [];
                              if (!extraCharges.length) return null;
                              
                              const rl = typeof window.roomingCore !== "undefined" && window.roomingCore.getGroupEconomicItems
                                ? window.roomingCore.getGroupEconomicItems(selectedGroupFicha)
                                : parseRoomingListSafe(selectedGroupFicha.records[0]?.["RoomingList_JSON"], "selectedGroupFicha");
                              
                              const rlIds = new Set(rl.map(item => item.id || item.sourceBudgetItemId));
                              const pending = extraCharges.filter(ec => !rlIds.has(ec.id));
                              
                              if (pending.length > 0) {
                                const pendingTotal = pending.reduce((acc, ec) => acc + (parseFloat(ec.price) || 0), 0);
                                return (
                                  <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex gap-3 items-start">
                                      <div className="text-amber-500 mt-0.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                      </div>
                                      <div>
                                        <h4 className="font-bold text-amber-800 text-sm">Hay {pendingTotal.toLocaleString('es-ES', {minimumFractionDigits: 2})} € en cargos del presupuesto pendientes de incorporar</h4>
                                        <ul className="mt-1 text-xs text-amber-700 list-disc list-inside">
                                          {pending.map((p, i) => (
                                            <li key={i}>{p.concept || p.type}: {(parseFloat(p.price) || 0).toLocaleString('es-ES', {minimumFractionDigits: 2})} €</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        // This is a complex update because we need to append them to the persisted RoomingList_JSON array
                                        // so that they become persisted in the UI data.
                                        const currentRL = parseRoomingListSafe(selectedGroupFicha.records[0]?.["RoomingList_JSON"], "selectedGroupFicha");
                                        const newRL = [...currentRL, ...pending.map(ec => ({
                                          id: ec.id,
                                          type: ec.concept || ec.type || "Extra",
                                          dateIn: ec.date || "Varias",
                                          qty: ec.units || ec.qty || 1,
                                          price: ec.unitPrice !== undefined ? ec.unitPrice : ec.price,
                                          total: ec.price !== undefined ? ec.price : 0,
                                          isService: true,
                                          isEconomicItem: true,
                                          isEconomicRepresentation: true,
                                          isAccommodation: false,
                                          hotel: selectedGroupFicha?.records[0]?.["Hotel_Asignado"] || selectedGroupFicha?.records[0]?.["Hotel"]
                                        }))];
                                        updateGroupMetadata(selectedGroupFicha.id, {
                                          RoomingList_JSON: JSON.stringify(newRL)
                                        });
                                      }}
                                      className="whitespace-nowrap px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded shadow-sm transition-colors"
                                    >
                                      SINCRONIZAR CARGOS DEL PRESUPUESTO
                                    </button>
                                  </div>
                                );
                              }
                              return null;
                            })()}
{/* Barra de herramientas para ampliar / disminuir por día */}
                            {(() => {
                              const currentRLUnexpanded = typeof window.roomingCore !== "undefined" && window.roomingCore.getGroupEconomicItems
                                ? window.roomingCore.getGroupEconomicItems(selectedGroupFicha)
                                : parseRoomingListSafe(selectedGroupFicha.records[0]?.["RoomingList_JSON"], "selectedGroupFicha");
                              const currentRL = expandRoomListByDays(currentRLUnexpanded);
                              const uniqueDayKeys = Array.from(new Set(currentRL.map(i => i.dateIn || i.date || i.fecha || "Varios"))).filter(Boolean);
                              if (uniqueDayKeys.length <= 1) return null;

                              return (
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="font-bold text-slate-700">Desglose por Días:</span>
                                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-bold text-[11px]">
                                      {uniqueDayKeys.length} días de estancia
                                    </span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-[11px]">Haz clic en la cabecera de cada día para ampliar o disminuir</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setCollapsedFichaDays(new Set())}
                                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition flex items-center gap-1 border border-slate-200"
                                      title="Ampliar todos los días para ver todas las líneas de habitaciones"
                                    >
                                      <span>▾</span> Ampliar todos los días
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setCollapsedFichaDays(new Set(uniqueDayKeys))}
                                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition flex items-center gap-1 border border-slate-200"
                                      title="Disminuir todos los días para que la pantalla no sea tan extensa"
                                    >
                                      <span>▴</span> Disminuir todos los días
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Tabla de Resultados - Clean UI */}

                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">

                              <table className="w-full text-xs text-left border-collapse">

                                <thead className="bg-slate-50 border-b border-slate-200">

                                  <tr>

                                    <th className="py-2.5 px-3 w-8"></th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider">

                                      Hotel

                                    </th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider">

                                      Producto

                                    </th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider">

                                      Fecha Cargo

                                    </th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-center">

                                      Noches

                                    </th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-center">

                                      Cant.

                                    </th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-center">

                                      Pax.

                                    </th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-center">

                                      Rég.

                                    </th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-right">

                                      P. Unit

                                    </th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-center">

                                      IVA

                                    </th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-right bg-blue-50/20">

                                      Base Com.

                                    </th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-center bg-blue-50/20">

                                      %

                                    </th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-right bg-blue-50/20">

                                      Comisión €

                                    </th>

                                    <th className="py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-right bg-slate-100/50">

                                      Total

                                    </th>

                                    <th className="py-2.5 px-3 w-8"></th>

                                  </tr>

                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                  {(() => {
                                    const rawRLUnexpanded = typeof window.roomingCore !== "undefined" && window.roomingCore.getGroupEconomicItems ? window.roomingCore.getGroupEconomicItems(selectedGroupFicha) : parseRoomingListSafe(selectedGroupFicha.records[0]?.["RoomingList_JSON"], "selectedGroupFicha");
                                    const rawRL = expandRoomListByDays(rawRLUnexpanded);
                                    
                                    // Safety guard: if list is corrupted (>200 auto-generated rows), show reset UI instead of freezing
                                    if (rawRL.length > 200) {
                                      const allAuto = rawRL.every(item => (item.type || '').toLowerCase().includes('auto') || (item.type || '').toLowerCase().includes('habitaci'));
                                      if (allAuto) {
                                        return (
                                          <tr>
                                            <td colSpan="13" className="py-8 px-4 text-center">
                                              <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center gap-4">
                                                <div className="text-red-500 text-3xl">⚠️</div>
                                                <div>
                                                  <p className="font-black text-red-700 text-sm">Lista de habitaciones corrupta</p>
                                                  <p className="text-red-600 text-xs mt-1">{rawRL.length} filas auto-generadas detectadas. Hay que reiniciar esta lista para poder editar el grupo.</p>
                                                </div>
                                                <button
                                                  onClick={() => {
                                                    if (window.confirm(`¿Reiniciar la lista de habitaciones de "${selectedGroupFicha.name}"? Se perderán los ${rawRL.length} elementos actuales.`)) {
                                                      updateGroupMetadata(selectedGroupFicha.id, { RoomingList_JSON: '[]' });
                                                    }
                                                  }}
                                                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-black text-sm rounded-lg shadow-sm transition-colors"
                                                >
                                                  🗑️ Reiniciar Lista de Habitaciones
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      }
                                    }

                                     const grouped = [];
                                     rawRL.forEach((item, index) => {
                                       const key = `${item.hotel || ''}_${item.type || ''}_${item.dateIn || ''}_${item.dateOut || ''}_${item.price || 0}_${item.iva || 10}_${item.regime || ''}_${!!item.isService}`;
                                       const existing = grouped.find(g => g.key === key);
                                       if (existing) {
                                         existing.qty = (existing.qty || 0) + (parseInt(item.qty) || 1);
                                         existing.total = (parseFloat(existing.total) || 0) + (parseFloat(item.total) || 0);
                                         existing.ids.push(item.id);
                                         existing.originalIndices.push(index);
                                         if (typeof item.sortOrder === "number" && (typeof existing.sortOrder !== "number" || item.sortOrder < existing.sortOrder)) {
                                           existing.sortOrder = item.sortOrder;
                                         }
                                       } else {
                                         grouped.push({
                                           ...item,
                                           key,
                                           qty: parseInt(item.qty) || 1,
                                           total: parseFloat(item.total) || 0,
                                           ids: [item.id],
                                           originalIndices: [index],
                                           sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : undefined
                                         });
                                       }
                                     });

                                     // Ordenar por días (cronológico) y jerarquía de habitación o manual sortOrder
                                     grouped.sort((a, b) => compareRoomItemsByDateAndType(a, b));

                                     // Agrupar en bloques por día para poder ampliar o disminuir por día
                                     const dayBuckets = [];
                                     const dayBucketMap = new Map();

                                     grouped.forEach((item, index) => {
                                       const dayKey = item.dateIn || item.date || item.fecha || "Varios";
                                       if (!dayBucketMap.has(dayKey)) {
                                         const bucket = {
                                           dayKey,
                                           items: [],
                                           totalRooms: 0,
                                           totalPax: 0,
                                           totalAmount: 0,
                                           roomTypes: {}
                                         };
                                         dayBucketMap.set(dayKey, bucket);
                                         dayBuckets.push(bucket);
                                       }
                                       const b = dayBucketMap.get(dayKey);
                                       const qty = parseInt(item.qty, 10) || 1;
                                       const pax = parseInt(item.pax, 10) || (getPaxByRoomType(item.type));
                                       const tot = parseFloat(item.total) || 0;

                                       const rawT = (item.type || "").toLowerCase().trim();
                                       const cleanT = rawT.replace(/^(hab\.|habitación|habitacion|hab)\s+/i, "").trim();
                                       const isRoomTypology = /^(ind|dui|single|dob|dbl|twin|matrimonial|tri|cua|quin|fami|suite|junior|estudio)/i.test(cleanT);
                                       const isPureService = item.isService && !isRoomTypology;

                                       b.items.push({ ...item, globalIndex: index });
                                       b.totalRooms += (isPureService ? 0 : qty);
                                       b.totalPax += (isPureService ? 0 : (qty * pax));
                                       b.totalAmount += tot;

                                       const tName = item.type || "Habitación";
                                       b.roomTypes[tName] = (b.roomTypes[tName] || 0) + qty;
                                     });

                                    return dayBuckets.map((bucket) => {
                                      const isCollapsed = collapsedFichaDays.has(bucket.dayKey);
                                      const roomTypesSummary = Object.entries(bucket.roomTypes)
                                        .map(([type, count]) => `${count} ${type}`)
                                        .join(" • ");

                                      return (
                                        <React.Fragment key={`day_group_${bucket.dayKey}`}>
                                          {/* CABECERA PARA AMPLIAR / DISMINUIR POR DÍA */}
                                          <tr
                                            onClick={() => {
                                              setCollapsedFichaDays(prev => {
                                                const next = new Set(prev);
                                                if (next.has(bucket.dayKey)) next.delete(bucket.dayKey);
                                                else next.add(bucket.dayKey);
                                                return next;
                                              });
                                            }}
                                            className="bg-slate-100/95 hover:bg-blue-50/90 cursor-pointer select-none transition-colors border-t-2 border-slate-200"
                                            title="Haz clic para ampliar o disminuir este día"
                                          >
                                            <td colSpan="15" className="py-2 px-3">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                  <span className={`text-[11px] font-black transition-transform duration-200 inline-block ${
                                                    isCollapsed ? "text-slate-400 -rotate-90" : "text-blue-600 rotate-0"
                                                  }`}>
                                                    ▼
                                                  </span>
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-mono font-black text-xs text-slate-800 bg-white px-2.5 py-0.5 rounded border border-slate-300 shadow-2xs">
                                                      📅 {formatDate(bucket.dayKey)}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-slate-600">
                                                      {bucket.items.length} {bucket.items.length === 1 ? "línea" : "líneas"}
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5 text-[10px] font-bold">
                                                    {bucket.totalRooms > 0 && (
                                                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                                        {bucket.totalRooms} hab.
                                                      </span>
                                                    )}
                                                    {bucket.totalPax > 0 && (
                                                      <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                                        {bucket.totalPax} pax
                                                      </span>
                                                    )}
                                                    {roomTypesSummary && (
                                                      <span className="text-slate-500 font-medium">
                                                        ({roomTypesSummary})
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                  <div className="text-right">
                                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mr-1">Total día:</span>
                                                    <span className="font-mono font-black text-xs text-emerald-700">
                                                      {bucket.totalAmount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                                                    </span>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleInsertLineForDay(bucket.dayKey);
                                                    }}
                                                    className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                    title={`Insertar nueva línea o concepto para el día ${formatDate(bucket.dayKey)}`}
                                                  >
                                                    <span className="text-xs font-bold leading-none">+</span>
                                                    <span>Insertar línea</span>
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleReplicatePricesFromDay(bucket.dayKey);
                                                    }}
                                                    className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                    title={`Replicar precios de habitaciones de este día (${formatDate(bucket.dayKey)}) a toda la estancia`}
                                                  >
                                                    <span className="text-xs font-bold leading-none">⚡</span>
                                                    <span>Replicar precios</span>
                                                  </button>
                                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                                                    isCollapsed
                                                      ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                                      : "bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300"
                                                  }`}>
                                                    {isCollapsed ? "+ Ampliar día" : "- Disminuir día"}
                                                  </span>
                                                </div>
                                              </div>
                                            </td>
                                          </tr>

                                           {/* FILAS DE PRODUCTOS DE ESTE DÍA (SI NO ESTÁ DISMINUIDO/COLAPSADO) */}
                                           {!isCollapsed && bucket.items.map((item, itemIdxWithinBucket) => (
                                             <tr
                                               key={item.id}
                                               draggable
                                               onDragStart={(e) => {
                                                 e.dataTransfer.setData("application/json", JSON.stringify({
                                                   dayKey: bucket.dayKey,
                                                   itemIndex: itemIdxWithinBucket,
                                                   globalIndex: item.globalIndex
                                                 }));
                                                 e.dataTransfer.setData("idx", String(item.globalIndex));
                                               }}
                                               onDragOver={(e) => e.preventDefault()}
                                               onDrop={(e) => {
                                                 e.preventDefault();
                                                 try {
                                                   const raw = e.dataTransfer.getData("application/json");
                                                   if (raw) {
                                                     const data = JSON.parse(raw);
                                                     if (data.dayKey === bucket.dayKey) {
                                                       handleMoveRoomItemWithinBucket(bucket, data.itemIndex, itemIdxWithinBucket);
                                                       return;
                                                     }
                                                   }
                                                 } catch (err) {}
                                                 const rawIdx = e.dataTransfer.getData("idx");
                                                 if (rawIdx !== "") {
                                                   handleRoomManagerDrop(parseInt(rawIdx, 10), item.globalIndex);
                                                 }
                                               }}
                                               className="hover:bg-blue-50/50 transition-colors group cursor-default"
                                             >
                                         <td className="py-2 px-2 whitespace-nowrap">
                                           <div className="flex items-center gap-1">
                                             <div className="text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing" title="Arrastrar para reordenar habitación">
                                               <IconGripVertical size={14} />
                                             </div>
                                             <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                               <button
                                                 type="button"
                                                 disabled={itemIdxWithinBucket === 0}
                                                 onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleMoveRoomItemWithinBucket(bucket, itemIdxWithinBucket, itemIdxWithinBucket - 1);
                                                 }}
                                                 className={`text-[8px] leading-none px-0.5 py-0.5 rounded hover:bg-blue-100 ${itemIdxWithinBucket === 0 ? "text-slate-200 cursor-not-allowed" : "text-slate-500 hover:text-blue-600"}`}
                                                 title="Mover arriba"
                                               >
                                                 ▲
                                               </button>
                                               <button
                                                 type="button"
                                                 disabled={itemIdxWithinBucket === bucket.items.length - 1}
                                                 onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleMoveRoomItemWithinBucket(bucket, itemIdxWithinBucket, itemIdxWithinBucket + 1);
                                                 }}
                                                 className={`text-[8px] leading-none px-0.5 py-0.5 rounded hover:bg-blue-100 ${itemIdxWithinBucket === bucket.items.length - 1 ? "text-slate-200 cursor-not-allowed" : "text-slate-500 hover:text-blue-600"}`}
                                                 title="Mover abajo"
                                               >
                                                 ▼
                                               </button>
                                             </div>
                                           </div>
                                         </td>
                                        {/* HOTEL */}
                                        <td className="py-1.5 px-2">
                                          <div className="flex items-center gap-1">
                                            <IconBuildingSkyscraper
                                              size={12}
                                              className="text-slate-400 shrink-0"
                                            />
                                            <select
                                              className="bg-white/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-400 rounded px-1 py-0.5 text-[10px] font-bold text-slate-700 uppercase outline-none transition cursor-pointer max-w-[125px] truncate shadow-2xs"
                                              value={item.hotel || "Sercotel Guadiana"}
                                              onChange={(e) => handleInlineRoomItemUpdate(item, "hotel", e.target.value)}
                                              title="Cambiar hotel directamente"
                                            >
                                              <option value="Sercotel Guadiana">Sercotel Guadiana</option>
                                              <option value="Cumbria Spa&Hotel">Cumbria Spa&Hotel</option>
                                            </select>
                                          </div>
                                        </td>

                                        {/* PRODUCTO (TIPO) */}
                                        <td className="py-1.5 px-2 min-w-[160px]">
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleInlineRoomItemUpdate(item, "isService", !item.isService);
                                              }}
                                              className={`text-[9px] font-black px-1.5 py-0.5 rounded border transition-colors shrink-0 cursor-pointer ${
                                                item.isService
                                                  ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                                                  : "bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100"
                                              }`}
                                              title={item.isService ? "Servicio / Extra (clic para cambiar a Habitación)" : "Habitación (clic para cambiar a Servicio)"}
                                            >
                                              {item.isService ? "🍽️ Serv" : "🏨 Hab"}
                                            </button>
                                            <input
                                              type="text"
                                              list="room-types-list"
                                              autoFocus={item.id === newlyInsertedLineId || (Array.isArray(item.ids) && item.ids.includes(newlyInsertedLineId))}
                                              placeholder="CONCEPTO O HAB."
                                              className={`border rounded px-1.5 py-0.5 font-bold outline-none w-full uppercase text-[11px] transition shadow-2xs ${
                                                item.id === newlyInsertedLineId || (Array.isArray(item.ids) && item.ids.includes(newlyInsertedLineId))
                                                  ? "bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-300"
                                                  : "bg-white/80 hover:bg-white focus:bg-white border-slate-200 focus:border-blue-400 text-slate-800"
                                              }`}
                                              value={item.type || ""}
                                              onChange={(e) => handleInlineRoomItemUpdate(item, "type", e.target.value)}
                                              onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                                              title="Editar nombre de producto, concepto o tipo de habitación"
                                            />
                                          </div>
                                        </td>

                                        {/* FECHA CARGO */}
                                        <td className="py-1.5 px-2">
                                          <input
                                            type="date"
                                            className="bg-white/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-400 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-700 outline-none transition cursor-pointer shadow-2xs"
                                            value={toInputDate(item.dateIn)}
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                handleInlineRoomItemUpdate(item, "dateIn", e.target.value);
                                              }
                                            }}
                                            title="Editar fecha de cargo"
                                          />
                                        </td>

                                        {/* NOCHES */}
                                        <td className="py-1.5 px-2 text-center">
                                          <input
                                            type="number"
                                            min="1"
                                            className="w-12 text-center bg-blue-50/70 hover:bg-white focus:bg-white border border-blue-200 focus:border-blue-400 rounded px-1 py-0.5 text-[11px] font-bold text-blue-700 outline-none transition shadow-2xs"
                                            value={item.nights || 1}
                                            onChange={(e) => {
                                              const val = parseInt(e.target.value, 10);
                                              if (!isNaN(val) && val >= 1) {
                                                handleInlineRoomItemUpdate(item, "nights", val);
                                              }
                                            }}
                                            title="Editar número de noches"
                                          />
                                        </td>

                                        {/* CANTIDAD */}
                                        <td className="py-1.5 px-2 text-center">
                                          <input
                                            type="number"
                                            min="1"
                                            className="w-12 text-center bg-white/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-400 rounded px-1 py-0.5 text-[11px] font-bold text-slate-800 outline-none transition shadow-2xs"
                                            value={item.qty || 1}
                                            onChange={(e) => {
                                              const val = parseInt(e.target.value, 10);
                                              if (!isNaN(val) && val >= 1) {
                                                handleInlineRoomItemUpdate(item, "qty", val);
                                              }
                                            }}
                                            title="Editar cantidad de habitaciones o unidades"
                                          />
                                        </td>

                                        {/* PAX */}
                                        <td className="py-1.5 px-2 text-center">
                                          <input
                                            type="number"
                                            min="1"
                                            className="w-12 text-center bg-white/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-400 rounded px-1 py-0.5 text-[11px] font-bold text-slate-600 outline-none transition shadow-2xs"
                                            value={item.pax !== undefined && item.pax !== null && item.pax !== "" ? item.pax : getPaxByRoomType(item.type)}
                                            onChange={(e) => {
                                              const val = parseInt(e.target.value, 10);
                                              if (!isNaN(val) && val >= 1) {
                                                handleInlineRoomItemUpdate(item, "pax", val);
                                              }
                                            }}
                                            title="Editar pax por habitación"
                                          />
                                        </td>

                                        {/* RÉGIMEN */}
                                        <td className="py-1.5 px-2 text-center">
                                          <select
                                            className="bg-white/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-400 rounded px-1 py-0.5 text-[10px] font-bold text-slate-700 uppercase outline-none transition cursor-pointer shadow-2xs"
                                            value={(() => {
                                              const raw = String(item.regime || "HD").toUpperCase().trim();
                                              if (raw === "AD") return "HD";
                                              if (raw === "SA") return "HA";
                                              if (["HA", "HD", "MP", "PC", "-"].includes(raw)) return raw;
                                              return raw || "HD";
                                            })()}
                                            onChange={(e) => handleInlineRoomItemUpdate(item, "regime", e.target.value)}
                                            title="Cambiar régimen"
                                          >
                                            <option value="HA">HA</option>
                                            <option value="HD">HD</option>
                                            <option value="MP">MP</option>
                                            <option value="PC">PC</option>
                                            <option value="-">-</option>
                                          </select>
                                        </td>

                                        {/* PRECIO UNITARIO */}
                                        <td className="py-1.5 px-2 text-right">
                                          <div className="inline-flex items-center justify-end gap-1">
                                            <input
                                              type="text"
                                              inputMode="decimal"
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  e.target.blur();
                                                } else {
                                                  handleDotAsComma(e);
                                                }
                                              }}
                                              className="w-16 text-right bg-white/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-400 rounded px-1.5 py-0.5 text-[11px] font-bold text-slate-800 outline-none transition shadow-2xs"
                                              defaultValue={item.price !== undefined && item.price !== null ? String(item.price).replace('.', ',') : '0'}
                                              key={`price_${item.id}_${item.price}`}
                                              onBlur={(e) => {
                                                const val = parseNum(e.target.value);
                                                if (!isNaN(val) && val >= 0) {
                                                  handleInlineRoomItemUpdate(item, "price", val);
                                                }
                                              }}
                                              title="Editar precio unitario (el punto se toma como coma)"
                                            />
                                            <span className="text-slate-400 text-[11px]">€</span>
                                          </div>
                                        </td>

                                        {/* IVA */}
                                        <td className="py-1.5 px-2 text-center">
                                          <select
                                            className={`border rounded px-1 py-0.5 text-[10px] font-black outline-none transition cursor-pointer shadow-2xs ${
                                              item.iva == 21
                                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                                : "bg-blue-50 text-blue-700 border-blue-200"
                                            }`}
                                            value={item.iva || 10}
                                            onChange={(e) => handleInlineRoomItemUpdate(item, "iva", parseInt(e.target.value, 10))}
                                            title="Cambiar IVA"
                                          >
                                            <option value={10}>10%</option>
                                            <option value={21}>21%</option>
                                            <option value={0}>0%</option>
                                          </select>
                                        </td>
                                        <td className="py-2 px-3 text-right bg-blue-50/10 border-l border-blue-50">
                                          <div className="flex items-center justify-end gap-1">
                                            <span className="text-[10px] font-bold text-slate-500">
                                              {(item.comision?.base_unitaria
                                                ? item.comision.base_unitaria *
                                                item.qty *
                                                item.nights
                                                : item.comision
                                                  ?.base_calculada || 0
                                              ).toLocaleString("es-ES", {
                                                minimumFractionDigits: 2,
                                              })}{" "}
                                              €
                                            </span>
                                            <button
                                               onClick={() => {
                                                 const hotelForPricing = item.hotel || selectedGroupFicha?.hotel || selectedGroupFicha?.records?.[0]?.["Hotel_Asignado"] || selectedGroupFicha?.records?.[0]?.["Hotel"] || "Sercotel Guadiana";
                                                 const itemPax = item.pax || getPaxByRoomType(item.type);
                                                 setCommissionModal({
                                                   isOpen: true,
                                                   item: item,
                                                   itemIdx: item.originalIndices?.[0] ?? 0,
                                                   itemIds: item.ids || [item.id],
                                                   tempCom: item.comision?.desglose
                                                     ? JSON.parse(JSON.stringify(item.comision))
                                                     : calculateDefaultCommission(
                                                         item.price,
                                                         item.regime,
                                                         item.qty,
                                                         item.nights,
                                                         item.type,
                                                         hotelForPricing,
                                                         itemPax,
                                                       ),
                                                 });
                                               }}
                                               className="p-1 hover:bg-blue-100 text-blue-400 hover:text-blue-600 rounded transition-colors"
                                              title="Configurar desglose de comisión"
                                            >
                                              <IconSettings size={12} />
                                            </button>
                                          </div>
                                        </td>
                                        <td className="py-2 px-3 text-center bg-blue-50/10">
                                          <span className="text-[10px] font-bold text-slate-600">
                                            {item.comision?.porcentaje !== undefined ? item.comision.porcentaje : 0}%
                                          </span>
                                        </td>
                                        <td className="py-2 px-3 text-right bg-blue-50/10 border-r border-blue-50">
                                          <span className="text-[10px] font-black text-blue-700">
                                            {item.comision?.total_comision !==
                                              undefined
                                              ? item.comision.total_comision.toLocaleString(
                                                "es-ES",
                                                { minimumFractionDigits: 2 },
                                              )
                                              : (
                                                ((item.comision
                                                  ?.base_calculada || 0) *
                                                  (item.comision
                                                    ?.porcentaje !== undefined ? item.comision.porcentaje : 0)) /
                                                100
                                              ).toLocaleString("es-ES", {
                                                minimumFractionDigits: 2,
                                              })}{" "}
                                            €
                                          </span>
                                        </td>
                                        <td className="py-1 px-2 text-right font-black text-emerald-600 bg-emerald-50/30">
                                          {parseFloat(
                                            item.total,
                                          ).toLocaleString("es-ES", {
                                            minimumFractionDigits: 2,
                                          })}{" "}
                                          €
                                        </td>
                                        <td className="py-1 px-2 text-center flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() =>
                                              handleEditRoomBlock(item)
                                            }
                                            className="p-1 hover:bg-amber-100 text-slate-300 hover:text-amber-500 rounded transition-colors"
                                            title="Editar"
                                          >
                                            <IconEdit size={14} />
                                          </button>
                                          <button
                                            onClick={() =>
                                              removeRoomBlock(item.ids || item.id)
                                            }
                                            className="p-1 hover:bg-rose-100 text-slate-300 hover:text-rose-500 rounded transition-colors"
                                            title="Eliminar"
                                          >
                                            <IconTrash size={14} />
                                          </button>
                                        </td>
                                      </tr>
                                          ))}
                                          {/* FILA INFERIOR PARA INSERTAR LÍNEA / CONCEPTO EN ESTE DÍA */}
                                          {!isCollapsed && (
                                            <tr className="bg-slate-50/50 hover:bg-emerald-50/30 transition-colors border-b border-dashed border-slate-200">
                                              <td colSpan="15" className="py-1.5 px-3 text-left">
                                                <button
                                                  type="button"
                                                  onClick={() => handleInsertLineForDay(bucket.dayKey)}
                                                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/60 px-2.5 py-0.5 rounded transition-all cursor-pointer"
                                                  title={`Añadir nueva línea o concepto para el día ${formatDate(bucket.dayKey)}`}
                                                >
                                                  <span className="text-xs font-black leading-none">+</span>
                                                  <span>Añadir concepto o línea para el día {formatDate(bucket.dayKey)}</span>
                                                </button>
                                              </td>
                                            </tr>
                                          )}
                                        </React.Fragment>
                                      );
                                    });
                                  })()}

                                  {parseRoomingListSafe(selectedGroupFicha.records[0]?.["RoomingList_JSON"], "selectedGroupFicha").length === 0 && (

                                      <tr>

                                        <td

                                          colSpan="8"

                                          className="py-8 text-center"

                                        >

                                          <div className="flex flex-col items-center justify-center text-slate-300">

                                            <IconBed

                                              size={32}

                                              stroke={1}

                                              className="mb-2 opacity-50"

                                            />

                                            <p className="text-xs font-medium italic">

                                              No hay habitaciones asignadas.

                                            </p>

                                            <p className="text-[10px]">

                                              Usa el formulario superior para

                                              añadir inventario.

                                            </p>

                                          </div>

                                        </td>

                                      </tr>

                                    )}

                                </tbody>

                              </table>

                            </div>

                          </div>



                          {/* FINANZAS Y BITÁCORA - Premium Layout */}

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                            {/* Tesorería - Horizontal Cards */}

                            {/* Tesorería - DINÁMICA (4 de 12) */}

                            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">

                              {(() => {

                                if (!selectedGroupFicha?.records) return null;

                                const uniqueHotels = Array.from(

                                  new Set(

                                    selectedGroupFicha.records

                                      .map(

                                        (r) =>

                                          r["Hotel_Asignado"] ||

                                          r["Hotel"] ||

                                          "Desconocido",

                                      )

                                      .filter((h) => h && h !== "-"),

                                  ),

                                );

                                if (uniqueHotels.length === 0)

                                  uniqueHotels.push("General");



                                const rawRoomingList = getEconomicRoomingItems(selectedGroupFicha.records[0]?.["RoomingList_JSON"], "hotel-totals");
                                const roomingList = rawRoomingList.length > 500 ? [] : rawRoomingList;

                                 return (
                                   <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[400px] custom-scrollbar">
                                    {uniqueHotels.map((hotelName) => {
                                      const hotelRoomingItems =
                                        roomingList.filter(
                                          (i) =>
                                            i.hotel === hotelName ||
                                            (hotelName === "General" &&
                                              !i.hotel),
                                        );
                                      const hotelTotal =

                                         hotelRoomingItems.reduce(

                                           (acc, i) =>

                                             acc + (parseFloat(i.total) || 0) - (parseFloat(i.comision?.total_comision) || 0),

                                           0,

                                         ) ||

                                        parseFloat(

                                          selectedGroupFicha.records.find(

                                            (r) =>

                                              (r["Hotel_Asignado"] ||

                                                r["Hotel"]) === hotelName,

                                          )?.["Importe(*)"] || 0,

                                        );

                                        const hotelRecord =

                                        selectedGroupFicha.records.find(

                                          (r) =>

                                            (r["Hotel_Asignado"] ||

                                              r["Hotel"] ||

                                              "Desconocido") === hotelName,

                                        ) || selectedGroupFicha.records[0];

                                      const arrivalDate =

                                        hotelRecord["Entrada"];

                                      let plan = [];
                                      try {
                                        plan = JSON.parse(
                                          hotelRecord.PaymentPlan_JSON ||
                                          "[]"
                                        );
                                      } catch (e) {
                                        plan = [];
                                      }
                                      plan = reconcileReactPaymentPlan(plan, hotelTotal, arrivalDate);
                                      if (plan && plan.length > 1) {
                                        plan = plan.map((p, idx) => {
                                          if (idx === 0 && (p.label === "Pago Único" || p.label === "Primer Pago" || !p.label)) {
                                            return { ...p, label: "Depósito" };
                                          }
                                          return p;
                                        });
                                      } else if (plan && plan.length === 1) {
                                        plan = plan.map((p) => {
                                          if (p.label === "Depósito" || p.label === "Primer Pago" || !p.label) {
                                            return { ...p, label: "Pago Único" };
                                          }
                                          return p;
                                        });
                                      }



                                      const totalPercent = plan.reduce(

                                        (acc, p) =>

                                          acc + (parseFloat(p.percent) || 0),

                                        0,

                                      );



                                      const handlePlanChange = (

                                        idx,

                                        field,

                                        val,

                                      ) => {

                                        const newPlan = [...plan];

                                        let updatedVal = val;

                                        if (field === "date") {

                                          updatedVal = toInputDate(val);

                                        }

                                        newPlan[idx] = {

                                          ...newPlan[idx],

                                          [field]: updatedVal,

                                        };



                                        if (

                                          field === "percent" ||

                                          field === "releaseDays"

                                        ) {

                                          const pct =

                                            parseNum(

                                              newPlan[idx].percent,

                                            ) || 0;

                                          const days =

                                            parseInt(

                                              newPlan[idx].releaseDays,

                                            ) || 0;

                                          newPlan[idx].amount = (

                                            hotelTotal *

                                            (pct / 100)

                                          ).toFixed(2);

                                          let d;

                                          const sDate = arrivalDate;

                                          const numDate = parseFloat(sDate);

                                          if (

                                            !isNaN(numDate) &&

                                            numDate > 40000 &&

                                            numDate < 60000

                                          ) {

                                            d = new Date(

                                              Math.round(

                                                (numDate - 25569) *

                                                86400 *

                                                1000,

                                              ),

                                            );

                                          } else {

                                            const dateStr =

                                              toInputDate(sDate);

                                            d = new Date(dateStr);

                                          }

                                          d.setDate(d.getDate() - days);

                                          newPlan[idx].date = d

                                            .toISOString()

                                            .split("T")[0];

                                        } else if (field === "amount") {

                                          const amt = parseFloat(val) || 0;

                                          newPlan[idx].amount = amt.toFixed(2);

                                          const pct = hotelTotal > 0 ? (amt / hotelTotal) * 100 : 0;

                                          newPlan[idx].percent = parseFloat(pct.toFixed(2));

                                        } else if (field === "date") {

                                          let arrD;

                                          const sDate = arrivalDate;

                                          const numDate = parseFloat(sDate);

                                          if (

                                            !isNaN(numDate) &&

                                            numDate > 40000 &&

                                            numDate < 60000

                                          ) {

                                            arrD = new Date(

                                              Math.round(

                                                (numDate - 25569) *

                                                86400 *

                                                1000,

                                              ),

                                            );

                                          } else {

                                            const dateStr =

                                              toInputDate(sDate);

                                            arrD = new Date(dateStr);

                                          }

                                          const editD = new Date(updatedVal);

                                          if (arrD && !isNaN(arrD.getTime()) && editD && !isNaN(editD.getTime())) {

                                            arrD.setHours(0, 0, 0, 0);

                                            editD.setHours(0, 0, 0, 0);

                                            const diffTime = arrD.getTime() - editD.getTime();

                                            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                                            newPlan[idx].releaseDays = diffDays;

                                          }

                                        }



                                        const reconciled = reconcileReactPaymentPlan(newPlan, hotelTotal, arrivalDate, {
                                          lockedIndex: field === "percent" || field === "amount" ? idx : -1,
                                        });

                                        updatePaymentPlan(

                                          selectedGroupFicha.id,

                                          hotelName,

                                          reconciled,

                                        );

                                      };



                                      const addPlanRow = () => {

                                        const remaining = Math.max(

                                          0,

                                          100 - totalPercent,

                                        );

                                        let d;

                                        const sDate = arrivalDate;

                                        const numDate = parseFloat(sDate);

                                        if (

                                          !isNaN(numDate) &&

                                          numDate > 40000 &&

                                          numDate < 60000

                                        ) {

                                          d = new Date(

                                            Math.round(

                                              (numDate - 25569) *

                                              86400 *

                                              1000,

                                            ),

                                          );

                                        } else {

                                          const dateStr = toInputDate(sDate);

                                          d = new Date(dateStr);

                                        }

                                        const days = 30;

                                        d.setDate(d.getDate() - days);

                                        const newRow = {

                                          id: Date.now(),

                                          label:

                                            remaining === 100

                                              ? "Pago Único"

                                              : (plan.length === 0 ? "Primer Pago" : "Pago Final"),

                                          percent: remaining,

                                          amount: (

                                            hotelTotal *

                                            (remaining / 100)

                                          ).toFixed(2),

                                          releaseDays: days,

                                          date: d.toISOString().split("T")[0],

                                          status: "Pendiente",

                                          Enlace_TPV: "",

                                        };

                                        const reconciled = reconcileReactPaymentPlan([...plan, newRow], hotelTotal, arrivalDate);

                                        updatePaymentPlan(

                                          selectedGroupFicha.id,

                                          hotelName,

                                          reconciled,

                                        );

                                      };



                                      const removePlanRow = (idx) => {

                                        const filtered = plan.filter((_, i) => i !== idx);

                                        const reconciled = reconcileReactPaymentPlan(filtered, hotelTotal, arrivalDate);

                                        updatePaymentPlan(

                                          selectedGroupFicha.id,

                                          hotelName,

                                          reconciled,

                                        );

                                      };



                                      return (

                                        <div

                                          key={hotelName}

                                          className="p-2 bg-slate-50/20"

                                        >

                                          <div className="flex justify-between items-center mb-1.5 px-1 bg-white p-1 rounded border border-slate-100 shadow-sm">

                                            <div className="flex items-center gap-2">

                                              <div className="bg-emerald-600 p-0.5 rounded text-white">

                                                <IconPieChart size={10} />

                                              </div>

                                              <span className="text-[10px] font-black text-slate-700 uppercase">

                                                {hotelName}

                                              </span>

                                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded">
                                                {hotelTotal.toLocaleString(
                                                  "es-ES",
                                                  {
                                                    style: "currency",
                                                    currency: "EUR",
                                                  },
                                                )}
                                              </span>
                                            </div>
                                          
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const nextVal = !isGroupCredito;
                                                  updateGroupMetadata(selectedGroupFicha.id, "Es_Credito", nextVal);
                                                }}
                                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all border ${
                                                  isGroupCredito
                                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                                                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                                                }`}
                                                title={isGroupCredito ? "Grupo a crédito activo. Clic para cambiar a prepago" : "Marcar este grupo como crédito (no requiere pago anticipado)"}
                                              >
                                                <IconCreditCard size={11} stroke={isGroupCredito ? 2.5 : 2} />
                                                {isGroupCredito ? "A Crédito" : "Marcar Crédito"}
                                              </button>
                                            </div>

                                          {isGroupCredito && plan.length === 0 ? (
                                              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 text-center space-y-2 my-1 shadow-2xs">
                                                <div className="flex items-center justify-center gap-1.5 text-indigo-700 font-black text-[10px] uppercase tracking-wider">
                                                  <IconCreditCard size={14} stroke={2.5} />
                                                  <span>Cliente con Crédito Concedido</span>
                                                </div>
                                                <p className="text-[9px] text-indigo-900/70 font-medium leading-relaxed max-w-xs mx-auto">
                                                  Este grupo no requiere pago anticipado ni depósitos previos a la entrada. Facturación a crédito según condiciones acordadas.
                                                </p>
                                                <div className="pt-1 flex items-center justify-center gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={addPlanRow}
                                                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-[8px] font-black uppercase tracking-wider transition-all shadow-2xs flex items-center gap-1.5"
                                                    title="Opcional: Añadir tramo si se acuerda algún pago o abono específico"
                                                  >
                                                    <IconPlus size={10} stroke={2.5} />
                                                    Añadir Tramo Específico (Opcional)
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <div className="space-y-1.5">
                                                {isGroupCredito && (
                                                  <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50/40 border border-indigo-100 rounded text-[8px] font-bold text-indigo-700 mb-1">
                                                    <IconCreditCard size={10} stroke={2} />
                                                    <span>Condición a Crédito activa: tramos informativos (sin prepago obligatorio).</span>
                                                  </div>
                                                )}
                                                <div className="grid grid-cols-[20px_60px_85px_60px_120px_65px_20px] justify-between gap-1.5 px-1 mb-1 text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                              <div></div>
                                              <div className="text-center">
                                                %
                                              </div>
                                              <div className="text-right pr-2">
                                                Importe
                                              </div>
                                              <div className="text-center">
                                                Release
                                              </div>
                                              <div className="text-center">
                                                Fecha
                                              </div>
                                              <div className="text-center">
                                                Estado
                                              </div>
                                              <div></div>
                                            </div>

                                            {(() => {
                                              let lastUnpaidIdx = -1;
                                              for (
                                                let i = plan.length - 1;
                                                i >= 0;
                                                i--
                                              ) {
                                                if (
                                                  plan[i].status !== "Cobrado"
                                                ) {
                                                  lastUnpaidIdx = i;
                                                  break;
                                                }
                                              }

                                              return plan.map((dep, idx) => {
                                                const isPaid =
                                                  dep.status === "Cobrado";
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                const depDate = new Date(
                                                  toInputDate(dep.date),
                                                );
                                                depDate.setHours(0, 0, 0, 0);
                                                const isWarning =
                                                  !isPaid &&
                                                  Math.ceil(
                                                    (depDate - today) /
                                                    (1000 * 60 * 60 * 24),
                                                  ) <= 2;
                                                const isLastUnpaid =
                                                  idx === lastUnpaidIdx;

                                                return (
                                                  <div
                                                    key={dep.id}
                                                    className={`grid grid-cols-[20px_60px_85px_60px_120px_65px_20px] justify-between items-center gap-1.5 p-1 rounded border ${isPaid ? "bg-emerald-50/40 border-emerald-100/50" : isWarning ? "bg-rose-50 border-rose-200 animate-pulse" : "bg-white border-slate-100"} hover:border-slate-300 transition-all group shadow-sm pl-1`}
                                                  >
                                                    <div className="flex justify-center w-5">
                                                      {isWarning ? (
                                                        <IconAlertTriangle
                                                          size={10}
                                                          className="text-rose-500"
                                                        />
                                                      ) : (
                                                        <div
                                                          className={`w-1.5 h-1.5 rounded-full ${isPaid ? "bg-emerald-500" : "bg-slate-300"}`}
                                                        ></div>
                                                      )}
                                                    </div>

                                                    {/* % Input */}
                                                    <div className="flex items-center justify-center bg-slate-50 rounded h-5 border border-slate-100 w-full px-1">
                                                      <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        onKeyDown={handleDotAsComma}
                                                        key={idx + "-" + dep.percent}
                                                        className="bg-transparent border-none text-[10px] font-black text-slate-600 w-full text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        defaultValue={dep.percent}
                                                        onBlur={(e) =>
                                                          handlePlanChange(
                                                            idx,
                                                            "percent",
                                                            e.target.value,
                                                          )
                                                        }
                                                      />
                                                      <span className="text-[8px] font-black text-slate-400 ml-0.5">
                                                        %
                                                      </span>
                                                    </div>

                                                    {/* Importe Input */}
                                                    <div className="flex items-center justify-end bg-slate-50 rounded px-1 h-5 border border-slate-100 w-full">
                                                      <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        onKeyDown={handleDotAsComma}
                                                        key={idx + "-" + dep.amount}
                                                        className={`bg-transparent border-none text-[10px] font-black text-right outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isPaid ? "text-emerald-700" : isWarning ? "text-rose-700" : "text-slate-700"}`}
                                                        defaultValue={dep.amount}
                                                        onBlur={(e) =>
                                                          handlePlanChange(
                                                            idx,
                                                            "amount",
                                                            e.target.value,
                                                          )
                                                        }
                                                      />
                                                      <span className={`text-[9px] font-black ml-0.5 ${isPaid ? "text-emerald-700" : isWarning ? "text-rose-700" : "text-slate-700"}`}>
                                                        €
                                                      </span>
                                                    </div>

                                                    {/* Release Input */}
                                                    <div className="flex items-center justify-center bg-blue-50/70 rounded h-5 border border-blue-100 w-full px-1">
                                                      <input
                                                        type="number"
                                                        key={idx + "-" + dep.releaseDays}
                                                        className="bg-transparent border-none text-[10px] font-black text-blue-700 w-full text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        defaultValue={dep.releaseDays}
                                                        onBlur={(e) =>
                                                          handlePlanChange(
                                                            idx,
                                                            "releaseDays",
                                                            e.target.value,
                                                          )
                                                        }
                                                      />
                                                      <span className="text-[8px] font-black text-blue-400 ml-0.5">
                                                        D
                                                      </span>
                                                    </div>

                                                    {/* Date (Fecha) Input */}
                                                    <div className="flex items-center justify-center bg-slate-50 border border-slate-100 rounded px-1 h-5 w-full">
                                                      <input
                                                        type="date"
                                                        key={idx + "-" + dep.date}
                                                        className={`bg-transparent border-none text-[10px] font-black outline-none text-center w-full cursor-pointer ${isWarning ? "text-rose-600" : "text-slate-600"}`}
                                                        defaultValue={toInputDate(dep.date)}
                                                        onChange={(e) =>
                                                          handlePlanChange(
                                                            idx,
                                                            "date",
                                                            e.target.value,
                                                          )
                                                        }
                                                      />
                                                    </div>



                                                    <button

                                                      onClick={() =>

                                                        handlePlanChange(

                                                          idx,

                                                          "status",

                                                          isPaid

                                                            ? "Pendiente"

                                                            : "Cobrado",

                                                        )

                                                      }

                                                      className={`h-5 w-full rounded text-[9px] font-black transition-all ${isPaid ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200" : "bg-slate-100 text-slate-400"}`}

                                                    >

                                                      {isPaid ? (

                                                        <IconCheck

                                                          size={10}

                                                          stroke={4}

                                                          className="mx-auto"

                                                        />

                                                      ) : (

                                                        "PND"

                                                      )}

                                                    </button>

                                                    <button

                                                      onClick={() =>

                                                        removePlanRow(idx)

                                                      }

                                                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity flex justify-center"

                                                    >

                                                      <IconTrash size={12} />

                                                    </button>

                                                  </div>

                                                );

                                              });

                                            })()}

                                            {totalPercent < 100 && (
                                                <button
                                                  onClick={addPlanRow}
                                                  className={`w-full py-2 border border-dashed rounded transition-all text-[9px] font-black uppercase flex items-center justify-center gap-2 bg-white ${isGroupCredito ? "border-indigo-200 text-indigo-400 hover:border-indigo-400 hover:text-indigo-600" : "border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-500"}`}
                                                >
                                                  <IconPlus size={12} /> {isGroupCredito ? "Añadir Tramo Opcional" : "Añadir Tramo"} ({100 - totalPercent}%)
                                                </button>
                                              )}
                                            </div>
                                            )}

                                        </div>

                                      );

                                    })}

                                  </div>

                                );

                              })()}

                            </div>



                            {/* Bitácora / Notas Operativas (8 de 12) */}

                            <div className="lg:col-span-8 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full relative overflow-hidden">

                              <div className="absolute top-0 right-0 p-2 opacity-5">

                                <IconFile size={60} />

                              </div>

                              <div className="flex flex-col gap-3 mb-2 z-10 w-full">

                                <div className="flex items-center gap-2 w-full">

                                  <div className="bg-amber-100 p-1 rounded text-amber-600">

                                    <IconEdit size={14} />

                                  </div>

                                  <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-widest">

                                    Notas de Control

                                  </h4>

                                  {(() => {

                                    const specificLink = selectedGroupFicha.records[0]?.["Enlace_TPV"];

                                    return (

                                      <div className="ml-auto flex items-center gap-2">



                                      <input

                                        type="text"

                                        placeholder="Pegue aquí el enlace de pasarela..."

                                        className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[9px] w-64 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-600 transition-colors"

                                        defaultValue={specificLink || ""}

                                        onBlur={(e) => updateGroupMetadata(selectedGroupFicha.id, "Enlace_TPV", e.target.value)}

                                      />

                                      {specificLink ? (

                                        <a

                                          href={specificLink}

                                          target="_blank"

                                          rel="noopener noreferrer"

                                          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[9px] font-black uppercase tracking-wider transition-all shadow-sm shadow-emerald-200"

                                        >

                                          <IconCreditCard size={12} stroke={3} />

                                          Pasarela

                                        </a>

                                      ) : (

                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider opacity-50">

                                          <IconCreditCard size={12} stroke={3} />

                                          Sin Enlace TPV

                                        </div>

                                      )}

                                    </div>

                                  );

                                })()}

                              </div>



                              {/* Checklist Logística Interactivo */}

                              {(() => {

                                const record = selectedGroupFicha.records[0] || {};

                                const status = (record["Estado"] || "").toUpperCase();

                                const isInactive = ["ANULADA", "CANCELADA", "GASTOS DE ANULACION", "BAJA"].includes(status);

                                

                                if (isInactive) return null;



                                const hasRooming = record["Logistica_Rooming"] === true;

                                const hasMP = record["Logistica_MenuMP"] === true;

                                const hasPC = record["Logistica_MenuPC"] === true;



                                const regimen = (record["Régimen"] || "").toUpperCase();

                                const needsMP = regimen.includes("MP");

                                const needsPC = regimen.includes("PC");



                                let daysToArrival = 999;
                                 if (record["Entrada"]) {
                                   const arrDateStr = String(record["Entrada"]).trim();
                                   let arrDate = null;
                                   if (arrDateStr.includes('/')) {
                                     const [d, m, y] = arrDateStr.split('/');
                                     arrDate = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T12:00:00`);
                                   } else {
                                     arrDate = new Date(arrDateStr.includes('T') ? arrDateStr : arrDateStr + 'T12:00:00');
                                   }
                                   if (arrDate && !isNaN(arrDate.getTime())) {
                                     daysToArrival = Math.ceil((arrDate - new Date()) / (1000 * 60 * 60 * 24));
                                   }
                                 }



                                const isClose = daysToArrival <= 15 && daysToArrival >= 0;

                                // Para MP y PC, si no dice explícitamente que NO lo necesita y no está checkeado, es falta (solo si el régimen lo pide o si falta rooming que es obligatorio siempre)

                                const missingCritical = !hasRooming || (needsMP && !hasMP) || (needsPC && !hasPC);

                                const stProps = getStatusProps(record["Com_Estado_Interno"] || record["Segment."], record["Entrada"], record["Estado"]);
                                 const isConfirmed = stProps.label === "CONFIRMADO";
                                 const showWarning = isConfirmed && isClose && missingCritical;



                                const missingList = [

                                  !hasRooming && "Rooming List",

                                  needsMP && !hasMP && "Menú MP",

                                  needsPC && !hasPC && "Menú PC"

                                ].filter(Boolean).join(", ");



                                return (

                                  <div className="flex flex-col gap-2 w-full">

                                    {showWarning && (

                                      <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse-slow">

                                        <IconAlertTriangle size={14} className="text-rose-500 shrink-0" stroke={3} />

                                        <span>ALERTA LOGÍSTICA: Llegada en {daysToArrival} días. Faltan datos operativos ({missingList}).</span>

                                      </div>

                                    )}



                                    <div className="flex flex-wrap items-center gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100">

                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1">Comprobación:</span>

                                      

                                      <button

                                        onClick={() => updateGroupMetadata(selectedGroupFicha.id, "Logistica_Rooming", !hasRooming)}

                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${hasRooming ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}

                                      >

                                        {hasRooming ? <IconCheckCircle size={12} stroke={3} /> : <IconCircle size={12} stroke={2} />}

                                        Rooming List

                                      </button>

                                        <button
                                          onClick={() => updateGroupMetadata(selectedGroupFicha.id, "Es_Credito", !isGroupCredito)}
                                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${isGroupCredito ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                          title="Indicar si este grupo dispone de crédito y no requiere pago anticipado"
                                        >
                                          {isGroupCredito ? <IconCheckCircle size={12} stroke={3} className="text-indigo-600" /> : <IconCreditCard size={12} stroke={2} />}
                                          {isGroupCredito ? "A Crédito" : "Pago a Crédito"}
                                        </button>



                                      {needsMP && (

                                        <button

                                          onClick={() => updateGroupMetadata(selectedGroupFicha.id, "Logistica_MenuMP", !hasMP)}

                                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${hasMP ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}

                                        >

                                          {hasMP ? <IconCheckCircle size={12} stroke={3} /> : <IconCircle size={12} stroke={2} />}

                                          Menú MP

                                        </button>

                                      )}



                                      {needsPC && (

                                        <button

                                          onClick={() => updateGroupMetadata(selectedGroupFicha.id, "Logistica_MenuPC", !hasPC)}

                                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ${hasPC ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}

                                        >

                                          {hasPC ? <IconCheckCircle size={12} stroke={3} /> : <IconCircle size={12} stroke={2} />}

                                          Menú PC

                                        </button>

                                      )}

                                    </div>

                                  </div>

                                );

                              })()}

                            </div>



                              <div className="flex-1 z-10">

                                  <textarea

                                    id="notas-control-textarea"

                                    className="w-full h-full bg-amber-50/50 border border-amber-100 rounded-lg p-2 text-[10px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none leading-relaxed placeholder-amber-300"

                                    placeholder="Escribe aquí notas operativas, recordatorios o detalles importantes del grupo..."

                                    defaultValue={

                                      selectedGroupFicha.records[0]?.["Com_Notas"] || ""

                                    }

                                    onBlur={(e) =>

                                      updateGroupMetadata(

                                        selectedGroupFicha.id,

                                        "Com_Notas",

                                        e.target.value,

                                      )

                                    }

                                  ></textarea>

                              </div>

                            </div>

                          </div>



                          {/* REGISTROS ARCHIVO (Opcional scrollable) */}

                          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">

                            <table className="w-full text-[9px] leading-tight">

                              <thead className="bg-[#0f172a] text-white font-black uppercase">

                                <tr>

                                  <th className="px-3 py-1.5 text-left">

                                    Reserva

                                  </th>

                                  <th className="px-3 py-1.5 text-left">

                                    Hotel

                                  </th>

                                  <th className="px-3 py-1.5 text-left">

                                    Periodo

                                  </th>

                                  <th className="px-3 py-1.5 text-right">

                                    Cantidad

                                  </th>

                                  <th className="px-3 py-1.5 text-right">

                                    Importe

                                  </th>

                                  <th className="px-3 py-1.5 text-center">

                                    Estado

                                  </th>

                                </tr>

                              </thead>

                              <tbody className="divide-y divide-slate-100">

                                {(selectedGroupFicha.records || []).map(

                                  (rec, idx) => (

                                    <tr

                                      key={idx}

                                      className="hover:bg-slate-50 transition-colors"

                                    >

                                      <td className="px-3 py-1.5 font-bold text-slate-900">

                                        {rec["Reserva"]}

                                      </td>

                                      <td className="px-3 py-1.5 font-bold text-slate-500">

                                        {normalizeHotelNameLocal(rec["Hotel_Asignado"] ||

                                          rec["Hotel"] ||

                                          "-")}

                                      </td>

                                      <td className="px-3 py-1.5 text-slate-600">

                                        {formatDate(rec["Entrada"])} -{" "}

                                        {formatDate(rec["Salida"])}

                                      </td>

                                      <td className="px-3 py-1.5 text-right font-bold">

                                        {rec["Hab."] || "-"}

                                      </td>

                                      <td className="px-3 py-1.5 text-right font-black text-emerald-600">

                                        {parseNum(

                                          rec["Importe(*)"],

                                        ).toLocaleString("es-ES", {

                                          minimumFractionDigits: 2,

                                        })}{" "}

                                        €

                                      </td>

                                      <td className="px-3 py-1.5 text-center">

                                        <span

                                          className={`px-2 py-0.5 rounded text-[7px] font-black uppercase ${rec["Estado"]?.toLowerCase().includes("conf") ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}

                                        >

                                          {rec["Estado"] || "???"}

                                        </span>

                                      </td>

                                    </tr>

                                  ),

                                )}

                              </tbody>

                            </table>

                          </div>

                        </div>



                        {/* FOOTER DE ACCIONES - Fijo y Elegante */}

                        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)] shrink-0">

                          <div className="flex gap-2">

                            <button

                              onClick={() =>

                                handleProformaClick(selectedGroupFicha)

                              }

                              className="px-6 h-11 bg-slate-900 hover:bg-black text-white rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-200"

                            >

                              <IconFileInvoice size={18} stroke={2} />

                              <span className="text-[11px] font-black uppercase tracking-widest">

                                Generar Proforma

                              </span>

                            </button>

                            <button

                              onClick={() => {

                                localStorage.setItem("selectedGroup", JSON.stringify(selectedGroupFicha));

                                window.location.href = "Orden Servicio.html";

                              }}

                              className="px-6 h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-200/50"

                            >

                              <IconUtensils size={18} stroke={2} />

                              <span className="text-[11px] font-black uppercase tracking-widest">

                                Orden Servicio

                              </span>

                            </button>

                            <button

                              onClick={() => {

                                localStorage.setItem("selectedGroup", JSON.stringify(selectedGroupFicha));
                                const roomingReserva = String(selectedGroupFicha.records?.[0]?.Reserva || selectedGroupFicha.id || "").trim();
                                localStorage.setItem("nexus_open_ficha", roomingReserva);

                                window.location.href = `Rooming-Servicios.html?reserva=${encodeURIComponent(roomingReserva)}`;

                              }}

                              className="px-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-200/50"

                            >

                              <IconFileText size={18} stroke={2} />

                              <span className="text-[11px] font-black uppercase tracking-widest">

                                Rooming y Servicios

                              </span>

                            </button>

                            <button

                              onClick={openClientDataModal}

                              className="px-4 h-11 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center transition-all"

                              title="Configuración de Factura"

                            >

                              <IconSettings size={18} />

                            </button>

                            <button

                              onClick={() => setShowCrmPanel(p => !p)}

                              className={`px-4 h-11 rounded-2xl flex items-center justify-center transition-all ${showCrmPanel ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'}`}

                              title="Historial / CRM"

                            >

                              <IconMessage size={18} />

                            </button>

                          </div>



                          <div className="flex gap-3">

                            <button

                              onClick={() => setShowFichaModal(false)}

                              className="px-6 h-11 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all tracking-widest"

                            >

                              Cerrar Ficha

                            </button>

                            <button
                              onClick={async () => {
                                if (selectedGroupFicha && selectedGroupFicha.records && selectedGroupFicha.records[0]) {
                                  try {
                                    const currentRec = selectedGroupFicha.records[0];
                                    let currentRL = [];
                                    try {
                                      currentRL = parseRoomingListSafe(currentRec["RoomingList_JSON"], "save-ficha-button");
                                    } catch(e) {}

                                    let distMap = {};
                                    if (currentRec.DailyDistribution_JSON) {
                                      try {
                                        distMap = typeof currentRec.DailyDistribution_JSON === "string"
                                          ? JSON.parse(currentRec.DailyDistribution_JSON)
                                          : { ...currentRec.DailyDistribution_JSON };
                                      } catch(e) {}
                                    }

                                    if (Array.isArray(currentRL) && currentRL.length > 0) {
                                      const hotelTarget = currentRec.Hotel_Asignado || currentRec.Hotel || selectedGroupFicha?.hotel || "";
                                      distMap = buildDailyDistributionFromRoomingList(currentRL, distMap, hotelTarget);
                                      const firstValidRegime = currentRL.find(r => !r.isService && r.regime && r.regime !== "-")?.regime;
                                      const savePayload = {
                                        RoomingList_JSON: JSON.stringify(currentRL),
                                        DailyDistribution_JSON: JSON.stringify(distMap)
                                      };
                                      if (firstValidRegime) {
                                        savePayload["Régimen"] = firstValidRegime;
                                      }
                                      await updateGroupMetadata(selectedGroupFicha.id, savePayload);
                                    }
                                  } catch (err) {
                                    console.error("Error synchronizing in Grabar Cambios:", err);
                                  }
                                }
                                alert(
                                  "✅ Cambios registrados y sincronizados con éxito.",
                                );
                                setShowFichaModal(false);
                              }}

                              className="px-10 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-200"

                            >

                              <IconSave size={18} stroke={2.5} />

                              <span className="text-[11px] font-black uppercase tracking-widest">

                                Grabar Cambios

                              </span>

                            </button>

                          </div>

                        </div>



                        {/* CRM Historico / Seguimiento - Side Panel */}

                        {showCrmPanel && (

                          <div className="absolute top-0 right-0 w-80 h-full bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col animate-slide-left">

                            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shrink-0">

                                <div className="flex items-center gap-2">

                                    <IconMessage size={18} />

                                    <span className="text-xs font-black uppercase tracking-widest">Historial / CRM</span>

                                </div>

                                <button onClick={() => setShowCrmPanel(false)} className="hover:bg-indigo-700 p-1 rounded-lg">

                                    <IconX size={18} />

                                </button>

                            </div>

                            

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50">

                                {crmHistory.length === 0 ? (

                                    <div className="text-center py-10 opacity-40">

                                        <IconMessage size={32} className="mx-auto mb-2" />

                                        <p className="text-[10px] font-bold uppercase">Sin notas de seguimiento</p>

                                    </div>

                                ) : (

                                    crmHistory.map((h, i) => (

                                        <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-1">

                                            <div className="flex justify-between items-center">

                                                <span className="text-[8px] font-black text-indigo-500 uppercase">{h.date}</span>

                                            </div>

                                            <p className="text-xs text-slate-700 leading-relaxed">{h.text}</p>

                                        </div>

                                    ))

                                )}

                            </div>



                            <div className="p-4 bg-white border-t border-slate-200 space-y-3">

                                <textarea 

                                    className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none"

                                    placeholder="Añadir nota de seguimiento..."

                                    value={crmNote}

                                    onChange={(e) => setCrmNote(e.target.value)}

                                ></textarea>

                                <button 

                                    onClick={addCrmNote}

                                    disabled={!crmNote.trim()}

                                    className="w-full h-10 bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"

                                >

                                    Guardar Nota

                                </button>

                            </div>

                          </div>

                        )}

                      </>

                    );

                  })()}

                </div>

              </div>

            )}



            {/* Modal de Comisión Unitario - Inteligencia por Unidad */}

            {commissionModal.isOpen && (() => {
                const activeModalItem = commissionModal.item || (selectedGroupFicha?.records?.[0]?.["RoomingList_JSON"] ? parseRoomingListSafe(selectedGroupFicha.records[0]["RoomingList_JSON"], "selectedGroupFicha")[commissionModal.itemIdx] : null) || {};
                const modalUnitPrice = parseFloat(activeModalItem.price) || 0;
                const modalPaxPerRoom = activeModalItem.pax || getPaxByRoomType(activeModalItem.type);
                const modalRegime = activeModalItem.regime || "HD";
                return (

              <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center z-[110] animate-fade-in">

                <div className="bg-white rounded-xl shadow-2xl w-[90vw] max-w-[340px] border border-slate-200 overflow-hidden">

                  <div className="bg-[#0f172a] px-4 py-3 flex justify-between items-center text-white">

                    <div className="flex items-center gap-3">

                      <div className="bg-blue-500/20 p-1.5 rounded-lg border border-blue-500/30">

                        <IconSettings size={14} className="text-blue-400" />

                      </div>

                      <div>

                        <h3 className="font-black uppercase text-[10px] tracking-widest text-white leading-none">

                          Cálculo de Comisión

                        </h3>

                        <p className="text-[7px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter">

                          Desglose por Conceptos Unitarios

                        </p>

                      </div>

                    </div>

                    <button

                      onClick={() =>

                        setCommissionModal({ isOpen: false, item: null, itemIdx: null, itemIds: null, tempCom: null })

                      }

                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"

                    >

                      <IconX size={18} />

                    </button>

                  </div>



                  <div className="p-4 space-y-5 text-left bg-slate-50/30">

                    {/* info unitaria info pills */}

                    <div className="grid grid-cols-3 gap-2">

                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">

                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">

                          <span className="text-[10px] font-black">€</span>

                        </div>

                        <div className="min-w-0">

                          <span className="block text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">

                            Precio Unit.

                          </span>

                          <span className="text-xs font-black text-slate-700">

                            {modalUnitPrice.toFixed(2)}{" "}

                            €

                          </span>

                        </div>

                      </div>

                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">

                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">

                          <IconUsers size={12} />

                        </div>

                        <div className="min-w-0">

                          <span className="block text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">

                            Pax/Hab.

                          </span>

                          <span className="text-xs font-black text-slate-500">

                            {modalPaxPerRoom}{" "}

                            pax

                          </span>

                        </div>

                      </div>

                      <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">

                        <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">

                          <IconUtensils size={12} />

                        </div>

                        <div className="min-w-0">

                          <span className="block text-[7px] font-black text-slate-400 uppercase tracking-widest truncate">

                            Régimen

                          </span>

                          <span className="text-xs font-black text-slate-500">

                            {modalRegime}

                          </span>

                        </div>

                      </div>

                    </div>



                    <div className="grid grid-cols-[1fr_100px] gap-3">

                      <div>

                        <label className="block text-[8px] font-black text-slate-500 uppercase mb-1.5 ml-1 tracking-widest">

                          Porcentaje Comisionable

                        </label>

                        <div className="relative group">

                          <input

                            type="text"

                            inputMode="decimal"

                            onKeyDown={handleDotAsComma}

                            className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"

                            value={commissionModal.tempCom.porcentaje !== undefined ? String(commissionModal.tempCom.porcentaje).replace('.', ',') : ''}

                            onChange={(e) =>

                              setCommissionModal((prev) => ({

                                ...prev,

                                tempCom: {

                                  ...prev.tempCom,

                                  porcentaje: parseNum(e.target.value) || 0,

                                },

                              }))

                            }

                          />

                          <span className="absolute right-3 top-2.5 text-xs text-slate-300 font-black">

                            %

                          </span>

                        </div>

                      </div>

                      <div>

                        <label className="block text-[8px] font-black text-slate-500 uppercase mb-1.5 ml-1 tracking-widest">

                          Procedencia

                        </label>

                        <div className="relative">

                          <select

                            className="w-full h-10 bg-white border border-slate-200 rounded-xl px-2 text-[10px] font-black text-slate-600 outline-none appearance-none hover:border-slate-300 transition-all shadow-sm cursor-pointer"

                            value={commissionModal.tempCom.modo}

                            onChange={(e) =>

                              setCommissionModal((prev) => ({

                                ...prev,

                                tempCom: {

                                  ...prev.tempCom,

                                  modo: e.target.value,

                                },

                              }))

                            }

                          >

                            <option value="auto">💰 AUTO</option>

                            <option value="manual">✍️ MANUAL</option>

                          </select>

                          <IconChevronDown

                            size={14}

                            className="absolute right-2 top-3 text-slate-300 pointer-events-none"

                          />

                        </div>

                      </div>

                    </div>



                    {commissionModal.tempCom.modo === "auto" ? (

                      <div className="space-y-2">

                        <div className="flex justify-between items-center px-1">

                          <label className="block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">

                            Desglose del Precio

                          </label>

                          <div className="flex items-center gap-1.5">

                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>

                            <span className="text-[7px] font-bold text-slate-400 uppercase">

                              Comisionable

                            </span>

                          </div>

                        </div>



                        <div className="grid grid-cols-1 gap-2">

                          {Object.entries(

                            commissionModal.tempCom.desglose || {},

                          ).map(([key, data]) => (

                            <div

                              key={key}

                              className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${data.comisionable ? "bg-white border-blue-100 shadow-sm" : "bg-slate-50 border-slate-100 opacity-60"}`}

                            >

                              <div className="flex-1 flex items-center gap-2">

                                <div

                                  className={`p-1 rounded-md ${data.comisionable ? "bg-blue-50 text-blue-500" : "bg-slate-200 text-slate-400"}`}

                                >

                                  <IconCircle size={8} fill="currentColor" />

                                </div>

                                <span className="text-[9px] font-black text-slate-600 uppercase w-20 truncate">

                                  {key}

                                </span>

                                <div className="relative flex-1">

                                  <input

                                    type="number"

                                    onKeyDown={handleDotAsComma}

                                    className="w-full h-7 bg-transparent border-none rounded text-xs font-black px-1 outline-none text-right pr-4"

                                    value={data.valor}

                                    onChange={(e) => {

                                      const val =

                                        parseFloat(e.target.value) || 0;

                                      const newDesglose = {

                                        ...commissionModal.tempCom.desglose,

                                        [key]: { ...data, valor: val },

                                      };



                                      if (key !== "Alojamiento") {
                                        const des = key === "Desayuno" ? val : (newDesglose.Desayuno?.valor || 0);
                                        const alm = key === "Almuerzo" ? val : (newDesglose.Almuerzo?.valor || 0);
                                        const cen = key === "Cena" ? val : (newDesglose.Cena?.valor || 0);
                                        newDesglose.Alojamiento.valor = Math.max(
                                          0,
                                          parseFloat((modalUnitPrice - (des + alm + cen)).toFixed(2))
                                        );
                                      }



                                      setCommissionModal((prev) => ({

                                        ...prev,

                                        tempCom: {

                                          ...prev.tempCom,

                                          desglose: newDesglose,

                                        },

                                      }));

                                    }}

                                  />

                                  <span className="absolute right-0 top-1.5 text-[9px] text-slate-300 font-bold">

                                    €

                                  </span>

                                </div>

                              </div>

                              <button

                                onClick={(e) => {

                                  e.preventDefault();

                                  const newDesglose = {

                                    ...commissionModal.tempCom.desglose,

                                    [key]: {

                                      ...data,

                                      comisionable: !data.comisionable,

                                    },

                                  };

                                  setCommissionModal((prev) => ({

                                    ...prev,

                                    tempCom: {

                                      ...prev.tempCom,

                                      desglose: newDesglose,

                                    },

                                  }));

                                }}

                                className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${data.comisionable ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white border-slate-200 text-slate-200 hover:border-slate-300"}`}

                                title="¿Es Comisionable?"

                              >

                                {data.comisionable ? (

                                  <IconCheck size={14} stroke={4} />

                                ) : (

                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>

                                )}

                              </button>

                            </div>

                          ))}

                        </div>

                        {(() => {

                          const sum = Object.values(
                            commissionModal.tempCom.desglose || {},
                          ).reduce((acc, c) => acc + (parseFloat(c.valor) || 0), 0);
                          const diff = Math.abs(sum - modalUnitPrice);

                          if (diff > 0.01) {

                            return (

                              <div className="bg-red-50 text-red-500 p-1.5 rounded text-[8px] font-bold flex items-center gap-1.5 animate-pulse">

                                <IconAlertTriangle size={10} />

                                <span>

                                  LA SUMA ({sum.toFixed(2)}€) NO COINCIDE CON

                                  EL PRECIO UNITARIO ({modalUnitPrice.toFixed(2)}€)

                                </span>

                              </div>

                            );
                          }
                          return null;
                        })()}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[8px] font-black text-slate-400 uppercase mb-0.5 ml-1">
                          Base Comisión Unitaria (€)
                        </label>
                        <div className="relative">
                          <input

                            type="number"

                            onKeyDown={handleDotAsComma}

                            className="w-full h-8 bg-emerald-50 border border-emerald-100 rounded-lg px-2 text-[11px] font-black text-emerald-700 outline-none"

                            value={commissionModal.tempCom.base_unitaria}

                            onChange={(e) =>

                              setCommissionModal((prev) => ({

                                ...prev,

                                tempCom: {

                                  ...prev.tempCom,

                                  base_unitaria:

                                    parseFloat(e.target.value) || 0,

                                },

                              }))

                            }

                          />

                          <span className="absolute right-2 top-2 text-[9px] text-emerald-300 font-bold">

                            €

                          </span>

                        </div>

                      </div>

                    )}



                    <div className="bg-[#0f172a] mx-4 my-2 px-4 py-4 rounded-2xl text-white shadow-xl shadow-slate-200 relative overflow-hidden group">

                      {/* decorative background element */}

                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-blue-500/20 transition-all"></div>



                      <div className="grid grid-cols-2 gap-4 relative z-10">

                        <div className="border-r border-white/10 pr-2">

                          <span className="block text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1">

                            Base Comisionable

                          </span>

                          <div className="flex items-baseline gap-1">

                            <span className="text-lg font-black text-white tracking-tight">

                              {(() => {

                                const base =

                                  commissionModal.tempCom.modo === "auto"

                                    ? Object.values(

                                      commissionModal.tempCom.desglose ||

                                      {},

                                    ).reduce(

                                      (acc, c) =>

                                        acc +

                                        (c.comisionable ? c.valor : 0),

                                      0,

                                    )

                                    : commissionModal.tempCom.base_unitaria ||

                                    0;

                                return base.toLocaleString("es-ES", {

                                  minimumFractionDigits: 2,

                                });

                              })()}

                            </span>

                            <span className="text-[10px] font-bold text-slate-500">

                              €/u

                            </span>

                          </div>

                        </div>

                        <div>

                          <span className="block text-[8px] text-emerald-400/80 font-black uppercase tracking-widest mb-1">

                            Comisión Unidad

                          </span>

                          <div className="flex items-baseline gap-1">

                            <span className="text-lg font-black text-emerald-400 tracking-tight">

                              {(() => {

                                const base =

                                  commissionModal.tempCom.modo === "auto"

                                    ? Object.values(

                                      commissionModal.tempCom.desglose ||

                                      {},

                                    ).reduce(

                                      (acc, c) =>

                                        acc +

                                        (c.comisionable ? c.valor : 0),

                                      0,

                                    )

                                    : commissionModal.tempCom.base_unitaria ||

                                    0;

                                return (

                                  (base *

                                    (commissionModal.tempCom.porcentaje ||

                                      0)) /

                                  100

                                ).toLocaleString("es-ES", {

                                  minimumFractionDigits: 2,

                                });

                              })()}

                            </span>

                            <span className="text-[10px] font-bold text-emerald-600/60">

                              €

                            </span>

                          </div>

                        </div>

                      </div>



                      <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center relative z-10">

                        <div className="flex flex-col">

                          <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">

                            Importe Total Línea

                          </span>

                          <p className="text-[8px] font-bold text-slate-600">

                            (Comisión × Pax × Noches)

                          </p>

                        </div>

                        <div className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 group-hover:border-emerald-500/30 transition-all">

                          <span className="text-lg font-black text-white tabular-nums tracking-tighter">

                            {
(() => {
const base =
                                commissionModal.tempCom.modo === "auto"
                                  ? Object.values(
                                    commissionModal.tempCom.desglose || {},
                                  ).reduce(
                                    (acc, c) =>
                                      acc + (c.comisionable ? c.valor : 0),
                                    0,
                                  )
                                  : commissionModal.tempCom.base_unitaria ||
                                  0;
                              return (
                                ((base *
                                  (commissionModal.tempCom.porcentaje || 0)) /
                                  100) *
                                (parseInt(activeModalItem.qty) || 1) *
                                (parseInt(activeModalItem.nights) || 1)
                              ).toLocaleString("es-ES", {
                                minimumFractionDigits: 2,
                              });
})()}{" "}

                            <span className="text-xs font-normal opacity-40 ml-0.5">

                              €

                            </span>

                          </span>

                        </div>

                      </div>

                    </div>

                  </div>



                  <div className="p-4 bg-white border-t flex gap-3">

                    <button

                      onClick={() =>

                        setCommissionModal({ isOpen: false, item: null, itemIdx: null, itemIds: null, tempCom: null })

                      }

                      className="flex-1 h-11 rounded-xl text-[10px] font-black text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all uppercase tracking-widest border border-transparent hover:border-slate-200"

                    >

                      Cancelar

                    </button>

                    <button

                      onClick={() => {
                        const com = { ...commissionModal.tempCom };
                        const activeItem = activeModalItem;

                        if (com.modo === "auto") {
                          com.base_unitaria = Object.values(
                            com.desglose || {},
                          ).reduce(
                            (acc, c) => acc + (c.comisionable ? c.valor : 0),
                            0,
                          );
                        }

                        com.comision_unitaria = Math.round((((com.base_unitaria * com.porcentaje) / 100) + 1e-9) * 100) / 100;
                        com.total_comision = Math.round((com.comision_unitaria * (parseInt(activeItem.qty) || 1) * (parseInt(activeItem.nights) || 1) + 1e-9) * 100) / 100;

                        const newRL = parseRoomingListSafe(selectedGroupFicha.records[0]?.["RoomingList_JSON"], "selectedGroupFicha");

                        const idSet = new Set(commissionModal.itemIds || (activeItem.id ? [activeItem.id] : []));
                        if (activeItem.originalMultiNightId) {
                          idSet.add(activeItem.originalMultiNightId);
                        }

                        newRL.forEach((rlItem) => {
                          if (idSet.has(rlItem.id)) {
                            const itemCom = { ...com };
                            itemCom.total_comision = Math.round((com.comision_unitaria * (parseInt(rlItem.qty) || 1) * (parseInt(rlItem.nights) || 1) + 1e-9) * 100) / 100;
                            rlItem.comision = itemCom;
                          }
                        });

                        updateGroupMetadata(
                          selectedGroupFicha.id,
                          "RoomingList_JSON",
                          JSON.stringify(newRL),
                        );

                        setCommissionModal({
                          isOpen: false,
                          item: null,
                          itemIdx: null,
                          itemIds: null,
                          tempCom: null,
                        });
                      }}

                      className="flex-[2] h-11 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl text-[10px] text-white font-black shadow-lg shadow-blue-600/20 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2"

                    >

                      <IconSave size={16} />

                      <span>Aplicar Comisión</span>

                    </button>

                  </div>

                </div>

              </div>
            );
          })()}

            {/* Modal Añadir Grupo - ENFOQUE AI EMAIL PARSER */}

            {showAddGroupModal && (

              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-fade-in">

                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">

                  <div className="bg-[#0f172a] p-6 text-white flex justify-between items-center">

                    <div className="flex items-center gap-4">

                      <div className="bg-emerald-500/20 p-2 rounded-2xl border border-emerald-500/30">

                        <IconSparkles

                          size={24}

                          className="text-emerald-400"

                        />

                      </div>

                      <div>

                        <h3 className="text-xl font-black uppercase tracking-widest">

                          Nuevo Presupuesto / Grupo

                        </h3>

                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">

                          Registro inteligente mediante IA o Manual

                        </p>

                      </div>

                    </div>

                    <button

                      onClick={() => setShowAddGroupModal(false)}

                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"

                    >

                      <IconX size={24} />

                    </button>

                  </div>



                  <div className="p-8">

                    <div className="flex gap-8 mb-8">

                      <div className="flex-1 space-y-4">

                        <div className="flex items-center gap-3 mb-2">

                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">

                            <IconMail size={16} />

                          </div>

                          <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">

                            Importar desde Email

                          </h4>

                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed">

                          Pega el contenido del email de solicitud. Nuestra IA

                          extraerá automáticamente fechas, pax y detalles del

                          grupo.

                        </p>

                        <textarea

                          className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-inner"

                          placeholder="Pega aquí el texto del email..."

                          value={aiEmailContent}

                          onChange={(e) => setAiEmailContent(e.target.value)}

                        ></textarea>

                        <button

                          onClick={handleAiGroupParse}

                          disabled={isParsingEmail || !aiEmailContent.trim()}

                          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${isParsingEmail || !aiEmailContent.trim() ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98]"}`}

                        >

                          {isParsingEmail ? (

                            <div className="nexus-spinner !w-4 !h-4"></div>

                          ) : (

                            <IconBrain size={18} />

                          )}

                          {isParsingEmail

                            ? "Procesando con IA..."

                            : "Crear Grupo con IA"}

                        </button>

                      </div>



                      <div className="w-[1px] bg-slate-100 hidden md:block"></div>



                      <div className="flex-1 hidden md:block">

                        <div className="flex items-center gap-3 mb-6">

                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">

                            <IconPlus size={16} />

                          </div>

                          <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">

                            Creación Manual

                          </h4>

                        </div>

                        <div className="space-y-4">

                          <button

                            onClick={() => {

                              addNewRow();

                              setShowAddGroupModal(false);

                            }}

                            className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all group"

                          >

                            <IconPlus

                              size={32}

                              className="group-hover:scale-110 transition-transform"

                            />

                            <span className="text-[10px] font-black uppercase tracking-widest">

                              Insertar Fila Vacía

                            </span>

                          </button>

                          <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-tighter">

                            Útil para registros rápidos y edición directa en

                            tabla

                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            )}



            {/* Modal de Datos de Cliente / Facturación */}

            {showClientData && tempClientData && (

              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">

                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">

                  <div className="bg-[#0f172a] p-6 text-white flex justify-between items-center shrink-0">

                    <div className="flex items-center gap-4">

                      <div className="bg-blue-500/20 p-2 rounded-2xl border border-blue-500/30">

                        <IconUsers size={24} className="text-blue-400" />

                      </div>

                      <div>

                        <h3 className="text-xl font-black uppercase tracking-widest leading-none">

                          Ficha Completa de Empresa

                        </h3>

                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 tracking-tighter">

                          Gestión de datos fiscales y contacto comercial

                        </p>

                      </div>

                    </div>

                    <button

                      onClick={() => setShowClientData(false)}

                      className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"

                    >

                      <IconX size={24} />

                    </button>

                  </div>



                  <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">

                    {/* Sección 1: Datos Identificativos */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                      <div className="space-y-4">

                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">

                          Datos Identificativos

                        </h4>

                        <div>

                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                            Razón Social / Nombre Empresa

                          </label>

                          <input

                            type="text"

                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"

                            value={tempClientData.Fiscal_RazonSocial}

                            onChange={(e) =>

                              setTempClientData({

                                ...tempClientData,

                                Fiscal_RazonSocial: e.target.value,

                              })

                            }

                            placeholder="Nombre fiscal de la empresa"

                          />

                        </div>

                        <div>

                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                            NIF / CIF / VAT

                          </label>

                          <input

                            type="text"

                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"

                            value={tempClientData.Fiscal_CIF}

                            onChange={(e) =>

                              setTempClientData({

                                ...tempClientData,

                                Fiscal_CIF: e.target.value,

                              })

                            }

                            placeholder="Identificador fiscal"

                          />

                        </div>

                      </div>



                      <div className="space-y-4">

                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">

                          Contacto Directo

                        </h4>

                        <div>

                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                            Persona de Contacto

                          </label>

                          <input

                            type="text"

                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"

                            value={tempClientData.Persona_Contacto}

                            onChange={(e) =>

                              setTempClientData({

                                ...tempClientData,

                                Persona_Contacto: e.target.value,

                              })

                            }

                            placeholder="Nombre del responsable"

                          />

                        </div>

                        <div className="grid grid-cols-2 gap-3">

                          <div>

                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                              Email Principal

                            </label>

                            <input

                              type="email"

                              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"

                              value={tempClientData.Email}

                              onChange={(e) =>

                                setTempClientData({

                                  ...tempClientData,

                                  Email: e.target.value,

                                })

                              }

                              placeholder="ejemplo@email.com"

                            />

                          </div>

                          <div>

                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                              Teléfono

                            </label>

                            <input

                              type="text"

                              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"

                              value={tempClientData.Telefono}

                              onChange={(e) =>

                                setTempClientData({

                                  ...tempClientData,

                                  Telefono: e.target.value,

                                })

                              }

                              placeholder="+34 ..."

                            />

                          </div>

                        </div>

                      </div>

                    </div>



                    {/* Sección 2: Dirección y Localización */}

                    <div className="space-y-4">

                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">

                        Dirección Fiscal

                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div className="md:col-span-2">

                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                            Calle / Número

                          </label>

                          <input

                            type="text"

                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"

                            value={tempClientData.Fiscal_Direccion}

                            onChange={(e) =>

                              setTempClientData({

                                ...tempClientData,

                                Fiscal_Direccion: e.target.value,

                              })

                            }

                            placeholder="Dirección completa"

                          />

                        </div>

                        <div>

                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                            C.P.

                          </label>

                          <input

                            type="text"

                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"

                            value={tempClientData.Fiscal_CP}

                            onChange={(e) =>

                              setTempClientData({

                                ...tempClientData,

                                Fiscal_CP: e.target.value,

                              })

                            }

                            placeholder="Código Postal"

                          />

                        </div>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        <div>

                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                            Población

                          </label>

                          <input

                            type="text"

                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"

                            value={tempClientData.Fiscal_Poblacion}

                            onChange={(e) =>

                              setTempClientData({

                                ...tempClientData,

                                Fiscal_Poblacion: e.target.value,

                              })

                            }

                            placeholder="Ciudad"

                          />

                        </div>

                        <div>

                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                            Provincia

                          </label>

                          <input

                            type="text"

                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"

                            value={tempClientData.Fiscal_Provincia}

                            onChange={(e) =>

                              setTempClientData({

                                ...tempClientData,

                                Fiscal_Provincia: e.target.value,

                              })

                            }

                            placeholder="Provincia"

                          />

                        </div>

                        <div>

                          <label className="text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1">

                            País

                          </label>

                          <input

                            type="text"

                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"

                            value={tempClientData.Fiscal_Pais}

                            onChange={(e) =>

                              setTempClientData({

                                ...tempClientData,

                                Fiscal_Pais: e.target.value,

                              })

                            }

                            placeholder="España"

                          />

                        </div>

                      </div>

                    </div>



                    {/* Sección 3: Observaciones */}

                    <div className="space-y-4">

                      <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">

                        Notas y Observaciones de Empresa

                      </h4>

                      <div>

                        <textarea

                          className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all resize-none shadow-inner"

                          value={tempClientData.Observaciones}

                          onChange={(e) =>

                            setTempClientData({

                              ...tempClientData,

                              Observaciones: e.target.value,

                            })

                          }

                          placeholder="Añade aquí acuerdos permanentes con esta empresa, particularidades de facturación, etc..."

                        ></textarea>

                      </div>

                    </div>

                  </div>



                  <div className="p-6 bg-slate-50 border-t flex justify-end gap-3 shrink-0">

                    <button

                      onClick={() => setShowClientData(false)}

                      className="px-6 py-3 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all tracking-[0.2em]"

                    >

                      Cancelar

                    </button>

                    <button

                      onClick={async () => {

                        await updateGroupMetadata(

                          selectedGroupFicha.id,

                          tempClientData,

                        );

                        setShowClientData(false);

                        alert(

                          "✅ Datos de empresa actualizados correctamente.",

                        );

                      }}

                      className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all tracking-[0.2em] flex items-center gap-3"

                    >

                      <IconSave size={18} />

                      Guardar Cambios

                    </button>

                  </div>

                </div>

              </div>

            )}

            {/* Modal de Revisión IA - Confirmación de Datos Parseados */}

            {showReviewModal && aiReviewData && (

              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">

                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up border border-slate-200">

                  {/* Header */}

                  <div className="bg-[#0f172a] p-6 text-white flex justify-between items-center group">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">

                        <IconBrain

                          size={24}

                          className="text-indigo-400 group-hover:scale-110 transition-transform"

                        />

                      </div>

                      <div>

                        <h3 className="text-lg font-black uppercase tracking-widest text-white leading-none">

                          Revisión IA

                        </h3>

                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">

                          Confirma los datos extraídos del email

                        </p>

                      </div>

                    </div>

                    <button

                      onClick={() => setShowReviewModal(false)}

                      className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 text-slate-400 transition-all"

                    >

                      <IconX size={24} />

                    </button>

                  </div>



                  {/* Content */}

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar">

                    {/* Info Card Grid */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-200 group">

                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">

                          Nombre del Grupo

                        </label>

                        <input

                          type="text"

                          value={aiReviewData["Nombre del Grupo"] || ""}

                          onChange={(e) =>

                            setAiReviewData({

                              ...aiReviewData,

                              "Nombre del Grupo": e.target.value,

                            })

                          }

                          className="w-full font-black text-slate-800 outline-none p-1 rounded hover:bg-slate-50 border-b-2 border-transparent focus:border-indigo-400 transition-all text-sm uppercase"

                        />

                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-200">

                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">

                          Email Contacto

                        </label>

                        <input

                          type="text"

                          value={aiReviewData["Email"] || ""}

                          onChange={(e) =>

                            setAiReviewData({

                              ...aiReviewData,

                              Email: e.target.value,

                            })

                          }

                          className="w-full font-bold text-slate-600 outline-none p-1 rounded hover:bg-slate-50 border-b-2 border-transparent focus:border-indigo-400 transition-all text-sm"

                        />

                      </div>

                      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 shadow-sm flex items-center justify-between">

                        <div>

                          <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">

                            Pax

                          </label>

                          <input

                            type="number"

                            value={

                              aiReviewData["Pax."] ||

                              aiReviewData["Pax"] ||

                              ""

                            }

                            onChange={(e) =>

                              setAiReviewData({

                                ...aiReviewData,

                                Pax: parseInt(e.target.value) || 0,

                                "Pax.": parseInt(e.target.value) || 0,

                              })

                            }

                            className="w-20 bg-transparent font-black text-indigo-700 text-lg outline-none"

                          />

                        </div>

                        <div className="text-right">

                          <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">

                            Tipo Régimen

                          </label>

                          <input

                            type="text"

                            value={aiReviewData["Régimen"] || ""}

                            onChange={(e) =>

                              setAiReviewData({

                                ...aiReviewData,

                                Régimen: e.target.value,

                              })

                            }

                            className="w-32 bg-transparent font-black text-indigo-700 text-right uppercase text-sm outline-none"

                          />

                        </div>

                      </div>

                      <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 shadow-sm flex items-center justify-between gap-4">

                        <div className="flex-1">

                          <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1">

                            Entrada

                          </label>

                          <input

                            type="date"

                            value={aiReviewData["Entrada"] || ""}

                            onChange={(e) =>

                              setAiReviewData({

                                ...aiReviewData,

                                Entrada: e.target.value,

                              })

                            }

                            className="w-full bg-transparent font-black text-emerald-700 text-sm outline-none"

                          />

                        </div>

                        <div className="flex-1 text-right">

                          <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1 text-right">

                            Salida

                          </label>

                          <input

                            type="date"

                            value={aiReviewData["Salida"] || ""}

                            onChange={(e) =>

                              setAiReviewData({

                                ...aiReviewData,

                                Salida: e.target.value,

                              })

                            }

                            className="w-full bg-transparent font-black text-emerald-700 text-sm outline-none text-right"

                          />

                        </div>

                      </div>

                    </div>



                    {/* Programa Preview */}

                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">

                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">

                        Programa / Descripción del Grupo

                      </label>

                      <textarea

                        value={

                          aiReviewData["Observaciones"] ||

                          aiReviewData["Com_Notas"] ||

                          ""

                        }

                        onChange={(e) =>

                          setAiReviewData({

                            ...aiReviewData,

                            Observaciones: e.target.value,

                          })

                        }

                        className="w-full h-32 bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-medium text-slate-600 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all resize-none shadow-inner"

                        placeholder="La IA no ha podido extraer un programa claro..."

                      ></textarea>

                    </div>

                  </div>



                  {/* Footer */}

                  <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-4 shrink-0">

                    <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase">

                      <IconAlertTriangle size={14} />

                      <span>Verifica fechas y pax antes de guardar</span>

                    </div>

                    <div className="flex gap-3">

                      <button

                        onClick={() => setShowReviewModal(false)}

                        className="px-6 py-3 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all tracking-widest"

                      >

                        Descartar

                      </button>

                      <button

                        onClick={saveReviewData}

                        className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all tracking-[0.2em] flex items-center gap-3"

                      >

                        <IconCheck size={18} stroke={3} />

                        Confirmar y Crear Grupo

                      </button>

                    </div>

                  </div>

                </div>

              </div>

            )}

            {/* Modal Selección de Hotel para Importación */}

            {isHotelModalOpen && (

              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">

                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in text-center border border-white/20">

                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">

                    <IconUpload size={32} />

                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-2">

                    ¿A qué hotel pertenecen estos datos?

                  </h3>

                  <p className="text-sm text-slate-500 mb-8">

                    Selecciona el hotel para asignar correctamente las

                    reservas importadas.

                  </p>



                  <div className="grid grid-cols-1 gap-4">

                    <button

                      onClick={() =>

                        confirmHotelAndProcess("SERCOTEL GUADIANA")

                      }

                      className="py-4 bg-slate-50 border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 rounded-2xl font-bold text-slate-700 transition-all flex flex-col items-center gap-1 group"

                    >

                      <span className="text-emerald-600">

                        SERCOTEL GUADIANA

                      </span>

                      <span className="text-[10px] text-slate-400 font-normal uppercase tracking-widest">

                        Hotel Principal

                      </span>

                    </button>

                    <button

                      onClick={() =>

                        confirmHotelAndProcess("Cumbria Spa&Hotel")

                      }

                      className="py-4 bg-slate-50 border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 rounded-2xl font-bold text-slate-700 transition-all flex flex-col items-center gap-1 group"

                    >

                      <span className="text-blue-600">

                        Cumbria Spa&Hotel

                      </span>

                      <span className="text-[10px] text-slate-400 font-normal uppercase tracking-widest">

                        Hotel Asociado

                      </span>

                    </button>

                  </div>



                  <button

                    onClick={() => {

                      setIsHotelModalOpen(false);

                      setPendingFile(null);

                    }}

                    className="mt-6 text-slate-400 hover:text-slate-600 text-sm font-bold uppercase tracking-widest"

                  >

                    Cancelar

                  </button>

                </div>

              </div>

            )}

            

            {/* PRINT ONLY LAYOUT CONTAINER */}
            <div className="print-only-container font-sans p-6 text-slate-800 bg-white">
              <style dangerouslySetInnerHTML={{__html: `
                /* Ocultar siempre en pantalla normal */
                .print-only-container {
                  display: none !important;
                }

                /* ── IMPRESIÓN ──────────────────────────────────────────
                   Técnica visibility: funciona a cualquier profundidad.
                   display:none en un padre bloquea al hijo;
                   visibility:hidden NO, por eso este enfoque es correcto.
                ────────────────────────────────────────────────────────── */
                @media print {
                  /* 1. Ocultar todo el documento */
                  body * {
                    visibility: hidden !important;
                  }

                  /* 2. Mostrar solo el contenedor de impresión y su contenido */
                  .print-only-container,
                  .print-only-container * {
                    visibility: visible !important;
                  }

                  /* 3. Posicionar el contenedor al inicio del documento (NO fixed = no se repite en cada página) */
                  .print-only-container {
                    display: block !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: auto !important;
                    background: #ffffff !important;
                    z-index: 999999 !important;
                    padding: 6mm 10mm !important;
                    margin: 0 !important;
                    box-sizing: border-box !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }

                  /* 4. Configuración de página */
                  @page {
                    size: A4 landscape;
                    margin: 10mm 15mm;
                  }

                  body, html {
                    background: #ffffff !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
              `}} />

              {/* Title & Timestamp */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-wide uppercase">
                    Nexus Groups — Listado de Grupos
                  </h1>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wider">
                    {`${(() => {
                      const parts = [];
                      if (filterStatus && filterStatus !== "all") {
                        const statusLabels = {
                          activos: "Activos",
                          activos_y_desestimados: "Activos y Desestimados",
                          confirmada: "Confirmados",
                          tentativa: "Tentativas",
                          presupuesto: "Presupuestos",
                          desestimada: "Desestimados",
                          pasado: "Pasados"
                        };
                        parts.push("Estado: " + (statusLabels[filterStatus] || filterStatus));
                      } else {
                        parts.push("Estado: Todos");
                      }
                      if (filterDirHotel) {
                        parts.push("Hotel: " + filterDirHotel);
                      } else {
                        parts.push("Hotel: Todos");
                      }
                      if (filterDirCommercial) {
                        parts.push("Comercial: " + (filterDirCommercial === "SIN_ASIGNAR" ? "S/A" : filterDirCommercial));
                      } else {
                        parts.push("Comercial: Todos");
                      }
                      if (searchTerm) {
                        parts.push("Búsqueda: \"" + searchTerm + "\"");
                      }
                      if (startDate || endDate) {
                        const startFormatted = startDate ? formatDate(startDate) : "Inicio";
                        const endFormatted = endDate ? formatDate(endDate) : "Fin";
                        parts.push("Rango: " + startFormatted + " al " + endFormatted);
                      }
                      return "Filtros aplicados: " + parts.join(" | ");
                    })()}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-700">
                    Fecha impresión: {new Date().toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                  <p className="text-[9px] text-slate-500 font-bold mt-0.5">
                    Total Registros: {groupedData.length}
                  </p>
                </div>
              </div>

              {/* Data Table */}
              <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300 font-bold text-slate-700 uppercase">
                    <th className="border border-slate-300 p-2 font-bold whitespace-nowrap">Localizador / ID</th>
                    <th className="border border-slate-300 p-2 font-bold max-w-[200px] truncate">Grupo / Razón Social</th>
                    <th className="border border-slate-300 p-2 font-bold whitespace-nowrap">Hotel</th>
                    <th className="border border-slate-300 p-2 font-bold whitespace-nowrap">Entrada</th>
                    <th className="border border-slate-300 p-2 font-bold whitespace-nowrap">Salida</th>
                    <th className="border border-slate-300 p-2 font-bold whitespace-nowrap">Comercial</th>
                    <th className="border border-slate-300 p-2 font-bold text-center whitespace-nowrap">Hab.</th>
                    <th className="border border-slate-300 p-2 font-bold text-center whitespace-nowrap">Pax</th>
                    <th className="border border-slate-300 p-2 font-bold text-right whitespace-nowrap">Importe</th>
                    <th className="border border-slate-300 p-2 font-bold text-center whitespace-nowrap">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {groupedData.map((group, idx) => {
                    const record = group.records?.[0] || {};
                    const internalSt = record["Com_Estado_Interno"];
                    const externalSt = record["Estado"];
                    const effectiveSt = internalSt || record["Segment."];
                    const st = getStatusProps(effectiveSt, group.arrival, internalSt ? null : externalSt);
                    
                    const grossRev = group.totalRevenue || 0;
                    const commission = group.totalCommission || 0;
                    const netRev = grossRev - commission;
                    const paid = group.totalPaid || 0;
                    const pending = Math.max(0, netRev - paid);

                    return (
                      <tr key={idx} style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                        <td className="border border-slate-200 p-2 font-mono whitespace-nowrap">
                          {group.id || "---"}
                        </td>
                        <td className="border border-slate-200 p-2 max-w-[250px] overflow-hidden truncate">
                          <div className="font-bold text-slate-900 leading-tight">
                            {group.name}
                          </div>
                          {(record["Fiscal_RazonSocial"] || record["Empresa/Agencia"]) && (
                            <div className="text-[8px] text-slate-500 font-medium">
                              {record["Fiscal_RazonSocial"] || record["Empresa/Agencia"]}
                            </div>
                          )}
                        </td>
                        <td className="border border-slate-200 p-2 whitespace-nowrap">
                          {normalizeHotelName(group.hotel || record["Hotel_Asignado"] || record["Hotel"] || "")}
                        </td>
                        <td className="border border-slate-200 p-2 tabular-nums whitespace-nowrap">
                          {formatDate(group.arrival)}
                        </td>
                        <td className="border border-slate-200 p-2 tabular-nums whitespace-nowrap">
                          {formatDate(group.departure)}
                        </td>
                        <td className="border border-slate-200 p-2 whitespace-nowrap">
                          {record["Com_Comercial"] || "S/A"}
                        </td>
                        <td className="border border-slate-200 p-2 text-center tabular-nums whitespace-nowrap">
                          {group.totalRooms}
                        </td>
                        <td className="border border-slate-200 p-2 text-center tabular-nums whitespace-nowrap">
                          {group.totalPax}
                        </td>
                        <td className="border border-slate-200 p-2 text-right tabular-nums whitespace-nowrap">
                          <div className="font-bold">
                            {formatNum(grossRev)}
                          </div>
                          {pending > 0.05 && (
                            <div className="text-[8px] text-rose-600 font-bold">
                              {formatNum(pending, true)} pdte.
                            </div>
                          )}
                        </td>
                        <td className="border border-slate-200 p-2 text-center whitespace-nowrap font-bold">
                          {st.label}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                    <td colSpan="6" className="border border-slate-300 p-2 text-right uppercase tracking-wider font-bold">
                      Totales
                    </td>
                    <td className="border border-slate-300 p-2 text-center tabular-nums font-bold">
                      {groupedData.reduce((acc, g) => acc + (g.totalRooms || 0), 0)}
                    </td>
                    <td className="border border-slate-300 p-2 text-center tabular-nums font-bold">
                      {groupedData.reduce((acc, g) => acc + (g.totalPax || 0), 0)}
                    </td>
                    <td className="border border-slate-300 p-2 text-right tabular-nums font-bold">
                      <div>
                        {formatNum(groupedData.reduce((acc, g) => acc + (g.totalRevenue || 0), 0))}
                      </div>
                      {(() => {
                        const totalPending = groupedData.reduce((acc, g) => {
                          const grossRev = g.totalRevenue || 0;
                          const commission = g.totalCommission || 0;
                          const netRev = grossRev - commission;
                          const paid = g.totalPaid || 0;
                          return acc + Math.max(0, netRev - paid);
                        }, 0);
                        return totalPending > 0.05 ? (
                          <div className="text-[8px] text-rose-600 font-bold">
                            {formatNum(totalPending, true)} pdte.
                          </div>
                        ) : null;
                      })()}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold">
                      {groupedData.length} GRUPOS
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Extra summary card for administrative usage */}
              <div className="mt-6 grid grid-cols-3 gap-4 border border-slate-200 p-4 rounded-xl bg-slate-50/50" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
                    Importe Total Neto Facturable
                  </p>
                  <p className="text-lg font-black text-slate-800 tabular-nums">
                    {formatNum(groupedData.reduce((acc, g) => {
                      const grossRev = g.totalRevenue || 0;
                      const commission = g.totalCommission || 0;
                      return acc + (grossRev - commission);
                    }, 0))} €
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
                    Total Cobrado
                  </p>
                  <p className="text-lg font-black text-emerald-600 tabular-nums">
                    {formatNum(groupedData.reduce((acc, g) => acc + (g.totalPaid || 0), 0))} €
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-0.5">
                    Total Pendiente de Cobro
                  </p>
                  <p className="text-lg font-black text-rose-600 tabular-nums">
                    {formatNum(groupedData.reduce((acc, g) => {
                      const grossRev = g.totalRevenue || 0;
                      const commission = g.totalCommission || 0;
                      const netRev = grossRev - commission;
                      const paid = g.totalPaid || 0;
                      return acc + Math.max(0, netRev - paid);
                    }, 0))} €
                  </p>
                </div>
              </div>
            </div>

            {/* Overlay de Carga y Guardado */}

            {(loading || isSaving) && (

              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 no-print">

                <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl animate-fade-in border border-white/20">

                  <div className="nexus-spinner"></div>

                  <p className="text-sm font-black text-slate-700 uppercase tracking-widest animate-pulse">

                    {(isSaving || isAiLoading) ? "Guardando Cambios..." : "Procesando Archivo..."}

                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

      );

    };



    class ErrorBoundary extends React.Component {

      constructor(props) {

        super(props);

        this.state = { hasError: false, error: null };

      }



      static getDerivedStateFromError(error) {

        return { hasError: true, error };

      }



      componentDidCatch(error, errorInfo) {

        console.error("ErrorBoundary caught an error:", error, errorInfo);

      }



      render() {

        if (this.state.hasError) {

          return (

            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans space-y-4">

              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-sm">

                <svg

                  xmlns="http://www.w3.org/2000/svg"

                  width="32"

                  height="32"

                  viewBox="0 0 24 24"

                  fill="none"

                  stroke="currentColor"

                  strokeWidth="2.5"

                  strokeLinecap="round"

                  strokeLinejoin="round"

                >

                  <circle cx="12" cy="12" r="10" />

                  <line x1="12" y1="8" x2="12" y2="12" />

                  <line x1="12" y1="16" x2="12.01" y2="16" />

                </svg>

              </div>

              <h1 className="text-2xl font-black text-slate-800 tracking-tight">

                ¡Oops! Algo salió mal.

              </h1>

              <p className="text-slate-500 max-w-md text-sm leading-relaxed">

                Ha ocurrido un error inesperado en la interfaz. Hemos

                registrado el problema. Por favor, recarga la página para

                continuar.

              </p>

              <button

                onClick={() => window.location.reload()}

                className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-md"

              >

                Recargar Aplicación

              </button>

              <div className="mt-8 p-4 bg-white/50 border border-slate-200 rounded-lg text-left overflow-auto max-w-2xl w-full">

                <p className="text-xs font-mono text-slate-400 break-all">

                  {this.state.error?.toString()}

                </p>

              </div>

            </div>

          );

        }

        return this.props.children;

      }

    }



    ReactDOM.createRoot(document.getElementById("root")).render(

      <ErrorBoundary>

        <App />

      </ErrorBoundary>,

    );

 
const DebouncedSearchInput = ({ value: parentValue, onChange, placeholder, className }) => {
    const [value, setValue] = React.useState(parentValue);
    
    React.useEffect(() => {
        setValue(parentValue);
    }, [parentValue]);
    
    React.useEffect(() => {
        if (value === parentValue) return;
        const handler = setTimeout(() => {
            onChange(value);
        }, 300);
        return () => clearTimeout(handler);
    }, [value, onChange, parentValue]);

    return (
        <input 
            type="text" 
            placeholder={placeholder} 
            className={className} 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
        />
    );
};

 
