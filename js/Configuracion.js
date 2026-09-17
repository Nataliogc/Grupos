"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
var BUDGET_MODEL_TEMPLATES = [{
  "title": "Cupo y Disponibilidad",
  "body": "La presente oferta es válida por 48 horas. Dado que se requiere el bloqueo total de instalaciones, la disponibilidad no se garantiza hasta el primer depósito. [EN] This offer is valid for 48 hours. Since total facility blocking is required, availability is not guaranteed until the first deposit."
}, {
  "title": "Confirmación y Depósito",
  "body": "Bloqueo confirmado al recibir el 30% del total ({DEP_30}). El 70% restante deberá liquidarse 7 días antes de la entrada. [EN] Booking confirmed upon receipt of 30% of the total ({DEP_30}). The remaining 70% must be settled 7 days before entry."
}, {
  "title": "Política de Cancelación",
  "body": "Al ser un evento de carácter exclusivo con bloqueo de inventario, todos los depósitos entregados tienen carácter de NO REEMBOLSABLES. [EN] Being an exclusive event with inventory blocking, all deposits delivered are NON-REFUNDABLE."
}, {
  "title": "Rooming List",
  "body": "La relación detallada de ocupantes deberá entregarse 5 días hábiles antes de la llegada del primer pasajero. [EN] The detailed list of occupants must be delivered 5 business days before the arrival of the first passenger."
}];
var CONF_MODEL_TEMPLATES = [{
  "title": "Confirmación y Depósito",
  "body": "Para garantizar la reserva definitiva, se requiere un primer depósito del 30% ({DEP_30}) en concepto de garantía. La reserva no se considerará confirmada hasta la recepción del mismo. [EN] To guarantee the definitive reservation, a first deposit of 30% ({DEP_30}) is required as a guarantee. The reservation will not be considered confirmed until it is received."
}, {
  "title": "Calendario de Pagos y Release",
  "body": "Se establece un release de 30 días previos a la entrada ({RELEASE_30}), fecha en la cual el hotel deberá haber recibido el 50% del total ({DEP_50}). El pago final del 100% ({DEP_100}) deberá estar liquidado 7 días antes de la llegada ({RELEASE_7}). [EN] A release is established 30 days prior to entry ({RELEASE_30}), by which date the hotel must have received 50% of the total ({DEP_50}). The final payment of 100% ({DEP_100}) must be settled 7 days before arrival ({RELEASE_7})."
}, {
  "title": "Reducciones y Cancelaciones",
  "body": "Se permite una reducción de hasta el 10% del número de habitaciones contratadas sin gastos hasta 15 días antes de la llegada ({RELEASE_15}). Cancelaciones totales posteriores a esta fecha incurrirán en un 100% de gastos. [EN] A reduction of up to 10% of the number of rooms contracted without charge is allowed until 15 days before arrival ({RELEASE_15}). Total cancellations after this date will incur 100% charges."
}, {
  "title": "Rooming List y Régimen",
  "body": "La lista definitiva de ocupantes (Rooming List) deberá ser enviada antes del {RELEASE_7}. Cualquier cambio posterior queda sujeto a disponibilidad. [EN] The final list of occupants (Rooming List) must be sent before {RELEASE_7}. Any subsequent change is subject to availability."
}];
var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useRef = _React.useRef;

// LucideIcon cargado desde js/icons.js (window.LucideIcon)

// --- FIREBASE ---
var db = window.db;
var App = function App() {
  var _config$system5, _config$system6, _config$system7, _config$common2, _config$common3, _resetPassUser$user, _resetPassUser$user2, _resetPassUser$user3;
  var urlParams = new URLSearchParams(window.location.search);
  var initialTab = urlParams.get('tab') || 'guadiana';
  var _useState = useState(initialTab),
    _useState2 = _slicedToArray(_useState, 2),
    activeHotel = _useState2[0],
    setActiveHotel = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1];
  var _useState5 = useState(null),
    _useState6 = _slicedToArray(_useState5, 2),
    message = _useState6[0],
    setMessage = _useState6[1];
  var _useState7 = useState(null),
    _useState8 = _slicedToArray(_useState7, 2),
    editingCommercialIdx = _useState8[0],
    setEditingCommercialIdx = _useState8[1];
  var _useState9 = useState(''),
    _useState0 = _slicedToArray(_useState9, 2),
    editingCommercialName = _useState0[0],
    setEditingCommercialName = _useState0[1];
  // Estados para Administración de Usuarios
  var _useState1 = useState(''),
    _useState10 = _slicedToArray(_useState1, 2),
    userSearch = _useState10[0],
    setUserSearch = _useState10[1];
  var _useState11 = useState(false),
    _useState12 = _slicedToArray(_useState11, 2),
    showAddUserModal = _useState12[0],
    setShowAddUserModal = _useState12[1];
  var _useState13 = useState({
      name: '',
      email: '',
      role: 'Comercial',
      pass: '1234'
    }),
    _useState14 = _slicedToArray(_useState13, 2),
    newUserData = _useState14[0],
    setNewUserData = _useState14[1];
  var _useState15 = useState(null),
    _useState16 = _slicedToArray(_useState15, 2),
    resetPassUser = _useState16[0],
    setResetPassUser = _useState16[1];
  var _useState17 = useState({
      guadiana: {
        name: "Hotel",
        subname: "Guadiana",
        company: "SWEETMOON DESARROLLOS S.L.",
        nif: "B87067302",
        legal: "Inscrito en la hoja CR-00035559 del Registro Mercantil de Ciudad Real. Folio electrónico. Inscripción/anotación 4",
        irus: "1000292995580",
        address: "C/ Guadiana, 36",
        cp: "13002",
        city: "Ciudad Real",
        tel: "926 22 33 13",
        email: "info@hotelguadiana.es",
        web: "www.hotelguadiana.es",
        bank: "Globalcaja",
        iban: "ES30 3190 3953 1851 8526 3521",
        paymentGateway: "",
        clauses: [{
          "title": "Cupo y Disponibilidad",
          "body": "La presente oferta es válida por 48 horas. Dado que se requiere el bloqueo total de instalaciones, la disponibilidad no se garantiza hasta el primer depósito. [EN] This offer is valid for 48 hours. Since total facility blocking is required, availability is not guaranteed until the first deposit."
        }, {
          "title": "Confirmación y Depósito",
          "body": "Bloqueo confirmado al recibir el 30% del total ({DEP_30}). El 70% restante deberá liquidarse 7 días antes de la entrada. [EN] Booking confirmed upon receipt of 30% of the total ({DEP_30}). The remaining 70% must be settled 7 days before entry."
        }, {
          "title": "Política de Cancelación",
          "body": "Al ser un evento de carácter exclusivo con bloqueo de inventario, todos los depósitos entregados tienen carácter de NO REEMBOLSABLES. [EN] Being an exclusive event with inventory blocking, all deposits delivered are NON-REFUNDABLE."
        }, {
          "title": "Rooming List",
          "body": "La relación detallada de ocupantes deberá entregarse 5 días hábiles antes de la llegada del primer pasajero. [EN] The detailed list of occupants must be delivered 5 business days before the arrival of the first passenger."
        }],
        confirmationClauses: [{
          "title": "Confirmación y Depósito",
          "body": "Para garantizar la reserva definitiva, se requiere un primer depósito del 30% ({DEP_30}) en concepto de garantía. La reserva no se considerará confirmada hasta la recepción del mismo. [EN] To guarantee the definitive reservation, a first deposit of 30% ({DEP_30}) is required as a guarantee. The reservation will not be considered confirmed until it is received."
        }, {
          "title": "Calendario de Pagos y Release",
          "body": "Se establece un release de 30 días previos a la entrada ({RELEASE_30}), fecha en la cual el hotel deberá haber recibido el 50% del total ({DEP_50}). El pago final del 100% ({DEP_100}) deberá estar liquidado 7 días antes de la llegada ({RELEASE_7}). [EN] A release is established 30 days prior to entry ({RELEASE_30}), by which date the hotel must have received 50% of the total ({DEP_50}). The final payment of 100% ({DEP_100}) must be settled 7 days before arrival ({RELEASE_7})."
        }, {
          "title": "Reducciones y Cancelaciones",
          "body": "Se permite una reducción de hasta el 10% del número de habitaciones contratadas sin gastos hasta 15 días antes de la llegada ({RELEASE_15}). Cancelaciones totales posteriores a esta fecha incurrirán en un 100% de gastos. [EN] A reduction of up to 10% of the number of rooms contracted without charge is allowed until 15 days before arrival ({RELEASE_15}). Total cancellations after this date will incur 100% charges."
        }, {
          "title": "Rooming List y Régimen",
          "body": "La lista definitiva de ocupantes (Rooming List) deberá ser enviada antes del {RELEASE_7}. Cualquier cambio posterior queda sujeto a disponibilidad. [EN] The final list of occupants (Rooming List) must be sent before {RELEASE_7}. Any subsequent change is subject to availability."
        }]
      },
      cumbria: {
        name: "Hotel",
        subname: "Cumbria",
        company: "MOON FREE PORT, S.L.",
        nif: "B87895058",
        legal: "Inscrito en el tomo 699 de libro 0 folio 2 hoja CR-32491 inscripción 2ª",
        irus: "",
        address: "Ctra. Fuencaliente, s/n",
        cp: "13004",
        city: "Ciudad Real",
        tel: "926 25 10 25",
        email: "recepcion@hotelcumbria.es",
        web: "www.hotelcumbria.es",
        bank: "Caixabank",
        iban: "ES19 3081 0601 0850 0004 8966",
        paymentGateway: "",
        clauses: [{
          "title": "Cupo y Disponibilidad",
          "body": "La presente oferta es válida por 48 horas. Dado que se requiere el bloqueo total de instalaciones, la disponibilidad no se garantiza hasta el primer depósito. [EN] This offer is valid for 48 hours. Since total facility blocking is required, availability is not guaranteed until the first deposit."
        }, {
          "title": "Confirmación y Depósito",
          "body": "Bloqueo confirmado al recibir el 30% del total ({DEP_30}). El 70% restante deberá liquidarse 7 días antes de la entrada. [EN] Booking confirmed upon receipt of 30% of the total ({DEP_30}). The remaining 70% must be settled 7 days before entry."
        }, {
          "title": "Política de Cancelación",
          "body": "Al ser un evento de carácter exclusivo con bloqueo de inventario, todos los depósitos entregados tienen carácter de NO REEMBOLSABLES. [EN] Being an exclusive event with inventory blocking, all deposits delivered are NON-REFUNDABLE."
        }, {
          "title": "Rooming List",
          "body": "La relación detallada de ocupantes deberá entregarse 5 días hábiles antes de la llegada del primer pasajero. [EN] The detailed list of occupants must be delivered 5 business days before the arrival of the first passenger."
        }],
        confirmationClauses: [{
          "title": "Confirmación y Depósito",
          "body": "Para garantizar la reserva definitiva, se requiere un primer depósito del 30% ({DEP_30}) en concepto de garantía. La reserva no se considerará confirmada hasta la recepción del mismo. [EN] To guarantee the definitive reservation, a first deposit of 30% ({DEP_30}) is required as a guarantee. The reservation will not be considered confirmed until it is received."
        }, {
          "title": "Calendario de Pagos y Release",
          "body": "Se establece un release de 30 días previos a la entrada ({RELEASE_30}), fecha en la cual el hotel deberá haber recibido el 50% del total ({DEP_50}). El pago final del 100% ({DEP_100}) deberá estar liquidado 7 días antes de la llegada ({RELEASE_7}). [EN] A release is established 30 days prior to entry ({RELEASE_30}), by which date the hotel must have received 50% of the total ({DEP_50}). The final payment of 100% ({DEP_100}) must be settled 7 days before arrival ({RELEASE_7})."
        }, {
          "title": "Reducciones y Cancelaciones",
          "body": "Se permite una reducción de hasta el 10% del número de habitaciones contratadas sin gastos hasta 15 días antes de la llegada ({RELEASE_15}). Cancelaciones totales posteriores a esta fecha incurrirán en un 100% de gastos. [EN] A reduction of up to 10% of the number of rooms contracted without charge is allowed until 15 days before arrival ({RELEASE_15}). Total cancellations after this date will incur 100% charges."
        }, {
          "title": "Rooming List y Régimen",
          "body": "La lista definitiva de ocupantes (Rooming List) deberá ser enviada antes del {RELEASE_7}. Cualquier cambio posterior queda sujeto a disponibilidad. [EN] The final list of occupants (Rooming List) must be sent before {RELEASE_7}. Any subsequent change is subject to availability."
        }]
      },
      system: {
        pin: "1234",
        geminiModel: "gemini-2.4-flash",
        iaStatus: "Online",
        commercials: ["NATALIO", "EMILIA", "CANDELARIA", "MARTA"],
        users: [{
          email: "dianahotelguadiana@gmail.com",
          pass: "1234",
          name: "Diana",
          role: "Comercial"
        }, {
          email: "ssanchez@hotelguadiana.es",
          pass: "1234",
          name: "Sergio",
          role: "Dirección"
        }, {
          email: "osanchez@hotelguadiana.es",
          pass: "1234",
          name: "Oscar",
          role: "Dirección"
        }, {
          email: "comunicaciones@hotelguadiana.es",
          pass: "1234",
          name: "Natalio",
          role: "Administrador"
        }]
      },
      common: {
        services: [{
          label: "Habitación Doble (DBL)",
          pax: 2,
          isService: false
        }, {
          label: "Hab. Doble Uso Individual (DUI)",
          pax: 1,
          isService: false
        }, {
          label: "Habitación Triple (TPL)",
          pax: 3,
          isService: false
        }, {
          label: "Habitación Triple Niño (TPL Niño)",
          pax: 3,
          isService: false
        }, {
          label: "Habitación Cuádruple (CUA)",
          pax: 4,
          isService: false
        }, {
          label: "Habitación Individual (IND)",
          pax: 1,
          isService: false
        }, {
          label: "Suite (SUI)",
          pax: 2,
          isService: false
        }, {
          label: "Suite Superior (S.SUP)",
          pax: 2,
          isService: false
        }, {
          label: "Junior Suite",
          pax: 2,
          isService: false
        }, {
          label: "Suite",
          pax: 2,
          isService: false
        }, {
          label: "Almuerzo",
          pax: 1,
          isService: true
        }, {
          label: "Cena",
          pax: 1,
          isService: true
        }, {
          label: "Desayuno",
          pax: 1,
          isService: true
        }],
        clauses: [{
          "title": "VALIDEZ Y DISPONIBILIDAD / VALIDITY & AVAILABILITY",
          "body": "Este presupuesto tiene una validez de 7 días. Las habitaciones no quedan bloqueadas y, pasado este plazo, tanto la disponibilidad como las tarifas pueden presentar cambios. [EN] This quote is valid for 7 days. Rooms are not blocked and, after this period, both availability and rates are subject to change."
        }, {
          "title": "CÓMO CONFIRMAR / HOW TO CONFIRM",
          "body": "Para confirmar su reserva, simplemente responda a este correo manifestando su aceptación. Una vez recibida su respuesta, procederemos a bloquear las habitaciones y le enviaremos la confirmación definitiva. [EN] To confirm your booking, simply reply to this email stating your acceptance. Upon receipt, we will proceed to block the rooms and send you the final confirmation."
        }],
        confirmationClauses: [{
          "title": "CONFIRMACIÓN Y DEPÓSITO / CONFIRMATION & DEPOSIT",
          "body": "Para garantizar la reserva definitiva, se requiere un primer depósito del 30% ({DEP_30}) en concepto de garantía. La reserva no se considerará confirmada hasta la recepción del mismo. [EN] To guarantee the definitive reservation, a first deposit of 30% ({DEP_30}) is required as a guarantee. The reservation will not be considered confirmed until it is received."
        }, {
          "title": "CALENDARIO DE PAGOS / PAYMENT SCHEDULE",
          "body": "El pago restante deberá realizarse según los plazos establecidos en el plan de pagos adjunto. [EN] The remaining payment must be made according to the deadlines established in the attached payment plan."
        }]
      }
    }),
    _useState18 = _slicedToArray(_useState17, 2),
    config = _useState18[0],
    setConfig = _useState18[1];
  useEffect(function () {
    // Cargar config desde Firestore si existe
    db.collection("settings").doc("main").get().then(function (doc) {
      if (doc.exists) {
        var data = doc.data();
        setConfig(function (prev) {
          var cloudUsers = data.system && Array.isArray(data.system.users) && data.system.users.length > 0 ? data.system.users : prev.system.users;
          return _objectSpread(_objectSpread(_objectSpread({}, prev), data), {}, {
            system: _objectSpread(_objectSpread(_objectSpread({}, prev.system), data.system || {}), {}, {
              users: cloudUsers
            })
          });
        });
      }
    });
    // Lucide se maneja ahora a través del componente LucideIcon
  }, []);
  var saveConfig = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            setLoading(true);
            _context.p = 1;
            _context.n = 2;
            return db.collection("settings").doc("main").set(config);
          case 2:
            setMessage({
              type: 'success',
              text: 'Configuración guardada correctamente en la nube.'
            });
            _context.n = 4;
            break;
          case 3:
            _context.p = 3;
            _t = _context.v;
            setMessage({
              type: 'error',
              text: 'Error al persistir datos. Revisa permisos.'
            });
          case 4:
            setLoading(false);
            setTimeout(function () {
              return setMessage(null);
            }, 3000);
          case 5:
            return _context.a(2);
        }
      }, _callee, null, [[1, 3]]);
    }));
    return function saveConfig() {
      return _ref.apply(this, arguments);
    };
  }();
  var handleTranslateClause = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(idx, fieldKey, hotel) {
      var currentList, textToTranslate, prompt, aiResult, _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            currentList = _toConsumableArray(config[hotel][fieldKey] || []);
            textToTranslate = currentList[idx].body.split('[EN]')[0].trim();
            if (textToTranslate) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            _context2.p = 1;
            prompt = "Traduce el siguiente texto de un presupuesto de hotel al ingl\xE9s. Mant\xE9n un tono profesional y corporativo. Devuelve SOLO el texto traducido, sin comillas ni introducciones: \"".concat(textToTranslate, "\"");
            _context2.n = 2;
            return window.callGemini(prompt);
          case 2:
            aiResult = _context2.v;
            if (aiResult !== null && aiResult !== void 0 && aiResult.ok) {
              currentList[idx].body = "".concat(textToTranslate, " [EN] ").concat(aiResult.text.trim());
              handleChange(hotel, fieldKey, currentList);
            } else {
              alert("Error en la traducción: " + ((aiResult === null || aiResult === void 0 ? void 0 : aiResult.error) || "Desconocido"));
            }
            _context2.n = 4;
            break;
          case 3:
            _context2.p = 3;
            _t2 = _context2.v;
            alert("Error al conectar con la IA.");
          case 4:
            return _context2.a(2);
        }
      }, _callee2, null, [[1, 3]]);
    }));
    return function handleTranslateClause(_x, _x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  }();
  var handleChange = function handleChange(hotel, field, value) {
    setConfig(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, hotel, _objectSpread(_objectSpread({}, prev[hotel]), {}, _defineProperty({}, field, value))));
    });
  };
  var handleCreateUser = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
      var _config$system;
      var name, email, role, pass, currentUsers, emailLower, newUser, updatedUsers, updatedConfig, _t3;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            name = (newUserData.name || '').trim();
            email = (newUserData.email || '').trim();
            role = newUserData.role || "Comercial";
            pass = (newUserData.pass || '').trim();
            if (name) {
              _context3.n = 1;
              break;
            }
            alert("Por favor, introduce el nombre del usuario.");
            return _context3.a(2);
          case 1:
            if (email) {
              _context3.n = 2;
              break;
            }
            alert("Por favor, introduce el correo electrónico del usuario.");
            return _context3.a(2);
          case 2:
            if (!(!pass || pass.length < 4)) {
              _context3.n = 3;
              break;
            }
            alert("La contraseña debe tener al menos 4 caracteres.");
            return _context3.a(2);
          case 3:
            currentUsers = _toConsumableArray(((_config$system = config.system) === null || _config$system === void 0 ? void 0 : _config$system.users) || []);
            emailLower = email.toLowerCase();
            if (!currentUsers.some(function (u) {
              return (u.email || '').toLowerCase() === emailLower;
            })) {
              _context3.n = 4;
              break;
            }
            alert("Ya existe un usuario registrado con este correo electrónico.");
            return _context3.a(2);
          case 4:
            newUser = {
              id: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
              name: name,
              email: email,
              role: role,
              pass: pass,
              active: true,
              revoked: false
            };
            updatedUsers = [].concat(_toConsumableArray(currentUsers), [newUser]);
            updatedConfig = _objectSpread(_objectSpread({}, config), {}, {
              system: _objectSpread(_objectSpread({}, config.system || {}), {}, {
                users: updatedUsers
              })
            });
            setConfig(updatedConfig);
            setLoading(true);
            _context3.p = 5;
            _context3.n = 6;
            return db.collection("settings").doc("main").set(updatedConfig);
          case 6:
            setMessage({
              type: 'success',
              text: "Usuario \"".concat(name, "\" creado correctamente en el sistema.")
            });
            setShowAddUserModal(false);
            setNewUserData({
              name: '',
              email: '',
              role: 'Comercial',
              pass: '1234'
            });
            _context3.n = 8;
            break;
          case 7:
            _context3.p = 7;
            _t3 = _context3.v;
            setMessage({
              type: 'error',
              text: 'Error al persistir el nuevo usuario en Firestore.'
            });
          case 8:
            setLoading(false);
            setTimeout(function () {
              return setMessage(null);
            }, 3500);
          case 9:
            return _context3.a(2);
        }
      }, _callee3, null, [[5, 7]]);
    }));
    return function handleCreateUser() {
      return _ref3.apply(this, arguments);
    };
  }();
  var handleToggleRevokeUser = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(idx) {
      var _config$system2;
      var users, target, isNatalio, currentlyRevoked, nextRevoked, ok, updatedConfig, _t4;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.p = _context4.n) {
          case 0:
            users = _toConsumableArray(((_config$system2 = config.system) === null || _config$system2 === void 0 ? void 0 : _config$system2.users) || []);
            target = users[idx];
            if (target) {
              _context4.n = 1;
              break;
            }
            return _context4.a(2);
          case 1:
            isNatalio = target.name && target.name.toLowerCase() === 'natalio' || target.email && target.email.toLowerCase().includes('comunicaciones@hotelguadiana.es');
            if (!isNatalio) {
              _context4.n = 2;
              break;
            }
            alert("Por seguridad, no es posible revocar el acceso a la cuenta principal del Administrador (Natalio).");
            return _context4.a(2);
          case 2:
            currentlyRevoked = target.revoked === true || target.active === false;
            nextRevoked = !currentlyRevoked;
            if (!nextRevoked) {
              _context4.n = 3;
              break;
            }
            ok = window.confirm("\xBFConfirmas que deseas REVOCAR el acceso a \"".concat(target.name, "\"? El usuario no podr\xE1 iniciar sesi\xF3n en Nexus Groups."));
            if (ok) {
              _context4.n = 3;
              break;
            }
            return _context4.a(2);
          case 3:
            users[idx] = _objectSpread(_objectSpread({}, target), {}, {
              revoked: nextRevoked,
              active: !nextRevoked
            });
            updatedConfig = _objectSpread(_objectSpread({}, config), {}, {
              system: _objectSpread(_objectSpread({}, config.system || {}), {}, {
                users: users
              })
            });
            setConfig(updatedConfig);
            setLoading(true);
            _context4.p = 4;
            _context4.n = 5;
            return db.collection("settings").doc("main").set(updatedConfig);
          case 5:
            setMessage({
              type: 'success',
              text: nextRevoked ? "Acceso de \"".concat(target.name, "\" revocado correctamente.") : "Acceso de \"".concat(target.name, "\" reactivado correctamente.")
            });
            _context4.n = 7;
            break;
          case 6:
            _context4.p = 6;
            _t4 = _context4.v;
            setMessage({
              type: 'error',
              text: 'Error al actualizar el estado del usuario.'
            });
          case 7:
            setLoading(false);
            setTimeout(function () {
              return setMessage(null);
            }, 3500);
          case 8:
            return _context4.a(2);
        }
      }, _callee4, null, [[4, 6]]);
    }));
    return function handleToggleRevokeUser(_x4) {
      return _ref4.apply(this, arguments);
    };
  }();
  var handleResetUserPass = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(idx, newPass) {
      var _config$system3;
      var trimmed, users, target, updatedConfig, _t5;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.p = _context5.n) {
          case 0:
            trimmed = (newPass || '').trim();
            if (!(!trimmed || trimmed.length < 4)) {
              _context5.n = 1;
              break;
            }
            alert("La contraseña debe contener al menos 4 caracteres.");
            return _context5.a(2);
          case 1:
            users = _toConsumableArray(((_config$system3 = config.system) === null || _config$system3 === void 0 ? void 0 : _config$system3.users) || []);
            target = users[idx];
            if (target) {
              _context5.n = 2;
              break;
            }
            return _context5.a(2);
          case 2:
            users[idx] = _objectSpread(_objectSpread({}, target), {}, {
              pass: trimmed
            });
            updatedConfig = _objectSpread(_objectSpread({}, config), {}, {
              system: _objectSpread(_objectSpread({}, config.system || {}), {}, {
                users: users
              })
            });
            setConfig(updatedConfig);
            setLoading(true);
            _context5.p = 3;
            _context5.n = 4;
            return db.collection("settings").doc("main").set(updatedConfig);
          case 4:
            setMessage({
              type: 'success',
              text: "Contrase\xF1a de \"".concat(target.name, "\" restablecida con \xE9xito a \"").concat(trimmed, "\".")
            });
            setResetPassUser(null);
            _context5.n = 6;
            break;
          case 5:
            _context5.p = 5;
            _t5 = _context5.v;
            setMessage({
              type: 'error',
              text: 'Error al actualizar la contraseña en Firestore.'
            });
          case 6:
            setLoading(false);
            setTimeout(function () {
              return setMessage(null);
            }, 3500);
          case 7:
            return _context5.a(2);
        }
      }, _callee5, null, [[3, 5]]);
    }));
    return function handleResetUserPass(_x5, _x6) {
      return _ref5.apply(this, arguments);
    };
  }();
  var handleDeleteUser = /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(idx) {
      var _config$system4;
      var users, target, isNatalio, ok, updatedConfig, _t6;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.p = _context6.n) {
          case 0:
            users = _toConsumableArray(((_config$system4 = config.system) === null || _config$system4 === void 0 ? void 0 : _config$system4.users) || []);
            target = users[idx];
            if (target) {
              _context6.n = 1;
              break;
            }
            return _context6.a(2);
          case 1:
            isNatalio = target.name && target.name.toLowerCase() === 'natalio' || target.email && target.email.toLowerCase().includes('comunicaciones@hotelguadiana.es');
            if (!isNatalio) {
              _context6.n = 2;
              break;
            }
            alert("No es posible eliminar la cuenta principal del Administrador (Natalio).");
            return _context6.a(2);
          case 2:
            ok = window.confirm("\xBFEst\xE1s seguro de que deseas ELIMINAR permanentemente a \"".concat(target.name, "\" (").concat(target.email, ")? Esta acci\xF3n no se puede deshacer."));
            if (ok) {
              _context6.n = 3;
              break;
            }
            return _context6.a(2);
          case 3:
            users.splice(idx, 1);
            updatedConfig = _objectSpread(_objectSpread({}, config), {}, {
              system: _objectSpread(_objectSpread({}, config.system || {}), {}, {
                users: users
              })
            });
            setConfig(updatedConfig);
            setLoading(true);
            _context6.p = 4;
            _context6.n = 5;
            return db.collection("settings").doc("main").set(updatedConfig);
          case 5:
            setMessage({
              type: 'success',
              text: "Usuario \"".concat(target.name, "\" eliminado de la plataforma.")
            });
            _context6.n = 7;
            break;
          case 6:
            _context6.p = 6;
            _t6 = _context6.v;
            setMessage({
              type: 'error',
              text: 'Error al eliminar el usuario en Firestore.'
            });
          case 7:
            setLoading(false);
            setTimeout(function () {
              return setMessage(null);
            }, 3500);
          case 8:
            return _context6.a(2);
        }
      }, _callee6, null, [[4, 6]]);
    }));
    return function handleDeleteUser(_x7) {
      return _ref6.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "flex min-h-screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 p-6 flex flex-col z-30 shadow-xl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center mb-10 px-2 space-y-6"
  }, /*#__PURE__*/React.createElement("img", {
    src: "Nexus Groups/Nexus_Groups-removebg-preview.png",
    className: "h-16 w-auto object-contain",
    alt: "Logo"
  }), /*#__PURE__*/React.createElement("div", {
    className: "h-[1px] w-full bg-slate-100"
  })), /*#__PURE__*/React.createElement("nav", {
    className: "flex-1 space-y-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.location.href = 'Admin.html';
    },
    className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "layout-dashboard",
    className: "w-5 h-5"
  }), "Volver al Panel"), /*#__PURE__*/React.createElement("div", {
    className: "pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4"
  }, "Entidades"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveHotel('guadiana');
    },
    className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ".concat(activeHotel === 'guadiana' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50')
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "hotel",
    className: "w-5 h-5"
  }), "Sercotel Guadiana"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveHotel('cumbria');
    },
    className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ".concat(activeHotel === 'cumbria' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50')
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "palmtree",
    className: "w-5 h-5"
  }), "Cumbria Spa&Hotel"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveHotel('system');
    },
    className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ".concat(activeHotel === 'system' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50')
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "cpu",
    className: "w-5 h-5"
  }), "Sistema e IA"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveHotel('users');
    },
    className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ".concat(activeHotel === 'users' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50')
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "shield-check",
    className: "w-5 h-5"
  }), "Usuarios y Accesos"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveHotel('commercials');
    },
    className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ".concat(activeHotel === 'commercials' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50')
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "users",
    className: "w-5 h-5"
  }), "Agentes Comerciales"), /*#__PURE__*/React.createElement("div", {
    className: "pt-4 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4"
  }, "Global"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveHotel('services');
    },
    className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ".concat(activeHotel === 'services' ? 'sidebar-item-active' : 'text-slate-500 hover:bg-slate-50')
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "box",
    className: "w-5 h-5"
  }), "Cat\xE1logo de Servicios"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.open('https://nataliogc.github.io/menus-eventos/admin.html', '_blank');
    },
    className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "utensils",
    className: "w-5 h-5"
  }), "Men\xFAs Eventos"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.open('https://nataliogc.github.io/Menus-Turisticos/', '_blank');
    },
    className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "map",
    className: "w-5 h-5"
  }), "Men\xFAs Tur\xEDsticos"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.open('https://nataliogc.github.io/menus-cocteles/', '_blank');
    },
    className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "martini",
    className: "w-5 h-5"
  }), "Men\xFAs C\xF3cteles")), /*#__PURE__*/React.createElement("button", {
    onClick: saveConfig,
    disabled: loading,
    className: "mt-auto w-full bg-[#2d5a43] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-[#1e3a2c] transition-all flex items-center justify-center gap-2 "
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "save",
    className: "w-4 h-4"
  }), loading ? 'Guardando...' : 'Guardar Todo')), /*#__PURE__*/React.createElement("main", {
    className: "ml-64 p-12 w-full max-w-5xl"
  }, /*#__PURE__*/React.createElement("header", {
    className: "mb-12 flex justify-between items-end"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "text-4xl font-bold text-slate-900 tracking-tight"
  }, "Centro de ", /*#__PURE__*/React.createElement("span", {
    className: "text-[#2d5a43]"
  }, "Configuraci\xF3n")), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 mt-2"
  }, "Mantenimiento de bases de datos maestras y par\xE1metros globales.")), message && /*#__PURE__*/React.createElement("div", {
    className: "px-6 py-3 rounded-2xl border text-xs font-bold animate-fade-in ".concat(message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600')
  }, message.text)), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 p-8 border-b border-slate-100 flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 bg-white rounded-2xl shadow-sm"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: activeHotel === 'users' ? 'shield-check' : activeHotel === 'system' ? 'settings-2' : activeHotel === 'commercials' ? 'users' : activeHotel === 'services' ? 'box' : 'building-2',
    className: "w-6 h-6 text-[#2d5a43]"
  })), activeHotel === 'users' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-slate-900 uppercase"
  }, "Gesti\xF3n de Usuarios y Accesos"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, "Control centralizado de cuentas autorizadas, contrase\xF1as y permisos de acceso.")) : activeHotel === 'commercials' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-slate-900 uppercase"
  }, "Base de Datos de Personal"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, "Gestiona los agentes comerciales autorizados en el sistema.")) : activeHotel === 'services' ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-slate-900 uppercase"
  }, "Cat\xE1logo de Servicios"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, "Inventario global de habitaciones, complementos y servicios extra.")) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-slate-900 uppercase"
  }, activeHotel === 'system' ? 'Parámetros del Sistema' : "Configuraci\xF3n ".concat(activeHotel.charAt(0).toUpperCase() + activeHotel.slice(1))), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400"
  }, "Edita los valores que aparecer\xE1n en las facturas y documentos oficiales."))), /*#__PURE__*/React.createElement("div", {
    className: "p-10"
  }, activeHotel === 'users' ? /*#__PURE__*/React.createElement("div", {
    className: "space-y-6 animate-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-gradient-to-r from-slate-900 via-slate-800 to-[#1e3a2c] rounded-3xl p-7 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
  }, "Seguridad Cloud"), /*#__PURE__*/React.createElement("span", {
    className: "text-slate-300 text-xs font-semibold"
  }, "\u2022 Panel de Administraci\xF3n")), /*#__PURE__*/React.createElement("h4", {
    className: "text-xl font-bold text-white tracking-tight"
  }, "Directorio de Usuarios y Credenciales"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-300 max-w-xl leading-relaxed"
  }, "Gestiona las altas de nuevos colaboradores, restablece contrase\xF1as al instante o revoca temporalmente el acceso sin perder el historial."), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4 pt-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2 h-2 rounded-full bg-emerald-400"
  }), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, (((_config$system5 = config.system) === null || _config$system5 === void 0 ? void 0 : _config$system5.users) || []).filter(function (u) {
    return u.active !== false && !u.revoked;
  }).length, " Activos")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-2 h-2 rounded-full bg-rose-400"
  }), /*#__PURE__*/React.createElement("span", {
    className: "font-bold"
  }, (((_config$system6 = config.system) === null || _config$system6 === void 0 ? void 0 : _config$system6.users) || []).filter(function (u) {
    return u.revoked === true || u.active === false;
  }).length, " Revocados")))), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setShowAddUserModal(true);
    },
    className: "bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-lg hover:shadow-emerald-900/30 transition-all flex items-center gap-2 cursor-pointer shrink-0"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "user-plus",
    className: "w-4 h-4"
  }), "Nuevo Usuario"))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative flex-1 max-w-md"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: userSearch,
    onChange: function onChange(e) {
      return setUserSearch(e.target.value);
    },
    placeholder: "Buscar por nombre, correo o rol...",
    className: "w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-[#2d5a43] transition-all shadow-xs"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute left-3.5 top-3 text-slate-400 pointer-events-none"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "search",
    className: "w-3.5 h-3.5"
  })), userSearch && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setUserSearch('');
    },
    className: "absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "x",
    className: "w-3.5 h-3.5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] font-bold text-slate-400 text-right"
  }, (((_config$system7 = config.system) === null || _config$system7 === void 0 ? void 0 : _config$system7.users) || []).length, " usuarios configurados en el sistema")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs divide-y divide-slate-100"
  }, function (_config$system8) {
    var rawUsers = ((_config$system8 = config.system) === null || _config$system8 === void 0 ? void 0 : _config$system8.users) || [];
    var searchLow = (userSearch || '').toLowerCase().trim();
    var filtered = searchLow ? rawUsers.filter(function (u) {
      return u.name && u.name.toLowerCase().includes(searchLow) || u.email && u.email.toLowerCase().includes(searchLow) || u.role && u.role.toLowerCase().includes(searchLow);
    }) : rawUsers;
    if (filtered.length === 0) {
      return /*#__PURE__*/React.createElement("div", {
        className: "p-12 text-center text-slate-400 space-y-2"
      }, /*#__PURE__*/React.createElement(LucideIcon, {
        name: "users",
        className: "w-8 h-8 mx-auto text-slate-300"
      }), /*#__PURE__*/React.createElement("p", {
        className: "text-xs font-bold"
      }, "No se encontraron usuarios coincidentes."));
    }
    return filtered.map(function (u, fIdx) {
      var originalIdx = rawUsers.indexOf(u);
      var isRevoked = u.revoked === true || u.active === false;
      var isNatalio = u.name && u.name.toLowerCase() === 'natalio' || u.email && u.email.toLowerCase().includes('comunicaciones@hotelguadiana.es');
      var roleBadgeClass = u.role === 'Administrador' ? 'bg-purple-50 text-purple-700 border-purple-200' : u.role === 'Dirección' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : u.role === 'Recepción' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      var avatarBg = u.role === 'Administrador' ? 'from-purple-700 to-indigo-600' : u.role === 'Dirección' ? 'from-indigo-700 to-teal-600' : 'from-[#2d5a43] to-emerald-500';
      return /*#__PURE__*/React.createElement("div", {
        key: fIdx,
        className: "p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ".concat(isRevoked ? 'bg-rose-50/20' : 'hover:bg-slate-50/60')
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-3.5 min-w-0"
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-11 h-11 rounded-2xl bg-gradient-to-tr ".concat(avatarBg, " text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 select-none")
      }, (u.name || 'U').charAt(0).toUpperCase()), /*#__PURE__*/React.createElement("div", {
        className: "min-w-0"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 flex-wrap mb-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-sm font-bold ".concat(isRevoked ? 'line-through text-slate-500' : 'text-slate-800')
      }, u.name), /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ".concat(roleBadgeClass)
      }, u.role || 'Comercial'), isRevoked ? /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-wider flex items-center gap-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "w-1.5 h-1.5 rounded-full bg-rose-500"
      }), "Acceso Revocado") : /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider flex items-center gap-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "w-1.5 h-1.5 rounded-full bg-emerald-500"
      }), "Activo")), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-3 text-xs text-slate-400"
      }, /*#__PURE__*/React.createElement("span", {
        className: "truncate"
      }, u.email), /*#__PURE__*/React.createElement("span", {
        className: "text-slate-300"
      }, "\u2022"), /*#__PURE__*/React.createElement("span", {
        className: "font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60"
      }, "Clave actual: ", /*#__PURE__*/React.createElement("span", {
        className: "font-bold text-slate-800"
      }, u.pass || '1234'))))), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 shrink-0 self-end md:self-center"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: function onClick() {
          return setResetPassUser({
            idx: originalIdx,
            user: u,
            newPass: ''
          });
        },
        className: "px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-amber-50 hover:text-amber-700 border border-slate-200 hover:border-amber-200 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer",
        title: "Resetear contrase\xF1a de ".concat(u.name)
      }, /*#__PURE__*/React.createElement(LucideIcon, {
        name: "key",
        className: "w-3.5 h-3.5 text-amber-500"
      }), /*#__PURE__*/React.createElement("span", null, "Resetear Clave")), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: function onClick() {
          return handleToggleRevokeUser(originalIdx);
        },
        disabled: isNatalio,
        className: "px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ".concat(isNatalio ? 'opacity-30 cursor-not-allowed border-slate-200 text-slate-400' : isRevoked ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white hover:bg-rose-50 text-rose-600 border-slate-200 hover:border-rose-200'),
        title: isNatalio ? 'La cuenta del Administrador principal no puede ser revocada' : isRevoked ? 'Reactivar acceso' : 'Revocar acceso'
      }, /*#__PURE__*/React.createElement(LucideIcon, {
        name: isRevoked ? 'user-check' : 'user-x',
        className: "w-3.5 h-3.5"
      }), /*#__PURE__*/React.createElement("span", null, isRevoked ? 'Reactivar Acceso' : 'Revocar Acceso')), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: function onClick() {
          return handleDeleteUser(originalIdx);
        },
        disabled: isNatalio,
        className: "p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all cursor-pointer ".concat(isNatalio ? 'opacity-20 cursor-not-allowed' : ''),
        title: isNatalio ? 'No se puede eliminar al Administrador' : "Eliminar a ".concat(u.name)
      }, /*#__PURE__*/React.createElement(LucideIcon, {
        name: "trash-2",
        className: "w-4 h-4"
      }))));
    });
  }())) : activeHotel === 'services' ? /*#__PURE__*/React.createElement("div", {
    className: "max-w-3xl space-y-8 animate-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-slate-200 rounded-3xl shadow-sm p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-slate-800 tracking-tight"
  }, "Inventario de Desplegables"), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest"
  }, "A\xF1ade o edita servicios")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var _config$common;
      return handleChange('common', 'services', [].concat(_toConsumableArray(((_config$common = config.common) === null || _config$common === void 0 ? void 0 : _config$common.services) || []), [{
        label: "Nuevo Servicio",
        pax: 1,
        isService: true
      }]));
    },
    className: "bg-[#2d5a43] text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-[#1e3a2c] transition-all flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "plus",
    className: "w-4 h-4"
  }), "A\xF1adir Servicio")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, (((_config$common2 = config.common) === null || _config$common2 === void 0 ? void 0 : _config$common2.services) || []).map(function (srv, idx) {
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "flex flex-wrap md:flex-nowrap gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-100"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex-1 min-w-[200px]"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1"
    }, "Nombre"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: srv.label,
      onChange: function onChange(e) {
        var arr = _toConsumableArray(config.common.services);
        arr[idx].label = e.target.value;
        handleChange('common', 'services', arr);
      },
      className: "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#2d5a43] outline-none"
    })), /*#__PURE__*/React.createElement("div", {
      className: "w-24"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1"
    }, "Pax / Uds"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      value: srv.pax,
      onChange: function onChange(e) {
        var arr = _toConsumableArray(config.common.services);
        arr[idx].pax = Number(e.target.value) || 0;
        handleChange('common', 'services', arr);
      },
      className: "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-center focus:border-[#2d5a43] outline-none"
    })), /*#__PURE__*/React.createElement("div", {
      className: "w-32"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-1"
    }, "Tipo"), /*#__PURE__*/React.createElement("select", {
      value: srv.isService ? 'true' : 'false',
      onChange: function onChange(e) {
        var arr = _toConsumableArray(config.common.services);
        arr[idx].isService = e.target.value === 'true';
        handleChange('common', 'services', arr);
      },
      className: "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#2d5a43] outline-none"
    }, /*#__PURE__*/React.createElement("option", {
      value: "false"
    }, "Habitaci\xF3n"), /*#__PURE__*/React.createElement("option", {
      value: "true"
    }, "Servicio Extra"))), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var arr = config.common.services.filter(function (_, i) {
          return i !== idx;
        });
        handleChange('common', 'services', arr);
      },
      className: "mt-5 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all",
      title: "Eliminar"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "trash-2",
      className: "w-5 h-5"
    })));
  }), (!((_config$common3 = config.common) !== null && _config$common3 !== void 0 && _config$common3.services) || config.common.services.length === 0) && /*#__PURE__*/React.createElement("div", {
    className: "text-center py-8 text-slate-400 font-bold text-sm"
  }, "No hay servicios registrados."))), [{
    key: 'clauses',
    title: 'Cláusulas Globales (Presupuesto)',
    subtitle: 'Aplican a todos los hoteles salvo que el hotel tenga las suyas propias.'
  }, {
    key: 'confirmationClauses',
    title: 'Cláusulas Globales (Confirmación)',
    subtitle: 'Aplican a todos los hoteles en la carta de confirmación.'
  }].map(function (_ref7) {
    var _config$common5, _config$common6;
    var key = _ref7.key,
      title = _ref7.title,
      subtitle = _ref7.subtitle;
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      className: "bg-white border border-slate-200 rounded-3xl shadow-sm p-8 space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
      className: "font-bold text-slate-800 tracking-tight"
    }, title), /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest"
    }, subtitle)), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var _config$common4;
        return handleChange('common', key, [].concat(_toConsumableArray(((_config$common4 = config.common) === null || _config$common4 === void 0 ? void 0 : _config$common4[key]) || []), [{
          title: 'Nueva Cláusula',
          body: ''
        }]));
      },
      className: "bg-[#2d5a43] text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-[#1e3a2c] transition-all flex items-center gap-2"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "plus",
      className: "w-4 h-4"
    }), "A\xF1adir")), (((_config$common5 = config.common) === null || _config$common5 === void 0 ? void 0 : _config$common5[key]) || []).length > 0 && (((_config$common6 = config.common) === null || _config$common6 === void 0 ? void 0 : _config$common6[key]) || []).map(function (clause, idx) {
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "border border-slate-100 rounded-2xl p-5 space-y-4 relative group ".concat(key === 'clauses' ? 'bg-indigo-50/30' : 'bg-emerald-50/30')
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex gap-2 items-start"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex-1 space-y-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex gap-2"
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: clause.title,
        onChange: function onChange(e) {
          var arr = _toConsumableArray(config.common[key]);
          arr[idx] = _objectSpread(_objectSpread({}, arr[idx]), {}, {
            title: e.target.value
          });
          handleChange('common', key, arr);
        },
        className: "flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:border-[#2d5a43] outline-none shadow-sm",
        placeholder: "T\xEDtulo de la cl\xE1usula"
      }), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return handleTranslateClause(idx, key, 'common');
        },
        className: "px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-sm ".concat(key === 'clauses' ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'),
        title: "Traducir al Ingl\xE9s con IA"
      }, /*#__PURE__*/React.createElement(LucideIcon, {
        name: "languages",
        className: "w-4 h-4"
      }), "Traducir")), /*#__PURE__*/React.createElement("textarea", {
        value: clause.body,
        onChange: function onChange(e) {
          var arr = _toConsumableArray(config.common[key]);
          arr[idx] = _objectSpread(_objectSpread({}, arr[idx]), {}, {
            body: e.target.value
          });
          handleChange('common', key, arr);
        },
        className: "w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:border-[#2d5a43] outline-none min-h-[80px] resize-none shadow-sm",
        placeholder: "Cuerpo de la cl\xE1usula. Puedes usar {DEP_30} para el 30% del total."
      })), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          var arr = config.common[key].filter(function (_, i) {
            return i !== idx;
          });
          handleChange('common', key, arr);
        },
        className: "mt-1 w-9 h-9 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
      }, /*#__PURE__*/React.createElement(LucideIcon, {
        name: "trash-2",
        className: "w-4 h-4"
      }))));
    }));
  })) : activeHotel === 'commercials' ? /*#__PURE__*/React.createElement("div", {
    className: "max-w-xl space-y-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white border border-slate-200 rounded-3xl shadow-sm p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-slate-800 tracking-tight"
  }, "Agentes Comerciales"), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest"
  }, "Personal de Ventas")), /*#__PURE__*/React.createElement(LucideIcon, {
    name: "users",
    className: "text-[#2d5a43] opacity-20 w-8 h-8"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 mb-8 mt-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    id: "new-commercial-input",
    placeholder: "A\xF1adir nuevo comercial...",
    className: "flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#2d5a43] outline-none transition-all",
    onKeyDown: function onKeyDown(e) {
      if (e.key === 'Enter' && e.target.value.trim()) {
        var val = e.target.value.trim().toUpperCase();
        var currentList = config.system.commercials || [];
        var exists = currentList.some(function (comm) {
          return (_typeof(comm) === 'object' ? comm.name : comm) === val;
        });
        if (!exists) {
          handleChange('system', 'commercials', [].concat(_toConsumableArray(currentList), [{
            name: val,
            active: true
          }]));
          e.target.value = '';
        }
      }
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var input = document.getElementById('new-commercial-input');
      var val = input.value.trim().toUpperCase();
      var currentList = config.system.commercials || [];
      var exists = currentList.some(function (comm) {
        return (_typeof(comm) === 'object' ? comm.name : comm) === val;
      });
      if (val && !exists) {
        handleChange('system', 'commercials', [].concat(_toConsumableArray(currentList), [{
          name: val,
          active: true
        }]));
        input.value = '';
      }
    },
    className: "bg-[#2d5a43] text-white px-6 rounded-xl font-bold text-sm hover:bg-[#1e3a2c] transition-all"
  }, "A\xF1adir")), function () {
    var allCommercials = (config.system.commercials || []).map(function (comm, idx) {
      var isObject = _typeof(comm) === 'object' && comm !== null;
      return {
        comm: comm,
        originalIdx: idx,
        name: isObject ? comm.name : comm,
        isActive: isObject ? comm.active !== false : true,
        isObject: isObject
      };
    });
    var activeCommercials = allCommercials.filter(function (c) {
      return c.isActive;
    });
    var inactiveCommercials = allCommercials.filter(function (c) {
      return !c.isActive;
    });
    var renderComm = function renderComm(_ref8) {
      var comm = _ref8.comm,
        idx = _ref8.originalIdx,
        name = _ref8.name,
        isActive = _ref8.isActive,
        isObject = _ref8.isObject;
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "border p-3 rounded-xl flex items-center justify-between gap-4 transition-all group ".concat(isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-75')
      }, editingCommercialIdx === idx ? /*#__PURE__*/React.createElement("div", {
        className: "flex-1 flex gap-2 items-center"
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: editingCommercialName,
        onChange: function onChange(e) {
          return setEditingCommercialName(e.target.value.toUpperCase());
        },
        className: "flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:border-[#2d5a43] outline-none shadow-sm",
        autoFocus: true,
        onKeyDown: function onKeyDown(e) {
          if (e.key === 'Enter') {
            var val = editingCommercialName.trim();
            if (val) {
              var newList = _toConsumableArray(config.system.commercials);
              var currentObj = _typeof(newList[idx]) === 'object' ? newList[idx] : {
                name: newList[idx],
                active: true
              };
              newList[idx] = _objectSpread(_objectSpread({}, currentObj), {}, {
                name: val
              });
              handleChange('system', 'commercials', newList);
            }
            setEditingCommercialIdx(null);
          } else if (e.key === 'Escape') {
            setEditingCommercialIdx(null);
          }
        }
      }), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          var val = editingCommercialName.trim();
          if (val) {
            var newList = _toConsumableArray(config.system.commercials);
            var currentObj = _typeof(newList[idx]) === 'object' ? newList[idx] : {
              name: newList[idx],
              active: true
            };
            newList[idx] = _objectSpread(_objectSpread({}, currentObj), {}, {
              name: val
            });
            handleChange('system', 'commercials', newList);
          }
          setEditingCommercialIdx(null);
        },
        className: "bg-[#2d5a43] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#1e3a2c] flex items-center gap-1.5 whitespace-nowrap"
      }, /*#__PURE__*/React.createElement(LucideIcon, {
        name: "check",
        size: 14
      }), " Guardar"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return setEditingCommercialIdx(null);
        },
        className: "bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5 whitespace-nowrap"
      }, /*#__PURE__*/React.createElement(LucideIcon, {
        name: "x",
        size: 14
      }), " Cancelar")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-3 flex-1 min-w-0"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          var newList = _toConsumableArray(config.system.commercials);
          if (isObject) {
            newList[idx] = _objectSpread(_objectSpread({}, comm), {}, {
              active: !isActive
            });
          } else {
            newList[idx] = {
              name: comm,
              active: false
            };
          }
          handleChange('system', 'commercials', newList);
        },
        className: "relative w-12 h-6 rounded-full transition-colors flex items-center shrink-0 ".concat(isActive ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'),
        title: isActive ? "Marcar como Inactivo" : "Marcar como Activo"
      }, /*#__PURE__*/React.createElement("div", {
        className: "absolute left-0.5 w-5 h-5 bg-white rounded-full transition-transform transform shadow-sm ".concat(isActive ? 'translate-x.6' : 'translate-x-0'),
        style: {
          transform: isActive ? 'translateX(1.3rem)' : 'translateX(0)'
        }
      })), /*#__PURE__*/React.createElement("span", {
        className: "text-sm font-bold truncate ".concat(isActive ? 'text-slate-700' : 'text-slate-400 line-through')
      }, name), !isActive && /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase shrink-0"
      }, "Inactivo")), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-1 shrink-0"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          setEditingCommercialIdx(idx);
          setEditingCommercialName(name);
        },
        className: "text-slate-400 hover:text-[#2d5a43] transition-colors p-2 rounded-lg hover:bg-emerald-50",
        title: "Editar"
      }, /*#__PURE__*/React.createElement(LucideIcon, {
        name: "pencil",
        size: 16
      })), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          if (window.confirm("\xBFEst\xE1s seguro de eliminar a ".concat(name, "?"))) {
            var newList = config.system.commercials.filter(function (_, i) {
              return i !== idx;
            });
            handleChange('system', 'commercials', newList);
          }
        },
        className: "text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50",
        title: "Eliminar"
      }, /*#__PURE__*/React.createElement(LucideIcon, {
        name: "trash-2",
        size: 16
      })))));
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 mb-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-2 h-2 rounded-full bg-emerald-500"
    }), /*#__PURE__*/React.createElement("h5", {
      className: "text-[10px] font-bold text-slate-500 uppercase tracking-widest"
    }, "Activos")), activeCommercials.length > 0 ? activeCommercials.map(renderComm) : /*#__PURE__*/React.createElement("div", {
      className: "text-center p-6 border-2 border-dashed border-slate-100 rounded-xl text-xs text-slate-400 italic"
    }, "No hay comerciales activos")), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 mb-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-2 h-2 rounded-full bg-slate-300"
    }), /*#__PURE__*/React.createElement("h5", {
      className: "text-[10px] font-bold text-slate-500 uppercase tracking-widest"
    }, "Inactivos")), inactiveCommercials.length > 0 ? inactiveCommercials.map(renderComm) : /*#__PURE__*/React.createElement("div", {
      className: "text-center p-6 border-2 border-dashed border-slate-100 rounded-xl text-xs text-slate-400 italic"
    }, "No hay comerciales inactivos")));
  }())) : activeHotel === 'system' ? /*#__PURE__*/React.createElement("div", {
    className: "max-w-xl space-y-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#2d5a43] p-8 rounded-3xl text-white shadow-lg relative overflow-hidden"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "cpu",
    className: "absolute right-[-10px] bottom-[-10px] w-32 h-32 opacity-10"
  }), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-lg mb-2 flex items-center gap-2"
  }, "Motor IA Estrat\xE9gica", /*#__PURE__*/React.createElement("span", {
    className: "bg-emerald-400 text-[#2d5a43] px-2 py-0.5 rounded text-[8px] uppercase tracking-widest"
  }, "Activo")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-emerald-50 opacity-70 mb-6"
  }, "Configuraci\xF3n del conector para an\xE1lisis de riesgos y proyecciones."), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1"
  }, "Modelo Seleccionado"), /*#__PURE__*/React.createElement("select", {
    value: config.system.geminiModel,
    onChange: function onChange(e) {
      return handleChange('system', 'geminiModel', e.target.value);
    },
    className: "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-bold outline-none focus:bg-white/20 transition-all"
  }, /*#__PURE__*/React.createElement("option", {
    className: "text-slate-800",
    value: "gemini-2.0-flash"
  }, "Gemini 2.0 Flash (M\xE1s r\xE1pido)"), /*#__PURE__*/React.createElement("option", {
    className: "text-slate-800",
    value: "gemini-1.5-pro"
  }, "Gemini 1.5 Pro (Alta Precisi\xF3n)"), /*#__PURE__*/React.createElement("option", {
    className: "text-slate-800",
    value: "gemini-1.5-flash"
  }, "Gemini 1.5 Flash (Est\xE1ndar)"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-emerald-200 uppercase tracking-widest mb-1"
  }, "Gemini API Key (Privada)"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: config.system.geminiApiKey || "",
    onChange: function onChange(e) {
      return handleChange('system', 'geminiApiKey', e.target.value);
    },
    placeholder: "Paste your API key here...",
    className: "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none focus:bg-white/20 transition-all"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-[9px] text-emerald-200/50 mt-1 italic"
  }, "La clave se guarda encriptada en tu instancia privada de Firestore."))))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-6 bg-white border border-slate-200 rounded-3xl shadow-sm"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
  }, "PIN de Acceso"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    value: config.system.pin,
    onChange: function onChange(e) {
      return handleChange('system', 'pin', e.target.value);
    },
    maxLength: "4",
    className: "w-full text-2xl font-bold tracking-[0.5em] text-center border-b border-slate-100 py-2 outline-none focus:border-[#2d5a43] transition-all"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-[9px] text-slate-400 mt-2 italic text-center text-wrap"
  }, "Este PIN se usar\xE1 en la pantalla de login unificada.")), /*#__PURE__*/React.createElement("div", {
    className: "p-6 bg-slate-900 rounded-3xl text-white flex flex-col justify-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1"
  }, "Backup Cloud"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs opacity-70 leading-relaxed"
  }, "Los cambios se guardan autom\xE1ticamente en tu servidor Firestore de nivel industrial."))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "font-bold text-slate-800 text-sm flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "users",
    size: 16,
    className: "text-[#2d5a43]"
  }), "Usuarios Autorizados NexusGroups"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-400"
  }, "Cuentas con acceso a la plataforma.")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setActiveHotel('users');
    },
    className: "text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "shield-check",
    size: 13
  }), "Administrar Accesos")), /*#__PURE__*/React.createElement("div", {
    className: "divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden"
  }, (config.system.users || []).map(function (u, uIdx) {
    return /*#__PURE__*/React.createElement("div", {
      key: uIdx,
      className: "p-3.5 bg-white hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-8 h-8 rounded-xl bg-gradient-to-tr from-[#2d5a43] to-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0"
    }, (u.name || 'U').charAt(0).toUpperCase()), /*#__PURE__*/React.createElement("div", {
      className: "min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 flex-wrap"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-bold text-slate-800"
    }, u.name), /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
    }, u.role)), /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] text-slate-400 block truncate"
    }, u.email))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 shrink-0"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest"
    }, "Clave:"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: u.pass || "1234",
      onChange: function onChange(e) {
        var nextUsers = _toConsumableArray(config.system.users || []);
        nextUsers[uIdx] = _objectSpread(_objectSpread({}, u), {}, {
          pass: e.target.value
        });
        handleChange('system', 'users', nextUsers);
      },
      className: "w-20 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 text-center focus:border-[#2d5a43] outline-none"
    })));
  })))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "Raz\xF3n Social"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: config[activeHotel].company,
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'company', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "NIF / CIF"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: config[activeHotel].nif,
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'nif', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "Inscripci\xF3n Registro Mercantil"), /*#__PURE__*/React.createElement("textarea", {
    rows: "2",
    value: config[activeHotel].legal,
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'legal', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all resize-none"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "Entidad Bancaria"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: config[activeHotel].bank || "",
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'bank', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all",
    placeholder: "Nombre del Banco"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "IBAN de Cobro"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: config[activeHotel].iban,
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'iban', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-emerald-700 font-bold focus:border-[#2d5a43] outline-none transition-all tracking-tighter text-sm"
  })), /*#__PURE__*/React.createElement("div", {
    className: "col-span-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "Enlace Pasarela TPV (Banco)"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: config[activeHotel].paymentGateway || "",
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'paymentGateway', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all text-xs",
    placeholder: "https://..."
  })))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "Direcci\xF3n F\xEDsica"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: config[activeHotel].address,
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'address', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "col-span-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "IRUS"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: config[activeHotel].irus || "",
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'irus', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all"
  })), /*#__PURE__*/React.createElement("div", {
    className: "col-span-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "C.P."), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: config[activeHotel].cp,
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'cp', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all"
  })), /*#__PURE__*/React.createElement("div", {
    className: "col-span-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "Ciudad"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: config[activeHotel].city,
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'city', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: config[activeHotel].email,
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'email', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "Tel\xE9fono"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: config[activeHotel].tel,
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'tel', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1"
  }, "Web Oficial"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: config[activeHotel].web || "",
    onChange: function onChange(e) {
      return handleChange(activeHotel, 'web', e.target.value);
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-semibold focus:border-[#2d5a43] outline-none transition-all"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "mt-12 pt-10 border-t border-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-2 bg-slate-100 rounded-lg"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "file-text",
    className: "w-5 h-5 text-slate-600"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-lg font-bold text-slate-800 tracking-tight"
  }, "Cl\xE1usulas y Condiciones"), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest"
  }, "Textos legales para el final del presupuesto"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mb-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "info",
    className: "w-4 h-4 text-indigo-500 mt-0.5 shrink-0"
  }), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-indigo-700 leading-relaxed"
  }, /*#__PURE__*/React.createElement("strong", null, "Variables disponibles:"), " Puedes usar ", /*#__PURE__*/React.createElement("code", null, '{DEP_30}'), " en el texto; el sistema lo reemplazar\xE1 autom\xE1ticamente por el 30% del presupuesto para indicarlo en la cl\xE1usula. Puedes a\xF1adir tantas cl\xE1usulas como consideres necesarias.")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, (config[activeHotel].clauses || []).map(function (clause, idx) {
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative group hover:border-indigo-200 transition-all"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var newClauses = _toConsumableArray(config[activeHotel].clauses);
        newClauses.splice(idx, 1);
        handleChange(activeHotel, 'clauses', newClauses);
      },
      className: "absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors bg-white p-2 rounded-xl opacity-0 group-hover:opacity-100 shadow-sm border border-slate-100",
      title: "Eliminar cl\xE1usula"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "trash-2",
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-4 mb-4 pr-12"
    }, /*#__PURE__*/React.createElement("span", {
      className: "w-8 h-8 shrink-0 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center font-black text-indigo-600 text-xs"
    }, idx + 1), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 flex gap-3"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: clause.title,
      placeholder: "T\xEDtulo de la cl\xE1usula (ej. Cupo y Disponibilidad)",
      onChange: function onChange(e) {
        var newClauses = _toConsumableArray(config[activeHotel].clauses);
        newClauses[idx].title = e.target.value;
        handleChange(activeHotel, 'clauses', newClauses);
      },
      className: "flex-1 bg-transparent border-b border-slate-200 py-1 text-sm font-black text-slate-800 outline-none focus:border-indigo-500 transition-colors"
    }), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleTranslateClause(idx, 'clauses', activeHotel);
      },
      className: "bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "languages",
      className: "w-3.5 h-3.5"
    }), "TRADUCIR"))), /*#__PURE__*/React.createElement("textarea", {
      rows: "3",
      value: clause.body,
      placeholder: "Contenido descriptivo de la cl\xE1usula...",
      onChange: function onChange(e) {
        var newClauses = _toConsumableArray(config[activeHotel].clauses);
        newClauses[idx].body = e.target.value;
        handleChange(activeHotel, 'clauses', newClauses);
      },
      className: "w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-600 text-sm outline-none focus:border-indigo-400 transition-all resize-none ml-12 w-[calc(100%-3rem)] font-medium"
    }));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var current = config[activeHotel].clauses || [];
      handleChange(activeHotel, 'clauses', [].concat(_toConsumableArray(current), [{
        title: "Nueva Cláusula",
        body: ""
      }]));
    },
    className: "w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-[#2d5a43] hover:text-[#2d5a43] hover:bg-emerald-50/50 transition-all text-sm"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "plus",
    className: "w-4 h-4"
  }), "A\xF1adir Nueva Cl\xE1usula"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return handleChange(activeHotel, "clauses", BUDGET_MODEL_TEMPLATES);
    },
    className: "w-full flex items-center justify-center gap-2 py-3 mt-2 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all text-[10px] uppercase tracking-widest"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "refresh-cw",
    className: "w-3 h-3"
  }), " Cargar Modelo Est\xE1ndar (Presupuesto)")))), /*#__PURE__*/React.createElement("div", {
    className: "mt-8 pt-8 border-t border-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-2 bg-emerald-50 rounded-lg"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "check-square",
    className: "w-5 h-5 text-emerald-600"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-lg font-bold text-slate-800 tracking-tight"
  }, "Cl\xE1usulas de Confirmaci\xF3n"), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest"
  }, "Textos legales para la carta de confirmaci\xF3n"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 border border-emerald-100 rounded-[2rem] p-6 md:p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, (config[activeHotel].confirmationClauses || []).map(function (clause, idx) {
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      className: "bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative group hover:border-emerald-200 transition-all"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var nc = _toConsumableArray(config[activeHotel].confirmationClauses || []);
        nc.splice(idx, 1);
        handleChange(activeHotel, 'confirmationClauses', nc);
      },
      className: "absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors bg-white p-2 rounded-xl opacity-0 group-hover:opacity-100 shadow-sm border border-slate-100",
      title: "Eliminar cl\xE1usula"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "trash-2",
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-4 mb-4 pr-12"
    }, /*#__PURE__*/React.createElement("span", {
      className: "w-8 h-8 shrink-0 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center font-black text-emerald-700 text-xs"
    }, idx + 1), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 flex gap-3"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: clause.title,
      placeholder: "T\xEDtulo (ej. Firma y Aceptaci\xF3n)",
      onChange: function onChange(e) {
        var nc = _toConsumableArray(config[activeHotel].confirmationClauses || []);
        nc[idx].title = e.target.value;
        handleChange(activeHotel, 'confirmationClauses', nc);
      },
      className: "flex-1 bg-transparent border-b border-slate-200 py-1 text-sm font-black text-slate-800 outline-none focus:border-emerald-500 transition-colors"
    }), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleTranslateClause(idx, 'confirmationClauses', activeHotel);
      },
      className: "bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "languages",
      className: "w-3.5 h-3.5"
    }), "TRADUCIR"))), /*#__PURE__*/React.createElement("textarea", {
      rows: "3",
      value: clause.body,
      placeholder: "Contenido de la cl\xE1usula...",
      onChange: function onChange(e) {
        var nc = _toConsumableArray(config[activeHotel].confirmationClauses || []);
        nc[idx].body = e.target.value;
        handleChange(activeHotel, 'confirmationClauses', nc);
      },
      className: "w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-600 text-sm outline-none focus:border-emerald-400 transition-all resize-none ml-12 w-[calc(100%-3rem)] font-medium"
    }));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var current = config[activeHotel].confirmationClauses || [];
      handleChange(activeHotel, 'confirmationClauses', [].concat(_toConsumableArray(current), [{
        title: "Nueva Cláusula Conf.",
        body: ""
      }]));
    },
    className: "w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-500 font-bold hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-sm"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "plus",
    className: "w-4 h-4"
  }), "A\xF1adir Cl\xE1usula de Confirmaci\xF3n"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return handleChange(activeHotel, "confirmationClauses", CONF_MODEL_TEMPLATES);
    },
    className: "w-full flex items-center justify-center gap-2 py-3 mt-2 bg-emerald-50 text-emerald-600 rounded-2xl font-bold hover:bg-emerald-600 hover:text-white transition-all text-[10px] uppercase tracking-widest"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "refresh-cw",
    className: "w-3 h-3"
  }), " Cargar Modelo Est\xE1ndar (Confirmaci\xF3n)"))))))), /*#__PURE__*/React.createElement("footer", {
    className: "mt-12 pt-8 border-t border-slate-200 flex justify-between items-center opacity-40"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-bold uppercase tracking-widest"
  }, "Nexus Groups Deployment v1.2"), /*#__PURE__*/React.createElement("img", {
    src: "Nexus Groups/Nexus_Groups_ICO-removebg-preview.png",
    className: "h-8 w-8 grayscale"
  }))), showAddUserModal && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "user-plus",
    className: "w-5 h-5"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-white tracking-tight"
  }, "Alta de Nuevo Usuario"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-300"
  }, "Crea una cuenta de acceso para Nexus Groups"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setShowAddUserModal(false);
    },
    className: "text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "x",
    className: "w-5 h-5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-6 space-y-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
  }, "Nombre Completo"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: newUserData.name,
    onChange: function onChange(e) {
      return setNewUserData(_objectSpread(_objectSpread({}, newUserData), {}, {
        name: e.target.value
      }));
    },
    placeholder: "Ej: Marta G\xF3mez",
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
  }, "Correo Electr\xF3nico"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: newUserData.email,
    onChange: function onChange(e) {
      return setNewUserData(_objectSpread(_objectSpread({}, newUserData), {}, {
        email: e.target.value
      }));
    },
    placeholder: "Ej: mgomez@hotelguadiana.es",
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
  }, "Rol / Permisos"), /*#__PURE__*/React.createElement("select", {
    value: newUserData.role,
    onChange: function onChange(e) {
      return setNewUserData(_objectSpread(_objectSpread({}, newUserData), {}, {
        role: e.target.value
      }));
    },
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all"
  }, /*#__PURE__*/React.createElement("option", {
    value: "Comercial"
  }, "Comercial"), /*#__PURE__*/React.createElement("option", {
    value: "Direcci\xF3n"
  }, "Direcci\xF3n"), /*#__PURE__*/React.createElement("option", {
    value: "Administrador"
  }, "Administrador"), /*#__PURE__*/React.createElement("option", {
    value: "Recepci\xF3n"
  }, "Recepci\xF3n"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
  }, "Contrase\xF1a Inicial"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: newUserData.pass,
    onChange: function onChange(e) {
      return setNewUserData(_objectSpread(_objectSpread({}, newUserData), {}, {
        pass: e.target.value
      }));
    },
    placeholder: "M\xEDn. 4 caracteres",
    className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all text-center"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "pt-3 flex items-center justify-end gap-2.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setShowAddUserModal(false);
    },
    className: "px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleCreateUser,
    className: "bg-[#2d5a43] hover:bg-[#1e3a2c] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "check",
    className: "w-3.5 h-3.5"
  }), "Crear y Activar Usuario"))))), resetPassUser && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-gradient-to-r from-amber-600 to-amber-700 p-6 text-white flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "key",
    className: "w-5 h-5"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold text-base text-white tracking-tight"
  }, "Restablecer Contrase\xF1a"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-amber-100"
  }, "Asigna una nueva clave para el usuario"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setResetPassUser(null);
    },
    className: "text-white/80 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "x",
    className: "w-5 h-5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-6 space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 rounded-xl bg-[#2d5a43] text-white font-black text-xs flex items-center justify-center"
  }, (((_resetPassUser$user = resetPassUser.user) === null || _resetPassUser$user === void 0 ? void 0 : _resetPassUser$user.name) || 'U').charAt(0).toUpperCase()), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold text-slate-800 block"
  }, (_resetPassUser$user2 = resetPassUser.user) === null || _resetPassUser$user2 === void 0 ? void 0 : _resetPassUser$user2.name), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 block"
  }, (_resetPassUser$user3 = resetPassUser.user) === null || _resetPassUser$user3 === void 0 ? void 0 : _resetPassUser$user3.email))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
  }, "Nueva Contrase\xF1a"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: resetPassUser.newPass,
    onChange: function onChange(e) {
      return setResetPassUser(_objectSpread(_objectSpread({}, resetPassUser), {}, {
        newPass: e.target.value
      }));
    },
    placeholder: "Introduce la nueva clave (m\xEDn. 4 caracteres)",
    className: "flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#2d5a43] focus:bg-white transition-all font-mono"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setResetPassUser(_objectSpread(_objectSpread({}, resetPassUser), {}, {
        newPass: "1234"
      }));
    },
    className: "px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap",
    title: "Usar clave por defecto"
  }, "1234"))), /*#__PURE__*/React.createElement("div", {
    className: "pt-2 flex items-center justify-end gap-2.5"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setResetPassUser(null);
    },
    className: "px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return handleResetUserPass(resetPassUser.idx, resetPassUser.newPass);
    },
    className: "bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "check",
    className: "w-3.5 h-3.5"
  }), "Guardar Nueva Clave"))))));
};
var root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));