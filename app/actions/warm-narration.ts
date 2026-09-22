'use server';

import { estimateNarrationTimings } from '@/lib/story-narration-policy';
import { synthesizeWarmNarration } from '@/lib/story-narration';

export async function narrateWarmPage(input: { text: string }): Promise<{
    success: boolean;
    audioUrl?: string;
    words?: { text: string; start: number; end: number }[];
    provider?: 'elevenlabs' | 'gemini';
    code?: 'missing_key' | 'generation_failed';
    error?: string;
}> {
    const result = await synthesizeWarmNarration(input.text || '');
    if (!result.ok) {
        return { success: false, code: result.code, error: result.error };
    }

    const audioUrl = `data:${result.contentType};base64,${result.audio.toString('base64')}`;
    return {
        success: true,
        audioUrl,
        words: estimateNarrationTimings(input.text),
        provider: result.provider,
    };
}
