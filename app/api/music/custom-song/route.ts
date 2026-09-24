import { NextRequest, NextResponse } from 'next/server';
import { createCustomSongDraft, listMusicAccount } from '@/lib/music-fulfillment';
import { requireParentPayer } from '@/lib/paypal-checkout';

export async function GET(request: NextRequest) {
    const payer = await requireParentPayer(request);
    if (!payer.ok) return payer.response;
    const library = await listMusicAccount(payer.user.id);
    return NextResponse.json({ requests: library.customSongs });
}

export async function POST(request: NextRequest) {
    const payer = await requireParentPayer(request);
    if (!payer.ok) return payer.response;

    const body = await request.json().catch(() => ({}));
    const draft = await createCustomSongDraft(payer.user.id, {
        childFirstName: body.childFirstName,
        occasion: body.occasion,
        notes: body.notes,
    });
    if (!draft.ok) {
        return NextResponse.json({ error: draft.error, entitled: false }, { status: 400 });
    }
    return NextResponse.json({
        requestId: draft.requestId,
        price: draft.price,
        status: 'awaiting_payment',
        entitled: false,
    });
}
