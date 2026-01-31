"use client";

import { useState, useEffect } from 'react';
import { Gift, Copy, Check, Users, ArrowRight } from 'lucide-react';
import { getParentReferralCode, getReferralCredits } from '@/app/actions/growth';
import { motion } from 'framer-motion';

export default function ReferralWidget() {
    const [refCode, setRefCode] = useState<string | null>(null);
    const [stats, setStats] = useState<{ earned_months: number, pending: number }>({ earned_months: 0, pending: 0 });
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [code, data] = await Promise.all([
                getParentReferralCode(),
                getReferralCredits()
            ]);
            setRefCode(code);
            setStats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const copyLink = () => {
        const link = `https://likklelegends.com/?ref=${refCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isLoading) return <div className="animate-pulse h-48 bg-gray-100 rounded-3xl" />;

    return (
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-xl">
                        <Gift className="text-white" size={24} />
                    </div>
                    <span className="font-bold text-indigo-100 text-sm uppercase tracking-widest">Village Rewards</span>
                </div>

                <h3 className="text-2xl font-black mb-2 leading-tight">
                    Give $10, Get 1 Month Free! 🎁
                </h3>
                <p className="text-indigo-100 mb-6 text-sm leading-relaxed font-medium">
                    Share your unique link. When a friend subscribes, they get $10 off, and you get a FREE month.
                </p>

                {/* Progress */}
                <div className="bg-black/20 p-4 rounded-2xl mb-6 backdrop-blur-sm">
                    <div className="flex justify-between text-xs font-bold text-indigo-200 mb-2 uppercase">
                        <span>Current Rewards</span>
                        <span>{stats.pending} Pending</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-white">{stats.earned_months}</span>
                        <span className="text-sm font-bold text-indigo-200 mb-1">Free Months Earned</span>
                    </div>
                </div>

                {/* Action */}
                <div className="bg-white p-2 rounded-2xl flex items-center justify-between pl-4 shadow-lg">
                    <code className="text-indigo-900 font-bold text-sm tracking-wide">
                        likkle.link/{refCode}
                    </code>
                    <button
                        onClick={copyLink}
                        className={`p-3 rounded-xl transition-all font-bold text-xs flex items-center gap-2 ${copied ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </div>
    );
}
