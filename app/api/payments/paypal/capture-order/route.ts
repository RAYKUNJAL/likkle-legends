import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';

const PAYPAL_API = process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// Reuse from create-order or make shared util
const getPayPalToken = async () => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) throw new Error("Missing PayPal credentials");

    const auth = Buffer.from(clientId + ":" + clientSecret).toString("base64");
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    const data = await response.json();
    return data.access_token;
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
            const productId = customId.productId; // e.g. single_track, streak_freeze
            const contentId = customId.contentId; // song uuid
            const childId = customId.childId; // for gamification products

            if (productId === 'streak_freeze') {
                // Add one streak freeze to inventory
                const { data: freezeRow } = await supabaseAdmin
                    .from('streak_freezes')
                    .select('id, freeze_count')
                    .eq('child_id', childId)
                    .maybeSingle();

                if (freezeRow) {
                    // Update existing row
                    await supabaseAdmin.from('streak_freezes').update({
                        freeze_count: (freezeRow.freeze_count || 0) + 1,
                        updated_at: new Date().toISOString(),
                    }).eq('id', freezeRow.id);
                } else {
                    // Create new row
                    await supabaseAdmin.from('streak_freezes').insert({
                        child_id: childId,
                        freeze_count: 1,
                    });
                }

                // Log transaction for record
                try {
                    await supabaseAdmin.from('purchases').insert({
                        user_id: user.id,
                        product_id: 'streak_freeze',
                        transaction_id: transaction.id,
                        amount_paid: parseFloat(transaction.amount.value),
                        metadata: {
                            paypal_order_id: orderID,
                            paypal_transaction_id: transaction.id,
                            child_id: childId,
                        }
                    });
                } catch (e) {
                    // purchases table might not exist, continue
                    console.log('Note: purchases table not yet created');
                }
            } else if (productId === 'custom_song_request') {
                // INSERT new custom song order (no pre-existing row)
                await supabaseAdmin
                    .from('custom_song_orders')
                    .insert({
                        user_id: user.id,
                        status: 'paid',
                        event_type: customId.event_type || 'birthday',
                        child_name: customId.child_name || null,
                        special_instructions: customId.special_instructions || null,
                        price_paid: parseFloat(transaction.amount.value),
                        metadata: {
                            paypal_order_id: orderID,
                            paypal_transaction_id: transaction.id,
                        }
                    });
            } else if (productId === 'track_bundle_5') {
                // Insert one purchased_content row per selected song so each appears in the library
                const selectedSongIds: string[] = customId.selectedSongIds || [];
                const rows = selectedSongIds.map((songId: string) => ({
                    user_id: user.id,
                    content_type: 'song',
                    content_id: songId,
                    amount_paid: parseFloat(transaction.amount.value) / (selectedSongIds.length || 1),
                    metadata: {
                        paypal_order_id: orderID,
                        paypal_transaction_id: transaction.id,
                        product_id: productId,
                        bundle: true,
                    }
                }));
                if (rows.length > 0) {
                    await supabaseAdmin.from('purchased_content').insert(rows);
                } else {
                    // No specific songs — record the bundle itself
                    await supabaseAdmin.from('purchased_content').insert({
                        user_id: user.id,
                        content_type: 'bundle',
                        content_id: null,
                        amount_paid: parseFloat(transaction.amount.value),
                        metadata: { paypal_order_id: orderID, paypal_transaction_id: transaction.id, product_id: productId }
                    });
                }
            } else {
                // Single track purchase
                await supabaseAdmin
                    .from('purchased_content')
                    .insert({
                        user_id: user.id,
                        content_type: 'song',
                        content_id: contentId,
                        amount_paid: parseFloat(transaction.amount.value),
                        metadata: {
                            paypal_order_id: orderID,
                            paypal_transaction_id: transaction.id,
                            product_id: productId
                        }
                    });

                // Send Receipt Email
                try {
                    const { MUSIC_PURCHASE_RECEIPT, sendEmail } = await import('@/lib/email');
                    await sendEmail({
                        to: user.email!,
                        subject: "Your Music is Ready! 🎵 | Likkle Legends",
                        html: MUSIC_PURCHASE_RECEIPT(
                            user.email?.split('@')[0] || 'Friend',
                            [{ title: productId.includes('bundle') ? 'Island Jams Bundle' : 'Single Track', price: transaction.amount.value }],
                            transaction.amount.value
                        )
                    });
                } catch (emailError) {
                    console.error("Failed to send receipt:", emailError);
                    // Don't fail the transaction, just log the error
                }
            }
        }

        return NextResponse.json(captureData);
    } catch (e: any) {
        console.error("Capture Order Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
