/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {BrowserStorage} from './BrowserStorage';

describe('BrowserStorage', () => {
  let localSpy: jest.SpyInstance;
  let sessionSpy: jest.SpyInstance;
  const val: string = 'hello_world';
  const key: string = 'test';
  let storage: BrowserStorage;

  // Mock window object
  const mockWindow = {
    localStorage: null as any,
    sessionStorage: null as any
  };

  beforeAll(() => {
    // Mock storage
    const storageMock = () => {
      const storage: Record<string, string> = {};

      return {
        clear: () => {
          Object.keys(storage).forEach((key) => delete storage[key]);
        },
        getItem: (storageGetKey: string) => storage[storageGetKey] || null,
        key: (index: number) => Object.keys(storage)[index] || null,
        get length() {
          return Object.keys(storage).length;
        },
        removeItem: (storageRemoveKey: string) => {
          delete storage[storageRemoveKey];
        },
        setItem: (storageSetKey: string, storageSetValue: string) => {
          storage[storageSetKey] = storageSetValue || '';
        }
      };
    };

    // Setup mocks
    mockWindow.sessionStorage = storageMock();
    mockWindow.localStorage = storageMock();

    // Mock window object
    try {
      Object.defineProperty(global, 'window', {
        value: mockWindow,
        writable: true
      });
    } catch(_error) {
      // If window is already defined, just update its value
      (global as any).window = mockWindow;
    }

    // Update BrowserStorage window reference
    (BrowserStorage as any).window = mockWindow;
  });

  beforeEach(() => {
    storage = new BrowserStorage({type: 'session'});
    localSpy = jest.spyOn(mockWindow.localStorage, 'setItem');
    sessionSpy = jest.spyOn(mockWindow.sessionStorage, 'setItem');
  });

  afterEach(() => {
    localSpy.mockClear();
    sessionSpy.mockClear();
    // Clear storage
    mockWindow.localStorage.clear();
    mockWindow.sessionStorage.clear();
    // Restore all mocks to prevent persistence
    jest.restoreAllMocks();
  });

  afterAll(() => {
    localSpy.mockRestore();
    sessionSpy.mockRestore();
  });

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const instance = new BrowserStorage();
      expect(instance).toBeInstanceOf(BrowserStorage);
    });

    it('should create instance with custom options', () => {
      const instance = new BrowserStorage({
        compression: true,
        maxSize: 1024,
        prefix: 'custom_',
        ttl: 1000,
        type: 'local'
      });
      expect(instance).toBeInstanceOf(BrowserStorage);
    });
  });

  describe('getStorageData', () => {
    it('should get storage data', async () => {
      // Set data
      await storage.setStorageData(key, val);

      // Get data
      const result = await storage.getStorageData(key);
      expect(result).toEqual(val);
    });

    it('should return null for non-existent key', async () => {
      const result = await storage.getStorageData('non-existent');
      expect(result).toBeNull();
    });

    it('should handle storage errors gracefully', async () => {
      // Mock storage to throw error
      jest.spyOn(mockWindow.sessionStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await storage.getStorageData(key);
      expect(result).toBeNull();
    });
  });

  describe('setStorageData', () => {
    it('should set storage data', async () => {
      const result = await storage.setStorageData(key, val);
      expect(result).toBe(true);
      expect(sessionSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle storage errors gracefully', async () => {
      // Mock storage to throw error
      jest.spyOn(mockWindow.sessionStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await storage.setStorageData(key, val);
      expect(result).toBe(false);
    });

    it('should use prefix for keys', async () => {
      await storage.setStorageData(key, val);

      // Check that the key was stored with prefix by getting all keys
      const keys: string[] = [];
      for(let i = 0; i < mockWindow.sessionStorage.length; i++) {
        const key = mockWindow.sessionStorage.key(i);
        if(key) {
          keys.push(key);
        }
      }
      expect(keys.some((k) => k.startsWith('arkhamjs_'))).toBe(true);
    });
  });

  describe('removeStorageData', () => {
    it('should remove storage data', async () => {
      // Set data first
      await storage.setStorageData(key, val);

      // Remove data
      const result = await storage.removeStorageData(key);
      expect(result).toBe(true);

      // Verify data is gone
      const retrieved = await storage.getStorageData(key);
      expect(retrieved).toBeNull();
    });
  });

  describe('clearStorageData', () => {
    it('should clear all prefixed data', async () => {
      // Set multiple data items
      await storage.setStorageData('key1', 'value1');
      await storage.setStorageData('key2', 'value2');

      // Clear all data
      const result = await storage.clearStorageData();
      expect(result).toBe(true);

      // Verify all data is gone
      const retrieved1 = await storage.getStorageData('key1');
      const retrieved2 = await storage.getStorageData('key2');
      expect(retrieved1).toBeNull();
      expect(retrieved2).toBeNull();
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', () => {
      const stats = storage.getStorageStats();
      expect(stats).toHaveProperty('used');
      expect(stats).toHaveProperty('available');
      expect(stats).toHaveProperty('total');
      expect(typeof stats.used).toBe('number');
      expect(typeof stats.available).toBe('number');
      expect(typeof stats.total).toBe('number');
    });
  });

  describe('Static methods - backward compatibility', () => {
    describe('.delLocalData', () => {
      it('should remove local data', () => {
        // Set data first
        BrowserStorage.setLocalData(key, val);

        // Remove data
        const result = BrowserStorage.delLocalData(key);
        expect(result).toBe(true);

        // Verify data is gone
        const testVal = BrowserStorage.getLocalData(key);
        expect(testVal).toBeNull();
      });
    });

    describe('.delSessionData', () => {
      it('should remove session data', () => {
        // Set data first
        BrowserStorage.setSessionData(key, val);

        // Remove data
        const result = BrowserStorage.delSessionData(key);
        expect(result).toBe(true);

        // Verify data is gone
        const testVal = BrowserStorage.getSessionData(key);
        expect(testVal).toBeNull();
      });
    });

    describe('.getLocalData', () => {
      it('should get local data', () => {
        // Set data
        BrowserStorage.setLocalData(key, val);

        // Get data
        const testVal = BrowserStorage.getLocalData(key);
        expect(testVal).toEqual(val);
      });
    });

    describe('.getSessionData', () => {
      it('should get session data', () => {
        // Set data
        BrowserStorage.setSessionData(key, val);

        // Get data
        const testVal = BrowserStorage.getSessionData(key);
        expect(testVal).toEqual(val);
      });
    });

    describe('.setLocalData', () => {
      it('should set local data', () => {
        const result = BrowserStorage.setLocalData(key, val);
        expect(result).toBe(true);
        expect(localSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('.setSessionData', () => {
      it('should set session data', () => {
        const result = BrowserStorage.setSessionData(key, val);
        expect(result).toBe(true);
        expect(sessionSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('.getLocalStorage', () => {
      it('should return localStorage instance', () => {
        const localStorage = BrowserStorage.getLocalStorage();
        expect(localStorage).toBe(mockWindow.localStorage);
      });
    });

    describe('.getSessionStorage', () => {
      it('should return sessionStorage instance', () => {
        const sessionStorage = BrowserStorage.getSessionStorage();
        expect(sessionStorage).toBe(mockWindow.sessionStorage);
      });
    });
  });

  describe('Error handling', () => {
    it('should handle missing window object', () => {
      // Temporarily remove window
      const originalWindow = (BrowserStorage as any).window;
      (BrowserStorage as any).window = {};

      const instance = new BrowserStorage();
      expect(instance).toBeInstanceOf(BrowserStorage);

      // Restore window
      (BrowserStorage as any).window = originalWindow;
    });

    it('should handle storage quota exceeded', async () => {
      // Mock storage to throw quota exceeded error
      jest.spyOn(mockWindow.sessionStorage, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      const result = await storage.setStorageData(key, val);
      expect(result).toBe(false);
    });
  });
});
