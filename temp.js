
        const HOTELS = {
            guadiana: {
                name: "SERCOTEL",
                subname: "GUADIANA",
                letter: "G",
                stars: "****",
                logo: "Logos/Sercotel Guadiana.jpg",
                brand: "by Sercotel",
                company: "SWEETMOON DESARROLLOS S.L.",
                nif: "B87067302",
                address: "C/ Guadiana, 36",
                cp: "13002",
                city: "Ciudad Real",
                tel: "926 22 33 13",
                fax: "926 27 30 57",
                email: "info@hotelguadiana.es",
                web: "www.hotelguadiana.es",
                bank: "Globalcaja",
                iban: "ES30 3190 3953 1851 8526 3521",
                irus: "1000292995580",
                paymentGateway: "",
                legal: "Inscrito en la hoja CR-00035559 del Registro Mercantil de Ciudad Real. Folio electrónico. Inscripción/anotación 4"
            },
            cumbria: {
                name: "Hotel",
                subname: "Cumbria",
                letter: "C",
                stars: "***",
                logo: "Logos/Cumbria Spa&Hotel.jpg",
                brand: "Cumbria Spa",
                company: "MOON FREE PORT, S.L.",
                nif: "B87895058",
                address: "Ctra. Fuencaliente, s/n",
                cp: "13004",
                city: "Ciudad Real",
                tel: "926 25 10 25",
                fax: "926 25 10 26",
                email: "recepcion@hotelcumbria.es",
                web: "www.hotelcumbria.es",
                bank: "Caixabank",
                iban: "ES19 3081 0601 0850 0004 8966",
                paymentGateway: "",
                legal: "Inscrito en el tomo 699 de libro 0 folio 2 hoja CR-32491 inscripción 2ª"
            }
        };

        // --- CARGAR CONFIGURACIÓN DESDE CLOUD ---
        async function refreshConfigFromCloud() {
            try {
                if (typeof db === 'undefined') return;
                const doc = await db.collection("settings").doc("main").get();
                if (doc.exists) {
                    const cloudData = doc.data();
                    if (cloudData.guadiana) Object.assign(HOTELS.guadiana, cloudData.guadiana);
                    if (cloudData.cumbria) Object.assign(HOTELS.cumbria, cloudData.cumbria);
                    // log
                    // Re-render si ya cargó
                    updateHotel(currentHotel);
                }
            } catch (e) {
                console.warn("⚠️ Error cargando config cloud:", e);
            }
        }

        // Se carga desde js/firebase-config.js
        const apiKey = window.firebaseConfig ? window.firebaseConfig.apiKey : "";
        let currentTemplate = 'confirmacion';
        let currentHotel = 'guadiana';
        let showBankDetails = true; // Flag for bank details visibility in Proforma
        let showLegalNotice = true; // Flag for legal notice visibility in Proforma

        // Datos iniciales vacíos para permitir creación manual
        let items = [];
        let paymentPlan = []; // Global payment plan/advances
        let total = 0;
        let totalComision = 0;
        let base10 = 0, iva10 = 0, base21 = 0, iva21 = 0;

        // Sincronización de datos comunes
        function syncFields() {
            // Sync all fields EXCEPT reserva-id (proforma uses fixed "PROFORMA" text)
            const fields = [
                'fecha-proforma', 'solicitante-org', 'solicitante-nombre', 'solicitante-email',
                'reserva-personas', 'reserva-entrada', 'reserva-salida',
                'client-address', 'client-city', 'client-nif',
                'f-pax-name', 'f-pax-count', 'f-date-in', 'f-date-out', 'f-room-summary', 'programa'
            ];
            fields.forEach(f => {
                const el1 = document.getElementById(f + '-1');
                const el2 = document.getElementById(f + '-2');
                const elExact = document.getElementById(f);

                // Collect values from any available element
                let value = "";
                if (el1) value = el1.innerText;
                else if (el2) value = el2.innerText;
                else if (elExact) value = (elExact.tagName === 'INPUT' ? elExact.value : elExact.innerText);

                if (el1 && document.activeElement !== el1) el1.innerText = value;
                if (el2 && document.activeElement !== el2) el2.innerText = value;
                if (elExact && document.activeElement !== elExact) {
                    if (elExact.tagName === 'INPUT') elExact.value = value;
                    else elExact.innerText = value;
                }
            });
        }
        setInterval(syncFields, 3000);

        function addOcupanteField() {
            const container = document.querySelector('#ocupante-box .flex-1');
            if (!container) return;

            const footer = [...container.children].find(child => child.classList.contains('border-t') && child.classList.contains('no-print'));
            const newRow = document.createElement('div');
            newRow.className = 'ocupante-row flex items-center gap-1 mt-1';
            newRow.dataset.dynamic = 'true';
            newRow.innerHTML = `
                <span class="w-24"><strong><span class="editable" contenteditable="true">Campo</span> :</strong></span>
                <span class="editable flex-1" contenteditable="true" style="min-width: 100px;">---</span>
                <button class="no-print text-red-200 hover:text-red-500 text-[10px] ml-auto"
                        onclick="this.parentElement.remove()" title="Eliminar">X</button>
            `;

            if (footer) container.insertBefore(newRow, footer);
            else container.appendChild(newRow);

            const label = newRow.querySelector('[contenteditable="true"]');
            if (label) {
                label.focus();
                document.execCommand('selectAll', false, null);
            }
        }

        async function saveProforma(silent = false) {
            const saved = localStorage.getItem('selectedGroup');
            if (!saved) return;
            const group = JSON.parse(saved);
            const id = group.Reserva || group.id;
            if (!id) return;

            try {
                const normId = String(id).trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");
                
                // Capturar campos manuales para persistencia
                const customFields = {};
                const fieldIds = [
                    'solicitante-org', 'solicitante-nombre', 'solicitante-tel', 'solicitante-email',
                    'reserva-personas', 'reserva-entrada', 'reserva-salida', 'client-address', 'client-city', 'client-nif',
                    'f-pax-name', 'f-pax-count', 'f-date-in', 'f-date-out', 'f-room-summary', 'programa', 'reserva-id'
                ];
                
                fieldIds.forEach(fid => {
                    // Intentamos pillar el valor de cualquier variante del ID (-1, -2, -universal o exacto)
                    const el = document.getElementById(fid + '-universal') || 
                               document.getElementById(fid + '-2') || 
                               document.getElementById(fid + '-1') || 
                               document.getElementById(fid);
                    
                    if (el) {
                        let val = el.innerText || el.value || "";
                        // Limpiar prefijo "Prof. " si es el campo de proforma
                        if (fid === 'reserva-id') val = val.replace(/^Prof\.\s*/i, "");
                        customFields[fid] = val;
                    }
                });

                customFields.dynamicRows = Array.from(document.querySelectorAll('#ocupante-box [data-dynamic="true"]')).map(row => {
                    const editableCells = row.querySelectorAll('.editable');
                    return {
                        key: (editableCells[0]?.innerText || '').trim(),
                        value: (editableCells[1]?.innerText || '').trim()
                    };
                }).filter(row => row.key || row.value);

                const payload = {
                    "ProformaItems": items,
                    "ProformaCustomFields": customFields,
                    "PaymentPlan_JSON": JSON.stringify(paymentPlan), // Save the payment plan/advances
                    "updatedAt": firebase.firestore.FieldValue.serverTimestamp(),
                    "total": total || 0,
                    "solicitante_org": customFields["solicitante-org"] || "",
                    "programa": customFields["programa"] || "",
                    "Reserva": customFields["reserva-id"] || id, // Guardar el número modificado
                    "hotel": currentHotel
                };

                if (group.isIndependentProforma) {
                    payload.isIndependentProforma = true;
                }

                await db.collection("groups").doc(normId).set(payload, { merge: true });
                
                // Actualizar localmente
                group.ProformaItems = items;
                group.ProformaCustomFields = customFields;
                localStorage.setItem('selectedGroup', JSON.stringify(group));
                
                if (!silent) {
                    const btn = document.querySelector('button[onclick="saveProforma()"]');
                    if (btn) {
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ¡Guardado!';
                        btn.classList.add('bg-emerald-600');
                        setTimeout(() => {
                            btn.innerHTML = originalText;
                            btn.classList.remove('bg-emerald-600');
                        }, 2000);
                    }
                }
            } catch (e) {
                console.error("Error al guardar proforma:", e);
                if (!silent) alert("Error al guardar en el servidor: " + e.message);
            }
        }

        async function saveAndExit() {
            await saveProforma(true);
            const saved = localStorage.getItem('selectedGroup');
            let isIndependent = false;
            let reservaId = "";
            let targetFile = "Gestión de Grupos.html";

            if (saved) {
                try {
                    const group = JSON.parse(saved);
                    reservaId = group.Reserva || group["Reserva"] || "";
                    isIndependent = group.isIndependentProforma;
                } catch (e) { }
            }

            if (isIndependent) {
                window.location.href = "Proformas.html";
                return;
            }

            if (reservaId) {
                localStorage.setItem('nexus_return_reserva', reservaId);
            }

            const url = encodeURI(targetFile) + (reservaId ? '?reserva=' + encodeURIComponent(reservaId) : '');
            window.location.href = url;
        }

        // callGemini base cargado desde js/gemini.js
        // Wrapper con contexto de hotel para Fac Prof
        async function callGeminiHotel(prompt) {
            const hotelName = HOTELS[currentHotel]?.name + " " + HOTELS[currentHotel]?.subname;
            const fullPrompt = `Eres un asistente de recepción de un hotel de lujo (${hotelName}). Tu tono es profesional, cortés y servicial. Siempre respondes en español.\n\n` + prompt;
            return window.callGemini(fullPrompt);
        }

        async function generateAIEmail() {
            showAIModal("✨ Redactando Email Profesional");
            
            let grandTotal = 0;
            const resumenServicios = items.map(item => {
                const p = parseFloat(item.precio || 0);
                const cant = parseFloat(item.cant || 1);
                const hab = parseFloat(item.hab || 1);
                const dias = parseFloat(item.dias || 1);
                const sub = (p * cant * hab * dias).toFixed(2);
                grandTotal += parseFloat(sub);
                
                let text = `- `;
                text += `${item.cant ? item.cant + 'x ' : ''}`;
                text += `${item.concepto || item.roomType || 'Servicio'} `;
                if(item.regimen) text += `(${item.regimen}) `;
                text += `-> ${sub}€`;
                return text;
            }).join("\\n            ");

            const cliente = document.getElementById('solicitante-nombre-1')?.innerText || document.getElementById('solicitante-org-1')?.innerText || "Estimado Cliente";
            const grupoName = document.getElementById('programa-1')?.innerText || "su grupo";
            const entrada = document.getElementById('reserva-entrada-1')?.innerText || "--/--/----";
            const hotelName = HOTELS[currentHotel]?.name + " " + HOTELS[currentHotel]?.subname;

            let context = `documento de confirmación`;
            if (currentTemplate === 'proforma') context = `factura proforma`;
            if (currentTemplate === 'propuesta') context = `propuesta formal de servicios`;

            const prompt = `Redacta el cuerpo y asunto de un correo electrónico para enviar la ${context} adjunta al cliente.
            
            DETALLES DE LA RESERVA:
            - Cliente: ${cliente}
            - Grupo / Referencia: ${grupoName}
            - Hotel: ${hotelName}
            - Fecha de entrada: ${entrada}
            
            SERVICIOS INCLUIDOS EN EL PRESUPUESTO:
            ${resumenServicios}
            
            - Total Presupuesto: ${formatNum(grandTotal)} €
            
            INSTRUCCIONES ESTRICTAS:
            1. El tono debe ser muy profesional, formal y elegante (administrativo claro si es proforma/confirmación, o persuasivo y cortés si es propuesta).
            2. Analiza el presupuesto y menciona en el correo de forma resumida los puntos clave acordados (número de habitaciones principales, régimen, total a pagar). No enlistes todo como un robot, hazlo natural.
            3. Invita cortésmente al cliente a revisar el ${context} en formato PDF adjunto.
            4. DEVUELVE ÚNICAMENTE el Asunto en la primera línea (ej: **Asunto:** ...) y el cuerpo del correo. NO INCLUYAS frases introductorias tuyas como "Claro, aquí tienes una propuesta...". Empieza directamente con el Asunto.`;

            const result = await callGeminiHotel(prompt);
            document.getElementById('ai-content').innerText = result;
        }

        async function desestimarGrupo() {
            const saved = localStorage.getItem('selectedGroup');
            if (!saved) return;
            const group = JSON.parse(saved);
            const reservaId = group.Reserva || group.id;

            if (confirm(`¿Estás seguro de que deseas marcar la reserva ${reservaId} como DESESTIMADA?`)) {
                try {
                    const normId = String(reservaId).trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");
                    await db.collection("groups").doc(normId).set({
                        "Com_Estado_Interno": "DESESTIMADO",
                        "updatedAt": firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });

                    // Actualizar local y salir
                    group["Com_Estado_Interno"] = "DESESTIMADO";
                    localStorage.setItem('selectedGroup', JSON.stringify(group));
                    saveAndExit();
                } catch (e) {
                    alert("Error al desestimar el grupo: " + e.message);
                }
            }
        }

        async function generateAIPlan() {
            showAIModal("✨ Sugerencia de Plan para el Grupo");
            const personas = document.getElementById('reserva-personas-1').innerText;
            const prompt = `Sugiere un plan de ocio en Ciudad Real para ${personas} personas.`;
            const result = await callGemini(prompt);
            document.getElementById('ai-content').innerText = result;
        }

        function showAIModal(title) {
            document.getElementById('ai-modal-title').innerText = title;
            document.getElementById('ai-content').innerText = "Generando...";
            document.getElementById('ai-modal').style.display = 'flex';
        }
        function closeAIModal() { document.getElementById('ai-modal').style.display = 'none'; }

        const toNum = (val) => {
            if (val === undefined || val === null || val === "") return 0;
            if (typeof val === 'number') return val;
            const s = String(val).replace(/[^\d,.-]/g, '');
            if (s.includes(',') && s.includes('.')) return parseFloat(s.replace(/\./g, '').replace(',', '.'));
            if (s.includes(',')) return parseFloat(s.replace(',', '.'));
            return parseFloat(s) || 0;
        };

        const toInputDate = (val) => {
            if (!val || val === "---") return "";
            const str = String(val).trim();

            // Caso 1: Excel Serial (ej: 46129)
            const num = parseFloat(str);
            if (!isNaN(num) && num > 40000 && num < 60000) {
                try {
                    const date = new Date(Math.round((num - 25569) * 86400 * 1000));
                    if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
                } catch (e) { }
            }

            // Caso 2: DD/MM/YYYY -> YYYY-MM-DD
            if (str.includes('/')) {
                const parts = str.split('/');
                if (parts.length === 3) {
                    const [d, m, yRaw] = parts;
                    let y = parseInt(yRaw);
                    if (y < 100) y += 2000;
                    const year = String(y);
                    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                }
            }

            // Caso 3: DD.MM.YYYY -> YYYY-MM-DD
            if (str.includes('.')) {
                const parts = str.split('.');
                if (parts.length === 3) {
                    const [d, m, yRaw] = parts;
                    let y = parseInt(yRaw);
                    if (y < 100) y += 2000;
                    const yrStr = String(y);
                    if (yrStr.length === 4 || yrStr.length === 2) {
                        return `${yrStr}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                    }
                }
            }

            // Caso 4: YYYY-MM-DD o DD-MM-YYYY
            if (str.includes('-')) {
                const parts = str.split(/[-T ]/);
                if (parts[0] && parts[0].length === 4) return parts.slice(0, 3).join('-'); // YYYY-MM-DD
                if (parts[2] && (parts[2].length === 4 || parts[2].length === 2)) { // DD-MM-YYYY
                    const [d, m, yRaw] = parts;
                    let y = parseInt(yRaw);
                    if (y < 100) y += 2000;
                    const year = String(y);
                    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                }
            }

            const dObj = new Date(str);
            if (!isNaN(dObj.getTime())) return dObj.toISOString().split('T')[0];
            return str;
        };

        const formatDate = (val) => {
            if (!val || val === "---") return "-";
            const iso = toInputDate(val);
            if (!iso || !iso.includes('-')) return val;
            const [y, m, d] = iso.split('-');
            return `${d}-${m}-${y}`;
        };

        const parseMoney = (val) => toNum(val);

        function loadSelectedGroup() {
            const saved = localStorage.getItem('selectedGroup');
            const today = new Date().toLocaleDateString('es-ES');

            // Reset inicial de placeholders
            const idsToReset = [
                'reserva-id', 'solicitante-org', 'solicitante-nombre', 'solicitante-tel', 'solicitante-email',
                'reserva-personas', 'reserva-entrada', 'reserva-salida', 'client-address', 'client-city', 'client-nif',
                'f-pax-name', 'f-pax-count', 'f-date-in', 'f-date-out', 'f-room-summary', 'programa'
            ];
            idsToReset.forEach(id => {
                const el1 = document.getElementById(id + '-1');
                const el2 = document.getElementById(id + '-2');
                const elExact = document.getElementById(id);
                const elUniversal = document.getElementById(id + '-universal');
                if (el1) el1.innerText = '';
                if (el2) el2.innerText = '';
                if (elExact) {
                    if (elExact.tagName === 'INPUT') elExact.value = '';
                    else elExact.innerText = '';
                }
                if (elUniversal) elUniversal.innerText = '';
            });
            document.querySelectorAll('[id^="fecha-proforma-"]').forEach(el => el.innerText = today);
            const fechaUniv = document.getElementById('fecha-universal');
            if (fechaUniv) fechaUniv.innerText = today;

            if (!saved) return;

            try {
                const group = JSON.parse(saved);
                const hotelRaw = (group["Hotel_Asignado"] || group["Hotel"] || "").toLowerCase();
                let detectedHotel = hotelRaw.includes('cumb') ? 'cumbria' : 'guadiana';
                updateHotel(detectedHotel);

                const mapping = {
                    'reserva-id': group["Reserva"] || '',
                    'solicitante-org': group["Fiscal_RazonSocial"] || group["Empresa/Agencia"] || group["Nombre del Grupo"] || '',
                    'solicitante-nombre': group["Persona_Contacto"] || group["Com_Nombre_Contacto"] || group["Nombre del Grupo"] || '',
                    'solicitante-tel': group["Telefono"] || group["Com_Telefono_Contacto"] || '',
                    'solicitante-email': group["Email"] || group["Com_Email_Contacto"] || group["Fiscal_Email"] || '',
                    'reserva-personas': group["Pax."] || group["Pax"] || group["Personas"] || group["pax"] || '',
                    'reserva-entrada': formatDate(group["Entrada"]),
                    'reserva-salida': formatDate(group["Salida"]),
                    'fecha-proforma': today,
                    'client-address': group["Fiscal_Direccion"] || '',
                    'client-city': (group["Fiscal_CP"] ? group["Fiscal_CP"] + ' ' : '') + (group["Fiscal_Poblacion"] || '') + (group["Fiscal_Provincia"] ? ', ' + group["Fiscal_Provincia"] : ''),
                    'client-nif': group["Fiscal_CIF"] || '',
                    'f-pax-name': group["Nombre del Grupo"] || '',
                    'f-pax-count': group["Pax."] || group["Pax"] || group["Personas"] || group["pax"] || '',
                    'f-date-in': formatDate(group["Entrada"]),
                    'f-date-out': formatDate(group["Salida"]),
                    'f-room-summary': group["RoomSummary"] || '---',
                    'programa': group["Nombre del Grupo"] || group["Com_Programa"] || group["name"] || ''
                };

                const customFields = group.ProformaCustomFields || {};
                const placeholders = ["---", "Calle Dirección", "RAZÓN SOCIAL", "CP, Ciudad", "B00000000"];

                Object.keys(mapping).forEach(k => {
                    const hasFichaData = mapping[k] && mapping[k] !== '' && !placeholders.includes(mapping[k]);
                    const hasCustomData = customFields[k] && String(customFields[k]).trim() !== '' && !placeholders.includes(customFields[k]);
                    if (hasCustomData && !hasFichaData) mapping[k] = customFields[k];
                    else if (!hasFichaData && !hasCustomData) mapping[k] = "";
                });

                Object.keys(mapping).forEach(id => {
                    const el1 = document.getElementById(id + '-1');
                    const el2 = document.getElementById(id + '-2');
                    const elExact = document.getElementById(id);
                    const elUniversal = document.getElementById(id + '-universal');
                    const finalVal = mapping[id] || "";
                    if (el1) el1.innerText = finalVal;
                    if (el2) el2.innerText = finalVal;
                    if (elExact) {
                        if (elExact.tagName === 'INPUT') elExact.value = finalVal;
                        else elExact.innerText = finalVal;
                    }
                    if (elUniversal) elUniversal.innerText = finalVal;

                    if (id === 'reserva-id') {
                        const rid2 = document.getElementById('reserva-id-2');
                        if (rid2) rid2.innerText = 'Prof. ' + finalVal;
                        const ridU = document.getElementById('reserva-id-universal');
                        if (ridU) ridU.innerText = finalVal;
                    }
                });

                if (customFields.dynamicRows) {
                    const container = document.querySelector('#ocupante-box .flex-1');
                    if (container) {
                        const footer = [...container.children].find(child => child.classList.contains('border-t') && child.classList.contains('no-print'));
                        customFields.dynamicRows.forEach(row => {
                            const newRow = document.createElement('div');
                            newRow.className = 'ocupante-row flex items-center gap-1 mt-1';
                            newRow.dataset.dynamic = 'true';
                            newRow.innerHTML = `
                                <span class="w-24"><strong><span class="editable" contenteditable="true">${row.key}</span> :</strong></span>
                                <span class="editable flex-1" contenteditable="true" style="min-width: 100px;">${row.value}</span>
                                <button class="no-print text-red-200 hover:text-red-500 text-[10px] ml-auto" onclick="this.parentElement.remove()">✕</button>
                            `;
                            if (footer) container.insertBefore(newRow, footer);
                            else container.appendChild(newRow);
                        });
                    }
                }

                if (group.ProformaItems && group.ProformaItems.length > 0) items = group.ProformaItems;
                else if (toNum(group["Importe(*)"]) > 0) {
                    items = [{
                        fecha: group["Entrada"] || today,
                        hab: '', cant: group["Pax."] || '1',
                        concepto: `ESTANCIA GRUPO: ${group["Nombre del Grupo"]}`,
                        precio: toNum(group["Importe(*)"]), iva: 10, regimen: group["Régimen"] || 'AD'
                    }];
                }

                paymentPlan = JSON.parse(group.PaymentPlan_JSON || "[]");
                if (paymentPlan.length === 0) {
                    const entradaStr = mapping['reserva-entrada'] || today;
                    const [d, m, yRaw] = entradaStr.split(/[-\/]/).map(Number);
                    const fEntrada = (d && m && yRaw) ? new Date(yRaw < 100 ? 2000 + yRaw : yRaw, m - 1, d) : new Date();
                    const d1 = new Date(fEntrada); d1.setDate(d1.getDate() - 60);
                    const d2 = new Date(fEntrada); d2.setDate(d2.getDate() - 30);
                    paymentPlan = [
                        { label: "1er Pago Garantía", percent: 30, amount: 0, date: d1.toISOString().split('T')[0], status: "Pendiente" },
                        { label: "Liquidación Final", percent: 70, amount: 0, date: d2.toISOString().split('T')[0], status: "Pendiente" }
                    ];
                }
            } catch (e) { console.error(e); }
        }

        function addItem() {
            items.push({ fecha: new Date().toISOString().split('T')[0], hab: '1', cant: '1', concepto: 'NUEVO CARGO', precio: 0, iva: 10, regimen: '-', dias: 1 });
            renderItems();
        }
        function removeItem(index) { if (confirm("¿Eliminar este concepto?")) { items.splice(index, 1); renderItems(); } }
        function updateItem(index, field, value) { if (items[index]) { items[index][field] = field === 'iva' ? parseInt(value) : value; renderItems(); } }

        function addPayment() {
            paymentPlan.push({ label: "Anticipo / Pago", percent: 0, amount: 0, date: new Date().toISOString().split('T')[0], status: "Cobrado" });
            renderItems();
        }
        function updatePayment(index, field, value) { if (paymentPlan[index]) { paymentPlan[index][field] = value; renderItems(); } }
        function removePayment(index) { if (confirm("¿Eliminar este pago/anticipo?")) { paymentPlan.splice(index, 1); renderItems(); } }

        function renderTaxSelect(index, item) {
            const ivaVal = parseInt(item.iva) === 21 ? 21 : 10;
            return `<select class="no-print tax-select ml-1" onchange="updateItem(${index}, 'iva', this.value)">
                <option value="10"${ivaVal === 10 ? ' selected' : ''}>10%</option>
                <option value="21"${ivaVal === 21 ? ' selected' : ''}>21%</option>
            </select>`;
        }

        window.addEventListener('DOMContentLoaded', async () => {
            if (typeof firebase !== 'undefined' && !firebase.apps.length) firebase.initializeApp(window.firebaseConfig);
            if (typeof firebase !== 'undefined') window.db = firebase.firestore();
            try {
                const doc = await db.collection("settings").doc("main").get();
                if (doc.exists) window.globalConfig = doc.data();
            } catch (e) { }
            await refreshConfigFromCloud();
            loadSelectedGroup();
            renderItems();
        });

        function copyAIContent() {
            navigator.clipboard.writeText(document.getElementById('ai-content').innerText);
            const btn = document.getElementById('btn-copy');
            if (btn) { btn.innerText = "¡Copiado!"; setTimeout(() => btn.innerText = "Copiar texto", 2000); }
        }

        function switchTemplate(tpl) {
            currentTemplate = tpl;
            document.getElementById('tpl-confirmacion').classList.toggle('hidden', tpl !== 'confirmacion');
            document.getElementById('tpl-proforma').classList.toggle('hidden', tpl !== 'proforma');
            document.getElementById('tpl-policies').classList.toggle('hidden', tpl !== 'confirmacion');
            
            document.getElementById('btn-confirmacion').className = tpl === 'confirmacion' ? 'px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white text-slate-900 shadow-md transition-all whitespace-nowrap' : 'px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white/80 hover:bg-white/10 transition-all whitespace-nowrap';
            document.getElementById('btn-proforma').className = tpl === 'proforma' ? 'px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white text-slate-900 shadow-md transition-all whitespace-nowrap' : 'px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white/80 hover:bg-white/10 transition-all whitespace-nowrap';

            const docTitle = document.getElementById('doc-type-title');
            if (docTitle) { docTitle.style.display = tpl === 'proforma' ? 'none' : 'inline-block'; docTitle.innerText = tpl === 'confirmacion' ? 'Confirmación' : ''; }
            const hFecha = document.getElementById('header-fecha-block');
            if (hFecha) hFecha.style.display = tpl === 'confirmacion' ? 'flex' : 'none';

            renderItems();
        }

        function cleanConcept(text) { return (text || '').replace(/\s*\((DBL|TPL|DUI|SGL|SA|TRP|JR|SU|STD|PC|AD|MP|BB|HB|FB|RO|CUA|QUA)\)/gi, '').trim().replace(/Doble\s+Uso\s+Individual/gi, 'Uso Individual'); }
        const formatNum = NexusUtils.formatNum;

        function updateHotel(hotelKey) {
            if (!hotelKey) return;
            currentHotel = hotelKey;
            const h = HOTELS[hotelKey];
            if (!h) return;
            const pageTitle = document.getElementById('page-title');
            if (pageTitle) pageTitle.innerText = `Generador de Facturas - ${h.name} ${h.subname}`;
            const imgUniversal = document.getElementById('logo-img-universal');
            if (imgUniversal) imgUniversal.src = h.logo;
            const hAddr = document.getElementById('header-address-line');
            const hCity = document.getElementById('header-city-line');
            const hTel = document.getElementById('header-tel-val');
            if (hAddr) hAddr.innerText = h.address;
            if (hCity) hCity.innerText = `${h.cp} - ${h.city} (España)`;
            if (hTel) hTel.innerText = h.tel;
            const legalVertical = document.getElementById('global-vertical-legal');
            if (legalVertical) legalVertical.innerHTML = `<span class="italic">${h.company} &nbsp;&nbsp;&nbsp; ${h.address} &middot; ${h.cp} ${h.city} &nbsp;&nbsp;&nbsp; ${h.legal} ${h.irus ? `&nbsp;&nbsp;&nbsp; IRUS: ${h.irus}` : ''} &nbsp;&nbsp;&nbsp; N.I.F. ${h.nif}</span>`;

            const primaryColor = hotelKey === 'cumbria' ? '#0f172a' : '#2d5a43';
            let styleTheme = document.getElementById('dynamic-theme-override') || document.createElement('style');
            styleTheme.id = 'dynamic-theme-override';
            document.head.appendChild(styleTheme);
            styleTheme.innerHTML = `.text-\\[\\#2d5a43\\] { color: ${primaryColor} !important; } .bg-\\[\\#2d5a43\\] { background-color: ${primaryColor} !important; } .border-\\[\\#2d5a43\\] { border-color: ${primaryColor} !important; } .editable:focus { outline-color: ${primaryColor} !important; }`;
            renderItems();
        }

        function renderItems() {
            const h = HOTELS[currentHotel];
            const groupData = JSON.parse(localStorage.getItem('selectedGroup') || '{}');
            const containers = document.querySelectorAll('.invoice-items');
            const footer = document.getElementById('footer-totals');
            
            total = 0; totalComision = 0; base10 = 0; iva10 = 0; base21 = 0; iva21 = 0;
            let runningTotal = 0;

            containers.forEach(c => c.innerHTML = '');
            if (footer) footer.innerHTML = '';
            const pSummary = document.getElementById('proforma-summary');
            const pBank = document.getElementById('proforma-bank-container');
            if (pSummary) pSummary.innerHTML = '';
            if (pBank) pBank.innerHTML = '';

            items.forEach((item, index) => {
                const sub = (parseFloat(item.precio) || 0) * (parseFloat(item.hab) || 1) * (parseFloat(item.cant) || 1) * (parseFloat(item.dias) || 1);
                let com = (parseFloat(item.comision?.comision_unitaria) || 0) * (parseFloat(item.hab) || 1) * (parseFloat(item.cant) || 1) * (parseFloat(item.dias) || 1);
                if (com <= 0 && item.comision?.porcentaje) com = sub * (parseFloat(item.comision.porcentaje) / 100);
                totalComision += com; total += sub; runningTotal += sub;
                const net = sub - com;
                if ((parseFloat(item.iva) || 10) === 10) { const b = net / 1.1; base10 += b; iva10 += (net - b); }
                else { const b = net / 1.21; base21 += b; iva21 += (net - b); }

                const row = currentTemplate === 'confirmacion' ? `
                    <tr class="border-b group">
                        <td class="p-1"><input type="date" value="${toInputDate(item.fecha)}" onchange="updateItem(${index}, 'fecha', this.value)" class="bg-transparent text-gray-500 w-22 outline-none text-[9px]"></td>
                        <td class="p-1 text-center font-bold text-gray-400 text-[10px]"><span class="editable" contenteditable="true" onblur="updateItem(${index}, 'cant', this.innerText)">${item.cant || '1'}</span></td>
                        <td class="p-1 text-[11px] font-black text-gray-800"><span class="editable" contenteditable="true" onblur="updateItem(${index}, 'concepto', this.innerText)">${cleanConcept(item.concepto)}</span>${renderTaxSelect(index, item)}</td>
                        <td class="p-1 text-center text-gray-400"><span class="editable text-[9px]" contenteditable="true" onblur="updateItem(${index}, 'regimen', this.innerText)">${item.regimen || '-'}</span></td>
                        <td class="p-1 text-center text-[9px] text-gray-500"><span class="editable" contenteditable="true" onblur="updateItem(${index}, 'dias', this.innerText)">${item.dias || 1}</span></td>
                        <td class="p-1 text-right text-[10px]"><span class="editable" contenteditable="true" onblur="updateItem(${index}, 'precio', this.innerText)">${formatNum(item.precio)}</span></td>
                        <td class="p-1 text-right font-black text-gray-900 text-[11px]">${formatNum(sub)}</td>
                        <td class="p-1 text-right text-gray-300 font-medium text-[10px]">${formatNum(runningTotal)}</td>
                        <td class="p-1 no-print text-center"><button onclick="removeItem(${index})" class="text-gray-300 hover:text-red-500">✕</button></td>
                    </tr>` : `
                    <tr class="h-7 border-b border-gray-100">
                        <td class="py-1"><input type="date" value="${toInputDate(item.fecha)}" onchange="updateItem(${index}, 'fecha', this.value)" class="bg-transparent w-20 outline-none text-[9px] text-gray-500"></td>
                        <td class="text-center font-bold text-gray-400 text-[10px]"><span class="editable" contenteditable="true" onblur="updateItem(${index}, 'cant', this.innerText)">${item.cant || '1'}</span></td>
                        <td class="font-black text-gray-800 text-[11px] uppercase py-1"><span class="editable" contenteditable="true" onblur="updateItem(${index}, 'concepto', this.innerText)">${cleanConcept(item.concepto)}</span>${renderTaxSelect(index, item)}</td>
                        <td class="text-center text-gray-400"><span class="editable text-[9px]" contenteditable="true" onblur="updateItem(${index}, 'regimen', this.innerText)">${item.regimen || '-'}</span></td>
                        <td class="text-center text-[9px] text-gray-500"><span class="editable" contenteditable="true" onblur="updateItem(${index}, 'dias', this.innerText)">${item.dias || 1}</span></td>
                        <td class="text-right text-gray-600 text-[10px]"><span class="editable" contenteditable="true" onblur="updateItem(${index}, 'precio', this.innerText)">${formatNum(item.precio)}</span></td>
                        <td class="text-right font-black text-gray-900 text-[11px]">${formatNum(sub)}</td>
                        <td class="text-right text-gray-300 font-medium text-[10px]">${formatNum(runningTotal)}</td>
                        <td class="no-print text-center py-1"><button onclick="removeItem(${index})" class="text-gray-300 hover:text-red-500">✕</button></td>
                    </tr>`;
                containers.forEach(c => c.insertAdjacentHTML('beforeend', row));
            });

            if (totalComision > 0) {
                const comRow = `<tr class="border-b bg-gray-50/50 italic text-gray-400"><td class="p-1"></td><td class="p-1 text-center font-bold">1</td><td class="p-1 text-[10px] uppercase font-bold">(-) COM/DTO SOBRE ${formatNum(total)}</td><td class="p-1"></td><td class="p-1"></td><td class="p-1 text-right text-[10px]">${formatNum(totalComision)}</td><td class="p-1 text-right font-bold text-red-500">-${formatNum(totalComision)}</td><td colspan="2"></td></tr>`;
                containers.forEach(c => c.insertAdjacentHTML('beforeend', comRow));
            }

            if (currentTemplate === 'confirmacion') {
                const totalNetoPagar = (total - totalComision) + parseFloat(groupData.Suplementos || 0) - parseFloat(groupData.Descuentos || 0);
                const totalPaid = paymentPlan.filter(p => p.status === "Cobrado").reduce((acc, p) => acc + (parseFloat(p.amount) || 0), 0);
                const totalPending = totalNetoPagar - totalPaid;

                if (paymentPlan.length > 0) {
                    const pendingRows = paymentPlan.filter(p => p.status !== "Cobrado");
                    const totalToDistribute = totalNetoPagar - totalPaid;
                    if (pendingRows.length > 0) {
                        const totalPendingPercent = pendingRows.reduce((acc, p) => acc + (parseFloat(p.percent) || 0), 0) || 100;
                        pendingRows.forEach(p => {
                            if (pendingRows.length === 1) p.amount = totalToDistribute.toFixed(2);
                            else p.amount = (totalToDistribute * ((parseFloat(p.percent) || 0) / totalPendingPercent)).toFixed(2);
                        });
                    }
                }

                footer.innerHTML = `
                    <div class="mt-4 font-pro" style="page-break-inside: avoid;">
                        <div class="flex items-center gap-4 mb-4">
                            <div class="flex-1 h-px" style="background: linear-gradient(to right, transparent, #cbd5e1 40%, #cbd5e1 60%, transparent);"></div>
                            <span class="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]">Condiciones de Pago</span>
                            <div class="flex-1 h-px" style="background: linear-gradient(to left, transparent, #cbd5e1 40%, #cbd5e1 60%, transparent);"></div>
                        </div>
                        <div class="mb-4 rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden flex relative">
                            <div class="w-1.5" style="background: linear-gradient(to bottom, ${currentHotel === 'cumbria' ? '#0f172a, #334155' : '#16a34a, #14532d'});"></div>
                            <div class="flex-1 px-8 py-4 flex justify-between items-center bg-gradient-to-r from-slate-50/40 to-white">
                                <div><span class="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400 block mb-1">Total Presupuestado</span><div class="flex items-baseline gap-1"><span class="tabular-nums" style="font-size: 20px; font-weight: 900; color: #0f172a;">${formatNum(totalNetoPagar)}</span><span class="font-bold text-slate-400" style="font-size: 11px;">€</span></div></div>
                                ${totalPaid >= Math.abs(totalNetoPagar) - 0.01 ? `<div class="text-right flex flex-col items-end gap-1.5 border-l border-slate-100 pl-8"><span class="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-sm" style="background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;">Pagado Total</span></div>` : `<div class="text-right border-l border-slate-200/60 pl-8 flex flex-col justify-center"><span class="text-[7.5px] font-black uppercase tracking-[0.25em] block mb-1" style="color: ${currentHotel === 'cumbria' ? '#475569' : '#15803d'};">Pendiente a Pagar</span><div class="flex items-baseline justify-end gap-1"><span class="tabular-nums" style="font-size: 20px; font-weight: 900;">${formatNum(totalPending)}</span><span class="font-bold" style="font-size: 11px; color: ${currentHotel === 'cumbria' ? '#64748b' : '#22c55e'};">€</span></div></div>`}
                            </div>
                        </div>
                        <div class="space-y-4">
                            ${!(groupData["Enlace_TPV"] || h.paymentGateway) ? `
                            <div class="bg-gradient-to-br from-slate-50 to-white pt-2 pb-4 px-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden">
                                 <div class="flex items-center gap-2 mb-3 relative z-10"><h5 class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] pt-0.5">Transferencia Bancaria</h5></div>
                                 <div class="relative z-10 flex border-t border-slate-100 pt-3">
                                     <div class="flex-1"><p class="text-[5px] font-bold text-slate-300 uppercase mb-0.5">Beneficiario</p><p class="font-black text-slate-800 uppercase" style="font-size: 8.5px;">${h.company}</p><p class="font-bold text-slate-500 mt-0.5" style="font-size: 7px;">NIF: ${h.nif}</p></div>
                                     <div class="flex-1 flex justify-end"><div class="bg-white p-2.5 rounded-xl border border-slate-100 min-w-[280px]"><p class="text-[5.5px] font-bold text-slate-300 uppercase">${h.bank}</p><p class="font-black text-slate-700 tabular-nums" style="font-size: 11px;">${h.iban}</p></div></div>
                                 </div>
                            </div>` : ''}
                            <div>
                                <div class="flex items-center justify-between mb-2"><h5 class="text-[7.5px] font-black text-slate-400 uppercase tracking-[0.2em]">Plan de Garantía y Pagos</h5><button onclick="addPayment()" class="no-print px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase">+ Añadir Anticipo</button></div>
                                <div class="grid grid-cols-2 gap-3 mb-3">
                                    ${paymentPlan.map((dep, idx) => {
                                        const isPaid = dep.status === "Cobrado";
                                        return `<div class="rounded-xl relative overflow-hidden group/dep" style="border: 1.5px solid ${isPaid ? '#a7f3d0' : '#e2e8f0'}; background-color: ${isPaid ? '#ecfdf5' : '#ffffff'};">
                                            <div class="w-full" style="height: 3px; background: ${isPaid ? 'linear-gradient(to right, #059669, #34d399)' : `linear-gradient(to right, ${currentHotel === 'cumbria' ? '#0f172a' : '#214732'}, ${currentHotel === 'cumbria' ? '#475569' : '#2d5a43'})`}; opacity: ${isPaid ? '1' : '0.4'};"></div>
                                            <button onclick="removePayment(${idx})" class="no-print absolute top-1 right-1 w-5 h-5 bg-rose-50 text-rose-500 rounded-md flex items-center justify-center opacity-0 group-hover/dep:opacity-100 transition-all z-20">✕</button>
                                            <div class="p-2 relative z-10 flex flex-col h-full justify-between">
                                                <div class="flex justify-between items-start mb-2 border-b border-slate-100 pb-1">
                                                    <span class="text-[7.5px] font-bold ${isPaid ? 'text-emerald-700' : 'text-slate-500'} uppercase editable" contenteditable="true" onblur="updatePayment(${idx}, 'label', this.innerText)">${dep.label}</span>
                                                    <div class="flex items-center gap-1"><span class="text-[7px] font-black tabular-nums editable" contenteditable="true" onblur="updatePayment(${idx}, 'percent', this.innerText)" style="color: ${isPaid ? '#059669' : '#94a3b8'};">${dep.percent}</span><span class="text-[7px] font-black" style="color: ${isPaid ? '#059669' : '#94a3b8'};">%</span><select onchange="updatePayment(${idx}, 'status', this.value)" class="no-print ml-2 bg-transparent text-[7px] font-bold border rounded px-1"><option value="Pendiente" ${dep.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option><option value="Cobrado" ${dep.status === 'Cobrado' ? 'selected' : ''}>Cobrado</option></select></div>
                                                </div>
                                                <div class="flex justify-between items-end mt-1">
                                                    <div><p class="text-[8px] ${isPaid ? 'text-emerald-500' : 'text-rose-600'} font-black uppercase tracking-wider mb-0.5">${isPaid ? 'Cobrado' : 'Fecha Límite'}</p><input type="date" value="${toInputDate(dep.date)}" onchange="updatePayment(${idx}, 'date', this.value)" class="text-[10px] font-bold ${isPaid ? 'text-slate-600' : 'text-slate-800'} bg-transparent outline-none"></div>
                                                    <div class="text-right"><p class="tabular-nums flex items-baseline justify-end gap-0.5" style="font-size: 11px; font-weight: 900; ${isPaid ? 'color: #047857;' : 'color: #1e293b;'}"><span class="editable" contenteditable="true" onblur="updatePayment(${idx}, 'amount', toNum(this.innerText))">${formatNum(dep.amount)}</span><span style="font-size: 8px; opacity: 0.6;">€</span></p></div>
                                                </div>
                                            </div>
                                        </div>`;
                                    }).join('')}
                                </div>
                                <div class="pt-1 pb-2 w-full flex justify-center"><div class="flex items-center gap-1.5 opacity-80" style="font-size: 9px;"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#e11d48" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><span class="text-slate-500 font-medium tracking-wide"><strong>TÉRMINOS DE PAGO:</strong> Todos los pagos anticipados a cuenta son <strong>No Reembolsables</strong>.</span></div></div>
                            </div>
                        </div>
                    </div>`;
            } else if (currentTemplate === 'proforma') {
                const netTotal = (total - totalComision) + parseFloat(groupData.Suplementos || 0) - parseFloat(groupData.Descuentos || 0);
                let ivaRows = '';
                if (base10 > 0) ivaRows += `<tr><td class="text-left px-3 py-1.5 text-slate-500">Base Imponible (10%)</td><td class="text-right px-3 py-1.5 tabular-nums">${formatNum(base10)} €</td></tr><tr><td class="text-left px-3 py-1.5 text-slate-500">IVA (10%)</td><td class="text-right px-3 py-1.5 tabular-nums font-bold">${formatNum(iva10)} €</td></tr>`;
                if (base21 > 0) ivaRows += `<tr><td class="text-left px-3 py-1.5 text-slate-500">Base Imponible (21%)</td><td class="text-right px-3 py-1.5 tabular-nums">${formatNum(base21)} €</td></tr><tr><td class="text-left px-3 py-1.5 text-slate-500">IVA (21%)</td><td class="text-right px-3 py-1.5 tabular-nums font-bold">${formatNum(iva21)} €</td></tr>`;
                if (pSummary) pSummary.innerHTML = `<div class="flex flex-col items-end gap-3 w-full"><div class="proforma-total-box w-[240px] shadow-lg"><span class="text-[9px] font-bold uppercase tracking-widest mr-4">Total:</span><span class="text-lg tabular-nums font-black">${formatNum(netTotal)} €</span></div>${ivaRows ? `<table class="text-[9px] w-[300px] border-collapse border border-gray-200 rounded-lg overflow-hidden"><thead><tr class="bg-gray-50"><td colspan="2" class="text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Desglose Fiscal</td></tr></thead><tbody class="font-mono text-[9px]">${ivaRows}</tbody></table>` : ''}</div>`;
                if (pBank) pBank.innerHTML = `<div class="mt-3 w-full h-px bg-slate-200"></div><div style="margin-top:8px; display:flex; align-items:stretch; border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; background:white;"><div style="width:4px; background:#1e293b;"></div><div style="padding:8px 14px; flex:1;"><div style="font-size:5px; font-weight:700; text-transform:uppercase; color:#cbd5e1;">Transferencia Bancaria</div><div style="font-size:14px; font-weight:900; letter-spacing:0.08em; color:#0f172a; font-family:'Courier Prime', monospace;">${h.iban}</div><div style="font-size:6px; color:#94a3b8;">${h.bank} · Beneficiario: <strong>${h.company}</strong></div></div></div>`;
            }
            updatePaymentLink();
        }

        function updatePaymentLink() {
            const groupData = JSON.parse(localStorage.getItem('selectedGroup') || '{}');
            const h = HOTELS[currentHotel] || HOTELS['guadiana'];
            const payUrl = (()=>{ const l = groupData['Enlace_TPV'] || h.paymentGateway || ''; return (l && !l.startsWith('http')) ? 'https://'+l : l; })();
            const qrBlock = document.getElementById('payment-qr-block');
            if (qrBlock && payUrl) {
                qrBlock.style.display = sessionStorage.getItem('proforma_qr_hidden') === '1' ? 'none' : 'block';
                const qrLink = document.getElementById('payment-qr-link');
                const qrImg = document.getElementById('payment-qr-img');
                if (qrLink) qrLink.href = payUrl;
                if (qrImg) qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=100x100&color=064e3b&bgcolor=ffffff&data=' + encodeURIComponent(payUrl);
                const qrUrlSpan = document.getElementById('payment-raw-url-link');
                if (qrUrlSpan) { qrUrlSpan.innerText = payUrl; qrUrlSpan.href = payUrl; }
            } else if (qrBlock) qrBlock.style.display = 'none';

            const polDiv = document.getElementById('tpl-policies');
            if (polDiv && currentTemplate === 'confirmacion') {
                const allC = [...(window.globalConfig?.common?.confirmationClauses || []), ...(window.globalConfig?.[currentHotel]?.confirmationClauses || [])];
                if (allC.length > 0) {
                    const totalNeto = total - totalComision;

                        const parseClauseVariables = (text, title = "") => {
                            if (!text) return "";
                            let parsed = text;
                            
                            // Load latest payment plan from localStorage
                            const groupObj = JSON.parse(localStorage.getItem('selectedGroup') || '{}');
                            let plan = [];
                            try {
                                plan = JSON.parse(groupObj.PaymentPlan_JSON || "[]");
                            } catch(e){}

                            const t = title.toLowerCase();
                            const isDepositOrPayment = t.includes("depósito") || t.includes("deposito") || t.includes("pago") || t.includes("confirmaci");

                            if (plan && plan.length > 0 && isDepositOrPayment) {
                                const firstPayment = plan[0];
                                const secondPayment = plan[1];

                                // Replace 30% or {DEP_30} with actual deposit
                                parsed = parsed.replace(/30\s*%/g, firstPayment.percent + "% (" + formatNum(firstPayment.amount) + "€)");
                                parsed = parsed.replace(/{DEP_30}/g, firstPayment.percent + "% (" + formatNum(firstPayment.amount) + "€)");

                                if (secondPayment) {
                                    // Replace 7 días or {RELEASE_7} with actual release days
                                    parsed = parsed.replace(/7\s*días/gi, secondPayment.releaseDays + " días");
                                    parsed = parsed.replace(/7\s*dias/gi, secondPayment.releaseDays + " días");
                                    parsed = parsed.replace(/{RELEASE_7}/g, secondPayment.releaseDays + " días");

                                    // Replace 50% or 100% or {DEP_50} with final payment
                                    parsed = parsed.replace(/50\s*%/g, secondPayment.percent + "% (" + formatNum(secondPayment.amount) + "€)");
                                    parsed = parsed.replace(/{DEP_50}/g, secondPayment.percent + "% (" + formatNum(secondPayment.amount) + "€)");
                                    parsed = parsed.replace(/100\s*%/g, secondPayment.percent + "% (" + formatNum(secondPayment.amount) + "€)");
                                    parsed = parsed.replace(/{DEP_100}/g, secondPayment.percent + "% (" + formatNum(secondPayment.amount) + "€)");
                                }
                            }

                            parsed = parsed.replace(/{DEP_30}/g, formatNum(totalNeto * 0.3) + '€');
                            parsed = parsed.replace(/{DEP_50}/g, formatNum(totalNeto * 0.5) + '€');
                            parsed = parsed.replace(/{DEP_100}/g, formatNum(totalNeto) + '€');
                            
                            const getRelDate = (days) => {
                                const groupEntrada = groupData.Entrada || groupObj.Entrada;
                                if (!groupEntrada) return "[FECHA]";
                                let d = new Date(groupEntrada);
                                if (isNaN(d.getTime())) {
                                    const parts = groupEntrada.split('/');
                                    if(parts.length===3) d = new Date(parts[2], parts[1]-1, parts[0]);
                                }
                                if (isNaN(d.getTime())) return groupEntrada;
                                d.setDate(d.getDate() - days);
                                return d.toLocaleDateString('es-ES');
                            };
                            parsed = parsed.replace(/{RELEASE_30}/g, getRelDate(30));
                            parsed = parsed.replace(/{RELEASE_15}/g, getRelDate(15));
                            parsed = parsed.replace(/{RELEASE_7}/g, getRelDate(7));
                            return parsed;
                        };
    
                    polDiv.innerHTML = `<div class="mt-8 border-t border-slate-100 pt-6"><div class="flex items-center gap-2 mb-4"><div class="w-1 h-4 bg-slate-900 rounded-full"></div><h4 class="text-[10px] font-black uppercase tracking-[0.2em]">Cláusulas de Confirmación</h4></div><div class="grid grid-cols-2 gap-x-8 gap-y-4">${allC.map((c, i) => `<div class="space-y-1"><p class="text-[9px] font-black uppercase text-slate-500">${i + 1}. ${c.title}</p><p class="text-[8.5px] text-slate-500 leading-relaxed">${parseClauseVariables(c.body || "", c.title)}</p></div>`).join('')}</div></div>`;
                    polDiv.classList.remove('hidden');
                } else polDiv.classList.add('hidden');
            } else if (polDiv) polDiv.classList.add('hidden');
        }

        function printDoc() {
            updatePaymentLink();
            const noPrints = Array.from(document.querySelectorAll('.no-print'));
            noPrints.forEach(el => { el._savedDisplay = el.style.display; el.style.setProperty('display', 'none', 'important'); });
            const oldTitle = document.title;
            const groupData = JSON.parse(localStorage.getItem('selectedGroup') || '{}');
            document.title = (groupData["Reserva"] || groupData["id"] || '') + ' - ' + (groupData["Nombre del Grupo"] || '');
            setTimeout(() => { window.print(); document.title = oldTitle; noPrints.forEach(el => { el.style.display = el._savedDisplay || ''; delete el._savedDisplay; }); }, 80);
        }
    