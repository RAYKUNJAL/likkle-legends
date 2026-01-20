'use client';

import { Rocket, GraduationCap, Heart, Mail, Smartphone, Users } from 'lucide-react';

const iconMap: Record<string, any> = {
    'age-path': Rocket,
    'mailbox': Mail,
    'digital-portal': Smartphone,
    'relationship': Users,
    'confidence': GraduationCap,
    'Start': Rocket,
    'Learn': GraduationCap,
    'Belong': Heart
};

const colorMapArray = ['emerald', 'blue', 'amber'];

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600', border: 'border-emerald-200' },
    blue: { bg: 'bg-blue-100', icon: 'text-blue-600', border: 'border-blue-200' },
    amber: { bg: 'bg-amber-100', icon: 'text-amber-600', border: 'border-amber-200' }
};

export default function HowItWorksV2({ content }: { content: any }) {
    const { how_it_works } = content;
    const stepsData = how_it_works?.steps || [];

    return (
        <section id="how-it-works" className="py-20 bg-white">
            <div className="container">
                <div className="text-center mb-14 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-black text-deep">
                        {how_it_works?.title || "How It Works"}
                    </h2>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {stepsData.map((step: any, idx: number) => {
                            const colorKey = colorMapArray[idx % colorMapArray.length];
                            const colors = colorMap[colorKey];
                            const Icon = iconMap[step.icon] || Heart;

                            return (
                                <div key={step.title} className="relative">
                                    {/* Connector line (hidden on mobile, visible between cards on desktop) */}
                                    {idx < stepsData.length - 1 && (
                                        <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-zinc-200" />
                                    )}

                                    <div className={`relative bg-white rounded-3xl p-8 border-2 ${colors.border} hover:shadow-xl transition-all group h-full`}>
                                        {/* Step number */}
                                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-deep text-white rounded-full flex items-center justify-center text-sm font-black">
                                            {idx + 1}
                                        </div>

                                        <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                            <Icon className={`w-8 h-8 ${colors.icon}`} />
                                        </div>

                                        <h3 className="text-xl font-black text-deep mb-3">{step.title}</h3>
                                        <p className="text-deep/60 leading-relaxed text-sm">{step.description || step.text}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
