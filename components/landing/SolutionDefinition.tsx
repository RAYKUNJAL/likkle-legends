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
        <section className="py-24 bg-gradient-to-b from-white to-emerald-50/50">
            <div className="container">
                <div className="max-w-4xl mx-auto text-center space-y-12">
                    <div className="space-y-4">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                            The Solution
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-deep leading-tight">
                            {identity_section?.solution_text || "A Cultural Learning Universe for Caribbean Kids"}
                        </h2>
                        <div className="h-1.5 w-24 bg-emerald-500 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {displayFeatures.map((feature) => (
                            <div
                                key={feature.label}
                                className="bg-white rounded-[2rem] p-8 shadow-sm border border-zinc-100 hover:shadow-xl hover:border-emerald-200 transition-all group"
                            >
                                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                    <feature.icon className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="font-bold text-deep mb-2">{feature.label}</h3>
                                <p className="text-sm text-deep/60 leading-relaxed font-medium">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
