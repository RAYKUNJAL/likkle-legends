
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
    try {
        // The SDK doesn't have a direct listModels in the main GenAI class usually, 
        // it's often in the backend or requires a different client.
        // But we can try to hit the endpoint or just test a few names.
        console.log('Testing model names...');
        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-exp'];

        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent('Hi');
                console.log(`✅ ${m} works!`);
            } catch (e: any) {
                console.log(`❌ ${m} failed: ${e.message}`);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

main();
