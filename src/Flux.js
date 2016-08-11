import EventEmitter from 'events';
import Immutable, {Map} from 'immutable';

/**
 * Copyright (c) 2016, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

class Flux extends EventEmitter {
  /**
   * Create a new instance of Flux.  Note that the Flux object
   * is a Singleton pattern, so only one should ever exist.
   *
   * @constructor
   * @this {Flux}
   * @param {object} options  Over-rides for the default set of options
   */
  constructor(options = {}) {
    super();
    this.options = options;

    // Create a hash of all the stores - used for registration / deregistration
    this._storeClasses = Map();
    this._store = Map();
    this.debug = false;
  }

  off(event, listener) {
    this.removeListener(event, listener);
  }

  /**
   * Dispatches an action to all stores
   *
   * @param {...Objects} actions to dispatch to all the stores
   */
  dispatch(...actions) {
    if(!Array.isArray(actions)) {
      return;
    }

    // Loop through actions
    actions.map(a => {
      if(typeof a.type !== 'string') {
        return;
      }

      const {type, ...data} = a;
      const oldState = Map(this._store);

      // When an action comes in, it must be completely handled by all stores
      this._storeClasses.map(store => {
        const name = store.name;
        const state = this._store.get(name) || Immutable.fromJS(store.initialState()) || Map();
        this._store = this._store.set(name, store.onAction(type, data, state) || state);
      });

      if(!this._store.equals(oldState)) {
        if(this.debug) {
          console.group(`%c FLUX ACTION: ${type}`, 'font-weight:700');
          console.log('%c Action: ', 'color: #00C4FF', a);
          console.log('%c Last State: ', 'color: #959595', oldState.toJS());
          console.log('%c New State: ', 'color: #00d484', this._store.toJS());
          console.groupEnd();
        }
      }

      this.emit(type, data);
    });
  }

  /**
   * Enables the console debugger
   */
  enableDebugger() {
    this.debug = true;
  }

  /**
   * Gets the current state object
   *
   * @param {string} [name] (optional) The name of the store for just that object, otherwise it will return all store
   *   objects.
   * @returns {Map} the state object
   */
  getStore(name = '') {
    let store;

    if(name !== '') {
      store = this._store.get(name);
    } else {
      store = this._store;
    }

    return store || Map();
  }

  /**
   * Registers a new Store with Flux
   *
   * @param {Class} StoreClass A unique name for the Store
   */
  registerStore(StoreClass) {
    const name = StoreClass.name.toLowerCase();

    if(!this._storeClasses.has(name)) {
      // Create store object
      const store = new StoreClass();
      this._storeClasses = this._storeClasses.set(name, store);

      // Get default values
      const state = this._store.get(name) || Immutable.fromJS(store.initialState()) || Map();
      this._store = this._store.set(name, state);
    }

    return this._storeClasses.get(name);
  }

  /**
   * De-registers a named store from Flux
   *
   * @param {string} name The name of the store
   */
  deregisterStore(name = '') {
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
  getClass(name = '') {
    name = name.toLowerCase();
    return this._storeClasses.get(name);
  }

  /**
   * Saves data to the sessionStore
   *
   * @param {string} key The name of the store
   * @param {string|object|array|Immutable} value The name of the store
   */
  setSessionData(key, value) {
    if(Immutable.Iterable.isIterable(value)) {
      value = Immutable.toJS();
    }

    sessionStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Gets data from
   *
   * @param {string} name The name of the store
   * @returns {Immutable} the data object associated with the key
   */
  getSessionData(key) {
    return Immutable.fromJS(JSON.parse(sessionStorage.getItem(key) || '""'));
  }

  /**
   * Removes a key from sessionStorage
   *
   * @param {string} key Key associated with the data to remove
   */
  delSessionData(key) {
    sessionStorage.removeItem(key);
  }

  /**
   * Saves data to localStore
   *
   * @param {string} name The name of the store
   * @param {string|object|array|Immutable} value The name of the store
   */
  setLocalData(key, value) {
    if(Immutable.Iterable.isIterable(value)) {
      value = Immutable.toJS();
    }

    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * Gets a store that is registered with Flux
   *
   * @param {string} name The name of the store
   * @returns {Immutable} the data object associated with the key
   */
  getLocalData(key) {
    return Immutable.fromJS(JSON.parse(localStorage.getItem(key) || '""'));
  }

  /**
   * Removes a key from localStorage
   *
   * @param {string} key Key associated with the data to remove
   */
  delLocalData(key) {
    localStorage.removeItem(key);
  }
}

const flux = new Flux();
export default flux;
