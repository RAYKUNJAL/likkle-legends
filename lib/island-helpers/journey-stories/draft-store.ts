/**
 * Journey Stories draft store — localStorage MVP (SSR-safe).
 */
import {
  JOURNEY_STORIES_EVENT,
  JOURNEY_STORIES_STORAGE_KEY,
  canMarkPublished,
  filterChildVisible,
  type JourneyStoryDraft,
  type JourneyStoryStatus,
} from './types';

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

function getStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `js-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function listDrafts(storage?: StorageLike | null): JourneyStoryDraft[] {
  const store = storage === undefined ? getStorage() : storage;
  if (!store) return [];
  try {
    const raw = store.getItem(JOURNEY_STORIES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as JourneyStoryDraft[]) : [];
  } catch {
    return [];
  }
}

function persist(drafts: JourneyStoryDraft[], storage?: StorageLike | null) {
  const store = storage === undefined ? getStorage() : storage;
  if (store) {
    try {
      store.setItem(JOURNEY_STORIES_STORAGE_KEY, JSON.stringify(drafts));
    } catch {
      /* quota */
    }
  }
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(JOURNEY_STORIES_EVENT, { detail: drafts }));
    } catch {
      /* ignore */
    }
  }
}

export function getDraft(id: string, storage?: StorageLike | null): JourneyStoryDraft | null {
  return listDrafts(storage).find((d) => d.id === id) || null;
}

export function createDraft(
  partial: Omit<JourneyStoryDraft, 'id' | 'version' | 'createdAt' | 'updatedAt'> & {
    id?: string;
    pages?: JourneyStoryDraft['pages'];
    status?: JourneyStoryStatus;
    safetyFlags?: string[];
  },
  storage?: StorageLike | null,
): JourneyStoryDraft {
  const stamp = nowIso();
  const draft: JourneyStoryDraft = {
    id: partial.id || newId(),
    version: 1,
    status: partial.status || 'draft',
    scenarioId: partial.scenarioId,
    scenarioLabel: partial.scenarioLabel,
    childName: partial.childName,
    pointOfView: partial.pointOfView,
    castCharacterIds: partial.castCharacterIds || [],
    pages: partial.pages || [],
    safetyFlags: partial.safetyFlags || [],
    libraryStoryId: partial.libraryStoryId,
    createdAt: stamp,
    updatedAt: stamp,
    publishedAt: partial.publishedAt,
    publishWithoutPictures: partial.publishWithoutPictures,
  };
  const all = listDrafts(storage);
  all.unshift(draft);
  persist(all, storage);
  return draft;
}

export function updateDraft(
  id: string,
  patch: Partial<JourneyStoryDraft>,
  storage?: StorageLike | null,
): JourneyStoryDraft {
  const all = listDrafts(storage);
  const idx = all.findIndex((d) => d.id === id);
  if (idx < 0) throw new Error(`Draft not found: ${id}`);
  const next: JourneyStoryDraft = {
    ...all[idx],
    ...patch,
    id: all[idx].id,
    version: 1,
    updatedAt: nowIso(),
  };
  all[idx] = next;
  persist(all, storage);
  return next;
}

export function deleteDraft(id: string, storage?: StorageLike | null): void {
  persist(
    listDrafts(storage).filter((d) => d.id !== id),
    storage,
  );
}

/** Child library must only see published. */
export function listPublishedForChild(storage?: StorageLike | null): JourneyStoryDraft[] {
  return filterChildVisible(listDrafts(storage));
}

/**
 * Transition to published only after edit gate checks.
 * Throws if pages/safety/images incomplete.
 */
export function markPublished(
  id: string,
  libraryStoryId: string,
  storage?: StorageLike | null,
): JourneyStoryDraft {
  const draft = getDraft(id, storage);
  if (!draft) throw new Error('Draft not found');
  if (!canMarkPublished(draft)) {
    throw new Error('Cannot publish: need ready status, 5 safe pages, and images (or publish-without-pictures).');
  }
  return updateDraft(
    id,
    {
      status: 'published',
      libraryStoryId,
      publishedAt: nowIso(),
    },
    storage,
  );
}

export function archiveDraft(id: string, storage?: StorageLike | null): JourneyStoryDraft {
  return updateDraft(id, { status: 'archived' }, storage);
}

export function subscribeDrafts(listener: (drafts: JourneyStoryDraft[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onCustom = (e: Event) => {
    const detail = (e as CustomEvent<JourneyStoryDraft[]>).detail;
    listener(detail || listDrafts());
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === JOURNEY_STORIES_STORAGE_KEY) listener(listDrafts());
  };
  window.addEventListener(JOURNEY_STORIES_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(JOURNEY_STORIES_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

/** In-memory store for verify scripts (no window). */
export function createMemoryStorage(seed: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...seed };
  return {
    data,
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
    removeItem(key: string) {
      delete data[key];
    },
  };
}
