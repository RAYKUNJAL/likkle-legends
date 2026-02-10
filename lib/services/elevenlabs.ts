import { ElevenLabsClient } from 'elevenlabs';
import * as dotenv from 'dotenv';
import { WebSocket } from 'ws';

dotenv.config();

/**
 * 🎙️ ElevenLabs Service
 * Commercial-grade voice generation with word alignment support.
 */

export interface VoiceAlignment {
    characters: string[];
    character_start_times_seconds: number[];
    character_end_times_seconds: number[];
}

export interface VoiceResponse {
    audioBuffer: Buffer;
    alignment?: VoiceAlignment;
    normalizedText: string;
}

export class ElevenLabsService {
    private client: ElevenLabsClient;
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.ELEVENLABS_API_KEY || '';
        if (!this.apiKey) {
            console.warn('⚠️ ElevenLabs API Key missing. Voice generation will fail.');
        }
        this.client = new ElevenLabsClient({ apiKey: this.apiKey });
    }

    /**
     * Generates audio from text with word-level timestamps using WebSockets
     * This is the "Pro" method required for the Interactive Reader.
     */
    async generateSpeech(
        text: string,
        voiceId: string,
        options: { stability?: number; similarity?: number } = {}
    ): Promise<VoiceResponse> {
        if (!this.apiKey) throw new Error('ElevenLabs API Key is required');

        console.log(`🔊 [ElevenLabs] Generating speech for voice ${voiceId} with timestamps...`);

        return new Promise((resolve, reject) => {
            const modelId = 'eleven_multilingual_v2';
            const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}`;

            const socket = new WebSocket(wsUrl);
            const audioChunks: Buffer[] = [];
            let alignment: VoiceAlignment = {
                characters: [],
                character_start_times_seconds: [],
                character_end_times_seconds: []
            };

            socket.onopen = () => {
                // 1. Send BOS (Beginning of Stream) message
                socket.send(JSON.stringify({
                    text: " ", // Initialize
                    voice_settings: {
                        stability: options.stability || 0.5,
                        similarity_boost: options.similarity || 0.75
                    },
                    xi_api_key: this.apiKey
                }));

                // 2. Send Text
                socket.send(JSON.stringify({
                    text: text,
                    try_trigger_generation: true
                }));

                // 3. Send EOS (End of Stream)
                socket.send(JSON.stringify({ text: "" }));
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data.toString());

                if (data.audio) {
                    // Collect audio chunk
                    const chunk = Buffer.from(data.audio, 'base64');
                    audioChunks.push(chunk);
                }

                if (data.alignment) {
                    // Collect alignment data
                    if (data.alignment.characters) {
                        alignment.characters.push(...data.alignment.characters);
                    }
                    if (data.alignment.character_start_times_seconds) {
                        alignment.character_start_times_seconds.push(...data.alignment.character_start_times_seconds);
                    }
                    if (data.alignment.character_end_times_seconds) {
                        alignment.character_end_times_seconds.push(...data.alignment.character_end_times_seconds);
                    }
                }

                if (data.isFinal) {
                    socket.close();
                }
            };

            socket.onclose = () => {
                const audioBuffer = Buffer.concat(audioChunks);
                if (audioBuffer.length === 0) {
                    reject(new Error('ElevenLabs WebSocket closed without returning audio.'));
                    return;
                }

                resolve({
                    audioBuffer,
                    alignment,
                    normalizedText: text
                });
            };

            socket.onerror = (error) => {
                reject(new Error(`ElevenLabs WebSocket Error: ${error.message}`));
            };
        });
    }
}

export const elevenLabsService = new ElevenLabsService();
