import { NextRequest, NextResponse } from 'next/server';
import { advanceCustomSong } from '@/lib/music-fulfillment';
import { requireParentPayer } from '@/lib/paypal-checkout';

const ADMIN_ROLES = new Set(['admin', 'super_admin']);

export async function POST(request: NextRequest) {
    const payer = await requireParentPayer(request);
    if (!payer.ok) return payer.response;
    if (!ADMIN_ROLES.has(payer.user.role)) {
        return NextResponse.json({ error: 'Only an admin can update delivery.', entitled: false }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const requestId = typeof body.requestId === 'string' ? body.requestId : '';
    const status = body.status === 'in_progress' || body.status === 'delivered' ? body.status : null;
    if (!requestId || !status) {
        return NextResponse.json({ error: 'Choose in progress or delivered.', entitled: false }, { status: 400 });
    }

    const advanced = await advanceCustomSong(payer.user.id, requestId, status);
    if (!advanced.ok) {
        return NextResponse.json({ error: 'That request cannot move to that step.', entitled: false }, { status: 409 });
    }
    return NextResponse.json({ ok: true, status, entitled: false });
}
