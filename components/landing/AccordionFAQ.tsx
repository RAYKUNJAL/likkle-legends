'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const FAQS = [
    {
        q: "Is there really a Forever Free plan?",
        a: "Yes. Forever Free gives starter access to stories, music, and activities. Upgrade anytime to unlock the full library."
    },
    {
        q: "Where do you ship the mail packs?",
        a: "We’re starting with USA shipping only. Digital access is available worldwide."
    },
    {
        q: "What’s inside the $10 Intro Envelope?",
        a: "A physical activity pack plus a QR/code that unlocks bigger digital assets (Story Studio, Island Radio, and bonus printables)."
    },
    {
        q: "Is this safe for kids?",
        a: "Yes—ad-free and parent-controlled. There is no public chat and no strangers."
    },
    {
        q: "What ages is it for?",
        a: "Best for ages 4–8, with content that can grow with your child."
    },
    {
        q: "Can I cancel anytime?",
        a: "Yes. If you choose a subscription plan, you can cancel anytime from your account settings."
    }
];

function FAQItem({ item, isOpen, onClick }: { item: any, isOpen: boolean, onClick: () => void }) {
    return (
        <div className="border-b border-zinc-100">
            <button
                onClick={onClick}
                className="w-full py-8 flex items-center justify-between text-left group"
            >
                <h3 className={`text-xl font-black transition-colors ${isOpen ? 'text-emerald-600' : 'text-deep group-hover:text-emerald-500'}`}>
                    {item.q}
                </h3>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-emerald-500 text-white rotate-180' : 'bg-zinc-100 text-deep'}`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-8 text-deep/60 font-medium leading-relaxed max-w-3xl">
                            {item.a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AccordionFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-deep">Quick Answers</h2>
                    </motion.div>

                    <div className="border-t border-zinc-100">
                        {FAQS.map((faq, idx) => (
                            <FAQItem
                                key={idx}
                                item={faq}
                                isOpen={openIndex === idx}
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            />
                        ))}
                    </div>

                    <div className="mt-16 p-8 bg-emerald-50 rounded-3xl text-center">
                        <p className="text-deep font-bold italic mb-4">"Still have questions?"</p>
                        <button className="text-emerald-600 font-black uppercase tracking-widest text-sm hover:underline">
                            Contact our Island Support Team
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
