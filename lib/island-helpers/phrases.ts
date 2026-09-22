/**
 * Island Helpers — phrase board model + CRUD (localStorage).
 */
import { SEED_PHRASES } from './seed-phrases';
import {
  IslandHelpersCharacterId,
  PHRASES_EVENT,
  PHRASES_STORAGE_KEY,
} from './types';

export type { IslandHelpersCharacterId };

export type PhraseCard = {
  id: string;
  characterId: IslandHelpersCharacterId;
  text: string;
  imageSrc?: string;
  sortOrder: number;
  source: 'seed' | 'custom';
  speakVoiceId?: string;
};

export type PhraseBoardState = {
  cards: PhraseCard[];
  /** Soft-deleted seed ids (seeds themselves are never removed from the pack). */
  hiddenSeedIds: string[];
  version: 1;
};

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

function emptyState(): PhraseBoardState {
  return { cards: [], hiddenSeedIds: [], version: 1 };
}

function readState(storage?: StorageLike | null): PhraseBoardState {
  const store = storage === undefined ? getStorage() : storage;
  if (!store) return emptyState();
  try {
    const raw = store.getItem(PHRASES_STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<PhraseBoardState>;
    return {
      cards: Array.isArray(parsed.cards) ? parsed.cards.filter((c) => c?.source === 'custom') : [],
      hiddenSeedIds: Array.isArray(parsed.hiddenSeedIds) ? parsed.hiddenSeedIds : [],
      version: 1,
    };
  } catch {
    return emptyState();
  }
}

function writeState(state: PhraseBoardState, storage?: StorageLike | null): void {
  const store = storage === undefined ? getStorage() : storage;
  if (store) {
    try {
      store.setItem(PHRASES_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(PHRASES_EVENT, { detail: state }));
    } catch {
      /* ignore */
    }
  }
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `custom:${crypto.randomUUID()}`;
  }
  return `custom:${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Merged board: seeds (minus hidden) + custom cards. Deleting a seed id is a no-op for the pack. */
export function getBoard(storage?: StorageLike | null): PhraseBoardState {
  const state = readState(storage);
  const hidden = new Set(state.hiddenSeedIds);
  const seeds: PhraseCard[] = SEED_PHRASES.filter((s) => !hidden.has(s.id)).map((s) => ({ ...s }));
  const customs = state.cards.filter((c) => c.source === 'custom');
  return {
    cards: [...seeds, ...customs].sort((a, b) => {
      if (a.characterId !== b.characterId) return a.characterId.localeCompare(b.characterId);
      return a.sortOrder - b.sortOrder;
    }),
    hiddenSeedIds: state.hiddenSeedIds,
    version: 1,
  };
}

export function listByCharacter(
  characterId: IslandHelpersCharacterId,
  storage?: StorageLike | null,
): PhraseCard[] {
  return getBoard(storage).cards.filter((c) => c.characterId === characterId);
}

export function addCustomPhrase(
  input: { characterId: IslandHelpersCharacterId; text: string; imageSrc?: string },
  storage?: StorageLike | null,
): PhraseCard {
  const text = (input.text || '').trim();
  if (!text) throw new Error('Phrase text is required');
  const state = readState(storage);
  const siblings = state.cards.filter((c) => c.characterId === input.characterId);
  const card: PhraseCard = {
    id: newId(),
    characterId: input.characterId,
    text,
    imageSrc: input.imageSrc?.trim() || undefined,
    sortOrder: siblings.length + 100,
    source: 'custom',
  };
  state.cards.push(card);
  writeState(state, storage);
  return card;
}

export function updateCustomPhrase(
  id: string,
  patch: { text?: string; imageSrc?: string },
  storage?: StorageLike | null,
): PhraseCard | null {
  const state = readState(storage);
  const idx = state.cards.findIndex((c) => c.id === id && c.source === 'custom');
  if (idx < 0) return null;
  const current = state.cards[idx];
  const next: PhraseCard = {
    ...current,
    text: patch.text !== undefined ? patch.text.trim() : current.text,
    imageSrc: patch.imageSrc !== undefined ? (patch.imageSrc.trim() || undefined) : current.imageSrc,
  };
  if (!next.text) throw new Error('Phrase text is required');
  state.cards[idx] = next;
  writeState(state, storage);
  return next;
}

/**
 * Remove a custom phrase. Attempting to delete a seed id is a no-op
 * (seeds stay in the pack; we do not hide them in Cut 1 delete API).
 */
export function removePhrase(id: string, storage?: StorageLike | null): boolean {
  if (id.startsWith('seed:')) {
    return false; // no-op for seeds
  }
  const state = readState(storage);
  const before = state.cards.length;
  state.cards = state.cards.filter((c) => c.id !== id);
  if (state.cards.length === before) return false;
  writeState(state, storage);
  return true;
}

export function subscribePhrases(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onCustom = () => listener();
  const onStorage = (e: StorageEvent) => {
    if (e.key === PHRASES_STORAGE_KEY) listener();
  };
  window.addEventListener(PHRASES_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(PHRASES_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}
