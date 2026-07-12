import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderId, tier, childName, childAge, character, parentEmail, message, amount } = body;

        if (!orderId || !childName || !parentEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Store the order in Supabase if table exists
        try {
            await supabaseAdmin
                .from('one_time_orders')
                .insert({
                    order_id: orderId,
                    product_id: tier,
                    product_name: 'Birthday Letter',
                    child_name: childName,
                    child_age: parseInt(childAge) || null,
                    character,
                    parent_email: parentEmail,
                    personalization_message: message || null,
                    amount: amount,
                    currency: 'USD',
                    status: 'paid',
                    fulfillment_status: 'pending',
                    created_at: new Date().toISOString(),
                });
        } catch (_e) {
            // Table may not exist yet — log but don't fail
            console.log('[BIRTHDAY_LETTER] Could not store order in Supabase (table may not exist):', _e);
        }

        // Send confirmation email
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
                        <strong>Tier:</strong> ${tier === 'birthday_letter_premium' ? 'Premium (with physical mail)' : 'Standard (digital)'}<br/>
                        <strong>Order ID:</strong> ${orderId}</p>
                        ${message ? `<p><strong>Your note:</strong> ${message}</p>` : ''}
                        ${tier === 'birthday_letter_premium'
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
            message: 'Birthday letter order confirmed',
        });
    } catch (err: any) {
        console.error('[BIRTHDAY_LETTER] Order error:', err);
        return NextResponse.json({ error: 'Could not process order' }, { status: 500 });
    }
}
