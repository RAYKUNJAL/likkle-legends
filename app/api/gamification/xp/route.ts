import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { XP_ACTIONS, calculateLevel, BADGES, LEVELS } from '@/lib/gamification';

const client = supabaseAdmin;

// Award XP to a child
export async function POST(request: NextRequest) {
    try {
        // Verify caller is authenticated
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { child_id, action, metadata } = body;

        if (!child_id || !action) {
            return NextResponse.json({ error: 'Missing child_id or action' }, { status: 400 });
        }

        const xpAmount = XP_ACTIONS[action as keyof typeof XP_ACTIONS];
        if (xpAmount === undefined) {
            return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
        }

        const client = supabaseAdmin;

        // Get current child data — also fetch parent_id for ownership check
        const { data: child, error: childError } = await client
            .from('children')
            .select('total_xp, current_streak, last_activity_date, parent_id')
            .eq('id', child_id)
            .single();

        if (childError || !child) {
            return NextResponse.json({ error: 'Child not found' }, { status: 404 });
        }

        // Verify the child belongs to the authenticated parent
        if (child.parent_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Calculate new XP
        const newTotalXP = (child.total_xp || 0) + xpAmount;

        // Calculate streak
        const today = new Date().toISOString().split('T')[0];
        const lastActivity = child.last_activity_date;
        let newStreak = child.current_streak || 0;

        if (lastActivity !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastActivity === yesterdayStr) {
                newStreak += 1;
            } else {
                newStreak = 1;
            }
        }

        // Determine new level
        const oldLevel = calculateLevel(child.total_xp || 0);
        const newLevel = calculateLevel(newTotalXP);
        const leveledUp = newLevel.level > oldLevel.level;

        // Update child record
        const { error: updateError } = await client
            .from('children')
            .update({
                total_xp: newTotalXP,
                current_streak: newStreak,
                last_activity_date: today,
            })
            .eq('id', child_id);

        if (updateError) {
            console.error('Update error:', updateError);
            return NextResponse.json({ error: 'Failed to update XP' }, { status: 500 });
        }

        // Log the XP event (if xp_events table exists)
        try {
            await client.from('xp_events').insert({
                child_id,
                action,
                xp_amount: xpAmount,
                metadata,
            });
        } catch {
            // Table might not exist, continue
        }

        // Create level-up notification if applicable
        if (leveledUp) {
            // Reuse parent_id already fetched above — no extra query needed
            if (child.parent_id) {
                await client.from('notifications').insert({
                    user_id: child.parent_id,
                    title: `🎉 ${newLevel.icon} Level Up!`,
                    body: `Your child reached Level ${newLevel.level}: ${newLevel.name}!`,
                    notification_type: 'achievement',
                    action_url: '/analytics',
                });
            }
        }

        return NextResponse.json({
            success: true,
            xp_earned: xpAmount,
            total_xp: newTotalXP,
            streak: newStreak,
            level: newLevel,
            leveled_up: leveledUp,
        });
    } catch (error) {
        console.error('XP award error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Get child's XP and progress
export async function GET(request: NextRequest) {
    try {
        // Verify caller is authenticated
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const childId = searchParams.get('child_id');

        if (!childId) {
            return NextResponse.json({ error: 'Missing child_id' }, { status: 400 });
        }

        const client = supabaseAdmin;

        // Get child data — include parent_id for ownership check
        const { data: child, error: childError } = await client
            .from('children')
            .select('id, first_name, total_xp, current_streak, last_activity_date, parent_id')
            .eq('id', childId)
            .single();

        if (childError || !child) {
            return NextResponse.json({ error: 'Child not found' }, { status: 404 });
        }

        if (child.parent_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const level = calculateLevel(child.total_xp || 0);

        return NextResponse.json({
            child_id: child.id,
            name: child.first_name,
            total_xp: child.total_xp || 0,
            streak: child.current_streak || 0,
            level,
        });
    } catch (error) {
        console.error('XP fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
