"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import {
  IH_CALM_MODE,
  IH_FIRST_THEN,
  IH_JOURNEY_CTA,
  IH_JOURNEY_STORIES,
  IH_MY_PHRASES,
  IH_OPEN_IN_BOOK,
  IH_PRODUCT_NAME,
  IH_START_HERE,
} from '@/lib/island-helpers/copy';
import { useCalmMode } from './useCalmMode';
import { Soundboard } from './Soundboard';
import { DisplayModeToggle } from './DisplayModeToggle';
import { EthicsDisclaimer } from './EthicsDisclaimer';
import { JourneyToolsDrawer } from './JourneyToolsDrawer';
import { ParentExplainer } from './ParentExplainer';

export function IslandHelpersHome() {
  const { calmMode, setCalmMode } = useCalmMode();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={`min-h-screen bg-gradient-to-b from-sky-100 via-amber-50 to-orange-50 ${calmMode ? 'ih-calm' : ''}`}>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-amber-200/60">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Likkle Legends</p>
            <h1 className="text-2xl font-black text-blue-950">{IH_PRODUCT_NAME}</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#ih-parent-guide"
              className="hidden sm:inline-flex items-center rounded-2xl bg-amber-100 px-3 py-2 text-sm font-black text-amber-900"
            >
              {IH_START_HERE}
            </a>
            <Link href="/portal/stories" className="hidden sm:inline-flex items-center gap-1 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-900">
              <BookOpen size={16} /> Library
            </Link>
            <JourneyToolsDrawer parentControls />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <ParentExplainer />

        <section id="ih-tools" className="scroll-mt-24 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-teal-700 px-1">Your tools</p>
          <h2 className="text-2xl font-black text-blue-950 px-1">Try them when you are ready</h2>
        </section>

        <section className="rounded-[2rem] bg-white border border-teal-100 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-black text-blue-950 text-lg">{IH_CALM_MODE}</p>
            <p className="text-sm font-semibold text-blue-700/70">
              Soft palette, less motion, no surprise read-aloud.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={mounted ? calmMode : false}
            onClick={() => setCalmMode(!calmMode)}
            className={`relative w-16 h-9 rounded-full transition-colors ${calmMode ? 'bg-teal-500' : 'bg-blue-200'}`}
          >
            <span
              className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow transition-transform ${
                calmMode ? 'translate-x-7' : ''
              }`}
            />
          </button>
        </section>

        <div className="rounded-[2rem] bg-white border border-amber-100 p-5 shadow-sm">
          <Soundboard showMixTab />
        </div>

        <section className="rounded-[2rem] bg-white border border-blue-100 p-5 space-y-4">
          <h3 className="text-xl font-black text-blue-950">Quick links</h3>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/portal/stories"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-white font-black shadow-md"
            >
              <BookOpen size={18} /> {IH_OPEN_IN_BOOK}
            </Link>
            <Link
              href="/island-helpers/phrases"
              className="inline-flex items-center rounded-2xl bg-blue-50 px-5 py-3 text-blue-900 font-black"
            >
              {IH_MY_PHRASES}
            </Link>
            <Link
              href="/island-helpers/schedule"
              className="inline-flex items-center rounded-2xl bg-teal-50 px-5 py-3 text-teal-900 font-black"
            >
              {IH_FIRST_THEN}
            </Link>
          </div>
          <DisplayModeToggle />
          <Link href="/island-helpers/phrases" className="inline-flex font-black text-amber-700 underline">
            Edit custom phrases →
          </Link>
        </section>

        <section className="rounded-[2rem] bg-white border-4 border-teal-200 p-6 shadow-lg space-y-3">
          <h2 className="text-2xl font-black text-blue-950">{IH_JOURNEY_STORIES}</h2>
          <p className="font-semibold text-blue-800/80">
            Make a short adventure storybook for a new place. You review every page before your likkle one sees it.
          </p>
          <Link
            href="/island-helpers/journey-stories/new"
            className="inline-flex rounded-2xl bg-teal-600 px-5 py-3 font-black text-white"
          >
            {IH_JOURNEY_CTA}
          </Link>
          <Link href="/island-helpers/journey-stories" className="ml-3 inline-flex font-black text-teal-800 underline">
            My drafts
          </Link>
        </section>

        <section className="rounded-[2rem] bg-white border border-blue-100 p-5 space-y-3">
          <h3 className="text-lg font-black text-blue-950">A gentle note for grown-ups</h3>
          <EthicsDisclaimer />
        </section>

        <p className="text-center text-sm font-bold text-blue-700/60 pb-8">
          <Link href="/" className="underline">Back to adventure home</Link>
        </p>
      </main>
    </div>
  );
}
