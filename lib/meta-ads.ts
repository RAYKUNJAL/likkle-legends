/**
 * Meta Marketing API Client — Likkle Legends
 * Manages ad campaigns, ad sets, creatives via Meta Marketing API v20
 */

const META_API_VERSION = 'v20.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

export interface MetaCampaign {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED';
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
}

export interface MetaTargeting {
  age_min: number;
  age_max: number;
  genders?: number[];
  geo_locations: {
    cities?: Array<{ key: string; radius: number; distance_unit: 'mile' | 'kilometer' }>;
    countries?: string[];
  };
  interests?: Array<{ id: string; name: string }>;
  flexible_spec?: Array<{
    interests?: Array<{ id: string; name: string }>;
    behaviors?: Array<{ id: string; name: string }>;
  }>;
}

export interface MetaAdInsights {
  campaign_id: string;
  campaign_name: string;
  impressions: string;
  clicks: string;
  spend: string;
  actions?: Array<{ action_type: string; value: string }>;
  ctr: string;
  cpm: string;
  date_start: string;
  date_stop: string;
}

// ─── Caribbean Diaspora Audience Presets ─────────────────────────────────────

export const CARIBBEAN_US_CITIES = [
  { key: '2418779', radius: 25, distance_unit: 'mile' as const }, // Miami FL
  { key: '2420931', radius: 25, distance_unit: 'mile' as const }, // Fort Lauderdale FL
  { key: '2421853', radius: 20, distance_unit: 'mile' as const }, // Orlando FL
  { key: '2490299', radius: 15, distance_unit: 'mile' as const }, // Brooklyn NY
  { key: '2490292', radius: 15, distance_unit: 'mile' as const }, // Bronx NY
  { key: '2476656', radius: 20, distance_unit: 'mile' as const }, // Newark NJ
  { key: '2365823', radius: 15, distance_unit: 'mile' as const }, // Hartford CT
  { key: '2360022', radius: 20, distance_unit: 'mile' as const }, // Atlanta GA
  { key: '2442090', radius: 20, distance_unit: 'mile' as const }, // Houston TX
  { key: '2514026', radius: 20, distance_unit: 'mile' as const }, // Washington DC
  { key: '2379574', radius: 15, distance_unit: 'mile' as const }, // Boston MA
];

export const CARIBBEAN_ISLANDS = [
  'TT', 'JM', 'BB', 'GY', 'LC', 'GD', 'AG', 'VC',
  'DM', 'BS', 'TC', 'KN', 'AI', 'VG', 'VI', 'PR',
  'DO', 'HT', 'BZ', 'SR',
];

export const CARIBBEAN_INTERESTS = [
  { id: '6003348712888', name: 'Caribbean' },
  { id: '6003529572464', name: 'Caribbean culture' },
  { id: '6003382041786', name: 'Reggae music' },
  { id: '6003527967288', name: 'Soca music' },
  { id: '6003541108512', name: 'Calypso music' },
  { id: '6003375924814', name: 'Parenting' },
  { id: '6003348712990', name: "Children's education" },
  { id: '6003411696999', name: 'Early childhood education' },
  { id: '6003409043877', name: 'Jamaican culture' },
  { id: '6003383559490', name: 'Trinidad and Tobago' },
];

export const AD_COPY_TEMPLATES = {
  tofu: {
    headlines: [
      "Give Your Child Their Island Roots 🌴",
      "Caribbean Learning Made for Your Kids",
      "Where Island Culture Meets Education",
      "Your Child's Digital Passport to the Islands",
      "4 Caribbean Characters. 1 Big Adventure.",
    ],
    descriptions: [
      "Interactive stories, songs & games celebrating Caribbean culture. Ages 3-10. Start free today!",
      "Join island kids exploring heritage through play. Games, music & monthly mail kits.",
      "The only Caribbean AI learning platform for kids. Personalized by heritage island.",
    ],
    ctas: ['LEARN_MORE', 'SIGN_UP', 'GET_OFFER'],
  },
  mofu: {
    headlines: [
      "You Visited Us — Meet the Legends!",
      "Your Free Trial Starts Here 🎉",
      "Tanty Spice Is Waiting for Your Child",
      "Complete Your Child's Legend Passport",
    ],
    descriptions: [
      "You explored Likkle Legends. Your child is one step from their island adventure. Start free!",
      "Don't let your child miss out — Caribbean stories, music & games are ready. Try free!",
    ],
    ctas: ['SIGN_UP', 'GET_OFFER'],
  },
  bofu: {
    headlines: [
      "Start for Just $10 — Ships to Your Door!",
      "$10 Legend Intro Pass + Physical Mail Kit",
      "First Caribbean Mail Kit + Portal: $10",
    ],
    descriptions: [
      "First Legend Envelope shipped to your home + full portal access. Caribbean education starts at $10.",
      "Physical mail kit + digital portal for $10. Cancel anytime.",
    ],
    ctas: ['SHOP_NOW', 'GET_OFFER', 'SUBSCRIBE'],
  },
};

export const CHARACTER_CREATIVES = [
  {
    id: 'tanty_spice',
    name: 'Tanty Spice',
    imageFile: 'tanty_spice_avatar.jpg',
    hook: 'Warm Caribbean grandmother teaches your child cultural wisdom',
    targetEmotion: 'trust',
    bestForStage: 'tofu',
  },
  {
    id: 'roti',
    name: 'R.O.T.I.',
    imageFile: 'roti-new.jpg',
    hook: 'AI learning buddy makes island history, phonics & math fun',
    targetEmotion: 'curiosity',
    bestForStage: 'tofu',
  },
  {
    id: 'dilly_doubles',
    name: 'Dilly Doubles',
    imageFile: 'dilly-doubles.jpg',
    hook: 'Rhythm master brings Caribbean joy to every lesson',
    targetEmotion: 'joy',
    bestForStage: 'tofu',
  },
  {
    id: 'mango_moko',
    name: 'Mango Moko',
    imageFile: 'mango_moko.png',
    hook: 'Stilt-walking culture guardian builds island pride',
    targetEmotion: 'pride',
    bestForStage: 'mofu',
  },
  {
    id: 'steelpan_sam',
    name: 'Steelpan Sam',
    imageFile: 'steelpan_sam.png',
    hook: 'Music master turns Caribbean rhythm into learning',
    targetEmotion: 'joy',
    bestForStage: 'tofu',
  },
];

// ─── Meta API Client ──────────────────────────────────────────────────────────

async function metaRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  params: Record<string, any> = {}
): Promise<T> {
  const accessToken = process.env.META_ADS_ACCESS_TOKEN;
  if (!accessToken) throw new Error('META_ADS_ACCESS_TOKEN not configured');

  const url = new URL(`${META_API_BASE}${endpoint}`);

  if (method === 'GET') {
    url.searchParams.set('access_token', accessToken);
    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
    );
  }

  const res = await fetch(url.toString(), {
    method,
    headers: method !== 'GET' ? { 'Content-Type': 'application/json' } : undefined,
    body: method !== 'GET'
      ? JSON.stringify({ ...params, access_token: accessToken })
      : undefined,
  });

  const data = await res.json();
  if (data.error) throw new Error(`Meta API: ${data.error.message} (${data.error.code})`);
  return data as T;
}

export async function getCampaigns(adAccountId: string): Promise<MetaCampaign[]> {
  const data = await metaRequest<{ data: MetaCampaign[] }>(
    `/act_${adAccountId}/campaigns`,
    'GET',
    { fields: 'id,name,status,objective,daily_budget,lifetime_budget' }
  );
  return data.data;
}

export async function createCampaign(
  adAccountId: string,
  name: string,
  objective: string,
  status: 'ACTIVE' | 'PAUSED' = 'PAUSED',
  lifetimeBudgetCents?: number
): Promise<{ id: string }> {
  const params: Record<string, any> = { name, objective, status };
  if (lifetimeBudgetCents) params.lifetime_budget = String(lifetimeBudgetCents);
  return metaRequest(`/act_${adAccountId}/campaigns`, 'POST', params);
}

export async function updateCampaignStatus(
  campaignId: string,
  status: 'ACTIVE' | 'PAUSED'
): Promise<void> {
  await metaRequest(`/${campaignId}`, 'POST', { status });
}

export async function createAdSet(
  adAccountId: string,
  campaignId: string,
  name: string,
  lifetimeBudgetCents: number,
  targeting: MetaTargeting,
  optimizationGoal: string,
  endTime: string
): Promise<{ id: string }> {
  return metaRequest(`/act_${adAccountId}/adsets`, 'POST', {
    name,
    campaign_id: campaignId,
    lifetime_budget: String(lifetimeBudgetCents),
    targeting,
    optimization_goal: optimizationGoal,
    billing_event: 'IMPRESSIONS',
    end_time: endTime,
    status: 'PAUSED',
  });
}

export async function createAdCreative(
  adAccountId: string,
  name: string,
  pageId: string,
  imageUrl: string,
  headline: string,
  body: string,
  destinationUrl: string,
  cta: string = 'LEARN_MORE'
): Promise<{ id: string }> {
  return metaRequest(`/act_${adAccountId}/adcreatives`, 'POST', {
    name,
    object_story_spec: {
      page_id: pageId,
      link_data: {
        image_url: imageUrl,
        link: destinationUrl,
        message: body,
        name: headline,
        call_to_action: { type: cta, value: { link: destinationUrl } },
      },
    },
  });
}

export async function createAd(
  adAccountId: string,
  adSetId: string,
  creativeId: string,
  name: string
): Promise<{ id: string }> {
  return metaRequest(`/act_${adAccountId}/ads`, 'POST', {
    name,
    adset_id: adSetId,
    creative: { creative_id: creativeId },
    status: 'PAUSED',
  });
}

export async function getCampaignInsights(
  campaignId: string,
  datePreset: string = 'last_7d'
): Promise<MetaAdInsights[]> {
  const data = await metaRequest<{ data: MetaAdInsights[] }>(
    `/${campaignId}/insights`,
    'GET',
    { fields: 'campaign_id,campaign_name,impressions,clicks,spend,actions,ctr,cpm', date_preset: datePreset }
  );
  return data.data;
}

export async function getAdAccountSpend(adAccountId: string): Promise<{ spend: string; currency: string }> {
  const data = await metaRequest<{ data: Array<{ spend: string; account_currency: string }> }>(
    `/act_${adAccountId}/insights`,
    'GET',
    { fields: 'spend,account_currency', date_preset: 'last_30d' }
  );
  return { spend: data.data[0]?.spend || '0', currency: data.data[0]?.account_currency || 'USD' };
}

/**
 * One-click launch: Creates 2 campaigns + 3 ad sets + 4 ads for Caribbean diaspora targeting.
 * All start PAUSED for review.
 */
export async function launchCaribbeanCampaign(params: {
  adAccountId: string;
  pageId: string;
  baseUrl: string;
  budgetCents: number;
}): Promise<{ campaignIds: string[]; adSetIds: string[]; adIds: string[]; summary: string }> {
  const { adAccountId, pageId, baseUrl, budgetCents } = params;
  const campaignIds: string[] = [];
  const adSetIds: string[] = [];
  const adIds: string[] = [];

  // Campaign end date: 14 days from now
  const endTime = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const tofuBudget = Math.floor(budgetCents * 0.6);
  const mofuBudget = Math.floor(budgetCents * 0.4);

  // Campaign 1: Cold traffic
  const tofu = await createCampaign(adAccountId, 'LL | TOFU | Caribbean Parents | Cold Traffic', 'OUTCOME_TRAFFIC', 'PAUSED', tofuBudget);
  campaignIds.push(tofu.id);

  const diasporaSet = await createAdSet(adAccountId, tofu.id, 'LL | US Diaspora Cities | 25-44', Math.floor(tofuBudget * 0.55), {
    age_min: 25, age_max: 44,
    geo_locations: { cities: CARIBBEAN_US_CITIES },
    flexible_spec: [{ interests: CARIBBEAN_INTERESTS.slice(0, 5) }, { interests: CARIBBEAN_INTERESTS.slice(5, 9) }],
  }, 'LANDING_PAGE_VIEWS', endTime);
  adSetIds.push(diasporaSet.id);

  const islandsSet = await createAdSet(adAccountId, tofu.id, 'LL | Caribbean Islands Direct | 22-45', Math.floor(tofuBudget * 0.45), {
    age_min: 22, age_max: 45,
    geo_locations: { countries: CARIBBEAN_ISLANDS.slice(0, 8) },
    interests: CARIBBEAN_INTERESTS.slice(5, 9),
  }, 'LANDING_PAGE_VIEWS', endTime);
  adSetIds.push(islandsSet.id);

  // Campaign 2: Retargeting
  const mofu = await createCampaign(adAccountId, 'LL | MOFU | Retarget Visitors | Free Trial', 'OUTCOME_LEADS', 'PAUSED', mofuBudget);
  campaignIds.push(mofu.id);

  const retargetSet = await createAdSet(adAccountId, mofu.id, 'LL | Website Visitors 30d | Signup', mofuBudget, {
    age_min: 24, age_max: 50,
    geo_locations: { countries: ['US', 'CA', 'GB'] },
  }, 'LEAD_GENERATION', endTime);
  adSetIds.push(retargetSet.id);

  // Create ads for TOFU (3 characters)
  const tofuChars = CHARACTER_CREATIVES.filter(c => c.bestForStage === 'tofu').slice(0, 3);
  for (const char of tofuChars) {
    const headline = AD_COPY_TEMPLATES.tofu.headlines[0];
    const body = AD_COPY_TEMPLATES.tofu.descriptions[0];
    const creative = await createAdCreative(adAccountId, `LL | ${char.name} | TOFU`, pageId, `${baseUrl}/games/images/${char.imageFile}`, headline, body, `${baseUrl}?ref=meta_${char.id}`, 'LEARN_MORE');
    const ad = await createAd(adAccountId, diasporaSet.id, creative.id, `LL | ${char.name} | Diaspora`);
    adIds.push(ad.id);
  }

  // Retargeting ad (Tanty Spice - highest trust)
  const mofuCreative = await createAdCreative(adAccountId, 'LL | Tanty | Retarget', pageId, `${baseUrl}/games/images/tanty_spice_avatar.jpg`, AD_COPY_TEMPLATES.mofu.headlines[0], AD_COPY_TEMPLATES.mofu.descriptions[0], `${baseUrl}/signup?ref=meta_retarget`, 'SIGN_UP');
  const mofuAd = await createAd(adAccountId, retargetSet.id, mofuCreative.id, 'LL | Tanty | Retarget Visitors');
  adIds.push(mofuAd.id);

  return {
    campaignIds,
    adSetIds,
    adIds,
    summary: `Created ${campaignIds.length} campaigns, ${adSetIds.length} ad sets, ${adIds.length} ads. All PAUSED — review and activate in Meta Ads Manager.`,
  };
}
