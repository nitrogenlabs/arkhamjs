import {describe, expect, it, vi} from 'vitest';

import {createCleanupRegistry} from './cleanupRegistry.js';

describe('cleanup registry', () => {
  it('forwards the reason to unique callbacks and returns an idempotent disposer', async () => {
    const registry = createCleanupRegistry<'clear' | 'reconcile'>();
    const callback = vi.fn();
    const dispose = registry.register(callback);
    registry.register(callback);
    await registry.run('reconcile');

    expect(callback).toHaveBeenCalledExactlyOnceWith('reconcile');
    expect(dispose()).toBe(true);
    expect(dispose()).toBe(false);

    await registry.run('clear');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('attempts every cleanup and waits for settlement despite sync and async failures', async () => {
    const registry = createCleanupRegistry<string>('session_cleanup_failed');
    let release!: () => void;
    const delayed = new Promise<void>((resolve) => {
      release = resolve;
    });
    registry.register(() => {
      throw new Error('secret sync failure');
    });
    registry.register(async () => {
      throw new Error('secret async failure');
    });
    const other = vi.fn(() => delayed);
    registry.register(other);
    const settled = vi.fn();
    const result = registry.run('logout');
    void result.then(settled, settled);

    expect(other).toHaveBeenCalledExactlyOnceWith('logout');

    await Promise.resolve();

    expect(settled).not.toHaveBeenCalled();

    release();

    await expect(result).rejects.toThrow('session_cleanup_failed');
  });

  it('uses a fixed callback snapshot and recovers after a failed run', async () => {
    const registry = createCleanupRegistry<string>();
    const added = vi.fn();
    const second = vi.fn();
    let removeSecond!: () => boolean;
    const removeFirst = registry.register(() => {
      registry.register(added);
      removeSecond();
      throw new Error('failure');
    });
    removeSecond = registry.register(second);

    await expect(registry.run('first')).rejects.toThrow('cleanup_failed');
    expect(second).toHaveBeenCalledExactlyOnceWith('first');
    expect(added).not.toHaveBeenCalled();

    removeFirst();
    await registry.run('next');

    expect(added).toHaveBeenCalledExactlyOnceWith('next');
  });
});
