
import { CurriculumOutcome } from '../ai-content-generator/agents/schemas';

export interface CurriculumItem extends CurriculumOutcome {
    framework: string;
    stage: string;
    subject: string;
    strand: string;
}

export class CurriculumService {
    /**
     * Mock implementation of fetching curriculum outcomes.
     * In a real system, this would query a Supabase table 'curriculum_outcomes'.
     */
    async fetchOutcomes(island: string, age: number, subject: string): Promise<CurriculumItem[]> {
        console.log(`📚 Fetching curriculum for ${island}, Age ${age}, Subject: ${subject}`);

        // Mock Data Storage
        const allOutcomes: CurriculumItem[] = [
            // SOCIAL / CULTURAL (General)
            {
                outcome_id: "cult_001",
                outcome_text: "Identifies national birds or symbols of the island.",
                framework: "Caribbean Primary Curriculum",
                stage: "Stage 1",
                subject: "Social Studies",
                strand: "Culture"
            },
            {
                outcome_id: "cult_002",
                outcome_text: "Demonstrates respect for elders using traditional greetings (e.g., 'Good morning, Aunty').",
                framework: "Caribbean Primary Curriculum",
                stage: "Stage 1",
                subject: "Social Studies",
                strand: "Values"
            },
            {
                outcome_id: "cult_003",
                outcome_text: "Participates in storytelling of local folklore.",
                framework: "Caribbean Primary Curriculum",
                stage: "Stage 2",
                subject: "Literacy",
                strand: "Oral Tradition"
            },
            // LITERACY (Age 3-5)
            {
                outcome_id: "lit_early_001",
                outcome_text: "Recognizes initial sounds in familiar words.",
                framework: "OECS Harmonized Language Arts",
                stage: "Stage 1",
                subject: "Literacy",
                strand: "Phonics"
            },
            {
                outcome_id: "lit_early_002",
                outcome_text: "Retells a simple story in sequence.",
                framework: "OECS Harmonized Language Arts",
                stage: "Stage 1",
                subject: "Literacy",
                strand: "Comprehension"
            },
            // MATH (Age 3-5)
            {
                outcome_id: "math_early_001",
                outcome_text: "Counts objects up to 10.",
                framework: "Caribbean Math Framework",
                stage: "Stage 1",
                subject: "Math",
                strand: "Number"
            },
            // TRINIDAD SPECIFIC
            {
                outcome_id: "tt_cult_001",
                outcome_text: "Identifies the Steel Pan as the national instrument.",
                framework: "TT MOE Curriculum",
                stage: "Stage 2",
                subject: "Music",
                strand: "Appreciation"
            },
            {
                outcome_id: "tt_cult_002",
                outcome_text: "Recognizes the characters of Carnival (e.g., Moko Jumbie).",
                framework: "TT MOE Curriculum",
                stage: "Stage 2",
                subject: "Social Studies",
                strand: "Culture"
            }
        ];

        // Filter Logic (Mock)
        return allOutcomes.filter(item => {
            // Rough subject matching
            const subjectMatch = item.subject.toLowerCase().includes(subject.toLowerCase()) ||
                item.strand.toLowerCase().includes(subject.toLowerCase());

            // Rough island matching (if specifically flagged)
            const islandSpecific = item.outcome_id.startsWith(island.substring(0, 2).toLowerCase());
            const isGeneral = !item.outcome_id.includes("_"); // Very loose check for this mock

            // Age check (very simpified for mock)
            const ageMatch = age < 5 ? item.outcome_id.includes("early") : true;

            return subjectMatch || (subject === "culture" && (islandSpecific || isGeneral));
        });
    }
}

export const curriculumService = new CurriculumService();
