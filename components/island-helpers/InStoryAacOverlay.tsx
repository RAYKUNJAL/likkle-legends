"use client";

/**
 * In-story AAC overlay — collapsed chip → expand helpers without leaving reader.
 * Does not gate page turns on speech.
 */
import React, { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Soundboard } from './Soundboard';
import { SlotFillBoard } from './SlotFillBoard';
import { FirstThenBoard } from './FirstThenBoard';
import { useCalmMode } from './useCalmMode';

const OPEN_EVENT = 'likkle:island-helpers-aac-overlay';

export function openInStoryAacOverlay() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { open: true } }));
}

export function InStoryAacOverlay() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'say' | 'mix' | 'schedule'>('say');
  const { calmMode } = useCalmMode();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-[1050] w-14 h-14 rounded-full bg-amber-400 text-blue-950 shadow-xl flex items-center justify-center border-4 border-white"
        aria-label="Open phrase helpers"
      >
        <MessageCircle size={26} />
      </button>

      {open ? (
        <div
          className={`fixed inset-x-0 bottom-0 z-[1060] max-h-[55vh] overflow-y-auto rounded-t-[2rem] border-t-4 border-amber-300 bg-gradient-to-b from-sky-50 to-amber-50 p-4 shadow-2xl ${
            calmMode ? 'ih-calm' : ''
          }`}
          role="dialog"
          aria-label="Phrase helpers"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex gap-2">
              {(
                [
                  ['say', 'Say'],
                  ['mix', 'Mix'],
                  ['schedule', 'First→Then'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-black ${
                    tab === id ? 'bg-blue-950 text-white' : 'bg-white text-blue-900 border border-blue-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center"
              aria-label="Close phrase helpers"
            >
              <X size={18} />
            </button>
          </div>
          {tab === 'say' ? <Soundboard /> : null}
          {tab === 'mix' ? <SlotFillBoard /> : null}
          {tab === 'schedule' ? <FirstThenBoard compact /> : null}
        </div>
      ) : null}
    </>
  );
}
