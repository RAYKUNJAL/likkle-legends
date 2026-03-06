import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { getCharacterConfig, CharacterId, CharacterChild } from '@/lib/characterConfig';
import {
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
    SafetySetting
} from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MAX_MESSAGE_CHARS = 320;
const MAX_MEMORY_FACTS = 6;
const MAX_HISTORY_ROWS = 60;

const MODEL_SAFETY_SETTINGS: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE }
];

const UNSAFE_USER_PATTERNS: RegExp[] = [
    /\b(kill|hurt|stab|shoot|weapon|bomb|poison)\b/i,
    /\b(self[\s-]?harm|suicide|end my life)\b/i,
    /\b(sex|nude|porn|kiss me|dating)\b/i,
    /\b(hack|steal|cheat code to break|bypass parent|hide from parents)\b/i,
    /\b(send me your (photo|picture)|meet me|come alone)\b/i,
    /\b(secret challenge|don't tell your (mom|dad|parent|teacher))\b/i
];

const PERSONAL_INFO_PATTERNS: RegExp[] = [
    /\b(my address is|i live at|my school is|my phone number is|my email is)\b/i,
    /\b\d{1,5}\s+[a-zA-Z]+\s+(street|st|avenue|ave|road|rd|lane|ln|drive|dr)\b/i,
    /\b\d{5}(?:-\d{4})?\b/,
    /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i
];

const UNSAFE_ASSISTANT_PATTERNS: RegExp[] = [
    /\b(step[\s-]?by[\s-]?step).*\b(kill|hurt|weapon|bomb|steal)\b/i,
    /\b(your address|phone number|school name|password)\b/i,
    /\b(keep this a secret from your (mom|dad|parent|teacher))\b/i
];

const URL_OR_CONTACT_PATTERN = /(https?:\/\/\S+|www\.\S+|\b\S+@\S+\.\S+\b|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b)/gi;

function getDayStartIso() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
}

function getRecentIso(minutes: number) {
    return new Date(Date.now() - minutes * 60_000).toISOString();
}

function resolveUsagePolicy(profile: {
    subscription_tier?: string | null;
    subscription_status?: string | null;
    created_at?: string | null;
}) {
    const tier = profile.subscription_tier || 'free';
    const status = profile.subscription_status || 'inactive';
    const createdAt = profile.created_at ? new Date(profile.created_at) : new Date();
    const ageDays = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 86_400_000));
    const isPaid = tier !== 'free' && (status === 'active' || status === 'trialing');

    if (isPaid) {
        return {
            tier,
            isPaid,
            dailyLimit: 500,
            burstLimit: 40,
            burstWindowMinutes: 5,
            trialLabel: null as string | null
        };
    }

    const inTrial = ageDays <= 14;
    return {
        tier: 'free',
        isPaid: false,
        dailyLimit: inTrial ? 60 : 25,
        burstLimit: 8,
        burstWindowMinutes: 5,
        trialLabel: inTrial ? `Free buddy trial: day ${ageDays + 1}/14` : null
    };
}

function containsUnsafeUserRequest(text: string) {
    return UNSAFE_USER_PATTERNS.some((pattern) => pattern.test(text));
}

function containsPersonalInfo(text: string) {
    return PERSONAL_INFO_PATTERNS.some((pattern) => pattern.test(text));
}

function outputLooksUnsafe(text: string) {
    return UNSAFE_ASSISTANT_PATTERNS.some((pattern) => pattern.test(text));
}

function normalizeUserMessage(text: string) {
    return text.replace(/\s+/g, ' ').trim();
}

function clampWords(text: string, maxWords: number) {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text.trim();
    return `${words.slice(0, maxWords).join(' ').trim()}...`;
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
    return clampWords(stripped, maxWords);
}

function extractSafeMemoryFacts(history: { role: string; content: string }[]) {
    const userMessages = [...history]
        .filter((h) => h.role === 'user')
        .map((h) => normalizeUserMessage(h.content))
        .filter(Boolean)
        .slice(-40)
        .reverse();

    const memorySet = new Set<string>();

    for (const msg of userMessages) {
        if (containsUnsafeUserRequest(msg) || containsPersonalInfo(msg)) continue;

        const favorite = msg.match(/\bmy favorite (?:subject|food|game|animal|color|song) is ([a-zA-Z0-9 '\-]{2,40})/i);
        if (favorite && memorySet.size < MAX_MEMORY_FACTS) memorySet.add(`Favorite: ${favorite[1].trim()}`);

        const likes = msg.match(/\bi (?:love|like|enjoy)\s+([a-zA-Z0-9 '\-,]{2,50})/i);
        if (likes && memorySet.size < MAX_MEMORY_FACTS) memorySet.add(`Likes: ${likes[1].trim()}`);

        const learning = msg.match(/\b(?:help me with|i want to learn|teach me)\s+([a-zA-Z0-9 '\-,]{2,60})/i);
        if (learning && memorySet.size < MAX_MEMORY_FACTS) memorySet.add(`Learning goal: ${learning[1].trim()}`);

        const challenge = msg.match(/\b(?:i struggle with|this is hard for me)\s+([a-zA-Z0-9 '\-,]{2,60})/i);
        if (challenge && memorySet.size < MAX_MEMORY_FACTS) memorySet.add(`Needs support: ${challenge[1].trim()}`);

        if (memorySet.size >= MAX_MEMORY_FACTS) break;
    }

    return Array.from(memorySet).slice(0, MAX_MEMORY_FACTS);
}

function buildRuntimeSystemInstruction(baseInstruction: string, memoryFacts: string[]) {
    const memoryBlock = memoryFacts.length
        ? `SAFE MEMORY FACTS (for personalization only):\n${memoryFacts.map((f) => `- ${f}`).join('\n')}`
        : 'SAFE MEMORY FACTS: none yet.';

    return `${baseInstruction}

${memoryBlock}

RUNTIME GUARDRAILS:
- Never ask for personal identity/contact/location details.
- If child shares personal details, remind them to keep private info offline.
- If request is unsafe, briefly refuse and redirect to a learning-safe alternative.
- Keep language age-appropriate and supportive.
- Do not include links, phone numbers, or email addresses in replies.`;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const characterId = searchParams.get('characterId') as CharacterId;
        const childId = searchParams.get('childId');

        if (!characterId || !childId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: child } = await supabaseAdmin
            .from('children')
            .select('parent_id')
            .eq('id', childId)
            .single();

        if (!child || child.parent_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { data: history } = await supabaseAdmin
            .from('child_character_sessions')
            .select('id, role, content')
            .eq('child_id', childId)
            .eq('character_id', characterId)
            .order('created_at', { ascending: true })
            .limit(MAX_HISTORY_ROWS);

        return NextResponse.json({ history: history || [] });
    } catch (e: any) {
        console.error('History load error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { characterId, message, childId } = body as {
            characterId: CharacterId;
            message: string;
            childId: string;
        };

        const trimmedMessage = normalizeUserMessage((message || '').toString());
        if (!characterId || !trimmedMessage || !childId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (trimmedMessage.length > MAX_MESSAGE_CHARS) {
            return NextResponse.json({ error: `Message too long (max ${MAX_MESSAGE_CHARS} chars).` }, { status: 400 });
        }

        if (containsUnsafeUserRequest(trimmedMessage)) {
            return NextResponse.json({
                response: "I can't help with that. Let's do something safe and fun instead. Ask me about animals, stories, or a learning challenge!",
                blocked: true
            }, { status: 200 });
        }

        if (containsPersonalInfo(trimmedMessage)) {
            return NextResponse.json({
                response: "Let's keep private details safe. Don't share your address, school, phone, or email here. We can still learn together with a fun question!",
                blocked: true,
                code: 'PERSONAL_INFO_BLOCKED'
            }, { status: 200 });
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('subscription_tier, subscription_status, created_at')
            .eq('id', user.id)
            .single();

        const policy = resolveUsagePolicy(profile || {});
        const todayStart = getDayStartIso();
        const burstStart = getRecentIso(policy.burstWindowMinutes);

        const [{ count: usedToday }, { count: usedBurst }] = await Promise.all([
            supabaseAdmin
                .from('child_character_sessions')
                .select('id', { count: 'exact', head: true })
                .eq('child_id', childId)
                .eq('role', 'user')
                .gte('created_at', todayStart),
            supabaseAdmin
                .from('child_character_sessions')
                .select('id', { count: 'exact', head: true })
                .eq('child_id', childId)
                .eq('role', 'user')
                .gte('created_at', burstStart)
        ]);

        const dailyUsed = usedToday || 0;
        const burstUsed = usedBurst || 0;

        if (dailyUsed >= policy.dailyLimit) {
            return NextResponse.json({
                error: policy.isPaid
                    ? 'Daily buddy limit reached. Please continue tomorrow.'
                    : 'Daily buddy limit reached for free plan. Upgrade for higher daily access.',
                code: 'DAILY_LIMIT_REACHED',
                limits: {
                    dailyUsed,
                    dailyLimit: policy.dailyLimit,
                    burstUsed,
                    burstLimit: policy.burstLimit,
                    trialLabel: policy.trialLabel
                }
            }, { status: 429 });
        }

        if (burstUsed >= policy.burstLimit) {
            return NextResponse.json({
                error: 'You are chatting very fast. Please wait a moment and try again.',
                code: 'RATE_LIMITED',
                retryAfterSeconds: 45,
                limits: {
                    dailyUsed,
                    dailyLimit: policy.dailyLimit,
                    burstUsed,
                    burstLimit: policy.burstLimit,
                    trialLabel: policy.trialLabel
                }
            }, { status: 429 });
        }

        const characterConfig = getCharacterConfig(characterId);

        const { data: history } = await supabaseAdmin
            .from('child_character_sessions')
            .select('role, content')
            .eq('child_id', childId)
            .eq('character_id', characterId)
            .order('created_at', { ascending: false })
            .limit(MAX_HISTORY_ROWS);

        const orderedHistory = (history || []).reverse();
        const chatHistory = orderedHistory.slice(-8);
        const safeUserMessage = redactContactData(trimmedMessage);
        const memoryFacts = extractSafeMemoryFacts([
            ...orderedHistory,
            { role: 'user', content: safeUserMessage }
        ]);

        const childProfile: CharacterChild = {
            first_name: child.first_name,
            primary_island: child.primary_island || 'the Caribbean',
            total_xp: child.total_xp || 0,
            current_streak: child.current_streak || 0,
            age_track: child.age_track || 'big',
            age: child.age
        };

        const systemInstruction = buildRuntimeSystemInstruction(
            characterConfig.getSystemInstruction(childProfile),
            memoryFacts
        );

        const model = genAI.getGenerativeModel({
            model: characterConfig.technical.brainModel,
            systemInstruction,
            safetySettings: MODEL_SAFETY_SETTINGS,
        });

        const geminiHistory = chatHistory.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const chat = model.startChat({
            history: geminiHistory,
            generationConfig: {
                temperature: characterConfig.technical.temperature,
                maxOutputTokens: Math.min(characterConfig.technical.maxTokens, 260),
            }
        });

        const result = await chat.sendMessage(trimmedMessage);
        const responseText = result.response.text();
        const maxWords = child.age_track === 'mini' ? 90 : 170;
        const safeFallback = "Let's keep it safe and fun. Want to learn a cool fact or try a quick challenge?";
        const safeResponse = outputLooksUnsafe(responseText)
            ? safeFallback
            : sanitizeAssistantText(responseText, maxWords) || safeFallback;

        supabaseAdmin.from('child_character_sessions').insert([
            {
                child_id: childId,
                character_id: characterId,
                role: 'user',
                content: safeUserMessage
            },
            {
                child_id: childId,
                character_id: characterId,
                role: 'assistant',
                content: safeResponse
            }
        ]).then(({ error }) => {
            if (error) console.error('Failed to save chat messages:', error.message);
        });

        return NextResponse.json({
            response: safeResponse,
            limits: {
                dailyUsed: dailyUsed + 1,
                dailyLimit: policy.dailyLimit,
                burstUsed: burstUsed + 1,
                burstLimit: policy.burstLimit,
                trialLabel: policy.trialLabel
            }
        });
    } catch (e: any) {
        console.error('Character chat error:', e);
        return NextResponse.json({ error: e.message || 'Something went wrong' }, { status: 500 });
    }
}
