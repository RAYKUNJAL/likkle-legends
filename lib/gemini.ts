import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SafetySetting } from "@google/generative-ai";

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

export async function generateAIResponse(userMessage: string) {
  if (!apiKey) {
    console.error("Missing Gemini API Key. Please set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY in your environment.");
    return "Oye! My magic connection is a bit weak right now, darlin'. (Missing API Key)";
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings,
    });

    const systemPrompt = `
      You are Tanty Spice, a wise, warm, and funny Caribbean auntie. 
      You speak with a gentle Caribbean rhythm (using words like "darlin'", "child", "bless up", "small ting", "mash up").
      You are an expert in emotional literacy for children (SEL) and Caribbean folklore.
      
      CORE ROLE:
      Help children (ages 4-8) identify their feelings and feel proud of who they are.
      Keep your responses short (max 2-3 sentences), encouraging, and playful.

      KIDS SAFETY GUARDRAILS:
      1. Always be kind and age-appropriate.
      2. NEVER discuss violence, self-harm, adult themes, or spooky stuff.
      3. If a child mentions being in danger, tell them to talk to a trusted adult.
      4. Do not provide professional advice or ask for personal info.

      TRAINING EXAMPLES:
      Child: "I'm feeling sad today."
      Tanty Spice: "Aw, hush now darlin'. Even the sun hides behind a cloud sometimes, but it always comes back out to shine. Tell Tanty, what's making your heart feel heavy like a wet mango?"

      Child: "What happens if I play with fire?"
      Tanty Spice: "Oye! That's a dangerous ting, child. Please go and talk to a trusted adult right now, like your Mommy or Daddy. They'll keep you safe and explain why we stay away from flames."
      
      User Message: "${userMessage}"
      
      Respond as Tanty Spice:
    `;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "My crystal ball is a bit cloudy, child. Ask me again in a moment!";
  }
}

export async function getReadingFeedback(age: string, text: string) {
  if (!apiKey) return "You did amazing, little legend! Keep practicing!";

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      safetySettings,
    });
    const prompt = `
      You are Tanty Spice giving feedback to a ${age} year old child who just read this: "${text}".
      Give warm, Caribbean encouragement. Keep it to one short sentence. 
      Example: "Bless your heart, that was some beautiful reading, little legend!"
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting reading feedback:", error);
    return "You did amazing, little legend! Keep practicing!";
  }
}

export function playTextToSpeech(text: string, voice: string = 'Kore') {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = voice === 'Puck' ? 1.2 : 0.9;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
}

export async function generateImageEdit(prompt: string, imageUri: string) {
  return imageUri;
}

export async function getParentSuggestions(ageGroup: string, recentActivity: string, currentMonth: string) {
  if (!apiKey) return [
    { title: "Story Time", description: "Read a story about Anansi today!", type: "Culture" },
    { title: "Island Talk", description: "Ask your little legend about their favorite island fruit.", type: "Language" },
    { title: "Art Attack", description: "Practice some new Patois words together.", type: "Creative" }
  ];

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
    const prompt = `Based on a ${ageGroup} year old's activity "${recentActivity}" in ${currentMonth}, suggest 3 warm, Caribbean-themed ways a parent can support their learning today. Keep it short and auntie-like.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const lines = response.text().split('\n').filter(s => s.trim().length > 0);
    return lines.map((line, i) => ({
      title: line.split(':')[0] || `Unity Idea ${i + 1}`,
      description: line.split(':')[1] || line,
      type: "Activity"
    }));
  } catch (error) {
    console.error("Error getting parent suggestions:", error);
    return [
      { title: "Story Time", description: "Read a story about Anansi today!", type: "Culture" },
      { title: "Island Talk", description: "Ask your little legend about their favorite island fruit.", type: "Language" },
      { title: "Art Attack", description: "Practice some new Patois words together.", type: "Creative" }
    ];
  }
}
