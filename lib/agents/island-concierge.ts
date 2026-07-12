// Island Concierge Agent Framework
// Generates curated, island-specific lessons and content for each child
// Uses Gemini (cheap, already configured) to keep costs low at scale

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ISLAND_REGISTRY, IslandPack } from '@/lib/registries/islands';

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const MODEL_NAME = 'gemini-2.0-flash-exp'; // Cheap, fast, good enough for kids content

export interface ConciergeLesson {
    island_code: string;
    island_name: string;
    lesson_id: string;
    title: string;
    subject: 'literacy' | 'math' | 'culture' | 'geography' | 'music' | 'folklore' | 'food' | 'language';
    age_track: 'mini' | 'big'; // 3-5 or 6-9
    duration_minutes: number;
    overview: string;
    objectives: string[];
    content: {
        story?: string;
        activities: string[];
        discussion_questions: string[];
        fun_facts: string[];
    };
    vocabulary: { word: string; meaning: string; island_context: string }[];
    character_host: 'roti' | 'tanty_spice' | 'dilly_doubles' | 'mango_moko';
    created_at: string;
    model_used: string;
}

export interface ConciergeCurriculum {
    island_code: string;
    island_name: string;
    child_name: string;
    age_track: 'mini' | 'big';
    lessons: ConciergeLesson[];
    generated_at: string;
}

class IslandConciergeAgent {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor() {
        if (GEMINI_KEY) {
            this.genAI = new GoogleGenerativeAI(GEMINI_KEY);
            this.model = this.genAI.getGenerativeModel({
                model: MODEL_NAME,
                systemInstruction: this.getSystemInstruction(),
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4096,
                },
            });
        }
    }

    isAvailable(): boolean {
        return this.model !== null;
    }

    private getSystemInstruction(): string {
        return `You are the Island Concierge, an AI educational content creator for Likkle Legends, a Caribbean learning platform for kids ages 3-9.

Your role is to create engaging, culturally authentic, age-appropriate lessons that celebrate Caribbean heritage.

RULES:
- Content MUST be safe for children (COPPA compliant)
- Use simple, warm language appropriate for the age group
- Incorporate island-specific vocabulary, foods, festivals, and traditions
- Make learning feel like an adventure, not a classroom
- Each lesson should connect to a Likkle Legends character (R.O.T.I., Tanty Spice, Dilly Doubles, Mango Moko)
- Include discussion questions for parents to ask
- Keep stories under 500 words for mini (3-5) and under 800 words for big (6-9)
- No external links, no personal data requests, no scary content
- Celebrate diversity — every island is special and worthy of pride`;
    }

    /**
     * Generate a full week's curriculum (5 lessons) for a specific island
     */
    async generateWeeklyCurriculum(
        islandCode: string,
        childName: string,
        ageTrack: 'mini' | 'big',
        characterHost: 'roti' | 'tanty_spice' | 'dilly_doubles' | 'mango_moko' = 'roti'
    ): Promise<ConciergeCurriculum> {
        const island = ISLAND_REGISTRY[islandCode];
        if (!island) {
            throw new Error(`Island ${islandCode} not found in registry`);
        }

        if (!this.model) {
            // Fallback: return a basic curriculum from registry data
            return this.getFallbackCurriculum(island, childName, ageTrack, characterHost);
        }

        const subjects: ConciergeLesson['subject'][] = ['literacy', 'math', 'culture', 'music', 'folklore'];
        const lessons: ConciergeLesson[] = [];

        for (const subject of subjects) {
            const lesson = await this.generateLesson(island, subject, childName, ageTrack, characterHost);
            lessons.push(lesson);
        }

        return {
            island_code: islandCode,
            island_name: island.display_name,
            child_name: childName,
            age_track: ageTrack,
            lessons,
            generated_at: new Date().toISOString(),
        };
    }

    /**
     * Generate a single island-specific lesson
     */
    async generateLesson(
        island: IslandPack,
        subject: ConciergeLesson['subject'],
        childName: string,
        ageTrack: 'mini' | 'big',
        characterHost: 'roti' | 'tanty_spice' | 'dilly_doubles' | 'mango_moko'
    ): Promise<ConciergeLesson> {
        const prompt = this.buildPrompt(island, subject, childName, ageTrack, characterHost);

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();
            return this.parseLessonResponse(text, island, subject, childName, ageTrack, characterHost);
        } catch (err) {
            console.error(`[CONCIERGE] Failed to generate ${subject} lesson for ${island.display_name}:`, err);
            return this.getFallbackLesson(island, subject, childName, ageTrack, characterHost);
        }
    }

    private buildPrompt(
        island: IslandPack,
        subject: ConciergeLesson['subject'],
        childName: string,
        ageTrack: 'mini' | 'big',
        characterHost: string
    ): string {
        const ageRange = ageTrack === 'mini' ? '3-5 years old' : '6-9 years old';
        const charMap: Record<string, string> = {
            roti: 'R.O.T.I. (a friendly robot learning buddy)',
            tanty_spice: 'Tanty Spice (a warm Caribbean auntie)',
            dilly_doubles: 'Dilly Doubles (a music-loving joyful character)',
            mango_moko: 'Mango Moko (a geography-loving guardian)',
        };

        return `Create a ${subject} lesson for ${childName}, age ${ageRange}, about ${island.display_name}.

Island data:
- Values: ${island.cultural_traits.values.join(', ')}
- Festivals: ${island.cultural_traits.festivals.join(', ')}
- Music: ${island.cultural_traits.music_styles.join(', ')}
- Foods: ${island.cultural_traits.foods.join(', ')}
- Landmarks: ${island.symbols.landmarks.join(', ')}
- Dialect words: ${island.dialect.vocabulary.map(v => `${v.word} (${v.meaning})`).join(', ')}
- Safe topics: ${island.safe_topics.join(', ')}

Host character: ${charMap[characterHost] || charMap.roti}

Return JSON ONLY (no markdown, no explanation):
{
    "title": "Catchy, fun lesson title",
    "overview": "2-3 sentence description of what the child will learn",
    "objectives": ["Learning goal 1", "Learning goal 2", "Learning goal 3"],
    "content": {
        "story": "A short story (max ${ageTrack === 'mini' ? '500' : '800'} words) featuring the host character exploring ${island.display_name}. Include the child's name ${childName}. Use at least 2 dialect words.",
        "activities": ["Activity 1 - hands-on", "Activity 2 - creative", "Activity 3 - discussion"],
        "discussion_questions": ["Question for parent to ask", "Question 2", "Question 3"],
        "fun_facts": ["Interesting fact 1", "Fun fact 2", "Amazing fact 3"]
    },
    "vocabulary": [
        {"word": "Dialect word", "meaning": "What it means", "island_context": "How it's used on ${island.display_name}"}
    ]
}`;
    }

    private parseLessonResponse(
        text: string,
        island: IslandPack,
        subject: ConciergeLesson['subject'],
        childName: string,
        ageTrack: 'mini' | 'big',
        characterHost: 'roti' | 'tanty_spice' | 'dilly_doubles' | 'mango_moko'
    ): ConciergeLesson {
        try {
            // Strip any markdown code fences
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(cleaned);

            return {
                island_code: island.id,
                island_name: island.display_name,
                lesson_id: `${island.id.toLowerCase()}_${subject}_${ageTrack}_${Date.now()}`,
                title: parsed.title || `${island.display_name} ${subject} lesson`,
                subject,
                age_track: ageTrack,
                duration_minutes: ageTrack === 'mini' ? 10 : 15,
                overview: parsed.overview || `Learn about ${island.display_name}'s ${subject}`,
                objectives: parsed.objectives || [],
                content: {
                    story: parsed.content?.story,
                    activities: parsed.content?.activities || [],
                    discussion_questions: parsed.content?.discussion_questions || [],
                    fun_facts: parsed.content?.fun_facts || [],
                },
                vocabulary: parsed.vocabulary || [],
                character_host: characterHost,
                created_at: new Date().toISOString(),
                model_used: MODEL_NAME,
            };
        } catch (err) {
            console.error('[CONCIERGE] Failed to parse lesson response:', err);
            return this.getFallbackLesson(island, subject, childName, ageTrack, characterHost);
        }
    }

    /**
     * Fallback curriculum when AI is unavailable — uses static registry data
     */
    private getFallbackCurriculum(
        island: IslandPack,
        childName: string,
        ageTrack: 'mini' | 'big',
        characterHost: 'roti' | 'tanty_spice' | 'dilly_doubles' | 'mango_moko'
    ): ConciergeCurriculum {
        const subjects: ConciergeLesson['subject'][] = ['literacy', 'math', 'culture', 'music', 'folklore'];
        return {
            island_code: island.id,
            island_name: island.display_name,
            child_name: childName,
            age_track: ageTrack,
            lessons: subjects.map(s => this.getFallbackLesson(island, s, childName, ageTrack, characterHost)),
            generated_at: new Date().toISOString(),
        };
    }

    private getFallbackLesson(
        island: IslandPack,
        subject: ConciergeLesson['subject'],
        childName: string,
        ageTrack: 'mini' | 'big',
        characterHost: 'roti' | 'tanty_spice' | 'dilly_doubles' | 'mango_moko'
    ): ConciergeLesson {
        const dialectWord = island.dialect.vocabulary[0] || { word: 'Irie', meaning: 'Good', usage: 'Everything irie' };
        const food = island.cultural_traits.foods[0] || 'rice and beans';
        const festival = island.cultural_traits.festivals[0] || 'Carnival';

        return {
            island_code: island.id,
            island_name: island.display_name,
            lesson_id: `${island.id.toLowerCase()}_${subject}_${ageTrack}_fallback`,
            title: `${island.display_name} ${subject.charAt(0).toUpperCase() + subject.slice(1)} Adventure`,
            subject,
            age_track: ageTrack,
            duration_minutes: ageTrack === 'mini' ? 10 : 15,
            overview: `Join ${characterHost} to explore ${island.display_name}'s ${subject}. ${childName} will learn about ${food} and the word "${dialectWord.word}"!`,
            objectives: [
                `Learn about ${island.display_name}'s ${subject}`,
                `Practice the word "${dialectWord.word}" which means "${dialectWord.meaning}"`,
                `Discover something special about ${island.adjective} culture`,
            ],
            content: {
                story: `One sunny morning on ${island.display_name}, ${childName} and ${characterHost} were exploring the island. "Let's learn about ${subject}!" said ${characterHost}. They discovered that ${island.display_name} is famous for ${food} and celebrating ${festival}. The word "${dialectWord.word}" means "${dialectWord.meaning}" in the local language. ${childName} practiced saying it: "${dialectWord.word}!" What a wonderful adventure on ${island.display_name}!`,
                activities: [
                    `Draw a picture of ${island.display_name}`,
                    `Practice saying "${dialectWord.word}" three times`,
                    `Ask a grown-up about ${food}`,
                ],
                discussion_questions: [
                    `What did you learn about ${island.display_name}?`,
                    `Can you say "${dialectWord.word}"? What does it mean?`,
                    `What would you like to try from ${island.display_name}?`,
                ],
                fun_facts: [
                    `${island.display_name}'s national bird is the ${island.symbols.national_bird || 'a beautiful tropical bird'}`,
                    `People on ${island.display_name} love to celebrate ${festival}`,
                    `A famous food is ${food}`,
                ],
            },
            vocabulary: [{
                word: dialectWord.word,
                meaning: dialectWord.meaning,
                island_context: dialectWord.usage || `Used on ${island.display_name}`,
            }],
            character_host: characterHost,
            created_at: new Date().toISOString(),
            model_used: 'fallback',
        };
    }

    /**
     * Get available islands for the picker UI
     */
    getAvailableIslands(): { code: string; name: string; adjective: string; overview: string }[] {
        return Object.values(ISLAND_REGISTRY).map(island => ({
            code: island.id,
            name: island.display_name,
            adjective: island.adjective,
            overview: island.overview,
        }));
    }
}

// Singleton export
let _instance: IslandConciergeAgent | null = null;
export function getIslandConcierge(): IslandConciergeAgent {
    if (!_instance) {
        _instance = new IslandConciergeAgent();
    }
    return _instance;
}

export { IslandConciergeAgent };
