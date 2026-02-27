"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Hero } from '@/components/landing-v3/Hero';

const MeetTheLegends = dynamic(() => import('@/components/landing-v3/MeetTheLegends').then(m => ({ default: m.MeetTheLegends })), { ssr: false, loading: () => <div className="h-96 bg-white" /> });
const WaitlistModal  = dynamic(() => import('@/components/landing-v3/WaitlistModal').then(m => ({ default: m.WaitlistModal })),   { ssr: false });

/**
 * Tiny client component that owns the waitlist modal state.
 * Isolating it here keeps the parent page.tsx as a Server Component,
 * enabling ISR caching and fast TTFB.
 */
export function WaitlistController() {
    const [isOpen, setIsOpen] = useState(false);
    const open  = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return (
        <>
            <Hero onOpenWaitlist={open} />
            <MeetTheLegends onOpenWaitlist={open} />
            <WaitlistModal isOpen={isOpen} onClose={close} />
        </>
    );
}
