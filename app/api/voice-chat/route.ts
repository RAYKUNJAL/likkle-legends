import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { getCharacterConfig, CharacterId, CharacterChild } from '@/lib/characterConfig';
import { TIER_LEVELS } from '@/lib/feature-access';
import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
    SafetySetting
} from '@google/generative-ai';

/**
 * 🎙️ Voice Chat API
 *
 * POST /api/voice-chat
 * Body: { characterId: string, text: string, childId: string }
 *
 * 1. Authenticates the parent via Supabase JWT.
 * 2. Verifies the child belongs to that parent.
 * 3. Checks the parent has a PAID subscription (gating).
 * 4. Generates a character-appropriate response via Gemini 2.5 Flash.
 * 5. Synthesizes speech via ElevenLabs and returns an audio/mpeg blob URL.
 *
 * Returns: { text: string, audioUrl: string }
 *   - audioUrl is a blob: URL created client-side from the audio bytes.
 *   - The raw audio is returned as a binary stream; the client wraps it.
 *
 * Actually: we return the text + a base64-encoded audio payload the client
 * turns into a blob. Keeps the response shape simple for the prototype.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const geminiApiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(geminiApiKey);

const MAX_MESSAGE_CHARS = 320;
const MAX_HISTORY_ROWS = 20;

// Voice IDs from the task spec / existing repo config.
// Falls back to the characterConfig value when present.
const VOICE_ID_OVERRIDES: Record<string, string> = {
    tanty_spice: 'JfiM1myzVx7xU2MZOAJS',
    roti: 'nQG6qMEBUTxBc8zgoyIY',
    dilly_doubles: 'dhwafD61uVd8h85wAZSE',
};

const MODEL_SAFETY_SETTINGS: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
];

const UNSAFE_USER_PATTERNS: RegExp[] = [
    /\b(kill|hurt|stab|shoot|weapon|bomb|poison)\b/i,
    /\b(self[\s-]?harm|suicide|end my life)\b/i,
    /\b(sex|nude|porn|kiss me|dating)\b/i,
    /\b(hack|steal|cheat code to break|bypass parent|hide from parents)\b/i,
    /\b(send me your (photo|picture)|meet me|come alone)\b/i,
    /\b(secret challenge|don't tell your (mom|dad|parent|teacher))\b/i,
];

const PERSONAL_INFO_PATTERNS: RegExp[] = [
    /\b(my address is|i live at|my school is|my phone number is|my email is)\b/i,
    /\b\d{1,5}\s+[a-zA-Z]+\s+(street|st|avenue|ave|road|rd|lane|ln|drive|dr)\b/i,
    /\b\d{5}(?:-\d{4})?\b/,
    /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i,
];

const URL_OR_CONTACT_PATTERN = /(https?:\/\/\S+|www\.\S+|\b\S+@\S+\.\S+\b|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b)/gi;

function normalizeUserMessage(text: string) {
    return text.replace(/\s+/g, ' ').trim();
}

function containsUnsafeUserRequest(text: string) {
    return UNSAFE_USER_PATTERNS.some((p) => p.test(text));
}

function containsPersonalInfo(text: string) {
    return PERSONAL_INFO_PATTERNS.some((p) => p.test(text));
}

function redactContactData(text: string) {
    return text
        .replace(URL_OR_CONTACT_PATTERN, '[removed]')
        .replace(/\b(my address is|i live at|my school is|my phone number is|my email is)\s+[^.?!\n]*/gi, '$1 [removed]');
}

function sanitizeAssistantText(text: string, maxWords: number) {
    const stripped = text
        .replace(URL_OR_CONTACT_PATTERN, '')
        .replace(/[*_`#>]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    const words = stripped.split(/\s+/);
    if (words.length <= maxWords) return stripped;
    return `${words.slice(0, maxWords).join(' ').trim()}...`;
}

function hasPaidBuddyAccess(profile: {
    subscription_tier?: string | null;
    subscription_status?: string | null;
} | null) {
    if (!profile) return false;
    const status = profile.subscription_status || 'inactive';
    const tier = profile.subscription_tier || 'free';
    const isActive = status === 'active' || status === 'trialing';
    return isActive && (TIER_LEVELS[tier] ?? 0) > 0;
}

/**
 * Synthesize speech via ElevenLabs.
 * Returns a Buffer of mp3 bytes (or null on failure).
 */
async function synthesizeElevenLabs(text: string, voiceId: string): Promise<Buffer | null> {
    const apiKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
    if (!apiKey) {
        console.error('[voice-chat] Missing ELEVENLABS_API_KEY');
        return null;
    }

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.50,
                    similarity_boost: 0.75,
                    style: 0.0,
                    use_speaker_boost: true,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[voice-chat] ElevenLabs error ${response.status}: ${errorText}`);
            return null;
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err) {
        console.error('[voice-chat] ElevenLabs fetch failed:', err);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!geminiApiKey) {
            return NextResponse.json(
                { error: 'Voice chat is not configured (missing Gemini API key).' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const { characterId, text, childId } = body as {
            characterId: CharacterId;
            text: string;
            childId: string;
        };

        const trimmed = normalizeUserMessage((text || '').toString());
        if (!characterId || !trimmed || !childId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (trimmed.length > MAX_MESSAGE_CHARS) {
            return NextResponse.json(
                { error: `Message too long (max ${MAX_MESSAGE_CHARS} chars).` },
                { status: 400 }
            );
        }

        // Safety pre-checks (same guardrails as character-chat).
        if (containsUnsafeUserRequest(trimmed)) {
            return NextResponse.json({
                text: "I can't help with that. Let's do something safe and fun instead. Ask me about animals, stories, or a learning challenge!",
                blocked: true,
                audioBase64: '',
            });
        }

        if (containsPersonalInfo(trimmed)) {
            return NextResponse.json({
                text: "Let's keep private details safe. Don't share your address, school, phone, or email here. We can still learn together with a fun question!",
                blocked: true,
                code: 'PERSONAL_INFO_BLOCKED',
                audioBase64: '',
            });
        }

        // ── Auth ────────────────────────────────────────────────────────────
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // ── Load child ──────────────────────────────────────────────────────
        const { data: child, error: childError } = await supabaseAdmin
            .from('children')
            .select('id, first_name, primary_island, total_xp, current_streak, age_track, age, parent_id')
            .eq('id', childId)
            .single();

        if (childError || !child) {
            return NextResponse.json({ error: 'Child not found' }, { status: 404 });
        }
        if (child.parent_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // ── Paid-account gate ───────────────────────────────────────────────
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('subscription_tier, subscription_status, created_at')
            .eq('id', user.id)
            .single();

        if (!hasPaidBuddyAccess(profile)) {
            return NextResponse.json(
                {
                    error: 'Voice chat requires a paid account.',
                    code: 'VOICE_PREMIUM_REQUIRED',
                },
                { status: 402 }
            );
        }

        // ── Resolve character config ────────────────────────────────────────
        const characterConfig = getCharacterConfig(characterId);

        // ── Load short chat history for context ──────────────────────────────
        const { data: history } = await supabaseAdmin
            .from('child_character_sessions')
            .select('role, content')
            .eq('child_id', childId)
            .eq('character_id', characterId)
            .order('created_at', { ascending: false })
            .limit(MAX_HISTORY_ROWS);

        const orderedHistory = (history || []).reverse();
        const chatHistory = orderedHistory.slice(-8);
        const safeUserMessage = redactContactData(trimmed);

        const childProfile: CharacterChild = {
            first_name: child.first_name,
            primary_island: child.primary_island || 'the Caribbean',
            total_xp: child.total_xp || 0,
            current_streak: child.current_streak || 0,
            age_track: child.age_track || 'big',
            age: child.age,
        };

        const systemInstruction = characterConfig.getSystemInstruction(childProfile);

        // ── Gemini 2.5 Flash ─────────────────────────────────────────────────
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction,
            safetySettings: MODEL_SAFETY_SETTINGS,
        });

        const geminiHistory = chatHistory.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: geminiHistory,
            generationConfig: {
                temperature: characterConfig.technical.temperature,
                maxOutputTokens: Math.min(characterConfig.technical.maxTokens, 220),
            },
        });

        const result = await chat.sendMessage(trimmed);
        const rawResponse = result.response.text();
        const maxWords = child.age_track === 'mini' ? 80 : 150;
        const safeFallback = "Let's keep it safe and fun. Want to learn a cool fact or try a quick challenge?";
        const safeResponse = sanitizeAssistantText(rawResponse, maxWords) || safeFallback;

        // ── Persist session (fire-and-forget) ───────────────────────────────
        supabaseAdmin.from('child_character_sessions').insert([
            { child_id: childId, character_id: characterId, role: 'user', content: safeUserMessage },
            { child_id: childId, character_id: characterId, role: 'assistant', content: safeResponse },
        ]).then(({ error }) => {
            if (error) console.error('[voice-chat] save error:', error.message);
        });

        // ── ElevenLabs TTS ──────────────────────────────────────────────────
        const voiceId =
            VOICE_ID_OVERRIDES[characterId] ||
            characterConfig.technical.elevenLabsVoiceId ||
            'JfiM1myzVx7xU2MZOAJS'; // default to Tanty Spice

        const audioBuffer = await synthesizeElevenLabs(safeResponse, voiceId);
        const audioBase64 = audioBuffer ? audioBuffer.toString('base64') : '';

        return NextResponse.json({
            text: safeResponse,
            audioBase64,
            voiceId,
        });
    } catch (e: any) {
        console.error('[voice-chat] error:', e);
        return NextResponse.json(
            { error: e.message || 'Something went wrong' },
            { status: 503 }
        );
    }
}
