"use client";

/**
 * Calm Mode for Island Helpers + reader helpers chrome.
 * Marketing landing-v5 is intentionally NOT wrapped — Calm stays out of / marketing.
 */
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { allowAutoplayFrom, allowMotionFrom, loadPrefs, savePrefs, subscribePrefs } from '@/lib/island-helpers/prefs';

export type CalmModeContextValue = {
  calmMode: boolean;
  setCalmMode: (v: boolean) => void;
  allowAutoplay: boolean;
  allowMotion: boolean;
  prefersReducedMotion: boolean;
};

export const CalmModeContext = createContext<CalmModeContextValue | null>(null);

function usePrefersReducedMotion(): boolean {
  const [prm, setPrm] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setPrm(!!mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);
  return prm;
}

export function CalmModeProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [calmMode, setCalmModeState] = useState(false);
  const [readAloudDefault, setReadAloudDefault] = useState(true);

  useEffect(() => {
    const prefs = loadPrefs();
    setCalmModeState(prefs.calmMode);
    setReadAloudDefault(prefs.readAloudDefault);
    return subscribePrefs((p) => {
      setCalmModeState(p.calmMode);
      setReadAloudDefault(p.readAloudDefault);
    });
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (calmMode) root.classList.add('ih-calm');
    else root.classList.remove('ih-calm');
    return () => root.classList.remove('ih-calm');
  }, [calmMode]);

  const setCalmMode = useCallback((v: boolean) => {
    const next = savePrefs({ calmMode: v, ...(v ? { readAloudDefault: false } : {}) });
    setCalmModeState(next.calmMode);
    setReadAloudDefault(next.readAloudDefault);
  }, []);

  const value = useMemo<CalmModeContextValue>(() => {
    const prefs = { calmMode, readAloudDefault };
    return {
      calmMode,
      setCalmMode,
      allowAutoplay: allowAutoplayFrom(prefs, prefersReducedMotion),
      allowMotion: allowMotionFrom(calmMode, prefersReducedMotion),
      prefersReducedMotion,
    };
  }, [calmMode, readAloudDefault, prefersReducedMotion, setCalmMode]);

  return <CalmModeContext.Provider value={value}>{children}</CalmModeContext.Provider>;
}
