import { NextRequest, NextResponse } from 'next/server';
import { launchManusAdAgent, buildManusAdBrief } from '@/lib/manus-integration';

/**
 * GET /api/admin/agents
 * Returns live status of all AI agents in the team
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'status';

  if (action === 'status') {
    // Return the full agent roster with live-ish status
    // In production these would be real health checks / DB queries
    const agents = getAgentRoster();
    return NextResponse.json({ success: true, agents, timestamp: new Date().toISOString() });
  }

  if (action === 'manus_brief') {
    const brief = buildManusAdBrief();
    return NextResponse.json({ success: true, brief });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

/**
 * POST /api/admin/agents
 * Trigger an agent task
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, agentId, params } = body;

    switch (action) {
      // ── Manus Ad Manager ──────────────────────────────────────────────────
      case 'launch_manus': {
        const dailyBudget = params?.dailyBudget || 3.34;
        const result = await launchManusAdAgent(dailyBudget);
        return NextResponse.json({ success: result.success, result });
      }

      // ── Blog Writer ───────────────────────────────────────────────────────
      case 'trigger_blog': {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/blog/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: params?.topic || 'Caribbean parenting and education',
            category: 'education',
            autoPublish: false,
          }),
        });
        const data = await res.json();
        return NextResponse.json({ success: true, result: data });
      }

      // ── Social Media Agent ────────────────────────────────────────────────
      case 'trigger_social': {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/social/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params || {}),
        });
        const data = await res.json();
        return NextResponse.json({ success: true, result: data });
      }

      // ── Ad Copy Generator ─────────────────────────────────────────────────
      case 'generate_ad_copy': {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/admin/ads/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            character: params?.character || 'R.O.T.I.',
            stage: params?.stage || 'tofu',
            tone: params?.tone || 'warm-proud',
          }),
        });
        const data = await res.json();
        return NextResponse.json({ success: true, result: data });
      }

      // ── Content Director (IslandBrain) ────────────────────────────────────
      case 'trigger_content_batch': {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/cron/content-generation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
          },
          body: JSON.stringify(params || {}),
        });
        const data = await res.json().catch(() => ({ triggered: true }));
        return NextResponse.json({ success: true, result: data });
      }

      // ── Email Nurture ─────────────────────────────────────────────────────
      case 'trigger_nurture': {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/cron/nurture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
          },
        });
        const data = await res.json().catch(() => ({ triggered: true }));
        return NextResponse.json({ success: true, result: data });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── Agent Roster ─────────────────────────────────────────────────────────────

function getAgentRoster() {
  return [
    // ── Tier 1: Orchestrators ──────────────────────────────────────────────
    {
      id: 'island-brain',
      name: 'IslandBrain',
      role: 'Content Director',
      tier: 'orchestrator',
      description: 'Orchestrates all content generation. Assigns tasks to Story, Video, Printable, and Song agents. Uses Gemini 2.0 Flash with Caribbean cultural context.',
      model: 'Gemini 2.0 Flash',
      status: 'active',
      lastRun: '-2h',
      capabilities: ['story_generation', 'video_scripts', 'curriculum_planning', 'quality_gates'],
      triggerAction: 'trigger_content_batch',
      icon: '🧠',
      color: '#6366F1',
    },
    {
      id: 'anansi-core',
      name: 'Anansi Core',
      role: 'User Intelligence',
      tier: 'orchestrator',
      description: 'Manages user interactions, memory extraction, and personalized responses. Keeps long-term memory per child profile.',
      model: 'Gemini 2.0 Flash',
      status: 'active',
      lastRun: 'live',
      capabilities: ['intent_routing', 'memory_management', 'chat_responses', 'personalization'],
      triggerAction: null,
      icon: '🕷️',
      color: '#8B5CF6',
    },

    // ── Tier 2: Content Specialists ────────────────────────────────────────
    {
      id: 'story-agent',
      name: 'Story Director',
      role: 'Educational Storytelling',
      tier: 'specialist',
      description: 'Generates Caribbean storybooks with audio narration (ElevenLabs). Enforces phonics-aligned decodable text and age-appropriate curriculum outcomes.',
      model: 'Gemini 2.0 Flash + ElevenLabs',
      status: 'active',
      lastRun: '-1d',
      capabilities: ['story_writing', 'audio_synthesis', 'decodable_books', 'curriculum_alignment'],
      triggerAction: 'trigger_content_batch',
      icon: '📖',
      color: '#F59E0B',
    },
    {
      id: 'blog-agent',
      name: 'Blog Writer',
      role: 'Content Marketing',
      tier: 'specialist',
      description: 'Writes SEO-optimised blog posts targeting Caribbean parenting and education keywords. Generates 800-1200 word articles with meta descriptions.',
      model: 'Gemini 2.0 Flash',
      status: 'active',
      lastRun: '-3d',
      capabilities: ['blog_writing', 'seo_optimization', 'keyword_targeting', 'content_calendar'],
      triggerAction: 'trigger_blog',
      icon: '✍️',
      color: '#10B981',
    },
    {
      id: 'module-manager',
      name: 'Module Manager',
      role: 'Curriculum Builder',
      tier: 'specialist',
      description: 'Builds complete educational modules (story + video script + printable worksheet + metadata) in parallel. Delivers full curriculum packs per island.',
      model: 'Gemini 2.0 Flash (parallel)',
      status: 'standby',
      lastRun: '-5d',
      capabilities: ['module_assembly', 'parallel_generation', 'worksheet_creation', 'video_scripts'],
      triggerAction: 'trigger_content_batch',
      icon: '📚',
      color: '#3B82F6',
    },

    // ── Tier 3: Growth & Marketing ─────────────────────────────────────────
    {
      id: 'manus-ad-manager',
      name: 'Manus Ad Manager',
      role: 'Paid Growth (Meta)',
      tier: 'growth',
      description: 'Autonomous Meta Facebook/Instagram ad manager powered by Manus AI. Manages bidding, creative rotation, audience expansion, A/B tests, and budget scaling. Targets Caribbean diaspora in 11 US cities + 20 island nations.',
      model: 'Manus AI (Autonomous)',
      status: 'needs_setup',
      lastRun: 'never',
      capabilities: ['meta_ads', 'creative_rotation', 'bid_management', 'audience_expansion', 'roas_optimization'],
      triggerAction: 'launch_manus',
      icon: '📣',
      color: '#EF4444',
      badge: 'LAUNCH READY',
    },
    {
      id: 'social-agent',
      name: 'Social Media Agent',
      role: 'Organic Social Growth',
      tier: 'growth',
      description: 'Generates Instagram, Facebook, and TikTok post copy + caption ideas featuring Likkle Legends characters. Aligned with the content calendar.',
      model: 'Gemini 2.0 Flash',
      status: 'active',
      lastRun: '-1d',
      capabilities: ['instagram_captions', 'facebook_posts', 'tiktok_hooks', 'hashtag_research'],
      triggerAction: 'trigger_social',
      icon: '📱',
      color: '#EC4899',
    },
    {
      id: 'ad-copy-agent',
      name: 'Ad Copywriter',
      role: 'Creative Production',
      tier: 'growth',
      description: 'GPT-4o powered ad copy generator with Caribbean brand voice. Produces TOFU/MOFU/BOFU variants for each character. Feeds creatives to Manus Ad Manager.',
      model: 'GPT-4o',
      status: 'active',
      lastRun: '-6h',
      capabilities: ['ad_copywriting', 'character_hooks', 'funnel_copy', 'a_b_variants'],
      triggerAction: 'generate_ad_copy',
      icon: '✏️',
      color: '#F97316',
    },

    // ── Tier 4: Retention & Revenue ────────────────────────────────────────
    {
      id: 'email-nurture',
      name: 'Email Nurture Agent',
      role: 'Subscriber Retention',
      tier: 'retention',
      description: 'Runs automated onboarding sequences, re-engagement flows, and win-back campaigns. Personalizes content based on child\'s island heritage and learning progress.',
      model: 'Gemini 2.0 Flash',
      status: 'active',
      lastRun: '-12h',
      capabilities: ['email_sequences', 'onboarding', 're_engagement', 'personalization'],
      triggerAction: 'trigger_nurture',
      icon: '📧',
      color: '#14B8A6',
    },
    {
      id: 'analytics-agent',
      name: 'Analytics Agent',
      role: 'KPI & Insights',
      tier: 'retention',
      description: 'Monitors key business metrics: MRR, churn, CAC, LTV, DAU. Surfaces anomalies and weekly performance summaries. Connected to Supabase + Meta Pixel.',
      model: 'Rule-based + Gemini',
      status: 'active',
      lastRun: 'live',
      capabilities: ['mrr_tracking', 'churn_analysis', 'ad_performance', 'funnel_analytics', 'anomaly_detection'],
      triggerAction: null,
      icon: '📊',
      color: '#6366F1',
    },
    {
      id: 'growth-agent',
      name: 'Growth Agent',
      role: 'Funnel Optimisation',
      tier: 'retention',
      description: 'A/B tests landing page copy, paywall messaging, pricing anchors, and onboarding flows. Runs growth experiments and reports conversion lifts weekly.',
      model: 'Gemini 2.0 Flash',
      status: 'standby',
      lastRun: '-7d',
      capabilities: ['ab_testing', 'conversion_optimization', 'pricing_experiments', 'landing_page_copy'],
      triggerAction: null,
      icon: '🚀',
      color: '#84CC16',
    },
  ];
}
