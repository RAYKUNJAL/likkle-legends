/**
 * Island Helpers — tap→speak client helper.
 * POSTs to /api/island-helpers/speak which uses warmStoryVoiceId() (RdKVa…).
 */
import type { IslandHelpersCharacterId } from './types';

export type SpeakRequest = { text: string; characterId?: IslandHelpersCharacterId };
export type SpeakResult = { ok: true; audioUrl: string } | { ok: false; error: string };

const clientCache = new Map<string, string>();
const CACHE_MAX = 32;

function cacheKey(text: string, characterId?: string): string {
  return `${characterId || 'warm'}::${text.trim().toLowerCase()}`;
}

export async function speakPhrase(req: SpeakRequest): Promise<SpeakResult> {
  const text = (req.text || '').trim();
  if (!text) return { ok: false, error: 'Text is required' };

  const key = cacheKey(text, req.characterId);
  const cached = clientCache.get(key);
  if (cached) return { ok: true, audioUrl: cached };

  try {
    const res = await fetch('/api/island-helpers/speak', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, characterId: req.characterId }),
    });

    if (!res.ok) {
      let error = 'Speak failed';
      try {
        const body = await res.json();
        error = body.error || error;
      } catch {
        /* ignore */
      }
      return { ok: false, error };
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await res.json();
      if (body.audioUrl) {
        remember(key, body.audioUrl);
        return { ok: true, audioUrl: body.audioUrl };
      }
      return { ok: false, error: body.error || 'No audio returned' };
    }

    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    remember(key, audioUrl);
    return { ok: true, audioUrl };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Speak failed';
    return { ok: false, error: message };
  }
}

function remember(key: string, url: string) {
  if (clientCache.size >= CACHE_MAX) {
    const first = clientCache.keys().next().value;
    if (first !== undefined) clientCache.delete(first);
  }
  clientCache.set(key, url);
}

/** Test helper: clear in-memory cache. */
export function __clearSpeakCache() {
  clientCache.clear();
}
