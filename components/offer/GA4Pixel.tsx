'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { GA4_MEASUREMENT_ID } from '@/lib/offer-tracking';

type GA4Event =
    | 'page_view'
    | 'begin_checkout'
    | 'add_payment_info'
    | 'purchase'
    | 'view_item';

interface GA4PixelProps {
    /** Event to fire after the GA4 tag loads. Defaults to page_view. */
    event?: GA4Event;
    /** Optional params passed to gtag('event', event, params). */
    params?: Record<string, unknown>;
}

/**
 * Google Analytics 4 tag for the /offer funnel.
 *
 * Loads gtag.js via next/script and fires the requested event. Add this
 * component to each funnel page; checkout fires begin_checkout, thank-you
 * fires purchase, the PayPal click fires add_payment_info (via fireAddPaymentInfo).
 *
 * Replace GA4_MEASUREMENT_ID in lib/offer-tracking.ts before launch.
 */
export default function GA4Pixel({ event = 'page_view', params = {} }: GA4PixelProps) {
    const enabled =
        GA4_MEASUREMENT_ID && GA4_MEASUREMENT_ID !== 'G-YOUR_GA4_ID';

    useEffect(() => {
        if (!enabled) return;
        if (typeof window === 'undefined') return;
        try {
            (window as any).gtag?.('event', event, params);
        } catch {
            // Silent fail.
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event, enabled]);

    if (!enabled) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="ga4-base" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    gtag('js', new Date());
                    gtag('config', '${GA4_MEASUREMENT_ID}', { send_page_view: false });
                `}
            </Script>
        </>
    );
}
