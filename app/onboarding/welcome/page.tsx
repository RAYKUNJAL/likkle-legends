"use client";

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Star, ArrowRight, ShieldCheck, Gamepad2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const features = [
    {
        icon: <Users className="w-6 h-6 text-white" />,
        title: "Family Portal",
        desc: "Monitor progress, invite grandparents, and manage your subscription.",
        color: "bg-blue-500",
        delay: 0.1
    },
    {
        icon: <Gamepad2 className="w-6 h-6 text-white" />,
        title: "Island Adventure",
        desc: "Your child's immersive world for learning history and culture.",
        color: "bg-primary",
        delay: 0.2
    },
    {
        icon: <Star className="w-6 h-6 text-white" />,
        title: "AI Story Studio",
        desc: "Create infinite personalized stories with your child.",
        color: "bg-purple-500",
        delay: 0.3
    }
];

function WelcomeContent() {
    const searchParams = useSearchParams();
    const childName = searchParams.get('childName');

    return (
        <div className="min-h-screen bg-[#FFFDF7] bg-grid-pattern relative overflow-hidden font-sans text-deep">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            {/* Content Container */}
            <div className="max-w-6xl mx-auto px-6 py-12 lg:py-24 relative z-10">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl mx-auto mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-primary/10 shadow-sm mb-8 text-primary font-bold tracking-wide uppercase text-xs">
                        <Sparkles size={14} />
                        <span>Welcome {childName ? `, ${childName} Family!` : "to the Family"}</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6">
                        Mission Control <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                            Ready for Takeoff
                        </span>
                    </h1>

                    <p className="text-xl lg:text-2xl text-deep/60 leading-relaxed font-medium">
                        You've successfully secured your pass to Likkle Legends. <br className="hidden lg:block" />
                        Now, let's set up {childName ? `${childName}'s` : "your"} crew.
                    </p>
                </motion.div>

                {/* Dashboard Previews */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + feature.delay, duration: 0.6 }}
                            className="bg-white rounded-[2rem] p-8 border-2 border-zinc-100 shadow-xl shadow-zinc-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-6 transition-transform`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-black mb-3 text-deep">{feature.title}</h3>
                            <p className="text-deep/50 font-medium text-lg leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Main CTA */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <div className="bg-deep text-white rounded-[3rem] p-10 lg:p-12 shadow-2xl relative overflow-hidden group">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                        <h2 className="text-3xl lg:text-4xl font-black mb-6 relative z-10">Step 1: Who is this for?</h2>
                        <p className="text-white/60 text-lg mb-10 max-w-md mx-auto relative z-10">
                            Create your first child profile to unlock personalized stories and the immersive learning portal.
                        </p>

                        <Link href="/onboarding/child">
                            <button className="relative z-10 bg-white text-deep text-xl font-black py-5 px-10 rounded-2xl hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto shadow-lg flex items-center justify-center gap-3 mx-auto">
                                Create Child Profile <ArrowRight className="w-6 h-6" />
                            </button>
                        </Link>
                    </div>

                    <p className="mt-8 text-deep/30 font-bold text-sm flex items-center justify-center gap-2">
                        <ShieldCheck size={16} />
                        Secure & Private Space
                    </p>
                </motion.div>

            </div>
        </div>
    );
}

export default function OnboardingWelcome() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
                <Sparkles className="animate-pulse text-primary" size={48} />
            </div>
        }>
            <WelcomeContent />
        </Suspense>
    );
}
