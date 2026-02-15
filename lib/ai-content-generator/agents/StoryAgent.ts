
import { contentGenerator } from '../core';
import { generateSpeechWithMetadata } from '../../elevenlabs';
import { supabaseAdmin } from '../../supabase-client';

export interface StoryPage {
    text: string;
    imagePrompt: string;
    audioUrl?: string;
    alignments?: any;
}

export interface StoryBook {
    title: string;
    summary: string;
    pages: StoryPage[];
    moral: string;
    characterId: string;
    islandCode: string;
}

export class StoryAgent {
    async createInterativeStory(params: {
        childName: string;
        island: string;
        guide: 'tanty' | 'roti';
        topic?: string;
        dialectLevel?: 'standard' | 'local';
    }): Promise<StoryBook> {
        const { getCharacterContext } = await import('../../registries/characters');
        const dialectLevel = params.dialectLevel || 'standard';

        console.log(`🤖 [StoryAgent] Designing ${dialectLevel} ${params.island} story for ${params.childName}...`);

        // 1. Generate Story Text via Gemini
        const storyData = await this.generateStoryStructure({
            ...params,
            dialectLevel,
            characterContext: getCharacterContext(params.guide, params.island, dialectLevel)
        });

        // 2. Synthesize Voice for each page
        const pagesWithAudio = await Promise.all(storyData.pages.map(async (page: any, index: number) => {
            try {
                const speechData = await generateSpeechWithMetadata(page.text, {
                    voice: params.guide === 'tanty' ? 'tanty_spice' : 'roti'
                } as any);

                if (!speechData) return page;

                // Upload audio to Supabase Storage ('storybooks' bucket exists)
                const fileName = `audio/${Date.now()}-page-${index}.mp3`;
                const audioBuffer = Buffer.from(speechData.audioUrl.split(',')[1], 'base64');

                const { data, error } = await supabaseAdmin.storage
                    .from('storybooks')
                    .upload(fileName, audioBuffer, {
                        contentType: 'audio/mpeg',
                        upsert: true
                    });

                if (error) throw error;

                const { data: urlData } = supabaseAdmin.storage
                    .from('storybooks')
                    .getPublicUrl(fileName);

                return {
                    ...page,
                    audioUrl: urlData.publicUrl,
                    words: speechData.words
                };
            } catch (err) {
                console.error(`❌ Failed to generate voice for page ${index}:`, err);
                return page;
            }
        }));

        const finalStory: StoryBook = {
            title: storyData.title,
            summary: storyData.summary,
            pages: pagesWithAudio,
            moral: storyData.moral,
            characterId: params.guide,
            islandCode: params.island
        };

        // 3. Persist to Database
        try {
            await this.saveToDatabase(finalStory);
        } catch (dbErr) {
            console.error(`⚠️ [StoryAgent] Database save failed (story still usable):`, dbErr);
        }

        return finalStory;
    }

    private async saveToDatabase(story: StoryBook) {
        console.log(`💾 [StoryAgent] Persisting "${story.title}" to content_items...`);

        const slug = story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        // Insert into content_items (actual schema: id, content_type, slug, title, island_code, track_tags, has_dialect_toggle, published, created_at)
        const { data, error } = await supabaseAdmin
            .from('content_items')
            .upsert({
                content_type: 'story',
                slug,
                title: story.title,
                island_code: story.islandCode,
                track_tags: [story.moral, story.characterId],
                has_dialect_toggle: false,
                published: false
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (error) throw error;
        console.log(`✅ [StoryAgent] content_items row created: ${data.id}`);

        // Insert localization with pages JSON in body_text
        // (actual schema: id, content_item_id, dialect_type, language_code, display_title, body_text, audio_url, created_at)
        const pagesJson = JSON.stringify({
            summary: story.summary,
            moral: story.moral,
            character_id: story.characterId,
            pages: story.pages
        });

        const { error: locError } = await supabaseAdmin
            .from('content_localizations')
            .upsert({
                content_item_id: data.id,
                dialect_type: 'standard_english',
                language_code: 'en',
                display_title: story.title,
                body_text: pagesJson,
                audio_url: story.pages[0]?.audioUrl || null
            }, { onConflict: 'content_item_id,dialect_type,language_code' });

        if (locError) throw locError;
        console.log(`✅ [StoryAgent] content_localizations row created`);
    }

    private async generateStoryStructure(params: any): Promise<any> {
        const systemInstruction = `
        ${params.characterContext}
        
        TASK: You are a Caribbean Storyteller. Generate a 5-page children's story for ${params.childName}.
        LOCATION: ${params.island}.
        DIALECT LEVEL: ${params.dialectLevel}.
        
        Return strictly valid JSON matching the schema.
        `;

        const schema = {
            type: "object",
            properties: {
                title: { type: "string" },
                summary: { type: "string" },
                moral: { type: "string" },
                pages: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            text: { type: "string" },
                            imagePrompt: { type: "string" }
                        }
                    }
                }
            },
            required: ["title", "summary", "moral", "pages"]
        };

        return await contentGenerator.generateJSON(
            `Write a story about: ${params.topic || 'An adventure in the Caribbean'}`,
            schema,
            { systemInstruction }
        );
    }
}

export const storyAgent = new StoryAgent();
