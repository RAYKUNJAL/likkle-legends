"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { GeneratedContent } from '@/lib/types';
import { CheckCircle2, XCircle, Trash2, RotateCcw, Shield, Globe } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminComponents';
import { getReviewQueue, updateReviewStatus, deleteGeneratedContent } from '@/app/actions/admin';
import { toast } from 'react-hot-toast';

// ─── Type-aware content preview ───────────────────────────────────────────────
function ContentPreview({ item }: { item: GeneratedContent }) {
    const p = item.payload;
    if (!p) return <p className="text-slate-400 italic text-sm">No preview available.</p>;

    const type = item.content_type;

    if (type === 'story_short' || type === 'story_bedtime') {
        const firstPage = p.pages?.[0]?.text || p.body || p.content || '';
        return (
            <div className="space-y-3">
                {p.moral && (
                    <p className="text-xs font-bold text-violet-600 uppercase tracking-widest">
                        Moral: {p.moral}
                    </p>
                )}
                <p className="text-slate-700 leading-relaxed text-sm line-clamp-5">
                    {firstPage || JSON.stringify(p).substring(0, 400)}
                </p>
                {p.pages?.length > 1 && (
                    <p className="text-xs text-slate-400">{p.pages.length} pages total</p>
                )}
            </div>
        );
    }

    if (type === 'song_video_script' || type === 'song_lyrics') {
        const scenes = p.scenes || p.segments || [];
        return (
            <div className="space-y-2">
                {p.hook && <p className="text-sm font-bold text-slate-700">Hook: {p.hook}</p>}
                {scenes.length > 0 ? (
                    <ol className="space-y-1 list-decimal list-inside">
                        {scenes.slice(0, 4).map((s: any, i: number) => (
                            <li key={i} className="text-sm text-slate-600">
                                {s.hook || s.description || s.action || JSON.stringify(s).substring(0, 80)}
                            </li>
                        ))}
                        {scenes.length > 4 && <li className="text-xs text-slate-400">+{scenes.length - 4} more scenes</li>}
                    </ol>
                ) : (
                    <p className="text-slate-700 text-sm line-clamp-5">{p.script || p.content || JSON.stringify(p).substring(0, 400)}</p>
                )}
            </div>
        );
    }

    if (type === 'printable_cards_text') {
        const activities = p.activities || p.cards || [];
        return (
            <div className="space-y-2">
                {p.description && <p className="text-sm text-slate-600">{p.description}</p>}
                {activities.length > 0 ? (
                    <ul className="space-y-1">
                        {activities.slice(0, 3).map((a: any, i: number) => (
                            <li key={i} className="text-sm text-slate-600 flex gap-2">
                                <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
                                <span>{typeof a === 'string' ? a : a.title || a.activity || JSON.stringify(a).substring(0, 80)}</span>
                            </li>
                        ))}
                        {activities.length > 3 && <li className="text-xs text-slate-400">+{activities.length - 3} more activities</li>}
                    </ul>
                ) : (
                    <p className="text-slate-700 text-sm line-clamp-5">{p.content || JSON.stringify(p).substring(0, 400)}</p>
                )}
            </div>
        );
    }

    // lesson, quiz, generic fallback
    return (
        <p className="text-slate-700 text-sm line-clamp-5">
            {p.content || p.text || p.body || p.question || JSON.stringify(p).substring(0, 400)}
        </p>
    );
}

// ─── Content type label colours ───────────────────────────────────────────────
const TYPE_COLOURS: Record<string, string> = {
    story_short: 'bg-violet-100 text-violet-700',
    story_bedtime: 'bg-indigo-100 text-indigo-700',
    song_video_script: 'bg-pink-100 text-pink-700',
    song_lyrics: 'bg-pink-100 text-pink-700',
    printable_cards_text: 'bg-amber-100 text-amber-700',
    lesson_micro: 'bg-emerald-100 text-emerald-700',
    quiz_micro: 'bg-blue-100 text-blue-700',
    monthly_drop_bundle: 'bg-orange-100 text-orange-700',
};

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function AdminContentQueue() {
    const [content, setContent] = useState<GeneratedContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

    const getToken = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Please log in again.");
        return session.access_token;
    }, []);

    const fetchQueue = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getToken();
            const data = await getReviewQueue(token, filter);
            const mapped = data.map((item: any) => ({ ...item, content_id: item.id }));
            setContent(mapped as unknown as GeneratedContent[]);
        } catch (err: any) {
            console.error("Failed to fetch queue:", err);
            toast.error("Fetch failed: " + err.message);
        } finally {
            setLoading(false);
        }
    }, [filter, getToken]);

    useEffect(() => {
        fetchQueue();
    }, [fetchQueue]);

    const updateStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
        const toastId = toast.loading(`Updating...`);
        try {
            const token = await getToken();
            await updateReviewStatus(token, id, status);
            toast.success(`Marked as ${status}`, { id: toastId });
            setContent(prev => prev.filter(c => c.content_id !== id));
        } catch (err: any) {
            toast.error("Update failed: " + err.message, { id: toastId });
        }
    };

    const handleDelete = async (id: string) => {
        const toastId = toast.loading("Deleting...");
        try {
            const token = await getToken();
            await deleteGeneratedContent(token, id);
            toast.success("Content deleted", { id: toastId });
            setContent(prev => prev.filter(c => c.content_id !== id));
        } catch (err: any) {
            toast.error("Delete failed: " + err.message, { id: toastId });
        }
    };

    return (
        <AdminLayout activeSection="ai-review">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">AI Review Queue</h1>
                        <p className="text-gray-500 mt-1">Review AI-generated content before it reaches families.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                            {(['pending', 'approved', 'rejected'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-xl font-bold capitalize text-xs tracking-wider transition-all ${filter === status ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-8">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading queue...</div>
                ) : content.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
                        <h3 className="text-2xl font-black text-slate-900">All caught up!</h3>
                        <p className="text-slate-400">No {filter} content to review.</p>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {content.map(item => (
                            <div key={item.content_id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                {/* Card Header */}
                                <div className="px-8 pt-6 pb-4 flex items-center justify-between gap-4 border-b border-slate-50">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${TYPE_COLOURS[item.content_type] || 'bg-slate-100 text-slate-500'}`}>
                                            {item.content_type?.replace(/_/g, ' ')}
                                        </span>
                                        {item.island_id && (
                                            <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <Globe size={10} /> {item.island_id}
                                            </span>
                                        )}
                                    </div>

                                    {/* QA Badges */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase ${item.qa_report?.safety_passed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                            <Shield size={10} />
                                            Safety {item.qa_report?.safety_passed ? 'PASS' : 'FAIL'}
                                        </span>
                                        <span className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase ${item.qa_report?.cultural_passed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                            <Globe size={10} />
                                            Cultural {item.qa_report?.cultural_passed ? 'PASS' : 'FAIL'}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="px-8 py-6">
                                    <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                                    <div className="bg-slate-50 rounded-2xl p-5">
                                        <ContentPreview item={item} />
                                    </div>
                                </div>

                                {/* Card Actions */}
                                <div className="px-8 pb-6 flex items-center gap-3">
                                    {filter === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => updateStatus(item.content_id, 'approved')}
                                                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={14} /> Approve
                                            </button>
                                            <button
                                                onClick={() => updateStatus(item.content_id, 'rejected')}
                                                className="px-6 py-2.5 border-2 border-red-200 hover:border-red-400 text-red-400 hover:text-red-600 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </>
                                    )}

                                    {(filter === 'approved' || filter === 'rejected') && (
                                        <button
                                            onClick={() => updateStatus(item.content_id, 'pending')}
                                            className="px-6 py-2.5 border-2 border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                                        >
                                            <RotateCcw size={14} /> Move to Pending
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(item.content_id)}
                                        className="ml-auto px-4 py-2.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-2 text-xs font-bold"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
