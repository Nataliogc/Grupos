"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
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
  useRef = _React.useRef;

// LucideIcon cargado desde js/icons.js (window.LucideIcon)

// --- FIREBASE ---
var db = window.db;

// --- CONSTANTES ---
var ROOM_TYPES = {
  "Sercotel Guadiana": ["DOBLE DE USO INDIVIDUAL", "DOBLE", "DOBLE + SUPLETORIA", "DOBLE + SUPLETORIA NIÑO", "CUÁDRUPLE", "SUITE", "SUITE SUPERIOR"],
  "Cumbria Spa & Hotel": ["DOBLE DE USO INDIVIDUAL", "DOBLE", "DOBLE + SUPLETORIA", "DOBLE + SUPLETORIA NIÑO", "SUITE"],
  "Cumbria Spa&Hotel": ["DOBLE DE USO INDIVIDUAL", "DOBLE", "DOBLE + SUPLETORIA", "DOBLE + SUPLETORIA NIÑO", "SUITE"]
};
var BOARD_TYPES = ["HA (Solo Alojamiento)", "HD (Alojamiento y Desayuno)", "MP (Media Pensión)", "PC (Pensión Completa)"];

// --- UTILS (cargadas desde js/utils.js) ---
var generateDates = NexusUtils.generateDates;
var formatDate = NexusUtils.formatDate;
var formatNum = NexusUtils.formatNum;
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
  var dates = generateDates(group.Entrada, group.Salida);
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
      } else {
        var tk = Object.keys(config).find(function (k) {
          return k.trim().toLowerCase() === type.trim().toLowerCase();
        });
        if (tk && config[tk] && config[tk].count !== undefined && config[tk].count !== '' && config[tk].count !== undefined) {
          count = Number(config[tk].count);
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
          var _tk = Object.keys(config).find(function (k) {
            return k.trim().toLowerCase() === type.trim().toLowerCase();
          });
          if (_tk && config[_tk]) {
            price = parseFloat(config[_tk].price || 0);
            regime = config[_tk].board || regime;
            gratuities = parseInt(config[_tk].gratuities || 0);
            discount = parseFloat(config[_tk].discount || 0);
          }
        }
        var paxPerRoom = type.toLowerCase().includes('ind') || type.toLowerCase().includes('dui') ? 1 : type.toLowerCase().includes('tri') ? 3 : 2;
        var payingRooms = Math.max(0, count - gratuities);
        var match = existingList.find(function (item) {
          return item.dateIn === date && item.type === type && !item.isService;
        });
        if (payingRooms > 0) {
          var regimeShort = regime.split(' ')[0];
          newList.push({
            id: match ? match.id : Date.now() + Math.random(),
            hotel: hotelName,
            type: type,
            dateIn: date,
            dateOut: date,
            qty: payingRooms,
            regime: regimeShort,
            price: price,
            pax: paxPerRoom,
            nights: 1,
            total: (payingRooms * price * (1 - discount / 100)).toFixed(2),
            isService: false,
            comision: match && match.comision ? match.comision : calculateDefaultCommission(price, regimeShort, payingRooms, 1, type)
          });
        }
        if (gratuities > 0) {
          var _regimeShort = regime.split(' ')[0];
          var matchGrat = existingList.find(function (item) {
            return item.dateIn === date && item.type === type + " (GRATUIDAD)" && !item.isService;
          });
          newList.push({
            id: matchGrat ? matchGrat.id : Date.now() + Math.random(),
            hotel: hotelName,
            type: type + " (GRATUIDAD)",
            dateIn: date,
            dateOut: date,
            qty: gratuities,
            regime: _regimeShort,
            price: 0,
            pax: paxPerRoom,
            nights: 1,
            total: "0.00",
            isService: false,
            comision: matchGrat && matchGrat.comision ? matchGrat.comision : calculateDefaultCommission(0, _regimeShort, gratuities, 1, type)
          });
        }
      }
    });
    existingList.forEach(function (item) {
      if (item.isService && item.dateIn === date) {
        newList.push(item);
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
var App = function App() {
  var _useState = useState(""),
    _useState2 = _slicedToArray(_useState, 2),
    emailText = _useState2[0],
    setEmailText = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isAnalyzing = _useState4[0],
    setIsAnalyzing = _useState4[1];
  var _useState5 = useState(null),
    _useState6 = _slicedToArray(_useState5, 2),
    extractedData = _useState6[0],
    setExtractedData = _useState6[1];
  var _useState7 = useState(null),
    _useState8 = _slicedToArray(_useState7, 2),
    saveStatus = _useState8[0],
    setSaveStatus = _useState8[1];
  var _useState9 = useState({}),
    _useState0 = _slicedToArray(_useState9, 2),
    validation = _useState0[0],
    setValidation = _useState0[1];
  var _useState1 = useState(false),
    _useState10 = _slicedToArray(_useState1, 2),
    isEditMode = _useState10[0],
    setIsEditMode = _useState10[1];
  var _useState11 = useState(null),
    _useState12 = _slicedToArray(_useState11, 2),
    extractionMode = _useState12[0],
    setExtractionMode = _useState12[1];
  var _useState13 = useState(null),
    _useState14 = _slicedToArray(_useState13, 2),
    extractionNotice = _useState14[0],
    setExtractionNotice = _useState14[1];
  useEffect(function () {
    var params = new URLSearchParams(window.location.search);
    var editId = params.get('edit') || params.get('reserva');
    if (editId) {
      console.log("Detectado ID para edición:", editId);
      setIsEditMode(true);
      setIsAnalyzing(true);
      // Normalizar el ID igual que en el guardado
      var normId = String(editId).trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");
      db.collection("groups").doc(normId).get().then(function (doc) {
        if (doc.exists) {
          var data = doc.data();
          console.log("Documento encontrado:", data);
          var st = (data.Com_Estado_Interno || data.Estado || "").toUpperCase();
          var resId = String(data.Reserva || normId).trim();
          var isLocked = Boolean(st.includes("CONFIRM") || st.includes("TENTA") || st.includes("TANTEO") || st.includes("BLOQ") || st.includes("OPCI") || !resId.toUpperCase().startsWith("PRES-") || data.convertedToReservation || data.targetReservationId || data.isReadOnly || data.isHistoricalBudget);
          if (isLocked) {
            alert("⚠️ Este presupuesto ya está confirmado o en tentativa con ID de reserva del PMS (" + resId + ").\n\nNo se puede modificar, queda exclusivamente como consulta.");
            window.location.href = "Presupuestos.html?id=" + encodeURIComponent(normId);
            return;
          }
          setExtractedData(_objectSpread(_objectSpread({}, data), {}, {
            "Observaciones": data.Com_Notas || data.Observaciones || "",
            "Hotel": data.Hotel_Asignado || data.Hotel || "Sercotel Guadiana",
            "Empresa/Agencia": data["Empresa/Agencia"] || data.Empresa || ""
          }));
          // Validar tras un pequeño delay
          setTimeout(function () {
            var newData = _objectSpread(_objectSpread({}, data), {}, {
              "Nombre del Grupo": data["Nombre del Grupo"] || "",
              "Entrada": data["Entrada"] || "",
              "Salida": data["Salida"] || "",
              "Pax.": data["Pax."] || "0"
            });
            validateData(newData);
          }, 200);
        } else {
          console.warn("No se encontró el documento en Firestore con ID:", normId);
          // Si no existe el doc, pero tenemos datos en localStorage, usarlos como base
          var storedRaw = window.NexusSelectedGroupStorage.getItem('selectedGroup');
          if (storedRaw) {
            try {
              var storedData = JSON.parse(storedRaw);
              setExtractedData(_objectSpread(_objectSpread({}, storedData), {}, {
                "Observaciones": storedData.Com_Notas || storedData.Observaciones || "",
                "Hotel": storedData.Hotel_Asignado || storedData.Hotel || "Sercotel Guadiana"
              }));
              validateData(storedData);
            } catch (e) {}
          }
        }
      }).catch(function (err) {
        console.error("Error cargando presupuesto:", err);
      }).finally(function () {
        setIsAnalyzing(false);
      });
    }
  }, []);

  // Utility for safe localStorage access
  var safeStorage = {
    getItem: function getItem(key) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    setItem: function setItem(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {}
    }
  };
  var validateData = function validateData(data) {
    var errors = {};
    if (!data["Nombre del Grupo"]) errors["Nombre del Grupo"] = true;
    if (!data["Entrada"]) errors["Entrada"] = true;
    if (!data["Salida"]) errors["Salida"] = true;
    if (!data["Pax."] || data["Pax."] == 0) errors["Pax."] = true;
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };
  var calculateTotal = function calculateTotal(data) {
    if (!data) return 0;
    var total = 0;

    // Normalizar accounts evitando duplicar mayus y minus
    var normalizedRoomCounts = {};
    Object.entries(data.roomCounts || {}).forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
        t = _ref4[0],
        c = _ref4[1];
      var lowerT = t.toLowerCase();
      normalizedRoomCounts[lowerT] = (normalizedRoomCounts[lowerT] || 0) + Number(c);
    });
    var dConfig = data.dailyConfig || {};
    var dates = generateDates(data.Entrada, data.Salida);
    if (dates.length > 0 && Object.keys(dConfig).length > 0) {
      dates.forEach(function (date) {
        var dayData = dConfig[date] || {};
        Object.entries(normalizedRoomCounts).forEach(function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
            type = _ref6[0],
            count = _ref6[1];
          if (count > 0) {
            var lineSubtotal = 0;
            if (dayData.prices) {
              var priceKey = Object.keys(dayData.prices).find(function (k) {
                return k.toLowerCase() === type;
              });
              var p = priceKey ? parseFloat(dayData.prices[priceKey] || 0) : 0;
              var gratKey = dayData.gratuities ? Object.keys(dayData.gratuities).find(function (k) {
                return k.toLowerCase() === type;
              }) : null;
              var grat = gratKey ? parseInt(dayData.gratuities[gratKey] || 0) : 0;
              var discKey = dayData.discounts ? Object.keys(dayData.discounts).find(function (k) {
                return k.toLowerCase() === type;
              }) : null;
              var disc = discKey ? parseFloat(dayData.discounts[discKey] || 0) : 0;
              var billableCount = Math.max(0, count - grat);
              lineSubtotal = p * billableCount * (1 - disc / 100);
            } else {
              var typeKey = Object.keys(dayData).find(function (k) {
                return k.toLowerCase() === type;
              });
              if (typeKey && dayData[typeKey]) {
                var price = parseFloat(dayData[typeKey].price) || 0;
                var discount = parseFloat(dayData[typeKey].discount) || 0;
                var gratuities = parseInt(dayData[typeKey].gratuities) || 0;
                var _billableCount = Math.max(0, count - gratuities);
                lineSubtotal = _billableCount * price * (1 - discount / 100);
              }
            }
            total += lineSubtotal;
          }
        });
      });
      // Descuentos globales
      var descuentos = parseFloat(data.Descuentos) || 0;
      total = total - descuentos;
    } else {
      total = parseFloat(data["Importe(*)"]) || 0;
    }
    return total > 0 ? total : 0;
  };

  // callGemini cargado desde js/gemini.js (window.callGemini)

  var parseEmailTextLocally = function parseEmailTextLocally(text) {
    if (!text || typeof text !== 'string') text = '';
    var clean = text.trim();

    // 1. Hotel
    var hotel = 'Sercotel Guadiana';
    if (/cumbria/i.test(clean)) {
      hotel = 'Cumbria Spa & Hotel';
    }

    // 2. Fechas
    var entrada = '';
    var salida = '';
    var monthsMap = {
      'enero': '01',
      'febrero': '02',
      'marzo': '03',
      'abril': '04',
      'mayo': '05',
      'junio': '06',
      'julio': '07',
      'agosto': '08',
      'septiembre': '09',
      'setiembre': '09',
      'octubre': '10',
      'noviembre': '11',
      'diciembre': '12'
    };
    var rangeTextMatch = clean.match(/del\s+(\d{1,2})(?:\s+de\s+([a-záéíóú]+))?\s+al\s+(\d{1,2})\s+de\s+([a-záéíóú]+)(?:\s+de\s+(\d{4}))?/i);
    if (rangeTextMatch) {
      var currentYear = new Date().getFullYear();
      var year = rangeTextMatch[5] || String(currentYear);
      var mOutName = (rangeTextMatch[4] || '').toLowerCase();
      var mInName = (rangeTextMatch[2] || rangeTextMatch[4] || '').toLowerCase();
      var mOut = monthsMap[mOutName] || '01';
      var mIn = monthsMap[mInName] || mOut;
      var dIn = String(rangeTextMatch[1]).padStart(2, '0');
      var dOut = String(rangeTextMatch[3]).padStart(2, '0');
      entrada = "".concat(year, "-").concat(mIn, "-").concat(dIn);
      salida = "".concat(year, "-").concat(mOut, "-").concat(dOut);
    }
    if (!entrada) {
      var inMatch = clean.match(/(?:entrada|check[\s-]?in|llegada|desde|del)\s*[:=]?\s*(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/i) || clean.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/i);
      if (inMatch) {
        var y = inMatch[3];
        if (y.length === 2) y = '20' + y;
        var m = String(inMatch[2]).padStart(2, '0');
        var d = String(inMatch[1]).padStart(2, '0');
        entrada = "".concat(y, "-").concat(m, "-").concat(d);
      }
    }
    if (!salida) {
      var outMatch = clean.match(/(?:salida|check[\s-]?out|partida|hasta|al)\s*[:=]?\s*(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/i);
      if (outMatch) {
        var _y = outMatch[3];
        if (_y.length === 2) _y = '20' + _y;
        var _m = String(outMatch[2]).padStart(2, '0');
        var _d = String(outMatch[1]).padStart(2, '0');
        salida = "".concat(_y, "-").concat(_m, "-").concat(_d);
      } else if (entrada) {
        var allDates = _toConsumableArray(clean.matchAll(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/g));
        if (allDates.length >= 2) {
          var second = allDates[1];
          var _y2 = second[3];
          var _m2 = String(second[2]).padStart(2, '0');
          var _d2 = String(second[1]).padStart(2, '0');
          salida = "".concat(_y2, "-").concat(_m2, "-").concat(_d2);
        }
      }
    }

    // 3. Pax
    var pax = 0;
    var paxPrefixMatch = clean.match(/(?:pax|personas|viajeros|hu[eé]spedes|asistentes|adultos|total\s+personas)\s*[:=]\s*(\d+)/i);
    var paxSuffixMatch = clean.match(/\b(\d{1,4})\s*(?:pax|personas|viajeros|hu[eé]spedes|asistentes|adultos)\b/i);
    if (paxPrefixMatch) {
      pax = parseInt(paxPrefixMatch[1], 10);
    } else if (paxSuffixMatch) {
      pax = parseInt(paxSuffixMatch[1], 10);
    }

    // 4. Régimen
    var regimen = 'HD';
    if (/\b(pc|pensi[oó]n\s+completa)\b/i.test(clean)) {
      regimen = 'PC';
    } else if (/\b(mp|media\s+pensi[oó]n)\b/i.test(clean)) {
      regimen = 'MP';
    } else if (/\b(ha|sa|solo\s+alojamiento|alojamiento\s+solo)\b/i.test(clean)) {
      regimen = 'HA';
    } else if (/\b(hd|ad|desayuno|alojamiento\s+y\s+desayuno)\b/i.test(clean)) {
      regimen = 'HD';
    }

    // 5. Contacto
    var emailMatch = clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    var comEmail = emailMatch ? emailMatch[0] : '';
    var phoneMatch = clean.match(/(?:tel[eé]fono|tel|m[oó]vil|tfno)?\s*[:=]?\s*(?:\+?34\s*)?([6789]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|[6789]\d{8})/i);
    var comTel = phoneMatch ? phoneMatch[1].replace(/[\s.-]/g, '') : '';
    var cifMatch = clean.match(/\b([A-HJ-NP-SUVW]\d{7}[0-9A-J]|\d{8}[A-Z])\b/i);
    var fiscalCif = cifMatch ? cifMatch[1].toUpperCase() : '';
    var comNombre = '';
    var nombreMatch = clean.match(/(?:contacto|atentamente|un\s+saludo|saludos|remite|de)\s*[:=]\s*([^\n\r,]+)/i);
    if (nombreMatch && !/sercotel|cumbria|hola|estimad/i.test(nombreMatch[1])) {
      comNombre = nombreMatch[1].trim();
    }
    var agencia = '';
    var agenciaMatch = clean.match(/(?:agencia|empresa|de parte de)\s*[:=]\s*([^\n\r,]+)/i);
    if (agenciaMatch) {
      agencia = agenciaMatch[1].trim();
    } else if (comEmail) {
      var domain = comEmail.split('@')[1];
      if (domain && !/gmail|hotmail|yahoo|outlook/i.test(domain)) {
        agencia = domain.split('.')[0].toUpperCase();
      }
    }
    var grupoNombre = '';
    var grupoMatch = clean.match(/nombre\s*(?:del)?\s*grupo\s*[:=]\s*([^\n\r]+)/i) || clean.match(/(?:grupo|asunto|subject)\s*[:=]\s*([^\n\r]+)/i);
    if (grupoMatch) {
      grupoNombre = grupoMatch[1].trim().replace(/^grupo\s+/i, '').toUpperCase();
    }
    if (!grupoNombre) {
      grupoNombre = agencia ? "GRUPO ".concat(agencia.toUpperCase()) : 'GRUPO NUEVO';
    }

    // 6. Habitaciones
    var roomCounts = {
      'DOBLE DE USO INDIVIDUAL': 0,
      'DOBLE': 0,
      'DOBLE + SUPLETORIA': 0,
      'DOBLE + SUPLETORIA NIÑO': 0,
      'CUÁDRUPLE': 0,
      'SUITE': 0,
      'SUITE SUPERIOR': 0
    };
    var duiMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n|es)?\s*)?(?:dobles?\s*de\s*uso\s*individual|dui|individual(?:es)?)/i);
    if (duiMatch) roomCounts['DOBLE DE USO INDIVIDUAL'] = parseInt(duiMatch[1], 10);
    var dblMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n|es)?\s*)?(?:dobles?|twin|matrimonio)/i);
    if (dblMatch) roomCounts['DOBLE'] = parseInt(dblMatch[1], 10);
    var trpNiñoMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n|es)?\s*)?(?:triples?\s*con\s*ni[ñn]o|supletoria\s*ni[ñn]o)/i);
    if (trpNiñoMatch) {
      roomCounts['DOBLE + SUPLETORIA NIÑO'] = parseInt(trpNiñoMatch[1], 10);
    } else {
      var trpMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n|es)?\s*)?(?:triples?|supletorias?|doble\s*\+\s*supletoria)/i);
      if (trpMatch) roomCounts['DOBLE + SUPLETORIA'] = parseInt(trpMatch[1], 10);
    }
    var cuadMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n|es)?\s*)?(?:cu[aá]druples?)/i);
    if (cuadMatch) roomCounts['CUÁDRUPLE'] = parseInt(cuadMatch[1], 10);
    var suiteMatch = clean.match(/(\d+)\s*(?:hab(?:itaci[oó]n|es)?\s*)?(?:suites?)/i);
    if (suiteMatch) roomCounts['SUITE'] = parseInt(suiteMatch[1], 10);
    var habParts = [];
    if (roomCounts['DOBLE'] > 0) habParts.push("".concat(roomCounts['DOBLE'], " dobles"));
    if (roomCounts['DOBLE DE USO INDIVIDUAL'] > 0) habParts.push("".concat(roomCounts['DOBLE DE USO INDIVIDUAL'], " individuales"));
    if (roomCounts['DOBLE + SUPLETORIA'] > 0) habParts.push("".concat(roomCounts['DOBLE + SUPLETORIA'], " triples"));
    if (roomCounts['DOBLE + SUPLETORIA NIÑO'] > 0) habParts.push("".concat(roomCounts['DOBLE + SUPLETORIA NIÑO'], " triples ni\xF1o"));
    if (roomCounts['CUÁDRUPLE'] > 0) habParts.push("".concat(roomCounts['CUÁDRUPLE'], " cu\xE1druples"));
    if (roomCounts['SUITE'] > 0) habParts.push("".concat(roomCounts['SUITE'], " suites"));
    var habitacionesResumen = habParts.join(', ') || (pax ? "".concat(Math.ceil(pax / 2), " dobles aprox.") : '');
    if (!pax) {
      var calcPax = roomCounts['DOBLE'] * 2 + roomCounts['DOBLE DE USO INDIVIDUAL'] * 1 + roomCounts['DOBLE + SUPLETORIA'] * 3 + roomCounts['DOBLE + SUPLETORIA NIÑO'] * 3 + roomCounts['CUÁDRUPLE'] * 4 + roomCounts['SUITE'] * 2;
      if (calcPax > 0) pax = calcPax;
    }
    var importe = 0;
    var precioMatch = clean.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:€|euros?)/i);
    if (precioMatch) {
      importe = parseFloat(precioMatch[1].replace(',', '.'));
    }
    return {
      'Nombre del Grupo': grupoNombre,
      'Entrada': entrada,
      'Salida': salida,
      'Pax.': pax || 0,
      'Empresa/Agencia': agencia,
      'Régimen': regimen,
      'Habitaciones': habitacionesResumen,
      'roomCounts': roomCounts,
      'Hotel': hotel,
      'Observaciones': clean,
      'Com_Nombre_Contacto': comNombre,
      'Com_Email_Contacto': comEmail,
      'Com_Telefono_Contacto': comTel,
      'Fiscal_RazonSocial': agencia,
      'Fiscal_CIF': fiscalCif,
      'Fiscal_Direccion': '',
      'Fiscal_CP': '',
      'Fiscal_Poblacion': '',
      'Importe(*)': importe
    };
  };
  var handleLocalExtract = function handleLocalExtract() {
    if (!emailText.trim()) return;
    setIsAnalyzing(true);
    setExtractionNotice(null);
    try {
      var parsed = parseEmailTextLocally(emailText);
      setExtractedData(parsed);
      validateData(parsed);
      setExtractionMode('local');
    } catch (err) {
      alert("Error en la extracción local: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };
  var handleAnalyze = /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var prompt, aiFailed, aiErrorMessage, aiResult, cleanJson, parsed, localParsed, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            if (emailText.trim()) {
              _context.n = 1;
              break;
            }
            return _context.a(2);
          case 1:
            setIsAnalyzing(true);
            setExtractionNotice(null);
            prompt = "Analiza el siguiente texto de un correo electr\xF3nico de reserva de grupo y extrae la informaci\xF3n en formato JSON estrictamente.\n                Campos requeridos (usa estos nombres exactos, si no encuentras el dato devuelve un string vac\xEDo \"\"):\n                - \"Nombre del Grupo\": nombre identificativo corto (ej. ADULTOS, JUBILADOS).\n                - \"Entrada\": fecha en formato YYYY-MM-DD.\n                - \"Salida\": fecha en formato YYYY-MM-DD.\n                - \"Pax.\": n\xFAmero total de personas (entero).\n                - \"Empresa/Agencia\": nombre de la empresa o agencia.\n                - \"R\xE9gimen\": (HA, HD, MP, PC).\n                - \"Habitaciones\": resumen en texto de la distribuci\xF3n solicitada (ej. 10 dobles, 5 triples).\n                - \"roomCounts\": objeto JSON con el desglose num\xE9rico por tipo de habitaci\xF3n. USA ESTOS TIPOS SEG\xDAN EL HOTEL SI SE IDENTIFICA (si no, usa los de Sercotel Guadiana):\n                  * Sercotel Guadiana: {\"DOBLE DE USO INDIVIDUAL\": 0, \"DOBLE\": 0, \"DOBLE + SUPLETORIA\": 0, \"DOBLE + SUPLETORIA NI\xD1O\": 0, \"CU\xC1DRUPLE\": 0, \"SUITE\": 0, \"SUITE SUPERIOR\": 0}\n                  * Cumbria Spa & Hotel: {\"DOBLE DE USO INDIVIDUAL\": 0, \"DOBLE\": 0, \"DOBLE + SUPLETORIA\": 0, \"DOBLE + SUPLETORIA NI\xD1O\": 0, \"SUITE\": 0}\n                  Extrae SOLO los n\xFAmeros que encuentres. Si mencionan ni\xF1os en supletorias o triples con ni\xF1os, usa \"DOBLE + SUPLETORIA NI\xD1O\".\n                - \"Importe(*)\": precio unitario o total si se menciona, si no 0.\n                - \"Hotel\": \"Sercotel Guadiana\" o \"Cumbria Spa & Hotel\" si se menciona o deduce.\n                - \"Observaciones\": copia TODO el texto relevante del correo original que explique peticiones.\n                - \"Com_Nombre_Contacto\": nombre del remitente.\n                - \"Com_Email_Contacto\": email del remitente.\n                - \"Com_Telefono_Contacto\": tel\xE9fono.\n                - \"Fiscal_RazonSocial\": datos fiscales si aparecen.\n                - \"Fiscal_CIF\": CIF/NIF.\n                - \"Fiscal_Direccion\": direcci\xF3n.\n                - \"Fiscal_CP\": CP.\n                - \"Fiscal_Poblacion\": poblaci\xF3n.\n\n                Responde \xFAnicamente con el bloque JSON.\n                TEXTO DEL EMAIL:\n                ".concat(emailText);
            aiFailed = false;
            aiErrorMessage = "";
            _context.p = 2;
            _context.n = 3;
            return callGemini(prompt);
          case 3:
            aiResult = _context.v;
            if (aiResult && aiResult.ok && aiResult.text) {
              cleanJson = aiResult.text.replace(/```json/g, "").replace(/```/g, "").trim();
              parsed = JSON.parse(cleanJson);
              setExtractedData(parsed);
              validateData(parsed);
              setExtractionMode('ai');
              setExtractionNotice(null);
            } else {
              aiFailed = true;
              aiErrorMessage = aiResult && aiResult.error || "Error al conectar con la IA de Google.";
            }
            _context.n = 5;
            break;
          case 4:
            _context.p = 4;
            _t = _context.v;
            aiFailed = true;
            aiErrorMessage = _t.message || "Error al conectar con la IA.";
          case 5:
            if (aiFailed) {
              console.warn("[AltaEmail] Fallo en Gemini (" + aiErrorMessage + "). Activando extractor inteligente local...");
              try {
                localParsed = parseEmailTextLocally(emailText);
                setExtractedData(localParsed);
                validateData(localParsed);
                setExtractionMode('local');
                setExtractionNotice("La IA de Google no respondió (" + aiErrorMessage + "). Se han extraído los datos automáticamente con el analizador local de respaldo.");
              } catch (fallbackErr) {
                alert("Error en el análisis local de respaldo: " + fallbackErr.message);
              }
            }
            setIsAnalyzing(false);
          case 6:
            return _context.a(2);
        }
      }, _callee, null, [[2, 4]]);
    }));
    return function handleAnalyze() {
      return _ref7.apply(this, arguments);
    };
  }();
  var handleSave = /*#__PURE__*/function () {
    var _ref8 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var isValid, hotelAsignado, rawReservaId, reservaId, entrada, releaseDate, d, now, formattedDate, groupToSave, _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            if (extractedData) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            // Validate before save
            isValid = validateData(extractedData);
            if (isValid) {
              _context2.n = 2;
              break;
            }
            return _context2.a(2);
          case 2:
            // Validation: Mandatory Hotel
            hotelAsignado = String(extractedData.Hotel || "Sercotel Guadiana");
            if (!(!hotelAsignado || hotelAsignado.toLowerCase().includes("pend") || hotelAsignado.trim() === "")) {
              _context2.n = 3;
              break;
            }
            alert("⚠️ Error de Integridad: Debe asignar un hotel válido. No se permiten registros 'Pendientes'.");
            return _context2.a(2);
          case 3:
            setSaveStatus('saving');
            _context2.p = 4;
            rawReservaId = extractedData.Reserva || "PRES-".concat(Math.floor(100000 + Math.random() * 900000));
            reservaId = String(rawReservaId).trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");
            entrada = String(extractedData["Entrada"] || "");
            releaseDate = extractedData.Com_Vencimiento_Rel || "";
            if (!releaseDate && entrada) {
              d = new Date(entrada);
              if (!isNaN(d.getTime())) {
                d.setDate(d.getDate() - 15);
                releaseDate = d.toISOString().split("T")[0];
              }
            }
            now = new Date();
            formattedDate = "".concat(now.getFullYear(), "-").concat(String(now.getMonth() + 1).padStart(2, '0'), "-").concat(String(now.getDate()).padStart(2, '0'), " ").concat(String(now.getHours()).padStart(2, '0'), ":").concat(String(now.getMinutes()).padStart(2, '0'));
            groupToSave = {
              "Nombre del Grupo": String(extractedData["Nombre del Grupo"] || "Sin Nombre").toUpperCase(),
              "Entrada": entrada,
              "Salida": String(extractedData["Salida"] || ""),
              "Pax.": String(extractedData["Pax."] || "0"),
              "Habitaciones": String(extractedData["Habitaciones"] || ""),
              "roomCounts": extractedData.roomCounts || {},
              "Empresa/Agencia": String(extractedData["Empresa/Agencia"] || ""),
              "Régimen": String(extractedData["Régimen"] || "HD"),
              "Importe(*)": String(calculateTotal(extractedData) || "0"),
              "Reserva": reservaId,
              "Estado": "Presupuesto",
              "Com_Estado_Interno": extractedData.Com_Estado_Interno || "PRESUPUESTO",
              "Segment.": extractedData["Segment."] || "GRUPOS",
              "Hotel_Asignado": hotelAsignado,
              "Com_Notas": String(extractedData.Observaciones || ""),
              "Com_Vencimiento_Rel": releaseDate,
              "Com_Nombre_Contacto": String(extractedData.Com_Nombre_Contacto || ""),
              "Com_Email_Contacto": String(extractedData.Com_Email_Contacto || ""),
              "Com_Telefono_Contacto": String(extractedData.Com_Telefono_Contacto || ""),
              "Fiscal_RazonSocial": String(extractedData.Fiscal_RazonSocial || ""),
              "Fiscal_CIF": String(extractedData.Fiscal_CIF || ""),
              "Fiscal_Direccion": String(extractedData.Fiscal_Direccion || ""),
              "Fiscal_CP": String(extractedData.Fiscal_CP || ""),
              "Fiscal_Poblacion": String(extractedData.Fiscal_Poblacion || ""),
              "Com_Comercial": extractedData.Com_Comercial || "",
              "tracking": extractedData.tracking || [{
                id: Date.now(),
                date: formattedDate,
                text: "Alta Inteligente por Email (Escáner IA)."
              }],
              "dailyConfig": extractedData.dailyConfig || {},
              "RoomingList_JSON": JSON.stringify(buildRoomingList(_objectSpread(_objectSpread({}, extractedData), {}, {
                Hotel_Asignado: hotelAsignado
              }), "")),
              "createdAt": extractedData.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
              "updatedAt": firebase.firestore.FieldValue.serverTimestamp()
            };
            _context2.n = 5;
            return db.collection("groups").doc(reservaId).set(groupToSave, {
              merge: true
            });
          case 5:
            setSaveStatus('success');
            setTimeout(function () {
              return window.location.href = 'Presupuestos.html?id=' + reservaId + '&edit=1';
            }, 1200);
            _context2.n = 7;
            break;
          case 6:
            _context2.p = 6;
            _t2 = _context2.v;
            console.error(_t2);
            alert("Error al guardar: " + _t2.message);
            setSaveStatus(null);
          case 7:
            return _context2.a(2);
        }
      }, _callee2, null, [[4, 6]]);
    }));
    return function handleSave() {
      return _ref8.apply(this, arguments);
    };
  }();
  var updateField = function updateField(key, value) {
    var newData = _objectSpread(_objectSpread({}, extractedData), {}, _defineProperty({}, key, value));

    // Si cambia el hotel, podemos resetear roomCounts o dejarlo (el UI filtrará)
    // Pero es mejor asegurar que roomCounts existe
    if (key === "Hotel") {
      newData.roomCounts = newData.roomCounts || {};
    }
    setExtractedData(newData);
    validateData(newData);
  };
  var handleRoomCountChange = function handleRoomCountChange(type, val) {
    var count = parseInt(val) || 0;
    var newCounts = _objectSpread(_objectSpread({}, extractedData.roomCounts || {}), {}, _defineProperty({}, type, count));

    // Generar el string de resumen automáticamente
    var summary = Object.entries(newCounts).filter(function (_ref9) {
      var _ref0 = _slicedToArray(_ref9, 2),
        _ = _ref0[0],
        c = _ref0[1];
      return c > 0;
    }).map(function (_ref1) {
      var _ref10 = _slicedToArray(_ref1, 2),
        t = _ref10[0],
        c = _ref10[1];
      return "".concat(c, " ").concat(t);
    }).join(", ");
    setExtractedData(_objectSpread(_objectSpread({}, extractedData), {}, {
      roomCounts: newCounts,
      "Habitaciones": summary
    }));
  };
  var handleDailyConfigChange = function handleDailyConfigChange(date, type, field, val) {
    var newConfig = _objectSpread({}, extractedData.dailyConfig || {});
    if (!newConfig[date]) newConfig[date] = {};
    if (!newConfig[date][type]) newConfig[date][type] = {
      price: 0,
      board: extractedData["Régimen"] || "AD"
    };
    newConfig[date][type][field] = val;
    setExtractedData(_objectSpread(_objectSpread({}, extractedData), {}, {
      dailyConfig: newConfig
    }));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "min-h-screen bg-slate-100 flex flex-col"
  }, /*#__PURE__*/React.createElement("header", {
    className: "gradient-bg text-white p-4 shadow-xl relative overflow-hidden shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "absolute top-0 right-0 p-8 opacity-10 pointer-events-none"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "sparkles",
    className: "w-24 h-24"
  })), /*#__PURE__*/React.createElement("div", {
    className: "container mx-auto flex justify-between items-center px-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("a", {
    href: "Admin.html",
    className: "p-2 hover:bg-white/10 rounded-full transition-all"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "chevron-left",
    className: "w-5 h-5"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "text-xl font-black tracking-tight"
  }, isEditMode ? 'Editar Presupuesto' : 'Alta Inteligente'), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: isEditMode ? "edit" : "mail",
    className: "w-3 h-3"
  }), " ", isEditMode ? 'Modificando Lead' : 'Ficha desde Email'))), /*#__PURE__*/React.createElement("div", {
    className: "hidden md:flex gap-3"
  }, extractedData && /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-2 h-2 rounded-full ".concat(Object.keys(validation).length === 0 ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse')
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-bold uppercase tracking-wider"
  }, Object.keys(validation).length === 0 ? 'Datos Validados' : "".concat(Object.keys(validation).length, " campos pendientes"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-md"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black uppercase tracking-tighter text-emerald-400"
  }, "Esc\xE1ner IA 2.0"))))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 p-4 md:p-6 lg:p-8"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container mx-auto flex flex-col lg:flex-row gap-6 items-stretch"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full lg:w-[380px] xl:w-[440px] flex flex-col shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass p-5 rounded-3xl shadow-sm space-y-4 flex flex-col lg:sticky lg:top-6 border-slate-200"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "source-email",
    className: "text-sm font-black text-slate-700"
  }, "1. Pega el correo del cliente"), /*#__PURE__*/React.createElement(LucideIcon, {
    name: "brain",
    className: "text-indigo-500",
    size: 18
  })), /*#__PURE__*/React.createElement("p", {
    id: "email-help",
    className: "text-sm text-slate-500 leading-relaxed"
  }, "Incluye el remitente, las fechas y la solicitud completa. Revisa los datos antes de guardar."), /*#__PURE__*/React.createElement("textarea", {
    id: "source-email",
    "aria-describedby": "email-help",
    disabled: isAnalyzing,
    className: "w-full h-64 lg:h-80 p-4 bg-slate-50/50 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm leading-relaxed resize-y font-medium text-slate-800",
    placeholder: "Pega aqu\xED el contenido del correo...",
    value: emailText,
    onChange: function onChange(e) {
      return setEmailText(e.target.value);
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between text-xs text-slate-500"
  }, /*#__PURE__*/React.createElement("span", {
    "aria-live": "polite"
  }, emailText.length.toLocaleString("es-ES"), " caracteres"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setEmailText("");
    },
    disabled: isAnalyzing || !emailText,
    className: "font-bold text-indigo-600 hover:underline disabled:opacity-40"
  }, "Limpiar texto")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleAnalyze,
    disabled: isAnalyzing || !emailText.trim(),
    className: "w-full py-3.5 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ".concat(isAnalyzing ? 'bg-slate-400' : 'btn-ia')
  }, isAnalyzing ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-sm"
  }, "Analizando...")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "sparkles",
    className: "w-5 h-5"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-sm uppercase tracking-widest"
  }, "Analizar correo"))), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleLocalExtract,
    disabled: isAnalyzing || !emailText.trim(),
    className: "w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-50",
    title: "Extrae los datos inmediatamente usando el analizador local de tu navegador, sin usar API Key"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "cpu",
    size: 15,
    className: "text-emerald-600"
  }), /*#__PURE__*/React.createElement("span", null, "Extraer sin IA"))))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "glass rounded-3xl flex flex-col min-h-[520px] h-full shadow-sm border-slate-200 bg-white/50 backdrop-blur-xl"
  }, !extractedData && !isAnalyzing ? /*#__PURE__*/React.createElement("div", {
    className: "flex-1 flex flex-col items-center justify-center text-center p-6 md:p-10"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "clipboard-list",
    className: "w-10 h-10 text-indigo-500"
  })), /*#__PURE__*/React.createElement("h3", {
    className: "text-xl font-bold text-slate-800"
  }, "2. Revisa la ficha del grupo"), /*#__PURE__*/React.createElement("p", {
    className: "max-w-md text-sm text-slate-500 mt-3 leading-relaxed"
  }, "Pega el correo y pulsa \xABAnalizar correo\xBB. Aqu\xED aparecer\xE1n los datos para corregirlos y completar lo que falte."), /*#__PURE__*/React.createElement("div", {
    className: "grid sm:grid-cols-3 gap-3 w-full max-w-xl mt-6 text-left"
  }, [["Contacto", "Cliente, agencia y email"], ["Estancia", "Hotel, entrada y salida"], ["Solicitud", "Personas, habitaciones y régimen"]].map(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2),
      title = _ref12[0],
      description = _ref12[1];
    return /*#__PURE__*/React.createElement("div", {
      key: title,
      className: "rounded-xl border border-slate-200 bg-white p-4"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-sm font-bold text-slate-700"
    }, title), /*#__PURE__*/React.createElement("p", {
      className: "text-xs text-slate-500 mt-1"
    }, description));
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-xs text-slate-500 mt-5"
  }, "La extracci\xF3n no guarda el presupuesto. Revisa y confirma la ficha al terminar."), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap justify-center gap-4 mt-8"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var dummy = {
        "Nombre del Grupo": "",
        "Entrada": "",
        "Salida": "",
        "Pax.": "",
        "Habitaciones": "",
        "Régimen": "HD",
        "Hotel": "Sercotel Guadiana",
        "Empresa/Agencia": "",
        "Observaciones": ""
      };
      setExtractedData(dummy);
      validateData(dummy);
    },
    className: "px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all shadow-sm"
  }, "Ficha Manual"), /*#__PURE__*/React.createElement("a", {
    href: "Admin.html",
    className: "px-8 py-3 bg-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase hover:bg-slate-300 transition-all shadow-sm flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "home",
    size: 12
  }), "Volver"))) : isAnalyzing ? /*#__PURE__*/React.createElement("div", {
    className: "p-10 space-y-8 animate-pulse"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-8 w-48 bg-slate-200 rounded-lg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "h-6 w-24 bg-slate-100 rounded-full"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-4 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "h-14 bg-slate-100 rounded-xl col-span-2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "h-14 bg-slate-100 rounded-xl col-span-2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "h-14 bg-slate-100 rounded-xl"
  }), /*#__PURE__*/React.createElement("div", {
    className: "h-14 bg-slate-100 rounded-xl"
  }), /*#__PURE__*/React.createElement("div", {
    className: "h-14 bg-slate-100 rounded-xl"
  }), /*#__PURE__*/React.createElement("div", {
    className: "h-14 bg-slate-100 rounded-xl"
  })), /*#__PURE__*/React.createElement("div", {
    className: "h-40 bg-slate-50 rounded-2xl w-full"
  })) : /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col h-full overflow-hidden"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-[#1e293b] text-white p-6 shadow-inner shrink-0 hidden md:block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "file-text",
    className: "text-indigo-400"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1"
  }, "ID RESERVA"), /*#__PURE__*/React.createElement("h3", {
    className: "text-lg font-black tracking-tight"
  }, extractedData["Reserva"] || 'NUEVA PETICIÓN'))), /*#__PURE__*/React.createElement("div", {
    className: "text-center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1"
  }, "Entrada"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-black"
  }, extractedData["Entrada"] || '--')), /*#__PURE__*/React.createElement("div", {
    className: "text-center border-l border-slate-700 pl-8"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1"
  }, "Pax"), /*#__PURE__*/React.createElement("p", {
    className: "text-sm font-black text-emerald-400"
  }, extractedData["Pax."] || '0', " Pax")), (extractedData.Com_Email_Contacto || extractedData.Com_Telefono_Contacto) && /*#__PURE__*/React.createElement("div", {
    className: "text-left border-l border-slate-700 pl-8 max-w-[200px]"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1"
  }, "Contacto"), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-bold text-indigo-300 truncate"
  }, extractedData.Com_Email_Contacto || ''), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-bold text-slate-300"
  }, extractedData.Com_Telefono_Contacto || '')), /*#__PURE__*/React.createElement("div", {
    className: "text-center border-l border-slate-700 pl-8"
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1"
  }, "Total Estimado"), /*#__PURE__*/React.createElement("p", {
    className: "text-xl font-black text-amber-400 tracking-tight"
  }, calculateTotal(extractedData).toLocaleString('es-ES'), "\u20AC")))), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 overflow-y-auto py-8 px-6 md:px-10 lg:px-14"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-4xl mx-auto space-y-10"
  }, extractionNotice && /*#__PURE__*/React.createElement("div", {
    className: "bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed shadow-sm"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "alert-triangle",
    className: "w-5 h-5 text-amber-500 shrink-0 mt-0.5"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-bold"
  }, "Extracci\xF3n Local Activada"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] text-amber-800 mt-0.5"
  }, extractionNotice)), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: function onClick() {
      return setExtractionNotice(null);
    },
    className: "text-amber-500 hover:text-amber-800 font-black text-sm px-1"
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-between border-b border-slate-100 pb-4"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-lg font-black text-slate-800 tracking-tight"
  }, "Ficha Detallada de Extracci\xF3n"), extractionMode === 'ai' && /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "sparkles",
    size: 10
  }), "IA Gemini"), extractionMode === 'local' && /*#__PURE__*/React.createElement("span", {
    className: "px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "cpu",
    size: 10
  }), "Analizador Local")), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] text-slate-400 uppercase tracking-widest font-bold font-outfit"
  }, "Confirma los datos para generar el presupuesto")), Object.keys(validation).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3 animate-pulse"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "alert-triangle",
    size: 16,
    className: "text-amber-500"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black uppercase text-amber-700 tracking-wider font-outfit"
  }, Object.keys(validation).length, " pendientes"))), /*#__PURE__*/React.createElement("div", {
    className: "p-5 bg-slate-50/50 rounded-[2rem] border border-slate-200 flex items-center justify-between gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "git-pull-request",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black text-slate-400 uppercase tracking-widest"
  }, "Estado del Seguimiento"), /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-bold text-slate-600"
  }, "Define el punto actual de la negociaci\xF3n"))), /*#__PURE__*/React.createElement("select", {
    className: "bg-white border-2 border-slate-200 rounded-2xl px-6 py-3 text-xs font-black text-indigo-700 uppercase tracking-widest outline-none focus:border-indigo-500 transition-all shadow-sm",
    value: extractedData["Com_Estado_Interno"],
    onChange: function onChange(e) {
      return updateField("Com_Estado_Interno", e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "PRESUPUESTO"
  }, "Pendiente / Borrador"), /*#__PURE__*/React.createElement("option", {
    value: "ENVIADO"
  }, "Propuesta Enviada"), /*#__PURE__*/React.createElement("option", {
    value: "SEGUIMIENTO"
  }, "En Seguimiento"), /*#__PURE__*/React.createElement("option", {
    value: "CONFIRMADO"
  }, "Confirmado (Pasa a Grupo)"), /*#__PURE__*/React.createElement("option", {
    value: "DESESTIMADO"
  }, "Desestimado / Perdido"))), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col md:flex-row gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 ".concat(validation["Nombre del Grupo"] ? 'text-red-500' : 'text-slate-500')
  }, "Nombre del Grupo ", /*#__PURE__*/React.createElement("span", {
    className: "text-red-500"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    className: "w-full border-l-4 ".concat(validation["Nombre del Grupo"] ? 'border-l-red-500 bg-red-50' : 'border-l-indigo-500 bg-white', " border border-slate-200 rounded-lg px-3 py-2 text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 transition-all uppercase shadow-sm"),
    value: extractedData["Nombre del Grupo"],
    onChange: function onChange(e) {
      return updateField("Nombre del Grupo", e.target.value);
    },
    placeholder: "Grupo..."
  })), /*#__PURE__*/React.createElement("div", {
    className: "w-full md:w-64"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block"
  }, "Hotel"), /*#__PURE__*/React.createElement("select", {
    className: "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm",
    value: extractedData["Hotel"],
    onChange: function onChange(e) {
      return updateField("Hotel", e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", null, "Sercotel Guadiana"), /*#__PURE__*/React.createElement("option", null, "Cumbria Spa & Hotel")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block"
  }, "Empresa / Agencia"), /*#__PURE__*/React.createElement("input", {
    className: "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 transition-all shadow-sm",
    value: extractedData["Empresa/Agencia"],
    onChange: function onChange(e) {
      return updateField("Empresa/Agencia", e.target.value);
    },
    placeholder: "Agencia o empresa organizadora"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap md:flex-nowrap gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-[calc(50%-0.5rem)] md:w-36"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 ".concat(validation["Entrada"] ? 'text-red-500' : 'text-slate-500')
  }, "Entrada ", /*#__PURE__*/React.createElement("span", {
    className: "text-red-500"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "w-full border-l-4 ".concat(validation["Entrada"] ? 'border-l-red-500 bg-red-50' : 'border-l-emerald-500 bg-white', " border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none shadow-sm"),
    value: extractedData["Entrada"],
    onChange: function onChange(e) {
      return updateField("Entrada", e.target.value);
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "w-[calc(50%-0.5rem)] md:w-36"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 ".concat(validation["Salida"] ? 'text-red-500' : 'text-slate-500')
  }, "Salida ", /*#__PURE__*/React.createElement("span", {
    className: "text-red-500"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "date",
    className: "w-full border-l-4 ".concat(validation["Salida"] ? 'border-l-red-500 bg-red-50' : 'border-l-emerald-500 bg-white', " border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none shadow-sm"),
    value: extractedData["Salida"],
    onChange: function onChange(e) {
      return updateField("Salida", e.target.value);
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "w-[calc(30%-0.5rem)] md:w-28"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 ".concat(validation["Pax."] ? 'text-red-500' : 'text-slate-500')
  }, "Pax ", /*#__PURE__*/React.createElement("span", {
    className: "text-red-500"
  }, "*")), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    className: "w-full border-l-4 ".concat(validation["Pax."] ? 'border-l-red-500 bg-red-50' : 'border-l-indigo-500 bg-white', " border border-slate-200 rounded-lg px-3 py-2 text-sm font-black text-indigo-700 outline-none shadow-sm text-center"),
    value: extractedData["Pax."],
    onChange: function onChange(e) {
      return updateField("Pax.", e.target.value);
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-[150px]"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block"
  }, "R\xE9gimen"), /*#__PURE__*/React.createElement("select", {
    className: "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none shadow-sm",
    value: extractedData["Régimen"],
    onChange: function onChange(e) {
      return updateField("Régimen", e.target.value);
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "HA"
  }, "HA (Solo Aloj.)"), /*#__PURE__*/React.createElement("option", {
    value: "HD"
  }, "HD (Aloj. y Des.)"), /*#__PURE__*/React.createElement("option", {
    value: "MP"
  }, "MP (Media Pensi\xF3n)"), /*#__PURE__*/React.createElement("option", {
    value: "PC"
  }, "PC (Pensi\xF3n Completa)")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3 mb-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "bed",
    size: 16
  })), /*#__PURE__*/React.createElement("h3", {
    className: "text-xs font-black text-slate-800 uppercase tracking-widest"
  }, "1. Selecci\xF3n de Habitaciones (Bloqueo)")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, (ROOM_TYPES[extractedData.Hotel || "Sercotel Guadiana"] || []).map(function (type) {
    return /*#__PURE__*/React.createElement("div", {
      key: type,
      className: "px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-3 ".concat((extractedData.roomCounts || {})[type] > 0 ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200')
    }, /*#__PURE__*/React.createElement("span", {
      className: "text-[9px] font-black text-slate-500 uppercase tracking-tight truncate max-w-[120px]",
      title: type
    }, type), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      value: (extractedData.roomCounts || {})[type] || '',
      onChange: function onChange(e) {
        return handleRoomCountChange(type, e.target.value);
      },
      className: "w-12 bg-white border border-slate-100 rounded-lg py-1 text-center text-xs font-black text-slate-800 outline-none focus:border-indigo-500",
      placeholder: "0"
    }));
  }))), Object.values(extractedData.roomCounts || {}).some(function (c) {
    return c > 0;
  }) && generateDates(extractedData.Entrada, extractedData.Salida).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "animate-slide-up space-y-8 pt-6 border-t border-slate-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col md:flex-row md:items-center justify-between gap-4"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "euro",
    size: 20
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "text-sm font-black text-slate-800 uppercase tracking-widest"
  }, "2. Tarifas y R\xE9gimen por Noche"), /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1"
  }, "Configuraci\xF3n individual por tipo de habitaci\xF3n seleccionada"))), /*#__PURE__*/React.createElement("div", {
    className: "bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-[9px] font-black text-slate-400 uppercase tracking-widest px-4"
  }, "Modo: Estancia Detallada"))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-6"
  }, generateDates(extractedData.Entrada, extractedData.Salida).map(function (date) {
    var selectedTypes = (ROOM_TYPES[extractedData.Hotel || "Sercotel Guadiana"] || []).filter(function (type) {
      return (extractedData.roomCounts || {})[type] > 0;
    });
    return /*#__PURE__*/React.createElement("div", {
      key: date,
      className: "group bg-white rounded-3xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col xl:flex-row gap-6 items-start xl:items-center"
    }, /*#__PURE__*/React.createElement("div", {
      className: "shrink-0 w-32 flex flex-col gap-1"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bg-slate-800 text-white px-3 py-1 rounded-lg text-[10px] font-black w-fit uppercase tracking-widest shadow-sm"
    }, formatDate(date)), /*#__PURE__*/React.createElement("p", {
      className: "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mt-1"
    }, "Configurar Noche")), /*#__PURE__*/React.createElement("div", {
      className: "flex-1 w-full overflow-x-auto pb-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "min-w-[700px]"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mb-2 px-4 grid grid-cols-[1fr_50px_90px_110px_65px_65px_100px] gap-3 items-center text-[10px] font-black text-slate-400 uppercase tracking-widest"
    }, /*#__PURE__*/React.createElement("div", {
      className: "truncate"
    }, "HABITACI\xD3N"), /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, "UDS"), /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, "PRECIO \u20AC"), /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, "R\xC9GIMEN"), /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, "GRAT."), /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, "DTO. %"), /*#__PURE__*/React.createElement("div", {
      className: "text-right"
    }, "SUBTOTAL")), /*#__PURE__*/React.createElement("div", {
      className: "space-y-1.5"
    }, selectedTypes.map(function (type) {
      var _date;
      var config = ((_date = (extractedData.dailyConfig || {})[date]) === null || _date === void 0 ? void 0 : _date[type]) || {
        price: 0,
        board: extractedData["Régimen"] || "AD",
        gratuities: 0,
        discount: 0
      };
      var configCount = config.count !== undefined && config.count !== '' ? parseInt(config.count) : null;
      var count = configCount !== null ? configCount : (extractedData.roomCounts || {})[type] || 0;
      var subtotalWithoutDiscount = (count - (parseInt(config.gratuities) || 0)) * (parseFloat(config.price) || 0);
      var subtotal = subtotalWithoutDiscount * (1 - (parseFloat(config.discount) || 0) / 100);
      return /*#__PURE__*/React.createElement("div", {
        key: type,
        className: "grid grid-cols-[1fr_50px_90px_110px_65px_65px_100px] gap-3 items-center bg-white rounded-xl px-4 py-2 border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
      }, /*#__PURE__*/React.createElement("div", {
        className: "truncate pr-2"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-[11px] font-black text-slate-700 uppercase leading-none"
      }, type)), /*#__PURE__*/React.createElement("div", {
        className: "text-center"
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        min: "0",
        className: "w-12 bg-slate-50 border border-slate-200 rounded-lg py-1 text-[11px] font-black text-center outline-none focus:bg-white focus:border-indigo-500 text-indigo-700 transition-colors shadow-sm",
        value: count || '',
        onChange: function onChange(e) {
          return handleDailyConfigChange(date, type, 'count', e.target.value);
        },
        placeholder: "0"
      })), /*#__PURE__*/React.createElement("div", {
        className: "flex justify-center"
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        className: "w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-black text-slate-800 text-right outline-none focus:bg-white focus:border-indigo-500 transition-colors",
        value: config.price || '',
        onChange: function onChange(e) {
          return handleDailyConfigChange(date, type, 'price', e.target.value);
        },
        placeholder: "0"
      })), /*#__PURE__*/React.createElement("div", {
        className: "px-1"
      }, /*#__PURE__*/React.createElement("select", {
        className: "w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black text-slate-600 outline-none focus:bg-white focus:border-indigo-500 transition-colors",
        value: config.board || extractedData["Régimen"] || "AD",
        onChange: function onChange(e) {
          return handleDailyConfigChange(date, type, 'board', e.target.value);
        }
      }, BOARD_TYPES.map(function (b) {
        return /*#__PURE__*/React.createElement("option", {
          key: b,
          value: b.split(' ')[0]
        }, b.split(' ')[0]);
      }))), /*#__PURE__*/React.createElement("div", {
        className: "flex justify-center"
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        className: "w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 text-[10px] font-black text-center outline-none focus:bg-white focus:border-indigo-500 text-indigo-700 transition-colors",
        value: config.gratuities || '',
        onChange: function onChange(e) {
          return handleDailyConfigChange(date, type, 'gratuities', e.target.value);
        },
        placeholder: "0"
      })), /*#__PURE__*/React.createElement("div", {
        className: "flex justify-center"
      }, /*#__PURE__*/React.createElement("input", {
        type: "number",
        className: "w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 text-[10px] font-black text-center outline-none focus:bg-white focus:border-indigo-500 text-slate-400 transition-colors",
        value: config.discount || '',
        onChange: function onChange(e) {
          return handleDailyConfigChange(date, type, 'discount', e.target.value);
        },
        placeholder: "0"
      })), /*#__PURE__*/React.createElement("div", {
        className: "text-right"
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-xs font-black text-slate-800 underline decoration-indigo-200 decoration-2 underline-offset-4"
      }, formatNum(subtotal), "\u20AC")));
    }))))));
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
  }), " Contacto Directo"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-4 bg-slate-50 rounded-xl p-3 border border-slate-200 shadow-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-[200px] max-w-sm"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 block"
  }, "Nombre"), /*#__PURE__*/React.createElement("input", {
    className: "w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold",
    value: extractedData["Com_Nombre_Contacto"] || "",
    onChange: function onChange(e) {
      return updateField("Com_Nombre_Contacto", e.target.value);
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-[200px] max-w-sm"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 block"
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    className: "w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold",
    value: extractedData["Com_Email_Contacto"] || "",
    onChange: function onChange(e) {
      return updateField("Com_Email_Contacto", e.target.value);
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "w-40"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 block"
  }, "Tel\xE9fono"), /*#__PURE__*/React.createElement("input", {
    className: "w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold",
    value: extractedData["Com_Telefono_Contacto"] || "",
    onChange: function onChange(e) {
      return updateField("Com_Telefono_Contacto", e.target.value);
    }
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement("span", {
    className: "w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"
  }), " Datos de Facturaci\xF3n"), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-4 bg-white rounded-xl p-3 border border-slate-200 shadow-sm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex-1 min-w-[200px] max-w-sm"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 block"
  }, "Raz\xF3n Social"), /*#__PURE__*/React.createElement("input", {
    className: "w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold",
    value: extractedData["Fiscal_RazonSocial"] || "",
    onChange: function onChange(e) {
      return updateField("Fiscal_RazonSocial", e.target.value);
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "w-48"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 block"
  }, "CIF / NIF"), /*#__PURE__*/React.createElement("input", {
    className: "w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold",
    value: extractedData["Fiscal_CIF"] || "",
    onChange: function onChange(e) {
      return updateField("Fiscal_CIF", e.target.value);
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "w-64"
  }, /*#__PURE__*/React.createElement("label", {
    className: "text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1 block"
  }, "CP / Poblaci\xF3n"), /*#__PURE__*/React.createElement("input", {
    className: "w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold",
    value: "".concat(extractedData["Fiscal_CP"] || "", " ").concat(extractedData["Fiscal_Poblacion"] || ""),
    onChange: function onChange(e) {
      var parts = e.target.value.split(" ");
      updateField("Fiscal_CP", parts[0] || "");
      updateField("Fiscal_Poblacion", parts.slice(1).join(" ") || "");
    }
  })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    className: "text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "file-text",
    size: 12
  }), " Notas del Correo"), /*#__PURE__*/React.createElement("textarea", {
    className: "w-full bg-indigo-50/30 border border-indigo-100 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none h-16 resize-none leading-relaxed shadow-sm",
    value: extractedData["Observaciones"] || "",
    onChange: function onChange(e) {
      return updateField("Observaciones", e.target.value);
    }
  })))), /*#__PURE__*/React.createElement("div", {
    className: "shrink-0 border-t border-slate-100 bg-white/95 px-10 py-6 flex items-center justify-between gap-4 rounded-b-3xl"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return window.location.href = "Admin.html";
    },
    className: "px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 text-[10px] tracking-[0.2em] uppercase transition-all"
  }, "CANCELAR"), /*#__PURE__*/React.createElement("button", {
    onClick: handleSave,
    disabled: saveStatus === "saving" || Object.keys(validation).length > 0,
    className: "px-12 py-5 rounded-[2rem] font-black text-[11px] tracking-[0.1em] shadow-2xl transition-all duration-300 transform active:scale-95 ".concat(saveStatus === "success" ? "bg-emerald-500 text-white" : saveStatus === "saving" ? "bg-[#0f172a] text-white/50 cursor-wait opacity-80" : Object.keys(validation).length > 0 ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none" : "bg-[#0f172a] text-white hover:bg-[#1e293b] hover:translate-y-[-2px] hover:shadow-indigo-500/20")
  }, saveStatus === "success" ? /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "check-circle",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, "\xA1COTIZACI\xD3N GUARDADA!")) : saveStatus === "saving" ? /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("span", null, "PROCESANDO...")) : /*#__PURE__*/React.createElement("span", null, "CONFIRMAR Y GUARDAR COTIZACI\xD3N")))))))));
};
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
