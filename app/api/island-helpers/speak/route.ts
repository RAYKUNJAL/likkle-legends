/**
 * Island Helpers tap→speak API.
 * Reuses warm story voice (warmStoryVoiceId → RdKVaQgg8n1rUzICELn1) and WARM_VOICE_SETTINGS.
 * Returns audio/mpeg. In-memory cache avoids hammering ElevenLabs on repeat taps.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  missingNarrationKeyMessage,
  WARM_ELEVENLABS_MODEL,
  WARM_VOICE_SETTINGS,
  warmStoryVoiceId,
} from '@/lib/story-narration-policy';

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
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const API_KEY = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: missingNarrationKeyMessage() },
        { status: 503 },
      );
    }

    const voiceId = warmStoryVoiceId();
    const cacheKey = `${voiceId}::${text.toLowerCase()}`;
    const hit = cache.get(cacheKey);
    if (hit) {
      return new NextResponse(hit, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': hit.byteLength.toString(),
          'X-Island-Helpers-Cache': 'hit',
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

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'X-Island-Helpers-Cache': 'miss',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
