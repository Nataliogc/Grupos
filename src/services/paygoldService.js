/**
 * ═════════════════════════════════════════════════════════════════════════════
 * NEXUS GROUPS — SERVICIO CLIENTE DE PAYGOLD REDSYS (MULTI-APP)
 * ═════════════════════════════════════════════════════════════════════════════
 * Compatible con:
 * - Nexus Groups
 * - MesaChef
 * - Spa
 */

(function (root) {
    "use strict";

    const CLOUD_FUNCTION_URL = "https://createpaygold-nls6pa6unq-uc.a.run.app";

    const PayGoldService = {
        /**
         * Detecta la clave del hotel ('cumbria' o 'guadiana')
         */
        getHotelKey: function (hotelRaw) {
            if (!hotelRaw) return 'cumbria';
            const s = String(hotelRaw).toLowerCase();
            if (s.includes('guad')) return 'guadiana';
            return 'cumbria';
        },

        /**
         * Indica si el hotel tiene PayGold activo en el sistema
         */
        isHotelReady: function (hotelKey) {
            const k = this.getHotelKey(hotelKey);
            return k === 'cumbria'; // Cumbria 100% activo; Guadiana pendiente de banco
        },

        /**
         * Formatea el código de pedido Redsys (DS_MERCHANT_ORDER):
         * Los 4 primeros caracteres deben ser dígitos numéricos.
         * Para Grupos añade "GRUPO" (ej. "77593GRUPO").
         */
        formatOrderNumber: function (reservaId, app) {
            if (!reservaId) return "";
            const clean = String(reservaId).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            const matchDigits = clean.match(/^\d+/);
            let digits = matchDigits ? matchDigits[0] : "";
            let rest = clean.substring(digits.length);
            if (digits.length < 4) {
                digits = digits.padStart(4, '0');
            }
            const appTag = String(app || 'grupos').toLowerCase();
            let tag = '';
            if (appTag.includes('grupo')) {
                if (!rest.includes('GRUPO') && !digits.includes('GRUPO')) tag = 'GRUPO';
            } else if (appTag.includes('mesa') || appTag.includes('evento')) {
                if (!rest.includes('EVENTO') && !rest.includes('MESA')) tag = 'EVENTO';
            } else if (appTag.includes('spa') || appTag.includes('circuito')) {
                if (!rest.includes('CIRCUITO') && !rest.includes('SPA')) tag = 'CIRCUITO';
            }
            let combined = digits + rest + tag;
            if (combined.length > 12) {
                const maxTail = 12 - digits.length;
                if (maxTail > 0) {
                    combined = digits + (rest + tag).slice(0, maxTail);
                } else {
                    combined = digits.slice(0, 12);
                }
            }
            return combined;
        },

        /**
         * Calcula el resumen de importes (total, pagado, pendiente) dando prioridad
         * al Plan de Pagos previsto cuando existe, o a los overrides proporcionados.
         */
        getPaymentSummary: function (groupRecord, overrides) {
            if (!groupRecord) {
                return { total: 0, paid: 0, pendingTotal: 0, plan: [], nextPendingTramo: null };
            }

            let plan = [];
            try {
                plan = JSON.parse(groupRecord.PaymentPlan_JSON || "[]");
                if (!Array.isArray(plan)) plan = [];
            } catch (e) {
                plan = [];
            }

            const planTotal = plan.reduce(function (sum, p) {
                return sum + (parseFloat(p.amount) || 0);
            }, 0);
            const planPaid = plan.reduce(function (sum, p) {
                if (p.status === "Cobrado" || p.status === "Pagado") {
                    return sum + (parseFloat(p.amount) || 0);
                }
                return sum;
            }, 0);

            const hasOverrideTotal = overrides && typeof overrides.total === "number" && !isNaN(overrides.total);
            const hasOverridePaid = overrides && typeof overrides.paid === "number" && !isNaN(overrides.paid);

            const fallbackTotal = parseFloat(groupRecord.Com_Total || groupRecord.total || groupRecord["Importe(*)"] || 0);
            const total = hasOverrideTotal
                ? overrides.total
                : (plan.length > 0 && planTotal > 0 ? planTotal : fallbackTotal);

            const fallbackPaid = parseFloat(groupRecord.Com_Pagado || 0);
            const paid = hasOverridePaid
                ? overrides.paid
                : (plan.length > 0 ? planPaid : fallbackPaid);

            const pendingTotal = Math.max(0, Math.round((total - paid) * 100) / 100);

            const nextPendingTramo = plan.find(function (p) {
                return p.status !== "Cobrado" && p.status !== "Pagado" && (parseFloat(p.amount) || 0) > 0;
            }) || null;

            return {
                total: total,
                paid: paid,
                pendingTotal: pendingTotal,
                plan: plan,
                nextPendingTramo: nextPendingTramo
            };
        },

        /**
         * Calcula las opciones sugeridas de pago para un grupo:
         * - Próximo tramo del plan de pagos (si existe y no está pagado)
         * - Saldo total pendiente (según pagos previstos)
         */
        getSuggestedAmounts: function (groupRecord, overrides) {
            if (!groupRecord) return [];

            const summary = this.getPaymentSummary(groupRecord, overrides);
            const total = summary.total;
            const paid = summary.paid;
            const pendingTotal = summary.pendingTotal;
            const nextPendingTramo = summary.nextPendingTramo;

            const options = [];

            if (nextPendingTramo) {
                const tramoAmt = parseFloat(nextPendingTramo.amount || 0);
                if (tramoAmt > 0) {
                    options.push({
                        id: "tramo",
                        label: `${nextPendingTramo.label || 'Depósito'} (${nextPendingTramo.percent || ''}%)`,
                        amount: tramoAmt,
                        description: `Tramo del Plan de Pagos: ${tramoAmt.toFixed(2)} €`,
                        defaultDate: nextPendingTramo.date || ""
                    });
                }
            } else if (total > 0 && paid === 0) {
                // Si no hay plan pero es nuevo, sugerir 30% como primer depósito
                const dep30 = Math.round(total * 0.30 * 100) / 100;
                options.push({
                    id: "dep30",
                    label: "Primer Depósito (30%)",
                    amount: dep30,
                    description: `30% de garantía: ${dep30.toFixed(2)} €`
                });
            }

            // Total pendiente
            if (pendingTotal > 0) {
                options.push({
                    id: "pending",
                    label: `Saldo Pendiente Total (${pendingTotal.toFixed(2)} €)`,
                    amount: pendingTotal,
                    description: `Total restante por abonar: ${pendingTotal.toFixed(2)} €`
                });
            }

            // Opción personalizada
            options.push({
                id: "custom",
                label: "Importe Personalizado",
                amount: 0,
                description: "Introducir manualmente el importe a cobrar"
            });

            return options;
        },

        /**
         * Solicita a la Cloud Function la generación del enlace PayGold
         * Válido para Nexus Groups, MesaChef o Spa
         */
        generateLink: async function (params) {
            const hotelKey = this.getHotelKey(params.hotel || params.Hotel_Asignado);
            const amount = parseFloat(params.amount);

            if (isNaN(amount) || amount <= 0) {
                throw new Error("El importe a cobrar debe ser superior a 0,00 €.");
            }

            if (hotelKey === 'guadiana' && !this.isHotelReady('guadiana')) {
                throw new Error("Sercotel Guadiana está pendiente de activación de PayGold por parte de Eurocaja Rural. Hotel Cumbria sí está 100% operativo.");
            }

            const refId = String(params.referenceId || params.groupId || params.reservaId || "").trim();

            const cleanConcept = String(params.concept || `Reserva ${refId} - ${params.groupName || ''}`)
                .replace(/%/g, ' pct')
                .replace(/[<>"'\\]/g, '')
                .trim();
            const cleanDepositLabel = String(params.depositLabel || "")
                .replace(/%/g, ' pct')
                .replace(/[<>"'\\]/g, '')
                .trim();

            const bodyPayload = {
                app: params.app || "grupos", // 'grupos', 'mesachef', 'spa'
                hotel: hotelKey,
                amountEuros: amount,
                groupId: refId,
                referenceId: refId,
                orderSuffix: params.orderSuffix || "",
                concept: cleanConcept,
                customerEmail: params.customerEmail || "",
                customerMobile: params.customerMobile || "",
                customerName: params.customerName || "",
                expiryDate: params.expiryDate || "",
                depositLabel: cleanDepositLabel
            };

            const response = await fetch(CLOUD_FUNCTION_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bodyPayload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || `Error Redsys ${data.errorCode || 'desconocido'}`);
            }

            return {
                paymentUrl: data.paymentUrl,
                orderId: data.orderId,
                amountEuros: data.amountEuros,
                expiresAt: data.expiresAt,
                app: data.app || bodyPayload.app
            };
        }
    };

    root.PayGoldService = PayGoldService;

    if (typeof module !== "undefined" && module.exports) {
        module.exports = PayGoldService;
    }
})(typeof window !== "undefined" ? window : globalThis);
