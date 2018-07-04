/**
 * Copyright (c) 2018, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {BrowserStorageOptions} from '../types/main';

export class BrowserStorage {
  static window: any = window || {};
  private options: BrowserStorageOptions = {
    type: 'session'
  };

  constructor(options: BrowserStorageOptions = {}) {
    // Methods
    this.getStorageData = this.getStorageData.bind(this);
    this.setStorageData = this.setStorageData.bind(this);

    // Configuration
    this.options = {...this.options, ...options};
  }

  /**
   * Removes a key from localStorage.
   *
   * @param {string} key Key associated with the data to remove.
   * @returns {boolean} Whether data was successfully removed.
   */
  static delLocalData(key: string): boolean {
    const localStorage = BrowserStorage.getLocalStorage();

    if(localStorage) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch(error) {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Removes a key from sessionStorage.
   *
   * @param {string} key Key associated with the data to remove.
   * @returns {boolean} Whether data was successfully removed.
   */
  static delSessionData(key: string): boolean {
    const sessionStorage = BrowserStorage.getSessionStorage();

    if(sessionStorage) {
      try {
        sessionStorage.removeItem(key);
        return true;
      } catch(error) {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Get a key value from localStorage.
   *
   * @param {string} key The key for data.
   * @returns {any} the data object associated with the key.
   */
  static getLocalData(key: string): any {
    const localStorage = BrowserStorage.getLocalStorage();

    if(localStorage) {
      try {
        const item = localStorage.getItem(key);

        if(item) {
          return JSON.parse(item);
        }

        return null;
      } catch(error) {
        return null;
      }
    } else {
      return null;
    }
  }

  /**
   * Get localStorage from global window object.
   *
   * @param {string} key Key to store data.
   * @param {any} value Data to store.
   * @returns {any} window.localStorage.
   */
  static getLocalStorage(): any {
    const {localStorage} = BrowserStorage.window;
    return localStorage;
  }

  /**
   * Get a key value from sessionStorage.
   *
   * @param {string} key The key for data.
   * @returns {any} the data object associated with the key.
   */
  static getSessionData(key: string): any {
    const sessionStorage = BrowserStorage.getSessionStorage();

    if(sessionStorage) {
      try {
        const item = sessionStorage.getItem(key);

        if(item) {
          return item ? JSON.parse(item) : null;
        }

        return null;
      } catch(error) {
        return null;
      }
    } else {
      return null;
    }
  }

  /**
   * Get sessionStorage from global window object.
   *
   * @param {string} key Key to store data.
   * @param {any} value Data to store.
   * @returns {any} window.sessionStorage.
   */
  static getSessionStorage(): any {
    const {sessionStorage} = BrowserStorage.window;

    return sessionStorage;
  }

  /**
   * Saves data to localStorage.
   *
   * @param {string} key Key to store data.
   * @param {any} value Data to store.
   * @returns {boolean} Whether data was successfully saved.
   */
  static setLocalData(key: string, value): boolean {
    const localStorage = BrowserStorage.getLocalStorage();

    if(localStorage) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch(error) {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Saves data to sessionStorage.
   *
   * @param {string} key Key to store data.
   * @param {any} value Data to store.
   * @returns {boolean} Whether data was successfully saved.
   */
  static setSessionData(key: string, value): boolean {
    const sessionStorage = BrowserStorage.getSessionStorage();

    if(sessionStorage) {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch(error) {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Get a key value from storage.
   *
   * @param {string} key The key for data.
   * @returns {Promise<any>} the data object associated with the key.
   */
  getStorageData(key: string): Promise<any> {
    const {type} = this.options;
    const results = type === 'local' ? BrowserStorage.getLocalData(key) : BrowserStorage.getSessionData(key);
    return Promise.resolve(results);
  }

  /**
   * Saves data to storage.
   *
   * @param {string} key Key to store data.
   * @param {any} value Data to store.
   * @returns {Promise<boolean>} Whether data was successfully saved.
   */
  setStorageData(key: string, value): Promise<boolean> {
    const {type} = this.options;
    const results: boolean = type === 'local' ?
      BrowserStorage.setLocalData(key, value) :
      BrowserStorage.setSessionData(key, value);
    return Promise.resolve(results);
  }
}
