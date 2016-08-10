'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Copyright (c) 2016, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

var Store = function () {
  /**
   * A Flux-like Store Interface
   *
   * @constructor
   * @this {Store}
   */
  function Store() {
    _classCallCheck(this, Store);
  }

  _createClass(Store, [{
    key: 'initialState',
    value: function initialState() {
      return _immutable2.default.Map();
    }

    /**
     * Action listener. It should return an altered state depending on the event dispatched.
     *
     * @param {String} type Dispatched event
     * @param {String} data Data payload associated with the called action
     * @param {String} state The current state
     * @return {String}
     */

  }, {
    key: 'onAction',
    value: function onAction(type, data, state) {}

    /**
     * Get name of the store.
     *
     * @return {String}
     */

  }, {
    key: 'name',
    get: function get() {
      return this.constructor.name.toLowerCase();
    }
  }]);

  return Store;
}();

exports.default = Store;