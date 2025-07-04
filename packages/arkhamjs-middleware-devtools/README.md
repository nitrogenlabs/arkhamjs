# @nlabs/arkhamjs-middleware-devtools

> **Chrome DevTools Integration for ArkhamJS** - Powerful debugging and state inspection with time-travel debugging, action replay, and real-time state monitoring.

[![npm version](https://img.shields.io/npm/v/@nlabs/arkhamjs-middleware-devtools.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs-middleware-devtools)
[![npm downloads](https://img.shields.io/npm/dm/@nlabs/arkhamjs-middleware-devtools.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs-middleware-devtools)
[![Travis](https://img.shields.io/travis/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://travis-ci.org/nitrogenlabs/arkhamjs)
[![Issues](https://img.shields.io/github/issues/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs/issues)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Chat](https://img.shields.io/discord/446122412715802649.svg)](https://discord.gg/Ttgev58)

## 🚀 Features

- **🔍 Chrome DevTools Integration** - Full integration with Chrome DevTools
- **⏰ Time-Travel Debugging** - Step through state changes and replay actions
- **📊 Real-Time State Inspection** - Monitor state changes in real-time
- **🎯 Action History** - Complete history of dispatched actions
- **🔄 State Diff Viewing** - See exactly what changed between states
- **🎨 Beautiful UI** - Clean, intuitive interface for debugging
- **⚡ Performance Monitoring** - Track action performance and state update times
- **🔧 Configurable** - Customize what gets logged and monitored

## 📦 Installation

```bash
npm install @nlabs/arkhamjs-middleware-devtools
```

**Note:** This middleware requires the [ArkhamJS DevTools Extension](./arkhamjs-devtools-extension/README.md) to be installed in Chrome.

## 🎯 Quick Start

### **Basic Setup**

```typescript
import { Flux } from '@nlabs/arkhamjs';
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

// Initialize Flux with DevTools middleware
Flux.init({
  name: 'my-app',
  stores: [UserStore, CartStore],
  middleware: [
    DevTools() // Enable DevTools integration
  ]
});

// Open Chrome DevTools and look for the "ArkhamJS" tab
// All actions and state changes will be visible there
```

### **Chrome DevTools Integration**

1. **Install the Extension**: Install the [ArkhamJS DevTools Extension](./arkhamjs-devtools-extension/README.md)
2. **Open DevTools**: Press `F12` or right-click → "Inspect"
3. **Find ArkhamJS Tab**: Look for the "ArkhamJS" tab in DevTools
4. **Start Debugging**: All actions and state changes will appear automatically

## 🔧 Configuration Options

### **Basic Configuration**

```typescript
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    DevTools({
      // Connection options
      host: 'localhost',           // DevTools host
      port: 8097,                  // DevTools port
      secure: false,               // Use secure connection

      // Logging options
      logActions: true,            // Log dispatched actions
      logState: true,              // Log state changes
      logPerformance: true,        // Log performance metrics

      // Filtering options
      filterActions: ['ADD_USER', 'UPDATE_USER'], // Only log specific actions
      excludeActions: ['TICK', 'MOUSE_MOVE'],     // Exclude specific actions

      // State options
      maxStateHistory: 50,         // Maximum states to keep in history
      stateSanitizer: (state: any) => { // Sanitize sensitive data
        const sanitized = { ...state };
        if (sanitized.user && sanitized.user.password) {
          sanitized.user.password = '***';
        }
        return sanitized;
      },

      // Action options
      actionSanitizer: (action: any) => { // Sanitize action payloads
        if (action.password) {
          action.password = '***';
        }
        return action;
      }
    })
  ]
});
```

### **Production Configuration**

```typescript
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

const isDevelopment = process.env.NODE_ENV === 'development';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    // Only enable DevTools in development
    ...(isDevelopment ? [DevTools()] : [])
  ]
});
```

### **Advanced Configuration**

```typescript
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

interface Action {
  type: string;
  payload?: any;
}

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    DevTools({
      // Custom connection handling
      connect: (config: any): boolean => {
        console.log('Connecting to DevTools...', config);
        return true; // Return false to prevent connection
      },

      // Custom action filtering
      shouldLogAction: (action: Action): boolean => {
        // Only log user-related actions
        return action.type.startsWith('USER_');
      },

      // Custom state filtering
      shouldLogState: (state: any): boolean => {
        // Only log if state has significant changes
        return Object.keys(state).length > 0;
      },

      // Performance monitoring
      trackPerformance: true,
      slowActionThreshold: 100, // ms

      // Custom serialization
      serializeState: (state: any): string => {
        // Custom state serialization
        return JSON.stringify(state, null, 2);
      },

      // Custom action serialization
      serializeAction: (action: Action): any => {
        // Custom action serialization
        return {
          type: action.type,
          timestamp: Date.now(),
          payload: action.payload || action
        };
      }
    })
  ]
});
```

## 🎨 DevTools Features

### **Action History**

The DevTools shows a complete history of all dispatched actions:

```
┌─────────────────────────────────────────────────────────────┐
│ Action History                                              │
├─────────────────────────────────────────────────────────────┤
│ [10:30:45] ADD_USER                                         │
│ [10:30:47] UPDATE_USER                                      │
│ [10:30:50] CART_ADD                                         │
│ [10:30:52] CART_REMOVE                                      │
│ [10:30:55] USER_LOGOUT                                      │
└─────────────────────────────────────────────────────────────┘
```

### **State Inspection**

Real-time state inspection with diff highlighting:

```typescript
// Current State
{
  user: {
    current: { id: 1, name: 'John', email: 'john@example.com' },
    list: [
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' }
    ],
    count: 2
  },
  cart: {
    items: [
      { id: 1, name: 'Product A', price: 29.99, quantity: 2 }
    ],
    total: 59.98
  }
}
```

### **Time-Travel Debugging**

Step through state changes and replay actions:

```typescript
// You can jump to any point in the action history
// and see the exact state at that moment

// Action 1: ADD_USER
// State: { user: { list: [], count: 0 } }

// Action 2: ADD_USER
// State: { user: { list: [{ id: 1, name: 'John' }], count: 1 } }

// Action 3: CART_ADD
// State: {
//   user: { list: [{ id: 1, name: 'John' }], count: 1 },
//   cart: { items: [{ id: 1, name: 'Product A', price: 29.99 }], total: 29.99 }
// }
```

## 🎯 Advanced Usage

### **Custom State Sanitization**

```typescript
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    DevTools({
      // Remove sensitive data from state
      stateSanitizer: (state: any) => {
        const sanitized = { ...state };

        // Remove passwords
        if (sanitized.user && sanitized.user.password) {
          sanitized.user.password = '***';
        }

        // Remove API keys
        if (sanitized.config && sanitized.config.apiKey) {
          sanitized.config.apiKey = '***';
        }

        // Remove large arrays in development
        if (process.env.NODE_ENV === 'development' && sanitized.logs) {
          sanitized.logs = sanitized.logs.slice(-10); // Keep only last 10
        }

        return sanitized;
      },

      // Remove sensitive data from actions
      actionSanitizer: (action: any) => {
        const sanitized = { ...action };

        if (sanitized.password) {
          sanitized.password = '***';
        }

        if (sanitized.token) {
          sanitized.token = '***';
        }

        return sanitized;
      }
    })
  ]
});
```

### **Performance Monitoring**

```typescript
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    DevTools({
      // Track performance metrics
      trackPerformance: true,
      slowActionThreshold: 50, // Warn for actions >50ms

      // Custom performance tracking
      onSlowAction: (action: any, duration: number) => {
        console.warn(`Slow action detected: ${action.type} took ${duration}ms`);

        // Send to analytics
        analytics.track('slow_action', {
          action: action.type,
          duration,
          timestamp: Date.now()
        });
      },

      // Track state update performance
      trackStateUpdates: true,
      stateUpdateThreshold: 10, // Warn for state updates >10ms

      onSlowStateUpdate: (path: string, duration: number) => {
        console.warn(`Slow state update: ${path} took ${duration}ms`);
      }
    })
  ]
});
```

### **Conditional DevTools**

```typescript
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

const createDevTools = (options: any) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  const enableDevTools = process.env.REACT_APP_ENABLE_DEVTOOLS === 'true';

  if (isTest) {
    return null; // No DevTools in tests
  }

  if (!isDevelopment && !enableDevTools) {
    return null; // No DevTools in production unless explicitly enabled
  }

  return DevTools({
    ...options,
    // Development-specific options
    ...(isDevelopment && {
      logActions: true,
      logState: true,
      logPerformance: true
    }),

    // Production-specific options
    ...(!isDevelopment && {
      logActions: false,
      logState: false,
      logPerformance: true, // Keep performance monitoring
      maxStateHistory: 10 // Reduce memory usage
    })
  });
};

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    createDevTools({
      host: 'localhost',
      port: 8097
    })
  ].filter(Boolean) // Remove null middleware
});
```

## 🔧 API Reference

### **DevTools Options**

```typescript
interface DevToolsOptions {
  // Connection
  host?: string;
  port?: number;
  secure?: boolean;

  // Logging
  logActions?: boolean;
  logState?: boolean;
  logPerformance?: boolean;

  // Filtering
  filterActions?: string[] | ((action: any) => boolean);
  excludeActions?: string[] | ((action: any) => boolean);
  shouldLogAction?: (action: any) => boolean;
  shouldLogState?: (state: any) => boolean;

  // State management
  maxStateHistory?: number;
  stateSanitizer?: (state: any) => any;
  actionSanitizer?: (action: any) => any;

  // Performance
  trackPerformance?: boolean;
  slowActionThreshold?: number;
  trackStateUpdates?: boolean;
  stateUpdateThreshold?: number;

  // Custom handlers
  connect?: (config: any) => boolean;
  onSlowAction?: (action: any, duration: number) => void;
  onSlowStateUpdate?: (path: string, duration: number) => void;

  // Serialization
  serializeState?: (state: any) => string;
  serializeAction?: (action: any) => any;
}
```

## 🎯 Use Cases

### **Development Debugging**

```typescript
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

// Full debugging in development
const devTools = DevTools({
  logActions: true,
  logState: true,
  logPerformance: true,
  maxStateHistory: 100,
  trackPerformance: true,
  slowActionThreshold: 50
});

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [devTools]
});
```

### **Production Monitoring**

```typescript
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

// Minimal monitoring in production
const prodDevTools = DevTools({
  logActions: false,
  logState: false,
  logPerformance: true,
  maxStateHistory: 10,
  trackPerformance: true,
  slowActionThreshold: 100,

  onSlowAction: (action, duration) => {
    // Send alerts for slow actions
    errorReporting.captureMessage(`Slow action: ${action.type}`, {
      level: 'warning',
      extra: { action, duration }
    });
  }
});

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [prodDevTools]
});
```

### **Testing Setup**

```typescript
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

// No DevTools in testing
const testDevTools = null;

Flux.init({
  name: 'test-app',
  stores: [UserStore],
  middleware: [testDevTools].filter(Boolean)
});
```

## 🔗 Related Packages

- **[@nlabs/arkhamjs](./packages/arkhamjs/README.md)** - Core Flux framework
- **[@nlabs/arkhamjs-middleware-logger](./packages/arkhamjs-middleware-logger/README.md)** - Console logging middleware
- **[@nlabs/arkhamjs-devtools-extension](./packages/arkhamjs-devtools-extension/README.md)** - Chrome DevTools extension

## 📚 Documentation

- **[ArkhamJS Documentation](https://arkhamjs.io)** - Complete API reference
- **[DevTools Guide](https://arkhamjs.io/docs/devtools)** - DevTools setup and usage
- **[Debugging Guide](https://arkhamjs.io/docs/debugging)** - Debugging best practices

## 🤝 Community & Support

- **💬 [Discord Community](https://discord.gg/Ttgev58)** - Chat with other developers
- **🐛 [GitHub Issues](https://github.com/nitrogenlabs/arkhamjs/issues)** - Report bugs and request features
- **📝 [Examples](./packages/arkhamjs-example-ts-react/README.md)** - Complete working examples

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Start debugging your ArkhamJS applications with powerful DevTools today!** 🚀
