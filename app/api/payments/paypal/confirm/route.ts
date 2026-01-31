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
        // FRAUD CHECK: Prevent self-referral
        if (promoter.user_id !== userId) {
            await supabase.rpc('increment_promoter_earnings', {
                row_id: promoter.id,
                amount: commission
            });
            console.log(`[GROWTH] Commission recorded for promoter ${promoter.id} ($${commission})`);
        } else {
            console.warn(`[GROWTH] Self-referral detected. Commission blocked for ${userId}`);
        }

        return { type: 'promoter', id: promoter.id, commission };
    }

    // 2. Check if it's a PARENT code (via user_metadata)
    // We search profiles to find who owns this code
    // Note: This requires a new index or query on profiles if we stored it in metadata.
    // Ideally we'd have a 'referral_codes' table mapping code -> user_id, 
    // but for MVP we might search auth.users or profiles if we promoted it to a column.
    // For now, let's assume we can lookup by a column 'my_referral_code' on profiles if added, 
    // OR we scan a lookup table. 
    // Let's rely on the `referral_credits` logic which uses `referrer_id`.

    // **FIX**: Since `my_referral_code` isn't an indexed column yet, we skip this for now 
    // unless we added it to `profiles`. 
    // Actually, let's query `promoters` table for "parents" too if we treat them as lightweight promoters?
    // No, parents get credits.

    // To make this robust without schema changes on `profiles`, we'll assume 
    // Parent Codes are just User IDs or we use a separate lookup table.
    // For "Give $10/Get Month", let's pause parent attribution here until we migrate usage 
    // to a proper lookup table or robust query.
    // We will stick to PROMOTER attribution first as that's the "Million Dollar" revenue driver.
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subscriptionId, orderId, tier, addGrandparent, currency, userId, billingCycle, shipping } = body;

        if (!subscriptionId && !orderId) {
            return NextResponse.json({ error: 'Missing subscription or order ID' }, { status: 400 });
        }


        // Get user from session or body
        const authHeader = request.headers.get('Authorization');
        let userIdToUpdate = userId;

        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) {
                userIdToUpdate = user.id;
            }
        }

        if (!userIdToUpdate) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        // Calculate next billing date based on cycle
        const daysToAdd = billingCycle === 'year' ? 365 : 30;
        const nextBillingDate = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);

        // Update user profile with subscription info
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                subscription_tier: tier,
                subscription_status: 'active',
                paypal_subscription_id: subscriptionId || null,
                currency: currency || 'USD',
                has_grandparent_dashboard: addGrandparent || false,
                subscription_started_at: new Date().toISOString(),
                next_billing_date: nextBillingDate.toISOString().split('T')[0],
            })
            .eq('id', userIdToUpdate);

        if (profileError) {
            console.error('Profile update error:', profileError);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
        }

        // Create initial order if this is a mail-based plan
        if (shipping && tier !== 'trial_access') {
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
            body: `Your ${tier.replace('_', ' ')} subscription is now active. Let's set up your child's profile!`,
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
