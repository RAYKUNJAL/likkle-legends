"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, Users, MousePointer2, Copy, Check,
    Download, ExternalLink, Settings, TrendingUp
} from 'lucide-react';

interface PromoterStats {
    referral_code: string;
    total_earnings: number;
    paid_earnings: number;
    commission_rate: number;
    clicks: number;
    referralLink: string;
    status: string;
}

export default function PromoterDashboard({ stats }: { stats: PromoterStats }) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'settings'>('overview');

    const copyLink = () => {
        navigator.clipboard.writeText(stats.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="mb-12 text-center md:text-left">
                <div className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-black text-xs tracking-widest uppercase mb-4">
                    Partner Portal
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                    Welcome back, Legend! 🌴
                </h1>
                <p className="text-lg text-gray-500">
                    Let's spread some Caribbean joy and make some money.
                </p>
            </div>

            {/* Main Grid */}
            <div className="grid md:grid-cols-4 gap-8">

                {/* Sidebar Navigation */}
                <div className="bg-white rounded-3xl p-4 shadow-sm h-fit">
                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <TrendingUp size={20} /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'resources' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <Download size={20} /> Assets & Swipes
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <Settings size={20} /> Payout Settings
                        </button>
                    </nav>

                    <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                        <p className="text-xs font-bold text-blue-800 uppercase mb-1">Your Code</p>
                        <div className="flex items-center justify-between">
                            <code className="text-lg font-black text-blue-900">{stats.referral_code}</code>
                            <button onClick={copyLink} className="text-blue-600 hover:text-blue-800">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3 space-y-8">

                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                                        <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign size={20} /></div>
                                        <span className="font-bold text-sm">Total Earnings</span>
                                    </div>
                                    <p className="text-3xl font-black text-gray-900">${stats.total_earnings.toFixed(2)}</p>
                                    <p className="text-xs text-gray-400 mt-1">Pending payout: ${(stats.total_earnings - stats.paid_earnings).toFixed(2)}</p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><MousePointer2 size={20} /></div>
                                        <span className="font-bold text-sm">Total Clicks</span>
                                    </div>
                                    <p className="text-3xl font-black text-gray-900">{stats.clicks}</p>
                                    <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
                                </div>
                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-2 text-gray-500">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Users size={20} /></div>
                                        <span className="font-bold text-sm">Commission Rate</span>
                                    </div>
                                    <p className="text-3xl font-black text-gray-900">{(stats.commission_rate * 100)}%</p>
                                    <p className="text-xs text-gray-400 mt-1">Recurring Lifetime</p>
                                </div>
                            </div>

                            {/* Link Generator */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-black text-gray-900 mb-4">Your Magic Link 🔗</h3>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={stats.referralLink}
                                            readOnly
                                            className="w-full pl-4 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 focus:outline-none"
                                        />
                                        <button
                                            onClick={copyLink}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                        >
                                            {copied ? <Check size={24} className="text-green-500" /> : <Copy size={24} />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check%20out%20Likkle%20Legends!&url=${encodeURIComponent(stats.referralLink)}`, '_blank')}
                                        className="px-6 py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800"
                                    >
                                        Share on X
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-black">Marketing Assets 🎨</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-3xl border border-gray-100">
                                    <div className="aspect-video bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                                        <span className="text-gray-400 font-bold">Banner 1 (1200x630)</span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Social Feed Post</h3>
                                    <button className="w-full py-3 border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-2">
                                        <Download size={18} /> Download
                                    </button>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-gray-100">
                                    <div className="aspect-video bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                                        <span className="text-gray-400 font-bold">Story (1080x1920)</span>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">IG Story Format</h3>
                                    <button className="w-full py-3 border-2 border-gray-200 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-2">
                                        <Download size={18} /> Download
                                    </button>
                                </div>
                            </div>

                            <div className="bg-orange-50 p-8 rounded-3xl">
                                <h3 className="text-xl font-black text-orange-900 mb-4">Swipe Copy (Email/Caption) 📝</h3>
                                <div className="bg-white p-6 rounded-2xl border-2 border-orange-100">
                                    <p className="text-gray-600 font-medium font-mono text-sm leading-relaxed">
                                        "Hey Village! 🌴 I just found the most amazing app for [Child's Name] called Likkle Legends. It teaches them Caribbean culture, Patois, and history through magic stories and games. <br /><br />
                                        Finally, screen time I don't feel guilty about! Check it out here: {stats.referralLink}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-black mb-6">Payout Settings 🏦</h2>
                            <p className="text-gray-500 mb-6">We pay out via PayPal on the 1st of every month for balances over $50.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">PayPal Email Address</label>
                                    <input
                                        type="email"
                                        defaultValue="user@example.com"
                                        className="w-full md:w-1/2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <button className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
