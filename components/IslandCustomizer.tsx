"use client";

import { useState } from 'react';
import { Map, Check, AlertCircle } from 'lucide-react';

const ISLANDS = [
    { name: "Jamaica", flag: "🇯🇲", value: "Jamaica" },
    { name: "Trinidad", flag: "🇹🇹", value: "Trinidad" },
    { name: "Barbados", flag: "🇧🇧", value: "Barbados" },
    { name: "Haiti", flag: "🇭🇹", value: "Haiti" },
    { name: "Guyana", flag: "🇬🇾", value: "Guyana" },
    { name: "St. Lucia", flag: "🇱🇨", value: "St Lucia" },
];

export default function IslandCustomizer() {
    const [selectedIslands, setSelectedIslands] = useState<string[]>(["Jamaica"]);

    const handleToggle = (value: string) => {
        setSelectedIslands(prev => {
            if (prev.includes(value)) {
                return prev.filter(i => i !== value);
            }
            if (prev.length < 2) {
                return [...prev, value];
            }
            return prev;
        });
    };

    const isLimitReached = selectedIslands.length >= 2;

    return (
        <section className="py-12">
            <div className="bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                <div className="text-center mb-12 relative z-10">
                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Map size={40} />
                    </div>
                    <h2 className="text-4xl font-black text-deep mb-3 tracking-tight">Customize Your Heritage Journey</h2>
                    <p className="text-deep/50 text-lg font-medium max-w-xl mx-auto leading-relaxed">
                        Select up to two islands so we can tailor their stories, songs, and mail to your family's specific roots.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
                    {ISLANDS.map((island) => {
                        const isSelected = selectedIslands.includes(island.value);
                        const isDisabled = !isSelected && isLimitReached;

                        return (
                            <button
                                key={island.value}
                                onClick={() => handleToggle(island.value)}
                                disabled={isDisabled}
                                className={`relative p-8 rounded-[2.5rem] border-2 transition-all duration-300 group/island ${isSelected
                                        ? 'border-secondary bg-secondary/5 shadow-xl shadow-secondary/10'
                                        : 'border-zinc-100 bg-zinc-50 hover:border-zinc-200 hover:bg-white'
                                    } ${isDisabled ? 'opacity-40 cursor-not-allowed grayscale' : 'cursor-pointer'}`}
                            >
                                {isSelected && (
                                    <div className="absolute top-4 right-4 w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                        <Check size={16} strokeWidth={4} />
                                    </div>
                                )}
                                <span className="text-6xl block mb-4 group-hover/island:scale-110 transition-transform duration-500">
                                    {island.flag}
                                </span>
                                <span className={`font-black text-lg ${isSelected ? 'text-secondary' : 'text-deep'}`}>
                                    {island.name}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {isLimitReached && (
                    <div className="mt-10 p-6 bg-pink-50 rounded-[2.5rem] border border-pink-100 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <AlertCircle className="text-secondary" size={20} />
                        <p className="text-secondary font-black text-sm uppercase tracking-widest">
                            You've selected 2 islands for a perfect dual-heritage experience!
                        </p>
                    </div>
                )}

                <div className="mt-12 pt-10 border-t border-zinc-50 text-center relative z-10">
                    <button
                        className="bg-primary text-white px-12 py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        onClick={() => alert("Preferences saved! Your stories are being rewritten...")}
                    >
                        Save Heritage Preferences
                    </button>
                </div>
            </div>
        </section>
    );
}
