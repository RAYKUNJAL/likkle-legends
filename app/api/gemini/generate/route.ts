import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Validate API key exists on server only
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    '';

  if (!apiKey) {
    throw new Error('Gemini API Key not configured server-side');
  }

  return new GoogleGenerativeAI(apiKey);
};

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      prompt,
      model = 'gemini-2.5-pro',
      temperature = 0.9,
      maxTokens = 8192,
      responseMimeType = 'text/plain'
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
        { status: 400 }
      );
    }

    const genAI = getGeminiClient();
    const genModel = genAI.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType,
      }
    });

    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      success: true,
      content: text
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
