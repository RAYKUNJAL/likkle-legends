"use client";

import { useState, useEffect } from 'react';
import LeadCaptureModal from '@/components/LeadCaptureModal';

interface HomepagePopupProps {
    delaySeconds?: number; // How long to wait before showing
    showOnScroll?: boolean; // Show when user scrolls 50%
}

export default function HomepagePopup({
    delaySeconds = 5,
    showOnScroll = true
}: HomepagePopupProps) {
    const [showPopup, setShowPopup] = useState(false);
    const [hasDismissed, setHasDismissed] = useState(false);

    useEffect(() => {
        // Check if user already has email or dismissed
        const hasEmail = localStorage.getItem('ll_lead_email');
        const dismissed = sessionStorage.getItem('ll_popup_dismissed');

        if (hasEmail || dismissed) {
            return;
        }

        // Timer-based trigger
        const timer = setTimeout(() => {
            if (!hasDismissed) {
                setShowPopup(true);
            }
        }, delaySeconds * 1000);

        // Scroll-based trigger
        const handleScroll = () => {
            if (hasDismissed) return;

            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 50 && showOnScroll) {
                setShowPopup(true);
            }
        };

        if (showOnScroll) {
            window.addEventListener('scroll', handleScroll);
        }

        return () => {
            clearTimeout(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [delaySeconds, showOnScroll, hasDismissed]);

    const handleClose = () => {
        setShowPopup(false);
        setHasDismissed(true);
        sessionStorage.setItem('ll_popup_dismissed', 'true');
    };

    const handleSuccess = (email: string) => {
        localStorage.setItem('ll_lead_email', email);
        setShowPopup(false);
    };

    return (
        <LeadCaptureModal
            isOpen={showPopup}
            onClose={handleClose}
            source="homepage_popup"
            onSuccess={handleSuccess}
        />
    );
}
