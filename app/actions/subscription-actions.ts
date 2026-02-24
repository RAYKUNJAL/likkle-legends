"use server";

import { supabase } from '@/lib/storage';
import { hasFeatureAccess, SubscriptionTier } from '@/lib/feature-access';

/**
 * Get user's subscription info
 */
export async function getUserSubscriptionAction(userId: string) {
    try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(userId);
        if (authError) throw authError;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, subscription_tier, subscription_status, trial_ends_at')
            .eq('id', userId)
            .single();

        if (profileError) throw profileError;

        return {
            success: true,
            subscription: {
                tier: (profile.subscription_tier as SubscriptionTier) || 'free',
                status: profile.subscription_status,
                trial_ends_at: profile.trial_ends_at
            }
        };
    } catch (error) {
        console.error('[SubscriptionAction] Error fetching subscription:', error);
        return {
            success: false,
            error: 'Failed to fetch subscription info'
        };
    }
}

/**
 * Track free tier story usage
 */
export async function trackStoryUsageAction(userId: string, childId: string, storyId: string) {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', userId)
            .single();

        if (!profile) return { success: false, error: 'User not found' };

        // Only track for free tier
        if (profile.subscription_tier !== 'free') {
            return { success: true, unlimited: true };
        }

        // Record story usage
        const today = new Date().toISOString().split('T')[0];
        const { data: usage, error: fetchError } = await supabase
            .from('story_usage')
            .select('count')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        const count = usage?.count || 0;

        if (count >= 3) {
            return {
                success: false,
                error: 'Daily story limit reached',
                limit_reached: true,
                remaining: 0
            };
        }

        // Update or insert usage record
        if (usage) {
            await supabase
                .from('story_usage')
                .update({ count: count + 1 })
                .eq('user_id', userId)
                .eq('date', today);
        } else {
            await supabase
                .from('story_usage')
                .insert({
                    user_id: userId,
                    child_id: childId,
                    story_id: storyId,
                    date: today,
                    count: 1
                });
        }

        return {
            success: true,
            remaining: 3 - (count + 1),
            unlimited: false
        };
    } catch (error) {
        console.error('[StoryUsageAction] Error tracking usage:', error);
        return {
            success: false,
            error: 'Failed to track story usage'
        };
    }
}

/**
 * Check if feature is available for user
 */
export async function checkFeatureAccessAction(userId: string, featureKey: string) {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', userId)
            .single();

        if (!profile) {
            return { success: false, error: 'User not found' };
        }

        const tier = profile.subscription_tier as SubscriptionTier || 'free';
        const hasAccess = hasFeatureAccess(tier, featureKey);

        return {
            success: true,
            has_access: hasAccess,
            tier,
            feature: featureKey
        };
    } catch (error) {
        console.error('[FeatureAccessAction] Error:', error);
        return {
            success: false,
            error: 'Failed to check feature access'
        };
    }
}

/**
 * Upgrade user subscription
 */
export async function upgradeSubscriptionAction(userId: string, newTier: SubscriptionTier) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                subscription_tier: newTier,
                subscription_status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            message: `Successfully upgraded to ${newTier}`,
            subscription: data
        };
    } catch (error) {
        console.error('[UpgradeAction] Error:', error);
        return {
            success: false,
            error: 'Failed to upgrade subscription'
        };
    }
}

/**
 * Cancel subscription
 */
export async function cancelSubscriptionAction(userId: string) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                subscription_tier: 'free',
                subscription_status: 'canceled',
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            message: 'Subscription canceled. You have been downgraded to Free tier.',
            subscription: data
        };
    } catch (error) {
        console.error('[CancelAction] Error:', error);
        return {
            success: false,
            error: 'Failed to cancel subscription'
        };
    }
}
