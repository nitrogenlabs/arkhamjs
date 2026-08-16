/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {vi} from 'vitest';

// Mock AsyncStorage before importing NativeStorage
const mockStorage: Record<string, string> = {};

vi.mock('@react-native-async-storage/async-storage', () => {
  return {
    __esModule: true,
    default: {
      getItem: vi.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
        return Promise.resolve();
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
        return Promise.resolve();
      })
    }
  };
});

import {NativeStorage} from './NativeStorage.js';

describe('NativeStorage', () => {
  beforeEach(() => {
    // Clear storage before each test
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('should set async data', async () => {
    const hasExistingData = await NativeStorage.getAsyncData('test');
    expect(hasExistingData).toBeNull();

    const result = await NativeStorage.setAsyncData('test', 'hello world');
    expect(result).toBe(true);

    const hasNewData = await NativeStorage.getAsyncData('test');
    expect(hasNewData).toBe('hello world');
  });

  it('should delete async data', async () => {
    // First set some data
    await NativeStorage.setAsyncData('test', 'hello world');
    const hasExistingData = await NativeStorage.getAsyncData('test');
    expect(hasExistingData).toBe('hello world');

    const result = await NativeStorage.delAsyncData('test');
    expect(result).toBe(true);

    const hasNewData = await NativeStorage.getAsyncData('test');
    expect(hasNewData).toBeNull();
  });
});
