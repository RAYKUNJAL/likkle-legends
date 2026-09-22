"use client";

import React from 'react';
import { canMarkPublished, type JourneyStoryDraft } from '@/lib/island-helpers/journey-stories/types';
import { IH_JOURNEY_PUBLISH_CONFIRM } from '@/lib/island-helpers/copy';

type Props = {
  draft: JourneyStoryDraft;
  busy?: boolean;
  onPublish: () => void;
};

export function PublishGate({ draft, busy, onPublish }: Props) {
  const ready = canMarkPublished(draft);
  return (
    <section className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 space-y-3">
      <h3 className="text-lg font-black text-blue-950">Publish to library</h3>
      <p className="text-sm font-semibold text-blue-900/80">{IH_JOURNEY_PUBLISH_CONFIRM}</p>
      {!ready ? (
        <p className="text-sm font-bold text-rose-700">
          Finish editing, clear safety flags, and add pictures (or check publish without pictures) before Publish.
        </p>
      ) : null}
      <button
        type="button"
        disabled={!ready || busy}
        onClick={onPublish}
        className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 font-black text-white shadow disabled:opacity-40"
      >
        {busy ? 'Publishing…' : 'Publish Journey Story'}
      </button>
    </section>
  );
}
