"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SEED_SCENARIOS } from '@/lib/island-helpers/journey-stories/seed-scenarios';
import { ISLAND_HELPERS_CHARACTER_IDS, type IslandHelpersCharacterId } from '@/lib/island-helpers/types';
import {
  createDraft,
  updateDraft,
  markPublished,
  getDraft,
} from '@/lib/island-helpers/journey-stories/draft-store';
import { applyJourneySafety } from '@/lib/island-helpers/journey-stories/safety';
import type { JourneyLanguageMode, JourneyStoryDraft } from '@/lib/island-helpers/journey-stories/types';
import {
  IH_JOURNEY_ART_CALM,
  IH_JOURNEY_ART_NOTE,
  IH_JOURNEY_ART_QUEUED,
  IH_JOURNEY_ART_SIMPLE,
  IH_JOURNEY_ETHICS_EXTRA,
  IH_JOURNEY_LANGUAGE_HELP,
  IH_JOURNEY_LANGUAGE_LITERAL,
  IH_JOURNEY_LANGUAGE_STANDARD,
  IH_JOURNEY_STORIES,
} from '@/lib/island-helpers/copy';
import {
  journeyBroadcastTopic,
  journeyPageRealtimeFilter,
  readPageImageUpdate,
  type JourneyPageImageUpdate,
} from '@/lib/island-helpers/journey-stories/realtime';
import { EthicsDisclaimer } from '../EthicsDisclaimer';
import { JourneyPageEditor } from './JourneyPageEditor';
import { PublishGate } from './PublishGate';
import { publishJourneyStoryAction } from '@/app/actions/island-helpers-journey-publish';

const CAST_LABELS: Record<IslandHelpersCharacterId, string> = {
  tanty_spice: 'Tanty Spice',
  steelpan_sam: 'Steelpan Sam',
  mango_moko: 'Mango Moko',
  roti: 'R.O.T.I.',
  dilly_doubles: 'Dilly Doubles',
};

type Props = {
  mode: 'new' | 'edit';
  initialDraftId?: string;
};

export function JourneyStoryWizard({ mode, initialDraftId }: Props) {
  const router = useRouter();
  const existing = initialDraftId ? getDraft(initialDraftId) : null;

  const [scenarioId, setScenarioId] = useState<string>(existing?.scenarioId || 'dentist');
  const [customScenario, setCustomScenario] = useState('');
  const [childName, setChildName] = useState(existing?.childName || '');
  const [pointOfView, setPointOfView] = useState<'first' | 'third'>(existing?.pointOfView || 'third');
  const [languageMode, setLanguageMode] = useState<JourneyLanguageMode>(
    existing?.languageMode === 'literal' ? 'literal' : 'standard',
  );
  const [cast, setCast] = useState<IslandHelpersCharacterId[]>(
    existing?.castCharacterIds?.length ? existing.castCharacterIds : ['tanty_spice', 'roti'],
  );
  const [draft, setDraft] = useState<JourneyStoryDraft | null>(existing);
  const [step, setStep] = useState<'pick' | 'edit'>(existing ? 'edit' : 'pick');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [publishWithoutPictures, setPublishWithoutPictures] = useState(
    Boolean(existing?.publishWithoutPictures),
  );
  const [artNote, setArtNote] = useState<string | null>(null);
  const [watchingArt, setWatchingArt] = useState(false);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const selectedSeed = useMemo(
    () => SEED_SCENARIOS.find((s) => s.id === scenarioId),
    [scenarioId],
  );

  const toggleCast = (id: IslandHelpersCharacterId) => {
    setCast((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/island-helpers/journey-stories/generate', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-island-helpers-adult': '1',
        },
        body: JSON.stringify({
          scenarioId: scenarioId === 'custom' ? 'custom' : scenarioId,
          customScenario: scenarioId === 'custom' ? customScenario : undefined,
          childName: childName || undefined,
          pointOfView: scenarioId === 'custom' ? pointOfView : selectedSeed?.pointOfView || pointOfView,
          languageMode,
          castCharacterIds: cast.length
            ? cast
            : selectedSeed?.defaultCast || ['tanty_spice'],
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        if (body.draft) {
          const saved = createDraft({
            ...body.draft,
            languageMode: body.draft.languageMode === 'literal' ? 'literal' : languageMode,
            status: 'draft',
            pages: body.draft.pages,
          });
          const synced = updateDraft(saved.id, {
            pages: body.draft.pages,
            safetyFlags: body.reasons || body.draft.safetyFlags || [],
            status: 'draft',
          });
          setDraft(synced);
          setStep('edit');
        }
        setError(body.error || 'Could not generate');
        return;
      }
      const saved = createDraft({
        scenarioId: body.draft.scenarioId,
        scenarioLabel: body.draft.scenarioLabel,
        childName: body.draft.childName,
        pointOfView: body.draft.pointOfView,
        languageMode: body.draft.languageMode === 'literal' ? 'literal' : 'standard',
        castCharacterIds: body.draft.castCharacterIds,
        status: 'ready',
        pages: body.draft.pages,
      });
      const synced = updateDraft(saved.id, {
        pages: body.draft.pages,
        safetyFlags: [],
        status: 'ready',
      });
      setDraft(synced);
      setWarnings([]);
      setStep('edit');
      router.replace(`/island-helpers/journey-stories/${synced.id}/edit`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generate failed');
    } finally {
      setBusy(false);
    }
  };

  const persistPages = (pages: JourneyStoryDraft['pages']) => {
    if (!draft) return;
    const safety = applyJourneySafety(pages);
    const next = updateDraft(draft.id, {
      pages: safety.ok ? safety.pages : pages,
      safetyFlags: safety.ok ? [] : safety.reasons,
      status: safety.ok ? 'ready' : 'draft',
      publishWithoutPictures,
    });
    setDraft(next);
    setWarnings(safety.ok ? safety.warnings : safety.reasons);
  };

  const mergeArt = (update: JourneyPageImageUpdate) => {
    const current = draftRef.current;
    if (!current || update.pageIndex < 0 || update.pageIndex >= current.pages.length) return;
    const pages = current.pages.map((page, index) =>
      index === update.pageIndex
        ? { ...page, imageUrl: update.imageUrl, imageStatus: update.imageStatus }
        : page,
    );
    const next = updateDraft(current.id, { pages });
    draftRef.current = next;
    setDraft(next);
  };

  useEffect(() => {
    const storyId = draft?.serverStoryId;
    if (!watchingArt || !storyId) return;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    if (typeof supabase.channel === 'function') {
      const filter = journeyPageRealtimeFilter(storyId);
      channel = supabase
        .channel(journeyBroadcastTopic(storyId))
        .on('broadcast', { event: 'page_image' }, ({ payload }) => {
          const update = readPageImageUpdate(storyId, payload as Record<string, unknown>);
          if (update) mergeArt(update);
        })
        .on('postgres_changes', filter, (payload) => {
          const update = readPageImageUpdate(storyId, (payload as { new?: Record<string, unknown> }).new);
          if (update) mergeArt(update);
        })
        .subscribe();
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/island-helpers/journey-stories/jobs/${storyId}`, {
          headers: { 'x-island-helpers-adult': '1' },
        });
        const body = await res.json();
        if (!body?.ok || !Array.isArray(body.pages)) return;
        for (const page of body.pages) {
          const update = readPageImageUpdate(storyId, {
            page_index: page.pageIndex,
            image_url: page.imageUrl,
            image_status: page.imageStatus,
          });
          if (update && (update.imageStatus === 'ready' || update.imageStatus === 'reused' || update.imageStatus === 'failed')) {
            mergeArt(update);
          }
        }
        const latest = Array.isArray(body.jobs) ? body.jobs[0] : null;
        if (latest && (latest.status === 'done' || latest.status === 'failed')) {
          setWatchingArt(false);
          if (latest.status === 'failed') setArtNote(IH_JOURNEY_ART_CALM);
        }
      } catch {
        /* keep the words on screen */
      }
    };
    const timer = window.setInterval(() => void poll(), 4000);

    return () => {
      window.clearInterval(timer);
      if (channel) supabase.removeChannel(channel);
    };
    // mergeArt reads the latest draft from a ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchingArt, draft?.serverStoryId]);

  const queuePictures = async () => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/island-helpers/journey-stories/jobs', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-island-helpers-adult': '1',
        },
        body: JSON.stringify({
          storyId: draft.serverStoryId,
          scenarioId: draft.scenarioId,
          scenarioLabel: draft.scenarioLabel,
          languageMode: draft.languageMode === 'literal' ? 'literal' : 'standard',
          pointOfView: draft.pointOfView,
          castCharacterIds: draft.castCharacterIds,
          pages: draft.pages,
        }),
      });
      const body = await res.json();
      if (!res.ok || body.ok === false) {
        setArtNote(body.message || IH_JOURNEY_ART_CALM);
        setWatchingArt(false);
        return;
      }
      const pages = draft.pages.map((page, index) => {
        const planned = Array.isArray(body.pages)
          ? body.pages.find((item: { pageIndex: number }) => item.pageIndex === index)
          : null;
        return planned
          ? { ...page, imageUrl: planned.imageUrl, imageStatus: planned.imageStatus }
          : page;
      });
      const next = updateDraft(draft.id, { pages, serverStoryId: body.storyId });
      draftRef.current = next;
      setDraft(next);
      if (body.queued) {
        setArtNote(IH_JOURNEY_ART_QUEUED);
        setWatchingArt(true);
      } else {
        setArtNote(body.message || IH_JOURNEY_ART_CALM);
        setWatchingArt(false);
      }
    } catch {
      setArtNote(IH_JOURNEY_ART_CALM);
      setWatchingArt(false);
    } finally {
      setBusy(false);
    }
  };

  const useSimplePictures = async () => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    setWatchingArt(false);
    try {
      let current = draft;
      for (let pageIndex = 0; pageIndex < current.pages.length; pageIndex += 1) {
        const res = await fetch('/api/island-helpers/journey-stories/illustrate', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-island-helpers-adult': '1',
          },
          body: JSON.stringify({ draft: current, pageIndex, allowPlaceholders: true }),
        });
        const body = await res.json();
        if (!res.ok || !body.ok) {
          setArtNote(IH_JOURNEY_ART_CALM);
          return;
        }
        current = updateDraft(current.id, {
          pages: body.pages,
          status: current.safetyFlags.length ? 'draft' : 'ready',
        });
        draftRef.current = current;
        setDraft(current);
      }
      setArtNote(IH_JOURNEY_ART_NOTE);
    } catch {
      setArtNote(IH_JOURNEY_ART_CALM);
    } finally {
      setBusy(false);
    }
  };

  const onPublish = async () => {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      const prepared = updateDraft(draft.id, { publishWithoutPictures, status: 'ready' });
      const remote = await publishJourneyStoryAction(prepared);
      if (!remote.ok) {
        setError(remote.error);
        return;
      }
      const published = markPublished(prepared.id, remote.libraryStoryId);
      setDraft(published);
      router.push(`/library/stories/${remote.libraryStoryId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Island Helpers</p>
        <h1 className="text-3xl font-black text-blue-950">{IH_JOURNEY_STORIES}</h1>
        <p className="font-semibold text-blue-800/80">
          Create a 5-page adventure storybook for a new place or routine. You review every page before your likkle one sees it.
        </p>
      </header>

      {step === 'pick' ? (
        <section className="rounded-[2rem] bg-white border border-amber-100 p-5 space-y-4">
          <h2 className="text-xl font-black text-blue-950">1. Pick a scenario</h2>
          <div className="grid gap-2">
            {SEED_SCENARIOS.map((s) => (
              <label
                key={s.id}
                className={`flex gap-3 rounded-2xl border p-3 cursor-pointer ${
                  scenarioId === s.id ? 'border-amber-400 bg-amber-50' : 'border-blue-100'
                }`}
              >
                <input
                  type="radio"
                  name="scenario"
                  checked={scenarioId === s.id}
                  onChange={() => {
                    setScenarioId(s.id);
                    setCast(s.defaultCast);
                    setPointOfView(s.pointOfView);
                  }}
                />
                <span>
                  <span className="block font-black text-blue-950">{s.parentLabel}</span>
                  <span className="block text-sm font-semibold text-blue-700/70">{s.description}</span>
                </span>
              </label>
            ))}
            <label
              className={`flex gap-3 rounded-2xl border p-3 cursor-pointer ${
                scenarioId === 'custom' ? 'border-amber-400 bg-amber-50' : 'border-blue-100'
              }`}
            >
              <input
                type="radio"
                name="scenario"
                checked={scenarioId === 'custom'}
                onChange={() => setScenarioId('custom')}
              />
              <span className="flex-1">
                <span className="block font-black text-blue-950">Custom adventure</span>
                <textarea
                  className="mt-2 w-full rounded-xl border border-blue-100 px-3 py-2 text-sm font-semibold"
                  placeholder="Short description for parents (kept private)"
                  value={customScenario}
                  onChange={(e) => setCustomScenario(e.target.value)}
                />
              </span>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="text-sm font-black text-blue-950">Child first name (optional)</span>
              <input
                className="w-full rounded-xl border border-blue-100 px-3 py-2 font-semibold"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-black text-blue-950">Point of view</span>
              <select
                className="w-full rounded-xl border border-blue-100 px-3 py-2 font-semibold"
                value={pointOfView}
                onChange={(e) => setPointOfView(e.target.value as 'first' | 'third')}
              >
                <option value="third">Third person</option>
                <option value="first">First person</option>
              </select>
            </label>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-black text-blue-950">Words</legend>
            <div className="grid gap-2">
              <label
                className={`flex gap-3 rounded-2xl border p-3 cursor-pointer ${
                  languageMode === 'standard' ? 'border-amber-400 bg-amber-50' : 'border-blue-100'
                }`}
              >
                <input
                  type="radio"
                  name="languageMode"
                  checked={languageMode === 'standard'}
                  onChange={() => setLanguageMode('standard')}
                />
                <span>
                  <span className="block font-black text-blue-950">{IH_JOURNEY_LANGUAGE_STANDARD}</span>
                </span>
              </label>
              <label
                className={`flex gap-3 rounded-2xl border p-3 cursor-pointer ${
                  languageMode === 'literal' ? 'border-amber-400 bg-amber-50' : 'border-blue-100'
                }`}
              >
                <input
                  type="radio"
                  name="languageMode"
                  checked={languageMode === 'literal'}
                  onChange={() => setLanguageMode('literal')}
                />
                <span>
                  <span className="block font-black text-blue-950">{IH_JOURNEY_LANGUAGE_LITERAL}</span>
                  <span className="block text-sm font-semibold text-blue-700/70">{IH_JOURNEY_LANGUAGE_HELP}</span>
                </span>
              </label>
            </div>
          </fieldset>

          <div>
            <p className="text-sm font-black text-blue-950 mb-2">Cast</p>
            <div className="flex flex-wrap gap-2">
              {ISLAND_HELPERS_CHARACTER_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleCast(id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-black border ${
                    cast.includes(id) ? 'bg-teal-500 text-white border-teal-600' : 'bg-white border-blue-100 text-blue-900'
                  }`}
                >
                  {CAST_LABELS[id]}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void generate()}
            className="rounded-2xl bg-blue-950 px-5 py-3 font-black text-white disabled:opacity-50"
          >
            {busy ? 'Writing pages…' : 'Generate 5 pages'}
          </button>
        </section>
      ) : null}

      {draft && step === 'edit' ? (
        <section className="space-y-4">
          <h2 className="text-xl font-black text-blue-950">2. Parent edit gate</h2>
          <p className="text-sm font-semibold text-blue-800/80">
            Status: <span className="font-black">{draft.status}</span>
            {draft.safetyFlags.length ? ` · flags: ${draft.safetyFlags.join('; ')}` : ''}
          </p>
          <p className="text-sm font-semibold text-blue-800/80">
            {draft.languageMode === 'literal' ? IH_JOURNEY_LANGUAGE_LITERAL : IH_JOURNEY_LANGUAGE_STANDARD}
          </p>
          <JourneyPageEditor pages={draft.pages} warnings={warnings} onChange={persistPages} />
          <p className="text-sm font-semibold text-blue-800/80">{artNote || IH_JOURNEY_ART_NOTE}</p>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              disabled={busy}
              onClick={() => void queuePictures()}
              className="rounded-2xl bg-teal-600 px-5 py-3 font-black text-white disabled:opacity-50"
            >
              {busy ? 'Working…' : 'Make pictures'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void useSimplePictures()}
              className="rounded-2xl border border-teal-600 px-5 py-3 font-black text-teal-800 disabled:opacity-50"
            >
              {IH_JOURNEY_ART_SIMPLE}
            </button>
            <label className="inline-flex items-center gap-2 text-sm font-bold text-blue-900">
              <input
                type="checkbox"
                checked={publishWithoutPictures}
                onChange={(e) => {
                  setPublishWithoutPictures(e.target.checked);
                  if (draft) {
                    setDraft(updateDraft(draft.id, { publishWithoutPictures: e.target.checked }));
                  }
                }}
              />
              Allow publish without pictures (placeholders OK)
            </label>
          </div>
          <PublishGate draft={{ ...draft, publishWithoutPictures }} busy={busy} onPublish={() => void onPublish()} />
        </section>
      ) : null}

      {error ? <p className="text-sm font-bold text-rose-700">{error}</p> : null}

      <EthicsDisclaimer />
      <p className="text-xs font-semibold text-blue-700/70">{IH_JOURNEY_ETHICS_EXTRA}</p>
    </div>
  );
}
