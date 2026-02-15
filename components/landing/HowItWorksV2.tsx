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
        <section id="how-it-works" className="py-32 bg-white relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none" />

            <div className="container relative z-10">
                <div className="text-center mb-20 space-y-4">
                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">The Journey</span>
                    <h2 className="text-4xl md:text-5xl font-black text-deep tracking-tight">
                        {how_it_works?.title || "How It Works"}
                    </h2>
                    <div className="h-1.5 w-16 bg-blue-500 mx-auto rounded-full" />
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-10">
                        {stepsData.map((step: any, idx: number) => {
                            const colorKey = colorMapArray[idx % colorMapArray.length];
                            const colors = colorMap[colorKey];
                            const Icon = iconMap[step.icon] || Heart;

                            return (
                                <div key={step.title} className="relative">
                                    {/* Connector line (hidden on mobile, visible between cards on desktop) */}
                                    {idx < stepsData.length - 1 && (
                                        <div className="hidden md:block absolute top-1/2 left-[70%] w-[60%] h-px border-t-2 border-dashed border-slate-200 -translate-y-1/2 z-0" />
                                    )}

                                    <div
                                        className={`relative glass-card p-10 border border-slate-100 hover:shadow-2xl transition-all group h-full z-10`}
                                        style={{ borderRadius: '3rem', boxShadow: 'var(--shadow-premium)' }}
                                    >
                                        {/* Step number */}
                                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-deep text-white rounded-2xl flex items-center justify-center text-lg font-black shadow-lg">
                                            {idx + 1}
                                        </div>

                                        <div className={`w-20 h-20 ${colors.bg} rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner`}>
                                            <Icon className={`w-10 h-10 ${colors.icon}`} />
                                        </div>

                                        <h3 className="text-2xl font-black text-deep mb-4">{step.title}</h3>
                                        <p className="text-deep/60 leading-relaxed text-sm font-medium">{step.description || step.text}</p>
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
