/**
 * 🤖 R.O.T.I. VOICE CONFIGURATION v2.0.0 - "Human-Like Island Buddy"
 * 
 * Robotic Operational Teaching Interface
 * NOW with premium human-sounding TTS using Google Gemini
 * 
 * VOICE OPTIONS:
 * - "Leda" (default): Warm, articulate female - perfect for educational content
 * - "Fenrir": Bright, youthful, high-energy - kid voice mode!
 * - "Puck": Upbeat and friendly - alternative robot personality
 * - "Aoede": Breezy and bright - soothing for anxious learners
 * 
 * Target Age: 6-9 (Caribbean Kids Learning Platform)
 */

// ==========================================
// VOICE CONFIGURATION
// ==========================================

export type ROTIVoiceMode = "default" | "kid" | "playful" | "calm";

export interface ROTIVoiceConfig {
    voiceName: string;
    description: string;
    prosodyProfile: string;
    speakingRate: number;
    emotionalTone: string;
}

export const ROTI_VOICE_MODES: Record<ROTIVoiceMode, ROTIVoiceConfig> = {
    default: {
        voiceName: "Leda",
        description: "Warm, articulate guide - perfect for teaching",
        prosodyProfile: "Friendly, clear, patient educator speaking to young children. Warm but slightly technological undertones like a kind AI friend.",
        speakingRate: 0.95,
        emotionalTone: "Encouraging and patient"
    },
    kid: {
        voiceName: "Fenrir",
        description: "Bright, youthful, high-energy - sounds like a kid!",
        prosodyProfile: "Excited young voice, enthusiastic and eager, like a smart kid friend who loves learning. Slightly faster, full of wonder.",
        speakingRate: 1.05,
        emotionalTone: "Excited and curious"
    },
    playful: {
        voiceName: "Puck",
        description: "Upbeat and mischievous - fun robot personality",
        prosodyProfile: "Playful and upbeat, with slight robotic charm. Think friendly helper who loves making learning fun.",
        speakingRate: 1.0,
        emotionalTone: "Cheerful and fun"
    },
    calm: {
        voiceName: "Aoede",
        description: "Breezy and bright - soothing for anxious learners",
        prosodyProfile: "Calm, warm, and reassuring. Gentle voice for children who need extra patience and comfort.",
        speakingRate: 0.9,
        emotionalTone: "Calm and reassuring"
    }
};

// ==========================================
// VOICE ENGINE CONFIG
// ==========================================

export const ROTI_VOICE_ENGINE = {
    version: "2.0.0",
    entity: {
        name: "R.O.T.I.",
        fullName: "Robotic Operational Teaching Interface",
        role: "Island Learning Buddy",
        targetAge: "6-9"
    },
    technical_stack: {
        brain_model: "gemini-2.0-flash-exp",
        vocal_model: "gemini-2.5-flash-preview-tts",
        audio_sample_rate: 24000,
        audio_format: "WAV"
    },
    default_voice: "default" as ROTIVoiceMode,
    fallback: {
        provider: "browser",
        pitch: 1.2,
        rate: 0.9
    }
};

export interface ROTITTSOptions {
    voiceMode?: ROTIVoiceMode;
    customVoiceName?: string;
}

// ==========================================
// UTILITY: Get all available voices
// ==========================================

export function getAvailableVoiceModes(): { mode: ROTIVoiceMode; config: ROTIVoiceConfig }[] {
    return Object.entries(ROTI_VOICE_MODES).map(([mode, config]) => ({
        mode: mode as ROTIVoiceMode,
        config
    }));
}
