'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
   * @param {object} options  Over-rides for the default set of options
   */
  function Flux() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Flux);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Flux).call(this));

    _this.options = options;

    // Create a hash of all the stores - used for registration / deregistration
    _this._storeClasses = (0, _immutable.Map)();
    _this._store = (0, _immutable.Map)();
    _this.debug = false;
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

        var oldState = (0, _immutable.Map)(_this2._store);

        // When an action comes in, it must be completely handled by all stores
        _this2._storeClasses.map(function (store) {
          var name = store.name;
          var state = _this2._store.get(name) || _immutable2.default.fromJS(store.initialState()) || (0, _immutable.Map)();
          _this2._store = _this2._store.set(name, store.onAction(type, data, state));
        });

        if (!_this2._store.equals(oldState)) {
          if (_this2.debug) {
            console.group('%c FLUX ACTION: ' + type, 'font-weight:700');
            console.log('%c Action: ', 'color: #00C4FF', a);
            console.log('%c Last State: ', 'color: #959595', oldState.toJS());
            console.log('%c New State: ', 'color: #00d484', _this2._store.toJS());
            console.groupEnd();
          }

          _this2.emit(type, data);
        }
      });
    }

    /**
     * Enables the console debugger
     */

  }, {
    key: 'enableDebugger',
    value: function enableDebugger() {
      this.debug = true;
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

      var store = void 0;

      if (name !== '') {
        store = this._store.get(name);
      } else {
        store = this._store;
      }

      return store || (0, _immutable.Map)();
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

        // Get default values
        var state = this._store.get(name) || _immutable2.default.fromJS(store.initialState()) || (0, _immutable.Map)();
        this._store = this._store.set(name, state);
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
     * @param {string} key The name of the store
     * @param {string|object|array|Immutable} value The name of the store
     */

  }, {
    key: 'setSessionData',
    value: function setSessionData(key, value) {
      if (_immutable2.default.Iterable.isIterable(value)) {
        value = _immutable2.default.toJS();
      }

      sessionStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Gets data from
     *
     * @param {string} name The name of the store
     * @returns {Immutable} the data object associated with the key
     */

  }, {
    key: 'getSessionData',
    value: function getSessionData(key) {
      return _immutable2.default.fromJS(JSON.parse(sessionStorage.getItem(key) || '""'));
    }

    /**
     * Removes a key from sessionStorage
     *
     * @param {string} key Key associated with the data to remove
     */

  }, {
    key: 'delSessionData',
    value: function delSessionData(key) {
      sessionStorage.removeItem(key);
    }

    /**
     * Saves data to localStore
     *
     * @param {string} name The name of the store
     * @param {string|object|array|Immutable} value The name of the store
     */

  }, {
    key: 'setLocalData',
    value: function setLocalData(key, value) {
      if (_immutable2.default.Iterable.isIterable(value)) {
        value = _immutable2.default.toJS();
      }

      localStorage.setItem(key, JSON.stringify(value));
    }

    /**
     * Gets a store that is registered with Flux
     *
     * @param {string} name The name of the store
     * @returns {Immutable} the data object associated with the key
     */

  }, {
    key: 'getLocalData',
    value: function getLocalData(key) {
      return _immutable2.default.fromJS(JSON.parse(localStorage.getItem(key) || '""'));
    }

    /**
     * Removes a key from localStorage
     *
     * @param {string} key Key associated with the data to remove
     */

  }, {
    key: 'delLocalData',
    value: function delLocalData(key) {
      localStorage.removeItem(key);
    }
  }]);

  return Flux;
}(_events2.default);

var flux = new Flux();
exports.default = flux;