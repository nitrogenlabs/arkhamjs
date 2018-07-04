/**
 * Copyright (c) 2018, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {AsyncStorage} from 'react-native';

import {NativeStorageOptions} from '../types/main';

export class NativeStorage {
  private options: NativeStorageOptions = {};

  constructor(options: NativeStorageOptions = {}) {
    // Methods
    this.getStorageData = this.getStorageData.bind(this);
    this.setStorageData = this.setStorageData.bind(this);

    // Configuration
    this.options = {...this.options, ...options};
  }

  /**
   * Removes a key from AsyncStorage.
   *
   * @param {string} key Key associated with the data to remove.
   * @returns {Promise<boolean>} Whether data was successfully removed.
   */
  static delAsyncData(key: string): Promise<boolean> {
    try {
      return AsyncStorage.removeItem(key)
        .then(() => Promise.resolve(true))
        .catch(() => Promise.resolve(false));
    } catch(error) {
      return Promise.resolve(false);
    }
  }

  /**
   * Get a key value from AsyncStorage.
   *
   * @param {string} key The key for data.
   * @returns {Promise<any>} the data object associated with the key.
   */
  static getAsyncData(key: string): Promise<any> {
    try {
      return AsyncStorage.getItem(key)
        .then((value: string) => {
          const updatedValue = value ? JSON.parse(value) : null;
          return updatedValue;
        })
        .catch(() => Promise.resolve(null));
    } catch(error) {
      return Promise.resolve(null);
    }
  }

  /**
   * Saves data to AsyncStorage.
   *
   * @param {string} key Key to store data.
   * @param {any} value Data to store.
   * @returns {Promise<boolean>} Whether data was successfully saved.
   */
  static setAsyncData(key: string, value): Promise<boolean> {
    const updatedValue = value !== undefined && JSON.stringify(value);

    try {
      return AsyncStorage.setItem(key, updatedValue)
        .then(() => true)
        .catch(() => Promise.resolve(false));
    } catch(error) {
      return Promise.resolve(false);
    }
  }

  /**
   * Get a key value from storage.
   *
   * @param {string} key The key for data.
   * @returns {Promise<any>} the data object associated with the key.
   */
  getStorageData(key: string): Promise<any> {
    return NativeStorage.getAsyncData(key);
  }

  /**
   * Saves data to storage.
   *
   * @param {string} key Key to store data.
   * @param {any} value Data to store.
   * @returns {Promise<boolean>} Whether data was successfully saved.
   */
  setStorageData(key: string, value): Promise<boolean> {
    return NativeStorage.setAsyncData(key, value);
  }
}
