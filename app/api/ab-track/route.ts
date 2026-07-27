import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

/**
 * A/B test event tracking endpoint.
 * Records conversion events (view, click, checkout, purchase) tied to a variant.
 * Reads the variant from the ll_ab_variant cookie so we know which arm converted.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { event_type, variant, test_id } = body as {
            event_type?: string;
            variant?: string;
            test_id?: string;
        };

        const cookieVariant = request.cookies.get('ll_ab_variant')?.value;
        const finalVariant = (variant === 'A' || variant === 'B')
            ? variant
            : (cookieVariant === 'A' || cookieVariant === 'B')
                ? cookieVariant
                : null;

        if (!finalVariant) {
            return NextResponse.json(
                { error: 'No variant assigned (cookie missing)' },
                { status: 400 }
            );
        }

        const eventType = (event_type || 'view').toLowerCase();
        const testId = test_id || 'offer_hero_2026';

        const { error } = await supabaseAdmin.from('ab_test_events').insert({
            test_id: testId,
            variant: finalVariant,
            event_type: eventType,
            user_agent: request.headers.get('user-agent') || null,
            referrer: request.headers.get('referer') || null,
            created_at: new Date().toISOString(),
        });

        if (error) {
            console.error('[ab-track] insert failed:', error.message);
            return NextResponse.json(
                { error: 'Tracking insert failed', detail: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, variant: finalVariant, event_type: eventType });
    } catch (err) {
        console.error('[ab-track] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ ok: true, message: 'ab-track endpoint. Use POST with {event_type, variant}.' });
}
