/**
 * ═════════════════════════════════════════════════════════════════════
 * NEXUS GROUPS — MesaChef Integration Service
 * ═════════════════════════════════════════════════════════════════════
 * Sincronización automática de grupos de 2027 en adelante con MP / PC
 * hacia la "Sala de Grupos" (conexión completa) en MesaChef.
 *
 * Reglas de negocio:
 * 1. Ámbito: Grupos con fecha de entrada >= 2027-01-01 y régimen MP o PC.
 * 2. Referencia: Nº de Reserva del grupo (reservaID único).
 * 3. Sala asignada: "Sala de Grupos" (con conexión completa).
 * 4. Mapeo de estados:
 *    - Confirmado -> "Confirmado"
 *    - Tentativa / Presupuesto / Bloqueo -> "Presupuesto"
 *    - Anulada / Cancelada -> "Cancelado"
 * 5. Destino: Colección Firestore `mesachef_grupos` (tiempo real).
 * ═════════════════════════════════════════════════════════════════════
 */

(function (global) {
  "use strict";

  var MESACHEF_COLLECTION = "mesachef_grupos";
  var DEFAULT_SALA = "Sala de Grupos";

  /**
   * Normaliza el ID de la reserva eliminando decimales o espacios
   */
  function normalizeReservaId(val) {
    if (!val) return "";
    var s = String(val).trim();
    if (s.endsWith(".0")) s = s.slice(0, -2);
    return s;
  }

  /**
   * Determina si una reserva pertenece ESTRICTAMENTE a 2027 o posterior (>= 2027)
   */
  function isYear2027OrLater(entryDateStr) {
    if (!entryDateStr) return false;
    if (typeof entryDateStr === "number") {
      // Número de serie Excel: 46388 corresponde al 01-01-2027
      if (entryDateStr >= 46388) return true;
      if (entryDateStr > 30000 && entryDateStr < 46388) return false; // 2026 o anterior
      return entryDateStr >= 2027;
    }
    var s = String(entryDateStr).trim();

    // Formato ISO YYYY-MM-DD o YYYY/MM/DD
    if (/^\d{4}/.test(s)) {
      var y = parseInt(s.substring(0, 4), 10);
      return y >= 2027;
    }
    // Formato español DD/MM/YYYY o DD-MM-YYYY
    var parts = s.split(/[-\/.]/);
    if (parts.length >= 3) {
      if (parts[2].length >= 4) {
        var yNum = parseInt(parts[2].substring(0, 4), 10);
        if (!isNaN(yNum)) return yNum >= 2027;
      }
      if (parts[0].length === 4) {
        var yFirst = parseInt(parts[0], 10);
        if (!isNaN(yFirst)) return yFirst >= 2027;
      }
    }
    var d = new Date(s);
    return !isNaN(d.getTime()) && d.getFullYear() >= 2027;
  }

  /**
   * Determina si el régimen incluye Media Pensión (MP) o Pensión Completa (PC)
   */
  function isMpOrPcRegimen(regimenStr) {
    if (!regimenStr) return false;
    var r = String(regimenStr).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    return (
      r === "MP" ||
      r === "PC" ||
      r.includes("MEDIA PENSION") ||
      r.includes("PENSION COMPLETA") ||
      r.includes("MP") ||
      r.includes("PC") ||
      r.includes("CENA") ||
      r.includes("ALMUERZO")
    );
  }

  /**
   * Mapea el estado de Nexus Groups al estado para MesaChef:
   * - Confirmada -> "Confirmado"
   * - Tentativa / Presupuesto -> "Presupuesto"
   * - Cancelada -> "Cancelado"
   */
  function mapMesachefStatus(statusStr) {
    if (!statusStr) return "Presupuesto";
    var st = String(statusStr).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (st.includes("CONFIRM") || st.includes("ACEPTAD") || st.includes("DEFINITIV")) {
      return "Confirmado";
    }
    if (st.includes("ANULAD") || st.includes("CANCEL") || st.includes("BAJA")) {
      return "Cancelado";
    }
    return "Presupuesto";
  }

  /**
   * Normaliza una fecha a formato ISO YYYY-MM-DD
   */
  function toIsoDate(dateVal) {
    if (!dateVal) return null;
    if (dateVal instanceof Date) {
      if (isNaN(dateVal.getTime())) return null;
      return dateVal.toISOString().split("T")[0];
    }
    var s = String(dateVal).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    if (/^\d{4}\/\d{2}\/\d{2}$/.test(s)) return s.replace(/\//g, "-");

    var parts = s.split(/[-\/.]/);
    if (parts.length >= 3) {
      var d = parts[0].padStart(2, "0");
      var m = parts[1].padStart(2, "0");
      var y = parts[2].substring(0, 4);
      if (d.length === 2 && y.length === 4) {
        return y + "-" + m + "-" + d;
      }
    }
    var parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
    return null;
  }

  /**
   * Genera el desglose diario de servicios de comedor (Almuerzos y Cenas)
   */
  function generateMealServices(entryDateStr, exitDateStr, paxCount, regimenStr, statusMesachef) {
    var services = [];
    var startIso = toIsoDate(entryDateStr);
    var endIso = toIsoDate(exitDateStr) || startIso;
    if (!startIso) return services;

    var isPc = String(regimenStr || "").toUpperCase().includes("PC");
    var startDate = new Date(startIso + "T12:00:00");
    var endDate = new Date(endIso + "T12:00:00");
    var current = new Date(startDate);

    while (current <= endDate) {
      var iso = current.toISOString().split("T")[0];
      var isLastDay = current.getTime() === endDate.getTime();

      // En MP: Cena diaria (excepto salida si no incluye almuerzo)
      if (!isLastDay) {
        services.push({
          fecha: iso,
          servicio: "Cena",
          pax: paxCount,
          sala: DEFAULT_SALA,
          estado: statusMesachef
        });
      }

      // En PC: Almuerzo y Cena diarios
      if (isPc) {
        services.push({
          fecha: iso,
          servicio: "Almuerzo",
          pax: paxCount,
          sala: DEFAULT_SALA,
          estado: statusMesachef
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return services;
  }

  /**
   * Prepara el objeto de datos formateado para MesaChef
   */
  function prepareMesachefPayload(groupRecord) {
    if (!groupRecord) return null;

    var reservaId = normalizeReservaId(
      groupRecord.reserva || groupRecord.Reserva || groupRecord.id || groupRecord.numReserva
    );
    if (!reservaId) return null;

    var entryDate = groupRecord.Entrada || groupRecord.entrada || groupRecord.fechaEntrada || groupRecord.fecha;
    if (!isYear2027OrLater(entryDate)) {
      return null; // Solo 2027 en adelante
    }

    var regimen = String(groupRecord["Régimen"] || groupRecord.regimen || groupRecord.Regimen || "MP").toUpperCase();
    if (!isMpOrPcRegimen(regimen)) {
      return null; // Solo MP o PC
    }

    var rawStatus = groupRecord.Estado || groupRecord.estado || groupRecord.status || "Tentativa";
    var mesachefStatus = mapMesachefStatus(rawStatus);

    var pax = parseInt(groupRecord["Pax."] || groupRecord.pax || groupRecord.Pax || groupRecord.comensales || 0, 10);
    if (isNaN(pax) || pax <= 0) pax = 1;

    var hotel = String(groupRecord.Hotel || groupRecord.hotel || groupRecord.Hotel_Asignado || "Sercotel Guadiana");
    if (hotel.toLowerCase().includes("cumbria")) {
      hotel = "Cumbria Spa & Hotel";
    } else {
      hotel = "Sercotel Guadiana";
    }

    var nombreGrupo = String(
      groupRecord.Grupo || groupRecord.nombre || groupRecord.cliente || groupRecord["Agencia / Cliente"] || "Grupo Reserva " + reservaId
    ).trim();

    var exitDate = groupRecord.Salida || groupRecord.salida || groupRecord.fechaSalida || entryDate;
    var services = generateMealServices(entryDate, exitDate, pax, regimen, mesachefStatus);

    return {
      id: reservaId,
      referencia: reservaId,
      nombreGrupo: nombreGrupo,
      hotel: hotel,
      sala: DEFAULT_SALA,
      conexionCompleta: true,
      pax: pax,
      regimen: regimen.includes("PC") ? "PC" : "MP",
      estado: mesachefStatus,
      estadoOrigenNexus: rawStatus,
      fechaEntrada: toIsoDate(entryDate),
      fechaSalida: toIsoDate(exitDate),
      servicios: services,
      observaciones: groupRecord.Observaciones || groupRecord.observaciones || groupRecord.Notas || "",
      menuMP: !!groupRecord.Logistica_MenuMP,
      menuPC: !!groupRecord.Logistica_MenuPC,
      origen: "Nexus Groups",
      actualizadoEn: new Date().toISOString()
    };
  }

  /**
   * Sincroniza un grupo individual con la colección de MesaChef en Firestore
   */
  function syncGroupToMesachef(groupRecord, options) {
    options = options || {};
    var payload = prepareMesachefPayload(groupRecord);

    if (!payload) {
      return Promise.resolve({ skipped: true, reason: "No cumple criterios (2027+ con MP/PC)" });
    }

    if (!window.db || typeof window.db.collection !== "function") {
      console.warn("[MesaChef] Firestore no disponible. Guardando en cache local.");
      try {
        var localCache = JSON.parse(localStorage.getItem("nexus_mesachef_cache") || "{}");
        localCache[payload.id] = payload;
        localStorage.setItem("nexus_mesachef_cache", JSON.stringify(localCache));
      } catch (e) {}
      return Promise.resolve({ success: true, localOnly: true, data: payload });
    }

    return window.db
      .collection(MESACHEF_COLLECTION)
      .doc(payload.id)
      .set(payload, { merge: true })
      .then(function () {
        console.log("🍽️ [MesaChef Sync] Grupo " + payload.id + " (" + payload.nombreGrupo + ") sincronizado en Sala de Grupos como \"" + payload.estado + "\"");
        if (typeof window.dispatchEvent === "function") {
          window.dispatchEvent(new CustomEvent("mesachef-synced", { detail: payload }));
        }
        return { success: true, data: payload };
      })
      .catch(function (err) {
        console.error("❌ [MesaChef Sync] Error al sincronizar reserva " + payload.id + ":", err);
        return { success: false, error: err };
      });
  }

  /**
   * Sincroniza en lote todos los grupos elegibles de 2027+ con MP/PC
   */
  function syncAllEligibleGroups(groupsList) {
    if (!Array.isArray(groupsList) || groupsList.length === 0) {
      return Promise.resolve({ count: 0, synced: [] });
    }

    var eligiblePayloads = [];
    groupsList.forEach(function (g) {
      var p = prepareMesachefPayload(g);
      if (p) eligiblePayloads.push(p);
    });

    if (eligiblePayloads.length === 0) {
      return Promise.resolve({ count: 0, message: "No se encontraron grupos de 2027+ con MP/PC para sincronizar." });
    }

    if (!window.db || typeof window.db.collection !== "function") {
      try {
        var localCache = JSON.parse(localStorage.getItem("nexus_mesachef_cache") || "{}");
        eligiblePayloads.forEach(function (p) { localCache[p.id] = p; });
        localStorage.setItem("nexus_mesachef_cache", JSON.stringify(localCache));
      } catch (e) {}
      return Promise.resolve({ count: eligiblePayloads.length, synced: eligiblePayloads, localOnly: true });
    }

    var batch = window.db.batch();
    eligiblePayloads.forEach(function (item) {
      var ref = window.db.collection(MESACHEF_COLLECTION).doc(item.id);
      batch.set(ref, item, { merge: true });
    });

    return batch
      .commit()
      .then(function () {
        console.log("✅ [MesaChef Sync] Sincronizados " + eligiblePayloads.length + " grupos 2027+ con MP/PC en MesaChef.");
        return { count: eligiblePayloads.length, synced: eligiblePayloads };
      })
      .catch(function (err) {
        console.error("❌ [MesaChef Batch Error]:", err);
        return { count: 0, error: err };
      });
  }

  // ── Exportación Global ──
  var MesaChefService = {
    MESACHEF_COLLECTION: MESACHEF_COLLECTION,
    DEFAULT_SALA: DEFAULT_SALA,
    normalizeReservaId: normalizeReservaId,
    isYear2027OrLater: isYear2027OrLater,
    isMpOrPcRegimen: isMpOrPcRegimen,
    mapMesachefStatus: mapMesachefStatus,
    generateMealServices: generateMealServices,
    prepareMesachefPayload: prepareMesachefPayload,
    syncGroupToMesachef: syncGroupToMesachef,
    syncAllEligibleGroups: syncAllEligibleGroups
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = MesaChefService;
  }
  if (typeof window !== "undefined") {
    global.MesaChefService = MesaChefService;
  }

})(typeof window !== "undefined" ? window : global);
