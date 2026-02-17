"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, Sparkles, MapPin, BookOpen, Music, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export const LegendKeyUnlocker = () => {
    const [code, setCode] = useState("");
    const [status, setStatus] = useState<"idle" | "verifying" | "success" | "invalid">("idle");
    const [islandData, setIslandData] = useState<{ name: string; icon: string } | null>(null);

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;

        setStatus("verifying");

        // Simulating the "AI Agent" verification/Island Pack matching
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Logic simulator: T&T, JAM, BAR codes
        if (code.toUpperCase().includes("TRINI") || code.toUpperCase().includes("TT")) {
            setIslandData({ name: "Trinidad & Tobago Heritage Pack", icon: "🇹🇹" });
            setStatus("success");
        } else if (code.toUpperCase().includes("JAM") || code.toUpperCase().includes("JA")) {
            setIslandData({ name: "Jamaica Heritage Pack", icon: "🇯🇲" });
            setStatus("success");
        } else if (code.toUpperCase().includes("BAR") || code.toUpperCase().includes("BB")) {
            setIslandData({ name: "Barbados Heritage Pack", icon: "🇧🇧" });
            setStatus("success");
        } else if (code.length >= 6) {
            // Default random pack for valid-looking codes
            setIslandData({ name: "Caribbean Adventure Pack", icon: "🏝️" });
            setStatus("success");
        } else {
            setStatus("invalid");
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-premium border border-zinc-100 overflow-hidden relative">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#023047 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

            <div className="relative z-10 max-w-xl mx-auto text-center space-y-8">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-primary">
                    <Key size={40} className={status === "verifying" ? "animate-pulse" : ""} />
                </div>

                <div className="space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-black text-deep tracking-tighter">
                        Unlock Your <span className="text-gradient italic">Legend Pack.</span>
                    </h2>
                    <p className="text-deep/50 font-medium">
                        Enter the unique 6-digit Legend Key Code from your physical Legend Envelope to unlock your digital island treasure.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {status === "success" && islandData ? (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-zinc-50 rounded-[2rem] p-8 border border-zinc-100 space-y-6"
                        >
                            <div className="flex items-center justify-center gap-4 text-4xl">
                                <span>{islandData.icon}</span>
                                <CheckCircle2 className="text-success" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-deep tracking-tight">{islandData.name} Unlocked!</h3>
                                <p className="text-deep/40 text-sm mt-1 font-bold uppercase tracking-widest">Bonus Content Synchronizing...</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { icon: BookOpen, label: "Stories" },
                                    { icon: Music, label: "Radio" },
                                    { icon: MapPin, label: "Map" },
                                ].map(item => (
                                    <div key={item.label} className="bg-white p-4 rounded-2xl border border-zinc-100 flex flex-col items-center gap-2">
                                        <item.icon size={18} className="text-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-deep/30">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-4 bg-deep text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2">
                                Enter Island Hub
                                <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            onSubmit={handleUnlock}
                            className="space-y-4"
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit code (e.g. TRINI1)"
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value.toUpperCase());
                                        if (status === "invalid") setStatus("idle");
                                    }}
                                    className={`w-full px-8 py-5 bg-zinc-50 border ${status === "invalid" ? 'border-red-200 bg-red-50' : 'border-zinc-100'} rounded-2xl font-black text-deep tracking-[0.2em] text-center placeholder:text-deep/10 focus:outline-none focus:border-primary/30 focus:bg-white transition-all text-xl`}
                                />
                                <div className="absolute top-1/2 right-6 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                    <Sparkles size={16} className={`${code.length >= 6 ? 'text-primary' : 'text-zinc-200'} transition-colors`} />
                                </div>
                            </div>
                            {status === "invalid" && (
                                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest italic">Invalid Legend Key. Please check the code in your envelope.</p>
                            )}
                            <button
                                type="submit"
                                disabled={status === "verifying" || code.length < 4}
                                className="w-full py-5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {status === "verifying" ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Verifying Legend Key...
                                    </>
                                ) : "Unlock Island Pack"}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <p className="text-[10px] font-bold uppercase tracking-widest text-deep/25">
                    Don't have a code yet? <Link href="/#pricing" className="text-primary hover:underline">Get a Legend Envelope</Link>
                </p>
            </div>
        </div>
    );
};
