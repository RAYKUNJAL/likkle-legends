
import React, { useState, useEffect, useRef } from 'react';
import { Track } from '../../lib/types';
import { RADIO_TRACKS, RADIO_CHANNELS } from '../../lib/constants';
import { getGlobalPlaylist, saveGlobalPlaylist, uploadFile, PATHS } from '../../services/storageService';

export const AudioTrackManager: React.FC = () => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // New Track Form
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [channel, setChannel] = useState('story');
    const [file, setFile] = useState<File | null>(null);

    // Preview Logic
    const [previewTrack, setPreviewTrack] = useState<Track | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewAudioRef = useRef<HTMLAudioElement>(null);
    const previewVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        loadPlaylist();
    }, []);

    useEffect(() => {
        // Auto-play preview when a track is selected
        if (previewTrack) {
            const isVideo = previewTrack.url.includes('.mp4') || previewTrack.url.includes('video');
            if (isVideo && previewVideoRef.current) {
                previewVideoRef.current.src = previewTrack.url;
                previewVideoRef.current.play().catch(e => console.warn("Preview autoplay failed", e));
            } else if (previewAudioRef.current) {
                previewAudioRef.current.src = previewTrack.url;
                previewAudioRef.current.play().catch(e => console.warn("Preview autoplay failed", e));
            }
        }
    }, [previewTrack]);

    const loadPlaylist = async () => {
        setIsLoading(true);
        const stored = await getGlobalPlaylist();

        if (stored !== null) {
            setTracks(stored);
        } else {
            // First time load: Seed with defaults so admin sees what users see AND saves it to DB so edits stick
            setTracks(RADIO_TRACKS);
            await saveGlobalPlaylist(RADIO_TRACKS);
        }
        setIsLoading(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            if (!title) {
                // Remove extension for title
                const name = selectedFile.name.replace(/\.[^/.]+$/, "");
                setTitle(name);
            }
        }
    };

    const handleUpload = async () => {
        if (!file || !title || !artist) return;

        setIsUploading(true);
        setUploadProgress(10);

        try {
            // In the original, uploadFile took a 4th param callback for progress.
            // My storageService.ts uploadFile doesn't have that yet, let's check.
            // Wait, let's keep it consistent.
            const url = await uploadFile(file, PATHS.RADIO);

            const newTrack: Track = {
                id: `custom_${Date.now()}`,
                title,
                artist,
                channel: channel as any,
                url,
                isCustom: true
            };

            const updated = [newTrack, ...tracks];
            setTracks(updated);
            await saveGlobalPlaylist(updated);

            // Reset form
            setTitle('');
            setArtist('');
            setFile(null);
            setUploadProgress(0);
            if (fileInputRef.current) fileInputRef.current.value = '';

        } catch (e) {
            console.error(e);
            alert("Upload failed. Check console for details.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this track from the radio?")) return;
        const updated = tracks.filter(t => t.id !== id);
        setTracks(updated);
        await saveGlobalPlaylist(updated);
        if (previewTrack?.id === id) setPreviewTrack(null);
    };

    const handleDeleteAll = async () => {
        if (!confirm("Are you sure? This will remove ALL songs from the station.")) return;
        setIsLoading(true); // Show visual feedback
        try {
            setTracks([]);
            await saveGlobalPlaylist([]); // Save empty array
            setPreviewTrack(null);
        } catch (e) {
            alert("Failed to delete all tracks. Please try again.");
            loadPlaylist(); // Reload on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetDefaults = async () => {
        if (!confirm("Reset playlist to original defaults? All custom tracks will be removed.")) return;
        setIsLoading(true);
        try {
            setTracks(RADIO_TRACKS);
            await saveGlobalPlaylist(RADIO_TRACKS);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-blue-50">
                <h3 className="text-3xl font-heading font-black text-blue-950 mb-6">Upload New Track</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-blue-300 ml-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder="Song Title"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-blue-300 ml-2">Artist</label>
                            <input
                                type="text"
                                value={artist}
                                onChange={e => setArtist(e.target.value)}
                                className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none focus:ring-2 focus:ring-blue-200"
                                placeholder="Artist Name"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-blue-300 ml-2">Channel</label>
                            <select
                                value={channel}
                                onChange={e => setChannel(e.target.value)}
                                className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none focus:ring-2 focus:ring-blue-200"
                                title="Select Radio Channel"
                            >
                                {RADIO_CHANNELS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex-1 p-4 rounded-2xl border-2 border-dashed font-bold transition-all ${file ? 'border-green-400 bg-green-50 text-green-700' : 'border-blue-200 text-blue-400 hover:bg-blue-50'}`}
                            >
                                {file ? file.name : 'Select WAV/MP3/MP4'}
                            </button>
                            {/* Explicitly allowing .wav */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept="audio/*,video/*,.wav,.mp3,.mp4,.ogg"
                                onChange={handleFileSelect}
                                title="File Upload"
                                aria-label="Audio or Video File"
                            />

                            <button
                                onClick={handleUpload}
                                disabled={isUploading || !file || !title}
                                className="w-32 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase shadow-lg disabled:opacity-50"
                            >
                                {isUploading ? `Uploading...` : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border-4 border-blue-50 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-heading font-black text-blue-950">Current Playlist ({tracks.length})</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={handleDeleteAll}
                            className="text-xs font-black text-red-500 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 uppercase tracking-widest disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Clearing...' : 'Delete All'}
                        </button>
                        <button
                            onClick={handleResetDefaults}
                            className="text-xs font-black text-blue-400 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 uppercase tracking-widest disabled:opacity-50"
                            disabled={isLoading}
                        >
                            Reset Defaults
                        </button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border-2 border-blue-50">
                    <table className="w-full text-left">
                        <thead className="bg-blue-50 text-[10px] font-black uppercase text-blue-400">
                            <tr>
                                <th className="p-4">Title</th>
                                <th className="p-4">Artist</th>
                                <th className="p-4">Channel</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                            {tracks.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center font-bold text-gray-400 uppercase tracking-widest">
                                        No tracks available. Station is offline.
                                    </td>
                                </tr>
                            ) : tracks.map(t => (
                                <tr key={t.id} className={`hover:bg-blue-50/50 transition-colors ${previewTrack?.id === t.id ? 'bg-orange-50' : ''}`}>
                                    <td className="p-4 font-bold text-blue-950 flex items-center gap-2">
                                        {previewTrack?.id === t.id && <span className="text-orange-500 animate-pulse">🔊</span>}
                                        {t.title}
                                    </td>
                                    <td className="p-4 text-sm text-blue-900/60">{t.artist}</td>
                                    <td className="p-4">
                                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] font-black uppercase">
                                            {RADIO_CHANNELS.find(c => c.id === t.channel)?.label || t.channel}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs font-bold text-gray-400">
                                        {t.url.includes('.mp4') || t.url.includes('video') ? 'Video' : 'Audio'}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => setPreviewTrack(previewTrack?.id === t.id ? null : t)}
                                            className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase transition-all ${previewTrack?.id === t.id ? 'bg-orange-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                        >
                                            {previewTrack?.id === t.id ? 'Stop' : '▶️ Test'}
                                        </button>
                                        <button onClick={() => handleDelete(t.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-100">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Persistent Preview Player */}
            {previewTrack && (
                <div className="fixed bottom-0 left-0 right-0 bg-blue-950 p-4 shadow-2xl z-[100] flex items-center justify-between border-t-4 border-orange-500 animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-2xl animate-bounce">
                            {previewTrack.url.includes('.mp4') ? '🎬' : '🎵'}
                        </div>
                        <div className="text-white">
                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Now Testing</p>
                            <p className="font-heading font-black text-lg">{previewTrack.title}</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-lg mx-8">
                        {previewTrack.url.includes('.mp4') ? (
                            <video
                                ref={previewVideoRef}
                                controls
                                className="h-16 w-auto rounded-lg border-2 border-white/20"
                            />
                        ) : (
                            <audio
                                ref={previewAudioRef}
                                controls
                                className="w-full"
                                onEnded={() => setPreviewTrack(null)}
                            />
                        )}
                    </div>

                    <button onClick={() => setPreviewTrack(null)} className="text-white/50 hover:text-white font-black px-4">Close ✕</button>
                </div>
            )}
        </div>
    );
};
