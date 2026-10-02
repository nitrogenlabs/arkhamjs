# @nlabs/arkhamjs-storage-native

ArkhamJS persistence for React Native. The adapter uses AsyncStorage by default and accepts a string-storage backend such as Expo SecureStore. Encryption is supplied by the backend; the adapter does not implement encryption or compression.

## Installation

```sh
npm install @nlabs/arkhamjs @nlabs/arkhamjs-storage-native
```

## AsyncStorage

```ts
import {Flux} from '@nlabs/arkhamjs';
import {NativeStorage} from '@nlabs/arkhamjs-storage-native';

await Flux.init({
  name: 'my-app',
  storage: new NativeStorage(),
  storageWait: 0,
  stores: [UserStore]
});
```

Use `storageWait: 0` when callers need to await persistence, such as account operations. A positive wait retains ArkhamJS's debounced storage behavior. Storage is configured through Flux rather than a second application state store.

## Configured secure storage

Install `expo-secure-store` in the consuming Expo application. The adapter has no Expo dependency. See [Expo's SecureStore API](https://docs.expo.dev/versions/latest/sdk/securestore/) for platform configuration and accessibility options.

```ts
import {Flux} from '@nlabs/arkhamjs';
import {NativeStorage} from '@nlabs/arkhamjs-storage-native';
import * as SecureStore from 'expo-secure-store';

const secureOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
};
const storage = new NativeStorage({
  backend: {
    getItem: (key) => SecureStore.getItemAsync(key, secureOptions),
    removeItem: (key) => SecureStore.deleteItemAsync(key, secureOptions),
    setItem: (key, value) => SecureStore.setItemAsync(key, value, secureOptions)
  },
  namespace: 'my-app.production',
  select: (state) => {
    const session = state?.user?.session;
    if(!session?.token || !session?.userId) {
      return undefined;
    }
    return {user: {session: {
      expires: session.expires,
      issued: session.issued,
      token: session.token,
      userId: session.userId
    }}};
  },
  throwOnError: true
});

await Flux.init({name: 'account', storage, storageWait: 0, stores: [UserStore]});
```

The sample retains only four session fields. Configure the projection for your shared account contract and validate restored sessions with the shared session utilities. Keep passwords, recovery codes, pending requests, and unrelated application state out of session persistence. A selector runs on both save and restore; it must be pure and handle missing state. Returning `undefined` on save deletes the entry. Missing backend data restores as `null` without calling the selector.

Choose a stable, distinct namespace for every API environment. Keys are `${namespace}.${fluxName}` (or just the Flux name without a namespace). SecureStore keys must use its supported characters; encode API URLs before using them in a namespace. Keep values small and handle native storage rejections.

## Options and behavior

| Option | Default | Behavior |
| --- | --- | --- |
| `backend` | AsyncStorage | `getItem`, `setItem`, and `removeItem` promise-based string APIs |
| `namespace` | none | Prefixes keys to isolate environments |
| `select` | none | Projects state before JSON serialization and after JSON parsing |
| `throwOnError` | `false` | When enabled, rejects backend, malformed JSON, selector, and serialization failures |

Each instance serializes reads, writes, and deletes in invocation order. Writes snapshot selected state immediately. A clear invoked after a pending save therefore finishes after that save; reads wait for earlier operations. Failed operations reject their caller in strict mode and do not block later retries or clears. Use one adapter instance per Flux persistence boundary.

Ordering does not cancel new stale writes invoked *after* sign-out. Account actions must still reject late results after sign-out or an account change. Flux can update in-memory state before persistence rejects; consumers must handle the failure explicitly. The native integration is responsible for lifecycle and account-generation guards.

Without strict mode, backend/projection failures return `null` on reads and `false` on writes. Invalid JSON retains the legacy raw-string fallback. Existing static `getAsyncData`, `setAsyncData`, and `delAsyncData` helpers retain their AsyncStorage behavior and do not use instance options or serialization queues. Use the configured instance for secure account persistence.

## Verification

The adapter tests cover configuration, filtering, environment isolation, delayed-save/clear ordering, failures, and actual ArkhamJS restore/sign-out behavior with an in-memory backend. These tests do not verify device Keychain/Keystore behavior.

## License

MIT; see the repository LICENSE.
