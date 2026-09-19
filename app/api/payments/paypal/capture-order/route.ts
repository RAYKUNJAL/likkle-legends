import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { getPayPalAccessToken, getPayPalApiBase } from '@/lib/paypal-api';
import { amountsMatch, entitlementPlanFor, lookupMusicStoreProduct } from '@/lib/music-paypal';

const PAYPAL_API = getPayPalApiBase();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { orderID } = body || {};
        if (!orderID || typeof orderID !== 'string') {
            return NextResponse.json({ error: 'Missing orderID' }, { status: 400 });
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const accessToken = await getPayPalAccessToken();
        const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const captureData = await response.json();
        if (!response.ok) {
            const errorDetail = captureData?.details?.[0];
            const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${captureData.debug_id})`
                : JSON.stringify(captureData);
            throw new Error(errorMessage);
        }

        const purchaseUnit = captureData.purchase_units?.[0];
        const transaction = purchaseUnit?.payments?.captures?.[0];
        if (!purchaseUnit || !transaction) {
            return NextResponse.json({ error: 'PayPal capture is missing purchase data' }, { status: 400 });
        }

        let customId: Record<string, unknown> = {};
        try {
            customId = JSON.parse(purchaseUnit.custom_id || '{}');
        } catch (_e) {
            console.error('Invalid custom_id JSON from PayPal:', purchaseUnit.custom_id);
            return NextResponse.json({ error: 'Invalid order metadata' }, { status: 400 });
        }

        if (customId.userId && customId.userId !== user.id) {
            console.error(`[SECURITY] Capture user mismatch order=${orderID} tokenUser=${user.id} customUser=${customId.userId}`);
            return NextResponse.json({ error: 'Order does not belong to this user' }, { status: 403 });
        }

        if (transaction.status !== 'COMPLETED') {
            return NextResponse.json({ error: `Capture not completed (${transaction.status})` }, { status: 400 });
        }

        const productId = customId.productId as string | undefined;
        const contentId = customId.contentId as string | undefined;
        const childId = customId.childId as string | undefined;
        const capturedAmount = parseFloat(transaction.amount?.value || 'NaN');

        const catalog = lookupMusicStoreProduct(productId);
        if (!catalog) {
            console.error(`[SECURITY] Capture rejected unknown product order=${orderID} product=${productId}`);
            return NextResponse.json(
                { error: 'Unknown product — cannot verify payment amount' },
                { status: 400 }
            );
        }

        const expected = Number(catalog.price);
        if (!amountsMatch(capturedAmount, expected)) {
            console.error(
                `[SECURITY] Capture amount mismatch order=${orderID} product=${productId} captured=${capturedAmount} expected=${expected}`
            );
            return NextResponse.json(
                { error: 'Payment amount does not match product price' },
                { status: 400 }
            );
        }

        const entitlement = entitlementPlanFor(catalog.id);
        const paidAmount = expected;

        if (catalog.id === 'streak_freeze') {
            const { data: freezeRow } = await supabaseAdmin
                .from('streak_freezes')
                .select('id, freeze_count')
                .eq('child_id', childId)
                .maybeSingle();

            if (freezeRow) {
                await supabaseAdmin.from('streak_freezes').update({
                    freeze_count: (freezeRow.freeze_count || 0) + 1,
                    updated_at: new Date().toISOString(),
                }).eq('id', freezeRow.id);
            } else {
                await supabaseAdmin.from('streak_freezes').insert({
                    child_id: childId,
                    freeze_count: 1,
                });
            }

            await supabaseAdmin.from('purchases').insert({
                user_id: user.id,
                product_id: 'streak_freeze',
                transaction_id: transaction.id,
                amount_paid: paidAmount,
                metadata: {
                    paypal_order_id: orderID,
                    paypal_transaction_id: transaction.id,
                    child_id: childId,
                },
            }).then(({ error }) => {
                if (error) console.log('Note: purchases table insert skipped:', error.message);
            });
        } else if (catalog.id === 'custom_song_request') {
            await supabaseAdmin.from('custom_song_orders').insert({
                user_id: user.id,
                status: 'paid',
                event_type: customId.event_type || customId.occasion || 'birthday',
                child_name: customId.child_name || null,
                special_instructions: customId.special_instructions || customId.details || null,
                price_paid: paidAmount,
                metadata: {
                    paypal_order_id: orderID,
                    paypal_transaction_id: transaction.id,
                },
            });

            const requestId = typeof customId.requestId === 'string' ? customId.requestId : null;
            if (requestId) {
                await supabaseAdmin
                    .from('custom_song_requests')
                    .update({
                        status: 'paid',
                        payment_status: 'paid',
                        amount_paid: paidAmount,
                    })
                    .eq('id', requestId)
                    .eq('user_id', user.id);
            } else {
                await supabaseAdmin.from('custom_song_requests').insert({
                    user_id: user.id,
                    child_name: customId.child_name || null,
                    occasion: customId.event_type || customId.occasion || 'birthday',
                    musical_style: customId.mood || null,
                    status: 'paid',
                    payment_status: 'paid',
                    amount_paid: paidAmount,
                });
            }
        } else if (catalog.id === 'track_bundle_5') {
            const selectedSongIds: string[] = Array.isArray(customId.selectedSongIds)
                ? (customId.selectedSongIds as string[])
                : [];
            const rows = selectedSongIds.map((songId) => ({
                user_id: user.id,
                content_type: 'song',
                content_id: songId,
                amount_paid: paidAmount / (selectedSongIds.length || 1),
                metadata: {
                    paypal_order_id: orderID,
                    paypal_transaction_id: transaction.id,
                    product_id: catalog.id,
                    bundle: true,
                },
            }));
            if (rows.length > 0) {
                await supabaseAdmin.from('purchased_content').insert(rows);
            } else {
                await supabaseAdmin.from('purchased_content').insert({
                    user_id: user.id,
                    content_type: 'bundle',
                    content_id: null,
                    amount_paid: paidAmount,
                    metadata: {
                        paypal_order_id: orderID,
                        paypal_transaction_id: transaction.id,
                        product_id: catalog.id,
                    },
                });
            }
        } else {
            await supabaseAdmin.from('purchased_content').insert({
                user_id: user.id,
                content_type: 'song',
                content_id: contentId || null,
                amount_paid: paidAmount,
                metadata: {
                    paypal_order_id: orderID,
                    paypal_transaction_id: transaction.id,
                    product_id: catalog.id,
                },
            });

            if (catalog.id === 'single_track' && contentId) {
                await supabaseAdmin.from('music_purchases').insert({
                    user_id: user.id,
                    song_id: contentId,
                    price_paid: paidAmount,
                    currency: 'USD',
                    metadata: {
                        paypal_order_id: orderID,
                        paypal_transaction_id: transaction.id,
                    },
                }).then(({ error }) => {
                    if (error) console.log('Note: music_purchases insert skipped:', error.message);
                });
            }

            try {
                const { MUSIC_PURCHASE_RECEIPT, sendEmail } = await import('@/lib/email');
                await sendEmail({
                    to: user.email!,
                    subject: 'Your Music is Ready! 🎵 | Likkle Legends',
                    html: MUSIC_PURCHASE_RECEIPT(
                        user.email?.split('@')[0] || 'Friend',
                        [{ title: catalog.name, price: paidAmount.toFixed(2) }],
                        paidAmount.toFixed(2)
                    ),
                });
            } catch (emailError) {
                console.error('Failed to send receipt:', emailError);
            }
        }

        return NextResponse.json({
            id: captureData.id,
            status: captureData.status,
            productId: catalog.id,
            amount: paidAmount.toFixed(2),
            entitlement: entitlement.tables,
            contentId: contentId || null,
        });
    } catch (e: any) {
        console.error('Capture Order Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
