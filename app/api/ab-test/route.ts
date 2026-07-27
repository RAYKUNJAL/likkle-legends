import { NextRequest, NextResponse } from 'next/server';

/**
 * A/B test assignment endpoint.
 * Assigns visitors to variant A or B for the /offer hero headline test.
 * Stores the variant in a cookie (ll_ab_variant) for 30 days.
 *
 * Variant A: 'Caribbean learning that feels like home for kids 3–8' (control)
 * Variant B: 'Help your child read, learn, and love their Caribbean roots'
 */
export async function GET(request: NextRequest) {
    const testId = 'offer_hero_2026';
    const cookieName = 'll_ab_variant';
    const existingVariant = request.cookies.get(cookieName)?.value;

    // If already assigned a valid variant, keep it (sticky).
    if (existingVariant === 'A' || existingVariant === 'B') {
        return NextResponse.json({
            testId,
            variant: existingVariant,
            sticky: true,
        });
    }

    // 50/50 split
    const variant = Math.random() < 0.5 ? 'A' : 'B';

    const response = NextResponse.json({
        testId,
        variant,
        sticky: false,
    });

    // Set cookie — 30 day expiry so the visitor sees the same variant on return.
    response.cookies.set(cookieName, variant, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        sameSite: 'lax',
        httpOnly: false, // client-side JS reads it to pick the headline
    });

    return response;
}

export async function POST(request: NextRequest) {
    // Allow POST too (some callers prefer it).
    return GET(request);
}
