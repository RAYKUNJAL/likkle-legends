export interface StoryChoice {
    id: string;
    name: string;
    detail: string;
}

export const BUILD_CHARACTERS: StoryChoice[] = [
    { id: 'tanty_spice', name: 'Tanty Spice', detail: 'Warm storyteller' },
    { id: 'dilly_doubles', name: 'Dilly Doubles', detail: 'Trinidad street-food friend' },
    { id: 'roti', name: 'R.O.T.I.', detail: 'Playful word robot' },
    { id: 'steelpan_sam', name: 'Steelpan Sam', detail: 'Music-loving buddy' },
    { id: 'mango_moko', name: 'Mango Moko', detail: 'Grenada garden friend' },
    { id: 'scorcha_pepper', name: 'Scorcha Pepper', detail: 'Brave and kind' },
];

export const BUILD_THEMES: StoryChoice[] = [
    { id: 'kindness', name: 'Kindness', detail: 'A small good deed' },
    { id: 'friendship', name: 'Friendship', detail: 'Two friends figure it out' },
    { id: 'music', name: 'Music', detail: 'A song helps the day' },
    { id: 'market', name: 'Market morning', detail: 'Helping at the market' },
    { id: 'garden', name: 'Growing food', detail: 'Patience in the garden' },
    { id: 'rain', name: 'Rainy day', detail: 'Sunshine after rain' },
    { id: 'home', name: 'Helping at home', detail: 'Family teamwork' },
    { id: 'brave', name: 'Trying something new', detail: 'Bravery without scares' },
];

export const BUILD_ISLANDS: { id: string; name: string; flag: string }[] = [
    { id: 'JM', name: 'Jamaica', flag: '🇯🇲' },
    { id: 'TT', name: 'Trinidad & Tobago', flag: '🇹🇹' },
    { id: 'BB', name: 'Barbados', flag: '🇧🇧' },
    { id: 'BS', name: 'Bahamas', flag: '🇧🇸' },
    { id: 'LC', name: 'Saint Lucia', flag: '🇱🇨' },
    { id: 'GY', name: 'Guyana', flag: '🇬🇾' },
    { id: 'GD', name: 'Grenada', flag: '🇬🇩' },
    { id: 'AG', name: 'Antigua & Barbuda', flag: '🇦🇬' },
];

const THEME_PROMPTS: Record<string, string> = {
    kindness: 'kindness and sharing',
    friendship: 'friendship and listening',
    music: 'the joy of music',
    market: 'a cheerful market morning',
    garden: 'growing food and patience',
    rain: 'a rainy island day that ends in sunshine',
    home: 'helping family at home',
    brave: 'trying something new with a grown-up nearby',
};

export interface BuildStoryInput {
    childName: string;
    island: string;
    theme: string;
    character: string;
    childAge?: number;
}

export function sanitizeChildName(raw: string): { ok: true; name: string } | { ok: false; error: string } {
    const name = raw.replace(/\s+/g, ' ').trim();
    if (name.length < 2 || name.length > 24) {
        return { ok: false, error: 'Use a first name between 2 and 24 letters.' };
    }
    if (!/^[\p{L}][\p{L}\s'.-]{1,23}$/u.test(name)) {
        return { ok: false, error: 'Use a first name with letters only.' };
    }
    if (/https?:|ignore|system|prompt|script/i.test(name)) {
        return { ok: false, error: 'That name cannot be used.' };
    }
    return { ok: true, name };
}

export function resolveBuildStoryInput(input: BuildStoryInput): {
    ok: true;
    childName: string;
    island: string;
    islandName: string;
    theme: string;
    themePrompt: string;
    character: string;
    characterName: string;
    childAge: number;
} | { ok: false; error: string } {
    const name = sanitizeChildName(input.childName || '');
    if (!name.ok) return name;
    const island = BUILD_ISLANDS.find((item) => item.id === input.island);
    const theme = BUILD_THEMES.find((item) => item.id === input.theme);
    const character = BUILD_CHARACTERS.find((item) => item.id === input.character);
    if (!island || !theme || !character) {
        return { ok: false, error: 'Pick an island, a theme, and a Likkle Legend.' };
    }
    const age = Number(input.childAge);
    const childAge = Number.isFinite(age) ? Math.min(9, Math.max(3, Math.round(age))) : 6;
    return {
        ok: true,
        childName: name.name,
        island: island.id,
        islandName: island.name,
        theme: theme.id,
        themePrompt: THEME_PROMPTS[theme.id],
        character: character.id,
        characterName: character.name,
        childAge,
    };
}
