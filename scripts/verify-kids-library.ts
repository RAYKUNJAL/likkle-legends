/**
 * Verifies kids-library wiring rules:
 * - only the known live API titles
 * - covers attached from local art
 * - books without body or cover are omitted
 */
import {
    STORY_COVER_BY_SLUG,
    attachPageIllustrations,
    coverCounts,
    isFullyIllustrated,
    localCatalogStories,
    mergeParentLibraryStories,
    parentOfficialStories,
    toKidsLibraryStory,
} from '../lib/library-stories';

const LIVE_TITLES = [
    "The River Mumma's Gift",
    'Dilly Doubles and the Carnival King',
    "The Chickcharney's Lesson",
    'The Mermaid of Carlisle Bay',
    'Steelpan Sam and the Rhythm of the Rain',
    'Anansi and the Mango Tree',
    'The Legend of the Silk Cotton Tree',
    'Papa Bois and the Lost Fawn',
    'The Rolling Calf of Green Bay',
    'Mango Moko and the Garden Race',
    'R.O.T.I. and the Lost Words',
    'Tanty Spice and the Pepper Sauce Secret',
];

function fakeLiveRow(title: string, slug: string, withBody: boolean, cover: string | null) {
    return {
        id: slug,
        title,
        slug,
        summary: 'Live library story',
        cover_image_url: cover,
        island_code: 'TT',
        tradition: 'island_adventure',
        age_track: 'big',
        estimated_reading_time_minutes: 5,
        content: withBody
            ? { pages: [{ text: 'A real Caribbean page of story text.' }] }
            : { pages: [] },
    };
}

const before = Object.keys(STORY_COVER_BY_SLUG).map((slug, index) =>
    fakeLiveRow(LIVE_TITLES[index], slug, true, null)
);
const after = before.map(attachPageIllustrations);
const kids = after.map(toKidsLibraryStory).filter(Boolean);
const catalog = localCatalogStories();

const beforeCounts = coverCounts(before);
const afterCounts = coverCounts(after);
const catalogCounts = coverCounts(catalog);

console.log('BEFORE covers', beforeCounts);
console.log('AFTER art attach', afterCounts);
console.log('LOCAL CATALOG', catalogCounts);
console.log('Kids-ready titles:', kids.map((s: any) => s.title));

if (afterCounts.withCover !== 12 || afterCounts.fullyIllustrated !== 12 || afterCounts.kidsReady !== 12) {
    throw new Error(`Expected 12 fully illustrated books, got ${JSON.stringify(afterCounts)}`);
}
if (catalogCounts.fullyIllustrated < 12 || catalogCounts.kidsReady < 12) {
    throw new Error(`Local catalog is not fully illustrated: ${JSON.stringify(catalogCounts)}`);
}
const catalogTitles = catalog.map((story) => story.title);
for (const title of LIVE_TITLES) {
    if (!catalogTitles.includes(title)) throw new Error(`Live catalog is missing ${title}`);
}
if (!catalog.every(isFullyIllustrated)) {
    throw new Error('A catalog book is missing page art');
}

const emptyBody = toKidsLibraryStory(fakeLiveRow('Ghost Book', 'ghost-book', false, '/images/x.png'));
if (emptyBody) {
    throw new Error('Stories without body must be omitted');
}

const coverOnlyUnknown = toKidsLibraryStory({
    id: 'cover-only',
    title: 'Cover Only Extra',
    slug: 'not-a-live-catalog-slug',
    summary: 'Has a cover and text but no real page art',
    cover_image_url: '/images/x.png',
    island_code: 'TT',
    tradition: 'island_adventure',
    age_track: 'big',
    estimated_reading_time_minutes: 5,
    content: { pages: [{ text: 'Words only. No illustration file.' }] },
});
if (coverOnlyUnknown) {
    throw new Error('Cover-only extras must not slip past the fully-illustrated gate');
}

const staleRemote = attachPageIllustrations({
    ...fakeLiveRow(LIVE_TITLES[0], Object.keys(STORY_COVER_BY_SLUG)[0], true, 'https://example.invalid/stale-cover.png'),
    content: { pages: [{ text: 'A real Caribbean page of story text.', image_url: 'https://example.invalid/stale-page.png' }] },
});
if (!String(staleRemote.cover_image_url).startsWith('/images/story-covers/')) {
    throw new Error('Known slugs must prefer local cover art over stale remote URLs');
}
if (!String(staleRemote.content.pages[0].image_url).startsWith('/images/story-pages/')) {
    throw new Error('Known slugs must prefer local page art over stale remote URLs');
}

const unlocked = kids.every((s: any) => s.is_active === true);
if (!unlocked) {
    throw new Error('Kids-ready books must be marked active so dashboard cards do not lock');
}

const unknownTitle = kids.find((s: any) => !LIVE_TITLES.includes(s.title));
if (unknownTitle) {
    throw new Error(`Invented title leaked: ${unknownTitle.title}`);
}

const parentOfficial = parentOfficialStories();
const parentShelf = mergeParentLibraryStories(parentOfficial, []);
if (parentShelf.length < 12 || parentShelf.some((s) => !s.is_official || !s.cover_image_url || !s.href.startsWith('/library/stories/'))) {
    throw new Error(`Parent library must show the illustrated books, got ${parentShelf.length}`);
}
if (LIVE_TITLES.some((title) => !parentShelf.some((story) => story.title === title))) {
    throw new Error('Parent library is missing one of the original 12 books');
}
if (parentShelf.some((s) => !LIVE_TITLES.includes(s.title))) {
    throw new Error('Parent library leaked an invented title');
}

const emptyParent = mergeParentLibraryStories([], []);
if (emptyParent.length !== 0) {
    throw new Error('Parent library must stay honestly empty when no illustrated books are ready');
}

const parentWithPersonal = mergeParentLibraryStories(parentOfficial, [
    { id: 'mine', title: 'My Family Tale', summary: 'A personal story', user_id: 'parent-1', cover_image_url: '/images/x.png' },
]);
if (parentWithPersonal.length !== parentShelf.length + 1 || parentWithPersonal.filter((s) => s.is_official).length !== parentShelf.length) {
    throw new Error('Personal storybooks should sit beside the official illustrated books, not replace them');
}

console.log('verify-kids-library: PASS');
