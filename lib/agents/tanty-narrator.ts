/**
 * Tanty Spice Story Narrator
 *
 * Generates ElevenLabs voice narration for stories_library books.
 * Reads each page of a book, generates audio with Tanty Spice's voice,
 * and saves the audio URL back to the book's metadata.
 *
 * Uses the ELEVENLABS_API_KEY already on file.
 */

import { supabaseAdmin } from '@/lib/supabase-client';

const ELEVENLABS_API = 'https://api.elevenlabs.io/v1';

// Tanty Spice voice — warm Caribbean grandmother
// Using a voice that sounds warm and grandmotherly
const TANTY_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'JfiM1myzVx7xU2MZOAJS'; // fallback default
const TANTY_VOICE_SETTINGS = {
    stability: 0.75,
    similarity_boost: 0.75,
    style: 0.3, // slightly more expressive for storytelling
    use_speaker_boost: true,
};

export interface NarrationResult {
    bookId: string;
    audioUrls: string[];
    success: boolean;
    error?: string;
}

/**
 * Generate narration for a single book's pages using ElevenLabs.
 * Returns array of Supabase storage URLs for each page's audio.
 */
export async function narrateBook(bookId: string): Promise<NarrationResult> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        return { bookId, audioUrls: [], success: false, error: 'ELEVENLABS_API_KEY not set' };
    }

    // Fetch the book
    const { data: book, error } = await supabaseAdmin
        .from('stories_library')
        .select('id, title, slug, content')
        .eq('id', bookId)
        .maybeSingle();

    if (error || !book) {
        return { bookId, audioUrls: [], success: false, error: 'Book not found' };
    }

    const content = typeof book.content === 'string' ? JSON.parse(book.content) : book.content;
    const pages: any[] = content.pages || [];
    if (pages.length === 0) {
        return { bookId, audioUrls: [], success: false, error: 'No pages to narrate' };
    }

    const audioUrls: string[] = [];

    for (let i = 0; i < pages.length; i++) {
        const text = pages[i].text || '';
        if (!text || text.length < 5) {
            audioUrls.push('');
            continue;
        }

        // Prepend Tanty's intro for page 1
        const narrationText = i === 0
            ? `Hello there! Tanty Spice here. I have a wonderful story for you. It's called ${book.title}. ${text}`
            : text;

        try {
            console.log(`[TantyNarrator] Generating audio for page ${i + 1}/${pages.length} of "${book.title}"`);

            const res = await fetch(`${ELEVENLABS_API}/text-to-speech/${TANTY_VOICE_ID}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: narrationText,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: TANTY_VOICE_SETTINGS,
                }),
            });

            if (!res.ok) {
                const errBody = await res.text();
                console.error(`[TantyNarrator] ElevenLabs error page ${i + 1}:`, res.status, errBody.substring(0, 200));
                audioUrls.push('');
                continue;
            }

            // Get audio as blob
            const audioBuffer = await res.arrayBuffer();

            // Upload to Supabase Storage
            const path = `story-audio/${book.slug}/page-${String(i + 1).padStart(2, '0')}.mp3`;
            const { data: uploadData, error: uploadError } = await supabaseAdmin
                .storage
                .from('story-narrations')
                .upload(path, audioBuffer, {
                    contentType: 'audio/mpeg',
                    upsert: true,
                });

            if (uploadError) {
                // Try creating the bucket if it doesn't exist
                if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
                    await supabaseAdmin.storage.createBucket('story-narrations', { public: true });
                    const retry = await supabaseAdmin.storage.from('story-narrations').upload(path, audioBuffer, {
                        contentType: 'audio/mpeg',
                        upsert: true,
                    });
                    if (retry.error) {
                        console.error(`[TantyNarrator] Upload retry failed page ${i + 1}:`, retry.error.message);
                        audioUrls.push('');
                        continue;
                    }
                } else {
                    console.error(`[TantyNarrator] Upload failed page ${i + 1}:`, uploadError.message);
                    audioUrls.push('');
                    continue;
                }
            }

            // Get public URL (use public path proxy, not internal kong)
            const { data: urlData } = supabaseAdmin.storage.from('story-narrations').getPublicUrl(path);
            const publicUrl = urlData?.publicUrl || '';
            const fixedUrl = publicUrl.includes('supabase-kong')
                ? publicUrl.replace('http://supabase-kong:8000', 'https://www.likklelegends.com/supabase')
                : publicUrl;
            audioUrls.push(fixedUrl);
        } catch (err: any) {
            console.error(`[TantyNarrator] Page ${i + 1} error:`, err.message);
            audioUrls.push('');
        }

        // Rate limit: 500ms between requests
        await new Promise(r => setTimeout(r, 500));
    }

    // Save audio URLs back to book metadata
    const updatedContent = { ...content, audio_urls: audioUrls, narrated_by: 'tanty_spice_elevenlabs' };
    await supabaseAdmin.from('stories_library')
        .update({ content: updatedContent })
        .eq('id', bookId);

    return { bookId, audioUrls, success: true };
}

/**
 * Batch narrate all books in the library that don't have audio yet.
 */
export async function narrateAllBooks(): Promise<NarrationResult[]> {
    const { data: books } = await supabaseAdmin
        .from('stories_library')
        .select('id, title, content')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (!books || books.length === 0) {
        return [];
    }

    const results: NarrationResult[] = [];
    for (const book of books) {
        const content = typeof book.content === 'string' ? JSON.parse(book.content) : book.content;
        if (content.audio_urls && Array.isArray(content.audio_urls) && content.audio_urls.some((u: string) => u)) {
            console.log(`[TantyNarrator] Skipping "${book.title}" — already narrated`);
            results.push({ bookId: book.id, audioUrls: content.audio_urls, success: true });
            continue;
        }
        console.log(`[TantyNarrator] Narrating "${book.title}"...`);
        const result = await narrateBook(book.id);
        results.push(result);
    }

    return results;
}
