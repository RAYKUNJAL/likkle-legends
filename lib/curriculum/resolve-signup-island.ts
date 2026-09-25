/**
 * Map signup island slugs, IslandPicker ids, registry codes, and an explicit
 * country onto a retrieved island pack. Does not call a model.
 *
 * Profile `country_code` defaults to US in the database. Callers must pass
 * `country` only when a parent actually chose it (metadata or a parent form).
 */
import { ISLAND_REGISTRY, type IslandPack } from '@/lib/registries/islands';

export type PlaceAnchors = {
    foods: string[];
    music: string[];
    topics: string[];
    landmarks: string[];
};

export type ResolvedSignupPlace = {
    status: 'resolved' | 'unknown';
    /** IslandPicker id when we can store one (`jamaica`, `trinidad`, `mixed`). */
    primaryIslandId: string | null;
    /** Key in ISLAND_REGISTRY, when a dedicated pack exists. */
    registryId: string | null;
    displayName: string;
    diaspora: boolean;
    /** Recognized Caribbean place that has no pack of its own. */
    unpackedPlace: string | null;
    source: 'island' | 'country' | 'unknown';
    anchors: PlaceAnchors;
};

const BLOCKED_ANCHOR = /rum|beer|wine|nightlife|nude|heineken|alcohol/i;

const DIASPORA_ANCHORS: PlaceAnchors = {
    foods: ['mango', 'roti', 'rice and peas'],
    music: ['reggae', 'soca', 'calypso'],
    topics: ['family stories', 'island food', 'music and rhythm', 'Caribbean flags'],
    landmarks: [],
};

type PlaceSeed = {
    pickerId: string;
    registryId: string;
    name: string;
    aliases: string[];
};

const PLACES: PlaceSeed[] = [
    { pickerId: 'jamaica', registryId: 'JM', name: 'Jamaica', aliases: ['jamaica', 'jm'] },
    { pickerId: 'trinidad', registryId: 'TT', name: 'Trinidad & Tobago', aliases: ['trinidad', 'trinidad_and_tobago', 'tobago', 'tt'] },
    { pickerId: 'barbados', registryId: 'BB', name: 'Barbados', aliases: ['barbados', 'bb'] },
    { pickerId: 'guyana', registryId: 'GY', name: 'Guyana', aliases: ['guyana', 'gy'] },
    { pickerId: 'haiti', registryId: 'HT', name: 'Haiti', aliases: ['haiti', 'ht'] },
    { pickerId: 'dominican_republic', registryId: 'DO', name: 'Dominican Republic', aliases: ['dominican_republic', 'dominica_republic', 'do'] },
    { pickerId: 'cuba', registryId: 'CU', name: 'Cuba', aliases: ['cuba', 'cu'] },
    { pickerId: 'puerto_rico', registryId: 'PR', name: 'Puerto Rico', aliases: ['puerto_rico', 'pr'] },
    { pickerId: 'st_lucia', registryId: 'LC', name: 'St. Lucia', aliases: ['st_lucia', 'saint_lucia', 'lc'] },
    { pickerId: 'grenada', registryId: 'GD', name: 'Grenada', aliases: ['grenada', 'gd'] },
    { pickerId: 'antigua', registryId: 'AG', name: 'Antigua & Barbuda', aliases: ['antigua', 'antigua_and_barbuda', 'barbuda', 'ag'] },
    { pickerId: 'st_vincent', registryId: 'VC', name: 'St. Vincent & Grenadines', aliases: ['st_vincent', 'saint_vincent', 'saint_vincent_and_the_grenadines', 'st_vincent_and_the_grenadines', 'vc'] },
    { pickerId: 'dominica', registryId: 'DM', name: 'Dominica', aliases: ['dominica', 'dm'] },
    { pickerId: 'st_kitts', registryId: 'KN', name: 'St. Kitts & Nevis', aliases: ['st_kitts', 'saint_kitts', 'saint_kitts_and_nevis', 'st_kitts_and_nevis', 'nevis', 'kn'] },
    { pickerId: 'montserrat', registryId: 'MS', name: 'Montserrat', aliases: ['montserrat', 'ms'] },
    { pickerId: 'anguilla', registryId: 'AI', name: 'Anguilla', aliases: ['anguilla', 'ai'] },
    { pickerId: 'bahamas', registryId: 'BS', name: 'Bahamas', aliases: ['bahamas', 'the_bahamas', 'bs'] },
    { pickerId: 'cayman', registryId: 'KY', name: 'Cayman Islands', aliases: ['cayman', 'cayman_islands', 'ky'] },
    { pickerId: 'turks_caicos', registryId: 'TC', name: 'Turks & Caicos', aliases: ['turks_caicos', 'turks_and_caicos', 'turks_and_caicos_islands', 'tc'] },
    { pickerId: 'bermuda', registryId: 'BM', name: 'Bermuda', aliases: ['bermuda', 'bm'] },
    { pickerId: 'aruba', registryId: 'AW', name: 'Aruba', aliases: ['aruba', 'aw'] },
    { pickerId: 'curacao', registryId: 'CW', name: 'Curaçao', aliases: ['curacao', 'cura_ao', 'cw'] },
    { pickerId: 'bonaire', registryId: 'BQ', name: 'Bonaire', aliases: ['bonaire', 'bq'] },
    { pickerId: 'martinique', registryId: 'MQ', name: 'Martinique', aliases: ['martinique', 'mq'] },
    { pickerId: 'guadeloupe', registryId: 'GP', name: 'Guadeloupe', aliases: ['guadeloupe', 'gp'] },
    { pickerId: 'st_martin', registryId: 'MF', name: 'Saint Martin', aliases: ['st_martin', 'saint_martin', 'st_martin_sint_maarten', 'mf'] },
    { pickerId: 'sint_maarten', registryId: 'SX', name: 'Sint Maarten', aliases: ['sint_maarten', 'sx'] },
    { pickerId: 'st_barthelemy', registryId: 'BL', name: 'Saint Barthélemy', aliases: ['st_barthelemy', 'saint_barthelemy', 'saint_barth', 'st_barth', 'bl'] },
    { pickerId: 'bvi', registryId: 'VG', name: 'British Virgin Islands', aliases: ['bvi', 'british_virgin_islands', 'vg'] },
    { pickerId: 'usvi', registryId: 'VI', name: 'US Virgin Islands', aliases: ['usvi', 'us_virgin_islands', 'u_s_virgin_islands', 'vi'] },
    { pickerId: 'belize', registryId: 'BZ', name: 'Belize', aliases: ['belize', 'bz'] },
    { pickerId: 'suriname', registryId: 'SR', name: 'Suriname', aliases: ['suriname', 'sr'] },
    { pickerId: 'saint_pierre', registryId: 'PM', name: 'Saint Pierre and Miquelon', aliases: ['saint_pierre', 'saint_pierre_and_miquelon', 'pm'] },
];

/** Diaspora countries. Not used for the profile column default. */
const DIASPORA_ALIASES = [
    'us', 'usa', 'u_s', 'u_s_a', 'united_states', 'united_states_of_america', 'america',
    'ca', 'canada',
    'gb', 'uk', 'u_k', 'united_kingdom', 'great_britain', 'england', 'scotland', 'wales',
    'au', 'australia',
    'nz', 'new_zealand',
    'ie', 'ireland',
    'de', 'germany',
    'fr', 'france',
    'nl', 'netherlands', 'holland',
    'es', 'spain',
    'it', 'italy',
    'ae', 'united_arab_emirates',
    'se', 'sweden',
    'no', 'norway',
    'dk', 'denmark',
    'be', 'belgium',
    'ch', 'switzerland',
];

const MIXED_ALIASES = ['mixed', 'island_explorer', 'diaspora', 'caribbean_diaspora'];

/** Known Caribbean places with no dedicated pack. Stay pan-Caribbean and say so. */
const UNPACKED: { alias: string; label: string }[] = [
    { alias: 'saba', label: 'Saba' },
    { alias: 'sint_eustatius', label: 'Sint Eustatius' },
    { alias: 'statia', label: 'Sint Eustatius' },
];

const ALIAS_TO_PLACE = new Map<string, PlaceSeed>();
for (const place of PLACES) {
    ALIAS_TO_PLACE.set(place.pickerId, place);
    ALIAS_TO_PLACE.set(place.registryId.toLowerCase(), place);
    for (const alias of place.aliases) ALIAS_TO_PLACE.set(alias, place);
    const fromRegistry = ISLAND_REGISTRY[place.registryId];
    if (fromRegistry) ALIAS_TO_PLACE.set(normalizePlaceKey(fromRegistry.display_name), place);
}

const DIASPORA_SET = new Set(DIASPORA_ALIASES);
const MIXED_SET = new Set(MIXED_ALIASES);
const UNPACKED_MAP = new Map(UNPACKED.map((row) => [row.alias, row.label]));

export const PARENT_ISLAND_CHOICES = [
    ...PLACES.map((place) => ({ id: place.pickerId, name: place.name })),
    { id: 'mixed', name: 'Island Explorer (no single island)' },
];

export const PARENT_DIASPORA_COUNTRIES = [
    { id: 'US', name: 'United States' },
    { id: 'CA', name: 'Canada' },
    { id: 'GB', name: 'United Kingdom' },
    { id: 'AU', name: 'Australia' },
];

export function normalizePlaceKey(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '');
}

function keepAnchor(value: string): boolean {
    const text = value.trim();
    return Boolean(text) && !BLOCKED_ANCHOR.test(text);
}

export function anchorsFromPack(pack: IslandPack): PlaceAnchors {
    return {
        foods: pack.cultural_traits.foods.filter(keepAnchor).slice(0, 4),
        music: pack.cultural_traits.music_styles.filter(keepAnchor).slice(0, 3),
        topics: pack.safe_topics.filter(keepAnchor).slice(0, 4),
        landmarks: (pack.symbols.landmarks || []).filter(keepAnchor).slice(0, 3),
    };
}

function diasporaPlace(source: 'island' | 'country', unpackedPlace: string | null): ResolvedSignupPlace {
    return {
        status: 'resolved',
        primaryIslandId: unpackedPlace ? null : 'mixed',
        registryId: null,
        displayName: 'Caribbean diaspora',
        diaspora: true,
        unpackedPlace,
        source,
        anchors: DIASPORA_ANCHORS,
    };
}

function fromSeed(seed: PlaceSeed, source: 'island' | 'country'): ResolvedSignupPlace | null {
    const pack = ISLAND_REGISTRY[seed.registryId];
    if (!pack) return null;
    return {
        status: 'resolved',
        primaryIslandId: seed.pickerId,
        registryId: seed.registryId,
        displayName: pack.display_name,
        diaspora: false,
        unpackedPlace: null,
        source,
        anchors: anchorsFromPack(pack),
    };
}

function lookup(raw: string, source: 'island' | 'country'): ResolvedSignupPlace | null {
    const key = normalizePlaceKey(raw);
    if (!key) return null;
    const seed = ALIAS_TO_PLACE.get(key);
    if (seed) return fromSeed(seed, source);
    if (MIXED_SET.has(key)) return diasporaPlace(source, null);
    const unpacked = UNPACKED_MAP.get(key);
    if (unpacked) return diasporaPlace(source, unpacked);
    if (DIASPORA_SET.has(key)) return diasporaPlace(source, null);
    return null;
}

const UNKNOWN_PLACE: ResolvedSignupPlace = {
    status: 'unknown',
    primaryIslandId: null,
    registryId: null,
    displayName: '',
    diaspora: false,
    unpackedPlace: null,
    source: 'unknown',
    anchors: { foods: [], music: [], topics: [], landmarks: [] },
};

export function resolveSignupPlace(input: {
    primaryIsland?: string | null;
    originIsland?: string | null;
    preferredIslandCode?: string | null;
    country?: string | null;
}): ResolvedSignupPlace {
    const candidates: { value: string; source: 'island' | 'country' }[] = [];
    const push = (value: string | null | undefined, source: 'island' | 'country') => {
        const text = (value || '').trim();
        if (text) candidates.push({ value: text, source });
    };
    push(input.primaryIsland, 'island');
    push(input.originIsland, 'island');
    push(input.preferredIslandCode, 'island');
    push(input.country, 'country');

    for (const candidate of candidates) {
        const hit = lookup(candidate.value, candidate.source);
        if (hit) return hit;
    }
    return UNKNOWN_PLACE;
}

/** IslandPicker id when the raw signup value maps to a pack or the diaspora choice. */
export function canonicalPrimaryIsland(raw: string | null | undefined): string | null {
    const hit = lookup(raw || '', 'island');
    if (!hit || hit.unpackedPlace) return null;
    return hit.primaryIslandId;
}

export function groundingBrief(place: ResolvedSignupPlace): string {
    if (place.status !== 'resolved') return '';
    const lines = [
        'Retrieved place pack (use only these facts; do not invent landmarks, foods, history, or medical advice):',
        `- Place: ${place.displayName}${place.diaspora ? ' (diaspora — no single home island)' : ''}`,
        `- Registry: ${place.registryId || 'none'}`,
        `- Foods: ${place.anchors.foods.join(', ') || 'none listed'}`,
        `- Music: ${place.anchors.music.join(', ') || 'none listed'}`,
        `- Topics: ${place.anchors.topics.join(', ') || 'none listed'}`,
        `- Landmarks: ${place.anchors.landmarks.join(', ') || 'none listed'}`,
    ];
    if (place.unpackedPlace) {
        lines.push(`- Note: no dedicated pack for ${place.unpackedPlace}. Stay pan-Caribbean and say so.`);
    }
    lines.push('Ages about 4–9. Warm Caribbean tone. No therapy, diagnosis, medication, or punishment.');
    return lines.join('\n');
}
