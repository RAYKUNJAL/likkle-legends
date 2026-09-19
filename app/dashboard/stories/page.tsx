"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/storage';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { BookOpen, Star, ArrowRight, Lock, Sparkles, RefreshCw, Trash2, Library } from 'lucide-react';
import { deleteStorybookAction } from '@/app/actions/story-actions';
import { fetchKidsLibraryStories, parentOfficialStories } from '@/lib/library-stories';

export default function StorybooksPage() {
    const [stories, setStories] = useState<any[]>(() => parentOfficialStories());
    const [myStories, setMyStories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            let currentUserId: string | null = null;
            try {
                if (typeof supabase.auth?.getUser === 'function') {
                    const { data } = await supabase.auth.getUser();
                    currentUserId = data?.user?.id || null;
                    if (currentUserId) setUserId(currentUserId);
                }
            } catch (err) {
                console.warn('Dashboard auth lookup skipped:', err);
            }
            await fetchStories(currentUserId);
        };
        void loadInitialData();
    }, []);

    const fetchStories = async (currentUserId?: string | null) => {
        setIsLoading(true);
        try {
            // Featured legends come from the live stories_library API — not storybooks.
            const libraryStories = await fetchKidsLibraryStories();
            setStories(libraryStories.length ? libraryStories : parentOfficialStories());

            // Personal creations stay on storybooks; a failure must not empty the featured grid.
            if (currentUserId) {
                const { data: userData, error: userError } = await supabase
                    .from('storybooks')
                    .select('*')
                    .eq('user_id', currentUserId)
                    .eq('is_active', false)
                    .order('created_at', { ascending: false });

                if (userError) {
                    console.warn('Personal storybooks unavailable:', userError.message);
                    setMyStories([]);
                } else {
                    setMyStories(userData || []);
                }
            }
        } catch (error) {
            console.error('Error fetching stories:', error);
            setStories(parentOfficialStories());
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to sweep this story away? This cannot be undone.')) return;

        try {
            const result = await deleteStorybookAction(id);
            if (result.success) {
                setMyStories(prev => prev.filter(s => s.id !== id));
            } else {
                alert(result.error);
            }
        } catch (err) {
            alert('Failed to delete story');
        }
    };

    return (
        <div className="bg-[#FFFDF7] min-h-screen">
            <Sidebar view="parent" />
            <div className="ml-64">
                <Navbar />
                <main className="container py-24">
                    <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                    <Library size={24} />
                                </div>
                                <span className="text-primary font-black uppercase tracking-[0.2em] text-xs">Library Central</span>
                            </div>
                            <h1 className="text-6xl font-black text-deep mb-6">Legends Collection 📖</h1>
                            <p className="text-xl text-deep/50 max-w-2xl">
                                Access the world's best Caribbean curated stories and your own AI-personalized adventures.
                            </p>
                        </div>
                    </header>

                    {/* PERSONAL STORIES SECTION */}
                    {myStories.length > 0 && (
                        <section className="mb-20">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="h-px flex-1 bg-zinc-200"></div>
                                <h2 className="text-2xl font-black text-deep/40 uppercase tracking-widest whitespace-nowrap">My Created Tales ✨</h2>
                                <div className="h-px flex-1 bg-zinc-200"></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-10">
                                {myStories.map((story) => (
                                    <StoryCard
                                        key={story.id}
                                        story={story}
                                        isPersonal={true}
                                        onDelete={() => handleDelete(story.id)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* FEATURED STORIES SECTION */}
                    <div className="flex items-center gap-4 mb-10 mt-16">
                        <div className="h-px flex-1 bg-zinc-200"></div>
                        <h2 className="text-2xl font-black text-deep/40 uppercase tracking-widest whitespace-nowrap">Featured Legends 🌟</h2>
                        <div className="h-px flex-1 bg-zinc-200"></div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        {isLoading && stories.length === 0 ? (
                            <div className="col-span-2 flex justify-center py-20">
                                <RefreshCw className="animate-spin text-primary" size={48} />
                            </div>
                        ) : stories.length === 0 && myStories.length === 0 ? (
                            <div className="col-span-2 text-center py-20 bg-white rounded-[4rem] border-2 border-dashed border-zinc-200">
                                <p className="text-deep/30 font-black text-2xl uppercase tracking-widest">No ready books yet</p>
                                <p className="text-deep/20 mt-2">Only real Caribbean stories with covers and pages appear here.</p>
                            </div>
                        ) : stories.map((story, i) => (
                            <StoryCard key={story.id} story={story} />
                        ))}
                    </div>

                    {/* LEGEND MODE CALLOUT */}
                    <div className="mt-20 p-12 rounded-[4rem] bg-deep text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary opacity-10 rounded-full blur-[100px] -mr-64 -mt-64"></div>
                        <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center"><Sparkles size={28} className="text-primary" /></div>
                                    <h4 className="text-2xl font-black">AI Legend Mode</h4>
                                </div>
                                <h3 className="text-4xl lg:text-5xl font-black leading-tight">Every Child a Legend.</h3>
                                <p className="text-xl text-white/50 leading-relaxed">
                                    Our storytelling engine weaves regional milestones and island heritage directly into the narrative, building local pride.
                                </p>
                                <Link
                                    href="/portal/story-studio"
                                    className="inline-flex btn btn-primary px-12 py-5 rounded-[2rem] text-lg font-black shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Create a New Tale
                                </Link>
                            </div>
                            <div className="relative aspect-video rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl rotate-2">
                                <img src="/images/child_reading.png" alt="Legend Mode" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-transparent opacity-60"></div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        </div>
    );
}

function StoryCard({ story, isPersonal = false, onDelete }: { story: any, isPersonal?: boolean, onDelete?: () => void }) {
    const isLocked = story.is_active === false && !isPersonal;

    return (
        <div className={`relative p-8 rounded-[4rem] border-2 transition-all duration-500 overflow-hidden group ${isLocked
            ? 'bg-zinc-100 border-zinc-100 opacity-60 grayscale'
            : 'bg-white border-white shadow-xl shadow-zinc-200/50 hover:shadow-2xl hover:scale-[1.02] hover:border-primary/20'
            }`}>

            {/* DELETE BUTTON (Floating for personal) */}
            {isPersonal && onDelete && (
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                    className="absolute top-8 right-8 w-12 h-12 bg-white/80 backdrop-blur text-red-500 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-20"
                    title="Erase Story"
                >
                    <Trash2 size={20} />
                </button>
            )}

            <div className="flex gap-8 items-center">
                <div className="w-40 h-40 bg-zinc-50 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-inner flex items-center justify-center relative">
                    {(story.cover_image_url || story.image) ? (
                        <img src={story.cover_image_url || story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                        <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                            <BookOpen size={48} className="text-primary/20" />
                        </div>
                    )}
                    {isPersonal && (
                        <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <Sparkles size={8} /> MY CREATION
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-2xl font-black text-deep group-hover:text-primary transition-colors line-clamp-1">{story.title}</h3>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full">
                                {story.difficulty_level ? `Level ${story.difficulty_level}` : story.age_track === 'mini' ? 'Toddler' : 'Legend'}
                            </span>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3].map(star => (
                                    <Star key={star} size={12} fill={isLocked ? '#E4E4E7' : '#FFD700'} stroke="none" />
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link
                        href={isLocked ? '#' : `/library/stories/${story.id}`}
                        className={`flex items-center gap-3 text-sm font-black uppercase tracking-widest transition-all ${isLocked ? 'text-zinc-400 cursor-not-allowed' : 'text-primary group-hover:gap-5'
                            }`}
                    >
                        {isLocked ? (
                            <span className="flex items-center gap-2"><Lock size={16} /> Locked Tale</span>
                        ) : (
                            <>Read Now <ArrowRight size={18} /></>
                        )}
                    </Link>
                </div>
            </div>
        </div>
    );
}
