import { GoogleGenAI, Modality } from "@google/genai";
import { TANTY_ISLAND_ENGINE } from '@/services/tantyConfig';

export interface GeminiTTSOptions {
    voiceName?: string;
    character?: 'tanty' | 'roti';
}

const VOICE_PROFILES = {
    tanty: {
        voiceName: "Kore",
        direction: "Tone: Warm Caribbean Grandmother. Emotion: Joyful. Accent: Caribbean."
    },
    roti: {
        voiceName: "Puck",
        direction: "Tone: Friendly, energetic robot companion. Emotion: Excited and curious. Speed: Slightly fast."
    }
};

/**
 * Generate speech using Gemini TTS
 * Returns audio as ArrayBuffer (WAV format with header)
 */
export async function generateGeminiSpeech(
    text: string,
    options: GeminiTTSOptions = {}
): Promise<ArrayBuffer | null> {
    const { character = 'tanty' } = options;
    const profile = VOICE_PROFILES[character];

    // Allow override, otherwise use profile default
    const voiceName = options.voiceName || profile.voiceName;

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        console.warn('Gemini API key not configured (NEXT_PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY)');
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "models/gemini-2.0-flash",
            contents: [{
                parts: [{
                    text: `[Voice Direction: ${profile.direction}] ${text}`
                }]
            }],
            config: {
                responseModalities: [Modality.AUDIO],
                /* speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: voiceName
                        }
                    },
                }, */
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
            // Convert base64 to Buffer
            const pcmBuffer = Buffer.from(base64Audio, 'base64');
            const numChannels = 1;
            const sampleRate = 24000;
            const bitsPerSample = 16;

            // Create WAV header
            const header = Buffer.alloc(44);
            header.write('RIFF', 0);
            header.writeUInt32LE(36 + pcmBuffer.length, 4);
            header.write('WAVE', 8);
            header.write('fmt ', 12);
            header.writeUInt32LE(16, 16);
            header.writeUInt16LE(1, 20); // PCM format
            header.writeUInt16LE(numChannels, 22);
            header.writeUInt32LE(sampleRate, 24);
            header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
            header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
            header.writeUInt16LE(bitsPerSample, 34);
            header.write('data', 36);
            header.writeUInt32LE(pcmBuffer.length, 40);

            const finalBuffer = Buffer.concat([header, pcmBuffer]);
            return finalBuffer.buffer.slice(finalBuffer.byteOffset, finalBuffer.byteOffset + finalBuffer.byteLength);
        }

        console.warn('Gemini TTS: No audio data in response. Response:', JSON.stringify(response, null, 2));
        return null;
    } catch (error) {
        console.error('Gemini TTS error details:', error);
        return null;
    }
}

/**
 * Generate speech and return as base64 data URL
 */
export async function generateGeminiSpeechBase64(
    text: string,
    options: GeminiTTSOptions = {}
): Promise<string | null> {
    const audioBuffer = await generateGeminiSpeech(text, options);
    if (!audioBuffer) return null;

    const base64 = Buffer.from(audioBuffer).toString('base64');
    // Now returns a playable WAV data URL
    return `data:audio/wav;base64,${base64}`;
}
