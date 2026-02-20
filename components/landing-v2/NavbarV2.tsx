"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, Sparkles, User, ShoppingBag } from "lucide-react";

export const NavbarV2 = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 ${scrolled ? 'py-2 sm:py-3' : 'py-3 sm:py-6'}`}>
            <div className="container mx-auto px-3 sm:px-6">
                <div className={`transition-all duration-700 rounded-xl sm:rounded-[1.5rem] px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between ${scrolled ? 'bg-white/80 backdrop-blur-2xl shadow-premium border border-white/50' : 'bg-transparent'}`}>
                    <Link href="/" className="relative w-32 sm:w-48 h-10 sm:h-12 block group">
                        <Image
                            src="/images/logo.png"
                            alt="Likkle Legends"
                            fill
                            className="object-contain transition-transform duration-500 group-hover:scale-110"
                            priority
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-10">
                        <Link href="#features" className="text-deep/40 hover:text-primary font-black uppercase tracking-[0.2em] text-[14px] transition-all">Digital Magic</Link>
                        <Link href="#envelope" className="text-deep/40 hover:text-primary font-black uppercase tracking-[0.2em] text-[14px] transition-all">The Envelope</Link>
                        <Link href="#pricing" className="text-deep/40 hover:text-primary font-black uppercase tracking-[0.2em] text-[14px] transition-all">Pricing</Link>

                        <div className="flex items-center gap-6 ml-4 pl-4 border-l border-zinc-100">
                            <Link href="/login" className="p-3 bg-zinc-50 text-deep/60 rounded-2xl hover:bg-zinc-100 transition-all">
                                <User size={20} strokeWidth={2.5} />
                            </Link>
                            <Link
                                href="/checkout"
                                className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs tracking-[0.2em] uppercase shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all overflow-hidden"
                            >
                                <span className="relative z-10">Get Started</span>
                                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                <div className="absolute inset-0 bg-primary-gradient opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="lg:hidden w-10 h-10 sm:w-12 sm:h-12 bg-white/50 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center text-deep shadow-sm border border-white" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden absolute top-full left-0 right-0 m-3 sm:m-6 p-6 sm:p-8 bg-white/95 backdrop-blur-3xl rounded-2xl sm:rounded-[3rem] shadow-premium-xl border border-white flex flex-col gap-5 sm:gap-8 z-50 overflow-hidden"
                    >
                        <Link href="#features" onClick={() => setIsOpen(false)} className="text-2xl sm:text-4xl font-black text-deep tracking-tighter hover:text-primary transition-colors">Digital Magic</Link>
                        <Link href="#envelope" onClick={() => setIsOpen(false)} className="text-2xl sm:text-4xl font-black text-deep tracking-tighter hover:text-primary transition-colors">The Envelope</Link>
                        <Link href="#pricing" onClick={() => setIsOpen(false)} className="text-2xl sm:text-4xl font-black text-deep tracking-tighter hover:text-primary transition-colors">Pricing</Link>

                        <div className="pt-5 sm:pt-8 border-t border-zinc-50 flex flex-col gap-3 sm:gap-4">
                            <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-3 py-4 sm:py-6 bg-zinc-50 text-deep font-black uppercase tracking-widest text-xs rounded-xl sm:rounded-[2rem]">
                                <User size={18} /> Parent Login
                            </Link>
                            <Link href="/checkout" onClick={() => setIsOpen(false)} className="group flex items-center justify-center gap-3 sm:gap-4 py-5 sm:py-8 bg-primary-gradient text-white rounded-xl sm:rounded-[2rem] font-black text-base sm:text-xl shadow-2xl shadow-primary/30">
                                Get Started ($10)
                                <Sparkles size={24} className="animate-pulse" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};
