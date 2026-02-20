'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    const handlePassportSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (passportData.mailCountry === 'ca' || passportData.mailCountry === 'uk') {
            onOpenWaitlist();
            return;
        }

        setShowPassportPreview(true);
        // In production, this would redirect to checkout
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

                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
                            Give Your Child Their <span className="text-[var(--caribbean-ocean)]">Digital Passport</span> to the Islands.
                        </h1>

                        <p className="text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
                            Step into a world where Caribbean culture comes to life. Personalized missions, physical mail kits, and 4 legendary friends waiting to meet your child.
                        </p>

                        {/* Passport Builder Card */}
                        <Card className="p-8 shadow-2xl border-white bg-white/80 backdrop-blur-md relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-[var(--caribbean-ocean)]" />
                            <form onSubmit={handlePassportSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="childName" className="text-slate-700 font-bold">Child's Name</Label>
                                        <Input
                                            id="childName"
                                            placeholder="e.g. Malia"
                                            required
                                            className="bg-white border-slate-200 text-slate-900 h-12"
                                            value={passportData.childName}
                                            onChange={(e) => setPassportData({ ...passportData, childName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="island" className="text-slate-700 font-bold">Heritage Island</Label>
                                        <Select onValueChange={(val) => setPassportData({ ...passportData, island: val })} required>
                                            <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-12">
                                                <SelectValue placeholder="Select Island" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-slate-200 max-h-[300px]">
                                                <SelectItem value="anguilla">Anguilla 🇦🇮</SelectItem>
                                                <SelectItem value="antigua">Antigua & Barbuda 🇦🇬</SelectItem>
                                                <SelectItem value="aruba">Aruba 🇦🇼</SelectItem>
                                                <SelectItem value="bahamas">Bahamas 🇧🇸</SelectItem>
                                                <SelectItem value="barbados">Barbados 🇧🇧</SelectItem>
                                                <SelectItem value="bermuda">Bermuda 🇧🇲</SelectItem>
                                                <SelectItem value="bonaire">Bonaire 🇧🇶</SelectItem>
                                                <SelectItem value="bvi">British Virgin Islands 🇻🇬</SelectItem>
                                                <SelectItem value="cayman">Cayman Islands 🇰🇾</SelectItem>
                                                <SelectItem value="cuba">Cuba 🇨🇺</SelectItem>
                                                <SelectItem value="curacao">Curacao 🇨🇼</SelectItem>
                                                <SelectItem value="dominica">Dominica 🇩🇲</SelectItem>
                                                <SelectItem value="dr">Dominican Republic 🇩🇴</SelectItem>
                                                <SelectItem value="grenada">Grenada 🇬🇩</SelectItem>
                                                <SelectItem value="guadeloupe">Guadeloupe 🇬🇵</SelectItem>
                                                <SelectItem value="guyana">Guyana 🇬🇾</SelectItem>
                                                <SelectItem value="haiti">Haiti 🇭🇹</SelectItem>
                                                <SelectItem value="jamaica">Jamaica 🇯🇲</SelectItem>
                                                <SelectItem value="martinique">Martinique 🇲🇶</SelectItem>
                                                <SelectItem value="montserrat">Montserrat 🇲🇸</SelectItem>
                                                <SelectItem value="puerto-rico">Puerto Rico 🇵🇷</SelectItem>
                                                <SelectItem value="st-kitts">Saint Kitts & Nevis 🇰🇳</SelectItem>
                                                <SelectItem value="st-lucia">Saint Lucia 🇱🇨</SelectItem>
                                                <SelectItem value="st-vincent">Saint Vincent & the Grenadines 🇻🇨</SelectItem>
                                                <SelectItem value="st-martin">Saint Martin 🇲🇫</SelectItem>
                                                <SelectItem value="suriname">Suriname 🇸🇷</SelectItem>
                                                <SelectItem value="trinidad">Trinidad & Tobago 🇹🇹</SelectItem>
                                                <SelectItem value="turks-caicos">Turks & Caicos Islands 🇹🇨</SelectItem>
                                                <SelectItem value="usvi">US Virgin Islands 🇻🇮</SelectItem>
                                                <SelectItem value="other">Other/Caribbean Roots</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="age" className="text-slate-700 font-bold">Age Band</Label>
                                        <Select onValueChange={(val) => setPassportData({ ...passportData, ageBand: val })} required>
                                            <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-12">
                                                <SelectValue placeholder="Age Range" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-slate-200">
                                                <SelectItem value="3-5">Explorer (3-5 yrs)</SelectItem>
                                                <SelectItem value="5-7">Voyager (5-7 yrs)</SelectItem>
                                                <SelectItem value="7-9">Legend (7-9 yrs)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="country" className="text-slate-700 font-bold">Mail Country</Label>
                                        <Select onValueChange={(val) => setPassportData({ ...passportData, mailCountry: val })} required>
                                            <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-12">
                                                <SelectValue placeholder="Where do you live?" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-slate-200">
                                                <SelectItem value="us">United States 🇺🇸</SelectItem>
                                                <SelectItem value="ca">Canada 🇨🇦 (Waitlist)</SelectItem>
                                                <SelectItem value="uk">United Kingdom 🇬🇧 (Waitlist)</SelectItem>
                                                <SelectItem value="other">Worldwide (Digital Only)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                    <Button type="submit" size="lg" className="flex-1 rounded-2xl h-14 text-lg font-bold bg-[var(--caribbean-ocean)] hover:bg-[var(--caribbean-ocean)]/90 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                                        Start $10 Legend Intro Pass
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        className="flex-1 rounded-2xl h-14 border-2 hover:bg-slate-50 text-slate-700 border-slate-200 font-bold"
                                        onClick={() => window.location.href = '#features'}
                                    >
                                        Free Digital Preview
                                    </Button>
                                </div>

                                <p className="text-center text-xs text-slate-400 font-medium">
                                    Intro Pass includes first Legend Envelope (US only) + Full Portal Access.
                                </p>
                            </form>
                        </Card>
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
                                <img
                                    src="/images/child_reading.png"
                                    alt="Likkle Legends Child Reading"
                                    fetchPriority="high"
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
