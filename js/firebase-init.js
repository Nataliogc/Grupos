/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Inicialización Firebase Centralizada
 * ═══════════════════════════════════════════════════════════
 * Inicializa Firebase App y Firestore automáticamente.
 * Expone `window.db` para uso global en todas las páginas.
 *
 * Dependencias: Firebase SDK (compat), js/firebase-config.js
 * Uso: <script src="js/firebase-init.js"></script>
 *      // window.db ya está disponible
 * ═══════════════════════════════════════════════════════════
 */

(function () {
    "use strict";

    window.nexusListen = window.nexusListen || function (reference, next, error) {
        return reference.onSnapshot(next, error);
    };

    var config = window.firebaseConfig;

    if (!config) {
        console.error("[Firebase] firebaseConfig no encontrado. ¿Se cargó js/firebase-config.js?");
        return;
    }

    // Si Firebase SDK no cargó por bloqueo de red, DNS o tracking, activar fallback offline
    if (typeof firebase === "undefined") {
        console.warn("[Firebase] SDK no disponible (sin conexión o CDN bloqueado). Activando fallback local/offline.");
        window.db = window.db || {
            collection: function() {
                return {
                    doc: function() {
                        return {
                            get: function() { return Promise.resolve({ exists: false, data: function() { return {}; } }); },
                            set: function() { return Promise.resolve(); },
                            update: function() { return Promise.resolve(); }
                        };
                    },
                    get: function() { return Promise.resolve({ docs: [], forEach: function() {} }); },
                    onSnapshot: function() { return function() {}; }
                };
            }
        };
        return;
    }

    // Inicialización robusta — evitar duplicados
    if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(config);
    }

    // Exponer Firestore globalmente
    var db = firebase.firestore();

    // Compatibilidad de red/proxy: reduce errores 400 en canal Listen (WebChannel)
    // Debe ejecutarse antes de usar lecturas/escrituras.
    try {
        db.settings({
            merge: true,
            experimentalAutoDetectLongPolling: true,
            useFetchStreams: false
        });
    } catch (e) {
        // Si Firestore ya fue usado antes de aplicar settings, ignoramos para no romper la app.
        console.warn("[Firebase] No se pudo aplicar settings de red:", e && e.message ? e.message : e);
    }

    // Persist SDK query targets and resume tokens across page navigation.
    // Multi-tab persistence lets Firestore share its network connection.
    if (!window.nexusPersistenceReady && typeof db.enablePersistence === 'function') {
        window.nexusPersistenceReady = db.enablePersistence({ synchronizeTabs: true }).catch(function (error) {
            console.warn('[Firebase] Caché persistente no disponible; se mantiene la conexión normal:', error.code || error.message);
        });
    }

    var subscriptions = new Map();
    window.nexusListen = function (reference, next, error) {
        var key = reference.path;
        if (!key) return reference.onSnapshot(next, error);
        var entry = subscriptions.get(key);
        var observer = { next: next, error: error };
        if (!entry) {
            entry = { observers: new Set(), snapshot: null, stop: null };
            subscriptions.set(key, entry);
        }
        entry.observers.add(observer);
        if (entry.snapshot) next(entry.snapshot);
        if (!entry.stop) {
            entry.stop = reference.onSnapshot(function (snapshot) {
                entry.snapshot = snapshot;
                entry.observers.forEach(function (subscriber) { subscriber.next(snapshot); });
            }, function (err) {
                entry.observers.forEach(function (subscriber) { if (subscriber.error) subscriber.error(err); });
            });
        }
        return function () {
            entry.observers.delete(observer);
            if (entry.observers.size === 0) {
                if (entry.stop) entry.stop();
                subscriptions.delete(key);
            }
        };
    };
    window.db = db;

})();
