/**
 * Copyright (c) 2018, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

import {EventEmitter} from 'events';
import {cloneDeep, get, isEqual, set} from 'lodash';
import {ArkhamConstants} from '../constants/ArkhamConstants';
import {Store} from '../Store/Store';

export enum FluxDebugLevel {DISABLED, LOGS, DISPATCH}

export interface FluxOptions {
  readonly basename?: string;
  readonly context?: object;
  readonly debugLevel?: FluxDebugLevel;
  readonly debugErrorFnc?: (debugLevel: number, ...args) => void;
  readonly debugInfoFnc?: (debugLevel: number, ...args) => void;
  readonly debugLogFnc?: (debugLevel: number, ...args) => void;
  readonly forceRefresh?: boolean;
  readonly getUserConfirmation?: () => void;
  readonly hashType?: 'slash' | 'noslash' | 'hashbang';
  readonly history?: object;
  readonly initialEntries?: any[];
  readonly initialIndex?: number;
  readonly keyLength?: number;
  readonly location?: string | object;
  readonly name?: string;
  readonly routerType?: string;
  readonly scrollToTop?: boolean;
  readonly storage: FluxStorageType;
  readonly title?: string;
}

export interface FluxAction {
  readonly type: string;
  readonly [key: string]: any;
}

export interface FluxStorageType {
  readonly getStorageData: (key: string) => Promise<any>;
  readonly setStorageData: (key: string, value: any) => Promise<boolean>;
}

/**
 * FluxFramework
 * @type {EventEmitter}
 */
export class FluxFramework extends EventEmitter {
  // Properties
  private store: any = {};
  private storeClasses: any = {};
  private defaultOptions: FluxOptions = {
    debugLevel: FluxDebugLevel.DISABLED,
    forceRefresh: 'pushState' in window.history,
    name: 'arkhamjs',
    routerType: 'browser',
    scrollToTop: true,
    storage: null,
    title: 'ArkhamJS'
  };
  private options: FluxOptions = this.defaultOptions;

  /**
   * Create a new instance of Flux.  Note that the Flux object
   * is a Singleton pattern, so only one should ever exist.
   *
   * @constructor
   * @this {FluxFramework}
   */
  constructor() {
    super();

    // Methods
    this.clearAppData = this.clearAppData.bind(this);
    this.config = this.config.bind(this);
    this.debugError = this.debugError.bind(this);
    this.debugInfo = this.debugInfo.bind(this);
    this.debugLog = this.debugLog.bind(this);
    this.deregister = this.deregister.bind(this);
    this.deregisterStores = this.deregisterStores.bind(this);
    this.dispatch = this.dispatch.bind(this);
    this.enableDebugger = this.enableDebugger.bind(this);
    this.getClass = this.getClass.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.getStore = this.getStore.bind(this);
    this.off = this.off.bind(this);
    this.register = this.register.bind(this);
    this.registerStores = this.registerStores.bind(this);
    this.setStore = this.setStore.bind(this);

    // Configuration
    this.config(this.defaultOptions);
  }

  /**
   * Removes all app data from storage.
   *
   * @returns {Promise<boolean>} Whether app data was successfully removed.
   */
  clearAppData(): Promise<boolean> {
    // Set all store data to initial state
    Object
      .keys(this.storeClasses)
      .forEach((storeName: string) => {
        const storeCls: Store = this.storeClasses[storeName];
        this.store[storeCls.name] = cloneDeep(storeCls.initialState());
      });

    const {name, storage} = this.options;
    return storage.setStorageData(name, this.store);
  }

  /**
   * Set configuration options.
   *
   * @param {object} options Configuration options.
   */
  async config(options: FluxOptions): Promise<void> {
    this.options = {...this.defaultOptions, ...options};
    const {name, storage} = this.options;

    // Cache
    if(storage) {
      this.store = await storage.getStorageData(name) || {};
    }

    return null;
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
   * De-registers named stores.
   *
   * @param {array} storeNames An array of store names to remove from the framework.
   */
  deregisterStores(storeNames: string[]): void {
    storeNames.forEach((name: string) => this.deregister(name));
  }

  /**
   * Dispatches an action to all stores.
   *
   * @param {object} action to dispatch to all the stores.
   * @param {boolean} silent To silence any events.
   * @returns {Promise} The promise is resolved when and if the app saves data to storage, returning
   * the action.
   */
  async dispatch(action: FluxAction, silent: boolean = false): Promise<FluxAction> {
    action = cloneDeep(action);
    const {type, ...data} = action;

    // Require a type
    if(!type) {
      return Promise.resolve(action);
    }

    const oldState = cloneDeep(this.store);
    const {debugLevel, name, storage} = this.options;

    // When an action comes in, it must be completely handled by all stores
    Object
      .keys(this.storeClasses)
      .forEach((storeName: string) => {
        const storeCls: Store = this.storeClasses[storeName];
        const state = this.store[storeName] || storeCls.initialState() || {};
        this.store[storeName] = cloneDeep(storeCls.onAction(type, data, state)) || cloneDeep(state);
        storeCls.state = this.store[storeName];
      });

    if(debugLevel > FluxDebugLevel.LOGS) {
      const hasChanged = !isEqual(this.store, oldState);
      const updatedLabel = hasChanged ? 'Changed State' : 'Unchanged State';
      const updatedColor = hasChanged ? '#00d484' : '#959595';
      const updatedStore = cloneDeep(this.store);

      if(console.groupCollapsed) {
        console.groupCollapsed(`FLUX DISPATCH: ${type}`);
        console.log('%c Action: ', 'color: #00C4FF', action);
        console.log('%c Last State: ', 'color: #959595', oldState);
        console.log(`%c ${updatedLabel}: `, `color: ${updatedColor}`, updatedStore);
        console.groupEnd();
      } else {
        console.log(`FLUX DISPATCH: ${type}`);
        console.log(`Action: ${action}`);
        console.log('Last State: ', oldState);
        console.log(`${updatedLabel}: `, updatedStore);
      }
    }

    // Save cache in storage
    if(storage) {
      await storage.setStorageData(name, this.store);
    }

    if(!silent) {
      this.emit(type, data);
    }

    return Promise.resolve(action);
  }

  /**
   * Enables the console debugger.
   *
   * @param {number} level Enable or disable the debugger. Uses the constants:
   *   FluxDebugLevel.DISABLED (0) - Disable.
   *   FluxDebugLevel.LOGS (1) - Enable console logs.
   *   FluxDebugLevel.DISPATCH (2) - Enable console logs and dispatch action data (default).
   */
  enableDebugger(level: number = FluxDebugLevel.DISPATCH): void {
    this.options = {...this.options, debugLevel: level};
  }

  /**
   * Get a store object that is registered with Flux.
   *
   * @param {string} name The name of the store.
   * @returns {Store} the store object.
   */
  getClass(name: string = ''): Store {
    return this.storeClasses[name];
  }

  /**
   * Get the current Flux options.
   *
   * @returns {FluxOptions} the Flux options object.
   */
  getOptions(): FluxOptions {
    return this.options;
  }

  /**
   * Get the current state object.
   *
   * @param {string|array} [name] (optional) The name of the store for an object, otherwise it will return all store
   *   objects. You can also use an array to specify a property path within the object.
   * @param {any} [defaultValue] (optional) A default value to return if null.
   * @returns {any} the state object or a property value within.
   */
  getStore(name: string | string[] = '', defaultValue?): any {
    let storeValue;

    if(!name) {
      storeValue = this.store || {};
    } else {
      storeValue = get(this.store, name);
    }

    return cloneDeep(storeValue) || defaultValue;
  }

  /**
   * Adds an initialization listener.
   *
   * @param {function} [listener] The callback associated with the subscribed event.
   */
  onInit(listener: (...args: any[]) => void): void {
    this.on(ArkhamConstants.INIT, listener);
  }

  /**
   * Removes the initialization listener.
   *
   * @param {function} [listener] The callback associated with the subscribed event.
   */
  offInit(listener: (...args: any[]) => void): void {
    this.off(ArkhamConstants.INIT, listener);
  }

  /**
   * Removes an event listener.
   *
   * @param {string} [eventType] Event to unsubscribe.
   * @param {function} [listener] The callback associated with the subscribed event.
   */
  off(eventType: string, listener: (...args: any[]) => void): void {
    this.removeListener(eventType, listener);
  }

  /**
   * Registers new Stores.
   *
   * @param {array} stores Store class.
   * @returns {Promise<object[]>} the class object(s).
   */
  registerStores(stores: any[]): Promise<object[]> {
    return Promise
      .all(stores.map((store: Store) => this.register(store).then((storeObj: Store) => storeObj)))
      .then((storeClasses: Store[] = []) => {
        this.emit(ArkhamConstants.INIT);
        return storeClasses;
      });
  }

  /**
   * Sets the current state object.
   *
   * @param {string|array} [name] The name of the store to set. You can also use an array to specify a property path
   * within the object.
   * @param {any} [value] The value to set.
   */
  setStore(name: string | string[] = '', value): void {
    if(!!name) {
      this.store = set(cloneDeep(this.store), name, cloneDeep(value));
    }
  }

  private deregister(name: string = ''): void {
    delete this.storeClasses[name];
    delete this.store[name];
  }

  private register(StoreClass): Promise<Store> {
    if(!StoreClass) {
      throw Error('Class is undefined. Cannot register with Flux.');
    }

    let promise: Promise<any> = Promise.resolve();
    const clsType: string = StoreClass.constructor.toString().substr(0, 5);

    if(clsType !== 'class' && clsType !== 'funct') {
      throw Error(`${StoreClass} is not a class. Cannot register with Flux.`);
    }

    // Create store object
    const storeCls = new StoreClass();
    const {name: storeName} = storeCls;

    if(!this.storeClasses[storeName]) {
      const {name, storage} = this.options;

      // Save store object
      this.storeClasses[storeName] = storeCls;

      // Get cached data
      if(storage) {
        promise = storage.getStorageData(name)
          .then(async (cachedData: object) => {
            // Get default values
            const storeData = cachedData || this.store || {};
            const state = storeData[storeName] || storeCls.initialState() || [];
            const store = cloneDeep(this.store);
            store[storeName] = cloneDeep(state);
            this.store = store;

            // Save cache in session storage
            await storage.setStorageData(name, this.store);
            return this.storeClasses[storeName];
          });
      } else {
        // Get default values
        const state = this.store[storeName] || storeCls.initialState() || [];
        const store = cloneDeep(this.store);
        store[storeName] = cloneDeep(state);
        this.store = store;
      }
    }

    return promise.then(() => this.storeClasses[storeName]);
  }
}

export const Flux: FluxFramework = new FluxFramework();
