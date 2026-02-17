"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, ShieldCheck } from "lucide-react";

interface FAQItem {
    q: string;
    a: string;
}

interface AccordionProps {
    items: FAQItem[];
}

export const AccordionV2 = ({ items }: AccordionProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-32 bg-deep relative overflow-hidden">
            {/* Background element */}
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -mr-96 -mb-96"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-24 items-start">
                    <div className="lg:w-1/3 text-white space-y-8">
                        <div className="w-20 h-20 bg-primary/20 text-primary rounded-[2rem] flex items-center justify-center mb-8">
                            <HelpCircle size={40} />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight">
                            Common Island <br /><span className="text-primary italic">Questions</span>.
                        </h2>
                        <p className="text-xl text-white/50 font-medium">Everything you need to know about the Legend Envelope and our portal.</p>

                        <div className="p-8 glass-card border-white/5 bg-white/5 rounded-[2.5rem] mt-12 flex gap-6 items-center">
                            <ShieldCheck className="w-12 h-12 text-primary flex-shrink-0" />
                            <div>
                                <p className="font-black text-white italic">COPPA Compliant</p>
                                <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-loose">Kid-Safe Privacy first environment</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-2/3 w-full space-y-6">
                        {items.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`rounded-[2.5rem] transition-all duration-500 overflow-hidden ${openIndex === i ? 'bg-white shadow-2xl scale-[1.02]' : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    className="w-full p-8 lg:p-10 flex items-center justify-between text-left group"
                                >
                                    <span className={`text-xl lg:text-2xl font-black tracking-tight ${openIndex === i ? 'text-deep' : 'text-white'}`}>
                                        {item.q}
                                    </span>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${openIndex === i ? 'bg-deep text-white rotate-180' : 'bg-white/10 text-white group-hover:bg-primary group-hover:text-white'
                                        }`}>
                                        {openIndex === i ? <Minus size={24} /> : <Plus size={24} />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {openIndex === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="px-8 pb-10 lg:px-10 lg:pb-12 text-deep/60 text-lg leading-relaxed font-medium">
                                                <div className="pt-4 border-t border-zinc-100">
                                                    {item.a}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
