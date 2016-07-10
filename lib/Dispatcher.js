'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Copyright (c) 2016, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

var Dispatcher = function () {
  /**
   * Create a new instance of the Dispatcher.  Note that the Dispatcher
   * is a Singleton pattern, so only one should ever exist.
   *
   * @constructor
   * @this {Dispatcher}
   * @param {object} options  Over-rides for the default set of options
   */

  function Dispatcher() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Dispatcher);

    this.options = options;

    // Create a hash of all the stores - used for registration / deregistration
    this._stores = {};
  }

  /**
   * Dispatches an Action to all the stores
   *
   * @param {String} type Type of action to dispatch to all the stores
   * @param {Object} data Action parameters
   */

  _createClass(Dispatcher, [{
    key: 'dispatch',
    value: function dispatch(type) {
      var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      if (typeof type !== 'string') {
        return;
      }

      var action = { type: type, data: data };

      // When an action comes in, it must be completely handled by all stores
      for (var storeName in this._stores) {
        if (this._stores.hasOwnProperty(storeName)) {
          this._stores[storeName].onAction(action);
        }
      }
    }

    /**
     * Registers a new Store with the Dispatcher
     *
     * @param {Class} StoreClass A unique name for the Store
     */

  }, {
    key: 'registerStore',
    value: function registerStore(StoreClass) {
      var uid = StoreClass.name;

      if (!(uid in this._stores)) {
        this._stores[uid] = new StoreClass();
      }

      return this._stores[uid];
    }

    /**
     * De-registers a named store from the Dispatcher (completeness of API)
     *
     * @param {string} uid The name of the store
     */

  }, {
    key: 'deregisterStore',
    value: function deregisterStore(uid) {
      if (uid in this._stores) {
        delete this._stores[uid];
      }
    }

    /**
     * Gets a store that is registered with the Dispatcher
     *
     * @param {string} uid The name of the store
     * @returns {Store} the store object
     * @throws 'Invalid Store' if the store does not exist
     */

  }, {
    key: 'getStore',
    value: function getStore(uid) {
      if (uid in this._stores) {
        return this._stores[uid];
      } else {
        throw 'Invalid Store';
      }
    }
  }]);

  return Dispatcher;
}();

var dispatcher = new Dispatcher();
exports.default = dispatcher;