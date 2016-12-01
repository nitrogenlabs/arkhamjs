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

  describe('#name', () => {
    it('should return the class name', () => {
      return expect(store.name).to.eq('store');
    });
  });

  describe('#setState', () => {
    it('should set a state', () => {
      const state = Map({test: 'hello_world'});
      store.setState(state);
      return expect(store.state.get('test')).to.eq(state.get('test'));
    });
  });
});