import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '@/lib/supabase-client';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function generateImage(prompt: string, fileName: string): Promise<string | null> {
    if (!apiKey) {
        console.warn("Skipping Image Gen: Missing Gemini API Key");
        return null;
    }

    try {
        console.log(`🎨 [Gemini Story Maker] Generating Image: ${prompt.substring(0, 50)}...`);

        const genAI = new GoogleGenerativeAI(apiKey);

        // Use the working Gemini 2.5 Flash Image model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-image"
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
        if (!imageData) throw new Error("No image data returned from Gemini Story Maker");

        const buffer = Buffer.from(imageData, "base64");

        // Use service role key if available for storage bypass, otherwise fallback to standard client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Import createClient dynamically to avoid client/server issues
        const { createClient } = await import('@supabase/supabase-js');
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);

        // Upload to Supabase Storage
        const path = `generated/${Date.now()}-${fileName}.png`;
        const { error } = await adminClient.storage.from('content-images').upload(path, buffer, {
            contentType: 'image/png',
            upsert: true
        });

        if (error) {
            console.error("Supabase Upload Error:", error);
            return null;
        }

        const { data: { publicUrl } } = adminClient.storage.from('content-images').getPublicUrl(path);
        return publicUrl;

    } catch (e) {
        console.error("Gemini Image Gen Failed:", e);
        // Fallback or handle error
        return null;
    }
}
