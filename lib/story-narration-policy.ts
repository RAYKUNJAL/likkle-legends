/**
 * Story narration policy.
 * The July 2026 catalog recordings (narrated_by: tanty_spice_elevenlabs,
 * voice JfiM1myzVx7xU2MZOAJS, high stability) stay on disk but are not played.
 * Readers only play audio marked as the warm island narrator, or audio
 * generated live by that narrator. Browser speech synthesis is not a fallback.
 */

export const WARM_NARRATOR_PREFIX = 'warm_island_narrator';

/** Tanty Spice — the voice of every picture-book narration (custom ElevenLabs voice). */
export const DEFAULT_WARM_STORY_VOICE_ID = 'RdKVaQgg8n1rUzICELn1';

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
    if (provider === 'elevenlabs') return 'Tanty Spice · reading aloud';
    if (provider === 'gemini') return 'Tanty Spice · reading aloud';
    return 'Tanty Spice · reading aloud';
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

/** Stretch/squash word timings so the last end matches real audio duration (karaoke sync). */
export function scaleNarrationTimingsToDuration(
    text: string,
    durationSec: number,
    existing?: { text: string; start: number; end: number }[] | null,
): { text: string; start: number; end: number }[] {
    const base = existing && existing.length ? existing : estimateNarrationTimings(text);
    if (!base.length || !(durationSec > 0)) return base;
    const lastEnd = base[base.length - 1]?.end || 0;
    if (!(lastEnd > 0)) return base;
    const scale = durationSec / lastEnd;
    return base.map((w) => ({ text: w.text, start: w.start * scale, end: w.end * scale }));
}
