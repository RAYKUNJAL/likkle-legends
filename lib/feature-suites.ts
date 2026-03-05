export type FeatureSuiteSlug =
    | 'scholar-suite'
    | 'creative-carnival'
    | 'adventure-alley'
    | 'heritage-kitchen';

export interface FeatureLesson {
    title: string;
    duration: string;
    objective: string;
    activity: string;
}

export interface FeatureItem {
    id: string;
    name: string;
    description: string;
    primaryHref: string;
    lessons: FeatureLesson[];
}

export interface FeatureSuite {
    slug: FeatureSuiteSlug;
    title: string;
    ledBy: string;
    hero: string;
    description: string;
    ctaHref: string;
    ctaLabel: string;
    items: FeatureItem[];
}

export const FEATURE_SUITES: Record<FeatureSuiteSlug, FeatureSuite> = {
    'scholar-suite': {
        slug: 'scholar-suite',
        title: 'The Scholar Suite',
        ledBy: 'R.O.T.I.',
        hero: 'Build reading, writing, and number confidence with daily routines.',
        description: 'A structured literacy + numeracy lane designed for quick, repeatable wins at home.',
        ctaHref: '/signup?source=scholar-suite',
        ctaLabel: 'Start Scholar Suite',
        items: [
            {
                id: 'phonics',
                name: 'Phonics',
                description: 'Voice-friendly reading practice with R.O.T.I.',
                primaryHref: '/portal/lessons',
                lessons: [
                    { title: 'Sound Sprint: S-A-T', duration: '8 min', objective: 'Blend 3 CVC sounds', activity: 'Call-and-repeat sound ladder with voice prompts.' },
                    { title: 'Word Builder Jam', duration: '10 min', objective: 'Decode 8 beginner words', activity: 'Tap phoneme tiles, then read full words aloud.' },
                    { title: 'Island Sound Hunt', duration: '7 min', objective: 'Hear initial sounds', activity: 'Find objects by starting sound clues.' },
                ],
            },
            {
                id: 'letters',
                name: 'Letters',
                description: 'Handwriting, tracing, and letter recognition',
                primaryHref: '/portal/printables?category=worksheet',
                lessons: [
                    { title: 'Trace & Say A-E', duration: '10 min', objective: 'Shape uppercase letters', activity: 'Guided tracing strokes with verbal checkpoints.' },
                    { title: 'Letter Match Race', duration: '6 min', objective: 'Match upper/lower pairs', activity: 'Drag letter pairs before timer ends.' },
                    { title: 'Name Builder', duration: '8 min', objective: 'Spell child name', activity: 'Letter sequencing using personalized tiles.' },
                ],
            },
            {
                id: 'math-workbooks',
                name: 'Math Workbooks',
                description: 'Interactive math games & printable worksheets',
                primaryHref: '/portal/games',
                lessons: [
                    { title: 'Count the Coconuts', duration: '8 min', objective: 'Count to 20', activity: 'Tap-to-count with visual grouping hints.' },
                    { title: 'Island Add-Up', duration: '10 min', objective: 'Add within 10', activity: 'Solve mini story problems with pictures.' },
                    { title: 'Shape Safari', duration: '7 min', objective: 'Identify 2D shapes', activity: 'Find shapes hidden in island scenes.' },
                ],
            },
            {
                id: 'flashcards',
                name: 'Flashcards',
                description: 'Caribbean-themed vocabulary & sight words',
                primaryHref: '/portal/printables?category=activity',
                lessons: [
                    { title: 'Sight Word Spin', duration: '6 min', objective: 'Read 12 sight words', activity: 'Flip and read cards with speed rounds.' },
                    { title: 'Island Vocab Deck', duration: '8 min', objective: 'Learn 10 culture words', activity: 'Picture-word matching with quick quizzes.' },
                    { title: 'Memory Pair Challenge', duration: '8 min', objective: 'Retain key terms', activity: 'Match terms to definitions in pairs mode.' },
                ],
            },
        ],
    },
    'creative-carnival': {
        slug: 'creative-carnival',
        title: 'The Creative Carnival',
        ledBy: 'Dilly Doubles & Steelpan Sam',
        hero: 'Turn art, rhythm, and imagination into a daily creative ritual.',
        description: 'Hands-on and screen-assisted creativity for kids who learn by making and performing.',
        ctaHref: '/signup?source=creative-carnival',
        ctaLabel: 'Join Creative Carnival',
        items: [
            {
                id: 'coloring-books',
                name: 'Coloring Books',
                description: 'Digital & printable coloring with island themes',
                primaryHref: '/portal/printables?category=coloring',
                lessons: [
                    { title: 'Carnival Colors', duration: '12 min', objective: 'Practice color choices', activity: 'Color costume pages with palette prompts.' },
                    { title: 'Island Animals', duration: '10 min', objective: 'Build fine motor control', activity: 'Pattern coloring with easy/hard zones.' },
                    { title: 'Flag Color Match', duration: '8 min', objective: 'Learn flag palettes', activity: 'Color islands with authentic flag colors.' },
                ],
            },
            {
                id: 'arts-crafts',
                name: 'Arts & Crafts',
                description: 'Paper crafts, mask-making & carnival projects',
                primaryHref: '/portal/printables?category=craft',
                lessons: [
                    { title: 'Mas Mask Builder', duration: '20 min', objective: 'Follow 4-step craft flow', activity: 'Cut, fold, decorate printable carnival masks.' },
                    { title: 'Paper Steelpan', duration: '15 min', objective: 'Assemble simple model', activity: 'Template-based paper instrument build.' },
                    { title: 'Parade Banner', duration: '18 min', objective: 'Design visual message', activity: 'Create family parade banner with symbols.' },
                ],
            },
            {
                id: 'step-by-step-drawing',
                name: 'Step-by-Step Drawing',
                description: 'Guided drawing lessons for young artists',
                primaryHref: '/portal/lessons',
                lessons: [
                    { title: 'Draw Dilly Doubles', duration: '12 min', objective: 'Use basic shapes', activity: 'Character drawing broken into 6 simple frames.' },
                    { title: 'Palm Tree Scene', duration: '10 min', objective: 'Draw foreground/background', activity: 'Scene composition with layering tips.' },
                    { title: 'Festival Crowd', duration: '14 min', objective: 'Repeat form variations', activity: 'Draw characters with different poses.' },
                ],
            },
            {
                id: 'rhythm-music',
                name: 'Rhythm & Music',
                description: 'Beat games and simple instruments',
                primaryHref: '/portal/music',
                lessons: [
                    { title: 'Clap the Beat', duration: '7 min', objective: 'Hold steady tempo', activity: 'Follow animated clap tracks at 2 speeds.' },
                    { title: 'Steelpan Echo', duration: '8 min', objective: 'Repeat rhythm patterns', activity: 'Listen and mimic 4-note sequences.' },
                    { title: 'Build a Groove', duration: '10 min', objective: 'Layer rhythm parts', activity: 'Combine drum, shaker, and clap loops.' },
                ],
            },
        ],
    },
    'adventure-alley': {
        slug: 'adventure-alley',
        title: 'Adventure Alley',
        ledBy: 'Mango Moko, Benny & Scorcha',
        hero: 'Explore folklore, maps, and mission-driven learning games.',
        description: 'Story-first adventures that connect culture, geography, and problem-solving.',
        ctaHref: '/signup?source=adventure-alley',
        ctaLabel: 'Enter Adventure Alley',
        items: [
            {
                id: 'folklore-stories',
                name: 'Folklore Stories',
                description: 'Caribbean legends and tales brought to life',
                primaryHref: '/portal/stories',
                lessons: [
                    { title: 'Anansi Trick Tale', duration: '10 min', objective: 'Sequence story events', activity: 'Read and reorder key plot moments.' },
                    { title: 'Papa Bois Guardian', duration: '12 min', objective: 'Identify story theme', activity: 'Theme prompts after each chapter.' },
                    { title: 'River Mumma Quest', duration: '10 min', objective: 'Build vocabulary context', activity: 'Tap words for meaning-in-story hints.' },
                ],
            },
            {
                id: 'game-portal',
                name: 'Game Portal',
                description: 'Learning games tied to island adventures',
                primaryHref: '/portal/games',
                lessons: [
                    { title: 'Island Trivia Run', duration: '8 min', objective: 'Recall facts fast', activity: 'Timed multiple-choice trivia rounds.' },
                    { title: 'Flag Match Mission', duration: '8 min', objective: 'Match flags to islands', activity: 'Memory-style country and flag pairing.' },
                    { title: 'Mango Catch Quest', duration: '6 min', objective: 'Hand-eye + scoring', activity: 'Arcade challenge tied to food vocabulary.' },
                ],
            },
            {
                id: 'island-geography',
                name: 'Island Geography',
                description: 'Maps, flags, and facts about each island',
                primaryHref: '/portal/games/flag-match',
                lessons: [
                    { title: 'Map Pin Challenge', duration: '9 min', objective: 'Locate 6 islands', activity: 'Drag map pins to matching islands.' },
                    { title: 'Capital Clues', duration: '8 min', objective: 'Match island to capital', activity: 'Fact cards with elimination mode.' },
                    { title: 'Flag Fact Sprint', duration: '7 min', objective: 'Identify symbols/colors', activity: 'Quick rounds with cultural fact popups.' },
                ],
            },
            {
                id: 'mini-storybooks',
                name: 'Mini Storybooks',
                description: 'Short illustrated stories for independent reading',
                primaryHref: '/portal/stories',
                lessons: [
                    { title: '5-Minute Reader', duration: '5 min', objective: 'Build reading stamina', activity: 'Short illustrated read with progress check.' },
                    { title: 'Read & Retell', duration: '7 min', objective: 'Summarize clearly', activity: 'Tell story back using prompt cards.' },
                    { title: 'Word Spotter', duration: '6 min', objective: 'Track target words', activity: 'Find and tap repeated sight words.' },
                ],
            },
        ],
    },
    'heritage-kitchen': {
        slug: 'heritage-kitchen',
        title: 'Heritage Kitchen',
        ledBy: 'Tanty Spice & Benny',
        hero: 'Teach culture, confidence, and care through kid-safe cooking.',
        description: 'Food-based learning that blends recipes, ingredients, and cultural meaning.',
        ctaHref: '/signup?source=heritage-kitchen',
        ctaLabel: 'Join Heritage Kitchen',
        items: [
            {
                id: 'kid-friendly-recipes',
                name: 'Kid-Friendly Recipes',
                description: 'Step-by-step Caribbean cooking for kids',
                primaryHref: '/features/heritage-kitchen#kid-friendly-recipes',
                lessons: [
                    { title: 'Tropical Fruit Cup', duration: '12 min', objective: 'Follow safe prep steps', activity: 'Wash, peel, and assemble no-heat recipe.' },
                    { title: 'Mini Festival Bake', duration: '18 min', objective: 'Measure and mix', activity: 'Kid-led measuring with parent heat assist.' },
                    { title: 'Rainbow Veg Wraps', duration: '15 min', objective: 'Build balanced plate', activity: 'Color-based ingredient checklist.' },
                ],
            },
            {
                id: 'ingredient-fun-facts',
                name: 'Ingredient Fun Facts',
                description: 'Learn about Caribbean spices, fruits & herbs',
                primaryHref: '/features/heritage-kitchen#ingredient-fun-facts',
                lessons: [
                    { title: 'Spice Detective', duration: '8 min', objective: 'Identify 5 spices', activity: 'Guess by smell/look with fact reveal.' },
                    { title: 'Fruit Origin Trail', duration: '7 min', objective: 'Connect fruit to islands', activity: 'Map fruits to their Caribbean roots.' },
                    { title: 'Herb Match-Up', duration: '6 min', objective: 'Learn herb uses', activity: 'Match herb cards to dishes.' },
                ],
            },
            {
                id: 'culture-bites',
                name: 'Culture Bites',
                description: 'Food traditions and their island origins',
                primaryHref: '/features/heritage-kitchen#culture-bites',
                lessons: [
                    { title: 'Sunday Table Stories', duration: '9 min', objective: 'Discuss food traditions', activity: 'Family conversation cards around mealtime.' },
                    { title: 'Festival Foods', duration: '8 min', objective: 'Link foods to holidays', activity: 'Match traditional dishes to events.' },
                    { title: 'Then & Now Plate', duration: '10 min', objective: 'Understand food heritage', activity: 'Compare historical and modern versions.' },
                ],
            },
        ],
    },
};

export function isFeatureSuiteSlug(value: string): value is FeatureSuiteSlug {
    return value in FEATURE_SUITES;
}

export function getFeatureSuite(value: string): FeatureSuite | null {
    if (!isFeatureSuiteSlug(value)) return null;
    return FEATURE_SUITES[value];
}
