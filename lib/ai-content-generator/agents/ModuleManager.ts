// Module Manager Agent
// Orchestrates multiple generators to build a cohesive educational module

import { storyGenerator } from '../generators/story-generator';
import { songGenerator } from '../generators/song-generator';
import { printableGenerator } from '../generators/printable-generator';
import { videoGenerator } from '../generators/video-generator';
import { contentGenerator } from '../core';

export interface EducationalModule {
    id: string;
    title: string;
    theme: string;
    island: string;
    ageGroup: 'mini' | 'big';
    content: {
        story: any;
        song: any;
        printable: any;
        videoScript: any;
    };
    metadata: {
        educationalGoal: string;
        curriculumTags: string[];
    };
}

export class ModuleManagerAgent {
    /**
     * Create a full educational module from a single topic or prompt
     */
    async buildCompleteModule(userObjective: string, ageGroup: 'mini' | 'big' = 'mini'): Promise<EducationalModule> {
        console.log(`🤖 [ModuleManagerAgent] Starting build for: "${userObjective}"...`);

        // 1. Analyze the objective to pick a suitable island and refine the theme
        const analysis = await contentGenerator.generateJSON<any>(
            `Analyze this educational objective: "${userObjective}". 
            Pick the most relevant Caribbean island and a refined theme title.
            Return JSON: { "island": string, "theme": string, "educationalGoal": string, "tags": string[] }`,
            { island: "string", theme: "string", educationalGoal: "string", tags: ["string"] }
        );

        const { island, theme, educationalGoal, tags } = analysis;

        // 2. Run generators in parallel (or sequence for simpler debugging)
        console.log(`🤖 [ModuleManagerAgent] Generating 4-part content suite for ${island}...`);

        const [story, song, printable, videoScript] = await Promise.all([
            storyGenerator.generateStory({ island, theme, ageTrack: ageGroup, customPrompt: `Focus on: ${userObjective}` }),
            songGenerator.generateSong({ island, topic: theme, ageTrack: ageGroup }),
            printableGenerator.generatePrintable({ island, theme, ageTrack: ageGroup }),
            videoGenerator.generateScript({ island, topic: theme, ageTrack: ageGroup })
        ]);

        console.log(`✅ [ModuleManagerAgent] Module "${theme}" build complete.`);

        return {
            id: `module_${Date.now()}`,
            title: theme,
            theme,
            island,
            ageGroup,
            content: {
                story,
                song,
                printable,
                videoScript
            },
            metadata: {
                educationalGoal,
                curriculumTags: tags
            }
        };
    }
}

export const moduleManagerAgent = new ModuleManagerAgent();
