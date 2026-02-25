"use client";

import { useState, useEffect } from 'react';
import {
    Download, FileText, Search, Filter,
    ArrowLeft, Heart, Sparkles, Printer,
    Star, LayoutGrid, List
} from 'lucide-react';
import Link from 'next/link';
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
    { id: 'all',       label: 'All',        icon: LayoutGrid },
    { id: 'coloring',  label: 'Coloring',   icon: Printer },
    { id: 'activity',  label: 'Activities', icon: Sparkles },
    { id: 'worksheet', label: 'Learning',   icon: FileText },
    { id: 'craft',     label: 'Crafts',     icon: Star },
];

export default function PrintablesPage() {
    const { canAccess } = useUser();
    const [printables, setPrintables] = useState<Printable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        <div className="min-h-screen bg-[#FDFCF0] font-heading">
            {/* Header Area */}
            <header className="bg-white border-b-4 border-amber-100 px-6 py-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/portal"
                            className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 hover:bg-amber-100 transition-colors border-2 border-amber-200 shadow-sm"
                        >
                            <ArrowLeft size={24} />
                        </Link>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                🎨 Print & Play
                                <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full border border-amber-200">
                                    {printables.length} Items
                                </span>
                            </h1>
                            <p className="text-slate-500 font-bold">Activity sheets, coloring pages & more!</p>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Find an activity..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-amber-400 w-full md:w-64 transition-all"
                            />
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-2xl border-2 border-slate-200">
                            <button
                                type="button"
                                aria-label="Grid view"
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                type="button"
                                aria-label="List view"
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="max-w-7xl mx-auto mt-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black whitespace-nowrap transition-all border-b-4 ${activeCategory === cat.id
                                ? 'bg-amber-400 border-amber-600 text-white translate-y-1'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <cat.icon size={18} />
                            {cat.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Content Grid */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="bg-white rounded-[2.5rem] aspect-[3/4] animate-pulse border-4 border-slate-100" />
                        ))}
                    </div>
                ) : filteredPrintables.length === 0 ? (
                    <EmptyState
                        icon="🖨️"
                        title="No Printables Found"
                        message="Try a different search or category!"
                        actionLabel="Show All Items"
                        onAction={() => { setActiveCategory('all'); setSearchQuery(''); }}
                    />
                ) : (
                    <motion.div
                        layout
                        className={viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                            : "space-y-4"
                        }
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredPrintables.map((item) => (
                                <PrintableCard
                                    key={item.id}
                                    item={item}
                                    isLocked={!canAccess(item.tier_required || 'free')}
                                    view={viewMode}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

function PrintableCard({ item, isLocked, view }: { item: Printable, isLocked: boolean, view: 'grid' | 'list' }) {
    if (view === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white p-6 rounded-3xl border-4 border-slate-100 flex items-center justify-between hover:border-amber-200 transition-all group shadow-sm"
            >
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl border-2 border-slate-100">
                        {item.category === 'coloring' ? '🖍️' : item.category === 'worksheet' ? '🧠' : item.category === 'craft' ? '✂️' : '✨'}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800">{item.title}</h3>
                        <p className="text-slate-500 text-sm font-bold">{item.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {isLocked ? (
                        <Link href="/parent/billing" className="px-6 py-3 bg-slate-100 text-slate-400 rounded-xl font-black text-sm">
                            🔒 Upgrade
                        </Link>
                    ) : (
                        <a
                            href={item.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-amber-400 text-white rounded-xl font-black text-sm flex items-center gap-2 hover:bg-amber-500 hover:-translate-y-1 transition-all shadow-lg shadow-amber-200"
                        >
                            <Download size={18} /> Print Now
                        </a>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group bg-white rounded-[2.5rem] overflow-hidden border-4 border-slate-100 hover:border-amber-400 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2 relative"
        >
            {/* New Badge */}
            {item.is_new && (
                <div className="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg">
                    New!
                </div>
            )}

            {/* Preview Image */}
            <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden">
                {item.preview_url ? (
                    <img
                        src={item.preview_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 gap-4">
                        <FileText size={64} />
                        <span className="font-black text-xs uppercase tracking-widest">No Preview</span>
                    </div>
                )}

                {/* Lock Overlay */}
                {isLocked && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-white p-6 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                            <Star size={32} className="text-amber-400 fill-amber-400" />
                        </div>
                        <p className="font-black text-lg">Subscribers Only</p>
                        <p className="text-white/80 text-xs font-bold mt-2">Join Likkle Legends for unlimited printables!</p>
                        <Link href="/parent/billing" className="mt-6 px-6 py-3 bg-white text-slate-900 rounded-xl font-black text-sm shadow-xl">
                            Upgrade Now
                        </Link>
                    </div>
                )}

                {/* Hover Print Button */}
                {!isLocked && (
                    <div className="absolute inset-0 bg-amber-400/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a
                            href={item.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Print ${item.title}`}
                            aria-label={`Print ${item.title}`}
                            className="bg-white text-amber-600 p-6 rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300 hover:bg-amber-50"
                        >
                            <Printer size={32} />
                        </a>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {item.category}
                    </span>
                    {!isLocked && (
                        <button type="button" title="Save to favourites" aria-label="Save to favourites" className="text-slate-300 hover:text-rose-500 transition-colors">
                            <Heart size={18} />
                        </button>
                    )}
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-1 leading-tight group-hover:text-amber-600 transition-colors">
                    {item.title}
                </h3>
                <p className="text-slate-500 text-sm font-medium line-clamp-2">
                    {item.description}
                </p>
            </div>
        </motion.div>
    );
}

