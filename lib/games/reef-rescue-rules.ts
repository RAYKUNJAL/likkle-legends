/** Members can play every Reef Rescue level. There is no guest-level gate. */
export const MAX_REEF_LEVEL = 100;

export function memberCanPlayReefLevel(level: number): boolean {
    return Number.isInteger(level) && level >= 1 && level <= MAX_REEF_LEVEL;
}

export const REEF_ZONES = [
    { name: 'Belize Barrier Reef', flag: '🇧🇿', guide: 'Tali the Turtle', emoji: '🐢' },
    { name: 'Tobago Cays', flag: '🇻🇨', guide: 'Kori the Crab', emoji: '🦀' },
    { name: 'Buccoo Reef', flag: '🇹🇹', guide: 'Ibis the Ranger', emoji: '🐦' },
    { name: 'Montego Bay', flag: '🇯🇲', guide: 'Ziggy the Parrotfish', emoji: '🐠' },
    { name: 'Soufrière Coast', flag: '🇱🇨', guide: 'Lulu the Lobster', emoji: '🦞' },
    { name: 'Folkestone Reef', flag: '🇧🇧', guide: 'Bim the Flying Fish', emoji: '🐟' },
    { name: 'Molinere Reef', flag: '🇬🇩', guide: 'Nella the Ray', emoji: '🦈' },
    { name: 'Exuma Cays', flag: '🇧🇸', guide: 'Coco the Conch', emoji: '🐚' },
    { name: 'Bonaire Marine Park', flag: '🇧🇶', guide: 'Fina the Flamingo', emoji: '🦩' },
    { name: 'Caribbean Sea Quest', flag: '🌎', guide: 'The Reef Ranger Crew', emoji: '⭐' },
] as const;

export const REEF_TRASH = [
    { icon: '🥤', label: 'plastic cup', points: 50, hits: 1 },
    { icon: '🧴', label: 'plastic bottle', points: 55, hits: 1 },
    { icon: '🥫', label: 'can', points: 60, hits: 1 },
    { icon: '🛍️', label: 'plastic bag', points: 65, hits: 1 },
    { icon: '🧃', label: 'drink carton', points: 55, hits: 1 },
    { icon: '👞', label: 'old shoe', points: 70, hits: 1 },
] as const;

export const REEF_WILDLIFE = ['🐢', '🐠', '🐟', '🦀', '🐙', '🐬', '🦈', '🦞'] as const;

export function reefZone(level: number) {
    return REEF_ZONES[Math.min(REEF_ZONES.length - 1, Math.floor((level - 1) / 10))];
}

export function reefConfig(level: number) {
    const band = Math.floor((Math.max(1, level) - 1) / 10);
    return {
        duration: Math.max(25, 36 - Math.floor(level / 15)),
        target: 300 + level * 45 + band * 75,
        spawnMs: Math.max(420, 980 - level * 4),
        speed: 48 + level * 1.1,
        wildlifeChance: Math.min(0.28, 0.1 + level * 0.0018),
        bonusChance: level > 4 ? 0.04 : 0.02,
    };
}

/** Visual size and tap size are the same box. Pieces are not separate moving buttons. */
export const LITTER_SIZE = 72;

export type LitterBox = { x: number; y: number };

export function clampPlayfieldX(x: number, width: number, size = LITTER_SIZE) {
    const max = Math.max(0, width - size);
    if (!Number.isFinite(x)) return 0;
    return Math.min(max, Math.max(0, x));
}

/**
 * Hit the piece whose drawn box contains the playfield point.
 * Later pieces win so a tap on an overlap clears the one on top.
 * The layout origin (0, 0) is not a hit unless a piece is actually drawn there.
 */
export function entityUnderPoint<T extends LitterBox>(items: readonly T[], px: number, py: number, size = LITTER_SIZE): T | null {
    for (let index = items.length - 1; index >= 0; index -= 1) {
        const item = items[index];
        if (px >= item.x && px < item.x + size && py >= item.y && py < item.y + size) return item;
    }
    return null;
}

export type ReefHitKind = 'trash' | 'wildlife' | 'bonus';

export function scoreReefHit(kind: ReefHitKind, points: number, combo: number) {
    if (kind === 'wildlife') {
        return { scoreDelta: -100, lifeDelta: -1, timeDelta: 0, nextCombo: 0, remove: true };
    }
    const nextCombo = combo + 1;
    const multiplier = Math.min(4, 1 + Math.floor((nextCombo - 1) / 5));
    return {
        scoreDelta: points * multiplier,
        lifeDelta: kind === 'bonus' ? 1 : 0,
        timeDelta: kind === 'bonus' ? 3 : 0,
        nextCombo,
        remove: true,
    };
}
