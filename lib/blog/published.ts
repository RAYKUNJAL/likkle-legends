import React from 'react';
import type { BlogCategory, BlogPost } from '@/lib/services/blog';
import { getPublishedPosts } from '@/lib/services/blog';
import { loadStaticBlogPosts } from '@/lib/blog/static-posts';

type BlogListOptions = {
    category?: string;
    limit?: number;
    search?: string;
};

const CATEGORY_PRESETS: Record<string, { icon: string; color: string }> = {
    songs: { icon: '🎵', color: '#7c3aed' },
    parenting: { icon: '💛', color: '#0d9488' },
    culture: { icon: '🌴', color: '#ea580c' },
    learning: { icon: '📚', color: '#0369a1' },
    'screen time': { icon: '📺', color: '#b45309' },
};

function plainText(html: string): string {
    return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function applyOptions(posts: BlogPost[], options?: BlogListOptions): BlogPost[] {
    let next = posts.slice();
    if (options?.category) {
        const category = options.category.toLowerCase();
        next = next.filter((post) => post.category.toLowerCase() === category);
    }
    if (options?.search) {
        const query = options.search.toLowerCase();
        next = next.filter((post) =>
            post.title.toLowerCase().includes(query) ||
            (post.excerpt || '').toLowerCase().includes(query)
        );
    }
    next.sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at));
    if (options?.limit && options.limit > 0) next = next.slice(0, options.limit);
    return next;
}

/**
 * Static articles are the baseline so /blog is never an empty spinner.
 * A published database row with real body text replaces the static copy
 * for the same slug. Database failures keep the static set.
 */
function mergePublishedPosts(staticPosts: BlogPost[], dbPosts: BlogPost[]): BlogPost[] {
    const bySlug = new Map<string, BlogPost>();
    for (const post of staticPosts) {
        if (post.slug) bySlug.set(post.slug, post);
    }
    for (const post of dbPosts) {
        if (!post.slug || post.status !== 'published') continue;
        const existing = bySlug.get(post.slug);
        if (!existing) {
            bySlug.set(post.slug, post);
            continue;
        }
        if (plainText(post.content).length > 80) {
            bySlug.set(post.slug, {
                ...post,
                faq: post.faq?.length ? post.faq : existing.faq,
                excerpt: post.excerpt || existing.excerpt,
                meta_title: post.meta_title || existing.meta_title,
                meta_description: post.meta_description || existing.meta_description,
                keywords: post.keywords?.length ? post.keywords : existing.keywords,
            });
        }
    }
    return Array.from(bySlug.values());
}

async function listPublishedPosts(options?: BlogListOptions): Promise<BlogPost[]> {
    const staticPosts = loadStaticBlogPosts();
    let dbPosts: BlogPost[] = [];
    try {
        dbPosts = await getPublishedPosts({ limit: 200 });
    } catch (error) {
        console.error('Blog database fetch failed. Using static posts.', error);
    }
    return applyOptions(mergePublishedPosts(staticPosts, dbPosts), options);
}

function withRequestCache<T extends (options?: BlogListOptions) => Promise<BlogPost[]>>(fn: T): T {
    const maybeCache = (React as { cache?: <F extends T>(input: F) => F }).cache;
    return typeof maybeCache === 'function' ? maybeCache(fn) : fn;
}

export const getPublishedPostsForRender = withRequestCache(listPublishedPosts);

export function categoriesFromPosts(posts: BlogPost[]): BlogCategory[] {
    const counts = new Map<string, number>();
    for (const post of posts) {
        const name = post.category || 'Culture';
        counts.set(name, (counts.get(name) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, post_count], index) => {
        const preset = CATEGORY_PRESETS[name.toLowerCase()] || { icon: '🌴', color: '#0d9488' };
        return {
            id: name,
            name,
            description: '',
            icon: preset.icon,
            color: preset.color,
            display_order: index,
            post_count,
        };
    });
}

export async function getBlogCatalog() {
    const posts = await getPublishedPostsForRender();
    return { posts, categories: categoriesFromPosts(posts) };
}

export async function getBlogPostPage(slug: string) {
    const posts = await getPublishedPostsForRender();
    const post = posts.find((item) => item.slug === slug) ?? null;
    const categories = categoriesFromPosts(posts);
    if (!post) return { post, categories, related: [] as BlogPost[] };
    const sameCategory = posts.filter((item) => item.slug !== slug && item.category === post.category);
    const others = posts.filter((item) => item.slug !== slug && item.category !== post.category);
    return {
        post,
        categories,
        related: [...sameCategory, ...others].slice(0, 3),
    };
}
