
        const BUDGET_MODEL_TEMPLATES = [{"title":"Cupo y Disponibilidad","body":"La presente oferta es válida por 48 horas. Dado que se requiere el bloqueo total de instalaciones, la disponibilidad no se garantiza hasta el primer depósito. [EN] This offer is valid for 48 hours. Since total facility blocking is required, availability is not guaranteed until the first deposit."},{"title":"Confirmación y Depósito","body":"Bloqueo confirmado al recibir el 30% del total ({DEP_30}). El 70% restante deberá liquidarse 7 días antes de la entrada. [EN] Booking confirmed upon receipt of 30% of the total ({DEP_30}). The remaining 70% must be settled 7 days before entry."},{"title":"Política de Cancelación","body":"Al ser un evento de carácter exclusivo con bloqueo de inventario, todos los depósitos entregados tienen carácter de NO REEMBOLSABLES. [EN] Being an exclusive event with inventory blocking, all deposits delivered are NON-REFUNDABLE."},{"title":"Rooming List","body":"La relación detallada de ocupantes deberá entregarse 5 días hábiles antes de la llegada del primer pasajero. [EN] The detailed list of occupants must be delivered 5 business days before the arrival of the first passenger."}];
        const CONF_MODEL_TEMPLATES = [{"title":"Confirmación y Depósito","body":"Para garantizar la reserva definitiva, se requiere un primer depósito del 30% ({DEP_30}) en concepto de garantía. La reserva no se considerará confirmada hasta la recepción del mismo. [EN] To guarantee the definitive reservation, a first deposit of 30% ({DEP_30}) is required as a guarantee. The reservation will not be considered confirmed until it is received."},{"title":"Calendario de Pagos y Release","body":"Se establece un release de 30 días previos a la entrada ({RELEASE_30}), fecha en la cual el hotel deberá haber recibido el 50% del total ({DEP_50}). El pago final del 100% ({DEP_100}) deberá estar liquidado 7 días antes de la llegada ({RELEASE_7}). [EN] A release is established 30 days prior to entry ({RELEASE_30}), by which date the hotel must have received 50% of the total ({DEP_50}). The final payment of 100% ({DEP_100}) must be settled 7 days before arrival ({RELEASE_7})."},{"title":"Reducciones y Cancelaciones","body":"Se permite una reducción de hasta el 10% del número de habitaciones contratadas sin gastos hasta 15 días antes de la llegada ({RELEASE_15}). Cancelaciones totales posteriores a esta fecha incurrirán en un 100% de gastos. [EN] A reduction of up to 10% of the number of rooms contracted without charge is allowed until 15 days before arrival ({RELEASE_15}). Total cancellations after this date will incur 100% charges."},{"title":"Rooming List y Régimen","body":"La lista definitiva de ocupantes (Rooming List) deberá ser enviada antes del {RELEASE_7}. Cualquier cambio posterior queda sujeto a disponibilidad. [EN] The final list of occupants (Rooming List) must be sent before {RELEASE_7}. Any subsequent change is subject to availability."}];

        const { useState, useEffect, useRef } = React;

        // LucideIcon cargado desde js/icons.js (window.LucideIcon)

        // --- FIREBASE ---
        const db = window.db;

        const App = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const initialTab = urlParams.get('tab') || 'guadiana';
            const [activeHotel, setActiveHotel] = useState(initialTab);
            const [loading, setLoading] = useState(false);
            const [message, setMessage] = useState(null);
            const [editingCommercialIdx, setEditingCommercialIdx] = useState(null);
            const [editingCommercialName, setEditingCommercialName] = useState('');
            // Estados para Administración de Usuarios
            const [userSearch, setUserSearch] = useState('');
            const [showAddUserModal, setShowAddUserModal] = useState(false);
            const [newUserData, setNewUserData] = useState({ name: '', email: '', role: 'Comercial', pass: '1234' });
            const [resetPassUser, setResetPassUser] = useState(null);
            const [config, setConfig] = useState({
                guadiana: {
                    name: "Hotel",
                    subname: "Guadiana",
                    company: "SWEETMOON DESARROLLOS S.L.",
                    nif: "B87067302",
                    legal: "Inscrito en la hoja CR-00035559 del Registro Mercantil de Ciudad Real. Folio electrónico. Inscripción/anotación 4",
                    irus: "1000292995580",
                    address: "C/ Guadiana, 36",
                    cp: "13002",
                    city: "Ciudad Real",
                    tel: "926 22 33 13",
                    email: "info@hotelguadiana.es",
                    web: "www.hotelguadiana.es",
                    bank: "Globalcaja",
                    iban: "ES30 3190 3953 1851 8526 3521",
                    paymentGateway: "",
                    clauses: [
          {
                    "title": "Cupo y Disponibilidad",
                    "body": "La presente oferta es válida por 48 horas. Dado que se requiere el bloqueo total de instalaciones, la disponibilidad no se garantiza hasta el primer depósito. [EN] This offer is valid for 48 hours. Since total facility blocking is required, availability is not guaranteed until the first deposit."
          },
          {
                    "title": "Confirmación y Depósito",
                    "body": "Bloqueo confirmado al recibir el 30% del total ({DEP_30}). El 70% restante deberá liquidarse 7 días antes de la entrada. [EN] Booking confirmed upon receipt of 30% of the total ({DEP_30}). The remaining 70% must be settled 7 days before entry."
          },
          {
                    "title": "Política de Cancelación",
                    "body": "Al ser un evento de carácter exclusivo con bloqueo de inventario, todos los depósitos entregados tienen carácter de NO REEMBOLSABLES. [EN] Being an exclusive event with inventory blocking, all deposits delivered are NON-REFUNDABLE."
          },
          {
                    "title": "Rooming List",
                    "body": "La relación detallada de ocupantes deberá entregarse 5 días hábiles antes de la llegada del primer pasajero. [EN] The detailed list of occupants must be delivered 5 business days before the arrival of the first passenger."
          }
],
                    confirmationClauses: [
          {
                    "title": "Confirmación y Depósito",
                    "body": "Para garantizar la reserva definitiva, se requiere un primer depósito del 30% ({DEP_30}) en concepto de garantía. La reserva no se considerará confirmada hasta la recepción del mismo. [EN] To guarantee the definitive reservation, a first deposit of 30% ({DEP_30}) is required as a guarantee. The reservation will not be considered confirmed until it is received."
          },
          {
                    "title": "Calendario de Pagos y Release",
                    "body": "Se establece un release de 30 días previos a la entrada ({RELEASE_30}), fecha en la cual el hotel deberá haber recibido el 50% del total ({DEP_50}). El pago final del 100% ({DEP_100}) deberá estar liquidado 7 días antes de la llegada ({RELEASE_7}). [EN] A release is established 30 days prior to entry ({RELEASE_30}), by which date the hotel must have received 50% of the total ({DEP_50}). The final payment of 100% ({DEP_100}) must be settled 7 days before arrival ({RELEASE_7})."
          },
          {
                    "title": "Reducciones y Cancelaciones",
                    "body": "Se permite una reducción de hasta el 10% del número de habitaciones contratadas sin gastos hasta 15 días antes de la llegada ({RELEASE_15}). Cancelaciones totales posteriores a esta fecha incurrirán en un 100% de gastos. [EN] A reduction of up to 10% of the number of rooms contracted without charge is allowed until 15 days before arrival ({RELEASE_15}). Total cancellations after this date will incur 100% charges."
          },
          {
                    "title": "Rooming List y Régimen",
                    "body": "La lista definitiva de ocupantes (Rooming List) deberá ser enviada antes del {RELEASE_7}. Cualquier cambio posterior queda sujeto a disponibilidad. [EN] The final list of occupants (Rooming List) must be sent before {RELEASE_7}. Any subsequent change is subject to availability."
          }
]
                },
                cumbria: {
                    name: "Hotel",
                    subname: "Cumbria",
                    company: "MOON FREE PORT, S.L.",
                    nif: "B87895058",
                    legal: "Inscrito en el tomo 699 de libro 0 folio 2 hoja CR-32491 inscripción 2ª",
                    irus: "",
                    address: "Ctra. Fuencaliente, s/n",
                    cp: "13004",
                    city: "Ciudad Real",
                    tel: "926 25 10 25",
                    email: "recepcion@hotelcumbria.es",
                    web: "www.hotelcumbria.es",
                    bank: "Caixabank",
                    iban: "ES19 3081 0601 0850 0004 8966",
                    paymentGateway: "",
                    clauses: [
          {
                    "title": "Cupo y Disponibilidad",
                    "body": "La presente oferta es válida por 48 horas. Dado que se requiere el bloqueo total de instalaciones, la disponibilidad no se garantiza hasta el primer depósito. [EN] This offer is valid for 48 hours. Since total facility blocking is required, availability is not guaranteed until the first deposit."
          },
          {
                    "title": "Confirmación y Depósito",
                    "body": "Bloqueo confirmado al recibir el 30% del total ({DEP_30}). El 70% restante deberá liquidarse 7 días antes de la entrada. [EN] Booking confirmed upon receipt of 30% of the total ({DEP_30}). The remaining 70% must be settled 7 days before entry."
          },
          {
                    "title": "Política de Cancelación",
                    "body": "Al ser un evento de carácter exclusivo con bloqueo de inventario, todos los depósitos entregados tienen carácter de NO REEMBOLSABLES. [EN] Being an exclusive event with inventory blocking, all deposits delivered are NON-REFUNDABLE."
          },
          {
                    "title": "Rooming List",
                    "body": "La relación detallada de ocupantes deberá entregarse 5 días hábiles antes de la llegada del primer pasajero. [EN] The detailed list of occupants must be delivered 5 business days before the arrival of the first passenger."
          }
],
                    confirmationClauses: [
          {
                    "title": "Confirmación y Depósito",
                    "body": "Para garantizar la reserva definitiva, se requiere un primer depósito del 30% ({DEP_30}) en concepto de garantía. La reserva no se considerará confirmada hasta la recepción del mismo. [EN] To guarantee the definitive reservation, a first deposit of 30% ({DEP_30}) is required as a guarantee. The reservation will not be considered confirmed until it is received."
          },
          {
                    "title": "Calendario de Pagos y Release",
                    "body": "Se establece un release de 30 días previos a la entrada ({RELEASE_30}), fecha en la cual el hotel deberá haber recibido el 50% del total ({DEP_50}). El pago final del 100% ({DEP_100}) deberá estar liquidado 7 días antes de la llegada ({RELEASE_7}). [EN] A release is established 30 days prior to entry ({RELEASE_30}), by which date the hotel must have received 50% of the total ({DEP_50}). The final payment of 100% ({DEP_100}) must be settled 7 days before arrival ({RELEASE_7})."
          },
          {
                    "title": "Reducciones y Cancelaciones",
                    "body": "Se permite una reducción de hasta el 10% del número de habitaciones contratadas sin gastos hasta 15 días antes de la llegada ({RELEASE_15}). Cancelaciones totales posteriores a esta fecha incurrirán en un 100% de gastos. [EN] A reduction of up to 10% of the number of rooms contracted without charge is allowed until 15 days before arrival ({RELEASE_15}). Total cancellations after this date will incur 100% charges."
          },
          {
                    "title": "Rooming List y Régimen",
                    "body": "La lista definitiva de ocupantes (Rooming List) deberá ser enviada antes del {RELEASE_7}. Cualquier cambio posterior queda sujeto a disponibilidad. [EN] The final list of occupants (Rooming List) must be sent before {RELEASE_7}. Any subsequent change is subject to availability."
          }
]
                },
                system: {
                    pin: "1234",
                    geminiModel: "gemini-2.4-flash",
                    iaStatus: "Online",
                    commercials: ["NATALIO", "EMILIA", "CANDELARIA", "MARTA"],
                    users: [
                        { email: "dianahotelguadiana@gmail.com", pass: "1234", name: "Diana", role: "Comercial" },
                        { email: "ssanchez@hotelguadiana.es", pass: "1234", name: "Sergio", role: "Dirección" },
                        { email: "osanchez@hotelguadiana.es", pass: "1234", name: "Oscar", role: "Dirección" },
                        { email: "comunicaciones@hotelguadiana.es", pass: "1234", name: "Natalio", role: "Administrador" }
                    ]
                },
                common: {
                    services: [
                        { label: "Habitación Doble (DBL)", pax: 2, isService: false },
                        { label: "Hab. Doble Uso Individual (DUI)", pax: 1, isService: false },
                        { label: "Habitación Triple (TPL)", pax: 3, isService: false },
                        { label: "Habitación Triple Niño (TPL Niño)", pax: 3, isService: false },
                        { label: "Habitación Cuádruple (CUA)", pax: 4, isService: false },
                        { label: "Habitación Individual (IND)", pax: 1, isService: false },
                        { label: "Suite (SUI)", pax: 2, isService: false },
                        { label: "Suite Superior (S.SUP)", pax: 2, isService: false },
                        { label: "Junior Suite", pax: 2, isService: false },
                        { label: "Suite", pax: 2, isService: false },
                        { label: "Almuerzo", pax: 1, isService: true },
                        { label: "Cena", pax: 1, isService: true },
                        { label: "Desayuno", pax: 1, isService: true }
                    ],
                    clauses: [
          {
                    "title": "VALIDEZ Y DISPONIBILIDAD / VALIDITY & AVAILABILITY",
                    "body": "Este presupuesto tiene una validez de 7 días. Las habitaciones no quedan bloqueadas y, pasado este plazo, tanto la disponibilidad como las tarifas pueden presentar cambios. [EN] This quote is valid for 7 days. Rooms are not blocked and, after this period, both availability and rates are subject to change."
          },
          {
                    "title": "CÓMO CONFIRMAR / HOW TO CONFIRM",
                    "body": "Para confirmar su reserva, simplemente responda a este correo manifestando su aceptación. Una vez recibida su respuesta, procederemos a bloquear las habitaciones y le enviaremos la confirmación definitiva. [EN] To confirm your booking, simply reply to this email stating your acceptance. Upon receipt, we will proceed to block the rooms and send you the final confirmation."
          }
],
                    confirmationClauses: [
          {
                    "title": "CONFIRMACIÓN Y DEPÓSITO / CONFIRMATION & DEPOSIT",
                    "body": "Para garantizar la reserva definitiva, se requiere un primer depósito del 30% ({DEP_30}) en concepto de garantía. La reserva no se considerará confirmada hasta la recepción del mismo. [EN] To guarantee the definitive reservation, a first deposit of 30% ({DEP_30}) is required as a guarantee. The reservation will not be considered confirmed until it is received."
          },
          {
                    "title": "CALENDARIO DE PAGOS / PAYMENT SCHEDULE",
                    "body": "El pago restante deberá realizarse según los plazos establecidos en el plan de pagos adjunto. [EN] The remaining payment must be made according to the deadlines established in the attached payment plan."
          }
]
                }
            });

            useEffect(() => {
                // Cargar config desde Firestore si existe
                db.collection("settings").doc("main").get().then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        setConfig(prev => {
                            const cloudUsers = (data.system && Array.isArray(data.system.users) && data.system.users.length > 0)
                                ? data.system.users
                                : prev.system.users;
                            return {
                                ...prev,
                                ...data,
                                system: {
                                    ...prev.system,
                                    ...(data.system || {}),
                                    users: cloudUsers
                                }
                            };
                        });
                    }
                });
                // Lucide se maneja ahora a través del componente LucideIcon
            }, []);

            const saveConfig = async () => {
                setLoading(true);
                try {
                    await db.collection("settings").doc("main").set(config);
                    setMessage({ type: 'success', text: 'Configuración guardada correctamente en la nube.' });
                } catch (e) {
                    setMessage({ type: 'error', text: 'Error al persistir datos. Revisa permisos.' });
                }
                setLoading(false);
                setTimeout(() => setMessage(null), 3000);
            };

            const handleTranslateClause = async (idx, fieldKey, hotel) => {
                const currentList = [...(config[hotel][fieldKey] || [])];
                const textToTranslate = currentList[idx].body.split('[EN]')[0].trim();
                if (!textToTranslate) return;

                try {
                    const prompt = `Traduce el siguiente texto de un presupuesto de hotel al inglés. Mantén un tono profesional y corporativo. Devuelve SOLO el texto traducido, sin comillas ni introducciones: "${textToTranslate}"`;
                    const aiResult = await window.callGemini(prompt);
                    if (aiResult?.ok) {
                        currentList[idx].body = `${textToTranslate} [EN] ${aiResult.text.trim()}`;
                        handleChange(hotel, fieldKey, currentList);
                    } else {
                        alert("Error en la traducción: " + (aiResult?.error || "Desconocido"));
                    }
                } catch (e) {
                    alert("Error al conectar con la IA.");
                }
            };

            const handleChange = (hotel, field, value) => {
                setConfig(prev => ({
                    ...prev,
                    [hotel]: {
                        ...prev[hotel],
                        [field]: value
                    }
                }));
            };

            const handleCreateUser = async () => {
                const name = (newUserData.name || '').trim();
                const email = (newUserData.email || '').trim();
                const role = newUserData.role || "Comercial";
                const pass = (newUserData.pass || '').trim();

                if (!name) {
                    alert("Por favor, introduce el nombre del usuario.");
                    return;
                }
                if (!email) {
                    alert("Por favor, introduce el correo electrónico del usuario.");
                    return;
                }
                if (!pass || pass.length < 4) {
                    alert("La contraseña debe tener al menos 4 caracteres.");
                    return;
                }

                const currentUsers = [...(config.system?.users || [])];
                const emailLower = email.toLowerCase();
                if (currentUsers.some(u => (u.email || '').toLowerCase() === emailLower)) {
                    alert("Ya existe un usuario registrado con este correo electrónico.");
                    return;
                }

                const newUser = {
                    id: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
                    name: name,
                    email: email,
                    role: role,
                    pass: pass,
                    active: true,
                    revoked: false
                };

                const updatedUsers = [...currentUsers, newUser];
                const updatedConfig = {
                    ...config,
                    system: {
                        ...(config.system || {}),
                        users: updatedUsers
                    }
                };

                setConfig(updatedConfig);
                setLoading(true);
                try {
                    await db.collection("settings").doc("main").set(updatedConfig);
                    setMessage({ type: 'success', text: `Usuario "${name}" creado correctamente en el sistema.` });
                    setShowAddUserModal(false);
                    setNewUserData({ name: '', email: '', role: 'Comercial', pass: '1234' });
                } catch(e) {
                    setMessage({ type: 'error', text: 'Error al persistir el nuevo usuario en Firestore.' });
                }
                setLoading(false);
                setTimeout(() => setMessage(null), 3500);
            };

            const handleToggleRevokeUser = async (idx) => {
                const users = [...(config.system?.users || [])];
                const target = users[idx];
                if (!target) return;

                const isNatalio = (target.name && target.name.toLowerCase() === 'natalio') || 
                                  (target.email && target.email.toLowerCase().includes('comunicaciones@hotelguadiana.es'));
                if (isNatalio) {
                    alert("Por seguridad, no es posible revocar el acceso a la cuenta principal del Administrador (Natalio).");
                    return;
                }

                const currentlyRevoked = target.revoked === true || target.active === false;
                const nextRevoked = !currentlyRevoked;

                if (nextRevoked) {
                    const ok = window.confirm(`¿Confirmas que deseas REVOCAR el acceso a "${target.name}"? El usuario no podrá iniciar sesión en Nexus Groups.`);
                    if (!ok) return;
                }

                users[idx] = {
                    ...target,
                    revoked: nextRevoked,
                    active: !nextRevoked
                };

                const updatedConfig = {
                    ...config,
                    system: {
                        ...(config.system || {}),
                        users: users
                    }
                };

                setConfig(updatedConfig);
                setLoading(true);
                try {
                    await db.collection("settings").doc("main").set(updatedConfig);
                    setMessage({
                        type: 'success',
                        text: nextRevoked ? `Acceso de "${target.name}" revocado correctamente.` : `Acceso de "${target.name}" reactivado correctamente.`
                    });
                } catch(e) {
                    setMessage({ type: 'error', text: 'Error al actualizar el estado del usuario.' });
                }
                setLoading(false);
                setTimeout(() => setMessage(null), 3500);
            };

            const handleResetUserPass = async (idx, newPass) => {
                const trimmed = (newPass || '').trim();
                if (!trimmed || trimmed.length < 4) {
                    alert("La contraseña debe contener al menos 4 caracteres.");
                    return;
                }

                const users = [...(config.system?.users || [])];
                const target = users[idx];
                if (!target) return;

                users[idx] = {
                    ...target,
                    pass: trimmed
                };

                const updatedConfig = {
                    ...config,
                    system: {
                        ...(config.system || {}),
                        users: users
                    }
                };

                setConfig(updatedConfig);
                setLoading(true);
                try {
                    await db.collection("settings").doc("main").set(updatedConfig);
                    setMessage({ type: 'success', text: `Contraseña de "${target.name}" restablecida con éxito a "${trimmed}".` });
                    setResetPassUser(null);
                } catch(e) {
                    setMessage({ type: 'error', text: 'Error al actualizar la contraseña en Firestore.' });
                }
                setLoading(false);
                setTimeout(() => setMessage(null), 3500);
            };

            const handleDeleteUser = async (idx) => {
                const users = [...(config.system?.users || [])];
                const target = users[idx];
                if (!target) return;

                const isNatalio = (target.name && target.name.toLowerCase() === 'natalio') || 
                                  (target.email && target.email.toLowerCase().includes('comunicaciones@hotelguadiana.es'));
                if (isNatalio) {
                    alert("No es posible eliminar la cuenta principal del Administrador (Natalio).");
                    return;
                }

                const ok = window.confirm(`¿Estás seguro de que deseas ELIMINAR permanentemente a "${target.name}" (${target.email})? Esta acción no se puede deshacer.`);
                if (!ok) return;

                users.splice(idx, 1);

                const updatedConfig = {
                    ...config,
                    system: {
                        ...(config.system || {}),
                        users: users
                    }
                };

                setConfig(updatedConfig);
                setLoading(true);
                try {
                    await db.collection("settings").doc("main").set(updatedConfig);
                    setMessage({ type: 'success', text: `Usuario "${target.name}" eliminado de la plataforma.` });
                } catch(e) {
                    setMessage({ type: 'error', text: 'Error al eliminar el usuario en Firestore.' });
                }
                setLoading(false);
                setTimeout(() => setMessage(null), 3500);
            };

            return (
                <div className="flex min-h-screen">
                    {/* Sidebar duplicado para consistencia */}
                    <div className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 p-6 flex flex-col z-30 shadow-xl overflow-y-auto custom-scrollbar">
                        <div className="flex flex-col items-center mb-10 px-2 space-y-6">
                            <img src="Nexus Groups/Nexus_Groups-removebg-preview.png" className="h-16 w-auto object-contain" alt="Logo" />
                            <div className="h-[1px] w-full bg-slate-100"></div>
                        </div>

                        <nav className="flex-1 space-y-2">
                            <button onClick={() => window.location.href = 'Admin.html'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50">
                                <LucideIcon name="layout-dashboard" className="w-5 h-5" />
                                Volver al Panel
                            </button>
                            <div className="pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Entidades</div>
                            <button onClick={() => setActiveHotel('guadiana')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeHotel === 'guadiana' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <LucideIcon name="hotel" className="w-5 h-5" />
                                Sercotel Guadiana
                            </button>
                            <button onClick={() => setActiveHotel('cumbria')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeHotel === 'cumbria' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <LucideIcon name="palmtree" className="w-5 h-5" />
                                Cumbria Spa&Hotel
                            </button>
                            <button onClick={() => setActiveHotel('system')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeHotel === 'system' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <LucideIcon name="cpu" className="w-5 h-5" />
                                Sistema e IA
                            </button>
                            <button onClick={() => setActiveHotel('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeHotel === 'users' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <LucideIcon name="shield-check" className="w-5 h-5" />
                                Usuarios y Accesos
                            </button>
                            <button onClick={() => setActiveHotel('commercials')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeHotel === 'commercials' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <LucideIcon name="users" className="w-5 h-5" />
                                Agentes Comerciales
                            </button>
                            <div className="pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4">Global</div>
                            <button onClick={() => setActiveHotel('services')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeHotel === 'services' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <LucideIcon name="box" className="w-5 h-5" />
                                Catálogo de Servicios
                            </button>
                            <button onClick={() => window.open('https://nataliogc.github.io/menus-eventos/admin.html', '_blank')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50">
                                <LucideIcon name="utensils" className="w-5 h-5" />
                                Menús Eventos
                            </button>
                            <button onClick={() => window.open('https://nataliogc.github.io/Menus-Turisticos/', '_blank')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50">
                                <LucideIcon name="map" className="w-5 h-5" />
                                Menús Turísticos
                            </button>
                            <button onClick={() => window.open('https://nataliogc.github.io/menus-cocteles/', '_blank')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50">
                                <LucideIcon name="martini" className="w-5 h-5" />
                                Menús Cócteles
                            </button>
                            <button onClick={() => window.location.href = 'Peticiones.html'} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50">
                                <LucideIcon name="inbox" className="w-5 h-5" />
                                Peticiones
                            </button>
                        </nav>

                        <button
                            onClick={saveConfig}
                            disabled={loading}
                            className="mt-auto w-full bg-[#2d5a43] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#1e3a2c] transition-all flex items-center justify-center gap-2 "
                        >
                            <LucideIcon name="save" className="w-4 h-4" />
                            {loading ? 'Guardando...' : 'Guardar Todo'}
                        </button>
                    </div>

                    {/* Contenido Principal */}
                    <main className="ml-64 p-12 w-full max-w-5xl">
                        <header className="mb-12 flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Centro de <span className="text-[#2d5a43]">Configuración</span></h1>
                                <p className="text-slate-500 mt-2">Mantenimiento de bases de datos maestras y parámetros globales.</p>
                            </div>
                            {message && (
                                <div className={`px-6 py-3 rounded-2xl border text-xs font-bold animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                    {message.text}
                                </div>
                            )}
                        </header>

                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center gap-4">
                                <div className="p-4 bg-white rounded-2xl shadow-sm">
                                    <LucideIcon name={activeHotel === 'users' ? 'shield-check' : activeHotel === 'system' ? 'settings-2' : activeHotel === 'commercials' ? 'users' : activeHotel === 'services' ? 'box' : 'building-2'} className="w-6 h-6 text-[#2d5a43]" />
                                </div>
                                {activeHotel === 'users' ? (
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 uppercase">Gestión de Usuarios y Accesos</h3>
                                        <p className="text-xs text-slate-400">Control centralizado de cuentas autorizadas, contraseñas y permisos de acceso.</p>
                                    </div>
                                ) : activeHotel === 'commercials' ? (
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 uppercase">Base de Datos de Personal</h3>
                                        <p className="text-xs text-slate-400">Gestiona los agentes comerciales autorizados en el sistema.</p>
                                    </div>
                                ) : activeHotel === 'services' ? (
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 uppercase">Catálogo de Servicios</h3>
                                        <p className="text-xs text-slate-400">Inventario global de habitaciones, complementos y servicios extra.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 uppercase">
                                            {activeHotel === 'system' ? 'Parámetros del Sistema' : `Configuración ${activeHotel.charAt(0).toUpperCase() + activeHotel.slice(1)}`}
                                        </h3>
                                        <p className="text-xs text-slate-400">Edita los valores que aparecerán en las facturas y documentos oficiales.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-10">
                                {activeHotel === 'users' ? (
                                    <div className="space-y-6 animate-fade-in">
                                        {/* Banner superior de control */}
                                        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e3a2c] rounded-3xl p-7 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                                            <div className="relative z-10 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                        Seguridad Cloud
                                                    </span>
                                                    <span className="text-slate-300 text-xs font-semibold">• Panel de Administración</span>
                                                </div>
                                                <h4 className="text-xl font-bold text-white tracking-tight">Directorio de Usuarios y Credenciales</h4>
                                                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                                                    Gestiona las altas de nuevos colaboradores, restablece contraseñas al instante o revoca temporalmente el acceso sin perder el historial.
                                                </p>
                                                <div className="flex items-center gap-4 pt-2 text-xs">
                                                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                        <span className="font-bold">{(config.system?.users || []).filter(u => u.active !== false && !u.revoked).length} Activos</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                                                        <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                                                        <span className="font-bold">{(config.system?.users || []).filter(u => u.revoked === true || u.active === false).length} Revocados</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative z-10 flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAddUserModal(true)}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                                                >
                                                    <LucideIcon name="user-plus" className="w-4 h-4" />
                                                    Nuevo Usuario
                                                </button>
                                            </div>
                                        </div>

                                        {/* Buscador de usuarios */}
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                            <div className="relative flex-1 max-w-md">
                                                <input
                                                    type="text"
                                                    value={userSearch}
                                                    onChange={(e) => setUserSearch(e.target.value)}
                                                    placeholder="Buscar por nombre, correo o rol..."
                                                    className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-[#2d5a43] transition-all shadow-xs"
                                                />
                                                <div className="absolute left-3.5 top-3 text-slate-400 pointer-events-none">
                                                    <LucideIcon name="search" className="w-3.5 h-3.5" />
                                                </div>
                                                {userSearch && (
                                                    <button type="button" onClick={() => setUserSearch('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                                                        <LucideIcon name="x" className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-[11px] font-bold text-slate-400 text-right">
                                                {(config.system?.users || []).length} usuarios configurados en el sistema
                                            </div>
                                        </div>

                                        {/* Tabla / Tarjetas de Usuarios */}
                                        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100">
                                            {(() => {
                                                const rawUsers = config.system?.users || [];
                                                const searchLow = (userSearch || '').toLowerCase().trim();
                                                const filtered = searchLow
                                                    ? rawUsers.filter(u => 
                                                        (u.name && u.name.toLowerCase().includes(searchLow)) ||
                                                        (u.email && u.email.toLowerCase().includes(searchLow)) ||
                                                        (u.role && u.role.toLowerCase().includes(searchLow))
                                                      )
                                                    : rawUsers;

                                                if (filtered.length === 0) {
                                                    return (
                                                        <div className="p-12 text-center text-slate-400 space-y-2">
                                                            <LucideIcon name="users" className="w-8 h-8 mx-auto text-slate-300" />
                                                            <p className="text-xs font-bold">No se encontraron usuarios coincidentes.</p>
                                                        </div>
                                                    );
                                                }

                                                return filtered.map((u, fIdx) => {
                                                    const originalIdx = rawUsers.indexOf(u);
                                                    const isRevoked = u.revoked === true || u.active === false;
                                                    const isNatalio = (u.name && u.name.toLowerCase() === 'natalio') || 
                                                                      (u.email && u.email.toLowerCase().includes('comunicaciones@hotelguadiana.es'));

                                                    const roleBadgeClass = 
                                                        u.role === 'Administrador' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                        u.role === 'Dirección' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                        u.role === 'Recepción' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                        'bg-emerald-50 text-emerald-700 border-emerald-200';

                                                    const avatarBg =
                                                        u.role === 'Administrador' ? 'from-purple-700 to-indigo-600' :
                                                        u.role === 'Dirección' ? 'from-indigo-700 to-teal-600' :
                                                        'from-[#2d5a43] to-emerald-500';

                                                    return (
                                                        <div key={fIdx} className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${isRevoked ? 'bg-rose-50/20' : 'hover:bg-slate-50/60'}`}>
                                                            {/* Datos del usuario */}
                                                            <div className="flex items-center gap-3.5 min-w-0">
                                                                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${avatarBg} text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 select-none`}>
                                                                    {(u.name || 'U').charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                        <span className={`text-sm font-bold ${isRevoked ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                                                                            {u.name}
                                                                        </span>
                                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${roleBadgeClass}`}>
                                                                            {u.role || 'Comercial'}
                                                                        </span>
                                                                        {isRevoked ? (
                                                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-wider flex items-center gap-1">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                                                Acceso Revocado
                                                                            </span>
                                                                        ) : (
                                                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider flex items-center gap-1">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                                Activo
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                                                        <span className="truncate">{u.email}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Botones de acción */}
                                                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                                                {/* Resetear Clave */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setResetPassUser({ idx: originalIdx, user: u, newPass: '' })}
                                                                    className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-amber-50 hover:text-amber-700 border border-slate-200 hover:border-amber-200 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                                                    title={`Resetear contraseña de ${u.name}`}
                                                                >
                                                                    <LucideIcon name="key" className="w-3.5 h-3.5 text-amber-500" />
                                                                    <span>Resetear Clave</span>
                                                                </button>

                                                                {/* Revocar / Reactivar */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleToggleRevokeUser(originalIdx)}
                                                                    disabled={isNatalio}
                                                                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                                                                        isNatalio
                                                                            ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-400'
                                                                            : isRevoked
                                                                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                                                                : 'bg-white hover:bg-rose-50 text-rose-600 border-slate-200 hover:border-rose-200'
                                                                    }`}
                                                                    title={isNatalio ? 'La cuenta del Administrador principal no puede ser revocada' : isRevoked ? 'Reactivar acceso' : 'Revocar acceso'}
                                                                >
                                                                    <LucideIcon name={isRevoked ? 'user-check' : 'user-x'} className="w-3.5 h-3.5" />
                                                                    <span>{isRevoked ? 'Reactivar Acceso' : 'Revocar Acceso'}</span>
                                                                </button>

                                                                {/* Eliminar */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteUser(originalIdx)}
                                                                    disabled={isNatalio}
                                                                    className={`p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer ${isNatalio ? 'opacity-20 cursor-not-allowed' : ''}`}
                                                                    title={isNatalio ? 'No se puede eliminar al Administrador' : `Eliminar a ${u.name}`}
                                                                >
                                                                    <LucideIcon name="trash-2" className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                ) : activeHotel === 'services' ? (
                                    <div className="max-w-3xl space-y-8 animate-fade-in">
                                        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 tracking-tight">Inventario de Desplegables</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Añade o edita servicios</p>
                                                </div>
                                                <button
                                                    onClick={() => handleChange('common', 'services', [...(config.common?.services || []), { label: "Nuevo Servicio", pax: 1, isService: true }])}
                                                    className="bg-[#2d5a43] text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-[#1e3a2c] transition-all flex items-center gap-2"
                                                >
                                                    <LucideIcon name="plus" className="w-4 h-4" />
                                                    Añadir Servicio
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {(config.common?.services || []).map((srv, idx) => (
                                                    <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <div className="flex-1 min-w-[200px]">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Nombre</label>
                                                            <input
                                                                type="text"
                                                                value={srv.label}
                                                                onChange={(e) => {
                                                                    const arr = [...config.common.services];
                                                                    arr[idx].label = e.target.value;
                                                                    handleChange('common', 'services', arr);
                                                                }}
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#2d5a43] outline-none"
                                                            />
                                                        </div>
                                                        <div className="w-24">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Pax / Uds</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={srv.pax}
                                                                onChange={(e) => {
                                                                    const arr = [...config.common.services];
                                                                    arr[idx].pax = Number(e.target.value) || 0;
                                                                    handleChange('common', 'services', arr);
                                                                }}
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-center focus:border-[#2d5a43] outline-none"
                                                            />
                                                        </div>
                                                        <div className="w-32">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1">Tipo</label>
                                                            <select
                                                                value={srv.isService ? 'true' : 'false'}
                                                                onChange={(e) => {
                                                                    const arr = [...config.common.services];
                                                                    arr[idx].isService = e.target.value === 'true';
                                                                    handleChange('common', 'services', arr);
                                                                }}
                                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#2d5a43] outline-none"
                                                            >
                                                                <option value="false">Habitación</option>
                                                                <option value="true">Servicio Extra</option>
                                                            </select>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const arr = config.common.services.filter((_, i) => i !== idx);
                                                                handleChange('common', 'services', arr);
                                                            }}
                                                            className="mt-5 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Eliminar"
                                                        >
                                                            <LucideIcon name="trash-2" className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(!config.common?.services || config.common.services.length === 0) && (
                                                    <div className="text-center py-8 text-slate-400 font-bold text-sm">
                                                        No hay servicios registrados.
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Global Clauses — Presupuestos */}
                                        {[
                                            { key: 'clauses', title: 'Cláusulas Globales (Presupuesto)', subtitle: 'Aplican a todos los hoteles salvo que el hotel tenga las suyas propias.' },
                                            { key: 'confirmationClauses', title: 'Cláusulas Globales (Confirmación)', subtitle: 'Aplican a todos los hoteles en la carta de confirmación.' }
                                        ].map(({ key, title, subtitle }) => (
                                            <div key={key} className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 tracking-tight">{title}</h4>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{subtitle}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleChange('common', key, [...(config.common?.[key] || []), { title: 'Nueva Cláusula', body: '' }])}
                                                        className="bg-[#2d5a43] text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-[#1e3a2c] transition-all flex items-center gap-2"
                                                    >
                                                        <LucideIcon name="plus" className="w-4 h-4" />
                                                        Añadir
                                                    </button>
                                                </div>
                                                {((config.common?.[key] || []).length > 0) && (config.common?.[key] || []).map((clause, idx) => (
                                                    <div key={idx} className={`border border-slate-100 rounded-2xl p-5 space-y-4 relative group ${key === 'clauses' ? 'bg-indigo-50/30' : 'bg-emerald-50/30'}`}>
                                                        <div className="flex gap-2 items-start">
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        value={clause.title}
                                                                        onChange={(e) => {
                                                                            const arr = [...config.common[key]];
                                                                            arr[idx] = { ...arr[idx], title: e.target.value };
                                                                            handleChange('common', key, arr);
                                                                        }}
                                                                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#2d5a43] outline-none shadow-sm"
                                                                        placeholder="Título de la cláusula"
                                                                    />
                                                                    <button 
                                                                        onClick={() => handleTranslateClause(idx, key, 'common')}
                                                                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm ${key === 'clauses' ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                                                                        title="Traducir al Inglés con IA"
                                                                    >
                                                                        <LucideIcon name="languages" className="w-4 h-4" />
                                                                        Traducir
                                                                    </button>
                                                                </div>
                                                                <textarea
                                                                    value={clause.body}
                                                                    onChange={(e) => {
                                                                        const arr = [...config.common[key]];
                                                                        arr[idx] = { ...arr[idx], body: e.target.value };
                                                                        handleChange('common', key, arr);
                                                                    }}
                                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:border-[#2d5a43] outline-none min-h-[80px] resize-none shadow-sm"
                                                                    placeholder="Cuerpo de la cláusula. Puedes usar {DEP_30} para el 30% del total."
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    const arr = config.common[key].filter((_, i) => i !== idx);
                                                                    handleChange('common', key, arr);
                                                                }}
                                                                className="mt-1 w-9 h-9 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                            >
                                                                <LucideIcon name="trash-2" className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ) : activeHotel === 'commercials' ? (
                                    <div className="max-w-xl space-y-8">
                                        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 tracking-tight">Agentes Comerciales</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Personal de Ventas</p>
                                                </div>
                                                <LucideIcon name="users" className="text-[#2d5a43] opacity-20 w-8 h-8" />
                                            </div>

                                            <div className="flex gap-2 mb-8 mt-2">
                                                <input
                                                    type="text"
                                                    id="new-commercial-input"
                                                    placeholder="Añadir nuevo comercial..."
                                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#2d5a43] outline-none transition-all"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                                            const val = e.target.value.trim().toUpperCase();
                                                            const currentList = config.system.commercials || [];
                                                            const exists = currentList.some(comm => (typeof comm === 'object' ? comm.name : comm) === val);
                                                            if (!exists) {
                                                                handleChange('system', 'commercials', [...currentList, { name: val, active: true }]);
                                                                e.target.value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const input = document.getElementById('new-commercial-input');
                                                        const val = input.value.trim().toUpperCase();
                                                        const currentList = config.system.commercials || [];
                                                        const exists = currentList.some(comm => (typeof comm === 'object' ? comm.name : comm) === val);
                                                        if (val && !exists) {
                                                            handleChange('system', 'commercials', [...currentList, { name: val, active: true }]);
                                                            input.value = '';
                                                        }
                                                    }}
                                                    className="bg-[#2d5a43] text-white px-6 rounded-xl font-bold text-sm hover:bg-[#1e3a2c] transition-all"
                                                >
                                                    Añadir
                                                </button>
                                            </div>

                                            {(() => {
                                                const allCommercials = (config.system.commercials || []).map((comm, idx) => {
                                                    const isObject = typeof comm === 'object' && comm !== null;
                                                    return {
                                                        comm,
                                                        originalIdx: idx,
                                                        name: isObject ? comm.name : comm,
                                                        isActive: isObject ? comm.active !== false : true,
                                                        isObject
                                                    };
                                                });

                                                const activeCommercials = allCommercials.filter(c => c.isActive);
                                                const inactiveCommercials = allCommercials.filter(c => !c.isActive);

                                                const renderComm = ({ comm, originalIdx: idx, name, isActive, isObject }) => (
                                                    <div key={idx} className={`border p-3 rounded-xl flex items-center justify-between gap-4 transition-all group ${isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-75'}`}>
                                                        {editingCommercialIdx === idx ? (
                                                            <div className="flex-1 flex gap-2 items-center">
                                                                <input
                                                                    type="text"
                                                                    value={editingCommercialName}
                                                                    onChange={e => setEditingCommercialName(e.target.value.toUpperCase())}
                                                                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:border-[#2d5a43] outline-none shadow-sm"
                                                                    autoFocus
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            const val = editingCommercialName.trim();
                                                                            if (val) {
                                                                                const newList = [...config.system.commercials];
                                                                                const currentObj = typeof newList[idx] === 'object' ? newList[idx] : { name: newList[idx], active: true };
                                                                                newList[idx] = { ...currentObj, name: val };
                                                                                handleChange('system', 'commercials', newList);
                                                                            }
                                                                            setEditingCommercialIdx(null);
                                                                        } else if (e.key === 'Escape') {
                                                                            setEditingCommercialIdx(null);
                                                                        }
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const val = editingCommercialName.trim();
                                                                        if (val) {
                                                                            const newList = [...config.system.commercials];
                                                                            const currentObj = typeof newList[idx] === 'object' ? newList[idx] : { name: newList[idx], active: true };
                                                                            newList[idx] = { ...currentObj, name: val };
                                                                            handleChange('system', 'commercials', newList);
                                                                        }
                                                                        setEditingCommercialIdx(null);
                                                                    }}
                                                                    className="bg-[#2d5a43] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#1e3a2c] flex items-center gap-1.5 whitespace-nowrap"
                                                                >
                                                                    <LucideIcon name="check" size={14} /> Guardar
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingCommercialIdx(null)}
                                                                    className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5 whitespace-nowrap"
                                                                >
                                                                    <LucideIcon name="x" size={14} /> Cancelar
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <button
                                                                        onClick={() => {
                                                                            const newList = [...config.system.commercials];
                                                                            if (isObject) {
                                                                                newList[idx] = { ...comm, active: !isActive };
                                                                            } else {
                                                                                newList[idx] = { name: comm, active: false };
                                                                            }
                                                                            handleChange('system', 'commercials', newList);
                                                                        }}
                                                                        className={`relative w-12 h-6 rounded-full transition-colors flex items-center shrink-0 ${isActive ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                                                                        title={isActive ? "Marcar como Inactivo" : "Marcar como Activo"}
                                                                    >
                                                                        <div className={`absolute left-0.5 w-5 h-5 bg-white rounded-full transition-transform transform shadow-sm ${isActive ? 'translate-x.6' : 'translate-x-0'}`} style={{ transform: isActive ? 'translateX(1.3rem)' : 'translateX(0)' }} />
                                                                    </button>
                                                                    <span className={`text-sm font-bold truncate ${isActive ? 'text-slate-700' : 'text-slate-400 line-through'}`}>{name}</span>
                                                                    {!isActive && <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase shrink-0">Inactivo</span>}
                                                                </div>
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingCommercialIdx(idx);
                                                                            setEditingCommercialName(name);
                                                                        }}
                                                                        className="text-slate-400 hover:text-[#2d5a43] transition-colors p-2 rounded-lg hover:bg-emerald-50"
                                                                        title="Editar"
                                                                    >
                                                                        <LucideIcon name="pencil" size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm(`¿Estás seguro de eliminar a ${name}?`)) {
                                                                                const newList = config.system.commercials.filter((_, i) => i !== idx);
                                                                                handleChange('system', 'commercials', newList);
                                                                            }
                                                                        }}
                                                                        className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                                                                        title="Eliminar"
                                                                    >
                                                                        <LucideIcon name="trash-2" size={16} />
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );

                                                return (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                                        <div className="flex flex-col gap-3">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activos</h5>
                                                            </div>
                                                            {activeCommercials.length > 0 ? activeCommercials.map(renderComm) : (
                                                                <div className="text-center p-6 border-2 border-dashed border-slate-100 rounded-xl text-xs text-slate-400 italic">No hay comerciales activos</div>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-3">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                                                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inactivos</h5>
                                                            </div>
                                                            {inactiveCommercials.length > 0 ? inactiveCommercials.map(renderComm) : (
                                                                <div className="text-center p-6 border-2 border-dashed border-slate-100 rounded-xl text-xs text-slate-400 italic">No hay comerciales inactivos</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ) : activeHotel === 'system' ? (
                                    <div className="max-w-xl space-y-8">
                                        <div className="bg-[#2d5a43] p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                                            <LucideIcon name="cpu" className="absolute right-[-10px] bottom-[-10px] w-32 h-32 opacity-10" />
                                            <div className="relative z-10">
                                                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                                    Motor IA Estratégica
                                                    <span className="bg-emerald-400 text-[#2d5a43] px-2 py-0.5 rounded text-[8px] uppercase tracking-widest">Activo</span>
                                                </h4>
                                                <p className="text-xs text-emerald-50 opacity-70 mb-6">Configuración del conector para análisis de riesgos y proyecciones.</p>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1">Modelo Seleccionado</label>
                                                        <select value={config.system.geminiModel} onChange={(e) => handleChange('system', 'geminiModel', e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-bold outline-none focus:bg-white/20 transition-all">
                                                            <option className="text-slate-800" value="gemini-2.0-flash">Gemini 2.0 Flash (Más rápido)</option>
                                                            <option className="text-slate-800" value="gemini-1.5-pro">Gemini 1.5 Pro (Alta Precisión)</option>
                                                            <option className="text-slate-800" value="gemini-1.5-flash">Gemini 1.5 Flash (Estándar)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1">Gemini API Key (Privada)</label>
                                                        <input
                                                            type="password"
                                                            value={config.system.geminiApiKey || ""}
                                                            onChange={(e) => handleChange('system', 'geminiApiKey', e.target.value)}
                                                            placeholder="Paste your API key here..."
                                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none focus:bg-white/20 transition-all"
                                                        />
                                                        <p className="text-[9px] text-emerald-200/50 mt-1 italic">La clave se guarda encriptada en tu instancia privada de Firestore.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">PIN de Acceso</label>
                                                <input type="password" value={config.system.pin} onChange={(e) => handleChange('system', 'pin', e.target.value)} maxLength="4" className="w-full text-2xl font-bold tracking-[0.5em] text-center border-b border-slate-100 py-2 outline-none focus:border-[#2d5a43] transition-all" />
                                                <p className="text-[9px] text-slate-400 mt-2 italic text-center text-wrap">Este PIN se usará en la pantalla de login unificada.</p>
                                            </div>
                                            <div className="p-6 bg-slate-900 rounded-3xl text-white flex flex-col justify-center">
                                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Backup Cloud</p>
                                                <p className="text-xs opacity-70 leading-relaxed">Los cambios se guardan automáticamente en tu servidor Firestore de nivel industrial.</p>
                                            </div>
                                        </div>

                                        {/* Usuarios Autorizados NexusGroups */}
                                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                        <LucideIcon name="users" size={16} className="text-[#2d5a43]" />
                                                        Usuarios Autorizados NexusGroups
                                                    </h4>
                                                    <p className="text-[11px] text-slate-400">Cuentas con acceso a la plataforma.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveHotel('users')}
                                                    className="text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                                                >
                                                    <LucideIcon name="shield-check" size={13} />
                                                    Administrar Accesos
                                                </button>
                                            </div>

                                            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                                                {(config.system.users || []).map((u, uIdx) => (
                                                    <div key={uIdx} className="p-3.5 bg-white hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2d5a43] to-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                                                                {(u.name || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="text-xs font-bold text-slate-800">{u.name}</span>
                                                                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{u.role}</span>
                                                                </div>
                                                                <span className="text-[11px] text-slate-400 block truncate">{u.email}</span>
                                                            </div>
                                                        </div>
                                                         <div className="flex items-center gap-2 shrink-0">
                                                            <span className="text-[10px] text-slate-400 font-mono tracking-widest bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 select-none">
                                                                ••••••••
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Razón Social</label>
                                                    <input type="text" value={config[activeHotel].company} onChange={(e) => handleChange(activeHotel, 'company', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">NIF / CIF</label>
                                                    <input type="text" value={config[activeHotel].nif} onChange={(e) => handleChange(activeHotel, 'nif', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Inscripción Registro Mercantil</label>
                                                    <textarea rows="2" value={config[activeHotel].legal} onChange={(e) => handleChange(activeHotel, 'legal', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all resize-none" />
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Entidad Bancaria</label>
                                                        <input type="text" value={config[activeHotel].bank || ""} onChange={(e) => handleChange(activeHotel, 'bank', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all" placeholder="Nombre del Banco" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">IBAN de Cobro</label>
                                                        <input type="text" value={config[activeHotel].iban} onChange={(e) => handleChange(activeHotel, 'iban', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-emerald-700 font-bold focus:border-[#2d5a43] outline-none transition-all tracking-tighter text-sm" />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Enlace Pasarela TPV (Banco)</label>
                                                        <input type="text" value={config[activeHotel].paymentGateway || ""} onChange={(e) => handleChange(activeHotel, 'paymentGateway', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all text-xs" placeholder="https://..." />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Dirección Física</label>
                                                    <input type="text" value={config[activeHotel].address} onChange={(e) => handleChange(activeHotel, 'address', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all" />
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="col-span-1">
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">IRUS</label>
                                                        <input type="text" value={config[activeHotel].irus || ""} onChange={(e) => handleChange(activeHotel, 'irus', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all" />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">C.P.</label>
                                                        <input type="text" value={config[activeHotel].cp} onChange={(e) => handleChange(activeHotel, 'cp', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all" />
                                                    </div>
                                                    <div className="col-span-1">
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Ciudad</label>
                                                        <input type="text" value={config[activeHotel].city} onChange={(e) => handleChange(activeHotel, 'city', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all" />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                                                        <input type="email" value={config[activeHotel].email} onChange={(e) => handleChange(activeHotel, 'email', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Teléfono</label>
                                                        <input type="text" value={config[activeHotel].tel} onChange={(e) => handleChange(activeHotel, 'tel', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Web Oficial</label>
                                                    <input type="text" value={config[activeHotel].web || ""} onChange={(e) => handleChange(activeHotel, 'web', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* CLÁUSULAS */}
                                        <div className="mt-12 pt-10 border-t border-slate-100">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-slate-100 rounded-lg">
                                                    <LucideIcon name="file-text" className="w-5 h-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-800 tracking-tight">Cláusulas y Condiciones</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Textos legales para el final del presupuesto</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8">
                                                <div className="mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
                                                    <LucideIcon name="info" className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                                    <div className="text-xs text-indigo-700 leading-relaxed">
                                                        <strong>Variables disponibles:</strong> Puedes usar <code>{'{DEP_30}'}</code> en el texto; el sistema lo reemplazará automáticamente por el 30% del presupuesto para indicarlo en la cláusula. Puedes añadir tantas cláusulas como consideres necesarias.
                                                    </div>
                                                </div>

                                                <div className="space-y-6">
                                                    {(config[activeHotel].clauses || []).map((clause, idx) => (
                                                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative group hover:border-indigo-200 transition-all">
                                                            <button
                                                                onClick={() => {
                                                                    const newClauses = [...config[activeHotel].clauses];
                                                                    newClauses.splice(idx, 1);
                                                                    handleChange(activeHotel, 'clauses', newClauses);
                                                                }}
                                                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors bg-white p-2 rounded-xl opacity-0 group-hover:opacity-100 shadow-sm border border-slate-100"
                                                                title="Eliminar cláusula">
                                                                <LucideIcon name="trash-2" size={16} />
                                                            </button>

                                                            <div className="flex items-center gap-4 mb-4 pr-12">
                                                                <span className="w-8 h-8 shrink-0 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center font-black text-indigo-600 text-xs">
                                                                    {idx + 1}
                                                                </span>
                                                                <div className="flex-1 flex gap-3">
                                                                    <input
                                                                        type="text"
                                                                        value={clause.title}
                                                                        placeholder="Título de la cláusula (ej. Cupo y Disponibilidad)"
                                                                        onChange={(e) => {
                                                                            const newClauses = [...config[activeHotel].clauses];
                                                                            newClauses[idx].title = e.target.value;
                                                                            handleChange(activeHotel, 'clauses', newClauses);
                                                                        }}
                                                                        className="flex-1 bg-transparent border-b border-slate-200 py-1 text-sm font-black text-slate-800 outline-none focus:border-indigo-500 transition-colors"
                                                                    />
                                                                    <button 
                                                                        onClick={() => handleTranslateClause(idx, 'clauses', activeHotel)}
                                                                        className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                                                                    >
                                                                        <LucideIcon name="languages" className="w-3.5 h-3.5" />
                                                                        TRADUCIR
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                rows="3"
                                                                value={clause.body}
                                                                placeholder="Contenido descriptivo de la cláusula..."
                                                                onChange={(e) => {
                                                                    const newClauses = [...config[activeHotel].clauses];
                                                                    newClauses[idx].body = e.target.value;
                                                                    handleChange(activeHotel, 'clauses', newClauses);
                                                                }}
                                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-600 text-sm outline-none focus:border-indigo-400 transition-all resize-none ml-12 w-[calc(100%-3rem)] font-medium"
                                                            />
                                                        </div>
                                                    ))}

                                                    <button
                                                        onClick={() => {
                                                            const current = config[activeHotel].clauses || [];
                                                            handleChange(activeHotel, 'clauses', [...current, { title: "Nueva Cláusula", body: "" }]);
                                                        }}
                                                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-[#2d5a43] hover:text-[#2d5a43] hover:bg-emerald-50/50 transition-all text-sm"
                                                    >
                                                        <LucideIcon name="plus" className="w-4 h-4" />
                                                        Añadir Nueva Cláusula</button><button onClick={() => handleChange(activeHotel, "clauses", BUDGET_MODEL_TEMPLATES)} className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all text-[10px] uppercase tracking-widest"><LucideIcon name="refresh-cw" className="w-3 h-3" /> Cargar Modelo Estándar (Presupuesto)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CLÁUSULAS DE CONFIRMACIÓN */}
                                        <div className="mt-8 pt-8 border-t border-slate-100">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-emerald-50 rounded-lg">
                                                    <LucideIcon name="check-square" className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-800 tracking-tight">Cláusulas de Confirmación</h4>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Textos legales para la carta de confirmación</p>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 border border-emerald-100 rounded-[2rem] p-6 md:p-8">
                                                <div className="space-y-6">
                                                    {(config[activeHotel].confirmationClauses || []).map((clause, idx) => (
                                                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative group hover:border-emerald-200 transition-all">
                                                            <button
                                                                onClick={() => {
                                                                    const nc = [...(config[activeHotel].confirmationClauses || [])];
                                                                    nc.splice(idx, 1);
                                                                    handleChange(activeHotel, 'confirmationClauses', nc);
                                                                }}
                                                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors bg-white p-2 rounded-xl opacity-0 group-hover:opacity-100 shadow-sm border border-slate-100"
                                                                title="Eliminar cláusula">
                                                                <LucideIcon name="trash-2" size={16} />
                                                            </button>
                                                            <div className="flex items-center gap-4 mb-4 pr-12">
                                                                <span className="w-8 h-8 shrink-0 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center font-black text-emerald-700 text-xs">{idx + 1}</span>
                                                                <div className="flex-1 flex gap-3">
                                                                    <input
                                                                        type="text"
                                                                        value={clause.title}
                                                                        placeholder="Título (ej. Firma y Aceptación)"
                                                                        onChange={(e) => {
                                                                            const nc = [...(config[activeHotel].confirmationClauses || [])];
                                                                            nc[idx].title = e.target.value;
                                                                            handleChange(activeHotel, 'confirmationClauses', nc);
                                                                        }}
                                                                        className="flex-1 bg-transparent border-b border-slate-200 py-1 text-sm font-black text-slate-800 outline-none focus:border-emerald-500 transition-colors"
                                                                    />
                                                                    <button 
                                                                        onClick={() => handleTranslateClause(idx, 'confirmationClauses', activeHotel)}
                                                                        className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                                                                    >
                                                                        <LucideIcon name="languages" className="w-3.5 h-3.5" />
                                                                        TRADUCIR
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                rows="3"
                                                                value={clause.body}
                                                                placeholder="Contenido de la cláusula..."
                                                                onChange={(e) => {
                                                                    const nc = [...(config[activeHotel].confirmationClauses || [])];
                                                                    nc[idx].body = e.target.value;
                                                                    handleChange(activeHotel, 'confirmationClauses', nc);
                                                                }}
                                                                className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-600 text-sm outline-none focus:border-emerald-400 transition-all resize-none ml-12 w-[calc(100%-3rem)] font-medium"
                                                            />
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => {
                                                            const current = config[activeHotel].confirmationClauses || [];
                                                            handleChange(activeHotel, 'confirmationClauses', [...current, { title: "Nueva Cláusula Conf.", body: "" }]);
                                                        }}
                                                        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-500 font-bold hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-sm"
                                                    >
                                                        <LucideIcon name="plus" className="w-4 h-4" />
                                                        Añadir Cláusula de Confirmación</button><button onClick={() => handleChange(activeHotel, "confirmationClauses", CONF_MODEL_TEMPLATES)} className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-emerald-50 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-600 hover:text-white transition-all text-[10px] uppercase tracking-widest"><LucideIcon name="refresh-cw" className="w-3 h-3" /> Cargar Modelo Estándar (Confirmación)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <footer className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center opacity-40">
                            <p className="text-[10px] font-bold uppercase tracking-widest">Nexus Groups Deployment v1.2</p>
                            <img src="Nexus Groups/Nexus_Groups_ICO-removebg-preview.png" className="h-8 w-8 grayscale" />
                        </footer>
                    </main >

                    {/* Modal Alta Nuevo Usuario */}
                    {showAddUserModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
                            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                                            <LucideIcon name="user-plus" className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-white tracking-tight">Alta de Nuevo Usuario</h3>
                                            <p className="text-[11px] text-slate-300">Crea una cuenta de acceso para Nexus Groups</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddUserModal(false)}
                                        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <LucideIcon name="x" className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                            Nombre Completo
                                        </label>
                                        <input
                                            type="text"
                                            value={newUserData.name}
                                            onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                                            placeholder="Ej: Marta Gómez"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            value={newUserData.email}
                                            onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                                            placeholder="Ej: mgomez@hotelguadiana.es"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                                Rol / Permisos
                                            </label>
                                            <select
                                                value={newUserData.role}
                                                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all"
                                            >
                                                <option value="Comercial">Comercial</option>
                                                <option value="Dirección">Dirección</option>
                                                <option value="Administrador">Administrador</option>
                                                <option value="Recepción">Recepción</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                                Contraseña Inicial
                                            </label>
                                            <input
                                                type="password"
                                                value={newUserData.pass}
                                                onChange={(e) => setNewUserData({ ...newUserData, pass: e.target.value })}
                                                placeholder="Mín. 4 caracteres"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all text-center"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-3 flex items-center justify-end gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddUserModal(false)}
                                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCreateUser}
                                            className="bg-[#2d5a43] hover:bg-[#1e3a2c] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                                        >
                                            <LucideIcon name="check" className="w-3.5 h-3.5" />
                                            Crear y Activar Usuario
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Modal Resetear Contraseña */}
                    {resetPassUser && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
                            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-white flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center">
                                            <LucideIcon name="key" className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base text-white tracking-tight">Restablecer Contraseña</h3>
                                            <p className="text-[11px] text-amber-100">Asigna una nueva clave para el usuario</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setResetPassUser(null)}
                                        className="text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <LucideIcon name="x" className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-[#2d5a43] text-white font-black text-xs flex items-center justify-center">
                                            {(resetPassUser.user?.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-slate-800 block">{resetPassUser.user?.name}</span>
                                            <span className="text-[10px] text-slate-400 block">{resetPassUser.user?.email}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                            Nueva Contraseña
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={resetPassUser.newPass}
                                                onChange={(e) => setResetPassUser({ ...resetPassUser, newPass: e.target.value })}
                                                placeholder="Introduce la nueva clave (mín. 4 caracteres)"
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setResetPassUser({ ...resetPassUser, newPass: "1234" })}
                                                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                                                title="Usar clave por defecto"
                                            >
                                                1234
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center justify-end gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setResetPassUser(null)}
                                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleResetUserPass(resetPassUser.idx, resetPassUser.newPass)}
                                            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                                        >
                                            <LucideIcon name="check" className="w-3.5 h-3.5" />
                                            Guardar Nueva Clave
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div >
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    