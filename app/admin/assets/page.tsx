"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, SearchBar, DataTable, StatusBadge, Modal,
    FileUpload, ActionButton, Tabs, EmptyState,
    Music, Video, BookOpen, FileText, Plus, Edit, Trash2, Eye, Sparkles, Wand2, Package, Search, RefreshCw
} from '@/components/admin/AdminComponents';
import {
    getSongs, createSong, updateSong, deleteSong,
    getVideos, createVideo, updateVideo, deleteVideo,
    getPrintables, createPrintable, deletePrintable,
    getStorybooks, createStorybook, deleteStorybook
} from '@/lib/database';
import { uploadFile, deleteFile, BUCKETS } from '@/lib/storage';
import { generateAssetMetadata } from '@/lib/gemini';
import Image from 'next/image';

type AssetCategory = 'songs' | 'videos' | 'printables' | 'storybooks';

export default function AdminAssetDashboard() {
    const [activeTab, setActiveTab] = useState<AssetCategory>('songs');
    const [assets, setAssets] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any | null>(null);

    // Form state
    const [formData, setFormData] = useState<any>({
        title: '',
        artist: '',
        description: '',
        url: '',
        thumbnail_url: '',
        category: '',
        tier_required: 'free',
        island_origin: 'Caribbean',
        duration_seconds: 0,
        is_active: true,
        tags: []
    });

    useEffect(() => {
        loadAssets();
    }, [activeTab]);

    const loadAssets = async () => {
        setIsLoading(true);
        try {
            let data: any[] = [];
            switch (activeTab) {
                case 'songs': data = await getSongs(); break;
                case 'videos': data = await getVideos(); break;
                case 'printables': data = await getPrintables(); break;
                case 'storybooks': data = await getStorybooks(); break;
            }
            setAssets(data);
        } catch (error) {
            console.error('Failed to load assets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (file: File, type: 'main' | 'thumbnail') => {
        const bucket = type === 'thumbnail' ? (activeTab === 'songs' ? 'songs' : activeTab === 'videos' ? 'videos' : activeTab === 'printables' ? 'printables' : 'storybooks') : (activeTab as any);
        const result = await uploadFile(bucket, file);
        if (result) {
            setFormData((prev: any) => {
                const updates = { ...prev };
                if (type === 'main') {
                    if (activeTab === 'songs') updates.audio_url = result.url;
                    else if (activeTab === 'videos') updates.video_url = result.url;
                    else if (activeTab === 'printables') updates.pdf_url = result.url;
                    else if (activeTab === 'storybooks') updates.url = result.url; // Custom for stories
                } else {
                    if (activeTab === 'songs') updates.thumbnail_url = result.url;
                    else if (activeTab === 'videos') updates.thumbnail_url = result.url;
                    else if (activeTab === 'printables') updates.preview_url = result.url;
                    else if (activeTab === 'storybooks') updates.cover_image_url = result.url;
                }
                return updates;
            });
        }
    };

    const handleMagicAI = async () => {
        if (!formData.title) return;
        setIsAILoading(true);
        try {
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
            const dataToSave = { ...formData };
            // Ensure consistency in URL fields if needed

            if (editingAsset) {
                switch (activeTab) {
                    case 'songs': await updateSong(editingAsset.id, dataToSave); break;
                    case 'videos': await updateVideo(editingAsset.id, dataToSave); break;
                }
            } else {
                switch (activeTab) {
                    case 'songs': await createSong(dataToSave); break;
                    case 'videos': await createVideo(dataToSave); break;
                    case 'printables': await createPrintable(dataToSave); break;
                    case 'storybooks': await createStorybook(dataToSave); break;
                }
            }
            setShowModal(false);
            loadAssets();
            resetForm();
        } catch (error) {
            console.error('Failed to save asset:', error);
        }
    };

    const handleDelete = async (asset: any) => {
        if (!confirm(`Are you sure you want to delete "${asset.title}"?`)) return;
        try {
            switch (activeTab) {
                case 'songs': await deleteSong(asset.id); break;
                case 'videos': await deleteVideo(asset.id); break;
                case 'printables': await deletePrintable(asset.id); break;
                case 'storybooks': await deleteStorybook(asset.id); break;
            }
            loadAssets();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            artist: '',
            description: '',
            url: '',
            thumbnail_url: '',
            category: activeTab === 'printables' ? 'coloring' : '',
            tier_required: 'free',
            island_origin: 'Caribbean',
            duration_seconds: 0,
            is_active: true,
            tags: []
        });
        setEditingAsset(null);
    };

    const filteredAssets = assets.filter(a =>
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.artist?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout activeSection="media">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Package className="text-primary" />
                            Digital Asset Manager
                        </h1>
                        <p className="text-gray-500">Upload and manage music, videos, and printable activities</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={20} />
                        Add New {activeTab.slice(0, -1)}
                    </button>
                </div>
            </header>

            <div className="p-8">
                <Tabs
                    tabs={[
                        { id: 'songs', label: 'Music & Audio', count: activeTab === 'songs' ? assets.length : undefined },
                        { id: 'videos', label: 'Video Lessons', count: activeTab === 'videos' ? assets.length : undefined },
                        { id: 'printables', label: 'Printables (PDFs)', count: activeTab === 'printables' ? assets.length : undefined },
                        { id: 'storybooks', label: 'Interactive Books', count: activeTab === 'storybooks' ? assets.length : undefined },
                    ]}
                    activeTab={activeTab}
                    onChange={(id) => setActiveTab(id as AssetCategory)}
                />

                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder={`Search ${activeTab}...`}
                    onRefresh={loadAssets}
                />

                <DataTable
                    data={filteredAssets}
                    isLoading={isLoading}
                    emptyMessage={`No ${activeTab} found. Let's upload some island magic!`}
                    columns={[
                        {
                            key: 'title',
                            label: 'Asset',
                            render: (asset) => (
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                        {(asset.thumbnail_url || asset.cover_image_url || asset.preview_url) ? (
                                            <Image src={asset.thumbnail_url || asset.cover_image_url || asset.preview_url} alt="" fill className="object-cover" />
                                        ) : (
                                            activeTab === 'songs' ? <Music className="text-gray-400" /> : <Video className="text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{asset.title}</p>
                                        <p className="text-xs text-gray-400">{asset.artist || asset.island_origin || asset.category || 'Original Content'}</p>
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: 'tier_required',
                            label: 'Access',
                            render: (asset) => (
                                <StatusBadge
                                    status={asset.tier_required === 'free' ? 'Free' : asset.tier_required.replace('_', ' ')}
                                    variant={asset.tier_required === 'free' ? 'success' : 'info'}
                                />
                            )
                        },
                        {
                            key: 'is_active',
                            label: 'Status',
                            render: (asset) => (
                                <StatusBadge
                                    status={asset.is_active ? 'Active' : 'Private'}
                                    variant={asset.is_active ? 'success' : 'default'}
                                />
                            )
                        },
                        {
                            key: 'created_at',
                            label: 'Uploaded',
                            render: (asset) => new Date(asset.created_at).toLocaleDateString()
                        }
                    ]}
                    actions={(asset) => (
                        <div className="flex items-center gap-1">
                            <ActionButton icon={Edit} onClick={() => { setEditingAsset(asset); setFormData(asset); setShowModal(true); }} title="Edit" />
                            <ActionButton icon={Trash2} onClick={() => handleDelete(asset)} variant="danger" title="Delete" />
                        </div>
                    )}
                />
            </div>

            {/* Upload/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingAsset ? `Edit ${activeTab.slice(0, -1)}` : `New ${activeTab.slice(0, -1)}`}
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
                                        placeholder="e.g. Steelpan Serenade"
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

                            {activeTab === 'songs' && (
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Artist / Island</label>
                                    <input
                                        type="text"
                                        value={formData.artist}
                                        onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                        placeholder="e.g. Tanty Spice"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    rows={3}
                                    placeholder="Tell the kids about this asset..."
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
                                        <option value="mini_legend">Mini Legend</option>
                                        <option value="big_legend">Big Legend</option>
                                        <option value="legends_plus">Legends Plus</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                                    <select
                                        value={formData.is_active ? 'true' : 'false'}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Private (Draft)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Media File</label>
                                <FileUpload
                                    accept={activeTab === 'songs' ? 'audio/*' : activeTab === 'videos' ? 'video/*' : 'application/pdf,image/*'}
                                    onUpload={(file) => handleFileUpload(file, 'main')}
                                    label={`Upload ${activeTab.slice(0, -1)}`}
                                    description={formData.audio_url || formData.video_url || formData.file_url ? 'File uploaded! Click to replace.' : `Drag and drop your ${activeTab.slice(0, -1)} here`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Thumbnail / Cover</label>
                                <FileUpload
                                    accept="image/*"
                                    onUpload={(file) => handleFileUpload(file, 'thumbnail')}
                                    label="Upload Image"
                                    description="PNG, JPG recommended"
                                />
                            </div>
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
                            {editingAsset ? 'Save Changes' : `Upload ${activeTab.slice(0, -1)}`}
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
