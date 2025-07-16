/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {Flux} from '@nlabs/arkhamjs';
import {set} from '@nlabs/utils';

import {LoggerDebugLevel} from '../types/main';
import {Logger} from './Logger';

import type {FluxAction} from '@nlabs/arkhamjs';
import type {LoggerOptions} from '../types/main';

const test = (type: string, data, state = {hello: 'world'}) => {
  switch(type) {
    case 'TEST_EVENT':
      return set(state, 'testAction', data.testVar);
    default:
      return state;
  }
};

describe('Logger', () => {
  const cfg: LoggerOptions = {debugLevel: LoggerDebugLevel.DISPATCH};
  const logger: Logger = new Logger(cfg);
  const testAction: FluxAction = {hello: 'world', type: 'TEST_EVENT'};

  beforeAll(async () => {
    await Flux.init({
      stores: [test]
    });
  });

  describe('#config', () => {
    // Vars
    const opts: LoggerOptions = {
      debugLevel: 0
    };

    beforeAll(() => {
      // Method
      logger.config(opts);
    });

    afterAll(() => {
      logger.config(cfg);
    });

    it('should set debugLevel', () => {
      const privateProperty: string = 'options';
      expect(logger[privateProperty].debugLevel).toEqual(opts.debugLevel);
    });
  });

  describe('#debugError', () => {
    let consoleSpy;
    const msg: string = 'test';

    beforeAll(() => {
      // Spy
      consoleSpy = jest.spyOn(console, 'error');

      // Method
      logger.debugError(msg);
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
      logger.debugInfo(msg);
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
      logger.debugLog(msg);
    });

    afterAll(() => {
      consoleSpy.mockRestore();
    });

    it('should send data to console.log', () => {
      expect(consoleSpy.mock.calls[0][0]).toEqual(msg);
    });
  });

  describe('#enableDebugger', () => {
    it('should disable debugger', () => {
      logger.enableDebugger(LoggerDebugLevel.DISABLED);
      const options: LoggerOptions = logger.getOptions();
      expect(options.debugLevel).toEqual(0);
    });

    it('should enable debugger for logs', () => {
      logger.enableDebugger(LoggerDebugLevel.LOGS);
      const options: LoggerOptions = logger.getOptions();
      expect(options.debugLevel).toEqual(1);
    });

    it('should enable debugger for dispatch actions', () => {
      logger.enableDebugger(LoggerDebugLevel.DISPATCH);
      const options: LoggerOptions = logger.getOptions();
      expect(options.debugLevel).toEqual(2);
    });
  });

  describe('#preDispatch', () => {
    it('should update the previous store', () => {
      const testStore = {test: 'test'};
      const privateProperty: string = 'previousStore';
      logger.preDispatch(testAction, testStore);
      expect(JSON.stringify(logger[privateProperty])).toEqual(JSON.stringify(testStore));
    });
  });

  describe('#postDispatch', () => {
    let consoleSpy;
    const prevStore = {test: 'previous'};
    const nextStore = {test: 'next'};

    beforeEach(() => {
      // Spy
      consoleSpy = jest.spyOn(console, 'log');
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should dispatch logs for a changed state', () => {
      // Method
      logger.preDispatch(testAction, prevStore);
      logger.postDispatch(testAction, nextStore);

      // expect(consoleSpy.mock.calls[0][0]).toEqual('%c Action: ');
      // expect(consoleSpy.mock.calls[0][2]).toEqual(testAction);
      // expect(consoleSpy.mock.calls[1][0]).toEqual('%c Last State: ');
      // expect(consoleSpy.mock.calls[1][2]).toEqual(prevStore);
      expect(consoleSpy.mock.calls[2][0]).toEqual('%c Changed State: ');
      expect(consoleSpy.mock.calls[2][2]).toEqual(nextStore);
    });

    // it('should dispatch logs for an unchanged state', () => {
    //   // Method
    //   logger.preDispatch(testAction, prevStore);
    //   logger.postDispatch(testAction, prevStore);

    //   expect(consoleSpy.mock.calls[0][0]).toEqual('%c Action: ');
    //   expect(consoleSpy.mock.calls[0][2]).toEqual(testAction);
    //   expect(consoleSpy.mock.calls[1][0]).toEqual('%c Last State: ');
    //   expect(consoleSpy.mock.calls[1][2]).toEqual(prevStore);
    //   expect(consoleSpy.mock.calls[2][0]).toEqual('%c Unchanged State: ');
    //   expect(consoleSpy.mock.calls[2][2]).toEqual(prevStore);
    // });
  });
});
