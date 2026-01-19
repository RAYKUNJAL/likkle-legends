import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SafetySetting } from "@google/generative-ai";
import { TANTY_ISLAND_ENGINE } from "@/services/tantyConfig";

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
      model: TANTY_ISLAND_ENGINE.technical_stack.brain_model,
      systemInstruction: TANTY_ISLAND_ENGINE.neural_personality.system_instruction,
      safetySettings,
    });

    const result = await model.generateContent(userMessage);
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
      model: TANTY_ISLAND_ENGINE.technical_stack.brain_model,
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

export async function playTextToSpeech(text: string, voice: string = 'Kore') {
  if (typeof window === 'undefined') return;

  try {
    // Dynamically import to avoid circular dependency or server-only issues in client bundle
    const { getTantyVoice } = await import('@/app/actions/voice');
    const res = await getTantyVoice(text);

    if (res.success && res.audio) {
      const audio = new Audio(res.audio);
      await audio.play();
    } else {
      // Fallback to Browser TTS (robotic) only if server fails
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google UK English Female')) ||
          voices.find(v => v.name.includes('Samantha'));
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.pitch = 0.9;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    }
  } catch (e) {
    console.error("TTS playback error:", e);
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
    const model = genAI.getGenerativeModel({ model: TANTY_ISLAND_ENGINE.technical_stack.brain_model, safetySettings });
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

export async function generateAssetMetadata(title: string, type: string) {
  if (!apiKey) return { description: "Island vibes and fun learning!", tags: ["culture", "fun"] };

  try {
    const model = genAI.getGenerativeModel({
      model: TANTY_ISLAND_ENGINE.technical_stack.brain_model,
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert curator for "Likkle Legends", a Caribbean educational app for kids.
      User is uploading a ${type} titled "${title}".
      Generate a child-friendly, engaging description (grandmotherly and warm) and 3-5 keywords.
      Return JSON: { "description": string, "tags": string[] }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Error generating asset metadata:", error);
    return { description: "A special gift for our little legends!", tags: ["caribbean", "learning"] };
  }
}
