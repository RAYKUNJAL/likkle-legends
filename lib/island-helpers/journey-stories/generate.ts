/**
 * Journey Stories — OpenRouter 5-page generator (server).
 * Fail closed if OPENROUTER_API_KEY / LLM_API_KEY missing (seed offline path kept).
 */
import { sanitizeChildName } from '@/lib/build-your-story';
import type { IslandHelpersCharacterId } from '../types';
import { ISLAND_HELPERS_CHARACTER_IDS } from '../types';
import { getScenario } from './seed-scenarios';
import { buildJourneyPrompt } from './prompt';
import { applyJourneySafety } from './safety';
import {
  JOURNEY_PAGE_ROLES,
  type JourneyLanguageMode,
  type JourneyPage,
  type JourneyStoryDraft,
} from './types';


const CAST_NAMES: Record<IslandHelpersCharacterId, string> = {
  tanty_spice: 'Tanty Spice',
  steelpan_sam: 'Steelpan Sam',
  mango_moko: 'Mango Moko',
  roti: 'R.O.T.I.',
  dilly_doubles: 'Dilly Doubles',
};

export type GenerateJourneyRequest = {
  scenarioId: string | 'custom';
  customScenario?: string;
  childName?: string;
  pointOfView: 'first' | 'third';
  castCharacterIds: IslandHelpersCharacterId[];
  /** Defaults to standard when omitted. */
  languageMode?: JourneyLanguageMode;
};

/** Accept only the two parent modes. Missing means standard. Anything else is rejected. */
export function parseJourneyLanguageMode(value: unknown): JourneyLanguageMode | null {
  if (value === undefined || value === null || value === '') return 'standard';
  if (typeof value !== 'string') return null;
  const mode = value.trim().toLowerCase();
  if (mode === 'standard' || mode === 'literal') return mode;
  return null;
}

function resolveLanguageMode(mode: JourneyLanguageMode | undefined): JourneyLanguageMode {
  return mode === 'literal' ? 'literal' : 'standard';
}

export type GenerateJourneyResponse =
  | { ok: true; draft: JourneyStoryDraft }
  | { ok: false; error: string; reasons?: string[]; draft?: JourneyStoryDraft };

function sanitizeModelError(message: string): string {
  let m = message || 'Generation failed';
  // Never echo API keys or full provider payloads to clients
  m = m.replace(/api_key:[A-Za-z0-9_-]+/gi, 'api_key:[redacted]');
  m = m.replace(/AIza[0-9A-Za-z_-]{10,}/g, '[redacted]');
  m = m.replace(/Key [A-Za-z0-9_-]{8,}/g, 'Key [redacted]');
  m = m.replace(/sk-or-v1-[A-Za-z0-9_-]+/gi, '[redacted]');
  m = m.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]');
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
    process.env.OPENROUTER_API_KEY ||
    process.env.LLM_API_KEY ||
    '';
  return key.trim() || null;
}

function getOpenRouterUrl(): string {
  const explicit = (process.env.LLM_API_URL || '').trim();
  if (explicit) return explicit;
  const base = (process.env.OPENROUTER_BASE || 'https://openrouter.ai/api/v1').trim().replace(/\/$/, '');
  return `${base}/chat/completions`;
}

function getOpenRouterModel(): string {
  return (
    process.env.OPENROUTER_MODEL ||
    process.env.LLM_MODEL ||
    'openai/gpt-4o-mini'
  ).trim();
}

async function callOpenRouterChat(prompt: string, apiKey: string): Promise<string> {
  const url = getOpenRouterUrl();
  const model = getOpenRouterModel();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com',
      'X-Title': 'Likkle Legends Journey Stories',
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a children\'s story writer. Reply with ONLY valid JSON matching the requested schema. No markdown fences.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });
  const raw = await res.text();
  if (!res.ok) {
    // Never include response body that might echo keys; keep short status-based error
    throw new Error(`OpenRouter HTTP ${res.status}`);
  }
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('OpenRouter returned non-JSON');
  }
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('OpenRouter returned empty content');
  }
  return content;
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
    languageMode: resolveLanguageMode(req.languageMode),
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
  const languageMode = resolveLanguageMode(req.languageMode);
  const reqWithMode: GenerateJourneyRequest = { ...req, languageMode };

  if (opts?.mockModelText) {
    return generateJourneyPagesFromModelText(opts.mockModelText, reqWithMode);
  }

  const apiKey = getApiKey();
  const useOffline = (reason: string) => {
    // Seed pages are standard wording. Do not label them as literal words.
    if (languageMode === 'literal') {
      return { ok: false as const, error: reason };
    }
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
    languageMode,
  });

  try {
    const text = await callOpenRouterChat(prompt, apiKey);
    return generateJourneyPagesFromModelText(text, {
      ...reqWithMode,
      childName,
      castCharacterIds: castIds.length ? castIds : scenario?.defaultCast || ['tanty_spice'],
      pointOfView: req.pointOfView || scenario?.pointOfView || 'third',
      languageMode,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Generation failed';
    const sanitized = sanitizeModelError(message);
    const offlineTry = useOffline(sanitized);
    if (offlineTry.ok) return offlineTry;
    return { ok: false, error: sanitized };
  }
}


/** Deterministic offline pages for seed scenarios when OpenRouter is unavailable. */
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
