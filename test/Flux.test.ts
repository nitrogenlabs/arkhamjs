import {set} from 'lodash';
import {Flux, FluxDebugLevel, FluxOptions, Store} from '../src';

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
    
    onAction(type: string, data: object, state: object): object {
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
    store = Flux.registerStore([TestStore]);
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
      expect(sessionSpy.mock.calls.length).toBe(2);
    });
    
    it('should reset the store data', () => {
      expect(Flux.getStore(['test', 'item'])).toBe('default');
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
      expect(Flux['options'].debugLevel).toBe(opts.debugLevel);
    });
    
    it('should set app name', () => {
      expect(Flux['options'].name).toBe(opts.name);
    });
    
    it('should set useCache', () => {
      expect(Flux['options'].useCache).toBe(opts.useCache);
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
      expect(consoleSpy.mock.calls[0][0]).toBe(msg);
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
      expect(consoleSpy.mock.calls[0][0]).toBe(msg);
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
      expect(consoleSpy.mock.calls[0][0]).toBe(msg);
    });
  });
  
  describe('#delLocalData', () => {
    it('should remove local data', () => {
      // Method
      Flux.delLocalData(key);
      const testVal: string = Flux.getLocalData(key);
      expect(testVal).toBe(null);
    });
  });
  
  describe('#delSessionData', () => {
    it('should remove session data', () => {
      // Method
      Flux.delSessionData(key);
      const testVal: string = Flux.getSessionData(key);
      expect(testVal).toBe(null);
    });
  });
  
  describe('#deregisterStore', () => {
    beforeAll(() => {
      // Method
      Flux.deregisterStore(['test']);
    });
    
    afterAll(() => {
      Flux.registerStore([TestStore]);
    });
    
    it('should remove class', () => {
      expect(!!Flux['storeClasses'].test).toBe(false);
    });
    
    it('should remove store data', () => {
      expect(!!Flux['store'].test).toBe(false);
    });
  });
  
  describe('#dispatch', () => {
    let action, eventSpy;
    
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
      expect(action.type).toBe('TEST_EVENT');
      expect(action.testVar).toBe('test');
    });
    
    it('should alter the store data', () => {
      const item: string = Flux.getStore(['test', 'testAction']);
      expect(item).toBe('test');
    });
    
    it('should dispatch an event', () => {
      expect(eventSpy.mock.calls.length).toBe(2);
    });
  });
  
  describe('#enableDebugger', () => {
    it('should disable debugger', () => {
      Flux.enableDebugger(FluxDebugLevel.DISABLED);
      expect(Flux['options'].debugLevel).toBe(0);
    });
    
    it('should enable debugger for logs', () => {
      Flux.enableDebugger(FluxDebugLevel.LOGS);
      expect(Flux['options'].debugLevel).toBe(1);
    });
    
    it('should enable debugger for dispatch actions', () => {
      Flux.enableDebugger(FluxDebugLevel.DISPATCH);
      expect(Flux['options'].debugLevel).toBe(2);
    });
  });
  
  describe('#getClass', () => {
    it('should get a class', () => {
      const storeCls: Store = Flux.getClass('test');
      expect(storeCls.name).toBe('test');
    });
  });
  
  describe('#getLocalData', () => {
    it('should get local data', () => {
      // Set data
      Flux.setLocalData(key, val);
      
      // Method
      const testVal: string = Flux.getLocalData(key);
      expect(testVal).toBe(val);
    });
  });
  
  describe('#getSessionData', () => {
    it('should get session data', () => {
      // Method
      Flux.setSessionData(key, val);
      const testVal: string = Flux.getSessionData(key);
      expect(testVal).toBe(val);
    });
  });
  
  describe('#getStore', () => {
    it('should get a global store', () => {
      const value: object = Flux.getStore();
      expect(value.test.item).toBe('default');
    });
    
    it('should get a specific store returning an object', () => {
      Flux['options'].useImmutable = false;
      const value: object = Flux.getStore('test');
      expect(value.item).toBe('default');
    });
    
    it('should get a specific item within a store', () => {
      const value: string = Flux.getStore(['test', 'item']);
      expect(value).toBe('default');
    });
    
    it('should return default value from a null item', () => {
      const value: string = Flux.getStore(['test', 'notDefault'], '');
      expect(value).toBe('');
    });
  });
  
  describe('#off', () => {
    it('should remove a listener', () => {
      const spy = jest.fn();
      Flux.on('test', spy);
      Flux.off('test', spy);
      Flux.dispatch({type: 'test'});
      
      expect(spy.mock.calls.length).toBe(0);
    });
  });
  
  describe('#registerStore', () => {
    it('should save the class', () => {
      const storeCls: Store = Flux['storeClasses'].test;
      expect(storeCls.name).toBe('test');
    });
    
    it('should set the initial value', () => {
      const value: string = Flux['store'].test.item;
      expect(value).toBe('default');
    });
  });
  
  describe('#setSessionData', () => {
    it('should set session data', () => {
      // Method
      Flux.setSessionData(key, val);
      expect(sessionSetSpy.mock.calls.length).toBe(1);
    });
  });
  
  describe('#setStore', () => {
    let oldItem, changedItem, newItem;
    
    beforeAll(() => {
      oldItem = Flux.getStore(['test', 'testUpdate']);
      changedItem = Flux.setStore(['test', 'testUpdate'], 'test');
      newItem = Flux.getStore(['test', 'testUpdate']);
    });
    
    it('should have the original value', () => {
      expect(oldItem).toBe('default');
    });
    
    it('should update the property within the store', () => {
      expect(newItem).toBe('test');
    });
  });
  
  describe('#setLocalData', () => {
    it('should set local data', () => {
      // Method
      Flux.setLocalData(key, val);
      expect(localSetSpy.mock.calls.length).toBe(1);
    });
  });
});
