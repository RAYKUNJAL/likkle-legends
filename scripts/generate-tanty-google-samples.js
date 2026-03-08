const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const apiKey =
  process.env.GOOGLE_CLOUD_TTS_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  console.error('Missing GOOGLE_CLOUD_TTS_API_KEY (or GEMINI_API_KEY / GOOGLE_GENERATIVE_AI_API_KEY)');
  process.exit(1);
}

const outDir = path.join(process.cwd(), 'public', 'audio');
fs.mkdirSync(outDir, { recursive: true });

const text =
  "Mmm-hmmm, me sweet child. Come sit by Tanty on de verandah. Today we go learn one likkle thing, one step at a time, and make yuh heart feel bright like sunshine.";

const variants = [
  { name: 'tanty-google-soft.mp3', pitch: -3.0, speakingRate: 0.86 },
  { name: 'tanty-google-balanced.mp3', pitch: -2.0, speakingRate: 0.90 },
  { name: 'tanty-google-bright.mp3', pitch: -1.2, speakingRate: 0.95 }
];

async function main() {
  for (const v of variants) {
    const body = JSON.stringify({
      input: { text },
      voice: { languageCode: 'en-GB', name: 'en-GB-Neural2-C' },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: v.pitch,
        speakingRate: v.speakingRate,
        volumeGainDb: 1.0,
        effectsProfileId: ['headphone-class-device']
      }
    });

    let response;
    let lastErr = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          signal: controller.signal
        });
        clearTimeout(timeout);
        break;
      } catch (err) {
        clearTimeout(timeout);
        lastErr = err;
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 1200 * attempt));
        }
      }
    }

    if (!response) {
      const msg = lastErr && lastErr.message ? lastErr.message : String(lastErr || 'Unknown network error');
      const cause = lastErr && lastErr.cause ? ` | cause: ${lastErr.cause.code || lastErr.cause.message || lastErr.cause}` : '';
      throw new Error(`Network error while generating ${v.name}: ${msg}${cause}`);
    }

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed ${v.name}: ${response.status} ${err}`);
    }

    const data = await response.json();
    const outPath = path.join(outDir, v.name);
    fs.writeFileSync(outPath, Buffer.from(data.audioContent, 'base64'));
    console.log(`Wrote ${outPath}`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
