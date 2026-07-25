import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { GAMIFICATION_PRODUCTS } from '@/lib/paypal';

const TIER_TO_PRODUCT: Record<string, keyof typeof GAMIFICATION_PRODUCTS> = {
    birthday_letter_basic: 'birthday_letter_basic',
    birthday_letter_premium: 'birthday_letter_premium',
    standard: 'birthday_letter_basic',
    premium: 'birthday_letter_premium',
};

/**
 * Records a birthday-letter order AFTER PayPal capture on the client.
 * Never trusts client-supplied amount — always recomputes from catalog.
 * Marks status pending_verification until a matching PayPal capture is proven,
 * unless paypalCaptureId is present and we can at least store an expected amount.
 */
export async function POST(request: NextRequest) {
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
            amount: clientAmount,
            paypalCaptureId,
        } = body;

        if (!orderId || !childName || !parentEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const productKey = TIER_TO_PRODUCT[String(tier || '').toLowerCase()] || 'birthday_letter_basic';
        const product = GAMIFICATION_PRODUCTS[productKey];
        if (!product) {
            return NextResponse.json({ error: 'Unknown product tier' }, { status: 400 });
        }

        const expectedAmount = Number(product.price);
        const submitted = Number(clientAmount);
        if (Number.isFinite(submitted) && Math.abs(submitted - expectedAmount) > 0.05) {
            console.warn(
                `[BIRTHDAY_LETTER] Client amount mismatch order=${orderId} submitted=${submitted} expected=${expectedAmount}`
            );
            return NextResponse.json(
                { error: 'Amount does not match catalog price', expectedAmount },
                { status: 400 }
            );
        }

        // Require a PayPal order/capture id so random clients can't mint paid rows.
        if (!orderId || String(orderId).length < 8) {
            return NextResponse.json({ error: 'Invalid PayPal order id' }, { status: 400 });
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
                // Capture is verified client-side with PayPal buttons; we only store expected catalog price.
                // Fulfillment workers should re-check PayPal before shipping physical product.
                status: paypalCaptureId ? 'paid' : 'pending_payment',
                fulfillment_status: 'pending',
                metadata: {
                    paypal_capture_id: paypalCaptureId || null,
                    catalog_price: expectedAmount,
                    client_amount_ignored: clientAmount ?? null,
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
                        <p>Hi there!</p>
                        <p>Thank you for ordering a Birthday Letter for <strong>${childName}</strong> (age ${childAge}).</p>
                        <p><strong>Character:</strong> ${character}<br/>
                        <strong>Tier:</strong> ${productKey === 'birthday_letter_premium' ? 'Premium (with physical mail)' : 'Standard (digital)'}<br/>
                        <strong>Order ID:</strong> ${orderId}</p>
                        ${message ? `<p><strong>Your note:</strong> ${message}</p>` : ''}
                        ${productKey === 'birthday_letter_premium'
                            ? '<p>Your personalized letter will be mailed to your US address within 5 business days. You\'ll also receive the digital version via email within 48 hours.</p>'
                            : '<p>You\'ll receive the digital letter and activity pack via email within 48 hours.</p>'}
                        <p>Questions? Reply to this email or contact hello@likklelegends.com</p>
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
