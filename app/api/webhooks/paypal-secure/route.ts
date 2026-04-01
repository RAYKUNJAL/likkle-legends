import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_KEY || '');

// PayPal base URL
const PAYPAL_BASE =
  process.env.PAYPAL_ENV === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

// Get PayPal access token for webhook verification
async function getPayPalAccessToken(): Promise<string> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('Missing PayPal credentials for webhook verification');
  }
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    throw new Error(`PayPal token error: ${res.status}`);
  }
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

// Verify PayPal webhook signature using PayPal's verification API
async function verifyPayPalSignature(
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  authAlgo: string,
  transmissionSig: string,
  webhookBody: string
): Promise<boolean> {
  try {
    const webhookId = PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
      console.error('[SECURITY] PAYPAL_WEBHOOK_ID not configured - rejecting webhook');
      return false;
    }

    // Validate all required headers are present
    if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
      console.error('[SECURITY] PayPal webhook: missing required signature headers - rejecting');
      return false;
    }

    // Validate cert URL is from PayPal domain (prevent SSRF attacks)
    let certHostname: string;
    try {
      certHostname = new URL(certUrl).hostname;
    } catch {
      console.error('[SECURITY] PayPal webhook: cert URL is invalid - rejecting');
      return false;
    }

    if (!certHostname.endsWith('.paypal.com') && certHostname !== 'paypal.com') {
      console.error(`[SECURITY] PayPal webhook: cert URL is not from paypal.com domain (${certHostname}) - rejecting`);
      return false;
    }

    // Use PayPal's official verification API
    try {
      const accessToken = await getPayPalAccessToken();
      const verifyRes = await fetch(`${PAYPAL_BASE}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transmission_id: transmissionId,
          transmission_time: transmissionTime,
          cert_url: certUrl,
          auth_algo: authAlgo,
          transmission_sig: transmissionSig,
          webhook_id: webhookId,
          webhook_event: JSON.parse(webhookBody),
        }),
      });

      if (!verifyRes.ok) {
        console.error(`[SECURITY] PayPal signature verify API error: ${verifyRes.status} - rejecting webhook`);
        return false;
      }

      const verifyData = await verifyRes.json() as { verification_status: string };
      const isValid = verifyData.verification_status === 'SUCCESS';

      if (!isValid) {
        console.error('[SECURITY] PayPal webhook signature verification returned non-SUCCESS status - rejecting');
      }

      return isValid;
    } catch (err) {
      console.error('[SECURITY] PayPal webhook signature verification error:', err);
      return false;
    }
  } catch (error) {
    console.error('[SECURITY] PayPal signature verification unexpected error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Read raw body BEFORE parsing — required for signature verification
    const body = await request.text();

    // Extract PayPal signature headers
    const transmissionId = request.headers.get('paypal-transmission-id') || '';
    const transmissionTime = request.headers.get('paypal-transmission-time') || '';
    const certUrl = request.headers.get('paypal-cert-url') || '';
    const authAlgo = request.headers.get('paypal-auth-algo') || '';
    const transmissionSig = request.headers.get('paypal-transmission-sig') || '';

    // Verify PayPal webhook signature — MUST be valid before processing
    const isValid = await verifyPayPalSignature(
      transmissionId,
      transmissionTime,
      certUrl,
      authAlgo,
      transmissionSig,
      body
    );

    if (!isValid) {
      console.error('[SECURITY] PayPal webhook: signature verification FAILED — rejecting webhook');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    // Parse event only after successful signature verification
    let event: any;
    try {
      event = JSON.parse(body);
    } catch {
      console.error('[SECURITY] PayPal webhook: invalid JSON body after signature validation');
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Handle different PayPal events
    const { event_type, resource } = event;

    console.log(`[PayPal] Processing verified webhook event: ${event_type} for subscription ${resource?.id}`);

    switch (event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.RENEWED':
        // Update subscription in Supabase only after signature verification
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .upsert({
            provider_subscription_id: resource.id,
            plan_id: resource.plan_id,
            status: 'active',
            current_period_end: resource.billing_info?.next_billing_time || null,
          });

        if (updateError) {
          console.error('[PayPal] Subscription update error:', updateError);
        } else {
          console.log(`[PayPal] Subscription ${resource.id} activated/renewed successfully`);
        }
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('provider_subscription_id', resource.id);
        console.log(`[PayPal] Subscription ${resource.id} cancelled`);
        break;

      default:
        // Other events acknowledged but not processed
        console.log(`[PayPal] Unhandled event type: ${event_type}`);
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[SECURITY] PayPal webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
