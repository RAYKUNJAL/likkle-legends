export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { sendEmail } from '@/lib/email';

/**
 * Cron endpoint: sends abandoned checkout reminder emails.
 *
 * Finds rows in abandoned_checkouts where:
 *   - status = 'pending'
 *   - trigger_reminder_at <= now
 *   - reminder_sent_at IS NULL
 *
 * Sends one reminder email per abandoned checkout (subject:
 * "Your Likkle Legends mailer is waiting! 🌺") with a link back to
 * /offer/checkout?email=their@email, then marks the row as reminded.
 *
 * Call via: GET /api/cron/abandoned-checkout-reminders
 *   Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
    // Auth: require CRON_SECRET in production.
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (process.env.NODE_ENV === 'production') {
        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        const now = new Date().toISOString();

        const { data: due, error: fetchError } = await supabaseAdmin
            .from('abandoned_checkouts')
            .select('id, email, first_name, country, cart_value, plan')
            .eq('status', 'pending')
            .is('reminder_sent_at', null)
            .lte('trigger_reminder_at', now)
            .order('created_at', { ascending: true })
            .limit(100);

        if (fetchError) {
            console.error('[cron/abandoned-checkout] fetch failed:', fetchError.message);
            return NextResponse.json({ error: 'Fetch failed', detail: fetchError.message }, { status: 500 });
        }

        if (!due || due.length === 0) {
            return NextResponse.json({ success: true, sent: 0, message: 'No due reminders' });
        }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://likklelegends.com';
        let sent = 0;
        let failed = 0;

        for (const row of due) {
            if (!row.email) continue;
            const firstName = row.first_name || 'there';
            const checkoutUrl = `${baseUrl}/offer/checkout?email=${encodeURIComponent(row.email)}`;

            const html = buildAbandonedCheckoutEmail(firstName, checkoutUrl, row.email);

            try {
                const result = await sendEmail({
                    to: row.email,
                    subject: 'Your Likkle Legends mailer is waiting! 🌺',
                    html,
                });

                if (result.success) {
                    await supabaseAdmin
                        .from('abandoned_checkouts')
                        .update({
                            status: 'reminded',
                            reminder_sent_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', row.id);
                    sent++;
                } else {
                    console.error('[cron/abandoned-checkout] send failed for', row.email, result.error);
                    failed++;
                }
            } catch (sendErr) {
                console.error('[cron/abandoned-checkout] send exception for', row.email, sendErr);
                failed++;
            }
        }

        return NextResponse.json({
            success: true,
            sent,
            failed,
            checked: due.length,
            timestamp: now,
        });
    } catch (err) {
        console.error('[cron/abandoned-checkout] error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// ── Inline email template (no separate template file needed) ──
function buildAbandonedCheckoutEmail(firstName: string, checkoutUrl: string, email: string): string {
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Likkle Legends mailer is waiting!</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #1c1c1c; background: #fef9f0; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 28px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #fb7118, #fbbf24); padding: 44px 36px; text-align: center; color: #ffffff; }
        .body { padding: 40px 36px; }
        .btn { display: inline-block; padding: 18px 38px; background: linear-gradient(to right, #fb7118, #fbbf24); color: #ffffff !important; text-decoration: none; border-radius: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; }
        .steps { background: #fffaf0; border-radius: 20px; padding: 24px; margin: 28px 0; }
        .step { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
        .step-num { flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%; background: #fb7118; color: #fff; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 13px; }
        .footer { text-align: center; padding: 28px 36px; background: #fef9f0; color: #6b7280; font-size: 12px; }
        a { color: #fb7118; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 26px; font-weight: 900;">Your mailer is waiting! 🌺</h1>
            <p style="margin: 8px 0 0 0; font-size: 15px; opacity: 0.95;">Just one quick step away from your Caribbean learning adventure.</p>
        </div>
        <div class="body">
            <p style="font-size: 17px; font-weight: 800; color: #1c1c1c;">Hi ${firstName},</p>
            <p style="font-size: 16px; line-height: 1.7; color: #3a3a3a;">
                We noticed you started your Likkle Legends Intro Mailer checkout but didn&apos;t finish — no worries, it&apos;s still here waiting for you. 💌
            </p>
            <p style="font-size: 16px; line-height: 1.7; color: #3a3a3a;">
                Your child is one step away from Caribbean stories, phonics activities, character stickers, and a parent guide — all designed for kids 3–8.
            </p>

            <div class="steps">
                <div class="step">
                    <div class="step-num">1</div>
                    <div style="font-size: 15px; color: #3a3a3a;"><b>Finish checkout</b> — it only takes a minute.</div>
                </div>
                <div class="step">
                    <div class="step-num">2</div>
                    <div style="font-size: 15px; color: #3a3a3a;"><b>Create your child&apos;s profile</b> so every activity fits their age band.</div>
                </div>
                <div class="step">
                    <div class="step-num">3</div>
                    <div style="font-size: 15px; color: #3a3a3a;"><b>Start exploring the portal</b> — meet Dilly, Tanty, R.O.T.I. and friends.</div>
                </div>
            </div>

            <div style="text-align: center; margin: 32px 0;">
                <a href="${checkoutUrl}" class="btn">Finish my checkout →</a>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center;">
                This link takes you straight back to your checkout. Your details are pre-filled.
            </p>
        </div>
        <div class="footer">
            <p style="margin: 0 0 6px 0;">🌺 Likkle Legends — Caribbean learning that feels like home.</p>
            <p style="margin: 0 0 6px 0;">You received this because you started a checkout at likklelegends.com.</p>
            <p style="margin: 0;">If this wasn&apos;t you, you can safely ignore this email.</p>
        </div>
    </div>
</body>
</html>`;
}
