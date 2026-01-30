"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout, StatCard } from '@/components/admin/AdminComponents'; // DataTable not exported yet or need separate imp
import { getStoreAnalytics } from '@/app/actions/admin';
import { useUser } from '@/components/UserContext';
import { Loader2, DollarSign, Music, Package, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StoreAnalyticsPage() {
    const { user } = useUser();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [user]);

    const loadStats = async () => {
        if (!user) return;
        try {
            const data = await getStoreAnalytics(user.id); // Passing ID as token for now consistent with other files
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

                {/* GRAPH Placeholder */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trends</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400">
                        Chart Component Coming Soon (Recharts)
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
