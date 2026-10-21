import {FluxFramework} from '@nlabs/arkhamjs';
import {describe, expect, it, vi} from 'vitest';

import {createScopedCollection} from './scopedCollection.js';

import type {ScopedCollectionOptions} from './scopedCollection.js';

interface Item {readonly id: string; readonly state: 'draft' | 'pending' | 'failed'}
interface Owner {user: string}
const item: Item = {id: 'retry-1', state: 'pending'};
const isItem = (value: unknown): value is Item => !!value && typeof value === 'object'
  && 'id' in value && typeof value.id === 'string' && 'state' in value
  && ['draft', 'pending', 'failed'].includes(value.state as string);
const fixture = async (overrides: Partial<ScopedCollectionOptions<Item, Owner>> = {}) => {
  let saved: string | null = null;
  const storage = {
    clear: vi.fn(async () => {
      saved = null;
    }),
    read: vi.fn(async (_context: string) => saved),
    write: vi.fn(async (_context: string, value: string) => {
      saved = value;
    })
  };
  const collection = await createScopedCollection<Item, Owner>({
    context: (owner) => JSON.stringify(['drafts-v1', owner.user]),
    event: 'drafts.changed',
    maxItems: 2,
    storage,
    store: 'drafts',
    validate: isItem,
    ...overrides
  });
  return {collection, storage};
};

describe('identity-scoped Flux collection', () => {
  it('publishes only after persistence and updates real Flux before subscribers', async () => {
    // Observe the real core without exposing private Flux through the public helper.
    const addStores = vi.spyOn(FluxFramework.prototype, 'addStores');
    const {collection, storage} = await fixture();
    const flux = addStores.mock.contexts[0] as FluxFramework;
    addStores.mockRestore();
    await collection.bind({user: 'one'});
    const empty = collection.getSnapshot();

    expect(collection.getSnapshot()).toBe(empty);

    const listener = vi.fn(() => {
      expect(flux.getState('drafts')).toEqual(collection.getSnapshot());
      expect(storage.write).toHaveBeenCalled();
    });
    const remove = collection.subscribe(listener);
    await collection.update(() => [item]);

    expect(collection.getSnapshot()).toEqual([item]);
    expect(collection.getSnapshot()).not.toBe(empty);
    expect(listener).toHaveBeenCalledTimes(1);

    remove();
    collection.dispose();
    await flux.dispatch({items: [], type: 'unrelated'});

    expect(flux.getState('drafts')).toEqual([item]);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('keeps plaintext out of ordinary application persistence and middleware', async () => {
    const application = new FluxFramework();
    const writes: unknown[] = [];
    const middleware = vi.fn(async (action) => action);
    // The legacy core init path accesses window; the secure collection never calls it.
    vi.stubGlobal('window', {});
    await application.init({
      middleware: [{name: 'application-logger', postDispatch: middleware}],
      storage: {
        getStorageData: async () => ({}),
        setStorageData: async (_key, value) => {
          writes.push(JSON.stringify(value));
          return true;
        }
      },
      storageWait: 0,
      stores: [{action: (_type, _data, state) => state, initialState: {public: true}, name: 'ordinary'}]
    });
    vi.unstubAllGlobals();
    const {collection, storage} = await fixture();
    await collection.bind({user: 'one'});
    await collection.update(() => [item]);
    await application.clearAppData();

    expect(storage.write).toHaveBeenCalledWith('["drafts-v1","one"]', JSON.stringify([item]));
    expect(writes.length).toBeGreaterThan(0);
    expect(writes.every((value) => !String(value).includes('retry-1'))).toBe(true);
    expect(application.getState('drafts')).toBeUndefined();
    expect(middleware).not.toHaveBeenCalled();
    expect(collection).not.toHaveProperty('flux');
  });

  it('serializes transformations against the latest snapshot and recovers after invalid updates', async () => {
    const {collection, storage} = await fixture();
    await collection.bind({user: 'one'});
    await Promise.all([
      collection.update(() => [item]),
      collection.update((items) => [...items, {...item, id: 'retry-2'}])
    ]);

    await expect(collection.update((items) => [...items, item])).rejects.toThrow('scoped_collection_limit');
    await expect(collection.update(() => [JSON.parse('{}') as Item])).rejects.toThrow('scoped_collection_limit');
    await expect(collection.update(() => {
      throw new Error('app_payload_changed');
    })).rejects.toThrow('app_payload_changed');
    expect(storage.write).toHaveBeenCalledTimes(2);

    await collection.update((items) => items.slice(1));

    expect(collection.getSnapshot()).toEqual([{...item, id: 'retry-2'}]);
  });

  it('restores through the application policy while retaining identity-bound durable data for reconciliation', async () => {
    const {collection, storage} = await fixture({restore: (items) => items.map((entry) => ({...entry, state: 'failed'}))});
    await collection.bind({user: 'one'});
    await collection.update(() => [item]);
    await collection.purge('reconcile');

    expect(collection.getSnapshot()).toEqual([]);
    expect(storage.clear).not.toHaveBeenCalled();

    await collection.bind({user: 'one'});

    expect(collection.getSnapshot()).toEqual([{...item, state: 'failed'}]);

    await collection.purge();

    expect(storage.clear).toHaveBeenCalledOnce();
    await expect(collection.update(() => [item])).rejects.toThrow('scoped_collection_unavailable');

    await collection.bind({user: 'two'});
    await collection.update(() => [item]);

    expect(storage.write).toHaveBeenLastCalledWith('["drafts-v1","two"]', JSON.stringify([item]));
  });

  it.each(['not json', '{}', '[{}]', JSON.stringify([item, item, item])])('clears unreadable or disallowed storage: %s', async (raw) => {
    const {collection, storage} = await fixture();
    storage.read.mockResolvedValueOnce(raw);

    await expect(collection.bind({user: 'one'})).rejects.toThrow('scoped_collection_unavailable');
    expect(collection.getSnapshot()).toEqual([]);
    expect(storage.clear).toHaveBeenCalledOnce();
    await expect(collection.update(() => [item])).rejects.toThrow('scoped_collection_unavailable');
  });

  it('rejects an invalid restore result and masks read and cleanup failures', async () => {
    const {collection, storage} = await fixture({restore: () => [JSON.parse('{}') as Item]});
    storage.clear.mockRejectedValue(new Error('private disk path'));

    await expect(collection.bind({user: 'one'})).rejects.toThrow('scoped_collection_unavailable');

    storage.read.mockRejectedValueOnce(new Error('private ciphertext'));

    await expect(collection.bind({user: 'one'})).rejects.toThrow('scoped_collection_unavailable');
  });

  it('fails closed after writes fail and permits a fresh binding after recovery', async () => {
    const {collection, storage} = await fixture({errors: {limit: 'app_limit', unavailable: 'app_unavailable'}});
    await collection.bind({user: 'one'});

    await expect(collection.update(() => [JSON.parse('{}') as Item])).rejects.toThrow('app_limit');

    storage.write.mockRejectedValueOnce(new Error('private persistence error'));
    storage.clear.mockRejectedValueOnce(new Error('private clear error'));

    await expect(collection.update(() => [item])).rejects.toThrow('app_unavailable');
    expect(collection.getSnapshot()).toEqual([]);
    await expect(collection.update(() => [item])).rejects.toThrow('app_unavailable');

    await collection.bind({user: 'two'});
    await collection.update(() => [item]);

    expect(collection.getSnapshot()).toEqual([item]);
  });

  it('does not hydrate a superseded identity and captures identity before caller mutation', async () => {
    const {collection, storage} = await fixture();
    let release!: (value: string | null) => void;
    storage.read.mockReturnValueOnce(new Promise((resolve) => {
      release = resolve;
    }));
    const owner = {user: 'one'};
    const first = collection.bind(owner);
    owner.user = 'changed';
    await vi.waitFor(() => expect(storage.read).toHaveBeenCalledWith('["drafts-v1","one"]'));
    const second = collection.bind({user: 'two'});
    release(JSON.stringify([item]));
    await Promise.all([first, second]);

    expect(collection.getSnapshot()).toEqual([]);

    await collection.update(() => [item]);

    expect(storage.write).toHaveBeenLastCalledWith('["drafts-v1","two"]', JSON.stringify([item]));
  });

  it('invalidates queued updates immediately at purge and suppresses an in-flight publication', async () => {
    const {collection, storage} = await fixture();
    await collection.bind({user: 'one'});
    let release!: () => void;
    storage.write.mockImplementationOnce(async () => new Promise<void>((resolve) => {
      release = resolve;
    }));
    const first = collection.update(() => [item]);
    await vi.waitFor(() => expect(storage.write).toHaveBeenCalledOnce());
    const listener = vi.fn();
    collection.subscribe(listener);
    const queued = collection.update(() => [{...item, id: 'queued'}]);
    const rejected = queued.catch((error: Error) => error);
    const purge = collection.purge();
    release();
    await Promise.all([first, purge]);

    expect(await rejected).toMatchObject({message: 'scoped_collection_unavailable'});

    expect(collection.getSnapshot()).toEqual([]);
    expect(listener).toHaveBeenCalledOnce();
    expect(storage.write).toHaveBeenCalledOnce();
  });

  it('finishes failed old-identity cleanup before binding a new owner', async () => {
    const {collection, storage} = await fixture();
    let reject!: (error: Error) => void;
    storage.read.mockReturnValueOnce(new Promise((_resolve, fail) => {
      reject = fail;
    }));
    const first = collection.bind({user: 'one'});
    const rejected = first.catch((error: Error) => error);
    await vi.waitFor(() => expect(storage.read).toHaveBeenCalledOnce());
    const second = collection.bind({user: 'two'});
    reject(new Error('old identity disk failure'));
    await second;

    expect(await rejected).toMatchObject({message: 'scoped_collection_unavailable'});

    await collection.update(() => [item]);

    expect(storage.write).toHaveBeenLastCalledWith('["drafts-v1","two"]', JSON.stringify([item]));
    expect(collection.getSnapshot()).toEqual([item]);
    expect(storage.clear).toHaveBeenCalledOnce();
  });

  it('does not cancel a newer binding when an old in-flight write fails', async () => {
    const {collection, storage} = await fixture();
    await collection.bind({user: 'one'});
    let reject!: (error: Error) => void;
    storage.write.mockImplementationOnce(async () => new Promise<void>((_resolve, fail) => {
      reject = fail;
    }));
    const first = collection.update(() => [item]);
    const rejected = first.catch((error: Error) => error);
    await vi.waitFor(() => expect(storage.write).toHaveBeenCalledOnce());
    const second = collection.bind({user: 'two'});
    reject(new Error('old write failure'));
    await second;

    expect(await rejected).toMatchObject({message: 'scoped_collection_unavailable'});

    await collection.update(() => [{...item, id: 'new-owner'}]);

    expect(storage.write).toHaveBeenLastCalledWith('["drafts-v1","two"]', JSON.stringify([{...item, id: 'new-owner'}]));
    expect(collection.getSnapshot()).toEqual([{...item, id: 'new-owner'}]);
    expect(storage.clear).toHaveBeenCalledOnce();
  });

  it('empties memory and revokes writes even when destructive cleanup fails', async () => {
    const {collection, storage} = await fixture();
    await collection.bind({user: 'one'});
    await collection.update(() => [item]);
    storage.clear.mockRejectedValueOnce(new Error('clear failed'));

    await expect(collection.purge()).rejects.toThrow('scoped_collection_unavailable');
    expect(collection.getSnapshot()).toEqual([]);
    await expect(collection.update(() => [item])).rejects.toThrow('scoped_collection_unavailable');

    await collection.bind({user: 'one'});

    expect(collection.getSnapshot()).toEqual([item]);
  });

  it('destroys private data during purge even when a UI subscriber throws', async () => {
    const {collection, storage} = await fixture();
    await collection.bind({user: 'one'});
    await collection.update(() => [item]);
    const remove = collection.subscribe(() => {
      throw new Error('private listener details');
    });

    await expect(collection.purge()).rejects.toThrow('scoped_collection_unavailable');
    expect(storage.clear).toHaveBeenCalledOnce();
    expect(collection.getSnapshot()).toEqual([]);
    await expect(collection.update(() => [item])).rejects.toThrow('scoped_collection_unavailable');

    remove();
    await collection.bind({user: 'one'});

    expect(collection.getSnapshot()).toEqual([]);
  });

  it('preserves cleanup and fixed errors after write or bind failure with throwing subscribers', async () => {
    const {collection, storage} = await fixture({errors: {unavailable: 'app_unavailable'}});
    await collection.bind({user: 'one'});
    await collection.update(() => [item]);
    collection.subscribe(() => {
      throw new Error('private listener details');
    });
    storage.write.mockRejectedValueOnce(new Error('private disk path'));

    await expect(collection.update(() => [item])).rejects.toThrow('app_unavailable');
    expect(storage.clear).toHaveBeenCalledOnce();
    expect(collection.getSnapshot()).toEqual([]);
    await expect(collection.bind({user: 'one'})).rejects.toThrow('app_unavailable');
    expect(storage.clear).toHaveBeenCalledTimes(2);
    await expect(collection.update(() => [item])).rejects.toThrow('app_unavailable');
  });

  it('revokes binding if a subscriber throws only after restored content arrives', async () => {
    const {collection, storage} = await fixture();
    storage.read.mockResolvedValueOnce(JSON.stringify([item]));
    collection.subscribe(() => {
      if(collection.getSnapshot().length) {
        throw new Error('render failed');
      }
    });

    await expect(collection.bind({user: 'one'})).rejects.toThrow('scoped_collection_unavailable');
    expect(storage.clear).toHaveBeenCalledOnce();
    expect(collection.getSnapshot()).toEqual([]);
    await expect(collection.update(() => [item])).rejects.toThrow('scoped_collection_unavailable');
  });

  it.each([0, -1, 1.5, Infinity])('rejects an invalid bound: %s', async (maxItems) => {
    await expect(fixture({maxItems})).rejects.toThrow('scoped_collection_invalid_options');
  });

  it('requires store and event namespaces and treats failed identity encoding as unreadable state', async () => {
    await expect(fixture({event: ''})).rejects.toThrow('scoped_collection_invalid_options');
    await expect(fixture({store: ''})).rejects.toThrow('scoped_collection_invalid_options');

    const {collection, storage} = await fixture({context: () => {
      throw new Error('private owner');
    }});

    await expect(collection.bind({user: 'one'})).rejects.toThrow('scoped_collection_unavailable');
    expect(storage.read).not.toHaveBeenCalled();
    expect(storage.clear).toHaveBeenCalledOnce();

    const empty = await fixture({context: () => ''});

    await expect(empty.collection.bind({user: 'one'})).rejects.toThrow('scoped_collection_unavailable');
  });
});
