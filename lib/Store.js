'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2016, Nitrogen Labs, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var Store = function (_EventEmitter) {
  _inherits(Store, _EventEmitter);

  /**
   * A Flux-like Store Interface
   *
   * @constructor
   * @this {Store}
   */

  function Store() {
    _classCallCheck(this, Store);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Store).call(this));

    _this.registeredViews = {};
    _this._storeData = {};
    _this._listeners = [];
    return _this;
  }

  _createClass(Store, [{
    key: 'off',
    value: function off(event, listener) {
      this.removeListener(event, listener);
    }

    /**
     * Dummy onAction() method to catch failures in sub-classing the Store appropriately.
     */

  }, {
    key: 'onAction',
    value: function onAction() {}
  }, {
    key: 'on',
    value: function on(event, listener) {
      this.addListener(event, listener);

      // Add to cache
      if (event && listener) {
        this._listeners.push({ event: event, listener: listener });
      }
    }
  }, {
    key: 'off',
    value: function off(event, listener) {
      this.removeListener(event, listener);

      // Remove from cache
      this._listeners = this._listeners.map(function (o) {
        if (o && !(o.event !== event && o.listener !== listener)) {
          return o;
        }
      });
    }

    /**
     * Get the unique id for this store.
     *
     * @return {String}
     */

  }, {
    key: 'registerView',

    /**
     * A view needs to be able to register itself with the store to receive
     * notifications of updates to the store
     *
     * @param {function} callback the method to call back
     * @returns {string} an ID to be used when un-registering
     */
    value: function registerView(callback) {
      var id = this.uid;
      this._registeredViews[id] = callback;
      return id;
    }

    /**
     * A view also needs to be able to de-register itself with the store to
     * stop receiving notifications of updates to the store.
     *
     * @param {string} id the ID from the call to registerView()
     * @param {boolean} force don't throw an error if it doesn't exist
     */

  }, {
    key: 'deregisterView',
    value: function deregisterView(id) {
      var force = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (id in this._registeredViews) {
        delete this._registeredViews[id];
      } else if (!force) {
        throw 'Invalid View Registration ID';
      }
    }

    /**
     * Initialize the store with a key-value pair
     *
     * @param {string} key the key name
     * @param {object} value the key value
     */

  }, {
    key: 'initialize',
    value: function initialize(key, value) {
      this._storeData[key] = value;
    }

    /**
     * Set a key in the store to a new value
     *
     * @param {string} key the key name
     * @param {object} value the key value
     * @throws exception if the key does not exist
     */

  }, {
    key: 'set',
    value: function set(key, value) {
      this._storeData[key] = value;
    }

    /**
     * Retrieve a key in the store
     *
     * @param {string} key the key name
     * @returns {object} the key value
     * @throws exception if the key does not exist
     */

  }, {
    key: 'get',
    value: function get(key) {
      if (key in this._storeData) {
        return this._storeData[key];
      } else {
        throw 'Unknown key ' + key + ' in store';
      }
    }
  }, {
    key: 'uid',
    get: function get() {
      return this.constructor.name;
    }
  }]);

  return Store;
}(_events2.default);

exports.default = Store;