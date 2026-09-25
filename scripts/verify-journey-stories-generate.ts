import {
  generateJourneyStory,
  mockDentistModelJson,
  parseJourneyLanguageMode,
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
  if (ok.draft.languageMode !== 'standard') throw new Error('default language mode is standard');

  const literal = await generateJourneyStory(
    {
      scenarioId: 'dentist',
      pointOfView: 'third',
      castCharacterIds: ['tanty_spice', 'roti'],
      languageMode: 'literal',
    },
    { mockModelText: mockDentistModelJson() },
  );
  if (!literal.ok) throw new Error(literal.error);
  if (literal.draft.languageMode !== 'literal') throw new Error('literal mode must stick on the draft');
  if (literal.draft.status === 'published') throw new Error('literal generate must never publish');
  if (literal.draft.pages.length !== 5) throw new Error('literal mode keeps 5 pages');

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

  const badLiteral = await generateJourneyStory(
    {
      scenarioId: 'dentist',
      pointOfView: 'third',
      castCharacterIds: ['tanty_spice'],
      languageMode: 'literal',
    },
    {
      mockModelText: JSON.stringify({
        pages: [
          { role: 'title', title: 'X', text: 'X' },
          { role: 'intro', text: 'Y' },
          { role: 'body_sensory', text: 'Z' },
          { role: 'body_coping', text: 'quiet hands and say it to unlock' },
          { role: 'conclusion', text: 'done' },
        ],
      }),
    },
  );
  if (badLiteral.ok) throw new Error('literal mode must still block banned phrases');
  if (badLiteral.draft?.status === 'published') throw new Error('blocked literal draft must not publish');
  if (badLiteral.draft && badLiteral.draft.languageMode !== 'literal') {
    throw new Error('blocked literal draft keeps language mode');
  }

  if (parseJourneyLanguageMode(undefined) !== 'standard') throw new Error('missing mode is standard');
  if (parseJourneyLanguageMode('literal') !== 'literal') throw new Error('parse literal');
  if (parseJourneyLanguageMode('nope') !== null) throw new Error('unknown mode rejected');

  const savedOpenRouter = process.env.OPENROUTER_API_KEY;
  const savedLlm = process.env.LLM_API_KEY;
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.LLM_API_KEY;
  try {
    const offlineLiteral = await generateJourneyStory({
      scenarioId: 'dentist',
      pointOfView: 'third',
      castCharacterIds: ['tanty_spice'],
      languageMode: 'literal',
    });
    if (offlineLiteral.ok) throw new Error('literal mode must not reuse standard seed pages');

    const offlineStandard = await generateJourneyStory({
      scenarioId: 'dentist',
      pointOfView: 'third',
      castCharacterIds: ['tanty_spice'],
      languageMode: 'standard',
    });
    if (!offlineStandard.ok) throw new Error(offlineStandard.error);
    if (offlineStandard.draft.languageMode !== 'standard') {
      throw new Error('offline standard pages stay standard');
    }
  } finally {
    if (savedOpenRouter === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = savedOpenRouter;
    if (savedLlm === undefined) delete process.env.LLM_API_KEY;
    else process.env.LLM_API_KEY = savedLlm;
  }

  console.log('verify-journey-stories-generate: PASS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
