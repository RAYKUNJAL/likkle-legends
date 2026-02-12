"use server";

import { getTantySpiceVoice as getGoogleCloudTanty, getRotiVoice as getGoogleCloudRoti } from "@/lib/google-cloud-tts";
import { generateGeminiSpeechBase64 } from "@/lib/gemini-tts";
import { generateSpeechBase64 as getElevenLabsVoice } from "@/lib/elevenlabs";

export const maxDuration = 60; // Allow 60 seconds for voice generation

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
    character: 'tanty' | 'roti' = 'tanty'
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
                const voiceKey = character === 'tanty' ? 'tanty_spice' : 'roti';
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
                return { success: true, audio: geminiAudio };
            }
        } catch (geminiError) {
            console.warn(`[Voice] Gemini failed for ${character}:`, geminiError);
        }

        // 2. FALLBACK for characters (Google Cloud Neural2)
        if (character === 'tanty') {
            const gcResult = await getGoogleCloudTanty(cleanText);
            if (gcResult.success) return gcResult;
        } else if (character === 'roti') {
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
