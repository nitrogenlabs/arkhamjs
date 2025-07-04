/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {isEmpty} from '@nlabs/utils/checks/isEmpty';
import {cloneDeep} from '@nlabs/utils/objects/clone';
import {debounceCompact} from '@nlabs/utils/objects/debounce-compact';
import {get} from '@nlabs/utils/objects/get';
import {merge} from '@nlabs/utils/objects/merge';
import {set} from '@nlabs/utils/objects/set';
import {parseStack} from '@nlabs/utils/objects/stack-parser';
import {EventEmitter} from 'events';

import {ArkhamConstants} from '../constants/ArkhamConstants';
import {FluxAction, FluxMiddlewareType, FluxOptions, FluxPluginType, FluxStore} from './Flux.types';

const STACK_CACHE = new Map<string, any[]>();
const STACK_CACHE_SIZE = 100;

export class FluxFramework extends EventEmitter {
  static initFlux: boolean = false;
  isInit: boolean = false;

  readonly pluginTypes: readonly string[] = ['preDispatch', 'postDispatch'] as const;

  private state: Record<string, any> = {};
  private storeActions: Record<string, FluxStore> = {};
  private readonly defaultOptions: FluxOptions = {
    name: 'arkhamjs',
    routerType: 'browser',
    scrollToTop: true,
    state: null,
    storage: null,
    storageWait: 300,
    stores: [],
    title: 'ArkhamJS'
  };
  private middleware: Record<string, FluxPluginType[]> = {};
  private options: FluxOptions = this.defaultOptions;

  private stateCache: Map<string, any> = new Map();

  private updateStorage: () => Promise<boolean> = () => Promise.resolve(false);

  private stateChanged: boolean = false;

  constructor() {
    super();

    // Bind methods once in constructor for better performance
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

    // Initialize middleware lists
    this.pluginTypes.forEach((type: string) => this.middleware[`${type}List`] = []);
  }

  /**
   * Add middleware to framework with duplicate prevention
   */
  addMiddleware(middleware: FluxMiddlewareType[]): void {
    middleware.forEach((middleObj: FluxMiddlewareType) => {
      if (!middleObj || (typeof middleObj !== 'function' && typeof middleObj !== 'object')) {
        throw Error('Unknown middleware is not configured properly. Cannot add to Flux.');
      }

      const middleName: string = middleObj.name || '';
      if (!middleName) {
        throw Error('Unknown middleware is not configured properly. Requires name property. Cannot add to Flux.');
      }

      // Check for existing middleware to prevent duplicates
      const existingMiddleware = this.middleware.preDispatchList?.find(m => m.name === middleName) ||
                                this.middleware.postDispatchList?.find(m => m.name === middleName);

      if (existingMiddleware) {
        console.warn(`Middleware "${middleName}" already exists. Skipping duplicate.`);
        return;
      }

      this.pluginTypes.forEach((type: string) => {
        const method = middleObj[type];
        if (method) {
          const plugin: FluxPluginType = {method, name: middleName};
          this.middleware[`${type}List`] = this.addPlugin(type, plugin);
        }
      });
    });
  }

  /**
   * Remove all app data from storage with optimized state reset
   */
  clearAppData(): Promise<boolean> {
    // Reset state to initial values without cloning
    Object.keys(this.storeActions).forEach((storeName: string) => {
      const storeFn = this.storeActions[storeName];
      this.state[storeFn.name] = storeFn.initialState;
    });

    // Clear state cache
    this.stateCache.clear();
    this.stateChanged = true;

    const {name, storage} = this.options;
    if (storage?.setStorageData) {
      return storage.setStorageData(name, this.state);
    }

    return Promise.resolve(true);
  }

  /**
   * Remove all middleware with proper cleanup
   */
  clearMiddleware(): boolean {
    Object.keys(this.middleware).forEach((pluginType: string) => {
      this.middleware[pluginType] = [];
    });
    return true;
  }

  /**
   * De-registers named stores with cleanup
   */
  removeStores(storeNames: string[]): void {
    storeNames.forEach((name: string) => this.deregister(name));
  }

  /**
   * Optimized dispatch method with reduced cloning and better performance
   */
  async dispatch(action: FluxAction, silent: boolean = false): Promise<FluxAction> {
    if (!action) {
      throw new Error('ArkhamJS Error: Flux.dispatch requires an action.');
    }

    const startTime: number = Date.now();

    // Performance optimization: Only clone action once
    let clonedAction: FluxAction = cloneDeep(action);

    // Performance optimization: Only get stack trace in debug mode
    let stack: any[] = [];
    if (this.options.debug) {
      stack = this.getCachedStack();
    }

    const appInfo = {
      duration: 0,
      options: this.options,
      stack
    };

    // Apply pre-dispatch middleware with optimized cloning
    const {postDispatchList = [], preDispatchList = []} = this.middleware;

    if (preDispatchList.length) {
      clonedAction = await this.processMiddleware(preDispatchList, clonedAction, appInfo);
    }

    const {type, ...data} = clonedAction;

    if (!type || type === '') {
      console.warn('ArkhamJS Warning: Flux.dispatch is missing an action type for the payload:', data);
      return Promise.resolve(clonedAction);
    }

    // Optimized state updates - only clone when necessary
    this.updateStoresState(type, data);

    // Save cache in storage only if state changed
    if (this.stateChanged && this.options.storage && this.updateStorage) {
      try {
        await this.updateStorage();
        this.stateChanged = false;
      } catch (error) {
        console.error('Storage update failed:', error);
      }
    }

    const duration: number = Date.now() - startTime;
    appInfo.duration = duration;

    // Apply post-dispatch middleware
    if (postDispatchList.length) {
      clonedAction = await this.processMiddleware(postDispatchList, clonedAction, appInfo);
    }

    if (!silent) {
      this.emit(type, clonedAction);
      this.emit('arkhamjs', this.state);
    }

    return Promise.resolve(clonedAction);
  }

  /**
   * Get the current Flux options
   */
  getOptions(): FluxOptions {
    return this.options;
  }

  /**
   * Optimized getState with caching
   */
  getState(path: string | string[] = '', defaultValue?: any): any {
    const pathKey = Array.isArray(path) ? path.join('.') : path;

    // Check cache first
    if (this.stateCache.has(pathKey)) {
      return this.stateCache.get(pathKey);
    }

    let storeValue: any;
    if (!path) {
      storeValue = this.state || {};
    } else {
      storeValue = get(this.state, path);
    }

    const value = storeValue ? cloneDeep(storeValue) : storeValue;
    const result = value === undefined ? defaultValue : value;

    // Cache the result
    this.stateCache.set(pathKey, result);

    return result;
  }

  /**
   * Get a store object registered with Flux
   */
  getStore(name: string = ''): FluxStore | undefined {
    return this.storeActions[name];
  }

  /**
   * Initialize and set configuration options with validation
   */
  async init(options: FluxOptions = {}, reset: boolean = false): Promise<FluxFramework> {
    if (reset) {
      this.isInit = false;
      await this.reset(false);
    }

    const updatedOptions = {...options};
    if (this.isInit) {
      updatedOptions.name = this.options.name;
    }

    this.options = {...this.defaultOptions, ...updatedOptions};
    const {debug, middleware, name, stores} = this.options;

    try {
      await this.useStorage(name);
    } catch (error) {
      console.error('Arkham Error: There was an error while using storage.', name);
      throw error;
    }

    if (stores?.length) {
      try {
        await this.addStores(stores);
      } catch (error) {
        console.error('Arkham Error: There was an error while adding stores.', stores);
        throw error;
      }
    }

    if (middleware?.length) {
      this.addMiddleware(middleware);
    }

    const windowProperty: string = 'arkhamjs';
    if (debug) {
      (window as any)[windowProperty] = this;
    } else {
      delete (window as any)[windowProperty];
    }

    this.isInit = true;
    this.emit(ArkhamConstants.INIT);

    return this;
  }

  /**
   * Adds an initialization listener with immediate execution if already initialized
   */
  onInit(listener: (...args: any[]) => void): void {
    this.on(ArkhamConstants.INIT, listener);

    if (this.isInit) {
      listener();
    }
  }

  /**
   * Removes the initialization listener
   */
  offInit(listener: (...args: any[]) => void): void {
    this.off(ArkhamConstants.INIT, listener);
  }

  /**
   * Removes an event listener
   */
  off(eventType: string, listener: (...args: any[]) => void): this {
    return this.removeListener(eventType, listener);
  }

  /**
   * Adds an event listener
   */
  on(eventType: string, listener: (...args: any[]) => void): this {
    return this.addListener(eventType, listener);
  }

  /**
   * Registers new Stores with validation
   */
  async addStores(stores: FluxStore[]): Promise<FluxStore[]> {
    const registeredStores: FluxStore[] = stores.map((store: FluxStore) => this.register(store));

    const {name, storage} = this.options;
    if (storage?.setStorageData) {
      try {
        await storage.setStorageData(name, this.state);
      } catch (error) {
        throw error;
      }
    }

    return registeredStores;
  }

  /**
   * Remove middleware from framework
   */
  removeMiddleware(names: string[]): void {
    names.forEach((name: string) => {
      this.pluginTypes.forEach((type: string) => {
        this.middleware[`${type}List`] = this.removePlugin(type, name);
      });
    });
  }

  /**
   * Reset framework with proper cleanup
   */
  async reset(clearStorage: boolean = true): Promise<void> {
    const {name, storage} = this.options;

    if (storage && clearStorage) {
      try {
        await storage.setStorageData(name, {});
      } catch (error) {
        throw error;
      }
    }

    // Clear all properties and caches
    this.middleware = {};
    this.options = {...this.defaultOptions};
    this.state = {};
    this.storeActions = {};
    this.stateCache.clear();
    this.stateChanged = false;
    this.isInit = false;

    // Reinitialize middleware lists
    this.pluginTypes.forEach((type: string) => this.middleware[`${type}List`] = []);
  }

  /**
   * Optimized setState with change tracking
   */
  setState(path: string | string[] = '', value: any): Promise<boolean> {
    if (path) {
      this.state = set(path, cloneDeep(value), this.state);
      this.stateChanged = true;

      // Clear relevant cache entries
      const pathKey = Array.isArray(path) ? path.join('.') : path;
      this.stateCache.delete(pathKey);
    }

    if (this.options.storage && this.updateStorage) {
      return this.updateStorage();
    }

    return Promise.resolve(false);
  }

  // Private helper methods

  /**
   * Process middleware with optimized cloning
   */
  private async processMiddleware(
    middlewareList: FluxPluginType[],
    action: FluxAction,
    appInfo: any
  ): Promise<FluxAction> {
    return Promise
      .all(
        middlewareList.map((plugin: FluxPluginType) =>
          plugin.method(cloneDeep(action), cloneDeep(this.state), appInfo)
        )
      )
      .then(
        (actions) => actions.reduce((updatedAction, action) =>
          merge(updatedAction, action), action) as FluxAction
      )
      .catch((error) => {
        throw error;
      });
  }

  /**
   * Update stores state with optimized cloning
   */
  private updateStoresState(type: string, data: any): void {
    Object.keys(this.storeActions).forEach((storeName: string) => {
      const storeFn = this.storeActions[storeName];
      const currentState = this.state[storeName] || storeFn.initialState || {};

      // Only clone if the state actually changes
      const newState = storeFn.action(type, data, currentState);
      if (newState !== currentState) {
        this.state[storeName] = cloneDeep(newState) || currentState;
        this.stateChanged = true;
      }
    });
  }

  /**
   * Get cached stack trace for performance
   */
  private getCachedStack(): any[] {
    const cacheKey = new Error().stack?.split('\n')[2] || '';

    if (STACK_CACHE.has(cacheKey)) {
      return STACK_CACHE.get(cacheKey)!;
    }

    let stack: any[] = [];
    try {
      const stackProperty: string = 'stackTraceLimit';
      const {stackTraceLimit}: any = Error;
      Error[stackProperty] = Infinity;
      stack = parseStack(new Error());
      Error[stackProperty] = stackTraceLimit;

      // Cache the result
      if (STACK_CACHE.size >= STACK_CACHE_SIZE) {
        const firstKey = STACK_CACHE.keys().next().value;
        STACK_CACHE.delete(firstKey);
      }
      STACK_CACHE.set(cacheKey, stack);
    } catch (error) {
      // Fallback to empty stack
    }

    return stack;
  }

  private addPlugin(type: string, plugin: FluxPluginType): FluxPluginType[] {
    const list = this.middleware[`${type}List`] || [];
    const {method, name} = plugin;

    if (method && typeof method === 'function') {
      const exists: boolean = list.some((obj: FluxPluginType) => obj.name === name);
      if (!exists) {
        list.push({method, name});
      }
    } else if (method !== undefined) {
      throw Error(`${plugin.name} middleware is not configured properly. Method is not a function.`);
    }

    return list;
  }

  private deregister(name: string = ''): void {
    delete this.storeActions[name];
    delete this.state[name];
    this.stateCache.clear(); // Clear cache when stores change
  }

  private register(storeFn: any): FluxStore {
    if (!storeFn) {
      throw Error('Store is undefined. Cannot register with Flux.');
    }

    if (typeof storeFn !== 'function') {
      throw Error(`${storeFn} is not a store function. Cannot register with Flux.`);
    }

    const {name} = storeFn;
    const initialState: any = storeFn();
    const storeAction: FluxStore = {
      action: storeFn,
      initialState,
      name
    };

    if (!isEmpty(name) && !this.storeActions[name]) {
      this.storeActions[name] = storeAction;

      if (!this.state[name]) {
        this.state[name] = initialState ? cloneDeep(initialState) : {};
      }
    }

    return this.storeActions[name];
  }

  private removePlugin(type: string, name: string): FluxPluginType[] {
    const list = this.middleware[`${type}List`] || [];
    return list.filter((obj: FluxPluginType) => obj.name !== name);
  }

  private async useStorage(name: string): Promise<void> {
    const {storage, state, storageWait} = this.options;

    if (storage) {
      try {
        this.state = state || await storage.getStorageData(name) || {};
        this.updateStorage = debounceCompact(
          () => storage.setStorageData(name, this.state),
          storageWait
        );
      } catch (error) {
        console.error(`ArkhamJS Error: Using storage, "${name}".`);
        throw error;
      }
    } else {
      this.state = state || {};
    }
  }
}

export const Flux: FluxFramework = new FluxFramework();
