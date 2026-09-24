import { isParentPayerRole } from '@/lib/paypal-offers';

export type AccountRoleRow = { role?: string | null; email?: string | null } | null;

/**
 * Parent checkout identity.
 * Live parents are stored on profiles (role parent). Older rows live on users,
 * sometimes with the column default "user", which is still a parent account.
 * The profiles fallback only accepts role exactly "parent".
 * A missing account fails closed. Teacher and child roles stay blocked.
 */
export function effectivePayerRole(role: string | null | undefined): string {
    const value = (role && String(role).trim().toLowerCase()) || '';
    if (!value || value === 'user') return 'parent';
    return value;
}

export function resolvePayerAccount(input: {
    usersRow: AccountRoleRow;
    usersError: boolean;
    profileRow: AccountRoleRow;
    profileError: boolean;
}): { ok: true; role: string; email: string | null } | { ok: false } {
    const users = !input.usersError && input.usersRow ? input.usersRow : null;
    if (users) {
        const role = effectivePayerRole(users.role);
        if (!isParentPayerRole(role)) return { ok: false };
        return { ok: true, role, email: users.email || null };
    }
    // Profiles fallback is strict: the row must say parent. No default, no other payer roles.
    const profile = !input.profileError && input.profileRow ? input.profileRow : null;
    if (!profile) return { ok: false };
    const profileRole = (profile.role && String(profile.role).trim().toLowerCase()) || '';
    if (profileRole !== 'parent') return { ok: false };
    return { ok: true, role: 'parent', email: profile.email || null };
}
