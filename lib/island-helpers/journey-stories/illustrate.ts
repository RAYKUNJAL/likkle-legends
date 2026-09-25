/**
 * Journey Stories — illustration pipeline.
 * One page per call. Art on hold, or a missing FAL key, uses local SVG placeholders.
 * Never invent a remote image URL.
 */
import type { JourneyPage, JourneyStoryDraft } from './types';
import { buildJourneyImagePrompt, JOURNEY_SENSORY_STYLE_ANCHOR } from './image-prompt';
import { journeyArtOnHold } from './art-hold';
import { placeholderForRole } from './placeholders';

export { JOURNEY_SENSORY_STYLE_ANCHOR, placeholderForRole };

function hasFalKey(): boolean {
  return Boolean(process.env.FAL_KEY?.trim());
}

/** Accept only a real hosted image URL. Never synthesize a remote stub. */
function hostedImageUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

async function tryFlux(prompt: string): Promise<string | null> {
  if (journeyArtOnHold()) return null;
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
    return hostedImageUrl(data?.images?.[0]?.url);
  } catch {
    return null;
  }
}

export function buildJourneyIllustrationPrompt(draft: JourneyStoryDraft, page: JourneyPage): string {
  return buildJourneyImagePrompt({
    pageRole: page.role,
    pageText: page.title ? `${page.title}. ${page.text}` : page.text,
    castCharacterIds: draft.castCharacterIds,
  });
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

  for (const i of indices) {
    if (i < 0 || i >= pages.length) continue;
    const page = pages[i];
    let imageUrl: string | null = null;

    // One page per loop turn. Art on hold never calls FLUX.
    if (!journeyArtOnHold() && hasFalKey()) {
      imageUrl = await tryFlux(buildJourneyIllustrationPrompt(draft, page));
    }

    if (!imageUrl) {
      if (!allowPlaceholders && hasFalKey()) {
        return { ok: false, error: 'Illustration provider returned no image' };
      }
      if (!allowPlaceholders && !hasFalKey()) {
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
