"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    AdminLayout, RefreshCw, Download, Users, TrendingUp,
    Plus, Eye, Search
} from '@/components/admin/AdminComponents';

interface Lead {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    user_type: string;
    island_origin?: string;
    is_diaspora: boolean;
    source: string;
    status: string;
    created_at: string;
    email_opens: number;
    email_clicks: number;
}

interface LeadStats {
    total: number;
    thisWeek: number;
    parents: number;
    teachers: number;
    diaspora: number;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState<LeadStats>({
        total: 0, thisWeek: 0, parents: 0, teachers: 0, diaspora: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'parent' | 'teacher' | 'diaspora'>('all');

    const loadLeads = useCallback(async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');

            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                console.error('Failed to load leads:', error);
                setLeads([]);
            } else {
                setLeads(data || []);

                // Calculate stats
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

                setStats({
                    total: data?.length || 0,
                    thisWeek: data?.filter(l => new Date(l.created_at) > weekAgo).length || 0,
                    parents: data?.filter(l => l.user_type === 'parent').length || 0,
                    teachers: data?.filter(l => l.user_type === 'teacher').length || 0,
                    diaspora: data?.filter(l => l.is_diaspora).length || 0,
                });
            }
        } catch (error) {
            console.error('Load error:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLeads();
    }, [loadLeads]);

    const exportCSV = () => {
        const headers = ['Email', 'Name', 'Type', 'Island', 'Diaspora', 'Source', 'Date'];
        const rows = leads.map(l => [
            l.email,
            [l.first_name, l.last_name].filter(Boolean).join(' '),
            l.user_type,
            l.island_origin || '',
            l.is_diaspora ? 'Yes' : 'No',
            l.source || '',
            new Date(l.created_at).toLocaleDateString()
        ]);

        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = !search ||
            lead.email.toLowerCase().includes(search.toLowerCase()) ||
            lead.first_name?.toLowerCase().includes(search.toLowerCase());

        const matchesFilter = filter === 'all' ||
            (filter === 'diaspora' ? lead.is_diaspora : lead.user_type === filter);

        return matchesSearch && matchesFilter;
    });

    return (
        <AdminLayout activeSection="leads">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Users className="text-primary" />
                            Leads & Email List
                        </h1>
                        <p className="text-gray-500">Caribbean Growth Engine - Email Captures</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadLeads}
                            className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            aria-label="Refresh"
                        >
                            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={exportCSV}
                            className="px-4 py-3 bg-gray-100 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200"
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Total Leads', value: stats.total, icon: Users, color: 'bg-blue-500' },
                        { label: 'This Week', value: stats.thisWeek, icon: TrendingUp, color: 'bg-green-500' },
                        { label: 'Parents', value: stats.parents, icon: Users, color: 'bg-orange-500' },
                        { label: 'Teachers', value: stats.teachers, icon: Users, color: 'bg-purple-500' },
                        { label: 'Diaspora', value: stats.diaspora, icon: Users, color: 'bg-teal-500' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
                                <Icon size={20} className="text-white" />
                            </div>
                            <div className="text-2xl font-black text-gray-900">{value}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase">{label}</div>
                        </div>
                    ))}
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
                    <div className="relative flex-1 w-full">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            id="leads-search"
                            type="text"
                            placeholder="Search by email or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                            aria-label="Search leads by email or name"
                        />
                    </div>
                    <div className="flex gap-2">
                        {(['all', 'parent', 'teacher', 'diaspora'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl font-bold capitalize transition-all ${filter === f
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left p-4 font-bold text-gray-600 text-sm">Email</th>
                                <th className="text-left p-4 font-bold text-gray-600 text-sm">Name</th>
                                <th className="text-left p-4 font-bold text-gray-600 text-sm">Type</th>
                                <th className="text-left p-4 font-bold text-gray-600 text-sm">Island</th>
                                <th className="text-left p-4 font-bold text-gray-600 text-sm">Source</th>
                                <th className="text-left p-4 font-bold text-gray-600 text-sm">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-400">
                                        {isLoading ? 'Loading...' : 'No leads yet. Run the SQL migration first!'}
                                    </td>
                                </tr>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50">
                                        <td className="p-4 font-mono text-sm">{lead.email}</td>
                                        <td className="p-4">
                                            {[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${lead.user_type === 'teacher'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : lead.user_type === 'grandparent'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {lead.user_type}
                                            </span>
                                            {lead.is_diaspora && (
                                                <span className="ml-1 px-2 py-1 bg-teal-100 text-teal-700 rounded-lg text-xs font-bold">
                                                    Diaspora
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm">{lead.island_origin || '—'}</td>
                                        <td className="p-4 text-xs text-gray-500">{lead.source || '—'}</td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
