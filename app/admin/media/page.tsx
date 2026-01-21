"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    AdminLayout, SearchBar, DataTable, StatusBadge, Modal, Tabs,
    FileUpload, ActionButton, EmptyState,
    Music, Video, Plus, Edit, Trash2, Eye, Upload, BookOpen, FileText, Sparkles, RefreshCw
} from '@/components/admin/AdminComponents';
import { uploadFile, BUCKETS } from '@/lib/storage';
import Image from 'next/image';

type AssetCategory = 'songs' | 'videos' | 'printables' | 'storybooks';

function MediaManagerContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab') as AssetCategory;
    const [activeTab, setActiveTab] = useState<AssetCategory>(tabParam || 'songs');
    const [assets, setAssets] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({
        title: '',
        artist: 'Likkle Legends',
        description: '',
        tier_required: 'starter_mailer',
        category: 'general',
        age_track: 'all',
        island_origin: 'Caribbean',
        audio_url: '',
        video_url: '',
        thumbnail_url: '',
        file_url: '',
        url: '', // for storybooks
        cover_image_url: '',
        preview_url: '',
        is_active: true
    });

    useEffect(() => {
        loadMedia();
    }, [activeTab]);

    const loadMedia = async () => {
        setIsLoading(true);
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { getAdminContent } = await import('@/app/actions/admin');
            const data = await getAdminContent(session.access_token, activeTab);
            setAssets(data);
        } catch (error) {
            console.error('Failed to load media:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (file: File, type: 'main' | 'thumbnail') => {
        let bucket: any = BUCKETS.SONGS;
        if (activeTab === 'songs') bucket = BUCKETS.SONGS;
        else if (activeTab === 'videos') bucket = BUCKETS.VIDEOS;
        else if (activeTab === 'printables') bucket = BUCKETS.PRINTABLES;
        else if (activeTab === 'storybooks') bucket = BUCKETS.STORYBOOKS;

        const result = await uploadFile(bucket, file);

        if (result) {
            setFormData((prev: any) => {
                const updates = { ...prev };
                if (type === 'main') {
                    if (activeTab === 'songs') updates.audio_url = result.url;
                    else if (activeTab === 'videos') updates.video_url = result.url;
                    else if (activeTab === 'printables') updates.pdf_url = result.url;
                    else if (activeTab === 'storybooks') updates.url = result.url;
                } else {
                    if (activeTab === 'storybooks') updates.cover_image_url = result.url;
                    else if (activeTab === 'printables') updates.preview_url = result.url;
                    else updates.thumbnail_url = result.url;
                }
                return updates;
            });
        }
    };

    const handleMagicAI = async () => {
        if (!formData.title) return;
        setIsAILoading(true);
        try {
            const { generateAssetMetadata } = await import('@/lib/gemini');
            const aiData = await generateAssetMetadata(formData.title, activeTab);
            setFormData((prev: any) => ({
                ...prev,
                description: aiData.description,
                tags: aiData.tags
            }));
        } catch (error) {
            console.error("AI metadata failed", error);
        } finally {
            setIsAILoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { saveAdminContent } = await import('@/app/actions/admin');

            const dataToSave = { ...formData };
            if (editingItem) dataToSave.id = editingItem.id;

            await saveAdminContent(session.access_token, activeTab, dataToSave);

            setShowModal(false);
            setEditingItem(null);
            resetForm();
            loadMedia();
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;
        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { deleteAdminContent } = await import('@/app/actions/admin');
            await deleteAdminContent(session.access_token, activeTab, id);
            loadMedia();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            artist: 'Likkle Legends',
            description: '',
            tier_required: 'starter_mailer',
            category: 'general',
            age_track: 'all',
            island_origin: 'Caribbean',
            audio_url: '',
            video_url: '',
            thumbnail_url: '',
            url: '',
            cover_image_url: '',
            preview_url: '',
            is_active: true
        });
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setShowModal(true);
    };

    const filteredAssets = assets.filter(a =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.artist?.toLowerCase().includes(search.toLowerCase())
    );

    const getThumbnail = (item: any) => {
        return item.thumbnail_url || item.cover_image_url || item.preview_url;
    };

    const getMainUrl = (item: any) => {
        return item.audio_url || item.video_url || item.url || item.pdf_url;
    };

    return (
        <AdminLayout activeSection="media">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Media & Content</h1>
                        <p className="text-gray-500">Manage all digital learning assets</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setEditingItem(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus size={20} />
                        Add {activeTab.slice(0, -1)}
                    </button>
                </div>
            </header>

            <div className="p-8">
                <Tabs
                    tabs={[
                        { id: 'songs', label: 'Songs', count: activeTab === 'songs' ? assets.length : undefined },
                        { id: 'videos', label: 'Videos', count: activeTab === 'videos' ? assets.length : undefined },
                        { id: 'printables', label: 'Printables', count: activeTab === 'printables' ? assets.length : undefined },
                        { id: 'storybooks', label: 'Storybooks', count: activeTab === 'storybooks' ? assets.length : undefined },
                    ]}
                    activeTab={activeTab}
                    onChange={(id) => setActiveTab(id as AssetCategory)}
                />

                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder={`Search ${activeTab}...`}
                    onRefresh={loadMedia}
                />

                <DataTable
                    data={filteredAssets}
                    isLoading={isLoading}
                    emptyMessage={`No ${activeTab} found.`}
                    columns={[
                        {
                            key: 'title',
                            label: 'Asset',
                            render: (item) => (
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                        {getThumbnail(item) ? (
                                            <Image src={getThumbnail(item)} alt="" fill className="object-cover" />
                                        ) : (
                                            activeTab === 'songs' ? <Music className="text-gray-400" /> : <Video className="text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{item.title}</p>
                                        <p className="text-xs text-gray-400">{item.artist || item.category}</p>
                                    </div>
                                </div>
                            ),
                        },
                        {
                            key: 'tier_required',
                            label: 'Tier',
                            render: (item) => (
                                <StatusBadge status={item.tier_required.replace('_', ' ')} variant="info" />
                            ),
                        },
                        {
                            key: 'age_track',
                            label: 'Age',
                            render: (item) => <span className="capitalize">{item.age_track}</span>,
                        },
                        {
                            key: 'is_active',
                            label: 'Status',
                            render: (item) => (
                                <StatusBadge
                                    status={item.is_active ? 'Active' : 'Private'}
                                    variant={item.is_active ? 'success' : 'default'}
                                />
                            ),
                        },
                    ]}
                    actions={(item) => (
                        <div className="flex items-center gap-1">
                            {getMainUrl(item) && <ActionButton icon={Eye} onClick={() => window.open(getMainUrl(item))} title="Preview" />}
                            <ActionButton icon={Edit} onClick={() => openEditModal(item)} title="Edit" />
                            <ActionButton icon={Trash2} onClick={() => handleDelete(item.id)} variant="danger" title="Delete" />
                        </div>
                    )}
                />
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingItem(null); resetForm(); }}
                title={editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
                size="lg"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20"
                                        placeholder="Enter title..."
                                    />
                                    <button
                                        onClick={handleMagicAI}
                                        disabled={!formData.title || isAILoading}
                                        className="px-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 transition-colors disabled:opacity-50"
                                        title="AI Metadata Magic"
                                    >
                                        {isAILoading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tier Required</label>
                                    <select
                                        value={formData.tier_required}
                                        onChange={(e) => setFormData({ ...formData, tier_required: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    >
                                        <option value="free">Free</option>
                                        <option value="starter_mailer">Starter Mailer</option>
                                        <option value="legends_plus">Legends Plus</option>
                                        <option value="family_legacy">Family Legacy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Age Track</label>
                                    <select
                                        value={formData.age_track}
                                        onChange={(e) => setFormData({ ...formData, age_track: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    >
                                        <option value="all">All Ages</option>
                                        <option value="mini">Mini (4-5)</option>
                                        <option value="big">Big (6-8)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700">Media Files</label>
                            <FileUpload
                                accept={activeTab === 'songs' ? 'audio/*' : activeTab === 'videos' ? 'video/*' : 'application/pdf,image/*'}
                                onUpload={(file) => handleFileUpload(file, 'main')}
                                label={`Upload ${activeTab.slice(0, -1)}`}
                                description={getMainUrl(formData) ? 'File uploaded!' : 'Drop file here'}
                            />

                            <label className="block text-sm font-bold text-gray-700">Thumbnail</label>
                            <FileUpload
                                accept="image/*"
                                onUpload={(file) => handleFileUpload(file, 'thumbnail')}
                                label="Upload Thumbnail"
                                description="Image preview"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                            {editingItem ? 'Save Changes' : 'Upload Asset'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}

export default function AdminMediaPage() {
    return (
        <Suspense fallback={<AdminLayout activeSection="media"><div className="p-8">Loading Media...</div></AdminLayout>}>
            <MediaManagerContent />
        </Suspense>
    );
}
