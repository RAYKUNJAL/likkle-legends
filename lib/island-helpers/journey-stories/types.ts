/**
 * Journey Stories — types + status machine (Cut 2).
 * Public name: Journey Stories. Never trademarked social-story product name.
 */

import type { IslandHelpersCharacterId } from '../types';

export type JourneyStoryStatus = 'draft' | 'generating' | 'ready' | 'published' | 'archived';

export type JourneyPageRole = 'title' | 'intro' | 'body_sensory' | 'body_coping' | 'conclusion';

/** Parent reading option. `literal` = short, direct sentences. Never a diagnosis label. */
export type JourneyLanguageMode = 'standard' | 'literal';

export const JOURNEY_PAGE_ROLES: JourneyPageRole[] = [
  'title',
  'intro',
  'body_sensory',
  'body_coping',
  'conclusion',
];

export type JourneyImageStatus = 'pending' | 'ready' | 'failed' | 'reused';

export type JourneyPage = {
  role: JourneyPageRole;
  title?: string;
  text: string;
  imageUrl?: string | null;
  imageStatus?: JourneyImageStatus;
  coachingLineCount: number;
};

export type JourneyStoryDraft = {
  id: string;
  version: 1;
  status: JourneyStoryStatus;
  scenarioId: string | 'custom';
  scenarioLabel: string;
  childName?: string;
  pointOfView: 'first' | 'third';
  /** Omitted on older drafts; treat missing as standard. */
  languageMode?: JourneyLanguageMode;
  castCharacterIds: IslandHelpersCharacterId[];
  pages: JourneyPage[];
  safetyFlags: string[];
  libraryStoryId?: string;
  /** Postgres row id for queued pictures. Omitted until a parent asks for art. */
  serverStoryId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  /** Parent explicitly allows text-only publish when images unavailable */
  publishWithoutPictures?: boolean;
};

export const JOURNEY_STORIES_STORAGE_KEY = 'likkle.islandHelpers.journeyStories.v1';
export const JOURNEY_STORIES_EVENT = 'likkle:island-helpers-journey-stories';

export function isChildVisibleStatus(status: JourneyStoryStatus): boolean {
  return status === 'published';
}

export function canMarkPublished(draft: Pick<JourneyStoryDraft, 'pages' | 'status' | 'safetyFlags' | 'publishWithoutPictures'>): boolean {
  if (draft.pages.length !== 5) return false;
  if (draft.safetyFlags.length > 0) return false;
  if (!['ready', 'draft'].includes(draft.status) && draft.status !== 'ready') {
    // allow ready only (and regenerating edits stay ready)
  }
  if (draft.status !== 'ready') return false;
  const allText = draft.pages.every((p) => (p.text || '').trim().length > 0);
  if (!allText) return false;
  const allImages = draft.pages.every((p) => Boolean(p.imageUrl));
  if (!allImages && !draft.publishWithoutPictures) return false;
  return true;
}

export function filterChildVisible(drafts: JourneyStoryDraft[]): JourneyStoryDraft[] {
  return drafts.filter((d) => isChildVisibleStatus(d.status));
}
