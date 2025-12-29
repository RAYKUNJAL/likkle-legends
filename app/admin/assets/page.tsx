"use client";

import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Music, Bot, Loader2, Trash2, Download } from 'lucide-react';
import AssetBuilder from '@/components/AssetBuilder';
import { supabase } from '@/lib/supabase';

interface StorageAsset {
    name: string;
    id: string;
    metadata: {
        mimetype: string;
        size: number;
    };
    created_at: string;
}

export default function AdminAssetsPage() {
    const [activeTab, setActiveTab] = useState<'upload' | 'generate' | 'library'>('library');

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-black text-deep mb-2">Asset Command Center</h1>
                    <p className="text-deep/60">Manage monthly drops and generate new content with AI.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'library' ? 'bg-deep text-white shadow-lg' : 'bg-white text-deep hover:bg-zinc-50'}`}
                    >
                        📚 Library
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'upload' ? 'bg-deep text-white shadow-lg' : 'bg-white text-deep hover:bg-zinc-50'}`}
                    >
                        <Upload size={18} className="inline mr-2" /> Upload
                    </button>
                    <button
                        onClick={() => setActiveTab('generate')}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'generate' ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20' : 'bg-white text-deep hover:bg-zinc-50'}`}
                    >
                        <Bot size={18} className="inline mr-2" /> AI Builder
                    </button>
                </div>
            </div>

            {activeTab === 'library' && <AssetLibrary />}
            {activeTab === 'upload' && <AssetUploader onUploadComplete={() => setActiveTab('library')} />}
            {activeTab === 'generate' && <AssetBuilder />}
        </div>
    );
}

function AssetLibrary() {
    const [assets, setAssets] = useState<StorageAsset[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const { data, error } = await supabase
                .storage
                .from('legends-assets')
                .list();

            if (error) throw error;
            if (data) setAssets(data as any);
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const downloadAsset = async (fileName: string) => {
        const { data } = supabase.storage.from('legends-assets').getPublicUrl(fileName);
        window.open(data.publicUrl, '_blank');
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) return <div className="p-12 text-center text-deep/40"><Loader2 className="animate-spin inline mr-2" /> Loading library...</div>;

    if (assets.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-zinc-100">
                <p className="text-deep/40 font-bold text-lg">No assets found in the vault.</p>
                <p className="text-sm text-deep/30">Upload content to get started.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-100">
            <h2 className="text-2xl font-bold mb-6">Current Assets ({assets.length})</h2>
            <div className="grid gap-4">
                {assets.map((asset, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-colors border border-zinc-100/50">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${asset.metadata?.mimetype?.includes('pdf') ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                                }`}>
                                {asset.metadata?.mimetype?.includes('pdf') ? <FileText size={20} /> : <Music size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-deep">{asset.name}</h4>
                                <p className="text-xs text-deep/40 uppercase tracking-wider">
                                    {asset.metadata ? formatSize(asset.metadata.size) : 'Unknown'} •
                                    {new Date(asset.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => downloadAsset(asset.name)}
                            className="btn btn-sm btn-ghost text-primary"
                        >
                            <Download size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AssetUploader({ onUploadComplete }: { onUploadComplete: () => void }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const { error } = await supabase.storage
                .from('legends-assets')
                .upload(fileName, file);

            if (error) throw error;

            // Success
            alert('Asset uploaded successfully!');
            onUploadComplete();
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Check console for details.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-zinc-100 text-center border-dashed border-2 border-zinc-200">
            <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6 relative">
                {uploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
            </div>

            <h2 className="text-2xl font-bold mb-2">
                {uploading ? 'Uploading to Vault...' : 'Drop Monthly Assets Here'}
            </h2>
            <p className="text-deep/60 mb-8 max-w-md mx-auto">
                Upload coloring pages, PDF guides, or audio files to the 'legends-assets' bucket.
            </p>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleUpload}
                accept=".pdf,.mp3,.png,.jpg,.jpeg"
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn btn-primary px-8 py-4 rounded-xl font-bold disabled:opacity-50"
            >
                {uploading ? 'Processing...' : 'Select Files'}
            </button>
        </div>
    );
}
