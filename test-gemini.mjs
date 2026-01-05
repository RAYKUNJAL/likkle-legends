
import { GoogleGenAI, Modality } from "@google/genai";

async function test() {
    const apiKey = "AIzaSyATS8wepc9q5sZaE8odU_fwSe9ftF7l_-c";
    console.log('Using API Key: AIzaSy...l_-c');

    try {
        const ai = new GoogleGenAI({ apiKey });

        console.log('Sending request to Gemini (gemini-2.5-flash-preview-tts)...');
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{
                parts: [{
                    text: `Read this: Blessings me darlin!`
                }]
            }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: 'Kore'
                        }
                    },
                },
            },
        });

        console.log('Response received');
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
            console.log('SUCCESS: Audio data found, length:', base64Audio.length);
        } else {
            console.log('FAILURE: No audio data in response candidates');
            console.log('Response body:', JSON.stringify(response, null, 2));
        }
    } catch (error) {
        console.error('ERROR:', error);
    }
}

test();
