
import { storyGenerator, GeneratedStory } from '../generators/story-generator';
import { ISLAND_REGISTRY } from '../../registries/islands';

export interface HeritageStoryRequest {
    childName: string;
    heritageCode: string;
    ageGroup?: 'mini' | 'big';
}

export class AnansiAgent {
    public name = "Anansi";
    public role = "Chief Storyteller";

    /**
     * Generates a personalized Heritage DNA Story
     */
    async weaveHeritageStory(request: HeritageStoryRequest): Promise<GeneratedStory> {
        const island = ISLAND_REGISTRY[request.heritageCode];
        const islandName = island ? island.display_name : "the Caribbean";

        console.log(`🕷️ Anansi is weaving a story for ${request.childName} from ${islandName}...`);

        const prompt = `
            Write a deeply personal story for a child named ${request.childName} who is discovering their heritage from ${islandName}.
            The story should be about ${request.childName} finding a magical object that teleports them to ${islandName} to meet their ancestors.
            Include specific cultural details about ${islandName} (food, music, festivals).
            Make ${request.childName} feel proud of their roots.
        `;

        return await storyGenerator.generateStory({
            island: request.heritageCode !== 'OTHER' ? request.heritageCode : undefined,
            ageTrack: request.ageGroup || 'mini',
            customPrompt: prompt,
            theme: `Discovering ${islandName} Heritage`
        });
    }

    /**
     * Generates (or retrieves) the Digital Activity Super-Pack
     */
    async fetchDigitalActivityPack(childName: string): Promise<any> {
        console.log(`🕷️ Anansi is fetching the activity pack for ${childName}...`);

        // In a real app, this might generate a PDF on the fly or fetch a presigned URL.
        // For now, we return a structured object that the UI can render.
        return {
            title: `${childName}'s Island Activity Pack`,
            downloadUrl: "/downloads/activity-pack-v1.pdf", // Placeholder
            items: [
                "Coloring Page: The Moko Jumbie",
                "Word Search: Island Fruits",
                "Maze: Help Anansi find his pot",
                "Connect the Dots: Steelpan"
            ]
        };
    }
}

export const anansi = new AnansiAgent();
