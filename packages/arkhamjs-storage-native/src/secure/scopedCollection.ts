import {FluxFramework} from '@nlabs/arkhamjs';

import type {EncryptedStorage} from './types.js';

export type ScopedCollectionPurgeReason = 'clear' | 'reconcile';

export interface ScopedCollectionOptions<Item, Owner> {
  readonly context: (owner: Owner) => string;
  readonly errors?: {readonly limit?: string; readonly unavailable?: string};
  readonly event: string;
  readonly maxItems: number;
  readonly restore?: (items: readonly Item[]) => readonly Item[];
  readonly storage: EncryptedStorage;
  readonly store: string;
  readonly validate: (value: unknown) => value is Item;
}

/**
 * A bounded, identity-scoped collection backed by a caller-provided encrypted store.
 * Applications choose the allowed payload and restore policy; history is never
 * collected implicitly. Its private Flux instance never receives a general storage
 * adapter or application middleware, so plaintext cannot enter an ordinary store.
 */
export const createScopedCollection = async <Item, Owner>(options: ScopedCollectionOptions<Item, Owner>) => {
  const {context, event, maxItems, restore, storage, store, validate} = options;
  if(!event || !store || !Number.isSafeInteger(maxItems) || maxItems < 1) {
    throw new Error('scoped_collection_invalid_options');
  }
  const unavailable = options.errors?.unavailable ?? 'scoped_collection_unavailable';
  const limit = options.errors?.limit ?? 'scoped_collection_limit';
  const flux = new FluxFramework();
  await flux.addStores([{
    action: (type: string, data: {items: readonly Item[]}, state: readonly Item[]) =>
      (type === event ? data.items : state),
    initialState: [],
    name: store
  }]);
  let activeContext: string | undefined;
  let generation = 0;
  let snapshot: readonly Item[] = [];
  let tail: Promise<unknown> = Promise.resolve();
  const serial = <Result>(operation: () => Promise<Result>): Promise<Result> => {
    const pending = tail.then(operation, operation);
    tail = pending.catch(() => undefined);
    return pending;
  };
  const changed = () => {
    snapshot = flux.getState(store) as readonly Item[];
  };
  flux.on(event, changed);
  const publish = (items: readonly Item[]) => flux.dispatch({items, type: event});
  const valid = (items: unknown): items is readonly Item[] =>
    Array.isArray(items) && items.length <= maxItems && items.every(validate);
  const reset = async (destroy: boolean) => {
    // Subscribers may throw. Their failure must never skip destruction of private data.
    const results = await Promise.allSettled([
      Promise.resolve().then(() => publish([])),
      ...(destroy ? [Promise.resolve().then(() => storage.clear())] : [])
    ]);
    if(results.some((result) => result.status === 'rejected')) {
      throw new Error(unavailable);
    }
  };
  const purge = (reason: ScopedCollectionPurgeReason = 'clear') => {
    generation++;
    activeContext = undefined;
    return serial(() => reset(reason === 'clear'));
  };
  const update = (transform: (items: readonly Item[]) => readonly Item[]) => {
    const identityContext = activeContext;
    const epoch = generation;
    return serial(async () => {
      if(identityContext === undefined || epoch !== generation) {
        throw new Error(unavailable);
      }
      const items = transform(snapshot);
      if(!valid(items)) {
        throw new Error(limit);
      }
      try {
        await storage.write(identityContext, JSON.stringify(items));
        if(epoch === generation) {
          await publish(items);
        }
      } catch{
        if(epoch === generation) {
          activeContext = undefined;
          generation++;
        }
        await reset(true).catch(() => undefined);
        throw new Error(unavailable);
      }
    });
  };
  return {
    bind: (owner: Owner) => {
      const epoch = ++generation;
      activeContext = undefined;
      // Capture the encoded identity before any asynchronous work or owner mutation.
      let identityContext: string | undefined;
      try {
        identityContext = context(owner);
      } catch{
        // A failed encoder is handled like unreadable persisted state below.
      }
      return serial(async () => {
        try {
          await publish([]);
          if(!identityContext) {
            throw new Error();
          }
          const text = await storage.read(identityContext);
          const stored: unknown = text ? JSON.parse(text) : [];
          if(!valid(stored)) {
            throw new Error();
          }
          const items = restore ? restore(stored) : stored;
          if(!valid(items)) {
            throw new Error();
          }
          if(epoch !== generation) {
            return;
          }
          activeContext = identityContext;
          await publish(items);
        } catch{
          if(epoch === generation) {
            activeContext = undefined;
            generation++;
          }
          await reset(true).catch(() => undefined);
          throw new Error(unavailable);
        }
      });
    },
    dispose: () => flux.off(event, changed),
    getSnapshot: () => snapshot,
    purge,
    subscribe: (listener: () => void) => {
      flux.on(event, listener);
      return () => flux.off(event, listener);
    },
    update
  };
};
