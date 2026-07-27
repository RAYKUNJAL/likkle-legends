'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { TIKTOK_PIXEL_ID } from '@/lib/offer-tracking';

type TikTokEvent =
    | 'ViewContent'
    | 'InitiateCheckout'
    | 'AddPaymentInfo'
    | 'CompletePayment';

interface TikTokPixelProps {
    /** Event to fire after the pixel loads. Defaults to ViewContent. */
    event?: TikTokEvent;
    /** Optional params passed to ttq.track(event, params). */
    params?: Record<string, unknown>;
}

/**
 * TikTok Pixel for the /offer funnel (recommended for 2026 paid social).
 *
 * Loads the base pixel code once via next/script and fires the requested
 * standard event. On the offer landing page fire ViewContent; on checkout
 * fire InitiateCheckout; on thank-you fire CompletePayment (with value).
 *
 * Replace TIKTOK_PIXEL_ID in lib/offer-tracking.ts before launch.
 */
export default function TikTokPixel({
    event = 'ViewContent',
    params = {},
}: TikTokPixelProps) {
    const enabled =
        TIKTOK_PIXEL_ID && TIKTOK_PIXEL_ID !== 'YOUR_TIKTOK_PIXEL_ID';

    useEffect(() => {
        if (!enabled) return;
        if (typeof window === 'undefined') return;
        try {
            (window as any).ttq?.track(event, params);
        } catch {
            // Silent fail.
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event, enabled]);

    if (!enabled) return null;

    return (
        <>
            <Script id="tiktok-pixel-base" strategy="afterInteractive">
                {`
                    !function (w, d, t) {
                        w.TiktokAnalyticsObject=t; var ttq=w[t]=w[t]||[];
                        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
                        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                        ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                        ttq.load('${TIKTOK_PIXEL_ID}');
                        ttq.page();
                    }(window, document, 'ttq');
                `}
            </Script>
        </>
    );
}
