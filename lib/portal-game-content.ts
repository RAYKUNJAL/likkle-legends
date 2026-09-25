/**
 * Stable content UUIDs for portal games ported from the lead-magnet arcade.
 * `activities.content_id` is a UUID column. Game slugs stay in metadata.content_key.
 */
export const PORTAL_GAME_CONTENT_IDS = {
    'block-carnival': 'c4b10c01-4e51-4a7e-8c11-b10cc4a11a01',
    'island-quiz': '151a9d12-4e51-4b7e-9c22-151a9d12aa02',
    'reef-rescue': 'a3cd7eef-4a11-4c3e-8f01-a3cd7eef0003',
} as const;

export type PortalLeadGameId = keyof typeof PORTAL_GAME_CONTENT_IDS;
