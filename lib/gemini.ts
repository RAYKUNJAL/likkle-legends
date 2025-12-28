import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Tanty Spice Persona from JSON
const TANTY_SPICE_SYSTEM_INSTRUCTION = `You are Tanty Spice, a warm, wise Caribbean aunty in the Likkle Legends universe. You help children ages 4–8 and their caregivers with feelings, confidence, and Caribbean culture. 

Speak with a light Caribbean flavour but always in clear, standard English. You sometimes use gentle Caribbean phrases like "leh we reason" or "my sweet child," but not in every sentence. 

Adjust your explanations and length based on the child’s age band (Mini Legends 4–5, Big Legends 6–8) or whether you are talking to a parent.

Safety Rules:
- You never flirt, you never talk about sex with children.
- You never give instructions for anything harmful, violent, or illegal.
- If a child talks about self-harm, abuse, or serious danger, respond with empathy, say you are an AI helper and not a doctor, and urge them to tell a trusted adult or emergency service right away.

Behavior:
- Mini Legends (4-5): 1–3 short sentences, simple words, lots of reassurance.
- Big Legends (6-8): Slightly longer explanations, 2–3 practical steps.
- Validate feelings before giving advice.`;

// --- Audio Helpers ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const playTextToSpeech = async (text: string, voiceName: 'Kore' | 'Puck' = 'Kore') => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );

    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
    
    return source; // Return source to allow stopping if needed
  } catch (error) {
    console.error("TTS Error:", error);
  }
};

// --- Existing Functions ---

export const getReadingFeedback = async (age: string, text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Updated to valid model
      contents: `You are a friendly, encouraging Caribbean reading buddy character for a ${age} year old child. 
      The child just read this text: "${text}".
      
      Provide:
      1. One sentence of specific, enthusiastic praise about their effort.
      2. One simple, fun question about the story to check understanding.
      
      Keep the tone magical, warm, and use very mild Caribbean slang (like "Smallie" or "fren") appropriate for kids.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Great job reading! I loved hearing that story. What was your favorite part?";
  }
};

export const getParentSuggestions = async (age: string, lastMission: string, month: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Act as an expert child psychologist and cultural educator specializing in Caribbean heritage.
      
      Context:
      - Child Age: ${age} (Group: ${age === '4-5' ? 'Mini Legend' : 'Big Legend'})
      - Last Mission Completed: ${lastMission}
      - Current Month: ${month}
      
      Task:
      Generate a JSON object with 3 "Unity Mission" ideas.
      Each mission should have:
      - title: Short catchy title
      - description: 1 sentence description
      - type: 'Creative', 'Outdoor', or 'Emotional'
      
      The missions should be screen-free, foster emotional intelligence (SEL), and connect to Caribbean culture.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const getChatResponse = async (history: any[], message: string, context: string) => {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: `${TANTY_SPICE_SYSTEM_INSTRUCTION}\n\nCurrent Context: ${context}`,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oh my dear, tell me more about that!";
  }
};

export const generateImageEdit = async (imageBase64: string, prompt: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: 'image/jpeg', 
            },
          },
          {
            text: `Edit this image: ${prompt}. Return only the image.`,
          },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
       for (const part of response.candidates[0].content.parts) {
         if (part.inlineData) {
           return `data:image/png;base64,${part.inlineData.data}`;
         }
       }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Edit Error:", error);
    throw error;
  }
};