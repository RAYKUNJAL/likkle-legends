'use client';

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface VideoHeroProps {
    headline?: string;
    subheadline?: string;
}

export default function VideoHero({
    headline = "Raise Proud, Confident Caribbean Kids.",
    subheadline = "The monthly mail club that delivers personalized letters, cultural activities, and AI-powered stories to help your child love their roots."
}: VideoHeroProps) {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    // Using a high-quality Caribbean landscape video from Pexels as a premium placeholder
    // In production, this would be a hosted .mp4/m3u8 from the platform's CDN
    const videoSrc = "https://player.vimeo.com/external/370331493.sd.mp4?s=7b9473b6441bf93d8b37492c101d2c206b0d91d1&profile_id=164&oauth2_token_id=57447761";
    const posterImg = "/images/parent-child-smiling.png";

    return (
        <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden bg-orange-950">
            {/* 1. Cinematic Video Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark overlay for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-orange-950/80 z-10" />

                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    onCanPlay={() => setIsVideoLoaded(true)}
                    className={`w-full h-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    poster={posterImg}
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>

                {/* Fallback pattern while loading */}
                {!isVideoLoaded && (
                    <div
                        className="absolute inset-0 bg-cover bg-center animate-pulse"
                        style={{ backgroundImage: `url(${posterImg})` }}
                    />
                )}
            </div>

            {/* 2. Content Overlay */}
            <div className="container relative z-20 mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-orange-200 text-sm font-black uppercase tracking-[0.2em] mb-8">
                        <Sparkles size={16} className="text-orange-400" />
                        <span>Trusted by 500+ Families Worldwide</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.95] tracking-tight mb-8 drop-shadow-2xl">
                        {headline.split(' ').map((word, i) => (
                            <span key={i} className={word.toLowerCase() === 'caribbean' ? 'text-orange-400' : ''}>
                                {word}{' '}
                            </span>
                        ))}
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-white/80 font-medium max-w-2xl mx-auto mb-12 leading-relaxed drop-shadow-lg">
                        {subheadline}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            href="/signup"
                            className="w-full sm:w-auto px-10 py-6 bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-[2rem] shadow-2xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
                        >
                            Join the Legends 🚀
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button className="w-full sm:w-auto px-10 py-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black text-xl rounded-[2rem] hover:bg-white/20 transition-all flex items-center justify-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Play size={16} fill="white" />
                            </div>
                            Watch Trailer
                        </button>
                    </div>

                    {/* Trust Row */}
                    <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-70">
                        {['Monthly Mail Packs', 'Kid-Safe Digital Portal', 'Cultural AI Buddy'].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-white font-bold text-sm">
                                <CheckCircle2 size={18} className="text-orange-400" />
                                {item}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* 3. Bottom Gradient Transition */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-orange-50 to-transparent z-10" />
        </section>
    );
}
