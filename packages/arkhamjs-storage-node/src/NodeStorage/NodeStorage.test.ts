/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {vi} from 'vitest';

// Mock node-persist before importing
vi.mock('node-persist', () => ({
  __esModule: true,
  default: {
    init: vi.fn(() => Promise.resolve()),
    getItem: vi.fn(() => Promise.resolve(null)),
    removeItem: vi.fn(() => Promise.resolve()),
    setItem: vi.fn(() => Promise.resolve())
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
      storageSpy = vi.spyOn(PersistStorage, 'removeItem');
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
      storageSpy = vi.spyOn(PersistStorage, 'getItem');
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
      storageSpy = vi.spyOn(PersistStorage, 'setItem');
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
