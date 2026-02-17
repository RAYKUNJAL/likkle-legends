"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Globe, MapPin, Languages, User, ShieldCheck, Mail, Star, ChevronDown, Clock, X, Bell, Zap, Play } from "lucide-react";
import Image from "next/image";

const islands = [
    "Jamaica", "Trinidad & Tobago", "Barbados", "The Bahamas", "Guyana",
    "Haiti", "Dominican Republic", "St. Lucia", "Grenada", "Antigua & Barbuda",
    "St. Kitts & Nevis", "Dominica", "St. Vincent", "Belize", "Suriname",
    "Bermuda", "Cayman Islands", "Turks & Caicos", "U.S. Virgin Islands",
    "British Virgin Islands", "Montserrat", "Anguilla", "Curaçao", "Aruba",
    "Bonaire", "Sint Maarten", "Martinique", "Guadeloupe", "Puerto Rico",
    "Cuban Heritage", "Diaspora (USA/UK/Canada)"
];

const dialects = [
    { label: "Standard English", available: true },
    { label: "Trini", available: true },
    { label: "Jamaican Patois", available: true },
    { label: "Bajan", available: false },
];

const ageBands = ["3–5", "5–7", "7–9"];

const shippingCountries = [
    { label: "United States", tag: "LIVE", comingSoon: false },
    { label: "Canada", tag: "Coming Soon", comingSoon: true },
    { label: "United Kingdom", tag: "Coming Soon", comingSoon: true },
];

export const InteractivePassportHero = () => {
    const [childName, setChildName] = useState("");
    const [selectedIsland, setSelectedIsland] = useState("");
    const [selectedAge, setSelectedAge] = useState("3–5");
    const [selectedDialect, setSelectedDialect] = useState("Standard English");
    const [selectedCountry, setSelectedCountry] = useState("United States");
    const [showWaitlistModal, setShowWaitlistModal] = useState(false);

    const isComingSoon = shippingCountries.find(c => c.label === selectedCountry)?.comingSoon;
    const isComplete = childName.trim() && selectedIsland && selectedAge;

    const handleCountryChange = (value: string) => {
        setSelectedCountry(value);
        const country = shippingCountries.find(c => c.label === value);
        if (country?.comingSoon) {
            setShowWaitlistModal(true);
        }
    };

    return (
        <>
            <section className="relative min-h-[100dvh] lg:min-h-screen flex items-center overflow-hidden bg-[#FFFDF7]" id="hero">
                {/* Video Background / Placeholder */}
                {/* Background Blobs - Enhanced for No Image */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-primary/[0.08] rounded-full blur-[100px] sm:blur-[150px] -mr-[200px] sm:-mr-[400px] -mt-[200px] sm:-mt-[400px]"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-secondary/[0.08] rounded-full blur-[100px] sm:blur-[150px] -ml-[150px] sm:-ml-[300px] -mb-[150px] sm:-mb-[300px]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[1000px] h-[600px] sm:h-[1000px] bg-white rounded-full blur-[80px] sm:blur-[120px] opacity-60"></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 py-20 lg:py-0 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20 pt-24 lg:pt-40 lg:pb-20">

                        {/* Left: Headline + Trust */}
                        <div className="flex-1 space-y-5 sm:space-y-8 text-center lg:text-left">
                            {/* Eyebrow */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-3 px-5 py-2.5 bg-white rounded-full shadow-sm border border-zinc-100"
                            >
                                <div className="flex -space-x-1.5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white overflow-hidden bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary">
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-deep/40">2k+ Diaspora Families Active</span>
                                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-black text-deep leading-tight sm:leading-[0.95] tracking-tighter"
                            >
                                Give Your Child the{" "}
                                <span className="text-gradient italic">Islands.</span>{" "}
                                <span className="block mt-2">Start for $10.</span>
                            </motion.h1>

                            {/* Subheadline */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="text-base sm:text-lg lg:text-xl text-deep/50 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium"
                            >
                                A personalized learning adventure that starts instantly in the portal—and arrives in the mail as a Legend Envelope (US mail only). Built for kids ages 3–9.
                            </motion.p>

                            {/* Trust Row */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0"
                            >
                                {[
                                    { icon: ShieldCheck, label: "Kid-safe & ad-free portal", color: "text-success" },
                                    { icon: Zap, label: "Instant access after purchase", color: "text-primary" },
                                    { icon: Mail, label: "US mail letters (CA/UK soon)", color: "text-deep/40" },
                                    { icon: Star, label: "30-Day Triple Promise", color: "text-yellow-500" },
                                ].map(({ icon: Icon, label, color }) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <Icon size={14} className={color} />
                                        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-deep/30">{label}</span>
                                    </div>
                                ))}
                            </motion.div>

                            {/* Character Collage Strip */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45 }}
                                className="flex items-center gap-3 justify-center lg:justify-start pt-2 sm:pt-4"
                            >
                                <div className="flex -space-x-3">
                                    {[
                                        { src: "/images/dilly-doubles.jpg", alt: "Dilly Doubles" },
                                        { src: "/images/roti-new.jpg", alt: "R.O.T.I." },
                                        { src: "/images/tanty_spice_avatar.jpg", alt: "Tanty Spice" },
                                        { src: "/images/steelpan_sam.png", alt: "Steelpan Sam" },
                                        { src: "/images/mango_moko.png", alt: "Mango Moko" },
                                        { src: "/images/benny-of-shadows.jpg", alt: "Benny" },
                                    ].map((char) => (
                                        <div key={char.alt} className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-[3px] border-white overflow-hidden shadow-sm bg-zinc-100">
                                            <Image src={char.src} alt={char.alt} fill className="object-cover" sizes="40px" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-deep/30">6 Characters · 30+ Islands</span>
                            </motion.div>
                        </div>

                        {/* Right: Passport Builder Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            className="flex-1 w-full max-w-md lg:max-w-lg"
                        >
                            <div className="relative">
                                <div className="absolute -inset-3 bg-primary/10 rounded-[3.5rem] blur-2xl opacity-60"></div>

                                <div className="relative bg-white rounded-[2rem] sm:rounded-[3rem] shadow-premium border border-zinc-100 overflow-hidden">
                                    {/* Header */}
                                    <div className="bg-deep p-4 sm:p-6 pb-6 sm:pb-8">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                                                <Globe size={18} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-white font-black text-sm tracking-tight">Create Your Child&apos;s Digital Passport</p>
                                                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Personalized in 30 seconds</p>
                                            </div>
                                        </div>
                                        {/* Progress */}
                                        <div className="flex gap-1.5 mt-4">
                                            {[
                                                { label: "Name", done: !!childName },
                                                { label: "Island", done: !!selectedIsland },
                                                { label: "Age", done: !!selectedAge },
                                                { label: "Ship", done: !!selectedCountry },
                                            ].map((s) => (
                                                <div key={s.label} className="flex-1">
                                                    <div className={`h-1 rounded-full transition-all duration-500 ${s.done ? 'bg-primary' : 'bg-white/10'}`}></div>
                                                    <p className="text-[7px] font-bold uppercase tracking-widest text-white/25 mt-1.5">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Fields */}
                                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                                        {/* Name */}
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-deep/30 flex items-center gap-1.5">
                                                <User size={10} /> Child&apos;s First Name
                                            </label>
                                            <input
                                                type="text"
                                                value={childName}
                                                onChange={(e) => setChildName(e.target.value)}
                                                placeholder="e.g. Mason"
                                                className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-deep font-bold text-sm sm:text-base placeholder:text-deep/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>

                                        {/* Island */}
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-deep/30 flex items-center gap-1.5">
                                                <MapPin size={10} /> Select Your Heritage
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedIsland}
                                                    onChange={(e) => setSelectedIsland(e.target.value)}
                                                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-deep font-bold text-sm sm:text-base appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                >
                                                    <option value="">Choose an island...</option>
                                                    {islands.map(island => (
                                                        <option key={island} value={island}>{island}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-deep/20 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Age Band Toggle */}
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-deep/30 flex items-center gap-1.5">
                                                <Clock size={10} /> Choose Age
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {ageBands.map(a => (
                                                    <button
                                                        key={a}
                                                        onClick={() => setSelectedAge(a)}
                                                        className={`px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black transition-all border ${selectedAge === a
                                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                            : 'bg-zinc-50 text-deep/50 border-zinc-100 hover:border-primary/30'
                                                            }`}
                                                    >
                                                        {a}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Dialect */}
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-deep/30 flex items-center gap-1.5">
                                                <Languages size={10} /> Dialect <span className="text-deep/15 normal-case">(optional)</span>
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {dialects.map(d => (
                                                    <button
                                                        key={d.label}
                                                        onClick={() => d.available && setSelectedDialect(d.label)}
                                                        className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all border relative ${!d.available
                                                            ? 'bg-zinc-50/50 text-deep/15 border-zinc-50 cursor-not-allowed'
                                                            : selectedDialect === d.label
                                                                ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20'
                                                                : 'bg-zinc-50 text-deep/50 border-zinc-100 hover:border-secondary/30'
                                                            }`}
                                                        disabled={!d.available}
                                                    >
                                                        {d.label}
                                                        {/* {!d.available && <span className="absolute -top-1.5 -right-1.5 text-[7px] font-black uppercase bg-zinc-200 text-deep/30 px-1.5 py-0.5 rounded-full">Soon</span>} */}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Shipping Country */}
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-deep/30 flex items-center gap-1.5">
                                                <Mail size={10} /> Mail Country
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedCountry}
                                                    onChange={(e) => handleCountryChange(e.target.value)}
                                                    className="w-full px-4 sm:px-5 py-3 sm:py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-deep font-bold text-sm sm:text-base appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                >
                                                    {shippingCountries.map(c => (
                                                        <option key={c.label} value={c.label}>
                                                            {c.label} ({c.tag})
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-deep/20 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <motion.button
                                            whileHover={isComplete && !isComingSoon ? { scale: 1.02 } : {}}
                                            whileTap={isComplete && !isComingSoon ? { scale: 0.98 } : {}}
                                            className={`w-full py-3.5 sm:py-4 rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all mt-2 ${isComplete && !isComingSoon
                                                ? 'bg-primary text-white shadow-xl shadow-primary/30 cursor-pointer'
                                                : isComingSoon
                                                    ? 'bg-deep text-white cursor-pointer'
                                                    : 'bg-zinc-100 text-deep/20 cursor-not-allowed'
                                                }`}
                                            disabled={!isComplete}
                                            onClick={() => isComingSoon && setShowWaitlistModal(true)}
                                        >
                                            <Sparkles size={18} />
                                            {isComingSoon
                                                ? "Join Canada/UK Waitlist"
                                                : isComplete
                                                    ? `Issue ${childName}'s $10 Legend Pass`
                                                    : "Complete All Fields Above"
                                            }
                                            {(isComplete || isComingSoon) && <ArrowRight size={18} />}
                                        </motion.button>

                                        {/* Micro Steps */}
                                        <div className="hidden sm:flex items-center justify-center gap-4 pt-1">
                                            {["Create passport", "Instant portal access", "US Envelope + Key Code"].map((s, i) => (
                                                <div key={s} className="flex items-center gap-1.5">
                                                    <span className="w-4 h-4 rounded-full bg-zinc-100 text-[8px] font-black text-deep/30 flex items-center justify-center">{i + 1}</span>
                                                    <span className="text-[8px] font-bold text-deep/20 uppercase tracking-wider">{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="sm:hidden text-center text-[8px] font-bold text-deep/15 uppercase tracking-widest pt-1">Secure · No Subscription Required</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Waitlist Modal */}
            <AnimatePresence>
                {showWaitlistModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-deep/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
                        onClick={() => setShowWaitlistModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-premium-xl max-w-md w-full p-6 sm:p-10 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowWaitlistModal(false)} className="absolute top-6 right-6 w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-deep/40 hover:text-deep transition-colors">
                                <X size={18} />
                            </button>

                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <Bell size={28} className="text-primary" />
                            </div>

                            <h3 className="text-2xl font-black text-deep tracking-tight mb-3">Canada + UK Mail Coming Soon</h3>
                            <p className="text-deep/50 font-medium leading-relaxed mb-8">
                                We&apos;re starting with US mail first. Join the waitlist and we&apos;ll notify you the moment Canada/UK Legend Envelopes go live. You still get <strong className="text-deep">full portal access instantly!</strong>
                            </p>

                            <div className="space-y-3">
                                <Link
                                    href="/waitlist"
                                    className="w-full py-4 bg-primary text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    <Bell size={16} /> Join the Waitlist
                                </Link>
                                <Link
                                    href="/checkout"
                                    className="w-full py-4 bg-zinc-50 text-deep border border-zinc-100 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:border-primary/30 transition-all"
                                >
                                    Continue as Digital Explorer (Free)
                                </Link>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
