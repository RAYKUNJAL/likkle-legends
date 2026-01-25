import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/paypal';
import { getFulfillmentHub } from '@/lib/geo-routing';

const supabase = supabaseAdmin;

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
