/**
 * Proves Island Helpers speak + locked character voice map.
 * Mocked ElevenLabs only — logs voice IDs, never an API key.
 */
import { NextRequest } from 'next/server';
import { POST } from '../app/api/island-helpers/speak/route';
import {
  LOCKED_CHARACTER_VOICE_IDS,
  lockedCharacterVoiceId,
  DEFAULT_DILLY_DOUBLES_VOICE_ID,
  DEFAULT_MANGO_MOKO_VOICE_ID,
  DEFAULT_ROTI_VOICE_ID,
  DEFAULT_STEELPAN_SAM_VOICE_ID,
  DEFAULT_TANTY_VOICE_ID,
} from '../lib/island-helpers/voice-policy';
import { VOICES } from '../lib/elevenlabs';
import { ISLAND_HELPERS_CHARACTER_IDS } from '../lib/island-helpers/types';

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.ELEVENLABS_API_KEY;
const envKeys = [
  'ELEVENLABS_ROTI_VOICE_ID',
  'ELEVENLABS_STEELPAN_SAM_VOICE_ID',
  'ELEVENLABS_MANGO_MOKO_VOICE_ID',
  'ELEVENLABS_DILLY_VOICE_ID',
  'ELEVENLABS_TANTY_VOICE_ID',
  'ELEVENLABS_STORY_VOICE_ID',
] as const;
const originalEnv: Record<string, string | undefined> = {};

const BOARD_EXPECTED: Record<string, string> = {
  roti: DEFAULT_ROTI_VOICE_ID,
  tanty_spice: DEFAULT_TANTY_VOICE_ID,
  steelpan_sam: DEFAULT_STEELPAN_SAM_VOICE_ID,
  mango_moko: DEFAULT_MANGO_MOKO_VOICE_ID,
  dilly_doubles: DEFAULT_DILLY_DOUBLES_VOICE_ID,
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
  for (const k of envKeys) {
    originalEnv[k] = process.env[k];
    delete process.env[k];
  }

  const requestedUrls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrls.push(String(input));
    return new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { 'content-type': 'audio/mpeg' },
    });
  }) as typeof fetch;

  try {
    if (ISLAND_HELPERS_CHARACTER_IDS.length !== 5 || !ISLAND_HELPERS_CHARACTER_IDS.includes('dilly_doubles')) {
      throw new Error(`board must list 5 characters including dilly_doubles, got ${ISLAND_HELPERS_CHARACTER_IDS.join(',')}`);
    }

    const locked = Object.entries(LOCKED_CHARACTER_VOICE_IDS);
    if (locked.length !== 5) throw new Error(`lock map size ${locked.length}`);
    const distinctLocked = new Set(Object.values(LOCKED_CHARACTER_VOICE_IDS));
    if (distinctLocked.size !== 5) {
      throw new Error(`lock map must have 5 distinct IDs, got ${distinctLocked.size}`);
    }
    for (const [id, expected] of locked) {
      const resolved = lockedCharacterVoiceId(id as keyof typeof LOCKED_CHARACTER_VOICE_IDS);
      if (resolved !== expected) throw new Error(`${id} lock resolve ${resolved} != ${expected}`);
      console.log(`[voice-lock] characterId=${id} voiceId=${resolved}`);
    }
    if (DEFAULT_DILLY_DOUBLES_VOICE_ID !== 'JtTKpzbNe4HudVAZtxZp') {
      throw new Error('Dilly default mismatch');
    }
    if (VOICES.dilly_doubles !== DEFAULT_DILLY_DOUBLES_VOICE_ID) {
      throw new Error(`elevenlabs VOICES.dilly_doubles=${VOICES.dilly_doubles} not locked`);
    }

    const seen = new Map<string, string>();
    for (const [characterId, expectedVoiceId] of Object.entries(BOARD_EXPECTED)) {
      const res = await POST(request(characterId));
      if (res.status !== 200) throw new Error(`${characterId} expected 200, got ${res.status}`);
      const voiceId = res.headers.get('X-Island-Helpers-Voice-Id');
      if (voiceId !== expectedVoiceId) {
        throw new Error(`${characterId} expected ${expectedVoiceId}, got ${voiceId}`);
      }
      if (!requestedUrls.some((url) => url.endsWith(`/text-to-speech/${expectedVoiceId}`))) {
        throw new Error(`${characterId} ElevenLabs URL missing ${expectedVoiceId}`);
      }
      seen.set(characterId, voiceId!);
      console.log(`[voice-routing] characterId=${characterId} voiceId=${voiceId}`);
    }
    if (new Set(seen.values()).size !== 5) {
      throw new Error(`board speak must use 5 distinct voice IDs, got ${new Set(seen.values()).size}`);
    }

    const unknown = await POST(request('not_a_helper'));
    if (unknown.status !== 400) {
      throw new Error(`unknown character expected 400, got ${unknown.status}`);
    }

    console.log(
      `verify-island-helpers-voice-routing: PASS (board 5 cards; 5 distinct speak voices; dilly=${DEFAULT_DILLY_DOUBLES_VOICE_ID})`,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.ELEVENLABS_API_KEY;
    else process.env.ELEVENLABS_API_KEY = originalApiKey;
    for (const k of envKeys) {
      if (originalEnv[k] === undefined) delete process.env[k];
      else process.env[k] = originalEnv[k];
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
