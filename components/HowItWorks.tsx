"use client";

import { siteContent } from '@/lib/content';

export default function HowItWorks() {
    const { howItWorks } = siteContent;

    return (
        <section id={howItWorks.id} className="py-24 bg-white">
            <div className="container">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                    <span className="text-primary font-bold uppercase tracking-widest text-sm">{howItWorks.eyebrow}</span>
                    <h2 className="text-4xl lg:text-5xl font-black text-deep">{howItWorks.title}</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-12">
                    {howItWorks.steps.map((step) => (
                        <div key={step.stepNumber} className="relative p-10 rounded-[3rem] bg-zinc-50 border border-zinc-100 hover:shadow-xl transition-all group">
                            <div className="w-16 h-16 bg-primary text-white text-2xl font-black rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                {step.stepNumber}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 leading-tight">{step.title}</h3>
                            <p className="text-deep/60 leading-relaxed">{step.body}</p>

                            {step.stepNumber < 3 && (
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
                        💡 {howItWorks.bottomNote}
                    </p>
                </div>
            </div>
        </section>
    );
}
