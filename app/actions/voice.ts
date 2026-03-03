"use server";

import { getTantySpiceVoice as getGoogleCloudTanty, getRotiVoice as getGoogleCloudRoti } from "@/lib/google-cloud-tts";
import { generateGeminiSpeechBase64 } from "@/lib/gemini-tts";
import { generateSpeechBase64 as getElevenLabsVoice, generateSpeechWithMetadata } from "@/lib/elevenlabs";

// export const maxDuration = 60; // Config not supported in Server Actions

/**
 * 🎙️ Tanty Spice Voice Action (Legacy Wrapper)
 */
export async function getTantyVoice(text: string) {
    return generateCharacterAudio(text, 'tanty');
}

/**
 * 🎧 Universal Character Voice Action
 * Supports: 'tanty', 'roti'
 */
export async function generateCharacterAudio(
    text: string,
    character: 'tanty' | 'roti' | 'dilly' = 'tanty'
): Promise<{
    success: boolean;
    audio?: string;
    error?: string;
}> {
    if (!text || text.trim().length === 0) {
        return { success: false, error: "No text provided" };
    }

    const cleanText = text.trim().substring(0, 2000);

    try {
        // 1. ELEVENLABS (Premium - Best Quality)
        if (process.env.ELEVENLABS_API_KEY) {
            try {
                // Map 'roti' to 'steelpan_sam' if not explicitly defined in lib/elevenlabs
                const voiceKey = character === 'tanty' ? 'tanty_spice' : character === 'dilly' ? 'dilly_doubles' : 'roti';

                // Use generateSpeechBase64 instead of getElevenLabsVoice (alias issue)
                // We need to import generateSpeechBase64 if getElevenLabsVoice is just generateSpeechBase64
                // Checking imports: import { generateSpeechBase64 as getElevenLabsVoice } from "@/lib/elevenlabs";
                // lib/elevenlabs.ts generateSpeechBase64 returns Data URI.

                const elAudio = await getElevenLabsVoice(cleanText, { voice: voiceKey as any });
                if (elAudio) {
                    return { success: true, audio: elAudio };
                }
            } catch (elError) {
                console.warn(`[Voice] ElevenLabs failed for ${character}:`, elError);
            }
        }

        // 2. GENERATE WITH GEMINI (Primary for all characters now)
        try {
            const geminiAudio = await generateGeminiSpeechBase64(cleanText, { character });
            if (geminiAudio) {
                // geminiAudio is already a Data URI from generateGeminiSpeechBase64
                return { success: true, audio: geminiAudio };
            }
        } catch (geminiError) {
            console.warn(`[Voice] Gemini failed for ${character}:`, geminiError);
        }

        // 2. FALLBACK for characters (Google Cloud Neural2)
        if (character === 'tanty') {
            const gcResult = await getGoogleCloudTanty(cleanText);
            if (gcResult.success) return gcResult;
        } else if (character === 'roti' || character === 'dilly') {
            const gcResult = await getGoogleCloudRoti(cleanText);
            if (gcResult.success) return gcResult;
        }

        return {
            success: false,
            error: "TTS Generation Failed"
        };

    } catch (error) {
        console.error("[Voice Action] Critical error:", error);
        return { success: false, error: "Voice generation failed" };
    }
}

function estimateWordTimings(text: string) {
    const words = text.split(/\s+/).filter(Boolean);
    let currentTime = 0;
    return words.map((word) => {
        const duration = (word.length / 10) + 0.1;
        const start = currentTime;
        const end = currentTime + duration;
        currentTime = end;
        return { text: word, start, end };
    });
}

export async function generateCharacterAudioWithMetadata(
    text: string,
    character: 'tanty' | 'roti' | 'dilly' = 'tanty'
): Promise<{
    success: boolean;
    audio?: string;
    words?: { text: string; start: number; end: number }[];
    error?: string;
}> {
    if (!text || text.trim().length === 0) {
        return { success: false, error: "No text provided" };
    }

    const cleanText = text.trim().substring(0, 2000);

    try {
        if (process.env.ELEVENLABS_API_KEY) {
            try {
                const voiceKey = character === 'tanty' ? 'tanty_spice' : character === 'dilly' ? 'dilly_doubles' : 'roti';
                const meta = await generateSpeechWithMetadata(cleanText, { voice: voiceKey as any });
                if (meta?.audioUrl) {
                    return { success: true, audio: meta.audioUrl, words: meta.words };
                }
            } catch (elError) {
                console.warn(`[Voice] ElevenLabs metadata failed for ${character}:`, elError);
            }
        }

        try {
            const geminiAudio = await generateGeminiSpeechBase64(cleanText, { character });
            if (geminiAudio) {
                return { success: true, audio: geminiAudio, words: estimateWordTimings(cleanText) };
            }
        } catch (geminiError) {
            console.warn(`[Voice] Gemini failed for ${character}:`, geminiError);
        }

        if (character === 'tanty') {
            const gcResult = await getGoogleCloudTanty(cleanText);
            if (gcResult.success) return { success: true, audio: gcResult.audio, words: estimateWordTimings(cleanText) };
        } else {
            const gcResult = await getGoogleCloudRoti(cleanText);
            if (gcResult.success) return { success: true, audio: gcResult.audio, words: estimateWordTimings(cleanText) };
        }

        return {
            success: false,
            error: "TTS Generation Failed"
        };
    } catch (error) {
        console.error("[Voice Action] Critical error:", error);
        return { success: false, error: "Voice generation failed" };
    }
}
