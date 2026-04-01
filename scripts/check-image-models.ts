
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
    // Development script: check server-side keys only
    // (NEXT_PUBLIC_ prefix should NEVER be used for API keys)
    const apiKey = process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
        console.error('No API key found');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = [
        'imagen-3.0-generate-001',
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash',
        'gemini-1.5-flash-002'
    ];

    console.log('--- Testing Image Generation Capability ---');

    for (const m of models) {
        try {
            console.log(`Testing ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            // Using the standard modality check or just trying a small gen if supported
            // Note: Not all keys have access to Image Gen. 
            // Also, the SDK call for Imagen might be different or require Vertex AI.
            // But we'll try the 'responseModalities' config.

            const result = await model.generateContent({
                contents: [{ parts: [{ text: "A small blue bird" }] }],
                generationConfig: {
                    // @ts-ignore
                    responseModalities: ["IMAGE"]
                }
            });
            console.log(`✅ ${m} supports IMAGE modality!`);
        } catch (e: any) {
            console.log(`❌ ${m} failed: ${e.message}`);
        }
    }
}

main();
