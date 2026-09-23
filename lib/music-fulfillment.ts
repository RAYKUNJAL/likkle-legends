import { supabaseAdmin } from '@/lib/supabase-client';
import {
    CUSTOM_SONG_PRICE,
    CUSTOM_SONG_SKU,
    CUSTOM_SONG_STYLE,
    MUSIC_DOWNLOAD_BUNDLE_SKU,
    MUSIC_DOWNLOAD_CREDITS_KEY,
    MusicGrant,
    decideDownloadCreditRedeem,
    musicDownloadEntitlement,
    normalizeOccasion,
    publicDownloadStatus,
} from '@/lib/music-store';
import { getPlayableCatalogSongs, getPlayableSong } from '@/lib/song-catalog';

const PAID_STATUSES = new Set(['paid', 'in_progress', 'delivered', 'creating', 'ready']);

function isUniqueViolation(error: { code?: string } | null): boolean {
    return error?.code === '23505';
}

/** Balance is granted licenses minus credits already spent. Direct $1 purchases are not credits. */
async function syncDownloadCredits(userId: string, orderId: string, sku: string): Promise<boolean> {
    const [ledger, spent] = await Promise.all([
        supabaseAdmin.from('music_credit_ledger').select('credits').eq('user_id', userId),
        supabaseAdmin.from('account_entitlements').select('entitlement_key').eq('user_id', userId).eq('sku', 'music_download_credit'),
    ]);
    if (ledger.error || spent.error) {
        console.error('[MUSIC] credit sync read failed:', ledger.error || spent.error);
        return false;
    }
    const granted = (ledger.data || []).reduce((sum, row) => sum + Number(row.credits || 0), 0);
    const used = (spent.data || []).length;
    const remaining = Math.max(0, granted - used);
    const saved = await supabaseAdmin.from('account_entitlements').upsert({
        user_id: userId,
        entitlement_key: MUSIC_DOWNLOAD_CREDITS_KEY,
        sku,
        source_order_id: orderId,
        metadata: { remaining, verified: true },
    }, { onConflict: 'user_id,entitlement_key' });
    if (saved.error) {
        console.error('[MUSIC] credit balance failed:', saved.error);
        return false;
    }
    return true;
}

export async function createCustomSongDraft(
    userId: string,
    input: { childFirstName: unknown; occasion: unknown; notes?: unknown }
): Promise<{ ok: true; requestId: string; price: number } | { ok: false; error: string }> {
    const childFirstName = typeof input.childFirstName === 'string' ? input.childFirstName.trim().slice(0, 40) : '';
    const occasion = normalizeOccasion(input.occasion);
    const notes = typeof input.notes === 'string' ? input.notes.trim().slice(0, 500) : '';
    if (!childFirstName) return { ok: false, error: 'A child first name is required.' };
    if (!occasion) return { ok: false, error: 'Choose birthday, event, or other.' };

    const requestId = crypto.randomUUID();
    const orderInsert = await supabaseAdmin.from('custom_song_orders').insert({
        id: requestId,
        user_id: userId,
        status: 'awaiting_payment',
        event_type: occasion,
        child_name: childFirstName,
        special_instructions: notes || null,
        price_paid: 0,
        metadata: { style: CUSTOM_SONG_STYLE, verified: false },
    });
    if (orderInsert.error) {
        console.error('[MUSIC] custom song draft failed:', orderInsert.error);
        return { ok: false, error: 'The request could not be saved.' };
    }

    const requestInsert = await supabaseAdmin.from('custom_song_requests').insert({
        id: requestId,
        user_id: userId,
        child_name: childFirstName,
        occasion,
        musical_style: CUSTOM_SONG_STYLE,
        status: 'awaiting_payment',
        payment_status: 'unpaid',
        amount_paid: 0,
    });
    if (requestInsert.error) {
        console.error('[MUSIC] custom song request row failed:', requestInsert.error);
    }

    return { ok: true, requestId, price: CUSTOM_SONG_PRICE };
}

export async function assertUnpaidCustomDraft(userId: string, requestId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
        .from('custom_song_orders')
        .select('id, user_id, status')
        .eq('id', requestId)
        .maybeSingle();
    if (!data || data.user_id !== userId) return false;
    return !PAID_STATUSES.has(String(data.status || '').toLowerCase());
}

export async function fulfillMusicPurchase(input: {
    decision: Extract<MusicGrant, { ok: true }>;
    userId: string;
    orderId: string;
}): Promise<{ ok: boolean; reason: string }> {
    if (input.decision.kind === 'download') {
        const { error } = await supabaseAdmin.from('account_entitlements').upsert({
            user_id: input.userId,
            entitlement_key: input.decision.entitlement,
            sku: input.decision.sku,
            source_order_id: input.orderId,
            metadata: { track_id: input.decision.trackId, verified: true },
        }, { onConflict: 'user_id,entitlement_key' });
        if (error) {
            console.error('[MUSIC] download entitlement failed:', error);
            return { ok: false, reason: 'write_failed' };
        }
        return { ok: true, reason: 'granted' };
    }

    if (input.decision.kind === 'bundle') {
        const ledger = await supabaseAdmin.from('music_credit_ledger').insert({
            source_order_id: input.orderId,
            user_id: input.userId,
            credits: input.decision.credits,
        });
        if (ledger.error && !isUniqueViolation(ledger.error)) {
            console.error('[MUSIC] credit ledger failed:', ledger.error);
            return { ok: false, reason: 'write_failed' };
        }
        const balanced = await syncDownloadCredits(input.userId, input.orderId, input.decision.sku);
        if (!balanced) return { ok: false, reason: 'write_failed' };
        return { ok: true, reason: ledger.error ? 'already_granted' : 'granted' };
    }

    const { data: order } = await supabaseAdmin
        .from('custom_song_orders')
        .select('id, user_id, status, metadata')
        .eq('id', input.decision.requestId)
        .maybeSingle();
    if (!order || order.user_id !== input.userId) {
        return { ok: false, reason: 'request_not_found' };
    }

    const current = String(order.status || '').toLowerCase();
    if (PAID_STATUSES.has(current)) {
        return { ok: true, reason: 'already_granted' };
    }

    const updated = await supabaseAdmin
        .from('custom_song_orders')
        .update({
            status: 'paid',
            price_paid: input.decision.price,
            metadata: {
                ...(order.metadata || {}),
                paypal_order_id: input.orderId,
                verified: true,
                sku: CUSTOM_SONG_SKU,
            },
            updated_at: new Date().toISOString(),
        })
        .eq('id', input.decision.requestId)
        .eq('user_id', input.userId)
        .in('status', ['awaiting_payment', 'pending'])
        .select('id');
    if (updated.error || !updated.data?.length) {
        const reread = await supabaseAdmin
            .from('custom_song_orders')
            .select('status')
            .eq('id', input.decision.requestId)
            .eq('user_id', input.userId)
            .maybeSingle();
        if (reread.data && PAID_STATUSES.has(String(reread.data.status || '').toLowerCase())) {
            return { ok: true, reason: 'already_granted' };
        }
        console.error('[MUSIC] custom song paid update failed:', updated.error);
        return { ok: false, reason: 'write_failed' };
    }

    await supabaseAdmin
        .from('custom_song_requests')
        .update({
            status: 'paid',
            payment_status: 'paid',
            amount_paid: input.decision.price,
        })
        .eq('id', input.decision.requestId)
        .eq('user_id', input.userId);

    return { ok: true, reason: 'granted' };
}

export async function listMusicAccount(userId: string) {
    const [entitlements, orders] = await Promise.all([
        supabaseAdmin
            .from('account_entitlements')
            .select('entitlement_key, metadata')
            .eq('user_id', userId),
        supabaseAdmin
            .from('custom_song_orders')
            .select('id, status, event_type, child_name, special_instructions, final_audio_url, price_paid, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
    ]);

    const rows = entitlements.data || [];
    const ownedTrackIds = rows
        .map((row) => String(row.entitlement_key || ''))
        .filter((key) => key.startsWith('music_download:'))
        .map((key) => key.slice('music_download:'.length));
    const creditRow = rows.find((row) => row.entitlement_key === MUSIC_DOWNLOAD_CREDITS_KEY);
    const creditsRemaining = Number(creditRow?.metadata?.remaining || 0);

    return {
        tracks: getPlayableCatalogSongs().map((song) => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            streamUrl: song.url,
            channel: song.channel,
            owned: ownedTrackIds.includes(song.id),
        })),
        creditsRemaining: Number.isFinite(creditsRemaining) ? creditsRemaining : 0,
        customSongs: (orders.data || []).map((order) => ({
            id: order.id,
            childFirstName: order.child_name,
            occasion: order.event_type,
            notes: order.special_instructions,
            status: publicDownloadStatus(order.status),
            audioUrl: order.final_audio_url || null,
            createdAt: order.created_at,
        })),
    };
}

export async function parentOwnsDownload(userId: string, trackId: string): Promise<boolean> {
    const track = getPlayableSong(trackId);
    if (!track) return false;
    const { data } = await supabaseAdmin
        .from('account_entitlements')
        .select('entitlement_key')
        .eq('user_id', userId)
        .eq('entitlement_key', musicDownloadEntitlement(track.id))
        .maybeSingle();
    return Boolean(data);
}

export async function redeemDownloadCredit(userId: string, trackId: string): Promise<{ ok: boolean; reason: string; entitlement?: string }> {
    const owned = await parentOwnsDownload(userId, trackId);
    const { data: creditRow } = await supabaseAdmin
        .from('account_entitlements')
        .select('metadata')
        .eq('user_id', userId)
        .eq('entitlement_key', MUSIC_DOWNLOAD_CREDITS_KEY)
        .maybeSingle();
    const remaining = Number(creditRow?.metadata?.remaining || 0);
    const decision = decideDownloadCreditRedeem({
        trackId,
        creditsRemaining: Number.isFinite(remaining) ? remaining : 0,
        alreadyOwned: owned,
    });
    if (!decision.ok) return { ok: false, reason: decision.reason };
    if (owned) return { ok: true, reason: 'already_owned', entitlement: decision.entitlement };

    const saved = await supabaseAdmin.from('account_entitlements').upsert({
        user_id: userId,
        entitlement_key: decision.entitlement,
        sku: 'music_download_credit',
        metadata: { track_id: decision.trackId, redeemed: true },
    }, { onConflict: 'user_id,entitlement_key' });
    if (saved.error) return { ok: false, reason: 'write_failed' };

    await syncDownloadCredits(userId, 'redeem', MUSIC_DOWNLOAD_BUNDLE_SKU);
    return { ok: true, reason: 'redeemed', entitlement: decision.entitlement };
}
