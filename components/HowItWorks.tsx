"use client";

import { siteContent } from '@/lib/content';

export default function HowItWorks({ content }: { content?: any }) {
    const { how_it_works } = content || siteContent;

    return (
        <section id={how_it_works.id} className="py-24 bg-white">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-black text-deep">{how_it_works.title}</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {how_it_works.steps.map((step: any) => (
                        <div key={step.step} className="relative p-10 rounded-[3rem] bg-zinc-50 border border-zinc-100 hover:shadow-xl transition-all group">
                            <div className="w-16 h-16 bg-primary text-white text-2xl font-black rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                {step.step}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 leading-tight">{step.title}</h3>
                            <p className="text-deep/60 leading-relaxed">{step.description}</p>

                            {step.step < 3 && (
                                <div className="hidden md:block absolute top-1/2 -right-6 translate-x-1/2 -translate-y-1/2 z-10">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-200">
                                        <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="inline-block px-6 py-3 bg-secondary/10 text-secondary font-bold rounded-full text-sm">
                        💡 {how_it_works.bottom_note}
                    </p>
                </div>
            </div>
        </section>
    );
}
