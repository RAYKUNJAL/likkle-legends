'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Sparkles, BookOpen, Wand2, ArrowRight, Loader2 } from 'lucide-react';

export default function StoryStudioLeadMagnet({ content }: { content: any }) {
    const { ai_story_studio } = content;
    if (!ai_story_studio) return null;

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<null | { title: string, snippet: string }>(null);
    const [formData, setFormData] = useState({
        child_name: '',
        email: '',
        island: 'Jamaica',
        guide: 'Tanty Spice',
        location: 'Rainforest',
        mission: 'Folklore Quest'
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.child_name || !formData.email) return;

        setLoading(true);

        try {
            const { createLead } = await import('@/app/actions/crm');
            await createLead({
                email: formData.email,
                child_name: formData.child_name,
                island_preference: formData.island,
                source: 'story_studio_teaser'
            });

            // Simulate AI generation delay
            setTimeout(() => {
                setResult({
                    title: `${formData.child_name}'s ${formData.island} Adventure`,
                    snippet: `Once upon a time in the heart of the ${formData.location}, ${formData.child_name} was walking with ${formData.guide}. Suddenly, they found a glowing ${formData.mission === 'Folklore Quest' ? 'ancient scroll' : 'golden fruit'} hidden behind some giant palm leaves...`
                });
                setLoading(false);
                setIsSubmitted(true);
            }, 1500);
        } catch (err) {
            console.error("Lead submission failed:", err);
            setLoading(false);
        }
    };

    return (
        <section id="story-studio" className="py-24 bg-zinc-50 relative overflow-hidden">
            <div className="container relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest">
                                    <Sparkles className="w-3.5 h-3.5" /> Interactive Demo
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black text-deep leading-tight">
                                    {ai_story_studio.title}
                                </h2>
                                <p className="text-xl text-deep/60">
                                    {ai_story_studio.subtitle}
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-zinc-100">
                                <form onSubmit={handleGenerate} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-deep uppercase tracking-wider px-1">Your Email (to save your story)</label>
                                        <input
                                            type="email"
                                            placeholder="parent@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-5 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {ai_story_studio.form.fields.map((field: any) => (
                                            <div key={field.id} className="space-y-2">
                                                <label className="text-sm font-bold text-deep uppercase tracking-wider px-1">
                                                    {field.label}
                                                </label>
                                                {field.type === 'text' ? (
                                                    <input
                                                        type="text"
                                                        placeholder={field.placeholder}
                                                        value={(formData as any)[field.id]}
                                                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                                        className="w-full px-5 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                                        required
                                                    />
                                                ) : (
                                                    <select
                                                        value={(formData as any)[field.id]}
                                                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                                                        className="w-full px-5 py-3 rounded-2xl bg-zinc-50 border border-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                                    >
                                                        {field.options.map((opt: string) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !formData.child_name || !formData.email}
                                        className="w-full bg-deep text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-deep/10"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {ai_story_studio.form.states.loading_message}
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="w-5 h-5" />
                                                {ai_story_studio.form.primary_button.label}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            <p className="text-sm text-center text-deep/40 font-medium">
                                {ai_story_studio.upsell_note}
                            </p>
                        </div>

                        <div className="relative">
                            {result ? (
                                <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl border-4 border-emerald-500 animate-in fade-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-10">
                                        <BookOpen className="w-32 h-32 text-deep" />
                                    </div>
                                    <div className="relative space-y-6">
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-widest">
                                            <Sparkles className="w-4 h-4" /> Story Saved!
                                        </div>
                                        <h3 className="text-2xl font-black text-deep">{result.title}</h3>
                                        <div className="h-0.5 w-12 bg-emerald-500" />
                                        <p className="text-xl text-deep/80 leading-relaxed font-serif italic">
                                            &ldquo;{result.snippet}&rdquo;
                                        </p>
                                        <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row gap-4">
                                            <Link
                                                href="/signup"
                                                className="flex-grow bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-colors text-center"
                                            >
                                                Continue Story (Sign Up)
                                            </Link>
                                            <button
                                                onClick={() => setResult(null)}
                                                className="px-6 py-4 rounded-2xl font-bold text-deep/60 hover:bg-zinc-50 transition-colors"
                                            >
                                                Try Another
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-[4/5] bg-deep/5 rounded-[4rem] border-4 border-dashed border-deep/10 flex flex-col items-center justify-center text-center p-12 space-y-6">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-4">
                                        <BookOpen className="w-10 h-10 text-deep/20" />
                                    </div>
                                    <p className="text-deep/40 font-bold uppercase tracking-widest text-sm">Preview will appear here</p>
                                    <p className="text-deep/30">Select your child's guide and mission to start the magic.</p>
                                </div>
                            )}

                            {/* Decorative accents */}
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-400 rounded-full blur-2xl opacity-20" />
                            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-400 rounded-full blur-3xl opacity-20" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
