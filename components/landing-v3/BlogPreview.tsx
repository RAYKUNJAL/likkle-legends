'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, Clock, Sparkles } from 'lucide-react';
import { getPublishedPosts, BlogPost } from '@/lib/services/blog';

export function BlogPreview() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPosts() {
            try {
                const latest = await getPublishedPosts({ limit: 3 });
                setPosts(latest);
            } catch (error) {
                console.error('Failed to load blog preview:', error);
            } finally {
                setLoading(false);
            }
        }
        loadPosts();
    }, []);

    if (!loading && posts.length === 0) return null;

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -ml-48 -mb-48" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4"
                            >
                                <Sparkles size={14} className="fill-primary" />
                                <span>The Legend's Journal</span>
                            </motion.div>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-black text-deep leading-tight"
                            >
                                Heritage & Wisdom <br />
                                <span className="text-primary italic">for Modern Families</span>
                            </motion.h2>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 font-black text-deep hover:text-primary transition-colors group"
                            >
                                View All Articles
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-slate-50 rounded-[2.5rem] h-[450px] animate-pulse" />
                            ))
                        ) : (
                            posts.map((post, index) => (
                                <motion.article
                                    key={post.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2"
                                >
                                    <Link href={`/blog/${post.slug}`} className="relative h-64 overflow-hidden">
                                        <Image
                                            src={post.featured_image_url || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-deep shadow-sm">
                                                {post.category}
                                            </span>
                                        </div>
                                    </Link>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {post.read_time_minutes} min read
                                            </div>
                                        </div>

                                        <Link href={`/blog/${post.slug}`}>
                                            <h3 className="text-xl font-black text-deep mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                        </Link>

                                        <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                                            {post.excerpt}
                                        </p>

                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="mt-auto inline-flex items-center gap-2 text-primary font-bold text-sm group/btn"
                                        >
                                            Read More
                                            <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.article>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
