/**
 * ═════════════════════════════════════════════════════════════════════════════
 * NEXUS GROUPS — CLOUD FUNCTIONS DE REDSYS PAYGOLD (MULTI-APLICACIÓN)
 * ═════════════════════════════════════════════════════════════════════════════
 * Actúa como Payment Hub para:
 * - Nexus Groups (Reservas y Habitaciones)
 * - MesaChef (Eventos, Banquetes y Restaurante)
 * - Spa (Citas, Circuitos y Tratamientos)
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
 * Invocable desde cualquier frontend: Nexus Groups, MesaChef, Spa.
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
                app = "grupos", // 'grupos', 'mesachef', 'spa'
                hotel = "cumbria",
                amountEuros,
                groupId,
                referenceId,
                orderId,
                orderSuffix,
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

            // URL pública fija de notificación online webhook
            const notificationUrl = "https://redsyswebhook-nls6pa6unq-uc.a.run.app";

            logger.info(`[PayGold Hub] Solicitando enlace para App: ${app}, Hotel: ${hotel}, Importe: ${amountEuros}€, Ref: ${finalRefId || 'N/A'}`);

            // Llamar a la API REST de Redsys
            const result = await redsys.createPayGoldRequest({
                app,
                hotel,
                amountEuros,
                groupId: finalRefId,
                referenceId: finalRefId,
                orderId,
                orderSuffix,
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

            // Si es de grupos y tenemos localizador, actualizar el campo Enlace_TPV en groups
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

            // Registrar transacción centralizada en paygold_transactions
            // Accesible por cualquier app (Grupos, MesaChef, Spa) para escuchar en tiempo real
            await db.collection("paygold_transactions").doc(result.orderId).set({
                orderId: result.orderId,
                app,
                referenceId: finalRefId,
                groupId: finalRefId,
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

            return res.status(200).json({
                success: true,
                paymentUrl: result.paymentUrl,
                orderId: result.orderId,
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
 * Webhook de Notificación Online de Redsys
 * Redsys envía una petición HTTP POST cuando el cliente completa el pago
 */
const redsysWebhook = onRequest(
    {
        region: "us-central1",
        cors: true,
        invoker: "public"
    },
    async (req, res) => {
        try {
            logger.info("[Redsys Webhook] Notificación recibida de Redsys");

            const body = req.body || {};
            const merchantParamsB64 = body.Ds_MerchantParameters || body.DS_MERCHANTPARAMETERS;

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

            // Buscar datos previos si existen
            const txRef = db.collection("paygold_transactions").doc(orderId);
            const txDoc = await txRef.get();
            const existingTx = txDoc.exists ? txDoc.data() : {};

            const app = metadata.app || existingTx.app || "grupos";
            const refId = metadata.referenceId || metadata.groupId || existingTx.referenceId || existingTx.groupId || "";

            // Actualizar registro central en paygold_transactions
            await txRef.set({
                ...existingTx,
                orderId,
                app,
                referenceId: refId,
                groupId: refId,
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

            // Ruteo automático según la aplicación de origen:
            if (isAuthorized) {
                if (app === "grupos" && refId) {
                    // 1. NEXUS GROUPS: Actualizar reserva, plan de pagos y tracking
                    const groupSnapshot = await db.collection("groups").where("Reserva", "==", refId).get();

                    if (!groupSnapshot.empty) {
                        const batch = db.batch();
                        groupSnapshot.forEach((doc) => {
                            const row = doc.data();
                            const currentPaid = parseFloat(row.Com_Pagado || 0);
                            const newPaid = currentPaid + amountEuros;

                            let paymentPlan = [];
                            try {
                                paymentPlan = JSON.parse(row.PaymentPlan_JSON || "[]");
                            } catch (e) {}

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
                        logger.info(`[Redsys Webhook] Grupo ${refId} actualizado con éxito.`);
                    }
                } else if (app === "mesachef" && refId) {
                    // 2. MESACHEF: Registrar cobro de banquete/evento
                    await db.collection("mesachef_payments").doc(orderId).set({
                        orderId,
                        eventId: refId,
                        amountEuros,
                        status: "COBRADO",
                        authCode,
                        hotel: hotelKey,
                        paidAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    logger.info(`[Redsys Webhook] Evento MesaChef ${refId} registrado como COBRADO.`);
                } else if (app === "spa" && refId) {
                    // 3. SPA: Registrar cobro de cita/tratamiento
                    await db.collection("spa_payments").doc(orderId).set({
                        orderId,
                        appointmentId: refId,
                        amountEuros,
                        status: "COBRADO",
                        authCode,
                        hotel: hotelKey,
                        paidAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                    logger.info(`[Redsys Webhook] Cita Spa ${refId} registrada como COBRADO.`);
                }
            }

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
