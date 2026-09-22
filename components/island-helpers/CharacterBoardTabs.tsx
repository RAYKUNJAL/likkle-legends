"use client";

import React from 'react';
import { LANDING_CAST } from '@/lib/landing-cast';
import { ISLAND_HELPERS_CHARACTER_IDS, type IslandHelpersCharacterId } from '@/lib/island-helpers/types';

const LABELS: Record<IslandHelpersCharacterId, string> = {
  tanty_spice: 'Tanty Spice',
  steelpan_sam: 'Steelpan Sam',
  mango_moko: 'Mango Moko',
  roti: 'R.O.T.I.',
};

type Props = {
  active: IslandHelpersCharacterId;
  onChange: (id: IslandHelpersCharacterId) => void;
};

export function CharacterBoardTabs({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Island Helpers characters">
      {ISLAND_HELPERS_CHARACTER_IDS.map((id) => {
        const cast = LANDING_CAST.find((c) => c.id === id);
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black transition-colors ${
              selected ? 'bg-amber-400 text-blue-950' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cast?.image || '/images/tanty_spice_avatar.jpg'}
              alt=""
              className="w-7 h-7 rounded-full object-cover"
              draggable={false}
            />
            {LABELS[id]}
          </button>
        );
      })}
    </div>
  );
}
