"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, SearchBar, DataTable, StatusBadge, Modal, Tabs,
    FileUpload, ActionButton, EmptyState,
    Music, Video, Plus, Edit, Trash2, Eye, Upload
} from '@/components/admin/AdminComponents';
import { getSongs, getVideos, createSong, createVideo, updateSong, updateVideo } from '@/lib/database';
import { uploadFile, BUCKETS } from '@/lib/storage';

interface Song {
    id: string;
    title: string;
    artist: string;
    audio_url: string;
    video_url?: string;
    thumbnail_url?: string;
    duration_seconds?: number;
    tier_required: string;
    category: string;
    age_track: string;
    play_count: number;
    is_active: boolean;
    created_at: string;
}

interface VideoItem {
    id: string;
    title: string;
    description?: string;
    video_url: string;
    thumbnail_url?: string;
    duration_seconds?: number;
    tier_required: string;
    category: string;
    age_track: string;
    is_active: boolean;
    created_at: string;
}

export default function AdminMediaPage() {
    const [activeTab, setActiveTab] = useState('songs');
    const [songs, setSongs] = useState<Song[]>([]);
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Song | VideoItem | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        artist: 'Likkle Legends',
        description: '',
        tier_required: 'starter_mailer',
        category: 'nursery',
        age_track: 'all',
        audio_url: '',
        video_url: '',
        thumbnail_url: '',
    });

    useEffect(() => {
        loadMedia();
    }, []);

    const loadMedia = async () => {
        setIsLoading(true);
        try {
            const [songsData, videosData] = await Promise.all([
                getSongs(),
                getVideos(),
            ]);
            setSongs(songsData as Song[]);
            setVideos(videosData as VideoItem[]);
        } catch (error) {
            console.error('Failed to load media:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (file: File, type: 'audio' | 'video' | 'thumbnail') => {
        const bucket = type === 'audio' ? BUCKETS.SONGS : type === 'video' ? BUCKETS.VIDEOS : BUCKETS.SONGS;
        const result = await uploadFile(bucket, file);

        if (result) {
            if (type === 'audio') {
                setFormData(prev => ({ ...prev, audio_url: result.url }));
            } else if (type === 'video') {
                setFormData(prev => ({ ...prev, video_url: result.url }));
            } else {
                setFormData(prev => ({ ...prev, thumbnail_url: result.url }));
            }
        }
    };

    const handleSubmit = async () => {
        try {
            if (activeTab === 'songs') {
                if (editingItem) {
                    await updateSong(editingItem.id, formData);
                } else {
                    await createSong(formData);
                }
            } else {
                if (editingItem) {
                    await updateVideo(editingItem.id, formData);
                } else {
                    await createVideo(formData);
                }
            }

            setShowModal(false);
            setEditingItem(null);
            resetForm();
            loadMedia();
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            artist: 'Likkle Legends',
            description: '',
            tier_required: 'starter_mailer',
            category: 'nursery',
            age_track: 'all',
            audio_url: '',
            video_url: '',
            thumbnail_url: '',
        });
    };

    const openEditModal = (item: Song | VideoItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            artist: 'artist' in item ? item.artist : 'Likkle Legends',
            description: 'description' in item ? item.description || '' : '',
            tier_required: item.tier_required,
            category: item.category,
            age_track: item.age_track,
            audio_url: 'audio_url' in item ? item.audio_url : '',
            video_url: item.video_url || '',
            thumbnail_url: item.thumbnail_url || '',
        });
        setShowModal(true);
    };

    const filteredSongs = songs.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.artist.toLowerCase().includes(search.toLowerCase())
    );

    const filteredVideos = videos.filter(v =>
        v.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout activeSection="media">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Media Library</h1>
                        <p className="text-gray-500">Manage songs, videos, and audio content</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setEditingItem(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={20} />
                        Add {activeTab === 'songs' ? 'Song' : 'Video'}
                    </button>
                </div>
            </header>

            <div className="p-8">
                <Tabs
                    tabs={[
                        { id: 'songs', label: 'Songs', count: songs.length },
                        { id: 'videos', label: 'Videos', count: videos.length },
                    ]}
                    activeTab={activeTab}
                    onChange={setActiveTab}
                />

                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder={`Search ${activeTab}...`}
                    onRefresh={loadMedia}
                />

                {activeTab === 'songs' ? (
                    <DataTable
                        data={filteredSongs}
                        isLoading={isLoading}
                        emptyMessage="No songs uploaded yet"
                        columns={[
                            {
                                key: 'title',
                                label: 'Song',
                                render: (song) => (
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                                            <Music className="text-white" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{song.title}</p>
                                            <p className="text-xs text-gray-400">{song.artist}</p>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'category',
                                label: 'Category',
                                render: (song) => <span className="capitalize">{song.category}</span>,
                            },
                            {
                                key: 'tier_required',
                                label: 'Tier',
                                render: (song) => (
                                    <StatusBadge status={song.tier_required.replace('_', ' ')} variant="info" />
                                ),
                            },
                            {
                                key: 'play_count',
                                label: 'Plays',
                                render: (song) => song.play_count.toLocaleString(),
                            },
                            {
                                key: 'is_active',
                                label: 'Status',
                                render: (song) => (
                                    <StatusBadge
                                        status={song.is_active ? 'Active' : 'Inactive'}
                                        variant={song.is_active ? 'success' : 'default'}
                                    />
                                ),
                            },
                        ]}
                        actions={(song) => (
                            <div className="flex items-center gap-1">
                                <ActionButton icon={Eye} onClick={() => window.open(song.audio_url)} title="Preview" />
                                <ActionButton icon={Edit} onClick={() => openEditModal(song)} title="Edit" />
                                <ActionButton icon={Trash2} onClick={() => { }} variant="danger" title="Delete" />
                            </div>
                        )}
                    />
                ) : (
                    <DataTable
                        data={filteredVideos}
                        isLoading={isLoading}
                        emptyMessage="No videos uploaded yet"
                        columns={[
                            {
                                key: 'title',
                                label: 'Video',
                                render: (video) => (
                                    <div className="flex items-center gap-3">
                                        {video.thumbnail_url ? (
                                            <img src={video.thumbnail_url} alt="" className="w-16 h-10 object-cover rounded-lg" />
                                        ) : (
                                            <div className="w-16 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                                                <Video className="text-white" size={18} />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-bold text-gray-900">{video.title}</p>
                                            <p className="text-xs text-gray-400">{video.category}</p>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'tier_required',
                                label: 'Tier',
                                render: (video) => (
                                    <StatusBadge status={video.tier_required.replace('_', ' ')} variant="info" />
                                ),
                            },
                            {
                                key: 'age_track',
                                label: 'Age',
                                render: (video) => <span className="capitalize">{video.age_track}</span>,
                            },
                            {
                                key: 'is_active',
                                label: 'Status',
                                render: (video) => (
                                    <StatusBadge
                                        status={video.is_active ? 'Active' : 'Inactive'}
                                        variant={video.is_active ? 'success' : 'default'}
                                    />
                                ),
                            },
                        ]}
                        actions={(video) => (
                            <div className="flex items-center gap-1">
                                <ActionButton icon={Eye} onClick={() => window.open(video.video_url)} title="Preview" />
                                <ActionButton icon={Edit} onClick={() => openEditModal(video)} title="Edit" />
                                <ActionButton icon={Trash2} onClick={() => { }} variant="danger" title="Delete" />
                            </div>
                        )}
                    />
                )}
            </div>

            {/* Upload Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingItem(null); resetForm(); }}
                title={editingItem ? `Edit ${activeTab === 'songs' ? 'Song' : 'Video'}` : `Add New ${activeTab === 'songs' ? 'Song' : 'Video'}`}
                size="lg"
            >
                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                        <input
                            id="title"
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Enter title..."
                        />
                    </div>

                    {/* Artist (songs only) */}
                    {activeTab === 'songs' && (
                        <div>
                            <label htmlFor="artist" className="block text-sm font-bold text-gray-700 mb-2">Artist</label>
                            <input
                                id="artist"
                                type="text"
                                value={formData.artist}
                                onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    )}

                    {/* Description (videos only) */}
                    {activeTab === 'videos' && (
                        <div>
                            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                                rows={3}
                            />
                        </div>
                    )}

                    {/* File Uploads */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {activeTab === 'songs' ? (
                            <FileUpload
                                accept="audio/mpeg,audio/mp3,audio/wav"
                                onUpload={(file) => handleFileUpload(file, 'audio')}
                                label="Upload Audio File"
                                description="MP3, WAV up to 50MB"
                                maxSize={50}
                            />
                        ) : (
                            <FileUpload
                                accept="video/mp4,video/webm,video/quicktime"
                                onUpload={(file) => handleFileUpload(file, 'video')}
                                label="Upload Video File"
                                description="MP4, WebM up to 100MB"
                                maxSize={100}
                            />
                        )}

                        <FileUpload
                            accept="image/png,image/jpeg,image/webp"
                            onUpload={(file) => handleFileUpload(file, 'thumbnail')}
                            label="Upload Thumbnail"
                            description="PNG, JPG up to 5MB"
                            maxSize={5}
                        />
                    </div>

                    {/* Preview URLs */}
                    {(formData.audio_url || formData.video_url) && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                            <p className="text-xs font-bold text-gray-500 mb-1">Uploaded File:</p>
                            <p className="text-sm text-primary truncate">{formData.audio_url || formData.video_url}</p>
                        </div>
                    )}

                    {/* Settings */}
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="tier_required" className="block text-sm font-bold text-gray-700 mb-2">Tier Required</label>
                            <select
                                id="tier_required"
                                value={formData.tier_required}
                                onChange={(e) => setFormData(prev => ({ ...prev, tier_required: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="starter_mailer">Starter Mailer</option>
                                <option value="legends_plus">Legends Plus</option>
                                <option value="family_legacy">Family Legacy</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="nursery">Nursery</option>
                                <option value="cultural">Cultural</option>
                                <option value="educational">Educational</option>
                                <option value="lesson">Lesson</option>
                                <option value="story">Story</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="age_track" className="block text-sm font-bold text-gray-700 mb-2">Age Track</label>
                            <select
                                id="age_track"
                                value={formData.age_track}
                                onChange={(e) => setFormData(prev => ({ ...prev, age_track: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="all">All Ages</option>
                                <option value="mini">Mini (4-5)</option>
                                <option value="big">Big (6-8)</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => { setShowModal(false); setEditingItem(null); resetForm(); }}
                            className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.title || (!formData.audio_url && !formData.video_url && !editingItem)}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {editingItem ? 'Save Changes' : 'Upload'}
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
