
    const { useState, useEffect, useMemo } = React;

    // --- FIREBASE ---
    const db = window.db;

    // --- CONSTANTES ---
    const ROOM_TYPES = {
      "Sercotel Guadiana": ["DOBLE DE USO INDIVIDUAL", "DOBLE", "DOBLE + SUPLETORIA", "CUÁDRUPLE"],
      "Cumbria Spa&Hotel": ["DOBLE DE USO INDIVIDUAL", "DOBLE", "DOBLE + SUPLETORIA"]
    };

    const BOARD_TYPES = [
      "SA (Solo Alojamiento)",
      "AD (Alojamiento y Desayuno)",
      "MP (Media Pensión)",
      "PC (Pensión Completa)"
    ];

    // Personas por tipo de habitación (auto-cálculo PAX)
    const PAX_PER_ROOM = {
      // Nuevos tipos oficiales
      "DOBLE DE USO INDIVIDUAL": 1,
      "DOBLE": 2,
      "DOBLE + SUPLETORIA": 3,
      "CUÁDRUPLE": 4,
      // Retrocompatibilidad
      "Doble Individual": 1,
      "Doble de Uso Individual": 1,
      "Doble 2 Camas": 2,
      "Doble Matrimonial": 2,
      "Doble": 2,
      "Doble + Supletoria": 3,
      "Triple": 3,
      "Junior Suite": 2,
      "Cuádruple": 4,
    };

    // --- UTILS (cargadas desde js/utils.js) ---
    const generateDates = NexusUtils.generateDates;
    const generateSeriesDates = NexusUtils.generateSeriesDates;
    const formatDate = NexusUtils.formatDate;
    const formatNum = NexusUtils.formatNum;
    const toInputDate = NexusUtils.toInputDate;

    const getBudgetStatusStyle = (status) => {
      const s = (status || "").toUpperCase();
      if (s.includes("CONFIRM")) {
        return {
          select: "bg-emerald-500 text-white border-emerald-600 shadow-emerald-100 hover:bg-emerald-600 focus:ring-emerald-200",
          icon: "fa-check-circle"
        };
      }
      if (s.includes("SEGUIMIENTO")) {
        return {
          select: "bg-orange-500 text-white border-orange-600 shadow-orange-100 hover:bg-orange-600 focus:ring-orange-200",
          icon: "fa-phone-volume"
        };
      }
      if (s.includes("ENVIADO")) {
        return {
          select: "bg-sky-500 text-white border-sky-600 shadow-sky-100 hover:bg-sky-600 focus:ring-sky-200",
          icon: "fa-paper-plane"
        };
      }
      if (s.includes("DESESTIMADO") || s.includes("CANCEL") || s.includes("CADUCADO")) {
        return {
          select: "bg-rose-500 text-white border-rose-600 shadow-rose-100 hover:bg-rose-600 focus:ring-rose-200",
          icon: "fa-times-circle"
        };
      }
      return {
        select: "bg-amber-400 text-amber-950 border-amber-500 shadow-amber-100 hover:bg-amber-500 focus:ring-amber-200",
        icon: "fa-clock"
      };
    };

    const DEFAULT_FORM_DATA = {
      Hotel_Asignado: 'Sercotel Guadiana',
      "Nombre del Grupo": '',
      Com_Nombre_Contacto: '',
      Com_Email_Contacto: '',
      Com_Telefono_Contacto: '',
      Entrada: '',
      Salida: '',
      DateRanges_JSON: [],
      roomCounts: {},
      dailyConfig: {},
      Com_Notas: '',
      Com_Estado_Interno: 'PRESUPUESTO',
      clauses: [],
      clauses_conf: [],
      isRatesOnly: false,
      ratesOnlyGrid: {},
      hiddenGridRows: [],
      hiddenGridCols: [],
      segments: [],           // NUEVO: array de sub-grupos [{id,pax,rooms,roomType,in,out,notes}]
      isMultiSegment: false,   // NUEVO: modo multi-segmento activo
      declaredPax: ''         // NUEVO: Pax declarados por el cliente
    };

    // ── Calcula cupos diarios a partir de los segmentos ─────────────────
    // Regla: segment.in <= date < segment.out (salida NO cuenta como noche)
    const buildDailyCountsFromSegments = (segments) => {
      if (!Array.isArray(segments) || segments.length === 0) return {};

      const validSegments = segments.filter(seg => seg.in && seg.out && seg.in < seg.out);
      if (validSegments.length === 0) return {};

      const allIn = validSegments.map(seg => seg.in).sort();
      const allOut = validSegments.map(seg => seg.out).sort();
      const globalIn = allIn[0];
      const globalOut = allOut[allOut.length - 1];

      const nights = generateDates(globalIn, globalOut);
      const dailyCounts = {};

      nights.forEach(date => {
        const countsByType = {};

        validSegments.forEach(seg => {
          const isActive = seg.in <= date && date < seg.out;
          if (!isActive) return;

          const allocations = Array.isArray(seg.roomAllocations) && seg.roomAllocations.length > 0
            ? seg.roomAllocations
            : [
                {
                  roomType: seg.roomType || "DOBLE DE USO INDIVIDUAL",
                  rooms: Number(seg.rooms || seg.pax || 0)
                }
              ];

          allocations.forEach(allocation => {
            const roomType = (allocation.roomType || "DOBLE DE USO INDIVIDUAL").toUpperCase();
            const rooms = Number(allocation.rooms || 0);
            if (rooms > 0) {
              countsByType[roomType] = (countsByType[roomType] || 0) + rooms;
            }
          });
        });

        dailyCounts[date] = countsByType;
      });

      return dailyCounts;
    };

    // ── Métricas detalladas del modo multi-segmento ─────────────────────
    const buildMultiSegmentMetrics = (segments, declaredPax) => {
      const decPax = Number(declaredPax || 0);
      if (!Array.isArray(segments) || segments.length === 0) {
        return {
          declaredPax: decPax,
          segmentPaxTotal: 0,
          roomNights: 0,
          maxSimultaneousRooms: 0,
          maxSimultaneousPax: 0,
          globalIn: '',
          globalOut: '',
          segmentCount: 0,
          travelerGroupCount: 0
        };
      }

      const validSegments = segments.filter(seg => seg.in && seg.out && seg.in < seg.out);
      if (validSegments.length === 0) {
        return {
          declaredPax: decPax,
          segmentPaxTotal: 0,
          roomNights: 0,
          maxSimultaneousRooms: 0,
          maxSimultaneousPax: 0,
          globalIn: '',
          globalOut: '',
          segmentCount: 0,
          travelerGroupCount: 0
        };
      }

      const allIn = validSegments.map(seg => seg.in).sort();
      const allOut = validSegments.map(seg => seg.out).sort();
      const globalIn = allIn[0];
      const globalOut = allOut[allOut.length - 1];

      const segmentPaxTotal = validSegments.reduce((sum, seg) => sum + Number(seg.pax || 0), 0);

      let roomNights = 0;
      validSegments.forEach(seg => {
        const nights = generateDates(seg.in, seg.out).length;
        const allocations = Array.isArray(seg.roomAllocations) && seg.roomAllocations.length > 0
          ? seg.roomAllocations
          : [
              {
                roomType: seg.roomType || "DOBLE DE USO INDIVIDUAL",
                rooms: Number(seg.rooms || seg.pax || 0)
              }
            ];
        const totalRooms = allocations.reduce((sum, alloc) => sum + Number(alloc.rooms || 0), 0);
        roomNights += totalRooms * nights;
      });

      const globalNights = generateDates(globalIn, globalOut);
      let maxSimultaneousRooms = 0;
      let maxSimultaneousPax = 0;

      globalNights.forEach(date => {
        let dayRooms = 0;
        let dayPax = 0;
        validSegments.forEach(seg => {
          if (seg.in && seg.out && seg.in <= date && date < seg.out) {
            dayPax += Number(seg.pax || 0);
            const allocations = Array.isArray(seg.roomAllocations) && seg.roomAllocations.length > 0
              ? seg.roomAllocations
              : [
                  {
                    roomType: seg.roomType || "DOBLE DE USO INDIVIDUAL",
                    rooms: Number(seg.rooms || seg.pax || 0)
                  }
                ];
            dayRooms += allocations.reduce((sum, alloc) => sum + Number(alloc.rooms || 0), 0);
          }
        });
        if (dayRooms > maxSimultaneousRooms) maxSimultaneousRooms = dayRooms;
        if (dayPax > maxSimultaneousPax) maxSimultaneousPax = dayPax;
      });

      const uniqueGroups = new Set();
      let emptyIdCount = 0;
      validSegments.forEach(seg => {
        const tgId = String(seg.travelerGroupId || '').trim();
        if (tgId) {
          uniqueGroups.add(tgId);
        } else {
          emptyIdCount++;
        }
      });
      const travelerGroupCount = uniqueGroups.size + emptyIdCount;

      return {
        declaredPax: decPax,
        segmentPaxTotal,
        roomNights,
        maxSimultaneousRooms,
        maxSimultaneousPax,
        globalIn,
        globalOut,
        segmentCount: validSegments.length,
        travelerGroupCount
      };
    };

    // ── Agrupador de periodos de ocupación ──────────────────────────────
    const getOccupancyPeriods = (segments) => {
      const segmentCountsByDate = buildDailyCountsFromSegments(segments);
      const dates = Object.keys(segmentCountsByDate).sort();
      if (dates.length === 0) return [];

      const periods = [];
      let currentPeriod = null;

      dates.forEach(date => {
        const counts = segmentCountsByDate[date] || {};
        const roomCountStr = Object.entries(counts)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([rt, cnt]) => `${cnt} ${rt}`)
          .join(', ') || '0 habitaciones';

        const totalRooms = Object.values(counts).reduce((s, c) => s + c, 0);
        const displayText = `${totalRooms} hab. (${roomCountStr})`;

        if (!currentPeriod) {
          currentPeriod = {
            start: date,
            end: date,
            displayText,
            totalRooms
          };
        } else if (currentPeriod.displayText === displayText) {
          currentPeriod.end = date;
        } else {
          periods.push(currentPeriod);
          currentPeriod = {
            start: date,
            end: date,
            displayText,
            totalRooms
          };
        }
      });

      if (currentPeriod) {
        periods.push(currentPeriod);
      }

      return periods.map(p => {
        const d1 = p.start;
        const d2 = p.end;
        const checkoutDateObj = new Date(d2);
        checkoutDateObj.setDate(checkoutDateObj.getDate() + 1);
        const checkoutStr = checkoutDateObj.toISOString().split('T')[0];

        return {
          range: `${formatDate(d1)} al ${formatDate(checkoutStr)}`,
          text: p.text || p.displayText,
          totalRooms: p.totalRooms
        };
      });
    };

    // ── Métricas resumen de segmentos (retrocompatibilidad) ──────────────
    const getSegmentStats = (segments, declaredPax = '') => {
      const metrics = buildMultiSegmentMetrics(segments, declaredPax);
      return {
        totalPax: metrics.segmentPaxTotal,
        roomNights: metrics.roomNights,
        maxSimultaneous: metrics.maxSimultaneousRooms,
        globalIn: metrics.globalIn,
        globalOut: metrics.globalOut,
        nights: metrics.globalIn && metrics.globalOut ? generateDates(metrics.globalIn, metrics.globalOut).length : 0
      };
    };

    const ROOM_MIGRATION_MAP = {
      "doble individual": "DOBLE DE USO INDIVIDUAL",
      "doble de uso individual": "DOBLE DE USO INDIVIDUAL",
      "doble 2 camas": "DOBLE",
      "doble matrimonial": "DOBLE",
      "doble": "DOBLE",
      "doble + supletoria": "DOBLE + SUPLETORIA",
      "triple": "DOBLE + SUPLETORIA",
      "junior suite": "DOBLE",
      "cuádruple": "CUÁDRUPLE"
    };

    const BUDGET_DEFAULT_CLAUSES = [
      { title: "Cupo y Disponibilidad", body: "La presente oferta es válida por 48 horas. Dado que se requiere el bloqueo total de instalaciones, la disponibilidad no se garantiza hasta el primer depósito." },
      { title: "Confirmación y Depósito", body: "Bloqueo confirmado al recibir el 30% del total ({DEP_30}). El 70% restante deberá liquidarse 7 días antes de la entrada." },
      { title: "Política de Cancelación", body: "Al ser un evento de carácter exclusivo con bloqueo de inventario, todos los depósitos entregados tienen carácter de NO REEMBOLSABLES." },
      { title: "Rooming List", body: "La relación detallada de ocupantes deberá entregarse 5 días hábiles antes de la llegada del primer pasajero." }
    ];

    const CONF_DEFAULT_CLAUSES = [
      { title: "Confirmación y Depósito", body: "Para garantizar la reserva definitiva, se requiere un primer depósito del 30% ({DEP_30}) en concepto de garantía. La reserva no se considerará confirmada hasta la recepción del mismo." },
      { title: "Calendario de Pagos y Release", body: "Se establece un release de 30 días previos a la entrada ({RELEASE_30}), fecha en la cual el hotel deberá haber recibido el 50% del total ({DEP_50}). El pago final del 100% ({DEP_100}) deberá estar liquidado 7 días antes de la llegada ({RELEASE_7})." },
      { title: "Reducciones y Cancelaciones", body: "Se permite una reducción de hasta el 10% del número de habitaciones contratadas sin gastos hasta 15 días antes de la llegada ({RELEASE_15}). Cancelaciones totales posteriores a esta fecha incurrirán en un 100% de gastos." },
      { title: "Rooming List y Régimen", body: "La lista definitiva de ocupantes (Rooming List) deberá ser enviada antes del {RELEASE_7}. Cualquier cambio posterior queda sujeto a disponibilidad." }
    ];

    const calculateDefaultCommission = (price, regime, qty, nights, type = "") => {
      return 0;
    };

    const getRoomDisplayName = (roomName) => {
      if (!roomName) return "";
      const r = roomName.toUpperCase().trim();
      if (r === "DOBLE DE USO INDIVIDUAL" || r === "DOBLE INDIVIDUAL" || r === "DUI") return "Doble (DUI)";
      if (r === "DOBLE + SUPLETORIA" || r === "DOBLE MAS SUPLETORIA") return "Doble + Supl.";
      if (r === "CUÁDRUPLE" || r === "CUADRUPLE") return "Cuádruple";
      if (r === "DOBLE") return "Doble";
      return roomName.charAt(0).toUpperCase() + roomName.slice(1).toLowerCase();
    };

    const getBoardDisplayName = (boardName) => {
      if (!boardName) return "";
      const b = boardName.toUpperCase().trim();
      if (b.includes("SOLO ALOJAMIENTO") || b.startsWith("SA")) return "SA";
      if (b.includes("ALOJAMIENTO Y DESAYUNO") || b.startsWith("AD")) return "AD";
      if (b.includes("MEDIA PENSIÓN") || b.includes("MEDIA PENSION") || b.startsWith("MP")) return "MP";
      if (b.includes("PENSIÓN COMPLETA") || b.includes("PENSION COMPLETA") || b.startsWith("PC")) return "PC";
      const match = boardName.match(/^([A-Z]{2})/);
      if (match) return match[1];
      return boardName;
    };

    const buildRoomingList = (group, existingListJson = "[]") => {
      let existingList = [];
      try {
        existingList = JSON.parse(existingListJson || "[]");
      } catch (e) {
        existingList = [];
      }

      let dates = [];
      if (group.DateRanges_JSON && Array.isArray(group.DateRanges_JSON) && group.DateRanges_JSON.length > 0) {
        dates = generateSeriesDates(group.DateRanges_JSON);
      } else {
        dates = generateDates(group.Entrada, group.Salida);
      }

      if (!dates || dates.length === 0) return [];

      const hotelName = group.Hotel_Asignado || group.Hotel || "Sercotel Guadiana";
      const newList = [];

      dates.forEach(date => {
        const config = group.dailyConfig?.[date] || {};
        
        Object.entries(group.roomCounts || {}).forEach(([type, globalCount]) => {
          let count = globalCount;
          if (config.counts) {
            const countKey = Object.keys(config.counts).find(k => k.toLowerCase() === type.toLowerCase());
            if (countKey && config.counts[countKey] !== '' && config.counts[countKey] !== undefined) {
              count = Number(config.counts[countKey]);
            }
          }

          if (count > 0) {
            let price = 0;
            let regime = config.board || group["Régimen"] || "AD";
            let gratuities = 0;
            let discount = 0;

            if (config.prices) {
              const pk = Object.keys(config.prices).find(k => k.trim().toLowerCase() === type.trim().toLowerCase());
              price = pk ? parseFloat(config.prices[pk] || 0) : 0;
              
              const gratKey = config.gratuities ? Object.keys(config.gratuities).find(k => k.trim().toLowerCase() === type.trim().toLowerCase()) : null;
              gratuities = gratKey ? parseInt(config.gratuities[gratKey] || 0) : 0;

              const discKey = config.discounts ? Object.keys(config.discounts).find(k => k.trim().toLowerCase() === type.trim().toLowerCase()) : null;
              discount = discKey ? parseFloat(config.discounts[discKey] || 0) : 0;
            } else {
              const tk = Object.keys(config).find(k => k.trim().toLowerCase() === type.trim().toLowerCase());
              if (tk && config[tk]) {
                price = parseFloat(config[tk].price || 0);
                regime = config[tk].board || regime;
                gratuities = parseInt(config[tk].gratuities || 0);
                discount = parseFloat(config[tk].discount || 0);
              }
            }

            const paxPerRoom = PAX_PER_ROOM[type] || 2;
            const payingRooms = Math.max(0, count - gratuities);
            
            const existingPaying = existingList.find(item => 
              !item.isService && 
              item.dateIn === date && 
              item.type === type.toUpperCase() && 
              item.hotel === hotelName
            );

            if (payingRooms > 0) {
              const regimeShort = regime.split(' ')[0];
              newList.push({
                id: existingPaying ? existingPaying.id : (Date.now() + Math.random()),
                hotel: hotelName,
                type: type.toUpperCase(),
                dateIn: date,
                dateOut: date,
                qty: payingRooms,
                regime: regimeShort,
                price: price,
                pax: paxPerRoom,
                nights: 1,
                total: (payingRooms * price * (1 - discount / 100)).toFixed(2),
                isService: false,
                comision: existingPaying && existingPaying.comision ? existingPaying.comision : calculateDefaultCommission(price, regimeShort, payingRooms, 1, type)
              });
            }

            if (gratuities > 0) {
              const regimeShort = regime.split(' ')[0];
              const existingGrat = existingList.find(item => 
                !item.isService && 
                item.dateIn === date && 
                item.type === (type.toUpperCase() + " (GRATUIDAD)") && 
                item.hotel === hotelName
              );

              newList.push({
                id: existingGrat ? existingGrat.id : (Date.now() + Math.random()),
                hotel: hotelName,
                type: type.toUpperCase() + " (GRATUIDAD)",
                dateIn: date,
                dateOut: date,
                qty: gratuities,
                regime: regimeShort,
                price: 0,
                pax: paxPerRoom,
                nights: 1,
                total: "0.00",
                isService: false,
                comision: existingGrat && existingGrat.comision ? existingGrat.comision : calculateDefaultCommission(0, regimeShort, gratuities, 1, type)
              });
            }
          }
        });
      });

      existingList.forEach(item => {
        if (item.isService && !dates.includes(item.dateIn)) {
          newList.push(item);
        }
      });

      return newList;
    };

    const normalizeGroupData = (groupData) => {
      if (!groupData) return null;
      const newData = { ...groupData };
      newData.isRatesOnly = !!groupData.isRatesOnly;
      newData.ratesOnlyGrid = groupData.ratesOnlyGrid || {};
      
      const rawHotel = groupData.Hotel_Asignado || groupData.Hotel || "";
      if (rawHotel.toLowerCase().includes("cumbria")) {
        newData.Hotel_Asignado = "Cumbria Spa&Hotel";
      } else if (rawHotel.toLowerCase().includes("guadiana")) {
        newData.Hotel_Asignado = "Sercotel Guadiana";
      } else {
        newData.Hotel_Asignado = "Sercotel Guadiana";
      }

      const newRoomCounts = {};
      Object.entries(newData.roomCounts || {}).forEach(([oldType, count]) => {
        const normOld = oldType.toLowerCase();
        const newType = ROOM_MIGRATION_MAP[normOld] || oldType.toUpperCase();
        newRoomCounts[newType] = (newRoomCounts[newType] || 0) + Number(count);
      });
      newData.roomCounts = newRoomCounts;

      if (newData.dailyConfig) {
        newData.dailyConfig = { ...newData.dailyConfig };
        Object.entries(newData.dailyConfig).forEach(([date, dayConf]) => {
          const newDayConf = {
            board: dayConf.board || "AD (Alojamiento y Desayuno)",
            prices: dayConf.prices ? { ...dayConf.prices } : {},
            counts: dayConf.counts ? { ...dayConf.counts } : {},
            gratuities: dayConf.gratuities ? { ...dayConf.gratuities } : {},
            discounts: dayConf.discounts ? { ...dayConf.discounts } : {}
          };

          Object.entries(dayConf).forEach(([key, val]) => {
            if (key !== 'board' && key !== 'prices' && key !== 'counts' && key !== 'gratuities' && key !== 'discounts') {
              const normOld = key.toLowerCase();
              const newType = ROOM_MIGRATION_MAP[normOld] || key.toUpperCase();
              if (val && typeof val === 'object') {
                if (val.price !== undefined && newDayConf.prices[newType] === undefined) {
                  newDayConf.prices[newType] = val.price;
                }
                if (val.count !== undefined && newDayConf.counts[newType] === undefined) {
                  newDayConf.counts[newType] = val.count;
                } else if (val.qty !== undefined && newDayConf.counts[newType] === undefined) {
                  newDayConf.counts[newType] = val.qty;
                }
                if (val.gratuities !== undefined && newDayConf.gratuities[newType] === undefined) {
                  newDayConf.gratuities[newType] = val.gratuities;
                }
                if (val.discount !== undefined && newDayConf.discounts[newType] === undefined) {
                  newDayConf.discounts[newType] = val.discount;
                }
              }
            }
          });

          if (newDayConf.prices) {
            const newPrices = {};
            Object.entries(newDayConf.prices).forEach(([oldType, price]) => {
              const normOld = oldType.toLowerCase();
              const newType = ROOM_MIGRATION_MAP[normOld] || oldType.toUpperCase();
              newPrices[newType] = price;
            });
            newDayConf.prices = newPrices;
          }
          if (newDayConf.counts) {
            const newCounts = {};
            Object.entries(newDayConf.counts).forEach(([oldType, cnt]) => {
              const normOld = oldType.toLowerCase();
              const newType = ROOM_MIGRATION_MAP[normOld] || oldType.toUpperCase();
              newCounts[newType] = cnt;
            });
            newDayConf.counts = newCounts;
          }
          if (newDayConf.gratuities) {
            const newGratuities = {};
            Object.entries(newDayConf.gratuities).forEach(([oldType, grat]) => {
              const normOld = oldType.toLowerCase();
              const newType = ROOM_MIGRATION_MAP[normOld] || oldType.toUpperCase();
              newGratuities[newType] = grat;
            });
            newDayConf.gratuities = newGratuities;
          }
          if (newDayConf.discounts) {
            const newDiscounts = {};
            Object.entries(newDayConf.discounts).forEach(([oldType, disc]) => {
              const normOld = oldType.toLowerCase();
              const newType = ROOM_MIGRATION_MAP[normOld] || oldType.toUpperCase();
              newDiscounts[newType] = disc;
            });
            newDayConf.discounts = newDiscounts;
          }

          newData.dailyConfig[date] = newDayConf;
        });
      }
      newData.DateRanges_JSON = Array.isArray(groupData.DateRanges_JSON) ? groupData.DateRanges_JSON : [];
      newData.tracking = Array.isArray(groupData.tracking) ? groupData.tracking : [];
      // NUEVO: preservar segmentos y modo multi-segmento
      newData.segments = Array.isArray(groupData.segments) ? groupData.segments : [];
      newData.isMultiSegment = !!groupData.isMultiSegment;

      if (newData.isMultiSegment && newData.segments.length > 0) {
        const stats = getSegmentStats(newData.segments);
        newData.Entrada = stats.globalIn;
        newData.Salida = stats.globalOut;
        newData["Pax."] = stats.totalPax;

        const segmentCountsByDate = buildDailyCountsFromSegments(newData.segments);
        const stayDates = generateDates(stats.globalIn, stats.globalOut);
        
        const maxByType = {};
        Object.values(segmentCountsByDate).forEach(countsByType => {
          Object.entries(countsByType).forEach(([rt, cnt]) => {
            if (cnt > (maxByType[rt] || 0)) {
              maxByType[rt] = cnt;
            }
          });
        });
        newData.roomCounts = maxByType;

        newData.dailyConfig = newData.dailyConfig ? { ...newData.dailyConfig } : {};
        stayDates.forEach(date => {
          if (!newData.dailyConfig[date]) {
            newData.dailyConfig[date] = {
              board: newData["Régimen"] || "AD (Alojamiento y Desayuno)",
              prices: {},
              counts: {},
              gratuities: {},
              discounts: {}
            };
          } else {
            newData.dailyConfig[date] = {
              ...newData.dailyConfig[date],
              prices: newData.dailyConfig[date].prices ? { ...newData.dailyConfig[date].prices } : {},
              counts: {},
              gratuities: newData.dailyConfig[date].gratuities ? { ...newData.dailyConfig[date].gratuities } : {},
              discounts: newData.dailyConfig[date].discounts ? { ...newData.dailyConfig[date].discounts } : {}
            };
          }
          // Initialize all known room types to 0 for this date to avoid falling back to peak in calculations
          Object.keys(maxByType).forEach(rt => {
            newData.dailyConfig[date].counts[rt] = 0;
          });
          const countsForDate = segmentCountsByDate[date] || {};
          Object.entries(countsForDate).forEach(([rt, cnt]) => {
            newData.dailyConfig[date].counts[rt] = cnt;
          });
        });
      }

      newData.Com_Nombre_Contacto = groupData.Com_Nombre_Contacto || groupData.Persona_Contacto || "";
      newData.Com_Email_Contacto = groupData.Com_Email_Contacto || groupData.Email || "";
      newData.Com_Telefono_Contacto = groupData.Com_Telefono_Contacto || groupData.Telefono || groupData["Teléfono"] || groupData["Tel\u00c3\u00a9fono"] || groupData["Teléfono"] || "";

      return newData;
    };

    const calculateTotal = (rawGroupData) => {
      const groupData = normalizeGroupData(rawGroupData);
      if (!groupData) return 0;
      if (groupData.isRatesOnly) return 0;

      let dates = [];
      // PRIORIDAD: multi-segmento > DateRanges > Entrada/Salida simple
      if (groupData.isMultiSegment && Array.isArray(groupData.segments) && groupData.segments.length > 0) {
        const stats = getSegmentStats(groupData.segments);
        dates = generateDates(stats.globalIn, stats.globalOut);
      } else if (groupData.DateRanges_JSON && Array.isArray(groupData.DateRanges_JSON) && groupData.DateRanges_JSON.length > 0) {
        dates = generateSeriesDates(groupData.DateRanges_JSON);
      } else {
        dates = generateDates(groupData.Entrada, groupData.Salida);
      }
      let total = 0;
      dates.forEach(date => {
        const config = groupData.dailyConfig?.[date] || {};
        const allTypes = new Set([
          ...Object.keys(groupData.roomCounts || {}),
          ...Object.keys(config.counts || {})
        ]);
        allTypes.forEach(type => {
          let count = groupData.roomCounts?.[type] || 0;
          if (config.counts) {
            const countKey = Object.keys(config.counts).find(k => k.toLowerCase() === type.toLowerCase());
            if (countKey && config.counts[countKey] !== '' && config.counts[countKey] !== undefined) {
              count = Number(config.counts[countKey]);
            }
          }
          if (count > 0) {
            let lineSubtotal = 0;
            if (config.prices) {
              const priceKey = Object.keys(config.prices).find(k => k.toLowerCase() === type.toLowerCase());
              const p = priceKey ? parseFloat(config.prices[priceKey] || 0) : 0;
              
              const gratKey = config.gratuities ? Object.keys(config.gratuities).find(k => k.toLowerCase() === type.toLowerCase()) : null;
              const grat = gratKey ? parseInt(config.gratuities[gratKey] || 0) : 0;
              
              const discKey = config.discounts ? Object.keys(config.discounts).find(k => k.toLowerCase() === type.toLowerCase()) : null;
              const disc = discKey ? parseFloat(config.discounts[discKey] || 0) : 0;
              
              const billableCount = Math.max(0, count - grat);
              lineSubtotal = p * billableCount * (1 - disc / 100);
            } else {
              const typeKey = Object.keys(config).find(k => k.toLowerCase() === type.toLowerCase());
              if (typeKey && config[typeKey]) {
                const price = parseFloat(config[typeKey].price) || 0;
                const discount = parseFloat(config[typeKey].discount) || 0;
                const gratuities = parseInt(config[typeKey].gratuities) || 0;
                const billableCount = Math.max(0, count - gratuities);
                lineSubtotal = billableCount * price * (1 - discount / 100);
              }
            }
            total += lineSubtotal;
          }
        });
      });
      // Suplementos y Descuentos Globales
      const suplementos = parseFloat(groupData.Suplementos) || 0;
      const descuentos = parseFloat(groupData.Descuentos) || 0;
      total = total + suplementos - descuentos;

      // Otros Cargos (Extras Dinámicos)
      const extras = groupData.extraCharges || [];
      extras.forEach(extra => {
        const isGlobal = !extra.date;
        const px = parseFloat(extra.price) || 0;
        total += isGlobal ? (px * Math.max(1, dates.length)) : px;
      });

      // Si no hay configuración diaria pero hay un importe fijado (desde IA)
      if (total === 0 && groupData["Importe(*)"]) {
        let cleanStr = String(groupData["Importe(*)"]).trim();
        if (cleanStr.includes('.') && cleanStr.includes(',')) {
          cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
        } else if (cleanStr.includes(',')) {
          cleanStr = cleanStr.replace(',', '.');
        }
        const imp = parseFloat(cleanStr);
        return isNaN(imp) ? 0 : imp;
      }
      return total > 0 ? total : 0;
    };

    const parsePaymentPlan = (value) => {
      if (Array.isArray(value)) return value;
      try {
        return JSON.parse(value || "[]");
      } catch (e) {
        return [];
      }
    };

    const cents = (value) => Math.round((parseFloat(value) || 0) * 100) / 100;

    const getPaymentLimitDate = (groupData, days = 7) => {
      const entry = toInputDate(groupData.Entrada);
      if (!entry) return "";
      const date = new Date(entry);
      if (isNaN(date.getTime())) return "";
      date.setDate(date.getDate() - days);
      return date.toISOString().split("T")[0];
    };

    const buildPaymentPlan = (percent, total, groupData) => {
      const advancePercent = Math.max(0, Math.min(100, parseFloat(percent) || 0));
      const advanceAmount = cents(total * (advancePercent / 100));
      const remainingAmount = cents(total - advanceAmount);
      return [
        {
          id: Date.now(),
          label: "Anticipo / depósito para confirmar la reserva",
          percent: advancePercent,
          amount: advanceAmount.toFixed(2),
          date: new Date().toISOString().split("T")[0],
          status: "Pendiente",
          releaseDays: 0,
          observations: "",
          manual: false
        },
        {
          id: Date.now() + 1,
          label: "Resto pendiente",
          percent: total > 0 ? cents((remainingAmount / total) * 100) : 0,
          amount: remainingAmount.toFixed(2),
          date: getPaymentLimitDate(groupData, 7),
          status: "Pendiente",
          releaseDays: 7,
          observations: "Antes de la llegada",
          manual: false
        }
      ];
    };

    const normalizePaymentPlan = (plan, total, groupData) => {
      const rows = parsePaymentPlan(plan).slice(0, 2);
      if (rows.length === 0) return [];
      const baseRows = rows.length === 1
        ? [...rows, { label: "Resto pendiente", percent: 0, amount: 0, date: getPaymentLimitDate(groupData, 7), status: "Pendiente", releaseDays: 7, observations: "" }]
        : rows;
      const [advanceSource, remainingSource] = baseRows;
      const advance = { ...advanceSource, label: advanceSource.label || "Anticipo / depósito para confirmar la reserva" };
      const remaining = { ...remainingSource, label: remainingSource.label || "Resto pendiente" };

      if (advance.manual && !remaining.manual) {
        advance.amount = cents(advance.amount).toFixed(2);
        advance.percent = total > 0 ? cents((parseFloat(advance.amount) / total) * 100) : 0;
        remaining.amount = cents(total - parseFloat(advance.amount)).toFixed(2);
        remaining.percent = total > 0 ? cents((parseFloat(remaining.amount) / total) * 100) : 0;
      } else if (remaining.manual && !advance.manual) {
        remaining.amount = cents(remaining.amount).toFixed(2);
        remaining.percent = total > 0 ? cents((parseFloat(remaining.amount) / total) * 100) : 0;
        advance.amount = cents(total - parseFloat(remaining.amount)).toFixed(2);
        advance.percent = total > 0 ? cents((parseFloat(advance.amount) / total) * 100) : 0;
      } else {
        const advancePercent = Math.max(0, Math.min(100, parseFloat(advance.percent) || 0));
        advance.percent = advancePercent;
        advance.amount = cents(total * (advancePercent / 100)).toFixed(2);
        remaining.amount = cents(total - parseFloat(advance.amount)).toFixed(2);
        remaining.percent = total > 0 ? cents((parseFloat(remaining.amount) / total) * 100) : 0;
      }

      const diff = cents(total - (parseFloat(advance.amount) || 0) - (parseFloat(remaining.amount) || 0));
      if (Math.abs(diff) >= 0.01) {
        remaining.amount = cents((parseFloat(remaining.amount) || 0) + diff).toFixed(2);
        remaining.percent = total > 0 ? cents((parseFloat(remaining.amount) / total) * 100) : 0;
      }

      return [advance, remaining];
    };

    function App() {
      const [groups, setGroups] = useState([]);
      const [loading, setLoading] = useState(true);
      const [currentView, setCurrentView] = useState('dashboard');
      const [selectedGroup, setSelectedGroup] = useState(null);
      const [newNote, setNewNote] = useState('');
      const [globalConfig, setGlobalConfig] = useState(null);
      const [isEditingClauses, setIsEditingClauses] = useState(false);
      const [tempClauses, setTempClauses] = useState([]);
      const [tempClausesConf, setTempClausesConf] = useState([]);
      const [isEditingClausesConf, setIsEditingClausesConf] = useState(false);
      const [docMode, setDocMode] = useState('presupuesto'); // 'presupuesto' o 'confirmacion'
      const [filterTab, setFilterTab] = useState('activos'); // 'activos', 'confirmados', 'desestimados'
      const [searchTerm, setSearchTerm] = useState('');
      const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
      const [startDate, setStartDate] = useState('');
      const [endDate, setEndDate] = useState('');
      const [showEmailParseModal, setShowEmailParseModal] = useState(false);
      const [emailContent, setEmailContent] = useState('');
      const [isParsingEmail, setIsParsingEmail] = useState(false);

      // Debounce search term
      useEffect(() => {
        const handler = setTimeout(() => {
          setDebouncedSearchTerm(searchTerm);
        }, 300);
        return () => clearTimeout(handler);
      }, [searchTerm]);

      useEffect(() => {
        const unsubscribe = db.collection("settings").doc("main").onSnapshot(doc => {
          if (doc.exists) {
            setGlobalConfig(doc.data());
          }
        });
        return () => unsubscribe();
      }, []);

      const getCurrentStayDates = (data = formData) => {
        // PRIORIDAD: multi-segmento > DateRanges > Entrada/Salida simple
        if (data.isMultiSegment && Array.isArray(data.segments) && data.segments.length > 0) {
          const stats = getSegmentStats(data.segments);
          return generateDates(stats.globalIn, stats.globalOut);
        }
        if (data.DateRanges_JSON && Array.isArray(data.DateRanges_JSON) && data.DateRanges_JSON.length > 0) {
          return generateSeriesDates(data.DateRanges_JSON);
        }
        return generateDates(data.Entrada, data.Salida);
      };

      const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
      const [pastePreview, setPastePreview] = useState({ isOpen: false, parsedData: {}, unrecognizedBoards: [], unrecognizedRooms: [] });

      const handlePasteTarifas = async (textStr) => {
        let text = textStr;
        if (!text || typeof text !== 'string') {
          try {
            text = await navigator.clipboard.readText();
          } catch (err) {
            alert("No se pudo leer el portapapeles. Usa Ctrl+V sobre la tabla de tarifas.");
            return;
          }
        }
        if (!text) return;

        const rowsData = text.split('\n').map(r => r.split('\t').map(c => c.trim()));
        if (rowsData.length < 2) return; 

        const normBoard = {
          'sa': 'SA', 'solo alojamiento': 'SA', 'solo aloj.': 'SA',
          'ad': 'AD', 'alojamiento y desayuno': 'AD', 'hd': 'AD', 'bb': 'AD', 'b&b': 'AD',
          'mp': 'MP', 'media pensión': 'MP', 'media pension': 'MP', 'median pensión': 'MP', 'median pension': 'MP', 'hb': 'MP', 'half board': 'MP',
          'pc': 'PC', 'pensión completa': 'PC', 'pension completa': 'PC', 'fb': 'PC', 'full board': 'PC'
        };

        const normRoom = {
          'dui': 'DOBLE DE USO INDIVIDUAL', 'uso individual': 'DOBLE DE USO INDIVIDUAL', 'individual': 'DOBLE DE USO INDIVIDUAL', 'single': 'DOBLE DE USO INDIVIDUAL', 'doble de uso individual': 'DOBLE DE USO INDIVIDUAL',
          'doble': 'DOBLE', 'double': 'DOBLE',
          'doble + supletoria': 'DOBLE + SUPLETORIA', 'triple': 'DOBLE + SUPLETORIA', '3ª pax': 'DOBLE + SUPLETORIA', 'doble con supletoria': 'DOBLE + SUPLETORIA',
          'cuádruple': 'CUÁDRUPLE', 'cuadruple': 'CUÁDRUPLE', 'quadruple': 'CUÁDRUPLE', '4 pax': 'CUÁDRUPLE'
        };

        const parsePrice = (str) => {
          if (!str) return null;
          let s = str.replace(/[€\s]/g, '');
          if (s.match(/\d+\.\d{3},\d+/)) {
            s = s.replace(/\./g, '').replace(',', '.');
          } else if (s.includes(',') && s.includes('.')) {
             s = s.replace(/,/g, '');
          } else if (s.includes(',')) {
             s = s.replace(',', '.');
          }
          const num = parseFloat(s);
          return isNaN(num) ? null : num;
        };

        let parsedGrid = {};
        let unrecBoards = new Set();
        let unrecRooms = new Set();

        let colHeaders = rowsData[0].map(h => h.toLowerCase());
        let rowHeaders = rowsData.map(r => r[0] ? r[0].toLowerCase() : '');

        let colRoomCount = colHeaders.filter(h => normRoom[h]).length;
        let rowRoomCount = rowHeaders.filter(h => normRoom[h]).length;
        
        let colBoardCount = colHeaders.filter(h => normBoard[h]).length;
        let rowBoardCount = rowHeaders.filter(h => normBoard[h]).length;

        let detectedRowsAs = 'unknown'; 
        let detectedColsAs = 'unknown'; 

        if (rowBoardCount > colBoardCount) detectedRowsAs = 'boards';
        else if (colBoardCount > rowBoardCount) detectedColsAs = 'boards';

        if (colRoomCount > rowRoomCount) detectedColsAs = 'rooms';
        else if (rowRoomCount > colRoomCount) detectedRowsAs = 'rooms';

        if (detectedRowsAs === 'boards' && detectedColsAs === 'unknown') detectedColsAs = 'rooms';
        if (detectedRowsAs === 'rooms' && detectedColsAs === 'unknown') detectedColsAs = 'boards';
        if (detectedColsAs === 'rooms' && detectedRowsAs === 'unknown') detectedRowsAs = 'boards';
        if (detectedColsAs === 'boards' && detectedRowsAs === 'unknown') detectedRowsAs = 'rooms';

        if (detectedRowsAs === 'unknown') {
           detectedRowsAs = 'boards';
           detectedColsAs = 'rooms';
        }

        for (let i = 1; i < rowsData.length; i++) {
           for (let j = 1; j < rowsData[i].length; j++) {
              if (!rowsData[i][j]) continue;
              let rowHeader = rowHeaders[i];
              let colHeader = colHeaders[j];
              
              let boardKeyRaw = detectedRowsAs === 'boards' ? rowHeader : colHeader;
              let roomKeyRaw = detectedColsAs === 'rooms' ? colHeader : rowHeader;

              let boardNorm = normBoard[boardKeyRaw];
              let roomNorm = normRoom[roomKeyRaw];

              let price = parsePrice(rowsData[i][j]);

              if (price !== null) {
                  if (!boardNorm && boardKeyRaw) unrecBoards.add(boardKeyRaw);
                  if (!roomNorm && roomKeyRaw) unrecRooms.add(roomKeyRaw);
                  
                  if (boardNorm && roomNorm) {
                     if (!parsedGrid[boardNorm]) parsedGrid[boardNorm] = {};
                     parsedGrid[boardNorm][roomNorm] = price;
                  }
              }
           }
        }

        setPastePreview({
           isOpen: true,
           parsedData: parsedGrid,
           unrecognizedBoards: Array.from(unrecBoards),
           unrecognizedRooms: Array.from(unrecRooms)
        });
      };

      const applyPastedTarifas = () => {
        const currentGrid = { ...(formData.ratesOnlyGrid || {}) };
        Object.keys(pastePreview.parsedData).forEach(board => {
           if (!currentGrid[board]) currentGrid[board] = {};
           Object.keys(pastePreview.parsedData[board]).forEach(room => {
               currentGrid[board][room] = pastePreview.parsedData[board][room];
           });
        });
        setFormData({ ...formData, ratesOnlyGrid: currentGrid });
        setPastePreview({ isOpen: false, parsedData: {}, unrecognizedBoards: [], unrecognizedRooms: [] });
      };

      // Auto-sync daily configuration prices with ratesOnlyGrid and counts with segments in real-time
      useEffect(() => {
        if (!formData.isRatesOnly) {
          const stayDates = getCurrentStayDates(formData);
          const grid = formData.ratesOnlyGrid || {};
          const newDailyConfig = { ...(formData.dailyConfig || {}) };
          let changed = false;

          // Compute segment counts if in multi-segment mode
          let segmentCountsByDate = {};
          let maxByType = {};
          if (formData.isMultiSegment && Array.isArray(formData.segments) && formData.segments.length > 0) {
            segmentCountsByDate = buildDailyCountsFromSegments(formData.segments);
            Object.values(segmentCountsByDate).forEach(countsByType => {
              Object.entries(countsByType).forEach(([rt, cnt]) => {
                if (cnt > (maxByType[rt] || 0)) {
                  maxByType[rt] = cnt;
                }
              });
            });
          }

          stayDates.forEach(date => {
            if (!newDailyConfig[date]) {
              newDailyConfig[date] = { board: formData["Régimen"] || 'AD (Alojamiento y Desayuno)', prices: {}, counts: {}, gratuities: {} };
              changed = true;
            }
            const dayConf = newDailyConfig[date];

            // If in multi-segment mode, sync counts
            if (formData.isMultiSegment) {
              const newCounts = {};
              // Initialize all known room types to 0
              Object.keys(maxByType).forEach(rt => {
                newCounts[rt] = 0;
              });
              // Set the actual counts for this date
              const countsForDate = segmentCountsByDate[date] || {};
              Object.entries(countsForDate).forEach(([rt, cnt]) => {
                newCounts[rt] = cnt;
              });

              if (JSON.stringify(dayConf.counts) !== JSON.stringify(newCounts)) {
                dayConf.counts = newCounts;
                changed = true;
              }
            }

            const currentBoard = dayConf.board || formData["Régimen"] || 'AD (Alojamiento y Desayuno)';
            const boardKey = currentBoard.split(' ')[0]; // e.g. "AD"

            if (grid[boardKey]) {
              const roomTypes = ROOM_TYPES[formData.Hotel_Asignado] || [];
              const updatedPrices = { ...(dayConf.prices || {}) };
              roomTypes.forEach(room => {
                const gridPrice = grid[boardKey][room];
                if (gridPrice !== undefined && gridPrice !== '') {
                  const numVal = Number(gridPrice);
                  if (updatedPrices[room] !== numVal) {
                    updatedPrices[room] = numVal;
                    changed = true;
                  }
                }
              });
              if (JSON.stringify(dayConf.prices) !== JSON.stringify(updatedPrices)) {
                dayConf.prices = updatedPrices;
                changed = true;
              }
            }
          });

          if (changed) {
            setFormData(prev => ({ ...prev, dailyConfig: newDailyConfig }));
          }
        }
      }, [
        formData.Entrada,
        formData.Salida,
        formData.Hotel_Asignado,
        formData.ratesOnlyGrid,
        formData.isRatesOnly,
        formData.isMultiSegment,
        formData.segments
      ]);

      // Cargar datos y manejar parámetros de URL
      useEffect(() => {
        const unsubscribe = db.collection("groups")
          .onSnapshot((snapshot) => {
            const docs = snapshot.docs.map(doc => ({
              uid: doc.id,
              ...doc.data()
            })).filter(g => {
              const est = (g.Estado || "").toUpperCase();
              const intEst = (g.Com_Estado_Interno || "").toUpperCase();

              const isBudget =
                String(g.Reserva || "").startsWith("PRES-") ||
                est.includes("PRESUPUESTO") ||
                intEst.includes("PRESUPUESTO") ||
                intEst.includes("ENVIADO") ||
                intEst.includes("SEGUIMIENTO") ||
                intEst.includes("PENDIENTE");

              if (!isBudget) return false;

              // En el cargador general de Presupuestos, permitimos todos los estados
              // (la lógica de visualización se encarga de filtrar por la pestaña seleccionada)
              return true;
            });
            setGroups(docs);
            setLoading(false);

            // Lógica de Deep-link (?id=XXXX)
            const urlParams = new URLSearchParams(window.location.search);
            const budgetId = urlParams.get('id');
            const shouldEdit = urlParams.get('edit') === '1';

            if (budgetId && docs.length > 0) {
              const matched = docs.find(g => String(g.Reserva) === String(budgetId) || String(g.uid) === String(budgetId));
              if (matched) {
                const normMatched = normalizeGroupData(matched);
                if (shouldEdit) {
                  setFormData(normMatched);
                  setCurrentView('create');
                } else {
                  handleOpenDetail(normMatched);
                }
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }
          });
        return () => unsubscribe();
      }, []);

      const processedGroups = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];

        return groups
          .map(rawG => {
            const g = normalizeGroupData(rawG);
            const totalAmount = calculateTotal(g);
            return { ...g, _totalAmount: totalAmount };
          })
          .filter(g => {
            const intEst = (g.Com_Estado_Interno || "").toUpperCase();
            const extEst = (g.Estado || "").toUpperCase();
            const isCancelled = ["CANCEL", "ANUL", "GASTOS", "DESESTIMADO", "BAJA", "CADUCADO"].some(status => intEst.includes(status) || extEst.includes(status));
            const isConfirmed = intEst.includes("CONFIRM") || extEst.includes("CONFIRM");
            
            const departureStr = g.Salida || g.Entrada || "";
            const isPast = departureStr && departureStr < todayStr;

            // Filtro por Pestaña
            if (filterTab === 'confirmados' && !isConfirmed) return false;
            if (filterTab === 'desestimados' && !isCancelled) return false;
            if (filterTab === 'activos') {
              const isActiveStatus = ["PRESUPUESTO", "PENDIENTE", "ENVIADO", "SEGUIMIENTO"].some(s => intEst.includes(s));
              if (isCancelled || isConfirmed || (isPast && !isActiveStatus)) return false;
            }

            // Filtro de Búsqueda (usar debouncedSearchTerm)
            if (debouncedSearchTerm) {
              const term = debouncedSearchTerm.toLowerCase();
              const groupName = (g["Nombre del Grupo"] || "").toLowerCase();
              const agency = (g["Empresa/Agencia"] || "").toLowerCase();
              const resId = String(g.Reserva || "").toLowerCase();
              const fullId = (g.uid || "").toLowerCase();
              if (!groupName.includes(term) && !agency.includes(term) && !resId.includes(term) && !fullId.includes(term)) return false;
            }

            // Filtro de Fecha (Rango Manual)
            if (startDate || endDate) {
              const entry = toInputDate(g.Entrada);
              if (!entry) return false;
              if (startDate && entry < startDate) return false;
              if (endDate && entry > endDate) return false;
            }

            return true;
          }).sort((a, b) => {
            const dateA = a.createdAt?.seconds ? a.createdAt.seconds : (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
            const dateB = b.createdAt?.seconds ? b.createdAt.seconds : (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
            return dateB - dateA;
          });
      }, [groups, filterTab, debouncedSearchTerm, startDate, endDate]);


      const handleHotelChange = (e) => {
        setFormData({
          ...formData,
          Hotel_Asignado: e.target.value,
          roomCounts: {},
          dailyConfig: {}
        });
      };

      const handleRoomCountChange = (type, value) => {
        const newRoomCounts = { ...(formData.roomCounts || {}), [type]: Number(value) };
        // Auto-calcular PAX total (solo para los tipos válidos del hotel actual)
        const currentRooms = ROOM_TYPES[formData.Hotel_Asignado] || ROOM_TYPES['Sercotel Guadiana'];
        const totalPax = Object.entries(newRoomCounts).reduce((sum, [roomType, count]) => {
          if (currentRooms.includes(roomType)) {
            return sum + (Number(count) || 0) * (PAX_PER_ROOM[roomType] || 2);
          }
          return sum;
        }, 0);
        setFormData({
          ...formData,
          roomCounts: newRoomCounts,
          "Pax.": totalPax
        });
      };

      const handleDailyConfigChange = (date, field, value, roomType = null) => {
        setFormData(prev => {
          const newDailyConfig = { ...(prev.dailyConfig || {}) };
          if (!newDailyConfig[date]) {
            newDailyConfig[date] = { board: 'AD (Alojamiento y Desayuno)', prices: {}, counts: {}, gratuities: {} };
          }
          if (roomType) {
            newDailyConfig[date][field] = { ...(newDailyConfig[date][field] || {}), [roomType]: value === '' ? '' : Number(value) };
          } else {
            newDailyConfig[date][field] = value;
            
            // Auto-fill prices from ratesOnlyGrid if board type (regime) changes
            if (field === 'board' && prev.ratesOnlyGrid) {
              const boardKey = value.split(' ')[0]; // e.g. "AD"
              if (prev.ratesOnlyGrid[boardKey]) {
                const roomTypes = ROOM_TYPES[prev.Hotel_Asignado] || [];
                const updatedPrices = { ...(newDailyConfig[date].prices || {}) };
                roomTypes.forEach(room => {
                  const gridPrice = prev.ratesOnlyGrid[boardKey][room];
                  if (gridPrice !== undefined && gridPrice !== '') {
                    updatedPrices[room] = Number(gridPrice);
                  }
                });
                newDailyConfig[date].prices = updatedPrices;
              }
            }
          }
          return { ...prev, dailyConfig: newDailyConfig };
        });
      };

      const handleToggleToDistribution = () => {
        const stayDates = getCurrentStayDates(formData);
        const grid = formData.ratesOnlyGrid || {};
        const newDailyConfig = { ...(formData.dailyConfig || {}) };

        stayDates.forEach(date => {
          if (!newDailyConfig[date]) {
            newDailyConfig[date] = { board: formData["Régimen"] || 'AD (Alojamiento y Desayuno)', prices: {}, counts: {}, gratuities: {} };
          }
          const dayConf = newDailyConfig[date];
          const currentBoard = dayConf.board || formData["Régimen"] || 'AD (Alojamiento y Desayuno)';
          const boardKey = currentBoard.split(' ')[0]; // e.g. "AD"

          if (grid[boardKey]) {
            const roomTypes = ROOM_TYPES[formData.Hotel_Asignado] || [];
            const updatedPrices = { ...(dayConf.prices || {}) };
            roomTypes.forEach(room => {
              const gridPrice = grid[boardKey][room];
              if (gridPrice !== undefined && gridPrice !== '') {
                updatedPrices[room] = Number(gridPrice);
              }
            });
            dayConf.prices = updatedPrices;
          }
        });

        setFormData(prev => {
          const totalPax = Object.entries(prev.roomCounts || {}).reduce((sum, [roomType, count]) => {
            return sum + (Number(count) || 0) * (PAX_PER_ROOM[roomType] || 2);
          }, 0);
          return {
            ...prev,
            isRatesOnly: false,
            dailyConfig: newDailyConfig,
            "Pax.": totalPax > 0 ? totalPax : prev["Pax."]
          };
        });
      };

      const handleCopyFirstDay = () => {
        const stayDates = getCurrentStayDates(formData);
        if (stayDates.length <= 1) return;
        
        const firstDate = stayDates[0];
        const firstDayConfig = formData.dailyConfig?.[firstDate] || {};
        
        const newDailyConfig = { ...(formData.dailyConfig || {}) };
        
        for (let i = 1; i < stayDates.length; i++) {
          const targetDate = stayDates[i];
          const targetConfig = newDailyConfig[targetDate] || {};
          const copied = JSON.parse(JSON.stringify(firstDayConfig));
          if (formData.isMultiSegment) {
            copied.counts = targetConfig.counts || {};
          }
          newDailyConfig[targetDate] = copied;
        }
        
        setFormData(prev => ({ ...prev, dailyConfig: newDailyConfig }));
      };

      const handleSave = async (e) => {
        e.preventDefault();
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const normalizedFormData = normalizeGroupData(formData);
        const finalTotal = calculateTotal(normalizedFormData);
        normalizedFormData.PaymentPlan_JSON = JSON.stringify(
          normalizePaymentPlan(normalizedFormData.PaymentPlan_JSON, finalTotal, normalizedFormData)
        );

        // Validation: Mandatory Hotel
        const hotelAsignado = normalizedFormData.Hotel_Asignado || normalizedFormData.Hotel || "";
        if (!hotelAsignado || hotelAsignado.toLowerCase().includes("pend") || hotelAsignado.trim() === "") {
          alert("⚠️ Error de Integridad: Debe asignar un hotel válido. No se permiten registros 'Pendientes'.");
          return;
        }

        // Validation: Dates
        const entrada = String(normalizedFormData.Entrada || "").trim();
        const salida = String(normalizedFormData.Salida || "").trim();

        if (!entrada || !salida) {
          alert("⚠️ Error: Debe especificar las fechas de entrada y salida.");
          return;
        }

        if (new Date(entrada) >= new Date(salida)) {
          alert("⚠️ Error: La fecha de salida debe ser estrictamente posterior a la de entrada (mínimo 1 noche).");
          return;
        }

        if (normalizedFormData.isMultiSegment) {
          if (!Array.isArray(normalizedFormData.segments) || normalizedFormData.segments.length === 0) {
            alert("⚠️ Error: En modo multi-estancia debe haber al menos un segmento.");
            return;
          }

          for (let i = 0; i < normalizedFormData.segments.length; i++) {
            const seg = normalizedFormData.segments[i];
            if (!seg.in || !seg.out) {
              alert(`⚠️ Error en Segmento ${seg.id || i + 1}: Debe especificar las fechas de entrada y salida.`);
              return;
            }
            if (seg.in >= seg.out) {
              alert(`⚠️ Error en Segmento ${seg.id || i + 1}: La fecha de salida (${seg.out}) debe ser posterior a la de entrada (${seg.in}).`);
              return;
            }
            if (Number(seg.pax || 0) <= 0) {
              alert(`⚠️ Error en Segmento ${seg.id || i + 1}: El número de PAX debe ser mayor que 0.`);
              return;
            }
            const allocations = seg.roomAllocations || [];
            if (allocations.length === 0) {
              alert(`⚠️ Error en Segmento ${seg.id || i + 1}: Debe tener al menos una asignación de habitación.`);
              return;
            }
            const totalRooms = allocations.reduce((sum, a) => sum + Number(a.rooms || 0), 0);
            if (totalRooms <= 0) {
              alert(`⚠️ Error en Segmento ${seg.id || i + 1}: El número total de habitaciones debe ser mayor que 0.`);
              return;
            }
            for (let j = 0; j < allocations.length; j++) {
              const a = allocations[j];
              if (!a.roomType) {
                alert(`⚠️ Error en Segmento ${seg.id || i + 1}: Tipo de habitación no especificado.`);
                return;
              }
              if (Number(a.rooms || 0) <= 0) {
                alert(`⚠️ Error en Segmento ${seg.id || i + 1}: La asignación para ${a.roomType} debe ser mayor que 0.`);
                return;
              }
            }
          }

          // Warnings / Confirmations (non-blocking)
          const metrics = buildMultiSegmentMetrics(normalizedFormData.segments, normalizedFormData.declaredPax);
          if (metrics.declaredPax > 0 && metrics.segmentPaxTotal > metrics.declaredPax) {
            const confirmSave = window.confirm(`⚠️ Advertencia: El número total de PAX en los segmentos (${metrics.segmentPaxTotal}) supera los PAX declarados por el cliente (${metrics.declaredPax}). ¿Desea continuar?`);
            if (!confirmSave) return;
          }

          // Check for empty nights (nights with 0 rooms occupied)
          const segmentCountsByDate = buildDailyCountsFromSegments(normalizedFormData.segments);
          const globalDates = generateDates(metrics.globalIn, metrics.globalOut);
          const emptyDates = globalDates.filter(d => {
            const countsForDate = segmentCountsByDate[d] || {};
            const roomsSum = Object.values(countsForDate).reduce((s, c) => s + Number(c), 0);
            return roomsSum === 0;
          });
          if (emptyDates.length > 0) {
            const confirmSave = window.confirm(`⚠️ Advertencia: Hay fechas dentro del rango global con 0 habitaciones ocupadas (por ejemplo: ${emptyDates.slice(0, 3).map(formatDate).join(', ')}${emptyDates.length > 3 ? '...' : ''}). ¿Desea continuar?`);
            if (!confirmSave) return;
          }
        }

        const reservaId = normalizedFormData.Reserva || `PRES-${Math.floor(100000 + Math.random() * 900000)}`;
        const isNew = !normalizedFormData.uid;

        let releaseDate = normalizedFormData.Com_Vencimiento_Rel || "";
        if (!releaseDate && entrada) {
          const d = new Date(entrada);
          if (!isNaN(d.getTime())) {
            d.setDate(d.getDate() - 15);
            releaseDate = d.toISOString().split("T")[0];
          }
        }

        const generatedRoomingList = buildRoomingList(normalizedFormData, normalizedFormData.RoomingList_JSON || "");
        const groupData = {
          ...normalizedFormData,
          Reserva: reservaId,
          "Com_Vencimiento_Rel": releaseDate,
          "Segment.": normalizedFormData["Segment."] || "GRUPOS",
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          "Importe(*)": formatNum(finalTotal),
          "RoomingList_JSON": JSON.stringify(generatedRoomingList)
        };

        try {
          if (isNew) {
            groupData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            groupData.Estado = "Presupuesto";
            groupData.tracking = [{ id: Date.now(), date: formattedDate, text: "Presupuesto registrado (Alta Manual)." }];
            await db.collection("groups").doc(reservaId).set(groupData);
          } else {
            const uidToUpdate = groupData.uid;
            const oldDoc = groups.find(g => g.uid === uidToUpdate);
            
            // History Tracking: Detect changes
            const changes = [];
            const fieldsToTrack = {
              "Nombre del Grupo": "Nombre",
              "Hotel_Asignado": "Hotel",
              "Entrada": "Entrada",
              "Salida": "Salida",
              "Com_Estado_Interno": "Estado",
              "Empresa/Agencia": "Empresa",
              "Pax.": "Pax"
            };
            Object.entries(fieldsToTrack).forEach(([field, label]) => {
              if (String(formData[field] || "") !== String(oldDoc[field] || "")) {
                changes.push(`${label}: ${oldDoc[field] || 'vacío'} ➔ ${formData[field] || 'vacío'}`);
              }
            });

            if (changes.length > 0) {
              groupData.tracking = [{ id: Date.now(), date: formattedDate, text: "ðŸ“ " + changes.join(" | ") }, ...(Array.isArray(oldDoc.tracking) ? oldDoc.tracking : [])];
            } else {
              groupData.tracking = Array.isArray(oldDoc.tracking) ? oldDoc.tracking : [];
            }

            delete groupData.uid; // evitar guardarlo duplicado en document fields

            const validUpdateData = {};
            const fallbackData = {};

            // Firebase update() no soporta ciertos caracteres en las keys.
            // Extraemos esos campos para guardarlos con set({merge: true})
            Object.keys(groupData).forEach(key => {
              if (/[~*/\[\].]/.test(key)) {
                fallbackData[key] = groupData[key];
              } else {
                validUpdateData[key] = groupData[key];
              }
            });

            // Usar update en lugar de set({merge: true}) para que mapas
            // enteros (roomCounts, dailyConfig) se REEMPLACEN, no se deep-mergen.
            if (Object.keys(validUpdateData).length > 0) {
              await db.collection("groups").doc(uidToUpdate).update(validUpdateData);
            }
            if (Object.keys(fallbackData).length > 0) {
              await db.collection("groups").doc(uidToUpdate).set(fallbackData, { merge: true });
            }
          }
          setCurrentView('dashboard');
        } catch (error) {
          console.error("Error saving budget:", error);
          alert("Error al guardar.");
        }
      };

      const handleOpenDetail = (g) => {
        setSelectedGroup(g);
        const intEst = (g.Com_Estado_Interno || "").toUpperCase();
        const extEst = (g.Estado || "").toUpperCase();
        if (intEst.includes("CONFIRM") || extEst.includes("CONFIRM")) {
          setDocMode('confirmacion');
        } else {
          setDocMode('presupuesto');
        }
        setCurrentView('detail');
      };

      const handleTranslateClause = async (idx, type = 'budget') => {
        const clauses = type === 'budget' ? [...tempClauses] : [...tempClausesConf];
        const textToTranslate = clauses[idx].body.split('[EN]')[0].trim();
        if (!textToTranslate) return;

        try {
          const prompt = `Traduce el siguiente texto de un presupuesto de hotel al inglés. Mantén un tono profesional y corporativo. Devuelve SOLO el texto traducido, sin comillas ni introducciones: "${textToTranslate}"`;
          const translated = await window.callGemini(prompt);
          if (translated && !translated.includes('ERROR')) {
            clauses[idx].body = `${textToTranslate} [EN] ${translated.trim()}`;
            if (type === 'budget') setTempClauses(clauses);
            else setTempClausesConf(clauses);
          } else {
            alert("Error en la traducción: " + translated);
          }
        } catch (e) {
          alert("Error al conectar con la IA.");
        }
      };

      const handleParseEmailIA = async () => {
        if (!emailContent.trim()) {
          alert("Por favor, pega el contenido del email.");
          return;
        }

        setIsParsingEmail(true);
        try {
          const currentYear = new Date().getFullYear();
          const prompt = `Analiza el siguiente email de solicitud de habitaciones de hotel.
Extrae el número total de personas declaradas por el cliente en el email ("declaredPax") y TODOS los segmentos de estancia de los subgrupos (cada segmento con su id, travelerGroupId, pax, fechas in y out, y asignación de habitaciones "roomAllocations").
Responde EXCLUSIVAMENTE con JSON válido (sin formato markdown \`\`\`json ni texto explicativo) con esta estructura exacta:
{
  "groupName": "Nombre empresa o grupo",
  "contactName": "Nombre contacto",
  "contactEmail": "email@ejemplo.com",
  "hotel": "nombre del hotel si se menciona",
  "observations": "preguntas, notas, solicitudes del pool/gimnasio u observaciones adicionales",
  "declaredPax": 9,
  "segments": [
    {
      "id": "A",
      "travelerGroupId": "G1",
      "pax": 3,
      "in": "YYYY-MM-DD",
      "out": "YYYY-MM-DD",
      "roomAllocations": [
        { "pax": 3, "roomType": "DOBLE DE USO INDIVIDUAL", "rooms": 3 }
      ],
      "notes": ""
    }
  ]
}
Reglas para los segmentos:
1. Por defecto, asigna 1 habitación por persona ("rooms" = "pax") y tipo "DOBLE DE USO INDIVIDUAL" en el array "roomAllocations", a menos que se indique lo contrario.
2. Si no se especifica el año para las fechas, usa ${currentYear}.
3. El formato de las fechas "in" y "out" debe ser estrictamente YYYY-MM-DD.

Email a analizar:
${emailContent}`;

          if (!window.callGemini) {
            throw new Error('La API de Gemini no está disponible.');
          }

          const response = await window.callGemini(prompt);
          const cleanJson = response.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(cleanJson);

          const segments = Array.isArray(parsed.segments) ? parsed.segments : [];
          const normalizedSegments = segments.map((seg, idx) => {
            const pax = Number(seg.pax) || 1;
            const allocations = Array.isArray(seg.roomAllocations) && seg.roomAllocations.length > 0
              ? seg.roomAllocations.map(a => ({
                  pax: Number(a.pax) || Math.floor(Number(a.rooms)) || 1,
                  roomType: (a.roomType || seg.roomType || 'DOBLE DE USO INDIVIDUAL').toUpperCase(),
                  rooms: Number(a.rooms) || pax
                }))
              : [
                  {
                    pax,
                    roomType: (seg.roomType || 'DOBLE DE USO INDIVIDUAL').toUpperCase(),
                    rooms: Number(seg.rooms) || pax
                  }
                ];
            return {
              id: seg.id || String.fromCharCode(65 + idx),
              travelerGroupId: seg.travelerGroupId || `G${idx + 1}`,
              pax: allocations.reduce((sum, a) => sum + Number(a.pax), 0),
              rooms: allocations.reduce((sum, a) => sum + Number(a.rooms), 0),
              in: seg.in || '',
              out: seg.out || '',
              roomAllocations: allocations,
              notes: seg.notes || ''
            };
          });

          const stats = getSegmentStats(normalizedSegments);

          setFormData({
            ...DEFAULT_FORM_DATA,
            Hotel_Asignado: parsed.hotel && parsed.hotel.toLowerCase().includes('cumbria') ? 'Cumbria Spa&Hotel' : 'Sercotel Guadiana',
            "Nombre del Grupo": parsed.groupName || '',
            Com_Nombre_Contacto: parsed.contactName || '',
            Com_Email_Contacto: parsed.contactEmail || '',
            Com_Notas: parsed.observations || '',
            isMultiSegment: true,
            declaredPax: parsed.declaredPax || '',
            segments: normalizedSegments,
            Entrada: stats.globalIn,
            Salida: stats.globalOut,
            "Pax.": stats.totalPax
          });

          setShowEmailParseModal(false);
          setCurrentView('create');
        } catch (error) {
          console.error("Error al parsear con IA:", error);
          alert("No se pudo analizar el email. Asegúrate de que el contenido es correcto. Error: " + error.message);
        } finally {
          setIsParsingEmail(false);
        }
      };

      const renderClauseText = (text) => {
        if (!text) return null;
        const parts = text.split('[EN]');
        if (parts.length > 1) {
          return (
            <>
              {parts[0]}
              <span className="block mt-1.5 text-slate-400 font-medium italic leading-relaxed border-l-2 border-slate-100 pl-3">
                {parts[1]}
              </span>
            </>
          );
        }
        return text;
      };

      const handleDelete = async (uid) => {
        if (!confirm("¿Eliminar este presupuesto?")) return;
        try {
          await db.collection("groups").doc(uid).delete();
        } catch (error) { console.error(error); }
      };

      const updateStatus = async (uid, newStatus) => {
        try {
          const now = new Date();
          const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const budget = groups.find(g => g.uid === uid);
          const newTracking = [{ id: Date.now(), date: formattedDate, text: `Estado -> ${newStatus}` }, ...(Array.isArray(budget.tracking) ? budget.tracking : [])];
          await db.collection("groups").doc(uid).update({ Com_Estado_Interno: newStatus, tracking: newTracking });
        } catch (error) { console.error(error); }
      };

      const addTrackingNote = async (e) => {
        e.preventDefault();
        if (!newNote.trim() || !selectedGroup) return;
        try {
          const now = new Date();
          const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const newTracking = [{ id: Date.now(), date: formattedDate, text: newNote }, ...(Array.isArray(selectedGroup.tracking) ? selectedGroup.tracking : [])];
          await db.collection("groups").doc(selectedGroup.uid).update({ tracking: newTracking });
          setNewNote('');
        } catch (error) { console.error(error); }
      };

      const addQuickNote = async (uid, note) => {
        if (!note.trim()) return;
        try {
          const now = new Date();
          const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const budget = groups.find(g => g.uid === uid);
          const newTracking = [{ id: Date.now(), date: formattedDate, text: note }, ...(Array.isArray(budget.tracking) ? budget.tracking : [])];
          await db.collection("groups").doc(uid).update({ tracking: newTracking });
        } catch (error) { console.error(error); }
      };

      // --- VISTAS ---
      const renderDashboard = () => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 hidden">
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 gap-4">
              <div className="flex flex-col">
                <h2 className="text-xl font-black text-slate-800">Seguimiento de Cotizaciones</h2>
                <div className="flex gap-4 mt-3">
                  <button 
                    onClick={() => setFilterTab('activos')}
                    className={`text-[9px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${filterTab === 'activos' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                  >
                    Activos
                  </button>
                  <button 
                    onClick={() => setFilterTab('confirmados')}
                    className={`text-[9px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${filterTab === 'confirmados' ? 'text-emerald-600 border-emerald-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                  >
                    Confirmados
                  </button>
                  <button 
                    onClick={() => setFilterTab('desestimados')}
                    className={`text-[9px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${filterTab === 'desestimados' ? 'text-rose-600 border-rose-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                  >
                    Desestimados
                  </button>
                </div>
                {globalConfig?.lastImportDate && (
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2">
                    Última Importación: <span className="text-indigo-500">{new Date(globalConfig.lastImportDate).toLocaleString("es-ES")}</span>
                  </p>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => { setFormData(DEFAULT_FORM_DATA); setCurrentView('create'); }}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  <i className="fas fa-pencil-alt"></i> Crear Manual
                </button>
                <button onClick={() => { setEmailContent(''); setShowEmailParseModal(true); }}
                  className="flex-1 sm:flex-none bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 py-2.5 rounded-xl transition-all text-sm font-bold flex items-center justify-center gap-2">
                  <i className="fas fa-envelope-open-text"></i> Parsear Email IA
                </button>
                <button onClick={() => window.location.href = 'AltaEmail.html'}
                  className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                  <i className="fas fa-sparkles"></i> Alta con IA
                </button>
              </div>
            </div>

            {/* Barra de Filtros */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-slate-50/30">
              <div className="relative w-full sm:w-80">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input 
                  type="text" 
                  placeholder="Buscar por grupo, agencia o ID..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                <i className="fas fa-calendar-alt text-slate-400 text-xs"></i>
                
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Desde:</span>
                  <input 
                    type="date" 
                    className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none w-[130px]"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hasta:</span>
                  <input 
                    type="date" 
                    className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none w-[130px]"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                {(startDate || endDate || searchTerm) && (
                  <button 
                    onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); }}
                    className="ml-2 p-1.5 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                    title="Limpiar filtros"
                  >
                    <i className="fas fa-times-circle"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1280px] xl:min-w-full table-fixed">
                <colgroup>
                  <col className="w-[27%]" />
                  <col className="w-[9%]" />
                  <col className="w-[7%]" />
                  <col className="w-[9%]" />
                  <col className="w-[7%]" />
                  <col className="w-[14%]" />
                  <col className="w-[14%]" />
                  <col className="w-[13%]" />
                </colgroup>
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="w-[27%] px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Grupo / Hotel</th>
                    <th className="w-[9%] px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Entrada</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Límite 7d</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Importe</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Pax / Hab</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Gestión</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {processedGroups.map(g => {
                    const totalAmount = g._totalAmount;
                    
                    let totalPaidFromPlan = 0;
                    try {
                      const plan = JSON.parse(g.PaymentPlan_JSON || "[]");
                      totalPaidFromPlan = plan
                        .filter(item => item.status === "Cobrado")
                        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
                    } catch(e) {}
                    const manualPaid = parseFloat(g.Com_Pagado || 0);
                    const totalPaid = Math.max(manualPaid, totalPaidFromPlan);
                    const pendingAmount = Math.max(0, totalAmount - totalPaid);

                    const hotelName = g.Hotel_Asignado || g.Hotel || "N/A";
                    const isCumbria = hotelName.toLowerCase().includes("cumbria");

                    const normalizedRooms = {};
                    Object.entries(g.roomCounts || {}).forEach(([t, c]) => {
                      if (c > 0) {
                        const lower = t.toLowerCase();
                        if (normalizedRooms[lower]) {
                          normalizedRooms[lower].count += Number(c);
                        } else {
                          normalizedRooms[lower] = { type: t, count: Number(c) };
                        }
                      }
                    });
                    const paxCount = g["Pax."] || 0;
                    const statusStyle = getBudgetStatusStyle(g.Com_Estado_Interno || g.Estado);

                    return (
                      <tr key={g.uid} className="hover:bg-slate-50/50 transition-colors group">
                        {/* Grupo / Hotel */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-slate-100 overflow-hidden p-1 shadow-sm group-hover:scale-105 transition-transform">
                              <img
                                src={hotelName.toLowerCase().includes('cumbria') ? "Logos/Cumbria Spa&Hotel.jpg" : "Logos/Sercotel Guadiana.jpg"}
                                className="w-full h-full object-contain"
                                alt="Hotel"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-black text-slate-800 uppercase leading-tight truncate group-hover:text-indigo-600 transition-colors">
                                {g["Nombre del Grupo"]}
                                <button 
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    const note = prompt("Añadir nota rápida de seguimiento:");
                                    if(note) addQuickNote(g.uid, note);
                                  }}
                                  className="group relative inline-flex items-center align-middle"
                                >
                                  { (g.Com_Notas || (g.tracking && g.tracking.length > 0)) ? (
                                    <i className="fas fa-comment-dots text-indigo-500 ml-2 text-xs" title={g.Com_Notas || "Ver seguimiento"}></i>
                                  ) : (
                                    <i className="far fa-comment text-slate-200 hover:text-indigo-400 ml-2 text-xs opacity-0 group-hover:opacity-100 transition-all" title="Añadir nota"></i>
                                  )}
                                </button>
                              </h4>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 opacity-60">
                                {hotelName} • ID: {g.Reserva}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Entrada */}
                        <td className="px-4 py-4">
                          <div 
                            onClick={() => window.location.href = `Gestion-de-Grupos.html?reserva=${g.Reserva}`}
                            className="inline-flex flex-col cursor-pointer hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all"
                          >
                            <span className="text-xs font-black text-slate-700">{formatDate(g.Entrada)}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Click p/ Gestión</span>
                          </div>
                        </td>

                        {/* Countdown 7d */}
                        <td className="px-4 py-4 text-center">
                          {(() => {
                            const created = g.createdAt?.seconds ? new Date(g.createdAt.seconds * 1000) : (g.createdAt ? new Date(g.createdAt) : null);
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

                        {/* Importe */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            {g.isRatesOnly ? (
                              <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-widest w-fit">Solo Tarifas</span>
                            ) : (
                              <>
                                <span className="text-sm font-black text-indigo-600 tracking-tight">{formatNum(totalAmount)}€</span>
                                {totalPaid > 0 && (
                                  <div className="flex gap-2 mt-1">
                                    <span className="text-[8px] font-black text-emerald-600 uppercase">P: {formatNum(totalPaid)}</span>
                                    <span className="text-[8px] font-black text-rose-600 uppercase">D: {formatNum(pendingAmount)}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        {/* Pax / Hab */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1 text-slate-700">
                              <i className="fas fa-users text-[10px]"></i>
                              <span className="text-xs font-black">{paxCount}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400">
                              <i className="fas fa-bed text-[10px]"></i>
                              {(() => {
                                const activeRooms = Object.values(normalizedRooms).map(v => [v.type, v.count]);
                                const totalRoomsNumeric = activeRooms.reduce((a, [_, b]) => a + Number(b), 0);
                                const roomsCountText = totalRoomsNumeric > 0 ? totalRoomsNumeric : (g["Cant. Habitaciones"] || g["Habitaciones"] || g["Cant."] || 0);
                                return <span className="text-[10px] font-bold">{roomsCountText}</span>;
                              })()}
                            </div>
                          </div>
                        </td>

                        {/* Gestión */}
                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-400">
                              <i className="fas fa-building text-[9px] w-3 text-center"></i>
                              <span className="text-[9px] font-bold uppercase">
                                {g["Empresa/Agencia"] || "Venta Directa"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-indigo-400">
                              <i className="fas fa-user-tie text-[9px] w-3 text-center"></i>
                              <span className="text-[9px] font-bold uppercase truncate max-w-[150px]" title="Comercial Asignado">
                                {g["Com_Comercial"] && g["Com_Comercial"].trim() !== "" ? g["Com_Comercial"] : "SIN ASIGNAR"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-4 text-center">
                          <div className="relative inline-flex items-center">
                            <i className={`fas ${statusStyle.icon} pointer-events-none absolute left-3 text-[9px] text-current z-10`}></i>
                            <select
                              value={(g.Com_Estado_Interno || g.Estado || '').toUpperCase()}
                              onChange={(e) => { e.stopPropagation(); updateStatus(g.uid, e.target.value); }}
                              onClick={(e) => e.stopPropagation()}
                              title="Cambiar estado"
                              className={`${statusStyle.select} pl-7 pr-6 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wide border outline-none cursor-pointer transition-all block mx-auto w-[142px] appearance-none text-center shadow-md focus:ring-4`}
                            >
                              <option value="PRESUPUESTO">Presupuesto</option>
                              <option value="ENVIADO">Enviado</option>
                              <option value="SEGUIMIENTO">Seguimiento</option>
                              <option value="CONFIRMADO">Confirmado</option>
                              <option value="CANCELADO">Cancelado</option>
                              <option value="DESESTIMADO">Desestimado</option>
                              <option value="CADUCADO">Caducado</option>
                            </select>
                            <i className="fas fa-chevron-down pointer-events-none absolute right-2.5 text-[8px] text-current"></i>
                          </div>
                        </td>

                        {/* Acciones */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); updateStatus(g.uid, 'CONFIRMADO'); }}
                              className="w-7 h-7 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-all"
                              title="Confirmar Grupo">
                              <i className="fas fa-check text-xs"></i>
                            </button>
                            <button onClick={() => { handleOpenDetail(normalizeGroupData(g)); }}
                              className="w-7 h-7 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
                              title="Ver Ficha">
                              <i className="fas fa-external-link-alt text-xs"></i>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setFormData(normalizeGroupData(g)); setCurrentView('create'); }}
                              className="w-7 h-7 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all"
                              title="Editar">
                              <i className="fas fa-edit text-xs"></i>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(g.uid); }}
                              className="w-7 h-7 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"
                              title="Eliminar">
                              <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {processedGroups.length === 0 && !loading && (
                <div className="py-20 text-center">
                  <i className="fas fa-database text-slate-200 text-4xl mb-4"></i>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay presupuestos para mostrar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );


    const renderCreate = () => {
        const stayDates = getCurrentStayDates(formData);
        const currentRooms = ROOM_TYPES[formData.Hotel_Asignado] || [];

        return (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header Alta/Edición */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-slate-800 transition-all border border-slate-100 flex-shrink-0">
                  <i className="fas fa-arrow-left"></i>
                </button>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">{formData.uid ? 'Editar Presupuesto' : 'Nueva Cotización de Grupo'}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Completa los campos para generar el documento</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Fase / Estado:</span>
                  <select 
                    value={formData.Com_Estado_Interno || 'PRESUPUESTO'} 
                    onChange={e => setFormData({ ...formData, Com_Estado_Interno: e.target.value })}
                    className="bg-amber-50 text-amber-700 border-none rounded-xl px-4 py-2 text-xs font-black outline-none ring-2 ring-amber-100 focus:ring-amber-300 transition-all cursor-pointer uppercase"
                  >
                    <option value="PRESUPUESTO">Presupuesto</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="SEGUIMIENTO">Seguimiento</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="CANCELADO">Cancelado</option>
                    <option value="DESESTIMADO">Desestimado</option>
                    <option value="CADUCADO">Caducado</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Hotel:</span>
                  <select 
                    value={formData.Hotel_Asignado} 
                    onChange={e => setFormData({ ...formData, Hotel_Asignado: e.target.value })}
                    className="bg-indigo-50 text-indigo-700 border-none rounded-xl px-4 py-2 text-xs font-black outline-none ring-2 ring-indigo-100 focus:ring-indigo-300 transition-all cursor-pointer"
                  >
                    <option value="Sercotel Guadiana">Sercotel Guadiana</option>
                    <option value="Cumbria Spa&Hotel">Cumbria Spa&Hotel</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Bloque 1: Información Básica */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <i className="fas fa-info-circle text-[10px]"></i>
                  </div>
                  <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">1. Información del Grupo y Cliente</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Grupo / Evento</label>
                    <input 
                      type="text" 
                      value={formData["Nombre del Grupo"]} 
                      onChange={e => setFormData({ ...formData, "Nombre del Grupo": e.target.value })}
                      placeholder="Ej: Boda García-Pérez o Grupo Jubilados..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa / Agencia</label>
                    <input 
                      type="text" 
                      value={formData["Empresa/Agencia"]} 
                      onChange={e => setFormData({ ...formData, "Empresa/Agencia": e.target.value })}
                      placeholder="Nombre de la agencia o empresa..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de Contacto</label>
                    <input 
                      type="text" 
                      value={formData.Com_Nombre_Contacto} 
                      onChange={e => setFormData({ ...formData, Com_Nombre_Contacto: e.target.value })}
                      placeholder="Persona de contacto..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input 
                      type="email" 
                      value={formData.Com_Email_Contacto} 
                      onChange={e => setFormData({ ...formData, Com_Email_Contacto: e.target.value })}
                      placeholder="email@ejemplo.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                    <input 
                      type="text" 
                      value={formData.Com_Telefono_Contacto} 
                      onChange={e => setFormData({ ...formData, Com_Telefono_Contacto: e.target.value })}
                      placeholder="Número de teléfono..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
                    />
                  </div>
                </div>

                {!formData.isMultiSegment ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Entrada</label>
                      <input 
                        type="date" 
                        value={toInputDate(formData.Entrada)} 
                        onChange={e => setFormData({ ...formData, Entrada: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha Salida</label>
                      <input 
                        type="date" 
                        value={toInputDate(formData.Salida)} 
                        onChange={e => setFormData({ ...formData, Salida: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pax Estimados</label>
                      <input 
                        type="number" 
                        min="0"
                        value={formData["Pax."] || ''} 
                        onChange={e => setFormData({ ...formData, "Pax.": e.target.value === '' ? '' : Number(e.target.value) })}
                        disabled={!formData.isRatesOnly}
                        placeholder={!formData.isRatesOnly ? "Auto-calculado" : "Ej: 33"}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 disabled:opacity-60"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-2">
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="text-[9px] font-black text-slate-800 uppercase tracking-widest ml-1">Segmentos de Estancia</label>
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PAX Declarados (Cliente):</span>
                          <input 
                            type="number" 
                            min="0"
                            value={formData.declaredPax || ''} 
                            onChange={e => setFormData({ ...formData, declaredPax: e.target.value === '' ? '' : Number(e.target.value) })}
                            placeholder="Ej: 9"
                            className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 text-center"
                            title="Número total de personas declaradas por el cliente en el email"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextLetter = String.fromCharCode(65 + (formData.segments?.length || 0));
                          const nextIdx = (formData.segments?.length || 0) + 1;
                          const newSeg = {
                            id: nextLetter,
                            travelerGroupId: `G${nextIdx}`,
                            pax: 1,
                            rooms: 1,
                            roomType: 'DOBLE DE USO INDIVIDUAL',
                            in: '',
                            out: '',
                            notes: ''
                          };
                          setFormData({
                            ...formData,
                            segments: [...(formData.segments || []), newSeg]
                          });
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 self-end sm:self-auto"
                      >
                        <i className="fas fa-plus"></i> Añadir Segmento
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest w-12 text-center">ID</th>
                            <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Grupo</th>
                            <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Distribución de habitaciones</th>
                            <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest w-36">Entrada</th>
                            <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest w-36">Salida</th>
                            <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Notas / Ocupantes</th>
                            <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest w-12 text-center"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.segments?.map((seg, idx) => (
                            <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                              <td className="p-2 text-center text-xs font-black text-slate-600">{seg.id}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={seg.travelerGroupId || ''}
                                  placeholder="Ej: G1"
                                  onChange={e => {
                                    const val = e.target.value;
                                    const updated = [...(formData.segments || [])];
                                    updated[idx] = { ...updated[idx], travelerGroupId: val };
                                    setFormData({ ...formData, segments: updated });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-bold text-center text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                                />
                              </td>
                              <td className="p-2 align-top pt-3">
                                <div className="space-y-2">
                                  {(() => {
                                    const allocs = (seg.roomAllocations && seg.roomAllocations.length > 0)
                                      ? seg.roomAllocations
                                      : [{ pax: seg.pax || 1, rooms: seg.rooms || 1, roomType: seg.roomType || 'DOBLE DE USO INDIVIDUAL' }];
                                    
                                    const updateAllocs = (newAllocs) => {
                                      const updated = [...(formData.segments || [])];
                                      const totalPax = newAllocs.reduce((sum, a) => sum + Number(a.pax || 0), 0);
                                      const totalRooms = newAllocs.reduce((sum, a) => sum + Number(a.rooms || 0), 0);
                                      updated[idx] = { 
                                        ...updated[idx], 
                                        roomAllocations: newAllocs, 
                                        pax: totalPax, 
                                        rooms: totalRooms, 
                                        roomType: newAllocs[0]?.roomType || 'DOBLE DE USO INDIVIDUAL' 
                                      };
                                      setFormData({ ...formData, segments: updated });
                                    };

                                    return (
                                      <>
                                        {allocs.map((alloc, aIdx) => (
                                          <div key={aIdx} className="flex gap-2 items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                                            <input
                                              type="number"
                                              min="1"
                                              value={alloc.pax}
                                              onChange={e => {
                                                const val = Math.max(1, Number(e.target.value));
                                                const newAllocs = [...allocs];
                                                newAllocs[aIdx] = { ...newAllocs[aIdx], pax: val };
                                                updateAllocs(newAllocs);
                                              }}
                                              className="w-14 bg-slate-50 border border-slate-100 rounded-md p-1.5 text-xs font-bold text-center text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            />
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">pax</span>
                                            <span className="text-slate-300">·</span>
                                            <input
                                              type="number"
                                              min="1"
                                              value={alloc.rooms}
                                              onChange={e => {
                                                const val = Math.max(1, Number(e.target.value));
                                                const newAllocs = [...allocs];
                                                newAllocs[aIdx] = { ...newAllocs[aIdx], rooms: val };
                                                updateAllocs(newAllocs);
                                              }}
                                              className="w-14 bg-slate-50 border border-slate-100 rounded-md p-1.5 text-xs font-bold text-center text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                            />
                                            <span className="text-[9px] text-slate-400 font-bold uppercase">hab</span>
                                            <span className="text-slate-300">·</span>
                                            <select
                                              value={alloc.roomType || 'DOBLE DE USO INDIVIDUAL'}
                                              onChange={e => {
                                                const val = e.target.value;
                                                const newAllocs = [...allocs];
                                                newAllocs[aIdx] = { ...newAllocs[aIdx], roomType: val };
                                                updateAllocs(newAllocs);
                                              }}
                                              className="flex-1 bg-slate-50 border border-slate-100 rounded-md p-1.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer min-w-[140px]"
                                            >
                                              {currentRooms.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                              ))}
                                            </select>
                                            {allocs.length > 1 && (
                                              <button
                                                onClick={() => {
                                                  const newAllocs = allocs.filter((_, i) => i !== aIdx);
                                                  updateAllocs(newAllocs);
                                                }}
                                                className="text-slate-300 hover:text-rose-500 px-1 transition-colors"
                                                title="Eliminar esta asignación"
                                              >
                                                <i className="fas fa-times"></i>
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                        <button
                                          onClick={() => {
                                            const newAllocs = [...allocs, { pax: 1, rooms: 1, roomType: 'DOBLE DE USO INDIVIDUAL' }];
                                            updateAllocs(newAllocs);
                                          }}
                                          className="text-[9px] font-black uppercase text-indigo-500 hover:text-indigo-700 mt-2 ml-1 flex items-center gap-1.5 transition-colors"
                                        >
                                          <i className="fas fa-plus"></i> Añadir tipo de habitación
                                        </button>
                                      </>
                                    );
                                  })()}
                                </div>
                              </td>
                              <td className="p-2">
                                <input
                                  type="date"
                                  value={toInputDate(seg.in)}
                                  onChange={e => {
                                    const val = e.target.value;
                                    const updated = [...(formData.segments || [])];
                                    updated[idx] = { ...updated[idx], in: val };
                                    setFormData({ ...formData, segments: updated });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="date"
                                  value={toInputDate(seg.out)}
                                  onChange={e => {
                                    const val = e.target.value;
                                    const updated = [...(formData.segments || [])];
                                    updated[idx] = { ...updated[idx], out: val };
                                    setFormData({ ...formData, segments: updated });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={seg.notes || ''}
                                  placeholder="Ej: Ocupante / Peticiones"
                                  onChange={e => {
                                    const val = e.target.value;
                                    const updated = [...(formData.segments || [])];
                                    updated[idx] = { ...updated[idx], notes: val };
                                    setFormData({ ...formData, segments: updated });
                                  }}
                                  className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = (formData.segments || []).filter((_, i) => i !== idx).map((s, i) => ({
                                      ...s,
                                      id: String.fromCharCode(65 + i)
                                    }));
                                    setFormData({ ...formData, segments: updated });
                                  }}
                                  className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-all mx-auto"
                                >
                                  <i className="fas fa-trash-alt text-xs"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {formData.segments && formData.segments.length > 0 && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {(() => {
                          const stats = getSegmentStats(formData.segments);
                          return (
                            <>
                              <div>Total Pax: <span className="text-indigo-600">{stats.totalPax} pax</span></div>
                              <div>Habitaciones-Noche: <span className="text-indigo-600">{stats.roomNights} hab-noc</span></div>
                              <div>Máxima Ocupación: <span className="text-indigo-600">{stats.maxSimultaneous} hab. simultáneas</span></div>
                              <div>Rango: <span className="text-indigo-600">{stats.globalIn ? formatDate(stats.globalIn) : '---'} al {stats.globalOut ? formatDate(stats.globalOut) : '---'} ({stats.nights} noches)</span></div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">¿Varios segmentos / Fechas de estancia?</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newIsMulti = !formData.isMultiSegment;
                        let updated = { ...formData, isMultiSegment: newIsMulti };
                        if (newIsMulti) {
                          if (!formData.segments || formData.segments.length === 0) {
                            updated.segments = [{ id: 'A', travelerGroupId: 'G1', pax: 1, rooms: 1, roomType: 'DOBLE DE USO INDIVIDUAL', in: formData.Entrada || '', out: formData.Salida || '', notes: '' }];
                          }
                          // In multi-segment mode, getSegmentStats handles Pax.
                          const stats = getSegmentStats(updated.segments);
                          updated["Pax."] = stats.totalPax;
                        } else {
                          if (!formData.isRatesOnly) {
                            const totalPax = Object.entries(updated.roomCounts || {}).reduce((sum, [roomType, count]) => {
                              return sum + (Number(count) || 0) * (PAX_PER_ROOM[roomType] || 2);
                            }, 0);
                            if (totalPax > 0) updated["Pax."] = totalPax;
                          }
                        }
                        setFormData(updated);
                      }}
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${formData.isMultiSegment ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {formData.isMultiSegment ? 'SÍ (Multi-Segmento)' : 'NO (Fecha Única)'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modo de Cotización */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <i className="fas fa-sliders-h text-[12px]"></i>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">Modo de Cotización</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Selecciona cómo deseas presupuestar al grupo</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleToDistribution}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!formData.isRatesOnly ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                  >
                    Con Distribución
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isRatesOnly: true, ratesOnlyGrid: formData.ratesOnlyGrid || {} })}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.isRatesOnly ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                  >
                    Solo Tarifas (Grid)
                  </button>
                </div>
              </div>

              {!formData.isRatesOnly ? (
                <>
                  {/* Bloque 2: Tipología de Habitaciones */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <i className="fas fa-bed text-[10px]"></i>
                      </div>
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">2. Tipología y Cupo de Habitaciones</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {currentRooms.map(type => (
                        <div key={type} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 group hover:border-emerald-200 transition-all">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block truncate" title={type}>{type}</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              min="0"
                              value={formData.roomCounts?.[type] || ''} 
                              onChange={e => handleRoomCountChange(type, e.target.value)}
                              placeholder="0"
                              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-700"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 font-bold uppercase tracking-widest">Hab</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bloque 3: Tarifas Detalladas (si hay fechas) */}
                  {stayDates.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-6 animate-slide-up">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                            <i className="fas fa-calendar-day text-[10px]"></i>
                          </div>
                          <div>
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">3. Tarifas por Noche</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={handleCopyFirstDay}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all focus:scale-95"
                            title="Copiar precios y cupos del primer día a todos los siguientes"
                          >
                            <i className="fas fa-copy"></i> Copiar 1º Día a Todos
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {stayDates.map(date => {
                          const selectedTypes = formData.isMultiSegment
                            ? Array.from(new Set(
                                (formData.segments || []).flatMap(s => {
                                  const allocations = Array.isArray(s.roomAllocations) && s.roomAllocations.length > 0
                                    ? s.roomAllocations
                                    : [{ roomType: s.roomType || "DOBLE DE USO INDIVIDUAL" }];
                                  return allocations.map(a => (a.roomType || 'DOBLE DE USO INDIVIDUAL').toUpperCase());
                                })
                              ))
                            : currentRooms.filter(type => (formData.roomCounts || {})[type] > 0);
                          return (
                            <div key={date} className="group bg-slate-50/50 rounded-xl p-3 border border-slate-100 hover:border-indigo-200 transition-all flex flex-row flex-wrap gap-3 items-center">
                              <div className="shrink-0 w-24 flex flex-col gap-1">
                                <span className="bg-slate-800 text-white px-2 py-1 rounded text-[8px] font-black w-fit uppercase tracking-widest">{formatDate(date)}</span>
                              </div>

                              <div className="flex-1 flex flex-wrap gap-2 items-center">
                                {selectedTypes.map(type => {
                                  const dailyCounts = formData.dailyConfig?.[date]?.counts || {};
                                  const countVal = formData.isMultiSegment
                                    ? (() => {
                                        const segmentCountsByDate = buildDailyCountsFromSegments(formData.segments);
                                        return segmentCountsByDate[date]?.[type.toUpperCase()] || 0;
                                      })()
                                    : (dailyCounts[type] !== undefined ? dailyCounts[type] : (formData.roomCounts || {})[type] || '');
                                  return (
                                    <div key={type} className="flex flex-col gap-0.5 min-w-[120px]">
                                      <label className="text-[7px] font-black text-slate-500 uppercase truncate px-1" title={type}>{type}</label>
                                      <div className="relative group flex gap-1 items-center">
                                        <input
                                          type="number"
                                          value={countVal}
                                          disabled={formData.isMultiSegment}
                                          onChange={e => handleDailyConfigChange(date, 'counts', e.target.value, type)}
                                          className="w-10 px-1 py-1.5 bg-white border border-slate-200 rounded-md text-[10px] font-black text-center outline-none focus:ring-1 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all [&::-webkit-inner-spin-button]:appearance-none disabled:bg-slate-100 disabled:text-slate-500"
                                          placeholder="Cant."
                                          title={formData.isMultiSegment ? "Calculado automáticamente desde segmentos" : "Cantidad de habitaciones"}
                                        />
                                        <span className="text-[10px] text-slate-400 font-bold mx-0.5">x</span>
                                        <div className="relative group flex w-[68px]">
                                          <input
                                            type="number"
                                            value={(formData.dailyConfig?.[date]?.prices || {})[type] || ''}
                                            onChange={e => handleDailyConfigChange(date, 'prices', e.target.value, type)}
                                            className="w-full pl-2 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-[10px] font-black text-center outline-none focus:ring-1 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all [&::-webkit-inner-spin-button]:appearance-none"
                                            placeholder="0"
                                            title="Precio"
                                          />
                                          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-black">€</span>
                                        </div>
                                        <div className="relative group flex w-12 ml-0.5 items-center border border-emerald-100 rounded-md bg-emerald-50 px-1 py-1" title="Gratuidades (Habitaciones Gratis)">
                                          <span className="text-[7px] font-black leading-none text-emerald-500 mr-0.5 uppercase tracking-tighter">Grat.</span>
                                          <input
                                            type="number"
                                            min="0"
                                            value={(formData.dailyConfig?.[date]?.gratuities || {})[type] || ''}
                                            onChange={e => handleDailyConfigChange(date, 'gratuities', e.target.value, type)}
                                            className="w-full bg-transparent text-[10px] font-black text-center outline-none text-emerald-700 [&::-webkit-inner-spin-button]:appearance-none placeholder:text-emerald-300"
                                            placeholder="0"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>

                              <div className="shrink-0 w-32 flex flex-col gap-0.5">
                                <label className="text-[7px] font-black text-indigo-500 uppercase px-1">Régimen</label>
                                <select
                                  value={formData.dailyConfig?.[date]?.board || 'AD (Alojamiento y Desayuno)'}
                                  onChange={e => handleDailyConfigChange(date, 'board', e.target.value)}
                                  className="w-full bg-indigo-50/30 border border-indigo-100 text-indigo-700 rounded-md px-2 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-indigo-500/10 transition-all cursor-pointer"
                                >
                                  {BOARD_TYPES.map(board => <option key={board} value={board}>{board.split(' ')[0]}</option>)}
                                </select>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Bloque 2: Tarifas por Régimen y Habitación (Modo Grid) */
                <div 
                  className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                  tabIndex="0"
                  onPaste={(e) => {
                    const text = e.clipboardData.getData('text/plain');
                    if (text) {
                      e.preventDefault();
                      handlePasteTarifas(text);
                    }
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-4 gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                          <i className="fas fa-tags text-[10px]"></i>
                        </div>
                        <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">2. Tarifas por Régimen y Habitación</h3>
                      </div>
                      <p className="text-[9px] text-slate-400 font-medium ml-9">
                        Puedes copiar una tabla desde Excel o Word y pegarla aquí para rellenar las tarifas automáticamente.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {(formData.hiddenGridRows?.length > 0 || formData.hiddenGridCols?.length > 0) && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, hiddenGridRows: [], hiddenGridCols: [] })}
                          className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-sm outline-none"
                          title="Restaurar filas y columnas ocultas"
                        >
                          <i className="fas fa-undo"></i>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handlePasteTarifas()}
                        className="px-4 py-2 bg-indigo-50/50 hover:bg-indigo-100/80 text-indigo-600 border border-indigo-100 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm whitespace-nowrap focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        title="Copiar una tabla de Excel o Word y pulsar aquí para pegar"
                      >
                        <i className="fas fa-paste text-indigo-500"></i> Pegar tabla
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest border-b border-slate-100">
                          <th className="p-4 pl-8">Régimen</th>
                          {currentRooms.filter(r => !(formData.hiddenGridCols || []).includes(r)).map(room => (
                            <th key={room} className="p-4 text-center group relative">
                              {room}
                              <button 
                                onClick={() => setFormData({ ...formData, hiddenGridCols: [...(formData.hiddenGridCols || []), room] })}
                                className="absolute top-1/2 -translate-y-1/2 right-2 w-5 h-5 bg-rose-50 text-rose-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-rose-100"
                                title="Ocultar columna"
                              >
                                <i className="fas fa-times text-[10px]"></i>
                              </button>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {BOARD_TYPES.filter(b => !(formData.hiddenGridRows || []).includes(b.split(' ')[0])).map(board => {
                          const boardKey = board.split(' ')[0]; // E.g., "AD", "MP", "PC", "SA"
                          return (
                            <tr key={board} className="group">
                              <td className="p-4 pl-8 font-bold text-slate-700 relative">
                                <button 
                                  onClick={() => setFormData({ ...formData, hiddenGridRows: [...(formData.hiddenGridRows || []), boardKey] })}
                                  className="absolute top-1/2 -translate-y-1/2 left-2 w-5 h-5 bg-rose-50 text-rose-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-rose-100"
                                  title="Ocultar fila"
                                >
                                  <i className="fas fa-times text-[10px]"></i>
                                </button>
                                {board}
                              </td>
                              {currentRooms.filter(r => !(formData.hiddenGridCols || []).includes(r)).map(room => {
                                const priceVal = formData.ratesOnlyGrid?.[boardKey]?.[room] || '';
                                return (
                                  <td key={room} className="p-4">
                                    <div className="relative max-w-[150px] mx-auto">
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={priceVal}
                                        onChange={e => {
                                          const grid = { ...formData.ratesOnlyGrid };
                                          if (!grid[boardKey]) grid[boardKey] = {};
                                          grid[boardKey][room] = e.target.value;
                                          setFormData({ ...formData, ratesOnlyGrid: grid });
                                        }}
                                        placeholder="0.00"
                                        className="w-full pl-2 pr-6 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-center outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-700"
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">€</span>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Bloque 4: Descuentos y Suplementos Globales */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                      <i className="fas fa-tags text-[10px]"></i>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">4. Descuentos y Suplementos</h3>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Suplementos Totales (€)</label>
                    <div className="relative group">
                      <input
                        type="number"
                        value={formData.Suplementos || ''}
                        onChange={e => setFormData({ ...formData, Suplementos: e.target.value })}
                        className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-indigo-600"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black">€</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descuento Global (€)</label>
                    <div className="relative group">
                      <input
                        type="number"
                        value={formData.Descuentos || ''}
                        onChange={e => setFormData({ ...formData, Descuentos: e.target.value })}
                        className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-rose-600"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black">€</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloque 4.1: Condiciones de pago */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-4">
                {(() => {
                  const total = calculateTotal(formData);
                  const plan = normalizePaymentPlan(formData.PaymentPlan_JSON, total, formData);
                  const updatePlan = (nextPlan) => {
                    setFormData({ ...formData, PaymentPlan_JSON: JSON.stringify(normalizePaymentPlan(nextPlan, total, formData)) });
                  };
                  const setQuickPercent = (percent) => {
                    setFormData({ ...formData, PaymentPlan_JSON: JSON.stringify(buildPaymentPlan(percent, total, formData)) });
                  };
                  const updateRow = (idx, field, value) => {
                    const nextPlan = plan.length > 0 ? [...plan] : buildPaymentPlan(30, total, formData);
                    nextPlan[idx] = { ...nextPlan[idx], [field]: value };
                    if (field === "amount") {
                      nextPlan[idx].manual = true;
                      nextPlan[idx].amount = cents(value).toFixed(2);
                      nextPlan[idx].percent = total > 0 ? cents((parseFloat(nextPlan[idx].amount) / total) * 100) : 0;
                    }
                    if (field === "percent") {
                      nextPlan[idx].manual = false;
                      nextPlan[idx].percent = parseFloat(value) || 0;
                    }
                    updatePlan(nextPlan);
                  };

                  return (
                    <>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                            <i className="fas fa-credit-card text-[10px]"></i>
                          </div>
                          <div>
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">4.1 Condiciones de pago</h3>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[20, 30, 50, 100].map(percent => (
                            <button key={percent} type="button" onClick={() => setQuickPercent(percent)} className="px-3 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-100 rounded-xl text-[9px] font-black transition-all">
                              {percent}%
                            </button>
                          ))}
                        </div>
                      </div>

                      {plan.length === 0 ? (
                        <button type="button" onClick={() => setQuickPercent(30)} className="w-full py-3 border border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-300 hover:text-indigo-500 transition-all">
                          Crear condiciones de pago
                        </button>
                      ) : (
                        <div className="space-y-3">
                          {plan.map((row, idx) => (
                            <div key={row.id || idx} className="grid grid-cols-1 md:grid-cols-[1.5fr_90px_120px_150px_1.2fr_80px] gap-2 items-end bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Concepto</label>
                                <input type="text" value={row.label || ""} onChange={e => updateRow(idx, "label", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-indigo-400" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">%</label>
                                <input type="number" step="0.01" value={row.percent || 0} onChange={e => updateRow(idx, "percent", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-black text-slate-700 outline-none focus:border-indigo-400 text-right" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Importe</label>
                                <input type="number" step="0.01" value={row.amount || 0} onChange={e => updateRow(idx, "amount", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-black text-slate-700 outline-none focus:border-indigo-400 text-right" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fecha límite</label>
                                <input type="date" value={toInputDate(row.date)} onChange={e => updateRow(idx, "date", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-indigo-400" />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Observaciones</label>
                                <input type="text" value={row.observations || ""} onChange={e => updateRow(idx, "observations", e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-indigo-400" />
                              </div>
                              <label className="flex items-center justify-center gap-1.5 h-9 bg-white border border-slate-200 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400">
                                <input type="checkbox" checked={!!row.manual} onChange={e => updateRow(idx, "manual", e.target.checked)} />
                                Manual
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Bloque 4.5: Otros Cargos / Extras */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-500 flex items-center justify-center">
                      <i className="fas fa-plus-circle text-[10px]"></i>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">4.5 Otros Cargos / Extras</h3>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      const newExtras = [...(formData.extraCharges || []), { id: Date.now(), date: '', concept: '', units: 0, pax: 0, unitPrice: 0, price: 0 }];
                      setFormData({ ...formData, extraCharges: newExtras });
                    }}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-600 px-3 py-1.5 rounded-lg border border-teal-100 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    <i className="fas fa-plus"></i> Añadir Cargo
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.extraCharges || []).map((extra, index) => (
                    <div key={extra.id} className="flex gap-2 items-center group">
                      <div className="w-[130px] relative">
                        <select
                          value={extra.date || ''}
                          onChange={(e) => {
                             const newExtras = [...formData.extraCharges];
                             newExtras[index].date = e.target.value;
                             setFormData({ ...formData, extraCharges: newExtras });
                          }}
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 text-[11px] font-black outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-slate-700"
                        >
                          <option value="">Global / Todas</option>
                          {stayDates.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-[150px] relative">
                        <input 
                          type="text" 
                          value={extra.concept}
                          onChange={(e) => {
                             const newExtras = [...formData.extraCharges];
                             newExtras[index].concept = e.target.value;
                             setFormData({ ...formData, extraCharges: newExtras });
                          }}
                          placeholder="Concepto (ej: Almuerzo...)"
                          className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-black outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-slate-700"
                        />
                      </div>
                      {/* Uds */}
                      <div className="w-14 relative">
                        <input
                          type="number"
                          min="0"
                          value={extra.units !== undefined ? extra.units : ''}
                          onChange={(e) => {
                             const newExtras = [...formData.extraCharges];
                             const u = Number(e.target.value) || 0;
                             newExtras[index].units = u;
                             const up = newExtras[index].unitPrice || 0;
                             newExtras[index].price = u * up;
                             setFormData({ ...formData, extraCharges: newExtras });
                          }}
                          placeholder="Uds"
                          className="w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-black outline-none transition-all text-center"
                        />
                      </div>
                      {/* Unit Price */}
                      <div className="w-20 md:w-24 relative">
                        <input 
                          type="number" 
                          step="0.01"
                          value={extra.unitPrice !== undefined ? extra.unitPrice : 0}
                          onChange={(e) => {
                             const newExtras = [...formData.extraCharges];
                             const up = parseFloat(e.target.value) || 0;
                             newExtras[index].unitPrice = up;
                             const u = newExtras[index].units || 0;
                             const pax = newExtras[index].pax || 0;
                             const activeQty = u > 0 ? u : pax;
                             newExtras[index].price = activeQty * up;
                             setFormData({ ...formData, extraCharges: newExtras });
                          }}
                          placeholder="0.00"
                          className="w-full pl-2 pr-5 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-black outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-slate-700 text-right"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold">€</span>
                      </div>
                      <div className="w-20 md:w-24 px-2 py-2 bg-teal-50/50 border border-teal-100 rounded-lg text-[11px] font-black text-teal-700 text-right">
                        {formatNum((extra.units || extra.pax || 0) * (extra.unitPrice || 0))} €
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                           const newExtras = formData.extraCharges.filter((_, i) => i !== index);
                           setFormData({ ...formData, extraCharges: newExtras });
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex-shrink-0"
                      >
                        <i className="fas fa-trash text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloque 5: Cláusulas de Documentos (Presupuesto y Confirmación) */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                    <i className="fas fa-file-signature text-[10px]"></i>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">5. Cláusulas de Documentos</h3>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Define las condiciones legales para este grupo</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Columna Presupuesto */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <i className="fas fa-file-invoice text-indigo-400"></i> Presupuesto
                       </h4>
                       <button 
                         type="button"
                         onClick={() => {
                           const current = (Array.isArray(formData.clauses) && formData.clauses.length > 0) ? formData.clauses : BUDGET_DEFAULT_CLAUSES;
                           setFormData({ ...formData, clauses: [...current, { title: "Nueva Cláusula", body: "" }] });
                         }}
                         className="text-[8px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                       >
                         + Añadir
                       </button>
                    </div>
                    <div className="space-y-3">
                      {(Array.isArray(formData.clauses) && formData.clauses.length > 0 ? formData.clauses : BUDGET_DEFAULT_CLAUSES).map((c, i) => (
                        <div key={i} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 relative group">
                          <input 
                            type="text" 
                            value={c.title} 
                            onChange={e => {
                               const n = [...((Array.isArray(formData.clauses) && formData.clauses.length > 0) ? formData.clauses : BUDGET_DEFAULT_CLAUSES)];
                               n[i].title = e.target.value;
                               setFormData({ ...formData, clauses: n });
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[9px] font-black text-slate-800 outline-none focus:border-indigo-400"
                            placeholder="Título de la cláusula"
                          />
                          <textarea 
                            value={c.body} 
                            onChange={e => {
                               const n = [...((Array.isArray(formData.clauses) && formData.clauses.length > 0) ? formData.clauses : BUDGET_DEFAULT_CLAUSES)];
                               n[i].body = e.target.value;
                               setFormData({ ...formData, clauses: n });
                            }}
                            rows="2" 
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[9px] text-slate-600 outline-none focus:border-indigo-400 resize-none font-medium"
                            placeholder="Contenido..."
                          />
                          <button 
                            type="button"
                            onClick={() => {
                               const n = ((Array.isArray(formData.clauses) && formData.clauses.length > 0) ? formData.clauses : BUDGET_DEFAULT_CLAUSES).filter((_, idx) => idx !== i);
                               setFormData({ ...formData, clauses: n });
                            }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <i className="fas fa-times text-[8px]"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Columna Confirmación */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <i className="fas fa-file-check text-emerald-500"></i> Confirmación
                       </h4>
                       <button 
                         type="button"
                         onClick={() => {
                           const current = (Array.isArray(formData.clauses_conf) && formData.clauses_conf.length > 0) ? formData.clauses_conf : CONF_DEFAULT_CLAUSES;
                           setFormData({ ...formData, clauses_conf: [...current, { title: "Nueva Cláusula Conf.", body: "" }] });
                         }}
                         className="text-[8px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                       >
                         + Añadir
                       </button>
                    </div>
                    <div className="space-y-3">
                      {(Array.isArray(formData.clauses_conf) && formData.clauses_conf.length > 0 ? formData.clauses_conf : CONF_DEFAULT_CLAUSES).map((c, i) => (
                        <div key={i} className="bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/50 space-y-2 relative group">
                          <input 
                            type="text" 
                            value={c.title} 
                            onChange={e => {
                               const n = [...((Array.isArray(formData.clauses_conf) && formData.clauses_conf.length > 0) ? formData.clauses_conf : CONF_DEFAULT_CLAUSES)];
                               n[i].title = e.target.value;
                               setFormData({ ...formData, clauses_conf: n });
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[9px] font-black text-slate-800 outline-none focus:border-emerald-400"
                            placeholder="Título de la cláusula"
                          />
                          <textarea 
                            value={c.body} 
                            onChange={e => {
                               const n = [...((formData.clauses_conf && formData.clauses_conf.length > 0) ? formData.clauses_conf : CONF_DEFAULT_CLAUSES)];
                               n[i].body = e.target.value;
                               setFormData({ ...formData, clauses_conf: n });
                            }}
                            rows="2" 
                            className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[9px] text-slate-600 outline-none focus:border-emerald-400 resize-none font-medium"
                            placeholder="Contenido..."
                          />
                          <button 
                            type="button"
                            onClick={() => {
                               const n = ((formData.clauses_conf && formData.clauses_conf.length > 0) ? formData.clauses_conf : CONF_DEFAULT_CLAUSES).filter((_, idx) => idx !== i);
                               setFormData({ ...formData, clauses_conf: n });
                            }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <i className="fas fa-times text-[8px]"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloque 6: Notas Internas */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                    <i className="fas fa-notes-medical text-[10px]"></i>
                  </div>
                  <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">6. Notas Internas & Seguimiento</h3>
                </div>
                <textarea
                  value={formData.Com_Notas}
                  onChange={e => setFormData({ ...formData, Com_Notas: e.target.value })}
                  placeholder="Añade detalles relevantes..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-medium text-slate-600 outline-none focus:border-indigo-500 min-h-[80px] resize-none transition-all shadow-sm"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentView('dashboard')}
                  className="px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-200/50"
                >
                  Guardar Cotización
                </button>
              </div>
            </div>
          </div>
        );
      };



      const HOTEL_DEFAULTS = {
        guadiana: {
          address: 'C/ Guadiana, 36',
          city: '13002 - Ciudad Real (España)',
          phone: '926 22 33 13',
          email: 'info@hotelguadiana.es',
          web: 'www.hotelguadiana.es'
        },
        cumbria: {
          address: 'Ctra. Toledo, 26',
          city: '13005 - Ciudad Real (España)',
          phone: '(+34) 926 25 04 04',
          email: 'recepcion@hotelcumbria.es',
          web: 'www.hotelcumbria.es'
        }
      };

  const renderDetail = () => {
        if (!selectedGroup) return null;
        const g = normalizeGroupData(selectedGroup);

        const calculatedTotal = calculateTotal(g);
        const hotelName = g.Hotel_Asignado || g.Hotel || "N/A";
        const isCumbria = hotelName.toLowerCase().includes("cumbria");
        const currentRooms = ROOM_TYPES[g.Hotel_Asignado] || [];
        const hotelKey = isCumbria ? 'cumbria' : 'guadiana';
        const modeKey = docMode === 'confirmacion' ? 'confirmationClauses' : 'clauses';
        const groupKey = docMode === 'confirmacion' ? 'clauses_conf' : 'clauses';
        const documentPaymentPlan = normalizePaymentPlan(g.PaymentPlan_JSON, calculatedTotal, g);

        // Lógica de Fallback Multinivel para Cláusulas
        const getEffectiveClauses = () => {
          if (Array.isArray(g[groupKey]) && g[groupKey].length > 0) return g[groupKey];
          if (globalConfig && globalConfig[hotelKey] && Array.isArray(globalConfig[hotelKey][modeKey]) && globalConfig[hotelKey][modeKey].length > 0) return globalConfig[hotelKey][modeKey];
          if (globalConfig && globalConfig.common && Array.isArray(globalConfig.common[modeKey]) && globalConfig.common[modeKey].length > 0) return globalConfig.common[modeKey];
          return docMode === 'confirmacion' ? CONF_DEFAULT_CLAUSES : BUDGET_DEFAULT_CLAUSES;
        };
        const effectiveClauses = getEffectiveClauses();

        // Función auxiliar para reemplazo de variables
        const parseClauseVariables = (text, title = "") => {
          if (!text) return "";
          let parsed = text;

          // Cargar plan de pagos
          let plan = [];
          try {
            plan = JSON.parse(g.PaymentPlan_JSON || "[]");
          } catch(e){}

          const t = title.toLowerCase();
          const isDepositOrPayment = t.includes("depósito") || t.includes("deposito") || t.includes("pago") || t.includes("confirmaci");

          if (plan && plan.length > 0 && isDepositOrPayment) {
            const firstPayment = plan[0];
            const secondPayment = plan[1];

            // Reemplazar 30% estático con el depósito real
            if (calculatedTotal > 0) {
              parsed = parsed.replace(/30\s*%/g, firstPayment.percent + "% (" + formatNum(firstPayment.amount) + "€)");
              parsed = parsed.replace(/{DEP_30}/g, firstPayment.percent + "% (" + formatNum(firstPayment.amount) + "€)");
            } else {
              parsed = parsed.replace(/30\s*%/g, firstPayment.percent + "%");
              parsed = parsed.replace(/{DEP_30}/g, firstPayment.percent + "%");
            }

            if (secondPayment) {
              // Reemplazar 7 días o 7 dias con la antelación real
              parsed = parsed.replace(/7\s*días/gi, secondPayment.releaseDays + " días");
              parsed = parsed.replace(/7\s*dias/gi, secondPayment.releaseDays + " días");
              parsed = parsed.replace(/{RELEASE_7}/g, secondPayment.releaseDays + " días");

              // Reemplazar 50% o 100% estático con el segundo pago real
              if (calculatedTotal > 0) {
                parsed = parsed.replace(/50\s*%/g, secondPayment.percent + "% (" + formatNum(secondPayment.amount) + "€)");
                parsed = parsed.replace(/{DEP_50}/g, secondPayment.percent + "% (" + formatNum(secondPayment.amount) + "€)");
                parsed = parsed.replace(/100\s*%/g, secondPayment.percent + "% (" + formatNum(secondPayment.amount) + "€)");
                parsed = parsed.replace(/{DEP_100}/g, secondPayment.percent + "% (" + formatNum(secondPayment.amount) + "€)");
              } else {
                parsed = parsed.replace(/50\s*%/g, secondPayment.percent + "%");
                parsed = parsed.replace(/{DEP_50}/g, secondPayment.percent + "%");
                parsed = parsed.replace(/100\s*%/g, secondPayment.percent + "%");
                parsed = parsed.replace(/{DEP_100}/g, secondPayment.percent + "%");
              }
            }
          }

          if (calculatedTotal > 0) {
            parsed = parsed.replace(/{DEP_30}/g, formatNum(calculatedTotal * 0.3) + '€');
            parsed = parsed.replace(/{DEP_50}/g, formatNum(calculatedTotal * 0.5) + '€');
            parsed = parsed.replace(/{DEP_100}/g, formatNum(calculatedTotal) + '€');
          } else {
            parsed = parsed.replace(/{DEP_30}/g, '30% del total');
            parsed = parsed.replace(/{DEP_50}/g, '50% del total');
            parsed = parsed.replace(/{DEP_100}/g, '100% del total');
          }
          
          const getRelDate = (days) => {
            if (!g.Entrada) return "[FECHA]";
            const d = new Date(g.Entrada);
            d.setDate(d.getDate() - days);
            return d.toLocaleDateString('es-ES');
          };

          parsed = parsed.replace(/{RELEASE_30}/g, getRelDate(30));
          parsed = parsed.replace(/{RELEASE_15}/g, getRelDate(15));
          parsed = parsed.replace(/{RELEASE_7}/g, getRelDate(7));
          return parsed;
        };

        const activeRoomsMap = Object.entries(g.roomCounts || {}).reduce((acc, [type, count]) => {
          if (count > 0) {
            const lowerType = type.toLowerCase();
            acc[lowerType] = {
              original: acc[lowerType]?.original || type,
              count: (acc[lowerType]?.count || 0) + Number(count)
            }
          }
          return acc;
        }, {});

        const activeRooms = Object.values(activeRoomsMap).map(v => [v.original, v.count]);
        const dates = getCurrentStayDates(g);
        let calculatedPax = 0;
        activeRooms.forEach(([type, c]) => {
          const t = type.toUpperCase();
          let multiplier = 2;
          if (t.includes('INDIVIDUAL') || t.includes('DUI') || t.includes('SINGLE')) multiplier = 1;
          else if (t.includes('TRIPLE')) multiplier = 3;
          else if (t.includes('CUADRUPLE') || t.includes('CUÁDRUPLE') || t.includes('FAMILIAR')) multiplier = 4;
          else if (t.includes('QUINTUPLE')) multiplier = 5;
          calculatedPax += (multiplier * c);
        });
        const totalPax = calculatedPax > 0 ? calculatedPax : (g["Pax."] || 0);

        return (
          <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* HEADER DETALLE */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden">
              <div className="flex items-center gap-4">
                <button onClick={() => setCurrentView('dashboard')} className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-slate-800 transition-all border border-slate-100 flex-shrink-0">
                  <i className="fas fa-arrow-left"></i>
                </button>
                <div>
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1">
                    {hotelName} {g.Reserva ? `• ${g.Reserva}` : ''}
                  </label>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{g["Nombre del Grupo"]}</h2>
                  <div className="mt-2 flex flex-col gap-1.5">
                    <p className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5"><i className="far fa-calendar text-slate-300"></i> {formatDate(g.Entrada)} a {formatDate(g.Salida)}</span>
                      <span className="text-slate-200">|</span>
                      <span className="flex items-center gap-1.5"><i className="fas fa-users text-slate-300"></i> {totalPax} pax</span>
                      <span className="text-slate-200">|</span>
                      <span className="text-indigo-600 font-bold">{formatNum(calculatedTotal)} €</span>
                    </p>
                    {(g.Com_Email_Contacto || g.Email || g.Com_Telefono_Contacto || g.Telefono || g["Tel\u00c3\u00a9fono"] || g.Com_Nombre_Contacto || g.Persona_Contacto) && (
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex flex-wrap items-center gap-x-4 gap-y-1">
                        {(g.Com_Nombre_Contacto || g.Persona_Contacto) && (
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <i className="far fa-user text-slate-300"></i> {g.Com_Nombre_Contacto || g.Persona_Contacto}
                          </span>
                        )}
                        {(g.Com_Email_Contacto || g.Email) && (
                          <a href={`mailto:${g.Com_Email_Contacto || g.Email}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                            <i className="far fa-envelope text-slate-300"></i> {g.Com_Email_Contacto || g.Email}
                          </a>
                        )}
                        {(g.Com_Telefono_Contacto || g.Telefono || g["Tel\u00c3\u00a9fono"]) && (
                          <a href={`tel:${g.Com_Telefono_Contacto || g.Telefono || g["Tel\u00c3\u00a9fono"]}`} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                            <i className="fas fa-phone-alt text-slate-300 text-[8px]"></i> {g.Com_Telefono_Contacto || g.Telefono || g["Tel\u00c3\u00a9fono"]}
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Fase Actual:</span>
                  <select 
                    value={(g.Com_Estado_Interno || g.Estado || '').toUpperCase()} 
                    onChange={e => { 
                      const newStatus = e.target.value;
                      updateStatus(g.uid, newStatus);
                      setSelectedGroup({...g, Com_Estado_Interno: newStatus});
                    }}
                    className="bg-white text-indigo-700 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer uppercase"
                  >
                    <option value="PRESUPUESTO">Presupuesto</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="SEGUIMIENTO">Seguimiento</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="CANCELADO">Cancelado</option>
                    <option value="DESESTIMADO">Desestimado</option>
                    <option value="CADUCADO">Caducado</option>
                  </select>
                </div>

                <button 
                  onClick={() => { setFormData(g); setCurrentView('create'); }}
                  className="flex-1 md:flex-none px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
                >
                  <i className="fas fa-edit"></i> Editar Datos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* SIDEBAR: CLIENTE Y CRM */}
              <div className="lg:col-span-4 space-y-6 print:hidden">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      <i className="fas fa-users text-sm"></i>
                    </div>
                    <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Datos de Contacto</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Empresa / Agencia</p>
                      <p className="text-sm font-black text-slate-800 uppercase">{g["Empresa/Agencia"] || "Venta Directa"}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contacto</p>
                        <div className="flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-xl">
                          <i className="far fa-user text-indigo-400"></i>
                          <span className="text-xs font-bold text-slate-600">{g.Com_Nombre_Contacto || g.Persona_Contacto || "No indicado"}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</p>
                        <div className="flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-xl overflow-hidden">
                          <i className="far fa-envelope text-indigo-400"></i>
                          <span className="text-xs font-bold text-slate-600 truncate">{g.Com_Email_Contacto || g.Email || "No indicado"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {g.isRatesOnly && (
                  <div className="bg-indigo-50 border border-indigo-100/50 rounded-3xl p-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                        <i className="fas fa-info-circle"></i>
                      </div>
                      <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest leading-none">Modo Solo Tarifas</h4>
                    </div>
                    <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">
                      Este presupuesto se basa en una grid de tarifas informativas y no tiene un importe total cerrado.
                    </p>
                    <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">
                      Si el cliente te confirma la distribución, haz clic en <strong>Editar Datos</strong>, selecciona <strong>"Con Distribución"</strong> y define el cupo de habitaciones para transferir los precios automáticamente.
                    </p>
                  </div>
                )}

                {/* SEGUIMIENTO & CHAT-STYLE NOTES */}
                <div className="bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex flex-col h-full max-h-[600px]">
                   <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                          <i className="fas fa-history text-sm"></i>
                        </div>
                        <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Muro de Seguimiento</h3>
                      </div>
                      <span className="text-[8px] font-black text-slate-500 uppercase">{(Array.isArray(g.tracking) ? g.tracking : []).length} Entradas</span>
                   </div>
                   
                   {/* Formulario Nueva Nota */}
                   <form onSubmit={addTrackingNote} className="mb-6">
                      <div className="relative group">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Añadir nota de seguimiento..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none min-h-[80px] custom-scrollbar"
                        />
                        <button 
                          type="submit"
                          disabled={!newNote.trim()}
                          className="absolute right-3 bottom-3 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-all disabled:opacity-30 disabled:hover:bg-indigo-600"
                        >
                          <i className="fas fa-paper-plane text-[10px]"></i>
                        </button>
                      </div>
                   </form>

                   <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                     {g.Com_Notas && (
                       <div className="relative pl-6 border-l-2 border-amber-500/30 pb-4">
                         <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                         <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                           <div className="flex justify-between items-start mb-1">
                             <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Nota Principal</span>
                           </div>
                           <p className="text-xs text-amber-200/80 leading-relaxed whitespace-pre-wrap italic">{g.Com_Notas}</p>
                         </div>
                       </div>
                     )}

                     {!Array.isArray(g.tracking) || (g.tracking.length === 0 && !g.Com_Notas) ? (
                       <div className="py-10 text-center opacity-30">
                         <i className="fas fa-comments text-2xl mb-2 text-slate-400"></i>
                         <p className="text-[9px] font-black text-slate-500 uppercase">Sin historial aún</p>
                       </div>
                     ) : (
                       (Array.isArray(g.tracking) ? g.tracking : []).map((t, i) => (
                         <div key={t?.id || i} className="relative pl-6 border-l-2 border-white/5 pb-4 last:pb-0">
                           <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                           <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all group">
                             <div className="flex justify-between items-start mb-1">
                               <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{t?.date || 'N/A'}</span>
                             </div>
                             <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{t?.text || ''}</p>
                           </div>
                         </div>
                       ))
                     )}
                   </div>
                </div>
              </div>

              {/* DOCUMENTO DE PROPUESTA */}
              <div className="lg:col-span-8 print:col-span-12">
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-slate-800 print:shadow-none print:border-none print:overflow-visible">
                  <div className="p-8 md:p-10 print:p-8" id="quote-document">
                    <div className={`flex items-center justify-between gap-6 border-b-2 pb-4 mb-8 print:mb-4 print:pb-3 ${isCumbria ? 'border-blue-900' : 'border-orange-600'}`}>
                      <img
                        src={isCumbria ? "Logos/Cumbria Spa&Hotel.jpg" : "Logos/Sercotel Guadiana.jpg"}
                        alt={hotelName}
                        className="max-h-20 print:max-h-14 w-auto object-contain flex-shrink-0"
                      />
                      <div className="text-right">
                        <h1 className={`text-xl md:text-2xl print:text-lg font-black uppercase tracking-tighter ${isCumbria ? 'text-blue-900' : 'text-orange-800'}`}>
                          {docMode === 'confirmacion' ? 'Confirmación de Grupo' : 'Propuesta de Alojamiento'}
                        </h1>
                        <p className="text-[10px] print:text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Ref: {g.Reserva}</p>
                      </div>
                    </div>

                    {g.isMultiSegment && g.segments && g.segments.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8 print:mb-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100" style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'}}>
                        {(() => {
                          const stats = getSegmentStats(g.segments);
                          return (
                            <>
                              <div className="space-y-0.5">
                                <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest block">Total Pax</span>
                                <p className="text-sm print:text-[11px] font-extrabold text-slate-800">{stats.totalPax} pax</p>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest block">Hab-Noche</span>
                                <p className="text-sm print:text-[11px] font-extrabold text-slate-800">{stats.roomNights} hab-noc</p>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest block">Máx Simultáneo</span>
                                <p className="text-sm print:text-[11px] font-extrabold text-indigo-600">{stats.maxSimultaneous} hab.</p>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest block">Entrada Global</span>
                                <p className="text-sm print:text-[11px] font-extrabold text-slate-800">{formatDate(stats.globalIn)}</p>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest block">Salida Global</span>
                                <p className="text-sm print:text-[11px] font-extrabold text-slate-800">{formatDate(stats.globalOut)}</p>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest block">Segmentos</span>
                                <p className="text-sm print:text-[11px] font-extrabold text-slate-800">{g.segments.length} estancias</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:mb-6">
                        <div className="space-y-0.5">
                          <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest">Cliente / Grupo</span>
                          <p className="text-xs print:text-[10px] font-bold text-slate-800 uppercase">{g["Nombre del Grupo"]}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest">Estancia</span>
                          <p className="text-xs print:text-[10px] font-bold text-slate-800">{formatDate(g.Entrada)} - {formatDate(g.Salida)}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest">Pax Estimados</span>
                          <p className="text-xs print:text-[10px] font-bold text-slate-800">{totalPax} personas</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest">Reserva ID</span>
                          <p className="text-xs print:text-[10px] font-bold text-slate-800">#{g.Reserva}</p>
                        </div>
                      </div>
                    )}

                    {(g.Com_Nombre_Contacto || g.Persona_Contacto || g.Com_Email_Contacto || g.Email || g.Com_Telefono_Contacto || g.Telefono || g["Tel\u00c3\u00a9fono"]) && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:mb-6 border-t border-slate-50 pt-4">
                        {(g.Com_Nombre_Contacto || g.Persona_Contacto) && (
                          <div className="space-y-0.5">
                            <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest">Contacto</span>
                            <p className="text-xs print:text-[10px] font-bold text-slate-800 uppercase">{g.Com_Nombre_Contacto || g.Persona_Contacto}</p>
                          </div>
                        )}
                        {(g.Com_Email_Contacto || g.Email) && (
                          <div className="space-y-0.5">
                            <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                            <p className="text-xs print:text-[10px] font-bold text-slate-800">{g.Com_Email_Contacto || g.Email}</p>
                          </div>
                        )}
                        {(g.Com_Telefono_Contacto || g.Telefono || g["Tel\u00c3\u00a9fono"]) && (
                          <div className="space-y-0.5">
                            <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest">Teléfono</span>
                            <p className="text-xs print:text-[10px] font-bold text-slate-800">{g.Com_Telefono_Contacto || g.Telefono || g["Tel\u00c3\u00a9fono"]}</p>
                          </div>
                        )}
                        {g["Empresa/Agencia"] && g["Empresa/Agencia"] !== "Venta Directa" && (
                          <div className="space-y-0.5">
                            <span className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest">Empresa / Agencia</span>
                            <p className="text-xs print:text-[10px] font-bold text-slate-800 uppercase">{g["Empresa/Agencia"]}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {g.isMultiSegment && g.segments && g.segments.length > 0 && (
                      <div className="space-y-4 mb-8">
                        <h3 className={`text-xs font-black uppercase tracking-widest border-l-4 ${isCumbria ? 'border-blue-900 text-blue-900' : 'border-orange-600 text-orange-800'} pl-3`}>
                          Distribución por Estancias
                        </h3>
                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                          <table className="w-full text-left border-collapse text-xs print:text-[10px]">
                            <thead>
                              <tr className="bg-slate-50 text-slate-500 font-black text-[10px] print:text-[8px] uppercase tracking-widest border-b border-slate-100">
                                <th className="p-3 print:py-1.5 print:px-2 w-12 text-center">ID</th>
                                <th className="p-3 print:py-1.5 print:px-2">Pax</th>
                                <th className="p-3 print:py-1.5 print:px-2">Entrada</th>
                                <th className="p-3 print:py-1.5 print:px-2">Salida</th>
                                <th className="p-3 print:py-1.5 print:px-2">Noches</th>
                                <th className="p-3 print:py-1.5 print:px-2">Distribución</th>
                                {g.segments.some(s => s.notes) && <th className="p-3 print:py-1.5 print:px-2">Notas</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {g.segments.map((seg) => {
                                const nightsCount = seg.in && seg.out ? generateDates(seg.in, seg.out).length : 0;
                                return (
                                  <tr key={seg.id} className="hover:bg-slate-50/50">
                                    <td className="p-3 print:py-1.5 print:px-2 text-center font-black text-slate-500">{seg.id}</td>
                                    <td className="p-3 print:py-1.5 print:px-2 font-bold text-slate-700">{seg.pax} pax</td>
                                    <td className="p-3 print:py-1.5 print:px-2 text-slate-600">{formatDate(seg.in)}</td>
                                    <td className="p-3 print:py-1.5 print:px-2 text-slate-600">{formatDate(seg.out)}</td>
                                    <td className="p-3 print:py-1.5 print:px-2 text-center font-bold text-slate-700">{nightsCount}</td>
                                    <td className="p-3 print:py-1.5 print:px-2 font-bold text-slate-700">
                                      {(() => {
                                        const allocs = seg.roomAllocations && seg.roomAllocations.length > 0
                                          ? seg.roomAllocations
                                          : [{ pax: seg.pax || 1, rooms: seg.rooms || seg.pax || 1, roomType: seg.roomType || 'DOBLE DE USO INDIVIDUAL' }];
                                        return allocs.map((a, i) => (
                                          <div key={i} className="mb-0.5 last:mb-0 font-medium">
                                            {a.rooms} {Number(a.rooms) === 1 ? 'habitación' : 'habitaciones'} {getRoomDisplayName(a.roomType).toLowerCase()} <span className="text-[9px] text-slate-400 font-normal">({a.pax} pax)</span>
                                          </div>
                                        ));
                                      })()}
                                    </td>
                                    {g.segments.some(s => s.notes) && <td className="p-3 print:py-1.5 print:px-2 text-slate-500 italic text-[11px] print:text-[9px]">{seg.notes || ''}</td>}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          <div className={`px-4 py-2 border-t border-slate-100 flex flex-wrap gap-4 text-[9px] print:text-[8px] font-black uppercase tracking-widest ${isCumbria ? 'bg-blue-50/20 text-blue-900/80' : 'bg-orange-50/20 text-orange-800/80'}`}>
                            {(() => {
                              const stats = getSegmentStats(g.segments);
                              return (
                                <>
                                  <span>Total Pax: {stats.totalPax} pax</span>
                                  <span>•</span>
                                  <span>Habitaciones-Noche: {stats.roomNights} hab-noc</span>
                                  <span>•</span>
                                  <span>Máxima Ocupación Simultánea: {stats.maxSimultaneous} hab.</span>
                                  <span>•</span>
                                  <span>Rango global: {stats.nights} noches</span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-8 print:space-y-4">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">Itinerario y Condiciones Económicas</h3>
                      {dates.length > 0 || g.isRatesOnly ? (
                        g.isRatesOnly ? (
                          <div className={`overflow-hidden print:overflow-visible rounded-2xl border ${isCumbria ? 'border-blue-900/20' : 'border-orange-600/20'} text-xs print:text-[10px] bg-white shadow-sm`}>
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className={`${isCumbria ? 'bg-slate-900 text-white' : 'bg-amber-950 text-amber-50'} font-black text-[10px] print:text-[8px] uppercase tracking-widest border-b ${isCumbria ? 'border-blue-950' : 'border-orange-950'}`} style={{backgroundColor: isCumbria ? '#0f172a' : '#451a03', color: 'white', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'}}>
                                  <th className="p-4 print:py-2 print:px-3 font-extrabold">Régimen</th>
                                  {currentRooms.filter(r => !(g.hiddenGridCols || []).includes(r)).map(room => (
                                    <th key={room} className="p-4 print:py-2 print:px-3 text-center font-extrabold">{getRoomDisplayName(room)}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {BOARD_TYPES.filter(b => !(g.hiddenGridRows || []).includes(b.split(' ')[0])).map((board, idx) => {
                                  const boardKey = board.split(' ')[0];
                                  const visibleRooms = currentRooms.filter(r => !(g.hiddenGridCols || []).includes(r));
                                  const hasPrices = visibleRooms.some(room => g.ratesOnlyGrid?.[boardKey]?.[room]);
                                  if (!hasPrices) return null;
                                  return (
                                    <tr key={board} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} hover:bg-slate-50/50 transition-colors`}>
                                      <td className="p-4 print:py-2.5 print:px-3 align-middle font-bold text-slate-800 uppercase tracking-tight">{getBoardDisplayName(board)}</td>
                                      {visibleRooms.map(room => {
                                        const price = g.ratesOnlyGrid?.[boardKey]?.[room];
                                        return (
                                          <td key={room} className="p-4 print:py-2.5 print:px-3 text-center align-middle">
                                            {price ? (
                                              <span className={`inline-block px-3 py-1 rounded-lg ${isCumbria ? 'bg-blue-50 text-blue-900 border border-blue-100/50' : 'bg-orange-50 text-orange-900 border border-orange-100/50'} text-xs print:text-[10px] font-extrabold tabular-nums`} style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'}}>
                                                {formatNum(price)} €
                                              </span>
                                            ) : (
                                              <span className="text-slate-300 font-medium">-</span>
                                            )}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                            <div className={`${isCumbria ? 'bg-slate-50 text-slate-500 border-t border-slate-100' : 'bg-orange-50/30 text-orange-800/80 border-t border-orange-100/50'} px-6 py-3.5 print:py-2 text-center uppercase tracking-widest text-[9px] print:text-[7.5px] font-black`} style={{backgroundColor: isCumbria ? '#f8fafc' : '#fffbeb', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'}}>
                              Tarifas informativas por habitación y noche (IVA incluido)
                            </div>
                          </div>
                        ) : (
                          <div className="overflow-hidden print:overflow-visible rounded-2xl border border-slate-100 text-xs print:text-[10px]">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 text-slate-500 font-black text-[10px] print:text-[8px] uppercase tracking-widest border-b border-slate-100">
                                  <th className="p-4 print:py-1.5 print:px-2">Fecha (Servicio)</th>
                                  <th className="p-4 print:py-1.5 print:px-2">Régimen</th>
                                  <th className="p-4 print:py-1.5 print:px-2">Tipología Alojamiento</th>
                                  <th className="p-4 print:py-1.5 print:px-2 text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {dates.flatMap((date, idx) => {
                                   let subtotalDate = 0;
                                   const config = g.dailyConfig?.[date] || {};
                                   const boardTitle = config.board || g.Regimen || '';

                                   const dailyExtrasRows = (g.extraCharges || []).filter(ext => ext.date === date).map((ext, extIdx) => {
                                      const u = ext.units || 0;
                                      const pax = ext.pax || 0;
                                      const up = ext.unitPrice !== undefined ? ext.unitPrice : Number(ext.price || 0);
                                      const px = (u > 0 ? u : pax) * up;
                                      return (
                                         <tr key={`ext-${date}-${extIdx}`} className="bg-slate-50 border-t border-slate-100">
                                           <td className="p-4 print:py-1.5 print:px-2 align-top font-bold text-slate-800">{formatDate(date)}</td>
                                           <td className="p-4 print:py-1.5 print:px-2 align-top text-slate-500 font-black uppercase text-[9px] tracking-widest italic opacity-60">Cargo Extra</td>
                                           <td className="p-4 print:py-1.5 print:px-2 text-slate-600 font-bold italic">{ext.description || ext.concept} ({u > 0 ? u : pax} x {formatNum(up)}€)</td>
                                           <td className="p-4 print:py-1.5 print:px-2 align-bottom text-right font-black text-slate-800 tabular-nums">{formatNum(px)} €</td>
                                         </tr>
                                      );
                                   });

                                   const roomListItems = activeRooms.map(([type, count]) => {
                                     const typeKey = type.toUpperCase();
                                     const currentCount = config.counts && config.counts[typeKey] !== undefined && config.counts[typeKey] !== ''
                                       ? Number(config.counts[typeKey])
                                       : count;

                                     if (currentCount <= 0) return null;

                                     let price = 0;
                                     let gratuities = 0;
                                     let lineSubtotal = 0;
                                     let roomBoard = '';

                                     if (config.prices && config.prices[typeKey] !== undefined) {
                                        price = Number(config.prices[typeKey] || 0);
                                        roomBoard = config[typeKey]?.board || '';
                                        gratuities = parseInt(config[typeKey]?.gratuities || 0);
                                        lineSubtotal = Math.max(0, currentCount - gratuities) * price;
                                     }
                                     if (price === 0 && lineSubtotal === 0 && gratuities === 0) return null;

                                     subtotalDate += lineSubtotal;
                                     return (
                                       <li key={type} className="text-slate-500 mb-1 print:mb-0">
                                         <div className="flex justify-between">
                                           <span>{currentCount}x {getRoomDisplayName(type)} {roomBoard && roomBoard !== boardTitle ? `(${getBoardDisplayName(roomBoard)})` : ''} ({formatNum(price)}€)</span>
                                         </div>
                                         {gratuities > 0 && <div className="text-emerald-500 font-bold text-[9px] uppercase tracking-wider mt-0.5 print:mt-0">[-{gratuities}] Gratuidad</div>}
                                       </li>
                                     );
                                   }).filter(Boolean);

                                   if (roomListItems.length === 0) {
                                     return dailyExtrasRows;
                                   }

                                   const roomRow = (
                                     <tr key={`${date}-base`} className="group hover:bg-slate-50/50">
                                       <td className="p-4 print:py-1.5 print:px-2 align-top font-bold text-slate-800">{formatDate(date)}</td>
                                       <td className="p-4 print:py-1.5 print:px-2 align-top font-bold text-indigo-600">{boardTitle}</td>
                                       <td className="p-4 print:py-1.5 print:px-2">
                                         <ul className="text-[11px] print:text-[9px]">
                                           {roomListItems}
                                         </ul>
                                       </td>
                                       <td className="p-4 print:py-1.5 print:px-2 align-bottom text-right font-black text-slate-800 tabular-nums">{formatNum(subtotalDate)} €</td>
                                     </tr>
                                   );

                                   return [roomRow, ...dailyExtrasRows];
                                })}

                                {(g.extraCharges || []).filter(ext => !ext.date || ext.date === '' || ext.date === 'Todas' || !dates.includes(ext.date)).map((ext, idx) => {
                                  const px = (ext.units || ext.pax || 0) * (ext.unitPrice !== undefined ? ext.unitPrice : parseFloat(ext.price || 0));
                                  return (
                                    <tr key={`ext-global-${idx}`} className="bg-indigo-50/30 border-t border-indigo-100/50 italic">
                                      <td className="p-4 print:py-1.5 print:px-2 align-top font-bold text-indigo-900">General</td>
                                      <td className="p-4 print:py-1.5 print:px-2 align-top text-indigo-400 font-black uppercase text-[9px] tracking-widest">Extra Global</td>
                                      <td className="p-4 print:py-1.5 print:px-2 text-indigo-800 font-bold">{ext.description || ext.concept} ({ext.units || ext.pax || 0} x {formatNum(ext.unitPrice || ext.price || 0)}€)</td>
                                      <td className="p-4 print:py-1.5 print:px-2 align-bottom text-right font-black text-indigo-900 tabular-nums">{formatNum(px)} €</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tbody className="bg-slate-900 text-white font-black break-inside-avoid print:break-inside-avoid">
                                 {parseFloat(g.Suplementos || 0) > 0 || parseFloat(g.Descuentos || 0) > 0 ? (
                                   <>
                                     <tr className="border-b border-slate-700/50 text-slate-300">
                                       <td colSpan="3" className="px-6 py-4 print:py-2 print:px-3 text-right uppercase tracking-widest text-[10px] print:text-[8px]">Subtotal Estancia:</td>
                                       <td className="px-6 py-4 print:py-2 print:px-3 text-right tabular-nums whitespace-nowrap">{formatNum((calculatedTotal > 0 ? calculatedTotal : 0) - (parseFloat(g.Suplementos || 0)) + (parseFloat(g.Descuentos || 0)))} €</td>
                                     </tr>
                                     {parseFloat(g.Suplementos || 0) > 0 && (
                                       <tr className="border-b border-slate-700/50 text-indigo-300">
                                         <td colSpan="3" className="px-6 py-3 print:py-1.5 print:px-3 text-right uppercase tracking-widest text-[10px] print:text-[8px]">+ Suplementos:</td>
                                         <td className="px-6 py-3 print:py-1.5 print:px-3 text-right tabular-nums whitespace-nowrap">{formatNum(parseFloat(g.Suplementos))} €</td>
                                       </tr>
                                     )}
                                     {parseFloat(g.Descuentos || 0) > 0 && (
                                       <tr className="border-b border-slate-700/50 text-rose-300">
                                         <td colSpan="3" className="px-6 py-3 print:py-1.5 print:px-3 text-right uppercase tracking-widest text-[10px] print:text-[8px]">- Descuentos aplicados:</td>
                                         <td className="px-6 py-3 print:py-1.5 print:px-3 text-right tabular-nums whitespace-nowrap">-{formatNum(parseFloat(g.Descuentos))} €</td>
                                       </tr>
                                     )}
                                     <tr style={{backgroundColor:'#0f172a', color:'white', WebkitPrintColorAdjust:'exact', printColorAdjust:'exact'}}>
                                       <td colSpan="3" className="px-6 py-5 print:py-3 print:px-3 text-right uppercase tracking-[0.2em] text-xs print:text-[10px] font-black">Total Neto Documento:</td>
                                       <td className="px-6 py-5 print:py-3 print:px-3 text-right text-xl print:text-lg tabular-nums whitespace-nowrap" style={{color:'white', fontWeight:900}}>{formatNum(calculatedTotal)} €</td>
                                     </tr>
                                   </>
                                 ) : (
                                   <tr style={{backgroundColor:'#0f172a', color:'white', WebkitPrintColorAdjust:'exact', printColorAdjust:'exact'}}>
                                     <td colSpan="3" className="px-6 py-5 print:py-3 print:px-3 text-right uppercase tracking-[0.2em] text-xs print:text-[10px] font-black">Total Neto Documento:</td>
                                     <td className="px-6 py-5 print:py-3 print:px-3 text-right text-xl print:text-lg tabular-nums whitespace-nowrap" style={{color:'white', fontWeight:900}}>{formatNum(calculatedTotal)} €</td>
                                   </tr>
                                 )}
                              </tbody>
                            </table>
                          </div>
                        )) : (
                        <div className="bg-slate-50 p-8 rounded-2xl text-center border border-slate-200">
                          <p className="text-lg font-black text-indigo-700">{formatNum(calculatedTotal)} € (Total Estimado)</p>
                          <p className="text-xs text-slate-400 mt-2">Detalle de noches no configurado aún.</p>
                        </div>
                      )}

                      {documentPaymentPlan.length > 0 && (
                        <div className="rounded-2xl border border-slate-100 overflow-hidden print:overflow-visible">
                          <div className="bg-slate-50 px-4 py-3 print:py-2 border-b border-slate-100">
                            <h4 className="text-[10px] print:text-[8px] font-black text-slate-500 uppercase tracking-widest">Condiciones de pago</h4>
                          </div>
                          <div className="divide-y divide-slate-100">
                            {documentPaymentPlan.map((row, idx) => (
                              <div key={row.id || idx} className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 print:py-2 text-xs print:text-[9px]">
                                <div>
                                  <p className="font-bold text-slate-700">
                                    {formatNum(row.percent || 0)}% en concepto de {row.label || "pago"}
                                  </p>
                                  {(row.date || row.observations) && (
                                    <p className="text-[10px] print:text-[8px] text-slate-400 font-bold mt-0.5">
                                      {row.date ? `Fecha límite: ${formatDate(row.date)}` : ""}{row.date && row.observations ? " · " : ""}{row.observations || ""}
                                    </p>
                                  )}
                                </div>
                                <div className="font-black text-slate-900 tabular-nums whitespace-nowrap">{formatNum(row.amount || 0)} €</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-8 print:space-y-4">
                        <div className="flex items-center justify-between no-print mb-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                          <div className="flex gap-1">
                            <button onClick={() => setDocMode('presupuesto')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${docMode === 'presupuesto' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600'}`}>Vista Presupuesto</button>
                            <button onClick={() => setDocMode('confirmacion')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${docMode === 'confirmacion' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600'}`}>Vista Confirmación</button>
                          </div>
                        </div>

                        <div className={`space-y-16 print:space-y-6 ${docMode === 'confirmacion' ? 'print-break-before' : ''}`}>
                          {docMode === 'presupuesto' && (
                            <div className="relative group">
                              <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                  <div className={`h-4 w-1 rounded-full ${isCumbria ? 'bg-blue-800' : 'bg-orange-600'}`}></div>
                                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Cláusulas de Presupuesto</h4>
                                </div>
                                <button onClick={() => {
                                    if (!isEditingClauses) {
                                      const current = effectiveClauses;
                                      setTempClauses(JSON.parse(JSON.stringify(current)));
                                  } else {
                                    db.collection("groups").doc(g.uid).update({ clauses: tempClauses }).then(() => alert("Cláusulas presupuesto guardadas."));
                                  }
                                  setIsEditingClauses(!isEditingClauses);
                                }} className={`no-print px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isEditingClauses ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                  {isEditingClauses ? 'Guardar' : 'Editar'}
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-8 gap-y-6 print:gap-x-4 print:gap-y-2">
                                {(() => {
                                  const cls = isEditingClauses ? tempClauses : effectiveClauses;
                                  return cls.map((c, i) => {
                                    if (isEditingClauses) {
                                      return (
                                        <div key={i} className="border-l-2 border-slate-200 pl-3 py-1 bg-slate-50/50 rounded-r-xl">
                                          <div className="flex justify-between mb-2 gap-2">
                                            <input type="text" value={c.title} onChange={e => { const n = [...tempClauses]; n[i].title = e.target.value; setTempClauses(n); }} className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-black text-slate-800" />
                                            <button onClick={() => handleTranslateClause(i, 'budget')} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black hover:bg-indigo-600 hover:text-white"><i className="fas fa-language"></i></button>
                                            <button onClick={() => setTempClauses(tempClauses.filter((_, idx) => idx !== i))} className="text-rose-500"><i className="fas fa-trash-alt text-[10px]"></i></button>
                                          </div>
                                          <textarea value={c.body} onChange={e => { const n = [...tempClauses]; n[i].body = e.target.value; setTempClauses(n); }} rows="3" className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-600 resize-none font-medium"></textarea>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div key={i} className={`border-l-2 ${isCumbria ? 'border-blue-200' : 'border-orange-100'} pl-3 print:pl-2 py-1`}>
                                        <p className="text-[10px] print:text-[7.5px] font-black uppercase tracking-wider mb-0.5 text-slate-800">
                                          <span className="text-slate-400 mr-1">{i + 1}.</span>{c.title}
                                        </p>
                                        <div className="text-[9.5px] print:text-[7px] text-slate-500 leading-snug">{renderClauseText(parseClauseVariables(c.body, c.title))}</div>
                                      </div>
                                    );
                                  });
                                })()}
                                {isEditingClauses && (
                                  <button onClick={() => setTempClauses([...tempClauses, { title: "Nueva Cláusula", body: "" }])} className="no-print border-2 border-dashed border-slate-200 rounded-xl p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-400 transition-all flex items-center justify-center gap-2">
                                    <i className="fas fa-plus"></i> Añadir Cláusula
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {docMode === 'confirmacion' && (
                            <div className="relative group">
                              <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                  <div className="h-4 w-1 rounded-full bg-emerald-500"></div>
                                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Cláusulas de Confirmación</h4>
                                </div>
                                <button onClick={() => {
                                  if (!isEditingClausesConf) {
                                    const current = effectiveClauses;
                                    setTempClausesConf(JSON.parse(JSON.stringify(current)));
                                  } else {
                                    db.collection("groups").doc(g.uid).update({ clauses_conf: tempClausesConf }).then(() => alert("Cláusulas confirmación guardadas."));
                                  }
                                  setIsEditingClausesConf(!isEditingClausesConf);
                                }} className={`no-print px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isEditingClausesConf ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                                  {isEditingClausesConf ? 'Guardar' : 'Editar'}
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-8 gap-y-6 print:gap-x-4 print:gap-y-2">
                                {(() => {
                                  const cls = isEditingClausesConf ? tempClausesConf : effectiveClauses;
                                  return cls.map((c, i) => {
                                    if (isEditingClausesConf) {
                                      return (
                                        <div key={i} className="border-l-2 border-emerald-100 pl-3 py-1 bg-slate-50/50 rounded-r-xl">
                                          <div className="flex justify-between mb-2 gap-2">
                                            <input type="text" value={c.title} onChange={e => { const n = [...tempClausesConf]; n[i].title = e.target.value; setTempClausesConf(n); }} className="flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-black text-slate-800" />
                                            <button onClick={() => handleTranslateClause(i, 'confirmation')} className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black hover:bg-emerald-600 hover:text-white"><i className="fas fa-language"></i></button>
                                            <button onClick={() => setTempClausesConf(tempClausesConf.filter((_, idx) => idx !== i))} className="text-rose-500"><i className="fas fa-trash-alt text-[10px]"></i></button>
                                          </div>
                                          <textarea value={c.body} onChange={e => { const n = [...tempClausesConf]; n[i].body = e.target.value; setTempClausesConf(n); }} rows="3" className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-600 resize-none font-medium"></textarea>
                                        </div>
                                      );
                                    }
                                    return (
                                      <div key={i} className="border-l-2 border-emerald-100 pl-3 print:pl-2 py-1">
                                        <p className="text-[10px] print:text-[7.5px] font-black uppercase tracking-wider mb-0.5 text-emerald-900">
                                          <span className="text-emerald-700 mr-1">{i + 1}.</span>{c.title}
                                        </p>
                                        <div className="text-[9.5px] print:text-[7px] text-slate-500 leading-snug">{renderClauseText(parseClauseVariables(c.body, c.title))}</div>
                                      </div>
                                    );
                                  });
                                })()}
                                {isEditingClausesConf && (
                                  <button onClick={() => setTempClausesConf([...tempClausesConf, { title: "Nueva Cláusula Conf.", body: "" }])} className="no-print border-2 border-dashed border-emerald-100 rounded-xl p-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:border-emerald-400 hover:text-emerald-500 transition-all flex items-center justify-center gap-2">
                                    <i className="fas fa-plus"></i> Añadir Cláusula de Confirmación
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`pt-5 print:pt-3 border-t-2 ${isCumbria ? 'border-blue-900' : 'border-orange-600'} print:border-t flex items-end justify-between`}>
                        <div className="print:pl-2">
                          <p className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Generado por</p>
                          <p className={`text-sm print:text-[10px] font-black ${isCumbria ? 'text-blue-900' : 'text-orange-800'}`}>{isCumbria ? "Dpto. Eventos Cumbria" : "Dpto. Grupos Sercotel Guadiana"}</p>
                          <p className="text-[9px] print:text-[7px] text-slate-400 italic mt-0.5">Este documento no tiene validez como factura</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Fecha del Documento</p>
                          <p className={`text-lg print:text-sm font-black ${isCumbria ? 'text-blue-900' : 'text-orange-800'}`}>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end no-print">
                  <button onClick={() => {
                      const originalTitle = document.title;
                      const reserva = g.Reserva || '';
                      const grupo = g['Nombre del Grupo'] || '';
                      document.title = (reserva && grupo) ? `${reserva} - ${grupo}` : (grupo || reserva || 'Propuesta');
                      window.print();
                      setTimeout(() => { document.title = originalTitle; }, 500);
                    }} className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl flex items-center gap-3">
                    <i className="fas fa-print"></i> IMPRIMIR PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      };

      return (
        <div className="flex flex-col min-h-screen">
          {/* NAV BAR */}
          <nav className="bg-white border-b border-slate-200 z-50 no-print">
            <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
              <div className="flex items-center gap-4 cursor-pointer py-4" onClick={() => setCurrentView('dashboard')}>
                <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="fas fa-layer-group text-white text-sm"></i>
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight leading-none mb-1">Nexus Presupuestos</h1>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Sales Hub</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <a href="Proformas.html" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2 mr-4">
                  <i className="fas fa-file-invoice"></i> Fac Proforma
                </a>
                <a href="https://nataliogc.github.io/menus-eventos/admin.html" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2 mr-4">
                  <i className="fas fa-utensils"></i> Menús Eventos
                </a>
                <a href="https://nataliogc.github.io/Menus-Turisticos/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2 mr-4">
                  <i className="fas fa-map"></i> Menús Turísticos
                </a>
                <a href="https://nataliogc.github.io/menus-cocteles/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2 mr-4">
                  <i className="fas fa-glass-martini-alt"></i> Menús Cócteles
                </a>
                <a href="Gestion-de-Grupos.html" className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-arrow-left"></i> Volver a Grupos
                </a>
              </div>
            </div>
          </nav>

          <main className="flex-grow p-4 md:p-8">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conectando...</p>
              </div>
            ) : (
              <>
                {currentView === 'dashboard' && renderDashboard()}
                {currentView === 'create' && renderCreate()}
                {currentView === 'detail' && renderDetail()}
              </>
            )}
          </main>

          {/* Modal Previsualización Paste Tarifas */}
          {pastePreview.isOpen && (() => {
            const previewRooms = ROOM_TYPES[formData.Hotel || formData.Hotel_Asignado] || ROOM_TYPES["Sercotel Guadiana"];
            return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                      <i className="fas fa-clipboard-check text-lg"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Previsualización de Tarifas</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">Revisa los datos detectados antes de aplicar</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPastePreview({ ...pastePreview, isOpen: false })}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
                
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                  {Object.keys(pastePreview.parsedData).length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tarifas Reconocidas</h4>
                      <div className="overflow-x-auto border border-slate-100 rounded-xl">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                             <tr className="bg-slate-50 text-slate-500 font-black text-[9px] uppercase tracking-widest border-b border-slate-100">
                               <th className="p-3">Régimen</th>
                               {previewRooms.map(room => (
                                 <th key={room} className="p-3 text-center">{room}</th>
                               ))}
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                             {BOARD_TYPES.map(board => {
                               const boardKey = board.split(' ')[0]; // SA, AD, MP, PC
                               const hasAnyData = previewRooms.some(room => pastePreview.parsedData[boardKey]?.[room] !== undefined);
                               if (!hasAnyData) return null;

                               return (
                                 <tr key={board}>
                                   <td className="p-3 font-bold text-slate-700">{board}</td>
                                   {previewRooms.map(room => {
                                     const price = pastePreview.parsedData[boardKey]?.[room];
                                     return (
                                       <td key={room} className="p-3 text-center">
                                         {price !== undefined ? (
                                           <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                                             {price.toFixed(2)} €
                                           </span>
                                         ) : (
                                           <span className="text-slate-300">-</span>
                                         )}
                                       </td>
                                     );
                                   })}
                                 </tr>
                               );
                             })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                       <i className="fas fa-exclamation-triangle text-3xl text-amber-300 mb-2"></i>
                       <p className="text-xs font-bold text-slate-600">No se han reconocido datos de tarifas.</p>
                       <p className="text-[10px] text-slate-400 mt-1">Asegúrate de que la tabla tiene las cabeceras correctas.</p>
                    </div>
                  )}

                  {(pastePreview.unrecognizedBoards.length > 0 || pastePreview.unrecognizedRooms.length > 0) && (
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <i className="fas fa-info-circle"></i> Elementos no reconocidos
                      </h4>
                      {pastePreview.unrecognizedBoards.length > 0 && (
                        <div className="mb-2">
                           <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Regímenes: </span>
                           <span className="text-[10px] text-amber-800">{pastePreview.unrecognizedBoards.join(", ")}</span>
                        </div>
                      )}
                      {pastePreview.unrecognizedRooms.length > 0 && (
                        <div>
                           <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wider">Habitaciones: </span>
                           <span className="text-[10px] text-amber-800">{pastePreview.unrecognizedRooms.join(", ")}</span>
                        </div>
                      )}
                      <p className="text-[9px] text-amber-600/70 mt-2 font-medium leading-tight">Estos elementos no se importarán. Solo se actualizarán las celdas reconocidas en la tabla principal.</p>
                    </div>
                  )}
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPastePreview({ ...pastePreview, isOpen: false })}
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={applyPastedTarifas}
                    disabled={Object.keys(pastePreview.parsedData).length === 0}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all text-xs font-black shadow-lg shadow-emerald-200 flex items-center gap-2 uppercase tracking-widest disabled:opacity-60"
                  >
                    <i className="fas fa-check"></i> Aplicar Datos
                  </button>
                </div>
              </div>
            </div>
            );
          })()}

          {showEmailParseModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 animate-scale-in">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Parsear Email con IA</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">La IA extraerá automáticamente los segmentos y datos de contacto</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowEmailParseModal(false)}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Pega el contenido del Email</label>
                    <textarea
                      value={emailContent}
                      onChange={e => setEmailContent(e.target.value)}
                      disabled={isParsingEmail}
                      placeholder="Querido Hotel, me gustaría reservar habitaciones para 9 personas de nuestra compañía...

3 personas: Entrada 14 junio, Salida 19 junio.
Y del 21 de junio al..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all min-h-[250px] resize-none"
                    />
                  </div>
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmailParseModal(false)}
                    disabled={isParsingEmail}
                    className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all uppercase tracking-widest"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleParseEmailIA}
                    disabled={isParsingEmail || !emailContent.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all text-xs font-black shadow-lg shadow-indigo-200 flex items-center gap-2 uppercase tracking-widest disabled:opacity-60"
                  >
                    {isParsingEmail ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sparkles"></i>
                        Extraer Datos
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  
