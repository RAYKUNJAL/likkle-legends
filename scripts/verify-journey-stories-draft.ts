import {
  canMarkPublished,
  filterChildVisible,
  type JourneyStoryDraft,
} from '../lib/island-helpers/journey-stories/types';
import {
  createDraft,
  createMemoryStorage,
  listPublishedForChild,
  markPublished,
  updateDraft,
} from '../lib/island-helpers/journey-stories/draft-store';

const mem = createMemoryStorage();
const draft = createDraft(
  {
    scenarioId: 'dentist',
    scenarioLabel: 'Visiting the dentist',
    pointOfView: 'third',
    castCharacterIds: ['tanty_spice', 'roti'],
  },
  mem,
);
if (draft.status !== 'draft') throw new Error('new draft must be draft');

try {
  markPublished(draft.id, 'lib-1', mem);
  throw new Error('should not publish without 5 pages');
} catch {
  /* expected */
}

const pages = (['title', 'intro', 'body_sensory', 'body_coping', 'conclusion'] as const).map(
  (role) => ({
    role,
    title: role === 'title' ? 'Test' : undefined,
    text: `Text for ${role}`,
    imageUrl: `/images/island-helpers/journey-${role}.svg`,
    coachingLineCount: 0,
  }),
);

const ready = updateDraft(draft.id, { status: 'ready', pages, safetyFlags: [] }, mem);
if (!canMarkPublished(ready)) throw new Error('ready+images should be publishable');

const childBefore = filterChildVisible([ready]);
if (childBefore.length !== 0) throw new Error('ready must be hidden from child');

const published = markPublished(ready.id, 'journey-test-1', mem);
if (published.status !== 'published') throw new Error('status published');
if (listPublishedForChild(mem).length !== 1) throw new Error('child sees published');

console.log('verify-journey-stories-draft: PASS');
