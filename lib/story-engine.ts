
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SafetySetting } from "@google/generative-ai";
import { StoryBook, ReadingLevel, LanguageVariant } from "@/types/story";

export interface StoryInputs {
    tradition?: string;
    level?: string;
    island?: string;
    childName?: string;
    primaryIsland?: string;
    guide?: string;
    location?: string;
    mission?: string;
    storyLength?: string;
}


// Lazy init
const getGenAI = () => {
    const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
    if (!key) return null;
    return new GoogleGenerativeAI(key);
};

// STRICT Safety Settings
const safetySettings: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
];

export const STORYTELLER_V2_PROMPT = `
### SYSTEM ROLE
You are the "Likkle Legend Cultural Literacy Architect." You generate structured, 6-page phonics-based stories for children (ages 3-9) that blend Caribbean folklore with specific literacy goals.

### THE MISSION
Create a story that follows the provided "StoryBook" JSON schema exactly.

### LITERACY RULES (STRICT)
- **Emergent**: Short sentences (3-5 words). CVC words only. High repetition. Focus on phonemes like /s/ /a/ /t/ /p/.
- **Early**: 6-8 words per sentence. Include tricky words (e.g., "was", "the", "to"). Focus on digraphs (sh, ch, th).
- **Transitional**: Narrative flow, compound sentences, higher vocabulary (Tier 2 words).

### CHARACTER VOICES
- **Tanty Spice**: Warm, grandmotherly, wise. Caribbean storyteller register. Introduces the story and provides cultural context.
- **R.O.T.I**: Reading Optimized Teaching Intelligence. A playful robot who guides phonics practice. Asks questions like "Can you find the /s/ sound?"

### SCHEMA REQUIREMENTS (Return ONLY valid JSON)
- **book_meta**: Basic IDs and settings.
- **literacy_profile**: Specify the phonics targets based on the reading level.
- **folklore_profile**: Integrate a specific Caribbean tradition (Anansi, Papa Bois, etc.).
- **structure**: 6 pages. Each page must have:
    - "narrative_text": The story text.
    - "decodability_constraints": Matching the selected reading level.
    - "focus_words": 1-2 words to practice.
    - "guide_interventions": 1 line from Tanty (Cultural/Emotional) and 1 line from R.O.T.I (Literacy/Phonics).
    - "illustration_brief": Detailed prompt for a 2D island art style. Must describe the scene, characters (Anansi, etc.), and island setting. No text in images.
    - "audio_prompt": A clean version of the text for TTS.

### SAFETY
- NO scary elements. Proper COPPA compliance. Safe, joyful adventures.
`;

export async function generateStory(selection: StoryInputs): Promise<StoryBook | null> {
    const genAI = getGenAI();
    if (!genAI) return null;

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-pro-preview",
            safetySettings,
            generationConfig: { responseMimeType: "application/json" }
        });

        const userPrompt = `
            Create a StoryBook for ${selection.childName || "a Little Legend"}.
            - Folklore Tradition: ${selection.tradition || selection.mission || "Island Adventure"}
            - Reading Level: ${selection.level || (selection.storyLength === 'short' ? 'emergent' : 'early')}
            - Island: ${selection.island || selection.primaryIsland || "Trinidad"}
            
            Ensure the literacy focus matches the level:
            - emergent: Phonics s,a,t,p,i,n
            - early: Digraphs ch,sh,th
            - transitional: Narrative fluency
        `;

        const result = await model.generateContent(STORYTELLER_V2_PROMPT + "\n\n" + userPrompt);
        const text = result.response.text();
        let story = JSON.parse(text) as any;

        // Handle common JSON wrapping issues from Gemini
        if (story.StoryBook) {
            story = story.StoryBook;
        }

        // Handle structure mismatch (Gemini sometimes returns array instead of object with pages)
        if (Array.isArray(story.structure)) {
            story.structure = { pages: story.structure };
        }

        // Ensure IDs are set
        story.id = Math.random().toString(36).substring(7);
        return story as StoryBook;

    } catch (error) {
        console.error("[StoryEngine] Failed to generate story:", error);
        return null;
    }
}

export const generateCulturalStory = generateStory;


/**
 * 🖼️ Generate visuals for each page of the story
 */
export async function generateStoryImages(story: StoryBook): Promise<StoryBook> {
    const { generateImage } = await import("@/lib/ai-image-generator/image-client");

    // 1. Generate Cover Image
    const coverPrompt = `Book Cover: ${story.book_meta.title}. ${story.folklore_profile.core_tradition} in ${story.book_meta.setting_island}. Vibrant Caribbean colors.`;
    const coverUrl = await generateImage(coverPrompt, `cover-${story.id}`);
    if (coverUrl) story.book_meta.cover_image_url = coverUrl;

    // 2. Generate Page Images (parallelized)
    const pageImagePromises = story.structure.pages.map(async (page, idx) => {
        if (!page.illustration_brief) return;

        const pageUrl = await generateImage(
            `${page.illustration_brief}. 2D Illustration, vibrant, clean.`,
            `page-${story.id}-${idx}`
        );
        if (pageUrl) page.illustration_url = pageUrl;
    });

    await Promise.all(pageImagePromises);
    return story;
}

