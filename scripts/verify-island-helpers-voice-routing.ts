/**
 * Proves Island Helpers POST /speak selects four distinct Ray-supplied voice IDs.
 * Uses a mocked ElevenLabs response; no real audio or API request is made.
 * Logs voice IDs only — never an API key.
 */
import { NextRequest } from 'next/server';
import { POST } from '../app/api/island-helpers/speak/route';
import {
  DEFAULT_MANGO_MOKO_VOICE_ID,
  DEFAULT_ROTI_VOICE_ID,
  DEFAULT_STEELPAN_SAM_VOICE_ID,
} from '../lib/island-helpers/voice-policy';

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.ELEVENLABS_API_KEY;
const originalRotiOverride = process.env.ELEVENLABS_ROTI_VOICE_ID;
const originalSamOverride = process.env.ELEVENLABS_STEELPAN_SAM_VOICE_ID;
const originalMangoOverride = process.env.ELEVENLABS_MANGO_MOKO_VOICE_ID;
const requestedUrls: string[] = [];

const EXPECTED: Record<string, string> = {
  roti: DEFAULT_ROTI_VOICE_ID,
  tanty_spice: 'RdKVaQgg8n1rUzICELn1',
  steelpan_sam: DEFAULT_STEELPAN_SAM_VOICE_ID,
  mango_moko: DEFAULT_MANGO_MOKO_VOICE_ID,
};

function request(characterId: string) {
  return new NextRequest('http://localhost/api/island-helpers/speak', {
    method: 'POST',
    body: JSON.stringify({ characterId, text: 'Hello from the soundboard' }),
    headers: { 'content-type': 'application/json' },
  });
}

async function main() {
  process.env.ELEVENLABS_API_KEY = 'routing-proof-only';
  delete process.env.ELEVENLABS_ROTI_VOICE_ID;
  delete process.env.ELEVENLABS_STEELPAN_SAM_VOICE_ID;
  delete process.env.ELEVENLABS_MANGO_MOKO_VOICE_ID;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrls.push(String(input));
    return new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { 'content-type': 'audio/mpeg' },
    });
  }) as typeof fetch;

  try {
    const seen = new Map<string, string>();

    for (const [characterId, expectedVoiceId] of Object.entries(EXPECTED)) {
      const res = await POST(request(characterId));
      if (res.status !== 200) {
        throw new Error(`${characterId} expected 200, got ${res.status}`);
      }
      const voiceId = res.headers.get('X-Island-Helpers-Voice-Id');
      if (voiceId !== expectedVoiceId) {
        throw new Error(`${characterId} expected voice ${expectedVoiceId}, got ${voiceId}`);
      }
      if (!requestedUrls.some((url) => url.endsWith(`/text-to-speech/${expectedVoiceId}`))) {
        throw new Error(`${characterId} ElevenLabs URL missing voice ${expectedVoiceId}`);
      }
      seen.set(characterId, voiceId!);
      console.log(`[voice-routing] characterId=${characterId} voiceId=${voiceId}`);
    }

    const distinct = new Set(seen.values());
    if (distinct.size !== 4) {
      throw new Error(`expected 4 distinct voice IDs, got ${distinct.size}: ${[...distinct].join(',')}`);
    }

    // Unknown character must fail closed (400) — never Tanty fallback.
    const unknown = await POST(request('not_a_helper'));
    if (unknown.status !== 400) {
      throw new Error(`unknown character expected 400, got ${unknown.status}`);
    }

    console.log(
      `verify-island-helpers-voice-routing: PASS (4 distinct voices: ${[...distinct].join(', ')})`,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.ELEVENLABS_API_KEY;
    else process.env.ELEVENLABS_API_KEY = originalApiKey;
    if (originalRotiOverride === undefined) delete process.env.ELEVENLABS_ROTI_VOICE_ID;
    else process.env.ELEVENLABS_ROTI_VOICE_ID = originalRotiOverride;
    if (originalSamOverride === undefined) delete process.env.ELEVENLABS_STEELPAN_SAM_VOICE_ID;
    else process.env.ELEVENLABS_STEELPAN_SAM_VOICE_ID = originalSamOverride;
    if (originalMangoOverride === undefined) delete process.env.ELEVENLABS_MANGO_MOKO_VOICE_ID;
    else process.env.ELEVENLABS_MANGO_MOKO_VOICE_ID = originalMangoOverride;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
