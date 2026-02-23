import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { getCharacterConfig, CharacterId, CharacterChild } from '@/lib/characterConfig';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const characterId = searchParams.get('characterId') as CharacterId;
        const childId = searchParams.get('childId');

        if (!characterId || !childId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Verify parent auth
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify child ownership
        const { data: child } = await supabaseAdmin
            .from('children')
            .select('parent_id')
            .eq('id', childId)
            .single();

        if (!child || child.parent_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Load history
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

        if (!characterId || !message || !childId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify parent auth
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 2. Load child and verify ownership
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

        // 3. Load character config
        const characterConfig = getCharacterConfig(characterId);

        // 4. Load last 10 messages for context window
        const { data: history } = await supabaseAdmin
            .from('child_character_sessions')
            .select('role, content')
            .eq('child_id', childId)
            .eq('character_id', characterId)
            .order('created_at', { ascending: false })
            .limit(10);

        // Reverse so oldest messages come first
        const chatHistory = (history || []).reverse();

        // 5. Build system instruction with child context
        const childProfile: CharacterChild = {
            first_name: child.first_name,
            primary_island: child.primary_island || 'the Caribbean',
            total_xp: child.total_xp || 0,
            current_streak: child.current_streak || 0,
            age_track: child.age_track || 'big',
            age: child.age
        };

        const systemInstruction = characterConfig.getSystemInstruction(childProfile);

        // 6. Call Gemini with history
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
                maxOutputTokens: characterConfig.technical.maxTokens,
            }
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        // 7. Save both messages to DB (fire and forget — don't block response)
        supabaseAdmin.from('child_character_sessions').insert([
            {
                child_id: childId,
                character_id: characterId,
                role: 'user',
                content: message
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

        return NextResponse.json({ response: responseText });

    } catch (e: any) {
        console.error('Character chat error:', e);
        return NextResponse.json({ error: e.message || 'Something went wrong' }, { status: 500 });
    }
}
