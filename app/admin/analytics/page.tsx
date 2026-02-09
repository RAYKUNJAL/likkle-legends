"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, StatCard
} from '@/components/admin/AdminComponents';
import {
    TrendingUp, Users, ShoppingBag, CreditCard, Activity, Globe,
    ArrowUpRight, ArrowDownRight, BarChart, PieChart, Calendar, Star
} from 'lucide-react';

export default function AdminAnalyticsPage() {
    const [stats, setStats] = useState({
        totalSubscribers: 0,
        activeSubscribers: 0,
        newSignups: 0,
        activeChildren: 0,
        pendingOrders: 0,
        monthlyRevenue: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await import('@/lib/storage').then(m => m.supabase.auth.getSession());
            if (!session) return;

            const { getAdminAnalytics } = await import('@/app/actions/admin');
            const data = await getAdminAnalytics(session.access_token);
            setStats(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminLayout activeSection="analytics">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Platform Analytics</h1>
                        <p className="text-gray-500">Deep insights into growth and engagement</p>
                    </div>
                    <div className="flex bg-gray-100 p-1.5 rounded-xl">
                        <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-bold text-xs shadow-sm">30 Days</button>
                        <button className="px-4 py-2 text-gray-500 hover:text-gray-700 rounded-lg font-bold text-xs">90 Days</button>
                        <button className="px-4 py-2 text-gray-500 hover:text-gray-700 rounded-lg font-bold text-xs">1 Year</button>
                    </div>
                </div>
            </header>

            <div className="p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        label="Conversion Rate"
                        value="4.2%"
                        delta="+0.8%"
                        deltaType="positive"
                        icon={TrendingUp}
                        color="bg-blue-100 text-blue-600"
                    />
                    <StatCard
                        label="Churn Rate"
                        value="1.5%"
                        delta="-0.2%"
                        deltaType="positive"
                        icon={ArrowDownRight}
                        color="bg-red-100 text-red-600"
                    />
                    <StatCard
                        label="LTV (Avg)"
                        value="$185"
                        delta="+$12"
                        deltaType="positive"
                        icon={CreditCard}
                        color="bg-green-100 text-green-600"
                    />
                    <StatCard
                        label="Stickiness"
                        value="68%"
                        delta="+5%"
                        deltaType="positive"
                        icon={Activity}
                        color="bg-purple-100 text-purple-600"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Growth Chart Placeholder */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <BarChart className="text-primary" /> Subscription Growth
                            </h3>
                            <select title="Choose Chart Category" className="bg-gray-50 border-none rounded-lg text-xs font-bold px-3 py-2 outline-none">
                                <option>Total Subscribers</option>
                                <option>Revenue</option>
                                <option>Active Users</option>
                            </select>
                        </div>

                        <div className="h-64 flex items-end justify-between px-4 gap-2">
                            {[30, 45, 35, 60, 55, 80, 75, 90, 85, 100].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center group">
                                    <div
                                        className="w-full bg-primary/20 rounded-t-lg group-hover:bg-primary transition-all relative"
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h}%
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 mt-2">M{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Regional Breakdown */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Globe className="text-orange-500" /> Geographic Reach
                        </h3>
                        <div className="space-y-6">
                            {[
                                { name: 'USA', share: 45, color: 'bg-blue-500' },
                                { name: 'UK', share: 25, color: 'bg-red-500' },
                                { name: 'Canada', share: 15, color: 'bg-green-500' },
                                { name: 'Caribbean', share: 10, color: 'bg-amber-500' },
                                { name: 'Other', share: 5, color: 'bg-gray-400' },
                            ].map((region) => (
                                <div key={region.name}>
                                    <div className="flex justify-between text-sm font-bold mb-2">
                                        <span className="text-gray-700">{region.name}</span>
                                        <span className="text-gray-900">{region.share}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${region.color} rounded-full transition-all duration-1000`}
                                            style={{ width: `${region.share}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:shadow-lg transition-all">
                            Export Regional Data
                        </button>
                    </div>

                    {/* Engagement Overview */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Users className="text-purple-500" /> Engagement
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-purple-50 rounded-2xl">
                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Avg Session</p>
                                <p className="text-2xl font-black text-purple-700">18m</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-2xl">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">DAU / MAU</p>
                                <p className="text-2xl font-black text-blue-700">42%</p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Peak Usage Time</span>
                                <span className="font-bold">6PM - 8PM</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Most Used Feature</span>
                                <span className="font-bold">Story Builder</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Performance */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-black text-gray-900 mb-6">Top Content</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Module</th>
                                        <th className="px-4 py-3 text-left text-[10px] font-black text-gray-400 uppercase">Type</th>
                                        <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase">Engagements</th>
                                        <th className="px-4 py-3 text-right text-[10px] font-black text-gray-400 uppercase">Rating</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {[
                                        { name: 'Island Match', type: 'Game', count: 12400, rating: 4.8 },
                                        { name: 'Mango Moko Story', type: 'Book', count: 8900, rating: 4.9 },
                                        { name: 'Steelpan Serenade', type: 'Song', count: 7500, rating: 4.7 },
                                        { name: 'Patois Puzzle', type: 'Game', count: 6200, rating: 4.6 },
                                    ].map((item, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-4 font-bold text-gray-900">{item.name}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{item.type}</td>
                                            <td className="px-4 py-4 text-right font-medium">{item.count.toLocaleString()}</td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 text-amber-500 font-bold">
                                                    <Star size={14} fill="currentColor" />
                                                    {item.rating}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
