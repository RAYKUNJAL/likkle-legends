'use client';

import { useScrollTracking } from '@/lib/analytics';

export default function ClientAnalytics() {
    useScrollTracking();
    return null;
}
