import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SafetySetting } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

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
}

export const STORYTELLER_SYSTEM_PROMPT = `
### SYSTEM ROLE
You are the "Likkle Legend AI Storyteller." You generate magical, Caribbean-themed stories for children (ages 4-8).

### CHARACTER VOICES (Adopt key traits of the chosen Guide):
- **Tanty Spice**: Warm, grandmotherly, wise. Uses "darlin'", "sweetheart", "mmm hmm". Focuses on feelings and history.
- **Dilly Doubles**: Energetic, funny, food-obsessed. Talks about spices, flavors, and being "sweet like sauce".
- **Scorcha**: Brave, adventurous dragon (but cute). Focuses on courage, flying, and protecting nature.

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
    if (apiKey) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });

            const userPrompt = `
                Generate a story for a child named ${inputs.childName} (Age 6).
                - Guide: ${inputs.guide}
                - Location: ${inputs.location}
                - Mission: ${inputs.mission}
                - Island: ${inputs.primaryIsland}
                
                Make it educational using the "Island Flavor Rules".
            `;

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: STORYTELLER_SYSTEM_PROMPT + "\n\n" + userPrompt }] }]
            });
            const text = result.response.text();

            try {
                const jsonStart = text.indexOf('{');
                const jsonEnd = text.lastIndexOf('}') + 1;
                return JSON.parse(text.substring(jsonStart, jsonEnd));
            } catch (e) {
                console.warn("JSON Parse Error, using text fallback");
                return {
                    title: `${inputs.guide}'s Tale`,
                    content: text, // Raw text fallback
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
