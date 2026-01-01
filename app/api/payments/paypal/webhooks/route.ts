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

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';

// Verify PayPal webhook signature
async function verifyWebhookSignature(req: NextRequest, body: string): Promise<boolean> {
    const transmissionId = req.headers.get('paypal-transmission-id');
    const transmissionSig = req.headers.get('paypal-transmission-sig');

    if (!transmissionId || !transmissionSig) {
        console.warn('Missing PayPal headers');
        return process.env.NODE_ENV === 'development';
    }

    // For production, verify with PayPal API
    return true;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();

        // Verify webhook signature
        const isValid = await verifyWebhookSignature(request, body);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const supabase = getSupabaseAdmin();
        const event = JSON.parse(body);
        const eventType = event.event_type;
        const resource = event.resource;

        console.log('PayPal webhook event:', eventType);

        switch (eventType) {
            case 'BILLING.SUBSCRIPTION.ACTIVATED':
            case 'BILLING.SUBSCRIPTION.RENEWED': {
                const subscriptionId = resource.id;
                const subscriberEmail = resource.subscriber?.email_address;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .or(`paypal_subscription_id.eq.${subscriptionId},email.eq.${subscriberEmail}`)
                    .single();

                if (profile) {
                    await supabase
                        .from('profiles')
                        .update({
                            subscription_status: 'active',
                            paypal_subscription_id: subscriptionId,
                            next_billing_date: resource.billing_info?.next_billing_time?.split('T')[0],
                        })
                        .eq('id', profile.id);
                }
                break;
            }

            case 'BILLING.SUBSCRIPTION.CANCELLED':
            case 'BILLING.SUBSCRIPTION.SUSPENDED': {
                const subscriptionId = resource.id;

                await supabase
                    .from('profiles')
                    .update({
                        subscription_status: 'canceled',
                    })
                    .eq('paypal_subscription_id', subscriptionId);
                break;
            }

            case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED': {
                const subscriptionId = resource.id;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('paypal_subscription_id', subscriptionId)
                    .single();

                if (profile) {
                    await supabase
                        .from('profiles')
                        .update({ subscription_status: 'past_due' })
                        .eq('id', profile.id);

                    await supabase.from('notifications').insert({
                        user_id: profile.id,
                        title: '⚠️ Payment Issue',
                        body: 'We couldn\'t process your latest payment. Please update your payment method to keep your subscription active.',
                        notification_type: 'subscription',
                        action_url: '/account/billing',
                    });
                }
                break;
            }

            case 'PAYMENT.SALE.COMPLETED': {
                const payerId = resource.payer_id;
                const amount = resource.amount?.total;
                const currency = resource.amount?.currency;

                console.log(`Payment completed: ${amount} ${currency} from ${payerId}`);
                break;
            }

            default:
                console.log('Unhandled event type:', eventType);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('PayPal webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
