/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import AsyncStorage from '@react-native-community/async-storage';

import {NativeStorage} from './NativeStorage';

describe('NativeStorage', () => {
  const asyncUtil = require('@react-native-community/async-storage');
  let asyncStorage;
  let cache = {};

  beforeAll(() => {
    asyncStorage = asyncUtil.default;
    asyncUtil.default = {
      clear: () => new Promise((resolve) => resolve(cache = {})),
      getAllKeys: () => new Promise((resolve) => resolve(Object.keys(cache))),
      getItem: (key) => new Promise((resolve) => (cache.hasOwnProperty(key)
        ? resolve(cache[key])
        : resolve(null))),
      removeItem: (key) => new Promise((resolve, reject) => (cache.hasOwnProperty(key)
        ? resolve(delete cache[key])
        : reject('No such key!'))),
      setItem: (key, value) => new Promise((resolve, reject) => ((typeof key !== 'string' || typeof value !== 'string')
        ? reject(new Error('key and value must be string'))
        : resolve(cache[key] = value)))
    };
  });

  afterEach(() => {
    asyncUtil.default = asyncStorage;
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
