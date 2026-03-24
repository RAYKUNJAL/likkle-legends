"use client";

import { useState, useEffect } from "react";
import { Gift, Copy, CheckCircle, X, Share2 } from "lucide-react";

interface ReferralWidgetProps {
    userId: string;
    referralCode?: string | null;
}

export default function ReferralWidget({ userId, referralCode }: ReferralWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://likklelegends.com';
    const referralLink = referralCode
        ? `${baseUrl}/signup?ref=${referralCode}`
        : `${baseUrl}/signup?referral=${userId}`;

    // Don't show if dismissed this session
    if (dismissed) return null;

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        window.open(
            `https://wa.me/?text=${encodeURIComponent(
                `My kids love learning about Caribbean culture on Likkle Legends! Free stories, games & printables. Join us: ${referralLink}`
            )}`,
            "_blank"
        );
    };

    const shareFacebook = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
            "_blank"
        );
    };

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={() => setIsOpen(true)}
                    className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all font-bold text-sm"
                >
                    <Gift className="w-5 h-5 group-hover:animate-bounce" />
                    Refer & Earn Free Months!
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-40 w-80">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-5 text-white relative">
                    <button
                        onClick={() => setDismissed(true)}
                        className="absolute top-3 right-3 p-1 text-white/60 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 mb-1">
                        <Gift className="w-5 h-5" />
                        <span className="font-black text-sm uppercase tracking-wider">Refer a Friend</span>
                    </div>
                    <p className="text-white/90 text-sm">Get 1 free month for every friend who joins!</p>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Milestones */}
                    <div className="space-y-2 mb-5 text-xs">
                        {[
                            { count: "1 referral", reward: "Exclusive badge" },
                            { count: "3 referrals", reward: "1 free month" },
                            { count: "5 referrals", reward: "2 free months" },
                            { count: "10 referrals", reward: "Free upgrade forever" },
                        ].map((m, i) => (
                            <div key={i} className="flex items-center justify-between text-gray-600">
                                <span>{m.count}</span>
                                <span className="font-bold text-orange-500">{m.reward}</span>
                            </div>
                        ))}
                    </div>

                    {/* Copy Link */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={referralLink}
                            readOnly
                            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-500 bg-gray-50 truncate"
                        />
                        <button
                            onClick={copyLink}
                            className="px-3 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-1"
                        >
                            {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? "Done" : "Copy"}
                        </button>
                    </div>

                    {/* Share Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={shareWhatsApp}
                            className="py-2.5 bg-green-500 text-white rounded-xl font-bold text-xs hover:bg-green-600 transition-colors"
                        >
                            WhatsApp
                        </button>
                        <button
                            onClick={shareFacebook}
                            className="py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors"
                        >
                            Facebook
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
