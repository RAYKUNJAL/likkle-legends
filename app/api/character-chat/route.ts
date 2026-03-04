import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { getCharacterConfig, CharacterId, CharacterChild } from '@/lib/characterConfig';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MAX_MESSAGE_CHARS = 320;

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
            .limit(40);

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

        const trimmedMessage = (message || '').toString().trim();
        if (!characterId || !trimmedMessage || !childId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (trimmedMessage.length > MAX_MESSAGE_CHARS) {
            return NextResponse.json({ error: `Message too long (max ${MAX_MESSAGE_CHARS} chars).` }, { status: 400 });
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
            .limit(8);

        const chatHistory = (history || []).reverse();

        const childProfile: CharacterChild = {
            first_name: child.first_name,
            primary_island: child.primary_island || 'the Caribbean',
            total_xp: child.total_xp || 0,
            current_streak: child.current_streak || 0,
            age_track: child.age_track || 'big',
            age: child.age
        };

        const systemInstruction = characterConfig.getSystemInstruction(childProfile);

        const model = genAI.getGenerativeModel({
            model: characterConfig.technical.brainModel,
            systemInstruction,
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

        supabaseAdmin.from('child_character_sessions').insert([
            {
                child_id: childId,
                character_id: characterId,
                role: 'user',
                content: trimmedMessage
            },
            {
                child_id: childId,
                character_id: characterId,
                role: 'assistant',
                content: responseText
            }
        ]).then(({ error }) => {
            if (error) console.error('Failed to save chat messages:', error.message);
        });

        return NextResponse.json({
            response: responseText,
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
