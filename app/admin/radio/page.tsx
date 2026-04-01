"use client";

import React, { useState, useEffect } from 'react';
import {
    AdminLayout, DataTable, StatusBadge, ActionButton,
    SearchBar, Modal, FileUpload, Music, Plus, Edit, Trash2,
    DollarSign, Sparkles, CheckCircle2, X
} from '@/components/admin/AdminComponents';
import { getAdminContent, saveAdminContent, deleteAdminContent } from '@/app/actions/admin';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/storage';

interface Song {
    id: string;
    title: string;
    artist: string;
    audio_url: string;
    category: string;
    is_active: boolean;
    display_order: number;
    metadata: {
        is_premium?: boolean;
        price?: number;
        suno_id?: string;
    };
    created_at: string;
}

export default function AdminRadioPage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<Partial<Song> | null>(null);

    useEffect(() => {
        loadSongs();
    }, []);

    const loadSongs = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            const data = await getAdminContent(session.access_token, 'songs');
            setSongs(data as Song[]);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load radio tracks");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const payload = {
                ...editingSong,
                metadata: {
                    ...editingSong?.metadata,
                    is_premium: editingSong?.metadata?.is_premium || false,
                    price: 0.99
                }
            };

            await saveAdminContent(session.access_token, 'songs', payload);
            toast.success("Song saved successfully");
            setIsModalOpen(false);
            loadSongs();
        } catch (error) {
            toast.error("Save failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this track?")) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;
            await deleteAdminContent(session.access_token, 'songs', id);
            toast.success("Track deleted");
            loadSongs();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleFileUpload = async (file: File, onProgress: (p: number) => void) => {
        try {
            const { uploadFile } = await import('@/lib/storage');
            const result = await uploadFile('songs', file, `radio/${Date.now()}-${file.name}`, { onProgress });

            if (result) {
                setEditingSong(prev => ({
                    ...prev,
                    title: file.name.replace(/\.[^/.]+$/, ""),
                    audio_url: result.url,
                    artist: "Likkle Legends",
                    category: "tanty_spice",
                    is_active: true
                }));
            }
        } catch (error) {
            toast.error("Upload failed");
            throw error;
        }
    };

    const filteredSongs = songs.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.artist.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            key: 'title',
            label: 'Track Info',
            render: (song: Song) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                        <Music size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{song.title}</p>
                        <p className="text-xs text-gray-400 capitalize">{song.artist} • {song.category}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'metadata',
            label: 'Market Status',
            render: (song: Song) => (
                <div className="flex items-center gap-2">
                    {song.metadata?.is_premium ? (
                        <span className="px-2 py-1 bg-amber-100 text-amber-600 rounded-md text-[10px] font-black uppercase flex items-center gap-1">
                            <DollarSign size={10} /> Premium ($0.99)
                        </span>
                    ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-600 rounded-md text-[10px] font-black uppercase">
                            Free
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (song: Song) => (
                <StatusBadge
                    status={song.is_active ? 'Active' : 'Hidden'}
                    variant={song.is_active ? 'success' : 'default'}
                />
            )
        }
    ];

    return (
        <AdminLayout activeSection="radio">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Likkle Legends Radio Control Room</h1>
                        <p className="text-gray-500">Manage DJ segments, track rotation, and digital music sales</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingSong({ is_active: true, category: 'tanty_spice', artist: 'Likkle Legends' });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                        <Plus size={20} /> Add New Track
                    </button>
                </div>
            </header>

            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Live Tracks</p>
                        <h3 className="text-3xl font-black text-deep">{songs.filter(s => s.is_active).length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Premium Songs</p>
                        <h3 className="text-3xl font-black text-amber-500">{songs.filter(s => s.metadata?.is_premium).length}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Market Value</p>
                        <h3 className="text-3xl font-black text-green-600">${(songs.filter(s => s.metadata?.is_premium).length * 0.99).toFixed(2)}</h3>
                    </div>
                </div>

                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search titles, artists..."
                />

                <DataTable
                    columns={columns}
                    data={filteredSongs}
                    isLoading={isLoading}
                    emptyMessage="No tracks in the library. Let's upload some Caribbean vibes!"
                    actions={(song) => (
                        <div className="flex items-center gap-2">
                            <ActionButton
                                icon={Edit}
                                onClick={() => {
                                    setEditingSong(song);
                                    setIsModalOpen(true);
                                }}
                            />
                            <ActionButton
                                icon={Trash2}
                                onClick={() => handleDelete(song.id)}
                                variant="danger"
                            />
                        </div>
                    )}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSong?.id ? "Edit Track" : "Add New Track"}
                size="lg"
            >
                <form onSubmit={handleSave} className="space-y-6">
                    {!editingSong?.audio_url && (
                        <FileUpload
                            label="Upload MP3 Track"
                            accept="audio/*"
                            onUpload={handleFileUpload}
                            description="Audio will be optimized for radio streaming."
                        />
                    )}

                    {editingSong?.audio_url && (
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={24} />
                                </div>
                                <p className="text-sm font-bold text-gray-700">Audio uploaded successfully</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingSong(prev => ({ ...prev, audio_url: undefined }))}
                                className="text-xs font-bold text-red-500 hover:underline"
                            >
                                Replace
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="radio-track-title" className="text-[10px] font-black uppercase text-gray-400 ml-2">Track Title</label>
                            <input
                                id="radio-track-title"
                                required
                                value={editingSong?.title || ''}
                                onChange={e => setEditingSong({ ...editingSong, title: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary transition-all"
                                aria-required="true"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="radio-artist" className="text-[10px] font-black uppercase text-gray-400 ml-2">Artist / Character</label>
                            <input
                                id="radio-artist"
                                required
                                value={editingSong?.artist || ''}
                                onChange={e => setEditingSong({ ...editingSong, artist: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary transition-all"
                                aria-required="true"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label htmlFor="radio-dj-segment" className="text-[10px] font-black uppercase text-gray-400 ml-2">DJ Segment</label>
                            <select
                                id="radio-dj-segment"
                                value={editingSong?.category || 'tanty_spice'}
                                onChange={e => setEditingSong({ ...editingSong, category: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-primary transition-all"
                                aria-label="Select DJ segment for track"
                            >
                                <option value="tanty_spice">Tanty Spice Show</option>
                                <option value="roti">R.O.T.I Learning Lab</option>
                                <option value="dilly_doubles">Dilly Vibes</option>
                                <option value="steelpan_sam">Steelpan Sam Stage</option>
                                <option value="story">Legacy: Story</option>
                                <option value="learning">Legacy: Learning</option>
                                <option value="culture">Legacy: Culture</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Access Plan</label>
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setEditingSong({
                                        ...editingSong,
                                        metadata: { ...editingSong?.metadata, is_premium: false }
                                    })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${!editingSong?.metadata?.is_premium ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                                >
                                    Free
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingSong({
                                        ...editingSong,
                                        metadata: { ...editingSong?.metadata, is_premium: true }
                                    })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${editingSong?.metadata?.is_premium ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400'}`}
                                >
                                    Premium
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        <input
                            type="checkbox"
                            checked={editingSong?.is_active}
                            onChange={e => setEditingSong({ ...editingSong, is_active: e.target.checked })}
                            id="is_active"
                            className="w-4 h-4 rounded text-primary focus:ring-primary"
                        />
                        <label htmlFor="is_active" className="text-sm font-bold text-gray-700">Display on Radio Station</label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                            {editingSong?.id ? "Update Track" : "Publish to Library"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
