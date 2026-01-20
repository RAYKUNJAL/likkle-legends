'use client';

import Image from 'next/image';
import { Heart, Sparkles, BookOpen } from 'lucide-react';

export default function FoundersSection({ content }: { content: any }) {
    const { founders_section } = content;
    if (!founders_section) return null;

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/30 -skew-x-12 translate-x-1/4 pointer-events-none" />

            <div className="container relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Visual side */}
                    <div className="relative">
                        <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white">
                            <Image
                                src={founders_section.image || "/images/child_reading.png"}
                                alt="Founders of Likkle Legends"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Floating badges */}
                        <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl border border-zinc-100 max-w-[200px] animate-float">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Heart className="w-5 h-5 text-emerald-600" />
                                </div>
                                <p className="font-bold text-deep leading-tight">Roots First</p>
                            </div>
                            <p className="text-xs text-deep/60">Built by Caribbean parents for the next generation.</p>
                        </div>
                    </div>

                    {/* Content side */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                                <Sparkles className="w-3.5 h-3.5" /> Our Story
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-deep leading-tight">
                                {founders_section.title}
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {(founders_section.bullets || []).map((bullet: string, i: number) => (
                                <div key={i} className="flex gap-4 items-start group">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-1 text-xs font-bold">
                                        {i + 1}
                                    </div>
                                    <p className="text-lg text-deep/70 leading-relaxed group-hover:text-deep transition-colors">
                                        {bullet}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-zinc-100 flex items-center gap-6">
                            <div>
                                <p className="text-2xl font-black text-deep">Proudly Individual.</p>
                                <p className="text-sm text-deep/40 font-bold uppercase tracking-widest">Est. 2025 • Caribbean Founded</p>
                            </div>
                            <div className="w-16 h-16 rounded-full border-2 border-emerald-200 flex items-center justify-center p-2 opacity-50">
                                <Image src="/images/logo.png" alt="Likkle Legends Logo" width={40} height={40} className="grayscale" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
