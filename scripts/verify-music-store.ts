/**
 * Offline checks for free listening and parent music purchases.
 * Does not call PayPal and does not unlock anything.
 */
import fs from 'fs';
import path from 'path';
import { RADIO_TRACKS } from '../lib/constants';
import { buildFreeFallbackTracks } from '../lib/radio-stations';
import { isChildRoute } from '../lib/paypal-offers';
import {
    CUSTOM_SONG_PRICE,
    CUSTOM_SONG_SKU,
    MUSIC_DOWNLOAD_BUNDLE_PRICE,
    MUSIC_DOWNLOAD_BUNDLE_SKU,
    MUSIC_DOWNLOAD_PRICE,
    MUSIC_DOWNLOAD_SKU,
    clientSuppliedPriceFields,
    decideDownloadCreditRedeem,
    decideMusicGrant,
    musicCustomId,
    musicDownloadEntitlement,
} from '../lib/music-store';
import {
    getPlayableCatalogSongs,
    getPlayableTracks,
    musicCatalogScoreboard,
    streamPathIsUngated,
} from '../lib/song-catalog';

function assert(condition: unknown, message: string) {
    if (!condition) throw new Error(message);
}

const buyer = '11111111-1111-4111-8111-111111111111';
const requestId = '22222222-2222-4222-8222-222222222222';
const track = getPlayableCatalogSongs()[0];
assert(track, 'at least one owned track');

assert(MUSIC_DOWNLOAD_PRICE === 1, 'download price is $1.00');
assert(CUSTOM_SONG_PRICE === 24.99, 'custom song price is $24.99');
assert(MUSIC_DOWNLOAD_BUNDLE_PRICE === 4, 'bundle price is $4.00');

const downloadCustomId = musicCustomId(buyer, MUSIC_DOWNLOAD_SKU, track.id);
assert(decideMusicGrant({
    captureStatus: 'COMPLETED',
    capturedAmount: 1,
    currency: 'USD',
    customId: downloadCustomId,
    buyerUserId: buyer,
}).ok, 'verified $1 capture grants a download');

const granted = decideMusicGrant({
    captureStatus: 'COMPLETED',
    capturedAmount: 1,
    currency: 'USD',
    customId: downloadCustomId,
    buyerUserId: buyer,
});
assert(granted.ok && granted.kind === 'download' && granted.entitlement === musicDownloadEntitlement(track.id), 'entitlement key is music_download:<trackId>');

assert(!decideMusicGrant({
    captureStatus: 'COMPLETED',
    capturedAmount: 0.99,
    currency: 'USD',
    customId: downloadCustomId,
    buyerUserId: buyer,
}).ok, 'old 0.99 amount does not grant');

assert(!decideMusicGrant({
    captureStatus: 'PENDING',
    capturedAmount: 1,
    currency: 'USD',
    customId: downloadCustomId,
    buyerUserId: buyer,
}).ok, 'pending capture does not grant');

assert(!decideMusicGrant({
    captureStatus: 'COMPLETED',
    capturedAmount: 1,
    currency: 'USD',
    customId: downloadCustomId,
    buyerUserId: 'someone-else',
}).ok, 'buyer mismatch does not grant');

assert(!decideMusicGrant({
    captureStatus: 'COMPLETED',
    capturedAmount: 1,
    currency: 'USD',
    customId: musicCustomId(buyer, MUSIC_DOWNLOAD_SKU, 'invented-track'),
    buyerUserId: buyer,
}).ok, 'unknown track does not grant');

assert(decideMusicGrant({
    captureStatus: 'COMPLETED',
    capturedAmount: 24.99,
    currency: 'USD',
    customId: musicCustomId(buyer, CUSTOM_SONG_SKU, requestId),
    buyerUserId: buyer,
}).ok, 'verified custom song capture can be marked paid');

assert(!decideMusicGrant({
    captureStatus: 'COMPLETED',
    capturedAmount: 9.99,
    currency: 'USD',
    customId: musicCustomId(buyer, CUSTOM_SONG_SKU, requestId),
    buyerUserId: buyer,
}).ok, 'column default 9.99 does not grant');

assert(!decideMusicGrant({
    captureStatus: 'COMPLETED',
    capturedAmount: 24.99,
    currency: 'USD',
    customId: `${buyer}:${CUSTOM_SONG_SKU}`,
    buyerUserId: buyer,
}).ok, 'custom song without a server request id does not grant');

assert(decideMusicGrant({
    captureStatus: 'COMPLETED',
    capturedAmount: 4,
    currency: 'USD',
    customId: musicCustomId(buyer, MUSIC_DOWNLOAD_BUNDLE_SKU),
    buyerUserId: buyer,
}).ok, 'verified bundle grants licenses');

assert(clientSuppliedPriceFields({ sku: MUSIC_DOWNLOAD_SKU, amount: 0.01 }).includes('amount'), 'client amount is rejected');
assert(clientSuppliedPriceFields({ metadata: { price: 1 } }).includes('metadata.price'), 'nested client price is rejected');
assert(clientSuppliedPriceFields({ sku: MUSIC_DOWNLOAD_SKU, trackId: track.id }).length === 0, 'track id is not a price');

assert(decideDownloadCreditRedeem({ trackId: track.id, creditsRemaining: 0, alreadyOwned: false }).ok === false, 'no credits does not unlock');
assert(decideDownloadCreditRedeem({ trackId: 'not-a-song', creditsRemaining: 5, alreadyOwned: false }).ok === false, 'credit cannot invent a track');
assert(decideDownloadCreditRedeem({ trackId: track.id, creditsRemaining: 2, alreadyOwned: false }).ok, 'credit can apply to an owned file');

const scoreboard = musicCatalogScoreboard();
assert(scoreboard.playable === 2 && scoreboard.invented === 0, 'catalog is the two owned files');
for (const song of getPlayableCatalogSongs()) {
    const filePath = path.join(process.cwd(), 'public', song.url.replace(/^\//, ''));
    assert(fs.existsSync(filePath), `missing audio file ${song.url}`);
    assert(streamPathIsUngated(song.url), `stream stays ungated ${song.url}`);
    assert(!song.url.includes('suno') && !song.url.includes('paypal'), 'playable url is a local file');
}
assert(getPlayableTracks().every((item) => streamPathIsUngated(item.url)), 'radio tracks are the free catalog');
assert(RADIO_TRACKS.length === getPlayableTracks().length, 'RADIO_TRACKS matches owned files');
assert(RADIO_TRACKS.every((item) => streamPathIsUngated(item.url)), 'RADIO_TRACKS are ungated');
assert(buildFreeFallbackTracks().every((item) => !item.title.includes('Reprise')), 'fallback does not invent a reprise');
assert(!buildFreeFallbackTracks().some((item) => item.url.includes('suno.ai')), 'fallback does not use missing Suno audio');

assert(isChildRoute('/portal/music'), 'kid music hub is a child route');
assert(isChildRoute('/portal/songs'), 'kid songs page is a child route');
assert(!isChildRoute('/parent/music'), 'music store is a parent route');
assert(!isChildRoute('/parent/music/custom'), 'custom songs are a parent route');

const kidMusic = fs.readFileSync(path.join(process.cwd(), 'app/portal/music/page.tsx'), 'utf8');
const kidSongs = fs.readFileSync(path.join(process.cwd(), 'app/portal/songs/SongsClient.tsx'), 'utf8');
for (const source of [kidMusic, kidSongs]) {
    assert(!source.includes('PayPal'), 'kid music surface has no PayPal');
    assert(!source.includes('create-order'), 'kid music surface does not start checkout');
    assert(!source.includes('$1') && !source.includes('24.99') && !source.includes('0.99'), 'kid music surface has no prices');
}

console.log('music store checks passed');
console.log(JSON.stringify({
    skus: {
        [MUSIC_DOWNLOAD_SKU]: MUSIC_DOWNLOAD_PRICE,
        [MUSIC_DOWNLOAD_BUNDLE_SKU]: MUSIC_DOWNLOAD_BUNDLE_PRICE,
        [CUSTOM_SONG_SKU]: CUSTOM_SONG_PRICE,
    },
    playable: getPlayableCatalogSongs().map((song) => song.url),
    missingInventory: scoreboard.inventoryMissing,
}, null, 2));
