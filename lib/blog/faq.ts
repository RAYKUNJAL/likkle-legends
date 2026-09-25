export type BlogFaqItem = {
    question: string;
    answer: string;
};

/** Accepts faq arrays, {q,a} aliases, or a JSON string from metadata.faq. */
export function normalizeFaq(value: unknown): BlogFaqItem[] {
    let raw: unknown = value;
    if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) return [];
        try {
            raw = JSON.parse(trimmed);
        } catch {
            return [];
        }
    }
    if (!Array.isArray(raw)) return [];

    const items: BlogFaqItem[] = [];
    for (const entry of raw) {
        if (!entry || typeof entry !== 'object') continue;
        const record = entry as Record<string, unknown>;
        const question = String(record.question ?? record.q ?? '').trim();
        const answer = String(record.answer ?? record.a ?? '').trim();
        if (!question || !answer) continue;
        items.push({ question, answer });
    }
    return items;
}
