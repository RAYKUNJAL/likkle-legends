
"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2, XCircle, PlayCircle, FileText,
    Guitar, BookOpen, Loader2, Sparkles
} from 'lucide-react';
import { GeneratedContent } from '@/lib/types';
import { useUser } from '@/components/UserContext';
import { supabase } from '@/lib/supabase-client';
import { fetchGeneratedContent, approveContentAction, rejectContentAction } from '@/app/actions/island-brain';

export default function ContentReviewFeed() {
    const { user } = useUser();
    const [content, setContent] = useState<GeneratedContent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadContent();
        }
    }, [user]);

    const loadContent = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const data = await fetchGeneratedContent(session.access_token);
                setContent(data);
            }
        } catch (e) {
            console.error("Failed to load content", e);
        }
        setLoading(false);
    };

    const handleApprove = async (contentId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await approveContentAction(session.access_token, contentId);
            // Optimistic update
            setContent(prev => prev.map(c =>
                c.content_id === contentId ? { ...c, is_approved_for_kid: true } : c
            ));
        } catch (e) {
            console.error("Approval failed", e);
        }
    };

    const handleReject = async (contentId: string) => {
        if (!confirm("Are you sure you want to delete this content?")) return;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            await rejectContentAction(session.access_token, contentId);
            setContent(prev => prev.filter(c => c.content_id !== contentId));
        } catch (e) {
            console.error("Rejection failed", e);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="font-bold uppercase tracking-widest text-xs">Checking Island Brain...</p>
            </div>
        );
    }

    if (content.length === 0) {
        return (
            <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-dashed border-slate-200 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="text-slate-300" size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">No Content Yet</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                    The Island Brain hasn't generated anything for your family yet.
                    Visit the Studio to create something magical!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Review Content</h3>
                <span className="bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest">
                    {content.filter(c => !c.is_approved_for_kid).length} Pending
                </span>
            </div>

            <div className="grid gap-6">
                {content.map((item) => (
                    <motion.div
                        key={item.content_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white p-8 rounded-[3rem] shadow-lg border-2 ${item.is_approved_for_kid ? 'border-green-100 opacity-70' : 'border-primary/10'}`}
                    >
                        <div className="flex justify-between items-start gap-6">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                                {item.content_type.includes('song') ? <Guitar className="text-pink-500" /> : <BookOpen className="text-blue-500" />}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 px-2 py-1 rounded-lg">
                                        {item.content_type.replace(/_/g, ' ')}
                                    </span>
                                    {item.is_approved_for_kid && (
                                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-green-600">
                                            <CheckCircle2 size={12} /> Approved
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 leading-tight mb-2">{item.title}</h4>
                                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                    {/* Naive extraction of content for preview */}
                                    {JSON.stringify(item.payload).substring(0, 150)}...
                                </p>

                                {item.qa_report && (
                                    <div className="mt-4 flex gap-2">
                                        {item.qa_report.safety_passed && (
                                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                Safety Passed
                                            </span>
                                        )}
                                        {item.qa_report.cultural_passed && (
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                Cultural Check
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {!item.is_approved_for_kid && (
                            <div className="mt-8 flex gap-4 border-t border-slate-50 pt-6">
                                <button
                                    onClick={() => handleApprove(item.content_id)}
                                    className="flex-1 py-4 bg-slate-900 hover:bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={16} /> Approve Generation
                                </button>
                                <button
                                    title="Reject Content"
                                    aria-label="Reject Content"
                                    onClick={() => handleReject(item.content_id)}
                                    className="px-6 py-4 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-2xl font-black transition-colors"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
