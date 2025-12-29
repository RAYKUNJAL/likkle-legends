"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { siteContent } from '@/lib/content';

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#FFFDF7]">
            <Navbar />

            <main className="flex-grow pt-32 pb-24">
                <div className="container max-w-4xl">
                    <span className="text-primary font-bold uppercase tracking-widest text-sm mb-4 block text-center">Our Story</span>
                    <h1 className="text-5xl lg:text-7xl font-black text-deep text-center mb-12">Building a Bridge to the Islands</h1>

                    <div className="aspect-video rounded-[3rem] overflow-hidden mb-16 shadow-2xl border-8 border-white">
                        <img src="/images/hero.png" alt="Children playing" className="w-full h-full object-cover grayscale opacity-80" />
                    </div>

                    <div className="prose prose-xl max-w-none text-deep/70 space-y-8 leading-relaxed">
                        <p className="font-bold text-2xl text-deep">
                            Likkle Legends was born in a living room in New York, where two Caribbean parents realized their children's bookshelf didn't look like their family history.
                        </p>
                        <p>
                            We started with a simple question: How can we make Caribbean culture part of our children's everyday life, no matter where in the world they are? We didn't want it to just be a holiday thing; we wanted it to be a pride thing.
                        </p>
                        <p>
                            Today, Likkle Legends Mail Club serves hundreds of families globally, combining the tactile joy of receiving a physical letter with the power of modern AI to build confidence, emotional literacy, and cultural identity.
                        </p>

                        <div className="bg-white p-12 rounded-[3rem] border-2 border-primary/10 shadow-xl shadow-primary/5 my-12">
                            <h3 className="text-3xl font-black text-deep mb-6">Our Mission</h3>
                            <p className="text-xl italic">
                                "To empower the next generation of Global Legends by wrapping Caribbean heritage and emotional intelligence in a monthly experience of joy and discovery."
                            </p>
                        </div>

                        <h3 className="text-3xl font-black text-deep">Why "Likkle Legends"?</h3>
                        <p>
                            In the Caribbean, we often say "likkle but tallawah"—small but mighty. We believe every child is a legend in the making. By teaching them their roots and giving them the tools to navigate their emotions, we help them stand tall on their own two feet.
                        </p>
                    </div>

                    <div className="mt-20 p-12 rounded-[4rem] bg-deep text-white text-center space-y-8">
                        <h2 className="text-4xl font-black">Join our journey</h2>
                        <Link href="/#pricing" className="btn btn-primary btn-lg px-12 py-6 text-xl">
                            Start Your Adventure
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
