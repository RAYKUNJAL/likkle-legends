import { PAID_STATUSES, PAID_TIERS, type AgeBand } from './constants';

export type MemberProfile = {
    is_admin?: boolean | null;
    role?: string | null;
    subscription_status?: string | null;
    subscription_tier?: string | null;
};

/** Same gate as UserContext.canAccess('starter_mailer'). Missing data fails closed. */
export function isPaidMemberProfile(profile: MemberProfile | null | undefined): boolean {
    if (!profile) return false;
    const role = String(profile.role || '').toLowerCase();
    if (profile.is_admin || role === 'admin' || role === 'super_admin' || role === 'teacher') {
        return true;
    }
    const status = String(profile.subscription_status || '').toLowerCase();
    const tier = String(profile.subscription_tier || 'free').toLowerCase();
    return (PAID_STATUSES as readonly string[]).includes(status)
        && (PAID_TIERS as readonly string[]).includes(tier);
}

export function isContentAdminProfile(profile: MemberProfile | null | undefined, adminUserRole?: string | null): boolean {
    if (adminUserRole) {
        const staff = adminUserRole.toLowerCase();
        if (staff === 'admin' || staff === 'super_admin' || staff === 'editor') return true;
    }
    if (!profile) return false;
    const role = String(profile.role || '').toLowerCase();
    return profile.is_admin === true || role === 'admin' || role === 'super_admin';
}

export type AgeTarget = {
    age_min: number | null;
    age_max: number | null;
    age_band: string | null;
};

export type ChildAge = {
    age?: number | null;
    age_track?: string | null;
};

/**
 * Age is a shelf filter, not an access check.
 * No child context shows every assigned live asset.
 * A numeric range wins when the child's age is known.
 */
export function assetVisibleForChild(asset: AgeTarget, child: ChildAge | null | undefined): boolean {
    const band = asset.age_band && asset.age_band !== 'all' ? asset.age_band : null;
    const hasRange = asset.age_min != null || asset.age_max != null;
    if (!child) return true;
    if (!band && !hasRange) return true;

    if (hasRange && child.age != null && Number.isFinite(child.age)) {
        const min = asset.age_min ?? 0;
        const max = asset.age_max ?? 18;
        return child.age >= min && child.age <= max;
    }

    if (band && child.age_track) {
        return child.age_track === band;
    }

    return true;
}

export function isAgeBand(value: string | null | undefined): value is AgeBand {
    return value === 'all' || value === 'mini' || value === 'big';
}
