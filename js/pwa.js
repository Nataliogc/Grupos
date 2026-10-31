/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Gestor de Instalación PWA (Escritorio y Móvil)
 * ═══════════════════════════════════════════════════════════
 * Registra el Service Worker, gestiona el evento nativo
 * `beforeinstallprompt` y ofrece interfaz de instalación directa
 * o asistente guiado según el navegador/dispositivo.
 */
(function () {
    "use strict";

    if (window.__NEXUS_PWA_INITIALIZED__) return;
    window.__NEXUS_PWA_INITIALIZED__ = true;

    var deferredPrompt = null;

    // ─── 1. Detectar si ya se ejecuta como App instalada ──────────────────────
    function isStandalone() {
        try {
            if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
            if (window.matchMedia && window.matchMedia("(display-mode: window-controls-overlay)").matches) return true;
            if (window.navigator && window.navigator.standalone === true) return true;
        } catch (e) {}
        return false;
    }
    window.isNexusStandalone = isStandalone;

    // ─── 2. Asegurar etiquetas <link rel="manifest"> y <meta> en <head> ──────
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

    // ─── 3. Registrar Service Worker ──────────────────────────────────────────
    function registerServiceWorker() {
        if (!("serviceWorker" in navigator)) return;
        if (window.location.protocol !== "https:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
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

    // ─── 4. Actualizar estado de los botones de instalación ──────────────────
    function updateInstallButtons() {
        var standalone = isStandalone();
        var buttons = document.querySelectorAll("#nexus-install-app-btn, [data-nexus-install-btn]");

        buttons.forEach(function (btn) {
            if (standalone) {
                btn.classList.add("hidden");
                btn.classList.remove("flex", "inline-flex");
            } else {
                btn.classList.remove("hidden");
                if (btn.id === "nexus-login-install-btn") {
                    btn.classList.add("inline-flex");
                } else {
                    btn.classList.add("flex");
                }

                if (deferredPrompt) {
                    btn.setAttribute("title", "Instalar Nexus Groups como aplicación en tu dispositivo");
                } else {
                    btn.setAttribute("title", "Cómo instalar Nexus Groups como aplicación");
                }
            }
        });
    }
    window.updateNexusInstallButtons = updateInstallButtons;

    // ─── 5. Eventos nativos de instalación ───────────────────────────────────
    window.addEventListener("beforeinstallprompt", function (e) {
        e.preventDefault();
        deferredPrompt = e;
        window._nexusDeferredInstallPrompt = e;
        updateInstallButtons();
    });

    window.addEventListener("appinstalled", function () {
        deferredPrompt = null;
        window._nexusDeferredInstallPrompt = null;
        updateInstallButtons();
        var modal = document.getElementById("nexus-pwa-install-modal");
        if (modal) modal.remove();
    });

    if (window.matchMedia) {
        try {
            var mq = window.matchMedia("(display-mode: standalone)");
            if (mq.addEventListener) {
                mq.addEventListener("change", updateInstallButtons);
            }
        } catch (e) {}
    }

    // ─── 6. Acción principal al pulsar "Instalar App" ─────────────────────────
    window.nexusTriggerInstall = async function () {
        if (deferredPrompt) {
            try {
                deferredPrompt.prompt();
                var choice = await deferredPrompt.userChoice;
                if (choice && choice.outcome === "accepted") {
                    deferredPrompt = null;
                    window._nexusDeferredInstallPrompt = null;
                }
                updateInstallButtons();
                return;
            } catch (err) {
                console.warn("[PWA] Error al lanzar prompt nativo:", err);
            }
        }
        openInstallGuideModal();
    };

    // ─── 7. Modal de asistencia de instalación por dispositivo ────────────────
    function openInstallGuideModal() {
        var existing = document.getElementById("nexus-pwa-install-modal");
        if (existing) existing.remove();

        var ua = navigator.userAgent || "";
        var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        var isAndroid = /Android/i.test(ua);
        var isEdge = /Edg\//i.test(ua);
        var isChrome = /Chrome\//i.test(ua) && !isEdge;
        var isFileProtocol = window.location.protocol === "file:";

        var stepsHtml = "";
        var subtitle = "Instala Nexus Groups en tu equipo o móvil para abrirlo como aplicación independiente.";

        if (isFileProtocol) {
            stepsHtml = `
                <div class="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-1.5">
                    <p class="font-bold flex items-center gap-1.5">
                        <span>⚠️</span> Estás abriendo el archivo localmente (file://)
                    </p>
                    <p class="text-[11px] leading-relaxed text-amber-700">
                        Para instalar la aplicación con icono propio, ábrela desde la dirección web oficial (HTTPS) o mediante el servidor local (<code class="bg-amber-100 px-1 py-0.5 rounded font-mono">iniciar_servidor.bat</code> / <code class="bg-amber-100 px-1 py-0.5 rounded font-mono">http://localhost</code>).
                    </p>
                </div>
            `;
        } else if (isIOS) {
            stepsHtml = `
                <div class="space-y-3 text-xs text-slate-700">
                    <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <span class="w-6 h-6 rounded-full bg-[#2d5a43] text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                        <div>
                            <p class="font-bold text-slate-800">Pulsa el botón Compartir de Safari</p>
                            <p class="text-slate-500 text-[11px] mt-0.5">Es el icono del cuadrado con una flecha hacia arriba en la barra de navegación.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <span class="w-6 h-6 rounded-full bg-[#2d5a43] text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                        <div>
                            <p class="font-bold text-slate-800">Selecciona «Añadir a pantalla de inicio»</p>
                            <p class="text-slate-500 text-[11px] mt-0.5">Desliza el menú hacia abajo y toca en «Añadir a pantalla de inicio».</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <span class="w-6 h-6 rounded-full bg-[#2d5a43] text-white font-black text-xs flex items-center justify-center shrink-0">3</span>
                        <div>
                            <p class="font-bold text-slate-800">Confirma pulsando «Añadir»</p>
                            <p class="text-slate-500 text-[11px] mt-0.5">Nexus Groups aparecerá con su icono como una app a pantalla completa.</p>
                        </div>
                    </div>
                </div>
            `;
        } else if (isAndroid) {
            stepsHtml = `
                <div class="space-y-3 text-xs text-slate-700">
                    <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <span class="w-6 h-6 rounded-full bg-[#2d5a43] text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                        <div>
                            <p class="font-bold text-slate-800">Abre el menú del navegador (⋮)</p>
                            <p class="text-slate-500 text-[11px] mt-0.5">Toca el icono de tres puntos en la esquina superior derecha de Chrome.</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <span class="w-6 h-6 rounded-full bg-[#2d5a43] text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                        <div>
                            <p class="font-bold text-slate-800">Elige «Instalar aplicación» o «Añadir a pantalla de inicio»</p>
                            <p class="text-slate-500 text-[11px] mt-0.5">Confirma la instalación y Nexus Groups se añadirá a tu cajón de aplicaciones.</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            var browserHint = isEdge
                ? "En Microsoft Edge, mira el icono de <strong>aplicación disponible (cuadrado con signo +)</strong> a la derecha de la barra de direcciones o ve a <strong>Menú (⋯) → Aplicaciones → Instalar este sitio como una aplicación</strong>."
                : isChrome
                ? "En Google Chrome, haz clic en el icono de <strong>Instalar Nexus Groups (pantalla con flecha hacia abajo)</strong> situado a la derecha de la barra de direcciones, o ve a <strong>Menú (⋮) → Guardar y compartir → Instalar Nexus Groups...</strong>"
                : "Usa Google Chrome o Microsoft Edge y haz clic en el icono de <strong>Instalar aplicación</strong> en la parte derecha de la barra de direcciones.";

            stepsHtml = `
                <div class="space-y-3 text-xs text-slate-700">
                    <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                        <span class="w-6 h-6 rounded-full bg-[#2d5a43] text-white font-black text-xs flex items-center justify-center shrink-0">1</span>
                        <div>
                            <p class="font-bold text-slate-800">Desde la barra de direcciones del navegador</p>
                            <p class="text-slate-600 text-[11px] mt-1 leading-relaxed">${browserHint}</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                        <span class="w-6 h-6 rounded-full bg-slate-700 text-white font-black text-xs flex items-center justify-center shrink-0">2</span>
                        <div>
                            <p class="font-bold text-slate-800">Acceso directo en Escritorio y Barra de tareas</p>
                            <p class="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                                Una vez instalada, se abrirá en su propia ventana independiente y podrás anclarla a la barra de tareas de Windows o al Escritorio.
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }

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
                            <p class="text-[11px] text-emerald-100">Aplicación de Escritorio y Móvil (PWA)</p>
                        </div>
                    </div>
                    <button type="button" id="nexus-pwa-modal-close" class="text-emerald-100 hover:text-white p-1 rounded-lg transition-colors cursor-pointer" title="Cerrar">
                        ✕
                    </button>
                </div>

                <div class="p-6 space-y-4">
                    <p class="text-xs text-slate-500 leading-relaxed">${subtitle}</p>
                    ${stepsHtml}
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
    window.nexusOpenInstallModal = openInstallGuideModal;

    // ─── 8. Inicializar automáticamente ───────────────────────────────────────
    ensureHeadTags();
    registerServiceWorker();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", updateInstallButtons);
    } else {
        updateInstallButtons();
    }
})();
