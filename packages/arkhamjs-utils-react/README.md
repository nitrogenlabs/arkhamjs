# @nlabs/arkhamjs-utils-react

> **React Hooks and Utilities for ArkhamJS** - Seamless React integration with powerful hooks for state management, component sizing, and window dimensions.

[![npm version](https://img.shields.io/npm/v/@nlabs/arkhamjs-utils-react.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs-utils-react)
[![npm downloads](https://img.shields.io/npm/dm/@nlabs/arkhamjs-utils-react.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs-utils-react)
[![Travis](https://img.shields.io/travis/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://travis-ci.org/nitrogenlabs/arkhamjs)
[![Issues](https://img.shields.io/github/issues/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs/issues)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Chat](https://img.shields.io/discord/446122412715802649.svg)](https://discord.gg/Ttgev58)

## 🚀 Features

- **🎯 Flux Integration Hooks** - `useFlux`, `useFluxState`, `useFluxDispatch`, `useFluxListener`
- **📏 Component Size Hooks** - `useComponentSize`, `useRefSize` for responsive components
- **🖥️ Window Size Hooks** - `useWindowSize` for viewport-aware components
- **🔧 FluxProvider** - React Context provider for ArkhamJS
- **⚡ TypeScript Support** - First-class TypeScript with full type safety
- **🌲 Tree-shakable** - Only import what you need

## 📦 Installation

```bash
npm install @nlabs/arkhamjs-utils-react
```

**Peer Dependencies:**

- `@nlabs/arkhamjs` ^3.26.0
- `react` (any version)

## 🎯 Quick Start

### **Setup FluxProvider**

```typescript
import React from 'react';
import { Flux } from '@nlabs/arkhamjs';
import { FluxProvider } from '@nlabs/arkhamjs-utils-react';

// Initialize Flux
Flux.init({
  name: 'my-app',
  stores: [UserStore, CartStore]
});

const App = (): JSX.Element => {
  return (
    <FluxProvider flux={Flux}>
      <UserList />
      <CartSummary />
    </FluxProvider>
  );
};
```

### **Use Flux Hooks**

```typescript
import React from 'react';
import { useFluxState, useFluxDispatch } from '@nlabs/arkhamjs-utils-react';

interface User {
  id: number;
  name: string;
}

const UserList = (): JSX.Element => {
  // Get state with automatic re-renders
  const users = useFluxState('user.users', []);

  // Get dispatch function
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

## 🔧 API Reference

### **Flux Integration Hooks**

#### `useFlux()`

Get the Flux instance and dispatch function.

```typescript
import { useFlux } from '@nlabs/arkhamjs-utils-react';

const MyComponent = (): JSX.Element => {
  const { flux, dispatch } = useFlux();

  // Access Flux methods
  const state = flux.getState('user');

  // Dispatch actions
  dispatch({ type: 'UPDATE_USER', user });
};
```

#### `useFluxState(path, defaultValue?)`

Subscribe to state changes with automatic re-renders.

```typescript
import { useFluxState } from '@nlabs/arkhamjs-utils-react';

interface User {
  name: string;
  email: string;
}

const UserProfile = (): JSX.Element => {
  // Subscribe to specific state path
  const user = useFluxState('user.current', null);
  const isLoading = useFluxState('user.loading', false);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>No user found</div>;

  return <div>Welcome, {user.name}!</div>;
};
```

#### `useFluxDispatch()`

Get the dispatch function for dispatching actions.

```typescript
import { useFluxDispatch } from '@nlabs/arkhamjs-utils-react';

interface UserData {
  name: string;
  email: string;
}

const AddUserForm = (): JSX.Element => {
  const dispatch = useFluxDispatch();

  const handleSubmit = (userData: UserData): void => {
    dispatch({ type: 'ADD_USER', user: userData });
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

#### `useFluxListener(event, callback)`

Listen to specific Flux events.

```typescript
import { useFluxListener } from '@nlabs/arkhamjs-utils-react';

const NotificationComponent = (): JSX.Element => {
  const [notifications, setNotifications] = useState<string[]>([]);

  // Listen to user events
  useFluxListener('USER_ADDED', (action: { type: string; user: { name: string } }) => {
    setNotifications(prev => [...prev, `User ${action.user.name} added`]);
  });

  return (
    <div>
      {notifications.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}
    </div>
  );
};
```

#### `useFluxValue(path, defaultValue?)`

Get a single value from state without re-renders on other changes.

```typescript
import { useFluxValue } from '@nlabs/arkhamjs-utils-react';

const UserCount = (): JSX.Element => {
  const userCount = useFluxValue<number>('user.count', 0);

  return <div>Total users: {userCount}</div>;
};
```

### **Component Size Hooks**

#### `useComponentSize(ref)`

Track component dimensions with ResizeObserver.

```typescript
import React, { useRef } from 'react';
import { useComponentSize } from '@nlabs/arkhamjs-utils-react';

const ResponsiveComponent = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useComponentSize(ref);

  return (
    <div ref={ref}>
      <p>Width: {width}px, Height: {height}px</p>
    </div>
  );
};
```

#### `useRefSize(ref)`

Alternative size hook with different API.

```typescript
import React, { useRef } from 'react';
import { useRefSize } from '@nlabs/arkhamjs-utils-react';

const SizeTracker = (): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const size = useRefSize(ref);

  return (
    <div ref={ref}>
      <p>Size: {size.width} x {size.height}</p>
    </div>
  );
};
```

### **Window Size Hooks**

#### `useWindowSize()`

Track window dimensions.

```typescript
import { useWindowSize } from '@nlabs/arkhamjs-utils-react';

const WindowInfo = (): JSX.Element => {
  const { width, height } = useWindowSize();

  return (
    <div>
      <p>Window: {width} x {height}</p>
      <p>Is Mobile: {width < 768}</p>
    </div>
  );
};
```

## 🎯 Advanced Usage

### **Custom Hook Composition**

```typescript
import { useFluxState, useFluxDispatch } from '@nlabs/arkhamjs-utils-react';

interface User {
  id: number;
  name: string;
  email: string;
}

const useUserManagement = () => {
  const users = useFluxState('user.users', []);
  const currentUser = useFluxState('user.current', null);
  const dispatch = useFluxDispatch();

  const addUser = (user: Omit<User, 'id'>): void => {
    const newUser = { ...user, id: Date.now() };
    dispatch({ type: 'ADD_USER', user: newUser });
  };

  const updateUser = (id: number, updates: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', id, updates });
  };

  const deleteUser = (id: number): void => {
    dispatch({ type: 'DELETE_USER', id });
  };

  return {
    users,
    currentUser,
    addUser,
    updateUser,
    deleteUser
  };
};

const UserManagement = (): JSX.Element => {
  const { users, addUser, updateUser, deleteUser } = useUserManagement();

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          {user.name}
          <button onClick={() => updateUser(user.id, { name: 'Updated' })}>
            Update
          </button>
          <button onClick={() => deleteUser(user.id)}>Delete</button>
        </div>
      ))}
      <button onClick={() => addUser({ name: 'New User', email: 'new@example.com' })}>
        Add User
      </button>
    </div>
  );
};
```

### **Performance Optimization**

```typescript
import React, { useCallback, useMemo } from 'react';
import { useFluxState, useFluxDispatch } from '@nlabs/arkhamjs-utils-react';

const OptimizedUserList = (): JSX.Element => {
  const users = useFluxState('user.users', []);
  const dispatch = useFluxDispatch();

  // Memoize expensive computations
  const activeUsers = useMemo(() =>
    users.filter(user => user.status === 'active'),
    [users]
  );

  // Memoize callbacks
  const handleUserClick = useCallback((userId: number) => {
    dispatch({ type: 'SELECT_USER', id: userId });
  }, [dispatch]);

  return (
    <div>
      {activeUsers.map(user => (
        <div key={user.id} onClick={() => handleUserClick(user.id)}>
          {user.name}
        </div>
      ))}
    </div>
  );
};
```

## 🔧 Configuration

### **FluxProvider Options**

```typescript
import { FluxProvider } from '@nlabs/arkhamjs-utils-react';

const App = (): JSX.Element => {
  return (
    <FluxProvider
      debug={process.env.NODE_ENV === 'development'}
      enableStrictMode={true}
    >
      <YourApp />
    </FluxProvider>
  );
};
```

## 🎯 Use Cases

### **E-commerce Application**

```typescript
const ShoppingCart = (): JSX.Element => {
  const cartItems = useFluxState('cart.items', []);
  const total = useFluxState('cart.total', 0);
  const dispatch = useFluxDispatch();

  const addToCart = (product: Product): void => {
    dispatch({ type: 'ADD_TO_CART', product });
  };

  const removeFromCart = (productId: number): void => {
    dispatch({ type: 'REMOVE_FROM_CART', productId });
  };

  return (
    <div>
      <h2>Shopping Cart ({cartItems.length} items)</h2>
      {cartItems.map(item => (
        <div key={item.id}>
          {item.name} - ${item.price}
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}
      <div>Total: ${total}</div>
    </div>
  );
};
```

### **Real-time Dashboard**

```typescript
const Dashboard = (): JSX.Element => {
  const metrics = useFluxState('dashboard.metrics', {});
  const { width, height } = useWindowSize();
  const isMobile = width < 768;

  // Listen for real-time updates
  useFluxListener('METRICS_UPDATED', (action) => {
    console.log('Metrics updated:', action.metrics);
  });

  return (
    <div className={isMobile ? 'mobile-dashboard' : 'desktop-dashboard'}>
      <MetricCard title="Users" value={metrics.userCount} />
      <MetricCard title="Revenue" value={metrics.revenue} />
      <MetricCard title="Orders" value={metrics.orderCount} />
    </div>
  );
};
```

## 🔗 Related Packages

- **[@nlabs/arkhamjs](./packages/arkhamjs/README.md)** - Core Flux framework
- **[@nlabs/arkhamjs-middleware-logger](./packages/arkhamjs-middleware-logger/README.md)** - Logging middleware
- **[@nlabs/arkhamjs-middleware-devtools](./packages/arkhamjs-middleware-devtools/README.md)** - DevTools integration
- **[@nlabs/arkhamjs-storage-browser](./packages/arkhamjs-storage-browser/README.md)** - Browser storage

## 📚 Documentation

- **[ArkhamJS Documentation](https://arkhamjs.io)** - Complete API reference
- **[React Integration Guide](https://arkhamjs.io/docs/react)** - Detailed React setup
- **[TypeScript Guide](https://arkhamjs.io/docs/typescript)** - TypeScript best practices

## 🤝 Community & Support

- **💬 [Discord Community](https://discord.gg/Ttgev58)** - Chat with other developers
- **🐛 [GitHub Issues](https://github.com/nitrogenlabs/arkhamjs/issues)** - Report bugs and request features
- **📝 [Examples](./packages/arkhamjs-example-ts-react/README.md)** - Complete working examples

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Start building reactive React applications with ArkhamJS today!** 🚀

Provider subscribes before rereading state, including StrictMode replay and Flux replacement. Selection responds directly to key/default changes and preserves equal selected values.

## Whole-snapshot path selections

`useFluxSnapshot<T>(key, defaultValue)` selects a dotted path from whole Flux snapshots and listens for store events through the current FluxProvider. It catches updates before subscription and rereads whole state for events without a payload. The first default value remains stable for the component lifetime; null, false, zero and array leaves remain values, while paths descending through arrays use the fallback. Changing key/provider resubscribes and cleanup removes the exact callback. Missing Provider throws a descriptive error. Unlike legacy useFluxState this hook does not read cached keyed paths.
