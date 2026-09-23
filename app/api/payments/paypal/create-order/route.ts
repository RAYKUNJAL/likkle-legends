import { NextRequest, NextResponse } from 'next/server';
import { MUSIC_STORE_PRODUCTS, GAMIFICATION_PRODUCTS } from '@/lib/paypal';
import { KID_IAP_PRODUCT_IDS, getParentOffer } from '@/lib/paypal-offers';
import { createOneTimeOrder, getPayPalAccessToken, paymentErrorResponse, paypalApiBase, requireParentPayer } from '@/lib/paypal-checkout';

const PAYPAL_API = paypalApiBase();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, contentId, metadata, sku } = body;
        const requestedSku = sku || productId;

        const payer = await requireParentPayer(request);
        if (!payer.ok) return payer.response;
        const user = payer.user;

        if (KID_IAP_PRODUCT_IDS.has(requestedSku)) {
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

        // 2. Lookup Price (from music store or gamification products)
        // @ts-ignore
        let product = MUSIC_STORE_PRODUCTS[productId] || GAMIFICATION_PRODUCTS[productId];
        if (!product) return NextResponse.json({ error: 'Invalid Product', entitled: false }, { status: 400 });

        // 3. Create Order
        const accessToken = await getPayPalAccessToken();

        const orderPayload = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    reference_id: contentId || productId, // Use content ID (Song ID) or Product ID
                    amount: {
                        currency_code: "USD",
                        value: product.price.toFixed(2),
                    },
                    description: product.name,
                    custom_id: JSON.stringify({
                        userId: user.id,
                        productId: productId,
                        contentId: contentId,
                        ...metadata // e.g. custom song details ID
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
