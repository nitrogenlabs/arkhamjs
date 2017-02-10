import {expect} from 'chai';
import {Store} from '../src';
import {Map} from 'immutable';

describe('Store', () => {
  let store;

  before(() => {
    store = new Store();
  });

  describe('initial state', () => {
    it('should return an immutable map', () => {
      return expect(Map.isMap(store.state)).to.be.true;
    });
  });

  describe('#getInitialState', () => {
    it('should return an immutable map', () => {
      const state = store.getInitialState();
      return expect(Map.isMap(state)).to.be.true;
    });
  });

  describe('#initialState', () => {
    it('should return an object', () => {
      const state = store.initialState();
      return expect(Map.isMap(state)).to.be.false;
    });
  });

  describe('#name', () => {
    it('should return the class name', () => {
      return expect(store.name).to.eq('store');
    });
  });
});