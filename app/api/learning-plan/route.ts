import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-client';
import { generatePlanAction } from '@/app/actions/generate-plan';

// ─── GET /api/learning-plan?childId=xxx ──────────────────────────────────────
// Returns the active plan for the authenticated parent's child.

export async function GET(request: NextRequest) {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const childId = request.nextUrl.searchParams.get('childId');
    if (!childId) {
        return NextResponse.json({ error: 'childId required' }, { status: 400 });
    }

    // Verify ownership
    const { data: child } = await supabase
        .from('children')
        .select('id')
        .eq('id', childId)
        .eq('parent_id', user.id)
        .single();

    if (!child) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Fetch active plan
    const { data: plan, error } = await supabaseAdmin
        .from('learning_plans')
        .select('*')
        .eq('child_id', childId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error || !plan) {
        return NextResponse.json({ plan: null }, { status: 200 });
    }

    // Get subscription tier to determine what to expose
    const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', user.id)
        .single();

    const TIER_LEVELS: Record<string, number> = {
        'free': 0, 'plan_free_forever': 0,
        'starter_mailer': 1, 'plan_mail_intro': 1, 'plan_digital_legends': 1,
        'legends_plus': 2, 'plan_legends_plus': 2,
        'family_legacy': 3, 'plan_family_legacy': 3,
        'admin': 10,
    };

    const tier = profile?.subscription_tier || 'free';
    const tierLevel = TIER_LEVELS[tier] ?? 0;
    const trialMode = tierLevel === 0;

    return NextResponse.json({
        plan,
        trialMode,
        tierLevel,
    });
}

// ─── POST /api/learning-plan ──────────────────────────────────────────────────
// Generates (or regenerates) a plan for a child.

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { childId?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (!body.childId) {
        return NextResponse.json({ error: 'childId required' }, { status: 400 });
    }

    const result = await generatePlanAction({ childId: body.childId });

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
        plan: result.plan,
        trialMode: result.trialMode,
    });
}
