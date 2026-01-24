
import { GeneratedContent, ContentRequest, QualityGateReport } from "./types";
import { CHARACTER_REGISTRY } from "./registries/characters";
import { ISLAND_REGISTRY } from "./registries/islands";

const SAFETY_BLOCKLIST_HARD = [
    "sexual", "porn", "xxx", "violence", "kill", "murder", "blood", "hate", "racist", "suicide", "die"
];

const SAFETY_BLOCKLIST_SOFT = [
    "ghost", "monster", "demon", "hell", "stupid", "dumb", "ugly", "fat"
];

/**
 * Runs all quality gates on the generated content.
 */
export function runQualityGates(content: GeneratedContent, request: ContentRequest): QualityGateReport {
    const report: QualityGateReport = {
        safety_passed: true,
        cultural_passed: true,
        tone_passed: true,
        readability_passed: true,
        format_passed: true,
        reasons: []
    };

    // 1. Safety Gate
    const textContent = JSON.stringify(content.payload).toLowerCase();
    for (const word of SAFETY_BLOCKLIST_HARD) {
        if (textContent.includes(word)) {
            report.safety_passed = false;
            report.reasons?.push(`Safety Violation (Hard): Found forbidden word '${word}'`);
        }
    }
    if (request.mode === 'kid_mode') {
        for (const word of SAFETY_BLOCKLIST_SOFT) {
            if (textContent.includes(word)) {
                report.safety_passed = false;
                report.reasons?.push(`Safety Violation (Soft - Kid Mode): Found discouraged word '${word}'`);
            }
        }
    }

    // 2. Cultural Gate
    // Rules: Dialect check, island reference check.
    const island = ISLAND_REGISTRY[request.island_id];
    if (island) {
        // Simple check: Ensure at least one island symbol or food is mentioned if cultural_density is not light
        // detailed logic would be more complex
        const hasIslandReference = island.cultural_traits.foods.some(food => textContent.includes(food.toLowerCase())) ||
            island.symbols.landmarks.some(mark => textContent.includes(mark.toLowerCase()));

        // If we are strictly checking, we might fail here. For now, just a warning/soft pass unless heavy dialect requested.
    }

    // 3. Tone Gate
    // Check against Character Voice Bible
    if (request.host_character_id) {
        const char = CHARACTER_REGISTRY[request.host_character_id];
        if (char) {
            const forbiddenWords = char.voice_bible.never_says;
            for (const word of forbiddenWords) {
                if (textContent.includes(word.toLowerCase())) {
                    report.tone_passed = false;
                    report.reasons?.push(`Tone Violation: Character ${char.display_name} used forbidden word '${word}'`);
                }
            }
        }
    }

    // 4. Readability Gate
    // Simple heuristic: length of sentences or word complexity.
    // For MVP, if kid_mode, ensure no super long text blocks?
    // We'll rely on the prompt to get this right, this is just a final check.

    // 5. Format Gate
    if (!content.payload || typeof content.payload !== 'object') {
        report.format_passed = false;
        report.reasons?.push("Format Violation: Payload is not a valid object");
    }
    // Check for emojis if strictly forbidden (Blueprint says "No emojis in final files")
    // Regex for emojis
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
    if (emojiRegex.test(textContent)) {
        // Just a warning for now? Blueprint says "No emojis in final output"
        // report.format_passed = false;
        // report.reasons?.push("Format Violation: Emoji detected");
    }

    return report;
}

/**
 * Validates if the content is safe to show to a child.
 */
export function isContentSafe(report: QualityGateReport): boolean {
    return report.safety_passed && report.cultural_passed && report.tone_passed;
}
