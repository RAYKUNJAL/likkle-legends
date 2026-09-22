"use client";

import React, { useEffect, useState } from 'react';
import { LANDING_CAST } from '@/lib/landing-cast';
import { listByCharacter, subscribePhrases, type PhraseCard } from '@/lib/island-helpers/phrases';
import { loadPrefs, subscribePrefs } from '@/lib/island-helpers/prefs';
import { IH_SAY_A_PHRASE } from '@/lib/island-helpers/copy';
import type { DisplayMode, IslandHelpersCharacterId } from '@/lib/island-helpers/types';
import { CharacterBoardTabs } from './CharacterBoardTabs';
import { SoundboardCard } from './SoundboardCard';
import { SlotFillBoard } from './SlotFillBoard';
import { IH_MIX_A_PHRASE } from '@/lib/island-helpers/copy';

type Props = {
  initialCharacter?: IslandHelpersCharacterId;
  /** When set, overrides prefs displayMode (e.g. read-only mirror). */
  displayModeOverride?: DisplayMode;
  showMixTab?: boolean;
};

export function Soundboard({ initialCharacter = 'tanty_spice', displayModeOverride, showMixTab }: Props) {
  const [tab, setTab] = useState<'say' | 'mix'>('say');
  const [characterId, setCharacterId] = useState<IslandHelpersCharacterId>(initialCharacter);
  const [cards, setCards] = useState<PhraseCard[]>(() => listByCharacter(initialCharacter));
  const [displayMode, setDisplayMode] = useState<DisplayMode>('text_images');

  const refresh = () => {
    setCards(listByCharacter(characterId));
    const prefs = loadPrefs();
    setDisplayMode(displayModeOverride || prefs.displayMode);
  };

  useEffect(() => {
    refresh();
    const unsubP = subscribePhrases(refresh);
    const unsubPrefs = subscribePrefs(refresh);
    return () => {
      unsubP();
      unsubPrefs();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId, displayModeOverride]);

  const cast = LANDING_CAST.find((c) => c.id === characterId);
  const mode = displayModeOverride || displayMode;

  return (
    <section id="ih-soundboard" className="space-y-4" aria-label="Island Helpers soundboard">
      <div>
        <h3 className="text-xl font-black text-blue-950">{IH_SAY_A_PHRASE}</h3>
        <p className="text-sm font-bold text-blue-700/70">Tap a card to hear your friend.</p>
      </div>
      {showMixTab ? (
        <div className="flex gap-2">
          <button type="button" onClick={() => setTab('say')} className={`rounded-full px-3 py-1.5 text-sm font-black ${tab === 'say' ? 'bg-amber-400 text-blue-950' : 'bg-white border border-blue-100'}`}>Say</button>
          <button type="button" onClick={() => setTab('mix')} className={`rounded-full px-3 py-1.5 text-sm font-black ${tab === 'mix' ? 'bg-amber-400 text-blue-950' : 'bg-white border border-blue-100'}`}>{IH_MIX_A_PHRASE}</button>
        </div>
      ) : null}
      {tab === 'mix' && showMixTab ? (
        <SlotFillBoard />
      ) : (
        <>
          <CharacterBoardTabs active={characterId} onChange={setCharacterId} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cards.map((card) => (
              <SoundboardCard
                key={card.id}
                card={card}
                displayMode={mode}
                avatarSrc={cast?.image}
                characterName={cast?.name}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
