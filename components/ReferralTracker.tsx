"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ReferralTracker() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (ref) {
            console.log(`🔗 Referral detected: ${ref}`);

            // 1. Store in cookie for 30 days
            // We use document.cookie because it's a client component
            const expiration = new Date();
            expiration.setDate(expiration.getDate() + 30);
            document.cookie = `likkle_ref=${ref}; path=/; expires=${expiration.toUTCString()}; SameSite=Lax`;

            // 2. Store in localStorage as backup
            localStorage.setItem('likkle_ref', ref);

            // 3. Log the click (optional, but good for promoter stats)
            // We use a fire-and-forget fetch to avoid blocking
            fetch('/api/growth/log-click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referralCode: ref })
            }).catch(err => console.error('Failed to log referral click', err));
        }
    }, [searchParams]);

    return null; // Invisible component
}
