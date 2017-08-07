/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

/**
 * Store
 * @type {Class}
 */
export default class Store {
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
    this.getInitialState = this.getInitialState.bind(this);
    this.initialState = this.initialState.bind(this);
    this.onAction = this.onAction.bind(this);

    // Vars
    this.state = {};
    this.name = name.toLowerCase();
  }

  /**
   * Get the initial state as an immutable object.
   *
   * @return {object} The initial state of the store as an immutable object.
   */
  getInitialState(): object {
    return this.initialState() || {};
  }

  /**
   * Initial state.
   *
   * @return {object} The initial state of the store as a JSON object.
   */
  initialState(): object {
    return {};
  }

  /**
   * Action listener. It should return an altered state depending on the event dispatched.
   *
   * @param {string} type Dispatched event.
   * @param {object} data Data payload associated with the called action.
   * @param {object} state The current state.
   * @return {object} The final state of the store as an immutable object.
   */
  onAction(type: string, data: object, state: object): object {
    return state;
  }
}
