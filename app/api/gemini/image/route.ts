import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export const runtime = 'nodejs';
export const maxDuration = 120;

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
    const { prompt, fileName = `image-${Date.now()}` } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required field: prompt' },
        { status: 400 }
      );
    }

    console.log(`🎨 [Gemini API] Generating Image: ${prompt.substring(0, 50)}...`);

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image'
    }, { apiVersion: 'v1beta' });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `(Professional Children's Book Illustration, Caribbean Style, Vibrant Colors, High Quality) ${prompt}`
        }]
      }],
      generationConfig: {
        // @ts-ignore
        responseModalities: ["IMAGE"],
      }
    });

    const imageData = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!imageData) {
      throw new Error("No image data returned from Gemini");
    }

    const buffer = Buffer.from(imageData, "base64");

    // Upload to Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey);

    const path = `generated/${Date.now()}-${fileName}.png`;
    const { error } = await adminClient.storage.from('content-images').upload(path, buffer, {
      contentType: 'image/png',
      upsert: true
    });

    if (error) {
      console.error("Supabase Upload Error:", error);
      return NextResponse.json(
        { error: 'Failed to upload generated image' },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = adminClient.storage.from('content-images').getPublicUrl(path);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl
    });

  } catch (error: any) {
    console.error('Gemini Image Generation Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
