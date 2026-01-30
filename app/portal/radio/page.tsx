"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Radio as RadioIcon, Sparkles } from 'lucide-react';
import TantyRadio from '@/components/TantyRadio';

export default function RadioPortalPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/portal" className="p-2.5 hover:bg-gray-100 rounded-2xl transition-colors">
                            <ArrowLeft size={24} className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="font-heading font-black text-2xl text-blue-950 flex items-center gap-2">
                                <RadioIcon className="text-orange-500 animate-pulse" />
                                Tanty's Island Radio
                            </h1>
                            <p className="text-xs font-bold text-blue-900/40 uppercase tracking-widest">Live Broadcast from the Spice Islands</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <span className="px-4 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 mb-4">
                        <Sparkles size={14} /> Feel de Rhythm
                    </span>
                    <h2 className="text-4xl md:text-5xl font-heading font-black text-blue-950 mb-4">
                        Turn Up de Bass!
                    </h2>
                    <p className="text-lg text-blue-900/60 max-w-2xl mx-auto mb-6">
                        Tune in to Tanty's curated channels. From island stories to de latest Soca beats,
                        dere's a rhythm for every moment.
                    </p>
                    <Link href="/portal/store" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-purple-200 hover:scale-105 transition-transform">
                        <Sparkles size={18} /> Visit Music Store
                    </Link>
                </div>

                {/* The Radio Component */}
                <div className="relative">
                    {/* Decorative elements */}
                    <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-orange-400/10 rounded-full blur-3xl -z-10" />
                    <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10" />

                    <TantyRadio />
                </div>

                {/* Engagement Section */}
                <div className="mt-24 grid md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[3rem] p-10 border-4 border-orange-50 shadow-xl">
                        <h3 className="text-2xl font-heading font-black text-blue-950 mb-4 flex items-center gap-3">
                            <span className="text-3xl">🎤</span> Tanty's Snippets
                        </h3>
                        <p className="text-blue-900/60 font-medium mb-6">
                            Tap de radio screen to hear Tanty's famous island phrases.
                            She always got a sweet word for her Likkle Legends!
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {["Eh-eh!", "Irie!", "Sweet!", "Yes, suh!"].map(s => (
                                <span key={s} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-bold">{s}</span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                        <h3 className="text-2xl font-heading font-black mb-4 flex items-center gap-3 relative z-10">
                            <span className="text-3xl">🎚️</span> Island Mix
                        </h3>
                        <p className="text-white/80 font-medium mb-6 relative z-10">
                            Did you know you can switch channels? Try de 'Soca' channel for dancing
                            or 'Story' for a calm afternoon lime.
                        </p>
                        <Link href="/portal?sec=songs" className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform">
                            Explore All Music
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
