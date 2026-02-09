"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    AdminLayout, SearchBar, DataTable, StatusBadge, Modal,
    ActionButton, EmptyState,
    Megaphone, Plus, Edit, Trash2, Eye
} from '@/components/admin/AdminComponents';
import { getAdminAnnouncements, saveAdminAnnouncement, deleteAdminAnnouncement } from '@/app/actions/admin';

interface Announcement {
    id: string;
    title: string;
    body: string;
    image_url?: string;
    target_audience: string;
    tier_required?: string;
    is_active: boolean;
    start_date: string;
    end_date?: string;
    created_at: string;
}

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        image_url: '',
        target_audience: 'all',
        tier_required: '',
        is_active: true,
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
    });

    const loadAnnouncements = useCallback(async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const data = await getAdminAnnouncements(session.access_token);
            setAnnouncements(data as Announcement[]);
        } catch (error) {
            console.error('Failed to load announcements:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAnnouncements();
    }, [loadAnnouncements]);

    const handleSubmit = async () => {
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const payload = {
                ...formData,
                end_date: formData.end_date || null,
                tier_required: formData.tier_required || null,
            };

            if (editingAnnouncement) {
                (payload as any).id = editingAnnouncement.id;
            }

            await saveAdminAnnouncement(session.access_token, payload);

            setShowModal(false);
            setEditingAnnouncement(null);
            resetForm();
            loadAnnouncements();
        } catch (error) {
            console.error('Failed to save announcement:', error);
            alert("Failed to save announcement");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;

        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await deleteAdminAnnouncement(session.access_token, id);
            loadAnnouncements();
        } catch (error) {
            console.error('Failed to delete:', error);
            alert("Failed to delete announcement");
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            body: '',
            image_url: '',
            target_audience: 'all',
            tier_required: '',
            is_active: true,
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
        });
    };

    const openEditModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            body: announcement.body,
            image_url: announcement.image_url || '',
            target_audience: announcement.target_audience,
            tier_required: announcement.tier_required || '',
            is_active: announcement.is_active,
            start_date: announcement.start_date.split('T')[0],
            end_date: announcement.end_date?.split('T')[0] || '',
        });
        setShowModal(true);
    };

    const filteredAnnouncements = announcements.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.body.toLowerCase().includes(search.toLowerCase())
    );

    const getAudienceLabel = (audience: string) => {
        const labels: Record<string, { label: string; color: string }> = {
            all: { label: 'All Users', color: 'bg-blue-100 text-blue-700' },
            parents: { label: 'Parents Only', color: 'bg-purple-100 text-purple-700' },
            grandparents: { label: 'Grandparents', color: 'bg-pink-100 text-pink-700' },
            subscribers: { label: 'Subscribers', color: 'bg-green-100 text-green-700' },
        };
        return labels[audience] || { label: audience, color: 'bg-gray-100 text-gray-700' };
    };

    return (
        <AdminLayout activeSection="announcements">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Announcements</h1>
                        <p className="text-gray-500">Broadcast messages to your users</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setEditingAnnouncement(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={20} />
                        New Announcement
                    </button>
                </div>
            </header>

            <div className="p-8">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search announcements..."
                    onRefresh={loadAnnouncements}
                />

                {filteredAnnouncements.length === 0 && !isLoading ? (
                    <EmptyState
                        icon={Megaphone}
                        title="No Announcements"
                        description="Create your first announcement to notify users"
                        action={{
                            label: 'Create Announcement',
                            onClick: () => setShowModal(true),
                        }}
                    />
                ) : (
                    <DataTable
                        data={filteredAnnouncements}
                        isLoading={isLoading}
                        columns={[
                            {
                                key: 'title',
                                label: 'Announcement',
                                render: (a) => (
                                    <div>
                                        <p className="font-bold text-gray-900">{a.title}</p>
                                        <p className="text-sm text-gray-500 line-clamp-1">{a.body}</p>
                                    </div>
                                ),
                            },
                            {
                                key: 'target_audience',
                                label: 'Audience',
                                render: (a) => {
                                    const audience = getAudienceLabel(a.target_audience);
                                    return (
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${audience.color}`}>
                                            {audience.label}
                                        </span>
                                    );
                                },
                            },
                            {
                                key: 'is_active',
                                label: 'Status',
                                render: (a) => {
                                    const now = new Date();
                                    const start = new Date(a.start_date);
                                    const end = a.end_date ? new Date(a.end_date) : null;

                                    let status = 'Inactive';
                                    let variant: 'success' | 'warning' | 'default' = 'default';

                                    if (a.is_active && start <= now && (!end || end >= now)) {
                                        status = 'Live';
                                        variant = 'success';
                                    } else if (a.is_active && start > now) {
                                        status = 'Scheduled';
                                        variant = 'warning';
                                    }

                                    return <StatusBadge status={status} variant={variant} />;
                                },
                            },
                            {
                                key: 'start_date',
                                label: 'Schedule',
                                render: (a) => (
                                    <div className="text-sm">
                                        <p className="text-gray-600">
                                            {new Date(a.start_date).toLocaleDateString()}
                                        </p>
                                        {a.end_date && (
                                            <p className="text-gray-400">
                                                to {new Date(a.end_date).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ),
                            },
                        ]}
                        actions={(a) => (
                            <div className="flex items-center gap-1">
                                <ActionButton icon={Edit} onClick={() => openEditModal(a)} title="Edit" />
                                <ActionButton icon={Trash2} onClick={() => handleDelete(a.id)} variant="danger" title="Delete" />
                            </div>
                        )}
                    />
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingAnnouncement(null); resetForm(); }}
                title={editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
                size="lg"
            >
                <div className="space-y-6">
                    <div>
                        <div>
                            <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                            <input
                                id="title"
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="Announcement title..."
                            />
                        </div>

                        <div>
                            <label htmlFor="body" className="block text-sm font-bold text-gray-700 mb-2">Message *</label>
                            <textarea
                                id="body"
                                value={formData.body}
                                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                rows={4}
                                placeholder="Your announcement message..."
                            />
                        </div>

                        <div>
                            <label htmlFor="image_url" className="block text-sm font-bold text-gray-700 mb-2">Image URL (optional)</label>
                            <input
                                id="image_url"
                                type="url"
                                value={formData.image_url}
                                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="target_audience" className="block text-sm font-bold text-gray-700 mb-2">Target Audience</label>
                                <select
                                    id="target_audience"
                                    title="Target Audience"
                                    value={formData.target_audience}
                                    onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="all">All Users</option>
                                    <option value="parents">Parents Only</option>
                                    <option value="grandparents">Grandparents Only</option>
                                    <option value="subscribers">Active Subscribers</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="tier_required" className="block text-sm font-bold text-gray-700 mb-2">Tier Required (optional)</label>
                                <select
                                    id="tier_required"
                                    title="Subscription Tier Required"
                                    value={formData.tier_required}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tier_required: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="">Any Tier</option>
                                    <option value="starter_mailer">Starter Mailer+</option>
                                    <option value="legends_plus">Legends Plus+</option>
                                    <option value="family_legacy">Family Legacy Only</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="start_date" className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                                <input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label htmlFor="end_date" className="block text-sm font-bold text-gray-700 mb-2">End Date (optional)</label>
                                <input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                className="w-5 h-5 rounded"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                                Announcement is active
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => { setShowModal(false); setEditingAnnouncement(null); resetForm(); }}
                                className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!formData.title || !formData.body}
                                className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {editingAnnouncement ? 'Save Changes' : 'Publish Announcement'}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
