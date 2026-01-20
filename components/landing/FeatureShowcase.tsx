'use client';

import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

export default function FeatureShowcase({ content }: { content: any }) {
    const { what_you_get } = content;
    if (!what_you_get) return null;

    return (
        <section id="features" className="py-24 bg-white overflow-hidden">
            <div className="container">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black text-deep">
                        {what_you_get.title}
                    </h2>
                    <div className="h-1.5 w-24 bg-emerald-500 mx-auto rounded-full" />
                </div>

                <div className="space-y-32">
                    {(what_you_get.items || []).map((item: any, i: number) => {
                        const isEven = i % 2 === 0;
                        return (
                            <div key={i} className="grid lg:grid-cols-2 gap-16 items-center">
                                <div className={`space-y-8 ${isEven ? 'order-1' : 'order-1 lg:order-2'}`}>
                                    <div className="space-y-4">
                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                                            {item.label}
                                        </span>
                                        <h3 className="text-3xl md:text-4xl font-black text-deep leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-xl text-deep/70 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>

                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-deep/80 font-medium">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            Designed for ages 4–8
                                        </li>
                                        <li className="flex items-center gap-3 text-deep/80 font-medium">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            Ad-free & kid-safe environment
                                        </li>
                                    </ul>
                                </div>

                                <div className={`relative ${isEven ? 'order-2' : 'order-2 lg:order-1'}`}>
                                    <div className={`absolute inset-0 bg-emerald-500/5 rounded-[3.5rem] ${isEven ? 'rotate-3 translate-x-4 translate-y-4' : '-rotate-3 -translate-x-4 translate-y-4'}`} />
                                    <div className="relative aspect-[4/3] rounded-[3.5rem] overflow-hidden border-8 border-white shadow-2xl">
                                        <Image
                                            src={item.media || "/images/placeholder.png"}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Small accent image or badge could go here */}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
