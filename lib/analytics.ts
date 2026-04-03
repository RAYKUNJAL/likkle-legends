
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

/**
 * Fire standard e-commerce conversion events with correct names for each platform.
 * GA4 uses snake_case names; Meta Pixel uses PascalCase.
 */
export function fireConversionEvent(
    eventName: 'begin_checkout' | 'purchase' | 'view_item',
    params: Record<string, unknown> = {}
) {
    try {
        if (typeof window === 'undefined') return;

        // Google Analytics 4 (uses snake_case events natively)
        if ((window as any).gtag) {
            (window as any).gtag('event', eventName, params);
        }

        // Meta / Facebook Pixel (uses PascalCase Standard Events)
        if ((window as any).fbq) {
            const fbMap: Record<string, string> = {
                begin_checkout: 'InitiateCheckout',
                purchase: 'Purchase',
                view_item: 'ViewContent',
            };
            (window as any).fbq('track', fbMap[eventName] ?? eventName, params);
        }

        // TikTok Pixel
        if ((window as any).ttq?.track) {
            (window as any).ttq.track(eventName, params);
        }

        // Snapchat Pixel
        if ((window as any).snaptr) {
            (window as any).snaptr('track', eventName, params);
        }
    } catch {
        // Silently fail if analytics is blocked
    }
}

import { useEffect } from 'react';

/**
 * Hook to track scroll depth on landing pages
 */
export function useScrollTracking() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let tracked25 = false;
        let tracked50 = false;
        let tracked75 = false;
        let tracked90 = false;

        const handleScroll = () => {
            const scrollPos = window.scrollY + window.innerHeight;
            const height = document.documentElement.scrollHeight;
            const percentage = (scrollPos / height) * 100;

            if (percentage > 25 && !tracked25) {
                trackEvent('scroll_depth_25');
                tracked25 = true;
            }
            if (percentage > 50 && !tracked50) {
                trackEvent('scroll_depth_50');
                tracked50 = true;
            }
            if (percentage > 75 && !tracked75) {
                trackEvent('scroll_depth_75');
                tracked75 = true;
            }
            if (percentage > 90 && !tracked90) {
                trackEvent('scroll_depth_90');
                tracked90 = true;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
}

/**
 * Game-specific analytics events
 */
export const gameAnalyticsEvents = {
    gameStarted: (gameId: string, userType: 'guest' | 'authenticated', sessionId?: string) => {
        trackEvent('game_started', {
            game_id: gameId,
            user_type: userType,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
        });
    },

    gameLevelCompleted: (gameId: string, level: number, sessionId?: string) => {
        trackEvent('game_level_completed', {
            game_id: gameId,
            level,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
        });
    },

    gameScoreEarned: (gameId: string, score: number, level: number, sessionId?: string) => {
        trackEvent('game_score', {
            game_id: gameId,
            score,
            level,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
        });
    },

    gameQuit: (gameId: string, timePlayedMinutes: number, finalLevel: number, finalScore: number, sessionId?: string) => {
        trackEvent('game_quit', {
            game_id: gameId,
            time_played_minutes: timePlayedMinutes,
            final_level: finalLevel,
            final_score: finalScore,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
        });
    },

    paywallShown: (gameId: string, reason: 'level_complete' | 'premium_game' | 'guest_session', sessionId?: string) => {
        trackEvent('game_upgrade_prompt_shown', {
            game_id: gameId,
            reason,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
        });
    },

    paywallClicked: (gameId: string, action: 'subscribe' | 'skip' | 'try_trial', sessionId?: string) => {
        trackEvent('game_upgrade_clicked', {
            game_id: gameId,
            action,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
        });
    },

    guestConverted: (gameId: string, durationMinutes: number, finalLevel: number, finalScore: number, sessionId?: string) => {
        trackEvent('guest_converted', {
            game_id: gameId,
            duration_minutes: durationMinutes,
            final_level: finalLevel,
            final_score: finalScore,
            session_id: sessionId,
            timestamp: new Date().toISOString(),
        });
    },
};
