'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, MapPin, RefreshCw } from 'lucide-react';
import { pickTodaysActivities } from '@/lib/curriculum/grounded-plan';
import { PARENT_DIASPORA_COUNTRIES, PARENT_ISLAND_CHOICES } from '@/lib/curriculum/resolve-signup-island';

type PlanActivity = {
    title: string;
    type: string;
    domain: string;
    duration: number;
    description: string;
};

type PlanPlace = {
    displayName?: string;
    diaspora?: boolean;
    unpackedPlace?: string | null;
};

type LearningPlan = {
    island_theme?: string | null;
    plan_data?: {
        weeks?: { days?: { day?: string; activities?: PlanActivity[] }[] }[];
        generator?: 'gemini' | 'oecs_fallback';
        ageYears?: number;
        place?: PlanPlace;
    };
};

export default function TodaysCustomWork({
    childId,
    childName,
    age,
}: {
    childId: string;
    childName: string;
    age?: number;
}) {
    const [plan, setPlan] = useState<LearningPlan | null>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'unknown' | 'error'>('loading');
    const [message, setMessage] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [islandChoice, setIslandChoice] = useState('');
    const [countryChoice, setCountryChoice] = useState('');

    const load = useCallback(async () => {
        setStatus('loading');
        setMessage(null);
        try {
            const res = await fetch(`/api/learning-plan?childId=${encodeURIComponent(childId)}`);
            if (res.status === 401) {
                setStatus('error');
                setMessage('Sign in as the parent to see this plan.');
                return;
            }
            if (!res.ok) {
                setStatus('error');
                setMessage('The plan could not be loaded.');
                return;
            }
            const data = await res.json();
            if (!data?.plan?.plan_data?.weeks) {
                setPlan(null);
                setStatus('empty');
                return;
            }
            setPlan(data.plan);
            setStatus('ready');
        } catch {
            setStatus('error');
            setMessage('The plan could not be loaded.');
        }
    }, [childId]);

    useEffect(() => {
        void load();
    }, [load]);

    const build = async () => {
        setBusy(true);
        setMessage(null);
        try {
            const res = await fetch('/api/learning-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    childId,
                    primaryIsland: islandChoice || undefined,
                    country: countryChoice || undefined,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.status === 422 || data?.code === 'unknown_place') {
                setPlan(null);
                setStatus('unknown');
                setMessage(data?.error || 'Add an island or country before a custom plan can be built.');
                return;
            }
            if (!res.ok || !data?.plan) {
                setStatus('error');
                setMessage(data?.error || 'The plan could not be built.');
                return;
            }
            setPlan(data.plan);
            setStatus('ready');
        } catch {
            setStatus('error');
            setMessage('The plan could not be built.');
        } finally {
            setBusy(false);
        }
    };

    const place = plan?.plan_data?.place;
    const placeName = place?.displayName || plan?.island_theme || '';
    const ageYears = plan?.plan_data?.ageYears || age;
    const picked = plan?.plan_data?.weeks
        ? pickTodaysActivities(plan.plan_data.weeks)
        : { weekend: false, day: null, activities: [] as PlanActivity[] };
    const outline = plan?.plan_data?.generator === 'oecs_fallback';

    return (
        <section className="mb-10 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
            <p className="text-xs font-black uppercase tracking-widest text-primary">Today&apos;s custom work</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">
                {childName}&apos;s island plan
            </h2>
            <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
                {placeName
                    ? `${placeName}${ageYears ? ` · age ${ageYears}` : ''}`
                    : 'A weekly plan from the child profile. Parents build it. Kids only see the finished list.'}
            </p>

            {status === 'loading' && (
                <p className="mt-4 text-sm font-bold text-slate-500">Loading the saved plan…</p>
            )}

            {status === 'ready' && plan && (
                <div className="mt-5 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        {outline ? 'Curriculum outline' : 'Custom plan'}
                        {place?.diaspora ? ' · Caribbean diaspora' : ''}
                        {place?.unpackedPlace ? ` · no ${place.unpackedPlace} pack yet` : ''}
                    </p>
                    {picked.weekend ? (
                        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
                            Weekend — there is no school-day block today. Monday&apos;s work stays on the plan.
                        </p>
                    ) : picked.activities.length === 0 ? (
                        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-600">
                            No activities were saved for {picked.day || 'today'}.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {picked.activities.slice(0, 3).map((activity, index) => (
                                <li key={`${activity.title}-${index}`} className="rounded-2xl border border-slate-100 px-4 py-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-black text-slate-800">{activity.title}</p>
                                        <span className="text-xs font-bold text-slate-400">{activity.duration} min</span>
                                    </div>
                                    <p className="mt-1 text-sm font-medium text-slate-500">{activity.description}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {(status === 'empty' || status === 'unknown') && (
                <div className="mt-5 space-y-4">
                    <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                        {status === 'unknown'
                            ? message || 'We don’t have an island or country for this child yet.'
                            : 'No plan is saved yet. Build one from the island on the profile, or choose a place below.'}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-sm font-bold text-slate-600">
                            <span className="mb-1 flex items-center gap-1"><MapPin size={14} /> Home island</span>
                            <select
                                value={islandChoice}
                                onChange={(event) => setIslandChoice(event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-bold text-slate-800"
                            >
                                <option value="">Keep the saved island</option>
                                {PARENT_ISLAND_CHOICES.map((choice) => (
                                    <option key={choice.id} value={choice.id}>{choice.name}</option>
                                ))}
                            </select>
                        </label>
                        <label className="block text-sm font-bold text-slate-600">
                            <span className="mb-1 block">Country, if the family lives abroad</span>
                            <select
                                value={countryChoice}
                                onChange={(event) => setCountryChoice(event.target.value)}
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-bold text-slate-800"
                            >
                                <option value="">No country override</option>
                                {PARENT_DIASPORA_COUNTRIES.map((choice) => (
                                    <option key={choice.id} value={choice.id}>{choice.name}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
            )}

            {status === 'error' && message && (
                <p className="mt-4 text-sm font-bold text-red-600">{message}</p>
            )}

            <button
                type="button"
                onClick={() => void build()}
                disabled={busy || status === 'loading'}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white disabled:opacity-50"
            >
                {status === 'ready' ? <RefreshCw size={16} /> : <BookOpen size={16} />}
                {busy ? 'Building…' : status === 'ready' ? 'Refresh plan' : 'Build plan'}
            </button>
        </section>
    );
}
