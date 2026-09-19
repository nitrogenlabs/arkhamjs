import type {JournalStorageOptions, PrivateStorage} from './types.js';

/** Commit a bounded ciphertext value by updating a secure pointer after the inactive slot is written. */
export const createJournalStorage = (
  {maxBytes = 4 * 1024 * 1024, pointer, slots}: JournalStorageOptions
): PrivateStorage => {
  if(!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new TypeError('private_storage_limit');
  }
  let generation = 0;
  let tail: Promise<unknown> = Promise.resolve();
  const serial = <T>(operation: () => Promise<T>): Promise<T> => {
    const pending = tail.then(operation, operation);
    tail = pending.catch(() => undefined);
    return pending;
  };
  const bounded = (size: number): void => {
    if(!Number.isSafeInteger(size) || size < 0 || size > maxBytes) {
      throw new Error('private_storage_limit');
    }
  };
  const activeSlot = async (): Promise<'a' | 'b'> => {
    const slot = await pointer.read();
    if(slot !== null && slot !== 'a' && slot !== 'b') {
      throw new Error('private_storage_unavailable');
    }
    if(slot !== null && !await slots[slot].exists()) {
      throw new Error('private_storage_unavailable');
    }
    // Slot a is the legacy single-file location. An orphaned slot b is an interrupted first commit.
    if(slot === null && !await slots.a.exists() && await slots.b.exists()) {
      throw new Error('private_storage_unavailable');
    }
    return slot || 'a';
  };
  return {
    read: (): Promise<string | null> => {
      const epoch = generation;
      return serial(async () => {
        if(epoch !== generation) {
          return null;
        }
        const current = slots[await activeSlot()];
        if(!await current.exists()) {
          return null;
        }
        bounded(await current.size());
        const value = await current.read();
        bounded(new TextEncoder().encode(value).byteLength);
        return epoch === generation ? value : null;
      });
    },
    remove: (): Promise<void> => {
      generation++;
      return serial(async () => {
        const result = await Promise.allSettled([
          Promise.resolve().then(() => pointer.remove()),
          ...[slots.a, slots.b].map(async (slot) => {
            if(await slot.exists()) {
              await slot.remove();
            }
          })
        ]);
        if(result.some((item) => item.status === 'rejected')) {
          throw new Error('private_storage_unavailable');
        }
      });
    },
    write: (value: string): Promise<void> => {
      const epoch = generation;
      return serial(async () => {
        if(epoch !== generation) {
          return;
        }
        bounded(new TextEncoder().encode(value).byteLength);
        const next = await activeSlot() === 'a' ? 'b' : 'a';
        await slots[next].write(value);
        if(epoch === generation) {
          await pointer.write(next);
        }
      });
    }
  };
};
