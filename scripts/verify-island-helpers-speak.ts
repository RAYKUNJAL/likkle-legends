/**
 * Island Helpers speak helper shape checks (mocked fetch; no live API key).
 */
import { __clearSpeakCache, speakPhrase } from '../lib/island-helpers/speak';
import { missingNarrationKeyMessage } from '../lib/story-narration-policy';

__clearSpeakCache();

async function main() {
  const empty = await speakPhrase({ text: '   ' });
  if (empty.ok) throw new Error('empty text must fail');
  if (!('error' in empty) || !empty.error) throw new Error('empty error message');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(new Uint8Array([1, 2, 3, 4]), {
      status: 200,
      headers: { 'content-type': 'audio/mpeg' },
    })) as typeof fetch;

  try {
    const ok = await speakPhrase({ text: 'I want to play', characterId: 'steelpan_sam' });
    if (!ok.ok) throw new Error(`expected ok: ${ok.error}`);
    if (!ok.audioUrl || typeof ok.audioUrl !== 'string') throw new Error('audioUrl shape');
  } finally {
    globalThis.fetch = originalFetch;
  }

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ error: missingNarrationKeyMessage() }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    })) as typeof fetch;

  try {
    __clearSpeakCache();
    const miss = await speakPhrase({ text: 'Hello again unique' });
    if (miss.ok) throw new Error('missing key should fail');
    if (!miss.error.includes('ELEVENLABS_API_KEY')) {
      throw new Error('missing-key posture should match warm narration message');
    }
  } finally {
    globalThis.fetch = originalFetch;
  }

  if (!missingNarrationKeyMessage().includes('ELEVENLABS_API_KEY')) {
    throw new Error('policy message');
  }

  console.log('verify-island-helpers-speak: PASS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
