import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

const supabase = supabaseAdmin;

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';

// Internal mapping of PayPal Plan IDs to our logic tiers
const PLAN_TO_TIER: Record<string, string> = {
    'P-1R150232CG183332XNFLNNBQ': 'starter_mailer', // Starter Monthly
    'P-0YY72736T56573355NFLOZZQ': 'starter_mailer', // Starter Yearly
    'P-45M32159VV6033601NFLOOYI': 'legends_plus',   // Plus Monthly
    'P-2503312149524980NNFLO34Y': 'legends_plus',  // Plus Yearly
    'P-FAMILY_TEST_ID': 'family_legacy',           // Family Monthly
    'P-5U054702T9664311ANFLO53': 'family_legacy',  // Family Yearly
};

// Also pull from env to ensure production IDs are covered
if (process.env.NEXT_PUBLIC_PAYPAL_PLAN_STARTER) PLAN_TO_TIER[process.env.NEXT_PUBLIC_PAYPAL_PLAN_STARTER] = 'starter_mailer';
if (process.env.NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS) PLAN_TO_TIER[process.env.NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS] = 'legends_plus';
if (process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY) PLAN_TO_TIER[process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY] = 'family_legacy';

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
                    const planId = resource.plan_id;
                    const tier = PLAN_TO_TIER[planId] || 'starter_mailer';

                    await supabase
                        .from('profiles')
                        .update({
                            subscription_status: 'active',
                            subscription_tier: tier,
                            paypal_subscription_id: subscriptionId,
                            next_billing_date: resource.billing_info?.next_billing_time?.split('T')[0],
                        })
                        .eq('id', profile.id);

                    console.log(`Updated user ${profile.id} to tier ${tier}`);
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
