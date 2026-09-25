'use client';

import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { KIDS_CONTENT_SHELVES, shelfNeedsStories } from '@/lib/kids-shelves';
import { ALL_WORKING_GAMES } from '@/lib/working-games';

const GAME_EMOJI: Record<string, string> = {
  'reef-rescue': '🪸',
  'block-carnival': '🎉',
  'island-quiz': '🏝️',
  'island-memory': '🧠',
  'patois-wizard': '🔤',
  'island-trivia': '🎯',
  'color-match': '🎨',
  'flag-match': '🌍',
  'counting-market': '🏪',
  'math-adventure': '➕',
  'speed-shapes': '🟢',
  'word-builder': '🔤',
  'recipe-scramble': '🥘',
  'ingredient-sort': '🥬',
  'rhythm-matcher': '🥁',
  'island-passport-explorer': '🛂',
  'island-hop': '🏝️',
  'tantys-kitchen': '🍲',
  'math-market': '🧮',
  'spelling-blaze': '🔥',
};

type KidsDiscoveryProps = {
  gamesLocked: boolean;
  storiesLocked: boolean;
  navigationBlocked: boolean;
  onBlocked: (message: string) => void;
};

const SCREEN_TIME_COPY = "Today's screen time is used up! A parent can add more minutes in Parent Controls.";
const PARENT_LOCK_COPY = 'This channel is currently locked by parent controls.';

export function KidsDiscovery({
  gamesLocked,
  storiesLocked,
  navigationBlocked,
  onBlocked,
}: KidsDiscoveryProps) {
  const games = ALL_WORKING_GAMES;

  return (
    <section aria-label="Games and library" className="space-y-5">
      <div>
        <h2 className="text-3xl md:text-4xl font-black text-[#083344] tracking-tight">
          Find games & shelves
        </h2>
        <p className="mt-1 text-base font-medium text-slate-500">
          Every game that plays, plus the library shelves, in one place.
        </p>
      </div>

      <nav aria-label="Content library shelves" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KIDS_CONTENT_SHELVES.map((shelf) => {
          const locked = navigationBlocked || (storiesLocked && shelfNeedsStories(shelf.id));
          const message = navigationBlocked ? SCREEN_TIME_COPY : PARENT_LOCK_COPY;
          const className = 'flex items-center gap-3 rounded-2xl border-4 border-white bg-white px-4 py-4 text-left font-black text-slate-800 shadow-md shadow-sky-100 hover:-translate-y-0.5 hover:shadow-lg transition-all';
          const body = (
            <>
              <span className="text-2xl" aria-hidden>{shelf.emoji}</span>
              <span className="text-sm sm:text-base leading-tight">{shelf.label}</span>
            </>
          );
          if (locked) {
            return (
              <button
                key={shelf.id}
                type="button"
                onClick={() => onBlocked(message)}
                className={className}
              >
                {body}
              </button>
            );
          }
          return (
            <Link key={shelf.id} href={shelf.href} className={className}>
              {body}
            </Link>
          );
        })}
      </nav>

      <div>
        <h3 className="mb-3 text-xl font-black text-slate-800">
          All games <span className="text-slate-400">({games.length})</span>
        </h3>
        {gamesLocked || navigationBlocked ? (
          <EmptyState
            icon="🎮"
            title="Games are locked"
            message={navigationBlocked ? SCREEN_TIME_COPY : PARENT_LOCK_COPY}
          />
        ) : games.length === 0 ? (
          <EmptyState
            icon="🎮"
            title="No games yet"
            message="The game shelf is empty right now. Check back soon."
          />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {games.map((game) => (
              <li key={game.id}>
                <Link
                  href={game.href}
                  prefetch={false}
                  className="flex items-center gap-3 rounded-2xl border-4 border-white bg-white px-4 py-3 font-black text-slate-800 shadow-md shadow-sky-100 hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  <span className="text-2xl" aria-hidden>{GAME_EMOJI[game.id] || '🎮'}</span>
                  <span className="min-w-0">
                    <span className="block text-sm sm:text-base leading-tight">{game.title}</span>
                    <span className="block text-[11px] font-bold uppercase tracking-wide text-sky-500">Play</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function KidsShelfNav() {
  return (
    <nav aria-label="Content library shelves" className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {KIDS_CONTENT_SHELVES.map((shelf) => (
        <Link
          key={shelf.id}
          href={shelf.href}
          className="flex items-center gap-2 rounded-2xl border-4 border-white bg-white/90 px-3 py-3 font-black text-slate-800 shadow-sm hover:-translate-y-0.5 transition-all"
        >
          <span className="text-xl" aria-hidden>{shelf.emoji}</span>
          <span className="text-sm leading-tight">{shelf.label}</span>
        </Link>
      ))}
    </nav>
  );
}
