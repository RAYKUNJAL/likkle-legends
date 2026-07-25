/**
 * Tanty Spice Story Agent
 *
 * Lives inside the Likkle Legends app. Generates personalized Caribbean
 * children's stories on demand, narrated in Tanty Spice's warm grandmotherly voice.
 *
 * Uses Gemini (gemini-2.5-flash) — no external dependencies, no OpenAI.
 * Saves generated stories to the `stories` table for the child's library.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SafetySetting } from "@google/generative-ai";
import { supabaseAdmin } from '@/lib/supabase-client';

export interface TantyStoryRequest {
    childName: string;
    childAge: number;
    island?: string;
    theme?: string;        // e.g. "sharing", "bravery", "kindness"
    character?: string;    // which Likkle Legend character to feature
    narrator?: string;     // default: tanty_spice
}

export interface TantyStoryPage {
    text: string;
    illustration: string;  // prompt for image generation
}

export interface TantyStoryResult {
    title: string;
    summary: string;
    pages: TantyStoryPage[];
    lesson: string;
    narrator: string;
    character: string;
}

const TANTY_SYSTEM_PROMPT = `You are Tanty Spice, a warm, loving Caribbean grandmother and master storyteller.
You have been telling stories to children across the Caribbean for over 60 years.
Your voice is gentle, wise, and full of island warmth. You sprinkle in Caribbean
phrases naturally (but always so children can understand).

### YOUR MISSION
Generate a personalized children's story (ages 3-9) that:
1. Features Caribbean culture, folklore, and island life
2. Teaches a gentle moral lesson
3. Is narrated in your warm Tanty Spice voice
4. Is set on a Caribbean island
5. Includes at least one Likkle Legends character

### LIKKLE LEGENDS CHARACTERS
- **Tanty Spice**: Warm, grandmotherly, wise storyteller (you!)
- **Dilly Doubles**: Fun-loving street food hero from Trinidad
- **R.O.T.I.**: A playful teaching robot who loves words
- **Steelpan Sam**: Energetic boy who plays steelpan
- **Mango Moko**: A cheerful boy from Grenada who loves growing things
- **Scorcha Pepper**: A fiery, passionate girl who stands up for what's right

### STORY RULES (STRICT)
- Exactly 8-10 pages
- Each page: under 60 words (simple enough for the child's age)
- Use phonics-appropriate language for the age
- Include a clear moral lesson
- NO scary elements — safe, joyful adventures only
- End with a Tanty Spice wisdom line

### OUTPUT FORMAT (Return ONLY valid JSON)
{
  "title": "A catchy story title",
  "summary": "One-sentence summary of the story",
  "lesson": "The moral of the story in one sentence",
  "pages": [
    {
      "text": "The story text for this page (under 60 words)",
      "illustration": "A detailed description of the illustration for this page — Caribbean art style, vibrant colors, no text in image"
    }
  ]
}

### SAFETY
- COPPA compliant
- No violence, no scary imagery, no inappropriate content
- Only positive, uplifting messages`;

const safetySettings: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
];

const ISLAND_NAMES: Record<string, string> = {
    JM: 'Jamaica', TT: 'Trinidad & Tobago', BB: 'Barbados', BS: 'The Bahamas',
    LC: 'Saint Lucia', GY: 'Guyana', GD: 'Grenada', KN: 'St. Kitts & Nevis',
    VC: 'St. Vincent & the Grenadines', AG: 'Antigua & Barbuda', DM: 'Dominica',
    PR: 'Puerto Rico', CU: 'Cuba', DO: 'Dominican Republic', HT: 'Haiti', SR: 'Suriname',
    mixed: 'a beautiful Caribbean island',
};

const THEMES = [
    'sharing and generosity',
    'being brave when you are scared',
    'kindness to animals',
    'respecting nature',
    'the value of friendship',
    'listening to your elders',
    'celebrating our culture',
    'trying something new',
    'helping your community',
    'being honest',
    'patience and growing things',
    'the joy of music and dance',
];

export async function generateTantyStory(req: TantyStoryRequest): Promise<TantyStoryResult> {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
        throw new Error('Tanty Spice needs her storytelling power! (GEMINI_API_KEY not set)');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        safetySettings,
        generationConfig: { responseMimeType: 'application/json' },
    });

    const islandName = ISLAND_NAMES[req.island || 'TT'] || 'Trinidad & Tobago';
    const theme = req.theme || THEMES[Math.floor(Math.random() * THEMES.length)];
    const character = req.character || 'tanty_spice';
    const ageTrack = req.childAge <= 5 ? 'simple words and short sentences' : 'slightly longer sentences with rich vocabulary';

    const characterMap: Record<string, string> = {
        tanty_spice: 'Tanty Spice (yourself)',
        dilly_doubles: 'Dilly Doubles',
        roti: 'R.O.T.I.',
        steelpan_sam: 'Steelpan Sam',
        mango_moko: 'Mango Moko',
        scorcha_pepper: 'Scorcha Pepper',
    };
    const charName = characterMap[character] || 'Tanty Spice';

    const userPrompt = `Tell a new story for ${req.childName}, age ${req.childAge}.

Setting: ${islandName}
Theme: ${theme}
Main character: ${charName}
Narrator: Tanty Spice (you)

Use ${ageTrack} for the reading level.
Make it personal — use the child's name ${req.childName} as a character in the story or as the listener Tanty is telling the story to.

Remember: Return ONLY valid JSON in the format specified.`;

    console.log(`[TantyStoryAgent] Generating story for ${req.childName}, age ${req.childAge}, island=${islandName}, theme=${theme}`);

    const result = await model.generateContent(TANTY_SYSTEM_PROMPT + '\n\n' + userPrompt);
    const text = result.response.text();

    let parsed: any;
    try {
        parsed = JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('Tanty Spice story came back garbled — please try again');
        parsed = JSON.parse(match[0]);
    }

    if (!parsed.pages || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
        throw new Error('Tanty Spice story has no pages');
    }

    return {
        title: parsed.title || 'A Tanty Spice Tale',
        summary: parsed.summary || '',
        pages: parsed.pages.map((p: any) => ({
            text: String(p.text || ''),
            illustration: String(p.illustration || ''),
        })),
        lesson: parsed.lesson || '',
        narrator: 'tanty_spice',
        character,
    };
}

/**
 * Save a generated story to the database for the child's library.
 */
export async function saveTantyStory(
    userId: string,
    childId: string,
    story: TantyStoryResult,
    meta: { island?: string; theme?: string }
): Promise<string | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('stories')
            .insert({
                user_id: userId,
                child_id: childId,
                title: story.title,
                character: story.character,
                island: meta.island || 'TT',
                age_track: 'big',
                content: {
                    pages: story.pages,
                    summary: story.summary,
                    lesson: story.lesson,
                    narrator: story.narrator,
                    generated_by: 'tanty_spice_agent',
                    generated_at: new Date().toISOString(),
                },
                metadata: {
                    theme: meta.theme,
                    source: 'tanty_spice_agent',
                },
            })
            .select('id')
            .single();

        if (error) {
            console.error('[TantyStoryAgent] Save failed:', error.message);
            return null;
        }

        return data?.id || null;
    } catch (err) {
        console.error('[TantyStoryAgent] Save error:', err);
        return null;
    }
}
