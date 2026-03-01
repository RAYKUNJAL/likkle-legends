import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { sendEmail, SUBSCRIPTION_CONFIRMATION_TEMPLATE } from '@/lib/email';

const supabase = supabaseAdmin;

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';

// Internal mapping of PayPal Plan IDs to our logic tiers
const PLAN_TO_TIER: Record<string, string> = {
    'P-0LU582199P7741420NGQA4JI': 'digital_legends', // Digital Legends Monthly
    'P-9Y7503296X038324YNGN72CI': 'starter_mailer',  // Island Starter Monthly (current)
    'P-1R150232CG183332XNFLNNBQ': 'starter_mailer',  // Starter Monthly (legacy)
    'P-0YY72736T56573355NFLOZZQ': 'starter_mailer',  // Starter Yearly
    'P-45M32159VV6033601NFLOOYI': 'legends_plus',    // Legends Plus Monthly
    'P-2503312149524980NNFLO34Y': 'legends_plus',    // Legends Plus Yearly
    'P-9MP32022V70125639NFLT4IA': 'family_legacy',   // Family Legacy Monthly (current)
    'P-4G842008M1421443UNFLO3MY': 'family_legacy',   // Family Legacy Monthly (legacy)
    'P-5U054702T9664311ANFLO53A': 'family_legacy',   // Family Yearly (current)
    'P-5U054702T9664311ANFLO53': 'family_legacy',    // Family Yearly (legacy)
};

// Also pull from env to ensure production IDs are covered
if (process.env.NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL) PLAN_TO_TIER[process.env.NEXT_PUBLIC_PAYPAL_PLAN_DIGITAL] = 'digital_legends';
if (process.env.NEXT_PUBLIC_PAYPAL_PLAN_STARTER) PLAN_TO_TIER[process.env.NEXT_PUBLIC_PAYPAL_PLAN_STARTER] = 'starter_mailer';
if (process.env.NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS) PLAN_TO_TIER[process.env.NEXT_PUBLIC_PAYPAL_PLAN_LEGENDS] = 'legends_plus';
if (process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY) PLAN_TO_TIER[process.env.NEXT_PUBLIC_PAYPAL_PLAN_FAMILY] = 'family_legacy';

// Verify PayPal webhook signature via PayPal API
async function verifyWebhookSignature(req: NextRequest, body: string): Promise<boolean> {
    const transmissionId = req.headers.get('paypal-transmission-id');
    const transmissionTime = req.headers.get('paypal-transmission-time');
    const transmissionSig = req.headers.get('paypal-transmission-sig');
    const certUrl = req.headers.get('paypal-cert-url');
    const authAlgo = req.headers.get('paypal-auth-algo');

    if (!transmissionId || !transmissionSig || !transmissionTime || !certUrl || !authAlgo) {
        console.warn('Missing PayPal webhook headers — rejecting request');
        return false;
    }

    if (!PAYPAL_WEBHOOK_ID) {
        console.error('PAYPAL_WEBHOOK_ID is not configured — cannot verify webhook');
        return false;
    }

    try {
        const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
        const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
            console.error('PayPal credentials missing for webhook verification');
            return false;
        }

        // Get OAuth token
        const authResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });
        const authData = await authResponse.json();

        if (!authData.access_token) {
            console.error('Failed to get PayPal OAuth token for webhook verification');
            return false;
        }

        // Verify signature
        const verifyResponse = await fetch('https://api-m.paypal.com/v1/notifications/verify-webhook-signature', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authData.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                auth_algo: authAlgo,
                cert_url: certUrl,
                transmission_id: transmissionId,
                transmission_sig: transmissionSig,
                transmission_time: transmissionTime,
                webhook_id: PAYPAL_WEBHOOK_ID,
                webhook_event: JSON.parse(body),
            }),
        });

        const verifyData = await verifyResponse.json();
        const isValid = verifyData.verification_status === 'SUCCESS';

        if (!isValid) {
            console.warn('PayPal webhook signature verification FAILED:', verifyData);
        }

        return isValid;
    } catch (error) {
        console.error('PayPal webhook verification error:', error);
        return false;
    }
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
                    .select('id, parent_name, email')
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

                    // Fetch child name for personalized email
                    const { data: child } = await supabase
                        .from('children')
                        .select('first_name')
                        .eq('parent_id', profile.id)
                        .limit(1)
                        .maybeSingle();

                    // Send Branded Confirmation Email
                    await sendEmail({
                        to: profile.email || subscriberEmail,
                        subject: "You're Offially in the Club! 🌴",
                        html: SUBSCRIPTION_CONFIRMATION_TEMPLATE(
                            profile.parent_name || "Legend Parent",
                            tier.replace('_', ' ').toUpperCase(),
                            child?.first_name || "your little legend"
                        )
                    });
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
