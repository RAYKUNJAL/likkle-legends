"use client";

/**
 * Parent display mode for soundboards.
 * Story captions stay available even when Images Only (hyperlexia-friendly).
 */
import React, { useEffect, useState } from 'react';
import { IH_DISPLAY_MODE_LABELS } from '@/lib/island-helpers/copy';
import { loadPrefs, savePrefs, subscribePrefs } from '@/lib/island-helpers/prefs';
import type { DisplayMode } from '@/lib/island-helpers/types';

const MODES: DisplayMode[] = ['images', 'text_images', 'text'];

type Props = {
  /** When true, show current mode only (reader child session). */
  readOnly?: boolean;
};

export function DisplayModeToggle({ readOnly = false }: Props) {
  const [mode, setMode] = useState<DisplayMode>('text_images');

  useEffect(() => {
    setMode(loadPrefs().displayMode);
    return subscribePrefs((p) => setMode(p.displayMode));
  }, []);

  if (readOnly) {
    return (
      <p className="text-sm font-bold text-blue-800">
        Board display: <span className="text-amber-700">{IH_DISPLAY_MODE_LABELS[mode]}</span>
        <span className="block text-xs font-semibold text-blue-600/70 mt-1">
          Story captions stay on — this setting is for soundboard cards.
        </span>
      </p>
    );
  }

  return (
    <div className="space-y-2" id="ih-display-mode">
      <p className="text-sm font-black text-blue-900 uppercase tracking-wide">Soundboard display</p>
      <p className="text-xs font-semibold text-blue-700/70">
        Applies to Island Helpers cards. Story captions stay available in books.
      </p>
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(savePrefs({ displayMode: m }).displayMode)}
            className={`rounded-full px-4 py-2 text-sm font-black transition-colors ${
              mode === m ? 'bg-amber-400 text-blue-950' : 'bg-white border-2 border-blue-100 text-blue-800'
            }`}
          >
            {IH_DISPLAY_MODE_LABELS[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
