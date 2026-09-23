"use client";

import { useState, useEffect } from 'react';
import { X, Sparkles, Clock } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { AskAParentNotice } from '@/components/portal/AskAParentNotice';

/**
 * FreeTierBanner — CRO banner shown inside the portal for:
 *   - Free users: prompts to upgrade
 *   - Trialing users: shows trial countdown + urgency nudge
 *   - Expired/canceled users: nudges to renew
 * Hidden for teachers, admins, and active paid subscribers.
 */
export function FreeTierBanner() {
    const { user, isSubscribed } = useUser();
    const [dismissed, setDismissed] = useState(false);
    const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

    useEffect(() => {
        if (user?.trial_ends_at) {
            const ms = new Date(user.trial_ends_at).getTime() - Date.now();
            setTrialDaysLeft(Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24))));
        }
    }, [user?.trial_ends_at]);

    if (dismissed || !user) return null;

    // Never show to teachers or admins — they get free access
    if (user.role === 'teacher' || user.role === 'admin' || user.is_admin) return null;

    const isTrialing = user.subscription_status === 'trialing';
    const isExpired =
        !isSubscribed &&
        (user.subscription_status === 'canceled' || user.subscription_status === 'past_due');
    const isFree = !isSubscribed && user.subscription_tier === 'free' && !isExpired;

    // Nothing to show for active paid subscribers
    if (!isFree && !isTrialing && !isExpired) return null;

    const urgency = isExpired || (isTrialing && trialDaysLeft !== null && trialDaysLeft <= 3);

    let message: string;

    if (isExpired) {
        message = 'Your subscription ended — a parent can renew from their account.';
    } else if (isTrialing) {
        if (trialDaysLeft !== null && trialDaysLeft <= 3) {
            message = `Trial ends in ${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''}. A parent can keep the plan going.`;
        } else {
            message = `Free trial active${trialDaysLeft ? ` · ${trialDaysLeft} days left` : ''}.`;
        }
    } else {
        message = 'Free plan. A parent can add an Island Pack from their account.';
    }

    return (
        <div
            className={`w-full px-4 py-2.5 flex items-center justify-between gap-4 text-sm font-bold shrink-0 ${
                urgency ? 'bg-amber-500 text-white' : 'bg-[#083344] text-white'
            }`}
        >
            <div className="flex items-center gap-2 min-w-0 flex-1">
                {isTrialing
                    ? <Clock size={14} className="flex-shrink-0 opacity-80" />
                    : <Sparkles size={14} className="flex-shrink-0 opacity-80" />
                }
                <span className="truncate text-xs sm:text-sm">{message}</span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <AskAParentNotice className={urgency ? 'text-white' : 'text-white'} />

                <button
                    onClick={() => setDismissed(true)}
                    className="opacity-60 hover:opacity-100 transition-opacity p-0.5"
                    aria-label="Dismiss upgrade banner"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
