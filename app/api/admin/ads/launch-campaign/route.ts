/**
 * POST /api/admin/ads/launch-campaign
 *
 * In-house Meta Marketing API campaign launcher.
 * Creates: Campaign → Ad Set (targeting) → Ad Creative → Ad
 * All set to PAUSED by default — you review in Meta Ads Manager then activate.
 *
 * Required env vars:
 *   META_ADS_ACCESS_TOKEN  — from Meta Business → System Users
 *   META_AD_ACCOUNT_ID     — e.g. act_1445727133389527
 *   META_PAGE_ID           — e.g. 61587732686874
 *   NEXT_PUBLIC_META_PIXEL_ID — e.g. 4385961946335645
 */

import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/agent-os/db';

const META_API = 'https://graph.facebook.com/v19.0';

const DIASPORA_CITIES = [
  { key: 'miami_fl',    name: 'Miami, FL',       lat: 25.7617, lng: -80.1918, radius: 25 },
  { key: 'new_york_ny', name: 'New York, NY',     lat: 40.7128, lng: -74.0060, radius: 30 },
  { key: 'newark_nj',   name: 'Newark, NJ',       lat: 40.7357, lng: -74.1724, radius: 15 },
  { key: 'hartford_ct', name: 'Hartford, CT',     lat: 41.7637, lng: -72.6851, radius: 20 },
  { key: 'atlanta_ga',  name: 'Atlanta, GA',      lat: 33.7490, lng: -84.3880, radius: 25 },
  { key: 'houston_tx',  name: 'Houston, TX',      lat: 29.7604, lng: -95.3698, radius: 25 },
  { key: 'toronto_ca',  name: 'Toronto, Canada',  lat: 43.6532, lng: -79.3832, radius: 30 },
  { key: 'london_uk',   name: 'London, UK',       lat: 51.5074, lng: -0.1278,  radius: 30 },
  { key: 'brooklyn_ny', name: 'Brooklyn, NY',     lat: 40.6782, lng: -73.9442, radius: 15 },
];

async function metaPost(path: string, params: Record<string, unknown>, token: string): Promise<Record<string, unknown>> {
  const url = `${META_API}/${path}`;
  const body = new URLSearchParams();
  body.append('access_token', token);
  for (const [k, v] of Object.entries(params)) {
    body.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  const res = await fetch(url, { method: 'POST', body });
  const data = await res.json() as Record<string, unknown>;
  if (data.error) {
    const err = data.error as Record<string, unknown>;
    throw new Error(`Meta API error: ${err.message || JSON.stringify(err)}`);
  }
  return data;
}

export async function POST(request: NextRequest) {
  const runId = request.headers.get('x-run-id') || '';
  
  try {
    const body = await request.json().catch(() => ({})) as {
      campaign_name?: string;
      objective?: string;
      daily_budget_usd?: number;
      character?: string;
      stage?: string;
      headline?: string;
      primary_text?: string;
      link_url?: string;
      cities?: string[];
      age_min?: number;
      age_max?: number;
      image_url?: string;
    };

    const token     = process.env.META_ADS_ACCESS_TOKEN;
    const accountId = process.env.META_AD_ACCOUNT_ID || 'act_1445727133389527';
    const pageId    = process.env.META_PAGE_ID || '61587732686874';
    const pixelId   = process.env.NEXT_PUBLIC_META_PIXEL_ID || '4385961946335645';

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'META_ADS_ACCESS_TOKEN not set in Vercel environment variables.',
        setup_instructions: 'Go to Meta Business Manager → System Users → Generate Token with ads_management + pages_read_engagement scopes. Add to Vercel as META_ADS_ACCESS_TOKEN.',
      }, { status: 400 });
    }

    const dailyBudgetCents = Math.round((body.daily_budget_usd || 5) * 100); // default $5/day
    const campaignName = body.campaign_name || `Likkle Legends — ${body.character || 'Tanty Spice'} — ${body.stage?.toUpperCase() || 'TOFU'} — ${new Date().toISOString().split('T')[0]}`;

    // ── Step 1: Campaign ──────────────────────────────────────────────────────
    const campaign = await metaPost(`${accountId}/campaigns`, {
      name: campaignName,
      objective: body.objective || 'OUTCOME_LEADS',
      status: 'PAUSED', // Always start paused — you activate manually
      special_ad_categories: [],
    }, token);

    const campaignId = campaign.id as string;

    // ── Step 2: Ad Set with diaspora targeting ─────────────────────────────────
    const selectedCities = (body.cities || ['miami_fl', 'new_york_ny', 'brooklyn_ny', 'newark_nj', 'hartford_ct'])
      .map(key => DIASPORA_CITIES.find(c => c.key === key))
      .filter(Boolean);

    const geoLocations = {
      custom_locations: selectedCities.map(c => ({
        latitude: c!.lat,
        longitude: c!.lng,
        radius: c!.radius,
        distance_unit: 'mile',
      })),
    };

    const targeting = {
      geo_locations: geoLocations,
      age_min: body.age_min || 25,
      age_max: body.age_max || 45,
      publisher_platforms: ['facebook', 'instagram'],
      facebook_positions: ['feed', 'story', 'reels'],
      instagram_positions: ['stream', 'story', 'reels'],
      flexible_spec: [
        {
          interests: [
            { id: '6003139266461', name: 'Parenting' },
            { id: '6003564559430', name: 'Family' },
            { id: '6002714895372', name: 'Caribbean culture' },
          ],
        },
      ],
      pixel_id: pixelId,
    };

    const adSet = await metaPost(`${accountId}/adsets`, {
      name: `${campaignName} — ${selectedCities.map(c => c!.name).join(', ')}`,
      campaign_id: campaignId,
      daily_budget: dailyBudgetCents,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LEAD_GENERATION',
      targeting: targeting,
      status: 'PAUSED',
      start_time: new Date(Date.now() + 3600000).toISOString(), // 1hr from now
    }, token);

    const adSetId = adSet.id as string;

    // ── Step 3: Ad Creative ────────────────────────────────────────────────────
    const linkUrl = body.link_url || 'https://www.likklelegends.com?utm_source=facebook&utm_medium=paid&utm_campaign=agent_launch';

    const creative = await metaPost(`${accountId}/adcreatives`, {
      name: `${campaignName} — Creative`,
      object_story_spec: {
        page_id: pageId,
        link_data: {
          message: body.primary_text || 'Give your child their digital passport to the islands 🌴 Caribbean stories, songs & games for kids ages 4-8. Start for just $10 today!',
          link: linkUrl,
          name: body.headline || 'Raise Proud Caribbean Kids 🌴',
          description: 'The Caribbean learning platform built for diaspora families.',
          call_to_action: { type: 'LEARN_MORE', value: { link: linkUrl } },
          ...(body.image_url ? { picture: body.image_url } : {}),
        },
      },
    }, token);

    const creativeId = creative.id as string;

    // ── Step 4: Ad ────────────────────────────────────────────────────────────
    const ad = await metaPost(`${accountId}/ads`, {
      name: campaignName,
      adset_id: adSetId,
      creative: { creative_id: creativeId },
      status: 'PAUSED',
    }, token);

    const adId = ad.id as string;

    await logActivity({
      agent_key: 'manus-ad-manager',
      task_type: 'meta_campaign_launch',
      subject: campaignName,
      action_summary: `Meta campaign created (PAUSED): "${campaignName}" — $${body.daily_budget_usd || 5}/day targeting ${selectedCities.length} diaspora cities. Review in Meta Ads Manager then activate.`,
      outcome: 'success',
      severity: 'info',
      requires_attention: true, // Flag for human review before activating
      linked_task_id: null,
      linked_run_id: runId || null,
      linked_artifact_id: null,
      linked_user_id: null,
      linked_campaign_id: campaignId,
      meta: {
        campaign_id: campaignId,
        ad_set_id: adSetId,
        creative_id: creativeId,
        ad_id: adId,
        daily_budget_usd: body.daily_budget_usd || 5,
        cities: selectedCities.map(c => c!.name),
        status: 'PAUSED',
        review_url: `https://www.facebook.com/adsmanager/manage/campaigns?act=${accountId.replace('act_', '')}`,
      },
    });

    return NextResponse.json({
      success: true,
      status: 'PAUSED',
      campaign_id: campaignId,
      ad_set_id: adSetId,
      creative_id: creativeId,
      ad_id: adId,
      daily_budget_usd: body.daily_budget_usd || 5,
      cities_targeted: selectedCities.map(c => c!.name),
      next_step: 'Review campaign in Meta Ads Manager then change status to ACTIVE',
      review_url: `https://www.facebook.com/adsmanager/manage/campaigns?act=${accountId.replace('act_', '')}`,
      message: `Campaign "${campaignName}" created and ready for review. It is PAUSED — activate in Meta Ads Manager when ready.`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    await logActivity({
      agent_key: 'manus-ad-manager',
      task_type: 'meta_campaign_launch',
      subject: 'campaign launch',
      action_summary: `Meta campaign launch failed: ${msg}`,
      outcome: 'error',
      severity: 'error',
      requires_attention: true,
      linked_task_id: null,
      linked_run_id: runId || null,
      linked_artifact_id: null,
      linked_user_id: null,
      linked_campaign_id: null,
      meta: { error: msg },
    }).catch(() => {});
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// GET — preview what would be created without actually calling Meta API
export async function GET(_req: NextRequest) {
  const token = process.env.META_ADS_ACCESS_TOKEN;
  return NextResponse.json({
    ready: !!token,
    missing_token: !token,
    setup_url: 'https://business.facebook.com/settings/system-users',
    account_id: process.env.META_AD_ACCOUNT_ID || 'act_1445727133389527',
    page_id: process.env.META_PAGE_ID || '61587732686874',
    pixel_id: process.env.NEXT_PUBLIC_META_PIXEL_ID || '4385961946335645',
    diaspora_targets: DIASPORA_CITIES.map(c => c.name),
    default_budget: '$5/day (500 cents)',
    note: 'All campaigns launch PAUSED. You activate manually in Meta Ads Manager.',
  });
}
