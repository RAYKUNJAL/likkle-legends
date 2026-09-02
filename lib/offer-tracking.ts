/**
 * Offer-funnel tracking constants and helpers.
 *
 * Pixel IDs are placeholders — replace with real IDs before running ads.
 *   - META_PIXEL_ID    → Facebook/Instagram ads pixel
 *   - GA4_MEASUREMENT_ID → Google Analytics 4 measurement ID (G-XXXX)
 *   - TIKTOK_PIXEL_ID  → TikTok ads pixel
 *
 * Keeping them in one file means a single place to swap placeholder → real IDs.
 */

// ─── Tracking IDs (env-driven at build time; real Meta pixel as fallback) ─
export const META_PIXEL_ID =
    process.env.NEXT_PUBLIC_META_PIXEL_ID || '4385961946335645';
export const GA4_MEASUREMENT_ID =
    process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || '';
export const TIKTOK_PIXEL_ID =
    process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || '';
// ──────────────────────────────────────────────────────────────────────────

export const SITE_URL =
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.likklelegends.com';

/**
 * Fire an AddPaymentInfo event on every tracking platform.
 * Called when the user clicks the PayPal button (i.e. begins payment).
 */
export function fireAddPaymentInfo(params: Record<string, unknown> = {}) {
    if (typeof window === 'undefined') return;
    try {
        // GA4
        if ((window as any).gtag) {
            (window as any).gtag('event', 'add_payment_info', {
                currency: 'USD',
                ...params,
            });
        }
        // Meta Pixel
        if ((window as any).fbq) {
            (window as any).fbq('track', 'AddPaymentInfo', params);
        }
        // TikTok
        if ((window as any).ttq?.track) {
            (window as any).ttq.track('AddPaymentInfo', params);
        }
    } catch (_e) {
        // Silent fail — analytics must never break the funnel.
    }
}

/**
 * Fire a Purchase event with value + currency on every platform.
 * Called on the thank-you page (and on successful upsell).
 */
export function firePurchase(value: number, currency = 'USD', extra: Record<string, unknown> = {}) {
    if (typeof window === 'undefined') return;
    try {
        if ((window as any).gtag) {
            (window as any).gtag('event', 'purchase', {
                transaction_id: extra.transaction_id || `offer_${Date.now()}`,
                value,
                currency,
                ...extra,
            });
        }
        if ((window as any).fbq) {
            (window as any).fbq('track', 'Purchase', {
                value,
                currency,
                content_name: extra.content_name || 'intro_mailer',
                ...extra,
            });
        }
        if ((window as any).ttq?.track) {
            (window as any).ttq.track('CompletePayment', {
                value,
                currency,
                content_type: 'product',
                content_name: extra.content_name || 'intro_mailer',
                ...extra,
            });
        }
    } catch (_e) {
        // Silent fail.
    }
}
