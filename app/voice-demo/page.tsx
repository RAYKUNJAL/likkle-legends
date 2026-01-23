'use client';

import Navbar from '@/components/Navbar';
import PersonaPlexVoiceChat from '@/components/PersonaPlexVoiceChat';

export default function VoiceDemoPage() {
    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            <Navbar />

            <main className="container py-20 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm uppercase tracking-wider mb-4">
                        Experimental Feature
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-deep mb-6">
                        Talk to Tanty Spice
                    </h1>
                    <p className="text-xl text-deep/60 leading-relaxed">
                        Experience our new open-source voice AI. Have a real-time conversation about Caribbean culture, food, and stories.
                    </p>
                </div>

                <PersonaPlexVoiceChat serverUrl="ws://localhost:8998" />

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-xl text-sm text-deep/60 shadow-sm">
                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        Requires local Python server running on port 8998
                    </div>
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
