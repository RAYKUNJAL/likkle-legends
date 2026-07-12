'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface IslandOption {
    id: string;
    name: string;
    flag: string;
    region: string;
    culturalFact: string;
}

interface IslandPickerProps {
    islands: IslandOption[];
    value: string | null;
    onChange: (id: string) => void;
}

const REGION_ORDER = [
    'Greater Antilles',
    'Lucayan',
    'Leeward',
    'Windward',
    'Southern',
    'Mainland',
    'Atlantic',
    'Other',
];

export default function IslandPicker({ islands, value, onChange }: IslandPickerProps) {
    const [search, setSearch] = useState('');
    const optionRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const filtered = useMemo(() => {
        if (!search.trim()) return islands;
        const q = search.toLowerCase();
        return islands.filter((i) => i.name.toLowerCase().includes(q));
    }, [islands, search]);

    const grouped = useMemo(() => {
        const map: Record<string, IslandOption[]> = {};
        for (const island of filtered) {
            const region = island.region || 'Other';
            if (!map[region]) map[region] = [];
            map[region].push(island);
        }
        return map;
    }, [filtered]);

    const orderedRegions = useMemo(() => {
        const present = Object.keys(grouped);
        return REGION_ORDER.filter((r) => present.includes(r)).concat(
            present.filter((r) => !REGION_ORDER.includes(r))
        );
    }, [grouped]);

    const flatFiltered = useMemo(
        () => orderedRegions.flatMap((r) => grouped[r] || []),
        [orderedRegions, grouped]
    );

    const selectedIndex = flatFiltered.findIndex((i) => i.id === value);
    const selectedIsland = islands.find((i) => i.id === value);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const nextIdx =
                selectedIndex < flatFiltered.length - 1 ? selectedIndex + 1 : 0;
            const nextIsland = flatFiltered[nextIdx];
            if (nextIsland) {
                onChange(nextIsland.id);
                optionRefs.current[nextIsland.id]?.focus();
            }
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prevIdx =
                selectedIndex > 0 ? selectedIndex - 1 : flatFiltered.length - 1;
            const prevIsland = flatFiltered[prevIdx];
            if (prevIsland) {
                onChange(prevIsland.id);
                optionRefs.current[prevIsland.id]?.focus();
            }
        }
    };

    return (
        <div className="w-full">
            {/* Search */}
            <div className="mb-4 relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search islands..."
                    className="w-full px-4 py-3 rounded-2xl border-2 border-blue-100 focus:border-primary focus:outline-none text-sm font-bold text-blue-900 placeholder:text-blue-200"
                    aria-label="Search islands"
                />
            </div>

            {/* Selected fact preview */}
            <AnimatePresence>
                {selectedIsland && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                            <span className="text-3xl">{selectedIsland.flag}</span>
                            <div>
                                <p className="text-xs font-black text-primary uppercase tracking-wider">
                                    {selectedIsland.name}
                                </p>
                                <p className="text-sm text-blue-900 font-medium">
                                    {selectedIsland.culturalFact}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Island grid grouped by region */}
            <div
                role="listbox"
                aria-label="Select your island"
                onKeyDown={handleKeyDown}
                className="max-h-72 overflow-y-auto pr-1 scrollbar-thin space-y-4"
            >
                {orderedRegions.map((region) => (
                    <div key={region}>
                        <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2 px-1">
                            {region}
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {grouped[region].map((island) => {
                                const isSelected = value === island.id;
                                return (
                                    <motion.button
                                        key={island.id}
                                        ref={(el) => {
                                            optionRefs.current[island.id] = el;
                                        }}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => onChange(island.id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`p-3 rounded-2xl border-4 transition-colors text-center ${
                                            isSelected
                                                ? 'border-primary bg-primary/5 shadow-md'
                                                : 'border-transparent bg-gray-50 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className="text-3xl mb-1">{island.flag}</div>
                                        <p className="text-[9px] font-black text-blue-900 uppercase leading-tight">
                                            {island.name}
                                        </p>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {flatFiltered.length === 0 && (
                    <p className="text-center text-sm text-blue-300 font-medium py-8">
                        No islands found. Try another search!
                    </p>
                )}
            </div>

            <p className="text-center text-xs text-blue-300 mt-2 font-medium">
                {flatFiltered.length} islands available
            </p>
        </div>
    );
}
