/**
 * Journey Stories — illustration pipeline.
 * Prefer FAL FLUX when FAL_KEY present; else calm SVG placeholders (fail-closed art, not stub remote URLs).
 */
import type { JourneyPage, JourneyStoryDraft } from './types';
import { JOURNEY_PAGE_ROLES } from './types';

const PLACEHOLDER_BASE = '/images/island-helpers';

export function placeholderForRole(role: string): string {
  const safe = JOURNEY_PAGE_ROLES.includes(role as any) ? role : 'intro';
  return `${PLACEHOLDER_BASE}/journey-${safe}.svg`;
}

function hasFalKey(): boolean {
  return Boolean(process.env.FAL_KEY?.trim());
}

function hasGeminiKey(): boolean {
  return Boolean(
    (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '').trim(),
  );
}

async function tryFlux(prompt: string): Promise<string | null> {
  const apiKey = process.env.FAL_KEY?.trim();
  if (!apiKey) return null;
  try {
    const res = await fetch('https://fal.run/fal-ai/flux/dev', {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: 'landscape_16_9',
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
        output_format: 'png',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const url = data?.images?.[0]?.url;
    return typeof url === 'string' ? url : null;
  } catch {
    return null;
  }
}

function pagePrompt(draft: JourneyStoryDraft, page: JourneyPage): string {
  const cast = draft.castCharacterIds.join(', ');
  return [
    "Children's book illustration, Caribbean art style, warm tropical colors, soft painterly textures",
    `Journey Story page (${page.role}): ${page.title || page.text}`,
    cast ? `featuring friends: ${cast}` : '',
    'calm sensory-safe scene, no gore, no medical trauma, no text, no words, no letters, child-friendly',
  ]
    .filter(Boolean)
    .join(', ');
}

export async function illustrateJourneyPages(
  draft: JourneyStoryDraft,
  opts?: { pageIndex?: number; allowPlaceholders?: boolean },
): Promise<{ ok: true; pages: JourneyPage[]; usedPlaceholders: boolean } | { ok: false; error: string }> {
  if (!draft.pages || draft.pages.length !== 5) {
    return { ok: false, error: 'Need 5 page texts before illustrating' };
  }
  if (draft.pages.some((p) => !(p.text || '').trim())) {
    return { ok: false, error: 'Every page needs text before illustrating' };
  }

  const allowPlaceholders = opts?.allowPlaceholders !== false;
  const indices =
    typeof opts?.pageIndex === 'number'
      ? [opts.pageIndex]
      : draft.pages.map((_, i) => i);

  const pages = draft.pages.map((p) => ({ ...p }));
  let usedPlaceholders = false;
  const canRemote = hasFalKey() || hasGeminiKey();

  for (const i of indices) {
    if (i < 0 || i >= pages.length) continue;
    const page = pages[i];
    let imageUrl: string | null = null;

    if (hasFalKey()) {
      imageUrl = await tryFlux(pagePrompt(draft, page));
    }

    // Gemini native image gen is not reliably available here — do not ship gemini.ts stub URIs.
    if (!imageUrl) {
      if (!allowPlaceholders && canRemote) {
        return { ok: false, error: 'Illustration provider returned no image' };
      }
      if (!allowPlaceholders && !canRemote) {
        return {
          ok: false,
          error: 'No illustration keys configured (FAL_KEY). Enable placeholders or add a key.',
        };
      }
      imageUrl = placeholderForRole(page.role);
      usedPlaceholders = true;
    }

    pages[i] = { ...page, imageUrl };
  }

  return { ok: true, pages, usedPlaceholders };
}
