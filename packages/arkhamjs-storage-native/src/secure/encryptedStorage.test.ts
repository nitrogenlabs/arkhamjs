import {webcrypto} from 'node:crypto';
import {describe, expect, it, vi} from 'vitest';

import {createEncryptedStorage} from './encryptedStorage.js';

import type {Cipher, PrivateStorage} from './types.js';

const memory = (): PrivateStorage => {
  let value: string | null = null;
  return {read: vi.fn(async () => value), remove: vi.fn(async () => {
    value = null;
  }), write: vi.fn(async (next) => {
    value = next;
  })};
};
const cipher: Cipher = {
  decrypt: async (value, key, context) => {
    const bytes = Buffer.from(value, 'base64');
    const imported = await webcrypto.subtle.importKey('raw',
      Buffer.from(key,
        'base64'),
      'AES-GCM',
      false,
      ['decrypt']);
    return new TextDecoder().decode(await webcrypto.subtle.decrypt({additionalData: new TextEncoder().encode(context),
      iv: bytes.subarray(0,
        12),
      name: 'AES-GCM'},
    imported,
    bytes.subarray(12)));
  },
  encrypt: async (value, key, context) => {
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    const imported = await webcrypto.subtle.importKey('raw',
      Buffer.from(key,
        'base64'),
      'AES-GCM',
      false,
      ['encrypt']);
    const encrypted = await webcrypto.subtle.encrypt({additionalData: new TextEncoder().encode(context),
      iv,
      name: 'AES-GCM'},
    imported,
    new TextEncoder().encode(value));
    return Buffer.concat([iv, Buffer.from(encrypted)]).toString('base64');
  },
  generateKey: async () => Buffer.from(webcrypto.getRandomValues(new Uint8Array(32))).toString('base64')
};

describe('private encrypted storage', () => {
  it('round-trips real AES-GCM ciphertext bound to identity without plaintext or keys in the file', async () => {
    const keys = memory();
    const files = memory();
    const storage = createEncryptedStorage(keys, files, cipher);

    expect(await storage.read('u1:p1')).toBeNull();

    await storage.write('u1:p1', 'An unsent private hello');

    expect(await storage.read('u1:p1')).toBe('An unsent private hello');
    expect(await files.read()).not.toContain('private hello');
    expect(await files.read()).not.toContain(await keys.read());

    await storage.write('u1:p1', 'Second draft');

    expect(keys.write).toHaveBeenCalledTimes(1);

    await storage.clear();

    expect(await keys.read()).toBeNull();
    expect(await files.read()).toBeNull();
  });

  it('fails closed on another persona, ciphertext corruption, missing key and inaccessible storage', async () => {
    await Promise.all(['persona',
      'corrupt',
      'empty',
      'missing',
      'read',
      'write',
      'keywrite',
      'clear'].map(async (failure) => {
      const keys = memory();
      const files = memory();
      const storage = createEncryptedStorage(keys, files, cipher);
      await storage.write('u1:p1', 'private');
      if(failure === 'corrupt') {
        await files.write('invalid');
      }
      if(failure === 'empty') {
        await files.write('');
      }
      if(failure === 'missing') {
        await keys.remove();
      }
      if(failure === 'read') {
        vi.mocked(files.read).mockRejectedValue(new Error('secret'));
      }
      if(failure === 'write') {
        vi.mocked(files.write).mockRejectedValue(new Error('secret'));
      }
      if(failure === 'keywrite') {
        await keys.remove();
        vi.mocked(keys.write).mockRejectedValue(new Error('secret'));
      }
      if(failure === 'clear') {
        vi.mocked(files.remove).mockRejectedValue(new Error('secret'));
      }
      let operation: Promise<unknown>;
      if(failure === 'clear') {
        operation = storage.clear();
      } else if(failure === 'write' || failure === 'keywrite') {
        operation = storage.write('u1:p1', 'next');
      } else {
        operation = storage.read(failure === 'persona' ? 'u1:p2' : 'u1:p1');
      }

      await expect(operation).rejects.toThrow('private_storage_unavailable');
      await expect(storage.read('u1:p1')).rejects.toThrow('private_storage_unavailable');
      await expect(storage.write('u1:p1', 'late')).rejects.toThrow('private_storage_unavailable');
    }));
  });

  it('does not let queued or in-flight writes restore data after clear', async () => {
    const keys = memory();
    const files = memory();
    let resolve!: (value: string) => void;
    const slow = {...cipher, encrypt: vi.fn(() => new Promise<string>((done) => {
      resolve = done;
    }))};
    const storage = createEncryptedStorage(keys, files, slow);
    const pending = storage.write('identity', 'draft');
    await vi.waitFor(() => expect(slow.encrypt).toHaveBeenCalled());
    const queued = storage.write('identity', 'queued');
    const clearing = storage.clear();
    resolve('ciphertext');
    await Promise.all([pending, queued, clearing]);

    expect(files.write).not.toHaveBeenCalled();
    expect(await keys.read()).toBeNull();
  });
});

test('allows a fresh identity only after explicit successful destruction of a failed private store', async () => {
  const keys = memory();
  const files = memory();
  const storage = createEncryptedStorage(keys, files, cipher);
  await storage.write('first', 'old draft');

  await expect(storage.read('different')).rejects.toThrow('private_storage_unavailable');

  await storage.clear();
  await storage.write('different', 'new draft');

  expect(await storage.read('different')).toBe('new draft');
});

test('invalidates both in-flight and queued plaintext reads as soon as clear is requested', async () => {
  const keys = memory();
  const files = memory();
  let resolve!: (value: string) => void;
  const decrypt = vi.fn(() => new Promise<string>((done) => {
    resolve = done;
  }));
  const storage = createEncryptedStorage(keys, files, {...cipher, decrypt});
  await storage.write('identity', 'old draft');
  const pending = storage.read('identity');
  await vi.waitFor(() => expect(decrypt).toHaveBeenCalled());
  const queued = storage.read('identity');
  const clearing = storage.clear();
  resolve('old draft');

  expect(await pending).toBeNull();
  expect(await queued).toBeNull();

  await clearing;

  expect(decrypt).toHaveBeenCalledTimes(1);
  expect(await files.read()).toBeNull();
});

test('clears a write already committed to the file and then permits a newly queued identity', async () => {
  const keys = memory();
  const files = memory();
  let resolve!: () => void;
  const underlying = files.write;
  vi.mocked(files.write).mockImplementationOnce(async (value) => {
    await underlying(value);
    await new Promise<void>((done) => {
      resolve = done;
    });
  });
  const storage = createEncryptedStorage(keys, files, cipher);
  const pending = storage.write('old', 'old draft');
  await vi.waitFor(() => expect(files.write).toHaveBeenCalled());
  const clearing = storage.clear();
  const fresh = storage.write('new', 'new draft');
  resolve();
  await Promise.all([pending, clearing, fresh]);

  expect(await storage.read('new')).toBe('new draft');
  expect(keys.write).toHaveBeenCalledTimes(2);
});

test('attempts both destructions even when one adapter throws synchronously', async () => {
  const keys = memory();
  const files = memory();
  const storage = createEncryptedStorage(keys, files, cipher);
  await storage.write('identity', 'draft');
  vi.mocked(keys.remove).mockImplementation(() => {
    throw new Error('native secret');
  });

  await expect(storage.clear()).rejects.toThrow('private_storage_unavailable');

  expect(files.remove).toHaveBeenCalledTimes(2);
  expect(await files.read()).toBeNull();
  await expect(storage.read('identity')).rejects.toThrow('private_storage_unavailable');

  vi.mocked(keys.remove).mockResolvedValue();
  await storage.clear();

  expect(await storage.read('identity')).toBeNull();
});
