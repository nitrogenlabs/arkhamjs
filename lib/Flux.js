'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _reactNative = require('react-native');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Copyright (c) 2016, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

var Flux = function (_EventEmitter) {
  _inherits(Flux, _EventEmitter);

  /**
   * Create a new instance of Flux.  Note that the Flux object
   * is a Singleton pattern, so only one should ever exist.
   *
   * @constructor
   * @this {Flux}
   */
  function Flux() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Flux);

    // Options
    var _this = _possibleConstructorReturn(this, (Flux.__proto__ || Object.getPrototypeOf(Flux)).call(this));

    options = _immutable2.default.fromJS(options);

    // Create a hash of all the stores - used for registration / de-registration
    _this._storeClasses = (0, _immutable.Map)();
    _this._store = (0, _immutable.Map)();
    _this._debug = !!options.get('debug', false);
    _this._useCache = !!options.get('cache', true);
    return _this;
  }

  _createClass(Flux, [{
    key: 'off',
    value: function off(event, listener) {
      this.removeListener(event, listener);
    }

    /**
     * Dispatches an action to all stores
     *
     * @param {...Objects} actions to dispatch to all the stores
     */

  }, {
    key: 'dispatch',
    value: function dispatch() {
      var _this2 = this;

      for (var _len = arguments.length, actions = Array(_len), _key = 0; _key < _len; _key++) {
        actions[_key] = arguments[_key];
      }

      if (!Array.isArray(actions)) {
        return;
      }

      // Loop through actions
      actions.map(function (a) {
        if (typeof a.type !== 'string') {
          return;
        }

        var type = a.type;

        var data = _objectWithoutProperties(a, ['type']);

        var oldState = _this2._store;

        // When an action comes in, it must be completely handled by all stores
        _this2._storeClasses.map(function (storeClass) {
          var name = storeClass.name;
          var state = _this2._store.get(name) || _immutable2.default.fromJS(storeClass.initialState()) || (0, _immutable.Map)();
          _this2._store = _this2._store.set(name, storeClass.onAction(type, data, state) || state);

          // Save cache in session storage
          if (_this2._useCache) {
            _this2.setSessionData('nlFlux', _this2._store);
          }

          return storeClass.setState(_this2._store.get(name));
        });

        if (_this2._debug) {
          var actionObj = _immutable2.default.fromJS(a).toJS();
          var hasChanged = !_this2._store.equals(oldState);
          var updatedLabel = hasChanged ? 'Changed State' : 'Unchanged State';
          var updatedColor = hasChanged ? '#00d484' : '#959595';

          console.group('%c FLUX ACTION: ' + type, 'font-weight:700');
          console.log('%c Action: ', 'color: #00C4FF', actionObj);
          console.log('%c Last State: ', 'color: #959595', oldState.toJS());
          console.log('%c ' + updatedLabel + ': ', 'color: ' + updatedColor, _this2._store.toJS());
          console.groupEnd();
        }

        _this2.emit(type, data);
      });
    }

    /**
     * Gets the current state object
     *
     * @param {string} [name] (optional) The name of the store for just that object, otherwise it will return all store
     *   objects.
     * @returns {Map} the state object
     */

  }, {
    key: 'getStore',
    value: function getStore() {
      var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var defaultValue = arguments[1];

      var store = void 0;

      if (Array.isArray(name)) {
        store = this._store.getIn(name, defaultValue);
      } else if (name !== '') {
        store = this._store.get(name, defaultValue);
      } else {
        store = this._store || (0, _immutable.Map)();
      }

      return store;
    }

    /**
     * Registers a new Store with Flux
     *
     * @param {Class} StoreClass A unique name for the Store
     */

  }, {
    key: 'registerStore',
    value: function registerStore(StoreClass) {
      var name = StoreClass.name.toLowerCase();

      if (!this._storeClasses.has(name)) {
        // Create store object
        var store = new StoreClass();
        this._storeClasses = this._storeClasses.set(name, store);

        // Get cached data
        var data = this.getSessionData('nlFlux');
        var cache = this._useCache && _immutable.Map.isMap(data) ? data : (0, _immutable.Map)();

        // Get default values
        var state = this._store.get(name) || cache.get(name) || _immutable2.default.fromJS(store.initialState()) || (0, _immutable.Map)();
        this._store = this._store.set(name, state);

        // Save cache in session storage
        if (this._useCache) {
          this.setSessionData('nlFlux', this._store);
        }
      }

      return this._storeClasses.get(name);
    }

    /**
     * De-registers a named store from Flux
     *
     * @param {string} name The name of the store
     */

  }, {
    key: 'deregisterStore',
    value: function deregisterStore() {
      var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      name = name.toLowerCase();
      this._storeClasses.delete(name);
      this._store = this._store.delete(name);
    }

    /**
     * Gets a store object that is registered with Flux
     *
     * @param {string} name The name of the store
     * @returns {Store} the store object
     */

  }, {
    key: 'getClass',
    value: function getClass() {
      var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      name = name.toLowerCase();
      return this._storeClasses.get(name);
    }

    /**
     * Saves data to the sessionStore
     *
     * @param {string} key Key to store data
     * @param {string|object|array|Immutable} value Data to store.
     */

  }, {
    key: 'setSessionData',
    value: function setSessionData(key, value) {
      var _this3 = this;

      if (_immutable2.default.Iterable.isIterable(value)) {
        value = value.toJS();
      }

      value = JSON.stringify(value);

      if (window && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      } else {
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  _context.next = 3;
                  return _reactNative.AsyncStorage.setItem(key, value);

                case 3:
                  _context.next = 7;
                  break;

                case 5:
                  _context.prev = 5;
                  _context.t0 = _context['catch'](0);

                case 7:
                case 'end':
                  return _context.stop();
              }
            }
          }, _callee, _this3, [[0, 5]]);
        }));
      }
    }

    /**
     * Gets data from
     *
     * @param {string} key The key for data
     * @returns {Immutable} the data object associated with the key
     */

  }, {
    key: 'getSessionData',
    value: function getSessionData(key) {
      var _this4 = this;

      if (window && window.sessionStorage) {
        return _immutable2.default.fromJS(JSON.parse(window.sessionStorage.getItem(key) || '""'));
      } else {
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  return _context3.abrupt('return', _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
                    var value;
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            _context2.prev = 0;
                            _context2.next = 3;
                            return _reactNative.AsyncStorage.getItem(key);

                          case 3:
                            value = _context2.sent;
                            return _context2.abrupt('return', _immutable2.default.fromJS(JSON.parse(value || '""')));

                          case 7:
                            _context2.prev = 7;
                            _context2.t0 = _context2['catch'](0);

                          case 9:
                          case 'end':
                            return _context2.stop();
                        }
                      }
                    }, _callee2, _this4, [[0, 7]]);
                  })));

                case 1:
                case 'end':
                  return _context3.stop();
              }
            }
          }, _callee3, _this4);
        }));
      }
    }

    /**
     * Removes a key from sessionStorage
     *
     * @param {string} key Key associated with the data to remove
     */

  }, {
    key: 'delSessionData',
    value: function delSessionData(key) {
      if (window && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      } else {}
    }

    /**
     * Saves data to localStore
     *
     * @param {string} key Key to store data
     * @param {string|object|array|Immutable} value Data to store.
     */

  }, {
    key: 'setLocalData',
    value: function setLocalData(key, value) {
      var _this5 = this;

      if (_immutable2.default.Iterable.isIterable(value)) {
        value = value.toJS();
      }

      value = JSON.stringify(value);

      if (window && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      } else {
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee4() {
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.prev = 0;
                  _context4.next = 3;
                  return _reactNative.AsyncStorage.setItem(key, value);

                case 3:
                  _context4.next = 7;
                  break;

                case 5:
                  _context4.prev = 5;
                  _context4.t0 = _context4['catch'](0);

                case 7:
                case 'end':
                  return _context4.stop();
              }
            }
          }, _callee4, _this5, [[0, 5]]);
        }));
      }
    }

    /**
     * Gets a store that is registered with Flux
     *
     * @param {string} key The key for data
     * @returns {Immutable} the data object associated with the key
     */

  }, {
    key: 'getLocalData',
    value: function getLocalData(key) {
      var _this6 = this;

      if (window && window.localStorage) {
        return _immutable2.default.fromJS(JSON.parse(window.localStorage.getItem(key) || '""'));
      } else {
        return _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
          var value;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.prev = 0;
                  _context5.next = 3;
                  return _reactNative.AsyncStorage.getItem(key);

                case 3:
                  value = _context5.sent;
                  return _context5.abrupt('return', _immutable2.default.fromJS(JSON.parse(value || '""')));

                case 7:
                  _context5.prev = 7;
                  _context5.t0 = _context5['catch'](0);

                case 9:
                case 'end':
                  return _context5.stop();
              }
            }
          }, _callee5, _this6, [[0, 7]]);
        }));
      }
    }

    /**
     * Removes a key from localStorage
     *
     * @param {string} key Key associated with the data to remove
     */

  }, {
    key: 'delLocalData',
    value: function delLocalData(key) {
      if (window && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    }

    /**
     * Enables the console debugger
     */

  }, {
    key: 'enableDebugger',
    value: function enableDebugger() {
      this._debug = true;
    }
  }]);

  return Flux;
}(_events2.default);

var flux = new Flux(window.nlFlux);
exports.default = flux;