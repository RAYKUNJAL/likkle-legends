import { XP_ACTIONS } from './gamification';

/** One portal-game completion never grants more than the designed game reward. */
export const MAX_PORTAL_GAME_XP = XP_ACTIONS.GAME_COMPLETED;

const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined): boolean {
    return typeof value === 'string' && UUID_RE.test(value);
}

/**
 * XP actually written for a finished portal game.
 * Zero or non-finite scores award nothing — completion has to be a real event.
 * Island Memory's easy clear reports a score of 1000; pages cap that at 200.
 */
export function clampPortalGameXp(xp: number): number {
    if (!Number.isFinite(xp) || xp <= 0) return 0;
    return Math.min(Math.floor(xp), MAX_PORTAL_GAME_XP);
}

/**
 * `activities.content_id` is a UUID. Portal game ids are slugs (`island-memory`).
 * Writing the slug into that column makes Postgres reject the row, and the
 * caller used to abort before `children.total_xp` was updated.
 */
export function activityContentFields(
    contentId: string | undefined | null,
    metadata: Record<string, unknown> = {},
): { content_id: string | null; metadata: Record<string, unknown> } {
    if (!contentId) {
        return { content_id: null, metadata };
    }
    if (isUuid(contentId)) {
        return { content_id: contentId, metadata };
    }
    return {
        content_id: null,
        metadata: {
            ...metadata,
            content_key: contentId,
        },
    };
}
