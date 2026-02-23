"use client";

import { useState, useRef, useCallback } from 'react';
import { Share2, Download, X, MessageCircle, Copy, Check, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getShareCardData, type ShareCardData } from '@/app/actions/share-card';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

interface StreakShareCardProps {
    childId: string;
    streakDay: number;
    onClose: () => void;
}

// Generate the WhatsApp share text
function whatsAppText(data: ShareCardData): string {
    const siteUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://www.likklelegends.com';
    const refSuffix = data.referralCode ? `?ref=${data.referralCode}` : '';
    return encodeURIComponent(
        `🔥 ${data.childName} is on a ${data.streakDay}-day learning streak on Likkle Legends!\n\n` +
        `⚡ ${data.totalXp.toLocaleString()} XP • Level ${data.level} ${data.levelIcon}\n` +
        (data.topBadges.length ? `🏅 Badges: ${data.topBadges.map(b => b.icon).join(' ')}\n\n` : '\n') +
        `Caribbean stories, music & culture for kids 🌴\n` +
        `Join us → ${siteUrl}/signup${refSuffix}`
    );
}

export default function StreakShareCard({ childId, streakDay, onClose }: StreakShareCardProps) {
    const [data, setData] = useState<ShareCardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    // Load data on mount
    useState(() => {
        (async () => {
            try {
                const result = await getShareCardData(childId);
                setData(result);
            } catch {
                toast.error('Could not load share data');
            } finally {
                setLoading(false);
            }
        })();
    });

    const handleDownload = useCallback(async () => {
        if (!cardRef.current) return;
        try {
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
            });
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = `likkle-legends-streak-${streakDay}.png`;
            a.click();
            toast.success('Card saved! 📸');
        } catch {
            toast.error('Could not save image');
        }
    }, [streakDay]);

    const handleWhatsApp = useCallback(() => {
        if (!data) return;
        window.open(`https://wa.me/?text=${whatsAppText(data)}`, '_blank');
    }, [data]);

    const handleNativeShare = useCallback(async () => {
        if (!data) return;
        const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.likklelegends.com';
        const refSuffix = data.referralCode ? `?ref=${data.referralCode}` : '';

        if (navigator.share) {
            await navigator.share({
                title: `${data.childName}'s Streak 🔥`,
                text: `${data.childName} is on a ${data.streakDay}-day learning streak on Likkle Legends! ${data.totalXp.toLocaleString()} XP earned 🌴`,
                url: `${siteUrl}/signup${refSuffix}`,
            }).catch(() => { });
        } else {
            // Fallback: copy link
            const url = `${siteUrl}/signup${refSuffix}`;
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('Link copied!');
            setTimeout(() => setCopied(false), 2500);
        }
    }, [data]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={e => { if (e.target === e.currentTarget) onClose(); }}
            >
                <motion.div
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="w-full max-w-sm"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 z-10"
                    >
                        <X size={20} />
                    </button>

                    {loading ? (
                        <div className="bg-white rounded-[2rem] p-10 text-center">
                            <div className="text-4xl animate-bounce mb-3">🔥</div>
                            <p className="text-zinc-400 font-bold text-sm animate-pulse">Building your streak card...</p>
                        </div>
                    ) : data ? (
                        <>
                            {/* === THE SHAREABLE CARD === */}
                            <div
                                ref={cardRef}
                                className="rounded-[2rem] overflow-hidden shadow-2xl"
                                style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 40%, #831843 100%)' }}
                            >
                                {/* Decorative top strip */}
                                <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

                                <div className="p-7 relative overflow-hidden">
                                    {/* Deco elements */}
                                    <div className="absolute top-0 right-0 text-[100px] opacity-[0.06] leading-none pointer-events-none select-none">🌴</div>
                                    <div className="absolute bottom-4 left-4 text-[60px] opacity-[0.06] leading-none pointer-events-none select-none">🌺</div>

                                    {/* Header */}
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                                            <span className="text-sm">🌴</span>
                                        </div>
                                        <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.25em]">Likkle Legends</span>
                                    </div>

                                    {/* Streak hero */}
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center gap-3 mb-3">
                                            <Flame size={36} className="text-orange-400" fill="currentColor" />
                                            <span className="text-7xl font-black text-white tracking-tight leading-none">{data.streakDay}</span>
                                        </div>
                                        <p className="text-white/60 text-sm font-black uppercase tracking-[0.2em]">Day Streak</p>
                                    </div>

                                    {/* Child name + level */}
                                    <div className="bg-white/10 rounded-2xl p-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-black text-lg">{data.childName}</p>
                                                <p className="text-white/40 text-xs font-bold">Member since {data.memberSince}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl">{data.levelIcon}</p>
                                                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Lvl {data.level}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-white/10 rounded-2xl p-3 text-center">
                                            <p className="text-white font-black text-xl leading-none">{data.totalXp.toLocaleString()}</p>
                                            <p className="text-white/40 text-[9px] font-black uppercase tracking-wider mt-1">Total XP</p>
                                        </div>
                                        <div className="bg-white/10 rounded-2xl p-3 text-center">
                                            <p className="text-white font-black text-xl leading-none">{data.topBadges.length}</p>
                                            <p className="text-white/40 text-[9px] font-black uppercase tracking-wider mt-1">Badges</p>
                                        </div>
                                    </div>

                                    {/* Top badges */}
                                    {data.topBadges.length > 0 && (
                                        <div className="flex items-center justify-center gap-3 mb-4">
                                            {data.topBadges.map(b => (
                                                <div key={b.id} className="bg-white/10 px-3 py-2 rounded-xl flex items-center gap-2">
                                                    <span className="text-lg">{b.icon}</span>
                                                    <span className="text-white/60 text-[10px] font-black">{b.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* CTA */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest">
                                            Caribbean stories, music & culture for kids
                                        </p>
                                        <p className="text-amber-400 text-xs font-black mt-1">likklelegends.com</p>
                                    </div>
                                </div>
                            </div>

                            {/* === SHARE BUTTONS === */}
                            <div className="mt-4 space-y-3">
                                {/* WhatsApp */}
                                <button
                                    onClick={handleWhatsApp}
                                    className="w-full py-4 bg-[#25D366] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-green-500/30"
                                >
                                    <MessageCircle size={20} fill="currentColor" />
                                    Share on WhatsApp
                                </button>

                                <div className="flex gap-3">
                                    {/* Download */}
                                    <button
                                        onClick={handleDownload}
                                        className="flex-1 py-3.5 bg-white/10 border border-white/20 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-white/20 active:scale-[0.98] transition-all"
                                    >
                                        <Download size={16} />
                                        Save Image
                                    </button>

                                    {/* Native Share / Copy */}
                                    <button
                                        onClick={handleNativeShare}
                                        className="flex-1 py-3.5 bg-white/10 border border-white/20 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-white/20 active:scale-[0.98] transition-all"
                                    >
                                        {copied ? <Check size={16} /> : <Share2 size={16} />}
                                        {copied ? 'Copied!' : 'Share'}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white rounded-[2rem] p-10 text-center">
                            <p className="text-zinc-400 font-bold text-sm">Could not load streak data</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
