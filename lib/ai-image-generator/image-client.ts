import { GoogleGenAI, Modality } from "@google/genai";
import { supabase } from '@/lib/supabase-client';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function generateImage(prompt: string, fileName: string): Promise<string | null> {
    if (!apiKey) {
        console.warn("Skipping Image Gen: Missing Gemini API Key");
        return null;
    }

    try {
        console.log(`🎨 [Gemini Story Maker] Generating Image: ${prompt.substring(0, 50)}...`);

        const ai = new GoogleGenAI({ apiKey });

        // Use the dedicated Gemini Story Maker model (Image Generation Edition)
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp-image-generation",
            contents: [{
                parts: [{
                    text: `(Professional Children's Book Illustration, Caribbean Style, Vibrant Colors, High Quality) ${prompt}`
                }]
            }],
            config: {
                responseModalities: [Modality.IMAGE],
            }
        });

        const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!imageData) throw new Error("No image data returned from Gemini Story Maker");

        const buffer = Buffer.from(imageData, "base64");

        // Upload to Supabase Storage
        const path = `generated/${Date.now()}-${fileName}.png`;
        const { error } = await supabase.storage.from('content-images').upload(path, buffer, {
            contentType: 'image/png',
            upsert: true
        });

        if (error) {
            console.error("Supabase Upload Error:", error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage.from('content-images').getPublicUrl(path);
        return publicUrl;

    } catch (e) {
        console.error("Gemini Image Gen Failed:", e);
        // Fallback or handle error
        return null;
    }
}
