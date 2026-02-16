/**
 * 📚 DECODABLE FACTORY v2.0 - Local Text Validator
 * Strict token-by-token validation WITHOUT calling the AI
 */

import { PhonicsControl, ValidationReport, ValidationViolation, DecodableTextRules } from "./types";

/**
 * Validates all story pages locally against the phonics control rules.
 * This runs BEFORE the AI validator for instant feedback and as a safety net.
 */
export function validateDecodableText(
    pages: { page: number; text: string }[],
    phonics: PhonicsControl,
    textRules: DecodableTextRules
): ValidationReport {
    const violations: ValidationViolation[] = [];
    const wordsUsed = new Set<string>();
    const allowedSet = new Set(phonics.allowed_words.map(w => w.toLowerCase()));
    const sightSet = new Set(phonics.sight_words.map(w => w.toLowerCase()));

    for (const page of pages) {
        const rawText = page.text.trim();

        // Check punctuation
        const lastChar = rawText[rawText.length - 1];
        if (!textRules.punctuation_allowed.includes(lastChar)) {
            violations.push({ page: page.page, word: lastChar, reason: `Invalid punctuation: "${lastChar}". Allowed: ${textRules.punctuation_allowed.join(", ")}` });
        }

        // Strip punctuation for word checking
        const cleanText = rawText.replace(/[.?!,"']/g, "").trim();
        const words = cleanText.split(/\s+/).filter(w => w.length > 0);

        // Check word count
        if (words.length > textRules.max_words_per_sentence) {
            violations.push({ page: page.page, word: `[${words.length} words]`, reason: `Exceeds max ${textRules.max_words_per_sentence} words per sentence` });
        }

        // Contractions check
        if (textRules.no_contractions && rawText.includes("'")) {
            violations.push({ page: page.page, word: rawText, reason: "Contains contraction (apostrophe detected)" });
        }

        // Dialogue quotes check
        if (textRules.no_dialogue_quotes && (rawText.includes('"') || rawText.includes('"') || rawText.includes('"'))) {
            violations.push({ page: page.page, word: rawText, reason: "Contains dialogue quotes" });
        }

        // Token-by-token word validation
        for (const word of words) {
            const lower = word.toLowerCase();
            wordsUsed.add(lower);

            if (!allowedSet.has(lower) && !sightSet.has(lower)) {
                violations.push({ page: page.page, word, reason: `"${word}" is NOT in allowed_words or sight_words` });
            }
        }

        // Capitalization: first word should be capitalized
        if (words.length > 0) {
            const firstWord = words[0];
            if (firstWord[0] !== firstWord[0].toUpperCase()) {
                violations.push({ page: page.page, word: firstWord, reason: `Sentence should start with a capital letter` });
            }
        }

        // Proper noun check: "Sam" must always be capitalized
        for (const word of words) {
            if (word.toLowerCase() === "sam" && word !== "Sam") {
                violations.push({ page: page.page, word, reason: `Proper noun "Sam" must be capitalized` });
            }
        }
    }

    const repairInstructions: string[] = violations.map(v =>
        `Page ${v.page}: Fix "${v.word}" — ${v.reason}`
    );

    return {
        status: violations.length === 0 ? "pass" : "fail",
        violations,
        word_inventory_used: Array.from(wordsUsed),
        repair_instructions: repairInstructions.length > 0 ? repairInstructions : undefined
    };
}
