/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import type {AsyncStorage as AsyncStorageType} from '@react-native-async-storage/async-storage';
import AsyncStorageModule from '@react-native-async-storage/async-storage';

import {NativeStorageOptions} from './NativeStorage.types.js';

// Type assertion needed for NodeNext module resolution with AsyncStorage
const AsyncStorage = AsyncStorageModule as AsyncStorageType;

export class NativeStorage {
  private options: NativeStorageOptions = {};

  private pending: Promise<unknown> = Promise.resolve();

  constructor(options: NativeStorageOptions = {}) {
    this.getStorageData = this.getStorageData.bind(this);
    this.setStorageData = this.setStorageData.bind(this);
    this.options = {...this.options, ...options};
  }

  static delAsyncData(key: string): Promise<boolean> {
    try {
      return AsyncStorage.removeItem(key)
        .then(() => Promise.resolve(true))
        .catch(() => Promise.resolve(false));
    } catch(error) {
      return Promise.resolve(false);
    }
  }

  static getAsyncData(key: string): Promise<any> {
    try {
      return AsyncStorage.getItem(key)
        .then((value: string | null) => {
          if(value === null) {
            return null;
          }
          try {
            return JSON.parse(value);
          } catch {
            // If parsing fails, return the value as-is (backward compatibility)
            return value;
          }
        })
        .catch(() => Promise.resolve(null));
    } catch(error) {
      return Promise.resolve(null);
    }
  }

  static setAsyncData(key: string, value: unknown): Promise<boolean> {
    const updatedValue = value !== undefined ? JSON.stringify(value) : '';

    try {
      return AsyncStorage.setItem(key, updatedValue)
        .then(() => true)
        .catch(() => Promise.resolve(false));
    } catch(error) {
      return Promise.resolve(false);
    }
  }

  private enqueue<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    const result = this.pending.then(operation).catch((error) => {
      if(this.options.throwOnError) {
        throw error;
      }
      return fallback;
    });
    // A failed operation must reject its caller without blocking future clear/retry calls.
    this.pending = result.catch(() => undefined);
    return result;
  }

  private storageKey(key: string): string {
    return this.options.namespace ? `${this.options.namespace}.${key}` : key;
  }

  getStorageData(key: string): Promise<any> {
    return this.enqueue(async () => {
      const backend = this.options.backend ?? AsyncStorage;
      const value = await backend.getItem(this.storageKey(key));
      if(value === null) {
        return null;
      }
      let data: unknown;
      try {
        data = JSON.parse(value);
      } catch(error) {
        if(this.options.throwOnError) {
          throw error;
        }
        data = value;
      }
      return this.options.select ? this.options.select(data) : data;
    }, null);
  }

  setStorageData(key: string, value: unknown): Promise<boolean> {
    // Snapshot immediately, before another Flux update mutates state or waits on the backend.
    let serialized: string | undefined;
    try {
      const selected = this.options.select && value !== undefined ? this.options.select(value) : value;
      serialized = JSON.stringify(selected);
    } catch(error) {
      return this.enqueue(async () => { throw error; }, false);
    }
    return this.enqueue(async () => {
      const backend = this.options.backend ?? AsyncStorage;
      if(serialized === undefined) {
        await backend.removeItem(this.storageKey(key));
      } else {
        await backend.setItem(this.storageKey(key), serialized);
      }
      return true;
    }, false);
  }
}
