# @nlabs/arkhamjs-storage-native

ArkhamJS persistence for React Native on iOS and Android. Use `NativeStorage.forSession` with a Keychain/Keystore-backed backend for authentication sessions. Use the general-purpose `NativeStorage` constructor for non-sensitive application state. Encryption is supplied by the backend; the adapter does not implement encryption or compression.

## Installation

```sh
npm install @nlabs/arkhamjs @nlabs/arkhamjs-storage-native
```

## Secure session storage

Install `expo-secure-store` in the consuming Expo application with `npx expo install expo-secure-store`. The adapter has no Expo dependency. See [Expo's SecureStore API](https://docs.expo.dev/versions/latest/sdk/securestore/) for native configuration and accessibility options.

```ts
import {Flux} from '@nlabs/arkhamjs';
import {NativeStorage} from '@nlabs/arkhamjs-storage-native';
import * as SecureStore from 'expo-secure-store';

const secureOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
};
const storage = NativeStorage.forSession({
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
      token: session.token,
      userId: session.userId
    }}};
  },
  // This example's expires field is a Unix timestamp in milliseconds.
  validate: (state) => {
    const session = state?.user?.session;
    return typeof session?.token === 'string' && session.token.length > 0
      && typeof session.userId === 'string' && session.userId.length > 0
      && typeof session.expires === 'number' && Number.isFinite(session.expires)
      && session.expires > Date.now();
  }
});

await Flux.init({name: 'account', storage, storageWait: 0, stores: [UserStore]});
```

`forSession` requires an explicit backend, a namespace, a selector, and a synchronous restore validator. It always enables strict errors and defaults to skipping unchanged writes. It checks the backend interface, but cannot verify that a supplied backend encrypts data: supply SecureStore or an equivalent secure backend, never AsyncStorage for credentials.

Configure the projection and validation for your shared account contract. The example stores a single session token; for systems with refresh tokens, prefer keeping short-lived access tokens in memory and persisting only what is needed to renew the session. Validate refresh credentials according to their own lifetime, rather than discarding them when an access token expires. Local validation checks shape and expiration; the server remains responsible for token validity and revocation.

Keep passwords, recovery codes, pending requests, and unrelated application state out of session persistence. A selector runs on both save and restore; it must be pure and handle missing state. Returning `undefined` on save deletes the entry. Missing backend data restores as `null` without calling the selector or validator. On restore, a validator returning false deletes the entry and restores `null`; thrown errors and deletion failures reject in strict mode. Corrupt JSON rejects instead of silently accepting invalid credentials. Validators do not run on save, allowing applications to persist refreshed credentials independently of restore checks.

Choose a stable, distinct namespace for every API environment. Keys are `${namespace}.${fluxName}`. Session namespaces allow letters, numbers, dots, hyphens and underscores; use a Flux name with these characters too for SecureStore. Keep values small and handle native storage rejections. Do not log tokens or include them in development tools, analytics, or crash reports.

### Bare React Native

Applications without Expo can supply [react-native-keychain](https://oblador.github.io/react-native-keychain/docs/) through the same backend interface. Use the storage key as the Keychain service; translate `getGenericPassword` credentials into a string or `null`, and reject unsuccessful writes and deletions rather than swallowing their boolean results. Configure accessibility and native installation in the consuming app. No Keychain dependency is required by this adapter.

### Logout and account changes

Use `storageWait: 0` so login, refresh and logout can await persistence. The default Flux debounce is intended for general application state; a positive wait does not guarantee that awaiting an update waits for its disk write.

Guard asynchronous account results before they update Flux. For example, increment an account generation before logout, account switching, or starting a replacement login:

```ts
let accountGeneration = 0;

async function refreshSession() {
  const generation = accountGeneration;
  const session = await accountApi.refresh();
  if(generation !== accountGeneration) return;
  await Flux.setState('user.session', session);
}

async function signOut() {
  accountGeneration += 1;
  // The selector returns undefined, so this removes the persisted entry.
  await Flux.setState('user.session', undefined);
}
```

Apply the same guard to every login and account request that can restore credentials. Revoke credentials through your authentication service as appropriate. Flux updates memory before persistence can reject, so handle rejection, surface failure, and retry deletion as needed. `await storage.clearStorageData('account')` explicitly deletes the entry without running the selector; it does not reset Flux memory. Clear operations are never skipped, even if this instance previously deleted the key.

### Native lifecycle configuration

SecureStore uses iOS Keychain and Android storage encrypted with Keystore-protected keys. [Platform storage and persistence](https://docs.expo.dev/versions/latest/sdk/securestore/#platform-value-storage)

- On iOS, Keychain entries can survive uninstall/reinstall. Decide whether reinstall should restore a session. If not, use an application installation marker to clear this app's session entry before Flux initializes on a fresh installation.
- On Android, exclude SecureStore entries from backup. Expo configures this automatically when there is no custom backup configuration; custom rules must exclude them from cloud backup and device transfer. [Android backup configuration](https://docs.expo.dev/versions/latest/sdk/securestore/#android-auto-backup)
- `WHEN_UNLOCKED_THIS_DEVICE_ONLY` prevents migration to another iOS device and requires an unlocked device. Applications that need background refresh while locked should choose an appropriate accessibility policy deliberately.
- Biometric-protected entries can become inaccessible after biometric enrollment changes. Handle this by requiring authentication again. Avoid biometric prompts on routine persistence unless the product requires them.
- On foreground/resume, recheck session lifetime and refresh or reauthenticate through the account service. Do not treat stored credentials as proof that the server still accepts them.

## Performance

Session storage enables `skipUnchanged` by default. The adapter compares the small serialized projection with the last successfully persisted value and avoids an identical native write. A test with 1,000 unrelated state updates performs one backend write instead of 1,000. This is a reduction in storage operations, not a device latency benchmark.

Changes to selected session fields still write immediately. Repeated projections of a missing session skip redundant deletions after its absence is confirmed. Successful reads refresh write tracking, failures invalidate it, and explicit clears always call the backend. Reads always access the backend and validate restored data; they are not served from the write cache. State is snapshotted at invocation, so later mutations cannot change a queued write.

Use one adapter instance as the exclusive writer for each persistence boundary. If another instance, native code, or a static helper writes the same keys, disable `skipUnchanged` or read through the instance before saving again. The cache assumes exclusive ownership and retains serialized selected values in memory for the instance lifetime. Keep the selector small and cheap; serialization still runs on every save to detect in-place mutations safely. For general state, debounce can reduce write frequency; for credentials, immediate completion and unchanged-write skipping preserve durability.

## Non-sensitive application state

```ts
import {Flux} from '@nlabs/arkhamjs';
import {NativeStorage} from '@nlabs/arkhamjs-storage-native';

await Flux.init({
  name: 'preferences',
  storage: new NativeStorage({skipUnchanged: true}),
  stores: [PreferencesStore]
});
```

The constructor defaults to unencrypted AsyncStorage for compatibility. Use it for preferences and other non-sensitive data; [React Native advises against AsyncStorage for tokens and secrets](https://reactnative.dev/docs/security#async-storage). A separate persistence boundary must exclude credentials from its selected data.

## Options and behavior

| Option | Constructor default | Behavior |
| --- | --- | --- |
| `backend` | AsyncStorage | Promise-based `getItem`, `setItem`, and `removeItem` string APIs |
| `namespace` | none | Prefixes keys to isolate environments |
| `select` | none | Projects state before serialization and after parsing |
| `validate` | none | Checks projected restored data; false deletes the entry |
| `throwOnError` | `false` | Rejects backend, malformed JSON, selector, validator, and serialization failures |
| `skipUnchanged` | `false` | Avoids unchanged projected data, including absence; requires exclusive writer ownership |

`forSession` requires `backend`, `namespace`, `select`, and `validate`; it forces `throwOnError: true` and defaults `skipUnchanged` to `true`. Set `skipUnchanged: false` for backends shared with other writers or when each write must trigger authentication.

Each instance serializes reads, writes, and deletes in invocation order. A clear invoked after a pending save finishes after that save; reads wait for earlier operations. Failed operations reject their caller in strict mode without blocking later retries or clears. Ordering cannot cancel stale writes invoked after logout; account-generation guards belong in the consuming application's account actions.

Without strict mode, backend/projection/validation failures return `null` on reads and `false` on writes. Invalid JSON retains the legacy raw-string fallback. Static `getAsyncData`, `setAsyncData`, and `delAsyncData` helpers retain their AsyncStorage behavior and do not use instance options or queues. Use the configured instance for secure account persistence.

## Verification

Automated tests cover projection, validation, environment isolation, unchanged-write reduction, token rotation, delayed-save/clear ordering, retries after partial backend failures, and ArkhamJS restore/logout behavior with an in-memory backend.

Before release, verify in the consuming native app on both iOS and Android:

1. Login, force-stop, relaunch, and restore valid credentials.
2. Expire or revoke credentials, then resume and confirm refresh or reauthentication.
3. Delay a refresh, logout or switch accounts, and confirm the late result cannot restore the previous session.
4. Fail a write or deletion, then confirm error handling and retry preserve the intended session state.
5. Lock/unlock the device and test the chosen accessibility policy.
6. Uninstall/reinstall, restore a backup, and confirm the app's installation and backup policies.
7. Profile release-build login, restore and repeated unrelated updates; verify unchanged sessions avoid native writes.

This repository has no native app harness; unit tests do not verify device Keychain/Keystore behavior or measure device latency.

## License

MIT; see the repository LICENSE.
