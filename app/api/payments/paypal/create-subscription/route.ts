import { NextRequest, NextResponse } from 'next/server';
import { getParentOffer } from '@/lib/paypal-offers';
import { createSubscription, paymentErrorResponse, requireParentPayer } from '@/lib/paypal-checkout';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => null);
        const sku = body?.sku as string | undefined;
        const offer = getParentOffer(sku);

        if (!offer || offer.kind !== 'subscription') {
            return NextResponse.json({ error: 'Unknown subscription', entitled: false }, { status: 400 });
        }

        const payer = await requireParentPayer(request);
        if (!payer.ok) return payer.response;

        const origin = request.nextUrl.origin;
        const subscription = await createSubscription(
            offer,
            payer.user.id,
            `${origin}/checkout?offer=${encodeURIComponent(offer.sku)}`,
            `${origin}/checkout?offer=catalog&cancelled=1`
        );

        return NextResponse.json({ id: subscription.id, entitled: false });
    } catch (error) {
        console.error('[PAYMENTS] create-subscription failed:', error);
        return paymentErrorResponse(error);
    }
}
