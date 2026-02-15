'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Play, Layout, Users, MousePointer2 } from 'lucide-react';
import { useGeo } from '../GeoContext';
import { trackEvent } from '@/lib/analytics';
import Image from 'next/image';

const SLIDES = [
    {
        id: 'island',
        title: "Choose an island theme",
        description: "Pick from Trinidad, Jamaica, Barbados, Haiti, and more.",
        icon: Layout,
        color: 'from-blue-400 to-blue-600',
        content: "Explore 30+ Islands",
        image: '/images/island-pattern.png'
    },
    {
        id: 'character',
        title: "Choose a character guide",
        description: "Learn with R.O.T.I, Tanti Spice, or Dilly Doubles.",
        icon: Users,
        color: 'from-amber-400 to-amber-600',
        content: "Your Personal Guide",
        image: '/images/roti-expressions.jpg'
    },
    {
        id: 'choices',
        title: "Make choices in the story",
        description: "Your child decides what the character brings on their adventure.",
        icon: MousePointer2,
        color: 'from-emerald-400 to-emerald-600',
        content: "Choose Your Own Path",
        image: '/images/digital-portal.png'
    }
];

export default function CarouselDemo() {
    const [current, setCurrent] = useState(0);
    const { variant } = useGeo();

    const isUSA = variant === 'USA_MAIL_FIRST';

    const next = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
    const prev = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

    const ctaAction = (id: string, label: string) => {
        trackEvent('ll_cta_click', { cta_id: id, label, variant });
        if (id.includes('FREE')) window.location.href = '/signup?flow=FREE_ONBOARDING';
        else if (id.includes('INTRO')) window.location.href = '#offer';
        else window.location.href = '#plans';
    };

    return (
        <section id="story-studio" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-black text-deep leading-tight"
                    >
                        Story Studio: Your Child Chooses What Happens Next
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-lg md:text-xl text-deep/60 leading-relaxed"
                    >
                        Interactive island stories that teach reading, culture, and confidence—without feeling like school.
                    </motion.p>
                </div>

                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Left: Controls & Context */}
                    <div className="flex-1 w-full order-2 lg:order-1">
                        <div className="space-y-4">
                            {SLIDES.map((slide, idx) => (
                                <button
                                    key={slide.id}
                                    onClick={() => setCurrent(idx)}
                                    className={`w-full text-left p-6 rounded-3xl transition-all border-2 ${current === idx ? 'bg-zinc-50 border-emerald-500 shadow-xl shadow-emerald-500/5' : 'bg-white border-zinc-100 hover:border-zinc-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${slide.color} flex items-center justify-center text-white`}>
                                            <slide.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-deep mb-1">{slide.title}</h3>
                                            <p className="text-sm text-deep/60 font-medium leading-tight">{slide.description}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-12 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => ctaAction('DEMO_FREE', 'Start Free Forever')}
                                className="px-8 py-4 bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all text-center"
                            >
                                Start Free Forever
                            </button>
                            {isUSA ? (
                                <button
                                    onClick={() => ctaAction('DEMO_INTRO', 'Get $10 Intro')}
                                    className="px-8 py-4 bg-amber-500 text-white font-black rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all text-center"
                                >
                                    Get the $10 Intro Envelope
                                </button>
                            ) : (
                                <button
                                    onClick={() => ctaAction('DEMO_DIGITAL', 'Unlock Digital')}
                                    className="px-8 py-4 bg-white text-deep border-2 border-emerald-100 font-black rounded-2xl hover:bg-emerald-50 transition-all text-center"
                                >
                                    Unlock Full Digital Access
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: The Demo Mockup */}
                    <div className="flex-[1.2] w-full order-1 lg:order-2">
                        <div className="relative aspect-[4/3] bg-zinc-900 rounded-[2.5rem] border-[12px] border-zinc-800 shadow-2xl overflow-hidden group">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={current}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={SLIDES[current].image}
                                        alt={SLIDES[current].title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                                        <div className="z-10 text-center p-8">
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/20">
                                                <Play className="fill-white w-6 h-6" />
                                            </div>
                                            <div className="text-3xl font-black mb-2 tracking-tight">{SLIDES[current].content}</div>
                                            <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Previewing Story Studio Phase</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {/* UI Overlay */}
                            <div className="absolute top-6 right-6 z-20">
                                <div className="px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white text-xs font-bold uppercase tracking-widest">
                                    Interactive Demo
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                                <button onClick={prev} className="w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                                    <ChevronLeft className="text-white w-5 h-5" />
                                </button>
                                <div className="flex gap-2">
                                    {SLIDES.map((_, i) => (
                                        <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'w-6 bg-emerald-500' : 'bg-white/20'}`} />
                                    ))}
                                </div>
                                <button onClick={next} className="w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                                    <ChevronRight className="text-white w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-3">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-200" />)}
                            </div>
                            <p className="text-sm font-bold text-deep/40 italic">"Just like the real app experience!" — Legend Parent</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
