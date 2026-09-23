/**
 * Journey Stories — publish into kids library shape (reader-compatible).
 */
import { canMarkPublished, type JourneyStoryDraft } from './types';
import type { KidsLibraryStory } from '@/lib/library-stories';

export type PublishedJourneyLibraryStory = KidsLibraryStory & {
  tradition: string;
  category: string;
  _journeyDraftId?: string;
};

function assertPublishable(draft: JourneyStoryDraft) {
  if (draft.status === 'published') return;
  if (!canMarkPublished(draft)) {
    throw new Error('Publish blocked: edit gate / safety / pages incomplete');
  }
}

export function journeyDraftToLibraryStory(draft: JourneyStoryDraft): PublishedJourneyLibraryStory {
  assertPublishable(draft);

  const titlePage = draft.pages.find((p) => p.role === 'title');
  const title =
    (titlePage?.title || titlePage?.text || `${draft.scenarioLabel}`).trim() || 'Journey Story';
  const summary = draft.pages
    .filter((p) => p.role !== 'title')
    .map((p) => p.text)
    .join(' ')
    .slice(0, 220);
  const id = draft.libraryStoryId || `journey-${draft.id}`;
  const slug = id;
  const cover =
    draft.pages.find((p) => p.imageUrl)?.imageUrl ||
    '/images/island-helpers/journey-title.svg';

  const pages = draft.pages.map((p, index) => ({
    pageNumber: index + 1,
    text: p.role === 'title' && p.title ? `${p.title}. ${p.text}` : p.text,
    imageUrl: p.imageUrl || '/images/island-helpers/journey-intro.svg',
  }));

  const content = {
    pages: pages.map((p) => ({
      pageNumber: p.pageNumber,
      text: p.text,
      imageUrl: p.imageUrl,
      image_url: p.imageUrl,
    })),
    glossary: [],
    journey_story: true,
    scenario_id: draft.scenarioId,
  };

  return {
    id,
    slug,
    title,
    summary,
    cover_image_url: cover,
    island_code: 'TT',
    island_theme: 'Caribbean',
    tradition: 'journey_stories',
    category: 'Journey Stories',
    age_track: 'mini',
    age_group: '5-6',
    tier_required: 'free',
    reading_time_minutes: 5,
    is_active: true,
    pages,
    content,
    _journeyDraftId: draft.id,
  };
}

/** Map for PremiumStoryReader / toReaderStory-compatible raw row. */
export function journeyDraftToStoriesLibraryRow(draft: JourneyStoryDraft) {
  const kids = journeyDraftToLibraryStory(draft);
  return {
    id: kids.id,
    slug: kids.slug,
    title: kids.title,
    summary: kids.summary,
    cover_image_url: kids.cover_image_url,
    island_code: kids.island_code,
    age_track: kids.age_track,
    tradition: 'journey_stories',
    category: 'Journey Stories',
    tier_required: 'free',
    estimated_reading_time_minutes: 5,
    is_active: true,
    content: kids.content,
    content_json: kids.content,
  };
}
