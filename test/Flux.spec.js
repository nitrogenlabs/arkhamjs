import {expect} from 'chai';
import sinon from 'sinon';
import {Flux, Store} from '../src';

describe('Flux', () => {
  let store, localSetSpy, sessionSetSpy, sessionSpy;
  const val = 'hello_world';
  const key = 'test';

  class TestStore extends Store {
    constructor() {
      super('test');
    }

    initialState() {
      return {
        item: 'default',
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
    Flux._useCache = true;

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

  describe('#off', () => {
    it('should remove a listener', () => {
      const spy = sinon.spy();
      Flux.on('test', spy);
      Flux.off('test', spy);
      Flux.dispatch({type: 'test'});

      return expect(spy.called).to.be.false;
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

  describe('#getClass', () => {
    it('should get a class', () => {
      const cls = Flux.getClass('test');
      return expect(cls.name).to.eq('test');
    });
  });

  describe('#enableDebugger', () => {
    it('should enable debugger', () => {
      Flux.enableDebugger();
      return expect(Flux._debug).to.be.true;
    });

    it('should disable debugger', () => {
      Flux.enableDebugger(false);
      return expect(Flux._debug).to.be.false;
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

  describe('#setSessionData', () => {
    it('should set session data', () => {
      // Method
      Flux.setSessionData(key, val);
      return expect(sessionSetSpy.called).to.be.true;
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

  describe('#delSessionData', () => {
    it('should remove session data', () => {
      // Method
      Flux.delSessionData(key);
      const testVal = Flux.getSessionData(key);
      return expect(testVal).to.be.null;
    });
  });

  describe('#setLocalData', () => {
    it('should set local data', () => {
      // Method
      Flux.setLocalData(key, val);
      return expect(localSetSpy.called).to.be.true;
    });
  });

  describe('#getLocalData', () => {
    it('should get local data', () => {
      // Method
      const testVal = Flux.getLocalData(key);
      return expect(testVal).to.eq(val);
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
});