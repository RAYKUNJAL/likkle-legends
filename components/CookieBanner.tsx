"use client";

import { useState, useEffect } from 'react';
import { CookieConsent } from './CookieConsent';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (consent === null) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setIsVisible(false);
        window.dispatchEvent(new Event('cookie_consent_updated'));
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'false');
        setIsVisible(false);
    };

    const handleOpenLegal = (doc: string) => {
        if (doc === 'cookies') {
            window.open('/privacy#cookies', '_blank');
        }
    };

    if (!isVisible) return null;

    return (
        <CookieConsent
            onAccept={handleAccept}
            onDecline={handleDecline}
            onOpenLegal={handleOpenLegal}
        />
    );
}
