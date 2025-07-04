# @nlabs/arkhamjs-storage-native

> **React Native Storage Integration for ArkhamJS** - Seamless AsyncStorage persistence with automatic state synchronization, compression, and encryption support for React Native applications.

[![npm version](https://img.shields.io/npm/v/@nlabs/arkhamjs-storage-native.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs-storage-native)
[![npm downloads](https://img.shields.io/npm/dm/@nlabs/arkhamjs-storage-native.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs-storage-native)
[![Travis](https://img.shields.io/travis/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://travis-ci.org/nitrogenlabs/arkhamjs)
[![Issues](https://img.shields.io/github/issues/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs/issues)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Chat](https://img.shields.io/discord/446122412715802649.svg)](https://discord.gg/Ttgev58)

## 🚀 Features

- **📱 React Native Optimized** - Built specifically for React Native AsyncStorage
- **💾 Automatic Persistence** - State automatically persists across app sessions
- **🔄 Real-Time Sync** - State changes are immediately saved to AsyncStorage
- **🎯 Selective Persistence** - Choose which parts of state to persist
- **⚡ Performance Optimized** - Debounced writes and efficient serialization
- **🔒 Encryption Support** - Optional encryption for sensitive data
- **🗜️ Compression** - Automatic compression for large state objects
- **🔧 Configurable** - Extensive options for customization
- **🌲 Tree-shakable** - Only include what you need

## 📦 Installation

```bash
npm install @nlabs/arkhamjs-storage-native
```

**Peer Dependencies:**

- `react-native` (any version)
- `@react-native-async-storage/async-storage` (for React Native 0.60+)

## 🎯 Quick Start

### **Basic Setup**

```js
import { Flux } from '@nlabs/arkhamjs';
import { NativeStorage } from '@nlabs/arkhamjs-storage-native';

// Initialize Flux with native storage
Flux.init({
  name: 'my-app',
  stores: [UserStore, CartStore],
  storage: NativeStorage, // Enable AsyncStorage persistence
  storageWait: 300 // Debounce storage updates by 300ms
});

// State will automatically persist across app sessions
Flux.dispatch({ type: 'ADD_USER', user: { name: 'John' } });
// User data is now saved to AsyncStorage
```

### **Storage Types**

```js
import { NativeStorage } from '@nlabs/arkhamjs-storage-native';

// Use AsyncStorage (persists across app sessions)
const asyncStorage = NativeStorage.async;

// Use custom storage implementation
const customStorage = NativeStorage.create({
  getItem: (key) => customGet(key),
  setItem: (key, value) => customSet(key, value),
  removeItem: (key) => customRemove(key)
});

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  storage: asyncStorage, // or customStorage
});
```

## 🔧 Configuration Options

### **Basic Configuration**

```js
import { NativeStorage } from '@nlabs/arkhamjs-storage-native';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  storage: NativeStorage,

  // Storage options
  storageWait: 300,              // Debounce storage updates (ms)
  storageDebounce: true,         // Enable debouncing
  storageThrottle: false,        // Use throttling instead of debouncing

  // Persistence options
  storagePersist: true,          // Enable persistence
  storageRestore: true,          // Restore state on initialization
  storageClear: false,           // Clear storage on initialization

  // Data options
  storageSerialize: true,        // Serialize data before storage
  storageCompress: false,        // Compress data before storage
  storageEncrypt: false,         // Encrypt data before storage

  // Key options
  storageKey: 'arkhamjs-state',  // Storage key prefix
  storageNamespace: 'my-app',    // Namespace for storage keys
});
```

### **Advanced Configuration**

```js
import { NativeStorage } from '@nlabs/arkhamjs-storage-native';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  storage: NativeStorage,

  // Selective persistence
  storagePaths: [
    'user.current',    // Only persist current user
    'user.preferences', // Only persist user preferences
    'cart.items'       // Only persist cart items
  ],

  // Exclude sensitive data
  storageExclude: [
    'user.password',   // Don't persist passwords
    'auth.token',      // Don't persist auth tokens
    'temp.*'           // Don't persist temporary data
  ],

  // Custom serialization
  storageSerialize: (state) => {
    // Custom serialization logic
    return JSON.stringify(state, (key, value) => {
      if (key === 'password') return undefined; // Remove passwords
      if (key === 'token') return undefined;    // Remove tokens
      return value;
    });
  },

  // Custom deserialization
  storageDeserialize: (data) => {
    // Custom deserialization logic
    const state = JSON.parse(data);
    // Add default values or transform data
    return state;
  },

  // Storage events
  storageEvents: {
    onSave: (key, value) => {
      console.log(`Saved to AsyncStorage: ${key}`);
    },
    onLoad: (key, value) => {
      console.log(`Loaded from AsyncStorage: ${key}`);
    },
    onError: (error) => {
      console.error('Storage error:', error);
    }
  }
});
```

## 🎨 Storage Features

### **Automatic State Persistence**

State automatically persists across app sessions:

```js
// User logs in
Flux.dispatch({ type: 'USER_LOGIN', user: { id: 1, name: 'John' } });

// User closes app and reopens
// State is automatically restored from AsyncStorage
const user = Flux.getState('user.current'); // { id: 1, name: 'John' }
```

### **Selective Persistence**

Choose which parts of state to persist:

```js
Flux.init({
  name: 'my-app',
  stores: [UserStore],
  storage: NativeStorage,

  // Only persist specific paths
  storagePaths: [
    'user.current',      // Persist current user
    'user.preferences',  // Persist user preferences
    'cart.items',        // Persist cart items
    'ui.theme'           // Persist UI theme
  ],

  // Exclude sensitive or temporary data
  storageExclude: [
    'user.password',     // Don't persist passwords
    'auth.token',        // Don't persist auth tokens
    'temp.*',            // Don't persist temporary data
    'ui.loading'         // Don't persist loading states
  ]
});
```

### **Data Compression**

Compress large state objects to save storage space:

```js
import { NativeStorage } from '@nlabs/arkhamjs-storage-native';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  storage: NativeStorage,

  // Enable compression for large state objects
  storageCompress: true,
  storageCompressThreshold: 1024, // Compress if >1KB

  // Custom compression
  storageCompress: (data) => {
    // Use custom compression library
    return customCompress(data);
  },

  // Custom decompression
  storageDecompress: (data) => {
    // Use custom decompression library
    return customDecompress(data);
  }
});
```

### **Data Encryption**

Encrypt sensitive data before storage:

```js
import { NativeStorage } from '@nlabs/arkhamjs-storage-native';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  storage: NativeStorage,

  // Enable encryption
  storageEncrypt: true,
  storageEncryptKey: 'your-secret-key',

  // Custom encryption
  storageEncrypt: (data, key) => {
    // Use custom encryption library
    return customEncrypt(data, key);
  },

  // Custom decryption
  storageDecrypt: (data, key) => {
    // Use custom decryption library
    return customDecrypt(data, key);
  }
});
```

## 🔍 Advanced Usage

### **Custom Storage Implementation**

```js
import { NativeStorage } from '@nlabs/arkhamjs-storage-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create custom storage adapter
const customStorage = NativeStorage.create({
  // Required methods
  getItem: async (key) => {
    // Custom get implementation
    return await AsyncStorage.getItem(key);
  },

  setItem: async (key, value) => {
    // Custom set implementation
    await AsyncStorage.setItem(key, value);
  },

  removeItem: async (key) => {
    // Custom remove implementation
    await AsyncStorage.removeItem(key);
  },

  // Optional methods
  clear: async () => {
    // Custom clear implementation
    await AsyncStorage.clear();
  },

  getAllKeys: async () => {
    // Custom getAllKeys implementation
    return await AsyncStorage.getAllKeys();
  }
});

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  storage: customStorage
});
```

### **Storage Migration**

```js
import { NativeStorage } from '@nlabs/arkhamjs-storage-native';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  storage: NativeStorage,

  // Storage migration
  storageMigrate: (oldData, newData) => {
    // Migrate from old format to new format
    if (oldData.version === 1) {
      return {
        ...newData,
        user: {
          ...newData.user,
          // Migrate old user format
          current: oldData.user ? { ...oldData.user, id: oldData.user.id || 1 } : null
        }
      };
    }
    return newData;
  },

  // Version tracking
  storageVersion: 2,

  // Migration events
  storageEvents: {
    onMigrate: (oldVersion, newVersion) => {
      console.log(`Migrated from v${oldVersion} to v${newVersion}`);
    }
  }
});
```

## 🎯 Use Cases

### **User Preferences Persistence**

```js
import { NativeStorage } from '@nlabs/arkhamjs-storage-native';

Flux.init({
  name: 'my-app',
  stores: [UserStore, PreferencesStore],
  storage: NativeStorage,

  // Only persist user preferences
  storagePaths: [
    'user.preferences.theme',
    'user.preferences.language',
    'user.preferences.notifications',
    'ui.sidebar.collapsed'
  ]
});

// User preferences will persist across app sessions
Flux.dispatch({ type: 'SET_THEME', theme: 'dark' });
// Theme preference is automatically saved
```

### **Shopping Cart Persistence**

```js
import { NativeStorage } from '@nlabs/arkhamjs-storage-native';

Flux.init({
  name: 'my-app',
  stores: [CartStore],
  storage: NativeStorage,

  // Persist cart items
  storagePaths: ['cart.items', 'cart.total'],

  // Don't persist temporary cart state
  storageExclude: ['cart.loading', 'cart.error']
});

// Cart items persist if user closes app
Flux.dispatch({ type: 'CART_ADD', item: { id: 1, name: 'Product' } });
// Cart is automatically saved
```

### **Form Data Persistence**

```js
import { NativeStorage } from '@nlabs/arkhamjs-storage-native';

Flux.init({
  name: 'my-app',
  stores: [FormStore],
  storage: NativeStorage,

  // Persist form data with short debounce
  storageWait: 100,
  storagePaths: ['form.draft'],

  // Clear form data on successful submission
  storageEvents: {
    onAction: (action) => {
      if (action.type === 'FORM_SUBMIT_SUCCESS') {
        // Clear draft data
        AsyncStorage.removeItem('arkhamjs-state-form.draft');
      }
    }
  }
});

// Form data is automatically saved as user types
// Prevents data loss if user accidentally closes app
```

## 🔗 Related Packages

- **[@nlabs/arkhamjs](./arkhamjs/README.md)** - Core Flux framework
- **[@nlabs/arkhamjs-storage-browser](./arkhamjs-storage-browser/README.md)** - Browser storage
- **[@nlabs/arkhamjs-storage-node](./arkhamjs-storage-node/README.md)** - Node.js storage

## 📚 Documentation

For detailed documentation and examples, visit [arkhamjs.io](https://arkhamjs.io).

## 🤝 Community & Support

- **💬 [Discord Community](https://discord.gg/Ttgev58)** - Chat with other developers
- **🐛 [GitHub Issues](https://github.com/nitrogenlabs/arkhamjs/issues)** - Report bugs and request features
- **📖 [Documentation](https://arkhamjs.io)** - Complete API reference

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.
