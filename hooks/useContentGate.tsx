"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import LeadCaptureModal from '@/components/LeadCaptureModal';

interface ContentGateContextType {
    hasAccess: boolean;
    viewCount: number;
    checkAccess: (contentType: string) => boolean;
    grantAccess: (email: string) => void;
    showGate: (source: string) => void;
}

const ContentGateContext = createContext<ContentGateContextType | null>(null);

// Free views before requiring email
const FREE_VIEW_LIMITS: Record<string, number> = {
    story: 3,
    song: 3,
    game: 5,
    printable: 2,
    default: 3,
};

export function ContentGateProvider({ children }: { children: ReactNode }) {
    const [hasAccess, setHasAccess] = useState(false);
    const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
    const [showModal, setShowModal] = useState(false);
    const [gateSource, setGateSource] = useState('content_gate');

    useEffect(() => {
        // Check for existing email
        const savedEmail = localStorage.getItem('ll_lead_email');
        if (savedEmail) {
            setHasAccess(true);
        }

        // Load view counts
        const counts = localStorage.getItem('ll_view_counts');
        if (counts) {
            setViewCounts(JSON.parse(counts));
        }
    }, []);

    const checkAccess = (contentType: string): boolean => {
        // If they have email, unlimited access
        if (hasAccess) return true;

        const limit = FREE_VIEW_LIMITS[contentType] || FREE_VIEW_LIMITS.default;
        const currentCount = viewCounts[contentType] || 0;

        if (currentCount < limit) {
            // Increment count
            const newCounts = { ...viewCounts, [contentType]: currentCount + 1 };
            setViewCounts(newCounts);
            localStorage.setItem('ll_view_counts', JSON.stringify(newCounts));
            return true;
        }

        // Show gate
        setGateSource(`${contentType}_gate`);
        setShowModal(true);
        return false;
    };

    const grantAccess = (email: string) => {
        localStorage.setItem('ll_lead_email', email);
        setHasAccess(true);
        setShowModal(false);
    };

    const showGate = (source: string) => {
        setGateSource(source);
        setShowModal(true);
    };

    return (
        <ContentGateContext.Provider value={{
            hasAccess,
            viewCount: Object.values(viewCounts).reduce((a, b) => a + b, 0),
            checkAccess,
            grantAccess,
            showGate
        }}>
            {children}
            <LeadCaptureModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                source={gateSource}
                onSuccess={grantAccess}
            />
        </ContentGateContext.Provider>
    );
}

export function useContentGate() {
    const context = useContext(ContentGateContext);
    if (!context) {
        throw new Error('useContentGate must be used within ContentGateProvider');
    }
    return context;
}

// Simple hook for checking if a specific content type can be viewed
export function useCanViewContent(contentType: string) {
    const { hasAccess, checkAccess } = useContentGate();

    return {
        hasFullAccess: hasAccess,
        canView: () => checkAccess(contentType),
    };
}
