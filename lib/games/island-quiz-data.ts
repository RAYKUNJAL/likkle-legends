export const QUIZ_ISLANDS = [
    ['Trinidad & Tobago', '🇹🇹', 'Doubles', 'Scarlet Ibis', 'Steelpan'],
    ['Jamaica', '🇯🇲', 'Ackee & Saltfish', 'Doctor Bird', 'Julie Mango'],
    ['Barbados', '🇧🇧', 'Flying Fish & Cou-Cou', 'Pride of Barbados', 'Conch Shell'],
    ['Guyana', '🇬🇾', 'Pepperpot', 'Jaguar', 'Cacao Pod'],
    ['Grenada', '🇬🇩', 'Oil Down', 'Grenada Dove', 'Nutmeg'],
    ['Saint Lucia', '🇱🇨', 'Green Fig & Saltfish', 'Saint Lucia Parrot', 'Tropical Orchid'],
    ['The Bahamas', '🇧🇸', 'Conch Fritters', 'Caribbean Flamingo', 'Coconut Drink'],
    ['Dominican Republic', '🇩🇴', 'Mangú', 'Hispaniolan Parrot', 'Maracas'],
    ['Haiti', '🇭🇹', 'Griot & Pikliz', 'Hispaniolan Trogon', 'Bougainvillea'],
    ['Puerto Rico', '🇵🇷', 'Mofongo', 'Coquí Frog', 'Hibiscus'],
    ['Antigua & Barbuda', '🇦🇬', 'Ducana & Saltfish', 'Frigatebird', 'Postman Butterfly'],
    ['Dominica', '🇩🇲', 'Callaloo', 'Sisserou Parrot', 'Heliconia'],
    ['St Vincent & Grenadines', '🇻🇨', 'Breadfruit & Jackfish', 'Saint Vincent Parrot', 'Blue Morpho'],
    ['St Kitts & Nevis', '🇰🇳', 'Goat Water', 'Brown Pelican', 'Golden Pineapple'],
    ['Cuba', '🇨🇺', 'Ropa Vieja', 'Tocororo', 'Carnival Mask'],
    ['Belize', '🇧🇿', 'Rice, Beans & Stew Chicken', 'Keel-Billed Toucan', 'Cacao Pod'],
] as const;

const TYPES = ['food', 'nature', 'culture', 'flag'] as const;
export const QUIZ_LEVELS = QUIZ_ISLANDS.length * TYPES.length;

/** One quest is three rounds so a sitting is a long passport run, not eight quick taps. */
export const QUIZ_ROUNDS = [
    { name: 'Harbor', questions: 8 },
    { name: 'Market', questions: 10 },
    { name: 'Festival', questions: 12 },
] as const;

export const QUIZ_QUEST_QUESTIONS = QUIZ_ROUNDS.reduce((sum, round) => sum + round.questions, 0);

export type QuizQuestion = {
    island: string;
    flag: string;
    label: string;
    question: string;
    correct: string;
    options: string[];
    detail: string;
};

function rand(seed: number) {
    let value = (seed * 9301 + 49297) % 233280;
    return () => ((value = (value * 9301 + 49297) % 233280) / 233280);
}

function shuffle(items: string[], seed: number) {
    const random = rand(seed);
    const next = [...items];
    for (let index = next.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(random() * (index + 1));
        [next[index], next[swap]] = [next[swap], next[index]];
    }
    return next;
}

function sampleOptions(correct: string, pool: string[], seed: number) {
    const random = rand(seed);
    const options = [correct];
    while (options.length < 4) {
        const candidate = pool[Math.floor(random() * pool.length)];
        if (!options.includes(candidate)) options.push(candidate);
    }
    return shuffle(options, seed + 17);
}

export function questionFor(level: number): QuizQuestion {
    const current = ((Math.max(1, level) - 1) % QUIZ_LEVELS) + 1;
    const island = QUIZ_ISLANDS[Math.floor((current - 1) / TYPES.length)];
    const type = TYPES[(current - 1) % TYPES.length];
    const [name, flag, food, nature, culture] = island;
    if (type === 'food') {
        return {
            island: name, flag, label: 'ISLAND FOOD',
            question: `Which island is famous for ${food}?`,
            correct: name,
            options: sampleOptions(name, QUIZ_ISLANDS.map((item) => item[0]), current * 97),
            detail: `${food} is a favorite dish from ${name}.`,
        };
    }
    if (type === 'nature') {
        return {
            island: name, flag, label: 'ISLAND NATURE',
            question: `Which wildlife or flower belongs with ${name}?`,
            correct: nature,
            options: sampleOptions(nature, QUIZ_ISLANDS.map((item) => item[3]), current * 97),
            detail: `Meet the ${nature}, a nature treasure of ${name}.`,
        };
    }
    if (type === 'culture') {
        return {
            island: name, flag, label: 'ISLAND TREASURE',
            question: `Choose the cultural treasure connected to ${name}.`,
            correct: culture,
            options: sampleOptions(culture, QUIZ_ISLANDS.map((item) => item[4]), current * 97),
            detail: `${culture} is part of the ${name} story.`,
        };
    }
    return {
        island: name, flag, label: 'ISLAND FLAG',
        question: 'Which island does this flag represent?',
        correct: name,
        options: sampleOptions(name, QUIZ_ISLANDS.map((item) => item[0]), current * 97),
        detail: `This is the flag of ${name}.`,
    };
}
