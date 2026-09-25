import {
  buildJourneyIllustrationPrompt,
  illustrateJourneyPages,
  JOURNEY_SENSORY_STYLE_ANCHOR,
  placeholderForRole,
} from '../lib/island-helpers/journey-stories/illustrate';
import type { JourneyPage, JourneyStoryDraft } from '../lib/island-helpers/journey-stories/types';

const roles = ['title', 'intro', 'body_sensory', 'body_coping', 'conclusion'] as const;

const pages: JourneyPage[] = roles.map((role) => ({
  role,
  title: role === 'title' ? 'Dentist day' : undefined,
  text: `Plain words for ${role}.`,
  imageUrl: null,
  coachingLineCount: 0,
}));

const draft: JourneyStoryDraft = {
  id: 'illustrate-test',
  version: 1,
  status: 'ready',
  scenarioId: 'dentist',
  scenarioLabel: 'Visiting the dentist',
  pointOfView: 'third',
  languageMode: 'literal',
  castCharacterIds: ['tanty_spice'],
  pages,
  safetyFlags: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const prompt = buildJourneyIllustrationPrompt(draft, pages[2]);
if (!prompt.includes(JOURNEY_SENSORY_STYLE_ANCHOR)) {
  throw new Error('illustration prompt must append the sensory style anchor');
}
for (const needle of [
  'soft sensory-friendly lighting',
  'uncluttered background',
  'calm island colors',
  'no text or letters in the image',
  'no scary medical gore',
  'composition focused on the action that matches the page text',
  'busy highly-detailed scenes are a fail for comprehension',
]) {
  if (!JOURNEY_SENSORY_STYLE_ANCHOR.includes(needle) || !prompt.includes(needle)) {
    throw new Error(`style anchor missing: ${needle}`);
  }
}
if (!prompt.includes('flat illustration')) throw new Error('prompt must reuse the existing flat illustration style');
if (!/do not invent a new character design/i.test(prompt)) {
  throw new Error('prompt must not invent a new character look');
}
if (/https?:\/\//i.test(prompt)) throw new Error('style anchor must not invent a remote image URL');

async function main() {
  const savedFal = process.env.FAL_KEY;
  delete process.env.FAL_KEY;
  try {
    const illustrated = await illustrateJourneyPages(draft, { allowPlaceholders: true });
    if (!illustrated.ok) throw new Error(illustrated.error);
    if (!illustrated.usedPlaceholders) throw new Error('missing FAL key must use placeholders');
    for (const page of illustrated.pages) {
      const expected = placeholderForRole(page.role);
      if (page.imageUrl !== expected) throw new Error(`expected local placeholder ${expected}`);
      if (typeof page.imageUrl === 'string' && /^https?:/i.test(page.imageUrl)) {
        throw new Error('placeholder must not be a remote URL');
      }
    }

    const blocked = await illustrateJourneyPages(draft, { allowPlaceholders: false });
    if (blocked.ok) throw new Error('missing FAL key must fail closed when placeholders are off');
    if (/https?:\/\//i.test(blocked.error)) throw new Error('error must not include a stub URL');
  } finally {
    if (savedFal === undefined) delete process.env.FAL_KEY;
    else process.env.FAL_KEY = savedFal;
  }

  console.log('verify-journey-stories-illustrate: PASS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
