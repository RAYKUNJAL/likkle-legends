import React from 'react';

interface CookieConsentProps {
    onAccept: () => void;
    onDecline: () => void;
    onOpenLegal: (doc: any) => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline, onOpenLegal }) => {
    return (
        <div className="fixed bottom-6 left-6 right-6 z-[1000] bg-white border-4 border-blue-100 p-6 md:p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex-1 space-y-2">
                <h4 className="font-heading font-black text-blue-950 text-xl flex items-center gap-2">
                    <span>🍪</span> Caribbean Cookies?
                </h4>
                <p className="text-blue-900/60 font-bold text-sm leading-relaxed">
                    We use essential cookies to remember yuh child's stories and progress. No creepy tracking, just island magic!
                    Read our <button onClick={() => onOpenLegal('cookies')} className="text-blue-600 underline">Cookie Policy</button> to learn more.
                </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button
                    onClick={onDecline}
                    className="flex-1 md:flex-none px-6 py-3 rounded-2xl bg-blue-50 text-blue-400 font-black text-xs uppercase tracking-widest hover:bg-blue-100 transition-all"
                >
                    Decline
                </button>
                <button
                    onClick={onAccept}
                    className="flex-1 md:flex-none px-10 py-3 rounded-2xl bg-orange-500 text-white font-black text-xs uppercase tracking-widest shadow-lg hover:bg-orange-400 transition-all"
                >
                    Irie, Accept!
                </button>
            </div>
        </div>
    );
};
