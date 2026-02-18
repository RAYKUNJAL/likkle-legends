
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
    try {
        console.log('Listing models...');
        // The listModels method is available on the genAI object in recent versions
        // Actually it's often on the client or via a direct fetch to the endpoint.
        // We can try to use the GenAI listModels if it exists.

        // Wait, looking at the SDK docs, it's often:
        // const models = await genAI.listModels();
        // But if it's not there, we'll try to fetch it manally from the v1beta endpoint.

        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await resp.json();

        if (data.models) {
            console.log('Available Models:');
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log('No models returned or error:', data);
        }
    } catch (err) {
        console.error('Error listing models:', err);
    }
}

main();
