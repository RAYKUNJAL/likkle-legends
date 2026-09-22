import { applyJourneySafety } from '../lib/island-helpers/journey-stories/safety';
import type { JourneyPage } from '../lib/island-helpers/journey-stories/types';
import { buildJourneyPrompt } from '../lib/island-helpers/journey-stories/prompt';

const roles = ['title', 'intro', 'body_sensory', 'body_coping', 'conclusion'] as const;

function pages(texts: string[]): JourneyPage[] {
  return roles.map((role, i) => ({
    role,
    title: role === 'title' ? texts[i] : undefined,
    text: texts[i],
    coachingLineCount: 0,
  }));
}

const badEye = applyJourneySafety(
  pages([
    'Dentist Day',
    'We go in.',
    'Lights are bright.',
    'Please look at my eyes and sit still.',
    'All done.',
  ]),
);
if (badEye.ok) throw new Error('eye coaching must fail');

const badMark = applyJourneySafety(
  pages(['T', 'A', 'B', 'This is like Social Stories™ for you.', 'C']),
);
if (badMark.ok) throw new Error('trademark must fail');

const badCoach = applyJourneySafety(
  pages([
    'Title',
    'You should wash now. You need to hurry.',
    'You should listen carefully today.',
    'Try to be brave right now.',
    'Friends feel glad.',
  ]),
);
if (badCoach.ok) throw new Error('too many coaching lines must fail');

const good = applyJourneySafety(
  pages([
    'R.O.T.I. Visits the Dentist',
    'Friends visit the dentist today.',
    'The chair leans back. Tools may buzz softly.',
    'Cool water rinses teeth. A comfort card is nearby.',
    'All done. Friends feel proud and safe.',
  ]),
);
if (!good.ok) throw new Error(`clean fixture failed: ${good.reasons?.join(',')}`);

const prompt = buildJourneyPrompt({
  scenario: { label: 'Visiting the dentist', sensoryNotes: 'bright lights' },
  pointOfView: 'third',
  castNames: ['Tanty Spice'],
});
if (/Social Stories™/i.test(prompt) && !/NEVER write the words "Social Stories"/i.test(prompt)) {
  // prompt may mention NEVER write Social Stories — that's the ban instruction
}
if (!/NEVER write the words "Social Stories"/i.test(prompt)) {
  throw new Error('prompt must ban Social Stories wording');
}
if (!/eye contact/i.test(prompt)) throw new Error('prompt must list eye contact ban');

console.log('verify-journey-stories-safety: PASS');
