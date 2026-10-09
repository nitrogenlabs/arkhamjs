/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import AsyncStorageModule from '@react-native-async-storage/async-storage';

import type {NativeSessionStorageOptions, NativeStorageBackend, NativeStorageOptions, NativeStorageUpdater} from './NativeStorage.types.js';

// Both supported dependency generations implement the public string storage boundary.
const AsyncStorage: NativeStorageBackend = AsyncStorageModule;

export class NativeStorage {
  private updating = false;

  private updateReentered = false;

  private options: NativeStorageOptions = {};

  private pending: Promise<unknown> = Promise.resolve();

  private persisted = new Map<string, string | null>();

  constructor(options: NativeStorageOptions = {}) {
    this.updateStorageData = this.updateStorageData.bind(this);
    this.getStorageData = this.getStorageData.bind(this);
    this.setStorageData = this.setStorageData.bind(this);
    this.clearStorageData = this.clearStorageData.bind(this);
    this.options = {...this.options, ...options};
  }

  /** The caller supplies Keychain/Keystore-backed storage; this never falls back to AsyncStorage. */
  static forSession(options: NativeSessionStorageOptions): NativeStorage {
    const backend = options?.backend;
    if(!backend || typeof backend.getItem !== 'function' || typeof backend.setItem !== 'function'
      || typeof backend.removeItem !== 'function') {
      throw new TypeError('Session storage requires an explicit secure backend.');
    }
    if(typeof options.namespace !== 'string' || !/^[A-Za-z0-9._-]+$/.test(options.namespace)) {
      throw new TypeError('Session storage requires a namespace containing letters, numbers, dots, hyphens or underscores.');
    }
    if(typeof options.select !== 'function' || typeof options.validate !== 'function') {
      throw new TypeError('Session storage requires a projection and restore validator.');
    }
    return new NativeStorage({...options, skipUnchanged: options.skipUnchanged ?? true, throwOnError: true});
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

  /** Ordered within this instance; callback must be synchronous, pure and non-reentrant. */
  updateStorageData(key: string, updater: NativeStorageUpdater): Promise<boolean> {
    return this.enqueue(async () => {
      // Invalid restored data rejects without deleting it: failed updates never commit.
      this.updateReentered = false;
      const current = await this.readStorageData(key, false);
      let serialized: string | undefined;
      let explicitClear: boolean;
      this.updating = true;
      try {
        const decision = updater(current);
        if(decision instanceof Promise) {
          // Misused async callbacks must not leak an unhandled rejection. They never commit.
          void decision.catch(() => undefined);
        }
        if(!decision || typeof decision !== 'object' || 'then' in decision || !('value' in decision)) {
          throw new TypeError('Storage updater must return a synchronous value decision.');
        }
        if(this.updateReentered) {
          throw new TypeError('Storage operations cannot be invoked from an update callback.');
        }
        const {value} = decision;
        this.assertSynchronous(value);
        const selected = this.options.select && value !== undefined ? this.options.select(value) : value;
        this.assertSynchronous(selected);
        if(selected !== undefined && this.options.validate && this.options.validate(selected) !== true) {
          throw new TypeError('Updated data failed validation.');
        }
        // Snapshot all synchronous callback/projection output before backend persistence.
        serialized = JSON.stringify(selected);
        explicitClear = value === undefined;
        if(this.updateReentered) {
          throw new TypeError('Storage operations cannot be invoked from an update callback.');
        }
      } finally {
        this.updating = false;
      }
      return this.writeStorageData(key, serialized, explicitClear);
    }, false);
  }

  private assertSynchronous(value: unknown): void {
    if(value !== null && (typeof value === 'object' || typeof value === 'function') && 'then' in value) {
      if(value instanceof Promise) {
        void value.catch(() => undefined);
      }
      throw new TypeError('Storage update values and projections must be synchronous.');
    }
  }

  private assertNotUpdating(): void {
    if(this.updating) {
      this.updateReentered = true;
      throw new TypeError('Storage operations cannot be invoked from an update callback.');
    }
  }

  private enqueue<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    this.assertNotUpdating();
    const result = this.pending.then(operation).catch((error) => {
      // A backend can fail after changing data. Never trust cached writes after an error.
      this.persisted.clear();
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

  private async readStorageData(key: string, removeInvalid = true): Promise<unknown> {
    const backend = this.options.backend ?? AsyncStorage;
    const storageKey = this.storageKey(key);
    const value = await backend.getItem(storageKey);
    if(value === null) {
      if(this.options.skipUnchanged) {
        this.persisted.set(storageKey, null);
      }
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
    let selected: unknown;
    let valid: boolean;
    // Only synchronous update restore hooks are guarded; native I/O remains externally enqueueable.
    if(!removeInvalid) {
      this.updating = true;
    }
    try {
      selected = this.options.select ? this.options.select(data) : data;
      if(!removeInvalid) {
        this.assertSynchronous(selected);
        if(this.updateReentered) {
          throw new TypeError('Storage operations cannot be invoked from an update callback.');
        }
      }
      valid = !this.options.validate || this.options.validate(selected) === true;
      if(!removeInvalid && this.updateReentered) {
        throw new TypeError('Storage operations cannot be invoked from an update callback.');
      }
    } finally {
      if(!removeInvalid) {
        this.updating = false;
      }
    }
    if(!valid) {
      if(!removeInvalid) {
        throw new TypeError('Stored data failed validation.');
      }
      this.persisted.delete(storageKey);
      await backend.removeItem(storageKey);
      if(this.options.skipUnchanged) {
        this.persisted.set(storageKey, null);
      }
      return null;
    }
    if(this.options.skipUnchanged) {
      // Keep the raw value so a subsequent save still removes unselected legacy fields.
      this.persisted.set(storageKey, value);
    }
    return selected;
  }

  getStorageData(key: string): Promise<any> {
    return this.enqueue(() => this.readStorageData(key), null);
  }

  setStorageData(key: string, value: unknown): Promise<boolean> {
    this.assertNotUpdating();
    // Snapshot immediately, before another Flux update mutates state or waits on the backend.
    let serialized: string | undefined;
    try {
      const selected = this.options.select && value !== undefined ? this.options.select(value) : value;
      serialized = JSON.stringify(selected);
    } catch(error) {
      return this.enqueue(async () => { throw error; }, false);
    }
    return this.enqueue(() => this.writeStorageData(key, serialized, value === undefined), false);
  }

  private async writeStorageData(
    key: string, serialized: string | undefined, explicitClear: boolean
  ): Promise<boolean> {
    const backend = this.options.backend ?? AsyncStorage;
    const storageKey = this.storageKey(key);
    if(serialized === undefined) {
      // A missing projected session can remain absent across unrelated Flux updates.
      // Explicit clears (undefined input) must always reach the backend.
      if(!explicitClear && this.options.skipUnchanged && this.persisted.get(storageKey) === null) {
        return true;
      }
      this.persisted.delete(storageKey);
      await backend.removeItem(storageKey);
      if(this.options.skipUnchanged) {
        this.persisted.set(storageKey, null);
      }
    } else {
      if(this.options.skipUnchanged && this.persisted.get(storageKey) === serialized) {
        return true;
      }
      await backend.setItem(storageKey, serialized);
      if(this.options.skipUnchanged) {
        this.persisted.set(storageKey, serialized);
      }
    }
    return true;
  }

  /** Delete regardless of projection, ordered after earlier reads and writes. */
  clearStorageData(key: string): Promise<boolean> {
    return this.setStorageData(key, undefined);
  }
}
