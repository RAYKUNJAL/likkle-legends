/**
 * Island Analytics Service
 * Handles event tracking for village adventures.
 */

export const trackEvent = async (eventName: string, params: Record<string, any> = {}) => {
    if (typeof window === 'undefined') return;

    // 1. Console Log for Debugging
    console.log(`[IsleAnalytics] Event: ${eventName}`, params);

    // 2. Local Storage Log (Island History)
    try {
        const history = JSON.parse(localStorage.getItem('island_activity_history') || '[]');
        history.push({
            event: eventName,
            params,
            timestamp: new Date().toISOString()
        });
        // Keep only last 50 events locally
        if (history.length > 50) history.shift();
        localStorage.setItem('island_activity_history', JSON.stringify(history));
    } catch (e) {
        console.warn("Analytics history local storage failed");
    }

    // 3. TODO: Send to Supabase/PostHog/Mixpanel for production
};
