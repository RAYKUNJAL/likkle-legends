"use client";

import React, { useState, useEffect, useRef } from 'react';
import { uploadVideoFile, getStreamThumbnailUrl } from '../services/cloudflareStream';
import { addVideoToLibrary, getVideoLibrary, deleteVideoMetadata, setHeroVideo, VideoMetadata } from '../services/supabase/databaseService';
import { LazyImage } from './LazyImage';

const CATEGORIES = ['Hero Trailer', 'Tanty Stories', 'Personal Messages', 'Field Trips', 'Educational'];
const TIERS = [
    { id: 'free_explorer', label: 'Free' },
    { id: 'island_learner', label: 'Island Learner' },
    { id: 'heritage_hero', label: 'Heritage Hero' },
    { id: 'family_vip', label: 'Family VIP' }
];

export const VideoManager: React.FC = () => {
    const [videos, setVideos] = useState<VideoMetadata[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Upload State
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadStatus, setUploadStatus] = useState('');

    // Metadata Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<string>('Educational');
    const [tier, setTier] = useState<string>('free_explorer');
    const [isHero, setIsHero] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        setIsLoading(true);
        const lib = await getVideoLibrary();
        setVideos(lib);
        setIsLoading(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            // Auto-fill title if empty
            if (!title) {
                setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, "").replace(/_/g, " "));
            }
        }
    };

    const handleUpload = async () => {
        if (!file || !title) {
            alert("Please select a video file and enter a title.");
            return;
        }

        setUploadProgress(10);
        setUploadStatus("Uploading to Island Stream Cloud...");

        try {
            const response = await uploadVideoFile(file);
            setUploadProgress(50);

            if (response && response.result) {
                setUploadStatus("Processing Metadata...");

                const newVideo: VideoMetadata = {
                    id: response.result.uid, // Use Cloudflare UID as ID
                    cloudflareId: response.result.uid,
                    title,
                    description,
                    category,
                    tier,
                    thumbnailUrl: getStreamThumbnailUrl(response.result.uid),
                    isHero,
                    createdAt: new Date().toISOString()
                };

                const saved = await addVideoToLibrary(newVideo);
                if (saved) {
                    setUploadProgress(100);
                    setUploadStatus("Video Published!");
                    setVideos([newVideo, ...videos]);
                    if (isHero) await handleSetHero(newVideo.id);

                    // Reset Form
                    setFile(null);
                    setTitle('');
                    setDescription('');
                    setCategory('Educational');
                    setTier('free_explorer');
                    setIsHero(false);
                    if (fileInputRef.current) fileInputRef.current.value = '';

                    setTimeout(() => {
                        setUploadProgress(null);
                        setUploadStatus('');
                    }, 2000);
                } else {
                    throw new Error("Database save failed");
                }
            } else {
                throw new Error("No response from upload service");
            }
        } catch (e: any) {
            console.error(e);
            setUploadStatus("Upload Failed: " + e.message);
            setUploadProgress(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this video from the library?")) {
            await deleteVideoMetadata(id);
            setVideos(videos.filter(v => v.id !== id));
        }
    };

    const handleSetHero = async (id: string) => {
        await setHeroVideo(id);
        // Refresh local state
        setVideos(prev => prev.map(v => ({ ...v, isHero: v.id === id })));
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">

            {/* --- UPLOAD SECTION --- */}
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-blue-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50"></div>

                <h3 className="text-3xl font-heading font-black text-blue-950 mb-8 relative z-10">Upload New Video</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
                    <div className="space-y-6">
                        <div
                            className={`border-4 border-dashed rounded-[2rem] p-10 text-center transition-all cursor-pointer ${file ? 'border-green-400 bg-green-50' : 'border-blue-200 hover:bg-blue-50'}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".mp4,.mov,video/mp4,video/quicktime"
                                onChange={handleFileSelect}
                            />
                            <div className="text-6xl mb-4">{file ? '🎬' : '📤'}</div>
                            <p className="font-bold text-blue-900/60">{file ? file.name : "Click to select video (MP4, MOV)"}</p>
                        </div>

                        {uploadProgress !== null && (
                            <div className="space-y-2">
                                <div className="h-4 bg-blue-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                                <p className="text-center text-xs font-black uppercase text-blue-400">{uploadStatus}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-blue-300 ml-2">Title</label>
                            <input
                                type="text"
                                placeholder="e.g. The Story of Anansi"
                                className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none border-2 border-transparent focus:border-blue-200"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-blue-300 ml-2">Description</label>
                            <textarea
                                placeholder="What is this video about?"
                                className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none border-2 border-transparent focus:border-blue-200 h-32 resize-none"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-blue-300 ml-2">Category</label>
                                <select
                                    className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase text-blue-300 ml-2">Access Tier</label>
                                <select
                                    className="w-full p-4 bg-blue-50 rounded-2xl font-bold text-blue-950 outline-none"
                                    value={tier}
                                    onChange={e => setTier(e.target.value)}
                                >
                                    {TIERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 py-2 bg-blue-50/50 p-4 rounded-2xl">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={isHero} onChange={e => setIsHero(e.target.checked)} className="w-5 h-5 accent-orange-500 rounded-lg" />
                                <div>
                                    <span className="font-bold text-sm text-blue-950 block">Set as Hero Trailer</span>
                                    <span className="text-[10px] text-blue-400 font-bold uppercase">Featured on landing page</span>
                                </div>
                            </label>
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={uploadProgress !== null || !file}
                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase shadow-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
                        >
                            {uploadProgress !== null ? 'Uploading...' : 'Publish Video'}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- LIBRARY GRID --- */}
            <div className="space-y-6">
                <h3 className="text-3xl font-heading font-black text-blue-950 px-4">Video Library</h3>

                {isLoading ? (
                    <div className="text-center py-20 opacity-50 font-black uppercase">Loading Library...</div>
                ) : videos.length === 0 ? (
                    <div className="text-center py-20 bg-blue-50 rounded-[3rem] border-4 border-dashed border-blue-200">
                        <div className="text-6xl mb-4">📹</div>
                        <p className="font-bold text-blue-900/40">No videos yet. Upload one above!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {videos.map(video => (
                            <div key={video.id} className="bg-white p-6 rounded-[2.5rem] border-4 border-blue-50 shadow-lg hover:shadow-2xl transition-all group">
                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-4 border-2 border-blue-50">
                                    <LazyImage src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    {video.isHero && (
                                        <span className="absolute top-2 left-2 bg-yellow-400 text-blue-950 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-md z-10">Hero</span>
                                    )}
                                    <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-md text-[10px] font-black uppercase z-10">
                                        {TIERS.find(t => t.id === video.tier)?.label || 'Free'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <h4 className="font-heading font-black text-xl text-blue-950 truncate" title={video.title}>{video.title}</h4>
                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{video.category}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSetHero(video.id)}
                                        disabled={video.isHero}
                                        className={`flex-1 py-2 rounded-xl font-black text-[10px] uppercase border-2 transition-all ${video.isHero ? 'bg-yellow-50 text-yellow-600 border-yellow-200 opacity-50 cursor-default' : 'bg-white text-blue-600 border-blue-100 hover:bg-blue-50'}`}
                                    >
                                        {video.isHero ? 'Active Hero' : 'Make Hero'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(video.id)}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors border-2 border-transparent hover:border-red-200"
                                        title="Delete Video"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
