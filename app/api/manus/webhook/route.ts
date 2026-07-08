import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/manus/webhook
 *
 * Receives daily performance reports and event callbacks from Manus AI
 * after it takes autonomous actions on the Meta ad account.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, payload, timestamp } = body;

    console.log(`[Manus Webhook] Received event: ${event} at ${timestamp}`);

    // ── Handle Manus callback events ───────────────────────────────────────
    switch (event) {
      case 'daily_report': {
        // Manus sends daily spend + performance summary
        const { spend, impressions, clicks, leads, cpc, ctr, topCreative } = payload || {};
        console.log('[Manus] Daily Report:', { spend, impressions, clicks, leads, cpc, ctr, topCreative });

        // TODO: Store in Supabase analytics table for dashboard display
        // await supabase.from('manus_reports').insert({ ...payload, created_at: timestamp });

        return NextResponse.json({
          received: true,
          event,
          message: 'Daily report acknowledged',
        });
      }

      case 'creative_paused': {
        // Manus paused an underperforming creative
        const { creativeId, reason, metrics } = payload || {};
        console.log(`[Manus] Creative paused: ${creativeId} — ${reason}`, metrics);

        return NextResponse.json({
          received: true,
          event,
          message: `Creative ${creativeId} pause confirmed`,
        });
      }

      case 'budget_scaled': {
        // Manus scaled budget on a winning ad set
        const { adSetId, oldBudget, newBudget, triggerRoas } = payload || {};
        console.log(`[Manus] Budget scaled on ${adSetId}: $${oldBudget} → $${newBudget} (ROAS ${triggerRoas}x)`);

        return NextResponse.json({
          received: true,
          event,
          message: `Budget scale to $${newBudget} confirmed`,
        });
      }

      case 'anomaly_alert': {
        // Manus detected unusual activity (spike spend, CTR drop, etc.)
        const { type, severity, description } = payload || {};
        console.warn(`[Manus] ANOMALY ALERT [${severity}]: ${type} — ${description}`);

        // TODO: Send Slack/email alert to admin
        return NextResponse.json({
          received: true,
          event,
          message: 'Anomaly acknowledged',
          severity,
        });
      }

      case 'campaign_launched': {
        const { campaignId, campaignName, status } = payload || {};
        console.log(`[Manus] Campaign launched: ${campaignName} (${campaignId}) — ${status}`);

        return NextResponse.json({
          received: true,
          event,
          message: `Campaign ${campaignName} launch confirmed`,
        });
      }

      default: {
        console.log(`[Manus] Unhandled event type: ${event}`, payload);
        return NextResponse.json({ received: true, event, message: 'Event logged' });
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Manus Webhook] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/manus/webhook
 * Health check for Manus to verify endpoint is reachable
 */
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    endpoint: 'Likkle Legends × Manus AI Webhook',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
