/**
 * Kids library helpers for the live stories_library API.
 * Does not invent titles or body text — attaches known cover + page art
 * and only lists books that are fully illustrated end-to-end.
 */

import liveLibraryStories from '@/lib/data/live-library-stories.json';

export const STORY_COVER_BY_SLUG: Record<string, string> = {
    'the-river-mummas-gift': '/images/story-covers/the-river-mummas-gift.png',
    'dilly-doubles-and-the-carnival-king': '/images/story-covers/dilly-doubles-and-the-carnival-king.png',
    'the-chickcharneys-lesson': '/images/story-covers/the-chickcharneys-lesson.png',
    'the-mermaid-of-carlisle-bay': '/images/story-covers/the-mermaid-of-carlisle-bay.png',
    'steelpan-sam-and-the-rhythm-of-the-rain': '/images/story-covers/steelpan-sam-and-the-rhythm-of-the-rain.png',
    'anansi-and-the-mango-tree': '/images/story-covers/anansi-and-the-mango-tree.png',
    'the-legend-of-the-silk-cotton-tree': '/images/story-covers/the-legend-of-the-silk-cotton-tree.png',
    'papa-bois-and-the-lost-fawn': '/images/story-covers/papa-bois-and-the-lost-fawn.png',
    'the-rolling-calf-of-green-bay': '/images/story-covers/the-rolling-calf-of-green-bay.png',
    'mango-moko-and-the-garden-race': '/images/story-covers/mango-moko-and-the-garden-race.png',
    'roti-and-the-lost-words': '/images/story-covers/roti-and-the-lost-words.png',
    'tanty-spice-and-the-pepper-sauce-secret': '/images/story-covers/tanty-spice-and-the-pepper-sauce-secret.png',
};

export const ISLAND_CODE_TO_NAME: Record<string, string> = {
    JM: 'Jamaica',
    TT: 'Trinidad and Tobago',
    BB: 'Barbados',
    BS: 'Bahamas',
    LC: 'St Lucia',
    GY: 'Guyana',
    GD: 'Grenada',
    AG: 'Antigua',
    HT: 'Haiti',
    DO: 'Dominican Republic',
    KN: 'St. Kitts & Nevis',
    VC: 'St. Vincent & Grenadines',
    DM: 'Dominica',
    PR: 'Puerto Rico',
    CU: 'Cuba',
    SR: 'Suriname',
};

const TRADITION_TO_CATEGORY: Record<string, string> = {
    anansi: 'Adventure',
    papa_bois: 'Science and Nature',
    river_mumma: 'Animals',
    chickcharney: 'Island History',
    island_adventure: 'Adventure',
};

const SLUG_TO_CATEGORY: Record<string, string> = {
    'dilly-doubles-and-the-carnival-king': 'Music and Carnival',
    'steelpan-sam-and-the-rhythm-of-the-rain': 'Music and Carnival',
    'tanty-spice-and-the-pepper-sauce-secret': 'Food Stories',
    'mango-moko-and-the-garden-race': 'Friendship',
    'roti-and-the-lost-words': 'Learning',
    'the-mermaid-of-carlisle-bay': 'Science and Nature',
    'the-legend-of-the-silk-cotton-tree': 'Island History',
    'the-rolling-calf-of-green-bay': 'Adventure',
};

export interface LibraryStoryPage {
    pageNumber: number;
    text: string;
    illustration?: string;
    imageUrl?: string;
    audioUrl?: string;
}

export interface KidsLibraryStory {
    id: string;
    slug: string;
    title: string;
    summary: string;
    cover_image_url: string;
    island_code: string;
    island_theme: string;
    tradition: string;
    category: string;
    age_track: string;
    age_group: string;
    tier_required: string;
    reading_time_minutes: number;
    is_active: boolean;
    pages: LibraryStoryPage[];
    content: any;
}

function parseContent(story: any): Record<string, any> {
    const raw = story?.content ?? story?.content_json ?? {};
    if (typeof raw === 'string') {
        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    }
    return raw && typeof raw === 'object' ? raw : {};
}

export function extractStoryPages(story: any): LibraryStoryPage[] {
    const content = parseContent(story);
    const rawPages = Array.isArray(content.pages)
        ? content.pages
        : Array.isArray(content?.structure?.pages)
            ? content.structure.pages
            : [];
    const audioUrls = Array.isArray(content.audio_urls) ? content.audio_urls : [];

    return rawPages
        .map((page: any, index: number) => {
            const text = String(
                page?.text ||
                page?.narrative_text ||
                page?.story_text ||
                page?.content ||
                ''
            ).trim();
            if (!text) return null;
            const imageUrl = page?.imageUrl || page?.image_url || page?.illustration_url || undefined;
            const audioUrl = page?.audioUrl || page?.audio_url || audioUrls[index] || undefined;
            return {
                pageNumber: Number(page?.pageNumber || page?.page_number || index + 1),
                text,
                illustration: typeof page?.illustration === 'string' ? page.illustration : undefined,
                imageUrl: typeof imageUrl === 'string' && imageUrl.trim() ? imageUrl : undefined,
                audioUrl: typeof audioUrl === 'string' && audioUrl.trim() ? audioUrl : undefined,
            } as LibraryStoryPage;
        })
        .filter(Boolean) as LibraryStoryPage[];
}

export function pageImagePath(slug: string, pageNumber: number): string {
    return `/images/story-pages/${slug}/page-${String(pageNumber).padStart(2, '0')}.png`;
}

export function attachLocalCover<T extends { slug?: string; cover_image_url?: string | null }>(story: T): T & { cover_image_url: string } {
    const slug = String(story?.slug || '').trim();
    const mapped = slug ? STORY_COVER_BY_SLUG[slug] : '';
    const existing = String(story?.cover_image_url || '').trim();
    // Known catalog slugs always use the QC'd local cover so stale remote URLs cannot blank the shelf.
    return { ...story, cover_image_url: mapped || existing || '' };
}

export function attachPageIllustrations(story: any): any {
    const withCover = attachLocalCover(story);
    const slug = String(withCover.slug || '').trim();
    const content = parseContent(withCover);
    const rawPages = Array.isArray(content.pages) ? content.pages : [];
    const pages = rawPages.map((page: any, index: number) => {
        const pageNumber = Number(page?.pageNumber || page?.page_number || index + 1);
        const existing = String(
            page?.image_url || page?.imageUrl || page?.illustration_url || page?.illustrationUrl || ''
        ).trim();
        // Only invent local page paths for the 12 known catalog slugs. Cover-only extras
        // must not pass the fully-illustrated gate just because we guessed a filename.
        const mapped = slug && STORY_COVER_BY_SLUG[slug] ? pageImagePath(slug, pageNumber) : '';
        return {
            ...page,
            page_number: pageNumber,
            image_url: mapped || existing,
            imageUrl: mapped || existing,
        };
    });
    return {
        ...withCover,
        content: {
            ...content,
            pages,
        },
    };
}

export function localCatalogStories(): any[] {
    return (liveLibraryStories as any[]).map((story) => attachPageIllustrations({
        ...story,
        is_active: true,
        cover_image_url: STORY_COVER_BY_SLUG[story.slug] || null,
        content: {
            pages: story.pages,
            audio_urls: story.audio_urls || [],
            narrated_by: story.narrated_by,
        },
    }));
}

export function hasCoverArt(story: { cover_image_url?: string | null; slug?: string }): boolean {
    return Boolean(attachLocalCover(story).cover_image_url);
}

export function hasReadableBody(story: any): boolean {
    return extractStoryPages(story).length > 0;
}

export function isFullyIllustrated(story: any): boolean {
    const prepared = attachPageIllustrations(story);
    if (!prepared.cover_image_url) return false;
    const pages = extractStoryPages(prepared);
    if (pages.length === 0) return false;
    return pages.every((page) => Boolean(page.imageUrl));
}

export function isKidsLibraryReady(story: any): boolean {
    return isFullyIllustrated(story);
}

export function toKidsLibraryStory(story: any): KidsLibraryStory | null {
    if (!story?.id || !story?.title) return null;
    const withCover = attachPageIllustrations(story);
    const pages = extractStoryPages(withCover);
    if (!withCover.cover_image_url || pages.length === 0) return null;
    if (pages.some((page) => !page.imageUrl)) return null;

    const islandCode = String(withCover.island_code || '');
    const ageTrack = String(withCover.age_track || 'big');

    return {
        id: String(withCover.id),
        slug: String(withCover.slug || withCover.id),
        title: String(withCover.title),
        summary: String(withCover.summary || ''),
        cover_image_url: withCover.cover_image_url,
        island_code: islandCode,
        island_theme: ISLAND_CODE_TO_NAME[islandCode] || islandCode || 'Caribbean',
        tradition: String(withCover.tradition || 'island_adventure'),
        category: SLUG_TO_CATEGORY[withCover.slug] || TRADITION_TO_CATEGORY[withCover.tradition] || 'Adventure',
        age_track: ageTrack,
        age_group: ageTrack === 'mini' ? '5-6' : '7-9',
        tier_required: String(withCover.tier_required || 'free'),
        reading_time_minutes: Number(withCover.estimated_reading_time_minutes || withCover.reading_time_minutes || 5),
        is_active: true,
        pages,
        content: parseContent(withCover),
    };
}

export function toReaderStory(story: any) {
    const kids = toKidsLibraryStory(story);
    if (!kids) return null;
    return {
        id: kids.id,
        title: kids.title,
        summary: kids.summary,
        cover_image_url: kids.cover_image_url,
        tier_required: kids.tier_required,
        reading_time_minutes: kids.reading_time_minutes,
        content_json: {
            pages: kids.pages.map((page) => ({
                pageNumber: page.pageNumber,
                text: page.text,
                imageUrl: page.imageUrl,
                audioUrl: page.audioUrl,
            })),
            glossary: Array.isArray(kids.content?.glossary) ? kids.content.glossary : [],
        },
    };
}

export async function fetchKidsLibraryStories(): Promise<KidsLibraryStory[]> {
    const response = await fetch('/api/library/stories', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Library stories request failed (${response.status})`);
    }
    const data = await response.json();
    const rows = Array.isArray(data?.stories) ? data.stories : [];
    return rows.map(toKidsLibraryStory).filter(Boolean) as KidsLibraryStory[];
}

export async function fetchKidsLibraryStory(idOrSlug: string): Promise<KidsLibraryStory | null> {
    if (!idOrSlug) return null;

    const byId = await fetch(`/api/library/stories?id=${encodeURIComponent(idOrSlug)}`, { cache: 'no-store' });
    if (byId.ok) {
        const data = await byId.json();
        const kids = toKidsLibraryStory(data?.story);
        if (kids) return kids;
    }

    const bySlug = await fetch(`/api/library/stories?slug=${encodeURIComponent(idOrSlug)}`, { cache: 'no-store' });
    if (bySlug.ok) {
        const data = await bySlug.json();
        return toKidsLibraryStory(data?.story);
    }

    return null;
}

export function coverCounts(stories: any[]) {
    const attached = stories.map(attachPageIllustrations);
    return {
        total: attached.length,
        withCover: attached.filter((s) => Boolean(s.cover_image_url)).length,
        missingCover: attached.filter((s) => !s.cover_image_url).length,
        readable: attached.filter(hasReadableBody).length,
        fullyIllustrated: attached.filter(isFullyIllustrated).length,
        kidsReady: attached.filter(isKidsLibraryReady).length,
    };
}

export function parentOfficialStories(): KidsLibraryStory[] {
    return localCatalogStories().map(toKidsLibraryStory).filter(Boolean) as KidsLibraryStory[];
}

export interface ParentLibraryItem {
    id: string;
    slug?: string;
    title: string;
    summary?: string;
    cover_image_url?: string;
    user_id?: string | null;
    is_official: boolean;
    href: string;
}

export function mergeParentLibraryStories(
    official: Array<KidsLibraryStory | null | undefined> = [],
    personal: any[] = [],
): ParentLibraryItem[] {
    const officialItems: ParentLibraryItem[] = official
        .filter((story): story is KidsLibraryStory => Boolean(story?.id && story?.title && story?.cover_image_url))
        .map((story) => ({
            id: story.id,
            slug: story.slug,
            title: story.title,
            summary: story.summary,
            cover_image_url: story.cover_image_url,
            user_id: null,
            is_official: true,
            href: `/library/stories/${story.slug || story.id}`,
        }));

    const seen = new Set(officialItems.map((story) => story.title.toLowerCase()));
    const personalItems: ParentLibraryItem[] = (personal || [])
        .filter((row) => row?.id && row?.title)
        .filter((row) => !seen.has(String(row.title).toLowerCase()))
        .map((row) => ({
            id: String(row.id),
            slug: row.slug ? String(row.slug) : undefined,
            title: String(row.title),
            summary: row.summary || row.short_hook || '',
            cover_image_url: row.cover_image_url || row.image || '',
            user_id: row.user_id || 'personal',
            is_official: false,
            href: row.slug ? `/library/stories/${row.slug}` : `/portal/stories/${row.id}`,
        }));

    return [...officialItems, ...personalItems];
}
