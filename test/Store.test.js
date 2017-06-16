import {Store} from '../src';
import {Map} from 'immutable';

describe('Store', () => {
  let store;

  beforeAll(() => {
    store = new Store();
  });
  
  describe('initial state', () => {
    it('should return an immutable map', () => {
      expect(Map.isMap(store.state)).toBe(true);
    });
  });
  
  describe('#getInitialState', () => {
    it('should return an immutable map', () => {
      const state = store.getInitialState();
      expect(Map.isMap(state)).toBe(true);
    });
  });
  
  describe('#initialState', () => {
    it('should return an object', () => {
      const state = store.initialState();
      expect(Map.isMap(state)).toBe(false);
    });
  });
  
  describe('#name', () => {
    it('should return the class name', () => {
      expect(store.name).toBe('store');
    });
  });
});
