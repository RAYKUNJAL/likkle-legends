import { RADIO_CHANNELS } from '@/lib/constants';
import type { Track } from '@/lib/types';

export type SongCatalogStatus = 'playable' | 'audio_missing';

export interface CatalogSong {
    id: string;
    title: string;
    artist: string;
    url: string;
    channel: string;
    cover_image_url: string;
    island_origin: string;
    tier_required: 'free';
    duration_seconds?: number;
    status: SongCatalogStatus;
    source: 'owned-asset' | 'suno-cdn' | 'gcs-public' | 'database';
    notes?: string;
}

/**
 * First-party audio that still exists in this repo.
 * Do not add invented tracks here — only recovered owned files.
 */
export const OWNED_PLAYABLE_SONGS: CatalogSong[] = [
    {
        id: 'owned-drinking-water',
        title: 'Drinking Water',
        artist: 'Tanty Spice',
        url: '/assets/youtube/music/drinking-water.mp3',
        channel: 'tanty_spice',
        cover_image_url: '/images/tanty_spice_avatar.jpg',
        island_origin: 'Caribbean',
        tier_required: 'free',
        duration_seconds: 106,
        status: 'playable',
        source: 'owned-asset',
        notes: 'Owned nursery rhyme at public/assets/youtube/music/drinking-water.mp3',
    },
    {
        id: 'owned-saving-money',
        title: 'Saving Money',
        artist: 'R.O.T.I',
        url: '/assets/youtube/music/saving-money.mp3',
        channel: 'roti',
        cover_image_url: '/images/roti-new.jpg',
        island_origin: 'Caribbean',
        tier_required: 'free',
        duration_seconds: 53,
        status: 'playable',
        source: 'owned-asset',
        notes: 'Owned nursery rhyme at public/assets/youtube/music/saving-money.mp3',
    },
];

/**
 * Metadata recovered from git history. Audio hosts returned 403/404 on 2026-09-18.
 * Kept for inventory only — never shown as a playable row.
 */
export const RECOVERED_UNPLAYABLE_SONGS: CatalogSong[] = [
    {
        id: 'track-roti-1',
        title: 'Island Alphabet',
        artist: 'R.O.T.I',
        url: 'https://cdn1.suno.ai/614d60d0-dce6-4fdf-8c65-4f6efdec40a3.mp3',
        channel: 'roti',
        cover_image_url: '/images/roti-new.jpg',
        island_origin: 'Caribbean',
        tier_required: 'free',
        status: 'audio_missing',
        source: 'suno-cdn',
        notes: 'Suno CDN 403 on 2026-09-18',
    },
    {
        id: 'track-roti-2',
        title: 'Island Counting',
        artist: 'R.O.T.I',
        url: 'https://cdn1.suno.ai/d85cfbfe-41ac-4694-9000-54b8ab87f460.mp3',
        channel: 'roti',
        cover_image_url: '/images/roti-new.jpg',
        island_origin: 'Caribbean',
        tier_required: 'free',
        status: 'audio_missing',
        source: 'suno-cdn',
        notes: 'Suno CDN 403 on 2026-09-18',
    },
    {
        id: 'track-roti-3',
        title: 'Likkle Legends Jingle',
        artist: 'R.O.T.I',
        url: 'https://cdn1.suno.ai/b792349c-09ad-4d94-8e96-ef4077b39209.mp3',
        channel: 'roti',
        cover_image_url: '/images/roti-new.jpg',
        island_origin: 'Caribbean',
        tier_required: 'free',
        status: 'audio_missing',
        source: 'suno-cdn',
        notes: 'Suno CDN 403 on 2026-09-18',
    },
    {
        id: 'track-tanty-1',
        title: 'Coco Water',
        artist: 'Tanty Spice',
        url: 'https://cdn1.suno.ai/ed6d7539-ed37-4f21-a06c-73142ea2129d.mp3',
        channel: 'tanty_spice',
        cover_image_url: '/images/tanty_spice_avatar.jpg',
        island_origin: 'Caribbean',
        tier_required: 'free',
        status: 'audio_missing',
        source: 'suno-cdn',
        notes: 'Suno CDN 403 on 2026-09-18',
    },
    {
        id: 'track-tanty-2',
        title: 'Sorell Drink',
        artist: 'Tanty Spice',
        url: 'https://cdn1.suno.ai/3f649c16-75ff-43de-99d6-17e4534d716b.mp3',
        channel: 'tanty_spice',
        cover_image_url: '/images/tanty_spice_avatar.jpg',
        island_origin: 'Caribbean',
        tier_required: 'free',
        status: 'audio_missing',
        source: 'suno-cdn',
        notes: 'Suno CDN 403 on 2026-09-18',
    },
    {
        id: 'track-dilly-1',
        title: 'Angry Rooster',
        artist: 'Dilly Doubles',
        url: 'https://cdn1.suno.ai/c5e7a4d5-3154-4a42-9106-e33f446b9b4b.mp3',
        channel: 'dilly_doubles',
        cover_image_url: '/images/dilly-doubles.jpg',
        island_origin: 'Trinidad & Tobago',
        tier_required: 'free',
        status: 'audio_missing',
        source: 'suno-cdn',
        notes: 'Suno CDN 403 on 2026-09-18',
    },
    {
        id: 'track-dilly-2',
        title: 'Island Monkeys',
        artist: 'Dilly Doubles',
        url: 'https://cdn1.suno.ai/6d2d490e-2cd6-4593-898d-ee6c82d7b4b8.mp3',
        channel: 'dilly_doubles',
        cover_image_url: '/images/dilly-doubles.jpg',
        island_origin: 'Caribbean',
        tier_required: 'free',
        status: 'audio_missing',
        source: 'suno-cdn',
        notes: 'Suno CDN 403 on 2026-09-18',
    },
    {
        id: 'track-sam-1',
        title: 'Island Parrots',
        artist: 'Steelpan Sam',
        url: 'https://cdn1.suno.ai/ee0e94a6-d116-4116-992e-7ecb8fd76109.mp3',
        channel: 'steelpan_sam',
        cover_image_url: '/images/steelpan_sam.png',
        island_origin: 'Trinidad & Tobago',
        tier_required: 'free',
        status: 'audio_missing',
        source: 'suno-cdn',
        notes: 'Suno CDN 403 on 2026-09-18',
    },
    {
        id: 'track-sam-2',
        title: 'Iguana Song',
        artist: 'Steelpan Sam',
        url: 'https://cdn1.suno.ai/0303769f-299a-40dd-bc6a-890c405dbb07.mp3',
        channel: 'steelpan_sam',
        cover_image_url: '/images/steelpan_sam.png',
        island_origin: 'Caribbean',
        tier_required: 'free',
        status: 'audio_missing',
        source: 'suno-cdn',
        notes: 'Suno CDN 403 on 2026-09-18',
    },
    {
        id: 'gcs-morning-calypso',
        title: "Tanty's Morning Calypso",
        artist: 'Likkle Legends',
        url: 'https://storage.googleapis.com/likkle-legends-public/radio/morning-calypso.mp3',
        channel: 'tanty_spice',
        cover_image_url: '/images/tanty_spice_avatar.jpg',
        island_origin: 'Caribbean',
        tier_required: 'free',
        duration_seconds: 185,
        status: 'audio_missing',
        source: 'gcs-public',
        notes: 'GCS 404 — recovered from scripts/seed-radio.ts',
    },
    {
        id: 'gcs-anansi-story',
        title: 'The Legend of Anansi',
        artist: 'Caribbean Storytellers',
        url: 'https://storage.googleapis.com/likkle-legends-public/radio/anansi-story.mp3',
        channel: 'tanty_spice',
        cover_image_url: '/images/tanty_spice_avatar.jpg',
        island_origin: 'Caribbean',
        tier_required: 'free',
        duration_seconds: 420,
        status: 'audio_missing',
        source: 'gcs-public',
        notes: 'GCS 404 — recovered from scripts/seed-radio.ts',
    },
    {
        id: 'gcs-island-lullaby',
        title: 'Island Lullaby (Soft Steelpan)',
        artist: 'Steelpan Sam',
        url: 'https://storage.googleapis.com/likkle-legends-public/radio/island-lullaby.mp3',
        channel: 'steelpan_sam',
        cover_image_url: '/images/steelpan_sam.png',
        island_origin: 'Caribbean',
        tier_required: 'free',
        duration_seconds: 310,
        status: 'audio_missing',
        source: 'gcs-public',
        notes: 'GCS 404 — recovered from scripts/seed-radio.ts',
    },
    {
        id: 'gcs-abc-island',
        title: 'A-B-C Island Style',
        artist: 'Likkle Legends',
        url: 'https://storage.googleapis.com/likkle-legends-public/radio/abc-island.mp3',
        channel: 'roti',
        cover_image_url: '/images/roti-new.jpg',
        island_origin: 'Caribbean',
        tier_required: 'free',
        duration_seconds: 145,
        status: 'audio_missing',
        source: 'gcs-public',
        notes: 'GCS 404 — recovered from scripts/seed-radio.ts',
    },
    {
        id: 'gcs-reggae-roti',
        title: 'Reggae Rhythms for Roti',
        artist: 'Mango Moko',
        url: 'https://storage.googleapis.com/likkle-legends-public/radio/reggae-roti.mp3',
        channel: 'roti',
        cover_image_url: '/images/mango_moko.png',
        island_origin: 'Caribbean',
        tier_required: 'free',
        duration_seconds: 220,
        status: 'audio_missing',
        source: 'gcs-public',
        notes: 'GCS 404 — recovered from scripts/seed-radio.ts',
    },
];

export function catalogSongToTrack(song: CatalogSong): Track {
    return {
        id: song.id,
        title: song.title,
        artist: song.artist,
        url: song.url,
        channel: song.channel,
        duration: song.duration_seconds,
    };
}

export function getPlayableCatalogTracks(): Track[] {
    return OWNED_PLAYABLE_SONGS.filter((song) => song.status === 'playable').map(catalogSongToTrack);
}

export function getPlayableCatalogSongs(): CatalogSong[] {
    return OWNED_PLAYABLE_SONGS.filter((song) => song.status === 'playable');
}

export function countPlayableTracksByChannel(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const song of getPlayableCatalogSongs()) {
        counts[song.channel] = (counts[song.channel] || 0) + 1;
    }
    return counts;
}

export function getRecoveredUnplayableInventory(): CatalogSong[] {
    return RECOVERED_UNPLAYABLE_SONGS;
}

export function getChannelsWithPlayableTracks() {
    const playable = getPlayableCatalogTracks();
    return RADIO_CHANNELS.filter((channel) => playable.some((track) => track.channel === channel.id));
}

const CHARACTER_CHANNEL: Record<string, string> = {
    roti: 'roti',
    'r.o.t.i.': 'roti',
    'r.o.t.i': 'roti',
    tanty_spice: 'tanty_spice',
    'tanty-spice': 'tanty_spice',
    tanty: 'tanty_spice',
    dilly_doubles: 'dilly_doubles',
    'dilly-doubles': 'dilly_doubles',
    dilly: 'dilly_doubles',
    steelpan_sam: 'steelpan_sam',
    'steelpan-sam': 'steelpan_sam',
    sam: 'steelpan_sam',
};

export function characterSlugToChannel(slugOrName?: string | null): string | null {
    if (!slugOrName) return null;
    const key = slugOrName.trim().toLowerCase();
    return CHARACTER_CHANNEL[key] || CHARACTER_CHANNEL[key.replace(/[\s.]+/g, '_')] || null;
}

export function getPlayableSongsForCharacter(slugOrName?: string | null): CatalogSong[] {
    const channel = characterSlugToChannel(slugOrName);
    if (!channel) return [];
    return getPlayableCatalogSongs().filter((song) => song.channel === channel);
}

export function isPlayableAudioUrl(url?: string | null): boolean {
    if (!url) return false;
    const trimmed = url.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('/assets/') || trimmed.startsWith('/audio/')) return true;
    if (trimmed.includes('cdn1.suno.ai') || trimmed.includes('cdn2.suno.ai')) return false;
    if (trimmed.includes('storage.googleapis.com/likkle-legends-public/radio/')) return false;
    if (trimmed.includes('soundhelix.com') || trimmed.includes('mixkit.co')) return false;
    return trimmed.startsWith('https://') || trimmed.startsWith('/');
}
