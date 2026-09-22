"use client";

import React, { useState } from 'react';
import { Loader2, Volume2 } from 'lucide-react';
import type { DisplayMode } from '@/lib/island-helpers/types';
import type { PhraseCard } from '@/lib/island-helpers/phrases';
import { speakPhrase } from '@/lib/island-helpers/speak';

type Props = {
  card: PhraseCard;
  displayMode: DisplayMode;
  avatarSrc?: string;
  characterName?: string;
};

export function SoundboardCard({ card, displayMode, avatarSrc, characterName }: Props) {
  const [busy, setBusy] = useState(false);
  const showImage = displayMode !== 'text';
  const showText = displayMode !== 'images';
  const img = card.imageSrc || avatarSrc;

  const onTap = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await speakPhrase({ text: card.text, characterId: card.characterId });
      if (result.ok) {
        const audio = new Audio(result.audioUrl);
        await audio.play().catch(() => {});
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void onTap()}
      disabled={busy}
      aria-label={showText ? card.text : `Say phrase as ${characterName || 'friend'}`}
      className="ih-soundboard-card flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-amber-200/80 bg-white p-4 shadow-md hover:border-amber-400 active:scale-[0.98] transition-all min-h-[7.5rem] text-center disabled:opacity-70"
    >
      {showImage && img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-amber-300" draggable={false} />
      ) : showImage ? (
        <span className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
          <Volume2 size={22} />
        </span>
      ) : null}
      {showText ? (
        <span className="text-base sm:text-lg font-black text-blue-950 leading-snug">{card.text}</span>
      ) : null}
      {busy ? <Loader2 className="animate-spin text-amber-500" size={18} /> : null}
    </button>
  );
}
