"use client";

export interface GameProgressEntry {
    gameId: string;
    plays: number;
    bestScore: number;
    lastPlayedAt: string;
}

const STORAGE_KEY = "ll_game_progress_v1";

function isBrowser() {
    return typeof window !== "undefined";
}

export function getGameProgressMap(): Record<string, GameProgressEntry> {
    if (!isBrowser()) return {};
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw) as Record<string, GameProgressEntry>;
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

export function recordGameResult(gameId: string, score: number) {
    if (!isBrowser() || !gameId) return;
    const map = getGameProgressMap();
    const existing = map[gameId];
    map[gameId] = {
        gameId,
        plays: (existing?.plays || 0) + 1,
        bestScore: Math.max(existing?.bestScore || 0, Math.max(0, Math.floor(score || 0))),
        lastPlayedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

