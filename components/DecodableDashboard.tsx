
"use client";

import React, { useState, useCallback } from 'react';
import { generateDecodableAction } from '@/app/actions/decodable';
import { MasterDecodableManifest, GenerationRequest } from '@/lib/decodable/types';
import { ISLAND_REGISTRY, CURRICULUM_LEVELS, getCurriculumLevel } from '@/lib/decodable/constants';
import {
    Book, Wand2, Loader2, CheckCircle2, AlertCircle,
    FileText, ImageIcon, Layout, ShieldCheck, GraduationCap,
    ClipboardCheck, Globe2, Layers, Download, ChevronDown
} from 'lucide-react';

// ─── PIPELINE STEP TRACKER ───────────────────────────────────────

type PipelineStep = 'idle' | 'planning' | 'writing' | 'validating' | 'art' | 'layout' | 'teacher' | 'assessment' | 'packaging' | 'done' | 'error';

const STEP_LABELS: Record<PipelineStep, string> = {
    idle: 'Ready',
    planning: 'A1: Planning Story Arc...',
    writing: 'A2: Writing Decodable Text...',
    validating: 'A3: Validating Phonics...',
    art: 'A4: Art Direction...',
    layout: 'A5: Composing Layouts...',
    teacher: 'A6: Writing Teacher Guide...',
    assessment: 'A7: Creating Assessment...',
    packaging: 'A8: Final Packaging...',
    done: '✅ Production Complete',
    error: '❌ Production Failed'
};

const DecodableDashboard: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [pipelineStep, setPipelineStep] = useState<PipelineStep>('idle');
    const [manifest, setManifest] = useState<MasterDecodableManifest | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'text' | 'art' | 'layout' | 'teacher' | 'assessment'>('text');

    // Form state
    const [selectedIsland, setSelectedIsland] = useState('tt');
    const [selectedLevel, setSelectedLevel] = useState('L1_cvc_short_a');
    const [bookTitle, setBookTitle] = useState('SAM AND THE PAN');

    const getIslandName = (id: string) => ISLAND_REGISTRY.find(i => i.island_id === id)?.display_name || id;

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setPipelineStep('planning');
        setError(null);
        setManifest(null);

        const level = getCurriculumLevel(selectedLevel);
        if (!level) {
            setError(`Level ${selectedLevel} not found in curriculum spine`);
            setIsLoading(false);
            setPipelineStep('error');
            return;
        }

        const request: GenerationRequest = {
            book_title: bookTitle,
            island_id: selectedIsland,
            level_id: selectedLevel,
            phonics_focus: selectedLevel.replace('_', ' '),
            target_phonics: level.target_phonics,
            allowed_words: level.allowed_words,
            sight_words: level.sight_words,
            page_count: 12,
            characters: ["Sam", "R.O.T.I._optional"],
            settings: []  // Will use island pack defaults
        };

        // Simulate pipeline progress (the actual work happens server-side)
        const steps: PipelineStep[] = ['planning', 'writing', 'validating', 'art', 'layout', 'teacher', 'assessment', 'packaging'];
        let stepIdx = 0;
        const progressInterval = setInterval(() => {
            stepIdx++;
            if (stepIdx < steps.length) {
                setPipelineStep(steps[stepIdx]);
            }
        }, 3500);

        try {
            const result = await generateDecodableAction(request);
            clearInterval(progressInterval);

            if (result.success && result.manifest) {
                setManifest(result.manifest);
                setPipelineStep('done');
            } else {
                setError(result.error || "Generation unsuccessful");
                setPipelineStep('error');
            }
        } catch (err) {
            clearInterval(progressInterval);
            setError("Critical connection error. Check API key and server logs.");
            setPipelineStep('error');
        } finally {
            setIsLoading(false);
        }
    }, [bookTitle, selectedIsland, selectedLevel]);

    const downloadManifest = useCallback(() => {
        if (!manifest) return;
        const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${manifest.book_metadata.title.replace(/\s+/g, '_').toLowerCase()}_manifest.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [manifest]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-8">

                {/* ═══ HEADER ═══ */}
                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                                <Book className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black text-slate-800 leading-none">
                                    Decodable Reader Factory
                                </h1>
                                <p className="text-sm font-bold text-blue-500 tracking-widest uppercase">v2.0 • Multi-Island • Curriculum-Aligned</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {manifest && (
                            <button onClick={downloadManifest}
                                className="bg-white hover:bg-slate-50 text-slate-700 px-5 py-3 rounded-xl font-bold text-sm border-2 border-slate-200 transition-all flex items-center gap-2 active:scale-95 shadow-sm">
                                <Download size={16} /> Export JSON
                            </button>
                        )}
                        <button onClick={handleGenerate} disabled={isLoading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white px-7 py-3 rounded-xl font-black text-sm shadow-xl shadow-blue-200 transition-all flex items-center gap-2 active:scale-95">
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                            {isLoading ? 'Manufacturing...' : 'Generate Book'}
                        </button>
                    </div>
                </header>

                {/* ═══ FACTORY CONFIGURATION ═══ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Island Selector */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <Globe2 size={14} /> Island
                        </label>
                        <div className="relative">
                            <select value={selectedIsland} onChange={e => setSelectedIsland(e.target.value)}
                                className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 text-sm focus:border-blue-300 focus:outline-none transition-colors pr-10">
                                {ISLAND_REGISTRY.map(i => (
                                    <option key={i.island_id} value={i.island_id}>🏝️ {i.display_name}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Level Selector */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <Layers size={14} /> Curriculum Level
                        </label>
                        <div className="relative">
                            <select value={selectedLevel} onChange={e => setSelectedLevel(e.target.value)}
                                className="w-full appearance-none bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 text-sm focus:border-blue-300 focus:outline-none transition-colors pr-10">
                                {CURRICULUM_LEVELS.filter(l => l.level_id !== 'L0_pre_reader').map(l => (
                                    <option key={l.level_id} value={l.level_id}>📖 {l.level_id.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Title Input */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <FileText size={14} /> Book Title
                        </label>
                        <input type="text" value={bookTitle} onChange={e => setBookTitle(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 text-sm focus:border-blue-300 focus:outline-none transition-colors"
                            placeholder="SAM AND THE PAN" />
                    </div>
                </div>

                {/* ═══ PIPELINE STATUS ═══ */}
                {isLoading && (
                    <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Loader2 size={20} className="animate-spin text-blue-600" />
                            </div>
                            <div>
                                <p className="font-black text-blue-800 text-lg">{STEP_LABELS[pipelineStep]}</p>
                                <p className="text-blue-400 text-sm font-bold">Multi-agent pipeline in progress...</p>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-1">
                            {(['planning', 'writing', 'validating', 'art', 'layout', 'teacher', 'assessment', 'packaging'] as PipelineStep[]).map((step, idx) => {
                                const stepOrder = ['planning', 'writing', 'validating', 'art', 'layout', 'teacher', 'assessment', 'packaging'];
                                const currentIdx = stepOrder.indexOf(pipelineStep);
                                return (
                                    <div key={step}
                                        className={`h-2 flex-1 rounded-full transition-all duration-500 ${idx <= currentIdx ? 'bg-blue-500' : 'bg-slate-100'}`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ═══ ERROR ═══ */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-100 p-6 rounded-2xl flex items-center gap-4 text-red-700">
                        <AlertCircle size={28} />
                        <div>
                            <p className="font-black text-lg">Production Halted</p>
                            <p className="font-bold opacity-80 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* ═══ RESULTS ═══ */}
                {manifest && (
                    <div className="space-y-6">
                        {/* Summary Bar */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-wrap gap-6 items-center">
                            <div className="flex-1 min-w-[140px]">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Title</p>
                                <p className="text-xl font-black text-slate-800">{manifest.book_metadata.title}</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Island</p>
                                <p className="text-sm font-bold text-slate-600">🏝️ {manifest.book_metadata.island_display_name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Level</p>
                                <p className="text-sm font-bold text-slate-600">📖 {manifest.book_metadata.level_id}</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">QA</p>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${manifest.validation_report.status === 'pass' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {manifest.validation_report.status === 'pass' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                    {manifest.validation_report.status.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pages</p>
                                <p className="text-sm font-bold text-slate-600">{manifest.page_text_manifest.story_pages.length} story</p>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-100 shadow-sm w-fit">
                            {([
                                { id: 'text' as const, icon: FileText, label: 'Story' },
                                { id: 'art' as const, icon: ImageIcon, label: 'Art' },
                                { id: 'layout' as const, icon: Layout, label: 'Layout' },
                                { id: 'teacher' as const, icon: GraduationCap, label: 'Teacher' },
                                { id: 'assessment' as const, icon: ClipboardCheck, label: 'Assessment' },
                            ]).map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50'}`}>
                                    <tab.icon size={14} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm min-h-[400px]">
                            {/* ── TEXT TAB ── */}
                            {activeTab === 'text' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <ShieldCheck className={manifest.validation_report.status === 'pass' ? 'text-green-500' : 'text-amber-500'} size={24} />
                                        <h2 className="text-xl font-black text-slate-800">Story Manifest & Validation</h2>
                                    </div>

                                    {/* Vocabulary Chips */}
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Words Used</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {manifest.validation_report.word_inventory_used.map(w => (
                                                <span key={w} className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg text-xs font-bold border border-blue-100">{w}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Violations */}
                                    {manifest.validation_report.violations.length > 0 && (
                                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                            <p className="text-xs font-black text-amber-600 uppercase mb-2">⚠ Violations ({manifest.validation_report.violations.length})</p>
                                            {manifest.validation_report.violations.map((v, i) => (
                                                <p key={i} className="text-sm text-amber-700 font-medium">
                                                    Page {v.page}: <strong>"{v.word}"</strong> — {v.reason}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    {/* Story Pages */}
                                    <div className="space-y-3">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Story Pages</p>
                                        {manifest.page_text_manifest.story_pages.map(page => (
                                            <div key={page.page} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-blue-700 font-black text-sm">{page.page}</span>
                                                </div>
                                                <p className="text-lg font-bold text-slate-800 tracking-wide">{page.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Activity Page */}
                                    <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                                        <p className="text-xs font-black text-purple-600 uppercase mb-2">Activity Page (pg {manifest.page_text_manifest.activity_page.page})</p>
                                        <p className="text-sm font-bold text-purple-700 mb-2">Type: {manifest.page_text_manifest.activity_page.activity_type}</p>
                                        {manifest.page_text_manifest.activity_page.trace_words && (
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                <span className="text-xs font-bold text-purple-500">Trace: </span>
                                                {manifest.page_text_manifest.activity_page.trace_words.map(w => (
                                                    <span key={w} className="bg-white text-purple-700 px-2 py-0.5 rounded text-xs font-bold">{w}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── ART TAB ── */}
                            {activeTab === 'art' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <ImageIcon className="text-purple-500" size={24} /> Art Direction Prompts
                                    </h2>
                                    {manifest.art_prompt_manifest.map(art => (
                                        <div key={art.page_number} className="p-5 bg-gradient-to-r from-purple-50/50 to-indigo-50/50 rounded-xl border border-purple-100">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-purple-200 text-purple-800 px-2.5 py-0.5 rounded-lg text-xs font-black">PG {art.page_number}</span>
                                                <span className="text-purple-500 text-xs font-bold uppercase">{art.page_type}</span>
                                                {art.setting && <span className="text-slate-400 text-xs font-bold">📍 {art.setting}</span>}
                                            </div>
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">{art.prompt}</p>
                                            {art.must_include?.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    <span className="text-xs font-bold text-green-600">✓ Must include:</span>
                                                    {art.must_include.map((m, i) => (
                                                        <span key={i} className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{m}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── LAYOUT TAB ── */}
                            {activeTab === 'layout' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <Layout className="text-orange-500" size={24} /> Print Layout Specs
                                    </h2>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {manifest.layout_manifest.map(layout => (
                                            <div key={layout.page_number} className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                                <p className="font-black text-orange-700 text-sm mb-2">Page {layout.page_number}</p>
                                                <div className="text-xs text-slate-500 space-y-1 font-mono">
                                                    <p>Trim: {layout.trim_size_in.width}" × {layout.trim_size_in.height}"</p>
                                                    <p>Bleed: {layout.bleed_in}"</p>
                                                    <p>Text: x={layout.text_zone_box_normalized.x.toFixed(2)} y={layout.text_zone_box_normalized.y.toFixed(2)}</p>
                                                    <p>Size: w={layout.text_zone_box_normalized.w.toFixed(2)} h={layout.text_zone_box_normalized.h.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── TEACHER GUIDE TAB ── */}
                            {activeTab === 'teacher' && manifest.teacher_guide && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <GraduationCap className="text-emerald-500" size={24} /> Teacher Guide
                                    </h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <p className="text-xs font-black text-emerald-600 uppercase mb-3">Before Reading</p>
                                            <p className="text-sm font-bold text-slate-700 mb-2">📝 {manifest.teacher_guide.before_reading.phonics_focus_statement}</p>
                                            <p className="text-sm text-slate-600 mb-2">💬 {manifest.teacher_guide.before_reading.discussion_prompt}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {manifest.teacher_guide.before_reading.vocabulary_preview.map(w => (
                                                    <span key={w} className="bg-white text-emerald-700 px-2 py-0.5 rounded text-xs font-bold">{w}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                                            <p className="text-xs font-black text-blue-600 uppercase mb-3">Phonics Mini-Lesson</p>
                                            <p className="text-sm font-bold text-slate-700 mb-1">🔊 Sound: /{manifest.teacher_guide.phonics_mini_lesson.target_sound}/</p>
                                            <p className="text-sm text-slate-600 mb-2">🎯 {manifest.teacher_guide.phonics_mini_lesson.activity}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {manifest.teacher_guide.phonics_mini_lesson.example_words.map(w => (
                                                    <span key={w} className="bg-white text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{w}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="p-5 bg-amber-50 rounded-xl border border-amber-100 lg:col-span-2">
                                            <p className="text-xs font-black text-amber-600 uppercase mb-3">After Reading</p>
                                            <ul className="space-y-1">
                                                {manifest.teacher_guide.after_reading.comprehension_questions.map((q, i) => (
                                                    <li key={i} className="text-sm text-slate-600 font-medium">❓ {q}</li>
                                                ))}
                                            </ul>
                                            <p className="text-sm text-amber-700 font-bold mt-3">🎨 Extension: {manifest.teacher_guide.after_reading.extension_activity}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── ASSESSMENT TAB ── */}
                            {activeTab === 'assessment' && manifest.assessment && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                                        <ClipboardCheck className="text-rose-500" size={24} /> Assessment Checkpoint
                                    </h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="p-5 bg-rose-50 rounded-xl border border-rose-100">
                                            <p className="text-xs font-black text-rose-600 uppercase mb-3">Word Reading Checklist</p>
                                            <div className="space-y-1.5">
                                                {manifest.assessment.word_reading_checklist.map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg">
                                                        <span className="font-bold text-slate-700 text-sm">{item.word}</span>
                                                        <span className="text-xs text-slate-400 font-mono">{item.target_phonics}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100">
                                                <p className="text-xs font-black text-indigo-600 uppercase mb-3">Fluency Rubric</p>
                                                {manifest.assessment.fluency_rubric.map((r, i) => (
                                                    <div key={i} className="mb-2 last:mb-0">
                                                        <p className="font-black text-indigo-700 text-sm">{r.level}</p>
                                                        <p className="text-xs text-slate-500">{r.descriptor}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-xs font-black text-slate-500 uppercase mb-3">Comprehension Prompts</p>
                                                {manifest.assessment.comprehension_prompts.map((p, i) => (
                                                    <p key={i} className="text-sm text-slate-600 font-medium mb-1">• {p}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══ EMPTY STATE ═══ */}
                {!manifest && !isLoading && !error && (
                    <div className="py-24 flex flex-col items-center justify-center text-slate-300">
                        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-6 border-2 border-slate-100">
                            <Book size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-400">Ready to Manufacture</h2>
                        <p className="font-bold text-slate-300 text-sm mt-1">Select an island, level, and title — then hit Generate</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DecodableDashboard;
