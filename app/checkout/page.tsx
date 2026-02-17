"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    Lock,
    Mail,
    User,
    Globe,
    CreditCard,
    ChevronRight,
    Star,
    Sparkles,
    Zap,
    Search
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ISLAND_REGISTRY } from "@/lib/registries/islands";

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: "",
        childName: "",
        heritage: "",
        plan: "Legend Pass" // Default
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    const heritages = [
        ...Object.values(ISLAND_REGISTRY).map(island => ({
            code: island.id,
            name: island.display_name,
            flag: island.id === "TT" ? "🇹🇹" :
                island.id === "JM" ? "🇯🇲" :
                    island.id === "BB" ? "🇧🇧" :
                        island.id === "GY" ? "🇬🇾" :
                            island.id === "LC" ? "🇱🇨" :
                                island.id === "BS" ? "🇧🇸" :
                                    island.id === "HT" ? "🇭🇹" :
                                        island.id === "DO" ? "🇩🇴" :
                                            island.id === "PR" ? "🇵🇷" :
                                                island.id === "AG" ? "🇦🇬" :
                                                    island.id === "KN" ? "🇰🇳" :
                                                        island.id === "GD" ? "🇬🇩" :
                                                            island.id === "VC" ? "🇻🇨" :
                                                                island.id === "DM" ? "🇩🇲" :
                                                                    island.id === "CU" ? "🇨🇺" :
                                                                        island.id === "AW" ? "🇦🇼" :
                                                                            island.id === "CW" ? "🇨🇼" :
                                                                                island.id === "BQ" ? "🇧🇶" :
                                                                                    island.id === "AI" ? "🇦🇮" :
                                                                                        island.id === "VG" ? "🇻🇬" :
                                                                                            island.id === "VI" ? "🇻🇮" :
                                                                                                island.id === "TC" ? "🇹🇨" : "🏝️"
        })).sort((a, b) => a.name.localeCompare(b.name)),
        { code: "OTHER", name: "Other / Multiculti", flag: "🏝️" }
    ];

    const filteredHeritages = heritages.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleNext = () => setStep(s => s + 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate payment/account creation
        await new Promise(r => setTimeout(r, 2000));
        setIsComplete(true);
        setIsSubmitting(false);
    };

    if (isComplete) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto text-success">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-deep tracking-tighter">Welcome to the Universe!</h1>
                        <p className="text-deep/50 font-medium">
                            Account for <span className="text-deep font-bold">{formData.email}</span> is ready.
                            Your first Island Pack for <span className="text-deep font-bold">{formData.childName}</span> is being prepared.
                        </p>
                    </div>
                    <Link
                        href="/portal"
                        className="flex items-center justify-center gap-3 w-full py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Enter Your Portal
                        <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#FFFDF7] flex flex-col lg:flex-row">
            {/* Left: Branding & Summary (Visible on Desktop) */}
            <section className="lg:w-[40%] bg-white p-8 sm:p-12 lg:p-20 flex flex-col justify-between border-r border-zinc-100">
                <div className="space-y-12">
                    <Link href="/" className="inline-block relative w-48 h-12">
                        <Image src="/images/logo.png" alt="Likkle Legends" fill className="object-contain" />
                    </Link>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl sm:text-5xl font-black text-deep tracking-tighter leading-tight">
                                One pass. <br />
                                <span className="text-primary italic">Infinite magic.</span>
                            </h2>
                            <p className="text-deep/40 font-medium max-w-sm">
                                Join 2,000+ diaspora families preserving their heritage through personalized digital adventure.
                            </p>
                        </div>

                        {/* Order Summary Box */}
                        <div className="bg-zinc-50 rounded-3xl p-6 sm:p-8 space-y-6 border border-zinc-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-zinc-50 uppercase font-black text-xs text-primary">
                                        LP
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-deep uppercase tracking-widest">The Legend Pass</p>
                                        <p className="text-[10px] font-bold text-deep/30 uppercase tracking-widest leading-none mt-1">Monthly Subscription</p>
                                    </div>
                                </div>
                                <p className="text-xl font-black text-deep">$10.00</p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-zinc-200/50">
                                <div className="flex justify-between text-[11px] font-bold text-deep/40 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span>$10.00</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-bold text-deep/40 uppercase tracking-widest">
                                    <span>Legend Envelope (US)</span>
                                    <span className="text-success">Free Shipping</span>
                                </div>
                                <div className="flex justify-between text-lg font-black text-deep pt-2">
                                    <span>Total Today</span>
                                    <span>$10.00</span>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-success/5 rounded-2xl border border-success/10">
                                <ShieldCheck size={20} className="text-success" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-success/70">30-Day Guarantee</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-deep/5 rounded-2xl border border-deep/10">
                                <Lock size={20} className="text-deep/40" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-deep/40">Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonial Snippet */}
                <div className="hidden lg:block pt-12">
                    <div className="flex gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-sm font-medium text-deep/40 italic leading-relaxed">
                        "The only app that actually makes my son excited to learn about his Trini roots. The physical envelope is the highlight of our month!"
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-deep/20 mt-4">— Sarah M., NY</p>
                </div>
            </section>

            {/* Right: The Streamlined Form */}
            <section className="flex-1 p-6 sm:p-12 lg:p-20 flex items-center justify-center">
                <div className="max-w-md w-full">
                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Progress Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-primary text-white' : 'bg-zinc-200 text-zinc-400'}`}>1</div>
                                <div className={`w-8 h-[2px] rounded-full ${step >= 2 ? 'bg-primary' : 'bg-zinc-200'}`}></div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-primary text-white' : 'bg-zinc-200 text-zinc-400'}`}>2</div>
                                <div className={`w-8 h-[2px] rounded-full ${step >= 3 ? 'bg-primary' : 'bg-zinc-200'}`}></div>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 3 ? 'bg-primary text-white' : 'bg-zinc-200 text-zinc-400'}`}>3</div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-deep/25 italic">Step {step} of 3</span>
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-deep tracking-tight">Let's create your account.</h3>
                                        <p className="text-deep/40 text-sm font-medium">Use your primary email for portal access.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-deep/30 px-6">Parent Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-deep/20" size={20} />
                                            <input
                                                type="email"
                                                required
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-14 pr-8 py-5 bg-white border border-zinc-100 rounded-2xl font-bold text-deep focus:outline-none focus:border-primary/30 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={!formData.email.includes("@")}
                                        className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        Next: Personalize
                                        <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-deep tracking-tight">Personalize the experience.</h3>
                                        <p className="text-deep/40 text-sm font-medium">Who are we preparing this adventure for?</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-deep/30 px-6">Child's First Name</label>
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-deep/20" size={20} />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Little Legend's Name"
                                                    value={formData.childName}
                                                    onChange={e => setFormData({ ...formData, childName: e.target.value })}
                                                    className="w-full pl-14 pr-8 py-5 bg-white border border-zinc-100 rounded-2xl font-bold text-deep focus:outline-none focus:border-primary/30 transition-all shadow-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-6">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-deep/30">Primary Heritage</label>
                                                <div className="relative group">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-deep/20 group-focus-within:text-primary/40 transition-colors" size={14} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search islands..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-[10px] font-bold text-deep focus:outline-none focus:border-primary/20 transition-all w-32 sm:w-48"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                                                {filteredHeritages.map(h => (
                                                    <button
                                                        key={h.code}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, heritage: h.code })}
                                                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${formData.heritage === h.code ? 'bg-primary/5 border-primary shadow-inner-sm' : 'bg-white border-zinc-100 hover:border-zinc-200'}`}
                                                    >
                                                        <span className="text-2xl">{h.flag}</span>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest text-center leading-tight ${formData.heritage === h.code ? 'text-primary' : 'text-deep/40'}`}>{h.name}</span>
                                                    </button>
                                                ))}
                                                {filteredHeritages.length === 0 && (
                                                    <div className="col-span-2 py-8 text-center">
                                                        <p className="text-[10px] font-bold text-deep/30 uppercase tracking-widest">No islands found...</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={!formData.childName || !formData.heritage}
                                        className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        Next: Secure Payment
                                        <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-deep tracking-tight">Secure Payment.</h3>
                                        <p className="text-deep/40 text-sm font-medium">Start your 30-day risk-free trial today.</p>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-6 shadow-sm">
                                        <div className="flex items-center justify-between pb-4 border-b border-zinc-50">
                                            <div className="flex items-center gap-2">
                                                <CreditCard size={18} className="text-deep/30" />
                                                <span className="text-xs font-black uppercase tracking-widest text-deep">Card Info</span>
                                            </div>
                                            <div className="flex gap-1">
                                                <div className="w-8 h-5 bg-zinc-100 rounded"></div>
                                                <div className="w-8 h-5 bg-zinc-100 rounded"></div>
                                                <div className="w-8 h-5 bg-zinc-100 rounded"></div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between">
                                                <span className="text-sm font-bold text-deep/40 italic">Card Number</span>
                                                <Lock size={14} className="text-deep/10" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                                    <span className="text-sm font-bold text-deep/40 italic">MM/YY</span>
                                                </div>
                                                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                                    <span className="text-sm font-bold text-deep/40 italic">CVC</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[9px] text-deep/30 font-medium leading-relaxed">
                                            By clicking "Start Adventure", you agree to be charged $10.00 today and monthly thereafter. Cancel anytime with one click in your dashboard.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-6 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Sparkles className="animate-spin" size={18} />
                                                Securing Access...
                                            </>
                                        ) : (
                                            <>
                                                Start Adventure
                                                <Zap size={18} />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Guarantee Footer */}
                        <div className="pt-8 border-t border-zinc-100 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2">
                                <Globe size={14} className="text-primary/40" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-deep/20">Global Heritage</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap size={14} className="text-secondary/40" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-deep/20">Instant Activation</span>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
