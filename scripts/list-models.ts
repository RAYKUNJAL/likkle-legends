
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GEMINI_API_KEY || '';

async function list() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // The listModels method is not directly on genAI in the new SDK
        // It might be in the generative-ai-nodejs library or we use fetch

        console.log('Testing connection with simple fetch...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        console.log('Available models:', JSON.stringify(data, null, 2));
    } catch (error: any) {
        console.error('ERROR:', error);
    }
}

list();
