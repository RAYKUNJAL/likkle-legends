import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const { product_id, payment_method } = await req.json();

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch product
    const { data: product, error: productError } = await supabase
      .from('marketplace_products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(product.price * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        product_id: product_id,
        user_id: user.id,
      },
    });

    // Create order record
    const { data: order, error: orderError } = await supabase
      .from('marketplace_orders')
      .insert({
        product_id,
        buyer_id: user.id,
        amount: product.price,
        payment_method: 'stripe',
        stripe_payment_id: paymentIntent.id,
        payment_status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      order_id: order.id,
    });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    );
  }
}
