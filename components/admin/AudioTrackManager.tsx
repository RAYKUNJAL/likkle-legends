"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Loader2, Music, Upload, Trash2, Play, Pause, Image as ImageIcon } from 'lucide-react';

interface Song {
    id: string;
    title: string;
    artist: string;
    audio_url: string;
    cover_image_url?: string;
    category?: string;
    island_origin?: string;
    duration_seconds?: number;
    is_active: boolean;
}

export const AudioTrackManager: React.FC = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form State
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('Likkle Legends');
    const [category, setCategory] = useState('story');
    const [island, setIsland] = useState('Jamaica');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

    // Preview State
    const [previewSong, setPreviewSong] = useState<Song | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const audioInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadSongs();
    }, []);

    // Auto-play preview when a song is selected
    useEffect(() => {
        if (previewSong && audioRef.current) {
            audioRef.current.play().catch(e => console.warn("Preview autoplay failed", e));
        } else if (!previewSong && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [previewSong]);

    const loadSongs = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setSongs(data);
        }
        setIsLoading(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'cover') => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            if (type === 'audio') {
                setAudioFile(file);
                if (!title) {
                    // Auto-fill title from filename
                    setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "));
                }
            } else {
                setCoverFile(file);
            }
        }
    };

    const handleUpload = async () => {
        if (!audioFile || !title) return;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const { uploadFile } = await import('@/lib/storage');

            // 1. Upload Cover Art (if selected)
            let coverUrl = '';
            if (coverFile) {
                const coverResult = await uploadFile('songs', coverFile, undefined, {
                    upsert: true
                });
                if (coverResult) {
                    coverUrl = coverResult.url;
                }
            }

            // 2. Upload Audio & Create Record using the API via uploadFile
            // This will use the XHR proxy because we are in the browser
            const result = await uploadFile('songs', audioFile, undefined, {
                onProgress: (p) => setUploadProgress(p),
                upsert: true
            });

            if (result) {
                // Wait, uploadFile returns the public URL and path. 
                // We still need to create the DB record if the API didn't do it.
                // Our uploadFile utility doesn't support 'saveToDb' parameter directly, 
                // but we can call the API manually if we want the 'saveToDb' feature, 
                // OR we can just use the supabase client to insert the record here.

                // Let's use the supabase client for better control since we already have it.
                const { error: dbError } = await supabase.from('songs').insert({
                    title,
                    artist,
                    category,
                    island_origin: island,
                    audio_url: result.url,
                    cover_image_url: coverUrl,
                    tier_required: 'free',
                    is_active: true
                });

                if (dbError) throw dbError;

                // Refresh list
                await loadSongs();

                // Reset Form
                setTitle('');
                setArtist('Likkle Legends');
                setAudioFile(null);
                setCoverFile(null);
                setUploadProgress(0);
                if (audioInputRef.current) audioInputRef.current.value = '';
                if (coverInputRef.current) coverInputRef.current.value = '';

                alert('Song uploaded successfully!');
            } else {
                alert('Upload failed: No result returned');
            }

        } catch (e: any) {
            console.error(e);
            alert(`Upload failed: ${e.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (song: Song) => {
        if (!confirm(`Delete "${song.title}"?`)) return;

        // Using Supabase client to delete record
        const { error } = await supabase.from('songs').delete().eq('id', song.id);

        if (error) {
            alert('Failed to delete song');
        } else {
            setSongs(songs.filter(s => s.id !== song.id));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Upload Section */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-blue-50">
                <h3 className="text-3xl font-heading font-black text-blue-950 mb-6 flex items-center gap-3">
                    <Music className="text-pink-500" />
                    Upload Suno Song
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-blue-300 ml-2">Song Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder="e.g. The Mango Song"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-blue-300 ml-2">Artist / Character</label>
                            <input
                                type="text"
                                value={artist}
                                onChange={e => setArtist(e.target.value)}
                                className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-blue-300 ml-2">Category</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none"
                                >
                                    <option value="story">Story Song</option>
                                    <option value="learning">Learning</option>
                                    <option value="cultural">Cultural</option>
                                    <option value="lullaby">Lullaby</option>
                                    <option value="dance">Dance / Soca</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-blue-300 ml-2">Island</label>
                                <select
                                    value={island}
                                    onChange={e => setIsland(e.target.value)}
                                    className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none"
                                >
                                    <option value="Jamaica">Jamaica</option>
                                    <option value="Trinidad">Trinidad</option>
                                    <option value="Barbados">Barbados</option>
                                    <option value="Grenada">Grenada</option>
                                    <option value="Saint Lucia">Saint Lucia</option>
                                    <option value="General">General Caribbean</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div
                            onClick={() => audioInputRef.current?.click()}
                            className="p-6 bg-blue-50/50 rounded-[2rem] border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors cursor-pointer group"
                        >
                            <span className="text-xs font-black uppercase text-blue-400 mb-3 block">1. Select MP3 File</span>
                            <input
                                ref={audioInputRef}
                                type="file"
                                accept="audio/*"
                                onChange={(e) => handleFileSelect(e, 'audio')}
                                className="hidden"
                            />
                            <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${audioFile ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-white text-blue-400 group-hover:shadow-sm'}`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${audioFile ? 'bg-green-200' : 'bg-blue-50'}`}>
                                    <Music size={24} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold truncate text-sm">{audioFile ? audioFile.name : 'Click to choose audio file...'}</p>
                                    {audioFile && <p className="text-xs opacity-70">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>}
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => coverInputRef.current?.click()}
                            className="p-6 bg-blue-50/50 rounded-[2rem] border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors cursor-pointer group"
                        >
                            <span className="text-xs font-black uppercase text-blue-400 mb-3 block">2. Cover Art (Optional)</span>
                            <input
                                ref={coverInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileSelect(e, 'cover')}
                                className="hidden"
                            />
                            <div className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${coverFile ? 'bg-purple-100 text-purple-700 shadow-sm' : 'bg-white text-blue-400 group-hover:shadow-sm'}`}>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden ${coverFile ? '' : 'bg-blue-50'}`}>
                                    {coverFile ? (
                                        <img src={URL.createObjectURL(coverFile)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon size={24} />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold truncate text-sm">{coverFile ? coverFile.name : 'Click to choose image...'}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={isUploading || !audioFile || !title}
                            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg uppercase shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 relative overflow-hidden"
                        >
                            {isUploading && (
                                <div
                                    className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            )}
                            {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                            <span>{isUploading ? `Uploading ${uploadProgress}%...` : 'Save to Library'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Library List */}
            <div className="bg-white p-8 rounded-[3rem] border-4 border-blue-50 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-heading font-black text-blue-950">Music Library ({songs.length})</h3>
                </div>

                <div className="overflow-hidden rounded-2xl border-2 border-blue-50">
                    <table className="w-full text-left">
                        <thead className="bg-blue-50 text-[10px] font-black uppercase text-blue-400">
                            <tr>
                                <th className="p-4">Song Details</th>
                                <th className="p-4 hidden md:table-cell">Category</th>
                                <th className="p-4 hidden md:table-cell">Island</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {songs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center font-bold text-gray-400 uppercase tracking-widest">
                                        No songs in library. Upload one above!
                                    </td>
                                </tr>
                            ) : songs.map(song => (
                                <tr key={song.id} className={`hover:bg-blue-50/50 transition-colors ${previewSong?.id === song.id ? 'bg-orange-50' : ''}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100">
                                                <img
                                                    src={song.cover_image_url || '/images/music-placeholder.svg'}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${previewSong?.id === song.id ? 'text-orange-600' : 'text-blue-950'}`}>{song.title}</p>
                                                <p className="text-xs text-blue-400 font-medium">{song.artist}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide">
                                            {song.category || 'Music'}
                                        </span>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <span className="text-xs font-bold text-gray-400">{song.island_origin}</span>
                                    </td>
                                    <td className="p-4 flex gap-2 justify-end">
                                        <button
                                            onClick={() => setPreviewSong(previewSong?.id === song.id ? null : song)}
                                            className={`h-9 px-4 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-wider ${previewSong?.id === song.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                        >
                                            {previewSong?.id === song.id ? <><Pause size={12} /> Stop</> : <><Play size={12} /> Play</>}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(song)}
                                            className="w-9 h-9 flex items-center justify-center bg-red-50 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-100 transition-colors"
                                            title="Delete Song"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hidden Audio Player for Preview */}
            <audio
                ref={audioRef}
                src={previewSong?.audio_url}
                onEnded={() => setPreviewSong(null)}
                className="hidden"
            />

            {/* Floating Player Status */}
            {previewSong && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-950/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-4 animate-in slide-in-from-bottom duration-300 border mb-2 border-white/10">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                    <span className="font-bold text-sm">Playing: {previewSong.title}</span>
                    <button
                        onClick={() => setPreviewSong(null)}
                        className="ml-2 p-1 hover:text-orange-400 transition-colors"
                    >
                        <Pause size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};
