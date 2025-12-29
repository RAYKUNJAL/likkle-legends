"use client";

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        q: "How does the physical mail work?",
        a: "Every month, your child receives a personalized envelope addressed directly to them. Inside, they'll find a letter from a Likkle Legend, a cultural flashcard, and a physical coloring sheet. Subscriptions ship by the 15th of every month."
    },
    {
        q: "Is it suitable for children outside the Caribbean?",
        a: "Absolutely! Likkle Legends is designed for children everywhere. For those with Caribbean roots, it's a way to stay connected. For others, it's a beautiful way to learn about a vibrant culture, emotional literacy, and island pride."
    },
    {
        q: "What age groups are supported?",
        a: "We have two main tracks: 'Mini Legends' (Ages 4-5) which focuses on basic cultural concepts and SEL, and 'Big Legends' (Ages 6-8) which includes more advanced stories and complex emotional literacy activities."
    },
    {
        q: "How do the Digital Storybooks work?",
        a: "Legends Plus and Annual members get access to our digital portal. Every month, new interactive storybooks are unlocked. These books can be read on any tablet or computer and feature AI-powered character interactions."
    },
    {
        q: "Can I cancel my subscription?",
        a: "Yes! We want you to love Likkle Legends. You can cancel your monthly subscription at any time through your parent dashboard. Annual plans are billed once and renew every year."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-24 bg-white">
            <div className="container max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-deep/60">Everything you need to know about the adventure.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border-2 border-zinc-100 rounded-3xl overflow-hidden">
                            <button
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                                className="w-full p-6 text-left flex items-center justify-between hover:bg-zinc-50 transition-colors"
                            >
                                <span className="text-lg font-bold text-deep">{faq.q}</span>
                                <div className={`w-8 h-8 rounded-full border-2 border-border flex items-center justify-center transition-transform duration-300 ${openIndex === i ? 'rotate-180 border-primary bg-primary text-white' : ''}`}>
                                    {openIndex === i ? <Minus size={16} /> : <Plus size={16} />}
                                </div>
                            </button>
                            <div className={`transition-all duration-300 overflow-hidden ${openIndex === i ? 'max-h-96' : 'max-h-0'}`}>
                                <div className="p-6 pt-0 text-deep/70 leading-relaxed border-t border-zinc-50">
                                    {faq.a}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
