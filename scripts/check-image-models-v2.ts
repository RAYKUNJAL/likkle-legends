
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
    const apiKey = process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        console.error('No API key found');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = [
        'gemini-2.5-flash-image',
        'gemini-2.0-flash-exp-image-generation',
        'gemini-3-pro-image-preview',
        'gemini-2.0-flash'
    ];

    console.log('--- Testing Image Generation (v1beta) ---');

    for (const m of models) {
        try {
            console.log(`Testing ${m}...`);
            const model = genAI.getGenerativeModel({ model: m }, { apiVersion: 'v1beta' });

            const result = await model.generateContent({
                contents: [{ parts: [{ text: "Vibrant Caribbean beach with a small turtle" }] }],
                generationConfig: {
                    // @ts-ignore
                    responseModalities: ["IMAGE"]
                }
            });

            const parts = result.response.candidates?.[0]?.content?.parts;
            if (parts?.some((p: any) => p.inlineData)) {
                console.log(`✅ ${m} generated an image!`);
            } else {
                console.log(`❓ ${m} returned no image data. Parts:`, JSON.stringify(parts));
            }
        } catch (e: any) {
            console.log(`❌ ${m} failed: ${e.message}`);
        }
    }
}

main();
