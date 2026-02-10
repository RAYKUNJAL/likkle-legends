
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY || '';

async function test() {
    console.log('Testing Gemini API...');
    console.log('API KEY:', API_KEY ? 'FOUND (starts with ' + API_KEY.substring(0, 5) + '...)' : 'MISSING');

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Say hello in a Caribbean accent.");
        const response = await result.response;
        console.log('Response:', response.text());
    } catch (error: any) {
        console.error('ERROR:', error);
    }
}

test();
