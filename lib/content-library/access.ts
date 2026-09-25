import { NextRequest, NextResponse } from 'next/server';
import { isContentAdminProfile, isPaidMemberProfile, type MemberProfile } from './visibility';

export type AuthOk = { ok: true; userId: string; profile: MemberProfile };
export type AuthFail = { ok: false; response: NextResponse };
export type AuthResult = AuthOk | AuthFail;

async function resolveUserId(request: NextRequest): Promise<string | null> {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        try {
            const { supabaseAdmin } = await import('@/lib/supabase-client');
            const { data, error } = await supabaseAdmin.auth.getUser(token);
            if (!error && data?.user) return data.user.id;
        } catch {
            // Fall through to the cookie session.
        }
    }

    try {
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        return data?.user?.id ?? null;
    } catch {
        return null;
    }
}

async function loadProfile(userId: string): Promise<{ profile: MemberProfile | null; adminRole: string | null }> {
    const { createAdminClient } = await import('@/lib/admin');
    const admin = createAdminClient();
    const [profileRes, adminRes] = await Promise.all([
        admin.from('profiles').select('role, is_admin, subscription_status, subscription_tier').eq('id', userId).maybeSingle(),
        admin.from('admin_users').select('role').eq('id', userId).maybeSingle(),
    ]);
    return {
        profile: (profileRes.data as MemberProfile | null) ?? null,
        adminRole: adminRes.data?.role ? String(adminRes.data.role) : null,
    };
}

export async function requireContentAdmin(request: NextRequest): Promise<AuthResult> {
    const userId = await resolveUserId(request);
    if (!userId) {
        return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    try {
        const { profile, adminRole } = await loadProfile(userId);
        if (!isContentAdminProfile(profile, adminRole)) {
            return { ok: false, response: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }) };
        }
        return { ok: true, userId, profile: profile || {} };
    } catch {
        return { ok: false, response: NextResponse.json({ error: 'Authorization check failed' }, { status: 500 }) };
    }
}

export async function requirePaidMember(request: NextRequest): Promise<AuthResult> {
    const userId = await resolveUserId(request);
    if (!userId) {
        return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    try {
        const { profile, adminRole } = await loadProfile(userId);
        const allowed = isPaidMemberProfile(profile) || isContentAdminProfile(profile, adminRole);
        if (!allowed) {
            return {
                ok: false,
                response: NextResponse.json({ error: 'Members only' }, { status: 403 }),
            };
        }
        return { ok: true, userId, profile: profile || {} };
    } catch {
        return { ok: false, response: NextResponse.json({ error: 'Authorization check failed' }, { status: 500 }) };
    }
}
