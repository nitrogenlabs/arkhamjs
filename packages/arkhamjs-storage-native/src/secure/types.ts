/** A single private value. The key adapter must use device-only secure storage. */
export interface PrivateStorage {
  readonly read: () => Promise<string | null>;
  readonly remove: () => Promise<void>;
  readonly write: (value: string) => Promise<void>;
}

/** Inject authenticated encryption that binds the context as additional authenticated data. */
export interface Cipher {
  readonly decrypt: (value: string, key: string, context: string) => Promise<string>;
  readonly encrypt: (value: string, key: string, context: string) => Promise<string>;
  readonly generateKey: () => Promise<string>;
}

export interface EncryptedStorage {
  readonly clear: () => Promise<void>;
  readonly read: (context: string) => Promise<string | null>;
  readonly write: (context: string, value: string) => Promise<void>;
}

/** File operations are injected; importing the secure entry point loads no native modules. */
export interface JournalSlot {
  readonly exists: () => boolean | Promise<boolean>;
  readonly read: () => Promise<string>;
  readonly remove: () => void | Promise<void>;
  readonly size: () => number | Promise<number>;
  readonly write: (value: string) => void | Promise<void>;
}

export interface JournalStorageOptions {
  readonly maxBytes?: number;
  readonly pointer: PrivateStorage;
  readonly slots: {readonly a: JournalSlot; readonly b: JournalSlot};
}
