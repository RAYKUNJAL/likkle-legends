/**
 * Manus AI Integration — Likkle Legends
 *
 * Manus is an autonomous AI agent platform optimised for Meta (Facebook/Instagram) ad management.
 * This module builds the campaign brief payload and sends it to Manus via webhook.
 * Manus then autonomously manages bidding, creative rotation, audience expansion, and reporting.
 */

export interface ManusAdBrief {
  brand: MansusBrandContext;
  budget: ManusBudgetConfig;
  audiences: ManusAudienceConfig;
  creatives: ManusCreativeSet[];
  objectives: ManusObjective[];
  constraints: ManusConstraints;
  reporting: ManusReportingConfig;
}

interface MansusBrandContext {
  name: string;
  tagline: string;
  website: string;
  pixelId: string;
  adAccountId: string;
  pageId: string;
  targetDemographic: string;
  brandVoice: string;
  coreValue: string;
}

interface ManusBudgetConfig {
  totalDailyBudget: number;   // USD
  tofuPercent: number;        // % for cold audiences
  mofuPercent: number;        // % for warm/retarget
  maxCpcBid: number;
  optimizationGoal: 'LINK_CLICKS' | 'LEAD_GENERATION' | 'CONVERSIONS' | 'APP_INSTALLS';
  billingEvent: 'IMPRESSIONS' | 'LINK_CLICKS';
}

interface ManusAudienceConfig {
  primaryCountries: string[];
  diasporaCities: DiasporaCity[];
  interestIds: string[];
  retargetPixelDays: number;
  lookalikeSeedSize: number;
  ageMin: number;
  ageMax: number;
}

interface DiasporaCity {
  name: string;
  key: string;
  radius: number;
  radiusUnit: string;
}

interface ManusCreativeSet {
  id: string;
  character: string;
  imageFile: string;
  hook: string;
  bodyText: string;
  ctaText: string;
  ctaLink: string;
  stage: 'tofu' | 'mofu' | 'bofu';
  targetEmotion: string;
}

interface ManusObjective {
  kpi: string;
  target: string;
  priority: 'primary' | 'secondary';
}

interface ManusConstraints {
  noBidding: boolean;          // true = Manus manages bids autonomously
  pauseIfCpcAbove: number;     // Auto-pause if CPC exceeds threshold
  pauseIfCtrBelow: number;     // Auto-pause if CTR drops below threshold (%)
  scaleIfRoasAbove: number;    // Scale budget if ROAS exceeds threshold
  maxDailySpendUSD: number;
  requireApprovalForBudgetOver: number;  // Manual approval required above this
}

interface ManusReportingConfig {
  webhookCallbackUrl: string;  // Where Manus posts daily reports
  reportFrequency: 'daily' | 'weekly';
  alertOnAnomaly: boolean;
  slackWebhookUrl?: string;
}

// ─── Brand Constants ──────────────────────────────────────────────────────────

const BRAND: MansusBrandContext = {
  name: 'Likkle Legends',
  tagline: 'Where Caribbean Kids Become Heroes',
  website: 'https://www.likklelegends.com',
  pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
  adAccountId: process.env.META_AD_ACCOUNT_ID || '',
  pageId: process.env.META_PAGE_ID || '',
  targetDemographic: 'Caribbean diaspora parents aged 25-45 with children 3-10 years old',
  brandVoice: 'Warm, proud, culturally rich, celebratory, educational',
  coreValue: 'Caribbean children deserve to see themselves as heroes in their own stories',
};

// Top US cities with Caribbean diaspora concentration
const DIASPORA_CITIES: DiasporaCity[] = [
  { name: 'Brooklyn, NY', key: 'brooklyn', radius: 10, radiusUnit: 'mile' },
  { name: 'Bronx, NY', key: 'bronx', radius: 8, radiusUnit: 'mile' },
  { name: 'Miami, FL', key: 'miami', radius: 20, radiusUnit: 'mile' },
  { name: 'Fort Lauderdale, FL', key: 'fort_lauderdale', radius: 15, radiusUnit: 'mile' },
  { name: 'Orlando, FL', key: 'orlando', radius: 15, radiusUnit: 'mile' },
  { name: 'Atlanta, GA', key: 'atlanta', radius: 20, radiusUnit: 'mile' },
  { name: 'Hartford, CT', key: 'hartford', radius: 15, radiusUnit: 'mile' },
  { name: 'Boston, MA', key: 'boston', radius: 15, radiusUnit: 'mile' },
  { name: 'Philadelphia, PA', key: 'philadelphia', radius: 15, radiusUnit: 'mile' },
  { name: 'Washington, DC', key: 'washington_dc', radius: 20, radiusUnit: 'mile' },
  { name: 'Houston, TX', key: 'houston', radius: 20, radiusUnit: 'mile' },
];

const CARIBBEAN_COUNTRIES = ['TT', 'JM', 'BB', 'GY', 'LC', 'GD', 'AG', 'VC', 'DM', 'BS', 'TC', 'KN', 'AI', 'VG', 'VI', 'PR', 'DO', 'HT', 'BZ', 'SR'];

const INTEREST_IDS = [
  '6003108900473',  // Caribbean culture
  '6003761288458',  // Parenting
  '6003382443785',  // Children's education
  '6002984103462',  // Jamaica
  '6003269051588',  // Trinidad and Tobago
  '6003543089041',  // Reggae music
  '6003682697135',  // Caribbean food
  '6002925990963',  // Cultural heritage
  '6004112745895',  // Family activities
  '6003268557985',  // Educational games
];

const CHARACTER_CREATIVES: ManusCreativeSet[] = [
  {
    id: 'roti-tofu',
    character: 'R.O.T.I.',
    imageFile: '/games/images/roti-hero.png',
    hook: '🤖 Meet R.O.T.I. — The Caribbean Robot Who Teaches Your Child to Code!',
    bodyText: 'Your child deserves to see themselves in the stories they love. R.O.T.I. is a solar-powered Caribbean AI robot who makes STEM fun for island kids aged 6-10. Try 1 level FREE today.',
    ctaText: 'Try Free',
    ctaLink: 'https://www.likklelegends.com/free-trial?char=roti&utm_source=facebook&utm_medium=paid&utm_campaign=tofu_caribbean',
    stage: 'tofu',
    targetEmotion: 'curiosity + pride',
  },
  {
    id: 'tanty-mofu',
    character: 'Tanty Spice',
    imageFile: '/games/images/tanty-spice.png',
    hook: '👩‍🍳 Tanty Spice is cooking up Caribbean culture — and your kids are invited!',
    bodyText: 'Caribbean cooking + math + culture in one magical game. Tanty\'s Kitchen teaches measurements, fractions, and food heritage through play. 500+ Caribbean families already love it.',
    ctaText: 'Start Free',
    ctaLink: 'https://www.likklelegends.com/free-trial?char=tanty&utm_source=facebook&utm_medium=paid&utm_campaign=mofu_retarget',
    stage: 'mofu',
    targetEmotion: 'nostalgia + FOMO',
  },
  {
    id: 'dilly-tofu',
    character: 'Dilly Doubles',
    imageFile: '/games/images/dilly-doubles.png',
    hook: '🐠 Dive into Caribbean islands with Dilly! The adventure game kids beg to play.',
    bodyText: 'Island Hop Adventure takes kids on a journey through 20 Caribbean islands, learning geography, culture, and language. Built FOR island kids, BY island people.',
    ctaText: 'Play Free',
    ctaLink: 'https://www.likklelegends.com/free-trial?char=dilly&utm_source=facebook&utm_medium=paid&utm_campaign=tofu_caribbean',
    stage: 'tofu',
    targetEmotion: 'pride + excitement',
  },
  {
    id: 'sam-bofu',
    character: 'Steelpan Sam',
    imageFile: '/games/images/steelpan-sam.png',
    hook: '🥁 100+ Caribbean parents already subscribed. Is your child missing out?',
    bodyText: 'For just $4.99/month, unlock all 20+ games, printable worksheets, AI story time, monthly mail kits, and a full Caribbean curriculum for kids 3-10. Cancel anytime.',
    ctaText: 'Start Free Trial',
    ctaLink: 'https://www.likklelegends.com/free-trial?char=sam&utm_source=facebook&utm_medium=paid&utm_campaign=bofu_retarget',
    stage: 'bofu',
    targetEmotion: 'urgency + value',
  },
  {
    id: 'mango-tofu',
    character: 'Mango Moko',
    imageFile: '/games/images/mango-moko.png',
    hook: '🥭 "My daughter won\'t stop playing!" — Caribbean mom, Brooklyn NY',
    bodyText: 'Likkle Legends isn\'t just a game — it\'s your child\'s cultural identity, brought to life through AI storytelling, Caribbean games, and island adventures. Start free — no credit card.',
    ctaText: 'Try Free',
    ctaLink: 'https://www.likklelegends.com/free-trial?char=mango&utm_source=facebook&utm_medium=paid&utm_campaign=tofu_social_proof',
    stage: 'tofu',
    targetEmotion: 'social proof + pride',
  },
];

// ─── Build Brief ──────────────────────────────────────────────────────────────

export function buildManusAdBrief(dailyBudgetUSD = 3.34): ManusAdBrief {
  const callbackBase = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.likklelegends.com';

  return {
    brand: BRAND,
    budget: {
      totalDailyBudget: dailyBudgetUSD,
      tofuPercent: 60,
      mofuPercent: 40,
      maxCpcBid: 1.50,
      optimizationGoal: 'LEAD_GENERATION',
      billingEvent: 'IMPRESSIONS',
    },
    audiences: {
      primaryCountries: CARIBBEAN_COUNTRIES,
      diasporaCities: DIASPORA_CITIES,
      interestIds: INTEREST_IDS,
      retargetPixelDays: 30,
      lookalikeSeedSize: 1000,
      ageMin: 25,
      ageMax: 45,
    },
    creatives: CHARACTER_CREATIVES,
    objectives: [
      { kpi: 'Cost per Lead (CPL)', target: 'Under $5.00', priority: 'primary' },
      { kpi: 'Click-Through Rate (CTR)', target: 'Above 2%', priority: 'primary' },
      { kpi: 'Cost per Click (CPC)', target: 'Under $1.50', priority: 'secondary' },
      { kpi: 'ROAS (Return on Ad Spend)', target: 'Above 3x', priority: 'secondary' },
    ],
    constraints: {
      noBidding: false,
      pauseIfCpcAbove: 3.00,
      pauseIfCtrBelow: 0.5,
      scaleIfRoasAbove: 4.0,
      maxDailySpendUSD: dailyBudgetUSD * 1.1,  // Allow 10% overspend buffer
      requireApprovalForBudgetOver: 20.00,
    },
    reporting: {
      webhookCallbackUrl: `${callbackBase}/api/manus/webhook`,
      reportFrequency: 'daily',
      alertOnAnomaly: true,
    },
  };
}

// ─── Send to Manus ────────────────────────────────────────────────────────────

export interface ManusHandoffResult {
  success: boolean;
  manusTaskId?: string;
  message: string;
  briefSent: ManusAdBrief;
  timestamp: string;
}

export async function sendToManus(brief: ManusAdBrief): Promise<ManusHandoffResult> {
  const manusWebhookUrl = process.env.MANUS_WEBHOOK_URL;
  const timestamp = new Date().toISOString();

  if (!manusWebhookUrl) {
    // Simulate success in dev — Manus webhook not yet configured
    console.log('[Manus] Webhook URL not set — simulating handoff for development');
    return {
      success: true,
      manusTaskId: `manus_sim_${Date.now()}`,
      message: 'SIMULATED: Brief prepared. Add MANUS_WEBHOOK_URL to environment variables to activate live Manus handoff.',
      briefSent: brief,
      timestamp,
    };
  }

  try {
    const response = await fetch(manusWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Likkle-Source': 'likkle-legends-agent-team',
        'X-Likkle-Version': '1.0.0',
      },
      body: JSON.stringify({
        event: 'meta_ad_campaign_brief',
        version: '1.0.0',
        timestamp,
        payload: brief,
      }),
    });

    if (!response.ok) {
      throw new Error(`Manus webhook returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json().catch(() => ({}));

    return {
      success: true,
      manusTaskId: data.taskId || data.id || `manus_${Date.now()}`,
      message: 'Brief successfully sent to Manus AI. Autonomous Meta ad management activated.',
      briefSent: brief,
      timestamp,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      message: `Manus handoff failed: ${message}`,
      briefSent: brief,
      timestamp,
    };
  }
}

// ─── One-click launch ─────────────────────────────────────────────────────────

export async function launchManusAdAgent(dailyBudgetUSD = 3.34): Promise<ManusHandoffResult> {
  const brief = buildManusAdBrief(dailyBudgetUSD);
  return sendToManus(brief);
}
