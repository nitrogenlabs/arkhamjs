/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {NativeStorageOptions} from './NativeStorage.types';

export class NativeStorage {
  private options: NativeStorageOptions = {};

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
        .then((value: string | null) => value ? JSON.parse(value) : null)
        .catch(() => Promise.resolve(null));
    } catch(error) {
      return Promise.resolve(null);
    }
  }

  static setAsyncData(key: string, value): Promise<boolean> {
    const updatedValue = value !== undefined ? typeof value === 'string' ? value : JSON.stringify(value) || '' : '';

    try {
      return AsyncStorage.setItem(key, updatedValue)
        .then(() => true)
        .catch(() => Promise.resolve(false));
    } catch(error) {
      return Promise.resolve(false);
    }
  }

  getStorageData(key: string): Promise<any> {
    return NativeStorage.getAsyncData(key);
  }

  setStorageData(key: string, value): Promise<boolean> {
    return NativeStorage.setAsyncData(key, value);
  }
}
