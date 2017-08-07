/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

import {EventEmitter} from 'events';
import {LocationDescriptor} from 'history';
import {cloneDeep, get, isEqual, set} from 'lodash';
import Store from './Store';

export enum FluxDebugLevel {DEBUG_DISABLED, DEBUG_LOGS, DEBUG_DISPATCH}

export interface FluxOptions {
  readonly basename?: string;
  readonly context?: object;
  debugLevel?: FluxDebugLevel;
  readonly debugErrorFnc?: (debugLevel: number, ...args) => void;
  readonly debugInfoFnc?: (debugLevel: number, ...args) => void;
  readonly debugLogFnc?: (debugLevel: number, ...args) => void;
  readonly forceRefresh?: boolean;
  readonly getUserConfirmation?: () => void;
  hashType?: 'slash' | 'noslash' | 'hashbang';
  readonly history?: object;
  initialEntries?: LocationDescriptor[];
  readonly initialIndex?: number;
  readonly keyLength?: number;
  readonly location?: string | object;
  readonly name?: string;
  readonly routerType?: string;
  readonly scrollToTop?: boolean;
  readonly title?: string;
  readonly useCache?: boolean;
}

export interface FluxAction {
  readonly type: string;
  readonly [key: string]: any;
}

/**
 * Flux
 * @type {EventEmitter}
 */
export class Flux extends EventEmitter {
  private store: object;
  private storeClasses: object;
  private defaultOptions: FluxOptions = {
    debugLevel: FluxDebugLevel.DEBUG_DISABLED,
    forceRefresh: 'pushState' in window.history,
    name: 'arkhamjs',
    routerType: 'browser',
    scrollToTop: true,
    title: 'ArkhamJS',
    useCache: true
  };
  private options: FluxOptions = this.defaultOptions;
  private window;
  
  /**
   * Create a new instance of Flux.  Note that the Flux object
   * is a Singleton pattern, so only one should ever exist.
   *
   * @constructor
   * @this {Flux}
   */
  constructor(options: FluxOptions) {
    super();
    
    // Methods
    this.deregister = this.deregister.bind(this);
    this.register = this.register.bind(this);
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
    this.store = {};
    this.storeClasses = {};
    this.window = window || {};
    
    // Configuration
    this.config(options);
  }
  
  /**
   * Removes all app data from sessionStorage.
   *
   * @returns {boolean} Whether app data was successfully removed.
   */
  clearAppData(): boolean {
    // Set all store data to initial state
    Object
      .keys(this.storeClasses)
      .forEach((storeName: string) => {
        const storeCls: Store = this.storeClasses[storeName];
        this.store[storeCls.name] = storeCls.getInitialState();
      });
    
    return this.setSessionData(this.options.name, this.store);
  }
  
  /**
   * Set configuration options.
   *
   * @param {object} options Configuration options.
   */
  config(options: FluxOptions): void {
    this.options = {...this.defaultOptions, ...options};
    const {name, useCache} = this.options;
    
    // Cache
    if(useCache) {
      this.store = this.getSessionData(name) || {};
    }
  }
  
  /**
   * Logs errors in the console. Will also call the debugErrorFnc method set in the config.
   *
   * @param {object} obj A list of JavaScript objects to output. The string representations of each of these objects
   * are appended together in the order listed and output.
   */
  debugError(...obj): void {
    const {debugErrorFnc, debugLevel} = this.options;
    
    if(debugLevel) {
      console.error(...obj);
    }
    
    if(debugErrorFnc) {
      debugErrorFnc(debugLevel, ...obj);
    }
  }
  
  /**
   * Logs informational messages to the console. Will also call the debugInfoFnc method set in the config.
   *
   * @param {object} obj A list of JavaScript objects to output. The string representations of each of these objects
   * are appended together in the order listed and output.
   */
  debugInfo(...obj): void {
    const {debugInfoFnc, debugLevel} = this.options;
    
    if(debugLevel) {
      console.info(...obj);
    }
    
    if(debugInfoFnc) {
      debugInfoFnc(debugLevel, ...obj);
    }
  }
  
  /**
   * Logs data in the console. Only logs when in debug mode.  Will also call the debugLogFnc method set in the config.
   *
   * @param {object} obj A list of JavaScript objects to output. The string representations of each of these objects
   * are appended together in the order listed and output.
   */
  debugLog(...obj): void {
    const {debugLogFnc, debugLevel} = this.options;
    
    if(debugLevel) {
      console.log(...obj);
    }
    
    if(debugLogFnc) {
      debugLogFnc(debugLevel, ...obj);
    }
  }
  
  /**
   * Removes a key from localStorage.
   *
   * @param {string} key Key associated with the data to remove.
   * @returns {boolean} Whether data was successfully removed.
   */
  delLocalData(key: string): boolean {
    const {localStorage} = this.window;
    
    if(localStorage) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch(error) {
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
   * @returns {boolean} Whether data was successfully removed.
   */
  delSessionData(key: string): boolean {
    const {sessionStorage} = this.window;
    
    if(sessionStorage) {
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch(error) {
        return false;
      }
    } else {
      return false;
    }
  }
  
  /**
   * De-registers a named store.
   *
   * @param {array} stores The names of the stores to remove from the framework..
   */
  deregisterStore(stores: string[]): void {
    stores.forEach((s: string) => this.deregister(s));
  }
  
  /**
   * Dispatches an action to all stores.
   *
   * @param {object} action to dispatch to all the stores.
   * @param {boolean} silent To silence any events.
   */
  dispatch(action: FluxAction, silent: boolean = false): object {
    action = cloneDeep(action);
    const {type, ...data} = action;
    
    // Require a type
    if(!type) {
      return {};
    }
    
    const oldState = cloneDeep(this.store);
    const {useCache, debugLevel, name} = this.options;
    
    // When an action comes in, it must be completely handled by all stores
    Object
      .keys(this.storeClasses)
      .forEach((storeName: string) => {
        const storeCls: Store = this.storeClasses[storeName];
        const state = this.store[storeName] || storeCls.getInitialState() || {};
        this.store[storeName] = cloneDeep(storeCls.onAction(type, data, state)) || cloneDeep(state);
        storeCls.state = this.store[storeName];
      });
    
    if(debugLevel > FluxDebugLevel.DEBUG_LOGS) {
      const hasChanged = !isEqual(this.store, oldState);
      const updatedLabel = hasChanged ? 'Changed State' : 'Unchanged State';
      const updatedColor = hasChanged ? '#00d484' : '#959595';
      
      if(console.groupCollapsed) {
        console.groupCollapsed(`FLUX DISPATCH: ${type}`);
        console.log('%c Action: ', 'color: #00C4FF', action);
        console.log('%c Last State: ', 'color: #959595', oldState);
        console.log(`%c ${updatedLabel}: `, `color: ${updatedColor}`, cloneDeep(this.store));
        console.groupEnd();
      } else {
        console.log(`FLUX DISPATCH: ${type}`);
        console.log(`Action: ${action}`);
        console.log('Last State: ', oldState);
        console.log(`${updatedLabel}: `, cloneDeep(this.store));
      }
    }
    
    // Save cache in session storage
    if(useCache) {
      this.setSessionData(name, this.store);
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
  enableDebugger(level: number = FluxDebugLevel.DEBUG_DISPATCH): void {
    this.options.debugLevel = level;
  }
  
  /**
   * Gets a store object that is registered.
   *
   * @param {string} name The name of the store.
   * @returns {Store} the store object.
   */
  getClass(name: string = ''): Store {
    return this.storeClasses[name];
  }
  
  /**
   * Gets a key from localStorage.
   *
   * @param {string} key The key for data.
   * @returns {any} the data object associated with the key.
   */
  getLocalData(key: string): any {
    const {localStorage} = this.window;
    
    if(localStorage) {
      try {
        const item = localStorage.getItem(key);
        
        if(item) {
          return JSON.parse(item);
        }
        
        return null;
      } catch(error) {
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
   * @returns {any} the data object associated with the key.
   */
  getSessionData(key: string): any {
    const {sessionStorage} = this.window;
    
    if(sessionStorage) {
      try {
        const item = sessionStorage.getItem(key);
        
        if(item) {
          return JSON.parse(item);
        }
        
        return null;
      } catch(error) {
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
   * @param {any} [defaultValue] (optional) A default value to return if null.
   * @returns {object} the state object or a property within.
   */
  getStore(name: string | string[] = '', defaultValue?): any {
    let storeValue;
    
    if(name === '') {
      storeValue = this.store || {};
    } else {
      storeValue = get(this.store, name);
    }
    
    return cloneDeep(storeValue) || defaultValue;
  }
  
  /**
   * Removes an event listener.
   *
   * @param {string} [eventType] Event to unsubscribe.
   * @param {function} [listener] The callback associated with the subscribed event.
   */
  off(eventType: string, listener): void {
    this.removeListener(eventType, listener);
  }
  
  /**
   * Registers a new Store.
   *
   * @param {array} stores Store class.
   * @returns {array} the class object(s).
   */
  registerStore(stores: Store[]): object[] {
    return stores.map((store: Store) => this.register(store));
  }
  
  /**
   * Saves data to localStorage.
   *
   * @param {string} key Key to store data.
   * @param {any} value Data to store.
   * @returns {boolean} Whether data was successfully saved.
   */
  setLocalData(key: string, value): boolean {
    const {localStorage} = this.window;
    
    if(localStorage) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch(error) {
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
   * @param {any} value Data to store.
   * @returns {boolean} Whether data was successfully saved.
   */
  setSessionData(key: string, value): boolean {
    const {sessionStorage} = this.window;
    
    if(sessionStorage) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch(error) {
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
   */
  setStore(name: string | string[] = '', value): void {
    if(name !== '') {
      this.store = set(cloneDeep(this.store), name, cloneDeep(value));
    }
  }
  
  private deregister(name: string = ''): void {
    delete this.storeClasses[name];
    delete this.store[name];
  }
  
  private register(StoreClass): object {
    if(!StoreClass) {
      throw Error('Class is undefined. Cannot register with Flux.');
    }
    
    const clsType: string = StoreClass.constructor.toString().substr(0, 5);
    
    if(clsType !== 'class' && clsType !== 'funct') {
      throw Error(`${StoreClass} is not a class. Cannot register with Flux.`);
    }
    
    // Create store object
    const storeCls = new StoreClass();
    const {name: storeName} = storeCls;
    
    if(!this.storeClasses[storeName]) {
      const {name, useCache} = this.options;
      
      // Save store object
      this.storeClasses[storeName] = storeCls;
      
      // Get cached data
      const sessionCache = this.getSessionData(name);
      const cache = useCache && sessionCache || {};
      
      // Get default values
      const state = cache[storeName] || this.store[storeName] || storeCls.getInitialState() || [];
      const store = cloneDeep(this.store);
      store[storeName] = cloneDeep(state);
      this.store = store;
      
      // Save cache in session storage
      if(useCache) {
        this.setSessionData(name, this.store);
      }
    }
    
    return this.storeClasses[storeName];
  }
}

const fluxConfig = {
  ...window,
  arkhamjs: {}
};

const flux: Flux = new Flux(fluxConfig.arkhamjs);
export default flux;
