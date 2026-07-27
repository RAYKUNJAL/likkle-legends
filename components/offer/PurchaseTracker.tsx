'use client';

import { useEffect } from 'react';
import { firePurchase } from '@/lib/offer-tracking';

/**
 * Fires the Purchase conversion event on the thank-you page after mount.
 *
 * Rendered once on /offer/thank-you. The value reflects the Intro Mailer
 * price; if the user upgraded via the upsell, the upsell page already fired
 * its own purchase event, so this fires for the intro purchase only.
 */
export default function PurchaseTracker({
    value,
    currency = 'USD',
    upgraded = false,
}: {
    value: number;
    currency?: string;
    upgraded?: boolean;
}) {
    useEffect(() => {
        // Fire intro purchase. If upgraded, the upsell already fired its own.
        firePurchase(value, currency, {
            content_name: 'intro_mailer',
            transaction_id: `intro_${Date.now()}`,
        });
        if (upgraded) {
            // Best-effort: also tag the combined value.
            firePurchase(value + 10, currency, {
                content_name: 'intro_plus_legends',
                transaction_id: `combined_${Date.now()}`,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
