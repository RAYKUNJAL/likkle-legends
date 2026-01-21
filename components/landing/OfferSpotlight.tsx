'use client';

import Link from 'next/link';
import { ArrowRight, Mail, Palette, Music, BookOpen, FileText, Gift, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const physicalItems = [
    {
        icon: Mail,
        title: 'Character Letter',
        description: 'A personalized letter from a character to your child'
    },
    {
        icon: Palette,
        title: 'Activity Page',
        description: 'Fun coloring and learning activities'
    }
];

const digitalUnlocks = [
    {
        icon: Music,
        title: 'Songs & Island Radio',
        description: 'Caribbean learning songs and ad-free listening'
    },
    {
        icon: BookOpen,
        title: 'Mini Story',
        description: 'Read-along or audio story featuring the character'
    },
    {
        icon: FileText,
        title: 'Flash Cards',
        description: 'Printable learning pack for letters, numbers, colors'
    },
    {
        icon: Gift,
        title: 'Club-only Surprise',
        description: 'Rotating bonus: wallpaper, stickers, or mini-game'
    }
];

const faqs = [
    {
        q: 'Is this too screen-heavy?',
        a: 'The mail creates an offline moment. Digital content is optional and guided by parents.'
    },
    {
        q: 'Is it safe?',
        a: 'Built for kids with ad-free listening and parent-friendly learning tools. No chat or social features.'
    }
];

export default function OfferSpotlight() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <section id="offer" className="py-20 bg-gradient-to-b from-amber-50 to-orange-50/50">
            <div className="container">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 space-y-4">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-200 text-amber-800 text-xs font-bold uppercase tracking-widest">
                            Start Here
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-deep leading-tight">
                            The $10 Cultural Mail{' '}
                            <span className="text-amber-600">Intro Experience</span>
                        </h2>
                        <p className="text-lg text-deep/70 max-w-xl mx-auto">
                            A small envelope. A big moment.
                        </p>
                    </div>

                    {/* Value Stack */}
                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        {/* Physical Mail */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-amber-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">What Arrives</p>
                                    <h3 className="font-bold text-deep text-lg">In The Envelope</h3>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {physicalItems.map((item) => (
                                    <div key={item.title} className="flex gap-4 items-start">
                                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                                            <item.icon className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-deep">{item.title}</h4>
                                            <p className="text-sm text-deep/60">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Digital Unlock */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-emerald-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Gift className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">What It Unlocks</p>
                                    <h3 className="font-bold text-deep text-lg">Digital Bundle</h3>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {digitalUnlocks.map((item) => (
                                    <div key={item.title} className="flex gap-4 items-start">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                                            <item.icon className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-deep">{item.title}</h4>
                                            <p className="text-sm text-deep/60">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Microcopy */}
                    <p className="text-center text-deep/60 mb-8">
                        Every letter unlocks new digital content—turning mail into a moment kids look forward to.
                    </p>

                    {/* CTA */}
                    <div className="text-center mb-12">
                        <Link
                            href="/get-started"
                            className="inline-flex items-center gap-2 btn btn-primary btn-lg px-10 py-5 text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:scale-[1.02] transition-all group"
                        >
                            Try the $10 Intro Experience
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Mini FAQ */}
                    <div className="max-w-xl mx-auto">
                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white rounded-xl border border-zinc-200 overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
                                    >
                                        <span className="font-bold text-deep">{faq.q}</span>
                                        <ChevronDown className={`w-5 h-5 text-deep/40 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openFaq === idx && (
                                        <div className="px-5 pb-4 text-deep/70">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
