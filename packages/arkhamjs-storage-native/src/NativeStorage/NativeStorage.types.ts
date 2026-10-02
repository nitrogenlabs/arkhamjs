/** String storage boundary; pass secure platform APIs without adding a platform dependency. */
export interface NativeStorageBackend {
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  setItem(key: string, value: string): Promise<void>;
}

export interface NativeStorageOptions {
  backend?: NativeStorageBackend;
  /** Stable environment prefix. Use a different namespace for each API environment. */
  namespace?: string;
  /** Pure projection applied on both save and restore. Return undefined to remove persisted data. */
  select?: (value: any) => unknown;
  /** Reject backend, JSON, projection and validation failures instead of legacy null/false fallbacks. */
  throwOnError?: boolean;
  /** Skip unchanged projected data, including absence. Requires exclusive writer ownership. */
  skipUnchanged?: boolean;
  /** Validate projected restored data. False deletes the stored entry and restores null. */
  validate?: (value: any) => boolean;
}

/** Session persistence requires an explicitly supplied secure backend and account contract. */
export interface NativeSessionStorageOptions extends Omit<NativeStorageOptions, 'throwOnError'> {
  backend: NativeStorageBackend;
  namespace: string;
  select: (value: any) => unknown;
  validate: (value: any) => boolean;
}
