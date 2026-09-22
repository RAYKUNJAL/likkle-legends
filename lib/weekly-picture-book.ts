import fs from 'fs';
import path from 'path';

export interface WeeklyPage {
    text: string;
    illustration: string;
}

export interface WeeklyManuscript {
    title: string;
    summary: string;
    island_code: string;
    age_track: 'mini' | 'big';
    character: string;
    tradition: 'island_adventure';
    originality: 'original_fiction';
    pages: WeeklyPage[];
    cover_file?: string;
    page_files?: string[];
}

const ALLOWED_CHARACTERS = new Set([
    'tanty_spice',
    'dilly_doubles',
    'roti',
    'steelpan_sam',
    'mango_moko',
    'scorcha_pepper',
]);

const FOLKLORE_CLAIM = /traditional folktale|ancient myth|true story of|historically accurate|real legend of|as our ancestors told/i;
const UNSAFE = /\b(kill|killed|blood|gun|weapon|knife|monster attack|nightmare|demon|sexy|romantic)\b/i;

export function slugifyTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

export function validateManuscript(input: WeeklyManuscript): string[] {
    const errors: string[] = [];
    const title = String(input?.title || '').trim();
    const summary = String(input?.summary || '').trim();
    if (title.length < 8 || title.length > 80) errors.push('Title must be 8–80 characters.');
    if (/^the (true )?legend of\b/i.test(title)) errors.push('Do not title a new book as a legend or folklore claim.');
    if (summary.length < 20) errors.push('Summary must describe the original story.');
    if (input?.originality !== 'original_fiction') errors.push('originality must be original_fiction.');
    if (input?.tradition !== 'island_adventure') errors.push('New weekly books use tradition island_adventure.');
    if (!ALLOWED_CHARACTERS.has(input?.character)) errors.push('Character must be an existing Likkle Legend.');
    if (!/^[A-Z]{2}$/.test(String(input?.island_code || ''))) errors.push('island_code must be a 2-letter code.');
    if (input?.age_track !== 'mini' && input?.age_track !== 'big') errors.push('age_track must be mini or big.');
    if (FOLKLORE_CLAIM.test(`${title} ${summary}`)) errors.push('Do not claim this original story is traditional folklore.');
    if (UNSAFE.test(`${title} ${summary}`)) errors.push('Manuscript text is not kid-safe.');

    const pages = Array.isArray(input?.pages) ? input.pages : [];
    if (pages.length < 8 || pages.length > 12) errors.push('A picture book needs 8–12 pages.');
    pages.forEach((page, index) => {
        const text = String(page?.text || '').trim();
        const illustration = String(page?.illustration || '').trim();
        if (text.length < 12) errors.push(`Page ${index + 1} needs story text.`);
        if (illustration.length < 12) errors.push(`Page ${index + 1} needs an illustration note.`);
        if (UNSAFE.test(`${text} ${illustration}`) || FOLKLORE_CLAIM.test(`${text} ${illustration}`)) {
            errors.push(`Page ${index + 1} is not kid-safe original fiction.`);
        }
    });
    return errors;
}

export function coverPublicPath(slug: string): string {
    return `/images/story-covers/${slug}.png`;
}

export function pagePublicPath(slug: string, pageNumber: number): string {
    return `/images/story-pages/${slug}/page-${String(pageNumber).padStart(2, '0')}.png`;
}

export function illustrationBlockers(slug: string, pageCount: number, root = process.cwd()): string[] {
    const blockers: string[] = [];
    const cover = path.join(root, 'public', coverPublicPath(slug));
    if (!fs.existsSync(cover)) blockers.push(`Missing cover file ${coverPublicPath(slug)}`);
    for (let i = 1; i <= pageCount; i++) {
        const pagePath = path.join(root, 'public', pagePublicPath(slug, i));
        if (!fs.existsSync(pagePath)) blockers.push(`Missing page art ${pagePublicPath(slug, i)}`);
    }
    return blockers;
}

export function safeDraftPath(input: string): string | null {
    const cleaned = input.replace(/\\/g, '/').replace(/^\/+/, '');
    if (!cleaned.startsWith('content/weekly-drafts/') || cleaned.includes('..')) return null;
    if (!cleaned.endsWith('.json')) return null;
    return cleaned;
}

export function weekDraftName(date = new Date()): string {
    const iso = date.toISOString().slice(0, 10);
    return `content/weekly-drafts/week-${iso}.json`;
}

export function originalMarketManuscript(): WeeklyManuscript {
    return {
        title: 'Market Morning with Mango Moko',
        summary: 'An original Likkle Legends story about Mango Moko helping a neighbor carry fruit at the Saturday market.',
        island_code: 'GD',
        age_track: 'big',
        character: 'mango_moko',
        tradition: 'island_adventure',
        originality: 'original_fiction',
        pages: [
            { text: 'Saturday sun woke Mango Moko. The market bell would ring soon.', illustration: 'A cheerful boy in a straw hat opening a bright window onto a Caribbean street' },
            { text: 'He packed a basket of mangoes. The fruit smelled sweet and sunny.', illustration: 'A basket of ripe mangoes on a wooden table with a yellow cloth' },
            { text: 'On the road he met Miss Coral. Her bag of limes was too heavy.', illustration: 'A kind neighbor with a heavy bag of limes and the boy offering to help' },
            { text: 'Mango Moko said, We can carry it together. One handle each.', illustration: 'Two people sharing a basket down a colorful street' },
            { text: 'At the market, steelpan notes floated over the stalls.', illustration: 'A sunny market with fruit stalls and a small steelpan in the background' },
            { text: 'They set the limes in a neat row. Miss Coral smiled.', illustration: 'Limes lined up on a market table, both characters smiling' },
            { text: 'A little girl wanted one mango. She had a shiny coin.', illustration: 'A small girl holding a coin toward a mango, the boy kneeling to her height' },
            { text: 'Mango Moko gave her the ripest one. Thank you, she said.', illustration: 'The boy handing a mango to the girl, market colors all around' },
            { text: 'Miss Coral shared a lime drink. It was cool and tart.', illustration: 'Two cups of lime drink under a market umbrella' },
            { text: 'The End. Helping makes a market morning brighter.', illustration: 'The boy waving goodbye with an empty basket and a big smile' },
        ],
    };
}

export interface PublishResult {
    ok: boolean;
    slug?: string;
    errors: string[];
    published: boolean;
}

export function publishIllustratedBook(manuscript: WeeklyManuscript, root = process.cwd()): PublishResult {
    const errors = validateManuscript(manuscript);
    if (errors.length) return { ok: false, errors, published: false };

    const slug = slugifyTitle(manuscript.title);
    const artErrors = illustrationBlockers(slug, manuscript.pages.length, root);
    if (artErrors.length) {
        return { ok: false, slug, errors: artErrors, published: false };
    }

    const catalogPath = path.join(root, 'lib/data/live-library-stories.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')) as any[];
    if (catalog.some((story) => story.slug === slug || story.title === manuscript.title)) {
        return { ok: false, slug, errors: ['That book is already in the live catalog.'], published: false };
    }

    catalog.push({
        id: crypto.randomUUID(),
        slug,
        title: manuscript.title,
        summary: manuscript.summary,
        island_code: manuscript.island_code,
        tradition: 'island_adventure',
        age_track: manuscript.age_track,
        estimated_reading_time_minutes: Math.max(4, manuscript.pages.length - 4),
        xp_reward: 15,
        character: manuscript.character,
        reading_level: manuscript.age_track === 'mini' ? 'early' : 'transitional',
        originality: 'original_fiction',
        audio_urls: [],
        narrated_by: null,
        cover_image_url: coverPublicPath(slug),
        pages: manuscript.pages.map((page, index) => ({
            text: page.text,
            illustration: page.illustration,
            image_url: pagePublicPath(slug, index + 1),
        })),
    });

    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
    return { ok: true, slug, errors: [], published: true };
}
