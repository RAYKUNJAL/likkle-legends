"use client";

import { useState, useEffect } from 'react';
import { Download, FileText, Search, Printer } from 'lucide-react';
import { getPrintables } from '@/lib/database';
import { useUser } from '@/components/UserContext';
import { EmptyState } from '@/components/EmptyState';
import { motion } from 'framer-motion';

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
    { id: 'coloring', label: 'Colouring', emoji: '🖍️' },
    { id: 'activity', label: 'Activities', emoji: '✨' },
    { id: 'educational', label: 'Learning', emoji: '🧠' },
];

// Styled placeholder shown when no preview image exists
const CATEGORY_PLACEHOLDERS: Record<string, { bg: string; border: string; emoji: string; color: string }> = {
    coloring:    { bg: 'from-amber-50 to-orange-100', border: 'border-amber-200', emoji: '🖍️', color: 'text-amber-500' },
    activity:    { bg: 'from-green-50 to-emerald-100', border: 'border-green-200', emoji: '✂️', color: 'text-green-500' },
    educational: { bg: 'from-blue-50 to-indigo-100', border: 'border-blue-200', emoji: '📚', color: 'text-blue-500' },
    default:     { bg: 'from-slate-50 to-slate-100', border: 'border-slate-200', emoji: '📄', color: 'text-slate-400' },
};

function hasRealPreview(url?: string) {
    if (!url) return false;
    if (url === '/images/logo.png') return false;
    if (url.startsWith('/printables/placeholder')) return false;
    return true;
}

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
        const matchesSearch = !searchQuery ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-8">
            {/* Search & Filter bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Category filter chips */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black whitespace-nowrap transition-all border-b-4 text-sm ${
                                activeCategory === cat.id
                                    ? 'bg-amber-400 border-amber-600 text-white translate-y-0.5'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <span>{cat.emoji}</span>
                            {cat.label}
                            {activeCategory === cat.id && cat.id !== 'all' && (
                                <span className="bg-white/30 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                    {filteredPrintables.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search input */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search worksheets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-amber-400 shadow-sm transition-all text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-lg leading-none"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Results count */}
            {!isLoading && (searchQuery || activeCategory !== 'all') && (
                <p className="text-sm text-slate-400 font-medium -mt-2">
                    {filteredPrintables.length} worksheet{filteredPrintables.length !== 1 ? 's' : ''} found
                </p>
            )}

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 8].map(i => (
                        <div key={i} className="bg-white rounded-[2rem] overflow-hidden border-4 border-slate-100 animate-pulse">
                            <div className="aspect-[3/4] bg-slate-100" />
                            <div className="p-4 space-y-2">
                                <div className="h-3 bg-slate-100 rounded w-1/3" />
                                <div className="h-4 bg-slate-100 rounded w-2/3" />
                                <div className="h-8 bg-slate-100 rounded-xl mt-3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPrintables.length === 0 ? (
                <EmptyState
                    icon="🖨️"
                    title="No worksheets found"
                    message="Try a different category or search term!"
                    actionLabel="View All"
                    onAction={() => { setActiveCategory('all'); setSearchQuery(''); }}
                />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredPrintables.map((item, idx) => (
                        <PrintableCard
                            key={item.id}
                            item={item}
                            isLocked={!canAccess(item.tier_required || 'free')}
                            idx={idx}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function PrintableCard({ item, isLocked, idx }: { item: Printable; isLocked: boolean; idx: number }) {
    const placeholder = CATEGORY_PLACEHOLDERS[item.category] || CATEGORY_PLACEHOLDERS.default;
    const realPreview = hasRealPreview(item.preview_url);
    const hasLink = !!item.pdf_url && !item.pdf_url.includes('placeholder');

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="group bg-white rounded-[2rem] overflow-hidden border-4 border-slate-50 hover:border-amber-400 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 relative"
        >
            {/* Preview area — 3:4 aspect ratio */}
            <div className="relative w-full aspect-[3/4] overflow-hidden">
                {realPreview ? (
                    /* Real preview image from admin upload */
                    <img
                        src={item.preview_url!}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    /* Styled placeholder — live mini preview of the worksheet */
                    <div className={`w-full h-full bg-gradient-to-br ${placeholder.bg} border-b-4 ${placeholder.border} flex flex-col items-center justify-center gap-3 p-4`}>
                        {/* Category emoji */}
                        <span className="text-4xl">{placeholder.emoji}</span>
                        {/* Mini simulated worksheet lines */}
                        <div className="w-full space-y-1.5 px-2">
                            <div className="h-2 bg-white/70 rounded-full w-full" />
                            <div className="h-2 bg-white/70 rounded-full w-4/5" />
                            <div className="h-2 bg-white/70 rounded-full w-full" />
                            <div className="h-2 bg-white/50 rounded-full w-3/5" />
                        </div>
                        {/* Mini grid of boxes simulating worksheet cells */}
                        <div className="grid grid-cols-3 gap-1 w-full px-2">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-8 bg-white/60 rounded border-2 border-white/80" />
                            ))}
                        </div>
                        <div className="w-full space-y-1 px-2">
                            <div className="h-1.5 bg-white/50 rounded-full w-full" />
                            <div className="h-1.5 bg-white/50 rounded-full w-2/3" />
                        </div>
                    </div>
                )}

                {/* Lock overlay */}
                {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center">
                        <span className="text-3xl mb-2">🔒</span>
                        <p className="font-black text-xs">Upgrade to Unlock</p>
                    </div>
                )}

                {/* Hover print action */}
                {!isLocked && hasLink && (
                    <a
                        href={item.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Print ${item.title}`}
                        className="absolute inset-0 bg-amber-400/85 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white"
                    >
                        <div className="bg-white text-amber-500 p-3.5 rounded-full shadow-xl">
                            <Printer size={22} />
                        </div>
                        <span className="font-black text-sm">Open & Print</span>
                    </a>
                )}

                {/* NEW badge */}
                {item.is_new && (
                    <div className="absolute top-2 right-2 bg-green-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
                        NEW
                    </div>
                )}
            </div>

            {/* Card info footer */}
            <div className="p-4">
                <span className={`text-[10px] font-black uppercase tracking-widest ${placeholder.color}`}>
                    {item.category}
                </span>
                <h3 className="text-sm font-black text-slate-800 leading-tight mt-0.5 mb-1 group-hover:text-amber-600 transition-colors line-clamp-2">
                    {item.title}
                </h3>

                {isLocked ? (
                    <div className="mt-2 w-full py-2.5 bg-slate-50 text-slate-400 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-not-allowed">
                        🔒 Locked
                    </div>
                ) : hasLink ? (
                    <a
                        href={item.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 w-full py-2.5 bg-amber-50 text-amber-600 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 hover:bg-amber-400 hover:text-white transition-all"
                    >
                        <Download size={12} /> Download PDF
                    </a>
                ) : (
                    <div className="mt-2 w-full py-2.5 bg-slate-50 text-slate-400 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-not-allowed">
                        🕐 Coming Soon
                    </div>
                )}
            </div>
        </motion.div>
    );
}
