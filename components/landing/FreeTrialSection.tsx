'use client';

import Link from 'next/link';
import { ArrowRight, Music, BookOpen, Palette, Users } from 'lucide-react';

const trialIncludes = [
    { icon: Users, label: '1 character intro' },
    { icon: Music, label: '1 song sample' },
    { icon: BookOpen, label: '1 mini story' },
    { icon: Palette, label: '1 activity' }
];

export default function FreeTrialSection() {
    return (
        <section className="py-16 bg-white">
            <div className="container">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-gradient-to-br from-zinc-50 to-blue-50/50 rounded-3xl p-8 md:p-10 border border-zinc-200">
                        <div className="text-center space-y-6">
                            <h2 className="text-2xl md:text-3xl font-black text-deep">
                                Not Ready Yet?{' '}
                                <span className="text-blue-600">Start Free.</span>
                            </h2>

                            <p className="text-deep/70 max-w-lg mx-auto">
                                Meet one character, hear a song, enjoy a mini story, and try an activity—no payment required.
                            </p>

                            <div className="flex flex-wrap justify-center gap-3">
                                {trialIncludes.map((item) => (
                                    <div
                                        key={item.label}
                                        className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-zinc-200 text-sm font-medium text-deep"
                                    >
                                        <item.icon className="w-4 h-4 text-blue-500" />
                                        {item.label}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2">
                                <Link
                                    href="/get-started"
                                    className="inline-flex items-center gap-2 btn bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg transition-all group"
                                >
                                    Start Free Digital Trial
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            <p className="text-sm text-deep/50">
                                Most families start with the $10 mail experience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
