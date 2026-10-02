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
  /** Reject backend, JSON, and projection failures instead of legacy null/false fallbacks. */
  throwOnError?: boolean;
}
