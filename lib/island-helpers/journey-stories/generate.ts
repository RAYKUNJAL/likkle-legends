/**
 * Journey Stories — Gemini 5-page generator (server).
 * Fail closed if GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY missing.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sanitizeChildName } from '@/lib/build-your-story';
import type { IslandHelpersCharacterId } from '../types';
import { ISLAND_HELPERS_CHARACTER_IDS } from '../types';
import { getScenario } from './seed-scenarios';
import { buildJourneyPrompt } from './prompt';
import { applyJourneySafety } from './safety';
import { JOURNEY_PAGE_ROLES, type JourneyPage, type JourneyStoryDraft } from './types';


const CAST_NAMES: Record<IslandHelpersCharacterId, string> = {
  tanty_spice: 'Tanty Spice',
  steelpan_sam: 'Steelpan Sam',
  mango_moko: 'Mango Moko',
  roti: 'R.O.T.I.',
};

export type GenerateJourneyRequest = {
  scenarioId: string | 'custom';
  customScenario?: string;
  childName?: string;
  pointOfView: 'first' | 'third';
  castCharacterIds: IslandHelpersCharacterId[];
};

export type GenerateJourneyResponse =
  | { ok: true; draft: JourneyStoryDraft }
  | { ok: false; error: string; reasons?: string[]; draft?: JourneyStoryDraft };

function sanitizeModelError(message: string): string {
  let m = message || 'Generation failed';
  // Never echo API keys or full provider payloads to clients
  m = m.replace(/api_key:[A-Za-z0-9_-]+/gi, 'api_key:[redacted]');
  m = m.replace(/AIza[0-9A-Za-z_-]{10,}/g, '[redacted]');
  m = m.replace(/Key [A-Za-z0-9_-]{8,}/g, 'Key [redacted]');
  if (/403|suspended|permission denied|CONSUMER_SUSPENDED/i.test(m)) {
    return 'Story writing is unavailable right now (AI provider blocked). Try again later.';
  }
  if (/API[_ ]?KEY|UNAUTHENTICATED|401/i.test(m)) {
    return 'Story writing is unavailable right now (missing or invalid AI key).';
  }
  // Keep short
  return m.length > 180 ? m.slice(0, 177) + '…' : m;
}

function getApiKey(): string | null {
  const key =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    '';
  return key.trim() || null;
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `js-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizePages(raw: any[]): JourneyPage[] {
  const byRole = new Map<string, any>();
  for (const p of raw || []) {
    if (p?.role) byRole.set(String(p.role), p);
  }
  return JOURNEY_PAGE_ROLES.map((role) => {
    const src = byRole.get(role) || {};
    return {
      role,
      title: role === 'title' ? String(src.title || src.text || 'Journey Story').trim() : undefined,
      text: String(src.text || src.title || '').trim(),
      imageUrl: null,
      coachingLineCount: 0,
    };
  });
}

function buildDraftShell(
  req: GenerateJourneyRequest,
  pages: JourneyPage[],
  status: JourneyStoryDraft['status'],
  safetyFlags: string[],
): JourneyStoryDraft {
  const stamp = new Date().toISOString();
  const scenario = req.scenarioId !== 'custom' ? getScenario(req.scenarioId) : undefined;
  const label =
    scenario?.parentLabel ||
    (req.customScenario || 'Custom adventure').slice(0, 80);
  let childName: string | undefined;
  if (req.childName) {
    const s = sanitizeChildName(req.childName);
    if (s.ok) childName = s.name;
  }
  const cast = (req.castCharacterIds || []).filter((id) =>
    ISLAND_HELPERS_CHARACTER_IDS.includes(id),
  ) as IslandHelpersCharacterId[];

  return {
    id: newId(),
    version: 1,
    status,
    scenarioId: req.scenarioId,
    scenarioLabel: label,
    childName,
    pointOfView: req.pointOfView,
    castCharacterIds: cast.length ? cast : scenario?.defaultCast || ['tanty_spice'],
    pages,
    safetyFlags,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

/** Pure path used by verify scripts with a mock model. */
export async function generateJourneyPagesFromModelText(
  modelText: string,
  req: GenerateJourneyRequest,
): Promise<GenerateJourneyResponse> {
  let parsed: any;
  try {
    const cleaned = modelText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    return { ok: false, error: 'Model returned invalid JSON' };
  }
  const pages = normalizePages(Array.isArray(parsed?.pages) ? parsed.pages : []);
  const safety = applyJourneySafety(pages);

  if (!safety.ok) {
    const draft = buildDraftShell(req, pages, 'draft', safety.reasons);
    return { ok: false, error: 'Safety filter blocked this draft', reasons: safety.reasons, draft };
  }

  const draft = buildDraftShell(req, safety.pages, 'ready', []);
  return { ok: true, draft };
}

export async function generateJourneyStory(
  req: GenerateJourneyRequest,
  opts?: { mockModelText?: string },
): Promise<GenerateJourneyResponse> {
  if (opts?.mockModelText) {
    return generateJourneyPagesFromModelText(opts.mockModelText, req);
  }

  const apiKey = getApiKey();
  const useOffline = (reason: string) => {
    const offlinePages = req.scenarioId !== 'custom' ? offlineSeedPages(String(req.scenarioId)) : null;
    if (!offlinePages) {
      return { ok: false as const, error: reason };
    }
    const safety = applyJourneySafety(offlinePages);
    if (!safety.ok) return { ok: false as const, error: reason, reasons: safety.reasons };
    const draft = buildDraftShell(req, safety.pages, 'ready', []);
    return { ok: true as const, draft };
  };

  if (!apiKey) {
    return useOffline('Story writing is unavailable right now (missing AI key). Try again later.');
  }

  const scenario = req.scenarioId !== 'custom' ? getScenario(req.scenarioId) : undefined;
  if (req.scenarioId !== 'custom' && !scenario) {
    return { ok: false, error: 'Unknown scenario' };
  }
  if (req.scenarioId === 'custom' && !(req.customScenario || '').trim()) {
    return { ok: false, error: 'Describe your custom adventure' };
  }

  const castIds = (req.castCharacterIds || []).filter((id) =>
    ISLAND_HELPERS_CHARACTER_IDS.includes(id),
  ) as IslandHelpersCharacterId[];
  const castNames = (castIds.length ? castIds : scenario?.defaultCast || ['tanty_spice']).map(
    (id) => CAST_NAMES[id],
  );

  let childName: string | undefined;
  if (req.childName) {
    const s = sanitizeChildName(req.childName);
    if (!s.ok) return { ok: false, error: s.error };
    childName = s.name;
  }

  const prompt = buildJourneyPrompt({
    scenario: scenario
      ? scenario
      : { label: req.customScenario!.trim(), sensoryNotes: req.customScenario!.trim() },
    childName,
    pointOfView: req.pointOfView || scenario?.pointOfView || 'third',
    castNames,
  });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return generateJourneyPagesFromModelText(text, {
      ...req,
      childName,
      castCharacterIds: castIds.length ? castIds : scenario?.defaultCast || ['tanty_spice'],
      pointOfView: req.pointOfView || scenario?.pointOfView || 'third',
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Generation failed';
    const sanitized = sanitizeModelError(message);
    const offlineTry = useOffline(sanitized);
    if (offlineTry.ok) return offlineTry;
    return { ok: false, error: sanitized };
  }
}


/** Deterministic offline pages for seed scenarios when Gemini is unavailable. */
export function offlineSeedPages(scenarioId: string): JourneyPage[] | null {
  const packs: Record<string, { title: string; pages: string[] }> = {
    dentist: {
      title: 'R.O.T.I. Visits the Dentist',
      pages: [
        'A gentle chair adventure.',
        'Today Tanty Spice and R.O.T.I. visit the dentist. The waiting room has soft chairs and a fish tank.',
        'The room is bright. The chair leans back slowly. Tools may buzz softly like a tiny bee.',
        'The dentist counts teeth and rinses with cool water. A comfort card is nearby.',
        'All done! Friends feel proud. Smiles can rest and play again soon.',
      ],
    },
    new_food: {
      title: 'R.O.T.I. Tries Something New',
      pages: [
        'A tasting adventure.',
        'R.O.T.I. sits with Tanty Spice at the table. A new island bite waits on a small plate.',
        'It may smell warm or sweet. It may look crunchy or soft. Looking and smelling come first.',
        'Friends can touch with a fork, take a tiny nibble, or save it for later. Choosing is okay.',
        'R.O.T.I. feels proud for noticing. Trying new food can be a little adventure.',
      ],
    },
    loud_fete: {
      title: 'Steelpan Sam at the Loud Fête',
      pages: [
        'Music fills the street.',
        'Steelpan Sam and Mango Moko walk toward the fête. Flags wave and feet step to the beat.',
        'Drums boom. Steelpan rings bright. Crowds cheer. Sounds can feel big in the body.',
        'Friends can step to a quieter corner, cover ears, or enjoy the music for a little while.',
        'Sam feels glad for the rhythm and for knowing how to take a break. The fête can be fun in small pieces.',
      ],
    },
    haircut: {
      title: 'Tanty and the Haircut Day',
      pages: [
        'Cape day.',
        'Tanty Spice helps with haircut day. The chair spins a little. A soft cape rests on shoulders.',
        'Scissors may snip-snip. A spray bottle may mist cool water. The mirror shows a new look growing.',
        'Friends can hold a comfort card and listen to calm words while hair gets trimmed.',
        'All done. Hair feels light. Friends feel proud and ready to play.',
      ],
    },
    airplane: {
      title: "Mango Moko's Airplane Adventure",
      pages: [
        'Up in the clouds.',
        'Mango Moko and Tanty Spice go to the airplane. Bags roll. Seats wait in neat rows.',
        'The engine hums. Ears may feel pressured. The window shows clouds like cotton.',
        'Seatbelts click. Friends can watch the sky, sip water, and rest while the plane flies.',
        'Landing comes. Mango Moko feels proud for the journey. New places can start with a plane ride.',
      ],
    },
    board_talks: {
      title: 'My Board Talks for Me',
      pages: [
        'My voice on my board.',
        'I bring my talk board when I play with friends. Tanty Spice smiles and listens.',
        'I tap a phrase. Clear words come out. Friends hear what I mean.',
        'My board is a real way to talk. Friends can wait and look at my words with care.',
        'I feel proud. My board talks for me, and that is a strong island voice.',
      ],
    },
  };
  const pack = packs[scenarioId];
  if (!pack) return null;
  return JOURNEY_PAGE_ROLES.map((role, i) => ({
    role,
    title: role === 'title' ? pack.title : undefined,
    text: pack.pages[i],
    imageUrl: null,
    coachingLineCount: 0,
  }));
}

/** Exported for tests — deterministic dentist fixture pages. */
export function mockDentistModelJson(): string {
  return JSON.stringify({
    pages: [
      { role: 'title', title: 'R.O.T.I. Visits the Dentist', text: 'A gentle chair adventure.' },
      {
        role: 'intro',
        text: 'Today Tanty Spice and R.O.T.I. visit the dentist. The waiting room has soft chairs and a fish tank.',
      },
      {
        role: 'body_sensory',
        text: 'The room is bright. The chair leans back slowly. Tools may buzz softly like a tiny bee.',
      },
      {
        role: 'body_coping',
        text: 'The dentist counts teeth and rinses with cool water. R.O.T.I. can hold a comfort card and take quiet breaths.',
      },
      {
        role: 'conclusion',
        text: 'All done! Friends feel proud. Smiles can rest and play again soon.',
      },
    ],
  });
}
