import {describe, expect, it, vi} from 'vitest';

import {createJournalStorage} from './journalStorage.js';

import type {JournalSlot, PrivateStorage} from './types.js';

const fixture = (maxBytes?: number) => {
  let selected: string | null = null;
  const data = new Map<string, string>();
  const pointer: PrivateStorage = {
    read: vi.fn(async () => selected),
    remove: vi.fn(async () => {
      selected = null;
    }),
    write: vi.fn(async (value) => {
      selected = value;
    })
  };
  const slot = (name: string): JournalSlot => ({
    exists: vi.fn(() => data.has(name)),
    read: vi.fn(async () => data.get(name)!),
    remove: vi.fn(() => {
      data.delete(name);
    }),
    size: vi.fn(() => new TextEncoder().encode(data.get(name) || '').byteLength),
    write: vi.fn((value) => {
      data.set(name, value);
    })
  });
  const slots = {a: slot('a'), b: slot('b')};
  const options = {maxBytes, pointer, slots};
  return {data, options, pointer, slots, storage: createJournalStorage(options)};
};

describe('ciphertext journal', () => {
  it('alternates slots, commits only after writing and restores through another instance', async () => {
    const {data, options, pointer, slots, storage} = fixture();

    expect(await storage.read()).toBeNull();

    await storage.write('first ciphertext');

    expect(await pointer.read()).toBe('b');
    expect(slots.a.write).not.toHaveBeenCalled();
    expect(await createJournalStorage(options).read()).toBe('first ciphertext');

    await storage.write('second ciphertext');

    expect(await pointer.read()).toBe('a');
    expect(data.get('b')).toBe('first ciphertext');
    expect(await createJournalStorage(options).read()).toBe('second ciphertext');

    await storage.remove();

    expect(await pointer.read()).toBeNull();
    expect(data.size).toBe(0);

    await storage.write('after clear');

    expect(await storage.read()).toBe('after clear');
  });

  it('restores the legacy slot-a file without a pointer and upgrades on the next write', async () => {
    const {data, pointer, storage} = fixture();
    data.set('a', 'legacy ciphertext');

    expect(await storage.read()).toBe('legacy ciphertext');

    await storage.write('migrated ciphertext');

    expect(await pointer.read()).toBe('b');
    expect(data.get('a')).toBe('legacy ciphertext');
    expect(await storage.read()).toBe('migrated ciphertext');
  });

  it.each(['invalid', 'a', 'b', null])('rejects invalid or missing selected slots (%s)', async (selected) => {
    const {data, pointer, storage} = fixture();
    if(selected === null) {
      data.set('b', 'orphaned first commit');
    } else {
      await pointer.write(selected);
    }

    await expect(storage.read()).rejects.toThrow('private_storage_unavailable');
    await expect(storage.write('new ciphertext')).rejects.toThrow('private_storage_unavailable');
  });

  it('keeps the previously committed ciphertext after interrupted staging or pointer commit', async () => {
    const {data, options, pointer, slots, storage} = fixture();
    await storage.write('committed');
    vi.mocked(slots.a.write).mockImplementationOnce(() => {
      data.set('a', 'torn');
      throw new Error('interrupted file write');
    });

    await expect(storage.write('replacement')).rejects.toThrow('interrupted file write');
    expect(await createJournalStorage(options).read()).toBe('committed');

    vi.mocked(pointer.write).mockRejectedValueOnce(new Error('interrupted pointer commit'));

    await expect(storage.write('staged but uncommitted')).rejects.toThrow('interrupted pointer commit');
    expect(await createJournalStorage(options).read()).toBe('committed');
  });

  it('bounds UTF-8 byte counts on write, metadata and actual reads', async () => {
    const {data, slots, storage} = fixture(4);
    await storage.write('four');

    expect(await storage.read()).toBe('four');
    await expect(storage.write('ééé')).rejects.toThrow('private_storage_limit');

    data.set('b', 'oversized');

    await expect(storage.read()).rejects.toThrow('private_storage_limit');

    vi.mocked(slots.b.size).mockReturnValue(1);

    await expect(storage.read()).rejects.toThrow('private_storage_limit');
    expect(slots.b.read).toHaveBeenCalledTimes(2);
  });

  it.each([0, -1, 1.5, Infinity, NaN])('rejects an invalid limit (%s)', (limit) => {
    expect(() => fixture(limit)).toThrow('private_storage_limit');
  });

  it.each([-1, 0.5, Infinity, NaN])('rejects invalid file size metadata (%s)', async (size) => {
    const {slots, storage} = fixture();
    await storage.write('ciphertext');
    vi.mocked(slots.b.size).mockReturnValue(size);

    await expect(storage.read()).rejects.toThrow('private_storage_limit');
    expect(slots.b.read).not.toHaveBeenCalled();
  });

  it('invalidates in-flight and queued reads when destruction is requested', async () => {
    const {slots, storage} = fixture();
    await storage.write('ciphertext');
    let resolve!: (value: string) => void;
    vi.mocked(slots.b.read).mockImplementation(() => new Promise<string>((done) => {
      resolve = done;
    }));
    const pending = storage.read();
    await vi.waitFor(() => expect(slots.b.read).toHaveBeenCalled());
    const queued = storage.read();
    const removing = storage.remove();
    resolve('ciphertext');

    expect(await pending).toBeNull();
    expect(await queued).toBeNull();

    await removing;

    expect(slots.b.read).toHaveBeenCalledTimes(1);
  });

  it('does not commit in-flight or queued writes after destruction was requested', async () => {
    const {data, pointer, slots, storage} = fixture();
    let resolve!: () => void;
    vi.mocked(slots.b.write).mockImplementation(async (value) => {
      data.set('b', value);
      await new Promise<void>((done) => {
        resolve = done;
      });
    });
    const pending = storage.write('in flight');
    await vi.waitFor(() => expect(slots.b.write).toHaveBeenCalled());
    const queued = storage.write('queued');
    const removing = storage.remove();
    resolve();
    await Promise.all([pending, queued, removing]);

    expect(pointer.write).not.toHaveBeenCalled();
    expect(data.size).toBe(0);
  });

  it('attempts every removal even when pointer deletion throws synchronously', async () => {
    const {data, pointer, slots, storage} = fixture();
    await storage.write('first');
    await storage.write('second');
    vi.mocked(pointer.remove).mockImplementation(() => {
      throw new Error('native secret');
    });

    await expect(storage.remove()).rejects.toThrow('private_storage_unavailable');
    expect(slots.a.remove).toHaveBeenCalled();
    expect(slots.b.remove).toHaveBeenCalled();
    expect(data.size).toBe(0);
  });
});
