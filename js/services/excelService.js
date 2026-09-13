/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Excel Service (Phase 1 Logic Extraction)
 * ═══════════════════════════════════════════════════════════
 * Handles parsing, sanitizing, and merging of imported Excel files.
 */
(function () {
  "use strict";

  // Helpers internos movidos desde Gestión de Grupos.html
  const toNum = (v) => {
    if (typeof window !== "undefined" && window.NexusUtils && window.NexusUtils.parseNum) {
      return window.NexusUtils.parseNum(v);
    }
    if (v === null || v === undefined || v === "" || v === "---") return 0;
    if (typeof v === "number") return v;
    let s = String(v).trim().replace(/[^\d.,\-]/g, "");
    if (s.includes(",") && s.includes(".")) {
      if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
      else s = s.replace(/,/g, "");
    } else if (s.includes(",")) {
      s = s.replace(",", ".");
    } else if (s.includes(".")) {
      if (s.split(".").pop().length === 3 && s.length > 4) s = s.replace(/\./g, "");
    }
    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
  };

  const normalizeId = (id) => {
    if (typeof window !== "undefined" && window.NexusUtils && window.NexusUtils.normalizeId) {
      return window.NexusUtils.normalizeId(id);
    }
    return String(id || "").trim().replace(/^#\s*/, "").replace(/\.0+$/, "").replace(/[\/\\]/g, "-").toUpperCase();
  };

  const cleanStr = (v) => String(v || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.0$/, "")
    .trim()
    .toUpperCase()
    .replace(/[\s\u00A0]+/g, " ");

  const normalizeEstado = (s) => {
    const v = cleanStr(s);
    if (v.includes("CONFIRM")) return "CONFIRMADA";
    if (v.includes("ANUL") || v.includes("CANCEL") || v.includes("BAJA") || v.includes("DESESTIM") || v.includes("CADUC")) return "ANULADA";
    if (v.includes("PRESUP") || v.includes("COTIZ") || v.includes("TANTEO") || v.includes("PROSPECT")) return "PRESUPUESTO";
    return v;
  };

  const normalizeHotel = (h) => {
    const s = String(h || "").toLowerCase().trim();
    if (s.includes("cumbria")) return "Cumbria Spa&Hotel";
    if (s.includes("guadiana") || s.includes("sercotel")) return "Sercotel Guadiana";
    return String(h || "").trim();
  };

  const normalizeSegment = (s) => {
    const v = cleanStr(s);
    if (v === "GRUPOS" || v === "GRUPO" || v.startsWith("GRUP")) return "GRUPO";
    if (v === "GRTANTEO" || v === "GRUPO TANTEO" || v === "TANTEO") return "GRUPO TANTEO";
    if (v.includes("DIRECTO")) return "DIRECTO";
    return v;
  };

  const normalizeRegimen = (s) => {
    const val = String(s || "").toUpperCase().trim().replace(/\s+/g, " ");
    if (val === "HA" || val.startsWith("HA ") || val === "SA" || val.startsWith("SA ") || val === "SO" || val.includes("SOLO ALOJ") || val.includes("SOLO ALOJAMIENTO") || val.includes("SIN DESAYUNO")) return "HA";
    if (val === "HD" || val.startsWith("HD ") || val === "AD" || val.startsWith("AD ") || val.includes("ALOJAMIENTO Y DESAYUNO") || (val.includes("ALOJ") && val.includes("DESAY"))) return "HD";
    if (val === "AD+D" || val === "ADD" || val === "HD+D" || val.startsWith("AD+D") || val.startsWith("ADD ") || val.startsWith("HD+D")) return "HD+D";
    if (val === "MP" || val.startsWith("MP ") || val.includes("MEDIA PENSION") || val.includes("MEDIA PENSIÓN")) return "MP";
    if (val === "PC" || val.startsWith("PC ") || val.includes("PENSION COMPLETA") || val.includes("PENSIÓN COMPLETA")) return "PC";
    if (val === "TI" || val.startsWith("TI ") || val.includes("TODO INCLUIDO") || val.includes("ALL INCLUSIVE")) return "TI";
    if (val === "D" || val === "DESAYUNO" || val === "BREAKFAST") return "HD";
    return val.split(" ")[0];
  };

  const toIsoDate = (v) => {
    if (v === null || v === undefined || v === "" || v === "---") return "";
    let s = String(v).trim();
    const numericVal = parseFloat(s);
    if (!isNaN(numericVal) && numericVal > 40000 && numericVal < 60000 && !s.includes("/") && !s.includes("-")) {
      try {
        const date = new Date(Math.round((numericVal - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) return date.toISOString().split("T")[0];
      } catch (e) {}
    }
    // ISO format YYYY-MM-DD or YYYY/MM/DD → normalize separator
    if (/^\d{4}[-\/]\d{2}[-\/]\d{2}/.test(s)) return s.substring(0, 10).replace(/\//g, "-");
    let d, m, y;
    const parts = s.split(/[-\/.]/);
    if (parts.length === 3) {
      // DD/MM/YYYY (output of normalizeDateForSanitize) — first part <= 2 chars
      if (parts[0].length <= 2 && parts[2].length >= 4) { [d, m, y] = parts; }
      // DD/MM/YY
      else if (parts[0].length <= 2) { [d, m, y] = parts; }
      else if (parts[0].length === 4) { [y, m, d] = parts; }
    }
    if (d && m && y) {
      let year = parseInt(y);
      if (year < 100) year += 2000;
      return `${String(year).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
    return "";
  };

  const toInputDate = (val) => {
    if (!val || String(val).trim() === "" || String(val).trim() === "---") return "";
    let s = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.substring(0, 10);
    const parts = s.split(/[\/-]/);
    if (parts.length === 3) {
      let yt = parts[2], mt = parts[1], dt = parts[0];
      if (yt && yt.length === 2) yt = "20" + yt;
      return `${yt}-${mt.padStart(2, "0")}-${dt.padStart(2, "0")}`;
    }
    return s;
  };

  const getLogisticsStatus = (row) => {
    const s = String(row["Estado"] || "").toLowerCase();
    const isInactive = s.includes("anul") || s.includes("cancel") || s.includes("baja");
    if (isInactive) return false;
    
    // Extrapolado temporalmente, aunque validación depende de la fecha.
    // Esto es solo un helper interno si lo necesitamos.
    return true;
  };

  // ── Excel Data Processing Core ──────────────────────────────
  
  const processMatrixData = (matrix, defaultStatus, specificHotelConfigId = null) => {
    const errorLog = [];
    if (!matrix || matrix.length < 2) return { validData: [], errors: errorLog };

    let headers = [];
    let currentStatus = defaultStatus;

    const isHeaderRow = (row) => {
      if (!Array.isArray(row) || row.length < 3) return false;
      const requiredKeys = [
        "reserva", "nombre del grupo", "entrada", "salida", "pax.", "noches", "régimen", "regimen", "importe(*)",
        "desde", "hasta", "cant.", "cant", "descripción", "descripcion", "reg.", "días", "dias", "precio", "importe", "precios"
      ];
      let matchCount = 0;
      row.forEach((val) => {
        if (val && typeof val === "string") {
          const lowerVal = val.toLowerCase().trim();
          if (requiredKeys.indexOf(lowerVal) !== -1) {
            matchCount++;
          }
        }
      });
      return matchCount >= 3;
    };

    const detectStatusChange = (row, status) => {
      if (!Array.isArray(row)) return status;
      const text = row.filter((v) => v !== null && v !== undefined && String(v).trim() !== "").join(" ").toUpperCase();
      if (text.indexOf("CONFIRMADA") !== -1) return "Confirmada";
      if (text.indexOf("ANULADA") !== -1) return "Anulada";
      if (text.indexOf("PRESUPUESTO") !== -1 || text.indexOf("COTIZACION") !== -1 || text.indexOf("COTIZACIÓN") !== -1) return "Presupuesto";
      return status;
    };

    // Find initial headers row dynamically
    let dataStartRow = 0;
    for (let r = 0; r < Math.min(15, matrix.length); r++) {
      let rowVals = matrix[r];
      if (isHeaderRow(rowVals)) {
        headers = rowVals.map((v) => String(v || "").trim());
        dataStartRow = r + 1;
        break;
      }
    }

    // Fallback detection if no formal header row matches
    if (headers.length === 0) {
      for (let r = 0; r < Math.min(15, matrix.length); r++) {
        let rowVals = matrix[r];
        if (Array.isArray(rowVals) && rowVals.length >= 2) {
          let textValues = rowVals.filter((v) => v !== null && v !== undefined && String(v).trim().length > 1);
          if (textValues.length >= 2) {
            headers = rowVals.map((v) => String(v || "").trim());
            dataStartRow = r + 1;
            break;
          }
        }
      }
    }

    if (headers.length === 0) return { validData: [], errors: ["No se encontraron cabeceras válidas."] };

    const HEADER_ALIASES = {
      "CÓDIGO": "Reserva", "CODIGO": "Reserva", "LOCALIZADOR": "Reserva", "RES.": "Reserva", "REF.": "Reserva",
      "NOMBRE": "Nombre del Grupo", "GRUPO": "Nombre del Grupo", "CLIENTE": "Nombre del Grupo",
      "AGENCIA": "Empresa/Agencia", "EMPRESA": "Empresa/Agencia",
      "PAX": "Pax.", "PERS.": "Pax.", "PERSONAS": "Pax.",
      "PERNOCTACIONES": "Pernoct.", "PERN.": "Pernoct.",
      "RÉGIMEN": "Régimen", "REGIMEN": "Régimen", "REG.": "Régimen", "REG": "Régimen",
      "ESTADO": "Estado", "SITUACIÓN": "Estado", "SITUACION": "Estado",
      "ENTRADA": "Entrada", "LLEGADA": "Entrada", "DESDE": "Entrada",
      "SALIDA": "Salida", "HASTA": "Salida",
      "NOCHES": "Noches", "DÍAS": "Noches", "DIAS": "Noches",
      "CANT.": "Cant.", "CANT": "Cant.", "CANTIDAD": "Cant.",
      "DESCRIPCIÓN": "Descripción", "DESCRIPCION": "Descripción",
      "PRECIO": "Precio", "PRECIOS": "precios",
      "IMPORTE": "Importe(*)",
      "SEGMENTO": "Segment.", "SEGMENT.": "Segment."
    };

    const cleanData = [];
    for (let i = dataStartRow; i < matrix.length; i++) {
      const rowData = matrix[i];
      if (!rowData || rowData.length === 0) continue;

      // Detect Segment Summary block to stop
      const hasSegmentacion = rowData.some((v) => typeof v === "string" && (v.toUpperCase().indexOf("SEGMENTACION") !== -1 || v.toUpperCase().indexOf("SEGMENTACIÓN") !== -1));
      if (hasSegmentacion) {
        break;
      }

      currentStatus = detectStatusChange(rowData, currentStatus);

      if (isHeaderRow(rowData)) {
        headers = rowData.map((v) => String(v || "").trim());
        continue;
      }

      let rowObj = {};
      headers.forEach((h, idx) => {
        if (h && h !== "") {
          const upperH = h.toUpperCase();
          const standardKey = HEADER_ALIASES[upperH] || h;
          if (standardKey === "Estado" && rowData[idx] !== undefined && String(rowData[idx]).trim() !== "") {
            rowObj._hasExcelEstadoCol = true;
          }
          rowObj[standardKey] = rowData[idx] !== undefined ? rowData[idx] : "";
        }
      });

      const checkStr = JSON.stringify(rowObj).toLowerCase();
      if (checkStr.includes("total") || Object.values(rowObj).every(v => v === "")) {
        continue;
      }

      // Ignore segment configuration / summary rows where Reserva is a segment code
      const segmentCodes = ["CO", "ON", "OF", "TA", "GR", "SEGMENTO", "SEGMENT"];
      const resVal = String(rowObj["Reserva"] || "").trim().toUpperCase();
      if (segmentCodes.includes(resVal)) {
        continue;
      }

      // Ignore totals / summary rows or section titles (valid bookings MUST have both valid Entrada and Salida dates, and not in the year 1900)
      const arrIso = toIsoDate(rowObj["Entrada"]);
      const depIso = toIsoDate(rowObj["Salida"]);
      const hasNoDates = !arrIso || !depIso || arrIso.startsWith("1900") || depIso.startsWith("1900");
      if (hasNoDates) {
        continue;
      }

      if (!rowObj["Estado"] || String(rowObj["Estado"]).trim() === "") {
        rowObj["Estado"] = currentStatus;
      }
      rowObj["_rowNum"] = i + 1;
      rowObj["_linea"] = String(rowObj["precios"] || rowObj["Linea"] || (i + 1)).trim();

      if (specificHotelConfigId) {
        rowObj["Hotel_Asignado"] = specificHotelConfigId;
      }

      cleanData.push(rowObj);
    }

    return { validData: cleanData, errors: errorLog };
  };

  // Normalizador de Fechas de Entrada para Sanitización
  const normalizeDateForSanitize = (val) => {
    if (!val) return "";
    let d, m, y;
    const num = parseFloat(val);
    const isValidSerial = !isNaN(num) && num >= 40000 && num <= 60000 && (typeof val === "number" || /^\d{5}$/.test(String(val).trim()));
    if (isValidSerial) {
      const serial = num;
      const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
      d = date.getUTCDate();
      m = date.getUTCMonth() + 1;
      y = date.getUTCFullYear();
    } else {
      const str = String(val).trim();
      if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(str)) {
        const parts = str.split(/[\/-]/);
        [d, m, y] = parts.map(Number);
        if (y < 100) y += 2000;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        const [year, month, day] = str.split("-").map(Number);
        [d, m, y] = [day, month, year];
      }
    }
    if (d && m && y) return `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y}`;
    return String(val).trim();
  };

  const parseToDateObj = (str) => {
    if (!str) return null;
    const parts = String(str).split(/[\/-]/);
    if (parts.length !== 3) return new Date(str);
    if (parts[0].length === 4) return new Date(str);
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  };

  const getStatusPriority = (s) => {
    const low = (s || "").toLowerCase();
    if (low.includes("conf") || low.includes("ok")) return 3;
    if (low.includes("tent") || low.includes("pros")) return 2;
    if (low.includes("anul") || low.includes("can")) return 1;
    return 0;
  };

  function sanitizeAndMerge(rawData, importErrors, hotelName, currentData) {
    const simpleRows = rawData.map((row) => {
        const cleanRow = {};
        let foundSegment = false;
        
        Object.keys(row).forEach((k) => {
        if (k && k.trim() !== "") {
            let val = row[k];
            if (k === "Entrada" || k === "Salida" || k.includes("Date")) {
                val = normalizeDateForSanitize(val);
            }
            let cleanKey = k.trim();
            let cleanVal = val;
            if (cleanKey === "Segment." || cleanKey === "Segmento") {
                let seg = (val || "").toString().trim().toUpperCase();
                if (seg === "GRTANTEO" || seg === "GRUPO TANTEO") cleanVal = "GRUPO TANTEO";
                else if (seg === "GRUPOS" || seg === "GRUPO") cleanVal = "GRUPO";
                if (cleanVal !== "") foundSegment = true;
                cleanKey = "Segment."; // Normalize the key name
            }
            cleanRow[cleanKey] = cleanVal;
        }
        });

        if (!cleanRow["Segment."] || cleanRow["Segment."] === "") {
            const resName = cleanRow["Nombre del Grupo"] || cleanRow["Reserva"] || "Fila desconocida";
            importErrors.push(`⚠️ El grupo "${resName}" no tiene información de Segmentación.`);
            cleanRow._hasWarning = true;
        }

        if (!cleanRow["Hotel_Asignado"] && hotelName && hotelName !== "" && hotelName !== "Hotel Multi-Hoja") {
            cleanRow["Hotel_Asignado"] = hotelName;
        }
        return cleanRow;
    });

    const incomingRows = [];
    const seenLineKeys = new Set();

    simpleRows.forEach((row, idx) => {
        const rawResId = row["Reserva"];
        const resId = normalizeId(rawResId) || `TEMP-${Date.now()}-${idx}`;
        row["Reserva"] = resId;

        const lineaId = String(row["precios"] || row["_linea"] || row["_rowNum"] || (idx + 1)).trim();
        row["_linea"] = lineaId;
        if (row["precios"]) row["precios"] = lineaId;

        const inIso = toIsoDate(row["Entrada"]);
        const lineKey = `${resId}_${lineaId}_${inIso}`;

        // Deduplicar únicamente si es un duplicado idéntico exacto
        if (seenLineKeys.has(lineKey)) {
            return;
        }
        seenLineKeys.add(lineKey);
        row["_recordKey"] = lineKey;

        const eInDate = parseToDateObj(row["Entrada"]);
        const eOutDate = parseToDateObj(row["Salida"]);

        if ((!row["Noches"] || row["Noches"] === "" || row["Noches"] === "0") && row["Entrada"] && row["Salida"]) {
            if (eInDate && eOutDate && !isNaN(eInDate.getTime()) && !isNaN(eOutDate.getTime())) {
                const diffDays = Math.round((eOutDate - eInDate) / (1000 * 60 * 60 * 24));
                if (diffDays > 0) row["Noches"] = diffDays.toString();
            }
        }

        if ((!row["Pernoct."] || row["Pernoct."] === "" || row["Pernoct."] === "0") && row["Pax."] && row["Noches"]) {
            const pNum = toNum(row["Pax."]);
            const nNum = toNum(row["Noches"]);
            if (pNum > 0 && nNum > 0) {
                row["Pernoct."] = (pNum * nNum).toString();
            }
        }

        if (!row["Com_Vencimiento_Rel"] || row["Com_Vencimiento_Rel"] === "") {
            if (eInDate && !isNaN(eInDate.getTime())) {
                const relDate = new Date(eInDate);
                relDate.setDate(relDate.getDate() - 15);
                row["Com_Vencimiento_Rel"] = relDate.toISOString().split("T")[0];
            }
        }

        incomingRows.push(row);
    });

    const totalPaxFound = incomingRows.reduce((a, b) => a + toNum(b["Pax."]), 0);
    const totalImpFound = incomingRows.reduce((a, b) => a + toNum(b["Importe(*)"]), 0);

    const mergedData = [...currentData];
    const APP_ONLY_FIELDS = new Set([
      "Com_Comercial", "Com_Estado_Interno", "Com_Notas", "Com_Seguimiento",
      "Com_Vencimiento_Rel", "Com_Precio", "Dep1_Label", "Dep1_Percent", "Dep1_Importe",
      "Dep1_Fecha", "Dep2_Label", "Dep2_Percent", "Dep2_Importe", "Dep2_Fecha",
      "Dep3_Label", "Dep3_Percent", "Dep3_Importe", "Dep3_Fecha", "PaymentPlan_JSON",
      "RoomingList_JSON", "DailyDistribution_JSON", "Logistica_Rooming", "Logistica_MenuMP",
      "Logistica_MenuPC", "Enlace_TPV", "tracking", "Fiscal_RazonSocial", "Fiscal_CIF", "Fiscal_Direccion",
      "Fiscal_CP", "Fiscal_Poblacion", "Fiscal_Provincia", "Fiscal_Pais", "Email",
      "Telefono", "Persona_Contacto", "Proforma_NetRate", "Proforma_Rooms",
      "Proforma_RoomList", "Com_Pagado", "Es_Credito", "Com_Es_Credito", "updatedAt"
    ]);

    const matchedExistingIndices = new Set();
    const existingAppOnlyByRes = new Map();
    currentData.forEach((r) => {
        const rId = normalizeId(r["Reserva"]);
        if (!rId) return;
        if (!existingAppOnlyByRes.has(rId)) {
            existingAppOnlyByRes.set(rId, {});
        }
        const target = existingAppOnlyByRes.get(rId);
        APP_ONLY_FIELDS.forEach((f) => {
            if (r[f] !== undefined && r[f] !== null && r[f] !== "" && r[f] !== "{}" && r[f] !== "[]") {
                if (!target[f]) target[f] = r[f];
            }
        });
    });

    incomingRows.forEach((newRow, idx) => {
        if (!newRow["Reserva"]) newRow["Reserva"] = `TEMP-${Date.now()}-${idx}`;
        const resID = normalizeId(newRow["Reserva"]);
        const targetRecordKey = newRow["_recordKey"];
        const newInIso = toIsoDate(newRow["Entrada"]);
        const newOutIso = toIsoDate(newRow["Salida"]);
        const newLinea = newRow["_linea"];
        const newRegimen = normalizeRegimen(newRow["Régimen"]);
        const newImp = toNum(newRow["Importe(*)"]);
        const newPax = toNum(newRow["Pax."]);
        const newNoches = toNum(newRow["Noches"]);

        // Búsqueda en pases sucesivos asegurando correspondencia unívoca
        let existingIdx = -1;

        // Pase 1: Coincidencia exacta de _recordKey
        if (targetRecordKey) {
            existingIdx = mergedData.findIndex((r, rIdx) => {
                if (matchedExistingIndices.has(rIdx)) return false;
                return r["_recordKey"] && r["_recordKey"] === targetRecordKey;
            });
        }

        // Pase 2: Coincidencia de _docId exacto con sufijo de línea
        if (existingIdx === -1 && newLinea) {
            existingIdx = mergedData.findIndex((r, rIdx) => {
                if (matchedExistingIndices.has(rIdx)) return false;
                const rRes = normalizeId(r["Reserva"]);
                if (rRes !== resID && !rRes.startsWith(resID + "_") && !resID.startsWith(rRes + "_")) return false;
                if (r["_docId"] && r["_docId"] === `${resID}_${newLinea}`) {
                    return toIsoDate(r["Entrada"]) === newInIso && (!newOutIso || toIsoDate(r["Salida"]) === newOutIso);
                }
                return false;
            });
        }

        // Pase 3: Misma reserva, misma línea identificada y misma fecha de entrada
        if (existingIdx === -1 && newLinea) {
            existingIdx = mergedData.findIndex((r, rIdx) => {
                if (matchedExistingIndices.has(rIdx)) return false;
                const rRes = normalizeId(r["Reserva"]);
                if (rRes !== resID && !rRes.startsWith(resID + "_") && !resID.startsWith(rRes + "_")) return false;
                const rLinea = String(r["_linea"] || r["precios"] || "").trim();
                return rLinea === newLinea && toIsoDate(r["Entrada"]) === newInIso && (!newOutIso || toIsoDate(r["Salida"]) === newOutIso);
            });
        }

        // Pase 4: Misma reserva, misma entrada, misma salida y mismo importe (coincidencia perfecta de línea)
        if (existingIdx === -1 && newInIso && newOutIso) {
            existingIdx = mergedData.findIndex((r, rIdx) => {
                if (matchedExistingIndices.has(rIdx)) return false;
                const rRes = normalizeId(r["Reserva"]);
                if (rRes !== resID && !rRes.startsWith(resID + "_") && !resID.startsWith(rRes + "_")) return false;
                if (toIsoDate(r["Entrada"]) === newInIso && toIsoDate(r["Salida"]) === newOutIso) {
                    const rImp = toNum(r["Importe(*)"]);
                    return Math.abs(rImp - newImp) < 0.50;
                }
                return false;
            });
        }

        // Pase 5: Misma reserva, misma entrada, misma salida y mismas noches/pax
        if (existingIdx === -1 && newInIso && newOutIso) {
            existingIdx = mergedData.findIndex((r, rIdx) => {
                if (matchedExistingIndices.has(rIdx)) return false;
                const rRes = normalizeId(r["Reserva"]);
                if (rRes !== resID && !rRes.startsWith(resID + "_") && !resID.startsWith(rRes + "_")) return false;
                if (toIsoDate(r["Entrada"]) === newInIso && toIsoDate(r["Salida"]) === newOutIso) {
                    const rPax = toNum(r["Pax."]);
                    const rNoches = toNum(r["Noches"]);
                    if (newNoches > 0 && rNoches > 0 && newNoches === rNoches) return true;
                    if (newPax > 0 && rPax > 0 && newPax === rPax) return true;
                }
                return false;
            });
        }

        // Pase 6: Misma reserva, misma entrada y misma salida
        if (existingIdx === -1 && newInIso && newOutIso) {
            existingIdx = mergedData.findIndex((r, rIdx) => {
                if (matchedExistingIndices.has(rIdx)) return false;
                const rRes = normalizeId(r["Reserva"]);
                if (rRes !== resID && !rRes.startsWith(resID + "_") && !resID.startsWith(rRes + "_")) return false;
                return toIsoDate(r["Entrada"]) === newInIso && toIsoDate(r["Salida"]) === newOutIso;
            });
        }

        // Pase 7: Misma reserva, misma fecha de entrada y mismo régimen
        if (existingIdx === -1) {
            existingIdx = mergedData.findIndex((r, rIdx) => {
                if (matchedExistingIndices.has(rIdx)) return false;
                const rRes = normalizeId(r["Reserva"]);
                if (rRes !== resID && !rRes.startsWith(resID + "_") && !resID.startsWith(rRes + "_")) return false;
                if (toIsoDate(r["Entrada"]) === newInIso) {
                    if (newRegimen && normalizeRegimen(r["Régimen"]) === newRegimen) return true;
                }
                return false;
            });
        }

        // Pase 8: Misma reserva y misma fecha de entrada
        if (existingIdx === -1) {
            existingIdx = mergedData.findIndex((r, rIdx) => {
                if (matchedExistingIndices.has(rIdx)) return false;
                const rRes = normalizeId(r["Reserva"]);
                if (rRes !== resID && !rRes.startsWith(resID + "_") && !resID.startsWith(rRes + "_")) return false;
                return toIsoDate(r["Entrada"]) === newInIso;
            });
        }

        // Pase 9: Misma reserva si solo queda una fila libre o coincide ID base
        if (existingIdx === -1) {
            const candidates = [];
            const baseResID = resID.split("_")[0].split("-")[0];
            mergedData.forEach((r, rIdx) => {
                if (matchedExistingIndices.has(rIdx)) return;
                const rRes = normalizeId(r["Reserva"]);
                const rBase = rRes.split("_")[0].split("-")[0];
                if (rRes === resID || rRes.startsWith(resID + "_") || resID.startsWith(rRes + "_") || (baseResID && rBase === baseResID)) {
                    candidates.push(rIdx);
                }
            });
            if (candidates.length === 1) {
                existingIdx = candidates[0];
            } else if (candidates.length > 1) {
                const fullDateMatch = candidates.find((cIdx) => toIsoDate(mergedData[cIdx]["Entrada"]) === newInIso && toIsoDate(mergedData[cIdx]["Salida"]) === newOutIso);
                if (fullDateMatch !== undefined) {
                    existingIdx = fullDateMatch;
                } else {
                    const inDateMatch = candidates.find((cIdx) => toIsoDate(mergedData[cIdx]["Entrada"]) === newInIso);
                    if (inDateMatch !== undefined) {
                        existingIdx = inDateMatch;
                    }
                }
            }
        }

        if (existingIdx === -1) {
            const freshRow = { ...newRow, _diff: "new" };
            if (existingAppOnlyByRes.has(resID)) {
                const savedAppFields = existingAppOnlyByRes.get(resID);
                APP_ONLY_FIELDS.forEach((f) => {
                    if (savedAppFields[f] !== undefined && (freshRow[f] === undefined || freshRow[f] === null || freshRow[f] === "")) {
                        freshRow[f] = savedAppFields[f];
                    }
                });
            }
            mergedData.push(freshRow);
        } else {
            matchedExistingIndices.add(existingIdx);
            const existingRow = mergedData[existingIdx];
            let diffType = null;
            let changes = {};

            const NUMERIC_KEYS = new Set(["Importe(*)", "Pax.", "Noches", "Pernoct.", "Cant. Habitaciones"]);
            const DATE_KEYS = new Set(["Entrada", "Salida"]);
            const relevantKeys = ["Entrada", "Salida", "Pax.", "Importe(*)", "Estado", "Hotel_Asignado", "Régimen", "Segment.", "Nombre del Grupo", "Noches", "Pernoct.", "Empresa/Agencia", "Cant. Habitaciones"];

            relevantKeys.forEach((key) => {
                let rawOld = existingRow[key];
                let rawNew = newRow[key];
                if (key === "Cant. Habitaciones") {
                    if (rawOld === undefined && existingRow["Cant."] !== undefined) rawOld = existingRow["Cant."];
                    if (rawNew === undefined && newRow["Cant."] !== undefined) rawNew = newRow["Cant."];
                }
                if (rawNew === undefined) return;
                
                let isEmptyOld = rawOld === null || rawOld === undefined || String(rawOld).trim() === "" || String(rawOld).trim() === "---";
                let isEmptyNew = rawNew === null || rawNew === undefined || String(rawNew).trim() === "" || String(rawNew).trim() === "---";

                // Si Noches no estaba guardado en Firestore, derivarlo de Entrada y Salida existentes
                if (key === "Noches" && isEmptyOld) {
                    const eIn = parseToDateObj(existingRow["Entrada"]);
                    const eOut = parseToDateObj(existingRow["Salida"]);
                    if (eIn && eOut && !isNaN(eIn.getTime()) && !isNaN(eOut.getTime())) {
                        const diff = Math.round((eOut - eIn) / (1000 * 60 * 60 * 24));
                        if (diff > 0) {
                            rawOld = diff.toString();
                            isEmptyOld = false;
                        }
                    }
                }

                // Si Pernoct. no estaba guardado en Firestore, derivarlo de Pax y fechas
                if (key === "Pernoct." && isEmptyOld) {
                    const pax = toNum(existingRow["Pax."]);
                    const eIn = parseToDateObj(existingRow["Entrada"]);
                    const eOut = parseToDateObj(existingRow["Salida"]);
                    if (pax > 0 && eIn && eOut && !isNaN(eIn.getTime()) && !isNaN(eOut.getTime())) {
                        const diff = Math.round((eOut - eIn) / (1000 * 60 * 60 * 24));
                        if (diff > 0) {
                            rawOld = (pax * diff).toString();
                            isEmptyOld = false;
                        }
                    }
                }

                // NO detectar cambios si el nuevo valor está vacío pero el antiguo tenía algo
                if (!isEmptyOld && isEmptyNew) return;
                if (isEmptyOld && isEmptyNew) return;

                let isDifferent = false;
                if (NUMERIC_KEYS.has(key)) {
                    const numOld = isEmptyOld ? 0 : toNum(rawOld);
                    const numNew = isEmptyNew ? 0 : toNum(rawNew);
                    if (isNaN(numOld) && isNaN(numNew)) return;
                    if ((isNaN(numOld) || numOld === 0) && (isNaN(numNew) || numNew === 0)) return;
                    
                    // Para Importe(*) usar tolerancia de ±1.00€ para evitar falsos positivos por redondeo
                    // Para otros campos numéricos usar ±0.50
                    const tolerance = key === "Importe(*)" ? 100 : 50; // en centésimas
                    isDifferent = Math.abs(Math.round(numOld * 100) - Math.round(numNew * 100)) >= tolerance;
                } else if (DATE_KEYS.has(key)) {
                    // Normalizar ambas fechas a ISO YYYY-MM-DD
                    const dateOld = toIsoDate(rawOld);
                    const dateNew = toIsoDate(rawNew);
                    if (dateOld === "" && dateNew === "") return;
                    if (dateOld === "" || dateNew === "") return;
                    isDifferent = dateOld !== dateNew;
                } else if (key === "Estado") {
                    const hasExcelEstadoCol = newRow._hasExcelEstadoCol;
                    const stOld = normalizeEstado(rawOld || existingRow["Com_Estado_Interno"]);
                    const stNew = normalizeEstado(rawNew);
                    if (!hasExcelEstadoCol && (stOld === "PRESUPUESTO" || existingRow["Com_Estado_Interno"] === "PRESUPUESTO")) {
                        isDifferent = false;
                    } else {
                        isDifferent = stOld !== stNew;
                    }
                } else if (key === "Hotel_Asignado") {
                    const hOld = normalizeHotel(rawOld || existingRow["Hotel"]);
                    const hNew = normalizeHotel(rawNew);
                    isDifferent = hOld !== hNew;
                } else if (key === "Segment.") {
                    const segOld = normalizeSegment(rawOld || existingRow["Segmento"] || existingRow["Segment"] || "");
                    const segNew = normalizeSegment(rawNew);
                    isDifferent = segOld !== segNew;
                } else if (key === "Régimen") {
                    const regOld = normalizeRegimen(rawOld);
                    const regNew = normalizeRegimen(rawNew);
                    isDifferent = regOld !== regNew;
                } else {
                    let cleanOld = isEmptyOld ? "" : cleanStr(rawOld);
                    let cleanNew = isEmptyNew ? "" : cleanStr(rawNew);
                    if (key === "Empresa/Agencia" || key === "Nombre del Grupo") {
                        cleanOld = cleanOld.replace(/[.,\-_/\\#()]/g, " ").replace(/\s+/g, " ").trim();
                        cleanNew = cleanNew.replace(/[.,\-_/\\#()]/g, " ").replace(/\s+/g, " ").trim();
                    }
                    isDifferent = cleanOld !== cleanNew;
                }

                if (isDifferent) {
                    if (NUMERIC_KEYS.has(key)) {
                        const cleanVal = (v) => isNaN(toNum(v)) ? String(v).trim() : Number(Math.round(toNum(v) + "e2") + "e-2").toString();
                        changes[key] = { old: isEmptyOld ? "---" : cleanVal(rawOld), new: isEmptyNew ? "---" : cleanVal(rawNew) };
                    } else {
                        changes[key] = { old: isEmptyOld ? "---" : rawOld, new: isEmptyNew ? "---" : rawNew };
                    }
                }
            });

            const oldStatusNorm = normalizeEstado(existingRow["Estado"] || existingRow["Com_Estado_Interno"]);
            const newStatusNorm = normalizeEstado(newRow["Estado"]);
            if (newStatusNorm === "ANULADA" && oldStatusNorm !== "ANULADA") diffType = "cancelled";
            else if (Object.keys(changes).length > 0) diffType = "modified";

            const mergedRow = { ...existingRow };
            Object.keys(newRow).forEach((key) => {
                if (APP_ONLY_FIELDS.has(key)) return;
                const valNew = newRow[key];
                if (valNew === undefined || valNew === null || valNew === "") return;
                
                if (NUMERIC_KEYS.has(key)) mergedRow[key] = toNum(valNew).toString();
                else if (DATE_KEYS.has(key)) mergedRow[key] = toIsoDate(valNew);
                else mergedRow[key] = valNew;
            });

            // Preservar clave de registro y número de línea para re-importaciones estables
            if (targetRecordKey) mergedRow["_recordKey"] = targetRecordKey;
            if (newLinea) mergedRow["_linea"] = newLinea;

            if (newRow._hasWarning) mergedRow._hasWarning = true;

            if (Object.keys(changes).length === 0) {
                mergedRow["_diff"] = null;
                mergedRow["_changes"] = null;
            } else {
                mergedRow["_diff"] = diffType || (existingRow._diff ? existingRow._diff : null);
                mergedRow["_changes"] = changes;
            }

            if (existingAppOnlyByRes.has(resID)) {
                const savedAppFields = existingAppOnlyByRes.get(resID);
                APP_ONLY_FIELDS.forEach((f) => {
                    if (savedAppFields[f] !== undefined && (mergedRow[f] === undefined || mergedRow[f] === null || mergedRow[f] === "" || mergedRow[f] === "{}" || mergedRow[f] === "[]")) {
                        mergedRow[f] = savedAppFields[f];
                    }
                });
            }
            mergedData[existingIdx] = mergedRow;
        }
    });

    const allKeys = new Set();
    mergedData.forEach((r) => Object.keys(r).forEach((k) => allKeys.add(k)));

    const sortedData = [...mergedData].sort((a, b) => {
        const valA = toInputDate(a["Entrada"]) || "9999";
        const valB = toInputDate(b["Entrada"]) || "9999";
        return valA.localeCompare(valB);
    });

    const newsCount = sortedData.filter((r) => r._diff === "new").length;
    const modsCount = sortedData.filter((r) => r._diff === "modified" || r._diff === "cancelled").length;

    return {
        sortedData,
        columns: Array.from(allKeys).filter((k) => !k.startsWith("_") && k !== "Hotel_Asignado"),
        summaryData: {
            totalRowsProcessed: simpleRows.length,
            uniqueGroups: incomingRows.length,
            totalPax: totalPaxFound,
            totalRevenue: totalImpFound,
            newGroupsCount: newsCount,
            modifiedGroupsCount: modsCount,
            errors: importErrors,
            detectedHotel: hotelName,
        }
    };
  }

  // Parses the file (either ArrayBuffer or text for CSV) and extracts matrix
  function parseAndMergeFile(file, currentFirebaseData, forceHotelName, callback) {
      const reader = new FileReader();

      if (file.name.endsWith(".csv")) {
          reader.onload = (e) => {
              const text = e.target.result;
              const rows = text.split("\n").map((row) => row.split(";").map((col) => col.replace(/^"(.*)"$/, "$1").trim()));
              
              let hotelName = forceHotelName;
              if (!hotelName || hotelName.trim() === "") {
                const hotelNameRow = rows.find((r) => r[0] && r[0].toLowerCase().includes("hotel"));
                hotelName = hotelNameRow ? hotelNameRow[1] : "Hotel Desconocido";
              }
              
              const sheetData = processMatrixData(rows, "Confirmada");
              if (sheetData.validData.length > 0) {
                  const result = sanitizeAndMerge(sheetData.validData, sheetData.errors || [], hotelName, currentFirebaseData);
                  callback(null, result);
              } else {
                  callback(new Error("No se encontraron datos en el CSV."), null);
              }
          };
          reader.readAsText(file);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          reader.onload = (e) => {
              const data = new Uint8Array(e.target.result);
              // Ensure XLSX global exists
              if (!window.XLSX) return callback(new Error("Librería XLSX no cargada"), null);
              
              const workbook = window.XLSX.read(data, { type: "array" });
              let allDetectedData = [];
              let allErrors = [];
              let hotelName = forceHotelName;

              workbook.SheetNames.forEach((sheetName) => {
                  const worksheet = workbook.Sheets[sheetName];
                  const matrix = window.XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
                  
                  if (!hotelName || hotelName.trim() === "") {
                    // Intentar extraer hotel de las primeras filas
                    for (let i = 0; i < Math.min(5, matrix.length); i++) {
                        if (matrix[i] && matrix[i][0] && typeof matrix[i][0] === "string" && matrix[i][0].toLowerCase().includes("hotel")) {
                          if(matrix[i][1]) hotelName = matrix[i][1];
                          break;
                        }
                    }
                    if (!hotelName) hotelName = "Hotel Multi-Hoja";
                  }

                  let defaultStatus = "Confirmada";
                  if (sheetName.toLowerCase().includes("anula")) defaultStatus = "Anulada";

                  const sheetData = processMatrixData(matrix, defaultStatus);
                  allDetectedData = [...allDetectedData, ...sheetData.validData];
                  if (sheetData.errors) allErrors = [...allErrors, ...sheetData.errors];
              });

              if (allDetectedData.length > 0) {
                  const result = sanitizeAndMerge(allDetectedData, allErrors, hotelName, currentFirebaseData);
                  callback(null, result);
              } else {
                  callback(new Error("No se encontraron datos en el Excel."), null);
              }
          };
          reader.readAsArrayBuffer(file);
      } else {
          callback(new Error("Formato de archivo no soportado."), null);
      }
  }

  var ExcelService = {
      parseAndMergeFile,
      sanitizeAndMerge,
      processMatrixData,
      toIsoDate,
      toInputDate,
      normalizeEstado,
      normalizeHotel,
      normalizeSegment,
      normalizeRegimen,
      cleanStr
  };

  if (typeof window !== "undefined") {
    window.ExcelService = ExcelService;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = ExcelService;
  }

})();
