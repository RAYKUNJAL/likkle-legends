/**
 * Offline checks for Likkle Radio.
 * Stations use published characters. Playlists use owned audio only.
 */
import fs from 'fs';
import path from 'path';
import { LANDING_CAST } from '../lib/landing-cast';
import {
    LIKKLE_RADIO_STATIONS,
    buildLikkleRadioPlaylists,
    getLikkleRadioDj,
    stationIdForChannel,
    stationPlaylistNote,
    stepTrack,
    tracksForStation,
} from '../lib/likkle-radio';
import { OWNED_PLAYABLE_SONGS, RECOVERED_UNPLAYABLE_SONGS, getPlayableCatalogSongs, playbackUrl, type CatalogSong } from '../lib/song-catalog';

function assert(condition: unknown, message: string) {
    if (!condition) throw new Error(message);
}

const root = process.cwd();
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8');

assert(LIKKLE_RADIO_STATIONS.length >= 4, 'several stations');
const djIds = LIKKLE_RADIO_STATIONS.map((station) => station.djId);
assert(new Set(djIds).size === djIds.length, 'one DJ per station');

for (const station of LIKKLE_RADIO_STATIONS) {
    const dj = getLikkleRadioDj(station.djId);
    assert(dj, `DJ ${station.djId} is in the landing cast`);
    const cast = LANDING_CAST.find((entry) => entry.id === station.djId);
    assert(cast && dj!.image === cast.image, `${station.djId} uses the published artwork path`);
    const file = path.join(root, 'public', dj!.image.replace(/^\//, ''));
    assert(fs.existsSync(file), `artwork exists for ${station.djId}`);
    assert(!station.intro.toLowerCase().includes('listener'), 'no fake listener line');
}

const playlists = buildLikkleRadioPlaylists();
const allTracks = Object.values(playlists).flat();
assert(allTracks.length === getPlayableCatalogSongs().length, 'every owned song is on one station');
assert(new Set(allTracks.map((track) => track.id)).size === allTracks.length, 'a song is not copied onto two stations');

for (const track of allTracks) {
    assert(track.url.startsWith('/assets/youtube/music/'), `owned url ${track.url}`);
    assert(!track.url.includes('suno') && !track.url.includes('storage.googleapis.com'), 'no missing remote audio');
    const file = path.join(root, 'public', track.url.replace(/^\//, ''));
    assert(fs.existsSync(file), `audio file exists ${track.url}`);
}

assert(playlists['sing-along']?.some((track) => track.url.endsWith('/drinking-water.stream.mp3')), 'Drinking Water streams on Sing-Along Lab');
assert(playlists['story-bench']?.some((track) => track.url.endsWith('/saving-money.stream.mp3')), 'Saving Money streams on Tanty’s station');
for (const song of getPlayableCatalogSongs()) {
    const listed = allTracks.find((track) => track.id === song.id);
    assert(listed?.url === playbackUrl(song), `${song.id} uses the same stream rendition as parent music`);
    assert(listed?.url !== song.url, `${song.id} playback is not the master`);
    const streamBytes = fs.statSync(path.join(root, 'public', listed!.url.replace(/^\//, ''))).size;
    const masterBytes = fs.statSync(path.join(root, 'public', song.url.replace(/^\//, ''))).size;
    assert(streamBytes < masterBytes, `${song.id} stream is smaller than the master`);
}
const downloadRoute = read('app/api/music/download/[trackId]/route.ts');
assert(downloadRoute.includes('track.url'), 'paid download reads the master file');
assert(!downloadRoute.includes('playbackUrl') && !downloadRoute.includes('.stream.mp3'), 'paid download does not serve the stream rendition');
assert((playlists['island-vibes'] ?? []).length === 0, 'Island Vibes does not invent tracks');
assert((playlists['calm-cove'] ?? []).length === 0, 'Calm Cove does not invent tracks');
assert((playlists['playtime'] ?? []).length === 0, 'Playtime does not invent tracks');

const mixed: CatalogSong[] = [
    ...OWNED_PLAYABLE_SONGS,
    ...RECOVERED_UNPLAYABLE_SONGS,
    {
        id: 'future-calm',
        title: 'Future Calm Song',
        artist: 'Likkle Legends',
        url: '/assets/youtube/music/future-calm.mp3',
        channel: 'lullaby',
        status: 'playable',
        source: 'owned-asset',
    },
];
const calm = tracksForStation('calm-cove', mixed);
assert(calm.length === 1 && calm[0].id === 'future-calm', 'a new lullaby channel slots onto Calm Cove');
assert(tracksForStation('sing-along', mixed).every((track) => track.id !== 'future-calm'), 'lullaby does not land on Sing-Along');
assert(tracksForStation('island-vibes', RECOVERED_UNPLAYABLE_SONGS).length === 0, 'missing audio is not offered');
assert(stationIdForChannel('unknown-channel') === null, 'unknown channels are not forced onto a station');
assert(stationIdForChannel('roti') === 'sing-along', 'roti channel maps to Sing-Along');
assert(stationIdForChannel('dilly_doubles') === 'playtime', 'dilly channel maps to Playtime');

assert(stationPlaylistNote(0).primary === 'More songs coming', 'empty station says more songs coming');
assert(stationPlaylistNote(1).primary.includes('starts again'), 'one song loops honestly');
assert(stepTrack(0, 1, 1) === 0, 'single song wraps to itself');
assert(stepTrack(0, 2, 1) === 1, 'next moves forward');
assert(stepTrack(0, 2, -1) === 1, 'previous wraps');
assert(stepTrack(0, 0, 1) === 0, 'empty playlist does not invent an index');

const player = read('components/radio/LikkleRadioPlayer.tsx');
const showcase = read('components/landing-v5/RadioShowcase.tsx');
const landing = read('components/landing-v5/LandingPage.tsx');
// The parent store body lives in ParentMusicStore.tsx; page.tsx mounts it.
const parentMusic = read('app/parent/music/page.tsx') + '\n' + read('app/parent/music/ParentMusicStore.tsx');
const radioPage = read('app/radio/page.tsx');
const kidMusic = read('app/portal/music/page.tsx');

for (const source of [player, showcase, radioPage]) {
    assert(!source.includes('PayPal') && !source.includes('create-order'), 'radio surface does not start checkout');
    assert(!source.includes('$1') && !source.includes('24.99') && !source.includes('0.99'), 'radio surface has no prices');
    assert(!/listeners|listener count|people listening|tuned in/i.test(source), 'radio surface has no listener count');
    assert(!source.includes('Live-capable') && !source.includes('live broadcast'), 'radio surface does not claim a live show');
}
assert(player.includes('preload="metadata"'), 'active audio preloads metadata');
assert(player.includes("loading={selected ? 'eager' : 'lazy'}"), 'non-active station art is lazy');
assert((player.match(/<audio/g) || []).length === 1, 'one audio element');
assert(player.includes('prefers-reduced-motion'), 'motion preference is read');
assert(showcase.includes('id="radio"') && showcase.includes('LikkleRadioPlayer'), 'landing section keeps the radio anchor and mounts the player');
assert(landing.includes('<RadioShowcase />') && landing.includes('<OriginalSongs />'), 'landing keeps radio and the other sections');
assert(parentMusic.includes('LikkleRadioPlayer'), 'parent music page uses the player');
assert(parentMusic.includes('Download for $') || parentMusic.includes('MUSIC_DOWNLOAD_PRICE'), 'parent download CTA stays on the parent page');
assert(!kidMusic.includes('LikkleRadioPlayer') || (!kidMusic.includes('$1') && !kidMusic.includes('PayPal')), 'kid music has no purchase prompt from the player');
assert(radioPage.includes('LikkleRadioPlayer'), 'public radio page uses the player');
assert(!radioPage.includes('Live-capable'), 'public radio page dropped the live claim');

console.log('likkle radio checks passed');
console.log(JSON.stringify({
    stations: LIKKLE_RADIO_STATIONS.map((station) => ({
        id: station.id,
        name: station.name,
        dj: getLikkleRadioDj(station.djId)?.name,
        tracks: (playlists[station.id] ?? []).map((track) => track.title),
    })),
}, null, 2));
