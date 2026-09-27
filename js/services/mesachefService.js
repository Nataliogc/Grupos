/**
 * ═════════════════════════════════════════════════════════════════════
 * NEXUS GROUPS — MesaChef Integration Service (Matrix v5.5)
 * ═════════════════════════════════════════════════════════════════════
 * Sincronización automática de grupos de 2027 en adelante con MP / PC
 * hacia el cuadrante Matrix de MesaChef (`mesa-chef-prod`).
 *
 * Reglas de hotel y salón:
 * - Hotel Sercotel Guadiana  -> hotel: "Guadiana", salon: "Eventos Grupos Alarcos"
 * - Cumbria Spa & Hotel      -> hotel: "Cumbria",  salon: "Eventos Restaurante"
 *
 * Reglas de negocio:
 * 1. Ámbito: Grupos con fecha de entrada >= 2027-01-01 y régimen MP o PC.
 * 2. Referencia: Nº de Reserva del grupo (reservaID único).
 * 3. Colección destino MesaChef: `reservas_salones` y `mesachef_grupos`.
 * 4. Mapeo de estados:
 *    - Confirmado -> "confirmada"
 *    - Tentativa / Presupuesto / Bloqueo -> "presupuesto"
 *    - Anulada / Cancelada -> "cancelada"
 * ═════════════════════════════════════════════════════════════════════
 */

(function (global) {
  "use strict";

  var MESACHEF_FIREBASE_CONFIG = {
    apiKey: "AIzaSyAXv_wKD48EFDe8FBQ-6m0XGUNoxSRiTJY",
    authDomain: "mesa-chef-prod.firebaseapp.com",
    projectId: "mesa-chef-prod",
    storageBucket: "mesa-chef-prod.firebasestorage.app",
    messagingSenderId: "43170330072",
    appId: "1:43170330072:web:bcdd09e39930ad08bf2ead"
  };

  var SALON_GUADIANA = "Eventos Grupos Alarcos";
  var SALON_CUMBRIA = "Eventos Restaurante";
  var COLLECTION_SALONES = "reservas_salones";
  var COLLECTION_GRUPOS = "mesachef_grupos";

  var mesachefDbInstance = null;

  /**
   * Obtiene o inicializa la instancia de Firestore para el proyecto MesaChef (mesa-chef-prod)
   */
  function getMesachefDb() {
    if (mesachefDbInstance) return mesachefDbInstance;

    if (typeof firebase !== "undefined" && typeof firebase.initializeApp === "function") {
      try {
        var existingApp = null;
        if (Array.isArray(firebase.apps)) {
          existingApp = firebase.apps.find(function (app) {
            return app && app.name === "mesachefApp";
          });
        }
        if (!existingApp) {
          existingApp = firebase.initializeApp(MESACHEF_FIREBASE_CONFIG, "mesachefApp");
        }
        mesachefDbInstance = existingApp.firestore();
        return mesachefDbInstance;
      } catch (err) {
        console.warn("[MesaChef Service] Error inicializando secondary app:", err);
      }
    }

    if (typeof window !== "undefined" && window.db) {
      return window.db;
    }
    return null;
  }

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
   * Mapea el estado de Nexus Groups a los estados estándar de MesaChef Matrix:
   * - Confirmada -> "confirmada"
   * - Tentativa / Presupuesto / Bloqueo -> "presupuesto"
   * - Cancelada / Anulada -> "cancelada"
   */
  function mapMesachefStatus(statusStr) {
    if (!statusStr) return "presupuesto";
    var st = String(statusStr).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (st.includes("CONFIRM") || st.includes("ACEPTAD") || st.includes("DEFINITIV")) {
      return "confirmada";
    }
    if (st.includes("ANULAD") || st.includes("CANCEL") || st.includes("BAJA")) {
      return "cancelada";
    }
    return "presupuesto";
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
   * Determina hotel y salón para MesaChef Matrix
   */
  function resolveHotelAndSalon(hotelRaw) {
    var h = String(hotelRaw || "").toLowerCase();
    if (h.includes("cumbria")) {
      return {
        hotelId: "Cumbria",
        hotelName: "Cumbria Spa & Hotel",
        salon: SALON_CUMBRIA
      };
    }
    return {
      hotelId: "Guadiana",
      hotelName: "Sercotel Guadiana",
      salon: SALON_GUADIANA
    };
  }

  /**
   * Prepara los documentos diarios para la colección `reservas_salones` de MesaChef Matrix
   */
  function prepareSalonDocuments(groupRecord) {
    if (!groupRecord) return [];

    var reservaId = normalizeReservaId(
      groupRecord.reserva || groupRecord.Reserva || groupRecord.id || groupRecord.numReserva || groupRecord.uid
    );
    if (!reservaId) return [];

    var entryDate = groupRecord.Entrada || groupRecord.entrada || groupRecord.fechaEntrada || groupRecord.fecha;
    if (!isYear2027OrLater(entryDate)) {
      return []; // Estrictamente solo 2027 en adelante
    }

    var regimen = String(groupRecord["Régimen"] || groupRecord.regimen || groupRecord.Regimen || "MP").toUpperCase();
    if (!isMpOrPcRegimen(regimen)) {
      return []; // Solo MP o PC
    }

    var rawStatus = groupRecord.Com_Estado_Interno || groupRecord.Estado || groupRecord.estado || groupRecord.status || "Tentativa";
    var mesachefStatus = mapMesachefStatus(rawStatus);

    var pax = parseInt(groupRecord["Pax."] || groupRecord.pax || groupRecord.Pax || groupRecord.totalPax || groupRecord.comensales || 0, 10);
    if (isNaN(pax) || pax <= 0) pax = 1;

    var hotelInfo = resolveHotelAndSalon(groupRecord.Hotel_Asignado || groupRecord.Hotel || groupRecord.hotel);
    var nombreGrupo = String(
      groupRecord["Nombre del Grupo"] || groupRecord.Grupo || groupRecord.nombre || groupRecord.cliente || groupRecord["Agencia / Cliente"] || "Grupo Reserva " + reservaId
    ).trim();

    var exitDate = groupRecord.Salida || groupRecord.salida || groupRecord.fechaSalida || entryDate;
    var startIso = toIsoDate(entryDate);
    var endIso = toIsoDate(exitDate) || startIso;
    if (!startIso) return [];

    var isPc = regimen.includes("PC");
    var docs = [];

    var startDate = new Date(startIso + "T12:00:00");
    var endDate = new Date(endIso + "T12:00:00");
    var current = new Date(startDate);

    while (current <= endDate) {
      var iso = current.toISOString().split("T")[0];
      var isLastDay = current.getTime() === endDate.getTime();

      // En MP: Cena cada noche de estancia (excepto el día de salida)
      if (!isLastDay) {
        var docIdCena = "nexus_" + reservaId + "_" + iso + "_cena";
        docs.push({
          id: docIdCena,
          reservaId: reservaId,
          origen: "Nexus Groups",
          hotel: hotelInfo.hotelId,
          salon: hotelInfo.salon,
          fecha: iso,
          cliente: nombreGrupo + " (Ref: " + reservaId + ")",
          contact: {
            tel: groupRecord.Telefono || groupRecord.telefono || "",
            email: groupRecord.Email || groupRecord.email || ""
          },
          estado: mesachefStatus,
          revisado: true,
          detalles: {
            jornada: "cena",
            montaje: "Banquete",
            hora: "21:00",
            pax_adultos: pax,
            pax_ninos: 0,
            incluido: true
          },
          notas: {
            interna: "[Nexus Groups] Ref: " + reservaId + " | Régimen: " + (isPc ? "PC" : "MP") + " | Pax: " + pax + " | Estancia: " + startIso + " al " + endIso,
            cliente: groupRecord.Observaciones || groupRecord.observaciones || groupRecord.Notas || ""
          },
          servicios: [
            {
              fecha: iso,
              hora: "21:00",
              concepto: "Cena Grupo " + (isPc ? "PC" : "MP"),
              uds: pax,
              precio: 0,
              total: 0
            }
          ],
          updated_at: new Date().toISOString()
        });
      }

      // En PC: Almuerzo diario (incluyendo estancia y salida)
      if (isPc) {
        var docIdAlmuerzo = "nexus_" + reservaId + "_" + iso + "_almuerzo";
        docs.push({
          id: docIdAlmuerzo,
          reservaId: reservaId,
          origen: "Nexus Groups",
          hotel: hotelInfo.hotelId,
          salon: hotelInfo.salon,
          fecha: iso,
          cliente: nombreGrupo + " (Ref: " + reservaId + ")",
          contact: {
            tel: groupRecord.Telefono || groupRecord.telefono || "",
            email: groupRecord.Email || groupRecord.email || ""
          },
          estado: mesachefStatus,
          revisado: true,
          detalles: {
            jornada: "almuerzo",
            montaje: "Banquete",
            hora: "14:00",
            pax_adultos: pax,
            pax_ninos: 0,
            incluido: true
          },
          notas: {
            interna: "[Nexus Groups] Ref: " + reservaId + " | Régimen: PC | Pax: " + pax + " | Estancia: " + startIso + " al " + endIso,
            cliente: groupRecord.Observaciones || groupRecord.observaciones || groupRecord.Notas || ""
          },
          servicios: [
            {
              fecha: iso,
              hora: "14:00",
              concepto: "Almuerzo Grupo PC",
              uds: pax,
              precio: 0,
              total: 0
            }
          ],
          updated_at: new Date().toISOString()
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return docs;
  }

  /**
   * Sincroniza un grupo individual hacia MesaChef (reservas_salones y mesachef_grupos)
   */
  function syncGroupToMesachef(groupRecord) {
    var salonDocs = prepareSalonDocuments(groupRecord);

    if (!salonDocs || salonDocs.length === 0) {
      return Promise.resolve({ skipped: true, reason: "No cumple criterios (solo 2027+ con MP/PC)" });
    }

    var targetDb = getMesachefDb();
    if (!targetDb) {
      console.warn("[MesaChef Service] Firestore de MesaChef no disponible.");
      return Promise.resolve({ success: false, reason: "No Firestore DB" });
    }

    var batch = targetDb.batch();

    // 1. Guardar cada servicio en reservas_salones
    salonDocs.forEach(function (docData) {
      var ref = targetDb.collection(COLLECTION_SALONES).doc(docData.id);
      batch.set(ref, docData, { merge: true });
    });

    // 2. Guardar ficha maestra en mesachef_grupos
    var firstDoc = salonDocs[0];
    var groupMasterRef = targetDb.collection(COLLECTION_GRUPOS).doc(firstDoc.reservaId);
    batch.set(groupMasterRef, {
      id: firstDoc.reservaId,
      referencia: firstDoc.reservaId,
      cliente: firstDoc.cliente,
      hotel: firstDoc.hotel,
      salon: firstDoc.salon,
      estado: firstDoc.estado,
      pax: firstDoc.detalles.pax_adultos,
      totalServicios: salonDocs.length,
      origen: "Nexus Groups",
      updated_at: new Date().toISOString()
    }, { merge: true });

    return batch
      .commit()
      .then(function () {
        console.log("🍽️ [MesaChef Sync] Reserva " + firstDoc.reservaId + " sincronizada con éxito en " + firstDoc.hotel + " (" + firstDoc.salon + "): " + salonDocs.length + " servicios creados/actualizados en " + COLLECTION_SALONES);
        return { success: true, count: salonDocs.length, hotel: firstDoc.hotel, salon: firstDoc.salon, docs: salonDocs };
      })
      .catch(function (err) {
        console.error("❌ [MesaChef Sync Error]:", err);
        return { success: false, error: err };
      });
  }

  /**
   * Sincroniza en lote una lista completa de grupos
   */
  function syncAllEligibleGroups(groupsList) {
    if (!Array.isArray(groupsList) || groupsList.length === 0) {
      return Promise.resolve({ count: 0 });
    }

    var targetDb = getMesachefDb();
    if (!targetDb) {
      return Promise.resolve({ success: false, reason: "No Firestore DB" });
    }

    var allDocs = [];
    groupsList.forEach(function (g) {
      var docs = prepareSalonDocuments(g);
      if (docs && docs.length > 0) {
        allDocs = allDocs.concat(docs);
      }
    });

    if (allDocs.length === 0) {
      return Promise.resolve({ count: 0, message: "No hay grupos 2027+ con MP/PC para sincronizar." });
    }

    var batch = targetDb.batch();
    allDocs.forEach(function (docData) {
      var ref = targetDb.collection(COLLECTION_SALONES).doc(docData.id);
      batch.set(ref, docData, { merge: true });
    });

    return batch
      .commit()
      .then(function () {
        console.log("✅ [MesaChef Sync] Sincronizados " + allDocs.length + " servicios de salones en MesaChef Matrix.");
        return { count: allDocs.length, totalServices: allDocs.length };
      })
      .catch(function (err) {
        console.error("❌ [MesaChef Sync Batch Error]:", err);
        return { count: 0, error: err };
      });
  }

  // ── Exportación Global ──
  var MesaChefService = {
    MESACHEF_FIREBASE_CONFIG: MESACHEF_FIREBASE_CONFIG,
    SALON_GUADIANA: SALON_GUADIANA,
    SALON_CUMBRIA: SALON_CUMBRIA,
    COLLECTION_SALONES: COLLECTION_SALONES,
    COLLECTION_GRUPOS: COLLECTION_GRUPOS,
    getMesachefDb: getMesachefDb,
    normalizeReservaId: normalizeReservaId,
    isYear2027OrLater: isYear2027OrLater,
    isMpOrPcRegimen: isMpOrPcRegimen,
    mapMesachefStatus: mapMesachefStatus,
    resolveHotelAndSalon: resolveHotelAndSalon,
    prepareSalonDocuments: prepareSalonDocuments,
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
