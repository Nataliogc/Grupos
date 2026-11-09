/**
 * ═════════════════════════════════════════════════════════════════════════════
 * NEXUS GROUPS — CLOUD FUNCTIONS DE REDSYS PAYGOLD (MULTI-HOTEL & MULTI-APP)
 * ═════════════════════════════════════════════════════════════════════════════
 * Actúa como Payment Hub para Cumbria Spa & Hotel y servicios autorizados:
 * - Cumbria Spa & Hotel: FUC 168271567, Terminal 1
 * - Gest-Spa (Cumbria Bienestar): Actualización directa en Firestore de gest-spa
 * - Nexus Groups: Actualización directa en Firestore de gest-grupos-hotel
 * - MesaChef: Notificación autenticada al endpoint interno de mesa-chef-prod
 */

const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

// Secret Manager Secrets para Cumbria e Inter-Service Auth
const redsysSecretCumbria = defineSecret("REDSYS_SECRET_KEY_CUMBRIA");
const interServiceSecret = defineSecret("INTER_SERVICE_AUTH_SECRET");

// Carga de módulos del core de integración centralizada
const redsys = require("./redsys");
const { processRedsysNotification } = require("./redsys-core/core/webhook-handler");
const { createUniqueAtomicRedsysOrder } = require("./redsys-core/core/order-id-generator");
const { dispatchPaymentNotification } = require("./redsys-core/dispatchers/cross-project-dispatcher");
const { createInternalReceiver } = require("./redsys-core/endpoints/internal-receiver");
const { createScheduledRetryFunction } = require("./redsys-core/triggers/scheduled-retry");

/**
 * Función HTTP para generar un enlace de cobro PayGold REST
 */
const createPayGold = onRequest(
    {
        region: "us-central1",
        cors: true,
        invoker: "public"
    },
    async (req, res) => {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return;
        }

        if (req.method !== "POST") {
            return res.status(405).json({ error: "Método no permitido. Usa POST." });
        }

        try {
            const {
                app = "grupos",
                hotel = "cumbria",
                amountEuros,
                groupId,
                referenceId,
                orderId: requestedOrderId,
                installmentIndex = 1,
                concept,
                customerEmail,
                customerMobile,
                customerName,
                expiryDate,
                expiryHours,
                depositLabel
            } = req.body || {};

            if (!amountEuros || parseFloat(amountEuros) <= 0) {
                return res.status(400).json({ error: "El importe en euros es obligatorio y debe ser mayor a 0." });
            }

            const finalRefId = String(referenceId || groupId || "").trim();

            // Generación atómica del número de pedido Redsys garantizando unicidad por cobro
            let finalOrderId = requestedOrderId;
            if (!finalOrderId) {
                const uniqueOrder = await createUniqueAtomicRedsysOrder({
                    db,
                    hotel: hotel || "cumbria",
                    app,
                    modulo: app,
                    referenceId: finalRefId,
                    installmentIndex: parseInt(installmentIndex, 10) || 1,
                    amountEuros: parseFloat(amountEuros),
                    concept: concept || "",
                    customerEmail,
                    customerMobile
                });
                finalOrderId = uniqueOrder.orderId;
            }

            const notificationUrl = "https://redsyswebhook-nls6pa6unq-uc.a.run.app";

            logger.info(`[PayGold Hub] Generando enlace para App: ${app}, Hotel: ${hotel}, Pedido: ${finalOrderId}, Importe: ${amountEuros}€, Ref: ${finalRefId || 'N/A'}`);

            const result = await redsys.createPayGoldRequest({
                app,
                hotel,
                amountEuros,
                groupId: finalRefId,
                referenceId: finalRefId,
                orderId: finalOrderId,
                concept: concept || `Pago ${app.toUpperCase()} - ${finalRefId || ''}`,
                customerEmail,
                customerMobile,
                customerName,
                notificationUrl,
                expiryDate,
                expiryHours: expiryHours || 72
            });

            if (!result.success) {
                logger.warn(`[PayGold Hub] Error Redsys: ${result.errorCode} - ${result.error}`);
                return res.status(400).json({
                    success: false,
                    errorCode: result.errorCode,
                    error: result.error
                });
            }

            // Actualizar Enlace_TPV en groups si es de Nexus Groups
            if (app === "grupos" && finalRefId) {
                try {
                    const groupSnapshot = await db.collection("groups").where("Reserva", "==", finalRefId).get();
                    if (!groupSnapshot.empty) {
                        const batch = db.batch();
                        groupSnapshot.forEach((doc) => {
                            const ref = db.collection("groups").doc(doc.id);
                            batch.update(ref, {
                                Enlace_TPV: result.paymentUrl,
                                PayGold_UltimoPedido: result.orderId,
                                PayGold_UltimoImporte: parseFloat(amountEuros),
                                PayGold_UltimoEstado: "PENDIENTE",
                                PayGold_Caducidad: result.expiresAt,
                                updatedAt: admin.firestore.FieldValue.serverTimestamp()
                            });
                        });
                        await batch.commit();
                        logger.info(`[PayGold Hub] Enlace_TPV actualizado en Firestore para grupo ${finalRefId}`);
                    }
                } catch (dbErr) {
                    logger.error("[PayGold Hub] Error actualizando grupo en Firestore:", dbErr);
                }
            }

            // Registrar transacción centralizada en paygold_transactions con clave compuesta
            const compositeKey = `${hotel}_${app}_${result.orderId}`;
            await db.collection("paygold_transactions").doc(compositeKey).set({
                compositeId: compositeKey,
                orderId: result.orderId,
                app,
                referenceId: finalRefId,
                groupId: finalRefId,
                hotel,
                amountRequested: parseFloat(amountEuros),
                amountPaid: 0,
                paymentUrl: result.paymentUrl,
                bankStatus: "PENDIENTE",
                deliveryStatus: "pending_dispatch",
                concept: concept || "",
                depositLabel: depositLabel || "",
                customerEmail: customerEmail || "",
                customerMobile: customerMobile || "",
                expiresAt: result.expiresAt,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // Registro retrocompatible por orderId directo para clientes anteriores
            await db.collection("paygold_transactions").doc(result.orderId).set({
                compositeId: compositeKey,
                orderId: result.orderId,
                app,
                referenceId: finalRefId,
                groupId: finalRefId,
                hotel,
                amountEuros: parseFloat(amountEuros),
                paymentUrl: result.paymentUrl,
                status: "PENDIENTE",
                expiresAt: result.expiresAt,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            return res.status(200).json({
                success: true,
                paymentUrl: result.paymentUrl,
                orderId: result.orderId,
                compositeId: compositeKey,
                amountEuros: result.amountEuros,
                expiresAt: result.expiresAt,
                app
            });

        } catch (error) {
            logger.error("[PayGold Hub] Error crítico generando enlace:", error);
            return res.status(500).json({
                success: false,
                error: error.message || "Error interno generando enlace PayGold."
            });
        }
    }
);

/**
 * Webhook Oficial de Notificación Online de Redsys para Cumbria Spa & Hotel
 * URL fija inalterada: https://redsyswebhook-nls6pa6unq-uc.a.run.app
 */
const redsysWebhook = onRequest(
    {
        region: "us-central1",
        cors: true,
        invoker: "public",
        secrets: [redsysSecretCumbria, interServiceSecret]
    },
    async (req, res) => {
        try {
            logger.info("[Redsys Webhook] Notificación HTTP POST recibida de Redsys");

            const secretVal = (typeof redsysSecretCumbria?.value === 'function')
                ? (redsysSecretCumbria.value() || "T4o7OH9D6UTSo9B9xr2iRaP6I+7s4U8D")
                : (process.env.REDSYS_SECRET_KEY_CUMBRIA || "T4o7OH9D6UTSo9B9xr2iRaP6I+7s4U8D");

            process.env.REDSYS_SECRET_KEY_CUMBRIA = secretVal;

            const interVal = (typeof interServiceSecret?.value === 'function')
                ? (interServiceSecret.value() || "InterServiceSecretKeyGuadianaCumbria2026")
                : (process.env.INTER_SERVICE_AUTH_SECRET || "InterServiceSecretKeyGuadianaCumbria2026");

            process.env.INTER_SERVICE_AUTH_SECRET = interVal;

            const result = await processRedsysNotification({
                body: req.body,
                db,
                localProjectId: "gest-grupos-hotel",
                dispatcher: async ({ route, payload }) => {
                    return await dispatchPaymentNotification({
                        route,
                        payload,
                        localProjectId: "gest-grupos-hotel",
                        localDb: db,
                        logger
                    });
                },
                logger
            });

            return res.status(result.status || 200).send(result.message || "OK");

        } catch (error) {
            logger.error("[Redsys Webhook] Error procesando notificación:", error);
            return res.status(500).send("Error interno procesando notificación.");
        }
    }
);

/**
 * Receptor Interno Dedicado para Confirmaciones Inter-Servicios
 * Solo acepta peticiones internas autenticadas con token HMAC-SHA256 (MesaChef -> Grupos)
 */
const internalPaymentDispatch = onRequest(
    {
        region: "us-central1",
        cors: false,
        invoker: "public",
        secrets: [interServiceSecret]
    },
    async (req, res) => {
        const secretVal = (typeof interServiceSecret?.value === 'function')
            ? (interServiceSecret.value() || "InterServiceSecretKeyGuadianaCumbria2026")
            : (process.env.INTER_SERVICE_AUTH_SECRET || "InterServiceSecretKeyGuadianaCumbria2026");

        const handler = createInternalReceiver({
            db,
            localProjectId: "gest-grupos-hotel",
            secretKey: secretVal,
            logger
        });

        return await handler(req, res);
    }
);

/**
 * Tarea Periódica Cloud Scheduler para la Cola Persistente de Reintentos
 */
const scheduledRetryWorker = createScheduledRetryFunction({
    db,
    localProjectId: "gest-grupos-hotel",
    logger
});

module.exports = {
    createPayGold,
    redsysWebhook,
    internalPaymentDispatch,
    scheduledRetryWorker
};
