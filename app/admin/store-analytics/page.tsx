"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout, StatCard } from '@/components/admin/AdminComponents'; // DataTable not exported yet or need separate imp
import { getStoreAnalytics } from '@/app/actions/admin';
import { useUser } from '@/components/UserContext';
import { Loader2, DollarSign, Music, Package, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StoreAnalyticsPage() {
    const { user } = useUser();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [user]);

    const loadStats = async () => {
        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const data = await getStoreAnalytics(session.access_token);
            setStats(data);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout activeSection="store-analytics">
                <div className="flex justify-center items-center h-96">
                    <Loader2 className="animate-spin text-purple-600" size={48} />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout activeSection="store-analytics">
            <div className="space-y-8">
                {/* HEADLINE STATS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        label="Total Revenue"
                        value={`$${stats?.totalRevenue || 0}`}
                        icon={DollarSign}
                        color="bg-green-100 text-green-700"
                    />
                    <StatCard
                        label="Tracks Sold"
                        value={stats?.trackSales || 0}
                        icon={Music}
                        color="bg-blue-100 text-blue-700"
                    />
                    <StatCard
                        label="Bundles Sold"
                        value={stats?.bundleSales || 0}
                        icon={Package}
                        color="bg-orange-100 text-orange-700"
                    />
                    <StatCard
                        label="Custom Requests"
                        value={stats?.requestSales || 0}
                        icon={Sparkles}
                        color="bg-purple-100 text-purple-700"
                    />
                </div>

                {/* GRAPH */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trends (7 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.chartData || []}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    tickFormatter={(val) => val.slice(5)} // MM-DD
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: number) => [`$${value}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#7C3AED"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* RECENT ACTIVITY */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
                        {stats?.recentPurchases.length > 0 ? (
                            <ul className="space-y-3">
                                {stats.recentPurchases.map((p: any, i: number) => (
                                    <li key={i} className="flex justify-between text-sm">
                                        <span className="text-gray-600 capitalize">{p.content_type}</span>
                                        <span className="font-bold text-gray-900">${p.amount_paid}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No transactions yet.</p>
                        )}
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Custom Requests</h3>
                        {stats?.recentRequests.length > 0 ? (
                            <ul className="space-y-3">
                                {stats.recentRequests.map((r: any, i: number) => (
                                    <li key={i} className="flex justify-between text-sm">
                                        <span className="text-gray-600 capitalize truncate w-32">{r.status}</span>
                                        <span className="font-bold text-gray-900">${r.amount_paid}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No requests yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
