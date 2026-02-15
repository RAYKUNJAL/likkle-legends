'use client';

type EventName =
    | 'll_page_view'
    | 'll_geo_toggle_set'
    | 'll_cta_click'
    | 'll_scroll_depth'
    | 'll_start_free'
    | 'll_onboarding_step'
    | 'll_purchase';

interface EventParams {
    [key: string]: string | number | boolean | undefined;
}

export const trackEvent = (name: EventName, params?: EventParams) => {
    if (typeof window === 'undefined') return;

    // Log to console for debugging
    console.log(`[EVENT] ${name}`, params);

    // Placeholder for GTM / Facebook Pixel / Posthog
    if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
            event: name,
            ...params
        });
    }

    // Example: Track to custom internal analytics API
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ name, params, timestamp: Date.now() }) });
};

// Hook for scroll depth tracking
import { useEffect } from 'react';

export function useScrollTracking() {
    useEffect(() => {
        const thresholds = [25, 50, 75, 90];
        const tracked = new Set<number>();

        const handleScroll = () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

            thresholds.forEach(threshold => {
                if (scrollPercent >= threshold && !tracked.has(threshold)) {
                    trackEvent('ll_scroll_depth', { percent: threshold });
                    tracked.add(threshold);
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
}
