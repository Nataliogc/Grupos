
// --- Script Block 1 ---
// Configure PDF.js worker URL
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// --- Script Block 2 ---
// ─── Validación de carga de dependencias críticas ────────────────────
        if (!window.RoomingCore) {
            throw new Error(
                "[Rooming-Servicios] No se ha podido cargar js/rooming-core.js. " +
                "Asegúrate de que el archivo existe y se carga antes de este script."
            );
        }

        let currentReservaId = "unknown";
        let saveTimeout = null;
        let isDiscardingChanges = false;
        let isInitializingView = true;
        let hasUserEditedView = false;
        let isExplicitSaveInProgress = false;
        const MAX_ALLOWED_ROOMING_NIGHTS = 90;
        const SERVICES_GENERATION_VERSION = 10;

        function mergeServices(existing, auto) {
            const merged = [];
            
            // Keep every non-automatic row (manual and economic extras) untouched.
            const manualExisting = existing.filter(s => s.origin !== 'auto');
            merged.push(...manualExisting);

            // 2. For each auto service:
            auto.forEach(a => {
                const match = existing.find(e => e.origin === 'auto' && (
                    (e.serviceId && e.serviceId === a.serviceId) ||
                    (!e.serviceId && e.serviceDate === a.serviceDate && e.serviceType === a.serviceType)
                ));
                if (match) {
                    const wasPaxEdited = match.paxHab !== `${match.originalPax} pax` && match.paxHab !== `${match.originalPax} pax / ${match.originalRooms || ''} hab.`;
                    
                    let finalPaxHab = a.paxHab;
                    if (wasPaxEdited) {
                        finalPaxHab = match.paxHab;
                    }

                    const finalHora = match.hora !== 'PENDIENTE' && match.hora !== '___:___ h' ? match.hora : a.hora;
                    const finalNotas = match.notas && match.notas !== '' ? match.notas : a.notas;

                    merged.push({
                        fecha: a.fecha,
                        servicio: a.servicio,
                        regimen: a.regimen,
                        paxHab: finalPaxHab,
                        hora: finalHora,
                        notas: finalNotas,
                        origin: 'auto',
                        serviceType: a.serviceType,
                        serviceDate: a.serviceDate,
                        serviceId: a.serviceId,
                        originalPax: a.originalPax,
                        originalRooms: a.originalRooms
                    });
                } else {
                    merged.push(a);
                }
            });

            const serviceChronology = { 'Llegada': 0, 'Desayuno': 1, 'Almuerzo': 2, 'Cena': 3, 'Salida': 4, 'Manual': 5 };
            merged.sort((a, b) => {
                const dateA = a.serviceDate || '';
                const dateB = b.serviceDate || '';
                if (dateA !== dateB) return dateA.localeCompare(dateB);
                const typeA = serviceChronology[a.serviceType] || 99;
                const typeB = serviceChronology[b.serviceType] || 99;
                return typeA - typeB;
            });

            return merged;
        }

        let departmentSummaryState = {};
        let departmentSummaryLayout = {};
        let lastRoomingSyncErrorMessage = '';

        function normalizeDepartmentSummary(value) {
            if (!value) return {};
            if (typeof value === 'string') {
                try {
                    return JSON.parse(value) || {};
                } catch (e) {
                    return {};
                }
            }
            return value || {};
        }

        function getDepartmentSummaryUser() {
            try {
                const user = firebase && firebase.auth && firebase.auth().currentUser;
                return user ? (user.email || user.displayName || user.uid || '') : '';
            } catch (e) {
                return '';
            }
        }

        function getDepartmentSummaryContent(key) {
            const ids = {
                reception: 'dept-recepcion',
                kitchen: 'dept-restaurante',
                admin: 'dept-administracion'
            };
            const el = document.getElementById(ids[key]);
            return el ? el.innerHTML.trim() : '';
        }

        function setDepartmentSummaryContent(key, html) {
            const ids = {
                reception: 'dept-recepcion',
                kitchen: 'dept-restaurante',
                admin: 'dept-administracion'
            };
            const el = document.getElementById(ids[key]);
            if (el) el.innerHTML = html || '';
        }

        function applyDepartmentSummaryState() {
            ['reception', 'kitchen', 'admin'].forEach(key => {
                const entry = departmentSummaryState[key];
                if (entry && entry.manualOverride && entry.content !== undefined) {
                    setDepartmentSummaryContent(key, entry.content);
                }
            });
            applyDepartmentSummaryLayout();
        }

        function applyDepartmentSummaryLayout() {
            ['reception', 'kitchen', 'admin'].forEach(key => {
                const box = document.querySelector(`[data-dept-box="${key}"]`);
                if (!box) return;
                const layout = departmentSummaryLayout[key] || {};
                box.classList.toggle('hidden', !!layout.hidden);
                box.classList.toggle('md:col-span-2', !!layout.wide && !layout.hidden);
                box.classList.toggle('md:col-span-3', !!layout.full && !layout.hidden);
            });
        }

        function updateDepartmentSummaryLayout(key, patch) {
            departmentSummaryLayout[key] = {
                ...(departmentSummaryLayout[key] || {}),
                ...patch
            };
            applyDepartmentSummaryLayout();
            captureDepartmentSummary(true);
            saveStateToCache({ skipDepartmentSummarySync: true });
            syncDepartmentSummaryToFirestore();
        }

        function toggleDepartmentHidden(key) {
            const current = departmentSummaryLayout[key] || {};
            updateDepartmentSummaryLayout(key, { hidden: !current.hidden });
        }

        function toggleDepartmentWide(key) {
            const current = departmentSummaryLayout[key] || {};
            updateDepartmentSummaryLayout(key, {
                wide: !current.wide,
                full: false,
                hidden: false
            });
        }

        function showAllDepartmentBoxes() {
            ['reception', 'kitchen', 'admin'].forEach(key => {
                departmentSummaryLayout[key] = {
                    ...(departmentSummaryLayout[key] || {}),
                    hidden: false
                };
            });
            applyDepartmentSummaryLayout();
            captureDepartmentSummary(true);
            saveStateToCache({ skipDepartmentSummarySync: true });
            syncDepartmentSummaryToFirestore();
        }

        function markDepartmentSummaryManual(key) {
            departmentSummaryState[key] = {
                ...(departmentSummaryState[key] || {}),
                content: getDepartmentSummaryContent(key),
                manualOverride: true,
                updatedAt: new Date().toISOString(),
                updatedBy: getDepartmentSummaryUser()
            };
        }

        function captureDepartmentSummary(manualOverride = true) {
            const now = new Date().toISOString();
            const updatedBy = getDepartmentSummaryUser();
            departmentSummaryState = {
                reception: {
                    content: getDepartmentSummaryContent('reception'),
                    manualOverride,
                    updatedAt: now,
                    updatedBy
                },
                kitchen: {
                    content: getDepartmentSummaryContent('kitchen'),
                    manualOverride,
                    updatedAt: now,
                    updatedBy
                },
                admin: {
                    content: getDepartmentSummaryContent('admin'),
                    manualOverride,
                    updatedAt: now,
                    updatedBy
                }
            };
            return departmentSummaryState;
        }

        function hasDepartmentSummaryEntries() {
            return Object.values(departmentSummaryState || {}).some(entry =>
                entry &&
                typeof entry === 'object' &&
                typeof entry.content === 'string' &&
                entry.content.trim() !== ''
            );
        }

        async function syncDepartmentSummaryToFirestore() {
            if (!window.db || !currentReservaId || currentReservaId === "unknown" || !hasDepartmentSummaryEntries()) return;
            try {
                const payload = {
                    departmentSummary: departmentSummaryState,
                    departmentSummaryLayout: departmentSummaryLayout
                };
                if (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) {
                    payload.departmentSummaryUpdatedAt = firebase.firestore.FieldValue.serverTimestamp();
                } else {
                    payload.departmentSummaryUpdatedAt = new Date();
                }
                await window.db.collection("groups").doc(String(currentReservaId)).set(payload, { merge: true });

                const rawGroupData = localStorage.getItem('selectedGroup');
                if (rawGroupData) {
                    const group = JSON.parse(rawGroupData);
                    const applyTo = (obj) => {
                        if (obj) {
                            obj.departmentSummary = departmentSummaryState;
                            obj.departmentSummaryLayout = departmentSummaryLayout;
                        }
                    };
                    if (Array.isArray(group)) {
                        applyTo(group.find(g => String(g.Reserva || g.id || g.reserva || '').trim() === currentReservaId));
                    } else {
                        applyTo(group);
                        if (group.records && Array.isArray(group.records)) {
                            applyTo(group.records.find(r => String(r.Reserva || r.id || r.reserva || '').trim() === currentReservaId) || group.records[0]);
                        }
                    }
                    localStorage.setItem('selectedGroup', JSON.stringify(group));
                }
            } catch (e) {
                console.error("Error saving department summary:", e);
                alert("No se pudo guardar el resumen por departamento: " + e.message);
            }
        }

        function editDepartmentSummary() {
            const first = document.getElementById('dept-recepcion');
            if (first) first.focus();
        }

        async function saveDepartmentSummaryManual() {
            captureDepartmentSummary(true);
            await syncDepartmentSummaryToFirestore();
            saveStateToCache({ skipDepartmentSummarySync: true });
            alert("Resumen por departamento guardado.");
        }

        function cancelDepartmentSummaryEdit() {
            if (Object.keys(departmentSummaryState || {}).length > 0) {
                applyDepartmentSummaryState();
            } else {
                updateDepartmentSummaries(true);
            }
        }

        async function regenerateDepartmentSummary() {
            if (!confirm("Esto sustituirá la edición manual del resumen por departamento. ¿Continuar?")) return;
            updateDepartmentSummaries(true);
            captureDepartmentSummary(false);
            await syncDepartmentSummaryToFirestore();
            saveStateToCache({ skipDepartmentSummarySync: true });
        }

        const ROOMING_DEBUG_MODE =
            window.location.hostname === "localhost" ||
            localStorage.getItem("ROOMING_DEBUG_MODE") === "true";

        function renderRoomingIncidences(stays = []) {
            const area = document.getElementById('rooming-incidences-area');
            if (!area) return;
            area.innerHTML = '';
            const unknownTypeStays = stays.filter(r => getCanonicalRoomType(r) === 'tipo-desconocido');
            if ((window.roomingIncidences && window.roomingIncidences.length > 0) || unknownTypeStays.length > 0 || window.paxInconsistencyAlert) {
                const container = document.createElement('div');
                container.className = 'bg-rose-50 border-l-4 border-rose-500 p-4 mb-4 rounded shadow-sm text-xs text-rose-800 no-print';
                const title = document.createElement('div');
                title.className = 'font-bold text-rose-700 mb-1 uppercase tracking-wider flex items-center gap-1.5';
                title.innerHTML = '⚠️ Alertas e Incidencias en Rooming List';
                container.appendChild(title);
                const list = document.createElement('ul');
                list.className = 'list-disc pl-4 space-y-1';
                if (window.paxInconsistencyAlert) {
                    const item = document.createElement('li');
                    item.className = 'flex flex-wrap items-center gap-2';
                    item.innerHTML = `<span>${window.paxInconsistencyAlert.msg}</span>`;
                    const btn = document.createElement('button');
                    btn.className = 'bg-rose-600 hover:bg-rose-700 text-white font-bold py-0.5 px-2 rounded text-[10px] shadow-sm ml-2 no-print cursor-pointer';
                    btn.innerText = `REVISAR PAX`;
                    btn.onclick = () => fixContractedPax(window.paxInconsistencyAlert.opPax);
                    item.appendChild(btn);
                    list.appendChild(item);
                }
                unknownTypeStays.forEach(st => {
                    const item = document.createElement('li');
                    item.innerHTML = `<strong>Tipo Desconocido:</strong> La habitación ${st.roomNo || st.tempRoomId || 'sin número'} del ${formatSpanishDateString(st.checkIn)} al ${formatSpanishDateString(st.checkOut)} no tiene un tipo de habitación válido asignado en el bloque económico.`;
                    list.appendChild(item);
                });
                window.roomingIncidences.forEach(inc => {
                    const item = document.createElement('li');
                    item.innerHTML = `<strong>Solape en habitación:</strong> ${inc.room} (${inc.type}) &bull; <strong>Fechas:</strong> ${formatSpanishDateString(inc.dateIn)} a ${formatSpanishDateString(inc.dateOut)} &bull; <strong>Ocupantes:</strong> ${inc.occupants}`;
                    list.appendChild(item);
                });
                container.appendChild(list);
                area.appendChild(container);
            }
        }

        async function fixContractedPax(newPax) {
            const storedPax = window.paxInconsistencyAlert ? window.paxInconsistencyAlert.storedPax : '---';
            const maxOccupancy = window.paxInconsistencyAlert ? window.paxInconsistencyAlert.opPax : newPax;
            const pNights = window.paxInconsistencyAlert ? window.paxInconsistencyAlert.personNights : '---';

            const confirmMessage = `Pax almacenado: ${storedPax}\nOcupación máxima simultánea: ${maxOccupancy}\nPersonas-noche: ${pNights}\n\n` +
                                   `El valor almacenado parece corresponder a personas-noche o es inconsistente.\n` +
                                   `¿Desea corregir el pax contratado del grupo a ${maxOccupancy}?\n\n` +
                                   `Esto modificará el campo "Pax." del grupo en la base de datos de Firestore.`;

            if (!confirm(confirmMessage)) return;
            try {
                const docRef = window.db.collection("groups").doc(String(currentReservaId));
                console.log(`Pax correction: Reserva=${currentReservaId}, OldPax=${storedPax}, NewPax=${maxOccupancy}, Date=${new Date().toISOString()}, Source=Corregir Pax Controlado`);
                await docRef.set({ "Pax.": maxOccupancy.toString() }, { merge: true });

                const rawGroupData = localStorage.getItem('selectedGroup');
                if (rawGroupData) {
                    try {
                        let group = JSON.parse(rawGroupData);
                        if (Array.isArray(group)) {
                            const m = group.find(g => String(g.Reserva || g.id || g.reserva || '').trim() === currentReservaId);
                            if (m) m["Pax."] = maxOccupancy.toString();
                        } else {
                            if (group.records && Array.isArray(group.records)) {
                                const m = group.records.find(r => String(r.Reserva || r.id || r.reserva || '').trim() === currentReservaId);
                                if (m) m["Pax."] = maxOccupancy.toString();
                            }
                            if (String(group.Reserva || group.id || group.reserva || '').trim() === currentReservaId) {
                                group["Pax."] = maxOccupancy.toString();
                            }
                        }
                        localStorage.setItem('selectedGroup', JSON.stringify(group));
                    } catch (e) {}
                }

                alert("Pax contratado corregido con éxito.");
                window.location.reload();
            } catch(e) {
                alert("Error al corregir el pax contratado: " + e.message);
            }
        }

        function runRoomingTests() {
            if (!ROOMING_DEBUG_MODE) return;
            console.log("=== INICIANDO PRUEBAS DE ROOMING LIST (24 CASOS) ===");
            let passCount = 0;
            let failCount = 0;

            function assert(cond, msg) {
                if (cond) {
                    console.log(`%c[PASS] ${msg}`, "color: green; font-weight: bold;");
                    passCount++;
                } else {
                    console.error(`[FAIL] ${msg}`);
                    failCount++;
                }
            }

            // 1. misma cantidad durante dos noches
            try {
                const input = [
                    { id: "d1", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "d2", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
                assert(res.length === 8, "Prueba 1: Debe dar exactamente 8 estancias unificadas");
            } catch (e) {
                assert(false, `Prueba 1 falló: ${e.message}`);
            }

            // 2. reducción de cantidad
            try {
                const input = [
                    { id: "d1", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "d2", roomNo: "", type: "Hab. Doble", pax: 2, qty: 6, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
                const twoNights = res.filter(r => r.displayNights === 2).length;
                const oneNight = res.filter(r => r.displayNights === 1).length;
                assert(res.length === 8 && twoNights === 6 && oneNight === 2, "Prueba 2: Reducción (8 -> 6) da 6 de dos noches y 2 de una noche");
            } catch (e) {
                assert(false, `Prueba 2 falló: ${e.message}`);
            }

            // 3. aumento de cantidad
            try {
                const input = [
                    { id: "d1", roomNo: "", type: "Hab. Doble", pax: 2, qty: 6, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "d2", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
                const twoNights = res.filter(r => r.displayNights === 2).length;
                const startingSecond = res.filter(r => r.displayNights === 1 && r.checkIn === "2026-06-23").length;
                assert(res.length === 8 && twoNights === 6 && startingSecond === 2, "Prueba 3: Aumento (6 -> 8) da 6 de dos noches y 2 nuevas de una noche");
            } catch (e) {
                assert(false, `Prueba 3 falló: ${e.message}`);
            }

            // 4. secuencia 8 -> 6 -> 8
            try {
                const input = [
                    { id: "d1", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "d2", roomNo: "", type: "Hab. Doble", pax: 2, qty: 6, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" },
                    { id: "d3", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-24", dateOut: "2026-06-25" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-25");
                assert(res.length === 10, "Prueba 4: Secuencia 8 -> 6 -> 8 da exactamente 10 estancias físicas");
            } catch (e) {
                assert(false, `Prueba 4 falló: ${e.message}`);
            }

            // 5. interrupción entre noches
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-24", dateOut: "2026-06-25" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-25");
                assert(res.length === 2, "Prueba 5: Interrupción genera 2 estancias separadas");
            } catch (e) {
                assert(false, `Prueba 5 falló: ${e.message}`);
            }

            // 6. cambio de pax
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "2", roomNo: "101", type: "Hab. Doble", pax: 1, dateIn: "2026-06-23", dateOut: "2026-06-24" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
                assert(res.length === 2, "Prueba 6: Cambio de pax genera 2 estancias distintas");
            } catch (e) {
                assert(false, `Prueba 6 falló: ${e.message}`);
            }

            // 7. cambio de ocupantes
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23", ocupantes: "Ocupante A" },
                    { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-23", dateOut: "2026-06-24", ocupantes: "Ocupante B" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
                assert(res.length === 2, "Prueba 7: Cambio de ocupantes genera 2 estancias distintas");
            } catch (e) {
                assert(false, `Prueba 7 falló: ${e.message}`);
            }

            // 8. cambio de observaciones
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23", observ: "Cama matrimonio" },
                    { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-23", dateOut: "2026-06-24", observ: "Dos camas" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
                assert(res.length === 2, "Prueba 8: Cambio de observaciones genera 2 estancias distintas");
            } catch (e) {
                assert(false, `Prueba 8 falló: ${e.message}`);
            }

            // 9. cambio de régimen
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, regime: "AD", dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
                assert(res.length === 2, "Prueba 9: Cambio de régimen genera 2 estancias distintas");
            } catch (e) {
                assert(false, `Prueba 9 falló: ${e.message}`);
            }

            // 10. cambio de tipo
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "2", roomNo: "101", type: "Hab. Individual", pax: 1, dateIn: "2026-06-23", dateOut: "2026-06-24" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-24");
                assert(res.length === 2, "Prueba 10: Cambio de tipo genera 2 estancias distintas");
            } catch (e) {
                assert(false, `Prueba 10 falló: ${e.message}`);
            }

            // 11. habitaciones numeradas
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "2", roomNo: "102", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
                assert(res.length === 2, "Prueba 11: Habitaciones numeradas permanecen separadas");
            } catch (e) {
                assert(false, `Prueba 11 falló: ${e.message}`);
            }

            // 12. habitaciones sin número
            try {
                const input = [
                    { id: "b1", roomNo: "", type: "Hab. Doble", qty: 2, pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
                assert(res.length === 2 && res[0].tempRoomId !== res[1].tempRoomId, "Prueba 12: Habitaciones sin número asignadas a slots estables");
            } catch (e) {
                assert(false, `Prueba 12 falló: ${e.message}`);
            }

            // 13. solapamiento distinto
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-24", ocupantes: "A" },
                    { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-23", dateOut: "2026-06-25", ocupantes: "B" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-25");
                assert(res.length === 2 && window.roomingIncidences.length === 1, "Prueba 13: Solapamiento distinto no se fusiona y genera incidencia");
            } catch (e) {
                assert(false, `Prueba 13 falló: ${e.message}`);
            }

            // 14. duplicado exacto
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23", ocupantes: "A" },
                    { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23", ocupantes: "A" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
                assert(res.length === 1, "Prueba 14: Duplicado exacto se fusiona sin error");
            } catch (e) {
                assert(false, `Prueba 14 falló: ${e.message}`);
            }

            // 15. una sola noche
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
                assert(res.length === 1 && res[0].checkIn === "2026-06-22" && res[0].checkOut === "2026-06-23", "Prueba 15: Una sola noche mantiene fechas correctas");
            } catch (e) {
                assert(false, `Prueba 15 falló: ${e.message}`);
            }

            // 16. tres o más noches
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "2", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-23", dateOut: "2026-06-24" },
                    { id: "3", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-24", dateOut: "2026-06-25" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-25");
                assert(res.length === 1 && res[0].checkOut === "2026-06-25", "Prueba 16: Tres o más noches consecutivas se fusionan en un único rango");
            } catch (e) {
                assert(false, `Prueba 16 falló: ${e.message}`);
            }

            // 17. entradas parciales
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, qty: 1, dateIn: "2026-06-22", dateOut: "2026-06-24" },
                    { id: "2", roomNo: "102", type: "Hab. Doble", pax: 2, qty: 1, dateIn: "2026-06-23", dateOut: "2026-06-25" }
                ];
                const maxPax = calculateMaxDailyOccupancy(input);
                assert(maxPax === 4, "Prueba 17: Entrada parcial calcula ocupación simultánea máxima correcta (4)");
            } catch (e) {
                assert(false, `Prueba 17 falló: ${e.message}`);
            }

            // 18. salidas parciales
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, qty: 1, dateIn: "2026-06-22", dateOut: "2026-06-25" },
                    { id: "2", roomNo: "102", type: "Hab. Doble", pax: 2, qty: 1, dateIn: "2026-06-22", dateOut: "2026-06-24" }
                ];
                const maxPax = calculateMaxDailyOccupancy(input);
                assert(maxPax === 4, "Prueba 18: Salida parcial calcula ocupación simultánea máxima correcta (4)");
            } catch (e) {
                assert(false, `Prueba 18 falló: ${e.message}`);
            }

            // 19. tipo desconocido
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "2", roomNo: "102", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
                assert(res.length === 2 && getCanonicalRoomType(res[0]) === "tipo-desconocido", "Prueba 19: Tipo vacío se normaliza a tipo-desconocido y no se mezcla");
            } catch (e) {
                assert(false, `Prueba 19 falló: ${e.message}`);
            }

            // 20. apertura y guardado sin cambios
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, price: 100, total: 100, dateIn: "2026-06-22", dateOut: "2026-06-23" }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
                assert(res[0].price === 100 && parseFloat(res[0].total) === 100, "Prueba 20: Fusión mantiene intacta estructura económica original");
            } catch (e) {
                assert(false, `Prueba 20 falló: ${e.message}`);
            }

            // 21. dato Pax. correcto
            try {
                const maxDaily = 17;
                const personNights = 34;
                const storedContracted = 17;
                const isConsistent = isStoredPaxConsistent(storedContracted, maxDaily, personNights);
                assert(isConsistent === true, "Prueba 21: Pax contratado es consistente si es igual al pico diario");
            } catch (e) {
                assert(false, `Prueba 21 falló: ${e.message}`);
            }

            // 22. dato Pax. contaminado con personas-noche
            try {
                const maxDaily = 17;
                const personNights = 34;
                const storedContracted = 34;
                const isConsistent = isStoredPaxConsistent(storedContracted, maxDaily, personNights);
                assert(isConsistent === false, "Prueba 22: Pax contaminado con personas-noche se marca como inconsistente");
            } catch (e) {
                assert(false, `Prueba 22 falló: ${e.message}`);
            }

            // 23. habitaciones manuales pendientes
            try {
                const input = [
                    { id: "m1", roomNo: "Manual 1", type: "Hab. Premium", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23", price: 0, total: 0, pendienteValoracion: true }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
                assert(res.length === 1 && res[0].pendienteValoracion === true && res[0].price === 0, "Prueba 23: Habitación manual se mantiene marcada como pendiente con precio 0");
            } catch (e) {
                assert(false, `Prueba 23 falló: ${e.message}`);
            }

            // 24. servicios fuera de la consolidación
            try {
                const input = [
                    { id: "1", roomNo: "101", type: "Hab. Doble", pax: 2, dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "s1", type: "Pensión Completa", price: 20, isService: true }
                ];
                const res = groupAndMergeRoomingList(input, "2026-06-22", "2026-06-23");
                assert(res.length === 2 && res.some(i => i.isService), "Prueba 24: Servicios no se mezclan en la consolidación y se mantienen intactos");
            } catch (e) {
                assert(false, `Prueba 24 falló: ${e.message}`);
            }

            // REGRESIÓN: Caso Guardia Civil (78440)
            try {
                const gcInput = [
                    { id: "d1", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "u1", roomNo: "", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-22", dateOut: "2026-06-23" },
                    { id: "d2", roomNo: "", type: "Hab. Doble", pax: 2, qty: 8, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" },
                    { id: "u2", roomNo: "", type: "Hab. Doble Uso Individual", pax: 1, qty: 1, regime: "PC", dateIn: "2026-06-23", dateOut: "2026-06-24" }
                ];
                const res = groupAndMergeRoomingList(gcInput, "2026-06-22", "2026-06-24");
                const maxDaily = calculateMaxDailyOccupancy(gcInput);
                const personNights = calculatePersonNights(gcInput);
                const totalRooms = calculateMaxDailyRooms(gcInput);
                
                assert(res.length === 9, "Regresión Guardia Civil: Da exactamente 9 estancias");
                assert(maxDaily === 17, "Regresión Guardia Civil: Pico máximo de Pax simultáneos es 17");
                assert(totalRooms === 9, "Regresión Guardia Civil: Habitaciones simultáneas máximas es 9");
                assert(personNights === 34, "Regresión Guardia Civil: Personas-noche totales es 34");
            } catch (e) {
                assert(false, `Regresión Guardia Civil falló: ${e.message}`);
            }

            console.log(`=== FIN DE PRUEBAS DE ROOMING LIST: ${passCount} PASADAS, ${failCount} FALLADAS ===`);
        }

        function parseMoney(value) {
            if (value === null || value === undefined || value === '') return 0;
            if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
            const cleaned = String(value)
                .replace(/[^\d,.-]/g, '')
                .replace(/\.(?=\d{3}(?:\D|$))/g, '')
                .replace(',', '.');
            const parsed = parseFloat(cleaned);
            return Number.isFinite(parsed) ? parsed : 0;
        }

        function getRoomLineType(item) {
            return String(
                item.type ||
                item.roomType ||
                item.product ||
                item.producto ||
                item.concept ||
                item.concepto ||
                item.Concepto ||
                item["Producto"] ||
                ''
            ).trim();
        }

        function normalizeRoomTypeForMatch(value) {
            return String(value || '')
                .toUpperCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/HABITACION|ROOM|USO|STANDARD|ESTANDAR|\s+/g, '')
                .trim();
        }

        function getRoomLinePrice(item) {
            const candidates = [
                item.price,
                item.unitPrice,
                item.unit_price,
                item.precio,
                item.Precio,
                item.pUnit,
                item.unit,
                item["P. UNIT"],
                item["P_UNIT"],
                item["Precio Unitario"]
            ];
            for (const value of candidates) {
                const parsed = parseMoney(value);
                if (parsed > 0) return parsed;
            }
            const total = parseMoney(item.total || item.lineTotal || item.importe || item.Total || item.amount);
            const nights = parseInt(item.nights || item.noches || item.Noches || 1, 10) || 1;
            const qty = getRoomLineQuantity(item, 1);
            const derived = total > 0 && nights > 0 && qty > 0 ? total / nights / qty : 0;
            if (derived > 0) return derived;
            return 0;
        }

        function getRoomLineIva(item, fallback = 10) {
            const parsed = parseInt(item.iva || item.IVA || item.tax || item.vat || fallback, 10);
            return Number.isFinite(parsed) ? parsed : fallback;
        }

        function getRoomLineQuantity(item, fallback = 1) {
            const candidates = [
                item.qty,
                item.quantity,
                item.cantidad,
                item.cant,
                item.Cant,
                item.CANT,
                item["Cant."],
                item["CANT."],
                item["Cantidad"],
                item.rooms,
                item.units
            ];
            for (const value of candidates) {
                const parsed = parseInt(String(value ?? '').replace(',', '.'), 10);
                if (Number.isFinite(parsed) && parsed > 0) return parsed;
            }
            return fallback;
        }

        // calculateRoomingNights is provided by rooming-core.js — do not redeclare here.

        function assertValidRoomingStay(dateIn, dateOut, label) {
            const nights = calculateRoomingNights(dateIn, dateOut);
            if (nights <= 0) {
                throw new Error(`${label}: la salida debe ser posterior a la entrada.`);
            }
            if (nights > MAX_ALLOWED_ROOMING_NIGHTS && !confirm(`${label}: estancia de ${nights} noches. ¿Confirmas que es correcto?`)) {
                throw new Error(`${label}: estancia no confirmada.`);
            }
            return nights;
        }

        function isSummaryBudgetLine(item, budgetTotal) {
            const qty = getRoomLineQuantity(item, 1);
            const total = parseMoney(item.total || item.lineTotal || item.importe || item.Total);
            const price = getRoomLinePrice(item);
            return !item.isService && qty === 1 && budgetTotal > 0 &&
                (Math.abs(total - budgetTotal) < 0.01 || Math.abs(price - budgetTotal) < 0.01) &&
                !item.ocupantes && !item.roomNo;
        }


        function goBackToReserva() {
            localStorage.setItem('nexus_return_reserva', currentReservaId);
            localStorage.setItem('nexus_open_ficha', currentReservaId);
            window.location.href = 'Gestion-de-Grupos.html?reserva=' + encodeURIComponent(currentReservaId);
        }

        function openIaModal() {
            document.getElementById('ia-text-input').value = '';
            document.getElementById('modal-ia').classList.remove('hidden');
        }

        function closeIaModal() {
            document.getElementById('modal-ia').classList.add('hidden');
        }

        function triggerSave() {
            hasUserEditedView = true;
            if (isInitializingView || isDiscardingChanges) return;
            const status = document.getElementById('save-status');
            if (status) {
                status.innerText = 'Guardando local...';
                status.classList.remove('opacity-0');
            }
            if (saveTimeout) clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                saveStateToCache();
                if (status) {
                    status.innerText = 'Autoguardado local ✓';
                    setTimeout(() => status.classList.add('opacity-0'), 2000);
                }
            }, 1000);
        }

        async function handleExplicitRoomingSave() {
            const btn = event.currentTarget || document.querySelector('button[onclick="handleExplicitRoomingSave()"]');
            const originalText = btn.innerText;
            btn.innerText = "GUARDANDO...";
            btn.disabled = true;

            isExplicitSaveInProgress = true;
            try {
                // saveStateToCache triggers the process that eventually calls syncRoomingToFirestore
                saveStateToCache({ explicitSave: true });
                hasUserEditedView = false;
                alert("Cambios guardados correctamente en la base de datos.");
            } catch(e) {
                alert("Error al guardar: " + e.message);
            } finally {
                isExplicitSaveInProgress = false;
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }

        function createEditableCell(text, isNumeric = false) {
            const td = document.createElement('td');
            td.className = 'editable' + (isNumeric ? ' text-right' : '');
            td.contentEditable = "true";
            td.innerText = text !== undefined && text !== null ? text : '';
            td.oninput = triggerSave;
            return td;
        }

        function addRowPendiente(pendiente, detalle, limite, responsable) {
            const tbody = document.querySelector('#table-pendientes tbody');
            const tr = document.createElement('tr');
            tr.appendChild(createEditableCell(pendiente));
            tr.appendChild(createEditableCell(detalle));
            tr.appendChild(createEditableCell(limite));
            tr.appendChild(createEditableCell(responsable));
            
            const btnTd = document.createElement('td');
            btnTd.className = 'no-print text-right';
            const btn = document.createElement('button');
            btn.innerText = '✖';
            btn.className = 'text-red-400 font-black hover:text-red-600 px-1 cursor-pointer';
            btn.onclick = () => { tr.remove(); triggerSave(); };
            btnTd.appendChild(btn);
            tr.appendChild(btnTd);
            
            tbody.appendChild(tr);
            triggerSave();
        }

        function addRowServicio(fecha, servicio, regimen, paxHab, hora, notas, metadata = {}) {
            const tbody = document.querySelector('#table-servicios tbody');
            const tr = document.createElement('tr');
            
            // Set dataset metadata
            tr.dataset.origin = metadata.origin || 'manual';
            tr.dataset.serviceType = metadata.serviceType || 'Manual';
            tr.dataset.serviceDate = metadata.serviceDate || '';
            tr.dataset.serviceId = metadata.serviceId || '';
            tr.dataset.originalPax = metadata.originalPax || '';
            tr.dataset.originalRooms = metadata.originalRooms || '';

            tr.appendChild(createEditableCell(fecha));
            tr.appendChild(createEditableCell(servicio));
            tr.appendChild(createEditableCell(regimen));
            tr.appendChild(createEditableCell(paxHab));
            tr.appendChild(createEditableCell(hora));
            tr.appendChild(createEditableCell(notas));
            
            const btnTd = document.createElement('td');
            btnTd.className = 'no-print text-right';
            const btn = document.createElement('button');
            btn.innerText = '✖';
            btn.className = 'text-red-400 font-black hover:text-red-600 px-1 cursor-pointer';
            btn.onclick = () => { tr.remove(); triggerSave(); };
            btnTd.appendChild(btn);
            tr.appendChild(btnTd);
            
            tbody.appendChild(tr);
            triggerSave();
        }

        function addRowRooming(id, hab, tipo, pax, ocupantes, dni, observ, checkIn = '', checkOut = '', originalIds = null) {
            const tbody = document.querySelector('#table-rooming tbody');
            const tr = document.createElement('tr');
            tr.dataset.id = id || ('new_' + Date.now() + '_' + Math.random());
            // Persist the originalIds so syncRoomingToFirestore can map back to source records
            if (Array.isArray(originalIds) && originalIds.length > 0) {
                tr.dataset.originalIds = JSON.stringify(originalIds);
            } else if (id && !String(id).startsWith('new_')) {
                tr.dataset.originalIds = JSON.stringify([id]);
            }
            tr.appendChild(createEditableCell(hab));
            tr.appendChild(createEditableCell(tipo));
            tr.appendChild(createEditableCell(pax));
            tr.appendChild(createEditableCell(formatSpanishDateString(checkIn)));
            tr.appendChild(createEditableCell(formatSpanishDateString(checkOut)));
            tr.appendChild(createEditableCell(ocupantes));
            tr.appendChild(createEditableCell(observ));
            
            const btnTd = document.createElement('td');
            btnTd.className = 'no-print text-right';
            const btn = document.createElement('button');
            btn.innerText = '✖';
            btn.className = 'text-red-400 font-black hover:text-red-600 px-1 cursor-pointer';
            btn.onclick = () => { tr.remove(); triggerSave(); };
            btnTd.appendChild(btn);
            tr.appendChild(btnTd);
            
            tbody.appendChild(tr);
            triggerSave();
        }

        function updateDepartmentSummaries(forceAuto = false) {
            // RECEPCIÓN
            let currentTotalPax = 0;
            let currentTotalRooms = 0;
            const roomTypes = {};
            const staffMembers = [];
            
            document.querySelectorAll('#table-rooming tbody tr').forEach(tr => {
                const cells = tr.querySelectorAll('td.editable');
                if (cells.length >= 7) {
                    currentTotalRooms++;
                    const habNo = cells[0].innerText.trim();
                    const tipo = cells[1].innerText.trim();
                    const paxVal = parseInt(cells[2].innerText.trim()) || 0;
                    const ocupante = cells[5].innerText.trim();
                    const observ = cells[6].innerText.trim();
                    
                    currentTotalPax += paxVal;
                    
                    if (tipo) {
                        roomTypes[tipo] = (roomTypes[tipo] || 0) + 1;
                    }
                    
                    const upperTipo = tipo.toUpperCase();
                    const upperOcupante = ocupante.toUpperCase();
                    const upperObserv = observ.toUpperCase();
                    const isStaff = upperTipo.includes('CHOFER') || upperTipo.includes('CHÓFER') || upperTipo.includes('DRIVER') || upperTipo.includes('GUIA') || upperTipo.includes('GUÍA') || upperTipo.includes('CONDUCTOR') ||
                                    upperOcupante.includes('CHOFER') || upperOcupante.includes('CHÓFER') || upperOcupante.includes('DRIVER') || upperOcupante.includes('GUIA') || upperOcupante.includes('GUÍA') ||
                                    upperObserv.includes('CHOFER') || upperObserv.includes('CHÓFER') || upperObserv.includes('DRIVER') || upperObserv.includes('GUIA') || upperObserv.includes('GUÍA');
                    if (isStaff) {
                        const isNameProvided = ocupante && 
                            !ocupante.toLowerCase().includes('ocupante pendiente') && 
                            !ocupante.toLowerCase().includes('chofer') && 
                            !ocupante.toLowerCase().includes('chófer') && 
                            !ocupante.toLowerCase().includes('guía') && 
                            !ocupante.toLowerCase().includes('guia');
                        staffMembers.push({
                            role: (upperTipo.includes('GUIA') || upperTipo.includes('GUÍA') || upperOcupante.includes('GUIA') || upperOcupante.includes('GUÍA')) ? 'Guía' : 'Chofer',
                            name: isNameProvided ? ocupante : 'Pendiente de asignar',
                            room: habNo || 'TBD'
                        });
                    }
                }
            });

            let roomSummaryParts = [];
            Object.entries(roomTypes).forEach(([type, count]) => {
                roomSummaryParts.push(`${count} ${type.toLowerCase()}s`);
            });
            const roomsText = roomSummaryParts.length > 0 ? roomSummaryParts.join(' + ') : '---';

            const recSummary = `
                &bull; Entrada del grupo: ${currentTotalPax} personas / ${currentTotalRooms} habitaciones.<br>
                &bull; Distribución: ${currentTotalRooms} total: ${roomsText}.<br>
                &bull; Chofer / Guía: ${staffMembers.length > 0 ? staffMembers.map(m => `${m.role}: ${m.name} (Hab ${m.room})`).join(', ') : 'Ninguno especificado en la rooming list'}.
            `;
            const receptionEl = document.getElementById('dept-recepcion');
            if (receptionEl) {
                const saved = departmentSummaryState.reception;
                receptionEl.innerHTML = (!forceAuto && saved && saved.manualOverride) ? saved.content : recSummary.trim();
            }

            // RESTAURANTE / COCINA
            let breakfastTime = '';
            let lunchTime = '';
            let dinnerTime = '';
            document.querySelectorAll('#table-servicios tbody tr').forEach(tr => {
                const cells = tr.querySelectorAll('td.editable');
                if (cells.length === 6) {
                    const serviceName = cells[1].innerText.trim().toLowerCase();
                    const hour = cells[4].innerText.trim();
                    const hasHour = hour && hour !== '___:___ h' && hour.toUpperCase() !== 'PENDIENTE';
                    if (hasHour) {
                        if (serviceName.includes('desayuno')) {
                            breakfastTime = hour;
                        } else if (serviceName.includes('almuerzo')) {
                            lunchTime = hour;
                        } else if (serviceName.includes('cena')) {
                            dinnerTime = hour;
                        }
                    }
                }
            });

            const gRegimenEl = document.getElementById('gen-regimen');
            const gRegimen = gRegimenEl ? gRegimenEl.innerText : '---';
            let restMealsInfo = '';
            const normRegime = gRegimen.toUpperCase().trim();
            if (normRegime === 'SA') {
                restMealsInfo = 'Solo Alojamiento: Sin servicios de restauración contratados.';
            } else {
                const mealDetails = [];
                if (normRegime.includes('AD') || normRegime.includes('HD') || normRegime.includes('MP') || normRegime.includes('PC') || normRegime.includes('TI')) {
                    mealDetails.push(`Desayuno: ${breakfastTime ? breakfastTime : 'Pendiente de coordinar horario'}`);
                }
                if (normRegime.includes('MP') || normRegime.includes('PC') || normRegime.includes('TI')) {
                    if (normRegime.includes('PC')) {
                        mealDetails.push(`Almuerzo: ${lunchTime ? lunchTime : 'Pendiente de coordinar menú/hora'}`);
                    }
                    mealDetails.push(`Cena: ${dinnerTime ? dinnerTime : 'Pendiente de coordinar menú/hora'}`);
                }
                restMealsInfo = mealDetails.join(' | ');
            }

            // Load Special Menus and Operational Notes from Service Order cache if available
            const osKey = 'ordenServicio_' + currentReservaId;
            const osDataStr = localStorage.getItem(osKey);
            let specialMenus = [];
            let operationalNotes = '';
            if (osDataStr) {
                try {
                    const osData = JSON.parse(osDataStr);
                    specialMenus = osData.incidenciaRows || [];
                    operationalNotes = osData.notasHTML || '';
                } catch (e) {
                    console.error("Error parsing Service Order cache in Rooming summary:", e);
                }
            }

            // Build Cocina (Menús Especiales / Alergias) text
            let cocinaText = '';
            if (specialMenus.length > 0) {
                cocinaText = specialMenus.map(m => {
                    const tipoPart = m.tipo && m.tipo !== '---' ? `[${m.tipo}] ` : '';
                    const paxPart = m.numPax ? `${m.numPax} pax - ` : '';
                    const servPart = m.serv && m.serv !== '---' ? ` (Afecta: ${m.serv})` : '';
                    return `&bull; Cocina: ${tipoPart}${paxPart}${m.detalle}${servPart}`;
                }).join('<br>');
            } else {
                cocinaText = `&bull; Cocina: No se registran menús especiales o alergias.`;
            }

            // Build Restauración (Notas Operativas) text
            let restauracionText = '';
            const cleanOpNotes = operationalNotes ? operationalNotes.replace(/<[^>]*>/g, '').trim() : '';
            const looksCommercial = /swimming pool|gym|credit card|invoice|factura|tarjeta|comercial|presupuesto|cotizaci[oó]n|quote|price|precio|open in this period/i.test(cleanOpNotes);
            if (cleanOpNotes && cleanOpNotes !== 'Detalles operativos aquí...' && cleanOpNotes !== '' && !looksCommercial) {
                restauracionText = `&bull; Restauración: <div class="pl-4 mt-0.5 inline-block text-slate-600 leading-relaxed font-normal">${operationalNotes.trim()}</div>`;
            } else {
                restauracionText = `&bull; Restauración: Sin notas operativas especiales.`;
            }

            const restSummary = `
                &bull; Régimen general: ${gRegimen}.<br>
                &bull; Servicios: ${restMealsInfo}<br>
                ${cocinaText}<br>
                ${restauracionText}
            `;
            const restauranteEl = document.getElementById('dept-restaurante');
            if (restauranteEl) {
                const saved = departmentSummaryState.kitchen;
                restauranteEl.innerHTML = (!forceAuto && saved && saved.manualOverride) ? saved.content : restSummary.trim();
            }

            // ADMINISTRACIÓN
            const totalRevenue = window.admTotalRevenue || 0;
            const totalCommission = window.admTotalCommission || 0;
            const netTotal = window.admNetTotal || 0;
            const paidAmount = window.admPaidAmount || 0;
            const pendingAmount = window.admPendingAmount || 0;
            const isOverpaid = window.admIsOverpaid || false;
            const refundAmount = window.admRefundAmount || 0;

            let admSummaryText = ``;
            if (totalCommission > 0) {
                admSummaryText += `
                    &bull; Total presupuesto (Bruto): ${totalRevenue.toLocaleString('es-ES', {style:'currency', currency:'EUR'})} IVA incluido.<br>
                    &bull; Comisión Agencia: ${totalCommission.toLocaleString('es-ES', {style:'currency', currency:'EUR'})}.<br>
                    &bull; Total Neto a cobrar: ${netTotal.toLocaleString('es-ES', {style:'currency', currency:'EUR'})}.<br>
                `;
            } else {
                admSummaryText += `
                    &bull; Total presupuesto: ${totalRevenue.toLocaleString('es-ES', {style:'currency', currency:'EUR'})} IVA incluido.<br>
                `;
            }
            if (isOverpaid) {
                admSummaryText += `
                    &bull; Anticipo cobrado: ${paidAmount.toLocaleString('es-ES', {style:'currency', currency:'EUR'})}.<br>
                    &bull; Devolución pendiente: ${refundAmount.toLocaleString('es-ES', {style:'currency', currency:'EUR'})}.<br>
                    &bull; Términos: Se acepta la devolución del importe sobrante cobrado de más.
                `;
            } else {
                admSummaryText += `
                    &bull; Anticipo cobrado: ${paidAmount.toLocaleString('es-ES', {style:'currency', currency:'EUR'})}.<br>
                    &bull; Pendiente de cobro final: ${pendingAmount.toLocaleString('es-ES', {style:'currency', currency:'EUR'})}.<br>
                    &bull; Términos: Pagos anticipados no reembolsables.
                `;
            }
            const adminEl = document.getElementById('dept-administracion');
            if (adminEl) {
                const saved = departmentSummaryState.admin;
                adminEl.innerHTML = (!forceAuto && saved && saved.manualOverride) ? saved.content : admSummaryText.trim();
            }
        }

        function saveStateToCache(options = {}) {
            if (currentReservaId === "unknown" || isDiscardingChanges) return;

            // Dynamically update only non-manual summary boxes
            updateDepartmentSummaries(false);

            const pendientes = [];
            document.querySelectorAll('#table-pendientes tbody tr').forEach(tr => {
                const cells = tr.querySelectorAll('td.editable');
                if (cells.length === 4) {
                    pendientes.push({
                        pendiente: cells[0].innerText,
                        detalle: cells[1].innerText,
                        limite: cells[2].innerText,
                        responsable: cells[3].innerText
                    });
                }
            });

            const servicios = [];
            document.querySelectorAll('#table-servicios tbody tr').forEach(tr => {
                const cells = tr.querySelectorAll('td.editable');
                if (cells.length === 6) {
                    servicios.push({
                        fecha: cells[0].innerText,
                        servicio: cells[1].innerText,
                        regimen: cells[2].innerText,
                        paxHab: cells[3].innerText,
                        hora: cells[4].innerText,
                        notas: cells[5].innerText,
                        origin: tr.dataset.origin || 'manual',
                        serviceType: tr.dataset.serviceType || 'Manual',
                        serviceDate: tr.dataset.serviceDate || '',
                        serviceId: tr.dataset.serviceId || '',
                        originalPax: tr.dataset.originalPax || '',
                        originalRooms: tr.dataset.originalRooms || ''
                    });
                }
            });

            const rooming = [];
            document.querySelectorAll('#table-rooming tbody tr').forEach(tr => {
                const cells = tr.querySelectorAll('td.editable');
                if (cells.length >= 7) {
                    let parsedOriginalIds = null;
                    try {
                        parsedOriginalIds = tr.dataset.originalIds ? JSON.parse(tr.dataset.originalIds) : null;
                    } catch(e) {}
                    rooming.push({
                        id: tr.dataset.id || '',
                        originalIds: Array.isArray(parsedOriginalIds) && parsedOriginalIds.length > 0 ? parsedOriginalIds : null,
                        hab: cells[0].innerText,
                        tipo: cells[1].innerText,
                        pax: cells[2].innerText,
                        checkIn: cells[3].innerText,
                        checkOut: cells[4].innerText,
                        ocupantes: cells[5].innerText,
                        dni: '',
                        observ: cells[6].innerText
                    });
                }
            });

            const saveData = {
                headerGrupo: document.getElementById('header-grupo').innerText,
                genContacto: document.getElementById('gen-contacto').innerText,
                genEntrada: document.getElementById('gen-entrada').innerText,
                genSalida: document.getElementById('gen-salida').innerText,
                genHabitaciones: document.getElementById('gen-habitaciones').innerText,
                genPax: document.getElementById('gen-pax').innerText,
                genRegimen: document.getElementById('gen-regimen').innerText,
                genEstadoCritico: document.getElementById('gen-estado-critico').innerText,
                deptRecepcion: document.getElementById('dept-recepcion').innerHTML,
                deptRestaurante: document.getElementById('dept-restaurante').innerHTML,
                deptAdministracion: document.getElementById('dept-administracion').innerHTML,
                departmentSummary: departmentSummaryState,
                departmentSummaryLayout: departmentSummaryLayout,
                servicesGenerationVersion: SERVICES_GENERATION_VERSION,
                pendientes,
                servicios,
                rooming
            };

            localStorage.setItem('roomingServicios_' + currentReservaId, JSON.stringify(saveData));
            if (!options.skipDepartmentSummarySync && Object.values(departmentSummaryState || {}).some(entry => entry && entry.manualOverride)) {
                syncDepartmentSummaryToFirestore();
            }
            
            // Asynchronously sync manual room edits to Firestore
            if (typeof syncRoomingToFirestore === 'function') {
                syncRoomingToFirestore(rooming, options.explicitSave === true);
            }
        }

        let isSyncing = false;
        async function syncRoomingToFirestore(rooming, isExplicit = false) {
            if (isInitializingView || !hasUserEditedView || isDiscardingChanges) return;
            // Only allow Firestore write if it's explicitly triggered
            if (!isExplicitSaveInProgress && !isExplicit) return;

            if (!window.db || !currentReservaId) return;
            if (isSyncing) return;
            isSyncing = true;
            try {
                const docRef = window.db.collection("groups").doc(String(currentReservaId));
                const docSnap = await docRef.get();
                if (!docSnap.exists) return;

                const recData = docSnap.data();
                let originalList = [];
                try {
                    originalList = JSON.parse(recData['RoomingList_JSON'] || '[]');
                } catch(e) {}

                // Make a deep copy of originalList
                let finalRoomingList = JSON.parse(JSON.stringify(originalList));

                // Keep only economic blocks and existing manual items that are still in rooming
                const activeManualIds = new Set(
                    rooming
                        .filter(r => !r.originalIds || r.originalIds.length === 0 || (r.id && String(r.id).startsWith('manual_')) || r.isManualRoomingItem)
                        .map(r => r.id)
                );

                // Clean up assignments or initialize them on all economic blocks
                finalRoomingList.forEach(block => {
                    if (!block.isService && !block.isManualRoomingItem && !block.pendienteValoracion) {
                        block.assignments = block.assignments || {};
                    }
                });

                // Helper function for legacy compatibility
                function syncLegacyRootAssignment(block) {
                    if (parseInt(block.qty) === 1 && parseInt(block.nights) === 1) {
                        const assign = block.assignments?.['q0_n0'] || block.assignments?.['0_0'] || {};
                        block.roomNo = assign.roomNo || '';
                        block.ocupantes = Array.isArray(assign.occupants) ? assign.occupants.join('\n') : (assign.occupants || '');
                        block.dni = Array.isArray(assign.dni) ? assign.dni.join(';') : (assign.dni || '');
                        block.observ = assign.observations || '';
                    }
                }

                // Traverse the consolidated rooming list
                rooming.forEach(stay => {
                    if (stay.isService) return;

                    // Parse originalIds of the stay
                    const rowIds = Array.isArray(stay.originalIds) && stay.originalIds.length > 0
                        ? stay.originalIds
                        : (stay.id || '').split(',').map(s => s.trim()).filter(s => s.length > 0);

                    // Check if it has assignmentRefs from the core layout.
                    // Stays loaded from groupAndMergeRoomingList have assignmentRefs!
                    const hasRefs = Array.isArray(stay.assignmentRefs) && stay.assignmentRefs.length > 0;
                    
                    if (hasRefs) {
                        stay.assignmentRefs.forEach(ref => {
                            const block = finalRoomingList.find(b => b.id === ref.blockId);
                            if (block) {
                                block.assignments = block.assignments || {};
                                block.assignments[ref.assignmentKey] = {
                                    assignmentId: stay.assignmentId || `assign_${Math.random().toString(36).substring(2, 9)}`,
                                    stayId: stay.stayId || '',
                                    slotId: stay.slotId || '',
                                    tempRoomId: stay.tempRoomId || '',
                                    roomNo: stay.hab || stay.roomNo || '',
                                    occupants: (stay.ocupantes || '').split('\n').map(x => x.trim()).filter(Boolean),
                                    dni: (stay.dni || '').split(';').map(x => x.trim()).filter(Boolean),
                                    observations: stay.observ || stay.observations || ''
                                };
                                syncLegacyRootAssignment(block);
                            }
                        });
                    } else {
                        // This might be a manual room or legacy stay. We find matching block by ID
                        const matchBlock = finalRoomingList.find(b => b.id === stay.id);
                        if (matchBlock && !matchBlock.isManualRoomingItem && !matchBlock.pendienteValoracion) {
                            // If it matches an economic block, write to its q0_n0 assignment
                            matchBlock.assignments = matchBlock.assignments || {};
                            matchBlock.assignments['q0_n0'] = {
                                assignmentId: stay.assignmentId || `assign_${Math.random().toString(36).substring(2, 9)}`,
                                stayId: stay.stayId || '',
                                slotId: stay.slotId || '',
                                tempRoomId: stay.tempRoomId || '',
                                roomNo: stay.hab || stay.roomNo || '',
                                occupants: (stay.ocupantes || '').split('\n').map(x => x.trim()).filter(Boolean),
                                dni: (stay.dni || '').split(';').map(x => x.trim()).filter(Boolean),
                                observations: stay.observ || stay.observations || ''
                            };
                            syncLegacyRootAssignment(matchBlock);
                        } else {
                            // This is a manual room
                            const manualId = stay.id || `manual_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                            let existingManual = finalRoomingList.find(b => b.id === manualId);
                            
                            const manualItem = {
                                id: manualId,
                                isManualRoomingItem: true,
                                pendienteValoracion: true,
                                excludeFromEconomicTotals: true,
                                type: stay.tipo || stay.type || 'tipo-desconocido',
                                pax: parseInt(stay.pax) || 1,
                                dateIn: normalizeRoomingDate(stay.checkIn || stay.dateIn),
                                dateOut: normalizeRoomingDate(stay.checkOut || stay.dateOut),
                                qty: 1,
                                price: 0,
                                total: 0,
                                nights: calculateRoomingNights(stay.checkIn || stay.dateIn, stay.checkOut || stay.dateOut),
                                roomNo: stay.hab || stay.roomNo || '',
                                ocupantes: stay.ocupantes || '',
                                dni: stay.dni || '',
                                observ: stay.observ || stay.observations || '',
                                hotel: stay.hotel || recData['Hotel_Asignado'] || recData['Hotel'] || 'tipo-desconocido',
                                isService: false
                            };

                            if (existingManual) {
                                Object.assign(existingManual, manualItem);
                            } else {
                                finalRoomingList.push(manualItem);
                            }
                        }
                    }
                });

                // Filter out manual rooms that are no longer in rooming
                finalRoomingList = finalRoomingList.filter(item => {
                    if (item.isService) return true;
                    if (item.isManualRoomingItem || item.pendienteValoracion) {
                        return activeManualIds.has(item.id);
                    }
                    return true;
                });

                // Validation of integrity before saving
                for (let i = 0; i < originalList.length; i++) {
                    const orig = originalList[i];
                    if (orig.isService || orig.isManualRoomingItem || orig.pendienteValoracion) continue;
                    const res = finalRoomingList.find(b => b.id === orig.id);
                    if (!res) {
                        throw new Error(`Integridad rota: El bloque económico original con ID ${orig.id} ha desaparecido.`);
                    }
                    
                    const economicKeys = ['qty', 'pax', 'dateIn', 'dateOut', 'nights', 'price', 'total', 'iva', 'regime', 'regimen', 'hotel', 'producto', 'type', 'tipo'];
                    const diffs = [];
                    economicKeys.forEach(k => {
                        const valOrig = orig[k] !== undefined ? String(orig[k]) : '';
                        const valRes = res[k] !== undefined ? String(res[k]) : '';
                        if (valOrig !== valRes) {
                            diffs.push(`${k}: original="${valOrig}", resultado="${valRes}"`);
                        }
                    });
                    if (diffs.length > 0) {
                        console.error("Diferencias económicas detectadas al guardar:", diffs);
                        throw new Error("Se ha bloqueado el guardado porque se detectaron cambios no autorizados en los campos económicos del bloque.");
                    }
                }

                // Preserve original economic totals and metadata
                const paxTotal = recData['Pax.'] || '';
                const cantTotal = recData['Cant.'] || '';
                const habitacionesTotal = recData['Habitaciones'] || '';
                const importeTotal = recData['Importe(*)'] || '0.00';

                // Save back to Firestore
                const updatedObj = {
                    RoomingList_JSON: JSON.stringify(finalRoomingList),
                    "Pax.": paxTotal,
                    "Cant.": cantTotal,
                    "Habitaciones": habitacionesTotal,
                    "Importe(*)": importeTotal
                };
                if (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) {
                    updatedObj.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                } else {
                    updatedObj.updatedAt = new Date();
                }
                await docRef.set(updatedObj, { merge: true });
                lastRoomingSyncErrorMessage = '';

                // Synchronize localStorage.selectedGroup
                const rawGroupData = localStorage.getItem('selectedGroup');
                if (rawGroupData) {
                    try {
                        let group = JSON.parse(rawGroupData);
                        const updatePayload = {
                            RoomingList_JSON: JSON.stringify(finalRoomingList),
                            "Pax.": paxTotal,
                            "Cant.": cantTotal,
                            "Habitaciones": habitacionesTotal,
                            "Importe(*)": importeTotal
                        };
                        
                        let updated = false;
                        if (Array.isArray(group)) {
                            const m = group.find(g => String(g.Reserva || g.id || g.reserva || '').trim() === currentReservaId);
                            if (m) {
                                Object.assign(m, updatePayload);
                                updated = true;
                            }
                        } else {
                            if (group.records && Array.isArray(group.records)) {
                                const m = group.records.find(r => String(r.Reserva || r.id || r.reserva || '').trim() === currentReservaId);
                                if (m) {
                                    Object.assign(m, updatePayload);
                                    updated = true;
                                } else if (group.records.length > 0) {
                                    Object.assign(group.records[0], updatePayload);
                                    updated = true;
                                }
                            }
                            if (!updated || String(group.Reserva || group.id || group.reserva || '').trim() === currentReservaId) {
                                Object.assign(group, updatePayload);
                            }
                        }
                        
                        localStorage.setItem('selectedGroup', JSON.stringify(group));
                    } catch (e) {
                        console.error("Error updating selectedGroup in localStorage:", e);
                    }
                }
            } catch (err) {
                console.error("Error syncing rooming list to Firestore:", err);
                if (err.message !== lastRoomingSyncErrorMessage) {
                    lastRoomingSyncErrorMessage = err.message;
                    alert('No se pudo actualizar la ficha económica desde el rooming: ' + err.message);
                }
            } finally {
                isSyncing = false;
            }
        }

        function discardUnsavedViewChanges() {
            const message = 'Se descartarán únicamente los cambios no guardados de esta pantalla.\n\n' +
                'Los datos ya guardados de la ficha no se modificarán.\n\n¿Desea continuar?';
            if (!confirm(message)) return;

            isDiscardingChanges = true;

            if (saveTimeout) {
                clearTimeout(saveTimeout);
                saveTimeout = null;
            }

            sessionStorage.setItem("discardUnsavedChanges", String(currentReservaId));
            window.location.reload();
        }

        function printReport() {
            const originalTitle = document.title;
            const ref = currentReservaId || '';
            const grupo = document.getElementById('header-grupo').innerText || '';
            const groupRaw = localStorage.getItem('selectedGroup');
            const groupData = groupRaw ? JSON.parse(groupRaw) : {};
            const recData = groupData.records ? (groupData.records[0] || {}) : groupData;
            const hotelName = recData["Hotel_Asignado"] || recData["Hotel"] || groupData["Hotel_Asignado"] || groupData["Hotel"] || "";
            let newTitle = `${ref} - Rooming y Servicios - ${grupo}`;
            if (hotelName) newTitle += ` - ${hotelName}`;
            document.title = newTitle;
            window.print();
            setTimeout(() => { document.title = originalTitle; }, 500);
        }

        // Robust date formatter using parseDate
        function formatD(dtStr) {
            if (!dtStr) return '---';
            const f = parseDate(dtStr);
            if (!f || isNaN(f.getTime())) return dtStr;
            const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
            return days[f.getDay()] + ' ' + f.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'});
        }

        // Extract day and month numbers from a date string (e.g. "Lun 8/6", "Lun 08/06/2026")
        function extractDayMonth(str) {
            if (!str) return null;
            const matches = String(str).match(/\d+/g);
            if (matches && matches.length >= 2) {
                return {
                    day: parseInt(matches[0], 10),
                    month: parseInt(matches[1], 10)
                };
            }
            return null;
        }

        function getDayOfWeek(dtStr) {
            if (!dtStr) return '';
            const f = parseDate(dtStr);
            if (!f || isNaN(f.getTime())) return '';
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            return days[f.getDay()];
        }

        function clearIaError() {
            const errorElement = document.getElementById("ia-error-alert");
            if (errorElement) {
                errorElement.textContent = "";
                errorElement.hidden = true;
            }
        }

        function showIaError(message) {
            const errorElement = document.getElementById("ia-error-alert");
            if (errorElement) {
                errorElement.className = "text-[10px] bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 font-bold mb-3";
                errorElement.setAttribute("role", "alert");
                errorElement.setAttribute("aria-live", "assertive");
                errorElement.textContent = message || "No se ha podido procesar la rooming con IA.";
                errorElement.hidden = false;
            }
        }

        function cleanModelJsonText(value) {
            if (typeof value !== "string") {
                return "";
            }
            return value
                .trim()
                .replace(/^```json\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();
        }

        // Extraction IA logic
        async function processRoomingWithIa() {
            const textarea = document.getElementById('ia-text-input');
            const sourceText = textarea.value;
            const inputVal = sourceText.trim();
            
            if (!inputVal) {
                showIaError('Por favor, pega el texto de la rooming list.');
                return;
            }

            const btn = document.getElementById('ia-submit-btn');
            
            clearIaError();
            btn.disabled = true;
            btn.setAttribute("aria-busy", "true");
            btn.classList.add('bg-slate-400', 'cursor-not-allowed');
            btn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
            btn.innerHTML = '<span>Procesando con IA...</span>';
            textarea.disabled = true;

            const hHotel = document.getElementById('gen-hotel').innerText;
            const gRegimen = document.getElementById('gen-regimen').innerText;
            const finalInDate = window.checkInDateRaw || '';
            const finalOutDate = window.checkOutDateRaw || '';

            // Envolver toda la operación en try/catch/finally para garantizar que
            // el botón siempre se reactiva, incluso si Firestore lanza un error de red.
            try {

            // 1. Obtener los tipos de habitación (económicos) disponibles antes de llamar a la IA
            const docRef = window.db.collection("groups").doc(String(currentReservaId));
            const docSnap = await docRef.get();
            if (!docSnap.exists) {
                showIaError('No se encontró el grupo en la base de datos.');
                return;
            }

            const recData = docSnap.data();
            const storedListStr = recData['RoomingList_JSON'] || '[]';
            
            let originalList = [];
            try {
                originalList = JSON.parse(storedListStr);
            } catch(e) {}
            
            const servicesList = window.RoomingCore.getServiceItems(originalList);
            const economicItems = window.RoomingCore.getAccommodationItems(originalList);

            // Obtener lista de tipos canónicos para inyectarlos en el prompt
            const availableTypes = economicItems
                .map(item => item.product || item.type || item.concepto)
                .filter(Boolean)
                .map(t => window.RoomingCore.getCanonicalRoomType({ type: t }))
                .filter((v, i, a) => a.indexOf(v) === i) // Unique
                .join(", ");

            const prompt = `Analiza el siguiente texto que contiene un listado de habitaciones (Rooming List) enviado por un cliente. Extrae la información en formato JSON estrictamente como un array de objetos de habitación.

INSTRUCCIONES DE EXTRACCIÓN INTELIGENTE:
1. IGNORA DATOS IRRELEVANTES: Omite saludos, despedidas, firmas de correo, correos de hilos antiguos, explicaciones generales del viaje, precios o tarifas de habitaciones, y cualquier texto administrativo que no describa a los ocupantes de las habitaciones.
2. FLEXIBILIDAD DE FORMATOS: El cliente puede enviar los datos en formato de tabla, lista numerada, párrafos narrativos, etc. Extrae la información sin importar el orden de las columnas o cómo esté estructurado el texto.
3. DETECCIÓN DE TIPOS DE HABITACIÓN IMPLÍCITOS Y RESPETO AL TIPO ORIGINAL: 
   - MUY IMPORTANTE: Tenemos registrados los siguientes tipos de habitación en nuestro sistema con precio asignado: [${availableTypes}].
   - Si el texto indica un tipo o código de habitación (ej: "D.STD", "SGL", "DUI", "DOBLE", "TPL", etc.), INTENTA emparejarlo lógicamente con uno de los tipos de nuestra lista (por ejemplo, si dice "D.STD" o "Hab. Doble Uso Individual", y en la lista está "hab-doble-uso-individual" o similar, devuelve ese valor exacto de la lista).
   - Si no puedes emparejarlo con seguridad, captura exactamente el texto original en el campo "type", sin traducirlo.
   - SÓLO si no se especifica absolutamente nada sobre el tipo de habitación, dedúcelo del número de ocupantes:
     * 1 ocupante -> "Individual"
     * 2 ocupantes -> "Doble"
     * 3 ocupantes -> "Triple"
     * 4 ocupantes -> "Cuádruple"
4. SEPARACIÓN DE NOMBRE Y DNI: Aísla los nombres de los ocupantes de sus DNIs. Si el DNI viene pegado al nombre (ej: "Juan Pérez (DNI: 12345678A)" o "Juan Pérez 12345678A"), limpia el nombre para que quede únicamente "Juan Pérez" y asigna "12345678A" en el campo "dni".
5. MÚLTIPLES OCUPANTES EN UNA HABITACIÓN: Concatena los nombres en el campo "ocupantes" separados por salto de línea ("\\n"). Concatena sus DNIs correspondientes en el campo "dni" en el mismo orden, separados por punto y coma (";"). Si a alguno le falta el DNI, pon "Pendiente" para ese ocupante.
6. OBSERVACIONES: Captura peticiones específicas como "cama de matrimonio", "movilidad reducida", "alergia al gluten", "plazas delanteras en autobús", etc., y colócalas en el campo "observ".

CAMPOS DEL JSON PARA CADA HABITACIÓN:
- "roomNo": número o identificador de habitación. Si no viene en el texto, genéralo correlativamente ("1", "2", "3"...).
- "type": tipo de habitación (ej: "Doble", "Individual", "Triple").
- "pax": número de ocupantes en esa habitación (ej: 1, 2, 3).
- "ocupantes": nombres de los ocupantes (separados por salto de línea "\\n" si son varios).
- "dni": DNIs de los ocupantes (separados por punto y coma ";" si son varios). Si no está disponible, pon "Pendiente".
- "observ": observaciones especiales de la habitación o personas. Si no hay, pon "".

Usa estos datos por defecto para rellenar las propiedades de cada habitación si no se especifica otra cosa en el texto:
- hotel: "${hHotel}"
- dateIn: "${finalInDate}"
- dateOut: "${finalOutDate}"
- regime: "${gRegimen}"

Reglas obligatorias para fechas:
- Si el texto contiene encabezados o bloques de fechas, aplica cada rango a todas las habitaciones siguientes hasta encontrar un nuevo encabezado.
- Cada objeto debe incluir siempre "dateIn" y "dateOut" en formato YYYY-MM-DD.
- No fusiones habitaciones por nombre de huésped: cada habitación/fila del listado debe ser un objeto independiente.

Responde UNICAMENTE con el bloque de código JSON, sin explicaciones ni texto de markdown adicional (debe empezar con [ y terminar con ]).

TEXTO DEL LISTADO ENVIADO POR EL CLIENTE:
${inputVal}`;

                if (!window.callGemini) {
                    throw new Error('La API de Gemini no está disponible. Verifica que la API Key esté configurada en el panel del administrador.');
                }
                
                const aiResult = await window.callGemini(prompt);
                
                if (!aiResult?.ok) {
                    throw new Error(aiResult?.error || "No se ha podido conectar con el servicio de IA.");
                }

                const cleanedText = cleanModelJsonText(aiResult.text);

                let parsedList;
                try {
                  parsedList = JSON.parse(cleanedText);
                } catch (error) {
                  console.error("El texto generado por Gemini no contiene JSON válido:", {
                    text: aiResult.text,
                    cleanedText,
                    error
                  });
                  throw new Error("La IA no ha devuelto una rooming con un formato válido.");
                }

                const rawRooms = Array.isArray(parsedList)
                  ? parsedList
                  : parsedList?.rooms ||
                    parsedList?.habitaciones ||
                    parsedList?.data?.rooms ||
                    parsedList?.data?.habitaciones;

                if (!Array.isArray(rawRooms)) {
                    throw new Error("La respuesta de la IA no contiene una lista válida de habitaciones.");
                }

                const validRooms = rawRooms.filter((room) => {
                  return room && typeof room === "object";
                });

                // Convertir la salida de Gemini a registros de rooming canónicos (1 fila = 1 hab, qty 1)
                const newList = validRooms.map(item => {
                    const rowDateIn = window.RoomingCore.normalizeRoomingDate(item.dateIn || finalInDate);
                    const rowDateOut = window.RoomingCore.normalizeRoomingDate(item.dateOut || finalOutDate);
                    return {
                        id: item.id || Date.now() + Math.random(),
                        hotel: item.hotel || hHotel,
                        type: window.RoomingCore.normalizeRoomType(item.type || 'Habitación Doble'),
                        dateIn: rowDateIn,
                        dateOut: rowDateOut,
                        qty: 1, // REGLA: qty = 1 para cada habitación física
                        pax: parseInt(item.pax) || 2,
                        regime: item.regime || gRegimen,
                        isService: false,
                        ocupantes: window.RoomingCore.normalizeOccupants(item.ocupantes || ''),
                        dni: item.dni || '',
                        observ: item.observ || '',
                        roomNo: window.RoomingCore.normalizeRoomNumber(item.roomNo || ''),
                        source: 'auto_rooming',
                        generatedFrom: 'rooming_ai',
                        generatedAt: new Date().toISOString()
                    };
                });

                // Separar ítems económicos (los que tienen precio, isEconomicRepresentation:true)
                // de los ítems de tracking de habitaciones (room assignments individuales)
                const economicRepresentationItems = originalList.filter(item =>
                    item && item.isEconomicRepresentation === true
                );
                const nonEconomicAccommodationItems = originalList.filter(item =>
                    item && item.isEconomicRepresentation !== true && !window.RoomingCore.isAccommodationItem(item)
                );

                // combinedList = nuevas habitaciones (IA) + ítems económicos originales (precios) + servicios
                // IMPORTANTE: Los ítems económicos se conservan intactos para no borrar los precios
                const combinedList = [...newList, ...economicRepresentationItems, ...servicesList];

                // Preservar la estructura económica asignando el precio previo por categoría.
                // Usamos los economicItems para extraer el precio canónico.
                const blockDetails = {};
                economicItems.forEach(item => {
                    const key = window.RoomingCore.getCanonicalRoomType(item);
                    if (!key) return;
                    blockDetails[key] = {
                        price: window.RoomingCore.parsePositiveNumber(item.price),
                        iva: window.RoomingCore.parsePositiveNumber(item.iva)
                    };
                });

                combinedList.forEach(item => {
                    // Solo intentar asignar precio a las habitaciones generadas por IA (tracking items)
                    // Los ítems económicos originales (isEconomicRepresentation:true) ya tienen su precio
                    if (item.isEconomicRepresentation === true) return;

                    if (window.RoomingCore.isAccommodationItem(item)) {
                        const typeKey = window.RoomingCore.getCanonicalRoomType(item);
                        let match = blockDetails[typeKey];
                        if (!match) {
                            const matchingKey = Object.keys(blockDetails).find(k => k.includes(typeKey) || typeKey.includes(k));
                            if (matchingKey) match = blockDetails[matchingKey];
                        }
                        
                        if (match && Number.isFinite(match.price) && match.price > 0) {
                            item.price = match.price;
                            item.iva = match.iva;
                            const itemNights = window.RoomingCore.calculateRoomingNights(item.dateIn, item.dateOut);
                            item.nights = itemNights;
                            item.total = (1 * match.price * itemNights).toFixed(2);
                        }
                        // Si no hay match, el ítem de tracking no tiene precio propio (el precio está en los ítems económicos)
                    }
                });

                // Recalculate totals
                const newTotalRooms = window.RoomingCore.calculateMaxDailyRooms(newList);
                const newTotalPax = window.RoomingCore.calculateMaxDailyOccupancy(newList);
                const newTotalSum = combinedList.reduce((acc, r) => acc + (parseFloat(r.total) || 0), 0);

                await docRef.set({
                    RoomingList_JSON: JSON.stringify(combinedList),
                    "Pax.": newTotalPax.toString(),
                    "Cant.": newTotalRooms.toString(),
                    "Habitaciones": `${newTotalRooms} habitaciones`,
                    "Importe(*)": newTotalSum.toFixed(2),
                    "updatedAt": firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                const rawGroupData = localStorage.getItem('selectedGroup');
                if (rawGroupData) {
                    try {
                        let group = JSON.parse(rawGroupData);
                        const updatePayload = {
                            RoomingList_JSON: JSON.stringify(combinedList),
                            "Pax.": newTotalPax.toString(),
                            "Cant.": newTotalRooms.toString(),
                            "Habitaciones": `${newTotalRooms} habitaciones`,
                            "Importe(*)": newTotalSum.toFixed(2)
                        };
                        
                        let updated = false;
                        if (Array.isArray(group)) {
                            const match = group.find(g => String(g.Reserva || g.id || g.reserva || '').trim() === currentReservaId);
                            if (match) {
                                Object.assign(match, updatePayload);
                                updated = true;
                            }
                        } else {
                            if (group.records && Array.isArray(group.records)) {
                                const match = group.records.find(r => String(r.Reserva || r.id || r.reserva || '').trim() === currentReservaId);
                                if (match) {
                                    Object.assign(match, updatePayload);
                                    updated = true;
                                } else if (group.records.length > 0) {
                                    Object.assign(group.records[0], updatePayload);
                                    updated = true;
                                }
                            }
                            if (!updated || String(group.Reserva || group.id || group.reserva || '').trim() === currentReservaId) {
                                Object.assign(group, updatePayload);
                            }
                        }
                        
                        localStorage.setItem('selectedGroup', JSON.stringify(group));
                    } catch (e) {}
                }

                localStorage.removeItem('roomingServicios_' + currentReservaId);

                const errorElement = document.getElementById("ia-error-alert");
                if (errorElement) {
                    errorElement.className = "text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg p-3 font-bold mb-3";
                    errorElement.setAttribute("role", "status");
                    errorElement.setAttribute("aria-live", "polite");
                    errorElement.textContent = '✅ Rooming List importada y estructurada con IA con éxito.';
                    errorElement.hidden = false;
                }

                setTimeout(() => {
                    closeIaModal();
                    window.location.reload();
                }, 1500);

            } catch (err) {
                console.error("Error al extraer la rooming con IA:", err);
                showIaError(err?.message || "No se ha podido procesar la rooming con IA.");
                textarea.value = sourceText;
            } finally {
                btn.disabled = false;
                btn.removeAttribute("aria-busy");
                btn.classList.remove('bg-slate-400', 'cursor-not-allowed');
                btn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
                btn.innerHTML = '<span>Extraer con IA</span>';
                textarea.disabled = false;
            }
        }

        // Reader handler for PDF, DOCX or TXT files
        async function handleFileSelect(e) {
            const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
            if (!files || files.length === 0) return;
            const file = files[0];
            
            const statusDiv = document.getElementById('file-upload-status');
            const textarea = document.getElementById('ia-text-input');
            
            statusDiv.classList.remove('hidden');
            statusDiv.innerText = `Cargando "${file.name}"...`;
            
            try {
                let text = '';
                const ext = file.name.split('.').pop().toLowerCase();
                
                if (ext === 'docx') {
                    if (typeof mammoth === 'undefined') {
                        throw new Error('La librería Mammoth.js no está lista.');
                    }
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                    text = result.value || '';
                } else if (ext === 'pdf') {
                    if (typeof pdfjsLib === 'undefined') {
                        throw new Error('La librería PDF.js no está lista.');
                    }
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    let textParts = [];
                    for (let j = 1; j <= pdf.numPages; j++) {
                        const page = await pdf.getPage(j);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        textParts.push(pageText);
                    }
                    text = textParts.join('\n');
                } else {
                    // Text files, CSV, etc.
                    text = await file.text();
                }
                
                if (text && text.trim()) {
                    textarea.value = text;
                    statusDiv.innerHTML = `<span class="text-emerald-600">✅ ¡"${file.name}" cargado! Revisa el texto e inicia la extracción con el botón inferior.</span>`;
                } else {
                    statusDiv.innerHTML = `<span class="text-amber-500">⚠️ No se extrajo texto legible de "${file.name}".</span>`;
                }
            } catch (err) {
                console.error(err);
                statusDiv.innerHTML = `<span class="text-red-500">❌ Error al leer "${file.name}": ${err.message}</span>`;
            }
        }

        document.addEventListener('DOMContentLoaded', async () => {
            const params = new URLSearchParams(window.location.search || '');
            const reservaFromUrl = String(params.get('reserva') || params.get('id') || '').trim();
            const reservaFromStorage = String(localStorage.getItem('nexus_open_ficha') || localStorage.getItem('nexus_return_reserva') || '').trim();
            let rawGroupData = localStorage.getItem('selectedGroup');
            let group = null;

            if (rawGroupData) {
                try {
                    group = JSON.parse(rawGroupData);
                } catch (e) {
                    group = null;
                }
            }

            if (!group && window.db && (reservaFromUrl || reservaFromStorage)) {
                const fallbackReserva = (reservaFromUrl || reservaFromStorage).replace(/\.0$/, "");
                try {
                    const docSnap = await window.db.collection("groups").doc(fallbackReserva).get();
                    if (docSnap.exists) {
                        const data = docSnap.data();
                        group = {
                            ...data,
                            id: fallbackReserva,
                            records: [{ ...data, Reserva: data.Reserva || fallbackReserva }]
                        };
                        localStorage.setItem('selectedGroup', JSON.stringify(group));
                    }
                } catch (e) {
                    console.error("Error recovering selected group for Rooming y Servicios:", e);
                }
            }

            if (!group) {
                document.getElementById('document-area').innerHTML = `
                    <div class="p-12 text-center text-red-500 font-bold">
                        Error: No se ha seleccionado ningún grupo desde la pantalla de Gestión.<br>
                        <span class="text-slate-500 text-xs font-normal">Abre esta pantalla desde la ficha del grupo o usa Rooming-Servicios.html?reserva=XXXXX.</span>
                    </div>
                `;
                return;
            }

            let rec = group.records ? (group.records[0] || {}) : group;
            currentReservaId = String(rec['Reserva'] || group.id || group.reserva || 'unknown').trim();

            // Try to load the most up-to-date data from Firestore to prioritize its fields
            if (currentReservaId !== "unknown" && window.db) {
                try {
                    const docSnap = await window.db.collection("groups").doc(currentReservaId).get();
                    if (docSnap.exists) {
                        const firestoreData = docSnap.data();
                        
                        // Find the target object within group structure for precise merging
                        let targetObj = null;
                        let updated = false;
                        if (Array.isArray(group)) {
                            targetObj = group.find(g => String(g.Reserva || g.id || g.reserva || '').trim() === currentReservaId);
                            if (targetObj) updated = true;
                        } else {
                            if (group.records && Array.isArray(group.records)) {
                                targetObj = group.records.find(r => String(r.Reserva || r.id || r.reserva || '').trim() === currentReservaId);
                                if (targetObj) {
                                    updated = true;
                                } else if (group.records.length > 0) {
                                    targetObj = group.records[0];
                                    updated = true;
                                }
                            }
                            if (!updated || String(group.Reserva || group.id || group.reserva || '').trim() === currentReservaId) {
                                targetObj = group;
                            }
                        }

                        // Merge logic favoring Firestore for specific updated fields, but not overriding with empty values if local is valid
                        const fieldsToUpdate = [
                            'RoomingList_JSON', 'Servicios_JSON', 'Pax.', 'Cant.', 'Habitaciones',
                            'Importe(*)', 'Com_Notas', 'Observaciones', 'Entrada', 'Salida',
                            'Régimen', 'Hotel_Asignado', 'Hotel'
                        ];
                        fieldsToUpdate.forEach(key => {
                            const remoteValue = firestoreData[key];
                            if (remoteValue !== undefined && remoteValue !== null) {
                                const localValue = targetObj[key];
                                // Check if local has a non-empty value and remote is empty
                                if (localValue && localValue !== "" && localValue !== "[]" && (remoteValue === "" || remoteValue === "[]")) {
                                    // Do not overwrite local valid value with empty/undefined/null remote value
                                } else {
                                    targetObj[key] = remoteValue;
                                }
                            }
                        });
                        
                        // Merge remaining Firestore data to keep local storage in sync, also preventing overwriting local valid with empty values
                        Object.keys(firestoreData).forEach(key => {
                            if (firestoreData[key] !== undefined && firestoreData[key] !== null) {
                                const localVal = targetObj[key];
                                if (!(localVal && localVal !== "" && localVal !== "[]" && (firestoreData[key] === "" || firestoreData[key] === "[]"))) {
                                    targetObj[key] = firestoreData[key];
                                }
                            }
                        });
                        
                        rec = group.records ? (group.records[0] || {}) : group;
                        localStorage.setItem('selectedGroup', JSON.stringify(group));
                    }
                } catch (e) {
                    console.error("Error fetching updated group from Firestore:", e);
                }
            }
            
            // Set static/calculated headers
            document.getElementById('header-reserva').innerText = currentReservaId;
            const hHotel = rec['Hotel_Asignado'] || rec['Hotel'] || 'Sercotel Guadiana';
            document.getElementById('header-hotel').innerText = hHotel;
            document.getElementById('gen-hotel').innerText = hHotel;
            
            const today = new Date();
            document.getElementById('header-date').innerText = today.toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'});

            // Save raw checkin/checkout globally for IA prompts
            const checkInDate = rec['Entrada'] || group.arrival || '';
            const checkOutDate = rec['Salida'] || group.departure || '';
            window.checkInDateRaw = checkInDate;
            window.checkOutDateRaw = checkOutDate;
            departmentSummaryState = normalizeDepartmentSummary(rec.departmentSummary || group.departmentSummary || {});
            departmentSummaryLayout = normalizeDepartmentSummary(rec.departmentSummaryLayout || group.departmentSummaryLayout || {});
            applyDepartmentSummaryLayout();

            const discardReservationId = sessionStorage.getItem("discardUnsavedChanges");
            let savedStateStr = null;
            
            if (discardReservationId === String(currentReservaId)) {
                sessionStorage.removeItem("discardUnsavedChanges");
                console.log("[DESCARTAR CAMBIOS] Vista restaurada desde datos persistidos");
                // Ignorar exclusivamente cualquier borrador de esta vista
            } else {
                savedStateStr = localStorage.getItem('roomingServicios_' + currentReservaId);
            }

            let loadRoomingFromCache = false;
            let cachedRooming = [];
            let cachedServicios = [];
            let cachedPendientes = [];
            let forceRegenerateServices = false;
            
            if (savedStateStr) {
                const s = JSON.parse(savedStateStr);
                if (s.departmentSummary) {
                    departmentSummaryState = normalizeDepartmentSummary(s.departmentSummary);
                } else if (s.deptRecepcion || s.deptRestaurante || s.deptAdministracion) {
                    departmentSummaryState = {
                        reception: { content: s.deptRecepcion || '', manualOverride: true, updatedAt: new Date().toISOString(), updatedBy: '' },
                        kitchen: { content: s.deptRestaurante || '', manualOverride: true, updatedAt: new Date().toISOString(), updatedBy: '' },
                        admin: { content: s.deptAdministracion || '', manualOverride: true, updatedAt: new Date().toISOString(), updatedBy: '' }
                    };
                }
                if (s.departmentSummaryLayout) {
                    departmentSummaryLayout = normalizeDepartmentSummary(s.departmentSummaryLayout);
                }

                cachedRooming = s.rooming || [];
                cachedServicios = s.servicios || [];
                cachedPendientes = s.pendientes || [];

                if (!s.restoreServices && s.servicesGenerationVersion === SERVICES_GENERATION_VERSION) {
                    // LOAD FROM LOCAL STORAGE CACHE
                    document.getElementById('header-grupo').innerText = s.headerGrupo || '---';
                    document.getElementById('gen-contacto').innerText = s.genContacto || '---';
                    document.getElementById('gen-entrada').innerText = s.genEntrada || '---';
                    document.getElementById('gen-salida').innerText = s.genSalida || '---';
                    document.getElementById('gen-habitaciones').innerText = s.genHabitaciones || '---';
                    document.getElementById('gen-pax').innerText = s.genPax || '0';
                    document.getElementById('gen-regimen').innerText = s.genRegimen || '---';
                    document.getElementById('gen-estado-critico').innerText = s.genEstadoCritico || '---';
                    document.getElementById('dept-recepcion').innerHTML = s.deptRecepcion || '';
                    document.getElementById('dept-restaurante').innerHTML = s.deptRestaurante || '';
                    document.getElementById('dept-administracion').innerHTML = s.deptAdministracion || '';
                    applyDepartmentSummaryState();

                    if (s.pendientes && s.pendientes.length > 0) {
                        s.pendientes.forEach(p => addRowPendiente(p.pendiente, p.detalle, p.limite, p.responsable));
                    }
                    if (s.servicios && s.servicios.length > 0) {
                        s.servicios.forEach(sv => addRowServicio(sv.fecha, sv.servicio, sv.regimen, sv.paxHab, sv.hora, sv.notes || sv.notas, sv));
                    }
                    if (s.rooming && s.rooming.length > 0) {
                        s.rooming.forEach(r => addRowRooming(r.id || '', r.hab, r.tipo, r.pax, r.ocupantes, r.dni, r.observ, r.checkIn || r.dateIn, r.checkOut || r.dateOut));
                    }
                    return;
                } else {
                    if (s.servicesGenerationVersion !== SERVICES_GENERATION_VERSION) {
                        forceRegenerateServices = true;
                        loadRoomingFromCache = true;
                        console.log(`[ROOMING] Cache version mismatch (${s.servicesGenerationVersion} vs ${SERVICES_GENERATION_VERSION}). Will regenerate services while preserving manual edits.`);
                    } else {
                        loadRoomingFromCache = true;
                    }
                }
            }

            // AUTO-GENERATE FROM FIRESTORE RECORD
            const gName = rec['Nombre del Grupo'] || group.name || '---';
            const gContacto = rec['Persona_Contacto'] || rec['Com_Nombre_Contacto'] || '---';
            
            const checkInLabel = checkInDate ? `${getDayOfWeek(checkInDate)} ${formatD(checkInDate)}` : '---';
            const checkOutLabel = checkOutDate ? `${getDayOfWeek(checkOutDate)} ${formatD(checkOutDate)}` : '---';

            document.getElementById('header-grupo').innerText = gName;
            document.getElementById('gen-contacto').innerText = gContacto;
            document.getElementById('gen-entrada').innerText = checkInLabel;
            document.getElementById('gen-salida').innerText = checkOutLabel;

            const gRegimen = rec['Régimen'] || group.regimen || 'AD';
            document.getElementById('gen-regimen').innerText = gRegimen;

            // Parse rooming list first
            let roomingList = [];
            try {
                roomingList = JSON.parse(rec['RoomingList_JSON'] || '[]');
            } catch(e) {
                roomingList = [];
            }
            
            // Keep a copy of original nightly blocks before merging/consolidation
            const originalNightlyBlocks = JSON.parse(JSON.stringify(roomingList.filter(RoomingCore.isAccommodationItem)));

            // Run central grouping and merging function to ensure per-stay rooms
            roomingList = groupAndMergeRoomingList(roomingList, checkInDate, checkOutDate);

            // Count rooms and types using daily peak occupancy (to avoid duplicates from multi-day stays)
            let totalRooms = 0;
            let roomCountsByType = {};
            let chefMissingName = false;
            let maxDailyPax = 0;

            // Determine if the list is already expanded with occupants (each room has its own row in the JSON list)
            // If the JSON list still has items with qty > 1, then it represents room blocks and is NOT fully expanded yet.
            let isExpandedList = roomingList.some(item => RoomingCore.isAccommodationItem(item) && (item.ocupantes || item.roomNo)) &&
                                 !roomingList.some(item => RoomingCore.isAccommodationItem(item) && getRoomLineQuantity(item, 1) > 1);

            // Calculate peak daily room and pax counts using central core function
            const dailyCounts = RoomingCore.calculateDailyOccupancy(originalNightlyBlocks);
            const dailyMovements = RoomingCore.calculateDailyMovements(originalNightlyBlocks);

            // Find peak values
            Object.values(dailyCounts).forEach(dayData => {
                if (dayData.total > totalRooms) {
                    totalRooms = dayData.total;
                }
                if (dayData.totalPax > maxDailyPax) {
                    maxDailyPax = dayData.totalPax;
                }
                Object.entries(dayData.byType).forEach(([type, count]) => {
                    roomCountsByType[type] = Math.max(roomCountsByType[type] || 0, count);
                });
            });

            // Fallback if no dates were parsed
            if (Object.keys(dailyCounts).length === 0) {
                roomingList.forEach(item => {
                    if (!RoomingCore.isAccommodationItem(item)) return;
                    const rType = (item.type || 'Habitación').toLowerCase();
                    let canonicalType = 'Doble';
                    if (rType.includes('ind') || rType.includes('dui') || rType.includes('uso individual')) {
                        canonicalType = 'Individual';
                    }
                    const qty = isExpandedList ? 1 : getRoomLineQuantity(item, 1);
                    const paxVal = parseInt(item.pax) || (canonicalType === 'Individual' ? 1 : (canonicalType === 'Triple' ? 3 : (canonicalType === 'Cuádruple' ? 4 : 2)));
                    totalRooms += qty;
                    maxDailyPax += (qty * paxVal);
                    roomCountsByType[canonicalType] = (roomCountsByType[canonicalType] || 0) + qty;
                });
            }

            // Set final totalPax using daily peak
            const totalPax = maxDailyPax || parseInt(rec['Pax.'] || group.totalPax || 0);
            document.getElementById('gen-pax').innerText = totalPax;

            const getServiceOccupancy = (serviceName, serviceDate) => {
                const key = normalizeRoomingDate(serviceDate);
                const movement = dailyMovements[key];
                if (!movement) return { pax: 0, rooms: 0 };
                const normalizedName = String(serviceName || '').toLowerCase();
                if (normalizedName.includes('desayuno')) return { ...movement.breakfast };
                if (normalizedName.includes('llegada')) return { ...movement.arrivals };
                if (normalizedName.includes('salida')) return { ...movement.departures };
                return { ...movement.overnight };
            };

            const refreshBreakfastServiceOccupancy = () => {
                document.querySelectorAll('#table-servicios tbody tr').forEach(tr => {
                    const cells = tr.querySelectorAll('td.editable');
                    if (cells.length < 4) return;
                    const serviceName = (cells[1].innerText || '').trim();
                    if (!serviceName.toLowerCase().includes('desayuno')) return;
                    const dateMatch = (cells[0].innerText || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
                    if (!dateMatch) return;
                    let [, day, month, year] = dateMatch;
                    year = parseInt(year, 10);
                    if (year < 100) year += 2000;
                    const serviceIso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const serviceOccupancy = getServiceOccupancy('Desayuno', serviceIso);
                    if (serviceOccupancy.pax > 0) {
                        cells[3].innerText = `${serviceOccupancy.pax} pax`;
                    }
                });
            };

            let listToDisplay = [];
            let autoIdx = 1;

            // groupAndMergeRoomingList (from rooming-core.js) is the single source of truth for ALL
            // rendering paths — both expanded (individual-room) lists and block-level lists.
            // It returns one consolidated stay per physical room-slot, correctly merged across nights.
            roomingList.forEach(item => {
                if (!RoomingCore.isAccommodationItem(item)) return;

                const occName = (item.ocupantes || '').trim();
                let finalOcc = occName;

                if (!finalOcc) {
                    const typeUpper = (item.type || '').toUpperCase();
                    if (typeUpper.includes('CHOFER') || typeUpper.includes('CHÓFER') ||
                        typeUpper.includes('DRIVER') || typeUpper.includes('GUIA') || typeUpper.includes('GUÍA')) {
                        finalOcc = 'Chofer / Guía';
                        chefMissingName = true;
                    } else {
                        finalOcc = 'Ocupante Pendiente';
                    }
                }

                listToDisplay.push({
                    // Preserve the structured id for syncing back to Firestore
                    id: item.consolidatedId || item.id || ('new_' + Date.now() + '_' + Math.random()),
                    // Store originalIds as a serialised JSON string in dataset so syncRoomingToFirestore can read it
                    originalIds: item.originalIds || [item.originalId || item.id],
                    hab: item.roomNo || autoIdx++,
                    tipo: item.type,
                    pax: item.pax || 2,
                    checkIn: item.checkIn || item.dateIn || checkInDate,
                    checkOut: item.checkOut || item.dateOut || checkOutDate,
                    ocupantes: finalOcc,
                    dni: item.dni || '',
                    observ: item.observ || ''
                });
            });

            // Rooms label text
            let roomSummaryParts = [];
            Object.entries(roomCountsByType).forEach(([type, count]) => {
                roomSummaryParts.push(`${count} ${type.toLowerCase()}s`);
            });
            const roomsText = `${totalRooms} total: ` + (roomSummaryParts.length > 0 ? roomSummaryParts.join(' + ') : '---');
            document.getElementById('gen-habitaciones').innerText = roomsText;

            // Output Rooming Table Rows
            if (loadRoomingFromCache) {
                cachedRooming.forEach(r => {
                    addRowRooming(r.id || '', r.hab, r.tipo, r.pax, r.ocupantes, r.dni, r.observ,
                        r.checkIn || r.dateIn, r.checkOut || r.dateOut, r.originalIds || null);
                });
            } else {
                listToDisplay.forEach(r => {
                    addRowRooming(r.id || '', r.hab, r.tipo, r.pax, r.ocupantes, r.dni, r.observ,
                        r.checkIn || r.dateIn, r.checkOut || r.dateOut, r.originalIds || null);
                });
            }

            // Pax consistency validation
            const storedContracted = parseInt(rec['Pax.'] || group.totalPax || 0);
            const maxDaily = calculateMaxDailyOccupancy(roomingList);
            const personNights = calculatePersonNights(roomingList);
            const isConsistent = isStoredPaxConsistent(storedContracted, maxDaily, personNights);

            if (!isConsistent && storedContracted > 0) {
                window.paxInconsistencyAlert = {
                    msg: `<strong>Inconsistencia de Pax:</strong> El pax contratado (${storedContracted}) no coincide con la ocupación simultánea máxima (${maxDaily}). Pico diario máximo: ${maxDaily} pax. Personas-noche: ${personNights}.`,
                    opPax: maxDaily,
                    storedPax: storedContracted,
                    personNights: personNights
                };
            } else {
                window.paxInconsistencyAlert = null;
            }

            // Render alert banner and incidences
            renderRoomingIncidences(roomingList);

            // Set up Pending List
            // 1. Payment Pending (subtracting agency commission if applicable)
            const totalRevenue = parseMoney(rec['Importe(*)'] || group.totalRevenue || 0);
            let totalCommission = 0;
            try {
                totalCommission = roomingList.reduce((acc, i) => acc + (parseFloat(i.comision && i.comision.total_comision) || 0), 0);
            } catch(e) {}
            
            const netTotal = Math.max(0, totalRevenue - totalCommission);
            
            let paidAmount = 0;
            try {
                const plan = JSON.parse(rec['PaymentPlan_JSON'] || '[]');
                paidAmount = plan.filter(p => p.status === "Cobrado").reduce((acc, p) => acc + parseMoney(p.amount), 0);
            } catch(e) {
                paidAmount = parseMoney(rec['Com_Pagado'] || 0);
            }
            const pendingAmount = Math.max(0, netTotal - paidAmount);
            const isOverpaid = paidAmount > netTotal + 0.01;
            const refundAmount = isOverpaid ? paidAmount - netTotal : 0;
            
            if (isOverpaid) {
                addRowPendiente(
                    'Devolución pendiente',
                    `Cobro de más detectado: ${refundAmount.toLocaleString('es-ES', {style:'currency', currency:'EUR'})}. Aceptada devolución del sobrante.`,
                    'Inmediato',
                    'Administración'
                );
            }
            
            if (pendingAmount > 0.05) {
                let deadline = '---';
                try {
                    const plan = JSON.parse(rec['PaymentPlan_JSON'] || '[]');
                    const pendingRow = plan.find(p => p.status !== "Cobrado");
                    if (pendingRow && pendingRow.date) deadline = formatD(pendingRow.date);
                } catch(e) {}
                if (deadline === '---' && rec['Com_Vencimiento_Rel']) {
                    deadline = formatD(rec['Com_Vencimiento_Rel']);
                }
                const detailsText = totalCommission > 0 
                    ? `Importe pendiente: ${pendingAmount.toLocaleString('es-ES', {minimumFractionDigits:2})} € &bull; total neto: ${netTotal.toLocaleString('es-ES', {minimumFractionDigits:2})} € &bull; anticipo cobrado: ${paidAmount.toLocaleString('es-ES', {minimumFractionDigits:2})} € (bruto: ${totalRevenue.toLocaleString('es-ES', {minimumFractionDigits:2})} €)`
                    : `Importe pendiente: ${pendingAmount.toLocaleString('es-ES', {minimumFractionDigits:2})} € &bull; total reserva: ${totalRevenue.toLocaleString('es-ES', {minimumFractionDigits:2})} € &bull; anticipo cobrado: ${paidAmount.toLocaleString('es-ES', {minimumFractionDigits:2})} €`;
                addRowPendiente(
                    'Último pago',
                    detailsText,
                    deadline,
                    'Administración / Comercial'
                );
            }

            // 2. Breakfast hours
            const needsBreakfast = gRegimen.toUpperCase().includes('AD') || gRegimen.toUpperCase().includes('HD') || gRegimen.toUpperCase().includes('MP') || gRegimen.toUpperCase().includes('PC');
            
            const dIn = parseDate(checkInDate);
            const dOut = parseDate(checkOutDate);
            let osPlanRows = [];
            try {
                const osDataStr = localStorage.getItem('ordenServicio_' + currentReservaId);
                if (osDataStr) {
                    const osData = JSON.parse(osDataStr);
                    osPlanRows = osData.planRows || [];
                }
            } catch(e) {
                console.error('Error loading Service Order planRows:', e);
            }

            let missingBreakfastHours = false;
            if (needsBreakfast && dIn && !isNaN(dIn.getTime()) && dOut && !isNaN(dOut.getTime())) {
                const nights = Math.ceil((dOut - dIn) / (86400000));
                for (let i = 1; i <= nights; i++) {
                    const breakfastDate = new Date(dIn);
                    breakfastDate.setDate(breakfastDate.getDate() + i);
                    const label = formatD(breakfastDate);
                    const targetDM = extractDayMonth(label);

                    const match = osPlanRows.find(row => {
                        const rowDM = extractDayMonth(row.dia);
                        return rowDM && targetDM && rowDM.day === targetDM.day && rowDM.month === targetDM.month && (row.serv || '').trim().toLowerCase() === 'desayuno';
                    });

                    if (!match || !match.hora || match.hora.trim() === '___:___ h' || match.hora.trim().toUpperCase() === 'PENDIENTE') {
                        missingBreakfastHours = true;
                        break;
                    }
                }
            }

            if (needsBreakfast && missingBreakfastHours) {
                addRowPendiente(
                    'Horas de desayuno',
                    'Faltan horarios previstos para coordinar restaurante sala de desayunos.',
                    'Antes de la llegada',
                    'Cliente / Restaurante'
                );
            }

            // 3. Diet alternatives
            let dietNotes = [];
            const rawNotas = rec['Com_Notas'] || group.notes || '';
            const allNotesText = (rawNotas + ' ' + roomingList.map(r => r.observ || '').join(' ')).toLowerCase();
            
            if (allNotesText.includes('pescado') || allNotesText.includes('bonito') || allNotesText.includes('alerg') || allNotesText.includes('vege') || allNotesText.includes('sin ')) {
                addRowPendiente(
                    'Dietas especiales',
                    'Se detectan observaciones de dietas o alergias. Identificar ocupante y habitación.',
                    'Antes del primer servicio',
                    'Cliente / Cocina'
                );
            }

            if (chefMissingName) {
                addRowPendiente(
                    'Nombre de chofer/guía',
                    'Falta confirmar nombre del chofer del grupo.',
                    'Check-in',
                    'Recepción / Comercial'
                );
            }

            // Calculate critical status dynamically based on pending tasks
            const pendingTasks = [];
            document.querySelectorAll('#table-pendientes tbody tr').forEach(tr => {
                const cells = tr.querySelectorAll('td.editable');
                if (cells.length === 4) {
                    pendingTasks.push(cells[0].innerText.trim().toLowerCase());
                }
            });

            const statusEl = document.getElementById('gen-estado-critico');
            if (statusEl) {
                if (pendingTasks.length === 0) {
                    statusEl.innerText = 'Operativa confirmada y todo pagado';
                    statusEl.className = 'editable text-emerald-700 font-bold';
                } else {
                    const uniqueTasks = Array.from(new Set(pendingTasks));
                    const prettyTasks = uniqueTasks.map(t => {
                        if (t.includes('pago') || t.includes('devolución')) return 'pago';
                        if (t.includes('hora')) return 'horarios';
                        if (t.includes('dieta')) return 'dietas';
                        if (t.includes('chofer') || t.includes('guía')) return 'chofer/guía';
                        return t;
                    });
                    statusEl.innerText = 'Pendiente: ' + prettyTasks.join(', ');
                    statusEl.className = 'editable text-rose-700 font-bold';
                }
            }

            // Set up Services Table
            
            if (dIn && !isNaN(dIn.getTime()) && dOut && !isNaN(dOut.getTime()) && dOut > dIn) {
                const autoServices = [];
                const nights = Math.ceil((dOut - dIn) / (86400000));
                
                const movementDates = Object.keys(dailyMovements).sort();
                const arrivalDates = movementDates.filter(date => dailyMovements[date].arrivals.pax > 0);
                const departureDates = movementDates.filter(date => dailyMovements[date].departures.pax > 0);

                arrivalDates.forEach((date, index) => {
                    const occupancy = dailyMovements[date].arrivals;
                    autoServices.push({
                        fecha: formatD(date),
                        servicio: index === 0 ? 'Llegada / check-in' : 'Llegada parcial / check-in',
                        regimen: 'Entrada',
                        paxHab: `${occupancy.pax} pax / ${occupancy.rooms} hab.`,
                        hora: 'Según llegada',
                        notas: 'Coordinar entrega de llaves. El grupo puede comer primero si llega antes del almuerzo.',
                        origin: 'auto',
                        serviceType: 'Llegada',
                        serviceDate: date,
                        serviceId: `${date}|arrival|automatic`,
                        originalPax: occupancy.pax,
                        originalRooms: occupancy.rooms
                    });
                });

                const totalDays = nights + 1; // From check-in day to check-out day inclusive
                for (let i = 0; i < totalDays; i++) {
                    const cur = new Date(dIn);
                    cur.setDate(cur.getDate() + i);
                    const targetIso = getLocalDateString(cur);
                    const targetLabel = formatD(cur);
                    const targetDM = extractDayMonth(targetLabel);

                    // Find services in Service Order for this day
                    const osServicesForDay = osPlanRows.filter(row => {
                        const rowDM = extractDayMonth(row.dia);
                        return rowDM && targetDM && rowDM.day === targetDM.day && rowDM.month === targetDM.month;
                    });

                    let dayServices = [];
                    if (osPlanRows.length > 0) {
                        // Use Service Order as the primary source of truth
                        dayServices = osServicesForDay.map(row => ({
                            name: row.serv,
                            hour: row.hora || '___:___ h',
                            note: row.menu || '',
                            pax: parseInt(String(row.pax || '').replace(/[^0-9]/g, ''), 10) || 0,
                            origin: (row.serv || '').toUpperCase().includes('EXTRA') ? 'economic' : 'auto'
                        }));
                    } else {
                        // Fallback to regime-based generation if no Service Order plan exists
                        const regime = gRegimen.toUpperCase();
                        const needsBreakfast = regime.includes('AD') || regime.includes('HD') || regime.includes('MP') || regime.includes('PC');
                        const needsLunch = regime.includes('PC');
                        const needsDinner = regime.includes('MP') || regime.includes('PC');

                        const tempServices = [];
                        if (i > 0 && needsBreakfast) {
                            tempServices.push('Desayuno');
                        }
                        if (i < nights && needsLunch) {
                            tempServices.push('Almuerzo');
                        }
                        if (i < nights && needsDinner) {
                            tempServices.push('Cena');
                        }

                        dayServices = tempServices.map(name => ({
                            name: name,
                            hour: name === 'Desayuno' ? 'PENDIENTE' : '___:___ h',
                            note: ''
                        }));
                    }

                    // Sort services chronologically on the day
                    const serviceChronology = { 'Desayuno': 1, 'Almuerzo': 2, 'Cena': 3 };
                    dayServices.sort((a, b) => (serviceChronology[a.name] || 99) - (serviceChronology[b.name] || 99));

                    // Output rows for this day
                    dayServices.forEach(s => {
                        let serviceNote = s.note.trim();
                        let serviceHour = s.hour.trim();
                        const hasHour = serviceHour && serviceHour !== '___:___ h' && serviceHour.toUpperCase() !== 'PENDIENTE';

                        if (!serviceNote) {
                            if (s.name === 'Desayuno') {
                                serviceNote = hasHour 
                                    ? 'Desayuno buffet en su sala.' 
                                    : 'Solicitar horario al grupo para coordinar sala de desayunos.';
                            } else if (s.name === 'Cena') {
                                serviceNote = hasHour
                                    ? 'Cena: Menú del día (tres platos).'
                                    : 'Cena: Menú del día (tres platos). Coordinar horarios.';
                            } else if (s.name === 'Almuerzo') {
                                serviceNote = hasHour
                                    ? 'Almuerzo: Menú del día (tres platos).'
                                    : 'Almuerzo: Menú del día (tres platos). Coordinar horarios.';
                            } else {
                                serviceNote = `${s.name} del grupo.`;
                            }
                        } else {
                            if (!serviceNote.toLowerCase().includes(s.name.toLowerCase())) {
                                serviceNote = `${s.name}: ${serviceNote}`;
                            }
                        }

                        // Determine standard service code for Régimen column
                        let serviceReg = 'MP';
                        const sNameUpper = (s.name || '').toUpperCase();
                        if (sNameUpper.includes('EXTRA')) {
                            serviceReg = '';
                        } else if (sNameUpper.includes('DESAYUNO')) {
                            serviceReg = 'AD';
                        } else if (sNameUpper.includes('ALMUERZO') && gRegimen.toUpperCase().includes('PC')) {
                            serviceReg = 'PC';
                        } else if (sNameUpper.includes('CENA') && gRegimen.toUpperCase().includes('PC')) {
                            serviceReg = 'PC';
                        }
                        const isExtraService = s.origin === 'economic' || sNameUpper.includes('EXTRA');
                        const automaticServiceType = sNameUpper.includes('DESAYUNO') ? 'breakfast'
                            : sNameUpper.includes('ALMUERZO') ? 'lunch'
                            : sNameUpper.includes('CENA') ? 'dinner'
                            : normalizeRoomType(s.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        const serviceOccupancy = isExtraService && s.pax > 0
                            ? { pax: s.pax, rooms: 0 }
                            : getServiceOccupancy(s.name, targetIso);
                        if (!isExtraService && serviceOccupancy.pax <= 0) return;
                        
                        autoServices.push({
                            fecha: targetLabel,
                            servicio: s.name,
                            regimen: serviceReg,
                            paxHab: `${serviceOccupancy.pax} pax`,
                            hora: serviceHour,
                            notas: serviceNote,
                            origin: isExtraService ? 'economic' : 'auto',
                            serviceType: s.name,
                            serviceDate: targetIso,
                            serviceId: isExtraService ? '' : `${targetIso}|${automaticServiceType}|automatic`,
                            originalPax: serviceOccupancy.pax,
                            originalRooms: serviceOccupancy.rooms
                        });
                    });
                }
                departureDates.forEach(date => {
                    const occupancy = dailyMovements[date].departures;
                    const isPartial = dailyMovements[date].overnight.pax > 0;
                    autoServices.push({
                        fecha: formatD(date),
                        servicio: isPartial ? 'Salida parcial / check-out' : 'Salida / check-out',
                        regimen: 'Salida',
                        paxHab: `${occupancy.pax} pax / ${occupancy.rooms} hab.`,
                        hora: '___:___ h',
                        notas: 'Revisar cargos extras pendientes en recepción antes del check-out.',
                        origin: 'auto',
                        serviceType: 'Salida',
                        serviceDate: date,
                        serviceId: `${date}|departure|automatic`,
                        originalPax: occupancy.pax,
                        originalRooms: occupancy.rooms
                    });
                });

                let servicesToRender = [];
                if (loadRoomingFromCache && !forceRegenerateServices && cachedServicios.length > 0) {
                    servicesToRender = cachedServicios;
                } else if (forceRegenerateServices && cachedServicios.length > 0) {
                    servicesToRender = mergeServices(cachedServicios, autoServices);
                } else {
                    servicesToRender = autoServices;
                }

                servicesToRender.forEach(sv => {
                    addRowServicio(sv.fecha, sv.servicio, sv.regimen, sv.paxHab, sv.hora, sv.notas || sv.notes, sv);
                });
            } else {
                addRowServicio('DÍA 1', 'Llegada / check-in', 'Entrada', `${totalPax} pax`, '---', 'Coordinar llegada.');
            }

            refreshBreakfastServiceOccupancy();

            // Initialize window variables for Administration calculations
            window.admTotalRevenue = totalRevenue;
            window.admTotalCommission = totalCommission;
            window.admNetTotal = netTotal;
            window.admPaidAmount = paidAmount;
            window.admPendingAmount = pendingAmount;
            window.admIsOverpaid = isOverpaid;
            window.admRefundAmount = refundAmount;

            // Trigger the dynamic updates of the department summary boxes
            updateDepartmentSummaries();

            // File Drop Area drag & drop setup
            const dropArea = document.getElementById('drop-area');
            if (dropArea) {
                ['dragenter', 'dragover'].forEach(eventName => {
                    dropArea.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        dropArea.classList.remove('border-slate-200', 'bg-slate-50');
                        dropArea.classList.add('border-indigo-400', 'bg-indigo-50/20');
                    }, false);
                });
                ['dragleave', 'drop'].forEach(eventName => {
                    dropArea.addEventListener(eventName, (e) => {
                        e.preventDefault();
                        dropArea.classList.remove('border-indigo-400', 'bg-indigo-50/20');
                        dropArea.classList.add('border-slate-200', 'bg-slate-50');
                    }, false);
                });
                dropArea.addEventListener('drop', (e) => {
                    const dt = e.dataTransfer;
                    const files = dt.files;
                    if (files.length > 0) {
                        const input = document.getElementById('file-uploader');
                        input.files = files;
                        handleFileSelect({ target: { files: files } });
                    }
                }, false);
            }

            runRoomingTests();
            
            // Initialization finished
            isInitializingView = false;
        });
