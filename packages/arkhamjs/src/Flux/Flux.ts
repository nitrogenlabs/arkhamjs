/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import ErrorStackParser from 'error-stack-parser';
import {EventEmitter} from 'events';
import debounce from 'lodash/debounce';
import cloneDeep from 'lodash/fp/cloneDeep';
import get from 'lodash/fp/get';
import isEmpty from 'lodash/fp/isEmpty';
import merge from 'lodash/fp/merge';
import set from 'lodash/fp/set';

import {FluxAction, FluxMiddlewareType, FluxOptions, FluxPluginType, FluxStore} from './Flux.types';
import {ArkhamConstants} from '../constants/ArkhamConstants';

/**
 * FluxFramework
 * @type {EventEmitter}
 */
export class FluxFramework extends EventEmitter {
  static initFlux: boolean = false;
  isInit: boolean = false;
  // Public properties
  pluginTypes: string[] = ['preDispatch', 'postDispatch'];
  // Private properties
  private state: any = {};
  private storeActions: any = {};
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
    this.dispatch = this.dispatch.bind(this);
    this.getOptions = this.getOptions.bind(this);
    this.getState = this.getState.bind(this);
    this.getStore = this.getStore.bind(this);
    this.init = this.init.bind(this);
    this.off = this.off.bind(this);
    this.register = this.register.bind(this);
    this.removeMiddleware = this.removeMiddleware.bind(this);
    this.removeStores = this.removeStores.bind(this);
    this.reset = this.reset.bind(this);
    this.setState = this.setState.bind(this);

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
      .keys(this.storeActions)
      .forEach((storeName: string) => {
        const storeFn = this.storeActions[storeName];
        this.state[storeFn.name] = cloneDeep(storeFn.initialState);
      });

    const {name, storage} = this.options;

    if(storage?.setStorageData) {
      return storage.setStorageData(name, this.state);
    }

    return Promise.resolve(true);
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

    let clonedAction: FluxAction = cloneDeep(action);

    // Log duration of dispatch
    const startTime: number = Date.now();

    // Get stack
    let stack = [];

    try {
      const stackProperty: string = 'stackTraceLimit';
      const {stackTraceLimit}: any = Error;
      Error[stackProperty] = Infinity;
      stack = ErrorStackParser.parse(new Error());
      Error[stackProperty] = stackTraceLimit;
    } catch(error) {}

    // Get options
    const options = cloneDeep(this.options);

    // App info
    const appInfo = {duration: 0, options, stack};

    // Apply middleware before the action is processed
    const {postDispatchList = [], preDispatchList = []} = this.middleware;

    if(preDispatchList.length) {
      clonedAction = await Promise
        .all(
          preDispatchList.map((plugin: FluxPluginType) => plugin.method(
            cloneDeep(clonedAction), cloneDeep(this.state), appInfo)
          )
        )
        .then(
          (actions) => actions.reduce((updatedAction, action) =>
            merge(updatedAction, action), clonedAction) as FluxAction
        )
        .catch((error) => {
          throw error;
        });
    }

    const {type, ...data} = clonedAction;

    // Require a type
    if(!type || type === '') {
      console.warn('ArkhamJS Warning: Flux.dispatch is missing an action type for the payload:', data);
      return Promise.resolve(clonedAction);
    }

    // When an action comes in, it must be completely handled by all stores
    Object
      .keys(this.storeActions)
      .forEach((storeName: string) => {
        const storeFn = this.storeActions[storeName];
        const state = cloneDeep(this.state[storeName]) || cloneDeep(storeFn.initialState) || {};
        this.state[storeName] = cloneDeep(storeFn.action(type, data, state)) || state;
      });

    // Save cache in storage
    const {storage} = this.options;

    if(storage && this.updateStorage) {
      try {
        await this.updateStorage();
      } catch(error) {}
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
        .then(
          (actions) => actions.reduce((updatedAction, action) =>
            merge(updatedAction, action), clonedAction) as FluxAction
        )
        .catch((error) => {
          throw error;
        });
    }

    if(!silent) {
      this.emit(type, clonedAction);
      this.emit('arkhamjs', this.state);
    }

    return Promise.resolve(clonedAction);
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
      storeValue = get(path, this.state);
    }

    const value = storeValue ? cloneDeep(storeValue) : storeValue;
    return value === undefined ? defaultValue : value;
  }

  /**
   * Get a store object registered with Flux.
   *
   * @param {string} name The name of the store.
   * @returns {FluxStore} the store object.
   */
  getStore(name: string = ''): FluxStore {
    return this.storeActions[name];
  }

  /**
   * Initialize and set configuration options.
   *
   * @param {object} options Configuration options.
   */
  async init(options: FluxOptions = {}, reset: boolean = false): Promise<FluxFramework> {
    // Should reset previous params
    if(reset) {
      this.isInit = false;
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
    try {
      await this.useStorage(name);
    } catch(error) {
      console.error('Arkham Error: There was an error while using storage.', name);
      throw error;
    }

    if(!!stores && stores.length) {
      try {
        await this.addStores(stores);
      } catch(error) {
        console.error('Arkham Error: There was an error while adding stores.', stores);
        throw error;
      }
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

    return this;
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
    const registeredStores: FluxStore[] = stores.map((store: FluxStore) => this.register(store));

    // Save cache in session storage
    const {name, storage} = this.options;

    if(storage?.setStorageData) {
      try {
        await storage.setStorageData(name, this.state);
      } catch(error) {
        throw error;
      }
    }

    // Return classes
    return registeredStores;
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
      try {
        await storage.setStorageData(name, {});
      } catch(error) {
        throw error;
      }
    }

    // Clear all properties
    this.middleware = {};
    this.options = {...this.defaultOptions};
    this.state = {};
    this.storeActions = {};
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
      this.state = set(path, cloneDeep(value), this.state);
    }

    // Update persistent cache
    const {storage} = this.options;

    if(storage && this.updateStorage) {
      return this.updateStorage();
    }

    return Promise.resolve(false);
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
    } else if(method !== undefined) {
      throw Error(`${plugin.name} middleware is not configured properly. Method is not a function.`);
    }

    return list;
  }

  private deregister(name: string = ''): void {
    delete this.storeActions[name];
    delete this.state[name];
  }

  private register(storeFn): FluxStore {
    if(!storeFn) {
      throw Error('Store is undefined. Cannot register with Flux.');
    }

    const isFnc: boolean = typeof storeFn === 'function';

    if(!isFnc) {
      throw Error(`${storeFn} is not a store function. Cannot register with Flux.`);
    }

    // Create store object
    const {name} = storeFn;
    const initialState: any = storeFn();
    const storeAction = {
      action: storeFn,
      initialState: storeFn(),
      name
    };

    if(!isEmpty(name) && !this.storeActions[name]) {
      // Save store object
      this.storeActions[name] = storeAction;

      // Get default values
      if(!this.state[name]) {
        if(initialState) {
          this.state[name] = cloneDeep(initialState);
        } else {
          this.state[name] = {};
        }
      }
    }

    // Return store class
    return this.storeActions[name];
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
      try {
        this.state = state || await storage.getStorageData(name) || {};
        this.updateStorage = debounce(
          () => storage.setStorageData(name, this.state),
          storageWait,
          {leading: true, trailing: true}
        );
      } catch(error) {
        console.error(`ArkhamJS Error: Using storage, "${name}".`);
        throw error;
      }
    } else {
      this.state = state || {};
    }

    return null;
  }
}

export const Flux: FluxFramework = new FluxFramework();
