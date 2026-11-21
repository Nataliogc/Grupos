"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
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
  var _useState5 = useState([]),
    _useState6 = _slicedToArray(_useState5, 2),
    extractedGroups = _useState6[0],
    setExtractedGroups = _useState6[1];
  var _useState7 = useState(0),
    _useState8 = _slicedToArray(_useState7, 2),
    activeGroupIndex = _useState8[0],
    setActiveGroupIndex = _useState8[1];
  var _useState9 = useState([]),
    _useState0 = _slicedToArray(_useState9, 2),
    savedBudgets = _useState0[0],
    setSavedBudgets = _useState0[1];
  var _useState1 = useState(null),
    _useState10 = _slicedToArray(_useState1, 2),
    saveStatus = _useState10[0],
    setSaveStatus = _useState10[1];
  var _useState11 = useState({}),
    _useState12 = _slicedToArray(_useState11, 2),
    validation = _useState12[0],
    setValidation = _useState12[1];
  var _useState13 = useState(false),
    _useState14 = _slicedToArray(_useState13, 2),
    isEditMode = _useState14[0],
    setIsEditMode = _useState14[1];
  var _useState15 = useState(null),
    _useState16 = _slicedToArray(_useState15, 2),
    extractionMode = _useState16[0],
    setExtractionMode = _useState16[1];
  var _useState17 = useState(null),
    _useState18 = _slicedToArray(_useState17, 2),
    extractionNotice = _useState18[0],
    setExtractionNotice = _useState18[1];
  var extractedData = extractedGroups[activeGroupIndex] || null;
  var getGroupErrors = function getGroupErrors(data) {
    var errors = {};
    if (!data) return errors;
    if (!data["Nombre del Grupo"]) errors["Nombre del Grupo"] = true;
    if (!data["Entrada"]) errors["Entrada"] = true;
    if (!data["Salida"]) errors["Salida"] = true;
    if (!data["Pax."] || Number(data["Pax."]) <= 0) errors["Pax."] = true;
    return errors;
  };
  var setExtractedData = function setExtractedData(newData) {
    if (!newData) {
      setExtractedGroups([]);
      setActiveGroupIndex(0);
      return;
    }
    setExtractedGroups(function (prev) {
      if (!prev.length) return [newData];
      var next = _toConsumableArray(prev);
      next[activeGroupIndex] = newData;
      return next;
    });
  };
  var applyExtractedGroups = function applyExtractedGroups(groupsList) {
    var list = Array.isArray(groupsList) ? groupsList.filter(Boolean) : groupsList ? [groupsList] : [];
    setExtractedGroups(list);
    setActiveGroupIndex(0);
    setSavedBudgets([]);
    setSaveStatus(null);
    if (list.length > 0) {
      setValidation(getGroupErrors(list[0]));
    } else {
      setValidation({});
    }
  };
  var selectGroupTab = function selectGroupTab(idx) {
    if (idx < 0 || idx >= extractedGroups.length) return;
    setActiveGroupIndex(idx);
    setValidation(getGroupErrors(extractedGroups[idx]));
  };
  var handleAddAnotherDate = function handleAddAnotherDate() {
    if (!extractedData) return;
    var cleanBaseName = String(extractedData["Nombre del Grupo"] || "GRUPO NUEVO").replace(/\s*\(\d{2}\/\d{2}\s*-\s*\d{2}\/\d{2}\)\s*$/, "").trim();
    var clone = _objectSpread(_objectSpread({}, extractedData), {}, {
      "Reserva": "",
      "Nombre del Grupo": cleanBaseName,
      "Entrada": "",
      "Salida": "",
      "roomCounts": _objectSpread({}, extractedData.roomCounts || {}),
      "dailyConfig": {}
    });
    var nextList = [].concat(_toConsumableArray(extractedGroups), [clone]);
    setExtractedGroups(nextList);
    setActiveGroupIndex(nextList.length - 1);
    setValidation(getGroupErrors(clone));
  };
  var handleRemoveGroup = function handleRemoveGroup(idx) {
    if (extractedGroups.length <= 1) return;
    var nextList = extractedGroups.filter(function (_, i) {
      return i !== idx;
    });
    var nextIdx = Math.min(activeGroupIndex, nextList.length - 1);
    setExtractedGroups(nextList);
    setActiveGroupIndex(nextIdx);
    setValidation(getGroupErrors(nextList[nextIdx]));
  };
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
    var errors = getGroupErrors(data);
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
    if (window.NexusEmailParser && typeof window.NexusEmailParser.parseEmailTextLocallyMulti === 'function') {
      return window.NexusEmailParser.parseEmailTextLocallyMulti(text);
    }
    return [{
      'Nombre del Grupo': 'GRUPO NUEVO',
      'Entrada': '',
      'Salida': '',
      'Pax.': 0,
      'Empresa/Agencia': '',
      'Régimen': 'HD',
      'Habitaciones': '',
      'roomCounts': {},
      'Hotel': 'Sercotel Guadiana',
      'Observaciones': String(text || '').trim(),
      'Com_Nombre_Contacto': '',
      'Com_Email_Contacto': '',
      'Com_Telefono_Contacto': '',
      'Fiscal_RazonSocial': '',
      'Fiscal_CIF': '',
      'Fiscal_Direccion': '',
      'Fiscal_CP': '',
      'Fiscal_Poblacion': '',
      'Importe(*)': 0
    }];
  };
  var handleLocalExtract = function handleLocalExtract() {
    if (!emailText.trim()) return;
    setIsAnalyzing(true);
    setExtractionNotice(null);
    try {
      var parsedList = parseEmailTextLocally(emailText);
      applyExtractedGroups(parsedList);
      setExtractionMode('local');
    } catch (err) {
      alert("Error en la extracción local: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };
  var handleAnalyze = /*#__PURE__*/function () {
    var _ref7 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var todayIso, prompt, aiFailed, aiErrorMessage, aiResult, cleanJson, parsed, normalizedList, localParsedList, _t;
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
            todayIso = new Date().toISOString().split("T")[0];
            prompt = "Analiza el siguiente texto de un correo electr\xF3nico de reserva de grupo y extrae la informaci\xF3n en formato JSON estrictamente.\n                Fecha actual de referencia: ".concat(todayIso, ". Si una fecha no indica a\xF1o y ya ha pasado en el a\xF1o actual, usa el a\xF1o siguiente.\n                IMPORTANTE: Si el correo solicita cotizaci\xF3n para VARIAS FECHAS DISTINTAS o VARIOS GRUPOS (por ejemplo \"Del 19 al 21 de marzo\" y \"Del 15 al 17 de mayo\"), devuelve un objeto JSON con la clave \"grupos\" que contenga un array con UN objeto por cada fecha/grupo distinto: {\"grupos\": [{...}, {...}]}. Si solo hay una fecha/grupo, puedes devolver un objeto \xFAnico o {\"grupos\": [{...}]}.\n\n                Campos requeridos en cada grupo (usa estos nombres exactos, si no encuentras el dato devuelve un string vac\xEDo \"\"):\n                - \"Nombre del Grupo\": nombre identificativo corto (ej. GALEGR\xCDA VIAJES (19/03 - 21/03)).\n                - \"Entrada\": fecha en formato YYYY-MM-DD.\n                - \"Salida\": fecha en formato YYYY-MM-DD.\n                - \"Pax.\": n\xFAmero total de personas/pasajeros (entero).\n                - \"Empresa/Agencia\": nombre de la empresa o agencia.\n                - \"R\xE9gimen\": (HA, HD, MP, PC).\n                - \"Habitaciones\": resumen en texto de la distribuci\xF3n solicitada (ej. 23 dobles, 6 individuales).\n                - \"roomCounts\": objeto JSON con el desglose num\xE9rico por tipo de habitaci\xF3n. USA ESTOS TIPOS SEG\xDAN EL HOTEL SI SE IDENTIFICA (si no, usa los de Sercotel Guadiana):\n                  * Sercotel Guadiana: {\"DOBLE DE USO INDIVIDUAL\": 0, \"DOBLE\": 0, \"DOBLE + SUPLETORIA\": 0, \"DOBLE + SUPLETORIA NI\xD1O\": 0, \"CU\xC1DRUPLE\": 0, \"SUITE\": 0, \"SUITE SUPERIOR\": 0}\n                  * Cumbria Spa & Hotel: {\"DOBLE DE USO INDIVIDUAL\": 0, \"DOBLE\": 0, \"DOBLE + SUPLETORIA\": 0, \"DOBLE + SUPLETORIA NI\xD1O\": 0, \"SUITE\": 0}\n                  Extrae SOLO los n\xFAmeros que encuentres. Si mencionan ni\xF1os en supletorias o triples con ni\xF1os, usa \"DOBLE + SUPLETORIA NI\xD1O\". Si mencionan ch\xF3fer y/o gu\xEDa en single/individual, incl\xFAyelos en \"DOBLE DE USO INDIVIDUAL\".\n                - \"Importe(*)\": precio unitario o total si se menciona, si no 0.\n                - \"Hotel\": \"Sercotel Guadiana\" o \"Cumbria Spa & Hotel\" si se menciona o deduce.\n                - \"Observaciones\": copia TODO el texto relevante del correo original que explique peticiones.\n                - \"Com_Nombre_Contacto\": nombre del remitente o departamento.\n                - \"Com_Email_Contacto\": email del remitente.\n                - \"Com_Telefono_Contacto\": tel\xE9fono.\n                - \"Fiscal_RazonSocial\": datos fiscales si aparecen.\n                - \"Fiscal_CIF\": CIF/NIF.\n                - \"Fiscal_Direccion\": direcci\xF3n.\n                - \"Fiscal_CP\": CP.\n                - \"Fiscal_Poblacion\": poblaci\xF3n.\n\n                Responde \xFAnicamente con el bloque JSON.\n                TEXTO DEL EMAIL:\n                ").concat(emailText);
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
              normalizedList = window.NexusEmailParser && typeof window.NexusEmailParser.normalizeAiExtractionResponse === 'function' ? window.NexusEmailParser.normalizeAiExtractionResponse(parsed, emailText) : Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.grupos) ? parsed.grupos : [parsed];
              applyExtractedGroups(normalizedList);
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
                localParsedList = parseEmailTextLocally(emailText);
                applyExtractedGroups(localParsedList);
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
      var i, errs, hotelCheck, now, formattedDate, usedIds, createdList, idx, item, hotelAsignado, rawReservaId, reservaId, entrada, releaseDate, d, groupToSave, _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            if (extractedGroups.length) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            i = 0;
          case 2:
            if (!(i < extractedGroups.length)) {
              _context2.n = 5;
              break;
            }
            errs = getGroupErrors(extractedGroups[i]);
            if (!(Object.keys(errs).length > 0)) {
              _context2.n = 3;
              break;
            }
            setActiveGroupIndex(i);
            setValidation(errs);
            return _context2.a(2);
          case 3:
            hotelCheck = String(extractedGroups[i].Hotel || "Sercotel Guadiana");
            if (!(!hotelCheck || hotelCheck.toLowerCase().includes("pend") || hotelCheck.trim() === "")) {
              _context2.n = 4;
              break;
            }
            setActiveGroupIndex(i);
            alert("⚠️ Error de Integridad: Debe asignar un hotel válido en el Grupo " + (i + 1) + ". No se permiten registros 'Pendientes'.");
            return _context2.a(2);
          case 4:
            i++;
            _context2.n = 2;
            break;
          case 5:
            setSaveStatus('saving');
            _context2.p = 6;
            now = new Date();
            formattedDate = "".concat(now.getFullYear(), "-").concat(String(now.getMonth() + 1).padStart(2, '0'), "-").concat(String(now.getDate()).padStart(2, '0'), " ").concat(String(now.getHours()).padStart(2, '0'), ":").concat(String(now.getMinutes()).padStart(2, '0'));
            usedIds = new Set();
            createdList = [];
            idx = 0;
          case 7:
            if (!(idx < extractedGroups.length)) {
              _context2.n = 10;
              break;
            }
            item = extractedGroups[idx];
            hotelAsignado = String(item.Hotel || "Sercotel Guadiana");
            rawReservaId = item.Reserva;
            if (!rawReservaId) {
              do {
                rawReservaId = "PRES-".concat(Math.floor(100000 + Math.random() * 900000));
              } while (usedIds.has(rawReservaId));
            }
            reservaId = String(rawReservaId).trim().replace(/\.0$/, "").replace(/[\/\\]/g, "-");
            usedIds.add(reservaId);
            entrada = String(item["Entrada"] || "");
            releaseDate = item.Com_Vencimiento_Rel || "";
            if (!releaseDate && entrada) {
              d = new Date(entrada);
              if (!isNaN(d.getTime())) {
                d.setDate(d.getDate() - 15);
                releaseDate = d.toISOString().split("T")[0];
              }
            }
            groupToSave = {
              "Nombre del Grupo": String(item["Nombre del Grupo"] || "Sin Nombre").toUpperCase(),
              "Entrada": entrada,
              "Salida": String(item["Salida"] || ""),
              "Pax.": String(item["Pax."] || "0"),
              "Habitaciones": String(item["Habitaciones"] || ""),
              "roomCounts": item.roomCounts || {},
              "Empresa/Agencia": String(item["Empresa/Agencia"] || ""),
              "Régimen": String(item["Régimen"] || "HD"),
              "Importe(*)": String(calculateTotal(item) || "0"),
              "Reserva": reservaId,
              "Estado": "Presupuesto",
              "Com_Estado_Interno": item.Com_Estado_Interno || "PRESUPUESTO",
              "Segment.": item["Segment."] || "GRUPOS",
              "Hotel_Asignado": hotelAsignado,
              "Com_Notas": String(item.Observaciones || ""),
              "Com_Vencimiento_Rel": releaseDate,
              "Com_Nombre_Contacto": String(item.Com_Nombre_Contacto || ""),
              "Com_Email_Contacto": String(item.Com_Email_Contacto || ""),
              "Com_Telefono_Contacto": String(item.Com_Telefono_Contacto || ""),
              "Fiscal_RazonSocial": String(item.Fiscal_RazonSocial || ""),
              "Fiscal_CIF": String(item.Fiscal_CIF || ""),
              "Fiscal_Direccion": String(item.Fiscal_Direccion || ""),
              "Fiscal_CP": String(item.Fiscal_CP || ""),
              "Fiscal_Poblacion": String(item.Fiscal_Poblacion || ""),
              "Com_Comercial": item.Com_Comercial || "",
              "tracking": item.tracking || [{
                id: Date.now() + idx,
                date: formattedDate,
                text: "Alta Inteligente por Email (Escáner IA)."
              }],
              "dailyConfig": item.dailyConfig || {},
              "RoomingList_JSON": JSON.stringify(buildRoomingList(_objectSpread(_objectSpread({}, item), {}, {
                Hotel_Asignado: hotelAsignado
              }), "")),
              "createdAt": item.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
              "updatedAt": firebase.firestore.FieldValue.serverTimestamp()
            };
            _context2.n = 8;
            return db.collection("groups").doc(reservaId).set(groupToSave, {
              merge: true
            });
          case 8:
            createdList.push({
              reservaId: reservaId,
              nombre: groupToSave["Nombre del Grupo"],
              entrada: groupToSave["Entrada"],
              salida: groupToSave["Salida"],
              pax: groupToSave["Pax."],
              hotel: hotelAsignado
            });
          case 9:
            idx++;
            _context2.n = 7;
            break;
          case 10:
            setSavedBudgets(createdList);
            setSaveStatus('success');
            if (createdList.length === 1) {
              setTimeout(function () {
                return window.location.href = 'Presupuestos.html?id=' + createdList[0].reservaId + '&edit=1';
              }, 1200);
            }
            _context2.n = 12;
            break;
          case 11:
            _context2.p = 11;
            _t2 = _context2.v;
            console.error(_t2);
            alert("Error al guardar: " + _t2.message);
            setSaveStatus(null);
          case 12:
            return _context2.a(2);
        }
      }, _callee2, null, [[6, 11]]);
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
      applyExtractedGroups([dummy]);
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
  }, calculateTotal(extractedData).toLocaleString('es-ES'), "\u20AC")))), extractedGroups.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "bg-indigo-50/90 border-b border-indigo-200 px-6 py-4 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap items-center justify-between gap-3 mb-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "calendar",
    size: 16
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-black text-indigo-950 uppercase tracking-wider"
  }, extractedGroups.length, " fechas / grupos detectados en el correo"), /*#__PURE__*/React.createElement("p", {
    className: "text-[11px] font-medium text-indigo-700"
  }, "Revisa cada pesta\xF1a antes de guardar. Se generar\xE1 un presupuesto independiente por cada fecha."))), !isEditMode && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleAddAnotherDate,
    className: "px-3 py-1.5 bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "plus",
    size: 12
  }), "A\xF1adir otra fecha")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, extractedGroups.map(function (grp, idx) {
    var errsCount = Object.keys(getGroupErrors(grp)).length;
    var isActive = idx === activeGroupIndex;
    var dateLabel = grp.Entrada && grp.Salida ? "".concat(formatDate(grp.Entrada), " \u2192 ").concat(formatDate(grp.Salida)) : grp.Entrada ? formatDate(grp.Entrada) : 'Sin fechas';
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      onClick: function onClick() {
        return selectGroupTab(idx);
      },
      className: "cursor-pointer px-3.5 py-2 rounded-xl border-2 transition-all flex items-center gap-2.5 ".concat(isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-indigo-200 text-slate-700 hover:border-indigo-400')
    }, /*#__PURE__*/React.createElement("span", {
      className: "w-2 h-2 rounded-full shrink-0 ".concat(errsCount === 0 ? isActive ? 'bg-emerald-300' : 'bg-emerald-500' : 'bg-amber-400 animate-pulse')
    }), /*#__PURE__*/React.createElement("div", {
      className: "text-left"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-[10px] font-black uppercase tracking-wider leading-tight ".concat(isActive ? 'text-indigo-100' : 'text-slate-400')
    }, "Grupo ", idx + 1, " \xB7 ", grp["Pax."] || 0, " Pax"), /*#__PURE__*/React.createElement("p", {
      className: "text-xs font-black leading-tight mt-0.5 ".concat(isActive ? 'text-white' : 'text-slate-800')
    }, dateLabel)), extractedGroups.length > 1 && /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: function onClick(e) {
        e.stopPropagation();
        handleRemoveGroup(idx);
      },
      title: "Eliminar esta fecha",
      className: "ml-1 p-1 rounded-lg transition-colors ".concat(isActive ? 'hover:bg-white/20 text-indigo-100' : 'hover:bg-red-50 text-slate-400 hover:text-red-500')
    }, /*#__PURE__*/React.createElement(LucideIcon, {
      name: "x",
      size: 12
    })));
  }))), saveStatus === "success" && savedBudgets.length > 1 && /*#__PURE__*/React.createElement("div", {
    className: "bg-emerald-50 border-b border-emerald-200 px-6 py-4 shrink-0"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2.5 mb-3"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "check-circle",
    size: 18,
    className: "text-emerald-600"
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-xs font-black text-emerald-900 uppercase tracking-wider"
  }, "\xA1Se han creado ", savedBudgets.length, " presupuestos independientes!")), /*#__PURE__*/React.createElement("div", {
    className: "flex flex-wrap gap-2"
  }, savedBudgets.map(function (b) {
    return /*#__PURE__*/React.createElement("a", {
      key: b.reservaId,
      href: "Presupuestos.html?id=".concat(encodeURIComponent(b.reservaId), "&edit=1"),
      className: "px-3.5 py-2 bg-white border border-emerald-300 hover:bg-emerald-600 hover:text-white text-emerald-900 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
    }, /*#__PURE__*/React.createElement("span", {
      className: "font-black"
    }, b.reservaId), /*#__PURE__*/React.createElement("span", {
      className: "opacity-75"
    }, "(", formatDate(b.entrada), " \u2192 ", formatDate(b.salida), ")"), /*#__PURE__*/React.createElement(LucideIcon, {
      name: "external-link",
      size: 12
    }));
  }))), /*#__PURE__*/React.createElement("div", {
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
  }, "Confirma los datos para generar el presupuesto")), /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-2"
  }, !isEditMode && extractedGroups.length === 1 && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: handleAddAnotherDate,
    className: "px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all",
    title: "A\xF1adir otra fecha para crear un presupuesto adicional con los mismos datos base"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "plus",
    size: 12
  }), "A\xF1adir otra fecha"), Object.keys(validation).length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "px-4 py-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3 animate-pulse"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "alert-triangle",
    size: 16,
    className: "text-amber-500"
  }), /*#__PURE__*/React.createElement("span", {
    className: "text-[10px] font-black uppercase text-amber-700 tracking-wider font-outfit"
  }, Object.keys(validation).length, " pendientes")))), /*#__PURE__*/React.createElement("div", {
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
    disabled: saveStatus === "saving" || extractedGroups.some(function (g) {
      return Object.keys(getGroupErrors(g)).length > 0;
    }),
    className: "px-12 py-5 rounded-[2rem] font-black text-[11px] tracking-[0.1em] shadow-2xl transition-all duration-300 transform active:scale-95 ".concat(saveStatus === "success" ? "bg-emerald-500 text-white" : saveStatus === "saving" ? "bg-[#0f172a] text-white/50 cursor-wait opacity-80" : extractedGroups.some(function (g) {
      return Object.keys(getGroupErrors(g)).length > 0;
    }) ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none" : "bg-[#0f172a] text-white hover:bg-[#1e293b] hover:translate-y-[-2px] hover:shadow-indigo-500/20")
  }, saveStatus === "success" ? /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement(LucideIcon, {
    name: "check-circle",
    size: 16
  }), /*#__PURE__*/React.createElement("span", null, savedBudgets.length > 1 ? "\xA1".concat(savedBudgets.length, " COTIZACIONES GUARDADAS!") : "¡COTIZACIÓN GUARDADA!")) : saveStatus === "saving" ? /*#__PURE__*/React.createElement("div", {
    className: "flex items-center gap-3"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"
  }), /*#__PURE__*/React.createElement("span", null, "PROCESANDO...")) : /*#__PURE__*/React.createElement("span", null, extractedGroups.length > 1 ? "CONFIRMAR Y GUARDAR LAS ".concat(extractedGroups.length, " COTIZACIONES") : "CONFIRMAR Y GUARDAR COTIZACIÓN")))))))));
};
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
