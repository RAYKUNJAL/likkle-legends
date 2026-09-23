/**
 * Merge published Journey Stories into kids library lists (client-side).
 */
import { listPublishedForChild } from './draft-store';
import { journeyDraftToLibraryStory, type PublishedJourneyLibraryStory } from './publish';
import type { KidsLibraryStory } from '@/lib/library-stories';

export function listPublishedJourneyKidsStories(): PublishedJourneyLibraryStory[] {
  try {
    return listPublishedForChild()
      .map((d) => {
        try {
          return journeyDraftToLibraryStory(d);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as PublishedJourneyLibraryStory[];
  } catch {
    return [];
  }
}

export function mergeJourneyIntoKidsLibrary(official: KidsLibraryStory[]): KidsLibraryStory[] {
  const journey = listPublishedJourneyKidsStories();
  const seen = new Set(official.map((s) => s.id));
  const extra = journey.filter((s) => !seen.has(s.id));
  return [...official, ...extra];
}

export function findPublishedJourneyStory(idOrSlug: string): PublishedJourneyLibraryStory | null {
  return (
    listPublishedJourneyKidsStories().find((s) => s.id === idOrSlug || s.slug === idOrSlug) ||
    null
  );
}
