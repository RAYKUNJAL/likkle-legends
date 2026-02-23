
import { contentGenerator } from '../core';
import { storyGenerator, GeneratedStory } from '../generators/story-generator';
import { videoGenerator, GeneratedVideoScript } from '../generators/video-generator';
import { printableGenerator, GeneratedPrintable } from '../generators/printable-generator';

export interface CompleteModule {
    id: string;
    title: string;
    island: string;
    theme: string;
    ageGroup: "mini" | "big";
    metadata: {
        createdAt: string;
        educationalGoal: string;
        generatedBy: string;
    };
    content: {
        story: GeneratedStory;
        videoScript: GeneratedVideoScript;
        printable: GeneratedPrintable;
    };
}

export class ModuleManagerAgent {

    /**
     * Build a complete educational module
     */
    async buildCompleteModule(objective: string, ageGroup: "mini" | "big" = "mini"): Promise<CompleteModule> {
        console.log(`🤖 Module Manager initiating build: "${objective}" (${ageGroup})`);

        // 1. Plan the Module
        const plan = await this.planModule(objective, ageGroup);
        console.log(`📋 Plan approved: ${plan.island} - ${plan.theme}`);

        // 2. Execute Generators in Parallel for Speed
        console.log(`🚀 Dispatching sub-agents in parallel...`);

        // We wrap each generator in a robust promise to handle individual failures gracefully if needed, 
        // but for now we want to "Fail Fast" if any critical component breaks, so Promise.all is okay.
        // We add a 'catch' to each to log specifically WHICH one failed before re-throwing.

        const storyPromise = storyGenerator.generateStory({
            island: plan.island,
            theme: plan.theme,
            ageTrack: ageGroup,
            customPrompt: `Focus on: ${plan.storyFocus}`
        }).catch(err => { console.error("❌ Story Agent Failed"); throw err; });

        const videoPromise = videoGenerator.generateScript({
            island: plan.island,
            topic: plan.theme,
            ageTrack: ageGroup,
            durationMinutes: ageGroup === 'mini' ? 3 : 5
        }).catch(err => { console.error("❌ Video Agent Failed"); throw err; });

        const printablePromise = printableGenerator.generatePrintable({
            island: plan.island,
            theme: plan.theme,
            ageTrack: ageGroup,
            type: "worksheet"
        }).catch(err => { console.error("❌ Printable Agent Failed"); throw err; });

        // Await all parallel requests
        const [story, video, printable] = await Promise.all([
            storyPromise,
            videoPromise,
            printablePromise
        ]);

        console.log(`✅ All assets generated successfully!`);

        // 3. Assemble Module
        return {
            id: `mod_${Date.now()}`,
            title: story.title, // Use story title as main module title for now
            island: plan.island,
            theme: plan.theme,
            ageGroup: ageGroup,
            metadata: {
                createdAt: new Date().toISOString(),
                educationalGoal: plan.educationalGoal,
                generatedBy: "Legend AI Module Manager"
            },
            content: {
                story,
                videoScript: video,
                printable
            }
        };
    }

    /**
     * Create a cohesive plan for the module
     */
    private async planModule(objective: string, ageGroup: string): Promise<{
        island: string;
        theme: string;
        storyFocus: string;
        educationalGoal: string;
    }> {
        const systemInstruction = `You are a curriculum planner for "Likkle Legends". 
        Analyze the user's objective and create a cohesive plan for a learning module.
        Select the most appropriate Caribbean island conform to the objective if none is specified.`;

        const prompt = `Objective: "${objective}"
        Target Age: ${ageGroup}
        
        Return a JSON plan:
        {
            "island": "Name of Island (must be one of: Jamaica, Trinidad and Tobago, Barbados, Saint Lucia, Grenada, Antigua and Barbuda, Dominica, Saint Vincent and the Grenadines)",
            "theme": "Main theme (e.g. Carnvial, Sea Life, Food)",
            "storyFocus": "Specific angle for the story",
            "educationalGoal": "Overarching learning goal for this module"
        }`;

        return await contentGenerator.generateJSON(prompt, {}, { systemInstruction });
    }
}

export const moduleManagerAgent = new ModuleManagerAgent();
