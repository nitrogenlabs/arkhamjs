import EventEmitter from 'events';
import {AsyncStorage} from 'react-native';
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
   */
  constructor(options = {}) {
    super();

    // Options
    options = Immutable.fromJS(options);

    // Create a hash of all the stores - used for registration / de-registration
    this._storeClasses = Map();
    this._store = Map();
    this._debug = !!options.get('debug', false);
    this._useCache = !!options.get('cache', true);
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
      const oldState = this._store;

      // When an action comes in, it must be completely handled by all stores
      this._storeClasses.map(storeClass => {
        const name = storeClass.name;
        const state = this._store.get(name) || Immutable.fromJS(storeClass.initialState()) || Map();
        this._store = this._store.set(name, storeClass.onAction(type, data, state) || state);

        // Save cache in session storage
        if(this._useCache) {
          this.setSessionData('nlFlux', this._store);
        }

        return storeClass.setState(this._store.get(name));
      });

      if(this._debug) {
        const actionObj = Immutable.fromJS(a).toJS();
        const hasChanged = !this._store.equals(oldState);
        const updatedLabel = hasChanged ? 'Changed State' : 'Unchanged State';
        const updatedColor = hasChanged ? '#00d484' : '#959595';

        console.group(`%c FLUX ACTION: ${type}`, 'font-weight:700');
        console.log('%c Action: ', 'color: #00C4FF', actionObj);
        console.log('%c Last State: ', 'color: #959595', oldState.toJS());
        console.log(`%c ${updatedLabel}: `, `color: ${updatedColor}`, this._store.toJS());
        console.groupEnd();
      }

      this.emit(type, data);
    });
  }

  /**
   * Gets the current state object
   *
   * @param {string} [name] (optional) The name of the store for just that object, otherwise it will return all store
   *   objects.
   * @returns {Map} the state object
   */
  getStore(name = '', defaultValue) {
    let store;

    if(Array.isArray(name)) {
      store = this._store.getIn(name, defaultValue);
    }
    else if(name !== '') {
      store = this._store.get(name, defaultValue);
    } else {
      store = this._store || Map();
    }

    return store;
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

      // Get cached data
      const data = this.getSessionData('nlFlux');
      const cache = this._useCache && Map.isMap(data) ? data : Map();

      // Get default values
      const state = this._store.get(name) || cache.get(name) || Immutable.fromJS(store.initialState()) || Map();
      this._store = this._store.set(name, state);


      // Save cache in session storage
      if(this._useCache) {
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
   * @param {string} key Key to store data
   * @param {string|object|array|Immutable} value Data to store.
   */
  setSessionData(key, value) {
    if(Immutable.Iterable.isIterable(value)) {
      value = value.toJS();
    }

    value = JSON.stringify(value);

    if(window && window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    } else {
      return async() => {
        try {
          await AsyncStorage.setItem(key, value);
        }
        catch(error) {
        }
      }
    }
  }

  /**
   * Gets data from
   *
   * @param {string} key The key for data
   * @returns {Immutable} the data object associated with the key
   */
  getSessionData(key) {
    if(window && window.sessionStorage) {
      return Immutable.fromJS(JSON.parse(window.sessionStorage.getItem(key) || '""'));
    } else {
      return async() => {
        return async() => {
          try {
            const value = await AsyncStorage.getItem(key);
            return Immutable.fromJS(JSON.parse(value || '""'));
          }
          catch(error) {
          }
        }
      }
    }
  }

  /**
   * Removes a key from sessionStorage
   *
   * @param {string} key Key associated with the data to remove
   */
  delSessionData(key) {
    if(window && window.sessionStorage) {
      window.sessionStorage.removeItem(key);
    } else {

    }
  }

  /**
   * Saves data to localStore
   *
   * @param {string} key Key to store data
   * @param {string|object|array|Immutable} value Data to store.
   */
  setLocalData(key, value) {
    if(Immutable.Iterable.isIterable(value)) {
      value = value.toJS();
    }

    value = JSON.stringify(value);

    if(window && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    } else {
      return async() => {
        try {
          await AsyncStorage.setItem(key, value);
        }
        catch(error) {
        }
      }
    }
  }

  /**
   * Gets a store that is registered with Flux
   *
   * @param {string} key The key for data
   * @returns {Immutable} the data object associated with the key
   */
  getLocalData(key) {
    if(window && window.localStorage) {
      return Immutable.fromJS(JSON.parse(window.localStorage.getItem(key) || '""'));
    } else {
      return async() => {
        try {
          const value = await AsyncStorage.getItem(key);
          return Immutable.fromJS(JSON.parse(value || '""'));
        }
        catch(error) {}
      }
    }
  }

  /**
   * Removes a key from localStorage
   *
   * @param {string} key Key associated with the data to remove
   */
  delLocalData(key) {
    if(window && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  }

  /**
   * Enables the console debugger
   */
  enableDebugger() {
    this._debug = true;
  }
}

const flux = new Flux(window.nlFlux);
export default flux;