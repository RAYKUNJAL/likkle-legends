
import { OpenAI } from 'openai';
import { supabase } from '@/lib/supabase-client';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateImage(prompt: string, fileName: string): Promise<string | null> {
    if (!process.env.OPENAI_API_KEY) {
        console.warn("Skipping Image Gen: Missing OPENAI_API_KEY");
        return null;
    }

    try {
        console.log(`🎨 Generating Image: ${prompt.substring(0, 50)}...`);
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: `(Children's Book Illustration, Caribbean Style, Vibrant Colors) ${prompt}`,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json"
        });

        if (!response.data || !response.data[0]) throw new Error("No image data returned from OpenAI");
        const b64 = response.data[0].b64_json as string;
        if (!b64) throw new Error("No image data returned from OpenAI");

        const buffer = Buffer.from(b64, "base64");

        // Upload to Supabase Storage
        const path = `generated/${Date.now()}-${fileName}.png`;
        const { error } = await supabase.storage.from('content-images').upload(path, buffer, {
            contentType: 'image/png',
            upsert: true
        });

        if (error) {
            console.error("Supabase Upload Error:", error);
            // Fallback?
            return null;
        }

        const { data: { publicUrl } } = supabase.storage.from('content-images').getPublicUrl(path);
        return publicUrl;

    } catch (e) {
        console.error("Image Gen Failed:", e);
        return null;
    }
}
