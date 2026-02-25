"use client";

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

/**
 * This page has been consolidated into the AI Verification Queue.
 * Redirecting to /admin/ai-review for the unified approval workflow.
 */
export default function ApprovalPage() {
    useEffect(() => {
        window.location.href = '/admin/ai-review';
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-bold">Redirecting to AI Verification Queue...</p>
            </div>
        </div>
    );
}
