
// Story Generator
// Generates age-appropriate Caribbean-themed stories with Quality Gates and Registry Integration
// Migration: V2 Architecture

import { contentGenerator } from '../core';
import { CONTENT_CONFIG, IMAGE_STYLE } from '../config';
import { CHARACTER_REGISTRY, getCharacterContext } from '../../registries/characters';
import { ISLAND_REGISTRY, getIslandContext } from '../../registries/islands';
import { QualityGatesService, QAReport } from '../../services/quality-gates';

export interface StoryPage {
    pageNumber: number;
    text: string;
    imagePrompt: string;
    patoisWords?: Array<{ word: string; meaning: string }>;
}

export interface ParentNote {
    whyItHelps: string;
    offlineFollowup: string;
    whatToSayAfter: string;
}

export interface GeneratedStory {
    title: string;
    summary: string;
    pages: StoryPage[];
    moral: string;
    parentNote: ParentNote;
    metadata: {
        ageTrack: 'mini' | 'big';
        islandTheme: string;
        readingTimeMinutes: number;
        difficultyLevel: number;
        tierRequired: string;
        patoisWords: Array<{ word: string; meaning: string }>;
        characterId: string;
        culturalElements: string[];
    };
    qaReport: QAReport;
}

export interface StoryGenerationParams {
    ageTrack?: 'mini' | 'big';
    island?: string; // Island ID (e.g., 'TT', 'JM')
    theme?: string;
    characterId?: string;
    customPrompt?: string;
    model?: string;
}

export class StoryGenerator {
    /**
     * Generate a complete story with all metadata and quality checks
     */
    async generateStory(params: StoryGenerationParams = {}): Promise<GeneratedStory> {
        // Defaults
        const ageTrack = params.ageTrack || (Math.random() > 0.5 ? 'mini' : 'big');
        const ageConfig = CONTENT_CONFIG.ageGroups[ageTrack];

        // Resolve Island
        const islandId = params.island || this.getRandomIslandId();
        const islandPack = ISLAND_REGISTRY[islandId] || ISLAND_REGISTRY['JM'] || Object.values(ISLAND_REGISTRY)[0];

        // Resolve Character
        const characterId = params.characterId || 'roti'; // Default host
        const characterPack = CHARACTER_REGISTRY[characterId] || CHARACTER_REGISTRY['roti'] || Object.values(CHARACTER_REGISTRY)[0];

        const theme = params.theme || contentGenerator.getRandomTheme();

        console.log(`📖 Generating world-class story: ${islandPack.display_name} - ${theme} (${ageTrack}) hosted by ${characterPack.display_name}`);

        // Build the system instructions (Context Injection)
        const systemInstruction = `You are the "Likkle Legends" World-Class AI Storyteller.
        
        **YOUR IDENTITY:**
        ${getCharacterContext(characterId)}
        
        **CULTURAL CONTEXT:**
        ${getIslandContext(islandPack.id)}
        
        **TARGET AGE GROUP: ${ageTrack}**
        Pedagogy: ${ageConfig.pedagogy}
        
        **WORLD-CLASS STANDARDS:**
        1. MORAL: Start with a clear positive Caribbean value.
        2. TONE: Gentle, encouraging, and magical.
        3. LITERACY BUILDING: **IMPORTANT** Use **BOLD** (Markdown **word**) for exactly 2-3 key educational words, new Patois words, or important objects. Do not bold entire sentences.
        4. TEXT QUALITY: Do not use bullet points, emojis, or special symbols (like #, >, or @) inside the story text. Keep it pure narrative. Ensure all dialogue is clearly quoted with "quotation marks".
        5. LANGUAGE: Culturally authentic English with specific island dialect words.
        6. STRUCTURE: ${ageTrack === 'mini' ? 'Engaging repetition with a full island adventure, 6-8 pages' : 'Highly detailed and immersive exploration or adventure plot, 10-12 pages'}.
        `;

        // Build the Prompt
        const coreRequest = params.customPrompt
            ? params.customPrompt
            : `Write a world-class children's story about "${theme}" set in ${islandPack.display_name}.`;

        const prompt = `${coreRequest}
        
        **JSON STRUCTURE:**
        {
            "title": "Story Title",
            "summary": "1-sentence summary",
            "moral": "The lesson",
            "pages": [
                {
                    "text": "Page text. Use **bold** for at least 2-3 key words per page to help kids read.",
                    "imagePrompt": "Masterpiece illustration prompt: ${IMAGE_STYLE.base}",
                    "patoisWords": [{"word": "word", "meaning": "meaning"}]
                }
            ],
            "parentNote": {
                "whyItHelps": "Benefits",
                "offlineFollowup": "Activity",
                "whatToSayAfter": "Question"
            },
            "culturalElements": ["List foods/places/traditions"]
        }`;

        // Define Strict Schema for Gemini
        const storySchema = {
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
                            imagePrompt: { type: "string" },
                            patoisWords: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        word: { type: "string" },
                                        meaning: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                },
                parentNote: {
                    type: "object",
                    properties: {
                        whyItHelps: { type: "string" },
                        offlineFollowup: { type: "string" },
                        whatToSayAfter: { type: "string" }
                    }
                },
                culturalElements: {
                    type: "array",
                    items: { type: "string" }
                }
            },
            required: ["title", "summary", "moral", "pages", "parentNote", "culturalElements"]
        };

        // Generate JSON
        const rawContent = await contentGenerator.generateJSON<any>(prompt, storySchema, {
            systemInstruction,
            temperature: 0.7, // Slightly lower for more coherent stories
            model: params.model,
        });

        // Run Quality Gates
        const qaReport = await QualityGatesService.runGates(
            rawContent,
            islandPack,
            characterPack.voice_bible,
            {} // Schema check logic handled inside generateJSON mostly, but strict schema could be passed here
        );

        if (!qaReport.safety_passed) {
            throw new Error(`Story failed Safety Gate: ${qaReport.flags.join(", ")}`);
        }

        // Construct Final Content Kit
        const contentKit: GeneratedStory = {
            title: rawContent.title,
            summary: rawContent.summary,
            pages: rawContent.pages.map((p: any, i: number) => ({
                pageNumber: i + 1,
                text: p.text,
                imagePrompt: p.imagePrompt,
                patoisWords: p.patoisWords
            })),
            moral: rawContent.moral,
            parentNote: rawContent.parentNote,
            metadata: {
                ageTrack,
                islandTheme: islandPack.display_name,
                readingTimeMinutes: ageConfig.readingTime,
                difficultyLevel: ageConfig.difficulty,
                tierRequired: ageConfig.tier,
                patoisWords: rawContent.pages.flatMap((p: any) => p.patoisWords || []),
                characterId: characterId,
                culturalElements: rawContent.culturalElements || []
            },
            qaReport
        };

        return contentKit;
    }

    private getRandomIslandId(): string {
        const keys = Object.keys(ISLAND_REGISTRY);
        return keys[Math.floor(Math.random() * keys.length)];
    }

    /**
     * Generate multiple stories in batch
     */
    async generateBatch(count: number, params: StoryGenerationParams = {}): Promise<GeneratedStory[]> {
        const stories: GeneratedStory[] = [];

        for (let i = 0; i < count; i++) {
            console.log(`Generating story ${i + 1}/${count}...`);
            const story = await this.generateStory(params);
            stories.push(story);

            // Rate limiting delay
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        return stories;
    }
}

export const storyGenerator = new StoryGenerator();
