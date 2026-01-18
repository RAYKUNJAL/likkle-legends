
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { getTantySystemInstruction, TANTY_DIALECT_RULES, TANTY_ISLAND_ENGINE } from "./tantyConfig";
import { getCachedAudio, setCachedAudio } from "./voiceCacheService";

/**
 * PRODUCTION-GRADE AUDIO SYSTEM
 */
declare global {
    interface window {
        globalAudioContext?: AudioContext;
    }
}

export interface TantyChatResponse {
    text: string;
    groundingLinks: { title: string; uri: string }[];
}

// Utility to check for quota errors
export const isQuotaError = (err: any): boolean => {
    const msg = err?.message || String(err);
    return msg.includes('exceeded quota') || msg.includes('429') || msg.includes('Too Many Requests');
};

export const getGlobalAudioContext = (): AudioContext => {
    if (typeof window === 'undefined') return {} as AudioContext;
    if (!(window as any).globalAudioContext || (window as any).globalAudioContext.state === 'closed') {
        const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        (window as any).globalAudioContext = new AudioContextClass({
            sampleRate: 24000,
        });
    }
    return (window as any).globalAudioContext!;
};

export const unlockMobileAudio = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    const ctx = getGlobalAudioContext();
    try {
        if (ctx.state === 'suspended') await ctx.resume();
        const buffer = ctx.createBuffer(1, 1, 24000);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
        return ctx.state === 'running';
    } catch (e) {
        return false;
    }
};

export const kickstartMobileAudio = unlockMobileAudio;

/**
 * Manual Base64 decoding for raw bytes.
 */
export function decodeBase64(base64: string): Uint8Array {
    if (typeof window === 'undefined') return new Uint8Array(0);
    if (!base64) return new Uint8Array(0);
    try {
        const binaryString = atob(base64.replace(/\s/g, ''));
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } catch (e) {
        return new Uint8Array(0);
    }
}

export async function decodeAudioData(base64String: string, ctx: AudioContext, sourceSampleRate: number = 24000): Promise<AudioBuffer | null> {
    if (!base64String || typeof window === 'undefined') return null;
    try {
        const bytes = decodeBase64(base64String);
        if (bytes.length === 0) return null;
        const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        const int16Data = new Int16Array(ab);
        const float32Data = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) {
            // Correct normalization for 16-bit PCM
            float32Data[i] = int16Data[i] / 32768.0;
        }
        const audioBuffer = ctx.createBuffer(1, float32Data.length, sourceSampleRate);
        audioBuffer.getChannelData(0).set(float32Data);
        return audioBuffer;
    } catch (err) {
        console.error("Audio Decode Error:", err);
        return null;
    }
}

/**
 * RESILIENT NARRATION (TTS)
 */
export async function narrateText(text: string): Promise<AudioBuffer | null> {
    if (typeof window === 'undefined') return null;
    const ctx = getGlobalAudioContext();

    // 1. Check Cache First
    const cached = await getCachedAudio(text);
    if (cached) {
        return await decodeAudioDataFromRaw(cached, ctx);
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null);

    if (!apiKey) {
        console.warn("API Key missing for narration.");
        return null;
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate high-fidelity speech for the following dialogue using the 'Kore' voice. The speaker is Tanty Spice, a warm, expressive Caribbean grandmother. The tone should be gentle, melodic, and richly emotional. Avoid any robotic flatness. Dialogue: ${text}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
                }
            }
        });

        const audioDataBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (audioDataBase64) {
            const rawBytes = decodeBase64(audioDataBase64);
            // 2. Save to Cache (store the raw ArrayBuffer)
            await setCachedAudio(text, rawBytes.buffer);

            return await decodeAudioDataFromRaw(rawBytes.buffer, ctx);
        }
        console.warn("No audio data returned from Gemini.");
        return null;
    } catch (e: any) {
        console.error(`[GEMINI_TTS_FAIL]`, e);
        return null;
    }
}

/**
 * PERSONALIZED BIRTHDAY SONG
 */
export async function generateBirthdaySong(childName: string, guide: string = "Tanty Spice"): Promise<AudioBuffer | null> {
    if (typeof window === 'undefined') return null;
    const ctx = getGlobalAudioContext();

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null);
    if (!apiKey) return null;

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Sing a short, magical Caribbean birthday song for ${childName}. 
    Guide: ${guide}.
    Personality: Warm, grandmotherly, musical.
    Structure: Verse mentioning ${childName} growing tall like a coconut tree, Chorus with happy celebration.
    Use rhythmic Patois inflections.`;

    try {
        const response = await ai.models.generateContent({
            model: TANTY_ISLAND_ENGINE.technical_stack.vocal_model,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: TANTY_ISLAND_ENGINE.vocal_blueprint.voice_name } },
                }
            }
        });

        const audioDataBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioDataBase64) {
            const rawBytes = decodeBase64(audioDataBase64);
            return await decodeAudioDataFromRaw(rawBytes.buffer, ctx);
        }
        return null;
    } catch (e) {
        console.error("Birthday Song Generation Error:", e);
        return null;
    }
}

/**
 * Helper to decode raw bytes directly without base64 step
 */
async function decodeAudioDataFromRaw(buffer: ArrayBuffer, ctx: AudioContext, sourceSampleRate: number = 24000): Promise<AudioBuffer | null> {
    try {
        const int16Data = new Int16Array(buffer);
        const float32Data = new Float32Array(int16Data.length);
        for (let i = 0; i < int16Data.length; i++) {
            float32Data[i] = int16Data[i] / 32768.0;
        }
        const audioBuffer = ctx.createBuffer(1, float32Data.length, sourceSampleRate);
        audioBuffer.getChannelData(0).set(float32Data);
        return audioBuffer;
    } catch (err) {
        console.error("Raw Audio Decode Error:", err);
        return null;
    }
}

/**
 * STREAMING CHAT
 */
export async function* getTantySpiceResponseStream(userPrompt: string, ageGroup: string = "6-8"): AsyncGenerator<string> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('GEMINI_API_KEY') : null);
    if (!apiKey) throw new Error("API Key missing.");

    const ai = new GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateContentStream({
            model: TANTY_ISLAND_ENGINE.technical_stack.brain_model,
            contents: userPrompt,
            config: {
                systemInstruction: getTantySystemInstruction(ageGroup),
                temperature: 0.8,
            },
        });

        for await (const chunk of response) {
            if (chunk.text) yield chunk.text;
        }
    } catch (e) {
        throw e;
    }
}
