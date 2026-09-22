"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import {
  IH_CALM_MODE,
  IH_HOME_SUBTITLE,
  IH_MY_PHRASES,
  IH_OPEN_IN_BOOK,
  IH_PRODUCT_NAME,
} from '@/lib/island-helpers/copy';
import { useCalmMode } from './useCalmMode';
import { Soundboard } from './Soundboard';
import { DisplayModeToggle } from './DisplayModeToggle';
import { EthicsDisclaimer } from './EthicsDisclaimer';
import { JourneyToolsDrawer } from './JourneyToolsDrawer';

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
            <Link href="/library" className="hidden sm:inline-flex items-center gap-1 rounded-2xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-900">
              <BookOpen size={16} /> Library
            </Link>
            <JourneyToolsDrawer parentControls />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <section className="rounded-[2rem] bg-white border-4 border-amber-200 p-6 shadow-lg">
          <h2 className="text-3xl font-black text-blue-950 mb-2">{IH_PRODUCT_NAME}</h2>
          <p className="text-lg font-bold text-blue-800/80 leading-snug">{IH_HOME_SUBTITLE}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/library"
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
          </div>
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
          <Soundboard />
        </div>

        <section className="rounded-[2rem] bg-white border border-blue-100 p-5 space-y-4">
          <h3 className="text-xl font-black text-blue-950">Parent tools</h3>
          <DisplayModeToggle />
          <Link href="/island-helpers/phrases" className="inline-flex font-black text-amber-700 underline">
            Edit custom phrases →
          </Link>
          <EthicsDisclaimer />
        </section>

        <p className="text-center text-sm font-bold text-blue-700/60 pb-8">
          <Link href="/" className="underline">Back to adventure home</Link>
        </p>
      </main>
    </div>
  );
}
