"use client";

import { useState } from 'react';
import { Sparkles, Wand2, BookOpen } from 'lucide-react';

export default function StoryGenerator() {
    const [name, setName] = useState("");
    const [result, setResult] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const generateStory = () => {
        if (!name) return;
        setIsGenerating(true);

        // Simulated AI Story Generation
        setTimeout(() => {
            const stories = [
                `${name} was walking through the Maracas mango grove when suddenly, Mango Moko waved from the sky. 'Follow me!' she called. Today was the day ${name} would discover the secret of the silver steelpan...`,
                `High upon the stilts, ${name} looked out over the crystal blue waters. Steelpan Sam was playing a rhythm that sounded just like ${name}'s heart. 'You've got the island beat!' Sam cheered...`,
                `Dilly Doubles had a special surprise for ${name}. It wasn't just a snack—it was a map to the Lost Legend's Treasure! ${name} tightened their sandals and began the journey...`
            ];
            setResult(stories[Math.floor(Math.random() * stories.length)]);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <section id="sample-letter" className="py-24 bg-zinc-50">
            <div className="container">
                <div className="max-w-5xl mx-auto bg-white rounded-[4rem] border-8 border-primary/5 shadow-2xl overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            <Sparkles size={14} /> AI Magic Demo
                        </div>
                        <h2 className="text-4xl font-black text-deep mb-6 leading-tight">
                            Make Your Child the <span className="text-primary italic">Legend</span>
                        </h2>
                        <p className="text-deep/60 text-lg mb-8">
                            Every month, our AI helps craft stories where your child is the main character. Try it out right now!
                        </p>

                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter child's name..."
                                    className="w-full p-6 bg-zinc-100 rounded-3xl text-lg focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all border-none"
                                />
                                <button
                                    onClick={generateStory}
                                    disabled={!name || isGenerating}
                                    className="absolute right-3 top-3 bottom-3 px-8 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/20"
                                >
                                    {isGenerating ? "Magic..." : <><Wand2 size={20} /> Legend-ize</>}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="md:w-1/2 bg-deep p-12 lg:p-16 relative flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full -mr-32 -mt-32 blur-[100px] opacity-20"></div>

                        <div className="relative z-10">
                            {result ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
                                    <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                                        <BookOpen size={24} />
                                    </div>
                                    <p className="text-2xl font-medium text-white/90 italic leading-relaxed">
                                        "{result}"
                                    </p>
                                    <div className="pt-6 border-t border-white/10">
                                        <p className="text-primary font-bold text-sm uppercase tracking-widest">A Likkle legend snippet</p>
                                        <p className="text-white/40 text-xs mt-1">Join the club to get full personalized books every month.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4 opacity-30 py-12">
                                    <div className="w-20 h-20 bg-white/10 rounded-full mx-auto flex items-center justify-center p-4">
                                        <BookOpen size={40} className="text-white" />
                                    </div>
                                    <p className="text-white font-medium">Type a name on the left to see the magic happen.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
