/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Split Series Reservation Service
 * ═══════════════════════════════════════════════════════════
 * Handles atomic, idempotent and traceable splitting of
 * multi-segment quotes into individual confirmed reservations.
 * ═══════════════════════════════════════════════════════════
 */

(function (global) {
  "use strict";

  // Helper: robust date generator for stay nights
  function generateDatesLocal(start, end) {
    var arr = [];
    var dt = new Date(start);
    var endDt = new Date(end);
    while (dt < endDt) {
      arr.push(new Date(dt).toISOString().split('T')[0]);
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  }

  // Helper: calculate segment total price using parent config
  function calculateSegmentTotal(budget, seg) {
    var segmentRoomCounts = {};
    var allocations = Array.isArray(seg.roomAllocations) && seg.roomAllocations.length > 0
      ? seg.roomAllocations
      : [{ roomType: seg.roomType || 'DOBLE DE USO INDIVIDUAL', rooms: Number(seg.rooms || seg.pax || 0) }];
    
    allocations.forEach(function (alloc) {
      var rType = (alloc.roomType || 'DOBLE DE USO INDIVIDUAL').toUpperCase();
      segmentRoomCounts[rType] = (segmentRoomCounts[rType] || 0) + Number(alloc.rooms || 0);
    });

    var dates = generateDatesLocal(seg.in, seg.out);
    var total = 0;

    dates.forEach(function (d) {
      var config = budget.dailyConfig?.[d] || {};
      Object.entries(segmentRoomCounts).forEach(function ([type, count]) {
        if (count > 0) {
          var price = 0;
          var gratuities = 0;
          var discount = 0;
          var regime = config.board || budget["Régimen"] || "AD";
          var regimeShort = regime.split(' ')[0];

          if (config.prices) {
            var pk = Object.keys(config.prices).find(function (k) {
              return k.trim().toLowerCase() === type.trim().toLowerCase();
            });
            price = pk ? parseFloat(config.prices[pk] || 0) : 0;
            
            var gratKey = config.gratuities ? Object.keys(config.gratuities).find(function (k) {
              return k.trim().toLowerCase() === type.trim().toLowerCase();
            }) : null;
            gratuities = gratKey ? parseInt(config.gratuities[gratKey] || 0) : 0;

            var discKey = config.discounts ? Object.keys(config.discounts).find(function (k) {
              return k.trim().toLowerCase() === type.trim().toLowerCase();
            }) : null;
            discount = discKey ? parseFloat(config.discounts[discKey] || 0) : 0;
          }

          // Fallback to ratesOnlyGrid
          if (price === 0 && budget.ratesOnlyGrid) {
            var boardKey = regimeShort;
            var grid = budget.ratesOnlyGrid;
            if (grid[boardKey]) {
              var gridPk = Object.keys(grid[boardKey]).find(function (k) {
                return k.trim().toLowerCase() === type.trim().toLowerCase();
              });
              if (gridPk) price = parseFloat(grid[boardKey][gridPk] || 0);
            }
            if (price === 0) {
              var fallbackBoard = (budget["Régimen"] || "AD").split(' ')[0];
              if (grid[fallbackBoard]) {
                var gridPk2 = Object.keys(grid[fallbackBoard]).find(function (k) {
                  return k.trim().toLowerCase() === type.trim().toLowerCase();
                });
                if (gridPk2) price = parseFloat(grid[fallbackBoard][gridPk2] || 0);
              }
            }
          }

          var payingRooms = Math.max(0, count - gratuities);
          var lineTotal = payingRooms * price * (1 - discount / 100);
          total += lineTotal;
        }
      });
    });

    return total;
  }

  // Whitelist of fields to copy explicitly to prevent dirty properties cloning
  const COPY_WHITELIST = [
    "Com_Nombre_Contacto", "Com_Email_Contacto", "Com_Telefono_Contacto", "Com_Notas",
    "Empresa/Agencia", "Régimen", "Segment.", "Hotel_Asignado", "Hotel",
    "Fiscal_RazonSocial", "Fiscal_CIF", "Fiscal_Direccion", "Fiscal_CP", "Fiscal_Poblacion",
    "ratesOnlyGrid", "Com_Comercial", "Com_Vencimiento_Rel", "hiddenGridCols", "hiddenGridRows"
  ];

  /**
   * splitAndConfirmMultiSegment: splits a confirmed series into individual reservations
   */
  async function splitAndConfirmMultiSegment({ budgetId, db, confirmedBy, confirmationSource }) {
    if (!budgetId || !db) {
      throw new Error("Parámetros insuficientes: se requiere budgetId y db.");
    }

    let serverTimestampVal = new Date();
    if (global.firebase && global.firebase.firestore && global.firebase.firestore.FieldValue) {
      serverTimestampVal = global.firebase.firestore.FieldValue.serverTimestamp();
    } else if (db.app && db.app.firebase_ && db.app.firebase_.firestore && db.app.firebase_.firestore.FieldValue) {
      serverTimestampVal = db.app.firebase_.firestore.FieldValue.serverTimestamp();
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Perform transaction
    await db.runTransaction(async (transaction) => {
      const parentDocRef = db.collection("groups").doc(budgetId);
      const parentSnapshot = await transaction.get(parentDocRef);
      
      if (!parentSnapshot.exists) {
        throw new Error(`El presupuesto original ${budgetId} no existe.`);
      }

      const parentData = parentSnapshot.data();

      // Check if already split
      if (parentData.splitCompleted === true || parentData.status === "DESGLOSADO") {
        throw new Error(`Esta serie ya ha sido desglosada previamente.`);
      }

      // Check if eligible (multi-segment with active segments > 1)
      const allSegments = parentData.segments || [];
      const activeSegments = allSegments.filter(seg => {
        const hasId = seg.id && String(seg.id).trim() !== "";
        const hasDates = seg.in && seg.out && seg.in < seg.out;
        
        let hasRooms = false;
        const allocations = Array.isArray(seg.roomAllocations) ? seg.roomAllocations : [];
        if (allocations.length > 0) {
          hasRooms = allocations.some(a => Number(a.rooms || 0) > 0);
        } else {
          hasRooms = Number(seg.rooms || seg.pax || 0) > 0;
        }

        return hasId && hasDates && hasRooms;
      });

      if (activeSegments.length <= 1) {
        throw new Error("El presupuesto no califica para desglose automático (se requiere más de una estancia activa).");
      }

      // Verify unique group codes in segments
      const seenCodes = new Set();
      activeSegments.forEach(s => {
        const code = String(s.id).trim().toUpperCase();
        if (seenCodes.has(code)) {
          throw new Error(`La serie contiene códigos de grupo duplicados: ${code}`);
        }
        seenCodes.add(code);
      });

      // Verify conflicts with existing documents in database
      const childDocs = [];
      for (let i = 0; i < activeSegments.length; i++) {
        const seg = activeSegments[i];
        const childId = String(seg.id).trim();
        const childDocRef = db.collection("groups").doc(childId);
        const childSnapshot = await transaction.get(childDocRef);
        
        if (childSnapshot.exists) {
          const childData = childSnapshot.data();
          if (childData.parentSeriesId !== budgetId) {
            throw new Error(`Conflicto de código: Ya existe una reserva con el código ${childId} asociada a otro grupo.`);
          }
        }
        childDocs.push({ ref: childDocRef, seg: seg, index: i });
      }

      // Pricing validation and child generation
      let childTotalsSum = 0;
      const childWrites = [];

      childDocs.forEach(({ ref, seg, index }) => {
        const segmentRoomCounts = {};
        const allocations = Array.isArray(seg.roomAllocations) && seg.roomAllocations.length > 0
          ? seg.roomAllocations
          : [{ roomType: seg.roomType || 'DOBLE DE USO INDIVIDUAL', rooms: Number(seg.rooms || seg.pax || 0) }];
        
        allocations.forEach(alloc => {
          const rType = (alloc.roomType || 'DOBLE DE USO INDIVIDUAL').toUpperCase();
          segmentRoomCounts[rType] = (segmentRoomCounts[rType] || 0) + Number(alloc.rooms || 0);
        });

        const dates = generateDatesLocal(seg.in, seg.out);
        const segmentDailyConfig = {};
        let segmentTotal = 0;
        const segmentRoomingList = [];

        dates.forEach(d => {
          const originalConf = parentData.dailyConfig?.[d] || {};
          segmentDailyConfig[d] = {
            board: originalConf.board || parentData["Régimen"] || "AD",
            prices: originalConf.prices || {},
            counts: segmentRoomCounts,
            gratuities: originalConf.gratuities || {},
            discounts: originalConf.discounts || {}
          };

          Object.entries(segmentRoomCounts).forEach(([type, count]) => {
            if (count > 0) {
              let price = 0;
              let gratuities = 0;
              let discount = 0;
              const regime = originalConf.board || parentData["Régimen"] || "AD";
              const regimeShort = regime.split(' ')[0];

              if (originalConf.prices) {
                const pk = Object.keys(originalConf.prices).find(k => k.trim().toLowerCase() === type.trim().toLowerCase());
                price = pk ? parseFloat(originalConf.prices[pk] || 0) : 0;
                
                const gratKey = originalConf.gratuities ? Object.keys(originalConf.gratuities).find(k => k.trim().toLowerCase() === type.trim().toLowerCase()) : null;
                gratuities = gratKey ? parseInt(originalConf.gratuities[gratKey] || 0) : 0;

                const discKey = originalConf.discounts ? Object.keys(originalConf.discounts).find(k => k.trim().toLowerCase() === type.trim().toLowerCase()) : null;
                discount = discKey ? parseFloat(originalConf.discounts[discKey] || 0) : 0;
              }

              // Fallback to ratesOnlyGrid
              if (price === 0 && parentData.ratesOnlyGrid) {
                const boardKey = regimeShort;
                const grid = parentData.ratesOnlyGrid;
                if (grid[boardKey]) {
                  const gridPk = Object.keys(grid[boardKey]).find(k => k.trim().toLowerCase() === type.trim().toLowerCase());
                  if (gridPk) price = parseFloat(grid[boardKey][gridPk] || 0);
                }
                if (price === 0) {
                  const fallbackBoard = (parentData["Régimen"] || "AD").split(' ')[0];
                  if (grid[fallbackBoard]) {
                    const gridPk2 = Object.keys(grid[fallbackBoard]).find(k => k.trim().toLowerCase() === type.trim().toLowerCase());
                    if (gridPk2) price = parseFloat(grid[fallbackBoard][gridPk2] || 0);
                  }
                }
              }

              const payingRooms = Math.max(0, count - gratuities);
              const lineTotal = payingRooms * price * (1 - discount / 100);
              segmentTotal += lineTotal;

              const paxPerRoom = type.toLowerCase().includes("individual") ? 1 : 2;

              if (payingRooms > 0) {
                segmentRoomingList.push({
                  id: Date.now() + Math.random() + index,
                  hotel: parentData.Hotel_Asignado || parentData.Hotel || "Sercotel Guadiana",
                  type: type.toUpperCase(),
                  dateIn: d,
                  dateOut: d,
                  qty: payingRooms,
                  regime: regimeShort,
                  price: price,
                  pax: paxPerRoom,
                  nights: 1,
                  total: lineTotal.toFixed(2),
                  isService: false,
                  comision: 0
                });
              }

              if (gratuities > 0) {
                segmentRoomingList.push({
                  id: Date.now() + Math.random() + index + 0.5,
                  hotel: parentData.Hotel_Asignado || parentData.Hotel || "Sercotel Guadiana",
                  type: type.toUpperCase() + " (GRATUIDAD)",
                  dateIn: d,
                  dateOut: d,
                  qty: gratuities,
                  regime: regimeShort,
                  price: 0,
                  pax: paxPerRoom,
                  nights: 1,
                  total: "0.00",
                  isService: false,
                  comision: 0
                });
              }
            }
          });
        });

        childTotalsSum += segmentTotal;

        const childData = {
          Reserva: seg.id,
          uid: seg.id,
          "Nombre del Grupo": `${parentData["Nombre del Grupo"] || "Sin Nombre"} - ${seg.travelerGroupId || seg.id}`.toUpperCase(),
          Entrada: seg.in,
          Salida: seg.out,
          "Pax.": String(seg.pax || 0),
          declaredPax: String(seg.pax || 0),
          roomCounts: segmentRoomCounts,
          dailyConfig: segmentDailyConfig,
          "Importe(*)": String(segmentTotal.toFixed(2)),
          "RoomingList_JSON": JSON.stringify(segmentRoomingList),
          Estado: "Confirmado",
          Com_Estado_Interno: "CONFIRMADO",
          isMultiSegment: false,
          segments: [],
          
          // Traceability
          parentSeriesId: budgetId,
          sourceQuoteId: budgetId,
          isSeriesSegment: true,
          segmentIndex: index,
          confirmedAt: serverTimestampVal,
          confirmedBy: confirmedBy || "Sistema",
          confirmationSource: confirmationSource || "Directa",
          createdAt: serverTimestampVal,
          updatedAt: serverTimestampVal
        };

        COPY_WHITELIST.forEach(key => {
          if (parentData[key] !== undefined) {
            childData[key] = parentData[key];
          }
        });

        childData.tracking = JSON.stringify([
          {
            id: Date.now(),
            date: formattedDate,
            text: `Confirmada y registrada individualmente desglosada de la serie ${parentData.Reserva || parentData.uid || ""}.`
          }
        ]);

        childWrites.push({ ref, data: childData });
      });

      const parentTotal = parseFloat(parentData["Importe(*)"] || 0);
      if (Math.abs(childTotalsSum - parentTotal) > 0.05) {
        throw new Error(`Reconciliación fallida: La suma de subtotales desglosados (€${childTotalsSum.toFixed(2)}) difiere del total estimado del presupuesto (€${parentTotal.toFixed(2)}).`);
      }

      childWrites.forEach(({ ref, data }) => {
        transaction.set(ref, data);
      });

      let parentTrack = [];
      try {
        if (typeof parentData.tracking === 'string') {
          parentTrack = JSON.parse(parentData.tracking || "[]");
        } else if (Array.isArray(parentData.tracking)) {
          parentTrack = parentData.tracking;
        }
      } catch (e) {}

      parentTrack.unshift({
        id: Date.now(),
        date: formattedDate,
        text: `Serie confirmada y desglosada en reservas individuales: ${activeSegments.map(s => s.id).join(', ')}`
      });

      const parentUpdates = {
        Com_Estado_Interno: "DESGLOSADO",
        status: "DESGLOSADO",
        Estado: "Desglosado",
        excludeFromStatistics: true,
        splitCompleted: true,
        splitAt: serverTimestampVal,
        splitBy: confirmedBy || "Sistema",
        childReservationIds: activeSegments.map(s => s.id),
        tracking: JSON.stringify(parentTrack)
      };

      transaction.update(parentDocRef, parentUpdates);
    });
  }

  /**
   * confirmBudget: unified confirmation coordinator
   */
  async function confirmBudget({ budgetId, requestedStatus, confirmationSource, db, confirmedBy }) {
    if (!budgetId || !db) {
      throw new Error("Parámetros insuficientes para la confirmación.");
    }

    const docRef = db.collection("groups").doc(budgetId);
    const snapshot = await docRef.get();
    
    if (!snapshot.exists) {
      throw new Error(`El presupuesto ${budgetId} no existe.`);
    }

    const budget = snapshot.data();

    // Revalidate already split
    if (budget.splitCompleted === true || budget.status === "DESGLOSADO" || budget.Com_Estado_Interno === "DESGLOSADO") {
      throw new Error("Esta serie ya ha sido desglosada previamente.");
    }

    const allSegments = budget.segments || [];
    
    // Check if any segment is active (has dates & rooms) but lacks ID
    allSegments.forEach((seg, i) => {
      const hasDates = seg.in && seg.out && seg.in < seg.out;
      let hasRooms = false;
      const allocations = Array.isArray(seg.roomAllocations) ? seg.roomAllocations : [];
      if (allocations.length > 0) {
        hasRooms = allocations.some(a => Number(a.rooms || 0) > 0);
      } else {
        hasRooms = Number(seg.rooms || seg.pax || 0) > 0;
      }
      
      if (hasDates && hasRooms && (!seg.id || String(seg.id).trim() === "")) {
        throw new Error(`El segmento ${i + 1} tiene fechas y habitaciones configuradas pero carece de un código de grupo (ID) válido.`);
      }
    });

    const activeSegments = allSegments.filter(seg => {
      const hasId = seg.id && String(seg.id).trim() !== "";
      const hasDates = seg.in && seg.out && seg.in < seg.out;
      
      let hasRooms = false;
      const allocations = Array.isArray(seg.roomAllocations) ? seg.roomAllocations : [];
      if (allocations.length > 0) {
        hasRooms = allocations.some(a => Number(a.rooms || 0) > 0);
      } else {
        hasRooms = Number(seg.rooms || seg.pax || 0) > 0;
      }
      return hasId && hasDates && hasRooms;
    });

    const isMulti = budget.isMultiSegment === true && activeSegments.length > 1;

    if (requestedStatus === "CONFIRMADO" && isMulti) {
      const segIdsStr = activeSegments.map(s => s.id).join(", ");
      const msg = `Esta serie contiene ${activeSegments.length} estancias. Al confirmarla se crearán ${activeSegments.length} reservas independientes con los siguientes códigos: ${segIdsStr}.\n\n¿Deseas continuar?`;
      
      if (typeof window !== "undefined" && !window.confirm(msg)) {
        throw new Error("Operación cancelada por el usuario.");
      }

      await splitAndConfirmMultiSegment({
        budgetId,
        db,
        confirmedBy: confirmedBy || "Usuario",
        confirmationSource: confirmationSource || "Interfaz"
      });

      return { split: true, childIds: activeSegments.map(s => s.id) };
    } else {
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      let track = [];
      try {
        if (typeof budget.tracking === 'string') {
          track = JSON.parse(budget.tracking || "[]");
        } else if (Array.isArray(budget.tracking)) {
          track = budget.tracking;
        }
      } catch (e) {}

      track.unshift({
        id: Date.now(),
        date: formattedDate,
        text: `Estado -> ${requestedStatus}`
      });

      let serverTimestampVal = new Date();
      if (global.firebase && global.firebase.firestore && global.firebase.firestore.FieldValue) {
        serverTimestampVal = global.firebase.firestore.FieldValue.serverTimestamp();
      } else if (db.app && db.app.firebase_ && db.app.firebase_.firestore && db.app.firebase_.firestore.FieldValue) {
        serverTimestampVal = db.app.firebase_.firestore.FieldValue.serverTimestamp();
      }

      const updates = {
        Com_Estado_Interno: requestedStatus,
        updatedAt: serverTimestampVal,
        tracking: JSON.stringify(track)
      };

      if (requestedStatus === "CANCELADO") {
        updates.Estado = "ANULADA";
      } else if (requestedStatus === "CONFIRMADO") {
        updates.Estado = "Confirmado";
      }

      await docRef.update(updates);
      return { split: false };
    }
  }

  if (typeof exports !== 'undefined') {
    exports.splitAndConfirmMultiSegment = splitAndConfirmMultiSegment;
    exports.confirmBudget = confirmBudget;
  }
  global.splitAndConfirmMultiSegment = splitAndConfirmMultiSegment;
  global.confirmBudget = confirmBudget;

})(typeof window !== 'undefined' ? window : global);
