import {
  generateJourneyStory,
  mockDentistModelJson,
} from '../lib/island-helpers/journey-stories/generate';
import { JOURNEY_PAGE_ROLES } from '../lib/island-helpers/journey-stories/types';

async function main() {
  const ok = await generateJourneyStory(
    {
      scenarioId: 'dentist',
      pointOfView: 'third',
      castCharacterIds: ['tanty_spice', 'roti'],
    },
    { mockModelText: mockDentistModelJson() },
  );
  if (!ok.ok) throw new Error(ok.error);
  if (ok.draft.status !== 'ready') throw new Error('must be ready');
  if (ok.draft.pages.length !== 5) throw new Error('5 pages');
  if (!ok.draft.pages.every((p, i) => p.role === JOURNEY_PAGE_ROLES[i])) {
    throw new Error('roles mismatch');
  }
  if (ok.draft.status === 'published') throw new Error('generate must never publish');

  const bad = await generateJourneyStory(
    {
      scenarioId: 'dentist',
      pointOfView: 'third',
      castCharacterIds: ['tanty_spice'],
    },
    {
      mockModelText: JSON.stringify({
        pages: [
          { role: 'title', title: 'X', text: 'X' },
          { role: 'intro', text: 'Y' },
          { role: 'body_sensory', text: 'Z' },
          { role: 'body_coping', text: 'look at my eyes please' },
          { role: 'conclusion', text: 'done' },
        ],
      }),
    },
  );
  if (bad.ok) throw new Error('unsafe must not ok');
  if (bad.draft && bad.draft.status === 'published') throw new Error('unsafe must not publish');

  console.log('verify-journey-stories-generate: PASS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
