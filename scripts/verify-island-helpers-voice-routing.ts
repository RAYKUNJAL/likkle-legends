/**
 * Proves Island Helpers POST /speak selects the supplied character voice IDs.
 * Uses a mocked ElevenLabs response; no real audio or API request is made.
 */
import { NextRequest } from 'next/server';
import { POST } from '../app/api/island-helpers/speak/route';
import { DEFAULT_ROTI_VOICE_ID } from '../lib/island-helpers/voice-policy';

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.ELEVENLABS_API_KEY;
const originalRotiOverride = process.env.ELEVENLABS_ROTI_VOICE_ID;
const requestedUrls: string[] = [];

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
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    requestedUrls.push(String(input));
    return new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { 'content-type': 'audio/mpeg' },
    });
  }) as typeof fetch;

  try {
    const roti = await POST(request('roti'));
    if (roti.status !== 200) throw new Error(`R.O.T.I. expected 200, got ${roti.status}`);
    if (roti.headers.get('X-Island-Helpers-Voice-Id') !== DEFAULT_ROTI_VOICE_ID) {
      throw new Error('R.O.T.I. did not use the supplied voice ID');
    }
    if (!requestedUrls.some((url) => url.endsWith(`/text-to-speech/${DEFAULT_ROTI_VOICE_ID}`))) {
      throw new Error('R.O.T.I. ElevenLabs request did not contain the supplied voice ID');
    }

    const tanty = await POST(request('tanty_spice'));
    if (tanty.status !== 200 || tanty.headers.get('X-Island-Helpers-Voice-Id') !== 'RdKVaQgg8n1rUzICELn1') {
      throw new Error('Tanty did not remain on RdKVaQgg8n1rUzICELn1');
    }

    for (const characterId of ['steelpan_sam', 'mango_moko']) {
      const pending = await POST(request(characterId));
      if (pending.status !== 503) throw new Error(`${characterId} should remain pending`);
      const body = await pending.json();
      if (body.code !== 'VOICE_ID_PENDING') throw new Error(`${characterId} should fail closed`);
    }

    console.log(`verify-island-helpers-voice-routing: PASS (roti voice ${DEFAULT_ROTI_VOICE_ID})`);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiKey === undefined) delete process.env.ELEVENLABS_API_KEY;
    else process.env.ELEVENLABS_API_KEY = originalApiKey;
    if (originalRotiOverride === undefined) delete process.env.ELEVENLABS_ROTI_VOICE_ID;
    else process.env.ELEVENLABS_ROTI_VOICE_ID = originalRotiOverride;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
