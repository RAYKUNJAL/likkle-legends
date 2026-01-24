
import { CharacterVoiceBible } from '../registries/characters';
import { IslandPack } from '../registries/islands';

export interface QAReport {
    safety_passed: boolean;
    cultural_passed: boolean;
    tone_passed: boolean;
    format_passed: boolean;
    flags: string[];
}

const SAFETY_BLOCKLIST = [
    "sexual", "violence", "kill", "die", "death", "hate", "racist", "drugs", "alcohol",
    "scary", "monster", "demon", "ghost", "dark magic", "blood"
];

const REQUIRED_METADATA_FIELDS = ["age_range", "island", "host_character", "topics"];

export class QualityGatesService {

    /**
     * Run all gates on the content
     */
    static async runGates(
        content: string | object,
        island: IslandPack,
        character: CharacterVoiceBible,
        schema: any
    ): Promise<QAReport> {
        const report: QAReport = {
            safety_passed: true,
            cultural_passed: true,
            tone_passed: true,
            format_passed: true,
            flags: []
        };

        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const contentObj = typeof content === 'string' ? JSON.parse(content) : content;

        // 1. Safety Gate
        this.runSafetyGate(contentStr, report);

        // 2. Cultural Gate
        this.runCulturalGate(contentStr, island, report);

        // 3. Tone Gate
        this.runToneGate(contentStr, character, report);

        // 4. Format Gate
        this.runFormatGate(contentObj, schema, report);

        return report;
    }

    private static runSafetyGate(text: string, report: QAReport) {
        const lowerText = text.toLowerCase();
        for (const word of SAFETY_BLOCKLIST) {
            if (lowerText.includes(word)) {
                report.safety_passed = false;
                report.flags.push(`Safety Violation: Found blocked term "${word}"`);
            }
        }
    }

    private static runCulturalGate(text: string, island: IslandPack, report: QAReport) {
        // Warning if island name is missing
        if (!text.includes(island.display_name)) {
            // Not a hard fail, but worth noting
            // report.cultural_passed = false; 
            report.flags.push(`Cultural Warning: Island name "${island.display_name}" not explicitly found in content.`);
        }

        // Check for specific phrases to avoid if any (placeholder logic)
        // If we had a list of offensive cultural terms, we'd check them here
    }

    private static runToneGate(text: string, character: CharacterVoiceBible, report: QAReport) {
        const lowerText = text.toLowerCase();
        for (const forbidden of character.never_says) {
            if (lowerText.includes(forbidden.toLowerCase())) {
                report.tone_passed = false;
                report.flags.push(`Tone Violation: Used forbidden phrase "${forbidden}"`);
            }
        }
    }

    private static runFormatGate(obj: any, schema: any, report: QAReport) {
        // Basic Metadata check
        if (obj.metadata) {
            for (const field of REQUIRED_METADATA_FIELDS) {
                if (!obj.metadata[field]) {
                    report.format_passed = false;
                    report.flags.push(`Format Violation: Missing metadata field "${field}"`);
                }
            }
        } else {
            report.format_passed = false;
            report.flags.push("Format Violation: Missing 'metadata' object");
        }
    }
}
