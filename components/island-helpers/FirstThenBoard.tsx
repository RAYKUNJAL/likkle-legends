"use client";

import React, { useEffect, useState } from 'react';
import {
  DEFAULT_SCHEDULE_CHOICES,
  loadSchedule,
  saveSchedule,
  speakScheduleLine,
  type FirstThenState,
  type ScheduleItem,
} from '@/lib/island-helpers/schedule';
import { speakPhrase } from '@/lib/island-helpers/speak';

type Props = {
  compact?: boolean;
};

export function FirstThenBoard({ compact }: Props) {
  const [state, setState] = useState<FirstThenState>({ first: null, then: null });
  const [picking, setPicking] = useState<'first' | 'then'>('first');

  useEffect(() => {
    setState(loadSchedule());
  }, []);

  const choose = (item: ScheduleItem) => {
    const next =
      picking === 'first'
        ? saveSchedule({ first: item })
        : saveSchedule({ then: item });
    setState(next);
    setPicking(picking === 'first' ? 'then' : 'first');
  };

  const speak = async () => {
    const line = speakScheduleLine(state);
    const result = await speakPhrase({ text: line, characterId: 'roti' });
    if (result.ok) {
      try {
        void new Audio(result.audioUrl).play();
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <section id="ih-first-then" className={`space-y-3 ${compact ? '' : ''}`} aria-label="First then board">
      <div>
        <h3 className="text-xl font-black text-blue-950">First → Then</h3>
        <p className="text-sm font-bold text-blue-700/70">Pick what comes first, then what comes next.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPicking('first')}
          className={`rounded-2xl border-4 p-4 text-left ${
            picking === 'first' ? 'border-amber-400 bg-amber-50' : 'border-blue-100 bg-white'
          }`}
        >
          <p className="text-xs font-black uppercase tracking-widest text-amber-600">First</p>
          <p className="text-lg font-black text-blue-950">{state.first?.label || '…'}</p>
        </button>
        <button
          type="button"
          onClick={() => setPicking('then')}
          className={`rounded-2xl border-4 p-4 text-left ${
            picking === 'then' ? 'border-teal-400 bg-teal-50' : 'border-blue-100 bg-white'
          }`}
        >
          <p className="text-xs font-black uppercase tracking-widest text-teal-600">Then</p>
          <p className="text-lg font-black text-blue-950">{state.then?.label || '…'}</p>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {DEFAULT_SCHEDULE_CHOICES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => choose(item)}
            className="rounded-2xl bg-white border border-blue-100 px-3 py-2 text-sm font-black text-blue-900"
          >
            {item.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => void speak()}
        className="rounded-2xl bg-blue-950 px-4 py-2 text-sm font-black text-white"
      >
        Say First → Then
      </button>
    </section>
  );
}
