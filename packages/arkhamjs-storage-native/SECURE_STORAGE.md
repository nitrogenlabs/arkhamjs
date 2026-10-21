# Private persistence

Introduced in `@nlabs/arkhamjs-storage-native@3.31.0` and restored in `3.32.1` after the
`3.32.0` package omitted the secure public subpath. The `3.32.0` NativeStorage implementation is unchanged.

Import the opt-in helpers from `@nlabs/arkhamjs-storage-native/secure`. This subpath does not load
React Native, AsyncStorage, Expo, or any product code. The existing root `NativeStorage` API retains
its existing behavior; these helpers do not silently encrypt existing stores.

## Encrypted storage

```ts
import {createEncryptedStorage, createJournalStorage} from '@nlabs/arkhamjs-storage-native/secure';
import type {Cipher, JournalSlot, PrivateStorage} from '@nlabs/arkhamjs-storage-native/secure';

// Inject the host's secure key store, secure commit pointer, two private files and cipher.
const createPrivateStore = (
  keys: PrivateStorage,
  pointer: PrivateStorage,
  slots: {a: JournalSlot; b: JournalSlot},
  cipher: Cipher
) => createEncryptedStorage(keys, createJournalStorage({maxBytes: 4 * 1024 * 1024, pointer, slots}), cipher);
```

`PrivateStorage` reads, writes and removes one string. `Cipher` supplies `generateKey()`,
`encrypt(plaintext, key, context)` and `decrypt(ciphertext, key, context)`. The application must use
authenticated encryption, bind the context as additional authenticated data, generate a fresh nonce
per encryption, and keep the key in device-only secure storage. AES-256-GCM with a 12-byte random
nonce and 16-byte tag is the Phantaze adapter's current configuration. The shared package does not
select or import a cryptographic implementation.

The returned store supports `read(context)`, `write(context, plaintext)`, and `clear()`. Access is
serialized. Requesting `clear()` immediately invalidates queued writes and pending reads, then destroys
the device key and ciphertext. Reads interrupted by clearing return `null`; writes interrupted by
clearing do not persist the old value. A write already inside its file adapter finishes before the
queued destruction runs. A new operation after `clear()` was requested executes after destruction.

Read, decryption, encryption, or storage failures attempt both key and ciphertext removal, expose only
`private_storage_unavailable`, and block further use until an explicit successful `clear()`. There is
no plaintext fallback. Key destruction makes remaining ciphertext unreadable when file deletion fails;
if the platform refuses both removals, the helper remains blocked and the application must handle that
failure. Do not ignore a failed cleanup or allow a new session to use the old data.

Use a stable, collision-free context containing the application's account/identity namespace. Keep
storage names and cipher encoding stable for an existing installation. The shared package never
chooses account identifiers, filenames or key names. Reusing a device key for another identity without
clearing causes an authenticated context mismatch when reading the previous identity's ciphertext.

## Ciphertext journal

`createJournalStorage({pointer, slots, maxBytes})` returns `PrivateStorage`. A `JournalSlot` exposes
`exists()`, `size()` in bytes, `read()`, `write(value)` and `remove()`. The adapter must finish a slot
write before resolving; the pointer adapter must commit each complete string atomically. Slot names
and pointer names belong to the host application.

Writes complete the inactive slot before changing the secure pointer to `a` or `b`. A failed staging
write or interrupted pointer commit leaves the previously selected slot intact. The default limit is
4 MiB; reads validate both metadata and the returned UTF-8 byte count, and writes validate their UTF-8
byte count. Invalid pointers, missing selected files, and an orphaned slot `b` without a pointer fail
closed. Removal attempts both slots and the pointer, even if one deletion fails.

For compatibility with prior single-file stores, a missing pointer selects slot `a` when it exists.
Both slots may exist in this legacy state; slot `a` still wins. The next successful write selects `b`.
This compatibility rule cannot distinguish a lost pointer from a legacy file. Applications requiring
rollback detection must supply a separately versioned migration or stronger platform storage contract.

Create one live journal/encrypted-store owner for each key/pointer/file tuple. Serialization is per
instance; it is not a cross-process lock. Constructing a new owner after a restart reads the committed
pointer and needs no in-memory state. Wrap the journal with `createEncryptedStorage` for authenticated
confidentiality and blocked-on-failure behavior; the journal alone only commits ciphertext strings.

## Identity-scoped Flux collections

Await `createScopedCollection<Item, Owner>(options)` to create a validated collection in its own private,
storage-free Flux instance. The instance is never exposed and receives no application middleware, so a
caller's ordinary persistence or logging cannot receive private collection data. Only the injected
encrypted storage saves the collection. Options include `context(owner)`, an event name, a store name, `maxItems`, a `validate` type guard,
and an `EncryptedStorage`. Optional `restore(items)` maps persisted items into restart state, and
`errors.limit`/`errors.unavailable` customize fixed error messages.

The collection exposes `bind(owner)`, `update(transform)`, `getSnapshot()`, `subscribe(listener)`,
`purge(reason)` and `dispose()`. Bind captures the identity context; stale restores and queued writes
cannot publish after the identity changes. Updates serialize against the latest snapshot and validate
items before saving. Store changes happen before their Flux event is dispatched. Subscription returns
a disposer. Product payloads, identity encoding and restart retry policy remain application-owned.

Use `purge('clear')` for logout, account changes and revocation: it invalidates the owner, empties the
store and destroys durable data. `purge('reconcile')` deliberately preserves encrypted data while
clearing the in-memory owner so an eligible session can rebind and reconcile it. Applications must
choose the appropriate lifecycle policy rather than treating reconciliation as logout.
Cleanup attempts encrypted deletion even if a subscription callback throws; a failed publication or
deletion rejects with the configured unavailable error and leaves the owner revoked.

## Cleanup coordination

`createCleanupRegistry<Reason>(errorMessage?)` returns `register(callback)` and `run(reason)`.
Registration returns a disposer. Each run snapshots unique callbacks, attempts every callback with
`Promise.allSettled`, and rejects with the fixed configured error (`cleanup_failed` by default) if any
callback failed. A failed callback cannot prevent other registered stores or resources from clearing.
The application remains responsible for defining session reasons, awaiting completion and preventing
an invalid session from proceeding after a cleanup failure.
