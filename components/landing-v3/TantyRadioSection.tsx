'use client';

import TantyRadio from '@/components/TantyRadio';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Track } from '@/lib/types';

const LANDING_TRACKS: Track[] = [
    { id: 'track-9a',  title: 'Island Alphabet',       artist: 'R.O.T.I',        url: 'https://cdn1.suno.ai/614d60d0-dce6-4fdf-8c65-4f6efdec40a3.mp3', channel: 'roti' },
    { id: 'track-11a', title: 'Coco Water',            artist: 'Tanty Spice',    url: 'https://cdn1.suno.ai/ed6d7539-ed37-4f21-a06c-73142ea2129d.mp3', channel: 'tanty_spice' },
    { id: 'track-8a',  title: 'Island Counting',       artist: 'R.O.T.I',        url: 'https://cdn1.suno.ai/d85cfbfe-41ac-4694-9000-54b8ab87f460.mp3', channel: 'roti' },
    { id: 'track-1',   title: 'Angry Rooster',         artist: 'Dilly Doubles',  url: 'https://cdn1.suno.ai/c5e7a4d5-3154-4a42-9106-e33f446b9b4b.mp3', channel: 'dilly_doubles'  },
    { id: 'track-2',   title: 'Sorell Drink',          artist: 'Tanty Spice',    url: 'https://cdn1.suno.ai/3f649c16-75ff-43de-99d6-17e4534d716b.mp3', channel: 'tanty_spice'  },
    { id: 'track-6a',  title: 'Island Parrots',        artist: 'Steelpan Sam',   url: 'https://cdn1.suno.ai/ee0e94a6-d116-4116-992e-7ecb8fd76109.mp3', channel: 'steelpan_sam'  },
    { id: 'track-7a',  title: 'Iguana Song',           artist: 'Steelpan Sam',   url: 'https://cdn1.suno.ai/0303769f-299a-40dd-bc6a-890c405dbb07.mp3', channel: 'steelpan_sam'  },
    { id: 'track-10a', title: 'Likkle Legends Jingle', artist: 'R.O.T.I',        url: 'https://cdn1.suno.ai/b792349c-09ad-4d94-8e96-ef4077b39209.mp3', channel: 'roti' },
    { id: 'track-5',   title: 'Island Monkeys',        artist: 'Dilly Doubles',  url: 'https://cdn1.suno.ai/6d2d490e-2cd6-4593-898d-ee6c82d7b4b8.mp3', channel: 'dilly_doubles'  },
];

export function TantyRadioSection() {
    return (
        <section id="radio" className="py-24 relative overflow-hidden bg-slate-900">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-900 via-[var(--deep)] to-slate-900 opacity-80" />

            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--caribbean-ocean)]/10 rounded-full blur-[100px] animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--caribbean-sun)]/10 rounded-full blur-[100px] animate-pulse-slow delay-1000" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[var(--caribbean-sun)] font-bold text-sm mb-4"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span className="uppercase tracking-widest">Live from the Island</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white"
                    >
                        Tune into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--caribbean-sun)] to-[var(--caribbean-mango)]">Likkle Legends Radio</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed mb-10"
                    >
                        A safe, ad-free listening space for kids. Nursery rhymes, island sounds, and learning songs across all four DJ segments.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <a
                            href="/radio"
                            className="px-8 py-4 bg-[var(--caribbean-sun)] text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-[var(--caribbean-sun)]/20 flex items-center gap-2"
                        >
                            Listen Free Radio
                        </a>
                        <a
                            href="/signup?plan=legends_plus"
                            className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all flex items-center gap-2"
                        >
                            Unlock Premium Radio
                        </a>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <TantyRadio featuredTracks={LANDING_TRACKS} defaultChannel="roti" />
                </motion.div>
            </div>
        </section>
    );
}
