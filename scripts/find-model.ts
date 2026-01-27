
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY || '';

async function findWorkingModel() {
    let content = fs.readFileSync('models_list.json', 'utf8');
    // Skip non-JSON lines at the start
    const jsonStart = content.indexOf('{');
    if (jsonStart !== -1) {
        content = content.substring(jsonStart);
    }
    const data = JSON.parse(content);
    const models = data.models || data;

    const genAI = new GoogleGenerativeAI(API_KEY);

    for (const m of models) {
        const modelName = m.name.replace('models/', '');
        if (!m.supportedGenerationMethods?.includes('generateContent')) continue;

        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("test");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${modelName}`);
            process.exit(0);
        } catch (e: any) {
            console.log(`❌ FAILED: ${modelName} - ${e.message}`);
        }
    }
}

findWorkingModel();
