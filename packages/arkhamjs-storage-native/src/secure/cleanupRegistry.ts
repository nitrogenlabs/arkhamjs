export type CleanupCallback<Reason> = (reason: Reason) => void | Promise<void>;

/** Runs every registered cleanup, including when a callback throws synchronously. */
export const createCleanupRegistry = <Reason>(errorMessage = 'cleanup_failed') => {
  const callbacks = new Set<CleanupCallback<Reason>>();
  return {
    register: (callback: CleanupCallback<Reason>) => {
      callbacks.add(callback);
      return () => callbacks.delete(callback);
    },
    run: async (reason: Reason): Promise<void> => {
      const results = await Promise.allSettled([...callbacks].map(async (clear) => clear(reason)));
      if(results.some((result) => result.status === 'rejected')) {
        throw new Error(errorMessage);
      }
    }
  };
};
