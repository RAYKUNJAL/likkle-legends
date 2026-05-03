'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('transaction_id');
  const childName = searchParams.get('childName') || '';
  const onboardingHref = `/onboarding/welcome${childName ? `?childName=${encodeURIComponent(childName)}` : ''}`;

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">
          Welcome to the Legends!
        </h1>
        <p className="text-slate-600 mb-2">
          Your payment was successful. Your child&apos;s Caribbean adventure begins now!
        </p>
        {transactionId && (
          <p className="text-xs text-slate-400 mb-6">
            Transaction: {transactionId}
          </p>
        )}
        <div className="flex flex-col gap-3">
          <Link
            href={onboardingHref}
            className="w-full py-3 bg-primary text-white rounded-xl font-bold text-center hover:opacity-90 transition-opacity"
          >
            Set Up Child Profile
          </Link>
          <Link
            href="/"
            className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-center hover:bg-slate-200 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
