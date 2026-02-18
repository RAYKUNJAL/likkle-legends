"use client";

import { useState, useEffect } from 'react';
import {
    BookOpen, FileText, Trash2, Search, Filter,
    ChevronRight, Sparkles, Book, ArrowLeft,
    Clock, Globe, Star, Loader2, Library, BadgeCheck
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase-client';
import { deleteStorybookAction } from '@/app/actions/story-actions';
import toast from 'react-hot-toast';

type Tab = 'stories' | 'workbooks';

interface LibraryDashboardProps {
    user: any;
}

export function LibraryDashboard({ user }: LibraryDashboardProps) {
    const [activeTab, setActiveTab] = useState<Tab>('stories');
    const [isLoading, setIsLoading] = useState(true);
    const [stories, setStories] = useState<any[]>([]);
    const [workbooks, setWorkbooks] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) {
            loadLibrary();
        }
    }, [user]);

    const loadLibrary = async () => {
        setIsLoading(true);
        try {
            // Load Personal + Official Stories
            const { data: storyData, error: storyError } = await supabase
                .from('storybooks')
                .select('*')
                .or(`user_id.eq.${user?.id},and(user_id.is.null,is_active.eq.true)`)
                .order('created_at', { ascending: false });

            if (storyError) throw storyError;
            setStories(storyData || []);

            // Load Personal Workbooks/Packs from generated_content
            const { data: packData, error: packError } = await supabase
                .from('generated_content')
                .select('*')
                .eq('family_id', user?.id)
                .in('content_type', ['pack', 'activity_pack'])
                .order('created_at', { ascending: false });

            if (packError) throw packError;
            setWorkbooks(packData || []);

        } catch (err) {
            console.error('Failed to load library:', err);
            toast.error('Could not fetch your treasures.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteStory = async (id: string) => {
        if (!confirm('Are you sure you want to sweep this story away?')) return;

        try {
            const result = await deleteStorybookAction(id);
            if (result.success) {
                setStories(prev => prev.filter(s => s.id !== id));
                toast.success('Story erased from de village.');
            } else {
                toast.error(result.error || 'Failed to delete story');
            }
        } catch (err) {
            toast.error('Failed to delete story');
        }
    };

    const handleDeleteWorkbook = async (id: string) => {
        if (!confirm('Are you sure you want to erase this activity pack?')) return;

        try {
            const { error } = await supabase
                .from('generated_content')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setWorkbooks(prev => prev.filter(w => w.id !== id));
            toast.success('Activity pack removed.');
        } catch (err) {
            toast.error('Failed to delete workbook');
        }
    };

    const filteredItems = (activeTab === 'stories' ? stories : workbooks).filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-[2rem] border-2 border-slate-200 w-fit">
                    <button
                        onClick={() => setActiveTab('stories')}
                        className={`px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'stories' ? 'bg-white text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Stories
                    </button>
                    <button
                        onClick={() => setActiveTab('workbooks')}
                        className={`px-8 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'workbooks' ? 'bg-white text-primary shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Workbooks
                    </button>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 focus:border-amber-400 rounded-2xl outline-none font-bold text-sm transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-[4/5] bg-slate-50 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            ) : filteredItems.length === 0 ? (
                <div className="text-center py-20 border-4 border-dashed border-slate-50 rounded-[3rem]">
                    <div className="text-6xl mb-6 opacity-30">📚</div>
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Your library is currently empty</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item) => (
                            <LibraryItemCard
                                key={item.id}
                                item={item}
                                type={activeTab}
                                onDelete={() => activeTab === 'stories' ? handleDeleteStory(item.id) : handleDeleteWorkbook(item.id)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

function LibraryItemCard({ item, type, onDelete }: { item: any, type: Tab, onDelete: () => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group bg-white rounded-[2.5rem] overflow-hidden border-2 border-slate-50 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all relative"
        >
            <div className="aspect-[16/10] bg-slate-50 relative overflow-hidden">
                {type === 'stories' ? (
                    item.cover_image_url ? (
                        <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-30 bg-blue-50">📖</div>
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-40 bg-purple-50">📚</div>
                )}

                <div className="absolute top-4 right-4 flex gap-2">
                    {!item.user_id && (
                        <div className="bg-amber-400 text-white px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                            <BadgeCheck size={14} /> Official
                        </div>
                    )}
                    {item.user_id && (
                        <button
                            onClick={(e) => { e.preventDefault(); onDelete(); }}
                            className="w-10 h-10 bg-white/90 backdrop-blur text-red-500 rounded-xl shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-20"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {item.title || 'Untitled Creation'}
                </h3>
                <p className="text-slate-500 font-bold text-xs line-clamp-2 mb-6 h-8">
                    {item.summary || item.short_hook || "A special Caribbean legend created for your family."}
                </p>

                <div className="flex items-center gap-3">
                    <Link
                        href={type === 'stories' ? `/portal/stories/${item.id}` : '#'}
                        className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-center text-[10px] uppercase tracking-widest hover:bg-primary transition-colors"
                    >
                        {type === 'stories' ? 'Read Story' : 'Open Pack'}
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
