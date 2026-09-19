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
if (catalogCounts.fullyIllustrated !== 12) {
    throw new Error(`Local catalog is not fully illustrated: ${JSON.stringify(catalogCounts)}`);
}
if (!catalog.every(isFullyIllustrated)) {
    throw new Error('A catalog book is missing page art');
}

const emptyBody = toKidsLibraryStory(fakeLiveRow('Ghost Book', 'ghost-book', false, '/images/x.png'));
if (emptyBody) {
    throw new Error('Stories without body must be omitted');
}

const unknownTitle = kids.find((s: any) => !LIVE_TITLES.includes(s.title));
if (unknownTitle) {
    throw new Error(`Invented title leaked: ${unknownTitle.title}`);
}

console.log('verify-kids-library: PASS');
