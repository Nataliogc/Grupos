(function (root) {
    "use strict";

    var MONTHS_MAP = {
        "enero": "01", "ene": "01",
        "febrero": "02", "feb": "02",
        "marzo": "03", "mar": "03",
        "abril": "04", "abr": "04",
        "mayo": "05", "may": "05",
        "junio": "06", "jun": "06",
        "julio": "07", "jul": "07",
        "agosto": "08", "ago": "08",
        "septiembre": "09", "setiembre": "09", "sep": "09", "sept": "09",
        "octubre": "10", "oct": "10",
        "noviembre": "11", "nov": "11",
        "diciembre": "12", "dic": "12"
    };

    function pad2(n) {
        return String(n).padStart(2, "0");
    }

    function normalizeMonthKey(raw) {
        if (!raw) return "";
        return String(raw)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\.$/, "")
            .trim();
    }

    function getTodayIso(referenceDate) {
        var ref = referenceDate instanceof Date && !isNaN(referenceDate.getTime())
            ? referenceDate
            : new Date();
        return ref.getFullYear() + "-" + pad2(ref.getMonth() + 1) + "-" + pad2(ref.getDate());
    }

    function isValidDayMonth(d, m) {
        var day = parseInt(d, 10);
        var month = parseInt(m, 10);
        return day >= 1 && day <= 31 && month >= 1 && month <= 12;
    }

    function resolveDateRangeYears(dIn, mIn, dOut, mOut, explicitYearIn, explicitYearOut, referenceDate) {
        var ref = referenceDate instanceof Date && !isNaN(referenceDate.getTime())
            ? referenceDate
            : new Date();
        var todayIso = getTodayIso(ref);
        var currentYear = ref.getFullYear();

        var yIn = explicitYearIn
            ? (String(explicitYearIn).length === 2 ? 2000 + parseInt(explicitYearIn, 10) : parseInt(explicitYearIn, 10))
            : currentYear;

        var yOut = explicitYearOut
            ? (String(explicitYearOut).length === 2 ? 2000 + parseInt(explicitYearOut, 10) : parseInt(explicitYearOut, 10))
            : yIn;

        var entrada = yIn + "-" + mIn + "-" + dIn;
        if (!explicitYearIn && !explicitYearOut && entrada < todayIso) {
            yIn += 1;
            yOut = yIn;
            entrada = yIn + "-" + mIn + "-" + dIn;
        }

        var salida = yOut + "-" + mOut + "-" + dOut;
        if (!explicitYearOut && salida < entrada) {
            yOut = yIn + 1;
            salida = yOut + "-" + mOut + "-" + dOut;
        }

        return {
            entrada: entrada,
            salida: salida,
            label: dIn + "/" + mIn + " - " + dOut + "/" + mOut
        };
    }

    function extractDateRanges(text, referenceDate) {
        var clean = String(text || "").trim();
        if (!clean) return [];

        var matches = [];
        var seen = new Set();

        function addRange(index, entrada, salida, label, rawText) {
            if (!entrada || !salida) return;
            var key = entrada + "|" + salida;
            if (seen.has(key)) return;
            seen.add(key);
            matches.push({
                index: index,
                entrada: entrada,
                salida: salida,
                label: label || (entrada.slice(8, 10) + "/" + entrada.slice(5, 7) + " - " + salida.slice(8, 10) + "/" + salida.slice(5, 7)),
                rawText: rawText || ""
            });
        }

        // 1. Rangos con mes en texto:
        //    "Del 19 al 21 de marzo", "del 28 de marzo al 2 de abril de 2027", "15 - 17 de mayo"
        var textRangeRe = /(?:del?\s+|desde\s+(?:el\s+)?)?(\d{1,2})(?:\s+de\s+([a-záéíóúñ\.]+))?\s*(?:al|a\s+el|a|hasta\s+(?:el\s+)?|-|–|—)\s*(\d{1,2})\s*(?:de\s+)?([a-záéíóúñ\.]+)(?:\s*(?:de|del)?\s*(\d{4}))?/gi;
        var m;
        while ((m = textRangeRe.exec(clean)) !== null) {
            var mOutKey = normalizeMonthKey(m[4]);
            var mOut = MONTHS_MAP[mOutKey];
            if (!mOut) continue;

            var mIn = mOut;
            if (m[2]) {
                var mInKey = normalizeMonthKey(m[2]);
                if (!MONTHS_MAP[mInKey]) continue;
                mIn = MONTHS_MAP[mInKey];
            }

            var dInNum = parseInt(m[1], 10);
            var dOutNum = parseInt(m[3], 10);
            if (!isValidDayMonth(dInNum, mIn) || !isValidDayMonth(dOutNum, mOut)) continue;

            var resolved = resolveDateRangeYears(
                pad2(dInNum),
                mIn,
                pad2(dOutNum),
                mOut,
                m[5] || null,
                m[5] || null,
                referenceDate
            );
            addRange(m.index, resolved.entrada, resolved.salida, resolved.label, m[0]);
        }

        // 2. Rangos numéricos:
        //    "del 19/03/2027 al 21/03/2027", "19/03 - 21/03", "15.05.27 al 17.05.27"
        var numRangeRe = /(?:del?\s+|desde\s+(?:el\s+)?)?(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\s*(?:al|a|hasta\s+(?:el\s+)?|-|–|—)\s*(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?/gi;
        while ((m = numRangeRe.exec(clean)) !== null) {
            if (!isValidDayMonth(m[1], m[2]) || !isValidDayMonth(m[4], m[5])) continue;
            var resolvedNum = resolveDateRangeYears(
                pad2(parseInt(m[1], 10)),
                pad2(parseInt(m[2], 10)),
                pad2(parseInt(m[4], 10)),
                pad2(parseInt(m[5], 10)),
                m[3] || m[6] || null,
                m[6] || m[3] || null,
                referenceDate
            );
            addRange(m.index, resolvedNum.entrada, resolvedNum.salida, resolvedNum.label, m[0]);
        }

        // 3. Fallback: pares Entrada / Salida explícitos
        if (matches.length === 0) {
            var inDates = [];
            var outDates = [];
            var inRe = /(?:entrada|check[\s-]?in|llegada|desde)\s*[:=]?\s*(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/gi;
            var outRe = /(?:salida|check[\s-]?out|partida|hasta)\s*[:=]?\s*(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/gi;

            while ((m = inRe.exec(clean)) !== null) {
                if (isValidDayMonth(m[1], m[2])) {
                    inDates.push({ index: m.index, d: pad2(parseInt(m[1], 10)), m: pad2(parseInt(m[2], 10)), y: m[3], raw: m[0] });
                }
            }
            while ((m = outRe.exec(clean)) !== null) {
                if (isValidDayMonth(m[1], m[2])) {
                    outDates.push({ index: m.index, d: pad2(parseInt(m[1], 10)), m: pad2(parseInt(m[2], 10)), y: m[3], raw: m[0] });
                }
            }

            if (inDates.length > 0) {
                for (var i = 0; i < inDates.length; i++) {
                    var inD = inDates[i];
                    var outD = outDates[i] || null;
                    if (outD) {
                        var resPair = resolveDateRangeYears(inD.d, inD.m, outD.d, outD.m, inD.y, outD.y, referenceDate);
                        addRange(inD.index, resPair.entrada, resPair.salida, resPair.label, inD.raw + " / " + outD.raw);
                    } else {
                        var yOnly = inD.y.length === 2 ? "20" + inD.y : inD.y;
                        var entOnly = yOnly + "-" + inD.m + "-" + inD.d;
                        addRange(inD.index, entOnly, "", inD.d + "/" + inD.m, inD.raw);
                    }
                }
            }
        }

        // 4. Fallback final: fechas sueltas DD/MM/YYYY
        if (matches.length === 0) {
            var allDates = [];
            var anyDateRe = /\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\b/g;
            while ((m = anyDateRe.exec(clean)) !== null) {
                if (isValidDayMonth(m[1], m[2])) {
                    allDates.push({ index: m.index, d: pad2(parseInt(m[1], 10)), m: pad2(parseInt(m[2], 10)), y: m[3], raw: m[0] });
                }
            }
            if (allDates.length >= 2) {
                for (var j = 0; j + 1 < allDates.length; j += 2) {
                    var d1 = allDates[j];
                    var d2 = allDates[j + 1];
                    var resStandalone = resolveDateRangeYears(d1.d, d1.m, d2.d, d2.m, d1.y, d2.y, referenceDate);
                    addRange(d1.index, resStandalone.entrada, resStandalone.salida, resStandalone.label, d1.raw + " - " + d2.raw);
                }
            } else if (allDates.length === 1) {
                var single = allDates[0];
                var singleIso = single.y + "-" + single.m + "-" + single.d;
                addRange(single.index, singleIso, "", single.d + "/" + single.m, single.raw);
            }
        }

        matches.sort(function (a, b) {
            return a.index - b.index;
        });

        return matches;
    }

    function extractAgencyAndContact(clean, comEmail) {
        var comNombre = "";
        var agencia = "";

        var nombreMatch = clean.match(/(?:contacto|atentamente|remite|de)\s*[:=]\s*([^\n\r,]+)/i);
        if (nombreMatch && !/sercotel|cumbria|hola|estimad/i.test(nombreMatch[1])) {
            comNombre = nombreMatch[1].trim();
        }

        var agenciaMatch = clean.match(/(?:agencia|empresa|de parte de)\s*[:=]\s*([^\n\r,]+)/i);
        if (agenciaMatch) {
            agencia = agenciaMatch[1].trim();
        }

        // Inspeccionar bloque de firma (tras --- / ___ / Un saludo / Saludos / Atentamente)
        var sigSplit = clean.split(/(?:^|\n)\s*(?:---+|\*\*\*+|___+|un\s+saludo\.?|saludos(?:\s+cordiales)?\.?|atentamente\.?)\s*(?:\n|$)/i);
        if (sigSplit.length > 1) {
            var sigText = sigSplit.slice(1).join("\n");
            var sigLines = sigText
                .split(/\r?\n/)
                .map(function (l) { return l.trim(); })
                .filter(function (l) {
                    if (!l) return false;
                    if (/^[-_*=]{2,}$/.test(l)) return false;
                    if (/@/.test(l)) return false;
                    if (/^(?:https?:\/\/|www\.|[a-z0-9.-]+\.(?:com|es|net|org|eu)\b)/i.test(l)) return false;
                    if (/^(?:\+?34)?[\s.-]*[6789]\d{2}[\s.-]*\d{3}[\s.-]*\d{3}$/.test(l)) return false;
                    return true;
                });

            if (!agencia) {
                var agencyLine = sigLines.find(function (l) {
                    return /\b(viajes|travel|tours?|agencia|turismo|eventos|vacaciones|s\.?l\.?u?\.?|s\.?a\.?)\b/i.test(l) ||
                           /\([A-Z]{2,6}[-\s]?\d{2,6}\)/.test(l);
                });
                if (agencyLine) {
                    agencia = agencyLine
                        .replace(/\([A-Z]{2,6}[-\s]?\d{2,6}\)/g, "")
                        .replace(/\s{2,}/g, " ")
                        .trim();
                }
            }

            if (!comNombre) {
                var contactLine = sigLines.find(function (l) {
                    if (agencia && l.toLowerCase().includes(agencia.toLowerCase())) return false;
                    if (/\b(viajes|travel|tours?|s\.?l\.?|s\.?a\.?)\b/i.test(l)) return false;
                    return l.length >= 3 && l.length <= 60;
                });
                if (contactLine) {
                    comNombre = contactLine;
                }
            }
        }

        if (!agencia && comEmail) {
            var domain = comEmail.split("@")[1];
            if (domain && !/gmail|hotmail|yahoo|outlook|live|icloud/i.test(domain)) {
                agencia = domain.split(".")[0].toUpperCase();
            }
        }

        return { agencia: agencia, comNombre: comNombre };
    }

    function extractRoomsAndGratuities(clean, pax) {
        var roomCounts = {
            "DOBLE DE USO INDIVIDUAL": 0,
            "DOBLE": 0,
            "DOBLE + SUPLETORIA": 0,
            "DOBLE + SUPLETORIA NIÑO": 0,
            "CUÁDRUPLE": 0,
            "SUITE": 0,
            "SUITE SUPERIOR": 0
        };

        var duiMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n(?:es)?|s?\.?)?\s*)?(?:dobles?\s*de\s*uso\s*individual|dui|individual(?:es)?|singles?|singled|sgl)\b/i);
        if (duiMatch) roomCounts["DOBLE DE USO INDIVIDUAL"] = parseInt(duiMatch[1], 10);

        var dblMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n(?:es)?|s?\.?)?\s*)?(?:dobles?(?!\s*de\s*uso\s*individual)|twins?|matrimonios?|dbl)\b/i);
        if (dblMatch) roomCounts["DOBLE"] = parseInt(dblMatch[1], 10);

        var trpNinoMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n(?:es)?|s?\.?)?\s*)?(?:triples?\s*(?:con\s*)?ni[ñn]os?|doble\s*\+\s*supletoria\s*ni[ñn]o|supletoria\s*ni[ñn]o)/i);
        if (trpNinoMatch) {
            roomCounts["DOBLE + SUPLETORIA NIÑO"] = parseInt(trpNinoMatch[1], 10);
        } else {
            var trpMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n(?:es)?|s?\.?)?\s*)?(?:triples?|supletorias?|doble\s*\+\s*supletoria)/i);
            if (trpMatch) roomCounts["DOBLE + SUPLETORIA"] = parseInt(trpMatch[1], 10);
        }

        var cuadMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n(?:es)?|s?\.?)?\s*)?(?:cu[aá]druples?)/i);
        if (cuadMatch) roomCounts["CUÁDRUPLE"] = parseInt(cuadMatch[1], 10);

        var suiteSupMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n(?:es)?|s?\.?)?\s*)?(?:suites?\s+superior(?:es)?)/i);
        if (suiteSupMatch) roomCounts["SUITE SUPERIOR"] = parseInt(suiteSupMatch[1], 10);

        var suiteMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n(?:es)?|s?\.?)?\s*)?(?:suites?(?!\s+superior))/i);
        if (suiteMatch) roomCounts["SUITE"] = parseInt(suiteMatch[1], 10);

        var hasSpecificRooms = Object.values(roomCounts).some(function (v) { return v > 0; });

        // Si no se especificó tipología, buscar total genérico ("sobre 27 habitaciones", "27 habs")
        if (!hasSpecificRooms) {
            var genericRoomsMatch = clean.match(/(?:sobre\s+|unas?\s+|aprox\.?\s*)?(\d{1,3})\s*(?:habitaci[oó]n(?:es)?|habs?\.?)\b/i);
            if (genericRoomsMatch) {
                var totalRooms = parseInt(genericRoomsMatch[1], 10);
                if (totalRooms > 0) {
                    if (pax > 0 && totalRooms < pax && totalRooms * 2 >= pax) {
                        var dobles = pax - totalRooms;
                        var dui = totalRooms - dobles;
                        roomCounts["DOBLE"] = dobles;
                        roomCounts["DOBLE DE USO INDIVIDUAL"] = dui;
                    } else {
                        roomCounts["DOBLE"] = totalRooms;
                    }
                }
            }
        }

        // Chófer y guía en individual/single (y gratuidades)
        var duiGratuities = 0;
        var bothDriverGuideRe = /(?:(?:ch[oó]fer|conductor)\s*(?:y|\+|\/)\s*gu[ií]a|gu[ií]a\s*(?:y|\+|\/)\s*(?:ch[oó]fer|conductor))[^\n\r.;]{0,45}?(?:single[ds]?|individual(?:es)?|dui|sgl|free|gratis|gratuid\w*|liberada\w*)(?:[^\n\r.;]{0,25}?(?:free|gratis|gratuid\w*|liberada\w*|sin\s*cargo))?/i;
        var singleDriverOrGuideRe = /(?:\b(?:ch[oó]fer|conductor|gu[ií]a)\b)[^\n\r.;]{0,35}?(?:single[ds]?|individual|dui|sgl)(?:[^\n\r.;]{0,25}?(?:free|gratis|gratuid\w*|liberada\w*|sin\s*cargo))?/i;

        var bothMatch = clean.match(bothDriverGuideRe);
        if (bothMatch) {
            roomCounts["DOBLE DE USO INDIVIDUAL"] += 2;
            if (/(?:free|gratis|gratuid|liberada|sin\s*cargo)/i.test(bothMatch[0])) {
                duiGratuities = 2;
            }
        } else {
            var singleStaffMatch = clean.match(singleDriverOrGuideRe);
            if (singleStaffMatch) {
                roomCounts["DOBLE DE USO INDIVIDUAL"] += 1;
                if (/(?:free|gratis|gratuid|liberada|sin\s*cargo)/i.test(singleStaffMatch[0])) {
                    duiGratuities = 1;
                }
            }
        }

        var habParts = [];
        if (roomCounts["DOBLE"] > 0) habParts.push(roomCounts["DOBLE"] + " dobles");
        if (roomCounts["DOBLE DE USO INDIVIDUAL"] > 0) habParts.push(roomCounts["DOBLE DE USO INDIVIDUAL"] + " individuales");
        if (roomCounts["DOBLE + SUPLETORIA"] > 0) habParts.push(roomCounts["DOBLE + SUPLETORIA"] + " triples");
        if (roomCounts["DOBLE + SUPLETORIA NIÑO"] > 0) habParts.push(roomCounts["DOBLE + SUPLETORIA NIÑO"] + " triples niño");
        if (roomCounts["CUÁDRUPLE"] > 0) habParts.push(roomCounts["CUÁDRUPLE"] + " cuádruples");
        if (roomCounts["SUITE"] > 0) habParts.push(roomCounts["SUITE"] + " suites");
        if (roomCounts["SUITE SUPERIOR"] > 0) habParts.push(roomCounts["SUITE SUPERIOR"] + " suites superiores");

        return {
            roomCounts: roomCounts,
            habitacionesResumen: habParts.join(", "),
            duiGratuities: duiGratuities
        };
    }

    function buildDateRangeNights(entrada, salida) {
        if (!entrada || !salida || entrada >= salida) return [];
        var dates = [];
        var curr = new Date(entrada + "T12:00:00");
        var end = new Date(salida + "T12:00:00");
        if (isNaN(curr.getTime()) || isNaN(end.getTime())) return [];
        var guard = 0;
        while (curr < end && guard < 90) {
            dates.push(curr.getFullYear() + "-" + pad2(curr.getMonth() + 1) + "-" + pad2(curr.getDate()));
            curr.setDate(curr.getDate() + 1);
            guard++;
        }
        return dates;
    }

    function buildDailyConfigWithGratuities(entrada, salida, regimen, duiGratuities) {
        if (!duiGratuities || duiGratuities <= 0) return {};
        var nights = buildDateRangeNights(entrada, salida);
        var cfg = {};
        nights.forEach(function (d) {
            cfg[d] = {
                "DOBLE DE USO INDIVIDUAL": {
                    price: 0,
                    board: regimen || "HD",
                    gratuities: duiGratuities,
                    discount: 0
                }
            };
        });
        return cfg;
    }

    function parseEmailTextLocallyMulti(text, referenceDate) {
        if (!text || typeof text !== "string") text = "";
        var clean = text.trim();

        // 1. Hotel
        var hotel = "Sercotel Guadiana";
        if (/cumbria/i.test(clean)) {
            hotel = "Cumbria Spa & Hotel";
        }

        // 2. Fechas (una o múltiples)
        var dateRanges = extractDateRanges(clean, referenceDate);
        if (dateRanges.length === 0) {
            dateRanges = [{ entrada: "", salida: "", label: "" }];
        }

        // 3. Pax
        var pax = 0;
        var paxPrefixMatch = clean.match(/(?:pax|personas|pasajeros|viajeros|hu[eé]spedes|asistentes|adultos|participantes|clientes|total\s+(?:personas|pax|pasajeros))\s*[:=]\s*(\d{1,4})/i);
        var paxSuffixMatch = clean.match(/\b(\d{1,4})\s*(?:pax|personas|pasajeros?|viajeros?|hu[eé]spedes|asistentes|adultos|participantes|clientes|jugadores|alumnos|miembros)\b/i);
        if (paxPrefixMatch) {
            pax = parseInt(paxPrefixMatch[1], 10);
        } else if (paxSuffixMatch) {
            pax = parseInt(paxSuffixMatch[1], 10);
        }

        // 4. Régimen (detectar todos los solicitados, ej. "MP o PC" -> ["MP", "PC"])
        var regimenesSolicitados = [];
        if (/\b(ha|sa|solo\s+alojamiento|alojamiento\s+solo)\b/i.test(clean)) {
            regimenesSolicitados.push("HA");
        }
        if (/\b(hd|ad|alojamiento\s+y\s+desayuno|con\s+desayuno)\b/i.test(clean)) {
            regimenesSolicitados.push("HD");
        }
        if (/\b(mp|media\s+pensi[oó]n)\b/i.test(clean)) {
            regimenesSolicitados.push("MP");
        }
        if (/\b(pc|pensi[oó]n\s+completa)\b/i.test(clean)) {
            regimenesSolicitados.push("PC");
        }
        if (regimenesSolicitados.length === 0) {
            regimenesSolicitados = ["HD"];
        }
        var regimen = regimenesSolicitados[0];

        // 5. Contacto y Agencia
        var emailMatch = clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        var comEmail = emailMatch ? emailMatch[0] : "";

        var phoneMatch = clean.match(/(?:tel[eé]fono|tel|m[oó]vil|tfno)?\s*[:=]?\s*(?:\+?34\s*)?([6789]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|[6789]\d{8})/i);
        var comTel = phoneMatch ? phoneMatch[1].replace(/[\s.-]/g, "") : "";

        var cifMatch = clean.match(/\b([A-HJ-NP-SUVW]\d{7}[0-9A-J]|\d{8}[A-Z])\b/i);
        var fiscalCif = cifMatch ? cifMatch[1].toUpperCase() : "";

        var contactInfo = extractAgencyAndContact(clean, comEmail);
        var agencia = contactInfo.agencia;
        var comNombre = contactInfo.comNombre;

        var baseGrupoNombre = "";
        var grupoMatch = clean.match(/nombre\s*(?:del)?\s*grupo\s*[:=]\s*([^\n\r]+)/i) ||
                           clean.match(/(?:^|\n)\s*(?:grupo|asunto|subject)\s*[:=]\s*([^\n\r]+)/i);
        if (grupoMatch) {
            baseGrupoNombre = grupoMatch[1].trim().replace(/^grupo\s+/i, "").toUpperCase();
        }
        if (!baseGrupoNombre) {
            baseGrupoNombre = agencia ? "GRUPO " + agencia.toUpperCase() : "GRUPO NUEVO";
        }

        // 6. Habitaciones
        var roomsInfo = extractRoomsAndGratuities(clean, pax);
        var roomCounts = roomsInfo.roomCounts;
        var habitacionesResumen = roomsInfo.habitacionesResumen || (pax ? Math.ceil(pax / 2) + " dobles aprox." : "");

        if (!pax) {
            var calcPax = (roomCounts["DOBLE"] * 2) +
                (roomCounts["DOBLE DE USO INDIVIDUAL"] * 1) +
                (roomCounts["DOBLE + SUPLETORIA"] * 3) +
                (roomCounts["DOBLE + SUPLETORIA NIÑO"] * 3) +
                (roomCounts["CUÁDRUPLE"] * 4) +
                (roomCounts["SUITE"] * 2) +
                (roomCounts["SUITE SUPERIOR"] * 2);
            if (calcPax > 0) pax = calcPax;
        }

        var importe = 0;
        var precioMatch = clean.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:€|euros?)/i);
        if (precioMatch) {
            importe = parseFloat(precioMatch[1].replace(",", "."));
        }

        var isMulti = dateRanges.length > 1;
        return dateRanges.map(function (range) {
            var nombreGrupo = isMulti && range.label
                ? baseGrupoNombre + " (" + range.label + ")"
                : baseGrupoNombre;

            return {
                "Nombre del Grupo": nombreGrupo,
                "Entrada": range.entrada,
                "Salida": range.salida,
                "Pax.": pax || 0,
                "Empresa/Agencia": agencia,
                "Régimen": regimen,
                "regimenesSolicitados": regimenesSolicitados.slice(),
                "Habitaciones": habitacionesResumen,
                "roomCounts": Object.assign({}, roomCounts),
                "dailyConfig": buildDailyConfigWithGratuities(range.entrada, range.salida, regimen, roomsInfo.duiGratuities),
                "Hotel": hotel,
                "Observaciones": clean,
                "Com_Nombre_Contacto": comNombre,
                "Com_Email_Contacto": comEmail,
                "Com_Telefono_Contacto": comTel,
                "Fiscal_RazonSocial": agencia,
                "Fiscal_CIF": fiscalCif,
                "Fiscal_Direccion": "",
                "Fiscal_CP": "",
                "Fiscal_Poblacion": "",
                "Importe(*)": importe
            };
        });
    }

    function parseEmailTextLocally(text, referenceDate) {
        var list = parseEmailTextLocallyMulti(text, referenceDate);
        return list[0];
    }

    function normalizeAiExtractionResponse(parsed, emailText, referenceDate) {
        var rawList = [];
        if (Array.isArray(parsed)) {
            rawList = parsed;
        } else if (parsed && Array.isArray(parsed.grupos)) {
            rawList = parsed.grupos;
        } else if (parsed && Array.isArray(parsed.groups)) {
            rawList = parsed.groups;
        } else if (parsed && typeof parsed === "object") {
            rawList = [parsed];
        }

        rawList = rawList.filter(function (item) { return item && typeof item === "object"; });
        if (rawList.length === 0) {
            return parseEmailTextLocallyMulti(emailText, referenceDate);
        }

        // Si la IA solo devolvió 1 grupo pero el texto contiene claramente múltiples rangos de fechas,
        // replicamos la ficha extraída por la IA para cada rango de fechas detectado.
        if (rawList.length === 1 && emailText) {
            var localRanges = extractDateRanges(emailText, referenceDate);
            if (localRanges.length > 1) {
                var base = rawList[0];
                var baseName = String(base["Nombre del Grupo"] || "GRUPO NUEVO").trim();
                return localRanges.map(function (range) {
                    return Object.assign({}, base, {
                        "Nombre del Grupo": range.label ? baseName + " (" + range.label + ")" : baseName,
                        "Entrada": range.entrada,
                        "Salida": range.salida,
                        "roomCounts": Object.assign({}, base.roomCounts || {}),
                        "dailyConfig": Object.assign({}, base.dailyConfig || {})
                    });
                });
            }
        }

        return rawList.map(function (item) {
            return Object.assign({
                "Nombre del Grupo": "",
                "Entrada": "",
                "Salida": "",
                "Pax.": 0,
                "Empresa/Agencia": "",
                "Régimen": "HD",
                "Habitaciones": "",
                "roomCounts": {},
                "Hotel": "Sercotel Guadiana",
                "Observaciones": emailText || "",
                "Com_Nombre_Contacto": "",
                "Com_Email_Contacto": "",
                "Com_Telefono_Contacto": "",
                "Fiscal_RazonSocial": "",
                "Fiscal_CIF": "",
                "Fiscal_Direccion": "",
                "Fiscal_CP": "",
                "Fiscal_Poblacion": "",
                "Importe(*)": 0
            }, item);
        });
    }

    var api = {
        extractDateRanges: extractDateRanges,
        parseEmailTextLocally: parseEmailTextLocally,
        parseEmailTextLocallyMulti: parseEmailTextLocallyMulti,
        normalizeAiExtractionResponse: normalizeAiExtractionResponse
    };

    root.NexusEmailParser = api;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = api;
    }
})(typeof window !== "undefined" ? window : globalThis);
