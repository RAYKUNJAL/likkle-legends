
import { supabaseManager } from '@/lib/supabase-client';
import { elevenLabsService, VoiceResponse } from '@/lib/services/elevenlabs';
import { GeneratedStory } from '@/lib/ai-content-generator/generators/story-generator';

const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel (consistent default)
// Other voices available in config if needed

export class AudioGenerationService {

    /**
     * Generate audio for a single page, upload it, and return the updated page object.
     */
    async generatePageAudio(text: string, storyId: string, pageIndex: number): Promise<{ audioUrl: string; alignment: any } | null> {
        try {
            console.log(`   🎤 Generating audio for Page ${pageIndex + 1}...`);

            // 1. Generate Speech with Timestamps
            const result: VoiceResponse = await elevenLabsService.generateSpeech(
                text,
                VOICE_ID,
                { stability: 0.5, similarity: 0.8 }
            );

            // 2. Upload Audio
            const fileName = `stories/${storyId}/page-${pageIndex + 1}-${Date.now()}.mp3`;
            const publicUrl = await this.uploadAudio(result.audioBuffer, fileName);

            if (!publicUrl) return null;

            // 3. Convert Alignment
            const wordAlignment = this.convertToWordAlignment(result.alignment, result.normalizedText);

            return {
                audioUrl: publicUrl,
                alignment: {
                    words: wordAlignment,
                    character_alignment: result.alignment // Keep raw if needed
                }
            };

        } catch (err: any) {
            console.error(`     ❌ Generation failed for page ${pageIndex}:`, err.message);
            return null;
        }
    }

    /**
     * Generate audio for an entire story (all pages in parallel).
     * Returns the updated story object with audio data.
     * Optionally updates the database directly if updateDB is true.
     */
    async generateAudioForStory(story: GeneratedStory, storyId: string, updateDB: boolean = true): Promise<GeneratedStory> {
        console.log(`🎙️ Starting audio generation for story: ${story.title} (${story.pages.length} pages)`);

        // Process all pages in parallel
        const processedPages = await Promise.all(story.pages.map(async (page, index) => {
            const audioData = await this.generatePageAudio(page.text, storyId, index);

            if (audioData) {
                return {
                    ...page,
                    audioUrl: audioData.audioUrl,
                    audio: {
                        alignment: audioData.alignment,
                        duration: 0 // We could calculate this from alignment boundaries
                    }
                };
            }
            return page;
        }));

        const updatedStory = { ...story, pages: processedPages };

        if (updateDB) {
            await this.updateStoryInDB(storyId, updatedStory);
        }

        console.log(`✅ Audio generation complete for ${storyId}`);
        return updatedStory;
    }

    private async uploadAudio(buffer: Buffer, path: string): Promise<string | null> {
        // Use supabaseManager to get a client
        const client = supabaseManager.getClient();

        const { data, error } = await client.storage
            .from('stories') // Ensure this bucket exists!
            .upload(path, buffer, {
                contentType: 'audio/mpeg',
                upsert: true
            });

        if (error) {
            console.error('❌ Upload failed:', error.message);
            return null;
        }

        const { data: publicUrlData } = client.storage
            .from('stories')
            .getPublicUrl(path);

        return publicUrlData.publicUrl;
    }

    private async updateStoryInDB(storyId: string, story: GeneratedStory) {
        // Prepare content_json to match the schema expected by the frontend/DB
        // logic from database-poster or script
        const contentJson = {
            pages: story.pages,
            patoisWords: story.metadata.patoisWords,
            culturalElements: story.metadata.culturalElements
        };

        const client = supabaseManager.getClient();

        const { error } = await client
            .from('storybooks')
            .update({ content_json: contentJson })
            .eq('id', storyId);

        if (error) console.error('❌ Failed to update story in DB:', error.message);
    }

    /**
     * Converts ElevenLabs character alignment to word-level alignment
     */
    private convertToWordAlignment(alignment: any, text: string) {
        if (!alignment || !alignment.characters) return [];

        const words: any[] = [];
        let currentWord = "";
        let start = -1;
        let end = -1;

        // Note: This needs to handle the case where characters array might be mismatched or complex
        // But the simple logic from the script is a good baseline
        const chars = alignment.characters;
        const starts = alignment.character_start_times_seconds;
        const ends = alignment.character_end_times_seconds;

        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            const s = starts[i];
            const e = ends[i];

            if (char === ' ') {
                if (currentWord.trim().length > 0) {
                    words.push({
                        text: currentWord.trim(),
                        startTimeSeconds: start,
                        endTimeSeconds: end
                    });
                }
                currentWord = "";
                start = -1;
            } else {
                if (start === -1) start = s;
                end = e;
                currentWord += char;
            }
        }

        // Final word
        if (currentWord.trim().length > 0) {
            words.push({
                text: currentWord.trim(),
                startTimeSeconds: start,
                endTimeSeconds: end
            });
        }

        return words;
    }
}

export const audioGenerationService = new AudioGenerationService();
