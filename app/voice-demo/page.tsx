'use client';

import Navbar from '@/components/Navbar';
import ROTIChat from '@/components/ROTIChat';

export default function VoiceDemoPage() {
    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            <Navbar />

            <main className="container py-20 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm uppercase tracking-wider mb-4 border border-emerald-200">
                        Interactive Demo
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-deep mb-6">
                        Talk to R.O.T.I.
                    </h1>
                    <p className="text-xl text-deep/60 leading-relaxed">
                        Experience our AI learning companion. Have a real-time conversation about Caribbean culture, math, reading, and stories.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <ROTIChat ageGroup="6-9" />
                </div>

                <div className="mt-12 text-center">
                    <p className="text-deep/40 text-sm">
                        Powered by Google Gemini • Safe & Private • Caribbean-First AI
                    </p>
                </div>
            </main>

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
            </div>
        </div>
    );
}
