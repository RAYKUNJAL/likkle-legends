'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';

export default function DoublesDashPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    let cleanup = () => {};
    let canceled = false;

    const bootGame = async () => {
      const mod = await import('@/game');
      if (canceled) {
        return;
      }

      const game = mod.initDoublesDashGame('doubles-dash-game', {
        userId: user?.id,
        userName: user?.email?.split('@')[0] || 'Guest Legend',
      });

      cleanup = () => {
        mod.destroyDoublesDashGame();
        const container = document.getElementById('doubles-dash-game');
        container?.replaceChildren();
        game?.events?.emit?.('shutdown');
      };
    };

    bootGame();

    return () => {
      canceled = true;
      cleanup();
    };
  }, [user]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fffbf2 0%, #fff5e1 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style jsx>{`
        .game-header {
          background: linear-gradient(135deg, rgba(255, 179, 0, 0.95), rgba(245, 124, 0, 0.95));
          padding: 1.5rem 2rem;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          position: relative;
          z-index: 10;
        }
        .header-badge {
          display: inline-block;
          background: rgba(0, 0, 0, 0.1);
          padding: 0.4rem 1rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: white;
          margin-bottom: 0.5rem;
        }
        .header-title {
          font-size: 2.5rem;
          font-weight: 900;
          color: white;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
          margin: 0;
        }
        .back-link {
          display: inline-block;
          margin-top: 0.5rem;
          color: white;
          font-size: 0.85rem;
          text-decoration: none;
          transition: opacity 0.2s;
          font-weight: 600;
        }
        .back-link:hover {
          opacity: 0.8;
        }
      `}</style>

      <div className="game-header">
        <div className="header-badge">🍛 Trinidad Street Food Sim</div>
        <h1 className="header-title">Doubles Dash</h1>
        <Link href="/games" className="back-link">← Back to Games</Link>
      </div>

      <div
        className="flex-1 flex flex-col items-center px-4 py-10"
      >
        <div className="max-w-4xl w-full text-center space-y-4">
          <p className="text-xl text-[#795548] max-w-2xl mx-auto leading-relaxed">
            The lunchtime rush is here! Fry the bara, scoop the channa, and add the perfect amount of pepper to keep your customers happy.
          </p>
        </div>

        <div className="relative mt-12 group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ffb300] to-[#f57c00] rounded-24px blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div
              id="doubles-dash-game"
              className="relative w-[800px] max-w-full aspect-[4/3] rounded-2xl border-8 border-white shadow-2xl overflow-hidden bg-[#fdf5e6]"
          />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-8 text-[#8d6e63] text-sm font-medium">
           <span className="flex items-center gap-2">🍳 Fry Bara First</span>
           <span className="flex items-center gap-2">🥘 Add Channa</span>
           <span className="flex items-center gap-2">🌶️ Select Pepper</span>
           <span className="flex items-center gap-2">✅ Serve and Score</span>
        </div>
      </div>
    </div>
  );
}