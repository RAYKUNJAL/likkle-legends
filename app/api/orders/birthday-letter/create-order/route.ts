import { NextRequest, NextResponse } from 'next/server';
import { GAMIFICATION_PRODUCTS } from '@/lib/paypal';
import { createPayPalCatalogOrder } from '@/lib/paypal-server';
import { checkRateLimit } from '@/lib/api/rate-limit';

const TIER_TO_PRODUCT: Record<string, keyof typeof GAMIFICATION_PRODUCTS> = {
    birthday_letter_basic: 'birthday_letter_basic',
    birthday_letter_premium: 'birthday_letter_premium',
    standard: 'birthday_letter_basic',
    premium: 'birthday_letter_premium',
};

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'global';
    const limited = checkRateLimit(`birthday-create:${ip}`, 8, 10 * 60 * 1000);
    if (limited) return limited;

    try {
        const body = await request.json();
        const productKey = TIER_TO_PRODUCT[String(body.productId || body.tier || '').toLowerCase()];
        const product = productKey ? GAMIFICATION_PRODUCTS[productKey] : null;
        if (!product) {
            return NextResponse.json({ error: 'Unknown birthday letter tier' }, { status: 400 });
        }

        const order = await createPayPalCatalogOrder({
            productId: product.id,
            productName: product.name,
            price: Number(product.price),
            customId: JSON.stringify({ productId: product.id }),
            description: product.description,
        });

        return NextResponse.json({ id: order.id, status: order.status, amount: Number(product.price), productId: product.id });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not create order';
        console.error('[BIRTHDAY_LETTER] create-order failed:', message);
        return NextResponse.json({ error: 'Could not create PayPal order' }, { status: 502 });
    }
}
