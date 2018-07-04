/**
 * Copyright (c) 2018, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

import {BrowserStorage} from './BrowserStorage';
import 'jest-localstorage-mock';

describe('BrowserStorage', () => {
  let localSpy;
  let sessionSpy;
  const val: string = 'hello_world';
  const key: string = 'test';
  const storage: BrowserStorage = new BrowserStorage({type: 'session'});
  const {localStorage: globalLocal, sessionStorage: globalSession} = window as any;
  BrowserStorage.window = {localStorage: globalLocal, sessionStorage: globalSession};

  beforeAll(() => {
    localSpy = jest.spyOn(BrowserStorage.window.localStorage, 'setItem');
    sessionSpy = jest.spyOn(BrowserStorage.window.sessionStorage, 'setItem');
  });

  afterEach(() => {
    localSpy.mockClear();
    sessionSpy.mockClear();
  });

  afterAll(() => {
    localSpy.mockRestore();
    sessionSpy.mockRestore();
  });

  describe('.delLocalData', () => {
    it('should remove local data', () => {
      // Method
      BrowserStorage.delLocalData(key);
      const testVal: string = BrowserStorage.getLocalData(key);
      expect(testVal).toEqual(null);
    });
  });

  describe('.delSessionData', () => {
    it('should remove session data', () => {
      // Method
      BrowserStorage.delSessionData(key);
      const testVal: string = BrowserStorage.getSessionData(key);
      expect(testVal).toEqual(null);
    });
  });

  describe('#getLocalData', () => {
    it('should get local data', () => {
      // Set data
      BrowserStorage.setLocalData(key, val);

      // Method
      const testVal: string = BrowserStorage.getLocalData(key);
      expect(testVal).toEqual(val);
    });
  });

  describe('.getLocalStorage', () => {
    it('check if localStorage exists', () => {
      const localStorage = BrowserStorage.getLocalStorage();
      expect(BrowserStorage.window.localStorage).toBe(localStorage);
    });
  });

  describe('.getSessionData', () => {
    it('should get session data', () => {
      // Method
      BrowserStorage.setSessionData(key, val);
      const testVal: string = BrowserStorage.getSessionData(key);
      expect(testVal).toEqual(val);
    });
  });

  describe('.getSessionStorage', () => {
    it('check if sessionStorage exists', () => {
      const sessionStorage = BrowserStorage.getSessionStorage();
      expect(BrowserStorage.window.sessionStorage).toBe(sessionStorage);
    });
  });

  describe('#getStorageData', () => {
    it('should get storage data', () => {
      // Method
      BrowserStorage.setSessionData(key, val);
      const testVal: Promise<string> = storage.getStorageData(key);
      expect(testVal).resolves.toEqual(val);
    });
  });

  describe('#setLocalData', () => {
    it('should set local data', () => {
      // Method
      BrowserStorage.setLocalData(key, val);
      expect(localSpy.mock.calls.length).toEqual(1);
    });
  });

  describe('#setSessionData', () => {
    it('should set session data', () => {
      // Method
      BrowserStorage.setSessionData(key, val);
      expect(sessionSpy.mock.calls.length).toEqual(1);
    });
  });

  describe('#setStorageData', () => {
    it('should set storage data', () => {
      // Method
      storage.setStorageData(key, val);
      expect(sessionSpy.mock.calls.length).toEqual(1);
    });
  });
});
