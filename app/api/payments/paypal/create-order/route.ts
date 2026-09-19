import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { getPayPalAccessToken, getPayPalApiBase } from '@/lib/paypal-api';
import {
    buildCustomId,
    clientSuppliedPriceFields,
    lookupMusicStoreProduct,
} from '@/lib/music-paypal';

const PAYPAL_API = getPayPalApiBase();

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { productId, contentId, metadata } = body || {};

        const leakedPriceFields = clientSuppliedPriceFields(body);
        if (leakedPriceFields.length > 0) {
            return NextResponse.json(
                { error: `Client-supplied ${leakedPriceFields.join(', ')} is not allowed` },
                { status: 400 }
            );
        }

        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const product = lookupMusicStoreProduct(productId);
        if (!product) {
            return NextResponse.json({ error: 'Invalid Product' }, { status: 400 });
        }

        if (productId === 'single_track' && !contentId) {
            return NextResponse.json({ error: 'contentId is required for a single-track purchase' }, { status: 400 });
        }

        const accessToken = await getPayPalAccessToken();
        const orderPayload = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: String(contentId || productId).slice(0, 127),
                    amount: {
                        currency_code: 'USD',
                        value: Number(product.price).toFixed(2),
                    },
                    description: product.name,
                    custom_id: buildCustomId({
                        userId: user.id,
                        productId: product.id,
                        contentId: typeof contentId === 'string' ? contentId : undefined,
                        metadata,
                    }),
                },
            ],
        };

        const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
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
            productId: product.id,
            amount: Number(product.price).toFixed(2),
        });
    } catch (e: any) {
        console.error('Create Order Error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
