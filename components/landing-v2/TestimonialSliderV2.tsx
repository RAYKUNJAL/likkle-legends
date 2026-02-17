"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

interface Testimonial {
    name: string;
    location: string;
    quote: string;
    rating: number;
}

interface TestimonialSliderProps {
    items: Testimonial[];
}

export const TestimonialSliderV2 = ({ items }: TestimonialSliderProps) => {
    return (
        <section className="py-32 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-deep tracking-tighter"
                    >
                        Success Stories from <span className="text-secondary italic">Yard</span> to Abroad.
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto">
                    {items.map((item, i) => (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-[#F8F9FA] p-12 lg:p-16 rounded-[4rem] relative group hover:bg-white hover:shadow-3xl transition-all duration-700 border border-transparent hover:border-zinc-100"
                        >
                            <Quote className="absolute top-12 left-12 w-16 h-16 text-secondary/10 -rotate-12 transition-transform group-hover:rotate-0" />

                            <div className="relative z-10 space-y-8">
                                <div className="flex gap-1">
                                    {[...Array(item.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    ))}
                                </div>
                                <p className="text-2xl lg:text-3xl font-bold text-deep leading-[1.4] italic">
                                    "{item.quote}"
                                </p>
                                <div className="flex items-center gap-6 pt-8 border-t border-zinc-200">
                                    <div className="w-16 h-16 bg-gradient-to-br from-secondary to-emerald-800 rounded-2xl flex items-center justify-center text-white font-black text-xl">
                                        {item.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-deep text-lg">{item.name}</h4>
                                        <p className="text-sm font-bold text-deep/30 uppercase tracking-[0.2em]">{item.location}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Visual Strip */}
                <div className="mt-32 flex justify-center gap-8 overflow-hidden opacity-10 grayscale">
                    <div className="animate-marquee whitespace-nowrap flex gap-16">
                        {[...Array(6)].map((_, i) => (
                            <span key={i} className="text-6xl font-black tracking-tighter uppercase">Likkle Legends Stories • Caribbean Kids • Culture Mail</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
