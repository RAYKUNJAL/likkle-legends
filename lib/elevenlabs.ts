// ElevenLabs Text-to-Speech Integration
// Custom Caribbean accent voice for Tanty Spice

// ElevenLabs API Key should be read inside functions to ensure late-binding after dotenv
// const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs - Custom Caribbean voice models
export const VOICES = {
    tanty_spice: process.env.ELEVENLABS_TANTY_VOICE_ID || 'JfiM1myzVx7xU2MZOAJS',
    roti: process.env.ELEVENLABS_ROTI_VOICE_ID || 'eppqEXVumQ3CfdndcIBd',
    // Aliases
    steelpan_sam: process.env.ELEVENLABS_ROTI_VOICE_ID || 'eppqEXVumQ3CfdndcIBd',
    tanty: process.env.ELEVENLABS_TANTY_VOICE_ID || 'JfiM1myzVx7xU2MZOAJS',
};

// Character-specific Voice Settings (as per Registry v3.0.0)
export const CHARACTER_SETTINGS = {
    tanty_spice: {
        stability: 0.35,
        similarity_boost: 0.62,
        style: 0.12,
        use_speaker_boost: true
    },
    roti: {
        stability: 0.32,
        similarity_boost: 0.60,
        style: 0.16,
        use_speaker_boost: true
    },
    steelpan_sam: {
        stability: 0.32,
        similarity_boost: 0.60,
        style: 0.16,
        use_speaker_boost: true
    },
    tanty: {
        stability: 0.35,
        similarity_boost: 0.62,
        style: 0.12,
        use_speaker_boost: true
    }
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
        stability,
        similarityBoost,
        style,
    } = options;

    const characterKey = (voice as string) in CHARACTER_SETTINGS ? (voice as keyof typeof CHARACTER_SETTINGS) : 'tanty_spice';
    const characterSettings = CHARACTER_SETTINGS[characterKey];

    const finalStability = stability ?? characterSettings.stability;
    const finalSimilarityBoost = similarityBoost ?? characterSettings.similarity_boost;
    const finalStyle = style ?? characterSettings.style;

    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        console.warn('ElevenLabs API key not configured');
        return null;
    }

    try {
        console.log(`[ElevenLabs] Generating for voice: ${VOICES[characterKey]} with Key: ${apiKey.substring(0, 5)}...`);
        const response = await fetch(
            `${ELEVENLABS_API_URL}/text-to-speech/${VOICES[characterKey]}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: finalStability,
                        similarity_boost: finalSimilarityBoost,
                        style: finalStyle,
                        use_speaker_boost: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`ElevenLabs API error: ${response.status} - ${errText}`);
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

export interface SpeechMetadata {
    audioUrl: string;
    words: { text: string; start: number; end: number }[];
}

/**
 * Generates speech and estimates word-level timing for highlighting.
 * In a full production environment, this would use ElevenLabs Websockets or alignment data.
 */
export async function generateSpeechWithMetadata(
    text: string,
    options: TTSOptions = {}
): Promise<SpeechMetadata | null> {
    const audioBuffer = await generateSpeech(text, options);
    if (!audioBuffer) return null;

    // Convert to base64 for data URL
    const base64 = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    // Estimate timing (rough approximation: 10 chars per second for Tanty's slow, warm voice)
    const words = text.split(/\s+/);
    let currentTime = 0;
    const wordTimings = words.map(word => {
        const duration = (word.length / 10) + 0.1; // estimate duration
        const start = currentTime;
        const end = currentTime + duration;
        currentTime = end;
        return { text: word, start, end };
    });

    return {
        audioUrl,
        words: wordTimings
    };
}
