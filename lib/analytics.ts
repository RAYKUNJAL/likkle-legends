
/**
 * Defensive analytics wrapper to handle blocked tracking scripts
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
    try {
        if (typeof window !== 'undefined') {
            // Google Analytics
            if ((window as any).gtag) {
                (window as any).gtag('event', eventName, params);
            }

            // Facebook Pixel
            if ((window as any).fbq) {
                (window as any).fbq('track', eventName, params);
            }

            // TikTok
            if ((window as any).ttq) {
                (window as any).ttq.track(eventName, params);
            }

            // Snapchat
            if ((window as any).snaptr) {
                (window as any).snaptr('track', eventName, params);
            }
        }
    } catch (error) {
        // Silently fail if blocked or script fails
        console.warn('Analytics event blocked or failed:', eventName);
    }
};
