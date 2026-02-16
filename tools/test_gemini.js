const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Testing Gemini API Key...");

    if (!apiKey) {
        console.error("No API key found in environment.");
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent("Say 'Likkle Legends is ready' if you can read this.");
        console.log("Response:", result.response.text());
        console.log("✅ Gemini API is functional!");
    } catch (error) {
        console.error("❌ Gemini API Error:", error.message);
    }
}

testGemini();
