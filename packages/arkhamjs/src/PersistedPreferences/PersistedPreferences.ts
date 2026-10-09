import {FluxFramework} from '../Flux/Flux.js';

import type {PersistedPreferences, PersistedPreferencesOptions, PreferenceChangedAction, PreferenceState} from './PersistedPreferences.types.js';

export const PREFERENCE_CHANGED = 'arkhamjs:preference:changed';
export const PREFERENCE_HYDRATED = 'arkhamjs:preference:hydrated';
export const PREFERENCE_PERSISTED = 'arkhamjs:preference:persisted';

/** Owns a memory-only Flux. Consumers may read/subscribe, but must not attach storage or middleware. */
export const createPersistedPreferences = <V extends Record<string, unknown>>(
  {entries, storage}: PersistedPreferencesOptions<V>
): PersistedPreferences<V> => {
  const keys = Object.keys(entries) as (keyof V & string)[];
  const storageKeys = new Set<string>();
  const initialState = {} as PreferenceState<V>;
  keys.forEach((entry) => {
    const descriptor = entries[entry];
    if(!entry.trim() || !descriptor.storageKey.trim() || storageKeys.has(descriptor.storageKey)) {
      throw new TypeError('Preferences require nonempty names and unique nonempty storage keys.');
    }
    storageKeys.add(descriptor.storageKey);
    Object.defineProperty(initialState, entry, {enumerable: true, value: {
      hydrated: false, revision: 0, value: descriptor.defaultValue
    }});
  });

  const flux = new FluxFramework();
  let generation = 0;
  let disposed = false;
  const hydration = new Map<keyof V & string, Promise<void>>();
  void flux.addStores([{
    action: (type: string, data: {entry: keyof V & string; revision: number; value: V[keyof V]}, state: PreferenceState<V>) => {
      if(type !== PREFERENCE_CHANGED && type !== PREFERENCE_HYDRATED) {
        return state;
      }
      return {...state, [data.entry]: {
        hydrated: type === PREFERENCE_HYDRATED || state[data.entry].hydrated,
        revision: data.revision,
        value: data.value
      }};
    },
    initialState,
    name: 'preferences'
  }]);

  const assertEntry = (entry: keyof V & string): void => {
    if(disposed) {
      throw new Error('Preferences controller is disposed.');
    }
    if(!Object.hasOwn(entries, entry)) {
      throw new TypeError(`Unknown preference entry: ${entry}`);
    }
  };
  const getSnapshot = (): PreferenceState<V> => flux.getState<PreferenceState<V>>('preferences');
  const persist = (action: PreferenceChangedAction<V>): void => {
    const currentGeneration = generation;
    const report = (success: boolean): void => {
      if(!disposed && generation === currentGeneration) {
        void flux.dispatch({entry: action.entry, revision: action.revision, success, type: PREFERENCE_PERSISTED});
      }
    };
    try {
      const descriptor = entries[action.entry];
      // Invoke before external change listeners, including reentrant setters. Storage owns ordering.
      const pending = storage.setStorageData(descriptor.storageKey, descriptor.encode(action.value));
      void pending.then((success) => report(success === true), () => report(false));
    } catch {
      report(false);
    }
  };
  flux.addListener(PREFERENCE_CHANGED, persist);

  const set = <K extends keyof V & string>(entry: K, value: V[K]): V[K] => {
    assertEntry(entry);
    const revision = getSnapshot()[entry].revision + 1;
    void flux.dispatch({entry, revision, type: PREFERENCE_CHANGED, value});
    return value;
  };
  const hydrate = <K extends keyof V & string>(entry: K): Promise<void> => {
    assertEntry(entry);
    const existing = hydration.get(entry);
    if(existing) {
      return existing;
    }
    const currentGeneration = generation;
    const revision = getSnapshot()[entry].revision;
    const descriptor = entries[entry];
    // Promise boundary catches both synchronous adapters and rejected reads, and memoizes before invocation.
    const pending = Promise.resolve().then(() => storage.getStorageData(descriptor.storageKey)).then((raw) => {
      return descriptor.decode(raw);
    }).catch(() => undefined).then((restored) => {
      if(disposed || generation !== currentGeneration) {
        return;
      }
      const current = getSnapshot()[entry];
      // A local choice is touched even when made before the first read or equal to the default.
      const value = revision === 0 && current.revision === revision && restored !== undefined ? restored : current.value;
      void flux.dispatch({entry, hydrated: true, revision: current.revision, type: PREFERENCE_HYDRATED, value});
    });
    hydration.set(entry, pending);
    return pending;
  };
  return {
    dispose: () => {
      if(disposed) { return; }
      disposed = true;
      generation += 1;
      flux.removeAllListeners();
    },
    flux,
    getSnapshot,
    hydrate,
    set,
    update: (entry, updater) => {
      assertEntry(entry);
      return set(entry, updater(getSnapshot()[entry].value));
    }
  };
};
