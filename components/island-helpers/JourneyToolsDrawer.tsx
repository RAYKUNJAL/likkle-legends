"use client";

/**
 * Island Helpers drawer (component name kept for history; visible title: Island Helpers).
 * Closed by default. Opening must not call speakPhrase.
 */
import React, { useState } from 'react';
import Link from 'next/link';
import { Backpack, X } from 'lucide-react';
import { IH_CALM_MODE, IH_JOURNEY_STORIES, IH_KID_DRAWER_LABEL, IH_MY_PHRASES, IH_PRODUCT_NAME } from '@/lib/island-helpers/copy';
import { useCalmMode } from './useCalmMode';
import { Soundboard } from './Soundboard';
import { DisplayModeToggle } from './DisplayModeToggle';
import { FirstThenBoard } from './FirstThenBoard';
import { openInStoryAacOverlay } from './InStoryAacOverlay';
import { ParentExplainer } from './ParentExplainer';

type Props = {
  /** Parent-gated controls on home; reader uses read-only display. */
  parentControls?: boolean;
  /** Optional controlled open (home can pass). */
  defaultOpen?: boolean;
};

export function JourneyToolsDrawer({ parentControls = false, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const { calmMode, setCalmMode } = useCalmMode();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open ${IH_PRODUCT_NAME}`}
        title={IH_PRODUCT_NAME}
        className="ih-drawer-trigger w-11 h-11 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center shadow-lg hover:bg-amber-300 active:scale-95 transition-all"
      >
        <Backpack size={22} />
        <span className="sr-only">{IH_KID_DRAWER_LABEL}</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[1100] flex justify-end" role="dialog" aria-modal="true" aria-label={IH_PRODUCT_NAME}>
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close helpers"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 h-full w-full max-w-md overflow-y-auto bg-gradient-to-b from-sky-50 to-amber-50 shadow-2xl border-l-4 border-amber-300 p-5 space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-blue-950">{IH_PRODUCT_NAME}</h2>
                <p className="text-sm font-bold text-blue-700/70">Helpers for reading and saying big feelings.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {parentControls ? <ParentExplainer compact /> : null}

            <section id="ih-drawer-calm" className="rounded-2xl bg-white border border-blue-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-blue-950">{IH_CALM_MODE}</p>
                  <p className="text-xs font-semibold text-blue-700/70">No surprise autoplay. Softer motion.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={calmMode}
                  onClick={() => setCalmMode(!calmMode)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${calmMode ? 'bg-teal-500' : 'bg-blue-200'}`}
                >
                  <span
                    className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                      calmMode ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </section>

            <Soundboard showMixTab />

            <section id="ih-drawer-schedule" className="rounded-2xl bg-white border border-blue-100 p-4">
              <FirstThenBoard compact />
            </section>


            {parentControls ? (
              <section className="rounded-2xl bg-white border border-teal-100 p-4 space-y-2">
                <p className="font-black text-blue-950">{IH_JOURNEY_STORIES}</p>
                <Link
                  href="/island-helpers/journey-stories"
                  className="inline-flex rounded-xl bg-teal-600 px-4 py-2 text-sm font-black text-white"
                  onClick={() => setOpen(false)}
                >
                  Open Journey Stories
                </Link>
              </section>
            ) : (
              <section className="rounded-2xl bg-white border border-teal-100 p-4">
                <button
                  type="button"
                  className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-blue-950"
                  onClick={() => {
                    setOpen(false);
                    openInStoryAacOverlay();
                  }}
                >
                  Open phrase strip
                </button>
              </section>
            )}

            <section id="ih-drawer-phrases" className="rounded-2xl bg-white border border-blue-100 p-4 space-y-2">
              <p className="font-black text-blue-950">{IH_MY_PHRASES}</p>
              <Link
                href="/island-helpers/phrases"
                className="inline-flex rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-blue-950"
                onClick={() => setOpen(false)}
              >
                Open phrase list
              </Link>
            </section>

            <section id="ih-drawer-display" className="rounded-2xl bg-white border border-blue-100 p-4">
              <DisplayModeToggle readOnly={!parentControls} />
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}
