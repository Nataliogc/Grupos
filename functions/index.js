const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors")({ origin: true });

// Definimos la API Key como SECRET (forma moderna)
const geminiKey = defineSecret("GEMINI_KEY");

exports.analizarGruposIA = onRequest(
  {
    region: "us-central1",
    secrets: [geminiKey],
    cors: true, // Habilitar CORS nativo de v2
  },
  async (req, res) => {
    // Manejo manual de CORS por si acaso (para mayor compatibilidad con file://)
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      return res.status(405).send("Método no permitido. Usa POST.");
    }

    try {
      const GEMINI_API_KEY = geminiKey.value();

      if (!GEMINI_API_KEY) {
        logger.error("Falta la variable GEMINI_KEY");
        return res.status(500).json({
          error: "Configuración incompleta en el servidor (API Key ausente).",
        });
      }

      const { datos, prompt: customPrompt } = req.body;

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      let finalPrompt = "";

      if (customPrompt) {
        finalPrompt = customPrompt;
      } else if (datos && Array.isArray(datos)) {
        finalPrompt = `
Actúa como un Director de Revenue Management experto.
Analiza este listado de grupos hoteleros:

${JSON.stringify(datos.slice(0, 100))}

Genera un informe estratégico en Markdown con:
1. 🚩 Análisis de Riesgos
2. 💰 Estrategias de Revenue
3. 🚀 Plan de Acción (3 pasos)
4. ⚠️ Alertas operativas
`;
      } else {
        return res.status(400).json({
          error: "No se proporcionaron datos ni prompt para analizar.",
        });
      }

      const result = await model.generateContent(finalPrompt);
      const response = await result.response;
      const text = response.text();

      return res.status(200).json({
        informe: text,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      logger.error("Error crítico en Cloud Function:", error);
      return res.status(500).json({
        error: "Error interno procesando el análisis IA.",
        details: error.message,
      });
    }
  }
);
