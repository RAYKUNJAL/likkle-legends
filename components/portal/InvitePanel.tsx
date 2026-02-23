"use client";

import { useState, useEffect } from 'react';
import { Copy, Check, Users, Star, ChevronRight, Share2, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateReferralCode, getReferralStats } from '@/app/actions/referrals';
import toast from 'react-hot-toast';

interface ReferralStats {
    code: string;
    url: string;
    clicks: number;
    conversions: number;
    xpEarned: number;
}

const MILESTONE_REWARDS = [
    { count: 1, label: '+100 XP for you + your friend', emoji: '⚡' },
    { count: 5, label: '"Social Butterfly" badge + 500 bonus XP', emoji: '🦋' },
    { count: 10, label: '500 bonus XP credit', emoji: '💎' },
];

export default function InvitePanel() {
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                let data = await getReferralStats();
                if (!data) {
                    // Auto-generate on first open
                    const generated = await generateReferralCode();
                    data = { ...generated, xpEarned: 0 };
                }
                setStats(data);
            } catch (e) {
                toast.error('Could not load invite link');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleCopy = async () => {
        if (!stats?.url) return;
        await navigator.clipboard.writeText(stats.url);
        setCopied(true);
        toast.success('Invite link copied! 🎉');
        setTimeout(() => setCopied(false), 2500);
    };

    const handleShare = async () => {
        if (!stats?.url) return;
        if (navigator.share) {
            await navigator.share({
                title: 'Join Likkle Legends! 🌴',
                text: `Your child will love Likkle Legends — Caribbean stories, music & culture! We both get 100 XP when you join: `,
                url: stats.url,
            }).catch(() => { });
        } else {
            handleCopy();
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 animate-pulse">
                <div className="h-5 bg-zinc-100 rounded-full w-1/3 mb-4" />
                <div className="h-12 bg-zinc-100 rounded-2xl" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-6 shadow-xl shadow-purple-500/20 overflow-hidden relative"
        >
            {/* Deco */}
            <div className="absolute top-0 right-0 text-[80px] opacity-10 leading-none pointer-events-none select-none">🌴</div>

            <div className="relative">
                <p className="text-purple-200 text-[10px] font-black uppercase tracking-widest mb-1">Invite Friends</p>
                <h2 className="text-white text-xl font-black mb-1">Grow Together, Win Together</h2>
                <p className="text-purple-200 text-xs font-medium mb-5">
                    Both you and your friend earn <span className="text-white font-black">100 XP</span> when they join!
                </p>

                {/* Stats row */}
                {stats && (
                    <div className="flex gap-4 mb-5">
                        {[
                            { label: 'Invited', value: stats.conversions },
                            { label: 'Link Clicks', value: stats.clicks },
                            { label: 'XP Earned', value: stats.xpEarned },
                        ].map(s => (
                            <div key={s.label} className="flex-1 bg-white/10 rounded-2xl p-3 text-center">
                                <p className="text-white font-black text-xl leading-none">{s.value}</p>
                                <p className="text-purple-200 text-[9px] font-bold uppercase tracking-wider mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Link box */}
                <div className="bg-white/10 border border-white/20 rounded-2xl p-3 mb-4 flex items-center gap-3">
                    <p className="text-white text-xs font-bold flex-1 truncate">{stats?.url}</p>
                    <button
                        onClick={handleCopy}
                        className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-violet-700 hover:scale-110 transition-all flex-shrink-0"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={handleCopy}
                        className="flex-1 py-3 bg-white text-violet-700 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Copy size={16} />
                        Copy Link
                    </button>
                    <button
                        onClick={handleShare}
                        className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-white/20 active:scale-[0.98] transition-all"
                    >
                        <Share2 size={16} />
                        Share
                    </button>
                </div>

                {/* Milestones */}
                <div className="space-y-2">
                    <p className="text-purple-200 text-[10px] font-black uppercase tracking-widest mb-2">Invite Milestones</p>
                    {MILESTONE_REWARDS.map((m, i) => {
                        const achieved = (stats?.conversions || 0) >= m.count;
                        return (
                            <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${achieved ? 'bg-white/20 border-white/30' : 'bg-white/5 border-white/10 opacity-60'}`}>
                                <span className="text-xl">{m.emoji}</span>
                                <div className="flex-1">
                                    <p className={`text-xs font-black ${achieved ? 'text-white' : 'text-purple-200'}`}>
                                        {m.count} friend{m.count > 1 ? 's' : ''} invited
                                    </p>
                                    <p className="text-purple-200 text-[10px] font-medium">{m.label}</p>
                                </div>
                                {achieved && <Check size={16} className="text-green-300" />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
