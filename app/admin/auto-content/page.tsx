"use client";

import { useState, useEffect } from 'react';
import {
    AdminLayout, StatCard, DataTable, StatusBadge, Modal, Tabs,
    FileUpload, ActionButton, EmptyState,
    Sparkles, Wand2, RefreshCw, CheckCircle2, AlertCircle,
    Download, Music, Video, BookOpen, Send, Zap, Plus
} from '@/components/admin/AdminComponents';
import { runModuleManagerAgent, publishModuleToLive } from '@/app/actions/agents';
import { uploadFile, BUCKETS } from '@/lib/storage';

export default function AutonomousContentPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [objective, setObjective] = useState('');
    const [ageGroup, setAgeGroup] = useState<'mini' | 'big'>('mini');
    const [suggestedObjectives, setSuggestedObjectives] = useState<string[]>([
        "Explore Fruits of Jamaica",
        "The Rhythms of Trinidad",
        "Sea Turtles of Barbados",
        "Colors of the Caribbean Flag"
    ]);
    const [lastModule, setLastModule] = useState<any>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    const handleGenerate = async (customObjective?: string) => {
        const obj = customObjective || objective;
        if (!obj) return;

        setIsGenerating(true);
        setLastModule(null);

        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            const result = await runModuleManagerAgent(session.access_token, obj, ageGroup);
            setLastModule(result);
            alert("Digital Module Built! Ready for review.");
        } catch (error) {
            console.error("Agent failed:", error);
            alert("Agent encountered an error. Check console.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePublish = async () => {
        if (!lastModule || isPublishing) return;
        setIsPublishing(true);

        try {
            const { supabase } = await import('@/lib/storage');
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("No session");

            const res = await publishModuleToLive(session.access_token, lastModule);
            if (res.success) {
                alert("The module is now LIVE in the Kid Portal!");
                setLastModule(null);
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            console.error("Publishing failed:", error);
            alert("Failed to publish: " + (error as any).message);
        } finally {
            setIsPublishing(false);
        }
    };

    const handleManualFileUpload = async (file: File) => {
        setUploadStatus('uploading');
        try {
            // Determine bucket based on file type
            let bucket = BUCKETS.PRINTABLES;
            if (file.type.startsWith('audio/')) bucket = BUCKETS.SONGS;
            else if (file.type.startsWith('video/')) bucket = BUCKETS.VIDEOS;
            else if (file.type === 'application/pdf') bucket = BUCKETS.PRINTABLES;

            const result = await uploadFile(bucket, file);
            if (result) {
                setUploadStatus('success');
                // Could open a form to finalize metadata here
            } else {
                setUploadStatus('error');
            }
        } catch (error) {
            setUploadStatus('error');
        }
    };

    return (
        <AdminLayout activeSection="auto-content">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Zap className="text-primary fill-primary" />
                            Fresh Content Agent
                        </h1>
                        <p className="text-gray-500">Autonomous content generation & deployment engine</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="px-6 py-3 bg-white border-2 border-slate-100 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Quick Upload
                        </button>
                    </div>
                </div>
            </header>

            <div className="p-8 grid lg:grid-cols-12 gap-8">
                {/* Deployment Control */}
                <div className="lg:col-span-12">
                    <div className="bg-deep rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl">🤖</div>
                                <div>
                                    <h2 className="text-2xl font-black">Agent Readiness: Optimal</h2>
                                    <p className="text-white/60">Ready to synthesize new island adventures.</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                                {suggestedObjectives.map((obj, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setObjective(obj); handleGenerate(obj); }}
                                        disabled={isGenerating}
                                        className="p-6 bg-white/5 border border-white/10 rounded-[2rem] text-left hover:bg-white/10 transition-all group disabled:opacity-50"
                                    >
                                        <p className="text-xs font-black text-white/40 uppercase tracking-widest mb-2">Suggestion {i + 1}</p>
                                        <p className="font-bold text-white group-hover:text-primary transition-colors">{obj}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col lg:flex-row gap-6 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-3">Custom Mission Brief</label>
                                    <input
                                        type="text"
                                        value={objective}
                                        onChange={(e) => setObjective(e.target.value)}
                                        placeholder="e.g. Learn how Caribbean salt fish is made..."
                                        className="w-full bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="flex bg-white/10 p-1 rounded-2xl border-2 border-white/20">
                                    <button
                                        onClick={() => setAgeGroup('mini')}
                                        className={`px-6 py-3 rounded-xl font-black text-xs transition-all ${ageGroup === 'mini' ? 'bg-primary text-white' : 'text-white/40'}`}
                                    >MINI (3-5)</button>
                                    <button
                                        onClick={() => setAgeGroup('big')}
                                        className={`px-6 py-3 rounded-xl font-black text-xs transition-all ${ageGroup === 'big' ? 'bg-primary text-white' : 'text-white/40'}`}
                                    >BIG (6-8)</button>
                                </div>
                                <button
                                    onClick={() => handleGenerate()}
                                    disabled={isGenerating || !objective}
                                    className="px-10 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3 whitespace-nowrap"
                                >
                                    {isGenerating ? <RefreshCw className="animate-spin" /> : <Wand2 />}
                                    Deploy Agent
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status and Queue */}
                <div className="lg:col-span-8">
                    {lastModule ? (
                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
                            <div className="bg-slate-50 p-8 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-800">{lastModule.title}</h3>
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{lastModule.island} Module</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-black">Draft Ready</span>
                                    <button
                                        onClick={handlePublish}
                                        disabled={isPublishing}
                                        className="px-8 py-3 bg-green-500 text-white rounded-xl font-black text-sm shadow-lg shadow-green-200 hover:bg-green-600 transition-all flex items-center gap-2"
                                    >
                                        {isPublishing ? <RefreshCw className="animate-spin" /> : <Send size={18} />}
                                        Publish to Live
                                    </button>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Assets List */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><BookOpen size={20} /></div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800">Storybook</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Interactive Story</p>
                                            </div>
                                            <CheckCircle2 size={20} className="text-green-500" />
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><Music size={20} /></div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800">Island Song</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Audio Content</p>
                                            </div>
                                            <CheckCircle2 size={20} className="text-green-500" />
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><Download size={20} /></div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800">Resource Pack</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Digital Printable</p>
                                            </div>
                                            <CheckCircle2 size={20} className="text-green-500" />
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><Video size={20} /></div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-800">Video Script</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Production Ready</p>
                                            </div>
                                            <CheckCircle2 size={20} className="text-green-500" />
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                                        <h4 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest">Module Breakdown</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Educational Goal</p>
                                                <p className="text-sm font-bold text-slate-600 leading-relaxed">{lastModule.metadata.educationalGoal}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Themes Detected</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {lastModule.theme.split(',').map((t: string) => (
                                                        <span key={t} className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-xs font-bold text-slate-500">{t.trim()}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                            <Sparkles size={64} className="mb-6 opacity-20" />
                            <h3 className="text-xl font-black">Waiting for Deployment</h3>
                            <p className="text-sm font-medium mt-2">Brief the Agent above to start creating content packages.</p>
                        </div>
                    )}
                </div>

                {/* Right Rail: Health & Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-800 mb-6">Library Health</h3>
                        <div className="space-y-6">
                            {[
                                { label: "Songs Freshness", level: 92, status: "Healthy" },
                                { label: "Printables Variety", level: 45, status: "Gaps Found" },
                                { label: "Weekly Drops", level: 100, status: "Active" },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                        <span className={`text-[10px] font-black uppercase ${stat.level < 50 ? 'text-amber-500' : 'text-green-500'}`}>{stat.status}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${stat.level < 50 ? 'bg-amber-400' : 'bg-green-400'}`}
                                            style={{ width: `${stat.level}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                        <h3 className="text-lg font-black text-slate-800 mb-4">Content Strategy</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                            The Freshness Agent balances content across 8 Caribbean nations and 3 learning tracks.
                        </p>
                        <button className="w-full py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-primary hover:text-primary transition-all">
                            Configure Agent Strategy
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Upload Modal */}
            <Modal
                isOpen={isUploadModalOpen}
                onClose={() => { setIsUploadModalOpen(false); setUploadStatus('idle'); }}
                title="Quick Asset Upload"
            >
                <div className="space-y-6">
                    <FileUpload
                        accept="audio/*,video/*,application/pdf,image/*"
                        onUpload={handleManualFileUpload}
                        label="Drop Content Here"
                        description="Audio, Video, or Printable PDF"
                    />

                    {uploadStatus === 'success' && (
                        <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 size={20} />
                            <p className="font-bold text-sm">File uploaded successfully! It's now in the Media Library.</p>
                        </div>
                    )}

                    {uploadStatus === 'error' && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                            <AlertCircle size={20} />
                            <p className="font-bold text-sm">Upload failed. Please check your connection.</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setIsUploadModalOpen(false)}
                            className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}

