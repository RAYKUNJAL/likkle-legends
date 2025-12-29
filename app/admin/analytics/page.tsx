"use client";

import Sidebar from '@/components/Sidebar';
import { TrendingUp, Users, ShoppingBag, CreditCard, Activity, Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminAnalyticsPage() {
    const stats = [
        { label: "Total Members", value: "2,840", delta: "+12.5%", trending: "up", icon: Users, color: "text-blue-600 bg-blue-50" },
        { label: "Monthly Revenue", value: "$42,500", delta: "+18.2%", trending: "up", icon: CreditCard, color: "text-green-600 bg-green-50" },
        { label: "Active Subs", value: "2,150", delta: "+5.4%", trending: "up", icon: ShoppingBag, color: "text-purple-600 bg-purple-50" },
        { label: "Platform Activity", value: "78%", delta: "-2.1%", trending: "down", icon: Activity, color: "text-orange-600 bg-orange-50" },
    ];

    const regions = [
        { name: "New York", share: "24%", change: "+5%" },
        { name: "London", share: "18%", change: "+12%" },
        { name: "Toronto", share: "14%", change: "-2%" },
        { name: "Kingston", share: "10%", change: "+25%" },
        { name: "Port of Spain", share: "8%", change: "+8%" },
    ];

    return (
        <div className="bg-[#FFFDF7] min-h-screen">
            <Sidebar view="admin" />
            <main className="ml-64 p-12">
                <header className="flex justify-between items-center mb-16">
                    <div>
                        <h1 className="text-5xl font-black text-deep mb-2">Platform Analytics 📈</h1>
                        <p className="text-lg text-deep/40 font-bold">Deep insights into growth, engagement, and cultural impact.</p>
                    </div>
                    <div className="flex bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm">
                        <button className="px-6 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest">30 Days</button>
                        <button className="px-6 py-3 text-deep/30 hover:text-deep rounded-xl font-black text-xs uppercase tracking-widest transition-all">90 Days</button>
                        <button className="px-6 py-3 text-deep/30 hover:text-deep rounded-xl font-black text-xs uppercase tracking-widest transition-all">1 Year</button>
                    </div>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                            <div className="flex justify-between items-start mb-8">
                                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={28} />
                                </div>
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.trending === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                    {stat.delta} {stat.trending === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                </div>
                            </div>
                            <p className="text-xs font-black text-deep/30 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                            <h3 className="text-3xl font-black text-deep">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 bg-white p-12 rounded-[4rem] border border-zinc-100 shadow-xl overflow-hidden relative group">
                        <div className="mb-10 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-deep flex items-center gap-4">
                                <TrendingUp className="text-primary" /> Growth trajectory
                            </h3>
                            <button className="text-[10px] font-black text-deep/30 uppercase tracking-widest hover:text-primary transition-all">Download Report</button>
                        </div>
                        <div className="aspect-[2/1] bg-zinc-50 rounded-[3rem] border border-zinc-100 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 flex items-end px-12 pb-12 gap-6">
                                {[40, 60, 45, 80, 70, 90, 100].map((h, i) => (
                                    <div key={i} className="flex-1 bg-primary/20 rounded-t-xl relative group/bar flex items-end">
                                        <div
                                            className="w-full bg-primary rounded-t-xl transition-all duration-1000 group-hover/bar:bg-secondary"
                                            style={{ height: `${h}%` }}
                                        ></div>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-deep text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                            {h}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="text-center opacity-20 pointer-events-none z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-4">Historical Projection</p>
                                <div className="text-8xl font-black italic">LL-V1</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-12 rounded-[4rem] border border-zinc-100 shadow-xl">
                        <div className="mb-10 flex items-center gap-4">
                            <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                                <Globe size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-deep">Global Reach</h3>
                        </div>
                        <div className="space-y-8">
                            {regions.map((region, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="font-black text-deep group-hover:text-primary transition-colors">{region.name}</span>
                                        <div className="flex gap-4 items-center">
                                            <span className="text-sm font-black text-deep">{region.share}</span>
                                            <span className={`text-[10px] font-black ${region.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                                {region.change}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-secondary rounded-full transition-all duration-1000"
                                            style={{ width: region.share }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-12 py-5 bg-zinc-900 text-white rounded-[2rem] font-black shadow-xl hover:bg-black transition-all">
                            View Interactive Map
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
