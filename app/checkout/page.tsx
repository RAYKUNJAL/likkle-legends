"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import CheckoutFlow from '@/components/CheckoutFlow';
import { SubscriptionTier } from '@/lib/paypal';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') as SubscriptionTier | null;
    const cycle = searchParams.get('cycle') as 'month' | 'year' | null;
    const childName = searchParams.get('childName') || '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                        <ArrowLeft size={20} />
                        <span className="font-medium">Back to Home</span>
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ShieldCheck size={18} className="text-green-500" />
                        Secure Checkout
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="py-12 px-4">
                <CheckoutFlow
                    selectedTier={plan || undefined}
                    initialBillingCycle={cycle || undefined}
                    initialChildName={childName}
                    onSuccess={(subscriptionId) => {
                        // Success handling
                    }}
                    onError={(error) => {
                        console.error('Checkout error:', error);
                    }}
                />
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-sm text-gray-400">
                <p>
                    By subscribing, you agree to our{' '}
                    <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
            </footer>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
