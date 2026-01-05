"use server";

import { GoogleGenerativeAI, SafetySetting, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { TANTY_ISLAND_ENGINE } from "@/services/tantyConfig";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
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
  // 1. Try AI Generation
  if (!apiKey) {
    console.warn("No API Key for Tanty Spice. Using fallback.");
  } else {
    try {
      const systemInstruction = `
${TANTY_ISLAND_ENGINE.neural_personality.system_instruction}

CONTEXT & RULES:
- You are Tanty Spice from the Likkle Legends Mail Club.
- We help kids ages 4-8 learn about Caribbean culture and SEL.
- Characters: Dilly Doubles (food), Mango Moko (pride), Steelpan Sam (music).
- If a child says they are hurt or in danger, tell them to talk to a trusted adult immediately.
- KEEP RESPONSES SHORT (1-3 sentences).
`;

      const model = genAI.getGenerativeModel({
        model: TANTY_ISLAND_ENGINE.technical_stack.brain_model,
        systemInstruction,
        safetySettings,
        generationConfig: {
          temperature: TANTY_ISLAND_ENGINE.neural_personality.temperature,
          maxOutputTokens: TANTY_ISLAND_ENGINE.neural_personality.max_tokens,
        },
      });

      // Convert history to Gemini format
      // Note: Gemini expects "user" and "model" roles
      const chatHistory = history.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: chatHistory,
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating AI response:", error);
      // Fall through to fallback
    }
  }

  // 2. Return Fallback
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}
