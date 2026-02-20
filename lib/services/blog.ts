// Blog Service - Database operations for blog posts
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

// Get all published posts with optional filtering
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
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    if (options?.category) {
        query = query.eq('category', options.category);
    }

    if (options?.search) {
        query = query.or(`title.ilike.%${options.search}%,excerpt.ilike.%${options.search}%`);
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

    return data as BlogPost[];
}

// Get a single post by slug
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    if (!isSupabaseConfigured()) {
        return null; // Build-safe
    }

    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

    if (error) {
        console.error('Error fetching post:', error);
        return null;
    }

    // Increment view count (fire and forget)
    (async () => { try { await supabase.rpc('increment_post_views', { post_slug: slug }); } catch { } })();

    return data as BlogPost;
}

// Get featured/latest posts for homepage
export async function getFeaturedPosts(limit = 3) {
    return getPublishedPosts({ limit });
}

// Get posts by category
export async function getPostsByCategory(category: string, limit = 10) {
    return getPublishedPosts({ category, limit });
}

// Get all categories with post counts
export async function getCategories(): Promise<BlogCategory[]> {
    if (!isSupabaseConfigured()) {
        return [];
    }

    const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('display_order');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data as BlogCategory[];
}

// Get related posts (same category, excluding current)
export async function getRelatedPosts(currentSlug: string, category: string, limit = 3) {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .eq('category', category)
        .neq('slug', currentSlug)
        .order('published_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching related posts:', error);
        return [];
    }

    return data as BlogPost[];
}

// Admin: Create a new post
export async function createPost(post: Partial<BlogPost>) {
    const { data, error } = await supabase
        .from('blog_posts')
        .insert(post)
        .select()
        .single();

    if (error) throw error;
    return data as BlogPost;
}

// System Admin: Create post without checking policies (uses service role)
export async function createPostAdmin(post: Partial<BlogPost>) {
    const { data, error } = await supabaseAdmin
        .from('blog_posts')
        .insert(post)
        .select()
        .single();

    if (error) throw error;
    return data as BlogPost;
}

// Admin: Update a post
export async function updatePost(id: string, updates: Partial<BlogPost>) {
    const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as BlogPost;
}

// Admin: Delete a post
export async function deletePost(id: string) {
    const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

// Admin: Get all posts (including drafts)
export async function getAllPosts() {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as BlogPost[];
}

// Admin: Publish a post
export async function publishPost(id: string) {
    return updatePost(id, {
        status: 'published',
        published_at: new Date().toISOString()
    });
}

// Generate slug from title
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 80);
}

// Calculate read time from content
export function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
