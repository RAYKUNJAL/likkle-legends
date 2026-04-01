"use client";

import React, { useState, useEffect } from 'react';

export const CookieConsentBanner: React.FC = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('likkle_cookie_consent');
        if (!consent) setShow(true);
    }, []);

    const handleAccept = () => {
        localStorage.setItem('likkle_cookie_consent', 'true');
        window.dispatchEvent(new Event('likkle_cookie_consent_updated'));
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-[9999] animate-in slide-in-from-bottom duration-500">
            <div className="bg-white/90 backdrop-blur-xl border-t-4 border-blue-100 p-6 md:p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center gap-6">
                <div className="text-4xl animate-bounce">🍪</div>
                <div className="flex-1 text-center md:text-left">
                    <h4 className="font-heading font-black text-blue-950 text-lg">We use cookies for magic!</h4>
                    <p className="text-xs font-bold text-blue-900/70 mt-1 max-w-xl">
                        Essential cookies help us save your stories and keep the village safe. We do not use third-party tracking ads.
                        <a href="/privacy" className="underline text-blue-600 ml-1 hover:text-blue-800">Read Cookie Policy</a>.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShow(false)}
                        className="px-6 py-4 md:py-3 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 text-xs w-full md:w-auto transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-gray-600"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-8 py-4 md:py-3 rounded-2xl bg-orange-500 text-white font-black text-xs uppercase tracking-widest shadow-lg hover:bg-orange-600 active:scale-95 transition-all w-full md:w-auto focus:outline-2 focus:outline-offset-2 focus:outline-white"
                    >
                        Irie, Accept!
                    </button>
                </div>
            </div>
        </div>
    );
};
