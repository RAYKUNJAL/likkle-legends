import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { MUSIC_STORE_PRODUCTS } from '@/lib/paypal';

const PAYPAL_API = process.env.NODE_ENV === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
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
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId, contentId, metadata } = body; // productId matches MUSIC_STORE_PRODUCTS key

        // 1. Verify Auth
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 2. Lookup Price
        // @ts-ignore
        const product = MUSIC_STORE_PRODUCTS[productId];
        if (!product) return NextResponse.json({ error: 'Invalid Product' }, { status: 400 });

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
            status: order.status
        });

    } catch (e: any) {
        console.error("Create Order Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
