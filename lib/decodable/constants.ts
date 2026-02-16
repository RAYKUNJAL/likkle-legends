/**
 * 📚 ISLAND DECODABLE READER FACTORY v2.0 - Constants
 * Multi-island configs, curriculum levels, style bible, system prompts
 */

import {
    PhonicsControl, PrintSpecs, StyleBible, CharacterEntry,
    IslandEntry, IslandContentPack, CurriculumLevel, DecodableTextRules
} from "./types";

// ─── DEFAULT TEXT RULES ──────────────────────────────────────────

export const DEFAULT_TEXT_RULES: DecodableTextRules = {
    one_sentence_per_page: true,
    max_words_per_sentence: 6,
    punctuation_allowed: [".", "?"],
    no_dialogue_quotes: true,
    no_contractions: true,
    no_rhyming_forced: true
};

// ─── CURRICULUM SPINE ────────────────────────────────────────────

export const CURRICULUM_LEVELS: CurriculumLevel[] = [
    {
        level_id: "L0_pre_reader",
        focus: ["phonemic_awareness", "print_concepts"],
        decodable_required: false,
        target_phonics: [],
        sight_words: [],
        allowed_words: []
    },
    {
        level_id: "L1_cvc_short_a",
        target_phonics: ["a_short", "m", "s", "t", "p", "n"],
        sight_words: ["a", "am"],
        allowed_words: ["a", "am", "Sam", "sat", "mat", "pan", "pat", "tap", "tan", "map"],
        sentence_rules_override: { max_words_per_sentence: 4, punctuation_allowed: ["."] }
    },
    {
        level_id: "L2_cvc_short_i",
        target_phonics: ["i_short", "m", "s", "t", "p", "n"],
        sight_words: ["a", "am", "I"],
        allowed_words: ["a", "am", "I", "Sam", "sit", "tip", "sip", "pin", "nip", "Tim", "mit", "pit", "tin", "sin", "it", "in", "is"]
    },
    {
        level_id: "L3_cvc_short_o",
        target_phonics: ["o_short", "m", "s", "t", "p", "n"],
        sight_words: ["a", "am", "I", "the"],
        allowed_words: ["a", "am", "I", "the", "Sam", "Tom", "pot", "top", "mop", "not", "pop", "stop", "on", "hot", "got", "nod", "tom"]
    },
    {
        level_id: "L4_cvc_short_u",
        target_phonics: ["u_short", "m", "s", "t", "p", "n", "b"],
        sight_words: ["a", "am", "I", "the", "is"],
        allowed_words: ["a", "am", "I", "the", "is", "Sam", "bus", "sun", "tub", "mug", "but", "nut", "up", "pup", "sub", "us", "bun", "fun", "run"]
    }
];

export function getCurriculumLevel(levelId: string): CurriculumLevel | undefined {
    return CURRICULUM_LEVELS.find(l => l.level_id === levelId);
}

export function getEffectiveTextRules(level: CurriculumLevel): DecodableTextRules {
    return { ...DEFAULT_TEXT_RULES, ...level.sentence_rules_override };
}

// ─── PHONICS CONTROL (defaults to L1) ───────────────────────────

export const DEFAULT_PHONICS_CONTROL: PhonicsControl = {
    target_phonics: CURRICULUM_LEVELS[1].target_phonics,
    allowed_words: CURRICULUM_LEVELS[1].allowed_words,
    sight_words: CURRICULUM_LEVELS[1].sight_words,
    banned_patterns: {
        no_new_words: true,
        no_inflections: true,
        no_plural_s: true,
        no_articles_other_than_a: true,
        no_names_other_than_sam: true
    }
};

// ─── PRINT SPECS ─────────────────────────────────────────────────

export const DEFAULT_PRINT_SPECS: PrintSpecs = {
    trim_size_in: { width: 8.5, height: 11.0, orientation: "portrait" },
    bleed_in: 0.125,
    safe_margin_in: 0.5,
    text_zone: {
        location: "lower_third",
        min_clear_height_percent: 33,
        text_alignment: "center",
        font_style_guidance: {
            font_family_preference: ["Rounded Sans", "Friendly Sans"],
            font_weight: "semi_bold",
            min_font_size_pt: 38,
            max_font_size_pt: 64,
            line_spacing: 1.0
        }
    }
};

// ─── STYLE BIBLE ─────────────────────────────────────────────────

export const STYLE_BIBLE: StyleBible = {
    style_name: "Pixar-like 3D storybook",
    render_rules: {
        lighting: "warm golden light",
        palette: "Caribbean vibrant + warm neutrals",
        composition: "clean uncluttered, strong focal point, lower third clear",
        camera: "eye-level kid view, gentle depth of field",
        texture: "soft realism, friendly rounded forms"
    },
    negative_prompts: [
        "text", "watermark", "logo",
        "copyrighted characters",
        "photorealistic adult look",
        "scary", "violence",
        "busy clutter in lower third"
    ],
    consistency_checks: {
        character_drift_check: true,
        color_palette_lock_check: true,
        lower_third_clear_check: true
    }
};

// ─── CHARACTER BIBLE ─────────────────────────────────────────────

export const CHARACTER_BIBLE: Record<string, CharacterEntry> = {
    sam: {
        role: "main",
        name: "Sam",
        description: "cheerful Caribbean child, brown skin, short curly hair, bright friendly expression",
        wardrobe_rules: ["simple t-shirt", "shorts or comfy pants", "bright friendly colors", "no logos"],
        emotion_range: ["happy", "curious", "proud", "calm"],
        do_not_change: ["skin_tone_range", "hair_type", "friendly_expression"]
    },
    roti: {
        role: "optional_background_buddy",
        name: "R.O.T.I.",
        description: "small friendly helper robot, round body, tiny arms, friendly eyes",
        wardrobe_rules: [],
        presence_rule: "optional cameo only; mid/background; never the focal point",
        do_not_change: ["round_body", "friendly_eyes", "small_scale"]
    }
};

// ─── ISLAND REGISTRY ─────────────────────────────────────────────

export const ISLAND_REGISTRY: IslandEntry[] = [
    { island_id: "tt", display_name: "Trinidad & Tobago", language_mode: "en", cultural_pack_id: "cp_tt" },
    { island_id: "jm", display_name: "Jamaica", language_mode: "en", cultural_pack_id: "cp_jm" },
    { island_id: "bb", display_name: "Barbados", language_mode: "en", cultural_pack_id: "cp_bb" },
    { island_id: "gy", display_name: "Guyana", language_mode: "en", cultural_pack_id: "cp_gy" },
    { island_id: "lc", display_name: "Saint Lucia", language_mode: "en", cultural_pack_id: "cp_lc" },
    { island_id: "kn", display_name: "Saint Kitts & Nevis", language_mode: "en", cultural_pack_id: "cp_kn" },
    { island_id: "ag", display_name: "Antigua & Barbuda", language_mode: "en", cultural_pack_id: "cp_ag" },
    { island_id: "bs", display_name: "The Bahamas", language_mode: "en", cultural_pack_id: "cp_bs" },
    { island_id: "vc", display_name: "St. Vincent & Grenadines", language_mode: "en", cultural_pack_id: "cp_vc" },
    { island_id: "gd", display_name: "Grenada", language_mode: "en", cultural_pack_id: "cp_gd" },
    { island_id: "dm", display_name: "Dominica", language_mode: "en", cultural_pack_id: "cp_dm" },
    { island_id: "bz", display_name: "Belize", language_mode: "en", cultural_pack_id: "cp_bz" },
    { island_id: "ht", display_name: "Haiti", language_mode: "ht_cr", cultural_pack_id: "cp_ht" },
    { island_id: "sr", display_name: "Suriname", language_mode: "nl", cultural_pack_id: "cp_sr" },
];

export function getIsland(islandId: string): IslandEntry | undefined {
    return ISLAND_REGISTRY.find(i => i.island_id === islandId);
}

// ─── ISLAND CONTENT PACKS ────────────────────────────────────────

export const ISLAND_CONTENT_PACKS: Record<string, IslandContentPack> = {
    cp_tt: {
        cultural_pack_id: "cp_tt",
        settings: ["Trinidad neighborhood street", "simple Trinidad kitchen", "yard with tropical plants", "veranda of a bright-colored house", "roadside doubles stand"],
        props: ["steelpan drum", "carnival headpiece on shelf", "doubles wrapper", "mango tree", "hummingbird feeder"],
        nature: { plants: ["hibiscus", "bougainvillea", "mango tree", "coconut palm"], animals: ["red howler monkey", "scarlet ibis", "iguana", "hummingbird"], weather_vibes: ["sunny and warm", "brief tropical rain", "golden afternoon"] },
        architecture: { home_styles: ["wooden house on stilts", "painted concrete bungalow", "gingerbread fretwork trim"], colors: ["coral pink", "sky blue", "sunshine yellow", "mint green"], street_elements: ["fruit cart", "colorful maxi taxi", "old-fashioned lamppost"] },
        food_safe_mentions: { mode: "optional_visual_only", items: ["doubles", "bake and shark", "mango", "coconut water", "roti"] },
        sensitivity_rules: { avoid_stereotypes: true, avoid_political_claims: true, respect_all_representations: true }
    },
    cp_jm: {
        cultural_pack_id: "cp_jm",
        settings: ["Jamaican seaside village", "simple kitchen with window view of Blue Mountains", "schoolyard with breadfruit tree", "red dirt yard with clothesline"],
        props: ["ackee tree", "jerk drum", "fishing net", "domino table", "cricket bat"],
        nature: { plants: ["ackee tree", "breadfruit", "blue mahoe", "lignum vitae"], animals: ["doctor bird hummingbird", "green turtle", "mongoose", "yellow snake"], weather_vibes: ["bright sunshine", "cool mountain breeze", "soft sea wind"] },
        architecture: { home_styles: ["wooden cottage", "zinc roof chattel house", "painted garden wall"], colors: ["emerald green", "gold yellow", "jet black", "ocean blue"], street_elements: ["hand cart vendor", "old wooden school building", "stone wall"] },
        food_safe_mentions: { mode: "optional_visual_only", items: ["ackee", "bammy", "patty", "sorrel", "festival"] },
        sensitivity_rules: { avoid_stereotypes: true, avoid_political_claims: true, respect_all_representations: true }
    },
    cp_bb: {
        cultural_pack_id: "cp_bb",
        settings: ["Barbados chattel house neighborhood", "coral stone beach path", "sugarcane field edge", "open-air fish market"],
        props: ["flying fish kite", "cricket ball", "wooden chattel house shutters", "conch shell"],
        nature: { plants: ["sugarcane", "golden apple tree", "flamboyant tree", "sea grape"], animals: ["green monkey", "flying fish", "hawksbill turtle", "egret"], weather_vibes: ["constant trade wind breeze", "warm golden sunshine", "clear starry night"] },
        architecture: { home_styles: ["chattel house", "coral stone cottage", "plantation-style great house"], colors: ["turquoise", "coral", "white wash", "pastel pink"], street_elements: ["rum shop bench", "wooden bus stop", "stone church"] },
        food_safe_mentions: { mode: "optional_visual_only", items: ["flying fish", "cou cou", "macaroni pie", "tamarind ball"] },
        sensitivity_rules: { avoid_stereotypes: true, avoid_political_claims: true, respect_all_representations: true }
    },
    cp_gy: {
        cultural_pack_id: "cp_gy",
        settings: ["Georgetown wooden house veranda", "Rupununi savannah edge", "Demerara river bank", "simple market stall"],
        props: ["benab hut shade", "cassava bread", "hammock", "wooden boat"],
        nature: { plants: ["victoria amazonica lily", "mora tree", "cassava plant", "coconut palm"], animals: ["jaguar (background)", "giant river otter", "harpy eagle", "caiman"], weather_vibes: ["lush tropical rain", "golden morning mist", "warm humid afternoon"] },
        architecture: { home_styles: ["stilted wooden house", "painted Demerara window shutters", "tin-roofed market"], colors: ["forest green", "river brown", "golden yellow", "sky blue"], street_elements: ["seawall bench", "market cart", "fire hydrant painted bright"] },
        food_safe_mentions: { mode: "optional_visual_only", items: ["pepperpot", "metemgee", "cassava bread", "coconut water"] },
        sensitivity_rules: { avoid_stereotypes: true, avoid_political_claims: true, respect_all_representations: true }
    }
};

export function getIslandPack(packId: string): IslandContentPack {
    return ISLAND_CONTENT_PACKS[packId] || ISLAND_CONTENT_PACKS["cp_tt"]; // Default to TT
}

// ─── SYSTEM PROMPTS (v2.0) ───────────────────────────────────────

export const SYSTEM_PROMPTS = {
    orchestrator: `You are the Likkle Legends Decodable Factory v2.0. Output must be valid JSON only.
You must obey the allowed_words list strictly. If a word is not in allowed_words or sight_words, you must not use it.
One sentence per story page. Use only allowed punctuation. Do not add extra commentary.
Respect island cultural context but do NOT introduce printed words outside the allowed list.`,

    planner: `You are a Story Planner for an early decodable reader.
Plan a story arc using ONLY the allowed words list. Map page numbers to target words for repetition.
Create a simple beginning-middle-end arc. Each page should introduce or repeat target words.
The story must be set in the given Caribbean island context.
Return valid JSON with: { "story_arc_outline": string, "per_page_word_plan": [{ "page": number, "target_words": string[], "scene_intent": string }] }`,

    writer: `You are a Decodable Writer. Write ONE short sentence per story page using ONLY allowed_words and sight_words.
Follow the max words per sentence rule. Use only allowed punctuation. No contractions, no quotes.
Proper nouns must be capitalized correctly.
Return valid JSON: { "story_pages": [{ "page": number, "text": string }] }`,

    validator: `You are a Decodable QA Agent. Check each sentence token-by-token against the allowed word list.
Strip punctuation before checking. Verify: word count per sentence, punctuation rules, capitalization of proper nouns.
Return valid JSON: { "status": "pass"|"fail", "violations": [{ "page": number, "word": string, "reason": string }], "word_inventory_used": string[], "repair_instructions": string[] }`,

    art_director: `You are an Art Director for Caribbean children's picture books.
For each page, write an artwork prompt following the style bible exactly. Ensure:
- Lower third is ALWAYS clear for text overlay
- Character descriptions match the character bible exactly
- Setting matches the island content pack
- No text, watermarks, or logos in the image
- Include the character's emotion for this scene
Return valid JSON: { "art_prompt_manifest": [{ "page_number": number, "page_type": string, "prompt": string, "negative_prompt": string[], "must_include": string[], "must_avoid": string[], "setting": string, "character_emotion": string }] }`,

    layout_composer: `Produce layout instructions per page with normalized coordinates.
Text zone in lower third. Bleed and safe margins as specified.
Cover and title pages need title zone placement.
Return valid JSON: { "layout_manifest": [{ "page_number": number, "trim_size_in": { "width": number, "height": number }, "bleed_in": number, "safe_margin_in": number, "text_zone_box_normalized": { "x": number, "y": number, "w": number, "h": number }, "title_zone_box_normalized_optional": object|null }] }`,

    teacher_guide: `You are a Teacher Guide Writer for structured literacy decodable readers.
Create a teaching guide with before/during/after reading sections and a phonics mini-lesson.
Return valid JSON: { "teacher_guide": { "book_title": string, "level_id": string, "island": string, "before_reading": { "vocabulary_preview": string[], "phonics_focus_statement": string, "discussion_prompt": string }, "during_reading": { "page_tips": [{ "page": number, "tip": string }] }, "after_reading": { "comprehension_questions": string[], "extension_activity": string }, "phonics_mini_lesson": { "target_sound": string, "example_words": string[], "activity": string } } }`,

    assessment: `Create an assessment checkpoint for the decodable reader level.
Include word reading checklist, fluency rubric, and comprehension prompts.
Return valid JSON: { "assessment": { "book_title": string, "level_id": string, "word_reading_checklist": [{ "word": string, "target_phonics": string, "mastered": null }], "fluency_rubric": [{ "level": string, "descriptor": string }], "comprehension_prompts": string[] } }`
};

// ─── ART PROMPT WRAPPER ──────────────────────────────────────────

export const ART_PROMPT_PREFIX = "Children's picture book illustration, Pixar-like 3D storybook style, warm golden light, vibrant Caribbean colors, clean uncluttered composition, eye-level kid view, gentle depth of field, soft realism, friendly rounded forms, lower third empty space reserved for text, no words in image.";
export const ART_PROMPT_SUFFIX = "High quality, kid-friendly, safe, soft depth of field, cinematic warmth.";

// ─── ACTIVITY PAGE DEFAULTS ──────────────────────────────────────

export function getDefaultActivityPage(level: CurriculumLevel) {
    return {
        activity_type: `${level.level_id}_word_hunt_and_trace`,
        trace_words: level.allowed_words.filter(w => w.length > 1 && w !== "am"),
        circle_prompt: `Circle: ${level.sight_words.join(" ")} ${level.allowed_words[2] || ""}`,
        read_list: level.allowed_words
    };
}
