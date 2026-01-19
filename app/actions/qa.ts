"use server";

import { createClient } from '@supabase/supabase-js';
import { updateChild } from '@/lib/services/children';
import { logActivity } from '@/lib/services/gamification';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * QA ONLY: Simulates adding XP to a child profile
 */
export async function simulateXP(childId: string, amount: number) {
    try {
        const { data: child, error: fetchError } = await supabaseAdmin
            .from('children')
            .select('total_xp, parent_id')
            .eq('id', childId)
            .single();

        if (fetchError || !child) throw fetchError;

        const newXP = (child.total_xp || 0) + amount;

        await supabaseAdmin
            .from('children')
            .update({ total_xp: newXP })
            .eq('id', childId);

        // Log the simulation
        await supabaseAdmin.from('activities').insert({
            child_id: childId,
            profile_id: child.parent_id,
            activity_type: 'qa_simulation',
            xp_earned: amount,
            metadata: { simulated: true, original_xp: child.total_xp }
        });

        return { success: true, newXP };
    } catch (e) {
        console.error('Simulate XP error:', e);
        return { success: false, error: 'Simulation failed' };
    }
}

/**
 * QA ONLY: Toggles a user's subscription tier
 */
export async function simulateTier(profileId: string, tier: string) {
    try {
        await supabaseAdmin
            .from('profiles')
            .update({
                subscription_tier: tier,
                subscription_status: tier === 'free' ? 'inactive' : 'active'
            })
            .eq('id', profileId);

        return { success: true };
    } catch (e) {
        console.error('Simulate Tier error:', e);
        return { success: false, error: 'Tier simulation failed' };
    }
}

/**
 * QA ONLY: Seeds the database with a test user and legend
 */
export async function seedTestData() {
    try {
        const testUserId = '00000000-0000-0000-0000-000000000000'; // Placeholder or real UUID

        // 1. Check if test user exists
        const { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('email', 'test@likklelegends.com').single();

        let userId = existing?.id;

        if (!existing) {
            const { data: newUser, error: userError } = await supabaseAdmin.from('profiles').insert({
                full_name: 'Test Legend Parent',
                email: 'test@likklelegends.com',
                subscription_tier: 'free',
                subscription_status: 'inactive',
                onboarding_completed: true
            }).select().single();

            if (userError) throw userError;
            userId = newUser.id;
        }

        // 2. Add a test child if none exists
        const { data: childCount } = await supabaseAdmin.from('children').select('id').eq('parent_id', userId);

        if (!childCount || childCount.length === 0) {
            await supabaseAdmin.from('children').insert({
                parent_id: userId,
                first_name: 'Kai',
                age: 6,
                total_xp: 0,
                current_level: 1,
                primary_island: 'Jamaica'
            });
        }

        return { success: true };
    } catch (e) {
        console.error('Seed Test Data error:', e);
        return { success: false, error: 'Seeding failed' };
    }
}
