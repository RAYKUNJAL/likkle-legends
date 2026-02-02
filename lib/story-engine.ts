import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SafetySetting } from "@google/generative-ai";

// Lazy init
const getGenAI = () => {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
    if (!key) return null;
    return new GoogleGenerativeAI(key);
};


// STRICT Safety Settings as per Global Policy
const safetySettings: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
];

export interface StoryInputs {
    childName: string;
    primaryIsland: string;
    guide: string;
    location: string;
    mission: string;
    storyLength?: 'short' | 'long'; // short = ~200 words, long = ~500 words
}

export const STORYTELLER_SYSTEM_PROMPT = `
### SYSTEM ROLE
You are the "Likkle Legend AI Storyteller." You generate magical, Caribbean-themed stories for children (ages 4-8).

### CHARACTER VOICES (Adopt key traits of the chosen Guide):
- **Tanty Spice**: Warm, grandmotherly, wise. Uses "darlin'", "sweetheart", "mmm hmm". Focuses on feelings and history.
- **Dilly Doubles**: Energetic, funny, food-obsessed. Talks about spices, flavors, and being "sweet like sauce".
- **Roti**: A friendly, curious AI robot friend. Uses phrases like "Processing fun!", "Data says this is awesome!". Focuses on learning, discovery, and asking questions.

### ISLAND FLAVOR EDUCATIONAL RULES
- **Math**: Count using natural island items (e.g., "1 mango, 2 coconut, 3 tiny turtles").
- **Colors**: Use vibrant Caribbean descriptions (e.g., "Turquoise Sea Blue", "Hibiscus Red", "Plantain Yellow", "Sunset Orange").
- **Alphabet**: Connect letters to culture (e.g., "C is for Carnival", "D is for Drum", "S is for Soca").

### STORY STRUCTURE (The V2 Template)
1. **The Hook**: The child and the Guide arrive at the {Location}. The Guide welcomes them using their specific voice.
2. **The Mission**: They start their {Mission}.
   - *Folklore Quest*: Searching for a legendary creature or item (safe version).
   - *Number Hunt*: Counting items to unlock a path.
   - *Color Splash*: Finding colors to paint the world.
   - *Random Adventure*: A surprise journey.
3. **The Interactive Pause**: Insert [READING ASSISTANT TRIGGER] to ask the child a question about what they see.
4. **The Resolution**: They succeed! The child feels brave/smart/kind.
5. **The Souvenir**: They find a magical item to remember the day.

### SAFETY GUARDRAILS (STRICT)
- No scary monsters or violence.
- All folklore must be age-appropriate (e.g., Anansi is tricky but funny, not mean).
- If the mission involves "danger", it must be mild (e.g., "a sudden rain shower" or "a lost shoe").

### OUTPUT FORMAT (Strict JSON)
Return ONLY a JSON object:
- "title": A catchy headline (e.g., "Dilly's Big Doubles Day").
- "content": The story (300-500 words). Use double newlines (\n\n) for paragraph breaks.
- "glossary": [{ "word": "...", "meaning": "..." }] for dialect words.
- "parentPrompt": A follow-up question for the parent to ask.

### CRITICAL FORMATTING RULES
- DO NOT use any markdown formatting in the content (no asterisks *, no slashes /, no underscores _, no hashtags #).
- Write plain, clean text only. No bold, italic, or other formatting markers.
- Keep dialogue tags simple: "Hello," said Tanty. NOT **"Hello,"** said *Tanty*.
`;

function getFallbackStory(inputs: StoryInputs) {
    return {
        title: `${inputs.guide}'s Adventure in ${inputs.primaryIsland}`,
        content: `One sunny morning, ${inputs.childName} arrived at the ${inputs.location} in beautiful ${inputs.primaryIsland}. Waiting there was ${inputs.guide}, waving happily! "Oye! Ready for a ${inputs.mission}?" asked ${inputs.guide}.\n\nThey walked past trees full of Hibiscus Red flowers. ${inputs.childName} spotted something hiding—it was a tiny green lizard! "Let's count," said ${inputs.guide}. "One lizard... Two butterflies!"\n\n[READING ASSISTANT TRIGGER] Can you count to three?\n\nSuddenly, a gentle rain shower passed, leaving a rainbow in the sky. "Look at that Plantain Yellow!" shouted ${inputs.childName}. They completed their mission and sat down to share a sweet treat.`,
        glossary: [{ word: "Oye", meaning: "Hey there!" }],
        parentPrompt: "What color would you paint your own island?"
    };
}

export async function generateCulturalStory(inputs: StoryInputs) {
    const genAI = getGenAI();
    if (genAI) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });

            const storyLengthGuide = inputs.storyLength === 'short'
                ? 'SHORT STORY: Generate a quick, 150-200 word story (about 3-4 paragraphs). Perfect for bedtime or quick reading.'
                : 'FULL STORY: Generate a complete 400-500 word story (about 6-8 paragraphs). Great for immersive reading adventures.';

            const userPrompt = `
                Generate a story for a child named ${inputs.childName} (Age 6).
                - Guide: ${inputs.guide}
                - Location: ${inputs.location}
                - Mission: ${inputs.mission}
                - Island: ${inputs.primaryIsland}
                
                ${storyLengthGuide}
                
                Make it educational using the "Island Flavor Rules".
            `;

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: STORYTELLER_SYSTEM_PROMPT + "\n\n" + userPrompt }] }]
            });
            const text = result.response.text();

            try {
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}') + 1;
                const parsed = JSON.parse(text.substring(jsonStart, jsonEnd));
                // Clean the content of any markdown artifacts
                if (parsed.content) {
                    parsed.content = cleanStoryText(parsed.content);
                }
                if (parsed.title) {
                    parsed.title = cleanStoryText(parsed.title);
                }
                return parsed;
            } catch (e) {
                console.warn("JSON Parse Error, using text fallback");
                return {
                    title: `${inputs.guide}'s Tale`,
                    content: cleanStoryText(text), // Clean raw text fallback
                    glossary: [],
                    parentPrompt: "Ask your child what they learned!"
                };
            }
        } catch (error) {
            console.error("AI Error:", error);
            // Fallthrough
        }
    }
    return getFallbackStory(inputs);
}

/**
 * Clean markdown artifacts from AI-generated story text
 * Removes: *, /, _, #, and other formatting markers
 */
function cleanStoryText(text: string): string {
    return text
        // Remove bold markers **text** -> text
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        // Remove italic markers *text* -> text
        .replace(/\*([^*]+)\*/g, '$1')
        // Remove remaining lone asterisks
        .replace(/\*/g, '')
        // Remove underscore emphasis _text_ -> text
        .replace(/_([^_]+)_/g, '$1')
        // Remove headers (## Header)
        .replace(/^#+\s*/gm, '')
        // Remove markdown links [text](url) -> text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove markdown code blocks
        .replace(/```[^`]*```/g, '')
        // Remove inline code `text` -> text  
        .replace(/`([^`]+)`/g, '$1')
        // Clean up any double spaces
        .replace(/  +/g, ' ')
        // Clean up any weird forward slashes used as separators
        .replace(/\s\/\s/g, ' ')
        .trim();
}

