import {expect} from 'chai';
import sinon from 'sinon';
import {Flux, Store} from '../src';

describe('Flux', () => {
  let store, localSetSpy, sessionSetSpy, sessionSpy;
  const val = 'hello_world';
  const key = 'test';
  const cfg = {
    debugLevel: Flux.DEBUG_DISPATCH,
    name: 'arkhamjs',
    useCache: true
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

  before(() => {
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
    localSetSpy = sinon.spy(Flux._window.localStorage, 'setItem');
    sessionSetSpy = sinon.spy(Flux._window.sessionStorage, 'setItem');
    sessionSpy = sinon.spy(Flux, 'setSessionData');

    // Method
    store = Flux.registerStore(TestStore);
  });

  after(() => {
    localSetSpy.restore();
    sessionSetSpy.restore();
    sessionSpy.restore();
  });

  describe('#clearAppData', () => {
    before(() => {
      // Spy
      sessionSpy.reset();

      // Set test data
      Flux.setStore(['test', 'item'], 'clear');

      // Method
      Flux.clearAppData();
    });

    it('should re-initialize session data', () => {
      return expect(sessionSpy.called).to.be.true;
    });

    it('should reset the store data', () => {
      return expect(Flux.getStore(['test', 'item'])).to.eq('default');
    });
  });

  describe('#config', () => {
    // Vars
    const opts = {
      debugLevel: 0,
      name,
      useCache: true
    };

    before(() => {
      // Method
      Flux.config(opts);
    });

    after(() => {
      Flux.config(cfg);
    });

    it('should remove session data', () => {
      return expect(Flux._debugLevel).to.eq(opts.debugLevel);
    });

    it('should remove session data', () => {
      return expect(Flux._name).to.eq(opts.name);
    });

    it('should remove session data', () => {
      return expect(Flux._useCache).to.eq(opts.useCache);
    });
  });

  describe('#debugError', () => {
    let consoleSpy;
    const msg = 'test';

    before(() => {
      // Spy
      consoleSpy = sinon.spy(console, 'error');

      // Method
      Flux.debugError(msg);
    });

    after(() => {
      consoleSpy.restore();
    });

    it('should send data to console.error', () => {
      return expect(consoleSpy.args[0][0]).to.eq(msg);
    });
  });

  describe('#debugInfo', () => {
    let consoleSpy;
    const msg = 'test';

    before(() => {
      // Spy
      consoleSpy = sinon.spy(console, 'info');

      // Method
      Flux.debugInfo(msg);
    });

    after(() => {
      consoleSpy.restore();
    });

    it('should send data to console.info', () => {
      return expect(consoleSpy.args[0][0]).to.eq(msg);
    });
  });

  describe('#debugLog', () => {
    let consoleSpy;
    const msg = 'test';

    before(() => {
      // Spy
      consoleSpy = sinon.spy(console, 'log');

      // Method
      Flux.debugLog(msg);
    });

    after(() => {
      consoleSpy.restore();
    });

    it('should send data to console.log', () => {
      return expect(consoleSpy.args[0][0]).to.eq(msg);
    });
  });

  describe('#delLocalData', () => {
    it('should remove local data', () => {
      // Method
      Flux.delLocalData(key);
      const testVal = Flux.getLocalData(key);
      return expect(testVal).to.be.null;
    });
  });

  describe('#delSessionData', () => {
    it('should remove session data', () => {
      // Method
      Flux.delSessionData(key);
      const testVal = Flux.getSessionData(key);
      return expect(testVal).to.be.null;
    });
  });

  describe('#deregisterStore', () => {
    before(() => {
      // Method
      Flux.deregisterStore('test');
    });

    after(() => {
      Flux.registerStore(TestStore);
    });

    it('should remove class', () => {
      return expect(Flux._storeClasses.has('test')).to.be.false;
    });

    it('should remove store data', () => {
      return expect(Flux._store.has('test')).to.be.false;
    });
  });

  describe('#dispatch', () => {
    let eventSpy;

    before(() => {
      // Spy
      eventSpy = sinon.spy();
      Flux.on('TEST_EVENT', eventSpy);

      // Method
      Flux.dispatch({type: 'TEST_EVENT', testVar: 'test'});
    });

    after(() => {
      Flux.off('TEST_EVENT', eventSpy);
    });

    it('should alter the store data', () => {
      const item = Flux.getStore(['test', 'testAction']);
      return expect(item).to.eq('test');
    });

    it('should dispatch an event', () => {
      return expect(eventSpy.called).to.be.true;
    });
  });

  describe('#enableDebugger', () => {
    it('should disable debugger', () => {
      Flux.enableDebugger(Flux.DEBUG_DISABLED);
      return expect(Flux._debugLevel).to.be.eq(0);
    });

    it('should enable debugger for logs', () => {
      Flux.enableDebugger(Flux.DEBUG_LOGS);
      return expect(Flux._debugLevel).to.be.eq(1);
    });

    it('should enable debugger for dispatch actions', () => {
      Flux.enableDebugger(Flux.DEBUG_DISPATCH);
      return expect(Flux._debugLevel).to.be.eq(2);
    });
  });

  describe('#getClass', () => {
    it('should get a class', () => {
      const cls = Flux.getClass('test');
      return expect(cls.name).to.eq('test');
    });
  });

  describe('#getLocalData', () => {
    it('should get local data', () => {
      // Set data
      Flux.setLocalData(key, val);

      // Method
      const testVal = Flux.getLocalData(key);
      return expect(testVal).to.eq(val);
    });
  });

  describe('#getSessionData', () => {
    it('should get session data', () => {
      // Method
      Flux.setSessionData(key, val);
      const testVal = Flux.getSessionData(key);
      return expect(testVal).to.eq(val);
    });
  });

  describe('#getStore', () => {
    it('should get a global store', () => {
      const item = Flux.getStore();
      return expect(item.getIn(['test', 'item'])).to.eq('default');
    });

    it('should get a specific store', () => {
      const item = Flux.getStore('test');
      return expect(item.get('item')).to.eq('default');
    });

    it('should get a specific item within a store', () => {
      const item = Flux.getStore(['test', 'item']);
      return expect(item).to.eq('default');
    });
  });

  describe('#off', () => {
    it('should remove a listener', () => {
      const spy = sinon.spy();
      Flux.on('test', spy);
      Flux.off('test', spy);
      Flux.dispatch({type: 'test'});

      return expect(spy.called).to.be.false;
    });
  });

  describe('#registerStore', () => {
    it('should save the class', () => {
      const cls = Flux._storeClasses.get('test');
      return expect(cls.name).to.eq('test');
    });

    it('should set the initial value', () => {
      const item = Flux._store.getIn(['test', 'item']);
      return expect(item).to.eq('default');
    });

    it('should save store in cache', () => {
      return expect(sessionSpy.called).to.be.true;
    });

    it('should return the class', () => {
      return expect(store.name).to.eq('test');
    });
  });

  describe('#setSessionData', () => {
    it('should set session data', () => {
      // Method
      Flux.setSessionData(key, val);
      return expect(sessionSetSpy.called).to.be.true;
    });
  });

  describe('#setStore', () => {
    let oldItem, changedItem, newItem;

    before(() => {
      oldItem = Flux.getStore(['test', 'testUpdate']);
      changedItem = Flux.setStore(['test', 'testUpdate'], 'test');
      newItem = Flux.getStore(['test', 'testUpdate']);
    });

    it('should have the original value', () => {
      return expect(oldItem).to.eq('default');
    });

    it('should return the updated object', () => {
      return expect(changedItem.getIn(['test', 'testUpdate'])).to.eq('test');
    });

    it('should update the property within the store', () => {
      return expect(newItem).to.eq('test');
    });
  });

  describe('#setLocalData', () => {
    it('should set local data', () => {
      // Method
      Flux.setLocalData(key, val);
      return expect(localSetSpy.called).to.be.true;
    });
  });
});