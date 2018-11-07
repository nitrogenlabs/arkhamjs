/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {set} from 'lodash';

import {Store} from '../Store/Store';
import {FluxAction, FluxOptions} from '../types/flux';
import {Flux} from './Flux';

class TestStore extends Store {
  constructor() {
    super('helloWorld');
  }

  initialState(): object {
    return {
      falsy: false,
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

describe('Flux', () => {
  const cfg: FluxOptions = {
    name: 'arkhamjsTest',
    stores: [TestStore]
  };

  beforeAll(async () => {
    // Configure
    await Flux.init(cfg);
  });

  describe('#addMiddleware', () => {
    describe('should apply object middleware', () => {
      const middleTest: string = 'intercept object';

      beforeAll(() => {
        // Set test data
        Flux.setState('helloWorld.testAction', 'default');

        // Add object middleware
        const objMiddleware = {
          name: 'objectMiddleware',
          preDispatch: (action) => ({...action, testVar: middleTest})
        };

        Flux.addMiddleware([objMiddleware]);

        // Dispatch an action
        Flux.dispatch({testVar: 'hello world', type: 'TEST_EVENT'});
      });

      afterAll(() => {
        Flux.clearMiddleware();
      });

      it('should alter data before sending to stores', () => {
        expect(Flux.getState('helloWorld.testAction')).toEqual(middleTest);
      });
    });

    describe('should apply promise middleware', () => {
      const middleTest: string = 'intercept promise';

      beforeAll(() => {
        // Set test data
        Flux.setState('helloWorld.testAction', 'default');

        // Add object middleware
        const promiseMiddleware = {
          name: 'promiseMiddleware',
          preDispatch: (action) => Promise.resolve({...action, testVar: middleTest})
        };

        Flux.addMiddleware([promiseMiddleware]);

        // Dispatch an action
        Flux.dispatch({testVar: 'hello world', type: 'TEST_EVENT'});
      });

      afterAll(() => {
        Flux.clearMiddleware();
      });

      it('should alter data before sending to stores', () => {
        expect(Flux.getState('helloWorld.testAction')).toEqual(middleTest);
      });
    });

    describe('should apply post dispatch middleware', () => {
      const middleTest: string = 'intercept post';
      let postAction: FluxAction;

      beforeAll(async () => {
        // Set test data
        Flux.setState('helloWorld.testAction', 'default');

        // Add object middleware
        const postMiddleware = {
          name: 'postMiddleware',
          postDispatch: (action) => Promise.resolve({...action, testVar: middleTest})
        };

        Flux.addMiddleware([postMiddleware]);

        // Dispatch an action
        postAction = await Flux.dispatch({testVar: 'hello world', type: 'TEST_EVENT'});
      });

      afterAll(() => {
        Flux.clearMiddleware();
      });

      it('should not alter store data', () => {
        expect(Flux.getState('helloWorld.testAction')).toEqual('hello world');
      });

      it('should emit altered data', () => {
        expect(postAction.testVar).toEqual(middleTest);
      });
    });
  });

  describe('#clearAppData', () => {
    beforeAll(() => {
      // Set test data
      Flux.setState('helloWorld.item', 'clear');

      // Method
      Flux.clearAppData();
    });

    it('should reset the store data', () => {
      expect(Flux.getState(['helloWorld', 'item'])).toEqual('default');
    });
  });

  describe('#removeStores', () => {
    beforeAll(() => {
      // Method
      Flux.removeStores(['test']);
    });

    afterAll(() => {
      Flux.addStores([TestStore]);
    });

    it('should remove class', () => {
      const privateProperty: string = 'storeClasses';
      expect(!!Flux[privateProperty].test).toEqual(false);
    });

    it('should remove store data', () => {
      const privateProperty: string = 'state';
      expect(!!Flux[privateProperty].test).toEqual(false);
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
      Flux.dispatch({testVar: 'test', type: 'TEST_EVENT'});
    });

    afterAll(() => {
      Flux.off('TEST_EVENT', eventSpy);
    });

    it('should return an action', () => {
      action = Flux.dispatch({testVar: 'test', type: 'TEST_EVENT'});
      expect(action).resolves.toEqual({testVar: 'test', type: 'TEST_EVENT'});
    });

    it('should alter the store data', () => {
      const item: string = Flux.getState('helloWorld.testAction');
      expect(item).toEqual('test');
    });

    it('should dispatch an event', () => {
      expect(eventSpy.mock.calls.length).toEqual(2);
    });
  });

  describe('#getClass', () => {
    it('should get a store class', () => {
      const storeCls: Store = Flux.getClass('helloWorld');
      expect(storeCls.name).toEqual('helloWorld');
    });
  });

  describe('#getState', () => {
    let initialState;

    beforeAll(() => {
      const storeCls: Store = Flux.getClass('helloWorld');
      initialState = storeCls.initialState();
      Flux.setState('helloWorld', initialState);
    });

    it('should get a global store', () => {
      const value = Flux.getState();
      expect(value.helloWorld.item).toEqual('default');
    });

    it('should get a specific store returning an object', () => {
      const value = Flux.getState('helloWorld');
      expect(value.item).toEqual('default');
    });

    it('should get a specific item within a store using array', () => {
      const value: string = Flux.getState(['helloWorld', 'item']);
      expect(value).toEqual('default');
    });

    it('should get a specific item within a store using dot notation', () => {
      const value: string = Flux.getState('helloWorld.item');
      expect(value).toEqual('default');
    });

    it('should return default value from a null item', () => {
      const value: string = Flux.getState('helloWorld.notDefault', '');
      expect(value).toEqual('');
    });

    it('should return entire store object with empty key', () => {
      const value: string = Flux.getState('');
      expect(value).toEqual({helloWorld: initialState});
    });

    it('should return a false value', () => {
      const value = Flux.getState('helloWorld.falsy');
      expect(value).toEqual(false);
    });

    it('should return a zero value', () => {
      const value = Flux.getState('helloWorld.zeroValue');
      expect(value).toEqual(0);
    });
  });

  describe('#init', () => {
    // Vars
    const opts: FluxOptions = {
      name: 'demo'
    };

    describe('set app name', () => {
      beforeEach(() => {
        const privateProperty: string = 'options';
        Flux[privateProperty].name = cfg.name;
      });

      afterAll(() => {
        const privateInit: string = 'isInit';
        Flux[privateInit] = true;

        Flux.init(cfg);

        const privateProperty: string = 'options';
        Flux[privateProperty].name = cfg.name;
      });

      it('should update app name if initializing for the first time', () => {
        const privateInit: string = 'isInit';
        Flux[privateInit] = false;

        // Method
        Flux.init(opts);

        const privateProperty: string = 'options';
        expect(Flux[privateProperty].name).toEqual('demo');
      });

      it('should not update app name if initializing again', () => {
        const privateInit: string = 'isInit';
        Flux[privateInit] = true;

        // Method
        Flux.init(opts);

        const privateProperty: string = 'options';
        expect(Flux[privateProperty].name).toEqual('arkhamjsTest');
      });
    });

    describe('set app name for initialized app', () => {
      // Vars
      const opts: FluxOptions = {
        name: 'demo'
      };

      beforeAll(() => {
        // Method
        Flux.init(opts);
      });

      afterAll(() => {
        Flux.init(cfg, true);
      });

      it('should set app name', () => {
        const privateProperty: string = 'options';
        expect(Flux[privateProperty].name).toEqual('arkhamjsTest');
      });
    });

    describe('set initial empty state', () => {
      // Vars
      const opts: FluxOptions = {
        state: {},
        stores: [TestStore]
      };

      beforeAll(() => {
        // Method
        Flux.init(opts, true);
      });

      afterAll(() => {
        Flux.init(cfg, true);
      });

      it('should set state', () => {
        const privateProperty: string = 'state';
        expect(Object.keys(Flux[privateProperty]).length).toEqual(1);
      });

      it('should set state branch for store', () => {
        const privateProperty: string = 'state';
        expect(Flux[privateProperty].helloWorld.item).toEqual('default');
      });
    });

    describe('set null state', () => {
      // Vars
      const opts: FluxOptions = {
        state: null,
        stores: [TestStore]
      };

      beforeAll(() => {
        // Method
        Flux.init(opts, true);
      });

      afterAll(() => {
        Flux.init(cfg, true);
      });

      it('should set state', () => {
        const privateProperty: string = 'state';
        expect(Object.keys(Flux[privateProperty]).length).toEqual(1);
      });

      it('should set state branch for store', () => {
        const privateProperty: string = 'state';
        expect(Flux[privateProperty].helloWorld.item).toEqual('default');
      });
    });

    describe('set defined state', () => {
      // Vars
      const opts: FluxOptions = {
        state: {second: 'value', test: {hello: 'world'}},
        stores: [TestStore]
      };

      beforeAll(() => {
        // Method
        Flux.init(opts, true);
      });

      afterAll(() => {
        Flux.init(cfg, true);
      });

      it('should set state', () => {
        const privateProperty: string = 'state';
        expect(Object.keys(Flux[privateProperty]).length).toEqual(3);
      });

      it('should set state branch for store', () => {
        const privateProperty: string = 'state';
        expect(Flux[privateProperty].test.hello).toEqual('world');
      });
    });
  });

  describe('event listeners', () => {
    let eventSpy;

    beforeAll(() => {
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

        expect(eventSpy.mock.calls.length).toEqual(1);
      });
    });
  });

  describe('#on', () => {
    it('should add a listener', () => {
      const spy = jest.fn();
      Flux.on('test', spy);
      Flux.off('test', spy);
      Flux.dispatch({type: 'test'});

      expect(spy.mock.calls.length).toEqual(0);
    });
  });

  describe('#addStores', () => {
    describe('add classes', () => {
      it('should save the store class', () => {
        const privateProperty: string = 'storeClasses';
        const storeCls: Store = Flux[privateProperty].helloWorld;
        expect(storeCls.name).toEqual('helloWorld');
      });

      it('should set the initial value', () => {
        const privateProperty: string = 'state';
        const value: string = Flux[privateProperty].helloWorld.item;
        expect(value).toEqual('default');
      });
    });

    describe('add functions', () => {
      beforeAll(() => {
        const demo = (type, data, state = {helloWorld: 'joker'}) => {
          if(type === 'DEMO_TEST') {
            state.helloWorld = data.helloWorld;
          }

          return state;
        };

        Flux.addStores([demo]);
      });

      it('should create and save a Store class', () => {
        const privateProperty: string = 'storeClasses';
        const storeCls: Store = Flux[privateProperty].demo;
        expect(storeCls.name).toEqual('demo');
      });

      it('should set default state', () => {
        const privateProperty: string = 'storeClasses';
        const storeCls: Store = Flux[privateProperty].demo;
        expect(storeCls.defaultState).toEqual({helloWorld: 'joker'});
      });

      it('should set initial state', () => {
        const privateProperty: string = 'storeClasses';
        const storeCls: Store = Flux[privateProperty].demo;
        expect(storeCls.initialState()).toEqual({helloWorld: 'joker'});
      });

      // it('should be able to update on action dispatch', async () => {
      //   await Flux.dispatch({type: 'DEMO_TEST', helloWorld: 'test'});
      //   const value: string = Flux.getState('demo.helloWorld');
      //   expect(value).toEqual('test');
      // });
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
      const privateProperty: string = 'middleware';
      expect(Flux[privateProperty].preDispatchList.length).toEqual(0);
    });
  });

  describe('#setState', () => {
    let newItem: string;

    beforeAll(async () => {
      await Flux.setState('helloWorld.testUpdate', 'test');
      newItem = await Flux.getState('helloWorld.testUpdate');
    });

    it('should update the property within the store', () => {
      expect(newItem).toEqual('test');
    });
  });
});
