# @nlabs/arkhamjs-storage-browser

Enhanced browser storage for ArkhamJS with modern ESNext features, performance optimizations, and advanced caching capabilities.

## Features

- 🚀 **High Performance**: In-memory caching and optimized storage operations
- 🔒 **Type Safe**: Full TypeScript support with strict type checking
- 🎯 **Modern ESNext**: Built with latest JavaScript features (ES2022+)
- 📦 **Tree Shakeable**: Optimized for bundle size reduction
- ⚡ **Smart Caching**: Automatic cache management with TTL support
- 🛡️ **Error Resilient**: Graceful handling of storage errors and quota limits
- 🔧 **Configurable**: Flexible options for prefix, compression, and size limits
- 📊 **Monitoring**: Built-in storage statistics and usage tracking

## Installation

```bash
npm install @nlabs/arkhamjs-storage-browser
```

## Quick Start

### Basic Usage

```typescript
import { BrowserStorage } from '@nlabs/arkhamjs-storage-browser';

// Create storage instance with default settings
const storage = new BrowserStorage();

// Store data
await storage.setStorageData('user', { id: 1, name: 'John' });

// Retrieve data
const user = await storage.getStorageData('user');
console.log(user); // { id: 1, name: 'John' }
```

### Advanced Configuration

```typescript
import { BrowserStorage } from '@nlabs/arkhamjs-storage-browser';

const storage = new BrowserStorage({
  type: 'local',           // 'local' or 'session' storage
  prefix: 'myapp_',        // Custom key prefix
  compression: true,       // Enable compression for large data
  maxSize: 10 * 1024 * 1024, // 10MB size limit
  ttl: 60 * 60 * 1000      // 1 hour time-to-live
});
```

### Integration with ArkhamJS

```typescript
import { Flux } from '@nlabs/arkhamjs';
import { BrowserStorage } from '@nlabs/arkhamjs-storage-browser';

const storage = new BrowserStorage({
  type: 'local',
  prefix: 'myapp_',
  ttl: 24 * 60 * 60 * 1000 // 24 hours
});

// Initialize ArkhamJS with storage
await Flux.init({
  name: 'myapp',
  storage,
  stores: [/* your stores */]
});
```

## API Reference

### Constructor Options

```typescript
interface BrowserStorageOptions {
  type?: 'local' | 'session';     // Storage type (default: 'session')
  prefix?: string;                 // Key prefix (default: 'arkhamjs_')
  compression?: boolean;           // Enable compression (default: false)
  maxSize?: number;                // Max size in bytes (default: 5MB)
  ttl?: number;                    // Time-to-live in ms (default: 24h)
}
```

### Instance Methods

#### `getStorageData(key: string): Promise<any>`

Retrieves data from storage with caching and TTL validation.

```typescript
const data = await storage.getStorageData('user');
```

#### `setStorageData(key: string, value: any): Promise<boolean>`

Stores data with validation, compression, and automatic cleanup.

```typescript
const success = await storage.setStorageData('user', { id: 1, name: 'John' });
```

#### `removeStorageData(key: string): Promise<boolean>`

Removes specific data from storage.

```typescript
const success = await storage.removeStorageData('user');
```

#### `clearStorageData(): Promise<boolean>`

Clears all data with the configured prefix.

```typescript
const success = await storage.clearStorageData();
```

#### `getStorageStats(): { used: number; available: number; total: number }`

Returns storage usage statistics.

```typescript
const stats = storage.getStorageStats();
console.log(`Used: ${stats.used} bytes, Available: ${stats.available} bytes`);
```

### Static Methods (Backward Compatibility)

For backward compatibility, static methods are still available:

```typescript
// Local storage
BrowserStorage.setLocalData('key', value);
const data = BrowserStorage.getLocalData('key');
BrowserStorage.delLocalData('key');

// Session storage
BrowserStorage.setSessionData('key', value);
const data = BrowserStorage.getSessionData('key');
BrowserStorage.delSessionData('key');

// Storage instances
const localStorage = BrowserStorage.getLocalStorage();
const sessionStorage = BrowserStorage.getSessionStorage();
```

## Performance Optimizations

### In-Memory Caching

The storage automatically caches frequently accessed data in memory for faster retrieval:

```typescript
// First call - reads from storage
const user1 = await storage.getStorageData('user');

// Second call - served from cache (much faster)
const user2 = await storage.getStorageData('user');
```

### Automatic Cleanup

Expired data is automatically cleaned up to prevent storage bloat:

```typescript
const storage = new BrowserStorage({
  ttl: 60 * 60 * 1000 // 1 hour
});

// Data will be automatically removed after 1 hour
await storage.setStorageData('temp', 'data');
```

### Size Validation

Large data is validated before storage to prevent quota errors:

```typescript
const storage = new BrowserStorage({
  maxSize: 1024 * 1024 // 1MB limit
});

// This will fail if data exceeds 1MB
const success = await storage.setStorageData('large', bigData);
if (!success) {
  console.log('Data too large for storage');
}
```

## Error Handling

The storage gracefully handles various error conditions:

```typescript
try {
  const data = await storage.getStorageData('key');
  if (data === null) {
    console.log('Data not found or expired');
  }
} catch (error) {
  console.error('Storage error:', error);
}
```

Common error scenarios handled automatically:

- Storage not available (private browsing, etc.)
- Quota exceeded
- Corrupted data
- Invalid JSON

## Migration Guide

### From Previous Version

The new version is fully backward compatible. Existing code will continue to work:

```typescript
// Old code - still works
const storage = new BrowserStorage({ type: 'session' });
await storage.setStorageData('key', value);
const data = await storage.getStorageData('key');

// New features available
const stats = storage.getStorageStats();
await storage.removeStorageData('key');
await storage.clearStorageData();
```

### Recommended Updates

For better performance, consider these updates:

```typescript
// Before
const storage = new BrowserStorage({ type: 'session' });

// After - with optimizations
const storage = new BrowserStorage({
  type: 'local',           // Use localStorage for persistence
  prefix: 'myapp_',        // Custom prefix for organization
  ttl: 24 * 60 * 60 * 1000, // 24 hour TTL
  maxSize: 10 * 1024 * 1024  // 10MB limit
});
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Bundle Size

- **Minified**: ~3.2KB
- **Gzipped**: ~1.1KB
- **Tree-shakeable**: Only includes what you use

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.
