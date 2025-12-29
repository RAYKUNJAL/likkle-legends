"use client";

import { useState } from 'react';
import { Sparkles, Bot, PenTool, BookOpen, Music, Loader2 } from 'lucide-react';

export default function AssetBuilder() {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [mode, setMode] = useState<'coloring' | 'story' | 'guide'>('story');

    const handleGenerate = async () => {
        if (!prompt) return;
        setGenerating(true);

        // This would connect to the Gemini API via a server action or API route
        // simulating delay for now
        setTimeout(() => {
            setResult(`[${mode.toUpperCase()} GENERATED]\n\nBased on "${prompt}", here is a draft...\n\n(AI Content would appear here. Connect Google Gemini API to fully activate.)`);
            setGenerating(false);
        }, 2000);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-100 space-y-8">
                <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                        <Bot className="text-primary" /> AI Asset Architect
                    </h2>
                    <p className="text-deep/60">Describe what you need, and I'll build the foundation.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => setMode('story')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${mode === 'story' ? 'border-primary bg-primary/5 text-primary' : 'border-zinc-100 hover:border-zinc-200'}`}
                    >
                        <BookOpen className="mx-auto mb-2" />
                        <span className="text-xs font-black uppercase">Story</span>
                    </button>
                    <button
                        onClick={() => setMode('coloring')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${mode === 'coloring' ? 'border-primary bg-primary/5 text-primary' : 'border-zinc-100 hover:border-zinc-200'}`}
                    >
                        <PenTool className="mx-auto mb-2" />
                        <span className="text-xs font-black uppercase">Coloring</span>
                    </button>
                    <button
                        onClick={() => setMode('guide')}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${mode === 'guide' ? 'border-primary bg-primary/5 text-primary' : 'border-zinc-100 hover:border-zinc-200'}`}
                    >
                        <Sparkles className="mx-auto mb-2" />
                        <span className="text-xs font-black uppercase">Guide</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-black uppercase tracking-widest text-deep/40 pl-2">Prompt Instructions</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={6}
                        className="w-full p-6 bg-zinc-50 rounded-3xl border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold resize-none"
                        placeholder={
                            mode === 'story' ? "e.g., Write a story about Dilly Doubles finding a magical steelpan in Port of Spain..." :
                                mode === 'coloring' ? "e.g., Create a prompt for an image of Mango Moko dancing at Carnival..." :
                                    "e.g., Create a parent guide for discussing 'Fear' using Caribbean folklore..."
                        }
                    ></textarea>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!prompt || generating}
                    className="btn btn-primary w-full py-5 text-lg font-bold shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {generating ? (
                        <><Loader2 className="animate-spin" /> Magicking...</>
                    ) : (
                        <><Sparkles size={18} /> Generate Asset</>
                    )}
                </button>
            </div>

            <div className="bg-zinc-900 rounded-[2rem] p-8 text-white/90 font-mono text-sm overflow-hidden relative min-h-[400px]">
                <div className="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest opacity-30">Preview Console</div>
                {result ? (
                    <div className="whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {result}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center p-8">
                        <Bot size={48} className="mb-4" />
                        <p>Waiting for instructions...</p>
                        <p className="text-xs mt-2">Connect Google Gemini API v1.5 Pro to enable live generation.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
