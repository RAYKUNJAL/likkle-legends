'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Sparkles } from 'lucide-react';

export default function FinalCTASection({ content }: { content: any }) {
    const { cta_banner } = content;

    return (
        <section className="py-20 bg-gradient-to-b from-white to-amber-50/50">
            <div className="container">
                <div className="max-w-4xl mx-auto">
                    <div className="relative bg-deep rounded-[3rem] p-10 md:p-16 overflow-hidden text-center">
                        {/* Glow effects */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500 rounded-full blur-[120px] opacity-20 -mr-40 -mt-40" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500 rounded-full blur-[120px] opacity-20 -ml-40 -mb-40" />

                        <div className="relative z-10 space-y-8">
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
                                {cta_banner?.headline || "Ready to start your child’s Caribbean adventure?"}
                            </h2>

                            <p className="text-lg md:text-xl text-white/60 max-w-xl mx-auto">
                                {cta_banner?.subheadline || "Join 500+ families building identity, emotional literacy, and joyful memories each month."}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Link
                                    href={cta_banner?.primary_cta?.href || "/get-started"}
                                    className="inline-flex items-center justify-center gap-2 btn btn-primary btn-lg px-10 py-5 text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:scale-[1.02] transition-all group"
                                >
                                    {cta_banner?.primary_cta?.label || "Start Mail Club for $10/month"}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href={cta_banner?.secondary_cta?.href || "/get-started"}
                                    className="inline-flex items-center justify-center gap-2 btn bg-white/10 hover:bg-white/20 text-white px-8 py-5 text-lg border border-white/20 transition-all"
                                >
                                    {cta_banner?.secondary_cta?.label || "Start Free Digital Trial"}
                                </Link>
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-6 text-white/50 text-sm pt-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    <span>Cancel anytime</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Safe, ad-free experience</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
