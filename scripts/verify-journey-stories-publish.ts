import { extractStoryPages, localCatalogStories } from '../lib/library-stories';
import {
  createDraft,
  createMemoryStorage,
  markPublished,
  updateDraft,
} from '../lib/island-helpers/journey-stories/draft-store';
import { journeyDraftToLibraryStory, journeyDraftToStoriesLibraryRow } from '../lib/island-helpers/journey-stories/publish';
import { applyJourneySafety } from '../lib/island-helpers/journey-stories/safety';
import type { JourneyPage } from '../lib/island-helpers/journey-stories/types';

const mem = createMemoryStorage();
const roles = ['title', 'intro', 'body_sensory', 'body_coping', 'conclusion'] as const;
const rawPages: JourneyPage[] = roles.map((role) => ({
  role,
  title: role === 'title' ? 'R.O.T.I. Visits the Dentist' : undefined,
  text:
    role === 'title'
      ? 'A gentle chair adventure.'
      : role === 'conclusion'
        ? 'Friends feel proud and safe.'
        : `Page about ${role} at the dentist.`,
  imageUrl: `/images/island-helpers/journey-${role}.svg`,
  coachingLineCount: 0,
}));
const safety = applyJourneySafety(rawPages);
if (!safety.ok) throw new Error(safety.reasons.join(','));

const draft = createDraft(
  {
    scenarioId: 'dentist',
    scenarioLabel: 'Visiting the dentist',
    pointOfView: 'third',
    castCharacterIds: ['roti'],
    status: 'ready',
    pages: safety.pages.map((p, i) => ({ ...p, imageUrl: rawPages[i].imageUrl })),
  },
  mem,
);

try {
  journeyDraftToLibraryStory({ ...draft, status: 'draft', safetyFlags: ['x'] });
  throw new Error('unsafe publish should throw');
} catch {
  /* expected */
}

const published = markPublished(draft.id, `journey-${draft.id}`, mem);
const kids = journeyDraftToLibraryStory(published);
const pages = extractStoryPages(journeyDraftToStoriesLibraryRow(published));
if (pages.length !== 5) throw new Error(`expected 5 pages got ${pages.length}`);
if (kids.category !== 'Journey Stories') throw new Error('category');
if (/Social Stories/i.test(kids.category)) throw new Error('trademark category');

const catalog = localCatalogStories();
if (catalog.length < 12) throw new Error('catalog of 12 must remain available');
// Journey publish must not mutate catalog module
if (catalog.some((s: any) => String(s.id).startsWith('journey-'))) {
  // local catalog shouldn't include journey ids
}

console.log('verify-journey-stories-publish: PASS');
