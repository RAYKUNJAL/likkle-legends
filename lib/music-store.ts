/**
 * Parent music commerce catalog.
 *
 * Listening is free. These SKUs sell a download license or a custom-song
 * commission. Prices live here. Callers must ignore any client amount.
 *
 * Price choices:
 * - music_download_1 is $1.00. Ray locked the download license at one dollar
 *   (the older MUSIC_STORE_PRODUCTS.single_track price was $0.99 and is not used).
 * - music_download_bundle_5 is $4.00 for five download licenses. It uses the
 *   same grant rules as a single track. Licenses apply only to owned playable
 *   files. Unused licenses stay on the parent account.
 * - custom_song_request is $24.99, the price already defined on
 *   MUSIC_STORE_PRODUCTS.custom_song_request. The custom_song_orders.price_paid
 *   column default of 9.99 is not the catalog price.
 */

import { amountsMatch, parsePackCustomId } from '@/lib/paypal-offers';
import { getPlayableSong } from '@/lib/song-catalog';

export const MUSIC_DOWNLOAD_SKU = 'music_download_1';
export const MUSIC_DOWNLOAD_BUNDLE_SKU = 'music_download_bundle_5';
export const CUSTOM_SONG_SKU = 'custom_song_request';

export const MUSIC_DOWNLOAD_PRICE = 1;
export const MUSIC_DOWNLOAD_BUNDLE_PRICE = 4;
export const MUSIC_DOWNLOAD_BUNDLE_CREDITS = 5;
export const CUSTOM_SONG_PRICE = 24.99;
export const CUSTOM_SONG_STYLE = 'Caribbean kids';
export const MUSIC_DOWNLOAD_CREDITS_KEY = 'music_download_credits';

export const MUSIC_OCCASIONS = ['birthday', 'event', 'other'] as const;
export type MusicOccasion = (typeof MUSIC_OCCASIONS)[number];

const CLIENT_PRICE_KEYS = ['amount', 'price', 'value', 'price_paid', 'amount_paid', 'tier', 'planId', 'plan_id'] as const;

export type MusicSku =
    | typeof MUSIC_DOWNLOAD_SKU
    | typeof MUSIC_DOWNLOAD_BUNDLE_SKU
    | typeof CUSTOM_SONG_SKU;

export function isMusicSku(sku: string | null | undefined): sku is MusicSku {
    return sku === MUSIC_DOWNLOAD_SKU || sku === MUSIC_DOWNLOAD_BUNDLE_SKU || sku === CUSTOM_SONG_SKU;
}

export function musicDownloadEntitlement(trackId: string): string {
    return `music_download:${trackId}`;
}

export function priceForMusicSku(sku: string | null | undefined): number | null {
    if (sku === MUSIC_DOWNLOAD_SKU) return MUSIC_DOWNLOAD_PRICE;
    if (sku === MUSIC_DOWNLOAD_BUNDLE_SKU) return MUSIC_DOWNLOAD_BUNDLE_PRICE;
    if (sku === CUSTOM_SONG_SKU) return CUSTOM_SONG_PRICE;
    return null;
}

export function musicSkuName(sku: MusicSku): string {
    if (sku === MUSIC_DOWNLOAD_SKU) return 'Song download license';
    if (sku === MUSIC_DOWNLOAD_BUNDLE_SKU) return '5 download licenses';
    return 'Custom Caribbean kids song';
}

export function clientSuppliedPriceFields(body: Record<string, unknown> | null | undefined): string[] {
    if (!body || typeof body !== 'object') return [];
    const found: string[] = CLIENT_PRICE_KEYS.filter((key) => body[key] != null);
    const metadata = body.metadata;
    if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
        const meta = metadata as Record<string, unknown>;
        for (const key of CLIENT_PRICE_KEYS) {
            if (meta[key] != null) found.push(`metadata.${key}`);
        }
    }
    return found;
}

export function normalizeOccasion(value: unknown): MusicOccasion | null {
    if (typeof value !== 'string') return null;
    const occasion = value.trim().toLowerCase();
    if (occasion === 'birthday' || occasion === 'event' || occasion === 'other') return occasion;
    return null;
}

const TRACK_ID = /^[a-z0-9-]{1,64}$/;
const REQUEST_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function musicCustomId(userId: string, sku: MusicSku, extra?: string): string {
    const raw = extra ? `${userId}:${sku}:${extra}` : `${userId}:${sku}`;
    if (raw.length > 127) {
        throw new Error('PayPal custom id is too long');
    }
    return raw;
}

export type MusicGrant =
    | { ok: true; kind: 'download'; sku: typeof MUSIC_DOWNLOAD_SKU; trackId: string; entitlement: string; price: number }
    | { ok: true; kind: 'bundle'; sku: typeof MUSIC_DOWNLOAD_BUNDLE_SKU; credits: number; price: number }
    | { ok: true; kind: 'custom_song'; sku: typeof CUSTOM_SONG_SKU; requestId: string; price: number }
    | { ok: false; reason: string };

/**
 * Fail-closed grant decision. The captured amount must match the catalog.
 * There is no amount argument from the client.
 */
export function decideMusicGrant(input: {
    captureStatus: string | null | undefined;
    capturedAmount: number;
    currency: string | null | undefined;
    customId: string | null | undefined;
    buyerUserId: string;
}): MusicGrant {
    const parsed = parsePackCustomId(input.customId);
    if (!parsed || !isMusicSku(parsed.sku)) {
        return { ok: false, reason: 'unknown_offer' };
    }
    if (String(input.captureStatus || '').toUpperCase() !== 'COMPLETED') {
        return { ok: false, reason: 'capture_not_completed' };
    }
    if (String(input.currency || '').toUpperCase() !== 'USD') {
        return { ok: false, reason: 'currency_mismatch' };
    }
    if (parsed.userId !== input.buyerUserId) {
        return { ok: false, reason: 'buyer_mismatch' };
    }
    const price = priceForMusicSku(parsed.sku);
    if (price == null || !amountsMatch(input.capturedAmount, price)) {
        return { ok: false, reason: 'amount_mismatch' };
    }

    if (parsed.sku === MUSIC_DOWNLOAD_SKU) {
        if (!parsed.extra || !TRACK_ID.test(parsed.extra)) {
            return { ok: false, reason: 'unknown_track' };
        }
        const track = getPlayableSong(parsed.extra);
        if (!track) return { ok: false, reason: 'unknown_track' };
        return {
            ok: true,
            kind: 'download',
            sku: MUSIC_DOWNLOAD_SKU,
            trackId: track.id,
            entitlement: musicDownloadEntitlement(track.id),
            price,
        };
    }

    if (parsed.sku === MUSIC_DOWNLOAD_BUNDLE_SKU) {
        if (parsed.extra) return { ok: false, reason: 'unexpected_extra' };
        return {
            ok: true,
            kind: 'bundle',
            sku: MUSIC_DOWNLOAD_BUNDLE_SKU,
            credits: MUSIC_DOWNLOAD_BUNDLE_CREDITS,
            price,
        };
    }

    if (!parsed.extra || !REQUEST_ID.test(parsed.extra)) {
        return { ok: false, reason: 'invalid_request' };
    }
    return {
        ok: true,
        kind: 'custom_song',
        sku: CUSTOM_SONG_SKU,
        requestId: parsed.extra,
        price,
    };
}

export function decideDownloadCreditRedeem(input: {
    trackId: string | null | undefined;
    creditsRemaining: number;
    alreadyOwned: boolean;
}): { ok: true; trackId: string; entitlement: string } | { ok: false; reason: string } {
    const track = getPlayableSong(input.trackId);
    if (!track) return { ok: false, reason: 'unknown_track' };
    if (input.alreadyOwned) {
        return { ok: true, trackId: track.id, entitlement: musicDownloadEntitlement(track.id) };
    }
    if (!Number.isInteger(input.creditsRemaining) || input.creditsRemaining < 1) {
        return { ok: false, reason: 'no_credits' };
    }
    return { ok: true, trackId: track.id, entitlement: musicDownloadEntitlement(track.id) };
}

export function publicDownloadStatus(status: string | null | undefined): 'awaiting_payment' | 'paid' | 'in_progress' | 'delivered' {
    const value = String(status || '').toLowerCase();
    if (value === 'delivered' || value === 'ready') return 'delivered';
    if (value === 'in_progress' || value === 'creating') return 'in_progress';
    if (value === 'paid') return 'paid';
    return 'awaiting_payment';
}
