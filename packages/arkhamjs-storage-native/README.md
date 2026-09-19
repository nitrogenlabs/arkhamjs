# @nlabs/arkhamjs-storage-native

React Native AsyncStorage integration and opt-in private persistence for ArkhamJS.
Stable **3.31.0** adds four reusable helpers without changing the existing
`NativeStorage` API.

## Installation

```sh
npm install @nlabs/arkhamjs-storage-native@3.31.0 @nlabs/arkhamjs@3.31.16
```

The package declares `@nlabs/arkhamjs ^3.26.0` and React as peers and retains its
`@react-native-async-storage/async-storage ^3.1.1` dependency for legacy consumers.
Configure AsyncStorage's native integration when using the root entry.

Import private helpers from **`@nlabs/arkhamjs-storage-native/secure`**. That import
graph loads no React Native, AsyncStorage, Expo, native cryptography, or app code.
The package dependency is still installed; selecting `/secure` avoids loading its
native implementation. The host supplies platform bindings.

## Private persistence in 3.31.0

| Helper | Shared behavior | Application responsibility |
| --- | --- | --- |
| `createEncryptedStorage(keys, files, cipher)` | Serializes authenticated persistence; clears the key and ciphertext on failure; blocks reuse until successful explicit cleanup | Device-only key storage, authenticated cipher, stable context and encoding |
| `createJournalStorage({pointer, slots, maxBytes})` | Two-slot commit/recovery and UTF-8 size bounds; default limit is 4 MiB | Secure atomic pointer, private file operations and one live owner per backing store |
| `createScopedCollection<Item, Owner>(options)` | Bounded, validated identity state in a private, storage-free Flux instance; store updates precede subscribed events | Item schema, identity namespace, item limit and restart policy |
| `createCleanupRegistry<Reason>(errorMessage?)` | Attempts every registered cleanup and normalizes failures | Session reasons, cleanup timing and preventing further use after failure |

The following factory composes all four helpers. Its arguments are host adapters,
not implementations supplied by the library.

```ts
import {
  createCleanupRegistry,
  createEncryptedStorage,
  createJournalStorage,
  createScopedCollection
} from '@nlabs/arkhamjs-storage-native/secure';
import type {Cipher, JournalSlot, PrivateStorage} from '@nlabs/arkhamjs-storage-native/secure';

type Draft = {id: string; text: string};
type Owner = {accountId: string; personaId: string};
type CleanupReason = 'logout' | 'account-change' | 'revoked';

const isDraft = (value: unknown): value is Draft => {
  if(typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return Object.keys(item).every((key) => key === 'id' || key === 'text')
    && typeof item.id === 'string' && item.id.length > 0
    && typeof item.text === 'string' && item.text.length <= 4000;
};

export const createPrivateDrafts = async (
  keys: PrivateStorage,
  pointer: PrivateStorage,
  slots: {a: JournalSlot; b: JournalSlot},
  cipher: Cipher
) => {
  const journal = createJournalStorage({maxBytes: 4 * 1024 * 1024, pointer, slots});
  const storage = createEncryptedStorage(keys, journal, cipher);
  const drafts = await createScopedCollection<Draft, Owner>({
    context: ({accountId, personaId}) => JSON.stringify(['drafts-v1', accountId, personaId]),
    event: 'PRIVATE_DRAFTS_CHANGED',
    maxItems: 100,
    storage,
    store: 'privateDrafts',
    validate: isDraft
  });
  const cleanup = createCleanupRegistry<CleanupReason>();
  const unregisterCleanup = cleanup.register(() => drafts.purge('clear'));
  return {cleanup, drafts, unregisterCleanup};
};
```

After constructing one instance, `await drafts.bind(owner)` before updating it.
Use `await drafts.update((items) => [...items, draft])`, read `drafts.getSnapshot()`,
and subscribe through `drafts.subscribe(listener)`. The listener reads the already
updated snapshot; subscription returns a disposer. The collection's private Flux
instance cannot receive ordinary app storage or logging middleware.

On logout, revocation, or account change, await `cleanup.run(reason)` before
allowing another identity to proceed. Handle a rejected cleanup as unavailable
private storage. `purge('clear')` revokes the current owner and destroys durable
data. `purge('reconcile')` preserves encrypted data for an eligible session to
rebind; it is not logout. `dispose()` removes the collection's internal listener;
it does not clear private data or unregister application subscriptions.

`PrivateStorage` manages one string with `read`, `write` and `remove`. `JournalSlot`
adds `exists` and byte `size`. The cipher must authenticate the identity context
as additional authenticated data and use a fresh nonce for each encryption. Store
keys with a device-only secure platform API. There is no plaintext fallback or
built-in crypto provider. Preserve key names, journal paths, encoding and context
when upgrading existing installations; these helpers do not migrate or silently
encrypt ordinary stores. Read [the secure storage guide](SECURE_STORAGE.md) for
adapter contracts, generation guards, cleanup failures, legacy slot recovery and
cross-process limitations.

## Existing AsyncStorage API

The root entry retains ordinary JSON persistence. It does not provide encryption,
compression, selective-path persistence, `NativeStorage.async`, or
`NativeStorage.create`.

```ts
import {Flux} from '@nlabs/arkhamjs';
import {NativeStorage} from '@nlabs/arkhamjs-storage-native';

await Flux.init({
  name: 'preferences',
  storage: new NativeStorage(),
  storageWait: 300
});

const saved = await NativeStorage.setAsyncData('theme', {mode: 'dark'});
const theme: unknown = await NativeStorage.getAsyncData('theme');
const removed = await NativeStorage.delAsyncData('theme');
```

`setAsyncData` and `delAsyncData` return a success boolean; storage errors return
`false`. `getAsyncData` parses JSON, preserves older non-JSON strings, and returns
`null` for missing values or storage errors. Instance methods `getStorageData`
and `setStorageData` implement the Flux storage contract. Keep credentials and
private collections out of ordinary AsyncStorage persistence.

## Documentation and license

- [ArkhamJS](../arkhamjs/README.md)
- [Browser storage](../arkhamjs-storage-browser/README.md)
- [Node storage](../arkhamjs-storage-node/README.md)
- [Secure adapter guide](SECURE_STORAGE.md)
- [Documentation](https://arkhamjs.nitrogenx.co)
- [MIT license](LICENSE)
