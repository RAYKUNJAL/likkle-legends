import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const supabase = createClient();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const { product_id, user_id } = paymentIntent.metadata;

        // Update order status
        await supabase
          .from('marketplace_orders')
          .update({ payment_status: 'completed', completed_at: new Date() })
          .eq('stripe_payment_id', paymentIntent.id);

        // Increment product sales
        await supabase.rpc('increment_product_sales', {
          p_product_id: product_id,
        });

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const { user_id } = subscription.metadata;

        await supabase
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            next_billing_date: new Date(subscription.current_period_end * 1000),
          })
          .eq('user_id', user_id);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const { user_id } = subscription.metadata;

        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date(),
          })
          .eq('user_id', user_id);

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
