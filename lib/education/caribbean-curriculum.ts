import { CharacterId } from '@/lib/characterConfig';

export type AgeBandId = 'early_years_3_5' | 'primary_6_7' | 'primary_8_9';
export type CurriculumPillarId =
    | 'language_literacy'
    | 'mathematical_literacy'
    | 'scientific_literacy'
    | 'civic_cultural_literacy'
    | 'creative_expression'
    | 'wellbeing_identity';

export type CurriculumPillar = {
    id: CurriculumPillarId;
    label: string;
    schoolLanguage: string;
    parentLanguage: string;
    characterLead: CharacterId;
    evidenceTargets: string[];
};

export type AgeBand = {
    id: AgeBandId;
    label: string;
    ages: number[];
    learningShape: string;
    productRules: string[];
};

export const CARIBBEAN_CURRICULUM_SOURCES = [
    {
        label: 'CXC Caribbean Primary Exit Assessment',
        url: 'https://www.cxc.org/examinations/cpea/',
        note: 'Regional primary assessment anchor for language, mathematical, civic, and scientific literacies.',
    },
    {
        label: 'Trinidad and Tobago Ministry of Education Primary Curriculum',
        url: 'https://moe.gov.tt/primary/',
        note: 'Primary curriculum direction with integrated themes and cross-curricular literacy and numeracy.',
    },
    {
        label: 'OECS Learning Hub Essential Learning Outcomes',
        url: 'https://www.oecslearning.org/elo-guide.html',
        note: 'Harmonised curriculum architecture and Essential Learning Outcomes approach.',
    },
] as const;

export const AGE_BANDS: AgeBand[] = [
    {
        id: 'early_years_3_5',
        label: 'Early Years',
        ages: [3, 4, 5],
        learningShape: 'Play, oral language, sound awareness, counting, movement, feelings, and family identity.',
        productRules: [
            'Voice-first navigation',
            'One instruction at a time',
            'Large tap targets',
            'No timed pressure',
            'Use picture, sound, and repeat-after-me moments',
        ],
    },
    {
        id: 'primary_6_7',
        label: 'Lower Primary',
        ages: [6, 7],
        learningShape: 'Phonics, early fluency, number sense, island facts, science noticing, and simple reflection.',
        productRules: [
            'Read-aloud with word highlighting',
            'Short comprehension checks',
            'Retry without shame',
            'Parent-visible progress notes',
            'Character-guided practice loops',
        ],
    },
    {
        id: 'primary_8_9',
        label: 'Upper Primary Bridge',
        ages: [8, 9],
        learningShape: 'Reading comprehension, writing, applied math, science explanation, heritage research, and civic pride.',
        productRules: [
            'Explain-your-answer prompts',
            'Vocabulary glossary',
            'Project-based island missions',
            'Rubric-backed teacher exports',
            'Evidence of mastery by skill',
        ],
    },
];

export const CURRICULUM_PILLARS: CurriculumPillar[] = [
    {
        id: 'language_literacy',
        label: 'Language & Reading Literacy',
        schoolLanguage: 'Vocabulary, phonics, fluency, comprehension, writing, speaking, and listening.',
        parentLanguage: 'Your child hears stories, follows highlighted words, learns island vocabulary, and builds reading confidence.',
        characterLead: 'tanty_spice',
        evidenceTargets: ['words_read', 'story_completion', 'vocabulary_mastery', 'retell_accuracy'],
    },
    {
        id: 'mathematical_literacy',
        label: 'Mathematical Literacy',
        schoolLanguage: 'Counting, number sense, patterns, operations, measurement, shape, data, and problem solving.',
        parentLanguage: 'Your child solves island-flavoured math with food, music, maps, markets, and games.',
        characterLead: 'roti',
        evidenceTargets: ['math_skill_accuracy', 'attempts_to_mastery', 'pattern_completion', 'number_fluency'],
    },
    {
        id: 'scientific_literacy',
        label: 'Scientific Literacy',
        schoolLanguage: 'Observation, living things, environment, weather, materials, energy, and inquiry.',
        parentLanguage: 'Your child explores sea turtles, rainforests, volcanoes, mangroves, reefs, weather, and island habitats.',
        characterLead: 'mango_moko',
        evidenceTargets: ['observation_notes', 'science_fact_recall', 'classification_accuracy', 'inquiry_response'],
    },
    {
        id: 'civic_cultural_literacy',
        label: 'Civic & Cultural Literacy',
        schoolLanguage: 'Community, identity, citizenship, heritage, history, geography, celebrations, and respect.',
        parentLanguage: 'Your child learns pride, kindness, family heritage, island geography, festivals, foods, and heroes.',
        characterLead: 'tanty_spice',
        evidenceTargets: ['island_knowledge', 'civic_choice', 'heritage_reflection', 'map_skill'],
    },
    {
        id: 'creative_expression',
        label: 'Creative Expression',
        schoolLanguage: 'Music, art, movement, oral storytelling, dramatic play, rhythm, and design.',
        parentLanguage: 'Your child makes songs, stories, drawings, dances, rhythm games, and character-guided projects.',
        characterLead: 'dilly_doubles',
        evidenceTargets: ['created_artifact', 'rhythm_participation', 'story_created', 'creative_confidence'],
    },
    {
        id: 'wellbeing_identity',
        label: 'Wellbeing, Belonging & Identity',
        schoolLanguage: 'Social-emotional learning, self-regulation, confidence, belonging, safety, and respectful choices.',
        parentLanguage: 'Your child gets warm coaching for feelings, courage, kindness, patience, and cultural confidence.',
        characterLead: 'scorcha_pepper',
        evidenceTargets: ['calming_strategy_used', 'kind_choice', 'confidence_checkin', 'reflection_complete'],
    },
];

export const SCHOOL_READINESS_MODULES = [
    'Teacher roster and class setup',
    'Standards-aligned lesson map by age band',
    'Printable lesson plan and worksheet exports',
    'Read-aloud evidence report',
    'Classroom-safe character chat mode',
    'Teacher approval queue for generated content',
    'School license dashboard',
    'Term progress reports by literacy pillar',
    'Curriculum source notes and local adaptation fields',
    'Accessibility and child-safety audit trail',
];

export function getAgeBandForAge(age: number): AgeBand {
    return AGE_BANDS.find((band) => band.ages.includes(age)) || AGE_BANDS[1];
}

export function getPillarsForCharacter(characterId: CharacterId): CurriculumPillar[] {
    return CURRICULUM_PILLARS.filter((pillar) => pillar.characterLead === characterId);
}
