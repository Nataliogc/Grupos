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

    
    // ─── Versión Única Global de Nexus Groups ───────────────────────────────
    var NEXUS_GLOBAL_VERSION = (window.NEXUS_SYSTEM_INFO && window.NEXUS_SYSTEM_INFO.version) || window.NEXUS_VERSION || "V2.5.115";
    var NEXUS_GLOBAL_DATE = (window.NEXUS_SYSTEM_INFO && window.NEXUS_SYSTEM_INFO.buildDate) || "23/11/2026 18:06";
    window.NEXUS_VERSION = NEXUS_GLOBAL_VERSION;


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
            (window.nexusListen || function (ref, next, error) { return ref.onSnapshot(next, error); })(window.db.collection('settings').doc('main'), function (doc) {
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
    function getCurrentUser() {
        return window.nexusVerifiedMember || null;
    }

    window.getNexusCurrentUser = getCurrentUser;

    window.nexusLogout = function () {
        var user = getCurrentUser();
        var confirmMsg = user && user.name ? "¿Deseas cerrar la sesión de " + user.name + "?" : "¿Deseas cerrar la sesión?";
        if (window.confirm(confirmMsg)) {
            try {
                localStorage.setItem('nexus_explicit_logout', 'true');
                localStorage.removeItem('nexus_user');
                try { localStorage.removeItem('nexus_capasuite_auth'); } catch(e) {}
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
        var isPublicPage = lowerPage === "index.html";

        var currentUser = getCurrentUser();

        if (!isPublicPage && !currentUser) {
            window.addEventListener('nexus-auth-verified', initHeader, {once: true});
            return;
        }

        if (window.self !== window.top) return;

        // 1. Inyectar estilos CSS para el margen superior del body y ajustes de sidebars
        var style = document.createElement("style");
        style.id = "nexus-header-styles";
        style.innerHTML = `
            /* Compensar la altura de la cabecera compacta */
            body {
                padding-top: var(--nexus-header-height, 82px) !important;
            }
            @media print {
                body {
                    padding-top: 0 !important;
                }
                #nexus-global-header {
                    display: none !important;
                }
            }
            #nexus-global-header {position:fixed; inset:0 0 auto; z-index:9999; background:white; border-bottom:1px solid #e2e8f0; padding:0; font-family:system-ui,sans-serif}
            .nexus-bar {display:flex;align-items:center;gap:10px;padding:4px 10px}
            .nexus-tools {display:flex;align-items:center;min-width:0;overflow-x:auto}
            .nexus-actions {margin-left:auto;display:flex;align-items:center;flex:none}
            @media(max-width:700px) {
                .nexus-bar {display:grid;grid-template-columns:auto minmax(0,1fr);gap:3px 8px}
                .nexus-actions {grid-column:1 / -1;justify-self:end;max-width:100%;overflow-x:auto}
            }
            .nexus-module-menu > summary {cursor:pointer;list-style:none;border-radius:7px;background:#5046cf;color:white;padding:7px 10px;font-size:12px;font-weight:700;white-space:nowrap}
            .nexus-tabs {position:absolute;left:8px;top:100%;width:230px;max-width:calc(100vw - 16px);max-height:calc(100dvh - var(--nexus-header-height) - 10px);overflow:auto;background:white;border:1px solid #dce2eb;border-radius:12px;box-shadow:0 8px 28px #18203426;padding:6px}
            .nexus-menu-row {display:grid;grid-template-columns:1fr 32px;align-items:center;gap:3px}
            .nexus-menu-row a,.nexus-menu-row button,.nexus-pins a {display:flex;align-items:center;gap:9px;border-radius:7px;padding:8px;color:#34445a;font:550 13px system-ui;text-decoration:none}
            .nexus-menu-row svg {width:16px;height:16px;flex:none}
            .nexus-menu-row button {background:transparent;border:0;color:#758398;cursor:pointer}
            .nexus-menu-row :is(a,button):hover,.nexus-pins a:hover {background:#f1f4f8}
            .nexus-menu-row [aria-current],.nexus-menu-row button[aria-pressed=true],.nexus-pins [aria-current] {background:#eeedff;color:#473abd}
            .nexus-pins {min-width:0;display:flex;gap:3px;overflow-x:auto;white-space:nowrap}
            .nexus-pins a {flex:none;gap:6px;border:1px solid #d9e2ea;background:#f7f9fb;color:#354659;padding:6px 10px;border-radius:8px;font:600 12px system-ui}
            .nexus-pins a svg {width:15px;height:15px}
            .nexus-pins a[aria-current] {border-color:#28634d;background:#285b46;color:white}
            .nexus-pins a:focus-visible {outline:2px solid #5145cd;outline-offset:-2px}
            .nexus-tone-indigo {--ink:#5145a2;--tint:#eeedfc}
            .nexus-tone-green {--ink:#19624d;--tint:#e6f4ed}
            .nexus-tone-blue {--ink:#255b92;--tint:#e8f1fc}
            .nexus-tone-amber {--ink:#92550c;--tint:#fff2d9}
            .nexus-tone-rose {--ink:#964361;--tint:#faebf1}
            .nexus-tone-slate {--ink:#47576e;--tint:#eaf0f5}
            .nexus-module-icon {display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;flex:none;border-radius:7px;background:var(--tint);color:var(--ink)}
            .nexus-menu-row a {padding:4px 8px}
            .nexus-pins a:not([aria-current]) svg {color:var(--ink)}
            .nexus-budget-count {background:#e6edf9;color:#294e80;border-radius:12px;padding:1px 6px;font:700 11px system-ui;font-variant-numeric:tabular-nums}
            .nexus-pins:empty {display:none}
            @media(max-width:700px){.nexus-pins {grid-column:1/-1;grid-row:3}}
            #nexus-settings-links {padding:2px 0 4px 22px}
            #nexus-settings-links strong {display:block;margin:8px 6px 3px;font:700 10px system-ui;text-transform:uppercase;color:#576781}
            #nexus-settings-links a {display:block;padding:6px 8px;font:500 12px system-ui;color:#334155;border-left:2px solid #dddaf9;text-decoration:none}
            #nexus-settings-links a:hover {background:#eeedff}
            [data-settings][aria-expanded=true] span:last-child {transform:rotate(90deg)}
            @media screen {body.nexus-ficha-open > #root .fixed.inset-0 {top:var(--nexus-header-height, 82px)}}
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
            /* Soporte para arrastrar la ventana de la App instalada y evitar que los controles de ventana (⋯ — ❐ ✕) tapen la derecha */
            @media (display-mode: window-controls-overlay) {
                #nexus-global-header {
                    -webkit-app-region: drag;
                    app-region: drag;
                    padding-right: calc(100vw - env(titlebar-area-width, calc(100vw - 150px)) + 8px) !important;
                }
                #nexus-global-header a,
                #nexus-global-header button,
                #nexus-global-header label,
                #nexus-global-header input,
                #nexus-global-header #nexus-db-status-badge {
                    -webkit-app-region: no-drag;
                    app-region: no-drag;
                }
            }
            #nexus-global-header.nexus-wco-active {
                -webkit-app-region: drag;
                app-region: drag;
            }
            #nexus-global-header.nexus-wco-active a,
            #nexus-global-header.nexus-wco-active button,
            #nexus-global-header.nexus-wco-active label,
            #nexus-global-header.nexus-wco-active input,
            #nexus-global-header.nexus-wco-active #nexus-db-status-badge {
                -webkit-app-region: no-drag;
                app-region: no-drag;
            }
        `;
        document.head.appendChild(style);

        // 2. Crear el elemento header
        var header = document.createElement("header");
        header.id = "nexus-global-header";
        header.className = "bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-1.5 shadow-xs fixed top-0 left-0 right-0 z-[9999] no-print";
        
        var userWidgetHtml = '';
        if (currentUser) {
            var userName = currentUser.name || "Usuario";
            var userRole = currentUser.role || "Comercial";
            var userInitial = userName.charAt(0).toUpperCase();
            var userEmail = currentUser.email || "";
            var isAdmin = userRole.toLowerCase() === "administrador";

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
                    <a href="Usuarios.html" class="nexus-nav-btn p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex items-center justify-center shrink-0" title="Gestión de usuarios y accesos (Admin)">
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

        const modules = [
            ['Admin.html#inicio','Inicio','house','indigo'], ['Gestion-de-Grupos.html','Grupos','users','green'], ['Calendario.html','Calendario','calendar','blue'],
            ['Peticiones.html','Peticiones','inbox','amber'], ['Presupuestos.html','Presupuestos','clipboard-list','blue'], ['Depositos.html','Depósitos','wallet','green'],
            ['Proformas.html','Proformas','file-text','green'], ['AltaEmail.html','Alta por email','mail','amber'], ['Objetivos-Grupos.html','Objetivos','target','indigo'],
            ['https://nataliogc.github.io/menus-eventos/admin.html','Menús Eventos','utensils','rose'],
            ['https://nataliogc.github.io/Menus-Turisticos/','Menús Turísticos','map','rose'],
            ['https://nataliogc.github.io/menus-cocteles/','Menús Cócteles','martini','rose'],
            ['Configuracion.html','Configuración','settings','slate']
        ];
        const isAdminNav = currentUser && String(currentUser.role || '').toLowerCase() === 'administrador';
        const settingsSections = [
            ['guadiana', 'Sercotel Guadiana'], ['cumbria', 'Cumbria Spa&Hotel'],
            ['system', 'Sistema e IA'],
            ...(isAdminNav ? [['users', 'Usuarios y Accesos']] : []),
            ['services', 'Catálogo de Servicios'], ['clauses', 'Textos Legales']
        ];
        const settingsLink = ([tab, label]) =>
            `<a href="Configuracion.html?tab=${tab}">${label}</a>`
        ;
        const settingsLinks = '<strong>Hoteles</strong>' + settingsSections.slice(0, 2).map(settingsLink).join('') +
            '<strong>General</strong>' + settingsSections.slice(2).map(settingsLink).join('');
        const badgeMarkup = '<span class="nexus-budget-count" title="Presupuestos activos">…</span>';
        const links = modules.map(([url, label, icon, tone]) => {
            const active = url.split('#')[0] === currentPage ? ' aria-current="page"' : '';
            const settings = url === 'Configuracion.html';
            const attributes = settings ? ' data-settings aria-expanded="false" aria-controls="nexus-settings-links"' :
                url.startsWith('https://') ? ' target="_blank" rel="noopener"' : '';
            return `<div class="nexus-menu-row"><a class="nexus-tone-${tone}" href="${url}"${active}${attributes}><span class="nexus-module-icon"><i data-lucide="${icon}" aria-hidden="true"></i></span>${label}${url === "Presupuestos.html" ? badgeMarkup : ""}${settings ? ' <span aria-hidden="true">▸</span>' : ''}</a>
                <button type="button" data-pin="${url}" aria-label="Anclar ${label} en la cabecera"><i data-lucide="pin" aria-hidden="true"></i></button></div>${settings ? `<div id="nexus-settings-links" hidden>${settingsLinks}</div>` : ''}`;
        }).join('');
        header.innerHTML = `
            <div class="nexus-bar">
                <details class="nexus-module-menu">
                    <summary>☰ Menú</summary>
                    <nav class="nexus-tabs" aria-label="Módulos de Grupos">${links}</nav>
                </details>
                <div class="nexus-tools">
                <!-- Izquierda: Botón volver, Logo y Fechas de importación -->
                <div class="flex items-center gap-2 sm:gap-3 shrink-0">
                    <div class="flex items-center gap-2">
                        <div class="bg-slate-50 rounded-lg p-1 shadow-inner border border-slate-100 flex items-center justify-center shrink-0">
                            <img src="Nexus%20Groups/Nexus_Groups_ICO-removebg-preview.png" class="h-6 w-auto object-contain" alt="Nexus Logo" />
                        </div>
                        <div class="flex flex-col justify-center">
                            <div class="flex items-center gap-1.5">
                                <h1 class="text-xs sm:text-sm font-black text-slate-800 leading-none font-outfit whitespace-nowrap">
                                    Nexus <span class="text-emerald-600">Groups</span>
                                </h1>
                                <span class="px-1.5 py-0.5 bg-slate-900 text-white rounded text-[8.5px] font-black uppercase tracking-wider shadow-2xs select-none" title="Versión Nexus Groups: V2.5.115 (23/11/2026 18:06)">
                                    V2.5.115
                                </span>
                            </div>
                            <div id="nexus-header-import-badge" class="flex items-center gap-1.5 whitespace-nowrap mt-0.5"></div>
                        </div>
                    </div>
                </div>

            </div>
                <!-- Derecha: Estado BD + Acciones de Importación/Exportación + Perfil Usuario Registrado -->
                <nav class="nexus-pins" aria-label="Pestañas ancladas"></nav>
                <div class="nexus-actions gap-1.5 sm:gap-2">
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
                        <button id="nexus-install-app-btn" type="button" data-nexus-install-btn style="display: none;" class="nexus-nav-btn hidden items-center gap-1 px-2 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer shadow-2xs mr-0.5" title="Instalar Nexus Groups como aplicación">
                            <i data-lucide="download" class="w-3.5 h-3.5 shrink-0"></i>
                            <span class="hidden xl:inline">Instalar App</span>
                        </button>

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
        function syncHeaderHeight() {
            document.documentElement.style.setProperty("--nexus-header-height", header.offsetHeight + "px");
        }
        syncHeaderHeight();
        new ResizeObserver(syncHeaderHeight).observe(header);
        const menu = header.querySelector(".nexus-module-menu");
        const settingsToggle = menu.querySelector("[data-settings]");
        const settingsPanel = menu.querySelector("#nexus-settings-links");
        function showSettings(open) {
            settingsPanel.hidden = !open;
            settingsToggle.setAttribute("aria-expanded", String(open));
            if (open) settingsPanel.scrollIntoView({block:"nearest"});
        }
        settingsToggle.addEventListener("click", event => {
            event.preventDefault();
            showSettings(settingsPanel.hidden);
        });
        menu.addEventListener("toggle", () => { if (!menu.open) showSettings(false); });
        const pinsKey = "nexus_pinned_modules_" + (currentUser?.id || currentUser?.name || "local");
        const buttons = menu.querySelectorAll("[data-pin]");
        const pins = header.querySelector(".nexus-pins");
        let selected = new Set();
        try {
            const saved = JSON.parse(localStorage.getItem(pinsKey));
            if (Array.isArray(saved)) selected = new Set(saved);
        } catch (_) {}

        const profileId = currentUser?.id || currentUser?.email || currentUser?.name;
        let preferenceDoc;
        function cacheSelection() {
            try { localStorage.setItem(pinsKey, JSON.stringify([...selected])); } catch (_) {}
        }
        function renderPins() {
            pins.replaceChildren();
            buttons.forEach(button => {
                const link = button.previousElementSibling;
                const pinned = selected.has(button.dataset.pin);
                button.setAttribute("aria-pressed", String(pinned));
                button.title = (pinned ? "Desanclar " : "Anclar ") + link.textContent.trim();
                if (pinned) {
                    const shortcut = link.cloneNode(false);
                    shortcut.textContent = modules.find(([url]) => url === button.dataset.pin)[1];
                    const icon = link.querySelector("svg, i");
                    if (icon) shortcut.prepend(icon.cloneNode(true));
                    const badge = link.querySelector(".nexus-budget-count");
                    if (badge) shortcut.appendChild(badge.cloneNode(true));
                    if (link === settingsToggle) {
                        shortcut.removeAttribute("data-settings");
                        shortcut.removeAttribute("aria-expanded");
                        shortcut.addEventListener("click", event => {
                            event.preventDefault();
                            event.stopPropagation();
                            menu.open = true;
                            showSettings(true);
                            settingsPanel.querySelector("a").focus();
                        });
                    }
                    pins.appendChild(shortcut);
                    const placeholder = shortcut.querySelector("i[data-lucide]");
                    if (placeholder && window.lucide) window.lucide.createIcons({root:shortcut});
                }
            });
        }
        const countKey = "nexus_active_budget_count";
        function displayBudgetCount(value) {
            if (value == null || !/^\d+$/.test(String(value))) return;
            header.querySelectorAll(".nexus-budget-count").forEach(badge => {
                badge.textContent = String(value);
                badge.setAttribute("aria-label", value + " presupuestos activos");
            });
        }
        try { displayBudgetCount(localStorage.getItem(countKey)); } catch (_) {}
        window.addEventListener("storage", event => {
            if (event.key === countKey) displayBudgetCount(event.newValue);
        });
        if (window.db && currentUser) {
            var listenGroups = typeof window.nexusListenGroups === "function"
                ? window.nexusListenGroups
                : function (dbInst, next) { return (window.nexusListen || ((ref, n) => ref.onSnapshot(n)))(dbInst.collection("groups"), next); };
            listenGroups(window.db, snapshot => {
                const today = new Date().toISOString().slice(0, 10);
                let count = 0;
                snapshot.forEach(doc => { if (window.NexusBudgetStatus.isActiveBudget(doc.data(), today)) count++; });
                displayBudgetCount(count);
                try { localStorage.setItem(countKey, String(count)); } catch (_) {}
            });
        }
        renderPins();
        if (profileId && window.db?.collection) {
            const ref = window.db.collection("settings").doc("pinned_modules_" + encodeURIComponent(String(profileId).toLowerCase()));
            if (typeof ref.onSnapshot === "function" && typeof ref.set === "function") {
                preferenceDoc = ref;
                ref.onSnapshot(snapshot => {
                    if (!snapshot.exists) {
                        if (!snapshot.metadata.fromCache && selected.size) {
                            ref.set({pins:Object.fromEntries([...selected].map(url => [url, true]))}, {merge:true})
                                .catch(error => console.warn("No se pudieron sincronizar las pestañas", error));
                        }
                        return;
                    }
                    const saved = snapshot.data().pins || {};
                    selected = new Set(modules.map(([url]) => url).filter(url => saved[url] === true));
                    cacheSelection();
                    renderPins();
                }, error => console.warn("Pestañas disponibles en este navegador", error));
            }
        }
        buttons.forEach(button => button.addEventListener("click", () => {
            const url = button.dataset.pin;
            if (selected.has(url)) selected.delete(url);
            else selected.add(url);
            cacheSelection();
            if (preferenceDoc) {
                preferenceDoc.set({pins:{[url]:selected.has(url)}}, {merge:true})
                    .catch(error => console.warn("No se pudo guardar la pestaña en el perfil", error));
            }
            renderPins();
        }));
        document.addEventListener("click", event => {
            if (menu.open && !menu.contains(event.target)) menu.open = false;
        });
        menu.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                menu.open = false;
                menu.querySelector("summary").focus();
            }
        });

        // Ajustar margen derecho y arrastre si Window Controls Overlay está activo (evita que los botones ⋯ — ❐ ✕ tapen el usuario)
        function syncWindowControlsOverlay() {
            try {
                var wco = navigator.windowControlsOverlay;
                var isWcoMedia = window.matchMedia && window.matchMedia("(display-mode: window-controls-overlay)").matches;
                if ((wco && wco.visible) || isWcoMedia) {
                    header.classList.add("nexus-wco-active");
                    if (wco && typeof wco.getTitlebarAreaRect === "function") {
                        var rect = wco.getTitlebarAreaRect();
                        if (rect && rect.width > 0) {
                            var rightTaken = Math.max(0, window.innerWidth - (rect.x + rect.width));
                            var leftTaken = Math.max(0, rect.x);
                            header.style.paddingRight = (rightTaken + 8) + "px";
                            if (leftTaken > 0) header.style.paddingLeft = (leftTaken + 8) + "px";
                            return;
                        }
                    }
                    header.style.paddingRight = "150px";
                } else {
                    header.classList.remove("nexus-wco-active");
                    header.style.paddingRight = "";
                    header.style.paddingLeft = "";
                }
            } catch (e) {}
        }
        syncWindowControlsOverlay();
        window.addEventListener("resize", syncWindowControlsOverlay);
        if (navigator.windowControlsOverlay && navigator.windowControlsOverlay.addEventListener) {
            navigator.windowControlsOverlay.addEventListener("geometrychange", syncWindowControlsOverlay);
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

        // Clic en el botón Instalar App (PWA)
        var installAppBtn = document.getElementById("nexus-install-app-btn");
        if (installAppBtn) {
            installAppBtn.addEventListener("click", function (e) {
                e.preventDefault();
                if (typeof window.nexusTriggerInstall === "function") {
                    window.nexusTriggerInstall();
                }
            });
        }
        if (typeof window.updateNexusInstallButtons === "function") {
            window.updateNexusInstallButtons();
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
        var isAdmin = userRole.toLowerCase() === "administrador";

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
                        <a href="Usuarios.html" class="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold hover:underline inline-flex items-center gap-1.5">
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
            if (!newVal || newVal.length < 6) {
                showFeedback("error", "La nueva contraseña debe tener al menos 6 caracteres.");
                return;
            }
            if (newVal !== confirmVal) {
                showFeedback("error", "La confirmación de la contraseña no coincide.");
                return;
            }

            submitBtn.disabled = true;
            btnText.textContent = "Verificando...";

            try {
                if (!window.firebase || typeof firebase.auth !== "function" || !firebase.auth().currentUser) {
                    throw new Error("No hay sesión activa en Firebase Authentication.");
                }
                var fbUser = firebase.auth().currentUser;
                var emailForAuth = fbUser.email || user.email || "";
                if (!emailForAuth) {
                    throw new Error("Tu cuenta no tiene correo electrónico asociado.");
                }
                var credential = firebase.auth.EmailAuthProvider.credential(emailForAuth, currentVal);
                await fbUser.reauthenticateWithCredential(credential);
                await fbUser.updatePassword(newVal);

                showFeedback("success", "¡Contraseña actualizada con éxito en Firebase Authentication!");
                btnText.textContent = "¡Guardado!";
                setTimeout(function() {
                    closeModal();
                }, 1300);

            } catch(err) {
                console.error("[Navigation] Error actualizando contraseña:", err);
                submitBtn.disabled = false;
                btnText.textContent = "Actualizar Contraseña";
                var msg = (err && (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"))
                    ? "La contraseña actual no es correcta."
                    : (err && err.code === "auth/weak-password")
                        ? "La nueva contraseña es demasiado débil (mínimo 6 caracteres)."
                        : ("Error al actualizar: " + (err && err.message ? err.message : "Problema de conexión"));
                showFeedback("error", msg);
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

    // Cargar módulo PWA automáticamente si no está cargado
    if (!window.__NEXUS_PWA_INITIALIZED__ && typeof document !== "undefined" && document.head) {
        var pwaScript = document.createElement("script");
        pwaScript.src = "js/pwa.js";
        document.head.appendChild(pwaScript);
    }

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
