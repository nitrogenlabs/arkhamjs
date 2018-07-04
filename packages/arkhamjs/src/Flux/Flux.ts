import ErrorStackParser from 'error-stack-parser';
import {EventEmitter} from 'events';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import merge from 'lodash/merge';
import set from 'lodash/set';

import {ArkhamConstants} from '../constants/ArkhamConstants';
import {Store} from '../Store/Store';
import {FluxAction, FluxMiddlewareType, FluxOptions, FluxPluginType} from '../types/flux';

/**
 * Copyright (c) 2018, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
/**
 * FluxFramework
 * @type {EventEmitter}
 */
export class FluxFramework extends EventEmitter {
  isInit: boolean = false;
  // Public properties
  pluginTypes: string[] = ['preDispatch', 'postDispatch'];
  // Private properties
  private state: any = {};
  private storeClasses: any = {};
  private defaultOptions: FluxOptions = {
    name: 'arkhamjs',
    routerType: 'browser',
    scrollToTop: true,
    state: null,
    storage: null,
    storageWait: 300,
    stores: [],
    title: 'ArkhamJS'
  };
  private middleware: any = {};
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
    this.addMiddleware = this.addMiddleware.bind(this);
    this.addStores = this.addStores.bind(this);
    this.clearAppData = this.clearAppData.bind(this);
    this.clearMiddleware = this.clearMiddleware.bind(this);
    this.deregister = this.deregister.bind(this);
    this.deregisterStores = this.deregisterStores.bind(this);
    this.dispatch = this.dispatch.bind(this);
    this.getClass = this.getClass.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.getState = this.getState.bind(this);
    this.getStore = this.getStore.bind(this);
    this.init = this.init.bind(this);
    this.off = this.off.bind(this);
    this.register = this.register.bind(this);
    this.registerStores = this.registerStores.bind(this);
    this.removeMiddleware = this.removeMiddleware.bind(this);
    this.removeStores = this.removeStores.bind(this);
    this.reset = this.reset.bind(this);
    this.setState = this.setState.bind(this);
    this.setStore = this.setStore.bind(this);

    // Add middleware plugin types
    this.pluginTypes.forEach((type: string) => this.middleware[`${type}List`] = []);
  }

  /**
   * Add middleware to framework.
   *
   * @param {array} middleware An array of middleware to add to the framework.
   */
  addMiddleware(middleware: FluxMiddlewareType[]): void {
    middleware.forEach((middleObj: FluxMiddlewareType) => {
      // Make sure middleware is either a class or object.
      if(!!middleObj && ((typeof middleObj === 'function') || (typeof middleObj === 'object'))) {
        const middleName: string = middleObj.name || '';

        if(!middleName) {
          throw Error('Unknown middleware is not configured properly. Requires name property. Cannot add to Flux.');
        }

        // Sort middleware plugins for efficiency
        this.pluginTypes.forEach((type: string) => {
          const method = middleObj[type];
          const plugin: FluxPluginType = {method, name: middleName};
          this.middleware[`${type}List`] = this.addPlugin(type, plugin);
        });
      } else {
        throw Error('Unknown middleware is not configured properly. Cannot add to Flux.');
      }
    });
  }

  /**
   * Remove all app data from storage.
   *
   * @returns {Promise<boolean>} Whether app data was successfully removed.
   */
  clearAppData(): Promise<boolean> {
    // Set all store data to initial state
    Object
      .keys(this.storeClasses)
      .forEach((storeName: string) => {
        const storeCls: Store = this.storeClasses[storeName];
        this.state[storeCls.name] = cloneDeep(storeCls.initialState());
      });

    const {name, storage} = this.options;
    return storage.setStorageData(name, this.state);
  }

  /**
   * Remove all middleware.
   *
   * @returns {boolean} Whether middleware was successfully removed.
   */
  clearMiddleware(): boolean {
    // Set all store data to initial state
    Object
      .keys(this.middleware)
      .forEach((pluginType: string) => {
        this.middleware[pluginType] = [];
      });

    return true;
  }

  /**
   * De-registers named stores.
   *
   * @param {array} storeNames An array of store names to remove from the framework.
   */
  removeStores(storeNames: string[]): void {
    storeNames.forEach((name: string) => this.deregister(name));
  }

  deregisterStores(storeNames: string[]): void {
    console.warn('ArkhamJS Deprecation: Flux.deregisterStores has been deprecated in favor of Flux.removeStores.');
    this.removeStores(storeNames);
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
    if(!action) {
      throw new Error('ArkhamJS Error: Flux.dispatch requires an action.');
    }

    let clonedAction: FluxAction = cloneDeep(action || {type: ''});

    // Log duration of dispatch
    const startTime: number = +(new Date());

    // Get stack
    const stackProperty: string = 'stackTraceLimit';
    const {stackTraceLimit}: any = Error;
    Error[stackProperty] = Infinity;
    const stack = ErrorStackParser.parse(new Error());
    Error[stackProperty] = stackTraceLimit;

    // Get options
    const options = cloneDeep(this.options);

    // App info
    const appInfo = {duration: 0, options, stack};

    // Apply middleware before the action is processed
    const {postDispatchList = [], preDispatchList = []} = this.middleware;

    if(preDispatchList.length) {
      clonedAction = await Promise
        .all(
          preDispatchList.map(async (plugin: FluxPluginType) => plugin.method(
            cloneDeep(clonedAction), cloneDeep(this.state), appInfo)
          )
        )
        .then((actions) => merge(cloneDeep(clonedAction), ...cloneDeep(actions)) as FluxAction)
        .catch((error) => {
          throw error;
        });
    }

    const {type, ...data} = clonedAction;

    // Require a type
    if(!type || type === '') {
      console.warn('ArkhamJS Warning: Flux.dispatch is missing an action type for the payload:', data);
      return Promise.resolve(clonedAction)
        .catch((error) => {
          throw error;
        });
    }

    // When an action comes in, it must be completely handled by all stores
    Object
      .keys(this.storeClasses)
      .forEach((storeName: string) => {
        const storeCls: Store = this.storeClasses[storeName];
        const state = cloneDeep(this.state[storeName]) || cloneDeep(storeCls.initialState()) || {};
        this.state[storeName] = cloneDeep(storeCls.onAction(type, data, state)) || state;
      });

    // Save cache in storage
    const {storage} = this.options;

    if(storage) {
      await this.updateStorage();
    }

    const endTime: number = +(new Date());
    const duration: number = endTime - startTime;
    appInfo.duration = duration;

    if(postDispatchList.length) {
      clonedAction = await Promise
        .all(
          postDispatchList.map(
            async (plugin: FluxPluginType) => plugin.method(cloneDeep(clonedAction), cloneDeep(this.state), appInfo)
          )
        )
        .then((actions) => merge(cloneDeep(clonedAction), ...cloneDeep(actions)) as FluxAction)
        .catch((error) => {
          throw error;
        });
    }

    if(!silent) {
      this.emit(type, clonedAction);
    }

    return Promise.resolve(clonedAction);
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
  getState(path: string | string[] = '', defaultValue?): any {
    let storeValue;

    if(!path) {
      storeValue = this.state || {};
    } else {
      storeValue = get(this.state, path);
    }

    const value = cloneDeep(storeValue);
    return value === undefined ? defaultValue : value;
  }

  /* Deprecated. Please use getState instead. */
  getStore(path: string | string[] = '', defaultValue?): any {
    console.warn('ArkhamJS Deprecation: Flux.getStore has been deprecated in favor of Flux.getState.');
    return this.getState(path, defaultValue);
  }

  /**
   * Initialize and set configuration options.
   *
   * @param {object} options Configuration options.
   */
  async init(options: FluxOptions = {}, reset: boolean = false): Promise<void> {
    // Should reset previous params
    if(this.isInit && reset) {
      this.reset(false);
    }

    // Set options
    const updatedOptions = {...options};

    if(this.isInit) {
      // Remove the name from options if already initialized, otherwise the root app will not be able to access
      // the state tree
      updatedOptions.name = this.options.name;
    }

    this.options = {...this.defaultOptions, ...updatedOptions};
    const {debug, middleware, name, stores} = this.options;

    // Update default store
    await this.useStorage(name);

    if(!!stores && stores.length) {
      await this.addStores(stores);
    }

    if(!!middleware && middleware.length) {
      this.addMiddleware(middleware);
    }

    const windowProperty: string = 'arkhamjs';

    if(debug) {
      window[windowProperty] = this;
    } else {
      delete window[windowProperty];
    }

    this.isInit = true;
    this.emit(ArkhamConstants.INIT);
  }

  /**
   * Adds an initialization listener.
   *
   * @param {function} [listener] The callback associated with the subscribed event.
   */
  onInit(listener: (...args: any[]) => void): void {
    this.on(ArkhamConstants.INIT, listener);

    if(this.isInit) {
      listener();
    }
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
  off(eventType: string, listener: (...args: any[]) => void): this {
    return this.removeListener(eventType, listener);
  }

  /**
   * Adds an event listener.
   *
   * @param {string} [eventType] Event to subscribe.
   * @param {function} [listener] The callback associated with the subscribed event.
   */
  on(eventType: string, listener: (...args: any[]) => void): this {
    return this.addListener(eventType, listener);
  }

  /**
   * Registers new Stores.
   *
   * @param {array} stores Store class.
   * @returns {Promise<object[]>} the class object(s).
   */
  async addStores(stores: any[]): Promise<object[]> {
    const storeClasses: Store[] = stores.map((store: Store) => this.register(store));
    // Save cache in session storage
    const {name, storage} = this.options;

    if(storage) {
      await storage.setStorageData(name, this.state);
    }

    // Return classes
    return storeClasses;
  }

  async registerStores(stores: any[]): Promise<object[]> {
    console.warn('ArkhamJS Deprecation: Flux.registerStores has been deprecated in favor of Flux.addStores.');
    return this.addStores(stores);
  }

  /**
   * Remove middleware from framework.
   *
   * @param {array} string middleware names to remove.
   * @returns {Promise<object[]>} the class object(s).
   */
  removeMiddleware(names: string[]): void {
    names.forEach((name: string) => {
      // Remove middleware plugins
      this.pluginTypes.forEach((type: string) => {
        this.middleware[`${type}List`] = this.removePlugin(type, name);
      });
    });
  }

  /**
   * Reset framework.
   *
   * @param {array} string middleware names to remove.
   * @returns {Promise<object[]>} the class object(s).
   */
  async reset(clearStorage: boolean = true): Promise<void> {
    const {name, storage} = this.options;

    // Clear persistent cache
    if(storage && clearStorage) {
      await storage.setStorageData(name, {});
    }

    // Clear all properties
    this.state = {};
    this.storeClasses = [];
    this.options = {...this.defaultOptions};
    this.isInit = false;
  }

  /**
   * Sets the current state object.
   *
   * @param {string|array} [name] The name of the store to set. You can also use an array to specify a property path
   * within the object.
   * @param {any} [value] The value to set.
   */
  setState(path: string | string[] = '', value): Promise<boolean> {
    if(!!path) {
      this.state = set(this.state, path, cloneDeep(value));
    }

    // Update persistent cache
    const {storage} = this.options;

    if(storage) {
      return this.updateStorage();
    }

    return Promise.resolve(false);
  }

  setStore(path: string | string[] = '', value): Promise<boolean> {
    return this.setState(path, value);
  }

  private addPlugin(type: string, plugin: FluxPluginType): FluxPluginType[] {
    const list = this.middleware[`${type}List`] || [];
    const {method, name} = plugin;

    if(method && typeof method === 'function') {
      // Check if plugin already exists
      const exists: boolean = !!list.filter((obj: FluxPluginType) => obj.name === name).length;

      // Do not add duplicate plugins
      if(!exists) {
        list.push({method, name});
      }

      return list;
    } else if(method !== undefined) {
      throw Error(`${plugin.name} middleware is not configured properly. Method is not a function.`);
    }

    return list;
  }

  private deregister(name: string = ''): void {
    delete this.storeClasses[name];
    delete this.state[name];
  }

  private register(StoreClass): Store {
    if(!StoreClass) {
      throw Error('Store is undefined. Cannot register with Flux.');
    }

    const clsType: string = StoreClass.constructor.toString().substr(0, 5);
    const isFnc: boolean = clsType === 'funct' || clsType === 'class';
    const isClass: boolean = !!StoreClass.prototype.onAction;

    if(!isClass && !isFnc) {
      throw Error(`${StoreClass} is not a class or store function. Cannot register with Flux.`);
    }

    // Create store object
    let storeCls;

    if(isClass) {
      // Create new custom class
      storeCls = new StoreClass();
    } else {
      // Create store based on simple function
      storeCls = new Store();
      storeCls.name = StoreClass.name;
      storeCls.onAction = StoreClass;
    }

    const {name: storeName} = storeCls;

    if(storeName && !this.storeClasses[storeName]) {
      // Save store object
      this.storeClasses[storeName] = storeCls;

      // Get default values
      this.state[storeName] = this.state[storeName] || cloneDeep(storeCls.initialState()) || {};
    }

    // Return store class
    return this.storeClasses[storeName];
  }

  private removePlugin(type: string, name: string): FluxPluginType[] {
    const list = this.middleware[`${type}List`] || [];

    // remove all occurrences of the plugin
    return list.filter((obj: FluxPluginType) => obj.name !== name);
  }

  private updateStorage = () => Promise.resolve(false);

  private async useStorage(name: string): Promise<void> {
    const {storage, state, storageWait} = this.options;

    // Cache
    if(storage) {
      this.state = state || await storage.getStorageData(name) || {};
      this.updateStorage = debounce(() => {
        if(storage) {
          return storage.setStorageData(name, this.state);
        }

        return Promise.resolve(false);
      }, storageWait, {leading: true, trailing: true});
    } else {
      this.state = state || {};
    }

    return null;
  }
}

export const Flux: FluxFramework = new FluxFramework();
