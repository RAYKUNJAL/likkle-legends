"use client";

import Link from 'next/link';
import { Download, Lock, Printer, Sparkles } from 'lucide-react';
import { useUser } from '@/components/UserContext';

type ActivityAsset = {
  title: string;
  type: 'Coloring' | 'Maze' | 'Word Search' | 'Counting' | 'Tracing';
  island: string;
  prompt: string;
};

const ISLANDS = [
  'Trinidad & Tobago', 'Jamaica', 'Barbados', 'Guyana', 'Haiti',
  'Dominican Republic', 'St. Lucia', 'Grenada', 'Antigua & Barbuda',
  'St. Vincent', 'Dominica', 'Bahamas', 'Belize',
];

const ACTIVITY_TYPES: ActivityAsset['type'][] = ['Coloring', 'Maze', 'Word Search', 'Counting', 'Tracing'];

const ASSETS: ActivityAsset[] = Array.from({ length: 55 }, (_, index) => {
  const island = ISLANDS[index % ISLANDS.length];
  const type = ACTIVITY_TYPES[index % ACTIVITY_TYPES.length];
  const prompts: Record<ActivityAsset['type'], string> = {
    Coloring: `Color the island market scene from ${island}. Add fruit, flags, and bright carnival patterns.`,
    Maze: `Help Dilly Doubles find the beach path across ${island}. Draw the safest route.`,
    'Word Search': `Find island words: mango, drum, beach, story, flag, family, music, legend.`,
    Counting: `Count the coconuts, drums, and stars. Write the total in each treasure circle.`,
    Tracing: `Trace the letters in ${island}, then write your favorite island word three times.`,
  };

  return {
    title: `${island} ${type} Adventure ${index + 1}`,
    type,
    island,
    prompt: prompts[type],
  };
});

export default function SuperPackPage() {
  const { hasSuperPack, user } = useUser();
  const canOpen = hasSuperPack || user?.is_admin || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-deep">
      <section className="mx-auto max-w-7xl px-6 py-10 print:hidden">
        <Link href="/portal" className="text-sm font-black uppercase tracking-widest text-primary hover:underline">
          Back to portal
        </Link>
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-amber-700">
              <Sparkles size={15} /> Digital Activity Super-Pack
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight lg:text-6xl">55 Printable Island Activities</h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold text-deep/55">
              Coloring pages, mazes, word searches, counting sheets, and tracing practice built for Caribbean kids ages 3 to 9.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!canOpen}
            className="inline-flex items-center justify-center gap-3 rounded-2xl bg-primary px-7 py-4 font-black text-white shadow-xl shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={20} /> Print or Save PDF
          </button>
        </div>

        {!canOpen && (
          <div className="mt-8 rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50 p-6 text-amber-800">
            <div className="flex items-center gap-3 font-black">
              <Lock size={20} /> This pack unlocks after checkout.
            </div>
            <p className="mt-2 text-sm font-semibold">Your order bump will open all 55 printable activities here.</p>
          </div>
        )}
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-6 pb-16 sm:grid-cols-2 lg:grid-cols-3 print:block print:px-0 print:pb-0">
        {ASSETS.map((asset, index) => (
          <article
            key={asset.title}
            className={`min-h-[360px] rounded-[2rem] border-2 border-zinc-100 bg-white p-6 shadow-sm print:mb-0 print:flex print:h-screen print:min-h-screen print:break-after-page print:flex-col print:justify-between print:rounded-none print:border-0 print:p-10 print:shadow-none ${!canOpen && index > 2 ? 'blur-[2px]' : ''}`}
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{asset.type}</p>
                  <h2 className="mt-2 text-xl font-black leading-tight">{asset.title}</h2>
                </div>
                <div className="rounded-2xl bg-amber-100 p-3 text-2xl">🎨</div>
              </div>
              <p className="mt-4 text-sm font-bold leading-relaxed text-deep/55">{asset.prompt}</p>
            </div>

            <div className="mt-6 rounded-[1.5rem] border-2 border-dashed border-zinc-200 bg-zinc-50 p-5">
              {asset.type === 'Maze' && <MazeArt />}
              {asset.type === 'Coloring' && <ColoringArt island={asset.island} />}
              {asset.type === 'Word Search' && <WordSearchArt />}
              {asset.type === 'Counting' && <CountingArt />}
              {asset.type === 'Tracing' && <TracingArt island={asset.island} />}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-xs font-black uppercase tracking-widest text-deep/35">
              <span>Likkle Legends</span>
              <span>{index + 1}/55</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function MazeArt() {
  return <div className="grid grid-cols-6 gap-1">{Array.from({ length: 36 }, (_, i) => <div key={i} className={`h-8 rounded ${i % 5 === 0 || i % 7 === 0 ? 'bg-deep/15' : 'bg-white'}`} />)}</div>;
}

function ColoringArt({ island }: { island: string }) {
  return <div className="flex h-48 items-end justify-center gap-4 text-6xl"><span>🌴</span><span>🏝️</span><span className="text-4xl">☀️</span><span className="sr-only">{island}</span></div>;
}

function WordSearchArt() {
  const letters = 'MANGODRUMBEACHSTORYFLAGFAMILYMUSICLEGEND';
  return <div className="grid grid-cols-8 gap-1">{Array.from({ length: 64 }, (_, i) => <div key={i} className="flex h-8 items-center justify-center rounded bg-white text-sm font-black text-deep/60">{letters[i % letters.length]}</div>)}</div>;
}

function CountingArt() {
  return <div className="grid grid-cols-5 gap-3 text-center text-3xl">{Array.from({ length: 15 }, (_, i) => <div key={i} className="rounded-2xl bg-white p-3">{['🥥', '⭐', '🥁'][i % 3]}</div>)}</div>;
}

function TracingArt({ island }: { island: string }) {
  return <div className="space-y-4"><p className="text-3xl font-black tracking-widest text-deep/20">{island.toUpperCase()}</p>{Array.from({ length: 4 }, (_, i) => <div key={i} className="border-b-2 border-dashed border-deep/20 py-3" />)}</div>;
}
