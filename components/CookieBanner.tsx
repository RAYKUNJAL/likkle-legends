"use client";

import { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie_consent');
        if (consent === null) {
            // Show banner after a small delay
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setIsVisible(false);
        // Dispatch event so AnalyticsLoader knows to start tracking immediately
        window.dispatchEvent(new Event('cookie_consent_updated'));
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'false');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:flex items-center gap-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 mb-4 md:mb-0">
                    <Cookie className="text-primary" size={24} />
                </div>

                <div className="flex-1 mb-4 md:mb-0">
                    <h3 className="font-bold text-gray-900 mb-1">We respect your family's privacy 🍪</h3>
                    <p className="text-sm text-gray-600">
                        We use cookies to analyze traffic on our marketing pages.
                        <strong>We never track activity in the children's portal.</strong>
                        <a href="/privacy" className="text-primary hover:underline ml-1">Read our Privacy Policy</a>.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-6 py-2 text-sm font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-105"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
