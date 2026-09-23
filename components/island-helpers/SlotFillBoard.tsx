"use client";

import React, { useMemo, useState } from 'react';
import { SEED_SLOT_TEMPLATES } from '@/lib/island-helpers/seed-slot-templates';
import { fillTemplate } from '@/lib/island-helpers/slot-phrases';
import { speakPhrase } from '@/lib/island-helpers/speak';
import { useCalmMode } from './useCalmMode';

export function SlotFillBoard() {
  const { allowAutoplay } = useCalmMode();
  const [templateId, setTemplateId] = useState(SEED_SLOT_TEMPLATES[0].id);
  const template = useMemo(
    () => SEED_SLOT_TEMPLATES.find((t) => t.id === templateId) || SEED_SLOT_TEMPLATES[0],
    [templateId],
  );
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const filled = fillTemplate(template, choices);

  const onPick = async (slotId: string, text: string) => {
    const next = { ...choices, [slotId]: text };
    // For first_then with two slots, cycle: if first empty set first; else set then
    if (template.slots.length > 1) {
      const firstId = template.slots[0].id;
      const thenId = template.slots[1].id;
      if (!choices[firstId]) {
        next[firstId] = text;
        delete next[thenId];
      } else if (!choices[thenId]) {
        next[thenId] = text;
      } else {
        next[firstId] = text;
        delete next[thenId];
      }
    }
    setChoices(next);
    const line = fillTemplate(template, next);
    setMessage(line);
    // Speak full phrase (phrase-first). Respect calm: still OK on explicit tap.
    const result = await speakPhrase({ text: line, characterId: template.characterId });
    if (result.ok) {
      try {
        const audio = new Audio(result.audioUrl);
        if (!allowAutoplay) {
          // Explicit user tap — play anyway; calm only blocks surprise autoplay
        }
        void audio.play();
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <section id="ih-slot-fill" className="space-y-3" aria-label="Mix a phrase">
      <div>
        <h3 className="text-xl font-black text-blue-950">Mix a phrase</h3>
        <p className="text-sm font-bold text-blue-700/70">Tap words to build a full sentence.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SEED_SLOT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTemplateId(t.id);
              setChoices({});
              setMessage(null);
            }}
            className={`rounded-full px-3 py-1.5 text-sm font-black border ${
              t.id === templateId ? 'bg-amber-400 border-amber-500 text-blue-950' : 'bg-white border-blue-100'
            }`}
          >
            {t.pattern}
          </button>
        ))}
      </div>
      <p className="rounded-2xl bg-white border border-teal-100 px-4 py-3 text-lg font-black text-blue-950 min-h-[3rem]">
        {message || filled}
      </p>
      <div className="flex flex-wrap gap-2">
        {template.fringeOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => void onPick(template.slots[0].id, opt.text)}
            className="rounded-2xl bg-teal-50 border border-teal-200 px-3 py-2 text-sm font-black text-teal-900"
          >
            {opt.text}
          </button>
        ))}
      </div>
    </section>
  );
}
