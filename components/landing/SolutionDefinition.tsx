'use client';

import { BookOpen, Radio, Palette, Users } from 'lucide-react';

const features = [
    {
        icon: BookOpen,
        label: 'Stories',
        description: 'Caribbean tales with learning built in'
    },
    {
        icon: Radio,
        label: 'Island Radio',
        description: 'Ad-free music and audio for kids'
    },
    {
        icon: Palette,
        label: 'Activities',
        description: 'Printables, games, and crafts'
    },
    {
        icon: Users,
        label: 'Monthly Drops',
        description: 'New character content each month'
    }
];

export default function SolutionDefinition({ content }: { content: any }) {
    const { identity_section } = content || {};

    const displayFeatures = [
        {
            icon: BookOpen,
            label: 'Stories',
            description: 'Caribbean tales with learning built in'
        },
        {
            icon: Radio,
            label: 'Island Radio',
            description: 'Ad-free music and audio for kids'
        },
        {
            icon: Palette,
            label: 'Activities',
            description: 'Printables, games, and crafts'
        },
        {
            icon: Users,
            label: 'Monthly Drops',
            description: 'New character content each month'
        }
    ];

    return (
        <section className="py-32 relative overflow-hidden bg-white">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-emerald-50/30 to-white pointer-events-none" />

            <div className="container relative z-10">
                <div className="max-w-6xl mx-auto text-center space-y-16">
                    <div className="space-y-4">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100/50 text-emerald-700 text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-200">
                            The Solution
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-deep leading-tight tracking-tight">
                            {identity_section?.solution_text || "A Cultural Learning Universe for Caribbean Kids"}
                        </h2>
                        <div className="h-2 w-24 bg-emerald-500 mx-auto rounded-full shadow-lg shadow-emerald-500/20" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {displayFeatures.map((feature) => (
                            <div
                                key={feature.label}
                                className="glass-card p-10 shadow-premium border border-slate-100 hover:shadow-2xl hover:border-emerald-200 transition-all group"
                                style={{ borderRadius: '2.5rem' }}
                            >
                                <div className="w-20 h-20 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-inner">
                                    <feature.icon className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h3 className="text-xl font-black text-deep mb-3">{feature.label}</h3>
                                <p className="text-sm text-deep/60 leading-relaxed font-bold uppercase tracking-wider text-[10px]">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
