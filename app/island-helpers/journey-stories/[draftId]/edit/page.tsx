"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AgeGate } from '@/components/AgeGate';
import { JourneyStoryWizard } from '@/components/island-helpers/journey-stories/JourneyStoryWizard';

export default function EditJourneyStoryPage({ params }: { params: { draftId: string } }) {
  const [verified, setVerified] = useState(false);
  if (!verified) return <AgeGate onVerified={() => setVerified(true)} />;
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-orange-50">
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Link href="/island-helpers/journey-stories" className="text-sm font-black text-amber-700 underline">
          ← Journey Stories
        </Link>
        <JourneyStoryWizard mode="edit" initialDraftId={params.draftId} />
      </main>
    </div>
  );
}
