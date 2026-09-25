import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, ChevronRight } from 'lucide-react';
import { TwitterIcon, FacebookIcon } from '@/components/landing-v2/SocialBrandIcons';
import { getBlogPostPage } from '@/lib/blog/published';
import { blogPostUrl } from '@/lib/blog/site-url';
import { formatBlogDate } from '@/lib/blog/format';
import { serializeJsonLd } from '@/lib/blog/json-ld';

interface Props {
    params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { post } = await getBlogPostPage(params.slug);

    if (!post) {
        notFound();
    }

    const canonical = blogPostUrl(post.slug);
    const title = post.meta_title || post.title;
    const description = post.meta_description || post.excerpt;

    return {
        title,
        description,
        keywords: post.keywords?.length ? post.keywords : undefined,
        alternates: { canonical },
        openGraph: {
            title,
            description,
            url: canonical,
            images: post.featured_image_url ? [post.featured_image_url] : undefined,
            type: 'article',
            publishedTime: post.published_at || undefined,
            modifiedTime: post.updated_at || undefined,
            authors: post.author_name ? [post.author_name] : undefined,
            tags: post.tags?.length ? post.tags : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: post.featured_image_url ? [post.featured_image_url] : undefined,
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { post, categories, related: relatedPosts } = await getBlogPostPage(params.slug);

    if (!post) {
        notFound();
    }

    const category = categories.find((item) => item.id === post.category);
    const canonical = blogPostUrl(post.slug);
    const description = post.meta_description || post.excerpt;

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description,
        datePublished: post.published_at,
        dateModified: post.updated_at || post.published_at,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonical,
        },
        url: canonical,
        inLanguage: 'en',
        articleSection: post.category,
        ...(post.featured_image_url ? { image: post.featured_image_url } : {}),
        author: {
            '@type': 'Organization',
            name: post.author_name || 'Likkle Legends',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Likkle Legends',
            logo: {
                '@type': 'ImageObject',
                url: 'https://www.likklelegends.com/images/logo.png',
            },
        },
        keywords: post.keywords?.join(', ') || undefined,
    };

    const faqSchema = post.faq?.length
        ? {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: post.faq.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer,
                },
            })),
        }
        : null;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleSchema) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
                />
            )}

            <article className="min-h-screen bg-[#FFFDF7]">
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
                            <nav className="flex items-center gap-2 text-white/50 text-sm mb-8">
                                <Link href="/blog" className="hover:text-white transition-colors flex items-center gap-1">
                                    <ArrowLeft size={16} /> Blog
                                </Link>
                                <ChevronRight size={14} />
                                <span style={{ color: category?.color }}>{category?.name || post.category}</span>
                            </nav>

                            <span
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6"
                                style={{ backgroundColor: `${category?.color || '#0d9488'}20`, color: category?.color || '#0d9488' }}
                            >
                                {category?.icon} {category?.name || post.category}
                            </span>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                                {post.title}
                            </h1>

                            <p className="text-xl text-white/70 mb-8 leading-relaxed">
                                {post.excerpt}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 text-white/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                                        {(post.author_name || 'L').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold">{post.author_name}</p>
                                        <p className="text-sm">Author</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-2">
                                    <Calendar size={18} />
                                    {formatBlogDate(post.published_at || post.created_at)}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock size={18} />
                                    {post.read_time_minutes} min read
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

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

                <div className="container py-16">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-4 mb-10 pb-10 border-b border-zinc-200">
                            <span className="text-deep/40 font-bold text-sm uppercase tracking-widest">Share:</span>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(canonical)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Share on Twitter"
                                className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:scale-110 transition-transform"
                            >
                                <TwitterIcon size={18} />
                            </a>
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Share on Facebook"
                                className="w-10 h-10 rounded-full bg-[#4267B2] text-white flex items-center justify-center hover:scale-110 transition-transform"
                            >
                                <FacebookIcon size={18} />
                            </a>
                        </div>

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

                        {post.faq?.length > 0 && (
                            <section className="mt-12 pt-8 border-t border-zinc-200" aria-labelledby="article-faq">
                                <h2 id="article-faq" className="text-2xl font-black text-deep mb-6">Questions parents ask</h2>
                                <div className="grid gap-4">
                                    {post.faq.map((item) => (
                                        <div key={item.question} className="rounded-2xl bg-white border border-zinc-100 p-6">
                                            <h3 className="font-bold text-deep mb-2">{item.question}</h3>
                                            <p className="text-deep/70 leading-relaxed">{item.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {post.tags && post.tags.length > 0 && (
                            <div className="mt-12 pt-8 border-t border-zinc-200">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-deep/40 font-bold text-sm uppercase tracking-widest mr-2">Tags:</span>
                                    {post.tags.map((tag) => (
                                        <span key={tag} className="px-4 py-2 bg-zinc-100 rounded-full text-sm font-medium text-deep/60">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {relatedPosts.length > 0 && (
                    <section className="py-16 bg-zinc-50">
                        <div className="container">
                            <h2 className="text-3xl font-black text-deep mb-10 text-center">
                                Related Articles
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                {relatedPosts.map((relatedPost) => (
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
                                                        <span className="text-4xl opacity-50">{category?.icon || '📝'}</span>
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

                <section className="py-16 bg-gradient-to-r from-primary to-secondary">
                    <div className="container text-center">
                        <h2 className="text-3xl font-black text-white mb-4">
                            Keep the island close
                        </h2>
                        <p className="text-white/80 mb-8 max-w-xl mx-auto">
                            Parents can start Free Forever for stories, songs, and the kid-safe portal. Children do not buy anything in the app.
                        </p>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl"
                        >
                            Parent sign up <ChevronRight size={20} />
                        </Link>
                    </div>
                </section>
            </article>
        </>
    );
}
