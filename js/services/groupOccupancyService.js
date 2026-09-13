/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Group Occupancy & Room Distribution Service
 * ═══════════════════════════════════════════════════════════
 * Pure functions for:
 * 1. Daily occupancy aggregation by Hotel + Reserva + Fecha.
 * 2. Automatic proposal generation (Dobles = floor(pax/2), Ind = pax%2).
 * 3. Strict occupancy validation (Ind*1 + Dbl*2 + Tpl*3 + Cua*4 === Pax).
 * 4. Room classification by real occupancy (1=Ind, 2=Dbl, 3=Tpl, 4=Cua, DUI=Ind).
 * 5. Distribution state management (pendiente, propuesta, confirmada, modificada).
 * 6. Non-destructive separation of original Excel data vs reviewed distributions.
 *
 * Can be loaded:
 *   - Browser: <script src="js/services/groupOccupancyService.js"></script>
 *   - Node.js: const GroupOccupancyService = require('./js/services/groupOccupancyService.js');
 * ═══════════════════════════════════════════════════════════
 */

(function (global) {
  "use strict";

  // Helper: Normalize date string to ISO YYYY-MM-DD
  function toIsoDate(val) {
    if (!val || val === "---") return "";
    var s = String(val).trim();
    var num = parseFloat(s);
    if (!isNaN(num) && num > 40000 && num < 60000 && !s.includes("/") && !s.includes("-")) {
      try {
        var d = new Date(Math.round((num - 25569) * 86400 * 1000));
        if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
      } catch (e) {}
    }
    if (/^\d{4}[-\/]\d{2}[-\/]\d{2}/.test(s)) return s.substring(0, 10).replace(/\//g, "-");
    var parts = s.split(/[-\/.]/);
    if (parts.length === 3) {
      var dStr = parts[0], mStr = parts[1], yStr = parts[2];
      if (dStr.length <= 2 && yStr.length >= 4) {
        return yStr.padStart(4, "0") + "-" + mStr.padStart(2, "0") + "-" + dStr.padStart(2, "0");
      }
      if (dStr.length >= 4) {
        return dStr.padStart(4, "0") + "-" + mStr.padStart(2, "0") + "-" + yStr.padStart(2, "0");
      }
      var yr = parseInt(yStr, 10);
      if (yr < 100) yr += 2000;
      return String(yr) + "-" + mStr.padStart(2, "0") + "-" + dStr.padStart(2, "0");
    }
    return "";
  }

  // Helper: Generate list of stay nights [Entrada, Salida) - Salida does not count
  function generateStayNights(inDateStr, outDateStr) {
    var nights = [];
    var inIso = toIsoDate(inDateStr);
    var outIso = toIsoDate(outDateStr);
    if (!inIso || !outIso) return nights;

    var cur = new Date(inIso + "T12:00:00Z");
    var end = new Date(outIso + "T12:00:00Z");
    if (isNaN(cur.getTime()) || isNaN(end.getTime()) || cur >= end) return nights;

    while (cur < end) {
      nights.push(cur.toISOString().split("T")[0]);
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return nights;
  }

  function normalizeHotelName(value) {
    var raw = String(value || "").trim();
    var key = raw.toLowerCase().replace(/\s*&\s*/g, "&").replace(/\s+/g, " ");

    if (key.includes("guadiana") || key.includes("sercotel guadiana")) {
      return "Sercotel Guadiana";
    }

    if (key.includes("cumbria") || key.includes("spa&hotel")) {
      return "Cumbria Spa&Hotel";
    }

    return raw || "Sercotel Guadiana";
  }

  // ── 1. Automatic Proposal Generator ─────────────────────────
  // Regla requerida:
  // Dobles = floor(Pax / 2)
  // Individuales = Pax % 2
  // Triples = 0
  // Cuádruples = 0
  function generateDefaultProposal(pax) {
    var p = parseInt(pax, 10);
    if (isNaN(p) || p < 0) p = 0;
    var dobles = Math.floor(p / 2);
    var individuales = p % 2;
    return {
      individuales: individuales,
      dobles: dobles,
      triples: 0,
      cuadruples: 0,
      totalHabitaciones: dobles + individuales,
      paxCalculado: (individuales * 1) + (dobles * 2),
      paxOriginal: p,
      status: "propuesta"
    };
  }

  // ── 2. Strict Occupancy Validator ───────────────────────────
  // Validación: Ind*1 + Dbl*2 + Tpl*3 + Cua*4 === Personas alojadas
  // Soporta gratuidades: si hay gratuidades, los pax de pago son (calculatedPax - totalFreePax)
  function validateOccupancyMatch(distribution, targetPax) {
    var p = parseInt(targetPax, 10);
    if (isNaN(p)) p = 0;
    var ind = parseInt(distribution.individuales, 10) || 0;
    var dbl = parseInt(distribution.dobles, 10) || 0;
    var tpl = parseInt(distribution.triples, 10) || 0;
    var cua = parseInt(distribution.cuadruples, 10) || 0;

    var freeInd = parseInt(distribution.gratuitiesInd !== undefined ? distribution.gratuitiesInd : (distribution.gratuitiesCount || 0), 10) || 0;
    var freeDbl = parseInt(distribution.gratuitiesDbl, 10) || 0;
    var freeTpl = parseInt(distribution.gratuitiesTpl, 10) || 0;
    var freeCua = parseInt(distribution.gratuitiesCua, 10) || 0;
    var totalFreePax = (freeInd * 1) + (freeDbl * 2) + (freeTpl * 3) + (freeCua * 4);
    if (totalFreePax === 0 && distribution.gratuitiesCount) {
      totalFreePax = parseInt(distribution.gratuitiesCount, 10) || 0;
    }

    var calculatedPax = (ind * 1) + (dbl * 2) + (tpl * 3) + (cua * 4);
    var payingPax = Math.max(0, calculatedPax - totalFreePax);
    var totalRooms = ind + dbl + tpl + cua;

    // Válido si coincide el total físico (calculatedPax === p),
    // o si coincide el total de pago excluyendo gratuidades (payingPax === p),
    // o si el targetPax en reserva era el total neto y las gratuitas se sumaron (calculatedPax === p + totalFreePax)
    var isValid = (calculatedPax === p) || (totalFreePax > 0 && payingPax === p) || (totalFreePax > 0 && calculatedPax === (p + totalFreePax));

    return {
      isValid: isValid,
      calculatedPax: calculatedPax,
      payingPax: payingPax,
      totalFreePax: totalFreePax,
      targetPax: p,
      difference: isValid ? 0 : (calculatedPax - p),
      totalRooms: totalRooms,
      errorMessage: isValid ? null : "La distribución no coincide con el número total de personas."
    };
  }

  // ── 3. Room Classifier by Real Occupancy ─────────────────────
  // Ocupación real manda sobre capacidad física:
  // 1 Pers. = Individual (incluyendo DUI)
  // 2 Pers. = Doble
  // 3 Pers. = Triple
  // 4 Pers. = Cuádruple
  function classifyRoomByOccupancy(description, cant) {
    var desc = String(description || "").trim().toUpperCase();
    var count = parseInt(cant, 10);
    if (isNaN(count) || count <= 0) {
      var matchLeadingNum = desc.match(/^(\d+)\s+/);
      count = matchLeadingNum ? parseInt(matchLeadingNum[1], 10) : 1;
    }

    var pers = null;
    var matchPers = desc.match(/(\d+)\s*(?:PERS|PAX|PERSONA)/);
    if (matchPers) {
      pers = parseInt(matchPers[1], 10);
    }

    var category = "desconocido";
    if (pers === 1) {
      category = "individual";
    } else if (pers === 2) {
      category = "doble";
    } else if (pers === 3) {
      category = "triple";
    } else if (pers === 4) {
      category = "cuadruple";
    } else if (pers > 4) {
      category = "cuadruple";
    } else {
      // Fallback si no tiene "Pers." explícito
      if (desc.includes("DUI") || desc.includes("USO INDIVIDUAL") || desc.includes("INDIVIDUAL") || desc.includes("SINGLE") || desc.includes("SGL")) {
        category = "individual";
        pers = 1;
      } else if (desc.includes("TRIPLE") || desc.includes("TPL") || desc.includes("SUPLETORIA")) {
        category = "triple";
        pers = 3;
      } else if (desc.includes("CUADRUPLE") || desc.includes("CUÁDRUPLE") || desc.includes("CUA")) {
        category = "cuadruple";
        pers = 4;
      } else if (desc.includes("DOBLE") || desc.includes("DBL") || desc.includes("TWIN") || desc.includes("SUITE") || desc.includes("SUI") || desc.includes("S.SUP") || desc.includes("SSUP")) {
        category = "doble";
        pers = 2;
      }
    }

    return {
      category: category, // 'individual' | 'doble' | 'triple' | 'cuadruple'
      cant: count,
      persPerRoom: pers || 2,
      totalPax: count * (pers || 2)
    };
  }

  // ── 4. Parse Saved Distributions JSON Safe ──────────────────
  function parseSavedDistributions(jsonStrOrObj) {
    if (!jsonStrOrObj) return {};
    if (typeof jsonStrOrObj === "object") return jsonStrOrObj;
    try {
      var parsed = JSON.parse(jsonStrOrObj);
      return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  // ── 4b. Fingerprint & Validation Snapshot (Req 12) ──────────
  function fnv1aHex(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    return ("0000000" + h.toString(16)).slice(-8);
  }

  function normalizeRegimenLocal(s) {
    if (!s) return "";
    var v = String(s).toUpperCase().trim();
    if (v.includes("COMPLETA") || v === "PC") return "PC";
    if (v.includes("MEDIA") || v === "MP") return "MP";
    if (v.includes("DESAYUNO") || v === "HD" || v === "AD" || v.includes("ALOJAMIENTO Y DESAYUNO")) return "HD";
    if (v.includes("SOLO") || v === "HA" || v === "SA" || v.includes("SOLO ALOJAMIENTO")) return "HA";
    return v;
  }

  function generateValidationFingerprint(lines) {
    lines = lines || [];
    var totalPax = 0;
    var totalPernoct = 0;
    var totalImporte = 0.0;
    var minEntrada = "";
    var maxSalida = "";
    var maxNoches = 0;
    var regimenSet = new Set();
    var estadoReserva = "Confirmada";

    var normalizedLines = lines.map(function (l) {
      var p = parseInt(l.pax, 10) || 0;
      var inIso = toIsoDate(l.inDate || l.entrada);
      var outIso = toIsoDate(l.outDate || l.salida);
      var nch = parseInt(l.noches, 10) || 0;
      if (nch <= 0 && inIso && outIso) {
        var d1 = new Date(inIso + "T12:00:00Z");
        var d2 = new Date(outIso + "T12:00:00Z");
        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d2 > d1) {
          nch = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        }
      }
      if (nch <= 0) nch = 1;

      var pn = parseInt(l.pernoct, 10) || 0;
      if (pn <= 0 && p > 0) {
        pn = p * nch;
      }

      var imp = 0.0;
      if (typeof l.importe === "number") {
        imp = isNaN(l.importe) ? 0.0 : l.importe;
      } else if (l.importe) {
        if (typeof window !== "undefined" && window.NexusUtils && typeof window.NexusUtils.parseNum === "function") {
          imp = window.NexusUtils.parseNum(l.importe);
        } else {
          var sImp = String(l.importe).trim().replace(/€/g, "").replace(/\s/g, "");
          if (sImp.includes(",") && sImp.includes(".")) {
            if (sImp.lastIndexOf(",") > sImp.lastIndexOf(".")) sImp = sImp.replace(/\./g, "").replace(",", ".");
            else sImp = sImp.replace(/,/g, "");
          } else if (sImp.includes(",")) {
            sImp = sImp.replace(",", ".");
          }
          var pImp = parseFloat(sImp);
          imp = isNaN(pImp) ? 0.0 : pImp;
        }
      }

      var reg = normalizeRegimenLocal(l.regimen);
      var est = String(l.estado || "Confirmada").trim();
      var lid = String(l.linea || "").trim();

      totalPax += p;
      totalPernoct += pn;
      totalImporte += imp;
      if (!minEntrada || (inIso && inIso < minEntrada)) minEntrada = inIso;
      if (!maxSalida || (outIso && outIso > maxSalida)) maxSalida = outIso;
      if (nch > maxNoches) maxNoches = nch;
      if (reg) regimenSet.add(reg);
      if (est.toLowerCase().includes("anul") || est.toLowerCase().includes("cancel") || est.toLowerCase().includes("baja")) estadoReserva = "Anulada";
      else if (est.toLowerCase().includes("presup")) estadoReserva = "Presupuesto";

      return [lid, p, pn, inIso, outIso, nch, imp.toFixed(2), reg, estadoReserva].join(":");
    });

    // Orden canónico de líneas para ser inmune al orden de filas en el Excel
    normalizedLines.sort();
    var canonicalString = normalizedLines.join("|");
    var hash = fnv1aHex(canonicalString);

    return {
      hash: hash,
      canonicalString: canonicalString,
      totalPax: totalPax,
      totalPernoct: totalPernoct,
      totalImporte: totalImporte,
      minEntrada: minEntrada,
      maxSalida: maxSalida,
      maxNoches: maxNoches,
      regimen: Array.from(regimenSet).sort().join(", "),
      estadoReserva: estadoReserva,
      lineCount: lines.length
    };
  }

  function createValidationSnapshot(entry, user) {
    var fp = generateValidationFingerprint(entry.contributingLines || []);
    return {
      pax: fp.totalPax,
      pernoct: fp.totalPernoct,
      entrada: fp.minEntrada,
      salida: fp.maxSalida,
      noches: fp.maxNoches,
      importe: fp.totalImporte,
      regimen: fp.regimen,
      estadoReserva: fp.estadoReserva,
      lineCount: fp.lineCount,
      fingerprint: fp.hash,
      canonicalString: fp.canonicalString,
      validatedAt: new Date().toISOString(),
      validatedBy: user || "Usuario"
    };
  }

  function compareOriginWithSnapshot(currentLines, savedSnapshot) {
    if (!savedSnapshot) {
      return { isMatch: true, reasons: [], changedFields: [] };
    }

    var currentFp = generateValidationFingerprint(currentLines || []);
    var reasons = [];
    var changedFields = [];

    // 1. Importe (Dato de control principal, Req 12 - tolerancia de 0.50 € para evitar falsos positivos por formato)
    var diffImporte = Math.abs((currentFp.totalImporte || 0) - (savedSnapshot.importe || 0));
    if (diffImporte > 0.50) {
      reasons.push("Revisión necesaria: ha cambiado el importe de la reserva (de " + Number(savedSnapshot.importe || 0).toFixed(2) + " € a " + Number(currentFp.totalImporte || 0).toFixed(2) + " €)");
      changedFields.push("importe");
    }

    // 2. Pax
    if (currentFp.totalPax !== (savedSnapshot.pax || 0)) {
      reasons.push("Revisión necesaria: ha cambiado el número de personas (de " + (savedSnapshot.pax || 0) + " a " + currentFp.totalPax + " Pax)");
      changedFields.push("pax");
    }

    // 3. Fechas de estancia
    if (currentFp.minEntrada && savedSnapshot.entrada && (currentFp.minEntrada !== savedSnapshot.entrada || currentFp.maxSalida !== savedSnapshot.salida)) {
      reasons.push("Revisión necesaria: han cambiado las fechas de estancia (Entrada: " + currentFp.minEntrada + ", Salida: " + currentFp.maxSalida + ")");
      changedFields.push("fechas");
    }

    // 4. Noches (solo si el snapshot guardado tenía noches > 0 y hubo cambio real)
    if (savedSnapshot.noches > 0 && currentFp.maxNoches > 0 && currentFp.maxNoches !== savedSnapshot.noches) {
      reasons.push("Revisión necesaria: ha cambiado el número de noches (de " + (savedSnapshot.noches || 0) + " a " + currentFp.maxNoches + ")");
      changedFields.push("noches");
    }

    // 5. Pernoctaciones (solo si el snapshot guardado tenía pernoct > 0 y hubo cambio real)
    if (savedSnapshot.pernoct > 0 && currentFp.totalPernoct > 0 && currentFp.totalPernoct !== savedSnapshot.pernoct) {
      reasons.push("Revisión necesaria: ha cambiado el número de pernoctaciones (de " + (savedSnapshot.pernoct || 0) + " a " + currentFp.totalPernoct + ")");
      changedFields.push("pernoct");
    }

    // 6. Régimen (normalizado, insensible a mayúsculas/espacios/sinónimos)
    var regCur = normalizeRegimenLocal(currentFp.regimen);
    var regSnap = normalizeRegimenLocal(savedSnapshot.regimen);
    if (regCur && regSnap && regCur !== regSnap) {
      reasons.push("Revisión necesaria: ha cambiado el régimen (de " + regSnap + " a " + regCur + ")");
      changedFields.push("regimen");
    }

    // 7. Estado de reserva (insensible a mayúsculas/minúsculas)
    var estCur = String(currentFp.estadoReserva || "").toUpperCase();
    var estSnap = String(savedSnapshot.estadoReserva || "").toUpperCase();
    if (estCur && estSnap && estCur !== estSnap) {
      reasons.push("Revisión necesaria: la reserva ha cambiado de estado (a " + currentFp.estadoReserva + ")");
      changedFields.push("estado");
    }

    // 8. Altas o bajas de líneas (solo alertar si también cambió el total de pax o importe)
    if (savedSnapshot.lineCount && currentFp.lineCount !== savedSnapshot.lineCount) {
      if (currentFp.totalPax !== (savedSnapshot.pax || 0) || diffImporte > 0.50) {
        reasons.push("Revisión necesaria: se han añadido o eliminado líneas en la reserva");
        changedFields.push("lineCount");
      }
    }

    return {
      isMatch: reasons.length === 0,
      reasons: reasons,
      changedFields: changedFields
    };
  }

  // ── 5. Daily Breakdown Calculation ──────────────────────────
  // Agrupa por Hotel + Reserva + Fecha
  // Entrada <= Fecha < Salida (la fecha de salida NO genera alojamiento)
  // Si coinciden varias líneas en una fecha, suma sus Pax.
  function calculateDailyOccupancyMatrix(rawLines, savedDistributionsByReserva) {
    savedDistributionsByReserva = savedDistributionsByReserva || {};
    var matrixMap = new Map(); // Key: `${hotel}|||${reserva}|||${fecha}`

    (rawLines || []).forEach(function (line, lineIdx) {
      var reserva = String(line["Reserva"] || line["id"] || "").trim().replace(/\.0$/, "");
      if (!reserva || reserva === "-" || reserva.toUpperCase().includes("TOTAL")) return;

      var hotel = normalizeHotelName(line["Hotel_Asignado"] || line["Hotel"] || "Sercotel Guadiana");
      var inDate = line["Entrada"] || line["Desde"];
      var outDate = line["Salida"] || line["Hasta"];
      var paxLine = parseInt(line["Pax."] || line["Pax"] || line["Pers."] || 0, 10);
      if (isNaN(paxLine)) paxLine = 0;

      var noches = parseInt(line["Noches"] || line["Días"] || line["Dias"] || 0, 10);
      if ((isNaN(noches) || noches <= 0) && inDate && outDate) {
        var d1 = new Date(toIsoDate(inDate) + "T12:00:00Z");
        var d2 = new Date(toIsoDate(outDate) + "T12:00:00Z");
        if (!isNaN(d1.getTime()) && !isNaN(d2.getTime()) && d2 > d1) {
          noches = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        }
      }
      if (isNaN(noches) || noches <= 0) noches = 1;

      var pernoct = parseInt(line["Pernoct."] || line["Pernoctaciones"] || 0, 10);
      if ((isNaN(pernoct) || pernoct <= 0) && paxLine > 0) {
        pernoct = paxLine * noches;
      }
      var regimen = String(
        line["Régimen"] ||
        line["Regimen"] ||
        line["Reg."] ||
        line["regimen"] ||
        line["regime"] ||
        line["Tipo de Régimen"] ||
        line["Regimen_Alimenticio"] ||
        ""
      ).trim();
      if ((!regimen || regimen === "-" || regimen === "---") && (line["RoomingList_JSON"] || line["roomingList"])) {
        try {
          var rawRl = line["RoomingList_JSON"] || line["roomingList"];
          var parsedRl = typeof rawRl === "string" ? JSON.parse(rawRl) : rawRl;
          if (Array.isArray(parsedRl)) {
            var foundAny = parsedRl.find(function(it) {
              var r = it.regime || it.regimen || it["Régimen"] || it["Regimen"] || it.reg;
              return r && r !== "-" && r !== "---";
            });
            if (foundAny) {
              regimen = String(foundAny.regime || foundAny.regimen || foundAny["Régimen"] || foundAny["Regimen"] || foundAny.reg).trim();
              if (regimen === "AD") regimen = "HD";
              if (regimen === "SA") regimen = "HA";
            }
          }
        } catch (e) {}
      }
      var groupName = String(line["Nombre del Grupo"] || line["Grupo"] || line["name"] || "Sin Nombre").trim();
      var estado = String(line["Estado"] || "Confirmada").trim();
      var lineaId = String(line["precios"] || line["_linea"] || line["_rowNum"] || (lineIdx + 1)).trim();

      var stayNights = generateStayNights(inDate, outDate);

      stayNights.forEach(function (nightDate) {
        var key = hotel + "|||" + reserva + "|||" + nightDate;
        if (!matrixMap.has(key)) {
          matrixMap.set(key, {
            hotel: hotel,
            reserva: reserva,
            nombreGrupo: groupName,
            fecha: nightDate,
            regimenSet: new Set(),
            pax: 0,
            estado: estado,
            contributingLines: [],
            warnings: []
          });
        }
        var entry = matrixMap.get(key);
        entry.pax += paxLine;
        if (regimen) entry.regimenSet.add(regimen);
        if (estado.toLowerCase().includes("anul")) entry.estado = "Anulada";

        entry.contributingLines.push({
          linea: lineaId,
          pax: paxLine,
          regimen: regimen,
          inDate: inDate,
          outDate: outDate,
          noches: noches,
          pernoct: pernoct,
          precio: line["Precio"],
          importe: line["Importe"] || line["Importe(*)"] || line["importe"] || line["importeTotal"] || line["ImporteTotal"] || 0,
          descripcion: line["Descripción"] || line["Descripcion"],
          cant: line["Cant."] || line["Cant"],
          roomingList: line["RoomingList_JSON"] || line["roomingList"] || null
        });
      });
    });

    // Proyectamos cada día con su estado y propuesta/distribución
    var result = [];
    matrixMap.forEach(function (entry) {
      var normId = (typeof window !== "undefined" && window.NexusUtils && typeof window.NexusUtils.normalizeId === "function")
        ? window.NexusUtils.normalizeId(entry.reserva)
        : String(entry.reserva || "").trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");
      var normKey = String(entry.reserva || "").trim().replace(/\s+/g, "");
      var reservaSaved = savedDistributionsByReserva[normId] ||
                         savedDistributionsByReserva[normKey] ||
                         savedDistributionsByReserva[entry.reserva] || {};
      var dateSaved = reservaSaved[entry.fecha] || null;

      var proposal = generateDefaultProposal(entry.pax);
      var activeDist = null;
      var status = "propuesta"; // 'pendiente' | 'propuesta' | 'confirmada' | 'modificada' | 'validada_sin_cambios' | 'revision_necesaria'
      var observations = "";
      var reviewedBy = "";
      var reviewedAt = "";
      var revisionReasons = [];
      var previousDistribution = null;

      if (dateSaved && (dateSaved.status || dateSaved.dobles !== undefined || dateSaved.individuales !== undefined)) {
        status = dateSaved.status || "confirmada";
        observations = dateSaved.observations || "";
        reviewedBy = dateSaved.reviewedBy || "";
        reviewedAt = dateSaved.reviewedAt || "";

        // Si tiene snapshot de validación previa, comparar huella y campos clave (Req 12)
        if (dateSaved.validationSnapshot && (status === "confirmada" || status === "modificada" || status === "validada_sin_cambios")) {
          var comp = compareOriginWithSnapshot(entry.contributingLines, dateSaved.validationSnapshot);
          if (!comp.isMatch) {
            status = "revision_necesaria";
            revisionReasons = comp.reasons;
            previousDistribution = {
              individuales: parseInt(dateSaved.individuales, 10) || 0,
              dobles: parseInt(dateSaved.dobles, 10) || 0,
              triples: parseInt(dateSaved.triples, 10) || 0,
              cuadruples: parseInt(dateSaved.cuadruples, 10) || 0,
              totalHabitaciones: (parseInt(dateSaved.individuales, 10) || 0) +
                                 (parseInt(dateSaved.dobles, 10) || 0) +
                                 (parseInt(dateSaved.triples, 10) || 0) +
                                 (parseInt(dateSaved.cuadruples, 10) || 0),
              status: dateSaved.status
            };
          } else {
            status = "validada_sin_cambios";
          }
        }

        if (status === "confirmada" || status === "modificada" || status === "validada_sin_cambios" || status === "revision_necesaria") {
          activeDist = {
            individuales: parseInt(dateSaved.individuales, 10) || 0,
            dobles: parseInt(dateSaved.dobles, 10) || 0,
            triples: parseInt(dateSaved.triples, 10) || 0,
            cuadruples: parseInt(dateSaved.cuadruples, 10) || 0,
            totalHabitaciones: (parseInt(dateSaved.individuales, 10) || 0) +
                               (parseInt(dateSaved.dobles, 10) || 0) +
                               (parseInt(dateSaved.triples, 10) || 0) +
                               (parseInt(dateSaved.cuadruples, 10) || 0)
          };
        } else if (status === "pendiente") {
          activeDist = {
            individuales: null,
            dobles: null,
            triples: null,
            cuadruples: null,
            totalHabitaciones: null
          };
        } else {
          activeDist = {
            individuales: proposal.individuales,
            dobles: proposal.dobles,
            triples: proposal.triples,
            cuadruples: proposal.cuadruples,
            totalHabitaciones: proposal.totalHabitaciones
          };
        }
      } else {
        status = "propuesta";
        activeDist = {
          individuales: proposal.individuales,
          dobles: proposal.dobles,
          triples: proposal.triples,
          cuadruples: proposal.cuadruples,
          totalHabitaciones: proposal.totalHabitaciones
        };
      }

      var isDefinitive = (status === "confirmada" || status === "modificada" || status === "validada_sin_cambios");

      // Función auxiliar para normalizar fechas de rooming items a YYYY-MM-DD
      function normDateIso(d) {
        if (!d) return "";
        var s = String(d).trim().split("T")[0];
        if (s.includes("/")) {
          var p = s.split("/");
          if (p.length === 3) {
            if (p[0].length === 4) return p[0] + "-" + p[1].padStart(2, "0") + "-" + p[2].padStart(2, "0");
            return p[2] + "-" + p[1].padStart(2, "0") + "-" + p[0].padStart(2, "0");
          }
        }
        return s;
      }

      // Buscar si existen habitaciones en RoomingList_JSON para esta fecha específica
      var foundRoomingReg = null;
      var anyRoomingReg = null;
      var roomingDaySum = 0;
      var hasRoomingDayLodging = false;
      var roomingInd = 0;
      var roomingDbl = 0;
      var roomingTpl = 0;
      var roomingCua = 0;
      var roomingPax = 0;
      var roomingTotalRooms = 0;
      var seenRoomingLists = new Set();
      var seenItemKeys = new Set();

      (entry.contributingLines || []).forEach(function (cl) {
        if (cl.roomingList) {
          var rlKey = typeof cl.roomingList === "string" ? cl.roomingList.trim() : JSON.stringify(cl.roomingList);
          if (!rlKey || rlKey === "[]" || rlKey === "{}" || rlKey === "null") return;
          if (seenRoomingLists.has(rlKey)) return;
          seenRoomingLists.add(rlKey);

          try {
            var rlItems = typeof cl.roomingList === "string" ? JSON.parse(cl.roomingList) : cl.roomingList;
            if (Array.isArray(rlItems)) {
              rlItems.forEach(function (item, itemIdx) {
                var itemReg = item.regime || item.regimen || item["Régimen"] || item["Regimen"] || item.reg;
                if (itemReg && typeof itemReg === "string") {
                  itemReg = itemReg.trim();
                  if (itemReg === "AD") itemReg = "HD";
                  if (itemReg === "SA") itemReg = "HA";
                }
                if (!anyRoomingReg && itemReg && itemReg !== "-" && itemReg !== "---") {
                  anyRoomingReg = itemReg;
                }
                if (item.isService && (!itemReg || itemReg === "-" || itemReg === "---")) return;

                var dIn = normDateIso(item.dateIn || item.date || item.fecha || item.fechaCargo);
                var dOut = normDateIso(item.dateOut);
                var itemNights = parseInt(item.nights, 10) || 1;
                if ((!dOut || dOut <= dIn) && itemNights > 1 && dIn) {
                  var dInDate = new Date(dIn + "T12:00:00Z");
                  if (!isNaN(dInDate.getTime())) {
                    dInDate.setUTCDate(dInDate.getUTCDate() + itemNights);
                    dOut = dInDate.toISOString().split("T")[0];
                  }
                }
                var covers = (dOut && dOut > dIn)
                  ? (entry.fecha >= dIn && entry.fecha < dOut)
                  : (entry.fecha === dIn);

                if (covers) {
                  var itemKey = item.id || (item.roomNo ? (item.roomNo + "_" + (item.type || "") + "_" + dIn) : null) || ((item.type || item.roomType) + "_" + dIn + "_" + itemIdx);
                  if (itemKey && seenItemKeys.has(itemKey)) return;
                  if (itemKey) seenItemKeys.add(itemKey);

                  var t = String(item.type || item.roomType || "").toUpperCase();
                  var tClean = t.replace(/^(HAB\.|HABITACIÓN|HABITACION|HAB)\s+/i, "").trim();
                  var isPureService = item.isService === true && !(/IND|DUI|SINGLE|DOB|DBL|TWIN|TRI|TPL|CUA|SUI|HAB/i.test(tClean));
                  if (isPureService) return;

                  hasRoomingDayLodging = true;

                  if (!foundRoomingReg && itemReg && itemReg !== "-" && itemReg !== "---") {
                    foundRoomingReg = itemReg;
                  }
                  var p = parseFloat(item.price) || 0;
                  var q = parseInt(item.qty, 10) || 1;
                  if (!t.includes("GRATUIDAD")) {
                    roomingDaySum += (p * q);
                  }

                  var roomClass = classifyRoomByOccupancy(tClean, q);
                  var itemPax = parseInt(item.pax, 10);
                  var effPax = !isNaN(itemPax) && itemPax > 0 ? itemPax : roomClass.persPerRoom;
                  roomingPax += (q * effPax);
                  roomingTotalRooms += q;

                  if (roomClass.category === "individual") {
                    roomingInd += q;
                  } else if (roomClass.category === "triple") {
                    roomingTpl += q;
                  } else if (roomClass.category === "cuadruple") {
                    roomingCua += q;
                  } else {
                    roomingDbl += q;
                  }
                }
              });
            }
          } catch (e) {}
        }
      });

      if (hasRoomingDayLodging && roomingTotalRooms > 0) {
        if (roomingPax > 0) {
          entry.pax = roomingPax;
        }
        var isCumbriaHotel = entry.hotel && (
          normalizeHotelName(entry.hotel) === "Cumbria Spa&Hotel" ||
          entry.hotel.toLowerCase().includes("cumbria")
        );
        activeDist = {
          individuales: roomingInd,
          dobles: roomingDbl,
          triples: roomingTpl,
          cuadruples: isCumbriaHotel ? 0 : roomingCua,
          totalHabitaciones: roomingTotalRooms
        };
        status = "confirmada";
        isDefinitive = true;
        revisionReasons = [];
        previousDistribution = null;
      }

      var finalRegimen = "---";
      if (foundRoomingReg) {
        finalRegimen = foundRoomingReg;
      } else if (dateSaved && dateSaved.regimen && dateSaved.regimen !== "-" && dateSaved.regimen !== "---") {
        finalRegimen = dateSaved.regimen;
      } else if (entry.regimenSet && entry.regimenSet.size > 0) {
        finalRegimen = Array.from(entry.regimenSet).join(", ") || "---";
      } else if (anyRoomingReg) {
        finalRegimen = anyRoomingReg;
      } else {
        finalRegimen = "---";
      }
      if (dateSaved && (!dateSaved.regimen || dateSaved.regimen === "-" || dateSaved.regimen === "---") && finalRegimen !== "---") {
        dateSaved.regimen = finalRegimen;
      }

      var dayAmount = 0;
      if (hasRoomingDayLodging && roomingDaySum > 0) {
        dayAmount = Math.round(roomingDaySum * 100) / 100;
      } else {
        (entry.contributingLines || []).forEach(function (cl) {
          var nch = Math.max(1, parseInt(cl.noches, 10) || 1);
          var impVal = cl.importe;
          var imp = 0;
          if (typeof impVal === "number") {
            imp = isNaN(impVal) ? 0 : impVal;
          } else if (impVal) {
            var s = String(impVal).trim().replace(/€/g, "").replace(/\s/g, "");
            if (s.includes(",") && s.includes(".")) {
              s = s.replace(/\./g, "").replace(",", ".");
            } else if (s.includes(",")) {
              s = s.replace(",", ".");
            }
            var n = parseFloat(s);
            imp = isNaN(n) ? 0 : n;
          }
          dayAmount += (imp / nch);
        });
      }

      // Comparativa de diferencias con el archivo Excel original
      var excelRegimen = "";
      if (entry.regimenSet && entry.regimenSet.size > 0) {
        excelRegimen = Array.from(entry.regimenSet).join(", ") || "";
      }
      var excelDayAmount = 0;
      (entry.contributingLines || []).forEach(function (cl) {
        var nch = Math.max(1, parseInt(cl.noches, 10) || 1);
        var impVal = cl.importe;
        var imp = 0;
        if (typeof impVal === "number") {
          imp = isNaN(impVal) ? 0 : impVal;
        } else if (impVal) {
          var s = String(impVal).trim().replace(/€/g, "").replace(/\s/g, "");
          if (s.includes(",") && s.includes(".")) {
            s = (s.lastIndexOf(",") > s.lastIndexOf(".")) ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
          } else if (s.includes(",")) {
            s = s.replace(",", ".");
          }
          var n = parseFloat(s);
          imp = isNaN(n) ? 0 : n;
        }
        excelDayAmount += (imp / nch);
      });
      excelDayAmount = Math.round(excelDayAmount * 100) / 100;

      var hasExcelDiff = false;
      var excelDiffReasons = [];
      var normFichaReg = normalizeRegimenLocal(foundRoomingReg || finalRegimen);
      var normExcelReg = normalizeRegimenLocal(excelRegimen);
      if (normFichaReg && normExcelReg && normFichaReg !== normExcelReg) {
        hasExcelDiff = true;
        excelDiffReasons.push("Régimen: Ficha (" + (foundRoomingReg || finalRegimen) + ") vs Excel (" + excelRegimen + ")");
      }
      var totalStayRoomingSum = 0;
      var totalStayExcelSum = 0;
      var seenStayRooming = new Set();
      (entry.contributingLines || []).forEach(function (cl) {
        var impVal = cl.importe;
        var imp = 0;
        if (typeof impVal === "number") {
          imp = isNaN(impVal) ? 0 : impVal;
        } else if (impVal) {
          var s = String(impVal).trim().replace(/€/g, "").replace(/\s/g, "");
          if (s.includes(",") && s.includes(".")) {
            s = (s.lastIndexOf(",") > s.lastIndexOf(".")) ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
          } else if (s.includes(",")) {
            s = s.replace(",", ".");
          }
          var n = parseFloat(s);
          imp = isNaN(n) ? 0 : n;
        }
        totalStayExcelSum += imp;

        if (cl.roomingList) {
          var rk = typeof cl.roomingList === "string" ? cl.roomingList.trim() : JSON.stringify(cl.roomingList);
          if (rk && rk !== "[]" && rk !== "{}" && !seenStayRooming.has(rk)) {
            seenStayRooming.add(rk);
            try {
              var rArr = typeof cl.roomingList === "string" ? JSON.parse(cl.roomingList) : cl.roomingList;
              if (Array.isArray(rArr)) {
                rArr.forEach(function(rm) {
                  var p = parseFloat(rm.total !== undefined ? rm.total : (parseFloat(rm.price) * (parseInt(rm.qty, 10) || 1) * (parseInt(rm.nights, 10) || 1))) || 0;
                  totalStayRoomingSum += p;
                });
              }
            } catch(e) {}
          }
        }
      });
      totalStayExcelSum = Math.round(totalStayExcelSum * 100) / 100;
      totalStayRoomingSum = Math.round(totalStayRoomingSum * 100) / 100;

      if (hasRoomingDayLodging && roomingDaySum > 0 && excelDayAmount > 0) {
        if (totalStayRoomingSum > 0 && totalStayExcelSum > 0) {
          var totalDiff = Math.abs(totalStayRoomingSum - totalStayExcelSum);
          if (totalDiff > 1.0) {
            hasExcelDiff = true;
            excelDiffReasons.push("Importe reserva: Ficha (" + totalStayRoomingSum.toFixed(2) + " €) vs Excel (" + totalStayExcelSum.toFixed(2) + " €)");
          }
        } else {
          var diffAmt = Math.abs(roomingDaySum - excelDayAmount);
          if (diffAmt > 1.0) {
            hasExcelDiff = true;
            excelDiffReasons.push("Importe día: Ficha (" + roomingDaySum.toFixed(2) + " €) vs Excel (" + excelDayAmount.toFixed(2) + " €)");
          }
        }
      }

      var excelDifference = {
        hasDiff: hasExcelDiff,
        reasons: excelDiffReasons,
        excelRegimen: excelRegimen,
        fichaRegimen: foundRoomingReg || finalRegimen,
        excelDayAmount: excelDayAmount,
        fichaDayAmount: hasRoomingDayLodging ? (Math.round(roomingDaySum * 100) / 100) : dayAmount
      };

      result.push({
        hotel: entry.hotel,
        reserva: entry.reserva,
        nombreGrupo: entry.nombreGrupo,
        fecha: entry.fecha,
        regimen: finalRegimen,
        pax: entry.pax,
        dailyAmount: dayAmount,
        importe: dayAmount,
        totalRevenue: dayAmount,
        estado: entry.estado,
        estadoReserva: entry.estado, // 'Confirmada' | 'Anulada'
        distributionStatus: status, // 'pendiente' | 'propuesta' | 'confirmada' | 'modificada' | 'validada_sin_cambios' | 'revision_necesaria'
        isDefinitive: isDefinitive, // Solo confirmada, modificada y validada_sin_cambios cuentan para totales definitivos
        individuales: activeDist.individuales,
        dobles: activeDist.dobles,
        triples: activeDist.triples,
        cuadruples: activeDist.cuadruples,
        totalHabitaciones: activeDist.totalHabitaciones,
        excelDifference: excelDifference,
        proposal: proposal,
        observations: observations,
        reviewedBy: reviewedBy,
        reviewedAt: reviewedAt,
        validationSnapshot: dateSaved?.validationSnapshot || null,
        revisionReasons: revisionReasons,
        previousDistribution: previousDistribution,
        contributingLines: entry.contributingLines
      });
    });

    result.sort(function (a, b) {
      var c1 = a.fecha.localeCompare(b.fecha);
      if (c1 !== 0) return c1;
      return a.reserva.localeCompare(b.reserva);
    });

    return result;
  }

  // ── 6. Aggregate Totals for Report ───────────────────────────
  function aggregateReportTotals(dailyRecords) {
    var totals = {
      totalPaxConfirmados: 0,
      totalPaxAnulados: 0,
      totalHabitacionesConfirmadas: 0,
      individualesConfirmadas: 0,
      doblesConfirmadas: 0,
      triplesConfirmadas: 0,
      cuadruplesConfirmadas: 0,
      totalHabitacionesPropuestas: 0,
      registrosConfirmados: 0,
      registrosModificados: 0,
      registrosValidadaSinCambios: 0,
      registrosRevisionNecesaria: 0,
      registrosPropuesta: 0,
      registrosPendientes: 0,
      registrosAnulados: 0
    };

    (dailyRecords || []).forEach(function (rec) {
      var isAnulada = String(rec.estadoReserva || "").toLowerCase().includes("anul");
      if (isAnulada) {
        totals.totalPaxAnulados += rec.pax || 0;
        totals.registrosAnulados++;
        return;
      }

      totals.totalPaxConfirmados += rec.pax || 0;

      if (rec.distributionStatus === "confirmada") totals.registrosConfirmados++;
      else if (rec.distributionStatus === "modificada") totals.registrosModificados++;
      else if (rec.distributionStatus === "validada_sin_cambios") totals.registrosValidadaSinCambios++;
      else if (rec.distributionStatus === "revision_necesaria") totals.registrosRevisionNecesaria++;
      else if (rec.distributionStatus === "propuesta") totals.registrosPropuesta++;
      else if (rec.distributionStatus === "pendiente") totals.registrosPendientes++;

      if (rec.isDefinitive) {
        totals.individualesConfirmadas += (rec.individuales || 0);
        totals.doblesConfirmadas += (rec.dobles || 0);
        totals.triplesConfirmadas += (rec.triples || 0);
        totals.cuadruplesConfirmadas += (rec.cuadruples || 0);
        totals.totalHabitacionesConfirmadas += (rec.totalHabitaciones || 0);
      } else if (rec.distributionStatus === "propuesta" && rec.proposal) {
        totals.totalHabitacionesPropuestas += (rec.proposal.totalHabitaciones || 0);
      }
    });

    return totals;
  }

  // ── 7. Control Validations ──────────────────────────────────
  function validateControls(line) {
    var warnings = [];
    var pax = parseInt(line["Pax."] || line["Pax"] || 0, 10);
    var noches = parseInt(line["Noches"] || line["Días"] || 0, 10);
    var pernoct = parseInt(line["Pernoct."] || line["Pernoctaciones"] || 0, 10);

    if (pax > 0 && noches > 0 && pernoct > 0) {
      if (pernoct !== pax * noches) {
        warnings.push("Pernoctaciones (" + pernoct + ") no coincide con Pax \u00d7 Noches (" + (pax * noches) + ")");
      }
    }

    var inIso = toIsoDate(line["Entrada"] || line["Desde"]);
    var outIso = toIsoDate(line["Salida"] || line["Hasta"]);
    if (inIso && outIso) {
      if (outIso <= inIso) {
        warnings.push("La fecha de salida (" + outIso + ") debe ser posterior a la fecha de entrada (" + inIso + ")");
      } else {
        var d1 = new Date(inIso + "T12:00:00Z");
        var d2 = new Date(outIso + "T12:00:00Z");
        var diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        if (noches > 0 && diffDays !== noches) {
          warnings.push("El n\u00famero de d\u00edas/noches (" + noches + ") no coincide con el intervalo de fechas (" + diffDays + " d\u00edas)");
        }
      }
    }

    var cant = parseFloat(line["Cant."] || line["Cant"] || 0);
    var precio = parseFloat(line["Precio"] || 0);
    var importe = parseFloat(line["Importe"] || line["Importe(*)"] || 0);
    if (cant > 0 && noches > 0 && precio > 0 && importe > 0) {
      var calcImp = cant * noches * precio;
      if (Math.abs(calcImp - importe) > 1) {
        warnings.push("El importe (" + importe + " \u20ac) no coincide con Cant \u00d7 D\u00edas \u00d7 Precio (" + calcImp.toFixed(2) + " \u20ac)");
      }
    }

    return warnings;
  }

  // ── Public Export ───────────────────────────────────────────
  var GroupOccupancyService = {
    toIsoDate: toIsoDate,
    generateStayNights: generateStayNights,
    generateDefaultProposal: generateDefaultProposal,
    validateOccupancyMatch: validateOccupancyMatch,
    classifyRoomByOccupancy: classifyRoomByOccupancy,
    parseSavedDistributions: parseSavedDistributions,
    calculateDailyOccupancyMatrix: calculateDailyOccupancyMatrix,
    aggregateReportTotals: aggregateReportTotals,
    validateControls: validateControls,
    fnv1aHex: fnv1aHex,
    generateValidationFingerprint: generateValidationFingerprint,
    createValidationSnapshot: createValidationSnapshot,
    compareOriginWithSnapshot: compareOriginWithSnapshot
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = GroupOccupancyService;
  }
  if (typeof window !== "undefined") {
    window.GroupOccupancyService = GroupOccupancyService;
  }

})(typeof window !== "undefined" ? window : global);
