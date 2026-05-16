"use strict";

var _excluded = ["_diff", "_changes", "_docId"];
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// Aseguramos que las librerías estén disponibles

var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useMemo = _React.useMemo,
  useRef = _React.useRef;
var _window$Recharts = window.Recharts,
  BarChart = _window$Recharts.BarChart,
  Bar = _window$Recharts.Bar,
  XAxis = _window$Recharts.XAxis,
  YAxis = _window$Recharts.YAxis,
  CartesianGrid = _window$Recharts.CartesianGrid,
  Tooltip = _window$Recharts.Tooltip,
  Legend = _window$Recharts.Legend,
  ResponsiveContainer = _window$Recharts.ResponsiveContainer,
  PieChart = _window$Recharts.PieChart,
  Pie = _window$Recharts.Pie,
  Cell = _window$Recharts.Cell;

// Utilidades compartidas (cargadas desde js/utils.js)

var safeStorage = window.NexusUtils.safeStorage;

// Iconos SVG manuales eliminados — ahora se cargan desde js/icons.js

// Los nombres antiguos (IconCheck, IconUsers, etc.) siguen disponibles

// como globales via window.NexusIcons alias factory.

// --- FIREBASE ---

// Inicialización cargada desde js/firebase-init.js

var db = window.db;

// --- UTILIDADES ---

// Cargadas desde js/utils.js (NexusUtils)

var COLORS = NexusUtils.COLORS;
var parseNum = NexusUtils.parseNum;
var normalizeId = NexusUtils.normalizeId;
var getBaseId = NexusUtils.getBaseId;
var normalizeHotelName = NexusUtils.normalizeHotelName;
var formatNum = NexusUtils.formatNum;
var BudgetManager = function BudgetManager(_ref) {
  var data = _ref.data,
    openFicha = _ref.openFicha,
    formatDate = _ref.formatDate;
  var _React$useState = React.useState(""),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    searchTerm = _React$useState2[0],
    setSearchTerm = _React$useState2[1];
  var _React$useState3 = React.useState("TODOS"),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    statusFilter = _React$useState4[0],
    setStatusFilter = _React$useState4[1];
  var budgetData = React.useMemo(function () {
    return data.filter(function (g) {
      var reservaStr = String(g.Reserva || "");
      var isBudget = reservaStr.startsWith("PRES-") || String(g.uid || "").startsWith("PRES-");
      if (!isBudget) return false;
      var rawStatus = (g.Com_Estado_Interno || g.Estado || "").toUpperCase();

      // No ocultamos confirmados aquí para que el comercial pueda ver su historial reciente
      if (rawStatus.includes("DESESTIMADO") || rawStatus.includes("CANCEL") || rawStatus.includes("ANUL")) {
        return false;
      }
      var term = searchTerm.toLowerCase();
      var name = (g["Nombre del Grupo"] || "").toLowerCase();
      var agency = (g["Empresa/Agencia"] || "").toLowerCase();
      var reserva = reservaStr.toLowerCase();
      var matchesSearch = name.includes(term) || agency.includes(term) || reserva.includes(term);
      var matchesStatus = statusFilter === "TODOS" || rawStatus.includes(statusFilter);
      return matchesSearch && matchesStatus;
    }).sort(function (a, b) {
      var _a$createdAt, _b$createdAt;
      var dateA = (_a$createdAt = a.createdAt) !== null && _a$createdAt !== void 0 && _a$createdAt.seconds ? a.createdAt.seconds : a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0;
      var dateB = (_b$createdAt = b.createdAt) !== null && _b$createdAt !== void 0 && _b$createdAt.seconds ? b.createdAt.seconds : b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0;
      return dateB - dateA;
    });
  }, [data, searchTerm, statusFilter]);
  var getBudgetStatusProps = function getBudgetStatusProps(statusRaw) {
    var s = (statusRaw || "").toString().toUpperCase();
    if (s.includes("CONFIRM")) return {
      color: "bg-emerald-500",
      text: "bg-emerald-50 text-emerald-600",
      component: IconCheckCircle,
      label: "CONFIRMADO"
    };
    if (s.includes("DESESTIMADO") || s.includes("CANCEL") || s.includes("ANUL")) return {
      color: "bg-slate-400",
      text: "bg-slate-50 text-slate-500",
      component: IconXCircle,
      label: "ANULADA"
    };
    if (s.includes("SEGUIMIENTO")) return {
      color: "bg-indigo-500",
      text: "bg-indigo-50 text-indigo-600",
      component: IconPhoneForwarded,
      label: "SEGUIMIENTO"
    };
    if (s.includes("ENVIADO")) return {
      color: "bg-blue-500",
      text: "bg-blue-50 text-blue-600",
      component: IconMail,
      label: "ENVIADO"
    };
    return {
      color: "bg-amber-500",
      text: "bg-amber-50 text-amber-600",
      component: IconClock,
      label: "PENDIENTE"
    };
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "animate-fade-in space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-black text-slate-800 tracking-tight"
  }, "Seguimiento de Cotizaciones"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-400 text-xs font-bold uppercase tracking-widest mt-1"
  }, "Control comercial y conversi\xF3n de leads")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-3 w-full md:w-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative flex-1 md:w-64"
  }, /*#__PURE__*/React.createElement(IconSearch, {
    className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
  }), /*#__PURE__*/React.createElement(DebouncedSearchInput, {
    placeholder: "Buscar presupuesto...",
    className: "w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-indigo-500 transition-all font-medium",
    value: searchTerm,
    onChange: setSearchTerm
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
  }, "En Seguimiento")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.location.href = "AltaEmail.html";
    },
    className: "bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all text-xs uppercase tracking-widest shadow-lg shadow-indigo-100"
  }, /*#__PURE__*/React.createElement(IconPlus, {
    className: "w-4 h-4"
  }), "Nuevo"))), /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto bg-white rounded-3xl border border-slate-100"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left border-collapse min-w-[1000px]"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "bg-slate-50/50 border-b border-slate-100"
  }, /*#__PURE__*/React.createElement("th", {
    className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest min-w-[300px]"
  }, "Grupo / Hotel"), /*#__PURE__*/React.createElement("th", {
    className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center"
  }, "Entrada"), /*#__PURE__*/React.createElement("th", {
    className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center"
  }, "L\xEDmite 7d"), /*#__PURE__*/React.createElement("th", {
    className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center"
  }, "Pax / Hab"), /*#__PURE__*/React.createElement("th", {
    className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center"
  }, "Presupuesto"), /*#__PURE__*/React.createElement("th", {
    className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]"
  }, "Gesti\xF3n"), /*#__PURE__*/React.createElement("th", {
    className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center"
  }, "Estado"), /*#__PURE__*/React.createElement("th", {
    className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right"
  }, "Acciones"))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-50"
  }, budgetData.map(function (budget, i) {
    var st = getBudgetStatusProps(budget.Com_Estado_Interno || budget.Estado);
    var hotelName = budget.Hotel_Asignado || budget.Hotel || "N/A";
    var totalAmt = budget["Importe(*)"] || 0;
    var roomsCount = budget["Cant. Habitaciones"] || budget["Habitaciones"] || budget["Cant."] || 0;
    return /*#__PURE__*/React.createElement("tr", {
      key: i,
      className: "hover:bg-slate-50/50 transition-colors group"
    }, /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-slate-100 overflow-hidden p-1 shadow-sm group-hover:scale-105 transition-transform"
    }, /*#__PURE__*/React.createElement("img", {
      src: hotelName.toLowerCase().includes("cumbria") ? "Logos/Cumbria Spa&Hotel.jpg" : "Logos/Sercotel Guadiana.jpg",
      className: "w-full h-full object-contain",
      alt: "Hotel"
    })), /*#__PURE__*/React.createElement("div", {
      className: "min-w-0"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-sm font-black text-slate-800 uppercase leading-tight truncate group-hover:text-indigo-600 transition-colors"
    }, budget["Nombre del Grupo"]), /*#__PURE__*/React.createElement("p", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 opacity-60"
    }, hotelName, " \u2022 ID: ", budget.Reserva)))), /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-4 text-center"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-black text-slate-700"
    }, formatDate(budget.Entrada))), /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-4 text-center"
    }, function (_budget$createdAt) {
      var created = (_budget$createdAt = budget.createdAt) !== null && _budget$createdAt !== void 0 && _budget$createdAt.seconds ? new Date(budget.createdAt.seconds * 1000) : budget.createdAt ? new Date(budget.createdAt) : null;
      if (!created) return /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-bold text-slate-300"
      }, "N/A");
      var diff = Math.floor((new Date() - created) / (1000 * 60 * 60 * 24));
      var daysLeft = 7 - diff;
      var color = daysLeft <= 1 ? "text-rose-600 bg-rose-50" : daysLeft <= 3 ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50";
      return /*#__PURE__*/React.createElement("div", {
        className: "inline-flex flex-col items-center px-2 py-1 rounded-lg ".concat(color)
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-xs font-black"
      }, daysLeft, "d"), /*#__PURE__*/React.createElement("span", {
        className: "text-[7px] font-bold uppercase tracking-tighter"
      }, "Restantes"));
    }()), /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-4 text-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col items-center gap-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1 text-slate-700"
    }, /*#__PURE__*/React.createElement(IconUsers, {
      className: "w-3 h-3"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-black"
    }, budget["Pax."] || 0)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1 text-slate-400"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-bed text-[10px]"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold"
    }, roomsCount)))), /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-4 text-center"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-black text-indigo-600 tracking-tight"
    }, formatNum(totalAmt), "\u20AC")), /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 text-slate-400"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-building text-[9px] w-3 text-center"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-bold uppercase"
    }, budget["Empresa/Agencia"] || "Venta Directa")), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 text-indigo-400"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-user-tie text-[9px] w-3 text-center"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-bold uppercase"
    }, budget["Com_Comercial"] || "SIN ASIGNAR")))), /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-4 text-center"
    }, /*#__PURE__*/React.createElement("span", {
      className: "".concat(st.text, " px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest block mx-auto w-fit")
    }, st.label)), /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-4 text-right"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        window.location.href = "Presupuestos.html?id=" + encodeURIComponent(budget.Reserva);
      },
      className: "w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all",
      title: "Ver / Editar"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-external-link-alt text-xs"
    })), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        localStorage.setItem("selectedGroup", JSON.stringify(budget));
        window.location.href = "AltaEmail.html?edit=" + encodeURIComponent(budget.Reserva);
      },
      className: "w-8 h-8 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all",
      title: "Editar"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-edit text-xs"
    })), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        localStorage.setItem('selectedGroup', JSON.stringify(budget));
        window.location.href = "Presupuestos.html?id=" + encodeURIComponent(budget.Reserva);
      },
      className: "w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all",
      title: "Ver Proforma"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-file-invoice text-xs"
    })))));
  }))), budgetData.length === 0 && /*#__PURE__*/React.createElement("div", {
    className: "py-32 text-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center gap-4 opacity-20"
  }, /*#__PURE__*/React.createElement(IconClipboardX, {
    size: 64
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-black uppercase tracking-[0.3em]"
  }, "No hay presupuestos en esta secci\xF3n")))));
};
var App = function App() {
  var _selectedGroupFicha$r47, _selectedGroupFicha$r48, _selectedGroupFicha$r49;
  var _useState = useState([]),
    _useState2 = _slicedToArray(_useState, 2),
    data = _useState2[0],
    setData = _useState2[1];
  var _useState3 = useState([]),
    _useState4 = _slicedToArray(_useState3, 2),
    columns = _useState4[0],
    setColumns = _useState4[1];
  var authorizingIds = useRef(new Set()); // Para evitar que onSnapshot restaure diffs en proceso de guardado

  var getStatusProps = function getStatusProps(statusRaw, arrivalDate, estadoField) {
    var s = (statusRaw || "").toString().toUpperCase();
    var e = (estadoField || "").toString().toUpperCase();
    var today = new Date().toISOString().split("T")[0];
    var arrival = toInputDate(arrivalDate);

    // 0. CANCELADO / ANULADO / BAJA / DESESTIMADO (PREFERENCIA MÁXIMA)

    if (s.includes("CANC") || s.includes("ANUL") || s.includes("BAJA") || s.includes("DESESTIMADO") || e.includes("CANC") || e.includes("ANUL") || e.includes("BAJA") || e.includes("DESESTIMADO")) return {
      color: "bg-red-500/80",
      text: "bg-red-100 text-red-700",
      label: "ANULADA"
    };

    // 1. CONFIRMADO / OK / BLOQUEADO (PRIORIDAD SOBRE PASADO)
    if (s.includes("CONF") || s.includes("OK") || s.includes("BLOQ") || s === "GRUPOS" || s === "GRUPO") {
      return {
        color: "bg-emerald-500",
        text: "bg-emerald-100 text-emerald-700",
        label: "CONFIRMADO"
      };
    }

    // 2. PASADO (Si la fecha de entrada ya pasó y NO está confirmado)
    if (arrival && arrival < today) {
      return {
        color: "bg-slate-400",
        text: "bg-slate-100 text-slate-500",
        label: "PASADO"
      };
    }

    // 2. TENTATIVA / TANTEO / BLOQUEADO
    if (s.includes("TANTEO") || s.includes("TENTA") || s.includes("BLOQ") || s.includes("OPCI")) return {
      color: "bg-amber-500",
      text: "bg-amber-100 text-amber-700",
      label: "TENTATIVA"
    };

    // 3. CONFIRMADO / GARANTIZADO / RESERVA
    if (s.includes("CONFIRM") || s.includes("GARANT") || s.includes("RESERVA")) return {
      color: "bg-emerald-500",
      text: "bg-emerald-100 text-emerald-700",
      label: "CONFIRMADO"
    };

    // 4. PRESUPUESTO / ENVIADO / COTIZADO

    if (s.includes("PRESUP") || s.includes("ENVIA") || s.includes("COTIZ") || s.includes("OFERT")) return {
      color: "bg-blue-500",
      text: "bg-blue-100 text-blue-700",
      label: "PRESUPUESTO"
    };

    // 5. PROSPECTO / PENDIENTE

    if (s.includes("PROSPEC") || s.includes("PENDIE")) return {
      color: "bg-slate-500",
      text: "bg-slate-100 text-slate-700",
      label: s || "PROSPECTO"
    };
    return {
      color: "bg-slate-400",
      text: "bg-slate-100 text-slate-600",
      label: s || "ACTIVO"
    };
  };
  var toInputDate = function toInputDate(val) {
    if (!val) return "";
    var str = String(val).trim();

    // Caso 1: Excel Serial (ej: 46129)

    var num = parseFloat(str);
    if (!isNaN(num) && num > 40000 && num < 60000) {
      try {
        var date = new Date(Math.round((num - 25569) * 86400 * 1000));
        if (!isNaN(date.getTime())) return date.toISOString().split("T")[0];
      } catch (e) {}
    }

    // Caso 2: DD/MM/YYYY -> YYYY-MM-DD

    if (str.includes("/")) {
      var parts = str.split("/");
      if (parts.length === 3) {
        var _parts = _slicedToArray(parts, 3),
          d = _parts[0],
          m = _parts[1],
          yRaw = _parts[2];
        var y = parseInt(yRaw);
        if (y < 100) y += 2000; // Handle two-digit years

        var year = String(y);
        return "".concat(year, "-").concat(m.padStart(2, "0"), "-").concat(d.padStart(2, "0"));
      }
    }

    // Caso 3: DD.MM.YYYY -> YYYY-MM-DD

    if (str.includes(".")) {
      var _parts2 = str.split(".");
      if (_parts2.length === 3) {
        var _parts3 = _slicedToArray(_parts2, 3),
          _d = _parts3[0],
          _m = _parts3[1],
          _yRaw = _parts3[2];
        var _y = parseInt(_yRaw);
        if (_y < 100) _y += 2000; // Handle two-digit years

        var yrStr = String(_y);
        if (yrStr.length === 4 || yrStr.length === 2) {
          return "".concat(yrStr, "-").concat(_m.padStart(2, "0"), "-").concat(_d.padStart(2, "0"));
        }
        if (_d.length === 4) return "".concat(_d, "-").concat(_m.padStart(2, "0"), "-").concat(String(_y).padStart(2, "0"));
      }
    }

    // Caso 4: YYYY-MM-DD o DD-MM-YYYY

    if (str.includes("-")) {
      var _parts4 = str.split(/[-T ]/);
      if (_parts4[0] && _parts4[0].length === 4) return _parts4.slice(0, 3).join("-"); // YYYY-MM-DD

      if (_parts4[2] && (_parts4[2].length === 4 || _parts4[2].length === 2)) {
        // DD-MM-YYYY

        var _parts5 = _slicedToArray(_parts4, 3),
          _d2 = _parts5[0],
          _m2 = _parts5[1],
          _yRaw2 = _parts5[2];
        var _y2 = parseInt(_yRaw2);
        if (_y2 < 100) _y2 += 2000; // Handle two-digit years

        var _year = String(_y2);
        return "".concat(_year, "-").concat(_m2.padStart(2, "0"), "-").concat(_d2.padStart(2, "0"));
      }
    }
    return str;
  };
  var formatDate = function formatDate(val) {
    if (!val) return "-";
    var iso = toInputDate(val);
    if (!iso || typeof iso !== "string" || !iso.includes("-")) return val;
    var _iso$split = iso.split("-"),
      _iso$split2 = _slicedToArray(_iso$split, 3),
      y = _iso$split2[0],
      m = _iso$split2[1],
      d = _iso$split2[2];
    return "".concat(d, "/").concat(m, "/").concat(y);
  };
  var _useState5 = useState("groups"),
    _useState6 = _slicedToArray(_useState5, 2),
    activeTab = _useState6[0],
    setActiveTab = _useState6[1];
  var _useState7 = useState(""),
    _useState8 = _slicedToArray(_useState7, 2),
    searchTerm = _useState8[0],
    setSearchTerm = _useState8[1];
  var _useState9 = useState(""),
    _useState0 = _slicedToArray(_useState9, 2),
    newColumnName = _useState0[0],
    setNewColumnName = _useState0[1];
  var _useState1 = useState(false),
    _useState10 = _slicedToArray(_useState1, 2),
    showColumnModal = _useState10[0],
    setShowColumnModal = _useState10[1];
  var _useState11 = useState(null),
    _useState12 = _slicedToArray(_useState11, 2),
    expandedGroup = _useState12[0],
    setExpandedGroup = _useState12[1];
  var _useState13 = useState(null),
    _useState14 = _slicedToArray(_useState13, 2),
    expandedSegment = _useState14[0],
    setExpandedSegment = _useState14[1];

  // Estados para IA

  var _useState15 = useState(false),
    _useState16 = _slicedToArray(_useState15, 2),
    isAiLoading = _useState16[0],
    setIsAiLoading = _useState16[1];
  var _useState17 = useState(false),
    _useState18 = _slicedToArray(_useState17, 2),
    loading = _useState18[0],
    setLoading = _useState18[1];
  var _useState19 = useState(null),
    _useState20 = _slicedToArray(_useState19, 2),
    aiResult = _useState20[0],
    setAiResult = _useState20[1];
  var _useState21 = useState(false),
    _useState22 = _slicedToArray(_useState21, 2),
    showAiModal = _useState22[0],
    setShowAiModal = _useState22[1];
  var _useState23 = useState(false),
    _useState24 = _slicedToArray(_useState23, 2),
    showAddGroupModal = _useState24[0],
    setShowAddGroupModal = _useState24[1];
  var _useState25 = useState(""),
    _useState26 = _slicedToArray(_useState25, 2),
    aiEmailContent = _useState26[0],
    setAiEmailContent = _useState26[1];
  var _useState27 = useState(false),
    _useState28 = _slicedToArray(_useState27, 2),
    isParsingEmail = _useState28[0],
    setIsParsingEmail = _useState28[1];
  var _useState29 = useState(false),
    _useState30 = _slicedToArray(_useState29, 2),
    showOnlyChanges = _useState30[0],
    setShowOnlyChanges = _useState30[1];
  var _useState31 = useState(false),
    _useState32 = _slicedToArray(_useState31, 2),
    showImportSummary = _useState32[0],
    setShowImportSummary = _useState32[1];
  var _useState33 = useState(null),
    _useState34 = _slicedToArray(_useState33, 2),
    importSummaryData = _useState34[0],
    setImportSummaryData = _useState34[1];
  var _useState35 = useState(null),
    _useState36 = _slicedToArray(_useState35, 2),
    aiReviewData = _useState36[0],
    setAiReviewData = _useState36[1];
  var _useState37 = useState(false),
    _useState38 = _slicedToArray(_useState37, 2),
    showReviewModal = _useState38[0],
    setShowReviewModal = _useState38[1];

  // Estados para Filtros de Directorio de Grupos

  var _useState39 = useState(""),
    _useState40 = _slicedToArray(_useState39, 2),
    filterDirHotel = _useState40[0],
    setFilterDirHotel = _useState40[1];
  var _useState41 = useState(""),
    _useState42 = _slicedToArray(_useState41, 2),
    filterDirCommercial = _useState42[0],
    setFilterDirCommercial = _useState42[1];
  var _useState43 = useState([{
      name: "NATALIO",
      active: true
    }, {
      name: "EMILIA",
      active: true
    }, {
      name: "CANDELARIA",
      active: true
    }, {
      name: "MARTA",
      active: true
    }]),
    _useState44 = _slicedToArray(_useState43, 2),
    commercials = _useState44[0],
    setCommercials = _useState44[1];
  var _useState45 = useState({
      guadiana: {},
      cumbria: {}
    }),
    _useState46 = _slicedToArray(_useState45, 2),
    hotelSettings = _useState46[0],
    setHotelSettings = _useState46[1];
  var getCommColor = function getCommColor(name) {
    if (!name) return "bg-slate-300";
    var predefinedColors = ["bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-fuchsia-500"];
    var idx = commercials.findIndex(function (c) {
      return c.name === name;
    });
    if (idx === -1) {
      var hash = 0;
      for (var i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      idx = Math.abs(hash);
    }
    return predefinedColors[idx % predefinedColors.length];
  };

  // Cargar configuración de comerciales desde Firestore

  useEffect(function () {
    var unsubscribe = db.collection("settings").doc("main").onSnapshot(function (doc) {
      if (doc.exists) {
        var _data = doc.data() || {};
        var system = _data.system || {};
        if (system.commercials && Array.isArray(system.commercials)) {
          // Normalize: Ensure all are objects with name and active status

          var normalized = system.commercials.map(function (comm) {
            if (_typeof(comm) === "object" && comm !== null) return comm;
            return {
              name: comm,
              active: true
            };
          });
          setCommercials(normalized);
        }
        setHotelSettings({
          guadiana: _data.guadiana || {},
          cumbria: _data.cumbria || {},
          lastImportDate: _data.lastImportDate || null
        });
      }
    });
    return function () {
      return unsubscribe();
    };
  }, []);

  // Sincronización automática desde Proforma eliminada porque `Fac Prof.html` ya guarda directamente en Firestore al salir.

  // Si mantenemos esto, cada vez que se recarga la página, se sobreescribe Firestore con datos antiguos (stale) en localStorage.

  useEffect(function () {

    // Limpieza de datos temporales obsoletos (opcional)

    // localStorage.removeItem('selectedGroup');
  }, []);

  // --- ATAJO DE TECLADO: ESC cierra modales ---

  useEffect(function () {
    var handleKeyDown = function handleKeyDown(e) {
      if (e.key === "Escape") {
        // Cerrar modales en orden de prioridad (el más interno primero)

        if (showAiModal) {
          setShowAiModal(false);
          return;
        }
        if (showImportSummary) {
          setShowImportSummary(false);
          return;
        }
        if (showFichaModal) {
          setShowFichaModal(false);
          return;
        }
        if (showColumnModal) {
          setShowColumnModal(false);
          return;
        }
        if (isHotelModalOpen) {
          setIsHotelModalOpen(false);
          setPendingFile(null);
          return;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return function () {
      return document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showAiModal, showFichaModal, showColumnModal, isHotelModalOpen, showImportSummary]);

  // --- Filtros y Ordenación ---

  var _useState47 = useState("activos"),
    _useState48 = _slicedToArray(_useState47, 2),
    filterStatus = _useState48[0],
    setFilterStatus = _useState48[1]; // all, activos, confirmada, anulada

  var _useState49 = useState("future"),
    _useState50 = _slicedToArray(_useState49, 2),
    filterTime = _useState50[0],
    setFilterTime = _useState50[1]; // all, future, past

  var _useState51 = useState(""),
    _useState52 = _slicedToArray(_useState51, 2),
    startDate = _useState52[0],
    setStartDate = _useState52[1];
  var _useState53 = useState(""),
    _useState54 = _slicedToArray(_useState53, 2),
    endDate = _useState54[0],
    setEndDate = _useState54[1];
  var _useState55 = useState(null),
    _useState56 = _slicedToArray(_useState55, 2),
    kpiFilter = _useState56[0],
    setKpiFilter = _useState56[1]; // 'active', 'prospect', 'release', 'followup'

  var _useState57 = useState({
      key: "Entrada",
      direction: "asc"
    }),
    _useState58 = _slicedToArray(_useState57, 2),
    sortConfig = _useState58[0],
    setSortConfig = _useState58[1];

  // --- Normalización de Datos (Fuente de Verdad) ---

  var normalizedData = useMemo(function () {
    return (data || []).map(function (row) {
      var normArrival = toInputDate(row["Entrada"]);
      var stateProps = getStatusProps(row["Com_Estado_Interno"] || row["Segment."], row["Entrada"], row["Estado"]);
      return _objectSpread(_objectSpread({}, row), {}, {
        _normArrival: normArrival,
        _stateLabel: stateProps.label.toLowerCase(),
        _normReserva: normalizeId(row["Reserva"]).toLowerCase(),
        _baseReserva: getBaseId(row["Reserva"]).toLowerCase()
      });
    });
  }, [data]);

  // --- Procesamiento de Datos (Filtrado y Ordenación) ---

  var processedData = useMemo(function () {
    var filtered = normalizedData;

    // 0. Filtro de Validez (Reserva obligatoria) + Normalización de Segmentos

    filtered = filtered.filter(function (row) {
      return row["Reserva"] && row["Reserva"].toString().trim() !== "" && row["Reserva"].toString().trim() !== "-" || row["uid"] && row["uid"].toString().startsWith("PRES-");
    }).map(function (row) {
      var seg = (row["Segment."] || "").toString().trim().toUpperCase();
      if (seg === "GRTANTEO" || seg === "GRUPO TANTEO") {
        return _objectSpread(_objectSpread({}, row), {}, {
          "Segment.": "GRUPO TANTEO"
        });
      }
      return row;
    });
    var today = new Date().toISOString().split("T")[0];

    // 0. Filtro de Cambios Recientes (Importación)

    if (showOnlyChanges) {
      filtered = filtered.filter(function (row) {
        return row._diff;
      });
    }

    // 1. Filtro de Estado
    if (filterStatus !== "all") {
      filtered = filtered.filter(function (row) {
        var label = row._stateLabel;
        if (filterStatus === "activos") return label !== "cancelado" && label !== "desestimado" && label !== "pasado";
        if (filterStatus === "activos_y_desestimados") return label !== "pasado";
        if (filterStatus === "confirmada") return label === "confirmado";
        if (filterStatus === "tentativa") return label === "tentativa";
        if (filterStatus === "presupuesto") return label === "presupuesto";
        if (filterStatus === "desestimada") return label === "cancelado" || label === "desestimado";
        if (filterStatus === "pasado") return label === "pasado";
        return true;
      });
    }

    // 2. Filtro de Tiempo
    if (filterTime !== "all" && filterStatus !== "pasado" && !startDate && !endDate) {
      filtered = filtered.filter(function (row) {
        var arrival = row._normArrival;
        if (!arrival) return false;
        if (filterTime === "future") return arrival >= today;
        if (filterTime === "past") return arrival < today;
        return true;
      });
    }

    // 2.5 Filtro de Fecha (Rango Manual)
    if (startDate || endDate) {
      filtered = filtered.filter(function (row) {
        var arrival = row._normArrival;
        if (!arrival) return false;
        if (startDate && arrival < startDate) return false;
        if (endDate && arrival > endDate) return false;
        return true;
      });
    }
    if (searchTerm) {
      var lowerTerm = searchTerm.toLowerCase();
      var isNumericTerm = /^\d+$/.test(lowerTerm);
      filtered = filtered.filter(function (row) {
        var idMatch = row._normReserva.includes(lowerTerm) || row._baseReserva === lowerTerm || isNumericTerm && row._baseReserva.startsWith(lowerTerm);
        return idMatch || (row["Nombre del Grupo"] || "").toLowerCase().includes(lowerTerm) || (row["Empresa/Agencia"] || "").toLowerCase().includes(lowerTerm) || (row["Com_Comercial"] || "").toLowerCase().includes(lowerTerm) || (row["Segment."] || "").toLowerCase().includes(lowerTerm) || (row["Entrada"] || "").toString().includes(lowerTerm) || row._normArrival.includes(lowerTerm) || (row["Salida"] || "").toString().includes(lowerTerm) || toInputDate(row["Salida"]).includes(lowerTerm) || (row["Importe(*)"] || "").toString().includes(lowerTerm) || (row["Pax."] || "").toString().includes(lowerTerm) || row._stateLabel.includes(lowerTerm);
      });
    }

    // 3.5 Filtro de KPI (Alertas/Estados específicos)

    if (kpiFilter) {
      var now = new Date();
      now.setHours(0, 0, 0, 0);
      var sevenDaysFromNow = new Date(now);
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      filtered = filtered.filter(function (row) {
        var status = (row["Com_Estado_Interno"] || row["Segment."] || row["Estado"] || "PROSPECTO").toUpperCase();
        if (kpiFilter === "active") {
          return status.includes("CONF") || status.includes("BLOQ") || status.includes("OK") || status.includes("CERR");
        }
        if (kpiFilter === "prospect") {
          return status.includes("TANTEO") || status.includes("TENTA") || status.includes("PROSPEC") || status.includes("PRESUP");
        }
        if (kpiFilter === "pendingQuotes") {
          var extStatus = (row["Estado"] || "").toLowerCase();
          var intStatus = (row["Com_Estado_Interno"] || "").toLowerCase();
          var isCancelled = extStatus.includes("anul") || extStatus.includes("cancel") || extStatus.includes("baja") || intStatus.includes("anul") || intStatus.includes("cancel") || intStatus.includes("baja") || extStatus.includes("descart") || intStatus.includes("descart") || extStatus.includes("rechaz") || intStatus.includes("rechaz");
          var arrival = row["Entrada"] ? toInputDate(row["Entrada"]) : null;
          var todayStr = now.toISOString().split("T")[0];
          var isPast = arrival && arrival < todayStr;
          if (isCancelled || isPast) return false;
          var importe = parseNum(row["Importe(*)"]);
          var rawImporte = String(row["Importe(*)"] || "0").trim();
          var isZero = importe === 0 || rawImporte === "" || rawImporte === "0" || rawImporte === "0,00" || rawImporte === "0.00";
          return (status.includes("PRESUP") || status.includes("PEND") || row["Reserva"] && String(row["Reserva"]).startsWith("PRES.")) && isZero;
        }
        if (kpiFilter === "release") {
          var isReleaseUrgent = false;
          var manualPaidVal = parseNum(row["Com_Pagado"] || "0");
          var currentForecast = parseNum(row["Importe(*)"]);
          var isFullyPaid = manualPaidVal >= currentForecast - 0.01;
          if (!isFullyPaid) {
            var roomListStr = row.RoomingList_JSON;
            if (roomListStr) {
              try {
                var roomList = JSON.parse(roomListStr);
                roomList.forEach(function (item) {
                  var dIn = new Date(toInputDate(item.dateIn));
                  if (!isNaN(dIn.getTime())) {
                    var diff = Math.ceil((dIn - now) / (1000 * 60 * 60 * 24));
                    if (diff <= 7) isReleaseUrgent = true;
                  }
                });
              } catch (e) {}
            }
            var comRelease = row.Com_Vencimiento_Rel ? new Date(row.Com_Vencimiento_Rel) : null;
            if (comRelease && !isNaN(comRelease.getTime())) {
              if (comRelease <= sevenDaysFromNow) isReleaseUrgent = true;
            }
          }
          return isReleaseUrgent;
        }
        if (kpiFilter === "followup") {
          var followUp = row.Com_Seguimiento ? new Date(row.Com_Seguimiento) : null;
          if (followUp && !isNaN(followUp.getTime())) {
            return followUp <= now;
          }
          return false;
        }
        return true;
      });
    }

    // 4. Ordenación

    if (sortConfig.key) {
      filtered.sort(function (a, b) {
        var valA = a[sortConfig.key] || "";
        var valB = b[sortConfig.key] || "";

        // Tratamiento especial fechas

        if (sortConfig.key === "Entrada" || sortConfig.key === "Salida") {
          valA = toInputDate(valA) || "9999-99-99";
          valB = toInputDate(valB) || "9999-99-99";
        }

        // Tratamiento números

        if (sortConfig.key === "Importe(*)" || sortConfig.key === "Pax.") {
          valA = parseNum(valA);
          valB = parseNum(valB);
        }
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    // 5. Filtro de Hotel (Vista Directorio)

    if (filterDirHotel) {
      filtered = filtered.filter(function (row) {
        var rowHotel = normalizeHotelName(row["Hotel_Asignado"] || row["Hotel"] || "");
        return rowHotel === normalizeHotelName(filterDirHotel);
      });
    }

    // 6. Filtro de Comercial (Vista Directorio)

    if (filterDirCommercial) {
      filtered = filtered.filter(function (row) {
        var rawC = (row["Com_Comercial"] || "").trim().toUpperCase();
        if (filterDirCommercial === "SIN_ASIGNAR") {
          return rawC === "";
        }
        return rawC === filterDirCommercial.toUpperCase();
      });
    }
    return filtered;
  }, [normalizedData, filterStatus, filterTime, searchTerm, kpiFilter, sortConfig, filterDirHotel, filterDirCommercial, showOnlyChanges, startDate, endDate]);

  // --- Cálculos de Estadísticas Globales (Reemplazado por lógica nueva) ---

  // Se usa stats calculado más abajo basado en processedData

  // --- Agrupación de Datos por "Nombre del Grupo" (Filtrados) ---

  var groupedData = useMemo(function () {
    var groups = {};
    processedData.forEach(function (row) {
      var resId = normalizeId(row["Reserva"]);
      var key = resId; // Agrupamos por ID de reserva único para mantenerlas independientes

      var rowStatus = (row["Estado"] || "").toLowerCase();
      var getStatusPriority = function getStatusPriority(s) {
        if (s.includes("conf") || s.includes("ok")) return 3;
        if (s.includes("tent") || s.includes("pros")) return 2;
        if (s.includes("anul") || s.includes("can")) return 1;
        return 0;
      };
      if (!groups[key]) {
        groups[key] = {
          id: resId,
          name: row["Nombre del Grupo"] || "Sin Nombre",
          agency: row["Empresa/Agencia"] || "",
          arrival: row["Entrada"],
          departure: row["Salida"],
          status: row["Estado"] || "",
          totalPax: 0,
          totalRooms: 0,
          totalRevenue: 0,
          totalPaid: 0,
          totalCommission: 0,
          totalNights: 0,
          hotel: row["Hotel_Asignado"] || row["Hotel"] || "",
          records: []
        };
      } else {
        // Priorizar datos de la fila con mejor estado

        var existingPriority = getStatusPriority(groups[key].status.toLowerCase());
        var currentPriority = getStatusPriority(rowStatus);
        if (currentPriority > existingPriority) {
          groups[key].name = row["Nombre del Grupo"] || groups[key].name;
          groups[key].agency = row["Empresa/Agencia"] || groups[key].agency;
          groups[key].arrival = row["Entrada"];
          groups[key].departure = row["Salida"];
          groups[key].status = row["Estado"];

          // También actualizar hotel si es un registro con mayor prioridad

          groups[key].hotel = row["Hotel_Asignado"] || row["Hotel"] || groups[key].hotel;
        }
      }
      var importe = parseNum(row["Importe(*)"]);
      var suplementos = parseFloat(row.Suplementos || 0);
      var descuentos = parseFloat(row.Descuentos || 0);
      importe = importe + suplementos - descuentos;

      // Guard against corruption: Don't sum if it's already a glitch

      if (importe > 10000000 || importe < -1000000) importe = 0;
      var pax = parseInt(row["Pax."] || 0);
      var rooms = parseInt(row["Cant. Habitaciones"] || row["Cant."] || row["Hab."] || 0);

      // Fallback to RoomingList_JSON if rooms is 0

      if (rooms === 0 && row.RoomingList_JSON) {
        try {
          var rl = JSON.parse(row.RoomingList_JSON);
          rooms = rl.reduce(function (sum, item) {
            return sum + (item.isService ? 0 : parseInt(item.qty) || 0);
          }, 0);
        } catch (e) {}
      }
      var noches = parseInt(row["Noches"] || 0);
      if (!isNaN(pax)) groups[key].totalPax += pax;
      if (!isNaN(rooms)) groups[key].totalRooms += rooms;
      if (!isNaN(noches)) groups[key].totalNights += noches;
      if (!groups[key].hasRoomingListOverride && !isNaN(importe)) {
        groups[key].totalRevenue += importe;
      }
      if (!groups[key].processedJSONs) groups[key].processedJSONs = new Set();
      if (row.RoomingList_JSON && row.RoomingList_JSON !== "[]" && !groups[key].processedJSONs.has("rl_" + row.RoomingList_JSON)) {
        try {
          var _rl = JSON.parse(row.RoomingList_JSON);
          var commVal = _rl.reduce(function (acc, i) {
            var _i$comision;
            return acc + (parseFloat((_i$comision = i.comision) === null || _i$comision === void 0 ? void 0 : _i$comision.total_comision) || 0);
          }, 0);
          groups[key].totalCommission += commVal;
          groups[key].processedJSONs.add("rl_" + row.RoomingList_JSON);
          var rlTotal = _rl.reduce(function (acc, i) {
            return acc + (parseFloat(i.total) || 0);
          }, 0);
          if (rlTotal > 0) {
            groups[key].totalRevenue = rlTotal - commVal;
            groups[key].hasRoomingListOverride = true;
          }
        } catch (e) {}
      }
      var planPaid = 0;
      try {
        var plan = JSON.parse(row.PaymentPlan_JSON || "[]");
        planPaid = plan.filter(function (p) {
          return p.status === "Cobrado";
        }).reduce(function (acc, p) {
          return acc + (parseFloat(p.amount) || 0);
        }, 0);
      } catch (e) {}
      if (row.PaymentPlan_JSON && row.PaymentPlan_JSON !== "[]" && !groups[key].processedJSONs.has("plan_" + row.PaymentPlan_JSON)) {
        groups[key].totalPaid += planPaid;
        groups[key].processedJSONs.add("plan_" + row.PaymentPlan_JSON);
      } else if (!row.PaymentPlan_JSON || row.PaymentPlan_JSON === "[]") {
        var legacyPaid = parseNum(row["Com_Pagado"] || 0);
        var legacyKey = "legacy_paid_" + legacyPaid;
        if (legacyPaid > 0 && !groups[key].processedJSONs.has(legacyKey)) {
          if (legacyPaid > groups[key].totalPaid + 0.05) {
            groups[key].totalPaid = legacyPaid;
            groups[key].processedJSONs.add(legacyKey);
          }
        }
      }
      groups[key].records.push(row);
    });
    return Object.values(groups).sort(function (a, b) {
      var key = sortConfig.key || "totalRevenue";
      var dir = sortConfig.direction === "asc" ? 1 : -1;
      var valA = a[key] !== undefined ? a[key] : a.records && a.records[0] ? a.records[0][key] : "";
      var valB = b[key] !== undefined ? b[key] : b.records && b.records[0] ? b.records[0][key] : "";

      // Special date handling

      if (key === "arrival" || key === "Entrada") {
        return (toInputDate(valA) || "9999").localeCompare(toInputDate(valB) || "9999") * dir;
      }
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return -1 * dir;
      if (valA > valB) return 1 * dir;
      return 0;
    });
  }, [processedData, sortConfig]);

  // --- DEEP LINK: Abrir ficha si viene de Proforma con ?reserva= ---

  // NOTA: Debe estar DESPUÉS de groupedData para que la referencia sea válida cuando Babel transpila a var

  useEffect(function () {
    var params = new URLSearchParams(window.location.search);
    var rUrl = params.get("reserva");
    var rLocal = safeStorage.getItem("nexus_return_reserva");
    var reservaId = rUrl || rLocal;
    if (!reservaId) return;

    // Si no hay datos aún, esperamos la siguiente ejecución

    if (!data || data.length === 0) return;
    var normId = normalizeId(reservaId).toLowerCase();

    // 1. Buscar en la fuente cruda (data) para ver si existe
    var matchInData = (data || []).find(function (r) {
      return normalizeId(r.Reserva).toLowerCase() === normId || normalizeId(r._docId || "").toLowerCase() === normId || normalizeId(r.uid || "").toLowerCase() === normId;
    });
    if (!matchInData) {
      // Si no existe en absoluto, limpiamos y salimos
      if (data && data.length > 0) {
        console.warn("❌ [Deep Link] ID no encontrado en DB:", normId);
        safeStorage.removeItem("nexus_return_reserva");
        if (rUrl) {
          var newUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
      return;
    }

    // 2. Buscar en el listado procesado/filtrado (groupedData)
    var group = (groupedData || []).find(function (g) {
      return g.id.toLowerCase() === normId || g.records.some(function (r) {
        return normalizeId(r.Reserva).toLowerCase() === normId || normalizeId(r._docId || "").toLowerCase() === normId;
      });
    });
    if (!group) {
      // Si existe en data pero no en groupedData, es que los filtros actuales lo bloquean.
      // Abrimos filtros y esperamos al siguiente render.
      if (filterStatus !== "all" || filterTime !== "all" || searchTerm !== "") {
        setFilterStatus("all");
        setFilterTime("all");
        setSearchTerm("");
        setKpiFilter(null);
      }
      return;
    }

    // 3. Si lo encontramos en groupedData, lo abrimos
    if (group) {
      var _group$statusLabel;
      // Limpieza de tokens y URL
      safeStorage.removeItem("nexus_return_reserva");
      if (rUrl) {
        var _newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, _newUrl);
      }

      // Restaurar los filtros por defecto SOLO si el grupo encaja en ellos.
      var label = ((_group$statusLabel = group.statusLabel) === null || _group$statusLabel === void 0 ? void 0 : _group$statusLabel.toLowerCase()) || "";
      var arrival = group.arrival;
      var today = new Date().toISOString().split("T")[0];
      var isActivo = label !== "cancelado" && label !== "anulada" && label !== "pasado";
      var isFuturo = arrival && arrival >= today;
      if (isActivo && isFuturo) {
        setFilterStatus("activos");
        setFilterTime("future");
      } else {
        // Si el grupo es pasado/confirmado-antiguo, mantenemos "all" para asegurar visibilidad
        setFilterStatus("all");
        setFilterTime("all");
      }
      setSearchTerm("");
      setKpiFilter(null);

      // Delay para asegurar que el DOM y el estado de React estén estables
      setTimeout(function () {
        openFicha(group);
      }, 400);
    }
  }, [data, groupedData, filterStatus, filterTime, kpiFilter, searchTerm]);

  // --- Análisis detallado por Segmentos (Filtrados) ---

  var segmentStats = useMemo(function () {
    var segments = {};
    processedData.forEach(function (row) {
      // Filtrar grupos cancelados o pasados de la estadística de rentabilidad

      var stateProps = getStatusProps(row["Com_Estado_Interno"] || row["Segment."], row["Entrada"], row["Estado"]);
      if (stateProps.label === "ANULADA" || stateProps.label === "PASADO") {
        return;
      }
      var segName = (row["Segment."] || "Sin Segmento").toString().trim().toUpperCase();
      if (segName === "GRTANTEO") segName = "GRUPO TANTEO";
      if (segName === "GRUPOS") segName = "GRUPO";
      var groupName = row["Nombre del Grupo"] || "Sin Nombre";
      if (!segments[segName]) {
        segments[segName] = {
          name: segName,
          revenue: 0,
          pax: 0,
          nights: 0,
          count: 0,
          groupList: new Set()
        };
      }
      var importe = parseNum(row["Importe(*)"]);
      var pax = parseInt(row["Pax."] || 0);
      var noches = parseInt(row["Noches"] || 0);
      if (!isNaN(importe)) segments[segName].revenue += importe;
      if (!isNaN(pax)) segments[segName].pax += pax;
      if (!isNaN(noches)) segments[segName].nights += noches;
      segments[segName].count += 1;
      segments[segName].groupList.add(groupName);
    });
    return Object.values(segments).map(function (s) {
      return _objectSpread(_objectSpread({}, s), {}, {
        groupCount: s.groupList.size,
        groups: Array.from(s.groupList).map(function (name) {
          var _groupObj$records;
          var groupObj = groupedData.find(function (g) {
            return g.name === name;
          });
          if (!groupObj) return {
            name: name,
            arrival: null,
            obj: null
          };
          return {
            name: name,
            arrival: (groupObj === null || groupObj === void 0 ? void 0 : groupObj.arrival) || (groupObj === null || groupObj === void 0 || (_groupObj$records = groupObj.records) === null || _groupObj$records === void 0 || (_groupObj$records = _groupObj$records[0]) === null || _groupObj$records === void 0 ? void 0 : _groupObj$records["Entrada"]),
            obj: groupObj
          };
        }).sort(function (a, b) {
          var da = new Date(toInputDate(a.arrival));
          var db = new Date(toInputDate(b.arrival));
          if (isNaN(da.getTime())) return 1;
          if (isNaN(db.getTime())) return -1;
          return da - db;
        })
      });
    }).sort(function (a, b) {
      return b.revenue - a.revenue;
    });
  }, [processedData]);

  // --- Datos para Gráficos Globales (Filtrados) ---

  var chartData = useMemo(function () {
    var monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    var revenueByMonth = {};
    var paxByMonth = {};
    var monthNamesLong = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    processedData.forEach(function (row) {
      var arrival = toInputDate(row["Entrada"]);
      if (arrival) {
        var date = new Date(arrival);
        if (!isNaN(date)) {
          var key = "".concat(monthNames[date.getMonth()], " ").concat(date.getFullYear().toString().slice(-2));
          var importe = parseNum(row["Importe(*)"]);
          var pax = parseInt(row["Pax."] || 0);
          revenueByMonth[key] = (revenueByMonth[key] || 0) + (isNaN(importe) ? 0 : importe);
          paxByMonth[key] = (paxByMonth[key] || 0) + (isNaN(pax) ? 0 : pax);
        }
      }
    });
    var barData = Object.keys(revenueByMonth).map(function (key) {
      return {
        name: key,
        Ingresos: revenueByMonth[key],
        Pax: paxByMonth[key]
      };
    });
    return {
      barData: barData
    };
  }, [processedData]);

  // --- Top Grupos Chart ---

  var topGroupsData = useMemo(function () {
    return groupedData.slice(0, 10).map(function (g) {
      return {
        name: g.name.length > 15 ? g.name.substring(0, 15) + "..." : g.name,
        fullDate: g.name,
        Ingresos: g.totalRevenue
      };
    });
  }, [groupedData]);

  // --- Funciones IA ---

  var handleConsultantClick = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var summary, prompt, result, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            setIsAiLoading(true);
            setShowAiModal(true);
            setAiResult(null);

            // Preparamos el resumen para la IA incluyendo datos de segmentación
            summary = {
              totalRevenue: stats.revenue,
              totalGroups: stats.count,
              topSegments: segmentStats.slice(0, 3).map(function (s) {
                return "".concat(s.name, " (").concat(s.revenue.toFixed(0), "\u20AC)");
              }).join(", "),
              topMonths: chartData.barData.sort(function (a, b) {
                return b.Ingresos - a.Ingresos;
              }).slice(0, 3).map(function (m) {
                return m.name;
              }).join(", ")
            };
            prompt = "Act\xFAa como un analista de Revenue Management experto para un hotel. \n\n                Analiza estos datos resumidos de grupos:\n\n                - Ingresos Totales: ".concat(summary.totalRevenue, "\n\n                - Total Grupos: ").concat(summary.totalGroups, "\n\n                - Top 3 Segmentos (Ingresos): ").concat(summary.topSegments, "\n\n                - Top Meses: ").concat(summary.topMonths, "\n\n                \n\n                Dame 3 conclusiones estrat\xE9gicas breves y 1 recomendaci\xF3n de acci\xF3n. Usa formato Markdown.\n\n                Enf\xF3cate mucho en la rentabilidad de los segmentos. \xBFQu\xE9 segmento deber\xEDamos potenciar?");
            _context.p = 1;
            _context.n = 2;
            return callGemini(prompt);
          case 2:
            result = _context.v;
            // Check if result is an error message

            if (result && (result.includes("Error") || result.includes("Hubo un error"))) {
              setAiResult({
                title: "Error Detectado",
                content: "**Detalles:** ".concat(result, "\n\n*Nota:* Si usas el archivo local (file://), la restricci\xF3n de API web puede bloquearlo.")
              });
            } else {
              setAiResult({
                title: "Análisis Estratégico",
                content: result
              });
            }
            _context.n = 4;
            break;
          case 3:
            _context.p = 3;
            _t = _context.v;
            setAiResult({
              title: "Error Crítico",
              content: _t.message
            });
          case 4:
            setIsAiLoading(false);
          case 5:
            return _context.a(2);
        }
      }, _callee, null, [[1, 3]]);
    }));
    return function handleConsultantClick() {
      return _ref2.apply(this, arguments);
    };
  }();
  var handleEmailClick = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(group) {
      var prompt, result;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            setIsAiLoading(true);
            setShowAiModal(true);
            setAiResult(null);
            prompt = "Escribe un email formal y acogedor para el organizador del grupo \"".concat(group.name, "\".\n\n                Detalles:\n\n                - Agencia: ").concat(group.agency, "\n\n                - Llegada: ").concat(group.arrival, "\n\n                - Salida: ").concat(group.departure, "\n\n                - Pax: ").concat(group.totalPax, "\n\n                - Importe total estimado: ").concat(group.totalRevenue, "\u20AC\n\n                \n\n                El objetivo es confirmar los detalles y dar la bienvenida. Menciona que estamos a su disposici\xF3n para cualquier petici\xF3n especial (dietas, salones, etc). Firma como \"Dpto. de Grupos\". Usa formato Markdown.");
            _context2.n = 1;
            return callGemini(prompt);
          case 1:
            result = _context2.v;
            setAiResult({
              title: "Borrador Email: ".concat(group.name),
              content: result
            });
            setIsAiLoading(false);
          case 2:
            return _context2.a(2);
        }
      }, _callee2);
    }));
    return function handleEmailClick(_x) {
      return _ref3.apply(this, arguments);
    };
  }();
  var handleAiGroupParse = /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
      var prompt, result, cleanJson, parsed, rawResID, resID, _t2;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            if (aiEmailContent.trim()) {
              _context3.n = 1;
              break;
            }
            return _context3.a(2);
          case 1:
            setIsParsingEmail(true);
            prompt = "Analiza el siguiente email y extrae la informaci\xF3n para crear una reserva de grupo. \n\n                Responde EXCLUSIVAMENTE con un objeto JSON v\xE1lido (sin bloques de c\xF3digo markdown) con esta estructura:\n\n                {\n\n                  \"Nombre del Grupo\": \"Nombre extra\xEDdo\",\n\n                  \"Entrada\": \"YYYY-MM-DD\",\n\n                  \"Salida\": \"YYYY-MM-DD\",\n\n                  \"Pax.\": \"N\xFAmero de personas\",\n\n                  \"Empresa/Agencia\": \"Nombre agencia\",\n\n                  \"Hotel_Asignado\": \"Hotel sugerido o vac\xEDo\",\n\n                  \"Com_Comercial\": \"NATALIO\",\n\n                  \"Observaciones\": \"Notas extra\xEDdas\"\n\n                }\n\n                \n\n                Email:\n\n                ".concat(aiEmailContent);
            _context3.p = 2;
            _context3.n = 3;
            return callGemini(prompt);
          case 3:
            result = _context3.v;
            cleanJson = result.replace(/```json/g, "").replace(/```/g, "").trim();
            parsed = JSON.parse(cleanJson);
            rawResID = "PRES." + Math.floor(100000 + Math.random() * 900000);
            resID = normalizeId(rawResID);
            setAiReviewData(_objectSpread(_objectSpread({}, parsed), {}, {
              Reserva: resID,
              Estado: "PROSPECTO",
              Com_Estado_Interno: "PROSPECTO",
              "Importe(*)": "0"
            }));
            setIsAiLoading(false);
            setShowReviewModal(true);
            setShowAddGroupModal(false);
            _context3.n = 5;
            break;
          case 4:
            _context3.p = 4;
            _t2 = _context3.v;
            console.error("Parse error:", _t2);
            alert("No se pudo procesar el email automáticamente. Verifica el formato o inténtalo de nuevo.");
          case 5:
            _context3.p = 5;
            setIsParsingEmail(false);
            return _context3.f(5);
          case 6:
            return _context3.a(2);
        }
      }, _callee3, null, [[2, 4, 5, 6]]);
    }));
    return function handleAiGroupParse() {
      return _ref4.apply(this, arguments);
    };
  }();
  var saveReviewData = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
      var resID, entrada, releaseDate, finalData, _t3;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.p = _context4.n) {
          case 0:
            if (aiReviewData) {
              _context4.n = 1;
              break;
            }
            return _context4.a(2);
          case 1:
            _context4.p = 1;
            resID = aiReviewData.Reserva;
            entrada = aiReviewData.Entrada || "";
            releaseDate = entrada ? function () {
              var d = new Date(entrada);
              if (!isNaN(d.getTime())) {
                d.setDate(d.getDate() - 15);
                return d.toISOString().split("T")[0];
              }
              return "";
            }() : ""; // Aseguramos que los campos requeridos estén presentes
            finalData = _objectSpread(_objectSpread({}, aiReviewData), {}, {
              "Segment.": aiReviewData["Nombre del Grupo"] || "GRUPOS",
              "Importe(*)": aiReviewData["Importe(*)"] || "0",
              "Com_Vencimiento_Rel": aiReviewData["Com_Vencimiento_Rel"] || releaseDate,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            _context4.n = 2;
            return db.collection("groups").doc(resID).set(finalData);
          case 2:
            setShowReviewModal(false);
            setAiReviewData(null);
            setAiEmailContent("");
            alert("🚀 Grupo creado y guardado como Prospecto.");

            // Forzamos recarga de datos si es necesario o dejamos que el listener actúe
            _context4.n = 4;
            break;
          case 3:
            _context4.p = 3;
            _t3 = _context4.v;
            console.error("Save error:", _t3);
            alert("Error al guardar el grupo.");
          case 4:
            return _context4.a(2);
        }
      }, _callee4, null, [[1, 3]]);
    }));
    return function saveReviewData() {
      return _ref5.apply(this, arguments);
    };
  }();
  var handleProformaClick = function handleProformaClick(group) {
    if (!group) return;
    var records = group.records || [];
    if (records.length === 0) {
      alert("⚠️ Este grupo no tiene registros asociados. No se puede generar la proforma.");
      return;
    }

    // Prioridad: buscar un registro que tenga datos fiscales reales

    var baseRecord = records.find(function (r) {
      return r.Fiscal_RazonSocial || r.Fiscal_CIF;
    }) || records[0] || {};
    var recWithPlan = records.find(function (r) {
      return r.PaymentPlan_JSON;
    }) || baseRecord;

    // Detectar el hotel con máxima robustez:

    // 1. group.hotel (del groupedData, ya calculado)

    // 2. Cualquier record con Hotel_Asignado o Hotel

    // 3. Dentro de RoomingList_JSON (clave: algunos grupos importados de Excel

    //    tienen el hotel solo en las líneas de inventario, no en el campo principal)

    var detectHotel = function detectHotel() {
      if (group.hotel) return group.hotel;
      var _iterator = _createForOfIteratorHelper(records),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var r = _step.value;
          var h = r["Hotel_Asignado"] || r["Hotel"] || "";
          if (h && !h.toLowerCase().includes("pending") && h !== "") return h;
        }

        // Buscar dentro de RoomingList_JSON como último recurso
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var _iterator2 = _createForOfIteratorHelper(records),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _r = _step2.value;
          try {
            var rl = JSON.parse(_r["RoomingList_JSON"] || "[]");
            var _iterator3 = _createForOfIteratorHelper(rl),
              _step3;
            try {
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                var item = _step3.value;
                if (item.hotel) return item.hotel;
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
          } catch (e) {}
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return "SERCOTEL GUADIANA";
    };
    var detectedHotel = detectHotel();
    console.log("\uD83C\uDFE8 [ProformaClick] Hotel detectado: \"".concat(detectedHotel, "\" (group.hotel=\"").concat(group.hotel, "\")"));
    var proformaData = _objectSpread(_objectSpread({}, baseRecord), {}, {
      dailyConfig: group.dailyConfig || {},
      extraCharges: group.extraCharges || [],
      PaymentPlan_JSON: recWithPlan.PaymentPlan_JSON || "[]",
      "Nombre del Grupo": group.name,
      "Empresa/Agencia": group.agency || baseRecord["Empresa/Agencia"] || "",
      "Importe(*)": group.totalRevenue || baseRecord["Importe(*)"],
      "Pax.": group.totalPax || baseRecord["Pax."] || "0",
      Entrada: group.arrival || baseRecord["Entrada"],
      Salida: group.departure || baseRecord["Salida"],
      Hotel_Asignado: detectedHotel,
      Hotel: detectedHotel
    });

    // Asegurar campos fiscales explícitos

    var fiscalFields = ["Fiscal_RazonSocial", "Fiscal_CIF", "Fiscal_Direccion", "Fiscal_CP", "Fiscal_Poblacion", "Fiscal_Provincia", "Fiscal_Pais", "Email", "Telefono", "Persona_Contacto"];
    fiscalFields.forEach(function (f) {
      if (baseRecord[f]) proformaData[f] = baseRecord[f];
    });

    // Mapeo de ítems del Room Manager

    var roomList = [];
    var processedIds = new Set();
    records.forEach(function (r) {
      try {
        var list = JSON.parse(r["RoomingList_JSON"] || "[]");
        list.forEach(function (item) {
          if (item.id && !processedIds.has(item.id)) {
            roomList.push(item);
            processedIds.add(item.id);
          } else if (!item.id) {
            roomList.push(item);
          }
        });
      } catch (e) {}
    });

    // MEJORA: Si la roomList está vacía o no tiene servicios, buscar servicios "huérfanos" en los records

    // que puedan venir de una importación de Excel (donde no hay JSON pero sí líneas de servicio)

    if (roomList.length === 0 || !roomList.some(function (i) {
      return i.isService;
    })) {
      records.forEach(function (r, idx) {
        var regime = (r["Régimen"] || "").toUpperCase();
        var isServiceRegime = regime.includes("RESTAURAC") || regime.includes("ALMUERZO") || regime.includes("CENA") || regime.includes("COCTEL");
        var pax = parseInt(r["Pax."] || 0);
        var imp = parseNum(r["Importe(*)"]);

        // Si tiene importe pero no tiene noches/pernoct, o es un régimen de restauración, lo consideramos servicio

        if ((isServiceRegime || imp > 0 && (!r["Noches"] || r["Noches"] == "0")) && pax > 0) {
          // Evitar duplicados si ya de casualidad estaba en el JSON (aunque este check es para cuando el JSON es pobre)

          var concepto = "".concat(r["Régimen"] || "Servicio", " ").concat(r["Entrada"] || "");
          if (!roomList.some(function (i) {
            return i.type === r["Régimen"] && i.dateIn === r["Entrada"];
          })) {
            roomList.push({
              id: "svc-".concat(idx, "-").concat(r["Reserva"]),
              hotel: r["Hotel_Asignado"] || r["Hotel"] || "GENERAL",
              type: r["Régimen"] || "Servicio General",
              dateIn: r["Entrada"],
              dateOut: r["Salida"] || r["Entrada"],
              qty: 1,
              pax: pax,
              price: imp,
              total: imp,
              isService: true,
              iva: 10
            });
          }
        }
      });
    }

    // Resumen de habitaciones para el box de Ocupante

    var summaryParts = [];
    var typeCounts = {};
    roomList.forEach(function (r) {
      if (r.isService) return;
      var t = r.type || "Habitación";
      typeCounts[t] = (typeCounts[t] || 0) + (parseInt(r.qty) || 1);
    });
    Object.entries(typeCounts).forEach(function (_ref6) {
      var _ref7 = _slicedToArray(_ref6, 2),
        type = _ref7[0],
        count = _ref7[1];
      summaryParts.push("".concat(count, " ").concat(type));
    });
    proformaData["RoomSummary"] = summaryParts.join(", ") || "---";
    try {
      var mappedItems = [];
      var fallbackDate = group.arrival || baseRecord["Entrada"] || new Date().toISOString().split("T")[0];
      if (roomList.length > 0) {
        roomList.forEach(function (r) {
          var nights = parseInt(r.nights) || 1;
          var dInStr = toInputDate(r.dateIn) || toInputDate(fallbackDate);
          var dIn = new Date(dInStr);
          for (var i = 0; i < nights; i++) {
            var currentDay = new Date(dIn);
            if (!isNaN(currentDay.getTime())) {
              currentDay.setDate(currentDay.getDate() + i);
            }
            var finalIso = !isNaN(currentDay.getTime()) ? currentDay.toISOString().split("T")[0] : toInputDate(fallbackDate);
            mappedItems.push({
              fecha: formatDate(finalIso),
              hab: "1",
              cant: (parseInt(r.qty) || 1).toString(),
              concepto: "".concat(r.type).concat(r.regime ? " (".concat(r.regime, ")") : ""),
              precio: parseFloat(r.price) || 0,
              iva: parseInt(r.iva || 10),
              regimen: r.regime || "",
              dias: "1",
              comision: r.comision
            });
          }
        });
        if (mappedItems.length > 0) {
          proformaData["ProformaItems"] = mappedItems;

          // En proforma forzamos el importe a la suma de líneas

          proformaData["Importe(*)"] = roomList.reduce(function (acc, r) {
            return acc + (parseFloat(r.total) || 0);
          }, 0).toFixed(2);
        }
      }
    } catch (e) {
      console.error("Error mapping room list", e);
    }
    safeStorage.setItem("selectedGroup", JSON.stringify(proformaData));
    var itemsToPass = proformaData["ProformaItems"] || [];
    safeStorage.setItem("nexus_proforma_items", JSON.stringify(itemsToPass));
    safeStorage.setItem("nexus_proforma_reserva", String(baseRecord["Reserva"] || ""));
    window.location.href = "Fac Prof.html";
  };

  // --- Persistencia FIREBASE ---

  useEffect(function () {
    var unsubscribe = db.collection("groups").onSnapshot(function (snapshot) {
      var dedupedMap = new Map();
      snapshot.forEach(function (doc) {
        var d = doc.data();
        var reserva = d.Reserva || doc.id;
        var normId = normalizeId(reserva);
        var row = _objectSpread(_objectSpread({}, d), {}, {
          _docId: doc.id,
          Reserva: reserva
        });
        var existing = dedupedMap.get(normId);
        if (!existing) {
          dedupedMap.set(normId, row);
        } else {
          var existingIsExact = existing._docId === normId;
          var newIsExact = row._docId === normId;
          if (newIsExact && !existingIsExact) {
            dedupedMap.set(normId, row);
          } else if (!newIsExact && existingIsExact) {
            // Keep existing
          } else {
            var _existing$updatedAt, _row$updatedAt;
            var existingTs = ((_existing$updatedAt = existing.updatedAt) === null || _existing$updatedAt === void 0 ? void 0 : _existing$updatedAt.seconds) || 0;
            var newTs = ((_row$updatedAt = row.updatedAt) === null || _row$updatedAt === void 0 ? void 0 : _row$updatedAt.seconds) || 0;
            if (newTs > existingTs) dedupedMap.set(normId, row);
          }
        }
      });
      var dedupedRoomData = Array.from(dedupedMap.values());

      // Utility inside snapshot to normalize date comparisons

      var toStandardDate = function toStandardDate(v) {
        if (!v) return "";
        var str = String(v).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
          var _str$split = str.split("-"),
            _str$split2 = _slicedToArray(_str$split, 3),
            y = _str$split2[0],
            m = _str$split2[1],
            d = _str$split2[2];
          return "".concat(d, "/").concat(m, "/").concat(y);
        }
        return str;
      };
      var getIsoDate = function getIsoDate(val) {
        if (!val) return "9999-12-31";
        var str = String(val);
        var parts = str.split(/[\/-]/);
        if (parts.length === 3) {
          var y = parts[2].length === 2 ? "20" + parts[2] : parts[2];
          return "".concat(y, "-").concat(parts[1].padStart(2, "0"), "-").concat(parts[0].padStart(2, "0"));
        }
        return str;
      };
      setData(function (prevData) {
        var merged = dedupedRoomData.map(function (dbRow) {
          var resID = normalizeId(dbRow.Reserva);
          if (authorizingIds.current.has(resID)) {
            // Autorización en curso: preservar datos locales (que son los nuevos del Excel)

            // NO usar dbRow que puede tener los datos viejos de Firestore aún no propagados

            var localPreview = prevData.find(function (p) {
              return normalizeId(p.Reserva) === resID;
            });
            if (localPreview) return _objectSpread(_objectSpread({}, localPreview), {}, {
              _diff: null,
              _changes: null
            });
            return _objectSpread(_objectSpread({}, dbRow), {}, {
              _diff: null,
              _changes: null
            });
          }
          var localMatch = prevData.find(function (p) {
            return normalizeId(p.Reserva) === resID;
          });
          if (localMatch) {
            if (localMatch._diff) {
              // No sobreescribir estados de cancelación que vienen de Firestore

              var dbStatus = (dbRow["Com_Estado_Interno"] || "").toUpperCase();
              var isCancelledInDb = dbStatus.includes("CANCEL") || dbStatus.includes("ANUL") || dbStatus.includes("BAJA");
              if (isCancelledInDb) {
                // Firestore marca como cancelado: ignorar estado local, respetar Firestore

                return _objectSpread(_objectSpread(_objectSpread({}, localMatch), dbRow), {}, {
                  _diff: localMatch._diff,
                  _changes: localMatch._changes
                });
              }
              return _objectSpread(_objectSpread({}, dbRow), localMatch);
            }

            // Si no hay diff (datos limpios), debemos combinar local con firestore

            // para no perder columnas excel que firestore no tiene aún.

            // Firestore es fuente de verdad: sus datos prevalecen sobre los locales

            // Preservar solo campos locales que Firestore no tiene (_diff ya es null)

            return _objectSpread(_objectSpread(_objectSpread({}, localMatch), dbRow), {}, {
              _diff: null,
              _changes: null
            });
          }
          return _objectSpread(_objectSpread({}, dbRow), {}, {
            _diff: null,
            _changes: null
          });
        });

        // Elimination of deduplication by baseId to keep multi-segment reservations independent if they use different suffixes

        // merged = deduped;  <-- Removed

        var localNews = (prevData || []).filter(function (p) {
          return p._diff === "new" && !authorizingIds.current.has(String(p.Reserva).trim());
        });
        localNews.forEach(function (p) {
          if (!merged.some(function (m) {
            return String(m.Reserva).trim() === String(p.Reserva).trim();
          })) {
            merged.push(p);
          }
        });
        return merged;
      });
      var allKeys = new Set();
      dedupedRoomData.forEach(function (r) {
        return Object.keys(r).forEach(function (k) {
          if (!["_diff", "updatedAt"].includes(k)) allKeys.add(k);
        });
      });
      setColumns(Array.from(allKeys));
    }, function (error) {
      console.error("Error en tiempo real Firebase:", error);
    });
    var handleVisibility = function handleVisibility() {
      if (document.visibilityState === "visible") {
        // Refrescar panel general al volver de otra pantalla (pestaña) solo si no hay modales abiertos

        // Esto evita que se cierren las fichas de edición al cambiar de pestaña

        if (!showFichaModal && !showAiModal && !isHotelModalOpen) {

          // window.location.reload(); // Desactivado por ahora para evitar cierres accidentales
        }
      }
    };
    window.addEventListener("visibilitychange", handleVisibility);
    return function () {
      unsubscribe();
      window.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Actualizar estadísticas: ENFOQUE COMERCIAL (Grupos, Estados, Pax)

  var stats = useMemo(function () {
    var totalRevenue = 0;
    var totalPax = 0;
    var activeCount = 0;
    var prospectCount = 0;
    var pendingQuotes = 0;
    var unattendedQuotes = 0; // Presupuestos sin comercial asignado

    var uniquePendingGroups = new Set();
    var releaseAlerts = 0;
    var followUpAlerts = 0;
    var uniqueFollowUpGroups = new Set(); // Deduplicar tareas por nombre de grupo

    var proforma24h = 0;
    var commercialsCount = {};
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    var uniqueGroups = new Set();
    processedData.forEach(function (row) {
      var extStatus = (row["Estado"] || "").toLowerCase();
      var intStatus = (row["Com_Estado_Interno"] || "").toLowerCase();
      var isCancelled = extStatus.includes("anul") || extStatus.includes("cancel") || extStatus.includes("baja") || intStatus.includes("anul") || intStatus.includes("cancel") || intStatus.includes("baja") || extStatus.includes("descart") || intStatus.includes("descart") || extStatus.includes("rechaz") || intStatus.includes("rechaz");
      var groupId = row["Reserva"] || row["Nombre del Grupo"];
      var isNewGroup = groupId && !uniqueGroups.has(groupId);
      var importe = parseNum(row["Importe(*)"]);

      // Solo sumar revenue/pax si NO está cancelado (y deduplicando)

      if (!isCancelled && isNewGroup) {
        totalRevenue += importe;
        totalPax += parseInt(row["Pax."] || 0);
      }
      if (isNewGroup) {
        uniqueGroups.add(groupId);
        var comercial = row["Com_Comercial"];
        if (comercial && !isCancelled) {
          if (!commercialsCount[comercial]) commercialsCount[comercial] = 0;
          commercialsCount[comercial]++;
        }
        var status = (row["Com_Estado_Interno"] || row["Segment."] || row["Estado"] || "PROSPECTO").toUpperCase();

        // 1. Tanteos y Presupuestos

        if (status.includes("TANTEO") || status.includes("TENTA") || status.includes("PROSPEC") || status.includes("PRESUP")) {
          if (!isCancelled) {
            prospectCount++;
            var arrival = row["Entrada"] ? toInputDate(row["Entrada"]) : null;
            var todayStr = now.toISOString().split("T")[0];
            var isPast = arrival && arrival < todayStr;
            var isDiscarded = status.includes("DESCART") || status.includes("RECHAZ") || status.includes("ANUL") || status.includes("CANCEL");

            // Siempre excluir pasados o sin fecha del KPI Por Cotizar

            // Deduplicar por nombre de grupo (un grupo con 2 reservas cuenta como 1)

            // Añadido: Sólo debe considerarse "Por Cotizar" si el importe es 0

            var groupLabel = row["Nombre del Grupo"] || groupId;
            var rawImporte = String(row["Importe(*)"] || "0").trim();
            var isZero = importe === 0 || rawImporte === "" || rawImporte === "0" || rawImporte === "0,00" || rawImporte === "0.00";
            if ((status.includes("PRESUP") || row["Reserva"] && String(row["Reserva"]).startsWith("PRES.")) && arrival && !isPast && !isDiscarded && isZero && !uniquePendingGroups.has(groupLabel)) {
              uniquePendingGroups.add(groupLabel);
              pendingQuotes++;
            }
          }
        } else if (status.includes("CONF") || status.includes("BLOQ") || status.includes("OK") || status.includes("CERR")) {
          if (!isCancelled) activeCount++;
        }

        // 1b. Presupuestos sin comercial asignado

        if (status.includes("PRESUP") && !isCancelled) {
          var com = (row["Com_Comercial"] || "").trim();
          if (!com) unattendedQuotes++;
        }

        // 2. Release Alerts

        var isReleaseUrgent = false;
        var manualPaidVal = parseNum(row["Com_Pagado"] || "0");
        var currentForecast = parseNum(row["Importe(*)"]);
        var isFullyPaid = manualPaidVal >= currentForecast - 0.01;
        if (!isFullyPaid) {
          var roomListStr = row.RoomingList_JSON;
          if (roomListStr) {
            try {
              var roomList = JSON.parse(roomListStr);
              roomList.forEach(function (item) {
                var dIn = new Date(toInputDate(item.dateIn));
                if (!isNaN(dIn.getTime())) {
                  var diff = Math.ceil((dIn - now) / (1000 * 60 * 60 * 24));
                  if (diff <= 7) isReleaseUrgent = true;
                }
              });
            } catch (e) {}
          }
          var comRelease = row.Com_Vencimiento_Rel ? new Date(row.Com_Vencimiento_Rel) : null;
          if (comRelease && !isNaN(comRelease.getTime())) {
            if (comRelease <= sevenDaysFromNow) isReleaseUrgent = true;
          }
        }
        if (isReleaseUrgent) releaseAlerts++;

        // 3. Follow-up Alerts — deduplicado por nombre de grupo

        var followUp = row.Com_Seguimiento ? new Date(row.Com_Seguimiento) : null;
        if (followUp && !isNaN(followUp.getTime()) && followUp <= now) {
          var _groupLabel = row["Nombre del Grupo"] || groupId;
          if (!uniqueFollowUpGroups.has(_groupLabel)) {
            uniqueFollowUpGroups.add(_groupLabel);
            followUpAlerts++;
          }
        }

        // 4. Proformas 24h

        if (row.ProformaItems && row.ProformaItems.length > 0) {
          // Si tiene ProformaItems, consideramos que tiene proforma.

          // Podríamos filtrar por fecha si existiera un campo de creación específico.

          proforma24h++;
        }
      }
    });
    return {
      revenue: totalRevenue.toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR"
      }),
      active: activeCount,
      prospects: prospectCount,
      pendingQuotes: pendingQuotes,
      unattendedQuotes: unattendedQuotes,
      releaseAlerts: releaseAlerts,
      followUpAlerts: followUpAlerts,
      proformas: proforma24h,
      pax: totalPax,
      count: uniqueGroups.size,
      commercialsCount: commercialsCount
    };
  }, [processedData]);

  // Auto-abrir Ficha si se detecta bandera en localStorage

  useEffect(function () {
    var groupToOpen = safeStorage.getItem("openGroupFicha");
    if (groupToOpen && (groupedData || []).length > 0) {
      var found = (groupedData || []).find(function (g) {
        return g.name === groupToOpen;
      });
      if (found) {
        openFicha(found);
        safeStorage.removeItem("openGroupFicha");
      }
    }
  }, [groupedData]);
  var requestSort = function requestSort(key) {
    var direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({
      key: key,
      direction: direction
    });
  };

  // Estados para Selección de Hotel en Importación

  var _useState59 = useState(false),
    _useState60 = _slicedToArray(_useState59, 2),
    isHotelModalOpen = _useState60[0],
    setIsHotelModalOpen = _useState60[1];
  var _useState61 = useState(null),
    _useState62 = _slicedToArray(_useState61, 2),
    pendingFile = _useState62[0],
    setPendingFile = _useState62[1];

  // --- Funciones de Archivo (Parser Recargado) ---

  var handleFileUpload = function handleFileUpload(event) {
    var file = event.target.files[0];
    if (!file) return;
    var filename = file.name.toLowerCase();

    // Auto-detectar hotel según el nombre del archivo para evitar errores humanos

    if (filename.includes("guadiana")) {
      confirmHotelAndProcess("Sercotel Guadiana", file);
    } else if (filename.includes("cumbria")) {
      confirmHotelAndProcess("Cumbria Spa&Hotel", file);
    } else {
      setPendingFile(file);
      setIsHotelModalOpen(true);
    }
  };
  var confirmHotelAndProcess = function confirmHotelAndProcess(hotelName) {
    var directFile = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var file = directFile || pendingFile;
    setIsHotelModalOpen(false);
    setPendingFile(null);
    if (!file) {
      alert("Primero selecciona un archivo Excel/CSV.");
      return;
    }
    setLoading(true);
    if (window.ExcelService && window.ExcelService.parseAndMergeFile) {
      window.ExcelService.parseAndMergeFile(file, data, hotelName, function (err, result) {
        setLoading(false);
        if (err) {
          alert(err.message || "Error al procesar el archivo");
          return;
        }
        setData(result.sortedData);
        setColumns(result.columns);
        setImportSummaryData(result.summaryData);
        setShowImportSummary(true);
        if (result.summaryData.newGroupsCount > 0 || result.summaryData.modifiedGroupsCount > 0) {
          setActiveTab("table");
        }
      });
    } else {
      setLoading(false);
      console.error("ExcelService no está disponible en window.");
      alert("Error crítico: El módulo ExcelService no está cargado.");
    }
  };
  var acceptChanges = function acceptChanges() {
    var batch = db.batch();
    var pendingRows = (data || []).filter(function (r) {
      return r._diff;
    });
    if (pendingRows.length === 0) return;
    setIsSaving(true);
    pendingRows.forEach(function (row) {
      var _diff = row._diff,
        _changes = row._changes,
        _docId = row._docId,
        rest = _objectWithoutProperties(row, _excluded);
      var resID = String(row["Reserva"]);

      // Sanitize rest

      var clean = {};
      Object.keys(rest).forEach(function (k) {
        if (rest[k] !== undefined) clean[k] = rest[k];
      });
      var docId = normalizeId(resID);
      var docRef = db.collection("groups").doc(docId);
      var oldTrack = [];
      try {
        oldTrack = JSON.parse(row.tracking || "[]");
      } catch (e) {}
      var importLog = {
        id: Date.now(),
        date: new Date().toLocaleString("es-ES"),
        text: "Importaci\xF3n: Cambio autorizado desde validaci\xF3n."
      };
      batch.set(docRef, _objectSpread(_objectSpread({}, clean), {}, {
        tracking: JSON.stringify([].concat(_toConsumableArray(oldTrack), [importLog])),
        _diff: firebase.firestore.FieldValue.delete(),
        _changes: firebase.firestore.FieldValue.delete(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }), {
        merge: true
      });

      // Limpiar doc duplicado si el _docId original difiere del ID normalizado

      if (row._docId && row._docId !== docId) {
        console.log("\uD83D\uDDD1\uFE0F [acceptChanges] Eliminando doc duplicado: \"".concat(row._docId, "\""));
        batch.delete(db.collection("groups").doc(row._docId));
      }
    });

    // DEBUG: ver exactamente qué datos se guardan

    console.log("[acceptChanges] Guardando cambios, primer row:", pendingRows[0] ? {
      id: pendingRows[0]["Reserva"],
      Entrada: pendingRows[0]["Entrada"],
      Pax: pendingRows[0]["Pax."],
      Importe: pendingRows[0]["Importe(*)"]
    } : null);

    // Marcar IDs para que onSnapshot no los restaure

    pendingRows.forEach(function (r) {
      return authorizingIds.current.add(normalizeId(r["Reserva"]));
    });

    // Optimistic update

    var oldData = _toConsumableArray(data);
    setData(function (prev) {
      return prev.map(function (r) {
        return _objectSpread(_objectSpread({}, r), {}, {
          _diff: null,
          _changes: null
        });
      });
    });
    batch.commit().then(function () {
      console.log("\u2705 Autorizaci\xF3n guardada en Firestore para ".concat(pendingRows.length, " grupo(s)"));

      // IMPORTANTE: mantener 6s de bloqueo para que onSnapshot no restaure datos viejos

      // Firestore puede tardar varios segundos en propagar el cambio al listener

      setTimeout(function () {
        pendingRows.forEach(function (r) {
          return authorizingIds.current.delete(normalizeId(r["Reserva"]));
        });
        console.log("🔓 authorizingIds liberados");
        setIsSaving(false);
      }, 6000);
    }).catch(function (err) {
      console.error("❌ ERROR EN AUTORIZACIÓN MASIVA:", err);
      alert("Error al guardar cambios en Firestore: " + err.message + "\n\nPor favor, comprueba tu conexión e intenta de nuevo.");
      pendingRows.forEach(function (r) {
        return authorizingIds.current.delete(normalizeId(r["Reserva"]));
      });
      setData(oldData); // Restaurar en caso de error

      setIsSaving(false);
    });
  };
  var exportExcel = function exportExcel() {
    var toExport = _toConsumableArray(data);

    // Filtro por Hotel (si hay uno seleccionado)

    if (filterDirHotel) {
      toExport = toExport.filter(function (row) {
        return normalizeHotelName(row["Hotel_Asignado"] || row["Hotel"] || "") === normalizeHotelName(filterDirHotel);
      });
    }

    // Filtro por búsqueda actual

    if (searchTerm) {
      var lowerTerm = searchTerm.toLowerCase();
      toExport = toExport.filter(function (row) {
        var res = (row["Reserva"] || "").toString().toLowerCase();
        var name = (row["Nombre del Grupo"] || "").toLowerCase();
        var agency = (row["Empresa/Agencia"] || "").toLowerCase();
        return res.includes(lowerTerm) || name.includes(lowerTerm) || agency.includes(lowerTerm) || normalizeId(res).includes(lowerTerm) || getBaseId(res).includes(lowerTerm);
      });
    }
    var confirmadas = [];
    var anuladas = [];
    toExport.forEach(function (row) {
      var st = getStatusProps(row["Com_Estado_Interno"] || row["Segment."], row["Entrada"], row["Estado"]);

      // Columnas exactas: Reserva, Nombre del Grupo, Entrada, Salida, Noches, Pax., Empresa/Age, Segment, Régimen, Importe

      var mappedRow = {
        "Reserva": row["Reserva"] || "",
        "Nombre del Grupo": row["Nombre del Grupo"] || "",
        "Entrada": formatDate(row["Entrada"]),
        "Salida": formatDate(row["Salida"]),
        "Noches": row["Noches"] || "",
        "Pax.": row["Pax."] || "",
        "Empresa/Age": row["Empresa/Agencia"] || "",
        "Segment": row["Segment."] || "",
        "Régimen": row["Régimen"] || "",
        "Importe": row["Importe(*)"] || ""
      };
      if (st.label === "ANULADA") {
        anuladas.push(mappedRow);
      } else {
        confirmadas.push(mappedRow);
      }
    });
    var wb = XLSX.utils.book_new();
    var headerOrder = ["Reserva", "Nombre del Grupo", "Entrada", "Salida", "Noches", "Pax.", "Empresa/Age", "Segment", "Régimen", "Importe"];

    // Hoja Confirmadas

    var wsConf = XLSX.utils.json_to_sheet(confirmadas, {
      header: headerOrder
    });
    XLSX.utils.book_append_sheet(wb, wsConf, "Reservas de Grupos CONFIRMADAS");

    // Hoja Anuladas

    var wsAnul = XLSX.utils.json_to_sheet(anuladas, {
      header: headerOrder
    });
    XLSX.utils.book_append_sheet(wb, wsAnul, "Reservas de Grupos ANULADAS");
    var fileName = (filterDirHotel || "Análisis_General") + "_Grupos.xlsx";
    XLSX.writeFile(wb, fileName);
  };

  // --- Funciones de Edición ---

  var handleCellChange = function handleCellChange(rowIndex, column, value) {
    var row = data[rowIndex];
    var resID = String(row["Reserva"]);

    // Actualización optimista

    var newData = _toConsumableArray(data);
    newData[rowIndex][column] = value;
    setData(newData);

    // Actualizar Firebase con merge y timestamp

    var normResID = normalizeId(resID);
    db.collection("groups").doc(normResID).set(_defineProperty(_defineProperty({}, column, value), "updatedAt", firebase.firestore.FieldValue.serverTimestamp()), {
      merge: true
    }).catch(function (err) {
      return console.error("Error editando celda:", err);
    });
  };
  var addNewColumn = function addNewColumn() {
    if (!newColumnName) return;
    var newData = data.map(function (row) {
      return _objectSpread(_objectSpread({}, row), {}, _defineProperty({}, newColumnName, ""));
    });
    setData(newData);
    setColumns([].concat(_toConsumableArray(columns), [newColumnName]));
    setNewColumnName("");
    setShowColumnModal(false);
  };

  // Estados para Ficha de Grupo

  var _useState63 = useState(false),
    _useState64 = _slicedToArray(_useState63, 2),
    showFichaModal = _useState64[0],
    setShowFichaModal = _useState64[1];
  var _useState65 = useState(null),
    _useState66 = _slicedToArray(_useState65, 2),
    selectedGroupFicha = _useState66[0],
    setSelectedGroupFicha = _useState66[1];
  var _useState67 = useState(false),
    _useState68 = _slicedToArray(_useState67, 2),
    showClientData = _useState68[0],
    setShowClientData = _useState68[1];
  var _useState69 = useState({}),
    _useState70 = _slicedToArray(_useState69, 2),
    tempClientData = _useState70[0],
    setTempClientData = _useState70[1];
  var _useState71 = useState(false),
    _useState72 = _slicedToArray(_useState71, 2),
    isSaving = _useState72[0],
    setIsSaving = _useState72[1]; // Spinner mientras acceptChanges guarda

  // Ref con la última lista de inventario guardada (para PROFORMA, evita desincronía con el estado)

  var lastRoomingListRef = useRef({
    groupName: null,
    list: []
  });

  // CRM History Panel

  var _useState73 = useState(false),
    _useState74 = _slicedToArray(_useState73, 2),
    showCrmPanel = _useState74[0],
    setShowCrmPanel = _useState74[1];
  var _useState75 = useState(''),
    _useState76 = _slicedToArray(_useState75, 2),
    crmNote = _useState76[0],
    setCrmNote = _useState76[1];
  var _useState77 = useState([]),
    _useState78 = _slicedToArray(_useState77, 2),
    crmHistory = _useState78[0],
    setCrmHistory = _useState78[1];

  // Load CRM history when a group ficha is opened

  useEffect(function () {
    if (!selectedGroupFicha) {
      setCrmHistory([]);
      return;
    }
    var rec = selectedGroupFicha.records[0] || {};
    try {
      // Unificar: cargar desde 'tracking' como fuente principal de historial

      var hist = JSON.parse(rec['tracking'] || rec['Com_CRM_History'] || '[]');
      setCrmHistory(Array.isArray(hist) ? hist : []);
    } catch (_unused) {
      setCrmHistory([]);
    }
  }, [selectedGroupFicha === null || selectedGroupFicha === void 0 ? void 0 : selectedGroupFicha.id]);
  var addCrmNote = /*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
      var now, fmtDate, newEntry, updated;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.n) {
          case 0:
            if (!(!crmNote.trim() || !selectedGroupFicha)) {
              _context5.n = 1;
              break;
            }
            return _context5.a(2);
          case 1:
            now = new Date();
            fmtDate = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
            newEntry = {
              id: Date.now(),
              date: fmtDate,
              text: "Nota: ".concat(crmNote.trim())
            };
            updated = [newEntry].concat(_toConsumableArray(crmHistory));
            setCrmHistory(updated);
            setCrmNote('');

            // Persist to Firestore en el campo unificado 'tracking'
            _context5.n = 2;
            return updateGroupMetadata(selectedGroupFicha.id, 'tracking', JSON.stringify(updated));
          case 2:
            return _context5.a(2);
        }
      }, _callee5);
    }));
    return function addCrmNote() {
      return _ref8.apply(this, arguments);
    };
  }();
  var _useState79 = useState([{
      label: "Habitación Doble (DBL)",
      pax: 2,
      placeholder: "2 Pax"
    }, {
      label: "Habitación Doble Uso Individual (DUI)",
      pax: 1,
      placeholder: "1 Pax"
    }, {
      label: "Habitación Triple (TPL)",
      pax: 3,
      placeholder: "3 Pax"
    }, {
      label: "Habitación Cuádruple (CUA)",
      pax: 4,
      placeholder: "4 Pax"
    }, {
      label: "Junior Suite (JS1)",
      pax: 1,
      placeholder: "1 Pax"
    }, {
      label: "Junior Suite (JS2)",
      pax: 2,
      placeholder: "2 Pax"
    }, {
      label: "Suite Superior (SS1)",
      pax: 1,
      placeholder: "1 Pax"
    }, {
      label: "Suite Superior (SS2)",
      pax: 2,
      placeholder: "2 Pax"
    }, {
      label: "Servicio: Almuerzo",
      pax: 1,
      isService: true
    }, {
      label: "Servicio: Cena",
      pax: 1,
      isService: true
    }, {
      label: "Servicio: Coffee Break",
      pax: 1,
      isService: true
    }, {
      label: "Servicio: Alquiler Salón",
      pax: 0,
      isService: true
    }]),
    _useState80 = _slicedToArray(_useState79, 2),
    ROOM_CONFIGURATIONS = _useState80[0],
    setRoomConfigurations = _useState80[1];
  useEffect(function () {
    var fetchCommonConfig = /*#__PURE__*/function () {
      var _ref9 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
        var doc, _data2, _t4;
        return _regenerator().w(function (_context6) {
          while (1) switch (_context6.p = _context6.n) {
            case 0:
              _context6.p = 0;
              _context6.n = 1;
              return db.collection("settings").doc("main").get();
            case 1:
              doc = _context6.v;
              if (doc.exists) {
                _data2 = doc.data();
                if (_data2.common && _data2.common.services && _data2.common.services.length > 0) {
                  setRoomConfigurations(_data2.common.services);
                }
              }
              _context6.n = 3;
              break;
            case 2:
              _context6.p = 2;
              _t4 = _context6.v;
              console.error("Error loading common services config:", _t4);
            case 3:
              return _context6.a(2);
          }
        }, _callee6, null, [[0, 2]]);
      }));
      return function fetchCommonConfig() {
        return _ref9.apply(this, arguments);
      };
    }();
    fetchCommonConfig();
  }, []);

  // State for Room Manager Form

  var _useState81 = useState({
      hotel: "",
      type: "Habitación Doble (DBL)",
      dateIn: "",
      dateOut: "",
      qty: 1,
      pax: 2,
      regime: "AD",
      price: 0,
      iva: 10,
      isService: true
    }),
    _useState82 = _slicedToArray(_useState81, 2),
    roomManagerForm = _useState82[0],
    setRoomManagerForm = _useState82[1];
  var _useState83 = useState(null),
    _useState84 = _slicedToArray(_useState83, 2),
    editingId = _useState84[0],
    setEditingId = _useState84[1];

  // State for Commission Modal

  var _useState85 = useState({
      isOpen: false,
      itemIdx: null,
      tempCom: null
    }),
    _useState86 = _slicedToArray(_useState85, 2),
    commissionModal = _useState86[0],
    setCommissionModal = _useState86[1];
  var getPaxByRoomType = function getPaxByRoomType(type) {
    var found = ROOM_CONFIGURATIONS.find(function (c) {
      return c.label === type;
    });
    if (found) return found.pax;
    var t = (type || "").toUpperCase();
    if (t.includes("DUI") || t.includes("JS1") || t.includes("SS1")) return 1;
    if (t.includes("TPL")) return 3;
    if (t.includes("CUA")) return 4;
    if (t.includes("JS2") || t.includes("SS2") || t.includes("DBL")) return 2;
    return 2; // Default
  };
  var calculateDefaultCommission = function calculateDefaultCommission(price, regime, qty, nights, type) {
    var p = parseFloat(price) || 0;
    var q = parseInt(qty) || 1;
    var n = parseInt(nights) || 1;
    var r = (regime || "").toUpperCase();
    var paxPerRoom = getPaxByRoomType(type);
    var porcentaje = 0; // Default commission 0% per request

    // Desglose unitario inicial

    var desglose = {
      Alojamiento: {
        valor: p,
        comisionable: true
      },
      Desayuno: {
        valor: 0,
        comisionable: false
      },
      Almuerzo: {
        valor: 0,
        comisionable: false
      },
      Cena: {
        valor: 0,
        comisionable: false
      }
    };
    var applyMeals = function applyMeals(des, alm, cen) {
      desglose.Desayuno.valor = des;
      desglose.Almuerzo.valor = alm;
      desglose.Cena.valor = cen;

      // Restar del alojamiento total: (desayuno + almuerzo + cena) * personas por habitacion

      desglose.Alojamiento.valor = Math.max(0, p - (des + alm + cen) * paxPerRoom);
    };
    if (r === "AD") applyMeals(5, 0, 0);else if (r === "MP") applyMeals(5, 10, 0);else if (r === "PC") applyMeals(5, 10, 10);else if (r === "TI") applyMeals(4, 8, 8);
    var baseUnitaria = Object.entries(desglose).reduce(function (acc, _ref0) {
      var _ref1 = _slicedToArray(_ref0, 2),
        k = _ref1[0],
        c = _ref1[1];
      return acc + (c.comisionable ? c.valor : 0);
    }, 0);
    return {
      porcentaje: porcentaje,
      modo: "manual",
      desglose: desglose,
      base_unitaria: parseFloat(baseUnitaria.toFixed(2)),
      comision_unitaria: parseFloat((baseUnitaria * porcentaje / 100).toFixed(2)),
      total_comision: parseFloat((baseUnitaria * porcentaje / 100 * q * n).toFixed(2))
    };
  };
  var openFicha = function openFicha(groupOrRow) {
    var group = groupOrRow;

    // Handle case where we receive a flat row (e.g. from Gantt) instead of a grouped object

    if (!group.records) {
      var resId = normalizeId(group["Reserva"]);
      var found = groupedData.find(function (g) {
        return normalizeId(g.id) === resId;
      });
      if (found) {
        group = found;
      } else {
        // Fallback wrapper if not found in groupedData (should be rare)

        group = _objectSpread(_objectSpread({}, groupOrRow), {}, {
          name: groupName,
          records: [groupOrRow]
        });
      }
    }

    // Initialize Room Manager Form with group dates

    if (group.records && group.records.length > 0) {
      var rec = group.records[0];

      // Normalizar el hotel para que coincida con los valores del select (Cumbria / Guadiana)

      var hotelPrincipal = rec["Hotel_Asignado"] || rec["Hotel"] || "Sercotel Guadiana";
      if (hotelPrincipal.toLowerCase().includes("cumbria")) hotelPrincipal = "Cumbria Spa&Hotel";else if (hotelPrincipal.toLowerCase().includes("guadiana")) hotelPrincipal = "Sercotel Guadiana";
      setRoomManagerForm(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          hotel: hotelPrincipal,
          dateIn: rec["Entrada"] || "",
          dateOut: rec["Salida"] || "",
          price: 0 // Reset price
        });
      });
    }

    // Auto-generate Rooming List if empty

    if (group.records && group.records.length > 0) {
      var firstRecord = group.records[0];
      var currentList = [];
      try {
        currentList = JSON.parse(firstRecord["RoomingList_JSON"] || "[]");
      } catch (e) {
        currentList = [];
      }
      if (currentList.length === 0) {
        var newAutoList = [];
        if (group.dailyConfig && Object.keys(group.dailyConfig).length > 0) {
          var _group$records$, _group$records$2;
          var dates = Object.keys(group.dailyConfig).sort();
          var hotelName = group.hotel || ((_group$records$ = group.records[0]) === null || _group$records$ === void 0 ? void 0 : _group$records$["Hotel_Asignado"]) || ((_group$records$2 = group.records[0]) === null || _group$records$2 === void 0 ? void 0 : _group$records$2["Hotel"]) || "H. Pendiente";
          dates.forEach(function (date) {
            var config = group.dailyConfig[date];
            var normalizedRooms = {};
            Object.entries(group.roomCounts || {}).forEach(function (_ref10) {
              var _ref11 = _slicedToArray(_ref10, 2),
                type = _ref11[0],
                count = _ref11[1];
              if (count > 0) normalizedRooms[type.toLowerCase()] = {
                type: type,
                count: Number(count)
              };
            });
            Object.values(normalizedRooms).forEach(function (v) {
              var count = v.count;
              if (config.counts) {
                var overrideKey = Object.keys(config.counts).find(function (k) {
                  return k.toLowerCase() === v.type.toLowerCase();
                });
                if (overrideKey && config.counts[overrideKey] !== '' && config.counts[overrideKey] !== undefined) {
                  count = Number(config.counts[overrideKey]);
                }
              }
              if (count > 0) {
                var price = 0;
                var regime = config.board || group["Régimen"] || "AD";
                var gratuities = 0;
                if (config.prices) {
                  var pk = Object.keys(config.prices).find(function (k) {
                    return k.trim().toLowerCase() === v.type.trim().toLowerCase();
                  });
                  price = pk ? parseFloat(config.prices[pk] || 0) : 0;
                  var gratKey = config.gratuities ? Object.keys(config.gratuities).find(function (k) {
                    return k.trim().toLowerCase() === v.type.trim().toLowerCase();
                  }) : null;
                  gratuities = gratKey ? parseInt(config.gratuities[gratKey] || 0) : 0;
                } else {
                  var tk = Object.keys(config).find(function (k) {
                    return k.trim().toLowerCase() === v.type.trim().toLowerCase();
                  });
                  if (tk && config[tk]) {
                    price = parseFloat(config[tk].price || 0);
                    regime = config[tk].board || regime;
                    gratuities = parseInt(config[tk].gratuities || 0);
                  }
                }

                // Fallback to approximate logic since getPaxByRoomType might be out of scope or we pass string directly

                var paxPerRoom = typeof getPaxByRoomType === 'function' ? getPaxByRoomType(v.type) : v.type.toLowerCase().includes('ind') || v.type.toLowerCase().includes('dui') ? 1 : v.type.toLowerCase().includes('tri') ? 3 : 2;
                var payingRooms = Math.max(0, count - gratuities);
                if (payingRooms > 0) {
                  newAutoList.push({
                    id: Date.now() + Math.random(),
                    hotel: hotelName,
                    type: v.type.toUpperCase(),
                    dateIn: date,
                    dateOut: date,
                    qty: payingRooms,
                    regime: regime,
                    price: price,
                    pax: paxPerRoom,
                    nights: 1,
                    total: (payingRooms * price).toFixed(2),
                    isService: false
                  });
                }
                if (gratuities > 0) {
                  newAutoList.push({
                    id: Date.now() + Math.random(),
                    hotel: hotelName,
                    type: v.type.toUpperCase() + " (GRATUIDAD)",
                    dateIn: date,
                    dateOut: date,
                    qty: gratuities,
                    regime: regime,
                    price: 0,
                    pax: paxPerRoom,
                    nights: 1,
                    total: "0.00",
                    isService: false
                  });
                }
              }
            });
          });
          if (group.extraCharges && group.extraCharges.length > 0) {
            var _group$records$3, _group$records$4;
            var _hotelName = group.hotel || ((_group$records$3 = group.records[0]) === null || _group$records$3 === void 0 ? void 0 : _group$records$3["Hotel_Asignado"]) || ((_group$records$4 = group.records[0]) === null || _group$records$4 === void 0 ? void 0 : _group$records$4["Hotel"]) || "H. Pendiente";

            // Filtramos cargos extra que sean duplicados del régimen

            var regimesToFilter = ["PC", "MP", "AD", "HB", "FB", "SA", "RO", "BB", "HD", "TI"];
            group.extraCharges.forEach(function (ext) {
              var conceptNorm = (ext.concept || "").trim().toUpperCase();

              // Si el concepto es exactamente un régimen, lo saltamos (ya está en la línea de la habitación)

              if (regimesToFilter.includes(conceptNorm)) return;
              var isGlobal = !ext.date || ext.date === 'Todas';
              var d = isGlobal ? dates[0] || "" : ext.date;
              var u = ext.units !== undefined ? ext.units : 1;
              var up = ext.unitPrice !== undefined ? ext.unitPrice : parseFloat(ext.price || 0);
              var qty = u;
              var nights = isGlobal ? Math.max(1, dates.length) : 1;
              newAutoList.push({
                id: Date.now() + Math.random(),
                hotel: _hotelName,
                type: (ext.concept || "Cargo Extra").toUpperCase(),
                dateIn: d,
                dateOut: d,
                qty: qty,
                regime: "-",
                price: up,
                pax: 0,
                // for extra, pax isn't strictly meaningful in the table usually

                nights: nights,
                total: (qty * up * nights).toFixed(2),
                isService: true
              });
            });
          }
        } else {
          // Iterate through all records (multi-hotel) - Fallback

          var uniqueSegments = new Map();
          group.records.forEach(function (r) {
            var rowStatus = (r["Estado"] || "").toLowerCase();
            if (rowStatus.includes("anul") || rowStatus.includes("can")) return;
            var h = r["Hotel_Asignado"] || r["Hotel"] || group.hotel || "H. Pendiente";
            var dIn = r["Entrada"];
            var dOut = r["Salida"];
            var key = "".concat(h, "|").concat(dIn, "|").concat(dOut);
            var imp = parseNum(r["Importe(*)"]);
            var pax = parseInt(r["Pax."] || "0");
            if (!uniqueSegments.has(key)) {
              uniqueSegments.set(key, {
                hotel: h,
                dateIn: dIn,
                dateOut: dOut,
                pax: pax,
                price: imp,
                regime: r["Régimen"] || "AD"
              });
            } else {
              var existing = uniqueSegments.get(key);
              existing.pax += pax;
              existing.price += imp;
              if (!existing.regime || existing.regime === "AD") {
                existing.regime = r["Régimen"] || existing.regime;
              }
            }
          });
          uniqueSegments.forEach(function (seg) {
            if (seg.dateIn && seg.dateOut) {
              var parseDate = function parseDate(dStr) {
                if (!dStr) return null;
                var s = dStr.toString();
                if (/^\d{5}$/.test(s)) {
                  var serial = parseInt(s, 10);
                  if (serial > 25569) {
                    return new Date(Math.round((serial - 25569) * 86400 * 1000));
                  }
                }
                if (s.includes("-") && s.split("-")[0].length <= 2) {
                  var _s$split = s.split("-"),
                    _s$split2 = _slicedToArray(_s$split, 3),
                    d = _s$split2[0],
                    m = _s$split2[1],
                    y = _s$split2[2];
                  return new Date("".concat(y, "-").concat(m, "-").concat(d, "T12:00:00Z"));
                }
                if (s.includes("/") && s.split("/")[0].length <= 2) {
                  var _s$split3 = s.split("/"),
                    _s$split4 = _slicedToArray(_s$split3, 3),
                    _d3 = _s$split4[0],
                    _m3 = _s$split4[1],
                    _y3 = _s$split4[2];
                  return new Date("".concat(_y3, "-").concat(_m3, "-").concat(_d3, "T12:00:00Z"));
                }
                if (s.includes("-") && s.split("-")[0].length === 4) {
                  return new Date("".concat(s, "T12:00:00Z"));
                }
                return new Date(s);
              };
              var start = parseDate(seg.dateIn);
              var end = parseDate(seg.dateOut);
              if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start) {
                for (var d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                  var nextDay = new Date(d);
                  nextDay.setDate(d.getDate() + 1);
                  var totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                  var dailyPrice = totalDays > 0 ? seg.price / totalDays : 0;
                  newAutoList.push({
                    id: Date.now() + Math.random(),
                    hotel: seg.hotel,
                    type: "Habitación (Auto)",
                    dateIn: d.toISOString().split("T")[0],
                    dateOut: nextDay.toISOString().split("T")[0],
                    qty: Math.ceil(seg.pax / 2) || 1,
                    regime: seg.regime || "AD",
                    price: (dailyPrice / (Math.ceil(seg.pax / 2) || 1)).toFixed(2),
                    nights: 1,
                    total: dailyPrice.toFixed(2),
                    isService: false
                  });
                }
              }
            }
          });
        }
        if (newAutoList.length > 0) {
          if (group.records && group.records[0]) {
            group.records[0]["RoomingList_JSON"] = JSON.stringify(newAutoList);
          }
        }
      }
    }

    // Sincronizar ref de inventario para PROFORMA (al abrir ficha)

    try {
      var _rec = group.records && group.records[0];
      if (_rec) {
        var list = JSON.parse(_rec["RoomingList_JSON"] || "[]");
        if (Array.isArray(list) && list.length > 0) lastRoomingListRef.current = {
          groupName: group.name,
          list: list
        };
      }
    } catch (e) {}
    setSelectedGroupFicha(group);
    setShowFichaModal(true);
  };
  var handleMergeGroup = /*#__PURE__*/function () {
    var _ref12 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(sourceGroup) {
      var targetReserva, destId, sourceRecords, sourceIds, batch, destDoc, targetName, _iterator4, _step4, row, oldId, newId, oldRef, newRef, payload, _t5;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.p = _context7.n) {
          case 0:
            targetReserva = prompt("Fusionar \"".concat(sourceGroup.name, "\" con otra reserva existente.\n\nIntroduce el ID de Reserva PMS destino (ej: 205249):"), "");
            if (!(!targetReserva || targetReserva.trim() === "")) {
              _context7.n = 1;
              break;
            }
            return _context7.a(2);
          case 1:
            destId = normalizeId(targetReserva);
            sourceRecords = sourceGroup.records || [];
            sourceIds = sourceRecords.map(function (r) {
              return normalizeId(r["Reserva"]);
            }).filter(function (id) {
              return id !== destId;
            });
            if (!(sourceIds.length === 0)) {
              _context7.n = 2;
              break;
            }
            alert("No hay registros que mover o ya tienen ese ID.");
            return _context7.a(2);
          case 2:
            if (confirm("\xBFEst\xE1s seguro de fusionar todos los datos de \"".concat(sourceGroup.name, "\" en la reserva ").concat(targetReserva, "?\n\nLos registros manuales o de presupuesto se vincular\xE1n al nuevo ID y se eliminar\xE1n los documentos antiguos."))) {
              _context7.n = 3;
              break;
            }
            return _context7.a(2);
          case 3:
            _context7.p = 3;
            batch = db.batch(); // 1. Buscar si la reserva destino ya existe en Firestore para heredar su Nombre del Grupo si es necesario
            _context7.n = 4;
            return db.collection("groups").doc(destId).get();
          case 4:
            destDoc = _context7.v;
            targetName = sourceGroup.name;
            if (destDoc.exists) {
              targetName = destDoc.data()["Nombre del Grupo"] || targetName;
            }

            // 2. Mover registros
            _iterator4 = _createForOfIteratorHelper(sourceRecords);
            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                row = _step4.value;
                oldId = normalizeId(row["Reserva"]);
                newId = destId;
                oldRef = db.collection("groups").doc(oldId);
                newRef = db.collection("groups").doc(newId);
                payload = _objectSpread(_objectSpread({}, row), {}, {
                  Reserva: targetReserva,
                  "Nombre del Grupo": targetName,
                  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                batch.set(newRef, payload, {
                  merge: true
                });
                if (oldId !== newId) {
                  batch.delete(oldRef);
                }
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }
            _context7.n = 5;
            return batch.commit();
          case 5:
            alert("✅ Fusión completada con éxito. Pulsa Aceptar para recargar.");
            window.location.reload();
            _context7.n = 7;
            break;
          case 6:
            _context7.p = 6;
            _t5 = _context7.v;
            console.error("Error en fusión:", _t5);
            alert("❌ Error al fusionar: " + _t5.message);
          case 7:
            return _context7.a(2);
        }
      }, _callee7, null, [[3, 6]]);
    }));
    return function handleMergeGroup(_x2) {
      return _ref12.apply(this, arguments);
    };
  }();
  var openClientDataModal = function openClientDataModal() {
    if (!selectedGroupFicha || !selectedGroupFicha.records) return;
    var baseRecord = selectedGroupFicha.records[0] || {};
    var fields = ["Fiscal_RazonSocial", "Fiscal_CIF", "Persona_Contacto", "Email", "Telefono", "Fiscal_Direccion", "Fiscal_CP", "Fiscal_Poblacion", "Fiscal_Provincia", "Fiscal_Pais", "Observaciones"];
    var initialData = {};
    fields.forEach(function (f) {
      initialData[f] = baseRecord[f] || "";
    });
    setTempClientData(initialData);
    setShowClientData(true);
  };
  var updateGroupMetadata = /*#__PURE__*/function () {
    var _ref13 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(resId, fieldOrUpdates) {
      var valueIfSingle,
        hotelFilterArg,
        updates,
        hVal,
        normH,
        normTargetId,
        currentGroupRows,
        firstRow,
        manualPaid,
        totalRevenue,
        totalCommission,
        rl,
        netRevenue,
        currentPlan,
        filteredPlan,
        newPlan,
        remainingToSubtract,
        hSync,
        batch,
        _args8 = arguments,
        _t6;
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.p = _context8.n) {
          case 0:
            valueIfSingle = _args8.length > 2 && _args8[2] !== undefined ? _args8[2] : null;
            hotelFilterArg = _args8.length > 3 && _args8[3] !== undefined ? _args8[3] : null;
            updates = _typeof(fieldOrUpdates) === "object" ? _objectSpread({}, fieldOrUpdates) : _defineProperty({}, fieldOrUpdates, valueIfSingle); // --- VALIDACIÓN HOTEL ---
            hVal = updates["Hotel_Asignado"] || updates["Hotel"];
            if (!(hVal !== undefined)) {
              _context8.n = 1;
              break;
            }
            normH = String(hVal).toLowerCase();
            if (!(!normH || normH.includes("pend") || normH.trim() === "")) {
              _context8.n = 1;
              break;
            }
            alert("⚠️ Error: No se puede asignar un hotel 'PENDIENTE' o vacío.");
            return _context8.a(2);
          case 1:
            // Si el usuario cambia a CANCELADO desde el dropdown, sincronizar también el campo Estado

            if (updates["Com_Estado_Interno"] === "CANCELADO" && !updates["Estado"]) {
              updates["Estado"] = "ANULADA";
            }

            // Capturar las filas actuales ANTES del update optimista (para el batch de Firestore)

            // Usamos el ID de Reserva para identificar de forma única, evitando agrupaciones por nombre
            normTargetId = normalizeId(resId);
            currentGroupRows = (data || []).filter(function (r) {
              var rowHotel = normalizeHotelName(r["Hotel_Asignado"] || r["Hotel"] || "");
              var filterHotel = hotelFilterArg ? normalizeHotelName(hotelFilterArg) : null;
              return normalizeId(r.Reserva) === normTargetId && (!filterHotel || rowHotel === filterHotel);
            });
            if (!(currentGroupRows.length === 0)) {
              _context8.n = 2;
              break;
            }
            return _context8.a(2);
          case 2:
            // --- SYNC PAYMENT PLAN LOGIC (Apply to all affected rows) ---
            if (updates["Com_Pagado"] !== undefined) {
              try {
                firstRow = currentGroupRows[0];
                manualPaid = parseNum(updates["Com_Pagado"]); // Source of Truth: Net Revenue (Gross - Commission)
                totalRevenue = parseNum(firstRow["Importe(*)"]);
                totalCommission = 0;
                try {
                  rl = JSON.parse(firstRow.RoomingList_JSON || "[]");
                  totalCommission = rl.reduce(function (acc, i) {
                    var _i$comision2;
                    return acc + (parseFloat((_i$comision2 = i.comision) === null || _i$comision2 === void 0 ? void 0 : _i$comision2.total_comision) || 0);
                  }, 0);
                } catch (e) {}
                netRevenue = Math.max(0, totalRevenue - totalCommission);
                currentPlan = [];
                try {
                  currentPlan = JSON.parse(firstRow["PaymentPlan_JSON"] || "[]");
                } catch (e) {
                  currentPlan = [];
                }

                // Remove old manual entries to avoid duplicates
                filteredPlan = currentPlan.filter(function (p) {
                  return !p.id.toString().startsWith("manual-") && p.label !== "Pago a Cuenta";
                });
                newPlan = [];
                if (manualPaid > 0) {
                  newPlan.push({
                    id: "manual-" + Date.now(),
                    label: "Pago a Cuenta",
                    percent: (manualPaid / (netRevenue || 1) * 100).toFixed(1),
                    amount: manualPaid.toFixed(2),
                    releaseDays: 0,
                    date: new Date().toISOString().split("T")[0],
                    status: "Cobrado"
                  });
                }

                // Adjust remaining segments
                remainingToSubtract = manualPaid;
                filteredPlan.forEach(function (p) {
                  var amt = parseNum(p.amount);
                  if (remainingToSubtract > 0) {
                    if (remainingToSubtract >= amt) {
                      remainingToSubtract -= amt;
                      return;
                    } else {
                      amt -= remainingToSubtract;
                      remainingToSubtract = 0;
                    }
                  }
                  if (amt > 0.01) {
                    newPlan.push(_objectSpread(_objectSpread({}, p), {}, {
                      amount: amt.toFixed(2),
                      percent: (amt / (netRevenue || 1) * 100).toFixed(1)
                    }));
                  }
                });
                updates["PaymentPlan_JSON"] = JSON.stringify(newPlan);
              } catch (err) {
                console.error("Error syncing PaymentPlan on Com_Pagado update", err);
              }
            }

            // 1. Optimistic UI Update

            setData(function (prevData) {
              return prevData.map(function (row) {
                var matchesReserva = normalizeId(row.Reserva) === normTargetId;
                var matchesHotel = !hotelFilterArg || (row["Hotel_Asignado"] || row["Hotel"]) === hotelFilterArg;
                if (matchesReserva && matchesHotel) {
                  return _objectSpread(_objectSpread({}, row), updates);
                }
                return row;
              });
            });

            // 2. Update selectedGroupFicha if it matches

            setSelectedGroupFicha(function (prev) {
              if (!prev || normalizeId(prev.id) !== normTargetId) return prev;
              var updatedRecords = prev.records.map(function (r) {
                var rowHotel = normalizeHotelName(r["Hotel_Asignado"] || r["Hotel"] || "");
                var filterHotel = hotelFilterArg ? normalizeHotelName(hotelFilterArg) : null;
                if (!filterHotel || rowHotel === filterHotel) {
                  return _objectSpread(_objectSpread({}, r), updates);
                }
                return r;
              });

              // Recalcular totales para la ficha (Pax e Importe)

              var newTotalPax = updatedRecords.reduce(function (sum, r) {
                return sum + parseInt(r["Pax."] || 0);
              }, 0);
              var newTotalRevenue = updatedRecords.reduce(function (sum, r) {
                return sum + parseNum(r["Importe(*)"]);
              }, 0);

              // Recalcular total de habitaciones desde RoomingList_JSON

              var newTotalRooms = 0;
              if (updatedRecords[0] && updatedRecords[0].RoomingList_JSON) {
                try {
                  var _rl2 = JSON.parse(updatedRecords[0].RoomingList_JSON);
                  newTotalRooms = _rl2.reduce(function (acc, i) {
                    return acc + (i.isService ? 0 : parseInt(i.qty) || 0);
                  }, 0);
                } catch (e) {}
              }
              return _objectSpread(_objectSpread({}, prev), {}, {
                records: updatedRecords,
                totalPax: newTotalPax,
                totalRooms: newTotalRooms,
                totalRevenue: newTotalRevenue,
                name: updates["Nombre del Grupo"] || prev.name,
                // Sincronizar hotel del grupo si se cambió

                hotel: updates["Hotel_Asignado"] || updates["Hotel"] || prev.hotel
              });
            });

            // Sincronizar Hotel de Destino en el Room Manager si se cambia el Hotel Principal

            if (updates["Hotel_Asignado"]) {
              hSync = updates["Hotel_Asignado"];
              if (hSync.toLowerCase().includes("cumbria")) hSync = "Cumbria Spa&Hotel";else if (hSync.toLowerCase().includes("guadiana")) hSync = "Sercotel Guadiana";
              setRoomManagerForm(function (prev) {
                return _objectSpread(_objectSpread({}, prev), {}, {
                  hotel: hSync
                });
              });
            }

            // 3. Persist to Firestore (usa currentGroupRows capturados antes del update optimista)
            _context8.p = 3;
            batch = db.batch();
            currentGroupRows.forEach(function (row) {
              var targetDocId = row._docId || normalizeId(row.Reserva);
              if (targetDocId) {
                var docRef = db.collection("groups").doc(targetDocId);
                var payload = _objectSpread(_objectSpread({}, updates), {}, {
                  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                if (!updates.tracking && !updates.RoomingList_JSON && !updates.PaymentPlan_JSON && !updates.updatedAt) {
                  var changesText = Object.keys(updates).map(function (k) {
                    return "".concat(k, ": ").concat(row[k] || 'vacio', " -> ").concat(updates[k]);
                  }).join(" | ");
                  var now_str = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0') + ' ' + String(new Date().getHours()).padStart(2, '0') + ':' + String(new Date().getMinutes()).padStart(2, '0');
                  var logEntry = { id: Date.now(), date: now_str, text: "Modificaci\xF3n field: ".concat(changesText) };
                  var oldTrack = [];
                  try { oldTrack = JSON.parse(row.tracking || "[]"); } catch (e) {}
                  payload.tracking = JSON.stringify([].concat(_toConsumableArray(oldTrack), [logEntry]));
                }
                batch.set(docRef, payload, { merge: true });
              }
            });
            if (currentGroupRows.length === 0) {
              console.warn("⚠️ updateGroupMetadata: No se encontraron filas para", resId, "- el cambio puede no haberse guardado en Firestore.");
            }
            _context8.n = 4;
            return batch.commit();
          case 4:
            _context8.n = 6;
            break;
          case 5:
            _context8.p = 5;
            _t6 = _context8.v;
            console.error("❌ Error updating metadata:", _t6);
          case 6:
            return _context8.a(2);
        }
      }, _callee8, null, [[3, 5]]);
    }));
    return function updateGroupMetadata(_x3, _x4) {
      return _ref13.apply(this, arguments);
    };
  }();

  // ... (skipping updateGroupMetadata implementation here as I can't easily match large block without context, I will do separate edits if needed) ...

  // --- Room Manager Logic ---

  var addRoomBlock = function addRoomBlock() {
    if (!selectedGroupFicha) return;
    var currentRecord = selectedGroupFicha.records[0] || {};
    var currentList = [];
    try {
      currentList = JSON.parse(currentRecord["RoomingList_JSON"] || "[]");
    } catch (e) {
      currentList = [];
    }
    var nights = parseInt(roomManagerForm.nights) || 1;
    var dIn = new Date();
    if (roomManagerForm.dateIn) {
      dIn = new Date(toInputDate(roomManagerForm.dateIn));
    }
    if (nights < 1) nights = 1;

    // Calcular dateOut para propósitos informativos si es necesario (1 noche por defecto en dOut si no se especifica)

    var dOut = new Date(dIn);
    dOut.setDate(dIn.getDate() + nights);

    // --- Generación de Items (Desglosados o Únicos) ---

    var itemsToAdd = [];
    if (!roomManagerForm.isService && nights > 1) {
      // Desglose diario

      for (var i = 0; i < nights; i++) {
        var currentDay = new Date(dIn);
        currentDay.setDate(dIn.getDate() + i);
        var nextDay = new Date(currentDay);
        nextDay.setDate(currentDay.getDate() + 1);
        var checkinStr = currentDay.toISOString().split("T")[0];
        var checkoutStr = nextDay.toISOString().split("T")[0];
        itemsToAdd.push({
          id: Date.now() + Math.random(),
          hotel: roomManagerForm.hotel || currentRecord["Hotel_Asignado"] || "SERCOTEL GUADIANA",
          type: roomManagerForm.type,
          dateIn: checkinStr,
          dateOut: checkoutStr,
          qty: parseInt(roomManagerForm.qty),
          pax: parseInt(roomManagerForm.pax || 0),
          regime: roomManagerForm.regime,
          price: parseFloat(roomManagerForm.price),
          iva: parseInt(roomManagerForm.iva || 10),
          nights: 1,
          isService: false,
          total: (parseFloat(roomManagerForm.price) * parseInt(roomManagerForm.qty)).toFixed(2),
          comision: calculateDefaultCommission(roomManagerForm.price, roomManagerForm.regime, roomManagerForm.qty, 1, roomManagerForm.type)
        });
      }
    } else {
      var _currentList$find;
      // Item único (Service o una sola noche)

      itemsToAdd.push({
        id: editingId || Date.now(),
        hotel: roomManagerForm.hotel || currentRecord["Hotel_Asignado"] || "SERCOTEL GUADIANA",
        type: roomManagerForm.type,
        dateIn: roomManagerForm.dateIn || currentRecord["Entrada"],
        dateOut: roomManagerForm.isService ? roomManagerForm.dateIn || currentRecord["Entrada"] : roomManagerForm.dateOut || currentRecord["Salida"],
        qty: parseInt(roomManagerForm.qty),
        pax: parseInt(roomManagerForm.pax || 0),
        regime: roomManagerForm.isService ? "" : roomManagerForm.regime,
        price: parseFloat(roomManagerForm.price),
        iva: parseInt(roomManagerForm.iva || 10),
        nights: nights,
        isService: roomManagerForm.isService,
        total: (parseFloat(roomManagerForm.price) * parseInt(roomManagerForm.qty) * nights).toFixed(2),
        comision: editingId ? ((_currentList$find = currentList.find(function (i) {
          return i.id === editingId;
        })) === null || _currentList$find === void 0 ? void 0 : _currentList$find.comision) || calculateDefaultCommission(roomManagerForm.price, roomManagerForm.isService ? "" : roomManagerForm.regime, roomManagerForm.qty, nights, roomManagerForm.type) : calculateDefaultCommission(roomManagerForm.price, roomManagerForm.isService ? "" : roomManagerForm.regime, roomManagerForm.qty, nights, roomManagerForm.type)
      });
    }
    var newList;
    if (editingId) {
      var idx = currentList.findIndex(function (item) {
        return item.id === editingId;
      });
      if (idx !== -1) {
        var _newList;
        newList = _toConsumableArray(currentList);
        (_newList = newList).splice.apply(_newList, [idx, 1].concat(itemsToAdd));
      } else {
        newList = [].concat(_toConsumableArray(currentList), itemsToAdd);
      }
      setEditingId(null);
    } else {
      newList = [].concat(_toConsumableArray(currentList), itemsToAdd);
    }
    var newTotalSum = newList.reduce(function (acc, i) {
      return acc + (parseFloat(i.total) || 0);
    }, 0);
    var newTotalPax = newList.reduce(function (acc, i) {
      return acc + parseInt(i.pax || 0) * parseInt(i.qty || 0);
    }, 0);
    var newTotalRooms = newList.reduce(function (acc, i) {
      return acc + (i.isService ? 0 : parseInt(i.qty || 0));
    }, 0);
    updateGroupMetadata(selectedGroupFicha.id, {
      RoomingList_JSON: JSON.stringify(newList),
      "Importe(*)": newTotalSum.toFixed(2),
      "Pax.": newTotalPax.toString(),
      "Cant.": newTotalRooms.toString()
    });
    setRoomManagerForm(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        qty: 1,
        pax: 2,
        price: 0,
        isService: true
      });
    });
  };
  var handleEditRoomBlock = function handleEditRoomBlock(item) {
    var _selectedGroupFicha$r;
    setRoomManagerForm({
      hotel: item.hotel || ((_selectedGroupFicha$r = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r === void 0 ? void 0 : _selectedGroupFicha$r["Hotel_Asignado"]) || "",
      type: item.type,
      dateIn: item.dateIn,
      dateOut: item.dateOut,
      qty: item.qty,
      pax: item.pax || getPaxByRoomType(item.type),
      regime: item.regime,
      price: item.price,
      iva: item.iva || 10,
      isService: !!item.isService
    });
    setEditingId(item.id);
  };
  var handleRoomManagerDrop = function handleRoomManagerDrop(sourceIndex, targetIndex) {
    if (sourceIndex === targetIndex) return;
    var currentRecord = selectedGroupFicha.records[0] || {};
    var currentList = [];
    try {
      currentList = JSON.parse(currentRecord["RoomingList_JSON"] || "[]");
    } catch (e) {
      return;
    }
    var newList = _toConsumableArray(currentList);
    var _newList$splice = newList.splice(sourceIndex, 1),
      _newList$splice2 = _slicedToArray(_newList$splice, 1),
      moved = _newList$splice2[0];
    newList.splice(targetIndex, 0, moved);
    var newTotalSum = newList.reduce(function (acc, i) {
      return acc + (parseFloat(i.total) || 0);
    }, 0);
    var newTotalPax = newList.reduce(function (acc, i) {
      return acc + parseInt(i.pax || 0) * parseInt(i.qty || 0);
    }, 0);
    var newTotalRooms = newList.reduce(function (acc, i) {
      return acc + parseInt(i.qty || 0);
    }, 0);
    updateGroupMetadata(selectedGroupFicha.id, {
      RoomingList_JSON: JSON.stringify(newList),
      "Importe(*)": newTotalSum.toFixed(2),
      "Pax.": newTotalPax.toString(),
      "Cant.": newTotalRooms.toString()
    });
  };
  var calculateDeposits = function calculateDeposits(group) {
    var distribution = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [100];
    var hotelFilter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var records = hotelFilter ? group.records.filter(function (r) {
      var rowHotel = normalizeHotelName(r["Hotel_Asignado"] || r["Hotel"] || "");
      var filterHotel = normalizeHotelName(hotelFilter);
      return rowHotel === filterHotel;
    }) : group.records;
    if (records.length === 0) return;
    var firstRec = records[0];
    var roomingList = JSON.parse((firstRec === null || firstRec === void 0 ? void 0 : firstRec["RoomingList_JSON"]) || "[]");
    var hotelRoomingItems = hotelFilter ? roomingList.filter(function (i) {
      return normalizeHotelName(i.hotel) === normalizeHotelName(hotelFilter);
    }) : roomingList;
    var grossTotal = hotelRoomingItems.reduce(function (acc, i) {
      return acc + (parseFloat(i.total) || 0);
    }, 0) || records.reduce(function (acc, r) {
      var val = parseNum(r["Importe(*)"]);
      return acc + val;
    }, 0);
    var totalCommission = hotelRoomingItems.reduce(function (acc, i) {
      var _i$comision3;
      return acc + (parseFloat((_i$comision3 = i.comision) === null || _i$comision3 === void 0 ? void 0 : _i$comision3.total_comision) || 0);
    }, 0);
    var total = Math.max(0, grossTotal - totalCommission);
    var entrada = firstRec === null || firstRec === void 0 ? void 0 : firstRec["Entrada"];
    var dateEntrada = new Date();
    if (entrada) {
      var numDate = parseFloat(entrada);
      if (!isNaN(numDate) && numDate > 40000 && numDate < 60000) {
        dateEntrada = new Date(Math.round((numDate - 25569) * 86400 * 1000));
      } else {
        var dateStr = toInputDate(entrada);
        dateEntrada = new Date(dateStr);
      }
    }

    // Default labels/days for standard distributions

    var presetMeta = {
      30: {
        label: "Depósito Inicial",
        days: 60
      },
      70: {
        label: "Pago Final",
        days: 15
      },
      50: {
        label: "Depósito",
        days: 45
      },
      100: {
        label: "Pago Único",
        days: 30
      }
    };
    var manualPaid = parseNum(firstRec["Com_Pagado"] || "0");
    var remainingManual = manualPaid;
    var newPlan = [];

    // Si hay pago manual, lo ponemos como primer bloque si no hay uno previo que lo cubra

    if (manualPaid > 0) {
      newPlan.push({
        id: "manual-" + Date.now(),
        label: "Pago a Cuenta",
        percent: (manualPaid / total * 100).toFixed(1),
        amount: manualPaid.toFixed(2),
        releaseDays: 0,
        date: new Date().toISOString().split("T")[0],
        status: "Cobrado"
      });
    }
    var getOrdinalLabel = function getOrdinalLabel(index, total) {
      if (total === 1) return "Pago Único";
      if (index === total - 1) return "Pago Final";
      var labels = ["Primer Pago", "Segundo Pago", "Tercer Pago", "Cuarto Pago", "Quinto Pago"];
      return labels[index] || "Pago ".concat(index + 1);
    };
    distribution.forEach(function (pct, idx) {
      var _presetMeta$pct$toStr;
      var label = getOrdinalLabel(idx, distribution.length);
      var meta = {
        label: label,
        days: ((_presetMeta$pct$toStr = presetMeta[pct.toString()]) === null || _presetMeta$pct$toStr === void 0 ? void 0 : _presetMeta$pct$toStr.days) || 30
      };
      var date = new Date(dateEntrada);
      date.setDate(date.getDate() - meta.days);
      var amount = total * (pct / 100);

      // Si el pago manual cubre parte o todo de este segmento, lo descontamos

      if (remainingManual > 0) {
        if (remainingManual >= amount) {
          remainingManual -= amount;
          return; // Este segmento ya está cubierto por el pago a cuenta
        } else {
          amount -= remainingManual;
          remainingManual = 0;
        }
      }
      if (amount > 0.01) {
        newPlan.push({
          id: Date.now() + Math.random(),
          label: meta.label,
          percent: (amount / total * 100).toFixed(1),
          amount: amount.toFixed(2),
          releaseDays: meta.days,
          date: date.toISOString().split("T")[0],
          status: "Pendiente"
        });
      }
    });
    updateGroupMetadata(group.id, {
      PaymentPlan_JSON: JSON.stringify(newPlan)
    }, null, hotelFilter);
  };
  var updatePaymentPlan = function updatePaymentPlan(resId, hotelFilter, plan) {
    updateGroupMetadata(resId, "PaymentPlan_JSON", JSON.stringify(plan), hotelFilter);
  };
  var addNewRow = function addNewRow() {
    var emptyRow = {};
    columns.forEach(function (col) {
      return emptyRow[col] = "";
    });
    emptyRow["Entrada"] = new Date().toISOString().split("T")[0];
    setData([emptyRow].concat(_toConsumableArray(data)));
  };
  var removeRoomBlock = function removeRoomBlock(id) {
    if (!selectedGroupFicha) return;
    var currentRecord = selectedGroupFicha.records[0] || {};
    var currentList = [];
    try {
      currentList = JSON.parse(currentRecord["RoomingList_JSON"] || "[]");
    } catch (e) {
      return;
    }
    var newList = currentList.filter(function (item) {
      return item.id !== id;
    });
    var newTotalSum = newList.reduce(function (acc, i) {
      return acc + (parseFloat(i.total) || 0);
    }, 0);
    var newTotalPax = newList.reduce(function (acc, i) {
      return acc + parseInt(i.pax || 0) * parseInt(i.qty || 0);
    }, 0);
    var newTotalRooms = newList.reduce(function (acc, i) {
      return acc + parseInt(i.qty || 0);
    }, 0);
    updateGroupMetadata(selectedGroupFicha.id, {
      RoomingList_JSON: JSON.stringify(newList),
      "Importe(*)": newTotalSum.toFixed(2),
      "Pax.": newTotalPax.toString(),
      "Cant.": newTotalRooms.toString()
    });
  };
  var toggleGroupExpand = function toggleGroupExpand(groupName) {
    if (expandedGroup === groupName) setExpandedGroup(null);else setExpandedGroup(groupName);
  };
  var clearDatabase = /*#__PURE__*/function () {
    var _ref15 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9() {
      var secondConfirm, snapshot, batch, _t7;
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.p = _context9.n) {
          case 0:
            if (window.confirm("⚠️ ATENCIÓN: ¿Estás ABSOLUTAMENTE seguro de que quieres BORRAR TODA la base de datos de grupos?\n\nEsta acción eliminará todos los registros en Firestore y NO se puede deshacer.")) {
              _context9.n = 1;
              break;
            }
            return _context9.a(2);
          case 1:
            secondConfirm = window.confirm("Segunda confirmación: ¿Realmente quieres borrar TODO?");
            if (secondConfirm) {
              _context9.n = 2;
              break;
            }
            return _context9.a(2);
          case 2:
            _context9.p = 2;
            _context9.n = 3;
            return db.collection("groups").get();
          case 3:
            snapshot = _context9.v;
            if (!snapshot.empty) {
              _context9.n = 4;
              break;
            }
            alert("La base de datos ya está vacía.");
            return _context9.a(2);
          case 4:
            batch = db.batch();
            snapshot.docs.forEach(function (doc) {
              batch.delete(doc.ref);
            });
            _context9.n = 5;
            return batch.commit();
          case 5:
            alert("✅ Base de datos borrada con éxito. El sistema está ahora vacío y listo para una nueva importación.");

            // log

            setData([]); // Leave completely empty for debug
            _context9.n = 7;
            break;
          case 6:
            _context9.p = 6;
            _t7 = _context9.v;
            console.error("❌ Error al borrar DB:", _t7);
            alert("Error al borrar la base de datos: " + _t7.message);
          case 7:
            return _context9.a(2);
        }
      }, _callee9, null, [[2, 6]]);
    }));
    return function clearDatabase() {
      return _ref15.apply(this, arguments);
    };
  }();
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen pb-10 bg-dot-pattern"
  }, /*#__PURE__*/React.createElement("header", {
    className: "bg-white border-b border-slate-200 py-3 shadow-sm sticky top-0 z-50"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container mx-auto px-4 flex items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4 flex-1"
  }, /*#__PURE__*/React.createElement("a", {
    href: "Admin.html",
    className: "p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500",
    title: "Volver al Admin"
  }, /*#__PURE__*/React.createElement(IconChevronLeft, {
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 rounded-xl p-1.5 shadow-inner border border-slate-100"
  }, /*#__PURE__*/React.createElement("img", {
    src: "Nexus%20Groups/Nexus_Groups_ICO-removebg-preview.png",
    className: "h-8 w-auto object-contain",
    alt: "Nexus Logo"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "text-xl font-black text-slate-800 leading-none flex items-center gap-2"
  }, "Nexus ", /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-600"
  }, "Groups"), (hotelSettings === null || hotelSettings === void 0 ? void 0 : hotelSettings.lastImportDate) && /*#__PURE__*/React.createElement("span", {
    className: "ml-3 px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[8px] font-black uppercase tracking-widest animate-pulse-slow"
  }, "Actualizado: ", new Date(hotelSettings.lastImportDate).toLocaleDateString("es-ES", {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }))), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-slate-500 font-medium mt-0.5"
  }, "Gesti\xF3n unificada de grupos y an\xE1lisis predictivo.")))), /*#__PURE__*/React.createElement("div", {
    className: "hidden lg:flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://nataliogc.github.io/menus-eventos/admin.html",
    target: "_blank",
    rel: "noopener noreferrer",
    className: "p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all",
    title: "Men\xFAs Eventos"
  }, /*#__PURE__*/React.createElement(IconUtensils, {
    size: 20
  })), /*#__PURE__*/React.createElement("a", {
    href: "https://nataliogc.github.io/Menus-Turisticos/",
    target: "_blank",
    rel: "noopener noreferrer",
    className: "p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all",
    title: "Men\xFAs Tur\xEDsticos"
  }, /*#__PURE__*/React.createElement(IconMap, {
    size: 20
  })), /*#__PURE__*/React.createElement("a", {
    href: "https://nataliogc.github.io/menus-cocteles/",
    target: "_blank",
    rel: "noopener noreferrer",
    className: "p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all",
    title: "Men\xFAs C\xF3cteles"
  }, /*#__PURE__*/React.createElement(IconMartini, {
    size: 20
  })), /*#__PURE__*/React.createElement("button", {
    onClick: handleConsultantClick,
    className: "p-2 text-slate-400 hover:text-[#2d5a43] hover:bg-emerald-50 rounded-full transition-all group relative",
    title: "Nexus AI Hub - An\xE1lisis de Estrategia"
  }, /*#__PURE__*/React.createElement(IconBrain, {
    size: 22,
    className: "group-hover:scale-110 transition-transform"
  }), /*#__PURE__*/React.createElement("span", {
    className: "absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-8 w-[1px] bg-slate-200 mx-1 hidden md:block"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-1 md:gap-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "p-2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer",
    title: "Importar"
  }, /*#__PURE__*/React.createElement(IconUpload, {
    size: 20
  }), /*#__PURE__*/React.createElement("input", {
    type: "file",
    className: "hidden",
    accept: ".csv, .xlsx, .xls",
    onChange: handleFileUpload
  })), /*#__PURE__*/React.createElement("button", {
    onClick: exportExcel,
    className: "p-2 text-slate-400 hover:text-emerald-600 transition-colors",
    title: "Exportar Excel"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-file-excel text-xl"
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "w-full px-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-row flex-nowrap gap-3 mb-4 overflow-x-auto pb-2 custom-scrollbar"
  }, stats.pendingQuotes > 0 && /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return window.location.href = "Presupuestos.html";
    },
    className: "min-w-[170px] flex-1 bg-rose-50 p-3 rounded-2xl shadow-sm border border-rose-200 flex flex-col justify-center cursor-pointer hover:bg-rose-100 transition-colors animate-pulse"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 mb-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-1 h-3 bg-rose-600 rounded-full"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-rose-600 font-bold uppercase tracking-wider"
  }, "Por Cotizar")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl font-black text-rose-700 tabular-nums leading-none"
  }, stats.pendingQuotes), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold text-rose-500 uppercase"
  }, "Grupos"))), /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setKpiFilter("release");
    },
    className: "min-w-[170px] flex-1 bg-white p-3 rounded-2xl shadow-sm border flex flex-col justify-center cursor-pointer transition-colors ".concat(kpiFilter === "release" ? "border-rose-400 ring-2 ring-rose-100 bg-rose-50" : "border-slate-100 hover:border-rose-200 hover:bg-rose-50/50")
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 mb-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-1 h-3 bg-rose-500 rounded-full"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 font-bold uppercase tracking-wider"
  }, "Release")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl font-black text-slate-800 tabular-nums leading-none"
  }, stats.releaseAlerts), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold text-rose-500 uppercase"
  }, "Cr\xEDticos"))), /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setKpiFilter("followup");
    },
    className: "min-w-[170px] flex-1 bg-white p-3 rounded-2xl shadow-sm border flex flex-col justify-center cursor-pointer transition-colors ".concat(kpiFilter === "followup" ? "border-blue-400 ring-2 ring-blue-100 bg-blue-50" : "border-slate-100 hover:border-blue-200 hover:bg-blue-50/50")
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 mb-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-1 h-3 bg-blue-500 rounded-full"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 font-bold uppercase tracking-wider"
  }, "Tareas")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl font-black text-slate-800 tabular-nums leading-none"
  }, stats.followUpAlerts), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold text-blue-500 uppercase"
  }, "Pendientes"))), stats.unattendedQuotes > 0 && /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      window.location.href = "Presupuestos.html";
    },
    className: "min-w-[170px] flex-1 bg-amber-50 border-2 border-amber-300 p-3 rounded-2xl shadow-sm flex flex-col justify-center cursor-pointer hover:bg-amber-100 transition-colors animate-pulse"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 mb-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-1 h-3 bg-amber-500 rounded-full"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-amber-600 font-black uppercase tracking-wider"
  }, "Recepci\xF3n")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-2xl font-black text-amber-700 tabular-nums leading-none"
  }, stats.unattendedQuotes), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold text-amber-500 uppercase"
  }, "Sin atender"))), /*#__PURE__*/React.createElement("div", {
    className: "w-[1px] bg-slate-200 mx-2 flex-shrink-0 self-stretch my-2"
  }), Object.entries(stats.commercialsCount || {}).sort(function (a, b) {
    return b[1] - a[1];
  }).map(function (_ref16) {
    var _ref17 = _slicedToArray(_ref16, 2),
      name = _ref17[0],
      count = _ref17[1];
    return /*#__PURE__*/React.createElement("div", {
      key: name,
      className: "min-w-[140px] flex-1 bg-slate-50/50 p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center hover:bg-white transition-colors"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 mb-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-1 h-3 rounded-full ".concat(getCommColor(name))
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate"
    }, name)), /*#__PURE__*/React.createElement("div", {
      className: "flex items-baseline gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-2xl font-black text-slate-700 tabular-nums leading-none"
    }, count), /*#__PURE__*/React.createElement("span", {
      className: "text-[10px] font-bold text-slate-400 uppercase"
    }, "Grupos")));
  })), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-3 rounded-2xl shadow-sm border border-slate-200 mb-4 flex flex-col xl:flex-row items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 w-full xl:w-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 p-2 rounded-xl border border-slate-100 shadow-inner text-slate-400"
  }, /*#__PURE__*/React.createElement(IconGroup, {
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-black text-slate-800 tracking-tight leading-none"
  }, "Gesti\xF3n de Grupos"), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] text-slate-500 font-medium mt-0.5"
  }, "Directorio unificado de reservas y an\xE1lisis."))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2 items-center w-full xl:flex-1 xl:justify-end"
  }, kpiFilter && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg animate-pulse"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(IconFilter, {
    size: 10
  }), " ", kpiFilter.toUpperCase()), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setKpiFilter(null);
    },
    className: "text-amber-500 hover:text-amber-700 font-bold text-xs"
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "relative w-full sm:w-64"
  }, /*#__PURE__*/React.createElement(IconSearch, {
    className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400",
    size: 14
  }), /*#__PURE__*/React.createElement(DebouncedSearchInput, {
    placeholder: "Buscar...",
    className: "w-full border-slate-200 border rounded-lg pl-11 pr-10 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 font-bold text-slate-700",
    value: searchTerm,
    onChange: setSearchTerm
  }), searchTerm && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setSearchTerm("");
    },
    className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors",
    title: "Limpiar b\xFAsqueda"
  }, /*#__PURE__*/React.createElement(IconX, {
    size: 12
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5"
  }, /*#__PURE__*/React.createElement(IconCalendar, {
    size: 16,
    className: "text-slate-500"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-bold text-slate-500 uppercase"
  }, "Desde:"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "bg-white border border-slate-200 rounded px-1 text-[10px] font-bold text-slate-700 outline-none w-[110px]",
    value: startDate,
    onChange: function onChange(e) {
      return setStartDate(e.target.value);
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-bold text-slate-500 uppercase"
  }, "Hasta:"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "bg-white border border-slate-200 rounded px-1 text-[10px] font-bold text-slate-700 outline-none w-[110px]",
    value: endDate,
    onChange: function onChange(e) {
      return setEndDate(e.target.value);
    }
  })), (startDate || endDate) && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setStartDate("");
      setEndDate("");
    },
    className: "text-slate-400 hover:text-rose-500 ml-1 transition-colors",
    title: "Limpiar fechas"
  }, /*#__PURE__*/React.createElement(IconX, {
    size: 12
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-1.5 items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-black text-slate-400 uppercase tracking-widest"
  }, "Estado"), /*#__PURE__*/React.createElement("select", {
    className: "bg-transparent text-[10px] font-bold text-slate-700 outline-none min-w-[80px]",
    value: filterStatus,
    onChange: function onChange(e) {
      return setFilterStatus(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "all"
  }, "Todos"), /*#__PURE__*/React.createElement("option", {
    value: "activos"
  }, "Activos"), /*#__PURE__*/React.createElement("option", {
    value: "activos_y_desestimados"
  }, "Activos y Desestimados"), /*#__PURE__*/React.createElement("option", {
    value: "confirmada"
  }, "Confirmados"), /*#__PURE__*/React.createElement("option", {
    value: "tentativa"
  }, "Tentativas"), /*#__PURE__*/React.createElement("option", {
    value: "presupuesto"
  }, "Presupuestos"), /*#__PURE__*/React.createElement("option", {
    value: "desestimada"
  }, "Desestimados"), /*#__PURE__*/React.createElement("option", {
    value: "pasado"
  }, "Pasados"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-black text-slate-400 uppercase tracking-widest"
  }, "Hotel"), /*#__PURE__*/React.createElement("select", {
    className: "bg-transparent text-[10px] font-bold text-slate-700 outline-none max-w-[100px]",
    value: filterDirHotel,
    onChange: function onChange(e) {
      return setFilterDirHotel(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Todos"), _toConsumableArray(new Set(groupedData.map(function (g) {
    var _g$records$, _g$records$2;
    var h = ((_g$records$ = g.records[0]) === null || _g$records$ === void 0 ? void 0 : _g$records$["Hotel_Asignado"]) || ((_g$records$2 = g.records[0]) === null || _g$records$2 === void 0 ? void 0 : _g$records$2["Hotel"]);
    return normalizeHotelName(h);
  }).filter(Boolean))).sort().map(function (h) {
    return /*#__PURE__*/React.createElement("option", {
      key: h,
      value: h
    }, h);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-black text-slate-400 uppercase tracking-widest text-purple-600"
  }, "Com."), /*#__PURE__*/React.createElement("select", {
    className: "bg-transparent text-[10px] font-bold text-slate-700 outline-none",
    value: filterDirCommercial,
    onChange: function onChange(e) {
      return setFilterDirCommercial(e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "Todos"), /*#__PURE__*/React.createElement("option", {
    value: "SIN_ASIGNAR"
  }, "S/A"), commercials.filter(function (c) {
    return c.active;
  }).map(function (c) {
    return /*#__PURE__*/React.createElement("option", {
      key: c.name,
      value: c.name
    }, c.name);
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return requestSort("Entrada");
    },
    className: "p-1 rounded transition-all ".concat(sortConfig.key === "Entrada" ? "bg-white shadow-sm ring-1 ring-slate-200" : "hover:bg-white text-slate-400"),
    title: "Ordenar por Fecha"
  }, /*#__PURE__*/React.createElement(IconCalendar, {
    size: 12,
    className: sortConfig.key === "Entrada" ? "text-blue-600" : ""
  })), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return requestSort("Importe(*)");
    },
    className: "p-1 rounded transition-all ".concat(sortConfig.key === "Importe(*)" ? "bg-white shadow-sm ring-1 ring-slate-200" : "hover:bg-white text-slate-400"),
    title: "Ordenar por Importe"
  }, /*#__PURE__*/React.createElement(IconChart, {
    size: 12,
    className: sortConfig.key === "Importe(*)" ? "text-emerald-600" : ""
  })))))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4 mb-3 border-b border-gray-300 overflow-x-auto items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab("calendar");
    },
    className: "pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap ".concat(activeTab === "calendar" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-500 transition")
  }, /*#__PURE__*/React.createElement(IconCalendar, {
    size: 18
  }), " Calendario (Gantt)"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab("groups");
    },
    className: "pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap ".concat(activeTab === "groups" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-500 transition")
  }, /*#__PURE__*/React.createElement(IconGroup, {
    size: 18
  }), " Por Grupos", " ", /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] bg-slate-100 px-1.5 rounded-full"
  }, groupedData.length)), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab("segments");
    },
    className: "pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap ".concat(activeTab === "segments" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-500 transition")
  }, /*#__PURE__*/React.createElement(IconPieChart, {
    size: 18
  }), " Segmentaci\xF3n"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.location.href = 'Presupuestos.html';
    },
    className: "pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap text-gray-500 hover:text-indigo-600 transition"
  }, /*#__PURE__*/React.createElement(IconFileInvoice, {
    size: 18
  }), " Seg Presup", " ", /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] bg-indigo-100 text-indigo-700 px-1.5 rounded-full font-bold"
  }, data.filter(function (r) {
    var est = (r.Estado || "").toUpperCase();
    var intEst = (r.Com_Estado_Interno || "").toUpperCase();
    var isBudget = String(r.Reserva || "").startsWith("PRES-") || est.includes("PRESUPUESTO") || intEst.includes("PRESUPUESTO") || intEst.includes("ENVIADO") || intEst.includes("SEGUIMIENTO") || intEst.includes("PENDIENTE");
    if (!isBudget) return false;
    var isCancelled = ["CANCEL", "ANUL", "GASTOS", "DESESTIMADO", "BAJA"].some(function (status) {
      return intEst.includes(status) || est.includes(status);
    });
    var isConfirmed = intEst.includes("CONFIRM") || est.includes("CONFIRM");
    var departureStr = r.Salida || r.Entrada || "";
    var todayStr = new Date().toISOString().split('T')[0];
    var isPast = departureStr && departureStr < todayStr;
    return !isCancelled && !isConfirmed && !isPast;
  }).length)), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.location.href = 'Proformas.html';
    },
    className: "pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap text-gray-500 hover:text-emerald-600 transition"
  }, /*#__PURE__*/React.createElement(IconFileInvoice, {
    size: 18
  }), " Fac Prof."), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setActiveTab("table");
    },
    className: "pb-2 px-4 font-medium flex items-center gap-2 whitespace-nowrap ".concat(activeTab === "table" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-blue-500 transition")
  }, /*#__PURE__*/React.createElement(IconTable, {
    size: 18
  }), " Validaci\xF3n Importaci\xF3n", " ", (data || []).filter(function (r) {
    return r._diff;
  }).length > 0 && /*#__PURE__*/React.createElement("span", {
    className: "ml-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"
  })))), activeTab === "calendar" && /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl shadow p-4 overflow-hidden animate-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col md:flex-row justify-between items-center mb-4 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-slate-800"
  }, "Calendario de Ocupaci\xF3n (Pr\xF3ximos 90 D\xEDas)"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 text-xs mt-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-3 h-3 rounded bg-emerald-500"
  }), " ", "Confirmado"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-3 h-3 rounded bg-indigo-500"
  }), " ", "Bloqueado"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-3 h-3 rounded bg-amber-500"
  }), " ", "Prospecto/Pend."), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-3 h-3 rounded bg-blue-400"
  }), " ", "Enviado"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-3 h-3 rounded bg-red-400 opacity-50"
  }), " ", "Cancelado")))), /*#__PURE__*/React.createElement("div", {
    className: "overflow-auto relative pb-4 custom-scrollbar",
    style: {
      maxHeight: "calc(100vh - 280px)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "3856px",
      minWidth: "3856px"
    }
  }, " ", /*#__PURE__*/React.createElement("div", {
    className: "flex border-b border-slate-100 sticky top-0 bg-white z-30"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-64 shrink-0 bg-slate-50 border-r sticky left-0 z-40"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex",
    style: {
      width: "3600px"
    }
  }, function () {
    var monthSpans = [];
    var currentMonth = -1;
    var currentSpan = null;
    var monthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
    var nowMonth = new Date();
    for (var i = 0; i < 90; i++) {
      var d = new Date(nowMonth.getFullYear(), nowMonth.getMonth(), nowMonth.getDate());
      d.setDate(d.getDate() + i);
      var m = d.getMonth();
      if (m !== currentMonth) {
        if (currentSpan) monthSpans.push(currentSpan);
        currentMonth = m;
        currentSpan = {
          month: m,
          year: d.getFullYear(),
          label: "".concat(monthNames[m], " ").concat(d.getFullYear()),
          count: 1
        };
      } else {
        currentSpan.count++;
      }
    }
    if (currentSpan) monthSpans.push(currentSpan);
    return monthSpans.map(function (ms, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          width: "".concat(ms.count * 40, "px")
        },
        className: "text-center text-[9px] font-black uppercase tracking-widest text-slate-500 py-1.5 border-r border-slate-200 bg-slate-50/80 shrink-0"
      }, ms.label);
    });
  }())), /*#__PURE__*/React.createElement("div", {
    className: "flex border-b border-slate-200 sticky top-[29px] bg-white z-20 shadow-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-64 p-2 font-bold text-[10px] text-slate-500 uppercase shrink-0 bg-slate-50 border-r sticky left-0 z-30 shadow-r flex items-center"
  }, "Grupo / Hotel"), /*#__PURE__*/React.createElement("div", {
    className: "flex",
    style: {
      width: "3600px"
    }
  }, Array.from({
    length: 90
  }).map(function (_, i) {
    var nowHeader = new Date();
    var d = new Date(nowHeader.getFullYear(), nowHeader.getMonth(), nowHeader.getDate());
    d.setDate(d.getDate() + i);
    var isWeekend = d.getDay() === 0 || d.getDay() === 6;
    var isToday = i === 0;
    var isFirstOfMonth = d.getDate() === 1;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        width: "40px"
      },
      className: "shrink-0 h-10 flex flex-col items-center justify-center border-r text-[10px] ".concat(isFirstOfMonth ? "border-l-2 border-l-slate-300" : "border-slate-100", " ").concat(isToday ? "bg-blue-50 border-blue-200" : isWeekend ? "bg-slate-50" : "")
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-bold leading-none ".concat(isToday ? "text-blue-600" : "text-slate-700")
    }, d.getDate()), /*#__PURE__*/React.createElement("span", {
      className: "text-[7px] uppercase leading-none mt-0.5 ".concat(isToday ? "text-blue-500 font-bold" : "text-slate-400")
    }, d.toLocaleDateString("es-ES", {
      weekday: "short"
    }).slice(0, 2)));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-1 mt-1"
  }, function () {
    var now = new Date();
    var todayGantt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return processedData.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "p-12 text-center text-slate-400 flex flex-col items-center"
    }, /*#__PURE__*/React.createElement(IconCalendar, {
      size: 48,
      className: "mb-2 opacity-20"
    }), /*#__PURE__*/React.createElement("p", null, "No hay grupos para mostrar en este rango con los filtros actuales.")) : processedData.map(function (group, idx) {
      // Parse Dates Robustly: soporta seriales Excel, DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD

      var parseDateGantt = function parseDateGantt(dStr) {
        if (!dStr) return null;
        var s = dStr.toString().trim();

        // Excel serial (ej: 46129)

        var num = parseFloat(s);
        if (!isNaN(num) && num > 40000 && num < 60000) {
          var _d4 = new Date(Math.round((num - 25569) * 86400 * 1000));
          return new Date(_d4.getFullYear(), _d4.getMonth(), _d4.getDate());
        }
        var d, m, y;
        if (s.includes("-")) {
          var parts = s.split("-");
          if (parts[0].length <= 2) {
            var _parts6 = _slicedToArray(parts, 3);
            d = _parts6[0];
            m = _parts6[1];
            y = _parts6[2];
          } else {
            var _parts7 = _slicedToArray(parts, 3);
            y = _parts7[0];
            m = _parts7[1];
            d = _parts7[2];
          }
        } else if (s.includes("/")) {
          var _s$split5 = s.split("/");
          var _s$split6 = _slicedToArray(_s$split5, 3);
          d = _s$split6[0];
          m = _s$split6[1];
          y = _s$split6[2];
        } else if (s.includes(".")) {
          var _s$split7 = s.split(".");
          var _s$split8 = _slicedToArray(_s$split7, 3);
          d = _s$split8[0];
          m = _s$split8[1];
          y = _s$split8[2];
        } else {
          var dObj = new Date(s);
          if (isNaN(dObj.getTime())) return null;
          return new Date(dObj.getFullYear(), dObj.getMonth(), dObj.getDate());
        }
        var yi = parseInt(y);
        if (yi < 100) yi += 2000;
        return new Date(yi, parseInt(m) - 1, parseInt(d));
      };
      var start = parseDateGantt(group["Entrada"]);
      var end = parseDateGantt(group["Salida"]);
      if (!start) return null;
      if (!end) end = new Date(start);

      // Calculate Days from Today (index 0)

      var startDiff = Math.round((start.getTime() - todayGantt.getTime()) / (1000 * 60 * 60 * 24));
      var duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (duration < 1) duration = 1;

      // Skip if completely in past or too far future

      if (startDiff + duration < 0 || startDiff > 90) return null;

      // Calculate Width/Position

      var displayStart = startDiff;
      var displayDuration = duration;
      if (displayStart < 0) {
        displayDuration += displayStart; // Reduce duration by days passed

        displayStart = 0;
      }

      // Calculate pixel-based positions

      var leftPx = displayStart * 40;
      var widthPx = displayDuration * 40;

      // Color Logic

      var st = getStatusProps(group["Com_Estado_Interno"] || group["Segment."], group["Entrada"], group["Estado"]);
      var colorClass = "".concat(st.color, " hover:brightness-110");
      return /*#__PURE__*/React.createElement("div", {
        key: idx,
        className: "flex border-b border-slate-50 hover:bg-slate-50 transition-colors group h-12 items-center"
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-64 px-3 py-2 text-xs font-medium text-slate-700 border-r border-slate-100 shrink-0 sticky left-0 bg-white z-10 group-hover:bg-slate-50 shadow-r h-full flex flex-col justify-center"
      }, /*#__PURE__*/React.createElement("div", {
        className: "truncate font-bold text-slate-800"
      }, group["Nombre del Grupo"]), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-1 text-[9px] text-slate-400 mt-0.5"
      }, /*#__PURE__*/React.createElement(IconBuildingSkyscraper, {
        size: 10
      }), /*#__PURE__*/React.createElement("span", {
        className: "truncate max-w-[120px]"
      }, normalizeHotelName(group["Hotel_Asignado"] || group["Hotel"])), group["Importe(*)"] && function () {
        var total = parseNum(group["Importe(*)"]);
        var paid = parseNum(group["Com_Pagado"] || "0");
        var pending = total - paid;
        return /*#__PURE__*/React.createElement("span", {
          className: "ml-auto flex flex-col items-end gap-0.5"
        }, /*#__PURE__*/React.createElement("span", {
          className: "text-emerald-600 font-bold"
        }, new Intl.NumberFormat("es-ES", {
          useGrouping: true,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(total), " \u20AC"), pending > 0.05 && /*#__PURE__*/React.createElement("span", {
          className: "text-rose-500 font-bold text-[8px]"
        }, new Intl.NumberFormat("es-ES", {
          useGrouping: true,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(pending), " \u20AC pdte."));
      }())), /*#__PURE__*/React.createElement("div", {
        className: "w-[3600px] shrink-0 relative h-full"
      }, " ", /*#__PURE__*/React.createElement("div", {
        className: "absolute inset-0 flex pointer-events-none"
      }, Array.from({
        length: 90
      }).map(function (_, i) {
        var d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        d.setDate(d.getDate() + i);
        var isWeekend = d.getDay() === 0 || d.getDay() === 6;
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          style: {
            width: "40px"
          },
          className: "shrink-0 border-r border-slate-50 ".concat(isWeekend ? "bg-slate-50/50" : "")
        });
      })), widthPx > 0 && /*#__PURE__*/React.createElement("div", {
        className: "absolute h-7 rounded-lg shadow-sm ".concat(colorClass, " text-white text-[9px] flex items-center px-3 whitespace-nowrap overflow-hidden cursor-pointer transition-all z-0 top-2.5"),
        style: {
          left: "".concat(leftPx, "px"),
          width: "".concat(widthPx, "px"),
          minWidth: "4px"
        },
        onClick: function onClick() {
          return openFicha(group);
        },
        title: "".concat(group["Nombre del Grupo"], "\n").concat(start.toLocaleDateString(), " - ").concat(end.toLocaleDateString(), "\n").concat(group["Pax."] || 0, " Pax")
      }, /*#__PURE__*/React.createElement("span", {
        className: "font-bold truncate drop-shadow-md"
      }, group["Nombre del Grupo"]), displayDuration > 5 && /*#__PURE__*/React.createElement("span", {
        className: "opacity-80 ml-2 text-[8px] font-normal"
      }, group["Pax."] || 0, " Pax"))));
    });
  }())))), activeTab === "budgets" && /*#__PURE__*/React.createElement(BudgetManager, {
    data: data,
    openFicha: openFicha,
    formatDate: formatDate
  }), activeTab === "segments" && /*#__PURE__*/React.createElement("div", {
    className: "animate-fade-in space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-lg shadow h-80"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold mb-4 text-slate-700"
  }, "Ingresos por Segmento"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: "100%"
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: segmentStats,
    layout: "vertical",
    margin: {
      left: 20
    }
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    horizontal: false
  }), /*#__PURE__*/React.createElement(XAxis, {
    type: "number",
    hide: true
  }), /*#__PURE__*/React.createElement(YAxis, {
    type: "category",
    dataKey: "name",
    width: 100,
    tick: {
      fontSize: 11
    },
    interval: 0
  }), /*#__PURE__*/React.createElement(Tooltip, {
    formatter: function formatter(value) {
      return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
      }).format(value);
    }
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "revenue",
    fill: "#8884d8",
    radius: [0, 4, 4, 0]
  }, segmentStats.map(function (entry, index) {
    return /*#__PURE__*/React.createElement(Cell, {
      key: "cell-".concat(index),
      fill: COLORS[index % COLORS.length]
    });
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-lg shadow h-80"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold mb-4 text-slate-700"
  }, "Ocupaci\xF3n de Grupos por Meses"), /*#__PURE__*/React.createElement(ResponsiveContainer, {
    width: "100%",
    height: "100%"
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: chartData.barData
  }, /*#__PURE__*/React.createElement(CartesianGrid, {
    strokeDasharray: "3 3",
    vertical: false
  }), /*#__PURE__*/React.createElement(XAxis, {
    dataKey: "name",
    tick: {
      fontSize: 10
    }
  }), /*#__PURE__*/React.createElement(YAxis, {
    tick: {
      fontSize: 10
    }
  }), /*#__PURE__*/React.createElement(Tooltip, {
    formatter: function formatter(value) {
      return "".concat(value, " Pax");
    }
  }), /*#__PURE__*/React.createElement(Bar, {
    dataKey: "Pax",
    fill: "#10b981",
    radius: [4, 4, 0, 0]
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg shadow overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 border-b bg-slate-50"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold text-slate-700"
  }, "Tabla de Rentabilidad por Segmento")), /*#__PURE__*/React.createElement("div", {
    className: "overflow-x-auto"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left text-sm"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "bg-slate-100 text-slate-600 font-semibold uppercase text-xs"
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "p-3 w-10"
  }), /*#__PURE__*/React.createElement("th", {
    className: "p-3"
  }, "Segmento"), /*#__PURE__*/React.createElement("th", {
    className: "p-3 text-right"
  }, "# Grupos"), /*#__PURE__*/React.createElement("th", {
    className: "p-3 text-right"
  }, "Pax Total"), /*#__PURE__*/React.createElement("th", {
    className: "p-3 text-right"
  }, "Noches Totales"), /*#__PURE__*/React.createElement("th", {
    className: "p-3 text-right"
  }, "Ingresos Totales"), /*#__PURE__*/React.createElement("th", {
    className: "p-3 text-right"
  }, "ADR Medio"))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-gray-100"
  }, segmentStats.map(function (seg, idx) {
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: idx
    }, /*#__PURE__*/React.createElement("tr", {
      className: "hover:bg-slate-50 transition-colors cursor-pointer",
      onClick: function onClick() {
        return setExpandedSegment(expandedSegment === seg.name ? null : seg.name);
      }
    }, /*#__PURE__*/React.createElement("td", {
      className: "p-3 text-center text-gray-400"
    }, expandedSegment === seg.name ? /*#__PURE__*/React.createElement(IconChevronUp, {
      size: 16
    }) : /*#__PURE__*/React.createElement(IconChevronDown, {
      size: 16
    })), /*#__PURE__*/React.createElement("td", {
      className: "p-3 font-medium text-slate-800 flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "w-3 h-3 rounded-full",
      style: {
        backgroundColor: COLORS[idx % COLORS.length]
      }
    }), seg.name), /*#__PURE__*/React.createElement("td", {
      className: "p-3 text-right font-bold text-blue-600"
    }, seg.groupCount), /*#__PURE__*/React.createElement("td", {
      className: "p-3 text-right"
    }, seg.pax), /*#__PURE__*/React.createElement("td", {
      className: "p-3 text-right"
    }, seg.nights), /*#__PURE__*/React.createElement("td", {
      className: "p-3 text-right font-bold text-slate-700"
    }, seg.revenue.toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR"
    })), /*#__PURE__*/React.createElement("td", {
      className: "p-3 text-right text-emerald-600 font-bold"
    }, (seg.nights > 0 ? seg.revenue / seg.nights : 0).toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR"
    }))), expandedSegment === seg.name && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: "7",
      className: "p-0 bg-slate-50"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
    }, seg.groups.map(function (group, gIdx) {
      var _groupObj$records2, _groupObj$records$, _groupObj$records$2, _groupObj$records$3, _groupObj$records$4, _groupObj$records$5;
      var groupObj = group.obj;
      var isTanteo = seg.name === "GRUPO TANTEO" || ((groupObj === null || groupObj === void 0 || (_groupObj$records2 = groupObj.records) === null || _groupObj$records2 === void 0 || (_groupObj$records2 = _groupObj$records2[0]) === null || _groupObj$records2 === void 0 ? void 0 : _groupObj$records2["Segment."]) || "").toUpperCase() === "GRTANTEO";
      var arrivalDate = group.arrival;
      var today = new Date();
      var arrival = new Date(toInputDate(arrivalDate));
      var diffDays = Math.ceil((arrival - today) / (1000 * 60 * 60 * 24));
      var isUrgent = isTanteo && diffDays >= 0 && diffDays <= 30;
      return /*#__PURE__*/React.createElement("div", {
        key: gIdx,
        onClick: function onClick() {
          return groupObj && openFicha(groupObj);
        },
        className: "bg-white p-2 rounded border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center mb-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-black text-slate-400 tracking-wider"
      }, "#", (groupObj === null || groupObj === void 0 || (_groupObj$records$ = groupObj.records[0]) === null || _groupObj$records$ === void 0 ? void 0 : _groupObj$records$["Reserva"]) || "-"), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2"
      }, arrivalDate && /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-black text-slate-400 flex items-center gap-1"
      }, /*#__PURE__*/React.createElement(IconCalendar, {
        size: 10
      }), " ", arrivalDate, isUrgent && /*#__PURE__*/React.createElement("span", {
        className: "w-2 h-2 bg-red-500 rounded-full animate-ping ml-1",
        title: "Tanteo urgente (< 30 d\xEDas)"
      })), /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 rounded uppercase"
      }, (groupObj === null || groupObj === void 0 || (_groupObj$records$2 = groupObj.records[0]) === null || _groupObj$records$2 === void 0 ? void 0 : _groupObj$records$2["Hotel"]) || (groupObj === null || groupObj === void 0 || (_groupObj$records$3 = groupObj.records[0]) === null || _groupObj$records$3 === void 0 ? void 0 : _groupObj$records$3["Hotel_Asignado"]) || "S/H"))), /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-xs font-bold text-slate-800 group-hover:text-blue-600 truncate"
      }, group.name), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 rounded uppercase"
      }, normalizeHotelName((groupObj === null || groupObj === void 0 || (_groupObj$records$4 = groupObj.records[0]) === null || _groupObj$records$4 === void 0 ? void 0 : _groupObj$records$4["Hotel"]) || (groupObj === null || groupObj === void 0 || (_groupObj$records$5 = groupObj.records[0]) === null || _groupObj$records$5 === void 0 ? void 0 : _groupObj$records$5["Hotel_Asignado"]))), /*#__PURE__*/React.createElement(IconChevronRight, {
        size: 16,
        className: "text-slate-300 group-hover:text-blue-500"
      }))));
    })))));
  })))))), activeTab === "groups" && /*#__PURE__*/React.createElement("div", {
    className: "animate-fade-in space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left border-collapse"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    className: "bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-400 uppercase tracking-wider"
  }, /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-3 font-black"
  }, "Hotel"), /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-3 font-black"
  }, "Grupo / ID"), /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-3 font-black"
  }, "Comercial"), /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-3 font-black"
  }, "Entrada"), /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-3 font-black"
  }, "Salida"), /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-3 font-black text-center"
  }, "Release"), /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-3 font-black text-right"
  }, "Importe"), /*#__PURE__*/React.createElement("th", {
    className: "px-3 py-3 font-black text-center"
  }, "Estado"))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-slate-100"
  }, groupedData.map(function (group, idx) {
    var _group$records, _group$records2, _group$records3, _group$records$5, _group$records$6, _group$records$7, _group$records$8, _group$records$9, _group$records$0, _group$records$1, _group$records$10;
    // Prioridad: Com_Estado_Interno siempre gana sobre Estado (campo del Excel importado)

    var internalSt = (_group$records = group.records) === null || _group$records === void 0 || (_group$records = _group$records[0]) === null || _group$records === void 0 ? void 0 : _group$records["Com_Estado_Interno"];
    var externalSt = (_group$records2 = group.records) === null || _group$records2 === void 0 || (_group$records2 = _group$records2[0]) === null || _group$records2 === void 0 ? void 0 : _group$records2["Estado"];
    var effectiveSt = internalSt || ((_group$records3 = group.records) === null || _group$records3 === void 0 || (_group$records3 = _group$records3[0]) === null || _group$records3 === void 0 ? void 0 : _group$records3["Segment."]);
    var st = getStatusProps(effectiveSt, group.arrival, internalSt ? null : externalSt);
    var statusText = st.label;
    var statusColor = st.text;

    // Normalizar nombre hotel para visualización

    var displayHotel = normalizeHotelName(((_group$records$5 = group.records[0]) === null || _group$records$5 === void 0 ? void 0 : _group$records$5["Hotel_Asignado"]) || ((_group$records$6 = group.records[0]) === null || _group$records$6 === void 0 ? void 0 : _group$records$6["Hotel"]));
    return /*#__PURE__*/React.createElement("tr", {
      key: idx,
      className: "hover:bg-slate-50 transition-colors cursor-pointer group",
      onClick: function onClick() {
        return openFicha(group);
      }
    }, /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-1.5 bg-white border border-slate-100 rounded-lg shadow-sm shrink-0"
    }, /*#__PURE__*/React.createElement(IconBuildingSkyscraper, {
      size: 14,
      className: "text-slate-400"
    })), /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-black text-slate-500 uppercase tracking-tight leading-tight"
    }, displayHotel))), /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "max-w-[250px]"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-center gap-1.5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-[13px] font-black text-slate-800 group-hover:text-[#2d5a43] transition-colors leading-tight"
    }, group.name), function () {
      var record = group.records[0] || {};
      var hasRooming = record["Logistica_Rooming"] === true;
      var hasMP = record["Logistica_MenuMP"] === true;
      var hasPC = record["Logistica_MenuPC"] === true;
      var regimen = (record["Régimen"] || "").toUpperCase();
      var needsMP = regimen.includes("MP");
      var needsPC = regimen.includes("PC");
      var daysToArrival = 999;
      if (record["Entrada"]) {
        var arrDateStr = String(record["Entrada"]);
        var arrDate = new Date(arrDateStr.includes('T') ? arrDateStr : arrDateStr + 'T12:00:00');
        if (!isNaN(arrDate)) {
          daysToArrival = Math.ceil((arrDate - new Date()) / (1000 * 60 * 60 * 24));
        }
      }
      var isClose = daysToArrival <= 15 && daysToArrival >= 0;
      var missingCritical = !hasRooming || needsMP && !hasMP || needsPC && !hasPC;
      var status = (record["Estado"] || "").toUpperCase();
      var isInactive = ["ANULADA", "CANCELADA", "GASTOS DE ANULACION", "BAJA"].includes(status);
      var internalSt = (record["Com_Estado_Interno"] || "").toUpperCase();
      var isInternalInactive = ["CANCEL", "ANUL", "GASTOS", "DESESTIMADO", "BAJA"].some(function (s) {
        return internalSt.includes(s);
      });
      if (isClose && missingCritical && !isInactive && !isInternalInactive) {
        var missingList = [!hasRooming && "RRLL", needsMP && !hasMP && "Menú MP", needsPC && !hasPC && "Menú PC"].filter(Boolean).join(", ");
        return /*#__PURE__*/React.createElement("div", {
          className: "flex items-center gap-1 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-[8px] font-black text-rose-600 animate-pulse-slow shadow-sm whitespace-nowrap",
          title: "\xA1Aviso Operativo! Faltan datos: ".concat(missingList)
        }, /*#__PURE__*/React.createElement(IconAlertTriangle, {
          size: 10,
          stroke: 3
        }), /*#__PURE__*/React.createElement("span", null, "ALERTA LOG."));
      }
      return null;
    }(), ((_group$records$7 = group.records[0]) === null || _group$records$7 === void 0 ? void 0 : _group$records$7["Com_Notas"]) && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1 bg-amber-50 border border-amber-100 px-1 py-0.5 rounded text-[8px] font-bold text-amber-600 max-w-[120px] truncate",
      title: group.records[0]["Com_Notas"]
    }, /*#__PURE__*/React.createElement(IconFile, {
      size: 8
    }), /*#__PURE__*/React.createElement("span", {
      className: "truncate"
    }, group.records[0]["Com_Notas"])), ((_group$records$8 = group.records[0]) === null || _group$records$8 === void 0 ? void 0 : _group$records$8["Com_Seguimiento"]) && /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1 px-1 py-0.5 rounded text-[8px] font-bold border ".concat(new Date(group.records[0]["Com_Seguimiento"]) <= new Date() ? "bg-rose-50 border-rose-100 text-rose-600" : "bg-blue-50 border-blue-100 text-blue-600"),
      title: "Pr\xF3ximo Seguimiento"
    }, /*#__PURE__*/React.createElement(IconClock, {
      size: 8
    }), formatDate(group.records[0]["Com_Seguimiento"]))), /*#__PURE__*/React.createElement("div", {
      className: "text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "shrink-0"
    }, "ID:", " ", ((_group$records$9 = group.records[0]) === null || _group$records$9 === void 0 ? void 0 : _group$records$9["Reserva"]) || "---"), ((_group$records$0 = group.records[0]) === null || _group$records$0 === void 0 ? void 0 : _group$records$0["Empresa/Agencia"]) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "opacity-20"
    }, "\u2022"), /*#__PURE__*/React.createElement("span", null, group.records[0]["Empresa/Agencia"]))))), /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-1"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-1.5 h-1.5 rounded-full ".concat(getCommColor((_group$records$1 = group.records[0]) === null || _group$records$1 === void 0 ? void 0 : _group$records$1["Com_Comercial"]), " shrink-0")
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-bold text-slate-600 uppercase"
    }, ((_group$records$10 = group.records[0]) === null || _group$records$10 === void 0 ? void 0 : _group$records$10["Com_Comercial"]) || "S/A"))), /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] font-bold text-slate-600 tabular-nums"
    }, formatDate(group.arrival))), /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-[11px] font-bold text-slate-600 tabular-nums"
    }, formatDate(group.departure))), /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-2 text-center"
    }, function () {
      var grossRev = group.totalRevenue || 0;
      var netRev = grossRev - (group.totalCommission || 0);
      var paid = group.totalPaid || 0;
      var isFullyPaid = paid > 0 && netRev > 0 && paid >= netRev - 0.05;
      if (isFullyPaid) {
        return /*#__PURE__*/React.createElement("span", {
          className: "text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shadow-sm"
        }, "OK");
      }
      var now = new Date();
      now.setHours(0, 0, 0, 0);

      // Release: Priority order: 1. First unpaid segment in PaymentPlan_JSON, 2. Com_Vencimiento_Rel manual, 3. Arrival

      var relDateStr = null;

      // Try to find the earliest unpaid segment

      (group.records || []).forEach(function (r) {
        try {
          var plan = JSON.parse(r.PaymentPlan_JSON || "[]");
          plan.forEach(function (p) {
            if (p.status !== "Cobrado" && p.date) {
              if (!relDateStr || new Date(p.date) < new Date(relDateStr)) {
                relDateStr = p.date;
              }
            }
          });
        } catch (e) {}
      });

      // If no unpaid segment found, use manual field

      if (!relDateStr) {
        var _group$records$11;
        relDateStr = (_group$records$11 = group.records[0]) === null || _group$records$11 === void 0 ? void 0 : _group$records$11["Com_Vencimiento_Rel"];
      }
      if (relDateStr) {
        var relDate = new Date(toInputDate ? toInputDate(relDateStr) : relDateStr);
        if (!isNaN(relDate.getTime())) {
          var diffRel = Math.ceil((relDate - now) / (1000 * 60 * 60 * 24));
          return /*#__PURE__*/React.createElement("div", {
            className: "flex flex-col items-center"
          }, /*#__PURE__*/React.createElement("span", {
            className: "text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm ".concat(diffRel <= 3 ? "bg-rose-600 text-white animate-pulse" : diffRel <= 7 ? "bg-amber-500 text-white" : "bg-emerald-500 text-white")
          }, diffRel > 0 ? "".concat(diffRel, "d") : diffRel === 0 ? "HOY" : "PASADO"), /*#__PURE__*/React.createElement("span", {
            className: "text-[8px] text-slate-500 font-bold mt-0.5 tracking-tighter"
          }, formatDate(relDateStr)));
        }
      }

      // Fallback to days to arrival

      var dIn = new Date(toInputDate(group.arrival));
      dIn.setHours(0, 0, 0, 0);
      var diffArr = Math.ceil((dIn - now) / (1000 * 60 * 60 * 24));
      return /*#__PURE__*/React.createElement("div", {
        className: "flex flex-col items-center"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-bold px-1.5 py-0.5 rounded ".concat(diffArr <= 7 && diffArr > 0 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600")
      }, diffArr > 0 ? "".concat(diffArr, "d") : diffArr === 0 ? "HOY" : "PASADO"), /*#__PURE__*/React.createElement("span", {
        className: "text-[8px] text-slate-400 font-bold mt-0.5 tracking-tighter"
      }, "Entrada"));
    }()), /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-2 text-right"
    }, function () {
      var grossRev = group.totalRevenue || 0;
      var commission = group.totalCommission || 0;
      var netRev = grossRev - commission;
      var paid = group.totalPaid || 0;
      var pending = netRev - paid;
      var isFullyPaid = paid > 0 && pending <= 0.05;
      return /*#__PURE__*/React.createElement("div", {
        className: "flex flex-col items-end gap-0.5"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-col items-end leading-none"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[12px] font-black text-slate-700 tabular-nums"
      }, formatNum(grossRev)), commission > 0 && /*#__PURE__*/React.createElement("span", {
        className: "text-[8px] font-bold text-slate-400 uppercase tracking-tighter"
      }, "Neto: ", formatNum(netRev))), isFullyPaid ? /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1"
      }, /*#__PURE__*/React.createElement(IconCheck, {
        size: 10
      }), " OK") : pending > 0.05 && /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-bold text-rose-600 tabular-nums"
      }, formatNum(pending, true), " pdte."));
    }()), /*#__PURE__*/React.createElement("td", {
      className: "px-3 py-2 text-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-center gap-2 group/status"
    }, /*#__PURE__*/React.createElement("span", {
      className: "inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ".concat(statusColor)
    }, statusText), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick(e) {
        var _group$records$12;
        e.stopPropagation();
        window.location.href = "Presupuestos.html?id=".concat((_group$records$12 = group.records[0]) === null || _group$records$12 === void 0 ? void 0 : _group$records$12["Reserva"]);
      },
      className: "p-1 px-1.5 bg-slate-100 text-slate-400 hover:bg-purple-600 hover:text-white rounded-lg transition-all opacity-0 group-hover/status:opacity-100 shadow-sm",
      title: "Ver Presupuesto"
    }, /*#__PURE__*/React.createElement(IconFileText, {
      size: 12,
      stroke: 2.5
    })))));
  })), groupedData.length === 0 && /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: "7",
    className: "px-6 py-12 text-center text-slate-400 text-sm font-medium opacity-60"
  }, "No hay grupos activos que coincidan con los filtros.")))))), activeTab === "table" && /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg shadow flex flex-col h-[70vh] animate-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 border-b flex flex-wrap gap-4 justify-between items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement(DebouncedSearchInput, {
    placeholder: "Buscar en todos los campos...",
    className: "border rounded px-3 py-2 w-64 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500",
    value: searchTerm,
    onChange: setSearchTerm
  }), searchTerm && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setSearchTerm("");
    },
    className: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors",
    title: "Limpiar b\xFAsqueda"
  }, /*#__PURE__*/React.createElement(IconX, {
    size: 14
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, data.some(function (r) {
    return r._diff;
  }) && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowOnlyChanges(!showOnlyChanges);
    },
    className: "px-4 py-2 rounded text-sm font-bold shadow-md transition flex items-center gap-2 ".concat(showOnlyChanges ? "bg-blue-600 text-white" : "bg-white text-slate-700 border border-slate-200")
  }, /*#__PURE__*/React.createElement(IconEdit, {
    size: 16
  }), " ", showOnlyChanges ? "Ver Todos" : "Ver Solo Cambios"), (data || []).some(function (r) {
    return r._diff;
  }) && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      if (window.confirm("\xBFEst\xE1s seguro de que quieres autorizar los ".concat((data || []).filter(function (r) {
        return r._diff;
      }).length, " cambios detectados?"))) {
        acceptChanges();
      }
    },
    disabled: isSaving,
    className: "px-4 py-2 rounded text-sm font-bold shadow-md transition flex items-center gap-2 ".concat(isSaving ? "bg-slate-400 cursor-wait text-white" : "bg-green-600 hover:bg-green-700 text-white")
  }, isSaving ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
  }), "Guardando...") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(IconCheck, {
    size: 16
  }), " Autorizar Cambios (", (data || []).filter(function (r) {
    return r._diff;
  }).length, ")")), /*#__PURE__*/React.createElement("button", {
    onClick: acceptChanges,
    className: "opacity-0 w-0 h-0 overflow-hidden",
    "aria-hidden": "true"
  }, "Ocultos"))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-auto custom-scrollbar"
  }, /*#__PURE__*/React.createElement("table", {
    className: "w-full text-left text-sm border-collapse"
  }, /*#__PURE__*/React.createElement("thead", {
    className: "bg-slate-50 text-slate-600 sticky top-0 z-10 shadow-sm"
  }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
    className: "p-3 font-bold border-b w-64 bg-slate-100 z-20"
  }, "ACCI\xD3N REQUERIDA / CAMBIOS"), /*#__PURE__*/React.createElement("th", {
    className: "p-3 font-semibold border-b"
  }, "RESERVA"), /*#__PURE__*/React.createElement("th", {
    className: "p-3 font-semibold border-b"
  }, "GRUPO / TITULAR"), /*#__PURE__*/React.createElement("th", {
    className: "p-3 font-semibold border-b"
  }, "ENTRADA"), /*#__PURE__*/React.createElement("th", {
    className: "p-3 font-semibold border-b"
  }, "ESTADO"), /*#__PURE__*/React.createElement("th", {
    className: "p-3 font-semibold border-b text-center"
  }, "PAX"), /*#__PURE__*/React.createElement("th", {
    className: "p-3 font-semibold border-b"
  }, "SEGMENTO"), /*#__PURE__*/React.createElement("th", {
    className: "p-3 font-semibold border-b text-right"
  }, "IMPORTE"))), /*#__PURE__*/React.createElement("tbody", {
    className: "divide-y divide-gray-100"
  }, (data || []).map(function (row, absIndex) {
    return {
      row: row,
      absIndex: absIndex
    };
  }).filter(function (_ref18) {
    var row = _ref18.row;
    if (!row._diff) return false;
    if (searchTerm) {
      var lowerTerm = searchTerm.toLowerCase();
      var matches = Object.values(row).some(function (val) {
        return String(val).toLowerCase().includes(lowerTerm);
      });
      if (!matches) return false;
    }
    return true;
  }).map(function (_ref19) {
    var row = _ref19.row,
      absIndex = _ref19.absIndex;
    var rowClass = "hover:bg-slate-50 transition-colors group";
    var badge = null;
    var btnColor = "bg-slate-800 hover:bg-slate-900";
    var changeDetails = [];
    if (row._diff === "new") {
      rowClass += " bg-green-50/30";
      badge = /*#__PURE__*/React.createElement("span", {
        className: "text-green-600 font-black text-[10px] uppercase"
      }, "NUEVO");
      btnColor = "bg-green-600 hover:bg-green-700";
      changeDetails.push("Nuevo registro importado");
    } else if (row._diff === "cancelled") {
      rowClass += " bg-red-50/30";
      badge = /*#__PURE__*/React.createElement("span", {
        className: "text-red-600 font-black text-[10px] uppercase"
      }, "CANCELAR");
      btnColor = "bg-red-600 hover:bg-red-700";
      changeDetails.push("Estado cambiado a ANULADA");
    } else if (row._diff === "modified") {
      rowClass += " bg-blue-50/30";
      badge = /*#__PURE__*/React.createElement("span", {
        className: "text-blue-600 font-black text-[10px] uppercase"
      }, "MODIFICADO");
      btnColor = "bg-blue-600 hover:bg-blue-700";

      // Render specific changes

      if (row._changes) {
        Object.keys(row._changes).forEach(function (k) {
          var ch = row._changes[k];
          changeDetails.push("".concat(k, ": ").concat(ch.old, " \u2192 ").concat(ch.new));
        });
      } else {
        changeDetails.push("Datos actualizados");
      }
    }
    return /*#__PURE__*/React.createElement("tr", {
      key: String(row.Reserva),
      className: rowClass
    }, /*#__PURE__*/React.createElement("td", {
      className: "p-3 border-b border-r border-slate-200 bg-white/50 sticky left-0 z-10 w-64 align-top"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex gap-1"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var reservaID = normalizeId(row["Reserva"]);
        var confirmMsg = row._diff === "cancelled" ? "\xBFConfirmas la CANCELACI\xD3N del grupo ".concat(row["Nombre del Grupo"], "?") : "\xBFConfirmas la actualizaci\xF3n del grupo ".concat(row["Nombre del Grupo"], "?");
        if (window.confirm(confirmMsg)) {
          // log

          console.log("[Save] Autorizando reserva ".concat(reservaID, ":"), row);

          // Bloquear en la referencia para el listener onSnapshot

          authorizingIds.current.add(reservaID.trim());

          // Guardar estado previo para posible rollback

          var rowStateBefore = _objectSpread({}, row);

          // OPTIMISTIC UPDATE: buscar por ID de reserva (robusto, no por índice)

          setData(function (prevData) {
            return prevData.map(function (r) {
              return normalizeId(r["Reserva"]) === reservaID ? _objectSpread(_objectSpread({}, r), {}, {
                _diff: null,
                _changes: null
              }) : r;
            });
          });
          var batch = db.batch();

          // Sanitize: eliminar campos internos y undefined

          var cleanedRow = {};
          Object.keys(row).forEach(function (k) {
            if (!k.startsWith("_") && row[k] !== undefined) {
              cleanedRow[k] = row[k];
            }
          });
          var docRef = db.collection("groups").doc(reservaID);
          batch.set(docRef, _objectSpread(_objectSpread({}, cleanedRow), {}, {
            _diff: firebase.firestore.FieldValue.delete(),
            _changes: firebase.firestore.FieldValue.delete(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }), {
            merge: true
          });

          // Si el doc original tenía un ID diferente (ej: "71375.0" vs "71375"),

          // eliminarlo para evitar que el duplicado restaure los datos viejos

          if (row._docId && row._docId !== reservaID) {
            console.log("\uD83D\uDDD1\uFE0F Eliminando doc duplicado: \"".concat(row._docId, "\" (normalizado: \"").concat(reservaID, "\")"));
            batch.delete(db.collection("groups").doc(row._docId));
          }
          console.log("[Save] Haciendo commit para", reservaID, "con Entrada:", cleanedRow["Entrada"], "Pax:", cleanedRow["Pax."]);
          batch.commit().then(function () {
            console.log("✅ Reserva individual guardada en Firestore:", reservaID);

            // Mantener el bloqueo 6s para que onSnapshot no restaure datos viejos

            setTimeout(function () {
              authorizingIds.current.delete(reservaID.trim());
              console.log("🔓 authorizingId liberado:", reservaID);
            }, 6000);
          }).catch(function (err) {
            console.error("❌ ERROR AL GUARDAR:", err);
            alert("Error al guardar: " + err.message);
            authorizingIds.current.delete(reservaID.trim());

            // ROLLBACK: Restaurar el diff si falló

            setData(function (prevData) {
              return prevData.map(function (r) {
                return String(r.Reserva).trim() === reservaID.trim() ? rowStateBefore : r;
              });
            });
          });
        }
      },
      className: "flex-1 py-1.5 rounded shadow-sm text-white font-bold text-[10px] flex items-center justify-center gap-1.5 transition-transform active:scale-95 ".concat(btnColor)
    }, /*#__PURE__*/React.createElement(IconCheck, {
      size: 12,
      stroke: 3
    }), " ", badge, " - AUTORIZAR"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var reservaID = normalizeId(row["Reserva"]);

        // Buscar en groupedData (vista actual)

        var fichaGroup = (groupedData || []).find(function (g) {
          return g.id === reservaID;
        });
        if (fichaGroup) {
          openFicha(fichaGroup);
        } else {
          // Fallback: buscar en data raw y construir objeto compatible

          var rawRow = (data || []).find(function (r) {
            return normalizeId(r["Reserva"]) === reservaID;
          });
          if (rawRow) {
            openFicha({
              id: reservaID,
              name: rawRow["Nombre del Grupo"] || rawRow["Empresa/Agencia"] || reservaID,
              agency: rawRow["Empresa/Agencia"] || "",
              arrival: rawRow["Entrada"],
              departure: rawRow["Salida"],
              status: rawRow["Estado"] || "",
              hotel: rawRow["Hotel_Asignado"] || rawRow["Hotel"] || "",
              totalPax: parseNum(rawRow["Pax."] || "0"),
              totalRevenue: parseNum(rawRow["Importe(*)"] || "0"),
              totalPaid: parseNum(rawRow["Com_Pagado"] || "0"),
              totalRooms: 0,
              totalCommission: 0,
              totalNights: parseNum(rawRow["Noches"] || "0"),
              records: [rawRow]
            });
          }
        }
      },
      className: "px-2 py-1.5 bg-slate-100 text-slate-500 rounded hover:bg-indigo-100 hover:text-indigo-600 transition-colors",
      title: "Ver Ficha del Grupo"
    }, /*#__PURE__*/React.createElement(IconEye, {
      size: 12
    })), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        if (window.confirm("¿Descartar este cambio sugerido?")) {
          setData(function (prevData) {
            return prevData.map(function (r) {
              return normalizeId(r["Reserva"]) === normalizeId(row["Reserva"]) ? _objectSpread(_objectSpread({}, r), {}, {
                _diff: null,
                _changes: null
              }) : r;
            });
          });
        }
      },
      className: "px-2 bg-slate-200 text-slate-500 rounded hover:bg-slate-300 transition",
      title: "Descartar"
    }, /*#__PURE__*/React.createElement(IconX, {
      size: 12
    }))), /*#__PURE__*/React.createElement("div", {
      className: "text-[9px] text-slate-500 font-mono bg-white p-1.5 rounded border border-slate-100 shadow-sm leading-relaxed whitespace-pre-wrap"
    }, changeDetails.map(function (d, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        className: d.includes("→") ? "text-blue-600 font-bold" : ""
      }, "\u2022 ", d);
    })))), /*#__PURE__*/React.createElement("td", {
      className: "p-3 border-b font-mono text-xs font-bold text-slate-500 align-top"
    }, row["Reserva"]), /*#__PURE__*/React.createElement("td", {
      className: "p-3 border-b font-bold text-slate-700 text-xs align-top"
    }, row["Nombre del Grupo"] || row["Empresa/Agencia"]), /*#__PURE__*/React.createElement("td", {
      className: "p-3 border-b text-xs align-top"
    }, formatDate(row["Entrada"])), /*#__PURE__*/React.createElement("td", {
      className: "p-3 border-b text-xs font-bold align-top"
    }, row["Estado"]), /*#__PURE__*/React.createElement("td", {
      className: "p-3 border-b text-center text-xs align-top"
    }, row["Pax."]), /*#__PURE__*/React.createElement("td", {
      className: "p-3 border-b text-xs align-top font-semibold text-slate-600 uppercase"
    }, row["Segment."]), /*#__PURE__*/React.createElement("td", {
      className: "p-3 border-b text-right text-xs font-mono align-top"
    }, parseNum(row["Importe(*)"]).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }), " ", "\u20AC"));
  })), (data || []).filter(function (r) {
    return r._diff;
  }).length === 0 && /*#__PURE__*/React.createElement("tbody", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length + 1,
    className: "p-12 text-center text-slate-400"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center gap-2 animate-fade-in mt-8 mb-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-2 shadow-sm"
  }, /*#__PURE__*/React.createElement(IconCheck, {
    size: 36
  })), /*#__PURE__*/React.createElement("p", {
    className: "font-bold text-2xl text-slate-700"
  }, "\xA1Todo Sincronizado!"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-500 mb-6"
  }, "No hay cambios pendientes de revisi\xF3n."), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.location.reload();
    },
    className: "px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 shadow-md btn-glow"
  }, /*#__PURE__*/React.createElement(IconCheck, {
    size: 18
  }), "Aceptar y Continuar"))))))), /*#__PURE__*/React.createElement("div", {
    className: "p-2 border-t text-xs text-gray-500 text-center bg-slate-50 flex justify-between items-center px-4"
  }, /*#__PURE__*/React.createElement("span", null, "Mostrando solo registros con cambios (", (data || []).filter(function (r) {
    return r._diff;
  }).length, ")"), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-2 h-2 rounded-full bg-green-500"
  }), " ", "Nuevo"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-2 h-2 rounded-full bg-blue-500"
  }), " ", "Modificado"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-2 h-2 rounded-full bg-red-500"
  }), " ", "Cancelado")))), showColumnModal && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-6 rounded-lg shadow-xl w-96"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-bold mb-4"
  }, "A\xF1adir Nueva Columna"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: "Nombre (ej. Estado, Notas)",
    className: "w-full border p-2 rounded mb-4",
    value: newColumnName,
    onChange: function onChange(e) {
      return setNewColumnName(e.target.value);
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-end gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowColumnModal(false);
    },
    className: "px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: addNewColumn,
    className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  }, "A\xF1adir")))), showImportSummary && importSummaryData && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in border border-slate-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white relative"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20"
  }, /*#__PURE__*/React.createElement(IconCheck, {
    size: 24,
    stroke: 3
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-black tracking-tight"
  }, "Importaci\xF3n Finalizada"), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5"
  }, "Resumen de sincronizaci\xF3n"))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowImportSummary(false);
    },
    className: "absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
  }, /*#__PURE__*/React.createElement(IconX, {
    size: 20
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-8 space-y-6"
  }, /*#__PURE__*/React.createElement("div", {
    class: "grid grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 p-4 rounded-2xl border border-slate-100 col-span-2 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1"
  }, "Hotel Asignado"), /*#__PURE__*/React.createElement("span", {
    className: "text-lg font-black text-blue-800"
  }, importSummaryData.detectedHotel || "Automático")), /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
  }, /*#__PURE__*/React.createElement(IconCheck, {
    size: 20,
    className: "text-blue-600"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 p-4 rounded-2xl border border-slate-100"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1"
  }, "Registros Procesados"), /*#__PURE__*/React.createElement("span", {
    className: "text-2xl font-black text-slate-800"
  }, importSummaryData.totalRowsProcessed)), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 p-4 rounded-2xl border border-slate-100"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1"
  }, "Grupos \xDAnicos"), /*#__PURE__*/React.createElement("span", {
    className: "text-2xl font-black text-slate-800"
  }, importSummaryData.uniqueGroups))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white"
  }, /*#__PURE__*/React.createElement(IconPlus, {
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-bold text-emerald-900"
  }, "Nuevos Grupos")), /*#__PURE__*/React.createElement("span", {
    className: "text-lg font-black text-emerald-600"
  }, "+", importSummaryData.newGroupsCount)), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white"
  }, /*#__PURE__*/React.createElement(IconEdit, {
    size: 16
  })), /*#__PURE__*/React.createElement("span", {
    className: "text-sm font-bold text-blue-900"
  }, "Modificaciones")), /*#__PURE__*/React.createElement("span", {
    className: "text-lg font-black text-blue-600"
  }, importSummaryData.modifiedGroupsCount))), importSummaryData.errors && importSummaryData.errors.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "mt-4 p-4 bg-rose-50 rounded-xl border border-rose-100 overflow-y-auto max-h-40 custom-scrollbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 mb-2 text-rose-800 font-bold text-sm"
  }, /*#__PURE__*/React.createElement(IconAlertTriangle, {
    size: 16
  }), "Errores o Advertencias (", importSummaryData.errors.length, ")"), /*#__PURE__*/React.createElement("ul", {
    className: "list-disc pl-5 space-y-1 text-xs text-rose-600"
  }, importSummaryData.errors.slice(0, 10).map(function (err, i) {
    return /*#__PURE__*/React.createElement("li", {
      key: i
    }, err);
  }), importSummaryData.errors.length > 10 && /*#__PURE__*/React.createElement("li", {
    className: "list-none text-rose-400 mt-2 italic font-medium"
  }, "+ ", importSummaryData.errors.length - 10, " ", "errores m\xE1s..."))), /*#__PURE__*/React.createElement("div", {
    className: "pt-4 border-t border-slate-100 flex flex-col gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-xs font-bold"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-500 uppercase tracking-wider"
  }, "Total Pax en archivo:"), /*#__PURE__*/React.createElement("span", {
    className: "text-slate-800"
  }, importSummaryData.totalPax)), /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between text-xs font-bold"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-slate-500 uppercase tracking-wider"
  }, "Importe Total en archivo:"), /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-600"
  }, importSummaryData.totalRevenue.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR"
  })))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setShowImportSummary(false);
      setActiveTab("table");
      setShowOnlyChanges(true);
    },
    className: "w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
  }, "Revisar Cambios Detallados")))), showAiModal && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "p-4 border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-t-lg flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-bold flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(IconBrain, {
    className: "text-purple-300"
  }), aiResult ? aiResult.title : "Analizando datos..."), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowAiModal(false);
    },
    className: "text-slate-400 hover:text-white"
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    className: "p-6 overflow-y-auto custom-scrollbar flex-1"
  }, isAiLoading ? /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center justify-center py-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-slate-500 animate-pulse-slow text-center"
  }, "Gemini est\xE1 analizando tus reservas... ", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "text-xs"
  }, "Buscando patrones y rentabilidad."))) : /*#__PURE__*/React.createElement("div", {
    className: "prose prose-sm max-w-none text-slate-700",
    dangerouslySetInnerHTML: {
      __html: marked.parse((aiResult === null || aiResult === void 0 ? void 0 : aiResult.content) || "")
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "p-4 border-t bg-slate-50 text-right rounded-b-lg"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowAiModal(false);
    },
    className: "px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition"
  }, "Cerrar")))), showFichaModal && selectedGroupFicha && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl shadow-2xl w-[98vw] h-[95vh] overflow-y-auto flex flex-col animate-fade-in border border-slate-200 text-sm"
  }, function (_selectedGroupFicha$r2, _selectedGroupFicha$r3, _selectedGroupFicha$r4, _selectedGroupFicha$r5, _selectedGroupFicha$r9, _selectedGroupFicha$r0, _selectedGroupFicha$r1, _selectedGroupFicha$r10, _selectedGroupFicha$r11, _selectedGroupFicha$r12, _selectedGroupFicha$r21, _selectedGroupFicha$r23, _selectedGroupFicha$r25, _selectedGroupFicha$r26, _selectedGroupFicha$r28, _selectedGroupFicha$r29, _selectedGroupFicha$r30, _selectedGroupFicha$r31, _selectedGroupFicha$r32, _selectedGroupFicha$r33, _selectedGroupFicha$r34, _selectedGroupFicha$r35, _selectedGroupFicha$r36, _selectedGroupFicha$r37, _selectedGroupFicha$r38, _selectedGroupFicha$r42, _selectedGroupFicha$r46) {
    // --- CÁLCULOS COMPARTIDOS (FINANZAS Y FECHAS) ---

    var now = new Date();
    var daysToArrival = 0;
    if (selectedGroupFicha.arrival) {
      var d = new Date(selectedGroupFicha.arrival);
      if (!isNaN(d.getTime())) {
        var diffTime = d - now;
        daysToArrival = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }
    var releaseDateStr = (_selectedGroupFicha$r2 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r2 === void 0 ? void 0 : _selectedGroupFicha$r2["Com_Vencimiento_Rel"];
    var daysToRelease = null;
    if (releaseDateStr) {
      var releaseDate = new Date(releaseDateStr);
      if (!isNaN(releaseDate.getTime())) {
        daysToRelease = Math.ceil((releaseDate - now) / (1000 * 60 * 60 * 24));
      }
    }
    var roomList = JSON.parse(((_selectedGroupFicha$r3 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r3 === void 0 ? void 0 : _selectedGroupFicha$r3["RoomingList_JSON"]) || "[]");
    var totalB10 = 0,
      totalI10 = 0,
      totalB21 = 0,
      totalI21 = 0;
    roomList.forEach(function (item) {
      var sub = parseFloat(item.total) || 0;
      var rate = item.iva == 21 ? 1.21 : 1.1;
      var base = sub / rate;
      if (item.iva == 21) {
        totalB21 += base;
        totalI21 += sub - base;
      } else {
        totalB10 += base;
        totalI10 += sub - base;
      }
    });
    var grandTotal = roomList.reduce(function (acc, i) {
      return acc + (parseFloat(i.total) || 0);
    }, 0);
    var totalComision = roomList.reduce(function (acc, i) {
      var _i$comision4;
      return acc + (parseFloat((_i$comision4 = i.comision) === null || _i$comision4 === void 0 ? void 0 : _i$comision4.total_comision) || 0);
    }, 0);
    var netTotal = grandTotal - totalComision;
    var totalPaidFromPlan = 0;
    (selectedGroupFicha.records || []).forEach(function (r) {
      try {
        var plan = JSON.parse(r.PaymentPlan_JSON || "[]");
        plan.forEach(function (p) {
          if (p.status === "Cobrado") totalPaidFromPlan += parseFloat(p.amount) || 0;
        });
      } catch (e) {}
    });
    var manualPaid = parseNum(((_selectedGroupFicha$r4 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r4 === void 0 ? void 0 : _selectedGroupFicha$r4["Com_Pagado"]) || "0");
    var totalPaid = Math.max(manualPaid, totalPaidFromPlan);
    var pendingAmount = Math.max(0, netTotal - totalPaid);
    var urgentPayments = [];
    var todayForAlert = new Date();
    todayForAlert.setHours(0, 0, 0, 0);
    (selectedGroupFicha.records || []).forEach(function (r) {
      try {
        var plan = JSON.parse(r.PaymentPlan_JSON || "[]");
        plan.forEach(function (p) {
          if (p.status !== "Cobrado") {
            var _d5 = new Date(toInputDate(p.date));
            _d5.setHours(0, 0, 0, 0);
            var diff = Math.ceil((_d5 - todayForAlert) / (1000 * 60 * 60 * 24));
            if (diff <= 2) urgentPayments.push(_objectSpread(_objectSpread({}, p), {}, {
              hotel: r["Hotel_Asignado"] || r["Hotel"] || "Gral."
            }));
          }
        });
      } catch (e) {}
    });
    var hotelAsignado = ((_selectedGroupFicha$r5 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r5 === void 0 ? void 0 : _selectedGroupFicha$r5["Hotel_Asignado"]) || "";
    var isCumbria = hotelAsignado.toLowerCase().includes("cumbria");
    var headerBg = isCumbria ? "bg-[#0f172a]" : "bg-[#2d5a43]";
    var iconBg = isCumbria ? "bg-indigo-500" : "bg-emerald-500";
    var titleColor = isCumbria ? "text-indigo-400" : "text-emerald-400";
    var forecastColor = isCumbria ? "text-indigo-300" : "text-emerald-300";
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "".concat(headerBg, " text-white p-6 border-b border-white/10 shrink-0 relative overflow-hidden")
    }, /*#__PURE__*/React.createElement("div", {
      className: "absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex gap-6 items-center flex-1 min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-14 h-14 ".concat(iconBg, " rounded-2xl flex items-center justify-center shadow-2xl shrink-0 border border-white/20")
    }, /*#__PURE__*/React.createElement(IconUsers, {
      size: 28
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 min-w-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-center gap-4 mb-2"
    }, /*#__PURE__*/React.createElement("input", {
      className: "text-3xl font-black tracking-tight leading-tight ".concat(titleColor, " drop-shadow-sm bg-transparent border-none outline-none focus:ring-2 focus:ring-white/10 rounded-lg px-2 -ml-2 w-full lg:max-w-2xl transition-all uppercase"),
      value: selectedGroupFicha.name || "",
      onChange: function onChange(e) {
        var newName = e.target.value;
        setSelectedGroupFicha(function (prev) {
          return _objectSpread(_objectSpread({}, prev), {}, {
            name: newName
          });
        });
      },
      onBlur: function onBlur(e) {
        updateGroupMetadata(selectedGroupFicha.id, "Nombre del Grupo", e.target.value);
      },
      onKeyDown: function onKeyDown(e) {
        if (e.key === "Enter") e.target.blur();
      }
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2.5 h-fit shrink-0"
    }, function (_selectedGroupFicha$r6, _selectedGroupFicha$r7, _selectedGroupFicha$r8) {
      // Prioridad: Com_Estado_Interno > Estado (el campo del Excel no debe sobrescribir el estado interno)

      var internalStatus = (_selectedGroupFicha$r6 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r6 === void 0 ? void 0 : _selectedGroupFicha$r6["Com_Estado_Interno"];
      var externalStatus = (_selectedGroupFicha$r7 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r7 === void 0 ? void 0 : _selectedGroupFicha$r7["Estado"];

      // Solo usar Estado externo si NO hay un Com_Estado_Interno definido

      var effectiveStatus = internalStatus || ((_selectedGroupFicha$r8 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r8 === void 0 ? void 0 : _selectedGroupFicha$r8["Segment."]);
      var st = getStatusProps(effectiveStatus, selectedGroupFicha.arrival, internalStatus ? null : externalStatus);
      return /*#__PURE__*/React.createElement("span", {
        className: "px-3 py-1.5 rounded-xl text-[11px] font-black uppercase shadow-lg border border-white/10 ".concat(st.text)
      }, st.label);
    }(), /*#__PURE__*/React.createElement("span", {
      className: "bg-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase border border-white/10 backdrop-blur-sm"
    }, ((_selectedGroupFicha$r9 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r9 === void 0 ? void 0 : _selectedGroupFicha$r9["Régimen"]) || "HD"), /*#__PURE__*/React.createElement("span", {
      className: "bg-blue-500/30 px-3 py-1.5 rounded-xl text-[10px] font-black text-blue-100 uppercase border border-blue-500/30 backdrop-blur-sm"
    }, ((_selectedGroupFicha$r0 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r0 === void 0 ? void 0 : _selectedGroupFicha$r0["Segment."]) || "GRUPOS"))), /*#__PURE__*/React.createElement("p", {
      className: "text-slate-300 text-[11px] font-bold uppercase tracking-[0.1em] flex flex-wrap items-center gap-x-4 gap-y-1.5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-white/70 bg-white/5 px-2 py-0.5 rounded border border-white/5"
    }, ((_selectedGroupFicha$r1 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r1 === void 0 ? void 0 : _selectedGroupFicha$r1["Empresa/Agencia"]) || ((_selectedGroupFicha$r10 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r10 === void 0 ? void 0 : _selectedGroupFicha$r10["Empresa"]) || "VENTA DIRECTA"), /*#__PURE__*/React.createElement("span", {
      className: "bg-white/10 px-2 py-0.5 rounded text-white font-black"
    }, selectedGroupFicha.totalPax, " PAX"), /*#__PURE__*/React.createElement("span", {
      className: "text-white/40 font-mono"
    }, "REF:", " ", (_selectedGroupFicha$r11 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r11 === void 0 ? void 0 : _selectedGroupFicha$r11["Reserva"]), function () {
      var r = selectedGroupFicha.records[0] || {};
      var contactName = r["Com_Nombre_Contacto"] || r["Persona_Contacto"];
      var contactEmail = r["Com_Email_Contacto"] || r["Email"];
      var contactPhone = r["Com_Telefono_Contacto"] || r["Telefono"] || r["Teléfono"];
      if (!contactName && !contactEmail && !contactPhone) return null;
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        className: "opacity-30"
      }, "\u2022"), /*#__PURE__*/React.createElement("span", {
        className: "flex items-center gap-3 text-white/70"
      }, contactName && /*#__PURE__*/React.createElement("span", {
        className: "flex items-center gap-1.5 font-black text-white/90"
      }, /*#__PURE__*/React.createElement(IconUser, {
        size: 12,
        className: "opacity-60"
      }), contactName), contactEmail && /*#__PURE__*/React.createElement("span", {
        className: "flex items-center gap-1"
      }, /*#__PURE__*/React.createElement(IconMail, {
        size: 12,
        className: "opacity-60"
      }), contactEmail), contactPhone && /*#__PURE__*/React.createElement("span", {
        className: "flex items-center gap-1"
      }, /*#__PURE__*/React.createElement(IconPhone, {
        size: 12,
        className: "opacity-60"
      }), contactPhone)));
    }(), (((_selectedGroupFicha$r12 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r12 === void 0 ? void 0 : _selectedGroupFicha$r12["Reserva"]) || "").toString().startsWith("PRES") && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "opacity-30"
    }, "\u2022"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick(e) {
        e.stopPropagation();
        handleMergeGroup(selectedGroupFicha);
      },
      className: "ml-2 px-2 py-0.5 bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/30 rounded text-[9px] font-black text-indigo-100 uppercase transition-all flex items-center gap-1 shadow-sm",
      title: "Fusionar con Reserva PMS"
    }, /*#__PURE__*/React.createElement(IconPlus, {
      size: 10,
      strokeWidth: 3
    }), " ", "Fusionar PMS"))))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-8 bg-black/30 p-4 px-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl shrink-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[9px] font-black uppercase opacity-40 tracking-widest mb-1.5"
    }, "Cobrado"), /*#__PURE__*/React.createElement("p", {
      className: "text-base font-black tabular-nums ".concat(totalPaid >= netTotal - 0.01 && netTotal > 0 ? "text-emerald-400" : "text-orange-400")
    }, totalPaid.toLocaleString("es-ES", {
      useGrouping: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }), "\u20AC")), /*#__PURE__*/React.createElement("div", {
      className: "w-px h-10 bg-white/10"
    }, " "), function () {
      var overpaidAmount = Math.max(0, totalPaid - netTotal);
      if (overpaidAmount > 0.01 && netTotal > 0) {
        return /*#__PURE__*/React.createElement("div", {
          className: "text-center"
        }, /*#__PURE__*/React.createElement("p", {
          className: "text-[9px] font-black uppercase text-amber-300 tracking-widest mb-1.5"
        }, "Pagado de m\xE1s"), /*#__PURE__*/React.createElement("p", {
          className: "text-base font-black text-amber-300 tabular-nums"
        }, overpaidAmount.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }), "\u20AC"));
      }
      if (totalPaid >= netTotal - 0.01 && netTotal > 0) {
        return /*#__PURE__*/React.createElement("div", {
          className: "text-center"
        }, /*#__PURE__*/React.createElement("span", {
          className: "inline-block px-4 py-2 rounded-2xl text-[12px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
        }, "\u2713 PAGADO"));
      } else {
        var pVal = Math.max(0, netTotal - totalPaid);
        return /*#__PURE__*/React.createElement("div", {
          className: "text-center"
        }, /*#__PURE__*/React.createElement("p", {
          className: "text-[9px] font-black uppercase text-rose-300 tracking-widest mb-1.5"
        }, "Pendiente"), /*#__PURE__*/React.createElement("p", {
          className: "text-base font-black text-rose-400 tabular-nums"
        }, pVal.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }), "\u20AC"));
      }
    }(), /*#__PURE__*/React.createElement("div", {
      className: "w-px h-10 bg-white/10"
    }, " "), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] font-black uppercase tracking-widest text-white/40 mb-1"
    }, "Total Grupo"), /*#__PURE__*/React.createElement("p", {
      className: "text-4xl font-black text-white drop-shadow-2xl tabular-nums leading-none tracking-tighter"
    }, netTotal.toLocaleString("es-ES", {
      useGrouping: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-lg ml-1.5 opacity-40 font-bold"
    }, "\u20AC")))))), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/50"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-6"
    }, urgentPayments.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-rose-600 text-white p-2.5 rounded-xl flex items-center gap-3 animate-pulse shadow-lg shadow-rose-600/20"
    }, /*#__PURE__*/React.createElement(IconAlertTriangle, {
      size: 18,
      stroke: 3
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] font-black uppercase tracking-wider"
    }, "\xA1Alerta de Cobro! Pagos pendientes en menos de 48h"), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-x-4"
    }, urgentPayments.slice(0, 3).map(function (up, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        className: "text-[9px] font-bold opacity-90"
      }, "\u2022 ", up.label, ":", " ", parseFloat(up.amount).toLocaleString("es-ES"), "\u20AC (", up.hotel, ")");
    })))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm items-end"
    }, /*#__PURE__*/React.createElement("div", {
      className: "md:col-span-2"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
    }, "Estado Seguimiento"), /*#__PURE__*/React.createElement("div", {
      className: "relative"
    }, function (_selectedGroupFicha$r13, _selectedGroupFicha$r14, _selectedGroupFicha$r15, _selectedGroupFicha$r16, _selectedGroupFicha$r17, _selectedGroupFicha$r18) {
      var rawStatus = ((_selectedGroupFicha$r13 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r13 === void 0 ? void 0 : _selectedGroupFicha$r13["Com_Estado_Interno"]) || ((_selectedGroupFicha$r14 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r14 === void 0 ? void 0 : _selectedGroupFicha$r14["Segment."]) || ((_selectedGroupFicha$r15 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r15 === void 0 ? void 0 : _selectedGroupFicha$r15["Estado"]) || "PROSPECTO";
      var st = getStatusProps(rawStatus, selectedGroupFicha.arrival, (_selectedGroupFicha$r16 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r16 === void 0 ? void 0 : _selectedGroupFicha$r16["Estado"]);
      var selectVal = "PROSPECTO";
      var s = rawStatus.toUpperCase();
      if (s.includes("CONFIRM") || s.includes("GARANT") || s.includes("RESERVA") || s === "GRUPOS") selectVal = "CONFIRMADO";else if (s.includes("TANTEO") || s.includes("TENTA") || s.includes("BLOQ") || s.includes("OPCI")) selectVal = "TENTATIVA";else if (s.includes("PRESUP") || s.includes("ENVIA") || s.includes("COTIZ") || s.includes("OFERT")) selectVal = "PRESUPUESTO";else if (s.includes("CANC") || s.includes("ANUL") || s.includes("BAJA")) selectVal = "CANCELADO";else if (s.includes("PROSPEC") || s.includes("PENDIE")) selectVal = "PROSPECTO";
      return /*#__PURE__*/React.createElement("select", {
        className: "w-full h-9 pl-3 pr-8 text-[10px] font-black uppercase rounded-xl text-white appearance-none outline-none border-2 border-transparent transition-all shadow-sm cursor-pointer ".concat(st.color),
        value: selectVal,
        onChange: function onChange(e) {
          return updateGroupMetadata(selectedGroupFicha.id, "Com_Estado_Interno", e.target.value);
        }
      }, (String(((_selectedGroupFicha$r17 = selectedGroupFicha.records) === null || _selectedGroupFicha$r17 === void 0 || (_selectedGroupFicha$r17 = _selectedGroupFicha$r17[0]) === null || _selectedGroupFicha$r17 === void 0 ? void 0 : _selectedGroupFicha$r17.Reserva) || '').startsWith('PRES-') || (((_selectedGroupFicha$r18 = selectedGroupFicha.records) === null || _selectedGroupFicha$r18 === void 0 || (_selectedGroupFicha$r18 = _selectedGroupFicha$r18[0]) === null || _selectedGroupFicha$r18 === void 0 ? void 0 : _selectedGroupFicha$r18.Estado) || '').toUpperCase() === 'PRESUPUESTO') && !selectVal.includes('CONFIRM') ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("option", {
        value: "PENDIENTE"
      }, "PENDIENTE"), /*#__PURE__*/React.createElement("option", {
        value: "SEGUIMIENTO"
      }, "SEGUIMIENTO"), /*#__PURE__*/React.createElement("option", {
        value: "DESESTIMADO"
      }, "DESESTIMADO")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("option", {
        value: "PRESUPUESTO"
      }, "PRESUPUESTO"), /*#__PURE__*/React.createElement("option", {
        value: "TENTATIVA"
      }, "TENTATIVA"), /*#__PURE__*/React.createElement("option", {
        value: "CONFIRMADO"
      }, "CONFIRMADO"), /*#__PURE__*/React.createElement("option", {
        value: "CANCELADO"
      }, "CANCELADO"), /*#__PURE__*/React.createElement("option", {
        value: "PROSPECTO"
      }, "PROSPECTO")));
    }(), /*#__PURE__*/React.createElement(IconChevronDown, {
      size: 14,
      className: "absolute right-3 top-2.5 text-white/70 pointer-events-none"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "md:col-span-2"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
    }, "Hotel Principal"), /*#__PURE__*/React.createElement("div", {
      className: "relative"
    }, /*#__PURE__*/React.createElement("select", {
      className: "w-full h-9 pl-3 pr-8 text-[10px] font-black uppercase rounded-xl bg-slate-50 border border-slate-200 text-slate-700 appearance-none outline-none hover:border-blue-400 transition-all cursor-pointer",
      value: function (_selectedGroupFicha$r19, _selectedGroupFicha$r20) {
        var raw = ((_selectedGroupFicha$r19 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r19 === void 0 ? void 0 : _selectedGroupFicha$r19["Hotel_Asignado"]) || ((_selectedGroupFicha$r20 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r20 === void 0 ? void 0 : _selectedGroupFicha$r20["Hotel"]) || "Sercotel Guadiana";
        if (raw.toLowerCase().includes("cumbria")) return "Cumbria Spa&Hotel";
        if (raw.toLowerCase().includes("guadiana")) return "Sercotel Guadiana";
        return raw;
      }(),
      onChange: function onChange(e) {
        return updateGroupMetadata(selectedGroupFicha.id, "Hotel_Asignado", e.target.value);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "Sercotel Guadiana"
    }, "Sercotel Guadiana"), /*#__PURE__*/React.createElement("option", {
      value: "Cumbria Spa&Hotel"
    }, "Cumbria Spa&Hotel")), /*#__PURE__*/React.createElement(IconChevronDown, {
      size: 14,
      className: "absolute right-3 top-2.5 text-slate-400 pointer-events-none"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "md:col-span-2"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
    }, "Comercial"), /*#__PURE__*/React.createElement("div", {
      className: "relative"
    }, /*#__PURE__*/React.createElement("select", {
      className: "w-full h-9 pl-3 pr-8 text-[10px] font-black uppercase rounded-xl bg-slate-50 border text-slate-700 appearance-none outline-none transition-all cursor-pointer ".concat((_selectedGroupFicha$r21 = selectedGroupFicha.records[0]) !== null && _selectedGroupFicha$r21 !== void 0 && _selectedGroupFicha$r21["Com_Comercial"] && commercials.some(function (c) {
        var _selectedGroupFicha$r22;
        return c.name === ((_selectedGroupFicha$r22 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r22 === void 0 ? void 0 : _selectedGroupFicha$r22["Com_Comercial"]) && !c.active;
      }) ? "border-rose-200 bg-rose-50 text-rose-700" : "border-slate-200 hover:border-blue-400"),
      value: ((_selectedGroupFicha$r23 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r23 === void 0 ? void 0 : _selectedGroupFicha$r23["Com_Comercial"]) || "",
      onChange: function onChange(e) {
        return updateGroupMetadata(selectedGroupFicha.id, "Com_Comercial", e.target.value);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "SIN ASIGNAR"), commercials.filter(function (c) {
      var _selectedGroupFicha$r24;
      return c.active || c.name === ((_selectedGroupFicha$r24 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r24 === void 0 ? void 0 : _selectedGroupFicha$r24["Com_Comercial"]);
    }).map(function (c) {
      return /*#__PURE__*/React.createElement("option", {
        key: c.name,
        value: c.name
      }, c.name, " ", !c.active ? "(INACTIVO)" : "");
    })), /*#__PURE__*/React.createElement(IconChevronDown, {
      size: 14,
      className: "absolute right-3 top-2.5 text-slate-400 pointer-events-none"
    }))), (String(((_selectedGroupFicha$r25 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r25 === void 0 ? void 0 : _selectedGroupFicha$r25["Reserva"]) || "").startsWith("PRES-") || String(((_selectedGroupFicha$r26 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r26 === void 0 ? void 0 : _selectedGroupFicha$r26["Com_Estado_Interno"]) || "").toUpperCase() === "PRESUPUESTO") && /*#__PURE__*/React.createElement("div", {
      className: "md:col-span-1 flex items-end pb-0.5"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var _selectedGroupFicha$r27;
        return window.location.href = "Presupuestos.html?id=".concat((_selectedGroupFicha$r27 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r27 === void 0 ? void 0 : _selectedGroupFicha$r27["Reserva"]);
      },
      className: "w-full h-9 flex items-center justify-center gap-2 bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-xl shadow-lg shadow-purple-200 transition-all hover:scale-[1.05] active:scale-[0.95]",
      title: "Abrir en Nexus Presupuestos"
    }, /*#__PURE__*/React.createElement(IconFileSpreadsheet, {
      size: 16,
      stroke: 2.5
    }))), /*#__PURE__*/React.createElement("div", {
      className: "md:col-span-3 grid grid-cols-1 gap-2"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
    }, "Pr\xF3x. Seg."), /*#__PURE__*/React.createElement("input", {
      type: "date",
      className: "w-full h-9 px-2 text-[10px] font-black rounded-xl border ".concat((_selectedGroupFicha$r28 = selectedGroupFicha.records[0]) !== null && _selectedGroupFicha$r28 !== void 0 && _selectedGroupFicha$r28["Com_Seguimiento"] && new Date((_selectedGroupFicha$r29 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r29 === void 0 ? void 0 : _selectedGroupFicha$r29["Com_Seguimiento"]) <= new Date() ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600", " outline-none focus:border-blue-500 transition-all"),
      value: ((_selectedGroupFicha$r30 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r30 === void 0 ? void 0 : _selectedGroupFicha$r30["Com_Seguimiento"]) || "",
      onChange: function onChange(e) {
        return updateGroupMetadata(selectedGroupFicha.id, "Com_Seguimiento", e.target.value);
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "md:col-span-3 grid grid-cols-2 gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var rec = selectedGroupFicha.records[0] || {};
        setTempClientData({
          Fiscal_RazonSocial: rec["Fiscal_RazonSocial"] || rec["Empresa/Agencia"] || "",
          Fiscal_CIF: rec["Fiscal_CIF"] || "",
          Persona_Contacto: rec["Persona_Contacto"] || "",
          Email: rec["Email"] || "",
          Telefono: rec["Telefono"] || "",
          Fiscal_Direccion: rec["Fiscal_Direccion"] || "",
          Fiscal_CP: rec["Fiscal_CP"] || "",
          Fiscal_Poblacion: rec["Fiscal_Poblacion"] || "",
          Fiscal_Provincia: rec["Fiscal_Provincia"] || "",
          Fiscal_Pais: rec["Fiscal_Pais"] || "",
          Observaciones: rec["Observaciones"] || ""
        });
        setShowClientData(true);
      },
      className: "flex items-center gap-2 h-9 px-3 bg-blue-50 border border-blue-100 hover:border-blue-300 rounded-xl group transition-all"
    }, /*#__PURE__*/React.createElement(IconUsers, {
      size: 14,
      className: "text-blue-400"
    }), /*#__PURE__*/React.createElement("div", {
      className: "text-left overflow-hidden"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-[7px] font-black text-blue-400 uppercase leading-none"
    }, "Cliente"), /*#__PURE__*/React.createElement("div", {
      className: "text-[9px] font-black text-blue-700 truncate w-full"
    }, (((_selectedGroupFicha$r31 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r31 === void 0 ? void 0 : _selectedGroupFicha$r31["Fiscal_RazonSocial"]) || ((_selectedGroupFicha$r32 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r32 === void 0 ? void 0 : _selectedGroupFicha$r32["Empresa/Agencia"]) || "Dato Incompleto").substring(0, 15)))), /*#__PURE__*/React.createElement("div", {
      className: "bg-emerald-50 border border-emerald-100 rounded-xl px-2 h-9 flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[7px] font-black text-emerald-400 uppercase block leading-none"
    }, "Pagado")), /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "bg-transparent border-none text-[12px] font-black text-emerald-700 outline-none w-full tabular-nums",
      value: ((_selectedGroupFicha$r33 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r33 === void 0 ? void 0 : _selectedGroupFicha$r33["Com_Pagado"]) || "",
      onChange: function onChange(e) {
        return updateGroupMetadata(selectedGroupFicha.id, "Com_Pagado", e.target.value);
      }
    })))), (((_selectedGroupFicha$r34 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r34 === void 0 ? void 0 : _selectedGroupFicha$r34["Observaciones"]) || ((_selectedGroupFicha$r35 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r35 === void 0 ? void 0 : _selectedGroupFicha$r35["Observac."])) && /*#__PURE__*/React.createElement("div", {
      className: "bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 items-start animate-fade-in shadow-sm"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-amber-100 text-amber-600 p-1.5 rounded-lg shrink-0 mt-0.5"
    }, /*#__PURE__*/React.createElement(IconFile, {
      size: 16
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex-1"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1"
    }, "Observaciones de Origen (PMS)"), /*#__PURE__*/React.createElement("p", {
      className: "text-[11px] text-amber-800 leading-relaxed font-medium"
    }, ((_selectedGroupFicha$r36 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r36 === void 0 ? void 0 : _selectedGroupFicha$r36["Observaciones"]) || ((_selectedGroupFicha$r37 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r37 === void 0 ? void 0 : _selectedGroupFicha$r37["Observac."]))))), /*#__PURE__*/React.createElement("div", {
      className: "bg-slate-50/80 p-4 rounded-xl border border-slate-200 shadow-sm mt-4 backdrop-blur-sm relative overflow-hidden"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-end gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-32"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1"
    }, "Hotel Destino"), /*#__PURE__*/React.createElement("select", {
      className: "w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer",
      value: roomManagerForm.hotel,
      onChange: function onChange(e) {
        return setRoomManagerForm(_objectSpread(_objectSpread({}, roomManagerForm), {}, {
          hotel: e.target.value
        }));
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "Sercotel Guadiana"
    }, "Sercotel Guadiana"), /*#__PURE__*/React.createElement("option", {
      value: "Cumbria Spa&Hotel"
    }, "Cumbria Spa&Hotel"), /*#__PURE__*/React.createElement("option", {
      value: "General"
    }, "Varios/Otros"))), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 min-w-[150px]"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1"
    }, "Producto / Habitaci\xF3n"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      list: "room-types-list",
      className: "w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 transition-all placeholder:font-normal uppercase",
      placeholder: "Ej: DBL, IND, Almuerzo...",
      value: roomManagerForm.type,
      onChange: function onChange(e) {
        var val = e.target.value;
        var valUpper = val.toUpperCase();

        // Solo auto-completamos pax si hay un match EXACTO con el label (ignorando mayúsculas)

        // Esto evita que el input 'salte' mientras escribes

        var config = ROOM_CONFIGURATIONS.find(function (c) {
          return c.label.toUpperCase() === valUpper;
        });
        if (config) {
          setRoomManagerForm(_objectSpread(_objectSpread({}, roomManagerForm), {}, {
            type: config.label,
            pax: config.pax,
            isService: !!config.isService
          }));
        } else {
          setRoomManagerForm(_objectSpread(_objectSpread({}, roomManagerForm), {}, {
            type: val
          }));
        }
      }
    }), /*#__PURE__*/React.createElement("datalist", {
      id: "room-types-list"
    }, ROOM_CONFIGURATIONS.map(function (c) {
      return /*#__PURE__*/React.createElement("option", {
        key: c.label,
        value: c.label
      });
    }))), /*#__PURE__*/React.createElement("div", {
      className: "w-28"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1"
    }, "Fecha Cargo"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      className: "w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-2 text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all cursor-pointer",
      value: toInputDate(roomManagerForm.dateIn),
      onChange: function onChange(e) {
        return setRoomManagerForm(_objectSpread(_objectSpread({}, roomManagerForm), {}, {
          dateIn: e.target.value
        }));
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "w-14"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-center"
    }, "IA"), /*#__PURE__*/React.createElement("div", {
      className: "flex h-9 items-center justify-center bg-slate-50 border border-slate-200 rounded-lg"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      className: "w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer",
      checked: roomManagerForm.isService,
      onChange: function onChange(e) {
        return setRoomManagerForm(_objectSpread(_objectSpread({}, roomManagerForm), {}, {
          isService: e.target.checked
        }));
      }
    }))), !roomManagerForm.isService && /*#__PURE__*/React.createElement("div", {
      className: "w-12"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-center"
    }, "Noches"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "w-full h-9 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all font-mono",
      value: roomManagerForm.nights,
      onChange: function onChange(e) {
        return setRoomManagerForm(_objectSpread(_objectSpread({}, roomManagerForm), {}, {
          nights: parseInt(e.target.value) || 1
        }));
      },
      min: "1"
    })), /*#__PURE__*/React.createElement("div", {
      className: "w-12"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-center"
    }, "UND."), /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "w-full h-9 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all font-mono",
      value: roomManagerForm.qty,
      onChange: function onChange(e) {
        return setRoomManagerForm(_objectSpread(_objectSpread({}, roomManagerForm), {}, {
          qty: parseInt(e.target.value) || 1
        }));
      },
      min: "1"
    })), /*#__PURE__*/React.createElement("div", {
      className: "w-12"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-center"
    }, "Pax"), /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "w-full h-9 bg-indigo-50 border border-indigo-200 rounded-lg text-center text-xs font-bold text-indigo-700 outline-none focus:border-indigo-500 transition-all font-mono shadow-inner",
      value: roomManagerForm.pax,
      onChange: function onChange(e) {
        return setRoomManagerForm(_objectSpread(_objectSpread({}, roomManagerForm), {}, {
          pax: parseInt(e.target.value) || 0
        }));
      }
    })), !roomManagerForm.isService && /*#__PURE__*/React.createElement("div", {
      className: "w-16"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-center"
    }, "R\xE9gimen"), /*#__PURE__*/React.createElement("select", {
      className: "w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-1 text-center text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all appearance-none",
      value: roomManagerForm.regime,
      onChange: function onChange(e) {
        return setRoomManagerForm(_objectSpread(_objectSpread({}, roomManagerForm), {}, {
          regime: e.target.value
        }));
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "-"), /*#__PURE__*/React.createElement("option", null, "AD"), /*#__PURE__*/React.createElement("option", null, "MP"), /*#__PURE__*/React.createElement("option", null, "PC"), /*#__PURE__*/React.createElement("option", null, "SA"), /*#__PURE__*/React.createElement("option", null, "TI"))), /*#__PURE__*/React.createElement("div", {
      className: "w-24"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-right"
    }, roomManagerForm.isService ? "Precio/U" : "Precio/Hab"), /*#__PURE__*/React.createElement("div", {
      className: "relative"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "w-full h-9 bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-6 text-right text-xs font-black text-slate-800 outline-none focus:border-emerald-500 transition-all",
      value: roomManagerForm.price,
      onChange: function onChange(e) {
        return setRoomManagerForm(_objectSpread(_objectSpread({}, roomManagerForm), {}, {
          price: parseFloat(e.target.value) || 0
        }));
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "absolute right-2 top-2.5 text-[10px] text-slate-400 font-bold"
    }, "\u20AC"))), /*#__PURE__*/React.createElement("div", {
      className: "w-16"
    }, /*#__PURE__*/React.createElement("label", {
      className: "block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 text-center"
    }, "IVA"), /*#__PURE__*/React.createElement("select", {
      className: "w-full h-9 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold text-slate-600 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer",
      value: roomManagerForm.iva,
      onChange: function onChange(e) {
        return setRoomManagerForm(_objectSpread(_objectSpread({}, roomManagerForm), {}, {
          iva: parseInt(e.target.value) || 10
        }));
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "10"
    }, "10%"), /*#__PURE__*/React.createElement("option", {
      value: "21"
    }, "21%"))), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 flex justify-end gap-3 items-center"
    }, function () {
      var formLogo = "";
      var lowerFormHotel = (roomManagerForm.hotel || "").toLowerCase();
      if (lowerFormHotel.includes("guadiana")) formLogo = "Logos/Sercotel Guadiana.jpg";else if (lowerFormHotel.includes("cumbria")) formLogo = "Logos/Cumbria Spa&Hotel.jpg";
      if (formLogo) {
        return /*#__PURE__*/React.createElement("img", {
          src: formLogo,
          alt: "Hotel",
          className: "h-10 object-contain mix-blend-multiply opacity-90"
        });
      }
      return null;
    }(), /*#__PURE__*/React.createElement("button", {
      onClick: addRoomBlock,
      className: "h-9 px-6 ".concat(editingId ? "bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-200" : "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200", " text-white rounded-lg active:scale-95 transition-all flex items-center gap-2")
    }, editingId ? /*#__PURE__*/React.createElement(IconRefresh, {
      size: 14,
      stroke: 3
    }) : /*#__PURE__*/React.createElement("span", {
      className: "text-sm font-bold"
    }, "+"), /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-black uppercase tracking-wider"
    }, editingId ? "Actualizar" : "Añadir")), editingId && /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setEditingId(null);
        setRoomManagerForm(function (prev) {
          return _objectSpread(_objectSpread({}, prev), {}, {
            qty: 1,
            price: 0,
            isService: true
          });
        });
      },
      className: "h-9 px-3 bg-slate-100 text-slate-400 hover:text-rose-600 rounded-lg transition-colors flex items-center justify-center"
    }, /*#__PURE__*/React.createElement(IconX, {
      size: 16,
      stroke: 3
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm"
    }, /*#__PURE__*/React.createElement("table", {
      className: "w-full text-xs text-left border-collapse"
    }, /*#__PURE__*/React.createElement("thead", {
      className: "bg-slate-50 border-b border-slate-200"
    }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 w-8"
    }), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider"
    }, "Hotel"), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider"
    }, "Producto"), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider"
    }, "Fecha Cargo"), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-center"
    }, "Noches"), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-center"
    }, "Cant."), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-center"
    }, "Pax."), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-center"
    }, "R\xE9g."), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-right"
    }, "P. Unit"), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-center"
    }, "IVA"), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-right bg-blue-50/20"
    }, "Base Com."), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-center bg-blue-50/20"
    }, "%"), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-right bg-blue-50/20"
    }, "Comisi\xF3n \u20AC"), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 font-black text-slate-400 text-[9px] uppercase tracking-wider text-right bg-slate-100/50"
    }, "Total"), /*#__PURE__*/React.createElement("th", {
      className: "py-2.5 px-3 w-8"
    }))), /*#__PURE__*/React.createElement("tbody", {
      className: "divide-y divide-slate-100"
    }, JSON.parse(((_selectedGroupFicha$r38 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r38 === void 0 ? void 0 : _selectedGroupFicha$r38["RoomingList_JSON"]) || "[]").map(function (item, index) {
      var _selectedGroupFicha$r39, _selectedGroupFicha$r40, _item$comision, _item$comision2, _item$comision4, _item$comision5, _item$comision6, _item$comision7;
      return /*#__PURE__*/React.createElement("tr", {
        key: item.id,
        draggable: true,
        onDragStart: function onDragStart(e) {
          return e.dataTransfer.setData("idx", index);
        },
        onDragOver: function onDragOver(e) {
          return e.preventDefault();
        },
        onDrop: function onDrop(e) {
          return handleRoomManagerDrop(parseInt(e.dataTransfer.getData("idx")), index);
        },
        className: "hover:bg-blue-50/50 transition-colors group cursor-default"
      }, /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "text-slate-300 group-hover:text-slate-400 cursor-grab active:cursor-grabbing"
      }, /*#__PURE__*/React.createElement(IconGripVertical, {
        size: 14
      }))), /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-1"
      }, /*#__PURE__*/React.createElement(IconBuildingSkyscraper, {
        size: 10,
        className: "text-slate-400"
      }), /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-bold text-slate-500 uppercase"
      }, item.hotel && item.hotel !== "S/H" ? item.hotel : ((_selectedGroupFicha$r39 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r39 === void 0 ? void 0 : _selectedGroupFicha$r39["Hotel_Asignado"]) || ((_selectedGroupFicha$r40 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r40 === void 0 ? void 0 : _selectedGroupFicha$r40["Hotel"]) || "H. Pendiente"))), /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3"
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        className: "bg-transparent border-none font-bold text-slate-700 outline-none w-full uppercase text-[11px]",
        value: item.type,
        onChange: function onChange(e) {
          var _selectedGroupFicha$r41;
          var newType = e.target.value.toUpperCase();
          var newRL = JSON.parse(((_selectedGroupFicha$r41 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r41 === void 0 ? void 0 : _selectedGroupFicha$r41["RoomingList_JSON"]) || "[]");
          newRL[index].type = newType;
          newRL[index].pax = getPaxByRoomType(newType);
          var newTotalPax = newRL.reduce(function (acc, i) {
            return acc + parseInt(i.pax || 0) * parseInt(i.qty || 0);
          }, 0);
          updateGroupMetadata(selectedGroupFicha.name, {
            RoomingList_JSON: JSON.stringify(newRL),
            "Pax.": newTotalPax.toString()
          });
        }
      })), /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit"
      }, /*#__PURE__*/React.createElement("span", null, formatDate(item.dateIn)))), /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3 text-center"
      }, /*#__PURE__*/React.createElement("span", {
        className: "inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100"
      }, item.nights)), /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3 text-center font-bold text-slate-800"
      }, item.qty), /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3 text-center font-bold text-slate-400"
      }, item.pax || getPaxByRoomType(item.type)), /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3 text-center"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-bold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded"
      }, item.regime)), /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3 text-right font-medium text-slate-600"
      }, parseFloat(item.price).toFixed(2), " \u20AC"), /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3 text-center"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-black px-1.5 py-0.5 rounded ".concat(item.iva == 21 ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")
      }, item.iva || 10, "%")), /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3 text-right bg-blue-50/10 border-l border-blue-50"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center justify-end gap-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-bold text-slate-500"
      }, ((_item$comision = item.comision) !== null && _item$comision !== void 0 && _item$comision.base_unitaria ? item.comision.base_unitaria * item.qty * item.nights : ((_item$comision2 = item.comision) === null || _item$comision2 === void 0 ? void 0 : _item$comision2.base_calculada) || 0).toLocaleString("es-ES", {
        minimumFractionDigits: 2
      }), " ", "\u20AC"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          var _item$comision3;
          return setCommissionModal({
            isOpen: true,
            itemIdx: index,
            tempCom: (_item$comision3 = item.comision) !== null && _item$comision3 !== void 0 && _item$comision3.desglose ? JSON.parse(JSON.stringify(item.comision)) : calculateDefaultCommission(item.price, item.regime, item.qty, item.nights, item.type)
          });
        },
        className: "p-1 hover:bg-blue-100 text-blue-400 hover:text-blue-600 rounded transition-colors",
        title: "Configurar desglose de comisi\xF3n"
      }, /*#__PURE__*/React.createElement(IconSettings, {
        size: 12
      })))), /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3 text-center bg-blue-50/10"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-bold text-slate-600"
      }, ((_item$comision4 = item.comision) === null || _item$comision4 === void 0 ? void 0 : _item$comision4.porcentaje) || 10, "%")), /*#__PURE__*/React.createElement("td", {
        className: "py-2 px-3 text-right bg-blue-50/10 border-r border-blue-50"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[10px] font-black text-blue-700"
      }, ((_item$comision5 = item.comision) === null || _item$comision5 === void 0 ? void 0 : _item$comision5.total_comision) !== undefined ? item.comision.total_comision.toLocaleString("es-ES", {
        minimumFractionDigits: 2
      }) : ((((_item$comision6 = item.comision) === null || _item$comision6 === void 0 ? void 0 : _item$comision6.base_calculada) || 0) * (((_item$comision7 = item.comision) === null || _item$comision7 === void 0 ? void 0 : _item$comision7.porcentaje) || 10) / 100).toLocaleString("es-ES", {
        minimumFractionDigits: 2
      }), " ", "\u20AC")), /*#__PURE__*/React.createElement("td", {
        className: "py-1 px-2 text-right font-black text-emerald-600 bg-emerald-50/30"
      }, parseFloat(item.total).toLocaleString("es-ES", {
        minimumFractionDigits: 2
      }), " ", "\u20AC"), /*#__PURE__*/React.createElement("td", {
        className: "py-1 px-2 text-center flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return handleEditRoomBlock(item);
        },
        className: "p-1 hover:bg-amber-100 text-slate-300 hover:text-amber-500 rounded transition-colors",
        title: "Editar"
      }, /*#__PURE__*/React.createElement(IconEdit, {
        size: 14
      })), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return removeRoomBlock(item.id);
        },
        className: "p-1 hover:bg-rose-100 text-slate-300 hover:text-rose-500 rounded transition-colors",
        title: "Eliminar"
      }, /*#__PURE__*/React.createElement(IconTrash, {
        size: 14
      }))));
    }), JSON.parse(((_selectedGroupFicha$r42 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r42 === void 0 ? void 0 : _selectedGroupFicha$r42["RoomingList_JSON"]) || "[]").length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
      colSpan: "8",
      className: "py-8 text-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col items-center justify-center text-slate-300"
    }, /*#__PURE__*/React.createElement(IconBed, {
      size: 32,
      stroke: 1,
      className: "mb-2 opacity-50"
    }), /*#__PURE__*/React.createElement("p", {
      className: "text-xs font-medium italic"
    }, "No hay habitaciones asignadas."), /*#__PURE__*/React.createElement("p", {
      className: "text-[10px]"
    }, "Usa el formulario superior para a\xF1adir inventario.")))))))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 lg:grid-cols-12 gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
    }, function (_selectedGroupFicha$r43) {
      if (!(selectedGroupFicha !== null && selectedGroupFicha !== void 0 && selectedGroupFicha.records)) return null;
      var uniqueHotels = Array.from(new Set(selectedGroupFicha.records.map(function (r) {
        return normalizeHotelName(r["Hotel_Asignado"] || r["Hotel"] || "Desconocido");
      }).filter(function (h) {
        return h && h !== "-" && h !== "DESCONOCIDO";
      })));
      if (uniqueHotels.length === 0) uniqueHotels.push("GENERAL");
      var roomingList = JSON.parse(((_selectedGroupFicha$r43 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r43 === void 0 ? void 0 : _selectedGroupFicha$r43["RoomingList_JSON"]) || "[]");
      return /*#__PURE__*/React.createElement("div", {
        className: "flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[400px] custom-scrollbar"
      }, uniqueHotels.map(function (hotelName) {
        var _selectedGroupFicha$r44;
        var hotelRoomingItems = roomingList.filter(function (i) {
          var normH = normalizeHotelName(i.hotel);
          return normH === hotelName || hotelName === "GENERAL" && !normH;
        });
        var hotelTotal = hotelRoomingItems.reduce(function (acc, i) {
          var _i$comision6;
          return acc + (parseFloat(i.total) || 0) - (parseFloat((_i$comision6 = i.comision) === null || _i$comision6 === void 0 ? void 0 : _i$comision6.total_comision) || 0);
        }, 0) || parseFloat(((_selectedGroupFicha$r44 = selectedGroupFicha.records.find(function (r) {
          return normalizeHotelName(r["Hotel_Asignado"] || r["Hotel"]) === hotelName;
        })) === null || _selectedGroupFicha$r44 === void 0 ? void 0 : _selectedGroupFicha$r44["Importe(*)"]) || 0);
        var hotelRecord = selectedGroupFicha.records.find(function (r) {
          return normalizeHotelName(r["Hotel_Asignado"] || r["Hotel"] || "Desconocido") === hotelName;
        }) || selectedGroupFicha.records[0];
        var plan = [];
        try {
          plan = JSON.parse(hotelRecord.PaymentPlan_JSON || "[]");
        } catch (e) {
          plan = [];
        }
        var totalPercent = plan.reduce(function (acc, p) {
          return acc + (parseFloat(p.percent) || 0);
        }, 0);
        var arrivalDate = hotelRecord["Entrada"];
        var updatePlanLocally = function updatePlanLocally(newPlan) {
          setSelectedGroupFicha(function (prev) {
            if (!prev || normalizeId(prev.id) !== normalizeId(selectedGroupFicha.id)) return prev;
            var updatedRecords = prev.records.map(function (r) {
              if (normalizeHotelName(r["Hotel_Asignado"] || r["Hotel"] || "Desconocido") === hotelName) {
                return _objectSpread(_objectSpread({}, r), {}, {
                  PaymentPlan_JSON: JSON.stringify(newPlan)
                });
              }
              return r;
            });
            return _objectSpread(_objectSpread({}, prev), {}, {
              records: updatedRecords
            });
          });
        };
        var handlePlanChange = function handlePlanChange(idx, field, val, isLocalOnly) {
          var newPlan = _toConsumableArray(plan);
          newPlan[idx] = _objectSpread(_objectSpread({}, newPlan[idx]), {}, _defineProperty({}, field, val));
          if (field === "percent" || field === "releaseDays") {
            var pct = parseFloat(newPlan[idx].percent) || 0;
            var days = parseInt(newPlan[idx].releaseDays) || 0;
            newPlan[idx].amount = (hotelTotal * (pct / 100)).toFixed(2);
            var _d6;
            var sDate = arrivalDate;
            var numDate = parseFloat(sDate);
            if (!isNaN(numDate) && numDate > 40000 && numDate < 60000) {
              _d6 = new Date(Math.round((numDate - 25569) * 86400 * 1000));
            } else {
              var dateStr = toInputDate(sDate);
              _d6 = new Date(dateStr);
            }
            _d6.setDate(_d6.getDate() - days);
            newPlan[idx].date = _d6.toISOString().split("T")[0];
          }
          if (field === "amount") {
            var amt = parseFloat(val) || 0;
            newPlan[idx].percent = (amt / (hotelTotal || 1) * 100).toFixed(1);
          }
          if (field === "date") {
            var _arrival = toInputDate(arrivalDate);
            var manual = toInputDate(val);
            if (_arrival && manual) {
              var dArr = new Date(_arrival);
              var dMan = new Date(manual);
              var _diff2 = Math.round((dArr - dMan) / (1000 * 60 * 60 * 24));
              newPlan[idx].releaseDays = _diff2;
            }
          }
          if (isLocalOnly) {
            updatePlanLocally(newPlan);
          } else {
            updatePaymentPlan(selectedGroupFicha.id, hotelName, newPlan);
          }
        };
        var addPlanRow = function addPlanRow() {
          var remaining = Math.max(0, 100 - totalPercent);
          var d;
          var sDate = arrivalDate;
          var numDate = parseFloat(sDate);
          if (!isNaN(numDate) && numDate > 40000 && numDate < 60000) {
            d = new Date(Math.round((numDate - 25569) * 86400 * 1000));
          } else {
            var dateStr = toInputDate(sDate);
            d = new Date(dateStr);
          }
          var days = 30;
          d.setDate(d.getDate() - days);
          var newRow = {
            id: Date.now(),
            label: remaining === 100 ? "Pago Único" : plan.length === 0 ? "Primer Pago" : "Pago Final",
            percent: remaining,
            amount: (hotelTotal * (remaining / 100)).toFixed(2),
            releaseDays: days,
            date: d.toISOString().split("T")[0],
            status: "Pendiente",
            Enlace_TPV: ""
          };
          updatePaymentPlan(selectedGroupFicha.id, hotelName, [].concat(_toConsumableArray(plan), [newRow]));
        };
        var removePlanRow = function removePlanRow(idx) {
          updatePaymentPlan(selectedGroupFicha.id, hotelName, plan.filter(function (_, i) {
            return i !== idx;
          }));
        };
        return /*#__PURE__*/React.createElement("div", {
          key: hotelName,
          className: "p-2 bg-slate-50/20"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex justify-between items-center mb-1.5 px-1 bg-white p-1 rounded border border-slate-100 shadow-sm"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex items-center gap-2"
        }, /*#__PURE__*/React.createElement("div", {
          className: "bg-emerald-600 p-0.5 rounded text-white"
        }, /*#__PURE__*/React.createElement(IconPieChart, {
          size: 10
        })), /*#__PURE__*/React.createElement("span", {
          className: "text-[10px] font-black text-slate-700 uppercase"
        }, hotelName), /*#__PURE__*/React.createElement("span", {
          className: "text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded"
        }, hotelTotal.toLocaleString("es-ES", {
          style: "currency",
          currency: "EUR"
        }))), /*#__PURE__*/React.createElement("div", {
          className: "flex bg-slate-100 rounded p-0.5 gap-0.5"
        }, ["30/70", "50/50", "100"].map(function (p) {
          return /*#__PURE__*/React.createElement("button", {
            key: p,
            onClick: function onClick() {
              return calculateDeposits(selectedGroupFicha, p === "30/70" ? [30, 70] : p === "50/50" ? [50, 50] : [100], hotelName);
            },
            className: "px-1.5 py-0.5 text-[8px] font-black text-slate-500 hover:bg-white hover:text-emerald-500 rounded transition-all"
          }, p);
        }))), /*#__PURE__*/React.createElement("div", {
          className: "space-y-1.5"
        }, /*#__PURE__*/React.createElement("div", {
          className: "grid grid-cols-[25px_45px_1fr_55px_85px_60px_25px] gap-1 px-1 mb-1 text-[8px] font-black text-slate-400 uppercase tracking-tighter"
        }, /*#__PURE__*/React.createElement("div", null), /*#__PURE__*/React.createElement("div", {
          className: "text-center"
        }, "%"), /*#__PURE__*/React.createElement("div", {
          className: "text-right pr-2"
        }, "Importe"), /*#__PURE__*/React.createElement("div", {
          className: "text-center"
        }, "Release"), /*#__PURE__*/React.createElement("div", {
          className: "text-center"
        }, "Fecha"), /*#__PURE__*/React.createElement("div", {
          className: "text-center"
        }, "Estado"), /*#__PURE__*/React.createElement("div", null)), function () {
          var lastUnpaidIdx = -1;
          for (var i = plan.length - 1; i >= 0; i--) {
            if (plan[i].status !== "Cobrado") {
              lastUnpaidIdx = i;
              break;
            }
          }
          return plan.map(function (dep, idx) {
            var isPaid = dep.status === "Cobrado";
            var today = new Date();
            today.setHours(0, 0, 0, 0);
            var depDate = new Date(toInputDate(dep.date));
            depDate.setHours(0, 0, 0, 0);
            var isWarning = !isPaid && Math.ceil((depDate - today) / (1000 * 60 * 60 * 24)) <= 2;
            var isLastUnpaid = idx === lastUnpaidIdx;
            return /*#__PURE__*/React.createElement("div", {
              key: dep.id,
              className: "grid grid-cols-[25px_45px_1fr_55px_85px_60px_25px] items-center gap-1 p-1 rounded border ".concat(isPaid ? "bg-emerald-50/40 border-emerald-100/50" : isWarning ? "bg-rose-50 border-rose-200 animate-pulse" : "bg-white border-slate-100", " hover:border-slate-300 transition-all group shadow-sm pl-1")
            }, /*#__PURE__*/React.createElement("div", {
              className: "flex justify-center"
            }, isWarning ? /*#__PURE__*/React.createElement(IconAlertTriangle, {
              size: 10,
              className: "text-rose-500"
            }) : /*#__PURE__*/React.createElement("div", {
              className: "w-1.5 h-1.5 rounded-full ".concat(isPaid ? "bg-emerald-500" : "bg-slate-300")
            })), /*#__PURE__*/React.createElement("div", {
              className: "flex items-center gap-0.5 justify-center bg-slate-50 rounded px-1 min-w-[40px] h-5 border border-slate-100"
            }, /*#__PURE__*/React.createElement("input", {
              type: "number",
              className: "bg-transparent border-none text-[10px] font-black text-slate-600 w-8 text-right outline-none",
              value: dep.percent,
              onChange: function onChange(e) {
                return handlePlanChange(idx, "percent", e.target.value, true);
              },
              onBlur: function onBlur(e) {
                return handlePlanChange(idx, "percent", e.target.value);
              }
            }), /*#__PURE__*/React.createElement("span", {
              className: "text-[8px] font-black text-slate-400 ml-0.5"
            }, "%")), /*#__PURE__*/React.createElement("div", {
              className: "text-right pr-2"
            }, /*#__PURE__*/React.createElement("div", {
              className: "flex items-center justify-end bg-slate-50/50 rounded px-1 h-6 border border-slate-100"
            }, /*#__PURE__*/React.createElement("input", {
              type: "number",
              step: "0.01",
              className: "bg-transparent border-none text-[11px] font-black text-right outline-none w-full ".concat(isPaid ? "text-emerald-700" : isWarning ? "text-rose-700" : "text-slate-700"),
              value: dep.amount,
              onChange: function onChange(e) {
                return handlePlanChange(idx, "amount", e.target.value, true);
              },
              onBlur: function onBlur(e) {
                return handlePlanChange(idx, "amount", e.target.value);
              }
            }), /*#__PURE__*/React.createElement("span", {
              className: "text-[9px] font-black text-slate-400 ml-0.5"
            }, "\u20AC"))), /*#__PURE__*/React.createElement("div", {
              className: "flex items-center justify-center bg-blue-50 shadow-inner rounded px-1 min-w-[50px] h-6 border border-blue-100 mx-auto"
            }, /*#__PURE__*/React.createElement("input", {
              type: "number",
              className: "bg-transparent border-none text-[11px] font-black text-blue-700 w-9 text-center outline-none",
              value: dep.releaseDays,
              onChange: function onChange(e) {
                return handlePlanChange(idx, "releaseDays", e.target.value, true);
              },
              onBlur: function onBlur(e) {
                return handlePlanChange(idx, "releaseDays", e.target.value);
              }
            }), /*#__PURE__*/React.createElement("span", {
              className: "text-[8px] font-black text-blue-400 ml-0.5 transition-colors"
            }, "D")), /*#__PURE__*/React.createElement("div", {
              className: "text-[10px] font-bold tabular-nums text-center ".concat(isWarning ? "text-rose-600 font-black" : "text-slate-500")
            }, /*#__PURE__*/React.createElement("input", {
              type: "date",
              className: "bg-transparent border-none text-[10px] font-black text-slate-500 w-full text-center outline-none",
              value: toInputDate(dep.date),
              onChange: function onChange(e) {
                return handlePlanChange(idx, "date", e.target.value, true);
              },
              onBlur: function onBlur(e) {
                return handlePlanChange(idx, "date", e.target.value);
              }
            })), /*#__PURE__*/React.createElement("button", {
              onClick: function onClick() {
                return handlePlanChange(idx, "status", isPaid ? "Pendiente" : "Cobrado");
              },
              className: "h-5 w-full rounded text-[9px] font-black transition-all ".concat(isPaid ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200" : "bg-slate-100 text-slate-400")
            }, isPaid ? /*#__PURE__*/React.createElement(IconCheck, {
              size: 10,
              stroke: 4,
              className: "mx-auto"
            }) : "PND"), /*#__PURE__*/React.createElement("button", {
              onClick: function onClick() {
                return removePlanRow(idx);
              },
              className: "opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity flex justify-center"
            }, /*#__PURE__*/React.createElement(IconTrash, {
              size: 12
            })));
          });
        }(), totalPercent < 100 && /*#__PURE__*/React.createElement("button", {
          onClick: addPlanRow,
          className: "w-full py-2 border border-dashed border-slate-200 rounded text-slate-400 hover:border-slate-400 hover:text-slate-500 transition-all text-[9px] font-black uppercase flex items-center justify-center gap-2 bg-white"
        }, /*#__PURE__*/React.createElement(IconPlus, {
          size: 12
        }), " A\xF1adir Tramo (", 100 - totalPercent, "%)")));
      }));
    }()), /*#__PURE__*/React.createElement("div", {
      className: "lg:col-span-8 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full relative overflow-hidden"
    }, /*#__PURE__*/React.createElement("div", {
      className: "absolute top-0 right-0 p-2 opacity-5"
    }, /*#__PURE__*/React.createElement(IconFile, {
      size: 60
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col gap-3 mb-2 z-10 w-full"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 w-full"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-amber-100 p-1 rounded text-amber-600"
    }, /*#__PURE__*/React.createElement(IconEdit, {
      size: 14
    })), /*#__PURE__*/React.createElement("h4", {
      className: "text-[10px] font-black text-slate-700 uppercase tracking-widest"
    }, "Notas de Control"), function (_selectedGroupFicha$r45) {
      var specificLink = (_selectedGroupFicha$r45 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r45 === void 0 ? void 0 : _selectedGroupFicha$r45["Enlace_TPV"];
      return /*#__PURE__*/React.createElement("div", {
        className: "ml-auto flex items-center gap-2"
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        placeholder: "Pegue aqu\xED el enlace de pasarela...",
        className: "bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[9px] w-64 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-600 transition-colors",
        defaultValue: specificLink || "",
        onBlur: function onBlur(e) {
          return updateGroupMetadata(selectedGroupFicha.id, "Enlace_TPV", e.target.value);
        }
      }), specificLink ? /*#__PURE__*/React.createElement("a", {
        href: specificLink,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[9px] font-black uppercase tracking-wider transition-all shadow-sm shadow-emerald-200"
      }, /*#__PURE__*/React.createElement(IconCreditCard, {
        size: 12,
        stroke: 3
      }), "Pasarela") : /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-wider opacity-50"
      }, /*#__PURE__*/React.createElement(IconCreditCard, {
        size: 12,
        stroke: 3
      }), "Sin Enlace TPV"));
    }()), function () {
      var record = selectedGroupFicha.records[0] || {};
      var status = (record["Estado"] || "").toUpperCase();
      var isInactive = ["ANULADA", "CANCELADA", "GASTOS DE ANULACION", "BAJA"].includes(status);
      if (isInactive) return null;
      var hasRooming = record["Logistica_Rooming"] === true;
      var hasMP = record["Logistica_MenuMP"] === true;
      var hasPC = record["Logistica_MenuPC"] === true;
      var regimen = (record["Régimen"] || "").toUpperCase();
      var needsMP = regimen.includes("MP");
      var needsPC = regimen.includes("PC");
      var daysToArrival = 999;
      if (record["Entrada"]) {
        // Asumiendo formato YYYY-MM-DD

        var arrDateStr = String(record["Entrada"]);
        var arrDate = new Date(arrDateStr.includes('T') ? arrDateStr : arrDateStr + 'T12:00:00');
        if (!isNaN(arrDate)) {
          daysToArrival = Math.ceil((arrDate - new Date()) / (1000 * 60 * 60 * 24));
        }
      }
      var isClose = daysToArrival <= 15 && daysToArrival >= 0;

      // Para MP y PC, si no dice explícitamente que NO lo necesita y no está checkeado, es falta (solo si el régimen lo pide o si falta rooming que es obligatorio siempre)

      var missingCritical = !hasRooming || needsMP && !hasMP || needsPC && !hasPC;
      var showWarning = isClose && missingCritical;
      var missingList = [!hasRooming && "Rooming List", needsMP && !hasMP && "Menú MP", needsPC && !hasPC && "Menú PC"].filter(Boolean).join(", ");
      return /*#__PURE__*/React.createElement("div", {
        className: "flex flex-col gap-2 w-full"
      }, showWarning && /*#__PURE__*/React.createElement("div", {
        className: "bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm animate-pulse-slow"
      }, /*#__PURE__*/React.createElement(IconAlertTriangle, {
        size: 14,
        className: "text-rose-500 shrink-0",
        stroke: 3
      }), /*#__PURE__*/React.createElement("span", null, "ALERTA LOG\xCDSTICA: Llegada en ", daysToArrival, " d\xEDas. Faltan datos operativos (", missingList, ").")), /*#__PURE__*/React.createElement("div", {
        className: "flex flex-wrap items-center gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-bold text-slate-400 uppercase tracking-wider mr-1"
      }, "Comprobaci\xF3n:"), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return updateGroupMetadata(selectedGroupFicha.id, "Logistica_Rooming", !hasRooming);
        },
        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ".concat(hasRooming ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100')
      }, hasRooming ? /*#__PURE__*/React.createElement(IconCheckCircle, {
        size: 12,
        stroke: 3
      }) : /*#__PURE__*/React.createElement(IconCircle, {
        size: 12,
        stroke: 2
      }), "Rooming List"), needsMP && /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return updateGroupMetadata(selectedGroupFicha.id, "Logistica_MenuMP", !hasMP);
        },
        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ".concat(hasMP ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100')
      }, hasMP ? /*#__PURE__*/React.createElement(IconCheckCircle, {
        size: 12,
        stroke: 3
      }) : /*#__PURE__*/React.createElement(IconCircle, {
        size: 12,
        stroke: 2
      }), "Men\xFA MP"), needsPC && /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          return updateGroupMetadata(selectedGroupFicha.id, "Logistica_MenuPC", !hasPC);
        },
        className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all border ".concat(hasPC ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100')
      }, hasPC ? /*#__PURE__*/React.createElement(IconCheckCircle, {
        size: 12,
        stroke: 3
      }) : /*#__PURE__*/React.createElement(IconCircle, {
        size: 12,
        stroke: 2
      }), "Men\xFA PC")));
    }()), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 z-10"
    }, /*#__PURE__*/React.createElement("textarea", {
      id: "notas-control-textarea",
      className: "w-full h-full bg-amber-50/50 border border-amber-100 rounded-lg p-2 text-[10px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none leading-relaxed placeholder-amber-300",
      placeholder: "Escribe aqu\xED notas operativas, recordatorios o detalles importantes del grupo...",
      defaultValue: ((_selectedGroupFicha$r46 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r46 === void 0 ? void 0 : _selectedGroupFicha$r46["Com_Notas"]) || "",
      onBlur: function onBlur(e) {
        return updateGroupMetadata(selectedGroupFicha.id, "Com_Notas", e.target.value);
      }
    })))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
    }, /*#__PURE__*/React.createElement("table", {
      className: "w-full text-[9px] leading-tight"
    }, /*#__PURE__*/React.createElement("thead", {
      className: "bg-[#0f172a] text-white font-black uppercase"
    }, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      className: "px-3 py-1.5 text-left"
    }, "Reserva"), /*#__PURE__*/React.createElement("th", {
      className: "px-3 py-1.5 text-left"
    }, "Hotel"), /*#__PURE__*/React.createElement("th", {
      className: "px-3 py-1.5 text-left"
    }, "Periodo"), /*#__PURE__*/React.createElement("th", {
      className: "px-3 py-1.5 text-right"
    }, "Cantidad"), /*#__PURE__*/React.createElement("th", {
      className: "px-3 py-1.5 text-right"
    }, "Importe"), /*#__PURE__*/React.createElement("th", {
      className: "px-3 py-1.5 text-center"
    }, "Estado"))), /*#__PURE__*/React.createElement("tbody", {
      className: "divide-y divide-slate-100"
    }, (selectedGroupFicha.records || []).map(function (rec, idx) {
      var _rec$Estado;
      return /*#__PURE__*/React.createElement("tr", {
        key: idx,
        className: "hover:bg-slate-50 transition-colors"
      }, /*#__PURE__*/React.createElement("td", {
        className: "px-3 py-1.5 font-bold text-slate-900"
      }, rec["Reserva"]), /*#__PURE__*/React.createElement("td", {
        className: "px-3 py-1.5 font-bold text-slate-500"
      }, rec["Hotel_Asignado"] || rec["Hotel"] || "-"), /*#__PURE__*/React.createElement("td", {
        className: "px-3 py-1.5 text-slate-600"
      }, formatDate(rec["Entrada"]), " -", " ", formatDate(rec["Salida"])), /*#__PURE__*/React.createElement("td", {
        className: "px-3 py-1.5 text-right font-bold"
      }, rec["Hab."] || "-"), /*#__PURE__*/React.createElement("td", {
        className: "px-3 py-1.5 text-right font-black text-emerald-600"
      }, parseNum(rec["Importe(*)"]).toLocaleString("es-ES", {
        minimumFractionDigits: 2
      }), " ", "\u20AC"), /*#__PURE__*/React.createElement("td", {
        className: "px-3 py-1.5 text-center"
      }, /*#__PURE__*/React.createElement("span", {
        className: "px-2 py-0.5 rounded text-[7px] font-black uppercase ".concat((_rec$Estado = rec["Estado"]) !== null && _rec$Estado !== void 0 && _rec$Estado.toLowerCase().includes("conf") ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")
      }, rec["Estado"] || "???")));
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "p-4 bg-white border-t border-slate-200 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)] shrink-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return handleProformaClick(selectedGroupFicha);
      },
      className: "px-6 h-11 bg-slate-900 hover:bg-black text-white rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-200"
    }, /*#__PURE__*/React.createElement(IconFileInvoice, {
      size: 18,
      stroke: 2
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] font-black uppercase tracking-widest"
    }, "Generar Proforma")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        localStorage.setItem("selectedGroup", JSON.stringify(selectedGroupFicha));
        window.location.href = "Orden Servicio.html";
      },
      className: "px-6 h-11 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-amber-200/50"
    }, /*#__PURE__*/React.createElement(IconUtensils, {
      size: 18,
      stroke: 2
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] font-black uppercase tracking-widest"
    }, "Orden Servicio")), /*#__PURE__*/React.createElement("button", {
      onClick: openClientDataModal,
      className: "px-4 h-11 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl flex items-center justify-center transition-all",
      title: "Configuraci\xF3n de Factura"
    }, /*#__PURE__*/React.createElement(IconSettings, {
      size: 18
    })), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setShowCrmPanel(function (p) {
          return !p;
        });
      },
      className: "px-4 h-11 rounded-2xl flex items-center justify-center transition-all ".concat(showCrmPanel ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-500'),
      title: "Historial / CRM"
    }, /*#__PURE__*/React.createElement(IconMessage, {
      size: 18
    }))), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-3"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setShowFichaModal(false);
      },
      className: "px-6 h-11 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all tracking-widest"
    }, "Cerrar Ficha"), /*#__PURE__*/React.createElement("button", {
      onClick: /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0() {
        return _regenerator().w(function (_context0) {
          while (1) switch (_context0.n) {
            case 0:
              // La mayoría de los campos ya se autoguardan,

              // pero forzamos un feedback visual y aseguramos persistencia del RoomingList

              alert("✅ Cambios registrados y sincronizados con éxito.");
              setShowFichaModal(false);
            case 1:
              return _context0.a(2);
          }
        }, _callee0);
      })),
      className: "px-10 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-200"
    }, /*#__PURE__*/React.createElement(IconSave, {
      size: 18,
      stroke: 2.5
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-[11px] font-black uppercase tracking-widest"
    }, "Grabar Cambios")))), showCrmPanel && /*#__PURE__*/React.createElement("div", {
      className: "absolute top-0 right-0 w-80 h-full bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col animate-slide-left"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-4 bg-indigo-600 text-white flex justify-between items-center shrink-0"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement(IconMessage, {
      size: 18
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-black uppercase tracking-widest"
    }, "Historial / CRM")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setShowCrmPanel(false);
      },
      className: "hover:bg-indigo-700 p-1 rounded-lg"
    }, /*#__PURE__*/React.createElement(IconX, {
      size: 18
    }))), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50"
    }, crmHistory.length === 0 ? /*#__PURE__*/React.createElement("div", {
      className: "text-center py-10 opacity-40"
    }, /*#__PURE__*/React.createElement(IconMessage, {
      size: 32,
      className: "mx-auto mb-2"
    }), /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] font-bold uppercase"
    }, "Sin notas de seguimiento")) : crmHistory.map(function (h, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        className: "bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-center"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[8px] font-black text-indigo-500 uppercase"
      }, h.date)), /*#__PURE__*/React.createElement("p", {
        className: "text-xs text-slate-700 leading-relaxed"
      }, h.text));
    })), /*#__PURE__*/React.createElement("div", {
      className: "p-4 bg-white border-t border-slate-200 space-y-3"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none",
      placeholder: "A\xF1adir nota de seguimiento...",
      value: crmNote,
      onChange: function onChange(e) {
        return setCrmNote(e.target.value);
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: addCrmNote,
      disabled: !crmNote.trim(),
      className: "w-full h-10 bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
    }, "Guardar Nota"))));
  }())), commissionModal.isOpen && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center z-[110] animate-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-xl shadow-2xl w-[90vw] max-w-[340px] border border-slate-200 overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#0f172a] px-4 py-3 flex justify-between items-center text-white"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-blue-500/20 p-1.5 rounded-lg border border-blue-500/30"
  }, /*#__PURE__*/React.createElement(IconSettings, {
    size: 14,
    className: "text-blue-400"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-black uppercase text-[10px] tracking-widest text-white leading-none"
  }, "C\xE1lculo de Comisi\xF3n"), /*#__PURE__*/React.createElement("p", {
    className: "text-[7px] font-bold text-slate-400 uppercase mt-0.5 tracking-tighter"
  }, "Desglose por Conceptos Unitarios"))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setCommissionModal({
        isOpen: false,
        itemIdx: null,
        tempCom: null
      });
    },
    className: "w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all"
  }, /*#__PURE__*/React.createElement(IconX, {
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-4 space-y-5 text-left bg-slate-50/30"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-3 gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black"
  }, "\u20AC")), /*#__PURE__*/React.createElement("div", {
    className: "min-w-0"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-[7px] font-black text-slate-400 uppercase tracking-widest truncate"
  }, "Precio Unit."), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-black text-slate-700"
  }, parseFloat(JSON.parse(((_selectedGroupFicha$r47 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r47 === void 0 ? void 0 : _selectedGroupFicha$r47["RoomingList_JSON"]) || "[]")[commissionModal.itemIdx].price).toFixed(2), " ", "\u20AC"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"
  }, /*#__PURE__*/React.createElement(IconUsers, {
    size: 12
  })), /*#__PURE__*/React.createElement("div", {
    className: "min-w-0"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-[7px] font-black text-slate-400 uppercase tracking-widest truncate"
  }, "Pax/Hab."), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-black text-slate-500"
  }, getPaxByRoomType(JSON.parse(((_selectedGroupFicha$r48 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r48 === void 0 ? void 0 : _selectedGroupFicha$r48["RoomingList_JSON"]) || "[]")[commissionModal.itemIdx].type), " ", "pax"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"
  }, /*#__PURE__*/React.createElement(IconUtensils, {
    size: 12
  })), /*#__PURE__*/React.createElement("div", {
    className: "min-w-0"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-[7px] font-black text-slate-400 uppercase tracking-widest truncate"
  }, "R\xE9gimen"), /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-black text-slate-500"
  }, JSON.parse(((_selectedGroupFicha$r49 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r49 === void 0 ? void 0 : _selectedGroupFicha$r49["RoomingList_JSON"]) || "[]")[commissionModal.itemIdx].regime || "HD")))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-[1fr_100px] gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[8px] font-black text-slate-500 uppercase mb-1.5 ml-1 tracking-widest"
  }, "Porcentaje Comisionable"), /*#__PURE__*/React.createElement("div", {
    className: "relative group"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "w-full h-10 bg-white border border-slate-200 rounded-xl px-3 text-sm font-black text-blue-600 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm",
    value: commissionModal.tempCom.porcentaje,
    onChange: function onChange(e) {
      return setCommissionModal(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          tempCom: _objectSpread(_objectSpread({}, prev.tempCom), {}, {
            porcentaje: parseFloat(e.target.value) || 0
          })
        });
      });
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "absolute right-3 top-2.5 text-xs text-slate-300 font-black"
  }, "%"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[8px] font-black text-slate-500 uppercase mb-1.5 ml-1 tracking-widest"
  }, "Procedencia"), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("select", {
    className: "w-full h-10 bg-white border border-slate-200 rounded-xl px-2 text-[10px] font-black text-slate-600 outline-none appearance-none hover:border-slate-300 transition-all shadow-sm cursor-pointer",
    value: commissionModal.tempCom.modo,
    onChange: function onChange(e) {
      return setCommissionModal(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          tempCom: _objectSpread(_objectSpread({}, prev.tempCom), {}, {
            modo: e.target.value
          })
        });
      });
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "auto"
  }, "\uD83D\uDCB0 AUTO"), /*#__PURE__*/React.createElement("option", {
    value: "manual"
  }, "\u270D\uFE0F MANUAL")), /*#__PURE__*/React.createElement(IconChevronDown, {
    size: 14,
    className: "absolute right-2 top-3 text-slate-300 pointer-events-none"
  })))), commissionModal.tempCom.modo === "auto" ? /*#__PURE__*/React.createElement("div", {
    className: "space-y-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center px-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "block text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]"
  }, "Desglose del Precio"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-1.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[7px] font-bold text-slate-400 uppercase"
  }, "Comisionable"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 gap-2"
  }, Object.entries(commissionModal.tempCom.desglose || {}).map(function (_ref21) {
    var _ref22 = _slicedToArray(_ref21, 2),
      key = _ref22[0],
      data = _ref22[1];
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      className: "flex items-center gap-2 p-1.5 rounded-xl border transition-all ".concat(data.comisionable ? "bg-white border-blue-100 shadow-sm" : "bg-slate-50 border-slate-100 opacity-60")
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex-1 flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-1 rounded-md ".concat(data.comisionable ? "bg-blue-50 text-blue-500" : "bg-slate-200 text-slate-400")
    }, /*#__PURE__*/React.createElement(IconCircle, {
      size: 8,
      fill: "currentColor"
    })), /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-black text-slate-600 uppercase w-20 truncate"
    }, key), /*#__PURE__*/React.createElement("div", {
      className: "relative flex-1"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      className: "w-full h-7 bg-transparent border-none rounded text-xs font-black px-1 outline-none text-right pr-4",
      value: data.valor,
      onChange: function onChange(e) {
        var val = parseFloat(e.target.value) || 0;
        var newDesglose = _objectSpread(_objectSpread({}, commissionModal.tempCom.desglose), {}, _defineProperty({}, key, _objectSpread(_objectSpread({}, data), {}, {
          valor: val
        })));
        if (key !== "Alojamiento") {
          var _selectedGroupFicha$r50;
          var item = JSON.parse(((_selectedGroupFicha$r50 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r50 === void 0 ? void 0 : _selectedGroupFicha$r50["RoomingList_JSON"]) || "[]")[commissionModal.itemIdx];
          var paxPerRoom = getPaxByRoomType(item.type);
          var unitPrice = parseFloat(item.price) || 0;
          var des = key === "Desayuno" ? val : newDesglose.Desayuno.valor;
          var alm = key === "Almuerzo" ? val : newDesglose.Almuerzo.valor;
          var cen = key === "Cena" ? val : newDesglose.Cena.valor;
          newDesglose.Alojamiento.valor = Math.max(0, unitPrice - (des + alm + cen) * paxPerRoom);
        }
        setCommissionModal(function (prev) {
          return _objectSpread(_objectSpread({}, prev), {}, {
            tempCom: _objectSpread(_objectSpread({}, prev.tempCom), {}, {
              desglose: newDesglose
            })
          });
        });
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "absolute right-0 top-1.5 text-[9px] text-slate-300 font-bold"
    }, "\u20AC"))), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick(e) {
        e.preventDefault();
        var newDesglose = _objectSpread(_objectSpread({}, commissionModal.tempCom.desglose), {}, _defineProperty({}, key, _objectSpread(_objectSpread({}, data), {}, {
          comisionable: !data.comisionable
        })));
        setCommissionModal(function (prev) {
          return _objectSpread(_objectSpread({}, prev), {}, {
            tempCom: _objectSpread(_objectSpread({}, prev.tempCom), {}, {
              desglose: newDesglose
            })
          });
        });
      },
      className: "w-7 h-7 rounded-lg flex items-center justify-center border transition-all ".concat(data.comisionable ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white border-slate-200 text-slate-200 hover:border-slate-300"),
      title: "\xBFEs Comisionable?"
    }, data.comisionable ? /*#__PURE__*/React.createElement(IconCheck, {
      size: 14,
      stroke: 4
    }) : /*#__PURE__*/React.createElement("div", {
      className: "w-1.5 h-1.5 rounded-full bg-slate-200"
    })));
  })), function (_selectedGroupFicha$r51) {
    var sum = Object.values(commissionModal.tempCom.desglose || {}).reduce(function (acc, c) {
      return acc + c.valor;
    }, 0);
    var unitPrice = parseFloat(JSON.parse(((_selectedGroupFicha$r51 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r51 === void 0 ? void 0 : _selectedGroupFicha$r51["RoomingList_JSON"]) || "[]")[commissionModal.itemIdx].price);
    var diff = Math.abs(sum - unitPrice);
    if (diff > 0.01) {
      return /*#__PURE__*/React.createElement("div", {
        className: "bg-red-50 text-red-500 p-1.5 rounded text-[8px] font-bold flex items-center gap-1.5 animate-pulse"
      }, /*#__PURE__*/React.createElement(IconAlertTriangle, {
        size: 10
      }), /*#__PURE__*/React.createElement("span", null, "LA SUMA (", sum.toFixed(2), "\u20AC) NO COINCIDE CON EL PRECIO UNITARIO (", unitPrice.toFixed(2), "\u20AC)"));
    }
    return null;
  }()) : /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "block text-[8px] font-black text-slate-400 uppercase mb-0.5 ml-1"
  }, "Base Comisi\xF3n Unitaria (\u20AC)"), /*#__PURE__*/React.createElement("div", {
    className: "relative"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    className: "w-full h-8 bg-emerald-50 border border-emerald-100 rounded-lg px-2 text-[11px] font-black text-emerald-700 outline-none",
    value: commissionModal.tempCom.base_unitaria,
    onChange: function onChange(e) {
      return setCommissionModal(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, {
          tempCom: _objectSpread(_objectSpread({}, prev.tempCom), {}, {
            base_unitaria: parseFloat(e.target.value) || 0
          })
        });
      });
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "absolute right-2 top-2 text-[9px] text-emerald-300 font-bold"
  }, "\u20AC"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-[#0f172a] mx-4 my-2 px-4 py-4 rounded-2xl text-white shadow-xl shadow-slate-200 relative overflow-hidden group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-blue-500/20 transition-all"
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-4 relative z-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "border-r border-white/10 pr-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "block text-[8px] text-slate-400 font-black uppercase tracking-widest mb-1"
  }, "Base Comisionable"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-lg font-black text-white tracking-tight"
  }, function () {
    var base = commissionModal.tempCom.modo === "auto" ? Object.values(commissionModal.tempCom.desglose || {}).reduce(function (acc, c) {
      return acc + (c.comisionable ? c.valor : 0);
    }, 0) : commissionModal.tempCom.base_unitaria || 0;
    return base.toLocaleString("es-ES", {
      minimumFractionDigits: 2
    });
  }()), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold text-slate-500"
  }, "\u20AC/u"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "block text-[8px] text-emerald-400/80 font-black uppercase tracking-widest mb-1"
  }, "Comisi\xF3n Unidad"), /*#__PURE__*/React.createElement("div", {
    className: "flex items-baseline gap-1"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-lg font-black text-emerald-400 tracking-tight"
  }, function () {
    var base = commissionModal.tempCom.modo === "auto" ? Object.values(commissionModal.tempCom.desglose || {}).reduce(function (acc, c) {
      return acc + (c.comisionable ? c.valor : 0);
    }, 0) : commissionModal.tempCom.base_unitaria || 0;
    return (base * (commissionModal.tempCom.porcentaje || 0) / 100).toLocaleString("es-ES", {
      minimumFractionDigits: 2
    });
  }()), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold text-emerald-600/60"
  }, "\u20AC")))), /*#__PURE__*/React.createElement("div", {
    className: "mt-4 pt-3 border-t border-white/5 flex justify-between items-center relative z-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[7px] font-black text-slate-500 uppercase tracking-widest"
  }, "Importe Total L\xEDnea"), /*#__PURE__*/React.createElement("p", {
    className: "text-[8px] font-bold text-slate-600"
  }, "(Comisi\xF3n \xD7 Pax \xD7 Noches)")), /*#__PURE__*/React.createElement("div", {
    className: "bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 group-hover:border-emerald-500/30 transition-all"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-lg font-black text-white tabular-nums tracking-tighter"
  }, function (_selectedGroupFicha$r52) {
    var item = JSON.parse(((_selectedGroupFicha$r52 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r52 === void 0 ? void 0 : _selectedGroupFicha$r52["RoomingList_JSON"]) || "[]")[commissionModal.itemIdx];
    var base = commissionModal.tempCom.modo === "auto" ? Object.values(commissionModal.tempCom.desglose || {}).reduce(function (acc, c) {
      return acc + (c.comisionable ? c.valor : 0);
    }, 0) : commissionModal.tempCom.base_unitaria || 0;
    return (base * (commissionModal.tempCom.porcentaje || 0) / 100 * item.qty * item.nights).toLocaleString("es-ES", {
      minimumFractionDigits: 2
    });
  }(), " ", /*#__PURE__*/React.createElement("span", {
    className: "text-xs font-normal opacity-40 ml-0.5"
  }, "\u20AC")))))), /*#__PURE__*/React.createElement("div", {
    className: "p-4 bg-white border-t flex gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setCommissionModal({
        isOpen: false,
        itemIdx: null,
        tempCom: null
      });
    },
    className: "flex-1 h-11 rounded-xl text-[10px] font-black text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all uppercase tracking-widest border border-transparent hover:border-slate-200"
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var _selectedGroupFicha$r53, _selectedGroupFicha$r54;
      var com = _objectSpread({}, commissionModal.tempCom);
      var item = JSON.parse(((_selectedGroupFicha$r53 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r53 === void 0 ? void 0 : _selectedGroupFicha$r53["RoomingList_JSON"]) || "[]")[commissionModal.itemIdx];
      if (com.modo === "auto") {
        com.base_unitaria = Object.values(com.desglose).reduce(function (acc, c) {
          return acc + (c.comisionable ? c.valor : 0);
        }, 0);
      }
      com.comision_unitaria = parseFloat((com.base_unitaria * com.porcentaje / 100).toFixed(2));
      com.total_comision = parseFloat((com.comision_unitaria * item.qty * item.nights).toFixed(2));
      var newRL = JSON.parse(((_selectedGroupFicha$r54 = selectedGroupFicha.records[0]) === null || _selectedGroupFicha$r54 === void 0 ? void 0 : _selectedGroupFicha$r54["RoomingList_JSON"]) || "[]");
      newRL[commissionModal.itemIdx].comision = com;
      updateGroupMetadata(selectedGroupFicha.id, "RoomingList_JSON", JSON.stringify(newRL));
      setCommissionModal({
        isOpen: false,
        itemIdx: null,
        tempCom: null
      });
    },
    className: "flex-[2] h-11 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] rounded-xl text-[10px] text-white font-black shadow-lg shadow-blue-600/20 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2"
  }, /*#__PURE__*/React.createElement(IconSave, {
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, "Aplicar Comisi\xF3n"))))), showAddGroupModal && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 animate-fade-in"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#0f172a] p-6 text-white flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-emerald-500/20 p-2 rounded-2xl border border-emerald-500/30"
  }, /*#__PURE__*/React.createElement(IconSparkles, {
    size: 24,
    className: "text-emerald-400"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-black uppercase tracking-widest"
  }, "Nuevo Presupuesto / Grupo"), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter"
  }, "Registro inteligente mediante IA o Manual"))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowAddGroupModal(false);
    },
    className: "w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
  }, /*#__PURE__*/React.createElement(IconX, {
    size: 24
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex gap-8 mb-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 mb-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"
  }, /*#__PURE__*/React.createElement(IconMail, {
    size: 16
  })), /*#__PURE__*/React.createElement("h4", {
    className: "text-sm font-black text-slate-700 uppercase tracking-widest"
  }, "Importar desde Email")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 leading-relaxed"
  }, "Pega el contenido del email de solicitud. Nuestra IA extraer\xE1 autom\xE1ticamente fechas, pax y detalles del grupo."), /*#__PURE__*/React.createElement("textarea", {
    className: "w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-inner",
    placeholder: "Pega aqu\xED el texto del email...",
    value: aiEmailContent,
    onChange: function onChange(e) {
      return setAiEmailContent(e.target.value);
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleAiGroupParse,
    disabled: isParsingEmail || !aiEmailContent.trim(),
    className: "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ".concat(isParsingEmail || !aiEmailContent.trim() ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98]")
  }, isParsingEmail ? /*#__PURE__*/React.createElement("div", {
    className: "nexus-spinner !w-4 !h-4"
  }) : /*#__PURE__*/React.createElement(IconBrain, {
    size: 18
  }), isParsingEmail ? "Procesando con IA..." : "Crear Grupo con IA")), /*#__PURE__*/React.createElement("div", {
    className: "w-[1px] bg-slate-100 hidden md:block"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 hidden md:block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"
  }, /*#__PURE__*/React.createElement(IconPlus, {
    size: 16
  })), /*#__PURE__*/React.createElement("h4", {
    className: "text-sm font-black text-slate-700 uppercase tracking-widest"
  }, "Creaci\xF3n Manual")), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      addNewRow();
      setShowAddGroupModal(false);
    },
    className: "w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all group"
  }, /*#__PURE__*/React.createElement(IconPlus, {
    size: 32,
    className: "group-hover:scale-110 transition-transform"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black uppercase tracking-widest"
  }, "Insertar Fila Vac\xEDa")), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] text-slate-400 text-center uppercase font-bold tracking-tighter"
  }, "\xDAtil para registros r\xE1pidos y edici\xF3n directa en tabla"))))))), showClientData && tempClientData && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#0f172a] p-6 text-white flex justify-between items-center shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-blue-500/20 p-2 rounded-2xl border border-blue-500/30"
  }, /*#__PURE__*/React.createElement(IconUsers, {
    size: 24,
    className: "text-blue-400"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-black uppercase tracking-widest leading-none"
  }, "Ficha Completa de Empresa"), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-bold text-slate-400 uppercase mt-1.5 tracking-tighter"
  }, "Gesti\xF3n de datos fiscales y contacto comercial"))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowClientData(false);
    },
    className: "w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
  }, /*#__PURE__*/React.createElement(IconX, {
    size: 24
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-8 space-y-8 overflow-y-auto custom-scrollbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4"
  }, "Datos Identificativos"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
  }, "Raz\xF3n Social / Nombre Empresa"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm",
    value: tempClientData.Fiscal_RazonSocial,
    onChange: function onChange(e) {
      return setTempClientData(_objectSpread(_objectSpread({}, tempClientData), {}, {
        Fiscal_RazonSocial: e.target.value
      }));
    },
    placeholder: "Nombre fiscal de la empresa"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
  }, "NIF / CIF / VAT"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm",
    value: tempClientData.Fiscal_CIF,
    onChange: function onChange(e) {
      return setTempClientData(_objectSpread(_objectSpread({}, tempClientData), {}, {
        Fiscal_CIF: e.target.value
      }));
    },
    placeholder: "Identificador fiscal"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4"
  }, "Contacto Directo"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
  }, "Persona de Contacto"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm",
    value: tempClientData.Persona_Contacto,
    onChange: function onChange(e) {
      return setTempClientData(_objectSpread(_objectSpread({}, tempClientData), {}, {
        Persona_Contacto: e.target.value
      }));
    },
    placeholder: "Nombre del responsable"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-3"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
  }, "Email Principal"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    className: "w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm",
    value: tempClientData.Email,
    onChange: function onChange(e) {
      return setTempClientData(_objectSpread(_objectSpread({}, tempClientData), {}, {
        Email: e.target.value
      }));
    },
    placeholder: "ejemplo@email.com"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
  }, "Tel\xE9fono"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm",
    value: tempClientData.Telefono,
    onChange: function onChange(e) {
      return setTempClientData(_objectSpread(_objectSpread({}, tempClientData), {}, {
        Telefono: e.target.value
      }));
    },
    placeholder: "+34 ..."
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4"
  }, "Direcci\xF3n Fiscal"), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "md:col-span-2"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
  }, "Calle / N\xFAmero"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm",
    value: tempClientData.Fiscal_Direccion,
    onChange: function onChange(e) {
      return setTempClientData(_objectSpread(_objectSpread({}, tempClientData), {}, {
        Fiscal_Direccion: e.target.value
      }));
    },
    placeholder: "Direcci\xF3n completa"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
  }, "C.P."), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm",
    value: tempClientData.Fiscal_CP,
    onChange: function onChange(e) {
      return setTempClientData(_objectSpread(_objectSpread({}, tempClientData), {}, {
        Fiscal_CP: e.target.value
      }));
    },
    placeholder: "C\xF3digo Postal"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-3 gap-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
  }, "Poblaci\xF3n"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm",
    value: tempClientData.Fiscal_Poblacion,
    onChange: function onChange(e) {
      return setTempClientData(_objectSpread(_objectSpread({}, tempClientData), {}, {
        Fiscal_Poblacion: e.target.value
      }));
    },
    placeholder: "Ciudad"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
  }, "Provincia"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm",
    value: tempClientData.Fiscal_Provincia,
    onChange: function onChange(e) {
      return setTempClientData(_objectSpread(_objectSpread({}, tempClientData), {}, {
        Fiscal_Provincia: e.target.value
      }));
    },
    placeholder: "Provincia"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase block mb-1.5 ml-1"
  }, "Pa\xEDs"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    className: "w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm",
    value: tempClientData.Fiscal_Pais,
    onChange: function onChange(e) {
      return setTempClientData(_objectSpread(_objectSpread({}, tempClientData), {}, {
        Fiscal_Pais: e.target.value
      }));
    },
    placeholder: "Espa\xF1a"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement("h4", {
    className: "text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4"
  }, "Notas y Observaciones de Empresa"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("textarea", {
    className: "w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 outline-none transition-all resize-none shadow-inner",
    value: tempClientData.Observaciones,
    onChange: function onChange(e) {
      return setTempClientData(_objectSpread(_objectSpread({}, tempClientData), {}, {
        Observaciones: e.target.value
      }));
    },
    placeholder: "A\xF1ade aqu\xED acuerdos permanentes con esta empresa, particularidades de facturaci\xF3n, etc..."
  })))), /*#__PURE__*/React.createElement("div", {
    className: "p-6 bg-slate-50 border-t flex justify-end gap-3 shrink-0"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowClientData(false);
    },
    className: "px-6 py-3 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all tracking-[0.2em]"
  }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
    onClick: /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1() {
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.n) {
          case 0:
            _context1.n = 1;
            return updateGroupMetadata(selectedGroupFicha.id, tempClientData);
          case 1:
            setShowClientData(false);
            alert("✅ Datos de empresa actualizados correctamente.");
          case 2:
            return _context1.a(2);
        }
      }, _callee1);
    })),
    className: "px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all tracking-[0.2em] flex items-center gap-3"
  }, /*#__PURE__*/React.createElement(IconSave, {
    size: 18
  }), "Guardar Cambios")))), showReviewModal && aiReviewData && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up border border-slate-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#0f172a] p-6 text-white flex justify-between items-center group"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30"
  }, /*#__PURE__*/React.createElement(IconBrain, {
    size: 24,
    className: "text-indigo-400 group-hover:scale-110 transition-transform"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-black uppercase tracking-widest text-white leading-none"
  }, "Revisi\xF3n IA"), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider"
  }, "Confirma los datos extra\xEDdos del email"))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowReviewModal(false);
    },
    className: "w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/10 text-slate-400 transition-all"
  }, /*#__PURE__*/React.createElement(IconX, {
    size: 24
  }))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 md:grid-cols-2 gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-200 group"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2"
  }, "Nombre del Grupo"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: aiReviewData["Nombre del Grupo"] || "",
    onChange: function onChange(e) {
      return setAiReviewData(_objectSpread(_objectSpread({}, aiReviewData), {}, {
        "Nombre del Grupo": e.target.value
      }));
    },
    className: "w-full font-black text-slate-800 outline-none p-1 rounded hover:bg-slate-50 border-b-2 border-transparent focus:border-indigo-400 transition-all text-sm uppercase"
  })), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-4 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-200"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2"
  }, "Email Contacto"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: aiReviewData["Email"] || "",
    onChange: function onChange(e) {
      return setAiReviewData(_objectSpread(_objectSpread({}, aiReviewData), {}, {
        Email: e.target.value
      }));
    },
    className: "w-full font-bold text-slate-600 outline-none p-1 rounded hover:bg-slate-50 border-b-2 border-transparent focus:border-indigo-400 transition-all text-sm"
  })), /*#__PURE__*/React.createElement("div", {
    className: "bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 shadow-sm flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1"
  }, "Pax"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: aiReviewData["Pax."] || aiReviewData["Pax"] || "",
    onChange: function onChange(e) {
      return setAiReviewData(_objectSpread(_objectSpread({}, aiReviewData), {}, {
        Pax: parseInt(e.target.value) || 0,
        "Pax.": parseInt(e.target.value) || 0
      }));
    },
    className: "w-20 bg-transparent font-black text-indigo-700 text-lg outline-none"
  })), /*#__PURE__*/React.createElement("div", {
    className: "text-right"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1"
  }, "Tipo R\xE9gimen"), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: aiReviewData["Régimen"] || "",
    onChange: function onChange(e) {
      return setAiReviewData(_objectSpread(_objectSpread({}, aiReviewData), {}, {
        Régimen: e.target.value
      }));
    },
    className: "w-32 bg-transparent font-black text-indigo-700 text-right uppercase text-sm outline-none"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 shadow-sm flex items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1"
  }, "Entrada"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: aiReviewData["Entrada"] || "",
    onChange: function onChange(e) {
      return setAiReviewData(_objectSpread(_objectSpread({}, aiReviewData), {}, {
        Entrada: e.target.value
      }));
    },
    className: "w-full bg-transparent font-black text-emerald-700 text-sm outline-none"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 text-right"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1 text-right"
  }, "Salida"), /*#__PURE__*/React.createElement("input", {
    type: "date",
    value: aiReviewData["Salida"] || "",
    onChange: function onChange(e) {
      return setAiReviewData(_objectSpread(_objectSpread({}, aiReviewData), {}, {
        Salida: e.target.value
      }));
    },
    className: "w-full bg-transparent font-black text-emerald-700 text-sm outline-none text-right"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3"
  }, "Programa / Descripci\xF3n del Grupo"), /*#__PURE__*/React.createElement("textarea", {
    value: aiReviewData["Observaciones"] || aiReviewData["Com_Notas"] || "",
    onChange: function onChange(e) {
      return setAiReviewData(_objectSpread(_objectSpread({}, aiReviewData), {}, {
        Observaciones: e.target.value
      }));
    },
    className: "w-full h-32 bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs font-medium text-slate-600 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all resize-none shadow-inner",
    placeholder: "La IA no ha podido extraer un programa claro..."
  }))), /*#__PURE__*/React.createElement("div", {
    className: "p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-4 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase"
  }, /*#__PURE__*/React.createElement(IconAlertTriangle, {
    size: 14
  }), /*#__PURE__*/React.createElement("span", null, "Verifica fechas y pax antes de guardar")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-3"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowReviewModal(false);
    },
    className: "px-6 py-3 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all tracking-widest"
  }, "Descartar"), /*#__PURE__*/React.createElement("button", {
    onClick: saveReviewData,
    className: "px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase rounded-2xl shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all tracking-[0.2em] flex items-center gap-3"
  }, /*#__PURE__*/React.createElement(IconCheck, {
    size: 18,
    stroke: 3
  }), "Confirmar y Crear Grupo"))))), isHotelModalOpen && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in text-center border border-white/20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
  }, /*#__PURE__*/React.createElement(IconUpload, {
    size: 32
  })), /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-slate-800 mb-2"
  }, "\xBFA qu\xE9 hotel pertenecen estos datos?"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-slate-500 mb-8"
  }, "Selecciona el hotel para asignar correctamente las reservas importadas."), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-1 gap-4"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return confirmHotelAndProcess("SERCOTEL GUADIANA");
    },
    className: "py-4 bg-slate-50 border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 rounded-2xl font-bold text-slate-700 transition-all flex flex-col items-center gap-1 group"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-emerald-600"
  }, "SERCOTEL GUADIANA"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 font-normal uppercase tracking-widest"
  }, "Hotel Principal")), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return confirmHotelAndProcess("Cumbria Spa&Hotel");
    },
    className: "py-4 bg-slate-50 border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 rounded-2xl font-bold text-slate-700 transition-all flex flex-col items-center gap-1 group"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-blue-600"
  }, "Cumbria Spa&Hotel"), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] text-slate-400 font-normal uppercase tracking-widest"
  }, "Hotel Asociado"))), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      setIsHotelModalOpen(false);
      setPendingFile(null);
    },
    className: "mt-6 text-slate-400 hover:text-slate-600 text-sm font-bold uppercase tracking-widest"
  }, "Cancelar"))), (loading || isSaving) && /*#__PURE__*/React.createElement("div", {
    className: "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl animate-fade-in border border-white/20"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nexus-spinner"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-black text-slate-700 uppercase tracking-widest animate-pulse"
  }, isSaving || isAiLoading ? "Guardando Cambios..." : "Procesando Archivo...")))));
};
var ErrorBoundary = /*#__PURE__*/function (_React$Component) {
  function ErrorBoundary(props) {
    var _this;
    _classCallCheck(this, ErrorBoundary);
    _this = _callSuper(this, ErrorBoundary, [props]);
    _this.state = {
      hasError: false,
      error: null
    };
    return _this;
  }
  _inherits(ErrorBoundary, _React$Component);
  return _createClass(ErrorBoundary, [{
    key: "componentDidCatch",
    value: function componentDidCatch(error, errorInfo) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }, {
    key: "render",
    value: function render() {
      if (this.state.hasError) {
        var _this$state$error;
        return /*#__PURE__*/React.createElement("div", {
          className: "min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans space-y-4"
        }, /*#__PURE__*/React.createElement("div", {
          className: "w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-sm"
        }, /*#__PURE__*/React.createElement("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          width: "32",
          height: "32",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, /*#__PURE__*/React.createElement("circle", {
          cx: "12",
          cy: "12",
          r: "10"
        }), /*#__PURE__*/React.createElement("line", {
          x1: "12",
          y1: "8",
          x2: "12",
          y2: "12"
        }), /*#__PURE__*/React.createElement("line", {
          x1: "12",
          y1: "16",
          x2: "12.01",
          y2: "16"
        }))), /*#__PURE__*/React.createElement("h1", {
          className: "text-2xl font-black text-slate-800 tracking-tight"
        }, "\xA1Oops! Algo sali\xF3 mal."), /*#__PURE__*/React.createElement("p", {
          className: "text-slate-500 max-w-md text-sm leading-relaxed"
        }, "Ha ocurrido un error inesperado en la interfaz. Hemos registrado el problema. Por favor, recarga la p\xE1gina para continuar."), /*#__PURE__*/React.createElement("button", {
          onClick: function onClick() {
            return window.location.reload();
          },
          className: "mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-md"
        }, "Recargar Aplicaci\xF3n"), /*#__PURE__*/React.createElement("div", {
          className: "mt-8 p-4 bg-white/50 border border-slate-200 rounded-lg text-left overflow-auto max-w-2xl w-full"
        }, /*#__PURE__*/React.createElement("p", {
          className: "text-xs font-mono text-slate-400 break-all"
        }, (_this$state$error = this.state.error) === null || _this$state$error === void 0 ? void 0 : _this$state$error.toString())));
      }
      return this.props.children;
    }
  }], [{
    key: "getDerivedStateFromError",
    value: function getDerivedStateFromError(error) {
      return {
        hasError: true,
        error: error
      };
    }
  }]);
}(React.Component);
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(ErrorBoundary, null, /*#__PURE__*/React.createElement(App, null)));
var DebouncedSearchInput = function DebouncedSearchInput(_ref24) {
  var parentValue = _ref24.value,
    onChange = _ref24.onChange,
    placeholder = _ref24.placeholder,
    className = _ref24.className;
  var _React$useState5 = React.useState(parentValue),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    value = _React$useState6[0],
    setValue = _React$useState6[1];
  React.useEffect(function () {
    setValue(parentValue);
  }, [parentValue]);
  React.useEffect(function () {
    if (value === parentValue) return;
    var handler = setTimeout(function () {
      onChange(value);
    }, 300);
    return function () {
      return clearTimeout(handler);
    };
  }, [value, onChange, parentValue]);
  return /*#__PURE__*/React.createElement("input", {
    type: "text",
    placeholder: placeholder,
    className: className,
    value: value,
    onChange: function onChange(e) {
      return setValue(e.target.value);
    }
  });
};
