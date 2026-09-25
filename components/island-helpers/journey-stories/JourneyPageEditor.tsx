"use client";

import React from 'react';
import type { JourneyPage } from '@/lib/island-helpers/journey-stories/types';

type Props = {
  pages: JourneyPage[];
  warnings?: string[];
  onChange: (pages: JourneyPage[]) => void;
};

export function JourneyPageEditor({ pages, warnings = [], onChange }: Props) {
  return (
    <div className="space-y-4">
      {warnings.length ? (
        <ul className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm font-semibold text-amber-900 list-disc pl-5">
          {warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
      {pages.map((page, index) => (
        <article key={page.role} className="rounded-2xl border border-blue-100 bg-white p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-black uppercase tracking-widest text-amber-600">
              Page {index + 1} · {page.role}
            </p>
            {page.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.imageUrl} alt="" className="h-12 w-20 object-cover rounded-lg border" />
            ) : (
              <span className="text-xs font-bold text-blue-500">
                {page.imageStatus === 'pending'
                  ? 'Picture on the way'
                  : page.imageStatus === 'failed'
                    ? 'Picture resting'
                    : 'No picture yet'}
              </span>
            )}
          </div>
          {page.role === 'title' ? (
            <input
              className="w-full rounded-xl border border-blue-100 px-3 py-2 font-black text-blue-950"
              value={page.title || ''}
              onChange={(e) => {
                const next = pages.slice();
                next[index] = { ...page, title: e.target.value };
                onChange(next);
              }}
              aria-label="Story title"
              placeholder="Book title"
            />
          ) : null}
          <textarea
            className="w-full min-h-[88px] rounded-xl border border-blue-100 px-3 py-2 font-semibold text-blue-900"
            value={page.text}
            onChange={(e) => {
              const next = pages.slice();
              next[index] = { ...page, text: e.target.value };
              onChange(next);
            }}
            aria-label={`Page ${index + 1} text`}
          />
        </article>
      ))}
    </div>
  );
}
