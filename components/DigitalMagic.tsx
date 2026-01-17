import Image from 'next/image';
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

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Songs */}
                    <div className="p-10 rounded-[4rem] bg-white border-2 border-orange-50 group hover:shadow-[0_30px_60px_-15px_rgba(251,133,0,0.15)] transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-[2rem] flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform relative z-10">
                            <Music size={40} />
                        </div>
                        <h3 className="text-3xl font-heading font-black mb-4 text-blue-950">Heritage Radio</h3>
                        <p className="text-blue-900/60 font-medium mb-8 leading-relaxed">From Calypso beats to island lullabies. Tanty's curated tracks teach rhythm while preserving our vibrant musical soul.</p>
                        <div className="p-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl text-white flex items-center gap-5 shadow-xl">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">▶</div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Now Playing</p>
                                <p className="font-heading font-bold whitespace-nowrap overflow-hidden">Steelpan Serenade</p>
                            </div>
                        </div>
                    </div>

                    {/* Quests */}
                    <div className="p-10 rounded-[4rem] bg-white border-2 border-blue-50 group hover:shadow-[0_30px_60px_-15px_rgba(33,150,243,0.15)] transition-all duration-500 lg:translate-y-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-[2rem] flex items-center justify-center mb-8 group-hover:-rotate-6 transition-transform relative z-10">
                            <Target size={40} />
                        </div>
                        <h3 className="text-3xl font-heading font-black mb-4 text-blue-950">Culture Quests</h3>
                        <p className="text-blue-900/60 font-medium mb-8 leading-relaxed">Gamified missions that turn de whole world into a classroom. Find island fruits, learn Patois, and earn de title of Village Legend.</p>
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-3 w-full bg-blue-50 rounded-full overflow-hidden">
                                    <div className={`h-full bg-blue-500 rounded-full ${i === 1 ? 'w-full' : 'w-1/2'}`}></div>
                                </div>
                            ))}
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest text-center">Trail Progress: 75%</p>
                        </div>
                    </div>

                    {/* Storybooks */}
                    <div className="p-10 rounded-[4rem] bg-white border-2 border-purple-50 group hover:shadow-[0_30px_60px_-15px_rgba(156,39,176,0.15)] transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                        <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform relative z-10">
                            <BookOpen size={40} />
                        </div>
                        <h3 className="text-3xl font-heading font-black mb-4 text-blue-950">Magic Books</h3>
                        <p className="text-blue-900/60 font-medium mb-8 leading-relaxed">Personalized AI adventures where YOUR child becomes de hero. Read by Tanty Spice with custom illustrations for every page.</p>
                        <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl ring-4 ring-purple-50">
                            <Image src="/images/hero.png" alt="Magic Book" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-5">
                                <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Featured Story</p>
                                <p className="text-white font-heading font-bold">The Coconut Secret</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
