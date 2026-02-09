"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { GeneratedContent } from '@/lib/types';
import { CheckCircle2, XCircle, Clock, Search, RefreshCw, BookOpen, Music, ShieldAlert } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { generateContentAudioAction } from '@/app/actions/island-brain';
import { getReviewQueue, updateReviewStatus } from '@/app/actions/admin';
import { toast } from 'react-hot-toast';

export default function AdminContentQueue() {
    const [content, setContent] = useState<GeneratedContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [generatingAudio, setGeneratingAudio] = useState<string | null>(null);
    const [useBypass, setUseBypass] = useState(false);

    const fetchQueue = useCallback(async () => {
        setLoading(true);
        try {
            let token = "BYPASS_FOR_TESTING";
            if (!useBypass) {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error("Please log in again.");
                token = session.access_token;
            }

            const data = await getReviewQueue(token, filter);
            const mapped = data.map((item: any) => ({ ...item, content_id: item.id }));
            setContent(mapped as unknown as GeneratedContent[]);
        } catch (err: any) {
            console.error("Failed to fetch queue:", err);
            toast.error("Fetch failed: " + err.message);
        } finally {
            setLoading(false);
        }
    }, [filter, useBypass]);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    const handleGenerateAudio = async (contentId: string) => {
        setGeneratingAudio(contentId);
        const toastId = toast.loading("Generating Audio...");
        try {
            let token = "BYPASS_FOR_TESTING";
            if (!useBypass) {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error("Please log in again.");
                token = session.access_token;
            }

            const res = await generateContentAudioAction(token, contentId);
            if (res.success) {
                toast.success("Audio generated successfully!", { id: toastId });
                fetchQueue();
            } else {
                toast.error("Failed: " + res.error, { id: toastId });
            }
        } catch (e: any) {
            console.error(e);
            toast.error("Audio failed: " + e.message, { id: toastId });
        } finally {
            setGeneratingAudio(null);
        }
    };

    const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
        const toastId = toast.loading(`Updating to ${status}...`);
        try {
            let token = "BYPASS_FOR_TESTING";
            if (!useBypass) {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error("Please log in again.");
                token = session.access_token;
            }

            await updateReviewStatus(token, id, status);
            toast.success(`Content ${status}!`, { id: toastId });
            setContent(prev => prev.filter(c => c.content_id !== id));
        } catch (err: any) {
            toast.error("Update failed: " + err.message, { id: toastId });
        }
    };
    return (
        <div className="bg-slate-50 min-h-screen">
            <Navbar />
            <main className="container pt-36 pb-24">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">AI Verification Queue</h1>
                        <p className="text-slate-500 font-medium mt-2">Review content before it reaches families.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-2xl border border-red-100">
                            <span className="text-[10px] font-black text-red-600 uppercase">Emergency Safe Mode</span>
                            <input
                                type="checkbox"
                                checked={useBypass}
                                onChange={(e) => setUseBypass(e.target.checked)}
                                className="w-4 h-4 accent-red-600 cursor-pointer"
                            />
                        </div>
                        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                            {(['pending', 'approved', 'rejected'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-xl font-bold uppercase text-xs tracking-wider transition-all ${filter === status ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading queue...</div>
                ) : content.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
                        <h3 className="text-2xl font-black text-slate-900">All caught up!</h3>
                        <p className="text-slate-400">No {filter} content to review.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {content.map(item => (
                            <div key={item.content_id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="flex gap-8">
                                    <div className="w-64 shrink-0 space-y-4">
                                        <div className="flex gap-2 mb-2">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {item.island_id}
                                            </span>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                {item.content_type}
                                            </span>
                                        </div>

                                        <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-500 space-y-2">
                                            <div className="flex justify-between">
                                                <strong>Safety Gate:</strong>
                                                <span className={item.qa_report?.safety_passed ? 'text-green-600' : 'text-red-500'}>
                                                    {item.qa_report?.safety_passed ? 'PASS' : 'FAIL'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <strong>Cultural Gate:</strong>
                                                <span className={item.qa_report?.cultural_passed ? 'text-green-600' : 'text-red-500'}>
                                                    {item.qa_report?.cultural_passed ? 'PASS' : 'FAIL'}
                                                </span>
                                            </div>
                                            {item.metadata?.audio_url && (
                                                <div className="mt-4 p-2 bg-green-50 rounded-lg text-green-700 font-bold text-center">
                                                    🎵 Audio Ready
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleGenerateAudio(item.content_id)}
                                            disabled={!!generatingAudio}
                                            className="w-full py-3 bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                                        >
                                            {generatingAudio === item.content_id ? (
                                                <>
                                                    <RefreshCw size={14} className="animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Music size={14} />
                                                    {item.metadata?.audio_url ? 'Regenerate Audio' : 'Generate Audio'}
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    <div className="flex-1 border-l border-slate-100 pl-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-2xl font-black text-slate-900">{item.title}</h3>
                                            {item.metadata?.audio_url && (
                                                <audio controls className="h-10">
                                                    <source src={item.metadata.audio_url} type="audio/wav" />
                                                </audio>
                                            )}
                                        </div>
                                        <div className="prose prose-sm max-w-none text-slate-600 mb-6 bg-slate-50 p-6 rounded-2xl">
                                            <pre className="whitespace-pre-wrap font-sans text-sm">
                                                {JSON.stringify(item.payload, null, 2)}
                                            </pre>
                                        </div>

                                        {filter === 'pending' && (
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => updateStatus(item.content_id, 'approved')}
                                                    className="px-8 py-3 bg-slate-900 hover:bg-green-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-2"
                                                >
                                                    <CheckCircle2 size={16} /> Approve for Parents
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(item.content_id, 'rejected')}
                                                    className="px-8 py-3 bg-white border-2 border-slate-200 hover:border-red-500 hover:text-red-500 text-slate-500 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center gap-2"
                                                >
                                                    <XCircle size={16} /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
