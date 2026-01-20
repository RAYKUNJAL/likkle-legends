'use client';

import { CheckCircle2, Users, Rocket, Heart } from 'lucide-react';

export default function WhoItIsFor({ content }: { content: any }) {
    const { who_it_is_for } = content;
    if (!who_it_is_for) return null;

    const icons = [
        <Users key="users" className="w-6 h-6 text-emerald-500" />,
        <Heart key="heart" className="w-6 h-6 text-amber-500" />,
        <Rocket key="rocket" className="w-6 h-6 text-blue-500" />
    ];

    return (
        <section className="py-24 bg-zinc-50 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

            <div className="container relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black text-deep">
                            {who_it_is_for.title}
                        </h2>
                        <div className="h-1.5 w-24 bg-emerald-500 mx-auto rounded-full" />
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {(who_it_is_for.bullets || []).map((bullet: string, i: number) => (
                            <div
                                key={i}
                                className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
                            >
                                <div className="mb-6 p-4 rounded-2xl bg-zinc-50 w-fit group-hover:bg-emerald-50 transition-colors">
                                    {icons[i] || <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                                </div>
                                <p className="text-lg text-deep/80 leading-relaxed font-medium">
                                    {bullet}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
