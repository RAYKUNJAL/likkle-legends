"use server";

import { supabase } from '@/lib/storage';
import { hasFeatureAccess, SubscriptionTier } from '@/lib/feature-access';
import { cancelPayPalSubscription, updatePayPalSubscriptionPlan } from '@/lib/paypal-api';
import { SUBSCRIPTION_PLANS } from '@/lib/paypal';

/**
 * Get user's subscription info
 */
export async function getUserSubscriptionAction(userId: string) {
    try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.admin.getUserById(userId);
        if (authError) throw authError;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, subscription_tier, subscription_status, trial_ends_at, paypal_subscription_id')
            .eq('id', userId)
            .single();

        if (profileError) throw profileError;

        return {
            success: true,
            subscription: {
                tier: (profile.subscription_tier as SubscriptionTier) || 'free',
                status: profile.subscription_status,
                trial_ends_at: profile.trial_ends_at,
                paypal_subscription_id: profile.paypal_subscription_id
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
 * CRITICAL: Must call PayPal API FIRST to update the subscription plan
 * Only updates local DB AFTER PayPal confirms the change
 */
export async function upgradeSubscriptionAction(userId: string, newTier: SubscriptionTier) {
    try {
        // 1. Fetch current subscription info from DB
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('id, subscription_tier, subscription_status, paypal_subscription_id')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            throw new Error('User profile not found');
        }

        const currentTier = profile.subscription_tier as SubscriptionTier;
        const paypalSubscriptionId = profile.paypal_subscription_id;

        // 2. Validate tier change (must be upgrade, not same tier)
        if (currentTier === newTier) {
            return {
                success: false,
                error: 'Cannot upgrade to the same tier'
            };
        }

        // 3. Get PayPal plan IDs for both tiers
        const newPlan = SUBSCRIPTION_PLANS[newTier];
        if (!newPlan || !newPlan.paypalPlanId) {
            return {
                success: false,
                error: 'Invalid subscription tier'
            };
        }

        // 4. If user has no PayPal subscription yet, cannot upgrade
        if (!paypalSubscriptionId) {
            return {
                success: false,
                error: 'No active PayPal subscription found. Please create a subscription first.'
            };
        }

        // 5. Call PayPal API to update the subscription plan
        console.log(`[Upgrade] Calling PayPal to upgrade ${paypalSubscriptionId} from ${currentTier} to ${newTier}`);

        try {
            await updatePayPalSubscriptionPlan(paypalSubscriptionId, newPlan.paypalPlanId);
        } catch (paypalError: any) {
            console.error('[Upgrade] PayPal API failed:', paypalError);
            return {
                success: false,
                error: `PayPal upgrade failed: ${paypalError.message}. Please try again or contact support.`
            };
        }

        // 6. PayPal confirmed, now update local DB
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
                subscription_tier: newTier,
                subscription_status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (updateError) {
            console.error('[Upgrade] Local DB update failed after PayPal confirmed. This is a serious issue:', updateError);
            throw updateError;
        }

        console.log(`[Upgrade] Successfully upgraded user ${userId} to ${newTier}`);

        return {
            success: true,
            message: `Successfully upgraded to ${newTier}`,
            subscription: updatedProfile
        };
    } catch (error: any) {
        console.error('[UpgradeAction] Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to upgrade subscription'
        };
    }
}

/**
 * Cancel subscription
 * CRITICAL FIX: Must call PayPal API FIRST to actually cancel the subscription
 * Only updates local DB AFTER PayPal confirms the cancellation
 *
 * BUG PREVENTION: If PayPal cancellation fails, local DB is NOT updated,
 * preventing the scenario where users are canceled locally but charged by PayPal.
 */
export async function cancelSubscriptionAction(userId: string) {
    try {
        // 1. Fetch current subscription info from DB
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('id, subscription_tier, subscription_status, paypal_subscription_id')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            return {
                success: false,
                error: 'User profile not found'
            };
        }

        // 2. Check if already canceled
        if (profile.subscription_status === 'canceled') {
            return {
                success: false,
                error: 'Subscription is already canceled'
            };
        }

        // 3. Check if on free tier (already canceled)
        if (profile.subscription_tier === 'free') {
            return {
                success: false,
                error: 'User is already on the free tier'
            };
        }

        const paypalSubscriptionId = profile.paypal_subscription_id;

        // 4. If no PayPal subscription ID, just update to free tier (no charges)
        if (!paypalSubscriptionId) {
            console.log(`[Cancel] No PayPal subscription found for ${userId}, downgrading to free tier only`);

            const { data: updatedProfile, error: updateError } = await supabase
                .from('profiles')
                .update({
                    subscription_tier: 'free',
                    subscription_status: 'canceled',
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (updateError) throw updateError;

            return {
                success: true,
                message: 'Subscription canceled. You have been downgraded to Free tier.',
                subscription: updatedProfile
            };
        }

        // 5. Call PayPal API to ACTUALLY cancel the subscription
        console.log(`[Cancel] Calling PayPal to cancel subscription ${paypalSubscriptionId} for user ${userId}`);

        try {
            await cancelPayPalSubscription(paypalSubscriptionId);
        } catch (paypalError: any) {
            console.error('[Cancel] PayPal API cancellation failed:', paypalError);
            return {
                success: false,
                error: `PayPal cancellation failed: ${paypalError.message}. Please try again or contact support. Your subscription has NOT been canceled.`
            };
        }

        // 6. PayPal confirmed cancellation, now update local DB
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
                subscription_tier: 'free',
                subscription_status: 'canceled',
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (updateError) {
            console.error('[Cancel] Local DB update failed after PayPal confirmed. This is a serious issue:', updateError);
            throw updateError;
        }

        console.log(`[Cancel] Successfully canceled subscription for user ${userId}`);

        return {
            success: true,
            message: 'Subscription canceled. You have been downgraded to Free tier.',
            subscription: updatedProfile
        };
    } catch (error: any) {
        console.error('[CancelAction] Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to cancel subscription'
        };
    }
}

/**
 * Downgrade subscription to a lower tier
 * CRITICAL: Must call PayPal API FIRST to update the subscription plan
 * Only updates local DB AFTER PayPal confirms the change
 */
export async function downgradeSubscriptionAction(userId: string, newTier: SubscriptionTier) {
    try {
        // 1. Fetch current subscription info from DB
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('id, subscription_tier, subscription_status, paypal_subscription_id')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) {
            throw new Error('User profile not found');
        }

        const currentTier = profile.subscription_tier as SubscriptionTier;
        const paypalSubscriptionId = profile.paypal_subscription_id;

        // 2. Validate tier change
        if (currentTier === newTier) {
            return {
                success: false,
                error: 'Cannot downgrade to the same tier'
            };
        }

        // 3. If downgrading to free, just cancel
        if (newTier === 'free') {
            return await cancelSubscriptionAction(userId);
        }

        // 4. Get PayPal plan ID for new tier
        const newPlan = SUBSCRIPTION_PLANS[newTier];
        if (!newPlan || !newPlan.paypalPlanId) {
            return {
                success: false,
                error: 'Invalid subscription tier'
            };
        }

        // 5. If user has no PayPal subscription yet, cannot downgrade
        if (!paypalSubscriptionId) {
            return {
                success: false,
                error: 'No active PayPal subscription found'
            };
        }

        // 6. Call PayPal API to update the subscription plan
        console.log(`[Downgrade] Calling PayPal to downgrade ${paypalSubscriptionId} from ${currentTier} to ${newTier}`);

        try {
            await updatePayPalSubscriptionPlan(paypalSubscriptionId, newPlan.paypalPlanId);
        } catch (paypalError: any) {
            console.error('[Downgrade] PayPal API failed:', paypalError);
            return {
                success: false,
                error: `PayPal downgrade failed: ${paypalError.message}. Please try again or contact support.`
            };
        }

        // 7. PayPal confirmed, now update local DB
        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
                subscription_tier: newTier,
                subscription_status: 'active',
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (updateError) {
            console.error('[Downgrade] Local DB update failed after PayPal confirmed. This is a serious issue:', updateError);
            throw updateError;
        }

        console.log(`[Downgrade] Successfully downgraded user ${userId} to ${newTier}`);

        return {
            success: true,
            message: `Successfully downgraded to ${newTier}`,
            subscription: updatedProfile
        };
    } catch (error: any) {
        console.error('[DowngradeAction] Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to downgrade subscription'
        };
    }
}
