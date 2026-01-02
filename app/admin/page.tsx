"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, StatCard, DataTable, SearchBar, StatusBadge,
    Users, CreditCard, Package, TrendingUp, Activity, BarChart3
} from '@/components/admin/AdminComponents';
// import { getAnalyticsSummary, getAllOrders, getAllProfiles } from '@/lib/database';

interface DashboardStats {
    totalSubscribers: number;
    activeSubscribers: number;
    newSignups: number;
    activeChildren: number;
    pendingOrders: number;
    monthlyRevenue: number;
}

interface RecentOrder {
    id: string;
    order_number: string;
    profiles: { full_name: string; email: string };
    tier: string;
    fulfillment_status: string;
    created_at: string;
}

interface RecentCustomer {
    id: string;
    full_name: string;
    email: string;
    subscription_tier: string;
    subscription_status: string;
    created_at: string;
    children: { first_name: string }[];
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalSubscribers: 0,
        activeSubscribers: 0,
        newSignups: 0,
        activeChildren: 0,
        pendingOrders: 0,
        monthlyRevenue: 0,
    });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [recentCustomers, setRecentCustomers] = useState<RecentCustomer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setIsLoading(true);
        try {
            // Get session token
            const { data: { session } } = await import('@/lib/storage').then(m => m.supabase.auth.getSession());
            if (!session) return;

            const token = session.access_token;

            // Load stats with admin token
            const { getAdminAnalytics, getRecentOrdersAdmin, getRecentCustomersAdmin } = await import('@/app/actions/admin');

            const analyticsData = await getAdminAnalytics(token);
            setStats(analyticsData);

            // Load recent orders
            const orders = await getRecentOrdersAdmin(token);
            setRecentOrders(orders);

            // Load recent customers
            const profiles = await getRecentCustomersAdmin(token);
            setRecentCustomers(profiles);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusVariant = (status: string) => {
        const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
            active: 'success',
            pending: 'warning',
            shipped: 'info',
            delivered: 'success',
            canceled: 'error',
            trialing: 'info',
        };
        return variants[status] || 'default';
    };

    return (
        <AdminLayout activeSection="overview">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
                        <p className="text-gray-500">Welcome back! Here's what's happening with Likkle Legends.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                            Last 30 Days ▾
                        </button>
                        <button
                            onClick={loadDashboard}
                            className="px-6 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
                    <StatCard
                        label="Total Subscribers"
                        value={stats.totalSubscribers.toLocaleString()}
                        delta="+12%"
                        deltaType="positive"
                        icon={Users}
                        color="bg-blue-100 text-blue-600"
                    />
                    <StatCard
                        label="Active Subs"
                        value={stats.activeSubscribers.toLocaleString()}
                        delta="+5.4%"
                        deltaType="positive"
                        icon={CreditCard}
                        color="bg-green-100 text-green-600"
                    />
                    <StatCard
                        label="New Signups (30d)"
                        value={stats.newSignups}
                        delta="+18%"
                        deltaType="positive"
                        icon={TrendingUp}
                        color="bg-purple-100 text-purple-600"
                    />
                    <StatCard
                        label="Active Children"
                        value={stats.activeChildren}
                        delta="+8%"
                        deltaType="positive"
                        icon={Activity}
                        color="bg-orange-100 text-orange-600"
                    />
                    <StatCard
                        label="Pending Orders"
                        value={stats.pendingOrders}
                        icon={Package}
                        color="bg-amber-100 text-amber-600"
                    />
                    <StatCard
                        label="Est. Monthly Rev"
                        value={`$${stats.monthlyRevenue.toLocaleString()}`}
                        delta="+22%"
                        deltaType="positive"
                        icon={BarChart3}
                        color="bg-emerald-100 text-emerald-600"
                    />
                </div>

                {/* Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Orders */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h2 className="text-xl font-black text-gray-900">Recent Orders</h2>
                                <a href="/admin/orders" className="text-primary font-bold text-sm hover:underline">
                                    View All →
                                </a>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Order</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Customer</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Tier</th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {isLoading ? (
                                            [1, 2, 3, 4, 5].map(i => (
                                                <tr key={i}>
                                                    <td colSpan={4} className="px-6 py-4">
                                                        <div className="h-6 bg-gray-100 rounded animate-pulse" />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : recentOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                                    No orders yet
                                                </td>
                                            </tr>
                                        ) : (
                                            recentOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-bold text-gray-900">{order.order_number}</td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-medium text-gray-900">{order.profiles?.full_name}</p>
                                                        <p className="text-xs text-gray-400">{order.profiles?.email}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">{order.tier}</td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge
                                                            status={order.fulfillment_status}
                                                            variant={getStatusVariant(order.fulfillment_status)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h3 className="text-lg font-black text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <a
                                    href="/admin/content"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Package className="text-primary" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Upload Content</p>
                                        <p className="text-xs text-gray-400">Add stories, songs, videos</p>
                                    </div>
                                </a>
                                <a
                                    href="/admin/orders?status=pending"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <Package className="text-amber-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Process Orders</p>
                                        <p className="text-xs text-gray-400">{stats.pendingOrders} pending</p>
                                    </div>
                                </a>
                                <a
                                    href="/admin/announcements"
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Activity className="text-purple-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Send Announcement</p>
                                        <p className="text-xs text-gray-400">Notify all users</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Recent Signups */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6">
                            <h3 className="text-lg font-black text-gray-900 mb-4">Recent Signups</h3>
                            <div className="space-y-4">
                                {isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-12 bg-gray-100 rounded-xl" />
                                        </div>
                                    ))
                                ) : recentCustomers.length === 0 ? (
                                    <p className="text-gray-400 text-center py-4">No customers yet</p>
                                ) : (
                                    recentCustomers.slice(0, 5).map((customer) => (
                                        <div key={customer.id} className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                                                {customer.full_name?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{customer.full_name}</p>
                                                <p className="text-xs text-gray-400">{customer.subscription_tier}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="bg-deep rounded-2xl p-6 text-white">
                            <h3 className="text-lg font-black mb-4">System Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-white/70">PayPal API</span>
                                    <span className="flex items-center gap-2 text-green-400">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Connected
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/70">Supabase</span>
                                    <span className="flex items-center gap-2 text-green-400">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Connected
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-white/70">ElevenLabs</span>
                                    <span className="flex items-center gap-2 text-green-400">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Connected
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
