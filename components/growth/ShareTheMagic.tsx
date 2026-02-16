
"use client";

import { useState } from 'react';
import { Share2, MessageSquare, Copy, CheckCircle2 } from 'lucide-react';
import { generatePersonalReferralAction } from '@/app/actions/growth';

export default function ShareTheMagic() {
    const [referralLink, setReferralLink] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShare = async (platform: 'whatsapp' | 'copy') => {
        setIsLoading(true);
        try {
            let link = referralLink;
            if (!link) {
                link = await generatePersonalReferralAction();
                setReferralLink(link);
            }

            if (!link) return;

            const text = "🌴 I'm using Likkle Legends to keep our culture alive for our kids! Join the club here: ";

            if (platform === 'whatsapp') {
                window.open(`https://wa.me/?text=${encodeURIComponent(text + link)}`, '_blank');
            } else {
                navigator.clipboard.writeText(text + link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            console.error("Sharing failed:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            {/* Tropical deco */}
            <div className="absolute top-0 right-0 text-9xl opacity-10 rotate-12 -mr-12 -mt-12 pointer-events-none">🌴</div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md text-xs font-black uppercase tracking-widest">
                        <Share2 size={14} /> Viral Growth
                    </div>
                    <h2 className="text-3xl font-black leading-tight">Share the Culture,<br />Get 1 Month Free!</h2>
                    <p className="text-indigo-100 font-bold">
                        Refer 3 friends and we'll give you a free month of Likkle Legends Plus. 🎁
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button
                        onClick={() => handleShare('whatsapp')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 transition-all text-white px-8 py-5 rounded-2xl font-black text-lg active:scale-95 shadow-xl shadow-emerald-900/20"
                    >
                        <MessageSquare fill="white" size={24} />
                        Share on WhatsApp
                    </button>

                    <button
                        onClick={() => handleShare('copy')}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 transition-all text-white px-8 py-5 rounded-2xl font-black text-lg backdrop-blur-md border border-white/20"
                    >
                        {copied ? <CheckCircle2 className="text-emerald-400" /> : <Copy />}
                        {copied ? 'Link Copied!' : 'Copy Invite Link'}
                    </button>
                </div>
            </div>
        </div>
    );
}
