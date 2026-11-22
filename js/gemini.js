/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Integración Segura con Gemini AI (Cloud Functions)
 * ═══════════════════════════════════════════════════════════
 * Todas las llamadas a Gemini se enrutan exclusivamente a través de la
 * Cloud Function autenticada `analizarGruposIA` (Secret Manager: GEMINI_KEY).
 * Nunca lee ni almacena claves API en el navegador ni en Firestore.
 */

(function (root) {
    "use strict";

    var AI_ENDPOINT = "https://us-central1-gest-grupos-hotel.cloudfunctions.net/analizarGruposIA";
    var ALLOWED_MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"];

    async function callGemini(customPrompt, options) {
        if (typeof customPrompt !== "string" || !customPrompt.trim()) {
            return {
                ok: false,
                error: "Prompt vacío o inválido.",
                status: 400,
                code: "GEMINI_INVALID_PROMPT"
            };
        }

        var user = root.firebase && typeof root.firebase.auth === "function"
            ? root.firebase.auth().currentUser
            : null;
        if (!user || typeof user.getIdToken !== "function") {
            return {
                ok: false,
                error: "Inicia sesión en Firebase Authentication para utilizar la IA.",
                status: 401,
                code: "GEMINI_UNAUTHENTICATED"
            };
        }

        var model = "gemini-1.5-flash";
        if (options && typeof options.model === "string" && ALLOWED_MODELS.indexOf(options.model) !== -1) {
            model = options.model;
        } else if (root.db && typeof root.db.collection === "function") {
            try {
                var settingsDoc = await root.db.collection("settings").doc("main").get();
                if (settingsDoc.exists) {
                    var s = settingsDoc.data().system || {};
                    if (typeof s.geminiModel === "string" && ALLOWED_MODELS.indexOf(s.geminiModel) !== -1) {
                        model = s.geminiModel;
                    }
                }
            } catch (_) {
                // Continuar con el modelo por defecto si no se puede leer la preferencia
            }
        }

        try {
            var idToken = await user.getIdToken();
            var endpoint = (options && options.endpoint) || root.NEXUS_GEMINI_ENDPOINT || AI_ENDPOINT;
            var response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + idToken
                },
                body: JSON.stringify({
                    prompt: customPrompt,
                    model: model
                })
            });

            var rawBody = await response.text();
            var payload = null;
            try {
                payload = rawBody ? JSON.parse(rawBody) : null;
            } catch (_) {
                payload = null;
            }

            if (!response.ok) {
                var serverMsg = (payload && (payload.error || payload.message)) || "";
                if (response.status === 401 || response.status === 403) {
                    return {
                        ok: false,
                        error: serverMsg || "Acceso denegado al servicio de IA. Verifica tu sesión y permisos.",
                        status: response.status,
                        code: "GEMINI_UNAUTHORIZED"
                    };
                }
                return {
                    ok: false,
                    error: serverMsg || ("Error del servidor de IA (" + response.status + ")."),
                    status: response.status,
                    code: "GEMINI_HTTP_ERROR"
                };
            }

            var text = (payload && (payload.text || payload.informe)) || "";
            if (!text || typeof text !== "string") {
                return {
                    ok: false,
                    error: "El servicio de IA no devolvió contenido procesable.",
                    status: response.status,
                    code: "GEMINI_EMPTY_RESPONSE"
                };
            }

            return {
                ok: true,
                text: text,
                status: response.status
            };
        } catch (err) {
            console.error("[Gemini] Fallo de red al consultar Cloud Function:", err);
            return {
                ok: false,
                error: "No se ha podido conectar con el servicio de IA en el servidor.",
                status: 0,
                code: "GEMINI_NETWORK_ERROR"
            };
        }
    }

    root.callGemini = callGemini;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = { callGemini: callGemini, AI_ENDPOINT: AI_ENDPOINT, ALLOWED_MODELS: ALLOWED_MODELS };
    }
})(typeof window !== "undefined" ? window : globalThis);
