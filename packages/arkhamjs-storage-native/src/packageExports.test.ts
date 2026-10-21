import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

describe('published secure entry point', () => {
  it('declares the restored public runtime and declaration entries', () => {
    expect(manifest.exports['./secure']).toEqual({
      import: './lib/secure/index.js',
      require: './lib/secure/index.js',
      types: './lib/secure/index.d.ts'
    });
    expect(manifest.files).toContain('SECURE_STORAGE.md');
  });

  it('resolves the actual public package subpath in Node without a native host or aliases', () => {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
      const secure = await import('@nlabs/arkhamjs-storage-native/secure');
      for(const name of ['createCleanupRegistry', 'createEncryptedStorage', 'createJournalStorage', 'createScopedCollection']) {
        if(typeof secure[name] !== 'function') throw new Error('missing_public_secure_export');
      }
      const cleanup = secure.createCleanupRegistry();
      let calls = 0;
      cleanup.register(() => { calls++; });
      await cleanup.run('clear');
      if(calls !== 1) throw new Error('invalid_public_secure_export');
    `], {cwd: root, encoding: 'utf8', timeout: 10000});
    expect((result.error as NodeJS.ErrnoException | undefined)?.code).toBeUndefined();
    expect(result.status).toBe(0);
  });
});
