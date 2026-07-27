'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { META_PIXEL_ID } from '@/lib/offer-tracking';

type MetaEvent =
    | 'PageView'
    | 'InitiateCheckout'
    | 'AddPaymentInfo'
    | 'Purchase'
    | 'ViewContent';

interface MetaPixelProps {
    /** Event to fire after the pixel loads. Defaults to PageView. */
    event?: MetaEvent;
    /** Optional params passed to fbq('track', event, params). */
    params?: Record<string, unknown>;
}

/**
 * Meta (Facebook/Instagram) Pixel for the /offer funnel.
 *
 * Loads the base pixel code once via next/script and fires the requested
 * standard event. Add this component to each funnel page; on checkout it
 * fires InitiateCheckout, on thank-you it fires Purchase (with value).
 *
 * Replace META_PIXEL_ID in lib/offer-tracking.ts before launch.
 */
export default function MetaPixel({ event = 'PageView', params = {} }: MetaPixelProps) {
    // Skip rendering real pixel code when the ID is still the placeholder —
    // avoids noisy "invalid pixel id" console errors in dev/preview.
    const enabled = META_PIXEL_ID && META_PIXEL_ID !== 'YOUR_META_PIXEL_ID';

    useEffect(() => {
        if (!enabled) return;
        if (typeof window === 'undefined') return;
        // The base code initializes fbq. If it's already loaded (e.g. on a
        // client-side route change), just fire the event.
        const fire = () => {
            try {
                (window as any).fbq?.('track', event, params);
            } catch {
                // Silent fail — analytics must never break the funnel.
            }
        };
        fire();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [event, enabled]);

    if (!enabled) return null;

    return (
        <>
            <Script id="meta-pixel-base" strategy="afterInteractive">
                {`
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${META_PIXEL_ID}');
                `}
            </Script>
        </>
    );
}
