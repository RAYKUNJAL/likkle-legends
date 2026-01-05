"use server";

import { generateGeminiSpeechBase64 } from "@/lib/gemini-tts";
import { generateSpeechBase64 as generateElevenLabsBase64 } from "@/lib/elevenlabs";

export async function getTantyVoice(text: string) {
    try {
        // Try Gemini TTS first (configured with Kore voice)
        const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (geminiApiKey) {
            console.log("Voice Action: Using Gemini TTS");
            const audioData = await generateGeminiSpeechBase64(text);
            if (audioData) {
                return { success: true, audio: audioData };
            }
        }

        // Fallback to ElevenLabs
        console.log("Voice Action: Falling back to ElevenLabs");
        const audioData = await generateElevenLabsBase64(text, { voice: 'tanty_spice' });
        if (audioData) {
            return { success: true, audio: audioData };
        }

        return { success: false, error: "No audio generated. Check NEXT_PUBLIC_GEMINI_API_KEY or ELEVENLABS_API_KEY" };
    } catch (e) {
        console.error("Voice generation error:", e);
        return { success: false, error: "Server error" };
    }
}

