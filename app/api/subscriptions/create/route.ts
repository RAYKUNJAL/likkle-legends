import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const { plan_type, email } = await req.json();

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Plan pricing
    const PLANS = {
      starter: { price: 7900, name: 'Starter' },
      growth: { price: 24900, name: 'Growth' },
      enterprise: { price: 39900, name: 'Enterprise' },
    };

    const plan = PLANS[plan_type] || PLANS.starter;

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: email,
      metadata: { user_id: user.id },
    });

    // Create subscription intent
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: plan.name },
            unit_amount: plan.price,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`,
    });

    // Create subscription record
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: user.id,
        plan_type,
        price_per_month: plan.price / 100,
        status: 'active',
        trial_started_at: new Date(),
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      checkout_url: session.url,
      subscription_id: subscription.id,
    });
  } catch (err) {
    console.error('Subscription creation error:', err);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
