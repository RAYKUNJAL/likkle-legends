/**
 * Shared long-play numbers for kids games.
 * Early steps stay small enough to finish. Later steps ask for more rounds,
 * pairs, or problems without tightening timers into a panic.
 */

export function blockCarnivalLines(islandIndex: number) {
    return 6 + Math.max(0, islandIndex) * 2;
}

export function blockCarnivalSwaps(islandIndex: number) {
    return islandIndex <= 0 ? 4 : 3;
}

export const MEMORY_PLAN = {
    easy: { pairs: 6, boards: 2, columns: 4 },
    medium: { pairs: 8, boards: 2, columns: 4 },
    hard: { pairs: 10, boards: 3, columns: 4 },
} as const;

export type MemoryDifficulty = keyof typeof MEMORY_PLAN;

export const FLAG_LEVELS = [
    { num: 1, name: 'Tourist', options: 2, timeMs: 0, rounds: 12 },
    { num: 2, name: 'Explorer', options: 3, timeMs: 0, rounds: 14 },
    { num: 3, name: 'Navigator', options: 4, timeMs: 20000, rounds: 14 },
    { num: 4, name: 'Captain', options: 4, timeMs: 18000, rounds: 16 },
    { num: 5, name: 'Legend', options: 6, timeMs: 15000, rounds: 16 },
] as const;

export const PATOIS_LEVELS = [
    { num: 1, pairs: 4, boards: 2, name: 'Beginner' },
    { num: 2, pairs: 6, boards: 2, name: 'Apprentice' },
    { num: 3, pairs: 6, boards: 3, name: 'Explorer' },
    { num: 4, pairs: 8, boards: 3, name: 'Scholar' },
    { num: 5, pairs: 8, boards: 3, name: 'Legend' },
] as const;

export const COLOR_MATCH_ROUNDS = 24;

export const SPEED_SHAPE_ROUNDS = { easy: 18, medium: 22, hard: 24 } as const;
export const SPEED_SHAPE_ANSWER_SECONDS = { easy: 10, medium: 8, hard: 7 } as const;
export const SPEED_SHAPE_REVEAL_SECONDS = { easy: 1.05, medium: 0.9, hard: 0.75 } as const;

export const RHYTHM_ROUNDS = { easy: 10, medium: 12, hard: 14 } as const;

export const MARKET_BUDGETS = {
    easy: [28, 36, 44],
    medium: [40, 52, 64, 72],
    hard: [48, 62, 74, 86, 96],
} as const;

export const INGREDIENT_ROUND_SIZES = [12, 18] as const;

export const WORD_BUILDER_WORDS_TO_CLEAR = 4;

export const MATH_PROBLEM_COUNTS = [8, 8, 10, 10, 12] as const;

export type MathProblem = { question: string; answer: number };

export function extendMathProblems(operation: string, authored: MathProblem[], total: number): MathProblem[] {
    const next = [...authored];
    let extra = 0;
    while (next.length < total && extra < 40) {
        next.push(makeMathProblem(operation, next.length + extra));
        extra += 1;
    }
    return next;
}

function makeMathProblem(operation: string, n: number): MathProblem {
    if (operation === 'addition') {
        const a = 2 + (n % 9);
        const b = 1 + ((n * 3) % 8);
        return {
            question: `The fruit stall has ${a} mangoes and picks ${b} more. How many mangoes now?`,
            answer: a + b,
        };
    }
    if (operation === 'subtraction') {
        const taken = 1 + (n % 6);
        const start = taken + 3 + (n % 8);
        return {
            question: `You have ${start} coconuts and share ${taken}. How many are left?`,
            answer: start - taken,
        };
    }
    if (operation === 'multiplication') {
        const groups = 2 + (n % 4);
        const each = 2 + ((n * 2) % 4);
        return {
            question: `${groups} baskets hold ${each} plantains each. How many plantains?`,
            answer: groups * each,
        };
    }
    if (operation === 'division') {
        const friends = 2 + (n % 4);
        const each = 2 + ((n * 3) % 5);
        return {
            question: `Share ${friends * each} papayas with ${friends} friends equally. How many does each friend get?`,
            answer: each,
        };
    }
    const a = 3 + (n % 6);
    const b = 2 + (n % 4);
    const c = 1 + (n % 3);
    return {
        question: `Start with ${a} fruits, add ${b}, then give away ${c}. How many are left?`,
        answer: a + b - c,
    };
}

export type TriviaQuestion = {
    q: string;
    options: string[];
    a: number;
    fact: string;
};

/** Replay each island level for extra laps, with answers shuffled after the first pass. Timers get a little longer. */
export function triviaSession<T extends { id: number; questions: TriviaQuestion[]; timeMs: number }>(level: T): T {
    const laps = level.id >= 3 ? 3 : 2;
    const questions: TriviaQuestion[] = [];
    for (let lap = 0; lap < laps; lap += 1) {
        for (const question of level.questions) {
            questions.push(varyTriviaQuestion(question, lap));
        }
    }
    const timeMs = level.id <= 1 ? 0 : level.id === 2 ? 22000 : 18000;
    return { ...level, questions, timeMs };
}

function varyTriviaQuestion(question: TriviaQuestion, lap: number): TriviaQuestion {
    if (lap === 0 || question.options.length < 2) return question;
    const shift = ((lap * 2) + question.a) % question.options.length;
    if (shift === 0) return question;
    const options = question.options.map((_, index) => question.options[(index + shift) % question.options.length]);
    const answer = (question.a - shift + question.options.length) % question.options.length;
    return { ...question, options, a: answer };
}

/** Doubles Dash shifts grow from a little over two minutes toward about three and a half. */
export function doublesDashSeconds(level: number) {
    const safe = Math.max(1, Math.floor(level) || 1);
    return Math.min(210, 140 + (safe - 1) * 8);
}
