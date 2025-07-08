export interface BrowserStorageOptions {
  readonly type?: 'local' | 'session';
  readonly prefix?: string;
  readonly compression?: boolean;
  readonly maxSize?: number; // in bytes
  readonly ttl?: number; // time to live in milliseconds
}

export interface StorageData {
  readonly value: any;
  readonly timestamp: number;
  readonly ttl?: number;
}

export type StorageType = 'local' | 'session';

export interface StorageInterface {
  readonly length: number;
  readonly getItem: (key: string) => string | null;
  readonly setItem: (key: string, value: string) => void;
  readonly removeItem: (key: string) => void;
  readonly clear: () => void;
  readonly key: (index: number) => string | null;
}
