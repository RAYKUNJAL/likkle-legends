import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { GAMIFICATION_PRODUCTS } from '@/lib/paypal';
import { capturePayPalOrder, fetchPayPalOrder } from '@/lib/paypal-server';
import { checkRateLimit } from '@/lib/api/rate-limit';

const TIER_TO_PRODUCT: Record<string, keyof typeof GAMIFICATION_PRODUCTS> = {
    birthday_letter_basic: 'birthday_letter_basic',
    birthday_letter_premium: 'birthday_letter_premium',
    standard: 'birthday_letter_basic',
    premium: 'birthday_letter_premium',
};

/**
 * Records a birthday-letter order AFTER server-side PayPal verification.
 * Never trusts client-supplied amount or capture flags.
 */
export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'global';
    const limited = checkRateLimit(`birthday-record:${ip}`, 10, 10 * 60 * 1000);
    if (limited) return limited;

    try {
        const body = await request.json();
        const {
            orderId,
            tier,
            childName,
            childAge,
            character,
            parentEmail,
            message,
        } = body;

        if (!orderId || String(orderId).length < 8 || !childName || !parentEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const productKey = TIER_TO_PRODUCT[String(tier || '').toLowerCase()] || 'birthday_letter_basic';
        const product = GAMIFICATION_PRODUCTS[productKey];
        if (!product) {
            return NextResponse.json({ error: 'Unknown product tier' }, { status: 400 });
        }

        const expectedAmount = Number(product.price);
        let snapshot;
        try {
            snapshot = await fetchPayPalOrder(String(orderId));
            if (snapshot.status === 'APPROVED' && snapshot.status !== 'COMPLETED') {
                snapshot = await capturePayPalOrder(String(orderId));
            }
        } catch (err) {
            console.error('[BIRTHDAY_LETTER] PayPal verify failed:', err);
            return NextResponse.json({ error: 'Could not verify PayPal payment' }, { status: 402 });
        }

        const paidStatuses = new Set(['COMPLETED', 'APPROVED']);
        if (!snapshot.status || !paidStatuses.has(snapshot.status) || snapshot.amount == null) {
            return NextResponse.json({ error: 'PayPal order is not completed' }, { status: 402 });
        }
        if (Math.abs(Number(snapshot.amount) - expectedAmount) > 0.05) {
            console.warn(`[BIRTHDAY_LETTER] Amount mismatch order=${orderId} captured=${snapshot.amount} expected=${expectedAmount}`);
            return NextResponse.json({ error: 'Payment amount does not match catalog price' }, { status: 400 });
        }

        try {
            await supabaseAdmin.from('one_time_orders').insert({
                order_id: orderId,
                product_id: product.id,
                product_name: product.name,
                child_name: childName,
                child_age: parseInt(childAge, 10) || null,
                character,
                parent_email: String(parentEmail).toLowerCase(),
                personalization_message: message || null,
                amount: expectedAmount,
                currency: 'USD',
                status: 'paid',
                fulfillment_status: 'pending',
                metadata: {
                    paypal_capture_id: snapshot.captureId || null,
                    catalog_price: expectedAmount,
                    paypal_status: snapshot.status,
                    client_amount_ignored: body.amount ?? null,
                },
                created_at: new Date().toISOString(),
            });
        } catch (_e) {
            console.log('[BIRTHDAY_LETTER] Could not store order in Supabase (table may not exist):', _e);
        }

        try {
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://likklelegends.com'}/api/send-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: parentEmail,
                    subject: `🎂 ${childName}'s Birthday Letter is on the way!`,
                    html: `
                        <h1>Birthday Letter Confirmed! 🎂</h1>
                        <p>Thank you for ordering a Birthday Letter for <strong>${childName}</strong> (age ${childAge}).</p>
                        <p><strong>Character:</strong> ${character}<br/>
                        <strong>Tier:</strong> ${productKey === 'birthday_letter_premium' ? 'Premium (with physical mail)' : 'Standard (digital)'}<br/>
                        <strong>Order ID:</strong> ${orderId}</p>
                        ${message ? `<p><strong>Your note:</strong> ${message}</p>` : ''}
                        <p>With love from the islands,<br>The Likkle Legends Team 🌴</p>
                    `,
                }),
            }).catch(() => {});
        } catch (_e) {
            console.log('[BIRTHDAY_LETTER] Could not send confirmation email:', _e);
        }

        return NextResponse.json({
            success: true,
            orderId,
            amount: expectedAmount,
            tier: product.id,
            message: 'Birthday letter order confirmed',
        });
    } catch (err: any) {
        console.error('[BIRTHDAY_LETTER] Order error:', err);
        return NextResponse.json({ error: 'Could not process order' }, { status: 500 });
    }
}
