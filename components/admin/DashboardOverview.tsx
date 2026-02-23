"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminStats, getRecentActivity } from '../../services/supabase/databaseService';

export const DashboardOverview: React.FC = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalVideos: 0, paidUsers: 0, revenue: 0 });
    const [activity, setActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, activityData] = await Promise.all([getAdminStats(), getRecentActivity()]);
                setStats(statsData);
                setActivity(activityData);
            } catch (error) {
                console.error("Failed to load admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const Card = ({ title, value, icon, trend, color }: any) => (
        <div className="bg-white p-6 rounded-[2rem] border-2 border-blue-50 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-black uppercase text-blue-300 tracking-widest mb-1">{title}</p>
                <h3 className="text-3xl font-heading font-black text-blue-950">{loading ? '...' : value}</h3>
                {trend && <p className="text-[10px] font-bold text-green-500 mt-2">▲ {trend} this week</p>}
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
                {icon}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Total Citizens" value={stats.totalUsers} icon="👥" trend="12%" color="bg-blue-100 text-blue-600" />
                <Card title="Monthly Revenue" value={`$${stats.revenue}`} icon="💰" trend="8%" color="bg-green-100 text-green-600" />
                <Card title="Library Assets" value={stats.totalVideos} icon="📹" color="bg-orange-100 text-orange-600" />
                <Card title="Paid Citizens" value={stats.paidUsers} icon="💬" color="bg-purple-100 text-purple-600" />
            </div>

            {/* AI Content Quick Actions */}
            <div>
                <h3 className="font-heading font-black text-base text-blue-950 mb-3 uppercase tracking-widest text-xs text-blue-300">AI Content</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/admin/auto-content" className="group flex items-center gap-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-5 rounded-2xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                            ⚡
                        </div>
                        <div>
                            <p className="font-black text-base">Auto-Generate Content</p>
                            <p className="text-xs text-white/70 mt-0.5">Create new songs, stories & printables with AI</p>
                        </div>
                    </Link>
                    <Link href="/admin/ai-review" className="group flex items-center gap-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                            ✅
                        </div>
                        <div>
                            <p className="font-black text-base">Review AI Queue</p>
                            <p className="text-xs text-white/70 mt-0.5">Approve or reject AI-generated content</p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border-2 border-blue-50 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-heading font-black text-xl text-blue-950">Growth Analytics</h3>
                        <select className="bg-blue-50 border-none rounded-xl text-xs font-bold text-blue-900 px-4 py-2 outline-none">
                            <option>Last 30 Days</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4 border-b border-blue-50">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 100].map((h, i) => (
                            <div key={i} className="w-full bg-blue-100 rounded-t-lg relative group">
                                <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }}></div>
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                                    {h * 10} Users
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-black uppercase text-blue-300">
                        <span>Jan</span><span>Dec</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-blue-50 shadow-sm">
                    <h3 className="font-heading font-black text-xl text-blue-950 mb-6">Village Chatter</h3>
                    <div className="space-y-6">
                        {activity.length === 0 && !loading && <p className="text-sm text-gray-400">No recent activity.</p>}
                        {activity.map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                    {item.avatar && <img src={item.avatar} alt="User" className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-blue-950"><span className="text-orange-500">{item.author}</span> posted</p>
                                    <p className="text-xs text-blue-900/60 truncate max-w-[180px]">"{item.caption}"</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-black text-xs uppercase hover:bg-blue-100 transition-colors">View All Feed</button>
                </div>
            </div>
        </div>
    );
};
