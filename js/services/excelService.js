/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Excel Service (Phase 1 Logic Extraction)
 * ═══════════════════════════════════════════════════════════
 * Handles parsing, sanitizing, and merging of imported Excel files.
 */
(function () {
  "use strict";

  // Helpers internos movidos desde Gestión de Grupos.html
  const toNum = (v) => window.NexusUtils.parseNum(v);

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

    // Find headers row dynamically
    let headers = [];
    let dataStartRow = 1;

    for (let r = 0; r < Math.min(15, matrix.length); r++) {
      let rowVals = matrix[r];
      if (Array.isArray(rowVals) && rowVals.length >= 2) {
        // Buscamos una fila que tenga al menos 2 celdas con texto (headers)
        let textValues = rowVals.filter((v) => v !== null && v !== undefined && String(v).trim().length > 1);
        if (textValues.length >= 2) {
          headers = rowVals.map((v) => String(v || "").trim());
          dataStartRow = r + 1;
          break;
        }
      }
    }

    if (headers.length === 0) return { validData: [], errors: ["No se encontraron cabeceras válidas."] };

    const cleanData = [];
    for (let i = dataStartRow; i < matrix.length; i++) {
        const rowData = matrix[i];
        if (rowData.length === 0) continue;
        
        const HEADER_ALIASES = {
            "CÓDIGO": "Reserva", "CODIGO": "Reserva", "LOCALIZADOR": "Reserva", "RES.": "Reserva", "REF.": "Reserva",
            "NOMBRE": "Nombre del Grupo", "GRUPO": "Nombre del Grupo", "CLIENTE": "Nombre del Grupo",
            "AGENCIA": "Empresa/Agencia", "EMPRESA": "Empresa/Agencia",
            "PAX": "Pax.", "PERS.": "Pax.", "PERSONAS": "Pax.",
            "PERNOCTACIONES": "Pernoct.", "PERN.": "Pernoct.",
            "RÉGIMEN": "Régimen", "REGIMEN": "Régimen",
            "ESTADO": "Estado", "SITUACIÓN": "Estado", "SITUACION": "Estado",
            "ENTRADA": "Entrada", "LLEGADA": "Entrada",
            "SALIDA": "Salida",
            "SEGMENTO": "Segment.", "SEGMENT.": "Segment."
        };

        let rowObj = {};
        headers.forEach((h, idx) => {
            if (h && h !== "") {
                const upperH = h.toUpperCase();
                const standardKey = HEADER_ALIASES[upperH] || h;
                rowObj[standardKey] = rowData[idx] !== undefined ? rowData[idx] : "";
            }
        });
        
        // Skip obvious empty or totals rows
        const checkStr = JSON.stringify(rowObj).toLowerCase();
        if (checkStr.includes("total") || Object.values(rowObj).every(v => v === "")) {
            continue;
        }

        // Apply defaults
        if (!rowObj["Estado"] || String(rowObj["Estado"]).trim() === "") {
            rowObj["Estado"] = defaultStatus;
        }

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
    if (typeof val === "number" || (!isNaN(parseFloat(val)) && /^\d{5}$/.test(val))) {
      const serial = parseFloat(val);
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

    const groupedMap = new Map();
    simpleRows.forEach((row) => {
        const id = window.NexusUtils.normalizeId(row["Reserva"]);
        if (!id || id === "-") {
            groupedMap.set(`TEMP-${Math.random()}`, row);
            return;
        }
        if (!groupedMap.has(id)) {
            groupedMap.set(id, { ...row });
        } else {
            const existing = groupedMap.get(id);
            const existingPriority = getStatusPriority(existing["Estado"]);
            const newPriority = getStatusPriority(row["Estado"]);

            const oldPax = toNum(existing["Pax."]);
            const newPax = toNum(row["Pax."]);
            existing["Pax."] = (oldPax + newPax).toString();

            const oldPernoct = toNum(existing["Pernoct."]);
            const newPernoct = toNum(row["Pernoct."]);
            if (oldPernoct > 0 || newPernoct > 0) existing["Pernoct."] = (oldPernoct + newPernoct).toString();

            const oldImp = toNum(existing["Importe(*)"]);
            const newImp = toNum(row["Importe(*)"]);
            existing["Importe(*)"] = (oldImp + newImp).toFixed(2);

            if (newPriority > existingPriority) {
                existing["Entrada"] = row["Entrada"];
                existing["Salida"] = row["Salida"];
                existing["Estado"] = row["Estado"];
                existing["Hotel_Asignado"] = row["Hotel_Asignado"];
                existing["Nombre del Grupo"] = row["Nombre del Grupo"] || existing["Nombre del Grupo"];
                existing["Segment."] = row["Segment."] || existing["Segment."];
            } else if (newPriority === existingPriority) {
                const eIn = parseToDateObj(existing["Entrada"]);
                const rIn = parseToDateObj(row["Entrada"]);
                if (rIn && eIn && rIn < eIn) existing["Entrada"] = row["Entrada"];

                const eOut = parseToDateObj(existing["Salida"]);
                const rOut = parseToDateObj(row["Salida"]);
                if (rOut && eOut && rOut > eOut) existing["Salida"] = row["Salida"];
            }

            if (row["Régimen"] && existing["Régimen"] !== row["Régimen"]) {
                if (!existing["Régimen"].includes(row["Régimen"])) {
                    existing["Régimen"] = `${existing["Régimen"]}, ${row["Régimen"]}`;
                }
            }
        }
    });

    const incomingRows = Array.from(groupedMap.values());
    incomingRows.forEach((row) => {
        const eInDate = parseToDateObj(row["Entrada"]);
        const eOutDate = parseToDateObj(row["Salida"]);

        if ((!row["Noches"] || row["Noches"] === "" || row["Noches"] === "0") && row["Entrada"] && row["Salida"]) {
            if (eInDate && eOutDate && !isNaN(eInDate.getTime()) && !isNaN(eOutDate.getTime())) {
                const diffDays = Math.round((eOutDate - eInDate) / (1000 * 60 * 60 * 24));
                if (diffDays > 0) row["Noches"] = diffDays.toString();
            }
        }

        if (!row["Com_Vencimiento_Rel"] || row["Com_Vencimiento_Rel"] === "") {
            if (eInDate && !isNaN(eInDate.getTime())) {
                const relDate = new Date(eInDate);
                relDate.setDate(relDate.getDate() - 15);
                row["Com_Vencimiento_Rel"] = relDate.toISOString().split("T")[0];
            }
        }
    });

    const totalPaxFound = incomingRows.reduce((a, b) => a + toNum(b["Pax."]), 0);
    const totalImpFound = incomingRows.reduce((a, b) => a + toNum(b["Importe(*)"]), 0);

    const mergedData = [...currentData];
    const APP_ONLY_FIELDS = new Set([
      "Estado", "Com_Comercial", "Com_Estado_Interno", "Com_Notas", "Com_Seguimiento",
      "Com_Vencimiento_Rel", "Com_Precio", "Dep1_Label", "Dep1_Percent", "Dep1_Importe",
      "Dep1_Fecha", "Dep2_Label", "Dep2_Percent", "Dep2_Importe", "Dep2_Fecha",
      "Dep3_Label", "Dep3_Percent", "Dep3_Importe", "Dep3_Fecha", "PaymentPlan_JSON",
      "RoomingList_JSON", "Fiscal_RazonSocial", "Fiscal_CIF", "Fiscal_Direccion",
      "Fiscal_CP", "Fiscal_Poblacion", "Fiscal_Provincia", "Fiscal_Pais", "Email",
      "Telefono", "Persona_Contacto", "Proforma_NetRate", "Proforma_Rooms",
      "Proforma_RoomList", "Com_Pagado", "Hotel_Asignado", "updatedAt"
    ]);

    incomingRows.forEach((newRow, idx) => {
        if (!newRow["Reserva"]) newRow["Reserva"] = `TEMP-${Date.now()}-${idx}`;
        const resID = window.NexusUtils.normalizeId(newRow["Reserva"]);
        
        const existingIdx = mergedData.findIndex((r) => {
            const existingId = window.NexusUtils.normalizeId(r["Reserva"]);
            return (existingId === resID || existingId.startsWith(resID + "_") || resID.startsWith(existingId + "_"));
        });

        if (existingIdx === -1) {
            mergedData.push({ ...newRow, _diff: "new" });
        } else {
            const existingRow = mergedData[existingIdx];
            let diffType = null;
            let changes = {};

            const NUMERIC_KEYS = new Set(["Importe(*)", "Pax.", "Noches", "Pernoct.", "Cant. Habitaciones"]);
            const DATE_KEYS = new Set(["Entrada", "Salida"]);
            const relevantKeys = ["Estado", "Entrada", "Salida", "Pax.", "Importe(*)", "Régimen", "Segment.", "Nombre del Grupo", "Noches", "Pernoct.", "Empresa/Agencia", "Cant. Habitaciones"];

            relevantKeys.forEach((key) => {
                const rawOld = existingRow[key];
                const rawNew = newRow[key];
                if (rawNew === undefined) return;
                
                const isEmptyOld = rawOld === null || rawOld === undefined || String(rawOld).trim() === "" || String(rawOld).trim() === "---";
                const isEmptyNew = rawNew === null || rawNew === undefined || String(rawNew).trim() === "" || String(rawNew).trim() === "---";

                // NO detectar cambios si el nuevo valor está vacío pero el antiguo tenía algo
                if (!isEmptyOld && isEmptyNew) return;
                if (isEmptyOld && isEmptyNew) return;

                let isDifferent = false;
                if (NUMERIC_KEYS.has(key)) {
                    const numOld = toNum(rawOld);
                    const numNew = toNum(rawNew);
                    if (isNaN(numOld) && isNaN(numNew)) return;
                    if (isNaN(numOld) !== isNaN(numNew)) isDifferent = Math.abs(isNaN(numOld) ? numNew : numOld) > 0.01;
                    // Round both to 2 decimals before comparing to avoid floating point drift
                    else isDifferent = Math.abs(Math.round(numOld * 100) - Math.round(numNew * 100)) >= 50;
                } else if (DATE_KEYS.has(key)) {
                    // Normalise BOTH sides to ISO YYYY-MM-DD before comparing
                    const dateOld = toIsoDate(rawOld);
                    const dateNew = toIsoDate(rawNew);
                    if (dateOld === "" && dateNew === "") return;
                    // If either side fails to parse, skip (avoid false positives)
                    if (dateOld === "" || dateNew === "") return;
                    isDifferent = dateOld !== dateNew;
                } else {
                    const cleanStr = (v) => String(v).replace(/\.0$/, "").trim().toUpperCase().replace(/\s+/g, " ");
                    // Normalise segment aliases so "GRUPOS"≡"GRUPO", "GRTANTEO"≡"GRUPO TANTEO", etc.
                    const normalizeSegment = (s) => {
                        if (s === "GRUPOS" || s === "GRUPO") return "GRUPO";
                        if (s === "GRTANTEO" || s === "GRUPO TANTEO" || s === "TANTEO") return "GRUPO TANTEO";
                        if (s === "DIRECTO" || s === "DIRECTO ONLINE" || s === "DIRECTO OFFLINE") return s; // keep as-is
                        return s;
                    };
                    let cleanOld = isEmptyOld ? "" : cleanStr(rawOld);
                    let cleanNew = isEmptyNew ? "" : cleanStr(rawNew);
                    if (key === "Segment.") {
                        cleanOld = normalizeSegment(cleanOld);
                        cleanNew = normalizeSegment(cleanNew);
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

            const oldStatus = (existingRow["Estado"] || "").toLowerCase();
            const newStatus = (newRow["Estado"] || "").toLowerCase();
            if (newStatus.includes("anul") && !oldStatus.includes("anul")) diffType = "cancelled";
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

            if (newRow._hasWarning) mergedRow._hasWarning = true;

            if (Object.keys(changes).length === 0) {
                mergedRow["_diff"] = null;
                mergedRow["_changes"] = null;
            } else {
                mergedRow["_diff"] = diffType || (existingRow._diff ? existingRow._diff : null);
                mergedRow["_changes"] = changes;
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

  window.ExcelService = {
      parseAndMergeFile,
      toIsoDate,
      toInputDate
  };

})();
