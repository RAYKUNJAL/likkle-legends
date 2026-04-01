"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { GeneratedContent, ContentType } from '@/lib/types';
import {
    AdminLayout, StatCard, StatusBadge, Modal, Tabs,
    AlertCircle, CheckCircle2, Trash2, RefreshCw, Shield, Globe,
    Sparkles, Wand2, Send, Plus, BookOpen, Music, Video, Download,
    Zap, XCircle
} from '@/components/admin/AdminComponents';
import { runAgentGeneration, approveContentAction, rejectContentAction } from '@/app/actions/island-brain';
import { ISLAND_REGISTRY } from '@/lib/registries/islands';
import { CHARACTER_REGISTRY } from '@/lib/registries/characters';
import { toast } from 'react-hot-toast';

// Type-aware content preview
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
                {p.lyrics && (
                    <div className="space-y-1">
                        {Object.entries(p.lyrics).slice(0, 2).map(([key, val]: any) => (
                            <p key={key} className="text-xs text-slate-600">{key}: {typeof val === 'string' ? val.substring(0, 60) : '...'}</p>
                        ))}
                    </div>
                )}
                {scenes.length > 0 ? (
                    <ol className="space-y-1 list-decimal list-inside">
                        {scenes.slice(0, 3).map((s: any, i: number) => (
                            <li key={i} className="text-sm text-slate-600">
                                {s.hook || s.description || s.action || JSON.stringify(s).substring(0, 80)}
                            </li>
                        ))}
                        {scenes.length > 3 && <li className="text-xs text-slate-400">+{scenes.length - 3} more scenes</li>}
                    </ol>
                ) : null}
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
                ) : null}
            </div>
        );
    }

    if (type === 'lesson_micro') {
        return (
            <div className="space-y-2">
                {p.learning_objective && <p className="text-sm font-bold text-slate-700">{p.learning_objective}</p>}
                {p.introduction && <p className="text-sm text-slate-600 line-clamp-3">{p.introduction}</p>}
            </div>
        );
    }

    if (type === 'quiz_micro') {
        const questions = p.questions || [];
        return (
            <div className="space-y-2">
                {p.title && <p className="text-sm font-bold text-slate-700">{p.title}</p>}
                {questions.length > 0 && (
                    <ol className="space-y-1">
                        {questions.slice(0, 3).map((q: any, i: number) => (
                            <li key={i} className="text-sm text-slate-600">
                                {typeof q === 'string' ? q : q.question || JSON.stringify(q).substring(0, 80)}
                            </li>
                        ))}
                        {questions.length > 3 && <li className="text-xs text-slate-400">+{questions.length - 3} more questions</li>}
                    </ol>
                )}
            </div>
        );
    }

    return (
        <p className="text-slate-700 text-sm line-clamp-5">
            {p.content || p.text || p.body || p.question || JSON.stringify(p).substring(0, 400)}
        </p>
    );
}

// QA Report Card
function QAReportCard({ item }: { item: GeneratedContent }) {
    const qa = item.qa_report;
    if (!qa) return <p className="text-slate-400 text-sm">No QA report available.</p>;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                    {qa.safety_passed ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                        <XCircle size={16} className="text-red-500" />
                    )}
                    <span className="text-sm font-bold">Safety: {qa.safety_passed ? 'Pass' : 'Fail'}</span>
                </div>
                <div className="flex items-center gap-2">
                    {qa.cultural_passed ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                        <XCircle size={16} className="text-red-500" />
                    )}
                    <span className="text-sm font-bold">Cultural: {qa.cultural_passed ? 'Pass' : 'Fail'}</span>
                </div>
            </div>
            {qa.quality_score !== undefined && (
                <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">Quality Score</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all ${qa.quality_score >= 80 ? 'bg-green-500' : qa.quality_score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(qa.quality_score, 100)}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-slate-600 w-8">{Math.round(qa.quality_score || 0)}%</span>
                    </div>
                </div>
            )}
            {qa.reasons && qa.reasons.length > 0 && (
                <div className="text-xs text-slate-500 space-y-1">
                    {qa.reasons.map((reason, i) => (
                        <p key={i} className="flex gap-2">
                            <span className="text-amber-500">•</span>
                            <span>{reason}</span>
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}

const CONTENT_TYPES: ContentType[] = [
    'song_video_script',
    'story_bedtime',
    'lesson_micro',
    'quiz_micro',
    'printable_cards_text',
    'song_lyrics',
    'story_short',
    'monthly_drop_bundle',
];

const TYPE_LABELS: Record<ContentType, string> = {
    'song_video_script': 'Song Video Script',
    'song_lyrics': 'Song Lyrics',
    'story_short': 'Short Story',
    'story_bedtime': 'Bedtime Story',
    'lesson_micro': 'Micro Lesson',
    'quiz_micro': 'Micro Quiz',
    'printable_cards_text': 'Printable Cards',
    'monthly_drop_bundle': 'Monthly Bundle',
};

const TYPE_COLOURS: Record<ContentType, string> = {
    story_short: 'bg-violet-100 text-violet-700',
    story_bedtime: 'bg-indigo-100 text-indigo-700',
    song_video_script: 'bg-pink-100 text-pink-700',
    song_lyrics: 'bg-pink-100 text-pink-700',
    printable_cards_text: 'bg-amber-100 text-amber-700',
    lesson_micro: 'bg-emerald-100 text-emerald-700',
    quiz_micro: 'bg-blue-100 text-blue-700',
    monthly_drop_bundle: 'bg-orange-100 text-orange-700',
};

// Main page
export default function IslandOrchestratorPage() {
    const [islandId, setIslandId] = useState<string>('TT');
    const [characterId, setCharacterId] = useState<string>('roti');
    const [contentType, setContentType] = useState<ContentType>('story_bedtime');
    const [topic, setTopic] = useState('');
    const [ageGroup, setAgeGroup] = useState<'mini' | 'big'>('mini');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedItems, setGeneratedItems] = useState<GeneratedContent[]>([]);
    const [selectedItem, setSelectedItem] = useState<GeneratedContent | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const getToken = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Please log in again.");
        return session.access_token;
    }, []);

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error("Please enter a topic or description");
            return;
        }

        setIsGenerating(true);
        const toastId = toast.loading("Generating content with IslandBrain...");

        try {
            const token = await getToken();

            // Audit logging is now handled in the server action (runAgentGeneration)
            const result = await runAgentGeneration(token, contentType, topic, islandId, {
                child_age: ageGroup === 'mini' ? '3-5' : '6-8',
                dialect_level: 'light',
                cultural_density: 'medium',
                host_character_id: characterId
            });

            if (result.success && result.content) {
                const newItem = {
                    ...result.content,
                    content_id: result.content.content_id || Math.random().toString(36).substring(7),
                };
                setGeneratedItems(prev => [newItem, ...prev]);
                setSelectedItem(newItem);
                toast.success("Content generated successfully!", { id: toastId });
                setTopic('');
            } else {
                toast.error(`Generation failed: ${result.error}`, { id: toastId });
            }
        } catch (error: any) {
            console.error("Generation error:", error);
            toast.error(error.message || "Generation failed", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleApprove = async (item: GeneratedContent) => {
        const toastId = toast.loading("Approving content...");
        try {
            const token = await getToken();

            // Audit logging is now handled in the server action (approveContentAction)
            await approveContentAction(token, item.content_id);
            toast.success("Content approved!", { id: toastId });
            setGeneratedItems(prev => prev.map(i =>
                i.content_id === item.content_id
                    ? { ...i, admin_status: 'approved' }
                    : i
            ));
            setSelectedItem(prev => prev && prev.content_id === item.content_id
                ? { ...prev, admin_status: 'approved' }
                : prev
            );
        } catch (error: any) {
            toast.error("Approval failed: " + error.message, { id: toastId });
        }
    };

    const handleReject = async (item: GeneratedContent) => {
        const toastId = toast.loading("Rejecting content...");
        try {
            const token = await getToken();

            // Audit logging is now handled in the server action (rejectContentAction)
            await rejectContentAction(token, item.content_id);
            toast.success("Content rejected", { id: toastId });
            setGeneratedItems(prev => prev.map(i =>
                i.content_id === item.content_id
                    ? { ...i, admin_status: 'rejected' }
                    : i
            ));
            if (selectedItem?.content_id === item.content_id) {
                setSelectedItem(null);
            }
        } catch (error: any) {
            toast.error("Rejection failed: " + error.message, { id: toastId });
        }
    };

    const islandOptions = Object.entries(ISLAND_REGISTRY).map(([key, island]) => ({
        value: key,
        label: island.display_name,
    }));

    const characterOptions = Object.entries(CHARACTER_REGISTRY).map(([key, char]) => ({
        value: key,
        label: char.name,
    }));

    return (
        <AdminLayout activeSection="island-orchestrator">
            <header className="bg-white border-b border-gray-100 px-8 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                            <Sparkles className="text-primary fill-primary" />
                            Island Orchestrator
                        </h1>
                        <p className="text-gray-500">Generate premium educational content with safety gates & QA</p>
                    </div>
                </div>
            </header>

            <div className="p-8 grid lg:grid-cols-12 gap-8">
                {/* Left: Generation Controls */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Generation Card */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8">
                        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                            <Wand2 size={28} className="text-primary" />
                            Create Content
                        </h2>

                        <div className="space-y-6">
                            {/* Island Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Island</label>
                                <select
                                    value={islandId}
                                    onChange={(e) => setIslandId(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all"
                                >
                                    {islandOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Character Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Host Character</label>
                                <select
                                    value={characterId}
                                    onChange={(e) => setCharacterId(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all"
                                >
                                    {characterOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Content Type */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Content Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {CONTENT_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setContentType(type)}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${contentType === type
                                                ? 'bg-primary text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                        >
                                            {TYPE_LABELS[type]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Topic/Description */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Topic or Description</label>
                                <textarea
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., A lesson about Caribbean sea turtles..."
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary transition-all resize-none"
                                    rows={4}
                                    disabled={isGenerating}
                                />
                            </div>

                            {/* Age Group */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">Age Group</label>
                                <div className="flex gap-3">
                                    {(['mini', 'big'] as const).map(age => (
                                        <button
                                            key={age}
                                            onClick={() => setAgeGroup(age)}
                                            className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${ageGroup === age
                                                ? 'bg-primary text-white shadow-lg'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                }`}
                                        >
                                            {age === 'mini' ? '👶 Mini (3-5)' : '🧑 Big (6-8)'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !topic.trim()}
                                className="w-full px-8 py-4 bg-gradient-to-r from-primary to-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="animate-spin" size={20} />
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={20} />
                                        <span>Generate Content</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Generated Items List */}
                    {generatedItems.length > 0 && (
                        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 p-6 border-b border-slate-100">
                                <h3 className="text-lg font-black text-slate-800">Generated Content ({generatedItems.length})</h3>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                                {generatedItems.map(item => (
                                    <div
                                        key={item.content_id}
                                        onClick={() => setSelectedItem(item)}
                                        className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedItem?.content_id === item.content_id ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${TYPE_COLOURS[item.content_type]}`}>
                                                        {TYPE_LABELS[item.content_type]}
                                                    </span>
                                                    <StatusBadge
                                                        status={item.admin_status || 'pending'}
                                                        variant="subtle"
                                                    />
                                                </div>
                                                <h4 className="font-bold text-slate-800 truncate">{item.title}</h4>
                                                <p className="text-xs text-slate-500 mt-1">Island: {ISLAND_REGISTRY[item.island_id]?.display_name || item.island_id}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Preview & QA */}
                <div className="lg:col-span-5 space-y-6">
                    {selectedItem ? (
                        <>
                            {/* Content Preview */}
                            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-lg font-black text-slate-800">Content Preview</h3>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${TYPE_COLOURS[selectedItem.content_type]}`}>
                                        {TYPE_LABELS[selectedItem.content_type]}
                                    </span>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800">{selectedItem.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Island: {ISLAND_REGISTRY[selectedItem.island_id]?.display_name}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4 text-sm max-h-48 overflow-y-auto">
                                        <ContentPreview item={selectedItem} />
                                    </div>
                                    {selectedItem.parent_note && (
                                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                            <p className="text-xs font-bold text-blue-700 mb-2">Parent Note</p>
                                            <p className="text-xs text-blue-600">{selectedItem.parent_note.why_it_helps}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* QA Report */}
                            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-6">
                                <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                    <Shield size={20} className="text-primary" />
                                    Safety & Quality Gates
                                </h3>
                                <QAReportCard item={selectedItem} />
                            </div>

                            {/* Action Buttons */}
                            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-6 space-y-3">
                                {selectedItem.admin_status !== 'approved' && (
                                    <button
                                        onClick={() => handleApprove(selectedItem)}
                                        className="w-full px-6 py-3 bg-green-500 text-white rounded-xl font-black hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={18} />
                                        Approve Content
                                    </button>
                                )}
                                {selectedItem.admin_status !== 'rejected' && (
                                    <button
                                        onClick={() => handleReject(selectedItem)}
                                        className="w-full px-6 py-3 bg-red-500 text-white rounded-xl font-black hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={18} />
                                        Reject Content
                                    </button>
                                )}
                                {selectedItem.admin_status === 'approved' && (
                                    <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                                        <CheckCircle2 size={18} className="text-green-600" />
                                        <span className="text-sm font-bold text-green-700">Approved</span>
                                    </div>
                                )}
                                {selectedItem.admin_status === 'rejected' && (
                                    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                                        <AlertCircle size={18} className="text-red-600" />
                                        <span className="text-sm font-bold text-red-700">Rejected</span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="h-96 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                            <Sparkles size={64} className="mb-6 opacity-20" />
                            <h3 className="text-xl font-black">No Content Selected</h3>
                            <p className="text-sm font-medium mt-2">Generate content above to see preview and QA metrics.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
