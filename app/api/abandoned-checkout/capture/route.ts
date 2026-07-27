import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

/**
 * Abandoned checkout capture endpoint.
 * Called from the checkout page when a user has entered their email
 * but has not completed payment within ~30 minutes.
 *
 * Stores the checkout in the abandoned_checkouts table so the cron
 * reminder job can send a recovery email.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { email, firstName, country, cartValue, plan, source } = body as {
            email?: string;
            firstName?: string;
            country?: string;
            cartValue?: number;
            plan?: string;
            source?: string;
        };

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
        }

        const lowerEmail = email.toLowerCase().trim();
        const now = new Date().toISOString();
        // Trigger window: 30 minutes from capture.
        const triggerAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

        // Upsert by email — if a row already exists for this email and is not
        // recovered, refresh it (the visitor came back to the checkout).
        const { data: existing } = await supabaseAdmin
            .from('abandoned_checkouts')
            .select('id, recovered, reminder_count')
            .eq('email', lowerEmail)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existing && !existing.recovered) {
            // Refresh the existing row — reset the reminder window.
            const { error } = await supabaseAdmin
                .from('abandoned_checkouts')
                .update({
                    first_name: firstName || null,
                    country: country || null,
                    cart_value: typeof cartValue === 'number' ? cartValue : null,
                    plan: plan || null,
                    source: source || 'offer_checkout',
                    trigger_reminder_at: triggerAt,
                    updated_at: now,
                })
                .eq('id', existing.id);
            if (error) {
                console.error('[abandoned-checkout] update failed:', error.message);
                return NextResponse.json({ error: 'Failed to update abandoned checkout' }, { status: 500 });
            }
            return NextResponse.json({ success: true, action: 'updated', trigger_at: triggerAt });
        }

        const { error } = await supabaseAdmin.from('abandoned_checkouts').insert({
            email: lowerEmail,
            first_name: firstName || null,
            country: country || null,
            cart_value: typeof cartValue === 'number' ? cartValue : null,
            plan: plan || null,
            source: source || 'offer_checkout',
            status: 'pending',
            trigger_reminder_at: triggerAt,
        });

        if (error) {
            console.error('[abandoned-checkout] insert failed:', error.message);
            return NextResponse.json({ error: 'Failed to capture abandoned checkout' }, { status: 500 });
        }

        return NextResponse.json({ success: true, action: 'created', trigger_at: triggerAt });
    } catch (err) {
        console.error('[abandoned-checkout] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ ok: true, message: 'abandoned-checkout capture endpoint. POST {email, firstName, country, cartValue, plan, source}.' });
}
