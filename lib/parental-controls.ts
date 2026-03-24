"use client";

export interface ParentalControls {
    allow_stories: boolean;
    allow_lessons: boolean;
    allow_games: boolean;
    allow_radio: boolean;
    allow_buddy: boolean;
    daily_screen_time_minutes: number;
}

export const DEFAULT_PARENTAL_CONTROLS: ParentalControls = {
    allow_stories: true,
    allow_lessons: true,
    allow_games: true,
    allow_radio: true,
    allow_buddy: true,
    daily_screen_time_minutes: 120,
};

export function normalizeParentalControls(value: any): ParentalControls {
    const merged = {
        ...DEFAULT_PARENTAL_CONTROLS,
        ...(value && typeof value === "object" ? value : {}),
    };
    const minutes = Number(merged.daily_screen_time_minutes);
    merged.daily_screen_time_minutes = Number.isFinite(minutes) ? Math.min(600, Math.max(15, minutes)) : DEFAULT_PARENTAL_CONTROLS.daily_screen_time_minutes;
    return merged;
}

function todayKey(childId: string) {
    const day = new Date().toISOString().split("T")[0];
    return `ll_screen_time_${childId}_${day}`;
}

export function getTodayScreenMinutes(childId?: string): number {
    if (!childId || typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(todayKey(childId));
    const val = Number(raw || 0);
    return Number.isFinite(val) ? val : 0;
}

export function addScreenMinute(childId?: string): number {
    if (!childId || typeof window === "undefined") return 0;
    const key = todayKey(childId);
    const next = getTodayScreenMinutes(childId) + 1;
    window.localStorage.setItem(key, String(next));
    return next;
}

