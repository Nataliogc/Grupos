"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
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
var formatDate = NexusUtils.formatDate;

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
  // --- Compute financials from data ---
  var financials = React.useMemo(function () {
    var totalRevenue = 0,
      totalPaid = 0;
    var confirmed = 0,
      tentative = 0,
      cancelled = 0,
      prospect = 0;
    var bPend = 0,
      bEnv = 0,
      bSeg = 0;
    var seenGroups = new Set();
    var segMap = {};
    (data || []).forEach(function (g) {
      var id = g.Com_Id || g["Reserva"] || g["Nombre del Grupo"] || "";
      var isNew = !seenGroups.has(id);
      if (isNew) {
        seenGroups.add(id);
        var rev = safeParseAmount(g["Importe(*)"] || g.Com_Total_Revenue || "0");
        totalRevenue += rev;
        var s = (g.Com_Estado_Interno || g["Estado"] || g["Segment."] || "").toUpperCase();
        if (s.includes("ANUL") || s.includes("CANC") || s.includes("BAJA") || s.includes("DESESTIMADO")) {
          cancelled++;
        } else if (s.includes("CONFIRM") || s.includes("GARANT") || s.includes("RESERVA")) {
          confirmed++;
        } else if (s.includes("BLOQ") || s.includes("OPCI") || s.includes("TENTATI")) {
          tentative++;
        } else if (s.includes("SEGUIMIENTO") || String(id).startsWith("PRES-")) {
          if (s.includes("SEGUIMIENTO")) {
            bSeg++;
          } else if (s.includes("ENVIADO")) {
            bEnv++;
          } else {
            bPend++;
          }
          prospect++;
        } else if (s.includes("ENVIADO")) {
          bEnv++;
          prospect++;
        } else if (s.includes("PRESUPUESTO") || s.includes("PENDIE") || s.includes("PROSPEC")) {
          bPend++;
          prospect++;
        } else {
          confirmed++;
        }

        // Segments
        var segmentName = (g.Com_Segmento || g["Segment."] || "OTROS").toUpperCase();
        segMap[segmentName] = (segMap[segmentName] || 0) + rev;
        var gPaid = parseFloat(g.Com_Pagado) || 0;
        if (gPaid === 0) {
          try {
            var plan = JSON.parse(g.PaymentPlan_JSON || "[]");
            plan.forEach(function (p) {
              if (p.status === "Cobrado") gPaid += parseFloat(p.amount) || 0;
            });
          } catch (e) {}
        }
        totalPaid += gPaid;

        // Board Basis / Regimen (kept for map but maybe not for main chart)
        var reg = (g["Régimen"] || g.Com_Regime || "OTROS").toUpperCase();
        segMap.regimes = segMap.regimes || {};
        segMap.regimes[reg] = (segMap.regimes[reg] || 0) + 1;
      }
    });
    var segmentData = Object.entries(segMap).filter(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 1),
        k = _ref4[0];
      return k !== "regimes";
    }).map(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
        name = _ref6[0],
        val = _ref6[1];
      return {
        name: name,
        val: val
      };
    }).sort(function (a, b) {
      return b.val - a.val;
    }).slice(0, 4);
    var budgetDataStats = [{
      name: "Pendiente",
      val: bPend,
      color: "#f59e0b"
    }, {
      name: "Enviado",
      val: bEnv,
      color: "#3b82f6"
    }, {
      name: "Seguimiento",
      val: bSeg,
      color: "#6366f1"
    }];
    return {
      totalRevenue: totalRevenue,
      effectivePaid: totalPaid,
      pending: Math.max(0, totalRevenue - totalPaid),
      confirmed: confirmed,
      tentative: tentative,
      cancelled: cancelled,
      prospect: prospect,
      segmentData: segmentData,
      budgetDataStats: budgetDataStats
    };
  }, [data]);
  var getStatusProps = function getStatusProps(status) {
    var s = (status || "").toUpperCase();
    if (s.includes("ANUL") || s.includes("CANC") || s.includes("BAJA") || s.includes("DESESTIMADO")) return {
      label: "Anulado",
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

  // Chart Data
  var pieData = [{
    name: "Confirmado",
    value: financials.confirmed,
    color: "#10b981"
  }, {
    name: "Tentativa",
    value: financials.tentative,
    color: "#3b82f6"
  }, {
    name: "Prospect",
    value: financials.prospect,
    color: "#f59e0b"
  }, {
    name: "Anulado",
    value: financials.cancelled,
    color: "#94a3b8"
  }];
  var trendData = stats.trendData && stats.trendData.length > 0 ? stats.trendData : [{
    name: "Feb",
    val: 0
  }, {
    name: "Mar",
    val: 0
  }, {
    name: "Abr",
    val: 0
  }, {
    name: "May",
    val: 0
  }, {
    name: "Jun",
    val: 0
  }, {
    name: "Jul",
    val: 0
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "space-y-12 animate-fade-in relative"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-4 gap-4 hidden"
  }, [{
    label: "Ingresos Totales",
    val: fmt(financials.totalRevenue),
    trend: "+12%",
    sub: "Incremento vs mes anterior",
    icon: "Euro",
    color: "emerald"
  }, {
    label: "Ocupación Media",
    val: financials.totalGroups > 0 ? (financials.totalPax / Math.max(financials.totalGroups, 1) * 1.2).toFixed(1) + "%" : "–",
    sub: "Estimada por grupo",
    icon: "Percent",
    color: "blue"
  }, {
    label: "Ticket Promedio",
    val: financials.confirmed > 0 ? (financials.totalRevenue / financials.confirmed).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + "€" : "–",
    sub: "Por reserva confirmada",
    icon: "Target",
    color: "amber"
  }, {
    label: "Grupos Activos",
    val: financials.confirmed + financials.tentative,
    trend: "+4",
    sub: "Pendientes de llegada",
    icon: "Users",
    color: "indigo"
  }].map(function (k) {
    return /*#__PURE__*/React.createElement("div", {
      key: k.label,
      className: "premium-card p-5 group hover:border-emerald-200 transition-all text-center flex flex-col items-center justify-center min-h-[100px]"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-center gap-2 mb-1"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-black text-slate-400 uppercase tracking-widest"
    }, k.label), k.trend && /*#__PURE__*/React.createElement("span", {
      className: "bg-emerald-50 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded-md"
    }, k.trend)), /*#__PURE__*/React.createElement("h4", {
      className: "text-2xl font-black text-slate-800 tracking-tighter mb-1"
    }, k.val), /*#__PURE__*/React.createElement("span", {
      className: "text-[8px] font-bold text-slate-400 uppercase tracking-tight opacity-60 truncate"
    }, k.sub));
  })), (alerts || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "relative group/alerts"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center gap-4 pb-6 pt-2 animate-fade-in delay-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "shrink-0 flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-[2rem] shadow-2xl shadow-slate-900/20 border border-slate-800/50 group hover:bg-slate-800 transition-all cursor-default"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "Bell",
    size: 16,
    className: "text-rose-400 animate-pulse relative z-10"
  }), /*#__PURE__*/React.createElement("div", {
    className: "absolute inset-0 bg-rose-400/20 blur-lg rounded-full animate-ping"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black uppercase tracking-[0.25em] leading-none text-rose-400 mb-1"
  }, "Priority"), /*#__PURE__*/React.createElement("span", {
    className: "text-[11px] font-black uppercase tracking-widest leading-none text-white whitespace-nowrap"
  }, "Acciones Urgentes"))), alerts.map(function (alert, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      onClick: function onClick() {
        if (alert.group) {
          var resId = alert.group["Reserva"];
          localStorage.setItem("nexus_return_reserva", resId);
          window.location.href = "Gestion-de-Grupos.html?reserva=".concat(encodeURIComponent(resId));
        }
      },
      className: "\n                      shrink-0 min-w-[240px] px-5 py-4 rounded-[2rem] flex items-center gap-4 \n                      cursor-pointer transition-all duration-300 border\n                      hover:scale-[1.03] hover:-translate-y-1 active:scale-95\n                      shadow-sm hover:shadow-xl\n                      ".concat(alert.type === "danger" ? "bg-gradient-to-br from-rose-50 to-white border-rose-100 hover:border-rose-300 hover:shadow-rose-100/50" : alert.type === "warning" ? "bg-gradient-to-br from-amber-50 to-white border-amber-100 hover:border-amber-300 hover:shadow-amber-100/50" : "bg-gradient-to-br from-indigo-50 to-white border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-100/50", "\n                    ")
    }, /*#__PURE__*/React.createElement("div", {
      className: "\n                        shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner\n                        ".concat(alert.type === "danger" ? "bg-white text-rose-500 border border-rose-100" : alert.type === "warning" ? "bg-white text-amber-500 border border-amber-100" : "bg-white text-indigo-500 border border-indigo-100", "\n                      ")
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: alert.icon || "Info",
      size: 18,
      strokeWidth: 2.5
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col min-w-0 pr-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[8px] font-black uppercase tracking-[0.15em] mb-1 ".concat(alert.type === "danger" ? "text-rose-400" : alert.type === "warning" ? "text-amber-500" : "text-indigo-400")
    }, alert.type === "danger" ? "Crítico" : alert.type === "warning" ? "Atención" : "Info"), /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] font-black text-slate-800 uppercase tracking-wide leading-tight line-clamp-2"
    }, alert.label)));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
  }, /*#__PURE__*/React.createElement("div", {
    className: "premium-card p-4 flex flex-col h-fit"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-[9px] font-black text-slate-800 uppercase tracking-widest mb-3"
  }, "Estado General de Grupos"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4 items-center justify-between w-full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex flex-col justify-center space-y-1.5"
  }, pieData.map(function (item) {
    return /*#__PURE__*/React.createElement("div", {
      key: item.name,
      className: "flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5 min-w-0 flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-1 h-1 rounded-full shrink-0",
      style: {
        background: item.color
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-black text-slate-500 uppercase truncate"
    }, item.name)), /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-black text-slate-800 ml-2"
    }, (item.value / Math.max(1, financials.confirmed + financials.tentative + financials.prospect + financials.cancelled) * 100).toFixed(0), "%"));
  })), /*#__PURE__*/React.createElement("div", {
    className: "w-24 h-24 shrink-0 -mr-2 flex justify-end"
  }, /*#__PURE__*/React.createElement(PieChart, {
    width: 96,
    height: 96
  }, /*#__PURE__*/React.createElement(Pie, {
    data: pieData,
    innerRadius: 25,
    outerRadius: 40,
    paddingAngle: 2,
    dataKey: "value",
    stroke: "none",
    cx: "50%",
    cy: "50%"
  }, pieData.map(function (entry, index) {
    return /*#__PURE__*/React.createElement(Cell, {
      key: "cell-".concat(index),
      fill: entry.color
    });
  })), /*#__PURE__*/React.createElement(Tooltip, {
    content: function content(_ref7) {
      var active = _ref7.active,
        payload = _ref7.payload;
      if (active && payload && payload.length) {
        return /*#__PURE__*/React.createElement("div", {
          className: "bg-white p-2 rounded-xl shadow-xl border border-slate-100"
        }, /*#__PURE__*/React.createElement("p", {
          className: "text-[9px] font-black text-slate-400 uppercase mb-0.5"
        }, payload[0].name), /*#__PURE__*/React.createElement("p", {
          className: "text-xs font-black text-slate-800"
        }, payload[0].value));
      }
      return null;
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "premium-card p-4 flex flex-col h-fit"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between mb-3"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-[9px] font-black text-slate-800 uppercase tracking-widest"
  }, "Presupuestos por Estado"), /*#__PURE__*/React.createElement(LucideIcon, {
    name: "clipboard-list",
    size: 12,
    className: "text-slate-300"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4 items-center justify-between w-full"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex flex-col justify-center space-y-1.5 overflow-y-auto custom-scrollbar pr-1"
  }, (financials.budgetDataStats || []).map(function (item, index) {
    return /*#__PURE__*/React.createElement("div", {
      key: item.name,
      className: "flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5 min-w-0 flex-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-1 h-1 rounded-full shrink-0",
      style: {
        background: item.color
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-black text-slate-500 uppercase truncate"
    }, item.name)), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-black text-slate-800 ml-2"
    }, item.val));
  })), /*#__PURE__*/React.createElement("div", {
    className: "w-24 h-24 shrink-0 -mr-2 flex justify-end"
  }, /*#__PURE__*/React.createElement(PieChart, {
    width: 96,
    height: 96
  }, /*#__PURE__*/React.createElement(Pie, {
    data: financials.budgetDataStats,
    innerRadius: 25,
    outerRadius: 40,
    paddingAngle: 4,
    dataKey: "val",
    stroke: "none",
    cx: "50%",
    cy: "50%"
  }, (financials.budgetDataStats || []).map(function (entry, index) {
    return /*#__PURE__*/React.createElement(Cell, {
      key: "cell-".concat(index),
      fill: entry.color
    });
  })), /*#__PURE__*/React.createElement(Tooltip, {
    content: function content(_ref8) {
      var active = _ref8.active,
        payload = _ref8.payload;
      if (active && payload && payload.length) {
        return /*#__PURE__*/React.createElement("div", {
          className: "bg-white p-2 rounded-xl shadow-xl border border-slate-100"
        }, /*#__PURE__*/React.createElement("p", {
          className: "text-[9px] font-black text-slate-400 uppercase mb-0.5"
        }, payload[0].name), /*#__PURE__*/React.createElement("p", {
          className: "text-xs font-black text-slate-800"
        }, payload[0].value));
      }
      return null;
    }
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "premium-card overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-8 border-b border-slate-100 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xs font-black text-slate-800 uppercase tracking-widest"
  }, "Pr\xF3ximas Llegadas"), /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-60"
  }, "Pr\xF3ximos", " ", timeRange === 365 ? "12 meses" : timeRange + " días", " \u2022 Actualizado hace 1 min.")), /*#__PURE__*/React.createElement("div", {
    className: "flex bg-slate-50 rounded-xl p-1 border border-slate-100"
  }, [{
    label: "15D",
    val: 15
  }, {
    label: "30D",
    val: 30
  }, {
    label: "1A",
    val: 365
  }].map(function (opt) {
    return /*#__PURE__*/React.createElement("button", {
      key: opt.val,
      onClick: function onClick() {
        return onRangeChange(opt.val);
      },
      className: "px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ".concat(timeRange === opt.val ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600")
    }, opt.label);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "Search",
    size: 14,
    className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Buscar en grupos...",
    className: "bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-emerald-500 transition-all w-64"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400"
  }, /*#__PURE__*/React.createElement("th", {
    className: "px-8 py-5"
  }, "Grupo"), /*#__PURE__*/React.createElement("th", {
    className: "px-8 py-5"
  }, "Llegada"), /*#__PURE__*/React.createElement("th", {
    className: "px-8 py-5"
  }, "Cliente"), /*#__PURE__*/React.createElement("th", {
    className: "px-8 py-5"
  }, "Empresa"), /*#__PURE__*/React.createElement("th", {
    className: "px-8 py-5 text-right"
  }, "Importe"), /*#__PURE__*/React.createElement("th", {
    className: "px-8 py-5 text-right"
  }))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-100"
  }, arrivals.map(function (group, i) {
    var st = getStatusProps(group["Estado"]);
    return /*#__PURE__*/React.createElement("tr", {
      key: i,
      className: "hover:bg-slate-50 transition-colors group cursor-pointer",
      onClick: function onClick() {
        var resId = group["Reserva"];
        localStorage.setItem("nexus_return_reserva", resId);
        window.location.href = "Gestion-de-Grupos.html?reserva=".concat(encodeURIComponent(resId));
      }
    }, /*#__PURE__*/React.createElement("td", {
      className: "px-8 py-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-1.5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("h5", {
      className: "text-[11px] font-black text-slate-800 uppercase tracking-tight group-hover:text-emerald-600 transition-colors"
    }, group["Nombre del Grupo"]), /*#__PURE__*/React.createElement("span", {
      className: "text-[8px] font-bold text-slate-300 uppercase tracking-widest px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100"
    }, "#", group["Reserva"])), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-1.5"
    }, function () {
      var total = safeParseAmount(group["Total_Importe_Facturable"] || group["Importe(*)"] || 0);
      var paid = typeof group["Com_Pagado"] === 'number' ? group["Com_Pagado"] : safeParseAmount(group["Com_Pagado"] || 0);
      try {
        var plan = JSON.parse(group.PaymentPlan_JSON || "[]");
        var planPaid = 0;
        plan.forEach(function (p) {
          if (p.status === "Cobrado" || p.status === "Pagado") planPaid += safeParseAmount(p.amount || 0);
        });
        if (planPaid > paid) paid = planPaid;
      } catch (e) {}
      var isPaid = group["Com_Pagado"] === true || total > 0 && paid >= total - 0.1;
      var st = getStatusProps(group["Estado"]);
      var isConfirmed = st.label === "Confirmado" || (group["Estado"] || "").toUpperCase().includes("CONFIRM") || (group["Estado"] || "").toUpperCase().includes("GARANT") || (group["Estado"] || "").toUpperCase().includes("RESERVA");

      // Si ya está pagado o confirmado, el release ya no es una alerta crítica comercial
      if (isPaid || isConfirmed) return null;
      var dRel = group.Com_Vencimiento_Rel ? group.Com_Vencimiento_Rel instanceof Date ? group.Com_Vencimiento_Rel : new Date(group.Com_Vencimiento_Rel) : null;
      if (dRel && !isNaN(dRel.getTime())) {
        var diff = dRel - new Date();
        if (diff < 7 * 24 * 60 * 60 * 1000) {
          var daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
          var isUrgent = daysLeft <= 2;
          return /*#__PURE__*/React.createElement("div", {
            className: "flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ".concat(isUrgent ? 'bg-rose-50 text-rose-500 border-rose-100 animate-pulse ring-4 ring-rose-500/10' : 'bg-slate-50 text-slate-400 border-slate-100')
          }, /*#__PURE__*/React.createElement(LucideIcon, {
            name: "Clock",
            size: 10,
            strokeWidth: 3
          }), "Rel: ", formatDate(group.Com_Vencimiento_Rel));
        }
      }
      return null;
    }(), !group.Com_Comercial && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[8px] font-black uppercase tracking-widest"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "UserPlus",
      size: 10,
      strokeWidth: 3
    }), "Sin Comercial"), safeParseAmount(group["Importe(*)"] || group["Total_Importe_Facturable"] || 0) === 0 && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-500 rounded-full border border-indigo-100 text-[8px] font-black uppercase tracking-widest"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "HelpCircle",
      size: 10,
      strokeWidth: 3
    }), "Falta Precio"), function () {
      var total = safeParseAmount(group["Total_Importe_Facturable"] || group["Importe(*)"] || 0);
      if (total <= 0) return null;
      var paid = typeof group["Com_Pagado"] === 'number' ? group["Com_Pagado"] : safeParseAmount(group["Com_Pagado"] || 0);

      // Si no hay pago directo, buscamos en el plan de pagos
      try {
        var plan = JSON.parse(group.PaymentPlan_JSON || "[]");
        var planPaid = 0;
        plan.forEach(function (p) {
          if (p.status === "Cobrado" || p.status === "Pagado") planPaid += safeParseAmount(p.amount || 0);
        });
        if (planPaid > paid) paid = planPaid;
      } catch (e) {}
      var isActuallyPaid = group["Com_Pagado"] === true || paid >= total - 0.1;
      if (!isActuallyPaid) {
        return /*#__PURE__*/React.createElement("div", {
          className: "flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full border border-rose-100 text-[8px] font-black uppercase tracking-widest"
        }, /*#__PURE__*/React.createElement(LucideIcon, {
          name: "CreditCard",
          size: 10,
          strokeWidth: 3
        }), "Pago Pendiente");
      }
      return null;
    }(), !group["Logistica_Rooming"] && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[8px] font-black uppercase tracking-widest"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "FileText",
      size: 10,
      strokeWidth: 3
    }), "Falta Rooming"), (group["Régimen"] || "").toUpperCase().includes("MP") && !group["Logistica_MenuMP"] && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full border border-orange-100 text-[8px] font-black uppercase tracking-widest"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "Utensils",
      size: 10,
      strokeWidth: 3
    }), "Falta Men\xFA MP"), (group["Régimen"] || "").toUpperCase().includes("PC") && !group["Logistica_MenuPC"] && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full border border-orange-100 text-[8px] font-black uppercase tracking-widest"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "Utensils",
      size: 10,
      strokeWidth: 3
    }), "Falta Men\xFA PC")))), /*#__PURE__*/React.createElement("td", {
      className: "px-8 py-6"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-black text-slate-600 tracking-widest"
    }, formatDate(group["Entrada"]))), /*#__PURE__*/React.createElement("td", {
      className: "px-8 py-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ".concat(st.text, " border ").concat(st.border || "border-transparent")
    }, st.label))), /*#__PURE__*/React.createElement("td", {
      className: "px-8 py-6"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold text-slate-500 uppercase tracking-widest"
    }, group["Empresa/Agencia"] || "Directo")), /*#__PURE__*/React.createElement("td", {
      className: "px-8 py-6 text-right"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] font-black text-slate-800 tracking-tight"
    }, fmt(safeParseAmount(group["Total_Importe_Facturable"] || group["Importe(*)"] || 0)))), /*#__PURE__*/React.createElement("td", {
      className: "px-8 py-6 text-right"
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "ChevronRight",
      size: 14,
      className: "text-slate-300 opacity-0 group-hover:opacity-100"
    })));
  }), arrivals.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "6",
    className: "px-8 py-20 text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center gap-3 opacity-30"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "CalendarX",
    size: 40
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-black uppercase tracking-widest"
  }, "Sin llegadas pr\xF3ximas para el periodo seleccionado")))))))), /*#__PURE__*/React.createElement("footer", {
    className: "text-center py-12"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]"
  }, "Nexus Gold Edition v2.8.5 \u2022 System Normal \u2022 Refreshed at", " ", new Date().toLocaleTimeString())));
};
var GroupsManager = function GroupsManager(_ref9) {
  var data = _ref9.data,
    onUpdateStatus = _ref9.onUpdateStatus,
    onDeleteGroup = _ref9.onDeleteGroup;
  var _React$useState = React.useState(""),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    searchTerm = _React$useState2[0],
    setSearchTerm = _React$useState2[1];
  var filteredData = data.filter(function (group) {
    var term = searchTerm.toLowerCase();
    var name = (group["Nombre del Grupo"] || "").toLowerCase();
    var agency = (group["Empresa/Agencia"] || "").toLowerCase();
    var reserva = (group["Reserva"] || "").toString().toLowerCase();
    return name.includes(term) || agency.includes(term) || reserva.includes(term);
  });
  var getStatusProps = function getStatusProps(status) {
    var s = (status || "").toUpperCase();
    if (s.includes("ANUL") || s.includes("CANC") || s.includes("BAJA") || s.includes("DESESTIMADO")) return {
      label: "Anulado",
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
var BudgetManager = function BudgetManager(_ref0) {
  var data = _ref0.data,
    onUpdateStatus = _ref0.onUpdateStatus,
    onDeleteGroup = _ref0.onDeleteGroup;
  var _React$useState3 = React.useState(""),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    searchTerm = _React$useState4[0],
    setSearchTerm = _React$useState4[1];
  var _React$useState5 = React.useState("TODOS"),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    statusFilter = _React$useState6[0],
    setStatusFilter = _React$useState6[1];
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
    var _ref1 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(groupId, newStatus) {
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
      return _ref1.apply(this, arguments);
    };
  }();
  var handleDeleteGroup = /*#__PURE__*/function () {
    var _ref10 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(groupId) {
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
      return _ref10.apply(this, arguments);
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

      // Alert 1: Release Urgente (< 7 días)
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

      // Alert 3: Pagos Pendientes
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
    var _ref11 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
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
      return _ref11.apply(this, arguments);
    };
  }();
  useEffect(function () {
    var unsubscribe = db.collection("groups").onSnapshot(function (snapshot) {
      var parsed = [];
      snapshot.forEach(function (doc) {
        var row = doc.data();
        if (row.isIndependentProforma === true) return; // Skip independent proformas
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

          // Alert 1: Release Urgente (< 7 días)
          var comRel = g.Com_Vencimiento_Rel ? parseDate(g.Com_Vencimiento_Rel) : null;
          if (comRel && !isNaN(comRel.getTime()) && comRel <= sevenDaysFromNow) {
            realAlerts.push({
              label: "Vence Release: ".concat(groupName),
              icon: "Clock",
              type: "warning"
            });
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

          // Alert 3: Pagos Pendientes
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
      return window.location.href = activeTab === "invoices" ? "Fac Prof.html" : "Gestion-de-Grupos.html";
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