/**
 * Copyright (c) 2017, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

 import {set} from 'lodash';
import {Store} from '../Store/Store';
import {Flux, FluxDebugLevel, FluxOptions} from './Flux';

describe('Flux', () => {
  let store, localSetSpy, sessionSetSpy, sessionSpy;
  const val: string = 'hello_world';
  const key: string = 'test';
  const cfg: FluxOptions = {
    debugLevel: FluxDebugLevel.DISPATCH,
    name: 'arkhamjs',
    useCache: true
  };
  
  class TestStore extends Store {
    constructor() {
      super('test');
    }
    
    initialState(): object {
      return {
        item: 'default',
        testAction: 'default',
        testUpdate: 'default'
      };
    }
    
    onAction(type: string, data, state): object {
      switch(type) {
        case 'TEST_EVENT':
          return set(state, 'testAction', data.testVar);
        default:
          return state;
      }
    }
  }
  
  beforeAll(() => {
    // Mock storage
    const storageMock = () => {
      const storage: object = {};
      
      return {
        getItem: (storageGetKey: string) => {
          return storage[storageGetKey] || null;
        },
        removeItem: (storageRemoveKey: string) => {
          delete storage[storageRemoveKey];
        },
        setItem: (storageSetKey, storageSetValue) => {
          storage[storageSetKey] = storageSetValue || '';
        }
      };
    };
    
    // Vars
    Flux['window'].sessionStorage = storageMock();
    Flux['window'].localStorage = storageMock();
    
    // Configure
    Flux.config(cfg);
    
    // Spy
    localSetSpy = jest.spyOn(Flux['window'].localStorage, 'setItem');
    sessionSetSpy = jest.spyOn(Flux['window'].sessionStorage, 'setItem');
    sessionSpy = jest.spyOn(Flux, 'setSessionData');
    
    // Method
    store = Flux.registerStores([TestStore]);
  });
  
  afterEach(() => {
    localSetSpy.mockClear();
    sessionSetSpy.mockClear();
    sessionSpy.mockClear();
  });
  
  afterAll(() => {
    localSetSpy.mockRestore();
    sessionSetSpy.mockRestore();
    sessionSpy.mockRestore();
  });
  
  describe('#clearAppData', () => {
    beforeAll(() => {
      // Set test data
      Flux.setStore(['test', 'item'], 'clear');
      
      // Method
      Flux.clearAppData();
    });
    
    it('should re-initialize session data', () => {
      expect(sessionSpy.mock.calls.length).toEqual(2);
    });
    
    it('should reset the store data', () => {
      expect(Flux.getStore(['test', 'item'])).toEqual('default');
    });
  });
  
  describe('#config', () => {
    // Vars
    const opts: FluxOptions = {
      debugLevel: 0,
      name,
      useCache: true
    };
    
    beforeAll(() => {
      // Method
      Flux.config(opts);
    });
    
    afterAll(() => {
      Flux.config(cfg);
    });
    
    it('should set debugLevel', () => {
      expect(Flux['options'].debugLevel).toEqual(opts.debugLevel);
    });
    
    it('should set app name', () => {
      expect(Flux['options'].name).toEqual(opts.name);
    });
    
    it('should set useCache', () => {
      expect(Flux['options'].useCache).toEqual(opts.useCache);
    });
  });
  
  describe('#debugError', () => {
    let consoleSpy;
    const msg: string = 'test';
    
    beforeAll(() => {
      // Spy
      consoleSpy = jest.spyOn(console, 'error');
      
      // Method
      Flux.debugError(msg);
    });
    
    afterAll(() => {
      consoleSpy.mockRestore();
    });
    
    it('should send data to console.error', () => {
      expect(consoleSpy.mock.calls[0][0]).toEqual(msg);
    });
  });
  
  describe('#debugInfo', () => {
    let consoleSpy;
    const msg: string = 'test';
    
    beforeAll(() => {
      // Spy
      consoleSpy = jest.spyOn(console, 'info');
      
      // Method
      Flux.debugInfo(msg);
    });
    
    afterAll(() => {
      consoleSpy.mockRestore();
    });
    
    it('should send data to console.info', () => {
      expect(consoleSpy.mock.calls[0][0]).toEqual(msg);
    });
  });
  
  describe('#debugLog', () => {
    let consoleSpy;
    const msg: string = 'test';
    
    beforeAll(() => {
      // Spy
      consoleSpy = jest.spyOn(console, 'log');
      
      // Method
      Flux.debugLog(msg);
    });
    
    afterAll(() => {
      consoleSpy.mockRestore();
    });
    
    it('should send data to console.log', () => {
      expect(consoleSpy.mock.calls[0][0]).toEqual(msg);
    });
  });
  
  describe('#delLocalData', () => {
    it('should remove local data', () => {
      // Method
      Flux.delLocalData(key);
      const testVal: Promise<string> = Flux.getLocalData(key);
      expect(testVal).resolves.toEqual(null);
    });
  });
  
  describe('#delSessionData', () => {
    it('should remove session data', () => {
      // Method
      Flux.delSessionData(key);
      const testVal: Promise<string> = Flux.getSessionData(key);
      expect(testVal).resolves.toEqual(null);
    });
  });
  
  describe('#deregisterStores', () => {
    beforeAll(() => {
      // Method
      Flux.deregisterStores(['test']);
    });
    
    afterAll(() => {
      Flux.registerStores([TestStore]);
    });
    
    it('should remove class', () => {
      expect(!!Flux['storeClasses'].test).toEqual(false);
    });
    
    it('should remove store data', () => {
      expect(!!Flux['store'].test).toEqual(false);
    });
  });
  
  describe('#dispatch', () => {
    let action: Promise<any>;
    let eventSpy;
    
    beforeAll(() => {
      // Spy
      eventSpy = jest.fn();
      Flux.on('TEST_EVENT', eventSpy);
      
      // Method
      Flux.dispatch({type: 'TEST_EVENT', testVar: 'test'});
    });
    
    afterAll(() => {
      Flux.off('TEST_EVENT', eventSpy);
    });
    
    it('should return an action', () => {
      action = Flux.dispatch({type: 'TEST_EVENT', testVar: 'test'});
      expect(action).resolves.toEqual({type: 'TEST_EVENT', testVar: 'test'});
    });
    
    it('should alter the store data', () => {
      const item: string = Flux.getStore(['test', 'testAction']);
      expect(item).toEqual('test');
    });
    
    it('should dispatch an event', () => {
      expect(eventSpy.mock.calls.length).toEqual(2);
    });
  });
  
  describe('#enableDebugger', () => {
    it('should disable debugger', () => {
      Flux.enableDebugger(FluxDebugLevel.DISABLED);
      const options: FluxOptions = Flux.getOptions();
      expect(options.debugLevel).toEqual(0);
    });
    
    it('should enable debugger for logs', () => {
      Flux.enableDebugger(FluxDebugLevel.LOGS);
      const options: FluxOptions = Flux.getOptions();
      expect(options.debugLevel).toEqual(1);
    });
    
    it('should enable debugger for dispatch actions', () => {
      Flux.enableDebugger(FluxDebugLevel.DISPATCH);
      const options: FluxOptions = Flux.getOptions();
      expect(options.debugLevel).toEqual(2);
    });
  });
  
  describe('#getClass', () => {
    it('should get a store class', () => {
      const storeCls: Store = Flux.getClass('test');
      expect(storeCls.name).toEqual('test');
    });
  });
  
  describe('#getLocalData', () => {
    it('should get local data', () => {
      // Set data
      Flux.setLocalData(key, val);
      
      // Method
      const testVal: Promise<string> = Flux.getLocalData(key);
      expect(testVal).resolves.toEqual(val);
    });
  });
  
  describe('#getSessionData', () => {
    it('should get session data', () => {
      // Method
      Flux.setSessionData(key, val);
      const testVal: Promise<string> = Flux.getSessionData(key);
      expect(testVal).resolves.toEqual(val);
    });
  });
  
  describe('#getStore', () => {
    beforeAll(() => {
      Flux.setStore('test', {item: 'default'});
    });

    it('should get a global store', () => {
      const value = Flux.getStore();
      expect(value.test.item).toEqual('default');
    });
    
    it('should get a specific store returning an object', () => {
      const value = Flux.getStore('test');
      expect(value.item).toEqual('default');
    });
    
    it('should get a specific item within a store using array', () => {
      const value: string = Flux.getStore(['test', 'item']);
      expect(value).toEqual('default');
    });
    
    it('should get a specific item within a store using dot notation', () => {
      const value: string = Flux.getStore('test.item');
      expect(value).toEqual('default');
    });
    
    it('should return default value from a null item', () => {
      const value: string = Flux.getStore('test.notDefault', '');
      expect(value).toEqual('');
    });
    
    it('should return entire store object with empty key', () => {
      const value: string = Flux.getStore('');
      expect(value).toEqual({test: {item: 'default'}});
    });
  });
  
  describe('#off', () => {
    it('should remove a listener', () => {
      const spy = jest.fn();
      Flux.on('test', spy);
      Flux.off('test', spy);
      Flux.dispatch({type: 'test'});
      
      expect(spy.mock.calls.length).toEqual(0);
    });
  });
  
  describe('#registerStores', () => {
    it('should save the store class', () => {
      const storeCls: Store = Flux['storeClasses'].test;
      expect(storeCls.name).toEqual('test');
    });
    
    it('should set the initial value', () => {
      const value: string = Flux['store'].test.item;
      expect(value).toEqual('default');
    });
  });
  
  describe('#setSessionData', () => {
    it('should set session data', () => {
      // Method
      Flux.setSessionData(key, val);
      expect(sessionSetSpy.mock.calls.length).toEqual(1);
    });
  });
  
  describe('#setStore', () => {
    let changedItem, newItem;
    
    beforeAll(() => {
      changedItem = Flux.setStore('test.testUpdate', 'test');
      newItem = Flux.getStore('test.testUpdate');
    });
    
    it('should update the property within the store', () => {
      expect(newItem).toEqual('test');
    });
  });
  
  describe('#setLocalData', () => {
    it('should set local data', () => {
      // Method
      Flux.setLocalData(key, val);
      expect(localSetSpy.mock.calls.length).toEqual(1);
    });
  });
});
