"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Facebook, Mail, Sparkles, ArrowRight, ShieldCheck, Globe } from "lucide-react";

export const FooterV2 = () => {
    return (
        <>
            <footer className="bg-deep text-white pt-20 sm:pt-32 lg:pt-48 pb-16 sm:pb-32 relative overflow-hidden">
                {/* Background Decorative Blobs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -mr-96 -mt-96"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] -ml-96 -mb-96"></div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10">
                    <div className="flex flex-col xl:flex-row gap-12 sm:gap-20 lg:gap-32 mb-12 sm:mb-32 pb-12 sm:pb-32 border-b border-white/5">
                        {/* Brand Column */}
                        <div className="flex-1 space-y-6 sm:space-y-12">
                            <Link href="/" className="relative w-40 sm:w-64 h-12 sm:h-16 block transition-transform hover:scale-105">
                                <Image
                                    src="/images/logo.png"
                                    alt="Likkle Legends"
                                    fill
                                    className="object-contain brightness-0 invert"
                                    priority
                                />
                            </Link>
                            <p className="text-white/50 font-medium text-base sm:text-2xl leading-relaxed max-w-xl italic">
                                "Preserving the heartbeat of Caribbean culture, one personalized story at a time. Empowering the next generation of diaspora heroes."
                            </p>
                            <div className="flex gap-3 sm:gap-6">
                                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                    <a key={i} href="#" className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center hover:bg-primary transition-all duration-500 border border-white/5 hover:-translate-y-2">
                                        <Icon size={20} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Links Grid */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-16 lg:gap-24">
                            <div className="space-y-5 sm:space-y-10">
                                <h4 className="text-primary font-black uppercase tracking-[0.3em] text-xs">Universe</h4>
                                <ul className="space-y-3 sm:space-y-6">
                                    {[
                                        { name: 'Digital Magic', href: '#features' },
                                        { name: 'The Envelope', href: '#about' },
                                        { name: 'Island Radio', href: '#' },
                                        { name: 'Story Studio', href: '/portal' }
                                    ].map(item => (
                                        <li key={item.name}><Link href={item.href} className="text-white/40 hover:text-white font-bold transition-all text-sm uppercase tracking-widest">{item.name}</Link></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-5 sm:space-y-10">
                                <h4 className="text-primary font-black uppercase tracking-[0.3em] text-xs">Coalition</h4>
                                <ul className="space-y-3 sm:space-y-6">
                                    {[
                                        { name: 'Waitlist', href: '/waitlist' },
                                        { name: 'Affiliates', href: '#' },
                                        { name: 'Heritage Blog', href: '/blog' },
                                        { name: 'Educators', href: '/educators' }
                                    ].map(item => (
                                        <li key={item.name}><Link href={item.href} className="text-white/40 hover:text-white font-bold transition-all text-sm uppercase tracking-widest">{item.name}</Link></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="hidden lg:block space-y-5 sm:space-y-10">
                                <h4 className="text-secondary font-black uppercase tracking-[0.3em] text-xs">Legals</h4>
                                <ul className="space-y-3 sm:space-y-6">
                                    {[
                                        { name: 'Guarantee', href: '/guarantee' },
                                        { name: 'Privacy', href: '#' },
                                        { name: 'Terms', href: '#' },
                                        { name: 'Contact', href: '/contact' }
                                    ].map(item => (
                                        <li key={item.name}><Link href={item.href} className="text-white/40 hover:text-white font-bold transition-all text-sm uppercase tracking-widest">{item.name}</Link></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-12">
                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
                                <Globe size={16} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Global Shipping Active</span>
                            </div>
                            <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-full border border-white/10">
                                <ShieldCheck size={16} className="text-success" />
                                <span className="text-[10px] font-black uppercase tracking-widest">COPPA Secure</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                            © 2026 Likkle Legends. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Sticky High-Conversion Pill */}
            <div className="fixed bottom-6 sm:bottom-12 left-0 right-0 z-[90] pointer-events-none px-3 sm:px-6">
                <div className="container mx-auto flex justify-center lg:justify-end pointer-events-auto">
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 2, duration: 1 }}
                        whileHover={{ scale: 1.05 }}
                        className="p-1 group relative cursor-pointer"
                    >
                        {/* Halo Effect */}
                        <div className="absolute inset-0 bg-primary-gradient rounded-full blur-[20px] opacity-40 group-hover:opacity-80 transition-opacity animate-neural-halo"></div>

                        <Link href="#pricing" className="relative flex items-center gap-3 sm:gap-6 bg-white px-5 sm:px-10 py-3 sm:py-5 rounded-full shadow-premium-xl border-4 sm:border-[6px] border-primary">
                            <div className="w-9 h-9 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                            </div>
                            <div className="pr-6 sm:pr-12">
                                <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1">Limited Time</p>
                                <p className="text-sm sm:text-xl font-black text-deep leading-none tracking-tighter uppercase italic">Get the $10 Legend Letter</p>
                            </div>
                            <div className="absolute right-2 sm:right-4 w-9 h-9 sm:w-12 sm:h-12 bg-deep rounded-full flex items-center justify-center text-white group-hover:translate-x-2 transition-transform shadow-xl">
                                <ArrowRight size={20} />
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </>
    );
};
