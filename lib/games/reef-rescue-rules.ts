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

/**
 * Long reef missions for kids.
 * Early levels are slow, roomy, and forgiving. Later levels add waves, a higher
 * clear target, a little more wildlife, and slightly quicker litter — the clock
 * grows instead of shrinking, so a level stays a few minutes of tapping.
 * A life is lost only after several missed pieces, so a long mission is not
 * over after two or three slips.
 */
export function reefConfig(level: number) {
    const safe = Math.max(1, Math.min(MAX_REEF_LEVEL, Math.floor(Number(level)) || 1));
    const band = Math.floor((safe - 1) / 10);
    const waves = 3 + Math.min(3, Math.floor((safe - 1) / 20));
    const duration = 170 + band * 6 + (waves - 3) * 6;
    const spawnMs = Math.max(1550, 2350 - safe * 7);
    const speed = Math.round((32 + safe * 0.36) * 10) / 10;
    const wildlifeChance = Math.min(0.16, 0.04 + safe * 0.0012);
    const bonusChance = 0.03;
    const trashChance = Math.max(0.5, 1 - wildlifeChance - bonusChance);
    const clearFraction = band <= 1 ? 0.58 : band <= 5 ? 0.64 : 0.7;
    const avgPoints = 58;
    const pieces = (duration * 1000) / spawnMs;
    const target = Math.max(900, Math.round((pieces * trashChance * clearFraction * avgPoints) / 50) * 50);
    const expectedMisses = pieces * trashChance * (1 - clearFraction);
    const missesPerLife = safe <= 40 ? 4 : 3;
    const lives = Math.max(6, Math.ceil((expectedMisses * 1.4) / missesPerLife));
    return {
        duration,
        target,
        spawnMs,
        speed,
        wildlifeChance,
        bonusChance,
        lives,
        waves,
        missesPerLife,
    };
}

export function reefWave(score: number, target: number, waves: number) {
    if (waves <= 1 || target <= 0) return 1;
    const index = Math.floor((Math.max(0, score) / target) * waves);
    return Math.min(waves, Math.max(1, index + 1));
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
