"use client";

import { useState } from 'react';
import { Upload, FileText, Image as ImageIcon, Music, Bot, Sparkles, Loader2 } from 'lucide-react';
import AssetBuilder from '@/components/AssetBuilder';

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
            {activeTab === 'upload' && <AssetUploader />}
            {activeTab === 'generate' && <AssetBuilder />}
        </div>
    );
}

function AssetLibrary() {
    const assets = [
        { title: "January Coloring Pack", type: "pdf", size: "2.4 MB", date: "2 days ago" },
        { title: "Dilly's Song.mp3", type: "audio", size: "4.1 MB", date: "5 days ago" },
        { title: "Parent Guide - Emotions", type: "pdf", size: "1.2 MB", date: "1 week ago" },
    ];

    return (
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-100">
            <h2 className="text-2xl font-bold mb-6">Current Assets</h2>
            <div className="grid gap-4">
                {assets.map((asset, i) => (
                    <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-colors border border-zinc-100/50">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${asset.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                                }`}>
                                {asset.type === 'pdf' ? <FileText size={20} /> : <Music size={20} />}
                            </div>
                            <div>
                                <h4 className="font-bold text-deep">{asset.title}</h4>
                                <p className="text-xs text-deep/40 uppercase tracking-wider">{asset.size} • {asset.date}</p>
                            </div>
                        </div>
                        <button className="text-sm font-bold text-primary hover:underline">Download</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AssetUploader() {
    return (
        <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-zinc-100 text-center border-dashed border-2 border-zinc-200">
            <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Drop Monthly Assets Here</h2>
            <p className="text-deep/60 mb-8 max-w-md mx-auto">Upload coloring pages, PDF guides, or audio files to the 'legends-assets' bucket.</p>
            <button className="btn btn-primary px-8 py-4 rounded-xl font-bold">Select Files</button>
        </div>
    );
}
