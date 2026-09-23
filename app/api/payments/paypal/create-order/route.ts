import { NextRequest, NextResponse } from 'next/server';
import { GAMIFICATION_PRODUCTS, MUSIC_STORE_PRODUCTS } from '@/lib/paypal';
import { KID_IAP_PRODUCT_IDS, getParentOffer } from '@/lib/paypal-offers';
import { assertUnpaidCustomDraft } from '@/lib/music-fulfillment';
import { createMusicOrder, createOneTimeOrder, getPayPalAccessToken, paymentErrorResponse, paypalApiBase, requireParentPayer } from '@/lib/paypal-checkout';
import {
    CUSTOM_SONG_SKU,
    MUSIC_DOWNLOAD_BUNDLE_SKU,
    MUSIC_DOWNLOAD_SKU,
    clientSuppliedPriceFields,
    isMusicSku,
} from '@/lib/music-store';
import { getPlayableSong } from '@/lib/song-catalog';

const PAYPAL_API = paypalApiBase();
const LEGACY_MUSIC_PRODUCTS = new Set(['single_track', 'track_bundle_5']);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, contentId, metadata, sku, trackId, requestId } = body || {};
        const requestedSku = sku || productId;

        const payer = await requireParentPayer(request);
        if (!payer.ok) return payer.response;
        const user = payer.user;

        const priceFields = clientSuppliedPriceFields(body);
        if (priceFields.length) {
            return NextResponse.json(
                { error: 'Price is set by the server catalog.', entitled: false },
                { status: 400 }
            );
        }

        if (KID_IAP_PRODUCT_IDS.has(requestedSku) || LEGACY_MUSIC_PRODUCTS.has(requestedSku)) {
            return NextResponse.json(
                { error: 'That purchase is not available.', entitled: false },
                { status: 403 }
            );
        }

        const islandOffer = getParentOffer(requestedSku);
        if (islandOffer) {
            if (islandOffer.kind !== 'one_time') {
                return NextResponse.json(
                    { error: 'This plan uses subscription checkout.', entitled: false },
                    { status: 400 }
                );
            }
            const order = await createOneTimeOrder(islandOffer, user.id);
            return NextResponse.json({ id: order.id, status: order.status, entitled: false });
        }

        if (isMusicSku(requestedSku)) {
            let extra: string | undefined;
            if (requestedSku === MUSIC_DOWNLOAD_SKU) {
                const track = getPlayableSong(typeof trackId === 'string' ? trackId : '');
                if (!track) {
                    return NextResponse.json({ error: 'That song is not in the library.', entitled: false }, { status: 400 });
                }
                extra = track.id;
            } else if (requestedSku === MUSIC_DOWNLOAD_BUNDLE_SKU) {
                if (trackId) {
                    return NextResponse.json({ error: 'A license bundle does not take a track.', entitled: false }, { status: 400 });
                }
            } else if (requestedSku === CUSTOM_SONG_SKU) {
                const id = typeof requestId === 'string' ? requestId : '';
                const ready = await assertUnpaidCustomDraft(user.id, id);
                if (!ready) {
                    return NextResponse.json({ error: 'Save the song request before paying.', entitled: false }, { status: 400 });
                }
                extra = id;
            }

            const order = await createMusicOrder(user.id, requestedSku, extra);
            return NextResponse.json({ id: order.id, status: order.status, entitled: false });
        }

        // @ts-ignore
        let product = MUSIC_STORE_PRODUCTS[productId] || GAMIFICATION_PRODUCTS[productId];
        if (!product || LEGACY_MUSIC_PRODUCTS.has(productId) || productId === 'custom_song_request') {
            return NextResponse.json({ error: 'Invalid Product', entitled: false }, { status: 400 });
        }

        const accessToken = await getPayPalAccessToken();

        const orderPayload = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    reference_id: contentId || productId,
                    amount: {
                        currency_code: "USD",
                        value: product.price.toFixed(2),
                    },
                    description: product.name,
                    custom_id: JSON.stringify({
                        userId: user.id,
                        productId: productId,
                        contentId: contentId,
                        ...(metadata && typeof metadata === 'object' ? metadata : {}),
                    })
                },
            ],
        };

        const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(orderPayload),
        });

        const order = await response.json();

        if (!response.ok) {
            throw new Error(order.message || 'Failed to create PayPal order');
        }

        return NextResponse.json({
            id: order.id,
            status: order.status,
            entitled: false,
        });

    } catch (e: unknown) {
        console.error("Create Order Error:", e);
        return paymentErrorResponse(e);
    }
}
