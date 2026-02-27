'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { getNextActivityRecommendation, CurriculumInput } from '@/lib/registries/curriculum';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlanActivity {
    title: string;
    type: 'lesson_micro' | 'quiz_micro' | 'story_short' | 'song_video_script' | 'printable' | 'game';
    characterGuide: string;
    domain: string;
    duration: number;
    xpReward: number;
    description: string;
    contentId?: string;
}

export interface PlanDay {
    day: string;
    activities: PlanActivity[];
}

export interface PlanWeek {
    weekNumber: number;
    theme: string;
    curriculumStandard: string;
    characterGuide: string;
    days: PlanDay[];
}

export interface LearningPlan {
    id: string;
    child_id: string;
    plan_name: string;
    focus_areas: string[];
    learning_style: string;
    daily_minutes: number;
    primary_goal: string;
    preferred_character: string;
    plan_data: {
        weeks: PlanWeek[];
        tierLevel: string;
        weeksUnlocked: number;
        generatedAt: string;
        progressScore?: number;
    };
    curriculum_standard: string;
    island_theme: string | null;
    is_active: boolean;
    created_at: string;
}

export interface GeneratePlanInput {
    childId: string;
}

// ─── Tier Helpers ─────────────────────────────────────────────────────────────

const TIER_LEVELS: Record<string, number> = {
    'free': 0, 'plan_free_forever': 0,
    'starter_mailer': 1, 'plan_mail_intro': 1, 'plan_digital_legends': 1,
    'legends_plus': 2, 'plan_legends_plus': 2,
    'family_legacy': 3, 'plan_family_legacy': 3,
    'admin': 10,
};

function getWeeksForTier(tier: string): number {
    const level = TIER_LEVELS[tier] ?? 0;
    if (level >= 3) return 4; // family_legacy
    if (level >= 2) return 4; // legends_plus
    if (level >= 1) return 4; // starter
    return 1; // free — trial week only
}

// ─── Character → Domain Mapping ───────────────────────────────────────────────

const CHARACTER_DOMAINS: Record<string, string[]> = {
    roti: ['literacy', 'math'],
    tanty_spice: ['culture', 'social'],
    dilly_doubles: ['social', 'music'],
    benny: ['science', 'literacy'],
};

const DOMAIN_CHARACTERS: Record<string, string> = {
    literacy: 'roti',
    math: 'roti',
    science: 'benny',
    culture: 'tanty_spice',
    social: 'dilly_doubles',
    music: 'dilly_doubles',
};

// ─── OECS Curriculum Standards by age ─────────────────────────────────────────

function getCurriculumStandards(age: number): Record<string, string> {
    if (age <= 4) return {
        literacy: 'OECS ECC Strand 1: Emergent Literacy — letter recognition, oral language',
        math: 'OECS ECC Strand 2: Number sense 1–10, shapes, sorting',
        science: 'OECS ECC Strand 3: Nature exploration, five senses',
        culture: 'OECS ECC Strand 4: Caribbean heritage, community roles',
        social: 'OECS ECC Strand 5: Emotions, sharing, cooperation',
        music: 'OECS ECC Strand 6: Rhythm, Caribbean nursery rhymes',
    };
    if (age <= 6) return {
        literacy: 'OECS Grade 1: Phonics, CVC words, reading fluency 50 wpm',
        math: 'OECS Grade 1: Numbers to 100, addition to 20, basic geometry',
        science: 'OECS Grade 1: Living/non-living, plants and animals of the Caribbean',
        culture: 'CPEA Social Studies: Caribbean identity, family structures, national symbols',
        social: 'OECS Grade 1: Self-awareness, conflict resolution, manners',
        music: 'OECS Grade 1: Soca, calypso, steelpan appreciation',
    };
    return {
        literacy: 'OECS Grade 3–4: Reading comprehension, writing paragraphs, vocabulary',
        math: 'OECS Grade 3–4: Multiplication, fractions, measurement, word problems',
        science: 'OECS Grade 3–4: Ecosystems, weather, forces and motion',
        culture: 'CPEA Social Studies: Caribbean history, trade routes, historical figures',
        social: 'OECS Grade 3: Leadership, teamwork, community responsibility',
        music: 'OECS Grade 3: Rhythm notation, folk songs, Caribbean composers',
    };
}

// ─── Fallback Plan Builder (no Gemini) ────────────────────────────────────────

function buildFallbackPlan(
    child: any,
    quizResults: any,
    weeksCount: number,
    availableContent: any[]
): PlanWeek[] {
    const age = child.age_years || child.age || 5;
    const focusAreas: string[] = quizResults?.focus_areas || ['literacy', 'culture'];
    const preferredChar: string = quizResults?.preferred_character || 'roti';
    const dailyMinutes: number = quizResults?.daily_minutes || 30;
    const standards = getCurriculumStandards(age);

    const WEEK_THEMES = [
        'Island Explorer', 'Caribbean Roots', 'Legend in the Making', 'The Great Adventure'
    ];

    const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return Array.from({ length: weeksCount }, (_, wi) => {
        const weekNum = wi + 1;
        const theme = WEEK_THEMES[wi] || `Week ${weekNum} Journey`;
        const primaryFocus = focusAreas[wi % focusAreas.length];
        const secondaryFocus = focusAreas[(wi + 1) % focusAreas.length];
        const charGuide = CHARACTER_DOMAINS[preferredChar]?.includes(primaryFocus)
            ? preferredChar
            : (DOMAIN_CHARACTERS[primaryFocus] || preferredChar);
        const standard = standards[primaryFocus] || 'OECS Caribbean Primary';

        const days: PlanDay[] = DAY_NAMES.map((day, di) => {
            const input: CurriculumInput = {
                child_age: age,
                learning_goals: focusAreas,
                attention_span_minutes: dailyMinutes,
            };
            const rec = getNextActivityRecommendation(input);
            const domainCycle = focusAreas[di % focusAreas.length];
            const actChar = DOMAIN_CHARACTERS[domainCycle] || preferredChar;

            const activities: PlanActivity[] = [];

            // Main lesson activity
            activities.push({
                title: `${day} ${domainCycle.charAt(0).toUpperCase() + domainCycle.slice(1)} with ${actChar === 'roti' ? 'R.O.T.I.' : actChar === 'tanty_spice' ? 'Tanty Spice' : actChar === 'dilly_doubles' ? 'Dilly Doubles' : 'Benny'}`,
                type: 'lesson_micro',
                characterGuide: actChar,
                domain: domainCycle,
                duration: Math.min(dailyMinutes, 15),
                xpReward: 50,
                description: `Explore ${domainCycle} through Caribbean-themed interactive activities. Focus on ${standard}.`,
            });

            // Second activity if daily minutes allow
            if (dailyMinutes >= 25) {
                const storyChar = 'tanty_spice';
                activities.push({
                    title: 'Story Island — Read Aloud',
                    type: 'story_short',
                    characterGuide: storyChar,
                    domain: 'literacy',
                    duration: 10,
                    xpReward: 30,
                    description: 'Tanty Spice reads an island story to build vocabulary and listening skills.',
                });
            }

            // Third activity: culture/fun
            if (dailyMinutes >= 40) {
                activities.push({
                    title: 'Dilly\'s Movement Break',
                    type: 'game',
                    characterGuide: 'dilly_doubles',
                    domain: 'social',
                    duration: 10,
                    xpReward: 20,
                    description: 'Dilly Doubles leads an energizing Caribbean-themed movement activity to keep the vibes high!',
                });
            }

            return { day, activities };
        });

        return { weekNumber: weekNum, theme, curriculumStandard: standard, characterGuide: charGuide, days };
    });
}

// ─── Gemini Plan Builder ──────────────────────────────────────────────────────

async function buildGeminiPlan(
    child: any,
    quizResults: any,
    weeksCount: number,
    contentList: string,
): Promise<PlanWeek[] | null> {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const age = child.age_years || child.age || 5;
    const name = child.child_name || child.name || 'your little legend';
    const focusAreas = quizResults?.focus_areas || ['literacy', 'culture'];
    const preferredChar = quizResults?.preferred_character || 'roti';
    const dailyMinutes = quizResults?.daily_minutes || 30;
    const primaryGoal = quizResults?.primary_goal || 'build_confidence';
    const learningStyle = quizResults?.learning_style || 'story';
    const standards = getCurriculumStandards(age);

    const standardsSummary = focusAreas
        .map((f: string) => `${f}: ${standards[f] || 'OECS Caribbean Primary'}`)
        .join('\n');

    const prompt = `
You are the Likkle Legends AI Curriculum Architect. You design world-class Caribbean homeschool learning plans for kids aged 3–9, grounded in OECS and CPEA curriculum frameworks.

**Child Profile:**
- Name: ${name}
- Age: ${age} years old
- Learning focus areas: ${focusAreas.join(', ')}
- Preferred learning style: ${learningStyle}
- Daily learning time: ${dailyMinutes} minutes
- Primary goal: ${primaryGoal}
- Favourite character guide: ${preferredChar}

**Curriculum Standards to address:**
${standardsSummary}

**Available content from our library:**
${contentList || 'General Caribbean educational content'}

**Characters available as guides:**
- R.O.T.I. (roti): Curriculum coach — Literacy, Math, structured lessons. Warm but firm.
- Tanty Spice (tanty_spice): Storyteller — Stories, culture, bedtime, emotional learning.
- Dilly Doubles (dilly_doubles): Hype-man — Games, music, social skills, celebration.
- Benny of Shadows (benny): Explorer — Reading focus, science/nature, quiet discovery.

**Your task:**
Generate a ${weeksCount}-week daily learning plan. Each week has 5 school days (Mon–Fri). Each day has 2–3 activities based on ${dailyMinutes} min/day. Vary character guides across days for engagement.

Return ONLY valid JSON matching this exact structure:
{
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Island Explorer",
      "curriculumStandard": "OECS Grade 1: Phonics and letter recognition",
      "characterGuide": "roti",
      "days": [
        {
          "day": "Monday",
          "activities": [
            {
              "title": "Letters with R.O.T.I.",
              "type": "lesson_micro",
              "characterGuide": "roti",
              "domain": "literacy",
              "duration": 10,
              "xpReward": 50,
              "description": "Caribbean phonics adventure — learn A is for Anansi, B is for Breadfruit!"
            }
          ]
        }
      ]
    }
  ]
}

Activity types: lesson_micro, quiz_micro, story_short, song_video_script, printable, game
Domains: literacy, math, science, culture, social, music
Keep descriptions warm, Caribbean, encouraging. Reference island life, folklore, food, and nature.
Do NOT include markdown code fences. Return only the JSON object.
`;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 8192 },
        });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const parsed = JSON.parse(text);
        if (parsed?.weeks && Array.isArray(parsed.weeks)) {
            return parsed.weeks as PlanWeek[];
        }
        return null;
    } catch (err) {
        console.error('[generate-plan] Gemini failed, using fallback:', err);
        return null;
    }
}

// ─── Main Action ──────────────────────────────────────────────────────────────

export async function generatePlanAction(input: GeneratePlanInput): Promise<{
    success: boolean;
    plan?: LearningPlan;
    trialMode?: boolean;
    error?: string;
}> {
    const supabase = createClient();

    // 1. Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Not authenticated' };

    // 2. Fetch child (verify ownership)
    const { data: child, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', input.childId)
        .eq('parent_id', user.id)
        .single();

    if (childError || !child) return { success: false, error: 'Child not found' };

    // 3. Get parent subscription tier
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', user.id)
        .single();

    const tier = profile?.subscription_tier || 'free';
    const isActive = profile?.subscription_status === 'active' || tier === 'free';
    const weeksToGenerate = getWeeksForTier(tier);
    const trialMode = TIER_LEVELS[tier] === 0;

    // 4. Get quiz results from child metadata
    const quizResults = child.metadata || {};

    // 5. Fetch available content for this child's age track
    const ageTrack = (child.age_years || child.age || 5) <= 5 ? 'mini' : 'big';

    const [storiesResult, printablesResult, songsResult] = await Promise.all([
        supabaseAdmin.from('storybooks').select('id, title, island_theme, age_track').eq('is_active', true).eq('age_track', ageTrack).limit(10),
        supabaseAdmin.from('printables').select('id, title, category').eq('is_active', true).limit(8),
        supabaseAdmin.from('songs').select('id, title, genre').eq('is_active', true).limit(6),
    ]);

    const contentList = [
        ...(storiesResult.data || []).map((s: any) => `Story: "${s.title}" (${s.island_theme || 'Caribbean'})`),
        ...(printablesResult.data || []).map((p: any) => `Printable: "${p.title}" (${p.category || 'activity'})`),
        ...(songsResult.data || []).map((sg: any) => `Song: "${sg.title}" (${sg.genre || 'Caribbean'})`),
    ].join('\n');

    // 6. Get child's XP progress for plan adaptation
    const { data: xpData } = await supabase
        .from('children')
        .select('xp, current_streak, total_xp')
        .eq('id', input.childId)
        .single();

    const progressScore = xpData?.total_xp || xpData?.xp || 0;

    // 7. Generate plan via Gemini (with fallback)
    let weeks = await buildGeminiPlan(child, quizResults, weeksToGenerate, contentList);
    if (!weeks || weeks.length === 0) {
        weeks = buildFallbackPlan(child, quizResults, weeksToGenerate, []);
    }

    // 8. Deactivate previous active plans
    await supabaseAdmin
        .from('learning_plans')
        .update({ is_active: false })
        .eq('child_id', input.childId)
        .eq('is_active', true);

    // 9. Save new plan
    const preferredChar = quizResults?.preferred_character || 'roti';
    const focusAreas = quizResults?.focus_areas || [];
    const charNames: Record<string, string> = {
        roti: "R.O.T.I.'s Learning Adventure",
        tanty_spice: "Tanty Spice's Story Journey",
        dilly_doubles: "Dilly Doubles' Quest for Greatness",
        benny: "Benny's Island Discovery",
    };
    const charName = charNames[preferredChar] || 'My Learning Adventure';

    const { data: savedPlan, error: saveError } = await supabaseAdmin
        .from('learning_plans')
        .insert({
            child_id: input.childId,
            plan_name: charName,
            focus_areas: focusAreas,
            learning_style: quizResults?.learning_style || 'story',
            daily_minutes: quizResults?.daily_minutes || 30,
            primary_goal: quizResults?.primary_goal || 'build_confidence',
            preferred_character: preferredChar,
            plan_data: {
                weeks,
                tierLevel: tier,
                weeksUnlocked: weeksToGenerate,
                generatedAt: new Date().toISOString(),
                progressScore,
            },
            curriculum_standard: 'OECS Caribbean Primary',
            island_theme: child.island_theme || null,
            is_active: true,
        })
        .select()
        .single();

    if (saveError || !savedPlan) {
        console.error('[generate-plan] Save error:', saveError);
        return { success: false, error: 'Failed to save plan' };
    }

    return { success: true, plan: savedPlan as LearningPlan, trialMode };
}

// ─── Refresh Plan (called by background agent) ────────────────────────────────
// This is what makes the plan live 24/7 — called when child completes activities

export async function refreshPlanForProgress(childId: string, parentUserId: string): Promise<{ success: boolean }> {
    try {
        // Verify ownership
        const { data: child } = await supabaseAdmin
            .from('children')
            .select('*')
            .eq('id', childId)
            .eq('parent_id', parentUserId)
            .single();

        if (!child) return { success: false };

        // Only regenerate if enough progress made (every 100 XP or every 7 days)
        const { data: existingPlan } = await supabaseAdmin
            .from('learning_plans')
            .select('id, plan_data, created_at')
            .eq('child_id', childId)
            .eq('is_active', true)
            .single();

        if (existingPlan) {
            const createdAt = new Date(existingPlan.created_at);
            const daysSincePlan = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
            const currentXP = child.total_xp || child.xp || 0;
            const prevScore = existingPlan.plan_data?.progressScore || 0;
            const xpGained = currentXP - prevScore;

            // Only refresh if 7+ days old OR 200+ XP gained since last generation
            if (daysSincePlan < 7 && xpGained < 200) return { success: true };
        }

        await generatePlanAction({ childId });
        return { success: true };
    } catch (err) {
        console.error('[refreshPlanForProgress] Error:', err);
        return { success: false };
    }
}
