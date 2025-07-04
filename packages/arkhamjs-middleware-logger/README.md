# @nlabs/arkhamjs-middleware-logger

> **Powerful Logging Middleware for ArkhamJS** - Comprehensive action and state logging with customizable output formats, filtering, and performance insights.

[![npm version](https://img.shields.io/npm/v/@nlabs/arkhamjs-middleware-logger.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs-middleware-logger)
[![npm downloads](https://img.shields.io/npm/dm/@nlabs/arkhamjs-middleware-logger.svg?style=flat-square)](https://www.npmjs.com/package/@nlabs/arkhamjs-middleware-logger)
[![Travis](https://img.shields.io/travis/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://travis-ci.org/nitrogenlabs/arkhamjs)
[![Issues](https://img.shields.io/github/issues/nitrogenlabs/arkhamjs.svg?style=flat-square)](https://github.com/nitrogenlabs/arkhamjs/issues)
[![TypeScript](https://badges.frapsoft.com/typescript/version/typescript-next.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
[![MIT license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Chat](https://img.shields.io/discord/446122412715802649.svg)](https://discord.gg/Ttgev58)

## 🚀 Features

- **📝 Comprehensive Logging** - Log actions, state changes, and performance metrics
- **🎨 Customizable Output** - Beautiful console formatting with colors and grouping
- **🔍 Action Filtering** - Filter specific actions or action types
- **⚡ Performance Tracking** - Measure action execution time and state update performance
- **🌲 Tree-shakable** - Only include what you need in production
- **🔧 Configurable** - Extensive options for customization
- **📱 Browser Support** - Works in Chrome, Firefox, Safari, and Edge

## 📦 Installation

```bash
npm install @nlabs/arkhamjs-middleware-logger
```

## 🎯 Quick Start

### **Basic Setup**

```typescript
import { Flux } from '@nlabs/arkhamjs';
import { Logger } from '@nlabs/arkhamjs-middleware-logger';

// Initialize Flux with logger middleware
Flux.init({
  name: 'my-app',
  stores: [UserStore, CartStore],
  middleware: [
    Logger() // Enable basic logging
  ]
});

// Dispatch actions and see beautiful logs
Flux.dispatch({ type: 'ADD_USER', user: { name: 'John' } });
```

### **Console Output**

```
🚀 ArkhamJS Logger - Action Dispatched
┌─────────────────────────────────────────────────────────────┐
│ Action: ADD_USER                                            │
│ Timestamp: 2024-01-15T10:30:45.123Z                        │
│ Duration: 2.5ms                                             │
├─────────────────────────────────────────────────────────────┤
│ Payload:                                                    │
│ {                                                           │
│   "user": {                                                 │
│     "name": "John"                                          │
│   }                                                         │
│ }                                                           │
├─────────────────────────────────────────────────────────────┤
│ State Changes:                                              │
│ • user.list: [] → [{"name":"John"}]                        │
│ • user.count: 0 → 1                                         │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Configuration Options

### **Basic Configuration**

```typescript
import { Logger } from '@nlabs/arkhamjs-middleware-logger';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    Logger({
      // Enable/disable features
      logActions: true,        // Log dispatched actions
      logState: true,          // Log state changes
      logPerformance: true,    // Log performance metrics

      // Filtering options
      filterActions: ['ADD_USER', 'UPDATE_USER'], // Only log specific actions
      excludeActions: ['TICK', 'MOUSE_MOVE'],     // Exclude specific actions

      // Output options
      groupActions: true,      // Group related logs
      showTimestamp: true,     // Show timestamps
      showDuration: true,      // Show action duration

      // Styling
      colors: true,            // Enable colored output
      compact: false,          // Compact mode for less verbose output

      // Performance thresholds
      slowActionThreshold: 100, // Warn for actions taking >100ms

      // Custom formatting
      formatAction: (action) => `🎯 ${action.type}`,
      formatState: (path, oldValue, newValue) =>
        `${path}: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`
    })
  ]
});
```

### **Production Configuration**

```typescript
import { Logger } from '@nlabs/arkhamjs-middleware-logger';

const isDevelopment = process.env.NODE_ENV === 'development';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    // Only enable logging in development
    ...(isDevelopment ? [Logger()] : [])
  ]
});
```

### **Advanced Filtering**

```typescript
import { Logger } from '@nlabs/arkhamjs-middleware-logger';

interface UserAction {
  type: string;
  user?: { premium?: boolean };
}

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    Logger({
      // Filter by action type pattern
      filterActions: (action: UserAction) => action.type.startsWith('USER_'),

      // Filter by action payload
      filterActions: (action: UserAction) => action.user && action.user.premium,

      // Filter state changes
      filterState: (path: string, oldValue: any, newValue: any): boolean => {
        // Only log significant changes
        return JSON.stringify(oldValue) !== JSON.stringify(newValue);
      },

      // Custom action grouping
      groupBy: (action: UserAction): string => {
        if (action.type.startsWith('USER_')) return 'User Actions';
        if (action.type.startsWith('CART_')) return 'Cart Actions';
        return 'Other Actions';
      }
    })
  ]
});
```

## 🎨 Custom Logging Formats

### **Custom Action Formatter**

```typescript
import { Logger } from '@nlabs/arkhamjs-middleware-logger';

interface Action {
  type: string;
}

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    Logger({
      formatAction: (action: Action): string => {
        const icons: Record<string, string> = {
          'ADD_USER': '👤',
          'UPDATE_USER': '✏️',
          'DELETE_USER': '🗑️',
          'CART_ADD': '🛒',
          'CART_REMOVE': '❌'
        };

        const icon = icons[action.type] || '📝';
        return `${icon} ${action.type}`;
      }
    })
  ]
});
```

### **Custom State Formatter**

```typescript
import { Logger } from '@nlabs/arkhamjs-middleware-logger';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    Logger({
      formatState: (path: string, oldValue: any, newValue: any): string => {
        const formatValue = (value: any): string => {
          if (Array.isArray(value)) return `[${value.length} items]`;
          if (typeof value === 'object' && value !== null) return '{...}';
          return String(value);
        };

        return `${path}: ${formatValue(oldValue)} → ${formatValue(newValue)}`;
      }
    })
  ]
});
```

## 🎯 Advanced Usage

### **Performance Monitoring**

```typescript
import { Logger } from '@nlabs/arkhamjs-middleware-logger';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    Logger({
      logPerformance: true,
      slowActionThreshold: 50, // Warn for actions >50ms

      // Custom performance formatter
      formatPerformance: (duration: number, action: any): string => {
        if (duration > 100) return `🐌 Slow action: ${action.type} (${duration}ms)`;
        if (duration > 50) return `⚠️ Medium action: ${action.type} (${duration}ms)`;
        return `⚡ Fast action: ${action.type} (${duration}ms)`;
      }
    })
  ]
});
```

### **Conditional Logging**

```typescript
import { Logger } from '@nlabs/arkhamjs-middleware-logger';

const createLogger = (options: any) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';

  if (isTest) {
    return Logger({
      logActions: false,
      logState: false,
      logPerformance: false
    });
  }

  if (isDevelopment) {
    return Logger({
      ...options,
      colors: true,
      groupActions: true
    });
  }

  return Logger({
    ...options,
    colors: false,
    groupActions: false,
    compact: true
  });
};

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [createLogger()]
});
```

### **Custom Log Handlers**

```typescript
import { Logger } from '@nlabs/arkhamjs-middleware-logger';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    Logger({
      // Custom log handler for external logging services
      onActionLogged: (action: any, duration: number) => {
        // Send to external logging service
        analytics.track('action_dispatched', {
          action: action.type,
          duration,
          timestamp: Date.now()
        });
      },

      onStateChanged: (path: string, oldValue: any, newValue: any) => {
        // Track state changes
        analytics.track('state_changed', {
          path,
          oldValue,
          newValue
        });
      }
    })
  ]
});
```

## 🔧 API Reference

### **Logger Options**

```typescript
interface LoggerOptions {
  // Basic settings
  logActions?: boolean;
  logState?: boolean;
  logPerformance?: boolean;

  // Filtering
  filterActions?: string[] | ((action: any) => boolean);
  excludeActions?: string[] | ((action: any) => boolean);
  filterState?: (path: string, oldValue: any, newValue: any) => boolean;

  // Output formatting
  groupActions?: boolean;
  showTimestamp?: boolean;
  showDuration?: boolean;
  colors?: boolean;
  compact?: boolean;

  // Performance
  slowActionThreshold?: number;

  // Custom formatters
  formatAction?: (action: any) => string;
  formatState?: (path: string, oldValue: any, newValue: any) => string;
  formatPerformance?: (duration: number, action: any) => string;

  // Custom handlers
  onActionLogged?: (action: any, duration: number) => void;
  onStateChanged?: (path: string, oldValue: any, newValue: any) => void;

  // Grouping
  groupBy?: (action: any) => string;
}
```

## 🎯 Use Cases

### **Development Debugging**

```typescript
import { Logger } from '@nlabs/arkhamjs-middleware-logger';

// Development setup with full logging
const devLogger = Logger({
  logActions: true,
  logState: true,
  logPerformance: true,
  colors: true,
  groupActions: true,
  showTimestamp: true,
  showDuration: true
});

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [devLogger]
});
```

### **Production Monitoring**

```typescript
import { Logger } from '@nlabs/arkhamjs-middleware-logger';

// Production setup with minimal logging
const prodLogger = Logger({
  logActions: false,
  logState: false,
  logPerformance: true,
  colors: false,
  compact: true,
  slowActionThreshold: 100,

  onActionLogged: (action, duration) => {
    if (duration > 100) {
      // Send slow action alerts
      errorReporting.captureMessage(`Slow action: ${action.type}`, {
        level: 'warning',
        extra: { action, duration }
      });
    }
  }
});

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [prodLogger]
});
```

### **Testing Setup**

```typescript
import { Logger } from '@nlabs/arkhamjs-middleware-logger';

// Testing setup with no logging
const testLogger = Logger({
  logActions: false,
  logState: false,
  logPerformance: false
});

Flux.init({
  name: 'test-app',
  stores: [UserStore],
  middleware: [testLogger]
});
```

## 🔗 Related Packages

- **[@nlabs/arkhamjs](./packages/arkhamjs/README.md)** - Core Flux framework
- **[@nlabs/arkhamjs-middleware-devtools](./packages/arkhamjs-middleware-devtools/README.md)** - Chrome DevTools integration
- **[@nlabs/arkhamjs-utils-react](./packages/arkhamjs-utils-react/README.md)** - React hooks and utilities

## 📚 Documentation

- **[ArkhamJS Documentation](https://arkhamjs.io)** - Complete API reference
- **[Middleware Guide](https://arkhamjs.io/docs/middleware)** - Middleware development guide
- **[Debugging Guide](https://arkhamjs.io/docs/debugging)** - Debugging best practices

## 🤝 Community & Support

- **💬 [Discord Community](https://discord.gg/Ttgev58)** - Chat with other developers
- **🐛 [GitHub Issues](https://github.com/nitrogenlabs/arkhamjs/issues)** - Report bugs and request features
- **📝 [Examples](./packages/arkhamjs-example-ts-react/README.md)** - Complete working examples

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Start debugging your ArkhamJS applications with powerful logging today!** 🚀
