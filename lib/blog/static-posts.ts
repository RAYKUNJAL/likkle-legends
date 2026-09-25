import fs from 'fs';
import path from 'path';
import type { BlogPost } from '@/lib/services/blog';
import { normalizeFaq } from '@/lib/blog/faq';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function asString(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value : fallback;
}

function asStringList(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.map((item) => String(item).trim()).filter(Boolean);
}

function staticToPost(raw: unknown): BlogPost | null {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const row = raw as Record<string, unknown>;
    const title = asString(row.title).trim();
    const slug = asString(row.slug).trim();
    const content = asString(row.content).trim();
    if (!title || !slug || !content) return null;

    const statusRaw = asString(row.status, 'published').toLowerCase();
    const status = (['draft', 'scheduled', 'published', 'archived'].includes(statusRaw)
        ? statusRaw
        : 'published') as BlogPost['status'];
    if (status !== 'published') return null;

    const publishedAt = asString(row.published_at) || new Date().toISOString();
    const keywords = asStringList(row.keywords);
    const excerpt = asString(row.excerpt).trim() || content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
    const readTime = Number(row.read_time_minutes);

    return {
        id: asString(row.id).trim() || `static-${slug}`,
        title,
        slug,
        excerpt,
        content,
        featured_image_url: asString(row.featured_image_url).trim() || null,
        meta_title: asString(row.meta_title).trim() || title,
        meta_description: asString(row.meta_description).trim() || excerpt,
        keywords,
        category: asString(row.category, 'Culture').trim() || 'Culture',
        tags: asStringList(row.tags).length ? asStringList(row.tags) : keywords,
        author_name: asString(row.author_name, 'Likkle Legends Team').trim() || 'Likkle Legends Team',
        author_avatar_url: null,
        status,
        published_at: publishedAt,
        ai_generated: false,
        ai_prompt: null,
        ai_model: null,
        view_count: 0,
        read_time_minutes: Number.isFinite(readTime) && readTime > 0 ? Math.round(readTime) : 5,
        created_at: asString(row.created_at) || publishedAt,
        updated_at: asString(row.updated_at) || publishedAt,
        faq: normalizeFaq(row.faq),
    };
}

function readJsonFile(filePath: string): unknown {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/** Committed articles. Used when Supabase is empty, blocked, or down. */
export function loadStaticBlogPosts(): BlogPost[] {
    try {
        if (!fs.existsSync(BLOG_DIR)) return [];
        const files = fs.readdirSync(BLOG_DIR).filter((name) => name.endsWith('.json')).sort();
        const posts: BlogPost[] = [];
        for (const file of files) {
            try {
                const parsed = readJsonFile(path.join(BLOG_DIR, file));
                const rows = Array.isArray(parsed) ? parsed : [parsed];
                for (const row of rows) {
                    const post = staticToPost(row);
                    if (post) posts.push(post);
                }
            } catch (error) {
                console.error(`Skipping invalid blog file ${file}:`, error);
            }
        }
        const bySlug = new Map<string, BlogPost>();
        for (const post of posts) bySlug.set(post.slug, post);
        return Array.from(bySlug.values());
    } catch (error) {
        console.error('Static blog load failed:', error);
        return [];
    }
}
