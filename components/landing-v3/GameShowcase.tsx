'use client';

import Link from 'next/link';

interface GameCard {
  id: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
  xp: number;
  category: string;
}

const SHOWCASE_GAMES: GameCard[] = [
  {
    id: 'math-adventure',
    title: 'R.O.T.I.\'s Math Adventure',
    description: 'Join R.O.T.I. on a mathematical journey across the Caribbean! Solve addition, subtraction, multiplication, and division problems.',
    emoji: '🤖',
    gradient: 'from-teal-400 via-cyan-500 to-blue-600',
    xp: 200,
    category: 'Math',
  },
  {
    id: 'rhythm-matcher',
    title: 'Rhythm Matcher',
    description: 'Listen to Caribbean rhythm patterns and tap them out! Master steel pan and drum beats from soca to dancehall.',
    emoji: '🥁',
    gradient: 'from-pink-400 via-purple-500 to-indigo-600',
    xp: 150,
    category: 'Music & Rhythm',
  },
  {
    id: 'recipe-scramble',
    title: 'Recipe Scramble',
    description: 'Unscramble ingredients to cook authentic Caribbean recipes! Learn about Jerk Chicken, Ackee & Saltfish, and more.',
    emoji: '🍳',
    gradient: 'from-orange-400 via-yellow-500 to-amber-600',
    xp: 180,
    category: 'Culture & Language',
  },
  {
    id: 'island-passport-explorer',
    title: 'Island Passport Explorer',
    description: 'Answer geography trivia to collect passport stamps! Explore 8+ Caribbean islands and learn fascinating facts.',
    emoji: '🗺️',
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
    xp: 220,
    category: 'Geography',
  },
];

export function GameShowcase() {
  return (
    <section className="py-20 px-4 md:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
            🎮 Interactive Learning
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Learning Games That <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Feel Like Play</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From math adventures to Caribbean rhythms, our games combine education with cultural immersion. Every game teaches, every moment matters.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {SHOWCASE_GAMES.map((game) => (
            <Link
              key={game.id}
              href={`/portal/games/${game.id}`}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative p-8 flex flex-col h-full">
                {/* Emoji & Category */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{game.emoji}</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${game.gradient} text-white`}>
                    {game.category}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-colors">
                  {game.title}
                </h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  {game.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm font-semibold text-yellow-600">
                    <span>⭐</span>
                    <span>+{game.xp} XP</span>
                  </div>
                  <div className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                    Play Now →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/portal/games"
            className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Explore All Games →
          </Link>
        </div>
      </div>
    </section>
  );
}