'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface Character {
    name: string;
    role: string;
    tagline: string;
    description: string;
    color: string;
    image: string;
    traits: string[];
    isMystery?: boolean;
}

const CHARACTERS: Character[] = [
    { name: "R.O.T.I.", role: "Island Learning Buddy", tagline: "Brains on—sunshine mode!", description: "Your friendly Caribbean robot who helps you learn reading, math, and island culture!", color: "bg-emerald-500", image: "/images/roti-new.jpg", traits: ["Learning", "Curiosity", "Fun"] },
    { name: "Dilly Doubles", role: "Food & Traditions Expert", tagline: "Hot, sweet, and ready for adventure!", description: "The flavor adventurer! Dilly proves that mixing different things creates magic.", color: "bg-yellow-400", image: "/images/dilly-doubles.jpg", traits: ["Inclusivity", "Tradition", "Flavor"] },
    { name: "Scorcha Scorpion", role: "Fire & Focus Guide", tagline: "Turn your heat into light!", description: "A fiery scotch bonnet who teaches kids to manage anger and see different views.", color: "bg-red-500", image: "https://695c018d554772846284df2a.imgix.net/E98FDED5-E718-467C-86C2-0AEAA0A3356A.png?auto=format,compress&q=75", traits: ["Perspective", "Self-Control", "Pride"] },
    { name: "Benny of Shadows", role: "Forest & Harmony Guide", tagline: "Listen to de leaves whisper, me darlin.", description: "Benny is de village forest guide. He teaches children how to find quiet moments and observe de secret wonders of nature.", color: "bg-emerald-600", image: "https://695c018d554772846284df2a.imgix.net/46EB4217-AC69-4518-90A2-0946825B4A01.png?auto=format,compress&q=75", traits: ["Observation", "Harmony", "Patience"] },
    { name: "The Mystery Legend", role: "Secret Village Protector", tagline: "Adventure is just round de corner...", description: "Every month, a new magical spirit arrives in Coconut Cove! Stay tuned to see who will join our family next.", color: "bg-indigo-950", image: "/images/mystery-character.png", traits: ["Discovery", "Magic", "Surprise"], isMystery: true }
];

interface CharacterTabsProps {
    onCharacterSelect?: (characterName: string) => void;
}

const CharacterTabs: React.FC<CharacterTabsProps> = ({ onCharacterSelect }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToCharacter = (index: number) => {
        setActiveIndex(index);
        if (scrollRef.current) {
            const cardWidth = 280;
            scrollRef.current.scrollTo({
                left: index * cardWidth - (scrollRef.current.clientWidth / 2) + (cardWidth / 2),
                behavior: 'smooth'
            });
        }
        if (onCharacterSelect) {
            onCharacterSelect(CHARACTERS[index].name);
        }
    };

    const scrollLeft = () => {
        const newIndex = Math.max(0, activeIndex - 1);
        scrollToCharacter(newIndex);
    };

    const scrollRight = () => {
        const newIndex = Math.min(CHARACTERS.length - 1, activeIndex + 1);
        scrollToCharacter(newIndex);
    };

    return (
        <div className="w-full py-16 bg-gradient-to-b from-blue-50 to-white">
            {/* Section Header */}
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-deep mb-4">
                    Meet the Legends! 🌟
                </h2>
                <p className="text-deep/60 font-bold text-lg">
                    Swipe to discover your island friends
                </p>
            </div>

            {/* Tab Dots */}
            <div className="flex justify-center gap-2 mb-8">
                {CHARACTERS.map((char, idx) => (
                    <button
                        key={char.name}
                        onClick={() => scrollToCharacter(idx)}
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300 ${idx === activeIndex
                            ? 'bg-emerald-500 scale-125 shadow-lg'
                            : char.isMystery
                                ? 'bg-indigo-300 hover:bg-indigo-400'
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                        aria-label={`Go to ${char.name}`}
                    />
                ))}
            </div>

            {/* Scrollable Cards Container */}
            <div className="relative">
                {/* Left Arrow */}
                <button
                    onClick={scrollLeft}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-2xl hover:scale-110 transition-transform border-4 border-emerald-100 disabled:opacity-30"
                    disabled={activeIndex === 0}
                    aria-label="Previous character"
                >
                    ◀️
                </button>

                {/* Cards */}
                <div
                    ref={scrollRef}
                    className="flex gap-6 overflow-x-auto pb-4 px-16 md:px-24 scroll-smooth"
                    style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {CHARACTERS.map((character, idx) => (
                        <div
                            key={character.name}
                            onClick={() => scrollToCharacter(idx)}
                            className={`flex-shrink-0 w-64 md:w-72 rounded-[2rem] overflow-hidden transition-all duration-500 cursor-pointer ${idx === activeIndex
                                ? 'scale-105 shadow-2xl ring-4 ring-emerald-400'
                                : 'scale-95 opacity-70 hover:opacity-90'
                                } ${character.isMystery ? 'bg-gradient-to-b from-indigo-900 to-indigo-950' : 'bg-white'}`}
                            style={{ scrollSnapAlign: 'center' }}
                        >
                            {/* Character Image */}
                            <div className={`relative h-48 md:h-56 overflow-hidden ${character.isMystery ? 'bg-indigo-950' : character.color}`}>
                                <Image
                                    src={character.image}
                                    alt={character.name}
                                    fill
                                    className={`object-cover ${character.isMystery ? 'opacity-90' : ''}`}
                                />
                                {character.isMystery && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-6xl animate-pulse">❓</div>
                                    </div>
                                )}
                                {/* Trait Pills */}
                                <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                                    {character.traits.slice(0, 3).map((trait, i) => (
                                        <span
                                            key={i}
                                            className={`text-[10px] font-bold px-2 py-1 rounded-full ${character.isMystery
                                                ? 'bg-indigo-700/80 text-indigo-200'
                                                : 'bg-white/90 text-deep'
                                                }`}
                                        >
                                            {trait}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Character Info */}
                            <div className={`p-5 ${character.isMystery ? 'text-white' : 'text-deep'}`}>
                                <h3 className="font-black text-xl md:text-2xl mb-1">
                                    {character.name}
                                </h3>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${character.isMystery ? 'text-indigo-300' : 'text-emerald-600'
                                    }`}>
                                    {character.role}
                                </p>
                                <p className={`text-sm font-medium italic mb-3 ${character.isMystery ? 'text-indigo-200' : 'text-deep/70'
                                    }`}>
                                    &quot;{character.tagline}&quot;
                                </p>
                                <p className={`text-xs leading-relaxed ${character.isMystery ? 'text-indigo-100' : 'text-gray-600'
                                    }`}>
                                    {character.description}
                                </p>

                                {character.isMystery && (
                                    <div className="mt-4 py-2 px-4 bg-indigo-800/50 rounded-xl text-center">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                                            🗓️ New Legend Coming Soon!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={scrollRight}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-xl flex items-center justify-center text-2xl hover:scale-110 transition-transform border-4 border-emerald-100 disabled:opacity-30"
                    disabled={activeIndex === CHARACTERS.length - 1}
                    aria-label="Next character"
                >
                    ▶️
                </button>
            </div>

            {/* Character Count */}
            <div className="text-center mt-8">
                <span className="text-sm font-bold text-gray-400">
                    {activeIndex + 1} / {CHARACTERS.length} Legends
                </span>
            </div>
        </div>
    );
};

export default CharacterTabs;
