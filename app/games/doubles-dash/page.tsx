'use client';

import { useEffect, useState } from 'react';
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
    <div
      className="min-h-screen flex flex-col items-center bg-[#fffbf2] px-4 py-10"
    >
      <div className="max-w-4xl w-full text-center space-y-4">
        <div className="inline-block bg-[#ffb300] px-4 py-1 rounded-full mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-white">
                Trinidad Street Food Sim
            </span>
        </div>
        <h1 className="text-5xl font-black text-[#5d4037] drop-shadow-sm">
          Doubles Dash
        </h1>
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
      
      <div className="mt-8 flex gap-8 text-[#8d6e63] text-sm font-medium">
         <span className="flex items-center gap-2">🍳 Fry Bara First</span>
         <span className="flex items-center gap-2">🥘 Add Channa</span>
         <span className="flex items-center gap-2">🌶️ Select Pepper</span>
         <span className="flex items-center gap-2">✅ Serve and Score</span>
      </div>
    </div>
  );
}
