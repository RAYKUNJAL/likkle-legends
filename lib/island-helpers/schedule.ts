/**
 * Island Helpers — First→Then visual schedule store.
 */
import type { IslandHelpersCharacterId } from './types';

export type ScheduleItem = {
  id: string;
  label: string;
  imageSrc?: string;
  characterId?: IslandHelpersCharacterId;
};

export type FirstThenState = {
  first: ScheduleItem | null;
  then: ScheduleItem | null;
};

export const SCHEDULE_STORAGE_KEY = 'likkle.islandHelpers.schedule.v1';
export const SCHEDULE_EVENT = 'likkle:island-helpers-schedule';

export const DEFAULT_SCHEDULE_CHOICES: ScheduleItem[] = [
  { id: 'story', label: 'Story time', characterId: 'tanty_spice' },
  { id: 'snack', label: 'Snack', characterId: 'roti' },
  { id: 'music', label: 'Music', characterId: 'steelpan_sam' },
  { id: 'outside', label: 'Outside', characterId: 'mango_moko' },
  { id: 'break', label: 'Quiet break', characterId: 'mango_moko' },
  { id: 'wash', label: 'Wash hands', characterId: 'roti' },
];

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

export function loadSchedule(storage?: StorageLike | null): FirstThenState {
  const store = storage === undefined ? getStorage() : storage;
  if (!store) return { first: null, then: null };
  try {
    const raw = store.getItem(SCHEDULE_STORAGE_KEY);
    if (!raw) return { first: null, then: null };
    const parsed = JSON.parse(raw) as FirstThenState;
    return {
      first: parsed.first || null,
      then: parsed.then || null,
    };
  } catch {
    return { first: null, then: null };
  }
}

export function saveSchedule(
  patch: Partial<FirstThenState>,
  storage?: StorageLike | null,
): FirstThenState {
  const store = storage === undefined ? getStorage() : storage;
  const current = loadSchedule(store);
  const next: FirstThenState = {
    first: patch.first !== undefined ? patch.first : current.first,
    then: patch.then !== undefined ? patch.then : current.then,
  };
  if (store) {
    try {
      store.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent(SCHEDULE_EVENT, { detail: next }));
    } catch {
      /* ignore */
    }
  }
  return next;
}

export function speakScheduleLine(state: FirstThenState): string {
  const a = state.first?.label || '…';
  const b = state.then?.label || '…';
  return `First ${a}, then ${b}.`;
}

/** No auto-advance / punishment lockout API — intentional. */
export function hasCompulsionLockout(): boolean {
  return false;
}
