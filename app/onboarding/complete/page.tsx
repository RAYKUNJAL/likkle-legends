"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Map, Users, ArrowRight, ExternalLink, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/UserContext';
import { supabase } from '@/lib/storage';

export default function OnboardingComplete() {
    const router = useRouter();
    const { user, children } = useUser();
    const [latestChild, setLatestChild] = useState<any>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (children && children.length > 0) {
            // Get the most recently created child (assuming sorting or just taking first for single child flow)
            setLatestChild(children[children.length - 1]);
        }
    }, [children]);

    const handleCopyCode = () => {
        // In a real app, this would be a unique login code
        navigator.clipboard.writeText("LEGEND-123");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Confetti / Celebration Decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: '100vh', opacity: [0, 1, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-[20%] text-4xl"
                >🎉</motion.div>
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: '100vh', opacity: [0, 1, 0] }}
                    transition={{ duration: 7, delay: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-[60%] text-4xl"
                >🌟</motion.div>
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: '100vh', opacity: [0, 1, 0] }}
                    transition={{ duration: 6, delay: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 left-[80%] text-4xl"
                >🌴</motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl border-4 border-zinc-100 p-8 lg:p-12 relative z-10"
            >
                <div className="text-center mb-12">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-deep mb-4">You're All Set!</h1>
                    <p className="text-xl text-deep/60">
                        {latestChild ? `${latestChild.first_name} is ready for adventure.` : "Your family profile is ready."}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Child Card */}
                    <Link href="/portal" className="group">
                        <div className="h-full bg-primary/5 hover:bg-primary/10 border-2 border-primary/20 rounded-[2.5rem] p-8 transition-all hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                                <ExternalLink size={18} />
                            </div>
                            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30">
                                <Gamepad2Icon />
                            </div>
                            <h2 className="text-2xl font-black text-deep mb-2">Launch Child Portal</h2>
                            <p className="text-deep/60 mb-6 text-sm font-medium">
                                Enter the immersive 3D island world. Best experienced on a tablet or desktop.
                            </p>
                            <span className="font-black text-primary flex items-center gap-2 group-hover:gap-4 transition-all">
                                Play Now <ArrowRight size={20} />
                            </span>
                        </div>
                    </Link>

                    {/* Parent Card */}
                    <Link href="/parent" className="group">
                        <div className="h-full bg-blue-50 hover:bg-blue-100 border-2 border-blue-100 rounded-[2.5rem] p-8 transition-all hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500">
                                <Users size={18} />
                            </div>
                            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30">
                                <MapIcon />
                            </div>
                            <h2 className="text-2xl font-black text-deep mb-2">Parent Dashboard</h2>
                            <p className="text-deep/60 mb-6 text-sm font-medium">
                                Track progress, manage subscription, and invite grandparents to the family circle.
                            </p>
                            <span className="font-black text-blue-600 flex items-center gap-2 group-hover:gap-4 transition-all">
                                Go to Dashboard <ArrowRight size={20} />
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Grandparent Access Teaser */}
                <div className="mt-8 bg-zinc-50 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-zinc-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-zinc-100">🎁</div>
                        <div>
                            <h3 className="font-bold text-deep">Invite the Grandparents?</h3>
                            <p className="text-xs text-deep/50 font-medium">They get free access to follow along!</p>
                        </div>
                    </div>
                    <Link href="/parent/family">
                        <button className="px-6 py-3 bg-white border-2 border-zinc-200 hover:border-deep/20 rounded-xl font-bold text-sm text-deep transition-all">
                            Get Invite Code
                        </button>
                    </Link>
                </div>

            </motion.div>
        </div>
    );
}

function Gamepad2Icon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12" /><line x1="8" x2="8" y1="10" y2="14" /><line x1="15" x2="15.01" y1="13" y2="13" /><line x1="18" x2="18.01" y1="11" y2="11" /><rect width="20" height="12" x="2" y="6" rx="2" /></svg>
    );
}

function MapIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" /></svg>
    );
}
