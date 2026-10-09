import {describe, expect, it, vi} from 'vitest';

import {createPersistedPreferences, PREFERENCE_CHANGED, PREFERENCE_HYDRATED, PREFERENCE_PERSISTED} from '../index.js';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return {promise, reject, resolve};
};
const entries = {
  reading: {decode: (raw: unknown) => raw === 'dark' ? raw : undefined, defaultValue: 'system', encode: (v: string) => v, storageKey: 'reading'},
  sound: {decode: (raw: unknown) => raw === 'on' || raw === 'off' ? raw : undefined, defaultValue: 'off', encode: (v: string) => v, storageKey: 'sound'}
};
const setup = () => {
  const storage = {getStorageData: vi.fn(async (_key: string): Promise<unknown> => null), setStorageData: vi.fn(async (_key: string, _value: unknown) => true)};
  return {controller: createPersistedPreferences({entries, storage}), storage};
};

describe('persisted preference memory owner', () => {
  it('exposes independent defaults with no attached storage and snapshot isolation', () => {
    const {controller} = setup();
    expect(controller.getSnapshot().sound).toEqual({hydrated: false, revision: 0, value: 'off'});
    expect(controller.flux.getOptions().storage).toBeUndefined();
    const copy = controller.getSnapshot();
    (copy.sound as {value: string}).value = 'on';
    expect(controller.getSnapshot().sound.value).toBe('off');
  });
  it('updates synchronously before events and preserves reentrant disk invocation order', () => {
    const {controller, storage} = setup();
    storage.setStorageData.mockImplementation(() => new Promise(() => {}));
    controller.flux.addListener(PREFERENCE_CHANGED, (action) => {
      expect(controller.getSnapshot().sound.value).toBe(action.value);
      if(action.value === 'on') { controller.set('sound', 'off'); }
    });
    expect(controller.set('sound', 'on')).toBe('on');
    expect(controller.getSnapshot().sound.value).toBe('off');
    expect(storage.setStorageData.mock.calls).toEqual([['sound', 'on'], ['sound', 'off']]);
  });
  it('functional updates use current committed memory and equal sets increment revisions', () => {
    const {controller} = setup();
    const toggle = (value: string) => value === 'on' ? 'off' : 'on';
    expect(controller.update('sound', toggle)).toBe('on');
    expect(controller.update('sound', toggle)).toBe('off');
    controller.set('sound', 'off');
    expect(controller.getSnapshot().sound.revision).toBe(3);
    expect(() => controller.update('sound', () => { throw Error('updater'); })).toThrow('updater');
    expect(controller.getSnapshot().sound.revision).toBe(3);
  });
  it('memoizes hydration across in-flight and completed calls without writing', async () => {
    const {controller, storage} = setup();
    const read = deferred<unknown>();
    storage.getStorageData.mockReturnValue(read.promise);
    const first = controller.hydrate('sound');
    expect(controller.hydrate('sound')).toBe(first);
    read.resolve('on');
    await first;
    expect(controller.hydrate('sound')).toBe(first);
    expect(storage.getStorageData).toHaveBeenCalledTimes(1);
    expect(storage.setStorageData).not.toHaveBeenCalled();
    expect(controller.getSnapshot().sound).toEqual({hydrated: true, revision: 0, value: 'on'});
  });
  it('restores only untouched entries and hydration listeners see current readiness/value', async () => {
    const {controller, storage} = setup();
    const read = deferred<unknown>();
    storage.getStorageData.mockImplementation((key) => key === 'sound' ? read.promise : Promise.resolve('dark'));
    const event = vi.fn((action) => expect(controller.getSnapshot()[action.entry as 'sound']).toEqual({hydrated: true, revision: action.revision, value: action.value}));
    controller.flux.addListener(PREFERENCE_HYDRATED, event);
    const pending = controller.hydrate('sound');
    controller.set('sound', 'off');
    await controller.hydrate('reading');
    read.resolve('on');
    await pending;
    expect(controller.getSnapshot().sound.value).toBe('off');
    expect(controller.getSnapshot().reading.value).toBe('dark');
    expect(event).toHaveBeenCalledTimes(2);
  });
  it.each([null, undefined, 'invalid', 10, {}])('settles missing/invalid %j without writes', async (raw) => {
    const {controller, storage} = setup();
    storage.getStorageData.mockResolvedValue(raw);
    await controller.hydrate('sound');
    expect(controller.getSnapshot().sound).toEqual({hydrated: true, revision: 0, value: 'off'});
    expect(storage.setStorageData).not.toHaveBeenCalled();
  });
  it.each(['read rejection', 'read throw', 'decode throw'])('settles readiness after %s', async (mode) => {
    const storage = {getStorageData: vi.fn(() => mode === 'read throw' ? (() => { throw Error('read'); })() : mode === 'read rejection' ? Promise.reject(Error('read')) : Promise.resolve('on')), setStorageData: vi.fn(async () => true)};
    const controller = createPersistedPreferences({entries: {...entries, sound: {...entries.sound, decode: () => { throw Error('decode'); }}}, storage});
    await controller.hydrate('sound');
    expect(controller.getSnapshot().sound.hydrated).toBe(true);
    expect(storage.setStorageData).not.toHaveBeenCalled();
  });
  it.each(['false', 'rejection', 'throw', 'encode'])('reports %s failure and preserves choices then permits recovery', async (mode) => {
    const storage = {getStorageData: vi.fn(async () => null), setStorageData: vi.fn((_key: string, _value: unknown) => mode === 'throw' ? (() => { throw Error('write'); })() : mode === 'rejection' ? Promise.reject(Error('write')) : Promise.resolve(mode !== 'false'))};
    let encoderFails = mode === 'encode';
    const controller = createPersistedPreferences({entries: {...entries, sound: {...entries.sound, encode: (v) => { if(encoderFails) { throw Error('encode'); } return v; }}}, storage});
    const listener = vi.fn();
    controller.flux.addListener(PREFERENCE_PERSISTED, listener);
    controller.set('sound', 'on');
    await Promise.resolve();
    await Promise.resolve();
    expect(listener).toHaveBeenCalledWith({entry: 'sound', revision: 1, success: false, type: PREFERENCE_PERSISTED});
    expect(controller.getSnapshot().sound.value).toBe('on');
    encoderFails = false;
    storage.setStorageData.mockResolvedValue(true);
    controller.set('sound', 'off');
    await Promise.resolve();
    expect(listener).toHaveBeenLastCalledWith({entry: 'sound', revision: 2, success: true, type: PREFERENCE_PERSISTED});
  });
  it('disposal suppresses stale completions, removes listeners, rejects calls and leaves intended writes invoked', async () => {
    const {controller, storage} = setup();
    const read = deferred<unknown>();
    const write = deferred<boolean>();
    storage.getStorageData.mockReturnValue(read.promise);
    storage.setStorageData.mockReturnValue(write.promise);
    const listener = vi.fn();
    controller.flux.addListener(PREFERENCE_PERSISTED, listener);
    const hydration = controller.hydrate('sound');
    controller.set('sound', 'on');
    controller.dispose();
    controller.dispose();
    expect(storage.setStorageData).toHaveBeenCalledTimes(1);
    read.resolve('off'); write.resolve(true);
    await hydration;
    expect(listener).not.toHaveBeenCalled();
    expect(controller.flux.eventNames()).toEqual([]);
    expect(() => controller.set('sound', 'off')).toThrow('disposed');
    expect(() => controller.update('sound', (v) => v)).toThrow('disposed');
    expect(() => controller.hydrate('sound')).toThrow('disposed');
  });
  it('rejects empty names, storage keys, duplicate keys and unknown entries', () => {
    const {storage, controller} = setup();
    expect(() => createPersistedPreferences({entries: {'': entries.sound}, storage})).toThrow();
    expect(() => createPersistedPreferences({entries: {sound: {...entries.sound, storageKey: ''}}, storage})).toThrow();
    expect(() => createPersistedPreferences({entries: {...entries, reading: {...entries.reading, storageKey: 'sound'}}, storage})).toThrow();
    expect(() => controller.set('unknown' as 'sound', 'on')).toThrow('Unknown');
    expect(() => controller.hydrate('unknown' as 'sound')).toThrow('Unknown');
  });
  it('fresh factories restore the last successful stored choice', async () => {
    const disk = new Map<string, unknown>();
    const storage = {getStorageData: async (key: string) => disk.get(key), setStorageData: async (key: string, value: unknown) => { disk.set(key, value); return true; }};
    createPersistedPreferences({entries, storage}).set('sound', 'on');
    const relaunched = createPersistedPreferences({entries, storage});
    await relaunched.hydrate('sound');
    expect(relaunched.getSnapshot().sound.value).toBe('on');
  });
});

describe('local choices before first hydration', () => {
  it.each(['set', 'update', 'same-value set'] as const)('preserves %s before hydration even when persistence fails', async (operation) => {
    const storage = {
      getStorageData: vi.fn(async () => operation === 'same-value set' ? 'on' : 'off'),
      setStorageData: vi.fn(async () => false)
    };
    const controller = createPersistedPreferences({entries, storage});
    const choice = operation === 'same-value set' ? 'off' : 'on';
    if(operation === 'update') {
      controller.update('sound', () => choice);
    } else {
      controller.set('sound', choice);
    }
    await controller.hydrate('sound');
    expect(controller.getSnapshot().sound).toEqual({hydrated: true, revision: 1, value: choice});
    expect(storage.getStorageData).toHaveBeenCalledTimes(1);
    expect(storage.setStorageData.mock.calls).toEqual([['sound', choice]]);
  });
});
