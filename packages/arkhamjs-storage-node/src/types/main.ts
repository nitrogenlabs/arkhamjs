export interface NodeStorageOptions {
  readonly continuous?: boolean;
  readonly dir?: string;
  readonly encoding?: string;
  readonly forgiveParseErrors?: boolean;
  readonly interval?: boolean | number;
  readonly logging?: any;
  readonly parse?: (text: string, reviver?: (key: any, value: any) => any) => any;
  readonly stringify?: any;
  readonly ttl?: boolean | number;
  readonly expiredInterval?: number;
}
