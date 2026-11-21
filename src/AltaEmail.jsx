
        const { useState, useEffect, useRef } = React;

        // LucideIcon cargado desde js/icons.js (window.LucideIcon)

        // --- FIREBASE ---
        const db = window.db;

        // --- CONSTANTES ---
        const ROOM_TYPES = {
            "Sercotel Guadiana": ["DOBLE DE USO INDIVIDUAL", "DOBLE", "DOBLE + SUPLETORIA", "DOBLE + SUPLETORIA NIÑO", "CUÁDRUPLE", "SUITE", "SUITE SUPERIOR"],
            "Cumbria Spa & Hotel": ["DOBLE DE USO INDIVIDUAL", "DOBLE", "DOBLE + SUPLETORIA", "DOBLE + SUPLETORIA NIÑO", "SUITE"],
            "Cumbria Spa&Hotel": ["DOBLE DE USO INDIVIDUAL", "DOBLE", "DOBLE + SUPLETORIA", "DOBLE + SUPLETORIA NIÑO", "SUITE"]
        };

        const BOARD_TYPES = [
            "HA (Solo Alojamiento)",
            "HD (Alojamiento y Desayuno)",
            "MP (Media Pensión)",
            "PC (Pensión Completa)"
        ];

        // --- UTILS (cargadas desde js/utils.js) ---
        const generateDates = NexusUtils.generateDates;
        const formatDate = NexusUtils.formatDate;
        const formatNum = NexusUtils.formatNum;

        const calculateDefaultCommission = (price, regime, qty, nights, type = "") => {
            return 0;
        };

        const buildRoomingList = (group, existingListJson = "[]") => {
            let existingList = [];
            try {
                existingList = JSON.parse(existingListJson || "[]");
            } catch (e) {
                existingList = [];
            }

            const dates = generateDates(group.Entrada, group.Salida);
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
                    } else {
                        const tk = Object.keys(config).find(k => k.trim().toLowerCase() === type.trim().toLowerCase());
                        if (tk && config[tk] && config[tk].count !== undefined && config[tk].count !== '' && config[tk].count !== undefined) {
                            count = Number(config[tk].count);
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

                        const paxPerRoom = type.toLowerCase().includes('ind') || type.toLowerCase().includes('dui') ? 1 : type.toLowerCase().includes('tri') ? 3 : 2;
                        const payingRooms = Math.max(0, count - gratuities);

                        const match = existingList.find(item => 
                            item.dateIn === date && 
                            item.type === type && 
                            !item.isService
                        );

                        if (payingRooms > 0) {
                            const regimeShort = regime.split(' ')[0];
                            newList.push({
                                id: match ? match.id : Date.now() + Math.random(),
                                hotel: hotelName,
                                type: type,
                                dateIn: date,
                                dateOut: date,
                                qty: payingRooms,
                                regime: regimeShort,
                                price: price,
                                pax: paxPerRoom,
                                nights: 1,
                                total: (payingRooms * price * (1 - discount / 100)).toFixed(2),
                                isService: false,
                                comision: match && match.comision ? match.comision : calculateDefaultCommission(price, regimeShort, payingRooms, 1, type)
                            });
                        }

                        if (gratuities > 0) {
                            const regimeShort = regime.split(' ')[0];
                            const matchGrat = existingList.find(item => 
                                item.dateIn === date && 
                                item.type === (type + " (GRATUIDAD)") && 
                                !item.isService
                            );

                            newList.push({
                                id: matchGrat ? matchGrat.id : Date.now() + Math.random(),
                                hotel: hotelName,
                                type: type + " (GRATUIDAD)",
                                dateIn: date,
                                dateOut: date,
                                qty: gratuities,
                                regime: regimeShort,
                                price: 0,
                                pax: paxPerRoom,
                                nights: 1,
                                total: "0.00",
                                isService: false,
                                comision: matchGrat && matchGrat.comision ? matchGrat.comision : calculateDefaultCommission(0, regimeShort, gratuities, 1, type)
                            });
                        }
                    }
                });

                existingList.forEach(item => {
                    if (item.isService && item.dateIn === date) {
                        newList.push(item);
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

        const App = () => {
            const [emailText, setEmailText] = useState("");
            const [isAnalyzing, setIsAnalyzing] = useState(false);
            const [extractedGroups, setExtractedGroups] = useState([]);
            const [activeGroupIndex, setActiveGroupIndex] = useState(0);
            const [savedBudgets, setSavedBudgets] = useState([]);
            const [saveMode, setSaveMode] = useState("unified");
            const [includeBothHotels, setIncludeBothHotels] = useState(false);
            const [selectedBoards, setSelectedBoards] = useState(["HD"]);
            const [saveStatus, setSaveStatus] = useState(null);
            const [validation, setValidation] = useState({});
            const [isEditMode, setIsEditMode] = useState(false);
            const [extractionMode, setExtractionMode] = useState(null);
            const [extractionNotice, setExtractionNotice] = useState(null);

            const extractedData = extractedGroups[activeGroupIndex] || null;

            const toggleBoard = (code) => {
                setSelectedBoards(prev => {
                    const exists = prev.includes(code);
                    if (exists && prev.length === 1) return prev; // Al menos 1 régimen activo
                    const next = exists ? prev.filter(b => b !== code) : [...prev, code];
                    const order = ["HA", "HD", "MP", "PC"];
                    next.sort((a, b) => order.indexOf(a) - order.indexOf(b));
                    // Sincronizar Régimen principal en la ficha activa
                    if (extractedGroups.length > 0) {
                        setExtractedGroups(groups => groups.map(g => ({ ...g, "Régimen": next[0] })));
                    }
                    return next;
                });
            };

            const getGroupErrors = (data) => {
                const errors = {};
                if (!data) return errors;
                if (!data["Nombre del Grupo"]) errors["Nombre del Grupo"] = true;
                if (!data["Entrada"]) errors["Entrada"] = true;
                if (!data["Salida"]) errors["Salida"] = true;
                if (!data["Pax."] || Number(data["Pax."]) <= 0) errors["Pax."] = true;
                return errors;
            };

            const setExtractedData = (newData) => {
                if (!newData) {
                    setExtractedGroups([]);
                    setActiveGroupIndex(0);
                    return;
                }
                setExtractedGroups(prev => {
                    if (!prev.length) return [newData];
                    const next = [...prev];
                    next[activeGroupIndex] = newData;
                    return next;
                });
            };

            const applyExtractedGroups = (groupsList) => {
                const list = Array.isArray(groupsList) ? groupsList.filter(Boolean) : (groupsList ? [groupsList] : []);
                setExtractedGroups(list);
                setActiveGroupIndex(0);
                setSavedBudgets([]);
                setSaveStatus(null);
                setSaveMode("unified");
                if (list.length > 0) {
                    const detectedBoards = Array.isArray(list[0].regimenesSolicitados) && list[0].regimenesSolicitados.length > 0
                        ? list[0].regimenesSolicitados
                        : [list[0]["Régimen"] || "HD"];
                    setSelectedBoards(detectedBoards);
                    setValidation(getGroupErrors(list[0]));
                } else {
                    setSelectedBoards(["HD"]);
                    setValidation({});
                }
            };

            const selectGroupTab = (idx) => {
                if (idx < 0 || idx >= extractedGroups.length) return;
                setActiveGroupIndex(idx);
                setValidation(getGroupErrors(extractedGroups[idx]));
            };

            const handleAddAnotherDate = () => {
                if (!extractedData) return;
                const cleanBaseName = String(extractedData["Nombre del Grupo"] || "GRUPO NUEVO")
                    .replace(/\s*\(\d{2}\/\d{2}\s*-\s*\d{2}\/\d{2}\)\s*$/, "")
                    .trim();
                const clone = {
                    ...extractedData,
                    "Reserva": "",
                    "Nombre del Grupo": cleanBaseName,
                    "Entrada": "",
                    "Salida": "",
                    "roomCounts": { ...(extractedData.roomCounts || {}) },
                    "dailyConfig": {}
                };
                const nextList = [...extractedGroups, clone];
                setExtractedGroups(nextList);
                setActiveGroupIndex(nextList.length - 1);
                setValidation(getGroupErrors(clone));
            };

            const handleRemoveGroup = (idx) => {
                if (extractedGroups.length <= 1) return;
                const nextList = extractedGroups.filter((_, i) => i !== idx);
                const nextIdx = Math.min(activeGroupIndex, nextList.length - 1);
                setExtractedGroups(nextList);
                setActiveGroupIndex(nextIdx);
                setValidation(getGroupErrors(nextList[nextIdx]));
            };

            useEffect(() => {
                const params = new URLSearchParams(window.location.search);
                let editId = params.get('edit') || params.get('reserva');

                if (editId) {
                    console.log("Detectado ID para edición:", editId);
                    setIsEditMode(true);
                    setIsAnalyzing(true);
                    // Normalizar el ID igual que en el guardado
                    const normId = String(editId).trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");

                    db.collection("groups").doc(normId).get().then(doc => {
                        if (doc.exists) {
                            const data = doc.data();
                            console.log("Documento encontrado:", data);
                            const st = (data.Com_Estado_Interno || data.Estado || "").toUpperCase();
                            const resId = String(data.Reserva || normId).trim();
                            const isLocked = Boolean(
                                st.includes("CONFIRM") ||
                                st.includes("TENTA") ||
                                st.includes("TANTEO") ||
                                st.includes("BLOQ") ||
                                st.includes("OPCI") ||
                                (!resId.toUpperCase().startsWith("PRES-")) ||
                                data.convertedToReservation ||
                                data.targetReservationId ||
                                data.isReadOnly ||
                                data.isHistoricalBudget
                            );
                            if (isLocked) {
                                alert("⚠️ Este presupuesto ya está confirmado o en tentativa con ID de reserva del PMS (" + resId + ").\n\nNo se puede modificar, queda exclusivamente como consulta.");
                                window.location.href = "Presupuestos.html?id=" + encodeURIComponent(normId);
                                return;
                            }
                            setExtractedData({
                                ...data,
                                "Observaciones": data.Com_Notas || data.Observaciones || "",
                                "Hotel": data.Hotel_Asignado || data.Hotel || "Sercotel Guadiana",
                                "Empresa/Agencia": data["Empresa/Agencia"] || data.Empresa || ""
                            });
                            // Validar tras un pequeño delay
                            setTimeout(() => {
                                const newData = {
                                    ...data,
                                    "Nombre del Grupo": data["Nombre del Grupo"] || "",
                                    "Entrada": data["Entrada"] || "",
                                    "Salida": data["Salida"] || "",
                                    "Pax.": data["Pax."] || "0"
                                };
                                validateData(newData);
                            }, 200);
                        } else {
                            console.warn("No se encontró el documento en Firestore con ID:", normId);
                            // Si no existe el doc, pero tenemos datos en localStorage, usarlos como base
                            const storedRaw = window.NexusSelectedGroupStorage.getItem('selectedGroup');
                            if (storedRaw) {
                                try {
                                    const storedData = JSON.parse(storedRaw);
                                    setExtractedData({
                                        ...storedData,
                                        "Observaciones": storedData.Com_Notas || storedData.Observaciones || "",
                                        "Hotel": storedData.Hotel_Asignado || storedData.Hotel || "Sercotel Guadiana"
                                    });
                                    validateData(storedData);
                                } catch (e) { }
                            }
                        }
                    }).catch(err => {
                        console.error("Error cargando presupuesto:", err);
                    }).finally(() => {
                        setIsAnalyzing(false);
                    });
                }
            }, []);

            // Utility for safe localStorage access
            const safeStorage = {
                getItem: (key) => {
                    try { return localStorage.getItem(key); } catch (e) { return null; }
                },
                setItem: (key, value) => {
                    try { localStorage.setItem(key, value); } catch (e) { }
                }
            };

            const validateData = (data) => {
                const errors = getGroupErrors(data);
                setValidation(errors);
                return Object.keys(errors).length === 0;
            };

            const calculateTotal = (data) => {
                if (!data) return 0;
                let total = 0;

                // Normalizar accounts evitando duplicar mayus y minus
                const normalizedRoomCounts = {};
                Object.entries(data.roomCounts || {}).forEach(([t, c]) => {
                    const lowerT = t.toLowerCase();
                    normalizedRoomCounts[lowerT] = (normalizedRoomCounts[lowerT] || 0) + Number(c);
                });

                const dConfig = data.dailyConfig || {};
                const dates = generateDates(data.Entrada, data.Salida);

                if (dates.length > 0 && Object.keys(dConfig).length > 0) {
                    dates.forEach(date => {
                        const dayData = dConfig[date] || {};
                        Object.entries(normalizedRoomCounts).forEach(([type, count]) => {
                            if (count > 0) {
                                let lineSubtotal = 0;
                                if (dayData.prices) {
                                    const priceKey = Object.keys(dayData.prices).find(k => k.toLowerCase() === type);
                                    const p = priceKey ? parseFloat(dayData.prices[priceKey] || 0) : 0;
                                    const gratKey = dayData.gratuities ? Object.keys(dayData.gratuities).find(k => k.toLowerCase() === type) : null;
                                    const grat = gratKey ? parseInt(dayData.gratuities[gratKey] || 0) : 0;
                                    const discKey = dayData.discounts ? Object.keys(dayData.discounts).find(k => k.toLowerCase() === type) : null;
                                    const disc = discKey ? parseFloat(dayData.discounts[discKey] || 0) : 0;
                                    const billableCount = Math.max(0, count - grat);
                                    lineSubtotal = p * billableCount * (1 - disc / 100);
                                } else {
                                    const typeKey = Object.keys(dayData).find(k => k.toLowerCase() === type);
                                    if (typeKey && dayData[typeKey]) {
                                        const price = parseFloat(dayData[typeKey].price) || 0;
                                        const discount = parseFloat(dayData[typeKey].discount) || 0;
                                        const gratuities = parseInt(dayData[typeKey].gratuities) || 0;
                                        const billableCount = Math.max(0, count - gratuities);
                                        lineSubtotal = billableCount * price * (1 - discount / 100);
                                    }
                                }
                                total += lineSubtotal;
                            }
                        });
                    });
                    // Descuentos globales
                    const descuentos = parseFloat(data.Descuentos) || 0;
                    total = total - descuentos;
                } else {
                    total = parseFloat(data["Importe(*)"]) || 0;
                }
                return total > 0 ? total : 0;
            };

            // Analizador local cargado desde js/services/emailParser.js (window.NexusEmailParser)

            const parseEmailTextLocally = (text) => {
                if (window.NexusEmailParser && typeof window.NexusEmailParser.parseEmailTextLocallyMulti === 'function') {
                    return window.NexusEmailParser.parseEmailTextLocallyMulti(text);
                }
                return [{
                    'Nombre del Grupo': 'GRUPO NUEVO',
                    'Entrada': '',
                    'Salida': '',
                    'Pax.': 0,
                    'Empresa/Agencia': '',
                    'Régimen': 'HD',
                    'Habitaciones': '',
                    'roomCounts': {},
                    'Hotel': 'Sercotel Guadiana',
                    'Observaciones': String(text || '').trim(),
                    'Com_Nombre_Contacto': '',
                    'Com_Email_Contacto': '',
                    'Com_Telefono_Contacto': '',
                    'Fiscal_RazonSocial': '',
                    'Fiscal_CIF': '',
                    'Fiscal_Direccion': '',
                    'Fiscal_CP': '',
                    'Fiscal_Poblacion': '',
                    'Importe(*)': 0
                }];
            };

            const handleLocalExtract = () => {
                if (!emailText.trim()) return;
                setIsAnalyzing(true);
                setExtractionNotice(null);
                try {
                    const parsedList = parseEmailTextLocally(emailText);
                    applyExtractedGroups(parsedList);
                    setExtractionMode('local');
                } catch (err) {
                    alert("Error en la extracción local: " + err.message);
                } finally {
                    setIsAnalyzing(false);
                }
            };

            const handleAnalyze = () => {
                if (!emailText.trim()) return;
                setIsAnalyzing(true);
                setExtractionNotice(null);
                try {
                    const parsedList = parseEmailTextLocally(emailText);
                    applyExtractedGroups(parsedList);
                    setExtractionMode('local');
                } catch (err) {
                    alert("Error en el análisis del correo: " + err.message);
                } finally {
                    setIsAnalyzing(false);
                }
            };

            const buildRoomAllocationsForGroup = (grp) => {
                const counts = grp.roomCounts || {};
                const allocs = [];
                Object.entries(counts).forEach(([roomType, rawRooms]) => {
                    const rooms = Number(rawRooms || 0);
                    if (rooms <= 0) return;
                    const rtLower = roomType.toLowerCase();
                    const paxPerRoom = rtLower.includes("individual") || rtLower.includes("dui")
                        ? 1
                        : (rtLower.includes("cuádruple") || rtLower.includes("cuadruple") ? 4 : (rtLower.includes("supletoria") || rtLower.includes("triple") ? 3 : 2));
                    allocs.push({
                        roomType: roomType.toUpperCase(),
                        rooms: rooms,
                        pax: rooms * paxPerRoom
                    });
                });
                if (allocs.length === 0) {
                    const fallbackPax = Number(grp["Pax."] || 0);
                    allocs.push({
                        roomType: "DOBLE",
                        rooms: Math.max(1, Math.ceil(fallbackPax / 2)),
                        pax: fallbackPax || 2
                    });
                }
                return allocs;
            };

            const buildRatesOnlyFlags = (hotelName, roomCountsObj) => {
                const useRatesOnly = selectedBoards.length > 1 || includeBothHotels;
                const allBoards = ["HA", "HD", "MP", "PC"];
                const hiddenGridRows = allBoards.filter(b => !selectedBoards.includes(b));
                const hotelRooms = ROOM_TYPES[hotelName] || ROOM_TYPES["Sercotel Guadiana"];
                const usedRoomTypes = Object.entries(roomCountsObj || {})
                    .filter(([_, c]) => Number(c) > 0)
                    .map(([t]) => t.toUpperCase());
                const hiddenGridCols = usedRoomTypes.length > 0
                    ? hotelRooms.filter(r => !usedRoomTypes.includes(r.toUpperCase()))
                    : ["DOBLE + SUPLETORIA NIÑO", "SUITE", "SUITE SUPERIOR"];
                return {
                    isRatesOnly: useRatesOnly,
                    hiddenGridRows: hiddenGridRows,
                    hiddenGridCols: hiddenGridCols,
                    requestedBoards: [...selectedBoards],
                    includeBothHotels: !!includeBothHotels
                };
            };

            const handleSave = async () => {
                if (!extractedGroups.length) return;

                // Validate all groups before save
                for (let i = 0; i < extractedGroups.length; i++) {
                    const errs = getGroupErrors(extractedGroups[i]);
                    if (Object.keys(errs).length > 0) {
                        setActiveGroupIndex(i);
                        setValidation(errs);
                        return;
                    }
                    const hotelCheck = String(extractedGroups[i].Hotel || "Sercotel Guadiana");
                    if (!hotelCheck || hotelCheck.toLowerCase().includes("pend") || hotelCheck.trim() === "") {
                        setActiveGroupIndex(i);
                        alert("⚠️ Error de Integridad: Debe asignar un hotel válido en el Grupo " + (i + 1) + ". No se permiten registros 'Pendientes'.");
                        return;
                    }
                }

                setSaveStatus('saving');
                try {
                    const now = new Date();
                    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    const usedIds = new Set();
                    const createdList = [];

                    const shouldUnify = saveMode === "unified" || extractedGroups.length === 1;

                    if (shouldUnify) {
                        const first = extractedGroups[0];
                        const hotelAsignado = String(first.Hotel || "Sercotel Guadiana");
                        const rawReservaId = first.Reserva || `PRES-${Math.floor(100000 + Math.random() * 900000)}`;
                        const reservaId = String(rawReservaId).trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");

                        const isMultiDates = extractedGroups.length > 1;
                        const allIn = extractedGroups.map(g => String(g["Entrada"] || "")).filter(Boolean).sort();
                        const allOut = extractedGroups.map(g => String(g["Salida"] || "")).filter(Boolean).sort();
                        const entrada = allIn[0] || String(first["Entrada"] || "");
                        const salida = allOut[allOut.length - 1] || String(first["Salida"] || "");

                        let releaseDate = first.Com_Vencimiento_Rel || "";
                        if (!releaseDate && entrada) {
                            const d = new Date(entrada);
                            if (!isNaN(d.getTime())) {
                                d.setDate(d.getDate() - 15);
                                releaseDate = d.toISOString().split("T")[0];
                            }
                        }

                        const cleanBaseName = isMultiDates
                            ? String(first["Nombre del Grupo"] || "Sin Nombre").replace(/\s*\(\d{2}\/\d{2}\s*-\s*\d{2}\/\d{2}\)\s*$/, "").trim().toUpperCase()
                            : String(first["Nombre del Grupo"] || "Sin Nombre").toUpperCase();

                        const segments = isMultiDates ? extractedGroups.map((grp, idx) => {
                            const allocs = buildRoomAllocationsForGroup(grp);
                            const totalRooms = allocs.reduce((s, a) => s + Number(a.rooms || 0), 0);
                            return {
                                id: idx + 1,
                                pax: Number(grp["Pax."] || 0),
                                rooms: totalRooms,
                                roomType: allocs[0]?.roomType || "DOBLE",
                                roomAllocations: allocs,
                                in: String(grp["Entrada"] || ""),
                                out: String(grp["Salida"] || ""),
                                notes: `Opción / Grupo ${idx + 1}`
                            };
                        }) : [];

                        const mergedDailyConfig = {};
                        extractedGroups.forEach(grp => {
                            Object.entries(grp.dailyConfig || {}).forEach(([d, cfg]) => {
                                mergedDailyConfig[d] = cfg;
                            });
                        });

                        const rateFlags = buildRatesOnlyFlags(hotelAsignado, first.roomCounts || {});
                        const totalPaxStr = isMultiDates
                            ? String(segments.reduce((sum, s) => sum + Number(s.pax || 0), 0))
                            : String(first["Pax."] || "0");

                        const groupToSave = {
                            "Nombre del Grupo": cleanBaseName,
                            "Entrada": entrada,
                            "Salida": salida,
                            "Pax.": totalPaxStr,
                            "declaredPax": totalPaxStr,
                            "Habitaciones": String(first["Habitaciones"] || ""),
                            "roomCounts": first.roomCounts || {},
                            "Empresa/Agencia": String(first["Empresa/Agencia"] || ""),
                            "Régimen": selectedBoards[0] || String(first["Régimen"] || "HD"),
                            "Importe(*)": String(calculateTotal(first) || "0"),
                            "Reserva": reservaId,
                            "Estado": "Presupuesto",
                            "Com_Estado_Interno": first.Com_Estado_Interno || "PRESUPUESTO",
                            "Segment.": first["Segment."] || "GRUPOS",
                            "Hotel_Asignado": hotelAsignado,
                            "Com_Notas": String(first.Observaciones || ""),
                            "Com_Vencimiento_Rel": releaseDate,
                            "Com_Nombre_Contacto": String(first.Com_Nombre_Contacto || ""),
                            "Com_Email_Contacto": String(first.Com_Email_Contacto || ""),
                            "Com_Telefono_Contacto": String(first.Com_Telefono_Contacto || ""),
                            "Fiscal_RazonSocial": String(first.Fiscal_RazonSocial || ""),
                            "Fiscal_CIF": String(first.Fiscal_CIF || ""),
                            "Fiscal_Direccion": String(first.Fiscal_Direccion || ""),
                            "Fiscal_CP": String(first.Fiscal_CP || ""),
                            "Fiscal_Poblacion": String(first.Fiscal_Poblacion || ""),
                            "Com_Comercial": first.Com_Comercial || "",
                            "isMultiSegment": isMultiDates,
                            "segments": segments,
                            "isRatesOnly": rateFlags.isRatesOnly,
                            "hiddenGridRows": rateFlags.hiddenGridRows,
                            "hiddenGridCols": rateFlags.hiddenGridCols,
                            "requestedBoards": rateFlags.requestedBoards,
                            "includeBothHotels": rateFlags.includeBothHotels,
                            "tracking": first.tracking || [{ id: Date.now(), date: formattedDate, text: "Alta Inteligente por Email." }],
                            "dailyConfig": mergedDailyConfig,
                            "RoomingList_JSON": JSON.stringify(buildRoomingList({ ...first, Entrada: entrada, Salida: salida, dailyConfig: mergedDailyConfig, Hotel_Asignado: hotelAsignado }, "")),
                            "createdAt": first.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
                            "updatedAt": firebase.firestore.FieldValue.serverTimestamp()
                        };

                        await db.collection("groups").doc(reservaId).set(groupToSave, { merge: true });
                        createdList.push({
                            reservaId,
                            nombre: groupToSave["Nombre del Grupo"],
                            entrada: groupToSave["Entrada"],
                            salida: groupToSave["Salida"],
                            pax: groupToSave["Pax."],
                            hotel: hotelAsignado
                        });
                    } else {
                        for (let idx = 0; idx < extractedGroups.length; idx++) {
                            const item = extractedGroups[idx];
                            const hotelAsignado = String(item.Hotel || "Sercotel Guadiana");
                            let rawReservaId = item.Reserva;
                            if (!rawReservaId) {
                                do {
                                    rawReservaId = `PRES-${Math.floor(100000 + Math.random() * 900000)}`;
                                } while (usedIds.has(rawReservaId));
                            }
                            const reservaId = String(rawReservaId).trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");
                            usedIds.add(reservaId);

                            const entrada = String(item["Entrada"] || "");
                            let releaseDate = item.Com_Vencimiento_Rel || "";
                            if (!releaseDate && entrada) {
                                const d = new Date(entrada);
                                if (!isNaN(d.getTime())) {
                                    d.setDate(d.getDate() - 15);
                                    releaseDate = d.toISOString().split("T")[0];
                                }
                            }

                            const rateFlags = buildRatesOnlyFlags(hotelAsignado, item.roomCounts || {});
                            const groupToSave = {
                                "Nombre del Grupo": String(item["Nombre del Grupo"] || "Sin Nombre").toUpperCase(),
                                "Entrada": entrada,
                                "Salida": String(item["Salida"] || ""),
                                "Pax.": String(item["Pax."] || "0"),
                                "Habitaciones": String(item["Habitaciones"] || ""),
                                "roomCounts": item.roomCounts || {},
                                "Empresa/Agencia": String(item["Empresa/Agencia"] || ""),
                                "Régimen": selectedBoards[0] || String(item["Régimen"] || "HD"),
                                "Importe(*)": String(calculateTotal(item) || "0"),
                                "Reserva": reservaId,
                                "Estado": "Presupuesto",
                                "Com_Estado_Interno": item.Com_Estado_Interno || "PRESUPUESTO",
                                "Segment.": item["Segment."] || "GRUPOS",
                                "Hotel_Asignado": hotelAsignado,
                                "Com_Notas": String(item.Observaciones || ""),
                                "Com_Vencimiento_Rel": releaseDate,
                                "Com_Nombre_Contacto": String(item.Com_Nombre_Contacto || ""),
                                "Com_Email_Contacto": String(item.Com_Email_Contacto || ""),
                                "Com_Telefono_Contacto": String(item.Com_Telefono_Contacto || ""),
                                "Fiscal_RazonSocial": String(item.Fiscal_RazonSocial || ""),
                                "Fiscal_CIF": String(item.Fiscal_CIF || ""),
                                "Fiscal_Direccion": String(item.Fiscal_Direccion || ""),
                                "Fiscal_CP": String(item.Fiscal_CP || ""),
                                "Fiscal_Poblacion": String(item.Fiscal_Poblacion || ""),
                                "Com_Comercial": item.Com_Comercial || "",
                                "isRatesOnly": rateFlags.isRatesOnly,
                                "hiddenGridRows": rateFlags.hiddenGridRows,
                                "hiddenGridCols": rateFlags.hiddenGridCols,
                                "requestedBoards": rateFlags.requestedBoards,
                                "includeBothHotels": rateFlags.includeBothHotels,
                                "tracking": item.tracking || [{ id: Date.now() + idx, date: formattedDate, text: "Alta Inteligente por Email." }],
                                "dailyConfig": item.dailyConfig || {},
                                "RoomingList_JSON": JSON.stringify(buildRoomingList({ ...item, Hotel_Asignado: hotelAsignado }, "")),
                                "createdAt": item.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
                                "updatedAt": firebase.firestore.FieldValue.serverTimestamp()
                            };

                            await db.collection("groups").doc(reservaId).set(groupToSave, { merge: true });
                            createdList.push({
                                reservaId,
                                nombre: groupToSave["Nombre del Grupo"],
                                entrada: groupToSave["Entrada"],
                                salida: groupToSave["Salida"],
                                pax: groupToSave["Pax."],
                                hotel: hotelAsignado
                            });
                        }
                    }

                    setSavedBudgets(createdList);
                    setSaveStatus('success');

                    if (createdList.length === 1) {
                        setTimeout(() => window.location.href = 'Presupuestos.html?id=' + createdList[0].reservaId + '&edit=1', 1000);
                    }
                } catch (e) {
                    console.error(e);
                    alert("Error al guardar: " + e.message);
                    setSaveStatus(null);
                }
            };

            const updateField = (key, value) => {
                let newData = { ...extractedData, [key]: value };

                // Si cambia el hotel, podemos resetear roomCounts o dejarlo (el UI filtrará)
                // Pero es mejor asegurar que roomCounts existe
                if (key === "Hotel") {
                    newData.roomCounts = newData.roomCounts || {};
                }

                setExtractedData(newData);
                validateData(newData);
            };

            const handleRoomCountChange = (type, val) => {
                const count = parseInt(val) || 0;
                const newCounts = { ...(extractedData.roomCounts || {}), [type]: count };

                // Generar el string de resumen automáticamente
                const summary = Object.entries(newCounts)
                    .filter(([_, c]) => c > 0)
                    .map(([t, c]) => `${c} ${t}`)
                    .join(", ");

                setExtractedData({
                    ...extractedData,
                    roomCounts: newCounts,
                    "Habitaciones": summary
                });
            };

            const handleDailyConfigChange = (date, type, field, val) => {
                const newConfig = { ...(extractedData.dailyConfig || {}) };
                if (!newConfig[date]) newConfig[date] = {};
                if (!newConfig[date][type]) newConfig[date][type] = { price: 0, board: extractedData["Régimen"] || "AD" };

                newConfig[date][type][field] = val;

                setExtractedData({
                    ...extractedData,
                    dailyConfig: newConfig
                });
            };


            return (
                <div className="min-h-screen bg-slate-100 flex flex-col">
                    {/* Header */}
                    <header className="gradient-bg text-white p-4 shadow-xl relative overflow-hidden shrink-0">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <LucideIcon name="sparkles" className="w-24 h-24" />
                        </div>
                        <div className="container mx-auto flex justify-between items-center px-4">
                            <div className="flex items-center gap-4">
                                <a href="Admin.html" className="p-2 hover:bg-white/10 rounded-full transition-all">
                                    <LucideIcon name="chevron-left" className="w-5 h-5" />
                                </a>
                                <div>
                                    <h1 className="text-xl font-black tracking-tight">{isEditMode ? 'Editar Presupuesto' : 'Alta Inteligente'}</h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <LucideIcon name={isEditMode ? "edit" : "mail"} className="w-3 h-3" /> {isEditMode ? 'Modificando Lead' : 'Ficha desde Email'}
                                    </p>
                                </div>
                            </div>
                            <div className="hidden md:flex gap-3">
                                {extractedData && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                                        <div className={`w-2 h-2 rounded-full ${Object.keys(validation).length === 0 ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">
                                            {Object.keys(validation).length === 0 ? 'Datos Validados' : `${Object.keys(validation).length} campos pendientes`}
                                        </span>
                                    </div>
                                )}
                                <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md">
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-400">Analizador Local 2.0</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 p-4 md:p-6 lg:p-8">
                        <div className="container mx-auto flex flex-col lg:flex-row gap-6 items-stretch">

                            {/* Panel Izquierdo: Email Input */}
                            <div className="w-full lg:w-[380px] xl:w-[440px] flex flex-col shrink-0">
                                <div className="glass p-5 rounded-3xl shadow-sm space-y-4 flex flex-col lg:sticky lg:top-6 border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="source-email" className="text-sm font-black text-slate-700">1. Pega el correo del cliente</label>
                                        <LucideIcon name="brain" className="text-indigo-500" size={18} />
                                    </div>
                                    <p id="email-help" className="text-sm text-slate-500 leading-relaxed">Incluye el remitente, las fechas y la solicitud completa. Revisa los datos antes de guardar.</p>
                                    <textarea
                                        id="source-email"
                                        aria-describedby="email-help"
                                        disabled={isAnalyzing}
                                        className="w-full h-64 lg:h-80 p-4 bg-slate-50/50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm leading-relaxed resize-y font-medium text-slate-800"
                                        placeholder="Pega aquí el contenido del correo..."
                                        value={emailText}
                                        onChange={(e) => setEmailText(e.target.value)}
                                    ></textarea>
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span aria-live="polite">{emailText.length.toLocaleString("es-ES")} caracteres</span>
                                        <button type="button" onClick={() => setEmailText("")} disabled={isAnalyzing || !emailText} className="font-bold text-indigo-600 hover:underline disabled:opacity-40">Limpiar texto</button>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing || !emailText.trim()}
                                            className={`w-full py-3.5 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isAnalyzing ? 'bg-slate-400' : 'btn-ia'}`}
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                    <span className="text-sm">Analizando...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <LucideIcon name="cpu" className="w-5 h-5" />
                                                    <span className="text-sm uppercase tracking-widest">Analizar correo</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Panel Derecho: Formulario Estilo Ficha */}
                            <div className="flex-1 min-w-0">
                                <div className="glass rounded-3xl flex flex-col min-h-[520px] h-full shadow-sm border-slate-200 bg-white/50 backdrop-blur-xl">
                                    {!extractedData && !isAnalyzing ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-10">
                                            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                                                <LucideIcon name="clipboard-list" className="w-10 h-10 text-indigo-500" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800">2. Revisa la ficha del grupo</h3>
                                            <p className="max-w-md text-sm text-slate-500 mt-3 leading-relaxed">Pega el correo y pulsa «Analizar correo». Aquí aparecerán los datos para corregirlos y completar lo que falte.</p>
                                            <div className="grid sm:grid-cols-3 gap-3 w-full max-w-xl mt-6 text-left">
                                                {[
                                                    ["Contacto", "Cliente, agencia y email"],
                                                    ["Estancia", "Hotel, entrada y salida"],
                                                    ["Solicitud", "Personas, habitaciones y régimen"]
                                                ].map(([title, description]) => (
                                                    <div key={title} className="rounded-xl border border-slate-200 bg-white p-4">
                                                        <p className="text-sm font-bold text-slate-700">{title}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-5">La extracción no guarda el presupuesto. Revisa y confirma la ficha al terminar.</p>

                                            <div className="flex flex-wrap justify-center gap-4 mt-8">
                                                <button
                                                    onClick={() => {
                                                        const dummy = { "Nombre del Grupo": "", "Entrada": "", "Salida": "", "Pax.": "", "Habitaciones": "", "Régimen": "HD", "Hotel": "Sercotel Guadiana", "Empresa/Agencia": "", "Observaciones": "" };
                                                        applyExtractedGroups([dummy]);
                                                    }}
                                                    className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all shadow-sm"
                                                >
                                                    Ficha Manual
                                                </button>
                                                <a
                                                    href="Admin.html"
                                                    className="px-8 py-3 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-300 transition-all shadow-sm flex items-center gap-2"
                                                >
                                                    <LucideIcon name="home" size={12} />
                                                    Volver
                                                </a>
                                            </div>
                                        </div>
                                    ) : isAnalyzing ? (
                                        <div className="p-10 space-y-8 animate-pulse">
                                            <div className="flex justify-between items-center">
                                                <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
                                                <div className="h-6 w-24 bg-slate-100 rounded-full"></div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-6">
                                                <div className="h-14 bg-slate-100 rounded-xl col-span-2"></div>
                                                <div className="h-14 bg-slate-100 rounded-xl col-span-2"></div>
                                                <div className="h-14 bg-slate-100 rounded-xl"></div>
                                                <div className="h-14 bg-slate-100 rounded-xl"></div>
                                                <div className="h-14 bg-slate-100 rounded-xl"></div>
                                                <div className="h-14 bg-slate-100 rounded-xl"></div>
                                            </div>
                                            <div className="h-40 bg-slate-50 rounded-2xl w-full"></div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col h-full overflow-hidden">
                                            {/* Top Banner / Card Summary */}
                                            <div className="bg-[#1e293b] text-white p-6 shadow-inner shrink-0 hidden md:block">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                                                            <LucideIcon name="file-text" className="text-indigo-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">ID RESERVA</p>
                                                            <h3 className="text-lg font-black tracking-tight">{extractedData["Reserva"] || 'NUEVA PETICIÓN'}</h3>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entrada</p>
                                                        <p className="text-sm font-black">{extractedData["Entrada"] || '--'}</p>
                                                    </div>
                                                    <div className="text-center border-l border-slate-700 pl-8">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pax</p>
                                                        <p className="text-sm font-black text-emerald-400">{extractedData["Pax."] || '0'} Pax</p>
                                                    </div>
                                                    {(extractedData.Com_Email_Contacto || extractedData.Com_Telefono_Contacto) && (
                                                        <div className="text-left border-l border-slate-700 pl-8 max-w-[200px]">
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Contacto</p>
                                                            <p className="text-[10px] font-bold text-indigo-300 truncate">{extractedData.Com_Email_Contacto || ''}</p>
                                                            <p className="text-[10px] font-bold text-slate-300">{extractedData.Com_Telefono_Contacto || ''}</p>
                                                        </div>
                                                    )}
                                                    <div className="text-center border-l border-slate-700 pl-8">
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Estimado</p>
                                                        <p className="text-xl font-black text-amber-400 tracking-tight">{calculateTotal(extractedData).toLocaleString('es-ES')}€</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Multi-Date / Multi-Group Selector Bar */}
                                            {extractedGroups.length > 1 && (
                                                <div className="bg-indigo-50/90 border-b border-indigo-200 px-6 py-4 shrink-0">
                                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                                                                <LucideIcon name="calendar" size={16} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                                                                    {extractedGroups.length} fechas / grupos detectados en el correo
                                                                </p>
                                                                <p className="text-[11px] font-medium text-indigo-700">
                                                                    {saveMode === "unified"
                                                                        ? "Se creará 1 único presupuesto (serie) con todas las fechas, regímenes y hoteles elegidos."
                                                                        : "Se creará un presupuesto independiente por cada fecha."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <div className="inline-flex bg-white p-1 rounded-xl border border-indigo-200 shadow-sm">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSaveMode("unified")}
                                                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${saveMode === "unified" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-indigo-700"}`}
                                                                >
                                                                    1 Presupuesto (Serie)
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setSaveMode("separate")}
                                                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${saveMode === "separate" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:text-indigo-700"}`}
                                                                >
                                                                    {extractedGroups.length} Separados
                                                                </button>
                                                            </div>
                                                            {!isEditMode && (
                                                                <button
                                                                    type="button"
                                                                    onClick={handleAddAnotherDate}
                                                                    className="px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
                                                                >
                                                                    <LucideIcon name="plus" size={12} />
                                                                    Añadir fecha
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {extractedGroups.map((grp, idx) => {
                                                            const errsCount = Object.keys(getGroupErrors(grp)).length;
                                                            const isActive = idx === activeGroupIndex;
                                                            const dateLabel = grp.Entrada && grp.Salida
                                                                ? `${formatDate(grp.Entrada)} → ${formatDate(grp.Salida)}`
                                                                : (grp.Entrada ? formatDate(grp.Entrada) : 'Sin fechas');
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    onClick={() => selectGroupTab(idx)}
                                                                    className={`cursor-pointer px-3.5 py-2 rounded-xl border-2 transition-all flex items-center gap-2.5 ${
                                                                        isActive
                                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                                                            : 'bg-white border-indigo-200 text-slate-700 hover:border-indigo-400'
                                                                    }`}
                                                                >
                                                                    <span className={`w-2 h-2 rounded-full shrink-0 ${errsCount === 0 ? (isActive ? 'bg-emerald-300' : 'bg-emerald-500') : 'bg-amber-400 animate-pulse'}`}></span>
                                                                    <div className="text-left">
                                                                        <p className={`text-[10px] font-black uppercase tracking-wider leading-tight ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                                                                            Grupo {idx + 1} · {grp["Pax."] || 0} Pax
                                                                        </p>
                                                                        <p className={`text-xs font-black leading-tight mt-0.5 ${isActive ? 'text-white' : 'text-slate-800'}`}>
                                                                            {dateLabel}
                                                                        </p>
                                                                    </div>
                                                                    {extractedGroups.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => { e.stopPropagation(); handleRemoveGroup(idx); }}
                                                                            title="Eliminar esta fecha"
                                                                            className={`ml-1 p-1 rounded-lg transition-colors ${
                                                                                isActive ? 'hover:bg-white/20 text-indigo-100' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                                                                            }`}
                                                                        >
                                                                            <LucideIcon name="x" size={12} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Multi-Budget Saved Success Banner */}
                                            {saveStatus === "success" && savedBudgets.length > 1 && (
                                                <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-4 shrink-0">
                                                    <div className="flex items-center gap-2.5 mb-3">
                                                        <LucideIcon name="check-circle" size={18} className="text-emerald-600" />
                                                        <p className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                                                            ¡Se han creado {savedBudgets.length} presupuestos independientes!
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {savedBudgets.map(b => (
                                                            <a
                                                                key={b.reservaId}
                                                                href={`Presupuestos.html?id=${encodeURIComponent(b.reservaId)}&edit=1`}
                                                                className="px-3.5 py-2 bg-white border border-emerald-300 hover:bg-emerald-600 hover:text-white text-emerald-900 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                                                            >
                                                                <span className="font-black">{b.reservaId}</span>
                                                                <span className="opacity-75">({formatDate(b.entrada)} → {formatDate(b.salida)})</span>
                                                                <LucideIcon name="external-link" size={12} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Scrollable Form Area */}
                                            <div className="flex-1 overflow-y-auto py-8 px-6 md:px-10 lg:px-14">
                                                <div className="w-full max-w-4xl mx-auto space-y-10">
                                                    {/* Header row with validation badge */}
                                                    {extractionNotice && (
                                                        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed shadow-sm">
                                                            <LucideIcon name="alert-triangle" className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                            <div className="flex-1">
                                                                <p className="font-bold">Extracción Local Activada</p>
                                                                <p className="text-[11px] text-amber-800 mt-0.5">{extractionNotice}</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => setExtractionNotice(null)}
                                                                className="text-amber-500 hover:text-amber-800 font-black text-sm px-1"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h2 className="text-lg font-black text-slate-800 tracking-tight">Ficha Detallada de Extracción</h2>
                                                                {extractionMode === 'ai' && (
                                                                    <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                                                        <LucideIcon name="sparkles" size={10} />
                                                                        IA Gemini
                                                                    </span>
                                                                )}
                                                                {extractionMode === 'local' && (
                                                                    <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                                                                        <LucideIcon name="cpu" size={10} />
                                                                        Analizador Local
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-outfit">Confirma los datos para generar el presupuesto</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {!isEditMode && extractedGroups.length === 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={handleAddAnotherDate}
                                                                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                                                    title="Añadir otra fecha para crear un presupuesto adicional con los mismos datos base"
                                                                >
                                                                    <LucideIcon name="plus" size={12} />
                                                                    Añadir otra fecha
                                                                </button>
                                                            )}
                                                            {Object.keys(validation).length > 0 && (
                                                                <div className="px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3 animate-pulse">
                                                                    <LucideIcon name="alert-triangle" size={16} className="text-amber-500" />
                                                                    <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider font-outfit">{Object.keys(validation).length} pendientes</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Row: Status Selector (NEW) */}
                                                    <div className="p-5 bg-slate-50/50 rounded-[2rem] border border-slate-200 flex items-center justify-between gap-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                                                                <LucideIcon name="git-pull-request" size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado del Seguimiento</p>
                                                                <p className="text-xs font-bold text-slate-600">Define el punto actual de la negociación</p>
                                                            </div>
                                                        </div>
                                                        <select
                                                            className="bg-white border-2 border-slate-200 rounded-2xl px-6 py-3 text-xs font-black text-indigo-700 uppercase tracking-widest outline-none focus:border-indigo-500 transition-all shadow-sm"
                                                            value={extractedData["Com_Estado_Interno"]}
                                                            onChange={(e) => updateField("Com_Estado_Interno", e.target.value)}
                                                        >
                                                            <option value="PRESUPUESTO">Pendiente / Borrador</option>
                                                            <option value="ENVIADO">Propuesta Enviada</option>
                                                            <option value="SEGUIMIENTO">En Seguimiento</option>
                                                            <option value="CONFIRMADO">Confirmado (Pasa a Grupo)</option>
                                                            <option value="DESESTIMADO">Desestimado / Perdido</option>
                                                        </select>
                                                    </div>

                                                    {/* ── ROW 1: Nombre del Grupo + Hotel ─────────────────── */}
                                                    <div className="flex flex-col md:flex-row gap-4">
                                                        <div className="flex-1">
                                                            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 ${validation["Nombre del Grupo"] ? 'text-red-500' : 'text-slate-500'}`}>
                                                                Nombre del Grupo <span className="text-red-500">*</span>
                                                            </label>
                                                            <input
                                                                className={`w-full border-l-4 ${validation["Nombre del Grupo"] ? 'border-l-red-500 bg-red-50' : 'border-l-indigo-500 bg-white'} border border-slate-200 rounded-lg px-3 py-2 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 transition-all uppercase shadow-sm`}
                                                                value={extractedData["Nombre del Grupo"]}
                                                                onChange={(e) => updateField("Nombre del Grupo", e.target.value)}
                                                                placeholder="Grupo..."
                                                            />
                                                        </div>
                                                        <div className="w-full md:w-72">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Hotel</label>
                                                            <select
                                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm"
                                                                value={extractedData["Hotel"]}
                                                                onChange={(e) => updateField("Hotel", e.target.value)}
                                                            >
                                                                <option>Sercotel Guadiana</option>
                                                                <option>Cumbria Spa &amp; Hotel</option>
                                                            </select>
                                                            {!isEditMode && (
                                                                <label className="mt-2 flex items-center gap-2 cursor-pointer select-none px-2.5 py-1.5 rounded-lg border border-indigo-100 bg-indigo-50/60 hover:bg-indigo-50 transition-colors">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={includeBothHotels}
                                                                        onChange={(e) => setIncludeBothHotels(e.target.checked)}
                                                                        className="rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                                                                    />
                                                                    <span className="text-[10px] font-black text-indigo-800 uppercase tracking-wider">
                                                                        Incluir ambos hoteles (Guadiana + Cumbria)
                                                                    </span>
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* ── ROW 2: Empresa ──────────────────────────────────── */}
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Empresa / Agencia</label>
                                                        <input
                                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm"
                                                            value={extractedData["Empresa/Agencia"]}
                                                            onChange={(e) => updateField("Empresa/Agencia", e.target.value)}
                                                            placeholder="Agencia o empresa organizadora"
                                                        />
                                                    </div>

                                                    {/* ── ROW 3: Entrada | Salida | Pax | Régimen ────────── */}
                                                    <div className="flex flex-wrap md:flex-nowrap gap-4">
                                                        <div className="w-[calc(50%-0.5rem)] md:w-36">
                                                            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 ${validation["Entrada"] ? 'text-red-500' : 'text-slate-500'}`}>
                                                                Entrada <span className="text-red-500">*</span>
                                                            </label>
                                                            <input type="date"
                                                                className={`w-full border-l-4 ${validation["Entrada"] ? 'border-l-red-500 bg-red-50' : 'border-l-emerald-500 bg-white'} border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none shadow-sm`}
                                                                value={extractedData["Entrada"]}
                                                                onChange={(e) => updateField("Entrada", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="w-[calc(50%-0.5rem)] md:w-36">
                                                            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 ${validation["Salida"] ? 'text-red-500' : 'text-slate-500'}`}>
                                                                Salida <span className="text-red-500">*</span>
                                                            </label>
                                                            <input type="date"
                                                                className={`w-full border-l-4 ${validation["Salida"] ? 'border-l-red-500 bg-red-50' : 'border-l-emerald-500 bg-white'} border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none shadow-sm`}
                                                                value={extractedData["Salida"]}
                                                                onChange={(e) => updateField("Salida", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="w-[calc(30%-0.5rem)] md:w-28">
                                                            <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 ${validation["Pax."] ? 'text-red-500' : 'text-slate-500'}`}>
                                                                Pax <span className="text-red-500">*</span>
                                                            </label>
                                                            <input type="number" min="1"
                                                                className={`w-full border-l-4 ${validation["Pax."] ? 'border-l-red-500 bg-red-50' : 'border-l-indigo-500 bg-white'} border border-slate-200 rounded-lg px-3 py-2 text-sm font-black text-indigo-700 outline-none shadow-sm text-center`}
                                                                value={extractedData["Pax."]}
                                                                onChange={(e) => updateField("Pax.", e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-[200px]">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                                                <span>Régimen{selectedBoards.length > 1 ? "es a cotizar" : ""}</span>
                                                                {selectedBoards.length > 1 && (
                                                                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                        {selectedBoards.join(" + ")}
                                                                    </span>
                                                                )}
                                                            </label>
                                                            <div className="grid grid-cols-4 gap-1.5">
                                                                {[
                                                                    { code: "HA", title: "Solo Alojamiento" },
                                                                    { code: "HD", title: "Alojamiento y Desayuno" },
                                                                    { code: "MP", title: "Media Pensión" },
                                                                    { code: "PC", title: "Pensión Completa" }
                                                                ].map(b => {
                                                                    const active = selectedBoards.includes(b.code);
                                                                    return (
                                                                        <button
                                                                            key={b.code}
                                                                            type="button"
                                                                            title={b.title}
                                                                            onClick={() => toggleBoard(b.code)}
                                                                            className={`py-2 rounded-lg text-xs font-black border transition-all ${
                                                                                active
                                                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                                                    : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
                                                                            }`}
                                                                        >
                                                                            {b.code}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* ── ROW 4: Habitaciones (MANUAL STYLE) ─────────────────────────────── */}
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                                                                <LucideIcon name="bed" size={16} />
                                                            </div>
                                                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">1. Selección de Habitaciones (Bloqueo)</h3>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            {(ROOM_TYPES[extractedData.Hotel || "Sercotel Guadiana"] || []).map(type => (
                                                                <div key={type} className={`px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-3 ${(extractedData.roomCounts || {})[type] > 0 ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight truncate max-w-[120px]" title={type}>{type}</span>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={(extractedData.roomCounts || {})[type] || ''}
                                                                        onChange={e => handleRoomCountChange(type, e.target.value)}
                                                                        className="w-12 bg-white border border-slate-100 rounded-lg py-1 text-center text-xs font-black text-slate-800 outline-none focus:border-indigo-500"
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* ── ROW 4.5: Daily Config (PREMIUM STYLE) ──────────────────── */}
                                                    {Object.values(extractedData.roomCounts || {}).some(c => c > 0) && generateDates(extractedData.Entrada, extractedData.Salida).length > 0 && (
                                                        <div className="animate-slide-up space-y-8 pt-6 border-t border-slate-100">
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                                                        <LucideIcon name="euro" size={20} />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">2. Tarifas y Régimen por Noche</h3>
                                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configuración individual por tipo de habitación seleccionada</p>
                                                                    </div>
                                                                </div>
                                                                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-2">
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-4">Modo: Estancia Detallada</span>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-6">
                                                                {generateDates(extractedData.Entrada, extractedData.Salida).map(date => {
                                                                    const selectedTypes = (ROOM_TYPES[extractedData.Hotel || "Sercotel Guadiana"] || []).filter(type => (extractedData.roomCounts || {})[type] > 0);
                                                                    return (
                                                                        <div key={date} className="group bg-white rounded-3xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                                                                            <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">
                                                                                <div className="shrink-0 w-32 flex flex-col gap-1">
                                                                                    <span className="bg-slate-800 text-white px-3 py-1 rounded-lg text-[10px] font-black w-fit uppercase tracking-widest shadow-sm">{formatDate(date)}</span>
                                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mt-1">Configurar Noche</p>
                                                                                </div>

                                                                                <div className="flex-1 w-full overflow-x-auto pb-2">
                                                                                    <div className="min-w-[700px]">
                                                                                        {/* Header - Fixed Grid Template for Perfect Alignment */}
                                                                                        <div className="mb-2 px-4 grid grid-cols-[1fr_50px_90px_110px_65px_65px_100px] gap-3 items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                                            <div className="truncate">HABITACIÓN</div>
                                                                                            <div className="text-center">UDS</div>
                                                                                            <div className="text-center">PRECIO €</div>
                                                                                            <div className="text-center">RÉGIMEN</div>
                                                                                            <div className="text-center">GRAT.</div>
                                                                                            <div className="text-center">DTO. %</div>
                                                                                            <div className="text-right">SUBTOTAL</div>
                                                                                        </div>

                                                                                        <div className="space-y-1.5">
                                                                                            {selectedTypes.map(type => {
                                                                                                const config = (extractedData.dailyConfig || {})[date]?.[type] || { price: 0, board: extractedData["Régimen"] || "AD", gratuities: 0, discount: 0 };
                                                                                                const configCount = config.count !== undefined && config.count !== '' ? parseInt(config.count) : null;
                                                                                                const count = configCount !== null ? configCount : ((extractedData.roomCounts || {})[type] || 0);
                                                                                                const subtotalWithoutDiscount = (count - (parseInt(config.gratuities) || 0)) * (parseFloat(config.price) || 0);
                                                                                                const subtotal = subtotalWithoutDiscount * (1 - (parseFloat(config.discount) || 0) / 100);
                                                                                                return (
                                                                                                    <div key={type} className="grid grid-cols-[1fr_50px_90px_110px_65px_65px_100px] gap-3 items-center bg-white rounded-xl px-4 py-2 border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                                                                                        <div className="truncate pr-2">
                                                                                                            <span className="text-[11px] font-black text-slate-700 uppercase leading-none">{type}</span>
                                                                                                        </div>
                                                                                                        <div className="text-center">
                                                                                                            <input
                                                                                                                type="number"
                                                                                                                min="0"
                                                                                                                className="w-12 bg-slate-50 border border-slate-200 rounded-lg py-1 text-[11px] font-black text-center outline-none focus:bg-white focus:border-indigo-500 text-indigo-700 transition-colors shadow-sm"
                                                                                                                value={count || ''}
                                                                                                                onChange={e => handleDailyConfigChange(date, type, 'count', e.target.value)}
                                                                                                                placeholder="0"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="flex justify-center">
                                                                                                            <input
                                                                                                                type="number"
                                                                                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-black text-slate-800 text-right outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                                                                                                                value={config.price || ''}
                                                                                                                onChange={e => handleDailyConfigChange(date, type, 'price', e.target.value)}
                                                                                                                placeholder="0"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="px-1">
                                                                                                            <select
                                                                                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-600 outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                                                                                                                value={config.board || extractedData["Régimen"] || "AD"}
                                                                                                                onChange={e => handleDailyConfigChange(date, type, 'board', e.target.value)}
                                                                                                            >
                                                                                                                {BOARD_TYPES.map(b => (
                                                                                                                    <option key={b} value={b.split(' ')[0]}>{b.split(' ')[0]}</option>
                                                                                                                ))}
                                                                                                            </select>
                                                                                                        </div>
                                                                                                        <div className="flex justify-center">
                                                                                                            <input
                                                                                                                type="number"
                                                                                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 text-[10px] font-black text-center outline-none focus:bg-white focus:border-indigo-500 text-indigo-700 transition-colors"
                                                                                                                value={config.gratuities || ''}
                                                                                                                onChange={e => handleDailyConfigChange(date, type, 'gratuities', e.target.value)}
                                                                                                                placeholder="0"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="flex justify-center">
                                                                                                            <input
                                                                                                                type="number"
                                                                                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 text-[10px] font-black text-center outline-none focus:bg-white focus:border-indigo-500 text-slate-400 transition-colors"
                                                                                                                value={config.discount || ''}
                                                                                                                onChange={e => handleDailyConfigChange(date, type, 'discount', e.target.value)}
                                                                                                                placeholder="0"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="text-right">
                                                                                                            <span className="text-xs font-black text-slate-800 underline decoration-indigo-200 decoration-2 underline-offset-4">{formatNum(subtotal)}€</span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* ── ROW 5: Contacto ────────────────────────── */}
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Contacto Directo
                                                        </p>
                                                        <div className="flex flex-wrap gap-4 bg-slate-50 rounded-xl p-3 border border-slate-200 shadow-sm">
                                                            <div className="flex-1 min-w-[200px] max-w-sm">
                                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Nombre</label>
                                                                <input className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold" value={extractedData["Com_Nombre_Contacto"] || ""} onChange={(e) => updateField("Com_Nombre_Contacto", e.target.value)} />
                                                            </div>
                                                            <div className="flex-1 min-w-[200px] max-w-sm">
                                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Email</label>
                                                                <input className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold" value={extractedData["Com_Email_Contacto"] || ""} onChange={(e) => updateField("Com_Email_Contacto", e.target.value)} />
                                                            </div>
                                                            <div className="w-40">
                                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Teléfono</label>
                                                                <input className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold" value={extractedData["Com_Telefono_Contacto"] || ""} onChange={(e) => updateField("Com_Telefono_Contacto", e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* ── ROW 6: Fiscal ──────────────────────────── */}
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span> Datos de Facturación
                                                        </p>
                                                        <div className="flex flex-wrap gap-4 bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
                                                            <div className="flex-1 min-w-[200px] max-w-sm">
                                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Razón Social</label>
                                                                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold" value={extractedData["Fiscal_RazonSocial"] || ""} onChange={(e) => updateField("Fiscal_RazonSocial", e.target.value)} />
                                                            </div>
                                                            <div className="w-48">
                                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 block">CIF / NIF</label>
                                                                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold" value={extractedData["Fiscal_CIF"] || ""} onChange={(e) => updateField("Fiscal_CIF", e.target.value)} />
                                                            </div>
                                                            <div className="w-64">
                                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 block">CP / Población</label>
                                                                <input className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold" value={`${extractedData["Fiscal_CP"] || ""} ${extractedData["Fiscal_Poblacion"] || ""}`} onChange={(e) => { const parts = e.target.value.split(" "); updateField("Fiscal_CP", parts[0] || ""); updateField("Fiscal_Poblacion", parts.slice(1).join(" ") || ""); }} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* ── ROW 7: Observaciones ────────────────────────────── */}
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <LucideIcon name="file-text" size={12} /> Notas del Correo
                                                        </label>
                                                        <textarea
                                                            className="w-full bg-indigo-50/30 border border-indigo-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none h-16 resize-none leading-relaxed shadow-sm"
                                                            value={extractedData["Observaciones"] || ""}
                                                            onChange={(e) => updateField("Observaciones", e.target.value)}
                                                        ></textarea>
                                                    </div>

                                                </div>
                                            </div>

                                            {/* ── ACTION BAR (PREMIUM STYLE) ──────────────────────────────────────── */}
                                            <div className="shrink-0 border-t border-slate-100 bg-white/95 px-10 py-6 flex items-center justify-between gap-4 rounded-b-3xl">
                                                <button
                                                    onClick={() => (window.location.href = "Admin.html")}
                                                    className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 text-[10px] tracking-[0.2em] uppercase transition-all"
                                                >
                                                    CANCELAR
                                                </button>

                                                <button
                                                    onClick={handleSave}
                                                    disabled={
                                                        saveStatus === "saving" ||
                                                        extractedGroups.some(g => Object.keys(getGroupErrors(g)).length > 0)
                                                    }
                                                    className={`px-12 py-5 rounded-[2rem] font-black text-[11px] tracking-[0.1em] shadow-2xl transition-all duration-300 transform active:scale-95 ${saveStatus === "success"
                                                        ? "bg-emerald-500 text-white"
                                                        : saveStatus === "saving"
                                                            ? "bg-[#0f172a] text-white/50 cursor-wait opacity-80"
                                                            : extractedGroups.some(g => Object.keys(getGroupErrors(g)).length > 0)
                                                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none"
                                                                : "bg-[#0f172a] text-white hover:bg-[#1e293b] hover:translate-y-[-2px] hover:shadow-indigo-500/20"
                                                        }`}
                                                >
                                                    {saveStatus === "success" ? (
                                                        <div className="flex items-center gap-3">
                                                            <LucideIcon name="check-circle" size={16} />
                                                            <span>{savedBudgets.length > 1 ? `¡${savedBudgets.length} COTIZACIONES GUARDADAS!` : "¡COTIZACIÓN GUARDADA!"}</span>
                                                        </div>
                                                    ) : saveStatus === "saving" ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                            <span>PROCESANDO...</span>
                                                        </div>
                                                    ) : (
                                                        <span>
                                                            {extractedGroups.length > 1 && saveMode === "separate"
                                                                ? `CONFIRMAR Y GUARDAR LAS ${extractedGroups.length} COTIZACIONES`
                                                                : (extractedGroups.length > 1 || selectedBoards.length > 1 || includeBothHotels)
                                                                    ? "CONFIRMAR Y CREAR PRESUPUESTO COMBINADO"
                                                                    : "CONFIRMAR Y GUARDAR COTIZACIÓN"}
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        ReactDOM.createRoot(document.getElementById("root")).render(<App />);
    