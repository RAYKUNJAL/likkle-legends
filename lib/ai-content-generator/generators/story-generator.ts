// Story Generator
// Generates age-appropriate Caribbean-themed stories

import { contentGenerator } from '../core';
import { CONTENT_CONFIG, PATOIS_WORDS, STORY_THEMES } from '../config';

export interface StoryPage {
    pageNumber: number;
    text: string;
    imagePrompt: string;
    patoisWords?: Array<{ word: string; meaning: string }>;
}

export interface GeneratedStory {
    title: string;
    summary: string;
    pages: StoryPage[];
    ageTrack: 'mini' | 'big';
    islandTheme: string;
    readingTimeMinutes: number;
    difficultyLevel: number;
    tierRequired: string;
    patoisWords: Array<{ word: string; meaning: string; pronunciation: string }>;
    characterId?: string;
    culturalElements: string[];
}

export interface StoryGenerationParams {
    ageTrack?: 'mini' | 'big';
    island?: string;
    theme?: string;
    characterName?: string;
    customPrompt?: string;
}

export class StoryGenerator {
    /**
     * Generate a complete story with all metadata
     */
    async generateStory(params: StoryGenerationParams = {}): Promise<GeneratedStory> {
        const ageTrack = params.ageTrack || (Math.random() > 0.5 ? 'mini' : 'big');
        const ageConfig = CONTENT_CONFIG.ageGroups[ageTrack];
        const island = params.island || contentGenerator.getRandomIsland();
        const theme = params.theme || contentGenerator.getRandomTheme();
        const characterName = params.characterName || contentGenerator.getRandomCharacter();

        // Get Patois words for the island
        const islandPatoisWords = PATOIS_WORDS[island as keyof typeof PATOIS_WORDS] || PATOIS_WORDS.Jamaica;
        const selectedPatoisWords = this.selectRandomPatoisWords(islandPatoisWords, ageTrack === 'mini' ? 2 : 4);

        // Build the story generation prompt
        const prompt = this.buildStoryPrompt({
            ageTrack,
            ageConfig,
            island,
            theme,
            characterName,
            patoisWords: selectedPatoisWords,
            customPrompt: params.customPrompt,
        });

        // Generate story using Gemini
        const storyData = await contentGenerator.generateJSON<any>(
            prompt,
            this.getStorySchema(),
            {
                systemInstruction: `You are an expert children's book author specializing in Caribbean cultural stories. Create engaging, educational, and culturally authentic stories for children aged ${ageConfig.min}-${ageConfig.max}. Always include positive values, respect for Caribbean culture, and age-appropriate language.`,
                temperature: 0.9,
            }
        );

        // Validate content
        const validation = contentGenerator.validateContent(JSON.stringify(storyData));
        if (!validation.safe) {
            console.warn('Story validation issues:', validation.issues);
            // Optionally retry or modify
        }

        // Format the response
        const story: GeneratedStory = {
            title: storyData.title,
            summary: storyData.summary,
            pages: storyData.pages.map((page: any, index: number) => ({
                pageNumber: index + 1,
                text: page.text,
                imagePrompt: page.imagePrompt,
                patoisWords: page.patoisWords,
            })),
            ageTrack,
            islandTheme: island,
            readingTimeMinutes: ageConfig.readingTime,
            difficultyLevel: ageConfig.difficulty,
            tierRequired: ageConfig.tier,
            patoisWords: selectedPatoisWords,
            characterId: characterName,
            culturalElements: storyData.culturalElements || [],
        };

        return story;
    }

    /**
     * Build the story generation prompt
     */
    private buildStoryPrompt(params: {
        ageTrack: 'mini' | 'big';
        ageConfig: any;
        island: string;
        theme: string;
        characterName: string;
        patoisWords: any[];
        customPrompt?: string;
    }): string {
        const { ageTrack, ageConfig, island, theme, characterName, patoisWords, customPrompt } = params;

        return `Generate an engaging Caribbean children's story with the following requirements:

**STORY PARAMETERS:**
- Age Group: ${ageTrack} (${ageConfig.min}-${ageConfig.max} years old)
- Word Count: Approximately ${ageConfig.wordCount} words
- Island Setting: ${island}
- Theme: ${theme}
- Main Character: ${characterName}
- Reading Level: ${ageConfig.difficulty}/5 difficulty

**CULTURAL REQUIREMENTS:**
- Incorporate ${patoisWords.length} Patois/Creole words: ${patoisWords.map(w => `"${w.word}" (${w.meaning})`).join(', ')}
- Include authentic Caribbean cultural elements (food, music, traditions, values)
- Emphasize positive values: respect for elders, kindness, community, family
- Reflect Caribbean landscapes, colors, and atmosphere

**STORY STRUCTURE:**
- Create ${ageTrack === 'mini' ? '4-5' : '6-8'} pages
- Each page should be ${ageTrack === 'mini' ? '2-3' : '4-5'} sentences
- Include a clear beginning, middle, and end
- Have a positive lesson or message
- End with warmth and encouragement

**LANGUAGE GUIDELINES:**
${ageTrack === 'mini'
                ? '- Use simple, repetitive sentences\n- Focus on concrete objects and actions\n- Include sounds and rhythms\n- Vocabulary should be basic and familiar'
                : '- Use varied sentence structure\n- Include some descriptive language\n- Can have a simple subplot\n- Vocabulary can be slightly more advanced with context clues'
            }

**PATOIS INTEGRATION:**
- Weave Patois words naturally into the story
- Always follow with context clues or explanations
- Mark Patois words with [square brackets] for glossary

**IMAGE PROMPTS:**
- For each page, provide a detailed illustration prompt
- Describe the scene, character positions, setting details, and mood
- Keep descriptions child-friendly and culturally authentic
- Mention specific Caribbean elements (palm trees, colorful houses, tropical flowers, etc.)

${customPrompt ? `\n**ADDITIONAL INSTRUCTIONS:**\n${customPrompt}` : ''}

Return the story in the specified JSON format.`;
    }

    /**
     * Get the JSON schema for story response
     */
    private getStorySchema() {
        return {
            title: "String - Catchy, culturally themed title",
            summary: "String - 2-3 sentence summary of the story",
            pages: [
                {
                    text: "String - Page text with [patois words] in brackets",
                    imagePrompt: "String - Detailed prompt for illustration",
                    patoisWords: [
                        { word: "String", meaning: "String" }
                    ]
                }
            ],
            culturalElements: ["Array of strings - Cultural elements featured"],
        };
    }

    /**
     * Select random Patois words for the story
     */
    private selectRandomPatoisWords(words: any[], count: number): any[] {
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, words.length));
    }

    /**
     * Generate multiple stories in batch
     */
    async generateBatch(count: number, params: StoryGenerationParams = {}): Promise<GeneratedStory[]> {
        const stories: GeneratedStory[] = [];

        for (let i = 0; i < count; i++) {
            try {
                console.log(`Generating story ${i + 1}/${count}...`);
                const story = await this.generateStory(params);
                stories.push(story);

                // Add delay to avoid rate limiting
                if (i < count - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error(`Failed to generate story ${i + 1}:`, error);
            }
        }

        return stories;
    }
}

// Export singleton instance
export const storyGenerator = new StoryGenerator();
