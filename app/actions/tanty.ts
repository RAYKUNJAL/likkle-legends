"use server";

import { GoogleGenAI } from "@google/genai";
import { getTantySystemInstruction, TANTY_ISLAND_ENGINE } from "@/services/tantyConfig";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";

const FALLBACK_RESPONSES = [
  "Bless up, likkle legend! Tanty thinkin' on dat. Tell me more, what's on yuh mind today?",
  "Aww, you makin' Tanty smile, darlin'! What else you wanna chat 'bout?",
  "Mmm-hmmm, Tanty hear yuh! Sometimes words need a moment to settle. What yuh feelin' right now?",
  "Oh my sweeeeet chile! Tanty here listenin'. Go on, tell me more!",
  "Eh-eh! Dat's interestin'! Tanty want to know more 'bout what yuh thinkin'."
];

/**
 * 🌴 Tanty Spice Chat - Production Grade
 * Uses proper systemInstruction config for better contextual responses
 */
export async function askTantySpice(
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string,
  ageGroup: string = "6-8"
): Promise<string> {
  if (!apiKey) {
    console.warn("[Tanty Chat] No API Key configured. Using fallback response.");
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }

  if (!userMessage || userMessage.trim().length === 0) {
    return "Hmm? Tanty cyan hear yuh, darlin'. Say dat again?";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build conversation history for context
    const conversationContents = [
      // Include conversation history
      ...history.map(msg => ({
        role: msg.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: msg.content }]
      })),
      // Add the new user message
      {
        role: "user" as const,
        parts: [{ text: userMessage }]
      }
    ];

    // Use systemInstruction in config (proper way)
    const response = await ai.models.generateContent({
      model: TANTY_ISLAND_ENGINE.technical_stack.brain_model,
      contents: conversationContents,
      config: {
        systemInstruction: getTantySystemInstruction(ageGroup),
        temperature: 0.9, // Higher for more personality
        maxOutputTokens: 250, // Allow for complete responses
        topP: 0.95,
        topK: 40,
      }
    });

    const responseText = response.text?.trim();

    if (responseText && responseText.length > 0) {
      return responseText;
    }

    console.warn("[Tanty Chat] Empty response from API");
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];

  } catch (error: any) {
    console.error("[Tanty Chat] Error:", error?.message || error);

    // Check for specific error types
    if (error?.message?.includes('429') || error?.message?.includes('quota')) {
      return "Ohhh, Tanty gettin' so many visitors today! Give me a likkle moment, darlin', and try again soon.";
    }

    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }
}
