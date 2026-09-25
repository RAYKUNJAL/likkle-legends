/**
 * Journey Stories — OpenRouter prompt pack (descriptive > coaching).
 * Public feature name: Journey Stories. Do not emit Social Stories™.
 */
import type { getScenario } from './seed-scenarios';
import type { JourneyLanguageMode } from './types';

type ScenarioLike =
  | NonNullable<ReturnType<typeof getScenario>>
  | { label: string; sensoryNotes: string; parentLabel?: string };

/**
 * Extra rules when a parent chooses literal words.
 * Kept as one string so verify scripts can assert the constraints travel with the prompt.
 */
export const LITERAL_LANGUAGE_PROMPT = `LITERAL WORDS MODE (required for this story):
- Each page uses 1-2 short declarative sentences. The title page can be one short sentence.
- Use concrete vocabulary: name people, places, objects, and actions a child can point to.
- No idioms, metaphors, similes, or sarcasm.
- No rhetorical questions. Do not ask a question unless a character truly needs an answer. Prefer statements.
- No figurative emotion language. Do not write phrases like "butterflies in tummy". If a feeling matters, name the body feeling plainly (example: "My tummy feels tight.").
- Say exactly what happens. Do not hint.`;

export function buildJourneyPrompt(input: {
  scenario: ScenarioLike;
  childName?: string;
  pointOfView: 'first' | 'third';
  castNames: string[];
  languageMode?: JourneyLanguageMode;
}): string {
  const label =
    'parentLabel' in input.scenario && input.scenario.parentLabel
      ? input.scenario.parentLabel
      : 'label' in input.scenario
        ? (input.scenario as { label: string }).label
        : 'an adventure';
  const sensory =
    'sensoryNotes' in input.scenario ? input.scenario.sensoryNotes : '';
  const cast = input.castNames.length ? input.castNames.join(', ') : 'Likkle Legends friends';
  const child = input.childName ? `Optional child first name to weave gently: ${input.childName}.` : 'No specific child name.';
  const pov =
    input.pointOfView === 'first'
      ? 'Write in first person (“I…”).'
      : 'Write in third person about the cast characters.';
  const literal = input.languageMode === 'literal';
  const sentenceRule = literal
    ? '- Each page is 1-2 short declarative sentences (title page can be one short sentence).'
    : '- Keep each page to 1–3 short sentences (title page can be shorter).';
  const tone = literal
    ? '- No medical claims. Warm, patient, and plain. Ages ~4–9. Caribbean places and people stay concrete (beach, market, steelpan, mango).'
    : '- No medical claims. Warm, patient, Caribbean joy. Ages ~4–9.';

  return `You write Journey Stories for Likkle Legends — short Caribbean adventure storybooks that help kids prepare for new places and feelings.

PUBLIC NAME: Journey Stories (routine adventure storybooks). NEVER write the words "Social Stories" or "Social Stories™".

STRUCTURE — return JSON only:
{
  "pages": [
    { "role": "title", "title": "string", "text": "short title-page blurb" },
    { "role": "intro", "text": "who/where/what is happening" },
    { "role": "body_sensory", "text": "what it may look/sound/feel like" },
    { "role": "body_coping", "text": "what people might do; mostly descriptive; at most ONE gentle optional idea" },
    { "role": "conclusion", "text": "reassuring close that celebrates coping or interest" }
  ]
}

RULES:
- Exactly 5 pages with those roles in order.
- Descriptive > coaching. Whole-story budget: ≤1 gentle coaching sentence total.
- Celebrate AAC, breaks, headphones, and fidgets as valid — never deficit framing.
- Ban list in kid text: eye contact, look at my eyes, quiet hands, you must, say it to unlock, be normal, compliance scores, punishment, clinic/therapy jargon, Social Stories.
${tone}
${sentenceRule}
${literal ? `\n${LITERAL_LANGUAGE_PROMPT}\n` : ''}
Scenario for parents (topic): ${label}
Sensory notes: ${sensory}
Cast to include: ${cast}
Point of view: ${pov}
${child}
`;
}
