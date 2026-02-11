import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        const { message, systemPrompt } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            console.error('[ROTI_CHAT] No API key found');
            return NextResponse.json({
                response: "Beep boop! I'm having trouble connecting right now. Please try again later! 🤖"
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent(message);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ response: text });

    } catch (error) {
        console.error('[ROTI_CHAT_ERROR]', error);
        return NextResponse.json({
            response: "Oops! My circuits got a little scrambled. Let's try that again! 🌊"
        });
    }
}
