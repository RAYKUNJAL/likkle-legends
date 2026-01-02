// ElevenLabs Text-to-Speech Integration
// Custom Caribbean accent voice for Tanty Spice

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs - replace with your custom Caribbean voice model
export const VOICES = {
    tanty_spice: process.env.ELEVENLABS_TANTY_VOICE_ID || 'MF3mGyEYCl7XYWbV9V6O', // 'Elli' - Warm, calm female or similar
    steelpan_sam: process.env.ELEVENLABS_SAM_VOICE_ID || 'ErXwobaYiN019PkySvjV',
    dilly_doubles: process.env.ELEVENLABS_DILLY_VOICE_ID || 'TxGEqnHWrfWFTfGW9XjX',
};

export type VoiceCharacter = keyof typeof VOICES;

interface TTSOptions {
    voice?: VoiceCharacter;
    stability?: number;
    similarityBoost?: number;
    style?: number;
}

export async function generateSpeech(
    text: string,
    options: TTSOptions = {}
): Promise<ArrayBuffer | null> {
    const {
        voice = 'tanty_spice',
        stability = 0.45, // Slightly lower for more expressive rhythm
        similarityBoost = 0.8, // High fidelity to tone
        style = 0.65, // More expressive style
    } = options;

    if (!ELEVENLABS_API_KEY) {
        console.warn('ElevenLabs API key not configured');
        return null;
    }

    try {
        const response = await fetch(
            `${ELEVENLABS_API_URL}/text-to-speech/${VOICES[voice]}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability,
                        similarity_boost: similarityBoost,
                        style,
                        use_speaker_boost: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        return await response.arrayBuffer();
    } catch (error) {
        console.error('Failed to generate speech:', error);
        return null;
    }
}

// Generate speech and return as base64 for client-side playback
export async function generateSpeechBase64(
    text: string,
    options: TTSOptions = {}
): Promise<string | null> {
    const audioBuffer = await generateSpeech(text, options);
    if (!audioBuffer) return null;

    const base64 = Buffer.from(audioBuffer).toString('base64');
    return `data:audio/mpeg;base64,${base64}`;
}

// Caribbean dialect word pronunciations for learning
export const PATOIS_PRONUNCIATIONS: Record<string, string> = {
    'pickney': 'Pick-nee (child)',
    'likkle': 'Lik-kl (little)',
    'irie': 'Eye-ree (good/happy)',
    'nyam': 'Nyam (eat)',
    'wah gwaan': 'Wah gwaan (what\'s going on)',
    'big up': 'Big up (respect/praise)',
    'soon come': 'Soon come (be there shortly)',
    'dutty': 'Duh-tee (dirty)',
    'bacchanal': 'Bak-a-nal (party/drama)',
    'lime': 'Lime (hang out)',
    'mamaguy': 'Ma-ma-guy (to tease)',
    'dougla': 'Doo-gla (mixed heritage)',
    'gyul': 'Gyul (girl)',
    'bwoy': 'Bwoy (boy)',
    'tanty': 'Tan-tee (auntie)',
};
