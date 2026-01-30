import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

const PAYPAL_API = process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// Reuse from create-order or make shared util
const getPayPalToken = async () => {
    // ... same logic
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderID } = body;

        // 1. Verify User
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 2. Capture Order
        const accessToken = await getPayPalToken();
        const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const captureData = await response.json();

        if (!response.ok) {
            // Handle specific PayPal errors (INSTRUMENT_DECLINED etc)
            const errorDetail = captureData?.details?.[0];
            const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${captureData.debug_id})`
                : JSON.stringify(captureData);
            throw new Error(errorMessage);
        }

        const purchaseUnit = captureData.purchase_units[0];
        const transaction = purchaseUnit.payments.captures[0];
        const customId = JSON.parse(purchaseUnit.custom_id || '{}');

        // 3. Fulfill Order (DB Insert)
        if (transaction.status === 'COMPLETED') {
            const productId = customId.productId; // e.g. single_track
            const contentId = customId.contentId; // song uuid

            if (productId === 'custom_song_request') {
                // Update Custom Request
                await supabaseAdmin
                    .from('custom_song_requests')
                    .update({
                        status: 'paid',
                        payment_status: 'paid',
                        paypal_order_id: orderID,
                        amount_paid: transaction.amount.value
                    })
                    .eq('id', contentId); // contentId here is request UUID
            } else {
                // Insert Purchase Record
                await supabaseAdmin
                    .from('purchased_content')
                    .insert({
                        user_id: user.id,
                        content_type: productId.includes('bundle') ? 'bundle' : 'song',
                        content_id: contentId,
                        transaction_id: transaction.id,
                        amount_paid: transaction.amount.value,
                        metadata: {
                            paypal_order_id: orderID,
                            product_id: productId
                        }
                    });
            }
        }

        return NextResponse.json(captureData);
    } catch (e: any) {
        console.error("Capture Order Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
