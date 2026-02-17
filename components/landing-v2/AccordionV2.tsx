"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, ShieldCheck, Sparkles, MessageCircleQuestion } from "lucide-react";

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
        <section className="py-20 sm:py-32 lg:py-48 bg-deep relative overflow-hidden">
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[150px] -ml-96 -mb-96"></div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 sm:gap-20 lg:gap-32 items-start">
                    {/* Sidebar Title */}
                    <div className="lg:w-1/3 text-white space-y-6 sm:space-y-12">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-primary-gradient rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-primary/20">
                            <MessageCircleQuestion size={32} className="text-white sm:hidden" />
                            <MessageCircleQuestion size={48} className="text-white hidden sm:block" />
                        </div>
                        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
                            Common Island <br /><span className="text-gradient italic">Questions.</span>
                        </h2>
                        <p className="text-base sm:text-xl lg:text-2xl text-white/40 font-medium leading-relaxed max-w-sm">
                            Everything you need to know about the Legend Envelope and the Digital Magic.
                        </p>

                        <div className="hidden sm:flex p-6 sm:p-10 glass-morphism border-white/10 bg-white/5 rounded-2xl sm:rounded-[3.5rem] mt-10 sm:mt-16 gap-6 sm:gap-8 items-center border">
                            <div className="w-16 h-16 bg-success/20 rounded-2xl flex items-center justify-center text-success">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <p className="text-xl font-black text-white italic leading-none mb-2">COPPA Compliant</p>
                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-loose">Kid-Safe Privacy First</p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Items */}
                    <div className="lg:w-2/3 w-full space-y-4 sm:space-y-8">
                        {items.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.8 }}
                                className={`rounded-2xl sm:rounded-[3rem] transition-all duration-700 overflow-hidden border ${openIndex === i
                                    ? 'bg-white shadow-premium-xl scale-[1.02] border-transparent'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                    className="w-full p-5 sm:p-10 lg:p-14 flex items-center justify-between text-left group gap-4 sm:gap-8"
                                >
                                    <span className={`text-base sm:text-2xl lg:text-3xl font-black tracking-tighter leading-tight ${openIndex === i ? 'text-deep' : 'text-white'
                                        }`}>
                                        {item.q}
                                    </span>
                                    <div className={`flex-shrink-0 w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${openIndex === i
                                        ? 'bg-deep text-white rotate-180'
                                        : 'bg-white/10 text-white group-hover:bg-primary group-hover:text-white'
                                        }`}>
                                        {openIndex === i ? <Minus size={20} /> : <Plus size={20} />}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {openIndex === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            <div className="px-5 pb-8 sm:px-10 sm:pb-14 lg:px-14 lg:pb-20 text-deep/60 text-sm sm:text-xl leading-relaxed font-medium">
                                                <div className="pt-8 border-t border-zinc-50">
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
