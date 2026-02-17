"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Facebook, Mail, Sparkles } from "lucide-react";

export const FooterV2 = () => {
    return (
        <>
            <footer className="bg-zinc-950 text-white pt-32 pb-48 relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-4 gap-16 lg:gap-24 mb-24 pb-24 border-b border-white/5">
                        <div className="lg:col-span-1 space-y-8">
                            <Link href="/" className="relative w-48 h-12 block">
                                <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain brightness-0 invert" priority />
                            </Link>
                            <p className="text-white/40 font-medium leading-relaxed">
                                Don't let the culture fade. Give them a story to call their own. Proudly born in the Caribbean, shared with the world.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-primary transition-all"><Instagram size={20} /></a>
                                <a href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-primary transition-all"><Twitter size={20} /></a>
                                <a href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-primary transition-all"><Facebook size={20} /></a>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h4 className="text-primary font-black uppercase tracking-[0.2em] text-xs">Explore</h4>
                            <ul className="space-y-4">
                                <li><Link href="#" className="text-white/60 hover:text-white font-bold transition-all">Digital Universe</Link></li>
                                <li><Link href="#" className="text-white/60 hover:text-white font-bold transition-all">Tanty Spice</Link></li>
                                <li><Link href="#" className="text-white/60 hover:text-white font-bold transition-all">Island Radio</Link></li>
                                <li><Link href="#" className="text-white/60 hover:text-white font-bold transition-all">Story Studio</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-8">
                            <h4 className="text-primary font-black uppercase tracking-[0.2em] text-xs">Community</h4>
                            <ul className="space-y-4">
                                <li><Link href="#" className="text-white/60 hover:text-white font-bold transition-all">Wholesale / Schools</Link></li>
                                <li><Link href="#" className="text-white/60 hover:text-white font-bold transition-all">Affiliate Program</Link></li>
                                <li><Link href="#" className="text-white/60 hover:text-white font-bold transition-all">Heritage Blog</Link></li>
                                <li><Link href="#" className="text-white/60 hover:text-white font-bold transition-all">Help Center</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-8">
                            <h4 className="text-primary font-black uppercase tracking-[0.2em] text-xs">Newsletter</h4>
                            <p className="text-white/40 font-medium leading-relaxed text-sm">Join 2,000+ parents getting weekly island magic tips.</p>
                            <form className="flex gap-2">
                                <input type="email" placeholder="Email Address" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all" />
                                <button className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"><Mail size={20} /></button>
                            </form>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-xs font-bold text-white/20 uppercase tracking-[0.2em]">
                        <p>© 2026 Likkle Legends. All Rights Reserved.</p>
                        <div className="flex gap-8">
                            <Link href="#" className="hover:text-primary transition-all">Privacy Policy</Link>
                            <Link href="#" className="hover:text-primary transition-all">Terms of Service</Link>
                            <Link href="#" className="hover:text-primary transition-all">COPPA Compliance</Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Sticky Mobile/Desktop CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-[90] p-6 lg:bg-transparent pointer-events-none">
                <div className="container mx-auto max-w-7xl flex justify-center md:justify-end pointer-events-auto">
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="bg-primary text-white px-8 py-5 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(255,107,0,0.5)] flex items-center gap-6 group hover:scale-105 transition-all cursor-pointer border-4 border-white/20 animate-neural-halo"
                    >
                        <div className="hidden sm:block">
                            <p className="text-[10px] uppercase font-black tracking-widest text-white/60 leading-none mb-1">Limited Time</p>
                            <p className="font-black text-lg tracking-tight leading-none uppercase">Get the $10 Legend Letter</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};
