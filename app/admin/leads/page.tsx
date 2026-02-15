"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, SearchBar, DataTable, StatusBadge, ActionButton,
    Users, Trash2, RefreshCw
} from '@/components/admin/AdminComponents';
import { Mail, ExternalLink } from 'lucide-react';
import { getAllLeads, deleteLead, updateLeadStatus } from '@/app/actions/crm';

interface Lead {
    id: string;
    email: string;
    child_name?: string;
    island_preference?: string;
    source: string; // e.g. 'story_studio'
    status: string; // 'new', 'contacted', 'converted', 'lost'
    created_at: string;
}

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const data = await getAllLeads(session.access_token);
            setLeads(data);
        } catch (error) {
            console.error('Failed to load leads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await deleteLead(session.access_token, id);
            setLeads(prev => prev.filter(l => l.id !== id));
        } catch (error) {
            alert('Delete failed');
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await updateLeadStatus(session.access_token, id, status);
            setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
        } catch (error) {
            alert('Update failed');
        }
    };

    const filteredLeads = leads.filter(l =>
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        l.child_name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout activeSection="customers">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Leads & CRM</h1>
                        <p className="text-gray-500">Manage potential customers from the Story Studio</p>
                    </div>
                    <button
                        onClick={loadLeads}
                        className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            <div className="p-8">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search leads..."
                />

                <DataTable
                    data={filteredLeads}
                    isLoading={isLoading}
                    emptyMessage="No leads found. Are people using the Story Studio?"
                    columns={[
                        {
                            key: 'email',
                            label: 'Lead',
                            render: (item) => (
                                <div>
                                    <p className="font-bold text-gray-900">{item.email}</p>
                                    <p className="text-xs text-gray-400 capitalize">{item.source.replace('_', ' ')}</p>
                                </div>
                            )
                        },
                        {
                            key: 'child_name',
                            label: 'Details',
                            render: (item) => (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{item.child_name || 'N/A'}</p>
                                    <p className="text-xs text-gray-400">{item.island_preference || ''}</p>
                                </div>
                            )
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (item) => (
                                <select
                                    value={item.status}
                                    onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                                    className="text-xs font-bold bg-gray-50 border-none rounded-lg focus:ring-0"
                                >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="converted">Converted</option>
                                    <option value="lost">Lost</option>
                                </select>
                            )
                        },
                        {
                            key: 'created_at',
                            label: 'Date',
                            render: (item) => (
                                <p className="text-sm text-gray-500">
                                    {new Date(item.created_at).toLocaleDateString()}
                                </p>
                            )
                        }
                    ]}
                    actions={(item) => (
                        <div className="flex items-center gap-2">
                            <ActionButton
                                icon={Mail}
                                onClick={() => window.location.href = `mailto:${item.email}`}
                                title="Email Lead"
                            />
                            <ActionButton
                                icon={Trash2}
                                onClick={() => handleDelete(item.id)}
                                variant="danger"
                                title="Delete"
                            />
                        </div>
                    )}
                />
            </div>
        </AdminLayout>
    );
}
