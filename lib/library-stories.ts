/**
 * Kids library helpers for the live stories_library API.
 * Does not invent titles or body text — only attaches known cover art
 * and filters out books that cannot actually be read.
 */

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

export function attachLocalCover<T extends { slug?: string; cover_image_url?: string | null }>(story: T): T & { cover_image_url: string } {
    const existing = String(story?.cover_image_url || '').trim();
    if (existing) {
        return { ...story, cover_image_url: existing };
    }
    const slug = String(story?.slug || '').trim();
    const mapped = slug ? STORY_COVER_BY_SLUG[slug] : '';
    return { ...story, cover_image_url: mapped || '' };
}

export function hasCoverArt(story: { cover_image_url?: string | null; slug?: string }): boolean {
    return Boolean(attachLocalCover(story).cover_image_url);
}

export function hasReadableBody(story: any): boolean {
    return extractStoryPages(story).length > 0;
}

export function isKidsLibraryReady(story: any): boolean {
    return hasCoverArt(story) && hasReadableBody(story);
}

export function toKidsLibraryStory(story: any): KidsLibraryStory | null {
    if (!story?.id || !story?.title) return null;
    const withCover = attachLocalCover(story);
    const pages = extractStoryPages(withCover);
    if (!withCover.cover_image_url || pages.length === 0) return null;

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
                imageUrl: page.imageUrl || kids.cover_image_url,
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
    const attached = stories.map(attachLocalCover);
    return {
        total: attached.length,
        withCover: attached.filter((s) => Boolean(s.cover_image_url)).length,
        missingCover: attached.filter((s) => !s.cover_image_url).length,
        readable: attached.filter(hasReadableBody).length,
        kidsReady: attached.filter(isKidsLibraryReady).length,
    };
}
