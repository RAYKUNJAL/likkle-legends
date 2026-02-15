"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Languages } from 'lucide-react';

interface DialectDialProps {
    selectedIsland: string;
    dialectLevel: 'standard' | 'local';
    onIslandChange: (island: string) => void;
    onLevelChange: (level: 'standard' | 'local') => void;
}

const ISLANDS = [
    { code: 'TT', label: 'Trinidad', flag: '🇹🇹' },
    { code: 'JM', label: 'Jamaica', flag: '🇯🇲' },
    { code: 'BB', label: 'Barbados', flag: '🇧🇧' },
];

export function DialectDial({ selectedIsland, dialectLevel, onIslandChange, onLevelChange }: DialectDialProps) {
    return (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border-2 border-orange-100 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-xl text-orange-600">
                    <Globe size={20} />
                </div>
                <h3 className="text-lg font-black text-orange-950">Dialect Dial</h3>
            </div>

            <div className="space-y-6">
                {/* Island Selector */}
                <div>
                    <label className="text-[10px] font-black uppercase text-orange-400 tracking-widest mb-3 block">Choose Island</label>
                    <div className="flex gap-2">
                        {ISLANDS.map((island) => (
                            <button
                                key={island.code}
                                onClick={() => onIslandChange(island.code)}
                                className={`flex-1 py-3 px-2 rounded-2xl border-2 transition-all text-sm font-bold flex flex-col items-center gap-1 ${selectedIsland === island.code
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg scale-105'
                                        : 'bg-white border-orange-50 text-orange-900/60 hover:border-orange-200'
                                    }`}
                            >
                                <span className="text-xl">{island.flag}</span>
                                <span className="text-[10px]">{island.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Level Toggle */}
                <div>
                    <label className="text-[10px] font-black uppercase text-orange-400 tracking-widest mb-3 block">Dialect Level</label>
                    <div className="bg-orange-50 p-1.5 rounded-2xl flex gap-1 relative overflow-hidden">
                        <button
                            onClick={() => onLevelChange('standard')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all relative z-10 ${dialectLevel === 'standard' ? 'text-white' : 'text-orange-900/40'
                                }`}
                        >
                            Standard
                        </button>
                        <button
                            onClick={() => onLevelChange('local')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black transition-all relative z-10 ${dialectLevel === 'local' ? 'text-white' : 'text-orange-900/40'
                                }`}
                        >
                            Local Dialect
                        </button>

                        {/* Sliding Indicator */}
                        <motion.div
                            animate={{ x: dialectLevel === 'standard' ? '0%' : '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-orange-500 rounded-xl shadow-md z-0"
                        />
                    </div>
                    <p className="text-[10px] text-orange-900/40 mt-3 italic text-center">
                        {dialectLevel === 'standard'
                            ? "Standard English for easy reading."
                            : "Rich Caribbean flavor and local phrases!"}
                    </p>
                </div>
            </div>
        </div>
    );
}
