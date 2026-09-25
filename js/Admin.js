"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useMemo = _React.useMemo,
  useRef = _React.useRef;
var _Recharts = Recharts,
  ResponsiveContainer = _Recharts.ResponsiveContainer,
  AreaChart = _Recharts.AreaChart,
  Area = _Recharts.Area,
  XAxis = _Recharts.XAxis,
  YAxis = _Recharts.YAxis,
  CartesianGrid = _Recharts.CartesianGrid,
  Tooltip = _Recharts.Tooltip,
  PieChart = _Recharts.PieChart,
  Pie = _Recharts.Pie,
  Cell = _Recharts.Cell,
  Legend = _Recharts.Legend,
  BarChart = _Recharts.BarChart,
  Bar = _Recharts.Bar;

// LucideIcon cargado desde js/icons.js (window.LucideIcon)

// --- FIREBASE ---
// Inicialización cargada desde js/firebase-init.js
var db = window.db;

// --- UTILIDADES ---
var safeParseAmount = NexusUtils.parseNum;
var fmt = NexusUtils.formatCurrency;
var formatDate = function formatDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "";
    var d = String(val.getDate()).padStart(2, "0");
    var m = String(val.getMonth() + 1).padStart(2, "0");
    var y = val.getFullYear();
    return "".concat(d, "/").concat(m, "/").concat(y);
  }
  return NexusUtils.formatDate ? NexusUtils.formatDate(val) : String(val);
};
var _isCreditoGroup = function isCreditoGroup(g) {
  if (!g) return false;
  if (g.isCredito === true || g.isCredito === "true") return true;
  if (g.Es_Credito === true || g.Es_Credito === "true" || g["Es_Credito"] === true || g["Es_Credito"] === "true") return true;
  if (g.Com_Es_Credito === true || g.Com_Es_Credito === "true" || g["Com_Es_Credito"] === true || g["Com_Es_Credito"] === "true") return true;
  var fp = String(g.Forma_Pago || g["Forma de Pago"] || g.Com_Forma_Pago || "").toUpperCase();
  if (fp.includes("CREDIT") || fp.includes("CRÉDIT")) return true;
  if (Array.isArray(g.records)) {
    return g.records.some(function (r) {
      return _isCreditoGroup(r);
    });
  }
  return false;
};
var getGroupFinancialInfo = function getGroupFinancialInfo(g) {
  if (!g) return {
    total: 0,
    paid: 0,
    pending: 0,
    planPaid: 0,
    planTotal: 0,
    allMilestonesCobrado: false
  };
  var records = Array.isArray(g.records) && g.records.length > 0 ? g.records : [g];
  var roomingTotal = 0;
  records.forEach(function (rec) {
    if (rec.RoomingList_JSON) {
      try {
        var rList = typeof rec.RoomingList_JSON === "string" ? JSON.parse(rec.RoomingList_JSON) : rec.RoomingList_JSON;
        if (Array.isArray(rList)) {
          rList.forEach(function (item) {
            roomingTotal += parseFloat(item.total) || 0;
          });
        }
      } catch (e) {}
    }
  });
  var planTotal = 0;
  var planPaid = 0;
  var hasMilestones = false;
  var allMilestonesCobrado = true;
  var processedPlans = new Set();
  records.forEach(function (rec) {
    if (rec.PaymentPlan_JSON && rec.PaymentPlan_JSON !== "[]" && !processedPlans.has(rec.PaymentPlan_JSON)) {
      processedPlans.add(rec.PaymentPlan_JSON);
      try {
        var plan = JSON.parse(rec.PaymentPlan_JSON);
        if (Array.isArray(plan) && plan.length > 0) {
          hasMilestones = true;
          plan.forEach(function (p) {
            var amt = parseFloat(p.amount) || 0;
            planTotal += amt;
            if (p.status === "Cobrado" || p.status === "Pagado") {
              planPaid += amt;
            } else {
              allMilestonesCobrado = false;
            }
          });
        }
      } catch (e) {}
    }
  });
  var manualPaid = records.reduce(function (max, r) {
    return Math.max(max, safeParseAmount(r.Com_Pagado || 0));
  }, 0);
  var paid = Math.max(manualPaid, planPaid);
  var total = 0;
  if (roomingTotal > 0) {
    total = roomingTotal;
  } else {
    var facturable = records.reduce(function (sum, r) {
      return sum + safeParseAmount(r.Total_Importe_Facturable || 0);
    }, 0);
    if (facturable > 0) {
      total = facturable;
    } else if (planTotal > 0) {
      total = planTotal;
    } else {
      total = records.reduce(function (sum, r) {
        return sum + safeParseAmount(r["Importe(*)"] || r["Importe"] || 0);
      }, 0);
    }
  }
  var pending = Math.max(0, total - paid);
  if (hasMilestones && allMilestonesCobrado && planPaid > 0 || planTotal > 0 && paid >= planTotal - 0.05 || total > 0 && paid >= total - 0.05) {
    pending = 0;
  }
  return {
    total: total,
    paid: paid,
    pending: pending,
    planPaid: planPaid,
    planTotal: planTotal,
    allMilestonesCobrado: allMilestonesCobrado
  };
};

// --- MÓDULO IA (CONEXIÓN SEGURA) ---
// --- MÓDULO IA ESTRATÉGICA (CONEXIÓN POR PARÁMETROS) ---
function analizarGrupos(_x) {
  return _analizarGrupos.apply(this, arguments);
}
function _analizarGrupos() {
  _analizarGrupos = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(datos) {
    var apiKey, model, settingsDoc, s, url, prompt, response, _error$error, error, msg, data, _t4, _t5;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.p = _context4.n) {
        case 0:
          // 1. Obtener parámetros dinámicos de Firestore
          apiKey = window.firebaseConfig.apiKey;
          model = "gemini-1.5-flash"; // Default Standard Model
          _context4.p = 1;
          _context4.n = 2;
          return db.collection("settings").doc("main").get();
        case 2:
          settingsDoc = _context4.v;
          if (settingsDoc.exists) {
            s = settingsDoc.data().system || {};
            if (s.geminiApiKey) apiKey = s.geminiApiKey;
            if (s.geminiModel) model = s.geminiModel;
          }
          _context4.n = 4;
          break;
        case 3:
          _context4.p = 3;
          _t4 = _context4.v;
          console.warn("No se pudo cargar la API Key de Firestore, usando fallback.");
        case 4:
          if (!(!apiKey || apiKey === "TU_API_KEY_AQUI")) {
            _context4.n = 5;
            break;
          }
          throw new Error("ERROR: No se ha configurado la API Key de Gemini en el panel de Configuración.");
        case 5:
          url = "https://generativelanguage.googleapis.com/v1/models/".concat(model, ":generateContent?key=").concat(apiKey);
          prompt = "\n            Act\xFAa como un experto analista de Revenue Management hotelero de alto nivel.\n            Analiza los siguientes datos de grupos consolidados de los hoteles Sercotel Guadiana y Cumbria Spa & Hotel.\n            Derrame un informe estrat\xE9gico conciso con:\n            1. Puntos cr\xEDticos de release (vencimientos pr\xF3ximos).\n            2. An\xE1lisis de ocupaci\xF3n y revenue por hotel.\n            3. Recomendaciones de seguimiento comercial (upselling, confirmaci\xF3n de grupos en tentativa).\n            4. Proyecci\xF3n de cierre de mes.\n            Utiliza un tono profesional y directo.\n            \n            DATOS DE GRUPOS:\n            ".concat(JSON.stringify(datos), "\n            ");
          _context4.p = 6;
          _context4.n = 7;
          return fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            })
          });
        case 7:
          response = _context4.v;
          if (response.ok) {
            _context4.n = 11;
            break;
          }
          _context4.n = 8;
          return response.json();
        case 8:
          error = _context4.v;
          msg = ((_error$error = error.error) === null || _error$error === void 0 ? void 0 : _error$error.message) || "";
          if (!(msg.includes("blocked") || msg.includes("PERMISSION_DENIED"))) {
            _context4.n = 9;
            break;
          }
          throw new Error("ðŸš« ACCESO DENEGADO: Tu API Key está bloqueada o no tiene permisos. Verifica en Google AI Studio que la 'Generative Language API' esté activa y que no haya restricciones de IP/dominio.");
        case 9:
          if (!msg.includes("leaked")) {
            _context4.n = 10;
            break;
          }
          throw new Error("⚠️ SEGURIDAD: Tu API Key ha sido desactivada por filtración pública (leaked). Por favor, genera una nueva clave privada en Google AI Studio.");
        case 10:
          throw new Error("Error en API Gemini: ".concat(msg || JSON.stringify(error)));
        case 11:
          _context4.n = 12;
          return response.json();
        case 12:
          data = _context4.v;
          return _context4.a(2, data.candidates[0].content.parts[0].text);
        case 13:
          _context4.p = 13;
          _t5 = _context4.v;
          console.error("Error llamando a Gemini:", _t5);
          throw _t5;
        case 14:
          return _context4.a(2);
      }
    }, _callee4, null, [[6, 13], [1, 3]]);
  }));
  return _analizarGrupos.apply(this, arguments);
}
var Sidebar = function Sidebar(_ref) {
  var activeTab = _ref.activeTab,
    setActiveTab = _ref.setActiveTab;
  var items = [{
    id: "dashboard",
    icon: "layout-dashboard",
    label: "Panel de Control"
  }, {
    id: "groups",
    icon: "users",
    label: "Directorio Grupos"
  }, {
    id: "budgets",
    icon: "clipboard-list",
    label: "Seguimiento Presupuestos"
  }, {
    id: "invoices",
    icon: "file-text",
    label: "Facturas Proforma"
  }, {
    id: "analytics",
    icon: "bar-chart-3",
    label: "Análisis IA"
  }, {
    id: "calendario",
    icon: "calendar",
    label: "Calendario Operativo"
  }, {
    id: "menus",
    icon: "utensils",
    label: "Menús Eventos"
  }, {
    id: "turisticos",
    icon: "map",
    label: "Menús Turísticos"
  }, {
    id: "cocteles",
    icon: "martini",
    label: "Menús Cócteles"
  }, {
    id: "settings",
    icon: "settings",
    label: "Configuración"
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 p-6 flex flex-col z-30 shadow-2xl shadow-slate-200/50"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center mb-8 px-2 space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full flex justify-center p-4"
  }, /*#__PURE__*/React.createElement("img", {
    src: "Nexus%20Groups/Nexus_Groups-removebg-preview.png",
    className: "h-20 w-auto object-contain",
    alt: "Nexus Groups Logo"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-4 w-full opacity-60 grayscale hover:grayscale-0 transition-all"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 p-2 rounded-2xl border border-slate-100 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement("img", {
    src: "Logos/Sercotel Guadiana.jpg",
    className: "h-8 w-auto object-contain",
    alt: "Logo Guadiana"
  })), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 p-2 rounded-2xl border border-slate-100 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement("img", {
    src: "Logos/Cumbria Spa&Hotel.jpg",
    className: "h-8 w-auto object-contain",
    alt: "Logo Cumbria"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "h-[1px] w-full bg-slate-100"
  })), /*#__PURE__*/React.createElement("nav", {
    className: "flex-1 space-y-2"
  }, items.map(function (item) {
    return /*#__PURE__*/React.createElement("button", {
      key: item.id,
      onClick: function onClick() {
        if (item.id === "groups") window.location.href = "Gestion-de-Grupos.html";else if (item.id === "budgets") window.location.href = "Presupuestos.html";else if (item.id === "alta-email") window.location.href = "AltaEmail.html";else if (item.id === "invoices") {
          window.location.href = "Proformas.html";
        } else if (item.id === "calendario") {
          window.location.href = "Calendario.html";
        } else if (item.id === "menus") window.open("https://nataliogc.github.io/menus-eventos/admin.html", "_blank");else if (item.id === "turisticos") window.open("https://nataliogc.github.io/Menus-Turisticos/", "_blank");else if (item.id === "cocteles") window.open("https://nataliogc.github.io/menus-cocteles/", "_blank");else if (item.id === "settings") window.location.href = "Configuracion.html";else setActiveTab(item.id);
      },
      className: "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ".concat(activeTab === item.id ? "sidebar-item-active" : "text-slate-500 hover:bg-slate-50 hover:translate-x-1")
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: item.icon,
      className: "w-5 h-5"
    }), item.label);
  })), /*#__PURE__*/React.createElement("div", {
    className: "mt-auto space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 bg-[#2d5a43]/5 rounded-2xl border border-[#2d5a43]/10"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-bold text-[#2d5a43] uppercase tracking-widest mb-1"
  }, "Estado Global"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold text-slate-700"
  }, "Sistema Operativo")))));
};
var Dashboard = function Dashboard(_ref2) {
  var arrivals = _ref2.arrivals,
    stats = _ref2.stats,
    alerts = _ref2.alerts,
    onRunAnalysis = _ref2.onRunAnalysis,
    timeRange = _ref2.timeRange,
    onRangeChange = _ref2.onRangeChange,
    data = _ref2.data;
  var _React$useState = React.useState("todos"),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    selectedHotel = _React$useState2[0],
    setSelectedHotel = _React$useState2[1];
  var _React$useState3 = React.useState(null),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    selectedEmailAlert = _React$useState4[0],
    setSelectedEmailAlert = _React$useState4[1];
  var _React$useState5 = React.useState("preview"),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    emailModalTab = _React$useState6[0],
    setEmailModalTab = _React$useState6[1];
  var _React$useState7 = React.useState(null),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    internalReportModal = _React$useState8[0],
    setInternalReportModal = _React$useState8[1];
  var _React$useState9 = React.useState("preview"),
    _React$useState0 = _slicedToArray(_React$useState9, 2),
    internalReportTab = _React$useState0[0],
    setInternalReportTab = _React$useState0[1];
  var _React$useState1 = React.useState(null),
    _React$useState10 = _slicedToArray(_React$useState1, 2),
    toastInfo = _React$useState10[0],
    setToastInfo = _React$useState10[1];
  var _React$useState11 = React.useState(function () {
      try {
        return JSON.parse(localStorage.getItem("nexus_notified_alerts") || "{}");
      } catch (e) {
        return {};
      }
    }),
    _React$useState12 = _slicedToArray(_React$useState11, 2),
    notifiedAlerts = _React$useState12[0],
    setNotifiedAlerts = _React$useState12[1];
  React.useEffect(function () {
    if (toastInfo) {
      var t = setTimeout(function () {
        return setToastInfo(null);
      }, 4500);
      return function () {
        return clearTimeout(t);
      };
    }
  }, [toastInfo]);

  // Helper robusto para parsear fechas de diversas fuentes
  var parseDate = function parseDate(val) {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (val && _typeof(val) === 'object' && typeof val.toDate === 'function') {
      return val.toDate();
    }
    var str = String(val).trim();
    if (!str) return null;
    if (!isNaN(str) && str.length > 4 && !str.includes("/") && !str.includes("-")) {
      var excelEpoch = new Date(1899, 11, 30);
      excelEpoch.setDate(excelEpoch.getDate() + parseInt(str));
      return excelEpoch;
    }
    var parts = str.split(/[\/-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    var d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  };

  // Filtrado por hotel seleccionado
  var filteredGroups = React.useMemo(function () {
    if (selectedHotel === "todos") return data || [];
    return (data || []).filter(function (g) {
      var hotel = (g.Hotel_Asignado || g.Hotel || "").toLowerCase();
      if (selectedHotel === "guadiana") return hotel.includes("guad") || hotel.includes("guadiana");
      if (selectedHotel === "cumbria") return hotel.includes("cumb") || hotel.includes("cumbria");
      return true;
    });
  }, [data, selectedHotel]);

  // Cálculo de contadores para las pestañas de hotel (sobre el total sin filtrar por hotel)
  var counts = React.useMemo(function () {
    var total = 0;
    var cumbria = 0;
    var guadiana = 0;
    var now = new Date();
    var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    var fiveDaysFromNow = new Date(startOfToday);
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    var fifteenDaysFromNow = new Date(startOfToday);
    fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);
    var twentyFiveDaysFromNow = new Date(startOfToday);
    twentyFiveDaysFromNow.setDate(twentyFiveDaysFromNow.getDate() + 25);
    (data || []).forEach(function (g) {
      var status = ((g.Estado || "") + " " + (g.Com_Estado_Interno || "")).toUpperCase();
      var isCancelled = ["CANCEL", "ANUL", "BAJA", "DESESTIMADO", "GASTOS", "DESGLOSADO"].some(function (s) {
        return status.includes(s);
      }) || g.excludeFromStatistics === true;
      var departureDate = parseDate(g.Salida || g.Entrada);
      var isPast = departureDate && departureDate < startOfToday;
      if (isCancelled || isPast) return;
      var isConfirmed = status.includes("CONFIRM") || status.includes("OK") || status.includes("GARANT") || status.includes("RESERVA") || status.includes("GRUPO");
      var isTentative = status.includes("BLOQ") || status.includes("OPCI") || status.includes("TENTAT") || status.includes("TANTEO");
      var entryDate = parseDate(g.Entrada);
      var fin = getGroupFinancialInfo(g);
      var totalAmt = fin.total;
      var paid = fin.paid;
      var pending = fin.pending;
      var hasAlert = false;
      var isCredito = _isCreditoGroup(g);

      // 1. Financial (ignorar si es crédito)
      if (!isCredito && (isConfirmed || isTentative) && pending > 0.1) {
        try {
          var plan = JSON.parse(g.PaymentPlan_JSON || "[]");
          var pastDueMilestones = plan.filter(function (p) {
            var pDate = parseDate(p.date);
            return pDate && pDate < now && p.status !== "Cobrado" && p.status !== "Pagado";
          });
          if (pastDueMilestones.length > 0) hasAlert = true;
        } catch (e) {}
      }

      // 2. Release (sólo para reservas NO confirmadas y que no sean crédito)
      var dRel = parseDate(g.Com_Vencimiento_Rel);
      if (!hasAlert && !isConfirmed && !isCredito && pending > 0.1 && dRel && dRel <= fiveDaysFromNow) {
        hasAlert = true;
      }

      // 3. Logistics
      if (!hasAlert && isConfirmed && entryDate && entryDate >= startOfToday && entryDate <= fifteenDaysFromNow) {
        if (!g.Logistica_Rooming) hasAlert = true;
        var regime = (g["Régimen"] || "").toUpperCase();
        if (regime.includes("MP") && !g.Logistica_MenuMP) hasAlert = true;
        if (regime.includes("PC") && !g.Logistica_MenuPC) hasAlert = true;
      }

      // 4. CRM
      var dFollow = parseDate(g.Com_Seguimiento);
      if (!hasAlert && dFollow && dFollow <= endOfToday) {
        hasAlert = true;
      }

      // 5. Tentativa Urgente (< 25 días para la llegada)
      if (!hasAlert && isTentative && entryDate && entryDate >= startOfToday && entryDate <= twentyFiveDaysFromNow) {
        hasAlert = true;
      }
      if (hasAlert) {
        total++;
        var hotel = (g.Hotel_Asignado || g.Hotel || "").toLowerCase();
        if (hotel.includes("cumb")) cumbria++;else if (hotel.includes("guad") || hotel.includes("guadiana")) guadiana++;
      }
    });
    return {
      total: total,
      cumbria: cumbria,
      guadiana: guadiana
    };
  }, [data]);

  // Cálculo de alertas en 5 columnas
  var columnsData = React.useMemo(function () {
    var financialAlerts = [];
    var releaseAlerts = [];
    var logisticsAlerts = [];
    var crmAlerts = [];
    var tentativeAlerts = [];
    var now = new Date();
    var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    var fiveDaysFromNow = new Date(startOfToday);
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    var fifteenDaysFromNow = new Date(startOfToday);
    fifteenDaysFromNow.setDate(fifteenDaysFromNow.getDate() + 15);
    var seenFinancial = new Set();
    var seenRelease = new Set();
    var seenLogistics = new Set();
    var seenCrm = new Set();
    var seenTentative = new Set();
    var twentyFiveDaysFromNow = new Date(startOfToday);
    twentyFiveDaysFromNow.setDate(twentyFiveDaysFromNow.getDate() + 25);
    filteredGroups.forEach(function (g) {
      var resId = g.Reserva || g.Com_Id || "";
      var status = ((g.Estado || "") + " " + (g.Com_Estado_Interno || "")).toUpperCase();
      var isCancelled = ["CANCEL", "ANUL", "BAJA", "DESESTIMADO", "GASTOS", "DESGLOSADO", "CADUC"].some(function (s) {
        return status.includes(s);
      }) || g.excludeFromStatistics === true;
      var departureDate = parseDate(g.Salida || g.Entrada);
      var isPast = departureDate && departureDate < startOfToday;
      if (isCancelled || isPast) return;
      var isConfirmed = status.includes("CONF") || status.includes("OK") || status.includes("GARANT") || status.includes("RESERVA") || status.includes("GRUPO");
      var isTentative = status.includes("BLOQ") || status.includes("OPCI") || status.includes("TENTAT") || status.includes("TANTEO");
      var entryDate = parseDate(g.Entrada);
      var fin = getGroupFinancialInfo(g);
      var total = fin.total;
      var paid = fin.paid;
      var pending = fin.pending;
      var isCredito = _isCreditoGroup(g);

      // 1. Column 1: Financial Alerts (ignorar si es crédito)
      if (!isCredito && (isConfirmed || isTentative) && pending > 0.1 && !seenFinancial.has(resId)) {
        try {
          var plan = JSON.parse(g.PaymentPlan_JSON || "[]");
          var pastDueMilestones = plan.filter(function (p) {
            var pDate = parseDate(p.date);
            return pDate && pDate < now && p.status !== "Cobrado" && p.status !== "Pagado";
          });
          if (pastDueMilestones.length > 0) {
            seenFinancial.add(resId);
            var firstPastDue = pastDueMilestones[0];
            var amt = parseFloat(firstPastDue.amount) || 0;
            financialAlerts.push({
              group: g,
              icon: "alert-triangle",
              label: "Hito Vencido",
              detail: "Pago de ".concat(fmt(amt), " vencido el ").concat(formatDate(firstPastDue.date)),
              type: "danger"
            });
          }
        } catch (e) {}
      }

      // 2. Column 2: Releases y Plazos (sólo aplica a reservas NO confirmadas)
      if (!isConfirmed && !isCredito && pending > 0.1 && !seenRelease.has(resId)) {
        var dRel = parseDate(g.Com_Vencimiento_Rel);
        if (dRel && dRel <= fiveDaysFromNow) {
          seenRelease.add(resId);
          var diffTime = dRel - now;
          var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          var isOverdue = dRel < startOfToday;
          releaseAlerts.push({
            group: g,
            icon: "clock",
            label: isOverdue ? "Release Vencido" : "Próximo Release",
            detail: isOverdue ? "Venci\xF3 hace ".concat(Math.abs(diffDays), " d\xEDas (").concat(formatDate(dRel), ") - Pend: ").concat(pending.toFixed(2), "\u20AC - Est: ").concat(status) : "Vence en ".concat(diffDays, " d\xEDas (").concat(formatDate(dRel), ") - Pend: ").concat(pending.toFixed(2), "\u20AC"),
            type: isOverdue ? "danger" : "warning"
          });
        }
      }

      // 3. Column 3: Datos Operativos Faltantes
      if (isConfirmed && entryDate && entryDate >= startOfToday && entryDate <= fifteenDaysFromNow && !seenLogistics.has(resId)) {
        var missingDetails = [];
        if (!g.Logistica_Rooming) {
          missingDetails.push({
            text: "Falta Rooming List",
            icon: "file-text"
          });
        }
        var regime = (g["Régimen"] || "").toUpperCase();
        if (regime.includes("MP") && !g.Logistica_MenuMP) {
          missingDetails.push({
            text: "Falta Menú MP",
            icon: "utensils"
          });
        }
        if (regime.includes("PC") && !g.Logistica_MenuPC) {
          missingDetails.push({
            text: "Falta Menú PC",
            icon: "utensils"
          });
        }
        if (missingDetails.length > 0) {
          seenLogistics.add(resId);
          logisticsAlerts.push({
            group: g,
            icon: "file-warning",
            label: "Datos Faltantes",
            detail: missingDetails.map(function (d) {
              return d.text;
            }).join(", "),
            details: missingDetails,
            type: "warning"
          });
        }
      }

      // 4. Column 4: CRM Tasks
      if (!seenCrm.has(resId)) {
        var dFollow = parseDate(g.Com_Seguimiento);
        if (dFollow && dFollow <= endOfToday) {
          seenCrm.add(resId);
          var isPastDue = dFollow < startOfToday;
          crmAlerts.push({
            group: g,
            icon: "phone-call",
            label: isPastDue ? "CRM Retrasado" : "CRM Hoy",
            detail: isPastDue ? "Planificado para el ".concat(formatDate(dFollow)) : "Programado para hoy (".concat(formatDate(dFollow), ")"),
            type: isPastDue ? "danger" : "info"
          });
        }
      }

      // 5. Column 5: Tentativas Urgentes (< 25 días para la llegada)
      if (isTentative && entryDate && !seenTentative.has(resId)) {
        if (entryDate >= startOfToday && entryDate <= twentyFiveDaysFromNow) {
          seenTentative.add(resId);
          var _diffDays = Math.ceil((entryDate - startOfToday) / (1000 * 60 * 60 * 24));
          var urgency = _diffDays <= 7 ? "danger" : _diffDays <= 14 ? "warning" : "info";
          tentativeAlerts.push({
            group: g,
            icon: "calendar-clock",
            label: _diffDays <= 7 ? "Llegada Crítica" : _diffDays <= 14 ? "Confirmar Pronto" : "Confirmar Antes de Plazo",
            detail: "Entrada en ".concat(_diffDays, " d\xEDa").concat(_diffDays !== 1 ? 's' : '', " (").concat(formatDate(entryDate), ") \u2014 a\xFAn en Tentativa"),
            type: urgency
          });
        }
      }
    });

    // Ordenamiento por prioridad/fecha
    financialAlerts.sort(function (a, b) {
      // Use cached entry date instead of re-parsing JSON inside the comparator
      var aDate = parseDate(a.group.Entrada);
      var bDate = parseDate(b.group.Entrada);
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate - bDate;
    });
    releaseAlerts.sort(function (a, b) {
      var aDate = parseDate(a.group.Com_Vencimiento_Rel);
      var bDate = parseDate(b.group.Com_Vencimiento_Rel);
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate - bDate;
    });
    logisticsAlerts.sort(function (a, b) {
      var aDate = parseDate(a.group.Entrada);
      var bDate = parseDate(b.group.Entrada);
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate - bDate;
    });
    crmAlerts.sort(function (a, b) {
      var aDate = parseDate(a.group.Com_Seguimiento);
      var bDate = parseDate(b.group.Com_Seguimiento);
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate - bDate;
    });
    tentativeAlerts.sort(function (a, b) {
      var aDate = parseDate(a.group.Entrada);
      var bDate = parseDate(b.group.Entrada);
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate - bDate;
    });
    return {
      financialAlerts: financialAlerts,
      releaseAlerts: releaseAlerts,
      logisticsAlerts: logisticsAlerts,
      crmAlerts: crmAlerts,
      tentativeAlerts: tentativeAlerts
    };
  }, [filteredGroups]);
  var STAFF_PRESETS = [{
    label: "🏢 Administración",
    email: "comunicaciones@hotelguadiana.es",
    desc: "Administración / Control"
  }, {
    label: "👤 Sergio",
    email: "ssanchez@hotelguadiana.es",
    desc: "Dirección / Comercial"
  }, {
    label: "👤 Natalio",
    email: "comunicaciones@hotelguadiana.es",
    desc: "Administración"
  }, {
    label: "👤 Diana",
    email: "dianahotelguadiana@gmail.com",
    desc: "Comercial"
  }, {
    label: "👥 Todo el Equipo",
    email: "comunicaciones@hotelguadiana.es, ssanchez@hotelguadiana.es, dianahotelguadiana@gmail.com",
    desc: "Equipo Completo"
  }];
  var getStaffEmail = function getStaffEmail(name) {
    var n = String(name || "").toLowerCase().trim();
    if (n.includes("sergio")) return "ssanchez@hotelguadiana.es";
    if (n.includes("natalio")) return "comunicaciones@hotelguadiana.es";
    if (n.includes("oscar")) return "osanchez@hotelguadiana.es";
    if (n.includes("diana")) return "dianahotelguadiana@gmail.com";
    return "";
  };
  var availableCommercials = React.useMemo(function () {
    var set = new Set();
    var allAlerts = [].concat(_toConsumableArray(columnsData.financialAlerts || []), _toConsumableArray(columnsData.releaseAlerts || []), _toConsumableArray(columnsData.logisticsAlerts || []), _toConsumableArray(columnsData.crmAlerts || []), _toConsumableArray(columnsData.tentativeAlerts || []));
    allAlerts.forEach(function (a) {
      var com = a.group && a.group.Com_Comercial ? a.group.Com_Comercial.trim() : "";
      if (com) set.add(com);
    });
    return Array.from(set).sort();
  }, [columnsData]);
  var handleOpenInternalReportModal = function handleOpenInternalReportModal() {
    var initialSectionKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var defaultSections = {
      financial: initialSectionKey ? initialSectionKey === "financial" : true,
      release: initialSectionKey ? initialSectionKey === "release" : true,
      logistics: initialSectionKey ? initialSectionKey === "logistics" : true,
      crm: initialSectionKey ? initialSectionKey === "crm" : true,
      tentative: initialSectionKey ? initialSectionKey === "tentative" : true
    };
    var hotelLabel = selectedHotel === "guadiana" ? "Sercotel Guadiana" : selectedHotel === "cumbria" ? "Cumbria Spa & Hotel" : "Todos los Hoteles";
    var todayStr = new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    setInternalReportTab("preview");
    setInternalReportModal({
      filterComercial: "todos",
      sections: defaultSections,
      emailTo: "comunicaciones@hotelguadiana.es",
      subject: "[CONTROL INTERNO] Resumen de Alertas Operativas - ".concat(hotelLabel, " - ").concat(todayStr),
      customBody: null
    });
  };
  var handleOpenSectionReportModal = function handleOpenSectionReportModal(title) {
    var sectionKey = "financial";
    var t = (title || "").toLowerCase();
    if (t.includes("rel")) sectionKey = "release";else if (t.includes("dato") || t.includes("falt") || t.includes("logist")) sectionKey = "logistics";else if (t.includes("crm") || t.includes("seg")) sectionKey = "crm";else if (t.includes("tent")) sectionKey = "tentative";
    handleOpenInternalReportModal(sectionKey);
  };
  var reportData = React.useMemo(function () {
    if (!internalReportModal) return null;
    var hotelLabel = selectedHotel === "guadiana" ? "Sercotel Guadiana" : selectedHotel === "cumbria" ? "Cumbria Spa & Hotel" : "Todos los Hoteles";
    var filterCom = (internalReportModal.filterComercial || "todos").toLowerCase();
    var filterAlerts = function filterAlerts(list) {
      if (!list) return [];
      if (filterCom === "todos") return list;
      return list.filter(function (a) {
        var _a$group;
        var com = (((_a$group = a.group) === null || _a$group === void 0 ? void 0 : _a$group.Com_Comercial) || "").toLowerCase();
        return com.includes(filterCom);
      });
    };
    var sectionDefs = [{
      id: "financial",
      title: "Alertas Financieras (Pagos y Vencimientos)",
      shortTitle: "Financieras",
      icon: "credit-card",
      colorClass: "rose",
      badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
      headerBg: "#ffe4e6",
      headerColor: "#9f1239",
      alerts: internalReportModal.sections.financial ? filterAlerts(columnsData.financialAlerts) : []
    }, {
      id: "release",
      title: "Releases y Plazos Críticos",
      shortTitle: "Releases",
      icon: "clock",
      colorClass: "amber",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      headerBg: "#fef3c7",
      headerColor: "#92400e",
      alerts: internalReportModal.sections.release ? filterAlerts(columnsData.releaseAlerts) : []
    }, {
      id: "logistics",
      title: "Datos Operativos Faltantes",
      shortTitle: "Datos Faltantes",
      icon: "file-warning",
      colorClass: "orange",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
      headerBg: "#ffedd5",
      headerColor: "#9a3412",
      alerts: internalReportModal.sections.logistics ? filterAlerts(columnsData.logisticsAlerts) : []
    }, {
      id: "crm",
      title: "Seguimientos CRM y Tareas Comerciales",
      shortTitle: "Seguimientos CRM",
      icon: "phone-call",
      colorClass: "indigo",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      headerBg: "#e0e7ff",
      headerColor: "#3730a3",
      alerts: internalReportModal.sections.crm ? filterAlerts(columnsData.crmAlerts) : []
    }, {
      id: "tentative",
      title: "Tentativas Urgentes (< 25 días a llegada)",
      shortTitle: "Tentativas Urgentes",
      icon: "calendar-clock",
      colorClass: "violet",
      badgeColor: "bg-violet-100 text-violet-800 border-violet-200",
      headerBg: "#ede9fe",
      headerColor: "#5b21b6",
      alerts: internalReportModal.sections.tentative ? filterAlerts(columnsData.tentativeAlerts) : []
    }];
    var totalAlerts = 0;
    var totalFinancialPending = 0;
    sectionDefs.forEach(function (s) {
      totalAlerts += s.alerts.length;
      if (s.id === "financial") {
        s.alerts.forEach(function (a) {
          var fin = getGroupFinancialInfo(a.group);
          totalFinancialPending += fin.pending || 0;
        });
      }
    });
    return {
      hotelLabel: hotelLabel,
      filterComercial: internalReportModal.filterComercial,
      sections: sectionDefs,
      totalAlerts: totalAlerts,
      totalFinancialPending: totalFinancialPending,
      dateStr: new Date().toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }),
      timeStr: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };
  }, [internalReportModal, columnsData, selectedHotel]);
  var generateInternalReportText = function generateInternalReportText(rep) {
    if (!rep) return "";
    var lines = [];
    lines.push("================================================================================");
    lines.push("INFORME INTERNO DE CONTROL OPERATIVO Y ALERTAS");
    lines.push("\xC1mbito: ".concat(rep.hotelLabel, " | Fecha: ").concat(rep.dateStr, " ").concat(rep.timeStr));
    lines.push("Filtro Comercial: ".concat(rep.filterComercial === "todos" ? "Todos los Comerciales" : rep.filterComercial));
    lines.push("Total Alertas Activas: ".concat(rep.totalAlerts));
    if (rep.totalFinancialPending > 0) {
      lines.push("Total Importe Pendiente Reclamado: ".concat(fmt(rep.totalFinancialPending)));
    }
    lines.push("================================================================================\n");
    lines.push("[RESUMEN POR SECCIONES]");
    rep.sections.forEach(function (sec, idx) {
      lines.push("  ".concat(idx + 1, ". ").concat(sec.title, ": ").concat(sec.alerts.length, " caso(s)"));
    });
    lines.push("");
    rep.sections.forEach(function (sec, sIdx) {
      if (sec.alerts.length === 0) return;
      lines.push("--------------------------------------------------------------------------------");
      lines.push("".concat(sIdx + 1, ". ").concat(sec.title.toUpperCase(), " (").concat(sec.alerts.length, ")"));
      lines.push("--------------------------------------------------------------------------------");
      sec.alerts.forEach(function (alert) {
        var g = alert.group || {};
        var resId = String(g.Reserva || g.Com_Id || "").replace(/^#/, "");
        var name = g["Nombre del Grupo"] || "Grupo sin nombre";
        var hotel = (g.Hotel_Asignado || g.Hotel || "").toLowerCase().includes("cumb") ? "Cumbria Spa & Hotel" : "Sercotel Guadiana";
        var com = g.Com_Comercial || "Sin asignar";
        var pax = g["Pax."] || g.Pax || 0;
        var entrada = formatDate(g.Entrada) || "---";
        var salida = formatDate(g.Salida) || "---";
        var fin = getGroupFinancialInfo(g);
        lines.push("\u2022 [Reserva #".concat(resId, "] ").concat(name.toUpperCase()));
        lines.push("  Hotel: ".concat(hotel, " | Comercial: ").concat(com, " | Pax: ").concat(pax));
        lines.push("  Estancia: ".concat(entrada, " \u2794 ").concat(salida));
        if (sec.id === "financial" || sec.id === "release") {
          lines.push("  Importes: Total: ".concat(fmt(fin.total), " | Pagado: ").concat(fmt(fin.paid), " | PENDIENTE: ").concat(fmt(fin.pending)));
        }
        if (sec.id === "logistics" && alert.details) {
          lines.push("  Faltante: ".concat(alert.details.map(function (d) {
            return d.text;
          }).join(", ")));
        } else {
          lines.push("  Alerta: ".concat(alert.detail || alert.label));
        }
        lines.push("");
      });
    });
    lines.push("================================================================================");
    lines.push("Por favor gestionar las actuaciones correspondientes a la mayor brevedad.");
    lines.push("Dirección de Operaciones & Departamento de Administración");
    lines.push("================================================================================");
    return lines.join("\n");
  };
  var generateInternalReportHtml = function generateInternalReportHtml(rep) {
    if (!rep) return "";
    var sectionsHtml = rep.sections.filter(function (s) {
      return s.alerts.length > 0;
    }).map(function (sec) {
      var rowsHtml = sec.alerts.map(function (alert) {
        var g = alert.group || {};
        var resId = String(g.Reserva || g.Com_Id || "").replace(/^#/, "");
        var name = g["Nombre del Grupo"] || "Grupo sin nombre";
        var isCumbria = (g.Hotel_Asignado || g.Hotel || "").toLowerCase().includes("cumb");
        var hotelName = isCumbria ? "Cumbria" : "Guadiana";
        var com = g.Com_Comercial || "Sin asignar";
        var pax = g["Pax."] || g.Pax || 0;
        var entrada = formatDate(g.Entrada) || "---";
        var salida = formatDate(g.Salida) || "---";
        var fin = getGroupFinancialInfo(g);
        var alertDetailText = sec.id === "logistics" && alert.details ? alert.details.map(function (d) {
          return d.text;
        }).join(" • ") : alert.detail || alert.label;
        return "\n              <tr style=\"border-bottom: 1px solid #e2e8f0; background-color: #ffffff;\">\n                <td width=\"90\" valign=\"top\" style=\"padding: 10px 8px; vertical-align: top; width: 90px;\">\n                  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n                    <tr>\n                      <td bgcolor=\"#0f172a\" style=\"background-color: #0f172a; color: #ffffff; font-size: 11px; font-weight: 800; font-family: monospace; padding: 3px 6px; border-radius: 4px; text-align: center;\">\n                        #".concat(resId, "\n                      </td>\n                    </tr>\n                  </table>\n                  <div style=\"font-size: 9.5px; color: #64748b; font-weight: 700; margin-top: 4px;\">\n                    \uD83C\uDFE8 ").concat(hotelName, "\n                  </div>\n                </td>\n                <td width=\"280\" valign=\"top\" style=\"padding: 10px 8px; vertical-align: top; width: 280px;\">\n                  <div style=\"font-size: 12px; font-weight: 800; color: #0f172a; line-height: 1.3;\">\n                    ").concat(name, "\n                  </div>\n                  <div style=\"font-size: 10.5px; color: #64748b; margin-top: 2px;\">\n                    <strong>Estancia:</strong> ").concat(entrada, " \u2794 ").concat(salida, " &nbsp;|&nbsp; <strong>Pax:</strong> ").concat(pax, "\n                  </div>\n                  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin-top: 5px;\">\n                    <tr>\n                      <td bgcolor=\"#f8fafc\" style=\"background-color: #f8fafc; border-left: 3px solid ").concat(sec.headerColor, "; padding: 4px 8px; font-size: 11px; font-weight: 700; color: #1e293b;\">\n                        \u26A0\uFE0F ").concat(alertDetailText, "\n                      </td>\n                    </tr>\n                  </table>\n                </td>\n                <td width=\"110\" valign=\"top\" style=\"padding: 10px 8px; vertical-align: top; width: 110px;\">\n                  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n                    <tr>\n                      <td bgcolor=\"#e2e8f0\" style=\"background-color: #e2e8f0; color: #334155; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px;\">\n                        \uD83D\uDC64 ").concat(com, "\n                      </td>\n                    </tr>\n                  </table>\n                </td>\n                ").concat(sec.id === "financial" || sec.id === "release" ? "\n                <td width=\"140\" valign=\"top\" align=\"right\" style=\"padding: 10px 8px; vertical-align: top; text-align: right; width: 140px;\">\n                  <div style=\"font-size: 9.5px; color: #64748b;\">Total: ".concat(fmt(fin.total), "</div>\n                  <div style=\"font-size: 13px; font-weight: 900; color: #be123c; margin-top: 2px;\">\n                    Pend: ").concat(fmt(fin.pending), "\n                  </div>\n                  <div style=\"font-size: 9.5px; color: #059669; font-weight: 700;\">Abonado: ").concat(fmt(fin.paid), "</div>\n                </td>") : "\n                <td width=\"140\" valign=\"top\" align=\"right\" style=\"padding: 10px 8px; vertical-align: top; text-align: right; width: 140px;\">\n                  <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"right\">\n                    <tr>\n                      <td bgcolor=\"#f0f9ff\" style=\"background-color: #f0f9ff; border: 1px solid #bae6fd; color: #0284c7; font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 4px;\">\n                        Requiere Acci\xF3n\n                      </td>\n                    </tr>\n                  </table>\n                </td>", "\n              </tr>\n            ");
      }).join("");
      return "\n            <table role=\"presentation\" width=\"600\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"center\" style=\"width: 600px; max-width: 600px; margin-bottom: 20px; background-color: #ffffff; border: 1px solid #cbd5e1; border-collapse: collapse;\">\n              <tr>\n                <td bgcolor=\"".concat(sec.headerBg, "\" style=\"background-color: ").concat(sec.headerBg, "; border-bottom: 2px solid ").concat(sec.headerColor, "; padding: 10px 12px;\">\n                  <table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n                    <tr>\n                      <td style=\"font-size: 12px; font-weight: 800; color: ").concat(sec.headerColor, "; text-transform: uppercase; letter-spacing: 0.5px;\">\n                        ").concat(sec.title, "\n                      </td>\n                      <td align=\"right\" style=\"text-align: right; font-size: 11px; font-weight: 800; color: ").concat(sec.headerColor, ";\">\n                        ").concat(sec.alerts.length, " caso(s)\n                      </td>\n                    </tr>\n                  </table>\n                </td>\n              </tr>\n              <tr bgcolor=\"#f1f5f9\" style=\"background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1; font-size: 9.5px; font-weight: 800; color: #475569; text-transform: uppercase;\">\n                <td width=\"90\" style=\"padding: 6px 8px;\">Localizador</td>\n                <td width=\"280\" style=\"padding: 6px 8px;\">Grupo & Requerimiento</td>\n                <td width=\"110\" style=\"padding: 6px 8px;\">Comercial</td>\n                <td width=\"140\" align=\"right\" style=\"padding: 6px 8px; text-align: right;\">").concat(sec.id === "financial" || sec.id === "release" ? "Importes" : "Estado", "</td>\n              </tr>\n              ").concat(rowsHtml, "\n            </table>\n          ");
    }).join("");
    return "\n<center style=\"width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 15px 0;\">\n  <!--[if mso]>\n  <table role=\"presentation\" width=\"640\" align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr><td>\n  <![endif]-->\n  <table role=\"presentation\" width=\"640\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"center\" style=\"width: 640px; max-width: 640px; margin: 0 auto; background-color: #ffffff; border: 1px solid #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border-collapse: collapse;\">\n    <!-- Header Banner: Fondo solido azul oscuro para compatibilidad total con Outlook -->\n    <tr>\n      <td bgcolor=\"#0f172a\" style=\"background-color: #0f172a; padding: 20px 24px;\">\n        <table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n          <tr>\n            <td valign=\"middle\" style=\"vertical-align: middle;\">\n              <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n                <tr>\n                  <td bgcolor=\"#d97706\" style=\"background-color: #d97706; color: #ffffff; font-size: 9.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 3px 8px; border-radius: 4px;\">\n                    CONTROL INTERNO OPERATIVO\n                  </td>\n                </tr>\n              </table>\n              <div style=\"font-size: 17px; font-weight: 800; color: #ffffff; margin-top: 8px; line-height: 1.25;\">\n                Informe de Alertas Operativas y Actuaciones Cr\xEDticas\n              </div>\n              <div style=\"font-size: 11px; color: #94a3b8; font-weight: 600; margin-top: 4px;\">\n                Establecimiento: <strong style=\"color: #38bdf8;\">".concat(rep.hotelLabel, "</strong> &nbsp;|&nbsp; Fecha: ").concat(rep.dateStr, " (").concat(rep.timeStr, ")\n              </div>\n              <div style=\"font-size: 11px; color: #cbd5e1; margin-top: 2px;\">\n                Filtro Comercial: <strong>").concat(rep.filterComercial === "todos" ? "Todos los Comerciales" : rep.filterComercial, "</strong>\n              </div>\n            </td>\n            <td valign=\"middle\" align=\"right\" width=\"105\" style=\"vertical-align: middle; text-align: right;\">\n              <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"right\">\n                <tr>\n                  <td bgcolor=\"#1e293b\" style=\"background-color: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; text-align: center;\">\n                    <div style=\"font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase;\">Total Alertas</div>\n                    <div style=\"font-size: 24px; font-weight: 900; color: #f59e0b; line-height: 1.1;\">").concat(rep.totalAlerts, "</div>\n                  </td>\n                </tr>\n              </table>\n            </td>\n          </tr>\n        </table>\n      </td>\n    </tr>\n\n    <!-- Financial Alert Highlight Banner si procede -->\n    ").concat(rep.totalFinancialPending > 0 ? "\n    <tr>\n      <td bgcolor=\"#fff1f2\" style=\"background-color: #fff1f2; border-bottom: 2px solid #fecdd3; padding: 12px 24px;\">\n        <table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n          <tr>\n            <td style=\"font-size: 11.5px; font-weight: 800; color: #be123c;\">\n              \uD83D\uDCB0 TOTAL PENDIENTE DE COBRO EN ALERTAS FINANCIERAS:\n            </td>\n            <td align=\"right\" style=\"text-align: right; font-size: 16px; font-weight: 900; color: #9f1239;\">\n              ".concat(fmt(rep.totalFinancialPending), "\n            </td>\n          </tr>\n        </table>\n      </td>\n    </tr>") : '', "\n\n    <!-- Body Content con las tablas de secciones -->\n    <tr>\n      <td bgcolor=\"#f8fafc\" style=\"background-color: #f8fafc; padding: 20px 10px;\">\n        ").concat(sectionsHtml || "\n          <div style=\"text-align: center; padding: 30px; color: #64748b; font-size: 13px; font-weight: 700;\">\n            \u2705 No hay alertas activas en las secciones seleccionadas para este filtro.\n          </div>\n        ", "\n      </td>\n    </tr>\n\n    <!-- Footer Oficial -->\n    <tr>\n      <td bgcolor=\"#ffffff\" style=\"background-color: #ffffff; border-top: 1px solid #e2e8f0; padding: 12px 24px; font-size: 11px; color: #64748b; text-align: center;\">\n        <strong>Nexus Groups Gold Edition</strong> \u2022 M\xF3dulo de Control Interno de Operaciones y Seguimiento Comercial\n      </td>\n    </tr>\n  </table>\n  <!--[if mso]>\n  </td></tr></table>\n  <![endif]-->\n</center>\n        ");
  };
  var handleCopyReportRichEmail = function handleCopyReportRichEmail() {
    if (!reportData) return;
    var htmlContent = generateInternalReportHtml(reportData);
    var plainText = (internalReportModal === null || internalReportModal === void 0 ? void 0 : internalReportModal.customBody) || generateInternalReportText(reportData);
    var fullPlain = "Para: ".concat((internalReportModal === null || internalReportModal === void 0 ? void 0 : internalReportModal.emailTo) || "", "\nAsunto: ").concat((internalReportModal === null || internalReportModal === void 0 ? void 0 : internalReportModal.subject) || "", "\n\n").concat(plainText);
    if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      try {
        var blobHtml = new Blob([htmlContent], {
          type: "text/html"
        });
        var blobText = new Blob([fullPlain], {
          type: "text/plain"
        });
        navigator.clipboard.write([new ClipboardItem({
          "text/html": blobHtml,
          "text/plain": blobText
        })]).then(function () {
          setToastInfo("✨ ¡Informe visual copiado! Pégalo en Outlook o Gmail con formato y tablas.");
        }).catch(function () {
          navigator.clipboard.writeText(fullPlain).then(function () {
            setToastInfo("📋 Informe en texto copiado al portapapeles.");
          });
        });
      } catch (e) {
        navigator.clipboard.writeText(fullPlain).then(function () {
          setToastInfo("📋 Informe en texto copiado al portapapeles.");
        });
      }
    } else {
      navigator.clipboard.writeText(fullPlain).then(function () {
        setToastInfo("📋 Informe en texto copiado al portapapeles.");
      });
    }
  };
  var handleCopyReportText = function handleCopyReportText() {
    if (!reportData) return;
    var bodyText = (internalReportModal === null || internalReportModal === void 0 ? void 0 : internalReportModal.customBody) || generateInternalReportText(reportData);
    var fullPlain = "Para: ".concat((internalReportModal === null || internalReportModal === void 0 ? void 0 : internalReportModal.emailTo) || "", "\nAsunto: ").concat((internalReportModal === null || internalReportModal === void 0 ? void 0 : internalReportModal.subject) || "", "\n\n").concat(bodyText);
    navigator.clipboard.writeText(fullPlain).then(function () {
      setToastInfo("📋 Texto del informe copiado al portapapeles.");
    }).catch(function () {
      setToastInfo("❌ Error al copiar texto.");
    });
  };
  var handleExecuteSendReport = function handleExecuteSendReport() {
    if (!reportData) return;
    var bodyText = (internalReportModal === null || internalReportModal === void 0 ? void 0 : internalReportModal.customBody) || generateInternalReportText(reportData);
    var to = (internalReportModal === null || internalReportModal === void 0 ? void 0 : internalReportModal.emailTo) || "comunicaciones@hotelguadiana.es";
    var sub = (internalReportModal === null || internalReportModal === void 0 ? void 0 : internalReportModal.subject) || "[CONTROL INTERNO] Resumen de Alertas Operativas - ".concat(reportData.hotelLabel);
    var mailtoUrl = "mailto:".concat(encodeURIComponent(to), "?subject=").concat(encodeURIComponent(sub), "&body=").concat(encodeURIComponent(bodyText));
    window.location.href = mailtoUrl;
    setToastInfo("🚀 Gestor de correo abierto con el informe interno por secciones.");
    setInternalReportModal(null);
  };
  var generateRichHtmlEmail = function generateRichHtmlEmail(data) {
    var _data$alert;
    if (!data) return "";
    var fin = data.fin || {
      total: 0,
      paid: 0,
      pending: 0
    };
    var hasFin = fin.total > 0 || fin.pending > 0;
    var isInternal = data.mode === "internal";
    return "\n<center style=\"width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 15px 0;\">\n  <!--[if mso]>\n  <table role=\"presentation\" width=\"620\" align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"><tr><td>\n  <![endif]-->\n  <table role=\"presentation\" width=\"620\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"center\" style=\"width: 620px; max-width: 620px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #cbd5e1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border-collapse: collapse;\">\n    <!-- Header Banner: Fondo solido azul oscuro para compatibilidad con Outlook -->\n    <tr>\n      <td bgcolor=\"#0f172a\" style=\"background-color: #0f172a; padding: 20px 24px;\">\n        <table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n          <tr>\n            <td valign=\"middle\" style=\"vertical-align: middle;\">\n              ".concat(isInternal ? "\n              <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\">\n                <tr>\n                  <td bgcolor=\"#d97706\" style=\"background-color: #d97706; color: #ffffff; font-size: 9.5px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; padding: 2px 7px; border-radius: 4px;\">\n                    CONTROL INTERNO OPERATIVO\n                  </td>\n                </tr>\n              </table>" : '', "\n              <div style=\"font-size: 18px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase; margin-top: ").concat(isInternal ? '6px' : '0', ";\">\n                ").concat(data.hotelOfficial, "\n              </div>\n              <div style=\"font-size: 11px; color: #94a3b8; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;\">\n                ").concat(isInternal ? "Aviso a Comercial / Administración" : "Dpto. Reservas y Gestión de Grupos", "\n              </div>\n            </td>\n            <td valign=\"middle\" align=\"right\" style=\"vertical-align: middle; text-align: right;\">\n              <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" align=\"right\">\n                <tr>\n                  <td bgcolor=\"#1e293b\" style=\"background-color: #1e293b; border: 1px solid #334155; padding: 5px 12px; border-radius: 16px; font-size: 11px; font-weight: 700; color: #f8fafc;\">\n                    Ref #").concat(data.resId, "\n                  </td>\n                </tr>\n              </table>\n            </td>\n          </tr>\n        </table>\n      </td>\n    </tr>\n\n    <!-- Group Summary Bar -->\n    <tr>\n      <td bgcolor=\"#f8fafc\" style=\"background-color: #f8fafc; padding: 12px 24px; border-bottom: 1px solid #e2e8f0;\">\n        <div style=\"font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 3px;\">\n          ").concat(data.grupoName, "\n        </div>\n        <table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"font-size: 11.5px; color: #64748b;\">\n          <tr>\n            <td>\n              <strong>Estancia:</strong> ").concat(data.entrada || "---", " \u2794 ").concat(data.salida || "---", "\n            </td>\n            <td align=\"right\" style=\"text-align: right;\">\n              <strong>Ocupaci\xF3n:</strong> ").concat(data.pax || 0, " pax &nbsp;|&nbsp; <strong>Comercial:</strong> ").concat(data.comercial || "---", "\n            </td>\n          </tr>\n        </table>\n      </td>\n    </tr>\n\n    <!-- Content Container -->\n    <tr>\n      <td bgcolor=\"#ffffff\" style=\"background-color: #ffffff; padding: 22px 24px; font-size: 13px; line-height: 1.65; color: #334155;\">\n        \n        ").concat(hasFin ? "\n        <!-- Financial Metrics Grid -->\n        <table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom: 20px;\">\n          <tr>\n            <td bgcolor=\"#f8fafc\" width=\"31%\" style=\"background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 6px; text-align: center;\">\n              <div style=\"font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase;\">Total Contratado</div>\n              <div style=\"font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 3px;\">".concat(fmt(fin.total), "</div>\n            </td>\n            <td width=\"3%\">&nbsp;</td>\n            <td bgcolor=\"#ecfdf5\" width=\"32%\" style=\"background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px 6px; text-align: center;\">\n              <div style=\"font-size: 9px; font-weight: 800; color: #059669; text-transform: uppercase;\">Abonado / Confirmado</div>\n              <div style=\"font-size: 14px; font-weight: 800; color: #047857; margin-top: 3px;\">").concat(fmt(fin.paid), "</div>\n            </td>\n            <td width=\"3%\">&nbsp;</td>\n            <td bgcolor=\"#fff1f2\" width=\"31%\" style=\"background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px 6px; text-align: center;\">\n              <div style=\"font-size: 9px; font-weight: 800; color: #e11d48; text-transform: uppercase;\">Pendiente de Cobro</div>\n              <div style=\"font-size: 14px; font-weight: 800; color: #be123c; margin-top: 3px;\">").concat(fmt(fin.pending), "</div>\n            </td>\n          </tr>\n        </table>") : '', "\n\n        <!-- Callout Box -->\n        <table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom: 20px;\">\n          <tr>\n            <td bgcolor=\"#fef2f2\" style=\"background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 10px 14px;\">\n              <div style=\"font-size: 10px; font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;\">\n                ").concat(isInternal ? "Actuación Crítica Detectada" : "Situación / Requerimiento", "\n              </div>\n              <div style=\"font-size: 12px; font-weight: 700; color: #7f1d1d;\">\n                ").concat(((_data$alert = data.alert) === null || _data$alert === void 0 ? void 0 : _data$alert.detail) || "Revisión operativa de las condiciones acordadas.", "\n              </div>\n            </td>\n          </tr>\n        </table>\n\n        <!-- Body text -->\n        <div style=\"white-space: pre-line; margin-bottom: 20px; color: #334155; font-size: 12.5px; line-height: 1.65;\">\n          ").concat(data.body, "\n        </div>\n\n        <!-- Bank Details Card si no es interno -->\n        ").concat(!isInternal && data.hotelIban ? "\n        <table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-top: 20px;\">\n          <tr>\n            <td bgcolor=\"#0f172a\" style=\"background-color: #0f172a; border-radius: 8px; padding: 16px 20px; color: #ffffff;\">\n              <div style=\"font-size: 10px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;\">\n                \uD83D\uDCB3 Datos Oficiales para Transferencia Bancaria\n              </div>\n              <table role=\"presentation\" width=\"100%\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"font-size: 11.5px; color: #f8fafc;\">\n                <tr>\n                  <td width=\"100\" style=\"padding: 2px 0; color: #94a3b8;\"><strong>Entidad:</strong></td>\n                  <td style=\"padding: 2px 0; font-weight: 700; color: #ffffff;\">".concat(data.hotelBank, "</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 2px 0; color: #94a3b8;\"><strong>IBAN:</strong></td>\n                  <td style=\"padding: 2px 0; font-weight: 800; font-family: monospace; font-size: 13px; color: #38bdf8; letter-spacing: 1px;\">").concat(data.hotelIban, "</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 2px 0; color: #94a3b8;\"><strong>Beneficiario:</strong></td>\n                  <td style=\"padding: 2px 0; font-weight: 700; color: #ffffff;\">").concat(data.hotelOfficial, "</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 2px 0; color: #94a3b8;\"><strong>Concepto:</strong></td>\n                  <td style=\"padding: 2px 0; font-weight: 800; color: #facc15;\">Reserva #").concat(data.resId, " - ").concat(data.grupoName, "</td>\n                </tr>\n              </table>\n            </td>\n          </tr>\n        </table>") : '', "\n\n      </td>\n    </tr>\n\n    <!-- Footer -->\n    <tr>\n      <td bgcolor=\"#f8fafc\" style=\"background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; font-size: 11px; color: #64748b; text-align: center;\">\n        <strong>").concat(data.hotelOfficial, "</strong> \u2022 ").concat(isInternal ? "Sistema de Control Interno Operativo" : "Dpto. Reservas y Gestión de Grupos", " \u2022 Nexus Groups\n      </td>\n    </tr>\n  </table>\n  <!--[if mso]>\n  </td></tr></table>\n  <![endif]-->\n</center>");
  };
  var handleOpenEmailModal = function handleOpenEmailModal(alert, columnTitle) {
    var mode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "internal";
    var g = alert.group || {};
    var resId = String(g.Reserva || g.Com_Id || "").replace(/^#/, "");
    var grupoName = g["Nombre del Grupo"] || "Grupo sin nombre";
    var hotel = (g.Hotel_Asignado || g.Hotel || "").toLowerCase();
    var isCumbria = hotel.includes("cumb");
    var hotelOfficial = isCumbria ? "Cumbria Spa & Hotel" : "Sercotel Guadiana";
    var hotelBank = isCumbria ? "Caja Rural de Castilla-La Mancha" : "Globalcaja";
    var hotelIban = isCumbria ? "ES19 3081 0601 0850 0004 8966" : "ES30 3190 3953 1851 8526 3521";
    var hotelLogo = isCumbria ? "Logos/Cumbria Spa&Hotel.jpg" : "Logos/Sercotel Guadiana.jpg";
    var fin = getGroupFinancialInfo(g);
    var entrada = formatDate(g.Entrada);
    var salida = formatDate(g.Salida);
    var pax = g["Pax."] || g.Pax || 0;
    var comercial = g.Com_Comercial || "Sin asignar";

    // Detección inteligente de email del cliente
    var clientEmail = g.Com_Email_Contacto || g.Email || g.Fiscal_Email || "";
    if (!clientEmail) {
      var textToSearch = "".concat(grupoName, " ").concat(g["Empresa/Agencia"] || "");
      var match = textToSearch.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (match) clientEmail = match[0];
    }

    // Email del comercial asignado o administración por defecto
    var staffEmail = getStaffEmail(comercial) || "comunicaciones@hotelguadiana.es";
    var isFinanciera = columnTitle.toLowerCase().includes("financ");
    var isRelease = columnTitle.toLowerCase().includes("release");
    var isDatos = columnTitle.toLowerCase().includes("dato");
    var isCrm = columnTitle.toLowerCase().includes("crm") || columnTitle.toLowerCase().includes("seguimiento");
    var internalSubject = "[CONTROL INTERNO] ".concat(columnTitle, " - Reserva #").concat(resId, " (").concat(grupoName, ") - ").concat(hotelOfficial);
    var internalBody = "PARA: ".concat(comercial, " / Administraci\xF3n\nASUNTO: Control Interno - ").concat(columnTitle, "\nESTABLECIMIENTO: ").concat(hotelOfficial, "\n\nDATOS DE LA RESERVA:\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\u2022 Localizador:    #").concat(resId, "\n\u2022 Grupo:          ").concat(grupoName, "\n\u2022 Estancia:       ").concat(entrada || "---", " \u2794 ").concat(salida || "---", "\n\u2022 Ocupaci\xF3n:      ").concat(pax, " personas\n\u2022 Comercial:      ").concat(comercial, "\n\u2022 Email Cliente:  ").concat(clientEmail || "No especificado", "\n\nACTUACI\xD3N REQUERIDA (").concat(columnTitle.toUpperCase(), "):\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n").concat(alert.detail || "Revisión operativa de la situación acordada.", "\n\nESTADO ECON\xD3MICO:\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\u2022 Total Contratado:  ").concat(fmt(fin.total), "\n\u2022 Abonado / Confirm: ").concat(fmt(fin.paid), "\n\u2022 PENDIENTE:         ").concat(fmt(fin.pending), "\n\nPor favor revisar con urgencia las actuaciones necesarias para mantener la operativa al d\xEDa.");
    var clientSubject = "";
    var clientBody = "";
    if (isFinanciera) {
      clientSubject = "Recordatorio de Pago Pendiente - Reserva #".concat(resId, " (").concat(grupoName, ") - ").concat(hotelOfficial);
      clientBody = "Estimado/a cliente,\n\nNos ponemos en contacto desde el Departamento de Reservas y Grupos de ".concat(hotelOfficial, " en relaci\xF3n a la reserva del grupo \"").concat(grupoName, "\" (Localizador: #").concat(resId, "), con estancia prevista del ").concat(entrada || "---", " al ").concat(salida || "---", ".\n\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\nESTADO ECON\xD3MICO DE LA RESERVA\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\u2022 Importe Total Contratado:      ").concat(fmt(fin.total), "\n\u2022 Importe Abonado y Confirmado:  ").concat(fmt(fin.paid), "\n\u2022 Importe Pendiente de Pago:     ").concat(fmt(fin.pending), "\n\nDetalle del vencimiento pendiente:\n").concat(alert.detail || "Hito de pago pendiente según las condiciones pactadas.", "\n\nCon el fin de mantener la reserva debidamente garantizada y confirmada en nuestro sistema, le rogamos proceda a la regularizaci\xF3n del importe pendiente a la mayor brevedad posible.\n\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\nDATOS OFICIALES PARA TRANSFERENCIA BANCARIA\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\u2022 Entidad Bancaria:        ").concat(hotelBank, "\n\u2022 IBAN:                    ").concat(hotelIban, "\n\u2022 Beneficiario:            ").concat(hotelOfficial, "\n\u2022 Concepto imprescindible: Reserva #").concat(resId, " - ").concat(grupoName, "\n\nUna vez realizada la transferencia, le agradecer\xEDamos que nos remita el correspondiente justificante bancario respondiendo a este correo.\n\nAtentamente,\n").concat(comercial, "\n").concat(hotelOfficial);
    } else if (isRelease) {
      clientSubject = "Aviso de Plazo / Release - Reserva #".concat(resId, " (").concat(grupoName, ") - ").concat(hotelOfficial);
      clientBody = "Estimado/a cliente,\n\nNos ponemos en contacto desde ".concat(hotelOfficial, " con respecto a la reserva del grupo \"").concat(grupoName, "\" (Ref: #").concat(resId, "), cuya fecha de entrada est\xE1 fijada para el ").concat(entrada || "próximamente", ".\n\nSituaci\xF3n del plazo: ").concat(alert.detail, "\nImporte pendiente: ").concat(fmt(fin.pending), "\n\nA fin de mantener el bloqueo de habitaciones solicitado y no liberar autom\xE1ticamente las plazas, le rogamos nos confirme el estado final del grupo y proceda al tr\xE1mite de garant\xEDa antes de la fecha l\xEDmite.\n\nAtentamente,\n").concat(comercial, "\n").concat(hotelOfficial);
    } else if (isDatos) {
      var missingItems = alert.details ? alert.details.map(function (d) {
        return "\u2022 ".concat(d.text);
      }).join("\n") : "\u2022 ".concat(alert.detail);
      clientSubject = "Solicitud de Documentaci\xF3n Operativa - Reserva #".concat(resId, " (").concat(grupoName, ") - ").concat(hotelOfficial);
      clientBody = "Estimado/a cliente,\n\nNos ponemos en contacto desde el Departamento de Reservas de ".concat(hotelOfficial, " para ultimar los preparativos de la llegada del grupo \"").concat(grupoName, "\" (Localizador #").concat(resId, "), con fecha de entrada el ").concat(entrada || "próximamente", ".\n\nINFORMACI\xD3N PENDIENTE:\n").concat(missingItems, "\n\nLe rogamos nos haga llegar estos datos a la mayor brevedad posible.\n\nAtentamente,\n").concat(comercial, "\n").concat(hotelOfficial);
    } else if (isCrm) {
      clientSubject = "Seguimiento de Propuesta para Grupo - Reserva #".concat(resId, " (").concat(grupoName, ") - ").concat(hotelOfficial);
      clientBody = "Estimado/a cliente,\n\nLe escribimos desde ".concat(hotelOfficial, " para dar seguimiento a la propuesta para el grupo \"").concat(grupoName, "\" (Ref: #").concat(resId, "), con estancia prevista del ").concat(entrada || "---", " al ").concat(salida || "---", ".\n\nNos gustar\xEDa conocer si han tenido ocasi\xF3n de valorar las condiciones o si necesitan realizar alguna modificaci\xF3n.\n\nAtentamente,\n").concat(comercial, "\n").concat(hotelOfficial);
    } else {
      clientSubject = "Gesti\xF3n Urgente: Pr\xF3xima Llegada - Reserva #".concat(resId, " (").concat(grupoName, ") - ").concat(hotelOfficial);
      clientBody = "Estimado/a cliente,\n\nNos ponemos en contacto desde ".concat(hotelOfficial, " en relaci\xF3n a la reserva tentativa para el grupo \"").concat(grupoName, "\" (Ref: #").concat(resId, "), con fecha de entrada muy pr\xF3xima (").concat(entrada || "en los próximos días", ").\n\nSituaci\xF3n actual: ").concat(alert.detail, "\n\nDada la cercan\xEDa de la fecha de llegada, le rogamos nos confirme en firme si continuar\xE1n con la reserva antes de liberar el bloqueo de plazas.\n\nAtentamente,\n").concat(comercial, "\n").concat(hotelOfficial);
    }
    var isInternalMode = mode === "internal";
    setEmailModalTab("preview");
    setSelectedEmailAlert({
      alert: alert,
      columnTitle: columnTitle,
      mode: isInternalMode ? "internal" : "client",
      group: g,
      resId: resId,
      grupoName: grupoName,
      hotelOfficial: hotelOfficial,
      hotelLogo: hotelLogo,
      hotelBank: hotelBank,
      hotelIban: hotelIban,
      fin: fin,
      entrada: entrada,
      salida: salida,
      pax: pax,
      comercial: comercial,
      clientEmail: clientEmail,
      staffEmail: staffEmail,
      emailTo: isInternalMode ? staffEmail : clientEmail,
      subject: isInternalMode ? internalSubject : clientSubject,
      body: isInternalMode ? internalBody : clientBody,
      internalSubject: internalSubject,
      internalBody: internalBody,
      clientSubject: clientSubject,
      clientBody: clientBody
    });
  };
  var handleExecuteOpenEmail = function handleExecuteOpenEmail(data) {
    if (!data) return;
    var mailtoUrl = "mailto:".concat(encodeURIComponent(data.emailTo || ""), "?subject=").concat(encodeURIComponent(data.subject || ""), "&body=").concat(encodeURIComponent(data.body || ""));
    var updated = _objectSpread(_objectSpread({}, notifiedAlerts), {}, _defineProperty({}, data.resId, new Date().toISOString()));
    setNotifiedAlerts(updated);
    try {
      localStorage.setItem("nexus_notified_alerts", JSON.stringify(updated));
    } catch (e) {}
    window.location.href = mailtoUrl;
    setToastInfo("\u2705 Gestor de correo abierto para #".concat(data.resId, " (").concat(data.grupoName, "). Notificaci\xF3n confirmada."));
    setSelectedEmailAlert(null);
  };
  var handleCopyRichEmail = function handleCopyRichEmail(data) {
    if (!data) return;
    var htmlContent = generateRichHtmlEmail(data);
    var plainText = "Para: ".concat(data.emailTo || "(No especificado)", "\nAsunto: ").concat(data.subject, "\n\n").concat(data.body);
    var markAsNotified = function markAsNotified() {
      var updated = _objectSpread(_objectSpread({}, notifiedAlerts), {}, _defineProperty({}, data.resId, new Date().toISOString()));
      setNotifiedAlerts(updated);
      try {
        localStorage.setItem("nexus_notified_alerts", JSON.stringify(updated));
      } catch (e) {}
    };
    if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      try {
        var blobHtml = new Blob([htmlContent], {
          type: "text/html"
        });
        var blobText = new Blob([plainText], {
          type: "text/plain"
        });
        navigator.clipboard.write([new ClipboardItem({
          "text/html": blobHtml,
          "text/plain": blobText
        })]).then(function () {
          markAsNotified();
          setToastInfo("\u2728 \xA1Plantilla visual copiada! P\xE9gala directamente en Outlook o Gmail con formato y dise\xF1o.");
        }).catch(function (err) {
          console.warn("ClipboardItem write error, falling back to text:", err);
          navigator.clipboard.writeText(plainText).then(function () {
            markAsNotified();
            setToastInfo("\uD83D\uDCCB Texto copiado al portapapeles y registrado para #".concat(data.resId, "."));
          });
        });
      } catch (err) {
        navigator.clipboard.writeText(plainText).then(function () {
          markAsNotified();
          setToastInfo("\uD83D\uDCCB Texto copiado al portapapeles y registrado para #".concat(data.resId, "."));
        });
      }
    } else {
      navigator.clipboard.writeText(plainText).then(function () {
        markAsNotified();
        setToastInfo("\uD83D\uDCCB Texto copiado al portapapeles y registrado para #".concat(data.resId, "."));
      });
    }
  };
  var handleCopyEmailText = function handleCopyEmailText(data) {
    if (!data) return;
    var fullText = "Para: ".concat(data.emailTo || "(No especificado)", "\nAsunto: ").concat(data.subject, "\n\n").concat(data.body);
    navigator.clipboard.writeText(fullText).then(function () {
      var updated = _objectSpread(_objectSpread({}, notifiedAlerts), {}, _defineProperty({}, data.resId, new Date().toISOString()));
      setNotifiedAlerts(updated);
      try {
        localStorage.setItem("nexus_notified_alerts", JSON.stringify(updated));
      } catch (e) {}
      setToastInfo("\uD83D\uDCCB Texto copiado al portapapeles y registrado para #".concat(data.resId, "."));
    }).catch(function () {
      setToastInfo("❌ No se pudo copiar al portapapeles automáticamente.");
    });
  };
  var handleCopyIban = function handleCopyIban(iban) {
    if (!iban) return;
    var clean = iban.replace(/\s+/g, "");
    navigator.clipboard.writeText(clean).then(function () {
      setToastInfo("\uD83D\uDCB3 IBAN copiado al portapapeles: ".concat(clean));
    }).catch(function () {
      setToastInfo("\uD83D\uDCB3 IBAN: ".concat(iban));
    });
  };
  var AlertColumn = function AlertColumn(_ref3) {
    var title = _ref3.title,
      icon = _ref3.icon,
      colorClass = _ref3.colorClass,
      alerts = _ref3.alerts;
    var theme = {
      rose: {
        bg: "bg-rose-50/50",
        border: "border-rose-100",
        text: "text-rose-700",
        iconBg: "bg-rose-100 text-rose-600",
        bubble: "bg-rose-600 text-white",
        cardHover: "hover:border-rose-300 hover:shadow-rose-100/50"
      },
      amber: {
        bg: "bg-amber-50/50",
        border: "border-amber-100",
        text: "text-amber-800",
        iconBg: "bg-amber-100 text-amber-600",
        bubble: "bg-amber-500 text-white",
        cardHover: "hover:border-amber-300 hover:shadow-amber-100/50"
      },
      orange: {
        bg: "bg-orange-50/50",
        border: "border-orange-100",
        text: "text-orange-800",
        iconBg: "bg-orange-100 text-orange-600",
        bubble: "bg-orange-500 text-white",
        cardHover: "hover:border-orange-300 hover:shadow-orange-100/50"
      },
      indigo: {
        bg: "bg-indigo-50/50",
        border: "border-indigo-100",
        text: "text-indigo-800",
        iconBg: "bg-indigo-100 text-indigo-600",
        bubble: "bg-indigo-600 text-white",
        cardHover: "hover:border-indigo-300 hover:shadow-indigo-100/50"
      },
      violet: {
        bg: "bg-violet-50/50",
        border: "border-violet-100",
        text: "text-violet-800",
        iconBg: "bg-violet-100 text-violet-600",
        bubble: "bg-violet-600 text-white",
        cardHover: "hover:border-violet-300 hover:shadow-violet-100/50"
      }
    }[colorClass];
    return /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col rounded-[2rem] border ".concat(theme.border, " ").concat(theme.bg, " p-5 min-h-[500px] shadow-sm")
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-center mb-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-9 h-9 rounded-xl flex items-center justify-center shadow-inner ".concat(theme.iconBg)
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: icon,
      size: 16,
      strokeWidth: 2.5
    })), /*#__PURE__*/React.createElement("h3", {
      className: "text-xs font-black text-slate-800 uppercase tracking-wider"
    }, title)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
        return handleOpenSectionReportModal(title);
      },
      disabled: alerts.length === 0,
      className: "flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ".concat(alerts.length === 0 ? "opacity-30 cursor-not-allowed bg-slate-100 text-slate-400" : "bg-white/90 hover:bg-white text-slate-700 hover:text-slate-950 shadow-2xs hover:shadow-xs border border-slate-200/80 hover:border-slate-400"),
      title: "Generar informe interno de la secci\xF3n ".concat(title)
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "mail",
      size: 11,
      className: "text-slate-600"
    }), /*#__PURE__*/React.createElement("span", {
      className: "hidden sm:inline"
    }, "Enviar")), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-black px-2.5 py-1 rounded-full ".concat(theme.bubble)
    }, alerts.length))), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-4 overflow-y-auto max-h-[70vh] custom-scrollbar pr-1"
    }, alerts.map(function (alert, idx) {
      var g = alert.group;
      var isCumbria = (g.Hotel_Asignado || g.Hotel || "").toLowerCase().includes("cumb");
      var entryDate = parseDate(g.Entrada);
      var daysToArrival = null;
      if (entryDate && !isNaN(entryDate.getTime())) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
        daysToArrival = Math.round((entryDay - today) / (1000 * 60 * 60 * 24));
      }
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        onClick: function onClick() {
          localStorage.setItem("nexus_return_reserva", g.Reserva);
          window.location.href = "Gestion-de-Grupos.html?reserva=".concat(encodeURIComponent(g.Reserva));
        },
        className: "bg-white p-4 rounded-[1.5rem] border border-slate-100/80 cursor-pointer shadow-sm hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 ".concat(theme.cardHover, " flex flex-col gap-2 relative group")
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-start gap-2"
      }, /*#__PURE__*/React.createElement("img", {
        src: isCumbria ? "Logos/Cumbria Spa&Hotel.jpg" : "Logos/Sercotel Guadiana.jpg",
        alt: "Hotel Logo",
        className: "h-4 max-w-[80px] object-contain opacity-70 group-hover:opacity-100 transition-opacity mt-0.5"
      }), /*#__PURE__*/React.createElement("div", {
        className: "flex flex-col items-end gap-1 shrink-0"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-1.5"
      }, daysToArrival !== null && /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap leading-none ".concat(daysToArrival < 0 ? "bg-slate-100 text-slate-500 border border-slate-200" : daysToArrival === 0 ? "bg-rose-600 text-white font-black animate-pulse" : daysToArrival === 1 ? "bg-rose-500 text-white font-black" : daysToArrival <= 3 ? "bg-rose-50 text-rose-700 border border-rose-200 font-black" : daysToArrival <= 7 ? "bg-amber-50 text-amber-700 border border-amber-200 font-bold" : "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold")
      }, daysToArrival < 0 ? "Lleg\xF3 hace ".concat(Math.abs(daysToArrival), "d") : daysToArrival === 0 ? "¡Llega hoy!" : daysToArrival === 1 ? "Falta 1 día" : "Faltan ".concat(daysToArrival, " d\xEDas")), /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none"
      }, formatDate(g.Entrada))))), /*#__PURE__*/React.createElement("div", {
        className: "mt-1"
      }, /*#__PURE__*/React.createElement("h4", {
        className: "font-bold text-slate-800 text-xs leading-snug group-hover:text-emerald-700 transition-colors uppercase line-clamp-2",
        title: g["Nombre del Grupo"]
      }, g["Nombre del Grupo"] || "Grupo sin nombre"), /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center mt-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[8px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded"
      }, "#", g.Reserva), g.Com_Comercial && /*#__PURE__*/React.createElement("span", {
        className: "text-[8px] font-bold text-slate-400 uppercase tracking-wider"
      }, "\uD83D\uDC64 ", g.Com_Comercial))), /*#__PURE__*/React.createElement("div", {
        className: "mt-2 border-t border-slate-50 pt-2 flex flex-col gap-1.5"
      }, alert.details ? alert.details.map(function (det, dIdx) {
        return /*#__PURE__*/React.createElement("div", {
          key: dIdx,
          className: "flex items-center gap-1.5 text-[9px] font-bold text-slate-600 leading-tight"
        }, /*#__PURE__*/React.createElement(LucideIcon, {
          name: det.icon,
          size: 10,
          className: theme.text,
          strokeWidth: 2.5
        }), /*#__PURE__*/React.createElement("span", {
          className: "truncate"
        }, det.text));
      }) : /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-1.5 text-[9px] font-bold text-slate-600 leading-tight"
      }, /*#__PURE__*/React.createElement(LucideIcon, {
        name: alert.icon,
        size: 10,
        className: theme.text,
        strokeWidth: 2.5
      }), /*#__PURE__*/React.createElement("span", {
        className: "line-clamp-2",
        title: alert.detail
      }, alert.detail))), /*#__PURE__*/React.createElement("div", {
        className: "mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: function onClick(e) {
          e.stopPropagation();
          handleOpenEmailModal(alert, title);
        },
        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-wider border transition-all duration-200 shadow-2xs group/btn cursor-pointer ".concat(notifiedAlerts[String(g.Reserva || g.Com_Id || "").replace(/^#/, "")] ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-700 border-slate-200/80 hover:border-slate-900 hover:shadow-xs"),
        title: "Redactar y abrir email con detalles confirmados y pagos"
      }, /*#__PURE__*/React.createElement(LucideIcon, {
        name: notifiedAlerts[String(g.Reserva || g.Com_Id || "").replace(/^#/, "")] ? "check-circle" : "mail",
        size: 12,
        className: notifiedAlerts[String(g.Reserva || g.Com_Id || "").replace(/^#/, "")] ? "text-emerald-600" : "text-slate-500 group-hover/btn:text-white transition-colors"
      }), /*#__PURE__*/React.createElement("span", null, notifiedAlerts[String(g.Reserva || g.Com_Id || "").replace(/^#/, "")] ? "Notificado" : "Enviar Email")), /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors"
      }, "#", g.Reserva)));
    }), alerts.length === 0 && /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col items-center justify-center py-16 px-4 bg-white/50 border border-dashed border-slate-200 rounded-[1.5rem] opacity-70"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-inner"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "check",
      size: 18,
      strokeWidth: 3
    })), /*#__PURE__*/React.createElement("p", {
      className: "text-[9px] font-black uppercase text-slate-500 tracking-wider text-center"
    }, "Todo al d\xEDa"), /*#__PURE__*/React.createElement("p", {
      className: "text-[8px] text-slate-400 text-center mt-0.5"
    }, "Sin actuaciones pendientes"))));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-8 animate-fade-in relative"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden mb-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute right-0 top-0 opacity-10 translate-x-10 -translate-y-10"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "bell",
    size: 300
  })), /*#__PURE__*/React.createElement("div", {
    className: "relative z-10 max-w-2xl"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] bg-emerald-500/10 px-3 py-1.5 rounded-full"
  }, "Centro de Operaciones"), /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl font-black tracking-tight mt-4 mb-2"
  }, "Panel de Alertas y Actuaciones Cr\xEDticas"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-300 font-medium leading-relaxed"
  }, "Supervisa vencimientos financieros, plazos de release, informaci\xF3n log\xEDstica ausente y tareas CRM pendientes. Filtra por establecimiento y abre las fichas correspondientes con un clic."))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex bg-slate-100/80 p-1.5 rounded-[2rem] border border-slate-200/50 w-fit gap-1.5 shadow-sm"
  }, [{
    id: "todos",
    label: "Todos los Hoteles",
    icon: "hotel"
  }, {
    id: "guadiana",
    label: "Sercotel Guadiana",
    logo: "Logos/Sercotel Guadiana.jpg"
  }, {
    id: "cumbria",
    label: "Cumbria Spa & Hotel",
    logo: "Logos/Cumbria Spa&Hotel.jpg"
  }].map(function (hotel) {
    var active = selectedHotel === hotel.id;
    return /*#__PURE__*/React.createElement("button", {
      key: hotel.id,
      onClick: function onClick() {
        return setSelectedHotel(hotel.id);
      },
      className: "flex items-center gap-2 px-4 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-wider transition-all duration-300 ".concat(active ? "bg-white text-slate-900 shadow-md scale-102 border border-slate-100" : "text-slate-500 hover:text-slate-800 hover:bg-white/40")
    }, hotel.logo ? /*#__PURE__*/React.createElement("img", {
      src: hotel.logo,
      className: "h-4 object-contain",
      alt: hotel.label
    }) : /*#__PURE__*/React.createElement(LucideIcon, {
      name: hotel.icon,
      size: 14
    }), hotel.label, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1.5 ".concat(active ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-600")
    }, hotel.id === "todos" ? counts.total : hotel.id === "guadiana" ? counts.guadiana : counts.cumbria));
  })), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return handleOpenInternalReportModal();
    },
    className: "flex items-center gap-2.5 px-5 py-2.5 rounded-[2rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-slate-900/20 hover:shadow-xl hover:scale-102 active:scale-98 transition-all cursor-pointer border border-indigo-500/30",
    title: "Generar informe de control interno con todas las alertas clasificadas por secciones para enviar a los comerciales o administraci\xF3n"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "mail",
    size: 13
  })), /*#__PURE__*/React.createElement("span", null, "Enviar Informe Interno de Alertas"), /*#__PURE__*/React.createElement("span", {
    className: "bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs"
  }, columnsData.financialAlerts.length + columnsData.releaseAlerts.length + columnsData.logisticsAlerts.length + columnsData.crmAlerts.length + columnsData.tentativeAlerts.length))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5 items-start"
  }, /*#__PURE__*/React.createElement(AlertColumn, {
    title: "Alertas Financieras",
    icon: "credit-card",
    colorClass: "rose",
    alerts: columnsData.financialAlerts
  }), /*#__PURE__*/React.createElement(AlertColumn, {
    title: "Releases y Plazos",
    icon: "clock",
    colorClass: "amber",
    alerts: columnsData.releaseAlerts
  }), /*#__PURE__*/React.createElement(AlertColumn, {
    title: "Datos Faltantes",
    icon: "file-warning",
    colorClass: "orange",
    alerts: columnsData.logisticsAlerts
  }), /*#__PURE__*/React.createElement(AlertColumn, {
    title: "Seguimientos CRM",
    icon: "phone-call",
    colorClass: "indigo",
    alerts: columnsData.crmAlerts
  }), /*#__PURE__*/React.createElement(AlertColumn, {
    title: "Tentativas Urgentes",
    icon: "calendar-clock",
    colorClass: "violet",
    alerts: columnsData.tentativeAlerts
  })), toastInfo && /*#__PURE__*/React.createElement("div", {
    className: "fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fade-in max-w-md"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "check-circle",
    size: 18,
    className: "text-emerald-400 shrink-0"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-bold text-slate-100 leading-snug"
  }, toastInfo), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setToastInfo(null);
    },
    className: "text-slate-400 hover:text-white ml-auto text-xs p-1 cursor-pointer"
  }, "\u2715")), selectedEmailAlert && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in",
    onClick: function onClick() {
      return setSelectedEmailAlert(null);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-[2rem] border border-slate-200/80 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col my-auto max-h-[94vh] animate-slide-up",
    onClick: function onClick(e) {
      return e.stopPropagation();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "mail",
    size: 20,
    className: "text-amber-400"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 flex-wrap"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-sm font-black tracking-wide uppercase text-white"
  }, "Notificaci\xF3n Oficial"), /*#__PURE__*/React.createElement("span", {
    className: "px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider"
  }, selectedEmailAlert.columnTitle)), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-300 font-medium"
  }, selectedEmailAlert.hotelOfficial, " \u2022 Reserva #", selectedEmailAlert.resId, " (", selectedEmailAlert.grupoName, ")"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-black/40 p-1 rounded-xl border border-white/10 flex items-center gap-1 text-xs"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setEmailModalTab("preview");
    },
    className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ".concat(emailModalTab === "preview" ? "bg-white text-slate-900 shadow-md scale-102" : "text-slate-300 hover:text-white")
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "eye",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, "Vista Dise\xF1ada")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setEmailModalTab("edit");
    },
    className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ".concat(emailModalTab === "edit" ? "bg-white text-slate-900 shadow-md scale-102" : "text-slate-300 hover:text-white")
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "edit-3",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, "Modo Editor"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setSelectedEmailAlert(null);
    },
    className: "w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold cursor-pointer",
    title: "Cerrar modal"
  }, "\u2715"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 border-b border-slate-200/80 px-6 py-3 space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2 flex-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      setSelectedEmailAlert(_objectSpread(_objectSpread({}, selectedEmailAlert), {}, {
        mode: "internal",
        emailTo: selectedEmailAlert.staffEmail || "comunicaciones@hotelguadiana.es",
        subject: selectedEmailAlert.internalSubject,
        body: selectedEmailAlert.internalBody
      }));
    },
    className: "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ".concat(selectedEmailAlert.mode === "internal" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:text-slate-900")
  }, "\uD83D\uDD12 Control Interno (Comercial/Admin)"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      setSelectedEmailAlert(_objectSpread(_objectSpread({}, selectedEmailAlert), {}, {
        mode: "client",
        emailTo: selectedEmailAlert.clientEmail || "",
        subject: selectedEmailAlert.clientSubject,
        body: selectedEmailAlert.clientBody
      }));
    },
    className: "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ".concat(selectedEmailAlert.mode === "client" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900")
  }, "\u2709\uFE0F Redactar al Cliente")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 flex-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-black uppercase text-slate-400"
  }, "Para:"), [{
    label: "🏢 Admin",
    email: "comunicaciones@hotelguadiana.es"
  }, {
    label: "👤 Sergio",
    email: "ssanchez@hotelguadiana.es"
  }, {
    label: "👤 Natalio",
    email: "comunicaciones@hotelguadiana.es"
  }].concat(_toConsumableArray(selectedEmailAlert.comercial && selectedEmailAlert.comercial !== "Sin asignar" ? [{
    label: "\uD83D\uDC64 ".concat(selectedEmailAlert.comercial),
    email: selectedEmailAlert.staffEmail
  }] : []), _toConsumableArray(selectedEmailAlert.clientEmail ? [{
    label: "🏢 Cliente",
    email: selectedEmailAlert.clientEmail
  }] : [])).map(function (chip, cIdx) {
    return /*#__PURE__*/React.createElement("button", {
      key: cIdx,
      type: "button",
      onClick: function onClick() {
        return setSelectedEmailAlert(_objectSpread(_objectSpread({}, selectedEmailAlert), {}, {
          emailTo: chip.email
        }));
      },
      className: "text-[9px] font-bold px-2 py-0.5 rounded border transition-all cursor-pointer ".concat(selectedEmailAlert.emailTo === chip.email ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100")
    }, chip.label);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm:col-span-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black uppercase text-slate-500 tracking-wider"
  }, "Destinatario (Para):"), !selectedEmailAlert.emailTo && /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-bold text-rose-600 animate-pulse"
  }, "\u26A0\uFE0F Email requerido")), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("input", {
    type: "email",
    value: selectedEmailAlert.emailTo,
    onChange: function onChange(e) {
      return setSelectedEmailAlert(_objectSpread(_objectSpread({}, selectedEmailAlert), {}, {
        emailTo: e.target.value
      }));
    },
    placeholder: "ejemplo@hotelguadiana.es",
    className: "w-full pl-8 pr-3 py-1.5 bg-white border rounded-xl text-xs font-bold outline-none transition-all ".concat(!selectedEmailAlert.emailTo ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:bg-white" : "border-slate-200 text-slate-800 focus:border-indigo-500")
  }), /*#__PURE__*/React.createElement(LucideIcon, {
    name: "mail",
    size: 13,
    className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sm:col-span-7"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1"
  }, "Asunto del Correo:"), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: selectedEmailAlert.subject,
    onChange: function onChange(e) {
      return setSelectedEmailAlert(_objectSpread(_objectSpread({}, selectedEmailAlert), {}, {
        subject: e.target.value
      }));
    },
    className: "w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
  }), /*#__PURE__*/React.createElement(LucideIcon, {
    name: "file-text",
    size: 13,
    className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
  }))))), emailModalTab === "preview" ? /*#__PURE__*/React.createElement("div", {
    className: "p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-100/70"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200/90 overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 sm:p-6 text-white relative"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, selectedEmailAlert.hotelLogo && /*#__PURE__*/React.createElement("img", {
    src: selectedEmailAlert.hotelLogo,
    alt: "Logo Hotel",
    className: "h-9 max-w-[120px] object-contain bg-white/95 px-2 py-1 rounded-xl shadow-xs"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "text-base sm:text-lg font-black uppercase tracking-wide text-white"
  }, selectedEmailAlert.hotelOfficial), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] font-bold text-slate-300 uppercase tracking-wider"
  }, "Departamento de Reservas y Grupos"))), /*#__PURE__*/React.createElement("div", {
    className: "text-right shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "inline-block bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-1 rounded-full text-xs font-mono font-bold text-white shadow-xs"
  }, "Ref #", selectedEmailAlert.resId), /*#__PURE__*/React.createElement("div", {
    className: "text-[10px] text-slate-400 mt-1 font-medium"
  }, new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 border-b border-slate-100 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "font-black text-slate-800 text-sm"
  }, selectedEmailAlert.grupoName), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100"
  }, selectedEmailAlert.pax, " pax")), /*#__PURE__*/React.createElement("div", {
    className: "text-slate-500 font-semibold text-[11px]"
  }, "Estancia: ", /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-700"
  }, selectedEmailAlert.entrada || "---"), " \u2794 ", /*#__PURE__*/React.createElement("strong", {
    className: "text-slate-700"
  }, selectedEmailAlert.salida || "---"))), /*#__PURE__*/React.createElement("div", {
    className: "p-6 space-y-5"
  }, (selectedEmailAlert.fin.total > 0 || selectedEmailAlert.fin.pending > 0) && /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-3 gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-center"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-black text-slate-400 uppercase tracking-wider block"
  }, "Total Presupuesto"), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-black text-slate-800 block mt-0.5"
  }, fmt(selectedEmailAlert.fin.total)), /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-medium text-slate-400 block mt-0.5"
  }, "Contratado")), /*#__PURE__*/React.createElement("div", {
    className: "bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-center gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-black text-emerald-700 uppercase tracking-wider"
  }, "Abonado / Confirmado"), /*#__PURE__*/React.createElement(LucideIcon, {
    name: "check-circle",
    size: 11,
    className: "text-emerald-600"
  })), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-black text-emerald-700 block mt-0.5"
  }, fmt(selectedEmailAlert.fin.paid)), /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-medium text-emerald-600/80 block mt-0.5"
  }, "Cobros registrados")), /*#__PURE__*/React.createElement("div", {
    className: "bg-rose-50/80 p-3.5 rounded-2xl border border-rose-200 shadow-2xs text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-center gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-black text-rose-700 uppercase tracking-wider"
  }, "Pendiente de Cobro"), /*#__PURE__*/React.createElement(LucideIcon, {
    name: "alert-triangle",
    size: 11,
    className: "text-rose-600"
  })), /*#__PURE__*/React.createElement("span", {
    className: "text-base font-black text-rose-700 block mt-0.5"
  }, fmt(selectedEmailAlert.fin.pending)), /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-bold text-rose-600/80 block mt-0.5"
  }, "Vencimiento pendiente"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-rose-50/70 border-l-4 border-rose-500 rounded-r-2xl p-3.5 flex items-start gap-3"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "alert-circle",
    size: 16,
    className: "text-rose-600 shrink-0 mt-0.5"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black text-rose-800 uppercase tracking-wider block"
  }, "Situaci\xF3n Requerida"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-bold text-rose-900 mt-0.5 leading-relaxed"
  }, selectedEmailAlert.alert.detail))), /*#__PURE__*/React.createElement("div", {
    className: "text-xs sm:text-[13px] text-slate-700 leading-relaxed space-y-2 whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100 font-normal"
  }, selectedEmailAlert.body), selectedEmailAlert.hotelIban && /*#__PURE__*/React.createElement("div", {
    className: "bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-700"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between gap-2 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "credit-card",
    size: 16,
    className: "text-sky-400"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-black uppercase tracking-wider text-sky-300"
  }, "Datos Oficiales para Transferencia Bancaria")), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10"
  }, selectedEmailAlert.hotelBank)), /*#__PURE__*/React.createElement("div", {
    className: "space-y-2 text-xs"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-black/30 p-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-bold text-slate-400 uppercase tracking-wider block"
  }, "C\xF3digo IBAN Oficial"), /*#__PURE__*/React.createElement("span", {
    className: "font-mono font-black text-sm sm:text-base text-sky-400 tracking-wider"
  }, selectedEmailAlert.hotelIban)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return handleCopyIban(selectedEmailAlert.hotelIban);
    },
    className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-white font-bold text-[10px] border border-sky-400/30 transition-all cursor-pointer shrink-0"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "copy",
    size: 12
  }), /*#__PURE__*/React.createElement("span", null, "Copiar IBAN"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400 block text-[9px] uppercase font-bold"
  }, "Beneficiario"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-slate-200"
  }, selectedEmailAlert.hotelOfficial)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-400 block text-[9px] uppercase font-bold"
  }, "Concepto Imprescindible"), /*#__PURE__*/React.createElement("span", {
    className: "font-bold text-amber-300"
  }, "Reserva #", selectedEmailAlert.resId, " - ", selectedEmailAlert.grupoName))))), /*#__PURE__*/React.createElement("div", {
    className: "border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-bold text-slate-800"
  }, selectedEmailAlert.comercial), /*#__PURE__*/React.createElement("div", {
    className: "text-[11px] text-slate-400"
  }, "Departamento de Reservas y Grupos \u2022 ", selectedEmailAlert.hotelOfficial)), /*#__PURE__*/React.createElement("div", {
    className: "text-right text-[10px] text-slate-400 font-bold"
  }, "Nexus Groups Gold Edition"))))) : /*#__PURE__*/React.createElement("div", {
    className: "p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3 bg-white"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-xs font-black uppercase tracking-wider text-slate-700"
  }, "Editor del Cuerpo del Mensaje"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-400 mt-0.5"
  }, "Puedes personalizar o redactar libremente cualquier parte del correo antes de abrirlo o copiarlo.")), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100"
  }, "Formato Texto con Separadores")), /*#__PURE__*/React.createElement("textarea", {
    rows: 14,
    value: selectedEmailAlert.body,
    onChange: function onChange(e) {
      return setSelectedEmailAlert(_objectSpread(_objectSpread({}, selectedEmailAlert), {}, {
        body: e.target.value
      }));
    },
    className: "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-[12px] leading-relaxed text-slate-800 font-medium font-mono outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none custom-scrollbar",
    placeholder: "Redacta el mensaje aqu\xED..."
  })), /*#__PURE__*/React.createElement("div", {
    className: "p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 w-full sm:w-auto flex-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return handleCopyRichEmail(selectedEmailAlert);
    },
    className: "flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 font-black text-xs transition-all shadow-2xs cursor-pointer",
    title: "Copia el correo con dise\xF1o para pegar en Outlook o Gmail"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "sparkles",
    size: 14,
    className: "text-indigo-600"
  }), /*#__PURE__*/React.createElement("span", null, "Copiar Formato Visual")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return handleCopyEmailText(selectedEmailAlert);
    },
    className: "flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shadow-2xs cursor-pointer",
    title: "Copia el texto plano con separadores"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "copy",
    size: 14,
    className: "text-slate-500"
  }), /*#__PURE__*/React.createElement("span", null, "Copiar Texto"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 w-full sm:w-auto justify-end"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setSelectedEmailAlert(null);
    },
    className: "px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
  }, "Cerrar"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return handleExecuteOpenEmail(selectedEmailAlert);
    },
    className: "flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer w-full sm:w-auto"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "send",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "Abrir en Gestor de Correo")))))), internalReportModal && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in",
    onClick: function onClick() {
      return setInternalReportModal(null);
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-[2rem] border border-slate-200/80 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col my-auto max-h-[95vh] animate-slide-up",
    onClick: function onClick(e) {
      return e.stopPropagation();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shadow-inner shrink-0"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "mail",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 flex-wrap"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-sm font-black tracking-wide uppercase text-white"
  }, "Informe Interno de Control Operativo"), /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider"
  }, (reportData === null || reportData === void 0 ? void 0 : reportData.totalAlerts) || 0, " Alertas")), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-300 font-medium"
  }, reportData === null || reportData === void 0 ? void 0 : reportData.hotelLabel, " \u2022 Destinado a Comerciales y Administraci\xF3n"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-black/40 p-1 rounded-xl border border-white/10 flex items-center gap-1 text-xs"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setInternalReportTab("preview");
    },
    className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ".concat(internalReportTab === "preview" ? "bg-white text-slate-900 shadow-md scale-102" : "text-slate-300 hover:text-white")
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "eye",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, "Vista Dise\xF1ada")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      if (internalReportModal.customBody === null && reportData) {
        setInternalReportModal(_objectSpread(_objectSpread({}, internalReportModal), {}, {
          customBody: generateInternalReportText(reportData)
        }));
      }
      setInternalReportTab("edit");
    },
    className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black transition-all cursor-pointer ".concat(internalReportTab === "edit" ? "bg-white text-slate-900 shadow-md scale-102" : "text-slate-300 hover:text-white")
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "edit-3",
    size: 13
  }), /*#__PURE__*/React.createElement("span", null, "Modo Editor"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setInternalReportModal(null);
    },
    className: "w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold cursor-pointer",
    title: "Cerrar modal"
  }, "\u2715"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 border-b border-slate-200/80 px-6 py-3 space-y-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 flex-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black uppercase text-slate-400 tracking-wider mr-1"
  }, "Destinatarios R\xE1pidos:"), STAFF_PRESETS.map(function (p, idx) {
    return /*#__PURE__*/React.createElement("button", {
      key: idx,
      type: "button",
      onClick: function onClick() {
        return setInternalReportModal(_objectSpread(_objectSpread({}, internalReportModal), {}, {
          emailTo: p.email
        }));
      },
      className: "text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ".concat(internalReportModal.emailTo === p.email ? "bg-indigo-600 text-white border-indigo-600 shadow-xs" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"),
      title: p.desc
    }, p.label);
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sm:col-span-5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: internalReportModal.emailTo,
    onChange: function onChange(e) {
      return setInternalReportModal(_objectSpread(_objectSpread({}, internalReportModal), {}, {
        emailTo: e.target.value
      }));
    },
    placeholder: "comunicaciones@hotelguadiana.es",
    className: "w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
  }), /*#__PURE__*/React.createElement(LucideIcon, {
    name: "mail",
    size: 13,
    className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "sm:col-span-7"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: internalReportModal.subject,
    onChange: function onChange(e) {
      return setInternalReportModal(_objectSpread(_objectSpread({}, internalReportModal), {}, {
        subject: e.target.value
      }));
    },
    className: "w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 transition-all"
  }), /*#__PURE__*/React.createElement(LucideIcon, {
    name: "file-text",
    size: 13,
    className: "absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 flex-wrap"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black uppercase text-slate-400 tracking-wider mr-1"
  }, "Secciones a Incluir:"), [{
    key: "financial",
    label: "💳 Financieras",
    count: columnsData.financialAlerts.length,
    color: "text-rose-700 bg-rose-50 border-rose-200"
  }, {
    key: "release",
    label: "⏰ Releases",
    count: columnsData.releaseAlerts.length,
    color: "text-amber-700 bg-amber-50 border-amber-200"
  }, {
    key: "logistics",
    label: "📄 Datos Faltantes",
    count: columnsData.logisticsAlerts.length,
    color: "text-orange-700 bg-orange-50 border-orange-200"
  }, {
    key: "crm",
    label: "📞 CRM",
    count: columnsData.crmAlerts.length,
    color: "text-indigo-700 bg-indigo-50 border-indigo-200"
  }, {
    key: "tentative",
    label: "⏱️ Tentativas",
    count: columnsData.tentativeAlerts.length,
    color: "text-violet-700 bg-violet-50 border-violet-200"
  }].map(function (sec) {
    var isChecked = internalReportModal.sections[sec.key];
    return /*#__PURE__*/React.createElement("button", {
      key: sec.key,
      type: "button",
      onClick: function onClick() {
        return setInternalReportModal(_objectSpread(_objectSpread({}, internalReportModal), {}, {
          customBody: null,
          sections: _objectSpread(_objectSpread({}, internalReportModal.sections), {}, _defineProperty({}, sec.key, !isChecked))
        }));
      },
      className: "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ".concat(isChecked ? "".concat(sec.color, " font-black shadow-2xs") : "bg-slate-100 text-slate-400 border-slate-200 opacity-60 hover:opacity-100")
    }, /*#__PURE__*/React.createElement("span", null, isChecked ? "☑" : "☐"), /*#__PURE__*/React.createElement("span", null, sec.label), /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] px-1 py-0.2 rounded-full bg-white/70"
    }, sec.count));
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 ml-auto"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black uppercase text-slate-400 tracking-wider"
  }, "Comercial:"), /*#__PURE__*/React.createElement("select", {
    value: internalReportModal.filterComercial,
    onChange: function onChange(e) {
      return setInternalReportModal(_objectSpread(_objectSpread({}, internalReportModal), {}, {
        filterComercial: e.target.value,
        customBody: null
      }));
    },
    className: "text-[11px] font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
  }, /*#__PURE__*/React.createElement("option", {
    value: "todos"
  }, "Todos los Comerciales"), availableCommercials.map(function (com, cIdx) {
    return /*#__PURE__*/React.createElement("option", {
      key: cIdx,
      value: com
    }, com);
  }))))), internalReportTab === "preview" ? /*#__PURE__*/React.createElement("div", {
    className: "p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-100/70"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-[660px] mx-auto shadow-md rounded-2xl overflow-hidden bg-white",
    dangerouslySetInnerHTML: {
      __html: generateInternalReportHtml(reportData)
    }
  })) : /*#__PURE__*/React.createElement("div", {
    className: "p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-3 bg-white"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
    className: "text-xs font-black uppercase tracking-wider text-slate-700"
  }, "Editor del Informe de Control Interno"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-400 mt-0.5"
  }, "Edita libremente el texto del informe antes de copiarlo o abrirlo en tu gestor de correo.")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setInternalReportModal(_objectSpread(_objectSpread({}, internalReportModal), {}, {
        customBody: generateInternalReportText(reportData)
      }));
    },
    className: "text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
  }, "Restablecer Texto Original")), /*#__PURE__*/React.createElement("textarea", {
    rows: 16,
    value: internalReportModal.customBody !== null ? internalReportModal.customBody : generateInternalReportText(reportData) || "",
    onChange: function onChange(e) {
      return setInternalReportModal(_objectSpread(_objectSpread({}, internalReportModal), {}, {
        customBody: e.target.value
      }));
    },
    className: "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-[12px] leading-relaxed text-slate-800 font-medium font-mono outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none custom-scrollbar",
    placeholder: "Generando informe..."
  })), /*#__PURE__*/React.createElement("div", {
    className: "p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 w-full sm:w-auto flex-wrap"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleCopyReportRichEmail,
    className: "flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-800 font-black text-xs transition-all shadow-2xs cursor-pointer",
    title: "Copia el informe con dise\xF1o y tablas de colores para pegar directamente en Outlook o Gmail"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "sparkles",
    size: 14,
    className: "text-indigo-600"
  }), /*#__PURE__*/React.createElement("span", null, "Copiar Formato Visual")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleCopyReportText,
    className: "flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors shadow-2xs cursor-pointer",
    title: "Copia el texto estructurado del informe"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "copy",
    size: 14,
    className: "text-slate-500"
  }), /*#__PURE__*/React.createElement("span", null, "Copiar Texto"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 w-full sm:w-auto justify-end"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setInternalReportModal(null);
    },
    className: "px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
  }, "Cerrar"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleExecuteSendReport,
    className: "flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 hover:scale-102 active:scale-98 transition-all cursor-pointer w-full sm:w-auto",
    title: "Abre tu gestor de correo nativo (Outlook, Thunderbird, etc.) con el informe"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "send",
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "Abrir en Gestor de Correo")))))), /*#__PURE__*/React.createElement("footer", {
    className: "text-center py-12"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]"
  }, "Nexus Gold Edition v2.8.5 \u2022 System Normal \u2022 Refreshed at", " ", new Date().toLocaleTimeString())));
};
var GroupsManager = function GroupsManager(_ref4) {
  var data = _ref4.data,
    onUpdateStatus = _ref4.onUpdateStatus,
    onDeleteGroup = _ref4.onDeleteGroup;
  var _React$useState13 = React.useState(""),
    _React$useState14 = _slicedToArray(_React$useState13, 2),
    searchTerm = _React$useState14[0],
    setSearchTerm = _React$useState14[1];
  var filteredData = data.filter(function (group) {
    var res = String(group["Reserva"] || "").toUpperCase();
    var uid = String(group.uid || group.id || "").toUpperCase();
    var inSt = String(group["Com_Estado_Interno"] || "").toUpperCase();
    var ext = String(group["Estado"] || "").toUpperCase();
    var seg = String(group["Segment."] || "").toUpperCase();
    var isBudget = group.isBudget === true || res.startsWith("PRES-") || uid.startsWith("PRES-") || ext.includes("PRESUP") || inSt.includes("PRESUP") || seg.includes("PRESUP");
    if (isBudget && (inSt.includes("CADUC") || inSt.includes("DESESTIM") || inSt.includes("CANCEL") || inSt.includes("ANUL") || inSt.includes("BAJA") || ext.includes("CADUC") || ext.includes("DESESTIM") || ext.includes("CANCEL") || ext.includes("ANUL") || ext.includes("BAJA"))) {
      return false;
    }
    var term = searchTerm.toLowerCase();
    var name = (group["Nombre del Grupo"] || "").toLowerCase();
    var agency = (group["Empresa/Agencia"] || "").toLowerCase();
    var reserva = (group["Reserva"] || "").toString().toLowerCase();
    return name.includes(term) || agency.includes(term) || reserva.includes(term);
  });
  var getStatusProps = function getStatusProps(status) {
    var s = (status || "").toUpperCase();
    if (s.includes("ANUL") || s.includes("CANC") || s.includes("BAJA") || s.includes("DESESTIMADO") || s.includes("CADUC")) return {
      label: s.includes("CADUC") ? "Caducado" : s.includes("CANC") ? "Cancelado" : "Desestimado",
      text: "text-rose-500 bg-rose-50",
      border: "border-rose-100"
    };
    if (s.includes("CONFIRM") || s.includes("GARANT") || s.includes("RESERVA")) return {
      label: "Confirmado",
      text: "text-emerald-500 bg-emerald-50",
      border: "border-emerald-100"
    };
    if (s.includes("BLOQ") || s.includes("OPCI") || s.includes("TENTATI")) return {
      label: "Tentativa",
      text: "text-blue-500 bg-blue-50",
      border: "border-blue-100"
    };
    if (s.includes("PROSPEC") || s.includes("PENDIE")) return {
      label: "Prospect",
      text: "text-amber-500 bg-amber-50",
      border: "border-amber-100"
    };
    if (s.includes("SEGUIMIENTO")) return {
      label: "Seguimiento",
      text: "text-indigo-500 bg-indigo-50",
      border: "border-indigo-100"
    };
    if (s.includes("ENVIADO")) return {
      label: "Enviado",
      text: "text-blue-500 bg-blue-50",
      border: "border-blue-100"
    };
    if (s.includes("PRESUPUESTO")) return {
      label: "Presupuesto",
      text: "text-purple-500 bg-purple-50",
      border: "border-purple-100"
    };
    return {
      label: status,
      text: "text-slate-500 bg-slate-50",
      border: "border-slate-100"
    };
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "animate-fade-in space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-bold text-slate-800"
  }, "Directorio de Grupos"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 text-sm italic"
  }, "Accede a las herramientas de an\xE1lisis y facturaci\xF3n.")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-3 w-full md:w-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative w-full md:w-64"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "search",
    className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Buscar por nombre, agencia o reserva...",
    className: "w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-[#2d5a43] transition-colors",
    value: searchTerm,
    onChange: function onChange(e) {
      return setSearchTerm(e.target.value);
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.location.href = "Gestion-de-Grupos.html";
    },
    className: "bg-[#2d5a43] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#1e3a2c] transition-all text-sm shrink-0"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "table",
    className: "w-4 h-4"
  }), "Gestor"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
  }, filteredData.map(function (group, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between group hover:border-[#2d5a43]/30 transition-all relative overflow-hidden h-full"
    }, /*#__PURE__*/React.createElement("div", {
      className: "absolute top-2 right-2 flex gap-1 z-10"
    }, /*#__PURE__*/React.createElement("select", {
      className: "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border-none outline-none cursor-pointer shadow-sm ".concat(getStatusProps(group["Estado"] || group["Com_Estado_Interno"]).text),
      value: group["Estado"] || group["Com_Estado_Interno"] || "",
      onChange: function onChange(e) {
        return onUpdateStatus(group.id || group.Reserva, e.target.value);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "PRESUPUESTO"
    }, "Presupuesto"), /*#__PURE__*/React.createElement("option", {
      value: "ENVIADO"
    }, "Enviado"), /*#__PURE__*/React.createElement("option", {
      value: "SEGUIMIENTO"
    }, "Seguimiento"), /*#__PURE__*/React.createElement("option", {
      value: "CONFIRMADO"
    }, "Confirmado"), /*#__PURE__*/React.createElement("option", {
      value: "CANCELADO"
    }, "Cancelado"), /*#__PURE__*/React.createElement("option", {
      value: "DESESTIMADO"
    }, "Desestimado")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return onDeleteGroup(group.id || group.Reserva);
      },
      className: "w-6 h-6 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm",
      title: "Desestimar Grupo"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "trash-2",
      size: 12
    }))), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 mt-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-start mb-2"
    }, /*#__PURE__*/React.createElement("img", {
      src: (group["Hotel_Asignado"] || "").includes("Cumb") ? "Logos/Cumbria Spa&Hotel.jpg" : "Logos/Sercotel Guadiana.jpg",
      alt: "Logo",
      className: "h-6 object-contain"
    })), /*#__PURE__*/React.createElement("div", {
      className: "mb-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-bold text-slate-400 uppercase block mb-0.5"
    }, formatDate(group["Entrada"])), /*#__PURE__*/React.createElement("h4", {
      className: "font-bold text-slate-800 mb-1 cursor-pointer hover:text-[#2d5a43] transition-colors text-xs leading-tight line-clamp-2",
      onClick: function onClick() {
        var resId = group["Reserva"];
        localStorage.setItem("nexus_return_reserva", resId);
        window.location.href = "Gestion-de-Grupos.html?reserva=".concat(encodeURIComponent(resId));
      },
      title: group["Nombre del Grupo"]
    }, group["Nombre del Grupo"]), /*#__PURE__*/React.createElement("p", {
      className: "text-[9px] text-slate-400"
    }, group["Empresa/Agencia"])), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 gap-2 mb-2 bg-slate-50 p-2 rounded-xl"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[7px] font-bold text-slate-400 uppercase tracking-tighter"
    }, "Revenue (PMS)"), /*#__PURE__*/React.createElement("p", {
      className: "font-bold text-slate-700 text-xs"
    }, fmt(safeParseAmount(group["Importe(*)"] || 0)))), group.Com_ProformaTotal && /*#__PURE__*/React.createElement("div", {
      className: "text-center border-l border-slate-200"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[7px] font-bold text-emerald-500 uppercase tracking-tighter"
    }, "Proforma"), /*#__PURE__*/React.createElement("p", {
      className: "font-bold text-emerald-700 text-xs"
    }, fmt(safeParseAmount(group.Com_ProformaTotal)))), /*#__PURE__*/React.createElement("div", {
      className: "text-center border-l border-slate-200"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[7px] font-bold text-slate-400 uppercase tracking-tighter"
    }, "Pax"), /*#__PURE__*/React.createElement("p", {
      className: "font-bold text-slate-700 text-xs"
    }, group["Pax."] || 0))), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-1 mb-2"
    }, group["Com_Estado_Interno"] && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1 text-[8px] px-1.5 py-0.5 rounded border max-w-full ".concat(getStatusProps(group["Com_Estado_Interno"]).text, " ").concat(getStatusProps(group["Com_Estado_Interno"]).text.replace("bg-", "border-").replace("text-", "border-"))
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "briefcase",
      className: "w-2.5 h-2.5 shrink-0"
    }), /*#__PURE__*/React.createElement("span", {
      className: "font-bold"
    }, group["Com_Estado_Interno"])), group["Com_Vencimiento_Rel"] && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1 text-[8px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100 max-w-full"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "clock",
      className: "w-2.5 h-2.5 shrink-0"
    }), /*#__PURE__*/React.createElement("span", null, "Rel:", " ", /*#__PURE__*/React.createElement("span", {
      className: "font-bold"
    }, formatDate(group["Com_Vencimiento_Rel"]))))), group["Com_Notas"] && /*#__PURE__*/React.createElement("div", {
      className: "mb-2 text-[8px] bg-yellow-50 text-yellow-800 p-1.5 rounded-lg border border-yellow-100 flex items-start gap-1 leading-tight"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "alert-circle",
      className: "w-3 h-3 shrink-0 text-yellow-600"
    }), /*#__PURE__*/React.createElement("span", {
      className: "line-clamp-2",
      title: group["Com_Notas"]
    }, group["Com_Notas"]))), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 pt-2 border-t border-slate-50 mt-auto"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        localStorage.setItem("selectedGroup", JSON.stringify(group));
        window.location.href = "Fac Prof.html";
      },
      className: "flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold text-[9px] hover:bg-slate-50 transition-all flex items-center justify-center gap-1"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "file-text",
      className: "w-3 h-3"
    }), "Proforma"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return window.location.href = "Gestion-de-Grupos.html";
      },
      className: "p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "pencil",
      className: "w-3 h-3"
    }))));
  }), filteredData.length === 0 && /*#__PURE__*/React.createElement("p", {
    className: "col-span-full text-center py-20 text-slate-400"
  }, "No se encontraron grupos coincidiendo con tu b\xFAsqueda.")));
};
var BudgetManager = function BudgetManager(_ref5) {
  var data = _ref5.data,
    onUpdateStatus = _ref5.onUpdateStatus,
    onDeleteGroup = _ref5.onDeleteGroup;
  var _React$useState15 = React.useState(""),
    _React$useState16 = _slicedToArray(_React$useState15, 2),
    searchTerm = _React$useState16[0],
    setSearchTerm = _React$useState16[1];
  var _React$useState17 = React.useState("TODOS"),
    _React$useState18 = _slicedToArray(_React$useState17, 2),
    statusFilter = _React$useState18[0],
    setStatusFilter = _React$useState18[1];
  var budgetData = data.filter(function (g) {
    var isBudget = String(g.Reserva || "").startsWith("PRES-") || (g.Estado || "").toUpperCase().includes("PRESUPUESTO") || (g.Com_Estado_Interno || "").toUpperCase().includes("PRESUPUESTO") || (g.Com_Estado_Interno || "").toUpperCase().includes("ENVIADO") || (g.Com_Estado_Interno || "").toUpperCase().includes("SEGUIMIENTO");
    if (!isBudget) return false;
    var term = searchTerm.toLowerCase();
    var name = (g["Nombre del Grupo"] || "").toLowerCase();
    var agency = (g["Empresa/Agencia"] || "").toLowerCase();
    var reserva = (g["Reserva"] || "").toString().toLowerCase();
    var matchesSearch = name.includes(term) || agency.includes(term) || reserva.includes(term);
    var matchesStatus = statusFilter === "TODOS" || (g.Com_Estado_Interno || g.Estado || "").toUpperCase().includes(statusFilter);
    return matchesSearch && matchesStatus;
  });
  var getBudgetStatusProps = function getBudgetStatusProps(statusRaw) {
    var s = (statusRaw || "").toString().toUpperCase();
    if (s.includes("CONFIRM")) return {
      color: "bg-emerald-500",
      text: "bg-emerald-50 text-emerald-600",
      icon: "check-circle",
      label: "CONFIRMADO"
    };
    if (s.includes("DESESTIMADO") || s.includes("CANCEL") || s.includes("ANUL")) return {
      color: "bg-slate-400",
      text: "bg-slate-50 text-slate-500",
      icon: "x-circle",
      label: "DESESTIMADO"
    };
    if (s.includes("SEGUIMIENTO")) return {
      color: "bg-indigo-500",
      text: "bg-indigo-50 text-indigo-600",
      icon: "phone-forwarded",
      label: "SEGUIMIENTO"
    };
    if (s.includes("ENVIADO")) return {
      color: "bg-blue-500",
      text: "bg-blue-50 text-blue-600",
      icon: "mail",
      label: "ENVIADO"
    };
    return {
      color: "bg-amber-500",
      text: "bg-amber-50 text-amber-600",
      icon: "clock",
      label: "PENDIENTE"
    };
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "animate-fade-in space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-black text-slate-800 tracking-tight"
  }, "Seguimiento de Presupuestos"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-400 text-xs font-bold uppercase tracking-widest mt-1"
  }, "Control comercial y conversi\xF3n de leads")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-3 w-full md:w-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative flex-1 md:w-64"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "search",
    className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Buscar presupuesto...",
    className: "w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 transition-all font-medium",
    value: searchTerm,
    onChange: function onChange(e) {
      return setSearchTerm(e.target.value);
    }
  })), /*#__PURE__*/React.createElement("select", {
    value: statusFilter,
    onChange: function onChange(e) {
      return setStatusFilter(e.target.value);
    },
    className: "px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-500 text-slate-600"
  }, /*#__PURE__*/React.createElement("option", {
    value: "TODOS"
  }, "Todos los Estados"), /*#__PURE__*/React.createElement("option", {
    value: "PENDIENTE"
  }, "Pendientes"), /*#__PURE__*/React.createElement("option", {
    value: "ENVIADO"
  }, "Enviados"), /*#__PURE__*/React.createElement("option", {
    value: "SEGUIMIENTO"
  }, "En Seguimiento"), /*#__PURE__*/React.createElement("option", {
    value: "CONFIRMADO"
  }, "Confirmados"), /*#__PURE__*/React.createElement("option", {
    value: "DESESTIMADO"
  }, "Desestimados")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.location.href = "AltaEmail.html";
    },
    className: "bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "plus",
    className: "w-4 h-4"
  }), "Nuevo"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
  }, budgetData.map(function (budget, i) {
    var st = getBudgetStatusProps(budget.Com_Estado_Interno || budget.Estado);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all flex flex-col group relative overflow-hidden h-fit"
    }, /*#__PURE__*/React.createElement("div", {
      className: "absolute top-2 right-2 flex gap-1 z-10"
    }, /*#__PURE__*/React.createElement("select", {
      className: "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border-none outline-none cursor-pointer shadow-sm ".concat(getStatusProps(budget.Com_Estado_Interno || budget.Estado).text),
      value: budget.Com_Estado_Interno || budget.Estado || "",
      onChange: function onChange(e) {
        return onUpdateStatus(budget.id || budget.Reserva, e.target.value);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "PRESUPUESTO"
    }, "Presupuesto"), /*#__PURE__*/React.createElement("option", {
      value: "ENVIADO"
    }, "Enviado"), /*#__PURE__*/React.createElement("option", {
      value: "SEGUIMIENTO"
    }, "Seguimiento"), /*#__PURE__*/React.createElement("option", {
      value: "CONFIRMADO"
    }, "Confirmado"), /*#__PURE__*/React.createElement("option", {
      value: "CANCELADO"
    }, "Cancelado"), /*#__PURE__*/React.createElement("option", {
      value: "DESESTIMADO"
    }, "Desestimado")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return onDeleteGroup(budget.id || budget.Reserva);
      },
      className: "w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm",
      title: "Desestimar Presupuesto"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "trash-2",
      size: 14
    }))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-start gap-3 mb-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ".concat(st.text, " border border-current opacity-20")
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: st.icon,
      size: 20
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 min-w-0"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-0.5"
    }, "ID: ", budget.Reserva), /*#__PURE__*/React.createElement("h4", {
      className: "text-xs font-black text-slate-800 uppercase leading-tight line-clamp-2"
    }, budget["Nombre del Grupo"]))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 gap-4 mb-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded-2xl"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1"
    }, "Importe Est."), /*#__PURE__*/React.createElement("p", {
      className: "text-sm font-black text-indigo-700"
    }, fmt(safeParseAmount(budget["Importe(*)"] || budget.Com_ProformaTotal || 0)))), /*#__PURE__*/React.createElement("div", {
      className: "text-center border-l border-slate-200"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1"
    }, "Personas"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm font-black text-slate-700"
    }, budget["Pax."] || 0)))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3 mb-6 flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 text-slate-500"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "building-2",
      size: 14,
      className: "shrink-0"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold uppercase"
    }, budget["Empresa/Agencia"] || "Contacto Directo")), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 text-slate-500"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "users",
      size: 14,
      className: "shrink-0"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold uppercase"
    }, budget["Pax."], " Pax \u2022 ", budget["Régimen"])), budget.Com_Email_Contacto && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 text-slate-400"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "mail",
      size: 14,
      className: "shrink-0"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold lowercase italic"
    }, budget.Com_Email_Contacto))), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 pt-4 border-t border-slate-50"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        window.location.href = "Gestion-de-Grupos.html?reserva=" + budget.Reserva;
      },
      className: "px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center shadow-lg shadow-emerald-100",
      title: "Abrir en Panel de Gesti\xF3n"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "external-link",
      size: 14
    })), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        try {
          localStorage.setItem("selectedGroup", JSON.stringify(budget));
          console.log("Guardado en localStorage p/ edición:", budget.Reserva);
        } catch (e) {
          console.warn("LocalStorage bloqueado:", e);
        }
        window.location.href = "AltaEmail.html?edit=" + encodeURIComponent(budget.Reserva);
      },
      className: "flex-1 py-2.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "edit-3",
      size: 14
    }), "Editar"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        localStorage.setItem("selectedGroup", JSON.stringify(budget));
        window.location.href = "Fac Prof.html";
      },
      className: "px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center shadow-lg shadow-indigo-100",
      title: "Ver Proforma"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "file-text",
      size: 14
    }))));
  }), budgetData.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "col-span-full py-32 text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center gap-4 opacity-20"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "clipboard-x",
    size: 64
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-black uppercase tracking-[0.3em]"
  }, "No hay presupuestos en esta secci\xF3n")))));
};
var App = function App() {
  var _useState = useState("dashboard"),
    _useState2 = _slicedToArray(_useState, 2),
    activeTab = _useState2[0],
    setActiveTab = _useState2[1];
  var _useState3 = useState([]),
    _useState4 = _slicedToArray(_useState3, 2),
    data = _useState4[0],
    setData = _useState4[1];
  var _useState5 = useState([]),
    _useState6 = _slicedToArray(_useState5, 2),
    arrivals = _useState6[0],
    setArrivals = _useState6[1];
  var _useState7 = useState(30),
    _useState8 = _slicedToArray(_useState7, 2),
    timeRange = _useState8[0],
    setTimeRange = _useState8[1];
  var _useState9 = useState({
      revenue: "0€",
      groups: 0,
      pending: 0,
      pax: 0
    }),
    _useState0 = _slicedToArray(_useState9, 2),
    stats = _useState0[0],
    setStats = _useState0[1];
  var _useState1 = useState(null),
    _useState10 = _slicedToArray(_useState1, 2),
    successToast = _useState10[0],
    setSuccessToast = _useState10[1];
  var handleUpdateStatus = /*#__PURE__*/function () {
    var _ref6 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(groupId, newStatus) {
      var docId, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            _context.p = 0;
            docId = String(groupId || "").trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");
            _context.n = 1;
            return db.collection("groups").doc(docId).set({
              Estado: newStatus,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, {
              merge: true
            });
          case 1:
            setSuccessToast("Estado actualizado a ".concat(newStatus));
            setTimeout(function () {
              return setSuccessToast(null);
            }, 3000);
            _context.n = 3;
            break;
          case 2:
            _context.p = 2;
            _t = _context.v;
            console.error("Error updating status:", _t);
          case 3:
            return _context.a(2);
        }
      }, _callee, null, [[0, 2]]);
    }));
    return function handleUpdateStatus(_x2, _x3) {
      return _ref6.apply(this, arguments);
    };
  }();
  var handleDeleteGroup = /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(groupId) {
      var docId, _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            if (!window.confirm("¿Estás seguro de que deseas desestimar este grupo?")) {
              _context2.n = 4;
              break;
            }
            _context2.p = 1;
            docId = String(groupId || "").trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");
            _context2.n = 2;
            return db.collection("groups").doc(docId).set({
              Estado: "DESESTIMADO",
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, {
              merge: true
            });
          case 2:
            setSuccessToast("Grupo desestimado correctamente");
            setTimeout(function () {
              return setSuccessToast(null);
            }, 3000);
            _context2.n = 4;
            break;
          case 3:
            _context2.p = 3;
            _t2 = _context2.v;
            console.error("Error deleting group:", _t2);
          case 4:
            return _context2.a(2);
        }
      }, _callee2, null, [[1, 3]]);
    }));
    return function handleDeleteGroup(_x4) {
      return _ref7.apply(this, arguments);
    };
  }();

  // Detectar redireccion desde AltaEmail con petición enviada
  useEffect(function () {
    setTimeout(function () {
      return setSuccessToast(null);
    }, 5000);
  }, []);
  var getStatusProps = function getStatusProps(statusRaw) {
    var s = (statusRaw || "").toString().toUpperCase();
    if (s.includes("CONFIRM") || s.includes("GARANT") || s.includes("RESERVA")) return {
      color: "bg-emerald-500",
      text: "bg-emerald-50 text-emerald-600",
      label: s || "CONFIRMADO"
    };
    if (s.includes("BLOQ") || s.includes("OPCI") || s.includes("TIEMPO") || s.includes("TENTATI")) return {
      color: "bg-indigo-500",
      text: "bg-indigo-50 text-indigo-600",
      label: s || "BLOQUEADO"
    };
    if (s.includes("ENVIAD") || s.includes("COTIZ") || s.includes("OFERT")) return {
      color: "bg-blue-400",
      text: "bg-blue-50 text-blue-600",
      label: s || "ENVIADO"
    };
    if (s.includes("ANUL") || s.includes("CANC") || s.includes("BAJA") || s.includes("DESESTIMADO")) return {
      color: "bg-red-400 opacity-60",
      text: "bg-red-50 text-red-500",
      label: s || "CANCELADO"
    };
    if (s.includes("SEGUIMIENTO")) return {
      color: "bg-indigo-500",
      text: "bg-indigo-50 text-indigo-600",
      label: s || "SEGUIMIENTO"
    };
    if (s.includes("PROSPEC") || s.includes("PENDIE") || s.includes("PRESUPUESTO")) return {
      color: "bg-amber-500",
      text: "bg-amber-50 text-amber-600",
      label: s || "PROSPECTO"
    };
    return {
      color: "bg-slate-400",
      text: "bg-slate-50 text-slate-500",
      label: s || "ACTIVO"
    };
  };

  // Generar Alertas Dinámicas
  var alerts = useMemo(function () {
    var list = [];
    var now = new Date();
    var sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(now.getDate() + 7);
    var fortyEightHours = 48 * 60 * 60 * 1000;

    // 1. Alerta de Vencimiento de Proformas (basado en Com_Vencimiento_Rel)
    data.forEach(function (g) {
      var groupName = g["Nombre del Grupo"] || g["Reserva"] || "Grupo";
      var arrival = g["Entrada"] ? g["Entrada"] instanceof Date ? g["Entrada"] : new Date(g["Entrada"]) : null;
      var status = ((g["Status"] || "") + " " + (g["Estado"] || "") + " " + (g["Com_Estado_Interno"] || "")).toUpperCase();
      var isCancelled = ["CANCEL", "ANUL", "BAJA", "DESESTIMADO", "GASTOS"].some(function (s) {
        return status.includes(s);
      });
      var departureStr = g["Salida"] || g["Entrada"] || "";
      var todayStr = new Date().toISOString().split("T")[0];
      var isPast = departureStr && departureStr < todayStr;
      if (isCancelled || isPast) return;
      var isCredito = _isCreditoGroup(g);
      var isConfirmed = ["CONFIRM", "OK", "GARANT", "RESERVA", "GRUPO"].some(function (s) {
        return status.includes(s);
      });
      var fin = getGroupFinancialInfo(g);
      var totalAmt = fin.total;
      var paidAmt = fin.paid;
      var pendingAmt = fin.pending;
      var needsReleaseCheck = !isConfirmed && !isCredito && pendingAmt > 0.1;

      // Alert 1: Release Urgente (< 7 días)
      if (needsReleaseCheck) {
        var dRel = null;
        if (g["Com_Vencimiento_Rel"]) {
          var val = g["Com_Vencimiento_Rel"];
          var num = parseFloat(val);
          if (!isNaN(num) && num > 40000 && num < 60000) dRel = new Date(Math.round((num - 25569) * 86400 * 1000));else dRel = new Date(val);
        }
        if (dRel && !isNaN(dRel.getTime())) {
          var diff = dRel - now;
          if (diff > 0 && diff < fortyEightHours) {
            list.push({
              label: "Release 48h: ".concat(groupName),
              icon: "Clock",
              type: "danger",
              group: g
            });
          } else if (dRel <= sevenDaysFromNow) {
            list.push({
              label: "Vence Release: ".concat(groupName),
              icon: "Clock",
              type: "warning",
              group: g
            });
          }
        }
      }

      // Alert 2: Seguimiento Pendiente
      var dFollow = null;
      if (g["Com_Seguimiento"]) {
        var _val = g["Com_Seguimiento"];
        var _num = parseFloat(_val);
        if (!isNaN(_num) && _num > 40000 && _num < 60000) dFollow = new Date(Math.round((_num - 25569) * 86400 * 1000));else dFollow = new Date(_val);
      }
      if (dFollow && !isNaN(dFollow.getTime()) && dFollow <= now) {
        list.push({
          label: "Seguimiento: ".concat(groupName),
          icon: "Phone",
          type: "info",
          group: g
        });
      }

      // Alert 3: Pagos Pendientes (ignorar si es crédito)
      if (!isCredito) {
        try {
          var plan = JSON.parse(g.PaymentPlan_JSON || "[]");
          var hasPending = plan.some(function (p) {
            var pDate = p.date ? new Date(p.date) : null;
            return p.status !== "Cobrado" && pDate && pDate <= now;
          });
          if (hasPending) {
            list.push({
              label: "Pago Atrasado: ".concat(groupName),
              icon: "AlertTriangle",
              type: "danger",
              group: g
            });
          }
        } catch (e) {}
      }

      // Alert 4: Tentativa próxima a llegada
      var isTentative = (g["Estado"] || "").toLowerCase().includes("tentat") || (g["Com_Estado_Interno"] || "").toLowerCase().includes("tentat");
      var entryDate = arrival;
      if (isTentative && entryDate && !isNaN(entryDate.getTime()) && entryDate <= sevenDaysFromNow) {
        list.push({
          label: "Confirmar Urgente: ".concat(groupName),
          icon: "Calendar",
          type: "warning",
          group: g
        });
      }

      // Alert 5: Presupuesto sin comercial (Sin valorar)
      var gStatus = (g.Com_Estado_Interno || g.Estado || "").toLowerCase();
      var gCom = (g.Com_Comercial || "").trim();
      var isBudget = gStatus.includes("presup") || gStatus.includes("pend") || String(g.Reserva || "").startsWith("PRES-");
      if (isBudget && !gCom) {
        list.push({
          label: "Sin Comercial: ".concat(groupName),
          icon: "UserPlus",
          type: "danger",
          group: g
        });
      }
    });

    // 5. Alerta de Sincronización Reciente (Global)
    var recentCount = data.filter(function (g) {
      if (!g.updatedAt) return false;
      var updateDate = g.updatedAt.toDate ? g.updatedAt.toDate() : new Date(g.updatedAt);
      return now - updateDate < 15 * 60 * 1000;
    }).length;
    if (recentCount > 0) {
      list.push({
        label: "".concat(recentCount, " registros sincronizados"),
        icon: "RefreshCw",
        type: "success",
        group: null
      });
    }
    return list.slice(0, 5); // Mostrar top 5 más urgentes
  }, [data]);

  // Estados para IA
  var _useState11 = useState(false),
    _useState12 = _slicedToArray(_useState11, 2),
    isAiModalOpen = _useState12[0],
    setIsAiModalOpen = _useState12[1];
  var _useState13 = useState(false),
    _useState14 = _slicedToArray(_useState13, 2),
    isAiLoading = _useState14[0],
    setIsAiLoading = _useState14[1];
  var _useState15 = useState(""),
    _useState16 = _slicedToArray(_useState15, 2),
    aiResult = _useState16[0],
    setAiResult = _useState16[1];
  var runStrategicAnalysis = /*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
      var analysis, _t3;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            setIsAiModalOpen(true);
            setIsAiLoading(true);
            _context3.p = 1;
            _context3.n = 2;
            return analizarGrupos(data);
          case 2:
            analysis = _context3.v;
            setAiResult(analysis);
            _context3.n = 4;
            break;
          case 3:
            _context3.p = 3;
            _t3 = _context3.v;
            console.error("Error en análisis IA:", _t3);
            setAiResult("### Error Detectado\n**Detalles t\xE9cnicos:** ".concat(_t3.message, "\n\n*Posible soluci\xF3n:* Verifica que la API Key tenga activada la \"Generative Language API\" y que las restricciones de sitio web incluyan tu URL actual."));
          case 4:
            _context3.p = 4;
            setIsAiLoading(false);
            return _context3.f(4);
          case 5:
            return _context3.a(2);
        }
      }, _callee3, null, [[1, 3, 4, 5]]);
    }));
    return function runStrategicAnalysis() {
      return _ref8.apply(this, arguments);
    };
  }();
  useEffect(function () {
    var unsubscribe = db.collection("groups").onSnapshot(function (snapshot) {
      var parsed = [];
      snapshot.forEach(function (doc) {
        var row = doc.data();
        // Normalización de Segmentos
        var seg = (row["Segment."] || "").toString().trim().toUpperCase();
        if (seg === "GRTANTEO" || seg === "GRUPO TANTEO") {
          row["Segment."] = "GRUPO TANTEO";
        }
        parsed.push(row);
      });
      if (parsed.length > 0) {
        setData(parsed);

        // 1. Helper de Procesamiento
        var parseDate = function parseDate(val) {
          if (!val) return new Date(8640000000000000);
          if (val instanceof Date) return val;
          var str = String(val);

          // Caso: Excel Date Number (Ej: 45690)
          if (!isNaN(str) && str.length > 4 && !str.includes("/") && !str.includes("-")) {
            var excelEpoch = new Date(1899, 11, 30);
            excelEpoch.setDate(excelEpoch.getDate() + parseInt(str));
            return excelEpoch;
          }
          var parts = str.split(/[\/-]/);
          if (parts.length === 3) {
            // YYYY-MM-DD
            if (parts[0].length === 4) return new Date(parts[0], parts[1] - 1, parts[2]);
            // DD-MM-YYYY
            return new Date(parts[2], parts[1] - 1, parts[0]);
          }
          var d = new Date(str);
          return isNaN(d.getTime()) ? new Date(8640000000000000) : d;
        };

        // 2. Calcular Alerts Reales
        var totalRev = 0;
        var now = new Date();
        var sevenDaysFromNow = new Date(now);
        sevenDaysFromNow.setDate(now.getDate() + 7);
        var realAlerts = [];
        parsed.forEach(function (g) {
          var val = g["Importe(*)"] || g["Importe"] || g["Total_Importe_Facturable"] || "0";
          totalRev += safeParseAmount(val);
          var groupName = g["Nombre del Grupo"] || g["Reserva"] || "Grupo";
          var arrival = parseDate(g["Entrada"]);
          var status = ((g["Status"] || "") + " " + (g["Estado"] || "") + " " + (g["Com_Estado_Interno"] || "")).toUpperCase();
          var isCancelled = ["CANCEL", "ANUL", "BAJA", "DESESTIMADO", "GASTOS"].some(function (s) {
            return status.includes(s);
          });
          var departureStr = g["Salida"] || g["Entrada"] || "";
          var todayStr = now.toISOString().split("T")[0];
          var isPast = departureStr && departureStr < todayStr;
          if (isCancelled || isPast) return;
          var isCredito = _isCreditoGroup(g);
          var isConfirmed = ["CONFIRM", "OK", "GARANT", "RESERVA", "GRUPO"].some(function (s) {
            return status.includes(s);
          });
          var fin = getGroupFinancialInfo(g);
          var totalAmt = fin.total;
          var paidAmt = fin.paid;
          var pendingAmt = fin.pending;
          var needsReleaseCheck = !isConfirmed && !isCredito && pendingAmt > 0.1;

          // Alert 1: Release Urgente (< 7 días)
          if (needsReleaseCheck) {
            var comRel = g.Com_Vencimiento_Rel ? parseDate(g.Com_Vencimiento_Rel) : null;
            if (comRel && !isNaN(comRel.getTime()) && comRel <= sevenDaysFromNow) {
              realAlerts.push({
                label: "Vence Release: ".concat(groupName),
                icon: "Clock",
                type: "warning"
              });
            }
          }

          // Alert 2: Seguimiento Pendiente
          var followUp = g.Com_Seguimiento ? parseDate(g.Com_Seguimiento) : null;
          if (followUp && !isNaN(followUp.getTime()) && followUp <= now) {
            realAlerts.push({
              label: "Seguimiento: ".concat(groupName),
              icon: "Phone",
              type: "info"
            });
          }

          // Alert 3: Pagos Pendientes (ignorar si es crédito)
          if (!isCredito) {
            try {
              var plan = JSON.parse(g.PaymentPlan_JSON || "[]");
              var hasPending = plan.some(function (p) {
                var pDate = parseDate(p.date);
                return p.status !== "Cobrado" && pDate <= now;
              });
              if (hasPending) {
                realAlerts.push({
                  label: "Pago Atrasado: ".concat(groupName),
                  icon: "AlertTriangle",
                  type: "danger",
                  group: g
                });
              }
            } catch (e) {}
          }

          // Alert 4: Tentativa próxima a llegada
          var isTentative = (g["Estado"] || "").toLowerCase().includes("tentat") || (g["Com_Estado_Interno"] || "").toLowerCase().includes("tentat");
          if (isTentative && arrival <= sevenDaysFromNow) {
            realAlerts.push({
              label: "Confirmar Urgente: ".concat(groupName),
              icon: "Calendar",
              type: "warning",
              group: g
            });
          }
        });

        // setAlerts(realAlerts.slice(0, 5)); // Mostrar top 5 - Eliminado porque alerts es useMemo

        var getGroupDate = function getGroupDate(g) {
          return parseDate(g["Entrada"] || g["ENTRADA"] || g["Fecha Entrada"] || g["Com_Entrada"]);
        };
        var months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        var currentMonthIdx = now.getMonth();
        var currentYear = now.getFullYear();
        var groupsByMonth = {};
        parsed.forEach(function (g) {
          var entryDate = getGroupDate(g);
          var status = ((g["Estado"] || "") + " " + (g["Com_Estado_Interno"] || "")).toLowerCase();
          var isCancelled = ["CANCEL", "ANUL", "GASTOS", "DESESTIMADO", "BAJA"].some(function (s) {
            return status.includes(s);
          });
          if (entryDate && !isNaN(entryDate.getTime()) && !isCancelled) {
            var y = entryDate.getFullYear();
            var m = entryDate.getMonth();
            var key = "".concat(y, "-").concat(m);
            groupsByMonth[key] = (groupsByMonth[key] || 0) + 1;
          }
        });
        var trendData = [];
        // Generar previsión para los próximos 9 meses
        for (var i = 0; i < 9; i++) {
          var d = new Date(currentYear, currentMonthIdx + i, 1);
          var y = d.getFullYear();
          var m = d.getMonth();
          var key = "".concat(y, "-").concat(m);
          trendData.push({
            name: "".concat(months[m], " ").concat(y.toString().slice(-2)),
            val: groupsByMonth[key] || 0
          });
        }
        var unattendedCount = 0;
        var processedGroups = new Set();
        parsed.forEach(function (p) {
          var resId = p["Reserva"] || p["Nombre del Grupo"];
          if (!processedGroups.has(resId)) {
            processedGroups.add(resId);
            var status = ((p["Estado"] || "") + " " + (p["Com_Estado_Interno"] || "")).toLowerCase();
            var com = (p["Com_Comercial"] || "").trim();
            var isBudget = status.includes("presup") || status.includes("pend") || String(resId).startsWith("PRES-");
            var isCancelled = ["cancel", "anul", "baja", "desestimado", "gastos"].some(function (s) {
              return status.includes(s);
            });
            if (isBudget && !com && !isCancelled) {
              unattendedCount++;
            }
          }
        });
        setStats({
          revenue: new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(totalRev),
          groups: new Set(parsed.map(function (p) {
            return p["Nombre del Grupo"] || p["Reserva"];
          })).size,
          pending: parsed.filter(function (p) {
            var status = ((p["Estado"] || "") + " " + (p["Com_Estado_Interno"] || "")).toLowerCase() + " " + (p["Segment."] || "").toLowerCase();
            var isCancelled = ["CANCEL", "ANUL", "GASTOS", "DESESTIMADO", "BAJA", "DESCART", "RECHAZ"].some(function (s) {
              return status.toUpperCase().includes(s);
            });
            if (isCancelled) return false;
            var val = p["Importe(*)"] || p["Importe"] || p["Total_Importe_Facturable"] || "0";
            var rawVal = String(val).trim();
            var isZero = rawVal === "" || rawVal === "0" || rawVal === "0,00" || rawVal === "0.00" || Number(rawVal) === 0;
            return (status.includes("presup") || status.includes("pend") || String(p["Reserva"]).startsWith("PRES.")) && isZero;
          }).length,
          pax: parsed.reduce(function (acc, curr) {
            return acc + (parseInt(curr["Pax."]) || 0);
          }, 0),
          releaseAlerts: realAlerts.filter(function (a) {
            return a.label.includes("Release");
          }).length,
          followUpAlerts: realAlerts.filter(function (a) {
            return a.label.includes("Seguimiento");
          }).length,
          unattendedQuotes: unattendedCount,
          trendData: trendData
        });

        // 4. Calcular Próximas Llegadas
        var startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        var endOfRange = new Date(startOfToday);
        endOfRange.setDate(startOfToday.getDate() + timeRange);
        var arrivalsList = parsed.filter(function (p) {
          var entryDate = getGroupDate(p);
          var status = ((p["Estado"] || "") + " " + (p["Com_Estado_Interno"] || "")).toUpperCase();
          var isCancelled = ["CANCEL", "ANUL", "BAJA", "DESESTIMADO", "GASTOS"].some(function (s) {
            return status.includes(s);
          });
          // Ensure entryDate is valid and within range
          return entryDate && !isNaN(entryDate.getTime()) && entryDate >= startOfToday && entryDate <= endOfRange && !isCancelled;
        }).sort(function (a, b) {
          return getGroupDate(a) - getGroupDate(b);
        }).slice(0, 30);
        setArrivals(arrivalsList);
      }
    });
    return function () {
      return unsubscribe();
    };
  }, [timeRange]);
  useEffect(function () {
    // Ya no es necesario llamar a lucide.createIcons() globalmente
    // porque usamos el componente LucideIcon que lo maneja de forma segura
  }, [activeTab, data]);
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen"
  }, successToast && /*#__PURE__*/React.createElement("div", {
    className: "fixed top-6 right-6 z-50 flex items-start gap-3 bg-white border-2 border-emerald-400 rounded-2xl shadow-2xl shadow-emerald-100 px-6 py-4 max-w-sm animate-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0 text-emerald-600"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "check-circle",
    size: 22
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-black text-emerald-700 uppercase tracking-widest mb-0.5"
  }, "\xA1Petici\xF3n Procesada!"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-semibold text-slate-800 truncate"
  }, successToast), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-400 mt-0.5"
  }, "La solicitud de presupuesto se ha enviado correctamente.")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setSuccessToast(null);
    },
    className: "text-slate-300 hover:text-slate-500 transition-colors shrink-0 mt-0.5"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "x",
    size: 16
  }))), /*#__PURE__*/React.createElement(Sidebar, {
    activeTab: activeTab,
    setActiveTab: setActiveTab
  }), /*#__PURE__*/React.createElement("main", {
    className: "ml-64 p-8 md:p-12 ".concat(activeTab === "dashboard" ? "bg-gradient-to-b from-slate-50/50 to-transparent" : "")
  }, activeTab === "dashboard" && /*#__PURE__*/React.createElement(Dashboard, {
    arrivals: arrivals,
    stats: stats,
    alerts: alerts,
    data: data,
    onRunAnalysis: runStrategicAnalysis,
    timeRange: timeRange,
    onRangeChange: setTimeRange
  }), activeTab === "groups" && /*#__PURE__*/React.createElement(GroupsManager, {
    data: data,
    onUpdateStatus: handleUpdateStatus,
    onDeleteGroup: handleDeleteGroup
  }), activeTab === "budgets" && /*#__PURE__*/React.createElement(BudgetManager, {
    data: data,
    onUpdateStatus: handleUpdateStatus,
    onDeleteGroup: handleDeleteGroup
  }), activeTab === "analytics" && /*#__PURE__*/React.createElement("div", {
    className: "space-y-8 animate-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-20 h-20 bg-emerald-50 text-[#2d5a43] rounded-full flex items-center justify-center mx-auto mb-6"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "sparkles",
    className: "w-10 h-10"
  })), /*#__PURE__*/React.createElement("h2", {
    className: "text-3xl font-bold text-slate-900 mb-4"
  }, "An\xE1lisis Estrat\xE9gico IA"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 max-w-lg mx-auto mb-10"
  }, "Utiliza la potencia de Gemini 2.5 Flash para obtener una visi\xF3n profunda de la rentabilidad, riesgos y oportunidades de tus grupos actuales."), /*#__PURE__*/React.createElement("button", {
    onClick: runStrategicAnalysis,
    className: "bg-[#2d5a43] text-white px-10 py-5 rounded-2xl font-bold shadow-xl shadow-emerald-900/20 hover:scale-[1.02] transition-all flex items-center gap-3 mx-auto"
  }, "Generar Nuevo Informe IA", /*#__PURE__*/React.createElement(LucideIcon, {
    name: "zap",
    className: "w-4 h-4"
  })))), (activeTab === "invoices" || activeTab === "settings") && /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center justify-center h-[60vh] animate-fade-in text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "construction",
    className: "w-8 h-8 text-[#2d5a43]"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-slate-800"
  }, "Acceso a m\xF3dulo externo"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 mb-8 max-w-sm"
  }, "Esta secci\xF3n utiliza las herramientas din\xE1micas del gestor. Redirigiendo..."), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.location.href = activeTab === "invoices" ? "Proformas.html" : "Gestion-de-Grupos.html";
    },
    className: "bg-slate-900 px-8 py-4 rounded-2xl text-white font-bold hover:bg-slate-800 transition-all shadow-xl"
  }, "Abrir", " ", activeTab === "invoices" ? "Módulo de Facturación" : "Gestor de Grupos"))), isAiModalOpen && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in no-print"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-12 h-12 bg-[#2d5a43] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/20"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "sparkles",
    className: "w-6 h-6"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-2xl font-bold text-slate-900 tracking-tight"
  }, "An\xE1lisis Estrat\xE9gico IA"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 font-medium uppercase tracking-widest"
  }, "Motor: Gemini 2.5 Flash"))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setIsAiModalOpen(false);
    },
    className: "w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-slate-100 text-slate-400 transition-all"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "x",
    className: "w-6 h-6"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto p-12 custom-scrollbar"
  }, isAiLoading ? /*#__PURE__*/React.createElement("div", {
    className: "h-64 flex flex-col items-center justify-center gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "spinner"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 font-semibold animate-pulse tracking-wide text-center"
  }, "Analizando todos los grupos en tiempo real...", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-normal uppercase mt-2 block"
  }, "Consultando Firestore \"groups\""))) : /*#__PURE__*/React.createElement("div", {
    className: "prose max-w-none text-slate-700 leading-relaxed",
    dangerouslySetInnerHTML: {
      __html: marked.parse(aiResult)
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-400 italic"
  }, "Este informe se basa en los grupos activos en Firestore."), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setIsAiModalOpen(false);
    },
    className: "px-8 py-3 bg-[#2d5a43] text-white font-bold rounded-2xl hover:bg-[#1e3a2c] transition-all shadow-lg"
  }, "Cerrar Informe")))));
};
var root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/*#__PURE__*/React.createElement(App, null));