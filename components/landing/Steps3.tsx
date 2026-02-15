'use client';

import { useGeo } from '../GeoContext';
import { motion } from 'framer-motion';

export default function Steps3() {
    const { variant } = useGeo();

    const isUSA = variant === 'USA_MAIL_FIRST';

    const steps = [
        {
            number: "01",
            title: "Start Free Forever",
            description: "Create a parent account and pick your child’s age band and island interests."
        },
        {
            number: "02",
            title: "Explore Stories & Music",
            description: "Your child learns with island characters guiding each path in an ad-free world."
        },
        {
            number: "03",
            title: "Upgrade to Full World",
            description: isUSA
                ? "Get the $10 Intro Envelope (USA) or choose a subscription plan for monthly magic."
                : "Choose a digital plan to unlock the full library and monthly Island Drops."
        }
    ];

    return (
        <section id="how" className="py-24 bg-zinc-50 overflow-hidden">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="text-center mb-16 px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-black text-deep"
                    >
                        How It Works
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto relative">
                    {/* Connection lines (Desktop) */}
                    <div className="hidden md:block absolute top-[2.25rem] left-[10%] right-[10%] h-0.5 bg-emerald-100 z-0" />

                    {steps.map((step, idx) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative z-10 flex flex-col items-center text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6">
                                {step.number}
                            </div>
                            <h3 className="text-xl font-black text-deep mb-4">{step.title}</h3>
                            <p className="text-deep/60 leading-relaxed max-w-xs">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
