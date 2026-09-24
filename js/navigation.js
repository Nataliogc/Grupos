/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Barra de Navegación Global y Unificada
 * ═══════════════════════════════════════════════════════════
 * Script auto-inyectable para insertar la cabecera premium
 * en la parte superior de todos los módulos del sistema.
 * ═══════════════════════════════════════════════════════════
 */

(function () {
    "use strict";

    // ─── Helpers de formato ───────────────────────────────────────────────────
    function formatImportDate(ts) {
        if (!ts) return null;
        var d = new Date(typeof ts === 'number' ? ts : Number(ts));
        if (isNaN(d.getTime())) return null;
        var p = function(n) { return n < 10 ? '0' + n : '' + n; };
        return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + String(d.getFullYear()).slice(-2) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    }

    // ─── Badge: última importación de Excel por hotel ─────────────────────────
    window.updateNexusHeaderImportDate = function (gDate, cDate) {
        var badge = document.getElementById('nexus-header-import-badge');
        if (!badge) return;

        // Acepta también el formato antiguo de string unificado para compatibilidad
        if (typeof gDate === 'string' && cDate === undefined) {
            badge.innerHTML = gDate
                ? '<span class="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[8px] font-bold uppercase tracking-wider whitespace-nowrap">' +
                  gDate + '</span>'
                : '';
            return;
        }

        var gStr = gDate ? formatImportDate(gDate) : null;
        var cStr = cDate ? formatImportDate(cDate) : null;

        var html = '';
        html += '<span class="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">' +
                '<span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>' +
                'Guadiana: ' + (gStr || 'Sin actualización') + '</span>';
        html += '<span class="px-1.5 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 rounded text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">' +
                '<span class="inline-block w-1.5 h-1.5 rounded-full bg-sky-500"></span>' +
                'Cumbria: ' + (cStr || 'Sin actualización') + '</span>';

        badge.innerHTML = html;

        // Guardar en localStorage como respaldo
        var backup = JSON.stringify({ g: gDate || null, c: cDate || null });
        try { localStorage.setItem('nexus_last_import_str', backup); } catch(e) {}
    };

    // ─── Listener Firestore para actualización en tiempo real ─────────────────
    function listenToImportDate() {
        // Si db ya está disponible, suscribirse inmediatamente
        if (window.db && typeof window.db.collection === 'function') {
            _subscribe();
            return;
        }
        // Si no, intentar cada 300 ms hasta que esté disponible (máx 15 s)
        var attempts = 0;
        var interval = setInterval(function () {
            attempts++;
            if (window.db && typeof window.db.collection === 'function') {
                clearInterval(interval);
                _subscribe();
            } else if (attempts > 50) {
                clearInterval(interval);
                // Fallback: intentar cargar desde localStorage
                _loadFromLocalStorage();
            }
        }, 300);
    }

    function _subscribe() {
        try {
            updateDbStatus(true, "BD Online");
            window.db.collection('settings').doc('main').onSnapshot(function (doc) {
                updateDbStatus(true, "BD Online");
                if (!doc.exists) {
                    _loadFromLocalStorage();
                    return;
                }
                var data = doc.data();
                var gDate = (data.guadiana && data.guadiana.lastImportDate) || null;
                var cDate = (data.cumbria  && data.cumbria.lastImportDate)  || null;
                // Fallback al campo legacy
                if (!gDate && !cDate && data.lastImportDate) {
                    gDate = data.lastImportDate;
                }
                window.updateNexusHeaderImportDate(gDate, cDate);
            }, function (err) {
                console.warn('[Navigation] Firestore settings/main onSnapshot error:', err);
                updateDbStatus(false, "BD Offline");
                _loadFromLocalStorage();
            });
        } catch (e) {
            console.warn('[Navigation] _subscribe error:', e);
            updateDbStatus(false, "BD Offline");
            _loadFromLocalStorage();
        }
    }

    function _loadFromLocalStorage() {
        try {
            var raw = localStorage.getItem('nexus_last_import_str');
            if (!raw) return;
            // Intentar parsear nuevo formato JSON
            try {
                var parsed = JSON.parse(raw);
                if (parsed && (parsed.g || parsed.c)) {
                    window.updateNexusHeaderImportDate(parsed.g, parsed.c);
                    return;
                }
            } catch (je) {}
            // Formato antiguo de string
            window.updateNexusHeaderImportDate(raw);
        } catch (e) {}
    }

    // ─── Control de estado de conexión con la Base de Datos ──────────────────
    function updateDbStatus(isOnline, text) {
        var badge = document.getElementById("nexus-db-status-badge");
        if (!badge) return;

        if (isOnline) {
            badge.className = "flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-lg text-[10px] font-bold tracking-wider select-none shadow-xs";
            badge.setAttribute("title", "Base de datos Firestore conectada y sincronizada en tiempo real");
            badge.innerHTML = `
                <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>${text || 'BD Online'}</span>
            `;
        } else {
            badge.className = "flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold tracking-wider select-none shadow-xs";
            badge.setAttribute("title", "Sin conexión en tiempo real con la base de datos");
            badge.innerHTML = `
                <span class="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                <span>${text || 'BD Reconectando'}</span>
            `;
        }
    }
    window.updateNexusDbStatus = updateDbStatus;

    // ─── Perfiles autorizados y Helpers de sesión ───────────────────────────
    var AUTHORIZED_PROFILES = [
        { id: "diana", name: "Diana", role: "Comercial", email: "dianahotelguadiana@gmail.com" },
        { id: "sergio", name: "Sergio", role: "Dirección", email: "ssanchez@hotelguadiana.es" },
        { id: "oscar", name: "Oscar", role: "Dirección", email: "osanchez@hotelguadiana.es" },
        { id: "natalio", name: "Natalio", role: "Administrador", email: "comunicaciones@hotelguadiana.es" }
    ];

    function getCurrentUser() {
        try {
            var raw = localStorage.getItem('nexus_user') || sessionStorage.getItem('nexus_session');
            if (raw) {
                var u = JSON.parse(raw);
                if (u && (u.name || u.email)) return u;
            }
        } catch(e) {}

        // Si hay usuario recordado previamente, asociarlo
        try {
            var saved = localStorage.getItem('nexus_saved_username');
            if (saved) {
                var sLow = saved.trim().toLowerCase();
                var found = AUTHORIZED_PROFILES.find(function(p) {
                    return p.id === sLow || p.name.toLowerCase() === sLow || p.email.toLowerCase() === sLow;
                });
                if (found) {
                    localStorage.setItem('nexus_user', JSON.stringify(found));
                    return found;
                }
            }
        } catch(e) {}

        return null;
    }

    window.getNexusCurrentUser = getCurrentUser;

    window.nexusLogout = function () {
        var user = getCurrentUser();
        var confirmMsg = user && user.name ? "¿Deseas cerrar la sesión de " + user.name + "?" : "¿Deseas cerrar la sesión?";
        if (window.confirm(confirmMsg)) {
            try {
                localStorage.removeItem('nexus_user');
                sessionStorage.removeItem('nexus_session');
            } catch(e) {}
            window.location.href = "index.html?logout=true";
        }
    };

    function initHeader() {
        // Evitar duplicación
        if (document.getElementById("nexus-global-header")) return;

        // Determinar página actual para configurar comportamiento del botón atrás
        var currentPage = "";
        try {
            var path = window.location.pathname;
            currentPage = decodeURIComponent(path.substring(path.lastIndexOf('/') + 1));
        } catch (e) {
            var path = window.location.pathname;
            currentPage = path.substring(path.lastIndexOf('/') + 1);
        }
        currentPage = currentPage.split('?')[0].split('#')[0];
        if (!currentPage) {
            currentPage = "index.html";
        }

        // Control de acceso unificado: Redirigir a index.html si no hay sesión activa
        var lowerPage = currentPage.toLowerCase();
        var isPublicPage = (
            lowerPage === "index.html" ||
            lowerPage === "fac prof.html" ||
            lowerPage === "orden servicio.html" ||
            lowerPage === "rooming-servicios.html"
        );

        var currentUser = getCurrentUser();

        if (!isPublicPage && !currentUser) {
            var urlParams = new URLSearchParams(window.location.search);
            if (!urlParams.get('bypass_auth')) {
                window.location.replace("index.html");
                return;
            }
        }

        // No inyectar la cabecera global en plantillas de impresión/generación
        if (currentPage === "Fac Prof.html" || currentPage === "Orden Servicio.html") {
            return;
        }

        var backUrl = "Admin.html";
        var showBackBtn = true;
        if (currentPage === "Admin.html" || currentPage === "index.html" || currentPage === "") {
            backUrl = "index.html";
            showBackBtn = false;
        }

        // 1. Inyectar estilos CSS para el margen superior del body y ajustes de sidebars
        var style = document.createElement("style");
        style.id = "nexus-header-styles";
        style.innerHTML = `
            /* Compensar la altura de la cabecera compacta */
            body {
                padding-top: 50px !important;
            }
            @media print {
                body {
                    padding-top: 0 !important;
                }
                #nexus-global-header {
                    display: none !important;
                }
            }
            /* Desplazar los sidebars fijos hacia abajo para que no queden tapados */
            aside.fixed, 
            div.fixed.left-0.top-0,
            aside[class*="fixed left-0 top-0"],
            div[class*="fixed left-0 top-0"] {
                top: 50px !important;
                height: calc(100vh - 50px) !important;
                z-index: 40 !important;
            }
            /* Ocultar cabecera cuando la ficha está abierta */
            body.nexus-ficha-open {
                padding-top: 0 !important;
            }
            body.nexus-ficha-open #nexus-global-header {
                display: none !important;
            }
            /* Efectos hover sutiles */
            .nexus-nav-btn {
                transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .nexus-nav-btn:hover {
                transform: translateY(-1px);
            }
            .nexus-nav-btn:active {
                transform: scale(0.97);
            }
        `;
        document.head.appendChild(style);

        // 2. Crear el elemento header
        var header = document.createElement("header");
        header.id = "nexus-global-header";
        header.className = "bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-1.5 shadow-xs fixed top-0 left-0 right-0 z-[9999] no-print";
        
        // Si el body ya tiene la clase nexus-ficha-open, ocultarla inmediatamente
        if (document.body.classList.contains("nexus-ficha-open")) {
            header.style.display = "none";
        }

        var backBtnHtml = showBackBtn ? `
                    <a href="${backUrl}" class="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 border border-slate-200/60 bg-white shadow-xs flex items-center justify-center shrink-0" title="Volver">
                        <i data-lucide="chevron-left" class="w-4 h-4"></i>
                    </a>
        ` : '';

        var userWidgetHtml = '';
        if (currentUser) {
            var userName = currentUser.name || "Usuario";
            var userRole = currentUser.role || "Comercial";
            var userInitial = userName.charAt(0).toUpperCase();
            var userEmail = currentUser.email || "";
            var isAdmin = (userRole.toLowerCase() === "administrador" || (userName && userName.toLowerCase() === "natalio"));

            userWidgetHtml = `
                <div class="h-4 w-[1px] bg-slate-200 mx-0.5 hidden sm:block"></div>
                <div class="flex items-center gap-1 pl-2 pr-1 py-0.5 bg-slate-50 border border-slate-200/80 rounded-full shadow-xs whitespace-nowrap select-none" title="Usuario: ${userName} (${userEmail})">
                    <div class="w-5 h-5 rounded-full bg-gradient-to-tr from-[#2d5a43] to-emerald-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs shrink-0 select-none">
                        ${userInitial}
                    </div>
                    <div class="hidden sm:flex flex-col text-left leading-tight pr-1">
                        <span class="text-[11px] font-bold text-slate-800 leading-none">${userName}</span>
                        <span class="text-[8px] font-bold text-emerald-700 leading-none uppercase tracking-wider">${userRole}</span>
                    </div>

                    <!-- Cambiar contraseña (disponible para todo usuario) -->
                    <button id="nexus-user-pwd-btn" type="button" class="nexus-nav-btn p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors flex items-center justify-center cursor-pointer shrink-0" title="Cambiar mi contraseña">
                        <i data-lucide="key" class="w-3.5 h-3.5"></i>
                    </button>

                    ${isAdmin ? `
                    <!-- Gestión de usuarios (Solo Administrador) -->
                    <a href="Configuracion.html?tab=users" class="nexus-nav-btn p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex items-center justify-center shrink-0" title="Gestión de usuarios y accesos (Admin)">
                        <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                    </a>
                    ` : ''}

                    <!-- Cerrar sesión -->
                    <button id="nexus-logout-btn" type="button" class="nexus-nav-btn p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors flex items-center justify-center cursor-pointer shrink-0" title="Cerrar sesión (${userName})">
                        <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            `;
        }

        header.innerHTML = `
            <div class="w-full px-3 sm:px-6 flex items-center justify-between gap-2 lg:gap-4">
                <!-- Izquierda: Botón volver, Logo y Fechas de importación -->
                <div class="flex items-center gap-2 sm:gap-3 shrink-0">
                    ${backBtnHtml}
                    <div class="flex items-center gap-2">
                        <div class="bg-slate-50 rounded-lg p-1 shadow-inner border border-slate-100 flex items-center justify-center shrink-0">
                            <img src="Nexus%20Groups/Nexus_Groups_ICO-removebg-preview.png" class="h-6 w-auto object-contain" alt="Nexus Logo" />
                        </div>
                        <div class="flex flex-col justify-center">
                            <h1 class="text-xs sm:text-sm font-black text-slate-800 leading-none font-outfit whitespace-nowrap">
                                Nexus <span class="text-emerald-600">Groups</span>
                            </h1>
                            <div id="nexus-header-import-badge" class="flex items-center gap-1.5 whitespace-nowrap mt-0.5"></div>
                        </div>
                    </div>
                </div>

                <!-- Centro: Módulos internos + menús externos y AI Hub (oculto en pantallas pequeñas) -->
                <div class="hidden lg:flex items-center gap-1 shrink-0">
                    <a href="Admin.html"
                       class="nexus-nav-btn flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider" title="Panel de Control">
                        <i data-lucide="layout-dashboard" class="w-3.5 h-3.5 flex-shrink-0"></i>
                        <span class="hidden xl:inline">Panel</span>
                    </a>

                    <a href="Gestion-de-Grupos.html"
                       class="nexus-nav-btn flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider" title="Directorio Grupos">
                        <i data-lucide="users" class="w-3.5 h-3.5 flex-shrink-0"></i>
                        <span class="hidden xl:inline">Grupos</span>
                    </a>

                    <a href="Presupuestos.html"
                       class="nexus-nav-btn flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider" title="Seguimiento Presupuestos">
                        <i data-lucide="clipboard-list" class="w-3.5 h-3.5 flex-shrink-0"></i>
                        <span class="hidden xl:inline">Presupuestos</span>
                    </a>

                    <a href="Proformas.html"
                       class="nexus-nav-btn flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider" title="Facturas Proforma">
                        <i data-lucide="file-text" class="w-3.5 h-3.5 flex-shrink-0"></i>
                        <span class="hidden xl:inline">Proformas</span>
                    </a>

                    <a href="Objetivos-Grupos.html"
                       class="nexus-nav-btn flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider" title="Objetivos y Tarifas">
                        <i data-lucide="target" class="w-3.5 h-3.5 flex-shrink-0"></i>
                        <span class="hidden xl:inline">Objetivos</span>
                    </a>

                    <a href="Calendario.html"
                       class="nexus-nav-btn flex items-center gap-1 px-2 py-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all text-[10px] font-bold uppercase tracking-wider" title="Calendario Operativo (CapaSuite)">
                        <i data-lucide="calendar" class="w-3.5 h-3.5 flex-shrink-0"></i>
                        <span class="hidden xl:inline">Calendario</span>
                    </a>

                    <div class="h-4 w-[1px] bg-slate-200 mx-1"></div>

                    <a href="https://nataliogc.github.io/menus-eventos/admin.html" target="_blank" rel="noopener noreferrer" 
                       class="nexus-nav-btn p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title="Menús Eventos">
                        <i data-lucide="utensils" class="w-4 h-4"></i>
                    </a>

                    <a href="https://nataliogc.github.io/Menus-Turisticos/" target="_blank" rel="noopener noreferrer" 
                       class="nexus-nav-btn p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title="Menús Turísticos">
                        <i data-lucide="map" class="w-4 h-4"></i>
                    </a>

                    <a href="https://nataliogc.github.io/menus-cocteles/" target="_blank" rel="noopener noreferrer" 
                       class="nexus-nav-btn p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title="Menús Cócteles">
                        <i data-lucide="martini" class="w-4 h-4"></i>
                    </a>

                    <button id="nexus-header-brain-btn" 
                            class="nexus-nav-btn p-1 text-slate-400 hover:text-[#2d5a43] hover:bg-emerald-50 rounded-full transition-all group relative" title="Nexus AI Hub - Análisis de Estrategia">
                        <i data-lucide="brain" class="w-4 h-4 transition-transform group-hover:scale-110"></i>
                        <span class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                    </button>

                    <a href="Configuracion.html"
                       class="nexus-nav-btn p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all" title="Configuración">
                        <i data-lucide="settings-2" class="w-4 h-4"></i>
                    </a>
                </div>

                <!-- Derecha: Estado BD + Acciones de Importación/Exportación + Perfil Usuario Registrado -->
                <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <!-- Estado de la Base de Datos -->
                    <div id="nexus-db-status-badge" class="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-md text-[10px] font-bold tracking-wider select-none shadow-xs whitespace-nowrap" title="Base de Datos Firestore conectada en tiempo real">
                        <span class="relative flex h-2 w-2">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>BD Online</span>
                    </div>

                    <div class="h-4 w-[1px] bg-slate-200 mx-0.5 hidden sm:block"></div>

                    <div class="flex gap-0.5 items-center">
                        <label class="nexus-nav-btn p-1.5 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer flex items-center justify-center rounded-lg hover:bg-slate-100" title="Importar">
                            <i data-lucide="upload" class="w-4 h-4"></i>
                            <input type="file" id="nexus-header-upload-input" class="hidden" accept=".csv, .xlsx, .xls" />
                        </label>

                        <button id="nexus-header-excel-btn" class="nexus-nav-btn p-1.5 text-slate-400 hover:text-emerald-600 transition-colors flex items-center justify-center rounded-lg hover:bg-slate-100" title="Exportar Excel">
                            <i data-lucide="file-spreadsheet" class="w-4 h-4"></i>
                        </button>
                    </div>

                    ${userWidgetHtml}
                </div>
            </div>
        `;

        // Insertar al inicio de body
        document.body.prepend(header);

        // MutationObserver para reaccionar a cambios en body.nexus-ficha-open
        if (window.MutationObserver) {
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.attributeName === "class") {
                        if (document.body.classList.contains("nexus-ficha-open")) {
                            header.style.display = "none";
                        } else {
                            header.style.display = "";
                        }
                    }
                });
            });
            observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
        }

        // 3. Cargar dinámicamente Lucide si no existe
        if (!window.lucide) {
            var script = document.createElement("script");
            script.src = "https://unpkg.com/lucide@latest";
            script.onload = function () {
                if (window.lucide) {
                    try {
                        window.lucide.createIcons();
                    } catch (err) {
                        console.warn("[Navigation] Lucide init error:", err);
                    }
                }
            };
            document.head.appendChild(script);
        } else {
            try {
                window.lucide.createIcons();
            } catch (e) {
                console.warn("[Navigation] Lucide createIcons failed:", e);
            }
        }

        // 4. Registrar Event Listeners
        
        // Clic en el botón Cerebro (AI Hub)
        var brainBtn = document.getElementById("nexus-header-brain-btn");
        if (brainBtn) {
            brainBtn.addEventListener("click", function () {
                if (typeof window.handleNexusConsultantClick === "function") {
                    window.handleNexusConsultantClick();
                } else if (typeof window.handleConsultantClick === "function") {
                    window.handleConsultantClick();
                } else {
                    // Acción por defecto: Redirigir a Admin.html activando pestaña IA
                    localStorage.setItem("nexus_active_tab", "analytics");
                    window.location.href = "Admin.html";
                }
            });
        }

        // Clic/Cambio en el botón de Importar
        var uploadInput = document.getElementById("nexus-header-upload-input");
        if (uploadInput) {
            uploadInput.addEventListener("change", function (e) {
                if (typeof window.handleNexusUpload === "function") {
                    window.handleNexusUpload(e);
                } else if (typeof window.handleFileUpload === "function") {
                    window.handleFileUpload(e);
                } else {
                    console.log("[Navigation] Importar no soportado en este módulo.");
                }
            });
        }

        // Clic en el botón Exportar Excel
        var excelBtn = document.getElementById("nexus-header-excel-btn");
        if (excelBtn) {
            excelBtn.addEventListener("click", function () {
                var exported = false;
                if (typeof window.handleNexusExport === "function") {
                    window.handleNexusExport();
                    exported = true;
                } else if (typeof window.exportExcel === "function") {
                    window.exportExcel();
                    exported = true;
                } else {
                    console.log("[Navigation] Exportar Excel no soportado en este módulo.");
                }

                if (exported) {
                    var now = new Date();
                    var pad = function(n) { return n < 10 ? '0' + n : n; };
                    var dateStr = pad(now.getDate()) + '/' + pad(now.getMonth() + 1) + '/' + now.getFullYear() + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());
                    localStorage.setItem("nexus_last_excel_export", dateStr);
                    if (typeof window.updateNexusHeaderExportDate === "function") {
                        window.updateNexusHeaderExportDate(dateStr);
                    }
                }
            });
        }

        // Clic en el botón Cerrar Sesión
        var logoutBtn = document.getElementById("nexus-logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", function (e) {
                e.preventDefault();
                window.nexusLogout();
            });
        }

        // Clic en el botón Cambiar Contraseña
        var pwdBtn = document.getElementById("nexus-user-pwd-btn");
        if (pwdBtn) {
            pwdBtn.addEventListener("click", function (e) {
                e.preventDefault();
                window.nexusOpenPasswordModal();
            });
        }

        // Suscribirse a Firestore para importación en tiempo real
        listenToImportDate();
    }

    // ─── Modal de Cambio de Contraseña de Usuario ─────────────────────────────
    window.nexusOpenPasswordModal = function () {
        var user = getCurrentUser();
        if (!user) {
            alert("No hay sesión de usuario activa.");
            return;
        }

        var existingModal = document.getElementById("nexus-password-modal");
        if (existingModal) existingModal.remove();

        var modal = document.createElement("div");
        modal.id = "nexus-password-modal";
        modal.className = "fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in";

        var userName = user.name || "Usuario";
        var userEmail = user.email || "";
        var userRole = user.role || "Comercial";
        var userInitial = userName.charAt(0).toUpperCase();
        var isAdmin = (userRole.toLowerCase() === "administrador" || userName.toLowerCase() === "natalio");

        modal.innerHTML = `
            <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden transform transition-all">
                <!-- Cabecera modal -->
                <div class="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                            <i data-lucide="key" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-base text-white tracking-tight">Cambiar mi Contraseña</h3>
                            <p class="text-[11px] text-slate-300">Actualiza tus credenciales de acceso</p>
                        </div>
                    </div>
                    <button type="button" id="nexus-pwd-modal-close" class="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer" title="Cerrar">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <!-- Perfil actual -->
                <div class="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 rounded-full bg-[#2d5a43] text-white font-black text-xs flex items-center justify-center">
                            ${userInitial}
                        </div>
                        <div>
                            <span class="text-xs font-bold text-slate-800">${userName}</span>
                            <span class="text-[10px] text-slate-400 block">${userEmail}</span>
                        </div>
                    </div>
                    <span class="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                        ${userRole}
                    </span>
                </div>

                <!-- Formulario -->
                <form id="nexus-pwd-form" class="p-6 space-y-4">
                    <!-- Mensaje de estado -->
                    <div id="nexus-pwd-feedback" class="hidden text-xs font-bold p-3 rounded-xl border"></div>

                    <!-- Contraseña actual -->
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Contraseña Actual
                        </label>
                        <div class="relative">
                            <input type="password" id="nexus-pwd-current" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all pr-10" placeholder="Introduce tu contraseña actual" required autocomplete="current-password" />
                            <button type="button" class="nexus-toggle-view absolute right-3 top-2.5 text-slate-400 hover:text-slate-600" data-target="nexus-pwd-current">
                                <i data-lucide="eye" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Nueva contraseña -->
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Nueva Contraseña
                        </label>
                        <div class="relative">
                            <input type="password" id="nexus-pwd-new" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all pr-10" placeholder="Mínimo 4 caracteres" required minlength="4" autocomplete="new-password" />
                            <button type="button" class="nexus-toggle-view absolute right-3 top-2.5 text-slate-400 hover:text-slate-600" data-target="nexus-pwd-new">
                                <i data-lucide="eye" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Confirmar nueva contraseña -->
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Confirmar Nueva Contraseña
                        </label>
                        <div class="relative">
                            <input type="password" id="nexus-pwd-confirm" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all pr-10" placeholder="Repite la nueva contraseña" required minlength="4" autocomplete="new-password" />
                            <button type="button" class="nexus-toggle-view absolute right-3 top-2.5 text-slate-400 hover:text-slate-600" data-target="nexus-pwd-confirm">
                                <i data-lucide="eye" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Botones de acción -->
                    <div class="pt-2 flex items-center justify-end gap-2.5">
                        <button type="button" id="nexus-pwd-btn-cancel" class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer">
                            Cancelar
                        </button>
                        <button type="submit" id="nexus-pwd-btn-submit" class="bg-[#2d5a43] hover:bg-[#1e3a2c] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2">
                            <i data-lucide="check" class="w-3.5 h-3.5"></i>
                            <span id="nexus-pwd-btn-text">Actualizar Contraseña</span>
                        </button>
                    </div>

                    ${isAdmin ? `
                    <div class="pt-3 border-t border-slate-100 text-center">
                        <a href="Configuracion.html?tab=users" class="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold hover:underline inline-flex items-center gap-1.5">
                            <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                            Ir al Panel de Gestión de Usuarios
                        </a>
                    </div>
                    ` : ''}
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }

        // Eventos de cierre
        function closeModal() {
            modal.classList.add('opacity-0');
            setTimeout(function () { modal.remove(); }, 150);
        }

        var closeBtn = document.getElementById("nexus-pwd-modal-close");
        if (closeBtn) closeBtn.addEventListener("click", closeModal);

        var cancelBtn = document.getElementById("nexus-pwd-btn-cancel");
        if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

        modal.addEventListener("click", function(e) {
            if (e.target === modal) closeModal();
        });

        // Alternar ver contraseñas
        modal.querySelectorAll(".nexus-toggle-view").forEach(function(btn) {
            btn.addEventListener("click", function() {
                var targetId = this.getAttribute("data-target");
                var input = document.getElementById(targetId);
                if (!input) return;
                var isPass = input.type === "password";
                input.type = isPass ? "text" : "password";
                var icon = this.querySelector("i");
                if (icon) {
                    icon.setAttribute("data-lucide", isPass ? "eye-off" : "eye");
                    if (window.lucide) window.lucide.createIcons();
                }
            });
        });

        // Envío del formulario
        var form = document.getElementById("nexus-pwd-form");
        var feedback = document.getElementById("nexus-pwd-feedback");
        var submitBtn = document.getElementById("nexus-pwd-btn-submit");
        var btnText = document.getElementById("nexus-pwd-btn-text");

        function showFeedback(type, text) {
            feedback.className = "text-xs font-bold p-3 rounded-xl border " + 
                (type === "error" ? "bg-red-50 border-red-200 text-red-600 block" : "bg-emerald-50 border-emerald-200 text-emerald-700 block");
            feedback.textContent = text;
        }

        form.addEventListener("submit", async function(e) {
            e.preventDefault();
            feedback.className = "hidden";

            var currentVal = (document.getElementById("nexus-pwd-current").value || "").trim();
            var newVal = (document.getElementById("nexus-pwd-new").value || "").trim();
            var confirmVal = (document.getElementById("nexus-pwd-confirm").value || "").trim();

            if (!currentVal) {
                showFeedback("error", "Por favor, introduce tu contraseña actual.");
                return;
            }
            if (!newVal || newVal.length < 4) {
                showFeedback("error", "La nueva contraseña debe tener al menos 4 caracteres.");
                return;
            }
            if (newVal !== confirmVal) {
                showFeedback("error", "La confirmación de la contraseña no coincide.");
                return;
            }

            submitBtn.disabled = true;
            btnText.textContent = "Verificando...";

            try {
                if (!window.db || typeof window.db.collection !== "function") {
                    throw new Error("No hay conexión con la base de datos.");
                }

                var docRef = window.db.collection("settings").doc("main");
                var doc = await docRef.get();
                var users = [];
                var data = {};

                if (doc.exists) {
                    data = doc.data() || {};
                    if (data.system && Array.isArray(data.system.users)) {
                        users = [...data.system.users];
                    }
                }

                // Si no hay usuarios en Firestore, inicializar con los perfiles predeterminados
                if (users.length === 0) {
                    users = [
                        { email: "dianahotelguadiana@gmail.com", pass: "1234", name: "Diana", role: "Comercial" },
                        { email: "ssanchez@hotelguadiana.es", pass: "1234", name: "Sergio", role: "Dirección" },
                        { email: "osanchez@hotelguadiana.es", pass: "1234", name: "Oscar", role: "Dirección" },
                        { email: "comunicaciones@hotelguadiana.es", pass: "1234", name: "Natalio", role: "Administrador" }
                    ];
                }

                var myEmail = (user.email || "").toLowerCase();
                var myName = (user.name || "").toLowerCase();
                var myId = (user.id || "").toLowerCase();

                var userIdx = users.findIndex(function(u) {
                    var uEmail = (u.email || "").toLowerCase();
                    var uName = (u.name || "").toLowerCase();
                    var uId = (u.id || "").toLowerCase();
                    return (myEmail && uEmail === myEmail) || (myName && uName === myName) || (myId && uId === myId);
                });

                if (userIdx < 0) {
                    userIdx = users.length;
                    users.push({
                        id: user.id || myName,
                        name: user.name,
                        email: user.email,
                        role: user.role || "Comercial",
                        pass: "1234",
                        active: true
                    });
                }

                var existingPass = String(users[userIdx].pass || "1234");
                if (existingPass !== currentVal) {
                    submitBtn.disabled = false;
                    btnText.textContent = "Actualizar Contraseña";
                    showFeedback("error", "La contraseña actual no es correcta.");
                    return;
                }

                // Actualizar contraseña
                users[userIdx].pass = newVal;
                users[userIdx].active = true;
                users[userIdx].revoked = false;

                // Guardar en Firestore
                await docRef.set({
                    ...data,
                    system: {
                        ...(data.system || {}),
                        users: users
                    }
                }, { merge: true });

                // Actualizar sesión local
                user.pass = newVal;
                try {
                    localStorage.setItem('nexus_user', JSON.stringify(user));
                } catch(e) {}

                showFeedback("success", "¡Contraseña actualizada con éxito!");
                btnText.textContent = "¡Guardado!";
                setTimeout(function() {
                    closeModal();
                }, 1300);

            } catch(err) {
                console.error("[Navigation] Error actualizando contraseña:", err);
                submitBtn.disabled = false;
                btnText.textContent = "Actualizar Contraseña";
                showFeedback("error", "Error al guardar: " + (err.message || "Problema de conexión"));
            }
        });
    };

    // Marcar el enlace activo según la página actual
    function highlightActivePage() {
        var currentPage = "";
        try {
            var path = window.location.pathname;
            currentPage = decodeURIComponent(path.substring(path.lastIndexOf('/') + 1)).toLowerCase();
        } catch (e) {
            var path = window.location.pathname;
            currentPage = path.substring(path.lastIndexOf('/') + 1).toLowerCase();
        }
        currentPage = currentPage.split('?')[0].split('#')[0];
        if (!currentPage) {
            currentPage = "admin.html";
        }
        var header = document.getElementById("nexus-global-header");
        if (!header) return;
        var links = header.querySelectorAll("a[href]");
        links.forEach(function(link) {
            var href = (link.getAttribute("href") || "").toLowerCase();
            // Admin.html es el Panel de Control
            var isMatch = href === currentPage || 
                (href === "admin.html" && (currentPage === "" || currentPage === "admin.html"));
            if (isMatch && !href.startsWith("http")) {
                link.classList.remove("text-slate-400", "hover:text-indigo-600", "hover:text-slate-700");
                link.classList.add("text-indigo-600", "bg-indigo-50");
            }
        });
    }

    // Compatibilidad: la fecha de exportación se omite para evitar duplicidad con las fechas de hoteles
    window.updateNexusHeaderExportDate = function () {};

    // Ejecutar al cargar la página
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function() {
            initHeader();
            highlightActivePage();
        });
    } else {
        initHeader();
        highlightActivePage();
    }
})();
