"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
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

  var CLOUD_FUNCTION_URL = "https://createpaygold-nls6pa6unq-uc.a.run.app";
  var PayGoldService = {
    /**
     * Detecta la clave del hotel ('cumbria' o 'guadiana')
     */
    getHotelKey: function getHotelKey(hotelRaw) {
      if (!hotelRaw) return 'cumbria';
      var s = String(hotelRaw).toLowerCase();
      if (s.includes('guad')) return 'guadiana';
      return 'cumbria';
    },
    /**
     * Indica si el hotel tiene PayGold activo en el sistema
     */
    isHotelReady: function isHotelReady(hotelKey) {
      var k = this.getHotelKey(hotelKey);
      return k === 'cumbria'; // Cumbria 100% activo; Guadiana pendiente de banco
    },
    /**
     * Formatea el código de pedido Redsys (DS_MERCHANT_ORDER):
     * Los 4 primeros caracteres deben ser dígitos numéricos.
     * Para Grupos añade "GRUPO" (ej. "77593GRUPO").
     */
    formatOrderNumber: function formatOrderNumber(reservaId, app) {
      if (!reservaId) return "";
      var clean = String(reservaId).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      var matchDigits = clean.match(/^\d+/);
      var digits = matchDigits ? matchDigits[0] : "";
      var rest = clean.substring(digits.length);
      if (digits.length < 4) {
        digits = digits.padStart(4, '0');
      }
      var appTag = String(app || 'grupos').toLowerCase();
      var tag = '';
      if (appTag.includes('grupo')) {
        if (!rest.includes('GRUPO') && !digits.includes('GRUPO')) tag = 'GRUPO';
      } else if (appTag.includes('mesa') || appTag.includes('evento')) {
        if (!rest.includes('EVENTO') && !rest.includes('MESA')) tag = 'EVENTO';
      } else if (appTag.includes('spa') || appTag.includes('circuito')) {
        if (!rest.includes('CIRCUITO') && !rest.includes('SPA')) tag = 'CIRCUITO';
      }
      var combined = digits + rest + tag;
      if (combined.length > 12) {
        var maxTail = 12 - digits.length;
        if (maxTail > 0) {
          combined = digits + (rest + tag).slice(0, maxTail);
        } else {
          combined = digits.slice(0, 12);
        }
      }
      return combined;
    },
    /**
     * Calcula las opciones sugeridas de pago para un grupo:
     * - Próximo tramo del plan de pagos (si existe y no está pagado)
     * - Saldo total pendiente
     */
    getSuggestedAmounts: function getSuggestedAmounts(groupRecord) {
      if (!groupRecord) return [];
      var total = parseFloat(groupRecord["Importe(*)"] || 0);
      var paid = parseFloat(groupRecord.Com_Pagado || 0);
      var pendingTotal = Math.max(0, total - paid);
      var options = [];

      // Analizar Plan de Pagos
      var plan = [];
      try {
        plan = JSON.parse(groupRecord.PaymentPlan_JSON || "[]");
      } catch (e) {
        plan = [];
      }

      // Buscar primer tramo pendiente
      var nextPendingTramo = plan.find(function (p) {
        return p.status !== "Cobrado" && p.status !== "Pagado";
      });
      if (nextPendingTramo) {
        var tramoAmt = parseFloat(nextPendingTramo.amount || 0);
        if (tramoAmt > 0) {
          options.push({
            id: "tramo",
            label: "".concat(nextPendingTramo.label || 'Depósito', " (").concat(nextPendingTramo.percent || '', "%)"),
            amount: tramoAmt,
            description: "Tramo del Plan de Pagos: ".concat(tramoAmt.toFixed(2), " \u20AC"),
            defaultDate: nextPendingTramo.date || ""
          });
        }
      } else if (total > 0 && paid === 0) {
        // Si no hay plan pero es nuevo, sugerir 30% como primer depósito
        var dep30 = Math.round(total * 0.30 * 100) / 100;
        options.push({
          id: "dep30",
          label: "Primer Depósito (30%)",
          amount: dep30,
          description: "30% de garant\xEDa: ".concat(dep30.toFixed(2), " \u20AC")
        });
      }

      // Total pendiente
      if (pendingTotal > 0) {
        options.push({
          id: "pending",
          label: "Saldo Pendiente Total (".concat(pendingTotal.toFixed(2), " \u20AC)"),
          amount: pendingTotal,
          description: "Total restante por abonar: ".concat(pendingTotal.toFixed(2), " \u20AC")
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
    generateLink: function () {
      var _generateLink = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(params) {
        var hotelKey, amount, refId, bodyPayload, response, data;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              hotelKey = this.getHotelKey(params.hotel || params.Hotel_Asignado);
              amount = parseFloat(params.amount);
              if (!(isNaN(amount) || amount <= 0)) {
                _context.n = 1;
                break;
              }
              throw new Error("El importe a cobrar debe ser superior a 0,00 €.");
            case 1:
              if (!(hotelKey === 'guadiana' && !this.isHotelReady('guadiana'))) {
                _context.n = 2;
                break;
              }
              throw new Error("Sercotel Guadiana está pendiente de activación de PayGold por parte de Eurocaja Rural. Hotel Cumbria sí está 100% operativo.");
            case 2:
              refId = String(params.referenceId || params.groupId || params.reservaId || "").trim();
              bodyPayload = {
                app: params.app || "grupos",
                // 'grupos', 'mesachef', 'spa'
                hotel: hotelKey,
                amountEuros: amount,
                groupId: refId,
                referenceId: refId,
                orderSuffix: params.orderSuffix || "",
                concept: params.concept || "Reserva ".concat(refId, " - ").concat(params.groupName || '').trim(),
                customerEmail: params.customerEmail || "",
                customerMobile: params.customerMobile || "",
                customerName: params.customerName || "",
                expiryDate: params.expiryDate || "",
                depositLabel: params.depositLabel || ""
              };
              _context.n = 3;
              return fetch(CLOUD_FUNCTION_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(bodyPayload)
              });
            case 3:
              response = _context.v;
              _context.n = 4;
              return response.json();
            case 4:
              data = _context.v;
              if (!(!response.ok || !data.success)) {
                _context.n = 5;
                break;
              }
              throw new Error(data.error || "Error Redsys ".concat(data.errorCode || 'desconocido'));
            case 5:
              return _context.a(2, {
                paymentUrl: data.paymentUrl,
                orderId: data.orderId,
                amountEuros: data.amountEuros,
                expiresAt: data.expiresAt,
                app: data.app || bodyPayload.app
              });
          }
        }, _callee, this);
      }));
      function generateLink(_x) {
        return _generateLink.apply(this, arguments);
      }
      return generateLink;
    }()
  };
  root.PayGoldService = PayGoldService;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = PayGoldService;
  }
})(typeof window !== "undefined" ? window : globalThis);