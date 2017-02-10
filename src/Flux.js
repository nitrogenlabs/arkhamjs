import EventEmitter from 'events';
import Immutable, {Map} from 'immutable';

/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
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

    // Methods
    this._deregister = this._deregister.bind(this);
    this._register = this._register.bind(this);
    this.clearAppData = this.clearAppData.bind(this);
    this.config = this.config.bind(this);
    this.debugError = this.debugError.bind(this);
    this.debugInfo = this.debugInfo.bind(this);
    this.debugLog = this.debugLog.bind(this);
    this.delLocalData = this.delLocalData.bind(this);
    this.delSessionData = this.delSessionData.bind(this);
    this.deregisterStore = this.deregisterStore.bind(this);
    this.dispatch = this.dispatch.bind(this);
    this.enableDebugger = this.enableDebugger.bind(this);
    this.getClass = this.getClass.bind(this);
    this.getLocalData = this.getLocalData.bind(this);
    this.getSessionData = this.getSessionData.bind(this);
    this.getStore = this.getStore.bind(this);
    this.off = this.off.bind(this);
    this.registerStore = this.registerStore.bind(this);
    this.setLocalData = this.setLocalData.bind(this);
    this.setSessionData = this.setSessionData.bind(this);
    this.setStore = this.setStore.bind(this);

    // Properties
    this._store = Map();
    this._storeClasses = Map();
    this._window = window || {};

    // Debug modes
    this.DEBUG_DISABLED = 0;
    this.DEBUG_LOGS = 1;
    this.DEBUG_DISPATCH = 2;

    // Configuration
    this.config(options);
  }

  _deregister(name = '') {
    this._storeClasses = this._storeClasses.delete(name);
    this._store = this._store.delete(name);
  }

  _register(StoreClass) {
    if(!StoreClass) {
      throw Error('Class is undefined. Cannot register with Flux.');
    }

    const clsType = StoreClass.constructor.toString().substr(0, 5);

    if(clsType !== 'class' && clsType !== 'funct') {
      throw Error(`${StoreClass} is not a class. Cannot register with Flux.`);
    }

    // Create store object
    const storeCls = new StoreClass();
    const name = storeCls.name;

    if(!this._storeClasses.get(name)) {
      // Save store object
      this._storeClasses = this._storeClasses.set(name, storeCls);

      // Get cached data
      const data = this.getSessionData(this._name);
      const cache = this._useCache && Map.isMap(data) ? data : Map();

      // Get default values
      const state = this._store.get(name) || cache.get(name) || storeCls.getInitialState() || Map();
      this._store = this._store.set(name, state);

      // Save cache in session storage
      if(this._useCache) {
        this.setSessionData(this._name, this._store);
      }
    }

    return this._storeClasses.get(name);
  }

  /**
   * Removes all app data from sessionStorage.
   *
   * @returns {Boolean} Whether app data was successfully removed.
   */
  clearAppData() {
    // Set all store data to initial state
    this._storeClasses.forEach(storeCls => {
      this._store = this._store.set(storeCls.name, Immutable.fromJS(storeCls.getInitialState()));
    });

    this.setSessionData(this._name, this._store);
  }

  /**
   * Set configuration options.
   *
   * @param {object} options Configuration options.
   */
  config(options) {
    this._options = Immutable.fromJS(options || {});

    // Name
    this._name = this._options.get('name', 'arkhamjs');

    // Cache
    this._useCache = this._options.get('useCache', true);

    if(this._useCache) {
      this._store = this.getSessionData(this._name) || Map();
    }

    // Debug
    this._debugLevel = this._options.get('debugLevel', this.DEBUG_DISABLED);
  }

  /**
   * Logs errors in the console. Will also call the debugErrorFnc method set in the config.
   *
   * @param {object} obj A list of JavaScript objects to output. The string representations of each of these objects
   * are appended together in the order listed and output.
   */
  debugError(...obj) {
    if(this._debugLevel) {
      console.error(...obj);
    }

    const fnc = this._options.get('debugErrorFnc');

    if(fnc) {
      fnc(this._debugLevel, ...obj);
    }
  }

  /**
   * Logs informational messages to the console. Will also call the debugInfoFnc method set in the config.
   *
   * @param {object} obj A list of JavaScript objects to output. The string representations of each of these objects
   * are appended together in the order listed and output.
   */
  debugInfo(...obj) {
    if(this._debugLevel) {
      console.info(...obj);
    }

    const fnc = this._options.get('debugInfoFnc');

    if(fnc) {
      fnc(this._debugLevel, ...obj);
    }
  }

  /**
   * Logs data in the console. Only logs when in debug mode.  Will also call the debugLogFnc method set in the config.
   *
   * @param {object} obj A list of JavaScript objects to output. The string representations of each of these objects
   * are appended together in the order listed and output.
   */
  debugLog(...obj) {
    if(this._debugLevel) {
      console.log(...obj);
    }

    const fnc = this._options.get('debugLogFnc');

    if(fnc) {
      fnc(this._debugLevel, ...obj);
    }
  }

  /**
   * Removes a key from localStorage.
   *
   * @param {string} key Key associated with the data to remove.
   * @returns {Boolean} Whether data was successfully removed.
   */
  delLocalData(key) {
    if(this._window && this._window.localStorage) {
      try {
        this._window.localStorage.removeItem(key);
        return true;
      }
      catch(error) {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Removes a key from sessionStorage.
   *
   * @param {string} key Key associated with the data to remove.
   * @returns {Boolean} Whether data was successfully removed.
   */
  delSessionData(key) {
    if(this._window && this._window.sessionStorage) {
      try {
        this._window.sessionStorage.removeItem(key);
        return true;
      }
      catch(error) {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * De-registers a named store.
   *
   * @param {String|Array} name The name of the store or an array of store names.
   */
  deregisterStore(name) {
    if(Array.isArray(name)) {
      name.forEach(n => {
        this._deregister(n);
      });
    } else {
      this._deregister(name);
    }
  }

  /**
   * Dispatches an action to all stores.
   *
   * @param {object} action to dispatch to all the stores.
   * @param {boolean} silent To silence any events.
   */
  dispatch(action, silent = false) {
    action = Immutable.fromJS(action);
    const type = action.get('type');
    const data = action.filter((v, k) => k !== 'type');

    // Require a type
    if(!type) {
      return;
    }

    const oldState = this._store;

    // When an action comes in, it must be completely handled by all stores
    this._storeClasses.forEach(storeCls => {
      const name = storeCls.name;
      const state = this._store.get(name) || storeCls.getInitialState() || Map();
      this._store = this._store.set(name, storeCls.onAction(type, data, state) || state);
      storeCls.state = this._store.get(name);
    });

    if(this._debugLevel > this.DEBUG_LOGS) {
      const hasChanged = !this._store.equals(oldState);
      const updatedLabel = hasChanged ? 'Changed State' : 'Unchanged State';
      const updatedColor = hasChanged ? '#00d484' : '#959595';

      if(console.groupCollapsed) {
        console.groupCollapsed(`FLUX DISPATCH: ${type}`);
        console.log('%c Action: ', 'color: #00C4FF', action.toJS());
        console.log('%c Last State: ', 'color: #959595', oldState.toJS());
        console.log(`%c ${updatedLabel}: `, `color: ${updatedColor}`, this._store.toJS());
        console.groupEnd();
      } else {
        console.log(`FLUX DISPATCH: ${type}`);
        console.log(`Action: ${action.toJS()}`);
        console.log('Last State: ', oldState.toJS());
        console.log(`${updatedLabel}: `, this._store.toJS());
      }
    }

    // Save cache in session storage
    if(this._useCache) {
      this.setSessionData(this._name, this._store);
    }

    if(!silent) {
      this.emit(type, data);
    }

    return action;
  }

  /**
   * Enables the console debugger.
   *
   * @param {number} level Enable or disable the debugger. Uses the constants:
   *   DEBUG_DISABLED (0) - Disable.
   *   DEBUG_LOGS (1) - Enable console logs.
   *   DEBUG_DISPATCH (2) - Enable console logs and dispatch action data (default).
   */
  enableDebugger(level = true) {
    this._debugLevel = level;
  }

  /**
   * Gets a store object that is registered.
   *
   * @param {string} name The name of the store.
   * @returns {Store} the store object.
   */
  getClass(name = '') {
    return this._storeClasses.get(name);
  }

  /**
   * Gets a key from localStorage.
   *
   * @param {string} key The key for data.
   * @returns {Immutable} the data object associated with the key.
   */
  getLocalData(key) {
    if(this._window && this._window.localStorage) {
      try {
        const item = this._window.localStorage.getItem(key);

        if(item) {
          return Immutable.fromJS(JSON.parse(item));
        }

        return null;
      }
      catch(error) {
        return null;
      }
    } else {
      return null;
    }
  }

  /**
   * Gets a key from sessionStorage.
   *
   * @param {string} key The key for data.
   * @returns {Immutable} the data object associated with the key.
   */
  getSessionData(key) {
    if(this._window && this._window.sessionStorage) {
      try {
        const item = this._window.sessionStorage.getItem(key);

        if(item) {
          return Immutable.fromJS(JSON.parse(item));
        }

        return null;
      }
      catch(error) {
        return null;
      }
    } else {
      return null;
    }
  }

  /**
   * Gets the current state object.
   *
   * @param {string|array} [name] (optional) The name of the store for an object, otherwise it will return all store
   *   objects. You can also use an array to specify a property within the object (uses the immutable, getIn).
   * @param {string} [defaultValue] (optional) A default value to return if null.
   * @returns {Map} the state object.
   */
  getStore(name = '', defaultValue) {
    if(Array.isArray(name)) {
      return this._store.getIn(name, defaultValue);
    }
    else if(name !== '') {
      return this._store.get(name, defaultValue);
    } else {
      return this._store || Map();
    }
  }

  /**
   * Removes an event listener.
   *
   * @param {string} [eventType] Event to unsubscribe.
   * @param {function} [listener] The callback associated with the subscribed event.
   */
  off(eventType, listener) {
    this.removeListener(eventType, listener);
  }

  /**
   * Registers a new Store.
   *
   * @param {Class|Array} StoreClass Store class.
   * @returns {Object|Array} the class object(s).
   */
  registerStore(StoreClass) {
    if(Array.isArray(StoreClass)) {
      return StoreClass.map(cls => this._register(cls));
    } else {
      return this._register(StoreClass);
    }
  }

  /**
   * Saves data to localStorage.
   *
   * @param {string} key Key to store data.
   * @param {string|object|array|Immutable} value Data to store.
   * @returns {Boolean} Whether data was successfully saved.
   */
  setLocalData(key, value) {
    if(this._window && this._window.localStorage) {
      try {
        if(Immutable.Iterable.isIterable(value)) {
          value = value.toJS();
        }

        value = JSON.stringify(value);
        this._window.localStorage.setItem(key, value);
        return true;
      }
      catch(error) {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Saves data to sessionStorage.
   *
   * @param {string} key Key to store data.
   * @param {string|object|array|Immutable} value Data to store.
   * @returns {Boolean} Whether data was successfully saved.
   */
  setSessionData(key, value) {
    if(this._window && this._window.sessionStorage) {
      try {
        if(Immutable.Iterable.isIterable(value)) {
          value = value.toJS();
        }

        value = JSON.stringify(value);
        this._window.sessionStorage.setItem(key, value);
        return true;
      }
      catch(error) {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Sets the current state object.
   *
   * @param {string|array} [name] The name of the store to set. You can also use an array to specify a property
   * within the object (uses the immutable, setIn).
   * @param {any} [value] The value to set.
   * @returns {Immutable} the object that was set.
   */
  setStore(name = '', value) {
    if(Array.isArray(name)) {
      return this._store = this._store.setIn(name, value);
    }
    else if(name !== '') {
      return this._store = this._store.set(name, value);
    } else {
      return this._store || Map();
    }
  }
}

const flux = new Flux((window || {}).arkhamjs);
export default flux;
