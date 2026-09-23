"use client";

import { useContext } from 'react';
import { CalmModeContext, type CalmModeContextValue } from './CalmModeProvider';

export type { CalmModeContextValue };

export function useCalmMode(): CalmModeContextValue {
  const ctx = useContext(CalmModeContext);
  if (!ctx) {
    // Safe fallback outside provider (e.g. marketing landing — Calm out of scope there).
    return {
      calmMode: false,
      setCalmMode: () => {},
      allowAutoplay: true,
      allowMotion: true,
      prefersReducedMotion: false,
    };
  }
  return ctx;
}
