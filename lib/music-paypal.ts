import { GAMIFICATION_PRODUCTS, MUSIC_STORE_PRODUCTS } from '@/lib/paypal';

export const CLIENT_PRICE_KEYS = ['amount', 'price', 'value', 'tier', 'planId', 'plan_id'] as const;

export type MusicOrGameProductId =
    | keyof typeof MUSIC_STORE_PRODUCTS
    | keyof typeof GAMIFICATION_PRODUCTS;

export type CatalogProduct = {
    id: string;
    name: string;
    price: number;
    type?: string;
};

const FORBIDDEN_METADATA_KEYS = new Set([
    'amount',
    'price',
    'value',
    'tier',
    'planId',
    'plan_id',
    'userId',
    'productId',
    'contentId',
]);

export function lookupMusicStoreProduct(productId: unknown): CatalogProduct | null {
    if (typeof productId !== 'string' || !productId) return null;
    const music = (MUSIC_STORE_PRODUCTS as Record<string, CatalogProduct | undefined>)[productId];
    if (music && Number.isFinite(Number(music.price))) return music;
    const game = (GAMIFICATION_PRODUCTS as Record<string, CatalogProduct | undefined>)[productId];
    if (game && Number.isFinite(Number(game.price))) return game;
    return null;
}

export function clientSuppliedPriceFields(body: Record<string, unknown> | null | undefined): string[] {
    if (!body || typeof body !== 'object') return [];
    return CLIENT_PRICE_KEYS.filter((key) => body[key] != null);
}

export function sanitizeOrderMetadata(metadata: unknown): Record<string, unknown> {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
        if (FORBIDDEN_METADATA_KEYS.has(key)) continue;
        if (value == null) continue;
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            clean[key] = value;
            continue;
        }
        if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
            clean[key] = value.slice(0, 20);
        }
    }
    return clean;
}

export function amountsMatch(captured: number, expected: number, tolerance = 0.05): boolean {
    return Number.isFinite(captured) && Number.isFinite(expected) && Math.abs(captured - expected) <= tolerance;
}

export function buildCustomId(opts: {
    userId: string;
    productId: string;
    contentId?: string;
    metadata?: unknown;
}): string {
    return JSON.stringify({
        userId: opts.userId,
        productId: opts.productId,
        contentId: opts.contentId || null,
        ...sanitizeOrderMetadata(opts.metadata),
    });
}

export type EntitlementPlan =
    | { kind: 'custom_song_request'; tables: ['custom_song_orders', 'custom_song_requests'] }
    | { kind: 'single_track'; tables: ['purchased_content', 'music_purchases'] }
    | { kind: 'track_bundle_5'; tables: ['purchased_content'] }
    | { kind: 'gamification'; tables: ['purchases'] };

export function entitlementPlanFor(productId: string): EntitlementPlan {
    if (productId === 'custom_song_request') {
        return { kind: 'custom_song_request', tables: ['custom_song_orders', 'custom_song_requests'] };
    }
    if (productId === 'track_bundle_5') {
        return { kind: 'track_bundle_5', tables: ['purchased_content'] };
    }
    if (productId === 'single_track') {
        return { kind: 'single_track', tables: ['purchased_content', 'music_purchases'] };
    }
    return { kind: 'gamification', tables: ['purchases'] };
}
