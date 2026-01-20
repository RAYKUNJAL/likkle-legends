'use client';

import Link from 'next/link';
import { GraduationCap, ArrowRight, BookOpen, Globe, Users } from 'lucide-react';

export default function EducatorBlock({ content }: { content: any }) {
    const { educator_block } = content;
    if (!educator_block) return null;

    return (
        <section className="py-24 bg-deep relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
                <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full" />
                <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-white rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/20 rounded-full" />
            </div>

            <div className="container relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
                        <div className="shrink-0">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-emerald-500 rounded-3xl flex items-center justify-center rotate-3 shadow-2xl">
                                <GraduationCap className="w-12 h-12 md:w-16 md:h-16 text-white" />
                            </div>
                        </div>

                        <div className="flex-grow space-y-6 text-center md:text-left">
                            <div className="space-y-2">
                                <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm">
                                    {educator_block.tagline}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-black text-white">
                                    {educator_block.title}
                                </h2>
                            </div>

                            <p className="text-xl text-white/70 leading-relaxed max-w-2xl">
                                {educator_block.description}
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <Link
                                    href={educator_block.cta.href}
                                    className="inline-flex items-center gap-2 bg-white text-deep px-8 py-4 rounded-full font-bold hover:bg-emerald-50 transition-colors group"
                                >
                                    {educator_block.cta.label}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <span className="text-white/40 font-medium py-4">
                                    {educator_block.price_hint}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Educator Features */}
                    <div className="grid md:grid-cols-3 gap-8 mt-12">
                        <div className="flex items-center gap-4 text-white/60">
                            <BookOpen className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-medium">Curriculum Aligned</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/60">
                            <Globe className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-medium">Cultural Representation</span>
                        </div>
                        <div className="flex items-center gap-4 text-white/60">
                            <Users key="users-edu" className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-medium">Bulk Licensing Options</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
