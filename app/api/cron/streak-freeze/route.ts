export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

/**
 * SPRINT 5: Midnight Cron for Auto-Applying Streak Freezes
 *
 * Runs at 00:05 UTC daily.
 * For each child with an active streak but no login for today:
 * - If they have freezes available, auto-apply one
 * - Decrement freeze count
 * - Insert a daily_logins entry marking freeze used
 * - Keep streak intact for tomorrow
 */
export async function GET(request: NextRequest) {
    try {
        // Security: Verify this is a legitimate Vercel cron request
        // In production, Vercel includes an Authorization header with a secret
        const authHeader = request.headers.get('authorization');
        const vercelCronSecret = process.env.VERCEL_CRON_SECRET;

        if (vercelCronSecret && authHeader !== `Bearer ${vercelCronSecret}`) {
            console.warn('Unauthorized cron request');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // 1. Find all children
        const { data: children, error: childrenError } = await supabaseAdmin
            .from('children')
            .select('id, current_streak, last_activity_date')
            .gt('current_streak', 0); // Only active streaks

        if (childrenError) {
            throw new Error(`Failed to fetch children: ${childrenError.message}`);
        }

        if (!children || children.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No children with active streaks',
                processed: 0
            });
        }

        let processed = 0;
        let frozenCount = 0;

        // 2. For each child, check if they missed today
        for (const child of children) {
            // Check if they've already logged in today
            const { data: todayLogin } = await supabaseAdmin
                .from('daily_logins')
                .select('id')
                .eq('child_id', child.id)
                .eq('login_date', today)
                .maybeSingle();

            if (todayLogin) {
                // Already logged in today, skip
                continue;
            }

            // Check if they logged in yesterday (to verify active streak)
            const lastActivityDate = child.last_activity_date?.split('T')[0];

            if (lastActivityDate !== yesterday) {
                // Streak is broken, skip (they didn't log in yesterday either)
                continue;
            }

            processed++;

            // 3. Check if they have freezes available
            const { data: freezeRow } = await supabaseAdmin
                .from('streak_freezes')
                .select('id, freeze_count')
                .eq('child_id', child.id)
                .maybeSingle();

            if (!freezeRow || freezeRow.freeze_count <= 0) {
                // No freezes available, streak will be broken
                continue;
            }

            frozenCount++;

            // 4. Auto-apply freeze
            const newFreezeCount = freezeRow.freeze_count - 1;

            // Decrement freeze count
            await supabaseAdmin.from('streak_freezes').update({
                freeze_count: newFreezeCount,
                updated_at: new Date().toISOString(),
            }).eq('id', freezeRow.id);

            // Insert a "frozen day" login entry
            // Mark with xp_awarded: 0, streak_day: -1 (indicator that freeze was applied)
            // This allows the portal to show "❄️ Streak Freeze Used Today" UI
            try {
                const { error: insertError } = await supabaseAdmin.from('daily_logins').insert({
                    child_id: child.id,
                    login_date: today,
                    xp_awarded: 0,
                    streak_day: child.current_streak, // Keep same streak number for tomorrow
                    badge_earned: null,
                    freeze_used: true, // Flag to indicate freeze was used
                });

                if (insertError) throw insertError;
            } catch (err) {
                // Fallback: Insert without freeze_used flag (if column doesn't exist)
                await supabaseAdmin.from('daily_logins').insert({
                    child_id: child.id,
                    login_date: today,
                    xp_awarded: 0,
                    streak_day: child.current_streak,
                    badge_earned: null,
                });
            }

            console.log(`✅ Auto-froze streak for child ${child.id} (${newFreezeCount} freezes remaining)`);
        }

        return NextResponse.json({
            success: true,
            message: `Processed ${processed} children at risk of breaking streak`,
            frozen: frozenCount,
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('Streak Freeze Cron Error:', error);
        return NextResponse.json({
            error: error.message || 'Unknown error',
            timestamp: new Date().toISOString(),
        }, { status: 500 });
    }
}
