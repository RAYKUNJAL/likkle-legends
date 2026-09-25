/**
 * Island-grounded week builder for the existing learning-plan path.
 * Gemini stays in app/actions/generate-plan.ts. A missing GEMINI_API_KEY
 * uses this OECS outline and does not call another model.
 */
import type { ResolvedSignupPlace } from './resolve-signup-island';

export type CurriculumEngine = 'gemini' | 'oecs_fallback';

export type GroundedActivity = {
    title: string;
    type: 'lesson_micro' | 'quiz_micro' | 'story_short' | 'song_video_script' | 'printable' | 'game';
    characterGuide: string;
    domain: string;
    duration: number;
    xpReward: number;
    description: string;
};

export type GroundedDay = {
    day: string;
    activities: GroundedActivity[];
};

export type GroundedWeek = {
    weekNumber: number;
    theme: string;
    curriculumStandard: string;
    characterGuide: string;
    days: GroundedDay[];
};

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;

const CHARACTER_NAMES: Record<string, string> = {
    roti: 'R.O.T.I.',
    tanty_spice: 'Tanty Spice',
    dilly_doubles: 'Dilly Doubles',
    benny: 'Benny',
};

const DOMAIN_CHARACTERS: Record<string, string> = {
    literacy: 'roti',
    math: 'roti',
    science: 'benny',
    culture: 'tanty_spice',
    social: 'dilly_doubles',
    music: 'dilly_doubles',
};

const UNSAFE_PLAN = /\b(diagnos\w*|therap\w*|medication|clinical treatment|disorder|you must|punish\w*|be normal|adhd|autism|asperger)\b/i;

export function curriculumEngine(env?: { GEMINI_API_KEY?: string }): CurriculumEngine {
    const key = ((env ? env.GEMINI_API_KEY : process.env.GEMINI_API_KEY) || '').trim();
    return key ? 'gemini' : 'oecs_fallback';
}

export function planTextIsKidSafe(text: string): boolean {
    return !UNSAFE_PLAN.test(text || '');
}

export function weeksAreKidSafe(weeks: { days?: { activities?: { title?: string; description?: string }[] }[] }[]): boolean {
    const blob = JSON.stringify(weeks || []);
    return planTextIsKidSafe(blob);
}

function anchorLine(place: ResolvedSignupPlace, index: number): string {
    const bits = [
        ...place.anchors.foods.map((food) => `the pack food ${food}`),
        ...place.anchors.music.map((music) => `the pack music ${music}`),
        ...place.anchors.topics.map((topic) => `the pack topic ${topic}`),
        ...place.anchors.landmarks.map((landmark) => `the pack place ${landmark}`),
    ];
    if (!bits.length) return 'a shared Caribbean story, song, and counting game';
    return bits[index % bits.length];
}

function placeLabel(place: ResolvedSignupPlace): string {
    if (place.unpackedPlace) return `${place.unpackedPlace} (pan-Caribbean pack)`;
    return place.displayName || 'the Caribbean';
}

export function buildGroundedFallbackWeeks(input: {
    age: number;
    weeksCount: number;
    place: ResolvedSignupPlace;
    focusAreas: string[];
    preferredCharacter: string;
    dailyMinutes: number;
    standards: Record<string, string>;
}): GroundedWeek[] {
    const age = input.age;
    const focusAreas = input.focusAreas.length ? input.focusAreas : ['literacy', 'culture'];
    const preferred = input.preferredCharacter || 'roti';
    const dailyMinutes = input.dailyMinutes || 30;
    const weeksCount = Math.max(1, input.weeksCount);
    const label = placeLabel(input.place);
    const themes = input.place.diaspora
        ? ['Family island week', 'Sounds from home', 'Market and music', 'Stories we carry']
        : [`${label} explorer`, `${label} roots`, `${label} makers`, `${label} adventure`];

    return Array.from({ length: weeksCount }, (_, wi) => {
        const primaryFocus = focusAreas[wi % focusAreas.length];
        const charGuide = DOMAIN_CHARACTERS[primaryFocus] || preferred;
        const standard = input.standards[primaryFocus] || 'OECS Caribbean Primary';
        const days: GroundedDay[] = DAY_NAMES.map((day, di) => {
            const domain = focusAreas[di % focusAreas.length];
            const actChar = DOMAIN_CHARACTERS[domain] || preferred;
            const charName = CHARACTER_NAMES[actChar] || 'R.O.T.I.';
            const anchor = anchorLine(input.place, wi * 5 + di);
            const activities: GroundedActivity[] = [
                {
                    title: `${day} ${domain} — ${label}`,
                    type: 'lesson_micro',
                    characterGuide: actChar,
                    domain,
                    duration: Math.min(dailyMinutes, 15),
                    xpReward: 50,
                    description: `${charName} keeps ${domain} playful for age ${age} in ${label}. Today uses ${anchor}.`,
                },
            ];
            if (dailyMinutes >= 25) {
                const storyAnchor = anchorLine(input.place, wi * 5 + di + 1);
                activities.push({
                    title: `Story time — ${label}`,
                    type: 'story_short',
                    characterGuide: 'tanty_spice',
                    domain: 'literacy',
                    duration: 10,
                    xpReward: 30,
                    description: `Tanty Spice reads a short story for age ${age}. The picture uses ${storyAnchor}.`,
                });
            }
            if (dailyMinutes >= 40) {
                const musicAnchor = anchorLine(input.place, wi * 5 + di + 2);
                activities.push({
                    title: 'Movement break',
                    type: 'game',
                    characterGuide: 'dilly_doubles',
                    domain: 'music',
                    duration: 10,
                    xpReward: 20,
                    description: `Dilly Doubles leads a short movement game for age ${age}, using ${musicAnchor}.`,
                });
            }
            return { day, activities };
        });
        return {
            weekNumber: wi + 1,
            theme: themes[wi] || `Week ${wi + 1}`,
            curriculumStandard: standard,
            characterGuide: charGuide,
            days,
        };
    });
}

export function pickTodaysActivities<T>(
    weeks: { days?: { day?: string; activities?: T[] }[] }[] | undefined,
    now = new Date(),
): { weekend: boolean; day: string | null; activities: T[] } {
    const jsDay = now.getDay();
    if (jsDay === 0 || jsDay === 6) {
        return { weekend: true, day: null, activities: [] };
    }
    const dayName = DAY_NAMES[jsDay - 1];
    const week = weeks?.[0];
    const match = week?.days?.find((day) => (day.day || '').toLowerCase() === dayName.toLowerCase());
    return { weekend: false, day: dayName, activities: match?.activities || [] };
}
