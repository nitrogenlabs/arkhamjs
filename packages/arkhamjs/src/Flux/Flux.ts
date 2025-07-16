/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {cloneDeep, debounceCompact, get, isEmpty, merge, parseStack, set} from '@nlabs/utils';
import {EventEmitter} from 'events';

import {ArkhamConstants} from '../constants/ArkhamConstants';

import type {FluxAction, FluxMiddlewareType, FluxOptions, FluxPluginType, FluxStore} from './Flux.types';

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
    storageWait: 300,
    stores: [],
    title: 'ArkhamJS'
  };
  private middleware: Record<string, FluxPluginType[]> = {};
  private options: FluxOptions = this.defaultOptions;
  private stateCache: Map<string, any> = new Map();
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

    this.pluginTypes.forEach((type: string) => this.middleware[`${type}List`] = []);
  }

  addMiddleware(middleware: FluxMiddlewareType[]): void {
    middleware.forEach((middleObj: FluxMiddlewareType) => {
      if(!middleObj || (typeof middleObj !== 'function' && typeof middleObj !== 'object')) {
        throw Error('Unknown middleware is not configured properly. Cannot add to Flux.');
      }

      const middleName: string = middleObj.name || '';
      if(!middleName) {
        throw Error('Unknown middleware is not configured properly. Requires name property. Cannot add to Flux.');
      }

      const existingMiddleware = this.middleware.preDispatchList?.find((m) => m.name === middleName) ||
                                this.middleware.postDispatchList?.find((m) => m.name === middleName);

      if(existingMiddleware) {
        // eslint-disable-next-line no-console
        console.warn(`Middleware "${middleName}" already exists. Skipping duplicate.`);
        return;
      }

      this.pluginTypes.forEach((type: string) => {
        const method = middleObj[type as keyof FluxMiddlewareType];
        if(method && typeof method === 'function') {
          const plugin: FluxPluginType = {method, name: middleName};
          this.middleware[`${type}List`] = this.addPlugin(type, plugin);
        }
      });
    });
  }

  clearAppData(): Promise<boolean> {
    Object.keys(this.storeActions).forEach((storeName: string) => {
      const storeFn = this.storeActions[storeName];
      if(storeFn) {
        this.state[storeFn.name] = storeFn.initialState;
      }
    });

    this.stateCache.clear();
    this.stateChanged = true;

    const {name, storage} = this.options;
    if(storage?.setStorageData) {
      return storage.setStorageData(name ?? 'arkhamjs', this.state);
    }

    return Promise.resolve(true);
  }

  clearMiddleware(): boolean {
    Object.keys(this.middleware).forEach((pluginType: string) => {
      this.middleware[pluginType] = [];
    });
    return true;
  }

  removeStores(storeNames: string[]): void {
    storeNames.forEach((name: string) => this.deregister(name));
  }

  async dispatch(action: FluxAction, silent: boolean = false): Promise<FluxAction> {
    if(!action) {
      throw new Error('ArkhamJS Error: Flux.dispatch requires an action.');
    }

    const startTime: number = Date.now();

    let clonedAction: FluxAction = cloneDeep(action);

    let stack: any[] = [];
    if(this.options.debug) {
      stack = this.getCachedStack();
    }

    const appInfo = {
      duration: 0,
      options: this.options,
      stack
    };

    const {postDispatchList = [], preDispatchList = []} = this.middleware;

    if(preDispatchList.length) {
      clonedAction = await this.processMiddleware(preDispatchList, clonedAction, appInfo);
    }

    const {type, ...data} = clonedAction;

    if(!type || type === '') {
      // eslint-disable-next-line no-console
      console.warn('ArkhamJS Warning: Flux.dispatch is missing an action type for the payload:', data);
      return Promise.resolve(clonedAction);
    }

    this.updateStoresState(type, data);

    if(this.stateChanged && this.options.storage && this.updateStorage) {
      try {
        await this.updateStorage();
        this.stateChanged = false;
      } catch(error) {
        // eslint-disable-next-line no-console
        console.error('Storage update failed:', error);
      }
    }

    const duration: number = Date.now() - startTime;
    appInfo.duration = duration;

    if(postDispatchList.length) {
      clonedAction = await this.processMiddleware(postDispatchList, clonedAction, appInfo);
    }

    if(!silent) {
      this.emit(type, clonedAction);
      this.emit('arkhamjs', this.state);
    }

    return Promise.resolve(clonedAction);
  }

  getOptions(): FluxOptions {
    return this.options;
  }

  getState<T = unknown>(path: string | string[] = '', defaultValue?: T): T {
    const pathKey = Array.isArray(path) ? path.join('.') : path;

    if(this.stateCache.has(pathKey)) {
      return this.stateCache.get(pathKey) as T;
    }

    let storeValue: unknown;
    if(!path) {
      storeValue = this.state || {};
    } else {
      storeValue = get(this.state, path);
    }

    const value = storeValue ? cloneDeep(storeValue) : storeValue;
    const result = value === undefined ? defaultValue : value;

    this.stateCache.set(pathKey, result);

    return result as T;
  }

  getStore(name: string = ''): FluxStore | undefined {
    return this.storeActions[name];
  }

  async init(options: FluxOptions = {}, reset: boolean = false): Promise<FluxFramework> {
    if(reset) {
      this.isInit = false;
      await this.reset(false);
    }

    const updatedOptions = {...options};
    if(this.isInit && this.options.name) {
      updatedOptions.name = this.options.name;
    }

    this.options = {...this.defaultOptions, ...updatedOptions};
    const {debug, middleware, name, stores} = this.options;

    try {
      await this.useStorage(name ?? 'arkhamjs');
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error('Arkham Error: There was an error while using storage.', name);
      throw error;
    }

    if(stores?.length) {
      try {
        await this.addStores(stores);
      } catch(error) {
        // eslint-disable-next-line no-console
        console.error('Arkham Error: There was an error while adding stores.', stores);
        throw error;
      }
    }

    if(middleware?.length) {
      this.addMiddleware(middleware);
    }

    const windowProperty: string = 'arkhamjs';
    if(debug) {
      (window as any)[windowProperty] = this;
    } else {
      delete (window as any)[windowProperty];
    }

    this.isInit = true;
    this.emit(ArkhamConstants.INIT);

    return this;
  }

  onInit(listener: (...args: any[]) => void): void {
    this.on(ArkhamConstants.INIT, listener);

    if(this.isInit) {
      listener();
    }
  }

  offInit(listener: (...args: any[]) => void): void {
    this.off(ArkhamConstants.INIT, listener);
  }

  override off(eventType: string, listener: (...args: any[]) => void): this {
    return this.removeListener(eventType, listener);
  }

  override on(eventType: string, listener: (...args: any[]) => void): this {
    return this.addListener(eventType, listener);
  }

  async addStores(stores: FluxStore[]): Promise<FluxStore[]> {
    const registeredStores: FluxStore[] = stores.map((store: FluxStore) => this.register(store));

    const {name, storage} = this.options;
    if(storage?.setStorageData) {
      try {
        await storage.setStorageData(name ?? 'arkhamjs', this.state);
      } catch(error) {
        throw error;
      }
    }

    return registeredStores;
  }

  removeMiddleware(names: string[]): void {
    names.forEach((name: string) => {
      this.pluginTypes.forEach((type: string) => {
        this.middleware[`${type}List`] = this.removePlugin(type, name);
      });
    });
  }

  async reset(clearStorage: boolean = true): Promise<void> {
    const {name, storage} = this.options;

    if(storage && clearStorage) {
      try {
        await storage.setStorageData?.(name ?? 'arkhamjs', {});
      } catch(error) {
        throw error;
      }
    }

    this.middleware = {};
    this.options = {...this.defaultOptions};
    this.state = {};
    this.storeActions = {};
    this.stateCache.clear();
    this.stateChanged = false;
    this.isInit = false;

    this.pluginTypes.forEach((type: string) => this.middleware[`${type}List`] = []);
  }

  setState(path: string | string[] = '', value: unknown): Promise<boolean> {
    if(path) {
      this.state = set(this.state, path, cloneDeep(value));
      this.stateChanged = true;

      const pathKey = Array.isArray(path) ? path.join('.') : path;
      this.stateCache.delete(pathKey);
    }

    if(this.options.storage && this.updateStorage) {
      return this.updateStorage();
    }

    return Promise.resolve(false);
  }

  private async processMiddleware(
    middlewareList: FluxPluginType[],
    action: FluxAction,
    appInfo: Record<string, unknown>
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

  private updateStorage: () => Promise<boolean> = () => Promise.resolve(false);

  private updateStoresState(type: string, data: Record<string, unknown>): void {
    Object.keys(this.storeActions).forEach((storeName: string) => {
      const storeFn = this.storeActions[storeName];
      if(storeFn) {
        const currentState = this.state[storeName] || storeFn.initialState || {};

        const newState = storeFn.action(type, data, currentState);
        if(newState !== currentState) {
          this.state[storeName] = cloneDeep(newState) || currentState;
          this.stateChanged = true;
        }
      }
    });
  }

  private getCachedStack(): unknown[] {
    const cacheKey = new Error().stack?.split('\n')[2] || '';

    if(STACK_CACHE.has(cacheKey)) {
      return STACK_CACHE.get(cacheKey)!;
    }

    let stack: unknown[] = [];
    try {
      const stackProperty = 'stackTraceLimit';
      const originalLimit = (Error as any).stackTraceLimit;
      (Error as any)[stackProperty] = Infinity;
      stack = parseStack(new Error());
      (Error as any)[stackProperty] = originalLimit;

      if(STACK_CACHE.size >= STACK_CACHE_SIZE) {
        const firstKey = STACK_CACHE.keys().next().value;
        if(firstKey) {
          STACK_CACHE.delete(firstKey);
        }
      }
      STACK_CACHE.set(cacheKey, stack);
    } catch(error) {
    }

    return stack;
  }

  private addPlugin(type: string, plugin: FluxPluginType): FluxPluginType[] {
    const list = this.middleware[`${type}List`] || [];
    const {method, name} = plugin;

    if(method && typeof method === 'function') {
      const exists: boolean = list.some((obj: FluxPluginType) => obj.name === name);
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
    this.stateCache.clear(); // Clear cache when stores change
  }

  private register(storeFn: unknown): FluxStore {
    if(!storeFn) {
      throw Error('Store is undefined. Cannot register with Flux.');
    }

    if(typeof storeFn !== 'function') {
      throw Error(`${storeFn} is not a store function. Cannot register with Flux.`);
    }

    const {name} = storeFn;
    const initialState: unknown = (storeFn as () => unknown)();
    const storeAction: FluxStore = {
      action: storeFn as (type: string, data: unknown, state: unknown) => unknown,
      initialState,
      name
    };

    if(!isEmpty(name) && !this.storeActions[name]) {
      this.storeActions[name] = storeAction;

      if(!this.state[name]) {
        this.state[name] = initialState ? cloneDeep(initialState) : {};
      }
    }

    return this.storeActions[name]!;
  }

  private removePlugin(type: string, name: string): FluxPluginType[] {
    const list = this.middleware[`${type}List`] || [];
    return list.filter((obj: FluxPluginType) => obj.name !== name);
  }

  private async useStorage(name: string): Promise<void> {
    const {storage, state, storageWait} = this.options;

    if(storage) {
      try {
        this.state = state || await storage?.getStorageData?.(name) || {};
        this.updateStorage = debounceCompact(
          () => storage?.setStorageData?.(name, this.state),
          storageWait ?? 300
        ) as any;
      } catch(error) {
        // eslint-disable-next-line no-console
        console.error(`ArkhamJS Error: Using storage, "${name}".`);
        throw error;
      }
    } else {
      this.state = state || {};
    }
  }
}

export const Flux: FluxFramework = new FluxFramework();
