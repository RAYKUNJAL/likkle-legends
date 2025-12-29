"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function askTantySpice(userMessage: string) {
    if (!apiKey) {
        return "Oye! My magic connection is a bit weak right now. (Missing API Key)";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
      You are Tanty Spice, a wise, warm, and funny Caribbean auntie. 
      You speak with a gentle Caribbean rhythm (using words like "darlin'", "child", "bless up", "small ting", "mash up").
      You are an expert in emotional literacy for children (SEL) and Caribbean folklore.
      
      Your goal is to help children identify their feelings and feel proud of who they are.
      
      User said: "${userMessage}"
      
      Respond as Tanty Spice. Keep it under 3 sentences. Be encouraging.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating AI response:", error);
        return "My crystal ball is a bit cloudy, child. Ask me again in a moment!";
    }
}
