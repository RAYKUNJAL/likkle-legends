import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/paypal';
import { getFulfillmentHub } from '@/lib/geo-routing';
import { sendEmail, ADMIN_NEW_ORDER_TEMPLATE } from '@/lib/email';
import { cookies } from 'next/headers';

const supabase = supabaseAdmin;

async function recordReferralConversion(userId: string, refCode: string, amount: number, orderId: string) {
    // 1. Check if it's a PROMOTER code
    const { data: promoter } = await supabase
        .from('promoters')
        .select('*')
        .eq('referral_code', refCode)
        .eq('status', 'approved')
        .single();

    if (promoter) {
        // Calculate Commission (e.g. 20%)
        const commission = amount * (Number(promoter.commission_rate) || 0.2);

        // Record Referral
        await supabase.from('referrals').insert({
            promoter_id: promoter.id,
            order_id: orderId,
            amount: amount,
            commission_amount: commission,
            status: 'pending_payout'
        });

        // Update Promoter Earnings
        if (promoter.user_id !== userId) {
            await supabase.rpc('increment_promoter_earnings', {
                row_id: promoter.id,
                amount: commission
            });
            console.log(`[GROWTH] Commission recorded for promoter ${promoter.id} ($${commission})`);
        }
        return { type: 'promoter', id: promoter.id, commission };
    }

    // 2. Check if it's a PARENT referral code
    const { data: parent } = await supabase
        .from('users')
        .select('id')
        .eq('my_referral_code', refCode)
        .single();

    if (parent && parent.id !== userId) {
        // Create a pending credit for the parent
        await supabase
            .from('referral_credits')
            .insert({
                user_id: parent.id,
                referred_user_id: userId,
                reward_type: 'subscription_credit',
                status: 'pending',
                order_id: orderId
            });

        console.log(`[GROWTH] Parent referral credit recorded for ${parent.id} via user ${userId}`);
        return { type: 'parent', id: parent.id };
    }

    return null;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subscriptionId, orderId, tier, addGrandparent, currency, userId, billingCycle, shipping } = body;

        if (!subscriptionId && !orderId) {
            return NextResponse.json({ error: 'Missing subscription or order ID' }, { status: 400 });
        }


        // Authenticate user via Bearer token ONLY — no body userId fallback
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const userIdToUpdate = user.id;

        // 7-day free trial: first billing is delayed by 7 days via start_time in PayPal SDK
        const TRIAL_DAYS = 7;
        const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
        const isFree = tier === 'plan_free_forever';

        // After trial, billing resumes on the normal cycle
        const daysToAdd = billingCycle === 'year' ? 365 : 30;
        const nextBillingDate = isFree
            ? new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000)
            : trialEndsAt;

        // Update user profile with subscription info
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                subscription_tier: tier,
                // Paid plans start in 'trialing' — upgrade to 'active' via webhook on first payment
                subscription_status: isFree ? 'active' : 'trialing',
                paypal_subscription_id: subscriptionId || null,
                currency: currency || 'USD',
                has_grandparent_dashboard: addGrandparent || false,
                subscription_started_at: new Date().toISOString(),
                next_billing_date: nextBillingDate.toISOString().split('T')[0],
                trial_ends_at: isFree ? null : trialEndsAt.toISOString(),
            })
            .eq('id', userIdToUpdate);

        if (profileError) {
            console.error('Profile update error:', profileError);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        // Create initial order if this is a mail-based plan
        if (shipping && tier !== 'plan_free_forever' && tier !== 'plan_digital_legends') {
            const plan = SUBSCRIPTION_PLANS[tier as SubscriptionTier];
            const price = billingCycle === 'year' ? (plan?.priceYearly || 0) : (plan?.price || 0);
            const hub = getFulfillmentHub(shipping.country);

            await supabase.from('orders').insert({
                profile_id: userIdToUpdate,
                tier: tier,
                amount_cents: Math.round(price * 100),
                currency: currency || 'USD',
                shipping_name: shipping.name,
                shipping_address_line1: shipping.line1,
                shipping_address_line2: shipping.line2,
                shipping_city: shipping.city,
                shipping_state: shipping.state,
                shipping_postal_code: shipping.postalCode,
                shipping_country: shipping.country,
                fulfillment_hub: hub,
                fulfillment_status: 'pending',
                child_name: shipping.name, // Fallback to shipping name if child name not passed
                child_age: 5, // Default
                selected_island: 'explorer', // Default
            });
        }

        // Create a notification for the user
        await supabase.from('notifications').insert({
            user_id: userIdToUpdate,
            title: '🎉 Welcome to Likkle Legends!',
            body: isFree
                ? `Your free account is ready. Let's set up your child's profile!`
                : `Your 7-day free trial has started! Explore everything — your first payment isn't until ${trialEndsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`,
            notification_type: 'subscription',
            action_url: '/onboarding/child',
        });

        // 4. Send Admin Alert Email
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('email, parent_name')
                .eq('id', userIdToUpdate)
                .single();

            if (profile) {
                await sendEmail({
                    to: 'legends@likklelegends.com', // Admin inbox
                    subject: `🚀 SALE ALERT: ${tier.toUpperCase()}`,
                    html: ADMIN_NEW_ORDER_TEMPLATE(
                        profile.parent_name || "New Parent",
                        tier.replace('_', ' ').toUpperCase(),
                        profile.email || "No Email"
                    )
                });
            }

            // 5. PROCESS GROWTH ENGINE / REFERRALS
            const cookieStore = cookies();
            const refCode = cookieStore.get('likkle_ref')?.value;

            if (refCode) {
                // Determine amount (trial is 0, others have price)
                const plan = SUBSCRIPTION_PLANS[tier as SubscriptionTier];
                const price = billingCycle === 'year' ? (plan?.priceYearly || 0) : (plan?.price || 0);

                if (price > 0) {
                    await recordReferralConversion(userIdToUpdate, refCode, price, subscriptionId || orderId || 'unknown');
                }
            }

        } catch (alertErr) {
            console.error('[ADMIN/GROWTH] Failed post-processing:', alertErr);
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription confirmed',
            tier,
            subscriptionId: subscriptionId || orderId,
        });
    } catch (error) {
        console.error('PayPal confirmation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
