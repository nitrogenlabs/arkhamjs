import type {FluxFramework} from '../Flux/Flux.js';
import type {PREFERENCE_CHANGED, PREFERENCE_HYDRATED, PREFERENCE_PERSISTED} from './PersistedPreferences.js';

export type PreferenceEntry<T> = Readonly<{
  decode: (raw: unknown) => T | undefined;
  defaultValue: T;
  encode: (value: T) => unknown;
  storageKey: string;
}>;
export type PreferenceEntryState<T> = Readonly<{hydrated: boolean; revision: number; value: T}>;
export type PreferenceState<V extends Record<string, unknown>> = {readonly [K in keyof V]: PreferenceEntryState<V[K]>};
export type PreferenceStorage = Readonly<{
  getStorageData: (key: string) => Promise<unknown>;
  setStorageData: (key: string, value: unknown) => Promise<boolean>;
}>;
export type PersistedPreferencesOptions<V extends Record<string, unknown>> = Readonly<{
  entries: {readonly [K in keyof V]: PreferenceEntry<V[K]>};
  storage: PreferenceStorage;
}>;
export type PersistedPreferences<V extends Record<string, unknown>> = Readonly<{
  dispose: () => void;
  flux: FluxFramework;
  getSnapshot: () => PreferenceState<V>;
  hydrate: <K extends keyof V & string>(entry: K) => Promise<void>;
  set: <K extends keyof V & string>(entry: K, value: V[K]) => V[K];
  update: <K extends keyof V & string>(entry: K, updater: (current: V[K]) => V[K]) => V[K];
}>;
export type PreferenceChangedAction<V extends Record<string, unknown>> = {
  [K in keyof V & string]: Readonly<{entry: K; revision: number; type: typeof PREFERENCE_CHANGED; value: V[K]}>
}[keyof V & string];
export type PreferenceHydratedAction<V extends Record<string, unknown>> = {
  [K in keyof V & string]: Readonly<{entry: K; hydrated: true; revision: number; type: typeof PREFERENCE_HYDRATED; value: V[K]}>
}[keyof V & string];
export type PreferencePersistedAction<V extends Record<string, unknown>> = {
  [K in keyof V & string]: Readonly<{entry: K; revision: number; success: boolean; type: typeof PREFERENCE_PERSISTED}>
}[keyof V & string];
