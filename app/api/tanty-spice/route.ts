import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { TANTY_ISLAND_ENGINE } from "@/services/tantyConfig";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: "No messages provided" }, { status: 400 });
        }

        if (!API_KEY) {
            console.warn("Gemini API Key missing. Using fallback.");
            return NextResponse.json({
                role: "assistant",
                content: "Mmm-hmmm! Tanty ears not hearing too well right now, darlin'. Ask your Mommy to check the connection?"
            });
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({
            model: TANTY_ISLAND_ENGINE.technical_stack.brain_model,
            systemInstruction: TANTY_ISLAND_ENGINE.neural_personality.system_instruction,
            generationConfig: {
                temperature: TANTY_ISLAND_ENGINE.neural_personality.temperature,
                maxOutputTokens: TANTY_ISLAND_ENGINE.neural_personality.max_tokens,
            }
        });

        const chat = model.startChat({
            history: messages.slice(0, -1).map((m: any) => ({
                role: m.role === "user" ? "user" : "model",
                parts: [{ text: m.content }],
            })),
        });

        const result = await chat.sendMessage(messages[messages.length - 1].content);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ role: "assistant", content: text });

    } catch (error) {
        console.error("Error in Tanty Spice API:", error);
        return NextResponse.json({
            role: "assistant",
            content: "Lawd! Tanty had a little stumble. Let we try again, sweet sugar-cake."
        });
    }
}
