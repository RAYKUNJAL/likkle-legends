"use server";

/**
 * 🎙️ Google Cloud Text-to-Speech Service
 * Production-grade TTS using Google Cloud REST API
 * 
 * Voice: en-GB-Wavenet-C (warm British female)
 * Tuned for: Caribbean grandmother character (lower pitch, slower pace)
 */

interface TTSConfig {
    languageCode?: string;
    voiceName?: string;
    pitch?: number;      // -20.0 to 20.0 (semitones)
    speakingRate?: number; // 0.25 to 4.0
    volumeGainDb?: number; // -96.0 to 16.0
    useSSML?: boolean;
}

interface TTSResponse {
    audioContent: string; // base64 encoded audio
}

const DEFAULT_CONFIG: TTSConfig = {
    languageCode: "en-GB",
    voiceName: "en-GB-Neural2-C", // Warm British female Neural2 voice (per spec)
    pitch: -2.0,         // Lower pitch for grandmotherly warmth
    speakingRate: 0.90,  // Slower for measured, caring delivery
    volumeGainDb: 1.0,   // Slight volume boost
    useSSML: true,       // Enable SSML for better prosody
};

/**
 * Generate speech using Google Cloud TTS REST API
 * Returns base64 audio string or null on failure
 */
export async function synthesizeSpeech(
    text: string,
    config: TTSConfig = {}
): Promise<string | null> {
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        console.warn("[Google Cloud TTS] API key not configured (GOOGLE_CLOUD_TTS_API_KEY)");
        return null;
    }

    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    // Clean text for TTS - remove excessive punctuation that causes pauses
    const cleanText = text
        .replace(/\.{3,}/g, '...')  // Normalize ellipsis
        .replace(/!{2,}/g, '!')     // Normalize exclamation
        .replace(/\?{2,}/g, '?')    // Normalize questions
        .trim();

    if (!cleanText) {
        console.warn("[Google Cloud TTS] Empty text provided");
        return null;
    }

    const requestBody = {
        input: { text: cleanText },
        voice: {
            languageCode: mergedConfig.languageCode,
            name: mergedConfig.voiceName,
        },
        audioConfig: {
            audioEncoding: "MP3",
            pitch: mergedConfig.pitch,
            speakingRate: mergedConfig.speakingRate,
            volumeGainDb: mergedConfig.volumeGainDb,
            effectsProfileId: ["headphone-class-device"], // Warm, natural sound
        },
    };

    try {
        const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Google Cloud TTS] API Error:", response.status, errorText);
            return null;
        }

        const data: TTSResponse = await response.json();

        if (data.audioContent) {
            console.log("[Google Cloud TTS] Success! Audio generated for", cleanText.substring(0, 50) + "...");
            return data.audioContent;
        }

        console.warn("[Google Cloud TTS] No audio content in response");
        return null;
    } catch (error) {
        console.error("[Google Cloud TTS] Request failed:", error);
        return null;
    }
}

/**
 * Get audio as a playable data URL
 */
export async function getTTSAudioUrl(
    text: string,
    config: TTSConfig = {}
): Promise<string | null> {
    const base64Audio = await synthesizeSpeech(text, config);
    if (!base64Audio) return null;
    return `data:audio/mp3;base64,${base64Audio}`;
}

/**
 * Tanty Spice specific voice preset
 * Warm Caribbean grandmother voice using Neural2-C
 * Per spec: en-GB-Neural2-C with pitch -2st and rate 0.90
 */
export async function getTantySpiceVoice(text: string): Promise<{
    success: boolean;
    audio?: string;
    error?: string;
}> {
    try {
        const audioUrl = await getTTSAudioUrl(text, {
            // Per Tanty Spice spec v3.0.0
            voiceName: "en-GB-Neural2-C",  // Neural2 for more natural sound
            pitch: -2.0,        // Lower pitch creates grandmotherly warmth
            speakingRate: 0.90, // Slower pace for warm, measured storytelling
            volumeGainDb: 1.0,  // Slight boost for clarity
        });

        if (audioUrl) {
            return { success: true, audio: audioUrl };
        }

        return { success: false, error: "Failed to generate audio" };
    } catch (error) {
        console.error("[Tanty Voice] Generation error:", error);
        return { success: false, error: "Voice generation failed" };
    }
}

/**
 * R.O.T.I specific voice preset
 * Friendly, energetic robot companion
 * Voice: en-US-Neural2-J (Male) with pitch +2.0st and rate 1.10
 */
export async function getRotiVoice(text: string): Promise<{
    success: boolean;
    audio?: string;
    error?: string;
}> {
    try {
        const audioUrl = await getTTSAudioUrl(text, {
            voiceName: "en-US-Neural2-J",
            pitch: 2.0,         // Higher pitch for youthful/robotic energy
            speakingRate: 1.10, // Faster pace for excitement
            volumeGainDb: 1.0,
        });

        if (audioUrl) {
            return { success: true, audio: audioUrl };
        }

        return { success: false, error: "Failed to generate audio" };
    } catch (error) {
        console.error("[ROTI Voice] Generation error:", error);
        return { success: false, error: "Voice generation failed" };
    }
}
