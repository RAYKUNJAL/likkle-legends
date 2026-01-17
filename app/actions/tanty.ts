
"use server";

import { GoogleGenAI } from "@google/genai";
import { TANTY_ISLAND_ENGINE } from "@/services/tantyConfig";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";

const FALLBACK_RESPONSES = [
  "Bless up, little legend! Tanty considers that a very interesting thought. Tell me more about your day?",
  "Aw, you're making Tanty smile! Remember, even when clouds are grey, the sun is just waiting to shine.",
  "That's a big feeling for a little heart! Dilly Doubles always says a good snack fixes everything. Have you eaten today?",
  "Your words are sweet like sugar cake! I'm here listening, darlin'.",
  "Oh my! That sounds like an adventure waiting to happen."
];

export async function askTantySpice(
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string
) {
  if (!apiKey) {
    console.warn("No API Key for Tanty Spice. Using fallback.");
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = TANTY_ISLAND_ENGINE.neural_personality.system_instruction;

    const response = await ai.models.generateContent({
      model: TANTY_ISLAND_ENGINE.technical_stack.brain_model,
      contents: [
        { role: 'system', parts: [{ text: systemInstruction }] },
        ...history.map(msg => ({
          role: msg.role === "assistant" ? "model" as const : "user" as const,
          parts: [{ text: msg.content }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        temperature: TANTY_ISLAND_ENGINE.neural_personality.temperature,
        maxOutputTokens: TANTY_ISLAND_ENGINE.neural_personality.max_tokens,
      }
    });

    return response.text || FALLBACK_RESPONSES[0];
  } catch (error) {
    console.error("Error generating AI response with Antigravity SDK:", error);
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }
}
