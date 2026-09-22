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
  if (!apiKey) {
    return {
      ok: false,
      error: 'Story writing is unavailable right now (missing AI key). Try again later.',
    };
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
    return { ok: false, error: message };
  }
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
