
jest.mock('react-native', () => ({
  AsyncStorage: {
    clear: async (cb) => {
      this.store.clear();

      if(cb) {
        cb(null);
      }
    },

    flushGetRequests: () => {},

    getAllKeys: async (cb) => {
      const keys = Array.from(this.store.keys());

      if(cb) {
        cb(null, keys);
      }
      return keys;
    },

    getItem: async (key, cb) => {
      const val = this.store.get(key);

      if(cb) {
        cb(null, val);
      }

      return val;
    },

    getStore: () => new Map(this.store),

    isStringified: (str) => {
      try {
        JSON.parse(str);
        return true;
      } catch(error) {
        return false;
      }
    },

    merge: require('lodash/merge'),

    mergeItem: async (key, value, cb) => {
      const item = await this.getItem(key);

      if(!item) {
        throw new Error(`No item with ${key} key`);
      }
      if(!this.isStringified(item)) {
        throw new Error(`Invalid item with ${key} key`);
      }
      if(!this.isStringified(value)) {
        throw new Error(`Invalid value to merge with ${key}`);
      }

      const itemObj = JSON.parse(item);
      const valueObj = JSON.parse(value);
      const merged = this.merge(itemObj, valueObj);

      await this.setItem(key, JSON.stringify(merged));

      if(cb) {
        cb(null);
      }
    },

    multiGet: async (keys, cb) => {
      const entries = Array.from(this.store.entries());
      const requested = entries.filter(([k]) => keys.includes(k));

      if(cb) {
        cb(null, requested);
      }

      return requested;
    },

    multiMerge: async (entries, cb) => {
      const errors = [];

      for(const [key, value] of entries) {
        try {
          await this.mergeItem(key, value);
        } catch(err) {
          errors.push(err);
        }
      }

      if(errors.length) {
        if(cb) {
          cb(errors);
        }

        return Promise.reject(errors);
      }

      if(cb) {
        cb(null);
      }

      return Promise.resolve();
    },

    multiRemove: async (keys, cb) => {
      for(const key of keys) {
        this.store.delete(key);
      }

      if(cb) {
        cb(null);
      }
    },

    multiSet: async (entries, cb) => {
      for(const [key, value] of entries) {
        this.store.set(key, value);
      }

      if(cb) {
        cb(null);
      }
    },

    removeItem: async (key, cb) => {
      this.store.delete(key);

      if(cb) {
        cb(null);
      }
    },

    setItem: async (key, value, cb) => {
      this.store.set(key, value);

      if(cb) {
        cb(null);
      }
    },

    size: () => this.store.size,

    store: new Map()
  }
}));
