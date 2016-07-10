/**
 * Copyright (c) 2016, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

import EventEmitter from 'events';

export default class Store extends EventEmitter {
  /**
   * A Flux-like Store Interface
   *
   * @constructor
   * @this {Store}
   */
  constructor() {
    super();

    this.registeredViews = {};
    this._storeData = {};
    this._listeners = [];

    this._item = {};
    this._list = [];
  }

  off(event, listener) {
    this.removeListener(event, listener);
  }

  /**
   * Dummy onAction() method to catch failures in sub-classing the Store appropriately.
   */
  onAction() {
  }

  on(event, listener) {
    this.addListener(event, listener);

    // Add to cache
    if(event && listener) {
      this._listeners.push({event, listener});
    }
  }

  off(event, listener) {
    this.removeListener(event, listener);

    // Remove from cache
    this._listeners = this._listeners.map(o => {
      if(o && !(o.event !== event && o.listener !== listener)) {
        return o;
      }
    });
  }

  /**
   * Get the unique id for this store.
   *
   * @return {String}
   */
  get uid() {
    return this.constructor.name;
  }

  /**
   * A view needs to be able to register itself with the store to receive
   * notifications of updates to the store
   *
   * @param {function} callback the method to call back
   * @returns {string} an ID to be used when un-registering
   */
  registerView(callback) {
    const id = this.uid;
    this._registeredViews[id] = callback;
    return id;
  }

  /**
   * A view also needs to be able to de-register itself with the store to
   * stop receiving notifications of updates to the store.
   *
   * @param {string} id the ID from the call to registerView()
   * @param {boolean} force don't throw an error if it doesn't exist
   */
  deregisterView(id, force = false) {
    if(id in this._registeredViews) {
      delete this._registeredViews[id];
    } else if(!force) {
      throw 'Invalid View Registration ID';
    }
  }

  /**
   * Initialize the store with a key-value pair
   *
   * @param {string} key the key name
   * @param {object} value the key value
   */
  initialize(key, value) {
    this._storeData[key] = value;
  }

  /**
   * Set a key in the store to a new value
   *
   * @param {string} key the key name
   * @param {object} value the key value
   * @throws exception if the key does not exist
   */
  set(key, value) {
    this._storeData[key] = value;
  }

  /**
   * Retrieve a key in the store
   *
   * @param {string} key the key name
   * @returns {object} the key value
   * @throws exception if the key does not exist
   */
  get(key) {
    if(key in this._storeData) {
      return this._storeData[key];
    } else {
      throw `Unknown key ${key} in store`;
    }
  }

  /**
   * This method sets up item
   *
   * @method setItem
   * @param {object} item to be saved
   */
  setItem(item = {}) {
    this._item = item;
  }

  getItem() {
    return this._item || {};
  }

  clearItem() {
    this._item = {};
  }

  /**
   * This method sets up list
   *
   * @method setList
   * @param {array} list to be saved
   */
  setList(list = []) {
    this._list = list;
  }

  getList() {
    return this._list || [];
  }

  clearList() {
    this._list = [];
  }
}
