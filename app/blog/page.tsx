'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Calendar, Clock, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { getPublishedPosts, getCategories, BlogPost, BlogCategory } from '@/lib/services/blog';

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [activeCategory]);

    async function loadData() {
        setLoading(true);
        const [postsData, categoriesData] = await Promise.all([
            getPublishedPosts({ category: activeCategory || undefined, limit: 12 }),
            getCategories()
        ]);
        setPosts(postsData);
        setCategories(categoriesData);
        setLoading(false);
    }

    const filteredPosts = searchQuery
        ? posts.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : posts;

    const featuredPost = filteredPosts[0];
    const regularPosts = filteredPosts.slice(1);

    return (
        <div className="min-h-screen bg-[#FFFDF7]">
            {/* Hero Header */}
            <section className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
                </div>

                <div className="container relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-bold uppercase tracking-widest mb-6">
                            <Sparkles size={16} /> Caribbean Education Hub
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                            Likkle Legends Blog
                        </h1>
                        <p className="text-xl text-white/80 mb-10 leading-relaxed">
                            Stories, tips, and resources for raising proud Caribbean children.
                            Explore our collection of educational articles, cultural guides, and parenting wisdom.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-deep/30" size={22} />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white shadow-2xl text-deep font-medium placeholder:text-deep/30 focus:outline-none focus:ring-4 focus:ring-white/30"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Category Pills */}
            <section className="py-8 border-b border-zinc-100 bg-white sticky top-0 z-30 shadow-sm">
                <div className="container">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setActiveCategory(null)}
                            className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${!activeCategory
                                    ? 'bg-deep text-white shadow-lg'
                                    : 'bg-zinc-100 text-deep/60 hover:bg-zinc-200'
                                }`}
                        >
                            All Posts
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${activeCategory === cat.id
                                        ? 'bg-deep text-white shadow-lg'
                                        : 'bg-zinc-100 text-deep/60 hover:bg-zinc-200'
                                    }`}
                            >
                                <span>{cat.icon}</span> {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="py-16">
                <div className="container">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-2xl font-bold text-deep mb-2">No posts yet</h3>
                            <p className="text-deep/50">Check back soon for amazing content!</p>
                        </div>
                    ) : (
                        <>
                            {/* Featured Post */}
                            {featuredPost && (
                                <Link href={`/blog/${featuredPost.slug}`} className="group block mb-12">
                                    <article className="relative bg-white rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all border border-zinc-100">
                                        <div className="grid md:grid-cols-2 gap-0">
                                            <div className="relative h-64 md:h-auto md:min-h-[400px]">
                                                {featuredPost.featured_image_url ? (
                                                    <Image
                                                        src={featuredPost.featured_image_url}
                                                        alt={featuredPost.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                                        <span className="text-8xl opacity-50">📚</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-6 left-6">
                                                    <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs font-black uppercase tracking-widest text-primary">
                                                        Featured
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-10 md:p-14 flex flex-col justify-center">
                                                <span className="text-primary font-bold text-sm uppercase tracking-widest mb-4">
                                                    {categories.find(c => c.id === featuredPost.category)?.name || featuredPost.category}
                                                </span>
                                                <h2 className="text-3xl md:text-4xl font-black text-deep mb-4 group-hover:text-primary transition-colors leading-tight">
                                                    {featuredPost.title}
                                                </h2>
                                                <p className="text-deep/60 text-lg mb-6 line-clamp-3">
                                                    {featuredPost.excerpt}
                                                </p>
                                                <div className="flex items-center gap-6 text-sm text-deep/40">
                                                    <span className="flex items-center gap-2">
                                                        <Calendar size={16} />
                                                        {new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString('en-US', {
                                                            month: 'long',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Clock size={16} />
                                                        {featuredPost.read_time_minutes} min read
                                                    </span>
                                                </div>
                                                <div className="mt-8">
                                                    <span className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
                                                        Read Article <ArrowRight size={18} />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            )}

                            {/* Regular Posts Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {regularPosts.map(post => (
                                    <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                                        <article className="bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all border border-zinc-100 h-full flex flex-col">
                                            <div className="relative h-48">
                                                {post.featured_image_url ? (
                                                    <Image
                                                        src={post.featured_image_url}
                                                        alt={post.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                                        <span className="text-5xl opacity-50">
                                                            {categories.find(c => c.id === post.category)?.icon || '📝'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                                                    {categories.find(c => c.id === post.category)?.name || post.category}
                                                </span>
                                                <h3 className="text-xl font-bold text-deep mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                                    {post.title}
                                                </h3>
                                                <p className="text-deep/50 text-sm mb-4 line-clamp-2 flex-1">
                                                    {post.excerpt}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-deep/40 pt-4 border-t border-zinc-100">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {post.read_time_minutes} min
                                                    </span>
                                                    <span className="flex items-center gap-1 text-primary font-bold group-hover:gap-2 transition-all">
                                                        Read <ChevronRight size={14} />
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-primary to-secondary">
                <div className="container">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            Want More Caribbean Content?
                        </h2>
                        <p className="text-white/80 text-lg mb-8">
                            Subscribe to our mail club and get personalized letters, stories, and activities delivered monthly!
                        </p>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl"
                        >
                            Start Your Adventure <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
