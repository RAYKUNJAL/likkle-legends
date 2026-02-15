"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, User, Sparkles, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { useState, useEffect, Suspense } from 'react';
import { signupAction } from '@/app/actions/auth-actions';
import { trackEvent } from '@/lib/analytics';

import OnboardingFlow from '@/components/landing/OnboardingFlow';

// Signup Form Wrapper Component
function SignupForm() {
    const searchParams = useSearchParams();

    // Helpers
    const getParam = (key: string, fallback: string) => {
        try {
            let value = searchParams?.get(key);
            if (!value) return fallback;
            value = value.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
            return value || fallback;
        } catch {
            return fallback;
        }
    };

    const plan = getParam('plan', 'plan_free_forever');
    const referral = getParam('referral', 'direct');

    return (
        <div className="min-h-screen bg-[#FFFDF7] flex flex-col justify-center py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 blur-[100px] -ml-48 -mb-48 pointer-events-none"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center mb-12">
                <Link href="/" className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-zinc-100 hover:border-emerald-500 transition-all mb-8">
                    <ArrowLeft size={16} className="text-zinc-400" />
                    <span className="font-bold text-sm text-deep/60">Back home</span>
                </Link>
                <div className="relative h-12 w-40 mx-auto mb-4">
                    <Image
                        src="/images/logo.png"
                        alt="Likkle Legends"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-[540px] relative z-10">
                <div className="bg-white p-12 shadow-2xl shadow-zinc-200/50 rounded-[3.5rem] border border-zinc-100">
                    <OnboardingFlow plan={plan} referral={referral} />
                </div>
            </div>
        </div>
    );
}

// Main Page with Suspense Boundary
export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={48} />
            </div>
        }>
            <SignupForm />
        </Suspense>
    );
}
