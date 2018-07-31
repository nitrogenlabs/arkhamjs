/**
 * Copyright (c) 2018, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

/**
 * Store
 * @type {Class}
 */
export class Store {
  defaultState: object;
  state: object;
  name: string;

  /**
   * A Flux store interface
   *
   * @constructor
   * @this {Store}
   */
  constructor(name: string = 'store') {
    // Methods
    this.initialState = this.initialState.bind(this);
    this.onAction = this.onAction.bind(this);

    // Vars
    this.state = {};
    this.name = name;
  }

  /**
   * Initial state.
   *
   * @return {object} The initial state of the store as a JSON object.
   */
  initialState(): object {
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
  onAction(type: string, data, state): object {
    return state;
  }
}
