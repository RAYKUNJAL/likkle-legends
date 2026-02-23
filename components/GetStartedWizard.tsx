"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Star, Heart, MapPin, Sparkles, ShieldCheck, Search } from 'lucide-react';
import { CARIBBEAN_ISLANDS } from '@/lib/islands';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GetStartedWizard() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState({
        childName: '',
        ageGroup: '',
        island: '',
    });

    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    // Filter islands based on search
    const filteredIslands = CARIBBEAN_ISLANDS.filter(island =>
        island.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Step 1: Name
    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.childName) setStep(1);
    };

    // Step 2: Age
    const selectAge = (age: string) => {
        setData({ ...data, ageGroup: age });
        setStep(2);
    };

    // Step 3: Island
    const selectIsland = (island: { name: string; flag: string }) => {
        setData({ ...data, island: island.name });
        setStep(3);
        setTimeout(() => setStep(4), 1500);
    };

    // Step 4: Recommendation (Redirect Logic)
    const handlePlanSelect = (plan: string) => {
        // Redirect to signup first to create account, then it will auto-redirect to checkout
        router.push(`/signup?plan=${plan}&referral=quiz&childName=${encodeURIComponent(data.childName)}`);
    };

    const slideVariants = {
        enter: { x: 50, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 },
    };

    if (!mounted) return null;

    return (
        <div className="w-full max-w-2xl mx-auto min-h-[500px] flex flex-col relative">
            {/* Progress Bar */}
            <div className="w-full h-2 bg-zinc-100 rounded-full mb-8 overflow-hidden">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div
                        key="step0"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="flex-1 flex flex-col justify-center items-center text-center space-y-8"
                    >
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-4xl mb-4">👋</div>
                        <h2 className="text-4xl lg:text-5xl font-black text-deep leading-tight">Let's start the adventure for your little legend.</h2>
                        <p className="text-xl text-deep/60">First things first, what is their name?</p>
                        <form onSubmit={handleNameSubmit} className="w-full max-w-md">
                            <input
                                type="text"
                                value={data.childName}
                                onChange={(e) => setData({ ...data, childName: e.target.value })}
                                placeholder="Child's Name"
                                className="w-full text-center text-3xl font-bold py-6 border-b-4 border-zinc-200 focus:border-primary outline-none bg-transparent placeholder:text-zinc-300 transition-all font-serif"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={!data.childName}
                                className="mt-8 btn btn-primary btn-lg w-full py-6 text-xl shadow-xl shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                Next Step <ArrowRight />
                            </button>
                        </form>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="step1"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="flex-1 flex flex-col justify-center items-center text-center space-y-8"
                    >
                        <h2 className="text-4xl font-black text-deep">How old is {data.childName}?</h2>
                        <p className="text-xl text-deep/60">We tailor the stories and missions to their reading level.</p>
                        <div className="grid grid-cols-2 gap-6 w-full max-w-lg mt-8">
                            <button onClick={() => selectAge('mini')} className="p-8 rounded-[2rem] bg-white border-4 border-zinc-100 hover:border-primary text-left group transition-all hover:shadow-xl hover:scale-105">
                                <span className="text-4xl mb-4 block">🌱</span>
                                <h3 className="text-2xl font-black text-deep group-hover:text-primary">Ages 4–5</h3>
                                <p className="text-sm font-bold opacity-40 uppercase tracking-widest mt-2">Mini Legends</p>
                            </button>
                            <button onClick={() => selectAge('big')} className="p-8 rounded-[2rem] bg-white border-4 border-zinc-100 hover:border-secondary text-left group transition-all hover:shadow-xl hover:scale-105">
                                <span className="text-4xl mb-4 block">🚀</span>
                                <h3 className="text-2xl font-black text-deep group-hover:text-secondary">Ages 6–8</h3>
                                <p className="text-sm font-bold opacity-40 uppercase tracking-widest mt-2">Big Legends</p>
                            </button>
                        </div>
                    </motion.div>
                )}


                {/* Step 2: Island Selection */}
                {step === 2 && (
                    <motion.div
                        key="step2"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="flex-1 flex flex-col justify-center items-center text-center space-y-6 w-full max-w-xl"
                    >
                        <h2 className="text-3xl font-black text-deep">Which island vibe should we start with?</h2>
                        <p className="text-xl text-deep/60">Search for your home island below.</p>

                        {/* Search Input */}
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-deep/30" />
                            <input
                                type="text"
                                placeholder="Search islands (e.g. Trinidad, Jamaica...)"
                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-zinc-100 border-none focus:ring-2 focus:ring-primary/50 text-lg font-bold text-deep"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Scrollable Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent">
                            {filteredIslands.map((island) => (
                                <button key={island.name} onClick={() => selectIsland(island)} className="p-4 rounded-xl bg-white border-2 border-zinc-100 hover:bg-primary/5 hover:border-primary font-bold text-deep text-sm transition-all text-left flex items-center gap-2 group">
                                    <span className="text-xl shrink-0">{island.flag}</span>
                                    <span className="truncate">{island.name}</span>
                                </button>
                            ))}
                            {filteredIslands.length === 0 && (
                                <div className="col-span-full py-8 text-deep/40 italic">
                                    Don't see it? We'll add it soon!
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="flex-1 flex flex-col justify-center items-center text-center space-y-8 py-20"
                    >
                        <div className="w-24 h-24 border-8 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <h3 className="text-2xl font-black text-deep animate-pulse">Designing {data.childName}'s adventure...</h3>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step4"
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="flex-1 w-full"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-black text-deep">We found the perfect plan for {data.childName}!</h2>
                            <p className="text-deep/60">Based on the {data.ageGroup === 'mini' ? 'Mini' : 'Big'} Legends track.</p>
                        </div>

                        <div className="bg-white rounded-[3rem] p-8 border-4 border-primary shadow-2xl relative overflow-hidden transform hover:scale-[1.01] transition-transform">
                            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-black uppercase tracking-widest px-6 py-2 rounded-bl-2xl">Recommended</div>

                            <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                                <div className="space-y-4 text-left flex-1">
                                    <h3 className="text-3xl font-black text-deep">Legends Plus</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-primary">$20</span>
                                        <span className="text-deep/40 font-bold">/ month</span>
                                    </div>
                                    <p className="text-sm text-green-600 font-bold bg-green-50 inline-block px-3 py-1 rounded-full">Billed annually (Save $48/year)</p>

                                    <ul className="space-y-3 pt-4">
                                        <li className="flex items-center gap-3 font-medium text-deep/80"><Check className="text-primary w-5 h-5" /> <strong>Personalized Letter</strong> for {data.childName}</li>
                                        <li className="flex items-center gap-3 font-medium text-deep/80"><Check className="text-primary w-5 h-5" /> <strong>{data.island}</strong> Flashcard & Coloring</li>
                                        <li className="flex items-center gap-3 font-medium text-deep/80"><Check className="text-primary w-5 h-5" /> <strong>Interactive Child Portal</strong> Access</li>
                                        <li className="flex items-center gap-3 font-medium text-deep/80"><Check className="text-primary w-5 h-5" /> Unlimited AI Story Studio</li>
                                    </ul>
                                </div>

                                <div className="flex-1 w-full lg:w-auto space-y-4">
                                    <button
                                        onClick={() => handlePlanSelect('legends_plus_annual')} // Assuming ID exists or maps to Legends Plus Annual
                                        className="btn btn-primary btn-lg w-full py-6 text-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                    >
                                        Start Your Trial <ArrowRight />
                                    </button>
                                    <div className="text-center">
                                        <button onClick={() => handlePlanSelect('mail_club')} className="text-sm font-bold text-deep/40 hover:text-deep hover:underline">
                                            Or start with basic Mail Club ($10/mo)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-white/50 rounded-2xl">
                                <ShieldCheck className="w-8 h-8 text-deep/20 mx-auto mb-2" />
                                <p className="text-xs font-bold text-deep/60">Cancel Anytime</p>
                            </div>
                            <div className="p-4 bg-white/50 rounded-2xl">
                                <Heart className="w-8 h-8 text-deep/20 mx-auto mb-2" />
                                <p className="text-xs font-bold text-deep/60">Happiness Guarantee</p>
                            </div>
                            <div className="p-4 bg-white/50 rounded-2xl">
                                <Sparkles className="w-8 h-8 text-deep/20 mx-auto mb-2" />
                                <p className="text-xs font-bold text-deep/60">Secure Checkout</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

