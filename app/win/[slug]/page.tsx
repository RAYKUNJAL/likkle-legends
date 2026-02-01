"use client";

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { enterContest, getContestStats } from '@/app/actions/growth';
import { Copy, Gift, Trophy, Star, Send, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ViralContestPage({ params }: { params: { slug: string } }) {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'entry' | 'share'>('entry');
    const [stats, setStats] = useState<any>(null);
    const [userEntry, setUserEntry] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Initial load of leaderboard
        loadStats();
    }, []);

    const loadStats = async (entryId?: string) => {
        try {
            const data = await getContestStats(params.slug, entryId);
            if (!data) return notFound(); // Handle 404 in parent if possible or show UI
            setStats(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Check for ref in URL
            const urlParams = new URLSearchParams(window.location.search);
            const referredBy = urlParams.get('ref');

            const result = await enterContest(params.slug, email, referredBy || undefined);

            setUserEntry(result.entry);
            setStep('share');
            await loadStats(result.entry.id);
        } catch (e: any) {
            setError(e.message || "Failed to join");
        } finally {
            setIsLoading(false);
        }
    };

    const copyLink = () => {
        const link = `https://likklelegends.com/win/${params.slug}?ref=${userEntry?.ref_code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <Navbar />

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <span className="inline-block px-4 py-1 bg-yellow-400 text-black font-black uppercase tracking-widest text-xs rounded-full mb-4 animate-pulse">
                            Official Giveaway
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 tracking-tighter">
                            Win a Likkle Legends <br /><span className="text-primary">Mega Bundle! 🎁</span>
                        </h1>
                        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                            Join the village for a chance to win a lifetime subscription + physical storybooks.
                            Earn points by sharing with friends!
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-start">

                        {/* LEFT: Prizes or Leaderboard */}
                        <div className="order-2 md:order-1 space-y-8">
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                                <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                                    <Trophy className="text-yellow-500" /> Leaderboard
                                </h3>
                                <div className="space-y-4">
                                    {stats?.leaderboard?.map((entry: any, i: number) => (
                                        <div key={i} className={`flex items-center justify-between p-4 rounded-2xl ${i === 0 ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-slate-50'}`}>
                                            <div className="flex items-center gap-4">
                                                <span className={`w-8 h-8 flex items-center justify-center font-black rounded-full ${i === 0 ? 'bg-yellow-400 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                    {i + 1}
                                                </span>
                                                <span className="font-bold text-slate-700">{entry.email}</span>
                                            </div>
                                            <span className="font-black text-primary">{entry.total_points} pts</span>
                                        </div>
                                    ))}
                                    {(!stats?.leaderboard || stats.leaderboard.length === 0) && (
                                        <div className="text-center py-8 text-slate-400 font-bold">Be the first to join!</div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-primary to-orange-500 p-8 rounded-[2.5rem] text-white shadow-xl">
                                <h3 className="text-2xl font-black mb-2">Grand Prize 🏆</h3>
                                <div className="text-4xl font-black mb-4">$500 Value</div>
                                <ul className="space-y-2 font-bold text-white/90">
                                    <li>✨ Lifetime App Access</li>
                                    <li>📚 5 Printed Storybooks</li>
                                    <li>👕 Likkle Legends T-Shirt</li>
                                </ul>
                            </div>
                        </div>

                        {/* RIGHT: Entry Form or Viral Share */}
                        <div className="order-1 md:order-2 bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-primary/10 border-4 border-white relative overflow-hidden">
                            {step === 'entry' ? (
                                <form onSubmit={handleEntry} className="relative z-10 space-y-6">
                                    <div className="text-center mb-8">
                                        <h2 className="text-3xl font-black text-slate-900">Enter to Win</h2>
                                        <p className="text-slate-500">Only name & email required.</p>
                                    </div>

                                    <div>
                                        <input
                                            type="email"
                                            required placeholder="Your Best Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-lg focus:border-primary focus:ring-0 outline-none"
                                        />
                                    </div>

                                    {error && <p className="text-red-500 font-bold text-center">{error}</p>}

                                    <button
                                        disabled={isLoading}
                                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                                    >
                                        {isLoading ? 'Joining...' : 'Join Giveaway 🚀'}
                                    </button>
                                </form>
                            ) : (
                                <div className="relative z-10 text-center animate-in fade-in zoom-in-95 duration-500">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">You're In!</h2>
                                    <p className="text-slate-500 font-bold mb-8">
                                        You have <span className="text-primary text-xl">{userEntry?.total_points} points</span>.
                                        <br />Share to climb the leaderboard!
                                    </p>

                                    <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200 mb-6">
                                        <code className="block text-sm font-bold text-slate-500 mb-2 break-all">
                                            likklelegends.com/win/{params.slug}?ref={userEntry?.ref_code}
                                        </code>
                                        <button
                                            onClick={copyLink}
                                            className={`w-full py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${copied ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                        >
                                            {copied ? 'Copied!' : 'Copy Link'}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="p-4 bg-[#1DA1F2] text-white rounded-2xl font-bold hover:opacity-90">
                                            Share on X
                                        </button>
                                        <button className="p-4 bg-[#4267B2] text-white rounded-2xl font-bold hover:opacity-90">
                                            Share on FB
                                        </button>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-slate-100">
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-2">How points work</p>
                                        <div className="flex justify-center gap-4 text-sm font-bold text-slate-600">
                                            <span>Sign Up: +10</span>
                                            <span>Referral: +20</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
