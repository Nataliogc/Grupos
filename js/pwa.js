/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Gestor de Instalación PWA (Escritorio y Móvil)
 * ═══════════════════════════════════════════════════════════
 * Registra el Service Worker, detecta si la app ya está instalada
 * y muestra el botón «Instalar App» ÚNICAMENTE cuando el navegador
 * detecta que todavía no está instalada.
 */
(function () {
    "use strict";

    if (window.__NEXUS_PWA_INITIALIZED__) return;
    window.__NEXUS_PWA_INITIALIZED__ = true;

    var deferredPrompt = window._nexusDeferredInstallPrompt || null;

    // ─── 1. Detectar si se ejecuta dentro de la App instalada ─────────────────
    function isStandalone() {
        try {
            if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
            if (window.matchMedia && window.matchMedia("(display-mode: window-controls-overlay)").matches) return true;
            if (window.matchMedia && window.matchMedia("(display-mode: minimal-ui)").matches) return true;
            if (window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches) return true;
            if (navigator.windowControlsOverlay && navigator.windowControlsOverlay.visible) return true;
            if (window.navigator && window.navigator.standalone === true) return true;
        } catch (e) {}
        return false;
    }
    window.isNexusStandalone = isStandalone;

    function isIOSDevice() {
        var ua = navigator.userAgent || "";
        return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    }

    // ─── 2. Determinar si debe mostrarse el botón «Instalar App» ──────────────
    function canShowInstallButton() {
        // Si ya estamos dentro de la ventana de la App instalada, NUNCA mostrar
        if (isStandalone()) return false;

        // En Chrome / Edge / Android: mostrar SOLO si el navegador disparó `beforeinstallprompt`
        // (si la app ya está instalada en el sistema, el navegador no dispara este evento)
        if (deferredPrompt) return true;

        // En iOS / iPadOS (Safari no tiene beforeinstallprompt): mostrar si no está en modo standalone
        if (isIOSDevice()) return true;

        return false;
    }

    // ─── 3. Asegurar etiquetas <link rel="manifest"> y <meta> en <head> ──────
    function ensureHeadTags() {
        if (!document.head) return;

        if (!document.querySelector('link[rel="manifest"]')) {
            var manifestLink = document.createElement("link");
            manifestLink.rel = "manifest";
            manifestLink.href = "manifest.json";
            document.head.appendChild(manifestLink);
        }

        if (!document.querySelector('meta[name="theme-color"]')) {
            var themeMeta = document.createElement("meta");
            themeMeta.name = "theme-color";
            themeMeta.content = "#2d5a43";
            document.head.appendChild(themeMeta);
        }

        if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
            var appleCap = document.createElement("meta");
            appleCap.name = "apple-mobile-web-app-capable";
            appleCap.content = "yes";
            document.head.appendChild(appleCap);
        }

        if (!document.querySelector('meta[name="apple-mobile-web-app-title"]')) {
            var appleTitle = document.createElement("meta");
            appleTitle.name = "apple-mobile-web-app-title";
            appleTitle.content = "Nexus Groups";
            document.head.appendChild(appleTitle);
        }

        if (!document.querySelector('link[rel="apple-touch-icon"]')) {
            var appleIcon = document.createElement("link");
            appleIcon.rel = "apple-touch-icon";
            appleIcon.href = "Nexus%20Groups/apple-touch-icon.png";
            document.head.appendChild(appleIcon);
        }
    }

    // ─── 4. Registrar Service Worker ──────────────────────────────────────────
    function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) return;
        if (
            window.location.protocol !== "https:" &&
            window.location.hostname !== "localhost" &&
            window.location.hostname !== "127.0.0.1"
        ) {
            return;
        }

        window.addEventListener("load", function () {
            navigator.serviceWorker
                .register("./sw.js", { scope: "./" })
                .then(function (reg) {
                    if (reg && typeof reg.update === "function") {
                        reg.update().catch(function () {});
                    }
                })
                .catch(function (err) {
                    console.warn("[PWA] No se pudo registrar el Service Worker:", err);
                });
        });
    }

    // ─── 5. Actualizar visibilidad de los botones de instalación ─────────────
    function updateInstallButtons() {
        var shouldShow = canShowInstallButton();
        var buttons = document.querySelectorAll("#nexus-install-app-btn, [data-nexus-install-btn]");

        buttons.forEach(function (btn) {
            if (!shouldShow) {
                btn.classList.add("hidden");
                btn.classList.remove("flex", "inline-flex");
                btn.style.display = "none";
            } else {
                btn.classList.remove("hidden");
                btn.style.display = "";
                if (btn.id === "nexus-login-install-btn") {
                    btn.classList.add("inline-flex");
                } else {
                    btn.classList.add("flex");
                }
                btn.setAttribute("title", "Instalar Nexus Groups como aplicación en este dispositivo");
            }
        });
    }
    window.updateNexusInstallButtons = updateInstallButtons;

    // ─── 6. Eventos nativos de instalación ───────────────────────────────────
    window.addEventListener("beforeinstallprompt", function (e) {
        e.preventDefault();
        deferredPrompt = e;
        window._nexusDeferredInstallPrompt = e;
        try {
            localStorage.removeItem("nexus_pwa_installed");
        } catch (err) {}
        updateInstallButtons();
    });

    window.addEventListener("appinstalled", function () {
        deferredPrompt = null;
        window._nexusDeferredInstallPrompt = null;
        try {
            localStorage.setItem("nexus_pwa_installed", "1");
        } catch (err) {}
        updateInstallButtons();
        var modal = document.getElementById("nexus-pwa-install-modal");
        if (modal) modal.remove();
    });

    if (window.matchMedia) {
        ["(display-mode: standalone)", "(display-mode: window-controls-overlay)"].forEach(function (query) {
            try {
                var mq = window.matchMedia(query);
                if (mq && mq.addEventListener) {
                    mq.addEventListener("change", updateInstallButtons);
                }
            } catch (e) {}
        });
    }

    if (navigator.windowControlsOverlay && navigator.windowControlsOverlay.addEventListener) {
        try {
            navigator.windowControlsOverlay.addEventListener("geometrychange", updateInstallButtons);
        } catch (e) {}
    }

    // ─── 7. Acción principal al pulsar «Instalar App» ─────────────────────────
    window.nexusTriggerInstall = async function () {
        if (deferredPrompt) {
            try {
                deferredPrompt.prompt();
                var choice = await deferredPrompt.userChoice;
                if (choice && choice.outcome === "accepted") {
                    deferredPrompt = null;
                    window._nexusDeferredInstallPrompt = null;
                    try {
                        localStorage.setItem("nexus_pwa_installed", "1");
                    } catch (err) {}
                }
                updateInstallButtons();
                return;
            } catch (err) {
                console.warn("[PWA] Error al lanzar prompt nativo:", err);
            }
        }
        if (isIOSDevice() && !isStandalone()) {
            openIOSInstallModal();
        }
    };

    // ─── 8. Guía para iOS / iPadOS (Safari) ───────────────────────────────────
    function openIOSInstallModal() {
        var existing = document.getElementById("nexus-pwa-install-modal");
        if (existing) existing.remove();

        var modal = document.createElement("div");
        modal.id = "nexus-pwa-install-modal";
        modal.className = "fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4";

        modal.innerHTML = `
            <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden transform transition-all">
                <div class="bg-gradient-to-r from-[#1e3a2c] to-[#2d5a43] p-6 text-white flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md shrink-0">
                            <img src="Nexus%20Groups/icon-192.png" class="w-full h-full object-contain" alt="Nexus Groups" />
                        </div>
                        <div>
                            <h3 class="font-bold text-base text-white tracking-tight">Instalar Nexus Groups</h3>
                            <p class="text-[11px] text-emerald-100">Añadir a pantalla de inicio</p>
                        </div>
                    </div>
                    <button type="button" id="nexus-pwa-modal-close" class="text-emerald-100 hover:text-white p-1 rounded-lg transition-colors cursor-pointer" title="Cerrar">
                        ✕
                    </button>
                </div>

                <div class="p-6 space-y-4">
                    <div class="space-y-3 text-xs text-slate-700">
                        <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                            <span class="w-6 h-6 rounded-full bg-[#2d5a43] text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                            <div>
                                <p class="font-bold text-slate-800">Pulsa el botón Compartir de Safari</p>
                                <p class="text-slate-500 text-[11px] mt-0.5">El icono del cuadrado con una flecha hacia arriba en la barra de Safari.</p>
                            </div>
                        </div>
                        <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                            <span class="w-6 h-6 rounded-full bg-[#2d5a43] text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                            <div>
                                <p class="font-bold text-slate-800">Selecciona «Añadir a pantalla de inicio»</p>
                                <p class="text-slate-500 text-[11px] mt-0.5">Confirma pulsando «Añadir» en la esquina superior derecha.</p>
                            </div>
                        </div>
                    </div>
                    <div class="pt-2 flex items-center justify-end">
                        <button type="button" id="nexus-pwa-modal-ok" class="bg-[#2d5a43] hover:bg-[#1e3a2c] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer">
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        function closeModal() {
            modal.remove();
        }

        var closeBtn = document.getElementById("nexus-pwa-modal-close");
        if (closeBtn) closeBtn.addEventListener("click", closeModal);
        var okBtn = document.getElementById("nexus-pwa-modal-ok");
        if (okBtn) okBtn.addEventListener("click", closeModal);
        modal.addEventListener("click", function (e) {
            if (e.target === modal) closeModal();
        });
    }

    // ─── 9. Inicializar automáticamente ───────────────────────────────────────
    ensureHeadTags();
    registerServiceWorker();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", updateInstallButtons);
    } else {
        updateInstallButtons();
    }
})();
