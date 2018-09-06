"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Flux = exports.FluxFramework = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _errorStackParser = _interopRequireDefault(require("error-stack-parser"));

var _events = require("events");

var _cloneDeep = _interopRequireDefault(require("lodash/cloneDeep"));

var _debounce = _interopRequireDefault(require("lodash/debounce"));

var _get = _interopRequireDefault(require("lodash/get"));

var _merge = _interopRequireDefault(require("lodash/merge"));

var _set = _interopRequireDefault(require("lodash/set"));

var _ArkhamConstants = require("../constants/ArkhamConstants");

var _Store = require("../Store/Store");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * FluxFramework
 * @type {EventEmitter}
 */
var FluxFramework =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(FluxFramework, _EventEmitter);

  // Public properties
  // Private properties

  /**
   * Create a new instance of Flux.  Note that the Flux object
   * is a Singleton pattern, so only one should ever exist.
   *
   * @constructor
   * @this {FluxFramework}
   */
  function FluxFramework() {
    var _this;

    _classCallCheck(this, FluxFramework);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(FluxFramework).call(this)); // Methods

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "isInit", false);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "pluginTypes", ['preDispatch', 'postDispatch']);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "state", {});

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "storeClasses", {});

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "defaultOptions", {
      name: 'arkhamjs',
      routerType: 'browser',
      scrollToTop: true,
      state: null,
      storage: null,
      storageWait: 300,
      stores: [],
      title: 'ArkhamJS'
    });

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "middleware", {});

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "options", _this.defaultOptions);

    _defineProperty(_assertThisInitialized(_assertThisInitialized(_this)), "updateStorage", function () {
      return Promise.resolve(false);
    });

    _this.addMiddleware = _this.addMiddleware.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.addStores = _this.addStores.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.clearAppData = _this.clearAppData.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.clearMiddleware = _this.clearMiddleware.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.deregister = _this.deregister.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.deregisterStores = _this.deregisterStores.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.dispatch = _this.dispatch.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.getClass = _this.getClass.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.getOptions = _this.getOptions.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.getState = _this.getState.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.getStore = _this.getStore.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.init = _this.init.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.off = _this.off.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.register = _this.register.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.registerStores = _this.registerStores.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.removeMiddleware = _this.removeMiddleware.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.removeStores = _this.removeStores.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.reset = _this.reset.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.setState = _this.setState.bind(_assertThisInitialized(_assertThisInitialized(_this)));
    _this.setStore = _this.setStore.bind(_assertThisInitialized(_assertThisInitialized(_this))); // Add middleware plugin types

    _this.pluginTypes.forEach(function (type) {
      return _this.middleware["".concat(type, "List")] = [];
    });

    return _this;
  }
  /**
   * Add middleware to framework.
   *
   * @param {array} middleware An array of middleware to add to the framework.
   */


  _createClass(FluxFramework, [{
    key: "addMiddleware",
    value: function addMiddleware(middleware) {
      var _this2 = this;

      middleware.forEach(function (middleObj) {
        // Make sure middleware is either a class or object.
        if (!!middleObj && (typeof middleObj === 'function' || _typeof(middleObj) === 'object')) {
          var middleName = middleObj.name || '';

          if (!middleName) {
            throw Error('Unknown middleware is not configured properly. Requires name property. Cannot add to Flux.');
          } // Sort middleware plugins for efficiency


          _this2.pluginTypes.forEach(function (type) {
            var method = middleObj[type];
            var plugin = {
              method: method,
              name: middleName
            };
            _this2.middleware["".concat(type, "List")] = _this2.addPlugin(type, plugin);
          });
        } else {
          throw Error('Unknown middleware is not configured properly. Cannot add to Flux.');
        }
      });
    }
    /**
     * Remove all app data from storage.
     *
     * @returns {Promise<boolean>} Whether app data was successfully removed.
     */

  }, {
    key: "clearAppData",
    value: function clearAppData() {
      var _this3 = this;

      // Set all store data to initial state
      Object.keys(this.storeClasses).forEach(function (storeName) {
        var storeCls = _this3.storeClasses[storeName];
        _this3.state[storeCls.name] = (0, _cloneDeep.default)(storeCls.initialState());
      });
      var _this$options = this.options,
          name = _this$options.name,
          storage = _this$options.storage;

      if (storage) {
        return storage.setStorageData(name, this.state);
      }

      return Promise.resolve(true);
    }
    /**
     * Remove all middleware.
     *
     * @returns {boolean} Whether middleware was successfully removed.
     */

  }, {
    key: "clearMiddleware",
    value: function clearMiddleware() {
      var _this4 = this;

      // Set all store data to initial state
      Object.keys(this.middleware).forEach(function (pluginType) {
        _this4.middleware[pluginType] = [];
      });
      return true;
    }
    /**
     * De-registers named stores.
     *
     * @param {array} storeNames An array of store names to remove from the framework.
     */

  }, {
    key: "removeStores",
    value: function removeStores(storeNames) {
      var _this5 = this;

      storeNames.forEach(function (name) {
        return _this5.deregister(name);
      });
    }
  }, {
    key: "deregisterStores",
    value: function deregisterStores(storeNames) {
      console.warn('ArkhamJS Deprecation: Flux.deregisterStores has been deprecated in favor of Flux.removeStores.');
      this.removeStores(storeNames);
    }
    /**
     * Dispatches an action to all stores.
     *
     * @param {object} action to dispatch to all the stores.
     * @param {boolean} silent To silence any events.
     * @returns {Promise} The promise is resolved when and if the app saves data to storage, returning
     * the action.
     */

  }, {
    key: "dispatch",
    value: function () {
      var _dispatch = _asyncToGenerator(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee3(action) {
        var _this6 = this;

        var silent,
            clonedAction,
            startTime,
            stack,
            stackProperty,
            stackTraceLimit,
            options,
            appInfo,
            _this$middleware,
            _this$middleware$post,
            postDispatchList,
            _this$middleware$preD,
            preDispatchList,
            _clonedAction,
            type,
            data,
            storage,
            endTime,
            duration,
            _args3 = arguments;

        return _regenerator.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                silent = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : false;

                if (action) {
                  _context3.next = 3;
                  break;
                }

                throw new Error('ArkhamJS Error: Flux.dispatch requires an action.');

              case 3:
                clonedAction = (0, _cloneDeep.default)(action || {
                  type: ''
                }); // Log duration of dispatch

                startTime = +new Date(); // Get stack

                stack = [];

                try {
                  stackProperty = 'stackTraceLimit';
                  stackTraceLimit = Error.stackTraceLimit;
                  Error[stackProperty] = Infinity;
                  stack = _errorStackParser.default.parse(new Error());
                  Error[stackProperty] = stackTraceLimit;
                } catch (error) {} // Get options


                options = (0, _cloneDeep.default)(this.options); // App info

                appInfo = {
                  duration: 0,
                  options: options,
                  stack: stack
                }; // Apply middleware before the action is processed

                _this$middleware = this.middleware, _this$middleware$post = _this$middleware.postDispatchList, postDispatchList = _this$middleware$post === void 0 ? [] : _this$middleware$post, _this$middleware$preD = _this$middleware.preDispatchList, preDispatchList = _this$middleware$preD === void 0 ? [] : _this$middleware$preD;

                if (!preDispatchList.length) {
                  _context3.next = 14;
                  break;
                }

                _context3.next = 13;
                return Promise.all(preDispatchList.map(
                /*#__PURE__*/
                function () {
                  var _ref = _asyncToGenerator(
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee(plugin) {
                    return _regenerator.default.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            return _context.abrupt("return", plugin.method((0, _cloneDeep.default)(clonedAction), (0, _cloneDeep.default)(_this6.state), appInfo));

                          case 1:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee, this);
                  }));

                  return function (_x2) {
                    return _ref.apply(this, arguments);
                  };
                }())).then(function (actions) {
                  return _merge.default.apply(void 0, [(0, _cloneDeep.default)(clonedAction)].concat(_toConsumableArray((0, _cloneDeep.default)(actions))));
                }).catch(function (error) {
                  throw error;
                });

              case 13:
                clonedAction = _context3.sent;

              case 14:
                _clonedAction = clonedAction, type = _clonedAction.type, data = _objectWithoutProperties(_clonedAction, ["type"]); // Require a type

                if (!(!type || type === '')) {
                  _context3.next = 18;
                  break;
                }

                console.warn('ArkhamJS Warning: Flux.dispatch is missing an action type for the payload:', data);
                return _context3.abrupt("return", Promise.resolve(clonedAction).catch(function (error) {
                  throw error;
                }));

              case 18:
                // When an action comes in, it must be completely handled by all stores
                Object.keys(this.storeClasses).forEach(function (storeName) {
                  var storeCls = _this6.storeClasses[storeName];
                  var state = (0, _cloneDeep.default)(_this6.state[storeName]) || (0, _cloneDeep.default)(storeCls.initialState()) || {};
                  _this6.state[storeName] = (0, _cloneDeep.default)(storeCls.onAction(type, data, state)) || state;
                }); // Save cache in storage

                storage = this.options.storage;

                if (!storage) {
                  _context3.next = 28;
                  break;
                }

                _context3.prev = 21;
                _context3.next = 24;
                return this.updateStorage();

              case 24:
                _context3.next = 28;
                break;

              case 26:
                _context3.prev = 26;
                _context3.t0 = _context3["catch"](21);

              case 28:
                endTime = +new Date();
                duration = endTime - startTime;
                appInfo.duration = duration;

                if (!postDispatchList.length) {
                  _context3.next = 35;
                  break;
                }

                _context3.next = 34;
                return Promise.all(postDispatchList.map(
                /*#__PURE__*/
                function () {
                  var _ref2 = _asyncToGenerator(
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee2(plugin) {
                    return _regenerator.default.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            return _context2.abrupt("return", plugin.method((0, _cloneDeep.default)(clonedAction), (0, _cloneDeep.default)(_this6.state), appInfo));

                          case 1:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2, this);
                  }));

                  return function (_x3) {
                    return _ref2.apply(this, arguments);
                  };
                }())).then(function (actions) {
                  return _merge.default.apply(void 0, [(0, _cloneDeep.default)(clonedAction)].concat(_toConsumableArray((0, _cloneDeep.default)(actions))));
                }).catch(function (error) {
                  throw error;
                });

              case 34:
                clonedAction = _context3.sent;

              case 35:
                if (!silent) {
                  this.emit(type, clonedAction);
                }

                return _context3.abrupt("return", Promise.resolve(clonedAction));

              case 37:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[21, 26]]);
      }));

      return function dispatch(_x) {
        return _dispatch.apply(this, arguments);
      };
    }()
    /**
     * Get a store object that is registered with Flux.
     *
     * @param {string} name The name of the store.
     * @returns {Store} the store object.
     */

  }, {
    key: "getClass",
    value: function getClass() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      return this.storeClasses[name];
    }
    /**
     * Get the current Flux options.
     *
     * @returns {FluxOptions} the Flux options object.
     */

  }, {
    key: "getOptions",
    value: function getOptions() {
      return this.options;
    }
    /**
     * Get the current state object.
     *
     * @param {string|array} [name] (optional) The name of the store for an object, otherwise it will return all store
     *   objects. You can also use an array to specify a property path within the object.
     * @param {any} [defaultValue] (optional) A default value to return if null.
     * @returns {any} the state object or a property value within.
     */

  }, {
    key: "getState",
    value: function getState() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var defaultValue = arguments.length > 1 ? arguments[1] : undefined;
      var storeValue;

      if (!path) {
        storeValue = this.state || {};
      } else {
        storeValue = (0, _get.default)(this.state, path);
      }

      var value = storeValue ? (0, _cloneDeep.default)(storeValue) : storeValue;
      return value === undefined ? defaultValue : value;
    }
    /* Deprecated. Please use getState instead. */

  }, {
    key: "getStore",
    value: function getStore() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var defaultValue = arguments.length > 1 ? arguments[1] : undefined;
      console.warn('ArkhamJS Deprecation: Flux.getStore has been deprecated in favor of Flux.getState.');
      return this.getState(path, defaultValue);
    }
    /**
     * Initialize and set configuration options.
     *
     * @param {object} options Configuration options.
     */

  }, {
    key: "init",
    value: function () {
      var _init = _asyncToGenerator(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee4() {
        var options,
            reset,
            updatedOptions,
            _this$options2,
            debug,
            middleware,
            name,
            stores,
            windowProperty,
            _args4 = arguments;

        return _regenerator.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                options = _args4.length > 0 && _args4[0] !== undefined ? _args4[0] : {};
                reset = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : false;

                // Should reset previous params
                if (this.isInit && reset) {
                  this.reset(false);
                } // Set options


                updatedOptions = _objectSpread({}, options);

                if (this.isInit) {
                  // Remove the name from options if already initialized, otherwise the root app will not be able to access
                  // the state tree
                  updatedOptions.name = this.options.name;
                }

                this.options = _objectSpread({}, this.defaultOptions, updatedOptions);
                _this$options2 = this.options, debug = _this$options2.debug, middleware = _this$options2.middleware, name = _this$options2.name, stores = _this$options2.stores; // Update default store

                _context4.prev = 7;
                _context4.next = 10;
                return this.useStorage(name);

              case 10:
                _context4.next = 16;
                break;

              case 12:
                _context4.prev = 12;
                _context4.t0 = _context4["catch"](7);
                console.error('Arkham Error: There was an error while using storage.', name);
                throw _context4.t0;

              case 16:
                if (!(!!stores && stores.length)) {
                  _context4.next = 26;
                  break;
                }

                _context4.prev = 17;
                _context4.next = 20;
                return this.addStores(stores);

              case 20:
                _context4.next = 26;
                break;

              case 22:
                _context4.prev = 22;
                _context4.t1 = _context4["catch"](17);
                console.error('Arkham Error: There was an error while adding stores.', stores);
                throw _context4.t1;

              case 26:
                if (!!middleware && middleware.length) {
                  this.addMiddleware(middleware);
                }

                windowProperty = 'arkhamjs';

                if (debug) {
                  window[windowProperty] = this;
                } else {
                  delete window[windowProperty];
                }

                this.isInit = true;
                this.emit(_ArkhamConstants.ArkhamConstants.INIT);

              case 31:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[7, 12], [17, 22]]);
      }));

      return function init() {
        return _init.apply(this, arguments);
      };
    }()
    /**
     * Adds an initialization listener.
     *
     * @param {function} [listener] The callback associated with the subscribed event.
     */

  }, {
    key: "onInit",
    value: function onInit(listener) {
      this.on(_ArkhamConstants.ArkhamConstants.INIT, listener);

      if (this.isInit) {
        listener();
      }
    }
    /**
     * Removes the initialization listener.
     *
     * @param {function} [listener] The callback associated with the subscribed event.
     */

  }, {
    key: "offInit",
    value: function offInit(listener) {
      this.off(_ArkhamConstants.ArkhamConstants.INIT, listener);
    }
    /**
     * Removes an event listener.
     *
     * @param {string} [eventType] Event to unsubscribe.
     * @param {function} [listener] The callback associated with the subscribed event.
     */

  }, {
    key: "off",
    value: function off(eventType, listener) {
      return this.removeListener(eventType, listener);
    }
    /**
     * Adds an event listener.
     *
     * @param {string} [eventType] Event to subscribe.
     * @param {function} [listener] The callback associated with the subscribed event.
     */

  }, {
    key: "on",
    value: function on(eventType, listener) {
      return this.addListener(eventType, listener);
    }
    /**
     * Registers new Stores.
     *
     * @param {array} stores Store class.
     * @returns {Promise<object[]>} the class object(s).
     */

  }, {
    key: "addStores",
    value: function () {
      var _addStores = _asyncToGenerator(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee5(stores) {
        var _this7 = this;

        var storeClasses, _this$options3, name, storage;

        return _regenerator.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                storeClasses = stores.map(function (store) {
                  return _this7.register(store);
                }); // Save cache in session storage

                _this$options3 = this.options, name = _this$options3.name, storage = _this$options3.storage;

                if (!storage) {
                  _context5.next = 11;
                  break;
                }

                _context5.prev = 3;
                _context5.next = 6;
                return storage.setStorageData(name, this.state);

              case 6:
                _context5.next = 11;
                break;

              case 8:
                _context5.prev = 8;
                _context5.t0 = _context5["catch"](3);
                throw _context5.t0;

              case 11:
                return _context5.abrupt("return", storeClasses);

              case 12:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[3, 8]]);
      }));

      return function addStores(_x4) {
        return _addStores.apply(this, arguments);
      };
    }()
  }, {
    key: "registerStores",
    value: function () {
      var _registerStores = _asyncToGenerator(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee6(stores) {
        return _regenerator.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                console.warn('ArkhamJS Deprecation: Flux.registerStores has been deprecated in favor of Flux.addStores.');
                return _context6.abrupt("return", this.addStores(stores));

              case 2:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      return function registerStores(_x5) {
        return _registerStores.apply(this, arguments);
      };
    }()
    /**
     * Remove middleware from framework.
     *
     * @param {array} string middleware names to remove.
     * @returns {Promise<object[]>} the class object(s).
     */

  }, {
    key: "removeMiddleware",
    value: function removeMiddleware(names) {
      var _this8 = this;

      names.forEach(function (name) {
        // Remove middleware plugins
        _this8.pluginTypes.forEach(function (type) {
          _this8.middleware["".concat(type, "List")] = _this8.removePlugin(type, name);
        });
      });
    }
    /**
     * Reset framework.
     *
     * @param {array} string middleware names to remove.
     * @returns {Promise<object[]>} the class object(s).
     */

  }, {
    key: "reset",
    value: function () {
      var _reset = _asyncToGenerator(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee7() {
        var clearStorage,
            _this$options4,
            name,
            storage,
            _args7 = arguments;

        return _regenerator.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                clearStorage = _args7.length > 0 && _args7[0] !== undefined ? _args7[0] : true;
                _this$options4 = this.options, name = _this$options4.name, storage = _this$options4.storage; // Clear persistent cache

                if (!(storage && clearStorage)) {
                  _context7.next = 11;
                  break;
                }

                _context7.prev = 3;
                _context7.next = 6;
                return storage.setStorageData(name, {});

              case 6:
                _context7.next = 11;
                break;

              case 8:
                _context7.prev = 8;
                _context7.t0 = _context7["catch"](3);
                throw _context7.t0;

              case 11:
                // Clear all properties
                this.state = {};
                this.storeClasses = [];
                this.options = _objectSpread({}, this.defaultOptions);
                this.isInit = false;

              case 15:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[3, 8]]);
      }));

      return function reset() {
        return _reset.apply(this, arguments);
      };
    }()
    /**
     * Sets the current state object.
     *
     * @param {string|array} [name] The name of the store to set. You can also use an array to specify a property path
     * within the object.
     * @param {any} [value] The value to set.
     */

  }, {
    key: "setState",
    value: function setState() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var value = arguments.length > 1 ? arguments[1] : undefined;

      if (!!path) {
        this.state = (0, _set.default)(this.state, path, (0, _cloneDeep.default)(value));
      } // Update persistent cache


      var storage = this.options.storage;

      if (storage) {
        return this.updateStorage();
      }

      return Promise.resolve(false);
    }
  }, {
    key: "setStore",
    value: function setStore() {
      var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var value = arguments.length > 1 ? arguments[1] : undefined;
      return this.setState(path, value);
    }
  }, {
    key: "addPlugin",
    value: function addPlugin(type, plugin) {
      var list = this.middleware["".concat(type, "List")] || [];
      var method = plugin.method,
          name = plugin.name;

      if (method && typeof method === 'function') {
        // Check if plugin already exists
        var exists = !!list.filter(function (obj) {
          return obj.name === name;
        }).length; // Do not add duplicate plugins

        if (!exists) {
          list.push({
            method: method,
            name: name
          });
        }

        return list;
      } else if (method !== undefined) {
        throw Error("".concat(plugin.name, " middleware is not configured properly. Method is not a function."));
      }

      return list;
    }
  }, {
    key: "deregister",
    value: function deregister() {
      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      delete this.storeClasses[name];
      delete this.state[name];
    }
  }, {
    key: "register",
    value: function register(StoreClass) {
      if (!StoreClass) {
        throw Error('Store is undefined. Cannot register with Flux.');
      }

      var clsType = StoreClass.constructor.toString().substr(0, 5);
      var isFnc = clsType === 'funct' || clsType === 'class';
      var isClass = !!StoreClass.prototype.onAction;

      if (!isClass && !isFnc) {
        throw Error("".concat(StoreClass, " is not a class or store function. Cannot register with Flux."));
      } // Create store object


      var storeCls;

      if (isClass) {
        // Create new custom class
        storeCls = new StoreClass();
      } else {
        // Create store based on simple function
        var fncStore = StoreClass;
        storeCls = new _Store.Store();
        storeCls.name = fncStore.name;
        storeCls.onAction = fncStore;
        storeCls.defaultState = fncStore();
      }

      var _storeCls = storeCls,
          storeName = _storeCls.name;

      if (storeName && !this.storeClasses[storeName]) {
        // Save store object
        this.storeClasses[storeName] = storeCls; // Get default values

        this.state[storeName] = this.state[storeName] || (0, _cloneDeep.default)(storeCls.initialState()) || {};
      } // Return store class


      return this.storeClasses[storeName];
    }
  }, {
    key: "removePlugin",
    value: function removePlugin(type, name) {
      var list = this.middleware["".concat(type, "List")] || []; // remove all occurrences of the plugin

      return list.filter(function (obj) {
        return obj.name !== name;
      });
    }
  }, {
    key: "useStorage",
    value: function () {
      var _useStorage = _asyncToGenerator(
      /*#__PURE__*/
      _regenerator.default.mark(function _callee8(name) {
        var _this9 = this;

        var _this$options5, storage, state, storageWait;

        return _regenerator.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _this$options5 = this.options, storage = _this$options5.storage, state = _this$options5.state, storageWait = _this$options5.storageWait; // Cache

                if (!storage) {
                  _context8.next = 21;
                  break;
                }

                _context8.prev = 2;
                _context8.t1 = state;

                if (_context8.t1) {
                  _context8.next = 8;
                  break;
                }

                _context8.next = 7;
                return storage.getStorageData(name);

              case 7:
                _context8.t1 = _context8.sent;

              case 8:
                _context8.t0 = _context8.t1;

                if (_context8.t0) {
                  _context8.next = 11;
                  break;
                }

                _context8.t0 = {};

              case 11:
                this.state = _context8.t0;
                this.updateStorage = (0, _debounce.default)(function () {
                  if (storage) {
                    return storage.setStorageData(name, _this9.state);
                  }

                  return Promise.resolve(false);
                }, storageWait, {
                  leading: true,
                  trailing: true
                });
                _context8.next = 19;
                break;

              case 15:
                _context8.prev = 15;
                _context8.t2 = _context8["catch"](2);
                console.error("ArkhamJS Error: Using storage, \"".concat(name, "\"."));
                throw _context8.t2;

              case 19:
                _context8.next = 22;
                break;

              case 21:
                this.state = state || {};

              case 22:
                return _context8.abrupt("return", null);

              case 23:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[2, 15]]);
      }));

      return function useStorage(_x6) {
        return _useStorage.apply(this, arguments);
      };
    }()
  }]);

  return FluxFramework;
}(_events.EventEmitter);

exports.FluxFramework = FluxFramework;
var Flux = new FluxFramework();
exports.Flux = Flux;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9GbHV4L0ZsdXgudHMiXSwibmFtZXMiOlsiRmx1eEZyYW1ld29yayIsIm5hbWUiLCJyb3V0ZXJUeXBlIiwic2Nyb2xsVG9Ub3AiLCJzdGF0ZSIsInN0b3JhZ2UiLCJzdG9yYWdlV2FpdCIsInN0b3JlcyIsInRpdGxlIiwiZGVmYXVsdE9wdGlvbnMiLCJQcm9taXNlIiwicmVzb2x2ZSIsImFkZE1pZGRsZXdhcmUiLCJiaW5kIiwiYWRkU3RvcmVzIiwiY2xlYXJBcHBEYXRhIiwiY2xlYXJNaWRkbGV3YXJlIiwiZGVyZWdpc3RlciIsImRlcmVnaXN0ZXJTdG9yZXMiLCJkaXNwYXRjaCIsImdldENsYXNzIiwiZ2V0T3B0aW9ucyIsImdldFN0YXRlIiwiZ2V0U3RvcmUiLCJpbml0Iiwib2ZmIiwicmVnaXN0ZXIiLCJyZWdpc3RlclN0b3JlcyIsInJlbW92ZU1pZGRsZXdhcmUiLCJyZW1vdmVTdG9yZXMiLCJyZXNldCIsInNldFN0YXRlIiwic2V0U3RvcmUiLCJwbHVnaW5UeXBlcyIsImZvckVhY2giLCJ0eXBlIiwibWlkZGxld2FyZSIsIm1pZGRsZU9iaiIsIm1pZGRsZU5hbWUiLCJFcnJvciIsIm1ldGhvZCIsInBsdWdpbiIsImFkZFBsdWdpbiIsIk9iamVjdCIsImtleXMiLCJzdG9yZUNsYXNzZXMiLCJzdG9yZU5hbWUiLCJzdG9yZUNscyIsImluaXRpYWxTdGF0ZSIsIm9wdGlvbnMiLCJzZXRTdG9yYWdlRGF0YSIsInBsdWdpblR5cGUiLCJzdG9yZU5hbWVzIiwiY29uc29sZSIsIndhcm4iLCJhY3Rpb24iLCJzaWxlbnQiLCJjbG9uZWRBY3Rpb24iLCJzdGFydFRpbWUiLCJEYXRlIiwic3RhY2siLCJzdGFja1Byb3BlcnR5Iiwic3RhY2tUcmFjZUxpbWl0IiwiSW5maW5pdHkiLCJFcnJvclN0YWNrUGFyc2VyIiwicGFyc2UiLCJlcnJvciIsImFwcEluZm8iLCJkdXJhdGlvbiIsInBvc3REaXNwYXRjaExpc3QiLCJwcmVEaXNwYXRjaExpc3QiLCJsZW5ndGgiLCJhbGwiLCJtYXAiLCJ0aGVuIiwiYWN0aW9ucyIsIm1lcmdlIiwiY2F0Y2giLCJkYXRhIiwib25BY3Rpb24iLCJ1cGRhdGVTdG9yYWdlIiwiZW5kVGltZSIsImVtaXQiLCJwYXRoIiwiZGVmYXVsdFZhbHVlIiwic3RvcmVWYWx1ZSIsInZhbHVlIiwidW5kZWZpbmVkIiwiaXNJbml0IiwidXBkYXRlZE9wdGlvbnMiLCJkZWJ1ZyIsInVzZVN0b3JhZ2UiLCJ3aW5kb3dQcm9wZXJ0eSIsIndpbmRvdyIsIkFya2hhbUNvbnN0YW50cyIsIklOSVQiLCJsaXN0ZW5lciIsIm9uIiwiZXZlbnRUeXBlIiwicmVtb3ZlTGlzdGVuZXIiLCJhZGRMaXN0ZW5lciIsInN0b3JlIiwibmFtZXMiLCJyZW1vdmVQbHVnaW4iLCJjbGVhclN0b3JhZ2UiLCJsaXN0IiwiZXhpc3RzIiwiZmlsdGVyIiwib2JqIiwicHVzaCIsIlN0b3JlQ2xhc3MiLCJjbHNUeXBlIiwiY29uc3RydWN0b3IiLCJ0b1N0cmluZyIsInN1YnN0ciIsImlzRm5jIiwiaXNDbGFzcyIsInByb3RvdHlwZSIsImZuY1N0b3JlIiwiU3RvcmUiLCJkZWZhdWx0U3RhdGUiLCJnZXRTdG9yYWdlRGF0YSIsImxlYWRpbmciLCJ0cmFpbGluZyIsIkV2ZW50RW1pdHRlciIsIkZsdXgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUlBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHQTs7OztJQUlhQSxhOzs7OztBQUVYO0FBRUE7O0FBZ0JBOzs7Ozs7O0FBT0EsMkJBQWM7QUFBQTs7QUFBQTs7QUFDWix3RkFEWSxDQUdaOztBQUhZLHFGQTFCSSxLQTBCSjs7QUFBQSwwRkF4QlUsQ0FBQyxhQUFELEVBQWdCLGNBQWhCLENBd0JWOztBQUFBLG9GQXRCTyxFQXNCUDs7QUFBQSwyRkFyQmMsRUFxQmQ7O0FBQUEsNkZBcEJ3QjtBQUNwQ0Ms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TyxFQUFwQzVDLE8sa0JBQUFBLE8sRUFBU0QsSyxrQkFBQUEsSyxFQUFPRSxXLGtCQUFBQSxXLEVBRXZCOztxQkFDR0QsTzs7Ozs7OytCQUVjRCxLOzs7Ozs7Ozt1QkFBZUMsT0FBTyxDQUFDb0gsY0FBUixDQUF1QnhILElBQXZCLEM7Ozs7Ozs7Ozs7Ozs7K0JBQWdDLEU7OztBQUE1RCxxQkFBS0csSztBQUNMLHFCQUFLNEUsYUFBTCxHQUFxQix1QkFBUyxZQUFNO0FBQ2xDLHNCQUFHM0UsT0FBSCxFQUFZO0FBQ1YsMkJBQU9BLE9BQU8sQ0FBQzZDLGNBQVIsQ0FBdUJqRCxJQUF2QixFQUE2QixNQUFJLENBQUNHLEtBQWxDLENBQVA7QUFDRDs7QUFFRCx5QkFBT00sT0FBTyxDQUFDQyxPQUFSLENBQWdCLEtBQWhCLENBQVA7QUFDRCxpQkFOb0IsRUFNbEJMLFdBTmtCLEVBTUw7QUFBQ29ILGtCQUFBQSxPQUFPLEVBQUUsSUFBVjtBQUFnQkMsa0JBQUFBLFFBQVEsRUFBRTtBQUExQixpQkFOSyxDQUFyQjs7Ozs7OztBQVFBdEUsZ0JBQUFBLE9BQU8sQ0FBQ2EsS0FBUiw0Q0FBaURqRSxJQUFqRDs7Ozs7Ozs7QUFJRixxQkFBS0csS0FBTCxHQUFhQSxLQUFLLElBQUksRUFBdEI7OztrREFHSyxJOzs7Ozs7Ozs7Ozs7Ozs7OztFQWprQndCd0gsb0I7OztBQXFrQjVCLElBQU1DLElBQW1CLEdBQUcsSUFBSTdILGFBQUosRUFBNUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxOCwgTml0cm9nZW4gTGFicywgSW5jLlxuICogQ29weXJpZ2h0cyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSB0aGUgYWNjb21wYW55aW5nIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMuXG4gKi9cbmltcG9ydCBFcnJvclN0YWNrUGFyc2VyIGZyb20gJ2Vycm9yLXN0YWNrLXBhcnNlcic7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCc7XG5pbXBvcnQgZGVib3VuY2UgZnJvbSAnbG9kYXNoL2RlYm91bmNlJztcbmltcG9ydCBnZXQgZnJvbSAnbG9kYXNoL2dldCc7XG5pbXBvcnQgbWVyZ2UgZnJvbSAnbG9kYXNoL21lcmdlJztcbmltcG9ydCBzZXQgZnJvbSAnbG9kYXNoL3NldCc7XG5cbmltcG9ydCB7QXJraGFtQ29uc3RhbnRzfSBmcm9tICcuLi9jb25zdGFudHMvQXJraGFtQ29uc3RhbnRzJztcbmltcG9ydCB7U3RvcmV9IGZyb20gJy4uL1N0b3JlL1N0b3JlJztcbmltcG9ydCB7Rmx1eEFjdGlvbiwgRmx1eE1pZGRsZXdhcmVUeXBlLCBGbHV4T3B0aW9ucywgRmx1eFBsdWdpblR5cGV9IGZyb20gJy4uL3R5cGVzL2ZsdXgnO1xuXG4vKipcbiAqIEZsdXhGcmFtZXdvcmtcbiAqIEB0eXBlIHtFdmVudEVtaXR0ZXJ9XG4gKi9cbmV4cG9ydCBjbGFzcyBGbHV4RnJhbWV3b3JrIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgaXNJbml0OiBib29sZWFuID0gZmFsc2U7XG4gIC8vIFB1YmxpYyBwcm9wZXJ0aWVzXG4gIHBsdWdpblR5cGVzOiBzdHJpbmdbXSA9IFsncHJlRGlzcGF0Y2gnLCAncG9zdERpc3BhdGNoJ107XG4gIC8vIFByaXZhdGUgcHJvcGVydGllc1xuICBwcml2YXRlIHN0YXRlOiBhbnkgPSB7fTtcbiAgcHJpdmF0ZSBzdG9yZUNsYXNzZXM6IGFueSA9IHt9O1xuICBwcml2YXRlIGRlZmF1bHRPcHRpb25zOiBGbHV4T3B0aW9ucyA9IHtcbiAgICBuYW1lOiAnYXJraGFtanMnLFxuICAgIHJvdXRlclR5cGU6ICdicm93c2VyJyxcbiAgICBzY3JvbGxUb1RvcDogdHJ1ZSxcbiAgICBzdGF0ZTogbnVsbCxcbiAgICBzdG9yYWdlOiBudWxsLFxuICAgIHN0b3JhZ2VXYWl0OiAzMDAsXG4gICAgc3RvcmVzOiBbXSxcbiAgICB0aXRsZTogJ0Fya2hhbUpTJ1xuICB9O1xuICBwcml2YXRlIG1pZGRsZXdhcmU6IGFueSA9IHt9O1xuICBwcml2YXRlIG9wdGlvbnM6IEZsdXhPcHRpb25zID0gdGhpcy5kZWZhdWx0T3B0aW9ucztcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGluc3RhbmNlIG9mIEZsdXguICBOb3RlIHRoYXQgdGhlIEZsdXggb2JqZWN0XG4gICAqIGlzIGEgU2luZ2xldG9uIHBhdHRlcm4sIHNvIG9ubHkgb25lIHNob3VsZCBldmVyIGV4aXN0LlxuICAgKlxuICAgKiBAY29uc3RydWN0b3JcbiAgICogQHRoaXMge0ZsdXhGcmFtZXdvcmt9XG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLy8gTWV0aG9kc1xuICAgIHRoaXMuYWRkTWlkZGxld2FyZSA9IHRoaXMuYWRkTWlkZGxld2FyZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuYWRkU3RvcmVzID0gdGhpcy5hZGRTdG9yZXMuYmluZCh0aGlzKTtcbiAgICB0aGlzLmNsZWFyQXBwRGF0YSA9IHRoaXMuY2xlYXJBcHBEYXRhLmJpbmQodGhpcyk7XG4gICAgdGhpcy5jbGVhck1pZGRsZXdhcmUgPSB0aGlzLmNsZWFyTWlkZGxld2FyZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZGVyZWdpc3RlciA9IHRoaXMuZGVyZWdpc3Rlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZGVyZWdpc3RlclN0b3JlcyA9IHRoaXMuZGVyZWdpc3RlclN0b3Jlcy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZGlzcGF0Y2ggPSB0aGlzLmRpc3BhdGNoLmJpbmQodGhpcyk7XG4gICAgdGhpcy5nZXRDbGFzcyA9IHRoaXMuZ2V0Q2xhc3MuYmluZCh0aGlzKTtcbiAgICB0aGlzLmdldE9wdGlvbnMgPSB0aGlzLmdldE9wdGlvbnMuYmluZCh0aGlzKTtcbiAgICB0aGlzLmdldFN0YXRlID0gdGhpcy5nZXRTdGF0ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZ2V0U3RvcmUgPSB0aGlzLmdldFN0b3JlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5pbml0ID0gdGhpcy5pbml0LmJpbmQodGhpcyk7XG4gICAgdGhpcy5vZmYgPSB0aGlzLm9mZi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVnaXN0ZXIgPSB0aGlzLnJlZ2lzdGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZWdpc3RlclN0b3JlcyA9IHRoaXMucmVnaXN0ZXJTdG9yZXMuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZU1pZGRsZXdhcmUgPSB0aGlzLnJlbW92ZU1pZGRsZXdhcmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZVN0b3JlcyA9IHRoaXMucmVtb3ZlU3RvcmVzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5yZXNldCA9IHRoaXMucmVzZXQuYmluZCh0aGlzKTtcbiAgICB0aGlzLnNldFN0YXRlID0gdGhpcy5zZXRTdGF0ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuc2V0U3RvcmUgPSB0aGlzLnNldFN0b3JlLmJpbmQodGhpcyk7XG5cbiAgICAvLyBBZGQgbWlkZGxld2FyZSBwbHVnaW4gdHlwZXNcbiAgICB0aGlzLnBsdWdpblR5cGVzLmZvckVhY2goKHR5cGU6IHN0cmluZykgPT4gdGhpcy5taWRkbGV3YXJlW2Ake3R5cGV9TGlzdGBdID0gW10pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZCBtaWRkbGV3YXJlIHRvIGZyYW1ld29yay5cbiAgICpcbiAgICogQHBhcmFtIHthcnJheX0gbWlkZGxld2FyZSBBbiBhcnJheSBvZiBtaWRkbGV3YXJlIHRvIGFkZCB0byB0aGUgZnJhbWV3b3JrLlxuICAgKi9cbiAgYWRkTWlkZGxld2FyZShtaWRkbGV3YXJlOiBGbHV4TWlkZGxld2FyZVR5cGVbXSk6IHZvaWQge1xuICAgIG1pZGRsZXdhcmUuZm9yRWFjaCgobWlkZGxlT2JqOiBGbHV4TWlkZGxld2FyZVR5cGUpID0+IHtcbiAgICAgIC8vIE1ha2Ugc3VyZSBtaWRkbGV3YXJlIGlzIGVpdGhlciBhIGNsYXNzIG9yIG9iamVjdC5cbiAgICAgIGlmKCEhbWlkZGxlT2JqICYmICgodHlwZW9mIG1pZGRsZU9iaiA9PT0gJ2Z1bmN0aW9uJykgfHwgKHR5cGVvZiBtaWRkbGVPYmogPT09ICdvYmplY3QnKSkpIHtcbiAgICAgICAgY29uc3QgbWlkZGxlTmFtZTogc3RyaW5nID0gbWlkZGxlT2JqLm5hbWUgfHwgJyc7XG5cbiAgICAgICAgaWYoIW1pZGRsZU5hbWUpIHtcbiAgICAgICAgICB0aHJvdyBFcnJvcignVW5rbm93biBtaWRkbGV3YXJlIGlzIG5vdCBjb25maWd1cmVkIHByb3Blcmx5LiBSZXF1aXJlcyBuYW1lIHByb3BlcnR5LiBDYW5ub3QgYWRkIHRvIEZsdXguJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTb3J0IG1pZGRsZXdhcmUgcGx1Z2lucyBmb3IgZWZmaWNpZW5jeVxuICAgICAgICB0aGlzLnBsdWdpblR5cGVzLmZvckVhY2goKHR5cGU6IHN0cmluZykgPT4ge1xuICAgICAgICAgIGNvbnN0IG1ldGhvZCA9IG1pZGRsZU9ialt0eXBlXTtcbiAgICAgICAgICBjb25zdCBwbHVnaW46IEZsdXhQbHVnaW5UeXBlID0ge21ldGhvZCwgbmFtZTogbWlkZGxlTmFtZX07XG4gICAgICAgICAgdGhpcy5taWRkbGV3YXJlW2Ake3R5cGV9TGlzdGBdID0gdGhpcy5hZGRQbHVnaW4odHlwZSwgcGx1Z2luKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBFcnJvcignVW5rbm93biBtaWRkbGV3YXJlIGlzIG5vdCBjb25maWd1cmVkIHByb3Blcmx5LiBDYW5ub3QgYWRkIHRvIEZsdXguJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBhcHAgZGF0YSBmcm9tIHN0b3JhZ2UuXG4gICAqXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBXaGV0aGVyIGFwcCBkYXRhIHdhcyBzdWNjZXNzZnVsbHkgcmVtb3ZlZC5cbiAgICovXG4gIGNsZWFyQXBwRGF0YSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAvLyBTZXQgYWxsIHN0b3JlIGRhdGEgdG8gaW5pdGlhbCBzdGF0ZVxuICAgIE9iamVjdFxuICAgICAgLmtleXModGhpcy5zdG9yZUNsYXNzZXMpXG4gICAgICAuZm9yRWFjaCgoc3RvcmVOYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3Qgc3RvcmVDbHM6IFN0b3JlID0gdGhpcy5zdG9yZUNsYXNzZXNbc3RvcmVOYW1lXTtcbiAgICAgICAgdGhpcy5zdGF0ZVtzdG9yZUNscy5uYW1lXSA9IGNsb25lRGVlcChzdG9yZUNscy5pbml0aWFsU3RhdGUoKSk7XG4gICAgICB9KTtcblxuICAgIGNvbnN0IHtuYW1lLCBzdG9yYWdlfSA9IHRoaXMub3B0aW9ucztcblxuICAgIGlmKHN0b3JhZ2UpIHtcbiAgICAgIHJldHVybiBzdG9yYWdlLnNldFN0b3JhZ2VEYXRhKG5hbWUsIHRoaXMuc3RhdGUpO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFsbCBtaWRkbGV3YXJlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gV2hldGhlciBtaWRkbGV3YXJlIHdhcyBzdWNjZXNzZnVsbHkgcmVtb3ZlZC5cbiAgICovXG4gIGNsZWFyTWlkZGxld2FyZSgpOiBib29sZWFuIHtcbiAgICAvLyBTZXQgYWxsIHN0b3JlIGRhdGEgdG8gaW5pdGlhbCBzdGF0ZVxuICAgIE9iamVjdFxuICAgICAgLmtleXModGhpcy5taWRkbGV3YXJlKVxuICAgICAgLmZvckVhY2goKHBsdWdpblR5cGU6IHN0cmluZykgPT4ge1xuICAgICAgICB0aGlzLm1pZGRsZXdhcmVbcGx1Z2luVHlwZV0gPSBbXTtcbiAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogRGUtcmVnaXN0ZXJzIG5hbWVkIHN0b3Jlcy5cbiAgICpcbiAgICogQHBhcmFtIHthcnJheX0gc3RvcmVOYW1lcyBBbiBhcnJheSBvZiBzdG9yZSBuYW1lcyB0byByZW1vdmUgZnJvbSB0aGUgZnJhbWV3b3JrLlxuICAgKi9cbiAgcmVtb3ZlU3RvcmVzKHN0b3JlTmFtZXM6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgc3RvcmVOYW1lcy5mb3JFYWNoKChuYW1lOiBzdHJpbmcpID0+IHRoaXMuZGVyZWdpc3RlcihuYW1lKSk7XG4gIH1cblxuICBkZXJlZ2lzdGVyU3RvcmVzKHN0b3JlTmFtZXM6IHN0cmluZ1tdKTogdm9pZCB7XG4gICAgY29uc29sZS53YXJuKCdBcmtoYW1KUyBEZXByZWNhdGlvbjogRmx1eC5kZXJlZ2lzdGVyU3RvcmVzIGhhcyBiZWVuIGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2YgRmx1eC5yZW1vdmVTdG9yZXMuJyk7XG4gICAgdGhpcy5yZW1vdmVTdG9yZXMoc3RvcmVOYW1lcyk7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhbiBhY3Rpb24gdG8gYWxsIHN0b3Jlcy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGFjdGlvbiB0byBkaXNwYXRjaCB0byBhbGwgdGhlIHN0b3Jlcy5cbiAgICogQHBhcmFtIHtib29sZWFufSBzaWxlbnQgVG8gc2lsZW5jZSBhbnkgZXZlbnRzLlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX0gVGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2hlbiBhbmQgaWYgdGhlIGFwcCBzYXZlcyBkYXRhIHRvIHN0b3JhZ2UsIHJldHVybmluZ1xuICAgKiB0aGUgYWN0aW9uLlxuICAgKi9cbiAgYXN5bmMgZGlzcGF0Y2goYWN0aW9uOiBGbHV4QWN0aW9uLCBzaWxlbnQ6IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8Rmx1eEFjdGlvbj4ge1xuICAgIGlmKCFhY3Rpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQXJraGFtSlMgRXJyb3I6IEZsdXguZGlzcGF0Y2ggcmVxdWlyZXMgYW4gYWN0aW9uLicpO1xuICAgIH1cblxuICAgIGxldCBjbG9uZWRBY3Rpb246IEZsdXhBY3Rpb24gPSBjbG9uZURlZXAoYWN0aW9uIHx8IHt0eXBlOiAnJ30pO1xuXG4gICAgLy8gTG9nIGR1cmF0aW9uIG9mIGRpc3BhdGNoXG4gICAgY29uc3Qgc3RhcnRUaW1lOiBudW1iZXIgPSArKG5ldyBEYXRlKCkpO1xuXG4gICAgLy8gR2V0IHN0YWNrXG4gICAgbGV0IHN0YWNrID0gW107XG5cbiAgICB0cnkge1xuICAgICAgY29uc3Qgc3RhY2tQcm9wZXJ0eTogc3RyaW5nID0gJ3N0YWNrVHJhY2VMaW1pdCc7XG4gICAgICBjb25zdCB7c3RhY2tUcmFjZUxpbWl0fTogYW55ID0gRXJyb3I7XG4gICAgICBFcnJvcltzdGFja1Byb3BlcnR5XSA9IEluZmluaXR5O1xuICAgICAgc3RhY2sgPSBFcnJvclN0YWNrUGFyc2VyLnBhcnNlKG5ldyBFcnJvcigpKTtcbiAgICAgIEVycm9yW3N0YWNrUHJvcGVydHldID0gc3RhY2tUcmFjZUxpbWl0O1xuICAgIH0gY2F0Y2goZXJyb3IpIHt9XG5cbiAgICAvLyBHZXQgb3B0aW9uc1xuICAgIGNvbnN0IG9wdGlvbnMgPSBjbG9uZURlZXAodGhpcy5vcHRpb25zKTtcblxuICAgIC8vIEFwcCBpbmZvXG4gICAgY29uc3QgYXBwSW5mbyA9IHtkdXJhdGlvbjogMCwgb3B0aW9ucywgc3RhY2t9O1xuXG4gICAgLy8gQXBwbHkgbWlkZGxld2FyZSBiZWZvcmUgdGhlIGFjdGlvbiBpcyBwcm9jZXNzZWRcbiAgICBjb25zdCB7cG9zdERpc3BhdGNoTGlzdCA9IFtdLCBwcmVEaXNwYXRjaExpc3QgPSBbXX0gPSB0aGlzLm1pZGRsZXdhcmU7XG5cbiAgICBpZihwcmVEaXNwYXRjaExpc3QubGVuZ3RoKSB7XG4gICAgICBjbG9uZWRBY3Rpb24gPSBhd2FpdCBQcm9taXNlXG4gICAgICAgIC5hbGwoXG4gICAgICAgICAgcHJlRGlzcGF0Y2hMaXN0Lm1hcChhc3luYyAocGx1Z2luOiBGbHV4UGx1Z2luVHlwZSkgPT4gcGx1Z2luLm1ldGhvZChcbiAgICAgICAgICAgIGNsb25lRGVlcChjbG9uZWRBY3Rpb24pLCBjbG9uZURlZXAodGhpcy5zdGF0ZSksIGFwcEluZm8pXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgIC50aGVuKChhY3Rpb25zKSA9PiBtZXJnZShjbG9uZURlZXAoY2xvbmVkQWN0aW9uKSwgLi4uY2xvbmVEZWVwKGFjdGlvbnMpKSBhcyBGbHV4QWN0aW9uKVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHt0eXBlLCAuLi5kYXRhfSA9IGNsb25lZEFjdGlvbjtcblxuICAgIC8vIFJlcXVpcmUgYSB0eXBlXG4gICAgaWYoIXR5cGUgfHwgdHlwZSA9PT0gJycpIHtcbiAgICAgIGNvbnNvbGUud2FybignQXJraGFtSlMgV2FybmluZzogRmx1eC5kaXNwYXRjaCBpcyBtaXNzaW5nIGFuIGFjdGlvbiB0eXBlIGZvciB0aGUgcGF5bG9hZDonLCBkYXRhKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY2xvbmVkQWN0aW9uKVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIFdoZW4gYW4gYWN0aW9uIGNvbWVzIGluLCBpdCBtdXN0IGJlIGNvbXBsZXRlbHkgaGFuZGxlZCBieSBhbGwgc3RvcmVzXG4gICAgT2JqZWN0XG4gICAgICAua2V5cyh0aGlzLnN0b3JlQ2xhc3NlcylcbiAgICAgIC5mb3JFYWNoKChzdG9yZU5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBzdG9yZUNsczogU3RvcmUgPSB0aGlzLnN0b3JlQ2xhc3Nlc1tzdG9yZU5hbWVdO1xuICAgICAgICBjb25zdCBzdGF0ZSA9IGNsb25lRGVlcCh0aGlzLnN0YXRlW3N0b3JlTmFtZV0pIHx8IGNsb25lRGVlcChzdG9yZUNscy5pbml0aWFsU3RhdGUoKSkgfHwge307XG4gICAgICAgIHRoaXMuc3RhdGVbc3RvcmVOYW1lXSA9IGNsb25lRGVlcChzdG9yZUNscy5vbkFjdGlvbih0eXBlLCBkYXRhLCBzdGF0ZSkpIHx8IHN0YXRlO1xuICAgICAgfSk7XG5cbiAgICAvLyBTYXZlIGNhY2hlIGluIHN0b3JhZ2VcbiAgICBjb25zdCB7c3RvcmFnZX0gPSB0aGlzLm9wdGlvbnM7XG5cbiAgICBpZihzdG9yYWdlKSB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZVN0b3JhZ2UoKTtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHt9XG4gICAgfVxuXG4gICAgY29uc3QgZW5kVGltZTogbnVtYmVyID0gKyhuZXcgRGF0ZSgpKTtcbiAgICBjb25zdCBkdXJhdGlvbjogbnVtYmVyID0gZW5kVGltZSAtIHN0YXJ0VGltZTtcbiAgICBhcHBJbmZvLmR1cmF0aW9uID0gZHVyYXRpb247XG5cbiAgICBpZihwb3N0RGlzcGF0Y2hMaXN0Lmxlbmd0aCkge1xuICAgICAgY2xvbmVkQWN0aW9uID0gYXdhaXQgUHJvbWlzZVxuICAgICAgICAuYWxsKFxuICAgICAgICAgIHBvc3REaXNwYXRjaExpc3QubWFwKFxuICAgICAgICAgICAgYXN5bmMgKHBsdWdpbjogRmx1eFBsdWdpblR5cGUpID0+IHBsdWdpbi5tZXRob2QoY2xvbmVEZWVwKGNsb25lZEFjdGlvbiksIGNsb25lRGVlcCh0aGlzLnN0YXRlKSwgYXBwSW5mbylcbiAgICAgICAgICApXG4gICAgICAgIClcbiAgICAgICAgLnRoZW4oKGFjdGlvbnMpID0+IG1lcmdlKGNsb25lRGVlcChjbG9uZWRBY3Rpb24pLCAuLi5jbG9uZURlZXAoYWN0aW9ucykpIGFzIEZsdXhBY3Rpb24pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYoIXNpbGVudCkge1xuICAgICAgdGhpcy5lbWl0KHR5cGUsIGNsb25lZEFjdGlvbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjbG9uZWRBY3Rpb24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHN0b3JlIG9iamVjdCB0aGF0IGlzIHJlZ2lzdGVyZWQgd2l0aCBGbHV4LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgc3RvcmUuXG4gICAqIEByZXR1cm5zIHtTdG9yZX0gdGhlIHN0b3JlIG9iamVjdC5cbiAgICovXG4gIGdldENsYXNzKG5hbWU6IHN0cmluZyA9ICcnKTogU3RvcmUge1xuICAgIHJldHVybiB0aGlzLnN0b3JlQ2xhc3Nlc1tuYW1lXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgRmx1eCBvcHRpb25zLlxuICAgKlxuICAgKiBAcmV0dXJucyB7Rmx1eE9wdGlvbnN9IHRoZSBGbHV4IG9wdGlvbnMgb2JqZWN0LlxuICAgKi9cbiAgZ2V0T3B0aW9ucygpOiBGbHV4T3B0aW9ucyB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgc3RhdGUgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xhcnJheX0gW25hbWVdIChvcHRpb25hbCkgVGhlIG5hbWUgb2YgdGhlIHN0b3JlIGZvciBhbiBvYmplY3QsIG90aGVyd2lzZSBpdCB3aWxsIHJldHVybiBhbGwgc3RvcmVcbiAgICogICBvYmplY3RzLiBZb3UgY2FuIGFsc28gdXNlIGFuIGFycmF5IHRvIHNwZWNpZnkgYSBwcm9wZXJ0eSBwYXRoIHdpdGhpbiB0aGUgb2JqZWN0LlxuICAgKiBAcGFyYW0ge2FueX0gW2RlZmF1bHRWYWx1ZV0gKG9wdGlvbmFsKSBBIGRlZmF1bHQgdmFsdWUgdG8gcmV0dXJuIGlmIG51bGwuXG4gICAqIEByZXR1cm5zIHthbnl9IHRoZSBzdGF0ZSBvYmplY3Qgb3IgYSBwcm9wZXJ0eSB2YWx1ZSB3aXRoaW4uXG4gICAqL1xuICBnZXRTdGF0ZShwYXRoOiBzdHJpbmcgfCBzdHJpbmdbXSA9ICcnLCBkZWZhdWx0VmFsdWU/KTogYW55IHtcbiAgICBsZXQgc3RvcmVWYWx1ZTtcblxuICAgIGlmKCFwYXRoKSB7XG4gICAgICBzdG9yZVZhbHVlID0gdGhpcy5zdGF0ZSB8fCB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RvcmVWYWx1ZSA9IGdldCh0aGlzLnN0YXRlLCBwYXRoKTtcbiAgICB9XG5cbiAgICBjb25zdCB2YWx1ZSA9IHN0b3JlVmFsdWUgPyBjbG9uZURlZXAoc3RvcmVWYWx1ZSkgOiBzdG9yZVZhbHVlO1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbHVlIDogdmFsdWU7XG4gIH1cblxuICAvKiBEZXByZWNhdGVkLiBQbGVhc2UgdXNlIGdldFN0YXRlIGluc3RlYWQuICovXG4gIGdldFN0b3JlKHBhdGg6IHN0cmluZyB8IHN0cmluZ1tdID0gJycsIGRlZmF1bHRWYWx1ZT8pOiBhbnkge1xuICAgIGNvbnNvbGUud2FybignQXJraGFtSlMgRGVwcmVjYXRpb246IEZsdXguZ2V0U3RvcmUgaGFzIGJlZW4gZGVwcmVjYXRlZCBpbiBmYXZvciBvZiBGbHV4LmdldFN0YXRlLicpO1xuICAgIHJldHVybiB0aGlzLmdldFN0YXRlKHBhdGgsIGRlZmF1bHRWYWx1ZSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBhbmQgc2V0IGNvbmZpZ3VyYXRpb24gb3B0aW9ucy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgQ29uZmlndXJhdGlvbiBvcHRpb25zLlxuICAgKi9cbiAgYXN5bmMgaW5pdChvcHRpb25zOiBGbHV4T3B0aW9ucyA9IHt9LCByZXNldDogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gU2hvdWxkIHJlc2V0IHByZXZpb3VzIHBhcmFtc1xuICAgIGlmKHRoaXMuaXNJbml0ICYmIHJlc2V0KSB7XG4gICAgICB0aGlzLnJlc2V0KGZhbHNlKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgb3B0aW9uc1xuICAgIGNvbnN0IHVwZGF0ZWRPcHRpb25zID0gey4uLm9wdGlvbnN9O1xuXG4gICAgaWYodGhpcy5pc0luaXQpIHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgbmFtZSBmcm9tIG9wdGlvbnMgaWYgYWxyZWFkeSBpbml0aWFsaXplZCwgb3RoZXJ3aXNlIHRoZSByb290IGFwcCB3aWxsIG5vdCBiZSBhYmxlIHRvIGFjY2Vzc1xuICAgICAgLy8gdGhlIHN0YXRlIHRyZWVcbiAgICAgIHVwZGF0ZWRPcHRpb25zLm5hbWUgPSB0aGlzLm9wdGlvbnMubmFtZTtcbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMgPSB7Li4udGhpcy5kZWZhdWx0T3B0aW9ucywgLi4udXBkYXRlZE9wdGlvbnN9O1xuICAgIGNvbnN0IHtkZWJ1ZywgbWlkZGxld2FyZSwgbmFtZSwgc3RvcmVzfSA9IHRoaXMub3B0aW9ucztcblxuICAgIC8vIFVwZGF0ZSBkZWZhdWx0IHN0b3JlXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMudXNlU3RvcmFnZShuYW1lKTtcbiAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdBcmtoYW0gRXJyb3I6IFRoZXJlIHdhcyBhbiBlcnJvciB3aGlsZSB1c2luZyBzdG9yYWdlLicsIG5hbWUpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuXG4gICAgaWYoISFzdG9yZXMgJiYgc3RvcmVzLmxlbmd0aCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgdGhpcy5hZGRTdG9yZXMoc3RvcmVzKTtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignQXJraGFtIEVycm9yOiBUaGVyZSB3YXMgYW4gZXJyb3Igd2hpbGUgYWRkaW5nIHN0b3Jlcy4nLCBzdG9yZXMpO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZighIW1pZGRsZXdhcmUgJiYgbWlkZGxld2FyZS5sZW5ndGgpIHtcbiAgICAgIHRoaXMuYWRkTWlkZGxld2FyZShtaWRkbGV3YXJlKTtcbiAgICB9XG5cbiAgICBjb25zdCB3aW5kb3dQcm9wZXJ0eTogc3RyaW5nID0gJ2Fya2hhbWpzJztcblxuICAgIGlmKGRlYnVnKSB7XG4gICAgICB3aW5kb3dbd2luZG93UHJvcGVydHldID0gdGhpcztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIHdpbmRvd1t3aW5kb3dQcm9wZXJ0eV07XG4gICAgfVxuXG4gICAgdGhpcy5pc0luaXQgPSB0cnVlO1xuICAgIHRoaXMuZW1pdChBcmtoYW1Db25zdGFudHMuSU5JVCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhbiBpbml0aWFsaXphdGlvbiBsaXN0ZW5lci5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gW2xpc3RlbmVyXSBUaGUgY2FsbGJhY2sgYXNzb2NpYXRlZCB3aXRoIHRoZSBzdWJzY3JpYmVkIGV2ZW50LlxuICAgKi9cbiAgb25Jbml0KGxpc3RlbmVyOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpOiB2b2lkIHtcbiAgICB0aGlzLm9uKEFya2hhbUNvbnN0YW50cy5JTklULCBsaXN0ZW5lcik7XG5cbiAgICBpZih0aGlzLmlzSW5pdCkge1xuICAgICAgbGlzdGVuZXIoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgaW5pdGlhbGl6YXRpb24gbGlzdGVuZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IFtsaXN0ZW5lcl0gVGhlIGNhbGxiYWNrIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3Vic2NyaWJlZCBldmVudC5cbiAgICovXG4gIG9mZkluaXQobGlzdGVuZXI6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6IHZvaWQge1xuICAgIHRoaXMub2ZmKEFya2hhbUNvbnN0YW50cy5JTklULCBsaXN0ZW5lcik7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhbiBldmVudCBsaXN0ZW5lci5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtldmVudFR5cGVdIEV2ZW50IHRvIHVuc3Vic2NyaWJlLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbbGlzdGVuZXJdIFRoZSBjYWxsYmFjayBhc3NvY2lhdGVkIHdpdGggdGhlIHN1YnNjcmliZWQgZXZlbnQuXG4gICAqL1xuICBvZmYoZXZlbnRUeXBlOiBzdHJpbmcsIGxpc3RlbmVyOiAoLi4uYXJnczogYW55W10pID0+IHZvaWQpOiB0aGlzIHtcbiAgICByZXR1cm4gdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudFR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGV2ZW50IGxpc3RlbmVyLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2V2ZW50VHlwZV0gRXZlbnQgdG8gc3Vic2NyaWJlLlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBbbGlzdGVuZXJdIFRoZSBjYWxsYmFjayBhc3NvY2lhdGVkIHdpdGggdGhlIHN1YnNjcmliZWQgZXZlbnQuXG4gICAqL1xuICBvbihldmVudFR5cGU6IHN0cmluZywgbGlzdGVuZXI6ICguLi5hcmdzOiBhbnlbXSkgPT4gdm9pZCk6IHRoaXMge1xuICAgIHJldHVybiB0aGlzLmFkZExpc3RlbmVyKGV2ZW50VHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBuZXcgU3RvcmVzLlxuICAgKlxuICAgKiBAcGFyYW0ge2FycmF5fSBzdG9yZXMgU3RvcmUgY2xhc3MuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPG9iamVjdFtdPn0gdGhlIGNsYXNzIG9iamVjdChzKS5cbiAgICovXG4gIGFzeW5jIGFkZFN0b3JlcyhzdG9yZXM6IGFueVtdKTogUHJvbWlzZTxvYmplY3RbXT4ge1xuICAgIGNvbnN0IHN0b3JlQ2xhc3NlczogU3RvcmVbXSA9IHN0b3Jlcy5tYXAoKHN0b3JlOiBTdG9yZSkgPT4gdGhpcy5yZWdpc3RlcihzdG9yZSkpO1xuICAgIC8vIFNhdmUgY2FjaGUgaW4gc2Vzc2lvbiBzdG9yYWdlXG4gICAgY29uc3Qge25hbWUsIHN0b3JhZ2V9ID0gdGhpcy5vcHRpb25zO1xuXG4gICAgaWYoc3RvcmFnZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc3RvcmFnZS5zZXRTdG9yYWdlRGF0YShuYW1lLCB0aGlzLnN0YXRlKTtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIGNsYXNzZXNcbiAgICByZXR1cm4gc3RvcmVDbGFzc2VzO1xuICB9XG5cbiAgYXN5bmMgcmVnaXN0ZXJTdG9yZXMoc3RvcmVzOiBhbnlbXSk6IFByb21pc2U8b2JqZWN0W10+IHtcbiAgICBjb25zb2xlLndhcm4oJ0Fya2hhbUpTIERlcHJlY2F0aW9uOiBGbHV4LnJlZ2lzdGVyU3RvcmVzIGhhcyBiZWVuIGRlcHJlY2F0ZWQgaW4gZmF2b3Igb2YgRmx1eC5hZGRTdG9yZXMuJyk7XG4gICAgcmV0dXJuIHRoaXMuYWRkU3RvcmVzKHN0b3Jlcyk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIG1pZGRsZXdhcmUgZnJvbSBmcmFtZXdvcmsuXG4gICAqXG4gICAqIEBwYXJhbSB7YXJyYXl9IHN0cmluZyBtaWRkbGV3YXJlIG5hbWVzIHRvIHJlbW92ZS5cbiAgICogQHJldHVybnMge1Byb21pc2U8b2JqZWN0W10+fSB0aGUgY2xhc3Mgb2JqZWN0KHMpLlxuICAgKi9cbiAgcmVtb3ZlTWlkZGxld2FyZShuYW1lczogc3RyaW5nW10pOiB2b2lkIHtcbiAgICBuYW1lcy5mb3JFYWNoKChuYW1lOiBzdHJpbmcpID0+IHtcbiAgICAgIC8vIFJlbW92ZSBtaWRkbGV3YXJlIHBsdWdpbnNcbiAgICAgIHRoaXMucGx1Z2luVHlwZXMuZm9yRWFjaCgodHlwZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHRoaXMubWlkZGxld2FyZVtgJHt0eXBlfUxpc3RgXSA9IHRoaXMucmVtb3ZlUGx1Z2luKHR5cGUsIG5hbWUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZXQgZnJhbWV3b3JrLlxuICAgKlxuICAgKiBAcGFyYW0ge2FycmF5fSBzdHJpbmcgbWlkZGxld2FyZSBuYW1lcyB0byByZW1vdmUuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPG9iamVjdFtdPn0gdGhlIGNsYXNzIG9iamVjdChzKS5cbiAgICovXG4gIGFzeW5jIHJlc2V0KGNsZWFyU3RvcmFnZTogYm9vbGVhbiA9IHRydWUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7bmFtZSwgc3RvcmFnZX0gPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAvLyBDbGVhciBwZXJzaXN0ZW50IGNhY2hlXG4gICAgaWYoc3RvcmFnZSAmJiBjbGVhclN0b3JhZ2UpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0U3RvcmFnZURhdGEobmFtZSwge30pO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDbGVhciBhbGwgcHJvcGVydGllc1xuICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICB0aGlzLnN0b3JlQ2xhc3NlcyA9IFtdO1xuICAgIHRoaXMub3B0aW9ucyA9IHsuLi50aGlzLmRlZmF1bHRPcHRpb25zfTtcbiAgICB0aGlzLmlzSW5pdCA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGN1cnJlbnQgc3RhdGUgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xhcnJheX0gW25hbWVdIFRoZSBuYW1lIG9mIHRoZSBzdG9yZSB0byBzZXQuIFlvdSBjYW4gYWxzbyB1c2UgYW4gYXJyYXkgdG8gc3BlY2lmeSBhIHByb3BlcnR5IHBhdGhcbiAgICogd2l0aGluIHRoZSBvYmplY3QuXG4gICAqIEBwYXJhbSB7YW55fSBbdmFsdWVdIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAqL1xuICBzZXRTdGF0ZShwYXRoOiBzdHJpbmcgfCBzdHJpbmdbXSA9ICcnLCB2YWx1ZSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmKCEhcGF0aCkge1xuICAgICAgdGhpcy5zdGF0ZSA9IHNldCh0aGlzLnN0YXRlLCBwYXRoLCBjbG9uZURlZXAodmFsdWUpKTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgcGVyc2lzdGVudCBjYWNoZVxuICAgIGNvbnN0IHtzdG9yYWdlfSA9IHRoaXMub3B0aW9ucztcblxuICAgIGlmKHN0b3JhZ2UpIHtcbiAgICAgIHJldHVybiB0aGlzLnVwZGF0ZVN0b3JhZ2UoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgfVxuXG4gIHNldFN0b3JlKHBhdGg6IHN0cmluZyB8IHN0cmluZ1tdID0gJycsIHZhbHVlKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuc2V0U3RhdGUocGF0aCwgdmFsdWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRQbHVnaW4odHlwZTogc3RyaW5nLCBwbHVnaW46IEZsdXhQbHVnaW5UeXBlKTogRmx1eFBsdWdpblR5cGVbXSB7XG4gICAgY29uc3QgbGlzdCA9IHRoaXMubWlkZGxld2FyZVtgJHt0eXBlfUxpc3RgXSB8fCBbXTtcbiAgICBjb25zdCB7bWV0aG9kLCBuYW1lfSA9IHBsdWdpbjtcblxuICAgIGlmKG1ldGhvZCAmJiB0eXBlb2YgbWV0aG9kID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBDaGVjayBpZiBwbHVnaW4gYWxyZWFkeSBleGlzdHNcbiAgICAgIGNvbnN0IGV4aXN0czogYm9vbGVhbiA9ICEhbGlzdC5maWx0ZXIoKG9iajogRmx1eFBsdWdpblR5cGUpID0+IG9iai5uYW1lID09PSBuYW1lKS5sZW5ndGg7XG5cbiAgICAgIC8vIERvIG5vdCBhZGQgZHVwbGljYXRlIHBsdWdpbnNcbiAgICAgIGlmKCFleGlzdHMpIHtcbiAgICAgICAgbGlzdC5wdXNoKHttZXRob2QsIG5hbWV9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfSBlbHNlIGlmKG1ldGhvZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBFcnJvcihgJHtwbHVnaW4ubmFtZX0gbWlkZGxld2FyZSBpcyBub3QgY29uZmlndXJlZCBwcm9wZXJseS4gTWV0aG9kIGlzIG5vdCBhIGZ1bmN0aW9uLmApO1xuICAgIH1cblxuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgcHJpdmF0ZSBkZXJlZ2lzdGVyKG5hbWU6IHN0cmluZyA9ICcnKTogdm9pZCB7XG4gICAgZGVsZXRlIHRoaXMuc3RvcmVDbGFzc2VzW25hbWVdO1xuICAgIGRlbGV0ZSB0aGlzLnN0YXRlW25hbWVdO1xuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3RlcihTdG9yZUNsYXNzKTogU3RvcmUge1xuICAgIGlmKCFTdG9yZUNsYXNzKSB7XG4gICAgICB0aHJvdyBFcnJvcignU3RvcmUgaXMgdW5kZWZpbmVkLiBDYW5ub3QgcmVnaXN0ZXIgd2l0aCBGbHV4LicpO1xuICAgIH1cblxuICAgIGNvbnN0IGNsc1R5cGU6IHN0cmluZyA9IFN0b3JlQ2xhc3MuY29uc3RydWN0b3IudG9TdHJpbmcoKS5zdWJzdHIoMCwgNSk7XG4gICAgY29uc3QgaXNGbmM6IGJvb2xlYW4gPSBjbHNUeXBlID09PSAnZnVuY3QnIHx8IGNsc1R5cGUgPT09ICdjbGFzcyc7XG4gICAgY29uc3QgaXNDbGFzczogYm9vbGVhbiA9ICEhU3RvcmVDbGFzcy5wcm90b3R5cGUub25BY3Rpb247XG5cbiAgICBpZighaXNDbGFzcyAmJiAhaXNGbmMpIHtcbiAgICAgIHRocm93IEVycm9yKGAke1N0b3JlQ2xhc3N9IGlzIG5vdCBhIGNsYXNzIG9yIHN0b3JlIGZ1bmN0aW9uLiBDYW5ub3QgcmVnaXN0ZXIgd2l0aCBGbHV4LmApO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBzdG9yZSBvYmplY3RcbiAgICBsZXQgc3RvcmVDbHM7XG5cbiAgICBpZihpc0NsYXNzKSB7XG4gICAgICAvLyBDcmVhdGUgbmV3IGN1c3RvbSBjbGFzc1xuICAgICAgc3RvcmVDbHMgPSBuZXcgU3RvcmVDbGFzcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBDcmVhdGUgc3RvcmUgYmFzZWQgb24gc2ltcGxlIGZ1bmN0aW9uXG4gICAgICBjb25zdCBmbmNTdG9yZSA9IFN0b3JlQ2xhc3M7XG4gICAgICBzdG9yZUNscyA9IG5ldyBTdG9yZSgpO1xuICAgICAgc3RvcmVDbHMubmFtZSA9IGZuY1N0b3JlLm5hbWU7XG4gICAgICBzdG9yZUNscy5vbkFjdGlvbiA9IGZuY1N0b3JlO1xuICAgICAgc3RvcmVDbHMuZGVmYXVsdFN0YXRlID0gZm5jU3RvcmUoKTtcbiAgICB9XG5cbiAgICBjb25zdCB7bmFtZTogc3RvcmVOYW1lfSA9IHN0b3JlQ2xzO1xuXG4gICAgaWYoc3RvcmVOYW1lICYmICF0aGlzLnN0b3JlQ2xhc3Nlc1tzdG9yZU5hbWVdKSB7XG4gICAgICAvLyBTYXZlIHN0b3JlIG9iamVjdFxuICAgICAgdGhpcy5zdG9yZUNsYXNzZXNbc3RvcmVOYW1lXSA9IHN0b3JlQ2xzO1xuXG4gICAgICAvLyBHZXQgZGVmYXVsdCB2YWx1ZXNcbiAgICAgIHRoaXMuc3RhdGVbc3RvcmVOYW1lXSA9IHRoaXMuc3RhdGVbc3RvcmVOYW1lXSB8fCBjbG9uZURlZXAoc3RvcmVDbHMuaW5pdGlhbFN0YXRlKCkpIHx8IHt9O1xuICAgIH1cblxuICAgIC8vIFJldHVybiBzdG9yZSBjbGFzc1xuICAgIHJldHVybiB0aGlzLnN0b3JlQ2xhc3Nlc1tzdG9yZU5hbWVdO1xuICB9XG5cbiAgcHJpdmF0ZSByZW1vdmVQbHVnaW4odHlwZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpOiBGbHV4UGx1Z2luVHlwZVtdIHtcbiAgICBjb25zdCBsaXN0ID0gdGhpcy5taWRkbGV3YXJlW2Ake3R5cGV9TGlzdGBdIHx8IFtdO1xuXG4gICAgLy8gcmVtb3ZlIGFsbCBvY2N1cnJlbmNlcyBvZiB0aGUgcGx1Z2luXG4gICAgcmV0dXJuIGxpc3QuZmlsdGVyKChvYmo6IEZsdXhQbHVnaW5UeXBlKSA9PiBvYmoubmFtZSAhPT0gbmFtZSk7XG4gIH1cblxuICBwcml2YXRlIHVwZGF0ZVN0b3JhZ2UgPSAoKSA9PiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuXG4gIHByaXZhdGUgYXN5bmMgdXNlU3RvcmFnZShuYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB7c3RvcmFnZSwgc3RhdGUsIHN0b3JhZ2VXYWl0fSA9IHRoaXMub3B0aW9ucztcblxuICAgIC8vIENhY2hlXG4gICAgaWYoc3RvcmFnZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlIHx8IGF3YWl0IHN0b3JhZ2UuZ2V0U3RvcmFnZURhdGEobmFtZSkgfHwge307XG4gICAgICAgIHRoaXMudXBkYXRlU3RvcmFnZSA9IGRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICBpZihzdG9yYWdlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RvcmFnZS5zZXRTdG9yYWdlRGF0YShuYW1lLCB0aGlzLnN0YXRlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfSwgc3RvcmFnZVdhaXQsIHtsZWFkaW5nOiB0cnVlLCB0cmFpbGluZzogdHJ1ZX0pO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBBcmtoYW1KUyBFcnJvcjogVXNpbmcgc3RvcmFnZSwgXCIke25hbWV9XCIuYCk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXRlID0gc3RhdGUgfHwge307XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEZsdXg6IEZsdXhGcmFtZXdvcmsgPSBuZXcgRmx1eEZyYW1ld29yaygpO1xuIl19