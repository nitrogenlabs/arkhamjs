import {Flux, Store} from '../src';

describe('Flux', () => {
  let store, localSetSpy, sessionSetSpy, sessionSpy;
  const val = 'hello_world';
  const key = 'test';
  const cfg = {
    debugLevel: Flux.DEBUG_DISPATCH,
    name: 'arkhamjs',
    useCache: true,
    useImmutable: true
  };

  class TestStore extends Store {
    constructor() {
      super('test');
    }

    initialState() {
      return {
        item: 'default',
        testUpdate: 'default',
        testAction: 'default'
      };
    }

    onAction(type, data, state) {
      switch(type) {
        case 'TEST_EVENT':
          return state.set('testAction', data.get('testVar'));
      }
    }
  }

  beforeAll(() => {
    // Mock storage
    const storageMock = () => {
      let storage = {};

      return {
        setItem: (key, value) => {
          storage[key] = value || '';
        },
        getItem: key => {
          return storage[key] || null;
        },
        removeItem: key => {
          delete storage[key];
        }
      };
    };

    // Vars
    Flux._window.sessionStorage = storageMock();
    Flux._window.localStorage = storageMock();

    // Configure
    Flux.config(cfg);

    // Spy
    localSetSpy = jest.spyOn(Flux._window.localStorage, 'setItem');
    sessionSetSpy = jest.spyOn(Flux._window.sessionStorage, 'setItem');
    sessionSpy = jest.spyOn(Flux, 'setSessionData');

    // Method
    store = Flux.registerStore(TestStore);
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
    const opts = {
      debugLevel: 0,
      name,
      useCache: true,
      useImmutable: true
    };

    beforeAll(() => {
      // Method
      Flux.config(opts);
    });

    afterAll(() => {
      Flux.config(cfg);
    });

    it('should set debugLevel', () => {
      expect(Flux._debugLevel).toBe(opts.debugLevel);
    });

    it('should set app name', () => {
      expect(Flux._name).toBe(opts.name);
    });
  
    it('should set useCache', () => {
      expect(Flux._useCache).toBe(opts.useCache);
    });
  
    it('should set useImmutable', () => {
      expect(Flux._useImmutable).toBe(opts.useImmutable);
    });
  });

  describe('#debugError', () => {
    let consoleSpy;
    const msg = 'test';

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
    const msg = 'test';

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
    const msg = 'test';

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
      const testVal = Flux.getLocalData(key);
      expect(testVal).toBe(null);
    });
  });

  describe('#delSessionData', () => {
    it('should remove session data', () => {
      // Method
      Flux.delSessionData(key);
      const testVal = Flux.getSessionData(key);
      expect(testVal).toBe(null);
    });
  });

  describe('#deregisterStore', () => {
    beforeAll(() => {
      // Method
      Flux.deregisterStore('test');
    });

    afterAll(() => {
      Flux.registerStore(TestStore);
    });

    it('should remove class', () => {
      expect(Flux._storeClasses.has('test')).toBe(false);
    });

    it('should remove store data', () => {
      expect(Flux._store.has('test')).toBe(false);
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
  
    it('should return a JSON action', () => {
      Flux._useImmutable = false;
      action = Flux.dispatch({type: 'TEST_EVENT', testVar: 'test'});
      expect(action.type).toBe('TEST_EVENT');
      expect(action.testVar).toBe('test');
    });
  
    it('should return an immutable action', () => {
      Flux._useImmutable = true;
      action = Flux.dispatch({type: 'TEST_EVENT', testVar: 'test'});
      expect(action.get('type')).toBe('TEST_EVENT');
      expect(action.get('testVar')).toBe('test');
    });
  
    it('should alter the store data returning an immutable object', () => {
      const item = Flux.getStore(['test', 'testAction']);
      expect(item).toBe('test');
    });

    it('should dispatch an event', () => {
      expect(eventSpy.mock.calls.length).toBe(3);
    });
  });

  describe('#enableDebugger', () => {
    it('should disable debugger', () => {
      Flux.enableDebugger(Flux.DEBUG_DISABLED);
      expect(Flux._debugLevel).toBe(0);
    });

    it('should enable debugger for logs', () => {
      Flux.enableDebugger(Flux.DEBUG_LOGS);
      expect(Flux._debugLevel).toBe(1);
    });

    it('should enable debugger for dispatch actions', () => {
      Flux.enableDebugger(Flux.DEBUG_DISPATCH);
      expect(Flux._debugLevel).toBe(2);
    });
  });

  describe('#getClass', () => {
    it('should get a class', () => {
      const cls = Flux.getClass('test');
      expect(cls.name).toBe('test');
    });
  });

  describe('#getLocalData', () => {
    it('should get local data', () => {
      // Set data
      Flux.setLocalData(key, val);

      // Method
      const testVal = Flux.getLocalData(key);
      expect(testVal).toBe(val);
    });
  });

  describe('#getSessionData', () => {
    it('should get session data', () => {
      // Method
      Flux.setSessionData(key, val);
      const testVal = Flux.getSessionData(key);
      expect(testVal).toBe(val);
    });
  });

  describe('#getStore', () => {
    it('should get a global store', () => {
      const item = Flux.getStore();
      expect(item.getIn(['test', 'item'])).toBe('default');
    });
  
    it('should get a specific store returning a JSON object', () => {
      Flux._useImmutable = false;
      const item = Flux.getStore('test');
      expect(item.item).toBe('default');
    });
  
    it('should get a specific store returning an immutable object', () => {
      Flux._useImmutable = true;
      const item = Flux.getStore('test');
      expect(item.get('item')).toBe('default');
    });
    
    it('should get a specific item within a store', () => {
      const item = Flux.getStore(['test', 'item']);
      expect(item).toBe('default');
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
      const cls = Flux._storeClasses.get('test');
      expect(cls.name).toBe('test');
    });

    it('should set the initial value', () => {
      const item = Flux._store.getIn(['test', 'item']);
      expect(item).toBe('default');
    });

    it('should return the class', () => {
      expect(store.name).toBe('test');
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

    it('should return the updated object', () => {
      expect(changedItem.getIn(['test', 'testUpdate'])).toBe('test');
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
