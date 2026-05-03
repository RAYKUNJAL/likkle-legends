"use client";

import Link from 'next/link';
import { BookOpen, Download, Lock, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { useUser } from '@/components/UserContext';

const ISLAND_DETAILS: Record<string, { name: string; flag: string; food: string; music: string; wisdom: string }> = {
  trinidad: { name: 'Trinidad & Tobago', flag: '🇹🇹', food: 'doubles', music: 'steelpan', wisdom: 'small axe can cut down big tree' },
  jamaica: { name: 'Jamaica', flag: '🇯🇲', food: 'ackee and festival', music: 'reggae', wisdom: 'one one cocoa full basket' },
  barbados: { name: 'Barbados', flag: '🇧🇧', food: 'flying fish', music: 'calypso', wisdom: 'steady hands steer bright boats' },
  guyana: { name: 'Guyana', flag: '🇬🇾', food: 'pepperpot', music: 'chutney', wisdom: 'many waters make one river' },
  haiti: { name: 'Haiti', flag: '🇭🇹', food: 'griot', music: 'kompa', wisdom: 'hands together build mountains' },
  mixed: { name: 'the Caribbean', flag: '🌴', food: 'mango and roti', music: 'island drums', wisdom: 'likkle but tallawah' },
};

export default function HeritageStoryPage() {
  const { activeChild, hasHeritageStory, user } = useUser();
  const canOpen = hasHeritageStory || user?.is_admin || user?.role === 'admin';
  const childName = activeChild?.first_name || 'Likkle Legend';
  const islandKey = (activeChild?.primary_island || 'mixed').toLowerCase();
  const island = ISLAND_DETAILS[islandKey] || ISLAND_DETAILS.mixed;

  const story = useMemo(() => buildStory(childName, island), [childName, island]);

  return (
    <div className="min-h-screen bg-[#FFFDF7] text-deep">
      <section className="mx-auto max-w-4xl px-6 py-10 print:hidden">
        <Link href="/portal" className="text-sm font-black uppercase tracking-widest text-primary hover:underline">
          Back to portal
        </Link>
        <div className="mt-6 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-widest">
            <Sparkles size={15} /> Heritage DNA Story
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight lg:text-6xl">
            {island.flag} {childName} and the Island Memory Map
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-semibold text-white/75">
            A family-heritage story built from your child profile and island selection.
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!canOpen}
            className="mt-8 inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 font-black text-blue-700 shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={20} /> Print or Save Story
          </button>
        </div>

        {!canOpen && (
          <div className="mt-8 rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50 p-6 text-blue-900">
            <div className="flex items-center gap-3 font-black">
              <Lock size={20} /> This story unlocks after checkout.
            </div>
            <p className="mt-2 text-sm font-semibold">The Heritage DNA Story order bump opens this personalized story page.</p>
          </div>
        )}
      </section>

      <article className={`mx-auto max-w-4xl px-6 pb-16 print:px-12 print:py-10 ${!canOpen ? 'blur-[2px]' : ''}`}>
        <div className="rounded-[2.5rem] border border-zinc-100 bg-white p-8 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="mb-8 flex items-center gap-4 border-b border-zinc-100 pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-4xl">{island.flag}</div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Personalized Family Story</p>
              <h2 className="text-3xl font-black">{childName}'s {island.name} Adventure</h2>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-deep">
            {story.map((paragraph) => (
              <p key={paragraph} className="mb-5 text-lg font-semibold leading-9 text-deep/75">{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 rounded-3xl bg-amber-50 p-6">
            <h3 className="flex items-center gap-2 text-xl font-black"><BookOpen size={22} /> Family Talk Prompts</h3>
            <ul className="mt-4 space-y-2 text-sm font-bold text-deep/65">
              <li>Ask a grandparent what food reminds them most of {island.name}.</li>
              <li>Listen to one {island.music} song together and clap the beat.</li>
              <li>Draw a memory map with one place your family loves.</li>
            </ul>
          </div>
        </div>
      </article>
    </div>
  );
}

function buildStory(childName: string, island: { name: string; food: string; music: string; wisdom: string }) {
  return [
    `One sunny morning, ${childName} found a tiny golden shell under the family table. It hummed softly, like ${island.music} floating across the breeze.`,
    `"This is not an ordinary shell," said Tanty Spice. "It is a Memory Map from ${island.name}. It wakes up when a child is ready to learn where their courage comes from."`,
    `${childName} touched the shell, and the room filled with the smell of ${island.food}, sea air, and warm sunshine. A path of glowing footprints appeared, leading toward a bright island village.`,
    `At the village square, R.O.T.I. rolled forward with a proud beep. "Mission one," R.O.T.I. said. "Find three family treasures: a story, a song, and a brave choice."`,
    `First, ${childName} listened to an elder tell how families carry love across oceans. Next, Dilly Doubles drummed a rhythm so joyful that even the palm leaves danced. Finally, ${childName} helped a nervous friend cross a stepping-stone bridge.`,
    `When the bridge was crossed, the golden shell glowed brighter. Tanty Spice smiled and said, "Remember this: ${island.wisdom}. Your family history is not only behind you. It is power you carry forward."`,
    `${childName} returned home with the Memory Map tucked safely in their heart. From that day on, every story, every recipe, every song, and every island word became a new clue in the adventure of becoming a Likkle Legend.`,
  ];
}
