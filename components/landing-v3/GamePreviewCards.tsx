'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Star, Lock, Play, Sparkles } from 'lucide-react';

const PREVIEW_GAMES = [
  {
    id: 'island-hop',
    title: 'Island Hop Adventure',
    description: 'Explore Caribbean islands and learn cultural facts',
    image: '/games/island-hop-placeholder.svg',
    ageBracket: '6-8 yrs',
    time: '8 min',
    focus: 'Geography & Culture',
    tier: 'free',
  },
  {
    id: 'spelling-blaze',
    title: 'Spelling Blaze',
    description: 'Race to spell Patois and English words',
    image: '/games/spelling-blaze-placeholder.svg',
    ageBracket: '6-8 yrs',
    time: '7 min',
    focus: 'Spelling & Language',
    tier: 'free',
  },
  {
    id: 'tantys-kitchen',
    title: "Tanty's Kitchen",
    description: 'Help prepare Caribbean dishes and learn cooking',
    image: '/games/tantys-kitchen-placeholder.svg',
    ageBracket: '3-5 yrs',
    time: '6 min',
    focus: 'Food Culture & Measurements',
    tier: 'premium',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
  hover: { y: -8, transition: { duration: 0.3 } },
};

export function GamePreviewCards() {
  return (
    <section className="relative py-20 bg-gradient-to-b from-white to-slate-50 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--caribbean-sun)]/10 text-[var(--caribbean-mango)] rounded-full font-bold text-sm mb-6 border border-[var(--caribbean-sun)]/20">
            <Sparkles className="w-4 h-4" />
            <span>See What's Inside</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Educational Games for Every Age
          </h2>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Island-specific learning disguised as pure fun. Play one level free on the landing page, then unlock all games with a subscription.
          </p>
        </motion.div>

        {/* Game Cards Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {PREVIEW_GAMES.map((game) => (
            <motion.div
              key={game.id}
              variants={cardVariants}
              whileHover="hover"
            >
              <Card className="h-full p-0 border-2 border-slate-200 hover:border-[var(--caribbean-ocean)] hover:shadow-xl transition-all bg-white group overflow-hidden">
                {/* Image */}
                <div className="relative w-full h-48 bg-slate-100">
                  <Image
                    src={game.image}
                    alt={game.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    {game.title}
                  </h3>

                  <p className="text-slate-600 text-sm mb-4 flex-1">
                    {game.description}
                  </p>

                  {/* Meta Info */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="inline-block px-3 py-1 bg-[var(--caribbean-ocean)]/10 text-[var(--caribbean-ocean)] rounded-full font-bold text-xs">
                        Ages {game.ageBracket}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {game.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[var(--caribbean-sun)]" />
                        {game.focus}
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={`/games/${game.id}`} className="block">
                    <Button className="w-full rounded-xl bg-[var(--caribbean-ocean)] hover:bg-[var(--caribbean-ocean)]/90 text-white font-bold flex items-center justify-center gap-2">
                      <Play className="w-4 h-4" />
                      Try Free Sample
                    </Button>
                  </Link>

                  {game.tier === 'premium' && (
                    <div className="mt-3 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" />
                      Paid plans include full access
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="bg-gradient-to-r from-[var(--caribbean-ocean)] to-[var(--caribbean-ocean)]/80 rounded-3xl p-8 md:p-12 text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-3xl font-black mb-4">
            Over 20 Games Built for Island Kids
          </h3>

          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            All games come with full portal access, monthly mail kits, and personalized curriculum based on your child's heritage island.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="rounded-2xl h-14 px-8 bg-white text-[var(--caribbean-ocean)] hover:bg-white/90 font-bold text-lg shadow-lg"
              onClick={() => window.location.href = '#pricing'}
            >
              See Subscription Plans
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl h-14 px-8 border-white text-white hover:bg-white/10 font-bold text-lg"
              onClick={() => window.location.href = '#faq'}
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
