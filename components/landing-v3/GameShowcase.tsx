'use client';

import Link from 'next/link';
import { HTML_GAME_ROUTES } from '@/lib/html-games';

interface GameCard {
  id: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  href: string;
  category: string;
}

const SHOWCASE_GAMES: GameCard[] = [
  {
    id: 'island-hop',
    title: "Mango's Island Hop",
    description: 'Hop across the Caribbean islands answering trivia about flags, capitals, and fun facts with Mango Moko.',
    emoji: '🏝️',
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
    href: HTML_GAME_ROUTES['island-hop'],
    category: 'Geography',
  },
  {
    id: 'tantys-kitchen',
    title: "Tanty's Kitchen",
    description: 'Drag the right ingredients into the pot and cook real Caribbean dishes with Tanty Spice.',
    emoji: '🍲',
    gradient: 'from-orange-400 via-yellow-500 to-amber-600',
    href: HTML_GAME_ROUTES['tantys-kitchen'],
    category: 'Culture',
  },
  {
    id: 'math-market',
    title: "R.O.T.I.'s Math Market",
    description: 'Count fruit, add prices, and make change at a Caribbean market stall with R.O.T.I.',
    emoji: '🧮',
    gradient: 'from-teal-400 via-cyan-500 to-blue-600',
    href: HTML_GAME_ROUTES['math-market'],
    category: 'Math',
  },
  {
    id: 'spelling-blaze',
    title: "Scorcha's Spelling Blaze",
    description: 'Spell Caribbean words before the fire timer burns out. Race Scorcha Pepper for blazing badges.',
    emoji: '🔥',
    gradient: 'from-pink-400 via-red-500 to-orange-600',
    href: HTML_GAME_ROUTES['spelling-blaze'],
    category: 'Spelling',
  },
];

export function GameShowcase() {
  return (
    <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
            Interactive Learning
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Learning Games That <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Feel Like Play</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Only games you can play today. Every card opens a working island game — no coming-soon stubs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {SHOWCASE_GAMES.map((game) => (
            <Link
              key={game.id}
              href={game.href}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative p-8 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{game.emoji}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${game.gradient} text-white`}>
                    {game.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{game.title}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{game.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-semibold text-emerald-700">Playable now</span>
                  <div className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                    Play Now →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/games"
            className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Explore All Games →
          </Link>
        </div>
      </div>
    </section>
  );
}
