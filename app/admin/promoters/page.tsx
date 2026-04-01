"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    DollarSign,
    TrendingUp,
    Search,
    ChevronRight,
    Loader2,
    Calendar,
    Mail,
    Filter
} from 'lucide-react';
import { getAllPromotersAdmin, updatePromoterStatus, getAffiliateAnalytics } from '@/app/actions/growth';
import toast from 'react-hot-toast';

export default function AdminPromoterDashboard() {
    const [promoters, setPromoters] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // In a real app, we'd get the token from the session
            const token = "admin-session";
            const [promoterData, analyticData] = await Promise.all([
                getAllPromotersAdmin(token),
                getAffiliateAnalytics(token)
            ]);
            setPromoters(promoterData);
            setAnalytics(analyticData);
        } catch (err) {
            toast.error("Failed to load promoter data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'suspended') => {
        try {
            await updatePromoterStatus("admin-token", id, newStatus);
            toast.success(`Promoter ${newStatus} successfully`);
            loadData(); // Refresh
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const filteredPromoters = promoters.filter(p => {
        const matchesSearch =
            p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.referral_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.paypal_email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="animate-spin text-orange-500" size={40} />
                <p className="text-orange-900/40 font-bold uppercase tracking-widest text-xs">Loading Affiliate Nexus...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 py-10">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-orange-950 mb-2">Growth Dashboard</h1>
                <p className="text-orange-900/40 font-bold">Manage promoters and track viral performance</p>
            </div>

            {/* Stats Overview */}
            {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Promoters"
                        value={analytics.totalAffiliates}
                        icon={<Users className="text-blue-500" />}
                        subLabel={`${analytics.activeAffiliates} active`}
                    />
                    <StatCard
                        title="Pending Apps"
                        value={analytics.pendingApplications}
                        icon={<Clock className="text-orange-500" />}
                        subLabel="Review required"
                        highlight={analytics.pendingApplications > 0}
                    />
                    <StatCard
                        title="Total Commissions"
                        value={`$${analytics.totalCommissionsEarned.toFixed(2)}`}
                        icon={<DollarSign className="text-green-500" />}
                        subLabel={`$${analytics.totalCommissionsPaid.toFixed(2)} paid out`}
                    />
                    <StatCard
                        title="Viral Clicks"
                        value={analytics.totalReferrals}
                        icon={<TrendingUp className="text-purple-500" />}
                        subLabel="Across all links"
                    />
                </div>
            )}

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-[2rem] border-4 border-orange-50">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-900/20" size={20} />
                    <input
                        id="promoter-search"
                        type="text"
                        placeholder="Search by name, code, or email..."
                        className="w-full h-12 pl-12 pr-4 bg-orange-50/30 rounded-xl border-2 border-transparent focus:border-orange-200 outline-none text-sm font-bold transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search promoters by name, referral code, or email"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {['all', 'pending_approval', 'approved', 'suspended'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${statusFilter === s
                                    ? 'bg-orange-500 text-white shadow-lg'
                                    : 'bg-orange-50 text-orange-900/40 hover:bg-orange-100'
                                }`}
                        >
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border-4 border-orange-50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-orange-50 text-[10px] font-black uppercase tracking-[0.2em] text-orange-900/40">
                                <th className="px-8 py-6">Promoter</th>
                                <th className="px-6 py-6">Referral Code</th>
                                <th className="px-6 py-6">Stats</th>
                                <th className="px-6 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-4 divide-orange-50">
                            {filteredPromoters.map((p) => (
                                <tr key={p.id} className="hover:bg-orange-50/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 font-black text-xl">
                                                {p.profiles?.full_name?.charAt(0) || 'L'}
                                            </div>
                                            <div>
                                                <div className="font-black text-orange-950">{p.profiles?.full_name || 'Legend'}</div>
                                                <div className="text-xs font-bold text-orange-900/30 flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {p.profiles?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <code className="px-3 py-1 bg-zinc-900 text-orange-400 rounded-lg text-xs font-mono font-black">
                                            {p.referral_code}
                                        </code>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="space-y-1">
                                            <div className="text-sm font-black text-orange-950">${p.total_earned.toFixed(2)}</div>
                                            <div className="text-[10px] font-black text-orange-900/20 uppercase">Total Earned</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <StatusBadge status={p.status} />
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {p.status !== 'approved' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(p.id, 'approved')}
                                                    className="p-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-md"
                                                    title="Approve"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            {p.status !== 'suspended' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(p.id, 'suspended')}
                                                    className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-md"
                                                    title="Suspend"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredPromoters.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="text-orange-900/20 mb-4 flex justify-center"><Filter size={48} /></div>
                        <p className="text-orange-900/40 font-bold">No promoters found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, subLabel, highlight = false }: any) {
    return (
        <div className={`bg-white p-8 rounded-[2.5rem] border-4 ${highlight ? 'border-orange-500' : 'border-orange-50'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-50 rounded-2xl">{icon}</div>
                <div className="text-[10px] font-black uppercase text-orange-900/20 tracking-widest">{title}</div>
            </div>
            <div className="text-4xl font-black text-orange-950 mb-2">{value}</div>
            <div className="text-[10px] font-black text-orange-900/40 uppercase tracking-widest">{subLabel}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: any = {
        pending_approval: { color: 'bg-orange-100 text-orange-600', label: 'Pending' },
        approved: { color: 'bg-green-100 text-green-600', label: 'Approved' },
        suspended: { color: 'bg-red-100 text-red-600', label: 'Suspended' }
    };

    const { color, label } = config[status] || { color: 'bg-zinc-100 text-zinc-500', label: status };

    return (
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${color}`}>
            {label}
        </span>
    );
}
