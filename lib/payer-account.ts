import { isParentPayerRole } from '@/lib/paypal-offers';

export type AccountRoleRow = { role?: string | null; email?: string | null } | null;

/**
 * Parent checkout identity.
 * Live parents are stored on profiles (role parent). Older rows live on users,
 * sometimes with the column default "user", which is still a parent account.
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
    const profile = !input.profileError && input.profileRow ? input.profileRow : null;
    const row = users || profile;
    if (!row) return { ok: false };
    const role = effectivePayerRole(row.role);
    if (!isParentPayerRole(role)) return { ok: false };
    return { ok: true, role, email: row.email || null };
}
