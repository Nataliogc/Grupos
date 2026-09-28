"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/**
 * ═══════════════════════════════════════════════════════════
 * NEXUS GROUPS — Split Series Reservation Service
 * ═══════════════════════════════════════════════════════════
 * Handles atomic, idempotent and traceable splitting of
 * multi-segment quotes into individual confirmed reservations.
 * ═══════════════════════════════════════════════════════════
 */

(function (global) {
  "use strict";

  // Helper: robust date generator for stay nights using pure UTC
  function generateDatesLocal(start, end) {
    var arr = [];
    if (!start || !end) return arr;
    var s = String(start).split("T")[0].trim();
    var e = String(end).split("T")[0].trim();
    var partsS = s.includes("-") ? s.split("-") : s.split("/");
    var partsE = e.includes("-") ? e.split("-") : e.split("/");
    var yS, mS, dS, yE, mE, dE;
    if (partsS[0].length === 4) {
      yS = Number(partsS[0]);
      mS = Number(partsS[1]);
      dS = Number(partsS[2]);
    } else {
      dS = Number(partsS[0]);
      mS = Number(partsS[1]);
      yS = Number(partsS[2]);
    }
    if (partsE[0].length === 4) {
      yE = Number(partsE[0]);
      mE = Number(partsE[1]);
      dE = Number(partsE[2]);
    } else {
      dE = Number(partsE[0]);
      mE = Number(partsE[1]);
      yE = Number(partsE[2]);
    }
    if (isNaN(yS) || isNaN(mS) || isNaN(dS) || isNaN(yE) || isNaN(mE) || isNaN(dE)) return arr;
    var dt = new Date(Date.UTC(yS, mS - 1, dS));
    var endDt = new Date(Date.UTC(yE, mE - 1, dE));
    while (dt < endDt) {
      arr.push(dt.toISOString().split('T')[0]);
      dt.setUTCDate(dt.getUTCDate() + 1);
    }
    return arr;
  }

  // Helper: calculate segment total price using parent config
  function calculateSegmentTotal(budget, seg) {
    var segmentRoomCounts = {};
    var allocations = Array.isArray(seg.roomAllocations) && seg.roomAllocations.length > 0 ? seg.roomAllocations : [{
      roomType: seg.roomType || 'DOBLE DE USO INDIVIDUAL',
      rooms: Number(seg.rooms || seg.pax || 0)
    }];
    allocations.forEach(function (alloc) {
      var rType = (alloc.roomType || 'DOBLE DE USO INDIVIDUAL').toUpperCase();
      segmentRoomCounts[rType] = (segmentRoomCounts[rType] || 0) + Number(alloc.rooms || 0);
    });
    var dates = generateDatesLocal(seg.in, seg.out);
    var total = 0;
    dates.forEach(function (d) {
      var _budget$dailyConfig;
      var config = ((_budget$dailyConfig = budget.dailyConfig) === null || _budget$dailyConfig === void 0 ? void 0 : _budget$dailyConfig[d]) || {};
      Object.entries(segmentRoomCounts).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          type = _ref2[0],
          count = _ref2[1];
        if (count > 0) {
          var price = 0;
          var gratuities = 0;
          var discount = 0;
          var regime = config.board || budget["Régimen"] || "AD";
          var regimeShort = regime.split(' ')[0];
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
          }

          // Fallback to ratesOnlyGrid
          if (price === 0 && budget.ratesOnlyGrid) {
            var boardKey = regimeShort;
            var grid = budget.ratesOnlyGrid;
            if (grid[boardKey]) {
              var gridPk = Object.keys(grid[boardKey]).find(function (k) {
                return k.trim().toLowerCase() === type.trim().toLowerCase();
              });
              if (gridPk) price = parseFloat(grid[boardKey][gridPk] || 0);
            }
            if (price === 0) {
              var fallbackBoard = (budget["Régimen"] || "AD").split(' ')[0];
              if (grid[fallbackBoard]) {
                var gridPk2 = Object.keys(grid[fallbackBoard]).find(function (k) {
                  return k.trim().toLowerCase() === type.trim().toLowerCase();
                });
                if (gridPk2) price = parseFloat(grid[fallbackBoard][gridPk2] || 0);
              }
            }
          }
          var payingRooms = Math.max(0, count - gratuities);
          var lineTotal = payingRooms * price * (1 - discount / 100);
          total += lineTotal;
        }
      });
    });
    return total;
  }

  // Whitelist of fields to copy explicitly to prevent dirty properties cloning
  var COPY_WHITELIST = ["Com_Nombre_Contacto", "Com_Email_Contacto", "Com_Telefono_Contacto", "Com_Notas", "Empresa/Agencia", "Régimen", "Segment.", "Hotel_Asignado", "Hotel", "Fiscal_RazonSocial", "Fiscal_CIF", "Fiscal_Direccion", "Fiscal_CP", "Fiscal_Poblacion", "ratesOnlyGrid", "Com_Comercial", "Com_Vencimiento_Rel", "hiddenGridCols", "hiddenGridRows"];

  /**
   * splitAndConfirmMultiSegment: splits a confirmed series into individual reservations
   */
  function splitAndConfirmMultiSegment(_x) {
    return _splitAndConfirmMultiSegment.apply(this, arguments);
  }
  /**
   * confirmBudget: unified confirmation coordinator
   */
  function _splitAndConfirmMultiSegment() {
    _splitAndConfirmMultiSegment = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(_ref3) {
      var budgetId, db, confirmedBy, confirmationSource, _ref3$requestedStatus, requestedStatus, serverTimestampVal, now, formattedDate;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.n) {
          case 0:
            budgetId = _ref3.budgetId, db = _ref3.db, confirmedBy = _ref3.confirmedBy, confirmationSource = _ref3.confirmationSource, _ref3$requestedStatus = _ref3.requestedStatus, requestedStatus = _ref3$requestedStatus === void 0 ? "CONFIRMADO" : _ref3$requestedStatus;
            if (!(!budgetId || !db)) {
              _context2.n = 1;
              break;
            }
            throw new Error("Parámetros insuficientes: se requiere budgetId y db.");
          case 1:
            serverTimestampVal = new Date();
            if (global.firebase && global.firebase.firestore && global.firebase.firestore.FieldValue) {
              serverTimestampVal = global.firebase.firestore.FieldValue.serverTimestamp();
            } else if (db.app && db.app.firebase_ && db.app.firebase_.firestore && db.app.firebase_.firestore.FieldValue) {
              serverTimestampVal = db.app.firebase_.firestore.FieldValue.serverTimestamp();
            }
            now = new Date();
            formattedDate = "".concat(now.getFullYear(), "-").concat(String(now.getMonth() + 1).padStart(2, '0'), "-").concat(String(now.getDate()).padStart(2, '0'), " ").concat(String(now.getHours()).padStart(2, '0'), ":").concat(String(now.getMinutes()).padStart(2, '0')); // Perform transaction
            _context2.n = 2;
            return db.runTransaction(/*#__PURE__*/function () {
              var _ref5 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(transaction) {
                var parentDocRef, parentSnapshot, parentData, allSegments, activeSegments, seenCodes, childDocs, i, seg, childId, childDocRef, childSnapshot, childData, childTotalsSum, childWrites, parseAmount, parentTotal, parentTrack, parentUpdates;
                return _regenerator().w(function (_context) {
                  while (1) switch (_context.n) {
                    case 0:
                      parentDocRef = db.collection("groups").doc(budgetId);
                      _context.n = 1;
                      return transaction.get(parentDocRef);
                    case 1:
                      parentSnapshot = _context.v;
                      if (parentSnapshot.exists) {
                        _context.n = 2;
                        break;
                      }
                      throw new Error("El presupuesto original ".concat(budgetId, " no existe."));
                    case 2:
                      parentData = parentSnapshot.data(); // Check if already split
                      if (!(parentData.splitCompleted === true || parentData.status === "DESGLOSADO")) {
                        _context.n = 3;
                        break;
                      }
                      throw new Error("Esta serie ya ha sido desglosada previamente.");
                    case 3:
                      // Check if eligible (multi-segment with active segments > 1)
                      allSegments = parentData.segments || [];
                      activeSegments = allSegments.filter(function (seg) {
                        var hasId = seg.id && String(seg.id).trim() !== "";
                        var hasDates = seg.in && seg.out && seg.in < seg.out;
                        var hasRooms = false;
                        var allocations = Array.isArray(seg.roomAllocations) ? seg.roomAllocations : [];
                        if (allocations.length > 0) {
                          hasRooms = allocations.some(function (a) {
                            return Number(a.rooms || 0) > 0;
                          });
                        } else {
                          hasRooms = Number(seg.rooms || seg.pax || 0) > 0;
                        }
                        return hasId && hasDates && hasRooms;
                      });
                      if (!(activeSegments.length <= 1)) {
                        _context.n = 4;
                        break;
                      }
                      throw new Error("El presupuesto no califica para desglose automático (se requiere más de una estancia activa).");
                    case 4:
                      // Verify unique group codes in segments
                      seenCodes = new Set();
                      activeSegments.forEach(function (s) {
                        var code = String(s.id).trim().toUpperCase();
                        if (seenCodes.has(code)) {
                          throw new Error("La serie contiene c\xF3digos de grupo duplicados: ".concat(code));
                        }
                        seenCodes.add(code);
                      });

                      // Verify conflicts with existing documents in database
                      childDocs = [];
                      i = 0;
                    case 5:
                      if (!(i < activeSegments.length)) {
                        _context.n = 9;
                        break;
                      }
                      seg = activeSegments[i];
                      childId = String(seg.id).trim();
                      childDocRef = db.collection("groups").doc(childId);
                      _context.n = 6;
                      return transaction.get(childDocRef);
                    case 6:
                      childSnapshot = _context.v;
                      if (!childSnapshot.exists) {
                        _context.n = 7;
                        break;
                      }
                      childData = childSnapshot.data();
                      if (!(childData.parentSeriesId !== budgetId)) {
                        _context.n = 7;
                        break;
                      }
                      throw new Error("Conflicto de c\xF3digo: Ya existe una reserva con el c\xF3digo ".concat(childId, " asociada a otro grupo."));
                    case 7:
                      childDocs.push({
                        ref: childDocRef,
                        seg: seg,
                        index: i
                      });
                    case 8:
                      i++;
                      _context.n = 5;
                      break;
                    case 9:
                      // Pricing validation and child generation
                      childTotalsSum = 0;
                      childWrites = [];
                      childDocs.forEach(function (_ref6) {
                        var ref = _ref6.ref,
                          seg = _ref6.seg,
                          index = _ref6.index;
                        var segmentRoomCounts = {};
                        var allocations = Array.isArray(seg.roomAllocations) && seg.roomAllocations.length > 0 ? seg.roomAllocations : [{
                          roomType: seg.roomType || 'DOBLE DE USO INDIVIDUAL',
                          rooms: Number(seg.rooms || seg.pax || 0)
                        }];
                        allocations.forEach(function (alloc) {
                          var rType = (alloc.roomType || 'DOBLE DE USO INDIVIDUAL').toUpperCase();
                          segmentRoomCounts[rType] = (segmentRoomCounts[rType] || 0) + Number(alloc.rooms || 0);
                        });
                        var dates = generateDatesLocal(seg.in, seg.out);
                        var segmentDailyConfig = {};
                        var segmentTotal = 0;
                        var segmentRoomingList = [];
                        dates.forEach(function (d) {
                          var _parentData$dailyConf;
                          var originalConf = ((_parentData$dailyConf = parentData.dailyConfig) === null || _parentData$dailyConf === void 0 ? void 0 : _parentData$dailyConf[d]) || {};
                          segmentDailyConfig[d] = {
                            board: originalConf.board || parentData["Régimen"] || "AD",
                            prices: originalConf.prices || {},
                            counts: segmentRoomCounts,
                            gratuities: originalConf.gratuities || {},
                            discounts: originalConf.discounts || {}
                          };
                          Object.entries(segmentRoomCounts).forEach(function (_ref7) {
                            var _ref8 = _slicedToArray(_ref7, 2),
                              type = _ref8[0],
                              count = _ref8[1];
                            if (count > 0) {
                              var price = 0;
                              var gratuities = 0;
                              var discount = 0;
                              var regime = originalConf.board || parentData["Régimen"] || "AD";
                              var regimeShort = regime.split(' ')[0];
                              if (originalConf.prices) {
                                var pk = Object.keys(originalConf.prices).find(function (k) {
                                  return k.trim().toLowerCase() === type.trim().toLowerCase();
                                });
                                price = pk ? parseFloat(originalConf.prices[pk] || 0) : 0;
                                var gratKey = originalConf.gratuities ? Object.keys(originalConf.gratuities).find(function (k) {
                                  return k.trim().toLowerCase() === type.trim().toLowerCase();
                                }) : null;
                                gratuities = gratKey ? parseInt(originalConf.gratuities[gratKey] || 0) : 0;
                                var discKey = originalConf.discounts ? Object.keys(originalConf.discounts).find(function (k) {
                                  return k.trim().toLowerCase() === type.trim().toLowerCase();
                                }) : null;
                                discount = discKey ? parseFloat(originalConf.discounts[discKey] || 0) : 0;
                              }

                              // Fallback to ratesOnlyGrid
                              if (price === 0 && parentData.ratesOnlyGrid) {
                                var boardKey = regimeShort;
                                var grid = parentData.ratesOnlyGrid;
                                if (grid[boardKey]) {
                                  var gridPk = Object.keys(grid[boardKey]).find(function (k) {
                                    return k.trim().toLowerCase() === type.trim().toLowerCase();
                                  });
                                  if (gridPk) price = parseFloat(grid[boardKey][gridPk] || 0);
                                }
                                if (price === 0) {
                                  var fallbackBoard = (parentData["Régimen"] || "AD").split(' ')[0];
                                  if (grid[fallbackBoard]) {
                                    var gridPk2 = Object.keys(grid[fallbackBoard]).find(function (k) {
                                      return k.trim().toLowerCase() === type.trim().toLowerCase();
                                    });
                                    if (gridPk2) price = parseFloat(grid[fallbackBoard][gridPk2] || 0);
                                  }
                                }
                              }
                              var payingRooms = Math.max(0, count - gratuities);
                              var lineTotal = payingRooms * price * (1 - discount / 100);
                              segmentTotal += lineTotal;
                              var paxPerRoom = type.toLowerCase().includes("individual") ? 1 : 2;
                              if (payingRooms > 0) {
                                segmentRoomingList.push({
                                  id: Date.now() + Math.random() + index,
                                  hotel: parentData.Hotel_Asignado || parentData.Hotel || "Sercotel Guadiana",
                                  type: type.toUpperCase(),
                                  dateIn: d,
                                  dateOut: d,
                                  qty: payingRooms,
                                  regime: regimeShort,
                                  price: price,
                                  pax: paxPerRoom,
                                  nights: 1,
                                  total: lineTotal.toFixed(2),
                                  isService: false,
                                  comision: 0
                                });
                              }
                              if (gratuities > 0) {
                                segmentRoomingList.push({
                                  id: Date.now() + Math.random() + index + 0.5,
                                  hotel: parentData.Hotel_Asignado || parentData.Hotel || "Sercotel Guadiana",
                                  type: type.toUpperCase() + " (GRATUIDAD)",
                                  dateIn: d,
                                  dateOut: d,
                                  qty: gratuities,
                                  regime: regimeShort,
                                  price: 0,
                                  pax: paxPerRoom,
                                  nights: 1,
                                  total: "0.00",
                                  isService: false,
                                  comision: 0
                                });
                              }
                            }
                          });
                        });
                        childTotalsSum += segmentTotal;
                        var childData = {
                          Reserva: seg.id,
                          uid: seg.id,
                          "Nombre del Grupo": "".concat(parentData["Nombre del Grupo"] || "Sin Nombre", " - ").concat(seg.travelerGroupId || seg.id).toUpperCase(),
                          Entrada: seg.in,
                          Salida: seg.out,
                          "Pax.": String(seg.pax || 0),
                          declaredPax: String(seg.pax || 0),
                          roomCounts: segmentRoomCounts,
                          dailyConfig: segmentDailyConfig,
                          "Importe(*)": String(segmentTotal.toFixed(2)),
                          "RoomingList_JSON": JSON.stringify(segmentRoomingList),
                          Estado: requestedStatus === "TENTATIVA" ? "Tentativa" : "Confirmado",
                          Com_Estado_Interno: requestedStatus,
                          isMultiSegment: false,
                          segments: [],
                          // Traceability
                          parentSeriesId: budgetId,
                          sourceQuoteId: budgetId,
                          Presupuesto_Origen: budgetId,
                          isSeriesSegment: true,
                          segmentIndex: index,
                          confirmedAt: serverTimestampVal,
                          confirmedBy: confirmedBy || "Sistema",
                          confirmationSource: confirmationSource || "Directa",
                          createdAt: serverTimestampVal,
                          updatedAt: serverTimestampVal
                        };
                        COPY_WHITELIST.forEach(function (key) {
                          if (parentData[key] !== undefined) {
                            childData[key] = parentData[key];
                          }
                        });
                        childData.tracking = JSON.stringify([{
                          id: Date.now(),
                          date: formattedDate,
                          text: "Confirmada y registrada individualmente desglosada de la serie ".concat(parentData.Reserva || parentData.uid || "", ".")
                        }]);
                        childWrites.push({
                          ref: ref,
                          data: childData
                        });
                      });

                      // Helper to parse amounts formatted with dots and commas (Spanish locale)
                      parseAmount = function parseAmount(val) {
                        if (!val) return 0;
                        if (typeof val === 'number') return val;
                        var str = String(val).trim();
                        if (str.indexOf(',') !== -1) {
                          str = str.replace(/\./g, '').replace(/,/g, '.');
                        }
                        var num = parseFloat(str);
                        return isNaN(num) ? 0 : num;
                      };
                      parentTotal = parseAmount(parentData["Importe(*)"]);
                      if (!(Math.abs(childTotalsSum - parentTotal) > 0.05)) {
                        _context.n = 10;
                        break;
                      }
                      throw new Error("Reconciliaci\xF3n fallida: La suma de subtotales desglosados (\u20AC".concat(childTotalsSum.toFixed(2), ") difiere del total estimado del presupuesto (\u20AC").concat(parentTotal.toFixed(2), ")."));
                    case 10:
                      childWrites.forEach(function (_ref9) {
                        var ref = _ref9.ref,
                          data = _ref9.data;
                        transaction.set(ref, data);
                      });
                      parentTrack = [];
                      try {
                        if (typeof parentData.tracking === 'string') {
                          parentTrack = JSON.parse(parentData.tracking || "[]");
                        } else if (Array.isArray(parentData.tracking)) {
                          parentTrack = parentData.tracking;
                        }
                      } catch (e) {}
                      parentTrack.unshift({
                        id: Date.now(),
                        date: formattedDate,
                        text: "Serie confirmada y desglosada en reservas individuales: ".concat(activeSegments.map(function (s) {
                          return s.id;
                        }).join(', '))
                      });
                      parentUpdates = {
                        Com_Estado_Interno: "DESGLOSADO",
                        status: "DESGLOSADO",
                        Estado: "Desglosado",
                        excludeFromStatistics: true,
                        splitCompleted: true,
                        splitAt: serverTimestampVal,
                        splitBy: confirmedBy || "Sistema",
                        childReservationIds: activeSegments.map(function (s) {
                          return s.id;
                        }),
                        tracking: JSON.stringify(parentTrack)
                      };
                      transaction.update(parentDocRef, parentUpdates);
                    case 11:
                      return _context.a(2);
                  }
                }, _callee);
              }));
              return function (_x3) {
                return _ref5.apply(this, arguments);
              };
            }());
          case 2:
            return _context2.a(2);
        }
      }, _callee2);
    }));
    return _splitAndConfirmMultiSegment.apply(this, arguments);
  }
  function confirmBudget(_x2) {
    return _confirmBudget.apply(this, arguments);
  }
  function _confirmBudget() {
    _confirmBudget = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(_ref4) {
      var budgetId, requestedStatus, confirmationSource, db, confirmedBy, manualReservationId, docRef, snapshot, budget, hasReservation, allowed, previousStatus, allSegments, activeSegments, isMulti, isTransitioningToConfirmed, segIdsStr, msg, userAccepted, isBudgetDoc, pmsReserva, promptMsg, inputVal, now, formattedDate, track, serverTimestampVal, checkDoc, reservationData, conversionBatch, budgetUpdates, updates, _now, _formattedDate, _track, _serverTimestampVal, _updates, _t;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            budgetId = _ref4.budgetId, requestedStatus = _ref4.requestedStatus, confirmationSource = _ref4.confirmationSource, db = _ref4.db, confirmedBy = _ref4.confirmedBy, manualReservationId = _ref4.manualReservationId;
            if (!(!budgetId || !db)) {
              _context3.n = 1;
              break;
            }
            throw new Error("Parámetros insuficientes para la confirmación.");
          case 1:
            docRef = db.collection("groups").doc(budgetId);
            _context3.n = 2;
            return docRef.get();
          case 2:
            snapshot = _context3.v;
            if (snapshot.exists) {
              _context3.n = 3;
              break;
            }
            throw new Error("El presupuesto ".concat(budgetId, " no existe."));
          case 3:
            budget = snapshot.data(); // Revalidate already split
            if (!(budget.splitCompleted === true || budget.status === "DESGLOSADO" || budget.Com_Estado_Interno === "DESGLOSADO")) {
              _context3.n = 4;
              break;
            }
            throw new Error("Esta serie ya ha sido desglosada previamente.");
          case 4:
            requestedStatus = {
              PENDIENTE: "PROSPECTO",
              SEGUIMIENTO: "PRESUPUESTO"
            }[requestedStatus] || requestedStatus;
            hasReservation = !/^(PRES|COT)-/i.test(String(budget.Reserva || budgetId)) && budget.isBudget !== true;
            allowed = hasReservation ? ["TENTATIVA", "CONFIRMADO", "CANCELADO"] : ["PROSPECTO", "PRESUPUESTO", "DESESTIMADO", "TENTATIVA", "CONFIRMADO"];
            if (allowed.includes(requestedStatus)) {
              _context3.n = 5;
              break;
            }
            throw new Error("Estado no válido para la fase actual del grupo.");
          case 5:
            previousStatus = (budget.Com_Estado_Interno || budget.Estado || "").toUpperCase();
            if (!(requestedStatus === "CONFIRMADO" && previousStatus !== "CONFIRMADO")) {
              _context3.n = 6;
              break;
            }
            if (!(typeof window !== "undefined" && !window.confirm("Confirmo que el depósito del 30 % está abonado y que el cliente ha aceptado las condiciones. ¿Pasar a Confirmado?"))) {
              _context3.n = 6;
              break;
            }
            throw new Error("Confirmación cancelada: no se han declarado cumplidos los requisitos.");
          case 6:
            // Check if any segment is active (has dates & rooms) but lacks ID
            allSegments = budget.segments || [];
            allSegments.forEach(function (seg, i) {
              var hasDates = seg.in && seg.out && seg.in < seg.out;
              var hasRooms = false;
              var allocations = Array.isArray(seg.roomAllocations) ? seg.roomAllocations : [];
              if (allocations.length > 0) {
                hasRooms = allocations.some(function (a) {
                  return Number(a.rooms || 0) > 0;
                });
              } else {
                hasRooms = Number(seg.rooms || seg.pax || 0) > 0;
              }
              if (hasDates && hasRooms && (!seg.id || String(seg.id).trim() === "")) {
                throw new Error("El segmento ".concat(i + 1, " tiene fechas y habitaciones configuradas pero carece de un c\xF3digo de grupo (ID) v\xE1lido."));
              }
            });
            activeSegments = allSegments.filter(function (seg) {
              var hasId = seg.id && String(seg.id).trim() !== "";
              var hasDates = seg.in && seg.out && seg.in < seg.out;
              var hasRooms = false;
              var allocations = Array.isArray(seg.roomAllocations) ? seg.roomAllocations : [];
              if (allocations.length > 0) {
                hasRooms = allocations.some(function (a) {
                  return Number(a.rooms || 0) > 0;
                });
              } else {
                hasRooms = Number(seg.rooms || seg.pax || 0) > 0;
              }
              return hasId && hasDates && hasRooms;
            });
            isMulti = budget.isMultiSegment === true && activeSegments.length > 1; // DESGLOSE CONDITIONAL check:
            // Only split if isMulti segment, requestedStatus is "CONFIRMADO", and previousStatus is NOT "CONFIRMADO".
            // This blocks split execution if someone is only updating/saving changes on an already confirmed quote.
            isTransitioningToConfirmed = ["TENTATIVA", "CONFIRMADO"].includes(requestedStatus) && previousStatus !== requestedStatus;
            if (!(isMulti && isTransitioningToConfirmed)) {
              _context3.n = 9;
              break;
            }
            segIdsStr = activeSegments.map(function (s) {
              return s.id;
            }).join(", ");
            msg = "Esta serie contiene ".concat(activeSegments.length, " estancias. Al confirmarla se crear\xE1n ").concat(activeSegments.length, " reservas independientes con los siguientes c\xF3digos: ").concat(segIdsStr, ".\n\n\xBFDeseas continuar?");
            userAccepted = false;
            if (typeof window !== "undefined") {
              userAccepted = window.confirm(msg);
            } else {
              userAccepted = true;
            }
            if (userAccepted) {
              _context3.n = 7;
              break;
            }
            throw new Error("Operación cancelada por el usuario.");
          case 7:
            _context3.n = 8;
            return splitAndConfirmMultiSegment({
              budgetId: budgetId,
              db: db,
              confirmedBy: confirmedBy || "Usuario",
              requestedStatus: requestedStatus,
              confirmationSource: confirmationSource || "Interfaz"
            });
          case 8:
            return _context3.a(2, {
              split: true,
              childIds: activeSegments.map(function (s) {
                return s.id;
              })
            });
          case 9:
            if (!isTransitioningToConfirmed) {
              _context3.n = 25;
              break;
            }
            // REGLA FUNDAMENTAL: Al confirmar un presupuesto individual, DEBE asignarse un número de reserva manual del PMS.
            // A partir de ese momento, la referencia única y válida del grupo es el Nº de Reserva.
            // El presupuesto original queda bloqueado en modo de mera consulta histórica y no se modifica más.
            isBudgetDoc = !hasReservation;
            pmsReserva = typeof manualReservationId !== "undefined" && manualReservationId ? String(manualReservationId).trim() : "";
            if (!(isBudgetDoc && !budget.convertedToReservation && !pmsReserva)) {
              _context3.n = 11;
              break;
            }
            if (!(typeof window !== "undefined")) {
              _context3.n = 11;
              break;
            }
            promptMsg = "Introduce el NÚMERO DE RESERVA DEL PMS para pasar este grupo a " + requestedStatus + ":\n\n(A partir de este momento, la referencia única y válida oficial del grupo será este número de reserva)";
            inputVal = window.prompt(promptMsg);
            if (!(inputVal === null || !inputVal.trim())) {
              _context3.n = 10;
              break;
            }
            throw new Error("Confirmación cancelada: Se requiere un número de reserva del PMS.");
          case 10:
            pmsReserva = inputVal.trim();
          case 11:
            if (!(isBudgetDoc && (!pmsReserva || pmsReserva === budgetId))) {
              _context3.n = 12;
              break;
            }
            throw new Error("Debes asignar un número de reserva PMS para entrar en fase operativa.");
          case 12:
            now = new Date();
            formattedDate = "".concat(now.getFullYear(), "-").concat(String(now.getMonth() + 1).padStart(2, '0'), "-").concat(String(now.getDate()).padStart(2, '0'), " ").concat(String(now.getHours()).padStart(2, '0'), ":").concat(String(now.getMinutes()).padStart(2, '0'));
            track = [];
            try {
              if (typeof budget.tracking === 'string') track = JSON.parse(budget.tracking || "[]");else if (Array.isArray(budget.tracking)) track = budget.tracking;
            } catch (e) {}
            serverTimestampVal = new Date();
            if (global.firebase && global.firebase.firestore && global.firebase.firestore.FieldValue) {
              serverTimestampVal = global.firebase.firestore.FieldValue.serverTimestamp();
            } else if (db.app && db.app.firebase_ && db.app.firebase_.firestore && db.app.firebase_.firestore.FieldValue) {
              serverTimestampVal = db.app.firebase_.firestore.FieldValue.serverTimestamp();
            }
            if (!(pmsReserva && pmsReserva !== budgetId)) {
              _context3.n = 22;
              break;
            }
            if (!(pmsReserva.toUpperCase().startsWith("PRES-") || pmsReserva.toUpperCase().startsWith("COT-"))) {
              _context3.n = 13;
              break;
            }
            throw new Error("El número de reserva del PMS debe ser un localizador real (no puede ser un código de presupuesto PRES-).");
          case 13:
            if (!/[/\\.]/.test(pmsReserva)) {
              _context3.n = 14;
              break;
            }
            throw new Error("El número de reserva del PMS no puede contener barras ni puntos.");
          case 14:
            _context3.n = 15;
            return db.collection("groups").doc(pmsReserva).get();
          case 15:
            checkDoc = _context3.v;
            if (!(checkDoc.exists && checkDoc.id !== budgetId)) {
              _context3.n = 16;
              break;
            }
            throw new Error("El n\xFAmero de reserva ".concat(pmsReserva, " ya existe en el sistema."));
          case 16:
            // 1. Crear documento de la reserva oficial en groups
            reservationData = _objectSpread(_objectSpread({}, budget), {}, {
              id: pmsReserva,
              uid: pmsReserva,
              Reserva: pmsReserva,
              Presupuesto_Origen: budgetId,
              sourceQuoteId: budgetId,
              Com_Estado_Interno: requestedStatus,
              Estado: requestedStatus === "TENTATIVA" ? "Tentativa" : "Confirmado",
              isBudget: false,
              _diff: null,
              isCancelled: false,
              updatedAt: serverTimestampVal,
              tracking: JSON.stringify([{
                id: Date.now(),
                date: formattedDate,
                text: "Presupuesto ".concat(budgetId, " confirmado y asignado a reserva definitiva PMS: ").concat(pmsReserva)
              }].concat(_toConsumableArray(track)))
            });
            delete reservationData.convertedToReservation;
            delete reservationData.targetReservationId;
            delete reservationData.isHistoricalBudget;
            delete reservationData.isReadOnly;
            conversionBatch = db.batch();
            conversionBatch.set(db.collection("groups").doc(pmsReserva), reservationData);

            // 2. Marcar presupuesto original como bloqueado de mera consulta histórica
            budgetUpdates = {
              Com_Estado_Interno: requestedStatus,
              Estado: requestedStatus === "TENTATIVA" ? "Tentativa" : "Confirmado",
              convertedToReservation: pmsReserva,
              targetReservationId: pmsReserva,
              isHistoricalBudget: true,
              isReadOnly: true,
              updatedAt: serverTimestampVal,
              tracking: JSON.stringify([{
                id: Date.now(),
                date: formattedDate,
                text: "Presupuesto confirmado y asignado a reserva definitiva PMS: ".concat(pmsReserva, ". Queda bloqueado en modo de mera consulta.")
              }].concat(_toConsumableArray(track)))
            };
            conversionBatch.update(docRef, budgetUpdates);
            _context3.n = 17;
            return conversionBatch.commit();
          case 17:
            if (!(typeof window !== "undefined" && window.MesaChefService && typeof window.MesaChefService.syncGroupToMesachef === "function")) {
              _context3.n = 21;
              break;
            }
            _context3.p = 18;
            _context3.n = 19;
            return window.MesaChefService.syncGroupToMesachef(reservationData);
          case 19:
            _context3.n = 21;
            break;
          case 20:
            _context3.p = 20;
            _t = _context3.v;
            console.warn("MesaChef sync after confirmation warning:", _t);
          case 21:
            return _context3.a(2, {
              split: false,
              converted: true,
              newReservationId: pmsReserva
            });
          case 22:
            track.unshift({
              id: Date.now(),
              date: formattedDate,
              text: "Estado -> ".concat(requestedStatus).concat(requestedStatus === "CONFIRMADO" ? " | Comercial declara depósito del 30 % abonado y condiciones aceptadas: " + (confirmedBy || "Usuario") : "")
            });
            updates = {
              Com_Estado_Interno: requestedStatus,
              Estado: requestedStatus === "TENTATIVA" ? "Tentativa" : "Confirmado",
              _diff: null,
              isCancelled: false,
              updatedAt: serverTimestampVal,
              tracking: JSON.stringify(track)
            };
            _context3.n = 23;
            return docRef.update(updates);
          case 23:
            return _context3.a(2, {
              split: false,
              updates: updates
            });
          case 24:
            _context3.n = 27;
            break;
          case 25:
            // Normal update/save process: update status and timestamp in parent document
            _now = new Date();
            _formattedDate = "".concat(_now.getFullYear(), "-").concat(String(_now.getMonth() + 1).padStart(2, '0'), "-").concat(String(_now.getDate()).padStart(2, '0'), " ").concat(String(_now.getHours()).padStart(2, '0'), ":").concat(String(_now.getMinutes()).padStart(2, '0'));
            _track = [];
            try {
              if (typeof budget.tracking === 'string') {
                _track = JSON.parse(budget.tracking || "[]");
              } else if (Array.isArray(budget.tracking)) {
                _track = budget.tracking;
              }
            } catch (e) {}
            _track.unshift({
              id: Date.now(),
              date: _formattedDate,
              text: "Estado -> ".concat(requestedStatus).concat(requestedStatus === "CONFIRMADO" ? " | Comercial declara depósito del 30 % abonado y condiciones aceptadas: " + (confirmedBy || "Usuario") : "")
            });
            _serverTimestampVal = new Date();
            if (global.firebase && global.firebase.firestore && global.firebase.firestore.FieldValue) {
              _serverTimestampVal = global.firebase.firestore.FieldValue.serverTimestamp();
            } else if (db.app && db.app.firebase_ && db.app.firebase_.firestore && db.app.firebase_.firestore.FieldValue) {
              _serverTimestampVal = db.app.firebase_.firestore.FieldValue.serverTimestamp();
            }
            _updates = {
              Com_Estado_Interno: requestedStatus,
              updatedAt: _serverTimestampVal,
              tracking: JSON.stringify(_track)
            };
            if (requestedStatus === "CANCELADO" || requestedStatus === "DESESTIMADO" || requestedStatus === "CADUCADO") {
              _updates.Estado = "ANULADA";
            } else if (requestedStatus === "CONFIRMADO") {
              _updates.Estado = "Confirmado";
              _updates._diff = null;
              _updates.isCancelled = false;
            } else {
              _updates.Estado = "Presupuesto";
            }
            _context3.n = 26;
            return docRef.update(_updates);
          case 26:
            return _context3.a(2, {
              split: false,
              updates: _updates
            });
          case 27:
            return _context3.a(2);
        }
      }, _callee3, null, [[18, 20]]);
    }));
    return _confirmBudget.apply(this, arguments);
  }
  if (typeof exports !== 'undefined') {
    exports.splitAndConfirmMultiSegment = splitAndConfirmMultiSegment;
    exports.confirmBudget = confirmBudget;
  }
  global.splitAndConfirmMultiSegment = splitAndConfirmMultiSegment;
  global.confirmBudget = confirmBudget;
})(typeof window !== 'undefined' ? window : global);