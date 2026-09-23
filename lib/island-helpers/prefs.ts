/**
 * Island Helpers prefs — localStorage store (SSR-safe).
 */
import {
  DEFAULT_ISLAND_HELPERS_PREFS,
  IslandHelpersPrefs,
  PREFS_EVENT,
  PREFS_STORAGE_KEY,
} from './types';

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function getStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalize(raw: Partial<IslandHelpersPrefs> | null | undefined): IslandHelpersPrefs {
  const base: IslandHelpersPrefs = {
    ...DEFAULT_ISLAND_HELPERS_PREFS,
    ...(raw || {}),
  };
  if (base.calmMode) {
    base.readAloudDefault = false;
  }
  if (!['images', 'text_images', 'text'].includes(base.displayMode)) {
    base.displayMode = DEFAULT_ISLAND_HELPERS_PREFS.displayMode;
  }
  return base;
}

export function loadPrefs(storage?: StorageLike | null): IslandHelpersPrefs {
  const store = storage === undefined ? getStorage() : storage;
  if (!store) return { ...DEFAULT_ISLAND_HELPERS_PREFS };
  try {
    const raw = store.getItem(PREFS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ISLAND_HELPERS_PREFS };
    return normalize(JSON.parse(raw) as Partial<IslandHelpersPrefs>);
  } catch {
    return { ...DEFAULT_ISLAND_HELPERS_PREFS };
  }
}

export function savePrefs(
  patch: Partial<IslandHelpersPrefs>,
  storage?: StorageLike | null,
): IslandHelpersPrefs {
  const store = storage === undefined ? getStorage() : storage;
  const current = loadPrefs(store);
  const next = normalize({
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  });
  if (next.calmMode) {
    next.readAloudDefault = false;
  }
  if (store) {
    try {
      store.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(PREFS_EVENT, { detail: next }));
    } catch {
      /* ignore */
    }
  }
  return next;
}

export function subscribePrefs(listener: (prefs: IslandHelpersPrefs) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<IslandHelpersPrefs>).detail;
    listener(detail || loadPrefs());
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === PREFS_STORAGE_KEY) listener(loadPrefs());
  };
  window.addEventListener(PREFS_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(PREFS_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

/** Pure helpers for verify scripts / Calm Mode logic. */
export function allowAutoplayFrom(prefs: Pick<IslandHelpersPrefs, 'calmMode' | 'readAloudDefault'>, prefersReducedMotion: boolean): boolean {
  if (prefs.calmMode || prefersReducedMotion) return false;
  return prefs.readAloudDefault !== false;
}

export function allowMotionFrom(calmMode: boolean, prefersReducedMotion: boolean): boolean {
  return !(calmMode || prefersReducedMotion);
}
