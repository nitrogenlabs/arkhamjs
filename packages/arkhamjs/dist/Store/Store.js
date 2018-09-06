"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Store = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Copyright (c) 2018, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

/**
 * Store
 * @type {Class}
 */
var Store =
/*#__PURE__*/
function () {
  /**
   * A Flux store interface
   *
   * @constructor
   * @this {Store}
   */
  function Store() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'store';

    _classCallCheck(this, Store);

    _defineProperty(this, "defaultState", void 0);

    _defineProperty(this, "state", void 0);

    _defineProperty(this, "name", void 0);

    // Methods
    this.initialState = this.initialState.bind(this);
    this.onAction = this.onAction.bind(this); // Vars

    this.state = {};
    this.name = name;
  }
  /**
   * Initial state.
   *
   * @return {object} The initial state of the store as a JSON object.
   */


  _createClass(Store, [{
    key: "initialState",
    value: function initialState() {
      return this.defaultState || {};
    }
    /**
     * Action listener. It should return an altered state depending on the event dispatched.
     *
     * @param {string} type Dispatched event.
     * @param {object} data Data payload associated with the called action.
     * @param {object} state The current state.
     * @return {object} The final state of the store.
     */

  }, {
    key: "onAction",
    value: function onAction(type, data, state) {
      return state;
    }
  }]);

  return Store;
}();

exports.Store = Store;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9TdG9yZS9TdG9yZS50cyJdLCJuYW1lcyI6WyJTdG9yZSIsIm5hbWUiLCJpbml0aWFsU3RhdGUiLCJiaW5kIiwib25BY3Rpb24iLCJzdGF0ZSIsImRlZmF1bHRTdGF0ZSIsInR5cGUiLCJkYXRhIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7QUFLQTs7OztJQUlhQSxLOzs7QUFLWDs7Ozs7O0FBTUEsbUJBQW9DO0FBQUEsUUFBeEJDLElBQXdCLHVFQUFULE9BQVM7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQ2xDO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQixLQUFLQSxZQUFMLENBQWtCQyxJQUFsQixDQUF1QixJQUF2QixDQUFwQjtBQUNBLFNBQUtDLFFBQUwsR0FBZ0IsS0FBS0EsUUFBTCxDQUFjRCxJQUFkLENBQW1CLElBQW5CLENBQWhCLENBSGtDLENBS2xDOztBQUNBLFNBQUtFLEtBQUwsR0FBYSxFQUFiO0FBQ0EsU0FBS0osSUFBTCxHQUFZQSxJQUFaO0FBQ0Q7QUFFRDs7Ozs7Ozs7O21DQUt1QjtBQUNyQixhQUFPLEtBQUtLLFlBQUwsSUFBcUIsRUFBNUI7QUFDRDtBQUVEOzs7Ozs7Ozs7Ozs2QkFRU0MsSSxFQUFjQyxJLEVBQU1ILEssRUFBZTtBQUMxQyxhQUFPQSxLQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgMjAxOCwgTml0cm9nZW4gTGFicywgSW5jLlxuICogQ29weXJpZ2h0cyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSB0aGUgYWNjb21wYW55aW5nIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMuXG4gKi9cblxuLyoqXG4gKiBTdG9yZVxuICogQHR5cGUge0NsYXNzfVxuICovXG5leHBvcnQgY2xhc3MgU3RvcmUge1xuICBkZWZhdWx0U3RhdGU6IG9iamVjdDtcbiAgc3RhdGU6IG9iamVjdDtcbiAgbmFtZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBIEZsdXggc3RvcmUgaW50ZXJmYWNlXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAdGhpcyB7U3RvcmV9XG4gICAqL1xuICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcgPSAnc3RvcmUnKSB7XG4gICAgLy8gTWV0aG9kc1xuICAgIHRoaXMuaW5pdGlhbFN0YXRlID0gdGhpcy5pbml0aWFsU3RhdGUuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uQWN0aW9uID0gdGhpcy5vbkFjdGlvbi5iaW5kKHRoaXMpO1xuXG4gICAgLy8gVmFyc1xuICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWwgc3RhdGUuXG4gICAqXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIGluaXRpYWwgc3RhdGUgb2YgdGhlIHN0b3JlIGFzIGEgSlNPTiBvYmplY3QuXG4gICAqL1xuICBpbml0aWFsU3RhdGUoKTogb2JqZWN0IHtcbiAgICByZXR1cm4gdGhpcy5kZWZhdWx0U3RhdGUgfHwge307XG4gIH1cblxuICAvKipcbiAgICogQWN0aW9uIGxpc3RlbmVyLiBJdCBzaG91bGQgcmV0dXJuIGFuIGFsdGVyZWQgc3RhdGUgZGVwZW5kaW5nIG9uIHRoZSBldmVudCBkaXNwYXRjaGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSBEaXNwYXRjaGVkIGV2ZW50LlxuICAgKiBAcGFyYW0ge29iamVjdH0gZGF0YSBEYXRhIHBheWxvYWQgYXNzb2NpYXRlZCB3aXRoIHRoZSBjYWxsZWQgYWN0aW9uLlxuICAgKiBAcGFyYW0ge29iamVjdH0gc3RhdGUgVGhlIGN1cnJlbnQgc3RhdGUuXG4gICAqIEByZXR1cm4ge29iamVjdH0gVGhlIGZpbmFsIHN0YXRlIG9mIHRoZSBzdG9yZS5cbiAgICovXG4gIG9uQWN0aW9uKHR5cGU6IHN0cmluZywgZGF0YSwgc3RhdGUpOiBvYmplY3Qge1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxufVxuIl19