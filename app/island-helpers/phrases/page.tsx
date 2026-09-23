"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AgeGate } from '@/components/AgeGate';
import { PhraseEditor } from '@/components/island-helpers/PhraseEditor';
import { EthicsDisclaimer } from '@/components/island-helpers/EthicsDisclaimer';
import { IH_MY_PHRASES, IH_PRODUCT_NAME } from '@/lib/island-helpers/copy';

export default function IslandHelpersPhrasesPage() {
  const [verified, setVerified] = useState(false);

  if (!verified) {
    return <AgeGate onVerified={() => setVerified(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-amber-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">{IH_PRODUCT_NAME}</p>
            <h1 className="text-3xl font-black text-blue-950">{IH_MY_PHRASES}</h1>
            <p className="text-sm font-bold text-blue-700/70">Add family phrases. Starter cards stay locked.</p>
          </div>
          <Link href="/island-helpers" className="rounded-2xl bg-white border px-4 py-2 text-sm font-black text-blue-900">
            Back
          </Link>
        </div>
        <PhraseEditor />
        <EthicsDisclaimer compact />
      </div>
    </div>
  );
}
