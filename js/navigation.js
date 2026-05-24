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
            /* Compensar la altura del header fijo */
            body {
                padding-top: 72px !important;
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
                top: 72px !important;
                height: calc(100vh - 72px) !important;
                z-index: 40 !important;
            }
            /* Ocultar cabecera cuando la ficha está abierta */
            body.nexus-ficha-open {
                padding-top: 0 !important;
            }
            body.nexus-ficha-open #nexus-global-header {
                display: none !important;
            }
            /* Efectos hover premium */
            .nexus-nav-btn {
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .nexus-nav-btn:hover {
                transform: translateY(-1.5px);
            }
            .nexus-nav-btn:active {
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(style);

        // 2. Crear el elemento header
        var header = document.createElement("header");
        header.id = "nexus-global-header";
        header.className = "bg-white/85 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-sm fixed top-0 left-0 right-0 z-[9999] no-print";
        
        // Si el body ya tiene la clase nexus-ficha-open, ocultarla inmediatamente
        if (document.body.classList.contains("nexus-ficha-open")) {
            header.style.display = "none";
        }

        var backBtnHtml = showBackBtn ? `
                    <a href="${backUrl}" class="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 border border-slate-200/60 bg-white shadow-sm flex items-center justify-center" title="Volver">
                        <i data-lucide="chevron-left" class="w-5 h-5"></i>
                    </a>
        ` : '';

        header.innerHTML = `
            <div class="container mx-auto px-4 flex items-center justify-between gap-4">
                <!-- Izquierda: Botón volver, Logo y Título -->
                <div class="flex items-center gap-4 flex-1">
                    ${backBtnHtml}
                    <div class="flex items-center gap-3">
                        <div class="bg-slate-50 rounded-xl p-1.5 shadow-inner border border-slate-100 flex items-center justify-center">
                            <img src="Nexus%20Groups/Nexus_Groups_ICO-removebg-preview.png" class="h-8 w-auto object-contain" alt="Nexus Logo" />
                        </div>
                        <div>
                            <h1 class="text-lg font-black text-slate-800 leading-none flex items-center gap-2 font-outfit">
                                Nexus <span class="text-emerald-600">Groups</span>
                                <span id="nexus-header-import-badge"></span>
                            </h1>
                            <p class="text-[10px] text-slate-500 font-medium mt-0.5">
                                Gestión unificada de grupos y análisis predictivo.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Centro: Módulos internos + menús externos y AI Hub (oculto en móviles) -->
                <div class="hidden lg:flex items-center gap-1">
                    <a href="Admin.html"
                       class="nexus-nav-btn flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-[10px] font-bold uppercase tracking-wider" title="Panel de Control">
                        <i data-lucide="layout-dashboard" class="w-4 h-4 flex-shrink-0"></i>
                        <span class="hidden xl:inline">Panel</span>
                    </a>

                    <a href="Gestion-de-Grupos.html"
                       class="nexus-nav-btn flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-[10px] font-bold uppercase tracking-wider" title="Directorio Grupos">
                        <i data-lucide="users" class="w-4 h-4 flex-shrink-0"></i>
                        <span class="hidden xl:inline">Grupos</span>
                    </a>

                    <a href="Presupuestos.html"
                       class="nexus-nav-btn flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-[10px] font-bold uppercase tracking-wider" title="Seguimiento Presupuestos">
                        <i data-lucide="clipboard-list" class="w-4 h-4 flex-shrink-0"></i>
                        <span class="hidden xl:inline">Presupuestos</span>
                    </a>

                    <a href="Proformas.html"
                       class="nexus-nav-btn flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-[10px] font-bold uppercase tracking-wider" title="Facturas Proforma">
                        <i data-lucide="file-text" class="w-4 h-4 flex-shrink-0"></i>
                        <span class="hidden xl:inline">Proformas</span>
                    </a>

                    <div class="h-6 w-[1px] bg-slate-200 mx-1"></div>

                    <a href="https://nataliogc.github.io/menus-eventos/admin.html" target="_blank" rel="noopener noreferrer" 
                       class="nexus-nav-btn p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title="Menús Eventos">
                        <i data-lucide="utensils" class="w-5 h-5"></i>
                    </a>

                    <a href="https://nataliogc.github.io/Menus-Turisticos/" target="_blank" rel="noopener noreferrer" 
                       class="nexus-nav-btn p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title="Menús Turísticos">
                        <i data-lucide="map" class="w-5 h-5"></i>
                    </a>

                    <a href="https://nataliogc.github.io/menus-cocteles/" target="_blank" rel="noopener noreferrer" 
                       class="nexus-nav-btn p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all" title="Menús Cócteles">
                        <i data-lucide="martini" class="w-5 h-5"></i>
                    </a>

                    <button id="nexus-header-brain-btn" 
                            class="nexus-nav-btn p-2 text-slate-400 hover:text-[#2d5a43] hover:bg-emerald-50 rounded-full transition-all group relative" title="Nexus AI Hub - Análisis de Estrategia">
                        <i data-lucide="brain" class="w-[22px] h-[22px] transition-transform group-hover:scale-110"></i>
                        <span class="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    </button>

                    <a href="Configuracion.html"
                       class="nexus-nav-btn p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all" title="Configuración">
                        <i data-lucide="settings-2" class="w-5 h-5"></i>
                    </a>
                </div>

                <!-- Derecha: Acciones de Importación y Exportación -->
                <div class="flex items-center gap-2">
                    <span id="nexus-header-export-badge" class="hidden sm:inline-block"></span>
                    <div class="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block"></div>

                    <div class="flex gap-1 md:gap-2">
                        <label class="nexus-nav-btn p-2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer flex items-center justify-center" title="Importar">
                            <i data-lucide="upload" class="w-5 h-5"></i>
                            <input type="file" id="nexus-header-upload-input" class="hidden" accept=".csv, .xlsx, .xls" />
                        </label>

                        <button id="nexus-header-excel-btn" class="nexus-nav-btn p-2 text-slate-400 hover:text-emerald-600 transition-colors flex items-center justify-center" title="Exportar Excel">
                            <i data-lucide="file-spreadsheet" class="w-5 h-5"></i>
                        </button>
                    </div>
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

        // Cargar última exportación de Excel al iniciar si existe
        var savedExportDate = localStorage.getItem("nexus_last_excel_export");
        if (savedExportDate && typeof window.updateNexusHeaderExportDate === "function") {
            window.updateNexusHeaderExportDate(savedExportDate);
        }

        // Cargar última importación de Excel al iniciar si existe
        var savedImportDate = localStorage.getItem("nexus_last_import_str");
        if (savedImportDate && typeof window.updateNexusHeaderImportDate === "function") {
            window.updateNexusHeaderImportDate(savedImportDate);
        }
    }

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

    // Registrar actualización para el badge de última importación de la página principal
    window.updateNexusHeaderImportDate = function (dateStr) {
        var badge = document.getElementById("nexus-header-import-badge");
        if (badge) {
            if (dateStr) {
                var prefix = (dateStr.indexOf("Guadiana") !== -1 || dateStr.indexOf("Cumbria") !== -1) ? "" : "Actualizado: ";
                badge.innerHTML = `
                    <span class="ml-3 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[8px] font-black uppercase tracking-widest animate-pulse-slow">
                        ${prefix}${dateStr}
                    </span>
                `;
            } else {
                badge.innerHTML = "";
            }
        }
    };

    // Registrar actualización para el badge de última exportación de Excel
    window.updateNexusHeaderExportDate = function (dateStr) {
        var badge = document.getElementById("nexus-header-export-badge");
        if (badge) {
            if (dateStr) {
                badge.innerHTML = `
                    <span class="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[8px] font-black uppercase tracking-widest">
                        Exportado: ${dateStr}
                    </span>
                `;
            } else {
                badge.innerHTML = "";
            }
        }
    };

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
