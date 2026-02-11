/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import type {
  BrowserStorageOptions,
  StorageData,
  StorageInterface
} from '../types/main.js';

const DEFAULT_PREFIX = 'arkhamjs_';
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

const isExpired = (data: StorageData): boolean => {
  if(!data.ttl) {
    return false;
  }
  return Date.now() - data.timestamp > data.ttl;
};

const getStorageSize = (data: string): number => new Blob([data]).size;

const compressData = (data: any): string => {
  const jsonString = JSON.stringify(data);
  if(jsonString.length > 1000) {
    return jsonString;
  }
  return jsonString;
};

const decompressData = (data: string): any => {
  try {
    return JSON.parse(data);
  } catch{
    return null;
  }
};

export class BrowserStorage {
  private static readonly window: Window & typeof globalThis =
    typeof window !== 'undefined' ? window : {} as any;

  private readonly options: Required<BrowserStorageOptions>;
  private readonly storageCache = new Map<string, any>();
  private readonly storage: StorageInterface | null;

  constructor(options: BrowserStorageOptions = {}) {
    this.options = {
      compression: false,
      maxSize: DEFAULT_MAX_SIZE,
      prefix: DEFAULT_PREFIX,
      ttl: DEFAULT_TTL,
      type: 'session',
      ...options
    };

    this.storage = this.getStorage();
  }

  static delLocalData(key: string): boolean {
    try {
      const storage = BrowserStorage.window.localStorage;
      if(storage) {
        storage.removeItem(key);
        return true;
      }
    } catch{
      // Storage not available
    }
    return false;
  }

  static delSessionData(key: string): boolean {
    try {
      const storage = BrowserStorage.window.sessionStorage;
      if(storage) {
        storage.removeItem(key);
        return true;
      }
    } catch{
      // Storage not available
    }
    return false;
  }

  static getLocalData(key: string): any {
    try {
      const storage = BrowserStorage.window.localStorage;
      if(storage) {
        const item = storage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch{
      // Storage not available or invalid JSON
    }
    return null;
  }

  static getSessionData(key: string): any {
    try {
      const storage = BrowserStorage.window.sessionStorage;
      if(storage) {
        const item = storage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
    } catch{
      // Storage not available or invalid JSON
    }
    return null;
  }

  static setLocalData(key: string, value: any): boolean {
    try {
      const storage = BrowserStorage.window.localStorage;
      if(storage) {
        storage.setItem(key, JSON.stringify(value));
        return true;
      }
    } catch{
      // Storage not available or quota exceeded
    }
    return false;
  }

  static setSessionData(key: string, value: any): boolean {
    try {
      const storage = BrowserStorage.window.sessionStorage;
      if(storage) {
        storage.setItem(key, JSON.stringify(value));
        return true;
      }
    } catch{
      // Storage not available or quota exceeded
    }
    return false;
  }

  static getLocalStorage(): Storage | null {
    try {
      return BrowserStorage.window.localStorage || null;
    } catch{
      return null;
    }
  }

  static getSessionStorage(): Storage | null {
    try {
      return BrowserStorage.window.sessionStorage || null;
    } catch{
      return null;
    }
  }

  async getStorageData(key: string): Promise<any> {
    if(!this.isStorageAvailable()) {
      return null;
    }

    const prefixedKey = this.getPrefixedKey(key);

    if(this.storageCache.has(prefixedKey)) {
      return this.storageCache.get(prefixedKey);
    }

    try {
      const item = this.storage!.getItem(prefixedKey);
      if(!item) {
        return null;
      }

      const data = decompressData(item);
      if(!data) {
        return null;
      }

      if(isExpired(data)) {
        this.storage!.removeItem(prefixedKey);
        this.storageCache.delete(prefixedKey);
        return null;
      }

      this.storageCache.set(prefixedKey, data.value);
      return data.value;
    } catch{
      return null;
    }
  }

  async setStorageData(key: string, value: any): Promise<boolean> {
    if(!this.isStorageAvailable()) {
      return false;
    }

    const prefixedKey = this.getPrefixedKey(key);

    try {
      // Clean expired data periodically
      if(Math.random() < 0.1) { // 10% chance to clean
        this.cleanExpiredData();
      }

      const storageData: StorageData = {
        timestamp: Date.now(),
        ttl: this.options.ttl,
        value
      };

      const jsonString = this.options.compression
        ? compressData(storageData)
        : JSON.stringify(storageData);

      if(!this.validateSize(jsonString)) {
        // eslint-disable-next-line no-console
        console.warn(`Storage data exceeds maximum size for key: ${key}`);
        return false;
      }

      this.storage!.setItem(prefixedKey, jsonString);

      this.storageCache.set(prefixedKey, value);

      return true;
    } catch(error) {
      // eslint-disable-next-line no-console
      console.error('Failed to set storage data:', error);
      return false;
    }
  }

  async removeStorageData(key: string): Promise<boolean> {
    if(!this.isStorageAvailable()) {
      return false;
    }

    const prefixedKey = this.getPrefixedKey(key);

    try {
      this.storage!.removeItem(prefixedKey);
      this.storageCache.delete(prefixedKey);
      return true;
    } catch{
      return false;
    }
  }

  async clearStorageData(): Promise<boolean> {
    if(!this.isStorageAvailable()) {
      return false;
    }

    try {
      const keys: string[] = [];
      for(let i = 0; i < this.storage!.length; i++) {
        const key = this.storage!.key(i);
        if(key?.startsWith(this.options.prefix)) {
          keys.push(key);
        }
      }

      keys.forEach((key) => {
        this.storage!.removeItem(key);
        this.storageCache.delete(key);
      });

      return true;
    } catch{
      return false;
    }
  }

  getStorageStats(): { available: number; total: number; used: number } {
    if(!this.isStorageAvailable()) {
      return {available: 0, total: 0, used: 0};
    }

    let used = 0;
    const keys: string[] = [];

    for(let i = 0; i < this.storage!.length; i++) {
      const key = this.storage!.key(i);
      if(key?.startsWith(this.options.prefix)) {
        keys.push(key);
        const item = this.storage!.getItem(key);
        if(item) {
          used += getStorageSize(item);
        }
      }
    }

    return {
      available: this.options.maxSize - used,
      total: this.options.maxSize,
      used
    };
  }

  private getStorage(): StorageInterface | null {
    try {
      const {type} = this.options;
      const storage = type === 'local'
        ? BrowserStorage.window.localStorage
        : BrowserStorage.window.sessionStorage;

      return storage || null;
    } catch{
      return null;
    }
  }

  private getPrefixedKey(key: string): string {
    return `${this.options.prefix}${key}`;
  }

  private isStorageAvailable(): boolean {
    return this.storage !== null;
  }

  private validateSize(data: string): boolean {
    const size = getStorageSize(data);
    return size <= this.options.maxSize;
  }

  private cleanExpiredData(): void {
    if(!this.isStorageAvailable()) {
      return;
    }

    const keys: string[] = [];
    for(let i = 0; i < this.storage!.length; i++) {
      const key = this.storage!.key(i);
      if(key?.startsWith(this.options.prefix)) {
        keys.push(key);
      }
    }

    keys.forEach((key) => {
      try {
        const item = this.storage!.getItem(key);
        if(item) {
          const data = decompressData(item);
          if(data && isExpired(data)) {
            this.storage!.removeItem(key);
            this.storageCache.delete(key);
          }
        }
      } catch{
        this.storage!.removeItem(key);
        this.storageCache.delete(key);
      }
    });
  }
}
