'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' }
};

export default function CharacterRoles({ content }: { content: any }) {
    const charactersData = content.characters?.characters || [];
    // Colors aligned with: R.O.T.I (Cyan), Tanty (Amber), Dilly (Blue), Mango (Emerald), Benny (Purple), Sam (Rose)
    const colors = ['cyan', 'amber', 'blue', 'emerald', 'purple', 'rose'];

    return (
        <section className="py-20 bg-gradient-to-b from-white to-zinc-50">
            <div className="container">
                <div className="text-center mb-12 space-y-4">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-widest">
                        Meet the Guides
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-deep">
                        {content.characters?.title || "Characters Who Teach and Inspire"}
                    </h2>
                    <p className="text-lg text-deep/60 max-w-xl mx-auto">
                        Each guide brings a unique gift from the Caribbean to your child's learning journey.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-6xl mx-auto">
                    {charactersData.map((char: any, idx: number) => {
                        const colorKey = colors[idx % colors.length];
                        const colorConfig = colorMap[colorKey];
                        return (
                            <div
                                key={char.name}
                                className={`${colorConfig.bg} rounded-2xl p-5 border ${colorConfig.border} hover:shadow-lg transition-all group w-[calc(50%-1rem)] md:w-[calc(33.333%-1.5rem)] lg:w-[calc(20%-1.5rem)] min-w-[160px]`}
                            >
                                <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-white border border-zinc-100">
                                    <Image
                                        src={char.image || '/images/logo.png'}
                                        alt={char.name}
                                        width={200}
                                        height={200}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <h3 className="font-black text-deep text-lg mb-0.5">{char.name}</h3>
                                {char.id === 'roti' && (
                                    <p className="text-[9px] text-deep/60 leading-tight mb-2 -mt-0.5 font-bold uppercase tracking-wide">
                                        Robotic Operational Teaching Interface
                                    </p>
                                )}
                                <p className={`text-sm font-bold ${colorConfig.text} mb-2`}>{char.role}</p>
                                <p className="text-sm text-deep/60 leading-snug">{char.tagline || char.oneLiner}</p>
                                <p className="text-xs text-deep/40 mt-2">
                                    {char.description.substring(0, 80)}...
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-10">
                    <Link
                        href="/characters"
                        className="inline-flex items-center gap-2 text-deep/60 hover:text-deep font-bold transition-colors group"
                    >
                        Meet the Universe
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
