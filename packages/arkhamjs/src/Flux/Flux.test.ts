/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

// Mock debounceCompact for testing - must be before any imports
jest.mock('@nlabs/utils/objects/debounce-compact', () => ({
  debounceCompact: jest.fn((fn) => fn())
}));

import { cloneDeep, debounceCompact, set } from '@nlabs/utils';

import { ArkhamConstants } from '../constants/ArkhamConstants';
import { FluxFramework } from './Flux';
import { FluxAction, FluxOptions, FluxStore } from './Flux.types';


const initialState = {
  falsy: false,
  item: 'default',
  testAction: 'default',
  testUpdate: 'default',
  zeroValue: 0
};

const helloStore = (type: string, data, state = initialState): any => {
  switch(type) {
    case 'TEST_EVENT':
      return set(state, 'testAction', data.testVar);
    default:
      return state;
  }
};

describe('Flux', () => {
  const consoleError = console.error;
  const consoleWarn = console.warn;
  const cfg: FluxOptions = {
    name: 'arkhamjsTest',
    stores: [helloStore],
    storage: {
      getStorageData: jest.fn(),
      setStorageData: jest.fn()
    },
    storageWait: 0
  };
  let Flux;

  beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  beforeEach(async () => {
    Flux = new FluxFramework();

    // Configure
    await Flux.init(cfg, true);
  });

  afterAll(() => {
    console.error = consoleError;
    console.warn = consoleWarn;
  });

  describe('#addMiddleware', () => {
    describe('should apply pre-dispatch middleware', () => {
      const middleTest: string = 'intercept object';

      // Add object middleware
      const objMiddleware = {
        name: 'objectMiddleware',
        preDispatch: (action) => ({...action, testVar: middleTest})
      };

      afterEach(() => {
        Flux.clearMiddleware();
      });

      it('should alter data before sending to stores', async () => {
        // Method
        Flux.addMiddleware([objMiddleware]);

        // Set test data
        Flux.setState('helloStore.testAction', 'default');

        // Dispatch an action
        const preAction: FluxAction = await Flux.dispatch({testVar: 'hello world', type: 'TEST_EVENT'});

        expect(Flux.getState('helloStore.testAction')).toEqual(middleTest);
        expect(preAction.testVar).toEqual(middleTest);
      });

      it('should handle error for middleware without a name', () => {
        const fn = () => Flux.addMiddleware([{preDispatch: objMiddleware.preDispatch}]);
        expect(fn).toThrow();
      });

      it('should handle error for incompatible middleware', () => {
        const fn = () => Flux.addMiddleware(['incorrect']);
        expect(fn).toThrow();
      });
    });

    describe('should apply pre-dispatch middleware as promise', () => {
      const middleTest: string = 'intercept promise';

      beforeEach(() => {
        // Add object middleware
        const promiseMiddleware = {
          name: 'promiseMiddleware',
          preDispatch: (action) => Promise.resolve({...action, testVar: middleTest})
        };

        Flux.addMiddleware([promiseMiddleware]);
      });

      afterEach(() => {
        Flux.clearMiddleware();
      });

      it('should alter data before sending to stores', async () => {
        // Set test data
        Flux.setState('helloStore.testAction', 'default');

        // Dispatch an action
        const preAction: FluxAction = await Flux.dispatch({testVar: 'hello world', type: 'TEST_EVENT'});
        expect(Flux.getState('helloStore.testAction')).toEqual(middleTest);
        expect(preAction.testVar).toEqual(middleTest);
      });
    });

    describe('should apply post dispatch middleware', () => {
      const middleTest: string = 'intercept post';

      beforeEach(() => {
        // Add object middleware
        const postMiddleware = {
          name: 'postMiddleware',
          postDispatch: (action) => Promise.resolve({...action, testVar: middleTest})
        };

        Flux.addMiddleware([postMiddleware]);
      });

      afterEach(() => {
        Flux.clearMiddleware();
      });

      it('should alter store data', async () => {
        // Set test data
        Flux.setState('helloStore.testAction', 'default');

        // Dispatch an action
        const postAction: FluxAction = await Flux.dispatch({testVar: 'hello world', type: 'TEST_EVENT'});

        expect(Flux.getState('helloStore.testAction')).toEqual('hello world');
        expect(postAction.testVar).toEqual(middleTest);
      });

      it('should handle no action error', async () => {
        await expect(Flux.dispatch(null)).rejects.toThrow();
      });

      it('should handle pre dispatch error', async () => {
        const preMiddleware = {
          name: 'errorMiddleware',
          preDispatch: () => Promise.reject(new Error('preDispatch_error'))
        };
        Flux.addMiddleware([preMiddleware]);
        await expect(Flux.dispatch({type: 'test'})).rejects.toThrow('preDispatch_error');
      });

      it('should handle post dispatch error', async () => {
        const postMiddleware = {
          name: 'errorMiddleware',
          postDispatch: () => Promise.reject(new Error('postDispatch_error'))
        };
        Flux.addMiddleware([postMiddleware]);
        await expect(Flux.dispatch({type: 'test'})).rejects.toThrow('postDispatch_error');
      });
    });
  });

  describe('#addPlugin', () => {
    it('should add a plugin', () => {
      const addPluginKey: string = 'addPlugin';
      const plugin = {method: () => {}, name: 'demoPlugin'};
      const results = Flux[addPluginKey]('preDispatch', plugin);
      expect(results).toEqual([plugin]);
    });

    it('should skip plugin if already exists', () => {
      const addPluginKey: string = 'addPlugin';
      const plugin = {method: () => {}, name: 'demoPlugin'};
      Flux.middleware.preDispatchList = [plugin];
      const results = Flux[addPluginKey]('preDispatch', plugin);
      expect(results).toEqual([plugin]);
    });

    it('should handle undefined function', () => {
      const addPluginKey: string = 'addPlugin';
      const fn = () => Flux[addPluginKey]('preDispatch', {method: 'object'});
      expect(fn).toThrow();
    });
  });

  describe('#clearAppData', () => {
    beforeEach(() => {
      Flux.setState('helloStore.item', 'clear');
    });

    it('should return true by default', async () => {
      Flux.options.storage = null;
      await expect(Flux.clearAppData()).resolves.toEqual(true);
    });


    it('should reset the store data', async () => {
      await Flux.clearAppData();
      expect(Flux.getState(['helloStore', 'item'])).toEqual('default');
    });

    it('should set data in storage', async () => {
      const returnedValue = {hello: 'world'};
      const getStorageData = jest.fn();
      const setStorageData = jest.fn().mockResolvedValue(returnedValue);
      Flux.options.storage = {getStorageData, setStorageData};

      const results = await Flux.clearAppData();

      expect(setStorageData.mock.calls.length).toEqual(1);
      expect(results).toEqual(returnedValue);
    });
  });

  describe('#deregister', () => {
    it('should remove a state and store', () => {
      Flux.state = {hello: 'world'};
      Flux.storeActions = {hello: 'world'};
      Flux.deregister('hello');
      expect(Flux.state).toEqual({});
      expect(Flux.storeActions).toEqual({});
    });

    it('should use empty string as default', () => {
      const originalState = cloneDeep(Flux.state);
      Flux.deregister();
      expect(originalState).toEqual(Flux.state);
    });
  });

  describe('#dispatch', () => {
    let eventSpy;

    beforeEach(() => {
      eventSpy = jest.fn();
      Flux.on('TEST_EVENT', eventSpy);
    });

    afterEach(() => {
      Flux.off('TEST_EVENT', eventSpy);
    });

    it('should return an action', async () => {
      Flux.dispatch({testVar: 'test', type: 'TEST_EVENT'});
      const action: any = await Flux.dispatch({testVar: 'test', type: 'TEST_EVENT'});
      expect(action).toEqual({testVar: 'test', type: 'TEST_EVENT'});
    });

    it('should alter the store data', () => {
      Flux.dispatch({testVar: 'test', type: 'TEST_EVENT'});
      const item: string = Flux.getState('helloStore.testAction');
      expect(item).toEqual('test');
    });

    it('should dispatch an event', async () => {
      await Flux.dispatch({testVar: 'test', type: 'TEST_EVENT'});
      expect(eventSpy.mock.calls.length).toEqual(1);
    });

    it('should not dispatch if no type', () => {
      Flux.dispatch({testVar: 'test'});
      expect(eventSpy.mock.calls.length).toEqual(0);
    });

    it('should not dispatch if silent', () => {
      Flux.dispatch({testVar: 'test', type: 'TEST_EVENT'}, true);
      expect(eventSpy.mock.calls.length).toEqual(0);
    });

    it('should update storage', () => {
      Flux.updateStorage = jest.fn().mockResolvedValue({});
      const getStorageData = jest.fn();
      const setStorageData = jest.fn();
      Flux.options.storage = {getStorageData, setStorageData};
      Flux.dispatch({testVar: 'test', type: 'TEST_EVENT'});
      expect(Flux.updateStorage.mock.calls.length).toEqual(1);
    });

    it('should return updated state if action returns null', async () => {
      const nullStore = (type: string, data, state = initialState): any => {
        switch(type) {
          case 'TEST_NULL':
            return null;
          default:
            return state;
        }
      };
      await Flux.addStores([nullStore]);
      await Flux.dispatch({testVar: 'test', type: 'TEST_NULL'});
      expect(Flux.state.nullStore).toEqual(initialState);
    });

    it('should return empty object if store returns null by default', async () => {
      const nullStore = (type: string, data, state): any => {
        switch(type) {
          case 'TEST_NULL':
            return null;
          default:
            return state;
        }
      };
      await Flux.addStores([nullStore]);
      Flux.state.nullStore = null;
      await Flux.dispatch({testVar: 'test', type: 'TEST_NULL'});
      expect(Flux.state.nullStore).toEqual({});
    });
  });

  describe('#getOptions', () => {
    it('should get a options object', () => {
      const options = Flux.getOptions();
      const optionsKey: string = 'options';
      expect(options).toEqual(Flux[optionsKey]);
    });
  });

  describe('#getState', () => {
    beforeEach(() => {
      const storeAction = Flux.getStore('helloStore');
      Flux.setState('helloStore', storeAction.initialState);
    });

    it('should get a global store', () => {
      const value = Flux.getState();
      expect(value.helloStore.item).toEqual('default');
    });

    it('should get a specific store returning an object', () => {
      const value = Flux.getState('helloStore');
      expect(value.item).toEqual('default');
    });

    it('should get a specific item within a store using array', () => {
      const value: string = Flux.getState(['helloStore', 'item']);
      expect(value).toEqual('default');
    });

    it('should get a specific item within a store using dot notation', () => {
      const value: string = Flux.getState('helloStore.item');
      expect(value).toEqual('default');
    });

    it('should return default value from a null item', () => {
      const value: string = Flux.getState('helloStore.notDefault', '');
      expect(value).toEqual('');
    });

    it('should return entire store object with empty key', () => {
      const value: string = Flux.getState('');
      expect(value).toEqual({helloStore: initialState});
    });

    it('should return entire store object with null key', () => {
      const value: string = Flux.getState(null);
      expect(value).toEqual({helloStore: initialState});
    });

    it('should return entire store object with undefined key', () => {
      const value: string = Flux.getState();
      expect(value).toEqual({helloStore: initialState});
    });

    it('should return empty object if state is null', () => {
      Flux.state = null;
      const value: string = Flux.getState();
      expect(value).toEqual({});
    });

    it('should return a false value', () => {
      const value = Flux.getState('helloStore.falsy');
      expect(value).toEqual(false);
    });

    it('should return a zero value', () => {
      const value = Flux.getState('helloStore.zeroValue');
      expect(value).toEqual(0);
    });
  });

  describe('#getStore', () => {
    it('should get a store function', () => {
      const storeAction = Flux.getStore('helloStore');
      expect(storeAction.name).toEqual('helloStore');
    });

    it('should use empty string as default value', () => {
      const storeAction = Flux.getStore();
      expect(storeAction).toBeUndefined();
    });
  });

  describe('#init', () => {
    describe('set app name', () => {
      // Vars
      const opts: FluxOptions = {
        name: 'demo'
      };

      it('should update app name if initializing for the first time', async () => {
        const privateInit: string = 'isInit';
        Flux[privateInit] = false;

        // Method
        await Flux.init(opts);

        const optionsKey: string = 'options';
        expect(Flux[optionsKey].name).toEqual('demo');
      });

      it('should not update app name if initializing again', async () => {
        const privateInit: string = 'isInit';
        Flux[privateInit] = true;

        // Method
        await Flux.init(opts);

        const optionsKey: string = 'options';
        expect(Flux[optionsKey].name).toEqual('arkhamjsTest');
      });

      it('should add windows object for debugging', async () => {
        // Method
        await Flux.init({...opts, debug: true});

        const debugKey: string = 'arkhamjs';
        expect(window[debugKey]).toEqual(Flux);
      });

      it('should use default object if undefined', async () => {
        // Method
        await Flux.reset();
        await Flux.init();

        const optionsKey: string = 'options';
        const expectedOptions = {
          name: 'arkhamjs',
          routerType: 'browser',
          scrollToTop: true,
          state: null,
          storage: null,
          storageWait: 300,
          stores: [],
          title: 'ArkhamJS'
        };
        expect(Flux[optionsKey]).toEqual(expectedOptions);
      });
    });

    describe('set app name for initialized app', () => {
      // Vars
      const opts: FluxOptions = {
        name: 'demo'
      };

      it('should set app name', async () => {
        await Flux.init(opts, true);
        const privateProperty: string = 'options';
        expect(Flux[privateProperty].name).toEqual('demo');
      });
    });

    describe('set initial empty state', () => {
      // Vars
      const opts: FluxOptions = {
        state: {},
        stores: [helloStore]
      };

      it('should set state', async () => {
        await Flux.init(opts, true);
        const privateProperty: string = 'state';
        expect(Object.keys(Flux[privateProperty]).length).toEqual(1);
      });

      it('should set state branch for store', async () => {
        await Flux.init(opts, true);
        const privateProperty: string = 'state';
        expect(Flux[privateProperty].helloStore.item).toEqual('default');
      });
    });

    describe('set null state', () => {
      // Vars
      const opts: FluxOptions = {
        state: null,
        stores: [helloStore]
      };

      it('should set state', async () => {
        await Flux.init(opts, true);
        const privateProperty: string = 'state';
        expect(Object.keys(Flux[privateProperty]).length).toEqual(1);
      });

      it('should set state branch for store', async () => {
        await Flux.init(opts, true);
        const privateProperty: string = 'state';
        expect(Flux[privateProperty].helloStore.item).toEqual('default');
      });
    });

    describe('set defined state', () => {
      // Vars
      const opts: FluxOptions = {
        state: {second: 'value', test: {hello: 'world'}},
        stores: [helloStore]
      };

      it('should set state', async () => {
        await Flux.init(opts, true);
        const privateProperty: string = 'state';
        expect(Object.keys(Flux[privateProperty]).length).toEqual(3);
      });

      it('should set state branch for store', async () => {
        await Flux.init(opts, true);
        const privateProperty: string = 'state';
        expect(Flux[privateProperty].test.hello).toEqual('world');
      });
    });

    describe('middleware', () => {
      // Middleware object
      const objMiddleware = {
        name: 'objectMiddleware',
        preDispatch: (action) => ({...action})
      };

      // Vars
      const opts: FluxOptions = {
        middleware: [objMiddleware],
        name: 'demo',
        stores: [helloStore]
      };

      it('should add middleware', async () => {
        await Flux.init(opts, true);
        const privateProperty: string = 'middleware';
        expect(Flux[privateProperty].preDispatchList[0].name).toEqual('objectMiddleware');
      });
    });

    describe('error handling', () => {
      it('should handle useStorage error', async () => {
        Flux.useStorage = () => Promise.reject(new Error('useStorage_error'));
        await expect(Flux.init(cfg, true)).rejects.toThrow('useStorage_error');
      });

      it('should handle addStores error', async () => {
        Flux.addStores = () => Promise.reject(new Error('addStores_error'));
        await expect(Flux.init(cfg, true)).rejects.toThrow('addStores_error');
      });
    });
  });

  describe('event listeners', () => {
    let eventSpy;

    beforeEach(() => {
      eventSpy = jest.fn();
      Flux.on('test', eventSpy);
    });

    describe('#on', () => {
      it('should add a listener', async () => {
        await Flux.dispatch({type: 'test'});
        expect(eventSpy.mock.calls.length).toEqual(1);
      });
    });

    describe('#off', () => {
      it('should remove a listener', async () => {
        Flux.off('test', eventSpy);
        await Flux.dispatch({type: 'test'});

        expect(eventSpy.mock.calls.length).toEqual(0);
      });
    });
  });

  describe('#addStores', () => {
    const demo = (type, data, state = {helloStore: 'joker'}) => {
      if(type === 'DEMO_TEST') {
        state.helloStore = data.helloStore;
      }

      return state;
    };

    it('should create and save a Store class', () => {
      Flux.addStores([demo]);
      const privateProperty: string = 'storeActions';
      const storeAction: FluxStore = Flux[privateProperty].demo;
      expect(storeAction.name).toEqual('demo');
    });

    it('should set initial state', () => {
      Flux.addStores([demo]);
      const privateProperty: string = 'storeActions';
      const storeAction: FluxStore = Flux[privateProperty].demo;
      expect(storeAction.initialState).toEqual({helloStore: 'joker'});
    });

    it('should handle unsupported stores', () => {
      const optionsKey: string = 'options';
      const getStorageData = jest.fn();
      const setStorageData = jest.fn();
      Flux[optionsKey].storage = {getStorageData, setStorageData};

      Flux.addStores([demo]);
      const privateProperty: string = 'storeActions';
      const storeAction: FluxStore = Flux[privateProperty].demo;
      expect(storeAction.initialState).toEqual({helloStore: 'joker'});
    });

    it('should handle errors', async () => {
      const optionsKey: string = 'options';
      const getStorageData = jest.fn();
      const setStorageData = () => Promise.reject(new Error('setStorageData_error'));
      Flux[optionsKey].storage = {getStorageData, setStorageData};
      await expect(Flux.addStores([demo])).rejects.toThrow('setStorageData_error');
    });
  });

  describe('#offInit', () => {
    it('should remove listener after initialization', () => {
      const listener = jest.fn();
      Flux.off = jest.fn();
      Flux.offInit(listener);
      expect(Flux.off.mock.calls.length).toEqual(1);
      expect(Flux.off.mock.calls[0][0]).toEqual(ArkhamConstants.INIT);
    });
  });

  describe('#onInit', () => {
    it('should add listener after initialization', () => {
      const listener = jest.fn();
      Flux.isInit = false;
      Flux.on = jest.fn();
      Flux.onInit(listener);
      expect(Flux.on.mock.calls.length).toEqual(1);
      expect(Flux.on.mock.calls[0][0]).toEqual(ArkhamConstants.INIT);
    });

    it('should dispatch instantly if already initialized', () => {
      const listener = jest.fn();
      Flux.isInit = true;
      Flux.onInit(listener);
      expect(listener.mock.calls.length).toEqual(1);
    });
  });

  describe('#register', () => {
    it('should register a store function', () => {
      const demoStore = (type: string, data, state = initialState): any => {
        switch(type) {
          case 'TEST_EVENT':
            return set('testAction', data.testVar, state);
          default:
            return state;
        }
      };

      const registerKey: string = 'register';
      const storeAction = Flux[registerKey](demoStore);
      const expectedAction = {
        action: demoStore,
        initialState,
        name: 'demoStore'
      };
      expect(storeAction).toEqual(expectedAction);
    });

    it('should register a store function without an initial value', () => {
      const demoStore = (type: string, data, state): any => {
        switch(type) {
          case 'TEST_EVENT':
            return set('testAction', data.testVar, state);
          default:
            return state;
        }
      };

      const registerKey: string = 'register';
      const storeAction = Flux[registerKey](demoStore);
      const expectedAction = {
        action: demoStore,
        initialState: undefined,
        name: 'demoStore'
      };
      expect(storeAction).toEqual(expectedAction);
    });

    it('should not save a store function without a name', () => {
      const registerKey: string = 'register';
      const storeAction = Flux[registerKey]((type: string, data, state = initialState): any => {
        switch(type) {
          case 'TEST_EVENT':
            return set('testAction', data.testVar, state);
          default:
            return state;
        }
      });
      expect(storeAction).toBeUndefined();
    });

    it('should handle undefined function', () => {
      const registerKey: string = 'register';

      const fn = () => Flux[registerKey]();
      expect(fn).toThrow();
    });

    it('should handle argument that is not a function', () => {
      const registerKey: string = 'register';

      const fn = () => Flux[registerKey]({});
      expect(fn).toThrow();
    });
  });

  describe('#removeMiddleware', () => {
    beforeEach(() => {
      Flux.clearMiddleware();

      // Add object middleware
      const objMiddleware = {
        name: 'objectMiddleware',
        preDispatch: (action) => ({...action})
      };

      Flux.addMiddleware([objMiddleware]);
    });

    it('should alter data before sending to stores', () => {
      Flux.removeMiddleware(['objectMiddleware']);
      const privateProperty: string = 'middleware';
      expect(Flux[privateProperty].preDispatchList.length).toEqual(0);
    });
  });

  describe('#removePlugin', () => {
    it('should remove an existing plugin', () => {
      Flux.middleware.preDispatchList = [{name: 'demoPlugin'}, {name: 'noNotRemovePlugin'}];
      expect(Flux.removePlugin('preDispatch', 'demoPlugin')).toEqual([{name: 'noNotRemovePlugin'}]);
    });

    it('should get an undefined list', () => {
      Flux.middleware.preDispatchList = null;
      expect(Flux.removePlugin('preDispatch', 'demoPlugin')).toEqual([]);
    });
  });

  describe('#removeStores', () => {
    beforeEach(() => {
      // Method
      Flux.removeStores(['helloStore']);
    });

    afterEach(() => {
      Flux.addStores([helloStore]);
    });

    it('should remove class', () => {
      const privateProperty: string = 'storeActions';
      expect(!!Flux[privateProperty].helloStore).toEqual(false);
    });

    it('should remove store data', () => {
      const privateProperty: string = 'state';
      expect(!!Flux[privateProperty].helloStore).toEqual(false);
    });
  });

  describe('#reset', () => {
    it('should handle argument that is not a function', async () => {
      const optionsKey: string = 'options';
      const getStorageData = jest.fn();
      const setStorageData = () => Promise.reject(new Error('setStorageData_error'));
      Flux[optionsKey].storage = {getStorageData, setStorageData};
      await expect(Flux.reset()).rejects.toThrow('setStorageData_error');
    });
  });

  describe('#setState', () => {
    it('should update the property within the store', async () => {
      Flux.updateStorage = jest.fn();
      await Flux.setState('helloStore.testUpdate', 'test');
      const newItem = await Flux.getState('helloStore.testUpdate');
      expect(Flux.updateStorage).toHaveBeenCalled();
      expect(newItem).toEqual('test');
    });

    it('should empty string as default path', async () => {
      Flux.updateStorage = jest.fn();
      await Flux.setState(undefined, 'test');
      const newItem = await Flux.getState('helloStore');
      expect(Flux.updateStorage).toHaveBeenCalled();
      expect(newItem).toEqual(initialState);
    });

    it('should update storage', async () => {
      const optionsKey: string = 'options';
      Flux.updateStorage = jest.fn();
      Flux[optionsKey] = {
        storage: {
          getStorageData: jest.fn(),
          setStorageData: jest.fn()
        }
      };
      await Flux.setState('helloStore.testUpdate', 'test');
      expect(Flux.updateStorage.mock.calls.length).toEqual(1);
    });
  });

  describe('#useStorage', () => {
    it('should update storage', async () => {
      const getStorageData = jest.fn();
      const setStorageData = jest.fn();
      const optionsKey: string = 'options';
      Flux[optionsKey].state = null;
      Flux[optionsKey].storage = {getStorageData, setStorageData};

      const useStorageKey: string = 'useStorage';
      await Flux[useStorageKey]('helloStore');

      expect(getStorageData.mock.calls.length).toEqual(1);
    });

    it('without storage', async () => {
      const optionsKey: string = 'options';
      Flux[optionsKey].state = {hello: 'world'};
      Flux[optionsKey].storage = null;

      const useStorageKey: string = 'useStorage';
      await Flux[useStorageKey]('helloStore');

      const stateKey: string = 'state';
      expect(Flux[stateKey].hello).toEqual('world');
    });

    it('should handle storage errors', async () => {
      const optionsKey: string = 'options';
      Flux[optionsKey].state = null;
      Flux[optionsKey].storage = {
        getStorageData: () => Promise.reject(new Error('getStorageData_error')),
        setStorageData: () => Promise.reject(new Error('setStorageData_error'))
      };

      const useStorageKey: string = 'useStorage';
      await expect(Flux[useStorageKey]('helloStore')).rejects.toThrow('getStorageData_error');
    });

    it('should debounce storage', async () => {
      const value: string = 'test';
      const optionsKey: string = 'options';
      Flux[optionsKey].state = {hello: 'world'};

      const getStorageData = jest.fn();
      const setStorageData = jest.fn().mockReturnValue(value);
      Flux[optionsKey].storage = {getStorageData, setStorageData};

      const useStorageKey: string = 'useStorage';
      await Flux[useStorageKey]('helloStore');

      // The debounced function should be set up with the correct parameters
      expect(debounceCompact).toHaveBeenCalledWith(expect.any(Function), 0);

      // Since our mock executes immediately, setStorageData should have been called
      expect(setStorageData).toHaveBeenCalledWith('helloStore', Flux.state);
    });
  });
});
