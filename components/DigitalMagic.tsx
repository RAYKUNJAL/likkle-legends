"use client";

import { Music, BookOpen, Download } from 'lucide-react';

export default function DigitalMagic() {
    return (
        <section id="story-preview" className="py-24 bg-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>

            <div className="container relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <span className="text-accent font-bold uppercase tracking-widest text-sm">Beyond the Mailbox</span>
                    <h2 className="text-4xl lg:text-5xl font-bold">Island Magic in Every Device</h2>
                    <p className="text-lg text-deep/70">The adventure doesn't stop at the letter. Our digital portal keeps the rhythm going every single day.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Songs */}
                    <div className="p-8 rounded-[3rem] glass-card border border-border group hover:bg-white hover:shadow-2xl transition-all duration-500">
                        <div className="w-16 h-16 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Music size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Island Nursery Songs</h3>
                        <p className="text-deep/60 mb-6">Authentic Caribbean rhythms and nursery rhymes re-imagined for modern legends. Lyrics that teach and beats that move.</p>
                        <div className="p-4 bg-white rounded-2xl border border-border flex items-center gap-4">
                            <button className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center shadow-lg shadow-accent/20">▶</button>
                            <div className="flex-1">
                                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-accent rounded-full"></div>
                                </div>
                                <p className="text-[10px] mt-1 font-bold text-accent">Playing: Brown Girl in the Ring</p>
                            </div>
                        </div>
                    </div>

                    {/* Storybooks */}
                    <div className="p-8 rounded-[3rem] glass-card border border-border group hover:bg-white hover:shadow-2xl transition-all duration-500 lg:translate-y-8">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Digital Storybooks</h3>
                        <p className="text-deep/60 mb-6">Interactive stories featuring Dilly, Mango, and Sam. Each story includes 'Legends Mode' where your child is the hero.</p>
                        <div className="aspect-[4/3] bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden flex items-center justify-center">
                            <img src="/images/hero.png" alt="Story preview" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                            <span className="relative z-10 font-bold text-primary text-sm flex items-center gap-2">
                                <BookOpen size={16} /> Open "Sam's Steelpan Secret"
                            </span>
                        </div>
                    </div>

                    {/* Printables */}
                    <div className="p-8 rounded-[3rem] glass-card border border-border group hover:bg-white hover:shadow-2xl transition-all duration-500">
                        <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Download size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Printable Adventures</h3>
                        <p className="text-deep/60 mb-6">Fresh coloring pages and cultural activity sheets delivered to your inbox every week. Just print and play!</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="aspect-square bg-white rounded-xl border border-border flex items-center justify-center p-4">
                                <img src="/images/dilly_doubles.png" alt="Coloring" className="w-full opacity-30 grayscale" />
                            </div>
                            <div className="aspect-square bg-white rounded-xl border border-border flex items-center justify-center p-4">
                                <img src="/images/mango_moko.png" alt="Coloring" className="w-full opacity-30 grayscale" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
