/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Integración con Gemini AI
 * ═══════════════════════════════════════════════════════════
 * Función centralizada para llamadas a la API de Gemini.
 * Sustituye las 4+ copias duplicadas en los HTML.
 *
 * Dependencias: Firebase debe estar inicializado antes.
 * Uso: <script src="js/gemini.js"></script>
 *      await window.callGemini("tu prompt aquí");
 * ═══════════════════════════════════════════════════════════
 */

(function () {
    "use strict";

    /**
     * Llama a la API de Gemini con un prompt personalizado.
     * Intenta primero obtener la API key y modelo de Firestore (settings/main),
     * y usa la API key de Firebase como fallback.
     *
     * @param {string} customPrompt - El texto del prompt
     * @returns {Promise<string>} - La respuesta generada por Gemini
     */
    async function callGemini(customPrompt) {
        var apiKey = window.firebaseConfig ? window.firebaseConfig.apiKey : null;
        var model = "gemini-1.5-flash";

        // Intentar obtener configuración dinámica de Firestore
        try {
            var db = firebase.firestore();
            var settingsDoc = await db.collection("settings").doc("main").get();
            if (settingsDoc.exists) {
                var s = settingsDoc.data().system || {};
                if (s.geminiApiKey) apiKey = s.geminiApiKey;
                if (s.geminiModel) model = s.geminiModel;
            }
        } catch (e) {
            console.warn("[Gemini] No se pudo cargar config de Firestore, usando fallback.");
        }

        if (!apiKey || apiKey === "TU_API_KEY_AQUI") {
            return {
                ok: false,
                error: "⚠️ ERROR: No se ha configurado la API Key de Gemini en el panel de Configuración.",
                status: 401,
                code: "GEMINI_MISSING_API_KEY"
            };
        }

        var url =
            "https://generativelanguage.googleapis.com/v1/models/" +
            model +
            ":generateContent?key=" +
            apiKey;

        try {
            var response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: customPrompt }] }],
                }),
            });

            const rawBody = await response.text();
            const contentType = response.headers.get("content-type") || "";

            if (!response.ok) {
                console.error("Error HTTP de Gemini:", {
                    status: response.status,
                    statusText: response.statusText,
                    contentType,
                    body: rawBody
                });

                let msg = "";
                try {
                    var errorObj = JSON.parse(rawBody);
                    msg = (errorObj.error && errorObj.error.message) || "";
                } catch(e) {}

                if (msg.includes("blocked") || msg.includes("PERMISSION_DENIED")) {
                    return { ok: false, error: "🚫 ACCESO DENEGADO: Tu API Key está bloqueada o no tiene los permisos necesarios (Generative Language API) en Google AI Studio.", status: response.status, code: "GEMINI_PERMISSION_DENIED" };
                }
                if (msg.includes("leaked")) {
                    return { ok: false, error: "⚠️ Tu API Key ha sido desactivada por seguridad (leaked). Por favor, introduce una nueva en el panel de Configuración.", status: response.status, code: "GEMINI_KEY_LEAKED" };
                }
                
                return {
                    ok: false,
                    error: msg ? ("Error en servidor IA: " + msg) : `Error del servidor (${response.status}).`,
                    status: response.status,
                    code: "GEMINI_HTTP_ERROR"
                };
            }

            let payload;
            try {
                payload = rawBody ? JSON.parse(rawBody) : null;
            } catch (error) {
                console.error("Gemini devolvió una respuesta no JSON:", {
                    status: response.status,
                    contentType,
                    body: rawBody
                });
                return {
                    ok: false,
                    error: "El servicio de IA devolvió una respuesta con formato incorrecto.",
                    status: response.status,
                    code: "GEMINI_INVALID_RESPONSE"
                };
            }

            var text = "";
            try {
                text = payload.candidates[0].content.parts[0].text;
            } catch (e) {}

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
            console.error("Fallo de red al consultar Gemini:", err);
            return {
                ok: false,
                error: "No se ha podido conectar con el servicio de IA.",
                status: 0,
                code: "GEMINI_NETWORK_ERROR"
            };
        }
    }

    // Exportar al scope global
    window.callGemini = callGemini;

})();
