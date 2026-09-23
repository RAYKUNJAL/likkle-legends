/**
 * Island Helpers tap→speak API.
 * Uses the character voice policy: each helper maps to Ray's supplied ElevenLabs
 * voice ID (Sam/Mango/ROTI locked; Tanty stays on warm story voice). Unknown
 * characters fail closed — never fall back to Tanty.
 * Returns audio/mpeg. In-memory cache avoids hammering ElevenLabs on repeat taps.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  missingNarrationKeyMessage,
  WARM_ELEVENLABS_MODEL,
  WARM_VOICE_SETTINGS,
} from '@/lib/story-narration-policy';
import {
  islandHelpersCharacterLabel,
  islandHelpersVoiceId,
} from '@/lib/island-helpers/voice-policy';
import {
  ISLAND_HELPERS_CHARACTER_IDS,
  type IslandHelpersCharacterId,
} from '@/lib/island-helpers/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const cache = new Map<string, Buffer>();
const CACHE_MAX = 48;

function remember(key: string, buf: Buffer) {
  if (cache.size >= CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first !== undefined) cache.delete(first);
  }
  cache.set(key, buf);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const rawCharacterId = body?.characterId;
    if (!ISLAND_HELPERS_CHARACTER_IDS.includes(rawCharacterId as IslandHelpersCharacterId)) {
      return NextResponse.json({ error: 'characterId is required' }, { status: 400 });
    }
    const characterId = rawCharacterId as IslandHelpersCharacterId;
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const voiceId = islandHelpersVoiceId(characterId);
    if (!voiceId) {
      return NextResponse.json(
        {
          error: `${islandHelpersCharacterLabel(characterId)} voice is pending; no voice has been selected.`,
          code: 'VOICE_ID_PENDING',
          characterId,
        },
        { status: 503 },
      );
    }

    const API_KEY = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: missingNarrationKeyMessage() },
        { status: 503 },
      );
    }

    console.info(`[island-helpers/speak] characterId=${characterId} voiceId=${voiceId}`);
    const cacheKey = `${characterId}::${voiceId}::${text.toLowerCase()}`;
    const hit = cache.get(cacheKey);
    if (hit) {
      return new NextResponse(new Uint8Array(hit), {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': hit.byteLength.toString(),
          'X-Island-Helpers-Cache': 'hit',
          'X-Island-Helpers-Voice-Id': voiceId,
        },
      });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: WARM_ELEVENLABS_MODEL,
        voice_settings: { ...WARM_VOICE_SETTINGS },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `ElevenLabs API Error: ${errorText}` },
        { status: response.status },
      );
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    remember(cacheKey, audioBuffer);

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'X-Island-Helpers-Cache': 'miss',
        'X-Island-Helpers-Voice-Id': voiceId,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
