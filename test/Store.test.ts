import {isObject} from 'lodash';
import {Store} from '../src';

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
  
  describe('#getInitialState', () => {
    it('should return an object', () => {
      const state = store.getInitialState();
      expect(isObject(state)).toBe(true);
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
