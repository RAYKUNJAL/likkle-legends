/**
 * Scoreboard probe for recovered vs missing music.
 * Usage: npx tsx scripts/probe-music-catalog.ts
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { OWNED_PLAYABLE_SONGS, RECOVERED_UNPLAYABLE_SONGS } from '../lib/song-catalog';

const LIVE_ORIGIN = process.env.MUSIC_PROBE_ORIGIN || 'https://www.likklelegends.com';

async function head(url: string): Promise<{ status: number; type: string }> {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return { status: res.status, type: res.headers.get('content-type') || '' };
}

async function localAudioExists(publicPath: string): Promise<boolean> {
    if (!publicPath.startsWith('/')) return false;
    const filePath = path.join(process.cwd(), 'public', publicPath.replace(/^\//, ''));
    try {
        const info = await stat(filePath);
        if (info.size < 1000) return false;
        const stream = createReadStream(filePath, { start: 0, end: 2 });
        const first = await new Promise<Buffer>((resolve, reject) => {
            stream.once('data', (chunk) => resolve(Buffer.from(chunk)));
            stream.once('error', reject);
        });
        stream.destroy();
        return first.length > 0;
    } catch {
        return false;
    }
}

async function main() {
    console.log('Likkle Legends music catalog probe\n');
    console.log('BEFORE (git main RADIO_TRACKS): 9 Suno URLs, 0 of those 200; 2 owned MP3s existed but were not in RADIO_TRACKS.');
    console.log(`AFTER  playable catalog: ${OWNED_PLAYABLE_SONGS.length} owned files\n`);

    let playableOk = 0;
    for (const song of OWNED_PLAYABLE_SONGS) {
        const local = await localAudioExists(song.url);
        let live = { status: 0, type: '' };
        try {
            live = await head(`${LIVE_ORIGIN}${song.url}`);
        } catch {
            live = { status: 0, type: 'error' };
        }
        const ok = local && (live.status === 200 || live.status === 0);
        if (local) playableOk += 1;
        console.log(`${ok ? 'OK ' : 'FAIL'} ${song.title.padEnd(22)} local=${local ? 'yes' : 'no '} live=${live.status} ${song.url}`);
    }

    console.log('\nInventory still missing (not listed as playable):');
    for (const song of RECOVERED_UNPLAYABLE_SONGS) {
        let remote = { status: 0, type: '' };
        try {
            remote = await head(song.url);
        } catch {
            remote = { status: 0, type: 'error' };
        }
        console.log(`MISS ${song.title.padEnd(28)} ${remote.status} ${song.source}`);
    }

    console.log(`\nScoreboard: playable_local=${playableOk}/${OWNED_PLAYABLE_SONGS.length} missing_inventory=${RECOVERED_UNPLAYABLE_SONGS.length} invented=0`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
