/**
 * Copyright (c) 2018, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {AsyncStorage} from 'react-native';

import {NativeStorage} from './NativeStorage';

describe('NativeStorage', () => {
  // beforeAll(() => {
  //   const mockImpl = new MockAsyncStorage();
  //   jest.mock('AsyncStorage', () => mockImpl);
  // });

  afterAll(() => {
    // release();
  });

  describe('.delAsyncData', () => {
    let storageSpy;

    beforeAll(() => {
      // Spy
      storageSpy = jest.spyOn(AsyncStorage, 'removeItem');
    });

    afterAll(() => {
      storageSpy.mockRestore();
    });

    it('should delete async data', async () => {
      await NativeStorage.delAsyncData('test');
      expect(storageSpy.mock.calls.length).toBe(1);
    });
  });

  describe('.getAsyncData', () => {
    let storageSpy;

    beforeAll(() => {
      // Spy
      storageSpy = jest.spyOn(AsyncStorage, 'getItem');
    });

    afterAll(() => {
      storageSpy.mockRestore();
    });

    it('should delete async data', async () => {
      await NativeStorage.getAsyncData('test');
      expect(storageSpy.mock.calls.length).toBe(1);
    });
  });

  describe('.setAsyncData', () => {
    let storageSpy;

    beforeAll(() => {
      // Spy
      storageSpy = jest.spyOn(AsyncStorage, 'setItem');
    });

    afterAll(() => {
      storageSpy.mockRestore();
    });

    it('should delete async data', async () => {
      await NativeStorage.setAsyncData('test', 'hello world');
      expect(storageSpy.mock.calls.length).toBe(1);
    });
  });
});
