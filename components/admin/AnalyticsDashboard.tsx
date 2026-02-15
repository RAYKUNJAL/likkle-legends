"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Activity, DollarSign, Smartphone, AlertTriangle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const data = [
    { name: 'Mon', usage: 4000, cost: 24 },
    { name: 'Tue', usage: 3000, cost: 18 },
    { name: 'Wed', usage: 2000, cost: 12 },
    { name: 'Thu', usage: 2780, cost: 16 },
    { name: 'Fri', usage: 1890, cost: 11 },
    { name: 'Sat', usage: 2390, cost: 14 },
    { name: 'Sun', usage: 3490, cost: 21 },
];

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
    <div
        className="glass-card p-6 flex items-center gap-5 animate-fade-in"
        style={{ animationDelay: `${delay}s`, boxShadow: 'var(--shadow-premium)' }}
    >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${color}15`, color: color }}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-800">{value}</h3>
        </div>
    </div>
);

export const AnalyticsDashboard = () => {
    const [stats, setStats] = useState({
        total_users: '...',
        events_24h: '...',
        active_subscriptions: '...',
        ai_cost_24h: '...',
        failed_jobs: '0'
    });

    useEffect(() => {
        const fetchStats = async () => {
            const { data: kpis } = await supabase.from('v_admin_kpis_today').select('*').single();
            if (kpis) {
                setStats({
                    total_users: kpis.total_users.toLocaleString(),
                    events_24h: kpis.events_24h.toLocaleString(),
                    active_subscriptions: kpis.active_subscriptions.toLocaleString(),
                    ai_cost_24h: `$${Number(kpis.ai_cost_24h || 0).toFixed(2)}`,
                    failed_jobs: kpis.failed_jobs.toString()
                });
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Mission Control</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Real-time Growth Performance</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100 text-xs font-black uppercase">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    Live System Active
                </div>
            </header>

            {/* v3 KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Citizens" value={stats.total_users} icon={Users} color="#00B4D8" delay={0.1} />
                <StatCard title="24h Activity" value={stats.events_24h} icon={Activity} color="#00FF94" delay={0.2} />
                <StatCard title="Active Plans" value={stats.active_subscriptions} icon={DollarSign} color="#FF6B35" delay={0.3} />
                <StatCard title="24h AI Cost" value={stats.ai_cost_24h} icon={Smartphone} color="#FF3FB4" delay={0.4} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8" style={{ boxShadow: 'var(--shadow-premium)' }}>
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-800">Growth Engine</h3>
                            <p className="text-sm text-slate-400 font-medium">Platform interaction & expansion</p>
                        </div>
                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-wider">
                            Last 7 Days
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00B4D8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00B4D8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                                />
                                <Area type="monotone" dataKey="usage" stroke="#00B4D8" fillOpacity={1} fill="url(#colorUsage)" strokeWidth={4} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-8 flex flex-col" style={{ boxShadow: 'var(--shadow-premium)' }}>
                    <h3 className="text-xl font-black text-slate-800 mb-6">Recent Alerts</h3>
                    <div className="space-y-4 flex-1">
                        {stats.failed_jobs !== '0' ? (
                            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-4">
                                <AlertTriangle className="text-red-500" />
                                <div>
                                    <p className="text-sm font-black text-red-700">{stats.failed_jobs} Failed AI Jobs</p>
                                    <p className="text-xs text-red-600/70 font-bold uppercase">Immediate Attention Required</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Activity className="text-emerald-500" size={32} />
                                </div>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Everything stable</p>
                            </div>
                        )}
                    </div>
                    <button className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                        View System Logs
                    </button>
                </div>
            </div>
        </div>
    );
};
