import { supabaseManager } from '@/lib/supabase-client';
import { GoogleVoiceCharacter, synthesizeCharacterSpeech } from '@/lib/google-cloud-tts';
import { GeneratedStory } from '@/lib/ai-content-generator/generators/story-generator';

const DEFAULT_VOICE_ID: GoogleVoiceCharacter = 'roti';

export class AudioGenerationService {
    /**
     * Generate audio for a single page, upload it, and return the updated page object.
     */
    async generatePageAudio(
        text: string,
        storyId: string,
        pageIndex: number,
        voiceId: GoogleVoiceCharacter = DEFAULT_VOICE_ID
    ): Promise<{ audioUrl: string; alignment: any } | null> {
        try {
            console.log(`Generating audio for Page ${pageIndex + 1}...`);

            const base64Audio = await synthesizeCharacterSpeech(text, voiceId);
            if (!base64Audio) return null;

            const audioBuffer = Buffer.from(base64Audio, 'base64');
            const fileName = `stories/${storyId}/page-${pageIndex + 1}-${Date.now()}.mp3`;
            const publicUrl = await this.uploadAudio(audioBuffer, fileName);
            if (!publicUrl) return null;

            return {
                audioUrl: publicUrl,
                alignment: {
                    words: this.estimateWordAlignment(text)
                }
            };
        } catch (err: any) {
            console.error(`Generation failed for page ${pageIndex}:`, err.message);
            return null;
        }
    }

    /**
     * Generate audio for an entire story (all pages in parallel).
     * Returns the updated story object with audio data.
     * Optionally updates the database directly if updateDB is true.
     */
    async generateAudioForStory(
        story: GeneratedStory,
        storyId: string,
        updateDB: boolean = true,
        voiceId: GoogleVoiceCharacter = DEFAULT_VOICE_ID
    ): Promise<GeneratedStory> {
        console.log(`Starting audio generation for story: ${story.title} (${story.pages.length} pages)`);

        const processedPages = await Promise.all(
            story.pages.map(async (page, index) => {
                const audioData = await this.generatePageAudio(page.text, storyId, index, voiceId);

                if (audioData) {
                    return {
                        ...page,
                        audioUrl: audioData.audioUrl,
                        audio: {
                            alignment: audioData.alignment,
                            duration: 0
                        }
                    };
                }
                return page;
            })
        );

        const updatedStory = { ...story, pages: processedPages };

        if (updateDB) {
            await this.updateStoryInDB(storyId, updatedStory);
        }

        console.log(`Audio generation complete for ${storyId}`);
        return updatedStory;
    }

    private async uploadAudio(buffer: Buffer, path: string): Promise<string | null> {
        const client = supabaseManager.getClient();

        const { error } = await client.storage
            .from('stories')
            .upload(path, buffer, {
                contentType: 'audio/mpeg',
                upsert: true
            });

        if (error) {
            console.error('Upload failed:', error.message);
            return null;
        }

        const { data: publicUrlData } = client.storage
            .from('stories')
            .getPublicUrl(path);

        return publicUrlData.publicUrl;
    }

    private async updateStoryInDB(storyId: string, story: GeneratedStory) {
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

        if (error) console.error('Failed to update story in DB:', error.message);
    }

    private estimateWordAlignment(text: string) {
        const words = text.split(/\s+/).filter(Boolean);
        let currentTime = 0;

        return words.map((word) => {
            const duration = Math.max(0.1, (word.length / 10) + 0.08);
            const startTimeSeconds = currentTime;
            const endTimeSeconds = currentTime + duration;
            currentTime = endTimeSeconds;
            return { text: word, startTimeSeconds, endTimeSeconds };
        });
    }
}

export const audioGenerationService = new AudioGenerationService();
