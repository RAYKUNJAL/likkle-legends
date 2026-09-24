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

/**
 * First-party audio that exists in this repo under public/assets/youtube/music/.
 * Do not add a title here unless the file is in the tree.
 */
export const OWNED_PLAYABLE_SONGS: CatalogSong[] = [
    {
        id: 'owned-drinking-water',
        title: 'Drinking Water',
        artist: 'Likkle Legends',
        url: '/assets/youtube/music/drinking-water.mp3',
        streamUrl: '/assets/youtube/music/drinking-water.stream.mp3',
        channel: 'roti',
        cover_image_url: '/images/roti-new.jpg',
        island_origin: 'Caribbean',
        status: 'playable',
        source: 'owned-asset',
        notes: 'Owned file at public/assets/youtube/music/drinking-water.mp3.',
    },
    {
        id: 'owned-saving-money',
        title: 'Saving Money',
        artist: 'Likkle Legends',
        url: '/assets/youtube/music/saving-money.mp3',
        streamUrl: '/assets/youtube/music/saving-money.stream.mp3',
        channel: 'tanty_spice',
        cover_image_url: '/images/tanty_spice_avatar.jpg',
        island_origin: 'Caribbean',
        status: 'playable',
        source: 'owned-asset',
        notes: 'Owned file at public/assets/youtube/music/saving-money.mp3.',
    },
];

/**
 * Titles recovered from older radio seeds. The audio hosts returned 403/404
 * and the files are not in this repo. Inventory only — never streamed or sold.
 */
export const RECOVERED_UNPLAYABLE_SONGS: CatalogSong[] = [
    { id: 'track-roti-1', title: 'Island Alphabet', artist: 'R.O.T.I', url: 'https://cdn1.suno.ai/614d60d0-dce6-4fdf-8c65-4f6efdec40a3.mp3', channel: 'roti', status: 'audio_missing', source: 'suno-cdn', notes: 'Suno CDN unavailable. No owned file.' },
    { id: 'track-roti-2', title: 'Island Counting', artist: 'R.O.T.I', url: 'https://cdn1.suno.ai/d85cfbfe-41ac-4694-9000-54b8ab87f460.mp3', channel: 'roti', status: 'audio_missing', source: 'suno-cdn', notes: 'Suno CDN unavailable. No owned file.' },
    { id: 'track-roti-3', title: 'Likkle Legends Jingle', artist: 'R.O.T.I', url: 'https://cdn1.suno.ai/b792349c-09ad-4d94-8e96-ef4077b39209.mp3', channel: 'roti', status: 'audio_missing', source: 'suno-cdn', notes: 'Suno CDN unavailable. No owned file.' },
    { id: 'track-tanty-1', title: 'Coco Water', artist: 'Tanty Spice', url: 'https://cdn1.suno.ai/ed6d7539-ed37-4f21-a06c-73142ea2129d.mp3', channel: 'tanty_spice', status: 'audio_missing', source: 'suno-cdn', notes: 'Suno CDN unavailable. No owned file.' },
    { id: 'track-tanty-2', title: 'Sorell Drink', artist: 'Tanty Spice', url: 'https://cdn1.suno.ai/3f649c16-75ff-43de-99d6-17e4534d716b.mp3', channel: 'tanty_spice', status: 'audio_missing', source: 'suno-cdn', notes: 'Suno CDN unavailable. No owned file.' },
    { id: 'track-dilly-1', title: 'Angry Rooster', artist: 'Dilly Doubles', url: 'https://cdn1.suno.ai/c5e7a4d5-3154-4a42-9106-e33f446b9b4b.mp3', channel: 'dilly_doubles', status: 'audio_missing', source: 'suno-cdn', notes: 'Suno CDN unavailable. No owned file.' },
    { id: 'track-dilly-2', title: 'Island Monkeys', artist: 'Dilly Doubles', url: 'https://cdn1.suno.ai/6d2d490e-2cd6-4593-898d-ee6c82d7b4b8.mp3', channel: 'dilly_doubles', status: 'audio_missing', source: 'suno-cdn', notes: 'Suno CDN unavailable. No owned file.' },
    { id: 'track-sam-1', title: 'Island Parrots', artist: 'Steelpan Sam', url: 'https://cdn1.suno.ai/ee0e94a6-d116-4116-992e-7ecb8fd76109.mp3', channel: 'steelpan_sam', status: 'audio_missing', source: 'suno-cdn', notes: 'Suno CDN unavailable. No owned file.' },
    { id: 'track-sam-2', title: 'Iguana Song', artist: 'Steelpan Sam', url: 'https://cdn1.suno.ai/0303769f-299a-40dd-bc6a-890c405dbb07.mp3', channel: 'steelpan_sam', status: 'audio_missing', source: 'suno-cdn', notes: 'Suno CDN unavailable. No owned file.' },
    { id: 'gcs-morning-calypso', title: "Tanty's Morning Calypso", artist: 'Likkle Legends', url: 'https://storage.googleapis.com/likkle-legends-public/radio/morning-calypso.mp3', channel: 'tanty_spice', status: 'audio_missing', source: 'gcs-public', notes: 'GCS object missing. Title only, from scripts/seed-radio.ts.' },
    { id: 'gcs-anansi-story', title: 'The Legend of Anansi', artist: 'Caribbean Storytellers', url: 'https://storage.googleapis.com/likkle-legends-public/radio/anansi-story.mp3', channel: 'tanty_spice', status: 'audio_missing', source: 'gcs-public', notes: 'GCS object missing. Title only, from scripts/seed-radio.ts.' },
    { id: 'gcs-island-lullaby', title: 'Island Lullaby (Soft Steelpan)', artist: 'Steelpan Sam', url: 'https://storage.googleapis.com/likkle-legends-public/radio/island-lullaby.mp3', channel: 'steelpan_sam', status: 'audio_missing', source: 'gcs-public', notes: 'GCS object missing. Title only, from scripts/seed-radio.ts.' },
    { id: 'gcs-abc-island', title: 'A-B-C Island Style', artist: 'Likkle Legends', url: 'https://storage.googleapis.com/likkle-legends-public/radio/abc-island.mp3', channel: 'roti', status: 'audio_missing', source: 'gcs-public', notes: 'GCS object missing. Title only, from scripts/seed-radio.ts.' },
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
