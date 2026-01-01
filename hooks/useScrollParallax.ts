"use client";

import { useEffect } from 'react';

/**
 * A lightweight hook to apply parallax effects via CSS variables.
 * @param intensity Multiplier for the scroll effect.
 * @param selector Optional selector for specific elements. If omitted, applies to --scroll-y on body.
 */
export function useScrollParallax(intensity: number = 0.1, selector?: string) {
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY;
            const val = scrolled * intensity;

            if (selector) {
                document.querySelectorAll(selector).forEach((el) => {
                    if (el instanceof HTMLElement) {
                        el.style.setProperty('--parallax-y', `${val}px`);
                    }
                });
            } else {
                document.documentElement.style.setProperty('--scroll-y', `${scrolled}px`);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [intensity, selector]);
}
