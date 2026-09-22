"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AgeGate } from '@/components/AgeGate';
import { listDrafts } from '@/lib/island-helpers/journey-stories/draft-store';
import type { JourneyStoryDraft } from '@/lib/island-helpers/journey-stories/types';
import { IH_JOURNEY_STORIES } from '@/lib/island-helpers/copy';
import { EthicsDisclaimer } from '@/components/island-helpers/EthicsDisclaimer';

export default function JourneyStoriesIndexPage() {
  const [verified, setVerified] = useState(false);
  const [drafts, setDrafts] = useState<JourneyStoryDraft[]>([]);

  useEffect(() => {
    if (verified) setDrafts(listDrafts());
  }, [verified]);

  if (!verified) return <AgeGate onVerified={() => setVerified(true)} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-orange-50">
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Link href="/island-helpers" className="text-sm font-black text-amber-700 underline">
          ← Island Helpers
        </Link>
        <h1 className="text-3xl font-black text-blue-950">{IH_JOURNEY_STORIES}</h1>
        <p className="font-semibold text-blue-800/80">
          Parent drafts stay private until you Publish.
        </p>
        <Link
          href="/island-helpers/journey-stories/new"
          className="inline-flex rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 font-black text-white shadow"
        >
          Create a Journey Story
        </Link>
        <ul className="space-y-3">
          {drafts.map((d) => (
            <li key={d.id} className="rounded-2xl bg-white border border-blue-100 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-blue-950">{d.scenarioLabel}</p>
                <p className="text-xs font-bold text-blue-700/70">
                  {d.status} · {new Date(d.updatedAt).toLocaleString()}
                </p>
              </div>
              <Link
                href={`/island-helpers/journey-stories/${d.id}/edit`}
                className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-900"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
        <EthicsDisclaimer />
      </main>
    </div>
  );
}
