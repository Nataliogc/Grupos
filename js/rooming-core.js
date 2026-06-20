/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Core Rooming List & Metrics Library
 * ═══════════════════════════════════════════════════════════
 * Shared pure functions for Rooming List stays consolidation,
 * deterministic slot mapping, daily peak calculations,
 * and pax consistency validation.
 *
 * Can be loaded:
 *   - Browser: <script src="js/rooming-core.js"></script>
 *   - Node.js: const RoomingCore = require('./js/rooming-core.js');
 * ═══════════════════════════════════════════════════════════
 */

(function (global) {
    "use strict";

    function isEffectiveEconomicItem(item) {
        return Boolean(
            item &&
            item.isEconomicItem !== false &&
            item.isEconomicRepresentation !== false &&
            item.excludeFromEconomicTotals !== true &&
            item.isManualRoomingItem !== true
        );
    }
    
    function parseAccommodationEconomicItems(jsonStr) {
        if (!jsonStr) return [];
        try {
            const parsed = JSON.parse(jsonStr);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) { return []; }
    }

    function parseEconomicExtraCharges(extraCharges) {
        if (!Array.isArray(extraCharges)) return [];
        return extraCharges.map(ec => ({
            id: ec.id || (Math.random().toString(36).substr(2, 9)),
            type: ec.concept || ec.type || "Extra",
            dateIn: ec.date || "Varias",
            qty: ec.units || ec.qty || 1,
            price: ec.unitPrice !== undefined ? ec.unitPrice : ec.price,
            total: ec.price !== undefined ? ec.price : 0,
            isService: true,
            isEconomicItem: true,
            isEconomicRepresentation: true,
            isAccommodation: false
        }));
    }

    function deduplicateEconomicItems(items) {
        const uniqueItemsMap = new Map();
        items.forEach(item => {
            if (!isEffectiveEconomicItem(item)) return;
            const id = item.id || item.sourceBudgetItemId || JSON.stringify(item);
            if (!uniqueItemsMap.has(id)) {
                uniqueItemsMap.set(id, item);
            }
        });
        return Array.from(uniqueItemsMap.values());
    }

    function getGroupEconomicItems(group) {
        if (!group) return [];
        let jsonStr = group.RoomingList_JSON;
        if (!jsonStr && group.records && group.records.length > 0) {
            const validRecord = group.records.find(r => r.RoomingList_JSON && r.RoomingList_JSON !== "[]");
            if (validRecord) jsonStr = validRecord.RoomingList_JSON;
        }
        const items = parseAccommodationEconomicItems(jsonStr);
        return deduplicateEconomicItems(items);
    }

    function classifyOperationalDepartment(item) {
        const str = String(item.type || item.concepto || item.Concepto || item.name || '').trim().toLowerCase();
        
        if (str.includes('spa')) return { department: 'SPA', subType: 'BIENESTAR' };
        if (str.includes('salón') || str.includes('salon') || str.includes('sala')) return { department: 'EVENTOS / SALAS', subType: 'MICE' };
        if (str.includes('almuerzo') || str.includes('cena') || str.includes('desayuno') || str.includes('restaurante') || str.includes('mp') || str.includes('pc') || str.includes('ad')) return { department: 'RESTAURANTE / COCINA', subType: 'F&B' };
        if (str.includes('coffee') || str.includes('pausa')) return { department: 'RESTAURANTE / EVENTOS', subType: 'F&B / MICE' };
        if (str.includes('audiovisual') || str.includes('proyector') || str.includes('pantalla') || str.includes('micro')) return { department: 'EVENTOS / MANTENIMIENTO', subType: 'AV' };
        if (str.includes('parking') || str.includes('garaje') || str.includes('aparcamiento') || str.includes('estacionamiento')) return { department: 'RECEPCIÓN', subType: 'PARKING' };
        if (str.includes('transfer') || str.includes('traslado')) return { department: 'RECEPCIÓN / TRANSPORTE', subType: 'TRANSFER' };
        
        return { department: 'DEPARTAMENTO PENDIENTE DE ASIGNAR', subType: 'UNKNOWN' };
    }

    function reconcileOperationalServices({ economicItems, existingOperationalServices }) {
        const newOps = [];
        const existingMap = new Map();
        
        (existingOperationalServices || []).forEach(op => {
            if (op.operationalServiceId) {
                existingMap.set(op.operationalServiceId, op);
            }
        });

        (economicItems || []).forEach(item => {
            if (item.isAccommodation || item.isAccommodation === "true" || item.type === "Habitación" || item.isEconomicRepresentation === false) return;
            // skip internal tracking elements
            if (item.type === "Rooming List" || item.type === "Menú MP" || item.type === "Menú PC") return;

            const classInfo = classifyOperationalDepartment(item);
            const baseId = item.id || item.sourceBudgetItemId || (item.type + "_" + item.dateIn);
            const budgetId = item.sourceBudgetId || item.budgetId || "unknown";
            const opId = `op|${budgetId}|${baseId}|${classInfo.department}`;
            
            const qty = item.qty || item.quantity || item.cantidad || item.cant || 1;
            const pax = item.pax || null;
            
            const opRep = {
                operationalServiceId: opId,
                sourceEconomicItemId: baseId,
                sourceBudgetId: budgetId,
                sourceBudgetItemId: baseId,
                department: classInfo.department,
                serviceType: classInfo.subType,
                date: item.dateIn || item.date || item.fecha || '',
                time: item.time || '',
                pax: pax,
                units: qty,
                hotel: item.hotel || item.Hotel || 'Sercotel Guadiana',
                notes: item.observ || item.observaciones || item.notas || '',
                isAutomaticOperationalService: true,
                isEconomicRepresentation: false,
                product: item.type || item.concepto || item.name || '',
            };
            
            if (existingMap.has(opId)) {
                const ex = existingMap.get(opId);
                const hasDiff = ex.units !== opRep.units || ex.date !== opRep.date || ex.product !== opRep.product;
                if (hasDiff) {
                    opRep._isModified = true;
                    opRep._oldValue = ex;
                } else {
                    opRep._isUnchanged = true;
                }
                newOps.push(opRep);
            } else {
                opRep._isNew = true;
                newOps.push(opRep);
            }
        });
        
        return newOps;
    }

    const ROOMING_CORE_VERSION = "assignments-v1";
    const MAX_ALLOWED_ROOMING_NIGHTS = 90;

    // Timezone-safe local YYYY-MM-DD string generator
    function getLocalDateString(d) {
        if (!d || isNaN(d.getTime())) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function buildValidLocalDate(y, m, d) {
        const year = parseInt(y, 10);
        const month = parseInt(m, 10);
        const day = parseInt(d, 10);
        if (!year || !month || !day) return null;
        const date = new Date(year, month - 1, day, 12, 0, 0);
        if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
        return date;
    }

    function parseDate(dStr) {
        if (!dStr) return null;
        const raw = dStr.toString().trim();
        const s = raw
            .replace(/,/g, ' ')
            .replace(/^(domingo|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+/i, '')
            .replace(/\s+/g, ' ')
            .trim();

        // Caso 1: Excel Serial (ej: 46129)
        const num = parseFloat(s);
        if (!isNaN(num) && num > 40000 && num < 60000) {
            try {
                const date = new Date(Math.round((num - 25569) * 86400 * 1000));
                if (!isNaN(date.getTime())) {
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
                }
            } catch (e) {}
        }
        // Caso 2: DD-MM-YYYY
        if (s.includes('-') && s.split('-')[0].length <= 2) {
            const parts = s.split('-');
            if (parts.length === 3) {
                let [d, m, y] = parts;
                y = parseInt(y, 10);
                if (y < 100) y += 2000;
                return buildValidLocalDate(y, m, d);
            }
        }
        // Caso 3: DD/MM/YYYY
        if (s.includes('/') && s.split('/') && s.split('/')[0].length <= 2) {
            const parts = s.split('/');
            if (parts.length === 3) {
                let [d, m, y] = parts;
                y = parseInt(y, 10);
                if (y < 100) y += 2000;
                return buildValidLocalDate(y, m, d);
            }
        }
        // Caso 4: YYYY-MM-DD
        if (s.includes('-') && s.split('-')[0].length === 4) {
            const parts = s.split(/[-T ]/);
            if (parts.length >= 3) {
                const [y, m, d] = parts;
                return buildValidLocalDate(y, m, d);
            }
        }
        // Caso 5: Text dates (e.g. 14 June 2026 / 14 Junio 2026)
        const textDate = s.match(/^(\d{1,2})\s+([a-záéíóúñ]+)\s+(\d{2,4})$/i);
        if (textDate) {
            const monthMap = {
                jan: 1, january: 1, ene: 1, enero: 1,
                feb: 2, february: 2, febrero: 2,
                mar: 3, march: 3, marzo: 3,
                apr: 4, april: 4, abr: 4, abril: 4,
                may: 5, mayo: 5,
                jun: 6, june: 6, junio: 6,
                jul: 7, july: 7, julio: 7,
                aug: 8, august: 8, ago: 8, agosto: 8,
                sep: 9, sept: 9, september: 9, septiembre: 9,
                oct: 10, october: 10, octubre: 10,
                nov: 11, november: 11, noviembre: 11,
                dec: 12, december: 12, dic: 12, diciembre: 12
            };
            let [, d, monthName, y] = textDate;
            y = parseInt(y, 10);
            if (y < 100) y += 2000;
            const m = monthMap[monthName.toLowerCase()];
            if (m) return buildValidLocalDate(y, m, d);
        }

        const fallback = new Date(s);
        if (isNaN(fallback.getTime())) return null;
        return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate(), 12, 0, 0);
    }

    function calculateRoomingNights(dateIn, dateOut) {
        const dIn = parseDate(dateIn);
        const dOut = parseDate(dateOut);
        if (!dIn || !dOut || isNaN(dIn.getTime()) || isNaN(dOut.getTime())) return 0;
        return Math.round((dOut - dIn) / 86400000);
    }

    function normalizeRoomingDate(value) {
        const date = parseDate(value);
        return date && !isNaN(date.getTime()) ? getLocalDateString(date) : '';
    }

    function formatSpanishDateString(value) {
        const date = parseDate(value);
        if (!date || isNaN(date.getTime())) return value || '';
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}/${m}/${y}`;
    }

    function normalizeText(value) {
        if (value === null || value === undefined) return '';
        return String(value).trim().replace(/\s+/g, ' ');
    }

    function normalizeRoomNumber(value) {
        if (value === null || value === undefined) return '';
        const s = String(value).trim().toUpperCase();
        if (s === '' || s === '0' || s === 'PENDIENTE' || s === 'TBD' || s === 'NULL' || s === 'UNDEFINED') return '';
        return s;
    }

    function normalizeOccupants(value) {
        if (value === null || value === undefined) return '';
        const s = String(value).trim();
        if (!s) return '';
        const names = s.split(/[\/,;\n]/)
            .map(name => name.trim().replace(/\s+/g, ' '))
            .filter(name => name.length > 0 && name.toLowerCase() !== 'ocupante pendiente');
        names.sort();
        return names.join('\n');
    }

    function normalizeRoomType(value) {
        if (value === null || value === undefined) return '';
        return String(value)
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function normalizeClassificationValue(value) {
        return normalizeRoomType(value)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function isKnownRoomType(value) {
        const normalized = normalizeClassificationValue(value);
        if (/^habit/.test(normalized) && /(^|-)(doble|dbl|dui|twin|individual|triple|tpl|cuadruple|cua|suite|apartamento|familiar)(-|$)/.test(normalized)) {
            return true;
        }
        const type = normalized
            .replace(/^(habitacion|hab|room)-/, '')
            .replace(/^habit[^-]*-/, '')
            .replace(/-(dbl|tpl|cua|dui|js1|js2|ss1|ss2)$/, '');
        if (!type) return false;
        if (/^(dui|doble-uso-individual|doble-individual|uso-individual|single)$/.test(type)) return true;
        if (/^(dbl|doble|twin|individual|triple|tpl|cuadruple|cua|suite|junior-suite|suite-superior|apartamento|familiar)$/.test(type)) return true;
        return /^(junior-)?suite(-superior)?(-[12])?$/.test(type);
    }

    function isAccommodationItem(item) {
        if (!item || typeof item !== 'object') return false;
        if (item.excludeFromOccupancy === true) return false;
        if (item.isService === true || item.isAccommodation === false) return false;
        if (item.isAccommodation === true || item.isManualRoomingItem === true || item.pendienteValoracion === true) return true;
        if (normalizeRoomNumber(item.roomNo ?? item.hab) !== '') return true;

        const category = normalizeClassificationValue(
            item.itemCategory ?? item.category ?? item.categoria ?? item.family ??
            item.familia ?? item.itemType ?? item.tipoLinea ?? item.lineType ?? ''
        );
        if (['accommodation', 'alojamiento', 'habitacion', 'room', 'lodging'].includes(category)) return true;
        if (['service', 'servicio', 'food-beverage', 'restauracion', 'sala', 'spa'].includes(category)) return false;

        const rawType = item.roomType ?? item.tipoHabitacion ?? item.type ?? item.tipo ??
            item.product ?? item.producto ?? item.concept ?? item.concepto ?? item.label ?? '';
        return isKnownRoomType(rawType);
    }

    function getCanonicalRoomType(room) {
        const rawType = room?.type ?? room?.tipo ?? room?.product ?? room?.producto;
        if (rawType == null || normalizeText(rawType) === "" || normalizeText(rawType).toLowerCase() === "tipo-desconocido") {
            return "tipo-desconocido";
        }
        return normalizeRoomType(rawType);
    }

    function getRoomSignature(room) {
        return [
            getCanonicalRoomType(room),
            Number(room?.pax || 0),
            normalizeText(room?.regime ?? room?.regimen ?? "").toLowerCase(),
            normalizeText(room?.board ?? "").toLowerCase(),
            normalizeText(room?.occupancyMode ?? "").toLowerCase()
        ].join("|");
    }

    function getRoomIdentity(room) {
        if (!room) return '';
        const normRoomNo = normalizeRoomNumber(room.roomNo);
        if (normRoomNo) return `room_${normRoomNo}`;
        const stayId = room.stayId;
        if (stayId && isValidStayIdForContinuity(stayId, room)) return `stay_${stayId}`;
        const slotId = room.slotId || room.tempRoomId;
        if (slotId && isValidSlotId(slotId, room)) return `slot_${slotId}`;
        return `anon_${room.id}`;
    }

    function naturalCompare(a, b) {
        const numA = parseInt(a, 10);
        const numB = parseInt(b, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
            if (numA !== numB) return numA - numB;
        }
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    }

    function isValidStayIdForContinuity(stayId, room) {
        if (!stayId) return false;
        const s = String(stayId).toLowerCase();
        if (room.sourceBlockId && s.includes(String(room.sourceBlockId).toLowerCase())) return false;
        if (room.assignmentKey && s.includes(String(room.assignmentKey).toLowerCase())) return false;
        if (room.id && s.includes(String(room.id).toLowerCase())) return false;
        if (s.startsWith('assign_') || s.startsWith('block_')) return false;
        return true;
    }

    function isValidSlotId(slotId, room) {
        if (!slotId) return false;
        const s = String(slotId).toLowerCase();
        if (room.sourceBlockId && s.includes(String(room.sourceBlockId).toLowerCase())) return false;
        if (room.assignmentKey && s.includes(String(room.assignmentKey).toLowerCase())) return false;
        if (room.id && s.includes(String(room.id).toLowerCase())) return false;
        if (!s.includes('slot-')) return false;
        return true;
    }

    function expandNightlyBlocks(rawRooms, checkInDate, checkOutDate) {
        rawRooms = parseRoomingListSafe(rawRooms, 'expandNightlyBlocks').filter(isAccommodationItem);
        // Step 1: Pre-calculate signatures and assign stable slot index ranges to all blocks
        const signatureBlocks = {};
        rawRooms.forEach((item, index) => {
            if (item.isService) return;
            const sig = getRoomSignature(item);
            if (!signatureBlocks[sig]) signatureBlocks[sig] = [];
            signatureBlocks[sig].push({ item, index });
        });

        const blockSlotIndicesMap = {};

        Object.keys(signatureBlocks).forEach(sig => {
            const list = signatureBlocks[sig];
            // Sort blocks of this signature by dateIn ascending
            list.sort((a, b) => {
                const dateA = parseDate(a.item.dateIn || a.item.checkIn || checkInDate) || 0;
                const dateB = parseDate(b.item.dateIn || b.item.checkIn || checkInDate) || 0;
                return dateA - dateB;
            });

            const occupiedSlotsByDate = {}; // dateString -> Set of slotIndices

            list.forEach(entry => {
                const block = entry.item;
                const qty = parseInt(block.qty) || 1;
                
                const itemDateIn = normalizeRoomingDate(block.dateIn || block.checkIn || checkInDate);
                const itemDateOut = normalizeRoomingDate(block.dateOut || block.checkOut || checkOutDate);
                const nights = calculateRoomingNights(itemDateIn, itemDateOut) || 1;
                
                // Get all dates covered by this block
                const blockDates = [];
                let currentDate = parseDate(itemDateIn);
                for (let n = 0; n < nights; n++) {
                    const nextDate = new Date(currentDate);
                    nextDate.setDate(currentDate.getDate() + 1);
                    blockDates.push(getLocalDateString(currentDate));
                    currentDate = nextDate;
                }

                // Check if this block already has valid slotIds saved in its assignments
                const preassignedSlots = [];
                let allPreassignedValid = true;
                for (let q = 0; q < qty; q++) {
                    const assignmentKey = `q${q}_n0`;
                    const legacyKey = `${q}_0`;
                    const assign = block.assignments?.[assignmentKey] || block.assignments?.[legacyKey] || {};
                    const savedSlot = assign.slotId || assign.tempRoomId || '';
                    
                    const tempRoomObj = {
                        sourceBlockId: block.id || '',
                        assignmentKey: assignmentKey,
                        id: (qty === 1 && nights === 1) ? (block.id || '') : `${block.id || ''}_q${q}_n0`
                    };
                    
                    if (savedSlot && isValidSlotId(savedSlot, tempRoomObj)) {
                        const match = savedSlot.match(/slot-(\d+)$/);
                        if (match) {
                            preassignedSlots.push(parseInt(match[1], 10));
                        } else {
                            allPreassignedValid = false;
                            break;
                        }
                    } else {
                        allPreassignedValid = false;
                        break;
                    }
                }

                let blockSlotIndices = [];
                if (allPreassignedValid && preassignedSlots.length === qty) {
                    blockSlotIndices = preassignedSlots;
                } else {
                    let candidateSlot = 0;
                    while (blockSlotIndices.length < qty) {
                        let isFree = true;
                        for (const dStr of blockDates) {
                            if (occupiedSlotsByDate[dStr] && occupiedSlotsByDate[dStr].has(candidateSlot)) {
                                isFree = false;
                                break;
                            }
                        }
                        if (isFree) {
                            blockSlotIndices.push(candidateSlot);
                        }
                        candidateSlot++;
                    }
                }

                // Mark as occupied
                blockDates.forEach(dStr => {
                    if (!occupiedSlotsByDate[dStr]) occupiedSlotsByDate[dStr] = new Set();
                    blockSlotIndices.forEach(sIdx => {
                        occupiedSlotsByDate[dStr].add(sIdx);
                    });
                });

                blockSlotIndicesMap[entry.index] = blockSlotIndices;
            });
        });

        const flatRooms = [];
        rawRooms.forEach((item, index) => {
            const rawType = item.type || item.tipo || item.product || item.producto;
            const displayType = rawType && rawType.trim() !== "" ? rawType : "tipo-desconocido";
            const rTypeCanonical = getCanonicalRoomType(item);
            const qty = parseInt(item.qty) || 1;
            const paxVal = parseInt(item.pax) || (rTypeCanonical.toUpperCase().includes('IND') || rTypeCanonical.toUpperCase().includes('DUI') || rTypeCanonical.toUpperCase().includes('USO INDIVIDUAL') ? 1 : 2);
            
            const itemDateIn = normalizeRoomingDate(item.dateIn || item.checkIn || checkInDate);
            const itemDateOut = normalizeRoomingDate(item.dateOut || item.checkOut || checkOutDate);
            const nights = calculateRoomingNights(itemDateIn, itemDateOut) || 1;

            const itemPrice = parseFloat(item.price) || 0;
            const itemTotal = parseFloat(item.total) || 0;
            const unitPrice = itemPrice > 0 ? itemPrice : (nights > 0 && qty > 0 ? itemTotal / qty / nights : 0);
            
            const baseId = item.id || ('block_' + index + '_' + Date.now() + '_' + Math.random());
            
            let originalIds = [];
            if (item.originalIds && Array.isArray(item.originalIds)) {
                originalIds = [...item.originalIds];
            } else if (item.id && String(item.id).includes(',')) {
                originalIds = String(item.id).split(',').map(x => x.trim()).filter(Boolean);
            } else {
                originalIds = [baseId];
            }

            const nightsList = [];
            let currentDate = parseDate(itemDateIn);
            for (let n = 0; n < nights; n++) {
                const nextDate = new Date(currentDate);
                nextDate.setDate(currentDate.getDate() + 1);
                nightsList.push({
                    dateIn: getLocalDateString(currentDate),
                    dateOut: getLocalDateString(nextDate)
                });
                currentDate = nextDate;
            }

            const slotIndices = blockSlotIndicesMap[index] || [];

            for (let q = 0; q < qty; q++) {
                nightsList.forEach((night, nIdx) => {
                    const subId = (qty === 1 && nights === 1) ? baseId : `${baseId}_q${q}_n${nIdx}`;
                    const nightOriginalId = originalIds[nIdx] || `${baseId}_q${q}_n${nIdx}`;
                    
                    let unitComision = null;
                    if (item.comision) {
                        unitComision = { ...item.comision };
                        if (item.comision.total_comision !== undefined) {
                            unitComision.total_comision = parseFloat(item.comision.total_comision) / qty / nights;
                        }
                        if (item.comision.comision_unitaria !== undefined) {
                            unitComision.comision_unitaria = parseFloat(item.comision.comision_unitaria);
                        }
                    }

                    // Look up assignments format "q0_n0"
                    const assignmentKey = `q${q}_n${nIdx}`;
                    const legacyKey = `${q}_${nIdx}`;
                    const assign = item.assignments?.[assignmentKey] || item.assignments?.[legacyKey] || {};

                    const assignId = assign.assignmentId || '';
                    let stayId = assign.stayId || '';
                    let slotId = assign.slotId || assign.tempRoomId || '';
                    let tempRoomId = assign.tempRoomId || assign.slotId || '';

                    const tempRoomObj = {
                        sourceBlockId: baseId,
                        assignmentKey: assignmentKey,
                        id: subId
                    };

                    if (stayId && !isValidStayIdForContinuity(stayId, tempRoomObj)) {
                        stayId = '';
                    }
                    if (slotId && !isValidSlotId(slotId, tempRoomObj)) {
                        slotId = '';
                        tempRoomId = '';
                    }

                    if (!slotId) {
                        const defaultSlotIndex = slotIndices[q] !== undefined ? slotIndices[q] : q;
                        slotId = `${getRoomSignature(item)}|slot-${defaultSlotIndex}`;
                        tempRoomId = slotId;
                    }

                    // Legacy root properties fallback (only if qty === 1, or if assignments is empty)
                    const fallbackRoomNo = qty === 1 ? String(item.roomNo || item.hab || '') : '';
                    const fallbackOcupantes = qty === 1 ? String(item.ocupantes || item.occupants || '') : '';
                    const fallbackDni = qty === 1 ? String(item.dni || '') : '';
                    const fallbackObserv = qty === 1 ? String(item.observ || item.observaciones || item.observations || '') : '';

                    let roomNo = assign.roomNo !== undefined ? assign.roomNo : fallbackRoomNo;
                    let ocupantes = assign.ocupantes !== undefined ? assign.ocupantes : (assign.occupants !== undefined ? assign.occupants : fallbackOcupantes);
                    let dni = assign.dni !== undefined ? assign.dni : fallbackDni;
                    let observ = assign.observ !== undefined ? assign.observ : (assign.observations !== undefined ? assign.observations : fallbackObserv);

                    if (Array.isArray(ocupantes)) ocupantes = ocupantes.join('\n');
                    if (Array.isArray(dni)) dni = dni.join(';');

                    flatRooms.push({
                        id: subId,
                        originalId: nightOriginalId,
                        sourceBlockId: baseId,
                        qtyIndex: q,
                        assignmentKey: assignmentKey,
                        assignmentId: assignId,
                        stayId: stayId,
                        slotId: slotId,
                        tempRoomId: tempRoomId,
                        roomNo: String(roomNo).trim(),
                        type: displayType,
                        pax: paxVal,
                        checkIn: night.dateIn,
                        checkOut: night.dateOut,
                        dateIn: night.dateIn,
                        dateOut: night.dateOut,
                        ocupantes: String(ocupantes).trim(),
                        dni: dni,
                        observ: String(observ).trim(),
                        price: unitPrice,
                        iva: parseInt(item.iva) || 10,
                        nights: 1,
                        total: unitPrice,
                        comision: unitComision,
                        pendienteValoracion: !!item.pendienteValoracion,
                        isManualRoomingItem: !!item.isManualRoomingItem,
                        excludeFromEconomicTotals: !!item.excludeFromEconomicTotals,
                        regime: item.regime || item.regimen || '',
                        board: item.board || '',
                        occupancyMode: item.occupancyMode || '',
                        hotel: item.hotel || '',
                        producto: item.producto || item.product || ''
                    });
                });
            }
        });
        if (typeof console !== 'undefined' && typeof console.table === 'function') {
            const doblesOnly = flatRooms.filter(room => getCanonicalRoomType(room).includes('DOBLE') && !getCanonicalRoomType(room).includes('USO INDIVIDUAL'));
            console.table(doblesOnly.map(room => ({
                sourceBlockId: room.sourceBlockId,
                assignmentKey: room.assignmentKey,
                dateIn: room.dateIn,
                dateOut: room.dateOut,
                type: room.type,
                pax: room.pax,
                qtyIndex: room.qtyIndex,
                stayId: room.stayId,
                slotId: room.slotId,
                tempRoomId: room.tempRoomId,
                roomIdentity: getRoomIdentity(room),
                signature: getRoomSignature(room)
            })));
        }
        return flatRooms;
    }

    function buildConsolidatedRoomStays(flatRooms) {
        flatRooms = parseRoomingListSafe(flatRooms, 'buildConsolidatedRoomStays').filter(isAccommodationItem);
        const signatureGroups = {};
        flatRooms.forEach(room => {
            const sig = getRoomSignature(room);
            if (!signatureGroups[sig]) signatureGroups[sig] = [];
            signatureGroups[sig].push(room);
        });

        Object.entries(signatureGroups).forEach(([sig, rooms]) => {
            const dates = Array.from(new Set(rooms.map(r => r.checkIn))).sort();
            
            // Find all unique physical room numbers in this group
            const uniquePhysicalRooms = Array.from(
                new Set(rooms.map(r => normalizeRoomNumber(r.roomNo)).filter(Boolean))
            ).sort(naturalCompare);

            // Find all unique slotIds in this group
            const uniqueSlotIds = Array.from(
                new Set(rooms.map(r => r.slotId || r.tempRoomId).filter(Boolean))
            ).sort();

            const slots = [];
            const physicalRoomSlots = {};
            const slotIdSlots = {};

            uniquePhysicalRooms.forEach((rNo, idx) => {
                physicalRoomSlots[rNo] = idx;
                slots.push([]);
            });

            uniqueSlotIds.forEach(sId => {
                let targetIdx = -1;
                const roomsWithThisSlotId = rooms.filter(r => (r.slotId || r.tempRoomId) === sId);
                for (const r of roomsWithThisSlotId) {
                    const normRoomNo = normalizeRoomNumber(r.roomNo);
                    if (normRoomNo && physicalRoomSlots[normRoomNo] !== undefined) {
                        targetIdx = physicalRoomSlots[normRoomNo];
                        break;
                    }
                }

                if (targetIdx === -1) {
                    slots.push([]);
                    targetIdx = slots.length - 1;
                }
                slotIdSlots[sId] = targetIdx;
            });

            dates.forEach(date => {
                const roomsOnDate = rooms.filter(r => r.checkIn === date);
                const unmatchedRooms = [...roomsOnDate];
                const assignedSlotsThisDate = new Set();

                // Priority 1: Match by physical room number (multiple rooms on the same date allowed in the same slot)
                for (let i = unmatchedRooms.length - 1; i >= 0; i--) {
                    const r = unmatchedRooms[i];
                    const normRoomNo = normalizeRoomNumber(r.roomNo);
                    if (normRoomNo) {
                        const targetSlotIdx = physicalRoomSlots[normRoomNo];
                        if (targetSlotIdx !== undefined) {
                            slots[targetSlotIdx].push(r);
                            assignedSlotsThisDate.add(targetSlotIdx);
                            unmatchedRooms.splice(i, 1);
                        }
                    }
                }

                // Priority 2: Match by stayId (no duplicates on same date allowed)
                for (let i = unmatchedRooms.length - 1; i >= 0; i--) {
                    const r = unmatchedRooms[i];
                    if (r.stayId) {
                        let foundSlotIdx = -1;
                        for (let sIdx = 0; sIdx < slots.length; sIdx++) {
                            if (assignedSlotsThisDate.has(sIdx)) continue;
                            if (slots[sIdx].some(sr => sr.stayId === r.stayId)) {
                                foundSlotIdx = sIdx;
                                break;
                            }
                        }
                        if (foundSlotIdx !== -1) {
                            slots[foundSlotIdx].push(r);
                            assignedSlotsThisDate.add(foundSlotIdx);
                            unmatchedRooms.splice(i, 1);
                        }
                    }
                }

                // Priority 3: Match by tempRoomId or slotId (no duplicates on same date allowed)
                for (let i = unmatchedRooms.length - 1; i >= 0; i--) {
                    const r = unmatchedRooms[i];
                    const targetId = r.tempRoomId || r.slotId;
                    if (targetId) {
                        const targetSlotIdx = slotIdSlots[targetId];
                        if (targetSlotIdx !== undefined && !assignedSlotsThisDate.has(targetSlotIdx)) {
                            slots[targetSlotIdx].push(r);
                            assignedSlotsThisDate.add(targetSlotIdx);
                            unmatchedRooms.splice(i, 1);
                        }
                    }
                }

                // Priority 4: Match by occupants (no duplicates on same date allowed)
                for (let i = unmatchedRooms.length - 1; i >= 0; i--) {
                    const r = unmatchedRooms[i];
                    const normOcc = normalizeOccupants(r.ocupantes);
                    if (normOcc && normOcc !== "OCUPANTE PENDIENTE" && normOcc !== "CHOFER / GUÍA") {
                        let foundSlotIdx = -1;
                        for (let sIdx = 0; sIdx < slots.length; sIdx++) {
                            if (assignedSlotsThisDate.has(sIdx)) continue;
                            if (slots[sIdx].some(sr => normalizeOccupants(sr.ocupantes) === normOcc)) {
                                foundSlotIdx = sIdx;
                                break;
                            }
                        }
                        if (foundSlotIdx !== -1) {
                            slots[foundSlotIdx].push(r);
                            assignedSlotsThisDate.add(foundSlotIdx);
                            unmatchedRooms.splice(i, 1);
                        }
                    }
                }

                // Priority 5: Chronological slot index / position as last resort
                for (let i = unmatchedRooms.length - 1; i >= 0; i--) {
                    const r = unmatchedRooms[i];
                    const isUnknown = getCanonicalRoomType(r) === "tipo-desconocido";
                    let foundSlotIdx = -1;
                    
                    if (!isUnknown) {
                        for (let sIdx = 0; sIdx < slots.length; sIdx++) {
                            if (assignedSlotsThisDate.has(sIdx)) continue;
                            foundSlotIdx = sIdx;
                            break;
                        }
                    }
                    
                    if (foundSlotIdx !== -1) {
                        slots[foundSlotIdx].push(r);
                        assignedSlotsThisDate.add(foundSlotIdx);
                        unmatchedRooms.splice(i, 1);
                    } else {
                        // Create a new slot
                        slots.push([r]);
                        assignedSlotsThisDate.add(slots.length - 1);
                        unmatchedRooms.splice(i, 1);
                    }
                }
            });

            // Assign tempRoomId and slotId
            slots.forEach((slotRooms, sIdx) => {
                const tempId = `${sig}|slot-${sIdx}`;
                slotRooms.forEach(r => {
                    r.tempRoomId = tempId;
                    r.slotId = tempId;
                });
            });
        });

        const groups = {};
        flatRooms.forEach(room => {
            if (!groups[room.tempRoomId]) groups[room.tempRoomId] = [];
            groups[room.tempRoomId].push(room);
        });

        const mergedRooms = [];
        Object.values(groups).forEach(rooms => {
            rooms.sort((a, b) => (parseDate(a.checkIn) || 0) - (parseDate(b.checkIn) || 0));
            const merged = [];
            rooms.forEach(current => {
                if (merged.length === 0) {
                    merged.push({
                        ...current,
                        originalIds: [current.originalId],
                        assignmentRefs: [{ blockId: current.sourceBlockId, assignmentKey: current.assignmentKey }],
                        consolidatedId: 'rooming_consolidated_' + Math.random().toString(36).substring(2, 9),
                        displayNights: current.nights,
                        displayTotal: parseFloat(current.total || 0),
                        _constituentRooms: [current]
                    });
                } else {
                    const last = merged[merged.length - 1];
                    const sameOcc = normalizeOccupants(last.ocupantes) === normalizeOccupants(current.ocupantes);
                    const sameObs = normalizeText(last.observ) === normalizeText(current.observ);
                    const lastOutVal = parseDate(last.checkOut);
                    const curInVal = parseDate(current.checkIn);
                    const isConsecutive = last.checkOut === current.checkIn;
                    const isOverlap = lastOutVal && curInVal && lastOutVal > curInVal;

                    if (isConsecutive && sameOcc && sameObs) {
                        last.dateOut = current.dateOut;
                        last.checkOut = current.dateOut;
                        last.nights = calculateRoomingNights(last.dateIn, last.dateOut);
                        last.displayNights = last.nights;
                        last.displayTotal = (parseFloat(last.displayTotal || 0) + parseFloat(current.total || 0));
                        last.originalIds.push(current.originalId);
                        last.assignmentRefs.push({ blockId: current.sourceBlockId, assignmentKey: current.assignmentKey });
                        last.pendienteValoracion = last.pendienteValoracion || current.pendienteValoracion;
                        if (!last.roomNo && current.roomNo) last.roomNo = current.roomNo;
                        last._constituentRooms.push(current);
                    } else if (isOverlap) {
                        const isExactDuplicate = last.checkIn === current.checkIn && last.checkOut === current.checkOut && last.type === current.type && last.pax === current.pax && sameOcc && sameObs && normalizeRoomNumber(last.roomNo) === normalizeRoomNumber(current.roomNo);
                        if (isExactDuplicate) {
                            last.originalIds.push(current.originalId);
                            last.assignmentRefs.push({ blockId: current.sourceBlockId, assignmentKey: current.assignmentKey });
                            last._constituentRooms.push(current);
                        } else {
                            const incidencesHost = (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? (global.window || global) : {}));
                            incidencesHost.roomingIncidences.push({
                                room: last.roomNo || last.tempRoomId,
                                dateIn: current.dateIn,
                                dateOut: last.dateOut,
                                occupants: `Ocupante 1: ${last.ocupantes || 'Pendiente'} | Ocupante 2: ${current.ocupantes || 'Pendiente'}`,
                                type: last.type,
                                assignmentRefs: [{ blockId: last.sourceBlockId, assignmentKey: last.assignmentKey }, { blockId: current.sourceBlockId, assignmentKey: current.assignmentKey }]
                            });
                            merged.push({
                                ...current,
                                originalIds: [current.originalId],
                                assignmentRefs: [{ blockId: current.sourceBlockId, assignmentKey: current.assignmentKey }],
                                consolidatedId: 'rooming_consolidated_' + Math.random().toString(36).substring(2, 9),
                                displayNights: current.nights,
                                displayTotal: parseFloat(current.total || 0),
                                _constituentRooms: [current]
                            });
                        }
                    } else {
                        merged.push({
                            ...current,
                            originalIds: [current.originalId],
                            assignmentRefs: [{ blockId: current.sourceBlockId, assignmentKey: current.assignmentKey }],
                            consolidatedId: 'rooming_consolidated_' + Math.random().toString(36).substring(2, 9),
                            displayNights: current.nights,
                            displayTotal: parseFloat(current.total || 0),
                            _constituentRooms: [current]
                        });
                    }
                }
            });

            // Assign stayIds and propagate back to constituent nightly assignments
            merged.forEach(stay => {
                let existingStayId = '';
                for (const r of stay._constituentRooms) {
                    if (r.stayId) {
                        existingStayId = r.stayId;
                        break;
                    }
                }
                const sig = getRoomSignature(stay);
                const finalStayId = existingStayId || `stay_${sig.replace(/[^a-zA-Z0-9|]/g, '').toLowerCase().replace(/\|/g, '_')}_${Math.random().toString(36).substring(2, 9)}`;
                
                stay.stayId = finalStayId;
                stay._constituentRooms.forEach(r => {
                    r.stayId = finalStayId;
                });
                
                delete stay._constituentRooms;
            });

            merged.forEach(item => { item.displayTotal = parseFloat(item.displayTotal.toFixed(2)); });
            mergedRooms.push(...merged);
        });

        mergedRooms.sort((a, b) => {
            const hasNumA = !!normalizeRoomNumber(a.roomNo);
            const hasNumB = !!normalizeRoomNumber(b.roomNo);
            if (hasNumA && !hasNumB) return -1;
            if (!hasNumA && hasNumB) return 1;
            if (hasNumA && hasNumB) return naturalCompare(a.roomNo, b.roomNo);
            const sigA = getRoomSignature(a);
            const sigB = getRoomSignature(b);
            if (sigA !== sigB) return sigA.localeCompare(sigB);
            return a.tempRoomId.localeCompare(b.tempRoomId);
        });
        if (typeof console !== 'undefined' && typeof console.table === 'function') {
            const doblesOnly = mergedRooms.filter(room => getCanonicalRoomType(room).includes('DOBLE') && !getCanonicalRoomType(room).includes('USO INDIVIDUAL'));
            console.table(doblesOnly.map(room => ({
                sourceBlockId: room.sourceBlockId,
                assignmentKey: room.assignmentKey,
                dateIn: room.dateIn,
                dateOut: room.dateOut,
                type: room.type,
                pax: room.pax,
                qtyIndex: room.qtyIndex,
                stayId: room.stayId,
                slotId: room.slotId,
                tempRoomId: room.tempRoomId,
                roomIdentity: getRoomIdentity(room),
                signature: getRoomSignature(room)
            })));
        }
        return mergedRooms;
    }

    function calculateDailyOccupancy(blocks) {
        blocks = parseRoomingListSafe(blocks, 'calculateDailyOccupancy').filter(isAccommodationItem);
        const dailyCounts = {};
        blocks.forEach(item => {
            const start = parseDate(item.dateIn || item.checkIn || item.Entrada);
            const end = parseDate(item.dateOut || item.checkOut || item.Salida);
            if (!start || !end) return;
            
            const rType = (item.type || 'Habitación').toLowerCase();
            let canonicalType = 'Doble';
            if (rType.includes('ind') || rType.includes('dui') || rType.includes('uso individual')) {
                canonicalType = 'Individual';
            } else if (rType.includes('tri')) {
                canonicalType = 'Triple';
            } else if (rType.includes('cua')) {
                canonicalType = 'Cuádruple';
            }

            const paxVal = parseInt(item.pax || item["Pax."] || 0);
            const qtyVal = parseInt(item.qty || item["Cant. Habitaciones"] || item["Cant."] || item["Hab."] || 1);
            const nights = calculateRoomingNights(start, end) || 1;
            for (let dayOffset = 0; dayOffset < nights; dayOffset++) {
                const cur = new Date(start);
                cur.setDate(start.getDate() + dayOffset);
                const iso = getLocalDateString(cur);
                if (!dailyCounts[iso]) {
                    dailyCounts[iso] = { total: 0, totalPax: 0, byType: {} };
                }
                dailyCounts[iso].total += qtyVal;
                dailyCounts[iso].totalPax += (paxVal * qtyVal);
                dailyCounts[iso].byType[canonicalType] = (dailyCounts[iso].byType[canonicalType] || 0) + qtyVal;
            }
        });
        return dailyCounts;
    }

    function groupAndMergeRoomingList(rawList, checkInDate, checkOutDate) {
        const parsedItems = parseRoomingListSafe(rawList, 'groupAndMergeRoomingList');
        const rawRooms = parsedItems.filter(isAccommodationItem);
        const services = parsedItems.filter(item => !isAccommodationItem(item));
        const incidencesHost = (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? (global.window || global) : {}));
        incidencesHost.roomingIncidences = [];
        const originalNightlyBlocks = rawRooms;
        const expandedNightlyRooms = expandNightlyBlocks(originalNightlyBlocks, checkInDate, checkOutDate);
        const consolidatedStays = buildConsolidatedRoomStays(expandedNightlyRooms);
        return [...consolidatedStays, ...services];
    }

    function calculateMaxDailyOccupancy(list) {
        list = parseRoomingListSafe(list, 'calculateMaxDailyOccupancy').filter(isAccommodationItem);
        const dailyPax = {};
        list.forEach(i => {
            const start = parseDate(i.dateIn || i.checkIn || i.Entrada);
            const end = parseDate(i.dateOut || i.checkOut || i.Salida);
            if (!start || !end) return;
            const paxVal = parseInt(i.pax || i["Pax."] || 0);
            const qtyVal = parseInt(i.qty || i["Cant. Habitaciones"] || i["Cant."] || i["Hab."] || 1);
            const nights = calculateRoomingNights(start, end) || 1;
            for (let dayOffset = 0; dayOffset < nights; dayOffset++) {
                const cur = new Date(start);
                cur.setDate(start.getDate() + dayOffset);
                const iso = getLocalDateString(cur);
                if (!dailyPax[iso]) dailyPax[iso] = 0;
                dailyPax[iso] += (paxVal * qtyVal);
            }
        });
        const values = Object.values(dailyPax);
        return values.length > 0 ? Math.max(...values) : 0;
    }

    function calculateMaxDailyRooms(list) {
        list = parseRoomingListSafe(list, 'calculateMaxDailyRooms').filter(isAccommodationItem);
        const dailyRooms = {};
        list.forEach(i => {
            const start = parseDate(i.dateIn || i.checkIn || i.Entrada);
            const end = parseDate(i.dateOut || i.checkOut || i.Salida);
            if (!start || !end) return;
            const qtyVal = parseInt(i.qty || i["Cant. Habitaciones"] || i["Cant."] || i["Hab."] || 1);
            const nights = calculateRoomingNights(start, end) || 1;
            for (let dayOffset = 0; dayOffset < nights; dayOffset++) {
                const cur = new Date(start);
                cur.setDate(start.getDate() + dayOffset);
                const iso = getLocalDateString(cur);
                if (!dailyRooms[iso]) dailyRooms[iso] = 0;
                dailyRooms[iso] += qtyVal;
            }
        });
        const values = Object.values(dailyRooms);
        return values.length > 0 ? Math.max(...values) : 0;
    }

    function calculatePersonNights(list) {
        list = parseRoomingListSafe(list, 'calculatePersonNights').filter(isAccommodationItem);
        return list.reduce((sum, i) => {
            const start = parseDate(i.dateIn || i.checkIn || i.Entrada);
            const end = parseDate(i.dateOut || i.checkOut || i.Salida);
            if (!start || !end) return sum;
            const paxVal = parseInt(i.pax || i["Pax."] || 0);
            const qtyVal = parseInt(i.qty || i["Cant. Habitaciones"] || i["Cant."] || i["Hab."] || 1);
            const nights = calculateRoomingNights(start, end) || 1;
            return sum + (paxVal * qtyVal * nights);
        }, 0);
    }

    function calculateRoomNights(list) {
        list = parseRoomingListSafe(list, 'calculateRoomNights').filter(isAccommodationItem);
        return list.reduce((sum, i) => {
            const start = parseDate(i.dateIn || i.checkIn || i.Entrada);
            const end = parseDate(i.dateOut || i.checkOut || i.Salida);
            if (!start || !end) return sum;
            const qtyVal = parseInt(i.qty || i["Cant. Habitaciones"] || i["Cant."] || i["Hab."] || 1);
            const nights = calculateRoomingNights(start, end) || 1;
            return sum + (qtyVal * nights);
        }, 0);
    }

    function calculateDailyMovements(value) {
        const accommodationItems = parseRoomingListSafe(value, 'calculateDailyMovements').filter(isAccommodationItem);
        if (accommodationItems.length === 0) return {};

        const minDate = accommodationItems
            .map(item => parseDate(item.dateIn || item.checkIn || item.Entrada))
            .filter(Boolean)
            .sort((a, b) => a - b)[0];
        const maxDate = accommodationItems
            .map(item => parseDate(item.dateOut || item.checkOut || item.Salida))
            .filter(Boolean)
            .sort((a, b) => b - a)[0];
        if (!minDate || !maxDate || maxDate < minDate) return {};

        const consolidatedStays = groupAndMergeRoomingList(
            accommodationItems,
            getLocalDateString(minDate),
            getLocalDateString(maxDate)
        ).filter(isAccommodationItem);
        const movements = {};
        const ensureDay = date => {
            if (!movements[date]) {
                movements[date] = {
                    arrivals: { pax: 0, rooms: 0 },
                    departures: { pax: 0, rooms: 0 },
                    overnight: { pax: 0, rooms: 0 },
                    breakfast: { pax: 0, rooms: 0 }
                };
            }
            return movements[date];
        };

        for (let cursor = new Date(minDate); cursor <= maxDate; cursor.setDate(cursor.getDate() + 1)) {
            ensureDay(getLocalDateString(cursor));
        }

        consolidatedStays.forEach(stay => {
            const dateIn = normalizeRoomingDate(stay.dateIn || stay.checkIn);
            const dateOut = normalizeRoomingDate(stay.dateOut || stay.checkOut);
            const pax = parsePositiveNumber(stay.pax || stay['Pax.']);
            if (!dateIn || !dateOut) return;

            ensureDay(dateIn).arrivals.pax += pax;
            ensureDay(dateIn).arrivals.rooms += 1;
            ensureDay(dateOut).departures.pax += pax;
            ensureDay(dateOut).departures.rooms += 1;

            const start = parseDate(dateIn);
            const end = parseDate(dateOut);
            for (let night = new Date(start); night < end; night.setDate(night.getDate() + 1)) {
                const nightDate = getLocalDateString(night);
                ensureDay(nightDate).overnight.pax += pax;
                ensureDay(nightDate).overnight.rooms += 1;
            }
        });

        Object.keys(movements).forEach(date => {
            const current = parseDate(date);
            current.setDate(current.getDate() - 1);
            const previousNight = movements[getLocalDateString(current)]?.overnight || { pax: 0, rooms: 0 };
            movements[date].breakfast = { ...previousNight };
        });

        return movements;
    }

    function parsePositiveNumber(value) {
        const parsed = parseInt(value, 10);
        return (Number.isFinite(parsed) && parsed > 0) ? parsed : 0;
    }

    function isStoredPaxConsistent(storedPax, maxDailyOccupancy, personNights) {
        if (!Number.isFinite(storedPax) || storedPax <= 0) return false;
        if (storedPax === personNights && personNights > maxDailyOccupancy) return false;
        return storedPax === maxDailyOccupancy;
    }

    function parseRoomingListSafe(value, context = "") {
        let list = [];
        if (Array.isArray(value)) {
            list = value;
        } else if (typeof value === "string") {
            const trimmed = value.trim();

            if (!trimmed) {
                return [];
            }

            try {
                const parsed = JSON.parse(trimmed);

                if (Array.isArray(parsed)) {
                    list = parsed;
                } else {
                    console.warn(
                        "[ROOMING CORE] RoomingList_JSON no contiene un array",
                        {
                            context,
                            parsed
                        }
                    );
                    return [];
                }
            } catch (error) {
                console.error(
                    "[ROOMING CORE] RoomingList_JSON inválido",
                    {
                        context,
                        value,
                        error
                    }
                );
                return [];
            }
        } else {
            return [];
        }

        // Clean up legacy/defective sequential room numbers saved due to the autoIdx bug
        list.forEach(item => {
            if (item && !item.isService && (item.source === 'auto_rooming' || item.generatedFrom === 'rooming_editor' || item.generatedFrom === 'rooming_ai')) {
                const rNo = String(item.roomNo || '').trim();
                if (/^\d+$/.test(rNo)) {
                    const rNum = parseInt(rNo, 10);
                    if (rNum >= 1 && rNum <= 99) {
                        const occ = String(item.ocupantes || '').trim().toLowerCase();
                        if (occ === '' || occ === 'ocupante pendiente' || occ === 'pendiente') {
                            item.roomNo = '';
                        }
                    }
                }
            }
        });

        return list;
    }

    function getEconomicRoomingItems(value, context = "") {
        return parseRoomingListSafe(value, context).filter(isEffectiveEconomicItem);
    }

    function getAccommodationItems(value, context = "") {
        return parseRoomingListSafe(value, context).filter(isAccommodationItem);
    }

    function getServiceItems(value, context = "") {
        return parseRoomingListSafe(value, context).filter(item => item && !isAccommodationItem(item));
    }

    function reconcileEconomicItems({ extraCharges, existingEconomicItems, hotelName }) {
        const addedItems = [];
        const existingIds = new Set();
        (existingEconomicItems || []).forEach(item => {
            if (item.id) existingIds.add(item.id);
            if (item.sourceBudgetItemId) existingIds.add(item.sourceBudgetItemId);
        });
        (extraCharges || []).forEach(ec => {
            if (!existingIds.has(ec.id)) {
                addedItems.push({
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
                    hotel: hotelName || ""
                });
            }
        });
        return { addedItems };
    }

    const RoomingCore = {
        ROOMING_CORE_VERSION,
        parseDate,
        buildValidLocalDate,
        getLocalDateString,
        calculateRoomingNights,
        normalizeRoomingDate,
        formatSpanishDateString,
        normalizeText,
        normalizeRoomNumber,
        normalizeOccupants,
        normalizeRoomType,
        isKnownRoomType,
        isAccommodationItem,
        getCanonicalRoomType,
        getRoomSignature,
        naturalCompare,
        expandNightlyBlocks,
        buildConsolidatedRoomStays,
        groupAndMergeRoomingList,
        calculateMaxDailyOccupancy,
        calculateMaxDailyRooms,
        calculatePersonNights,
        calculateRoomNights,
        calculateDailyMovements,
        parsePositiveNumber,
        isStoredPaxConsistent,
        parseRoomingListSafe,
        getEconomicRoomingItems,
        getAccommodationItems,
        getServiceItems,
        calculateDailyOccupancy,
        isValidStayIdForContinuity,
        isValidSlotId,
        getGroupEconomicItems,
        reconcileEconomicItems,
        classifyOperationalDepartment,
        reconcileOperationalServices
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = RoomingCore;
    } else {
        // Expose individually on global scope for inline script compatibility
        Object.keys(RoomingCore).forEach(key => {
            global[key] = RoomingCore[key];
        });
        global.RoomingCore = RoomingCore;
        console.log("[ROOMING] Core cargado:", RoomingCore.ROOMING_CORE_VERSION);
    }

})(typeof window !== 'undefined' ? window : global);
