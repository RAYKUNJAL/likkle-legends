"use client";

import { useState, useEffect } from "react";
import { fireConversionEvent } from "@/lib/analytics";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Lock,
    Mail,
    User,
    Globe,
    Star,
    Sparkles,
    Zap,
    Search,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from 'react-hot-toast';
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ISLAND_REGISTRY } from "@/lib/registries/islands";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { SUBSCRIPTION_PLANS, UPSELLS } from "@/lib/paypal";
import { supabase } from "@/lib/supabase-client";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

// Log if PayPal client ID is missing in production
if (typeof window !== 'undefined' && !PAYPAL_CLIENT_ID) {
    console.warn('[PayPal] Client ID not configured. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID environment variable.');
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [emailTouched, setEmailTouched] = useState(false);

    // Helper to map URL param to Plan Object
    const getInitialPlan = () => {
        const planParam = searchParams.get('plan');
        if (planParam === 'free' || planParam === 'plan_free_forever') return 'plan_free_forever';
        if (planParam === 'starter_mailer' || planParam === 'plan_mail_intro') return 'plan_mail_intro';
        if (planParam === 'legends_plus') return 'plan_legends_plus';
        if (planParam === 'family_legacy') return 'plan_family_legacy';
        if (planParam === 'digital_explorer' || planParam === 'plan_digital_legends') return 'plan_digital_legends';
        return 'plan_mail_intro'; // Default
    };

    const [formData, setFormData] = useState({
        email: "",
        childName: searchParams.get('childName') || "",
        heritage: searchParams.get('heritage')?.toUpperCase() || "",
        planKey: getInitialPlan(), // Store the key of SUBSCRIPTION_PLANS
        hasUpsell: false, // Super-Pack
        hasHeritageStory: false, // Custom Story
        addGrandparent: false // Grandparent Mirror
    });
    const [isComplete, setIsComplete] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");

    // Discount code state
    const [discountCode, setDiscountCode] = useState("");
    const [discountValid, setDiscountValid] = useState<{ valid: boolean; discount_percent?: number; description?: string } | null>(null);
    const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

    const validateDiscountCode = async () => {
        if (!discountCode.trim()) return;
        setIsValidatingDiscount(true);
        try {
            const res = await fetch("/api/discount/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: discountCode }),
            });
            const data = await res.json();
            setDiscountValid(data);
            if (data.valid) {
                toast.success(`${data.description} applied!`);
            } else {
                toast.error(data.error || "Invalid code");
            }
        } catch {
            toast.error("Failed to validate code");
        } finally {
            setIsValidatingDiscount(false);
        }
    };

    // CRO: fire begin_checkout when the page loads (visitor intent signal)
    useEffect(() => {
        const plan = searchParams.get('plan') || 'unknown';
        fireConversionEvent('begin_checkout', { tier: plan, source: 'checkout_page' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const handleBack = () => setStep(s => Math.max(1, s - 1));

    const validateEmail = (email: string): string | null => {
        if (!email.trim()) return "Email is required";
        if (!email.includes("@")) return "Please enter a valid email address";
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Please enter a valid email format";
        return null;
    };

    const handleNext = () => {
        if (step === 1) {
            const error = validateEmail(formData.email);
            if (error) {
                setEmailError(error);
                setEmailTouched(true);
                return;
            }
            setEmailError(null);
        }
        setStep(s => s + 1);
    };

    const calculateOneTimeTotal = () => {
        let total = 0;
        if (formData.hasUpsell) total += UPSELLS.digital_activity_super_pack.price;
        if (formData.hasHeritageStory) total += UPSELLS.heritage_dna_story.price;
        return total;
    };

    const calculateRecurringTotal = () => {
        const selectedPlan = SUBSCRIPTION_PLANS[formData.planKey as keyof typeof SUBSCRIPTION_PLANS];
        return selectedPlan?.price || 0;
    };

    const calculateTotal = () => {
        return (calculateOneTimeTotal() + calculateRecurringTotal()).toFixed(2);
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
                        href={`/onboarding/welcome${formData.childName ? `?childName=${encodeURIComponent(formData.childName)}` : ''}`}
                        className="flex items-center justify-center gap-3 w-full py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Set Up Your Child's Profile
                        <ArrowRight size={18} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (!PAYPAL_CLIENT_ID) {
        return (
            <main className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                    <h1 className="text-2xl font-black text-deep mb-4">Payment System Unavailable</h1>
                    <p className="text-deep/60 mb-6">The payment system is currently being configured. Please try again in a few moments or contact support at legends@likklelegends.com for assistance.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-primary text-white rounded-2xl font-black"
                    >
                        Retry
                    </button>
                </div>
            </main>
        );
    }

    return (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "USD", intent: "subscription", vault: true }}>
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
                                            <p className="text-sm font-black text-deep uppercase tracking-widest">
                                                {SUBSCRIPTION_PLANS[formData.planKey as keyof typeof SUBSCRIPTION_PLANS]?.name || 'Legend Pass'}
                                            </p>
                                            <p className="text-[10px] font-bold text-deep/30 uppercase tracking-widest leading-none mt-1">Monthly Subscription</p>
                                        </div>
                                    </div>
                                    <p className="text-xl font-black text-deep">
                                        ${SUBSCRIPTION_PLANS[formData.planKey as keyof typeof SUBSCRIPTION_PLANS]?.price.toFixed(2)}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-zinc-200/50">
                                    <div className="flex justify-between text-[11px] font-bold text-deep/40 uppercase tracking-widest">
                                        <span>Subtotal</span>
                                        <span>${calculateRecurringTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] font-bold text-deep/40 uppercase tracking-widest">
                                        <span>Legend Envelope (US)</span>
                                        <span className="text-success">Free Shipping</span>
                                    </div>
                                    {formData.hasUpsell && (
                                        <div className="flex justify-between text-[11px] font-bold text-deep/40 uppercase tracking-widest animate-pulse">
                                            <span>+ Digital Activity Pack</span>
                                            <span>${UPSELLS.digital_activity_super_pack.price.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {formData.hasHeritageStory && (
                                        <div className="flex justify-between text-[11px] font-bold text-deep/40 uppercase tracking-widest animate-pulse">
                                            <span>+ Heritage DNA Story</span>
                                            <span>${UPSELLS.heritage_dna_story.price.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {formData.planKey !== 'plan_free_forever' && (
                                        <div className="flex justify-between text-[11px] font-bold text-green-600 uppercase tracking-widest animate-pulse">
                                            <span>7-Day Free Trial</span>
                                            <span>-${calculateRecurringTotal().toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-black text-deep pt-2">
                                        <span>Due Today</span>
                                        <span className="text-green-600">
                                            ${calculateOneTimeTotal().toFixed(2)}
                                        </span>
                                    </div>
                                    {formData.planKey !== 'plan_free_forever' && (
                                        <p className="text-[10px] text-deep/30 font-medium">
                                            Then ${calculateRecurringTotal().toFixed(2)}/month starting{' '}
                                            {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 bg-success/5 rounded-2xl border border-success/10">
                                    <ShieldCheck size={20} className="text-success" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-success/70">7-Day Free Trial</span>
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
                            &quot;The only app that actually makes my son excited to learn about his Trini roots. The physical envelope is the highlight of our month!&quot;
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-deep/20 mt-4">— Sarah M., NY</p>
                    </div>
                </section>

                {/* Right: The Streamlined Form */}
                <section className="flex-1 p-6 sm:p-12 lg:p-20 flex items-center justify-center">
                    <div className="max-w-md w-full">
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-12">
                            {/* Progress Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-primary text-white' : 'bg-zinc-200 text-zinc-400'}`}>1</div>
                                    <div className={`w-8 h-[2px] rounded-full ${step >= 2 ? 'bg-primary' : 'bg-zinc-200'}`}></div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-primary text-white' : 'bg-zinc-200 text-zinc-400'}`}>2</div>
                                    <div className={`w-8 h-[2px] rounded-full ${step >= 3 ? 'bg-primary' : 'bg-zinc-200'}`}></div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 3 ? 'bg-primary text-white' : 'bg-zinc-200 text-zinc-400'}`}>3</div>
                                    <div className={`w-8 h-[2px] rounded-full ${step >= 4 ? 'bg-primary' : 'bg-zinc-200'}`}></div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= 4 ? 'bg-primary text-white' : 'bg-zinc-200 text-zinc-400'}`}>4</div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-deep/25 italic">Step {step} of 4</span>
                                </div>
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
                                            <h3 className="text-2xl font-black text-deep tracking-tight">Let&apos;s create your account.</h3>
                                            <p className="text-deep/40 text-sm font-medium">Use your primary email for portal access.</p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-deep/30 px-6">Parent Email</label>
                                            <div className="relative">
                                                <Mail className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${emailError && emailTouched ? 'text-red-400' : 'text-deep/20'}`} size={20} />
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="you@example.com"
                                                    value={formData.email}
                                                    onBlur={() => {
                                                        setEmailTouched(true);
                                                        setEmailError(validateEmail(formData.email));
                                                    }}
                                                    onChange={e => {
                                                        setFormData({ ...formData, email: e.target.value });
                                                        if (emailTouched) {
                                                            setEmailError(validateEmail(e.target.value));
                                                        }
                                                    }}
                                                    className={`w-full pl-14 pr-8 py-5 bg-white border rounded-2xl font-bold text-deep focus:outline-none transition-all shadow-sm ${
                                                        emailError && emailTouched
                                                            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                                                            : 'border-zinc-100 focus:border-primary/30'
                                                    }`}
                                                />
                                            </div>
                                            {emailError && emailTouched && (
                                                <div className="flex items-center gap-2 px-6 pt-1">
                                                    <AlertCircle size={14} className="text-red-500 shrink-0" />
                                                    <p className="text-xs font-bold text-red-500">{emailError}</p>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleNext}
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
                                                <label className="text-[10px] font-black uppercase tracking-widest text-deep/30 px-6">Child&apos;s First Name</label>
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
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-deep/30">Select Your Plan</label>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3 px-6">
                                                    {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                                                        <button
                                                            key={key}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, planKey: key })}
                                                            className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${formData.planKey === key ? 'bg-primary/5 border-primary shadow-inner-sm' : 'bg-white border-zinc-100'}`}
                                                        >
                                                            <div className="text-left">
                                                                <p className={`font-black uppercase tracking-widest text-xs ${formData.planKey === key ? 'text-primary' : 'text-deep'}`}>{plan.name}</p>
                                                                <p className="text-[10px] text-deep/40">{plan.description}</p>
                                                            </div>
                                                            <p className="font-black text-deep">${plan.price === 0 ? 'FREE' : plan.price.toFixed(2)}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4 pt-4">
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
                                                            onClick={() => {
                                                                setFormData({ ...formData, heritage: h.code });
                                                            }}
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

                                        {/* Step 2 Navigation */}
                                        <div className="flex items-center gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="flex items-center gap-2 px-5 py-4 text-deep/50 hover:text-deep hover:bg-zinc-100 rounded-2xl font-bold text-sm transition-all"
                                            >
                                                <ArrowLeft size={16} />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleNext}
                                                disabled={!formData.childName.trim() || !formData.heritage}
                                                className="flex-1 py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                            >
                                                Next: Extras
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
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
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                                                <Sparkles size={12} /> Special Upgrades
                                            </div>
                                            <h3 className="text-2xl font-black text-deep tracking-tight">One-Time Offers!</h3>
                                            <p className="text-deep/50 text-sm font-medium">Customize your child&apos;s journey.</p>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Upsell 1: Digital Pack */}
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, hasUpsell: !prev.hasUpsell }))}
                                                className={`w-full text-left bg-zinc-50 border-2 rounded-2xl p-6 transition-all ${formData.hasUpsell ? 'border-primary bg-primary/5' : 'border-dashed border-zinc-200 hover:bg-zinc-100'}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-2xl shrink-0">
                                                        🎨
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-black text-deep text-sm">Digital Activity Super-Pack</h4>
                                                            {formData.hasUpsell && <CheckCircle2 size={18} className="text-primary" />}
                                                        </div>
                                                        <p className="text-xs text-deep/50 font-medium leading-relaxed mt-1 mb-2">
                                                            50+ printable coloring pages, mazes, and word searches.
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-primary">${UPSELLS.digital_activity_super_pack.price.toFixed(2)}</span>
                                                            <span className="text-xs font-bold text-deep/30 line-through">$15.00</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Upsell 2: Heritage Story */}
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, hasHeritageStory: !prev.hasHeritageStory }))}
                                                className={`w-full text-left bg-zinc-50 border-2 rounded-2xl p-6 transition-all ${formData.hasHeritageStory ? 'border-primary bg-primary/5' : 'border-dashed border-zinc-200 hover:bg-zinc-100'}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-2xl shrink-0">
                                                        🧬
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-black text-deep text-sm">Heritage DNA Story</h4>
                                                            {formData.hasHeritageStory && <CheckCircle2 size={18} className="text-primary" />}
                                                        </div>
                                                        <p className="text-xs text-deep/50 font-medium leading-relaxed mt-1 mb-2">
                                                            A deeply personalized story based on your family heritage.
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-primary">${UPSELLS.heritage_dna_story.price.toFixed(2)}</span>
                                                            <span className="text-xs font-bold text-deep/30 line-through">$29.99</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Upsell 3: Grandparent Dashboard */}
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, addGrandparent: !prev.addGrandparent }))}
                                                className={`w-full text-left bg-zinc-50 border-2 rounded-2xl p-6 transition-all ${formData.addGrandparent ? 'border-primary bg-primary/5' : 'border-dashed border-zinc-200 hover:bg-zinc-100'}`}
                                            >
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-2xl shrink-0">
                                                        👵🏽
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-black text-deep text-sm">Grandparent Mirror Dashboard</h4>
                                                            {formData.addGrandparent && <CheckCircle2 size={18} className="text-primary" />}
                                                        </div>
                                                        <p className="text-xs text-deep/50 font-medium leading-relaxed mt-1 mb-2">
                                                            Limited Time: Include extended family in their journey for FREE.
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black text-primary">FREE</span>
                                                            <span className="text-xs font-bold text-deep/30 line-through">$10.00</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>

                                        {/* Discount Code */}
                                        <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl p-4">
                                            <p className="text-xs font-bold text-deep/50 uppercase tracking-wider mb-2">Have a discount code?</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={discountCode}
                                                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                                    placeholder="Enter code"
                                                    className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold focus:border-primary focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={validateDiscountCode}
                                                    disabled={isValidatingDiscount || !discountCode.trim()}
                                                    className="px-5 py-2.5 bg-deep text-white rounded-xl text-sm font-black hover:bg-deep/90 transition-colors disabled:opacity-50"
                                                >
                                                    {isValidatingDiscount ? "..." : "Apply"}
                                                </button>
                                            </div>
                                            {discountValid?.valid && (
                                                <p className="text-xs font-bold text-green-600 mt-2 flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> {discountValid.description} applied
                                                </p>
                                            )}
                                        </div>

                                        {/* Step 3 Navigation */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="flex items-center gap-2 px-5 py-4 text-deep/50 hover:text-deep hover:bg-zinc-100 rounded-2xl font-bold text-sm transition-all"
                                            >
                                                <ArrowLeft size={16} />
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleNext}
                                                className="flex-1 py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                            >
                                                Continue to Payment
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-deep tracking-tight">
                                                {formData.planKey === 'plan_free_forever' ? 'Your free account is ready.' : 'Start Free — Pay Later.'}
                                            </h3>
                                            <p className="text-deep/40 text-sm font-medium">
                                                {formData.planKey === 'plan_free_forever'
                                                    ? 'Free forever • No credit card required • upgrade anytime.'
                                                    : '7-day free trial • $0 charged today • cancel anytime.'}
                                            </p>
                                        </div>

                                        {/* Order Review Summary */}
                                        <div className="bg-zinc-50 rounded-2xl border border-zinc-100 p-5 space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-deep/30 mb-3">Order Review</p>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-deep/50 font-medium">Plan</span>
                                                    <span className="font-bold text-deep">
                                                        {SUBSCRIPTION_PLANS[formData.planKey as keyof typeof SUBSCRIPTION_PLANS]?.name || 'Legend Pass'}
                                                    </span>
                                                </div>
                                                {formData.childName && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-deep/50 font-medium">Little Legend</span>
                                                        <span className="font-bold text-deep">{formData.childName}</span>
                                                    </div>
                                                )}
                                                {formData.heritage && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-deep/50 font-medium">Heritage Island</span>
                                                        <span className="font-bold text-deep">
                                                            {heritages.find(h => h.code === formData.heritage)?.flag}{' '}
                                                            {heritages.find(h => h.code === formData.heritage)?.name}
                                                        </span>
                                                    </div>
                                                )}
                                                {formData.hasUpsell && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-deep/50 font-medium">Digital Activity Pack</span>
                                                        <span className="font-bold text-primary">+$5.00</span>
                                                    </div>
                                                )}
                                                {formData.hasHeritageStory && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-deep/50 font-medium">Heritage DNA Story</span>
                                                        <span className="font-bold text-primary">+$14.99</span>
                                                    </div>
                                                )}
                                                <div className="border-t border-zinc-200 pt-2 mt-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-black text-deep">Due Today</span>
                                                        <span className="font-black text-green-600 text-lg">
                                                            {formData.planKey === 'plan_free_forever' ? `$${calculateTotal()}` : '$0.00'}
                                                        </span>
                                                    </div>
                                                    {formData.planKey !== 'plan_free_forever' && (
                                                        <p className="text-[10px] text-deep/30 font-medium mt-1">
                                                            Then ${calculateTotal()}/month starting{' '}
                                                            {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-6 shadow-sm">
                                            {/* PayPal Button Container */}
                                            <div className="relative min-h-[150px] flex flex-col justify-center">
                                                {formData.planKey === 'plan_free_forever' && calculateOneTimeTotal() === 0 ? (
                                                    <button
                                                        onClick={() => {
                                                            const uid = searchParams.get('uid') || '';
                                                            const childName = formData.childName || searchParams.get('childName') || '';
                                                            router.push(`/onboarding/welcome?childName=${encodeURIComponent(childName)}${uid ? `&uid=${uid}` : ''}`);
                                                        }}
                                                        className="w-full py-5 bg-[var(--caribbean-ocean)] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                    >
                                                        Activate Free Account
                                                    </button>
                                                ) : (
                                                    <PayPalButtons
                                                        style={{ layout: "vertical", shape: "rect", borderRadius: 12, height: 48 }}
                                                        createOrder={formData.planKey === 'plan_free_forever' ? (_data, actions) => {
                                                            return actions.order.create({
                                                                intent: 'CAPTURE',
                                                                purchase_units: [{
                                                                    amount: {
                                                                        currency_code: 'USD',
                                                                        value: calculateOneTimeTotal().toFixed(2)
                                                                    },
                                                                    description: "Likkle Legends Digital Items"
                                                                }]
                                                            });
                                                        } : undefined}
                                                        createSubscription={formData.planKey !== 'plan_free_forever' ? (_data, actions) => {
                                                            const selectedPlan = SUBSCRIPTION_PLANS[formData.planKey as keyof typeof SUBSCRIPTION_PLANS];
                                                            const targetPlanId = selectedPlan?.paypalPlanId;

                                                            if (!targetPlanId) {
                                                                console.error(`[PayPal] Missing Plan ID for tier: ${formData.planKey}`);
                                                                toast.error("Payment configuration is incomplete. Please contact support@likklelegends.com to set up this payment plan.");
                                                                throw new Error(`Missing PayPal Plan ID for tier: ${formData.planKey}`);
                                                            }

                                                            // 7-day free trial: delay first billing by 7 days
                                                            const trialEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                                                            const setupFee = calculateOneTimeTotal();

                                                            return (actions.subscription.create as any)({
                                                                plan_id: targetPlanId,
                                                                start_time: trialEndDate.toISOString(),
                                                                plan: setupFee > 0 ? {
                                                                    payment_preferences: {
                                                                        setup_fee: {
                                                                            value: setupFee.toFixed(2),
                                                                            currency_code: 'USD'
                                                                        }
                                                                    }
                                                                } as any : undefined
                                                            });
                                                        } : undefined}
                                                        onApprove={async (data, _actions) => {
                                                            try {
                                                                const { data: sessionData } = await supabase.auth.getSession();
                                                                const token = sessionData?.session?.access_token;

                                                                const res = await fetch('/api/payments/paypal/confirm', {
                                                                    method: 'POST',
                                                                    headers: {
                                                                        'Content-Type': 'application/json',
                                                                        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                                                                    },
                                                                    body: JSON.stringify({
                                                                        subscriptionId: data.subscriptionID,
                                                                        orderId: data.orderID,
                                                                        tier: formData.planKey,
                                                                        email: formData.email,
                                                                        addGrandparent: formData.addGrandparent,
                                                                        billingCycle: 'month',
                                                                        currency: 'USD',
                                                                        hasUpsell: formData.hasUpsell,
                                                                        hasHeritageStory: formData.hasHeritageStory,
                                                                        childName: formData.childName,
                                                                        heritage: formData.heritage
                                                                    }),
                                                                });

                                                                if (res.ok) {
                                                                    setIsComplete(true);
                                                                } else {
                                                                    const err = await res.json().catch(() => ({}));
                                                                    console.error('Confirm error:', err);
                                                                    toast.error('Payment received but account setup failed. Please contact support.');
                                                                }
                                                            } catch (err) {
                                                                console.error('Confirm fetch failed:', err);
                                                                toast.error('Payment received but account setup failed. Please contact support.');
                                                            }
                                                        }}
                                                        onError={(err) => {
                                                            console.error("PayPal Error:", err);
                                                            toast.error("Payment could not be initialized. Please try again or contact support.");
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            <p className="text-[9px] text-deep/30 font-medium leading-relaxed text-center">
                                                Payments are processed securely by PayPal. You can use your PayPal balance or pay directly with a Debit/Credit Card.
                                            </p>
                                        </div>

                                        {/* Step 4 Back Button */}
                                        <button
                                            type="button"
                                            onClick={handleBack}
                                            className="flex items-center gap-2 text-deep/40 hover:text-deep font-bold text-sm transition-all mx-auto"
                                        >
                                            <ArrowLeft size={16} />
                                            Back to previous step
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
        </PayPalScriptProvider>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
