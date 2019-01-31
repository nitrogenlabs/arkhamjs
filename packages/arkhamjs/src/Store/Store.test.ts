/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import isObject from 'lodash/isObject';

import {Store} from './Store';

describe('Store', () => {
  let store;

  beforeAll(() => {
    store = new Store();
  });

  describe('initial state', () => {
    it('should return an object', () => {
      expect(isObject(store.state)).toBe(true);
    });
  });

  describe('#initialState', () => {
    it('should return an object', () => {
      const state = store.initialState();
      expect(isObject(state)).toBe(true);
    });
  });

  describe('#name', () => {
    it('should return the class name', () => {
      expect(store.name).toBe('store');
    });
  });
});
