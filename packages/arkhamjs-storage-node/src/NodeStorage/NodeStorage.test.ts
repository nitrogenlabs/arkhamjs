/**
 * Copyright (c) 2018, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

import PersistStorage from 'node-persist';

import {NodeStorage} from './NodeStorage';

describe('NodeStorage', () => {
  beforeAll(() => {
    new NodeStorage();
  });

  describe('.delPersistData', () => {
    let storageSpy;

    beforeAll(() => {
      // Spy
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
      // Spy
      storageSpy = jest.spyOn(PersistStorage, 'getItem');
    });

    afterAll(() => {
      storageSpy.mockRestore();
    });

    it('should delete async data', async () => {
      await NodeStorage.getPersistData('test');
      expect(storageSpy.mock.calls.length).toBe(1);
    });
  });

  describe('.setPersistData', () => {
    let storageSpy;

    beforeAll(() => {
      // Spy
      storageSpy = jest.spyOn(PersistStorage, 'setItem');
    });

    afterAll(() => {
      storageSpy.mockRestore();
    });

    it('should delete async data', async () => {
      await NodeStorage.setPersistData('test', 'hello world');
      expect(storageSpy.mock.calls.length).toBe(1);
    });
  });
});
