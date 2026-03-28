import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/paypal';
import { getFulfillmentHub } from '@/lib/geo-routing';
import { sendEmail, ADMIN_NEW_ORDER_TEMPLATE } from '@/lib/email';
import { queueSubscriptionConfirmation, cancelAbandonedCheckout } from '@/lib/services/email-triggers';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

const supabase = supabaseAdmin;

async function recordReferralConversion(userId: string, refCode: string, amount: number, orderId: string) {
    const { data: promoter } = await supabase
        .from('promoters')
        .select('*')
        .eq('referral_code', refCode)
        .eq('status', 'approved')
        .single();

    if (promoter) {
        const commission = amount * (Number(promoter.commission_rate) || 0.2);

        await supabase.from('referrals').insert({
            promoter_id: promoter.id,
            order_id: orderId,
            amount: amount,
            commission_amount: commission,
            status: 'pending_payout'
        });

        if (promoter.user_id !== userId) {
            await supabase.rpc('increment_promoter_earnings', {
                row_id: promoter.id,
                amount: commission
            });
            console.log(`[GROWTH] Commission recorded for promoter ${promoter.id} ($${commission})`);
        }
        return { type: 'promoter', id: promoter.id, commission };
    }

    const { data: parent } = await supabase
        .from('users')
        .select('id')
        .eq('my_referral_code', refCode)
        .single();

    if (parent && parent.id !== userId) {
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
        const {
            subscriptionId,
            orderId,
            tier,
            email: reqEmail,
            addGrandparent,
            currency,
            billingCycle,
            shipping,
            hasUpsell,
            hasHeritageStory,
            heritage,
            childName: reqChildName
        } = body;

        if (!subscriptionId && !orderId) {
            return NextResponse.json({ error: 'Missing subscription or order ID' }, { status: 400 });
        }

        const supabaseAuth = createClient();
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
        if (authError) {
            console.error('[PAYMENTS] Session lookup failed:', authError);
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userIdToUpdate = user.id;

        const TRIAL_DAYS = 7;
        const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
        const isFree = tier === 'plan_free_forever';

        const daysToAdd = billingCycle === 'year' ? 365 : 30;
        const nextBillingDate = isFree
            ? new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000)
            : trialEndsAt;

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userIdToUpdate,
                email: reqEmail?.toLowerCase() || undefined,
                subscription_tier: tier,
                subscription_status: isFree ? 'active' : 'trialing',
                paypal_subscription_id: subscriptionId || null,
                currency: currency || 'USD',
                has_grandparent_dashboard: addGrandparent || false,
                subscription_started_at: new Date().toISOString(),
                next_billing_date: nextBillingDate.toISOString().split('T')[0],
                trial_ends_at: isFree ? null : trialEndsAt.toISOString(),
            }, { onConflict: 'id' });

        if (profileError) {
            console.error('Profile update error:', profileError);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        // Also upsert into 'subscriptions' table for new architecture consistency
        if (subscriptionId) {
            await supabase.from('subscriptions').upsert({
                user_id: userIdToUpdate,
                plan_id: tier,
                status: isFree ? 'active' : 'trialing',
                provider: 'paypal',
                provider_subscription_id: subscriptionId,
                current_period_end: nextBillingDate.toISOString(),
            }, { onConflict: 'provider_subscription_id' });
        }

        if (hasUpsell) {
            await supabase.from('digital_possessions').upsert({
                user_id: userIdToUpdate,
                product_id: 'digital_activity_super_pack',
                order_id: subscriptionId || orderId
            }, { onConflict: 'user_id, product_id' });
        }

        if (hasHeritageStory) {
            await supabase.from('digital_possessions').upsert({
                user_id: userIdToUpdate,
                product_id: 'heritage_dna_story',
                order_id: subscriptionId || orderId,
                metadata: { heritage: heritage || 'Caribbean' }
            }, { onConflict: 'user_id, product_id' });
        }

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
                child_name: reqChildName || shipping.name,
                child_age: 5,
                selected_island: heritage || 'explorer',
                metadata: {
                    has_upsell: hasUpsell || false,
                    has_heritage_story: hasHeritageStory || false
                }
            });
        }

        await supabase.from('notifications').insert({
            user_id: userIdToUpdate,
            title: 'Welcome to Likkle Legends!',
            body: isFree
                ? `Your free account is ready. Let's set up your child's profile!`
                : `Your 7-day free trial has started! Explore everything. Your first payment is not until ${trialEndsAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.`,
            notification_type: 'subscription',
            action_url: '/onboarding/child',
        });

        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('email, parent_name')
                .eq('id', userIdToUpdate)
                .single();

            if (profile) {
                await sendEmail({
                    to: 'legends@likklelegends.com',
                    subject: `SALE ALERT: ${tier.toUpperCase()}`,
                    html: ADMIN_NEW_ORDER_TEMPLATE(
                        profile.parent_name || 'New Parent',
                        tier.replace('_', ' ').toUpperCase(),
                        profile.email || 'No Email'
                    )
                });

                await queueSubscriptionConfirmation(
                    profile.email || '',
                    profile.parent_name || 'Legend',
                    tier,
                    reqChildName || 'your child',
                    hasUpsell,
                    hasHeritageStory
                );

                await cancelAbandonedCheckout(profile.email || '');
            }

            const cookieStore = cookies();
            const refCode = cookieStore.get('likkle_ref')?.value;

            if (refCode) {
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
