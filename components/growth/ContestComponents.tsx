"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Trophy, Users, Gift, ArrowRight, Loader2, CheckCircle2, Copy, Twitter, Facebook, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContestEntryFormProps {
    contestSlug: string;
    onSuccess: (entry: any) => void;
}

export function ContestEntryForm({ contestSlug, onSuccess }: ContestEntryFormProps) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { enterContest } = await import('@/app/actions/growth');
            const result = await enterContest(contestSlug, email);

            if (result.success) {
                toast.success(result.message);
                onSuccess(result.entry);
            } else {
                toast.error(result.message);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to enter contest");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
                <input
                    type="email"
                    required
                    placeholder="Enter your email to join..."
                    className="w-full h-16 px-6 rounded-2xl border-4 border-orange-100 focus:border-orange-500 focus:outline-none text-lg font-bold transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-16 bg-orange-500 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <>
                        JOIN THE GIVEAWAY
                        <ArrowRight size={20} />
                    </>
                )}
            </button>
        </form>
    );
}

interface ContestStatusCardProps {
    entry: any;
    prizes?: any;
    leaderboard?: any[];
}

export function ContestStatusCard({ entry, prizes, leaderboard }: ContestStatusCardProps) {
    const shareLink = `${window.location.origin}${window.location.pathname}?ref=${entry.referral_link_code || entry.id}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        toast.success("Link copied to clipboard!");
    };

    const handleShare = async (platform: string) => {
        // Log the action to award points
        try {
            const { awardActionPoints } = await import('@/app/actions/growth');
            await awardActionPoints(entry.id, `share_${platform.toLowerCase()}`);
            toast.success(`Points awarded for sharing on ${platform}!`);
        } catch (err) {
            console.error("Failed to award share points", err);
        }

        // Open share link
        const text = encodeURIComponent(`Enter the ${prizes?.[0]?.name || 'Legendary'} Giveaway! 🌴📖`);
        const url = encodeURIComponent(shareLink);

        let finalUrl = '';
        if (platform === 'Twitter') finalUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        if (platform === 'Facebook') finalUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        if (platform === 'WhatsApp') finalUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;

        if (finalUrl) window.open(finalUrl, '_blank');
    };

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 p-6 rounded-3xl border-2 border-orange-100 text-center">
                    <div className="text-orange-500 mb-2 flex justify-center"><Trophy size={24} /></div>
                    <div className="text-3xl font-black text-orange-950">{entry.total_points}</div>
                    <div className="text-[10px] font-black uppercase text-orange-400 tracking-widest">Your Points</div>
                </div>
                <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 text-center">
                    <div className="text-blue-500 mb-2 flex justify-center"><Users size={24} /></div>
                    <div className="text-3xl font-black text-blue-950">{entry.referral_count || 0}</div>
                    <div className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Referrals</div>
                </div>
            </div>

            {/* Sharing Card */}
            <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                        <Share2 size={24} className="text-orange-400" />
                        Boost Your Points!
                    </h3>
                    <p className="text-zinc-400 text-sm mb-6 font-bold">
                        Share your unique link. Get 50 points for every friend who joins!
                    </p>

                    <div className="flex gap-2 mb-8">
                        <div className="flex-1 bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-sm font-mono truncate">
                            {shareLink}
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="bg-white text-zinc-900 p-3 rounded-xl hover:bg-orange-400 hover:text-white transition-colors"
                        >
                            <Copy size={20} />
                        </button>
                    </div>

                    <div className="flex justify-between gap-4">
                        <button
                            onClick={() => handleShare('Twitter')}
                            className="flex-1 h-12 bg-[#1DA1F2] rounded-xl flex items-center justify-center gap-2 font-bold text-xs"
                        >
                            <Twitter size={16} /> Twitter
                        </button>
                        <button
                            onClick={() => handleShare('Facebook')}
                            className="flex-1 h-12 bg-[#4267B2] rounded-xl flex items-center justify-center gap-2 font-bold text-xs"
                        >
                            <Facebook size={16} /> Facebook
                        </button>
                        <button
                            onClick={() => handleShare('WhatsApp')}
                            className="flex-1 h-12 bg-[#25D366] rounded-xl flex items-center justify-center gap-2 font-bold text-xs"
                        >
                            <MessageCircle size={16} /> WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            {/* Leaderboard Excerpt */}
            {leaderboard && (
                <div className="bg-white rounded-[2.5rem] p-8 border-4 border-orange-50">
                    <h3 className="text-xl font-black text-orange-950 mb-6 flex items-center gap-2">
                        <Users size={20} className="text-orange-500" />
                        Top Legends
                    </h3>
                    <div className="space-y-3">
                        {leaderboard.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-zinc-300 text-zinc-600' : 'bg-orange-200 text-orange-700'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <span className="font-bold text-sm text-orange-950">{item.email}</span>
                                </div>
                                <span className="font-black text-orange-600 text-sm">{item.total_points} pts</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
