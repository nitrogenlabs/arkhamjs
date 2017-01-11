import {Map} from 'immutable';

/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

export default class Store {
  /**
   * A Flux-like Store Interface
   *
   * @constructor
   * @this {Store}
   */
  constructor(name) {
    this.state = Map();
    this.name = (name || '').toLowerCase();
  }

  /**
   * Initial state.
   *
   */
  initialState() {
    return Map();
  }

  /**
   * Action listener. It should return an altered state depending on the event dispatched.
   *
   * @param {String} type Dispatched event
   * @param {Object} data Data payload associated with the called action
   * @param {Immutable} state The current state
   * @return {String}
   */
  onAction(type, data, state) {
    switch(type) {
      default:
        return state;
    }
  }
}
