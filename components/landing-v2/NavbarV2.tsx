"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

export const NavbarV2 = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4 bg-white/80 backdrop-blur-xl shadow-xl' : 'py-8 bg-transparent'}`}>
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="relative w-48 h-12 block hover:scale-105 transition-transform">
                    <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain" priority />
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center gap-12">
                    <Link href="#features" className="text-deep/60 hover:text-primary font-black uppercase tracking-widest text-xs transition-colors">Digital Magic</Link>
                    <Link href="#about" className="text-deep/60 hover:text-primary font-black uppercase tracking-widest text-xs transition-colors">The Envelope</Link>
                    <Link href="#pricing" className="text-deep/60 hover:text-primary font-black uppercase tracking-widest text-xs transition-colors">Pricing</Link>

                    <div className="flex items-center gap-4 border-l border-zinc-200 pl-8 ml-4">
                        <Link href="/login" className="text-deep/60 hover:text-primary font-black uppercase tracking-widest text-xs transition-colors">Sign In</Link>
                        <Link
                            href="#pricing"
                            className="group flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-105 transition-all active:scale-95"
                        >
                            Get Started ($10)
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button className="lg:hidden w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-deep" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "100vh" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-zinc-100 p-8 flex flex-col gap-8 z-50 overflow-hidden"
                    >
                        <Link href="#features" onClick={() => setIsOpen(false)} className="text-3xl font-black text-deep tracking-tighter">Digital Magic</Link>
                        <Link href="#about" onClick={() => setIsOpen(false)} className="text-3xl font-black text-deep tracking-tighter">The Envelope</Link>
                        <Link href="#pricing" onClick={() => setIsOpen(false)} className="text-3xl font-black text-deep tracking-tighter">Pricing</Link>

                        <div className="mt-auto space-y-4">
                            <Link href="/login" className="block text-center py-6 font-black text-deep uppercase tracking-widest border-2 border-zinc-100 rounded-[2rem]">Sign In</Link>
                            <Link href="#pricing" className="group flex items-center justify-center gap-4 py-8 bg-primary text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30">
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
