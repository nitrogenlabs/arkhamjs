# @nlabs/arkhamjs-middleware-redux

> **Redux Compatibility Layer for ArkhamJS** - Seamlessly integrate ArkhamJS into existing Redux applications or migrate from Redux to ArkhamJS with zero downtime.

[![npm version](https://img.shields.io/npm/v/@nlabs/arkhamjs-middleware-redux.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs-middleware-redux)
[![npm downloads](https://img.shields.io/npm/dm/@nlabs/arkhamjs-middleware-redux.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs-middleware-redux)
[![Travis](https://img.shields.io/travis/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://travis-ci.org/nitrogenlabs/arkhamjs)
[![Issues](https://img.shields.io/github/issues/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs/issues)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Chat](https://img.shields.io/discord/446122412715802649.svg)](https://discord.gg/Ttgev58)

## 🚀 Features

- **🔄 Two-Way Binding** - Bidirectional state synchronization between Redux and ArkhamJS
- **🚀 Zero-Downtime Migration** - Migrate from Redux to ArkhamJS gradually
- **🎯 Selective Integration** - Choose which parts of your Redux store to integrate
- **⚡ Performance Optimized** - Efficient state synchronization without performance impact
- **🔧 Flexible Configuration** - Multiple integration patterns for different use cases
- **📱 Existing Redux Support** - Keep your existing Redux setup while adding ArkhamJS features
- **🌲 Tree-shakable** - Only include what you need

## 📦 Installation

```bash
npm install @nlabs/arkhamjs-middleware-redux
```

## 🎯 Quick Start

### **Basic Integration**

```js
import { createArkhamStore } from '@nlabs/arkhamjs-middleware-redux';
import { Flux } from '@nlabs/arkhamjs';
import { Provider } from 'react-redux';
import { reducers } from './reducers';

// Initialize ArkhamJS
Flux.init({ name: 'myApp' });

// Create Redux store with ArkhamJS integration
const store = createArkhamStore({
  flux: Flux,
  reducers,
  statePath: 'app' // Sync Redux state to ArkhamJS at 'app' path
});

// Use with existing Redux Provider
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

### **Gradual Migration**

```js
import { arkhamMiddleware } from '@nlabs/arkhamjs-middleware-redux';
import { applyMiddleware, createStore } from 'redux';

// Add ArkhamJS middleware to existing Redux store
const store = createStore(
  reducers,
  applyMiddleware(arkhamMiddleware('app'))
);

// Now Redux actions are automatically relayed to ArkhamJS
// You can gradually migrate components to use ArkhamJS
```

## 🔧 API Reference

### **`createArkhamStore(options)`**

Create a Redux store with full ArkhamJS integration.

```js
const store = createArkhamStore({
  flux: Flux,                    // ArkhamJS Flux instance
  reducers,                      // Redux root reducer
  statePath: 'app',              // State tree path for ArkhamJS
  arkhamMiddleware: [],          // Additional ArkhamJS middleware
  devTools: false,               // Enable Redux DevTools
  reduxMiddleware: []            // Additional Redux middleware
});
```

**Options:**

- **`flux`** - *(Flux)* The Flux object initialized in your app
- **`reducers`** - *(Reducer)* Redux root reducer (from `combineReducers()`)
- **`statePath`** - *(string|string[])* State tree path where to set this branch
- **`arkhamMiddleware`** - *(any[])* Optional ArkhamJS middleware
- **`devTools`** - *(boolean)* Enable/disable Redux DevTools (default: false)
- **`reduxMiddleware`** - *(Middleware[])* Additional Redux middleware

### **`ReduxMiddleware(store, name)`**

ArkhamJS middleware to relay dispatched actions to Redux.

```js
import { ReduxMiddleware } from '@nlabs/arkhamjs-middleware-redux';

const store = createStore(reducers);
const middleware = [new ReduxMiddleware(store, 'myApp')];

Flux.init({ middleware });
```

**Parameters:**

- **`store`** - *(Store)* Redux root store
- **`name`** - *(string)* Optional middleware name (should be unique)

### **`arkhamMiddleware(statePath)`**

Redux middleware to relay Redux action dispatches to ArkhamJS.

```js
import { arkhamMiddleware } from '@nlabs/arkhamjs-middleware-redux';
import { applyMiddleware, createStore } from 'redux';

const store = createStore(
  reducers,
  applyMiddleware(arkhamMiddleware('myApp'))
);
```

**Parameters:**

- **`statePath`** - *(string|string[])* State tree path for ArkhamJS

## 🎨 Integration Patterns

### **Pattern 1: Full Integration**

Replace your Redux store entirely with ArkhamJS integration:

```js
import { createArkhamStore } from '@nlabs/arkhamjs-middleware-redux';
import { Flux } from '@nlabs/arkhamjs';
import { Logger } from '@nlabs/arkhamjs-middleware-logger';
import { BrowserStorage } from '@nlabs/arkhamjs-storage-browser';

// Initialize ArkhamJS with full features
Flux.init({
  name: 'myApp',
  storage: BrowserStorage,
  middleware: [Logger()]
});

// Create integrated store
const store = createArkhamStore({
  flux: Flux,
  reducers: rootReducer,
  statePath: 'app',
  devTools: true
});

// Use with existing Redux components
render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

### **Pattern 2: Gradual Migration**

Keep existing Redux setup and add ArkhamJS features:

```js
import { arkhamMiddleware } from '@nlabs/arkhamjs-middleware-redux';
import { applyMiddleware, createStore } from 'redux';

// Existing Redux setup
const store = createStore(
  reducers,
  applyMiddleware(
    // Existing middleware
    thunk,
    logger,
    // Add ArkhamJS integration
    arkhamMiddleware('app')
  )
);

// Now you can use both Redux and ArkhamJS
// Redux actions are automatically relayed to ArkhamJS
// You can gradually migrate components to use ArkhamJS hooks
```

### **Pattern 3: Selective Integration**

Integrate only specific parts of your Redux store:

```js
import { createArkhamStore } from '@nlabs/arkhamjs-middleware-redux';

// Create separate stores for different parts
const userStore = createArkhamStore({
  flux: Flux,
  reducers: userReducer,
  statePath: 'user'
});

const cartStore = createArkhamStore({
  flux: Flux,
  reducers: cartReducer,
  statePath: 'cart'
});

// Keep other parts as pure Redux
const mainStore = createStore(otherReducers);
```

## 🔄 Migration Strategies

### **Strategy 1: Side-by-Side Migration**

```js
// Keep existing Redux components
function OldReduxComponent() {
  const users = useSelector(state => state.users);
  const dispatch = useDispatch();

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// Create new ArkhamJS components
function NewArkhamComponent() {
  const users = useFluxState('user.list', []);
  const dispatch = useFluxDispatch();

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// Both work together seamlessly
function App() {
  return (
    <div>
      <OldReduxComponent />
      <NewArkhamComponent />
    </div>
  );
}
```

### **Strategy 2: Feature-by-Feature Migration**

```js
// Start with one feature
const userStore = createArkhamStore({
  flux: Flux,
  reducers: userReducer,
  statePath: 'user'
});

// Migrate user-related components to ArkhamJS
function UserProfile() {
  const user = useFluxState('user.current', null);
  return <div>Welcome, {user?.name}!</div>;
}

// Keep other features in Redux
const mainStore = createStore(otherReducers);
```

### **Strategy 3: Complete Migration**

```js
// Migrate everything at once
const store = createArkhamStore({
  flux: Flux,
  reducers: rootReducer,
  statePath: 'app',
  devTools: true
});

// All components can now use ArkhamJS features
function App() {
  return (
    <Provider store={store}>
      <AllComponents />
    </Provider>
  );
}
```

## 🎯 Use Cases

### **Adding ArkhamJS Features to Redux**

```js
import { arkhamMiddleware } from '@nlabs/arkhamjs-middleware-redux';
import { Logger } from '@nlabs/arkhamjs-middleware-logger';
import { BrowserStorage } from '@nlabs/arkhamjs-storage-browser';

// Initialize ArkhamJS with features
Flux.init({
  name: 'myApp',
  storage: BrowserStorage,
  middleware: [Logger()]
});

// Add to existing Redux store
const store = createStore(
  reducers,
  applyMiddleware(arkhamMiddleware('app'))
);

// Now you have:
// ✅ Redux DevTools
// ✅ ArkhamJS logging
// ✅ State persistence
// ✅ Event-driven architecture
// ✅ All existing Redux functionality
```

### **Gradual Component Migration**

```js
// Phase 1: Add ArkhamJS integration
const store = createStore(reducers, applyMiddleware(arkhamMiddleware('app')));

// Phase 2: Migrate one component at a time
function UserList() {
  // Old Redux way
  const users = useSelector(state => state.users);

  // New ArkhamJS way
  const users = useFluxState('app.users', []);

  return <div>{/* component content */}</div>;
}

// Phase 3: Remove Redux dependencies
// Eventually remove useSelector and useDispatch
```

### **Hybrid Architecture**

```js
// Use Redux for complex state logic
const complexReducer = (state, action) => {
  // Complex Redux logic
  return newState;
};

// Use ArkhamJS for simple state and events
Flux.dispatch({ type: 'USER_CLICKED', userId: 123 });

// Both work together seamlessly
const store = createArkhamStore({
  flux: Flux,
  reducers: { complex: complexReducer },
  statePath: 'complex'
});
```

## 🔗 Related Packages

- **[@nlabs/arkhamjs](./arkhamjs/README.md)** - Core Flux framework
- **[@nlabs/arkhamjs-middleware-logger](./arkhamjs-middleware-logger/README.md)** - Logging middleware
- **[@nlabs/arkhamjs-storage-browser](./arkhamjs-storage-browser/README.md)** - Browser storage

## 📚 Documentation

For detailed documentation and examples, visit [arkhamjs.io](https://arkhamjs.io).

## 🤝 Community & Support

- **💬 [Discord Community](https://discord.gg/Ttgev58)** - Chat with other developers
- **🐛 [GitHub Issues](https://github.com/nitrogenlabs/arkhamjs/issues)** - Report bugs and request features
- **📖 [Documentation](https://arkhamjs.io)** - Complete API reference

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.
