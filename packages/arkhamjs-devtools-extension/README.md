# @nlabs/arkhamjs-devtools-extension

> **Chrome DevTools Extension for ArkhamJS** - Powerful debugging and state inspection with time-travel debugging, action replay, and real-time state monitoring in Chrome DevTools.

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

### **Chrome Web Store (Recommended)**

1. Visit the [Chrome Web Store](https://chrome.google.com/webstore/detail/arkhamjs-devtools)
2. Click "Add to Chrome"
3. The extension will be installed automatically

### **Manual Installation (Development)**

1. Clone this repository
2. Run `npm install` and `npm run build`
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the `dist` folder

## 🎯 Quick Start

### **Setup with ArkhamJS**

```js
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

### **Using the DevTools**

1. **Open DevTools**: Press `F12` or right-click → "Inspect"
2. **Find ArkhamJS Tab**: Look for the "ArkhamJS" tab in DevTools
3. **Start Debugging**: All actions and state changes will appear automatically

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

```js
// Current State
{
  user: {
    current: { id: 1, name: "John", email: "john@example.com" },
    list: [
      { id: 1, name: "John", email: "john@example.com" },
      { id: 2, name: "Jane", email: "jane@example.com" }
    ],
    count: 2
  },
  cart: {
    items: [],
    total: 0
  }
}
```

### **Time-Travel Debugging**

Step through state changes and replay actions:

1. **Select an Action**: Click on any action in the history
2. **View State**: See the state before and after the action
3. **Replay**: Replay the action to see its effects
4. **Step Back**: Go back to previous states
5. **Step Forward**: Move forward through the timeline

### **Performance Monitoring**

Track action performance and state update times:

```
┌─────────────────────────────────────────────────────────────┐
│ Performance Metrics                                         │
├─────────────────────────────────────────────────────────────┤
│ ADD_USER: 2.5ms                                             │
│ UPDATE_USER: 1.8ms                                          │
│ CART_ADD: 3.2ms                                             │
│ CART_REMOVE: 1.5ms                                          │
│ USER_LOGOUT: 5.1ms                                          │
├─────────────────────────────────────────────────────────────┤
│ Average: 2.8ms                                              │
│ Slowest: USER_LOGOUT (5.1ms)                               │
│ Fastest: CART_REMOVE (1.5ms)                               │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Advanced Features

### **State Diff Viewing**

See exactly what changed between states:

```js
// State Diff
{
  user: {
    list: [
      // Added
      + { id: 2, name: "Jane", email: "jane@example.com" }
    ],
    count: 1 → 2  // Changed
  }
}
```

### **Action Payload Inspection**

Inspect action payloads in detail:

```js
// Action: ADD_USER
{
  type: "ADD_USER",
  user: {
    id: 2,
    name: "Jane",
    email: "jane@example.com",
    createdAt: "2024-01-15T10:30:45.123Z"
  },
  timestamp: 1705315845123
}
```

### **State Sanitization**

Protect sensitive data in DevTools:

```js
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    DevTools({
      // Sanitize sensitive data
      stateSanitizer: (state) => {
        const sanitized = { ...state };

        // Hide passwords
        if (sanitized.user && sanitized.user.password) {
          sanitized.user.password = '***';
        }

        // Hide API keys
        if (sanitized.config && sanitized.config.apiKey) {
          sanitized.config.apiKey = '***';
        }

        // Hide tokens
        if (sanitized.auth && sanitized.auth.token) {
          sanitized.auth.token = '***';
        }

        return sanitized;
      },

      // Sanitize action payloads
      actionSanitizer: (action) => {
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

## 🎯 Use Cases

### **Development Debugging**

```js
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

// Full debugging in development
const developmentDevTools = DevTools({
  logActions: true,
  logState: true,
  logPerformance: true,
  maxStateHistory: 100,
  trackPerformance: true
});

// Production minimal monitoring
const productionDevTools = DevTools({
  logActions: false,
  logState: false,
  logPerformance: true,
  maxStateHistory: 10,
  trackPerformance: true
});

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    process.env.NODE_ENV === 'development'
      ? developmentDevTools
      : productionDevTools
  ]
});
```

### **Performance Monitoring**

```js
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    DevTools({
      logActions: false,
      logState: false,
      logPerformance: true,
      trackPerformance: true,
      slowActionThreshold: 50,

      // Custom performance alerts
      onSlowAction: (action, duration) => {
        console.warn(`⚠️ Slow action: ${action.type} took ${duration}ms`);
        // Send to monitoring service
        analytics.track('slow_action', { action: action.type, duration });
      }
    })
  ]
});
```

### **User Behavior Analysis**

```js
import { DevTools } from '@nlabs/arkhamjs-middleware-devtools';

Flux.init({
  name: 'my-app',
  stores: [UserStore],
  middleware: [
    DevTools({
      // Only track user interactions
      shouldLogAction: (action) => {
        const userActions = [
          'USER_LOGIN', 'USER_LOGOUT', 'USER_UPDATE',
          'CART_ADD', 'CART_REMOVE', 'CART_CHECKOUT',
          'PRODUCT_VIEW', 'PRODUCT_PURCHASE'
        ];
        return userActions.includes(action.type);
      },

      // Custom action tracking
      actionSanitizer: (action) => {
        return {
          type: action.type,
          timestamp: Date.now(),
          userId: action.user?.id,
          sessionId: action.sessionId
        };
      }
    })
  ]
});
```

## 🔗 Related Packages

- **[@nlabs/arkhamjs](./arkhamjs/README.md)** - Core Flux framework
- **[@nlabs/arkhamjs-middleware-devtools](./arkhamjs-middleware-devtools/README.md)** - DevTools middleware
- **[@nlabs/arkhamjs-middleware-logger](./arkhamjs-middleware-logger/README.md)** - Console logging middleware

## 📚 Documentation

For detailed documentation and examples, visit [arkhamjs.io](https://arkhamjs.io).

## 🤝 Community & Support

- **💬 [Discord Community](https://discord.gg/Ttgev58)** - Chat with other developers
- **🐛 [GitHub Issues](https://github.com/nitrogenlabs/arkhamjs/issues)** - Report bugs and request features
- **📖 [Documentation](https://arkhamjs.io)** - Complete API reference

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.
