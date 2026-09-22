import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MUSIC_STORE_PRODUCTS } from '../lib/paypal';
import {
    amountsMatch,
    buildCustomId,
    clientSuppliedPriceFields,
    entitlementPlanFor,
    lookupMusicStoreProduct,
    sanitizeOrderMetadata,
} from '../lib/music-paypal';
import {
    OWNED_PLAYABLE_SONGS,
    RECOVERED_UNPLAYABLE_SONGS,
    filterPlayableTracks,
    getPlayableTracks,
    isOwnedPlayableUrl,
    musicCatalogScoreboard,
} from '../lib/song-catalog';
import { RADIO_TRACKS } from '../lib/constants';

describe('music catalog honesty', () => {
    it('RADIO_TRACKS is only owned playable files', () => {
        assert.equal(RADIO_TRACKS.length, OWNED_PLAYABLE_SONGS.length);
        for (const track of RADIO_TRACKS) {
            assert.equal(isOwnedPlayableUrl(track.url), true);
            assert.equal(track.url.includes('suno.ai'), false);
            assert.equal(track.url.includes('googleapis.com'), false);
        }
    });

    it('does not invent titles', () => {
        const scoreboard = musicCatalogScoreboard();
        assert.equal(scoreboard.invented, 0);
        assert.equal(scoreboard.playable, 2);
        assert.ok(scoreboard.inventoryMissing >= 9);
        assert.deepEqual(
            OWNED_PLAYABLE_SONGS.map((s) => s.title).sort(),
            ['Drinking Water', 'Saving Money']
        );
    });

    it('filters dead Suno/GCS rows out of playable lists', () => {
        const mixed = [
            ...getPlayableTracks(),
            { id: 'dead', title: 'Island Alphabet', artist: 'R.O.T.I', url: RECOVERED_UNPLAYABLE_SONGS[0].url },
        ];
        const playable = filterPlayableTracks(mixed);
        assert.equal(playable.length, 2);
        assert.equal(playable.some((t) => t.title === 'Island Alphabet'), false);
    });
});

describe('PayPal music upsells fail-closed', () => {
    it('uses server catalog prices for custom song and track products', () => {
        assert.equal(lookupMusicStoreProduct('custom_song_request')?.price, 24.99);
        assert.equal(lookupMusicStoreProduct('single_track')?.price, 0.99);
        assert.equal(lookupMusicStoreProduct('track_bundle_5')?.price, 3.99);
        assert.equal(lookupMusicStoreProduct('not_a_product'), null);
        assert.equal(MUSIC_STORE_PRODUCTS.custom_song_request.price, 24.99);
    });

    it('rejects client-supplied amount/tier fields', () => {
        assert.deepEqual(clientSuppliedPriceFields({ productId: 'custom_song_request', amount: 1 }), ['amount']);
        assert.deepEqual(clientSuppliedPriceFields({ productId: 'custom_song_request', tier: 'legend' }), ['tier']);
        assert.deepEqual(clientSuppliedPriceFields({ productId: 'custom_song_request' }), []);
    });

    it('strips price fields from PayPal custom_id metadata', () => {
        const customId = JSON.parse(buildCustomId({
            userId: 'user-1',
            productId: 'custom_song_request',
            metadata: {
                child_name: 'Maya',
                event_type: 'birthday',
                amount: 1,
                price: 0.01,
                tier: 'legend',
            },
        }));
        assert.equal(customId.child_name, 'Maya');
        assert.equal(customId.amount, undefined);
        assert.equal(customId.price, undefined);
        assert.equal(customId.tier, undefined);
        assert.equal(customId.productId, 'custom_song_request');
    });

    it('verifies capture amount against catalog and names entitlement tables', () => {
        assert.equal(amountsMatch(24.99, 24.99), true);
        assert.equal(amountsMatch(1, 24.99), false);
        assert.deepEqual(entitlementPlanFor('custom_song_request').tables, ['custom_song_orders', 'custom_song_requests']);
        assert.deepEqual(entitlementPlanFor('single_track').tables, ['purchased_content', 'music_purchases']);
        assert.deepEqual(entitlementPlanFor('track_bundle_5').tables, ['purchased_content']);
    });

    it('sanitizeOrderMetadata drops forbidden keys', () => {
        const clean = sanitizeOrderMetadata({
            child_name: 'Kai',
            userId: 'attacker',
            productId: 'single_track',
            amount: 0.01,
        });
        assert.deepEqual(clean, { child_name: 'Kai' });
    });
});
