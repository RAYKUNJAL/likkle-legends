/**
 * 🌴 ISLAND DECODABLE READER FACTORY v2.0 - Orchestrator
 * Multi-island, curriculum-aligned, phonics-controlled reader generation
 */

import * as agents from "../lib/decodable/agents";
import { validateDecodableText } from "../lib/decodable/validator";
import {
    getCurriculumLevel, getEffectiveTextRules, getIsland, getIslandPack,
    DEFAULT_PHONICS_CONTROL, DEFAULT_PRINT_SPECS, getDefaultActivityPage
} from "../lib/decodable/constants";
import {
    GenerationRequest,
    MasterDecodableManifest,
    DecodableBookMetadata,
    ValidationReport,
    CurriculumLevel
} from "../lib/decodable/types";

/**
 * Main entry point. Takes a GenerationRequest and runs the full pipeline.
 */
export async function generateDecodableBook(request: GenerationRequest): Promise<MasterDecodableManifest> {
    const {
        book_title, island_id, level_id, phonics_focus,
        target_phonics, allowed_words, sight_words,
        page_count, settings
    } = request;

    console.log(`[DecodableFactory v2] ═══════════════════════════════════`);
    console.log(`[DecodableFactory v2] 📚 "${book_title}"`);
    console.log(`[DecodableFactory v2] 🏝️  Island: ${island_id} | Level: ${level_id}`);

    // ── Resolve Island & Curriculum ─────────────────────────
    const island = getIsland(island_id);
    const islandName = island?.display_name || island_id;
    const islandPack = getIslandPack(island?.cultural_pack_id || "cp_tt");

    const curriculumLevel = getCurriculumLevel(level_id);
    const effectiveLevel: CurriculumLevel = curriculumLevel || {
        level_id, target_phonics, sight_words, allowed_words
    };
    const textRules = getEffectiveTextRules(effectiveLevel);

    // Merge request phonics with curriculum defaults
    const phonics = {
        ...DEFAULT_PHONICS_CONTROL,
        target_phonics: target_phonics.length > 0 ? target_phonics : effectiveLevel.target_phonics,
        allowed_words: allowed_words.length > 0 ? allowed_words : effectiveLevel.allowed_words,
        sight_words: sight_words.length > 0 ? sight_words : effectiveLevel.sight_words
    };

    const metadata: DecodableBookMetadata = {
        title: book_title,
        author_line: "by Likkle Legends",
        island_id,
        island_display_name: islandName,
        version: "v2.0",
        level_id,
        phonics_focus,
        pages_total: page_count
    };

    // Use island pack settings if none provided
    const effectiveSettings = settings.length > 0 ? settings : islandPack.settings;

    // ── A1: PLANNER ─────────────────────────────────────────
    console.log(`[DecodableFactory v2] ▶ A1: Planning story arc...`);
    const plan = await agents.planStory(metadata, phonics, islandPack, textRules);
    console.log(`[DecodableFactory v2] ✓ A1: Plan ready`);

    // ── A2: WRITER ──────────────────────────────────────────
    console.log(`[DecodableFactory v2] ▶ A2: Writing decodable text...`);
    let writtenPages = await agents.writeStory(plan, phonics, textRules);
    console.log(`[DecodableFactory v2] ✓ A2: ${writtenPages.story_pages?.length || 0} pages written`);

    // ── A3: LOCAL VALIDATOR (deterministic, instant) ─────────
    console.log(`[DecodableFactory v2] ▶ A3: Validating text (local)...`);
    let validation: ValidationReport = validateDecodableText(
        writtenPages.story_pages || [],
        phonics,
        textRules
    );
    console.log(`[DecodableFactory v2] ${validation.status === 'pass' ? '✓' : '✗'} A3: ${validation.status.toUpperCase()} (${validation.violations.length} violations)`);

    // ── RETRY LOOP (max 2 retries) ──────────────────────────
    let retries = 0;
    while (validation.status === 'fail' && retries < 2) {
        retries++;
        console.log(`[DecodableFactory v2] 🔄 Retry #${retries}: Rewriting with repair instructions...`);
        writtenPages = await agents.writeStory(plan, phonics, textRules, validation.repair_instructions);
        validation = validateDecodableText(writtenPages.story_pages || [], phonics, textRules);
        console.log(`[DecodableFactory v2] ${validation.status === 'pass' ? '✓' : '✗'} Retry #${retries}: ${validation.status.toUpperCase()}`);
    }

    // ── A4: ART DIRECTOR ────────────────────────────────────
    console.log(`[DecodableFactory v2] ▶ A4: Generating art prompts...`);
    const allPages = [
        { page: 1, type: 'cover', text: book_title },
        { page: 2, type: 'title_page', text: book_title },
        ...(writtenPages.story_pages || []).map((p: any) => ({ ...p, type: 'story' })),
        { page: page_count, type: 'activity', text: 'Activity Page' }
    ];
    const artManifest = await agents.generateArtPrompts(allPages, metadata, islandPack);
    console.log(`[DecodableFactory v2] ✓ A4: ${artManifest.art_prompt_manifest?.length || 0} art prompts`);

    // ── A5: LAYOUT COMPOSER ─────────────────────────────────
    console.log(`[DecodableFactory v2] ▶ A5: Composing layouts...`);
    const layoutManifest = await agents.composeLayout(allPages, DEFAULT_PRINT_SPECS);
    console.log(`[DecodableFactory v2] ✓ A5: Layout ready`);

    // ── A6: TEACHER GUIDE ───────────────────────────────────
    console.log(`[DecodableFactory v2] ▶ A6: Writing teacher guide...`);
    const teacherGuideResult = await agents.generateTeacherGuide(
        metadata, writtenPages.story_pages || [], phonics, effectiveLevel
    );
    console.log(`[DecodableFactory v2] ✓ A6: Teacher guide ready`);

    // ── A7: ASSESSMENT ──────────────────────────────────────
    console.log(`[DecodableFactory v2] ▶ A7: Creating assessment...`);
    const assessmentResult = await agents.generateAssessment(metadata, phonics, effectiveLevel);
    console.log(`[DecodableFactory v2] ✓ A7: Assessment ready`);

    // ── FINAL PACKAGING ─────────────────────────────────────
    const activityDefaults = getDefaultActivityPage(effectiveLevel);
    const finalManifest: MasterDecodableManifest = {
        schema_version: "LL_DECODABLE_FACTORY_v2.0",
        book_metadata: metadata,
        page_text_manifest: {
            cover_title: book_title.toUpperCase(),
            title_page_title: book_title,
            title_page_author: metadata.author_line,
            story_pages: writtenPages.story_pages || [],
            activity_page: {
                page: page_count,
                activity_type: activityDefaults.activity_type,
                trace_words: activityDefaults.trace_words,
                circle_prompt: activityDefaults.circle_prompt,
                read_list: activityDefaults.read_list
            }
        },
        art_prompt_manifest: artManifest.art_prompt_manifest || [],
        layout_manifest: layoutManifest.layout_manifest || [],
        validation_report: validation,
        teacher_guide: teacherGuideResult.teacher_guide || teacherGuideResult,
        assessment: assessmentResult.assessment || assessmentResult,
        export_targets: [
            { type: "PDF_PRINT", spec: "8.5x11_full_bleed_0.125in_bleed_0.5in_safe" },
            { type: "DOC_TEACHER_GUIDE", spec: `teacher_guide_${level_id}` },
            { type: "ASSESSMENT_SHEET", spec: `assessment_${level_id}` },
            { type: "IN_APP_MANIFEST", spec: "likkle_legends_reader_v2" }
        ]
    };

    console.log(`[DecodableFactory v2] ═══════════════════════════════════`);
    console.log(`[DecodableFactory v2] ✅ PRODUCTION COMPLETE`);
    console.log(`[DecodableFactory v2]    Pages: ${finalManifest.page_text_manifest.story_pages.length}`);
    console.log(`[DecodableFactory v2]    Validation: ${validation.status}`);
    console.log(`[DecodableFactory v2]    Art Prompts: ${finalManifest.art_prompt_manifest.length}`);
    console.log(`[DecodableFactory v2] ═══════════════════════════════════`);

    return finalManifest;
}
