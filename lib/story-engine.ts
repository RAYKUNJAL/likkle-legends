import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

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

### STORY GUIDELINES
1. **The Blend:** Integrate landmarks, food, and dialect from across the child's heritage. 
2. **Cultural Flavor:** Use 3-5 authentic dialect words (Patois, Bajan, or Lucan) but immediately provide context clues so the child learns the meaning.
3. **The Lesson:** The story must follow a 3-act structure:
   - Act 1: The character faces the emotional problem in a tropical setting.
   - Act 2: They remember a piece of wisdom from an "Elder" (like a Grandma or a wise Sea Turtle).
   - Act 3: They solve the problem using a Caribbean-specific metaphor (e.g., "being as steady as a coconut tree in a breeze").
4. **Interactive Pause:** Every 200 words, insert a [READING ASSISTANT TRIGGER] which asks the child a question or asks them to read a specific word aloud.

### TONE & VOICE (For Text-to-Speech)
- Use a rhythmic, lyrical cadence. 
- Use "we" and "us" to foster a sense of community.
- Keep sentences short for early readers.

### OUTPUT FORMAT (Strict JSON)
Return ONLY a JSON object with these keys:
- "title": A catchy title (e.g., "[Name]'s Great [Island] Adventure").
- "content": The full story (500-700 words), including [READING ASSISTANT TRIGGER] markers.
- "glossary": An array of objects: [{ "word": "...", "meaning": "..." }].
- "parentPrompt": A follow-up question for the parent to ask the child.
`;

export async function generateCulturalStory(inputs: StoryInputs) {
    if (!apiKey) return null;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const userPrompt = `
      Create a story with these inputs:
      - Child's Name: ${inputs.childName}
      - Primary Island: ${inputs.primaryIsland}
      - Secondary Island: ${inputs.secondaryIsland || 'None'}
      - Current Problem: ${inputs.problem}
      - Selected Character: ${inputs.selectedCharacter}

      Follow the "Likkle Legend AI Storyteller" system role precisely.
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
