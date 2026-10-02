/**
 * Copyright (c) 2018-Present, Nitrogen Labs, Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import {FluxFramework} from '@nlabs/arkhamjs';
import {vi} from 'vitest';

// Mock AsyncStorage before importing NativeStorage
const mockStorage: Record<string, string> = {};

vi.mock('@react-native-async-storage/async-storage', () => {
  return {
    __esModule: true,
    default: {
      getItem: vi.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
        return Promise.resolve();
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
        return Promise.resolve();
      })
    }
  };
});

import {NativeStorage} from './NativeStorage.js';

describe('NativeStorage', () => {
  beforeEach(() => {
    // Clear storage before each test
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('should set async data', async () => {
    const hasExistingData = await NativeStorage.getAsyncData('test');
    expect(hasExistingData).toBeNull();

    const result = await NativeStorage.setAsyncData('test', 'hello world');
    expect(result).toBe(true);

    const hasNewData = await NativeStorage.getAsyncData('test');
    expect(hasNewData).toBe('hello world');
  });

  it('should delete async data', async () => {
    // First set some data
    await NativeStorage.setAsyncData('test', 'hello world');
    const hasExistingData = await NativeStorage.getAsyncData('test');
    expect(hasExistingData).toBe('hello world');

    const result = await NativeStorage.delAsyncData('test');
    expect(result).toBe(true);

    const hasNewData = await NativeStorage.getAsyncData('test');
    expect(hasNewData).toBeNull();
  });
});

describe('configured NativeStorage', () => {
  const createBackend = () => {
    const values = new Map<string, string>();
    return {
      getItem: async (key: string) => values.get(key) ?? null,
      removeItem: async (key: string) => { values.delete(key); },
      setItem: async (key: string, value: string) => { values.set(key, value); },
      values
    };
  };

  it('isolates environments and filters persisted and restored state', async () => {
    const backend = createBackend();
    const select = (value: any) => ({user: {session: {
      token: value.user?.session?.token, userId: value.user?.session?.userId
    }}});
    const storage = new NativeStorage({backend, namespace: 'prod', select, throwOnError: true});
    await storage.setStorageData('app', {password: 'secret', user: {session: {
      password: 'secret', token: 'token-a', userId: 'a'
    }}});
    expect(JSON.parse(backend.values.get('prod.app')!)).toEqual({user: {session: {token: 'token-a', userId: 'a'}}});
    const other = new NativeStorage({backend, namespace: 'dev', select, throwOnError: true});
    expect(await other.getStorageData('app')).toBeNull();
    backend.values.set('prod.app', '{"password":"secret","user":{"session":{"token":"token-b","userId":"b","password":"secret"}}}');
    expect(await storage.getStorageData('app')).toEqual({user: {session: {token: 'token-b', userId: 'b'}}});
  });

  it('snapshots writes and completes a clear after a delayed save', async () => {
    const backend = createBackend();
    let release!: () => void;
    const blocked = new Promise<void>((resolve) => { release = resolve; });
    const savedValues: string[] = [];
    const storage = new NativeStorage({backend: {...backend, setItem: async (key, value) => {
      await blocked;
      savedValues.push(value);
      await backend.setItem(key, value);
    }}, throwOnError: true});
    const state = {user: {session: {token: 'original'}}};
    const saving = storage.setStorageData('app', state);
    state.user.session.token = 'mutated';
    const clearing = storage.setStorageData('app', undefined);
    const reading = storage.getStorageData('app');
    release();
    await saving;
    await clearing;
    expect(await reading).toBeNull();
    expect(backend.values.size).toBe(0);
    expect(JSON.parse(savedValues[0])).toEqual({user: {session: {token: 'original'}}});
    await storage.setStorageData('app', state);
    state.user.session.token = 'again';
    expect(await storage.getStorageData('app')).toEqual({user: {session: {token: 'mutated'}}});
  });

  it('propagates failures without poisoning later operations', async () => {
    const backend = createBackend();
    let failing = true;
    const storage = new NativeStorage({backend: {
      getItem: async (key) => { if(failing) throw new Error('locked'); return backend.getItem(key); },
      removeItem: async (key) => { if(failing) throw new Error('locked'); await backend.removeItem(key); },
      setItem: async (key, value) => { if(failing) throw new Error('locked'); await backend.setItem(key, value); }
    }, throwOnError: true});
    await expect(storage.getStorageData('app')).rejects.toThrow('locked');
    await expect(storage.setStorageData('app', {})).rejects.toThrow('locked');
    await expect(storage.setStorageData('app', undefined)).rejects.toThrow('locked');
    failing = false;
    await storage.setStorageData('app', {token: 'recovered'});
    expect(await storage.getStorageData('app')).toEqual({token: 'recovered'});
  });

  it('rejects corrupt JSON and filter/serialization errors in strict mode', async () => {
    const backend = createBackend();
    backend.values.set('app', 'corrupt');
    const storage = new NativeStorage({backend, throwOnError: true});
    await expect(storage.getStorageData('app')).rejects.toThrow();
    const circular: any = {};
    circular.self = circular;
    await expect(storage.setStorageData('app', circular)).rejects.toThrow();
    const filtered = new NativeStorage({backend, select: () => { throw new Error('invalid session'); }, throwOnError: true});
    await expect(filtered.setStorageData('app', {})).rejects.toThrow('invalid session');
    backend.values.set('app', '{}');
    await expect(filtered.getStorageData('app')).rejects.toThrow('invalid session');
  });

  it('retains legacy fallback behavior when strict mode is disabled', async () => {
    const backend = createBackend();
    backend.values.set('app', 'legacy string');
    const storage = new NativeStorage({backend});
    expect(await storage.getStorageData('app')).toBe('legacy string');
    const unavailable = new NativeStorage({backend: {
      getItem: async () => { throw new Error('unavailable'); },
      removeItem: async () => { throw new Error('unavailable'); },
      setItem: async () => { throw new Error('unavailable'); }
    }});
    expect(await unavailable.getStorageData('app')).toBeNull();
    expect(await unavailable.setStorageData('app', {})).toBe(false);
    expect(await unavailable.setStorageData('app', undefined)).toBe(false);
  });
});


describe('Flux native persistence', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('restores selected session state and persists sign-out through Flux', async () => {
    vi.stubGlobal('window', {});
    const values = new Map<string, string>();
    const storage = new NativeStorage({
      backend: {
        getItem: async (key) => values.get(key) ?? null,
        removeItem: async (key) => { values.delete(key); },
        setItem: async (key, value) => { values.set(key, value); }
      },
      namespace: 'secure.prod',
      select: (state) => state?.user?.session?.token ? {user: {session: state.user.session}} : undefined,
      throwOnError: true
    });
    const first = new FluxFramework();
    await first.init({name: 'account', storage, storageWait: 0});
    await first.setState('user.session', {token: 'persisted', userId: 'learner'});
    await first.setState('password', 'not-persisted');
    const restored = new FluxFramework();
    await restored.init({name: 'account', storage, storageWait: 0});
    expect(restored.getState('user.session')).toEqual({token: 'persisted', userId: 'learner'});
    expect(restored.getState('password', null)).toBeNull();
    await restored.setState('user.session', {});
    const signedOut = new FluxFramework();
    await signedOut.init({name: 'account', storage, storageWait: 0});
    expect(signedOut.getState('user.session', {})).toEqual({});
    expect(values.size).toBe(0);
  });
});

describe('session storage', () => {
  const createBackend = () => {
    const values = new Map<string, string>();
    const writes: string[] = [];
    const removals: string[] = [];
    return {
      getItem: async (key: string) => values.get(key) ?? null,
      removeItem: async (key: string) => { removals.push(key); values.delete(key); },
      setItem: async (key: string, value: string) => { writes.push(value); values.set(key, value); },
      values,
      writes,
      removals
    };
  };
  const select = (state: any) => state?.session?.token ? {session: {
    token: state.session.token, expires: state.session.expires
  }} : undefined;
  const validate = (state: any) => typeof state?.session?.token === 'string'
    && typeof state.session.expires === 'number' && state.session.expires > Date.now();
  const state = () => ({session: {token: 'token', expires: Date.now() + 60_000}});

  it('requires an explicit backend, namespace, projection and restore validator', () => {
    const options = {backend: createBackend(), namespace: 'prod', select, validate};
    for(const key of ['backend', 'namespace', 'select', 'validate']) {
      expect(() => NativeStorage.forSession({...options, [key]: undefined} as any)).toThrow();
    }
    expect(() => NativeStorage.forSession({...options, namespace: ''})).toThrow();
  });

  it('persists only the selected session once across 1000 unrelated state updates', async () => {
    const backend = createBackend();
    const storage = NativeStorage.forSession({backend, namespace: 'prod', select, validate});
    const initial = state();
    await Promise.all(Array.from({length: 1000}, (_, counter) => storage.setStorageData('account', {
      ...initial, counter, password: 'never persist'
    })));
    expect(backend.writes).toEqual([JSON.stringify(initial)]);
    const rotated = {session: {...initial.session, token: 'rotated'}};
    await storage.setStorageData('account', rotated);
    expect(JSON.parse(backend.values.get('prod.account')!)).toEqual(rotated);
    expect(backend.writes).toHaveLength(2);
  });

  it('checks restored expiration and removes invalid credentials', async () => {
    const backend = createBackend();
    const storage = NativeStorage.forSession({backend, namespace: 'prod', select, validate});
    const initial = state();
    await storage.setStorageData('account', initial);
    expect(await storage.getStorageData('account')).toEqual(initial);
    backend.values.set('prod.account', JSON.stringify({session: {token: 'expired', expires: 0}}));
    expect(await storage.getStorageData('account')).toBeNull();
    expect(backend.values.has('prod.account')).toBe(false);
    await storage.setStorageData('account', initial);
    expect(backend.writes).toHaveLength(2);
    backend.values.set('prod.account', 'corrupt');
    await expect(storage.getStorageData('account')).rejects.toThrow();
  });

  it('deletes explicitly even if the projection would retain credentials', async () => {
    const backend = createBackend();
    let release!: () => void;
    const blocked = new Promise<void>((resolve) => { release = resolve; });
    const initial = state();
    const storage = NativeStorage.forSession({backend: {...backend, setItem: async (key, value) => {
      await blocked;
      await backend.setItem(key, value);
    }}, namespace: 'prod', select: () => initial, validate});
    const saving = storage.setStorageData('account', initial);
    const clearing = storage.clearStorageData('account');
    const reading = storage.getStorageData('account');
    release();
    await saving;
    await clearing;
    expect(await reading).toBeNull();
    await storage.setStorageData('account', initial);
    expect(backend.writes).toHaveLength(2);
  });

  it('retries an identical write after a backend failure', async () => {
    const backend = createBackend();
    let failing = true;
    const storage = NativeStorage.forSession({backend: {...backend, setItem: async (key, value) => {
      if(failing) throw new Error('locked');
      await backend.setItem(key, value);
    }}, namespace: 'prod', select, validate});
    const initial = state();
    await expect(storage.setStorageData('account', initial)).rejects.toThrow('locked');
    failing = false;
    await storage.setStorageData('account', initial);
    expect(JSON.parse(backend.values.get('prod.account')!)).toEqual(initial);
  });

  it('keeps ordinary storage writes unchanged unless skipping is enabled', async () => {
    const backend = createBackend();
    const storage = new NativeStorage({backend});
    await storage.setStorageData('app', {value: 1});
    await storage.setStorageData('app', {value: 1});
    expect(backend.writes).toHaveLength(2);
    const optimized = new NativeStorage({backend, skipUnchanged: true});
    await optimized.setStorageData('app', {value: 1});
    await optimized.setStorageData('app', {value: 1});
    await optimized.setStorageData('other', {value: 1});
    expect(backend.writes).toHaveLength(4);
  });

  it('refreshes write tracking from backend reads without retaining legacy fields', async () => {
    const backend = createBackend();
    const initial = state();
    backend.values.set('prod.account', JSON.stringify(initial));
    const storage = NativeStorage.forSession({backend, namespace: 'prod', select, validate});
    expect(await storage.getStorageData('account')).toEqual(initial);
    await storage.setStorageData('account', initial);
    expect(backend.writes).toHaveLength(0);
    backend.values.set('prod.account', JSON.stringify({...initial, password: 'legacy'}));
    expect(await storage.getStorageData('account')).toEqual(initial);
    await storage.setStorageData('account', initial);
    expect(JSON.parse(backend.values.get('prod.account')!)).toEqual(initial);
    expect(backend.writes).toHaveLength(1);
    backend.values.delete('prod.account');
    expect(await storage.getStorageData('account')).toBeNull();
    await storage.setStorageData('account', initial);
    expect(backend.writes).toHaveLength(2);
  });

  it('does not skip retries when a backend changes data before rejecting', async () => {
    const backend = createBackend();
    let failing = false;
    const storage = NativeStorage.forSession({backend: {...backend, setItem: async (key, value) => {
      await backend.setItem(key, value);
      if(failing) throw new Error('write interrupted');
    }}, namespace: 'prod', select, validate});
    const initial = state();
    await storage.setStorageData('account', initial);
    failing = true;
    await expect(storage.setStorageData('account', {session: {...initial.session, token: 'rotated'}}))
      .rejects.toThrow('write interrupted');
    failing = false;
    await storage.setStorageData('account', initial);
    expect(JSON.parse(backend.values.get('prod.account')!)).toEqual(initial);
    expect(backend.writes).toHaveLength(3);
  });

  it('propagates failed invalid-session deletion and supports an explicit retry', async () => {
    const backend = createBackend();
    backend.values.set('prod.account', JSON.stringify({session: {token: 'expired', expires: 0}}));
    let failing = true;
    const storage = NativeStorage.forSession({backend: {...backend, removeItem: async (key) => {
      if(failing) throw new Error('locked');
      await backend.removeItem(key);
    }}, namespace: 'prod', select, validate});
    await expect(storage.getStorageData('account')).rejects.toThrow('locked');
    failing = false;
    await storage.clearStorageData('account');
    expect(await storage.getStorageData('account')).toBeNull();
  });

  it('validates every restore even after a successful save or earlier restore', async () => {
    const backend = createBackend();
    let valid = true;
    const storage = NativeStorage.forSession({backend, namespace: 'prod', select, validate: () => valid});
    const initial = state();
    await storage.setStorageData('account', initial);
    expect(await storage.getStorageData('account')).toEqual(initial);
    valid = false;
    expect(await storage.getStorageData('account')).toBeNull();
    expect(backend.values.size).toBe(0);
  });

  it('skips repeated signed-out projections but always performs explicit deletion', async () => {
    const backend = createBackend();
    const storage = NativeStorage.forSession({backend, namespace: 'prod', select, validate});
    await Promise.all(Array.from({length: 1000}, (_, counter) => storage.setStorageData('account', {counter})));
    expect(backend.removals).toEqual(['prod.account']);
    await storage.clearStorageData('account');
    await storage.clearStorageData('account');
    expect(backend.removals).toHaveLength(3);
    await storage.setStorageData('account', state());
    await storage.setStorageData('account', {});
    expect(backend.values.size).toBe(0);
    expect(backend.removals).toHaveLength(4);
  });

  it('awaits session persistence through Flux while skipping unrelated updates', async () => {
    vi.stubGlobal('window', {});
    try {
      const backend = createBackend();
      const storage = NativeStorage.forSession({backend, namespace: 'prod', select, validate});
      const flux = new FluxFramework();
      await flux.init({name: 'account', storage, storageWait: 0});
      const initial = state();
      await flux.setState('session', initial.session);
      await flux.setState('ui.loading', true);
      expect(backend.writes).toHaveLength(1);
      const restored = new FluxFramework();
      await restored.init({name: 'account', storage, storageWait: 0});
      expect(restored.getState('session')).toEqual(initial.session);
      await flux.setState('session', undefined);
      expect(backend.values.size).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
