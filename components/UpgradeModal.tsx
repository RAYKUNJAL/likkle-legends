"use client";

import { useRouter } from 'next/navigation';
import { X, Crown, Sparkles, Zap, Star } from 'lucide-react';
import { useEffect } from 'react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiredTier?: string;
    featureName?: string;
}

const TIER_INFO: Record<string, {
    name: string;
    price: string;
    color: string;
    icon: string;
    perks: string[];
    plan: string;
}> = {
    starter_mailer: {
        name: 'Starter Mailer',
        price: '$4.99/mo',
        color: 'from-blue-500 to-cyan-500',
        icon: '📬',
        perks: ['Monthly activity box', 'Digital stories & songs', 'Island missions'],
        plan: 'starter_mailer',
    },
    legends_plus: {
        name: 'Legends Plus',
        price: '$9.99/mo',
        color: 'from-purple-600 to-pink-500',
        icon: '👑',
        perks: ['Everything in Starter', 'AI Story Studio', 'Premium lessons + games', 'Monthly vinyl record'],
        plan: 'legends_plus',
    },
    family_legacy: {
        name: 'Family Legacy',
        price: '$19.99/mo',
        color: 'from-amber-500 to-orange-600',
        icon: '🌺',
        perks: ['Everything in Legends+', 'Up to 4 children', 'Heritage DNA story', 'Grandparent dashboard'],
        plan: 'family_legacy',
    },
};

export default function UpgradeModal({ isOpen, onClose, requiredTier = 'legends_plus', featureName }: UpgradeModalProps) {
    const router = useRouter();

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const tier = TIER_INFO[requiredTier] || TIER_INFO['legends_plus'];

    const handleUpgrade = () => {
        onClose();
        router.push(`/checkout?plan=${tier.plan}&cycle=month`);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-blue-950/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header gradient */}
                <div className={`h-40 bg-gradient-to-br ${tier.color} flex flex-col items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.2),_transparent)]" />
                    <div className="text-6xl mb-2 drop-shadow-lg">{tier.icon}</div>
                    <p className="text-white/80 font-black text-xs uppercase tracking-widest">Upgrade Required</p>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <h2 className="text-2xl font-black text-gray-900 mb-1">
                        Unlock {featureName ? `"${featureName}"` : 'This Feature'}
                    </h2>
                    <p className="text-gray-500 font-medium mb-6 text-sm leading-relaxed">
                        This content requires <strong className="text-gray-800">{tier.name}</strong>. Join thousands of Caribbean families exploring their heritage!
                    </p>

                    {/* Perks */}
                    <div className="space-y-2.5 mb-8">
                        {tier.perks.map((perk, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <Star size={12} className="text-green-600 fill-green-600" />
                                </div>
                                <span className="text-sm font-bold text-gray-700">{perk}</span>
                            </div>
                        ))}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Starting at</p>
                            <p className="text-3xl font-black text-gray-900">{tier.price}</p>
                        </div>
                        <button
                            onClick={handleUpgrade}
                            className={`flex items-center gap-2 px-8 py-4 bg-gradient-to-r ${tier.color} text-white rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all`}
                        >
                            <Crown size={18} />
                            Upgrade Now
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
}
