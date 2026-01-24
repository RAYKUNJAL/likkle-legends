
// Story Generator
// Generates age-appropriate Caribbean-themed stories with Quality Gates and Registry Integration
// Migration: V2 Architecture

import { contentGenerator } from '../core';
import { CONTENT_CONFIG } from '../config';
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

export interface GeneratedStoryContentKit {
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
}

export class StoryGenerator {
    /**
     * Generate a complete story with all metadata and quality checks
     */
    async generateStory(params: StoryGenerationParams = {}): Promise<GeneratedStoryContentKit> {
        // Defaults
        const ageTrack = params.ageTrack || (Math.random() > 0.5 ? 'mini' : 'big');
        const ageConfig = CONTENT_CONFIG.ageGroups[ageTrack];

        // Resolve Island
        const islandId = params.island || this.getRandomIslandId();
        const islandPack = ISLAND_REGISTRY[islandId] || ISLAND_REGISTRY['TT']; // Fallback to TT if missing

        // Resolve Character
        const characterId = params.characterId || 'roti'; // Default host
        const characterPack = CHARACTER_REGISTRY[characterId];

        const theme = params.theme || contentGenerator.getRandomTheme();

        console.log(`📖 Generating story: ${islandPack.display_name} - ${theme} (${ageTrack}) hosted by ${characterPack.display_name}`);

        // Build the system instructions (Context Injection)
        const systemInstruction = `You are the "Likkle Legends" AI Storyteller.
        
        **YOUR IDENTITY:**
        ${getCharacterContext(characterId)}
        
        **CULTURAL CONTEXT:**
        ${getIslandContext(islandPack.id)}
        
        **TASK:**
        Write a kid-safe, culturally authentic story for ${ageTrack === 'mini' ? 'Preschoolers (3-5)' : 'Young Readers (6-8)'}.
        
        **REQUIREMENTS:**
        1. MORAL: Start with a clear positive lesson.
        2. TONE: Gentle, encouraging, no scary elements.
        3. LANGUAGE: Use English with specific island dialect words from the context provided above.
        4. STRUCTURE: ${ageTrack === 'mini' ? 'Simple repetition, 4 pages' : 'Simple plot, 6 pages'}.
        `;

        // Build the Prompt
        const prompt = `Write a story about "${theme}".
        
        Return the result as a JSON object matching this structure:
        {
            "title": "Story Title",
            "summary": "Brief summary",
            "moral": "The lesson learned",
            "pages": [
                {
                    "text": "The story text for this page. Emphasize rhythm and sensory details.",
                    "imagePrompt": "Description for the illustration. Include Caribbean elements: ${islandPack.symbols.landmarks[0] || 'Beach'}, ${islandPack.symbols.national_bird || 'Birds'}.",
                    "patoisWords": [{"word": "example", "meaning": "definition"}]
                }
            ],
            "parentNote": {
                "whyItHelps": "Educational benefit",
                "offlineFollowup": "Activity to do after reading",
                "whatToSayAfter": "Conversation starter question"
            },
            "culturalElements": ["List specific foods/music/places mentioned"]
        }`;

        // Generate JSON
        const rawContent = await contentGenerator.generateJSON<any>(prompt, {}, {
            systemInstruction,
            temperature: 0.7 // Slightly lower for more coherent stories
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
        const contentKit: GeneratedStoryContentKit = {
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
}

export const storyGenerator = new StoryGenerator();
