/**
 * Copyright (c) 2018, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

import {BrowserStorage} from '@nlabs/arkhamjs-storage-browser';
import {set} from 'lodash';
import {Store} from '../Store/Store';
import {Flux, FluxAction, FluxOptions} from './Flux';

describe('Flux', () => {
  let localSetSpy, sessionSetSpy, sessionSpy;
  const browserStorage = new BrowserStorage({type: 'session'});
  const cfg: FluxOptions = {
    name: 'arkhamjs',
    storage: browserStorage
  };

  class TestStore extends Store {
    constructor() {
      super('test');
    }

    initialState(): object {
      return {
        falsey: false,
        item: 'default',
        testAction: 'default',
        testUpdate: 'default',
        zeroValue: 0
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

  beforeAll(async () => {
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
    BrowserStorage.window.sessionStorage = storageMock();
    BrowserStorage.window.localStorage = storageMock();

    // Configure
    Flux.config(cfg);

    // Spy
    localSetSpy = jest.spyOn(BrowserStorage.window.localStorage, 'setItem');
    sessionSetSpy = jest.spyOn(BrowserStorage.window.sessionStorage, 'setItem');
    sessionSpy = jest.spyOn(BrowserStorage, 'setSessionData');

    // Method
    await Flux.registerStores([TestStore]);
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

  describe('#addMiddleware', () => {
    describe('should apply object middleware', () => {
      const middleTest: string = 'intercept object';

      beforeAll(() => {
        // Set test data
        Flux.setStore('test.testAction', 'default');

        // Add object middleware
        const objMiddleware = {
          name: 'objectMiddleware',
          preDispatch: (action) => ({...action, testVar: middleTest})
        };

        Flux.addMiddleware([objMiddleware]);

        // Dispatch an action
        Flux.dispatch({type: 'TEST_EVENT', testVar: 'hello world'});
      });

      afterAll(() => {
        Flux.clearMiddleware();
      });

      it('should alter data before sending to stores', () => {
        expect(Flux.getStore('test.testAction')).toEqual(middleTest);
      });
    });

    describe('should apply promise middleware', () => {
      const middleTest: string = 'intercept promise';

      beforeAll(() => {
        // Set test data
        Flux.setStore('test.testAction', 'default');

        // Add object middleware
        const promiseMiddleware = {
          name: 'promiseMiddleware',
          preDispatch: (action) => Promise.resolve({...action, testVar: middleTest})
        };

        Flux.addMiddleware([promiseMiddleware]);

        // Dispatch an action
        Flux.dispatch({type: 'TEST_EVENT', testVar: 'hello world'});
      });

      afterAll(() => {
        Flux.clearMiddleware();
      });

      it('should alter data before sending to stores', () => {
        expect(Flux.getStore('test.testAction')).toEqual(middleTest);
      });
    });

    describe('should apply post dispatch middleware', () => {
      const middleTest: string = 'intercept post';
      let postAction: FluxAction;

      beforeAll(async () => {
        // Set test data
        Flux.setStore('test.testAction', 'default');

        // Add object middleware
        const postMiddleware = {
          name: 'postMiddleware',
          postDispatch: (action) => Promise.resolve({...action, testVar: middleTest})
        };

        Flux.addMiddleware([postMiddleware]);

        // Dispatch an action
        postAction = await Flux.dispatch({type: 'TEST_EVENT', testVar: 'hello world'});
      });

      afterAll(() => {
        Flux.clearMiddleware();
      });

      it('should not alter store data', () => {
        expect(Flux.getStore('test.testAction')).toEqual('hello world');
      });

      it('should emit altered data', () => {
        expect(postAction.testVar).toEqual(middleTest);
      });
    });
  });

  describe('#clearAppData', () => {
    beforeAll(() => {
      sessionSpy.mockReset();

      // Set test data
      Flux.setStore('test.item', 'clear');

      // Method
      Flux.clearAppData();
    });

    it('should re-initialize session data', () => {
      expect(sessionSpy.mock.calls.length).toEqual(1);
    });

    it('should reset the store data', () => {
      expect(Flux.getStore(['test', 'item'])).toEqual('default');
    });
  });

  describe('#config', () => {
    // Vars
    const opts: FluxOptions = {
      name
    };

    beforeAll(() => {
      // Method
      Flux.config(opts);
    });

    afterAll(() => {
      Flux.config(cfg);
    });

    it('should set app name', () => {
      expect(Flux['options'].name).toEqual(opts.name);
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
      const item: string = Flux.getStore('test.testAction');
      expect(item).toEqual('test');
    });

    it('should dispatch an event', () => {
      expect(eventSpy.mock.calls.length).toEqual(2);
    });
  });

  describe('#getClass', () => {
    it('should get a store class', () => {
      const storeCls: Store = Flux.getClass('test');
      expect(storeCls.name).toEqual('test');
    });
  });

  describe('#getStore', () => {
    let initialState;

    beforeAll(() => {
      const storeCls: Store = Flux.getClass('test');
      initialState = storeCls.initialState();
      Flux.setStore('test', initialState);
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
      expect(value).toEqual({test: initialState});
    });

    it('should return a false value', () => {
      const value = Flux.getStore('test.falsey');
      expect(value).toEqual(false);
    });

    it('should return a zero value', () => {
      const value = Flux.getStore('test.zeroValue');
      expect(value).toEqual(0);
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

  describe('#removeMiddleware', () => {
    beforeAll(() => {
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
      expect(Flux['middleware'].preDispatchList.length).toEqual(0);
    });
  });

  describe('#setStore', () => {
    let newItem: string;

    beforeAll(async () => {
      await Flux.setStore('test.testUpdate', 'test');
      newItem = await Flux.getStore('test.testUpdate');
    });

    it('should update the property within the store', () => {
      expect(newItem).toEqual('test');
    });
  });
});
