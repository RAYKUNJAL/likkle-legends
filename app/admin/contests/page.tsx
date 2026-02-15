"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, SearchBar, DataTable, StatusBadge, Modal, ActionButton,
    Plus, Edit, Eye, Trash2, RefreshCw, Target, Zap, Trophy, Users
} from '@/components/admin/AdminComponents';
import { Save, X, Calendar, Gift, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface Contest {
    id: string;
    title: string;
    slug: string;
    description: string;
    status: 'draft' | 'scheduled' | 'live' | 'paused' | 'ended';
    is_active: boolean;
    settings: {
        points_signup: number;
        points_referral: number;
    };
    prizes: Array<{
        rank: number;
        label: string;
    }>;
    created_at: string;
}

export default function AdminContestsPage() {
    const [contests, setContests] = useState<Contest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingContest, setEditingContest] = useState<Partial<Contest> | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { data } = await supabase
                .from('contests')
                .select('*')
                .order('created_at', { ascending: false });

            setContests(data || []);
        } catch (error) {
            console.error('Failed to load contests:', error);
            toast.error('Failed to load contests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingContest?.title || !editingContest?.slug) {
            toast.error('Title and Slug are required');
            return;
        }

        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();

            if (editingContest.id) {
                const { error } = await supabase
                    .from('contests')
                    .update(editingContest)
                    .eq('id', editingContest.id);
                if (error) throw error;
                toast.success('Contest updated');
            } else {
                const { error } = await supabase
                    .from('contests')
                    .insert([editingContest]);
                if (error) throw error;
                toast.success('Contest created');
            }

            setShowModal(false);
            loadData();
        } catch (error) {
            console.error('Failed to save contest:', error);
            toast.error('Failed to save contest');
        }
    };

    const deleteContest = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contest? All entries will be lost.')) return;

        try {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            const { error } = await supabase.from('contests').delete().eq('id', id);
            if (error) throw error;
            toast.success('Contest deleted');
            loadData();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const filteredContests = contests.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout activeSection="contests">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Trophy className="text-amber-500" />
                            Viral Contest Builder
                        </h1>
                        <p className="text-gray-500">Create gamified referral loops to grow de village</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                setEditingContest({
                                    status: 'draft',
                                    is_active: false,
                                    settings: { points_signup: 10, points_referral: 50 },
                                    prizes: []
                                });
                                setShowModal(true);
                            }}
                            className="bg-primary text-white py-3 px-6 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={20} />
                            Launch New Contest
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-8 space-y-6">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search contests..."
                    onRefresh={loadData}
                />

                <DataTable
                    data={filteredContests}
                    isLoading={isLoading}
                    emptyMessage="No contests yet. High time to go viral!"
                    columns={[
                        {
                            key: 'title',
                            label: 'Contest',
                            render: (c) => (
                                <div>
                                    <p className="font-bold text-gray-900">{c.title}</p>
                                    <p className="text-xs text-gray-400">/{c.slug}</p>
                                </div>
                            )
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (c) => <StatusBadge status={c.status} variant={c.status === 'live' ? 'success' : 'default'} />
                        },
                        {
                            key: 'settings',
                            label: 'Rules',
                            render: (c) => (
                                <div className="text-xs font-medium text-gray-500">
                                    <span className="text-green-600">+{c.settings?.points_signup} Entry</span> •
                                    <span className="text-blue-600 ml-1">+{c.settings?.points_referral} Ref</span>
                                </div>
                            )
                        },
                        {
                            key: 'created_at',
                            label: 'Created',
                            render: (c) => <span className="text-sm text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                        }
                    ]}
                    actions={(c) => (
                        <div className="flex items-center gap-2">
                            <ActionButton icon={Edit} onClick={() => { setEditingContest(c); setShowModal(true); }} title="Edit" />
                            <ActionButton icon={Trash2} onClick={() => deleteContest(c.id)} variant="danger" title="Delete" />
                        </div>
                    )}
                />
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingContest?.id ? "Edit Contest" : "New Viral Contest"}
                size="lg"
            >
                {editingContest && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Contest Title</label>
                                <input
                                    type="text"
                                    value={editingContest.title || ''}
                                    onChange={(e) => setEditingContest({ ...editingContest, title: e.target.value })}
                                    placeholder="e.g. Summer Story Sprint 📚"
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:border-primary focus:ring-0 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">URL Slug</label>
                                <input
                                    type="text"
                                    value={editingContest.slug || ''}
                                    onChange={(e) => setEditingContest({ ...editingContest, slug: e.target.value })}
                                    placeholder="summer-sprint"
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:border-primary focus:ring-0 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Status</label>
                                <select
                                    value={editingContest.status}
                                    onChange={(e) => setEditingContest({ ...editingContest, status: e.target.value as any })}
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:border-primary focus:ring-0 outline-none"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="live">Live</option>
                                    <option value="paused">Paused</option>
                                    <option value="ended">Ended</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 p-6 rounded-2xl space-y-4">
                            <h4 className="font-black text-blue-900 flex items-center gap-2">
                                <Zap size={18} className="text-primary" />
                                Viral Point Settings
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-blue-400 uppercase mb-1">Points for Signup</label>
                                    <input
                                        type="number"
                                        value={editingContest.settings?.points_signup || 0}
                                        onChange={(e) => setEditingContest({
                                            ...editingContest,
                                            settings: { ...editingContest.settings!, points_signup: parseInt(e.target.value) }
                                        })}
                                        className="w-full p-3 bg-white border border-blue-100 rounded-xl font-bold text-blue-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-blue-400 uppercase mb-1">Points for Referral</label>
                                    <input
                                        type="number"
                                        value={editingContest.settings?.points_referral || 0}
                                        onChange={(e) => setEditingContest({
                                            ...editingContest,
                                            settings: { ...editingContest.settings!, points_referral: parseInt(e.target.value) }
                                        })}
                                        className="w-full p-3 bg-white border border-blue-100 rounded-xl font-bold text-blue-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-3 bg-gray-50 text-gray-500 rounded-xl font-bold hover:bg-gray-100 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                {editingContest.id ? 'Save Changes' : 'Launch Contest'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}
