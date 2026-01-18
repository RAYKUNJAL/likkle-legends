// Song & Rhyme Generator
// Generates Caribbean-style nursery rhymes and educational songs

import { contentGenerator } from '../core';
import { CONTENT_CONFIG } from '../config';

export interface GeneratedSong {
    title: string;
    artist: string;
    description: string;
    lyrics: string;
    category: 'nursery' | 'educational' | 'cultural';
    islandOrigin: string;
    ageTrack: 'mini' | 'big' | 'all';
    tierRequired: string;
    durationSeconds: number;
    thumbnailPrompt: string;
    educationalValue: string;
}

export interface SongGenerationParams {
    category?: 'nursery' | 'educational' | 'cultural';
    island?: string;
    topic?: string;
    ageTrack?: 'mini' | 'big' | 'all';
}

export class SongGenerator {
    /**
     * Generate a Caribbean song or nursery rhyme
     */
    async generateSong(params: SongGenerationParams = {}): Promise<GeneratedSong> {
        const category = params.category || this.getRandomCategory();
        const island = params.island || contentGenerator.getRandomIsland();
        const ageTrack = params.ageTrack || 'all';
        const topic = params.topic || this.getRandomTopic(category);

        const prompt = this.buildSongPrompt({ category, island, topic, ageTrack });

        const songData = await contentGenerator.generateJSON<any>(
            prompt,
            this.getSongSchema(),
            {
                systemInstruction: `You are an expert in Caribbean music and children's songs. Create engaging, culturally authentic songs that incorporate Caribbean musical styles (calypso, reggae, soca). Songs should be educational, fun, and age-appropriate.`,
                temperature: 0.95, // More creative for songs
            }
        );

        return {
            title: songData.title,
            artist: songData.artist || 'Likkle Legends',
            description: songData.description,
            lyrics: songData.lyrics,
            category,
            islandOrigin: island,
            ageTrack,
            tierRequired: ageTrack === 'all' ? 'starter_mailer' : 'legends_plus',
            durationSeconds: songData.estimated_duration || 120,
            thumbnailPrompt: songData.thumbnailPrompt,
            educationalValue: songData.educationalValue,
        };
    }

    /**
     * Build song generation prompt
     */
    private buildSongPrompt(params: {
        category: string;
        island: string;
        topic: string;
        ageTrack: string;
    }): string {
        const { category, island, topic, ageTrack } = params;

        const categoryInstructions = {
            nursery: 'Create a traditional nursery rhyme with Caribbean flavor. Include repetition, simple rhymes, and singable melody. Focus on counting, colors, animals, or daily activities.',
            educational: 'Create an educational song that teaches a specific concept (alphabet, numbers, shapes, manners). Make learning fun through rhythm and rhyme.',
            cultural: 'Create a song about Caribbean traditions, festivals, food, or history. Teach children about their heritage through music.',
        };

        return `Create a Caribbean children's song with the following requirements:

**SONG PARAMETERS:**
- Category: ${category}
- Island Influence: ${island} (incorporate ${this.getMusicalStyle(island)} style)
- Topic: ${topic}
- Age Group: ${ageTrack}

**MUSICAL STYLE:**
${categoryInstructions[category as keyof typeof categoryInstructions]}

**STRUCTURE:**
- Include a catchy chorus that repeats
- 3-4 verses
- ${ageTrack === 'mini' ? 'Very simple, repetitive lyrics' : 'Can include more variety'}
- Rhyme scheme: AABB or ABAB
- Include rhythm markers [CLAP], [SNAP], [STOMP] where appropriate

**CARIBBEAN ELEMENTS:**
- Use Caribbean musical rhythms and patterns
- Include positive messages about culture, family, community
- Reference Caribbean landscapes, activities, or traditions
- Can include 1-2 simple Patois words with translations

**LYRICS GUIDELINES:**
- Make it singable and memorable
- Include actions kids can do while singing
- Keep vocabulary appropriate for age group
- Total length: ${ageTrack === 'mini' ? '8-12' : '12-20'} lines

**THUMBNAIL DESCRIPTION:**
- Provide a detailed image prompt for the song's cover art
- Should be vibrant, musical, Caribbean-themed
- Include musical instruments, dancing children, tropical setting

Return in the specified JSON format.`;
    }

    /**
     * Get musical style for island
     */
    private getMusicalStyle(island: string): string {
        const styles: Record<string, string> = {
            'Jamaica': 'reggae and ska',
            'Trinidad and Tobago': 'calypso and soca',
            'Barbados': 'spouge',
            'Saint Lucia': 'zouk',
            'Grenada': 'calypso',
            'default': 'Caribbean rhythms',
        };
        return styles[island] || styles.default;
    }

    /**
     * Get song schema
     */
    private getSongSchema() {
        return {
            title: "String - Catchy song title",
            artist: "String - Artist name (default: Likkle Legends)",
            description: "String - What the song is about",
            lyrics: "String - Full lyrics with [Verse], [Chorus] markers",
            educationalValue: "String - What children learn from this song",
            thumbnailPrompt: "String - Detailed image prompt for cover art",
            estimated_duration: "Number - Estimated seconds"
        };
    }

    /**
     * Get random category
     */
    private getRandomCategory(): 'nursery' | 'educational' | 'cultural' {
        const categories: Array<'nursery' | 'educational' | 'cultural'> = ['nursery', 'educational', 'cultural'];
        return categories[Math.floor(Math.random() * categories.length)];
    }

    /**
     * Get random topic based on category
     */
    private getRandomTopic(category: string): string {
        const topics: Record<string, string[]> = {
            nursery: ['counting', 'colors', 'animals', 'shapes', 'daily routine', 'weather'],
            educational: ['alphabet', 'numbers 1-10', 'days of week', 'manners', 'sharing', 'hygiene'],
            cultural: ['carnival', 'market day', 'cooking', 'fishing', 'storytelling', 'family traditions'],
        };
        const options = topics[category] || topics.nursery;
        return options[Math.floor(Math.random() * options.length)];
    }

    /**
     * Generate multiple songs in batch
     */
    async generateBatch(count: number, params: SongGenerationParams = {}): Promise<GeneratedSong[]> {
        const songs: GeneratedSong[] = [];

        for (let i = 0; i < count; i++) {
            try {
                console.log(`Generating song ${i + 1}/${count}...`);
                const song = await this.generateSong(params);
                songs.push(song);

                // Rate limiting delay
                if (i < count - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error(`Failed to generate song ${i + 1}:`, error);
            }
        }

        return songs;
    }
}

export const songGenerator = new SongGenerator();
