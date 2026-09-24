import { supabaseAdmin } from '@/lib/supabase-client';
import {
    CUSTOM_SONG_PRICE,
    CUSTOM_SONG_SKU,
    CUSTOM_SONG_STYLE,
    MUSIC_DOWNLOAD_BUNDLE_SKU,
    MUSIC_DOWNLOAD_CREDITS_KEY,
    MusicGrant,
    MusicSku,
    decideDownloadCreditRedeem,
    musicDownloadEntitlement,
    musicSkuName,
    normalizeOccasion,
    priceForMusicSku,
} from '@/lib/music-store';
import {
    commerceOrderLabel,
    customSongLabel,
    customSongStateAfterPayment,
    decideCustomSongAdvance,
    musicOrderLog,
    nextCommerceOrderState,
    normalizeCustomWorkState,
} from '@/lib/music-orders';
import { getPlayableCatalogSongs, getPlayableSong, playbackUrl } from '@/lib/song-catalog';

const PAID_STATUSES = new Set(['paid', 'queued', 'in_progress', 'delivered', 'creating', 'ready']);

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

    musicOrderLog('custom_draft_created', { userId, orderId: requestId, sku: CUSTOM_SONG_SKU, to: 'created' });
    return { ok: true, requestId, price: CUSTOM_SONG_PRICE };
}

export async function openMusicCheckout(input: {
    userId: string;
    sku: MusicSku;
    trackId?: string;
    requestId?: string;
}): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
    const amount = priceForMusicSku(input.sku);
    if (amount == null) return { ok: false, error: 'Unknown music product' };
    const inserted = await supabaseAdmin.from('music_commerce_orders').insert({
        user_id: input.userId,
        sku: input.sku,
        track_id: input.trackId || null,
        request_id: input.requestId || null,
        amount,
        currency: 'USD',
        status: 'created',
    }).select('id').single();
    if (inserted.error || !inserted.data?.id) {
        console.error('[MUSIC] order create failed:', inserted.error?.message);
        musicOrderLog('order_create_failed', { userId: input.userId, sku: input.sku, reason: 'write_failed' });
        return { ok: false, error: 'Checkout could not be started.' };
    }
    musicOrderLog('order_created', { userId: input.userId, sku: input.sku, orderId: inserted.data.id, to: 'created' });
    if (input.sku === CUSTOM_SONG_SKU && input.requestId) {
        await supabaseAdmin.from('custom_song_orders').update({
            status: 'created',
            updated_at: new Date().toISOString(),
        }).eq('id', input.requestId).eq('user_id', input.userId).in('status', ['awaiting_payment', 'pending', 'created']);
    }
    return { ok: true, orderId: inserted.data.id };
}

export async function markMusicCheckoutPending(input: {
    orderId: string;
    userId: string;
    paypalOrderId: string;
    requestId?: string;
}): Promise<void> {
    const next = nextCommerceOrderState('created', 'paypal_created');
    const updated = await supabaseAdmin.from('music_commerce_orders').update({
        status: next,
        paypal_order_id: input.paypalOrderId,
        updated_at: new Date().toISOString(),
    }).eq('id', input.orderId).eq('user_id', input.userId).eq('status', 'created');
    if (updated.error) {
        console.error('[MUSIC] paypal pending update failed:', updated.error.message);
        return;
    }
    musicOrderLog('paypal_pending', {
        userId: input.userId,
        orderId: input.orderId,
        paypalOrderId: input.paypalOrderId,
        from: 'created',
        to: next || 'paypal_pending',
    });
    if (input.requestId) {
        await supabaseAdmin.from('custom_song_orders').update({
            status: 'paypal_pending',
            updated_at: new Date().toISOString(),
        }).eq('id', input.requestId).eq('user_id', input.userId).in('status', ['created', 'awaiting_payment', 'pending']);
    }
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

async function settleCommerceOrder(input: {
    userId: string;
    paypalOrderId: string;
    sku: string;
    amount: number;
    trackId?: string;
    requestId?: string;
    entitlementKey?: string;
}): Promise<'proceed' | 'skip' | 'failed'> {
    const existing = await supabaseAdmin
        .from('music_commerce_orders')
        .select('id, status')
        .eq('paypal_order_id', input.paypalOrderId)
        .maybeSingle();

    if (existing.error && !/relation|does not exist|schema cache/i.test(existing.error.message || '')) {
        console.error('[MUSIC] order lookup failed:', existing.error.message);
    }

    const row = existing.data;
    if (row?.status === 'entitled') {
        musicOrderLog('capture_idempotent', {
            userId: input.userId,
            sku: input.sku,
            orderId: row.id,
            paypalOrderId: input.paypalOrderId,
            from: 'entitled',
            to: 'entitled',
        });
        return 'skip';
    }

    const captured = nextCommerceOrderState(row?.status || 'paypal_pending', 'capture_verified');
    if (!row) {
        const inserted = await supabaseAdmin.from('music_commerce_orders').insert({
            user_id: input.userId,
            sku: input.sku,
            track_id: input.trackId || null,
            request_id: input.requestId || null,
            amount: input.amount,
            currency: 'USD',
            status: 'captured',
            paypal_order_id: input.paypalOrderId,
            entitlement_key: input.entitlementKey || null,
        });
        if (inserted.error && !/relation|does not exist|schema cache/i.test(inserted.error.message || '')) {
            console.error('[MUSIC] captured order insert failed:', inserted.error.message);
            return 'failed';
        }
        musicOrderLog('captured', { userId: input.userId, sku: input.sku, paypalOrderId: input.paypalOrderId, from: 'paypal_pending', to: 'captured' });
        return 'proceed';
    }

    if (!captured) return 'failed';
    const updated = await supabaseAdmin.from('music_commerce_orders').update({
        status: captured === 'entitled' ? 'captured' : captured,
        amount: input.amount,
        updated_at: new Date().toISOString(),
    }).eq('id', row.id).in('status', ['created', 'paypal_pending', 'captured']);
    if (updated.error) {
        console.error('[MUSIC] captured order update failed:', updated.error.message);
        return 'failed';
    }
    musicOrderLog('captured', {
        userId: input.userId,
        sku: input.sku,
        orderId: row.id,
        paypalOrderId: input.paypalOrderId,
        from: row.status,
        to: 'captured',
    });
    return 'proceed';
}

async function sendMusicReceipt(userId: string, sku: MusicSku, amount: number, trackId?: string) {
    try {
        const { data } = await supabaseAdmin.from('users').select('email').eq('id', userId).maybeSingle();
        const to = typeof data?.email === 'string' ? data.email.trim() : '';
        if (!to) {
            musicOrderLog('receipt_skipped', { userId, sku, reason: 'no_email' });
            return;
        }
        const { sendEmail } = await import('@/lib/email');
        const name = musicSkuName(sku);
        const track = trackId ? getPlayableSong(trackId) : null;
        const detail = track ? `${name}: ${track.title}` : name;
        const followUp = sku === CUSTOM_SONG_SKU
            ? 'The request is queued. The team delivers the audio later.'
            : 'The download license is on this parent account. Listening stays free.';
        const sent = await sendEmail({
            to,
            subject: `${detail} — Likkle Legends`,
            html: `<p>This confirms a parent purchase on Likkle Legends.</p><p>${detail}</p><p>Amount: $${amount.toFixed(2)} USD.</p><p>${followUp}</p>`,
        });
        if (!sent?.success) {
            musicOrderLog('receipt_skipped', { userId, sku, reason: 'send_failed' });
        }
    } catch {
        musicOrderLog('receipt_skipped', { userId, sku, reason: 'send_failed' });
    }
}

async function markCommerceEntitled(paypalOrderId: string, userId: string, sku: string, entitlementKey?: string) {
    const next = nextCommerceOrderState('captured', 'entitlement_written');
    const updated = await supabaseAdmin.from('music_commerce_orders').update({
        status: next,
        entitlement_key: entitlementKey || null,
        updated_at: new Date().toISOString(),
    }).eq('paypal_order_id', paypalOrderId).in('status', ['captured', 'entitled']);
    if (updated.error && !/relation|does not exist|schema cache/i.test(updated.error.message || '')) {
        console.error('[MUSIC] entitled update failed:', updated.error.message);
        return;
    }
    musicOrderLog('entitled', { userId, sku, paypalOrderId, from: 'captured', to: next || 'entitled' });
}

export async function fulfillMusicPurchase(input: {
    decision: Extract<MusicGrant, { ok: true }>;
    userId: string;
    orderId: string;
}): Promise<{ ok: boolean; reason: string }> {
    const settlement = await settleCommerceOrder({
        userId: input.userId,
        paypalOrderId: input.orderId,
        sku: input.decision.sku,
        amount: input.decision.price,
        trackId: input.decision.kind === 'download' ? input.decision.trackId : undefined,
        requestId: input.decision.kind === 'custom_song' ? input.decision.requestId : undefined,
        entitlementKey: input.decision.kind === 'download' ? input.decision.entitlement : undefined,
    });
    if (settlement === 'skip') return { ok: true, reason: 'already_granted' };
    if (settlement === 'failed') return { ok: false, reason: 'write_failed' };

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
        await markCommerceEntitled(input.orderId, input.userId, input.decision.sku, input.decision.entitlement);
        await sendMusicReceipt(input.userId, input.decision.sku, input.decision.price, input.decision.trackId);
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
        await markCommerceEntitled(input.orderId, input.userId, input.decision.sku);
        if (ledger.error) return { ok: true, reason: 'already_granted' };
        await sendMusicReceipt(input.userId, input.decision.sku, input.decision.price);
        return { ok: true, reason: 'granted' };
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
        await markCommerceEntitled(input.orderId, input.userId, input.decision.sku);
        return { ok: true, reason: 'already_granted' };
    }

    const queued = customSongStateAfterPayment(current);
    if (queued !== 'queued' && queued !== 'paid') {
        return { ok: false, reason: 'request_not_found' };
    }

    const updated = await supabaseAdmin
        .from('custom_song_orders')
        .update({
            status: 'queued',
            price_paid: input.decision.price,
            metadata: {
                ...(order.metadata || {}),
                paypal_order_id: input.orderId,
                verified: true,
                sku: CUSTOM_SONG_SKU,
                payment_status: 'paid',
            },
            updated_at: new Date().toISOString(),
        })
        .eq('id', input.decision.requestId)
        .eq('user_id', input.userId)
        .in('status', ['awaiting_payment', 'pending', 'created', 'paypal_pending', 'paid'])
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
            status: 'queued',
            payment_status: 'paid',
            amount_paid: input.decision.price,
        })
        .eq('id', input.decision.requestId)
        .eq('user_id', input.userId);

    await markCommerceEntitled(input.orderId, input.userId, input.decision.sku);
    await sendMusicReceipt(input.userId, input.decision.sku, input.decision.price);
    musicOrderLog('custom_queued', { userId: input.userId, sku: CUSTOM_SONG_SKU, orderId: input.decision.requestId, paypalOrderId: input.orderId, from: current, to: 'queued' });
    return { ok: true, reason: 'granted' };
}

function missingTable(message: string | undefined): boolean {
    return /relation|does not exist|schema cache/i.test(message || '');
}

export async function listMusicAccount(userId: string) {
    const [entitlements, orders, commerce] = await Promise.all([
        supabaseAdmin
            .from('account_entitlements')
            .select('entitlement_key, metadata')
            .eq('user_id', userId),
        supabaseAdmin
            .from('custom_song_orders')
            .select('id, status, event_type, child_name, special_instructions, final_audio_url, price_paid, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
        supabaseAdmin
            .from('music_commerce_orders')
            .select('id, sku, amount, currency, status, paypal_order_id, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
    ]);

    if (commerce.error && !missingTable(commerce.error.message)) {
        console.error('[MUSIC] receipt history failed:', commerce.error.message);
    }

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
            streamUrl: playbackUrl(song),
            channel: song.channel,
            owned: ownedTrackIds.includes(song.id),
        })),
        creditsRemaining: Number.isFinite(creditsRemaining) ? creditsRemaining : 0,
        customSongs: (orders.data || []).map((order) => ({
            id: order.id,
            childFirstName: order.child_name,
            occasion: order.event_type,
            notes: order.special_instructions,
            status: normalizeCustomWorkState(order.status),
            label: customSongLabel(order.status),
            audioUrl: order.final_audio_url || null,
            createdAt: order.created_at,
        })),
        receipts: (commerce.data || []).map((row) => ({
            id: row.id,
            sku: row.sku,
            amount: Number(row.amount),
            currency: row.currency || 'USD',
            status: row.status,
            label: commerceOrderLabel(row.status),
            paypalOrderId: row.paypal_order_id || null,
            createdAt: row.created_at,
        })),
    };
}

export async function advanceCustomSong(
    adminUserId: string,
    requestId: string,
    to: 'in_progress' | 'delivered'
): Promise<{ ok: true } | { ok: false; reason: string }> {
    const { data: order } = await supabaseAdmin
        .from('custom_song_orders')
        .select('id, status')
        .eq('id', requestId)
        .maybeSingle();
    if (!order) return { ok: false, reason: 'request_not_found' };
    if (!decideCustomSongAdvance(order.status, to)) return { ok: false, reason: 'invalid_transition' };

    const allowed = to === 'in_progress' ? ['queued'] : ['in_progress', 'creating'];
    const updated = await supabaseAdmin
        .from('custom_song_orders')
        .update({ status: to, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .in('status', allowed)
        .select('id');
    if (updated.error || !updated.data?.length) return { ok: false, reason: 'invalid_transition' };

    await supabaseAdmin.from('custom_song_requests').update({ status: to }).eq('id', requestId);
    musicOrderLog('custom_advanced', {
        userId: adminUserId,
        sku: CUSTOM_SONG_SKU,
        orderId: requestId,
        from: String(order.status || ''),
        to,
    });
    return { ok: true };
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
