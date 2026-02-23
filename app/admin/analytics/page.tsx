"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, StatCard
} from '@/components/admin/AdminComponents';
import {
    TrendingUp, Users, ShoppingBag, CreditCard, Activity, Globe,
    ArrowUpRight, ArrowDownRight, BarChart, Calendar, RefreshCw
} from 'lucide-react';

interface AnalyticsData {
    totalSubscribers: number;
    activeSubscribers: number;
    newSignups: number;
    activeChildren: number;
    pendingOrders: number;
    monthlyRevenue: number;
}

export default function AdminAnalyticsPage() {
    const [stats, setStats] = useState<AnalyticsData>({
        totalSubscribers: 0,
        activeSubscribers: 0,
        newSignups: 0,
        activeChildren: 0,
        pendingOrders: 0,
        monthlyRevenue: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const loadAnalytics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Not authenticated. Please log in as admin.');
                return;
            }
            const { getAdminAnalytics } = await import('@/app/actions/admin');
            const data = await getAdminAnalytics(session.access_token);
            setStats(data);
            setLastUpdated(new Date());
        } catch (err: any) {
            console.error('Failed to load analytics:', err);
            setError(err.message || 'Failed to load analytics data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const churnRate = stats.totalSubscribers > 0
        ? (((stats.totalSubscribers - stats.activeSubscribers) / stats.totalSubscribers) * 100).toFixed(1)
        : '0.0';

    const conversionRate = stats.newSignups > 0
        ? ((stats.activeSubscribers / Math.max(stats.newSignups, 1)) * 100).toFixed(1)
        : '0.0';

    return (
        <AdminLayout activeSection="analytics">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Platform Analytics</h1>
                        <p className="text-gray-500">
                            Live data from your Supabase database
                            {lastUpdated && (
                                <span className="ml-2 text-xs text-gray-400">
                                    · Updated {lastUpdated.toLocaleTimeString()}
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={loadAnalytics}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-700 transition disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>
            </header>

            <div className="p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-medium">
                        ⚠️ {error}
                    </div>
                )}

                {/* Live Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        label="Total Subscribers"
                        value={isLoading ? '...' : stats.totalSubscribers.toLocaleString()}
                        delta={`${stats.newSignups} new this month`}
                        deltaType="positive"
                        icon={Users}
                        color="bg-blue-100 text-blue-600"
                    />
                    <StatCard
                        label="Active Subscribers"
                        value={isLoading ? '...' : stats.activeSubscribers.toLocaleString()}
                        delta={`${churnRate}% churn rate`}
                        deltaType={parseFloat(churnRate) < 5 ? 'positive' : 'negative'}
                        icon={Activity}
                        color="bg-green-100 text-green-600"
                    />
                    <StatCard
                        label="Monthly Revenue"
                        value={isLoading ? '...' : `$${stats.monthlyRevenue.toLocaleString()}`}
                        delta="This calendar month"
                        deltaType="positive"
                        icon={CreditCard}
                        color="bg-emerald-100 text-emerald-600"
                    />
                    <StatCard
                        label="Active Children"
                        value={isLoading ? '...' : stats.activeChildren.toLocaleString()}
                        delta="Active in last 7 days"
                        deltaType="positive"
                        icon={TrendingUp}
                        color="bg-purple-100 text-purple-600"
                    />
                    <StatCard
                        label="New Signups (30d)"
                        value={isLoading ? '...' : stats.newSignups.toLocaleString()}
                        delta={`${conversionRate}% convert to paid`}
                        deltaType="positive"
                        icon={ArrowUpRight}
                        color="bg-orange-100 text-orange-600"
                    />
                    <StatCard
                        label="Pending Orders"
                        value={isLoading ? '...' : stats.pendingOrders.toLocaleString()}
                        delta="Awaiting fulfilment"
                        deltaType={stats.pendingOrders > 10 ? 'negative' : 'positive'}
                        icon={ShoppingBag}
                        color="bg-amber-100 text-amber-600"
                    />
                </div>

                {/* Key Metrics Summary */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Subscriber Health */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <BarChart className="text-primary" /> Subscriber Health
                        </h3>
                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {[
                                    {
                                        label: 'Active Subscribers',
                                        value: stats.activeSubscribers,
                                        total: stats.totalSubscribers,
                                        color: 'bg-green-500',
                                    },
                                    {
                                        label: 'Churned / Inactive',
                                        value: Math.max(0, stats.totalSubscribers - stats.activeSubscribers),
                                        total: stats.totalSubscribers,
                                        color: 'bg-red-400',
                                    },
                                    {
                                        label: 'New This Month',
                                        value: stats.newSignups,
                                        total: Math.max(stats.newSignups, stats.totalSubscribers),
                                        color: 'bg-blue-500',
                                    },
                                ].map(metric => {
                                    const pct = metric.total > 0 ? Math.round((metric.value / metric.total) * 100) : 0;
                                    return (
                                        <div key={metric.label}>
                                            <div className="flex justify-between text-sm font-bold mb-2">
                                                <span className="text-gray-700">{metric.label}</span>
                                                <span className="text-gray-900">{metric.value.toLocaleString()} ({pct}%)</span>
                                            </div>
                                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${metric.color} rounded-full transition-all duration-1000`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Revenue & Engagement */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Globe className="text-orange-500" /> Platform Activity
                        </h3>
                        {isLoading ? (
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-blue-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Users</p>
                                    <p className="text-3xl font-black text-blue-700">{stats.totalSubscribers.toLocaleString()}</p>
                                </div>
                                <div className="p-5 bg-green-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Active Kids</p>
                                    <p className="text-3xl font-black text-green-700">{stats.activeChildren.toLocaleString()}</p>
                                </div>
                                <div className="p-5 bg-emerald-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Monthly Rev</p>
                                    <p className="text-3xl font-black text-emerald-700">${stats.monthlyRevenue.toLocaleString()}</p>
                                </div>
                                <div className="p-5 bg-amber-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Pending</p>
                                    <p className="text-3xl font-black text-amber-700">{stats.pendingOrders.toLocaleString()}</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <p className="text-xs text-gray-400 flex items-center gap-2">
                                <Calendar size={12} />
                                Data sourced live from Supabase · subscriptions, children, orders tables
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
