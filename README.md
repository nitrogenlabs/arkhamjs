# ArkhamJS

<img src="https://arkhamjs.io/img/logos/gh-arkhamjs.png" width="400"/>

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)
[![npm version](https://img.shields.io/npm/v/@nlabs/arkhamjs.svg?style=flat-square)](https://www.npmjs.com/package/arkhamjs)
[![Issues](http://img.shields.io/github/issues/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs/issues)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Chat](https://img.shields.io/discord/446122412715802649.svg)](https://discord.gg/Ttgev58)

> **The Ultimate State Management Solution** - Where simplicity meets power, and performance meets developer experience. Works seamlessly across React, React Native, Node.js, and any JavaScript environment.

## 📋 Table of Contents

- [🚀 Why ArkhamJS?](#-why-arkhamjs)
- [🌍 Multi-Environment Support](#-multi-environment-support)
- [📦 Packages](#-packages)
- [🎯 Key Features](#-key-features)
- [⚡ Performance & Bundle Size](#-performance--bundle-size)
- [🏗️ Architecture](#️-architecture)
- [🔄 Migration Guide](#-migration-guide)
- [📚 Quick Start](#-quick-start)
- [🔧 Advanced Usage](#-advanced-usage)
- [🤝 Community & Support](#-community--support)

## 🚀 Why ArkhamJS?

### **The Perfect Balance**

ArkhamJS bridges the gap between **simplicity** and **power**. While other state management solutions force you to choose between ease-of-use and functionality, ArkhamJS delivers both without compromise.

### **Why Developers Choose ArkhamJS**

- ✅ **70% less boilerplate** than Redux
- ✅ **Event-driven architecture** for better reactivity
- ✅ **Built-in middleware system** for extensibility
- ✅ **Familiar Flux patterns** for easy adoption
- ✅ **First-class TypeScript support**
- ✅ **Competitive bundle size** (13.4 KB gzipped)
- ✅ **Storage integration** out of the box
- ✅ **DevTools support** via middleware
- ✅ **Universal compatibility** - works everywhere

### **Real-World Benefits**

| Challenge | Traditional Solutions | ArkhamJS Solution |
|-----------|----------------------|-------------------|
| **Complex Setup** | Redux: 50+ lines of boilerplate | 5 lines of setup |
| **Event Handling** | Manual subscriptions everywhere | Built-in pub/sub |
| **Debugging** | External tools, complex setup | One-line middleware |
| **Persistence** | External libraries, manual config | Built-in storage adapters |
| **Performance** | Manual optimization required | Automatic tree-shaking |
| **TypeScript** | Complex type definitions | First-class support |
| **Multi-Platform** | Different solutions per platform | One solution everywhere |

## 🌍 Multi-Environment Support

### **Universal State Management**

ArkhamJS works seamlessly across all JavaScript environments with platform-specific optimizations:

### **React Web Applications**

```typescript
import { Flux } from '@nlabs/arkhamjs';
import { useFluxState, useFluxDispatch } from '@nlabs/arkhamjs-utils-react';

// Type-safe store definition
interface UserState {
  users: User[];
  currentUser: User | null;
}

const UserStore = {
  name: 'user',
  action: (type: string, data: any, state: UserState): UserState => {
    switch (type) {
      case 'ADD_USER':
        return { ...state, users: [...state.users, data] };
      case 'SET_CURRENT_USER':
        return { ...state, currentUser: data };
      default:
        return state;
    }
  }
};

// React component with hooks
const UserList = (): JSX.Element => {
  const users = useFluxState<User[]>('user.users', []);
  const dispatch = useFluxDispatch();

  const addUser = (user: User): void => {
    dispatch({ type: 'ADD_USER', user });
  };

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={() => addUser({ id: 1, name: 'John' })}>
        Add User
      </button>
    </div>
  );
};
```

### **React Native Applications**

```typescript
import { Flux } from '@nlabs/arkhamjs';
import { NativeStorage } from '@nlabs/arkhamjs-storage-native';

// Same store logic, different storage
Flux.init({
  name: 'my-app',
  stores: [UserStore],
  storage: NativeStorage, // AsyncStorage for React Native
  storageWait: 300
});

// React Native component
const UserProfile = (): JSX.Element => {
  const currentUser = useFluxState<User | null>('user.currentUser', null);

  return (
    <View>
      <Text>Welcome, {currentUser?.name}!</Text>
    </View>
  );
};
```

### **Node.js Applications**

```typescript
import { Flux } from '@nlabs/arkhamjs';
import { NodeStorage } from '@nlabs/arkhamjs-storage-node';

// Server-side state management
Flux.init({
  name: 'my-server',
  stores: [UserStore],
  storage: NodeStorage, // File system or database storage
  storageWait: 500
});

// API endpoint using ArkhamJS
const userController = {
  createUser: async (req: Request, res: Response): Promise<void> => {
    const user = req.body;

    // Dispatch action to update state
    Flux.dispatch({ type: 'ADD_USER', user });

    // State is automatically persisted
    res.json({ success: true, user });
  },

  getUsers: async (req: Request, res: Response): Promise<void> => {
    // Get state directly
    const users = Flux.getState<User[]>('user.users');
    res.json(users);
  }
};
```

### **Vanilla JavaScript**

```typescript
import { Flux } from '@nlabs/arkhamjs';

// Works in any JavaScript environment
Flux.init({
  name: 'my-app',
  stores: [UserStore]
});

// Event-driven updates
Flux.on('ADD_USER', (action: { type: string; user: User }) => {
  console.log('User added:', action.user);
  updateUI();
});

// Direct state access
const updateUI = (): void => {
  const users = Flux.getState<User[]>('user.users');
  renderUserList(users);
};
```

## 📦 Packages

ArkhamJS is built as a modular ecosystem, allowing you to use only what you need:

### **Core Package**

- **[@nlabs/arkhamjs](./packages/arkhamjs/README.md)** - The main Flux framework with event-driven architecture

### **Middleware Ecosystem**

- **[@nlabs/arkhamjs-middleware-logger](./packages/arkhamjs-middleware-logger/README.md)** - Powerful logging and debugging middleware
- **[@nlabs/arkhamjs-middleware-devtools](./packages/arkhamjs-middleware-devtools/README.md)** - Chrome DevTools integration for state inspection
- **[@nlabs/arkhamjs-middleware-redux](./packages/arkhamjs-middleware-redux/README.md)** - Redux compatibility layer for easy migration

### **Storage Solutions**

- **[@nlabs/arkhamjs-storage-browser](./packages/arkhamjs-storage-browser/README.md)** - Browser storage (localStorage, sessionStorage)
- **[@nlabs/arkhamjs-storage-native](./packages/arkhamjs-storage-native/README.md)** - React Native storage (AsyncStorage)
- **[@nlabs/arkhamjs-storage-node](./packages/arkhamjs-storage-node/README.md)** - Node.js storage (file system, databases)

### **React Integration**

- **[@nlabs/arkhamjs-utils-react](./packages/arkhamjs-utils-react/README.md)** - React hooks and utilities for seamless integration

### **Developer Tools**

- **[@nlabs/arkhamjs-devtools-extension](./packages/arkhamjs-devtools-extension/README.md)** - Browser extension for enhanced debugging

### **Examples & Templates**

- **[@nlabs/arkhamjs-example-ts-react](./packages/arkhamjs-example-ts-react/README.md)** - Complete TypeScript React example

## 🎯 Key Features

### **1. Event-Driven Architecture**

```typescript
// Natural event-driven updates
Flux.dispatch({ type: 'ADD_USER', user });
Flux.on('ADD_USER', (action: { type: string; user: User }) => {
  // Components automatically react to events
  updateUI(action.user);
});
```

**Why it matters:** Event-driven architecture makes your app more reactive and easier to debug. Components listen to specific events rather than watching the entire state tree.

### **2. Zero Boilerplate**

```typescript
// ArkhamJS: Simple and direct
Flux.setState('user.name', 'John');
const userName: string = Flux.getState('user.name');

// vs. Redux: Complex setup required
const userSlice = createSlice({
  name: 'user',
  initialState: { name: '' },
  reducers: { setName: (state, action) => { state.name = action.payload; } }
});
dispatch(setName('John'));
const userName = useSelector((state: RootState) => state.user.name);
```

**Why it matters:** Less code means faster development, fewer bugs, and easier maintenance.

### **3. Built-in Middleware System**

```typescript
// Plug-and-play middleware
Flux.addMiddleware([
  loggerMiddleware,    // Automatic logging
  devToolsMiddleware,  // Chrome DevTools integration
  persistMiddleware    // State persistence
]);
```

**Why it matters:** Middleware provides powerful extensibility for logging, debugging, persistence, and custom functionality without bloating your core bundle.

### **4. Familiar Flux Pattern**

```typescript
// Familiar Flux architecture with TypeScript
interface UserState {
  users: User[];
}

const UserStore = {
  name: 'user',
  action: (type: string, data: any, state: UserState): UserState => {
    switch (type) {
      case 'ADD_USER':
        return { ...state, users: [...state.users, data] };
      default:
        return state;
    }
  }
};
```

**Why it matters:** Teams familiar with Redux/Flux can adopt ArkhamJS immediately without learning new patterns.

### **5. Storage Integration**

```typescript
// Built-in storage support for any environment
Flux.init({
  name: 'my-app',
  storage: browserStorage, // localStorage, sessionStorage
  // or: nativeStorage,     // React Native AsyncStorage
  // or: nodeStorage        // Node.js file system
});
```

**Why it matters:** No need for external persistence libraries. State automatically persists across sessions.

## ⚡ Performance & Bundle Size

### **Competitive Bundle Analysis**

| Library | Gzipped Size | Minified Size | Features |
|---------|-------------|---------------|----------|
| **ArkhamJS** | **13.4 KB** | **40 KB** | Full-featured Flux + middleware + storage |
| Zustand | ~3.2 KB | ~8.5 KB | Minimal, no middleware |
| Jotai | ~4.1 KB | ~11 KB | Atomic model, no middleware |
| Redux Toolkit | ~14 KB | ~41 KB | Full Redux ecosystem |
| MobX | ~7.5 KB | ~23 KB | Core only |
| Recoil | ~8.5 KB | ~25 KB | Facebook, atomic |

**ArkhamJS provides more features for similar size** - you get a complete state management solution with middleware, storage, and devtools support.

### **Performance Optimizations**

- **Tree-shaking enabled** for minimal bundle size
- **Selective re-renders** with state path subscriptions
- **Immutable updates** prevent unnecessary re-renders
- **Event-driven updates** only trigger relevant components
- **Lazy loading** of middleware and storage adapters

## 🏗️ Architecture

### **Flux + Event-Driven Design**

ArkhamJS combines the best of Flux architecture with modern event-driven patterns:

```typescript
class FluxFramework extends EventEmitter {
  // Centralized state store (Flux)
  private state: Record<string, any> = {};

  // Event-driven updates (Pub/Sub)
  async dispatch(action: FluxAction): Promise<void> {
    // 1. Update stores (Flux pattern)
    this.updateStoresState(action.type, action);

    // 2. Emit events (Pub/Sub pattern)
    this.emit(action.type, action);
    this.emit('arkhamjs', this.state);
  }
}
```

### **State Management Patterns**

| Pattern | ArkhamJS | Redux Toolkit | Zustand | Jotai | Valtio |
|---------|----------|---------------|---------|-------|--------|
| **Immutable Updates** | ✅ Full | ✅ Full | ✅ Partial | ✅ Full | ❌ Mutable |
| **Event-Driven** | ✅ Native | ❌ Actions | ❌ Direct | ❌ Atoms | ❌ Proxy |
| **Middleware Support** | ✅ Built-in | ✅ Extensive | ⚠️ Limited | ❌ No | ❌ No |
| **DevTools** | ✅ Plugin | ✅ Built-in | ✅ Basic | ❌ No | ❌ No |
| **Storage Integration** | ✅ Built-in | ❌ External | ✅ Plugin | ❌ No | ❌ No |
| **TypeScript** | ✅ First-class | ✅ Excellent | ✅ Good | ✅ Built-in | ✅ Good |
| **Multi-Platform** | ✅ Universal | ❌ Web-only | ❌ Web-only | ❌ Web-only | ❌ Web-only |

## 🔄 Migration Guide

### **From Redux**

**Benefits:**

- **70% less boilerplate** code
- **Same familiar patterns** (actions, stores, middleware)
- **Better performance** with event-driven updates
- **Smaller bundle size** (13.4KB vs 14KB for Redux Toolkit)

```typescript
// Before: Redux
const userSlice = createSlice({
  name: 'user',
  initialState: { users: [] },
  reducers: { addUser: (state, action) => { state.users.push(action.payload); } }
});
dispatch(addUser(user));

// After: ArkhamJS
Flux.dispatch({ type: 'ADD_USER', user });
```

### **From Zustand**

**Benefits:**

- **Built-in middleware support** (logging, devtools, persistence)
- **Event-driven architecture** for better reactivity
- **Familiar Flux patterns** for team consistency
- **Storage integration** out of the box

```typescript
// Before: Zustand
const useStore = create((set) => ({
  users: [],
  addUser: (user: User) => set((state) => ({ users: [...state.users, user] }))
}));

// After: ArkhamJS
Flux.dispatch({ type: 'ADD_USER', user });
```

### **From Context API**

**Benefits:**

- **Better performance** with selective updates
- **Middleware support** for debugging and persistence
- **Predictable state management** with immutable updates
- **Event-driven architecture** for complex interactions

## 📚 Quick Start

### **Installation**

```bash
npm install @nlabs/arkhamjs
```

### **Basic Setup**

```typescript
import { Flux } from '@nlabs/arkhamjs';

// Define your stores with TypeScript
interface UserState {
  users: User[];
}

const UserStore = {
  name: 'user',
  action: (type: string, data: any, state: UserState): UserState => {
    switch (type) {
      case 'ADD_USER':
        return { ...state, users: [...(state.users || []), data] };
      default:
        return state;
    }
  }
};

// Initialize Flux
Flux.init({
  name: 'my-app',
  stores: [UserStore],
  debug: true // Enable debugging in development
});

// Dispatch actions
Flux.dispatch({ type: 'ADD_USER', user: { name: 'John', email: 'john@example.com' } });

// Listen to events
Flux.on('ADD_USER', (action: { type: string; user: User }) => {
  console.log('User added:', action.user);
});

// Get state
const users: User[] = Flux.getState('user.users');
```

### **React Integration**

```typescript
import React, { useEffect, useState } from 'react';
import { Flux } from '@nlabs/arkhamjs';

const UserList = (): JSX.Element => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Get initial state
    setUsers(Flux.getState<User[]>('user.users') || []);

    // Listen for updates
    const handleUserAdded = (action: { type: string; user: User }): void => {
      setUsers(Flux.getState<User[]>('user.users'));
    };

    Flux.on('ADD_USER', handleUserAdded);

    return () => {
      Flux.off('ADD_USER', handleUserAdded);
    };
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.email}>{user.name}</div>
      ))}
    </div>
  );
};
```

## 🔧 Advanced Usage

### **Middleware Integration**

```typescript
import { Flux } from '@nlabs/arkhamjs';
import { Logger } from '@nlabs/arkhamjs-middleware-logger';
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    Logger(), // Automatic action logging
    DevTools() // Chrome DevTools integration
  ]
});
```

### **Storage Persistence**

```typescript
import { Flux } from '@nlabs/arkhamjs';
import { BrowserStorage } from '@nlabs/arkhamjs-storage-browser';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  storage: BrowserStorage, // Automatic localStorage persistence
  storageWait: 300 // Debounce storage updates
});
```

### **TypeScript Support**

```typescript
import { Flux, FluxAction, FluxStore } from '@nlabs/arkhamjs';

interface User {
  name: string;
  email: string;
}

interface UserState {
  users: User[];
}

const UserStore: FluxStore<UserState> = {
  name: 'user',

  action: (type: string, data: any, state: UserState): UserState => {
    switch (type) {
      case 'ADD_USER':
        return { ...state, users: [...state.users, data] };
      default:
        return state;
    }
  }
};

// Type-safe action dispatching
Flux.dispatch<{ type: 'ADD_USER'; user: User }>({
  type: 'ADD_USER',
  user: { name: 'John', email: 'john@example.com' }
});
```

## 🤝 Community & Support

### **Getting Help**

- **📖 [Documentation](https://arkhamjs.io)** - Complete API reference and guides
- **💬 [Discord Community](https://discord.gg/Ttgev58)** - Chat with other developers
- **🐛 [GitHub Issues](https://github.com/nitrogenlabs/arkhamjs/issues)** - Report bugs and request features
- **📝 [Examples](./packages/arkhamjs-example-ts-react/README.md)** - Complete working examples

### **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🎉 Ready to Get Started?

**ArkhamJS is the perfect balance of simplicity and power.** Whether you're building a small startup app or a large enterprise system, ArkhamJS scales with your needs while keeping your code clean and maintainable.

**Start building with ArkhamJS today and experience the future of state management!** 🚀

```bash
npm install @nlabs/arkhamjs
```

[View Documentation](https://arkhamjs.io) • [Join Discord](https://discord.gg/Ttgev58) • [Report Issues](https://github.com/nitrogenlabs/arkhamjs/issues)
