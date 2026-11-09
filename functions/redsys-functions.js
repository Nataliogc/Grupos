/**
 * ═════════════════════════════════════════════════════════════════════════════
 * NEXUS GROUPS — CLOUD FUNCTIONS DE REDSYS PAYGOLD
 * ═════════════════════════════════════════════════════════════════════════════
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const redsys = require("./redsys");

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

/**
 * Función HTTP para generar un enlace de cobro PayGold REST
 * Invocable desde el frontend de Nexus Groups
 */
const createPayGold = onRequest(
    {
        region: "us-central1",
        cors: true
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
                hotel = "cumbria",
                amountEuros,
                groupId,
                concept,
                customerEmail,
                customerMobile,
                customerName,
                expiryHours,
                depositLabel
            } = req.body || {};

            if (!amountEuros || parseFloat(amountEuros) <= 0) {
                return res.status(400).json({ error: "El importe en euros es obligatorio y debe ser mayor a 0." });
            }

            // Construir URL pública para la notificación webhook si está en producción
            const projectId = process.env.GCLOUD_PROJECT || "gest-grupos-hotel";
            const notificationUrl = `https://us-central1-${projectId}.cloudfunctions.net/redsysWebhook`;

            logger.info(`[PayGold] Solicitando enlace para ${hotel}: ${amountEuros}€ (Grupo: ${groupId || 'N/A'})`);

            // Llamar a la API REST de Redsys
            const result = await redsys.createPayGoldRequest({
                hotel,
                amountEuros,
                groupId,
                concept: concept || `Depósito reserva ${groupId || ''}`,
                customerEmail,
                customerMobile,
                customerName,
                notificationUrl,
                expiryHours: expiryHours || 72
            });

            if (!result.success) {
                logger.warn(`[PayGold] Error Redsys: ${result.errorCode} - ${result.error}`);
                return res.status(400).json({
                    success: false,
                    errorCode: result.errorCode,
                    error: result.error
                });
            }

            // Si se pasa groupId, actualizar el campo Enlace_TPV en Firestore de manera automática
            if (groupId) {
                try {
                    const normGroupId = String(groupId).trim();
                    const groupSnapshot = await db.collection("groups").where("Reserva", "==", normGroupId).get();

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
                        logger.info(`[PayGold] Campo Enlace_TPV actualizado en Firestore para grupo ${normGroupId}`);
                    }

                    // Guardar registro en historial de cobros paygold_transactions
                    await db.collection("paygold_transactions").doc(result.orderId).set({
                        orderId: result.orderId,
                        groupId: normGroupId,
                        hotel,
                        amountEuros: parseFloat(amountEuros),
                        paymentUrl: result.paymentUrl,
                        status: "PENDIENTE",
                        concept: concept || "",
                        depositLabel: depositLabel || "",
                        customerEmail: customerEmail || "",
                        customerMobile: customerMobile || "",
                        expiresAt: result.expiresAt,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                } catch (dbErr) {
                    logger.error("[PayGold] Error actualizando Firestore tras generar link:", dbErr);
                }
            }

            return res.status(200).json({
                success: true,
                paymentUrl: result.paymentUrl,
                orderId: result.orderId,
                amountEuros: result.amountEuros,
                expiresAt: result.expiresAt
            });

        } catch (error) {
            logger.error("[PayGold] Error crítico generando enlace PayGold:", error);
            return res.status(500).json({
                success: false,
                error: error.message || "Error interno generando enlace PayGold."
            });
        }
    }
);

/**
 * Webhook de Notificación Online de Redsys
 * Redsys envía una petición HTTP POST cuando el cliente completa el pago
 */
const redsysWebhook = onRequest(
    {
        region: "us-central1",
        cors: true
    },
    async (req, res) => {
        try {
            logger.info("[Redsys Webhook] Notificación recibida:", {
                body: req.body,
                query: req.query
            });

            // En un POST de notificación online, Redsys envía los parámetros en el body
            const body = req.body || {};
            const merchantParamsB64 = body.Ds_MerchantParameters || body.DS_MERCHANTPARAMETERS;
            const signature = body.Ds_Signature || body.DS_SIGNATURE;

            if (!merchantParamsB64) {
                logger.warn("[Redsys Webhook] Petición sin Ds_MerchantParameters");
                return res.status(400).send("Faltan parámetros.");
            }

            // Decodificar parámetros para saber qué comercio es
            const jsonStr = Buffer.from(merchantParamsB64, 'base64').toString('utf8');
            const params = JSON.parse(jsonStr);

            const merchantCode = params.Ds_MerchantCode || params.DS_MERCHANT_MERCHANTCODE;
            const hotelKey = (merchantCode === redsys.REDSYS_CONFIG.cumbria.merchantCode) ? "cumbria" : "guadiana";
            const secretKey = redsys.REDSYS_CONFIG[hotelKey]?.secretKey;

            // Verificar la firma criptográfica
            const verified = redsys.decodeAndVerifyResponse(body, secretKey);
            if (!verified.signatureValid) {
                logger.error("[Redsys Webhook] ERROR: Firma digital inválida.");
                return res.status(400).send("Firma inválida.");
            }

            const data = verified.data;
            const orderId = data.Ds_Order || data.DS_MERCHANT_ORDER;
            const responseCode = data.Ds_Response || data.DS_RESPONSE;
            const authCode = data.Ds_AuthorisationCode || data.DS_AUTHORISATIONCODE || "";
            const amountCents = parseInt(data.Ds_Amount || data.DS_MERCHANT_AMOUNT || "0", 10);
            const amountEuros = amountCents / 100;
            const cardBrand = data.Ds_Card_Brand || "";
            const cardIdentifier = data.Ds_Merchant_Identifier || ""; // Referencia / Token

            // Códigos 0000 a 0099 indican transacción AUTORIZADA
            const responseNum = parseInt(responseCode, 10);
            const isAuthorized = !isNaN(responseNum) && responseNum >= 0 && responseNum <= 99;

            logger.info(`[Redsys Webhook] Operación ${orderId}: Código respuesta ${responseCode} (Autorizado: ${isAuthorized})`);

            // Extraer metadata si fue enviada en DS_MERCHANT_MERCHANTDATA
            let metadata = {};
            const rawMerchantData = data.Ds_MerchantData || data.DS_MERCHANT_MERCHANTDATA;
            if (rawMerchantData) {
                try {
                    metadata = JSON.parse(decodeURIComponent(rawMerchantData));
                } catch (e) {
                    try { metadata = JSON.parse(rawMerchantData); } catch (e2) {}
                }
            }

            const groupId = metadata.groupId || "";

            // Actualizar registro en paygold_transactions
            const txRef = db.collection("paygold_transactions").doc(orderId);
            const txDoc = await txRef.get();
            const existingTx = txDoc.exists ? txDoc.data() : {};
            const finalGroupId = groupId || existingTx.groupId || "";

            await txRef.set({
                ...existingTx,
                orderId,
                groupId: finalGroupId,
                hotel: hotelKey,
                amountEuros,
                responseCode,
                authCode,
                cardBrand,
                cardIdentifier,
                status: isAuthorized ? "COBRADO" : "DENEGADO",
                paidAt: isAuthorized ? admin.firestore.FieldValue.serverTimestamp() : null,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                rawNotification: data
            }, { merge: true });

            // Si está autorizada y tenemos groupId, actualizar la reserva en Firestore
            if (isAuthorized && finalGroupId) {
                const groupSnapshot = await db.collection("groups").where("Reserva", "==", finalGroupId).get();

                if (!groupSnapshot.empty) {
                    const batch = db.batch();
                    groupSnapshot.forEach((doc) => {
                        const row = doc.data();
                        const currentPaid = parseFloat(row.Com_Pagado || 0);
                        const newPaid = currentPaid + amountEuros;

                        // Actualizar Plan de Pagos si existe
                        let paymentPlan = [];
                        try {
                            paymentPlan = JSON.parse(row.PaymentPlan_JSON || "[]");
                        } catch (e) {}

                        // Marcar tramo correspondiente como Cobrado
                        let marked = false;
                        for (const tramo of paymentPlan) {
                            if (tramo.status !== "Cobrado" && tramo.status !== "Pagado") {
                                const tramoAmt = parseFloat(tramo.amount || 0);
                                if (Math.abs(tramoAmt - amountEuros) <= 1 || !marked) {
                                    tramo.status = "Cobrado";
                                    tramo.paidDate = new Date().toISOString().split('T')[0];
                                    tramo.authCode = authCode;
                                    tramo.paymentMethod = "TPV PayGold";
                                    marked = true;
                                    break;
                                }
                            }
                        }

                        // Añadir entrada al tracking
                        let tracking = [];
                        try {
                            tracking = JSON.parse(row.tracking || "[]");
                        } catch (e) {}
                        tracking.push({
                            id: Date.now(),
                            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                            text: `Cobro PayGold online recibido: ${amountEuros.toFixed(2)}€ (Aut: ${authCode}, Pedido: ${orderId})`
                        });

                        const updateData = {
                            Com_Pagado: newPaid,
                            PayGold_UltimoEstado: "COBRADO",
                            PayGold_UltimaAutorizacion: authCode,
                            PayGold_FechaCobro: admin.firestore.FieldValue.serverTimestamp(),
                            tracking: JSON.stringify(tracking)
                        };

                        if (paymentPlan.length > 0) {
                            updateData.PaymentPlan_JSON = JSON.stringify(paymentPlan);
                        }

                        batch.update(db.collection("groups").doc(doc.id), updateData);
                    });

                    await batch.commit();
                    logger.info(`[Redsys Webhook] Reserva ${finalGroupId} actualizada con éxito tras cobro online.`);
                }
            }

            // Redsys espera un 200 OK
            return res.status(200).send("OK");

        } catch (error) {
            logger.error("[Redsys Webhook] Error procesando notificación:", error);
            return res.status(500).send("Error interno procesando notificación.");
        }
    }
);

module.exports = {
    createPayGold,
    redsysWebhook
};
