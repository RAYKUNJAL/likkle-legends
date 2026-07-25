// Blog Service - maps app BlogPost shape ↔ live Supabase blog_posts schema
// Live columns (self-hosted, 2026-07):
//   id, title, slug, body_html, body_md, hero_image_url, meta_title, meta_description,
//   primary_keyword, secondary_keywords, status, is_published, published_at,
//   word_count, angle, faq, metadata, tenant_slug, created_at
import { supabase, supabaseAdmin } from '@/lib/supabase-client';
import { isSupabaseConfigured } from '@/lib/supabase-client';

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image_url: string | null;
    meta_title: string | null;
    meta_description: string | null;
    keywords: string[];
    category: string;
    tags: string[];
    author_name: string;
    author_avatar_url: string | null;
    status: 'draft' | 'scheduled' | 'published' | 'archived';
    published_at: string | null;
    ai_generated: boolean;
    ai_prompt: string | null;
    ai_model: string | null;
    view_count: number;
    read_time_minutes: number;
    created_at: string;
    updated_at: string;
    blog_categories?: {
        name: string;
    };
}

export interface BlogCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    display_order: number;
    post_count: number;
}

type DbRow = Record<string, any>;

function stripHtml(html: string): string {
    return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** DB row → app BlogPost */
function fromDb(row: DbRow | null): BlogPost | null {
    if (!row) return null;
    const body = row.body_html || row.body_md || '';
    const meta = (row.metadata && typeof row.metadata === 'object') ? row.metadata : {};
    const keywords: string[] = [];
    if (row.primary_keyword) keywords.push(String(row.primary_keyword));
    if (Array.isArray(row.secondary_keywords)) keywords.push(...row.secondary_keywords.map(String));
    const statusRaw = String(row.status || (row.is_published ? 'published' : 'draft')).toLowerCase();
    const status = (['draft', 'scheduled', 'published', 'archived'].includes(statusRaw)
        ? statusRaw
        : row.is_published
            ? 'published'
            : 'draft') as BlogPost['status'];
    const wordCount = Number(row.word_count) || Math.max(1, Math.round(stripHtml(body).split(/\s+/).length));
    return {
        id: String(row.id),
        title: row.title || '',
        slug: row.slug || '',
        excerpt: meta.excerpt || stripHtml(body).slice(0, 200),
        content: body,
        featured_image_url: row.hero_image_url || null,
        meta_title: row.meta_title || row.title || null,
        meta_description: row.meta_description || null,
        keywords,
        category: meta.category || row.angle || 'culture',
        tags: Array.isArray(meta.tags) ? meta.tags : keywords,
        author_name: meta.author_name || 'Tanty Spice (AI Agent)',
        author_avatar_url: meta.author_avatar_url || null,
        status,
        published_at: row.published_at || null,
        ai_generated: meta.ai_generated !== false,
        ai_prompt: meta.ai_prompt || null,
        ai_model: meta.ai_model || null,
        view_count: Number(meta.view_count) || 0,
        read_time_minutes: Number(meta.read_time_minutes) || Math.max(1, Math.round(wordCount / 200)),
        created_at: row.created_at || new Date().toISOString(),
        updated_at: meta.updated_at || row.created_at || new Date().toISOString(),
        blog_categories: meta.category ? { name: String(meta.category) } : undefined,
    };
}

/** App BlogPost → live DB insert/update payload */
function toDb(post: Partial<BlogPost>): DbRow {
    const content = post.content || '';
    const plain = stripHtml(content);
    const wordCount = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
    const keywords = post.keywords || [];
    const status = post.status || 'draft';
    const published = status === 'published';
    return {
        title: post.title,
        slug: post.slug,
        body_html: content,
        body_md: plain,
        hero_image_url: post.featured_image_url ?? null,
        meta_title: post.meta_title || post.title || null,
        meta_description: post.meta_description || null,
        primary_keyword: keywords[0] || post.tags?.[0] || null,
        secondary_keywords: keywords.slice(1),
        status,
        is_published: published,
        published_at: published
            ? (post.published_at || new Date().toISOString())
            : post.published_at || null,
        word_count: wordCount,
        angle: post.category || null,
        tenant_slug: 'likkle-legends',
        metadata: {
            excerpt: post.excerpt || plain.slice(0, 200),
            category: post.category || 'culture',
            tags: post.tags || [],
            author_name: post.author_name || 'Tanty Spice (AI Agent)',
            author_avatar_url: post.author_avatar_url || null,
            ai_generated: post.ai_generated ?? true,
            ai_prompt: post.ai_prompt || null,
            ai_model: post.ai_model || 'gemini-2.5-flash',
            read_time_minutes: post.read_time_minutes || Math.max(1, Math.round(wordCount / 200)),
            view_count: post.view_count || 0,
            updated_at: new Date().toISOString(),
        },
    };
}

export async function getPublishedPosts(options?: {
    category?: string;
    limit?: number;
    offset?: number;
    search?: string;
}) {
    if (!isSupabaseConfigured()) {
        console.warn('⚠️ Supabase not configured. Skipping blog fetch.');
        return [];
    }

    let query = supabase
        .from('blog_posts')
        .select('*')
        .or('status.eq.published,is_published.eq.true')
        .order('published_at', { ascending: false });

    if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,meta_description.ilike.%${options.search}%`);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }

    let posts = (data || []).map(fromDb).filter(Boolean) as BlogPost[];
    if (options?.category) {
        const cat = options.category.toLowerCase();
        posts = posts.filter((p) => String(p.category).toLowerCase() === cat);
    }
    return posts;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    if (!isSupabaseConfigured()) {
        return null;
    }

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .or('status.eq.published,is_published.eq.true')
        .maybeSingle();

    if (error) {
        console.error('Error fetching post:', error);
        return null;
    }

    return fromDb(data);
}

export async function getFeaturedPosts(limit = 3) {
    return getPublishedPosts({ limit });
}

export async function getPostsByCategory(category: string, limit = 10) {
    return getPublishedPosts({ category, limit });
}

export async function getCategories(): Promise<BlogCategory[]> {
    // Live DB has no blog_categories table — derive from posts metadata.
    const posts = await getPublishedPosts({ limit: 100 });
    const counts = new Map<string, number>();
    for (const p of posts) {
        const c = p.category || 'culture';
        counts.set(c, (counts.get(c) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([name, post_count], i) => ({
        id: name,
        name,
        description: '',
        icon: '🌴',
        color: '#0d9488',
        display_order: i,
        post_count,
    }));
}

export async function getRelatedPosts(currentSlug: string, category: string, limit = 3) {
    const posts = await getPublishedPosts({ category, limit: limit + 5 });
    return posts.filter((p) => p.slug !== currentSlug).slice(0, limit);
}

export async function createPost(post: Partial<BlogPost>) {
    const { data, error } = await supabase
        .from('blog_posts')
        .insert(toDb(post))
        .select()
        .single();

    if (error) throw error;
    return fromDb(data)!;
}

export async function createPostAdmin(post: Partial<BlogPost>) {
    const payload = toDb(post);
    // Drop undefined keys so PostgREST doesn't reject unknown None
    Object.keys(payload).forEach((k) => {
        if (payload[k] === undefined) delete payload[k];
    });

    const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .insert(payload)
        .select()
        .single();

    if (error) throw error;
    return fromDb(data)!;
}

export async function updatePost(id: string, updates: Partial<BlogPost>) {
    const { data, error } = await supabase
        .from('blog_posts')
        .update(toDb(updates))
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return fromDb(data)!;
}

export async function deletePost(id: string) {
    const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
}

export function calculateReadTime(content: string): number {
    const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
}
