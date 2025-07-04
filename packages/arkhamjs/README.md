# @nlabs/arkhamjs

<img src="https://arkhamjs.io/img/logos/gh-arkhamjs.png" width="400"/>

[![npm version](https://img.shields.io/npm/v/@nlabs/arkhamjs.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs)
[![npm downloads](https://img.shields.io/npm/dm/@nlabs/arkhamjs.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs)
[![Travis](https://img.shields.io/travis/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://travis-ci.org/nitrogenlabs/arkhamjs)
[![Issues](https://img.shields.io/github/issues/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs/issues)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Chat](https://img.shields.io/discord/446122412715802649.svg)](https://discord.gg/Ttgev58)

## Features

### Flux Framework

ArkhamJS is a lightweight framework that can accommodate a project of any size, small or large. From small start-up ideas to large enterprise projects. A simple, flexible framework. Consisting of a singular state tree with a unidirectional data flow.

### Universal Compatibility

ArkhamJS works seamlessly across all JavaScript environments:

- **React Web Applications** - Full React integration with hooks
- **React Native Applications** - Mobile state management with AsyncStorage
- **Node.js Applications** - Server-side state management
- **Vanilla JavaScript** - Works in any JavaScript environment

### Lightweight

The framework is small. The bulk of your app should lay within your code, not the framework. While larger frameworks come with lots of "magic", they become very limited when new features arise within your project.

### TypeScript

Compatible with typescript. Definitions are included to support your Typescript project.

### Single Store

All data is stored within a single store. The data can be accessed through all your views and components. Data is organized into multiple stores within the single store.

### Immutability

To prevent object referencing, we use immutable objects. When the state changes, the state's property is not the only item that is changed, the item it references is also updated. To prevent passing around an object between different scopes, immutable objects give your data a one way update path. You may also have returned values converted into ImmutableJS objects.

### Debugger

The most important factor in choosing a framework is how easy it is to build with it. And with building comes debugging. A state debugger can be added with the middleware, [@nlabs/arkhamjs-middleware-logger](https://github.com/nitrogenlabs/arkhamjs-middleware-logger). When turned on, it will display any actions and state changes that come through the framework. Making the previous and next state visible to the developer. Great way to make your data transparent! Supported browsers: Chrome, Firefox, and Safari.

### Cache Storage

An app state is clears after a browser refresh. Keeping the state after a reload can be very useful when requiring a persistent state.

If you plan to persist data, you will need to add a storage to the framework:

- React [@nlabs/arkhamjs-storage-browser](https://github.com/nitrogenlabs/arkhamjs-storage-browser)
- React Native [@nlabs/arkhamjs-storage-native](https://github.com/nitrogenlabs/arkhamjs-storage-native)
- NodeJS [@nlabs/arkhamjs-storage-node](https://github.com/nitrogenlabs/arkhamjs-storage-node)

## Why Choose ArkhamJS?

### 🎯 **The Perfect Middle Ground**

ArkhamJS bridges the gap between **simplicity** and **power**. Unlike other state management solutions that force you to choose between ease-of-use and functionality, ArkhamJS delivers both.

### 📊 **Bundle Size Comparison**

| Library | Gzipped Size | Minified Size | Notes |
|---------|-------------|---------------|-------|
| **ArkhamJS** | **13.4 KB** | **40 KB** | Full-featured Flux implementation |
| Zustand | ~3.2 KB | ~8.5 KB | Minimal, no provider needed |
| Jotai | ~4.1 KB | ~11 KB | Atomic model, fine-grained |
| Redux Toolkit | ~14 KB | ~41 KB | Includes Redux core |
| MobX | ~7.5 KB | ~23 KB | Core only |
| Recoil | ~8.5 KB | ~25 KB | Facebook, atomic |

**ArkhamJS is competitively sized** while providing a complete Flux implementation with middleware support, devtools, and storage integration.

### 🏗️ **State Management Patterns**

| Pattern | ArkhamJS | Redux Toolkit | Zustand | Jotai | Valtio |
|---------|----------|---------------|---------|-------|--------|
| **Immutable Updates** | ✅ Full | ✅ Full | ✅ Partial | ✅ Full | ❌ Mutable |
| **Event-Driven** | ✅ Native | ❌ Actions | ❌ Direct | ❌ Atoms | ❌ Proxy |
| **Middleware Support** | ✅ Built-in | ✅ Extensive | ⚠️ Limited | ❌ No | ❌ No |
| **DevTools** | ✅ Plugin | ✅ Built-in | ✅ Basic | ❌ No | ❌ No |
| **Storage Integration** | ✅ Built-in | ❌ External | ✅ Plugin | ❌ No | ❌ No |
| **TypeScript** | ✅ First-class | ✅ Excellent | ✅ Good | ✅ Built-in | ✅ Good |
| **Multi-Platform** | ✅ Universal | ❌ Web-only | ❌ Web-only | ❌ Web-only | ❌ Web-only |

### 🚀 **Key Advantages**

#### **1. Event-Driven Architecture**

```typescript
// ArkhamJS: Natural event-driven updates
Flux.dispatch({ type: 'ADD_USER', user });
Flux.on('ADD_USER', (action: { type: string; user: User }) => {
  // Reactive component updates
});

// vs. Redux: Action/reducer pattern
dispatch(addUser(user));
// Components must manually subscribe to state changes
```

**Why it matters:** Event-driven architecture makes your app more reactive and easier to debug. Components can listen to specific events rather than watching the entire state tree.

#### **2. Zero Boilerplate**

```typescript
// ArkhamJS: Simple and direct
Flux.setState('user.name', 'John');
const userName: string = Flux.getState('user.name');

// vs. Redux Toolkit: More setup required
const userSlice = createSlice({
  name: 'user',
  initialState: { name: '' },
  reducers: { setName: (state, action) => { state.name = action.payload; } }
});
dispatch(setName('John'));
const userName = useSelector((state: RootState) => state.user.name);
```

**Why it matters:** Less code means faster development, fewer bugs, and easier maintenance.

#### **3. Built-in Middleware System**

```typescript
// ArkhamJS: Plug-and-play middleware
Flux.addMiddleware([loggerMiddleware, devToolsMiddleware]);

// vs. Other libraries: Manual integration or external packages
```

**Why it matters:** Middleware provides powerful extensibility for logging, debugging, persistence, and custom functionality without bloating your core bundle.

#### **4. Familiar Flux Pattern**

```typescript
// ArkhamJS: Familiar Flux architecture with TypeScript
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

#### **5. Optimized Performance**

- **Tree-shaking enabled** for minimal bundle size
- **Selective re-renders** with state path subscriptions
- **Immutable updates** prevent unnecessary re-renders
- **Event-driven updates** only trigger relevant components

**Why it matters:** Better performance means faster apps and better user experience.

### 🎯 **When to Choose ArkhamJS**

#### **✅ Perfect for:**

- **Teams familiar with Flux/Redux** - Same patterns, simpler API
- **Applications needing event-driven architecture** - Built-in pub/sub
- **Projects requiring middleware** - Logging, devtools, persistence
- **Teams wanting TypeScript support** - First-class TypeScript
- **Applications with complex state interactions** - Centralized state management
- **Projects needing storage integration** - Built-in browser/Node/native support
- **Multi-platform applications** - Same code across React, React Native, Node.js

#### **❌ Consider alternatives for:**

- **Applications needing atomic state** - Consider Jotai/Recoil
- **Teams wanting mutable state** - Consider Valtio
- **Applications requiring state machines** - Consider XState
- **Projects needing minimal bundle size** - Consider Zustand

### 🔧 **Migration Benefits**

#### **From Redux:**

- **70% less boilerplate** code
- **Same familiar patterns** (actions, stores, middleware)
- **Better performance** with event-driven updates
- **Smaller bundle size** (13.4KB vs 14KB for Redux Toolkit)

#### **From Zustand:**

- **Built-in middleware support** (logging, devtools, persistence)
- **Event-driven architecture** for better reactivity
- **Familiar Flux patterns** for team consistency
- **Storage integration** out of the box

#### **From Context API:**

- **Better performance** with selective updates
- **Middleware support** for debugging and persistence
- **Predictable state management** with immutable updates
- **Event-driven architecture** for complex interactions

### 📈 **Performance Comparison**

| Metric | ArkhamJS | Redux Toolkit | Zustand | Jotai |
|--------|----------|---------------|---------|-------|
| **Bundle Size** | 13.4 KB | 14 KB | 3.2 KB | 4.1 KB |
| **Setup Complexity** | Low | Medium | Very Low | Low |
| **Learning Curve** | Low | Medium | Very Low | Medium |
| **Middleware Support** | Excellent | Excellent | Limited | None |
| **Event-Driven** | Native | Manual | Manual | Manual |
| **TypeScript Support** | Excellent | Excellent | Good | Excellent |
| **Multi-Platform** | Universal | Web-only | Web-only | Web-only |

### 🎉 **Getting Started**

```typescript
import { Flux } from '@nlabs/arkhamjs';

// Type-safe store definition
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

// Simple setup
Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [loggerMiddleware]
});

// Dispatch actions
Flux.dispatch({ type: 'ADD_USER', user: { name: 'John' } });

// Listen to events
Flux.on('ADD_USER', (action: { type: string; user: User }) => {
  console.log('User added:', action.user);
});

// Get state
const userName: string = Flux.getState('user.name');
```

**Start building with ArkhamJS today and experience the perfect balance of simplicity and power!** 🚀

## Installation

Using [npm](https://www.npmjs.com/):

```shell
npm install --save @nlabs/arkhamjs
```

## Documentation

For detailed [Documentation](https://arkhamjs.io) and additional options.

## Demo

Try tinkering with a simplified demo in [JSFiddle](https://jsfiddle.net/nitrog7/j3k762vd/)!

## Examples

### React Typescript Example

For a complete example of a React setup using Typescript, feel free to start your project with [arkhamjs-example-ts-react](https://github.com/nitrogenlabs/arkhamjs-example-ts-react).
