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
        // 1. Try Google Cloud TTS first (most reliable)
        console.log("[Voice Action] Attempting Google Cloud TTS...");
        const gcResult = await getTantySpiceVoice(cleanText);

        if (gcResult.success && gcResult.audio) {
            console.log("[Voice Action] ✅ Google Cloud TTS success");
            return gcResult;
        }

        // 2. Try Gemini TTS as backup
        console.log("[Voice Action] Google Cloud TTS failed, trying Gemini TTS...");
        try {
            const { generateGeminiSpeechBase64 } = await import("@/lib/gemini-tts");
            const geminiAudio = await generateGeminiSpeechBase64(cleanText);

            if (geminiAudio) {
                console.log("[Voice Action] ✅ Gemini TTS success");
                return { success: true, audio: geminiAudio };
            }
        } catch (geminiError) {
            console.warn("[Voice Action] Gemini TTS failed:", geminiError);
        }

        // 3. Return error - client will use browser speechSynthesis
        console.log("[Voice Action] All TTS services failed, returning error for browser fallback");
        return {
            success: false,
            error: "Server TTS unavailable. Check API keys: GOOGLE_CLOUD_TTS_API_KEY or GEMINI_API_KEY"
        };

    } catch (error) {
        console.error("[Voice Action] Unexpected error:", error);
        return { success: false, error: "Voice generation failed" };
    }
}
