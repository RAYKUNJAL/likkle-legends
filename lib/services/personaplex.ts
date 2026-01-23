/**
 * PersonaPlex Client Library
 * Connects to a self-hosted PersonaPlex/Moshi server for full-duplex voice AI.
 */

// --- Protocol Definitions ---

export type MessageType = "handshake" | "audio" | "text" | "control" | "metadata" | "error" | "ping";

export const VERSIONS_MAP = { 0: 0b00000000 } as const;
export const MODELS_MAP = { 0: 0b00000000 } as const;
export type VERSION = keyof typeof VERSIONS_MAP;
export type MODEL = keyof typeof MODELS_MAP;

export const CONTROL_MESSAGES_MAP = {
    start: 0b00000000,
    endTurn: 0b00000001,
    pause: 0b00000010,
    restart: 0b00000011,
} as const;

export type CONTROL_MESSAGE = keyof typeof CONTROL_MESSAGES_MAP;

export type WSMessage =
    | { type: "handshake"; version: VERSION; model: MODEL; }
    | { type: "audio"; data: Uint8Array; }
    | { type: "text"; data: string; }
    | { type: "control"; action: CONTROL_MESSAGE; }
    | { type: "metadata"; data: unknown; }
    | { type: "error"; data: string; }
    | { type: "ping"; };

// --- Encoder / Decoder ---

export const encodeMessage = (message: WSMessage): Uint8Array => {
    switch (message.type) {
        case "handshake":
            return new Uint8Array([0x00, VERSIONS_MAP[message.version], MODELS_MAP[message.model]]);
        case "audio":
            const audioBytes = new Uint8Array(message.data.length + 1);
            audioBytes[0] = 0x01;
            audioBytes.set(message.data, 1);
            return audioBytes;
        case "text":
            return new Uint8Array([0x02, ...new TextEncoder().encode(message.data)]);
        case "control":
            return new Uint8Array([0x03, CONTROL_MESSAGES_MAP[message.action]]);
        case "metadata":
            return new Uint8Array([0x04, ...new TextEncoder().encode(JSON.stringify(message.data))]);
        case "error":
            return new Uint8Array([0x05, ...new TextEncoder().encode(message.data)]);
        case "ping":
            return new Uint8Array([0x06]);
        default:
            return new Uint8Array([]);
    }
};

export const decodeMessage = (data: Uint8Array): WSMessage | null => {
    if (data.length === 0) return null;
    const type = data[0];
    const payload = data.slice(1);

    switch (type) {
        case 0x00: return { type: "handshake", version: 0, model: 0 };
        case 0x01: return { type: "audio", data: payload };
        case 0x02: return { type: "text", data: new TextDecoder().decode(payload) };
        case 0x03:
            const action = Object.keys(CONTROL_MESSAGES_MAP).find(
                key => CONTROL_MESSAGES_MAP[key as CONTROL_MESSAGE] === payload[0]
            ) as CONTROL_MESSAGE | undefined;
            return action ? { type: "control", action } : null;
        case 0x04: return { type: "metadata", data: JSON.parse(new TextDecoder().decode(payload)) };
        case 0x05: return { type: "error", data: new TextDecoder().decode(payload) };
        case 0x06: return { type: "ping" };
        default: return null;
    }
};

// --- Client Class ---

export interface PersonaPlexState {
    status: 'disconnected' | 'connecting' | 'connected' | 'error';
    error?: string;
    textLog: { sender: 'user' | 'ai'; text: string }[];
}

export class PersonaPlexClient {
    private ws: WebSocket | null = null;
    private url: string;
    private onStateChange: (state: PersonaPlexState) => void;
    private onAudio: (chunk: Uint8Array) => void;

    private state: PersonaPlexState = {
        status: 'disconnected',
        textLog: []
    };

    constructor(
        serverUrl: string,
        onStateChange: (state: PersonaPlexState) => void,
        onAudio: (chunk: Uint8Array) => void
    ) {
        this.url = serverUrl;
        this.onStateChange = onStateChange;
        this.onAudio = onAudio;
    }

    connect() {
        this.updateState({ status: 'connecting' });
        try {
            this.ws = new WebSocket(this.url);
            this.ws.binaryType = 'arraybuffer';

            this.ws.onopen = () => {
                this.updateState({ status: 'connected' });
                // Send handshake
                this.send({ type: 'handshake', version: 0, model: 0 });
            };

            this.ws.onmessage = (event) => {
                const data = new Uint8Array(event.data as ArrayBuffer);
                const msg = decodeMessage(data);
                if (msg) this.handleMessage(msg);
            };

            this.ws.onclose = () => {
                this.updateState({ status: 'disconnected' });
            };

            this.ws.onerror = (err) => {
                console.error("WebSocket Error", err);
                this.updateState({ status: 'error', error: 'Connection failed' });
            };
        } catch (err: any) {
            this.updateState({ status: 'error', error: err.message });
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.updateState({ status: 'disconnected' });
    }

    send(msg: WSMessage) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(encodeMessage(msg));
        }
    }

    sendText(text: string) {
        this.send({ type: 'text', data: text });
        // Optimistically update log? No, wait for echo or response logic
        // But Moshi might not echo input text, so we log it here
        const newLog = [...this.state.textLog, { sender: 'user' as const, text }];
        this.updateState({ textLog: newLog });
    }

    private handleMessage(msg: WSMessage) {
        switch (msg.type) {
            case 'text':
                // Append partial text from AI
                // Note: Moshi streams tokens. We might need to buffer words.
                // For simplicity, we just append to the last AI message or create new one.
                this.handleAiText(msg.data);
                break;
            case 'audio':
                this.onAudio(msg.data);
                break;
            case 'error':
                console.error("PersonaPlex Error:", msg.data);
                break;
        }
    }

    private handleAiText(text: string) {
        // Simple logic: if last message is AI, append. Else create new.
        const log = [...this.state.textLog];
        const last = log[log.length - 1];
        if (last && last.sender === 'ai') {
            last.text += text; // Check if space needed? Moshi might send partials
            this.updateState({ textLog: log });
        } else {
            this.updateState({ textLog: [...log, { sender: 'ai', text }] });
        }
    }

    private updateState(updates: Partial<PersonaPlexState>) {
        this.state = { ...this.state, ...updates };
        this.onStateChange(this.state);
    }
}
