import { NextRequest, NextResponse } from 'next/server';
import { redeemDownloadCredit } from '@/lib/music-fulfillment';
import { requireParentPayer } from '@/lib/paypal-checkout';

export async function POST(request: NextRequest) {
    const payer = await requireParentPayer(request);
    if (!payer.ok) return payer.response;

    const body = await request.json().catch(() => ({}));
    const result = await redeemDownloadCredit(payer.user.id, typeof body.trackId === 'string' ? body.trackId : '');
    if (!result.ok) {
        return NextResponse.json({ error: 'That download license could not be used.', entitled: false }, { status: 400 });
    }
    return NextResponse.json({ entitled: true, entitlement: result.entitlement });
}
