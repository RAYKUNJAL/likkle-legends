"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2, Globe, ShieldCheck } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { joinWaitlistAction } from "@/app/actions/identity-actions";
import { NavbarV2 } from "@/components/landing-v2/NavbarV2";
import { FooterV2 } from "@/components/landing-v2/FooterV2";

export default function WaitlistPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "already_exists" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("loading");
        const result = await joinWaitlistAction(email, { source: "waitlist_page" });

        if (result.success) {
            if (result.alreadyExists) {
                setStatus("already_exists");
            } else {
                setStatus("success");
            }
        } else {
            setStatus("error");
        }
    };

    return (
        <main className="min-h-screen bg-white">
            <NavbarV2 />

            <section className="pt-32 pb-20 sm:pt-56 sm:pb-32 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -mr-96 -mt-96"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -ml-96 -mb-96"></div>

                <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <div className="max-w-2xl mx-auto space-y-8 sm:space-y-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-deep/5 rounded-full"
                        >
                            <Sparkles size={14} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-deep/40">Opening Soon Globally</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl sm:text-7xl font-black text-deep tracking-tighter leading-[0.95]"
                        >
                            Join the Legend <br />
                            <span className="text-gradient italic">Waitlist.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-base sm:text-xl text-deep/50 font-medium max-w-lg mx-auto leading-relaxed"
                        >
                            We are currently rolling out the Legend Envelope program to families in the US. Join the waitlist to be first in line for our next island drop and international expansion (CA/UK/EU).
                        </motion.p>

                        {/* Form Area */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative max-w-md mx-auto"
                        >
                            {status === "success" || status === "already_exists" ? (
                                <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center text-success">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-black text-deep tracking-tight">
                                            {status === "success" ? "You're on the list!" : "You're already listed!"}
                                        </h3>
                                        <p className="text-deep/40 font-medium text-sm mt-2">
                                            We'll email you as soon as a spot opens up for your region.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        required
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex-1 px-8 py-5 bg-zinc-50 border border-zinc-100 rounded-full font-bold text-deep placeholder:text-deep/20 focus:outline-none focus:border-primary/30 focus:bg-white transition-all shadow-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={status === "loading"}
                                        className="px-10 py-5 bg-primary text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {status === "loading" ? "Joining..." : (
                                            <>
                                                Join Fast
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                            {status === "error" && (
                                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-4">Something went wrong. Please try again.</p>
                            )}
                        </motion.div>

                        {/* Trust Info */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center justify-center gap-8 pt-8"
                        >
                            <div className="flex items-center gap-2">
                                <Globe size={14} className="text-primary" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-deep/30">Active in 30+ Islands</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={14} className="text-success" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-deep/30">Kid-Safe Certified</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <FooterV2 />
        </main>
    );
}
