'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PassportData {
    childName: string;
    island: string;
    ageBand: string;
    dialect: 'standard' | 'patois' | 'bajan' | 'vincy';
    mailCountry: string;
}

interface HeroProps {
    onOpenWaitlist: () => void;
}

export function Hero({ onOpenWaitlist }: HeroProps) {
    const [passportData, setPassportData] = useState<PassportData>({
        childName: '',
        island: '',
        ageBand: '',
        dialect: 'standard',
        mailCountry: ''
    });

    const [showPassportPreview, setShowPassportPreview] = useState(false);

    const router = useRouter();

    const handlePassportSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (passportData.mailCountry === 'ca' || passportData.mailCountry === 'uk') {
            onOpenWaitlist();
            return;
        }

        // 1. Show preview briefy for "Island Magic" effect
        setShowPassportPreview(true);

        // 2. Build redirect URL
        const params = new URLSearchParams({
            childName: passportData.childName,
            heritage: passportData.island.toUpperCase(),
            ageBand: passportData.ageBand,
            plan: 'plan_mail_intro'
        });

        // 3. Set a slight timeout so they see their passport before landing on checkout
        setTimeout(() => {
            router.push(`/checkout?${params.toString()}`);
        }, 1200);
    };

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[var(--caribbean-bg-warm)] to-white pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

                {/* Left: Hook & Builder */}
                <div className="relative z-10 text-slate-900">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--caribbean-sun)]/10 text-[var(--caribbean-mango)] rounded-full font-bold text-sm mb-6 border border-[var(--caribbean-sun)]/20">
                            <Sparkles className="w-4 h-4" />
                            <span>Caribbean Magic for Kids 3-9</span>
                        </div>

                        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-slate-900 leading-[1.0] mb-6">
                            Give Your Child Their <span className="text-[var(--caribbean-ocean)]">Digital Passport</span> to the Islands.
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-xl leading-relaxed">
                            Step into a world where Caribbean culture comes to life. Personalized missions, physical mail kits, and 4 legendary friends waiting to meet your child.
                        </p>

                        {/* CRO-Optimized: Single CTA + Trust Elements */}
                        <div className="space-y-8 max-w-xl">
                            <div className="flex flex-col gap-4">
                                <Button
                                    size="lg"
                                    className="rounded-2xl h-14 text-lg font-bold bg-gradient-to-r from-[var(--caribbean-ocean)] to-[var(--caribbean-mango)] hover:shadow-2xl text-white shadow-lg hover:-translate-y-1 transition-all"
                                    onClick={() => router.push('/checkout?plan=plan_mail_intro')}
                                >
                                    ✨ Claim Your Child's Passport ($10)
                                </Button>

                                <p className="text-center text-sm text-slate-600 font-semibold">
                                    🚚 Physical mail ships to US within 48 hours  |  🌍 Digital access worldwide instantly
                                </p>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <a href="/privacy" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className="text-2xl">🛡️</div>
                                    <span className="text-[10px] font-bold text-slate-600 text-center">COPPA<br/>COMPLIANT</span>
                                </a>
                                <a href="/privacy" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className="text-2xl">🤖</div>
                                    <span className="text-[10px] font-bold text-slate-600 text-center">KID-SAFE<br/>AI</span>
                                </a>
                                <a href="/heritage" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                                    <div className="text-2xl">🌴</div>
                                    <span className="text-[10px] font-bold text-slate-600 text-center">HERITAGE<br/>VERIFIED</span>
                                </a>
                            </div>

                            {/* Social Proof */}
                            <div className="bg-[var(--caribbean-sun)]/5 rounded-xl p-6 border border-[var(--caribbean-sun)]/20">
                                <p className="text-sm font-bold text-slate-700 mb-3">✓ What's Included in the $10 Intro Pass:</p>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li>✓ First personalized Legend Envelope mailed to your door</li>
                                    <li>✓ Legend Key Code to unlock exclusive Island Pack</li>
                                    <li>✓ Instant access to all 5 Learning Zones</li>
                                    <li>✓ 30-Day money-back guarantee (no questions asked)</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Visual Preview */}
                <div className="relative lg:h-[600px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {!showPassportPreview ? (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--caribbean-sun)] to-[var(--caribbean-papaya)] rounded-[40px] blur-3xl opacity-20 animate-pulse" />
                                <Image
                                    src="/images/parent-child-smiling.png"
                                    alt="Likkle Legends Family Celebration"
                                    width={500}
                                    height={625}
                                    priority
                                    className="rounded-[40px] shadow-2xl relative z-10 w-full max-w-[500px] aspect-[4/5] object-cover border-8 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500"
                                />
                                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl z-20 border border-slate-100 max-w-[240px]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle2 className="w-5 h-5 text-[var(--caribbean-palm)]" aria-hidden="true" />
                                        <span className="font-bold text-slate-800">Mail Delivering Soon</span>
                                    </div>
                                    <p className="text-sm text-slate-500">Intro Pass includes your child's first physical envelope!</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, rotateY: 90 }}
                                animate={{ opacity: 1, rotateY: 0 }}
                                transition={{ type: "spring", damping: 15 }}
                                className="w-full max-w-[450px]"
                            >
                                <div className="bg-[var(--caribbean-ocean)] p-1 rounded-[32px] shadow-2xl overflow-hidden">
                                    <div className="bg-white rounded-[28px] overflow-hidden">
                                        <div className="bg-[var(--caribbean-ocean)] p-6 text-white text-center">
                                            <div className="flex justify-center mb-2">
                                                <div className="p-3 bg-white/20 rounded-full">
                                                    <Sparkles className="w-8 h-8" />
                                                </div>
                                            </div>
                                            <h2 className="text-2xl font-black uppercase tracking-widest">Digital Passport</h2>
                                            <p className="text-white/80 font-medium">Likkle Legends Archipelago</p>
                                        </div>

                                        <div className="p-8 space-y-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center border-4 border-[var(--caribbean-sun)]/30 overflow-hidden">
                                                    <img
                                                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${passportData.childName || 'Legend'}`}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Legend Name</p>
                                                        <p className="text-xl font-black text-slate-800 uppercase">{passportData.childName || 'New Explorer'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Heritage Base</p>
                                                        <p className="text-sm font-bold text-slate-700 capitalize">{passportData.island || 'Archipelago'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-slate-50 rounded-xl">
                                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Rank</p>
                                                    <p className="font-bold text-slate-800">{passportData.ageBand === '3-5' ? 'Explorer' : passportData.ageBand === '5-7' ? 'Voyager' : 'Legend'}</p>
                                                </div>
                                                <div className="p-4 bg-[var(--caribbean-sun)]/10 rounded-xl border border-[var(--caribbean-sun)]/20">
                                                    <p className="text-[10px] uppercase tracking-wider text-[var(--caribbean-mango)] font-bold mb-1">Status</p>
                                                    <p className="font-bold text-[var(--caribbean-mango)]">Active</p>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-dashed border-slate-200">
                                                <Button className="w-full bg-[var(--caribbean-ocean)] hover:bg-[var(--caribbean-ocean)]/90 h-12 text-white font-bold rounded-xl" onClick={() => window.location.href = '#pricing'}>
                                                    Claim Official Pass
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

            {/* Background Decor */}
            <div className="absolute top-20 right-[10%] w-64 h-64 bg-[var(--caribbean-sun)]/5 blur-[100px] rounded-full" />
            <div className="absolute bottom-20 left-[5%] w-80 h-80 bg-[var(--caribbean-ocean)]/5 blur-[120px] rounded-full" />
        </section>
    );
}