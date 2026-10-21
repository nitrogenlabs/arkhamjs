import type {Cipher, EncryptedStorage, PrivateStorage} from './types.js';

/** Serialize access and destroy both key and ciphertext on failure, without a plaintext fallback. */
export const createEncryptedStorage = (
  keys: PrivateStorage, files: PrivateStorage, cipher: Cipher
): EncryptedStorage => {
  let generation = 0;
  let tail: Promise<unknown> = Promise.resolve();
  let blocked = false;
  const serial = <T>(operation: () => Promise<T>): Promise<T> => {
    const pending = tail.then(operation, operation);
    tail = pending.catch(() => undefined);
    return pending;
  };
  const destroy = () => Promise.allSettled([
    Promise.resolve().then(() => keys.remove()),
    Promise.resolve().then(() => files.remove())
  ]);
  const fail = async (): Promise<never> => {
    blocked = true;
    await destroy();
    throw new Error('private_storage_unavailable');
  };
  return {
    clear: (): Promise<void> => {
      generation++;
      return serial(async () => {
        const result = await destroy();
        if(result.some((item) => item.status === 'rejected')) {
          await fail();
        }
        blocked = false;
      });
    },
    read: (context: string): Promise<string | null> => {
      const epoch = generation;
      return serial(async () => {
        if(blocked) {
          throw new Error('private_storage_unavailable');
        }
        if(epoch !== generation) {
          return null;
        }
        try {
          const value = await files.read();
          if(value === null) {
            return null;
          }
          const key = await keys.read();
          if(!key) {
            return fail();
          }
          const decrypted = await cipher.decrypt(value, key, context);
          return epoch === generation ? decrypted : null;
        } catch{
          return fail();
        }
      });
    },
    write: (context: string, value: string): Promise<void> => {
      const epoch = generation;
      return serial(async () => {
        if(blocked) {
          throw new Error('private_storage_unavailable');
        }
        if(epoch !== generation) {
          return;
        }
        try {
          let key = await keys.read();
          if(!key) {
            key = await cipher.generateKey();
            await keys.write(key);
          }
          const encrypted = await cipher.encrypt(value, key, context);
          if(epoch !== generation) {
            return;
          }
          await files.write(encrypted);
        } catch{
          await fail();
        }
      });
    }
  };
};
