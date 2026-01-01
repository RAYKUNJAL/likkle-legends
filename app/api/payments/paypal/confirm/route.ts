import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
    if (!supabaseAdmin) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !key) {
            throw new Error('Missing Supabase environment variables');
        }

        supabaseAdmin = createClient(url, key);
    }
    return supabaseAdmin;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { subscriptionId, orderId, tier, addGrandparent, currency, userId, billingCycle } = body;

        if (!subscriptionId && !orderId) {
            return NextResponse.json({ error: 'Missing subscription or order ID' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

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
                // Note: billing_cycle column might not exist yet, but passing it is fine if we add it or just relying on next_billing_date
            })
            .eq('id', userIdToUpdate);

        if (profileError) {
            console.error('Profile update error:', profileError);
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
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
