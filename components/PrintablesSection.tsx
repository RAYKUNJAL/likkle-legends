"use client";

import { useState, useEffect } from 'react';
import {
    Download, FileText, Search, Printer,
    Star, LayoutGrid, List
} from 'lucide-react';
import { getPrintables } from '@/lib/database';
import { useUser } from '@/components/UserContext';
import { EmptyState } from '@/components/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

interface Printable {
    id: string;
    title: string;
    description: string;
    category: string;
    pdf_url: string;
    preview_url?: string;
    tier_required?: string;
    is_new?: boolean;
}

const CATEGORIES = [
    { id: 'all', label: 'All', emoji: '🌈' },
    { id: 'coloring', label: 'Coloring', emoji: '🖍️' },
    { id: 'activity', label: 'Activities', emoji: '✨' },
    { id: 'educational', label: 'Learning', emoji: '🧠' },
];

export function PrintablesSection() {
    const { canAccess } = useUser();
    const [printables, setPrintables] = useState<Printable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadPrintables();
    }, []);

    const loadPrintables = async () => {
        setIsLoading(true);
        try {
            const data = await getPrintables();
            setPrintables(data as Printable[]);
        } catch (error) {
            console.error('Failed to load printables:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPrintables = printables.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-10">
            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black whitespace-nowrap transition-all border-b-4 ${activeCategory === cat.id
                                ? 'bg-amber-400 border-amber-600 text-white translate-y-1'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <span>{cat.emoji}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search activities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-amber-400 shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-[2.5rem] aspect-[3/4] animate-pulse border-4 border-slate-100" />
                    ))}
                </div>
            ) : filteredPrintables.length === 0 ? (
                <EmptyState
                    icon="🖨️"
                    title="No activities found"
                    message="Try a different category or search term!"
                    actionLabel="View All"
                    onAction={() => { setActiveCategory('all'); setSearchQuery(''); }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPrintables.map((item) => (
                        <PrintableCard
                            key={item.id}
                            item={item}
                            isLocked={!canAccess(item.tier_required || 'free')}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function PrintableCard({ item, isLocked }: { item: Printable, isLocked: boolean }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group bg-white rounded-[2.5rem] overflow-hidden border-4 border-slate-50 hover:border-amber-400 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2 relative"
        >
            {/* Preview Image */}
            <div className="relative w-full aspect-[3/4] bg-slate-100">
                {item.preview_url ? (
                    <img
                        src={item.preview_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 gap-4">
                        <FileText size={48} />
                    </div>
                )}

                {/* Lock Overlay */}
                {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center">
                        <p className="font-black text-sm">Legendary Content</p>
                        <p className="text-white/80 text-[10px] uppercase tracking-widest mt-1">Found in higher tiers</p>
                    </div>
                )}

                {/* Action Button Overlay */}
                {!isLocked && (
                    <div className="absolute inset-0 bg-amber-400/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a
                            href={item.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white text-amber-600 p-4 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300"
                            aria-label={`Print ${item.title}`}
                            title={`Print ${item.title}`}
                        >
                            <Printer size={24} />
                        </a>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                        {item.category}
                    </span>
                    {item.is_new && (
                        <span className="bg-green-100 text-green-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">NEW</span>
                    )}
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight group-hover:text-amber-600 transition-colors">
                    {item.title}
                </h3>
                <p className="text-slate-500 text-xs font-medium line-clamp-1 mb-4">
                    {item.description}
                </p>

                {!isLocked ? (
                    <a
                        href={item.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-amber-50 text-amber-600 rounded-xl font-black text-xs flex items-center justify-center gap-2 hover:bg-amber-400 hover:text-white transition-all"
                    >
                        <Download size={14} /> Download PDF
                    </a>
                ) : (
                    <div className="w-full py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-not-allowed">
                        🔒 Locked
                    </div>
                )}
            </div>
        </motion.div>
    );
}
