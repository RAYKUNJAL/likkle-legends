'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ShieldCheck, Play, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';

export default function VideoHero() {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [showTrailer, setShowTrailer] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const bgVideoSrc = "https://player.vimeo.com/external/370331493.sd.mp4?s=7b9473b6441bf93d8b37492c101d2c206b0d91d1&profile_id=164&oauth2_token_id=57447761";
    const fallbackImg = "/images/parent-child-smiling.png";

    const trustBadges = [
        { icon: <ShieldCheck size={15} className="text-emerald-400" />, label: 'Ad-Free & Kid-Safe' },
        { icon: '📬', label: 'Ships Worldwide' },
        { icon: '🌴', label: '500+ Families' },
        { icon: '⭐', label: '4.9/5 Parent Rating' },
    ];

    return (
        <>
            {/* ── Trailer Modal ── */}
            <AnimatePresence>
                {showTrailer && (
                    <motion.div
                        key="trailer"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
                        onClick={() => setShowTrailer(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-3xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowTrailer(false)}
                                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full flex items-center justify-center transition-all"
                            >
                                <X size={20} className="text-white" />
                            </button>
                            {/* Embed our looping promo video — same source as the bg video */}
                            <video
                                autoPlay
                                controls
                                className="w-full h-full object-cover"
                                src={bgVideoSrc}
                            >
                                <track kind="captions" src="/captions/landing-promo-en.vtt" srcLang="en" label="English" default />
                                <track kind="captions" src="/captions/landing-promo-es.vtt" srcLang="es" label="Español" />
                            </video>
                        </motion.div>
                        <p className="absolute bottom-6 text-white/40 text-sm font-bold">
                            Click anywhere to close
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-orange-950">

                {/* ── 1. Video Background ── */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black/50 z-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-orange-950 z-10" />
                    <video
                        ref={videoRef}
                        autoPlay muted loop playsInline
                        onCanPlay={() => setIsVideoLoaded(true)}
                        className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
                        poster={fallbackImg}
                    >
                        <source src={bgVideoSrc} type="video/mp4" />
                    </video>
                    {!isVideoLoaded && (
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${fallbackImg})` }}
                        />
                    )}
                </div>

                {/* ── 2. Content ── */}
                <div className="relative z-20 flex flex-col items-center text-center px-6 pt-24 pb-16 max-w-5xl mx-auto w-full">

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full border border-white/20 bg-white/10 backdrop-blur-lg text-orange-300 text-sm font-black uppercase tracking-widest"
                    >
                        <Sparkles size={14} />
                        Featured in 15+ Countries · Now Enrolling
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.92] tracking-tight mb-6 drop-shadow-2xl"
                    >
                        Caribbean Stories & Letters<br />
                        <span className="text-orange-400">Delivered Monthly.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.25 }}
                        className="text-lg sm:text-xl md:text-2xl text-white/70 font-medium leading-relaxed max-w-2xl mb-12"
                    >
                        Help your child stay connected to their roots — wherever you live. A physical mail club + kid-safe digital portal for ages 4–8.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full justify-center"
                    >
                        <Link
                            href="/signup?plan=starter_mailer"
                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xl px-10 py-6 rounded-[2rem] shadow-2xl shadow-orange-500/40 hover:scale-[1.03] transition-all group"
                        >
                            <s className="text-orange-300 text-base">$19.99</s> Try for $10
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button
                            onClick={() => setShowTrailer(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 text-white font-black text-lg px-8 py-6 rounded-[2rem] transition-all"
                        >
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                <Play size={14} fill="white" />
                            </div>
                            See what kids love
                        </button>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-white/40 text-sm font-bold mb-10"
                    >
                        🔒 No commitment · Cancel anytime · Secure checkout via Stripe
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="flex flex-wrap items-center justify-center gap-4"
                    >
                        {trustBadges.map((b, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white/60 text-sm font-bold">
                                <span>{b.icon}</span>
                                {b.label}
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* ── 3. Scroll Gradient ── */}
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#FFFDF7] to-transparent z-10 pointer-events-none" />
            </section>
        </>
    );
}
