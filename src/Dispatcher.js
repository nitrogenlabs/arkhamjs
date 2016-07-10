/**
 * Copyright (c) 2016, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

class Dispatcher {
  /**
   * Create a new instance of the Dispatcher.  Note that the Dispatcher
   * is a Singleton pattern, so only one should ever exist.
   *
   * @constructor
   * @this {Dispatcher}
   * @param {object} options  Over-rides for the default set of options
   */
  constructor(options = {}) {
    this.options = options;

    // Create a hash of all the stores - used for registration / deregistration
    this._stores = {};
  }

  /**
   * Dispatches an Action to all the stores
   *
   * @param {String} type Type of action to dispatch to all the stores
   * @param {Object} data Action parameters
   */
  dispatch(type, data = {}) {
    if(typeof type !== 'string') {
      return;
    }

    const action = {type, data};

    // When an action comes in, it must be completely handled by all stores
    for(let storeName in this._stores) {
      if(this._stores.hasOwnProperty(storeName)) {
        this._stores[storeName].onAction(action);
      }
    }
  }

  /**
   * Registers a new Store with the Dispatcher
   *
   * @param {Class} StoreClass A unique name for the Store
   */
  registerStore(StoreClass) {
    const uid = StoreClass.name;

    if(!(uid in this._stores)) {
      this._stores[uid] = new StoreClass();
    }

    return this._stores[uid];
  }

  /**
   * De-registers a named store from the Dispatcher (completeness of API)
   *
   * @param {string} uid The name of the store
   */
  deregisterStore(uid) {
    if(uid in this._stores) {
      delete this._stores[uid];
    }
  }

  /**
   * Gets a store that is registered with the Dispatcher
   *
   * @param {string} uid The name of the store
   * @returns {Store} the store object
   * @throws 'Invalid Store' if the store does not exist
   */
  getStore(uid) {
    if(uid in this._stores) {
      return this._stores[uid];
    } else {
      throw 'Invalid Store';
    }
  }
}

let dispatcher = new Dispatcher();
export default dispatcher;
