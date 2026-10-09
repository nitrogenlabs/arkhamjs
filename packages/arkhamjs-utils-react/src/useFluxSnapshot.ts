import {useEffect, useRef, useState} from 'react';

import {useFlux} from './useFlux.js';

const readPath = <T>(snapshot: unknown, key: string, fallback: T): T => {
  const value = key.split('.').reduce<unknown>((current, part) => {
    if(typeof current !== 'object' || current === null || Array.isArray(current)) {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, snapshot);
  return value === undefined ? fallback : value as T;
};

/** Select full Flux event snapshots; the first fallback remains stable for this mount. */
export const useFluxSnapshot = <T>(key: string, defaultValue: T): T => {
  const flux = useFlux();
  const fallback = useRef(defaultValue);
  const [value, setValue] = useState<T>(() => {
    if(!flux) {
      throw new Error('useFluxSnapshot requires a FluxProvider');
    }
    return readPath(flux.getState(), key, fallback.current);
  });

  useEffect(() => {
    const sync = (snapshot?: unknown) => {
      setValue(readPath(snapshot === undefined ? flux.getState() : snapshot, key, fallback.current));
    };
    flux.on('arkhamjs', sync);
    sync();
    return () => { flux.off('arkhamjs', sync); };
  }, [flux, key]);

  return value;
};
