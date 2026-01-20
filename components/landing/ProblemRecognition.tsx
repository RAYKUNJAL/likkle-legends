'use client';

import Image from 'next/image';

export default function ProblemRecognition({ content }: { content: any }) {
    const { identity_section } = content;
    if (!identity_section) return null;

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="container">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-widest">
                                The Challenge
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-deep leading-tight">
                                {identity_section.title || "Raising Kids Abroad Comes With a Quiet Worry"}
                            </h2>
                        </div>

                        <div className="space-y-6 text-xl text-deep/70 leading-relaxed">
                            <p>{identity_section.problem_text || "Your child is learning fast. But school won't teach them Carnival. Most apps won't teach them our stories."}</p>
                            <p className="font-bold text-deep">
                                Culture doesn't survive on memories alone.
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/10 rounded-[3rem] -rotate-3 translate-x-4 translate-y-4" />
                        <div className="relative rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl aspect-video md:aspect-square">
                            <Image
                                src={identity_section.supporting_media || "/images/parent-child-smiling.png"}
                                alt="Caribbean parent and child smiling"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
