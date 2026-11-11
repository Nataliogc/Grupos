/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Service Worker (PWA)
 * ═══════════════════════════════════════════════════════════
 * Estrategia: Network-First con respaldo en caché para recursos
 * propios (garantiza que siempre se cargue la última versión
 * disponible cuando hay conexión y habilita la instalación PWA).
 */

const CACHE_NAME = "nexus-groups-pwa-v2.5.71";

const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./Admin.html",
  "./style.css",
  "./manifest.json",
  "./favicon.ico",
  "./js/version.js",
  "./js/navigation.js",
  "./Nexus%20Groups/Nexus_Groups_ICO-removebg-preview.png",
  "./Nexus%20Groups/icon-192.png",
  "./Nexus%20Groups/icon-512.png",
  "./Nexus%20Groups/icon-maskable-512.png",
  "./Nexus%20Groups/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch(() => {
            // Ignorar fallos individuales en precarga para no bloquear instalación
          })
        )
      );
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("nexus-groups-pwa-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Solo interceptar peticiones GET
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch (e) {
    return;
  }

  // Ignorar esquemas no HTTP/HTTPS (ej. chrome-extension://)
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Interceptar /favicon.ico si el navegador lo pide en la raíz del host
  if (url.pathname === "/favicon.ico" || url.pathname.endsWith("/favicon.ico")) {
    event.respondWith(
      caches.match("./favicon.ico").then((cached) => {
        if (cached) return cached;
        return fetch("./favicon.ico").catch(() => fetch(req));
      })
    );
    return;
  }

  // No interceptar tráfico en tiempo real de Firebase / Firestore / APIs externas
  if (
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("cloudfunctions.net") ||
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("identitytoolkit")
  ) {
    return;
  }

  // Solo cachear recursos del mismo origen
  if (url.origin !== self.location.origin) {
    return;
  }

  // Estrategia Network-First: priorizar red y actualizar caché; si falla la red, usar caché
  event.respondWith(
    fetch(req)
      .then((networkResp) => {
        if (networkResp && networkResp.status === 200 && networkResp.type === "basic") {
          const respClone = networkResp.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, respClone).catch(() => {});
          });
        }
        return networkResp;
      })
      .catch(() => {
        return caches.match(req).then((cachedResp) => {
          if (cachedResp) return cachedResp;
          if (req.mode === "navigate") {
            return caches.match("./index.html");
          }
          return new Response("Sin conexión a Internet", {
            status: 503,
            statusText: "Offline"
          });
        });
      })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
