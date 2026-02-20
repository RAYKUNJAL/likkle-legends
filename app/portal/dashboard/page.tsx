
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Sparkles, BookOpen, User, Star } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PortalDashboard() {
    const searchParams = useSearchParams();
    const [childName, setChildName] = useState<string>('Legend');
    const [hasUpsell, setHasUpsell] = useState<boolean>(false);
    const [hasHeritage, setHasHeritage] = useState<boolean>(false);
    const [heritageCode, setHeritageCode] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [storyReady, setStoryReady] = useState<boolean>(false);

    useEffect(() => {
        // Hydrate from localStorage if not in params
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('likkle_legends_user');
            if (stored) {
                const data = JSON.parse(stored);
                setChildName(data.childName || 'Legend');
                setHasUpsell(data.hasUpsell);
                setHasHeritage(data.hasHeritageStory);
                setHeritageCode(data.heritage);

                if (data.hasHeritageStory) {
                    setIsGenerating(true);
                    // Simulate generation delay
                    setTimeout(() => {
                        setIsGenerating(false);
                        setStoryReady(true);
                    }, 5000);
                }
            }
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            {/* Header */}
            <header className="bg-white border-b border-zinc-100 py-4 px-6 fixed top-0 w-full z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[url('/images/logo.png')] bg-contain bg-no-repeat bg-center" />
                    <h1 className="text-xl font-black text-deep tracking-tight">Legend Portal</h1>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full">
                    <User size={16} className="text-deep/40" />
                    <span className="text-sm font-bold text-deep">{childName}</span>
                </div>
            </header>

            <main className="container mx-auto pt-24 pb-20 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto space-y-12"
                >
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-primary to-primary-light rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-premium">
                        <div className="relative z-10 space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                                <Sparkles size={14} className="text-white" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Active Member</span>
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-tight">
                                Welcome Home, {childName}!
                            </h2>
                            <p className="text-lg font-medium text-white/80 max-w-xl">
                                Your next adventure package is being prepared. Check your mailbox soon!
                            </p>
                        </div>
                        <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-16 -mb-16"></div>
                    </div>

                    {/* Order Bumps Section */}
                    {(hasUpsell || hasHeritage) && (
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black text-deep tracking-tight flex items-center gap-2">
                                <Star className="fill-yellow-400 text-yellow-400" /> Your Special Upgrades
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Digital Activity Pack */}
                                {hasUpsell && (
                                    <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-all group">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                                            🎨
                                        </div>
                                        <h4 className="text-xl font-black text-deep mb-2">Digital Super-Pack</h4>
                                        <p className="text-sm text-deep/50 font-medium mb-6">
                                            50+ pages of coloring, mazes, and island games active and ready.
                                        </p>
                                        <button className="w-full py-4 bg-zinc-50 text-deep border border-zinc-200 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-zinc-100 hover:border-zinc-300 transition-all flex items-center justify-center gap-2">
                                            <Download size={16} /> Download PDF
                                        </button>
                                    </div>
                                )}

                                {/* Heritage DNA Story */}
                                {hasHeritage && (
                                    <div className="bg-white rounded-3xl p-8 border-2 border-primary/10 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                        {isGenerating && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
                                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                                <p className="font-black text-primary text-sm uppercase tracking-widest animate-pulse">
                                                    Anansi is weaving your story...
                                                </p>
                                            </div>
                                        )}

                                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform">
                                            🧬
                                        </div>
                                        <h4 className="text-xl font-black text-deep mb-2">Heritage DNA Story</h4>
                                        <p className="text-sm text-deep/50 font-medium mb-6">
                                            A personalized tale about {childName}'s roots in {heritageCode || 'the islands'}.
                                        </p>

                                        {storyReady ? (
                                            <button className="w-full py-4 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                                <BookOpen size={16} /> Read Now
                                            </button>
                                        ) : (
                                            <div className="w-full h-12 bg-zinc-100 rounded-xl animate-pulse"></div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pending Content */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-black text-deep tracking-tight flex items-center gap-2">
                            <Sparkles className="text-primary" /> Chat with R.O.T.I.
                        </h3>
                        <ChatInterface childName={childName} />
                    </div>

                    <div className="opacity-50 pointer-events-none filter grayscale">
                        <div className="bg-zinc-50 rounded-3xl p-12 text-center border border-zinc-100 border-dashed">
                            <h3 className="text-lg font-black text-deep/40 uppercase tracking-widest mb-2">Coming Soon</h3>
                            <p className="text-deep/30 font-medium">Monthly activities will appear here.</p>
                        </div>
                    </div>

                </motion.div>
            </main>
        </div>
    );
}

function ChatInterface({ childName }: { childName: string }) {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await fetch('/api/brain/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'dev-user-123', message: userMsg })
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', content: data.text }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "Beep boop! My circuits got crossed. Try again?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-zinc-100 shadow-xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">R</div>
                    <span className="font-bold text-sm text-deep">R.O.T.I. Intelligence</span>
                </div>
                {isLoading && <div className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Thinking...</div>}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-10 space-y-2">
                        <p className="text-sm font-bold text-deep/40 uppercase tracking-widest">Start a conversation</p>
                        <p className="text-xs text-deep/30 font-medium italic">"Tell me my name" or "What do I like?"</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm font-medium ${m.role === 'user'
                                ? 'bg-primary text-white rounded-tr-none'
                                : 'bg-zinc-100 text-deep rounded-tl-none'
                            }`}>
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-zinc-100 bg-white">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="w-full pl-6 pr-14 py-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={isLoading || !input}
                        className="absolute right-2 top-2 bottom-2 px-4 bg-primary text-white rounded-lg font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 disabled:grayscale transition-all"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
