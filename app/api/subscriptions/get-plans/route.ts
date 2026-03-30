import { NextRequest, NextResponse } from 'next/server';

const PAYPAL_BASE = process.env.PAYPAL_ENV === 'sandbox'
  ? 'https://api-m.sandbox.paypal.com'
  : 'https://api-m.paypal.com';

const PLANS = [
  {
    id: 'plan_mail_intro',
    name: 'Starter Mailer',
    description: 'Get started with weekly content',
    price: 4.99,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Weekly stories',
      'Music access',
      'Basic games',
      '100+ printables',
    ],
  },
  {
    id: 'plan_legends_plus',
    name: 'Legends Plus',
    description: 'Full access to all content',
    price: 9.99,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'All stories (300+)',
      'Full music library',
      'Advanced games',
      'Premium printables',
      'Priority support',
      'No ads',
    ],
  },
  {
    id: 'plan_family_legacy',
    name: 'Family Legacy',
    description: 'Unlimited access for the whole family',
    price: 19.99,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Everything in Legends Plus',
      'Up to 5 children',
      'Family challenges',
      'Parental analytics',
      'Custom learning plans',
      'White-glove support',
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: true,
        plans: PLANS,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get plans error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}
