"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
(function () {
  var _React = React,
    useState = _React.useState,
    useEffect = _React.useEffect,
    useRef = _React.useRef;
  var boxes = ['grupos@hotelguadiana.es', 'grupos@encumbria.es'];
  var states = ['Nueva', 'En gestión', 'Pendiente del cliente', 'Presupuestada', 'Ganada', 'Perdida'];
  var stamp = function stamp() {
    return new Date().toISOString();
  };
  var seed = function seed() {
    return [{
      id: 'demo-1',
      mailbox: boxes[0],
      subject: 'Ejemplo: solicitud de 20 habitaciones',
      from: 'agencia@example.com',
      status: 'Nueva',
      assignee: '',
      version: 1,
      updatedAt: stamp(),
      needsReply: true
    }, {
      id: 'demo-2',
      mailbox: boxes[1],
      subject: 'Ejemplo: grupo con media pensión',
      from: 'cliente@example.com',
      status: 'Nueva',
      assignee: '',
      version: 1,
      updatedAt: stamp(),
      needsReply: true
    }];
  };
  function App() {
    var _detail$messages2, _detail$messages3;
    var _useState = useState(true),
      _useState2 = _slicedToArray(_useState, 2),
      demo = _useState2[0],
      setDemo = _useState2[1],
      _useState3 = useState(seed),
      _useState4 = _slicedToArray(_useState3, 2),
      rows = _useState4[0],
      setRows = _useState4[1],
      _useState5 = useState([]),
      _useState6 = _slicedToArray(_useState5, 2),
      members = _useState6[0],
      setMembers = _useState6[1];
    var _useState7 = useState(false),
      _useState8 = _slicedToArray(_useState7, 2),
      directoryLoading = _useState8[0],
      setDirectoryLoading = _useState8[1],
      _useState9 = useState(''),
      _useState0 = _slicedToArray(_useState9, 2),
      directoryError = _useState0[0],
      setDirectoryError = _useState0[1];
    var _useState1 = useState(0),
      _useState10 = _slicedToArray(_useState1, 2),
      directoryRetry = _useState10[0],
      setDirectoryRetry = _useState10[1];
    var _useState11 = useState({
        uid: 'demo',
        name: 'Dirección de ejemplo',
        role: 'admin'
      }),
      _useState12 = _slicedToArray(_useState11, 2),
      user = _useState12[0],
      setUser = _useState12[1];
    var _useState13 = useState(''),
      _useState14 = _slicedToArray(_useState13, 2),
      selected = _useState14[0],
      setSelected = _useState14[1],
      _useState15 = useState(null),
      _useState16 = _slicedToArray(_useState15, 2),
      detail = _useState16[0],
      setDetail = _useState16[1],
      _useState17 = useState({}),
      _useState18 = _slicedToArray(_useState17, 2),
      events = _useState18[0],
      setEvents = _useState18[1];
    var _useState19 = useState(''),
      _useState20 = _slicedToArray(_useState19, 2),
      hotel = _useState20[0],
      setHotel = _useState20[1],
      _useState21 = useState('all'),
      _useState22 = _slicedToArray(_useState21, 2),
      view = _useState22[0],
      setView = _useState22[1],
      _useState23 = useState(''),
      _useState24 = _slicedToArray(_useState23, 2),
      search = _useState24[0],
      setSearch = _useState24[1];
    var _useState25 = useState(''),
      _useState26 = _slicedToArray(_useState25, 2),
      error = _useState26[0],
      setError = _useState26[1],
      _useState27 = useState(false),
      _useState28 = _slicedToArray(_useState27, 2),
      busy = _useState28[0],
      setBusy = _useState28[1],
      _useState29 = useState(false),
      _useState30 = _slicedToArray(_useState29, 2),
      loadingDetail = _useState30[0],
      setLoadingDetail = _useState30[1];
    var _useState31 = useState(''),
      _useState32 = _slicedToArray(_useState31, 2),
      email = _useState32[0],
      setEmail = _useState32[1],
      _useState33 = useState(''),
      _useState34 = _slicedToArray(_useState33, 2),
      password = _useState34[0],
      setPassword = _useState34[1],
      _useState35 = useState(''),
      _useState36 = _slicedToArray(_useState35, 2),
      note = _useState36[0],
      setNote = _useState36[1];
    var _useState37 = useState([]),
      _useState38 = _slicedToArray(_useState37, 2),
      connections = _useState38[0],
      setConnections = _useState38[1],
      _useState39 = useState(false),
      _useState40 = _slicedToArray(_useState39, 2),
      showSetup = _useState40[0],
      setShowSetup = _useState40[1];
    var _useState41 = useState(''),
      _useState42 = _slicedToArray(_useState41, 2),
      replyNotice = _useState42[0],
      setReplyNotice = _useState42[1];
    var detailSequence = useRef(0);
    useEffect(function () {
      if (!demo) return;
      var alive = true,
        sequence = 0;
      var controller = new AbortController();
      var load = /*#__PURE__*/function () {
        var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
          var current, _window$firebaseConfi, project, url, response, catalog, _t, _t2;
          return _regenerator().w(function (_context) {
            while (1) switch (_context.p = _context.n) {
              case 0:
                current = ++sequence;
                setDirectoryLoading(true);
                setDirectoryError('');
                _context.p = 1;
                project = (_window$firebaseConfi = window.firebaseConfig) === null || _window$firebaseConfi === void 0 ? void 0 : _window$firebaseConfi.projectId;
                if (project) {
                  _context.n = 2;
                  break;
                }
                throw new Error('Falta la configuración de la aplicación.');
              case 2:
                // Field mask prevents downloading the legacy users/passwords stored in settings.
                url = "https://firestore.googleapis.com/v1/projects/".concat(encodeURIComponent(project), "/databases/(default)/documents/settings/main?mask.fieldPaths=system.commercials");
                _context.n = 3;
                return fetch(url, {
                  signal: controller.signal,
                  cache: 'no-store'
                });
              case 3:
                response = _context.v;
                if (response.ok) {
                  _context.n = 4;
                  break;
                }
                throw new Error('No se pudieron cargar los comerciales de Configuración.');
              case 4:
                _t = window.NexusCommercialDirectory;
                _context.n = 5;
                return response.json();
              case 5:
                catalog = _t.fromFirestore.call(_t, _context.v);
                if (alive && current === sequence) setMembers(catalog.map(function (m) {
                  return _objectSpread(_objectSpread({}, m), {}, {
                    mailboxes: boxes
                  });
                }));
                _context.n = 7;
                break;
              case 6:
                _context.p = 6;
                _t2 = _context.v;
                if (alive && current === sequence) {
                  setMembers([]);
                  setDirectoryError(_t2.message);
                }
              case 7:
                _context.p = 7;
                if (alive && current === sequence) setDirectoryLoading(false);
                return _context.f(7);
              case 8:
                return _context.a(2);
            }
          }, _callee, null, [[1, 6, 7, 8]]);
        }));
        return function load() {
          return _ref.apply(this, arguments);
        };
      }();
      load();
      window.addEventListener('focus', load);
      return function () {
        alive = false;
        controller.abort();
        window.removeEventListener('focus', load);
      };
    }, [demo, directoryRetry]);
    var call = /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(name) {
        var _window$firebase;
        var data,
          _args2 = arguments;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              data = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : {};
              if ((_window$firebase = window.firebase) !== null && _window$firebase !== void 0 && _window$firebase.functions) {
                _context2.n = 1;
                break;
              }
              throw new Error('No se pudo cargar la conexión. Recarga la página.');
            case 1:
              _context2.n = 2;
              return firebase.app().functions('us-central1').httpsCallable(name)(data);
            case 2:
              return _context2.a(2, _context2.v.data);
          }
        }, _callee2);
      }));
      return function call(_x) {
        return _ref2.apply(this, arguments);
      };
    }();
    var refresh = /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
        var result;
        return _regenerator().w(function (_context3) {
          while (1) switch (_context3.n) {
            case 0:
              _context3.n = 1;
              return call('mailInbox');
            case 1:
              result = _context3.v;
              setRows(result.requests);
              setMembers(result.members);
              setUser(result.user);
              setConnections(result.mailboxes || []);
            case 2:
              return _context3.a(2);
          }
        }, _callee3);
      }));
      return function refresh() {
        return _ref3.apply(this, arguments);
      };
    }();
    var run = /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(fn) {
        var _t3;
        return _regenerator().w(function (_context4) {
          while (1) switch (_context4.p = _context4.n) {
            case 0:
              setBusy(true);
              setError('');
              _context4.p = 1;
              _context4.n = 2;
              return fn();
            case 2:
              _context4.n = 4;
              break;
            case 3:
              _context4.p = 3;
              _t3 = _context4.v;
              setError(_t3.message || 'No se pudo completar la operación.');
            case 4:
              _context4.p = 4;
              setBusy(false);
              return _context4.f(4);
            case 5:
              return _context4.a(2);
          }
        }, _callee4, null, [[1, 3, 4, 5]]);
      }));
      return function run(_x2) {
        return _ref4.apply(this, arguments);
      };
    }();
    useEffect(function () {
      var sequence = ++detailSequence.current;
      setDetail(null);
      setNote('');
      setReplyNotice('');
      if (!selected) {
        setLoadingDetail(false);
        return;
      }
      if (demo) {
        setLoadingDetail(false);
        setDetail({
          messages: [{
            from: 'agencia@example.com',
            receivedAt: stamp(),
            body: 'Mensaje ficticio para probar la bandeja. Necesitamos disponibilidad para un grupo. Las fechas y el número definitivo de personas están pendientes de confirmar.'
          }],
          events: events[selected] || []
        });
        return;
      }
      setLoadingDetail(true);
      call('mailDetail', {
        id: selected
      }).then(function (d) {
        if (sequence === detailSequence.current) setDetail(d);
      }).catch(function (e) {
        if (sequence === detailSequence.current) setError(e.message);
      }).finally(function () {
        if (sequence === detailSequence.current) setLoadingDetail(false);
      });
    }, [selected, demo, events]);
    var item = rows.find(function (r) {
      return r.id === selected;
    });
    var reply = function reply() {
      var direct = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      setError('');
      setReplyNotice('');
      try {
        var _detail$messages;
        var message = detail === null || detail === void 0 || (_detail$messages = detail.messages) === null || _detail$messages === void 0 ? void 0 : _detail$messages[detail.messages.length - 1];
        if (direct) setReplyNotice(window.NexusOutlookReply.launch(item, message));else {
          window.NexusOutlookReply.download(window.NexusOutlookReply.buildPayload(item, message));
          setReplyNotice('Abre respuesta.nexusreply desde tus descargas. El enlace instalado preparará el borrador en Outlook clásico con tu firma y el mensaje debajo. No se ha enviado ningún correo.');
        }
      } catch (e) {
        setError(e.message);
      }
    };
    var update = function update(action, value) {
      return run(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
        return _regenerator().w(function (_context5) {
          while (1) switch (_context5.n) {
            case 0:
              if (item) {
                _context5.n = 1;
                break;
              }
              return _context5.a(2);
            case 1:
              if (!demo) {
                _context5.n = 2;
                break;
              }
              setRows(function (old) {
                return old.map(function (r) {
                  return r.id === item.id ? _objectSpread(_objectSpread(_objectSpread({}, r), action === 'assign' ? {
                    assignee: value
                  } : action === 'status' ? {
                    status: value
                  } : {}), {}, {
                    version: r.version + 1,
                    updatedAt: stamp()
                  }) : r;
                });
              });
              setEvents(function (old) {
                return _objectSpread(_objectSpread({}, old), {}, _defineProperty({}, item.id, [{
                  actor: user.name,
                  action: action,
                  value: value,
                  at: stamp()
                }].concat(_toConsumableArray(old[item.id] || []))));
              });
              _context5.n = 5;
              break;
            case 2:
              _context5.n = 3;
              return call('mailUpdate', {
                id: item.id,
                version: item.version,
                action: action,
                value: value
              });
            case 3:
              _context5.n = 4;
              return refresh();
            case 4:
              setEvents(function (old) {
                return _objectSpread({}, old);
              });
            case 5:
              setNote('');
            case 6:
              return _context5.a(2);
          }
        }, _callee5);
      })));
    };
    var visible = rows.filter(function (r) {
      return (!hotel || r.mailbox === hotel) && (view === 'all' || (view === 'mine' ? r.assignee === (user === null || user === void 0 ? void 0 : user.uid) : !r.assignee)) && "".concat(r.subject, " ").concat(r.from).toLowerCase().includes(search.toLowerCase());
    });
    var input = 'border border-slate-300 rounded-lg p-2 bg-white w-full';
    var button = 'rounded-lg bg-emerald-800 text-white px-4 py-2 disabled:opacity-50';
    var connectionLabel = function connectionLabel(connection) {
      if (demo || !connection || connection.status === 'pending') return 'Pendiente de conectar';
      if (connection.status === 'disabled') return 'Recepción automática desactivada';
      if (connection.status === 'error') return connection.errorCode === 'authentication-failed' ? 'Revisar el acceso al buzón' : connection.errorCode === 'mailbox-changed' ? 'El servidor ha cambiado: requiere revisión' : 'No se ha podido completar la sincronización';
      return connection.connected ? 'Recepción activa' : 'Sincronización sin confirmar: revisar conexión';
    };
    return /*#__PURE__*/React.createElement("main", {
      className: "max-w-7xl mx-auto p-5 pt-24"
    }, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap justify-between gap-4 mb-5"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
      className: "text-3xl font-bold"
    }, "Peticiones de grupos"), /*#__PURE__*/React.createElement("p", {
      className: "text-slate-500"
    }, "Correos, responsables y seguimiento comercial.")), /*#__PURE__*/React.createElement("button", {
      disabled: busy,
      className: button,
      onClick: function onClick() {
        ++detailSequence.current;
        setDemo(!demo);
        setSelected('');
        setError('');
        setDetail(null);
        setEvents({});
        setRows(demo ? [] : seed());
        setMembers(demo ? [] : demoMembers);
        setUser(demo ? null : {
          uid: 'demo',
          name: 'Dirección de ejemplo',
          role: 'admin'
        });
      }
    }, demo ? 'Acceso del equipo' : 'Ver demostración')), /*#__PURE__*/React.createElement("div", {
      className: "rounded-xl p-4 bg-amber-50 border border-amber-200 mb-5"
    }, demo ? 'Demostración: datos ficticios, cambios temporales y ningún correo enviado.' : 'La bandeja muestra los mensajes incorporados desde la activación de cada buzón. Pulsa Actualizar para consultar los últimos cambios.'), /*#__PURE__*/React.createElement("div", {
      className: "grid md:grid-cols-2 gap-3 mb-5"
    }, (demo || !user ? boxes : connections.map(function (c) {
      return c.address;
    })).map(function (address) {
      var _c$issues;
      var c = !demo && connections.find(function (c) {
        return c.address === address;
      });
      return /*#__PURE__*/React.createElement("div", {
        key: address,
        className: "bg-white border rounded-xl p-4"
      }, /*#__PURE__*/React.createElement("strong", {
        className: "break-all"
      }, address), /*#__PURE__*/React.createElement("p", {
        className: "text-sm ".concat(c !== null && c !== void 0 && c.connected ? 'text-emerald-700' : 'text-amber-700')
      }, connectionLabel(c)), (c === null || c === void 0 ? void 0 : c.lastSuccessAt) && /*#__PURE__*/React.createElement("p", {
        className: "text-xs text-slate-500"
      }, "\xDAltima revisi\xF3n: ", new Date(c.lastSuccessAt).toLocaleString('es-ES')), (c === null || c === void 0 || (_c$issues = c.issues) === null || _c$issues === void 0 ? void 0 : _c$issues.length) > 0 && /*#__PURE__*/React.createElement("div", {
        className: "mt-2 text-sm text-red-800"
      }, /*#__PURE__*/React.createElement("p", null, c.issues.length >= 20 ? '20 o más' : c.issues.length, " mensajes requieren revisi\xF3n en Outlook."), c.issues.map(function (i) {
        return /*#__PURE__*/React.createElement("p", {
          key: i.id
        }, "Mensaje ", i.uid, ": ", i.code === 'message-too-large' ? 'supera el límite de 10 MB' : 'no se pudo interpretar');
      })));
    })), /*#__PURE__*/React.createElement("button", {
      className: "text-emerald-800 underline mb-4",
      onClick: function onClick() {
        return setShowSetup(!showSetup);
      },
      "aria-expanded": showSetup
    }, "Qu\xE9 falta para conectar los correos"), showSetup && /*#__PURE__*/React.createElement("section", {
      className: "border rounded-xl bg-white p-5 mb-5"
    }, /*#__PURE__*/React.createElement("h2", {
      className: "font-bold mb-2"
    }, "Datos que necesitamos de inform\xE1tica"), /*#__PURE__*/React.createElement("p", null, "Para cada direcci\xF3n: tipo de cuenta en Outlook (IMAP o Microsoft 365/Exchange), servidor de entrada y puerto. No escribas contrase\xF1as en esta p\xE1gina ni en el chat."), /*#__PURE__*/React.createElement("p", {
      className: "mt-2"
    }, "La conexi\xF3n IMAP est\xE1 preparada para recepci\xF3n segura por el puerto 993. Si las cuentas son Microsoft 365/Exchange, adaptaremos la conexi\xF3n a ese servicio."), /*#__PURE__*/React.createElement("p", {
      className: "mt-2"
    }, "Al activar la recepci\xF3n se tomar\xE1n los mensajes nuevos a partir de ese momento. Los anteriores y los adjuntos seguir\xE1n disponibles en Outlook.")), error && /*#__PURE__*/React.createElement("div", {
      role: "alert",
      className: "bg-red-50 text-red-800 rounded-xl p-4 mb-4"
    }, error), !demo && !user && /*#__PURE__*/React.createElement("form", {
      className: "bg-white border rounded-xl p-5 max-w-lg space-y-3 mb-5",
      onSubmit: function onSubmit(e) {
        e.preventDefault();
        run(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
          return _regenerator().w(function (_context6) {
            while (1) switch (_context6.n) {
              case 0:
                _context6.n = 1;
                return firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
              case 1:
                _context6.n = 2;
                return firebase.auth().signInWithEmailAndPassword(email, password);
              case 2:
                setPassword('');
                _context6.n = 3;
                return refresh();
              case 3:
                return _context6.a(2);
            }
          }, _callee6);
        })));
      }
    }, /*#__PURE__*/React.createElement("h2", {
      className: "font-bold"
    }, "Acceso seguro a peticiones"), /*#__PURE__*/React.createElement("p", {
      className: "text-sm"
    }, "El administrador debe dar de alta este acceso. La contrase\xF1a del correo no se utiliza aqu\xED."), /*#__PURE__*/React.createElement("label", {
      className: "block"
    }, "Correo de usuario", /*#__PURE__*/React.createElement("input", {
      required: true,
      type: "email",
      autoComplete: "username",
      className: input,
      value: email,
      onChange: function onChange(e) {
        return setEmail(e.target.value);
      }
    })), /*#__PURE__*/React.createElement("label", {
      className: "block"
    }, "Contrase\xF1a de acceso", /*#__PURE__*/React.createElement("input", {
      required: true,
      type: "password",
      autoComplete: "current-password",
      className: input,
      value: password,
      onChange: function onChange(e) {
        return setPassword(e.target.value);
      }
    })), /*#__PURE__*/React.createElement("button", {
      disabled: busy,
      className: button
    }, "Entrar")), (demo || user) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "flex flex-wrap gap-3 mb-5"
    }, /*#__PURE__*/React.createElement("select", {
      "aria-label": "Hotel",
      className: "border rounded-lg p-2",
      value: hotel,
      onChange: function onChange(e) {
        return setHotel(e.target.value);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Ambos hoteles"), boxes.map(function (b) {
      return /*#__PURE__*/React.createElement("option", {
        key: b
      }, b);
    })), /*#__PURE__*/React.createElement("select", {
      "aria-label": "Asignaci\xF3n",
      className: "border rounded-lg p-2",
      value: view,
      onChange: function onChange(e) {
        return setView(e.target.value);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "all"
    }, "Todas"), /*#__PURE__*/React.createElement("option", {
      value: "unassigned"
    }, "Sin asignar"), /*#__PURE__*/React.createElement("option", {
      value: "mine"
    }, "Mis peticiones")), /*#__PURE__*/React.createElement("input", {
      "aria-label": "Buscar peticiones",
      placeholder: "Buscar asunto o remitente",
      className: "border rounded-lg p-2 flex-1",
      value: search,
      onChange: function onChange(e) {
        return setSearch(e.target.value);
      }
    }), !demo && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      disabled: busy,
      className: button,
      onClick: function onClick() {
        return run(refresh);
      }
    }, "Actualizar"), /*#__PURE__*/React.createElement("button", {
      disabled: busy,
      onClick: function onClick() {
        return run(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
          return _regenerator().w(function (_context7) {
            while (1) switch (_context7.n) {
              case 0:
                _context7.n = 1;
                return firebase.auth().signOut();
              case 1:
                ++detailSequence.current;
                setUser(null);
                setRows([]);
                setSelected('');
                setDetail(null);
              case 2:
                return _context7.a(2);
            }
          }, _callee7);
        })));
      }
    }, "Cerrar sesi\xF3n"))), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-slate-500 mb-3"
    }, visible.length, " peticiones", !demo && ' · hasta 100 recientes por buzón'), /*#__PURE__*/React.createElement("div", {
      className: "grid lg:grid-cols-5 gap-5"
    }, /*#__PURE__*/React.createElement("section", {
      "aria-label": "Lista de peticiones",
      className: "lg:col-span-2 space-y-3"
    }, !visible.length && /*#__PURE__*/React.createElement("p", {
      className: "bg-white border rounded-xl p-6"
    }, "No hay peticiones para estos filtros."), visible.map(function (r) {
      var _members$find;
      return /*#__PURE__*/React.createElement("button", {
        disabled: busy,
        key: r.id,
        className: "w-full text-left p-4 border rounded-xl ".concat(selected === r.id ? 'bg-emerald-50 border-emerald-700' : 'bg-white'),
        onClick: function onClick() {
          return setSelected(r.id);
        }
      }, /*#__PURE__*/React.createElement("span", {
        className: "text-xs text-slate-500"
      }, r.mailbox), /*#__PURE__*/React.createElement("h2", {
        className: "font-bold my-1"
      }, r.subject), /*#__PURE__*/React.createElement("p", {
        className: "text-sm break-all"
      }, r.from), /*#__PURE__*/React.createElement("p", {
        className: "text-sm mt-3"
      }, r.status, " \xB7 ", ((_members$find = members.find(function (m) {
        return m.uid === r.assignee;
      })) === null || _members$find === void 0 ? void 0 : _members$find.name) || (r.assignee ? 'Comercial no disponible' : 'Sin asignar')), r.needsReply && /*#__PURE__*/React.createElement("span", {
        className: "text-xs text-amber-700"
      }, "Respuesta pendiente"));
    })), /*#__PURE__*/React.createElement("section", {
      "aria-label": "Detalle de petici\xF3n",
      className: "lg:col-span-3 bg-white border rounded-xl p-5"
    }, !item ? /*#__PURE__*/React.createElement("p", {
      className: "text-slate-500"
    }, "Selecciona una petici\xF3n para ver su conversaci\xF3n y asignarla.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h2", {
      className: "text-xl font-bold mb-4"
    }, item.subject), /*#__PURE__*/React.createElement("div", {
      className: "grid sm:grid-cols-2 gap-3"
    }, /*#__PURE__*/React.createElement("label", null, "Responsable", /*#__PURE__*/React.createElement("select", {
      disabled: busy || (user === null || user === void 0 ? void 0 : user.role) !== 'admin',
      className: input,
      value: item.assignee,
      onChange: function onChange(e) {
        return update('assign', e.target.value);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: ""
    }, "Sin asignar"), members.filter(function (m) {
      return m.mailboxes.includes(item.mailbox);
    }).map(function (m) {
      return /*#__PURE__*/React.createElement("option", {
        key: m.uid,
        value: m.uid
      }, m.name);
    }))), /*#__PURE__*/React.createElement("label", null, "Estado", /*#__PURE__*/React.createElement("select", {
      disabled: busy || (user === null || user === void 0 ? void 0 : user.role) !== 'admin' && item.assignee !== (user === null || user === void 0 ? void 0 : user.uid),
      className: input,
      value: item.status,
      onChange: function onChange(e) {
        return update('status', e.target.value);
      }
    }, states.map(function (s) {
      return /*#__PURE__*/React.createElement("option", {
        key: s
      }, s);
    })))), !item.assignee && /*#__PURE__*/React.createElement("button", {
      disabled: busy,
      className: "".concat(button, " mt-3"),
      onClick: function onClick() {
        return update('assign', user.uid);
      }
    }, "Asignarme"), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center justify-between gap-3 mt-6 mb-2"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "font-bold"
    }, "Conversaci\xF3n"), /*#__PURE__*/React.createElement("button", {
      className: button,
      disabled: busy || loadingDetail || !(detail !== null && detail !== void 0 && (_detail$messages2 = detail.messages) !== null && _detail$messages2 !== void 0 && _detail$messages2.length),
      onClick: function onClick() {
        return reply();
      }
    }, "Contestar")), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-slate-500 mb-3"
    }, "Descarga la respuesta y abre el archivo para prepararla en Outlook cl\xE1sico con tu firma y el mensaje de la agencia debajo."), replyNotice && /*#__PURE__*/React.createElement("p", {
      role: "status",
      className: "bg-emerald-50 text-emerald-900 p-3 rounded-lg mb-3"
    }, replyNotice), loadingDetail && /*#__PURE__*/React.createElement("p", null, "Cargando conversaci\xF3n\u2026"), detail === null || detail === void 0 ? void 0 : detail.messages.map(function (m, i) {
      var _m$attachments;
      return /*#__PURE__*/React.createElement("article", {
        key: i,
        className: "bg-slate-50 rounded-lg p-4 mb-3"
      }, /*#__PURE__*/React.createElement("p", {
        className: "text-sm text-slate-500 break-all"
      }, m.from, " \xB7 ", new Date(m.receivedAt).toLocaleString('es-ES')), /*#__PURE__*/React.createElement("p", {
        className: "whitespace-pre-wrap break-words mt-3"
      }, m.body), m.truncated && /*#__PURE__*/React.createElement("p", {
        className: "text-amber-800 text-sm mt-2"
      }, "Texto abreviado. Consulta el correo completo en Outlook."), m.attachmentCount > 0 && /*#__PURE__*/React.createElement("div", {
        className: "border-t mt-3 pt-3 text-sm"
      }, /*#__PURE__*/React.createElement("p", {
        className: "font-bold"
      }, m.attachmentCount, " adjuntos \xB7 disponibles en Outlook"), (_m$attachments = m.attachments) === null || _m$attachments === void 0 ? void 0 : _m$attachments.map(function (a, j) {
        return /*#__PURE__*/React.createElement("p", {
          key: j,
          className: "break-all"
        }, a.filename, " (", Math.ceil(a.size / 1024), " KB)");
      })));
    }), /*#__PURE__*/React.createElement("details", {
      className: "text-sm text-slate-500 my-4"
    }, /*#__PURE__*/React.createElement("summary", {
      className: "cursor-pointer"
    }, "Configurar Outlook en este ordenador"), /*#__PURE__*/React.createElement("p", {
      className: "mt-2"
    }, "Instala una vez el enlace de Nexus Groups para Outlook cl\xE1sico. Debes tener configurada tu firma autom\xE1tica en Outlook. Revisa el remitente y pulsa Enviar desde Outlook; abrir el borrador no marca esta petici\xF3n como contestada."), /*#__PURE__*/React.createElement("a", {
      className: "text-emerald-800 underline",
      href: "outlook/Nexus-Outlook.zip",
      download: true
    }, "Descargar enlace de Outlook"), /*#__PURE__*/React.createElement("p", null, "Descomprime el archivo y ejecuta Instalar-Outlook.ps1. Si tu empresa bloquea los scripts, pide a inform\xE1tica que lo instale."), /*#__PURE__*/React.createElement("p", {
      className: "mt-2"
    }, "La apertura directa requiere que el navegador reconozca el enlace instalado. Si no lo reconoce, usa Contestar y abre el archivo descargado."), /*#__PURE__*/React.createElement("button", {
      type: "button",
      disabled: busy || loadingDetail || !(detail !== null && detail !== void 0 && (_detail$messages3 = detail.messages) !== null && _detail$messages3 !== void 0 && _detail$messages3.length),
      className: "text-emerald-800 underline mt-2 disabled:opacity-50",
      onClick: function onClick() {
        return reply(true);
      }
    }, "Abrir directamente en Outlook")), /*#__PURE__*/React.createElement("form", {
      onSubmit: function onSubmit(e) {
        e.preventDefault();
        update('note', note.trim());
      }
    }, /*#__PURE__*/React.createElement("label", {
      className: "font-bold"
    }, "Nota interna", /*#__PURE__*/React.createElement("textarea", {
      maxLength: 4000,
      className: "".concat(input, " mt-2 font-normal"),
      value: note,
      onChange: function onChange(e) {
        return setNote(e.target.value);
      }
    })), /*#__PURE__*/React.createElement("button", {
      disabled: busy || !note.trim() || (user === null || user === void 0 ? void 0 : user.role) !== 'admin' && item.assignee !== (user === null || user === void 0 ? void 0 : user.uid),
      className: button
    }, "Guardar nota")), /*#__PURE__*/React.createElement("h3", {
      className: "font-bold mt-6"
    }, "Actividad"), detail === null || detail === void 0 ? void 0 : detail.events.map(function (e, i) {
      var _members$find2;
      return /*#__PURE__*/React.createElement("p", {
        className: "text-sm border-b py-3 whitespace-pre-wrap break-words",
        key: i
      }, e.actor, " \xB7 ", new Date(e.at).toLocaleString('es-ES'), /*#__PURE__*/React.createElement("br", null), e.action === 'note' ? e.value : e.action === 'status' ? "Estado: ".concat(e.value) : "Asignaci\xF3n: ".concat(((_members$find2 = members.find(function (m) {
        return m.uid === e.value;
      })) === null || _members$find2 === void 0 ? void 0 : _members$find2.name) || e.value || 'Sin asignar'));
    }))))));
  }
  ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})();