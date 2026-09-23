"use client";

import React from 'react';
import Link from 'next/link';
import {
  IH_PARENT_GUIDE,
  IH_PARENT_GUIDE_ANCHOR,
  IH_PARENT_GUIDE_TITLE,
  IH_PRODUCT_NAME,
  IH_START_HERE,
  IH_JOURNEY_STORIES,
  IH_JOURNEY_CTA,
} from '@/lib/island-helpers/copy';

type Props = {
  /** Compact strip for drawer */
  compact?: boolean;
};

export function ParentExplainer({ compact }: Props) {
  if (compact) {
    return (
      <section className="rounded-2xl bg-white border border-amber-200 p-4 space-y-2" aria-label={IH_PARENT_GUIDE_TITLE}>
        <p className="text-xs font-black uppercase tracking-widest text-amber-600">{IH_START_HERE}</p>
        <p className="font-black text-blue-950">{IH_PARENT_GUIDE_TITLE}</p>
        <p className="text-sm font-semibold text-blue-800/80 leading-snug">{IH_PARENT_GUIDE.intro}</p>
        <Link
          href={`/island-helpers#${IH_PARENT_GUIDE_ANCHOR}`}
          className="inline-flex rounded-xl bg-amber-400 px-3 py-2 text-sm font-black text-blue-950"
        >
          Read the full guide
        </Link>
      </section>
    );
  }

  return (
    <section
      id={IH_PARENT_GUIDE_ANCHOR}
      className="rounded-[2rem] bg-white border-4 border-amber-300 p-6 shadow-lg space-y-6 scroll-mt-24"
      aria-label={IH_PARENT_GUIDE_TITLE}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">{IH_START_HERE}</p>
          <h2 className="text-2xl sm:text-3xl font-black text-blue-950">{IH_PARENT_GUIDE_TITLE}</h2>
          <p className="mt-2 text-base sm:text-lg font-semibold text-blue-900/85 leading-relaxed">
            {IH_PARENT_GUIDE.intro}
          </p>
        </div>
        <a
          href="#ih-tools"
          className="shrink-0 inline-flex rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-3 text-sm font-black text-white shadow"
        >
          Jump to tools ↓
        </a>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-black text-blue-950">{IH_PARENT_GUIDE.whatThisIsTitle}</h3>
        {IH_PARENT_GUIDE.whatThisIs.map((p) => (
          <p key={p.slice(0, 24)} className="text-sm sm:text-base font-semibold text-blue-900/80 leading-relaxed">
            {p}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-black text-blue-950">{IH_PARENT_GUIDE.howHelpsTitle}</h3>
        <ul className="list-disc pl-5 space-y-1.5">
          {IH_PARENT_GUIDE.howHelps.map((item) => (
            <li key={item.slice(0, 28)} className="text-sm sm:text-base font-semibold text-blue-900/80 leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 space-y-3">
        <h3 className="text-lg font-black text-blue-950">{IH_PARENT_GUIDE.setupTitle}</h3>
        <ol className="list-decimal pl-5 space-y-2">
          {IH_PARENT_GUIDE.setupSteps.map((step) => (
            <li key={step.slice(0, 28)} className="text-sm sm:text-base font-semibold text-blue-900/85 leading-relaxed">
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-black text-blue-950">{IH_PARENT_GUIDE.toolsTitle}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {IH_PARENT_GUIDE.tools.map((tool) => (
            <article key={tool.name} className="rounded-2xl border border-blue-100 bg-sky-50/60 p-4">
              <p className="font-black text-blue-950">{tool.name}</p>
              <p className="mt-1 text-sm font-semibold text-blue-800/80 leading-snug">{tool.blurb}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-teal-200 bg-teal-50/70 p-4 space-y-2">
        <p className="font-black text-blue-950">{IH_JOURNEY_STORIES}</p>
        <p className="text-sm font-semibold text-blue-900/80 leading-relaxed">{IH_PARENT_GUIDE.journeyBlurb}</p>
        <Link
          href="/island-helpers/journey-stories/new"
          className="inline-flex rounded-xl bg-teal-600 px-4 py-2 text-sm font-black text-white"
        >
          {IH_JOURNEY_CTA}
        </Link>
      </div>

      <p className="text-xs font-bold text-blue-700/60">
        {IH_PRODUCT_NAME} grows with your family. Use what helps. Leave the rest.
      </p>
    </section>
  );
}
