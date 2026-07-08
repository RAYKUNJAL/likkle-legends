import { NextRequest, NextResponse } from 'next/server';
import {
  getCampaigns,
  updateCampaignStatus,
  getCampaignInsights,
  getAdAccountSpend,
  launchCaribbeanCampaign,
  AD_COPY_TEMPLATES,
  CHARACTER_CREATIVES,
} from '@/lib/meta-ads';

function acctId() {
  const id = process.env.META_AD_ACCOUNT_ID || '';
  return id.startsWith('act_') ? id.replace('act_', '') : id;
}

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action') || 'config';

  try {
    if (action === 'config') {
      return NextResponse.json({
        configured: !!(acctId() && process.env.META_PAGE_ID && process.env.META_ADS_ACCESS_TOKEN),
        adAccountId: acctId() ? `act_${acctId()}` : null,
        pageId: process.env.META_PAGE_ID || null,
        pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || null,
        hasAccessToken: !!process.env.META_ADS_ACCESS_TOKEN,
        characters: CHARACTER_CREATIVES,
        copyTemplates: AD_COPY_TEMPLATES,
      });
    }
    if (action === 'campaigns') {
      if (!acctId()) return NextResponse.json({ error: 'META_AD_ACCOUNT_ID not set' }, { status: 400 });
      return NextResponse.json({ campaigns: await getCampaigns(acctId()) });
    }
    if (action === 'spend') {
      if (!acctId()) return NextResponse.json({ error: 'META_AD_ACCOUNT_ID not set' }, { status: 400 });
      return NextResponse.json(await getAdAccountSpend(acctId()));
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { action } = body;

  try {
    if (action === 'launch_caribbean') {
      if (!acctId()) return NextResponse.json({ error: 'META_AD_ACCOUNT_ID not configured' }, { status: 400 });
      if (!process.env.META_PAGE_ID) return NextResponse.json({ error: 'META_PAGE_ID not configured' }, { status: 400 });
      if (!process.env.META_ADS_ACCESS_TOKEN) return NextResponse.json({ error: 'META_ADS_ACCESS_TOKEN not configured' }, { status: 400 });
      const result = await launchCaribbeanCampaign({
        adAccountId: acctId(),
        pageId: process.env.META_PAGE_ID,
        baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.likklelegends.com',
        budgetCents: Math.floor((body.budgetUSD || 100) * 100),
      });
      return NextResponse.json(result);
    }
    if (action === 'toggle_campaign') {
      await updateCampaignStatus(body.campaignId, body.status);
      return NextResponse.json({ success: true });
    }
    if (action === 'get_insights') {
      const insights = await getCampaignInsights(body.campaignId, body.datePreset);
      return NextResponse.json({ insights });
    }
    if (action === 'generate_copy') {
      const { stage = 'tofu', character } = body;
      const templates = AD_COPY_TEMPLATES[stage as keyof typeof AD_COPY_TEMPLATES] || AD_COPY_TEMPLATES.tofu;
      const charData = CHARACTER_CREATIVES.find(c => c.id === character) || CHARACTER_CREATIVES[0];
      return NextResponse.json({ character: charData, ...templates, imageUrl: `/games/images/${charData.imageFile}` });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
