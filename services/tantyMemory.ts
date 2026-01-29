
import { GoogleGenAI } from "@google/genai";

/**
 * 🧶 TANTY'S HEART-STRINGS SERVICE v2.0
 */

export const extractHeartString = (userInput: string): string | null => {
    const normalized = userInput.toLowerCase();

    if (normalized.includes("my dog is called")) return `Has a dog named ${userInput.split("called")[1].trim()}`;
    if (normalized.includes("my favorite fruit is")) return `Loves ${userInput.split("is")[1].trim()}`;
    if (normalized.includes("i am scared of")) return `Fear of ${userInput.split("of")[1].trim()}`;
    if (normalized.includes("today i built")) return `Creative: Built ${userInput.split("built")[1].trim()}`;

    return null;
};

/**
 * PRODUCTION: Uses Gemini to distill a session into key emotional facts.
 */
export const summarizeSession = async (messages: { role: string, text: string }[]): Promise<string> => {
    if (messages.length < 4) return "";

    const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) return "Session completed.";

    const ai = new GoogleGenAI({ apiKey: key });
    const chatLog = messages.map(m => `${m.role}: ${m.text}`).join("\n");

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Summarize the following interaction between Tanty Spice and a child. Identify 3 key emotional facts or interests to remember for next time. Keep it under 20 words.\n\n${chatLog}`,
            config: { temperature: 0.3 }
        });
        return response.text || "Everything cook and curry.";
    } catch (e) {
        return "Tanty is thinking 'bout our talk.";
    }
};
