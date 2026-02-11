/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {jest} from '@jest/globals';

// Mock node-persist before importing
jest.mock('node-persist', () => ({
  __esModule: true,
  default: {
    init: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    setItem: jest.fn(() => Promise.resolve())
  }
}));

import PersistStorage from 'node-persist';

import {NodeStorage} from './NodeStorage.js';

describe('NodeStorage', () => {
  beforeAll(() => {
    new NodeStorage();
  });

  describe('.delPersistData', () => {
    let storageSpy;

    beforeAll(() => {
      storageSpy = jest.spyOn(PersistStorage, 'removeItem');
    });

    afterAll(() => {
      storageSpy.mockRestore();
    });

    it('should delete async data', async () => {
      await NodeStorage.delPersistData('test');
      expect(storageSpy.mock.calls.length).toBe(1);
    });
  });

  describe('.getPersistData', () => {
    let storageSpy;

    beforeAll(() => {
      storageSpy = jest.spyOn(PersistStorage, 'getItem');
    });

    afterAll(() => {
      storageSpy.mockRestore();
    });

    it('should get async data', async () => {
      await NodeStorage.getPersistData('test');
      expect(storageSpy.mock.calls.length).toBe(1);
    });
  });

  describe('.setPersistData', () => {
    let storageSpy;

    beforeAll(() => {
      storageSpy = jest.spyOn(PersistStorage, 'setItem');
    });

    afterAll(() => {
      storageSpy.mockRestore();
    });

    it('should set async data', async () => {
      await NodeStorage.setPersistData('test', 'hello world');
      expect(storageSpy.mock.calls.length).toBe(1);
    });
  });
});
