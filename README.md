# ArkhamJS: A lightweight, isomorphic data state management library

<img src="./packages/arkhamjs-example-ts-react/src/img/arkhamjs-logo.png" alt="ArkhamJS" width="400">

[![npm version](https://img.shields.io/npm/v/@nlabs/arkhamjs.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs)
[![npm downloads](https://img.shields.io/npm/dm/@nlabs/arkhamjs.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs)
[![Documentation](https://img.shields.io/badge/docs-arkhamjs.nitrogenx.co-6d28d9?style=flat-square)](https://arkhamjs.nitrogenx.co)
[![Issues](http://img.shields.io/github/issues/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs/issues)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

> **ArkhamJS makes state management predictable** by using a unidirectional data flow and immutable state updates. It combines the best of Flux architecture with modern event-driven patterns to help you write applications that behave consistently across environments.

ArkhamJS stands out as a truly universal data state management library, designed to work seamlessly across all JavaScript environments. Unlike most state management solutions that focus primarily on web applications, ArkhamJS provides consistent APIs and behavior whether you're building React web apps, React Native mobile applications, or Node.js server environments. This cross-platform capability means you can use the same state management patterns and code across your entire tech stack, significantly reducing context-switching and enabling code sharing between frontend and backend systems.

## Table of Contents

- [Why ArkhamJS?](#why-arkhamjs)
- [Multi-Environment Support](#multi-environment-support)
- [Packages](#packages)
- [Key Features](#key-features)
- [Performance & Bundle Size](#performance--bundle-size)
- [Architecture](#architecture)
- [Migration Guide](#migration-guide)
- [Quick Start](#quick-start)
- [Advanced Usage](#advanced-usage)
- [Community & Support](#community--support)

## Why ArkhamJS?

### **Predictable State Management**

ArkhamJS helps you write applications that behave consistently across different environments. By enforcing a unidirectional data flow and immutable state updates, it makes state changes predictable and traceable.

### **Why Developers Choose ArkhamJS**

- ✅ **Predictable state updates** with unidirectional data flow
- ✅ **Immutable state** for consistent behavior
- ✅ **Type-safe** with first-class TypeScript support
- ✅ **Minimal boilerplate** compared to Redux
- ✅ **Powerful middleware system** for extensibility
- ✅ **Cross-platform storage** integrations
- ✅ **Efficient debugging** with DevTools and logging
- ✅ **Universal compatibility** across all JavaScript environments

### **Real-World Benefits**

| Challenge | Traditional Solutions | ArkhamJS Solution |
|-----------|----------------------|-------------------|
| **State Predictability** | Complex reducers and actions | Simple store patterns |
| **Data Consistency** | Manual immutability | Built-in immutable updates |
| **State Debugging** | External tools, complex setup | Integrated DevTools |
| **State Persistence** | External libraries | Built-in storage adapters |
| **Type Safety** | Complex type definitions | First-class TypeScript |
| **Cross-Environment** | Different solutions per platform | One consistent API |

## Multi-Environment Support

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

## Packages

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

## Key Features

### **1. Predictable State Container**

```typescript
// Single source of truth
const currentState = Flux.getState();

// Predictable state updates
Flux.dispatch({ type: 'ADD_USER', user });
```

**Why it matters:** A single source of truth makes your application state predictable and easier to debug, test, and reason about.

### **2. Unidirectional Data Flow**

```typescript
// Data flows in one direction
Flux.dispatch({ type: 'ADD_USER', user });  // 1. Action dispatched
// 2. Store processes action
// 3. State is updated immutably
// 4. Subscribers are notified
```

**Why it matters:** Unidirectional data flow ensures that state changes are predictable and traceable, making debugging easier.

### **3. Immutable State Updates**

```typescript
// Immutable state updates
const UserStore = {
  name: 'user',
  action: (type, data, state) => {
    switch (type) {
      case 'ADD_USER':
        return { ...state, users: [...state.users, data] }; // New object returned
      default:
        return state;
    }
  }
};
```

**Why it matters:** Immutability guarantees that state is never modified directly, preventing hard-to-track bugs and enabling time-travel debugging.

### **4. Middleware Ecosystem**

```typescript
// Extensible middleware system
Flux.init({
  middleware: [
    loggerMiddleware,    // Logging
    devToolsMiddleware,  // DevTools integration
    persistMiddleware    // State persistence
  ]
});
```

**Why it matters:** Middleware provides a clean way to extend functionality for logging, debugging, API calls, and more without cluttering your application logic.

### **5. Cross-Platform Storage**

```typescript
// Consistent storage API across platforms
Flux.init({
  storage: BrowserStorage, // Browser
  // or: NativeStorage,    // React Native
  // or: NodeStorage       // Node.js
});
```

**Why it matters:** Built-in storage adapters provide a consistent API for persisting state across different environments.

## Performance & Bundle Size

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

## Architecture

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

| | ArkhamJS | [Redux Toolkit](https://redux-toolkit.js.org/) | [Zustand](https://zustand.docs.pmnd.rs/) | [MobX](https://mobx.js.org/) | [XState](https://stately.ai/docs/xstate) | [TanStack Store](https://tanstack.com/store/latest) (alpha) |
|---|---|---|---|---|---|---|
| **Core model** | Flux store and event bus | Central store with reducers and actions | Hook or vanilla store | Observable state and reactions | Statecharts and actors | Signals and derived stores |
| **Update model** | Immutable state updates | Immer-backed immutable updates | Setter functions with shallow merging | Mutable observable actions | Event-driven transitions | Immutable setter functions |
| **Extensibility** | Middleware and plugins | Middleware and enhancers | Composable middleware | Reactions and interceptors | Actors, actions, and guards | Derived stores and framework adapters |
| **Developer tools** | ArkhamJS DevTools plugin | Redux DevTools enabled by default | Redux DevTools middleware | Community tooling | Stately Inspector | No dedicated integration |
| **Persistence** | Browser, native, and Node adapters | Add-on or custom middleware | Built-in persist middleware | External integration | Persisted actor snapshots | External integration |
| **Runtime scope** | Browser, React Native, and Node.js | Framework-agnostic core with UI bindings | Vanilla core with React bindings | Browser and Node.js with UI bindings | Framework-agnostic frontend and backend | Vanilla core with multiple UI adapters |
| **Best fit** | Event-driven apps sharing one API across runtimes | Large apps needing a predictable centralized store | Lightweight client state with minimal ceremony | Reactive object and domain models | Complex workflows and state-dependent behavior | Fine-grained reactive client state |

Capabilities describe the libraries' first-party defaults; community integrations may add more options.

## Migration Guide

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

## Quick Start

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

## Advanced Usage

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

## Community & Support

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

## Ready to Get Started?

**ArkhamJS is the perfect balance of simplicity and power.** Whether you're building a small startup app or a large enterprise system, ArkhamJS scales with your needs while keeping your code clean and maintainable.

**Start building with ArkhamJS today and experience the future of state management!** 🚀

```bash
npm install @nlabs/arkhamjs
```

[View Documentation](https://arkhamjs.io) • [Join Discord](https://discord.gg/Ttgev58) • [Report Issues](https://github.com/nitrogenlabs/arkhamjs/issues)
