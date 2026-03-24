import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/admin';

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ valid: false, error: 'Code required' }, { status: 400 });
        }

        const admin = createAdminClient();

        const { data: discount } = await admin
            .from('discount_codes')
            .select('*')
            .eq('code', code.toUpperCase().trim())
            .single();

        if (!discount) {
            return NextResponse.json({ valid: false, error: 'Invalid code' });
        }

        // Check if expired
        if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
            return NextResponse.json({ valid: false, error: 'Code has expired' });
        }

        // Check if max uses reached
        if (discount.max_uses && discount.current_uses >= discount.max_uses) {
            return NextResponse.json({ valid: false, error: 'Code has reached maximum uses' });
        }

        return NextResponse.json({
            valid: true,
            discount_percent: discount.discount_percent,
            code: discount.code,
            description: discount.description || `${discount.discount_percent}% off`,
        });
    } catch (error) {
        console.error('Discount validation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Increment usage after successful checkout
export async function PATCH(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json({ error: 'Code required' }, { status: 400 });
        }

        const admin = createAdminClient();

        const { data: discount } = await admin
            .from('discount_codes')
            .select('id, current_uses')
            .eq('code', code.toUpperCase().trim())
            .single();

        if (!discount) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 404 });
        }

        await admin
            .from('discount_codes')
            .update({ current_uses: (discount.current_uses || 0) + 1 })
            .eq('id', discount.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Discount usage update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
