'use client';

import { useGeo } from '../GeoContext';
import { trackEvent } from '@/lib/analytics';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StickyMobileCTA() {
    const { variant, isLoading } = useGeo();
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 420) setShow(true);
            else setShow(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (isLoading) return null;

    const isUSA = variant === 'USA_MAIL_FIRST';
    const label = isUSA ? "Get $10 Intro Envelope" : "Start Free Forever";
    const action = isUSA ? '#offer' : '/signup?flow=FREE_ONBOARDING';

    const handleClick = () => {
        trackEvent('ll_cta_click', { cta_id: 'STICKY_MOBILE_CTA', variant });
        window.location.href = action;
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:hidden pointer-events-none"
                >
                    <div className="max-w-md mx-auto pointer-events-auto">
                        <button
                            onClick={handleClick}
                            className="w-full py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-2xl shadow-emerald-500/40 border border-white/20 active:scale-95 transition-all text-lg"
                        >
                            {label}
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
