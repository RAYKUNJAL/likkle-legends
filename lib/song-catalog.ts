import type { Track } from '@/lib/types';

export type SongCatalogStatus = 'playable' | 'audio_missing';
export type SongCatalogSource = 'owned-asset' | 'suno-cdn' | 'gcs-public';

export interface CatalogSong {
    id: string;
    title: string;
    artist: string;
    /** Owned master file. Paid downloads serve this file. */
    url: string;
    /** Smaller streaming rendition. Listening does not require a purchase. */
    streamUrl?: string;
    channel: string;
    cover_image_url?: string;
    island_origin?: string;
    status: SongCatalogStatus;
    source: SongCatalogSource;
    notes?: string;
}

const CHANNEL_COVER: Record<string, string> = {
    roti: '/images/roti-new.jpg',
    tanty_spice: '/images/tanty_spice_avatar.jpg',
    dilly_doubles: '/images/dilly-doubles.jpg',
    steelpan_sam: '/images/steelpan_sam.png',
    calm: '/images/benny-of-shadows.jpg',
    lullaby: '/images/benny-of-shadows.jpg',
};

type OwnedSongInput = {
    title: string;
    slug: string;
    channel: string;
    /** Keep a previous id when a download entitlement may already point at it. */
    id?: string;
};

function ownedPlayable(input: OwnedSongInput): CatalogSong {
    return {
        id: input.id ?? `owned-${input.slug}`,
        title: input.title,
        artist: 'Likkle Legends',
        url: `/assets/youtube/music/${input.slug}.mp3`,
        streamUrl: `/assets/youtube/music/${input.slug}.stream.mp3`,
        channel: input.channel,
        cover_image_url: CHANNEL_COVER[input.channel],
        island_origin: 'Caribbean',
        status: 'playable',
        source: 'owned-asset',
        notes: `Owned file at public/assets/youtube/music/${input.slug}.mp3.`,
    };
}

/**
 * First-party audio that exists in this repo under public/assets/youtube/music/.
 * Do not add a title here unless the file is in the tree.
 *
 * Drinking Water and Saving Money keep their original ids so existing
 * music_download entitlements still resolve. Their master and stream bytes
 * are Ray's current Suno playlist takes (share DpiVPR7s0kSq2iJm).
 */
export const OWNED_PLAYABLE_SONGS: CatalogSong[] = [
    ownedPlayable({ id: 'owned-drinking-water', title: 'Drinking Water', slug: 'drinking-water', channel: 'roti' }),
    ownedPlayable({ id: 'owned-saving-money', title: 'Saving Money', slug: 'saving-money', channel: 'tanty_spice' }),

    ownedPlayable({ title: 'Island Alphabet', slug: 'island-alphabet', channel: 'roti' }),
    ownedPlayable({ title: 'Island Counting', slug: 'island-counting', channel: 'roti' }),
    ownedPlayable({ title: "Let's Count to 20", slug: 'lets-count-to-20', channel: 'roti' }),
    ownedPlayable({ title: 'Learn to Tie Your Shoe', slug: 'learn-to-tie-your-shoe', channel: 'roti' }),
    ownedPlayable({ title: 'Eat Your Vegetables', slug: 'eat-your-vegetables', channel: 'roti' }),
    ownedPlayable({ title: 'Anger Management', slug: 'anger-management', channel: 'roti' }),
    ownedPlayable({ title: 'Good Morning', slug: 'good-morning-song', channel: 'roti' }),
    ownedPlayable({ title: 'Likkle Legends Jingle', slug: 'likkle-legends-jingle', channel: 'roti' }),
    ownedPlayable({ title: 'Head, Shoulders, Knees, and Toes', slug: 'head-shoulders-knees-and-toes', channel: 'roti' }),
    ownedPlayable({ title: 'The AM Song 2', slug: 'the-am-song2', channel: 'roti' }),

    ownedPlayable({ title: 'Blue Mountain Coffee', slug: 'blue-mountain-coffee-kids-song', channel: 'tanty_spice' }),
    ownedPlayable({ title: 'Sorell Drink', slug: 'sorell-drink', channel: 'tanty_spice' }),
    ownedPlayable({ title: 'Coco Water', slug: 'coco-water', channel: 'tanty_spice' }),
    ownedPlayable({ title: 'Callaloo', slug: 'callaloo', channel: 'tanty_spice' }),
    ownedPlayable({ title: 'Doubles', slug: 'doubles-2', channel: 'tanty_spice' }),
    ownedPlayable({ title: 'Akee and Salt Fish', slug: 'akee-and-salt-fish', channel: 'tanty_spice' }),
    ownedPlayable({ title: 'Coconut Song', slug: 'coconut-song', channel: 'tanty_spice' }),
    ownedPlayable({ title: 'Soursop', slug: 'soursop', channel: 'tanty_spice' }),
    ownedPlayable({ title: 'Lunch Time Flavor Train', slug: 'lunch-time-flavor-train', channel: 'tanty_spice' }),
    ownedPlayable({ title: 'Bath Time Bubble Soca', slug: 'bath-time-bubble-soca', channel: 'tanty_spice' }),

    ownedPlayable({ title: 'Angry Rooster', slug: 'angry-rooster', channel: 'dilly_doubles' }),
    ownedPlayable({ title: 'Island Monkeys', slug: 'island-monkeys', channel: 'dilly_doubles' }),
    ownedPlayable({ title: 'Island Parrots', slug: 'island-parrots', channel: 'dilly_doubles' }),
    ownedPlayable({ title: 'Iguana Song', slug: 'iguana-song', channel: 'dilly_doubles' }),
    ownedPlayable({ title: 'Coconut Crab Climbs High', slug: 'coconut-crab-climbs-high', channel: 'dilly_doubles' }),

    ownedPlayable({ title: 'Island Shaped Song', slug: 'island-shaped-song', channel: 'steelpan_sam' }),
    ownedPlayable({ title: 'Island Shout Out', slug: 'island-shout-out', channel: 'steelpan_sam' }),

    ownedPlayable({ title: 'Island Lullaby', slug: 'island-lullaby', channel: 'lullaby' }),
    ownedPlayable({ title: 'Goodnight Ocean Breeze', slug: 'goodnight-ocean-breeze', channel: 'lullaby' }),
    ownedPlayable({ title: 'Sleep Now Island Moon', slug: 'sleep-now-island-moon-lullaby', channel: 'calm' }),
];

/**
 * Titles recovered from older radio seeds. The audio hosts returned 403/404
 * and the files are not in this repo. Inventory only — never streamed or sold.
 * Playlist takes that now have owned files live in OWNED_PLAYABLE_SONGS.
 */
export const RECOVERED_UNPLAYABLE_SONGS: CatalogSong[] = [
    { id: 'gcs-morning-calypso', title: "Tanty's Morning Calypso", artist: 'Likkle Legends', url: 'https://storage.googleapis.com/likkle-legends-public/radio/morning-calypso.mp3', channel: 'tanty_spice', status: 'audio_missing', source: 'gcs-public', notes: 'GCS object missing. Title only, from scripts/seed-radio.ts.' },
    { id: 'gcs-anansi-story', title: 'The Legend of Anansi', artist: 'Caribbean Storytellers', url: 'https://storage.googleapis.com/likkle-legends-public/radio/anansi-story.mp3', channel: 'tanty_spice', status: 'audio_missing', source: 'gcs-public', notes: 'GCS object missing. Title only, from scripts/seed-radio.ts.' },
    { id: 'gcs-reggae-roti', title: 'Reggae Rhythms for Roti', artist: 'Mango Moko', url: 'https://storage.googleapis.com/likkle-legends-public/radio/reggae-roti.mp3', channel: 'roti', status: 'audio_missing', source: 'gcs-public', notes: 'GCS object missing. Title only, from scripts/seed-radio.ts.' },
];

export function catalogSongToTrack(song: CatalogSong): Track {
    return {
        id: song.id,
        title: song.title,
        artist: song.artist,
        url: playbackUrl(song),
        channel: song.channel,
    };
}

export function getPlayableCatalogSongs(): CatalogSong[] {
    return OWNED_PLAYABLE_SONGS.filter((song) => song.status === 'playable' && song.url.startsWith('/assets/youtube/music/'));
}

export function getPlayableSong(trackId: string | null | undefined): CatalogSong | null {
    if (!trackId) return null;
    return getPlayableCatalogSongs().find((song) => song.id === trackId) ?? null;
}

export function getPlayableTracks(): Track[] {
    return getPlayableCatalogSongs().map(catalogSongToTrack);
}

/** Public URL used for free playback. Masters stay available for paid downloads. */
export function playbackUrl(song: Pick<CatalogSong, 'url' | 'streamUrl'>): string {
    return song.streamUrl || song.url;
}

/** Streaming these files is free for every account. Purchase never gates play. */
export function streamPathIsUngated(url: string | null | undefined): boolean {
    if (!url) return false;
    return getPlayableCatalogSongs().some((song) => song.url === url || playbackUrl(song) === url);
}

export function musicCatalogScoreboard() {
    return {
        playable: getPlayableCatalogSongs().length,
        inventoryMissing: RECOVERED_UNPLAYABLE_SONGS.length,
        invented: 0,
    };
}
