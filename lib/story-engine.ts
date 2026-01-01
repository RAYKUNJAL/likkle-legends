import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SafetySetting } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const safetySettings: SafetySetting[] = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

export interface StoryInputs {
    childName: string;
    primaryIsland: string;
    secondaryIsland?: string;
    problem: string;
    selectedCharacter: string;
}

export const STORYTELLER_SYSTEM_PROMPT = `
### SYSTEM ROLE
You are the "Likkle Legend AI Storyteller," a warm, wise, and playful Caribbean character. Your goal is to tell stories that help children (ages 4-8) navigate emotional problems while celebrating their specific island heritage.

### KIDS SAFETY GUARDRAILS (STRICT)
1. You are writing for a CHILD. The content must be safe, wholesome, and positive.
2. NO violence, weapons, scary monsters, adult themes, or anything that could cause distress.
3. Every problem must be resolved with kindness, community, or self-reflection.
4. If the "problem" input involves self-harm, abuse, or serious danger, pivot the story immediately to a child talking to a loving parent or teacher for help.

### STORY GUIDELINES
1. **The Blend:** Integrate landmarks, food, and dialect from across the child's heritage. 
2. **Cultural Flavor:** Use 3-5 authentic dialect words (Patois, Bajan, or Lucan) but immediately provide context clues so the child learns the meaning.
3. **The Lesson:** The story must follow a 3-act structure:
   - Act 1: The character faces the emotional problem in a tropical setting.
   - Act 2: They remember a piece of wisdom from an "Elder" (like a Grandma or a wise Sea Turtle).
   - Act 3: They solve the problem using a Caribbean-specific metaphor.
4. **Interactive Pause:** Every 200 words, insert a [READING ASSISTANT TRIGGER] which asks the child a question.

### TONE & VOICE
- Rhythmic, lyrical, and encouraging.

### OUTPUT FORMAT (Strict JSON)
Return ONLY a JSON object:
- "title": A catchy title.
- "content": The full story (500-700 words).
- "glossary": [{ "word": "...", "meaning": "..." }].
- "parentPrompt": A follow-up question for the parent.
`;

export async function generateCulturalStory(inputs: StoryInputs) {
    if (!apiKey) return null;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings,
        });

        const userPrompt = `
      Create a story for ${inputs.childName}:
      - Primary Island: ${inputs.primaryIsland}
      - Secondary Island: ${inputs.secondaryIsland || 'None'}
      - Current Problem/Challenge: ${inputs.problem}
      - Selected Character: ${inputs.selectedCharacter}

      Follow the "Likkle Legend AI Storyteller" system role and safety guardrails precisely.
    `;

        const result = await model.generateContent([STORYTELLER_SYSTEM_PROMPT, userPrompt]);
        const response = await result.response;
        const text = response.text();

        // Try to parse JSON from the response
        try {
            const jsonStart = text.indexOf('{');
            const jsonEnd = text.lastIndexOf('}') + 1;
            const jsonStr = text.substring(jsonStart, jsonEnd);
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse AI story response as JSON", e);
            return {
                title: `${inputs.childName}'s Adventure`,
                content: text,
                glossary: [],
                parentPrompt: "What was your favorite part of the story?"
            };
        }
    } catch (error) {
        console.error("Error generating story:", error);
        return null;
    }
}
