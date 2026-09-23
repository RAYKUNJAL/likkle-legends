"use client";

import React from 'react';
import Link from 'next/link';
import { FirstThenBoard } from '@/components/island-helpers/FirstThenBoard';
import { CalmModeProvider } from '@/components/island-helpers/CalmModeProvider';

export default function SchedulePage() {
  return (
    <CalmModeProvider>
      <div className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-orange-50">
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <Link href="/island-helpers" className="text-sm font-black text-amber-700 underline">
            ← Island Helpers
          </Link>
          <div className="rounded-[2rem] bg-white border border-amber-100 p-5 shadow-sm">
            <FirstThenBoard />
          </div>
        </main>
      </div>
    </CalmModeProvider>
  );
}
