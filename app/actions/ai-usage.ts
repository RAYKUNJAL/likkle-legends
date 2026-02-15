"use server";

import { createAdminClient } from "@/lib/admin";
import { siteContent } from "@/lib/content";

/**
 * AI Usage Limits Configuration (aligned with app_spec_v2.json)
 */
const AI_LIMITS: Record<string, number> = {
    'plan_free_forever': 2,
    'plan_digital_legends': 20,
    'plan_mail_intro': 20,
    'plan_legends_plus': 50,
    'plan_family_legacy': 100,
    'educator': 1000 // Higher limit for educators
};

/**
 * Check if a user has sufficient credits for AI usage this month
 */
export async function checkAIUsage(userId: string, feature: string = 'story_studio') {
    const supabase = createAdminClient();

    // 1. Get User's Subscription/Tier
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan_id, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

    // 2. Check if User is a Verified Educator
    const { data: educator } = await supabase
        .from('educator_accounts')
        .select('verified')
        .eq('user_id', userId)
        .eq('verified', true)
        .single();

    const planId = educator ? 'educator' : (subscription?.plan_id || 'plan_free_forever');
    const limit = AI_LIMITS[planId] || AI_LIMITS['plan_free_forever'];

    // 3. Count usage for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
        .from('ai_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('feature', feature)
        .gte('used_at', startOfMonth.toISOString());

    if (error) {
        console.error("Usage check error:", error);
        return { allowed: false, error: "System busy checking credits" };
    }

    const currentCount = count || 0;
    const remaining = Math.max(0, limit - currentCount);

    return {
        allowed: currentCount < limit,
        limit,
        current: currentCount,
        remaining,
        planId
    };
}

/**
 * Record a successful AI usage event
 */
export async function logAIUsage(userId: string, feature: string = 'story_studio', metadata: any = {}) {
    const supabase = createAdminClient();

    const { error } = await supabase
        .from('ai_usage')
        .insert([{
            user_id: userId,
            feature,
            metadata: {
                ...metadata,
                timestamp: new Date().toISOString()
            }
        }]);

    if (error) {
        console.error("Failed to log AI usage:", error);
        return { success: false };
    }

    return { success: true };
}
