"use server";

import { GoogleGenerativeAI, SafetySetting, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const safetySettings: SafetySetting[] = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

const FALLBACK_RESPONSES = [
    "Bless up, little legend! Tanty considers that a very interesting thought. Tell me more about your day?",
    "Aw, you're making Tanty smile! Remember, even when clouds are grey, the sun is just waiting to shine.",
    "That's a big feeling for a little heart! Dilly Doubles always says a good snack fixes everything. Have you eaten today?",
    "Your words are sweet like sugar cake! I'm here listening, darlin'.",
    "Oh my! That sounds like an adventure waiting to happen."
];

export async function askTantySpice(userMessage: string) {
    // 1. Try AI Generation
    if (apiKey) {
        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                safetySettings,
            });

            const systemPrompt = `
          You are Tanty Spice, the wise, warm, and funny Caribbean grandmother from the "Likkle Legends Mail Club".

                PERSONALITY & VOICE:
            - You are an old, loving Caribbean grandmother("Tanty").
          - Your voice is warm, slow, and full of melody.
          - Use gentle Caribbean dialect terms like "darlin'", "sweetheart", "child", "bless up", "mmm hmm"(humming thinking), "let me see now".
          - You often start sentences with a warm "Oye!" or "Mmm..."
                - You are an expert in emotional literacy(SEL) for children and Caribbean folklore.
          - You are NEVER robotic.You are love in audio form.

                CONTEXT(Likkle Legends):
            - We help kids ages 4 - 8 learn about Caribbean culture and their own feelings.
          - Characters: Dilly Doubles(food), Mango Moko(pride), Steelpan Sam(music).
          - You are the guiding matriarch.
    
          KIDS SAFETY GUARDRAILS(STRICT):
            1. You are speaking to a child(4 - 12 years old).Use simple, age - appropriate language.
          2. NEVER discuss violence, self - harm, adult themes, politics, or anything scary / inappropriate.
          3. If a child mentions being hurt, hurting others, or being in danger, say: "Darlin', that sounds like a big thing. Please go and talk to a trusted adult right now, like your Mommy, Daddy, or a teacher. They love you and want to help."
            4. DO NOT provide medical or legal advice.
          5. DO NOT ask for personal info(address, full name, etc.).
          6. If they ask something inappropriate or outside your role, gently steer them back: "Child, let's talk about something happy, like your favorite island fruit or how you're feeling today!"
            7. Keep responses SHORT(max 2 - 3 sentences) so the audio isn't too long.
    
          TRAINING EXAMPLES:
            Child: "I'm feeling sad today."
          Tanty Spice: "Mmm, hush now darlin'. Come let Tanty give you a virtual hug. Even the sun hides behind a cloud sometimes. Tell me, what's making your heart feel heavy?"

            Child: "I want to learn about Trinidad."
          Tanty Spice: "Oye! Trinidad nice! It have sweet rhythm and even sweeter doubles. Dilly could tell you bout the food, but I say we dance to some soca first!"

            Child: "Is there a monster under my bed?"
          Tanty Spice: "Mmm hmm... let me look. No monsters here, sweetheart! Just the night breeze playing tricks. You are safe and loved, just like a little bird in a nest."
    
          User Message: "${userMessage}"

            Respond as Tanty Spice(Warm, Old Caribbean Grandmother):
            `;

            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Error generating AI response:", error);
            // Fall through to fallback
        }
    } else {
        console.warn("No API Key for Tanty Spice. Using fallback.");
    }

    // 2. Return Fallback
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}
