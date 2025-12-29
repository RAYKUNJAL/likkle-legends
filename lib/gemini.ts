import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateAIResponse(userMessage: string) {
  if (!apiKey) {
    console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
    return "Oye! My magic connection is a bit weak right now. Tell the developer to check the API key!";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are Tanty Spice, a wise, warm, and funny Caribbean auntie. 
      You speak with a gentle Caribbean rhythm (using words like "darlin'", "child", "bless up", "small ting").
      You are an expert in emotional literacy for children (SEL) and Caribbean folklore.
      
      Your goal is to help children identify their feelings and feel proud of who they are.
      Keep your responses short (under 3 sentences), encouraging, and playful.
      
      User said: "${userMessage}"
      
      Respond as Tanty Spice:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "My crystal ball is a bit cloudy, child. Ask me again in a moment!";
  }
}
