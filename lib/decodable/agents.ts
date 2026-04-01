/**
 * 📚 DECODABLE FACTORY v2.0 - AI Agent Layer
 * Multi-agent pipeline using Gemini 2.0 Flash
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    SYSTEM_PROMPTS, ART_PROMPT_PREFIX, ART_PROMPT_SUFFIX,
    STYLE_BIBLE, CHARACTER_BIBLE, getIslandPack
} from "./constants";
import { PhonicsControl, DecodableBookMetadata, PrintSpecs, CurriculumLevel, DecodableTextRules, IslandContentPack } from "./types";

function getGenAI(): GoogleGenerativeAI {
    // SECURITY: API Key should NEVER use NEXT_PUBLIC_ prefix
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    if (!apiKey) throw new Error("Missing Gemini API Key for Decodable Factory");
    return new GoogleGenerativeAI(apiKey);
}

async function callAgent(agentId: keyof typeof SYSTEM_PROMPTS, userPrompt: string): Promise<any> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    const systemInstruction = SYSTEM_PROMPTS[agentId];

    const result = await model.generateContent([
        { text: systemInstruction },
        { text: userPrompt }
    ]);

    const rawText = result.response.text();
    try {
        return JSON.parse(rawText);
    } catch {
        // Try to extract JSON from markdown code fence
        const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1].trim());
        }
        console.error(`[Agent ${agentId}] Non-JSON response:`, rawText.substring(0, 500));
        throw new Error(`Agent ${agentId} returned invalid JSON`);
    }
}

// ─── A1: STORY PLANNER ──────────────────────────────────────────

export async function planStory(
    metadata: DecodableBookMetadata,
    phonics: PhonicsControl,
    islandPack: IslandContentPack,
    textRules: DecodableTextRules
) {
    const storyPageCount = metadata.pages_total - 3; // minus cover, title, activity
    const prompt = `
BOOK: "${metadata.title}"
ISLAND: ${metadata.island_display_name}
LEVEL: ${metadata.level_id} (${metadata.phonics_focus})
STORY PAGES: ${storyPageCount}

ALLOWED WORDS (use ONLY these): ${phonics.allowed_words.join(", ")}
SIGHT WORDS: ${phonics.sight_words.join(", ")}
MAX WORDS PER SENTENCE: ${textRules.max_words_per_sentence}

ISLAND SETTINGS (for visual context only, not for printed words):
${islandPack.settings.join(", ")}

ISLAND PROPS (visual background only):
${islandPack.props.join(", ")}

Plan a ${storyPageCount}-page micro-arc with a beginning, middle, and end.
Each page's sentence must use ONLY allowed words.
    `.trim();

    return callAgent("planner", prompt);
}

// ─── A2: DECODABLE WRITER ────────────────────────────────────────

export async function writeStory(
    plan: any,
    phonics: PhonicsControl,
    textRules: DecodableTextRules,
    repairInstructions?: string[]
) {
    const prompt = `
PLAN: ${JSON.stringify(plan.per_page_word_plan || plan)}
ALLOWED WORDS: ${phonics.allowed_words.join(", ")}
SIGHT WORDS: ${phonics.sight_words.join(", ")}
MAX WORDS PER SENTENCE: ${textRules.max_words_per_sentence}
PUNCTUATION ALLOWED: ${textRules.punctuation_allowed.join(", ")}
${repairInstructions ? `\nREPAIR INSTRUCTIONS (fix these issues from previous attempt):\n${repairInstructions.join("\n")}` : ""}

Write exactly ONE sentence per story page. Use ONLY allowed words and sight words. End with a period.
    `.trim();

    return callAgent("writer", prompt);
}

// ─── A4: ART DIRECTOR ────────────────────────────────────────────

export async function generateArtPrompts(
    pages: any[],
    metadata: DecodableBookMetadata,
    islandPack: IslandContentPack
) {
    const prompt = `
BOOK: "${metadata.title}" — ${metadata.island_display_name}

STYLE BIBLE:
${JSON.stringify(STYLE_BIBLE.render_rules, null, 2)}

CHARACTER BIBLE:
Sam: ${CHARACTER_BIBLE.sam.description}. Wardrobe: ${CHARACTER_BIBLE.sam.wardrobe_rules.join(", ")}.
R.O.T.I. (optional background): ${CHARACTER_BIBLE.roti.description}. Rule: ${CHARACTER_BIBLE.roti.presence_rule}

ISLAND SETTINGS: ${islandPack.settings.join(" | ")}
ISLAND PROPS: ${islandPack.props.join(", ")}
ISLAND NATURE: Plants: ${islandPack.nature.plants.join(", ")}. Animals: ${islandPack.nature.animals.join(", ")}
ARCHITECTURE: ${islandPack.architecture.home_styles.join(", ")}. Colors: ${islandPack.architecture.colors.join(", ")}

GLOBAL ART PREFIX: ${ART_PROMPT_PREFIX}
GLOBAL ART SUFFIX: ${ART_PROMPT_SUFFIX}

NEGATIVE PROMPTS: ${STYLE_BIBLE.negative_prompts.join(", ")}

PAGE CONTENT:
${JSON.stringify(pages, null, 2)}

Generate an art prompt for EACH page. Include page_type (cover/title_page/story/activity).
Vary the island settings and props across pages.
    `.trim();

    return callAgent("art_director", prompt);
}

// ─── A5: LAYOUT COMPOSER ─────────────────────────────────────────

export async function composeLayout(pages: any[], specs: PrintSpecs) {
    const prompt = `
PAGES: ${JSON.stringify(pages)}
PRINT SPECS:
  Trim: ${specs.trim_size_in.width}" × ${specs.trim_size_in.height}" ${specs.trim_size_in.orientation}
  Bleed: ${specs.bleed_in}"
  Safe Margin: ${specs.safe_margin_in}"
  Text Zone: ${specs.text_zone.location}, min ${specs.text_zone.min_clear_height_percent}% clear
  Font: ${specs.text_zone.font_style_guidance.min_font_size_pt}-${specs.text_zone.font_style_guidance.max_font_size_pt}pt

Produce layout for each page with normalized (0-1) coordinates for text_zone_box.
Cover and title pages need title_zone_box_normalized_optional.
    `.trim();

    return callAgent("layout_composer", prompt);
}

// ─── A6: TEACHER GUIDE ───────────────────────────────────────────

export async function generateTeacherGuide(
    metadata: DecodableBookMetadata,
    storyPages: { page: number; text: string }[],
    phonics: PhonicsControl,
    level: CurriculumLevel
) {
    const prompt = `
BOOK: "${metadata.title}"
ISLAND: ${metadata.island_display_name}
LEVEL: ${metadata.level_id}
TARGET PHONICS: ${phonics.target_phonics.join(", ")}
ALLOWED WORDS: ${phonics.allowed_words.join(", ")}
SIGHT WORDS: ${phonics.sight_words.join(", ")}

STORY CONTENT:
${storyPages.map(p => `Page ${p.page}: "${p.text}"`).join("\n")}

Create a teacher guide with before/during/after reading sections.
Include a phonics mini-lesson for the target sounds.
    `.trim();

    return callAgent("teacher_guide", prompt);
}

// ─── A7: ASSESSMENT ──────────────────────────────────────────────

export async function generateAssessment(
    metadata: DecodableBookMetadata,
    phonics: PhonicsControl,
    level: CurriculumLevel
) {
    const prompt = `
BOOK: "${metadata.title}"
LEVEL: ${metadata.level_id}
TARGET PHONICS: ${phonics.target_phonics.join(", ")}
WORDS TO ASSESS: ${phonics.allowed_words.join(", ")}
SIGHT WORDS: ${phonics.sight_words.join(", ")}

Create assessment checkpoint with:
- Word reading checklist (each allowed word with its target phonics)
- 3-level fluency rubric (emerging, developing, fluent)
- 3 simple comprehension prompts about the story
    `.trim();

    return callAgent("assessment", prompt);
}
