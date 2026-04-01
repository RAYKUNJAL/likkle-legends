import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Share2, Twitter, Facebook, ChevronRight } from 'lucide-react';
import { getPostBySlug, getRelatedPosts, getCategories } from '@/lib/services/blog';

interface Props {
    params: { slug: string };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = await getPostBySlug(params.slug);

    if (!post) {
        return { title: 'Post Not Found' };
    }

    const canonicalUrl = `/blog/${params.slug}`;

    return {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt,
        keywords: post.keywords?.join(', '),
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: post.featured_image_url ? [post.featured_image_url] : [],
            type: 'article',
            publishedTime: post.published_at || undefined,
            authors: [post.author_name],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: post.featured_image_url ? [post.featured_image_url] : [],
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const [post, categories] = await Promise.all([
        getPostBySlug(params.slug),
        getCategories()
    ]);

    if (!post) {
        notFound();
    }

    const relatedPosts = await getRelatedPosts(params.slug, post.category, 3);
    const category = categories.find(c => c.id === post.category);

    // Schema.org Article structured data
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt,
        image: post.featured_image_url,
        datePublished: post.published_at,
        dateModified: post.updated_at,
        author: {
            '@type': 'Person',
            name: post.author_name
        },
        publisher: {
            '@type': 'Organization',
            name: 'Likkle Legends',
            logo: {
                '@type': 'ImageObject',
                url: 'https://likklelegends.com/images/logo.png'
            }
        }
    };

    return (
        <>
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />

            <article className="min-h-screen bg-[#FFFDF7]">
                {/* Hero */}
                <header className="relative pt-32 pb-20 bg-gradient-to-br from-deep via-deep/95 to-deep/90 overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        {post.featured_image_url && (
                            <Image
                                src={post.featured_image_url}
                                alt=""
                                fill
                                className="object-cover blur-3xl"
                            />
                        )}
                    </div>

                    <div className="container relative z-10">
                        <div className="max-w-4xl mx-auto">
                            {/* Breadcrumb */}
                            <nav className="flex items-center gap-2 text-white/50 text-sm mb-8">
                                <Link href="/blog" className="hover:text-white transition-colors flex items-center gap-1">
                                    <ArrowLeft size={16} /> Blog
                                </Link>
                                <ChevronRight size={14} />
                                <span style={{ color: category?.color }}>{category?.name}</span>
                            </nav>

                            {/* Category Tag */}
                            <span
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
                                style={{ backgroundColor: `${category?.color}20`, color: category?.color }}
                            >
                                {category?.icon} {category?.name}
                            </span>

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                                {post.title}
                            </h1>

                            {/* Excerpt */}
                            <p className="text-xl text-white/70 mb-8 leading-relaxed">
                                {post.excerpt}
                            </p>

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-6 text-white/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                                        {post.author_name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{post.author_name}</p>
                                        <p className="text-sm">Author</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-2">
                                    <Calendar size={18} />
                                    {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock size={18} />
                                    {post.read_time_minutes} min read
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Featured Image */}
                {post.featured_image_url && (
                    <div className="container -mt-10 relative z-20">
                        <div className="max-w-4xl mx-auto">
                            <div className="relative h-64 md:h-96 lg:h-[500px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                                <Image
                                    src={post.featured_image_url}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="container py-16">
                    <div className="max-w-3xl mx-auto">
                        {/* Share Buttons */}
                        <div className="flex items-center gap-4 mb-10 pb-10 border-b border-zinc-200">
                            <span className="text-deep/40 font-bold text-sm uppercase tracking-widest">Share:</span>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://likklelegends.com/blog/${post.slug}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Share on Twitter"
                                className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:scale-110 transition-transform"
                            >
                                <Twitter size={18} />
                            </a>
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://likklelegends.com/blog/${post.slug}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Share on Facebook"
                                className="w-10 h-10 rounded-full bg-[#4267B2] text-white flex items-center justify-center hover:scale-110 transition-transform"
                            >
                                <Facebook size={18} />
                            </a>
                        </div>

                        {/* Article Content */}
                        <div
                            className="prose prose-lg prose-zinc max-w-none
                                prose-headings:font-black prose-headings:text-deep
                                prose-p:text-deep/70 prose-p:leading-relaxed
                                prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                                prose-img:rounded-2xl prose-img:shadow-lg
                                prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-2xl prose-blockquote:py-4
                                prose-li:text-deep/70
                                prose-strong:text-deep"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-zinc-200">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-deep/40 font-bold text-sm uppercase tracking-widest mr-2">Tags:</span>
                                    {post.tags.map(tag => (
                                        <span key={tag} className="px-4 py-2 bg-zinc-100 rounded-full text-sm font-medium text-deep/60">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <section className="py-16 bg-zinc-50">
                        <div className="container">
                            <h2 className="text-3xl font-black text-deep mb-10 text-center">
                                Related Articles
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                {relatedPosts.map(relatedPost => (
                                    <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group">
                                        <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                                            <div className="relative h-40">
                                                {relatedPost.featured_image_url ? (
                                                    <Image
                                                        src={relatedPost.featured_image_url}
                                                        alt={relatedPost.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                                        <span className="text-4xl opacity-50">{category?.icon}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-bold text-deep group-hover:text-primary transition-colors line-clamp-2">
                                                    {relatedPost.title}
                                                </h3>
                                                <p className="text-sm text-deep/50 mt-2 flex items-center gap-1">
                                                    <Clock size={14} /> {relatedPost.read_time_minutes} min read
                                                </p>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="py-16 bg-gradient-to-r from-primary to-secondary">
                    <div className="container text-center">
                        <h2 className="text-3xl font-black text-white mb-4">
                            Enjoyed This Article?
                        </h2>
                        <p className="text-white/80 mb-8 max-w-xl mx-auto">
                            Get more Caribbean culture and education delivered directly to your child with our monthly mail club!
                        </p>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl"
                        >
                            Join Likkle Legends <ChevronRight size={20} />
                        </Link>
                    </div>
                </section>
            </article>
        </>
    );
}
