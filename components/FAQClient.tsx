"use client";

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { siteContent } from '@/lib/content';

export default function FAQClient() {
    return (
        <div className="container max-w-4xl">
            <div className="space-y-4 mb-16 text-center">
                <span className="text-secondary font-bold uppercase tracking-widest text-sm">Got Questions?</span>
                <h1 className="text-5xl lg:text-7xl font-black text-deep">Everything you need to know</h1>
                <p className="text-xl text-deep/60 max-w-2xl mx-auto">
                    {siteContent.faq.subtitle}
                </p>
            </div>

            <div className="space-y-4">
                {siteContent.faq.items.map((item, i) => (
                    <FAQItem key={i} question={item.question} answer={item.answer} index={i} />
                ))}
            </div>

            <div className="mt-20 p-12 rounded-[4rem] bg-deep text-white text-center space-y-8">
                <h2 className="text-4xl font-black">Still have questions?</h2>
                <p className="text-white/60 text-lg max-w-xl mx-auto">
                    Our team is here to help you and your little legend. We usually respond within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/contact" className="btn btn-primary btn-lg px-12 py-6 text-xl">
                        Contact Support
                    </Link>
                    <button
                        onClick={() => {
                            const widget = document.querySelector('button[class*="bg-accent"]');
                            if (widget instanceof HTMLElement) widget.click();
                        }}
                        className="btn border-2 border-white/20 hover:bg-white/10 text-white btn-lg px-12 py-6 text-xl"
                    >
                        Chat with Tanty
                    </button>
                </div>
            </div>
        </div>
    );
}

function FAQItem({ question, answer, index }: { question: string, answer: string, index: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={`bg-white rounded-[2.5rem] border transition-all duration-300 ${isOpen ? 'border-primary shadow-xl shadow-primary/5' : 'border-zinc-100 hover:border-zinc-200'
                }`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-8 lg:p-10 text-left group"
            >
                <div className="flex items-center gap-6">
                    <span className="text-deep/20 font-black text-2xl group-hover:text-primary transition-colors">
                        {(index + 1).toString().padStart(2, '0')}
                    </span>
                    <h3 className="text-xl lg:text-2xl font-black text-deep leading-tight">
                        {question}
                    </h3>
                </div>
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-zinc-50 text-deep/40 group-hover:bg-primary/10 group-hover:text-primary'
                    }`}>
                    {isOpen ? <Minus size={24} /> : <Plus size={24} />}
                </div>
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-8 lg:px-10 pb-10 ml-14 lg:ml-16">
                    <p className="text-lg text-deep/60 leading-relaxed max-w-2xl">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
}
