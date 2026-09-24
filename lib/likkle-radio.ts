/**
 * Likkle Radio stations.
 *
 * Playlists are built only from the free owned catalog (lib/song-catalog.ts).
 * A new song shows up on a station when its `channel` is listed on that station.
 * Stations with no matching file stay empty. Nothing here invents a track.
 */
import { LANDING_CAST } from '@/lib/landing-cast';
import { getPlayableCatalogSongs, type CatalogSong } from '@/lib/song-catalog';

export const LIKKLE_AUDIO_EVENT = 'likkle:audio-play';
export const LIKKLE_RADIO_SOURCE = 'likkle-radio';

export type LikkleRadioStation = {
    id: string;
    name: string;
    shortName: string;
    theme: string;
    /** Character id from the published landing cast. Art comes from that record. */
    djId: string;
    /** Existing character line. Not a claim that a show is broadcasting live. */
    intro: string;
    /** Song catalog `channel` values that belong on this station. */
    channels: readonly string[];
};

export const LIKKLE_RADIO_STATIONS: readonly LikkleRadioStation[] = [
    {
        id: 'sing-along',
        name: 'Sing-Along Lab',
        shortName: 'Sing-Along',
        theme: 'Learning songs',
        djId: 'roti',
        intro: 'Beep boop! Brains on — sunshine mode.',
        channels: ['roti', 'educational', 'lesson', 'learning'],
    },
    {
        id: 'island-vibes',
        name: 'Island Vibes',
        shortName: 'Island Vibes',
        theme: 'Island rhythms',
        djId: 'steelpan_sam',
        intro: 'Everything in the world has a beat.',
        channels: ['steelpan_sam', 'music', 'soca'],
    },
    {
        id: 'story-bench',
        name: 'Story Bench',
        shortName: 'Stories',
        theme: 'Stories',
        djId: 'tanty_spice',
        intro: 'Come nuh, sit down wid me.',
        channels: ['tanty_spice', 'story', 'culture', 'tanty'],
    },
    {
        id: 'calm-cove',
        name: 'Calm Cove',
        shortName: 'Calm Cove',
        theme: 'Bedtime and calm',
        djId: 'benny_of_shadows',
        intro: 'Notice the little wonders.',
        channels: ['calm', 'lullaby', 'bedtime', 'benny_of_shadows'],
    },
    {
        id: 'playtime',
        name: "Dilly's Playtime",
        shortName: 'Playtime',
        theme: 'Playful songs',
        djId: 'dilly_doubles',
        intro: 'Ready for a Caribbean journey?',
        channels: ['dilly_doubles', 'dilly', 'food'],
    },
] as const;

export type LikkleRadioDj = {
    id: string;
    name: string;
    role: string;
    image: string;
    color: string;
};

export type LikkleRadioTrack = {
    id: string;
    title: string;
    artist: string;
    url: string;
    artwork: string;
    channel: string;
};

export type LikkleRadioPlaylistNote = {
    primary: string;
    moreComing: boolean;
};

const OWNED_AUDIO_PREFIX = '/assets/youtube/music/';

export function getLikkleRadioDj(djId: string): LikkleRadioDj | null {
    const character = LANDING_CAST.find((entry) => entry.id === djId);
    if (!character) return null;
    return {
        id: character.id,
        name: character.name,
        role: character.role,
        image: character.image,
        color: character.color,
    };
}

export function isOwnedRadioUrl(url: string | null | undefined): boolean {
    return typeof url === 'string' && url.startsWith(OWNED_AUDIO_PREFIX);
}

export function stationIdForChannel(channel: string | null | undefined): string | null {
    const value = String(channel || '').trim().toLowerCase();
    if (!value) return null;
    const station = LIKKLE_RADIO_STATIONS.find((entry) => entry.channels.includes(value));
    return station?.id ?? null;
}

function artworkFor(song: CatalogSong, dj: LikkleRadioDj | null): string {
    if (song.cover_image_url && song.cover_image_url.startsWith('/images/')) return song.cover_image_url;
    return dj?.image || '/images/logo.png';
}

export function tracksForStation(stationId: string, songs: readonly CatalogSong[]): LikkleRadioTrack[] {
    const station = LIKKLE_RADIO_STATIONS.find((entry) => entry.id === stationId);
    if (!station) return [];
    const dj = getLikkleRadioDj(station.djId);
    const seen = new Set<string>();
    const tracks: LikkleRadioTrack[] = [];
    for (const song of songs) {
        if (song.status !== 'playable') continue;
        if (!isOwnedRadioUrl(song.url)) continue;
        if (stationIdForChannel(song.channel) !== station.id) continue;
        if (seen.has(song.id)) continue;
        seen.add(song.id);
        tracks.push({
            id: song.id,
            title: song.title,
            artist: song.artist,
            url: song.url,
            artwork: artworkFor(song, dj),
            channel: song.channel,
        });
    }
    return tracks;
}

export function buildLikkleRadioPlaylists(
    songs: readonly CatalogSong[] = getPlayableCatalogSongs(),
): Record<string, LikkleRadioTrack[]> {
    return Object.fromEntries(
        LIKKLE_RADIO_STATIONS.map((station) => [station.id, tracksForStation(station.id, songs)]),
    );
}

export function stationPlaylistNote(count: number): LikkleRadioPlaylistNote {
    if (count <= 0) {
        return { primary: 'More songs coming', moreComing: true };
    }
    if (count === 1) {
        return {
            primary: '1 song on this station. It starts again when it ends.',
            moreComing: true,
        };
    }
    return {
        primary: `${count} songs on this station.`,
        moreComing: count < 3,
    };
}

/** Wrap inside the real playlist. An empty station does not invent an index. */
export function stepTrack(index: number, count: number, direction: -1 | 1): number {
    if (count <= 0) return 0;
    const current = Number.isFinite(index) ? index : 0;
    return (current + direction + count) % count;
}

export function announceLikkleAudio(source: string) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(LIKKLE_AUDIO_EVENT, { detail: { source } }));
}
