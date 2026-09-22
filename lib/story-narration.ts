import { generateGeminiSpeech } from '@/lib/gemini-tts';
import {
    WARM_ELEVENLABS_MODEL,
    WARM_VOICE_SETTINGS,
    missingNarrationKeyMessage,
    warmStoryVoiceId,
} from '@/lib/story-narration-policy';

export type WarmNarrationSuccess = {
    ok: true;
    audio: Buffer;
    contentType: 'audio/mpeg' | 'audio/wav';
    provider: 'elevenlabs' | 'gemini';
};

export type WarmNarrationFailure = {
    ok: false;
    code: 'missing_key' | 'generation_failed';
    error: string;
};

const WARM_GEMINI_DIRECTION =
    'Gentle storyteller reading a picture book to a young child. Warm, unhurried, clear English, soft smile in the voice, natural pauses at periods. No announcer tone, no robotic clip, no heavy accent imitation.';

function cleanNarrationText(text: string): string {
    return text.replace(/\s+/g, ' ').trim().slice(0, 1800);
}

async function synthesizeElevenLabs(text: string, apiKey: string): Promise<WarmNarrationSuccess | WarmNarrationFailure> {
    const voiceId = warmStoryVoiceId();
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                Accept: 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: WARM_ELEVENLABS_MODEL,
                voice_settings: WARM_VOICE_SETTINGS,
            }),
        });

        if (!response.ok) {
            const detail = await response.text();
            console.error('[warm-narration] ElevenLabs error', response.status, detail.slice(0, 180));
            return { ok: false, code: 'generation_failed', error: 'ElevenLabs could not read this page.' };
        }

        const audio = Buffer.from(await response.arrayBuffer());
        if (!audio.length) {
            return { ok: false, code: 'generation_failed', error: 'ElevenLabs returned empty audio.' };
        }
        return { ok: true, audio, contentType: 'audio/mpeg', provider: 'elevenlabs' };
    } catch (error) {
        console.error('[warm-narration] ElevenLabs request failed', error);
        return { ok: false, code: 'generation_failed', error: 'ElevenLabs could not read this page.' };
    }
}

async function synthesizeGemini(text: string): Promise<WarmNarrationSuccess | WarmNarrationFailure> {
    try {
        const audioBuffer = await generateGeminiSpeech(text, {
            character: 'tanty',
            voiceName: 'Leda',
            model: process.env.GEMINI_TTS_MODEL,
        });
        if (!audioBuffer) {
            return { ok: false, code: 'generation_failed', error: 'Gemini could not read this page.' };
        }
        return {
            ok: true,
            audio: Buffer.from(audioBuffer),
            contentType: 'audio/wav',
            provider: 'gemini',
        };
    } catch (error) {
        console.error('[warm-narration] Gemini TTS failed', error);
        return { ok: false, code: 'generation_failed', error: 'Gemini could not read this page.' };
    }
}

/**
 * Prefer ElevenLabs natural narration. Gemini TTS is the only fallback.
 * Google Neural2 and browser speech synthesis are intentionally not used.
 * The Gemini direction override is applied by passing voiceName Leda; the
 * shared Gemini helper still wraps character direction, so we prefix the text.
 */
export async function synthesizeWarmNarration(rawText: string): Promise<WarmNarrationSuccess | WarmNarrationFailure> {
    const text = cleanNarrationText(rawText);
    if (!text) {
        return { ok: false, code: 'generation_failed', error: 'This page has no words to read.' };
    }

    const elevenKey = process.env.ELEVENLABS_API_KEY?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (!elevenKey && !geminiKey) {
        return { ok: false, code: 'missing_key', error: missingNarrationKeyMessage() };
    }

    if (elevenKey) {
        const eleven = await synthesizeElevenLabs(text, elevenKey);
        if (eleven.ok) return eleven;
        if (!geminiKey) return eleven;
    }

    if (geminiKey) {
        const directed = `${WARM_GEMINI_DIRECTION} Read this picture-book page: ${text}`;
        return synthesizeGemini(directed);
    }

    return { ok: false, code: 'missing_key', error: missingNarrationKeyMessage() };
}
