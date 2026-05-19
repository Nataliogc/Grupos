"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
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
var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useMemo = _React.useMemo;

// --- FIREBASE ---
var db = window.db;

// --- CONSTANTES ---
var ROOM_TYPES = {
  "Sercotel Guadiana": ["DOBLE DE USO INDIVIDUAL", "DOBLE", "DOBLE + SUPLETORIA", "CUÁDRUPLE"],
  "Cumbria Spa&Hotel": ["DOBLE DE USO INDIVIDUAL", "DOBLE", "DOBLE + SUPLETORIA"]
};
var BOARD_TYPES = ["SA (Solo Alojamiento)", "AD (Alojamiento y Desayuno)", "MP (Media Pensión)", "PC (Pensión Completa)"];

// Personas por tipo de habitación (auto-cálculo PAX)
var PAX_PER_ROOM = {
  // Nuevos tipos oficiales
  "DOBLE DE USO INDIVIDUAL": 1,
  "DOBLE": 2,
  "DOBLE + SUPLETORIA": 3,
  "CUÁDRUPLE": 4,
  // Retrocompatibilidad
  "Doble Individual": 1,
  "Doble de Uso Individual": 1,
  "Doble 2 Camas": 2,
  "Doble Matrimonial": 2,
  "Doble": 2,
  "Doble + Supletoria": 3,
  "Triple": 3,
  "Junior Suite": 2,
  "Cuádruple": 4
};

// --- UTILS (cargadas desde js/utils.js) ---
var generateDates = NexusUtils.generateDates;
var generateSeriesDates = NexusUtils.generateSeriesDates;
var formatDate = NexusUtils.formatDate;
var formatNum = NexusUtils.formatNum;
var getStatusColor = NexusUtils.getStatusColor;
var toInputDate = NexusUtils.toInputDate;
var DEFAULT_FORM_DATA = {
  Hotel_Asignado: 'Sercotel Guadiana',
  "Nombre del Grupo": '',
  Com_Nombre_Contacto: '',
  Com_Email_Contacto: '',
  Com_Telefono_Contacto: '',
  Entrada: '',
  Salida: '',
  DateRanges_JSON: [],
  roomCounts: {},
  dailyConfig: {},
  Com_Notas: '',
  Com_Estado_Interno: 'PRESUPUESTO',
  clauses: [],
  clauses_conf: []
};
var ROOM_MIGRATION_MAP = {
  "doble individual": "DOBLE DE USO INDIVIDUAL",
  "doble de uso individual": "DOBLE DE USO INDIVIDUAL",
  "doble 2 camas": "DOBLE",
  "doble matrimonial": "DOBLE",
  "doble": "DOBLE",
  "doble + supletoria": "DOBLE + SUPLETORIA",
  "triple": "DOBLE + SUPLETORIA",
  "junior suite": "DOBLE",
  "cuádruple": "CUÁDRUPLE"
};
var BUDGET_DEFAULT_CLAUSES = [{
  title: "Cupo y Disponibilidad",
  body: "La presente oferta es válida por 48 horas. Dado que se requiere el bloqueo total de instalaciones, la disponibilidad no se garantiza hasta el primer depósito."
}, {
  title: "Confirmación y Depósito",
  body: "Bloqueo confirmado al recibir el 30% del total ({DEP_30}). El 70% restante deberá liquidarse 7 días antes de la entrada."
}, {
  title: "Política de Cancelación",
  body: "Al ser un evento de carácter exclusivo con bloqueo de inventario, todos los depósitos entregados tienen carácter de NO REEMBOLSABLES."
}, {
  title: "Rooming List",
  body: "La relación detallada de ocupantes deberá entregarse 5 días hábiles antes de la llegada del primer pasajero."
}];
var CONF_DEFAULT_CLAUSES = [{
  title: "Confirmación y Depósito",
  body: "Para garantizar la reserva definitiva, se requiere un primer depósito del 30% ({DEP_30}) en concepto de garantía. La reserva no se considerará confirmada hasta la recepción del mismo."
}, {
  title: "Calendario de Pagos y Release",
  body: "Se establece un release de 30 días previos a la entrada ({RELEASE_30}), fecha en la cual el hotel deberá haber recibido el 50% del total ({DEP_50}). El pago final del 100% ({DEP_100}) deberá estar liquidado 7 días antes de la llegada ({RELEASE_7})."
}, {
  title: "Reducciones y Cancelaciones",
  body: "Se permite una reducción de hasta el 10% del número de habitaciones contratadas sin gastos hasta 15 días antes de la llegada ({RELEASE_15}). Cancelaciones totales posteriores a esta fecha incurrirán en un 100% de gastos."
}, {
  title: "Rooming List y Régimen",
  body: "La lista definitiva de ocupantes (Rooming List) deberá ser enviada antes del {RELEASE_7}. Cualquier cambio posterior queda sujeto a disponibilidad."
}];
var calculateDefaultCommission = function calculateDefaultCommission(price, regime, qty, nights) {
  var type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";
  return 0;
};
var buildRoomingList = function buildRoomingList(group) {
  var existingListJson = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "[]";
  var existingList = [];
  try {
    existingList = JSON.parse(existingListJson || "[]");
  } catch (e) {
    existingList = [];
  }
  var dates = [];
  if (group.DateRanges_JSON && Array.isArray(group.DateRanges_JSON) && group.DateRanges_JSON.length > 0) {
    dates = generateSeriesDates(group.DateRanges_JSON);
  } else {
    dates = generateDates(group.Entrada, group.Salida);
  }
  if (!dates || dates.length === 0) return [];
  var hotelName = group.Hotel_Asignado || group.Hotel || "Sercotel Guadiana";
  var newList = [];
  dates.forEach(function (date) {
    var _group$dailyConfig;
    var config = ((_group$dailyConfig = group.dailyConfig) === null || _group$dailyConfig === void 0 ? void 0 : _group$dailyConfig[date]) || {};
    Object.entries(group.roomCounts || {}).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        type = _ref2[0],
        globalCount = _ref2[1];
      var count = globalCount;
      if (config.counts) {
        var countKey = Object.keys(config.counts).find(function (k) {
          return k.toLowerCase() === type.toLowerCase();
        });
        if (countKey && config.counts[countKey] !== '' && config.counts[countKey] !== undefined) {
          count = Number(config.counts[countKey]);
        }
      }
      if (count > 0) {
        var price = 0;
        var regime = config.board || group["Régimen"] || "AD";
        var gratuities = 0;
        var discount = 0;
        if (config.prices) {
          var pk = Object.keys(config.prices).find(function (k) {
            return k.trim().toLowerCase() === type.trim().toLowerCase();
          });
          price = pk ? parseFloat(config.prices[pk] || 0) : 0;
          var gratKey = config.gratuities ? Object.keys(config.gratuities).find(function (k) {
            return k.trim().toLowerCase() === type.trim().toLowerCase();
          }) : null;
          gratuities = gratKey ? parseInt(config.gratuities[gratKey] || 0) : 0;
          var discKey = config.discounts ? Object.keys(config.discounts).find(function (k) {
            return k.trim().toLowerCase() === type.trim().toLowerCase();
          }) : null;
          discount = discKey ? parseFloat(config.discounts[discKey] || 0) : 0;
        } else {
          var tk = Object.keys(config).find(function (k) {
            return k.trim().toLowerCase() === type.trim().toLowerCase();
          });
          if (tk && config[tk]) {
            price = parseFloat(config[tk].price || 0);
            regime = config[tk].board || regime;
            gratuities = parseInt(config[tk].gratuities || 0);
            discount = parseFloat(config[tk].discount || 0);
          }
        }
        var paxPerRoom = PAX_PER_ROOM[type] || 2;
        var payingRooms = Math.max(0, count - gratuities);
        var existingPaying = existingList.find(function (item) {
          return !item.isService && item.dateIn === date && item.type === type.toUpperCase() && item.hotel === hotelName;
        });
        if (payingRooms > 0) {
          var regimeShort = regime.split(' ')[0];
          newList.push({
            id: existingPaying ? existingPaying.id : Date.now() + Math.random(),
            hotel: hotelName,
            type: type.toUpperCase(),
            dateIn: date,
            dateOut: date,
            qty: payingRooms,
            regime: regimeShort,
            price: price,
            pax: paxPerRoom,
            nights: 1,
            total: (payingRooms * price * (1 - discount / 100)).toFixed(2),
            isService: false,
            comision: existingPaying && existingPaying.comision ? existingPaying.comision : calculateDefaultCommission(price, regimeShort, payingRooms, 1, type)
          });
        }
        if (gratuities > 0) {
          var _regimeShort = regime.split(' ')[0];
          var existingGrat = existingList.find(function (item) {
            return !item.isService && item.dateIn === date && item.type === type.toUpperCase() + " (GRATUIDAD)" && item.hotel === hotelName;
          });
          newList.push({
            id: existingGrat ? existingGrat.id : Date.now() + Math.random(),
            hotel: hotelName,
            type: type.toUpperCase() + " (GRATUIDAD)",
            dateIn: date,
            dateOut: date,
            qty: gratuities,
            regime: _regimeShort,
            price: 0,
            pax: paxPerRoom,
            nights: 1,
            total: "0.00",
            isService: false,
            comision: existingGrat && existingGrat.comision ? existingGrat.comision : calculateDefaultCommission(0, _regimeShort, gratuities, 1, type)
          });
        }
      }
    });
  });
  existingList.forEach(function (item) {
    if (item.isService && !dates.includes(item.dateIn)) {
      newList.push(item);
    }
  });
  return newList;
};
var normalizeGroupData = function normalizeGroupData(groupData) {
  if (!groupData) return null;
  var newData = _objectSpread({}, groupData);
  var rawHotel = groupData.Hotel_Asignado || groupData.Hotel || "";
  if (rawHotel.toLowerCase().includes("cumbria")) {
    newData.Hotel_Asignado = "Cumbria Spa&Hotel";
  } else if (rawHotel.toLowerCase().includes("guadiana")) {
    newData.Hotel_Asignado = "Sercotel Guadiana";
  } else {
    newData.Hotel_Asignado = "Sercotel Guadiana";
  }
  var newRoomCounts = {};
  Object.entries(newData.roomCounts || {}).forEach(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
      oldType = _ref4[0],
      count = _ref4[1];
    var normOld = oldType.toLowerCase();
    var newType = ROOM_MIGRATION_MAP[normOld] || oldType.toUpperCase();
    newRoomCounts[newType] = (newRoomCounts[newType] || 0) + Number(count);
  });
  newData.roomCounts = newRoomCounts;
  if (newData.dailyConfig) {
    newData.dailyConfig = _objectSpread({}, newData.dailyConfig);
    Object.entries(newData.dailyConfig).forEach(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
        date = _ref6[0],
        dayConf = _ref6[1];
      var newDayConf = {
        board: dayConf.board || "AD (Alojamiento y Desayuno)",
        prices: dayConf.prices ? _objectSpread({}, dayConf.prices) : {},
        counts: dayConf.counts ? _objectSpread({}, dayConf.counts) : {},
        gratuities: dayConf.gratuities ? _objectSpread({}, dayConf.gratuities) : {},
        discounts: dayConf.discounts ? _objectSpread({}, dayConf.discounts) : {}
      };
      Object.entries(dayConf).forEach(function (_ref7) {
        var _ref8 = _slicedToArray(_ref7, 2),
          key = _ref8[0],
          val = _ref8[1];
        if (key !== 'board' && key !== 'prices' && key !== 'counts' && key !== 'gratuities' && key !== 'discounts') {
          var normOld = key.toLowerCase();
          var newType = ROOM_MIGRATION_MAP[normOld] || key.toUpperCase();
          if (val && _typeof(val) === 'object') {
            if (val.price !== undefined && newDayConf.prices[newType] === undefined) {
              newDayConf.prices[newType] = val.price;
            }
            if (val.count !== undefined && newDayConf.counts[newType] === undefined) {
              newDayConf.counts[newType] = val.count;
            } else if (val.qty !== undefined && newDayConf.counts[newType] === undefined) {
              newDayConf.counts[newType] = val.qty;
            }
            if (val.gratuities !== undefined && newDayConf.gratuities[newType] === undefined) {
              newDayConf.gratuities[newType] = val.gratuities;
            }
            if (val.discount !== undefined && newDayConf.discounts[newType] === undefined) {
              newDayConf.discounts[newType] = val.discount;
            }
          }
        }
      });
      if (newDayConf.prices) {
        var newPrices = {};
        Object.entries(newDayConf.prices).forEach(function (_ref9) {
          var _ref0 = _slicedToArray(_ref9, 2),
            oldType = _ref0[0],
            price = _ref0[1];
          var normOld = oldType.toLowerCase();
          var newType = ROOM_MIGRATION_MAP[normOld] || oldType.toUpperCase();
          newPrices[newType] = price;
        });
        newDayConf.prices = newPrices;
      }
      if (newDayConf.counts) {
        var newCounts = {};
        Object.entries(newDayConf.counts).forEach(function (_ref1) {
          var _ref10 = _slicedToArray(_ref1, 2),
            oldType = _ref10[0],
            cnt = _ref10[1];
          var normOld = oldType.toLowerCase();
          var newType = ROOM_MIGRATION_MAP[normOld] || oldType.toUpperCase();
          newCounts[newType] = cnt;
        });
        newDayConf.counts = newCounts;
      }
      if (newDayConf.gratuities) {
        var newGratuities = {};
        Object.entries(newDayConf.gratuities).forEach(function (_ref11) {
          var _ref12 = _slicedToArray(_ref11, 2),
            oldType = _ref12[0],
            grat = _ref12[1];
          var normOld = oldType.toLowerCase();
          var newType = ROOM_MIGRATION_MAP[normOld] || oldType.toUpperCase();
          newGratuities[newType] = grat;
        });
        newDayConf.gratuities = newGratuities;
      }
      if (newDayConf.discounts) {
        var newDiscounts = {};
        Object.entries(newDayConf.discounts).forEach(function (_ref13) {
          var _ref14 = _slicedToArray(_ref13, 2),
            oldType = _ref14[0],
            disc = _ref14[1];
          var normOld = oldType.toLowerCase();
          var newType = ROOM_MIGRATION_MAP[normOld] || oldType.toUpperCase();
          newDiscounts[newType] = disc;
        });
        newDayConf.discounts = newDiscounts;
      }
      newData.dailyConfig[date] = newDayConf;
    });
  }
  newData.DateRanges_JSON = Array.isArray(groupData.DateRanges_JSON) ? groupData.DateRanges_JSON : [];
  newData.tracking = Array.isArray(groupData.tracking) ? groupData.tracking : [];
  newData.Com_Nombre_Contacto = groupData.Com_Nombre_Contacto || groupData.Persona_Contacto || "";
  newData.Com_Email_Contacto = groupData.Com_Email_Contacto || groupData.Email || "";
  newData.Com_Telefono_Contacto = groupData.Com_Telefono_Contacto || groupData.Telefono || groupData["Teléfono"] || groupData["Tel\xC3\xA9fono"] || groupData["Teléfono"] || "";
  return newData;
};
var calculateTotal = function calculateTotal(rawGroupData) {
  var groupData = normalizeGroupData(rawGroupData);
  if (!groupData) return 0;
  var dates = [];
  if (groupData.DateRanges_JSON && Array.isArray(groupData.DateRanges_JSON) && groupData.DateRanges_JSON.length > 0) {
    dates = generateSeriesDates(groupData.DateRanges_JSON);
  } else {
    dates = generateDates(groupData.Entrada, groupData.Salida);
  }
  var total = 0;
  dates.forEach(function (date) {
    var _groupData$dailyConfi;
    var config = ((_groupData$dailyConfi = groupData.dailyConfig) === null || _groupData$dailyConfi === void 0 ? void 0 : _groupData$dailyConfi[date]) || {};
    Object.entries(groupData.roomCounts || {}).forEach(function (_ref15) {
      var _ref16 = _slicedToArray(_ref15, 2),
        type = _ref16[0],
        globalCount = _ref16[1];
      var count = globalCount;
      if (config.counts) {
        var countKey = Object.keys(config.counts).find(function (k) {
          return k.toLowerCase() === type.toLowerCase();
        });
        if (countKey && config.counts[countKey] !== '' && config.counts[countKey] !== undefined) {
          count = Number(config.counts[countKey]);
        }
      }
      if (count > 0) {
        var lineSubtotal = 0;
        if (config.prices) {
          var priceKey = Object.keys(config.prices).find(function (k) {
            return k.toLowerCase() === type.toLowerCase();
          });
          var p = priceKey ? parseFloat(config.prices[priceKey] || 0) : 0;
          var gratKey = config.gratuities ? Object.keys(config.gratuities).find(function (k) {
            return k.toLowerCase() === type.toLowerCase();
          }) : null;
          var grat = gratKey ? parseInt(config.gratuities[gratKey] || 0) : 0;
          var discKey = config.discounts ? Object.keys(config.discounts).find(function (k) {
            return k.toLowerCase() === type.toLowerCase();
          }) : null;
          var disc = discKey ? parseFloat(config.discounts[discKey] || 0) : 0;
          var billableCount = Math.max(0, count - grat);
          lineSubtotal = p * billableCount * (1 - disc / 100);
        } else {
          var typeKey = Object.keys(config).find(function (k) {
            return k.toLowerCase() === type.toLowerCase();
          });
          if (typeKey && config[typeKey]) {
            var price = parseFloat(config[typeKey].price) || 0;
            var discount = parseFloat(config[typeKey].discount) || 0;
            var gratuities = parseInt(config[typeKey].gratuities) || 0;
            var _billableCount = Math.max(0, count - gratuities);
            lineSubtotal = _billableCount * price * (1 - discount / 100);
          }
        }
        total += lineSubtotal;
      }
    });
  });
  // Suplementos y Descuentos Globales
  var suplementos = parseFloat(groupData.Suplementos) || 0;
  var descuentos = parseFloat(groupData.Descuentos) || 0;
  total = total + suplementos - descuentos;

  // Otros Cargos (Extras Dinámicos)
  var extras = groupData.extraCharges || [];
  extras.forEach(function (extra) {
    var isGlobal = !extra.date;
    var px = parseFloat(extra.price) || 0;
    total += isGlobal ? px * Math.max(1, dates.length) : px;
  });

  // Si no hay configuración diaria pero hay un importe fijado (desde IA)
  if (total === 0 && groupData["Importe(*)"]) {
    var imp = parseFloat(String(groupData["Importe(*)"]).replace(',', '.'));
    return isNaN(imp) ? 0 : imp;
  }
  return total > 0 ? total : 0;
};
function App() {
  var _useState = useState([]),
    _useState2 = _slicedToArray(_useState, 2),
    groups = _useState2[0],
    setGroups = _useState2[1];
  var _useState3 = useState(true),
    _useState4 = _slicedToArray(_useState3, 2),
    loading = _useState4[0],
    setLoading = _useState4[1];
  var _useState5 = useState('dashboard'),
    _useState6 = _slicedToArray(_useState5, 2),
    currentView = _useState6[0],
    setCurrentView = _useState6[1];
  var _useState7 = useState(null),
    _useState8 = _slicedToArray(_useState7, 2),
    selectedGroup = _useState8[0],
    setSelectedGroup = _useState8[1];
  var _useState9 = useState(''),
    _useState0 = _slicedToArray(_useState9, 2),
    newNote = _useState0[0],
    setNewNote = _useState0[1];
  var _useState1 = useState(null),
    _useState10 = _slicedToArray(_useState1, 2),
    globalConfig = _useState10[0],
    setGlobalConfig = _useState10[1];
  var _useState11 = useState(false),
    _useState12 = _slicedToArray(_useState11, 2),
    isEditingClauses = _useState12[0],
    setIsEditingClauses = _useState12[1];
  var _useState13 = useState([]),
    _useState14 = _slicedToArray(_useState13, 2),
    tempClauses = _useState14[0],
    setTempClauses = _useState14[1];
  var _useState15 = useState([]),
    _useState16 = _slicedToArray(_useState15, 2),
    tempClausesConf = _useState16[0],
    setTempClausesConf = _useState16[1];
  var _useState17 = useState(false),
    _useState18 = _slicedToArray(_useState17, 2),
    isEditingClausesConf = _useState18[0],
    setIsEditingClausesConf = _useState18[1];
  var _useState19 = useState('presupuesto'),
    _useState20 = _slicedToArray(_useState19, 2),
    docMode = _useState20[0],
    setDocMode = _useState20[1]; // 'presupuesto' o 'confirmacion'
  var _useState21 = useState('activos'),
    _useState22 = _slicedToArray(_useState21, 2),
    filterTab = _useState22[0],
    setFilterTab = _useState22[1]; // 'activos', 'confirmados', 'desestimados'
  var _useState23 = useState(''),
    _useState24 = _slicedToArray(_useState23, 2),
    searchTerm = _useState24[0],
    setSearchTerm = _useState24[1];
  var _useState25 = useState(''),
    _useState26 = _slicedToArray(_useState25, 2),
    debouncedSearchTerm = _useState26[0],
    setDebouncedSearchTerm = _useState26[1];
  var _useState27 = useState(''),
    _useState28 = _slicedToArray(_useState27, 2),
    startDate = _useState28[0],
    setStartDate = _useState28[1];
  var _useState29 = useState(''),
    _useState30 = _slicedToArray(_useState29, 2),
    endDate = _useState30[0],
    setEndDate = _useState30[1];

  // Debounce search term
  useEffect(function () {
    var handler = setTimeout(function () {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return function () {
      return clearTimeout(handler);
    };
  }, [searchTerm]);
  useEffect(function () {
    var unsubscribe = db.collection("settings").doc("main").onSnapshot(function (doc) {
      if (doc.exists) {
        setGlobalConfig(doc.data());
      }
    });
    return function () {
      return unsubscribe();
    };
  }, []);
  var getCurrentStayDates = function getCurrentStayDates() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : formData;
    if (data.DateRanges_JSON && Array.isArray(data.DateRanges_JSON) && data.DateRanges_JSON.length > 0) {
      return generateSeriesDates(data.DateRanges_JSON);
    }
    return generateDates(data.Entrada, data.Salida);
  };
  var _useState31 = useState(DEFAULT_FORM_DATA),
    _useState32 = _slicedToArray(_useState31, 2),
    formData = _useState32[0],
    setFormData = _useState32[1];

  // Cargar datos y manejar parámetros de URL
  useEffect(function () {
    var unsubscribe = db.collection("groups").onSnapshot(function (snapshot) {
      var docs = snapshot.docs.map(function (doc) {
        return _objectSpread({
          uid: doc.id
        }, doc.data());
      }).filter(function (g) {
        var est = (g.Estado || "").toUpperCase();
        var intEst = (g.Com_Estado_Interno || "").toUpperCase();
        var isBudget = String(g.Reserva || "").startsWith("PRES-") || est.includes("PRESUPUESTO") || intEst.includes("PRESUPUESTO") || intEst.includes("ENVIADO") || intEst.includes("SEGUIMIENTO") || intEst.includes("PENDIENTE");
        if (!isBudget) return false;

        // En el cargador general de Presupuestos, permitimos todos los estados
        // (la lógica de visualización se encarga de filtrar por la pestaña seleccionada)
        return true;
      });
      setGroups(docs);
      setLoading(false);

      // Lógica de Deep-link (?id=XXXX)
      var urlParams = new URLSearchParams(window.location.search);
      var budgetId = urlParams.get('id');
      var shouldEdit = urlParams.get('edit') === '1';
      if (budgetId && docs.length > 0) {
        var matched = docs.find(function (g) {
          return String(g.Reserva) === String(budgetId) || String(g.uid) === String(budgetId);
        });
        if (matched) {
          var normMatched = normalizeGroupData(matched);
          if (shouldEdit) {
            setFormData(normMatched);
            setCurrentView('create');
          } else {
            handleOpenDetail(normMatched);
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    });
    return function () {
      return unsubscribe();
    };
  }, []);
  var processedGroups = useMemo(function () {
    var todayStr = new Date().toISOString().split('T')[0];
    return groups.map(function (rawG) {
      var g = normalizeGroupData(rawG);
      var totalAmount = calculateTotal(g);
      return _objectSpread(_objectSpread({}, g), {}, {
        _totalAmount: totalAmount
      });
    }).filter(function (g) {
      var intEst = (g.Com_Estado_Interno || "").toUpperCase();
      var extEst = (g.Estado || "").toUpperCase();
      var isCancelled = ["CANCEL", "ANUL", "GASTOS", "DESESTIMADO", "BAJA", "CADUCADO"].some(function (status) {
        return intEst.includes(status) || extEst.includes(status);
      });
      var isConfirmed = intEst.includes("CONFIRM") || extEst.includes("CONFIRM");
      var departureStr = g.Salida || g.Entrada || "";
      var isPast = departureStr && departureStr < todayStr;

      // Filtro por Pestaña
      if (filterTab === 'confirmados' && !isConfirmed) return false;
      if (filterTab === 'desestimados' && !isCancelled) return false;
      if (filterTab === 'activos') {
        var isActiveStatus = ["PRESUPUESTO", "PENDIENTE", "ENVIADO", "SEGUIMIENTO"].some(function (s) {
          return intEst.includes(s);
        });
        if (isCancelled || isConfirmed || isPast && !isActiveStatus) return false;
      }

      // Filtro de Búsqueda (usar debouncedSearchTerm)
      if (debouncedSearchTerm) {
        var term = debouncedSearchTerm.toLowerCase();
        var groupName = (g["Nombre del Grupo"] || "").toLowerCase();
        var agency = (g["Empresa/Agencia"] || "").toLowerCase();
        var resId = String(g.Reserva || "").toLowerCase();
        var fullId = (g.uid || "").toLowerCase();
        if (!groupName.includes(term) && !agency.includes(term) && !resId.includes(term) && !fullId.includes(term)) return false;
      }

      // Filtro de Fecha (Rango Manual)
      if (startDate || endDate) {
        var entry = toInputDate(g.Entrada);
        if (!entry) return false;
        if (startDate && entry < startDate) return false;
        if (endDate && entry > endDate) return false;
      }
      return true;
    }).sort(function (a, b) {
      var _a$createdAt, _b$createdAt;
      var dateA = (_a$createdAt = a.createdAt) !== null && _a$createdAt !== void 0 && _a$createdAt.seconds ? a.createdAt.seconds : a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0;
      var dateB = (_b$createdAt = b.createdAt) !== null && _b$createdAt !== void 0 && _b$createdAt.seconds ? b.createdAt.seconds : b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0;
      return dateB - dateA;
    });
  }, [groups, filterTab, debouncedSearchTerm, startDate, endDate]);
  var handleHotelChange = function handleHotelChange(e) {
    setFormData(_objectSpread(_objectSpread({}, formData), {}, {
      Hotel_Asignado: e.target.value,
      roomCounts: {},
      dailyConfig: {}
    }));
  };
  var handleRoomCountChange = function handleRoomCountChange(type, value) {
    var newRoomCounts = _objectSpread(_objectSpread({}, formData.roomCounts || {}), {}, _defineProperty({}, type, Number(value)));
    // Auto-calcular PAX total
    var totalPax = Object.entries(newRoomCounts).reduce(function (sum, _ref17) {
      var _ref18 = _slicedToArray(_ref17, 2),
        roomType = _ref18[0],
        count = _ref18[1];
      return sum + (count || 0) * (PAX_PER_ROOM[roomType] || 2);
    }, 0);
    setFormData(_objectSpread(_objectSpread({}, formData), {}, {
      roomCounts: newRoomCounts,
      "Pax.": totalPax
    }));
  };
  var handleDailyConfigChange = function handleDailyConfigChange(date, field, value) {
    var roomType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    setFormData(function (prev) {
      var newDailyConfig = _objectSpread({}, prev.dailyConfig || {});
      if (!newDailyConfig[date]) {
        newDailyConfig[date] = {
          board: 'AD (Alojamiento y Desayuno)',
          prices: {},
          counts: {},
          gratuities: {}
        };
      }
      if (roomType) {
        newDailyConfig[date][field] = _objectSpread(_objectSpread({}, newDailyConfig[date][field] || {}), {}, _defineProperty({}, roomType, value === '' ? '' : Number(value)));
      } else {
        newDailyConfig[date][field] = value;
      }
      return _objectSpread(_objectSpread({}, prev), {}, {
        dailyConfig: newDailyConfig
      });
    });
  };
  var handleCopyFirstDay = function handleCopyFirstDay() {
    var _formData$dailyConfig;
    var stayDates = getCurrentStayDates(formData);
    if (stayDates.length <= 1) return;
    var firstDate = stayDates[0];
    var firstDayConfig = ((_formData$dailyConfig = formData.dailyConfig) === null || _formData$dailyConfig === void 0 ? void 0 : _formData$dailyConfig[firstDate]) || {};
    var newDailyConfig = _objectSpread({}, formData.dailyConfig || {});
    for (var i = 1; i < stayDates.length; i++) {
      var targetDate = stayDates[i];
      newDailyConfig[targetDate] = JSON.parse(JSON.stringify(firstDayConfig));
    }
    setFormData(function (prev) {
      return _objectSpread(_objectSpread({}, prev), {}, {
        dailyConfig: newDailyConfig
      });
    });
  };
  var handleSave = /*#__PURE__*/function () {
    var _ref19 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(e) {
      var now, formattedDate, hotelAsignado, reservaId, isNew, entrada, releaseDate, d, generatedRoomingList, groupData, uidToUpdate, oldDoc, changes, fieldsToTrack, validUpdateData, fallbackData, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            e.preventDefault();
            now = new Date();
            formattedDate = "".concat(now.getFullYear(), "-").concat(String(now.getMonth() + 1).padStart(2, '0'), "-").concat(String(now.getDate()).padStart(2, '0'), " ").concat(String(now.getHours()).padStart(2, '0'), ":").concat(String(now.getMinutes()).padStart(2, '0')); // Validation: Mandatory Hotel
            hotelAsignado = formData.Hotel_Asignado || formData.Hotel || "";
            if (!(!hotelAsignado || hotelAsignado.toLowerCase().includes("pend") || hotelAsignado.trim() === "")) {
              _context.n = 1;
              break;
            }
            alert("⚠️ Error de Integridad: Debe asignar un hotel válido. No se permiten registros 'Pendientes'.");
            return _context.a(2);
          case 1:
            reservaId = formData.Reserva || "PRES-".concat(Math.floor(100000 + Math.random() * 900000));
            isNew = !formData.uid;
            entrada = String(formData.Entrada || "");
            releaseDate = formData.Com_Vencimiento_Rel || "";
            if (!releaseDate && entrada) {
              d = new Date(entrada);
              if (!isNaN(d.getTime())) {
                d.setDate(d.getDate() - 15);
                releaseDate = d.toISOString().split("T")[0];
              }
            }
            generatedRoomingList = buildRoomingList(formData, formData.RoomingList_JSON || "");
            groupData = _objectSpread(_objectSpread({}, formData), {}, {
              Reserva: reservaId,
              "Com_Vencimiento_Rel": releaseDate,
              "Segment.": formData["Segment."] || "GRUPOS",
              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              "Importe(*)": formatNum(calculateTotal(formData)),
              "RoomingList_JSON": JSON.stringify(generatedRoomingList)
            });
            _context.p = 2;
            if (!isNew) {
              _context.n = 4;
              break;
            }
            groupData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            groupData.Estado = "Presupuesto";
            groupData.tracking = [{
              id: Date.now(),
              date: formattedDate,
              text: "Presupuesto registrado (Alta Manual)."
            }];
            _context.n = 3;
            return db.collection("groups").doc(reservaId).set(groupData);
          case 3:
            _context.n = 6;
            break;
          case 4:
            uidToUpdate = groupData.uid;
            oldDoc = groups.find(function (g) {
              return g.uid === uidToUpdate;
            }); // History Tracking: Detect changes
            changes = [];
            fieldsToTrack = {
              "Nombre del Grupo": "Nombre",
              "Hotel_Asignado": "Hotel",
              "Entrada": "Entrada",
              "Salida": "Salida",
              "Com_Estado_Interno": "Estado",
              "Empresa/Agencia": "Empresa",
              "Pax.": "Pax"
            };
            Object.entries(fieldsToTrack).forEach(function (_ref20) {
              var _ref21 = _slicedToArray(_ref20, 2),
                field = _ref21[0],
                label = _ref21[1];
              if (String(formData[field] || "") !== String(oldDoc[field] || "")) {
                changes.push("".concat(label, ": ").concat(oldDoc[field] || 'vacío', " \u2794 ").concat(formData[field] || 'vacío'));
              }
            });
            if (changes.length > 0) {
              groupData.tracking = [{
                id: Date.now(),
                date: formattedDate,
                text: "ðŸ“ " + changes.join(" | ")
              }].concat(_toConsumableArray(Array.isArray(oldDoc.tracking) ? oldDoc.tracking : []));
            } else {
              groupData.tracking = Array.isArray(oldDoc.tracking) ? oldDoc.tracking : [];
            }
            delete groupData.uid; // evitar guardarlo duplicado en document fields
            validUpdateData = {};
            fallbackData = {}; // Firebase update() no soporta ciertos caracteres en las keys.
            // Extraemos esos campos para guardarlos con set({merge: true})
            Object.keys(groupData).forEach(function (key) {
              if (/[~*/\[\].]/.test(key)) {
                fallbackData[key] = groupData[key];
              } else {
                validUpdateData[key] = groupData[key];
              }
            });

            // Usar update en lugar de set({merge: true}) para que mapas
            // enteros (roomCounts, dailyConfig) se REEMPLACEN, no se deep-mergen.
            if (!(Object.keys(validUpdateData).length > 0)) {
              _context.n = 5;
              break;
            }
            _context.n = 5;
            return db.collection("groups").doc(uidToUpdate).update(validUpdateData);
          case 5:
            if (!(Object.keys(fallbackData).length > 0)) {
              _context.n = 6;
              break;
            }
            _context.n = 6;
            return db.collection("groups").doc(uidToUpdate).set(fallbackData, {
              merge: true
            });
          case 6:
            setCurrentView('dashboard');
            _context.n = 8;
            break;
          case 7:
            _context.p = 7;
            _t = _context.v;
            console.error("Error saving budget:", _t);
            alert("Error al guardar.");
          case 8:
            return _context.a(2);
        }
      }, _callee, null, [[2, 7]]);
    }));
    return function handleSave(_x) {
      return _ref19.apply(this, arguments);
    };
  }();
  var handleOpenDetail = function handleOpenDetail(g) {
    setSelectedGroup(g);
    var intEst = (g.Com_Estado_Interno || "").toUpperCase();
    var extEst = (g.Estado || "").toUpperCase();
    if (intEst.includes("CONFIRM") || extEst.includes("CONFIRM")) {
      setDocMode('confirmacion');
    } else {
      setDocMode('presupuesto');
    }
    setCurrentView('detail');
  };
  var handleTranslateClause = /*#__PURE__*/function () {
    var _ref22 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(idx) {
      var type,
        clauses,
        textToTranslate,
        _prompt,
        translated,
        _args2 = arguments,
        _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            type = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : 'budget';
            clauses = type === 'budget' ? _toConsumableArray(tempClauses) : _toConsumableArray(tempClausesConf);
            textToTranslate = clauses[idx].body.split('[EN]')[0].trim();
            if (textToTranslate) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            _context2.p = 1;
            _prompt = "Traduce el siguiente texto de un presupuesto de hotel al ingl\xE9s. Mant\xE9n un tono profesional y corporativo. Devuelve SOLO el texto traducido, sin comillas ni introducciones: \"".concat(textToTranslate, "\"");
            _context2.n = 2;
            return window.callGemini(_prompt);
          case 2:
            translated = _context2.v;
            if (translated && !translated.includes('ERROR')) {
              clauses[idx].body = "".concat(textToTranslate, " [EN] ").concat(translated.trim());
              if (type === 'budget') setTempClauses(clauses);else setTempClausesConf(clauses);
            } else {
              alert("Error en la traducción: " + translated);
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
    return function handleTranslateClause(_x2) {
      return _ref22.apply(this, arguments);
    };
  }();
  var renderClauseText = function renderClauseText(text) {
    if (!text) return null;
    var parts = text.split('[EN]');
    if (parts.length > 1) {
      return /*#__PURE__*/React.createElement(React.Fragment, null, parts[0], /*#__PURE__*/React.createElement("span", {
        className: "block mt-1.5 text-slate-400 font-medium italic leading-relaxed border-l-2 border-slate-100 pl-3"
      }, parts[1]));
    }
    return text;
  };
  var handleDelete = /*#__PURE__*/function () {
    var _ref23 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(uid) {
      var _t3;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            if (confirm("¿Eliminar este presupuesto?")) {
              _context3.n = 1;
              break;
            }
            return _context3.a(2);
          case 1:
            _context3.p = 1;
            _context3.n = 2;
            return db.collection("groups").doc(uid).delete();
          case 2:
            _context3.n = 4;
            break;
          case 3:
            _context3.p = 3;
            _t3 = _context3.v;
            console.error(_t3);
          case 4:
            return _context3.a(2);
        }
      }, _callee3, null, [[1, 3]]);
    }));
    return function handleDelete(_x3) {
      return _ref23.apply(this, arguments);
    };
  }();
  var updateStatus = /*#__PURE__*/function () {
    var _ref24 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(uid, newStatus) {
      var now, formattedDate, budget, newTracking, _t4;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.p = _context4.n) {
          case 0:
            _context4.p = 0;
            now = new Date();
            formattedDate = "".concat(now.getFullYear(), "-").concat(String(now.getMonth() + 1).padStart(2, '0'), "-").concat(String(now.getDate()).padStart(2, '0'), " ").concat(String(now.getHours()).padStart(2, '0'), ":").concat(String(now.getMinutes()).padStart(2, '0'));
            budget = groups.find(function (g) {
              return g.uid === uid;
            });
            newTracking = [{
              id: Date.now(),
              date: formattedDate,
              text: "Estado -> ".concat(newStatus)
            }].concat(_toConsumableArray(Array.isArray(budget.tracking) ? budget.tracking : []));
            _context4.n = 1;
            return db.collection("groups").doc(uid).update({
              Com_Estado_Interno: newStatus,
              tracking: newTracking
            });
          case 1:
            _context4.n = 3;
            break;
          case 2:
            _context4.p = 2;
            _t4 = _context4.v;
            console.error(_t4);
          case 3:
            return _context4.a(2);
        }
      }, _callee4, null, [[0, 2]]);
    }));
    return function updateStatus(_x4, _x5) {
      return _ref24.apply(this, arguments);
    };
  }();
  var addTrackingNote = /*#__PURE__*/function () {
    var _ref25 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(e) {
      var now, formattedDate, newTracking, _t5;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.p = _context5.n) {
          case 0:
            e.preventDefault();
            if (!(!newNote.trim() || !selectedGroup)) {
              _context5.n = 1;
              break;
            }
            return _context5.a(2);
          case 1:
            _context5.p = 1;
            now = new Date();
            formattedDate = "".concat(now.getFullYear(), "-").concat(String(now.getMonth() + 1).padStart(2, '0'), "-").concat(String(now.getDate()).padStart(2, '0'), " ").concat(String(now.getHours()).padStart(2, '0'), ":").concat(String(now.getMinutes()).padStart(2, '0'));
            newTracking = [{
              id: Date.now(),
              date: formattedDate,
              text: newNote
            }].concat(_toConsumableArray(Array.isArray(selectedGroup.tracking) ? selectedGroup.tracking : []));
            _context5.n = 2;
            return db.collection("groups").doc(selectedGroup.uid).update({
              tracking: newTracking
            });
          case 2:
            setNewNote('');
            _context5.n = 4;
            break;
          case 3:
            _context5.p = 3;
            _t5 = _context5.v;
            console.error(_t5);
          case 4:
            return _context5.a(2);
        }
      }, _callee5, null, [[1, 3]]);
    }));
    return function addTrackingNote(_x6) {
      return _ref25.apply(this, arguments);
    };
  }();
  var addQuickNote = /*#__PURE__*/function () {
    var _ref26 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(uid, note) {
      var now, formattedDate, budget, newTracking, _t6;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.p = _context6.n) {
          case 0:
            if (note.trim()) {
              _context6.n = 1;
              break;
            }
            return _context6.a(2);
          case 1:
            _context6.p = 1;
            now = new Date();
            formattedDate = "".concat(now.getFullYear(), "-").concat(String(now.getMonth() + 1).padStart(2, '0'), "-").concat(String(now.getDate()).padStart(2, '0'), " ").concat(String(now.getHours()).padStart(2, '0'), ":").concat(String(now.getMinutes()).padStart(2, '0'));
            budget = groups.find(function (g) {
              return g.uid === uid;
            });
            newTracking = [{
              id: Date.now(),
              date: formattedDate,
              text: note
            }].concat(_toConsumableArray(Array.isArray(budget.tracking) ? budget.tracking : []));
            _context6.n = 2;
            return db.collection("groups").doc(uid).update({
              tracking: newTracking
            });
          case 2:
            _context6.n = 4;
            break;
          case 3:
            _context6.p = 3;
            _t6 = _context6.v;
            console.error(_t6);
          case 4:
            return _context6.a(2);
        }
      }, _callee6, null, [[1, 3]]);
    }));
    return function addQuickNote(_x7, _x8) {
      return _ref26.apply(this, arguments);
    };
  }();

  // --- VISTAS ---
  var renderDashboard = function renderDashboard() {
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-4 gap-4 hidden"
    }), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "text-xl font-black text-slate-800"
    }, "Seguimiento de Cotizaciones"), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-4 mt-3"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setFilterTab('activos');
      },
      className: "text-[9px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ".concat(filterTab === 'activos' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600')
    }, "Activos"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setFilterTab('confirmados');
      },
      className: "text-[9px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ".concat(filterTab === 'confirmados' ? 'text-emerald-600 border-emerald-600' : 'text-slate-400 border-transparent hover:text-slate-600')
    }, "Confirmados"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setFilterTab('desestimados');
      },
      className: "text-[9px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ".concat(filterTab === 'desestimados' ? 'text-rose-600 border-rose-600' : 'text-slate-400 border-transparent hover:text-slate-600')
    }, "Desestimados")), (globalConfig === null || globalConfig === void 0 ? void 0 : globalConfig.lastImportDate) && /*#__PURE__*/React.createElement("p", {
      className: "text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2"
    }, "\xDAltima Importaci\xF3n: ", /*#__PURE__*/React.createElement("span", {
      className: "text-indigo-500"
    }, new Date(globalConfig.lastImportDate).toLocaleString("es-ES")))), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-2 w-full sm:w-auto"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setFormData(DEFAULT_FORM_DATA);
        setCurrentView('create');
      },
      className: "flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-pencil-alt"
    }), " Crear Manual"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return window.location.href = 'AltaEmail.html';
      },
      className: "flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all text-sm font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-sparkles"
    }), " Alta con IA"))), /*#__PURE__*/React.createElement("div", {
      className: "px-6 py-4 border-b border-slate-100 flex flex-wrap gap-4 items-center bg-slate-50/30"
    }, /*#__PURE__*/React.createElement("div", {
      className: "relative w-full sm:w-80"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
    }), /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: "Buscar por grupo, agencia o ID...",
      className: "w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm",
      value: searchTerm,
      onChange: function onChange(e) {
        return setSearchTerm(e.target.value);
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-calendar-alt text-slate-400 text-xs"
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest"
    }, "Desde:"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      className: "bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none w-[130px]",
      value: startDate,
      onChange: function onChange(e) {
        return setStartDate(e.target.value);
      }
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest"
    }, "Hasta:"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      className: "bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none w-[130px]",
      value: endDate,
      onChange: function onChange(e) {
        return setEndDate(e.target.value);
      }
    })), (startDate || endDate || searchTerm) && /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setStartDate('');
        setEndDate('');
        setSearchTerm('');
      },
      className: "ml-2 p-1.5 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 hover:bg-rose-500 hover:text-white transition-all",
      title: "Limpiar filtros"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-times-circle"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "overflow-x-auto"
    }, /*#__PURE__*/React.createElement("table", {
      className: "w-full text-left border-collapse min-w-[1100px]"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      className: "bg-slate-50/50 border-b border-slate-100"
    }, /*#__PURE__*/React.createElement("th", {
      className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest min-w-[320px]"
    }, "Grupo / Hotel"), /*#__PURE__*/React.createElement("th", {
      className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest"
    }, "Entrada"), /*#__PURE__*/React.createElement("th", {
      className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center"
    }, "L\xEDmite 7d"), /*#__PURE__*/React.createElement("th", {
      className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest"
    }, "Importe"), /*#__PURE__*/React.createElement("th", {
      className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center"
    }, "Pax / Hab"), /*#__PURE__*/React.createElement("th", {
      className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest min-w-[200px]"
    }, "Gesti\xF3n"), /*#__PURE__*/React.createElement("th", {
      className: "px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center"
    }, "Estado"), /*#__PURE__*/React.createElement("th", {
      className: "px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right"
    }, "Acciones"))), /*#__PURE__*/React.createElement("tbody", {
      className: "divide-y divide-slate-50"
    }, processedGroups.map(function (g) {
      var totalAmount = g._totalAmount;
      var totalPaidFromPlan = 0;
      try {
        var plan = JSON.parse(g.PaymentPlan_JSON || "[]");
        totalPaidFromPlan = plan.filter(function (item) {
          return item.status === "Cobrado";
        }).reduce(function (sum, item) {
          return sum + (parseFloat(item.amount) || 0);
        }, 0);
      } catch (e) {}
      var manualPaid = parseFloat(g.Com_Pagado || 0);
      var totalPaid = Math.max(manualPaid, totalPaidFromPlan);
      var pendingAmount = Math.max(0, totalAmount - totalPaid);
      var hotelName = g.Hotel_Asignado || g.Hotel || "N/A";
      var isCumbria = hotelName.toLowerCase().includes("cumbria");
      var normalizedRooms = {};
      Object.entries(g.roomCounts || {}).forEach(function (_ref27) {
        var _ref28 = _slicedToArray(_ref27, 2),
          t = _ref28[0],
          c = _ref28[1];
        if (c > 0) {
          var lower = t.toLowerCase();
          if (normalizedRooms[lower]) {
            normalizedRooms[lower].count += Number(c);
          } else {
            normalizedRooms[lower] = {
              type: t,
              count: Number(c)
            };
          }
        }
      });
      var paxCount = g["Pax."] || 0;
      var statusColor = getStatusColor(g.Com_Estado_Interno || g.Estado);
      return /*#__PURE__*/React.createElement("tr", {
        key: g.uid,
        className: "hover:bg-slate-50/50 transition-colors group"
      }, /*#__PURE__*/React.createElement("td", {
        className: "px-6 py-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-slate-100 overflow-hidden p-1 shadow-sm group-hover:scale-105 transition-transform"
      }, /*#__PURE__*/React.createElement("img", {
        src: hotelName.toLowerCase().includes('cumbria') ? "Logos/Cumbria Spa&Hotel.jpg" : "Logos/Sercotel Guadiana.jpg",
        className: "w-full h-full object-contain",
        alt: "Hotel"
      })), /*#__PURE__*/React.createElement("div", {
        className: "min-w-0"
      }, /*#__PURE__*/React.createElement("h4", {
        className: "text-sm font-black text-slate-800 uppercase leading-tight truncate group-hover:text-indigo-600 transition-colors"
      }, g["Nombre del Grupo"], /*#__PURE__*/React.createElement("button", {
        onClick: function onClick(e) {
          e.stopPropagation();
          var note = prompt("Añadir nota rápida de seguimiento:");
          if (note) addQuickNote(g.uid, note);
        },
        className: "group relative inline-flex items-center align-middle"
      }, g.Com_Notas || g.tracking && g.tracking.length > 0 ? /*#__PURE__*/React.createElement("i", {
        className: "fas fa-comment-dots text-indigo-500 ml-2 text-xs",
        title: g.Com_Notas || "Ver seguimiento"
      }) : /*#__PURE__*/React.createElement("i", {
        className: "far fa-comment text-slate-200 hover:text-indigo-400 ml-2 text-xs opacity-0 group-hover:opacity-100 transition-all",
        title: "A\xF1adir nota"
      }))), /*#__PURE__*/React.createElement("p", {
        className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 opacity-60"
      }, hotelName, " \u2022 ID: ", g.Reserva)))), /*#__PURE__*/React.createElement("td", {
        className: "px-6 py-4"
      }, /*#__PURE__*/React.createElement("div", {
        onClick: function onClick() {
          return window.location.href = "Gestion-de-Grupos.html?reserva=".concat(g.Reserva);
        },
        className: "inline-flex flex-col cursor-pointer hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-xs font-black text-slate-700"
      }, formatDate(g.Entrada)), /*#__PURE__*/React.createElement("span", {
        className: "text-[8px] font-bold text-slate-400 uppercase tracking-widest"
      }, "Click p/ Gesti\xF3n"))), /*#__PURE__*/React.createElement("td", {
        className: "px-6 py-4 text-center"
      }, function (_g$createdAt) {
        var created = (_g$createdAt = g.createdAt) !== null && _g$createdAt !== void 0 && _g$createdAt.seconds ? new Date(g.createdAt.seconds * 1000) : g.createdAt ? new Date(g.createdAt) : null;
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
        className: "px-6 py-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-col"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-sm font-black text-indigo-600 tracking-tight"
      }, formatNum(totalAmount), "\u20AC"), totalPaid > 0 && /*#__PURE__*/React.createElement("div", {
        className: "flex gap-2 mt-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[8px] font-black text-emerald-600 uppercase"
      }, "P: ", formatNum(totalPaid)), /*#__PURE__*/React.createElement("span", {
        className: "text-[8px] font-black text-rose-600 uppercase"
      }, "D: ", formatNum(pendingAmount))))), /*#__PURE__*/React.createElement("td", {
        className: "px-6 py-4 text-center"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex flex-col items-center gap-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-1 text-slate-700"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-users text-[10px]"
      }), /*#__PURE__*/React.createElement("span", {
        className: "text-xs font-black"
      }, paxCount)), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-1 text-slate-400"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-bed text-[10px]"
      }), function () {
        var activeRooms = Object.values(normalizedRooms).map(function (v) {
          return [v.type, v.count];
        });
        var totalRoomsNumeric = activeRooms.reduce(function (a, _ref29) {
          var _ref30 = _slicedToArray(_ref29, 2),
            _ = _ref30[0],
            b = _ref30[1];
          return a + Number(b);
        }, 0);
        var roomsCountText = totalRoomsNumeric > 0 ? totalRoomsNumeric : g["Cant. Habitaciones"] || g["Habitaciones"] || g["Cant."] || 0;
        return /*#__PURE__*/React.createElement("span", {
          className: "text-[10px] font-bold"
        }, roomsCountText);
      }()))), /*#__PURE__*/React.createElement("td", {
        className: "px-6 py-4"
      }, /*#__PURE__*/React.createElement("div", {
        className: "space-y-1"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 text-slate-400"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-building text-[9px] w-3 text-center"
      }), /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-bold uppercase"
      }, g["Empresa/Agencia"] || "Venta Directa")), /*#__PURE__*/React.createElement("div", {
        className: "flex items-center gap-2 text-indigo-400"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-user-tie text-[9px] w-3 text-center"
      }), /*#__PURE__*/React.createElement("span", {
        className: "text-[9px] font-bold uppercase truncate max-w-[150px]",
        title: "Comercial Asignado"
      }, g["Com_Comercial"] && g["Com_Comercial"].trim() !== "" ? g["Com_Comercial"] : "SIN ASIGNAR")))), /*#__PURE__*/React.createElement("td", {
        className: "px-6 py-4 text-center"
      }, /*#__PURE__*/React.createElement("select", {
        value: (g.Com_Estado_Interno || g.Estado || '').toUpperCase(),
        onChange: function onChange(e) {
          e.stopPropagation();
          updateStatus(g.uid, e.target.value);
        },
        onClick: function onClick(e) {
          return e.stopPropagation();
        },
        className: "".concat(statusColor, " px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border-none outline-none cursor-pointer hover:ring-2 hover:ring-slate-200 transition-all block mx-auto w-fit appearance-none text-center")
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
      }, "Desestimado"), /*#__PURE__*/React.createElement("option", {
        value: "CADUCADO"
      }, "Caducado"))), /*#__PURE__*/React.createElement("td", {
        className: "px-6 py-4 text-right"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
      }, /*#__PURE__*/React.createElement("button", {
        onClick: function onClick(e) {
          e.stopPropagation();
          updateStatus(g.uid, 'CONFIRMADO');
        },
        className: "w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-all",
        title: "Confirmar Grupo"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-check text-xs"
      })), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick() {
          handleOpenDetail(normalizeGroupData(g));
        },
        className: "w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all",
        title: "Ver Ficha"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-external-link-alt text-xs"
      })), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick(e) {
          e.stopPropagation();
          setFormData(normalizeGroupData(g));
          setCurrentView('create');
        },
        className: "w-8 h-8 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all",
        title: "Editar"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-edit text-xs"
      })), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick(e) {
          e.stopPropagation();
          handleDelete(g.uid);
        },
        className: "w-8 h-8 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all",
        title: "Eliminar"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-trash-alt text-xs"
      })))));
    }))), processedGroups.length === 0 && !loading && /*#__PURE__*/React.createElement("div", {
      className: "py-20 text-center"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-database text-slate-200 text-4xl mb-4"
    }), /*#__PURE__*/React.createElement("p", {
      className: "text-slate-400 font-bold uppercase tracking-widest text-xs"
    }, "No hay presupuestos para mostrar")))));
  };
  var renderCreate = function renderCreate() {
    var stayDates = getCurrentStayDates(formData);
    var currentRooms = ROOM_TYPES[formData.Hotel_Asignado] || [];
    return /*#__PURE__*/React.createElement("div", {
      className: "max-w-5xl mx-auto space-y-8 animate-fade-in pb-20"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-4"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setCurrentView('dashboard');
      },
      className: "w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-slate-800 transition-all border border-slate-100 flex-shrink-0"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-arrow-left"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      className: "text-xl font-black text-slate-800 tracking-tight"
    }, formData.uid ? 'Editar Presupuesto' : 'Nueva Cotización de Grupo'), /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1"
    }, "Completa los campos para generar el documento"))), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-center gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2"
    }, "Fase / Estado:"), /*#__PURE__*/React.createElement("select", {
      value: formData.Com_Estado_Interno || 'PRESUPUESTO',
      onChange: function onChange(e) {
        return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          Com_Estado_Interno: e.target.value
        }));
      },
      className: "bg-amber-50 text-amber-700 border-none rounded-xl px-4 py-2 text-xs font-black outline-none ring-2 ring-amber-100 focus:ring-amber-300 transition-all cursor-pointer uppercase"
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
    }, "Desestimado"), /*#__PURE__*/React.createElement("option", {
      value: "CADUCADO"
    }, "Caducado"))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2"
    }, "Hotel:"), /*#__PURE__*/React.createElement("select", {
      value: formData.Hotel_Asignado,
      onChange: function onChange(e) {
        return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          Hotel_Asignado: e.target.value
        }));
      },
      className: "bg-indigo-50 text-indigo-700 border-none rounded-xl px-4 py-2 text-xs font-black outline-none ring-2 ring-indigo-100 focus:ring-indigo-300 transition-all cursor-pointer"
    }, /*#__PURE__*/React.createElement("option", {
      value: "Sercotel Guadiana"
    }, "Sercotel Guadiana"), /*#__PURE__*/React.createElement("option", {
      value: "Cumbria Spa&Hotel"
    }, "Cumbria Spa&Hotel"))))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 gap-8"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 border-b border-slate-50 pb-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-info-circle text-[10px]"
    })), /*#__PURE__*/React.createElement("h3", {
      className: "text-[10px] font-black text-slate-800 uppercase tracking-widest"
    }, "1. Informaci\xF3n del Grupo y Cliente")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
    }, "Nombre del Grupo / Evento"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: formData["Nombre del Grupo"],
      onChange: function onChange(e) {
        return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          "Nombre del Grupo": e.target.value
        }));
      },
      placeholder: "Ej: Boda Garc\xEDa-P\xE9rez o Grupo Jubilados...",
      className: "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
    })), /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
    }, "Empresa / Agencia"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: formData["Empresa/Agencia"],
      onChange: function onChange(e) {
        return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          "Empresa/Agencia": e.target.value
        }));
      },
      placeholder: "Nombre de la agencia o empresa...",
      className: "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-3 gap-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
    }, "Nombre de Contacto"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: formData.Com_Nombre_Contacto,
      onChange: function onChange(e) {
        return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          Com_Nombre_Contacto: e.target.value
        }));
      },
      placeholder: "Persona de contacto...",
      className: "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
    })), /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
    }, "Email"), /*#__PURE__*/React.createElement("input", {
      type: "email",
      value: formData.Com_Email_Contacto,
      onChange: function onChange(e) {
        return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          Com_Email_Contacto: e.target.value
        }));
      },
      placeholder: "email@ejemplo.com",
      className: "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
    })), /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
    }, "Tel\xE9fono"), /*#__PURE__*/React.createElement("input", {
      type: "text",
      value: formData.Com_Telefono_Contacto,
      onChange: function onChange(e) {
        return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          Com_Telefono_Contacto: e.target.value
        }));
      },
      placeholder: "N\xFAmero de tel\xE9fono...",
      className: "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-6 pt-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
    }, "Fecha Entrada"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      value: toInputDate(formData.Entrada),
      onChange: function onChange(e) {
        return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          Entrada: e.target.value
        }));
      },
      className: "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
    })), /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
    }, "Fecha Salida"), /*#__PURE__*/React.createElement("input", {
      type: "date",
      value: toInputDate(formData.Salida),
      onChange: function onChange(e) {
        return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          Salida: e.target.value
        }));
      },
      className: "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-6 h-6 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-bed text-[10px]"
    })), /*#__PURE__*/React.createElement("h3", {
      className: "text-[10px] font-black text-slate-800 uppercase tracking-widest"
    }, "2. Tipolog\xEDa y Cupo de Habitaciones")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
    }, currentRooms.map(function (type) {
      var _formData$roomCounts;
      return /*#__PURE__*/React.createElement("div", {
        key: type,
        className: "bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 group hover:border-emerald-200 transition-all"
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-[9px] font-black text-slate-400 uppercase tracking-widest block truncate",
        title: type
      }, type), /*#__PURE__*/React.createElement("div", {
        className: "relative"
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        value: ((_formData$roomCounts = formData.roomCounts) === null || _formData$roomCounts === void 0 ? void 0 : _formData$roomCounts[type]) || '',
        onChange: function onChange(e) {
          return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
            roomCounts: _objectSpread(_objectSpread({}, formData.roomCounts), {}, _defineProperty({}, type, e.target.value))
          }));
        },
        placeholder: "0",
        className: "w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-700"
      }), /*#__PURE__*/React.createElement("span", {
        className: "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 font-bold uppercase tracking-widest"
      }, "Hab")));
    }))), stayDates.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-6 animate-slide-up"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col md:flex-row md:items-center justify-between gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-calendar-day text-[10px]"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-[10px] font-black text-slate-800 uppercase tracking-widest"
    }, "3. Tarifas por Noche"))), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: handleCopyFirstDay,
      className: "bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-100 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all focus:scale-95",
      title: "Copiar precios y cupos del primer d\xEDa a todos los siguientes"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-copy"
    }), " Copiar 1\xBA D\xEDa a Todos"))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, stayDates.map(function (date) {
      var _formData$dailyConfig5;
      var selectedTypes = currentRooms.filter(function (type) {
        return (formData.roomCounts || {})[type] > 0;
      });
      return /*#__PURE__*/React.createElement("div", {
        key: date,
        className: "group bg-slate-50/50 rounded-xl p-3 border border-slate-100 hover:border-indigo-200 transition-all flex flex-row flex-wrap gap-3 items-center"
      }, /*#__PURE__*/React.createElement("div", {
        className: "shrink-0 w-24 flex flex-col gap-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "bg-slate-800 text-white px-2 py-1 rounded text-[8px] font-black w-fit uppercase tracking-widest"
      }, formatDate(date))), /*#__PURE__*/React.createElement("div", {
        className: "flex-1 flex flex-wrap gap-2 items-center"
      }, selectedTypes.map(function (type) {
        var _formData$dailyConfig2, _formData$dailyConfig3, _formData$dailyConfig4;
        var dailyCounts = ((_formData$dailyConfig2 = formData.dailyConfig) === null || _formData$dailyConfig2 === void 0 || (_formData$dailyConfig2 = _formData$dailyConfig2[date]) === null || _formData$dailyConfig2 === void 0 ? void 0 : _formData$dailyConfig2.counts) || {};
        var countVal = dailyCounts[type] !== undefined ? dailyCounts[type] : (formData.roomCounts || {})[type] || '';
        return /*#__PURE__*/React.createElement("div", {
          key: type,
          className: "flex flex-col gap-0.5 min-w-[120px]"
        }, /*#__PURE__*/React.createElement("label", {
          className: "text-[7px] font-black text-slate-500 uppercase truncate px-1",
          title: type
        }, type), /*#__PURE__*/React.createElement("div", {
          className: "relative group flex gap-1 items-center"
        }, /*#__PURE__*/React.createElement("input", {
          type: "number",
          value: countVal,
          onChange: function onChange(e) {
            return handleDailyConfigChange(date, 'counts', e.target.value, type);
          },
          className: "w-10 px-1 py-1.5 bg-white border border-slate-200 rounded-md text-[10px] font-black text-center outline-none focus:ring-1 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all [&::-webkit-inner-spin-button]:appearance-none",
          placeholder: "Cant.",
          title: "Cantidad de habitaciones"
        }), /*#__PURE__*/React.createElement("span", {
          className: "text-[10px] text-slate-400 font-bold mx-0.5"
        }, "x"), /*#__PURE__*/React.createElement("div", {
          className: "relative group flex w-[68px]"
        }, /*#__PURE__*/React.createElement("input", {
          type: "number",
          value: (((_formData$dailyConfig3 = formData.dailyConfig) === null || _formData$dailyConfig3 === void 0 || (_formData$dailyConfig3 = _formData$dailyConfig3[date]) === null || _formData$dailyConfig3 === void 0 ? void 0 : _formData$dailyConfig3.prices) || {})[type] || '',
          onChange: function onChange(e) {
            return handleDailyConfigChange(date, 'prices', e.target.value, type);
          },
          className: "w-full pl-2 pr-4 py-1.5 bg-white border border-slate-200 rounded-md text-[10px] font-black text-center outline-none focus:ring-1 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all [&::-webkit-inner-spin-button]:appearance-none",
          placeholder: "0",
          title: "Precio"
        }), /*#__PURE__*/React.createElement("span", {
          className: "absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-black"
        }, "\u20AC")), /*#__PURE__*/React.createElement("div", {
          className: "relative group flex w-12 ml-0.5 items-center border border-emerald-100 rounded-md bg-emerald-50 px-1 py-1",
          title: "Gratuidades (Habitaciones Gratis)"
        }, /*#__PURE__*/React.createElement("span", {
          className: "text-[7px] font-black leading-none text-emerald-500 mr-0.5 uppercase tracking-tighter"
        }, "Grat."), /*#__PURE__*/React.createElement("input", {
          type: "number",
          min: "0",
          value: (((_formData$dailyConfig4 = formData.dailyConfig) === null || _formData$dailyConfig4 === void 0 || (_formData$dailyConfig4 = _formData$dailyConfig4[date]) === null || _formData$dailyConfig4 === void 0 ? void 0 : _formData$dailyConfig4.gratuities) || {})[type] || '',
          onChange: function onChange(e) {
            return handleDailyConfigChange(date, 'gratuities', e.target.value, type);
          },
          className: "w-full bg-transparent text-[10px] font-black text-center outline-none text-emerald-700 [&::-webkit-inner-spin-button]:appearance-none placeholder:text-emerald-300",
          placeholder: "0"
        }))));
      })), /*#__PURE__*/React.createElement("div", {
        className: "shrink-0 w-32 flex flex-col gap-0.5"
      }, /*#__PURE__*/React.createElement("label", {
        className: "text-[7px] font-black text-indigo-500 uppercase px-1"
      }, "R\xE9gimen"), /*#__PURE__*/React.createElement("select", {
        value: ((_formData$dailyConfig5 = formData.dailyConfig) === null || _formData$dailyConfig5 === void 0 || (_formData$dailyConfig5 = _formData$dailyConfig5[date]) === null || _formData$dailyConfig5 === void 0 ? void 0 : _formData$dailyConfig5.board) || 'AD (Alojamiento y Desayuno)',
        onChange: function onChange(e) {
          return handleDailyConfigChange(date, 'board', e.target.value);
        },
        className: "w-full bg-indigo-50/30 border border-indigo-100 text-indigo-700 rounded-md px-2 py-1.5 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-indigo-500/10 transition-all cursor-pointer"
      }, BOARD_TYPES.map(function (board) {
        return /*#__PURE__*/React.createElement("option", {
          key: board,
          value: board
        }, board.split(' ')[0]);
      }))));
    }))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col md:flex-row md:items-center justify-between gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-6 h-6 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-tags text-[10px]"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-[10px] font-black text-slate-800 uppercase tracking-widest"
    }, "4. Descuentos y Suplementos")))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
    }, "Suplementos Totales (\u20AC)"), /*#__PURE__*/React.createElement("div", {
      className: "relative group"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      value: formData.Suplementos || '',
      onChange: function onChange(e) {
        return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          Suplementos: e.target.value
        }));
      },
      className: "w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-indigo-600",
      placeholder: "0"
    }), /*#__PURE__*/React.createElement("span", {
      className: "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black"
    }, "\u20AC"))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-1"
    }, /*#__PURE__*/React.createElement("label", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1"
    }, "Descuento Global (\u20AC)"), /*#__PURE__*/React.createElement("div", {
      className: "relative group"
    }, /*#__PURE__*/React.createElement("input", {
      type: "number",
      value: formData.Descuentos || '',
      onChange: function onChange(e) {
        return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          Descuentos: e.target.value
        }));
      },
      className: "w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all text-rose-600",
      placeholder: "0"
    }), /*#__PURE__*/React.createElement("span", {
      className: "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black"
    }, "\u20AC"))))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col md:flex-row md:items-center justify-between gap-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-6 h-6 rounded-lg bg-teal-50 text-teal-500 flex items-center justify-center"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-plus-circle text-[10px]"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-[10px] font-black text-slate-800 uppercase tracking-widest"
    }, "4.5 Otros Cargos / Extras"))), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
        var newExtras = [].concat(_toConsumableArray(formData.extraCharges || []), [{
          id: Date.now(),
          date: '',
          concept: '',
          units: 0,
          pax: 0,
          unitPrice: 0,
          price: 0
        }]);
        setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          extraCharges: newExtras
        }));
      },
      className: "bg-teal-50 hover:bg-teal-100 text-teal-600 px-3 py-1.5 rounded-lg border border-teal-100 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-plus"
    }), " A\xF1adir Cargo")), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, (formData.extraCharges || []).map(function (extra, index) {
      return /*#__PURE__*/React.createElement("div", {
        key: extra.id,
        className: "flex gap-2 items-center group"
      }, /*#__PURE__*/React.createElement("div", {
        className: "w-[130px] relative"
      }, /*#__PURE__*/React.createElement("select", {
        value: extra.date || '',
        onChange: function onChange(e) {
          var newExtras = _toConsumableArray(formData.extraCharges);
          newExtras[index].date = e.target.value;
          setFormData(_objectSpread(_objectSpread({}, formData), {}, {
            extraCharges: newExtras
          }));
        },
        className: "w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-2 text-[11px] font-black outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-slate-700"
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Global / Todas"), stayDates.map(function (d) {
        return /*#__PURE__*/React.createElement("option", {
          key: d,
          value: d
        }, d);
      }))), /*#__PURE__*/React.createElement("div", {
        className: "flex-1 min-w-[150px] relative"
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: extra.concept,
        onChange: function onChange(e) {
          var newExtras = _toConsumableArray(formData.extraCharges);
          newExtras[index].concept = e.target.value;
          setFormData(_objectSpread(_objectSpread({}, formData), {}, {
            extraCharges: newExtras
          }));
        },
        placeholder: "Concepto (ej: Almuerzo...)",
        className: "w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[11px] font-black outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-slate-700"
      })), /*#__PURE__*/React.createElement("div", {
        className: "w-14 relative"
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        value: extra.units !== undefined ? extra.units : '',
        onChange: function onChange(e) {
          var newExtras = _toConsumableArray(formData.extraCharges);
          var u = Number(e.target.value) || 0;
          newExtras[index].units = u;
          var up = newExtras[index].unitPrice || 0;
          newExtras[index].price = u * up;
          setFormData(_objectSpread(_objectSpread({}, formData), {}, {
            extraCharges: newExtras
          }));
        },
        placeholder: "Uds",
        className: "w-full px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-black outline-none transition-all text-center"
      })), /*#__PURE__*/React.createElement("div", {
        className: "w-20 md:w-24 relative"
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        step: "0.01",
        value: extra.unitPrice !== undefined ? extra.unitPrice : 0,
        onChange: function onChange(e) {
          var newExtras = _toConsumableArray(formData.extraCharges);
          var up = parseFloat(e.target.value) || 0;
          newExtras[index].unitPrice = up;
          var u = newExtras[index].units || 0;
          var pax = newExtras[index].pax || 0;
          var activeQty = u > 0 ? u : pax;
          newExtras[index].price = activeQty * up;
          setFormData(_objectSpread(_objectSpread({}, formData), {}, {
            extraCharges: newExtras
          }));
        },
        placeholder: "0.00",
        className: "w-full pl-2 pr-5 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[11px] font-black outline-none focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-slate-700 text-right"
      }), /*#__PURE__*/React.createElement("span", {
        className: "absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-bold"
      }, "\u20AC")), /*#__PURE__*/React.createElement("div", {
        className: "w-20 md:w-24 px-2 py-2 bg-teal-50/50 border border-teal-100 rounded-lg text-[11px] font-black text-teal-700 text-right"
      }, formatNum((extra.units || extra.pax || 0) * (extra.unitPrice || 0)), " \u20AC"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: function onClick() {
          var newExtras = formData.extraCharges.filter(function (_, i) {
            return i !== index;
          });
          setFormData(_objectSpread(_objectSpread({}, formData), {}, {
            extraCharges: newExtras
          }));
        },
        className: "w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex-shrink-0"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-trash text-xs"
      })));
    }))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-6 h-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-file-signature text-[10px]"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
      className: "text-[10px] font-black text-slate-800 uppercase tracking-widest"
    }, "5. Cl\xE1usulas de Documentos"), /*#__PURE__*/React.createElement("p", {
      className: "text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5"
    }, "Define las condiciones legales para este grupo"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 gap-8"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-file-invoice text-indigo-400"
    }), " Presupuesto"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
        var current = Array.isArray(formData.clauses) && formData.clauses.length > 0 ? formData.clauses : BUDGET_DEFAULT_CLAUSES;
        setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          clauses: [].concat(_toConsumableArray(current), [{
            title: "Nueva Cláusula",
            body: ""
          }])
        }));
      },
      className: "text-[8px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
    }, "+ A\xF1adir")), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, (Array.isArray(formData.clauses) && formData.clauses.length > 0 ? formData.clauses : BUDGET_DEFAULT_CLAUSES).map(function (c, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        className: "bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 relative group"
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: c.title,
        onChange: function onChange(e) {
          var n = _toConsumableArray(Array.isArray(formData.clauses) && formData.clauses.length > 0 ? formData.clauses : BUDGET_DEFAULT_CLAUSES);
          n[i].title = e.target.value;
          setFormData(_objectSpread(_objectSpread({}, formData), {}, {
            clauses: n
          }));
        },
        className: "w-full bg-white border border-slate-200 rounded px-2 py-1 text-[9px] font-black text-slate-800 outline-none focus:border-indigo-400",
        placeholder: "T\xEDtulo de la cl\xE1usula"
      }), /*#__PURE__*/React.createElement("textarea", {
        value: c.body,
        onChange: function onChange(e) {
          var n = _toConsumableArray(Array.isArray(formData.clauses) && formData.clauses.length > 0 ? formData.clauses : BUDGET_DEFAULT_CLAUSES);
          n[i].body = e.target.value;
          setFormData(_objectSpread(_objectSpread({}, formData), {}, {
            clauses: n
          }));
        },
        rows: "2",
        className: "w-full bg-white border border-slate-200 rounded px-2 py-1 text-[9px] text-slate-600 outline-none focus:border-indigo-400 resize-none font-medium",
        placeholder: "Contenido..."
      }), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: function onClick() {
          var n = (Array.isArray(formData.clauses) && formData.clauses.length > 0 ? formData.clauses : BUDGET_DEFAULT_CLAUSES).filter(function (_, idx) {
            return idx !== i;
          });
          setFormData(_objectSpread(_objectSpread({}, formData), {}, {
            clauses: n
          }));
        },
        className: "absolute -top-2 -right-2 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-times text-[8px]"
      })));
    }))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between"
    }, /*#__PURE__*/React.createElement("h4", {
      className: "text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-file-check text-emerald-500"
    }), " Confirmaci\xF3n"), /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
        var current = Array.isArray(formData.clauses_conf) && formData.clauses_conf.length > 0 ? formData.clauses_conf : CONF_DEFAULT_CLAUSES;
        setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          clauses_conf: [].concat(_toConsumableArray(current), [{
            title: "Nueva Cláusula Conf.",
            body: ""
          }])
        }));
      },
      className: "text-[8px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
    }, "+ A\xF1adir")), /*#__PURE__*/React.createElement("div", {
      className: "space-y-3"
    }, (Array.isArray(formData.clauses_conf) && formData.clauses_conf.length > 0 ? formData.clauses_conf : CONF_DEFAULT_CLAUSES).map(function (c, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        className: "bg-emerald-50/30 p-3 rounded-xl border border-emerald-100/50 space-y-2 relative group"
      }, /*#__PURE__*/React.createElement("input", {
        type: "text",
        value: c.title,
        onChange: function onChange(e) {
          var n = _toConsumableArray(Array.isArray(formData.clauses_conf) && formData.clauses_conf.length > 0 ? formData.clauses_conf : CONF_DEFAULT_CLAUSES);
          n[i].title = e.target.value;
          setFormData(_objectSpread(_objectSpread({}, formData), {}, {
            clauses_conf: n
          }));
        },
        className: "w-full bg-white border border-slate-200 rounded px-2 py-1 text-[9px] font-black text-slate-800 outline-none focus:border-emerald-400",
        placeholder: "T\xEDtulo de la cl\xE1usula"
      }), /*#__PURE__*/React.createElement("textarea", {
        value: c.body,
        onChange: function onChange(e) {
          var n = _toConsumableArray(formData.clauses_conf && formData.clauses_conf.length > 0 ? formData.clauses_conf : CONF_DEFAULT_CLAUSES);
          n[i].body = e.target.value;
          setFormData(_objectSpread(_objectSpread({}, formData), {}, {
            clauses_conf: n
          }));
        },
        rows: "2",
        className: "w-full bg-white border border-slate-200 rounded px-2 py-1 text-[9px] text-slate-600 outline-none focus:border-emerald-400 resize-none font-medium",
        placeholder: "Contenido..."
      }), /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: function onClick() {
          var n = (formData.clauses_conf && formData.clauses_conf.length > 0 ? formData.clauses_conf : CONF_DEFAULT_CLAUSES).filter(function (_, idx) {
            return idx !== i;
          });
          setFormData(_objectSpread(_objectSpread({}, formData), {}, {
            clauses_conf: n
          }));
        },
        className: "absolute -top-2 -right-2 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
      }, /*#__PURE__*/React.createElement("i", {
        className: "fas fa-times text-[8px]"
      })));
    }))))), /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-6 h-6 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-notes-medical text-[10px]"
    })), /*#__PURE__*/React.createElement("h3", {
      className: "text-[10px] font-black text-slate-800 uppercase tracking-widest"
    }, "6. Notas Internas & Seguimiento")), /*#__PURE__*/React.createElement("textarea", {
      value: formData.Com_Notas,
      onChange: function onChange(e) {
        return setFormData(_objectSpread(_objectSpread({}, formData), {}, {
          Com_Notas: e.target.value
        }));
      },
      placeholder: "A\xF1ade detalles relevantes...",
      className: "w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-medium text-slate-600 outline-none focus:border-indigo-500 min-h-[80px] resize-none transition-all shadow-sm"
    })), /*#__PURE__*/React.createElement("div", {
      className: "flex gap-3 justify-end pt-2"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick() {
        return setCurrentView('dashboard');
      },
      className: "px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all"
    }, "Cancelar"), /*#__PURE__*/React.createElement("button", {
      onClick: handleSave,
      className: "bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-200/50"
    }, "Guardar Cotizaci\xF3n"))));
  };
  var HOTEL_DEFAULTS = {
    guadiana: {
      address: 'C/ Guadiana, 36',
      city: '13002 - Ciudad Real (España)',
      phone: '926 22 33 13',
      email: 'info@hotelguadiana.es',
      web: 'www.hotelguadiana.es'
    },
    cumbria: {
      address: 'Ctra. Toledo, 26',
      city: '13005 - Ciudad Real (España)',
      phone: '(+34) 926 25 04 04',
      email: 'recepcion@hotelcumbria.es',
      web: 'www.hotelcumbria.es'
    }
  };
  var renderDetail = function renderDetail() {
    if (!selectedGroup) return null;
    var g = normalizeGroupData(selectedGroup);
    var mergedForTotal = _objectSpread(_objectSpread({}, g), formData);
    var calculatedTotal = calculateTotal(mergedForTotal);
    var hotelName = g.Hotel_Asignado || g.Hotel || "N/A";
    var isCumbria = hotelName.toLowerCase().includes("cumbria");
    var hotelKey = isCumbria ? 'cumbria' : 'guadiana';
    var modeKey = docMode === 'confirmacion' ? 'confirmationClauses' : 'clauses';
    var groupKey = docMode === 'confirmacion' ? 'clauses_conf' : 'clauses';

    // Lógica de Fallback Multinivel para Cláusulas
    var getEffectiveClauses = function getEffectiveClauses() {
      if (Array.isArray(g[groupKey]) && g[groupKey].length > 0) return g[groupKey];
      if (globalConfig && globalConfig[hotelKey] && Array.isArray(globalConfig[hotelKey][modeKey]) && globalConfig[hotelKey][modeKey].length > 0) return globalConfig[hotelKey][modeKey];
      if (globalConfig && globalConfig.common && Array.isArray(globalConfig.common[modeKey]) && globalConfig.common[modeKey].length > 0) return globalConfig.common[modeKey];
      return docMode === 'confirmacion' ? CONF_DEFAULT_CLAUSES : BUDGET_DEFAULT_CLAUSES;
    };
    var effectiveClauses = getEffectiveClauses();

    // Función auxiliar para reemplazo de variables
    var parseClauseVariables = function parseClauseVariables(text) {
      var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
      if (!text) return "";
      var parsed = text;

      // Cargar plan de pagos
      var plan = [];
      try {
        plan = JSON.parse(g.PaymentPlan_JSON || "[]");
      } catch (e) {}
      var t = title.toLowerCase();
      var isDepositOrPayment = t.includes("depósito") || t.includes("deposito") || t.includes("pago") || t.includes("confirmaci");
      if (plan && plan.length > 0 && isDepositOrPayment) {
        var firstPayment = plan[0];
        var secondPayment = plan[1];

        // Reemplazar 30% estático con el depósito real
        parsed = parsed.replace(/30\s*%/g, firstPayment.percent + "% (" + formatNum(firstPayment.amount) + "€)");
        parsed = parsed.replace(/{DEP_30}/g, firstPayment.percent + "% (" + formatNum(firstPayment.amount) + "€)");
        if (secondPayment) {
          // Reemplazar 7 días o 7 dias con la antelación real
          parsed = parsed.replace(/7\s*días/gi, secondPayment.releaseDays + " días");
          parsed = parsed.replace(/7\s*dias/gi, secondPayment.releaseDays + " días");
          parsed = parsed.replace(/{RELEASE_7}/g, secondPayment.releaseDays + " días");

          // Reemplazar 50% o 100% estático con el segundo pago real
          parsed = parsed.replace(/50\s*%/g, secondPayment.percent + "% (" + formatNum(secondPayment.amount) + "€)");
          parsed = parsed.replace(/{DEP_50}/g, secondPayment.percent + "% (" + formatNum(secondPayment.amount) + "€)");
          parsed = parsed.replace(/100\s*%/g, secondPayment.percent + "% (" + formatNum(secondPayment.amount) + "€)");
          parsed = parsed.replace(/{DEP_100}/g, secondPayment.percent + "% (" + formatNum(secondPayment.amount) + "€)");
        }
      }
      parsed = parsed.replace(/{DEP_30}/g, formatNum(calculatedTotal * 0.3) + '€');
      parsed = parsed.replace(/{DEP_50}/g, formatNum(calculatedTotal * 0.5) + '€');
      parsed = parsed.replace(/{DEP_100}/g, formatNum(calculatedTotal) + '€');
      var getRelDate = function getRelDate(days) {
        if (!g.Entrada) return "[FECHA]";
        var d = new Date(g.Entrada);
        d.setDate(d.getDate() - days);
        return d.toLocaleDateString('es-ES');
      };
      parsed = parsed.replace(/{RELEASE_30}/g, getRelDate(30));
      parsed = parsed.replace(/{RELEASE_15}/g, getRelDate(15));
      parsed = parsed.replace(/{RELEASE_7}/g, getRelDate(7));
      return parsed;
    };
    var activeRoomsMap = Object.entries(g.roomCounts || {}).reduce(function (acc, _ref31) {
      var _ref32 = _slicedToArray(_ref31, 2),
        type = _ref32[0],
        count = _ref32[1];
      if (count > 0) {
        var _acc$lowerType, _acc$lowerType2;
        var lowerType = type.toLowerCase();
        acc[lowerType] = {
          original: ((_acc$lowerType = acc[lowerType]) === null || _acc$lowerType === void 0 ? void 0 : _acc$lowerType.original) || type,
          count: (((_acc$lowerType2 = acc[lowerType]) === null || _acc$lowerType2 === void 0 ? void 0 : _acc$lowerType2.count) || 0) + Number(count)
        };
      }
      return acc;
    }, {});
    var activeRooms = Object.values(activeRoomsMap).map(function (v) {
      return [v.original, v.count];
    });
    var dates = getCurrentStayDates(g);
    var calculatedPax = 0;
    activeRooms.forEach(function (_ref33) {
      var _ref34 = _slicedToArray(_ref33, 2),
        type = _ref34[0],
        c = _ref34[1];
      var t = type.toUpperCase();
      var multiplier = 2;
      if (t.includes('INDIVIDUAL') || t.includes('DUI') || t.includes('SINGLE')) multiplier = 1;else if (t.includes('TRIPLE')) multiplier = 3;else if (t.includes('CUADRUPLE') || t.includes('CUÁDRUPLE') || t.includes('FAMILIAR')) multiplier = 4;else if (t.includes('QUINTUPLE')) multiplier = 5;
      calculatedPax += multiplier * c;
    });
    var totalPax = calculatedPax > 0 ? calculatedPax : g["Pax."] || 0;
    return /*#__PURE__*/React.createElement("div", {
      className: "space-y-6 animate-fade-in max-w-7xl mx-auto pb-10"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-4"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setCurrentView('dashboard');
      },
      className: "w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 hover:text-slate-800 transition-all border border-slate-100 flex-shrink-0"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-arrow-left"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      className: "text-[10px] font-black text-indigo-600 uppercase tracking-widest block mb-1"
    }, hotelName, " ", g.Reserva ? "\u2022 ".concat(g.Reserva) : ''), /*#__PURE__*/React.createElement("h2", {
      className: "text-2xl font-black text-slate-800 tracking-tight leading-none"
    }, g["Nombre del Grupo"]), /*#__PURE__*/React.createElement("div", {
      className: "mt-2 flex flex-col gap-1.5"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-slate-400 flex flex-wrap items-center gap-3"
    }, /*#__PURE__*/React.createElement("span", {
      className: "flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement("i", {
      className: "far fa-calendar text-slate-300"
    }), " ", formatDate(g.Entrada), " a ", formatDate(g.Salida)), /*#__PURE__*/React.createElement("span", {
      className: "text-slate-200"
    }, "|"), /*#__PURE__*/React.createElement("span", {
      className: "flex items-center gap-1.5"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-users text-slate-300"
    }), " ", totalPax, " pax"), /*#__PURE__*/React.createElement("span", {
      className: "text-slate-200"
    }, "|"), /*#__PURE__*/React.createElement("span", {
      className: "text-indigo-600 font-bold"
    }, formatNum(calculatedTotal), " \u20AC")), (g.Com_Email_Contacto || g.Email || g.Com_Telefono_Contacto || g.Telefono || g["Tel\xC3\xA9fono"] || g.Com_Nombre_Contacto || g.Persona_Contacto) && /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] text-slate-400 font-bold uppercase tracking-tight flex flex-wrap items-center gap-x-4 gap-y-1"
    }, (g.Com_Nombre_Contacto || g.Persona_Contacto) && /*#__PURE__*/React.createElement("span", {
      className: "flex items-center gap-1.5 text-slate-500"
    }, /*#__PURE__*/React.createElement("i", {
      className: "far fa-user text-slate-300"
    }), " ", g.Com_Nombre_Contacto || g.Persona_Contacto), (g.Com_Email_Contacto || g.Email) && /*#__PURE__*/React.createElement("a", {
      href: "mailto:".concat(g.Com_Email_Contacto || g.Email),
      className: "flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
    }, /*#__PURE__*/React.createElement("i", {
      className: "far fa-envelope text-slate-300"
    }), " ", g.Com_Email_Contacto || g.Email), (g.Com_Telefono_Contacto || g.Telefono || g["Tel\xC3\xA9fono"]) && /*#__PURE__*/React.createElement("a", {
      href: "tel:".concat(g.Com_Telefono_Contacto || g.Telefono || g["Tel\xC3\xA9fono"]),
      className: "flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-phone-alt text-slate-300 text-[8px]"
    }), " ", g.Com_Telefono_Contacto || g.Telefono || g["Tel\xC3\xA9fono"]))))), /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2"
    }, "Fase Actual:"), /*#__PURE__*/React.createElement("select", {
      value: (g.Com_Estado_Interno || g.Estado || '').toUpperCase(),
      onChange: function onChange(e) {
        var newStatus = e.target.value;
        updateStatus(g.uid, newStatus);
        setSelectedGroup(_objectSpread(_objectSpread({}, g), {}, {
          Com_Estado_Interno: newStatus
        }));
      },
      className: "bg-white text-indigo-700 border border-slate-200 rounded-xl px-4 py-2 text-[10px] font-black outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer uppercase"
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
    }, "Desestimado"), /*#__PURE__*/React.createElement("option", {
      value: "CADUCADO"
    }, "Caducado"))), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setFormData(g);
        setCurrentView('create');
      },
      className: "flex-1 md:flex-none px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-edit"
    }), " Editar Datos"))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
    }, /*#__PURE__*/React.createElement("div", {
      className: "lg:col-span-4 space-y-6 print:hidden"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 border-b border-slate-100 pb-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-users text-sm"
    })), /*#__PURE__*/React.createElement("h3", {
      className: "text-[10px] font-black text-slate-800 uppercase tracking-widest"
    }, "Datos de Contacto")), /*#__PURE__*/React.createElement("div", {
      className: "space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-slate-50 p-4 rounded-2xl border border-slate-100/50"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2"
    }, "Empresa / Agencia"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm font-black text-slate-800 uppercase"
    }, g["Empresa/Agencia"] || "Venta Directa")), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 gap-4"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
    }, "Contacto"), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-xl"
    }, /*#__PURE__*/React.createElement("i", {
      className: "far fa-user text-indigo-400"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-bold text-slate-600"
    }, g.Com_Nombre_Contacto || g.Persona_Contacto || "No indicado"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
    }, "Email"), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3 bg-white border border-slate-100 p-3 rounded-xl overflow-hidden"
    }, /*#__PURE__*/React.createElement("i", {
      className: "far fa-envelope text-indigo-400"
    }), /*#__PURE__*/React.createElement("span", {
      className: "text-xs font-bold text-slate-600 truncate"
    }, g.Com_Email_Contacto || g.Email || "No indicado")))))), /*#__PURE__*/React.createElement("div", {
      className: "bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex flex-col h-full max-h-[600px]"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between mb-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-history text-sm"
    })), /*#__PURE__*/React.createElement("h3", {
      className: "text-[10px] font-black text-white uppercase tracking-widest"
    }, "Muro de Seguimiento")), /*#__PURE__*/React.createElement("span", {
      className: "text-[8px] font-black text-slate-500 uppercase"
    }, (Array.isArray(g.tracking) ? g.tracking : []).length, " Entradas")), /*#__PURE__*/React.createElement("form", {
      onSubmit: addTrackingNote,
      className: "mb-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "relative group"
    }, /*#__PURE__*/React.createElement("textarea", {
      value: newNote,
      onChange: function onChange(e) {
        return setNewNote(e.target.value);
      },
      placeholder: "A\xF1adir nota de seguimiento...",
      className: "w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none min-h-[80px] custom-scrollbar"
    }), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      disabled: !newNote.trim(),
      className: "absolute right-3 bottom-3 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-500 transition-all disabled:opacity-30 disabled:hover:bg-indigo-600"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-paper-plane text-[10px]"
    })))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1"
    }, g.Com_Notas && /*#__PURE__*/React.createElement("div", {
      className: "relative pl-6 border-l-2 border-amber-500/30 pb-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
    }), /*#__PURE__*/React.createElement("div", {
      className: "bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex justify-between items-start mb-1"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[8px] font-black text-amber-500 uppercase tracking-widest"
    }, "Nota Principal")), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-amber-200/80 leading-relaxed whitespace-pre-wrap italic"
    }, g.Com_Notas))), !Array.isArray(g.tracking) || g.tracking.length === 0 && !g.Com_Notas ? /*#__PURE__*/React.createElement("div", {
      className: "py-10 text-center opacity-30"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-comments text-2xl mb-2 text-slate-400"
    }), /*#__PURE__*/React.createElement("p", {
      className: "text-[9px] font-black text-slate-500 uppercase"
    }, "Sin historial a\xFAn")) : (Array.isArray(g.tracking) ? g.tracking : []).map(function (t, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: (t === null || t === void 0 ? void 0 : t.id) || i,
        className: "relative pl-6 border-l-2 border-white/5 pb-4 last:pb-0"
      }, /*#__PURE__*/React.createElement("div", {
        className: "absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
      }), /*#__PURE__*/React.createElement("div", {
        className: "bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all group"
      }, /*#__PURE__*/React.createElement("div", {
        className: "flex justify-between items-start mb-1"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[8px] font-black text-indigo-400 uppercase tracking-widest"
      }, (t === null || t === void 0 ? void 0 : t.date) || 'N/A')), /*#__PURE__*/React.createElement("p", {
        className: "text-xs text-slate-300 leading-relaxed whitespace-pre-wrap"
      }, (t === null || t === void 0 ? void 0 : t.text) || '')));
    })))), /*#__PURE__*/React.createElement("div", {
      className: "lg:col-span-8 print:col-span-12"
    }, /*#__PURE__*/React.createElement("div", {
      className: "bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-slate-800 print:shadow-none print:border-none print:overflow-visible"
    }, /*#__PURE__*/React.createElement("div", {
      className: "p-8 md:p-10 print:p-8",
      id: "quote-document"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-6 border-b-2 pb-4 mb-8 print:mb-4 print:pb-3 ".concat(isCumbria ? 'border-blue-900' : 'border-orange-600')
    }, /*#__PURE__*/React.createElement("img", {
      src: isCumbria ? "Logos/Cumbria Spa&Hotel.jpg" : "Logos/Sercotel Guadiana.jpg",
      alt: hotelName,
      className: "max-h-20 print:max-h-14 w-auto object-contain flex-shrink-0"
    }), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, /*#__PURE__*/React.createElement("h1", {
      className: "text-xl md:text-2xl print:text-lg font-black uppercase tracking-tighter ".concat(isCumbria ? 'text-blue-900' : 'text-orange-800')
    }, docMode === 'confirmacion' ? 'Confirmación de Grupo' : 'Propuesta de Alojamiento'), /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] print:text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1"
    }, "Ref: ", g.Reserva))), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:mb-6"
    }, /*#__PURE__*/React.createElement("div", {
      className: "space-y-0.5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest"
    }, "Cliente / Grupo"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs print:text-[10px] font-bold text-slate-800 uppercase"
    }, g["Nombre del Grupo"])), /*#__PURE__*/React.createElement("div", {
      className: "space-y-0.5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest"
    }, "Estancia"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs print:text-[10px] font-bold text-slate-800"
    }, formatDate(g.Entrada), " - ", formatDate(g.Salida))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-0.5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest"
    }, "Pax Estimados"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs print:text-[10px] font-bold text-slate-800"
    }, totalPax, " personas")), /*#__PURE__*/React.createElement("div", {
      className: "space-y-0.5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest"
    }, "Reserva ID"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs print:text-[10px] font-bold text-slate-800"
    }, "#", g.Reserva))), (g.Com_Nombre_Contacto || g.Persona_Contacto || g.Com_Email_Contacto || g.Email || g.Com_Telefono_Contacto || g.Telefono || g["Tel\xC3\xA9fono"]) && /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:mb-6 border-t border-slate-50 pt-4"
    }, (g.Com_Nombre_Contacto || g.Persona_Contacto) && /*#__PURE__*/React.createElement("div", {
      className: "space-y-0.5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest"
    }, "Contacto"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs print:text-[10px] font-bold text-slate-800 uppercase"
    }, g.Com_Nombre_Contacto || g.Persona_Contacto)), (g.Com_Email_Contacto || g.Email) && /*#__PURE__*/React.createElement("div", {
      className: "space-y-0.5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest"
    }, "Email"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs print:text-[10px] font-bold text-slate-800"
    }, g.Com_Email_Contacto || g.Email)), (g.Com_Telefono_Contacto || g.Telefono || g["Tel\xC3\xA9fono"]) && /*#__PURE__*/React.createElement("div", {
      className: "space-y-0.5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest"
    }, "Tel\xE9fono"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs print:text-[10px] font-bold text-slate-800"
    }, g.Com_Telefono_Contacto || g.Telefono || g["Tel\xC3\xA9fono"])), g["Empresa/Agencia"] && g["Empresa/Agencia"] !== "Venta Directa" && /*#__PURE__*/React.createElement("div", {
      className: "space-y-0.5"
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-widest"
    }, "Empresa / Agencia"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs print:text-[10px] font-bold text-slate-800 uppercase"
    }, g["Empresa/Agencia"]))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-8 print:space-y-4"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "text-xs font-black text-slate-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3"
    }, "Itinerario y Condiciones Econ\xF3micas"), dates.length > 0 ? /*#__PURE__*/React.createElement("div", {
      className: "overflow-hidden print:overflow-visible rounded-2xl border border-slate-100 text-xs print:text-[10px]"
    }, /*#__PURE__*/React.createElement("table", {
      className: "w-full text-left border-collapse"
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      className: "bg-slate-50 text-slate-500 font-black text-[10px] print:text-[8px] uppercase tracking-widest border-b border-slate-100"
    }, /*#__PURE__*/React.createElement("th", {
      className: "p-4 print:py-1.5 print:px-2"
    }, "Fecha (Servicio)"), /*#__PURE__*/React.createElement("th", {
      className: "p-4 print:py-1.5 print:px-2"
    }, "R\xE9gimen"), /*#__PURE__*/React.createElement("th", {
      className: "p-4 print:py-1.5 print:px-2"
    }, "Tipolog\xEDa Alojamiento"), /*#__PURE__*/React.createElement("th", {
      className: "p-4 print:py-1.5 print:px-2 text-right"
    }, "Subtotal"))), /*#__PURE__*/React.createElement("tbody", {
      className: "divide-y divide-slate-100"
    }, dates.flatMap(function (date, idx) {
      var _g$dailyConfig;
      var subtotalDate = 0;
      var config = ((_g$dailyConfig = g.dailyConfig) === null || _g$dailyConfig === void 0 ? void 0 : _g$dailyConfig[date]) || {};
      var boardTitle = config.board || g.Regimen || '';
      var roomRow = /*#__PURE__*/React.createElement("tr", {
        key: "".concat(date, "-base"),
        className: "group hover:bg-slate-50/50"
      }, /*#__PURE__*/React.createElement("td", {
        className: "p-4 print:py-1.5 print:px-2 align-top font-bold text-slate-800"
      }, formatDate(date)), /*#__PURE__*/React.createElement("td", {
        className: "p-4 print:py-1.5 print:px-2 align-top font-bold text-indigo-600"
      }, boardTitle), /*#__PURE__*/React.createElement("td", {
        className: "p-4 print:py-1.5 print:px-2"
      }, /*#__PURE__*/React.createElement("ul", {
        className: "text-[11px] print:text-[9px]"
      }, activeRooms.map(function (_ref35) {
        var _ref36 = _slicedToArray(_ref35, 2),
          type = _ref36[0],
          count = _ref36[1];
        var typeKey = type.toUpperCase();
        var price = 0;
        var gratuities = 0;
        var lineSubtotal = 0;
        var roomBoard = '';
        if (config.prices && config.prices[typeKey] !== undefined) {
          var _config$typeKey, _config$typeKey2;
          price = Number(config.prices[typeKey] || 0);
          roomBoard = ((_config$typeKey = config[typeKey]) === null || _config$typeKey === void 0 ? void 0 : _config$typeKey.board) || '';
          gratuities = parseInt(((_config$typeKey2 = config[typeKey]) === null || _config$typeKey2 === void 0 ? void 0 : _config$typeKey2.gratuities) || 0);
          lineSubtotal = Math.max(0, count - gratuities) * price;
        }
        if (price === 0 && lineSubtotal === 0 && gratuities === 0) return null;
        subtotalDate += lineSubtotal;
        return /*#__PURE__*/React.createElement("li", {
          key: type,
          className: "text-slate-500 mb-1 print:mb-0"
        }, /*#__PURE__*/React.createElement("div", {
          className: "flex justify-between"
        }, /*#__PURE__*/React.createElement("span", null, count, "x ", type, " ", roomBoard && roomBoard !== boardTitle ? "(".concat(roomBoard, ")") : '', " (", formatNum(price), "\u20AC)")), gratuities > 0 && /*#__PURE__*/React.createElement("div", {
          className: "text-emerald-500 font-bold text-[9px] uppercase tracking-wider mt-0.5 print:mt-0"
        }, "[-", gratuities, "] Gratuidad"));
      }))), /*#__PURE__*/React.createElement("td", {
        className: "p-4 print:py-1.5 print:px-2 align-bottom text-right font-black text-slate-800 tabular-nums"
      }, formatNum(subtotalDate), " \u20AC"));
      var dailyExtrasRows = (g.extraCharges || []).filter(function (ext) {
        return ext.date === date;
      }).map(function (ext, extIdx) {
        var u = ext.units || 0;
        var pax = ext.pax || 0;
        var up = ext.unitPrice !== undefined ? ext.unitPrice : Number(ext.price || 0);
        var px = (u > 0 ? u : pax) * up;
        return /*#__PURE__*/React.createElement("tr", {
          key: "ext-".concat(date, "-").concat(extIdx),
          className: "bg-slate-50 border-t border-slate-100"
        }, /*#__PURE__*/React.createElement("td", {
          className: "p-4 print:py-1.5 print:px-2 align-top font-bold text-slate-800"
        }, formatDate(date)), /*#__PURE__*/React.createElement("td", {
          className: "p-4 print:py-1.5 print:px-2 align-top text-slate-500 font-black uppercase text-[9px] tracking-widest italic opacity-60"
        }, "Cargo Extra"), /*#__PURE__*/React.createElement("td", {
          className: "p-4 print:py-1.5 print:px-2 text-slate-600 font-bold italic"
        }, ext.description || ext.concept, " (", u > 0 ? u : pax, " x ", formatNum(up), "\u20AC)"), /*#__PURE__*/React.createElement("td", {
          className: "p-4 print:py-1.5 print:px-2 align-bottom text-right font-black text-slate-800 tabular-nums"
        }, formatNum(px), " \u20AC"));
      });
      return [roomRow].concat(_toConsumableArray(dailyExtrasRows));
    }), (g.extraCharges || []).filter(function (ext) {
      return !ext.date || ext.date === '' || ext.date === 'Todas' || !dates.includes(ext.date);
    }).map(function (ext, idx) {
      var px = (ext.units || ext.pax || 0) * (ext.unitPrice !== undefined ? ext.unitPrice : parseFloat(ext.price || 0));
      return /*#__PURE__*/React.createElement("tr", {
        key: "ext-global-".concat(idx),
        className: "bg-indigo-50/30 border-t border-indigo-100/50 italic"
      }, /*#__PURE__*/React.createElement("td", {
        className: "p-4 print:py-1.5 print:px-2 align-top font-bold text-indigo-900"
      }, "General"), /*#__PURE__*/React.createElement("td", {
        className: "p-4 print:py-1.5 print:px-2 align-top text-indigo-400 font-black uppercase text-[9px] tracking-widest"
      }, "Extra Global"), /*#__PURE__*/React.createElement("td", {
        className: "p-4 print:py-1.5 print:px-2 text-indigo-800 font-bold"
      }, ext.description || ext.concept, " (", ext.units || ext.pax || 0, " x ", formatNum(ext.unitPrice || ext.price || 0), "\u20AC)"), /*#__PURE__*/React.createElement("td", {
        className: "p-4 print:py-1.5 print:px-2 align-bottom text-right font-black text-indigo-900 tabular-nums"
      }, formatNum(px), " \u20AC"));
    })), /*#__PURE__*/React.createElement("tfoot", {
      className: "bg-slate-900 text-white font-black"
    }, parseFloat(g.Suplementos || 0) > 0 || parseFloat(g.Descuentos || 0) > 0 ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("tr", {
      className: "border-b border-slate-700/50 text-slate-300"
    }, /*#__PURE__*/React.createElement("td", {
      colSpan: "3",
      className: "px-6 py-4 print:py-2 print:px-3 text-right uppercase tracking-widest text-[10px] print:text-[8px]"
    }, "Subtotal Estancia:"), /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-4 print:py-2 print:px-3 text-right tabular-nums whitespace-nowrap"
    }, formatNum((calculatedTotal > 0 ? calculatedTotal : 0) - parseFloat(g.Suplementos || 0) + parseFloat(g.Descuentos || 0)), " \u20AC")), parseFloat(g.Suplementos || 0) > 0 && /*#__PURE__*/React.createElement("tr", {
      className: "border-b border-slate-700/50 text-indigo-300"
    }, /*#__PURE__*/React.createElement("td", {
      colSpan: "3",
      className: "px-6 py-3 print:py-1.5 print:px-3 text-right uppercase tracking-widest text-[10px] print:text-[8px]"
    }, "+ Suplementos:"), /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-3 print:py-1.5 print:px-3 text-right tabular-nums whitespace-nowrap"
    }, formatNum(parseFloat(g.Suplementos)), " \u20AC")), parseFloat(g.Descuentos || 0) > 0 && /*#__PURE__*/React.createElement("tr", {
      className: "border-b border-slate-700/50 text-rose-300"
    }, /*#__PURE__*/React.createElement("td", {
      colSpan: "3",
      className: "px-6 py-3 print:py-1.5 print:px-3 text-right uppercase tracking-widest text-[10px] print:text-[8px]"
    }, "- Descuentos aplicados:"), /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-3 print:py-1.5 print:px-3 text-right tabular-nums whitespace-nowrap"
    }, "-", formatNum(parseFloat(g.Descuentos)), " \u20AC")), /*#__PURE__*/React.createElement("tr", {
      style: {
        backgroundColor: '#0f172a',
        color: 'white',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact'
      }
    }, /*#__PURE__*/React.createElement("td", {
      colSpan: "3",
      className: "px-6 py-5 print:py-3 print:px-3 text-right uppercase tracking-[0.2em] text-xs print:text-[10px] font-black"
    }, "Total Neto Documento:"), /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-5 print:py-3 print:px-3 text-right text-xl print:text-lg tabular-nums whitespace-nowrap",
      style: {
        color: 'white',
        fontWeight: 900
      }
    }, formatNum(calculatedTotal), " \u20AC"))) : /*#__PURE__*/React.createElement("tr", {
      style: {
        backgroundColor: '#0f172a',
        color: 'white',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact'
      }
    }, /*#__PURE__*/React.createElement("td", {
      colSpan: "3",
      className: "px-6 py-5 print:py-3 print:px-3 text-right uppercase tracking-[0.2em] text-xs print:text-[10px] font-black"
    }, "Total Neto Documento:"), /*#__PURE__*/React.createElement("td", {
      className: "px-6 py-5 print:py-3 print:px-3 text-right text-xl print:text-lg tabular-nums whitespace-nowrap",
      style: {
        color: 'white',
        fontWeight: 900
      }
    }, formatNum(calculatedTotal), " \u20AC"))))) : /*#__PURE__*/React.createElement("div", {
      className: "bg-slate-50 p-8 rounded-2xl text-center border border-slate-200"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-lg font-black text-indigo-700"
    }, formatNum(calculatedTotal), " \u20AC (Total Estimado)"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-slate-400 mt-2"
    }, "Detalle de noches no configurado a\xFAn.")), /*#__PURE__*/React.createElement("div", {
      className: "space-y-8 print:space-y-4"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between no-print mb-4 bg-slate-50 p-2 rounded-2xl border border-slate-100"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex gap-1"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setDocMode('presupuesto');
      },
      className: "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ".concat(docMode === 'presupuesto' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600')
    }, "Vista Presupuesto"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setDocMode('confirmacion');
      },
      className: "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ".concat(docMode === 'confirmacion' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:text-slate-600')
    }, "Vista Confirmaci\xF3n"))), /*#__PURE__*/React.createElement("div", {
      className: "space-y-16 print:space-y-6 print-break-before"
    }, docMode === 'presupuesto' && /*#__PURE__*/React.createElement("div", {
      className: "relative group"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between mb-5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-4 w-1 rounded-full ".concat(isCumbria ? 'bg-blue-800' : 'bg-orange-600')
    }), /*#__PURE__*/React.createElement("h4", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]"
    }, "Cl\xE1usulas de Presupuesto")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        if (!isEditingClauses) {
          var current = effectiveClauses;
          setTempClauses(JSON.parse(JSON.stringify(current)));
        } else {
          db.collection("groups").doc(g.uid).update({
            clauses: tempClauses
          }).then(function () {
            return alert("Cláusulas presupuesto guardadas.");
          });
        }
        setIsEditingClauses(!isEditingClauses);
      },
      className: "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ".concat(isEditingClauses ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200')
    }, isEditingClauses ? 'Guardar' : 'Editar')), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-8 gap-y-6 print:gap-x-4 print:gap-y-2"
    }, function () {
      var cls = isEditingClauses ? tempClauses : effectiveClauses;
      return cls.map(function (c, i) {
        if (isEditingClauses) {
          return /*#__PURE__*/React.createElement("div", {
            key: i,
            className: "border-l-2 border-slate-200 pl-3 py-1 bg-slate-50/50 rounded-r-xl"
          }, /*#__PURE__*/React.createElement("div", {
            className: "flex justify-between mb-2 gap-2"
          }, /*#__PURE__*/React.createElement("input", {
            type: "text",
            value: c.title,
            onChange: function onChange(e) {
              var n = _toConsumableArray(tempClauses);
              n[i].title = e.target.value;
              setTempClauses(n);
            },
            className: "flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-black text-slate-800"
          }), /*#__PURE__*/React.createElement("button", {
            onClick: function onClick() {
              return handleTranslateClause(i, 'budget');
            },
            className: "px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black hover:bg-indigo-600 hover:text-white"
          }, /*#__PURE__*/React.createElement("i", {
            className: "fas fa-language"
          })), /*#__PURE__*/React.createElement("button", {
            onClick: function onClick() {
              return setTempClauses(tempClauses.filter(function (_, idx) {
                return idx !== i;
              }));
            },
            className: "text-rose-500"
          }, /*#__PURE__*/React.createElement("i", {
            className: "fas fa-trash-alt text-[10px]"
          }))), /*#__PURE__*/React.createElement("textarea", {
            value: c.body,
            onChange: function onChange(e) {
              var n = _toConsumableArray(tempClauses);
              n[i].body = e.target.value;
              setTempClauses(n);
            },
            rows: "3",
            className: "w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-600 resize-none font-medium"
          }));
        }
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          className: "border-l-2 ".concat(isCumbria ? 'border-blue-200' : 'border-orange-100', " pl-3 print:pl-2 py-1")
        }, /*#__PURE__*/React.createElement("p", {
          className: "text-[10px] print:text-[7.5px] font-black uppercase tracking-wider mb-0.5 text-slate-800"
        }, /*#__PURE__*/React.createElement("span", {
          className: "text-slate-400 mr-1"
        }, i + 1, "."), c.title), /*#__PURE__*/React.createElement("div", {
          className: "text-[9.5px] print:text-[7px] text-slate-500 leading-snug"
        }, renderClauseText(parseClauseVariables(c.body, c.title))));
      });
    }(), isEditingClauses && /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setTempClauses([].concat(_toConsumableArray(tempClauses), [{
          title: "Nueva Cláusula",
          body: ""
        }]));
      },
      className: "border-2 border-dashed border-slate-200 rounded-xl p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-400 transition-all flex items-center justify-center gap-2"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-plus"
    }), " A\xF1adir Cl\xE1usula"))), docMode === 'confirmacion' && /*#__PURE__*/React.createElement("div", {
      className: "relative group"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between mb-5"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("div", {
      className: "h-4 w-1 rounded-full bg-emerald-500"
    }), /*#__PURE__*/React.createElement("h4", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]"
    }, "Cl\xE1usulas de Confirmaci\xF3n")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        if (!isEditingClausesConf) {
          var current = effectiveClauses;
          setTempClausesConf(JSON.parse(JSON.stringify(current)));
        } else {
          db.collection("groups").doc(g.uid).update({
            clauses_conf: tempClausesConf
          }).then(function () {
            return alert("Cláusulas confirmación guardadas.");
          });
        }
        setIsEditingClausesConf(!isEditingClausesConf);
      },
      className: "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ".concat(isEditingClausesConf ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200')
    }, isEditingClausesConf ? 'Guardar' : 'Editar')), /*#__PURE__*/React.createElement("div", {
      className: "grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-8 gap-y-6 print:gap-x-4 print:gap-y-2"
    }, function () {
      var cls = isEditingClausesConf ? tempClausesConf : effectiveClauses;
      return cls.map(function (c, i) {
        if (isEditingClausesConf) {
          return /*#__PURE__*/React.createElement("div", {
            key: i,
            className: "border-l-2 border-emerald-100 pl-3 py-1 bg-slate-50/50 rounded-r-xl"
          }, /*#__PURE__*/React.createElement("div", {
            className: "flex justify-between mb-2 gap-2"
          }, /*#__PURE__*/React.createElement("input", {
            type: "text",
            value: c.title,
            onChange: function onChange(e) {
              var n = _toConsumableArray(tempClausesConf);
              n[i].title = e.target.value;
              setTempClausesConf(n);
            },
            className: "flex-1 bg-white border border-slate-200 rounded px-2 py-1 text-[10px] font-black text-slate-800"
          }), /*#__PURE__*/React.createElement("button", {
            onClick: function onClick() {
              return handleTranslateClause(i, 'confirmation');
            },
            className: "px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black hover:bg-emerald-600 hover:text-white"
          }, /*#__PURE__*/React.createElement("i", {
            className: "fas fa-language"
          })), /*#__PURE__*/React.createElement("button", {
            onClick: function onClick() {
              return setTempClausesConf(tempClausesConf.filter(function (_, idx) {
                return idx !== i;
              }));
            },
            className: "text-rose-500"
          }, /*#__PURE__*/React.createElement("i", {
            className: "fas fa-trash-alt text-[10px]"
          }))), /*#__PURE__*/React.createElement("textarea", {
            value: c.body,
            onChange: function onChange(e) {
              var n = _toConsumableArray(tempClausesConf);
              n[i].body = e.target.value;
              setTempClausesConf(n);
            },
            rows: "3",
            className: "w-full bg-white border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-600 resize-none font-medium"
          }));
        }
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          className: "border-l-2 border-emerald-100 pl-3 print:pl-2 py-1"
        }, /*#__PURE__*/React.createElement("p", {
          className: "text-[10px] print:text-[7.5px] font-black uppercase tracking-wider mb-0.5 text-emerald-900"
        }, /*#__PURE__*/React.createElement("span", {
          className: "text-emerald-700 mr-1"
        }, i + 1, "."), c.title), /*#__PURE__*/React.createElement("div", {
          className: "text-[9.5px] print:text-[7px] text-slate-500 leading-snug"
        }, renderClauseText(parseClauseVariables(c.body, c.title))));
      });
    }(), isEditingClausesConf && /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setTempClausesConf([].concat(_toConsumableArray(tempClausesConf), [{
          title: "Nueva Cláusula Conf.",
          body: ""
        }]));
      },
      className: "border-2 border-dashed border-emerald-100 rounded-xl p-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:border-emerald-400 hover:text-emerald-500 transition-all flex items-center justify-center gap-2"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-plus"
    }), " A\xF1adir Cl\xE1usula de Confirmaci\xF3n"))))), /*#__PURE__*/React.createElement("div", {
      className: "pt-5 print:pt-3 border-t-2 ".concat(isCumbria ? 'border-blue-900' : 'border-orange-600', " print:border-t flex items-end justify-between")
    }, /*#__PURE__*/React.createElement("div", {
      className: "print:pl-2"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1"
    }, "Generado por"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm print:text-[10px] font-black ".concat(isCumbria ? 'text-blue-900' : 'text-orange-800')
    }, isCumbria ? "Dpto. Eventos Cumbria" : "Dpto. Grupos Sercotel Guadiana"), /*#__PURE__*/React.createElement("p", {
      className: "text-[9px] print:text-[7px] text-slate-400 italic mt-0.5"
    }, "Este documento no tiene validez como factura")), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[9px] print:text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1"
    }, "Fecha del Documento"), /*#__PURE__*/React.createElement("p", {
      className: "text-lg print:text-sm font-black ".concat(isCumbria ? 'text-blue-900' : 'text-orange-800')
    }, new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }))))))), /*#__PURE__*/React.createElement("div", {
      className: "mt-6 flex justify-end no-print"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        var originalTitle = document.title;
        var reserva = g.Reserva || '';
        var grupo = g['Nombre del Grupo'] || '';
        document.title = reserva && grupo ? "".concat(reserva, " - ").concat(grupo) : grupo || reserva || 'Propuesta';
        window.print();
        setTimeout(function () {
          document.title = originalTitle;
        }, 500);
      },
      className: "bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-black transition-all shadow-xl flex items-center gap-3"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fas fa-print"
    }), " IMPRIMIR PDF")))));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col min-h-screen"
  }, /*#__PURE__*/React.createElement("nav", {
    className: "bg-white border-b border-slate-200 z-50 no-print"
  }, /*#__PURE__*/React.createElement("div", {
    className: "max-w-7xl mx-auto px-6 h-18 flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4 cursor-pointer py-4",
    onClick: function onClick() {
      return setCurrentView('dashboard');
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-layer-group text-white text-sm"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "text-base font-black tracking-tight leading-none mb-1"
  }, "Nexus Presupuestos"), /*#__PURE__*/React.createElement("p", {
    className: "text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]"
  }, "Sales Hub"))), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-6"
  }, /*#__PURE__*/React.createElement("a", {
    href: "Proformas.html",
    className: "text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2 mr-4"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-file-invoice"
  }), " Fac Proforma"), /*#__PURE__*/React.createElement("a", {
    href: "https://nataliogc.github.io/menus-eventos/admin.html",
    target: "_blank",
    rel: "noopener noreferrer",
    className: "text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2 mr-4"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-utensils"
  }), " Men\xFAs Eventos"), /*#__PURE__*/React.createElement("a", {
    href: "https://nataliogc.github.io/Menus-Turisticos/",
    target: "_blank",
    rel: "noopener noreferrer",
    className: "text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2 mr-4"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-map"
  }), " Men\xFAs Tur\xEDsticos"), /*#__PURE__*/React.createElement("a", {
    href: "https://nataliogc.github.io/menus-cocteles/",
    target: "_blank",
    rel: "noopener noreferrer",
    className: "text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2 mr-4"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-glass-martini-alt"
  }), " Men\xFAs C\xF3cteles"), /*#__PURE__*/React.createElement("a", {
    href: "Gestion-de-Grupos.html",
    className: "text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("i", {
    className: "fas fa-arrow-left"
  }), " Volver a Grupos")))), /*#__PURE__*/React.createElement("main", {
    className: "flex-grow p-4 md:p-8"
  }, loading ? /*#__PURE__*/React.createElement("div", {
    className: "h-64 flex flex-col items-center justify-center space-y-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 border-4 border-slate-100 border-t-indigo-500 rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-[9px] font-black text-slate-400 uppercase tracking-widest"
  }, "Conectando...")) : /*#__PURE__*/React.createElement(React.Fragment, null, currentView === 'dashboard' && renderDashboard(), currentView === 'create' && renderCreate(), currentView === 'detail' && renderDetail())));
}
var root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));