/**
 * Copyright (c) 2018, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

import PersistStorage from 'node-persist';

import {NodeStorageOptions} from '../types/main';

export class NodeStorage {
  private options: NodeStorageOptions = {
    continuous: true,
    dir: '/tmp',
    encoding: 'utf8',
    expiredInterval: 3 * 60 * 1000,
    forgiveParseErrors: false,
    interval: false,
    logging: false,
    parse: JSON.parse,
    stringify: JSON.stringify,
    ttl: false
  };

  constructor(options: NodeStorageOptions = {}) {
    // Methods
    this.clearStorageData = this.clearStorageData.bind(this);
    this.getStorageData = this.getStorageData.bind(this);
    this.setStorageData = this.setStorageData.bind(this);

    // Configuration
    this.options = {...this.options, ...options};
    PersistStorage.init(this.options);
  }

  /**
   * Removes all keys from persistent data.
   *
   * @returns {Promise<boolean>} Whether data was successfully removed.
   */
  static clearPersistData(): Promise<boolean> {
    try {
      return new Promise((resolve) => {
        PersistStorage.clear()
          .then(() => resolve(true))
          .catch(() => resolve(false));
      });
    } catch(error) {
      return Promise.resolve(false);
    }
  }

  /**
   * Removes a key from persistent data.
   *
   * @param {string} key Key associated with the data to remove.
   * @returns {Promise<boolean>} Whether data was successfully removed.
   */
  static delPersistData(key: string): Promise<boolean> {
    try {
      return new Promise((resolve) => {
        PersistStorage.removeItem(key)
          .then(() => resolve(true))
          .catch(() => resolve(false));
      });
    } catch(error) {
      return Promise.resolve(false);
    }
  }

  /**
   * Get a key value from persistent data.
   *
   * @param {string} key The key for data.
   * @returns {Promise<any>} the data object associated with the key.
   */
  static getPersistData(key: string): Promise<any> {
    try {
      return new Promise((resolve) => {
        PersistStorage.getItem(key)
          .then((value: string) => {
            const updatedValue = value ? JSON.parse(value) : null;
            resolve(updatedValue);
          })
          .catch(() => resolve(null));
      });
    } catch(error) {
      return Promise.resolve(null);
    }
  }

  /**
   * Saves data to persistent data.
   *
   * @param {string} key Key to store data.
   * @param {any} value Data to store.
   * @returns {Promise<boolean>} Whether data was successfully saved.
   */
  static setPersistData(key: string, value): Promise<boolean> {
    try {
      return new Promise((resolve) => {
        PersistStorage.setItem(key, value)
          .then(() => resolve(true))
          .catch(() => resolve(false));
      });
    } catch(error) {
      return Promise.resolve(false);
    }
  }

  /**
   * Clears all data from storage.
   *
   * @returns {Promise<boolean>} Whether data was successfully saved.
   */
  clearStorageData(): Promise<boolean> {
    return NodeStorage.clearPersistData();
  }

  /**
   * Get a key value from storage.
   *
   * @param {string} key The key for data.
   * @returns {Promise<any>} the data object associated with the key.
   */
  getStorageData(key: string): Promise<any> {
    return NodeStorage.getPersistData(key);
  }

  /**
   * Saves data to storage.
   *
   * @param {string} key Key to store data.
   * @param {any} value Data to store.
   * @returns {Promise<boolean>} Whether data was successfully saved.
   */
  setStorageData(key: string, value): Promise<boolean> {
    return NodeStorage.setPersistData(key, value);
  }
}
