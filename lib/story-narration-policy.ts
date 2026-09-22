/**
 * Story narration policy.
 * The July 2026 catalog recordings (narrated_by: tanty_spice_elevenlabs,
 * voice JfiM1myzVx7xU2MZOAJS, high stability) stay on disk but are not played.
 * Readers only play audio marked as the warm island narrator, or audio
 * generated live by that narrator. Browser speech synthesis is not a fallback.
 */

export const WARM_NARRATOR_PREFIX = 'warm_island_narrator';

/** Premade ElevenLabs narrative voice (Matilda). Not a partnership or a custom clone. */
export const DEFAULT_WARM_STORY_VOICE_ID = 'XrExE9yKIg1WjnnlVkGX';

/** Previous story voice. Kept only so we never silently select it again. */
export const RETIRED_ROBOTIC_VOICE_ID = 'JfiM1myzVx7xU2MZOAJS';

export const WARM_ELEVENLABS_MODEL = 'eleven_multilingual_v2';

export const WARM_VOICE_SETTINGS = {
    stability: 0.42,
    similarity_boost: 0.78,
    style: 0.28,
    use_speaker_boost: true,
} as const;

export function isWarmNarration(narratedBy?: string | null): boolean {
    return typeof narratedBy === 'string' && narratedBy.startsWith(WARM_NARRATOR_PREFIX);
}

export function warmStoryVoiceId(env: NodeJS.ProcessEnv = process.env): string {
    const override = env.ELEVENLABS_STORY_VOICE_ID?.trim();
    if (override && override !== RETIRED_ROBOTIC_VOICE_ID) return override;
    return DEFAULT_WARM_STORY_VOICE_ID;
}

export function warmNarrationLabel(provider?: 'elevenlabs' | 'gemini' | null): string {
    if (provider === 'elevenlabs') return 'Warm island narrator · ElevenLabs';
    if (provider === 'gemini') return 'Warm island narrator · Gemini';
    return 'Warm island narrator';
}

export function missingNarrationKeyMessage(): string {
    return 'Warm narration needs ELEVENLABS_API_KEY (preferred) or GEMINI_API_KEY. The older robotic recording stays off, and no browser voice will play.';
}

export function readerPageAudioUrl(options: {
    narratedBy?: string | null;
    pageAudioUrl?: string | null;
    catalogAudioUrl?: string | null;
    pageNarratedBy?: string | null;
}): string | undefined {
    const allowed = isWarmNarration(options.narratedBy) || isWarmNarration(options.pageNarratedBy);
    if (!allowed) return undefined;
    const url = String(options.pageAudioUrl || options.catalogAudioUrl || '').trim();
    return url || undefined;
}

export function estimateNarrationTimings(text: string): { text: string; start: number; end: number }[] {
    const words = text.split(/\s+/).filter(Boolean);
    let currentTime = 0;
    return words.map((word) => {
        const duration = Math.max(0.18, word.length / 12 + 0.12);
        const start = currentTime;
        const end = currentTime + duration;
        currentTime = end;
        return { text: word, start, end };
    });
}
