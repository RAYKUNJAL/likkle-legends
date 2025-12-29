"use client";

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { siteContent } from '@/lib/content';

export default function FAQ() {
    const { faq } = siteContent;
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 bg-white relative">
            <div className="container max-w-4xl relative z-10">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-black text-deep">{faq.title}</h2>
                    <p className="text-xl text-deep/60">{faq.subtitle}</p>
                </div>

                <div className="space-y-4">
                    {faq.items.map((item, i) => (
                        <div key={i} className={`border-2 rounded-[2.5rem] transition-all duration-300 overflow-hidden ${openIndex === i ? 'border-primary bg-zinc-50' : 'border-zinc-100 bg-white hover:border-zinc-200'
                            }`}>
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full p-8 text-left flex items-center justify-between group"
                            >
                                <span className={`text-xl font-black transition-colors ${openIndex === i ? 'text-primary' : 'text-deep'}`}>
                                    {item.question}
                                </span>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${openIndex === i
                                        ? 'bg-primary text-white rotate-180 shadow-lg shadow-primary/20'
                                        : 'bg-zinc-100 text-deep group-hover:bg-zinc-200'
                                    }`}>
                                    {openIndex === i ? <Minus size={20} /> : <Plus size={20} />}
                                </div>
                            </button>
                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === i ? 'max-h-[500px] opacity-100 pb-8 px-8' : 'max-h-0 opacity-0'}`}>
                                <div className="text-lg text-deep/70 leading-relaxed border-t border-zinc-200/50 pt-6">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background blur */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -mb-48 -mr-48 pointer-events-none"></div>
        </section>
    );
}
