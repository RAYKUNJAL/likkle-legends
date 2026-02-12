
import React, { useState, useEffect } from 'react';
import { CHARACTERS, TANTY_CHARACTER } from '../lib/constants';
import { getCharacters } from '../services/storageService';
import { Character, AdminCharacter } from '../lib/types';
import { LazyImage } from './LazyImage';

import dynamic from 'next/dynamic';
import { Box, Smartphone, Image as ImageIcon } from 'lucide-react';

const CharacterARViewer = dynamic(() => import('@/components/CharacterARViewer'), { ssr: false });

const CharacterShowcase: React.FC = () => {
    // Fix: Explicitly type the collection to allow access to the isMystery property which is not on the base Character type
    const DEFAULT_ALL: AdminCharacter[] = [TANTY_CHARACTER, ...CHARACTERS];

    const [activeCharacters, setActiveCharacters] = useState<AdminCharacter[]>(DEFAULT_ALL);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [is3DMode, setIs3DMode] = useState(false);

    useEffect(() => {
        const fetchCustomCharacters = async () => {
            const custom = await getCharacters();
            if (custom && custom.length > 0) {
                // Keep the mystery legend at the end if we have custom ones
                const mystery = DEFAULT_ALL.find(c => c.isMystery);
                const core = DEFAULT_ALL.filter(c => !c.isMystery);
                setActiveCharacters([...core, ...custom, mystery].filter((c): c is AdminCharacter => !!c));
            }
        };
        fetchCustomCharacters();
    }, []);

    const handleNext = () => {
        setIs3DMode(false);
        setCurrentIndex((prev) => (prev + 1) % activeCharacters.length);
    };

    const handlePrev = () => {
        setIs3DMode(false);
        setCurrentIndex((prev) => (prev - 1 + activeCharacters.length) % activeCharacters.length);
    };

    const active = activeCharacters[currentIndex];

    if (!active) return null;

    return (
        <section className="py-24 px-6 bg-white overflow-hidden scroll-mt-40 relative" id="characters">
            {/* Decorative Island Elements */}
            <div className="absolute top-20 -left-10 text-9xl opacity-5 select-none pointer-events-none rotate-12">🌴</div>
            <div className="absolute bottom-20 -right-10 text-9xl opacity-5 select-none pointer-events-none -rotate-12">🌊</div>

            <div className="max-w-7xl mx-auto relative">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-heading font-black text-blue-950">Meet de Village Legends</h2>
                    <p className="text-lg font-bold uppercase tracking-widest text-blue-950/40">Our colorful Caribbean heroes</p>
                </div>

                <div className="relative group">
                    {/* Navigation Arrows - More Visible and Tactical */}
                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-2 md:px-0 z-20 pointer-events-none">
                        <button
                            onClick={handlePrev}
                            className="w-14 h-14 md:w-20 md:h-20 bg-white border-4 border-blue-100 text-blue-950 rounded-full flex items-center justify-center shadow-2xl pointer-events-auto hover:bg-blue-50 hover:scale-110 active:scale-90 transition-all -ml-4 md:-ml-10"
                            aria-label="Previous Character"
                        >
                            <span className="text-3xl">❮</span>
                        </button>
                        <button
                            onClick={handleNext}
                            className="w-14 h-14 md:w-20 md:h-20 bg-white border-4 border-blue-100 text-blue-950 rounded-full flex items-center justify-center shadow-2xl pointer-events-auto hover:bg-blue-50 hover:scale-110 active:scale-90 transition-all -mr-4 md:-mr-10"
                            aria-label="Next Character"
                        >
                            <span className="text-3xl">❯</span>
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
                        <div className="w-full lg:w-1/2 flex justify-center relative min-h-[400px]">
                            {/* Background Glow */}
                            <div className={`absolute inset-0 blur-[100px] opacity-20 ${active.color} rounded-full`}></div>

                            <div className={`relative w-full max-w-[400px] aspect-square rounded-[4rem] shadow-2xl border-8 border-white overflow-hidden transition-all duration-700 ${active.isMystery ? 'ring-4 ring-indigo-500/20' : ''}`}>
                                {is3DMode && active.model_3d_url ? (
                                    <CharacterARViewer
                                        src={active.model_3d_url}
                                        poster={active.image}
                                        alt={active.name}
                                    />
                                ) : (
                                    <LazyImage
                                        src={active.image}
                                        alt={active.name}
                                        className={`w-full h-full transition-all duration-700 ${active.isMystery ? 'brightness-[0.1] contrast-[1.2] saturate-0' : 'group-hover:scale-110'}`}
                                    />
                                )}

                                {/* Mode Switcher Overlay */}
                                {!active.isMystery && active.model_3d_url && (
                                    <div className="absolute top-4 right-4 flex gap-2 z-30">
                                        <button
                                            onClick={() => setIs3DMode(!is3DMode)}
                                            className={`p-3 rounded-2xl shadow-lg transition-all transform hover:scale-110 active:scale-90 ${is3DMode ? 'bg-orange-500 text-white' : 'bg-white/90 backdrop-blur text-blue-600'}`}
                                            title={is3DMode ? "Switch to 2D Image" : "Switch to 3D Model"}
                                        >
                                            {is3DMode ? <ImageIcon size={20} /> : <Box size={20} />}
                                        </button>
                                    </div>
                                )}

                                {/* Redesigned Mystery Character Overlay */}
                                {active.isMystery && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-950/40 backdrop-blur-[2px]">
                                        <div className="relative">
                                            <span className="text-[10rem] text-white/10 font-black absolute inset-0 flex items-center justify-center -translate-y-4">?</span>
                                            <span className="text-8xl text-white font-black drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-pulse relative z-10">?</span>
                                        </div>
                                        <div className="bg-indigo-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest mt-4 shadow-xl">Locked</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left relative z-10">
                            <div className="space-y-4">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${active.isMystery ? 'bg-indigo-900 text-white' : 'bg-blue-50 text-blue-600'}`}>
                                    {active.role}
                                </span>
                                <h3 className="text-4xl md:text-6xl font-heading font-black text-blue-950">{active.name}</h3>
                                <p className={`text-xl md:text-2xl font-bold italic ${active.isMystery ? 'text-indigo-400' : 'text-orange-500'}`}>
                                    "{active.tagline}"
                                </p>
                                <p className="text-lg md:text-xl text-blue-900/60 font-medium leading-relaxed max-w-xl">{active.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                                {active.traits?.map((t: string) => (
                                    <span key={t} className={`px-5 py-2.5 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest border transition-colors ${active.isMystery ? 'bg-indigo-50/50 border-indigo-100 text-indigo-300' : 'bg-blue-50 border-blue-100 text-blue-900/40'}`}>
                                        {t}
                                    </span>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            {!active.isMystery && (
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                                    {active.model_3d_url && (
                                        <button
                                            onClick={() => setIs3DMode(true)}
                                            className="btn btn-secondary flex items-center gap-2 group"
                                        >
                                            <Smartphone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                            View in AR
                                        </button>
                                    )}
                                    <button className="btn btn-primary">
                                        Learn More
                                    </button>
                                </div>
                            )}

                            {/* Dot Indicators for Navigation */}
                            <div className="flex gap-3 justify-center lg:justify-start pt-6">
                                {activeCharacters.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setIs3DMode(false);
                                            setCurrentIndex(idx);
                                        }}
                                        className={`h-3 rounded-full transition-all duration-300 ${currentIndex === idx ? 'bg-orange-500 w-10 shadow-lg' : 'bg-blue-100 w-3 hover:bg-blue-200'}`}
                                        aria-label={`Go to character ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CharacterShowcase;
