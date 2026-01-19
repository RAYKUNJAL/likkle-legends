"use server";

import { getTantySpiceVoice } from "@/lib/google-cloud-tts";

/**
 * 🎙️ Tanty Spice Voice Action
 * Production-grade voice generation with multiple fallbacks
 * 
 * Priority:
 * 1. Google Cloud TTS (reliable, warm voice)
 * 2. Gemini TTS (experimental backup)
 * 3. Return error for client-side browser fallback
 */

export async function getTantyVoice(text: string): Promise<{
    success: boolean;
    audio?: string;
    error?: string;
}> {
    if (!text || text.trim().length === 0) {
        return { success: false, error: "No text provided" };
    }

    // Clean and limit text for TTS
    const cleanText = text.trim().substring(0, 1000); // Limit to prevent huge API calls

    try {
        // 1. Try Gemini TTS first (Native Audio - Supports Accent Prompting)
        // detailed "Voice Direction" in lib/gemini-tts.ts helps it handle Patois better than Neural2.
        try {
            const { generateGeminiSpeechBase64 } = await import("@/lib/gemini-tts");
            const geminiAudio = await generateGeminiSpeechBase64(cleanText, { voiceName: "Kore" });

            if (geminiAudio) {
                return { success: true, audio: geminiAudio };
            }
        } catch (geminiError) {
            // Fallback silently
        }

        // 2. Try Google Cloud TTS as backup (Neural2)
        const gcResult = await getTantySpiceVoice(cleanText);

        if (gcResult.success && gcResult.audio) {
            return gcResult;
        }

        // 3. Return error - client will use browser speechSynthesis
        return {
            success: false,
            error: "Server TTS unavailable. Check API keys: GOOGLE_CLOUD_TTS_API_KEY or GEMINI_API_KEY"
        };

    } catch (error) {
        console.error("[Voice Action] Unexpected error:", error);
        return { success: false, error: "Voice generation failed" };
    }
}
