export const CONTENT_BUCKET = 'content-assets';

export const ASSET_TYPES = [
    'coloring_book',
    'pdf',
    'story',
    'journey_story',
    'other',
] as const;

export type AssetType = (typeof ASSET_TYPES)[number];

export const SECTION_KEYS = [
    'portal_library',
    'kids_library',
    'coloring_books',
    'stories',
    'journey_stories',
    'downloads',
    'printables',
    'featured_home',
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const AGE_BANDS = ['all', 'mini', 'big'] as const;
export type AgeBand = (typeof AGE_BANDS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
    portal_library: 'Portal library',
    kids_library: 'Kids library',
    coloring_books: 'Coloring books',
    stories: 'Stories',
    journey_stories: 'Journey Stories',
    downloads: 'Downloads',
    printables: 'Printables',
    featured_home: 'Featured on home',
};

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
    coloring_book: 'Coloring book',
    pdf: 'PDF',
    story: 'Story',
    journey_story: 'Journey Story',
    other: 'Other',
};

/** Kid routes that list a section. */
export const SECTION_ROUTES: Record<SectionKey, string> = {
    portal_library: '/portal/library',
    kids_library: '/portal/library',
    coloring_books: '/portal/coloring-books',
    stories: '/portal/stories',
    journey_stories: '/portal/journey-stories',
    downloads: '/portal/downloads',
    printables: '/portal/downloads',
    featured_home: '/portal',
};

export const PAID_TIERS = ['starter_mailer', 'legends_plus', 'family_legacy', 'admin'] as const;
export const PAID_STATUSES = ['active', 'trialing'] as const;

export const LIMITS = {
    pdfBytes: 40 * 1024 * 1024,
    imageBytes: 15 * 1024 * 1024,
    zipBytes: 80 * 1024 * 1024,
    coverBytes: 8 * 1024 * 1024,
    maxTags: 12,
    maxTagLength: 32,
    maxTitle: 160,
    maxDescription: 4000,
} as const;
